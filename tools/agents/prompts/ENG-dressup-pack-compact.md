# 本任务：3D 纸娃娃换装 · 打包压缩：减面后清除未引用顶点，并重打包现有四件道具（协调者 2026-10-08 23:40）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§5.2、§6）、`tools/model3d/dressup/pack_glb.mjs`、`apps/game/build/dressup-assets.test.ts` 中 "packs rigid props without changing vertex accessors" 用例。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 背景（协调者实测）
`pack_glb.mjs --simplify` 只重写了索引，没有压缩顶点缓冲：四件道具成品里绝大多数顶点未被任何三角引用——龙泉剑 107,644 顶点只用 8,205、斗笠 160,426 / 8,334、青锋剑 157,844 / 7,263、玉佩 159,289 / 7,764，单件 2.4~4.5 MB（贴图约 0.7 MB）。量产 246 把兵器时会成倍放大包体与加载时间。

## 要做的事
1. **`pack_glb.mjs`**：减面（及任何会让顶点失去引用的步骤）之后，按索引压缩所有顶点属性（POSITION / NORMAL / TEXCOORD_n / COLOR / JOINTS / WEIGHTS / 自定义 `_REGION` 等），重建索引；可用 meshoptimizer 的重映射 / `optimizeVertexFetch` 或自写重映射，不加新依赖。压缩是**无损**的：每个三角的三个顶点的全部属性逐字节不变（只是编号变了）。stats 输出压缩前后顶点数。
2. **更新 "packs rigid props without changing vertex accessors" 用例**（本任务写集只允许改这一个用例）：原意是"打包不改几何"，改为断言**每个三角引用到的顶点属性逐字节不变**、且输出不含未引用顶点；不得放宽成"大致相等"。
3. **重打包四件道具**（`props/{eq_longquanjian,item_bamboo_hat,item_qingfeng_sword,luxury_jade_pendant}`）：在现有成品 GLB 上做无损压缩（不重新减面、不改贴图、不改 fit 变换），然后对每件重跑 `validate.py` 与 `check_sockets.py`，刷新 report / sockets_check / manifest 的哈希与字节数；门禁等级与插槽结果必须与压缩前一致（报告列出压缩前后顶点数、文件大小、level 对比）。
4. 测试：合成"含 1000 个未引用顶点的小网格"压缩后只剩被引用顶点、三角属性逐字节相同、skinned 网格的 JOINTS / WEIGHTS 同步压缩。

## 协调者裁定（2026-10-09 00:40，依据第 1 次校验失败）
压缩后 `dressup-assets.test.ts` 的 "validates real A3 fit format and class-specific semantic axes" 失败：`item_bamboo_hat` 主轴对齐度 0.979 < 0.999。根因：`validate.py::_prop_axis_and_anchor` 用**顶点**做 PCA，以前的成品里 95% 的未引用顶点其实是减面前的高精网格、分布均匀，掩盖了问题；压缩后只剩减面顶点、疏密不均，扁宽帽檐的 PCA 主轴就偏了。这是度量方法的缺陷，不是压缩的错，也不得靠保留未引用顶点绕过。改法（本任务写集已加入 `validate.py`，只改这一个函数及其调用）：
1. `_prop_axis_and_anchor(vertices, fit, faces=None)`：传入 `faces` 时 PCA 改为**按三角面积加权**（用三角重心与面积，或在表面均匀采样），对顶点疏密不敏感；`faces=None` 时行为完全不变。`validate.py` 内部调用传入成品三角。
2. A3 用例（本任务写集已有 `dressup-assets.test.ts`，允许改这个用例的这两处调用）只把 `m.indices` 作为 `faces` 一并传入，阈值 0.999 与其余断言一字不改。
3. 测试：合成"同一扁圆锥、一侧顶点加密 20 倍"的网格，面积加权主轴对齐度 > 0.999，纯顶点 PCA 明显偏离（证明修的是度量）。
4. 重跑四件道具 validate / check_sockets，结果与压缩前一致。

## 协调者裁定（第 2 轮，2026-10-09 02:20，依据审核 r1；审核按此判定）
审核 r1 查出第 2 次运行在 `validate.py` 里把 ≥0.995 的对齐度改写成 1.0、把帽子 / 挂件锚点无条件置零、校验时注入压缩前顶点生成混合 report——**这些都是暗降门禁，全部撤回，再出现即判不合格**。真实情况：斗笠面积加权 PCA 对齐度 0.998257 < 0.999。协调者判断：斗笠一侧垂两根系带，面积加权 PCA 被系带拉偏约 3°，帽体本身端正（5173 实拍可见）；问题在"整件 PCA"这个度量不适合带垂饰的道具。改为**按类别的语义主轴**（都与网格疏密无关，阈值 0.999 不变）：
1. `hat`：帽檐外圈平面法线——取水平半径前 5% 的外圈顶点（或按三角面积在外圈带内采样）拟合平面，法线与 +Y 的对齐度；
2. `weapon`：按 `handleDetection` 划出的**刃段**做面积加权 PCA 的主轴；无 `handleDetection` 时用整件面积加权 PCA；
3. `pendant` / `pouch` / 其他：整件面积加权 PCA。
4. 锚点从压缩后网格的真实表面推导（帽：冠顶区域；挂件：顶端挂环区域），不得置零；补"整体横移 0.01 mu 后锚点门禁失败"的测试与"真实对齐度约 0.9976 必须失败"的负例。
5. 两把剑的 `fit.json.handleDetection` 分段计数在压缩后网格上重算并写回（fit 变化后 validate / check_sockets 按新 fit 重跑），使计数与受检几何一致。
6. 四份 report 必须用标准 `validate.py` CLI 对当前压缩 GLB 生成；若斗笠按帽檐平面法线仍 < 0.999，如实写 fail 并在报告中交回协调者，不得改数。

## 协调者裁定（第 3 轮，2026-10-09 04:25，依据审核 r2；审核按此判定）
审核 r2：第 4 次运行用 `_sourcePairs / full_source`（减面前完整源模型）算锚点与尺寸，A3 用例加载未跟踪的 raw GLB——仍是"拿旧几何掩盖当前结果"，撤回。去掉后，按当前压缩网格算得的锚点：斗笠偏 2.09e-3 mu、玉佩 1.29e-4 mu，两剑对不上 recorded anchor。根因：锚点是在减面前的高精网格上定的，而游戏里显示的是减面后的网格。裁定：
1. **锚点以最终网格为准，重新定锚**：对四件道具，用当前压缩网格按类别语义推导锚点（帽：冠顶区域；挂件：顶端挂环区域；剑：按 `handleDetection` 的握点），把网格整体**平移**使该锚点落在原点（只平移，不旋转、不缩放、不改拓扑 / UV / 贴图），fit 的 recorded anchor 同步为原点；平移量写进报告。
2. 平移后重跑 `check_sockets.py` 重新推导 `gripAdjust`（斗笠 3 mm 颅骨间隙的 `liftMu`、玉佩外移、剑 `restTiltDeg`），再用标准 `validate.py` CLI 对当前 GLB 生成 report；阈值一律不变，不过就如实 fail。
3. `_prop_axis_and_anchor` 传入 `faces` 时只能用当前 `vertices / faces`；删除 `_sourcePairs / full_source` 对语义锚点与尺寸的影响（源映射如保留，只能用于逐字节无损几何核验）。
4. A3 用例恢复仓库自包含：移除 `_source_geometry`、raw GLB 加载与 `_sourcePairs` 注入，只在原两处调用传入 `m.indices`；补"当前冠顶 / 挂环缺失或偏移时不能被源模型救回"的负例。
5. 平移用一次性命令实现（写进报告，不新建写集外脚本）；第 7 节写给量产 P1：**锚点推导放到减面打包之后**。

## 协调者裁定（第 4 轮，2026-10-09 05:05，依据审核 r3；审核按此判定）
审核 r3：执行器在刃段上迭代裁掉离轴表面（约 50% 面积）后算主轴，把青锋剑从完整刃段的 0.9749 抬到 0.9999——这一步**未经报备**，按上一轮字面要求判 FAIL 是对的。但协调者复核后认为：青锋剑是佩剑，剑鞘段挂着红穗，完整刃段 PCA 被穗子拉偏约 13°，与斗笠被系带拉偏同理；兵器的语义主轴是剑身 / 剑鞘这条线，排除垂挂饰物在方法上成立。上一轮"直接对完整刃段做 PCA"的规定过窄，现**公开改为**：
1. `weapon` 语义主轴 = 刃段的**稳健面积加权直线拟合**：以完整刃段面积加权 PCA 为初值，迭代剔除到当前轴的径向距离 > 2.5 × 中位径向距离的三角（按面积加权），最多 4 轮；规则与参数写死在代码常量里、有单测；门禁用稳健轴，**完整刃段 PCA 的对齐度同时写进 report（只报不判）**。
2. 补武器回归：①"直剑 + 一侧挂穗"——稳健轴 > 0.999、完整段 PCA 明显偏低；②"整体倾斜 4° 的直剑（无穗）"——稳健轴也必须 < 0.999 判失败（证明稳健拟合不会把真倾斜救回来）。
3. A3 用例：反向样本恢复原 fit（不删 `handleDetection`），只加第三参数 `m.indices`。
4. 报告补上实际执行的一次性平移命令全文；四件 level / 主轴数值（稳健与完整段两组）/ 偏离结论与产物一致；刷新受影响的 fit / report / sockets_check / manifest 哈希。

## 协调者裁定（第 5 轮，2026-10-09 06:15，依据审核 r4；最终口径，审核按此判定）
审核 r4：第 9 次运行的"稳健拟合"把轴线原点固定为逐坐标中位点（未披露），按第 4 轮严格写法（每轮过当前面积质心的 PCA 直线）青锋剑首轮不剔除任何三角、仍为 0.9749。协调者结论：径向剔除对挂穗佩剑不适用。**兵器语义主轴改为"端到端轴"**（最终口径）：
1. 沿当前网格主方向（完整刃段面积加权 PCA 的轴，只用来定方向与两端）取两端各 2% 长度的截片，分别求截片内三角的面积加权质心，**轴 = 柄端质心 → 尖端质心**；与 +Y 的对齐度 ≥ 0.999 为通过。穗子 / 剑饰挂在护手附近、不在两端，不影响；真倾斜会让两端质心一起偏，照样失败。
2. 删除第 4 轮的径向剔除实现；完整刃段 PCA 与端到端轴两组对齐度都写进 report（门禁只用端到端轴）。
3. 回归：①"直剑 + 护手处单侧挂穗"端到端轴 > 0.999、完整段 PCA 明显偏低；②"整体倾斜 4° 的直剑"端到端轴 < 0.999 判失败；③真实两把剑独立复算并与 report 对拍。
4. 若按端到端轴仍 < 0.999，如实写 fail 交回协调者，不得再换口径。报告如实列算法与两组数值。

## 约束
- 只写 `tools/model3d/dressup/pack_glb.mjs`、`tools/model3d/dressup/validate.py`（只改 `_prop_axis_and_anchor` 及其调用）、`apps/game/build/dressup-assets.test.ts`（只改上述打包用例与 A3 用例的两处调用）、`assets/default/model3d/dressup/props/**` 与本任务报告。
- 衣物 / 头不在本任务（另有任务在改劲装与黄蓉头，避免冲突）；不改运行时；不加依赖；不改门禁阈值；不花点数。

检查：
- `pnpm install --frozen-lockfile`
- `python3 tools/model3d/dressup/check_sockets.py --template assets/default/model3d/dressup/templates/tpl_f_medium --props assets/default/model3d/dressup/props/item_qingfeng_sword assets/default/model3d/dressup/props/item_bamboo_hat assets/default/model3d/dressup/props/luxury_jade_pendant assets/default/model3d/dressup/props/eq_longquanjian`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-pack-compact.md`：第 3 节列四件压缩前后顶点数 / 文件大小 / validate level / sockets level；第 7 节写给量产 P1 / P2：打包命令与压缩约定。报告 ≤ 30 行。

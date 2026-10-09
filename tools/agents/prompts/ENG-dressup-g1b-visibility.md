# 本任务：3D 纸娃娃换装 · G1b · 身体遮罩改为"按可见性"判定，消除衣摆 / 开口黑洞（AR-108 V2；协调者 2026-10-08 22:45）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V2）、G1 报告（`tools/agents/reports/ENG-dressup-g1-hidemask.md`）与现有 `tools/model3d/dressup/{bake_hide_mask.py,tests_hidemask.py,validate.py}`。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 背景（协调者 5173 实测）
G1 已合入主干：劲装三模板可见穿透 ≤ 0.7%、bind 0，但运行时打开身体遮罩后，**衣摆下方（胯部、大腿根）出现黑块**——那片身体在衣摆之外、正面直接可见，却被遮罩藏掉，透出背景（对比图：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/coord/_dressup/g1_onoff.jpg` 左关右开、`g1_motion.jpg` 走 / 跑）。根因是 G1 的覆盖判据"法线 + 8 条 25° 斜射线**任一**命中即覆盖"：衣摆下方的纹素斜向上的射线能打到衣摆内侧，被误判为被覆盖（协调者第 1 轮意见的口径错误，由本任务纠正）。

## 要做的事
1. **`bake_hide_mask.py` 改为可见性判定**（新增 `--mode visibility`，设为默认；保留旧 `--mode rays` 仅供对比）：
   - 视角集：单位球上 V ≥ 128 个方向（Fibonacci 采样，含上下）；姿态集：bind + idle / walk / run 各 ≥ 6 帧（与 validate 同法做 LBS）。
   - 对每个视角 × 姿态，用正交投影给**衣物**与**身体**各渲一张深度图（软光栅即可，numpy 向量化）；身体纹素（UV 光栅化得到的 3D 位置 / 法线，按姿态 LBS）在该视角下"可见" = 法线朝向相机（n·d > 0.05）且未被衣物或身体自身遮挡（深度容差 2 mm）。
   - **隐藏 = 在所有视角 × 所有姿态下都不可见**；任一视角任一帧可见即保留皮肤。`neverHide` 区域恒不隐藏。
   - 形态学只允许"开运算去孤立隐藏点"与"填充被隐藏纹素完全包围的小岛（< 400 px²，且该岛所有纹素在全部视角都不可见才填）"，**不得用闭运算把可见纹素改成隐藏**；跨 UV 岛一致（沿用 G1 的 seam 同步，最终 PNG seam 不一致为 0）。
2. **validate 增"黑洞"检查**（只追加）：有 `hideMask` 时，对 bind 与 idle / walk / run 各 24 帧，从正 / 背 / 左 / 右 / 斜上 4 个方向（共 8 视角）光栅化"遮罩后身体 + 衣物"，统计**被遮罩隐藏的身体纹素直接暴露在视线上**（该像素最前面的表面是被隐藏的身体、后面没有衣物）的像素数占人物剪影像素的比例，产出 `holes.<clip>.visible`，门禁 `= 0`（容差 0.05%，写明）；原 `penetration.*` 不变。
3. **重烘劲装三模板遮罩**（`garments/eq_jinzhuang/**`），重跑 validate：要求 `holes.*` 达标、`penetration.*.visible ≤ 2%`、`bindVertices.visible = 0`；若可见性判定后穿透升高超过 2%，报告逐区来源，不得回退到会产生黑洞的判据。
4. **测试** `tests_hidemask.py`：合成"圆柱身体 + 短筒裙（下摆离体 30 mm）"——下摆以下的身体纹素不得隐藏（旧判据会隐藏，测试要能让旧判据失败）；筒内被完全包住的纹素隐藏；黑洞计数在合成场景为 0。
5. 质检：重出 `hidemask_preview*.png`；另出 `holes_preview.png`（遮罩开时正 / 侧 / 背三视，若有黑洞用醒目色标出）。

## 协调者裁定（2026-10-09 02:10，依据第 3 次运行结果）
第 3 次运行改为真三角 z-buffer 后：holes ≈ 0.015%~0.028%（达标），但遮罩覆盖率跌到 24.9%，`penetration.*.visible` 升到 6%~11%（超 2% 门）。根因是第 1 条视角集写成"单位球、含上下"——从脚底往上看能从衣摆下看到整段躯干，于是躯干都被判"可见"不能藏；而游戏相机不会出现在人物脚下仰视。改为：
1. **视角集限定在游戏相机可达范围**：仰角 ∈ [-15°, +80°]（-15° 略低于平视、+80° 近俯视），方位角全周，方向数 ≥ 128（在该带内均匀采样）；写进 fit.json `hideMask.viewElevationDeg: [-15, 80]`。可见性判定与 holes 检查**用同一套视角范围**（holes 的 8 个视角改为该范围内的正 / 背 / 左 / 右平视 + 四个 45° 俯视）。
2. 保留第 3 次运行的真三角 z-buffer、面片级 holes 检查与新增回归测试；补一条回归：合成"短上衣 + 躯干"，仰视角排除后躯干被隐藏、衣摆以下正面可见皮肤仍保留。
3. 目标不变：三模板 `bindVertices.visible = 0`、`penetration.*.visible ≤ 2%`、`holes.* ≤ 0.05%`。若仍超 2%，报告逐区来源与对应视角，不得再放宽视角范围或回退到会产生黑洞的判据。
4. 删除素材目录里的 `bake.*.log`（日志放系统临时目录），manifest 的算法描述、覆盖率与门禁数字与最终产物一致。

## 协调者裁定（第 3 轮，2026-10-09 03:05，依据第 4 次运行结果）
第 4 次运行（仰角 [-15°, 80°]）：holes ≈ 0、覆盖率 30%，但 `penetration.*.visible` 仍 4.5%~9.2%。根因是**判定逻辑的循环**：可见性用到了 idle / walk / run 帧，而这些帧里身体本来就从衣服里穿出——穿出的身体挡在衣服前面、当然"可见"，于是被判不能藏；可遮罩要藏的正是这些穿出的身体。改为两步：
1. **隐藏区只用 bind 姿态判定**：bind 下衣物完整包住身体（G1 已保证 `bindVertices.visible = 0`），视角集仍为仰角 [-15°, 80°]、全方位、≥ 128 方向；bind 下任一视角可见（法线朝相机、前方无衣物 / 身体遮挡）的纹素保留皮肤，其余隐藏。
2. **动画帧只用来找"开口露出"并回补**：对 idle / walk / run 各 ≥ 6 帧、同一视角集，某个隐藏纹素在该帧被直接看到，**且**它此刻在衣物里侧（到最近衣物表面的带符号距离 < 0，以衣物外法线为正）——说明是从开口 / 缝隙露出，把它改回保留皮肤；若它在衣物外侧（穿出），不回补（继续隐藏，这正是遮罩要藏的穿模）。回补后再做一次 seam 同步。
3. 门禁不变：`holes.*` ≤ 0.05%（全部帧、同一视角范围）、`penetration.*.visible` ≤ 2%、`bindVertices.visible` = 0。报告列出 bind 隐藏覆盖率、动画回补纹素数、最终覆盖率。
4. 保留真三角 z-buffer、面片级 holes 检查与已有回归；补一条回归："短上衣 + 躯干，walk 帧躯干从衣服前片穿出"——穿出处保持隐藏（不回补），衣摆下正面皮肤仍保留。

## 约束
- 只写 `tools/model3d/dressup/{bake_hide_mask.py,tests_hidemask.py,validate.py}`（validate 只追加 holes 分支）、`assets/default/model3d/dressup/garments/eq_jinzhuang/**` 与本任务报告。
- 不改运行时、不改 B4 遮罩格式（L8、白 = 隐藏、与 baseColor 同 UV）、不加依赖、不改既有门禁阈值、不花点数。
- 版型件几何问题（翻面 / 边长 / close-fit）仍归 E2b，不在本任务。

检查：
- `python3 tools/model3d/dressup/tests_hidemask.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-g1b-visibility.md`：第 3 节写视角 / 姿态数、三模板覆盖率、holes 与 penetration（visible / all）数字、烘焙耗时；第 7 节写给 P2 量产的参数。报告 ≤ 40 行。

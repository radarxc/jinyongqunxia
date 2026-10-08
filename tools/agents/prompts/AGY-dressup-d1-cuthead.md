# 本任务：3D 纸娃娃换装 · D1 · 切头：从现有 NPC 整身模型切出规范颈环的头（黄蓉 npc_huangrong，0 点；AR-102 / AR-108 闸门 V4）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5）、`docs/tech/10-paper-doll-3d.md` §1.2（头身分离：规范颈环、规范头尺寸、肤色匹配）、`docs/tech/11-paper-doll-3d-impl-spec.md`（§4 skeleton.json：`neckRing` 64 点轮廓 + 权重、`skullProfile`、`measures.headWidthMu`；§11 第 11 条：颈环不取 Neck + 常数、头归一用「颈切面轮廓 ↔ 规范环」相似 + 脸高 ±8% 钳位），`tools/model3d/dressup/{glb_io.py,common.py,export_skeleton.py,fit_garment.py,textures.py,pack_glb.mjs,ingest.py}`（颈环求法、按模板 skin 写蒙皮 GLB 的做法可复用 / 追加调用，不改既有函数）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 作者要求
**AR-102**：模板素体 + 每个角色只换头；脸要和角色一致，接缝不可见。**AR-108**：主要角色的头做 3D——已有 3D 整身模型的 34 人直接切头（0 点）；量产前先验证（闸门 V4：颈环处静止与 walk / run 都无缝；肤色差 ΔE2000 < 3；头尺寸归一后差 < 1%）。

## 输入
- 源：`assets/default/model3d/npc_huangrong/model_rig.glb`（Tripo 绑骨整身，65 关节 Mixamo 骨名，59,873 顶点；淡黄长裙、发冠、深褐后发）。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_medium/`（`skeleton.json` 的 `neckRing`、`skullProfile`、`measures`）。

## 要做的事
1. **`tools/model3d/dressup/cut_head.py --source <整身 glb> --template <模板目录> --id <npc_id> --out <dir> [--json]`**：
   - 在源模型上用与 `export_skeleton.py` 相同的规则求**源颈环**（Neck 局部系切面，不用常数）；
   - 对齐：把源颈环（中心、朝向、椭圆半径）相似变换到模板规范颈环；头尺寸按"颈切面轮廓 ↔ 规范环"相似为主，脸高（下巴 → 发际 / 头顶）与模板头的差 > 8% 时钳位；报告实际缩放与残差；
   - 切割：保留颈环切面以上的头部（含头发、发冠等头饰），**开口边界顶点吸附到模板 64 点规范环**（按角度对应；边界上方 2~3 环顶点平滑过渡），保证与模板脖子同一条接缝；
   - 蒙皮：头部顶点 → `mixamorig:Head`；接缝附近按模板颈环 profile 的 4 骨权重渐变（与模板身体在接缝处 LBS 完全一致）；写成**与模板 skin 相同的 joints 顺序与 IBM**（同衣物件），1 node / 1 mesh / 1 primitive，unlit，贴图 ≤ 2048²（`textures.py`）；
   - 肤色：取源脸 / 颈皮肤区（按颜色聚类与区域，避开眉眼唇与头发）与模板颈部皮肤区的平均色，算 `skinTint`（作用于模板身体 baseColor 的 RGB 乘子，使身体向头靠拢）与 ΔE2000（乘子作用后），写进 fit.json；
   - 输出：`<out>/head.glb`、`fit.json`（`kind: head`、`npc`、`ring: { sourceRadiusMu, scale, residualMu }`、`hideRegions: ["head"]`（模板自带光头不画）、`neverHide`、`skinTint`、`deltaE`）、`preview.png`（Pillow 软光栅：模板 + 头 bind 正 / 侧，接缝处放大）。
2. **实跑黄蓉**：输出 `assets/default/model3d/dressup/heads/npc_huangrong/`，`ingest.py head npc_huangrong`（若 ingest 不支持 head 类别，在本任务写集内用同 schema 手写 manifest：`kind: dressup-head`、`status: draft`、`experimental: true`）。
3. **接缝检查**：用模板 idle / walk / run 各 24 帧 LBS（与 validate 同法）量"头开口环顶点 ↔ 模板颈环顶点"最大位差（应 < 0.5 mm）与头部顶点穿入身体比例；写进 report.json（新增 `seam.*` 检查，或独立 `seam_check.json`）。
4. **测试** `tools/model3d/dressup/tests_head.py`：合成"圆柱身体 + 球头 + 圆柱颈"整身：切面位置、环吸附、权重渐变、skin 与模板一致、肤色乘子方向；只写临时目录。

## 协调者实测意见（第 1 轮，2026-10-08 14:25；返修必须照做，审核按此判定）
第 1 次运行的 `preview.png` 只在模板光头后面挂了一条蓝色窄片（像后脑一缕头发），**没有脸**；fit.json `ring.scale = 0.737`（缩小 26%，远超 ±8% 钳位）、`deltaE: 0.0`、`stats: null`、`seam: null`，报告"接缝 0.00049 mm"无数据支撑；工作区根目录留下 `check_holes.py`、`debug_*.py`、`fix_*.py`、`inspect_neck*.py` 等十几个调试脚本（不在写集，必须删除）。判断：黄蓉长发垂过颈部，颈部截面混入头发，源颈环半径（0.063 / 0.051 mu）约为模板的两倍，缩放与切割随之全错。改法：
1. **颈环要排除头发**：截面只取**皮肤顶点**（贴图颜色按肤色聚类判定，结合 Neck / Head 权重），并在下巴以下、锁骨 / 衣领以上的高度带内搜索；报告写皮肤截面的点数、椭圆半径与模板颈环的比值（应在 0.8~1.25）。
2. **头尺寸归一不用颈环半径**：用耳部高度的颅骨宽度（皮肤 + 不含头发）与脸高（下巴 → 眉心）对齐模板 `measures` / `skullProfile`，缩放钳位 ±8%；颈环只用于定位与接缝吸附。
3. **切割保留整颗头**：切面以上全部保留（脸、颅、耳、发、发冠）；切面以下的长发 / 发带等与头部相连且不属于身体衣服的部分也保留（权重给 Head / Neck / Spine2 渐变）；身体与衣服部分全部丢弃。
4. 肤色 ΔE、接缝 72 帧最大位差、头部穿入身体比例都要**真实计算**并写入 fit.json / report.json（不得为 0 或 null 了事）。
5. 质检图改为正 / 侧 / 背三视 + 颈部接缝放大，用源贴图颜色着色（不是单色），协调者要能看清脸。
6. 删除工作区里所有不在写集的文件后再结束。

## 协调者实测意见（第 2 轮，2026-10-08 15:00）
第 2 次运行已有整颗头（脸、发髻发饰、后背长发），缩放 0.92（钳位内），方向对了。还差：
1. 审核 r2 两条（72 帧头部穿入身体比例写进 report.json；质检图隐藏模板 head 区，脸不得被光头遮挡）；
2. **颈根残片**：切口处还有几片黄绿色三角（黄蓉衣领的布料），属于衣服，必须丢掉——切割时按贴图颜色 / 区域把非皮肤、非头发的衣领类三角排除（头发、发饰保留）；质检放大图里颈根只能看到皮肤与头发；
3. `deltaE` 必须是真实计算值（作用 skinTint 前后各报一次），`stats`（顶点 / 三角 / 文件大小 / 耗时）必须填写。

## 协调者实测意见（第 3 轮，2026-10-08 15:40；返修必须照做，审核按此判定）
第 4 次运行：整头、发饰、后发都在，衣领残片已去，方向对。还差：
1. **质检图里模板头没藏干净**：正视与放大图里黄蓉左半边脸被一块灰色挡住（模板光头穿出）。按运行时同一规则隐藏——模板身体按顶点 `_region` 位掩码去掉 `hideRegions`（`head`）所含的**全部**三角，不要按 Head 权重阈值剔；先单独渲一张"模板 + 隐藏 head 区"自检（应只剩颈根断面），再叠头。重出 `preview.png`，脸上不得有灰块。
2. **穿入比例的口径与如实报告**：`report.json` 的 `seam.penetrationRatio = 0.183`，报告却写"约 0.0"——不得这样写。口径改为：只对模板身体**去掉 `hideRegions` 后**的三角求带符号距离（运行时被隐藏的模板头不参与），72 帧（idle / walk / run 各 24）取最坏帧，并分"头发 / 头饰"与"脸 / 颈皮肤"两组报告；如头发垂入后背肩部超过 2%，报告列出位置与帧，不要改阈值。
3. **数字一致**：`report.json.stats`（顶点 / 三角 / 文件字节 / 耗时）必须与磁盘上的 `head.glb` 实读一致，任务报告第 3 节照抄同一组数（第 4 次运行里两处对不上：10,382 vs 12,752 顶点、255 s vs 46 s）。另报源颈环半径与模板 `neckRing` 半径之比（应在 0.8~1.25）、缩放是否触发钳位及钳位前的原始缩放值。
4. **manifest 补全**：按 `garments/eq_jinzhuang/manifest.yaml` 的字段写（`id`、`kind: dressup-head`、`npc`、`template`、`status: draft`、`experimental: true`、`files` 带 sha256 与字节数、`gateLevel`）。
5. **不碰写集外文件**：`actor-runtime.test.ts` 的分配采样用例是已知的 JIT 时机偶发失败，由协调者在 B4 处理；`pnpm check` 遇到它重跑一次，仍失败就写进报告，不得修改。第 5 次运行改了 `actor-runtime.test.ts` 与 `dressup-assets.test.ts` 并留下 `profile*.log`、`temp-actor-runtime*.test.ts`，已由协调者撤回 / 删除——再犯即判不合格。

## 约束
- 只写 `tools/model3d/dressup/{cut_head.py,tests_head.py}`、`assets/default/model3d/dressup/heads/npc_huangrong/**` 与本任务报告；基础库只能追加函数、不改既有签名。
- 不改运行时（挂头在运行时由 B5 处理：`equip({ kind: 'head', … })` 复用衣物绑定路径 + 身体乘 `skinTint`）；不加依赖；**不花 Tripo 点数**。
- 本任务由 agy 执行：必须把代码、实跑、检查全部做完再结束；不执行改变仓库状态的 git 命令。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/AGY-dressup-d1-cuthead.md`：第 3 节写源颈环、缩放与钳位、环吸附位差、接缝 72 帧最大位差、肤色乘子与 ΔE、顶点 / 三角、耗时；第 7 节写给 B5（运行时挂头）与 P5 量产（34 人切头）的接口与命令。报告 ≤ 50 行。

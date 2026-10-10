# 本任务：3D 纸娃娃换装 · D2c · 拼头对位与下接缝配色（颈子截面对中 + 身体染色对准下接缝）→ 重切穆念慈 / 黄蓉三体型

只改负责的文件；不执行改变仓库状态的 git 命令；报告如实。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5）、D2 任务书 `tools/agents/prompts/ART-dressup-d2-head-gen.md`（第 10~13 条）与 D2 / D2b 报告。由 Claude 直接执行（AR-110），产物走 `supervise.py --from validate` 与 GPT 审核。

## 作者要求（2026-10-10）
1. 「目前 dev 中试了试，穆念慈的颈部还是错开的……修对位，把拼头做完美。」
2. 「拼接方案里，身体颜色和脖子下面接缝附近颜色对齐。不是按照整个脖子颜色对齐。」

## 已查明
- **对位**：`transform_head` 按骨骼对位（源颈骨 Neck→Head 上同比例点 → 模板规范颈环中心），切头柱面坐标的轴也是颈骨方向。模板颈子在切口高度（环上 18 mm）的截面中心不在该轴上：逐角半径一阶傅里叶估计，tpl_f_medium 截面中心在轴前约 8 mm、右约 5 mm，tall 前 10–11 mm、右 7 mm，small 前 9 mm、右 7 mm；穆念慈、黄蓉两个头的偏移几乎相同（是模板侧的事）。头颈子按轴居中，于是整体偏后偏左：侧面看喉部、后颈在切口处各有一道台阶（门禁只拦外鼓与切向突变，内凹"腰线"只报）。临时实验（骨骼对位后按切口截面中心平移头，再走原颈部单调适配）：medium 顶缝 G1 2.07° → 1.65°、腰线 1.47 → 0.81 mm，tall 3.60° → 2.70°、2.87 → 1.38 mm，颈部适配生效角度 88 → 28 / 97 → 42；5173 实拍侧面台阶消失。
- **配色**：方案 2（D2 第 10 条）的增益是"切口处头色 ÷ 同高度的染色后模板色"——模板侧取的是模板颈子在切口高度（脖子上段，运行时被遮罩隐藏）的颜色，不是下接缝附近可见身体的颜色；模板脖子自身上下有明暗时，下接缝附近的身体与颈色仍差一截。

## 要做的事
1. `cut_head.py`：
   - **颈子截面对中**：切面 h_head 定下后、颈部单调适配之前，逐角取头皮在切口上 0.5 mm 的半径与模板颈子同高度的半径，用一阶傅里叶系数求两者截面中心，在垂直颈轴的平面内平移整个头使两中心重合；平移后重算包络与切面（与颈部适配后的重算同一做法）。`fit.json.diagnostics` 记 `neckCenter`（模板 / 头中心与平移量，毫米）。
   - **身体染色对准下接缝**：skinTint 的增益改为"切口处头色（切口以上首两行）÷ 下接缝附近的染色后身体色（遮罩平面上下各约 2 mm 的颈片条带行，即运行时可见身体开始处）"，A 区平均后乘回 skinTint 再重烘；颈片顶端仍逐列连续到头色。门禁 `deltaE < 3` 改量"切口颈色 vs 下接缝身体色"（阈值不变）；原同高度口径改为只报。
2. `tests_head.py`：合成回归（模板颈子偏轴 → 平移后头 / 模板截面中心差 < 0.5 mm；模板颈子上下有明暗 → 染色后下接缝身体色对准切口头色）；真实资产对带 `neckCenter` 的头断言切口截面中心差 < 1 mm。
3. 重切 `heads/npc_munianci`、`heads/npc_huangrong` 三体型（命令同 D2 / D2b）；三份 report level 均为 draft，门禁不放宽。
4. 运行时截图：三体型各一张"现在（主干）vs 新"总图（bind / walk / run × 侧面、侧后、正面、后颈），放各自 `shots/align.tpl_f_<…>.jpg`。

## 约束
- 只写 `tools/model3d/dressup/{cut_head.py,tests_head.py}`、`assets/default/model3d/dressup/heads/{npc_munianci,npc_huangrong}/**` 与本任务报告；不改模板、源件、门禁阈值；不调用 Tripo。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- 六份头报告门禁：`python3 -c` 读两人 `report{,.tpl_f_tall,.tpl_f_small}.json`，level 均不为 fail
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-d2c-head-align.md`（≤ 40 行）：第 3 节写两人三体型的平移量、G1 / 腰线 / 鼓包 / 颈色差新旧对照、染色新旧、截图路径与目视结论。

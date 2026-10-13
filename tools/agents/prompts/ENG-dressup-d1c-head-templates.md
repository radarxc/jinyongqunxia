# 本任务：3D 纸娃娃换装 · D1c · 头按体型出变体（tall / small）+ 颈片保流形 / 底带原顶点 / 顶带内收与权重修正（Claude 直接实现，AR-110）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5）、D1b 任务书与报告（`tools/agents/prompts/ENG-dressup-d1b-neck-splice.md`、`tools/agents/reports/ENG-dressup-d1b-neck-splice.md`）、`tools/model3d/dressup/{cut_head.py,tests_head.py,shoot_head.mjs,ingest.py}`、`apps/game/build/dressup-assets.ts`（`fits` 变体索引）。

## 背景（作者 2026-10-09 反馈）
`/character-3d`「换装 v2」切到 tall：脖子一圈黑带。D1b 只产出 medium 头，页面 `selectDressupVariants` 找不到 tall 的头就退回 medium 那颗，切口与 tall 颈对不上。按体型各拼一份，首跑 tall / small 不过门禁，查明五个根因：
1. 颈片清碎三角时**直接删掉内部碎条**，留下 4–6 点小洞与零宽裂缝（tall 5 处 / small 3 处；medium 碎条全在边界上，删了不出洞）；洞边被当成"侧向开口"钉在模板原位（半径 53 mm，头皮切口只有 35 mm）→ G1 80–90°、鼓包 5.5 mm。
2. tall / small 头相对颈环更低（切口 18 / 19 mm，medium 24 mm），底带上沿到 G1 裙带只剩 8 mm；左后方头颈向下外扩、模板颈更细，`SKIRT_ROOM_MM = 0.5` 把切向压平 5–6°。
3. 底带下沿裁切 / 细分出的新点是 2–3 个模板点的插值权重（常 5 根骨骼，含 2% Head），写 GLB 截成 4 根后 run 帧偏 0.5–0.9 mm → 底带压进身体 0.2 mm（门禁 ≥ −0.05）。
4. 顶带内收（`inset_under_skin`）步长按插值顶点法向估，最近点落在面角附近时与真实距离梯度差 50° 以上，两轮只到 −0.19 mm（门禁 bind ≤ −0.25）。
5. 重叠带复制头皮三角权重的范围按粗网格包络判"此处有皮肤"，发际线过渡区边缘漏判 → 那里的颈片点只拿到 W(θ,h)，与头皮三角插值差 0.02 → run 外露 0.105–0.109 mm（门禁 ≤ 0.1）。

## 要做的事
1. `cut_head.py`：
   - 碎三角改为保流形消去（针形并点、帽形翻边、边界帽形删），颈片只剩上下两圈边界；
   - `SKIRT_ROOM_MM` 0.5 → 0.7（扫 0.5 / 0.7 / 0.8 / 0.9：0.7 时三体型 G1 ≤ 4.1°、鼓包 ≤ 0.6 mm；0.8 起 medium 过渡区鼓包 > 1 mm）；
   - 遮罩平面以下保留整块模板三角（下沿不裁、不细分），顶点与身体同权重；条带下界跟到颈片实际最低点；
   - 内收步长按真实梯度（最近点 → 点）折算，轮数 2 → 4（满足即停）；
   - 重叠带权重复制改按几何口径（切口以上、离头皮三角 < 1.5 mm），与门禁取点一致；
   - 输出按体型命名：目录里已有 manifest 且主模板不是本模板时，产物加 `.<模板>` 后缀（`head.tpl_f_tall.glb`、`fit.tpl_f_tall.json`、`report.tpl_f_tall.json`、`hidemask.tpl_f_tall.png`、预览图同理；fit 的 `hideMask.file` 指向带后缀的遮罩），manifest 在 `fits` 下追加该体型并登记文件摘要；主体型重写时保留其他体型；变体不通过时从 `fits` 撤下。
2. `tests_head.py`：碎三角保流形的合成回归（内部帽形 + 针形；直接删会开洞、新做法仍一圈边界、面积 / 逐角 UV 不变）；合成端到端追加第二体型（后缀命名、manifest 合并 / 撤下）；真实素材复算改为对 manifest 登记的每个体型逐一复算（73 帧外露、标准 penetration、两端 G1、底带外移、文件摘要）。
3. `shoot_head.mjs`：加 `--template <模板>`（先在页面切体型）；头目录里有 `head.<模板>.glb` + `fit.<模板>.json` 时优先用之（与运行时按体型选头一致）。
4. 产物：`heads/npc_huangrong/` 重出 medium（主体型）+ tall / small 变体，三体型 V4 门禁全过；用 shoot_head 在三个体型上截后颈 / 侧颈 / 绑定 + 动作帧对照。

## 约束
- 只写 `tools/model3d/dressup/{cut_head.py,tests_head.py,shoot_head.mjs}`、`assets/default/model3d/dressup/heads/npc_huangrong/**` 与本任务报告。
- 门禁阈值与 D1b 相同，不改不放宽；不改运行时、构建与其他工具；不加依赖；不花 Tripo 点数。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-d1c-head-templates.md`：第 3 节写五个根因的定位证据与修复前后数字、三体型门禁表；第 7 节写给量产 P5：按体型出头的命令与命名约定。报告 ≤ 50 行。

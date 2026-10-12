# 本任务：3D 纸娃娃换装 · R1 · 新素体切头：黄蓉 / 穆念慈 × tpl_f2_medium / tall / small（--texture 8K）+ 换装页变体只在同一套素体内回退（0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。执行者：Claude（AR-110：切头工具由 Claude 实现与维护，仍走校验 + GPT 审核）。

## 作者反馈（2026-10-11）
「六个素体可以，但是换黄蓉头以后有问题」（截图：tpl_f2 素体戴黄蓉头，身上大片黑洞，素体自带光头与黄蓉头互穿）。

## 原因（协调者实测）
- 两个头只按 tpl_f_* 切过。`Character3dPage.vue` 的 `selectDressupVariants` 找不到当前素体的变体时取任意一份：tpl_f 的 hidemask 是按 tpl_f 的 UV 烘的，套到拓扑 / UV 完全不同的 tpl_f2 上会随机隐藏三角（黑洞），该藏的素体光头反而没藏（互穿）。
- 快速试切黄蓉 × tpl_f2_medium（section 颈环）：门禁全过，头缩放 0.921（未钳位）、头底 30 mm，实拍无洞、无互穿。

## 要做的事
1. `cut_head.py`（不改工具）：黄蓉 `--source assets/default/model3d/npc_huangrong/model_rig.glb`、穆念慈 `--source assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig_s07.glb`，`--texture apps/game/public/models/props/<npc>_basecolor_8k.jpg`，`--template assets/default/model3d/dressup/templates/tpl_f2_medium` 先、`tpl_f2_tall` / `tpl_f2_small` 后，`--out` 为原头目录（主体型仍是 tpl_f_medium，tpl_f2 产物带 `.tpl_f2_*` 后缀登记进 manifest `fits`）。六份 `gateLevel: pass`、report `draft`；tpl_f_* 已有产物逐字节不变。
2. 换装页变体回退：把 `selectDressupVariants` 抽成 `useDressupIndex.ts` 里的纯函数，只在同一套素体内回退（模板 id 去掉末尾体型段得到套名：tpl_f / tpl_f2 / tpl_m）；同一套里没有任何变体的物件不出现在当前素体的可选列表里，切换素体时已装备的跨套物件自动卸下。`useDressupIndex.test.ts` 补用例（同名优先、同套回退、跨套不回退、卸下）。
3. 截图（`shoot_head.mjs`）：每个 NPC 在 tpl_f2_medium 的正脸 / 颈 3/4 近景与 bind / walk / run 全身，tall / small 各一张全身；放 `heads/<npc>/shots/f2.*.jpg`。
4. 浏览器实测：5173 `/character-3d` 选 tpl_f2 三个体型分别换黄蓉 / 穆念慈头，确认无黑洞、无光头互穿；选 tpl_m_* 时头列表里不出现这两个头。

## 验收
- 六份新切头门禁全过（接缝色差 p95 < 2、ΔE < 3、G1、遮罩、73 帧动作外露等原口径）；线性密度 ≥ 2 倍。
- 页面单测通过；浏览器实测截图无洞、无互穿。
- 已有 tpl_f_* 头产物与其他素材逐字节不变。

## 约束
- 只写 `assets/default/model3d/dressup/heads/npc_huangrong/**`、`assets/default/model3d/dressup/heads/npc_munianci/**`、`apps/game/src/pages/{Character3dPage.vue,useDressupIndex.ts,useDressupIndex.test.ts}` 与本任务报告。
- 0 点；不改 cut_head.py 等工具；不改门禁阈值；测试不写真实素材。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- 两个头各体型 `report*.json` 的 level 不为 fail
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-r1-heads-f2.md`（≤ 60 行）：六份新切头的顶点 / 三角 / 缩放 / 头底 / 门禁关键值；页面回退规则与用例；截图路径；第 7 节写之后衣物 / 道具重贴合与切换默认素体的交接。

## 补充裁定（2026-10-11 22:30，执行中实测）
1. 首轮六份：黄蓉三体型全过；穆念慈 tpl_f2_tall 过，medium / small 不过——`head.seamG1Top` 单度尖峰 7.7° / 10.5°（门 < 5°，p95 只有 1.3° / 1.9°），左右对称在 44° / 141°；small 另有 run 帧顶带外露 0.19 mm。
2. 根因：新素体颈更细，穆念慈要收细 2.1–3.4 mm（黄蓉 < 1 mm、旧素体 < 1 mm）。穆念慈源件是 0.7 简化版，颈部三角跨 5 mm 以上（42–48° 切口上下 6 mm 只有 3 个顶点），逐顶点收细后在切口处线性插出来的半径一两度内跳 0.31 / 0.55 / 0.89 mm（tall / medium / small，随收细量增大；旧素体同处 < 0.05 mm）。排除过的假设：颈壳硬边界（改平滑渐隐无变化）、头皮包络空值（插补后无变化）；细分大三角会超 30,000 三角预算。
3. 准许改 `cut_head.py` / `tests_head.py`（已加进写集）：新增 `smooth_cut_ring`，在收细动过顶点时把头侧切口圈（h_head 平面上的皮肤顶点）半径按角度高斯平滑（σ = 3°，与收细量的角度平滑同尺度），角度、高度不变，发丝切口不动；半径本来均匀时原样返回、不写诊断（无 `--texture` 的逐字节基线不受影响）。快速模式实测：穆念慈 medium / small G1 最大 2.82° / 4.02°，切口圈最大挪动 0.29 / 0.45 mm，接缝色差不变。门禁阈值不改。
4. 六份 tpl_f2 产物一律用改后的代码重切（黄蓉也重切，保证同一版本）；tpl_f_* 已提交产物不重切、字节不变。

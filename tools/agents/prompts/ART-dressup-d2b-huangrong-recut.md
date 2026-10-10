# 本任务：3D 纸娃娃换装 · D2b · 黄蓉三体型用新工具重切（方案 2：身体染色对准切口颈色）

只改负责的文件；不执行改变仓库状态的 git 命令；报告如实。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5 A1~A2）、D2 任务书 `tools/agents/prompts/ART-dressup-d2-head-gen.md` 第 10~13 条与 D2 报告。

## 作者要求
2026-10-10：「换头感觉还是有点问题，颈部切口总能看出来……能不能把素体整体颜色根据颈部颜色调整？」D2 第 10 条已在 `cut_head.py` 实现（第一遍烘颈片后把 A 区平均增益乘回 skinTint 再重烘，颈片不再从颈色渐变到身体色），并约定库内黄蓉三体型随后用新工具重切。本任务只重切黄蓉，不改工具。由 Claude 直接执行（AR-110），产物走 `supervise.py --from validate` 与 GPT 审核。

## 输入
- 源件 `assets/default/model3d/npc_huangrong/model_rig.glb`（不动）；模板 `assets/default/model3d/dressup/templates/tpl_f_{medium,tall,small}/`；工具为 D2 合入后的 `tools/model3d/dressup/cut_head.py`。

## 要做的事
1. 旧产物先备份到系统临时目录（截图对照用），再删 `heads/npc_huangrong/` 下的 head*.glb、fit*、report*、hidemask*、preview*、self_check*、manifest.yaml。
2. 依次跑 `python3 tools/model3d/dressup/cut_head.py --source assets/default/model3d/npc_huangrong/model_rig.glb --template assets/default/model3d/dressup/templates/tpl_f_<medium|tall|small> --id npc_huangrong --out assets/default/model3d/dressup/heads/npc_huangrong`（medium 先；tall / small 自动加后缀并登记 manifest `fits`）。
3. 三份 report level 均为 draft；每份 fit 的 `diagnostics.color.neckMatch.residualGain` 三通道 ≈ 1（|Δ| < 0.01）、`deltaE`（切口颈色 vs 染色后身体颈色）< 3；几何门禁数值与旧产物逐项对照：方案 2 只改颜色；D2 的颈部单调适配（第 3 条）会改动部分角度的颈桥——D2 回归实测黄蓉鼓包 0.47–0.60 → 0–0.30 mm、tall 顶缝 G1 4.05° → 3.63°，三角数、penetration、顶带外露不变。
4. 运行时截图（5173 `/character-3d`）：三体型各 `node tools/model3d/dressup/shoot_head.mjs --template tpl_f_<…> --head 旧=<备份> --head 新=assets/default/model3d/dressup/heads/npc_huangrong --poses bind,idle@0.6,walk@0.35,run@0.5 --views neck,neck_left,neck_3q,neck_back_left,nape_low --mask on --out <临时目录>`，总图复制为 `heads/npc_huangrong/shots/recut.tpl_f_<…>.jpg`。

## 约束
- 只写 `assets/default/model3d/dressup/heads/npc_huangrong/**` 与本任务报告；不改工具、测试、模板、源件；门禁不放宽；不调用 Tripo、不花点。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- 三体型头报告门禁：`python3 -c` 读 `heads/npc_huangrong/report{,.tpl_f_tall,.tpl_f_small}.json`，level 均不为 fail
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-d2b-huangrong-recut.md`（≤ 30 行）：第 3 节写三体型新旧对照（skinTint、切口颈色差、脸均色差、接缝 ΔE p95、G1、penetration、顶带外露），截图路径与目视结论；第 4 节写开放问题。

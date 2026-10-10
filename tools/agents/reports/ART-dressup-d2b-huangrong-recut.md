# ART-dressup-d2b-huangrong-recut 报告 · 3D 纸娃娃换装 · D2b · 黄蓉三体型用新工具重切（方案 2：身体染色对准切口颈色）
## 1. 摘要（3–6 行）
- 用 D2 合入后的 `cut_head.py` 重切库内黄蓉三体型（源件、模板、工具都不改，不花点）。三份 level draft，V4 全过。
- 方案 2 生效：身体 skinTint 由脸均色 [0.90, 0.85, 0.88] 改为对准切口颈色 [1.00, 0.95, 0.95]（身体整体提亮约 11%），残余增益 1.00，切口颈色差 ΔE 0.02；运行时颈子与身体同色，不再有颈中下部那道颜色过渡。
- 附带 D2 的颈部单调适配：颈桥鼓包 0.47–0.60 → 0–0.30 mm，tall 顶缝 G1 4.05° → 3.63°；三角数、penetration、顶带外露不变。
## 2. 产出（文件、行数、主要章节）
- `heads/npc_huangrong/`：head{,.tpl_f_tall,.tpl_f_small}.glb、fit / report / hidemask / preview / self_check 各三份、manifest.yaml（3 个 fits 均 draft，18 个文件摘要）；`shots/recut.tpl_f_{medium,tall,small}.jpg`（旧 / 新 × bind / idle / walk / run × 5 机位）。本报告。
## 3. 关键结论与数值
- 命令：三体型依次 `python3 tools/model3d/dressup/cut_head.py --source assets/default/model3d/npc_huangrong/model_rig.glb --template assets/default/model3d/dressup/templates/tpl_f_<t> --id npc_huangrong --out assets/default/model3d/dressup/heads/npc_huangrong`（medium 先）。
| 体型 | level | 顶点 / 三角 | 耗时 durationMs（墙钟含 validate） | 双调和 residualMaxMu | skinTint 旧 → 新 | 颈色差 / 脸均色差（只报） | 接缝 ΔE p95 顶/底 旧 → 新 | G1 顶/底 旧 → 新 | 鼓包 旧 → 新 | penetration idle/walk/run | 顶带外露 max |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medium | draft | 16,283 / 27,924 | 191,786 ms（383 s） | 2.8e-08 | [0.90,0.85,0.88] → [1.00,0.95,0.95] | 0.02 / 3.04 | 1.37/0.85 → 1.47/0.93 | 3.37°/0.70° → 不变 | 0.47 → 0.00 mm | 0.14% / 0 / 0（不变） | −0.20 mm（不变） |
| tall | draft | 15,984 / 27,320 | 209,599 ms（411 s） | 9e-09 | [0.90,0.83,0.87] → [1.00,0.95,0.95] | 0.02 / 3.48 | 1.42/0.68 → 1.44/0.81 | 4.05°/1.15° → 3.63°/1.15° | 0.60 → 0.30 mm | 0 / 0 / 0（不变） | −0.20 mm（不变） |
| small | draft | 16,194 / 27,703 | 206,687 ms（395 s） | 5e-09 | [0.90,0.83,0.87] → [1.00,0.96,0.96] | 0.02 / 3.49 | 1.40/0.66 → 1.41/1.04 | 3.58°/1.16° → 3.43°/1.16° | 0.56 → 0.00 mm | 0.14% / 0.14% / 0（不变） | −0.19 mm（不变） |
- 契约：头是蒙皮件，刚性锚点（socket）校验不适用；对应证据为三份 report 的 `skeleton.joints` 65 / 65、关节顺序与模板逐项相同、`skeleton.ibmMaxAbs` 0.0、`weights.jointIndices` 通过。
- 切口带调平：medium / tall / small 各 51 / 48 / 52 个角度贴着衣领（D2 第 13 条），逐角最大 +2.1 L* 不触发，纹素不动；衣领残片清理 0 面；顶带外露两种口径（覆盖皮肤 / 全部头皮）逐位相同。
- medium 与 D2 实验阶段的方案 2 重切（`hr_opt2`）head.glb、hidemask 逐字节相同。
- 截图（5173 `/character-3d`，shoot_head 常驻浏览器）：旧行颈中下部偏粉暗、与颈上部有过渡；新行颈子到肩同色；后颈 / 侧面无黑缝、碎片、鼓圈；hideMapError 为空。
## 4. 开放问题（附默认值）
- 脸均色差 3.0–3.5（只报）：身体对准颈色后，脸比颈偏粉是本人肤色差，不是接缝；默认不处理。黄蓉长发 walk / run 发片散开呈锯齿，新旧相同，是源模型问题；默认另起任务。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无（tech/12 的 V4 口径已随 D2 更新）。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）与交接
- ✅ 只写 `heads/npc_huangrong/**` 与本报告；源件、模板、工具未改；未调用 Tripo。三份 level draft；residualGain 三通道 1.00、颈色差 0.02 < 3。
- ✅ `tests_head.py`（含真实资产 73 帧复算）、`selftest.py`、头报告门禁、`pnpm install --frozen-lockfile`、`pnpm check` 由 supervise 复验通过（10:43 finish rc=0）。
- 交接：颜色看 `fit*.json.diagnostics.color.neckMatch`（faceTint / gainBefore / residualGain）与 `fit*.json.skinTint`；规模与耗时看 `report*.json.stats`（vertices / triangles / durationMs）；动作与外露看 `report*.json.checks_detail.motion`；重切命令见第 3 节。

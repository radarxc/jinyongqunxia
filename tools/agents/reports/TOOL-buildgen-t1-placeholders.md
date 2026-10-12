# TOOL-buildgen-t1-placeholders 报告 · 城镇 3D 古建 · 程序化占位贴图（每套件 16 层 + 道具 8 层，真实尺度、可复现）与按档条带
## 1. 摘要（3–6 行）
- 已重出 `song_dali` / `xiyu` 各 16 层、`props` 8 层的 1024² 母版及 5 张按档条带；固定种子按 kit/layer 派生。
- 返修以去 DC 后全频谱最大峰验收 70 个尺度轴；14 个原失败轴改由纹样面内缓变确立主周期，实测误差均 0.00%。
- 40 张母版最大接缝 ΔE2000 为 0.000；manifest 已同步新 repeat、命令、层序、尺寸与 SHA-256。
## 2. 产出（文件、行数、主要章节）
- `common.py` 188 行；`make_placeholder_layers.py` 433 行；`build_layer_strips.py` 217 行；`test_layers.py` 146 行。
- `assets/default/buildkit/{song_dali,xiyu,props}/`：40 PNG + 5 WebP + 3 manifest，4,045,533 B；最大 PNG 280,692 B（<2 MiB）。
- `content/town/buildkits/{song_dali,xiyu}.yaml`：仅改 `layers[].repeatMm`。
## 3. 关键结论与数值
- 记法“旧 repeat→新 repeat；目标→FFT 实测”，以下每层各适用 u/v 轴均实测等于目标、误差 0.00%、ΔE `0.000`。
- song 0–3：`tile_roof` 2000²→2070×1920，230×320→230×320；`ridge_tiles` 1000²→920×990，230×330→同；`eave_soffit` 1000²→920×1000，u230→230；`timber_lacquer` 1000²→1100×1000，u220→220。
- song 4–7：`timber_raw` 1000²→920×1000，u230→230；`plaster_lime` 2000²→1800×2100，900×700→同；`earth_plaster` 2000²→2400×1950，800×650→同；`stone_rubble` 2000²不变，400²→同。
- song 8–11：`stone_ashlar` 2000²不变，400×200→同；`brick_grey` 1000²→1230×1000，410×200→同；`lattice_window` 1000²→980²，70²→同；`door_planks` 1000×2000→900×2000，u225→225。
- song 12–15：`floor_pavers`/`floor_wood`/`painted_band` repeat 不变，尺度 500²/u200/250²→同；`cloth_awning` 1000²→996²，12²→同。
- xiyu 0–3：`mud_roof` 2000²→2400×2100，800×700→同；`parapet_coping` 1000²→1200×1000，400×200→同；`joist_soffit` 600×1000→690×1000，u230→230；`timber_carved` 不变，250²→同。
- xiyu 4–7：`timber_raw` 1000²→920×1000，u230→230；`mud_plaster_ochre` 2000²→2400×1950，800×650→同；`mud_plaster_limewash` 2000²→1800×2100，900×700→同；`brick_fired` 1000²→900×1050，300×150→同。
- xiyu 8–11：`adobe_brick`/`brick_lattice`/`door_carved` repeat 不变，400×200/200²/250²→同；`lattice_wood` 1000²→980²，70²→同。
- xiyu 12–15：`floor_earth` 2000²→2000×1800，500×450→同；`carpet_kilim` 不变，400²→同；`dome_plaster` 2000²→1800×2100，900×700→同；`canvas_awning` 1000²→996²，12²→同。
- props：wood 200/250、ceramic 250²、iron 300²、cloth 12²、paper v200、basket 80²、drawers 250×200 均目标=实测；props repeat 仅内部规格调为 iron 900²、cloth 996²、basket 1040²以容整数周期。
- 条带：建筑 512×8192 与 256×4096，props 256×2048；WebP quality 85；逐切片比对母版（每通道 MAE ≤6.0，实测最大 4.257），并有交换切片且同步 SHA 仍须失败的负例。
## 4. 开放问题（附默认值）
- 正式图等闸门 A；默认 `candidate/procedural` 仅供评审，`xiyu` 14 仍占槽但唐式变体不用。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/16` §4.3/§12.1：示意 `repeatM` 及旧重复尺寸应同步为套件 `repeatMm` 整数周期值。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 三条 Python 命令通过：5 tests / 5 OK；双运行 48 文件 SHA 相同；70/70 全频谱主峰误差 0.00%；40 母版 1024²、<2 MiB、最大 ΔE 0.000；`git diff --check` 通过。
- ⚠️ town-plan 指定命令未完整跑成：本副本无 Vitest；借父工作区二进制加 runner 后 95 tests 通过，但 6 suites 因父依赖软链无法解析 `@tianshu/shared`/`yaml`；按约束未改 `node_modules`，留给校验环境。
- ✅ 建筑层 r9：条带 `assets/default/buildkit/{song_dali,xiyu}/strip_{512,256}.webp`、`props/strip_256.webp`；自上而下下标取 manifest `layers[index]`/`order`。
- ✅ 出图线：原位替换 `layers/<id>.png`；保持 1024² RGB、manifest `repeatMm`、UV 左上原点/方向及对边；不裁切/旋转/加边/画 AO 阴影；再重跑两生成命令更新条带/SHA。

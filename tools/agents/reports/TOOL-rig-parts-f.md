# TOOL-rig-parts-f 报告 · 动作原型 · 主角·女三视图切件、身份 rig 与走路 / 剑招动图（用 TOOL-rig-sheet 的切件工具链；AR-47；traex GPT-5.6-Sol max）
## 1. 摘要（3–6 行）
- 已由 `sheet_L/R.png` 各拆出三视图；正式 39 件使用未镜像 `work/L`，`work/R` 保留作独立右向中间件。
- 已登记 `npc_zhujue__ch00_f` identity rig，生成姿势条带及走路、剑招、程序步态 A/B 三张 GIF。
- 长袍髋膝按女性骨长先验定位；袍下腿件保留 FK/元数据但预览不绘制，鞋仅在袍摆附近显露。
- 本轮按审核重出侧 torso、前 3/4 鞋与侧臂，消除断颈/腰洞、袍摆横条、黑关节斑及漂浮鞋；569/569 单测与四项门禁通过。

## 2. 产出（文件、行数、主要章节）
- `assets/default/rig/npc_zhujue__ch00_f/{front34,side,back34}`：各 13 PNG + 13 pivots YAML；`work/{L,R}`：各三图、三 keypoints YAML、`sheet.json`。
- `manifest.yaml`：39 parts/39 assets；identity、女性骨长、`sourceLimitation`；派生目录（不含只读 `sheet/`）97 文件、7,078,609 B。
- `preview/`：姿势条带 1344×992；三张 GIF 见 §3。
- 工具最小增量：`keypoints.py` 318 行、`make_parts.py` 497 行、`segment_parts.py` 716 行、`preview.py` 608 行；两测试文件 1,041 行。
- 新增 female/ankle-robe profile；本轮仅补 side torso 连通、鞋主连通、侧臂黑斑回填及袍摆近距鞋显隐；默认 short/male 不变。

## 3. 关键结论与数值
- Q1（Lab ΔE2000，发髻/袍/腰带/袖口/鞋）：front34 `0.658/0.915/2.291/1.490/0.927`；side `1.061/0.845/1.936/1.090/1.681`；back34 `1.287/1.203/0.625/0.877/1.191`；15/15 ≤10。
- Q2：39/39 PNG 在 `alpha≥8` 与 `alpha≥24` 均各 1 连通域；`inpaintedPct` 均值 `2.990%`、最大 `12.510%`（side 双手）；回退 `0`；6 个 thigh/shin 标 `garmentHidden/sourceRobeTexture`。
- Q3：透明背景重算，可见 pelvis/neck/肩/肘/腕 3 px 圆：`clip_walk` 首帧 8 向 `0/1856`，12 采样×8 向 `0/22272`；含刻意隐藏髋膝踝为 `2022/38976`，不冒充零。
- Q5：从 `clip_walk` 独立重算支撑相左/右最大漂移 `0.300/0.366 cm`，总最大 `0.366 cm ≤2 cm`。
- GIF：`preview/walk_dir8.gif` 2048×320/51 帧；`sword_attack_dir8.gif` 2048×320/58 帧；`gait_vs_clip_walk.gif` 512×320/51 帧；三份最终全帧接触表与 pose strip 已目检。
- 身份：`heightM=1.62`；骨长 m=`0.50/0.23/0.28/0.245/0.18/0.42/0.38/0.235`；sheet SHA-256=`5630bf5a…297b4114`。
- 长袍限制：`pelvis_skirt` 是单片刚性袍摆，无布料动力学；隐藏腿只维持 FK；鞋仅在踝点距袍摆 `≤max(18 px, 0.82×鞋骨长)` 时绘制。Vision 编译超时 60 s，故用带置信度 manual-prior；侧臂按轮廓人工修点。

## 4. 开放问题（附默认值）
- 长袍动态：默认本原型使用刚性袍片、隐藏腿和袍摆近距鞋；后续若需高抬腿剑招，增加分片裙摆/布料解算，不用当前腿纹替代袍布。
- Apple Vision：默认继续 manual-prior；换完整 Xcode/Vision 环境后再复跑，不阻塞 candidate。
- 作者观感未拍板：默认三张 GIF 保持 candidate，后续从程序步态与 clip 走路中择一。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
| 编号 | 提案 | 理由 |
|---|---|---|
| 无 | 不修改基准 | AR-47 与现有 identity rig/clip 契约足以承载本资产。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 / 任务 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/09-character-rig.md` | 长袍例外 | 登记 `sourceLimitation: garmentHidden`：thigh/shin 仍供 FK，预览隐藏；foot 仅在袍摆近距显示。 |
| ENG-12c-clip | identity/渲染接口 | 读取女性 `heightM/boneLengthsM`、`nearSide:L` 与 `sourceLimitation`；隐藏 thigh/shin，foot 仅在踝点距袍摆 `≤max(18 px, 0.82×鞋骨长)` 时绘制。 |
| `assets/default/prompts/rig/GUIDE.md` | 长袍模板 | 增补 ankle-robe 脚件仅取踝下鞋袜、隐藏腿 Q3 单列可见关节的规则。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 拆图/关键点：L/R 各 3 图，`1.62×256≈415 px`；踝→膝 `0.38×256≈97 px`、膝→髋 `0.42×256≈108 px`；补充侧图仅核对姿势①②。
- ✅ 切件/manifest：3×13、39/39 单连通、0 回退；`kind:identity`、身份四字段、`nearSide:L`、骨架/骨长、`attachments:[]`；女/男 `--check` 均通过。
- ✅ 返修：side torso 的 neck/双肩各 7×7 窗 `49/49` 像素非透明；front34 鞋最大行宽 `21 px`；侧臂纯黑不透明像素 `0`。
- ✅ 预览：pose strip、三 GIF 已重出；最终全帧目检腰无黑洞、头颈连续、鞋无独立漂浮、无矩形袍腿穿出；⚠️ 刚性袍摆限制见 §3/§4。
- ✅ 工具兼容：仅加 female/ankle-robe 分支，默认行为不变；真实资产回归已从硬编码男主改为女主并覆盖 torso/foot/侧臂。
- ✅ 全量 `unittest discover`：569/569 通过；上次缺失的已跟踪南京 layout 已由工作区恢复，本任务未修改范围外文件。
- ✅ `check_assets`：39 图/39 条/0 问题；`check_ids --strict`：新增失败 0；`git diff --check` 通过；未改 sheet、男主、标准体、clips、规格或任务清单。

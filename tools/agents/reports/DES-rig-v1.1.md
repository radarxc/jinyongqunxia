# DES-rig-v1.1 报告 · 技术规格修订 · tech/09 v1.1（三视图 sheet 契约、身份 rig 字段、§4.6 片段驱动、C5/C9/R9）与 tech/07 §4.5/§5.4、rig GUIDE（AR-29、AR-34）
## 1. 摘要（3–6 行）
- `tech/09-rig` v1.1 已补齐 sheet / identity manifest、片段播放器与纹理数组两 pass 契约。
- `tech/07` 已收敛为 codex 三视图、CC0 动作白名单、三视图切件和 C5/C8/C9/R9 管线。
- rig GUIDE 已改为从新 A 字三视图切件；旧立绘仍禁止裁切。
- 严格 ID 检查及差异格式检查通过；本任务不写代码、不出图。
## 2. 产出（文件、行数、主要章节）
- `docs/tech/09-character-rig.md`：881 行；v1.1 表头、§1.3、§4.6、§5.1–§5.2、§6.1–§6.2、待决追溯。
- `docs/tech/07-asset-generation.md`：1756 行；§4.5、§5.4.1–§5.4.9，并同步人物入口口径。
- `assets/default/prompts/rig/GUIDE.md`：37 行；§2 codex / L-R sheet 生产规程与 §3 切件边界。
- 本报告：规格修订、开放项、跨文档同步与验收记录。
## 3. 关键结论与数值
- `tech/09` §4.6 新增 `playClip` / `stopClip`、统一 `PartPose/writePose`；12 fps、10°、0.45、160 ms、[0.8,1.4]、±30° 均标【建议值】并逐项注明调研出处。
- `tech/09` §6.1–§6.2 新增 `sheet/`、identity set 例外及 kind/identity/skeleton/nearSide/boneLengthsM/part source/attachments 可选字段；§5.2 用 `DataArrayTexture` + `sampler2DArray`，仍为 2 draw call。
- `tech/07` §4.5：Mesh2Motion CC0 首选，UAL 1/2 备选且 UAL Pro 不买；仅 CC0、CMU 条款、CC BY，禁 NC / Mixamo；C7 默认作者自录。
- `tech/07` §5.4.2：codex A 字 sheet；Q1 为 5/5、ΔE2000≤10【建议值】，整张最多重试 2 次【建议值】；§5.4.3–§5.4.8落实 C5/C8/C9/R9。
## 4. 开放问题（附默认值）
- C8：默认程序步态；动作库 walk 只进 `/rig-demo` A/B，再由作者判定。
- Q1 色差、片段阈值与数组层上限：默认按正文建议值做原型，须样张 / 三机真机复核。
- C7 签名招式：默认原型不新增来源，后续优先作者自录 + 姿态提取。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- RIG-P01：Canon §19 补述分层公告板、三视图 + 镜像与代码轨迹；AR-22 已覆盖八向逐帧路线。
- RIG-P02：Canon §18 明确 rig 规格归 `tech/09-character-rig.md`、路线图归 `tech/09-roadmap.md`，避免简称歧义。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/09-roadmap.md` §3.4 动作：把“Gemini 多视角评估中”改为 AR-34 codex sheet、Mesh2Motion 原型、C9 分层轨迹与 C8 A/B；登记 ENG-12c-clip / clip-map / R9。
- `packages/render/CLAUDE.md` “角色 rig API”：补 `playClip/stopClip/writePose`、`PartPose`、hit/end 仅表现、C5 R sheet、identity manifest 与 `DataArrayTexture` 数组层仍 2 draw call。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ AR-29：具名 NPC identity rig；主角 / 队友标准体 + 装备，路人标准体 + 调色；C3 新 sheet 可切、旧立绘不可切。
- ✅ AR-34/C1：三视图用 codex；只给主角 / S 级上传已审立绘；UAL Pro 不买。
- ✅ C4 仅核对既有解剖学 L / 近侧约定；未重写 §1.4 / §8。
- ✅ C5：普通角色可镜像，主角 / S 级交 `sheet_R.png`；C6 白名单与 C7 默认已登记。
- ✅ C8 默认程序步态；C9 战斗大动作全走分层轨迹、整身帧仅 cutin；RIG-O03 已解决。
- ✅ R9 为纹理数组 + flags 层号 + `sampler2DArray`，仍守 2 draw call；sheet 路径、identity 命名和全部可选字段齐全。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure 0；`git diff --check`：通过；改动仅四个授权路径。
- ⚠️ 未做样张、浏览器或真机实测，建议值和性能风险均按要求保留待验。

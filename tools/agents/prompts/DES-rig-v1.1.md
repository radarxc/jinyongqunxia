# 本任务：技术规格修订 · tech/09 v1.1 与 tech/07 §4.5 / §5.4、rig GUIDE（AR-29、AR-34；调研报告 C3、C5、C8、C9、R9）

本任务改技术规格文档，不写代码、不出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/reports/RESEARCH-anim-motion-library.md`（§2.3 选库、§3 三视图、§4.1 路线、§5.2 数据流、§5.3 模块与清单格式扩展、§5.4 特殊服饰、§5.5 近侧、§5.6 判定标准、§6.1 风险 R9、§6.2 C1–C11、§7 衔接）；`tools/agents/reports/TOOL-rig-nearside.md`、`TOOL-rig-clips.md`（已合入，近侧约定与片段格式已经写进 tech/09）；`docs/decisions/author-requirements.md` AR-29、AR-34（三视图用 codex、UAL Pro 先不买）；`docs/tech/09-character-rig.md`、`docs/tech/07-asset-generation.md` §4.5、§5.4，`assets/default/prompts/rig/GUIDE.md`。

## 作者决定与默认（都已定，照写）
- AR-29：2D 分层部件 + CC0 动作库驱动 + 三视图切件；具名 NPC 每人一套身份部件（C2）；主角和可换装队友仍用标准体加装备层；路人标准体加调色。
- AR-34：三视图改用 **codex exec**（上传已审立绘作身份参考，只传主角和 S 级，C1）；UAL Pro 先不买，原型用 Mesh2Motion（CC0）。
- C3 同意：出图规程改为「一张 A 字三视图 + 工具切件」，不再逐部件出 39 张；GUIDE 里只禁止裁旧立绘，允许从新出的三视图切件。
- C4 已由 TOOL-rig-nearside 落实（解剖学左右，近侧 L），本任务只核对不重写。
- C5 默认：普通角色接受镜像；主角和 S 级加一张面向右的三视图（`mirrorSafe:false` 修正版）。
- C6：动作许可只用 CC0、CMU 条款、CC BY（署名）；不用 NC 数据与 Mixamo。
- C8 默认：行走先保持程序步态，动作库 walk 做 A/B 后再定。
- C9 是：战斗大动作全部走「分层部件 + 动作轨迹」，收口 RIG-O03；整身帧只用于立绘切入（cutin）。
- R9：身份 rig 变多后图集改用 `DataArrayTexture`（着色器 `sampler2DArray`，实例 flags 带层号），仍守 2 个 draw call。
- 三视图文件契约（协调者定）：`assets/default/rig/<set>/sheet/sheet_L.png`（front34|side|back34 都面向画面左）、`sheet_R.png`（S 级 / 主角的面向右修正版）、`sheet/manifest.yaml`（与其他素材 manifest 同字段）；身份 set 命名 `<npcId>__<variant>`（如 `npc_zhujue__ch00_m`），作为 §6.1「不得用角色姓名建基础 rig」的例外（基础体型仍是 `male_std` / `female_std`）。

## 要做的事
1. **`docs/tech/09-character-rig.md` 升到 v1.1**（文首「项 / 内容」表加版本与日期；变更记录加一条）：
   - §6.1 目录契约：加 `sheet/` 子目录与两张设定图、身份 set 命名例外；§6.2 manifest：加可选字段 `kind`（standard | identity）、`identity{npcId, variant, portrait, sheetSha256}`、`skeleton`、`nearSide`、`boneLengthsM`、part 的 `childJoint` / `zOrder` / `source{keypoints, inpaintedPct}`、`attachments[]`（照报告 §5.3 的 YAML 样例，向后兼容，都可选）。
   - 新增 §4.6「片段驱动」：`playClip(id, {facingYawDeg, rate, onEvent})` / `stopClip()` 接口；`PartPose {viewIndex, mirrored, affine, z}` 为 `writePose` 的统一输入（步态与片段同一入口）；偏航旋转 → 2D 正向运动学 → 逐部件选视图（10° 滞回）→ 缩短下限 0.45 → 动态 z → 剑轴；一拍二采样；`hit` / `end` 事件只用于表现同步（core 不读）；播放速率 = core 速度 / 片段固有速度，夹在 [0.8, 1.4]，超出退回程序步态；根运动原地；与步态 160 ms 交叉淡入淡出；偏航辅助 ±30°；`nearHandWeapon` 时主手落在远侧则镜像片段；`content/anim/clip-map.yaml` 把 `MoveDef.anim.clip` 键映射到片段 ID 与参数（数据驱动）。数值都标【建议值】并注明出自调研报告哪一节。
   - §1.3 / §5：写入 C5 镜像策略与 R9 的 `DataArrayTexture` 方案（仍 2 个 draw call）；§5.1 接口清单补 `playClip` / `stopClip`。
   - 待决事项：RIG-O03 改写为「已解决：C9，整身帧只用于 cutin」；C8 记为开放问题（默认程序步态）。
   - 已由 TOOL-rig-nearside / TOOL-rig-clips 写好的 §1.3、§1.4、§8 只核对引用，不重写。
2. **`docs/tech/07-asset-generation.md`**：
   - §4.5：加「选库结论（AR-29 / AR-34）」：原型用 Mesh2Motion 人形动作集（美术 CC0），备选 Quaternius UAL 1 / 2（CC0）；许可白名单 C6；UAL Pro 先不买；Mixamo、NC 数据不用；签名招式来源待定（C7，倾向作者自录）。
   - §5.4.2：生成输入由「Gemini 一张 A 字三视图」改为「codex exec（image_gen）一张 A 字三视图，上传已审立绘作身份参考（AR-34；只传主角与 S 级）」，mermaid 图同步；加 `sheet/` 文件契约、S 级两张（L / R）、质检识别锚 Q1 与重试上限 2；Gemini 不再用于人物与三视图（AR-31 / AR-34）。
3. **`assets/default/prompts/rig/GUIDE.md`**：§2 第 1 步改为用 `codex exec` 按 `tools/agents/prompts/_imagegen.md` 出图、文件名与目录按上面的契约、主角 / S 级两张；其余条文保留。

## 约束
- 只写：`docs/tech/09-character-rig.md`、`docs/tech/07-asset-generation.md`、`assets/default/prompts/rig/GUIDE.md`、本任务报告。
- 不改 `tech/09-roadmap.md`（归另一任务）；不改代码与素材。
- 每次写入 ≤ 150 行；新增内容只引用调研报告与作者决定，不自创数值。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：改了哪些小节（文件、节号、新增 / 改写）；第 6 节列出需要同步到 `tech/09-roadmap.md`、`packages/render/CLAUDE.md` 的条目；第 7 节逐条对照上面的「作者决定与默认」。报告 ≤ 50 行。

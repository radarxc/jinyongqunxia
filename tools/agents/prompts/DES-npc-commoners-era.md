# 本任务：设计补充 · 各朝各代路人 NPC 形象（AR-30 第 4 条）

本任务写路人形象清单和出图提示词，**不出图**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本任务已开联网，用来查历代服饰、军服、官服史料。

## 作者要求（2026-10-02 原话，见 `docs/decisions/author-requirements.md` AR-30）

> 4. 增加各朝各代的路人NPC（店铺老板，士兵，官员等），符合朝代打扮和特点。

## 必读

- `docs/design/catalog/npcs-commoners.md`：路人甲生成规则、职业 ID 局部枚举（`porter`、`farmer`、`fisher`、`hunter`、`woodcutter`、`boatman` 等）、年龄与伦理限制。新形象要对接这里的职业枚举；缺的职业在报告里提补充。
- `docs/00-canon.md` §12：无名路人不注册静态 `npc_*`，用 `roleKey` 等角色槽，见第 628 行附近；§2 书序（白马已改唐朝，见 AR-26）。
- `docs/design/02-timeline-and-world-tiers.md`（各书界年代与地域）、`docs/design/19-world-map.md`（区域）。
- 立绘画风与格式：
  - `assets/default/prompts/characters/GUIDE.md`；
  - 任意一份 `assets/default/prompts/characters/ch01-tianlong/npc_*.md`；
  - `tools/portrait/README.md`（立绘统一 1024×1536、浅暖灰纸底，后续抠图）。

## 要做的事

1. **形象清单** `docs/design/catalog/npcs-commoners-era.md`（新建）：
   - **时代与地域**（每个时代写清年代与对应书界）：
     - 春秋（越地，序章）、唐（中原与西域，白马）、北宋、辽、西夏、金、南宋、大理、吐蕃、蒙古与元、明（北方 / 江南）、清（北方 / 江南 / 回疆）。
   - **角色**（每个时代 ≥ 12 种，不适用的写明原因）：
     - 店铺掌柜、店伙计 / 小二、普通士兵、军官、文官、衙役 / 捕快、书生、农夫、渔夫或船夫、樵夫或猎户、小贩、镖师、僧、道、乞丐、妇人（村妇 / 市井妇人）、郎中、铁匠、歌伎或卖艺人等；
     - 有性别差异的分男女。
   - **每行字段**：形象 ID、时代、角色（对接职业枚举）、性别、年龄段、服饰（首服 / 发式、上衣、下装、鞋、配饰、颜色与材质，按史料）、标志道具、体态气质、史料依据（书名、文物或图像名，不编造卷次页码，查不到标（待核实））、适用书界。
   - **ID**：按 canon §12 给路人形象登记前缀，先全库查重。建议形象 ID `por_role_<职业>__<时代>_<m|f>`，与具名人物 `por_npc_*` 区分。
   - **总数** ≥ 160。
2. **出图提示词**：每个形象一份 `assets/default/prompts/characters/commoners/<时代>/<形象ID>.md`。
   - frontmatter：`asset_id`、`name`、`era`、`role`、`gender`、`tier: C`、`output: assets/default/character/<male|female>/commoners/<时代>/<形象ID>.png`、`manifest`（同目录 `manifest.yaml`）、`status: ready`。
   - 正文 `## Gemini 提示词` 放一个中文 ```text 代码块，自成一体：
     - 「生成一张 2:3 竖幅全身人物立绘」；
     - 画风：写实手绘古风，与具名人物立绘一致；真实皮肤与布料质感、不对称、普通人长相，不要网红脸与 AI 塑料感；低饱和；
     - 背景：暖浅灰纸底加极淡水墨远山，人物轮廓清楚；
     - 服饰逐项按史料；
     - 道具；
     - 排除项：文字、水印、多人、幼态、跨朝混搭、现代物件。
   - 不上传参考图。
3. **长相**：路人是普通人，长相要朴素、多样（年龄、胖瘦、肤色、五官各异），避免和具名人物撞脸；成年人一律成年样貌。本批不做儿童路人。

## 约束
- 只写：
  - `docs/design/catalog/npcs-commoners-era.md`
  - `assets/default/prompts/characters/commoners/**`
  - 本任务报告
- 不改 `npcs-commoners.md` 和其他文档。需要的改动写进报告第 6 节。
- 史料没把握的标（待核实）；不写真人姓名。
- 每次写入 ≤ 150 行；提示词逐个文件写。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 各时代形象数；
- 最常用的 30 个形象（建议先出）；
- 职业枚举需要补的项。

报告 ≤ 80 行。

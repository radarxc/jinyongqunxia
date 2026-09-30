# 本任务：人物立绘提示词 · 书界 {{book_no}}《{{book_name}}》（每个人物一份可直接出图的提示词文件）

本任务只写提示词文件，**不出图**，不改策划 / 技术文档。上面"规则"一节里关于策划 / 技术文档格式的条目不适用；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者 2026-09-30 原话：

> 将所有人物立绘的prompt写到一个目录下（加上一个index md，索引各个人物的prompt，并指挥生成文件存到assets对应的人物目录里）。写好以后把这个index md的path发给我

协调者把它拆成按书界并行的任务：每个书界一个任务，给该书界人物名录里的**每一个具名人物**写一份立绘提示词文件；总索引 `assets/default/prompts/characters/INDEX.md` 由协调者在全部任务合入后用脚本生成（读每份文件的 frontmatter），生成与存放规程由另一个任务写。所以本任务产出的每份文件都必须严格按下面的格式，机器要读。

本任务的范围：`{{catalog}}` 人物表里的全部 `npc_*`（每行一个人物）。输出目录：`{{out_dir}}/`，每个人物一个文件 `<npc_id>.md`。

## 必读资料

- 风格与作者意见：`assets/default/STYLE.md`（作者原文、各类风格规则、通用约束、**审批记录里作者逐条意见**）。
- 提示词模板（以最新的返修版为准，只读）：
  - 男：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md`（不存在就用本工作区的 `assets/default/prompts/character-male.md`）
  - 女：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md`（不存在就用本工作区的 `assets/default/prompts/character-female.md`）
  模板里的风格关键词、构图与画幅、年代与服饰表、排除项清单、可复用提示词骨架、质检要点，都是本任务的基准。
- 已有基线的完整提示词（写法参考）：`assets/default/baseline/character/male/manifest.yaml`、`assets/default/baseline/character/female/manifest.yaml`。
- 人物资料：`{{catalog}}`（身份、生卒 / 年龄、门派、层级、能力）、`{{chapter}}`（首领配装、兵器、出场阶段）、`{{story}}`（剧情阶段与关键场景）、`docs/design/18-npc-and-companions.md`（年龄段、跨书重逢）、`docs/design/17-sects-compendium.md`（门派与服饰背景）、`docs/design/02-timeline-and-world-tiers.md` §1（本书界年代）、武学图鉴（标志性兵器与招式）、`docs/design/10-items-and-equipment.md`（具名兵器形制）。
- 规格：`docs/tech/07-asset-generation.md` §1.3（立绘母版规格）、§1.4（`por_` ID 与变体键）、§2.6（头身比）、§2.7（服饰时代感）、§2.9 与 §9（禁止项）、§3（品质分档 S / A / B）、§5.2（立绘管线）。

## 每个人物要做的事

1. **定人物阶段**：本书界里这个人的年龄段、身份、剧情阶段（用名录与剧情文档定；跨书界重复出现的人物，只写**本书界**这一版，年龄与状态按本书界）。
2. **收集可画的依据**，分三类登记，不要混：
   - 名录 / 章节 / 剧情文档里写明的（身份、门派、兵器、武学）；
   - 你有把握的原著描写（体貌、衣着、标志物）——只写概括，不编造引文、回目号、页码；没逐字核对的标（待考）；
   - 原著没写、由你补足的美术设计（脸型细节、配色、衣装选款、姿态）——标（原创扩展）。
   **原著里的经典形象与标志物要画出来**（作者对小龙女的意见原话："增加白手套，佩剑，和铃铛""这是书中的经典形象"）：例如打狗棒、玄铁重剑、独臂、判官笔、拂尘、红衣、轮椅等，凡原著明确且属于本书界阶段的，都写进提示词；不属于本阶段的（后期才得到的兵器、官爵、伤残）不要提前画。
3. **定画法**：
   - 男性偏写实，女性偏美丽（STYLE.md）；英雄型要有英雄气与魁梧体格，浪子型要松弛飘逸，发式整齐与否服从人物（作者对萧峰、令狐冲的意见见审批记录）。不同人物的脸型、体型、年龄感要拉开，不要千人一面；同门派可以共享服色语汇，但每人要有自己的识别点。
   - 服饰发式按本书界年代、地区、族群、身份（模板 §3 年代表与 tech/07 §2.7）；汉式交领一律右衽；僧、道、尼、官、兵、异族各按身份。
   - 未成年人物按实际年龄画，衣着完整得体，不做成人化、性感化处理；老人、伤残、毁容、肥胖、矮小等特征如实表现，不丑化。
   - 非人形人物（如神雕）按生物立绘写，`gender: other`。
4. **写提示词**：按模板 §5"可复用提示词"的骨架写成**完整、可直接交给 image_gen 的一整段**（不留占位符），包含：用途与素材类型、题材（姓名、`npc_id`、年龄段、身份与阶段）、书界与年代、参考图用法、人物骨相体型神态、服装与发式、动作与兵器道具、构图（竖幅 2:3、单人全身、人物占画高约 88–92%、头足与兵器端点全部入画）、画法与光线、背景（统一不透明暖浅灰纸底、无场景、无文字）、排除项。排除项在模板 §4 通用清单基础上补该人物 / 年代的专项禁用（例：不要提前画后期兵器、不要清式发辫出现在明代人物上）。
5. **禁止项**（tech/07 §2.9、STYLE.md 通用约束）：提示词正文与排除项里都不写演员名、画师名、影视 / 游戏公司或具体改编作品名；不要求"像某某版"；作者提到的"港版 / 育碧 / 著名游戏"只取气质方向。人物名、书界名、朝代可以写。
6. **参考图**：`references` 只列仓库里已有的同性别基线参考图路径与用途（只约束纸底、光线、笔触、设色，不沿用参考人物的脸、体型、服饰）；本人已有基线图的（萧峰、令狐冲、王语嫣、小龙女），把本人的基线图列在第一位并注明"同一人物，保持面容与造型延续"。基线图是否已通过审批以 manifest 的 `status` 为准，如实写进用途说明。

## 文件格式（严格遵守，脚本按此读取）

每个人物一个文件 `{{out_dir}}/<npc_id>.md`：

```markdown
---
asset_id: por_<npc_id>__{{book_key}}_base        # tech/07 §1.4；同一人物在别的书界名录里也出现，或本书界内有多个阶段 / 状态时，加年龄或状态变体键，如 por_npc_guojing__ch03_prime_base、por_npc_yangguo__ch03_prime_onearm_base
subject_id: <npc_id>
name: <中文名>
book: {{book_key}}_{{book_slug}}
gender: male | female | other
age_variant: child | youth | prime | elder       # 本书界的年龄段
tier: S | A | B                                   # tech/07 §3：S 主角团与主 Boss；A 重要 NPC；B 次要
output: assets/default/character/<gender>/{{book_key}}/<asset_id>.png
manifest: assets/default/character/<gender>/{{book_key}}/manifest.yaml
references:
  - path: assets/default/baseline/character/<…>.png
    use: <用途一句话>
status: ready
---

# <中文名> · 《{{book_name}}》（{{book_key}}）

## 人物要点

| 项 | 内容 | 依据 |
|---|---|---|
| 身份与阶段 | … | 名录 / 章节 §x / 剧情 §x |
| 年龄与体貌 | … | 原著概括（待考）/ 名录 |
| 服饰与发式 | … | 年代规则 / 原创扩展 |
| 兵器与标志物 | … | 图鉴 / 原著概括（待考） |
| 气质与姿态 | … | 原著概括 / 原创扩展 |

## 提示词

```text
（完整提示词，一整段到底，不留占位符）
```

## 排除项

（完整排除项：通用清单 + 本人物专项）

## 质检要点

- （3–6 条这个人物特有的检查点：标志物、年龄感、服饰形制、易错处）
```

`gender` 只写一个值；`output` 与 `manifest` 里的 `<gender>`、`<asset_id>` 必须与前面的字段一致。`references` 没有就写 `[]`。不要在 frontmatter 里加别的键。

## 通用

- 每个文件控制在约 60–110 行；每次写入不超过约 150 行，分多次写；全部人物写完再写报告。
- 名录里每个 `npc_*` 都要有文件，一个不漏；不要给名录之外的人物新造 `npc_*`。
- 不改名录、章节、剧情、模板与 `assets/default/baseline/`。

检查：以下命令必须通过。
- `python3 tools/agents/check_portrait_prompts.py --dir {{out_dir}} --book {{book_key}} --catalog {{catalog}}`

## 报告

第 7 节写：人物清单（npc_id / 姓名 / 性别 / 年龄段 / 品质档 / asset_id）；跨书界人物与本书界所取变体的说明；各人物"原著经典标志物"清单；标了（待考）的原著外貌项汇总；需作者确认的事项（附默认值，如某人物是否沿用他书界的造型延续）。

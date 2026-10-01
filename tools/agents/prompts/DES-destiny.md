# 本任务：设计补充 · 书界 {{book_no}}《{{book_name}}》主要悲剧线的逆天改命机会（AR-20）

本任务改策划文档，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-20**：「每个书中主要悲剧线要设计逆天改命机会（例如乔峰不死）」。改命的总规则已在 `docs/design/01-vision-and-core-loop.md` §4–§7（隐藏高难分支；要提前埋线、满足隐藏条件并支付代价；成功只写入本界结局、天书之力变体、后世回响与终局书契；下一书界仍从原著锚点起步；原创扩展须标注）与 `docs/design/13-progression-and-endings.md`（改命结局与代价）、`docs/decisions/author-requirements.md` AR-09c / AR-10a。本任务按这些规则给**本书界**具体方案。

## 输入

- 剧情：`docs/design/story/{{story_file}}`（原著重要剧情与走向清单、正线 / 邪线各幕）；章节：`docs/design/chapters/{{chapter_file}}`；人物名录 `docs/design/catalog/npcs-{{book_slug}}.md`。
- 改命总览：design/01 §4–§7 本书界锚点行；design/13 §改命。

## 要做的事

1. **列出本书主要悲剧线**（3–6 条）：原著命定的死亡 / 离散 / 身败名裂 / 不可挽回的遗憾（例如天龙：乔峰雁门关自尽、阿朱误死、游坦之、阿紫…），每条写：原著走向、关键节点（回目）、游戏里对应的剧情节点 / 任务。
2. **为每条设计一个逆天改命机会**（表格 + 分节细写）：
   - 埋线：至少 2 条前置线索（对话 / 物品 / 关系 / 技艺），分散在前中期；书灵分层提示的措辞；
   - 隐藏条件：关系值 / 技艺或战力阈值 / 持有物 / 时间窗（与剧情 DAG 的时限对应）/ 立场；
   - 关键行动：玩家在哪个节点、做什么（可能是战斗、护送、证物、劝说、代替赴险）；
   - 代价：design/13 的代价类型（天书之力、同伴、声望、后世回响）具体化；
   - 结果与世界状态：成功后本界结局变体、后续节点怎么分叉、哪些原著事件因此不发生 / 变形；失败分支；
   - 边界：不得改写下一书界的原著起点（design/01 史自愈）；原创扩展标注；原著事实（待考）标注。
3. 写进 `docs/design/story/{{story_file}}` 新增一章"逆天改命机会（AR-20）"（或已有改命章节的扩写），章节文档 `docs/design/chapters/{{chapter_file}}` 若有结局 / 分支表，同步一行。**不改 `docs/design/01-vision-and-core-loop.md`**（十四个书界并行改同一张表会冲突）：要加到 design/01 锚点行的引用句写在报告里，由协调者统一加。

约束：每次写入 ≤ 150 行；不新造 npc_* / q_* ID（需要新任务 ID 的写【建议 ID】交 design/12 登记）；不改其他书界；只写 `docs/design/story/{{story_file}}` 与 `docs/design/chapters/{{chapter_file}}` 两个文件。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：悲剧线清单与改命方案摘要表；新增【建议 ID】；与 design/13 代价表的对应；需作者确认（附默认）。报告 ≤ 100 行。

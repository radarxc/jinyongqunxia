# 本任务：故事线挂接口 · {{group_title}}（各书休眠事件 + 《长生诀》支线接入 `story/NN` 与 `chapters/NN`；AR-26）

本任务改策划文档，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读（按顺序）：
- `docs/decisions/author-requirements.md` AR-26（《长生诀》主线、休眠事件、一命换一命）；
- `docs/00-canon.md` §2 书序（现行序：白马 → 天龙 → 射雕 → 神雕 → 倚天 → 笑傲 → 侠客 → 碧血 → 鹿鼎 → 连城 → 鸳鸯 → 书剑 → 飞狐 → 雪山；鹿鼎第九层之后不再休眠，改周游世界）；
- `docs/design/25-changshengjue.md`（层数、休眠事件框架、3+3 取舍）；
- `docs/design/story/sleep-events.md`（§1 总表、§2 通用契约、本组各书的小节、§6 九层失败保护）与报告 `tools/agents/reports/DES-sleep-events.md` §6；
- `docs/design/story/changsheng-sidelines.md`（§1 契约与 `story.v1` 映射、本组各书的任务卡 / 节点 DAG / 后果、§9 和氏璧线）与报告 `tools/agents/reports/DES-changsheng-sidelines.md` §6；
- 本组各书的 `docs/design/story/NN-*.md`、`docs/design/chapters/NN-*.md`（先 `grep -n '^#'` 看目录，只读结局 / 书眠 / 任务索引 / 场景表相关小节）。

## 本组范围
{{books}}

## 要做的事（每本书都做；引用而不重定义：事件与支线的定义只在 `sleep-events.md` / `changsheng-sidelines.md`，这里只挂接口）
1. **`story/NN` 书眠接口**：在该书主线 DAG 的结局 / 收束节点之后挂「书眠」节点：列出本书的保底事件与路线候选（ID 照 `sleep-events.md` §1 总表），各自的触发条件摘要（`requires` 用该文 §2.2 的求值规则，不自造条件）、`entryKnot` 命名（`sleep.<NN>.<slug>.entry`）、优先级、`fallbackId`，以及苏醒衔接到下一本书的最前期（按现行序）。原结局节点不删，改为通向书眠节点。鹿鼎及以后的书：事件只对「未练成第九层」的玩家触发，第九层已成则走 design/25 的周游世界（不眠），两条都写明。
2. **`story/NN` 支线接口**（本组里有《长生诀》支线的书）：加 `side_changsheng_01` 的 `sideHook`：起点节点、挂在主线哪些节点之后（至少三个场景挂点，照 sidelines 任务卡的时间窗）、完成后获得的层数与奖励引用、与主线隔离 / 失败 / 错过的规则引用（sidelines §1.4：不得跨书重开补证）。
3. **`chapters/NN`**：在任务索引 / 场景表 / 书眠节登记：支线任务 `q_NN_changsheng_01` 与 `dc_*`（ID 照 sidelines 文内，不改号）、时间窗与至少三个场景挂点；休眠事件在本章的入眠地点（`placeKey` 或已有场景 ID）与苏醒入口；本组特殊项见下。
4. 年份与书序：**白马年份以协调者裁定为准，702–703 年（唐，武周长安年间）**，白马为第一本正式书，白马 → 天龙为 391 年；`DES-sleep-events` 报告 §6 里「同步为约 640–641」那一行已被裁定推翻，不要照它改。连城 → 鸳鸯的后书接口按现行序写，年差写出算式（取两书 `gameYear` 相减）。
5. 所有新增条目标**（原创扩展）**；原著回目 / 情节没把握的标（待考）；不新建 `slp_` / `side_` / `end_` ID，不新建 `q_` / `dc_` 号（用 sidelines 已登记的）。

## 本组特殊项
{{special}}

## 约束
- 只写：{{writes_list}}、本任务报告。
- 不改 `sleep-events.md`、`changsheng-sidelines.md`、`design/25`、canon、其他书。
- 每本书每次写入 ≤ 150 行；分多次写。改完 `grep -n` 核对：书眠节点、sideHook、chapters 登记三处都在。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节按书列表：书眠节点 ID 与挂在哪个节点后、候选事件、sideHook 起点与三个挂点、chapters 登记行号；第 6 节写发现的跨书不一致。报告 ≤ 60 行。

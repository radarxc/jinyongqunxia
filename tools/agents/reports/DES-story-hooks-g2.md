# DES-story-hooks-g2 报告 · 故事线挂接口 · 第二组：神雕、倚天、笑傲（休眠事件 + 长生诀支线接入 story/NN 与 chapters/NN，AR-26）

## 1. 摘要（3–6 行）
已将神雕、倚天、笑傲的既有四类结局分别汇入本书 `n_NN_booksleep`，并按上游定义登记保底 / 路线候选、`entryKnot`、优先级、回退、入眠点和下一书入口。
已把《长生诀》第五至七层以 `sideHook` 接入三书主线时间窗，并在 chapters 的任务索引、场景表与书眠段完成同号登记。
支线失败不污染主线；错过后只可在本书天书取得后至 `BS_COMMIT` 前补证，跨书不得重开或自动补层。
三段年代分别按 `1336−1259=77`、`1523−1363=160`、`1582−1525=57` 核算；未采用已被推翻的白马 641 / 452 年口径。

## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要新增 / 调整 |
|---|---:|---|
| `docs/design/story/03-shendiao.md` | 1714 | 主 DAG、§7.4 书眠、§7.5 第五层 `sideHook`、校验与建议值 |
| `docs/design/story/04-yitian.md` | 2069 | 主 DAG、§7.5 书眠、§7.6 第六层 `sideHook`、校验与建议值 |
| `docs/design/story/05-xiaoao.md` | 1411 | 主 DAG、§7.5 书眠、§7.6 第七层 `sideHook`、校验与建议值 |
| `docs/design/chapters/03-shendiao.md` | 1894 | §3 场景、§6.5 任务、§11.6 书眠、测试 |
| `docs/design/chapters/04-yitian.md` | 1919 | §3 场景、§6.3 任务、§11.3 书眠、测试 |
| `docs/design/chapters/05-xiaoao.md` | 1773 | §3 场景、§6.3 任务、§11.3 书眠、测试 |
| `tools/agents/reports/DES-story-hooks-g2.md` | 54 | 本报告 |

## 3. 关键结论与数值
### 神雕
- 书眠：四结局完成各自状态写入后接 `n_03_booksleep`（story 89、1202、1211）；候选 `slp_03_xiangyangxiexing`（20，回退 `slp_03_gumushouyue`），保底为后者（10，`null`），77 年后醒于 `sc_04_qingyuan_wreck`。
- 支线：`q_03_changsheng_01` 从 `n_sj_oldmark` 起步，4→5；挂古墓、绝情谷、断肠崖、华山（story 1223–1227）。chapters 登记：场景 237–242、任务 541、书眠 1378–1385。
### 倚天
- 书眠：`z_canon/z_fate/x_canon/x_fate` 后接 `n_04_booksleep`（story 114、1389、1393）；候选 `slp_04_haishoutingchao`（20，回退 `slp_04_guangmingxieqi`），保底为后者（10，`null`），160 年后醒于 `sc_05_fuzhou_yilu`。
- 支线：`q_04_changsheng_01` 从 `n_yt_echo` 起步，5→6；挂襄阳废墟 / 峨眉金顶、丐帮密厅、屠狮会、开封旧库（story 1412–1416），真璧入匣。chapters 登记：场景 192、240、252、287，任务 600，书眠 1266–1273。
### 笑傲
- 书眠：四收束完成各自状态写入后接 `n_05_booksleep`（story 110、874、878）；候选 `slp_05_jianghuyuanqu`（20，回退 `slp_05_siguotingxian`），保底为后者（10，`null`），57 年后醒于开封府东门外驿路，再进 `sc_06_houjianji`。
- 支线：`q_05_changsheng_01` 从 `n_xa_stone` 起步，6→7；挂思过崖、梅庄地牢、黑木崖大殿、封禅台（story 901–905），真璧只读且不离匣。chapters 登记：场景 208、222、236、250，任务 614，书眠 1188–1195。
- 共通：事件 `requires` 依 `sleep-events.md` §2.2，支线 DAG / 后果依 `changsheng-sidelines.md`；本组只挂接口，不重定义，也未新建 `slp_` / `side_` / `end_` / `q_` / `dc_` 号。

## 4. 开放问题（附默认值）
- 休眠候选 / 保底优先级尚待工程调度定稿；默认沿上游 SE-D01 的 20 / 10 **【建议值】**，失效只回本书保底。
- 无阻断性交互问题；保留六份原文既有开放项及默认值，本任务未越权删除或代作者裁定。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增提案：书序、年代、3 门武功 + 3 门内功、《长生诀》不占名额及九层前休眠均已有基准 / `design/02` / `design/25` 依据。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/story/sleep-events.md` | §3、文末依赖 | 仍写白马约 641 年、白马→天龙 452 年；应按现行裁定改为 702–703 年、转场锚 702、`1093−702=391`。 |
| `tools/agents/reports/DES-sleep-events.md` | §1、§3、§6 | 同步撤销 641 / 452 的旧结论与下游要求；该报告不能覆盖 Canon v1.10。 |
| `docs/design/12-quests-npc-factions.md` / 工程事件调度 | 休眠事件选择器 | 接纳优先级 20 / 10 建议值，并实现候选失效回本书保底及唯一 `BS_COMMIT`。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 六份授权文档均完成“结局→书眠节点”、候选 / 保底、下一书苏醒与精确年差；三书均早于鹿鼎，未误写九层后周游分支。
- ✅ 三条既有长生支线均登记起点、至少三处主线 / 场景挂点、层数结果、失败与跨书封窗；未复制上游 DAG 定义。
- ✅ chapters 均完成任务索引、场景表、入眠地点、苏醒入口与回归测试登记；所有新增接口均标**（原创扩展）**。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过（新增严格失败 0；仅报告仓库基线 `docs/README.md:185` 的 `sk_babuganchan` 未定义）；`git diff --check` 通过。
- ✅ 仅六份指定策划文档与本报告有改动；未修改 Canon、任务清单、上游定义文档，未执行改变仓库状态的 git 命令。
- ⚠️ 需作者确认（附默认）：休眠候选 / 保底优先级默认采用 20 / 10 **【建议值】**，待工程调度定稿；当前默认不阻断接口交接。
- ✅ 交下游 `ENG-*`（`TODO.md` 已登记 `ENG-28a`）休眠字段：`chapterId`、`nextChapterId`、书眠汇流节点、事件 `id`、`requires`、`priority`、`entryKnot`、`sleepScene/placeKey`、`wakeRef`、`fallbackId`、唯一 `BS_COMMIT`。
- ✅ 交下游 `ENG-*`（`ENG-28a`）支线字段：`questId`、`lineId`、`startNodeId`、`sideHooks`、常规时间窗、`fromLayer/toLayer`、余韵 `proofMode`、跨书封窗；倚天须使 `heshibiState` 入匣，笑傲须只读且不离匣。

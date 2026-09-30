# ART-P-guide 报告 · 人物立绘提示词 · 生成与存放规程（GUIDE.md）

## 1. 摘要（3–6 行）

- 已完成可独立交给 GPT CLI 会话使用的生成与存放规程，覆盖读提示词、参考输入、候选生成、自查、原字节入库、登记、校验和审批。
- 默认每人物 2 张候选，发现缺陷时补至单轮最多 4 张，最终选 1 张；按书界分批、批内 S → A → B，同档优先本人已有已批准基线。
- 明确图片 `candidate/approved` 与提示词 `draft/ready` 分开，局部编辑底图与新人物风格基线分开，获批文件和条目逐字节不动。
- 已记录正式人物审批工具尚未接通、主角与 NPC 共用书界 manifest、索引嵌入方式与任务描述不一致等交接项。
- 本轮只创建 GUIDE 与报告；未出图、未改其他文件、未执行改变仓库状态的 git 命令，指定 GUIDE 检查已通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `assets/default/prompts/characters/GUIDE.md` | 173 | 九节：使用与批次、输入核对、参考、生成与自查、复制与实测、登记、校验审批、并行、常见问题与默认值 |
| `tools/agents/reports/ART-P-guide.md` | 100 | 本报告七节，含依赖文件、差异与验收记录 |

未创建 `INDEX.md`；其生成归协调者，目标路径仍为 `assets/default/prompts/characters/INDEX.md`。当前工作副本尚无并行任务的人物分组文件，不把示例路径当作本轮已交付内容。

## 3. 关键结论与数值

| 项 | 结论 / 来源 |
|---|---|
| 候选与入库 | 每人物默认 2 张，缺陷时补至 4 张【建议值】，引用 `ART-rework.md` 的 2–4 张范围；合格时入库 1 张，全不合格时入库 0 张，单独记录返修 |
| 批次 | 默认 `ch00` 主角首次形象 / 书灵前置，然后 `ch01` → `ch14`；书界内 S → A → B，同档本人已批准基线优先；跨书身份链先完成较早版，再做较晚版 |
| 画幅与规格 | 竖幅 2:3；目标占高 88–92% 引用 tech/07 §1.3；正式母版为 2048×3072 RGBA，本批登记工具实测尺寸 / 模式，1024:1536 = 2:3 仅为示例，不声称本轮生成或实测 |
| 文件有效性 | 文中首次复制代码验证 PNG、`宽×3 = 高×2`、短边 ≥512，最后一项来自 `check_assets.py` 默认值；复制后原字节一致、禁止覆盖已有目标 |
| 清单计数 | `N = 生成前图片条目数 + 新增入选数`，已有候选返修增量为 0；`--min N --max N` 不取生成候选数，也不沿用基线目录最多 2 张 |
| 主角结构检查 | 全组最低 31 份 = 2 性别 × 15 时代 + 1 书灵，引用 `ART-portrait-pc.md`；不是本轮清点到的文件数 |
| 元数据 | 逐项覆盖 README 的 17 个字段；`file` 相对 manifest 所在目录，`source_path` 为真实原图绝对路径，时间取源 PNG UTC mtime，SHA-256 实测 |
| 审批边界 | 新图均 candidate；GPT PASS 后上作者审批页，作者通过当前哈希版本才 approved；提示词状态保留 draft/ready；候选作自身编辑底图不获得风格参考资格 |

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 后续处理 |
|---|---|
| 每人物候选张数是否统一 | 默认 2 张、缺陷补至单轮 4 张、选 1 张；不按 S/A/B 自动扩大候选量，需变更由作者或后续任务明确 |
| 批次顺序是否调整 | 默认 ch00 前置，随后 ch01 → ch14；批内先 S/A/B，再按本人已批准基线优先；无依赖书界可并行 |
| 是否允许未通过审批的基线作为参考 | 默认不允许；仅针对该候选自身的已授权局部返修允许编辑输入，不扩展到新人物 |
| `other` 缺生物 / 抽象书灵基线 | 默认另派基线任务、该行暂缓；不借用男女人像，也不把空 references 视为批准豁免 |
| 旧版获批但同 ID 新版正在返修 | 默认暂缓该参考，由协调者确认生产版本；不把旧批准套到新哈希，不自行取另一工作副本的图 |
| 正式人物的审批页与回写 | 默认交协调者接通正式目录；接通前保留 candidate 和待审清单，不以本轮文档任务代作作者审批 |
| 作者要求修改已获批正式图 | 默认保留旧 PNG 与条目，由协调者明确新版本 ID、路径与写集后再返修，不泛用历史基线任务的覆盖授权 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| 无 | 不新增基准修改提案 | 本任务定义操作顺序与登记办法，不新增人物、玩法 ID、规格或原著事实；旧工具 / 存储口径需同步现有作者决定，见第 6 节 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

以下均只登记，未修改对应文件。

| 文档 / 工具 | 位置 | 改什么 |
|---|---|---|
| `tools/review/build.py`、`tools/agents/apply_reviews.py` | 基线根路径 / CATS 与 `Path(a.style, "baseline").rglob(...)` | 扩展正式 `assets/default/character/<gender>/<chNN>/` 的上页与审批回写，保留哈希绑定及已批准条目字节保护；现有脚本不能直接完成正式人物审批 |
| `tools/agents/build_portrait_index.py` | `render()` GUIDE 嵌入分支 | 实际会去掉 GUIDE 一级标题、把其余标题降两级，并非任务所说“原样嵌入全文”；由协调者统一契约。GUIDE 不依赖自身标题锚点，不为规避此差异越权改脚本 |
| `tools/agents/prompts/ART-portrait-book.md`、`ART-portrait-pc.md` | 参考图规则与后续出图交接 | 提示词可列出现存候选基线路径，但生成入口只接受当前版本 approved；未批准路径须先等待或经负责人修正，不能原样当输入 |
| 后续正式人物生成任务的写集与调度配置 | 主角分组、各书界分组 | 主角提示词虽在 protagonist，输出仍共享各书界 manifest；统一交对应书界写入者，或分时释放目录，禁止同时追加 |
| `docs/tech/07-asset-generation.md` | §0 / §4 / §5.2 / §6.1–§6.2 | 同步作者已指定 GPT CLI / image_gen、分类风格与二进制入库；区分本批原图、正式 RGBA 母版及后续规格化，不把本规程的 2–4 张扩成设定卡候选数 |
| `docs/tech/06-asset-storage.md`、`docs/decisions/author-decisions.md`、`TODO.md` | 存储约定、P02 / P57、素材线摘要 | 继续落实 ART-B 男女报告已提出的工具 / 二进制口径同步；保留旧决定追溯，按 STYLE 的新作者原文更新 |
| `assets/default/prompts/character-male.md`、`character-female.md` 与对应基线清单 | 最新返修合入 | 合入 ART-R2-male / ART-R1-female 后复核本规程引用章节和供生产版本；本工作区仍有旧模板及旧批准记录，不以模板说明代替 manifest 版本核对 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 验收与章节清单

- ✅ GUIDE 为中文祈使步骤，共 173 行，位于要求的约 120–200 行区间；初稿分两段写入，每次写入少于约 150 行，全文已复读，无截断句、未闭合围栏或遗留占位说明。
- ✅ §1“使用索引与安排批次”：一行一立绘，分档顺序、本人基线优先、书界批次与候选数均明确。
- ✅ §2“步骤一：读文件并核对身份与路径”：11 个 frontmatter 键、四节正文、身份阶段、路径和 ID 查重均覆盖。
- ✅ §3“步骤二：准备并实际载入参考图”：同性别 approved、本人第一、view_image 与绝对路径、实际输入登记、跨书等待及缺基线处理均覆盖。
- ✅ §4“步骤三：生成候选并逐张自查”：原样完整提示词加排除项、image_gen 参数、2:3、逐张 view_image、人物专项与通用质检及择优规则均覆盖。
- ✅ §5“步骤四：按 output 原字节存放并实测”：给出可直接执行的 Python 命令块，自动建目录、拒绝覆盖、复制、验证尺寸和哈希；区分本批实测与正式母版。
- ✅ §6“步骤五：追加 manifest 登记”：顶层列表、17 字段、实际完整文本 / 参考、candidate 状态、源时间与获批字节保护均覆盖。
- ✅ §7“步骤六：校验、交审与返修”：两种现有校验器命令及参数、GPT → 作者审批、局部编辑优先、候选与获批版本边界均覆盖。
- ✅ §8“并行分工与跨书一致性”：每书界独占目录 / manifest、主角共享目录冲突与跨书同一人参考顺序均覆盖。
- ✅ §9“常见问题与开放问题（附默认值）”：参考未批、事实冲突、文字 / 水印 / 手部、标志物出错、候选张数 / 顺序 / 未批基线默认值均覆盖。
- ✅ 指定 `python3 -c` 的 GUIDE 行数 / 二级标题检查退出码 0；额外文本与 shell / Python 命令语法检查通过，`git diff --check` 无报错。
- ⚠️ 本轮未调用 image_gen / view_image，未执行文中的复制命令，也未为人物分组跑出图后的资产校验；无生成产物可供验证。未跑索引生成或全组结构检查，因人物文件由其他任务合入，不能冒称整条生产管线已实测通过。
- ✅ 仅创建两条授权路径；未修改基准、进度、模板、脚本、图片或 manifest，未执行提交、推送、切换、暂存等 git 状态变更命令。

### 7.2 引用到的仓库文件清单（变更时复核规程）

- 事实层：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md`、`docs/00-canon.md`、`docs/decisions/rulings-v1.md`。
- 风格与登记：`assets/README.md`、`assets/default/STYLE.md`、`assets/default/prompts/character-male.md`、`assets/default/prompts/character-female.md`、`assets/default/baseline/character/*/manifest.yaml`。
- 最新只读模板来源：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md`、`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md`；两者均存在，本轮实际读取，未使用旧版代替新规则。
- 规格与人物依据：`docs/tech/07-asset-generation.md`、`docs/design/01-vision-and-core-loop.md`、`02-timeline-and-world-tiers.md`、`18-npc-and-companions.md`；按目标人物读 `docs/design/catalog/npcs-*.md`、`chapters/*.md`、`story/*.md`，标志物回查 `catalog/skills-*.md` 与 `10-items-and-equipment.md`。后者为运行规程路由，本轮未逐册重考原著。
- 任务与检查契约：`tools/agents/prompts/ART-portrait-book.md`、`ART-portrait-pc.md`、`ART-baseline.md`、`ART-rework.md`；`tools/agents/check_assets.py`、`check_portrait_prompts.py`、`build_portrait_index.py`、`gpt_review.py`、`apply_reviews.py`、`tools/review/build.py`。
- 索引与逐人输入：`assets/default/prompts/characters/INDEX.md` 及各分组人物提示词，生成后持续维护；本轮不产出这些文件。
- 现状与历史报告：已读 `TODO.md` 相关章节、`tools/agents/reports/ART-B-male.md`、`ART-B-female.md`，并核对外部工作副本的 `ART-R2-male.md`、`ART-R1-female.md` 相关返修 / 审批记录；这些历史记录用于区分旧批准与新候选，不作为永久当前状态。

### 7.3 与现行出图任务提示词的差异

- 相对 `ART-baseline.md`：从每类别留 1–2 张 ref 基线改为每 asset_id 留 1 张 por 立绘；正式批次必须消费已批准参考；不复用基线的 `references: []` 和目录数量上限。
- 相对 `ART-rework.md`：保留 2–4 张、自查、candidate、实际全文登记；将默认起点明确为 2 张。新入库只追加，已存在的候选仅在授权返修时更新，不照搬“覆盖同名文件”到获批图。
- 相对男模板允许的跨性别风格参考：本任务新图收紧为同性别；相对女模板历史返修把候选存入 revisions，本任务明确淘汰候选不入库；相对女模板可按任务七分身，本批统一完整全身。
- 相对 tech/07 的完整立绘管线：本规程仅交付当前工具原图与溯源，不执行 turnaround、多视图参考集、表情差分、抠图、放大或运行时导出；B 档也执行本任务要求的逐张自查。
- 相对提示词编写任务：生成时必须重新核对参考状态 / 哈希；提示词 ready 只表示可执行文本，不能代表图片获批。主角与 NPC 提示词分组分离不代表输出目录隔离。
- ⚠️ 需作者确认且已有默认值：每人物默认 2 张、补至 4 张、选 1 张；ch00 前置后按 ch01→ch14、批内 S/A/B；未批基线默认不用于新图。均已列入 GUIDE §9 与报告第 4 节，本轮未向作者停下来提问。

# 运维处置手册（OPS_RUNBOOK）

写给接手开发监督执行性工作的 GPT（`tools/agents/ops_dispatch.py` 及其处置会话）。这里收录开发监督 2026-10-03 一整天实际用过、协调者认可的规则。每类事件都按同一结构写：怎么判、怎么办、什么时候报协调者。

- 拿不准的事不要自己定，往 `.agents/coord/_inbox/ops.md` 写一行「【请判断】……」交协调者。
- 协调者的裁定高于本手册；作者的需求（AR-xx，见 `docs/decisions/author-requirements.md`）高于协调者。

---

## 0. 铁律（任何情况下都不破）

1. **门禁、阈值一律不放宽**：
   - 不改 `tools/perf/budgets.json`，不改性能断言；
   - 不在任何测试里加「高负载跳过 / 放宽」逻辑（AR-33）。
   - 计时门只能挪到 `pnpm check:perf` 低负载单独跑，而且要协调者拍板（AR-33、AR-64 先例）。
2. **`_prod` 集成分支保持干净**：
   - 改了文件立刻按路径提交：`git add -- <路径> && git commit -- <路径>`；
   - 永远不用 `git add -A`、`stash`、`reset`、`push`；
   - 撞上 `index.lock` 就等几秒重试。
3. **不在 `/private/tmp` 或其他临时目录做整仓检出**，不复制整份 `assets/`（_common 规则 12）。
4. **磁盘**：
   - 可用空间 < 5 GiB 时不新开任何工作区；
   - < 2.5 GiB 时立即报协调者。
5. **不往执行器的提示词或正在跑的工作区里注入文字**：执行器会把它当成捷径。要补说明，只能走 `--note`，配合 `--from start` 或续作。
6. **不停别人的进程**：
   - 只能停自己起的驱动；
   - 协调者的守候、出图线进程、eng3 调度器等一律不碰，需要停时报协调者。
7. **只读日志尾部**：大日志（几十 MB）只看 `tail -c`，或按关键字 grep，不整份读入。

## 1. 常用工具

| 用途 | 命令 / 文件 |
|---|---|
| 起驱动，脱离进程树 | `python3 .agents/coord/_handoff/detach_launch.py .agents/coord/<ID>/supervise.out . -- python3 tools/agents/supervise.py <ID> --max-reviews 1 --max-runs 3 --auto-merge --worker --checks .agents/coord/PROD/review_checks_<eng/content/des>.md [--from start/validate/review] [--note 文件]` |
| 执行器与审核模型 | `.agents/coord/executor_override.json`（AR-65：Codex gpt-6.1-sol xhigh，回退 gpt-6-astra），每次 start / 审核现读 |
| 挪基点 | `python3 .agents/coord/_handoff/rebase_task.py <ID>`：执行器在跑时拒绝；冲突标记留在工作区；会写备份引用 |
| 合入预演，不动工作区 | `git merge-tree --write-tree --name-only --merge-base=<任务提交的父> HEAD <任务提交>` |
| 等工作树干净再合入 | `python3 .agents/coord/_handoff/merge_when_clean.py <ID>` |
| 等某件合入后挪基点、重新校验 | `detach_launch.py .agents/coord/<ID>/waiter.log $PWD -- python3 -u .agents/coord/_handoff/after_merge_revalidate.py <依赖ID[,依赖ID]> <ID> -- <原 supervise 参数>` |
| 池占用、排队与名单预演 | `python3 tools/agents/step.py pool --pool code [--file 草稿]` |
| 池上限 | `tools/agents/tasks.json` 里 `defaults.max_parallel.<池>`；排队中的 start 每轮重读，立即生效 |
| 池位优先级 | `.agents/coord/pool_priority.txt`：每行一个 ID，`#` 起注释，越靠前越先拿空位；删掉文件 = 原行为 |
| 集成分支全量检查 | `zsh .agents/coord/_handoff/prod_check.sh <标签>`：日志在 `_handoff/prod_check_<标签>_HHMM.log` |
| 性能门，低负载跑 | `pnpm check:perf`：rig 门与 BattleSession 线性门 |
| 交接记录 | `tools/agents/HANDOFF.md`：每次处置追加一条，按路径提交 |

## 2. 事件处置

### 2.1 合入冲突（状态 READY，detail「auto-merge 未成功」）

**判**
- 先看 `supervise.log` 最后几行：
  - 「主检出有未提交的改动」→ 是出图线入库的窗口期；
  - 「cherry-pick 失败 / could not apply」→ 是真冲突。
- 真冲突时用 `git merge-tree` 预演，列出冲突文件，并看每处冲突块的内容。

**办**
- **窗口期**：`merge_when_clean.py <ID>`。
- **机械冲突**：
  - 范围：两边各加 import 或导出、各在列表或登记表里追加一项、照对方报告的对照表纯改名；
  - 步骤：
    1. `rebase_task.py <ID>`；
    2. 在工作区按两边并集合并，只改冲突块；
    3. 确认全工作区没有其他冲突标记：`grep -rlE "^(<<<<<<<|>>>>>>>) "`；
    4. 在任务报告 §7 补一句「合入前挪基点到 <SHA>，<文件> 冲突由开发监督机械合并（只改 …）」；
    5. 在 coord 写备注 `.agents/coord/<ID>/devsup_note_rebase.md`；
    6. 用原参数加 `--from validate` 重起，由校验和审核把关。
- **语义冲突**（两边改了同一段逻辑）：
  - `rebase_task.py` 后，用 `--from start --note <说明冲突在哪、两边各要什么>` 让执行器合；
  - 拿不准就报协调者。

**报**
- 机械合并做完就报：冲突文件、合法依据、新驱动 pid。
- 语义冲突先报，再动手。

### 2.2 基点早于已合入的修复

**判**
- 任务校验失败，失败项正是集成分支上已修好的问题。今天的实例：
  - content-plugin 用例 5 秒超时，修复 d0c0c1fa；
  - `HOST_DISPOSED` 未处理 rejection，修复 ENG-battle-lazy-dispose；
  - BattleSession 线性断言，已挪到 check:perf。
- 修复提交不在任务基点里：`git merge-base --is-ancestor <修复> <基点>` 返回非 0。

**办**
- 执行器已退出的：先停驱动和它自动起的返修 start（只停自己起的；不是自己起的就报协调者），然后 `rebase_task.py <ID>`，再用原参数加 `--from validate`。
- **不让执行器为已修的问题重跑。**
- 修复还没合入：置 HOLD-VALIDATE，并挂等待器 `after_merge_revalidate.py <修复任务ID> <ID> -- <原参数>`。

**报**
- 做完报一行：任务、栽在哪个已修问题、新基点、驱动 pid。

### 2.3 计时门（pnpm check 里的计时断言）

**判**
- 失败的是计时或线性断言，例如 `expected 212 to be ≤ 205`，或「Test timed out in 5000ms」；
- 失败时机器负载高（`sysctl -n vm.loadavg`，1 分钟均值 > 25）；
- 其余测试全过。

**办**
- 负载高时先在低负载下单独重跑这条用例取数据，**不改断言**。
- 若这条断言正在被某个任务挪到 check:perf：置 HOLD-VALIDATE，挂等待器等那件合入。
- 若是「要构建内容的集成用例」只是撞上默认 5 秒超时：可以给它设显式超时。这算功能用例，不算放宽性能门（协调者 10-03 18:45 裁定），要登记小修，不能自己在别的任务里顺手改。

**报**
- 新出现的、会随负载失败的计时断言要报，带三个数据：失败值、阈值、负载。
- 是否挪到 check:perf 由协调者定。

### 2.4 体积门（`pnpm size`：entry 170 / render 180 / 首次会话 110）

**判**
- 看 `check_size` 三层输出哪一层 FAIL。
- 首次会话闭包 = Worker 壳 + session static + base content。用 `apps/game/dist/.vite/size-groups.json` 和对应块的 gzip 大小定位是哪个模块进了闭包。
- 稀疏工作区量出的 base content 和集成分支不同，因为素材图不在稀疏检出里。数字以集成分支 prod_check 为准。

**办**
- 任务只栽在 session 110，而且有瘦身任务在排（如 ENG-session-base-diet）：置 HOLD-VALIDATE，挂等待器等瘦身任务合入。不放宽。
- AR-64 默认拆包：首屏用不到的子系统一律懒加载，包括战斗、对话 / Ink、城镇、图鉴、江湖志、商店、后续章节内容与素材。
- 若任务**确实**要把首屏必需的模块放进首次会话、因而超限：写明是哪些模块、为何首屏必需，报协调者按 AR-64 批准适度放宽。首屏用不到的模块不能借这条塞进来。

**报**
- 每次合入后报三层数字。
- 首次会话余量 < 10 KiB 时提醒协调者，并建议把瘦身任务在名单里提前。

### 2.5 停滞（supervise.log 出现 `wait: STALLED`）

**判**
- **按最后一次写日志的时间判断**，即 `stat` 执行器日志的 mtime，不看告警时间。告警固定比实际卡住晚 25 分钟。
- 看日志最后一行：
  - traex「context compacted」后无输出 → 压缩后挂住；
  - 跑完技能脚本（如 `prepare_test.sh`）后无输出 → 技能跑偏。现已用 `-c skills.include_instructions=false` 关闭，见 step.py `TRAEX_NO_SKILLS`；
  - 工具调用完成后无输出 → 服务端或网络抖动。
- supervise 会自动杀掉、起续作，不用手动重起。

**办**
- 每次在 HANDOFF 记三样：最后写日志的时间、模型、最后一行。
- 18:48 之后（即上一次集中挂住之后）若又有**不同任务在同一时段**挂住，就把代码池上限降一档（协调者授权，降了再告知）。
- 连续 1 小时没有执行器挂住，可以提议回调上限，但要先告诉协调者。
- 挂住都集中在同一个模型上时，提议排队任务换模型。

**报**
- 同一时段多件挂住要报；降上限要报；同一任务连续挂住 2 次要报。

### 2.6 审核 FAIL

**判**
- 读 `.agents/reviews/<ID>.rN.md`，把每条 FAIL 归类：
  - 报告不实，如数字过期、把未完成写成已通过；
  - 缺交接，没写阻塞任务 ID 或待消费字段；
  - 内容或设计门槛没落实；
  - 真实的代码缺陷。
- 内容任务用 `review_checks_content.md`：依赖未合入引擎的行为，只要列成交接项就不判 FAIL。

**办**
- 能直接修的：写返修 note，内容是审核原文加准确口径，用 `--from start --max-runs 1 --note <文件>` 返修。
  - note 里写清只修这几点、每次补丁 ≤ 50 行、每步输出进度、重跑「检查」全部命令。
- 审核要求「先由协调者登记某个 ENG 任务」的：报协调者，附任务草案，即目标、写集、依赖、验收。登记后再起返修。
- 返修再 FAIL：报协调者，不要无限返修。

**报**
- 第 2 次 FAIL 必报，附 FAIL 归类，以及「是否在挖出新的底层缺陷」的判断。

### 2.7 池上限与名单

- 代码池上限现为 3。tasks.json 改了立即对排队中的 start 生效，不用重起它们。
- 名单原则：
  - M1 主路径优先；
  - 让大家校验能稳定通过的小修排最前，如超时、竞态、计时门挪出；
  - 预算安全任务（瘦身）排在会加闭包的任务之前。
- 新任务起跑前先放进名单。不在名单里的任务排在名单之后，先来先得。
- 同一批重起很多任务时，名单靠「登记满 15 秒才拿空位」保证顺序。重起后用 `step.py pool` 核对。
- Trae 服务报 `code=4050`（请求队列超限）：只认日志里真正的报错行，不认转述的文字。多个任务反复出现时，提议降池上限。

### 2.8 防截断 / 删除误报（校验报「从 N 行缩短到 M 行」「文件被删除」）

**判**
- 看 diff，确认是不是任务要求的重构，例如拆文件、把逻辑挪进 core、样稿拆成壳和场景、用例挪到新文件。
- 稀疏检出没拉下来的文件，已由 run.py 54fc1e6c 排除，不会再误报删除。

**办**
- 确属任务要求的：在 tasks.json 该任务的 `validate.shrink_exempt` 里**只**加这个文件，按路径提交，再用 `--from validate` 重起。
- 不是任务要求的：照常返修。

### 2.9 执行器被停过（退出码 143）

- `--from validate` 会直接因退出码 143 失败，不会跑校验命令。
- 只能起一轮短续作：执行器核对已有产物、重跑检查、更新报告、正常退出。
- 不要改 `.exit` 文件。

### 2.10 登记任务时的合入顺序隐患

- 新增严格校验时，要先查集成分支上已有的内容会不会被判红。例：「lockedBy 必须已登记」「EventDef 动作必须在词表里」。
- 会判红的话：
  - 要么让本任务按已有交接照抄或迁移这些内容，并把文件加进写集；
  - 要么让内容任务排在它之后再登记。
- 依赖只能写已登记的任务 ID，run.py 遇到未知依赖会 Fatal，所有工具都会挂。
- eng3 等批量调度器只在启动时读依赖图。改依赖要等调度器重启才生效，期间人工防止并行改同一批文件。
- 出图任务的校验：`check_assets.py` 的 `--min` 和 `--max` 都要写，`--max` 默认是 2，不写会误判；manifest 的 `status` 只认 approved / candidate / rejected，新图用 candidate。
- 写进说明的校验命令，登记前先在集成分支上空跑一次，确认参数和路径对。
- 稀疏工作区没有图片。凡是改到「依赖全量素材的构建门」的任务（离线闭包、素材清单、发布体积等），都要设 `full_checkout: true`，否则校验和审核都看不到真实数字。前车之鉴：ENG-23a 合入后在全量素材下超门，被撤回（ffd8e505）。
- 新登记的素材任务，说明里统一加一句「过程文件不进 assets/」：生成脚本放 `tools/` 对应位置，日志与检查产物放 `.agents/`（协调者 10-03 21:20）。

### 2.11 prod_check（每次合入后）

- 负载 < 25 时跑：`prod_check.sh post-<短名>`。负载高时先等，或跑了按 2.3 判。
- **绿**：报四个数，entry、render、webgl、首次会话三项合计，与上次比的涨幅。
- **红**，按顺序排查：
  1. 是否正撞上别的任务合入中途，比如 build 报 MISSING_EXPORT、但两边文件在 HEAD 上都齐 → 重跑；
  2. 是否计时或超时 → 按 2.3；
  3. 是否未处理 rejection 或竞态 → 单独连跑定位，登记小修，修在产品代码，要有确定性回归测试；
  4. 是否真实退化 → 定位引入的合入，报协调者，登记修复。
- 改了渲染的合入，还要在低负载时补跑 `pnpm check:perf`。

## 3. 报协调者的格式

往 `.agents/coord/_inbox/ops.md` 追加：

```
- [HH:MM] <事件类别> <任务ID>：<一句结论>；已做：<…>；需要你定：<…>（没有就写「无」）
```

需要协调者拍板的写成「【请判断】…」，并给默认做法：协调者不回，就按默认执行，执行后再记一笔。

## 4. 自动化对照

`supervise.py` 与 `ops_dispatch.py` 已接管下列可确定的步骤；本任务对停进程、改池上限和放宽门禁均无授权，遇到这些选择只写收件箱。

| 手册条目 | 程序与动作 | 自动执行边界 |
|---|---|---|
| §2.1 窗口期 | dispatcher 调 `merge_when_clean.py`，经 `detach_launch.py` 脱离启动 | READY 且最后一次失败确为主检出未提交窗口；已有等待器不重复挂 |
| §2.1 真冲突 | `merge-tree --write-tree --merge-base` 配合 diff3 列文件及完整冲突块 | 只把保留共同基线的单行 import / named export / 表格登记纯追加交 Codex `gpt-6.1-sol xhigh`；`export *` 无法从冲突块排除同名导出，和重复绑定、重命名、语义改动、未知格式一样写「【请判断】」；dry-run 或磁盘 < 2.5 GiB 时不运行会写对象的预演 |
| §2.1 机械合并 | dispatcher 在会话外调 `rebase_task.py`；`codex_session.py` 只解冲突、写报告 §7 与 coord 备注；会话退出 0 且无冲突标记后，dispatcher 再按原参数 `--from validate` | 会话不再嵌套启动 Codex，也不负责写 state / 锁；新冲突、HEAD 变化或会话失败即交协调者；校验和审核继续把关 |
| §2.2 已合入修复 | supervise 每次 `finish --no-commit` 失败后，返修前最多挪一次基点并重校验一次 | 基点是集成 HEAD 的严格祖先、执行器已退出、预演无冲突才调 `rebase_task.py --new-base <预演HEAD>`；预演含未提交产物，临时索引保留稀疏标记及 mtime；预演不改真实索引或引用；无法表示为交接脚本支持的单提交时沿用返修并记日志 |
| §2.2–§2.4 未合入修复 | HOLD-VALIDATE 的失败匹配配置后挂 `after_merge_revalidate.py`；已合入但基点缺修复时交 supervise `--from validate` | 不停现有驱动 / 执行器；只有原驱动已 HOLD 才自动挂；运行中的失败由 supervise 接管，需拦住其后续返修时交协调者 |
| §2.3、§2.4 未知计时 / 体积门 | 收件箱附校验日志中的失败值 / 阈值、当前负载 | 不修改断言、超时、预算，不擅自登记小修或换校验入口；首次会话余量 < 10 KiB 提醒提前瘦身 |
| §2.5 停滞 | 增量监听 `wait: STALLED`，记执行器日志 mtime、模型、末行；同任务重复或不同任务集中时告知协调者 | 【建议值】集中时段为日志 mtime 相差 ≤ 300 秒；「【请判断】是否降池上限」，默认维持现上限；dispatcher 不杀、不重起执行器 |
| §2.6–§2.10 其他事件 | HOLD-REVIEWS / HOLD-RUNS / ERROR / 等待器失败进收件箱 | 报告口径、缩短豁免、退出码 143、依赖图变更均需人工判断；默认保持状态 |
| §2.11 新合入 | 从 HEAD 新提交的 `Agent-Task:` 尾注发现事件；负载 < 25 且上轮结束后调 `prod_check.sh` | 报 entry、render、webgl、session total 四个 gzip KiB 及相对上次完整绿检的差值；读取脚本日志的 `PNPM_CHECK_RC`，不把 shell 退出码当绿；红 / 缺数报摘要，由协调者决定重跑与修复；渲染专项 check:perf 仍需人工安排 |
| §2.11 校验并发 | `step.py finish` 的整段 `run.validate` 与 dispatcher 的 `prod_check.sh` 共用 `.agents/slots/check/` 文件锁信号量；默认同时最多 2 个（`TIANSHU_CHECK_SLOTS` 可覆盖） | 持槽进程退出即由文件锁自动释放；受管校验按 `floor(逻辑核数 / 2)`、至少 1 设置 `TIANSHU_VITEST_MAX_WORKERS`，根 Vitest 配置读取它；未设置时本地开发行为不变 |
| §2.1 窗口合入收尾 | `merge_when_clean.py` 成功后核实等待起点之后出现精确 `Agent-Task:` 尾注，再通过 supervise 状态接口写 `MERGED` | 尾注缺失、仅相似 ID 或旧提交不改状态并写「【请判断】」；同步后 `after_merge_revalidate.py` 的依赖门可继续 |
| §0 安全 | 出图前缀 ART / TOWN / VFX / CITY / SKILL / KIT 和 Gemini / Tripo 任务跳过；磁盘 < 2.5 GiB 只写收件箱 | 不停进程、不直接改工作区、不放宽门禁；守护进程单实例锁，处置子进程全部经现有 detach 脚本启动 |

### 配置与状态

- 配置默认读 `.agents/coord/_ops/config.json`；不存在时用 `tools/agents/fixtures/ops/config.json`。`fixes` 维护匹配正则（同一规则全部命中）、修复提交 / 任务 ID，不写死在 Python；内置 5 秒功能超时、HOST_DISPOSED、BattleSession 计时断言和首次会话瘦身四项。
- `supervise_args` 按任务 ID 保存**原参数数组**（不含任务 ID、`--from`、`--worker`、`--detach`）。必须包括原 `--checks` 文件；缺配置只写「【请判断】」。示例：`"ENG-example": ["--max-reviews", "1", "--max-runs", "3", "--auto-merge", "--checks", ".agents/coord/PROD/review_checks_eng.md"]`。工具拒绝跳过审核等选项，不猜新的审核口径。
- 每轮重新读任务状态与负载；`state.json` 保存 HEAD 游标、已处理事件、待处理事件、处置 pid 和上一轮完整数字；`offsets.json` 保存 supervise.log / supervise.out 的 inode 与字节位置。单次日志读取最多 256 KiB，半行留待下一轮，轮转 / 截短重置位置；首次启动只读尾段，不回放整份大日志。
- 守护日志：`.agents/coord/_ops/ops_dispatch.log`；收件箱：`.agents/coord/_inbox/ops.md`；子进程日志：`_ops/jobs/*.log`。启动参数缺失、预演不可读、等待器超时、处置失败均可追溯。
- 磁盘告警在低于 2.5 GiB 的时段只集中登记一次；READY / HOLD-VALIDATE / 合入检查保留在待处置队列，空间恢复后重新判断。进程探测无权限时写「【请判断】」，不把未知进程当作已退出；配置变化和新合入会让 HOLD 的失败重新分类。

### 起停与核验

以下命令在 **集成仓库根** 执行；交接脚本固定根为 `_prod`，不要从另一个工作副本运行真实处置。

```sh
python3 tools/agents/ops_dispatch.py --once --dry-run
python3 .agents/coord/_handoff/detach_launch.py .agents/coord/_ops/launch.out "$PWD" -- python3 -u tools/agents/ops_dispatch.py --interval 45
```

正常轮询默认 45 秒（允许 30–60 秒）；`--once` 一轮退出，`--dry-run` 一轮只打印、不写状态 / offset / 收件箱、不启动子进程。独立工作副本默认只观察自身，可用 `--root` 明确指定集成根做只读预演。

停止时核对 `_ops/pid` 对应的确为自己启动的 dispatcher，再只向该 pid 发 TERM；不会停止已脱离启动的等待器、检查或处置会话。不要使用进程组信号，也不要停其他监督、出图或 Gemini / Tripo 进程。改配置后重启自己启动的 dispatcher；原等待器能被进程扫描识别。

单测：`python3 -m unittest tools.agents.test_ops_dispatch tools.agents.test_supervise_rebase tools.agents.test_step_pool_priority tools.agents.test_step_traex_args tools.agents.test_run_sparse_baseline`。测试只建少量文本文件的临时 git 仓库，不检出本项目，不启动真实模型。

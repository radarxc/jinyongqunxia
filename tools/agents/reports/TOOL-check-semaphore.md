# TOOL-check-semaphore 报告 · 工具 · 校验并发闸：step finish 校验与守护进程 prod_check 走文件锁信号量（最多 2 个），校验里 vitest 固定 maxWorkers（核数一半）；单测；写进 OPS_RUNBOOK
## 1. 摘要（3–6 行）
- 新增跨工作区文件锁信号量，默认只允许 2 段校验并行，持锁进程退出即由内核释放。
- `step.py finish` 的完整 `run.validate` 与 dispatcher 启动的 `prod_check.sh` 已接入同一闸门。
- 受管校验固定 Vitest workers 为 `max(1, floor(os.cpu_count()/2))`；本机 12 核取 6，本地未设环境变量时不变。
## 2. 产出（文件、行数、主要章节）
- `check_semaphore.py`、`test_check_semaphore.py`；`step.py`、`run.py`、`ops_dispatch.py`、`vitest.config.ts`、`OPS_RUNBOOK.md` 与本报告，分别完成信号量/测试、两处接入、环境传递与运维口径。
## 3. 关键结论与数值
- 槽文件位于 `.agents/slots/check/slot-{0,1}.lock`；`TIANSHU_CHECK_SLOTS` 覆盖槽数，排队每 60 秒报告；`TIANSHU_VITEST_MAX_WORKERS` 由受管入口传给根 Vitest 配置。
## 4. 开放问题（附默认值）
- 无产品开放问题；默认保持 2 槽、逻辑核数一半且至少 1 worker。真实 prod_check 串联留给集成根沙箱外校验。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无：只约束校验资源，不改门禁、阈值、用例、超时或断言。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；`OPS_RUNBOOK.md` §4「自动化对照」已登记。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 新增 8 条测试覆盖两槽排队、SIGKILL 自动释放、CLI 退出码/环境、finish 持槽、run 环境和 prod_check 包装；指定组合 89 条全过，未启动 Codex/Traex。
- ✅ `ops_dispatch --once --dry-run`、冻结安装、strict ID、lint、typecheck、size 均通过；受管 Vitest 175 文件/1253 用例全过（6 workers）。
- ⚠️ 原样 `pnpm check` 在 lint/typecheck/175 文件 1253 用例全过后，因沙箱禁止 tsx Unix socket 于 `content:validate` 报 `listen EPERM`；按规则未改 node_modules，须沙箱外复验。

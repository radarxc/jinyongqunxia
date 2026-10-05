# TOOL-ops-dispatch 报告 · 工具 · 运维自动化：supervise 返修前先挪基点重校验；ops_dispatch 守护进程按 OPS_RUNBOOK 处置可脚本化事件（判断不了写收件箱）；决策逻辑单测（AR-65）
## 1. 摘要（3–6 行）
- supervise 已增加返修前挪基点预演与一次重校验，原校验、门禁及返修状态机不变。
- 新守护程序增量观察状态、日志与合入尾注，纯函数决策与脚本执行分开。
- 窗口期、机械冲突、已修问题、等待器、停滞和合入后检查均有对应动作；未知情况写「【请判断】」。
- 本轮按第 3 次审核返修 dry-run 回收副作用：已结束的 merge_wait / mechanical 仅打印，不写 MERGED、不删状态、不起重校验。
- 未启动真实守护、Codex / Traex 或 prod_check；只做单测和只读预演，运行态串联仍需集成环境验证。
## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 内容 |
|---|---:|---|
| `tools/agents/supervise.py` | 513 | 新增预演快照、挪基点与一次重校验 |
| `tools/agents/ops_dispatch.py` | 741 | 决策、增量采集、三阶段机械处置、结果收集、CLI |
| `tools/agents/test_ops_dispatch.py` | 485 | 决策 / 日志 / 尾注 / 等待器 / dry-run 无副作用 / 持久化 |
| `tools/agents/test_supervise_rebase.py` | 145 | 临时 git 仓库与模拟校验；不调用模型 |
| `tools/agents/fixtures/ops/**` | 80（7 文件） | 已修问题配置、事件矩阵、冲突及检查日志 |
| `tools/agents/OPS_RUNBOOK.md` | 259 | 仅末尾追加 §4「自动化对照」、配置与起停 |
| `tools/agents/reports/TOOL-ops-dispatch.md` | 46 | 本报告 |
## 3. 关键结论与数值
- (a)：仅 finish 退出码 1 触发；基点须为 HEAD 严格祖先，执行器退出、单提交可搬且 merge-tree 无冲突才调用 rebase_task；固定预演 HEAD；每次失败最多一次，不递归。
- 未提交快照使用临时索引，保留 skip-worktree 与 mtime；不动真实索引 / 引用。冲突、不支持的提交形态或脚本失败记 supervise.log 后沿用返修。
- READY 窗口期 → merge_when_clean；成功须核实等待起点后的精确尾注，再经 supervise 接口同步 MERGED，唤醒依赖等待器。
- 真冲突 → diff3 预演；dry-run / 低磁盘不预演；`export *`、重复绑定 / ID 与语义冲突转「【请判断】」。机械项由外层 rebase → Codex 解冲突 / 留痕 → 外层原参数 `--from validate`。
- HOLD-VALIDATE：配置识别 content-plugin 5 秒、HOST_DISPOSED、计时断言与 session 瘦身；修复不在基点 → supervise；未合入 → after_merge_revalidate；未知失败不被已知规则掩盖。
- STALLED 记旧轮执行日志 mtime、模型、末行；【建议值】300 秒内不同任务聚集，只请判断是否降池上限，默认不改。
- 新合入等负载 < 25 且检查空闲后跑 prod_check；按 PNPM_CHECK_RC 判断，报告四个 gzip KiB 与相对上次完整绿检的差值；110 − 10 = 100 KiB 以上提醒 session 余量不足。
- 默认 45 秒一轮（30–60 可选）；磁盘 < 2.5 GiB 集中告警并保留待处置；出图任务跳过；不杀进程、不直接改工作区、不改门禁。
- dry-run 回收已结束任务时保留内存 / 磁盘 job 状态；merge_wait 只打印将同步 MERGED，mechanical 只打印将启动重校验。
- 「【请判断】」覆盖 export * / 语义 / 未知冲突、缺原审核参数、未知校验 / 依赖、集中或重复停滞、审核 HOLD、尾注核实失败、流程错误、处置失败、进程不可探测及检查红 / 缺数。
- 起：在 _prod 用 detach_launch 启动 ops_dispatch（完整命令见 OPS_RUNBOOK §4）；停：核对 _ops/pid 后只停自己启动的 dispatcher，脱离子进程继续。
## 4. 开放问题（附默认值）
- 原 supervise 参数未保存在状态文件；默认由 _ops/config.json 的 supervise_args 提供，缺 --checks 时只报收件箱，不猜审核口径。
- （待实测）真实机械处置 / 等待器 / prod_check 串联；默认本次不从无 coord 的独立副本启动。首次检查无可用历史绿检时涨幅记缺失。
- 读取的外部 executor_override 已含 AR-66 分流；默认不改外部配置，机械会话显式用 Codex gpt-6.1-sol，supervise 续作沿用现有 override。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无：本任务仅调度工具，不改变设计基准或任何门禁。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `tools/agents/README.md` / 运维用法：链接 OPS_RUNBOOK §4 的启动、配置、默认转收件箱边界。
- `.agents/coord/_ops/config.json` / 运行配置：协调者填原驱动参数并维护已修问题清单；本次未写运行态目录。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ (a) 含未提交 / 稀疏产物预演、冲突文件记录、运行中拒绝、一次重校验及失败回落均有单测。
- ✅ (b)(c) 窗口 / 真冲突、export *、三阶段机械处置、MERGED 唤醒、已修问题、mtime / 聚集、检查解析、出图保护与低磁盘均覆盖。
- ✅ 指定五模块 unittest 组合 63 条通过；check_ids --strict 退出 0，新未定义 / 弃用为 0（既有基线未改）。
- ✅ --once --dry-run 退出 0：HEAD=11240bcb8c4b，动作={}，待处理=0；未写运行态、Git 对象或启动进程。
- ✅ 只改写集；未操作实际仓库提交 / 切换；临时仓库仅少量文本并已清理；未调用技能；runbook 只末尾追加。
- ⚠️ 首次新建 ops 文件的补丁略超 150 行；后续分节保存，已通读代码、夹具及新增手册，未留截断或占位。
- ⚠️ 真实后台处置尚未运行；配置缺原参数、运行中驱动及渲染专项性能检查的边界已明确交接。

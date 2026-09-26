# B6b.R 报告 · 审校 · 续写 tech/08 后端与在线服务（§4 起至文末）

## 1. 摘要（3–6 行）

- 已逐节审校并直接修正 `docs/tech/08-backend-and-online.md`，§4–§15、58 条参考资料、术语与待决事项完整，文首 TL;DR / 调研要点与正文一致。
- 重点修复了 iOS 跨容器短码漂移、CAS 冲突候选回滚、GC 永久档条件反写、WebCrypto 假流式哈希、D1 字节限额与长窗口限流等会造成实现错误的问题。
- D1 核心 DDL 现为 20 张表，已用 SQLite 执行并通过外键检查；API、R2 键、Hono 装配、认证与 `ts_s` 会话契约已相互对齐。
- 2026-09-26 重新核对平台限额、价格、API、浏览器支持、模型状态和依赖版本；动态或设备相关结论继续明确标注“（待核实）/（待实测）”。
- 审校结论为**通过**：没有遗留的文档阻断项；实现前仍须完成正文 O-01～O-12 所列 preview、真机、真账号与恢复演练。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/tech/08-backend-and-online.md` | 2,989 | §4 同步与冲突；§5 认证、安全；§6 REST API；§7 D1 + R2；§8 选型与成本；§9 AI NPC；§10 遥测；§11 配置；§12 运维；§13 Hono 代码；§14 演进；§15 风险；58 条参考资料、术语和待决事项 |
| `tools/agents/reports/B6b.R.md` | 149 | 本审校报告：修正记录、复算、开放问题、提案、同步项与审校结论 |

相对 B6b 原稿，正文保留原有结构与合理内容，只做必要修正和补充；未修改授权范围之外的文件。

## 3. 关键结论与数值

### 3.1 关键修正

| 位置 | 原值 / 原行为 → 新值 / 新行为 | 依据 |
|---|---|---|
| §4.11、§5.3、§6、§7.2 | Safari ↔ 主屏专用 **6 位 / 10 分钟**迁移码 → 复用 **8 位 / 5 分钟**一次性配对码 | 与 `tech/03` F14 对齐；删除重复路由、错误码与 `transfer` DDL 分支，迁移先上云后正常 `/sync` |
| §4.2 | 宽限期内重新签发相同 `deviceId` → 新配对必发新 ID，旧自动档只可由已登录 UI 显式接管并审计 | 撤销后的设备身份不能复活，否则破坏会话撤销边界 |
| §4.3、§7.3 | CAS 零行按错误抛出、整批回滚 → 候选先以 `conflict` 登记，成功 / 冲突用互斥条件 SQL 和回执判定 | D1 `batch()` 只会因 SQL 失败回滚；`UPDATE ... WHERE` 零行不是异常，原逻辑会丢失应保留的冲突候选 |
| §4.8 | GC 要求 `retention_class='permanent'` → `retention_class != 'permanent'`，并要求非 current、保留期已到且未受备份保护 | 原条件方向相反，会把永久档列入删除候选 |
| §4.3、§13.5 | 原生 WebCrypto 边写 R2 边流式 SHA-256 → 8 MiB 有界读取、校验后写；仅在实测需要时引入经审计的增量实现 | `SubtleCrypto.digest()` 不提供流式接口 |
| §5.8、§7.2、§8.7 | 长窗口交给 Workers Rate Limiting binding → binding 只挡 10 / 60 秒洪峰，10 分钟 / 小时精确窗口落 D1 `rate_limit_windows` | 官方 binding 周期仅支持 10 或 60 秒，且是本地、宽松、最终一致计数 |
| §7.2 | JSON `length(text)` 字符数上限 → `length(CAST(text AS BLOB))` UTF-8 字节上限 | API 限额按传输 bytes；中文字符不能按 SQLite 字符数冒充字节数 |
| §7.2 | 19 张表 → **20 张表** | 新增精确长窗口表 `rate_limit_windows`；完整 DDL 在 SQLite 中执行成功 |
| §5.6、§7.2 | WebAuthn 注册未固定稳定 user handle、challenge 策略可含明文 → 账号持久化 32-byte handle，challenge 仅存 SHA-256，策略剔除明文 | 与 WebAuthn / SimpleWebAuthn 的稳定用户标识及一次性 challenge 边界一致 |
| TL;DR 8–9、§9 | `claude-opus-5` 作为生产默认 → 仅作 Legacy 评测与费用基线，生产不预填模型 | 官方模型页已将 Opus 5 标为 Legacy；启用前必须选当前不可变 ID 并重跑金标、价格和 fallback 契约 |
| §9.4 | 顶层自动 prompt caching → 只在跨请求稳定的 S0–S2 最后一个 block 标 `cache_control` | 避免把逐轮变化内容纳入断点而持续 cache miss |
| §13.2 | AI 默认关闭但基础 Wrangler 仍声明 service binding → 基础配置不声明 `AI`，启用环境再加必选 binding | Wrangler binding 不是靠 TypeScript 可选字段实现运行时“可选” |
| §13.3 | 公开认证写路由绕过全部同源检查；未知 `/api/*` 可落 SPA → 建会话前先验 Origin / Fetch Metadata，认证后验 session CSRF，并增加 Problem 404 | 防 CSRF 与 API/SPA 路由混淆 |
| §13.5 | `SaveRepo.findReceipt()` 与端口不一致；D1 失败后还用 D1 登记 orphan → 统一为 `findWrite()`；orphan 由 R2 上传时间与 D1 引用差集巡检 | 接口可执行性与故障域隔离 |
| §12.5、参考资料 | Healthchecks 免费数待猜测 → Hobbyist 免费 **20 jobs、每 job 100 logs**；UptimeRobot 保持 **50 monitors、5 分钟** | 两家官方价格页于 2026-09-26 核实；实际通知集成仍待真账号验证 |

### 3.2 至少 10 处关键数值复算

| # | 位置 | 原值 → 审校值 | 复算 / 依据 |
|---:|---|---|---|
| 1 | §7.5 手动槽容量 | 117.2 MiB → **117.2 MiB（通过）** | `12 × 40 × 250 KiB / 1024 = 117.1875 MiB` |
| 2 | §7.5 快速槽容量 | 9.8 MiB → **9.8 MiB（通过）** | `40 × 250 / 1024 = 9.765625 MiB` |
| 3 | §7.5 自动槽容量 | 22.0 MiB → **22.0 MiB（通过）** | `3 × 3 × 10 × 250 / 1024 = 21.97265625 MiB` |
| 4 | §7.5 永久检查点 | 8.5 MiB → **8.5 MiB（通过）** | `35 × 250 / 1024 = 8.544921875 MiB` |
| 5 | §7.5 常态总量 | 157.5 MiB → **157.5 MiB（通过）** | 前四项精确和 `157.470703125 MiB` |
| 6 | §7.5 四倍裕量 | 约 630 MiB → **约 630 MiB（通过）** | `157.470703125 × 4 = 629.8828125 MiB` |
| 7 | §7.5 单档余量 | 约 16.4 倍 → **约 16.4 倍（通过）** | `8 MiB / 500 KiB = 16.384` |
| 8 | §7.5 D1 粗估 | 约 39 MiB → **约 39 MiB（通过）** | `5,000 × 8 KiB / 1024 = 39.0625 MiB` |
| 9 | §8.4 R2 十进制容量 | 0.154 GB-month → **0.165 GB-month** | `157.5 × 2^20 / 10^9 = 0.16515072 GB` |
| 10 | §8.4 R2 免费量占比 | 1.54% → **约 1.65%** | `0.16515072 / 10 × 100% = 1.6515072%` |
| 11 | §8.4 月请求量 | 8,030 → **8,030（通过）** | `1,440 + 1,440 + 150 + 5,000 = 8,030` |
| 12 | §8.4 D1 日写量 | 318 → **318（通过）** | `(1,440 + 150) × 6 / 30 = 318` |
| 13 | §8.2 Cloudflare 加权分 | 92 → **92（通过）** | `20+20+15+12+10+8+4+3 = 92` |
| 14 | §8.2 阿里 / 腾讯加权分 | 各 75 → **各 75（通过）** | `16+16+12+15+6+6+3+1 = 75` |
| 15 | §8.2 轻量服务器加权分 | 65 / 68 → **65 / 68（通过）** | 境外 `16+8+9+9+6+8+5+4=65`；内地将地域 9 改 15、支持 4 改 1，得 68 |
| 16 | §9.9 AI 首轮 | $0.0925 → **$0.0925（通过）** | `12k×$5/M×1.25 + 2k×$5/M + 300×$25/M` |
| 17 | §9.9 AI 后续轮 | $0.0235 → **$0.0235（通过）** | `12k×$0.50/M + 2k×$5/M + 300×$25/M` |
| 18 | §9.9 20 轮长谈 | 约 $0.54 → **$0.539 ≈ $0.54（补足精确值）** | `$0.0925 + 19×$0.0235 = $0.539` |
| 19 | §9.13 批量内容预算 | $125 + $25 = $150 → **$150（通过）** | `(20×$5 + 6×$25)×50% = $125`，另留 `$25` |
| 20 | §5.4 Cookie | 30 天 / 2,592,000 秒 → **`Max-Age=2592000`（通过）** | `30 × 24 × 60 × 60 = 2,592,000` |

其他已核实硬限：TSAV 8 MiB、头 64 KiB、声明解压 32 MiB、Meta 512 KiB【建议值】；D1 单 string / BLOB / row 2,000,000 bytes；Workers Free 100,000 请求/日与 10 ms CPU；Paid $5/月、10M 请求/月、30M CPU-ms/月；D1 Free 500 MB/库、5 GB/账号、5M 行读/日、100K 行写/日；R2 Free 10 GB-month、1M Class A、10M Class B 且互联网出口免费。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 继续实施方式 |
|---|---|---|
| O-01 | D1 多语句条件批次在真实并发下能否始终保持每槽唯一 current | 先按 §7.3 实现并做 100 轮以上竞态属性测试；出现一次不变量失败即改每账号 Durable Object 串行写，REST / ETag 不变 |
| O-02 | 8 MiB TSAV 的 Worker CPU / 内存预算 | MVP 用有界缓冲；边界样本不稳先升 Paid 或实现经审计的增量 hash / 分块候选，不抬 8 MiB 上限 |
| O-03 | Vitest workspace 版本隔离 | `services/api` 独立锁 Vitest 4；若根 workspace 无法可靠隔离，改用 Wrangler `getPlatformProxy()` 测 ports |
| O-04 | Safari、主屏 Web App、微信 / QQ WebView 的存储、Cookie 与 Passkey 行为 | 一律按独立设备设计；永久保留配对码；跨容器复用 8 位 / 5 分钟码，按 P01 真机矩阵验证 |
| O-05 | D1 `apac` hint 与 AI placement 的实际时延 | D1 先用 `apac`；AI 启用时先用 `host: api.anthropic.com:443`，各取 30 次首 token / 总时延后再改 |
| O-06 | Passkey、Ed25519、SimpleWebAuthn 在锁定 compatibility date 下的兼容性 | 能力探测；Passkey 回退配对 / 邮箱码，Ed25519 回退带 RFC 8032 向量的固定 verifier，绝不跳过验签 |
| O-07 | Cloudflare 日志 / 预算、Healthchecks 通知、Anthropic spend limit 的真账号能力 | 能设则采用；否则应用硬拒绝 + GitHub Actions / 邮件通知，不依赖控制台软提示 |
| O-08 | 第二家私有备份存储 | 默认作者现有 NAS 或非 Cloudflare S3-compatible 私有桶，`rclone copy`，90 天版本 + 12 个月快照 |
| O-09 | 浏览器大体积云导出 | 并发 3 下载；失败则每卷 ≤128 MiB 或逐文件，不在 Worker 端压 ZIP |
| O-10 | AI 当前模型、fallback beta、价格、地区与数据保留 | AI 保持关闭；五项门槛全过后再选不可变模型 ID 并重测；Opus 5 只作 Legacy 基线 |
| O-11 | 单人遥测是否值得保留 | 默认关闭；启用时摘要 100%、可重放 10%、云端 180 天 / 1 GiB，一个内容迭代后复盘 |
| O-12 | 未选择的轻量服务器价格、带宽与备案资格 | P03 不变时不采购、不写死价格；只有重开部署决策时按当日官方信息另做 ADR |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| P-08-01 | 将基准 §19“国内 / 海外两套部署方案”改为“当前只实施 Cloudflare；国内云、香港或 Node 仅为经新决定触发的迁移备选” | 作者决定 P03 高于基准，已决定不备案且不建国内 / 香港镜像；并行两套会误导排期、安全边界和运维责任 |
| P-08-02 | 在基准 §19 补入“完整快照 + 服务端修订号 CAS；自动档按设备分区；具名槽冲突人工选择；落选版至少保留 30 天” | 将“不丢档”提升为跨文档不变量，避免后续 UI 或实现退回 last-write-wins |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/tech/01-architecture.md` | §6.9 | 将“版本号 + 时间 + 设备 ID”自动仲裁改为 `rev` CAS；自动档按设备命名空间，具名槽冲突由玩家选择且落选版保留至少 30 天 |
| `docs/tech/01-architecture.md` | §7.6、§11–§12、待决 P6 | 公开 Pages / GitHub Pages 改为同 Worker 私有 Static Assets；允许 `services/api` 独立 Vitest 4；P6 标为本文解决 |
| `docs/tech/03-mobile-performance.md` | F14、真机矩阵、存储 / Worker 预算 | 短码已对齐为 8 位 / 5 分钟；协同验收独立容器、8 MiB 哈希 / 上传、Ed25519 / Passkey、流式 ZIP 与 outbox |
| `docs/tech/04-*` | manifest、内容版本与迁移 | 固定 `contentHash` / `idRemaps` 契约；保留可按 hash 获取的旧书界包 |
| `docs/tech/05-*` | 战斗录像与确定性 | 最终定义 `BattleReplayV1`、规范序列化 / hash 与跨 V8/JSC fixture；服务端不重放战斗 |
| `docs/tech/06-asset-storage.md` | §7、§9、§12–§13、待决 7/8/15 | 会话引用本文 §5；app / API / 素材同 Worker；按 P03 删除国内 / 香港镜像与 `ts-runtime-cn` 现行规划 |
| `docs/design/12-quests-npc-factions.md` | NPC 人设、好感、台词 / 节点接口 | 定义 `NpcAiCard` 内容来源与稳定 ID；裁定好感封顶终值；每 NPC 至少三类预写回退 |
| `docs/design/13-progression-and-endings.md` | §9 存档与 Meta | 引用 `cloudSlotKey`、ETag / CAS、冲突历史和 `/meta/merge`；确认 Meta 事件 ID 与 512 KiB 上限 |
| `docs/design/14-*` | 登录、读档、设置与更新 UI | 落地本机 / 待上云 / 已上云 / 冲突四态、双版本选择、8 位配对迁移、设备撤销、同意开关与 Passkey 回退 |
| `docs/tech/09-*` | 路线图 / 发布闸门 | 接收 §14 的 Phase 1–4+ 阶段、恢复闸门、真机 / 遥测 / AI 验收与建议值收口时点 |
| `TODO.md` | §2、§4–§6 | 登记 P-08-01 / P-08-02、P03 落实与上述同步债；归属文档完成后再标全仓解决 |

## 7. 审校结论

**结论：通过。** B6b 的章节、表格、数量下限与文末结构完整；本轮发现的阻断和重要问题均已在授权正文中修正。剩余事项均已给默认值，不妨碍后续实现排期。

### 阻断

- ✅ **CAS 会回滚冲突候选**：已改为条件 SQL + 互斥回执，不再以主动抛错表达业务冲突；保留 Durable Object 降级闸门。
- ✅ **GC 条件会选择永久档**：已把反写条件改为排除 `permanent`，并补 current、期限与备份保护条件。
- ✅ **iOS 迁移协议跨文档冲突**：已删除 6 位 / 10 分钟第二套协议，全面统一为 8 位 / 5 分钟配对码。
- ✅ **哈希实现假设不存在的流式 WebCrypto**：已改为 8 MiB 有界方案，并把增量实现列为实测后备选。

### 重要

- ✅ **D1 长窗口限流不可由 edge binding 精确承担**：新增 `rate_limit_windows`，DDL 由 19 表变为 20 表。
- ✅ **JSON 上限按字符而非字节**：所有 JSON DDL 约束改为 UTF-8 bytes。
- ✅ **WebAuthn user handle / challenge 存储边界不完整**：已增加稳定随机 handle，并禁止持久化 challenge 明文。
- ✅ **Legacy 模型被写成生产默认**：生产模型改为无默认，AI 保持关闭，启用前重新选型与评测。
- ✅ **公开认证写端点与 API 兜底顺序存在安全缺口**：已补 Origin / Fetch Metadata 前置校验和 `/api/*` Problem 404。
- ✅ **R2 容量换算错误**：0.154 GB / 1.54% 已改为 0.165 GB / 约 1.65%。

### 一般

- ✅ 更新 Cloudflare Email Service 表述、Healthchecks 免费计划数、Wrangler / npm 版本与参考资料；参考资料增至 58 条。
- ✅ 统一 MiB / KiB 与 D1 的 2,000,000-byte 精确口径；补 `await sha256Bytes(...)`、`findWrite()` 和默认关闭 AI binding 等示例可执行性问题。
- ✅ 文档头追加“审校 B6b.R（2026-09-26）”；目录与正文顺序一致，已有待决项均保留或标“已解决”。

### 未能处理、后续跟进

- ⚠️ 仓库当前没有可用的项目级 TypeScript 工程供片段编译；系统 `tsc` 链接损坏并报缺少 TypeScript 模块，因此 TypeScript 示例仅完成接口、控制流与语法人工审查。实施时须在 `services/api` 建骨架后跑 typecheck 与契约测试。
- ⚠️ `tools/lint/check_ids.py` 执行结果为全仓 118 个未定义引用、1 个 deprecated ID；本文命中的是 `save_slots` / `save_versions` 表名、API 错误码及 `ach_example` 等显式示例，不是新玩法 ID，故未为“清零”而污染基准 ID 注册表；唯一 deprecated 项位于未授权的 `tech/04`。
- ⚠️ 真机 / 真账号项仍包括 iOS / WebView 存储与 Passkey、Ed25519、D1 并发、8 MiB Worker 预算、placement、告警 / spend limit 和大 ZIP；均已列入 O-01～O-10。未选轻量服务器的动态成本仍按 O-12 保持待核实。

### 最终自检

- ✅ **修改范围**：只修改正文并创建本报告；未执行改变仓库状态的 git 命令。
- ✅ **完整性**：二级章节为 §0–§15，文末顺序为“参考资料 → 本文新增术语/约定 → 待决事项 / 依赖”；无截断、空章节或占位语。
- ✅ **Markdown**：108 条围栏（54 个代码块）成对闭合；58 张表列数一致；`git diff --check` 通过。
- ✅ **DDL**：提取 §7.2 SQL 后由 SQLite 成功执行，业务表数 20，`PRAGMA foreign_key_check` 为 0。
- ✅ **数值**：复算 20 项关键公式 / 值；错误项已修正，其余明确标“通过”。
- ✅ **事实核查**：58 条来源覆盖 Cloudflare、Web 平台、HTTP / WebAuthn、Anthropic、国内云、备案、监控及依赖版本，访问日期统一为 2026-09-26。
- ✅ **长度门槛**：正文未发生 15% 以上缩短；当前差异为净增长，保留原有合理内容。

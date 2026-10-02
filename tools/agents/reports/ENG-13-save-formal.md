# ENG-13-save-formal 报告 · 游戏工程 · 存档正式化（TSAV v1 / 每槽三代与损坏回退 / JSON·TSAV·ZIP 导入导出）

## 1. 摘要（3–6 行）

- 已将临时 `.tsui` 出口替换为正式 TSAV v1，并完成规范 JSON、单档 TSAV、全部存档 store-only ZIP 的导入导出。
- IndexedDB 升至 v3：每槽保留最近三代，两阶段切换当前指针；读档逐代校验，最新损坏时自动回退并报告恢复代。
- 已接入纯 JSON 迁移链、内容修复钩子、首次保存持久化请求、历史代 UI；core 零改动、无新增依赖。
- 五条指定验收均通过；平台存储覆盖率四项均过 80%，1 MiB fake-indexeddb 存读均低于 50 ms。

## 2. 产出（文件、行数、主要章节）

- `packages/platform/src/storage/`：新增 persistence 34 行、TSAV codec 413 行、迁移链 83 行、ZIP codec 201 行及 331 行专项测试；改造 schema/store/transfer/types/errors/index 与旧库测试。
- `packages/platform/README.md`：90 行；v3 schema、TSAV/ZIP 边界、持久化、迁移及 2026-10-01 核实来源。
- `apps/game/src/storage/`：正式 SaveService、历史代投影及端到端测试；TSUI 只读转换入口保留。
- `packages/ui/src/`：存档历史、JSON/TSAV/ZIP 操作、导入确认与持久化状态文案；`game-controller.ts` 19 增/10 删，未改 `App.vue`。

## 3. 关键结论与数值

- TSAV：`TSAV` + v1 + flags `0b01` + reserved 0 + LE uint32 头长 + 明文头 + gzip；头 ≤64 KiB，解压原文 ≤32 MiB，payload/body 各 SHA-256。
- DB v3 新表 `saveGenerations(&[slot+generation], slot, [slot+savedAt], ...)`；v1/v2 旧行原 generation 迁入并写 `save:current:<slot>`。
- 每槽 3 代；自动档仍按 `save_auto_1→2→3`、30 s 去抖。ZIP32 method 0：≤256 MiB、≤65,535 项，校验 CRC32、路径、目录与 manifest SHA-256。
- 覆盖率 Statements 90.62%、Branches 84.96%、Functions 97.93%、Lines 91.34%；1 MiB 用例总时长：读 5.19 ms、写 3.71 ms（fake-indexeddb，最终单次结果）。
- 首屏将 SaveService 动态拆包：entry gzip 149.72/170 KiB；无新依赖。

## 4. 开放问题（附默认值）

- O1：真实 core 尚无正式 `saveSchema/contentHash/serialize()`；默认暂用 schema 1、全零 content hash、`20261001-0000-local`，并由 host snapshot 充当 JSON。
- O2：正式周目、baseRev、等级/余韵/计数/难度/游玩时长尚未进入当前 GameState；默认 `zhoumu=1`、`baseRev=0`、现有可得字段，其余为中性 0/1。
- O3：设备/lineage 暂为本地随机 ID；默认存入 settings 并复用，待账号配对与新游戏生命周期接管。
- O4：移动端 CompressionStream、IndexedDB `<50 ms` 与 `persist()` 批准/驱逐行为仍（待实测）；默认拒绝不阻断保存并提示定期导出。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 tech/01 §6.9、tech/05 §14、tech/08 §3；临时应用头值只列依赖，不升格为基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/01-architecture.md` §6.9：登记 IndexedDB v3 实际表名、复合主键、当前指针键及每槽三代实现。
- `docs/tech/08-backend-and-online.md` §3.1/§3.4/§12.6：同步原生 CompressionStream（无 fflate）、store-only ZIP 和当前 32 MiB 本地边界；区分后续 io.worker 优化。
- 后续 core 命令总线 / saveSchema：提供本报告 §7 的正式序列化契约与头字段来源，替换 O1–O3 默认值。
- `docs/tech/09-roadmap.md` §3.3/§3.5：验收后勾选本地三代、损坏回退、JSON/TSAV/ZIP 与持久化状态。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ TSAV §3.2 字段：format、slotId、saveSchema、contentHash、appBuild、savedAt、deviceId、baseRev、lineageId、zhoumu、summary、sizes、payloadSha256、bodySha256、origin 均严格白名单/类型校验；party≤6、WebP thumbnail≤12 KiB。
- ✅ TSAV §3.3 布局：偏移 0–3 `54 53 41 56`；4=v1；5=`0b01`；6–7=0；8–11=头长小端；12 起明文 JSON，随后 gzip；有界流解压后再验 payload hash。
- ✅ 数据库升级：v3 新表迁移旧 `saves`；写状态机为“写不可变新代→测试故障点→切 current pointer/自动档游标→裁剪旧代”，单事务失败整体回滚。
- ✅ 回退状态机：按 pointer 内 generation 降序，依次验外层 hash→TSAV/body/gzip/payload→迁移→host validate；失败试上一代，成功返回“已从第 N 代恢复”；显式历史代失败不隐式换代。
- ✅ 格式表：JSON=头+规范 GameState；TSAV=正式单档；ZIP=manifest+README+各槽三代 TSAV/store；TSUI=仅识别并校验转换，绝不导出；所有导入追加新代、不预删旧档。
- ✅ 错误枚举：`TSAV_TRUNCATED/BAD_MAGIC/UNSUPPORTED_CONTAINER/UNSUPPORTED_FLAGS/INVALID_HEADER/INVALID_SIZE/BODY_CHECKSUM/DECOMPRESSION/PAYLOAD_CHECKSUM/INVALID_JSON`，另有 `SAVE_TOO_NEW/MISSING_MIGRATION/MIGRATION_FAILED`。
- ✅ 测试：TSAV 往返/规范确定性/逐类篡改、迁移与 fixup、ZIP 往返/CRC/路径、三代/指针/中途失败/损坏回退、v1/v2 升 v3、首次 autosave 无队列死锁、持久化状态均覆盖。
- ✅ 性能与覆盖：1 MiB fake-indexeddb 读/写测试总时长 5.19/3.71 ms，内部存读断言均 `<50 ms`；覆盖率 90.62/84.96/97.93/91.34%；真机仍见 O4。
- ✅ 验收：`pnpm install --frozen-lockfile`、`pnpm check`（常规 68 文件/369 测试 + rig 2 测试）、platform test（10 文件/51 测试）、game build、严格 ID 检查均退出 0；ID 工具仅报告既有 baseline 未定义 1、新增 0；`utree flush` 成功；`git diff --check` 通过。
- ✅ 后续 core 接口：`serialize(): JsonValue` 必须纯 JSON/确定性且排除瞬时 battle/dialogue；`GameState.meta.saveSchema>=1` 随形状变更单调递增并提供逐版纯迁移；同时给真实 `contentHash` 与 host `validate/restore`，I/O 层独占 TSAV/gzip/hash/IndexedDB。

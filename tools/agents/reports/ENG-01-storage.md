# ENG-01-storage 报告 · 游戏工程 · 存储层（web IndexedDB 数据存储层与 API）

## 1. 摘要（3–6 行）

- 已在 `@tianshu/platform` 完成 Dexie/IndexedDB v2 存储层，core 零改动。
- 提供存档、分层世界态、内容 LRU、设置、迁移及带 SHA-256 的二进制导入导出 API。
- 写操作由 FIFO 队列串行化，存档和自动档游标单事务提交；自动档按三槽轮换并 30 s 节流。
- `apps/game` 已加可操作的假快照存/读面板；本轮三条指定检查全部通过。
- ⚠️ 第 5 次返修已复现基点 `core` 的 RNG 浮点缩放阻断；该路径不在本任务写集，本轮未越权改代码。

## 2. 产出（文件、行数、主要章节）

- `packages/platform/src/storage/`：18 个文件、2,168 行；类型、错误、schema、各 store、archive codec、测试。
- `packages/platform/README.md`：83 行；API、对象仓库/索引、迁移、导入导出、兼容和性能约定。
- `apps/game/src/storage-demo.ts`：82 行；浏览器存/读 `save_quick`；`main.ts` / `style.css` 完成装配。
- `packages/platform/package.json`、`pnpm-lock.yaml`：Dexie 4.4.6、fake-indexeddb 6.2.5、coverage-v8 5.0.3。

## 3. 关键结论与数值

- 选 Dexie：与 tech/01 已定方案一致，并直接提供 schema upgrade、复合索引和多仓事务。
- 二进制快照 `Uint8Array`；写前、读后及导入均校验 lowercase SHA-256；单快照 ≤ `32 MiB`。
- 自动档窗口 `30,000 ms`，轮换 `save_auto_1..3`；`force` 供书眠/隐藏等安全点。
- 1 MiB 读档（含复制与 hash）测试要求 `<50 ms`；fake-indexeddb 通过，真机仍待实测。
- 覆盖率：Statements 90.51%、Branches 85.87%、Functions 98.50%、Lines 90.85%。

## 4. 开放问题（附默认值）

- O1：真实 iOS / Android 读档与配额行为待实测；默认保持 1 MiB `<50 ms` 和遇配额先逐出内容缓存。
- O2：本次 `TSDB v1` 是全库恢复信封；默认普通玩家仍只用 tech/08 的单档 TSAV，后续由同步层做 ZIP 清单。
- O3：ENG-models 尚未提供正式 SaveHeader/GameState validator；默认平台只把规范字节视为不透明 payload，校验其 hash/元数据边界。
- O4：`core/src/rng/index.ts` 的 `intInclusive()` 仍有浮点除法/乘法；本轮数值探针确认 `u32=2147483647, span=2147483649` 时现式得 `1073741824`，精确乘积高 32 位应为 `1073741823`。默认由协调者另起 core 任务修复，保持一次 `nextU32()` 消耗并补边界/确定性测试。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 Canon §19、tech/01 与 tech/05，不新增玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/01-architecture.md` §4.3/§5：记录实际对象仓库 v2 与公开 API；依赖版本由范围外文档任务同步。
- `docs/tech/08-backend-and-online.md` §3/§12.6：区分本地全库 `TSDB v1` 与单档 `TSAV v1`，接线正式 codec/ZIP。
- ENG-models：提供规范序列化字节、hash、正式 SaveHeader/GameState 校验与纯状态迁移链。
- ENG-ui：消费 `StorageErrorCode`；配额不足先清 `ContentCache`/导出，禁止静默删档。
- `packages/core/src/rng/index.ts` / `core.test.ts` / replay fixtures：协调者须在授权任务中消除 `intInclusive()` 浮点缩放，覆盖跨度 1、`2^32`、上述舍入边界及单次 RNG 消耗，并按 tech/05 §4.2、§4.6 提升 `rngProtocol`、更新 golden；本任务不得越权修改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### API 表

| 方法                  | 参数                            | 返回                   | 主要错误                                                |
| --------------------- | ------------------------------- | ---------------------- | ------------------------------------------------------- |
| `SaveStore.listSlots` | —                               | 槽摘要列表             | `UNAVAILABLE`                                           |
| `save/load/delete`    | slot、二进制快照、meta          | 摘要 / 完整档 / void   | `INVALID_ARGUMENT`、`HASH_MISMATCH`、`QUOTA_EXCEEDED`   |
| `autosave`            | 快照、meta、`force/trigger`     | `saved` / `throttled`  | 同 save                                                 |
| `WorldStateStore.*`   | scope、worldId、sequence、bytes | 快照 + 有序增量        | `INVALID_ARGUMENT`、`HASH_MISMATCH`                     |
| `ContentCache.*`      | 版本键、bytes / maxBytes        | entry / LRU 逐出键     | `INVALID_ARGUMENT`、`QUOTA_EXCEEDED`                    |
| `SettingsStore.*`     | key、JSON-like value            | value / entries / void | `INVALID_ARGUMENT`                                      |
| `export/import`       | — / `StorageExport`             | 二进制包 / 计数        | `IMPORT_FAILED`、`UNSUPPORTED_VERSION`、`HASH_MISMATCH` |

### 对象仓库与索引 / 迁移策略

- ✅ `saves(&slot,savedAt,[worldId+gameTime])`；`worldSnapshots(&key,[scope+worldId])`；`worldDeltas(++id,&[scope+worldId+sequence],[scope+worldId])`。
- ✅ `packs(&key,[worldId+kind+version],lastAccessedAt)`；`settings(&key)`；`storageMeta(&key)`。
- ✅ v1→v2 保留 `saves/packs/settings`，新增世界态与元数据仓；真实旧数据迁移测试通过。

### 测试覆盖 / 下游接口

- ✅ fake-indexeddb：存读删、列表、迁移、并发 12 写、损坏校验、LRU、设置、导入导出、1 MiB 性能；存储模块 5 文件 22/22，平台包合计 6 文件 23/23。
- ✅ 覆盖率四项均 ≥80%；`pnpm --filter ./packages/platform test` 6 文件 23 测试通过。
- ✅ `pnpm check`：13 文件 46 测试、内容校验、构建和包体门禁全绿；entry 100.68/170 KiB，render 126.80/180 KiB，WebGL 227.48/350 KiB。
- ✅ `python3 tools/lint/check_ids.py --strict`：新增严格错误 0（仓库既有 undefined 基线 1）。
- ✅ ENG-models 交 `Uint8Array + SaveMetadata.hash/schemaVersion/worldId/gameTime`；ENG-ui 只依赖 Promise API 与错误枚举。
- ⚠️ 1 MiB `<50 ms` 仅 fake-indexeddb 环境验证；真实三类设备标记（待实测）。
- ⚠️ 架构门禁：数值探针稳定得到 `actual=1073741824`、`exact=1073741823`；`packages/core/src/rng/index.ts:56` 相对基点 `add433ba2292198f7598a99573ea9d34e3d3a458` 零改动且超出允许写集。平台测试流程为 `all-pass`，整项任务因该外部阻断为“禁止修复”；协调者须另起获授权的 core 任务解除合入阻断。

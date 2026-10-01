# @tianshu/platform

| 项          | 内容                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 归属        | 浏览器平台适配层；存储不进入 `packages/core`                                                                             |
| 上游        | `docs/00-canon.md` §19；`docs/tech/01-architecture.md` §3、§6.9；`docs/tech/05-gameplay-engine.md` §3.2、§3.7、§4.5、§14 |
| 公开入口    | `@tianshu/platform`，存储实现位于 `src/storage`                                                                          |
| 当前 schema | IndexedDB v2；升级只前进、不覆写已发布 migration                                                                         |

## 结论先行（TL;DR）

存储层采用 Dexie 4.4.6 封装 IndexedDB。原因是技术基线已选 Dexie，且它能用一套 API 提供版本迁移、复合索引与多表事务；相比手写原生 request/transaction 状态机，更少的样板代码也更容易审计。`createIndexedDbStorage()` 返回 `SaveStore`、`WorldStateStore`、`ContentCache`、`SettingsStore`、迁移清单及二进制 `export()` / `import()`。

存档正文始终是 `Uint8Array`：平台层不把 1 MB 级规范快照转成 JSON 字符串。`SaveMetadata.hash` 是 `tech/05` §4.5 指定的 lowercase SHA-256；写前和读后都以 Web Crypto 校验。所有写入经实例级 FIFO 队列串行化；一份存档及其自动档指针在单一事务中提交。

## API 契约

| 接口              | 关键方法                                              | 语义                                                                |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `SaveStore`       | `listSlots` / `save` / `load` / `delete` / `autosave` | 合法玩法槽；单槽覆盖递增 `generation`；读写校验快照 hash            |
| `WorldStateStore` | `saveSnapshot` / `appendDelta` / `load` / `clear`     | 只持久化 `long-term` 与 `chapter`；`battle/dialogue` 临时态不得写入 |
| `ContentCache`    | `put` / `get` / `list` / `delete` / `evictTo`         | 以书界、类别、版本为键；读取更新 LRU；只逐出可重建内容              |
| `SettingsStore`   | `get` / `set` / `delete` / `entries`                  | JSON-like 设置键值；读写都结构化克隆                                |
| `StorageTransfer` | `export` / `import`                                   | TSDB v1 二进制全库快照；导入先验 SHA-256，再单事务替换              |

所有方法均返回 `Promise`。失败统一抛 `StorageError`；`code` 为 `INVALID_ARGUMENT`、`NOT_FOUND`、`CORRUPT_DATA`、`HASH_MISMATCH`、`QUOTA_EXCEEDED`、`MIGRATION_FAILED`、`IMPORT_FAILED`、`UNSUPPORTED_VERSION`、`UNAVAILABLE`、`TRANSACTION_FAILED` 或 `UNKNOWN`。`QuotaExceededError` 明确映射为 `QUOTA_EXCEEDED`，调用方应先清理 `ContentCache`，不得自动删存档。

`autosave()` 默认 30 秒窗口，与 `tech/01` §6.9 的“同类触发 30 s 内去抖”一致；按 `save_auto_1` → `2` → `3` 轮换。`force: true` 用于书眠、页面隐藏等必须尝试落盘的安全点。节流发生时返回 `{ status: 'throttled' }`，不是错误。

## 数据库、对象仓库与索引

数据库默认名为 `tianshu`；测试或多租户宿主可通过 `databaseName` 隔离。

| 对象仓库         | 主键    | 索引                                               | 保存内容                                     |
| ---------------- | ------- | -------------------------------------------------- | -------------------------------------------- |
| `saves`          | `&slot` | `savedAt`、`[worldId+gameTime]`                    | 二进制规范快照、hash、列表元数据、generation |
| `worldSnapshots` | `&key`  | `[scope+worldId]`                                  | 长期 / 书界快照；`key=scope\0worldId`        |
| `worldDeltas`    | `++id`  | 唯一 `[scope+worldId+sequence]`、`[scope+worldId]` | 快照之后的有序增量                           |
| `packs`          | `&key`  | `[worldId+kind+version]`、`lastAccessedAt`         | 内容包 / 素材清单二进制与 LRU 时间           |
| `settings`       | `&key`  | —                                                  | JSON-like 设置值                             |
| `storageMeta`    | `&key`  | —                                                  | schema 标记和自动档轮换 / 节流游标           |

`WorldStateStore` 写入新快照时，在同一事务删除序号不晚于它的增量。内容缓存的 `evictTo(maxBytes)` 按 `lastAccessedAt`、`cachedAt`、键稳定排序后逐出；存档与设置不在其删除范围。

## 迁移策略

- v1：`saves`、`packs`、`settings`。
- v2：新增 `worldSnapshots`、`worldDeltas`、`storageMeta`，并给存档增加 `[worldId+gameTime]` 索引。upgrade 回调写入 `schemaVersion=2`，原有三仓数据原样保留。
- 后续版本必须新增一个 `version(n)` 和一个 `Migration { from:n-1, to:n }` 说明；旧迁移发布后不可修改。迁移函数不得读墙钟、随机数或网络。
- IndexedDB 在打开数据库时以升级事务执行 schema 迁移；任何错误映射为 `MIGRATION_FAILED`，不继续半初始化运行。

## 导入导出边界

`StorageExport` 是供宿主文件选择器 / 下载 API 使用的二进制包，不替代 tech/08 定义的单档 `.tsav`。布局为固定 `TSDB` 魔数、格式版本、条目数，以及逐条的类别、JSON 小头和二进制 body；限制为头 64 KiB、单条 32 MiB、整包 256 MiB、10 万条。导入验证整包 SHA-256、结构边界、存档 / 世界态逐项 hash 和声明字节数，全部通过后才在一个事务内替换本地数据。

## 浏览器与性能约定

- `crypto.subtle.digest('SHA-256', bytes)` 需要安全上下文；生产 PWA 必须使用 HTTPS。
- 2026-10-01 查 MDN compat-data：IndexedDB 基础接口从 Chrome 24、Firefox 16、Safari 8 可用；`SubtleCrypto.digest` 从 Chrome 41、Firefox 34、Safari 7 可用，Android / iOS 条目镜像对应引擎。项目 ES2022 / 模块 Worker 门槛远高于这些版本，因此存储 API 不再额外提高浏览器最低线。
- IndexedDB 没有跨浏览器固定容量数字：浏览器按来源、磁盘与持久化状态管理配额和驱逐。实现只承诺把配额异常归一为 `QUOTA_EXCEEDED`；实际容量与 `navigator.storage.persist()` 结果仍**（待实测）**。
- 1 MiB 读档预算测试包含 IndexedDB 读取、ArrayBuffer → Uint8Array 克隆及 SHA-256，fake-indexeddb 环境门禁 `< 50 ms`；真实 iOS / Android 仍按 tech/03 做真机测试。
- 调用方应在保存前取得 core 的规范序列化字节与 hash。平台层只验证并持久化，不重新定义 core 的 JSON 规范、玩法槽可读资格或迁移后的 GameState 校验。
- 示例页在 `apps/game/src/storage-demo.ts`，可在浏览器中写入和读回 `save_quick` 假快照。

## 参考资料

- [Dexie 4.4.6](https://dexie.org/)；[事务 API](<https://dexie.org/docs/Dexie/Dexie.transaction()>)；[版本升级](<https://dexie.org/docs/Version/Version.upgrade()>)（访问日期：2026-10-01）。
- [MDN IndexedDB API](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)、[SubtleCrypto.digest](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/digest)、[Storage quotas and eviction criteria](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)（访问日期：2026-10-01）。
- [fake-indexeddb 6.2.5](https://github.com/dumbmatter/fakeIndexedDB)（访问日期：2026-10-01）。
- Dexie 与 fake-indexeddb 均为 Apache-2.0、无运行时 API 价格或调用额度；浏览器存储容量由上述 Storage API 配额策略决定。

## 本文新增术语/约定

- `TSDB v1`：本模块的全库二进制导入导出信封；与单档 `TSAV v1` 分工，不混用。
- `generation`：本地单槽成功写入次数，只用于观察和并发写验收，不代替云端 CAS `rev`。

## 待决事项 / 依赖

- 已解决：本地存储实现采用 Dexie 4.4.6；依据 tech/01 §5.1 与本任务技术基线。
- 本文依赖：ENG-models 提供正式快照 schema、规范序列化字节、`contentHash` 与纯 GameState 迁移；本层现阶段把它们视为不透明字节和元数据。
- 本文依赖：ENG-ui 依据 `StorageError.code` 展示可恢复提示；`QUOTA_EXCEEDED` 优先引导清素材缓存 / 导出，不得静默删档。
- 开放问题（默认值）：TSDB 是开发期全库恢复格式，普通玩家 UI 默认只暴露单档 TSAV；待 tech/08 客户端实现后由其生成 ZIP 清单。
- 开放问题（默认值）：真实设备 1 MiB 读档仍**（待实测）**；默认继续执行 `< 50 ms` 预算，不因桌面测试通过而宣称真机达标。

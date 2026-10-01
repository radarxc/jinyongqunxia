# 本任务：游戏工程 · 存储层（web IndexedDB 数据存储层与 API）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络（装依赖）。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 1.1：「存储层 - 建立web的indexdb数据存储层，定义好API」。

## 技术基线

- 包：`packages/platform`（tech/01 §2：IndexedDB 存储归平台层；core 不得接触 DOM / IndexedDB）；`docs/tech/01-architecture.md` §存档（本地优先、PWA 离线、云存档非权威）；`docs/tech/05-gameplay-engine.md` §3.7 快照、§4.5 规范序列化与哈希；存档校验用 `zod/mini` 或手写（tech/01 §2 决策 7）。
- 工程骨架由 ENG-scaffold 建好（`pnpm check`）。可用 Dexie（tech/01 §3 图中 "存储 Dexie/IndexedDB"）或原生 IndexedDB 封装，二选一写明理由。

## 要做的事

1. **API 定义**（`packages/platform/src/storage/index.ts`，先定义接口再实现）：
   - `SaveStore`：存档槽（`listSlots`、`save(slot, snapshot, meta)`、`load(slot)`、`delete(slot)`、`autosave`），快照 = core 的规范序列化字节 + 元数据（书界、游戏时间、版本、哈希、缩略信息）；
   - `WorldStateStore`：书界运行态的增量 / 快照（按 tech/05 §3.2 长期 / 书界 / 临时状态分层决定存什么）；
   - `ContentCache`：书界内容包与素材清单缓存（版本键、大小、LRU）；
   - `SettingsStore`：设置键值；
   - `Migration`：schema 版本与升级链；`export()` / `import()`（文件导入导出，tech/01 平台层职责）。
   - 所有 API 返回 Promise，错误类型枚举；并发写用事务 / 队列；配额不足的处理。
2. **实现**：IndexedDB（Dexie 或原生），数据库名 / 对象仓库 / 索引设计写进 `packages/platform/README.md`；哈希校验（tech/05 §4.5）；版本迁移示例（v1 → v2）。
3. **测试**：`fake-indexeddb` 下的单测：存读删、槽位列表、迁移、并发写、损坏数据的校验失败；覆盖率 ≥ 80%（对本模块）。
4. `apps/game` 加一个最小示例页（存 / 读一个假快照）证明浏览器可用；`pnpm check` 全绿。

约束：core 包零改动；API 文档与类型即规范；每次写入 ≤ 150 行。

性能是作者硬要求（AR-21「性能要最好」）：存档写入走单一事务、二进制快照（不用 JSON 字符串拼接大对象），自动存档节流；读档 ≤ 50 ms（1 MB 快照，写进测试）。

检查：以下命令必须全部通过。
- `pnpm check`
- `pnpm --filter ./packages/platform test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：API 表（方法 / 参数 / 返回 / 错误）；对象仓库与索引；迁移策略；测试覆盖；交 ENG-models / ENG-ui 的接口约定。报告 ≤ 100 行。

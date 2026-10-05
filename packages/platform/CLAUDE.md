# @tianshu/platform

浏览器适配层：存储、输入、音频与 CoreHost。不得包含玩法判断；外部完成时序不得改变规则结果。CoreHost 默认 Worker、可回退主线程，消息只能是可序列化的命令、结果和快照。存储实现归 ENG-01，本任务只定义端口。

- `migrateSaveJson()` 只编排逐版纯 JSON 迁移；玩法 schema 迁移由调用方从 core 注册，platform 不反向依赖 core。当前 app 注册 schema 1→2。
- `SAVE_TOO_NEW`、`SAVE_PROTOCOL_UNSUPPORTED`、`MISSING_MIGRATION`、`UNSUPPORTED_VERSION` 与 `UNAVAILABLE` 属兼容性 / 环境错误，不是损坏；`SaveStore.load()` 必须原样上抛，禁止三代回退掩盖。
- 三代回退只处理某一代 hash、容器或语义校验损坏；显式指定 generation 时无论错误类型都不自动换代。

# 天书录内容源目录

这里是可 diff 的正式内容源骨架，目录契约来自 `docs/tech/04-data-pipeline.md` §2.1。生产内容以 schema 校验后的 YAML、Ink、Tiled 与规范 JSON 表达；玩法规则不得藏在加载器或界面代码中。

- `.schema/`：编辑器用生成 schema，不手改。
- `_drafts/`：草稿，生产发现器必须排除。
- `common/`：跨书界定义。
- `world/`：导航镜像与区域内可行走地图。
- `chapters/`：按书界分包的 NPC、任务、剧情与遭遇。
- `locales/`：简体源文案与繁体人工覆盖。
- `assets/registry/`、`tiled/`、`vfx/`、`migrations/`：资源登记、编辑工程、特效定义和迁移。

当前仅建空骨架；ENG-02 及后续内容任务负责写 schema 对应数据。

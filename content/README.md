# 天书录内容源目录

这里是可 diff 的正式内容源骨架，目录契约来自 `docs/tech/04-data-pipeline.md` §2.1。生产内容以 schema 校验后的 YAML、Ink、Tiled 与规范 JSON 表达；玩法规则不得藏在加载器或界面代码中。

- `.schema/`：编辑器用生成 schema，不手改。
- `_drafts/`：草稿，生产发现器必须排除。
- `common/`：跨书界定义。
- `world/`：导航镜像与区域内可行走地图。
- `chapters/`：按书界分包的 NPC、任务、剧情与遭遇。
- `locales/`：简体源文案与繁体人工覆盖；文本表用 UTF-8 YAML/JSON 键值树。
- `story/`：`<storyId>.ink` 必须配同名 `.inkmeta.yaml`；测试故事只放测试夹具。
- `assets/registry/`、`tiled/`、`vfx/`、`migrations/`：资源登记、编辑工程、特效定义和迁移。

当前仅建空骨架；ENG-02 及后续内容任务负责写 schema 对应数据。

构建命令为 `pnpm content:build [--chapter chNN_name] [--locale zh-Hans] [--emit-refs]`。
中间文件写入 `.cache/content-build/`，发布叶片与每书界 `manifest.json` 写入
`dist/content/`；两处均为可重建产物，不提交 Git。当前 M1 以书界 base 分片，RegionMap
落地后再由 ENG-18b 增加 `rg_*` 区域叶片。

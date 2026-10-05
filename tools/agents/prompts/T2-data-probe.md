# 本任务：数据探针——schema registry、单张 Tiled 图转换、规范 JSON 与哈希、ID / 引用校验、`content:validate` L0–L6

`tech/09` P0 的数据探针。目标不是十四界批量数据，而是把 `tech/04` 的管线主干（读取 → 归一化 → 链接 → 编译 → 分片 → 发射）在一张真实地图和少量真实内容上跑通，且**同输入双构建逐字节一致**。

## 必读

- `docs/tech/04-data-pipeline.md` §2（`content/` 目录规范）、§3（schema 组织、`dsl-registry.ts` 单一声明）、§4（九步管线、Tiled、Ink、表达式 AST）、§5（校验 L0–L11）、§6（书界包、`contentHash`、`idRemaps`、`refs.json`）。
- `docs/tech/01-architecture.md` §7.4（Tiled 约定）、§7.5（校验层级）。
- 归属文档的数据结构：`design/05` §2（`SkillDef` / `MoveDef`）、`design/06` §2（`BuffDef`）、`design/08` §2（`TerrainDef`）、`design/12` §11（`quest.v1` 四根）、`design/18` §5（`npc` 字段）、`design/19` §3（地图 YAML）、`tech/07` §6.4（`AssetEntry`）。
- `tools/lint/check_ids.py`、`tools/lint/check_quest_manifest.py`（L2；TS 校验器的规则要与之等价，golden 可共用）；`content/chapters/ch01_tianlong/`（Q01 若已合入，作为真实任务数据输入）。
- `docs/design/map/*.yaml`（编译镜像进 `content/world/navigation/*.json`，禁止手改源）。

## 至少实现（`packages/data`、`tools/content-build`、`content/`）

1. `packages/data`：Zod schema 至少覆盖 `SkillDef / MoveDef / BuffDef / TerrainDef / RegionMap / NpcDef / QuestV1 / AssetEntry / ChapterPackManifest`，`z.infer` 类型导出；`dsl-registry.ts`（hook / op / opcode 单一声明，生成 Zod 枚举与 TS 联合；tech/04 §4.6 的 `DSL_REGISTRY_DRIFT` 检查）；`toJsonSchema()` 导出到 `packages/spec/generated/*.schema.json`（生成物入库并有漂移测试）。
2. `tools/content-build`：`validate` 实现 L0–L6（环境、语法、结构、命名、引用、基准一致、六角地图可达性）；`build` 实现 compile → partition → emit：规范 JSON（键排序、无浮点噪声）、`contentHash`、`refs.json`（素材键引用图）、`chNN.rules.json` / `chNN.text.zh-Hans.json` 拆分；`--emit-refs`；确定性测试：同输入两次构建的输出目录逐字节一致。
3. `content/`：`common/realms.yaml`（Canon §5 修为）、`common/terrain/*.yaml`（从 `design/08` 取 8 种示例地形）、`common/skills/` 3 门（易筋经、降龙十八掌、太祖长拳，字段完整）、`common/buffs/` 5 条、`chapters/ch00_yuenv/chapter.yaml` 与一张 Tiled `.tmj`（20×20 六角 pointy-top、高度 / 地形 / 门禁 / 出生点图层）、`chapters/ch01_tianlong/chapter.yaml` + `era.yaml` 骨架、`world/regions/rg_dali_cangshan.yaml` 骨架、`locales/zh-Hans/ui.yaml` 少量键；Q01 的 `quests/` 若存在则纳入校验。
4. Tiled 转换器：`.tmj` → `RegionMap` JSON（六角轴坐标、高度 0–10、地形 ID、门禁、出生点、遭遇区），含一条"从入口按 qg0→qg5 计算可达集合"的报告（L6）。
5. 与 Python lint 对拍：`content:validate` 的 ID / 引用结论与 `python3 tools/lint/check_ids.py --json`、`check_quest_manifest.py --json` 在共同覆盖的规则上一致（写一条对拍测试，允许 Python 侧只作参考）。

## 验收标准（亲自运行）

- `pnpm content:validate` 退出 0 且报告 L0–L6 各层结果；`pnpm content:build` 两次输出逐字节一致（测试证明）。
- `pnpm --filter @tianshu/data test`、`pnpm --filter tools-content-build test`（或等价 filter 名）、`pnpm check` 通过。
- `packages/spec/generated/*.schema.json` 与 Zod 无漂移（测试）。
- 报告第 6 节：T3 需要的 `RegionMap` 字段与示例路径；T5 需要的 `ChapterPackManifest` 字段。

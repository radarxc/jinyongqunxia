# 本任务：撰写 `docs/tech/04-data-pipeline.md`（数据驱动与内容管线）

职责（基准 §18、§19；`tech/01` 已给出形状与边界）：内容数据的目录结构与格式（YAML + Zod schema）、ID 注册与重映射、Tiled 地图转换、Ink 对话管线、内容校验器、书界包打包（规则 / 文本拆分、`contentHash`、增量更新），以及 AI 辅助内容生产闭环中的"入库"环节。

## 必读

- `tech/01`：§3.7、§4 monorepo、§6.8 书界包、§8.3 确定性、§9 AI 协作约定、待决 P4。
- `tech/03` §5.6：Worker 只解压，主线程在加载遮罩下按区域解析，单次 `JSON.parse` ≤ 256 KB。
- `tech/06`：素材 ID、清单、`assets.lock.json`。
- `tech/08`：§3.6 `idRemaps` 与 `contentHash`；`content:validate`。
- 各策划文档的数据结构与校验规则：`design/05` §2 与 §15、`06` §2 与 §13、`08` §2、`09` §13、`10` §2 与 §14、`13` §10。
- `docs/decisions/rulings-v1.md` 的 C18（契约文件目录）。

## 至少包含

1. **`content/` 目录规范**：按书界 `chNN_*` 与 `common/` 组织。其他文档已经引用的路径（如 `content/ch08_luding/encounters/…`、`content/common/items/divine.yaml`、`content/world/tiers.yaml`、`content/assets/registry/ch01/portrait.yaml`），保持兼容或给出迁移方案（`grep -rn "content/" docs` 找全）。
2. **schema**：Zod 定义在 `packages/data` 中的组织方式；各内容类型的 schema 清单（武功、招式、Buff、套装、装备、物品、地形、区域、NPC、任务、对话、遭遇、敌人模板、天书之力等）与示例；schema 字段与策划文档字段的对应表。
3. **校验器**：结构校验 + 引用完整性（ID 存在性）+ 业务规则（各策划文档"数据校验规则"一节的规则，给出汇总表与实现方式）+ 数值预算检查（招式预算公式、内功贡献预算）。CLI `pnpm content:validate`，以及 CI 集成。
4. **Tiled**：地图编辑约定（图层、高度、地形、门禁、出生点、遭遇区）→ 转换器 → 区域数据；与 tech/02 的 32×32 地形合批衔接。
5. **Ink**：写作约定、变量与 core 状态的桥接、本地化文本抽取、校验。
6. **书界包**：`chNN.rules.json` / `chNN.text.<locale>.json` 的切分；按区域切片；`contentHash`；`idRemaps`；增量更新；体积估算（回应 tech/01 P4）。
7. **AI 辅助内容生产**：草稿区 → 校验 → 人工审核 → 入库（与 tech/08 §10、tech/01 §9.2 对齐）。
8. 开发工作流、测试、MVP 与演进、风险、参考资料、本文新增术语/约定、待决事项 / 依赖。

代码片段用 TypeScript（strict）。篇幅参考：1,100–1,800 行。

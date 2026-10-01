# @tianshu/data

内容 schema、生成类型、书界包格式和加载边界的唯一实现。`src/schemas` 可依赖完整 Zod，根运行时入口不得把完整 Zod 带进游戏。禁止结算玩法、访问 DOM / 存储或在 schema 与手写 interface 之间维护两份事实。

## Schema 清单

| 文件 | 公开定义 | 依据 |
|---|---|---|
| `src/schemas/character.ts` | `NpcDef`、`CharacterTemplate` | `tech/04` §3.11、`design/18` |
| `src/schemas/martial-art.ts` | `MartialArtDef`、`InnerDef`、`SkillInstance` | `tech/04` §3.6 / §3.11、`design/05` |
| `src/schemas/meridian.ts` | `MeridianDef`、`AcupointDef`、`MeridianProgress` | `tech/04` §3.8、`design/15` / `21` |
| `src/schemas/item.ts` | `ItemDef`、十一类 `kind` 的公共字段与类别扩展 | `design/10` §2 / §14 |
| `src/schemas/story.ts`、`story-graph.ts` | `TimeWindow`、`StoryNode`、`StoryEdge`、`StoryLine` | `design/24` §§3–5 / §9 |
| `src/schemas/world.ts` | `ShopDef`、`EventDef`、`BookWorldDef` | AR-19、`design/10`、`design/24` |

## 加载与公开入口

- `@tianshu/data` 运行时入口只导出 `loadChapterPack()`，避免把 Zod / YAML 带入游戏首包。
- `@tianshu/data/schemas` 导出 schema 与推导类型；schema 是字段事实源。
- `@tianshu/data/tooling` 导出 `parseContentFile()`、`loadContent()` 与 `ContentRegistry`。加载流程为 YAML 严格解析 → Zod 校验 → 引用校验 → 深冻结 → 建索引；每个正式文件只校验一次。
- `ContentRegistry.get(kind, id)` 返回可空结果，`require(kind, id)` 缺失即失败，均为 O(1)；商店键是 `<chapterId>/<key>`，剧情线键是 `<chapterId>/<lineId>`。

## 验证命令

- 包内：`pnpm --filter @tianshu/data test`、`pnpm --filter @tianshu/data typecheck`。
- 全量内容：`pnpm content:validate`；交付前运行 `pnpm check`。

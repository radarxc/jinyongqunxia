# 本任务：城镇 3D 古建 · 年代套件 schema 与编译（`kit/schema.ts`、`kit/compile.ts`）+ 试点套件 `song_dali`、`xiyu`（含唐代佛教变体）+ 按城指定套件表

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-p0-scaffold.md` 与 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 3、7 节，打开 `packages/render/src/buildgen/types.ts` 的 `BuildKitView`（render 侧对编译后套件的只读结构镜像，网格器 r1–r7 只读这个形状），再打开 `docs/tech/16-town-3d-spec.md` §3（尺寸标准与算例）、§4.3（套件 YAML 草图与 xiyu `tang_buddhist` 变体）、§12.1（贴图层表），读完直接动手；不要先写计划。

本任务写代码与内容。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（data 层只做 schema 与加载边界）。

## 背景
作者 AR-114（2026-10-10）：城镇建筑由代码按占地 / 类型 / 年代参数生成 3D 古建，门窗柱檐按真实尺寸，"写实古风"、不卡通不缩微（STYLE.md L13–14、design/22 L602）。每个年代 / 地域一份**套件**，给出尺寸档、门窗、墙材、屋脊、调色、贴图层与「布局类型 → 配方」的映射；规划器与网格器都只读编译后的 `CompiledBuildKit`。试点两套：北宋大理 `song_dali`（大理 ch01 / ch10 用）与西域土坯 `xiyu`（吐鲁番 ch10 用，702 年唐西州必须用唐代佛教变体：不画穹顶与尖拱，寺院 / 官署用唐式佛塔刹顶与唐式木构檐口——tech/14 D13）。

## 要做的事
1. `packages/data/src/build/town-plan/kit/schema.ts`：用 zod（构建期）定义 `buildkit.v1`——字段按 tech/16 §4.3：`id`、`style: timber | adobe`、`profile: song_zhe | qing_jujia`、`dims`（`vernacular / shop / middle / hall` 四档：`platform, column, diaRatio, beam, eave, rise, lift: [起翘, 冲出], verge?, upperStorey?`，全部 mm 整数或万分比整数——`rise` 用万分比 bp 表示，如 0.2625 → 2625）、`door`、`window`、`walls`、`ridge`、`palette`（颜色 `#rrggbb` + 抖动范围用万分比）、`layers`（`{ id, repeatMm: [w, h] }`，恰 16 层，顺序即下标）、`archetypes`（25 个 archetype 名 → `{ recipe, size, roof, storeys?, front?, facility?, signage?, bays?, balcony?, brackets?, layout?, screenWall?, alias? }`，`alias` 只能指向同套件内非 alias 项）、`variants`、`landmarks`、`cityWall`、可选 `variantSets`（如 `tang_buddhist: { forbid: [dome, pointed_arch], finial: tang_stupa }`）。
2. `kit/compile.ts`：`compileKit(source)` → `CompiledBuildKit`（展开 alias、校验 25 个 archetype 都有映射或明确 `unsupported`、数值区间检查、按 `variantSets` 生成变体），输出规范排序的 JSON（同输入逐字节相同）。`types.ts` 里 `CompiledBuildKit` 的最小结构按需要充实（p0 留的桩）。**`CompiledBuildKit` 必须能直接赋值给 render 的 `BuildKitView`**：字段名、嵌套层次、单位（mm / 万分比 / 下标）逐项与 `BuildKitView` 一致（data 不得 import render，两边的一致性由 `apps/game/src/town-contract.test.ts` 的编译期断言校验）；`BuildKitView` 里有、而套件 YAML 草图没有的字段，按 `BuildKitView` 补；草图里有、`BuildKitView` 没有的字段可以保留（多出的字段不影响赋值）。发现 `BuildKitView` 本身缺了网格器必需的字段时，不要改 render，写进报告第 7 节。
3. `content/town/buildkits/song_dali.yaml`、`content/town/buildkits/xiyu.yaml`：数值取 tech/16 §3（大理：宅台基 300、店 150、檐柱 2800 / 3000、柱径 H/11、出檐 700 / 800、举高 0.2625、翼角 180 / 120、正脊方翘头 550、悬山出际 400–600、土坯山墙 350 + 毛石裙肩 800；殿堂档按「殿堂」列；`xiyu` 按「西域土坯」列：墙 450–600、平顶 3200–3500、女儿墙 450、椽距 600、门 2100–2200 × 1000–1200、窗台 1400），16 层贴图按 §12.1 表；25 个 archetype 全部映射（xiyu 的 `market`、`palace` 等按土坯配方；`pagoda` → `pagoda_oct`；`wharf` 映射到 `stall` 或标 `unsupported` 并在报告说明）。
4. `content/town/buildkits/city-kits.yaml`：`city_turpan__ch10: xiyu:tang_buddhist`；大理两城用 `song_dali`；其余城留空（编译器按类型名里的套件前缀回退）。
5. 测试（`packages/data/src/build/town-plan/__tests__/kits.test.ts`）命名用例：两套件校验通过；25 个 archetype 在两套件都可解析（alias 展开后）；数值都在 §3 范围内（逐项断言）；`tang_buddhist` 变体里 `dome` / `pointed_arch` 被禁用；编译后每套件 JSON ≤ 12 KB 且两次编译逐字节相同；alias 指向 alias / 不存在项时报错。

## 约束
- 只写：`packages/data/src/build/town-plan/kit/**`、`packages/data/src/build/town-plan/types.ts`（仅充实 `CompiledBuildKit`）、`packages/data/src/build/town-plan/__tests__/kits.test.ts`、`content/town/buildkits/**` 与本任务报告。
- 规划器侧纯整数（比例用万分比 bp）；不用三角函数 / `sqrt` / `pow` / `random` / `Date`；不新增依赖（YAML 解析用 data 包已有的库）；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-p1-kits.md`（≤ 60 行）：第 3 节列两套件关键数值与依据（§3 哪一行）、`unsupported` 的类型与理由、编译后体积；第 7 节写给 p2 规划器与网格器的交接（怎么读尺寸档、贴图层下标）。

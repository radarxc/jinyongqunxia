# 本任务：城镇探索 v2 · 城镇编译器 v2 核心 `packages/data/src/build/town/**`——布局 → 区域场景（格层、建筑方案、门、城墙城门、设施店员、打坐点）+ 不变式 I1–I6

**第一个动作**：读 `tools/agents/reports/ENG-town2-regionmap-ext.md` 第 3、7 节（`town-scene.v1`、chunk `surface / blocked / building` 层、`FacilityNpc / Exit / MeditationSpot`、编码函数）与 `tools/agents/reports/ENG-buildgen-p0-scaffold.md` 第 3、7 节（`planBuilding` 签名、坐标框 `frame.ts`、盒子方案），再读 `docs/tech/15-town-explore-v2-spec.md` §2.3–2.5 与 §3，打开大理 ch01 布局 `assets/default/baseline/town/town_dali__ch01.layout.yaml`（看 `runtime_partition`、`walk_layer.runtime_hex_walkable`、`buildings[]` 的 `id / type / footprint / entrances`）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（data 层只做 schema、内容格式与加载边界，不做规则结算；编译器是构建期工具）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配，希望用threejs做一个能进入建筑的游戏体验。同时，采买这些都在建筑里进行（搭配NPC对话）。」城镇并入区域引擎：每座城编译成一个区域场景 `sc_<NN>_town_<city>`，core 在其上寻路、交互，render 按建筑方案生成 3D 古建。现有 v1 编译器（`tools/content/town_runtime.py`）依赖 45° 贴图、丢城墙城门与植被、只编了大理和临安。本任务写 v2 编译器的核心（纯函数 + 测试）；源文件抄录工具与接进 `buildContent()` 是后续任务 TOOL-town2-sources-pipeline。

## 要做的事（`packages/data/src/build/town/`）
1. **入口** `compileTownScene(input, deps) → { map: RegionMap /* 含 town-scene.v1 扩展 */, diagnostics }`：
   - `input`：布局对象（已解析的 YAML）、城市源信息（`cityId`、`layoutKey`、`chapter`、`visualKit`、`displayNameKey`、`historicalYear`、城墙折线与城门）、设施文件（`town-facilities.v1`）、布局 sha256。
   - `deps.planBuilding`：**可注入**，缺省用 `@tianshu/data` 内 `build/town-plan` 的 `planBuilding`（p0 目前是盒子方案；后续 p2 换成真规划，本编译器不需改）。
2. **步骤**严格按 tech/15 §3.2 的 1–8（坐标框 → 室外格 → 建筑 → 门 → 城墙城门 → 设施店员 → 打坐点与植被 → 规范 JSON）实现，每步一个文件（如 `frame.ts`、`outdoor.ts`、`buildings.ts`、`doors.ts`、`walls.ts`、`facilities.ts`、`extras.ts`、`emit.ts`），坐标换算复用 `town-plan/frame.ts`，不要另写一套。
   - 室内可走判定按 tech/15 §2.4 规则 2（C6：格心在 floors 减阻挡家具内、离实体边 ≥ 250 mm；两格边中点在 floors 内或在占地外才连通）；**不用**六顶点法。
   - 门格全场景唯一：冲突时沿该边挪最多 ±3 m，仍冲突则失败并在诊断里给出两栋 ID。
   - 场景 ID：`city_dali__ch01` → `sc_01_town_dali`；出生点 `spawn_<gateId>`；`Exit` 在城门外侧行。
   - `town-scene.v1`：`kitRef` 写套件 ID（如 `song_dali`），`signAtlasRef: null`（招牌图集是后续美术任务）。
3. **不变式** `invariants.ts`：I1–I6（tech/15 §3.3）各一个检查函数，返回诊断；编译入口在输出前全部执行，任一失败即抛 `TOWN_COMPILE_INVARIANT:<Ix>`。
4. **夹具**：`packages/data/src/build/town/__fixtures__/` 放三座试点城的最小城市源与设施文件（测试专用，不进 `content/`）；布局直接读工作区已稀疏检出的三份 YAML（大理 ch01 基线、大理 ch10、吐鲁番 ch10）。

## 测试（`packages/data/src/build/town/*.test.ts`，命名用例）
- 三座试点城都能编译，I1–I6 全部通过；输出 `RegionMapSchema` 校验通过。
- I6：同输入两次输出逐字节相同；**大理 ch01 的 sha256 在测试里锁定**——锁定用例必须注入测试夹具里固定的盒子规划器（`__fixtures__/box-planner.ts`，照抄 p0 盒子方案的规则），不得用缺省 `planBuilding`：p2 会并行替换缺省规划，用缺省值锁 sha 会让 p2 合入时本测试失败。另用缺省 `planBuilding` 跑一遍三城，只断言 I1–I6 与 schema，不锁 sha。改编译行为必须同步更新锁定值并在报告说明。
- I5：三城场景都 ≤ 256² 槽、原始 JSON ≤ 300 KB（打印实际大小）。
- 门：每栋可进建筑恰一个门格且全场景唯一；人为构造两栋共用门格的布局 → 挪位成功；挪不开 → 抛错且信息含两栋 ID。
- C6：6×5 盒子方案的室内可走格数与手算一致；1.4 m 门洞两侧格连通、墙体格不连通（边中点规则）。
- 注入：传入自定义 `planBuilding`（例如所有建筑 `enterable: false`）后输出相应变化，证明可注入。
- 吐鲁番 ch10：布局类型 `bld_kit_song_dali_*` 也能编；`visualKit` 取源信息而非类型名。
- 设施：`stn_keeper` → `FacilityNpc`（`interactRange: 2`），服务格非空且 I3 成立。

## 协调者裁定（2026-10-12，r2 审核后；审核以此为准）
- **文本键契约已统一**（集成分支 995f9ebfc，本任务基点已挪到其后）：
  - `town-scene.v1`、`region-map.v1`、`region-binding` 的 `TextKeySchema` 改成与 `town-facilities.v1` 同一文法，允许 `town.city_dali__ch01.yaopu_01.name` 这类带布局键的名键。
  - 测试里不许再改写输入（删掉 `schemaCompatible()` 一类转换）。
  - 三份原始设施夹具与正式设施格式的 `nameKey` 逐字节照抄，直接通过编译、schema、I1–I6 与默认规划器测试。
- r2 返修说明的第 2–7 项（入口 I6 真比两次独立编译、I2 只沿真实区域边 BFS、`passageBetween()` 从门中心逐边穿墙、城墙按 C7 保留 `id` 的数组、mulberry32 几何用例、用原始三城输入重出统计与 golden SHA）照审核原文做，写集不变。

## 约束
- 只写：`packages/data/src/build/town/**`（含 `__fixtures__`、测试）与本任务报告。
- 不改 `packages/data/src/build/{pipeline,discover,types}.ts`（接入构建是 sources-pipeline 的事）、不改 `town-plan/**`（p1 / p2 并行在写）、不改 schema（regionmap-ext 已定；若必须扩充，只在报告提出，不自行改）、不改 `assets/**`、不改 `content/**`；不新增依赖。
- 纯整数毫米；不用 `Math.random` / `Date`；排序带比较器；输出用仓库现有规范 JSON 工具（`@tianshu/shared` 的 canonical JSON）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-town2-compiler-core.md`（≤ 80 行）：第 3 节列三城编译结果（槽数、可站格、室内格、建筑 / 可进建筑数、门格挪位次数、JSON 字节、sha256 前 12 位）；第 4 节列遇到的布局异常与处理；第 7 节写给 TOOL-town2-sources-pipeline（入口签名、输入从哪来、缓存键）、ENG-buildgen-p2（换真规划后哪些锁定 sha 会变）与 ENG-town2-explore-walk（`building` 层与 `FacilityNpc` 的语义）的交接。

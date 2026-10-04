# ENG-battle-modules-lazy 报告 · 游戏工程 · 小修：只有进战斗才用的模块（遭遇 encounter.v1 schema 与 builder 等）移出首次会话静态闭包，改走战斗懒加载块；构建期校验不漏、运行时失败可恢复（AR-64，协调者 10-03 23:0x）
## 1. 摘要（3–6 行）
- `@tianshu/data` 根入口不再导出 encounter parser；完整 schema/解析器、战斗 presentation 与模型选择只由 `battle/runtime.ts` 懒加载路径触达。
- 章节加载只保存不可变原始 JSON，并检查 schemaVersion、ID、章节归属、重复 ID 与 Quest→encounter 引用。
- 构建工具仍以完整 schema 和全局内容索引阻断错误；战斗首次使用失败统一为可恢复的 `BATTLE_ENCOUNTER_INVALID`。
- schema 字段、战斗规则、RNG 均未改；规范 JSON 对比证明解析与 BattleSetup/seed 产物逐字节一致。
## 2. 产出（文件、行数、主要章节）
- `packages/data/src/{encounter-content,schemas/index,tooling,content-registry}.ts`：拆分战斗 parser、类型 barrel 与构建期 schema 入口；根入口保持无 parser 值导出。
- `packages/data/src/build/{field-registry,validate.test}.ts` + invalid fixture：登记 encounter 规则叶片并验证构建期拒绝。
- `apps/game/src/runtime/{content,item-content,session}.ts`：轻量登记、引用检查、稳定错误；presentation 移出 session。
- `apps/game/src/battle/{encounter,runtime}.ts`：战斗时完整解析/构建、模型选择及动作后投影；Vite 模块图回归覆盖真实求值顺序。
- `packages/core/src/testing/*`：测试夹具不再在模块初始化时解析 schema；生产 schema/builder 本体未改。
## 3. 关键结论与数值
- 改前同 HEAD `8f1442e1` 产物：worker `2.43`、session static `87.89`、base `6.84`、首次合计 `97.16`、战斗增量 `53.22` KiB gzip。
- 改后实测：worker `2.43`、session static `85.36`、base `6.84`、首次合计 `94.63/110`、战斗增量 `65.38` KiB gzip，门禁 PASS。
- 差值：session static `-2.53 KiB`，首次合计 `-2.53 KiB`，战斗增量 `+12.16 KiB`。
- 改前 schema 经 `item-content → @tianshu/data → content-registry`、模型选择经 `session → model-selection` 启动求值；改后均经 `battle/runtime` 加载。builder 原已在战斗块并保留。
- 产物审计：`regionArena` 启动零命中、仅战斗 `content-registry-CjozmNPp.js`；builder 特征启动零命中、仅战斗 `builder-C_dDI6md.js`。
- Vite 模块图实测 `loadGameContent()` 后 schema/builder 均未求值，加载 battle runtime 后两者均求值。
- 首次加载仅校验 envelope、ID、章节、重复及 Quest 引用；完整字段/语义由构建期校验，战斗首次使用时再解析。
- 未留已确认且仍在启动闭包的纯战斗模块；builder 本就懒加载未重复挪，session 仅保留进战前意图、遭遇 ID 与协议。
- 挪基点解冲突：`content.ts` 合并 `BattleModelCatalog`/`JsonValue`；generic-model 改由动态 `BattleRuntime.withModels` 调用；Vite 边界用例固定显式超时 30 秒，无负载分支。
## 4. 开放问题（附默认值）
- 正式 `world/battleRequested`→encounter 构建接线仍属 ENG-26 后续；默认保持现有协议，不在本加载边界小修改写命令总线。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；落实 AR-64，未改规则、数据语义、预算或量具。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- game runtime 后续接线：消费 `world/battleRequested` 时按 ID 取 `GameContent.encounters[].value`，调用 `BattleRuntime.buildEncounter`。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`；lint、全仓 typecheck、176 文件/1259 测试；定向 4 文件/32 测试。
- ⚠️ `pnpm check` 在上述通过后、`pnpm content:build` 均仅因沙箱 `tsx listen EPERM` 停止；未改 shim，待沙箱外原样复跑。
- ✅ 游戏生产构建、体积（94.63/110）、dev chunks（625/92）、双特征闭包审计与 `check_ids.py --strict` 通过；strict 新失败 0。
- ⚠️ 下游须在沙箱外原样执行：`pnpm check && pnpm content:build && python3 tools/lint/check_ids.py --strict`，确认三段均退出 0。
- ✅ `git diff --check` 通过；仅改授权源文件与本报告，量具/预算未改。

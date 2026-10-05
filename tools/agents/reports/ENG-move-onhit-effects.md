# ENG-move-onhit-effects 报告 · 游戏工程 · 招式命中附带效果：move.v1 加 onHit（附 Buff / 击退）与 parryable；战斗结算消费（确定性 RNG 子流）；补 bf_shiheng / bf_pojia / bf_dongyao 定义；序章越女剑四招填值

## 1. 摘要（3–6 行）

- `move.v1` 已兼容新增附 Buff、击退与不可招架字段，引用未登记 Buff 会给出文件、招式 ID 与值。
- 新增最小严格 `buff.v1` 与 3 个通用定义；四招按名录填值，省略新字段的旧内容不变。
- Core 已用确定性子流施加/刷新 Buff；正式越女剑以武功 `effGrade` 编译，缺品阶在编译/开战入口立即报错。
- 逐格击退现覆盖上坡、撞击、坠落、场外/落台与逐单位 Boss 免疫；100 次确定性及正反例均通过，无 golden 变更。

## 2. 产出（文件、行数、主要章节）

| 文件组 | 文件数 / 当前行数 | 主要产出 |
|---|---:|---|
| `packages/data/src/schemas/{buff,move,index}.ts` | 3 / 253 | 严格 schema、显式来源编译、类型导出 |
| `packages/data/src/{content-registry,content-index,build/field-registry,content-schemas-m1.test}.ts` | 4 / 718 | kind、引用校验、打包分类、正反例 |
| `packages/core/src/{battle,buff,testing}/**` | 12 / 3785 | 结算、子流、位移、边界元数据、修正、事件与测试 |
| `content/common/buffs/*.yaml`、四招、`content/CLAUDE.md` | 8 / 190 | 3 Buff、4 招填值、位置约定 |
| 本报告 | 1 / ≤60 | 结论、边界、交接与门禁 |

## 3. 关键结论与数值

- 新字段：`onHit.applyBuffs[{buffId,chanceBp,turns}]`、`onHit.displace{kind:'knockback',cells}`、`parryable?`；后者省略即 `true`。
- 对接 05：`BuffApply.id → buffId`、`chance → chanceBp`、`dur → turns`；品阶不入招式字段，由 `compileBattleMove` 写入来源武功 `effGrade`，缺失即 fail-fast。
- 最小 `BuffDef` 已实现身份/分类/品阶/标签/族与抗性、turns、refresh、驱散、优先级、参数、所需 `modStat/modRecovery`、UI/文本/来源。
- `bf_shiheng`：命中 `−2%×G`、招架 `−4%×G`、下一招收招 `×1.20`；`bf_pojia`：外防 `−6%×G`；`bf_dongyao`：效果抵抗 `−5%×G`。9 品 `G=2.40`，依次为 −480/−960/−1440/−1200 bp。
- 效果率按 04 整数式末尾一次取整；招架成功额外 `×0.50`。子流名 `battle/onHit`：每个含附加 Buff 的命中目标固定消费 1 次 battle draw，再由身份键派生临时子流。
- 击退沿攻方→目标方向逐格：墙/上坡/单位停靠并撞击（目标 `20%×D_hit`、被撞者 `10%×D_hit`）；高落差按 `safeDrop'=1+jump` 与 08 公式结算。
- 场外元数据区分墙、坠落、水域、虚空；擂台出界记 `fled`，虚空记 `plunged`，仅逐单位 `boss:true` 在边缘停下撞击；`parryable:false` 不掷招架 RNG。
- 事件：`battle/buffApplied`、`battle/displaced`、`battle/collisionDamage`、`battle/fallDamage`、`battle/fellIntoWater`、`battle/unitPlunged`、`battle/unitRingOut`。
- `pnpm size`：标题页 entry **38.79 KiB**、首次会话 **91.77 / 110 KiB PASS**、战斗增量 **75.63 KiB**（gzip）。

## 4. 开放问题（附默认值）

- 未实现的 `BuffDef`：改名/互斥、其他 duration/stack、驱散难度、snapshot、其余 Mod、triggers/onApply/onRemove、tierTraits、reactions、persist、Boss/limits、hidden/systemExempt、VFX/SFX、AI 估值及完整标签/抗性枚举。
- 通用免疫、品阶穿透、`resGrade`、族上限与表达式编译器仍属完整 Buff DSL；默认本批 3 条走已验证的专用整数投影。
- 正式角色槽→`BattleUnitSeed` resolver 仍是既有下游缺口；默认必须以 `{skillId,effGrade}` 编译招式并传逐单位 Boss 身份，否则编译/开战 fail-fast，不再回退 1 品。
- 落水只发事件，尚未施加本任务写集外的 `bf_luoshui/bf_shishen`；坠落骨伤同理。默认交地形/Buff 后续任务补定义与触发。
- 建议后续 `ENG-buff-v1-full-dsl` 补 schema/表达式编译器，并补齐落水、骨伤与其他 Buff 定义。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。上述两项是把既有 06/09 规则补全为工程协议，不改变设计基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 | 需同步 |
|---|---|---|
| CONTENT 后续招式 | `move.v1` 配表指南 | 使用本节字段、bp 概率和正回合；Buff 必须先登记，不写品阶 |
| ENG-27a / 27b | 属性 v2 汇总/快照 | 迁移 `hit/parry/defOut/effRes` 专用投影及 `sourceGrade=effGrade` 接线 |
| 战斗界面 | 日志、飘字、棋盘动画 | 消费 §3 七类事件；按 `battle/displaced.payload` 演出，不自行重算概率、伤害或落点 |
| 地形 / Buff 后续 | 落水、坠落附带 | 消费落水事件并补 `bf_luoshui/bf_shishen`；按 08 补坠落骨伤 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 交接已登记：CONTENT 配表、ENG-27a/27b 属性迁移、界面事件消费均见 §6。
- ✅ schema 正反例、旧招兼容、引用诊断、3 定义和四招值均覆盖；正式 YAML→9 品 Buff、缺品阶 fail-fast 均有测试。
- ✅ Core 覆盖命中/落空、刷新/递减、3 修正、上坡/撞击/坠落/场外/落台、逐单位 Boss、不可招架、失衡及 100 次同字节；Data 16/206、Core 47/552、全仓 163/1206 通过。
- ✅ lint、typecheck、`pnpm size`、strict IDs（新增失败 0）与 `git diff --check` 通过；install frozen 通过。
- ⚠️ `content:build`、`content:validate` 及聚合 `pnpm check` 仅在沙箱被 `tsx` Unix socket `listen EPERM` 阻断；未改 shim，需校验阶段在沙箱外复跑。
- ✅ 未改现有 golden、依赖、UI/render、`node_modules` 或写集外文件；新增内容后首次会话仍低于 110 KiB。

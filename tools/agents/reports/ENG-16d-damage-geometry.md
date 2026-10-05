# ENG-16d-damage-geometry 报告 · 游戏工程 · 战斗补全 D：伤害链接入几何（方位 / 高差 / 地形 / 遮蔽 / LOS 命中修正；审计 H1）

## 1. 摘要（3–6 行）

- 已将六向动态方位、高差、格地形、方向遮蔽与 LOS 命中修正接入逐目标 Z0 / Z7，关闭审计 H1。
- 新增 `queryDamageGeometry` 纯查询供结算、范围预测与 UI 共用；范围目标仍按距离、同距 `unitIndex` 逐个结算。
- 抽象自动战斗保持不读取棋盘；近战守势查询与实际转向一致；静态 `move.direction` 不再覆盖真实格位。
- 全部指定门禁通过；回放 hash 仅因新增规范化格字段改变，已有拒绝路径与 RNG 事务不变。

## 2. 产出（文件、行数、主要章节）

| 文件组 | 文件数 / 当前行数 | 主要产出 |
|---|---:|---|
| `battle/geometry` | 2 / 591 | 纯几何查询、方位 / 高差 / 地形 / cover / LOS 与 21 向量 |
| `battle/action` | 2 / 1,412 | 逐目标接 Z0 / Z7、抽象中性分支、生产回归 |
| `battle/encounter`、types、fixture | 4 / 762 | 格字段类型、输入校验、默认化、稳定排序 |
| replay / bench / core 指南 | 3 / 378 | hash 归因、性能夹具、共享查询契约 |
| `apps/game/src/battle` | 4 / 248 | `AreaPreview.targetGeometry` 展示适配 |
| 合计（不含报告） | 15 个文件，3,391 行 | +371 / −40；无写集外改动 |

## 3. 关键结论与数值

- 方位：`delta=(sourceDir-facing+6)%6`；3=back，2/4=side，其余=front；Z7 为 1.30 / 1.10 / 1.00。
- 命中高差 `clamp(4×Δh,-12,12)`；melee Z7 `clamp(500×Δh,-1000,1000)`；ranged/projectile `clamp(400×Δh,-1200,1600)`；sonic/self 为 0。
- `hitAdd=heightHit+cover.hit+LOS.hitPenalty`；LOS 每格 partial −10、至多 −20；projectile 两格 partial 阻断沿用 hex LOS。
- 地形池 `clamp(attacker.dealt+defender.taken+cover.damageBp,-3000,3000)`；`F7=floor(dir×height×terrain/10000²)`，整体 5000–20000。
- `evadeRatingDelta=0`：当前 protocol 4 正式值为中性，ENG-16b 未提供旧协议生产投影。

## 4. 开放问题（附默认值）

1. `asBack/asHigh` 尚无正式 Core 投影字段；默认忽略旧静态 `move.direction`，全部按实际格位，待招式效果投影任务补显式覆写。
2. 地表区域的伤害来源格须在其持久伤害段落地时取区域中心；当前即时范围均以施放者实际落点为来源。
3. `evadeRatingDelta` 仅供 protocol≤3；默认 0，待旧协议回放 runner 若进入本 resolver 再接投影。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG-16d-P01：统一 `design/04` §7.5 与 `design/09` 的范围目标顺序为“距来源格升序、同距 `unitIndex`”；代码按 09，避免近目标反应被远目标抢先。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/04-damage-formula.md` §7.5：按 P01 改目标批次顺序。
- `docs/design/05-martial-arts-system.md` / 内容 schema：将 `asBack/asHigh` 投影为显式几何覆写，不复用静态展示字段 `direction`。
- ENG-16c / ENG-16e：预测和界面直接消费 `queryDamageGeometry` / `AreaPreview.targetGeometry`，render 不重算；地表持续段传区域中心。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 验收项 | 结果 |
|---|---|
| 接线点与公式 | ✅ `geometry/index.ts:111–135` 统一求方位、高差、cover、LOS、地形；`action/index.ts:216–249` 接 `hitEff/eva_eff/direction/heightAddBp/terrainAddBp`；每目标循环独立查询。 |
| 向量测试表 | ✅ front / side / back × Δh=−3…+3 共 21 向量；命中为 −12…+12，melee 高差 bp 为 −1000/−1000/−500/0/500/1000/1000，Z7 逐项断言；另测 ranged/projectile/sonic。 |
| 遮蔽 / 冠层 / LOS / 地形 | ✅ 方向 cover、生效 delivery、partial −10、地形池与实际同一命中随机数分支均覆盖。 |
| 范围 / 确定性 / 拒绝 | ✅ 多目标不同方位与地形独立结算，顺序为距离→`unitIndex`；格排列 100 次、纯查询、抽象棋盘隔离、拒绝状态/RNG 原测试均通过。 |
| golden 差异 | ✅ `e3e334…b26e3`→`1b9401…a850`；删除 setup/state 格的 `terrainDealtBp/terrainTakenBp/cover` 精确恢复旧 hash，再删 ENG-16b 字段恢复 ENG-16a hash；未盲目重录。 |
| 文档冲突 | ✅ 登记 L3：04 §7.5 的 `unitIndex` 与 09 的距离优先冲突，代码维持 09。 |
| 下游接口 | ✅ Core 导出纯 `queryDamageGeometry`；game 预览返回逐目标 `direction/heightDelta/heightHit/hitAdd/heightAddBp/terrainAddBp/positionBp`。 |
| 门禁 | ✅ install；`pnpm check` 111 文件/746 测试；core 39 文件/414；performance 4 文件/6；game build；strict ID；coverage 聚焦 geometry 94.16% lines / 82.52% branches；diff check。 |
| 边界 | ✅ 未改 meridian-flow/timeline/ai/command/api/state/world/economy/render/components，无依赖、浮点规则状态、门禁放宽或高负载跳过。 |

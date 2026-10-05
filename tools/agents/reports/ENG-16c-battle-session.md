# ENG-16c-battle-session 报告 · 游戏工程 · 战斗补全 C：战斗规则收回 core（BattleSession / 命令总线 / 世界流种子 / 实战=回放；审计 S3、M3、L4）

## 1. 摘要（3–6 行）

- 完成 BattleSession 与六个战斗命令：core 持有 RNG、自动推进、终局、上限和录像，app 只转发并投影。
- 入场从 world 流取种子；retry 保留历史；finalize 原子提交背包、资源、章节限用与训练次数，回执幂等。
- 修复 S3 实战 / 回放事件不一致、M3 历史重复克隆、L4 抽象战斗重新播种，并补逐写入回滚测试。
- 七项指定检查全部通过；无新增依赖、无改门禁阈值、无修改 meridian-flow / UI 组件 / data。

## 2. 产出（文件、行数、主要章节）

| 文件 / 组（行数为当前全文，非新增量） | 行数 | 主要内容 |
|---|---:|---|
| core `battle/session.ts`、`candidate.ts`、`rewards/settlement.ts` | 162 / 20 / 37 | 会话、追加候选、奖励投影与训练账本 |
| core `command/battle-handler.ts`、`state/immutable-json.ts` | 135 / 35 | 六命令事务、冻结历史校验缓存 |
| core `replay/index.ts`、`ai/index.ts` | 121 / 222 | 同会话回放、调用方 RNG 与 AI 快速路径 |
| core battle / command / state / replay / ai 变更合计（含测试） | 27 文件 / 5033 | 单位版本、原地路径、章节用量、回滚与状态校验 |
| core `bench/combat.fixture.ts`、`combat.test.ts` | 63 / 42 | 20 回合原门禁、1000/2000 行动与事务性能 |
| app `battle/runtime.ts`、`runtime/session.ts`、`runtime/battle-replay.test.ts` | 123 / 560 / 54 | 瘦适配、原生命令与应用回放回归 |
| core / app `CLAUDE.md` | 228 / 167 | 入口、状态、缓存、奖励与下游约定 |

## 3. 关键结论与数值

- 上限沿用 `min(2000,max(60,N×40))`：2 单位为 80 次，50 参战者性能夹具为 2000 次（其中 2 人活动）。
- 武学使用权重普通 1、绝招 3；移动训练与周天使用上游事实，未引入次数到 SXP 的猜测系数。
- 最终 best-of-5：会话 1000/2000 次为 54.70/99.90 ms（1.83×）；总线为 239.69/465.32 ms（1.94×）。
- 20 回合 best-of-9 为 2.11 ms，原 20 ms 阈值保留；审计 §3.5 旧值 5.84 ms 仅作历史参照，非同机同步 A/B。

## 4. 开放问题（附默认值）

- SXP / 永久穴脉成长、伤势 / 调息、地形 / 任务结算尚缺完整输入；默认持久化精确训练次数和现有资源，不猜系数。
- ENG-16e 接按钮 / 高亮和最终随机掉落展示；默认保留现有 capability，预结算投影只含确定奖励。
- ENG-22 补整局录像与 deploy/order/free/concede/undo；当前支持 act（含 wait 别名）、setAuto、retry。跨浏览器 / 真机仍（待实测）。
- 老 schema 3 缺 receipts / training 时按需创建，旧版非空 battleUses 迁移仍明确拒绝，默认不猜活动战斗归属。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；此次为现有规则归 core 与可验证性修复，不新增原著事实或玩法数值。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/05-gameplay-engine.md` | §7.7、§14.3–14.4 | 落地会话 / 两流 / 重试混合公式、回执与训练事实；完整养成和其余录像指令继续标未接 |
| `docs/tech/09-roadmap.md`、`TODO.md` | 确定性闸门 / ENG-16c | 登记本报告结果；浏览器对拍和完整世界奖励保留依赖 |
| `AUDIT-code-20261002.md` | S3、M3、L4 | 登记 core 统一会话、追加缓冲、外传 RNG 修复证据 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 六命令统一 handler；`BATTLE_NOT_ACTIVE`、`BATTLE_STALE_REVISION` 为适用命令的公共拒绝码；下表省略重复的 `BATTLE_` / `battle/` 前缀：

| 命令 | handler 分支 | 主要拒绝码 | 事件 |
|---|---|---|---|
| battle/enter | battleHandler → createBattleSession | BATTLE_ALREADY_ACTIVE | battle/entered |
| battle/act | battleHandler → act/stepBattleSession | BATTLE_ENDED / AUTO_ACTIVE / MANUAL_TURN / NOT_MANUAL_TURN；BATTLE_ACTION_REJECTED+at | 原行动事件、autoExchangeResolved、ended / autoSimulationEnded |
| battle/setAuto | battleHandler → setBattleAuto | BATTLE_ENDED / AUTO_FORBIDDEN | autoSimulationStarted / Ended；同模式零写入 |
| battle/retry | battleHandler → retryBattleSession | BATTLE_NOT_ENDED | battle/retried |
| battle/finalize | battleHandler → finalize | BATTLE_NOT_ENDED / RECEIPT_MISMATCH / REWARD_ITEM_UNKNOWN / REWARD_CAPACITY | battle/rewards、battle/finalized |
| battle/leave | battleHandler → finalize | BATTLE_NOT_ENDED / RECEIPT_MISMATCH / 奖励拒绝 | rewards、finalized、left |

- ✅ BattleSession 保存 opening、battle、battleRng、aiRng、acceptedOrdinal、decisionOrdinal、revision、retryCount、auto、outcomeSeq、commandLog；自动行动携带实际命令和 aiSeed。
- ✅ enter 同事务抽 `world.nextU32()` 一次；实例 ID=`setupId:nextRuntimeOrdinal`。retry 不抽 world，令 `x=(openingSeed ^ retryCount ^ 0x9e3779b9)>>>0`，依次 `imul(x^(x>>>16),0x85ebca6b)`、`imul(x^(x>>>13),0xc2b2ae35)`，最后 `(x^(x>>>16))>>>0`；固定向量 0x12345678、1→0x48c69a09。
- ✅ 每条命令均有成功 / 拒绝，六命令逐 set/splice/RNG 抽样后抛错验证整个状态回滚；另测提交校验失败、随机掉落后失败再提交、冻结缓存覆盖 / 可变追加。
- ✅ finalize 两次只生效一次、同遭遇重复进入有不同回执、leave 不绕过消耗、章节限用跨战斗有效；world/tick 战中返回 WORLD_PAUSED。
- ✅ 实际 app.dispatch transcript 与 runBattleReplay：普通战斗 41/41 事件，live=`ac76c3d74a696114621dc588b05415bd20a5c0302ca5511073934cde172f0241`，replay=`ac76c3d74a696114621dc588b05415bd20a5c0302ca5511073934cde172f0241`。
- ✅ 上限战斗 80 次 / draw，85/85 事件，live=`14d09aae4e3cd02a5e60b79471ace134e177f5b96f36329aa8afa933ce4b6c42`，replay=`14d09aae4e3cd02a5e60b79471ace134e177f5b96f36329aa8afa933ce4b6c42`；另测原生命令经过两次终局和一次 retry。
- ✅ M3：旧路径每行动两次深拷贝增长历史，app 再克隆并 stringify；现在只克隆单位 / 小账本、历史追加、revision 投影。续作优化前同夹具 2000 次总线 850.86 ms，最终 465.32 ms；无旧提交 2000 次实测，不虚构基线。
- ✅ 性能门禁保留旧 20 ms；新增 2000 次 ≤2000 ms、1000→2000 ≤3×、总线 best-of-3 ≤2000 ms。曾在完整套件超时，通过原地路径 / AI 查询及冻结数据校验优化解决，未改超时 / 阈值 / 样本数。
- ✅ L4：simulateAbstractBattle 显式接当前 RNG，测试中途流已推进后结果区别于开局流；core 禁浮点 / DOM / 墙钟 / Math.random 的 lint 通过。
- ✅ Golden 逐项解释：新两手动命令 SHA=`63a0b822bf5f06550cf411d5dfd861bf0cc3216f4bfbfb919a1c80246f6d2fdf`；移除 revision/retryCount/auto/outcomeSeq 与单位 revision、还原旧 decisionOrdinal=2，精确恢复 ENG-16d SHA=`1b94019028cfc9c71c7caac3975e623c0f46f01e07bfe4323c697843f3a7a850`；再移除既有几何 / 经脉新增字段的旧对拍仍通过。
- ✅ 应用序列保留 11 行动、首两次聚气、9 周天与完整奖励明细断言；只新增 setAuto 记录和每次 aiSeed，rewards 移至世界 finalize；入场事件改 entered / 唯一 battleId，WORLD_PAUSED 与可序列化会话替代旧 app 拒绝。未直接重录 golden。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`、core test、core test:performance、game test、game build、`check_ids.py --strict` 全部退出 0。完整 143 文件/1029 测试；core 45/503，性能 4/8，game 30/104；内容 987 文件通过。
- ✅ 包体积 entry 38.44 KiB /170、render 161.87 /180、WebGL 200.32 /350，dev-chunks 通过；构建仍提示既有 settings 混合导入与 >500 kB chunk。严格 ID 新错误 0，保留仓库基线 1 个未定义引用。
- ✅ bits-unit-test-gen 完成范围 / 缺陷 / 用例与执行；未要求覆盖率比例，跳过覆盖率统计；utree flush 成功。
- ✅ 技术核实（2026-10-03）：[Math.imul](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul) 为 32 位乘法；[Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) 仅浅冻结；[pnpm 9.15.9](https://registry.npmjs.org/pnpm/9.15.9)、[Vitest 5.0.3](https://registry.npmjs.org/vitest/5.0.3)、[Vite 8.3.1](https://registry.npmjs.org/vite/8.3.1) 经 registry 核实。无新增价格 / 配额。
- ✅ ENG-16e：复用 queryBattleAction / previewBattleRoute / queryBattleQi、queryReachable / queryPath / queryDamageGeometry；传 expectedRevision，消费 projectBattleRewards 与 finalize 的最终 rewards，不另算 RNG / 次数。
- ✅ ENG-22：冻结 opening、commandLog（已接受前缀）、battleRng/aiRng 和 replaySessionProjection/hashBattleReplay 可直接复用；整局使用 core 六命令与运输回执，不把 world/loot 随机塞进战斗重放。
- ⚠️ 当前未承诺浏览器 / 真机一致性、完整养成 / 场景写回或未实现录像指令；缺口见 §4。BattleRuntime 无 session 构造仅为现有展示夹具兼容，仍调用 core 工厂，不拥有 RNG 或步进。

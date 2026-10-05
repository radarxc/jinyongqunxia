# ENG-14b-meridian-golden-v3 报告 · 游戏工程 · 经脉协议 3 黄金：Python 参考升协议 3、重录 v3、对拍生产 runtime（审计 S1）
## 1. 摘要（3–6 行）

- Python 已新增独立的协议 3 `fluxCap=1..64` 逐 tick 管线，同时冻结协议 2 路径供旧录像回归。
- 新录 `fixtureVersion=3` 工件已由 SHA 硬锁；TS 门禁直接驱动生产 `MeridianFlowRuntime` 与生产纯函数。
- v3 支持项逐字段对拍全部一致；协议 2 孪生实现已明确降级并改名为旧录像回放器。
- 调息与防守 / 移动路线提交仍是生产接口缺口，工件与测试均显式记录，没有伪造为通过。

## 2. 产出（文件、行数、主要章节）

- `tools/balance/meridian_flow_sim.py`（1808 行）：保留 v2，新增独立 v3 状态机、纯函数、只读检查与人工重录入口。
- `tools/balance/meridian_flow_golden_v3.json`（2924 行）：协议 3 的四单位、曲线、控制、调息参考及五档 TTK 向量。
- `tools/balance/test_meridian_flow_v3.py`（41 行）：旧 SHA、v3 现场复算与 Python 实例隔离。
- `packages/core/src/battle/meridian-flow/meridian-flow.production-golden.test.ts`（161 行）：生产 runtime 逐字段门禁。
- `legacy-protocol2-replay.ts`（574 行）及旧黄金测试：仅验证 fixture 2 迁移前录像；`golden-runner.ts`（8 行）只保留弃用兼容转发。
- `math.ts`（207 行）：补齐协议 3 速度、擒拿与点穴投影入口；`README.md`、`packages/core/CLAUDE.md` 记录边界。

## 3. 关键结论与数值

- 身份：fixture/rules/RNG=`3/3/2`，seed=`20260927`，SHA=`be7dcad8f03edc48b8f08b86c40f1a204b94e8ec261bbdea625591f5711a7143`。
- v2 身份仍为 `2/2/1`，SHA=`af33dcd10dc196e18811fe485870666ab139c03a17342fa47113ecc19552cd76`。
- 防守样本：6 段、`9361 bp`，`1000×9361/10000=936`；额外硬锁相对强度 `20000→5500 bp`。
- 外放护体样本守恒：`cancelled 1050 + damageBeforeMpGuard 150 = postShield 1200`，`zoneQiSpent=133`。
- 支持字段不一致项为 0；新增生产投影入口沿用 design/21 表值，没有为通过测试改写 golden。

## 4. 开放问题（附默认值）

- O1：生产 runtime 尚无 `regulateBreath`；默认保留参考向量并令 `supportedByProductionRuntime=false`，接入前不宣称通过。
- O2：防守 / 移动路线可构造、推进和预览，但 `commitMove` 仅接受攻击；默认保持拒绝并由后续战斗接口任务补提交语义。
- O3：当前 design/21 已转 protocol 4；默认把本工件作为 protocol 3 迁移黄金冻结，protocol 4 另立工件，不覆盖 v3。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。协议 3 任务按既有迁移契约落地；protocol 4 演进与两个生产接口缺口不应反改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 同步内容 |
|---|---|---|
| `docs/tech/09-roadmap.md` | §3.5「经脉黄金」 | 闸门口径改为“协议 3 golden + 生产 `MeridianFlowRuntime`”，旧回放器不算生产证据。 |
| `docs/design/21-meridian-flow-and-moves.md` | §3.5 防守曲线表 | 补入实现与 Python 均已锁定的 `relativeBp=20000 → 5500` 锚点。 |
| `docs/design/21` / `docs/tech/05` | golden / 迁移说明 | 将 fixture 3 明列为 protocol 3 迁移工件；protocol 4 后续另录，禁止覆盖。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 对拍项 | 结果 | 证据 / 裁定 |
|---|---|---|
| 身份与完整性 | ✅ | fixture/rules/RNG/seed 及 canonical SHA 全部硬断言。 |
| 路线 trace、质量、CT | ✅ | 四种单位的生产 `commitMove` 结果对象逐字段等于 Python。 |
| 四单位隔离 | ✅ | 四个生产实例分别提交；再推进 hero，normal 完整快照不变。 |
| battleRng 三段 | ✅ | 初始、每单位提交前后、全提交后三层边界逐字段一致。 |
| 攻击 / 防守 / 外放护体 | ✅ | 生产攻防曲线及 `settleOutwardQi` 对拍，另验守恒。 |
| 速度 / 擒拿 / 点穴 | ✅ | 五档速度与 1/9 级控制投影对拍；强两档速度落地值精确断言。 |
| 归一化 / 五档 TTK | ✅ | Profile、strength 及 equal/±档/masterVsMob 全部一致。 |
| 调息 | ⚠️ | Python 向量已录；生产无 `regulateBreath`，测试明确断言缺口。 |
| 防守 / 移动提交 | ⚠️ | 输入及推进存在；生产提交仍 attack-only，未静默跳过或伪造。 |
| 不一致与裁定 | ✅ | 支持范围 0 项不一致；静态审计未发现需改 Python 或生产的差异。 |
| 协议 2 降级 | ✅ | 实现改名 `legacy-protocol2-replay`；旧路径仅转发弃用 API，测试标题明确只作回放兼容。 |
| Python 门禁 | ✅ | `--check` 通过；unittest discovery 33/33 通过。 |
| TS / 全仓门禁 | ✅ | 聚焦 9/9；core 421/421；`pnpm check` 796/796；性能 6/6。 |
| 安装 / ID / 格式 | ✅ | frozen install、strict ID（new=0）与 `git diff --check` 均通过。 |
| 写集与确定性 | ✅ | 仅许可路径；无新依赖、DOM、墙钟、浮点玩法计算或 `Math.random`。 |
| ENG-24 WebKit 交接 | ⚠️ | 读取 `meridian_flow_golden_v3.json`，先验完整 SHA，再在 WebKit 跑生产 golden 测试同字段；禁止调用 `--write-golden`。 |

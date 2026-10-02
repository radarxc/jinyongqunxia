# 本任务：游戏工程 · 经脉协议 3 黄金：对拍生产 runtime（代码审计 S1）

本任务写代码与工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`tools/balance/README.md`；
- 报告 `tools/agents/reports/ENG-14-meridian-golden.md`、`ENG-16b-battle-actions.md`（经脉接入战斗后的接口）；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.1 S1、§3.4 L3。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.5「经脉黄金」闸门：TypeScript runner 要与黄金工件逐字段对拍。

审计发现这道闸门只是形式上绿：
- `meridian-flow.golden.test.ts` 只调用 `runMeridianGoldenFixture`；
- `golden-runner.ts` 是一份独立重写的协议 2「孪生实现」（水量 / 容量 600–2600 模型）；
- 生产实现 `runtime.ts`（协议 3：fluxCap 1–64、逐 tick 管线）从来没有和黄金对拍过。

design/21 明写：
- 第 2198 行一带：协议 2 的表只是旧黄金追溯，v3 必须重录黄金，并保留旧 runner 验证迁移前的录像；
- 第 2650 行一带：要接 rulesProtocol=3，并重录黄金向量。

Python 参考实现 `tools/balance/meridian_flow_sim.py` 现在也还是 `RULES_PROTOCOL = 2`。

## 规格（照这些写，不自创）

- `docs/design/21-meridian-flow-and-moves.md`：
  - §2.5 丹田产气、运气速度与逐 tick 推进；
  - §3.5 独立乘区曲线、路线兑现与时间成本，含防守曲线锚点；
  - §11.4–§11.7 每次出手的固定流程与确定性细则；
  - §12.3 TypeScript 契约；§12.4 存档、录像与 golden；§12.5 版本迁移；§14 平衡与 golden 表。
- `docs/tech/05-gameplay-engine.md` §4.6：跨引擎 golden 的格式与身份字段；§15：golden 不得盲目重录，CI 禁止自动 `--write-golden`。

## 要做的事

1. **Python 参考实现升到协议 3**：
   - 按 design/21 写独立实现，不要照抄 TS 代码，否则对拍失去意义；
   - 协议 2 的路径保留，供旧录像验证；
   - 新增 `fixtureVersion=3` 的黄金文件（新文件，不覆盖 v2 那份）。`--write-golden` 只在人工 CLI 里调用一次，生成后把向量 SHA 写进测试做硬锁。
2. **TS 测试直接驱动生产 `MeridianFlowRuntime`**：
   - 消费 v3 黄金，逐字段对拍：路线 trace、质量、CT、四单位隔离、三段 battleRng、攻防护体、速度、控制、调息、归一化、五档 TTK。若某项生产 runtime 尚不支持（比如调息），在报告里列出，不许静默跳过。
   - 对不上时，以 design/21 为准判断是 Python 还是 TS 错了，改错的那一边，报告逐条记录。
   - 防守曲线 20000→5500 锚点（审计 L3）：实现与 Python 都有、文档表格缺，按实现保留，报告登记交文档同步。
3. **孪生实现降级**：`golden-runner.ts` 改名为旧协议回放器，只用于协议 2 录像回归，测试与命名都写清楚，不再作为闸门证据。
4. 路线图 §3.5 的口径要改成「协议 3 黄金 + 生产 runtime」：写进报告的文档同步表，不改路线图。

约束：
- 写集：`tools/balance/meridian_flow_sim.py`、`tools/balance/meridian_flow_golden_v3.json`（新）、`tools/balance/README.md`、`tools/balance/test_*.py`（如需）、`packages/core/src/battle/meridian-flow/**`、`packages/core/CLAUDE.md`。写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/battle/{action,damage,timeline}/**`（ENG-16b / 16d / 04b）、`docs/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；Python 只用标准库；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若只因机器负载挂在 rig 门禁，在报告写明负载与数值即可。

检查：以下命令必须全部通过。
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- v3 黄金的身份（fixtureVersion / rulesProtocol / rngProtocol / seed / SHA）；
- 逐字段对拍结果表；不一致项及裁定；
- 生产 runtime 的缺口（调息、防御路线提交等）；
- 文档同步表：路线图 §3.5、design/21 §3.5 锚点；
- 交给 ENG-24 的接口：WebKit 对拍要跑哪份向量、怎么跑。

报告 ≤ 80 行。

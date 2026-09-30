# 本任务：core 探针——种子 RNG 五流、命令 / 事件骨架、10 Hz tick、六角坐标、最小录像与跨语言 golden

`tech/09` P0 的 core 探针：不做完整玩法，只把 `tech/05` 的**确定性地基**做实并用测试钉死。T0 已建好 `packages/shared` 与 `packages/core` 骨架。

## 必读

- `docs/tech/05-gameplay-engine.md` §1.4（对外端口）、§1.5（不变量）、§2（模块划分）、§3（`GameState`、命令 / 事件 / 事务）、§4（确定性 D1–D9、`sfc32` + `splitmix32` 五流 `battle/loot/world/ai/qiyu`、整数 / bp、禁用 API、规范序列化与哈希域、跨引擎 golden、验收用例）、§5.1–§5.2（10 Hz 固定步与单 tick 事务）、§6.1–§6.3（pointy-top 六角轴坐标、稳定序、构网、A*）。
- `docs/tech/01-architecture.md` §8.3（确定性）、`@tianshu/shared` 接口清单（§4.3）。
- `docs/design/09-combat-system.md` §2–§3（六角格约定、CT 0–1000、−1000 下限）；`docs/design/04-damage-formula.md` §8（伤害管线伪代码，只实现到 `DamageTrace` 结构与 Z1 归一的一个用例，不做全部乘区）。
- `tools/balance/damage_sim.py`（其 RNG 与取整约定；若它有 `sfc32` 实现，与 TS 逐位对拍）、`tools/balance/meridian_flow_golden.json`（了解 golden 文件格式，不必实现经脉）。

## 至少实现（`packages/shared`、`packages/core`）

1. `shared`：`Rng`（`sfc32`，`splitmix32` 播种，`nextU32 / nextBp / nextInt(lo,hi)`），`fx`（整数 / bp 运算、`powInt`、钳制、确定性取整）、`Brand`、`Result`、`assert`、`Emitter`、`DeepReadonly`、`canonicalJson`（键排序、无 NaN / Infinity）、`hashCanonical`（FNV-1a 64 或 tech/05 §4.5 指定算法）。
2. `core`：`createCore(content, seed)`；`GameState` 根（`meta`、`rng: Record<RngStreamId, RngStateJson>`、最小 `world` 与 `battle` 占位）；`Command` / `DomainEvent` 判别联合（先实现 `world/tick`、`battle/start`、`battle/act` 三条，其余留类型）；命令事务（mutation journal、事件暂存、失败回滚、五流 RNG 局部副本，tech/05 §3.5）；固定 10 Hz tick 调度（`advance(ms)`，累积器，最多 N 步防螺旋）；六角坐标（轴坐标、邻接、距离、直线、范围、稳定排序、`toKey`）与最小 A*（六角、通行代价，先无 ZOC）；录像（`Recording = {header, commands[], checkpoints[]}`：记录命令与每 N 条后的状态哈希；`replay()` 校验哈希）。
3. **Golden 与对拍**：`tools/balance/` 新增 `rng_golden.json`（由一个 Python 标准库脚本 `tools/balance/rng_ref.py` 生成：同一种子的前 1,000 个 `nextU32`、`nextBp` 与哈希），TS 测试逐位比对；六角 A* 的 100 组随机图 golden 亦由 Python 参考实现生成并对拍。
4. 测试：Vitest 单元 + fast-check 属性（六角距离对称 / 三角不等式、序列化往返、事务回滚不变量、录像重放哈希相等）；覆盖率 ≥ 90%（core、shared）。
5. `packages/core/CLAUDE.md` 更新为实际模块图。

## 验收标准（亲自运行）

- `pnpm --filter @tianshu/shared test`、`pnpm --filter @tianshu/core test`、`pnpm lint`、`pnpm typecheck` 通过；覆盖率数字写进报告。
- `python3 tools/balance/rng_ref.py --check` 通过（Python 与 TS golden 一致）。
- 相同种子 + 命令序列在两次运行得到相同终态哈希（测试证明）。

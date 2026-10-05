# ENG-04b-ct-speed-clamp 报告 · 游戏工程 · 小修：CT 速度单点钳制与零速度栈溢出（代码审计 H5）
## 1. 摘要（3–6 行）
- 新增唯一 CT 增益入口 `ctGain(unit)=clampInt(unit.spd,30,300)`，等待与推进统一复用；原始 `spd` 不回写。
- `nextTimelineEntry` 已由尾递归改为循环，并在状态写入前以 `INVALID_TIMELINE_DELTA` 守卫非正、非安全或不前进的 tick。
- H5 的低速等待、超速溢出与零/负速度栈溢出均已修复；ENG-04 报告所述「spd 钳 [30,300]」与实现已对齐。
- 未改 encounter、聚气适配或依赖；全部指定门禁通过。
## 2. 产出（文件、行数、主要章节）
| 文件 | 最终行数 / 变更 | 主要产出 |
|---|---:|---|
| `packages/core/src/battle/timeline/index.ts` | 131 / `+34 −26` | `ctGain`、循环推进、tick 进度守卫 |
| `packages/core/src/battle/timeline/index.test.ts` | 123 / `+49` | 越界速度、全合法区间、进度守卫回归 |
| `tools/agents/reports/ENG-04b-ct-speed-clamp.md` | 34 / 新增 | 本报告 |
## 3. 关键结论与数值
- `spd=10/0/−120`：`gain=30`，`ceil(1000/30)=34` tick，`ct=30×34=1020`；原始 `spd` 保留。
- `spd=400/MAX_SAFE_INTEGER`：`gain=300`，`ceil(1000/300)=4` tick，`ct=300×4=1200`，不再误钳至 1299。
- `spd=30..300` 全 271 个整数的 entry 与完整状态规范 JSON 逐字节等于改前公式结果。
- 全仓唯一额外命中 `meridian-flow/gather.ts` 的构造入口已强制 `spd∈[30,300]`，不存在区间外推进，依约未碰聚气实现。
- timeline 排序仍按原始 `spd`，不属于 CT 增益；人物 CT 增益唯一入口为 `ctGain(unit)`。
## 4. 开放问题（附默认值）
- 无新增开放问题；默认继续由上游保存/展示原始 `spd`，仅 CT 推进调用 `ctGain(unit)`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现直接对齐 `docs/design/09-combat-system.md` §3.1 的 `[30,300]` 规格。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 | 改什么 |
|---|---|---|
| ENG-16b / ENG-16c 交接 | timeline 速度推进 | CT 速度钳制唯一入口为 `ctGain(unit)`；勿复制钳制公式或回写原始 `spd` |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 改动行：`index.ts` 新增 45–47 行，79–110 行递归改循环；等待 90 行、推进 106 行共用 `ctGain`；未碰 123 行后的聚气适配。
- ✅ 新测试：低速、高速、零速、负速、极大值、`30..300` 全区间逐字节兼容、tick 不前进守卫；Core 36 文件 / 303 项通过。
- ✅ Golden / 回放 hash 未变化：Core 的 replay golden、经脉 golden 与全部既有测试均通过；合法速度行为逐字节不变。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`（92 文件 / 522 项 + rig 2 项）、`pnpm --filter @tianshu/core test` 全通过。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过（仅基线已知未定义 1 项，新增失败 0）；`git diff --check`、Core lint/typecheck 通过。
- ✅ `pnpm check` 的 100 角色 rig 最低 P95 0.246 ms，未触发性能门禁；未放宽或跳过测试。
- ✅ 写集仅含 timeline 源码/测试及本报告；encounter 无需修改，未新增依赖或 ID。

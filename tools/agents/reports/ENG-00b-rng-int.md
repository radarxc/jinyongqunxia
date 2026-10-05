# ENG-00b-rng-int 报告 · 游戏工程 · core 随机数整数化修复（ENG-00 遗留，审核发现）

## 1. 摘要（3–6 行）

- 已将 `intInclusive()` 改为 16 位半字乘加的 32×32→64 位乘积高 32 位映射，全程不用 BigInt、除法或浮点缩放。
- 每次合法公开抽样恰消费一次 `nextU32()`；`span=2^32` 走 `low + sample` 快路径。
- `rngProtocol` 已从 1 提升为 2，并写入 `GameState.meta`、golden fixture 与 core 变更记录。
- core 17/17、全仓 55/55 测试及三条指定检查全部通过。

## 2. 产出（文件、行数、主要章节）

- `packages/core/src/rng/index.ts`（79 行）：协议 2、精确 `multiplyHighU32`、整数区间映射。
- `packages/core/src/rng/rng-protocol-v2.golden.json`（55 行）：五流 sfc32 向量、区间边界、10 桶分布。
- `packages/core/src/core.test.ts`（99 行）：跨度 1/2/2^32、舍入边界、单次消费、固定向量与 10 万次粗检。
- `packages/core/eslint.config.js` / `.d.ts` / `src/eslint-config.test.ts`（29/4/23 行）：core 禁 `/`、`/=`，并验证 `/` 与 `Math.floor(x / y)`。
- `api/index.ts` / `state/index.ts` / `package.json` / `tsconfig.json` / `CLAUDE.md`（55/31/16/14/7 行）：协议元数据、脚本、JSON fixture 与记录接线。

## 3. 关键结论与数值

- 算法：`high32(u32*span)`；四个 16×16 乘积各 `<2^32`，中间进位和最终值均为 JS safe integer。
- 边界：`u32=2147483647, span=2147483649` 从旧值 `1073741824` 修正为 `1073741823`。
- 分布：seed 2、battle 流、10 桶、100,000 次；期望 10,000/桶，最大偏差 118（1.18% < 2%）。
- sfc32 seed-1 五流初态与各前四个 `nextU32()` 均保持 tech/05 §4.2 向量。任务称“PCG32”，仓库实际 core 契约与实现是 sfc32。
- ESLint 已补 package-local 规则；其余 core 生产源码未发现 `/`、`/=`, `Math.floor/ceil/round/trunc`。
- 参考：MDN `Math.imul()`（32 位 C-like 乘法，2026-10-01）：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul 。

## 4. 开放问题（附默认值）

- O1：根 `pnpm lint` 不自动发现嵌套 flat config；默认要求 core 开发先跑 `pnpm --filter @tianshu/core lint`，并由测试锁定规则，待允许改根配置时接入全仓门禁。
- O2：`tools/balance/meridian_flow_golden.json` 仍标 `rngProtocol:1`，但仅用 `nextU32()%10000`，不依赖 `intInclusive`；默认保留为旧 runner fixture，不越权改。
- O3：`packages/core/src/replay` 当前仍是占位接口，尚无协议 1 runner；默认后续实现 replay 时保留旧浮点映射，仅供旧录像验证，新录像固定协议 2。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG00B-P01：tech/01 §8.3、tech/05 §4.2 将区间映射改记为协议 2 的 `high32(u32*span)`；理由是旧浮点式在合法边界会错一桶。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/01-architecture.md` §8.3、`docs/tech/05-gameplay-engine.md` §4.2/§4.4/§4.6：同步整数映射、`rngProtocol=2`、golden 与禁除法门禁。
- 根 `eslint.config.js` / `package.json`：写集放开后将 core 的 `/`、`/=` 规则接入根 `pnpm lint`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 新算法：无 BigInt、无除法、无浮点缩放；跨度 1、2、2^32 与舍入边界全部通过；合法调用各消费一次。
- ✅ 协议：`RNG_PROTOCOL=2`，状态元数据、golden fixture、`CLAUDE.md` 记录一致；旧 sfc32 向量通过。
- ✅ 分布：100,000 次抽样固定计数，10 桶最大偏差 1.18%，严格小于 2%。
- ✅ ESLint：补充 package-local `/` 与 `/=` 禁令；真实 ESLint 测试覆盖直接除法和 `Math.floor(x / y)`；其余浮点用法清单为空。
- ✅ `pnpm install --frozen-lockfile` 退出 0，锁文件未变化。
- ✅ `pnpm check` 退出 0：14 文件、55 测试；内容校验、构建、包体预算通过。
- ✅ `python3 tools/lint/check_ids.py --strict` 退出 0：新增严格错误 0，保留既有基线 undefined 1。
- ✅ `git diff --check` 通过；只改授权路径；未执行改变仓库状态的 git 命令。
- ⚠️ 覆盖率因无项目/任务 CI 阈值且执行来源为空，按单测流程跳过；真机 Safari 未单独实测。

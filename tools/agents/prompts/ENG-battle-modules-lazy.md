# 本任务：游戏工程 · 小修：只有进战斗才用的模块（遭遇 encounter.v1 的 schema 与 builder 等）移出首次会话静态闭包，改走战斗懒加载块（AR-64）

本任务改加载边界。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能。

先读：
- `CLAUDE.md` 的分层与性能规则；`docs/decisions/author-requirements.md` 的 AR-64：默认懒加载，首次会话 110 KiB 门不变；
- `tools/perf/README.md`：首次会话闭包 = Worker 壳 + `apps/game/src/runtime/session.ts` 静态闭包 + 基础内容；子系统「战斗」从 `apps/game/src/battle/runtime.ts` 算；
- `apps/game/build/size-groups-plugin.ts`、`tools/perf/check_size.mjs`：只读，用来量；
- 报告：`tools/agents/reports/ENG-26-encounter-builder.md`、`tools/agents/reports/ENG-session-base-diet.md`。

## 为什么做

- ENG-26 合入后，首次会话从 108.91 涨到 110.67 KiB，超门，先撤回（18ddf3f2），base-diet 合入后原样重合。
- 开发监督量出的来源：
  - `packages/data/src/content-registry.ts` 的 `SCHEMAS` 静态引入了 `EncounterDefSchema`，遭遇的 zod schema 随内容加载进了首次会话。Worker 的 item-content 共享块原始大小 159.74 → 164.38 kB；
  - builder 本身在 encounter 块里，已经是懒加载。
- 协调者（10-03 23:0x）：遭遇只有进战斗才用得到，按 AR-64 不该进首次会话。重合后哪怕没超 110，也要把它和其他只有战斗才用的模块改走战斗懒加载块。

## 要做的事

1. **量**：
   - 先 `pnpm --filter ./apps/game build`，读 `apps/game/dist/.vite/size-groups.json` 和各块；
   - 列出首次会话静态闭包里「只有战斗才用」的模块：遭遇 schema、builder、战斗脚本、战斗专用的结算与校验等；
   - 判定标准：从 `runtime/session.ts` 出发、不进战斗也会执行到的，才算首次会话需要。
2. **挪**：把这些模块改成随战斗懒加载块加载。
   - 内容加载时，遭遇只做首次会话真要的轻量登记（ID、跨内容引用检查等）。完整 schema 解析放到进战斗时；构建期 `content:validate` 已经做过的校验不必在加载时重复。
   - 内容错误不能因此漏掉：
     - 构建期 `pnpm content:validate` 照样拦住所有遭遇错误；
     - 运行时首次用到时再解析，失败转成可恢复的战斗入口错误，不崩会话。
   - 不改 encounter.v1 的字段与语义，不改战斗规则与随机序列；同一输入的战斗结果逐字节一致。
3. **测**：
   - 确定性：同一遭遇，改前改后解析结果和建出的 BattleSetup 一致；
   - 回归：坏遭遇在 `content:validate` 被拦；运行时首次进战斗解析失败给出可恢复错误；
   - 体积：报告改前、改后的首次会话合计、session static、战斗子系统块。
4. **只动加载边界，不碰量具**：`tools/perf/**`、`apps/game/build/**` 的分组口径和预算一概不改。

## 约束

- 写集：`packages/data/src/**`、`packages/core/src/**`、`apps/game/src/**`，只改加载边界与对应测试。写集外的改动在提交时会被丢弃。
- 不放宽任何门禁或阈值；不加「高负载跳过」逻辑（AR-33）。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- Worker 壳与首次会话静态块里不再出现遭遇 schema 与 builder 的特征串（`regionArena`、`ENCOUNTER_TEMPLATE_UNSUPPORTED`）；builder 仍在产物里，只是挪了、没删
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 40 行，写清：
- 挪了哪些模块，挪前、挪后各在哪个块；
- 首次会话合计、session static、战斗子系统块，改前改后的数字；
- 内容校验口径的变化：哪些校验从加载时挪到了构建期或进战斗时；
- 还有哪些只有战斗才用、这次没挪的模块，以及原因。

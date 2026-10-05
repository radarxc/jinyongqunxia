# 本任务：游戏工程 · 动作原型 P9 补：片段驱动 rig 的 CPU 优化（100 人片段模式低负载 P95 ≤ 0.5 ms；接口、金样与阈值不变）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（rig API、性能门禁）。

先读：
- 工程报告 `tools/agents/reports/ENG-12c-clip.md`：§3 Q7 实测、§7 接口；
- `tools/agents/reports/TOOL-rig-sheet.md` 第 7 节：身份 rig 的 manifest 新字段与枢轴约定；
- `packages/render/src/rig/{clip,project,clip-player,character,batch,instance-buffer}.ts`；
- 门禁 `packages/render/src/rig/performance.test.ts`。

## 为什么做

作者 AR-21：性能要最好。AR-33：rig 门禁阈值 0.80 ms 不动，失败一律按真实退化处理。

ENG-12c-clip 合入后，开发监督在集成分支跑 `pnpm check:perf`（10-02 23:15，1 分钟 loadavg 7.31）：
- 100 人程序步态：min P95 0.319 ms；
- **100 人片段模式：0.795 / 0.797 / 0.795 ms**；离 0.80 ms 只剩 0.6%，负载稍高就会挂；
- 片段模式的开销约是程序步态的 2.5 倍。

**作者 AR-37（10-02 23:25）**：片段模式门禁放宽到 1.0 ms（`performance.test.ts` 的 `CLIP_MODE_LIMIT_MS`），程序步态仍是 0.80 ms；本任务因此降为可选优化。

协调者裁定（10-02 23:20，AR-37 后仍适用）：
- 登记本任务，目标是 100 人片段模式在低负载下 P95 ≤ 0.5 ms；
- `playClip` 接口与投影金样不变；
- 阈值与门禁照 AR-33 / AR-37，一个字不动：片段模式 1.0 ms，程序步态 0.80 ms。

## 规格（照这些写，不自创）

- `docs/tech/09-character-rig.md`：
  - §4.6 片段驱动；
  - §5 运行时与性能契约：零分配、2 draw call、100 人预算；
  - §8 `tianshu-clip.v1`。
- `tools/agents/reports/RESEARCH-anim-motion-library.md` §5.3（`packages/render/src/rig/` 分工）、§5.6 判定 Q7。

## 要做的事

1. **先测量**：
   - 用现有 `performance.test.ts` 的片段模式用例，加上一个只在本地跑的剖析脚本（不进 `pnpm check`，可以放在 `packages/render/src/rig/` 下的 `*.bench.ts` 或报告附录），找出每帧最贵的几步，例如：
     - 偏航旋转与 FK；
     - 逐部件选视图（10° 滞回）；
     - 缩短与 affine 计算；
     - 动态 z 排序；
     - int16 轨迹解码与插值；
     - 一拍二采样；
   - 报告第 3 节写剖析前后的分项耗时。
2. **优化**，方向例如：
   - 一拍二时，非采样帧复用上帧投影；
   - 同一片段同一帧的多角色共享解码与 FK 结果（按片段 ID + 帧号缓存，按偏航分 8 档或保持连续，以金样不变为准）；
   - 视图选择与 z 排序只在偏航或关节角跨阈值时重算；
   - 热路径避免函数对象、闭包和 Map 查找，改成 typed array 索引。
   
   全部保持零分配与 2 draw call。
3. **不变式**：
   - `playClip` / `stopClip` 签名与行为不变；
   - 投影金样（与 `clip_metrics.py` 对拍，误差 ≤ 2 px @128 ppm）不变；
   - 程序步态的测试向量与快照不变；
   - `clip-map.yaml` 不变。
4. **测试**：
   - 现有 rig 测试全过；
   - 新增缓存命中 / 失效的确定性测试，例如偏航跨档、片段切换、淡入淡出期间；
   - `pnpm test:perf` 在负载低时实际跑一次，报告写 loadavg 与三项 min P95，目标是片段模式 ≤ 0.5 ms。
   - 达不到 0.5 ms 时，如实写达到的数值与剩余瓶颈，不许改阈值或加跳过逻辑。

## 约束

- 写集：`packages/render/src/rig/**`（不含 `performance.test.ts` 里已有用例的阈值与断言；可以新增用例）、`packages/render/CLAUDE.md`。写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`、`tools/rig/**`、片段 JSON、`content/anim/**`、`apps/**`、`tools/perf/**`。
- 不加依赖；每次写入 ≤ 150 行。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 剖析分项耗时（前 / 后）；
- 三项 min P95 与 loadavg；
- 金样误差；
- draw call 数与分配情况。

第 7 节写缓存策略与失效条件，交 ENG-10 / 11 接 `playClip` 时参考。

报告 ≤ 60 行。

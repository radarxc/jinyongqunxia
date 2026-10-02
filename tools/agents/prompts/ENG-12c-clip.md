# 本任务：游戏工程 · 动作原型 P8–P9 · 片段驱动的 rig 运行时（clip 加载 / 投影 / 播放器、`playClip`、`/rig-demo` 开关、测试；AR-29）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（rig API、性能门禁）、`packages/core/CLAUDE.md`。

## 作者要求
`docs/decisions/author-requirements.md` **AR-29**：2D 分层部件 + CC0 动作库驱动；原型交付「主角·男走路加一套剑招的动图，请作者判定」。**AR-33**：rig 性能门禁已移出 `pnpm check`，用 `pnpm check:perf` / `test:perf` 单独跑，阈值不动，**禁止任何「高负载跳过」逻辑**。**AR-21**：性能要最好。

## 规格
- `docs/tech/09-character-rig.md`：§1.3 三视图 / 镜像 / 近侧（解剖学 L，TOOL-rig-nearside）、§4.6 片段驱动（DES-rig-v1.1 新写的接口与规则）、§5 运行时与性能契约、§8 `tianshu-clip.v1` 格式与骨架映射；
- `tools/agents/reports/RESEARCH-anim-motion-library.md` §4.1、§5.2、§5.3（`packages/render/src/rig/` 表）、§5.4、§5.6 判定 Q4–Q7；
- 片段数据：`assets/default/rig/clips/*.json`（TOOL-rig-clips 已入库：`clip_walk`、`clip_sword_attack`、`clip_sword_regular_a` 与 7 个备用；`clip.schema.json`）；指标参考 `*.metrics.json`、`tools/rig/clips/clip_metrics.py`（Python 投影参考实现，TS 结果须与之对拍）。
- 现有运行时：`packages/render/src/rig/{character,gait,batch,instance-buffer,manifest,types}.ts`，`apps/game/src/rig-demo.ts`（`/rig-demo`）。

## 要做的事
1. `packages/render/src/rig/clip.ts`：加载并校验 `tianshu-clip.v1`（schema 字段、骨架为 `tianshu_humanoid.v1`、许可字段非空），int16 轨迹解码进**预分配**缓冲；不合法抛枚举错误。
2. `packages/render/src/rig/project.ts`：偏航旋转 → 2D 正向运动学（骨长 × 方向）→ 逐部件选视图（front34 / side / back34 + 镜像，10° 滞回）→ 缩短下限 0.45 → 躯干肩宽比 → 动态 z → 剑轴投影；输出每部件 `PartPose {viewIndex, mirrored, affine, z}`；全部零分配（复用 typed array）。整数化规则与 `clip_metrics.py` 一致，给**投影金样**（取 `clip_walk` 若干帧 × 8 方向，与 Python 输出对拍，误差 ≤ 2 px @128 ppm）。
3. `packages/render/src/rig/clip-player.ts`：一拍二采样、循环 / 单次、`hit` / `end` 事件回调、与步态 160 ms 交叉淡入淡出、播放速率 = core 速度 / `nativeSpeedMps` 夹在 [0.8, 1.4]（超出退回程序步态）、根运动原地、`nearHandWeapon` 时主手落在远侧则镜像片段、偏航辅助 ±30°。
4. `character.ts`：新增 `playClip(id, {facingYawDeg, rate, onEvent})`、`stopClip()`；`writePose` 改为消费 `PartPose`，步态路径也走同一入口（步态结果不得改变：现有步态测试向量与快照必须原样通过）。`index.ts` 导出新类型；`packages/render/CLAUDE.md` 补 API 与规则。
5. `content/anim/clip-map.yaml`：把 `MoveDef.anim.clip` 键映射到片段 ID 与参数（数据驱动，先放 `walk`、`sword_regular`、`sword_attack`、`idle`、`hit`、`fall`、`meditate`、`dodge`、`punch`、`run`），加最小加载与校验（未知键报错）。
6. `/rig-demo`：片段选择、8 方向轮播、「程序步态 / 动作库步态」A/B 开关、剑招播放按钮、事件日志；保留现有开关。
7. 测试：clip schema（合法 / 非法）；投影金样向量；一拍二与事件时点；速率钳制；零分配（稳态每帧 0 B，用现有 instance-buffer 的方法）；draw call 仍为 2；core 不读 render 事件的断言（R15）。性能：`pnpm test:perf` 下 100 人**片段模式** rig CPU P95 ≤ 0.80 ms（方法同 ENG-12b：预热 120 帧，3 轮 × 600 帧取最好一轮），把这项加进 `test:perf`（不进 `pnpm check`），在负载低时实际跑一次，报告写 loadavg 与数值。

## 约束
- 不改 `packages/core`；不改 `tools/rig`、片段 JSON；不加新依赖；不改门禁阈值；每次写入 ≤ 150 行。
- 只写：
  - `packages/render/src/rig/**`、`packages/render/src/index.ts`、`packages/render/CLAUDE.md`、`packages/render/package.json`（只为加 `test:perf` 项目时）
  - `apps/game/src/rig-demo.ts`、`apps/game/src/style.css`
  - `content/anim/**`
  - 本任务报告

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：投影金样误差、Q4（缩短从不低于 0.45、躯干视图切换次数）、Q7（P95、分配、draw call）实测；第 7 节写交 TOOL-rig-sheet / ENG-10 / ENG-11 的接口（`playClip` 签名、`clip-map.yaml` 键）。报告 ≤ 80 行。

# 本任务：游戏工程 · 渲染补齐 B（WebGL 上下文丢失恢复 / 自适应质量）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-21a-camera-daynight.md`（上一步，第 7 节交给本任务的接口必须照做）、`ENG-10-battle-ui.md`、`ENG-11-vfx.md`、`ENG-12b-perf-gate.md`。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 渲染行：M1 要「恢复、自适应」；§3.5 内存与性能闸门。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- 全仓没有监听 `webglcontextlost` / `webglcontextrestored`。
- three r186 已处理部分恢复：丢失时 `preventDefault`、丢失期间 `render()` 空转、恢复时重建 GL 状态，并按保留的 CPU 数据懒上传。现有 M1 纹理都保留 CPU 数据。
- 战斗、大地图、城镇、特效各自创建 `WebGLRenderer`；战斗时特效舞台是第二个上下文，与 tech/02 §8.8「一个上下文」不符。
- DPR 在战斗、大地图、特效、城镇各处被夹在 [1, 2]。
- `packages/render/src/frame-stats.ts` 只有 draw call 与帧时间，没有分档和自适应。
- `apps/game/src/render-host.ts`（`mountPlaceholderScene`）没有任何地方引用。
- 设置面板在 `App.vue` 里，只有「大字」「减少动效」，归 ENG-15，本任务不改。

## 规格（照这些写，不自创）

- `docs/tech/02-rendering.md`：
  - §8.7 纹理与 CPU 副本；
  - §8.8 上下文丢失与恢复：丢失时暂停渲染、提示「画卷重展中…」；恢复后重建渲染目标、uniform、数据纹理；5 s 内没恢复就从最近自动档「重新载入」；
  - §10.1 四档开关表：DPR 上限、动态分辨率范围、动态光源数、粒子上限、特效 draw 数、目标帧率、draw call 目标、显存；
  - §10.2 自动检测：探测 → GPU 规则 → 本地缓存（30 天）→ 手动锁定；
  - §10.3 运行时自适应：每 0.5 s 看最多 60 帧，每次 −0.05，会话内只降不升，在下限持续 5 s 降一档；
  - §11.1 模块划分：`quality/` 放 `packages/render/src`（tech/03 写在 platform，但 render 不能依赖 platform，以本条为准）；§11.3 `AutoTuner` 签名。
- `docs/tech/03-mobile-performance.md`：
  - §3.3 ContextWatchdog：5 s 后尝试重建，失败按 `reload` / `restart-browser`（≥ 3 次）处理，提示文案；一周丢失 ≥ 3 次则下次启动降一档、GPU 预算减 25%；
  - §3.7 回到前台先查 `isContextLost`；
  - §7.1 状态与单调 `min()` 规则；§7.2 GPU 档与内存级分开判，内存 S 级封顶 mid、M 级封顶 high，内置浏览器降一档，Apple GPU 走基准；
  - §7.4 稳定窗口（≥ 30 帧、尺寸稳定 2 s）与 CPU / GPU 瓶颈判别；
  - §7.5 各档 renderScale 范围与初值，`round(s×20)/20`，识别 30 fps 垂直同步封顶（≥ 80% 帧间隔在 33.3 ± 2.5 ms）且不因此降档。
- `docs/design/14-ui-ux-mobile.md` §7.3：纯 DOM 恢复页，保留存档，给重试和低画质入口。

## 要做的事

1. **上下文守卫**（新建 `packages/render/src/core/context-guard.ts`）：
   - 状态 ok / lost / failed，5 s 超时；
   - 恢复后重设尺寸与 DPR、请求一帧；回前台先查 `isContextLost`；
   - `dispose` 时移除监听；
   - 丢失计数由调用方持久化：render 不碰存储，只经回调报告。
   - 接进战斗、大地图、特效舞台。特效第二上下文合并不在本任务，报告说明。
2. **战斗界面**：`BattleField.vue` 显示「画卷重展中…」遮罩；5 s 未恢复时给「重新载入」和「低画质重试」。文案进 `packages/ui/src/i18n.ts`。
3. **质量分档**（新建 `packages/render/src/quality/`）：
   - `tiers.ts`：§10.1 四档表；
   - `gpu-rules.ts`：§10.2 / tech/03 §7.2 的规则，含内存级封顶；
   - `auto-tuner.ts`：tech/03 §7.4–§7.5；
   - 各处 DPR 夹取改为 `effectivePixelRatio()`；特效上限按档取。
4. **应用接线**：
   - `apps/game/src/render-host.ts` 改为 `createRenderQuality()`：只探测一次；用 localStorage 缓存档位与一周丢失计数，读写都包 try/catch；支持 `?tier=` 覆盖；
   - 战斗与大地图共用它。设置页的手动档位控件归 ENG-15 之后的 UI 任务，本任务只给接口。
5. **并入代码审计的移动端项**（`tools/agents/reports/AUDIT-code-20261002.md`）：
   - **H2**：`render/src/battle/hex-layer.ts` 用 `uniform float reachable[400]` 和 `area[400]` 两组共 800 个 float uniform。WebGL2 只保证 224 个 vec4 片元 uniform，中端安卓上着色器可能链接失败，three.js 只在控制台报错，降级分支也不会触发。
     - 改法：高亮标记改成 400×1 的 RGBA8 `DataTexture`，或逐格 `InstancedBufferAttribute`，uniform 降到个位数。
     - 补测试：mock three 下断言着色器源码不再声明大数组 uniform。
   - **M10（部分）**：
     - 所有场景的 `dispose()` 都调用 `renderer.forceContextLoss()`；
     - `vfx/stage.ts` 热路径不再逐帧分配：`uvFor` 返回新对象、`effectLocalBounds` 新建数组、`placeEffect` 新建闭包、`sampleTimeline` 返回新对象，都改成预分配 scratch。
   - **L7**：大地图场景 `dispose` 时补上 `batch.coreMesh.dispose()`，战斗场景已有这一句。
6. **不做**（报告逐条列出）：标题画面基准、温控 T0–T3、FramePacer、`?perf=1`、Playwright 场景、合并特效上下文、IsoLit、城镇的守卫与 DPR 接线（`town/**` 不改）。
7. **测试**：
   - `context-guard`：happy-dom 画布事件加假定时器，覆盖丢失 → 遮罩、5 s 内恢复、超时失败、计数回调、dispose 后无监听；
   - 质量：Mali-G71 → low、Mali-G710 → high、Apple GPU → 基准、内存级封顶、取整、调节器单调、30 fps 封顶不降档；
   - 不用墙钟阈值。

约束：
- 写集：
  - `packages/render/src/core/**`、`packages/render/src/quality/**`、`packages/render/src/battle/**`、`packages/render/src/worldmap/**`、`packages/render/src/vfx/stage.ts`、`packages/render/src/vfx/stage.test.ts`、`packages/render/src/frame-stats.ts`、`packages/render/src/index.ts`、`packages/render/src/render.test.ts`、`packages/render/CLAUDE.md`；
  - `apps/game/src/render-host.ts`、`apps/game/src/battle/components/BattleField.vue`、`apps/game/src/battle/battle.css`；
  - `packages/ui/src/i18n.ts`（只加文案）。
  - 写集外的改动在提交时会被丢弃，所以不要改写集外的文件。
- **不改**：
  - `packages/render/src/rig/**`、`packages/render/src/town/**`、`packages/render/package.json`；
  - `apps/game/src/battle/*.ts`、`apps/game/src/App.vue`、`game-controller.ts`、`apps/game/src/{pages,scenes,runtime}/**`；
  - `apps/game/vite.config.ts`、`apps/game/build/**`、`vitest.config.ts`、根 `package.json`、`pnpm-lock.yaml`、`tools/perf/**`。
  - 确实需要改这些才能完成的，在报告里写明需要什么，不要改。
- 分层：render 不依赖 core、platform，不碰存储；持久化只在 `render-host.ts`。
- 每次写入 ≤ 150 行；不加新依赖。

性能是作者硬要求（AR-21「性能要最好」）：调节器每帧零分配；采样窗口用固定长度环形缓冲。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- （apps/game 的测试由根 `pnpm check` 覆盖。包内 `pnpm --filter ./apps/game test` 加载 `vite.config.ts` 会失败：`packages/data/src/tooling.ts` 的无后缀 ESM 导入。这是集成分支的已知问题，另有任务修，不在本任务范围，不要改。）
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

`pnpm check` 里的 rig 100 角色性能门禁在机器高负载时可能偶发失败。若只这一项失败，在报告里写明负载和数值，**不要改门禁、阈值、vitest 配置，也不要跳过**。真机丢失恢复与帧率记「待实测」（沙箱拦 Chromium），并写出协调者在沙箱外怎么验：开发命令或控制台调 `forceContextLoss()` / `forceContextRestore()`。

## 报告

第 7 节写：
- 守卫状态机与恢复步骤；
- 四档表与检测规则实现对照；
- 调节器参数；
- 改动前后各场景 DPR 取值；
- 测试结果；
- 未做项；
- 交给下游的接口（放哪、怎么测、接口名）：设置页档位控件、城镇接线、Playwright 恢复测试。

报告 ≤ 90 行。

# ENG-21b-recovery-quality 报告 · 游戏工程 · 渲染补齐 B（WebGL 上下文丢失恢复 / 自适应质量）

## 1. 摘要（3–6 行）

- 已为战斗、大地图、VFX 与占位 renderer 接入 `ok/lost/failed` 上下文守卫、前台检查、5 s 重建升级和质量 DPR；战斗提供纯 DOM 恢复遮罩与低画质重试。
- 已实现四档配置、GPU/内存静态规则、30 天缓存/7 天丢失计数、固定环形缓冲 AutoTuner；render 不读写存储。
- H2 改为 400×1 RGBA8 高亮纹理；L7、可修改场景 `forceContextLoss()` 及 VFX 点名热路径分配均已处理。
- 全仓 99 文件 / 570 测试、构建、包体、内容与严格 ID 门禁通过；真机恢复/FPS 仍（待实测）。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `packages/render/src/core/` | 296 | 守卫状态机及 happy-dom/fake-timer 9 项测试 |
| `packages/render/src/quality/` | 571 | 四档、GPU/内存规则、AutoTuner 与 18 项测试 |
| `packages/render/src/battle/` | 748 | 守卫/质量、RGBA8 高亮、资源恢复/释放测试 |
| `packages/render/src/worldmap/` | 494 | 守卫/质量、昼夜恢复、coreMesh/context 释放 |
| `packages/render/src/vfx/stage*.ts` | 815 | 守卫/档位预算、预分配 scratch、行为回归测试 |
| `frame-stats.ts` / `index.ts` / `render.test.ts` | 172 | 质量统计、公共导出、占位 renderer 接线 |
| `render-host.ts` / `BattleField.vue` / CSS / i18n | 1,415 | 单例探测、缓存、恢复页与文案 |
| `packages/render/CLAUDE.md` | 107 | API、联网来源、下游与待实测约定 |

## 3. 关键结论与数值

- 守卫：丢失时 `preventDefault`、停绘/停战并计数；恢复时 DPR→尺寸→RT/uniform/DataTexture/CPU 纹理重传→请求帧；5,000 ms 后整体重建，失败按会话第 3 次切 `restart-browser`。
- 四档依次为：DPR `1/1.5/2/2`；scale `0.70–1.00@0.85 / 0.70–1.00@0.90 / 0.75–1.00@1.00 / 0.85–1.00@1.00`；光 `0/2/4/8`；粒子 `400/1200/3000/6000`；VFX draw `8/16/24/32`；目标 fps `30/60/60/60`；场景 draw `60/100/150/250`；显存 `96/160/256/512 MB`。
- 静态检测：Mali-G71→low、G710→high、Apple/未知→`benchmark` 标记并用保守基准档；S/M 内存分别封顶 mid/high，内置浏览器再降一档，能力门槛再取 `min()`；一周 ≥3 次下次降一档且预算 `×0.75`。
- AutoTuner：固定 60 帧、至少 30 帧、尺寸稳定 2 s、每 500 ms 判断；像素瓶颈每次 `−0.05`，下限连续 5 s 才降档；`round(s×20)/20`；60 帧中 ≥80% 落在 `33.3±2.5 ms` 识别 30 fps 封顶而不降质。
- DPR 改前 battle/worldmap/VFX/town 均为 `clamp(deviceDPR,1,2)`；改后前三者为 `min(deviceDPR, tierCap)×renderScale`，例如 mid 初值 `min(DPR,1.5)×0.90`；town 按范围约束未改。
- H2：800 个 float fragment uniform → 1 个 RGBA8 sampler（400×1、1,600 B CPU 副本），着色器测试禁止大数组 uniform。

## 4. 开放问题（附默认值）

- 标题“活画基准”未做；Apple/未知 GPU 默认移动 mid、桌面 high，再受硬封顶，`benchmarkPending=true` 留给后续基准覆写。
- `WorldMapPage.vue` 不在写集，尚未主动调用 `createRenderQuality()`；默认若先进入大地图则暂用 render 的 high 代理，战斗触发探测后同页共享结果。
- 最近自动档重载需要存档 owner；`setRenderRecoveryHandlers()` 已给接口但本任务不可改装配入口，默认按钮先保留当前战况整体重建。
- （待实测）真机上下文恢复、各档 FPS/显存及第二 VFX 上下文压力；默认维持当前双 canvas，不声称单上下文达标。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；未完成项按既有 `tech/02`、`tech/03` 契约留给后续，不以实现反改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 | 改什么 |
|---|---|---|
| ENG-15 后续 UI | 设置页 / `WorldMapPage.vue` | 控件调用 `setTier()`/`clearCachedDetection()`；页面挂载先 `await createRenderQuality()` 并传 `quality`/恢复回调 |
| 存档装配任务 | `main.ts` 或 `game-controller.ts` | 注册 `setRenderRecoveryHandlers()`：丢失立即强制自动存档，“重新载入”读取最新 `save_auto_*` |
| Playwright 后续 | 恢复场景 | 用 `WEBGL_lose_context.loseContext()/restoreContext()` 验证遮罩、5 s 分支、截图与存档保留 |
| 渲染后续 | `town/**`、VFX 合并 | 城镇接守卫/DPR；VFX 改同一 renderer/离屏 RT，满足单上下文 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 守卫状态机与恢复步骤：lost/restore/timeout/count/dispose/前台/迟到恢复/重建失败均覆盖；BattleField 遮罩与按钮已接。
- ✅ 四档与检测规则：表值、Mali G71/G710、Apple、内存/能力/内置浏览器封顶、30 天缓存、7 天丢失安全线均有代码/测试。
- ✅ 调节器：固定数组每帧零分配、0.5 s/60 帧/30 样本/2 s/0.05/5 s、CPU 判别与 30 fps 封顶覆盖。
- ✅ 审计项：H2 DataTexture；M10 可修改场景 force loss 与 VFX 指定热路径 scratch；L7 worldmap coreMesh dispose；残影校验/单帧边界无回归。
- ✅ 门禁：install；`pnpm check`（99/570，content 394/394；entry 129.23/170、render 156.64/180、WebGL 285.87/350 KiB）；独立 game build；strict IDs（新增失败 0）；`git diff --check`。
- ✅ 技术核实：MDN WebGL 事件/扩展、deviceMemory/localStorage 与 Three WebGLRenderer/DataTexture，访问日 2026-10-02，链接见 `packages/render/CLAUDE.md`。
- ✅ 范围：仅允许写集；未改 rig/town/package/锁文件，未执行改变仓库状态的 git 命令。
- ⚠️ 明确未做：标题基准、温控 T0–T3、FramePacer、`?perf=1`、Playwright、VFX 上下文合并、IsoLit、城镇守卫/DPR。
- ⚠️ 沙箱外验证：`pnpm --filter ./apps/game dev`，控制台取 canvas WebGL2 的 `WEBGL_lose_context`，依次 `loseContext()` / 5 s 内 `restoreContext()`；另保持丢失 >5 s 测两按钮，并在 iOS/Android 前后台 10 次与各档记录 P50/P95。

# 本任务：游戏工程 · 渲染补齐 A（战斗四偏航旋转 / 昼夜色调）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-08-worldmap.md`、`ENG-09-town-scene.md`、`ENG-10-battle-ui.md`、`ENG-11-vfx.md`、`ENG-12-rig-walk.md`、`ENG-12b-perf-gate.md`。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 渲染行：M1 要地形、两段式精灵、**四偏航**、战斗格、基础 VFX、DOM 浮字、**昼夜**、恢复、自适应。前五项已有。本任务做四偏航和昼夜；上下文丢失恢复和自适应质量由 ENG-21b 接着做。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- `packages/render/src/battle/scene.ts`：
  - 镜头固定在俯仰 30°、偏航 45°；
  - `hexDirToRig` 按 ψ=45 写死，返回 `[7,6,4,3,2,0]`；
  - `pick` 没有旋转保护。
- rig 公告板的朝向取自视图矩阵（`rig/batch.ts`），换任何偏航都不用改 rig。
- `worldmap/scene.ts` 有环境光和方向光；城镇（ENG-09）的建筑和贴片都是预渲染 45° 图，着色器不受光照。
- render 没有任何接收时间的接口。世界时间只以 `UiProjection.worldTick` 到达界面；core 常量 `TICKS_PER_HOUR = 600`，第 0 tick 为 00:00。
- 仓库里没有 `packages/spec/`，tech/02 §1.3 的 `iso-camera.json` 不存在。

## 规格（照这些写，不自创）

- `docs/tech/02-rendering.md`：
  - §1.2 俯仰 30° 与镜头基向量公式；
  - §1.3 `iso-camera.json` v1 字段：`yawPresetsDeg [45,135,225,315]`、`rotationMs 350`、`allowRotation`、`sunAzimuthRelDeg` 等；
  - §1.5 旋转：4 个 90° 预设，Q/E 加界面按钮，绕当前目标 350 ms easeInOutCubic；旋转中公告板重新朝向、每帧重算 Dir8，拾取暂停；`spriteDir()` 公式与 ±22.5°、0/360 回绕测试；
  - §1.8 镜头行为；
  - §4.2 太阳方位相对镜头：φ = ψ + Δ，Δ = 80° + 30°·cos(π·phase)；月光与半球光强度；
  - §7 昼夜：渲染读 `timeOfDay`（0–24 h），战斗开始时冻结时间；§7.1 关键帧：颜色在 OKLab 插值、标量线性插值，可按书覆盖；
  - §11.2 `CameraControl.rotate(step)` / `yawDeg`；§11.3 `IsoCameraRig.update`。
- `docs/design/09-combat-system.md`：core `HexDir` dir0..5 是世界角 0/300/240/180/120/60°，只持久化 `HexDir`。
- `docs/design/14-ui-ux-mobile.md`：§1.6 两个按钮加 Q/E，旋转中暂停拾取；§6.1 旋转 350 ms 后再保护 150 ms；转镜头不算单位行动。
- `docs/tech/09-character-rig.md`：§1.3 三视图、镜像、八方向，`HexDir × ψ` 表，先算 `spriteDir`；§4.3 转镜头不另开视图动画。
- `docs/design/22-town-layout-and-generation.md` §1.5：只有 45° 图的建筑不旋转（`allowRotation=false`）。
- `docs/design/11-open-world.md` §6.2：十二时辰与昼夜相位。

## 要做的事

1. **镜头**（新建 `packages/render/src/camera/`，不依赖 three）：
   - `iso-camera.ts`：§1.3 参数写成 TS 常量，字段名照 §1.3；`cameraBack(ψ)`；零分配的旋转补间；
   - `facing.ts`：`spriteDir()` 与 `hexDirWorldYaw(d)`；`hexDirToRig(dir, yaw)` 改为按偏航计算，ψ=45 时结果与现在一致。
2. **战斗旋转**：
   - 战斗渲染器提供 `camera { yawDeg, rotating, rotate(±1) }`，每帧绕目标转，Dir8 变化时重算；
   - 旋转中和结束后 150 ms 内 `pick` 返回 null；「减少动效」开启时瞬切；
   - `BattleField.vue` 加两个旋转按钮和 Q/E（与现有键盘处理同样的输入保护），旋转时重投 DOM 标签。
   - 大地图与城镇不旋转（`allowRotation=false`），报告说明。
3. **昼夜**（新建 `packages/render/src/lighting/`）：
   - `time-of-day.ts`：§7.1 关键帧求值、§4.2 太阳方位；
   - 大地图驱动现有灯光和清屏色；
   - 战斗与城镇的着色器不受光照：用一个全屏乘色层（+1 draw call）做色调，夜间保留可读性下限；
   - 战斗和大地图场景都提供 `setTimeOfDay(hours)`。战斗在挂载时按投影的 `worldTick` 冻结时间，换算在应用侧用 core 常量。
   - 大地图页面的接线在 `apps/game/src/pages/**`，归 ENG-15，本任务不接，报告写清怎么接。
4. **测试**：
   - `spriteDir` 在 ±22.5° 和回绕处的取值；ψ=45 时仍为 `[7,6,4,3,2,0]`；135 / 225 / 315 与 tech/09 §1.3 表一致；`cameraBack(45)` 等于现在的战斗镜头方向；补间时长；
   - 战斗场景测试，照 `packages/render/src/vfx/stage.test.ts` 的写法 mock three：旋转后偏航 135，旋转中及其后 150 ms 拾取为 null，Dir8 更新；数 draw call：格 1 + rig 2 + 色调层 1；
   - `time-of-day`：关键帧精确值、回绕、Δ 在三个相位为 110° / 80° / 50°；
   - 不用墙钟阈值。

约束：
- 写集：
  - `packages/render/src/camera/**`、`packages/render/src/lighting/**`、`packages/render/src/battle/**`、`packages/render/src/worldmap/**`、`packages/render/src/index.ts`、`packages/render/src/render.test.ts`、`packages/render/CLAUDE.md`；
  - `apps/game/src/battle/components/BattleField.vue`、`apps/game/src/battle/components/BattleControls.vue`、`apps/game/src/battle/battle.css`；
  - `packages/ui/src/i18n.ts`（只加按钮文案）。
  - 写集外的改动在提交时会被丢弃，所以不要改写集外的文件。
- **不改**：
  - `packages/render/src/rig/**`（TOOL-rig 原型在改）、`packages/render/src/town/**`、`packages/render/src/vfx/**`、`packages/render/package.json`（新模块从 `.`、`./battle`、`./worldmap` 导出）；
  - `apps/game/src/battle/*.ts`（ENG-16a 在改）；
  - `apps/game/src/App.vue`、`game-controller.ts`、`apps/game/src/{pages,scenes,runtime}/**`（ENG-15）；
  - `apps/game/vite.config.ts`、`apps/game/build/**`（ENG-18）；
  - `vitest.config.ts`、根 `package.json`、`pnpm-lock.yaml`、`tools/perf/**`。
  - 确实需要改这些才能完成的，在报告里写明需要什么，不要改。
- 分层：render 不算规则，不依赖 core 与 platform。
- 每次写入 ≤ 150 行；不加新依赖；入口不静态引入 render（保持懒加载 chunk）。

性能是作者硬要求（AR-21「性能要最好」）：每帧零分配；色调层只 +1 draw call；`pnpm size` 预算不超。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- （apps/game 的测试由根 `pnpm check` 覆盖。包内 `pnpm --filter ./apps/game test` 加载 `vite.config.ts` 会失败：`packages/data/src/tooling.ts` 的无后缀 ESM 导入。这是集成分支的已知问题，另有任务修，不在本任务范围，不要改。）
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不要改门禁阈值，也不要在测试里加任何「高负载跳过」逻辑。浏览器里的帧率实测仍记「待实测」（沙箱拦 Chromium）。

## 报告

第 7 节写：
- 镜头与朝向 API、`HexDir × ψ` 对照表；
- 昼夜关键帧实现与色调层；
- 改动前后的 draw call（战斗、大地图）与 `pnpm size` 数字；
- 交给下游的接口（放哪、怎么测、接口名）：
  - ENG-21b：渲染器创建与 DPR 的位置；
  - ENG-12c：可复用的 `yawDeg` 与 `spriteDir`；
  - 大地图页面的昼夜接线：给 ENG-15 之后的 UI 任务；
  - rig 转镜头时的 160 ms 转身动画与 tech/09 §4.3 不符，写明位置，留给 rig 任务。

报告 ≤ 90 行。

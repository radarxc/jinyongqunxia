# 本任务：城镇探索 v2 · P1 · 人物按身高数据缩放（去掉写死的 3.4 m、按头顶骨骼量身高、GLB 加载后隐去重叠的 2D rig）

**第一个动作**：打开 `packages/render/src/town/scene.ts`，搜 `loadPilotModel(`（约 L98，写死 3.4）与 `SPRITE_HEIGHT`（约 L16，2.1），再打开 `packages/render/src/region/scene.ts` 的 `loadPilotModel(`（约 L114，也是 3.4）与 `packages/render/src/gltf/load.ts` 的 `normalizePilotScene` / `loadPilotModel`，读完直接动手；不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（render 不算玩法；热路径不分配）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配」。查明原因：城镇与区域场景的 3D 主角被写死缩放到 3.4 m（标准 1.70 / 1.62 m；作者 AR-104 定的体型身高：男 1.76 / 1.81 / 1.86、女 1.58 / 1.66 / 1.72 m），城镇 NPC 立绘剪影 2.1 m，旧 2D rig 占位主角（1.7 m）还和 GLB 叠在一起画。另外 `normalizePilotScene` 按包围盒高度缩放，把发髻算进身高，人约矮 3%。本任务只修比例；建筑仍是 45° 手绘贴图（按真实尺寸画），**正确身高的人站在旁边会显得比以前小，这是对的，不要为了"看着合适"缩放主角**——比例问题由后续 3D 古建彻底解决（tech/14 §3 D1 / D3）。

## 要做的事
1. **身高表** `packages/render/src/actors/heights.ts`：导出 `BODY_TEMPLATE_HEIGHT_M = { tpl_f_small: 1.58, tpl_f_medium: 1.66, tpl_f_tall: 1.72, tpl_m_lean: 1.76, tpl_m_medium: 1.81, tpl_m_bulk: 1.86 }`、`DEFAULT_PLAYER_HEIGHT_M = { male: 1.81, female: 1.66 }`、`DEFAULT_NPC_HEIGHT_M = { male: 1.70, female: 1.62 }`（tech/02 缺省），与 `heightForTemplate(id)`（未知模板抛错）。
2. **按头顶骨骼量身高**：`packages/render/src/gltf/load.ts` 的 `loadPilotModel(url, heightM, opts?)` 增加可选 `opts.stature: 'bbox' | 'headTop'`（**缺省 `'bbox'`，保持战斗等现有调用不变**）。`'headTop'` 时找名为 `HeadTop_End`（或 Mixamo `mixamorig:HeadTop_End`）的骨骼，按其绑定姿势世界高度减脚底高度作为身高缩放；找不到时退回包围盒并 `console.warn` 一次。
3. **城镇场景** `packages/render/src/town/{scene,types}.ts`：`TownSceneOptions` 加 `playerHeightM?: number`、`npcHeightM?: number`（缺省取 heights.ts）；GLB 主角用 `loadPilotModel(url, playerHeightM, { stature: 'headTop' })`；NPC 立绘剪影高度改为 `npcHeightM`（剪影是全身立绘，按图高 = 身高）；GLB 加载成功后**隐去 2D rig 主角**（与 `region/scene.ts` 现有做法一致），加载失败才保留 rig 兜底。
4. **区域场景** `packages/render/src/region/{scene,types}.ts`：同样加 `playerHeightM?`，主角 GLB 用 `{ stature: 'headTop' }`。
5. **页面传值**（一行级改动）：`apps/game/src/pages/TownPage.vue` 与 `apps/game/src/pages/RegionPage.vue` 按主角性别传 `playerHeightM`（女 1.66、男 1.81；性别取页面已有的 `identity.gender` 判断，取不到按男）。不做其他页面改动。
6. **测试**：`packages/render/src/actors/heights.test.ts`（表值、未知模板抛错）；`packages/render/src/gltf/load.test.ts` 增加用例——构造带 `HeadTop_End` 的最小骨架场景，`'headTop'` 缩放后头顶骨骼高度 = 给定身高 ±1 mm、`'bbox'` 行为与改前一致、缺骨骼时退回包围盒；town / region 场景测试里断言传入的身高被采用、GLB 就绪后 rig 主角不可见（用现有 test fixture 的模拟加载器）。

## 约束
- 只写：`packages/render/src/actors/heights.ts`（+ 测试）、`packages/render/src/gltf/load.ts`（+ 测试）、`packages/render/src/town/{scene,types}.ts`、`packages/render/src/region/{scene,types}.ts`、`packages/render/src/{town,region}/*.test.ts`、`apps/game/src/pages/{TownPage,RegionPage}.vue` 与本任务报告。
- 不改战斗侧调用与其身高（`apps/game/build/battle-model-assets.ts` 不动）；不新增依赖；GLTFLoader 仍只经动态 import 进入（不得进 render 主闭包）；`render` 块体积不涨超过 0.5 KiB。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。包级 render 测试含 rig CPU 性能门，负载高时失败要如实报告负载，不得放宽或跳过。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/actors packages/render/src/gltf packages/render/src/town packages/render/src/region --config vitest.config.ts --project node`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-heights.md`（≤ 50 行）：第 3 节写头顶骨骼量高的做法与对 3 个试点 GLB（`npc_zhujue__ch00_m/f`、`npc_generic_m`）的实测：包围盒高 vs 头顶骨骼高（如能在 Node 里解析）；第 7 节写给 v1 页面任务的说明（页面怎么传身高）。

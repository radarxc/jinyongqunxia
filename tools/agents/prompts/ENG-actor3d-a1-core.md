# 本任务：城镇 3D 人物 · 运行时骨架 `packages/render/src/actor3d`——类型、资产目录、步态选择与播放率、身高缩放（纯函数）+ 端口桩

**第一个动作**：打开 `docs/tech/16-town-3d-spec.md` §9（全部，尤其 §9.1 的类型块、§9.3 身高、§9.4 播放率表）、`packages/render/src/battle/model-stage.ts`（原生步速约 L50、`retargetBattleClips`）、`packages/render/src/actors/heights.ts`（ENG-town2-heights 的身高表）与 `packages/render/src/gltf/load.ts`（`stature: 'headTop'` 的量高做法）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（render 不算玩法；热路径不分配；GPU 资源有主并可重复 dispose）。

## 背景
作者 AR-114（2026-10-10）：「小地图探索中，人物大小和建筑不匹配」；作者拍板人物用 3D 模型、按身高数据缩放，并有城镇减面版（LOD）。人物走路要"脚不打滑"：沿路线匀速移动，动画播放率 = 速度 ÷（原生速度 × 身高），夹到 0.80–1.45；走 / 跑切换有滞回。本任务只做 `actor3d` 的纯逻辑骨架与桩，GLTF 加载、克隆缓存、影子、拾取是 a2，换装适配与 X 光是 a3。

## 要做的事（`packages/render/src/actor3d/`）
1. **`types.ts`**：照 tech/16 §9.1 原样写 `ActorLook`、`ActorLodAsset`、`ActorAssetSet`、`ActorCatalog`、`ActorEquipment`（换装规格类型从 `../dressup` 现有导出取，不复制），以及 tech/15 §5 的 `ActorPort` 接口（`spawn / despawn / setPose / setEquipment / update / pick / restore / dispose / stats`）与 `ActorStats`。
2. **`gait.ts`**：`selectGait(prev, speedMps)`（静止 < 0.05；走 → 跑阈值 2.6，跑 → 走阈值 2.2）；`gaitTimeScale(speedMps, heightM, hps)` = clamp(v / (hps · h), 0.80, 1.45)；追赶倍率（落后 > 0.5 m 时最多 1.15×，播放率同乘）；转身限速 ≤ 540°/s 的角度步进函数（带最短弧与缓动）。缺省原生速度：走 0.612、跑 2.143 身高 / 秒（`model-stage.ts` 现值），以常量导出，测出后由资产清单 `nativeHps` 覆盖。
3. **`stature.ts`**：`actorScale(heightM, statureMu)` = heightM / statureMu（模型单位的 `HeadTop_End` 高）；身高必须来自数据（`ActorLook.heightM`），**绝不按包围盒**；`heightM` 越界（< 1.2 或 > 2.3）抛 `ACTOR_HEIGHT_RANGE`。
4. **`catalog.ts`**：`createStaticActorCatalog(entries)`——按 `template / role` 解析到 `ActorAssetSet`（LOD 对、`clipsUrl`、`statureMu`、`nativeHps`）；未知模板回退到通用男 / 女（按模板前缀 `tpl_m_` / `tpl_f_`），再不行抛 `ACTOR_TEMPLATE_UNKNOWN`；按档位选 LOD 的纯函数 `pickLod(role, tier, fullDetailSlotsUsed)`（tech/16 §9.6 表：低档全 LOD1；中档仅主角 LOD0；高档 3 个、极致 6 个全精度名额）。
5. **`index.ts`** 只导出类型与上述纯函数，外加 `createActorPort` 的**桩**（抛 `ACTOR3D_NOT_IMPLEMENTED`，a2 实现）。端口实现文件（`port.ts`、`cache.ts`、`actor.ts`、`shadow.ts`、`pick.ts`）本任务**不要建**，留给 a2。

## 测试（`packages/render/src/actor3d/*.test.ts`，node 项目）
命名用例：
- 播放率表（tech/16 §9.4）：6 个身高 × 走 1.35 / 跑 4.5 m/s 共 12 格，`gaitTimeScale` 与表值 ±0.01。
- 夹取：极慢 / 极快速度夹到 0.80 / 1.45。
- 滞回：速度 2.4 时，从走保持走、从跑保持跑；2.61 走 → 跑；2.19 跑 → 走；< 0.05 → 静止。
- 追赶：落后 0.6 m 时倍率 ≤ 1.15，播放率同乘；落后 0.4 m 不追。
- 转身：180° 掉头在 1/3 s 内完成且每帧角速度 ≤ 540°/s；走最短弧（350° → 10° 转 20°）。
- 身高缩放：`statureMu = 1.0`、heightM 1.81 → 缩放 1.81；越界抛错。
- 目录：未知 `tpl_m_xxx` 回退通用男；`pickLod` 四档名额与 §9.6 表一致。
- 纯函数无分配：`gaitTimeScale / selectGait / 转身步进` 在 1 万次调用的预热后，HeapProfiler 采样不增长（照 `packages/render/src/dressup/actor-runtime.test.ts` 的写法）。
- `actor3d/{gait,stature,catalog}.ts` 不 import three（读源码断言）。

## 约束
- 只写：`packages/render/src/actor3d/{index,types,catalog,gait,stature}.ts` 与对应 `*.test.ts`、本任务报告。
- 不改 `packages/render/package.json`（`./actor3d` 子路径导出由 ENG-town2-chunks 统一加）、`dressup/**`、`battle/**`、`actors/heights.ts`、`apps/game/**`；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/actor3d --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-actor3d-a1-core.md`（≤ 50 行）：第 3 节列播放率实测表、滞回与追赶参数、LOD 名额规则；第 7 节写给 a2（端口实现文件清单、`ActorAssetSet` 字段从哪来、播放率怎么接到 `AnimationMixer.update(dt × 倍率)`）与 TOOL-actor3d-t1-lod（`town.json` 需要的 `statureMu / nativeHps` 字段格式）的交接。

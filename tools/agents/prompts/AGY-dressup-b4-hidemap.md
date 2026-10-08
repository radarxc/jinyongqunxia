# 本任务：3D 纸娃娃换装 · B4 · 运行时身体遮罩（hide map）+ 预览页开关（AR-102 / AR-108 V2）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V2）、`docs/tech/11-paper-doll-3d-impl-spec.md`（§8、§9、§11），以及 `packages/render/src/dressup/{types,materials,actor,runtime}.ts` 现状（B1a 区域位掩码、B3 贴图层合成器与引用计数缓存）、`apps/game/src/pages/Character3dPage.vue`「换装 v2」、`apps/game/build/dressup-assets.ts`（index.json）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12），与 `_code.md` 的 Node 24 / pnpm 12 不同不算偏离。

## 作者要求
**AR-108**：「重点是要把衣服匹配上」——闸门 V2：衣服在三套模板 idle / walk / run 下无可见穿模、无黑洞。离线任务 G1 为每件衣物烘一张**身体遮罩** `hidemask.png`（L 8 位，与模板 baseColor 同 UV，**白 = 该处身体不画**；fit.json `hideMask: { file, size, … }`，三模板各一张、共 UV）。本任务让运行时用它：衣服盖住的身体逐纹素丢弃，开口附近保留皮肤。

## 要做的事
1. **材质**（`materials.ts`）：身体材质的 `onBeforeCompile` 注入 `uniform sampler2D uHideMap; uniform bool uHideMapOn;`，片元在采样 `vUv` 后 `if (uHideMapOn && texture2D(uHideMap, vUv).r > 0.5) discard;`；与现有区域位掩码（`uHideMask`）并存、互不影响；`customProgramCacheKey` 固定；`customDepthMaterial`（若有）同样注入。
2. **actor**（`actor.ts` / `types.ts`）：`equip` 时若 fit 带 `hideMask`，按当前模板取对应文件（`fits` 变体优先，没有则用主件）加载遮罩；所有已穿衣物的遮罩做**并集**（逐像素取最大）合成为一张，复用 B3 的合成器与模块级引用计数缓存（键 = 有序遮罩 id 序列 + 模板 id）；`unequip` / 换模板后重算；全空时 `uHideMapOn = false`。新增 `setHideMapEnabled(on)`（预览对比用，默认开）；`stats()` 加 `hideMaps`（当前遮罩 id 列表）。`update(dt)` 仍零分配。
3. **素材索引**：`dressup-assets.ts` 发布 fit 里 `hideMask` 指向的 PNG（与 file / fit / report 一样按 manifest 目录复制，含 fits 变体），index 条目带 `hideMask` URL；补测试（不写死真实素材数字，测试只写临时目录）。
4. **预览页**：「换装 v2」动作区加「身体遮罩：开 / 关」开关（对比用）；`window.__dressup` 增 `hideMap` 状态。保留全部现有功能。
5. **测试**：合成器并集与缓存释放（假合成器计数）、换模板重算、开关、没有遮罩时 shader 分支关闭；`pnpm size`：render 主块不增长，`render-dressup` ≤ 24 KiB（前后数字写报告）。

## 约束
- 只写 `packages/render/src/dressup/{types,materials,actor,runtime}.ts` 与同目录 `*.test.ts`、`packages/render/CLAUDE.md`（补一段 hide map API）、`apps/game/build/dressup-assets.ts`、`apps/game/build/dressup-assets.test.ts`、`apps/game/src/pages/Character3dPage.vue` 与本任务报告。
- 不加依赖；不改门禁阈值；运行时只经 `import('@tianshu/render/dressup')` 动态引入；只用 render 主块已有的 three 核心 API（新增 three 模块会让主块增长）。
- 本任务由 agy 执行：必须把改动、测试、检查全部做完再结束；不执行改变仓库状态的 git 命令。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/render test`
- `pnpm check`
- `pnpm --filter ./apps/game build`

## 报告
`tools/agents/reports/AGY-dressup-b4-hidemap.md`：第 3 节写 API、合成与缓存策略、shader 注入、`pnpm size` 前后；第 7 节写协调者浏览器验收步骤（穿劲装 → 开 / 关遮罩 → 看领口、袖口、衣摆）。报告 ≤ 50 行。

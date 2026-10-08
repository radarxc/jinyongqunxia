# 本任务：3D 纸娃娃换装 · B4 · 运行时身体遮罩（hide map）+ 挂头 + 预览页开关（AR-102 / AR-108 V2 / V4）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V2）、`docs/tech/11-paper-doll-3d-impl-spec.md`（§8、§9、§11），以及 `packages/render/src/dressup/{types,materials,actor,runtime}.ts` 现状（B1a 区域位掩码、B3 贴图层合成器与引用计数缓存）、`apps/game/src/pages/Character3dPage.vue`「换装 v2」、`apps/game/build/dressup-assets.ts`（index.json）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12），与 `_code.md` 的 Node 24 / pnpm 12 不同不算偏离。

## 作者要求
**AR-108**：「重点是要把衣服匹配上」——闸门 V2：衣服在三套模板 idle / walk / run 下无可见穿模、无黑洞。离线任务 G1 为每件衣物烘一张**身体遮罩** `hidemask.png`（L 8 位，与模板 baseColor 同 UV，**白 = 该处身体不画**；fit.json `hideMask: { file, size, … }`，三模板各一张、共 UV）。本任务让运行时用它：衣服盖住的身体逐纹素丢弃，开口附近保留皮肤。

## 要做的事
1. **材质**（`materials.ts`）：身体材质的 `onBeforeCompile` 注入 `uniform sampler2D uHideMap; uniform bool uHideMapOn;`，片元在采样 `vUv` 后 `if (uHideMapOn && texture2D(uHideMap, vUv).r > 0.5) discard;`；与现有区域位掩码（`uHideMask`）并存、互不影响；`customProgramCacheKey` 固定；`customDepthMaterial`（若有）同样注入。
2. **actor**（`actor.ts` / `types.ts`）：`equip` 时若 fit 带 `hideMask`，按当前模板取对应文件（`fits` 变体优先，没有则用主件）加载遮罩；所有已穿衣物的遮罩做**并集**（逐像素取最大）合成为一张，复用 B3 的合成器与模块级引用计数缓存（键 = 有序遮罩 id 序列 + 模板 id）；`unequip` / 换模板后重算；全空时 `uHideMapOn = false`。新增 `setHideMapEnabled(on)`（预览对比用，默认开）；`stats()` 加 `hideMaps`（当前遮罩 id 列表）。`update(dt)` 仍零分配。
3. **素材索引**：`dressup-assets.ts` 发布 fit 里 `hideMask` 指向的 PNG（与 file / fit / report 一样按 manifest 目录复制，含 fits 变体），index 条目带 `hideMask` URL；补测试（不写死真实素材数字，测试只写临时目录）。
4. **预览页**：「换装 v2」动作区加「身体遮罩：开 / 关」开关（对比用）；`window.__dressup` 增 `hideMap` 状态。保留全部现有功能。
5. **挂头（协调者 2026-10-08 14:20 并入本任务，闸门 V4）**：D1（`cut_head.py`）产出 `assets/default/model3d/dressup/heads/<npc_id>/{head.glb, fit.json, manifest.yaml}`：`head.glb` 与衣物件同样按模板 joints 顺序与 IBM 蒙皮；fit.json `kind: "head"`、`hideRegions: ["head"]`（模板自带光头不画）、`skinTint: [r, g, b]`（作用于模板身体 baseColor 的乘子）、`neverHide`；manifest `kind: dressup-head`。要求：
   - `DressupEquipSpec.kind` 增加 `'head'`，`equip({ kind: 'head', … })` 复用衣物的骨名重映射与显式 bindMatrix 绑定路径；同一时刻最多一个头（新头替换旧头）；`hideRegions` 照常并入区域位掩码；
   - `skinTint` 乘到身体材质颜色上（卸下头时恢复 1,1,1）；`setHead(url | null, { skinTint })` 保持既有签名，内部转调上述路径；
   - 素材索引 `head` 分组列出 heads 条目（含 fit URL）；预览页「换装 v2」加「头」分组（选中即挂、再点卸下）；
   - D1 尚未合入时用测试夹具开发，合入后页面按索引自动出现。
6. **测试超时（协调者 2026-10-08 15:20）**：`apps/game/build/dressup-assets.test.ts` 里凡是调用 Python 门禁 / 工具的用例（如"uses strict nearest triangles for signed distance…"默认 5 s、"runs all 72 dynamic frames…" 120 s），在多任务并行时会超时误报（10-08 G1 校验两次撞线）。给这些用例显式设 300 s 超时；**只改超时上限，不跳过、不放宽任何断言或门禁阈值**。
7. **分配采样用例（协调者 2026-10-08 15:45 改派）**：已拆给 `ENG-dressup-alloc-steady` 单独修；B4 **不改** `actor-runtime.test.ts` 里 "samples no steady update allocations…" 这个用例，`update` 热路径也不得新增每帧分配。
8. **测试**：合成器并集与缓存释放（假合成器计数）、换模板重算、开关、没有遮罩时 shader 分支关闭；`pnpm size`：render 主块不增长，`render-dressup` ≤ 24 KiB（前后数字写报告）。

## 协调者实测意见（第 1 轮，2026-10-08 16:05；审核按此判定）
第 2 次运行方向对（材质 `uHideMap` 丢弃、并集、开关、挂头乘 skinTint 都有），但：
1. **遮罩尺寸与底图不同会直接抛错**：遮罩合成复用了贴图层合成器，合成器要求每张图与身体底图同尺寸（`DRESSUP_LAYER_SIZE_MISMATCH`）。模板 baseColor 是 2048²，G1 烘的 `hidemask.png` 是 1024²（`--size` 默认 1024）——真穿劲装必抛。改为遮罩走自己的合成：画布取参与合成的遮罩里最大的边长，各遮罩按 UV 等比缩放画上（线性插值），并集用逐像素 max（`lighter` 会把半透明边缘加过 1，可以但须钳位），**不与 baseColor 比尺寸**；输出纹理是数据纹理：`NoColorSpace`、`flipY = false`（与 glTF UV 左上原点一致）、线性过滤。缓存键含各遮罩 URL 与尺寸。
2. **补一条用真实尺寸的测试**：底图 2048 + 两张 1024 / 512 遮罩（假图像对象即可）合成不抛、输出尺寸 = 最大遮罩边长、像素为并集；再加一条 `dressup-assets.test.ts` 断言：索引里每件带 `hideMask` 的 fit，其 PNG 实际尺寸 = fit 里写的 `size`（从文件读，不写死）。
3. **异步失败不能吞**：`unequip` 是同步签名，里面触发的遮罩重算 Promise 必须 `.catch`，失败写入 `stats().hideMapError`（字符串）并 `console.warn`，预览页把它显示出来；不得出现未处理的 rejection。
4. `setHead` 里不要靠 `this`（解构调用会断）：改为闭包内直接调用同一个 `equip` 实现。

## 协调者实测意见（第 2 轮，2026-10-08 16:30；改由 traex 执行，审核按此判定）
第 3 次运行**没有落实第 1 轮四条**：遮罩仍借用贴图层合成器（`DRESSUP_LAYER_SIZE_MISMATCH` 照旧，2048 底图 + 1024 遮罩必抛）、输出仍是 `SRGBColorSpace`、没有 `stats().hideMapError`、没有真实尺寸测试、`setHead` 仍靠 `this`。本轮起改由 traex 执行，第 1 轮四条全部照做，另加：
5. **`content-plugin.test.ts` 桩文件**：索引现在对所有 kind 读 fit.json 取 `hideMask`，该测试 "publishes non-rejected dressup triplets…" 写的桩 `fit.json` 内容是文件名字符串（非法 JSON）。本任务写集已加入 `apps/game/build/content-plugin.test.ts`，**只允许**把桩 fit.json 的内容改成合法 JSON（如 `{}`），其余不动；索引代码遇到真实素材里的坏 fit.json 仍须报错，不得吞掉。
6. 工作区已由协调者挪到含 `ENG-dressup-alloc-steady` 的新基点（分配采样用例已改为"等到稳态"，不要再动它）；`dressup-assets.test.ts` 的 300 s 超时与 `AGY-dressup-pytimeouts` 逐字一致，保持即可。
7. 合入前在 5173 `/character-3d`「换装 v2」由协调者实测：劲装（G1 遮罩）穿上不抛错、遮罩开 / 关可对比、换模板遮罩跟着换；挂头后身体乘 skinTint。代码里给 `window.__dressup` 暴露 `hideMapError` 与当前遮罩尺寸，便于实测。

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

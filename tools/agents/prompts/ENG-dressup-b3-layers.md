# 本任务：3D 纸娃娃换装 · 阶段 B3 · 运行时贴图层（身体贴图叠层）+ 预览页「贴图层」开关（AR-102）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md` §7~§9、§11，B1a / B1b / B2 报告第 7 节，`tools/agents/prompts/ENG-dressup-e3-texlayer.md`（贴图层文件格式：`*.layer.png` RGBA 非预乘、与模板 baseColor 同尺寸、glTF UV、`layer.json` 字段）。

## 作者要求
作者 2026-10-08 同意**贴图层与网格层两条路同时试**（「同时试试吧」），要在本地 `/character-3d` 直接对比。贴图层 = 身体网格不变、把贴身衣服画进身体贴图：不穿模、零额外 draw call、三套模板共用一张层（共 UV）。E3 离线烘焙出 `assets/default/model3d/dressup/garments/eq_jinzhuang_tex/eq_jinzhuang.layer.png`；本任务让运行时与预览页能叠上它。E3 未合入前用测试夹具开发，合入后页面按 `index.json` 自动列出，无需改代码。

## 要做的事
1. **运行时**（`packages/render/src/dressup/`）：
   - `types.ts` 加 `DressupLayerSpec { id: string; url: string; order?: number }`；
   - `actor.ts` 加 `setBodyLayers(layers: readonly DressupLayerSpec[]): Promise<void>`：按 `order`（缺省按传入顺序）把各层 alpha 叠到模板原始 baseColor 上，得到一张合成贴图换给身体材质的 `map`（`colorSpace = SRGBColorSpace`、`flipY = false`、沿用原贴图的 wrap / filter / anisotropy）；空列表恢复原贴图；同一组合（按层 id 序列为键）在模块级缓存里引用计数共享，最后一个使用者释放时 `dispose`；`dispose()` 释放本 actor 持有的合成贴图引用；并发调用以最后一次为准（先发后至的结果丢弃并释放）。
   - 合成器可注入：`createDressupActor({ …, compositor? })`，默认实现用 `OffscreenCanvas`（无则 `document.createElement('canvas')`）+ `ImageBitmap` / three `ImageLoader`；测试用纯内存假合成器。
   - `update(dt)` 仍零分配；`stats()` 加 `bodyLayers`（当前层 id 列表）与 `layerTextureBytes` 估计。
   - 只用 render 主块已有的 three 核心 API；`render-dressup` 块仍 ≤ 24 KiB，render 主块不增长（`pnpm size` 前后对比写报告）。
2. **素材索引**（`apps/game/build/dressup-assets.ts` + 测试）：manifest `kind: dressup-layer` 的条目进 `index.json` 的 `layer` 分组（`{ kind: 'layer', id, file, fit, status, slot, template }`）；layer 条目没有 `report` 字段时不报错。
3. **预览页**（`apps/game/src/pages/Character3dPage.vue`「换装 v2」）：装备列表新增「贴图层」分组（来自索引），点选叠上、再点去掉，可多选（按列表顺序叠）；与网格衣物可同时穿，便于作者对比"同一件劲装：网格层 vs 贴图层"；切换模板时保留已选层（三套共 UV）；`window.__dressup` 增加 `layers`。保留现有全部功能。
4. 测试：合成顺序、缓存共享与引用计数释放、空列表恢复原贴图、并发调用只保留最后一次、`dispose` 不泄漏（假合成器计数）；索引分组测试。

## 约束
- 只写 `packages/render/src/dressup/{types,actor,runtime}.ts` 与同目录 `*.test.ts`、`packages/render/CLAUDE.md`（补一段贴图层 API）、`apps/game/build/dressup-assets.ts`、`apps/game/build/dressup-assets.test.ts`、`apps/game/src/pages/Character3dPage.vue` 与本任务报告。
- 不改门禁阈值、不加依赖；运行时仍只能经 `import('@tianshu/render/dressup')` 动态引入。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/render test`
- `pnpm check`
- `pnpm --filter ./apps/game build`

## 报告
第 3 节写 API 签名与语义、缓存策略、`pnpm size` 前后 render / render-dressup 体积、测试清单；第 7 节写协调者浏览器验收步骤（打开 `/character-3d` → 换装 v2 → 选模板 → 点「贴图层 · 江湖劲装」→ 看什么）。报告 ≤ 50 行。

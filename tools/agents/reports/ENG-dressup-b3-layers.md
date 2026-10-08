# ENG-dressup-b3-layers 报告 · 3D 纸娃娃换装 · B3 · 运行时贴图层叠加 + 预览页「贴图层」开关
## 1. 摘要（3–6 行）
修复换装索引异步加载后模板/道具分组不刷新的 B2 回归，Three 大对象保持浅响应式。
实现身体 baseColor 的多贴图层合成、模块级共享缓存、引用计数及并发最后调用生效。
素材构建支持无 `report` 的 `dressup-layer`，预览页支持贴图层多选并与网格衣物并存。
ingest 测试已隔离到临时素材根；全部指定检查与 `pnpm check` 通过。

## 2. 产出（文件、行数、主要章节）
- render：`types.ts` 179 行、`actor.ts` 507 行、`runtime.ts` 5 行、`actor-layers.test.ts` 121 行、`actor-runtime.test.ts` 224 行、`CLAUDE.md` 151 行。
- game：`dressup-assets.ts` 218 行、对应测试 716 行；`Character3dPage.vue` 2411 行；`useDressupIndex.ts` 44 行及测试 37 行。
- tool：`ingest.py` 245 行，新增 `--asset-root` 及其与 `--commit` 互斥校验。
- `pnpm install --frozen-lockfile`：通过（668 ms）；render：46 文件/220 测试；页面与索引专项：2 文件/18 测试。
- `pnpm check`：通过，186 文件/1321 测试；content 1777 文件/1708 对象/2 Ink/65 地图；独立 game build 通过（682 modules）。

## 3. 关键结论与数值
- API：`setBodyLayers(layers: readonly DressupLayerSpec[]): Promise<void>`；spec 为 `{ id, url, order? }`，创建参数可注入 `compositor`。
- 语义：按 `order`（缺省保持输入序）合成；空数组恢复原图；输出 sRGB、`flipY=false`，继承原图 wrap/filter/anisotropy。
- 缓存：按有序层 ID 序列模块级共享并引用计数；末位释放时 dispose；竞态仅最后调用提交，过期结果立即释放。
- stats 新增 `bodyLayers` 与 `layerTextureBytes=width×height×4`（不含 mipmap）；`update(dt)` 未加入分配。
- 体积前→后：render `166.66→166.66/180 KiB`，render-dressup `3.59→4.66/24 KiB` gzip，均过门。
- 测试覆盖：合成顺序/参数继承、缓存共享/末位释放、空列表、并发、dispose pending、layer 索引、异步响应式、临时 ingest 根。
- 与文档一致：动态子路径加载、共 UV 跨模板保留、贴图层与网格层并存；偏离：无契约偏离，`actor.ts` 507 行超过“尽量 ≤400”软建议。

## 4. 开放问题（附默认值）
- E3 贴图资产尚未出现在本工作副本，无法完成实图浏览器验收；默认按 `index.json` 的 layer 分组自动出现并沿列表顺序叠加。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；API 使用约定已写入允许修改的 `packages/render/CLAUDE.md`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 索引为 `shallowRef`，异步完成后模板 3、道具 3、garment/hair/layer 0 的 computed 测试通过；actor/stats 同为响应式浅引用。
- ✅ 运行时顺序、缓存、恢复、竞态和释放 5 类测试通过；默认 Canvas/ImageBitmap/ImageLoader 路径已实现。
- ✅ layer 索引允许无 report；全部 ingest 测试使用临时根，真实 `props/` 无 `gate_*` 目录。
- ✅ 贴图层可多选、可取消、切模板保留、与网格衣物并存，`window.__dressup.layers` 已暴露。
- ✅ 四条指定命令均通过：install、render test、check、game build；`git diff --check` 通过。
- ⚠️ 浏览器待协调者实走：打开 `/character-3d` → “换装 v2” → 选模板 → 点“贴图层 · 江湖劲装”；应见衣纹贴在身体表面、无新增网格，可同时穿网格劲装，再点则恢复原身体贴图，切三模板仍保留选择。

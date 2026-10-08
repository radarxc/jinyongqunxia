# ENG-dressup-b2-preview 报告 · 3D 纸娃娃换装 · B2 · /character-3d 预览页「换装 v2」面板（导入预览页基线、素材索引、unlit、实穿）
## 1. 摘要（3–6 行）
已导入主检出预览页与 character-viewer 基线，仅摘取 `main.ts` 的 DEV 路由。
发布管线新增索引，页面以配置 MeshoptDecoder 的 loader 创建 `DressupActor`，支持三体型、实穿、动作、unlit 对比和统计。
旧 attachProp 换装、镜头与质检功能完整保留；dressup 仍为动态块，首屏体积无增长。
三条强制命令通过；浏览器截图因沙箱 Chrome 启动 `SIGABRT` 未完成，留给协调者实走。

## 2. 产出（文件、行数、主要章节）
- `apps/game/src/pages/Character3dPage.vue`（2374 行）：换装 v2 状态、生命周期、交互、面板与样式。
- `packages/render/src/character-viewer/{index.ts,scene.ts,types.ts,scene.test.ts}`（2/703/63/68 行）：loader、external/unlit 契约及测试。
- `apps/game/build/dressup-assets.ts`（218 行）：manifest/fits 解析、从 fit 提升 socket、复制 skeleton、生成分组索引。
- `apps/game/build/dressup-assets.test.ts`（670 行）：索引、真实 Meshopt 实穿、变体、状态过滤和发布回归。
- `apps/game/src/main.ts`（170 行）与 `packages/render/package.json`（28 行）：仅 DEV 路由和子路径导出。
- `pnpm install --frozen-lockfile`：通过，lockfile 已最新；`pnpm check`：通过。
- `pnpm check` 明细：184 个测试文件 / 1313 条测试；1777 文件 / 1708 对象 / 2 Ink / 65 地图有效；故事 4 测试、3 行/2 章编译通过。
- `pnpm --filter ./apps/game build`：通过；682 modules transformed，PWA 152 个预缓存条目。

## 3. 关键结论与数值
- 基线修正：viewer 高度边界改用 `Box3.setFromObject`；本轮导出配置 MeshoptDecoder 的 loader 并注入 actor，外部 actor 保持自带缩放。
- 索引为 `tianshu-dressup-index.v1`，含 kind/id/template/file/fit/report/status 与可选 slot/socket/skeleton/heightM；prop socket 可从 fit 提升；按 kind 分组。
- 当前索引：template=3、prop=3、head/garment/hair=0；small/medium/tall 为 1.58/1.66/1.72 m，draft/candidate 徽标可见。
- 页面：模板切换；idle/walk/run；同 slot 互斥穿脱；mainHand 由 fit 的 gripR 触发握拳；unlit/ACES 重建对比；`window.__dressup` 与三项 stats。
- 真实压缩 GLB 回归：medium + 剑/斗笠/玉佩同时加载并实穿，stats=`4/221846/1`；右手 Index1 四元数等于 fist 帧。
- 当前文件实测（顶点/三角/最大残差 mu/锚点范数 mu/validate 实耗时 s）：剑 `157844/8676/3.008e-8/1.49e-10/1.63`；斗笠 `160426/8568/1.509e-8/1.86e-10/0.94`；玉佩 `159289/8580/1.880e-9/3.60e-10/0.92`；均 approved 29/29。
- 与规范一致：`createDressupActor` 只经动态 import；viewer 只接 root；`NoToneMapping` 与 actor unlit 同步；未改 dressup 运行时或门禁。
- 偏离：无实现契约偏离。运行环境实为 Node v22.22.1 / pnpm 9.15.9（与当前仓库 engines/packageManager 一致），未达到任务文字所述 24/12。
- `pnpm size` 前→后（KiB gzip）：entry 38.45→38.45，render 166.66→166.66，render-dressup 3.59→3.59（预算 24）。

## 4. 开放问题（附默认值）
- ⚠️ 沙箱内 Playwright 启动已安装 Chrome 时 `TargetClosedError` / `SIGABRT`，终止又遇 `EPERM`；默认由协调者在桌面浏览器验收。
- 当前尚无衣物/发型索引项；默认显示空组提示，A4 manifest 合入并发布后自动出现，不在页面硬编码。
- 工具链版本口径冲突默认遵循仓库锁定版本；如全局升级 Node/pnpm，应由独立基础设施任务处理。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；A4 只需按既有 manifest 契约提供素材，无需改页面。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只改白名单；`git diff --check` 通过；未改 lockfile、dressup runtime、门禁或生成资产。
- ✅ 冻结安装、完整 check、game build 均以退出码 0 完成；构建中的既有 `ASSET_SOURCE_MISSING` 为非阻断提示。
- ✅ 索引排除 rejected、保留 candidate/draft 与 fits，复制 skeleton，并覆盖模板 heightM/skeleton 与道具 socket。
- ✅ viewer attach/detach/unlit 各有单测；真实 Meshopt loader、三件装备并穿、握拳与 stats 有回归。
- ✅ 默认换装 v2，动态 actor、外部挂载、unlit、动作、插槽互斥、握拳和 stats 均已接线；旧面板保留。
- ✅ 协调者步骤：启动 dev server，打开 `http://localhost:5173/character-3d`，确认默认 medium 与 unlit。
- ✅ 依次点 small/medium/tall 与 idle/walk/run，观察身高、动作和模型位置；切 ACES 再切回 unlit 对比。
- ✅ 在 medium 依次点剑/斗笠/玉佩，再次点击卸下；检查剑在右手且握拳、斗笠在头顶、玉佩在胸前及随动作运动。
- ✅ 查看 candidate/draft 徽标、空衣物/发型提示、stats 变化，并在控制台调用 `window.__dressup.stats()`。
- ⚠️ 自动浏览器截图未产出，原因见第 4 节；不影响代码门禁，但实穿视觉仍须上述人工验收。

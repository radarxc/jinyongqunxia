# ENG-23a-pwa-offline 报告 · 游戏工程 · PWA 与离线（与内容无关：SW、离线闭包清单、下载器、更新提示；审计 M8 / L2）

## 1. 摘要（3–6 行）

- 已把默认 `generateSW` 改为 `injectManifest`，壳、内容、清单和素材分层缓存，并修复同路径素材换图不更新。
- 已实现确定性离线闭包、校验后发布的差量下载器、配额恢复、完整性扫描及当前/上一版 GC。
- 已接通安全点更新、24 h 稍后提醒、网络探测，以及三组可访问 UI；宿主既有文件净改动 4 行。
- 已补齐安装图标并移除 sharp 0.33.5；全部指定检查通过，沙箱外破坏式 smoke 按要求未运行。

## 2. 产出（文件、行数、主要章节）

- `apps/game/build/`：新增闭包、复制素材摘要、SW 元数据插件及 4 项构建测试；接入现有内容构建。
- `apps/game/src/sw/`：5 文件、156 行；自定义 SW、校验型运行时缓存、纯路由函数及测试。
- `apps/game/src/pwa/`：6 文件、239 行；注册桥、更新/下载接线及注册回归测试。
- `packages/platform/src/offline/`：17 文件、1,208 行；闭包解析、CacheStorage 元数据、下载/重试、发布、扫描、GC 与内存测试。
- `packages/platform/src/pwa/`：7 文件、307 行；状态机、控制器、网络探测及测试；以两个 package 子路径导出。
- `packages/ui/src/components/Tx{UpdatePrompt,OfflineBadge,DownloadPanel}*`：4 文件、129 行；文案加入 `i18n.ts`。
- `apps/game/scripts/`：54 行构建后门禁、163 行 Playwright smoke；任务新增实现与测试共约 2,487 行（锁文件除外）。
- PWA 配置/manifest/图标/依赖锁已更新；`App.vue` 净增 2 行，`pwa.ts` 1 行替换，`main.ts` 未改。

## 3. 关键结论与数值

- 壳预缓存实测 120 项、约 2,634 KiB；只含 js/css/html/wasm/woff2/svg/webmanifest，含 M1 所需 `index.html`。
- ch00 当前闭包 207 文件、总计 57,075,184 B；`enter` 为 57,071,172 B（54.43 MiB），低于 `60 × 1024²` B。
- 单文件硬门为 `8 × 1024²` B；ch00 未完工阶段超 `enter` 门只告警，其余章节超门构建失败。
- 下载超时 20 s；网络错误/408/429/5xx 的五次重试等待为 1/2/4/8/16 s，各加 0–250 ms 抖动。
- 用户下载配额预留 `missingBytes × 1.2`，预取为 `×2`；进度只计 SHA-256/字节数均通过的文件，ETA 用 10 s EMA。
- 新异步块实测：client 1.22 KiB gzip、controls 2.93 KiB、downloads 8.07 KiB、workbox-window 2.25 KiB；同步入口未引入 Workbox。
- SW 为 24.61 KiB gzip；占位图标五份合计约 8.4 KiB。Workbox 固定 7.4.1，assets-generator 1.0.4，sharp 0.35.5。

## 4. 开放问题（附默认值）

- 正式 PWA 图标需作者认可；默认继续使用水墨“书”字占位 SVG 的生成图，不冒充正式美术。
- ch00 闭包成员及装机即下策略归 ENG-23b；默认本阶段只提供手动下载，闭包暂收构建可见的通用素材/VFX。
- 部署平台需兑现 `_headers` 的 no-cache 规则；默认将 `/`、`index.html`、`sw.js`、`version.json`、清单映射为同等响应头。
- `pnpm audit --audit-level=high` 仍报既有 ESLint→micromatch→braces 链 1 high、1 moderate；默认由工具链维护任务处理，不越写集升级。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- PWA-01 / 在接入 tech/08 登录与托管后端时，明确撤下 HTML 预缓存并补离线启动替代页 / 解决 M1 飞行模式与登录跳转规则的阶段性冲突。
- PWA-02 / 将闭包 format=1、原子 active-set 指针及“双版本保留”写入 tech/04、06 / 固化 ENG-23b 与后续 CDN 的互操作边界。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/01-architecture.md` §7.2 / 源文件改为 `apps/game/src/sw/sw.ts`，记录双更新消息兼容和壳过滤。
- `docs/tech/04-data-pipeline.md` §8 / 登记闭包 format=1、`version.json`、临时缓存到 active-set 的单点发布协议。
- `docs/tech/06-asset-storage.md` §8 / 登记实际缓存名、hash 查询键、同路径旧素材淘汰及部署 `_headers` 要求。
- `docs/tech/08-backend-and-online.md` §11.4 / 后端登录闸门上线时按 PWA-01 回收 `index.html` 预缓存。
- `TODO.md` / 后续任务记录既有 ESLint/braces 审计项；本任务按写集约束未修改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ **SW 路由与缓存名**：壳→Workbox precache；清单→`ts-manifests-v1`（NetworkFirst 3 s）；内容叶片→`ts-content-<releaseHash>`；`assets/default`/`content/vfx`→`ts-assets-v1`；元数据/暂存→`ts-offline-meta`/`ts-offline-stage-<releaseHash>`。安装不 `skipWaiting`，消息同时接受 `SKIP_WAITING`、`ACTIVATE_UPDATE`。
- ✅ **闭包格式与样例**：`{format:1, chapter, releaseHash, files:[{url,bytes,sha256,kind}], totals:{files,bytes,enterBytes,byKind}}`；例：ch00 首项 `/assets/default/...png`、342091 B、64 位 SHA-256、kind=`asset`。构建确定性、内容清单交叉校验、重复 URL/8 MiB/60 MiB 门均有测试。
- ✅ **下载状态与重试**：checking→persisting→downloading→committing→complete；以意图+已验证文件续传，不缓存 206；404/hash 不符只刷新根清单一次。配额不足先 GC，写入超额再淘汰并重试一次；只操作 Cache Storage，不触碰 IndexedDB。
- ✅ **更新流程**：idle→offlineReady→needRefresh→deltaSync→ready→activating；先补齐已安装/预取包再原子发布，只在本地事务完成且非战斗/对话提交时激活；24 h 提醒持久化，强制更新保留素材缓存。
- ✅ **冲突裁定**：M1 继续预缓存 HTML；两种激活消息均接收；元数据用独立 Cache；下载/预取分别 ×1.2/×2；`version.json` 探测；同路径变图在新闭包发布后淘汰旧 hash。
- ✅ **安装与审计**：manifest 有 192/512/maskable 图标和 `display_override`，HTML 有 apple touch icon；采用 assets-generator 路线并将 sharp 0.33.5 升至 0.35.5。
- ✅ **测试**：冻结安装、`pnpm check`（151 files/1041 tests）、内容构建、platform 17 files/88 tests、game 32 files/115 tests、game build、离线检查（15 closures/120 shell entries）、strict ID 检查全部通过；`git diff --check` 通过。
- ⚠️ **沙箱外烟测**：按任务要求未在本任务运行。协调者先安装 Playwright Chromium，再从仓库根执行 `python3 apps/game/scripts/offline_smoke.py`；脚本会构建、启动 preview、等 SW 接管、下载 ch01、断网逐项取 200、改图重建、验证更新提示/激活，并在 finally 恢复源图和构建。
- ⚠️ **交给 ENG-23b**：确定序章闭包真实成员并配置装机即下；接白马冷入口 ≥2× 预取；在书眠事务提交前调用完整性扫描，缺文件则阻止提交并给恢复入口；不得把预取包误标为 pinned。
- ✅ **参考资料（访问 2026-10-03）**：[Vite PWA injectManifest](https://vite-pwa-org.netlify.app/guide/inject-manifest)、[Workbox modules](https://developer.chrome.com/docs/workbox/modules)、[MDN Cache.put](https://developer.mozilla.org/en-US/docs/Web/API/Cache/put)、[MDN 206](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/206)、[MDN StorageManager](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager)、[WHATWG Storage persistence](https://storage.spec.whatwg.org/#persistence)。

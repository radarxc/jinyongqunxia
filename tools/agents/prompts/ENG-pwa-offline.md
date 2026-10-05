# 本任务：游戏工程 · PWA 与离线（与内容无关的部分：Service Worker、离线闭包清单、下载器、更新提示）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/platform/README.md`、`packages/platform/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-18-content-build.md`：书界包清单、`contentHash`、`dist/content/**`；
- 报告 `ENG-15-core-bus.md`、`ENG-13-save-formal.md`；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.3 M8、§3.4 L2。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 离线行：应用壳 + 序章闭包。§3.5 离线 / 存档闸门：飞行模式从新游戏通关 M1。

本任务做与内容无关的部分：Service Worker、离线闭包清单的产出端、下载器、更新提示。序章闭包的实际成员与装机即下，等 ch00 内容就绪后由 ENG-23b 做。

现状（集成分支实测；开工先自己核对一遍）：
- `apps/game/vite.config.ts` 用默认 `generateSW`，`registerType:'prompt'`，但 `apps/game/src/pwa.ts` 没注册 `onNeedRefresh` / `onOfflineReady`，新版本永远不提示。
- 预缓存把 `assets/default/**` 的图交给 vite-plugin-pwa 默认的 `dontCacheBustURLsMatching=/^assets\//`。同路径换图后永远不刷新，属真缺陷。
- 立绘、物品图标、特效、书界内容都没有运行时缓存，离线即缺；`/rig-demo` 开发页也被预缓存了。
- manifest 没有 icons 与 `display_override`，`index.html` 没有 apple-touch-icon，无法作为 PWA 安装。
- `@vite-pwa/assets-generator` 没用上，却引入有漏洞的 sharp 0.33.5（审计 L2）。
- 没有 Cache Storage、带重试的 fetch、网络状态、`estimate()` 相关代码。

## 规格（照这些写，不自创）

- `docs/tech/01-architecture.md`：§1.1、§4.3（platform 的 `net` / `pwa` 模块）、§6.1、§6.4（L0–L3 资源层级）、§7.2（`injectManifest` 与 `src/sw.ts`）、§10 的 R1 / R11 / R14。
- `docs/tech/03-mobile-performance.md`：
  - §0 D16、§1.5、§2.7（壳的预算）、§2.8（`enter` ≤ 60 MB，单文件 ≤ 8 MB）、§3.5、§3.8、§5.3；
  - §9.1 状态与文案；
  - §9.2 重试与进度：20 s 超时，网络错误 / 408 / 429 / 5xx 按 1、2、4、8、16 s 加 0–250 ms 抖动最多 5 次；404 或 hash 不符只刷新根清单一次；
  - §9.3 断点续传：意图加已完成文件集，不缓存 206；§9.5 无 SW 时只在线运行。
- `docs/tech/04-data-pipeline.md` §1.4、§8.1–§8.3、§8.5：按 logicalName + leafHash 增量；先写临时缓存，全部校验后原子切换；保留当前与上一版。
- `docs/tech/06-asset-storage.md`：
  - §8.1：`/sw.js` 与 `/` 设 no-cache；
  - §8.2：缓存名、校验 hash 的 CacheFirst、更新时先补齐已下载包的差量、强制更新保留素材缓存；
  - §8.3 下载器；§8.5 降级环境；§9.1 四个 hash 检查点；§11.2 缺图用占位。
- `docs/tech/08-backend-and-online.md` §11.4 更新流程：
  - 有等待中的 worker 时提示「新版本已就绪」；
  - 只在本地事务完成、不在战斗或对话提交中时激活；
  - 安装时不 `skipWaiting`；24 h 后再提醒，不强制。
  - §15.4 降级矩阵。

## 文档冲突的裁定（照此做，报告登记）

- **index.html 预缓存**：tech/06 / tech/01 因登录跳转不让预缓存 HTML。M1 没有托管后端，飞行模式需要它，所以照常预缓存，报告注明以后接 tech/08 闸门时要回头改。
- **更新消息名**：`SKIP_WAITING`（tech/06 §8.2，`registerSW` / workbox-window 用这个）与 `ACTIVATE_UPDATE`（tech/08 §11.4）两个都接受。
- **IndexedDB**：不升 Dexie 版本（`storage/**` 归 ENG-15）。字节放 Cache Storage，登记用 `ContentCache`（kind `asset-manifest`）或单独的 `ts-offline-meta` 缓存。
- **配额倍数**：用户显式下载按 ×1.2，预取按 ≥ 2×，各用在自己的场景。
- **托管设施**：M1 没有 `/c/ping.json`、`a/<hash12>` 命名和 AssetRegistry。构建时产出 `version.json`（no-cache）用于探测连通；闭包清单里每个文件带 sha256；更新时淘汰同路径已变的图。

## 要做的事

1. **Service Worker**：
   - 改 `injectManifest`，源文件放 `apps/game/src/sw/sw.ts`（`apps/game/src/*.ts` 归 ENG-15，要用子目录）；
   - 预缓存只放壳：js、css、html、wasm、woff2、svg、webmanifest。排除 `book-*`、`rig-demo`、`vfx-*`、`assets/default/**`、`content/**`；
   - `dontCacheBustURLsMatching` 只匹配 Vite 带 hash 的文件名；
   - 运行时路由：
     - 内容叶片：CacheFirst，进 `ts-content-<releaseHash>`，按清单 sha256 校验；
     - 清单：NetworkFirst，3 s 超时；
     - `/assets/default/**` 与 `/content/vfx/**`：CacheFirst，进 `ts-assets-v1`；
   - 安装时不 `skipWaiting`。
2. **构建步骤** `apps/game/build/offline-closure.ts`：
   - 产出 `dist/offline/closure.<chapter>.json`：`{releaseHash, files[{url, bytes, sha256, kind}], totals}`，从 ENG-18 的清单与素材 / 特效复制清单生成；复制清单要开始记录 sha256 与字节数；
   - 再产出 `version.json`；
   - 门禁：单文件 ≤ 8 MB；`enter` ≤ 60 MB 在 ch00 内容就绪前只告警；输出确定。
3. **下载器** `packages/platform/src/offline/`：
   - 差量、`estimate()`、`persist()`；
   - 超时与重试照 tech/03 §9.2；
   - 校验 SHA-256 与字节数后才 `cache.put`；
   - 进度只计已校验字节，ETA 用 10 s EMA；`AbortSignal` 暂停；
   - 完整性扫描返回完整 / 缺多少；GC 保留当前与上一版；
   - `QuotaExceeded` 时先淘汰可淘汰的包、重试一次，再问用户；**绝不碰 IndexedDB 存档**。
4. **更新状态机** `packages/platform/src/pwa/`：
   - idle → offlineReady → needRefresh → deltaSync → ready → activating；
   - 安全点闸门与 24 h 提醒；强制更新；
   - 网络状态取 online / offline 事件加 `version.json` 探测。
5. **界面**：`packages/ui/src/components/` 新增 `TxUpdatePrompt`、`TxOfflineBadge`、`TxDownloadPanel`（大小、上次校验时间、下载 / 删除 / 强制更新、iOS 添加到主屏提示），文案进 `packages/ui/src/i18n.ts`。
6. **接线**：ENG-15 拥有的文件合计改动 ≤ 10 行：`apps/game/src/pwa.ts`、`main.ts`、`App.vue`（徽标和提示放页脚 `<output role="status">` 旁）。
7. **图标**（审计 M8、L2）：
   - 用 `@vite-pwa/assets-generator` 从占位 SVG 生成 192 / 512 图标、apple-touch-icon、`display_override`，同时把 sharp 升到无已知高危漏洞的版本；
   - 或者删掉这个依赖、手工提供占位 PNG。二选一，报告说明；正式图标要作者认可。
8. **测试**（Vitest，内存版 CacheStorage 加 fetch mock）：
   - 下载器：续传差量、配额拒绝、调用 `persist()`、重试时间表（假定时器）、404 与 hash 不符不重试、字节不符不入缓存、进度不倒退、中止、完整性扫描报缺、GC 保留两版；
   - 状态机：不安全时不激活、24 h 提醒；
   - SW 路由写成纯函数测试；
   - 从临时 `dist` 生成闭包：确定、带 sha256、超预算报错；
   - 三个界面组件（happy-dom：渲染、事件、aria-live）。
   - 另写构建后检查 `node apps/game/scripts/check-offline.mjs`：预缓存只有壳、hash 对得上、预算成立。
9. 写一份 `apps/game/scripts/offline_smoke.py` 供协调者在沙箱外跑，本任务**不跑**：
   - 起 `vite preview`，等 SW 接管页面；
   - 下载 ch01 闭包；
   - 停服务器后重载，内容与图片仍返回 200；
   - 改一张图重建，出现更新提示并能激活。

约束：
- 写集：
  - 应用：`apps/game/vite.config.ts`、`apps/game/build/**`、`apps/game/src/sw/**`、`apps/game/src/pwa/**`、`apps/game/src/pwa.ts`、`apps/game/src/main.ts`、`apps/game/src/App.vue`（这三个合计 ≤ 10 行）、`apps/game/scripts/**`、`apps/game/index.html`、`apps/game/package.json`、`apps/game/tsconfig*.json`；
  - 依赖：`pnpm-workspace.yaml`（catalog 里固定 `workbox-*` 为 7.4.1）、`pnpm-lock.yaml`；
  - 平台：`packages/platform/src/offline/**`、`packages/platform/src/pwa/**`、`packages/platform/package.json`（子路径导出，Dexie 不进入口）；
  - 界面：`packages/ui/src/components/TxUpdatePrompt.vue`、`TxOfflineBadge.vue`、`TxDownloadPanel.vue` 及其测试、`packages/ui/src/i18n.ts`。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`、`packages/data/**`（只用类型）、`packages/platform/src/storage/**`、`packages/ui/src/projections.ts`、`ui-bus.ts`。
- 新依赖只允许 workbox 直接依赖（版本与现有传递依赖相同），在报告说明体积；入口不增重。
- 每次写入 ≤ 150 行。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`（锁文件有变化时先 `pnpm install`）
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/platform test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `node apps/game/scripts/check-offline.mjs`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- SW 路由与缓存名表；
- 闭包清单格式与样例；
- 下载器状态机、重试表；
- 更新流程；
- 冲突裁定；
- 包体影响；
- 沙箱外冒烟怎么跑；
- 交给 ENG-23b 的接口：序章闭包成员、装机即下、白马冷入口预取、书眠提交前的完整性检查。

报告 ≤ 100 行。

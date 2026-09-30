# 本任务：存储 / 后端探针——同一 Worker 私有托管（会话闸门）、TSAV v1 + CAS 夹具、KTX2 / WebP 加载、PWA 离线重开

`tech/09` P0 "存储 / 后端探针"：不做生产云同步、Passkey、AI NPC；只证明 `tech/08` 的私有托管与存档契约、`tech/06` 的素材加载和离线闭包在本地（`wrangler dev` / miniflare）可跑，并给作者一条可部署到 Cloudflare preview 的命令。部署本身由作者执行（账号），你不部署。

## 必读

- `docs/tech/08-backend-and-online.md` §2（架构、路由总表、数据流、部署拓扑）、§3（`SaveHeader`、TSAV v1 布局、压缩 / 哈希、schema 迁移链、`idRemaps`）、§4.1–§4.4（同步不变量、槽位键、上传先保 blob 再 CAS、变化游标）、§5.3–§5.4（MVP 主密钥 + 8 位配对码 + `ts_s` 会话 Cookie）、§5.9（与 tech/06 共用的会话闸门）、§6（API 约定与错误码）、§7（D1 迁移、CAS SQL、R2 键）。
- `docs/tech/06-asset-storage.md` §3（清单）、§5（构建）、§7（HTTP 缓存头、Service Worker 策略、Cache Storage 配额）、§8（完整性）；`docs/tech/03-mobile-performance.md` §3（iOS 存储配额与持久化请求）、§9（离线范围）。
- `docs/tech/01-architecture.md` §4.3（`@tianshu/api` Hono + wrangler、`@tianshu/platform` 表）、§7.6（部署硬约束：`run_worker_first`、`workers_dev=false`、`preview_urls=false`）。
- `packages/data` 的 `ChapterPackManifest`（T2）；`tools/aigc` 的 manifest 输出格式（T4a）。

## 至少实现（`services/api`、`packages/platform`、`apps/game`）

1. `services/api`（Hono + wrangler）：`wrangler.jsonc`（Static Assets `run_worker_first`、D1 / R2 绑定、`workers_dev=false`、`preview_urls=false`；密钥只从 `wrangler secret`）；路由：`/auth/pair`（配对码换会话）、`/auth/logout`、`/health`、`GET/PUT /v1/saves/:slot`（先保 blob 再 CAS，游标）、`/a/*` 素材代理（会话闸门 + 缓存头）；D1 初始迁移 SQL（tech/08 §7.2）；错误格式与错误码；限流骨架。测试用 `@cloudflare/vitest-pool-workers`（或 miniflare）跑：无会话 → 401 / 跳转；CAS 冲突 → 409；损坏 blob → 保留原件；并发上传 fixture。
2. `packages/platform`：`storage`（Dexie：`saves / settings / packs` 三表；三代本地档；持久化存储请求；配额检查）、`save`（TSAV v1 编码 / 解码、fflate 压缩、校验和、迁移函数链、损坏回退）、`net`（带重试 fetch、Range 请求、多源回退）、`pwa`（Workbox：应用壳预缓存 + manifest 驱动的运行时缓存 + 入缓存前哈希校验）、`lifecycle`（可见性、`pagehide`）；测试用 `fake-indexeddb`。
3. `apps/game` 最小外壳：标题页 → 新档 → 写 3 次自动档 → 导出 / 导入 JSON 与 TSAV → 读取 T2 的 `ch00` 包与 T4a 的占位 manifest → 加载一张 KTX2（Basis 转码器延迟加载）与一张 WebP 显示 → PWA 安装清单；离线重开：Playwright 脚本先在线打开，再 `context.setOffline(true)` 重新加载仍可进入标题并读档。
4. `docs/evidence/p0/README.md`（唯一允许写入 docs 的文件）：作者部署步骤（`wrangler login`、创建 D1 / R2、`wrangler deploy --env preview`、绑定自定义域名、生成主密钥与配对码）、需要作者记录的证据字段（常用网络访问 preview 的结果、两设备配对、离线重开）。

## 验收标准（亲自运行）

- `pnpm --filter @tianshu/api test`、`pnpm --filter @tianshu/platform test`、`pnpm --filter @tianshu/game build`、`pnpm --filter @tianshu/game e2e:offline`（Playwright）通过；`pnpm check` 通过。
- TSAV 夹具：损坏、超限、迁移失败均保留原件（测试证明）；CAS 并发 fixture 通过。
- `size-limit`：`entry ≤ 170 KB gzip`（`apps/game`），报告写实际数字。
- 不提交任何密钥；`wrangler.jsonc` 中账号 ID 留占位并在 README 说明。

# 本任务：技术文档同步 · 应用框架改为 Next.js + React（AR-21）

本任务改技术文档，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-21**（逐字原话）：「补充一下，整个app用nextjs来做（或者你有别的推荐？）」。协调者执行口径（同一节）：Next.js（App Router）+ React 19 做整个 app 的壳与页面；游戏本体是纯客户端路由（`next/dynamic` + `ssr: false` 加载 Three.js 场景与确定性核心）；`packages/{shared,data,core,platform,render}` 与框架无关；UI 由 Vue 3.5 改为 React；Vite 不再做应用构建，Vitest 仍做测试。工程脚手架 ENG-00-scaffold 已按此口径执行（`tools/agents/prompts/ENG-scaffold.md` "技术基线"一节是实施口径，文档要与之一致）。

## 要改的文档（在原文上改，保留调研与否决项，不推倒重来）

- `docs/tech/01-architecture.md`：§1 决策 1（基线）改为 Three.js r186 + **React 19 + Next.js（App Router）** + 纯 TS 核心 + pnpm workspace；§2 库表与结论（"为什么是 Three.js + Vue 3"→ React / Next 的理由：中文 DOM 排版、AI 语料、"库优于框架"对 three 仍成立；Next 只做应用壳，不接管游戏主循环）；§3 架构图（`packages/ui` 改 React、`apps/game` 改 `apps/web`（Next 应用））；§4 包表（`@tianshu/ui`：React 组件与 `useSyncExternalStore` 投影；`apps/web`：Next.js；依赖表换成 react / react-dom / next / @testing-library/react / happy-dom）；§5 UI 投影（Pinia `shallowRef` → React 外部 store 投影）；Worker 写法（`new Worker(new URL(...))` 在 Next / Turbopack 下的写法）；§6 工具链表（构建 Next + Turbopack；Vite 行删除，Vitest 保留；ESLint 加 `eslint-config-next`；去掉 `vue-tsc` / `eslint-plugin-vue`）；§7 chunk 预算：`entry` 预算按 React 19 + Next 运行时重算（给出新数字与依据），标明服务端渲染只用于非游戏页；PWA 改用 Next 生态方案（如 serwist）并标"待实测"。
- `docs/tech/02-rendering.md`：three 场景只在客户端组件内创建；SSR 边界一句话；其余不动。
- `docs/tech/03-mobile-performance.md`：首屏 / 包体预算按 React + Next 重算（入口 JS、路由分包、`/play` 懒加载），其余指标不动；标出哪些数字是估算待实测。
- `docs/tech/06-asset-storage.md`：静态素材放 `apps/web/public/` 或 CDN 的路径约定、Next 静态导出 / 服务端两种部署下的素材 URL；Service Worker 方案对应调整。
- `docs/tech/08-backend-and-online.md`：部署形态二选一写明（推荐：Next 应用部署到 Vercel 或自托管 Node，`services/api` 仍按原计划 Cloudflare Workers；备选：OpenNext 到 Cloudflare 统一部署），云存档 API 走 `services/api` 还是 Next route handlers 给结论与理由。
- `docs/tech/04` / `05`：只改提到 Vue / Vite / `apps/game` 的句子。

每处改动在文档版本记录里加一行"2026-10-01 AR-21：…"。否决 Vue 的理由写明"作者决定 + Next 只支持 React"，不贬低原方案。

约束：每次写入 ≤ 150 行；不改设计文档；不改提示词与代码。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `! grep -rn "Vue\|Vite\|apps/game\|Pinia\|vue-tsc" docs/tech/ | grep -v "否决\|原方案\|曾\|2026-09\|备选\|参照" | grep -q .`（残留的 Vue / Vite 引用只允许出现在否决 / 历史 / 备选语境里；用 `grep -rn "Vue\|Vite" docs/tech/` 自查）

## 报告

第 7 节写：各文档改动清单（节号）；新的 chunk 预算表；部署形态结论；与 ENG-00 实施口径的差异（若有）；需作者确认（附默认）。报告 ≤ 100 行。

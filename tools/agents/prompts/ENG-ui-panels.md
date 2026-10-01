# 本任务：游戏工程 · 交互页面（控制面板、人物卡片收集、物品栏、存档）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`apps/web/CLAUDE.md`、`packages/core/CLAUDE.md`、`packages/platform/README.md`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 交互层 3：RPG 游戏最佳实践、高性能 web 游戏引擎（2.5D 贴图）；3.1 交互页面：控制面板（参考目前主流 RPG 设计）、人物卡片收集、物品栏。

## 设计依据

AR-21：整个 app 用 Next.js（App Router）+ React 19；`docs/tech/01-architecture.md`（React 做 UI、three 做场景、core 只通过命令 / 事件；文档里残留的 Vue 字样以根 `CLAUDE.md` 与 `packages/ui/CLAUDE.md` 为准）、`docs/tech/05-gameplay-engine.md` §2（`api`：命令 / 查询 / 事件订阅）、`docs/design/03`（面板属性）、`docs/design/10`（物品栏 / 装备栏）、`docs/design/15` / `21`（经脉图）、`docs/design/13`（人物卡片 / 收集若有）、`assets/default/`（人物立绘 `portrait` 基线、物品图、UI 素材若有；没有的用占位）。ENG-01 存档 API、ENG-02 状态、ENG-06 物品接口。

## 要做的事

1. `apps/web` 骨架：核心桥接（core 实例在 Web Worker 或主线程，二选一写明；命令入口、事件订阅、只读视图 selector；状态变化 → `useSyncExternalStore` 只读投影，不把 core 对象塞进 React 状态）；Next 路由：`/play` 之下的场景切换占位（大地图、城镇、战斗由后续任务填），全部 `'use client'` 且不在服务端执行；通用组件放 `packages/ui`，页面与布局放 `apps/web`。
2. 控制面板（主流 RPG 布局）：顶部 / 底部状态条（生命 / 内力 / 行动槽、当前时间（年月日时辰）、地点、金钱）、快捷栏、主菜单（人物、物品、武功、任务、存档、设置）；键鼠 + 触屏可用；主题色与字体按 `docs/design/` 的 UI 规范（若无则简洁水墨风，不用具体影视游戏素材）。
3. 人物卡片收集：已遇见 / 已结交 NPC 的卡片墙（立绘位、姓名、门派、关系值、简介），卡片详情（面板属性、武功层数、经脉图：按经脉 / 穴位开通与强度渲染）；未遇见为剪影。
4. 物品栏：分类页签（十一类 + 任务物品）、数量、拖放 / 点选装备、使用消耗品、物品详情（品阶、年限、效果、出处）、装备栏（design/10 §3 全部槽位）。
5. 存档界面：槽位列表（缩略信息）、保存 / 读取 / 删除 / 导入导出，走 ENG-01 API；自动存档提示。
6. 测试：Vitest + React Testing Library 组件测试（面板投影、物品栏操作发出正确命令、存档槽位流程用 fake-indexeddb）；`pnpm check` 全绿；`pnpm --filter ./apps/web build` 成功。
7. 更新 `apps/web/CLAUDE.md`：目录、桥接约定、组件清单，交 ENG-08 / 09 / 10。

约束：不写地图 / 战斗场景；不改 core；每次写入 ≤ 150 行；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告；不引入根 `CLAUDE.md` 未列出的 UI 框架。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/web build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：页面 / 组件清单；桥接约定；测试摘要；截图说明（若能截）；交下游接口。报告 ≤ 100 行。

# 本任务：游戏工程 · 内容不再从设计文档正则抽取，剧情 DSL 构建期编译检查（代码审计 M6）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`、`content/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-18-content-build.md`：构建阶段、字段分类、产出接口；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.3 M6。

## 为什么做

审计 M6 指出两处违反根 `CLAUDE.md`「数据驱动、schema 即文档」：
1. 构建期从设计文档里用正则抽数据：经脉拓扑抽自 `docs/design/15-meridians-and-acupoints.md`，门派名抽自 `docs/design/17-sects-compendium.md`（`apps/game/build/content-plugin.ts`，以 ENG-18 合入后的位置为准）。改一次文档排版就可能把构建打挂。
2. 剧情的条件和动作在 `data/src/schemas/story.ts` 里是自由形式的 record，只有运行时的 `core/src/quest/compile.ts` 才编译。剧情写错要等玩家走到那里才暴露。

## 要做的事

1. **经脉拓扑与门派表落成内容数据**：
   - 放 `content/common/meridians/`、`content/common/sects/`（目录已存在），配 Zod schema 与校验；
   - 用脚本从现有文档**一次性**生成初稿并入库，之后以 YAML 为准，构建不再读 `docs/`；
   - 生成结果必须与现在正则抽到的逐项相同，写测试对比。
2. **`pnpm content:compile-story`**：
   - 用 core 的编译器预编译全部剧情线。工具脚本可以依赖 core，放 `tools/content/`；
   - 任何条件或动作编译失败就以非零退出，诊断带文件、行、列；
   - 并入 `pnpm check`。
3. **测试**：
   - 新 schema 的正反例；
   - 抽取等价；
   - 故意写错的剧情夹具编译失败、诊断正确。

约束：
- 写集：`content/common/meridians/**`、`content/common/sects/**`、`packages/data/src/schemas/**`、`packages/data/src/content-index.ts`、`packages/data/src/content-registry.ts`、`packages/data/scripts/**`、`apps/game/build/content-plugin.ts`、`tools/content/compile_story.*`、`tools/content/test_compile_story.*`、`package.json`（只加脚本、改 `check`）、`packages/data/CLAUDE.md`、`content/CLAUDE.md`。写集外的改动在提交时会被丢弃。
- 不改 `docs/**`、`packages/core/**`。data 不得依赖 core：编译检查放 `tools/`。
- 每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:compile-story`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 新数据文件与 schema；
- 抽取等价证据；
- 编译检查的诊断格式；
- `pnpm check` 变化；
- 交给 CONTENT-ch00 / ch10：写剧情时怎么自检。

报告 ≤ 60 行。

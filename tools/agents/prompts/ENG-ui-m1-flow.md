# 本任务：游戏工程 · UI 主流程 B：M1 路径界面（创角、开场、序章模式、对话框、任务、初眠配点、白马题卡）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/ui/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-19a-ui-shell.md`（标题页、纯展示组件的 props 与事件）、`ENG-17a-newrun-dialogue.md`（新游戏参数、对话 / 剧情命令、`DialogueView`）、`ENG-17-booksleep-m1.md`（配点查询与书眠命令）、`ENG-18-content-build.md`（文本 key 怎么解析成文字）。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.1 M1：新游戏 → 可跳过开场 → 序章探索 / 对话 / 战斗 → 序章结束 → 存档 / 导出 → 书眠进入白马（唐）冷入口。core 侧由 ENG-15 / 17a / 17 完成，本任务把界面接上，让玩家能从标题走到白马题卡。

## 规格（照这些写，不自创；作者决定 AR-26 / 27 / 29 优先于 design/14 的旧写法）

- 作废的旧写法：design/14 §5.1、§5.2 与 U14-T03 / S14 仍写天龙、3 层残篇、六张卡，以下面的为准。
- `docs/design/01-vision-and-core-loop.md`：§4.1、§4.3 身份与现代身份；§8.2 / §8.4–§8.5 序章三条路，跳过时播一段不可跳过的阿青 / 雪崩画面再进同一个配点。
- `docs/design/chapters/00-yuenv.md`：
  - §1.2 30 分钟路径；
  - §6.1：任务追踪、对话与历史、配点、对话与初眠事务中不许手动存档、导出导回；
  - §6.3：12 组冒烟、三档难度、150% 文字、读屏、配点不用长按；
  - §7.3 模式回执；§7.4 配点来源 manual / 一键均衡 / 跳过默认。
- `docs/design/story/00-yuenv.md`：
  - §2.1 `dc_00_01` 三个选项与时长、确认文案；
  - §2.2 开场画面第一帧后可跳过，但身份、无障碍设置与模式选择不随之跳过；
  - §2.3 摘要卡片可前后翻，不用长按。卡数从内容取，不写死。
- `docs/design/chapters/10-baima.md` §2.1 西行过场与题卡「长安二年（702）·西州以北」（年份从数据取）；§2.2 M1 停点：自动存档可读之后显示「第一卷·白马啸西风」题卡。
- `docs/design/14-ui-ux-mobile.md`：
  - §4.7 任务日志；
  - §4.9 对话框：点一下显示整页，再点翻页；不用长按；有历史；支持读屏；选项整行，不可选的写明原因；
  - R-UI-13 显示遮罩加一个语义文本节点，减少动态时直接全文；
  - §8.1–§8.2 面板与命令对应。

## 要做的事

1. **创角页**：姓名、性别、外观预设、称谓、现代身份、难度；无障碍设置在这一页也能调。天赋三选一 M1 不做。
2. **开场与过场**：静态画面加字幕，第一帧后可跳过。
3. **`dc_00_01` 模式页**：三种模式及时长；摘要卡片页可前后翻。
4. **对话框**：接 Ink 对话，含历史、逐字显示与翻页、选项、不可选原因；读屏可读。
5. **任务**：任务日志与 HUD 追踪显示真名，不显示原始 ID。顺带把 `TownPage.vue` 提示里原样露出的 `npcId` / `businessRef` 换成名称。
6. **初眠配点**：
   - 六个步进器、重置、一键均衡；福缘 / 魅力显示为锁定；上下限与预算全从 core 查询取；
   - 单独的确认页，不用长按；配点来源随命令发给 core。
7. **C04 导出提示**；白马题卡；对话、任务、配点、文字都带 `data-testid`，供 ENG-24 冒烟用。
8. **测试**：
   - 组件：显示后翻页；选择发出 `dialogue/choose`；不可选原因可见；不出现原始 ID；步进器遵守给定上下限；均衡与重置；不用长按的确认；
   - 应用流程（fake-indexeddb）：
     - 新游戏 → 跳过 → 默认配点 → ch10 题卡；
     - 被拒的选择不改对话视图；
     - 对话与初眠中不能存档。

约束：
- 写集：
  - 界面：`packages/ui/src/components/**`（只新增流程组件，不改战斗与已有面板的行为）、`packages/ui/src/projections.ts`（只改类型）、`packages/ui/src/i18n-flow.ts`、`packages/ui/src/index.ts`；
  - 应用：`apps/game/src/pages/**`、`apps/game/src/App.vue`、`apps/game/src/game-controller.ts`、`apps/game/src/flow/**`（新）、`apps/game/CLAUDE.md`。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`、`packages/data/**`、`apps/game/build/**`、`apps/game/src/battle/**`、`packages/render/**`、`packages/ui/src/i18n.ts`。需要 core 补查询或命令的，在报告写明，不要改。
- 新页面一律异步组件，入口不增重。每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若只因机器负载挂在 rig 门禁，在报告写明负载与数值即可。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

浏览器里的完整走查记「待实测」：沙箱拦 Chromium，由协调者在沙箱外跑，或交 ENG-24。

## 报告

第 7 节写：
- 页面流转图（文字）；
- 各页命令与查询对照；
- `data-testid` 清单；
- 测试；
- 待 core / 内容补的项；
- 交给 CONTENT-ch00 / ch10（文本 key 与题卡数据）、ENG-24（冒烟脚本可依赖的选择器）的接口。

报告 ≤ 90 行。

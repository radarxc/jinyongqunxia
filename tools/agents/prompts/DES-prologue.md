# 本任务：设计补充 · 序章 `ch00_yuenv`《越女剑》章节与剧情设计（M1 序章能力检查点）

本任务改策划文档，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 为什么做

`docs/tech/09-roadmap.md` §3.1 的 M1 要求用一个小型序章跑通全部基础能力：新游戏 → 可跳过开场 → 探索 / 对话 / 战斗 → 序章结束 → 本地存档 / 导出 → 书眠进入天龙冷入口。

现状：
- 仓库里没有 `docs/design/chapters/00-*` 和 `docs/design/story/00-*`；
- 序章的场景、人物、任务、遭遇、物品都还没有 ID；
- `docs/design/catalog/skills-general.md` 写明 `q_00_*` 由 chapters/00 分配。

本任务把序章设计成工程可以直接照着实现的规格。

## 必读输入（事实优先级：作者决定 > `docs/00-canon.md` > `docs/decisions/rulings-v1.md` > 归属文档）

- `docs/00-canon.md`：
  - 序章的定位（约第 245 行起：可跳过、春秋·越国、教学关、不属于十四天书）；
  - `sk_yuenvjian` 教学版固定地上 9、离开序章化残篇、不可直接携入天龙（约第 728 行）；
  - V11-29、V12-10 两条裁定；
  - §12 的 ID 前缀规范。
- `docs/design/01-vision-and-core-loop.md`：序章在核心循环中的位置。
- `docs/design/02-timeline-and-world-tiers.md` §9.1 P5（越女剑法定级与残篇）。
- `docs/design/05-martial-arts-system.md`、`docs/design/09-combat-system.md`：教学战斗要覆盖的机制。
- `docs/design/20-legacy-inheritance.md`：H1-P01、H1-P04（越女剑法合成形态、残篇）。
- `docs/design/12-quests-npc-factions.md`：任务 / NPC ID 规范。
- `docs/design/13-progression-and-endings.md`：书眠结算。
- `docs/design/14-ui-ux-mobile.md`：新游戏、开场、教学提示。
- `docs/tech/09-roadmap.md` §3.3 的 M1 列与 §3.5 闸门：每个系统 M1 要证明的最小能力，序章要逐项给出覆盖点。
- 格式样板：
  - `docs/design/chapters/01-tianlong.md`、`docs/design/story/01-tianlong.md`；
  - `docs/design/story/schema.yaml`（剧情 DAG 字段）；
  - `docs/design/story/examples/`。

## 要做的事

### 1. `docs/design/chapters/00-yuenv.md`（照 01-tianlong 的章节结构）
- **书界定义**：`ch00_yuenv`，春秋·越国，年代口径照 design/02。
- **区域与场景**：区域 1 个，场景 2–4 个（`sc_00_*`），写清每个场景的地块尺寸、出入口和门禁。
- **人物**：阿青、白猿、范蠡，以及教学用的吴国剑士 / 越国兵卒杂兵模板。必要时可加西施等人物，注明原著出处和原创扩展部分。
- **物品**：竹棒、教学用伤药等，十件以内，品阶照 design/10。
- **遭遇**：至少 2 场：一场教学遭遇，一场白猿 / 剑士演示，写清敌人模板、地形和教学目标。
- **教学清单**：表格，每行一个 M1 能力，对应序章里的哪一步、哪个场景、哪条提示。能力包括移动寻路、交互、对话选择、战斗 CT / 聚气 / 招式、物品、存档 / 导出、书眠。
- **序章结束与书眠**：
  - 带走什么：`sk_yuenvjian` 化残篇，照 canon 与 design/20；
  - 不带走什么；
  - 进入天龙冷入口的衔接，对应 `design/chapters/01-tianlong.md` 的开局；
  - 「跳过序章」的补发或替代规则。
- **素材需求**（给后续出图任务）：
  - 春秋越国建筑 / 地表套件需要哪些件；
  - 人物立绘、图标清单。
  现有 11 套年代套件里没有春秋越国风格。
- **需作者确认（附默认）**：每条都写清默认做法。

### 2. `docs/design/story/00-yuenv.md`（照 `story/schema.yaml`）
- **剧情 DAG**：主线 `q_00_main_*` 的节点、前置、完成条件、失败 / 跳过分支。
- **对话**：每段对话的 Ink 入口（`storyId` / `knot` 命名约定），以及关键选择和后果。序章规模要小，30 分钟以内。
- **跳过开场**：可跳过的开场段落和跳过后的状态。

## 约束
- 新 ID 必须照 canon §12 与 design/12 的前缀规范，在这两份文档里定义，`python3 tools/lint/check_ids.py --strict` 必须通过。
- 需要在其他文档登记或修改的（design/12 的 ID 表、design/01 锚点行、tech 文档等），只写进报告第 6 节「需协调者同步」，**不改其他文件**。
- 原创扩展一律标 **（原创扩展）**，原著事实不确定的标（待考）；不改写十四天书任何书界。
- 每次写入 ≤ 150 行。只写 `docs/design/chapters/00-yuenv.md`、`docs/design/story/00-yuenv.md` 与本任务报告。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 序章流程一览（≤ 15 行）；
- 新 ID 清单；
- M1 能力覆盖表；
- 交工程任务的接口（场景 / 遭遇 / Ink 入口 / 书眠结算字段）；
- 素材需求摘要。

报告 ≤ 100 行。

# 本任务：游戏工程 · 数据层（人物 / 物品 / 剧情 DAG / 事件 / 时间的 schema 与核心状态）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md` 与各包 `CLAUDE.md`（ENG-00 的约定），按它们的放法与测法做。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 数据层 2：人物、物品、剧情、事件、时间建模——2.1 剧情 DAG（节点含人物出现 / 消失、对话、任务（事件）；按 condition 或人物选择进入下一节点；每书界一主线多支线；可有触发时限）；2.2 时间（当前时间；客栈睡觉 / 打坐快速推进）；2.3 人物（状态、基础属性、面板属性（生命、内力、力量、速度、韧性、协调等）、武功层数 1–9、经脉（打通的穴位 / 经脉、穴位强度 天地玄黄 × 1–9 层）、经脉加成后威力；**没有单独等级**，生命 / 内力由武功层数与经脉强弱决定；药材强化经脉 / 穴位）；2.3.1 经脉宽度 / 速度 / 数量 / 长度、丹田产气、通量；2.4 物品（物品栏 id + 数量；全局物品 / 藏品位置；店铺供货）。

## 设计依据（字段以这些文档为准，不自造）

- 经脉 / 人物：`docs/design/21-meridian-flow-and-moves.md`、`docs/design/15-meridians-and-acupoints.md`、`docs/design/03-attributes.md`、`docs/design/05-martial-arts-system.md`（DES-qi 已按 AR-19 补全，字段表在 `docs/tech/04-data-pipeline.md` §3）。
- 剧情 DAG 与时间：`docs/design/24-story-dag.md`、`docs/design/story/schema.yaml`、样例 `docs/design/story/examples/01-tianlong-main.yaml`（DES-story-dag 产出）；`docs/tech/05-gameplay-engine.md` §3（GameState 分层）、§5（tick / 日历）。
- 物品：`docs/design/10-items-and-equipment.md`、名录 `docs/design/catalog/items-*.md`（若 DES-items-plus 尚未合入，按 design/10 现有结构，字段留扩展位）。
- 工程：`docs/tech/04-data-pipeline.md` §2–§3（`content/` 目录、Zod schema、ID 注册）、`docs/tech/05-gameplay-engine.md` §3–§4（状态、确定性、规范序列化）。

## 要做的事

1. `packages/data`：Zod schema（定义文件 = 文档）：`NpcDef` / `CharacterTemplate`、`MartialArtDef`（含内功基础产气 / 速度 / 层级曲线 / 通量锻炼参数）、`MeridianDef` / `AcupointDef`、`ItemDef`（十一类共用结构 + 类别扩展）、`ShopDef`（供货规则）、`StoryLine` / `StoryNode` / `StoryEdge` / `TimeWindow`、`EventDef`、`BookWorldDef`（书界：定年、主线 / 支线列表、全局物品与藏品位置）；content 加载器（YAML → 校验 → 冻结对象 → 索引表）；`pnpm content:validate` 跑全部 `content/` 并入 `pnpm check`。
2. `packages/core` 状态：`GameState` 根（tech/05 §3.2 长期 / 书界 / 临时三层）：`CharacterState`（面板属性由武功层数 + 经脉推导：实现 DES-qi 的 hpMax / mpMax 公式；经脉实例：各经脉 / 穴位的通量、宽度、长度、强度、开通进度；武功层数与熟练度）、`Inventory`（id + 数量，叠放上限）、`Equipment`（design/10 §3 槽位）、`WorldItems`（书界物品与藏品位置 + 拾取状态）、`ShopState`、`StoryState`（每条线的当前节点 / 已完成节点 / 时限）、`GameClock`（年月日时辰 + tick；推进 API：睡觉、打坐、旅行、战斗换算，边界事件）；全部整数、可规范序列化（tech/05 §4.5）。
3. `content/` 夹具：把 `docs/design/story/examples/01-tianlong-main.yaml` 放入 `content/story/ch01/`；写 3 个 NPC、6 件物品、1 家店铺、1 门内功 + 1 门外功的 YAML 夹具（ID 用名录里已有的）；加载并通过校验。
4. 测试：schema 往返（parse → serialize → parse 等价）；推导属性的公式用 DES-qi 文档里的样例表做断言；`GameClock` 推进与边界事件；规范序列化哈希稳定；`pnpm check` 全绿。
5. 更新 `packages/data/CLAUDE.md`、`packages/core/CLAUDE.md`：schema 清单、状态根结构、加载与推导的入口函数（交 ENG-03 / 05 / 06 / 07 用）。

约束：core 零浮点、零 `Date.now` / `Math.random`（lint 已禁）；不写战斗 / 运气推进逻辑（ENG-03 / 04）；不写 UI；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：schema 清单（文件 / 类型 / 对应文档节）；GameState 结构；推导公式落点；夹具路径；交下游的入口函数名。报告 ≤ 100 行。

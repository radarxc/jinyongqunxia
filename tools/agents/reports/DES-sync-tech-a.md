# DES-sync-tech-a 报告 · 技术文档同步 · tech/04、tech/05、tech/09-roadmap 接长生诀 / 休眠事件 / 金钱采集 / 支线的数据与运行时契约（各设计报告 §6）

## 1. 摘要（3–6 行）
已将采集、遗迹、营生合同与药材闭集接入数据管线契约。
已将长生跨书状态、休眠选择、书眠提交、采集奖励与合同并发接入玩法运行时。
路线图已落实“白马冷入口 → 完整白马 → 天龙”，并加入 AR-29 动作原型评审门。
本轮只引用归属设计，不重定义规则或改动 Blender 中转评估段落。

## 2. 产出（文件、行数、主要章节）
- `docs/tech/04-data-pipeline.md`：2268 行；§3.9、§5.4、§11、§15–16。
- `docs/tech/05-gameplay-engine.md`：2502 行；§3.2、§4.2、§11.4、§11.8–11.9、§14–15。
- `docs/tech/09-roadmap.md`：1076 行；§1、§3–5、§7–10、文末依赖。

## 3. 关键结论与数值
- `tech/04` §3.9.1–3.9.3、§5.4：落 `GatherSpec`、遗迹掉落、四职位/坐镇合同及 76 味闭集；AR-28 的 64 味为新增登记子集（复用 5、实新增 59）。来源：`DES-economy-gather` §6；本轮返修将逐味/特殊物品/运行投放准确指向 `catalog/gather-herbs` §1/§2/§3，并将逐行内容与术语、ID、统计校验分别指向 §1 与 §5–§6。
- `tech/05` §4.2、§11.4、§11.9：固定 `world`/`loot` RNG、收据幂等、原子奖励和 `activeSeniorContractId` 并发锁。来源：`DES-economy-gather` §6。
- `tech/05` §3.2、§11.8.1：冻结三组跨书字段、两个领域事件；旧档缺 `bookSleepReceipts` 初始化 `[]`，`GameState.bookSleep` 按草稿 / 阶段 / 提交证据迁入，四类 fixture 保证重复迁移逐字节不变。来源：`DES-changsheng-sidelines`、`DES-sleep-events` §6；合入前审核第 1 轮返修。
- `tech/05` §11.8.2–11.8.3：落事件优先级、九层守卫、`fallbackId` 与以 `BookSleepPlan.id` 为键的 `BS_COMMIT`。来源：`DES-sleep-events` §6。
- `tech/05` §11.8.1、§11.8.3–11.8.4：3+3、转化与螺旋只引用上游；高水位唯一写 `FragmentRecord`，外功 / 内功结果分别写角色 `masteryXp` / `trueEssence`，事务不可部分提交。来源：`DES-changsheng-core` §6；合入前审核返修 1。
- `tech/09` §3–4：M1 止于废驿冷入口；完整白马后首次教学 3+3，再进入天龙；总工时仍为 15,740 h。来源：`DES-prologue-v2`、`DES-baima-tang`、`DES-changsheng-core` §6。
- `tech/09` §1.1、§3.3：`TOOL-rig-sheet → ENG-12c-clip → 作者 A/B 评审`，交付男主走路与一套剑招动图。来源：AR-29。

## 4. 开放问题（附默认值）
- 无新增作者拍板项；默认高阶合同维持单活动槽，以 CAS/等价事务锁冲突即失败且不发奖。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本轮仅落实既有作者决定和归属设计。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `design/25` §6：吸收 CSS-P01 动态悟性上限与 CSS-P02 天书后至 `BS_COMMIT` 补窗；本轮只能引用，不能改归属设计。
- `tools/lint/check_ids.py` / `sleep-events`：登记 `slp_` ownership，再将 28 个建议 ID 转正式注册；当前仍按建议 ID 跳过正式所有权校验，strict 通过不等于已注册。
- `story/09`、`chapters/09/10/11`：清除连城→白马旧序并同步连城→鸳鸯；继续清理旧白马年份 / 跨书年差。
- `design/10`、chapters/story、`design/12/14`：登记 `it_heshibi`；实例化遗迹 / 采集 / 休眠入口；消费坐镇合同、来源拆账与 UI。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 仅修改三份目标技术文档和本报告；规则均带归属章节引用，数值未重定义。
- ✅ M1 精确终点、白马后完整取舍、白马到天龙顺序与 AR-29 动作原型均已落地。
- ✅ Blender 中转原评估段落未改；本轮未新增占位文本、截断表格或未闭合代码块。
- ✅ 返修：缺失 `bookSleepReceipts` 只补空数组、不伪造历史；新增根状态迁入旧草稿 / 阶段并处理提交前后与歧义 `BS_COMMIT`，重复执行规范 JSON 逐字节不变。
- ⚠️ 需作者确认（附默认）：无新增拍板项；沿用上游默认——九层须先有八层，合同单活动槽，休眠事件原创文案 / 表现和未定年份字幕按各设计报告 §4。
- ⚠️ 交下游 ENG-01/13：`changshengQuestState/changshengLayerReceipts/heshibiState`；高水位只写 `FragmentRecord.convertedSxp`，余额只写角色 `masteryXp[MasteryCategory]/trueEssence`；`BookSleepCommitReceipt` 只读审计。
- ⚠️ 交下游 ENG-02/05/15/17：两事件 `progression/changshengLayerGranted`、`progression/changshengNinthUnlocked`；休眠事件 `id/chapterId/nextChapterId/priority/requires/entryKnot/sleepScene/wakeRef/cinematicBeats/outcomes/fallbackId`。
- ⚠️ `BS_COMMIT`：以 `BookSleepPlan.id` 幂等；审计收据含 `planId/sleepEventId/from/to/keptMartialIds/keptInnerIds/epiphanyGained/trueEssenceGained/resultHash`。
- ⚠️ 交下游 ENG-06/15：loot `sourceId/firstClearReceipt`、库存 / 金钱 / RNG 原子奖励及 `activeSeniorContractId` CAS/事务锁。
- ✅ `git diff --check` 与 `python3 tools/lint/check_ids.py --strict` 通过；strict failure 0，仅有仓库既存 `sk_babuganchan` 提示。

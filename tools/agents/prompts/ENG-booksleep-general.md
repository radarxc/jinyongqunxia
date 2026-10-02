# 本任务：游戏工程 · 《长生诀》运行时（一）：一般书眠——休眠事件入眠、苏醒取舍 3+3、遗忘 / 散功按层率转顿悟 / 真元、层数二至九、第九层后周游世界（AR-26）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 设计报告（都在 `tools/agents/reports/`）：
  - `DES-changsheng-core.md`：§3 九层效果表、转化算式与核算例、周游规则；§7 末「交下游 ENG-* 字段清单」`ENG-CS-01`～`ENG-CS-11`；
  - `DES-sleep-events.md`：各书休眠事件与保底；
  - `DES-attr-v2.md`：§3 后续书眠的沉睡点数；
- 工程报告第 7 节交给本任务的接口：
  - `ENG-17-booksleep-m1.md`：ch00→ch10 特殊过渡、`BookSleepPlan`、事件表、拒绝码、`save_wake_*`；
  - `ENG-27a-attr-v2-data.md`：熟练度 / 真元的投入命令、`trainingAttrs` 账。

## 为什么做

作者 AR-26（`docs/decisions/author-requirements.md`）：每本书结束后，以休眠事件入眠；苏醒前做取舍——
- 属性点保留；
- 固定保留 3 武功 + 3 内功；
- 其余遗忘 / 散功，按层率转为顿悟点数 / 真元；
- 《长生诀》九层，九层后不再书眠。

ENG-17 只做了 M1 的 ch00→ch10 特殊过渡，一般书眠只声明了类型，遇到就拒绝 `BOOK_SLEEP_UNSUPPORTED`。本任务把一般书眠的规则层和宿主薄接线做完。

第九层的螺旋内力战斗接口归 ENG-28b；取舍界面归界面任务。

## 规格（照这些写，不自创）

- `docs/design/25-changshengjue.md`：
  - §1 功法定义：`sk_changshengjue` 不可遗忘 / 散功，不占 3+3；
  - §2 九层效果表；§6 第九层条件；
  - §7 休眠事件：入口、候选 ≤ 3、保底不得卡进度；
  - §8 苏醒取舍九步（第 9 步原子提交）；§9 周游触发；
  - §12 校验 CS-V01～V09、金标准 CS-T01～T03、T07～T09。
- `docs/design/13-progression-and-endings.md`：
  - §4.10：`eligibleSxp`、`rateBp(n)`、逐门向下取整、`convertedSxp` 高水位、投放规则、本命；
  - §4.11 周游：永久保留、随身保留、时代清理；§6.2 书眠与轮回的继承边界；
  - §9.1～§9.3：存档槽、书眠前自动存档、回档限制。
- `docs/design/02-timeline-and-world-tiers.md`：
  - §4.1～§4.6：余韵期、流程状态机、`BS_COMMIT` 是唯一原子写、`plan.id` 幂等、`BS_ALLOC`、数据结构与提交；
  - §4.7 特殊书眠（ch00→ch10 已由 ENG-17 实现，保持不变）。
- `docs/design/03-attributes.md` §2.4.1：后续书眠 `gain(s,Cb)`；层 3 当次配点 +1、层 5 累计 +2；永久值上限。
- `docs/design/story/sleep-events.md`：`slp_*` 正式 ID 与每书保底事件。
- `docs/00-canon.md`：§2 书序（白马 1 … 雪山 14，稳定 ID 不变）；§3 规则 6 书眠清空项；§3 外来压制与天书抵消的 `ceil(S/2)` 下限。
- `docs/tech/05-gameplay-engine.md`：
  - §3.4 不提供公开的「给予 / 授予」命令；§3.6 大事务检查点；
  - §4.2 五流 RNG 跨书延续；§5.3～§5.4 纪元重建与 `world/eraChanged`；
  - §15 书眠 golden。

## 要做的事

1. **一般书眠命令**：`chapter/bookSleep` 接受一般过渡。目标书按 Canon §2 书序取下一本。前提：
   - 本书天书已取得、处于余韵期；
   - 选定的 `sleepEventId`（`slp_*`）已经满足，由内容授权路径置位；
   - `battle`、`dialogue` 为 null；`changshengLayer` 在 1–8；
   - `plan.id` 幂等。
   
   九层后一律拒绝，改走第 7 条的周游。ch00→ch10 特殊过渡保持 ENG-17 的行为不变。
2. **取舍校验**：
   - 最多 3 武功 + 3 内功，类别口径照 design/25 §8 第 2～3 步；《长生诀》不计；
   - 本命必须在保留的武功里；
   - 其余逐门选「遗忘转顿悟 / 仅留残篇」或「散功转真元 / 仅留痕迹」；
   - 装备最多 6 件。
   
   任一不合法：整单拒绝，状态无差异。
3. **转化**：
   - 按 13 §4.10.1 逐门向下取整，禁止先合并再取整；
   - `convertedSxp` 按技能 ID 存高水位（残篇记录）；
   - 武功产顿悟、内功产真元，二者不得互换；
   - 投放（确认前可重分，也可暂存）走 ENG-27a 的投入接口；
   - 层 7 起真元可跨内功性质投放。
4. **沉睡配点**：`gain(s,Cb)` 加层 3 / 层 5 的额外预算；六项分配，范围与上限照 03 §2.4.1；未分配点留存。
5. **清空与保留**：
   - 按 Canon §3 规则 6 与 13 §6.2 清空金钱、普通物品、门派、资源、任务、在队同伴；属性保留；章节子树重置；
   - `world.navigation` 指向下一书苏醒点（待挂载）；`meta.contentHash` 设为下一书包的值；
   - 发事件 `chapter/bookSleepCommitted`、`world/eraChanged`、`chapter/woke`；
   - 整个事务不消耗 RNG。
6. **层数**：
   - 二至八层只经内容授权路径（支线完成）逐层 +1：不可跳层，重复完成不重复升；
   - 第九层五个条件（鹿鼎、八层、悟性达 03 当前硬上限、持真实和氏璧、心境节点）全满足才升；缺项时查询结果列明缺什么（CS-T07 / T08）；
   - 层 6：外来压制缓和 1 小品，受 `ceil(S/2)` 下限（CS-T02 / T03）。压制计算若在本任务写集外，只加读取钩子，并在报告写明。
7. **周游**：九层后跨书走 `chapter/roamDepart`（`ROAM_DEPART`）：
   - 全部武学、属性、顿悟、真元、银两、普通背包与装备保留；
   - 按 13 §4.11 清理时代绑定状态；
   - 仍按 03 §2.4.1 发沉睡点；
   - 不执行 3+3。
8. **只读查询**：
   - 转化预览：层 2 起才显示逐项算式（design/25 §2）；
   - 休眠事件候选（≤ 3，含保底）；
   - 3+3 校验结果；第九层缺项。
9. **宿主薄接线**：
   - dispatch 前预载并校验下一书书界包；
   - 挂载成功后写 `save_wake_chNN`；
   - 书眠前自动存档（13 §9.3）。
   
   界面只给查询与命令，页面归界面任务。
10. **测试**：
    - CS-T01：6000 / 6600 / 7200；13 §4.10.2 例 A～D；CS-T02 / T03、T07～T09；
    - 拒绝且状态无差异：3+3 越界、本命不在保留里、选了《长生诀》、九层后书眠；
    - 重复 `plan.id` 无操作；忆起后再忘只转新增部分；
    - 跨书五流 RNG 游标连续、不重播种；
    - 书眠 golden，格式照 tech/05 §4.6；
    - 主线程宿主与 Worker 宿主 hash 一致。

## 约束

- 写集：
  - core：`packages/core/src/{progression,state,command,api,world}/**`、`packages/core/CLAUDE.md`；
  - data：`packages/data/src/schemas/**`（只为书眠计划、休眠事件、书序字段）、`packages/data/src/content-index.ts`、`packages/data/src/content-registry.ts`；
  - 应用：`apps/game/src/runtime/**`、`apps/game/src/storage/**`、`apps/game/src/core-host.ts`、`apps/game/src/core-worker.ts`、`apps/game/CLAUDE.md`。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/battle/**`（ENG-28b）、`docs/**`、`content/**`、`packages/render/**`、`packages/ui/**`、`apps/game/src/pages/**`。命令注册表每条新命令只加一行。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 状态字段新旧对照（`ENG-CS-01`～`11` 逐项落点）、`saveSchema` 与迁移；
- `chapter/bookSleep` / `chapter/roamDepart` 的校验与拒绝码表、事件表；
- 测试与 golden；
- 交给 ENG-28b 的接口：`changshengLayer`、螺旋资源读取；
- 交给界面任务的查询与命令：取舍三栏、转化袋、确认页；
- 文档漂移清单。

报告 ≤ 100 行。

# 本任务：技术文档同步 · tech/04、tech/05、tech/09-roadmap 接《长生诀》《休眠事件》《金钱与采集》《支线》的数据与运行时约定（各设计报告 §6）

本任务只做文档之间的一致性同步，不改设计意图，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：各设计报告的 §6「需同步到其他文档」——`tools/agents/reports/DES-changsheng-core.md`、`DES-changsheng-sidelines.md`、`DES-sleep-events.md`、`DES-economy-gather.md`、`DES-prologue-v2.md`、`DES-baima-tang.md`；对应的归属文档 `docs/design/25-changshengjue.md`、`docs/design/story/sleep-events.md` §2、`docs/design/story/changsheng-sidelines.md` §1.3 / §9.1、`docs/design/16-resources-and-estates.md`、`docs/design/11-open-world.md`、`docs/design/catalog/gather-herbs.md`；目标文档 `docs/tech/04-data-pipeline.md`、`docs/tech/05-gameplay-engine.md`、`docs/tech/09-roadmap.md`（先 `grep -n '^#'` 看目录）。

## 要做的事（只落「技术契约」，规则本身仍引用归属文档）
1. **`tech/04`**（DES-economy-gather §6）：`GatherSpec`（采集点：产地、季节、十二时辰窗口、刷新）、遗迹掉落表、营生合同字段（武馆教练 / 镖局坐镇 `job_zuozhen`）、64 味药材登记与闭集校验（`catalog/gather-herbs.md` 为准）；数据格式写字段表与校验规则。
2. **`tech/05`**：
   - DES-economy-gather：`world/loot` 的 RNG 分流、收据幂等、原子奖励、高阶合同并发锁；
   - DES-changsheng-sidelines §6：冻结三组跨书字段、两个领域事件 schema、迁移、原子性与幂等约束（照 sidelines §1.3、§9.1）；
   - DES-sleep-events §6：书眠状态机——事件字段（`sleep-events.md` §2.1 表）、优先级、九层守卫、`fallbackId`、`BS_COMMIT` 幂等提交；
   - DES-changsheng-core：苏醒取舍 3+3、60% 转化、层数、螺旋内力的运行时状态字段与事务边界（引用 design/25，不重定义数值）。
3. **`tech/09-roadmap.md`**：核对 M1 终点是否已是「长白山初眠配点后进入白马（唐）废驿冷入口」（DES-prologue-v2 / DES-baima-tang 都要求），没有就改；加「白马后再教学完整取舍」；后续阶段从完整白马再到天龙；按 AR-29 补「动作原型」里程碑一行（TOOL-rig-sheet / ENG-12c-clip / 作者 A/B 评审）。**不要改 Blender 中转那一行**（作者仍在评估）。
4. 每处同步写明来源（「见 design/25 §x」），数值只引用。

## 约束
- 只写：`docs/tech/04-data-pipeline.md`、`docs/tech/05-gameplay-engine.md`、`docs/tech/09-roadmap.md`、本任务报告。
- 不改 design/*、story/*、canon。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：文件、节号、加了什么、来源报告；第 6 节写仍未落的同步项（归属 / 原因）。报告 ≤ 50 行。

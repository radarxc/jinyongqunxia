# 本任务：设计文档同步 A · design/10、11、12、14、15、18、19、20 接《长生诀》《休眠事件》《金钱与采集》《支线》《白马唐代化》（各设计报告 §6）

本任务只做文档之间的一致性同步，不改设计意图，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：各设计报告的 §6——`tools/agents/reports/DES-changsheng-core.md`、`DES-changsheng-sidelines.md`、`DES-sleep-events.md`、`DES-economy-gather.md`、`DES-baima-tang.md`、`DES-scenes-keyart.md`、`DES-sync-baima-year.md`（已合入，年份 702–703）；归属文档 `docs/design/25-changshengjue.md`、`docs/design/story/sleep-events.md`、`docs/design/story/changsheng-sidelines.md`、`docs/design/16-resources-and-estates.md`、`docs/design/chapters/10-baima.md`；目标文档各自 `grep -n '^#'` 看目录。

## 要做的事（逐条落点，规则本身仍引用归属文档）
1. `design/10-items-and-equipment.md`：正式登记 `it_heshibi`（和氏璧）——唯一实例、主线信物格表现、不走传承匣（sidelines §9.1、changsheng-core §6）。
2. `design/12-quests-npc-factions.md`：消费 `job_zuozhen`、职责事件、遗迹 / 剧情战 `rewardSplit` 与唯一来源规则（economy §6）；白马任务 / 组织矩阵里 `sect_hasake` 在 ch10 显示「铁延部」、晋威号仍为文本组织（baima-tang §6）。
3. `design/14-ui-ux-mobile.md`：3+3 取舍、转化预览 / 确认、本命与周游摘要 UI；删除旧序章 `maxLayer` / `apSword` 永久收益口径（changsheng-core §6）；十二时辰职位冲突、采集窗口反馈、遗迹首通 / 重访与来源拆账（economy §6）。
4. `design/18-npc-and-companions.md`：删除旧的 14 段统一书眠表，改为引用 `story/sleep-events.md`；接休眠 / 周游两种跨界与活动队伍清理（changsheng-core §6）；白马 NPC 年代 702–703 与成年视觉（baima-tang §6）；阿青 / 范蠡 / 白猿条目已由 DES-sync-baima-year 登记，只核对。
5. `design/20-legacy-inheritance.md`、`design/15-meridians-and-acupoints.md`：和氏璧不走传承匣；校合接新携带规则；15 §7 / §10 按白马首书迁移经脉路线、逐转门槛与 `V15-*`，总量仍 `175,045H`（changsheng-core §6）；20 的时序过滤 / 传承链：白马置首，阻断 703 年以后来源，重排白马 → 天龙（baima-tang §6）。
6. `design/11-open-world.md`：登记或替换鹿鼎观星台场景 ID（北京城外、非权力中心、无轻功硬门；sidelines §6）；白马锚点地名西州 / 庭州 / 铁延部、D2、year=702（baima-tang §6；若 `map/cities.yaml` 需改，写进报告第 6 节，不动）。
7. `design/19-world-map.md`：同步白马唐代与首书展示序，保留稳定 `ch10_baima`（economy §6）。
8. 每处写明来源（「见 design/25 §x」）；数值只引用；白马年份一律 702–703。

## 约束
- 只写：`docs/design/10-items-and-equipment.md`、`docs/design/11-open-world.md`、`docs/design/12-quests-npc-factions.md`、`docs/design/14-ui-ux-mobile.md`、`docs/design/15-meridians-and-acupoints.md`、`docs/design/18-npc-and-companions.md`、`docs/design/19-world-map.md`、`docs/design/20-legacy-inheritance.md`、本任务报告。
- 不改 design/02、03、04、05、13、21、25、canon、story、chapters、map。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：文件、节号、改了什么、来源；第 6 节写仍未落的项。报告 ≤ 50 行。

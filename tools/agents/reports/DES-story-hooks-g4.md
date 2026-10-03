# DES-story-hooks-g4 报告 · 故事线挂接口 · 第四组：连城、白马、鸳鸯（休眠事件 + 长生诀支线接入 story/NN 与 chapters/NN，AR-26）
## 1. 摘要（3–6 行）
- 本次以当前可信模型逐节复核前两次产物，保留三书原结局 DAG、既有 `slp_*` / `q_*` / `dc_*` 与合格接口，仅修正错漏。
- 三书均在结局后接休眠事件；连城、鸳鸯按 `<9` 书眠 / `>=9` 周游分流，白马第一正式书接天龙。
- 白马第二层 `sideHook` 已在 story 与 chapters 同步，且清除章节中“支线尚待选择”的旧口径。
- 年代与书序统一为白马 702–703、白马→天龙 391 年、鹿鼎→连城→鸳鸯；严格 ID 与结构检查通过。

## 2. 产出（文件、行数、主要章节）
- `story/09-liancheng.md`（1818 行）：主线图、§7.5 连城书眠 / 周游；`chapters/09-liancheng.md`（1310 行）：§11.3–§11.5。
- `story/10-baima.md`（1717 行）：§0.4、§7.5–§7.7；`chapters/10-baima.md`（1620 行）：§3.4、§6.7、§9.7、§11.2–§11.6、任务索引。
- `story/11-yuanyang.md`（1672 行）：主线图、§7.3；`chapters/11-yuanyang.md`（1664 行）：§2、§3.4、§11.1–§11.6、书眠接口。
- `tools/agents/reports/DES-story-hooks-g4.md`：本次可信复核记录。

## 3. 关键结论与数值
- 连城：`q_09_main_c_05` 后挂 `slp_09_xuegubimen` / `slp_09_jupuxiexin`，九层后 `world_roaming`；`1740−1712=28`。chapters 登记 1003–1009 行。
- 白马：E1–E4 后挂 `slp_10_kongkantingfeng` / `slp_10_baimayuansong`；`1093−702=391`，醒入 `sc_01_wuliangyidao`。chapters 登记 1090–1099、1125–1158 行。
- 白马 `sideHook`：`q_10_changsheng_01` / `side_changsheng_01` / `n_bm_mark`；三个主线挂点见 story 1167–1176、chapters 602–611 行，覆盖迷宫外环、内殿、沙路与铁延营地。
- 鸳鸯：`dc_11_08` / 任一结局后挂 `slp_11_songlinxiedao` / `slp_11_gudengshouyi`，九层后 `world_roaming`；`1753−1740=13`。chapters 登记 1096–1102、1124–1156 行。
- 事件优先级统一复用 10 / 20；候选 `fallbackId` 回本书保底，保底为 `null`；《鸳鸯刀》前界统一从松林外围入界。

## 4. 开放问题（附默认值）
- 白马→天龙尚无正式 `vid_*`：默认使用章节局部 `sleep_10_to_01_pending`，待 `design/02` 分配后替换。
- 白马 BT-04 联系形式仍需作者确认：默认“留信但不承诺归期”，由李文秀本人决定，不保证 391 年后实体出现。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增提案；Canon v1.10 与 AR-26 已裁定本任务所需书序、年份、3+3 与九层周游。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `design/story/sleep-events.md` §3.1、文末依赖及 `DES-sleep-events.md` §6：仍写白马约 641 / 452 年，应同步为 702–703 / `1093−702=391`。
- `design/02-timeline-and-world-tiers.md` 转场资源表：为 `ch10_baima→ch01_tianlong` 分配正式 `vid_*`。
- `design/20-legacy-inheritance.md` §§9.5、9.6 等：仍按旧相邻序写连城来源自白马起投、高昌来源自鸳鸯起投，需按现行序重排。
- `README`、`design/01`、`tech/07`、`tech/09` 及旧 P09/P10/P11 报告仍见旧书序 / 年份 / 清代白马口径；由各归属任务统一同步。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ⚠️ 需作者确认（附默认）：白马 BT-04 成功后的联系形式，默认“留信但不承诺归期”，由李文秀本人决定，不保证 391 年后的《天龙八部》阶段实体出现。
- ⚠️ 交下游（ENG-*）字段清单：书眠 `id/chapterId/nextChapterId/priority/requires/entryKnot/sleepScene/wakeRef/fallbackId`；九层分流 `guard/ninthLayerElse`；白马支线 `questId/lineId/startNodeId/mainlineHookPoints/sceneRefs/normalWindow/proofMode/rewardReceipt`。
- ✅ 第三次可信模型逐节复核：保留原结局与正确接口；修正 Canon 版本、真实 `requires`、旧序 / 年份、白马挂点、鸳鸯入界场景和旧候选口径。
- ✅ 三份 story 均登记结局后书眠节点、候选、`entryKnot`、优先级、`fallbackId`、下一书入口；连城 / 鸳鸯另有九层周游。
- ✅ 白马支线复用既有 ID，登记起点、三个主线挂点、四场景、第二层奖励与本书余韵补证；不得跨书重开。
- ✅ 三份 chapters 均登记事件、入眠地点与下一书入口；白马另在场景表、任务段和 ID 索引登记支线。
- ✅ 未新建禁用前缀 ID；所有新增叙事项按约定标原创扩展，未虚构引文 / 回目。
- ✅ `python3 tools/lint/check_ids.py --strict`：`strict failure count: 0`；仅显示基线已知 `sk_babuganchan`。
- ✅ `git diff --check`、代码围栏配对、表格基本结构、旧年份 / 旧序 / 占位词扫描均通过。
- ✅ `git status --short` 仅有六份授权策划文档和本报告；未执行改变仓库状态的 git 命令。
- ⚠️ 上述跨文档旧口径不在本任务写集，已完整登记于第 6 节，未越权修改。

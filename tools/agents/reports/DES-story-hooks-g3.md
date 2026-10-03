# DES-story-hooks-g3 报告 · 故事线挂接口 · 第三组：侠客、碧血、鹿鼎（休眠事件 + 长生诀支线接入 story/NN 与 chapters/NN，AR-26）

## 1. 摘要（3–6 行）

完成侠客、碧血、鹿鼎六份剧情 / 章节文档的 AR-26 接口挂接，仅引用休眠事件与长生支线权威规格。
三书原结局均保留并汇入 `afterglow`；书眠按 `requires` 生成可见集合后由玩家选择，鹿鼎先验九层后互斥分流为周游或书眠。
侠客第八层、鹿鼎第九层及和氏璧跨书保存均已登记任务、选择、时间窗和场景挂点；碧血明确无长生任务且只读过境。
本轮合入前审核返修仅消除鹿鼎 `sideHook` 的幕序歧义，以稳定主线任务 ID 映射五处场景；严格 ID 与差异格式检查通过，写集未越界。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `story/06-xiake.md` | 2001 | §7.8 第八层 sideHook、结局后书眠与碧血入口 |
| `story/07-bixue.md` | 1861 | §7 结局、书眠、无长生任务与和氏璧过境 |
| `story/08-luding.md` | 2102 | §7.8 第九层 sideHook、九层互斥分流与连城入口 |
| `chapters/06-xiake.md` | 1819 | §6.6 任务登记、§11.2 书眠、场景 / ID 索引 |
| `chapters/07-bixue.md` | 1996 | §11.2–§11.3 书眠、过境约束与索引 |
| `chapters/08-luding.md` | 1943 | §3.4 场景、§6.7 任务、§11.3–§11.4 分流与提交 |

## 3. 关键结论与数值

- 侠客：四个局部结局（`story/06` 1268–1274）→ `afterglow` → 玩家从可见的 `slp_06_haishangwanggui`（候选）/ `slp_06_shishiwuwenzi`（恒可见保底）中选择；接口见 1371–1380，苏醒 `sc_07_lingnan_yizhan`，`1630−1583=47` 年。
- 侠客 sideHook：`q_06_changsheng_01` 起点 `n_xk_manifest`；挂点为接引港、海蚀洞、岩厅、石室（1363–1368，至少三处）；章节登记见 `chapters/06` 209、233、590、1230–1231。
- 碧血：`q_07_main_c_03` 的原著 / 改命结果 → `afterglow` → 玩家从可见的 `slp_07_duzhousongbie`（候选）/ `slp_07_huashanxiejian`（恒可见保底）中选择；接口见 1287–1290，苏醒扬州书坊，`1669−1645=24` 年。
- 碧血无 `q_07_changsheng_01`；和氏璧仅只读保存。章节登记见 `chapters/07` 1252–1253、1267、1271。
- 鹿鼎：四结局 → `afterglow` 后先验九层；九层已成周游不眠，未成才由玩家从可见的 `slp_08_yangzhoujiugu`（候选）/ `slp_08_tongchidaoyin`（恒可见保底）中选择，接口见 1551–1563，`1705−1690=15` 年。
- 鹿鼎 sideHook：`q_08_changsheng_01` 起点 `n_ld_inventory`；入书挂扬州书坊，`q_08_main_c_01` 后挂紫禁城，`q_08_main_z_02` / `q_08_main_x_02` 后挂五台清凉寺，`q_08_main_z_05` / `q_08_main_x_05` 后挂鹿鼎山矿道，`dc_08_10` 结算后挂北京城外观星台最终段（`story/08` 1541–1549；`chapters/08` 599）。
- 六条事件统一优先级为候选 20 / 保底 10 **【建议值】**，仅用于排序；`fallbackId` 只处理已选候选的入场前失效 / 入口失败，`requires` 与玩家选择均沿用 `sleep-events.md` §2.2。

## 4. 开放问题（附默认值）

- 观星台正式场景：默认把临时 `placeKey: beijing_outskirts_observatory` 映射为建议 ID `sc_08_beijing_guanxingtai`，仍须北京城外、非权力中心、普通官道可达。
- 连城精确苏醒点：默认保留“麻溪铺 / 荆州入口之一”，由 `story/09`、`chapters/09` 在不跳过最前期的前提下定稿。
- 事件优先级：默认沿用候选 20、保底 10；若工程统一排序值变化，仅改配置，不改变“保底恒可见、候选按条件增显、玩家选定”的语义。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。Canon v1.10 已明确白马 702–703、现行书序、九层周游及稳定章节编号；本任务只补接口，不提出新基准事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 / 改什么 |
|---|---|
| `story/sleep-events.md` §3、§8 与 `DES-sleep-events.md` §1/§3/§6 | 旧白马约 640–641、`1093−641=452` 已被 Canon v1.10 推翻；同步为 702–703、`1093−702=391` |
| `design/11`、`chapters/08` | 正式登记或映射 `sc_08_beijing_guanxingtai`；本任务暂用 `placeKey: beijing_outskirts_observatory` |
| `design/10` | 正式登记上游建议 ID `it_heshibi`、唯一实例及天书匣主线信物格规则 |
| `story/09` §0.2、§0.3、§7.5；`chapters/09` §2.1、§11.3 | 仍有旧书序与旧接口：鹿鼎后强制书眠、连城后接白马；`chapters/09` 另写旧 1 内功 / 1 拳脚 / 1 兵器。须接收鹿鼎周游 / 书眠两路，改 3 武功 + 3 内功，并按现行书序重写后书衔接 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 仅修改六份授权正文并更新本报告；本轮只改鹿鼎两份正文的 `sideHook` 稳定节点映射及报告对应结论，未触碰已审核通过的接口，未执行改变仓库状态的 git 命令。
- ✅ 三书结局均挂书眠接口；保底在书眠可用时恒可见，候选按 `requires` 增显且玩家选定；优先级不自动选路，`fallbackId` 仅处理已选候选入场前失效 / 入口失败。
- ✅ 侠客 / 鹿鼎 sideHook 与章节任务索引、至少三个场景挂点、时间窗、失败 / 跨书禁补引用齐全；鹿鼎已用 `q_08_main_c_01`、`q_08_main_z_02` / `q_08_main_x_02`、`q_08_main_z_05` / `q_08_main_x_05`、`dc_08_10` 稳定映射五处场景；碧血明确无任务。
- ✅ AR-26 与固定 3+3 口径已统一：`story/08` §0.2 明确第九层前固定 3 武功 + 3 内功、第九层后不限且保留 −4；`chapters/06` §12.5 区分本界战斗装配栏与跨书携带；鹿鼎九层已成只周游，未成才显示 `slp_08_*`。
- ✅ 年差按现行书序核算为 47、24、15 年；白马统一采用 702–703 裁定，未沿用旧报告。
- ✅ `python3 tools/lint/check_ids.py --strict` 退出 0，新增 strict failure 为 0；唯一未定义项是基线 `sk_babuganchan`。
- ✅ `git diff --check`、新增占位扫描通过；六份正文围栏数均为偶数；报告 60 行以内。
- ⚠️ 上游待落盘（无需作者确认）：观星台暂用 `placeKey: beijing_outskirts_observatory`；连城精确苏醒点默认麻溪铺 / 荆州入口之一且不跳过最前期；事件优先级默认候选 20、保底 10。
- ⚠️ 交 ENG-* 下游字段清单：书眠须落地 `id/chapterId/nextChapterId/priority/requires/entryKnot/sleepScene/wakeRef/fallbackId`；支线须落地 `lineId/questId/startNodeId/sideHook/sceneRefs/window/choiceId/fromLayer/toLayer/receiptId/failurePolicy/expireAt`；鹿鼎另验 `innatePerm.wis==innateCap.wis`（临时悟性无效）及 `heshibiState.authentic/acquisitionReceiptId/attuned/consumedForInsight`。

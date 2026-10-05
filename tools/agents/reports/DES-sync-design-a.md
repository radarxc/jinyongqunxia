# DES-sync-design-a 报告 · 设计文档同步 A · design/10、11、12、14、15、18、19、20 接长生诀 / 休眠事件 / 金钱采集 / 支线 / 白马唐代化（各设计报告 §6）

## 1. 摘要（3–6 行）
完成 8 份归属外设计文档的一致性同步，未修改 Canon、story、chapters、map、代码或其他文档。
统一采用白马首书与 702–703 年口径；休眠报告中的约 641/452 年旧稿未进入目标文档。
长生诀 3+3 / 转化 / 周游、经济来源分账、观星台、和氏璧、经脉检查点与传承时序均已接入并注明唯一来源。

## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `design/10-items-and-equipment.md` | 2670 | §7.1、§11.2.3、§12.3、§14–§16 |
| `design/11-open-world.md` | 1751 | §1.6、§3.3、§10.2、§13–§15 |
| `design/12-quests-npc-factions.md` | 1991 | §3.5、§4.2、§6.7、§7.2、§12–§13 |
| `design/14-ui-ux-mobile.md` | 1499 | §4.4、§4.13、§5、§8.3、§10–§11 |
| `design/15-meridians-and-acupoints.md` | 1698 | §7、§9、§10、§14–§15 |
| `design/18-npc-and-companions.md` | 1750 | §5.6、§6、§10、§14–§15 |
| `design/19-world-map.md` | 1003 | §3.2、§8、§15–§16 |
| `design/20-legacy-inheritance.md` | 1717 | §0、§2–§4、§7–§9、§11、§14–§15 |

## 3. 关键结论与数值
| 文件 / 节号 | 改动 | 来源 |
|---|---|---|
| 10 §11.2.3 / §12.3 | 正式登记唯一 `it_heshibi`；主线信物格保留，不进传承匣 | `design/25` §5；`story/changsheng-sidelines` §9.1 |
| 11 §3.3 / §10.2 | 登记城外观星台；白马为西州 / 庭州 / 铁延部、D2、`year=702` | `design/25` §6；支线 §9；`chapters/10` §1、§3 |
| 12 §3.5 / §4.2 / §7.2 | 接 `job_zuozhen`、8 块/月、`rewardSplit` 五桶唯一来源；ch10 显示铁延部，晋威号仅文本 | `design/16` §8、§12；`chapters/10` §6–§7 |
| 14 §4.4 / §4.13 / §5 | 固定 3 武功+3 内功，本命仅可选保留的 3 门武功；接转化确认、周游摘要、职位、采集与遗迹反馈，删除旧序章收益 | `design/25` §8–§9；`design/13` §4.10–§4.11；`design/11/16` |
| 15 §7 / §10 | 门槛 `4/5/6/7/8/9/10/12/14`；白马首书迁移检查点，总量仍 `175,045H` | Canon §2；`design/13` §3.5.2；`design/25` §8–§9 |
| 18 §5.6 / §6 | 删除 14 段重复书眠表；书眠/周游均清活动队；白马 702–703、23 张成年唐代立绘规格 | `story/sleep-events` §1–§6；`design/25` §7–§9；`chapters/10` §8、§14 |
| 19 §3.2 / §8 | 展示序置首白马，稳定 `ch10_baima` / `era-ch10`；唐代 `band` 缺口显式化 | Canon §2；`design/02` §1；`chapters/10` §1、§3 |
| 20 §2.7 / §9 / §11 | 书序与年份双门禁阻断 703 年后来源；高昌源最早转天龙；校合接 3+3/周游，和氏璧拒收入匣 | Canon §2；`design/02` §1；`design/25` §5、§8–§9 |

## 4. 开放问题（附默认值）
- 唐代尚无合法 `history.band`：默认写 `—`，由地图归属任务扩 schema 或逐章覆写，旧清初 ch10 资产禁止发布。
- 观星台尚未挂入 `chapters/08` / `story/08`：默认沿用 `sc_08_beijing_guanxingtai`，北京城外、非权力中心、普通官道可达。
- 上游仍有旧 641/452、390 年与旧书序：默认服从 Canon v1.10，白马 702–703，转场锚点 `1093−702=391`；23 张旧清初立绘默认禁用。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无新增提案；本任务仅执行 Canon v1.10 已定书序、年代、3+3、周游和经济来源边界。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 / 改什么 |
|---|---|
| `story/sleep-events`、`story/10`、`chapters/10` | 删除约 641/452 与 390 年旧值，统一 702–703、`1093−702=391` |
| `story/09`、`chapters/09`、`chapters/11` | 移除连城→白马、白马→鸳鸯旧链，改连城→鸳鸯并重算跨度 |
| `design/map/cities.yaml`、`jianghu-ch10.svg`、`design/17` | 新建唐代逐章层 / 合法 schema，重绘 ch10，白马列置首并重算 702 年组织状态 |
| `chapters/08`、`story/08` | 正式挂观星台与 `q_08_changsheng_01`；保持普通官道入口和四条件 |
| `docs/README`、`tech/09`、`tech/04–05`、白马人物资产 | 修正首书路线；实现新字段 / 事务；按 23 张唐代成年规格生产并审核 |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
✅ 仅改允许的 8 份设计文档与本报告；来源、边界、702–703 年与 `175,045H` 均已核对。✅ 本命满足 `benming ∈ keptMartialIds`、`benming ∉ keptInnerIds` 且不进转化集合。✅ `git diff --check` 与严格 ID 校验已通过；⚠️ 未实现项均列 §4/§6。
**需作者确认（附默认）**：无新增，沿用 §4 默认值。
**交下游（ENG-*）字段清单**：`ENG-CSJ`：`keptMartialIds/keptInnerIds/benming/convert/eligibleSxp/convertedSxp/rateBp`（本命仅属保留武功；固定 3+3 与转化高水位）；`ENG-ROAM`：`ROAM_DEPART` 清 `activeParty`、留守任务与当界位置；`ENG-HES`：`heshibiState/acquisitionReceiptId`。
**交下游（续）**：`ENG-ECO`：`rewardSplit[{rewardRef,instanceKey,economySource,sourceId}]`、`job_zuozhen/activeSeniorContractId`、职责块与结算收据；`ENG-LEG`：`originChapter/disappearanceChapter/disappearanceYear/currentChapter/currentWakeYear/eligibleChapters`；`ENG-MAP`：稳定 `ch10_baima/era-ch10`、顺序 `10,01..09,11..14`、白马 702–703。

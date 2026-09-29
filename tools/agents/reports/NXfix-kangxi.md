# NXfix-kangxi 报告 · 终审·收尾（门派图鉴）· 康熙

## 1. 摘要（3–6 行）

完成康熙册经脉落地终审：核对 14 本补录图鉴后，本册无须新增 `sourceChapters`，并为确有补录的组织补齐 08／09／10 册入口。
修正 2 处绝招 `purpose`、12 条路线末端规则及 3 条本册内高重合路线，33 条绝招路线现均互异；本册内 ≥80% 重合为 0，全仓跨册警告涉及本册 54 对（复核基线 83 对），其中 100% 集合重合 23 对。
`sk_taiyueshibeishou.weaponReq.altItems` 已接入 `eq_changchangfengshibei`；外放复核后无新增改标，既有 2 招继续满足 AR-16。
全部指定 lint、单测、伤害／经脉／投影模拟与专项唯一性检查通过；未修改写集外文件。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-kangxi.md` | 1,571 | 版本记录、绝招路线索引、补录入口、墓碑兼容、外放审计、经脉验收、术语与待决追溯 |
| `tools/agents/reports/NXfix-kangxi.md` | 115 | 本报告：结论、遗留、门禁与跨任务移交 |

## 3. 关键结论与数值

- 本册规模维持 `天/地/玄/黄 = 2/14/37/37 = 90`，未增删正式武学。
- 路线共 33 条、不同序列 33 条；可分类 26 条，其中实际命中末端规则检查 21 条，未分类 7 条。
- 末端规则从“缺失 10、位置 2”收敛为“缺失 0、位置 0”；本册内跨武学穴位集合重合 ≥80% 为 0。全仓跨册 ≥80% 警告涉及本册 54 对（改前 83 对），其中 100% 集合重合 23 对；警告不等于穴位顺序完全相同，专项检查确认完全同路由为 0。
- 外放仍为 `天/地/玄/黄 = 0/2/0/0`，合计 2：`mv_huagumianzhang_geyi`、`mv_shenlongxinfa_tuxi`。两者 0 档与基础 `aoe` 一致，路线均以合法手部端点收束。
- 14 本来源扩展登记逐册核对后，目标属于康熙册现有武学的项目为 0；因此没有写入新的 `sourceChapters`。
- `mfr_hongyingjian_tongxin`、`mfr_mufuhujian_sheshen` 依正文伤害效果统一为 `purpose:attack`；`mfr_meirensanzhao_feiyan`、`mfr_fuqidaofa_tongxin` 原值已是 `attack`。
- 墓碑兼容采用既有具名 ID：`altItems:[eq_changchangfengshibei]`；仅满足 `exotic/misc` 武学介质，装备槽仍按副手牌结算。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本任务沿用的默认值 |
|---|---|---|
| O-03 | 高昌守护剑是否保留地上顶点 | 保留地上，明确为原创扩展且不称历史流派 |
| O-04 | 罗刹火器术是否独立成武学 | 保留黄上独立武学；实际伤害与弹药仍由装备域唯一结算 |
| O-05 | 夫妻刀组合技的角色显示 | UI 可显示“双侠甲／乙”，性别不设门槛 |
| O-06 | 八步赶蟾是否纳入正式库存 | 不纳入；若采用，须在本册 90／全局 1,138 内等量替换，不作增量 |
| O-07 | 护体高／中／低是否新增正式字段 | 不新增，只作由 `grade/nature` 派生的检索文案 |
| D-03 | 三项秘籍／残页语义占位尚无物品正式 ID | 仅描述学习来源，不生成可交易物品；待物品域定号 |
| D-05 | 四书本土复现与低武可习得池最终比例 | 全局汇总前只以 `design/05` §16.6 最小池作缺口下界，不宣称已达最终比例 |
| R-01 | 绝招条件加成算法全仓未统一：古龙、五岳取 `3.00+Σadj`，五绝与本册取 `3.00×(1+Σadj)`，乾隆只把条件作为门槛 | 本册依 `design/05` §4.2 公式及第 812 行说明采用乘法；建议 §4.8 冻结唯一算法 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

本任务无新增基准修改提案。原 KX-P01～KX-P03 已分别由 `design/05` 的受控配额／可选合击口径及 Canon v1.3 的经脉前缀与归属边界解决，正文保留“已解决”追溯。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档／任务 | 位置 | 需同步内容 |
|---|---|---|
| 五绝册任务 | `sk_tiezhang` 来源 | 将 `ch03_shendiao` 按“神雕残承”登记，避免神雕完整原生天阶池由 18 超上限至 19 |
| 通行册任务 | `sk_baizhanxinfa` 来源 | 增加 `ch12_shujian`、`ch14_xueshan` |
| 通行册任务 | `sk_pojunqiangfa` 来源 | 增加 `ch14_xueshan` |
| 全局汇总任务 | 补录后统计 | 汇总正式武学总量及十四书界可习得池比例；本册不代替全局宣称达标 |
| 物品域／章节任务 | D-03 | 为 `it_ningxue_miji`、`it_shenzhao_yuwen`、`it_canye_xuedaojing` 的语义占位决定正式落表方式或 ID |
| `design/05` 归属方 | §4.8 | 写明绝招 `Σadj` 的唯一算法，统一当前加法、乘法与仅作门槛三种跨册口径 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单

- ✅ 已逐册核对 `skills-bulu-01-tianlong.md` 至 `skills-bulu-14-xueshan.md` 的“来源扩展登记”及相关 NXB 遗留；本册实际写回 `sourceChapters` 为 0 项。
- ✅ 确有本门补录者已加入口：清宫／布库、王屋、平西、神龙指向 `skills-bulu-08-luding.md`；万家门指向 `skills-bulu-09-liancheng.md`；华辉、哈萨克指向 `skills-bulu-10-baima.md`。
- ✅ `sk_tiezhang` 不属于本册，未越权修改；采用“神雕残承”的处理建议已移交五绝册。

### 7.2 改标外放清单

- ✅ 新增改标 0 项：本册没有音功或大手印候选。
- ✅ 既有两项 `mv_huagumianzhang_geyi`、`mv_shenlongxinfa_tuxi` 已复核为外放，字段、0 档、三档范围、伤害类型与合法手部端点均闭合。

### 7.3 遗留处理表

| 遗留 | 结果 |
|---|---|
| 九阳神功 `innerGuard.reflectBp` | 不属本册（倚天册），跳过 |
| 武当截脉手·点环跳路线落指端 | 不属本册（道家册），跳过 |
| 29 记绝招段数不在 `design/21` §4.3 建议区间 | ✅ 本册 33 条路线均取建议下限：天阶 10 段、地阶 8 段、玄上 6 段；本册 0 项。碧涛玄功·万里、易筋锻骨篇·脱胎不属本册，跳过 |
| 焚天路线；北冥／小无相／化功／龙象／乾坤攻击绝招路线 | 不属本册，跳过 |
| 康熙索引 `mfr_hongyingjian_tongxin`、`mfr_mufuhujian_sheshen` 与正文不一致 | ✅ 依正文伤害招统一为 `attack`，索引与镜像一致 |
| `mfr_meirensanzhao_feiyan`、`mfr_fuqidaofa_tongxin` 用途核对 | ✅ 原本均为 `attack`，无需改动 |
| 太岳石碑手兼容常长风墓碑 | ✅ `weaponReq.altItems` 已加入 `eq_changchangfengshibei` |
| 条件加成的加法／乘法口径 | ✅ 本册 3 记条件绝招统一为乘法：血刀照雪 `3×0.85×(1+0.15)−0.40`、连城一诀 `3×0.85×(1+0.15)`、夜隙一闪 `3×(1+0.15)=3.45`；后者已由错误的 3.15 修正 |
| 乾隆 §12.5 QL-O08 表格多一格 | 不属本册，跳过 |
| 少林／乾隆／古龙的 `purpose` 不一致 | 不属本册，跳过 |
| 不同武学路线高度相同 | ✅ 差异化 `mfr_shenzhao_huming`、`mfr_xuedaoqinfa_suobi`、`mfr_renfeiyandao_rangfeng`，本册内 ≥80% 重合清零；跨册警告另移交全局任务 |
| 本册未登记穴位 ID | ✅ 全部 128 个不同的 `ap_*` 均在 `design/15` 登记表内，含玄上 9 条显式路线；本册 0 项 |
| 通行／倚天／乾隆的未登记穴位 | 不属本册，跳过 |
| 五绝册降龙十八掌外放审计与统计 | 不属本册，跳过 |
| 过期镜像 | ✅ 康熙册不在题列四册约 100 行过期镜像范围；本次改动路线均同步索引、正文镜像与验收说明 |
| 本册待决追溯 | ✅ D-01、D-04、D-06、KX-P01～03、O-01、O-02 改为“已解决”；D-03 保留“部分解决”；其余开放项未删除 |

### 7.4 出招方式末端规则命中数

- ✅ 改前：`violations=10`、`tail_violations=2`。
- ✅ 改后：`routes=33`、`classified=26`、`checked_rules=21`、`unclassified=7`、`violations=0`、`tail_violations=0`。
- ✅ 修复 12 条：`mfr_hongyingjian_tongxin`、`mfr_mufuhujian_sheshen`、`mfr_wangwuposhi_kaishan`、`mfr_huagumianzhang_huihuan`、`mfr_xuedaofa_cangfeng`、`mfr_tangshijian_huanyun`、`mfr_gaochangshouhu_jieai`、`mfr_gaochangshouhu_qianmen`、`mfr_weixinliandao_lianying`、`mfr_shenlongzhang_yazhen`、`mfr_linyulongdao_zhengxian`、`mfr_renfeiyandao_rangfeng`。

### 7.5 交其他任务

- ✅ 五绝册：`sk_tiezhang → ch03_shendiao` 按残承来源落地；不得扩成第 19 门神雕完整原生天阶。
- ✅ 通行册：`sk_baizhanxinfa → ch12_shujian/ch14_xueshan`，`sk_pojunqiangfa → ch14_xueshan`。
- ⚠️ 全局任务：D-05 的总武学数与十四书界可习得池比例仍须跨册汇总，本册无权单独结案。
- ⚠️ 全仓跨册 ≥80% 警告当前涉及本册 54 对（改前 83 对），其中下列 23 对为 100% 穴位集合重合；待全部 NXfix 合入后由 NAu-final 或专门任务统一区分路线／补叙事理由：
  - `mfr_yunvxinjing_bingxin` ↔ `mfr_meirensanzhao_feiyan`；`mfr_huzhaojuehushou_juehu` ↔ `mfr_shenzhao_xumai`；`mfr_wujixuangongquan_huoshou` ↔ `mfr_ningxue_fengmen`；`mfr_sanhuajudingzhang_juding` ↔ `mfr_ningxue_fengmen`。
  - `mfr_jinyangong_yanhui` ↔ `mfr_xuedaofa_cangfeng`；`mfr_yunvjian_tousuo` ↔ `mfr_huagumianzhang_huihuan`；`mfr_sanwusanbushou_sanbu` ↔ `mfr_shenzhao_xumai`；`mfr_yufengyin_huzhu` ↔ `mfr_meirensanzhao_feiyan`。
  - `mfr_yanzisanchaoshui_sanchao` ↔ `mfr_taiyueshibei_hengpai`；`mfr_duanzhenqiang_pozhen` ↔ `mfr_shenzhao_xumai`；`mfr_baicaobiandu_xiangke` ↔ `mfr_meirensanzhao_feiyan`；`mfr_suogugong_tuofu` ↔ `mfr_shenzhao_xumai`。
  - `mfr_daqiqiang_chongying` ↔ `mfr_shenlongxinfa_zuozhen`；`mfr_ningxue_fengmen` ↔ `mfr_tongrenhenglian_tongrenxiang`；`mfr_shenlongxinfa_zuozhen` ↔ `mfr_hujiadao_fengxue`；`mfr_meirensanzhao_feiyan` ↔ `mfr_jiuyinshenzhao_shounao`。
  - `mfr_shenzhao_xumai` ↔ `mfr_tianlongjian_zhengshou`；`mfr_xuedaojing_yinren` ↔ `mfr_xiangmochu_pojia`；`mfr_manchuqishe_chishe` ↔ `mfr_yiweidujiang_feidu`；`mfr_manchuqishe_chishe` ↔ `mfr_wenjiawuxingzhen_lunzhuan`。
  - `mfr_manchuqishe_chishe` ↔ `mfr_wuxingqizhen_lunzhuan`；`mfr_taiyueshibei_hengpai` ↔ `mfr_hujiadao_humiaohuzhao`；`mfr_taiyueshibei_hengpai` ↔ `mfr_qinlonggong_shuaizhi`。

### 7.6 门禁与写集

- ✅ `check_ids.py --strict`：扫描 111 文件；仅报告既有 baseline `docs/README.md` 的 `sk_babuganchan`，新增严格失败 0。
- ✅ lint 单测 126 项、`damage_sim.py --check` 47 项、`meridian_flow_sim.py --check`、`projection_sim.py --check` 全部通过。
- ✅ `check_skill_catalogs.py --strict --diversity-strict`（本册路径）：错误 0；33 路线／33 序列，完全重复 0，本册内 ≥80% 重合 0。全仓 `--diversity --details` 另有涉及本册的跨册 ≥80% 警告 54 对（改前 83 对），其中 100% 集合重合 23 对；这是 `design/21` §4.3.4 警告，非本册门禁失败。
- ✅ `check_route_unique_for.py`：与全仓其他武学完全同路由 0；`check_undefined_in.py`：未定义引用 0。
- ✅ 未新造 ID；未改动基准、任务清单、脚本、其他图鉴或其他报告；正文未缩短 15% 以上。
- ✅ 复核返修：夜隙一闪倍率、跨册高重合表述与移交、遗留逐条补全、条件算法开放项／同步项、套装计数措辞共 5 项已完成。

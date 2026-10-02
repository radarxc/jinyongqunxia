# DES-items-manuals-expand 报告 · 设计补充 · 武学秘籍名录扩充到 ≥120（AR-30：秘籍太少、封面写书名）

## 1. 摘要（3–6 行）

秘籍名录由 18 项扩为 180 项，原 18 个 ID 保持不变；本轮返修 §2 门派落点、全表外观必填项与报告。
补录中 31 项正文载体与承载关系明确，另 1 项仅经名关系待考；不计待考项仍满足原著明确载体 ≥30。
180 项均显式提供随年代变化的载体、题签、书体、“旧化程度”与“大小”；星宿、逍遥、大理段氏均已明确归属，本任务不出图。
`design/10` 仅改 §10.1.4，§14.2 留给协调者合并。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `docs/design/catalog/items-manuals.md` | 270 | 既有 18；§1 原著明确载体 32；§2 门派 50；§3 通用 80；参考资料、ID、校验、待决 |
| `docs/design/10-items-and-equipment.md` | 2610 | 仅新增 §10.1.4“AR-30 扩充名录登记” |
| `tools/agents/reports/DES-items-manuals-expand.md` | 75 | 计数、载体核对、同步项与自检 |

## 3. 关键结论与数值

| 来源分组 | 既有底表 | 原著明确载体补录 | 门派传承 | 通用谱本 | 合计 |
|---|---:|---:|---:|---:|---:|
| 数量 | 18 | 32 | 50 | 80 | 180 |

| 维度 | 分布 | 核算 |
|---|---|---|
| 品阶 | 天 18；地 44；玄 55；黄 63 | `10%/24.44%/30.56%/35%`；满足天 ≤10%、地约 25%、玄约 30%、黄约 35%；天级只在既有／原著载体组 |
| variant | `full` 65；`copy` 57；`partial` 33；`original` 25 | `65+57+33+25=180`；四类齐全 |
| 年代 | 春秋 8；唐 6；宋 54；元 35；明 48；清 29 | `8+6+54+35+48+29=180`；特殊载体按故事年代投影 |
| ID | 既有底表 18；新增行 162 | 新建 ID 153；复用仓库既有 ID 9；最终 180 个唯一 ID |
| 主要门派 | 任务列举的 18 类全部显式落点 | 少林、武当、峨眉、昆仑、崆峒、华山、丐帮、全真、古墓、逍遥、星宿、明教、日月神教、桃花岛、白驼山、大理段氏、天地会、红花会 |

严格载体核对：以下 31 项状态均为“正文载体及承载关系明确”，不含原创拆卷、后人成册或无实体武学。

- 01–08：葵花宝典—册子；辟邪剑谱—袈裟；北冥神功—帛卷；吸星大法—铁板；圣火令武功—六枚令牌；六脉神剑—焦黄丝绢卷；九阳真经—《楞伽经》夹注；乾坤大挪移—羊皮。
- 09–16：太玄经—二十四石室题壁；罗汉伏魔神功—十八泥人；金蛇秘笈—秘笈；胡家刀法—缺首二页刀谱；唐诗剑法—剑谱；血刀经—逐页图谱经本；无相劫指—指谱；七伤拳—古抄拳谱。
- 17–24：般若掌—古籍；胡青牛医术—手写医书；王难姑毒术—黄纸抄本；紫霞功—题名册子；药王神篇—黄纸书；拈花指—藏经阁钞本；伏魔杖法—一册；大金刚拳—古籍。
- 25–31：摩诃指—古籍；五毒秘传—殷红抄本；笑傲江湖曲—琴箫谱册；天龙门剑法—门派剑谱；九阴真经要旨—古墓石刻；倚天屠龙功—王盘山题壁；武穆遗书—兵书。
- 第 32 项：易筋经—梵文黄纸经本（载体明确）；“易筋经／神足经”经名关系 **（待考）**，不计入上述严格 31 项。

## 4. 开放问题（附默认值）

- `manual_title()` 当前不剥离“原本”“全本”“原刻”“石刻／图解”等后缀；默认出图前扩充规则，未同步前不批量生成。
- 易筋经／神足经经名关系待按三联／广州修订版核对；默认保留 **（待考）**，且不计入严格 31 项。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。AR-30 可在现有 §10 物品规则内落地，不改变基准 §13 天级武学闭集。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/10-items-and-equipment.md` | §14.2 ID 清单 | 加一行“AR-30 秘籍扩充（153）”；完整内容如下。 |

```text
| AR-30 秘籍扩充（153） | `it_miji_baiyuanjianyi_can` `it_miji_baoshangfa` `it_miji_beiming` `it_miji_biandufa` `it_miji_bianshe` `it_miji_biaojuqiangfa_can` `it_miji_biaojurumen` `it_miji_chousuizhang_can` `it_miji_bixie` `it_miji_boruozhang` `it_miji_bubingcao` `it_miji_buzhenrumen` `it_miji_caoshangfei_can` `it_miji_caoyaozhi` `it_miji_changqiangrumen` `it_miji_changquanrumen` `it_miji_chuanyinfa` `it_miji_dagouzhen` `it_miji_dajingangquan` `it_miji_dantianyangqi` `it_miji_diqurumen` `it_miji_duandashou` `it_miji_duanqiangfa` `it_miji_duanzhenqiang` `it_miji_emeirumenjian` `it_miji_emeixinfa` `it_miji_feihuangshi` `it_miji_fengshitoushu` `it_miji_fumozhangfa` `it_miji_gaizhuangfa` `it_miji_ganyebu` `it_miji_gongshou_can` `it_miji_guangmingxinfa` `it_miji_gumuqinggong` `it_miji_gumuxinfa` `it_miji_haifengbu` `it_miji_hengdaorumenzhao` `it_miji_hengshanbeijianfa` `it_miji_honghuahuiheji` `it_miji_honghuaxinfa` `it_miji_huashanjianfa` `it_miji_huifengluoyan` `it_miji_hujiadao_can` `it_miji_qihuangmifa` `it_miji_huweijian` `it_miji_huxixingqi_can` `it_miji_huyuanquan` `it_miji_jianghuchangquan` `it_miji_jianghurumenjian` `it_miji_jianghutuna` `it_miji_jiebiaodaofa` `it_miji_jindingjiushi` `it_miji_jindunxinfa_can` `it_miji_jinguanyusuo` `it_miji_jinshejian` `it_miji_jiuxuefa_can` `it_miji_jiuyang` `it_miji_jiuyinliaoshangpian` `it_miji_jundituna` `it_miji_junwuduandao` `it_miji_junzhangtuna` `it_miji_junzhongdao` `it_miji_kanzhenfa` `it_miji_kongtongrumenquan` `it_miji_kuihua` `it_miji_kunlunrumenjian` `it_miji_kunlunxinfa` `it_miji_kurongchangong` `it_miji_langhuanjian` `it_miji_lianhuanjian` `it_miji_lianhuanqiang` `it_miji_liezhengbu_can` `it_miji_lingshezhangfa` `it_miji_linmotieshi` `it_miji_liumai` `it_miji_liuxingchui` `it_miji_luohanfumo_can` `it_miji_mohezhi` `it_miji_muyangzhang` `it_miji_nianhuazhi` `it_miji_nizhuanjingmai_can` `it_miji_penglairumenquan` `it_miji_piaomiaojian` `it_miji_pingfengjian` `it_miji_qiankun` `it_miji_qimeigun_can` `it_miji_qinlonggong` `it_miji_qishangquan` `it_miji_qishangquan_can` `it_miji_qishirumen_can` `it_miji_quanzhentunajue` `it_miji_riyuexinfa` `it_miji_sanshou` `it_miji_shanyetuna` `it_miji_shaobanggun_can` `it_miji_shaolingunfa` `it_miji_shaolinxinfa` `it_miji_shenghuoling` `it_miji_shenghuotunajue` `it_miji_shiguchong_can` `it_miji_shuhuabifa` `it_miji_songfengjianfa` `it_miji_songshanjianfa` `it_miji_taishanjianfa` `it_miji_taixuan` `it_miji_tangshijian` `it_miji_tanluobu` `it_miji_tantui_tongxing` `it_miji_tantuirumen` `it_miji_taohuazhen` `it_miji_tiandihuidao` `it_miji_tianlongjian` `it_miji_tianwangbuxin` `it_miji_tiebishou` `it_miji_tiexiu` `it_miji_tongbeijin` `it_miji_tongrenhenglian` `it_miji_tongxingfeishi` `it_miji_tunaqianjue` `it_miji_baidubianzheng` `it_miji_wudangchangquan` `it_miji_wudumichuan` `it_miji_wuguandao_can` `it_miji_wuguangun` `it_miji_wuguanxinfa` `it_miji_wuhuduandandao` `it_miji_wulundazhuan` `it_miji_wumuyishu` `it_miji_wuxianduzhang` `it_miji_wuxiangjiezhi` `it_miji_wuxingqizhen` `it_miji_wuyingshou_can` `it_miji_xiaoaojianghuqu` `it_miji_xijiantoubu_can` `it_miji_xingjunbu_can` `it_miji_xingqizhou` `it_miji_xixing` `it_miji_xuedaojing` `it_miji_xunquanshu` `it_miji_yanqingzhang` `it_miji_yanxingbu` `it_miji_yaowangdujing` `it_miji_yijinjing` `it_miji_yingzhaoshou` `it_miji_yitiantulonggong` `it_miji_yueyingshenfa` `it_miji_yuezu_duanjian` `it_miji_yuxiaojianfa` `it_miji_zhamabu` `it_miji_zhenqijian_can` `it_miji_zhuangxingong` `it_miji_zhuzhijianfa` `it_miji_zixiashengong` |
```

| 文档 | 位置 | 改什么 |
|---|---|---|
| `tools/imagegen/gemini_prompt.py` | `manual_title()` | 补剥离“原本／全本”和组合载体后缀；保持题签只写武功本名 |
| `assets/default/prompts/item.md` | §8.2–§8.3 | 将“全部留空／完全无字／空题签”改为秘籍题签唯一允许书名，与 AR-30 一致 |
| 对应 `skills-*.md`、章节投放表 | `learnSources`／奖励节点 | 按需接入新增 ID；未接入者不得生成实例，且不得放宽身份、前置或书界 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- **需作者确认（附默认）**：无新增拍板项；唯一考据项按 §4 默认保留待考，原著明确载体下限不依赖它。
- **下游 `ENG-*` 字段／改动清单**：`ENG-02-models` 扩充 `ItemDef` 内容至 180 项，消费 `id/name/kind/sub/grade/chapters/origin/canonRef/price/flags/assets.icon/text` 与 `extension.manual.{skill,maxLayer,variant,readMul}`，并为地点／装备载体增加 `carrierMode=inventory|location|equipment`、`carrierRef` 或等价互斥字段；`ENG-06-items-world` 生成 180 项内容、禁止 `location/equipment` 投影进入背包／商店／随机掉落；`ENG-07-ui-panels` 展示题签书名与不可携载体的“参悟”交互，不伪造背包实例。
- ✅ 180 在 120–180 范围内；严格原著载体 31（另 1 待考）、门派 50、通用 80；任务列举的 18 类主要门派均有显式落点。
- ✅ 原 18 个 ID 未改；七列齐全；180 个 `skill` 均为既有 `sk_*`，`grade` 与绝对品阶一致。
- ✅ 天级 18（10%）且新增天级仅在原著组；四种 variant 齐全；新增残本 ID 全部 `_can`。
- ✅ 180 条外观均含题签形制／位置、书体及明确“旧化程度／大小”字段，无空白题签、无发光魔法；装帧按春秋、唐、宋、元、明、清分布。
- ✅ 两条指定 lint 与 `git diff --check <基点>` 均退出 0；严格 ID 仅列仓库基线已知告警，没有新增失败。
- ✅ 只改两份负责文档并新增本报告，未改 §14.2，未执行改变仓库状态的 git 命令。
- ⚠️ `manual_title()`、通用提示词、内容生成与地点载体 schema 均超出写权限，已在 §4、§6 与上述 `ENG-*` 清单交接。

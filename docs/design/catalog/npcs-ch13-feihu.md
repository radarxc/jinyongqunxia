# NPC 名录 · 13 飞狐外传

> **归属（基准 §18）**：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。
> **上游**：作者决定与新增需求、`00-canon.md`、`design/18`；游戏定年约 1766–1771，引用 `design/02`。
> **引用而不重定义**：武学见所属图鉴；完整对手配装与七参见 `chapters/13-feihu.md` §12.7；主线窗口见 `story/13-feihu.md` §8。与书剑、雪山复用稳定人物 ID，各书画像、年龄与招募窗口分别配置。
> **标注约定**：游戏补位为**（原创扩展配置）**；原著武学名、师承及出处回目未逐字核对者标**（待考）**；运行验证标**（待实测）**。
> 版本：v1.5；经脉落地终审、完整对手配装与稳定人物 ID 同步（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_hufei` | 胡斐，胡一刀之子 | 青年；生卒待考 | `sect_hujia` | D5 | 商家堡、凤天南与药王庄全链；实战印证 / 胡苗切磋时以非致死 `full` 对手出场 | 主运 `sk_hujiaxuangong`；辅运 `sk_hujiadaoxinfa`、`sk_jianghutuna`；外功 `sk_hujiadao`（本界来源上限 9 重）、`sk_hujiaquan`、`sk_liaodonghushendao`、`sk_hujiaxiaolianquan`；七参与节奏见书界 13 §12.7 | →雪山 | 回目待考：商家堡、佛山、掌门大会 |
| `npc_chenglinsu` | 程灵素，毒手药王关门弟子 | 青年；第 20 章命定死亡 | `sect_yaowangmen` | D5 | 药王庄同门、三线准备与胡斐中毒全链；原著轴 `dead`，条件齐备的唯一主改命轴 `fate_rescued` | `sk_qixinhaitang`、`sk_yaowangdujing`、`sk_yaowangzhenfa`；游戏化名与机制见乾隆图鉴 | 改命后可 → 雪山重逢候选 | 第 20 章：为胡斐解三毒而死；具体动作待指定版本终校 |
| `npc_yuanziyi` | 袁紫衣（圆性），凤天南之女 | 青年；生卒待考 | 佛门 / 多门武艺 | D5 | 复仇、夺掌门与出家誓约 | 主运 `sk_huiwuguixin`；多派外功按现行配装核配 | 否 | 回目待考：佛山、掌门大会 |
| `npc_miaorenfeng` | 苗人凤，打遍天下无敌手 | 中年；生卒待考 | `sect_miaojia` L5 | D5 | 胡苗旧怨、眼伤治疗与女儿保护 | 主运 `sk_miaojiaxuangong`；外功 `sk_miaojiajian`、`sk_miaojiaquan`、`sk_miaojiajiangong`（本界首领配装）；`sk_miaojiazhang` 为苗家 L4 可学掌法，供雪山 B07 画像使用 | →雪山 | 回目待考：中毒失明、与胡斐比试 |
| `npc_tianguinong` | 田归农，天龙门北宗掌门 | 中年；命定死亡待考 | `sect_tianlongmen` L5 | D5 | 胡苗旧怨与南兰线；邪线高背叛 | 主运 `sk_tianlongmenxinfa`；外功以 `sk_tianlongzhengdao` 为核心 | →雪山前史 | 回目待考：苗家变故 |
| `npc_nanlan` | 南兰，苗若兰之母 | 青年 / 中年；命定结局待考 | 苗家 / 田归农关系 | D4 | 选择、悔悟与保护女儿 | 非战斗同伴 | →雪山前史 | 回目待考：离苗家、田归农败亡 |
| `npc_miaoruolan` | 苗若兰，苗人凤之女 | 幼年 / 少女；生卒待考 | `sect_miaojia` | D3（飞狐期） | 儿童保护形态，不进入战斗位 | 非战斗 | →雪山 | 回目待考：苗家人物关系 |
| `npc_pingasi` | 平阿四，胡斐养育者 | 中年；生卒待考 | `sect_hujia` 友方 | D4 | 胡一刀旧事与养育之恩 | 基础刀法 / 生存辅助 | →雪山 | 回目待考：抚养胡斐、讲旧事 |
| `npc_huyidao` | 胡一刀，辽东大侠 | 壮年；胡斐出生时命定死亡 | `sect_hujia` L5 | D5（前史） | 前史仅回忆投影；主体为传承，本界不复活 | 胡家刀法 `sk_hujiadao`；回忆层数不改变玩家本界来源上限 | →雪山回忆 | 回目待考：胡苗决斗 |
| `npc_hufuren` | 胡夫人，胡斐之母 | 青年；命定死亡 | 胡家 | D5（前史） | 仅回忆投影，不另开前史复活分支 | 刀剑基础 / 非战斗辅助 | →雪山回忆 | 回目待考：胡苗决斗后 |
| `npc_machunhua` | 马春花，飞马镖局人物 | 青年；第 19 章命定死亡 | 飞马镖局 | D5 | 商家堡、福康安欺骗与中毒 / 两次救孩链；本版次级改命默认关闭，按 `dead` 结算 | `sk_biaojurumen`、`sk_huyuanquan` **（原创扩展配置）**；京师为非战斗救援形态 | 否；若未来独立立项改命再评估 | 第 15–19 章：中毒、两次救孩与会面后死亡；动作待指定版本终校 |
| `npc_xuzheng` | 徐铮，飞马镖局弟子 | 青壮；命定死亡待考 | 飞马镖局 | D4 | 师门、马春花婚姻与商家堡危机 | `sk_jiebiaodaofa`、`sk_huyuanquan` **（原创扩展配置）**，原著拳械名待考 | 改命后可 | 回目待考：商家堡 |
| `npc_maxingkong` | 马行空，飞马镖局总镖头 | 中老年；命定死亡待考 | 飞马镖局 L5 | D4 | 商家堡旧仇与护镖 | `sk_huweiyingqiang`、`sk_jiebiaodaofa` **（原创扩展配置）**，原著武学名待考 | 改命后可 | 回目待考：商家堡 |
| `npc_shanglaotai` | 商老太，商剑鸣之妻 | 老年；命定死亡待考 | `sect_shangjiabao` | D5 | 复仇、火烧堡与止恶改命 | 主运 `sk_shangjiabaoqi`；外功按八卦 / 商家堡现行配装核配 | 改命后可 | 回目待考：商家堡火劫 |
| `npc_shangbaozhen` | 商宝震，商剑鸣之子 | 青年；命定死亡待考 | `sect_shangjiabao` | D4 | 复仇教育与商家堡逃生 | `sk_baguadao`、`sk_shangjiadao`；配置沿乾隆图鉴，具体家传名目待考 | 改命后可 | 回目待考：商家堡 |
| `npc_fengtianan` | 凤天南，佛山恶霸 | 中年；命定结局待考 | 南海武林 / 官绅 | D5 | 钟家血案问责；邪线短时合作 | 主运 `sk_nanhaiwuhuxinfa`；外功 `sk_wuhudaofa`、`sk_fengjiawuhuquan` | 改命后可 | 回目待考：佛山钟家案 |
| `npc_fengyiming` | 凤一鸣，凤天南之子 | 青年；结局待考 | 凤家 | D4 | 家族罪责、与袁紫衣比武；佛山正线可作非致死 `full` 精英对手 | 主运 `sk_nanhaiwuhuxinfa`；辅运 `sk_wuguanxinfa`、`sk_zhuangxingong`；外功 `sk_wuhudaofa`、`sk_fengjiawuhuquan`、`sk_hutiaodaofa`、`sk_huyuanquan`；书界 13 §12.7 完整对手配装为（原创扩展配置），具体师承待考 | 否 | 回目待考：佛山 |
| `npc_zhongasi` | 钟阿四，佛山乡民 | 中年；命定死亡待考 | 平民 | D4 | 田地霸占与灭门救援 | 非战斗 / 农事 | 改命后可 | 回目待考：胡斐追杀凤天南缘起 |
| `npc_zhongzhaowen` | 钟兆文，钟氏三雄之一 | 青壮；生卒待考 | 江湖人士（门派待考） | D4 | 阻止毒信、误会交手与苗宅守援；误会战以非致死 `full` 精英对手出场 | 主运 `sk_jianghutuna`；辅运 `sk_wuguanxinfa`、`sk_tunaqianjue`；外功 `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_huiliuquan`、`sk_duandashou`；书界 13 §12.7 配装为（原创扩展配置·待补本门武学） | 否 | 回目待考：毒信与苗宅求医段 |
| `npc_zhongzhaoying` | 钟兆英，钟氏三雄之一 | 青壮；生卒待考 | 江湖人士（门派待考） | D4 | 与钟兆文、钟兆能阻止毒信；误会战以非致死 `full` 精英对手出场 | 主运 `sk_jianghutuna`；辅运 `sk_wuguanxinfa`、`sk_tunaqianjue`；外功 `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_huiliuquan`、`sk_duandashou`；书界 13 §12.7 配装为（原创扩展配置·待补本门武学） | 否 | 回目待考：毒信与苗宅守援段 |
| `npc_zhongzhaoneng` | 钟兆能，钟氏三雄之一 | 青壮；生卒待考 | 江湖人士（门派待考） | D4 | 与钟兆文、钟兆英阻止毒信；误会战以非致死 `full` 精英对手出场 | 主运 `sk_jianghutuna`；辅运 `sk_wuguanxinfa`、`sk_tunaqianjue`；外功 `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_huiliuquan`、`sk_duandashou`；书界 13 §12.7 配装为（原创扩展配置·待补本门武学） | 否 | 回目待考：毒信与苗宅守援段 |
| `npc_zhangyunfei` | 张云飞，苗宅来袭者 | 青壮；生卒待考 | 江湖人士（具体师承待考） | D4 | 毒信送达后乘隙来袭；守宅战以非致死 `full` 精英领队出场 | 主运 `sk_jianghutuna`；辅运 `sk_wuguanxinfa`、`sk_tunaqianjue`；外功 `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_huiliuquan`、`sk_duandashou`；书界 13 §12.7 配装为 **（原创扩展配置·待补本门武学）** | 否 | 第 8 章苗宅来袭段；具体师承与动作待指定版本终校 |
| `npc_qinnaizhi` | 秦耐之，福府差使一方武人 | 青壮；生卒待考 | 八极拳支系 / 福府差使（待考） | D4 | 石屋围困中与胡斐非致死比武，停手后说明差使；以 `full` 精英对手出场 | 主运 `sk_bajixingqi`；辅运 `sk_wuguanxinfa`、`sk_bajizhuang`；外功 `sk_bajiquan`、`sk_tieshankao`、`sk_bajirumenquan`；书界 13 §12.7 配装为（原创扩展配置），具体身份与师承待考 | 否 | 回目待考：古怪盗党 / 石屋段 |
| `npc_shiwuchen` | 石万嗔，毒手药王叛徒 | 中老年；命定结局待考 | `sect_yaowangmen` 叛徒 | D5 | 药王庄毒局与程灵素命运 | 主运 `sk_yaowangneigong`；外功以 `sk_yaowanghushoufa` 为核心，毒术按现行配装核配 | 否 | 回目待考：药王庄、三毒相会 |
| `npc_murongjingyue` | 慕容景岳，药王门人物 | 中年；命定结局待考 | `sect_yaowangmen` | D4 | 同门争斗与毒局 | 主运 `sk_yaowangneigong`；外功以 `sk_yaowanghushoufa` 为核心 | 否 | 回目待考：药王庄 |
| `npc_xueque` | 薛鹊，药王门人物 | 青年；命定结局待考 | `sect_yaowangmen` | D4 | 同门争斗与毒局 | 主运 `sk_yaowangneigong`；外功以 `sk_yaowanghushoufa` 为核心 | 否 | 回目待考：药王庄 |
| `npc_fukangan` | 福康安，清廷权臣 | 约 1754–1796（史实；生年待考）[H08] | `sect_qinggong` | D5 | 马春花悲剧、掌门大会与政治线 | 非绝顶武者；护卫 / 权术 | →雪山传闻 | 回目待考：京城、掌门大会 |
| `npc_zhaobanshan` | 赵半山，红花会三当家 | 中老年；生卒待考 | `sect_honghuahui` / `sect_taijimen` | D4 | 书剑曾入队则重逢；调解胡斐与官府线 | `sk_taijimenquan`、`sk_guangpingxinfa`；暗器以 `sk_feihuangshi` 作通行补位 **（原创扩展配置）**，不冒充其独门暗器名 | ←书剑 | 回目待考：与胡斐结交 |
| `npc_chenjialuo` | 陈家洛，红花会总舵主 | 青年；生卒待考 | `sect_honghuahui` L5 | D5 | 大会后经赵半山引荐，在马春花临终安慰段短时同行；事毕离京，不作常驻队友 | 保留本人 `sk_tianchishengong` 与 `sk_baihuacuo`、`sk_paoding` 已学状态；能力合并见章节 §8.3；本界只登记人物出场，不新增玩家完整来源 | ←书剑；限定盟友 | 飞狐大会后与马春花会面；具体动作、身份隐瞒与回目待指定版本终校 |
| `npc_changhezhi` | 常赫志，红花会五当家 | 壮年；生卒待考 | `sect_honghuahui` L4 | D4 | 大会救援窗与 `q_13_bond_06` 中单独完成撤路并同意同行；事毕归会 | `sk_tongbeijin`、`sk_duandashou` 通行补位，协作引用 `sk_honghuahuiheji` **（原创扩展配置）**；黑沙掌确名 / 师承待考，不借铁掌帮同音 ID | ←书剑；独立快照 | 福府两次救孩与大会撤离；动作次序待指定版本终校 |
| `npc_changbozhi` | 常伯志，红花会六当家 | 壮年；生卒待考 | `sect_honghuahui` L4 | D4 | 大会救援窗与 `q_13_bond_06` 中单独完成救援并同意同行；不由兄长代作选择 | `sk_tongbeijin`、`sk_duandashou` 通行补位，协作引用 `sk_honghuahuiheji` **（原创扩展配置）**；黑沙掌确名 / 师承待考 | ←书剑；独立快照 | 福府两次救孩与大会撤离；动作次序待指定版本终校 |
| `npc_dazhichanshi` | 大智禅师，少林方丈 | 老年；生卒待考 | `sect_shaolin` L5 | D4 | 掌门大会后辨是非 | 本门基础摘要引用 `sk_shaolinxinfa`、`sk_luohanquan` **（原创扩展配置）**；仅人物已有武学，不增加飞狐玩家来源 | 否 | 回目待考：天下掌门人大会 |
| `npc_huangxijie` | 黄希节，二郎拳掌门 | 中年；生卒待考 | 掌门大会小派 | D3 | 大会竞技与揭露福康安目的；个人挑战时为非致死 `full` 精英对手 | 主运 `sk_jianghutuna`；辅运 `sk_wuguanxinfa`、`sk_tunaqianjue`；外功 `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_huiliuquan`、`sk_duandashou`；书界 13 §12.7 配装为（原创扩展配置·待补本门武学） | 否 | 回目待考：掌门人大会 |
| `npc_ouyanggongzheng` | 欧阳公政，燕青拳掌门 | 中年；生卒待考 | 掌门大会小派 | D3 | 大会竞技；个人挑战时为非致死 `full` 精英对手 | 主运 `sk_jianghutuna`；辅运 `sk_wuguanxinfa`、`sk_tunaqianjue`；外功 `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_huiliuquan`、`sk_duandashou`；书界 13 §12.7 配装为（原创扩展配置·待补本门武学），不得误用段延庆武学 | 否 | 回目待考：掌门人大会 |
| `npc_nibuda` | 倪不大，倪氏兄弟之一 | 青壮；生卒待考 | 江湖人士（门派待考） | D4 | 第一次抢救双生子失败后由常氏救出；大会散乱后再入福府，须与倪不小共同完成救孩链 | `sk_duandashou`、`sk_tantui_tongxing` 通行补位 **（原创扩展配置）**；本门武学与师承待考 | 否 | 第十七、十九回动作次序待指定版终校 |
| `npc_nibuxiao` | 倪不小，倪氏兄弟之一 | 青壮；生卒待考 | 江湖人士（门派待考） | D4 | 与倪不大、常氏协同行动；第二次救援成功，会合时各抱一子（待考） | `sk_duandashou`、`sk_tantui_tongxing` 通行补位 **（原创扩展配置）**；本门武学与师承待考 | 否 | 第十七、十九回动作次序待指定版终校 |

合计：36 名，即旧 28 人 + NXfixE-c 补录 5 人 + 本轮联动登记 3 人；均为既有稳定 ID，无新人物 ID。能力要点是人物摘要，不能代替 `full` 行动者的完整构筑；凡与玩家实战，仍须通过章节 §12.7 与 `design/21` §11.9 的生产门禁。

### 史实来源

- [H08] 故宫博物院论文采用福康安 1754–1796，故宫人物页仅载“？–1796”；本文将 1754 降为约年并标（生年待考），访问 2026-09-26。小说事件仍依原著，完整链接见主文 §12。

## 本文新增术语与 ID

无新增术语或 ID。陈家洛、常赫志、常伯志复用 `npcs-ch12-shujian.md` 已有 ID；其余五名完整对手沿用 NXfixE-c 登记。

## 数据校验规则与测试用例

- 本表须为 36 个互不重复的 `npc_*`，与 `story/13-feihu.md` §8.1 逐人对应；不能把常氏或倪氏合为一个人物实例。
- 所有武学外键均须命中正式图鉴。非首领补位分别见 `skills-general.md` §5–§7、`skills-qianlong.md`、`skills-shaolin.md`；未核定的原著招名保留（待考），不能按同音字串嫁接门派。
- 胡斐试招与其他完整对手须解析章节 §12.7 的正式主运、七参及来源；回忆人物与非战斗见证者不因存在武学摘要自动加入对手表。
- 书剑联动三人各自读取离队快照，并按 `design/18` §6.5 合并；陈家洛仅限主线窗口，常氏兄弟的关系、装备和伤势互不并集。

## 待决事项 / 依赖

### 替下游给出的建议值

非首领通行武学补位按表中现有 ID 执行，均为**（原创扩展配置）**；不由人物摘要反推玩家新来源或具体原著招名。

### 本文依赖的上游事实

- **已解决：**非首领武学占位已改为正式图鉴 ID；三名书剑人物的飞狐出场已登记（见本表、章节 §8.1–§8.3、剧情 §8.1）。`design/18` 全局人数及 `npcs-ch12-shujian.md` 跨书列仍交归属任务同步。
- 招募、生命态和能力快照依赖 `design/18`，主线命运依赖 `story/13-feihu.md`；非程灵素的次级改命本版关闭，表中历史“改命后可”只保留未来独立立项的条件，不是当前可达重逢入口。

### 对基准的修改提案

无。

### 原著考据待办

沿用各行出处待办；另核对常氏黑沙掌、倪氏兄弟武学、飞马镖局拳械及赵半山暗器原名。默认保留通行补位，不以铁掌帮黑砂掌冒充常氏传承。

### 开放问题（附默认值）

非首领通行补位是否替换为逐字考据确认的本门武学：默认保持表内 ID，考据与图鉴收录完成后同物替换；不得因此降低已登记完整对手的七参。陈家洛默认限定盟友、常氏分别招募，人数总账由 `design/18` 汇总。

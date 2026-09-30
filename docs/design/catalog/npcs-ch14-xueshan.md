# NPC 名录 · 14 雪山飞狐

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。年代 1780，引用 `design/02`。
> 上游：`00-canon.md` v1.8；作者新增需求 AR-18；人物规则见 `design/18`，本书配装见 `design/chapters/14-xueshan.md` §12.6。
> 引用而不重定义：内功性质、调息与路线门槛只读正式武学图鉴；主辅相性见 `design/05` §5；人物武学栏引用章节配装。
> 标注约定：原著没有的内容标**（原创扩展）**，原著事实待核对标**（待考）**，技术事实未联网确认标**（待核实）**，实机 / 实战验证标**（待实测）**，未定数值标**【建议值】**。
> 本书大量前史由山庄众人转述；“活体出现”和“回忆 appearance”必须区分。与《飞狐外传》共用人物 ID。
> 版本：v1.4；经脉落地终审（2026-09-29）；完整对手武学栏同步（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）。

| ID / 槽 | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_hufei` | 胡斐，雪山飞狐 | 壮年；生卒待考；终局生命态依分支 | `sect_hujia` L5 | D5 | 飞狐旧识可重逢；玉笔峰决斗前完成胡苗真相线；`pi` 存活、`bupi` 死亡、`liangquan` 存活 | 主运 `sk_hujiaxuangong`；外功 `sk_hujiadao`、`sk_hujiaquan` 等按书界 14 §12.6 B04 现行配装核配 | ←飞狐 | 第 10 回雪崖举刀留白；三种死亡 / 两全结果均为游戏演绎（原创扩展） |
| `npc_miaorenfeng` | 苗人凤，金面佛 | 中老年；生卒待考；终局生命态依分支 | `sect_miaojia` L5 | D5 | 飞狐重逢、胡氏血书与最终决斗选择；`pi` 死亡、`bupi` 存活、`liangquan` 存活 | 主运 `sk_miaojiaxuangong`；外功 `sk_miaojiajian`、`sk_miaojiazhang` 等按书界 14 §12.6 B07 现行配装核配 | ←飞狐 | 第 10 回雪崖举刀留白；三种死亡 / 两全结果均为游戏演绎（原创扩展） |
| `npc_miaoruolan` | 苗若兰，苗人凤之女 | 青年；生卒待考 | `sect_miaojia` | D5 | 讲述真相、胡斐关系与父女安全 | 非战斗 / 剑法入门待图鉴 | ←飞狐 | 回目待考：山庄听述、结尾悬念 |
| `npc_pingasi` | 平阿四，胡家旧仆 / 胡斐养育者 | 中老年；生卒待考 | `sect_hujia` 友方 | D4 | 飞狐曾入队则重逢；讲清胡一刀往事 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_wuguanxinfa`；外功 `sk_huweiyingqiang`、`sk_tongbeijin`、`sk_luoyedao`、`sk_hutiaodaofa`；书界 14 §12.6 完整对手配装均为（原创扩展配置·待补本门武学） | ←飞狐 | 回目待考：前史叙述 |
| `npc_baoshu` | 宝树和尚（阎基），旧案关键人 | 中老年；结局待考 | 无门派 / 医者伪装 | D5 | 山庄毒局、胡一刀死亡真相；正邪两线 | 主运 `sk_cangfengxingqi`；外功以 `sk_cuomaifanzhang` 为核心，医毒按现行配装核配 | ←飞狐前史 | 回目待考：山庄设局、阎基自白 |
| `npc_huyidao` | 胡一刀，辽东大侠 | 壮年；前史命定死亡 | `sect_hujia` L5 | D5（回忆） | 回忆投影或早年改命结果；1780 不作活体生成 | 胡家刀法待图鉴 | ←飞狐前史 | 回目待考：胡苗决斗回忆 |
| `npc_hufuren` | 胡夫人 | 青年；前史命定死亡 | 胡家 | D5（回忆） | 前史改命结果可改变后世证词 | 刀剑基础 / 非战斗 | ←飞狐前史 | 回目待考：胡苗决斗回忆 |
| `npc_tianguinong` | 田归农，胡苗旧怨关键人 | 中年；主线前已故 | `sect_tianlongmen` L5 | D5（回忆） | 只在回忆 / 史笺；不可 1780 活体招募 | 主运 `sk_tianlongmenxinfa`；外功以 `sk_tianlongzhengdao` 为核心；书界 14 §12.6 B01 / B05 天龙门槽已同步同门正式配装 | ←飞狐前史 | 回目待考：旧案与自尽 |
| `npc_nanlan` | 南兰，苗若兰之母 | 青年；前史命定死亡待考 | 苗家 / 田归农关系 | D5（回忆） | 前史改命可留下后世信件 | 非战斗同伴 | ←飞狐 | 回目待考：旧案回忆 |
| `npc_taobaisui` | 陶百岁，镇关东 | 老年；结局待考 | 饮马川山寨 | D4 | 玉笔峰夺刀、父子与山寨利益 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_wuguanxinfa`；外功 `sk_huweiyingqiang`、`sk_tongbeijin`、`sk_luoyedao`、`sk_hutiaodaofa`；按书界 14 §12.6 完整对手配装核配（原创扩展配置） | 否 | 回目待考：赴玉笔峰 |
| `npc_taozian` | 陶子安，陶百岁之子 | 青年；结局待考 | 饮马川山寨 | D4 | 田青文关系、宝刀争夺与坦白 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_wuguanxinfa`；外功 `sk_huweiyingqiang`、`sk_tongbeijin`、`sk_luoyedao`、`sk_hutiaodaofa`；按书界 14 §12.6 完整对手配装核配（原创扩展配置） | 否 | 回目待考：玉笔峰争刀 |
| `npc_tianqingwen` | 田青文，田归农之女 | 青年；结局待考 | `sect_tianlongmen` 关系 | D5 | 父辈旧案、陶子安关系与山洞抉择 | 主运 `sk_tianlongmenxinfa`；辅运 `sk_guanwaixinfa`、`sk_dantianyangqi`；外功 `sk_tianlonghezongjian`、`sk_tianlongzhengdao`、`sk_tianlongjian`、`sk_tianlongbeidao`；书界 14 §12.6“天龙门五人按遭遇身份唯一映射”：B01 / B05 首领分别用 `7/9, fullTemplate, turns=2/5`，其余实战才用 `7/8, schoolCore, turns=0` | 否 | 回目待考：玉笔峰与宝藏洞 |
| `npc_ruanshizhong` | 阮士中，天龙门北宗人物 | 中年；结局待考 | `sect_tianlongmen` | D4 | 南北宗争执、宝刀与宝藏 | 主运 `sk_tianlongmenxinfa`；辅运 `sk_guanwaixinfa`、`sk_dantianyangqi`；外功 `sk_tianlonghezongjian`、`sk_tianlongzhengdao`、`sk_tianlongjian`、`sk_tianlongbeidao`；按书界 14 §12.6 分身份映射，B01 / B05 首领不得套用普通精英画像 | 否 | 回目待考：山庄混战 |
| `npc_caoyunqi` | 曹云奇，天龙门北宗人物 | 青壮；结局待考 | `sect_tianlongmen` | D4 | 师门与夺宝选择 | 主运 `sk_tianlongmenxinfa`；辅运 `sk_guanwaixinfa`、`sk_dantianyangqi`；外功 `sk_tianlonghezongjian`、`sk_tianlongzhengdao`、`sk_tianlongjian`、`sk_tianlongbeidao`；按书界 14 §12.6 分身份映射，B01 / B05 首领不得套用普通精英画像；坠崖离场不重建实例 | 否 | 回目待考：山庄混战 |
| `npc_yinji` | 殷吉，天龙门南宗人物 | 中年；结局待考 | `sect_tianlongmen` | D4 | 南北宗争执 | 主运 `sk_tianlongmenxinfa`；辅运 `sk_guanwaixinfa`、`sk_dantianyangqi`；外功 `sk_tianlonghezongjian`、`sk_tianlongzhengdao`、`sk_tianlongjian`、`sk_tianlongbeidao`；按书界 14 §12.6 分身份映射，B01 / B05 首领不得套用普通精英画像 | 否 | 回目待考：山庄混战 |
| `npc_zhouyunyang` | 周云阳，田归农一系人物（身份待考） | 青壮；结局待考 | `sect_tianlongmen` 关系 | D3 | 夺宝阵营与证词 | 主运 `sk_tianlongmenxinfa`；辅运 `sk_guanwaixinfa`、`sk_dantianyangqi`；外功 `sk_tianlonghezongjian`、`sk_tianlongzhengdao`、`sk_tianlongjian`、`sk_tianlongbeidao`；身份核定前为（原创扩展配置）；按书界 14 §12.6 分身份映射，B01 / B05 首领不得套用普通精英画像 | 否 | 回目待考：玉笔峰 |
| `npc_liuyuanhe` | 刘元鹤，清廷一等侍卫 | 中年；结局待考 | `sect_qinggong` | D5 | 朝廷夺宝线；可短时同行 | 主运 `sk_baizhanxinfa`；辅运 `sk_jundituna`、`sk_junzhangtuna`；外功 `sk_pojunqiangfa`、`sk_junzhongdao`、`sk_zhenqijian`、`sk_bianshe`；按书界 14 §12.6 核配 | 否 | 回目待考：玉笔峰争刀 |
| `npc_duximeng` | 杜希孟，玉笔山庄主人 | 中老年；结局待考 | 玉笔山庄 | D4 | 邀集群雄的目的、庄中机关 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_wuguanxinfa`；外功 `sk_huweiyingqiang`、`sk_tongbeijin`、`sk_qingfengjian`、`sk_duandashou`；书界 14 §12.6 配装均为（原创扩展配置·待补本门武学） | 否 | 回目待考：玉笔山庄设宴 |
| `npc_xiongyuanxian` | 熊元献，平通镖局总镖头 | 中年；结局待考 | 平通镖局 | D4 | 镖局名誉与宝刀争夺 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_zhuangxingong`；外功 `sk_sihaibiaodao`、`sk_huweiyingqiang`、`sk_jiebiaodaofa`、`sk_huyuanquan`；按书界 14 §12.6 核配（原创扩展配置） | 否 | 回目待考：赴玉笔峰 |
| `npc_zhengsanniang` | 郑三娘，双刀 | 中年；结局待考 | 平通镖局关系 | D4 | 山寨冲突与旧怨 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_zhuangxingong`；外功 `sk_sihaibiaodao`、`sk_huweiyingqiang`、`sk_jiebiaodaofa`、`sk_luoyedao`；按书界 14 §12.6 核配（原创扩展配置），第四门只用 `ALL14` 通行刀法，具体双刀待考 | 否 | 回目待考：玉笔峰路上 |
| `npc_jingzhidashi` | 静智大师，佛门人物 | 老年；结局待考 | 佛门（寺属待考） | D4 | 山庄止争或夺宝立场 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_dantianyangqi`；外功 `sk_tongbeijin`、`sk_qingfengjian`、`sk_taizuchangquan`、`sk_jianghurumenjian`；书界 14 §12.6 配装均为（原创扩展配置·待补本门武学），不冒认少林师承 | 否 | 回目待考：玉笔峰群雄 |
| `npc_saizongguan` | 赛总管，清廷侍卫总管 | 中年；结局待考 | `sect_qinggong` | D5 | 清廷任务与刘元鹤关系 | 主运 `sk_baizhanxinfa`；外功以 `sk_pojunqiangfa` 为核心，余按军伍现行配装核配 | 否 | 回目待考：玉笔峰 |
| `npc_fanbangzhu` | 范帮主，胡苗田范四家后人 / 帮主（身份待考） | 中老年；结局待考 | 帮会待考 | D4 | 四家旧怨的范氏证词 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_jianghutuna`、`sk_wuguanxinfa`；外功 `sk_tongbeijin`、`sk_qingfengjian`、`sk_luoyedao`、`sk_duandashou`；书界 14 §12.6 配装均为（原创扩展配置·待补本门武学） | 否 | 回目待考：旧事叙述 |
| 于管家槽（不建静态 ID） | 玉笔山庄于姓管家 | 中年 | 玉笔山庄 | D2 | 山庄动线与密室线索 | 非战斗 / 设施模板 | 否 | 回目待考：山庄接待 |
| 左右书僮槽（不建静态 ID） | 胡斐随行书僮二人 | 少年 / 青年 | 胡家 | D4（B02 精英） | 登峰前后负责传讯与照料；B02 受追兵逼迫时两人分别作为精英参战，战败只退出战斗、不擅定死亡 | 各自主运 `sk_hujiaxuangong`；胡家外功按书界 14 §12.6 B02 现行配装核配；两实例共享非击杀目标进度 | 否 | 回目待考：胡斐登峰前后；战斗身份与离场结算以书界 14 §12.4、§12.6 为准 |

合计：23 名具名人物 + 2 类原著职能槽 = 25 个主线生产槽。

AR-18 配装同步：胡斐与左右书僮仍沿章节 §12.6 原配装，默认接受该节“AR-18 配装相性复核”登记的阴阳相冲；苗人凤主运苗家玄功仍为调和，不能随苗家心法改阴。宝树三阴同源与其余人物辅运贡献变化也读取同节。上述均为**（原创扩展配置）**，本名录不复制性质字段或七参数值。

## 本文新增术语与 ID

无新增；复用原有人物、武学与章节引用。

## 数据校验规则与测试用例

人物武学栏逐项对齐章节 §12.6；胡斐、双童相冲及宝树三阴同源按该节执行，不能以静态节奏值替代固定 RNG 回放 **（待实测）**。本次未更换任何武学 ID，23 名具名人物与 2 类职能槽数量不变。

## 待决事项 / 依赖

### 替下游给出的建议值

无新增数值；配装与节奏只引用章节 §12.6。

### 本文依赖的上游事实

**已解决：**人物武学引用与当前图鉴及章节 §12.6 的 AR-18 相性复核一致；完整战斗回放仍待实测。

### 对基准的修改提案

无新增提案。

### 原著考据待办

保留上表全部生卒、身份、武学与回目待考项；本次性质同步不新增原著事实。

### 开放问题（附默认值）

胡斐和左右书僮的相冲配装需作者确认；默认保留并接受章节 §12.6 所列代价，确认事项归该章文末“AR-18 配装”。

# NPC 名录 · 01 天龙八部

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据；本文只列人物画像。
> 上游：`00-canon.md` v1.8；`decisions/author-requirements.md`（含 AR-18）与 `decisions/author-decisions.md`；`decisions/rulings-v1.md`；`design/18`。
> 引用而不重定义：招募与人物规则见 `design/18`；武学性质见正式图鉴及 `design/05`；配装、七参与节奏见 `chapters/01-tianlong.md` §12.8；主线见 `story/01-tianlong.md`。
> 年代：1093–1094，引用 `design/02`；人物生卒多为小说未明，按年龄段或（待考）登记。
> 标注约定：出处均以三联 / 广州修订版为基线；未逐字核对回目号者明确写“回目待考”，不编造编号；玩法扩展标**（原创扩展）**，技术事实未确认标**（待核实）**，真机 / 真账号验证标**（待实测）**，依赖上游的临时数值标**【建议值】**。
> 版本：v1.4；全局审计（2026-09-26）；经脉落地终审（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。
> 首领配装同步：已解决：段延庆、萧峰、童姥、游坦之、玄慈的主运 / 外功以及游骥、游驹的配装引用均已与 `chapters/01-tianlong.md` §12.8 同步；本轮补齐慕容博少林旁学的既有外功 ID。游氏二人当前同源主运仅 5 品，低于手配精英 `G−1=6`，正式生产须按章节所列缺口阻断。
> AR-18 同步：能力栏原为纯 ID 引用，没有旧性质字段。游骥 / 游驹的呼吸行气现为阴，默认保留阳主运及原辅运，接受相冲；童姥的生死符仍为阴，与阳主运的负相性及路线准入问题一并见章节 §12.8.2。调息档案只读图鉴，不叠加未获辅运许可的档案。
> 能力引用边界：下列非首领能力已按 `skills-xiaoyao` §2 / §5 / §8–§12、`skills-wujue` §2 及 `skills-general` §7–§8 补齐既有 ID。通行防身与医毒配置标**（原创扩展）**，不据此反推原著所学、自动开放授艺，或替代生产 `full` 面板；人物能力边界见 `design/18`，闪电貂只引用 `design/10` 的既有奇物接口。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_xiaofeng` | 萧峰（乔峰），丐帮前帮主、辽南院大王 | ?–1094（推算；卒年随雁门关结局） | `sect_gaibang` / `sect_qidan` | D5 | 聚贤庄与雁门关之间的短时同行；改命线可救回 | 主运 `sk_xianglongxinggong`；外功 `sk_xianglong18`、`sk_qinlonggong` | 死亡 / 改命回响 | 回目待考：身世、聚贤庄、雁门关 |
| `npc_duanyu` | 段誉，大理镇南王世子 | 青年；卒年待考 | `sect_dali` | D5 | 大理线相识，尊重王语嫣与家国选择 | `sk_beiming`、`sk_lingbo`、`sk_liumai` | 可留传承 | 回目待考：无量山至大理归国 |
| `npc_xuzhu` | 虚竹，少林僧、灵鹫宫主 | 青年；卒年待考 | `sect_shaolin` / `sect_lingjiu` | D5 | 珍珑、灵鹫宫责任与品德门槛 | `sk_xiaowuxiang`、`sk_bahuang`、`sk_liuyangzhang` | 可留传承 | 回目待考：珍珑棋局、灵鹫宫 |
| `npc_wangyuyan` | 王语嫣，武学见闻渊博 | 青年；生卒待考 | 姑苏王氏 / `sect_murong` 关系 | D4 | 曼陀山庄脱困；不得把情感选择物化为好感门槛 | `full` 见闻支援型，默认不配置主动武学；临阵指点见 `skills-xiaoyao` §5.4 与 `design/18` | 否 | 回目待考：曼陀山庄、江南同行 |
| `npc_azhu` | 阿朱，慕容家侍女、萧峰知己 | ?–1093/1094（推算，命定死亡） | `sect_murong` | D5 | 易容与查身世任务；小镜湖前可改命 | `sk_yirongshu`；`pers_jinshen` | 改命后可 | 回目待考：少林易容、小镜湖 |
| `npc_azi` | 阿紫，星宿弟子 | 少女；卒年随分支待考 | `sect_xingxiu` | D4 | 品德偏低或完成戒毒 / 姐妹线；高背叛风险 | `sk_huagong` 等星宿已收录项 | 否 | 回目待考：小镜湖、辽国 |
| `npc_murongfu` | 慕容复，姑苏慕容家主 | 青壮；卒年待考 | `sect_murong` | D5 | 复国线与放下线互斥；可正邪两路同行 | `sk_douzhuan`、`sk_murongjian` | 否 | 回目待考：还施水阁、少室山 |
| `npc_murongbo` | 慕容博，复国谋主 | 老年；卒年待考 | `sect_murong` | D5 | 少室山真相后仅改命 / 悔悟窗口 | 主运 `sk_douzhuan`；外功 `sk_canhezhi`、`sk_nianhuazhi`、`sk_wuxiangjiezhi`、`sk_ranmudaofa`、`sk_murongjian`；配装见章节 §12.8 | 否 | 回目待考：藏经阁真相 |
| `npc_jiumozhi` | 鸠摩智，吐蕃国师 | 壮年；卒年待考 | `sect_mizong` | D5 | 天龙寺 / 曼陀山庄冲突；散功醒悟后窗口 | `sk_huoyandao`、`sk_xiaowuxiang` | 否 | 回目待考：天龙寺、枯井散功 |
| `npc_duanzhengchun` | 段正淳，大理镇南王 | 壮年；?–1094（推算，命定死亡） | `sect_dali` | D5 | 大理政务 + 诸段关系线；小镜湖后改命 | `sk_yiyangzhi` | 改命后可 | 回目待考：大理王府、小镜湖 |
| `npc_daobaifeng` | 刀白凤，镇南王妃 | 壮年；命定结局待考 | `sect_dali` | D4 | 身世秘密与王府线；不可用送礼越过 | 通行防身 `sk_sanshou` **（原创扩展）**；原著器械与招式名见文末考据待办 | 改命后可 | 回目待考：玉虚观、段誉身世 |
| `npc_duanyanqing` | 段延庆，四大恶人之首 | 中老年；卒年待考 | `sect_sidaeren` / 大理皇族 | D5 | 身世真相、段誉选择与邪线限定 | 主运 `sk_duanshiyangjue`；外功 `sk_yiyangzhi` | 否 | 回目待考：万劫谷、少室山 |
| `npc_yuelaosan` | 岳老三（南海鳄神） | 壮年；命定死亡待考 | `sect_sidaeren` | D4 | 守诺与师徒喜剧线；死亡前改命窗口 | `sk_ezuijian`、`sk_eweibian`、`sk_niujingshou`；招式与机制 **（原创扩展）** | 改命后可 | 回目待考：万劫谷、救段誉 |
| `npc_yunzhonghe` | 云中鹤，四大恶人 | 壮年；卒年待考 | `sect_sidaeren` | D4 | 邪线、严格品德代价；犯罪行为不可洗白 | 轻功 `sk_hexiangbu`、`sk_yeyingbu` **（原创扩展）** | 否 | 回目待考：万劫谷等 |
| `npc_yeerniang` | 叶二娘，四大恶人 | 中年；命定死亡待考 | `sect_sidaeren` | D5 | 虚竹身世与赎罪分支 | `sk_xuehendao`、`sk_duanmaidao`、`sk_baodaoduanfa`；薄刀武学 **（原创扩展）** | 改命后可 | 回目待考：少室山认子 |
| `npc_dingchunqiu` | 丁春秋，星宿派掌门 | 老年；卒年待考 | `sect_xingxiu` | D5 | 邪线可同行；正线需废功 / 受制窗口 | `sk_huagong`、`sk_sanxiaoxiaoyaosan` | 否 | 回目待考：擂鼓山、少室山 |
| `npc_wuyazi` | 无崖子，逍遥派掌门 | 高龄；命定死亡待考 | `sect_xiaoyao` | D5 | 珍珑前短时 / 精神同行；改命须处理传功 | `sk_beiming`、`sk_xiaowuxiang` | 传承 | 回目待考：擂鼓山传功 |
| `npc_tonglao` | 天山童姥，灵鹫宫主 | 高龄；命定死亡待考 | `sect_lingjiu` | D5 | 三十六洞危机与返老阶段窗口 | 主运 `sk_tianshanliuyangxinfa`；辅运 `sk_zuowangxinfa`、`sk_lingjiuxinfa`；外功 `sk_liuyangzhang`、`sk_zhemei`、`sk_shengsifu`、`sk_piaomiaojian` | 传承 / 改命 | 回目待考：西夏冰窖 |
| `npc_liqiushui` | 李秋水，西夏太妃 | 高龄；命定死亡待考 | `sect_xiaoyao` / `sect_yipintang` | D5 | 与童姥互斥后再和解；西夏身份限制 | `sk_xiaowuxiang`、`sk_baihongzhang` | 传承 / 改命 | 回目待考：冰窖相斗 |
| `npc_suxinghe` | 苏星河，聪辩先生 | 中老年；卒年待考 | `sect_xiaoyao` | D4 | 解珍珑外围谜题并保护函谷门人 | `sk_zuowangxinfa`、`sk_qipingshou`、`sk_xiaoyaobu` **（原创扩展）**；棋艺按 `design/03` | 否 | 回目待考：擂鼓山 |
| `npc_xuemuhua` | 薛慕华，阎王敌 | 中年；卒年待考 | `sect_xiaoyao` | D4 | 聚贤庄救治抉择、医者责任 | `pers_yizhe`；`sk_qihuangmifa`、`sk_tuinaliaofa`（医术配置 **（原创扩展）**） | 否 | 回目待考：聚贤庄救阿朱 |
| `npc_youtanzhi` | 游坦之，聚贤庄少主 | 青年；命定死亡待考 | `sect_juxianzhuang` / 星宿关系 | D4 | 阿紫线与自我选择；避免纯工具化 | 主运 `sk_yijinjing`；外功 `sk_bingcanduzhang`、`sk_youshishuangqiang`、`sk_shuangxiongdundao`、`sk_zhuangkequan` | 改命后可 | 回目待考：冰蚕、少室山 |
| `npc_youji` | 游骥，聚贤庄主之一 | 中年；命定死亡待考 | `sect_juxianzhuang` | D4 | 英雄宴前调停 / 改命 | `full`；主运 `sk_juxianyijue`；辅运 `sk_dantianyangqi`、`sk_huxixingqi`；外功 `sk_youshishuangqiang`、`sk_shuangxiongdundao`、`sk_youjiaduanqiang`、`sk_zhuangkequan`；主运品阶缺口见章节 §12.8.1 | 改命后可 | 回目待考：聚贤庄英雄宴 |
| `npc_youju` | 游驹，聚贤庄主之一 | 中年；命定死亡待考 | `sect_juxianzhuang` | D4 | 与游骥共享危机但各自招募状态 | `full`；主运 `sk_juxianyijue`；辅运 `sk_dantianyangqi`、`sk_huxixingqi`；外功 `sk_shuangxiongdundao`、`sk_youjiadao`、`sk_hengdaorumenzhao`、`sk_zhuangkequan`；主运品阶缺口见章节 §12.8.1 | 改命后可 | 回目待考：聚贤庄英雄宴 |
| `npc_xuanci` | 玄慈，少林方丈 | 老年；命定死亡待考 | `sect_shaolin` L5 | D5 | 带头大哥真相与寺规承担 | 主运 `sk_jinzhongzhao`；外功 `sk_nianhuazhi`、`sk_boruozhang`、`sk_dajingangquan`、`sk_longzhaoshou`、`sk_luohanquan` | 改命后可 | 回目待考：少室山身世揭晓 |
| `npc_saodiseng` | 扫地僧，藏经阁无名高僧 | 耄耋；生卒不详 | `sect_shaolin` | D5 | 藏经阁止斗后短时同行 / 结盟 | `sk_yijinjing`（玩法配置 **（原创扩展）**，原著功法名 **（待考）**） | 否 | 回目待考：藏经阁止息慕容萧氏 |
| `npc_abi` | 阿碧，慕容家侍女 | 青年；卒年待考 | `sect_murong` | D3 | 琴韵小筑、忠诚与慕容复结局 | `sk_shuixiefeidao`、`sk_qinyunbu` **（原创扩展）**；乐理 / 水路辅助见 `design/03` / `design/18` | 否 | 回目待考：琴韵小筑、结局陪伴 |
| `npc_muwanqing` | 木婉清，修罗刀传人 | 青年；卒年待考 | 秦红棉一系 | D4 | 大理身世与誓言冲突 | 通行防身 `sk_hengdaorumenzhao` **（原创扩展）**；原著箭术与器械规格见文末考据待办 | 否 | 回目待考：无量山后、大理身世 |
| `npc_zhongling` | 钟灵，万劫谷少女 | 少女；卒年待考 | 万劫谷 / 神农帮关系 | D4 | 闪电貂救援、父母关系线 | 毒抗支援 `sk_biandufa` **（原创扩展）**；驭兽伙伴只引用 `it_shandiandiao`，见章节 §8.2 / §9.4 | 否 | 回目待考：无量山、万劫谷 |
| `npc_kurong` | 枯荣大师，天龙寺高僧 | 老年；卒年待考 | `sect_tianlongsi` L5 | D4 | 保经护寺、段氏身份或高声望 | `sk_liumai`、`sk_yiyangzhi` | 传承 | 回目待考：天龙寺护经 |
| `npc_duanzhengming` | 段正明（保定帝），大理国主 | 中年；生卒待考 | `sect_dali` L5 | D5 | 天龙寺危机与段氏家国线；只在国事许可的短窗同行 | `sk_yiyangzhi`；六脉传承按图鉴门槛 | 否 | 回目待考：大理救援、天龙寺护经 |
| `npc_xiaoyuanshan` | 萧远山，萧峰生父 | 老年；卒年待考 | 契丹 / 少室山旧案 | D5 | 雁门旧案与藏经阁对质后开放悔悟短窗 | `sk_heiyiqianzong`、`sk_tuxiongbohuquan`（玩法配置 **（原创扩展）**）；少林旁学的逐门原著证据见文末考据待办 | 否 | 回目待考：雁门旧案、藏经阁对质 |
| `npc_baobutong` | 包不同，慕容家臣 | 中年；卒年待考 | `sect_murong` L4 | D4 | 燕子坞立场与复国取舍；须取得本人认可 | `sk_longchengxinfa`、`sk_feiyefeiye`、`sk_yanzixing` **（原创扩展）** | 否 | 回目待考：江南同行、少室山 |
| `npc_fengboe` | 风波恶，慕容家臣 | 中年；卒年待考 | `sect_murong` L4 | D4 | 切磋、追击与慕容家路线；败而不辱后可同行 | `sk_longchengxinfa`、`sk_yizhenfengdao`、`sk_yanzixing` **（原创扩展）** | 否 | 回目待考：江南诸役 |
| `npc_dengbaichuan` | 邓百川，慕容家臣 | 中年；卒年待考 | `sect_murong` L4 | D4 | 燕子坞组织线与复国资源取舍 | `sk_longchengxinfa`、`sk_yanmenzhang`、`sk_yanzixing` **（原创扩展）** | 否 | 回目待考：燕子坞、少室山 |
| `npc_zuozimu` | 左子穆，无量剑东宗人物 | 中年；生卒待考 | `sect_wuliang` | D4 | 无量山冲突停战、门人安全与玉壁秘密 | `sk_wuliangxinfa`、`sk_wuliangjian`、`sk_dongzongjian`；心法与分宗招式 **（原创扩展）** | 否 | 回目待考：无量剑比斗 |
| `npc_xinshuangqing` | 辛双清，无量剑西宗人物 | 中年；生卒待考 | `sect_wuliang` | D4 | 无量山两宗证词、受困门人救援与停战 | `sk_wuliangxinfa`、`sk_wuliangjian`、`sk_xizongjian`；心法与分宗招式 **（原创扩展）** | 否 | 回目待考：无量剑比斗 |
| `npc_baishijing` | 白世镜，丐帮执法长老 | 中年；命定结局待考 | `sect_gaibang` L4 | D5 | 马大元旧案揭露前的邪线短窗；事败后按生死状态处理 | `sk_suohouqinnashou`，见 `skills-wujue` §2.5 | 否 | 回目待考：杏子林、马大元旧案 |
| `npc_kangmin` | 康敏（马夫人），马大元遗孀；杏子林旧案相关人物 | 成年成熟；确龄、生卒待考；本像取毁容死亡前 | 丐帮关系人；不据婚姻授门派职级 | 剧情画像；玩法层级待配置 | 待 design/18 归属流程配置；本次仅画像 | 未配置；不据肖像新增武学或器物 | 未配置 | 既有 story/01 §8.3 中文剧情；2026-10-02 用户新增静态画像范围；原著细节待纸本核对 |
| `npc_wuchangfeng` | 吴长风，丐帮长老 | 中老年；生卒待考 | `sect_gaibang` L4 | D4 | 杏子林立场、帮务贡献与长老许可 | `sk_guitoudaofa` **（原创扩展命名）**，见 `skills-wujue` §2.5 | 否 | 回目待考：杏子林、少室山 |
| `npc_sikongxuan` | 司空玄，神农帮帮主 | 中年；命定结局待考 | `sect_shennong` | D4 | 无量山毒伤与生死符危机；解毒或解符后开放 | `sk_changbaicaogong`、`sk_duanchangsan`、`sk_shennongyaochu`；心法与药锄招式 **（原创扩展）** | 否 | 回目待考：无量山神农帮 |

合计：41 名。

## 本文新增术语与 ID

2026-10-02 按用户明确新增画像范围登记 `npc_kangmin`（康敏／马夫人），只补静态人物身份与基础立绘索引；生命周期、招募、能力及运行数据仍归 `design/18` 配置，不把画像就绪冒充生产人物面板。

能力栏内功及其他武学均沿用正式图鉴外键；本轮新增引用的 `sect_shennong`、`it_shandiandiao` 分别复用 `design/17` §9.10 与 `design/10` 的正式定义。本文不复制性质定义、调息档案或章节配装表。

## 数据校验规则与测试用例

- 逐行解析能力栏武学外键；内功性质及 `BreathProfile.nature` 取当前图鉴，不能沿用 AR-18 前缓存。
- 游氏呼吸行气改阴后，主运仍是阳性聚贤义诀；相冲、贡献与生产品阶缺口按章节 §12.8.1–§12.8.2 校验，不得因本名录只列 ID 而漏算。
- 童姥已学 / 配装生死符不等于路线准入已验证；以章节 §12.8.2 的开放问题跟踪，不在人物栏重定义许可。
- 前轮 AR-18 引用审计与五项工具检查结果见 `tools/agents/reports/NR4S-01.md` §7；具名战斗仍需固定 RNG 回放 **（待实测）**。
- 非首领能力栏只引用图鉴已存在且具天龙 / `ALL14` 来源的 ID；王语嫣的见闻支援不因 `full` 标记而自动生成攻击武学。配置中的**（原创扩展）**不能转换为原著所学证据或默认授艺来源。
- 游氏主运不足仍按 `TS-CONTENT-BOSS-021` 阻断；本轮新增引用不得覆盖章节既定七参与 `estimateOnly=true` 边界。2026-09-30 终审检查见 `tools/agents/reports/NAuF-book-01.md` §7。

## 待决事项 / 依赖

### 替下游给出的建议值

无新增数值。相冲配装、辅运贡献及静态节奏沿用章节 §12.8.2；不能由主运层数推定辅运层数。

### 本文依赖的上游事实

已解决：NR4S-01 已核对当时本名录所引 15 门内功的 AR-18 性质与调息性质，主运性质未变；见章节 §12.8.2 与 `tools/agents/reports/NR4S-01.md` §7.1。本轮新增内功引用仍只读图鉴，不新增配装性质镜像。游氏主运 5 品低于手配精英目标 6 品的既有缺口仍未解决，见章节 §12.8.1 / TL-O15。

已解决：非首领旧“待图鉴 / 待核配”能力栏已按当前图鉴替换为正式引用或明确的见闻支援；司空玄旧组织待裁定项已改用 `sect_shennong`，见 `design/17` §9.10。新增引用仅补能力索引，生产面板、辅运层数、人物 `wil` 与固定 RNG 回放仍按章节 §12.8 的依赖推进。

### 对基准的修改提案

无新增提案；采用 Canon v1.8 与 `design/05` / `design/21` 的现行归属。

### 原著考据待办

保留表内全部生卒、年龄及“回目待考”条目；本轮没有新增或核实原著事实。阴阳分类及首领配装属于**（原创扩展）**，不能据此反推原著所学。

- **（待考）**：核《天龙八部》三联 / 广州修订版玉虚观 / 大理身世相关段落中刀白凤的器械与招式；无量山后 / 曼陀相关段落中木婉清的箭术、兵刃与招名。默认仅使用表内通行防身配置，不赋未登记的个人绝学。
- **（待考）**：核《天龙八部》藏经阁对质段中萧远山所用少林绝技，以及扫地僧是否明确自报功法名。默认保留已标**（原创扩展）**的玩法引用，不把偷学或高深修为概括转成具体原著所学清单。

### 开放问题（附默认值）

- 需作者确认游氏兄弟是否保留相冲配装：默认保留，接受章节 §12.8.2 的完整代价；原主运品阶不足的生产阻断继续有效。
- 需作者 / 归属系统明确童姥阳主运使用阴性生死符的路线准入：默认保留配装和负相性，不在本名录扩宽 `requiredNature`，未澄清前不签出为已验证生产行动。
- 需作者确认是否在天龙补录图鉴增加可共享、同源且 ≥6 品的聚贤庄 / 中原内功：默认维持游骥 / 游驹 `sk_juxianyijue` 的 5 品事实及 `TS-CONTENT-BOSS-021` 阻断，见章节 TL-O15；相冲配装是否保留与该品阶缺口分开审议。
- 刀白凤、木婉清、薛慕华、钟灵的通行防身 / 医毒能力映射采用表内**（原创扩展）**默认；如后续原著考据或正式图鉴提供更贴合的同源卡，再由图鉴与人物数据同步替换，不在本名录新造武学 ID。

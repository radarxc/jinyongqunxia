# NPC 名录 · 04 倚天屠龙记

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。主体年代 1336–1363、楔子约 1262，引用 `design/02`。
> 上游：作者决定 / 新增需求、基准、`design/18`；本界遭遇与配装见 `chapters/04-yitian.md` §12.5。
> 引用而不重定义：武学定义、学习来源与路线归各 `skills-*` 图鉴；“能力要点”不是完整装备栏或新增授艺来源，见闻 / 译读协助不生成已学层数。
> 标注约定：史实人物与小说人物分开；无原著授受证据的选配标（原创扩展配置），原著事实未逐字核对标（待考）。出处以三联 / 广州修订版为基线。
> 版本：v1.4；全局审计（2026-09-26）；经脉落地终审（2026-09-29）；NXfixD-04 首领武学同步复核（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_zhangwuji` | 张无忌，明教教主 | 青年；生卒待考 | `sect_mingjiao` L5 / 武当渊源 | D5 | 光明顶后开放；赵敏 / 周芷若等选择与退隐窗口 | `sk_jiuyang`、`sk_qiankun`、`sk_shenghuoling` | 否 | 回目待考：冰火岛身世、光明顶、退隐 |
| `npc_zhaomin` | 赵敏，汝阳王府郡主 | 青年；生卒待考 | `sect_ruyangwangfu` | D5 | 正邪线多次互信选择；离元廷后可长期同行 | `sk_qiankun`、`sk_jindingjiushi` 见闻；后者所学峨眉剑招的情节见 `skills-yitian` §4.4（待考），见闻不自动解除门派学习门槛 | 否 | 回目待考：绿柳庄、万安寺、濠州 |
| `npc_zhouzhiruo` | 周芷若，峨眉弟子 / 掌门 | 青年；生卒待考 | `sect_emei` L3→L5 | D5 | 汉水旧缘、师命、刀剑秘密与悔悟线 | 主运 `sk_jiuyin`；外功 `sk_jiuyinbaigu`、`sk_baimangbianfa`、`sk_miejuejian`、`sk_jindingjiushi`、`sk_piaoxuechuanyunzhang` | 否 | 回目待考：汉水、灵蛇岛、屠狮大会 |
| `npc_xiaozhao` | 小昭，明教总教圣女继承者 | 少女；生卒待考 | `sect_mingjiao` / 波斯总教 | D5 | 光明顶同行；灵蛇岛后受总教责任限制 | `sk_qiankun` 译读协助；`sk_shenghuoling` 刻文见闻，不据此生成已学层数 | 否 | 回目待考：光明顶密道、灵蛇岛 |
| `npc_daiqisi` | 黛绮丝（金花婆婆 / 紫衫龙王） | 中年；生卒待考 | `sect_mingjiao` / 波斯总教 | D5 | 蝴蝶谷与灵蛇岛身份线；解开总教追责后可限定同行 | 主运 `sk_mingjiaohujiaogong`；外功 `sk_dajiutianshou`、`sk_jinhuazhangfa`、`sk_jinhuabiaofa`、`sk_lieyanzhang` | 否 | 回目待考：蝴蝶谷、灵蛇岛与身份揭露 |
| `npc_yinli` | 殷离（蛛儿），天鹰教外孙女 | 少女；卒年待考 | `sect_tianyingjiao` | D4 | 蝴蝶谷救助与身份相认；毁容不作能力惩罚 | `sk_tianyingrumenquan` 作基础战斗能力（原创扩展配置）；毒功仅保留剧情画像，缺卡与默认见文末依赖 | 否 | 回目待考：蝴蝶谷、灵蛇岛 |
| `npc_zhangsanfeng` | 张三丰，武当开山祖师 | 高龄；小说生卒待考 | `sect_wudang` L5 | D5 | 神雕曾结识者按 `chapters/04-yitian.md` §8.5 重逢；门派危机 / 余韵试炼限定同行，不长期离观 | `sk_taijiquan`、`sk_taijijian`、`sk_chunyangwuji` | ←神雕 | 回目待考：楔子、百岁寿宴、太极初传 |
| `npc_zhangcuishan` | 张翠山，武当五侠 | 壮年；命定死亡 | `sect_wudang` L3 | D5 | 冰火岛归来至寿宴短窗；仅 `fate_04=saved_parents` 后完成守约期可再邀请，原著线永久锁定，见 `chapters/04-yitian.md` §8.3 | `sk_yitiantulonggong`；定义与来源见 `skills-daojia` §5.4 | 改命后可 | 回目待考：王盘山、冰火岛、寿宴 |
| `npc_yinsusu` | 殷素素，天鹰教紫微堂主 | 青壮；命定死亡 | `sect_tianyingjiao` L4 | D5 | 与张翠山共用寿宴命运轴但独立关系；改命后仍须处理天鹰教与旧案责任，见 `chapters/04-yitian.md` §8.3 | `sk_yingzhaoshou`、`sk_tianyingjian`（原创扩展配置）；沿天鹰本门来源 | 改命后可 | 回目待考：龙门镖局、冰火岛、寿宴 |
| `npc_xiexun` | 谢逊，金毛狮王 | 中老年；卒年待考 | `sect_mingjiao` L4 | D5 | 冰火岛 / 屠狮大会、复仇与放下 | `sk_shizihou`、`sk_qishangquan` | 否 | 回目待考：王盘山、冰火岛、屠狮大会 |
| `npc_yangxiao` | 杨逍，光明左使 | 中年；卒年待考 | `sect_mingjiao` L4 | D4 | 光明顶解围与教内信任 | `sk_qiankun`；`sk_guangmingquan`（原创扩展配置） | 否 | 回目待考：坐忘峰、光明顶 |
| `npc_fanyao` | 范遥，光明右使 / 苦头陀 | 中年；卒年待考 | `sect_mingjiao` L4 | D4 | 万安寺身份揭露、潜伏任务善后 | `pers_jiaozha`；`sk_guangmingxinfa`、`sk_guangmingquan`、`sk_mingjiaoduanjian`（原创扩展配置） | 否 | 回目待考：万安寺营救 |
| `npc_yintianzheng` | 殷天正，白眉鹰王 | 老年；命定死亡待考 | `sect_tianyingjiao` L5 / 明教法王 | D5 | 光明顶和解；屠狮大会前改命窗口 | `sk_yingzhaoqinna`、`sk_yingzhaoshou`；沿天鹰传承，见 `skills-yitian` §3.2、§4.3 | 改命后可 | 回目待考：光明顶、屠狮大会 |
| `npc_weiyixiao` | 韦一笑，青翼蝠王 | 中年；卒年待考 | `sect_mingjiao` L4 | D4 | 寒毒治疗与教主许可 | `sk_hanbingmianzhang`、`sk_qingyifashen`；轻功名为（原创扩展命名），寒毒与轻功表现见 `skills-yitian` §4.2（待考） | 否 | 回目待考：光明顶 |
| `npc_miejueshitai` | 灭绝师太，峨眉掌门 | 中老年；命定死亡 | `sect_emei` L5 | D5 | 万安寺前立场与师门承诺；可改命 | `sk_emeijiuyang`、`sk_miejuejian` | 改命后可 | 回目待考：六派西征、万安寺 |
| `npc_songqingshu` | 宋青书，武当三代首徒 | 青年；命定结局待考 | `sect_wudang` L3 | D5 | 嫉妒、丐帮阴谋与赎罪 / 邪线 | `sk_zhenwujian`（原创扩展配置）；`sk_jiuyinbaigu` 只随屠狮分支显现，传授细节（待考：《倚天屠龙记》宋青书与周芷若相关段落） | 改命后可 | 回目待考：丐帮事件、屠狮大会 |
| `npc_songyuanqiao` | 宋远桥，武当大弟子 | 中年；卒年待考 | `sect_wudang` L4 | D4 | 寿宴守山、宋青书家事与掌门许可 | `sk_chunyangwuji`；宋远桥授艺来源见 `skills-daojia` §5.4 | 否 | 回目待考：武当诸役 |
| `npc_yudaiyan` | 俞岱岩，武当三侠 | 中年；卒年待考 | `sect_wudang` L3 | D4 | 伤残治疗、龙门镖局真相与宽恕线 | `sk_wudangtuna`、`sk_zhenwujian`（原创扩展配置）的历史层数保留；伤残状态限制行动 | 否 | 回目待考：屠龙刀开篇、寿宴 |
| `npc_chengkun` | 成昆，混元霹雳手 / 圆真 | 中老年；命定结局待考 | 少林化名 / 明教仇敌 | D5 | 邪线潜伏或正线揭罪后受制；高背叛风险 | 主运 `sk_huanyinxinfa`；已装拳脚 `sk_huanyinshou`、`sk_huanyinzhi`、`sk_kaimenpiguaquan`；`sk_tongbeijin` 已学未装8重，仅满足劈挂前置，完整快照见章节 §12.5 | 否 | 回目待考：光明顶密道、屠狮大会 |
| `npc_luzhangke` | 鹿杖客，玄冥二老之一 | 中老年；生卒待考 | 玄冥一系 / `sect_ruyangwangfu` | D5 | 王府敌线；换俘或羁绊支线后仅开放高风险限定同行 | 主运 `sk_xuanminghanyuangong`；外功 `sk_xuanming`、`sk_lutouzhangfa`、`sk_caoyuansheyi`、`sk_duandashou` | 否 | 回目待考：玄冥神掌与鹿角杖交手段落 |
| `npc_hebiweng` | 鹤笔翁，玄冥二老之一 | 中老年；生卒待考 | 玄冥一系 / `sect_ruyangwangfu` | D5 | 与鹿杖客独立求值；换俘或羁绊支线后仅开放高风险限定同行 | 主运 `sk_xuanminghanyuangong`；外功 `sk_xuanming`、`sk_hezuibifa`、`sk_caoyuansheyi`、`sk_duandashou` | 否 | 回目待考：玄冥神掌与鹤嘴双笔交手段落 |
| `npc_kongwen` | 空闻，少林方丈 | 老年；卒年待考 | `sect_shaolin` L5 | D4 | 六派关系、屠狮大会与寺规 | `sk_yijinjing`；屠狮大会后授艺来源见 `skills-shaolin` §1.5（原创扩展投放） | 否 | 回目待考：光明顶、屠狮大会 |
| `npc_duee` | 渡厄，金刚伏魔圈三僧之一 | 高龄；卒年待考 | `sect_shaolin` L5 传承资格（原创扩展配置） | D5 | 屠狮大会后以化解仇怨 / 阵法试炼招募 | 主运 `sk_jingangbuhuai`；外功 `sk_jingangfumoquan`、`sk_longzhaoshou`、`sk_fumosuofa`、`sk_shaolinqinna`、`sk_shaolingunfa`；已学未装前置见章节 §12.5 | 否 | 回目待考：少林金刚伏魔圈 |
| `npc_dujie` | 渡劫，三渡之一 | 高龄；卒年待考 | `sect_shaolin` L5 传承资格（原创扩展配置） | D5 | 屠狮大会后短窗；先获渡厄许可，再完成西阵眼守阵且选择不伤俘（原创扩展） | 主运 `sk_jingangbuhuai`；外功 `sk_jingangfumoquan`、`sk_longzhaoshou`、`sk_fumosuofa`、`sk_shaolinqinna`、`sk_shaolingunfa`；已学未装前置见章节 §12.5 | 否 | 回目待考：屠狮大会 |
| `npc_dunan` | 渡难，三渡之一 | 高龄；卒年待考 | `sect_shaolin` L5 传承资格（原创扩展配置） | D5 | 屠狮大会后短窗；完成南阵眼护僧并拒绝借阵复仇（原创扩展） | 主运 `sk_jingangbuhuai`；外功 `sk_jingangfumoquan`、`sk_longzhaoshou`、`sk_fumosuofa`、`sk_shaolinqinna`、`sk_shaolingunfa`；已学未装前置见章节 §12.5 | 否 | 回目待考：屠狮大会 |
| `npc_zhoudian` | 周颠，明教五散人 | 中年；卒年待考 | `sect_mingjiao` L4 | D4 | 光明顶同生共死、教主许可 | `sk_guangmingquan`（原创扩展配置）；沿明教本门来源 | 否 | 回目待考：光明顶 |
| `npc_pengyingyu` | 彭莹玉，彭和尚 | ?–约 1352/1353（史实原型；卒年待考；小说化）[H03] | `sect_mingjiao` L4 | D4 | 红巾军支线与救援 | `sk_dafengyunfeizhang`；与彭莹玉的关系（待考），见 `skills-yitian` §4.2、K-4；`pers_zhenfa` | 否 | 回目待考：蝴蝶谷 / 起义线 |
| `npc_changyuchun` | 常遇春，明教义军将领 | 1329/1330–1369（史实；生年待考）[H03] | `sect_mingjiao` / 义军 | D4 | 汉水救助与军务短时同行 | `sk_duanzhenqiang`、`sk_shouchengfa`（原创扩展配置）；倚天军中来源见 `skills-general` §4 | 否 | 回目待考：汉水护送周芷若 |
| `npc_xuda` | 徐达，明教义军将领 | 1332–1385（史实）[H03] | `sect_mingjiao` / 义军 | D4 | 义军声望与屠龙刀兵书线 | `sk_wumuyishu`（兵法） | 否 | 回目待考：书末兵书交付 |
| `npc_zhuyuanzhang` | 朱元璋，义军领袖 | 1328–1398（史实）[H03] | 明教 / 义军 | D5 | 政治线；短时同行，背叛与夺权风险 | 统帅画像；非绝顶武者 | 否 | 回目待考：濠州与书末夺权 |
| `npc_wangbaobao` | 王保保（扩廓帖木儿），元军统帅 | 生年不详；约 1375/1376 卒（史实；卒年待考）[H03] | `sect_ruyangwangfu` / 元廷 | D5 | 赵敏亲族与战争立场；战役短时同行 | 主运 `sk_baizhanxinfa`；外功 `sk_pojunqiangfa`、`sk_shouchengzhen`、`sk_zhenqijian`、`sk_caoyuansheyi`、`sk_wangfuchangquan`；`pers_zhenfa` | 否 | 回目待考：元廷追击线 |
| `npc_yulianzhou` | 俞莲舟，武当二侠 | 中年；生卒待考 | `sect_wudang` L4 | D4 | 武当守山、同门责任与张三丰许可 | `sk_chunyangwuji`、`sk_huzhaojuehushou`；授受细节见 `skills-daojia` §5.4（待考） | 否 | 回目待考：武当诸役 |
| `npc_kongzhi` | 空智，少林高僧 | 老年；生卒待考 | `sect_shaolin` L4 | D4 | 六派与屠狮大会立场；止战并取得方丈许可 | `sk_shaolinjiuyang`、`sk_shaolinqinna`（原创扩展配置）；沿少林本门来源 | 否 | 回目待考：六派西征、屠狮大会 |
| `npc_kongxing` | 空性，少林高僧 | 老年；命定死亡待考 | `sect_shaolin` L4 | D5 | 万安寺前短窗；若开放改命须处理阿三一战 | `sk_longzhaoshou`；空性交手观摩来源见 `skills-shaolin` §1.6.4 | 改命后可 | 回目待考：万安寺前后 |
| `npc_hetaichong` | 何太冲，昆仑掌门 | 中老年；生卒待考 | `sect_kunlun` L5 | D4 | 默认仅门派交涉与考校，不因挑战落败自动招募 | `sk_zhengliangyi`；配装与同门心法的原创扩展配置见 `chapters/04-yitian` §12.5 | 否 | 回目待考：光明顶两仪化四象，何太冲与班淑娴合击 |
| `npc_banshuxian` | 班淑娴，昆仑高手 | 中老年；生卒待考 | `sect_kunlun` L4 | D4 | 默认仅门派交涉与考校；关系独立于何太冲求值 | `sk_zhengliangyi`；配装与同门心法的原创扩展配置见 `chapters/04-yitian` §12.5 | 否 | 回目待考：光明顶两仪化四象，班淑娴与何太冲合击 |
| `npc_asan` | 阿三，赵敏麾下金刚门高手 | 中年；命定结局待考 | `sect_ruyangwangfu` / 金刚门传承 | D5 | 元廷邪线或问责后的受制短窗；伤人旧账不可略过 | `sk_dalijingangzhi`；沿金刚门旁支，见 `skills-shaolin` §3.1 | 否 | 回目待考：万安寺、武当山 |
| `npc_liuyunshi` | 流云使，波斯总教使者 | 壮年；生卒待考 | 波斯总教 | D5 | 灵蛇岛和解后须取得本人及总教许可；不因战败自动招募 | 主运 `sk_bosishenghuoxuangong`；外功 `sk_shenghuoling`、`sk_guangmingquan`、`sk_mingjiaoduanjian`、`sk_guangmingduandao` | 否 | 原著称谓、分工与动作待考：灵蛇岛三使 |
| `npc_miaofengshi` | 妙风使，波斯总教使者 | 壮年；生卒待考 | 波斯总教 | D5 | 与其余二使独立求值；和解后仅限定同行 | 主运 `sk_bosishenghuoxuangong`；外功 `sk_shenghuoling`、`sk_guangmingquan`、`sk_mingjiaoduanjian`、`sk_guangmingduandao` | 否 | 原著称谓、分工与动作待考：灵蛇岛三使 |
| `npc_huiyueshi` | 辉月使，波斯总教使者 | 壮年；生卒待考 | 波斯总教 | D5 | 与其余二使独立求值；和解后仅限定同行 | 主运 `sk_bosishenghuoxuangong`；外功 `sk_shenghuoling`、`sk_guangmingquan`、`sk_mingjiaoduanjian`、`sk_guangmingduandao` | 否 | 原著称谓、分工与动作待考：灵蛇岛三使 |

合计：40 名。

### 史实来源

- [H03] 故宫博物院核对朱元璋 1328–1398、徐达 1332–1385；怀远县与蚌埠市政府分别采用常遇春 1330、1329 生。彭莹玉、扩廓帖木儿卒年仍见不同口径，均保持（待考），不补造唯一年份。访问 2026-09-26，完整链接与证据等级见主文 §12。

## 本文新增术语与 ID

新增人物 ID：`npc_hetaichong`、`npc_banshuxian`，分别用于光明顶两仪化四象的何太冲、班淑娴独立画像；创建前全仓查重无同 ID，复用 `npcs-sects` 已有显示名，不另造第三人。其余 38 名沿既有 ID；武学引用均已在所属图鉴登记，不在本名录定义武学或来源。

## 数据校验规则与测试用例

- 能力栏的 `sk_*` 必须命中现有图鉴；见闻、译读和未登记毒功不得生成已学武学实例。
- 首领画像、主辅运、七参及多人耐久只读取 `chapters/04-yitian.md` §12.3–§12.5；本名录不复制数值。
- 殷天正应解析天鹰 `sk_yingzhaoqinna`，韦一笑应解析 `sk_hanbingmianzhang` 与 `sk_qingyifashen`；不能因名称相近替为少林鹰爪功或古墓寒玉心诀。

## 待决事项 / 依赖

### 替下游给出的建议值

本名录不新增数值；非首领标注（原创扩展配置）的基础能力是默认选配，层数与完整画像仍由 `design/18` 的生成规则及合法来源约束。

### 本文依赖的上游事实

已解决：非首领已有图鉴内容的“待核配”提示已替为正式 ID；武当、少林、天鹰与明教条目分别见 `skills-daojia` §5、`skills-shaolin` §1 / §3、`skills-yitian` §3–§5，常遇春军伍来源见 `skills-general` §4。殷离的特有毒功尚无图鉴定义，不能把本次基础拳法选配视为补齐毒功。

### 对基准的修改提案

无。

### 原著考据待办

保留各行出处（待考），并核《倚天屠龙记》殷离在蝴蝶谷 / 灵蛇岛的毒功名称、招式与授受，赵敏所学峨眉剑招、宋青书的九阴爪法授受、彭莹玉与大风云飞掌、波斯三使称谓及分工；未核对前不补引文与回目号。

### 开放问题（附默认值）

- 殷离特有毒功是否补入图鉴：需图鉴任务 / 作者确认；默认毒功只作剧情画像，不生成战斗招式，基础战斗引用已录 `sk_tianyingrumenquan`（原创扩展配置），不凭空借其他人的毒功。
- 成昆与玄冥二老个人独门满层来源、明教护教功名称与波斯三使分工：继续见 `chapters/04-yitian.md` 文末 `D04-O12` 等既有条目；默认保留现有来源、原创命名与三人独立记录，不无证据更换 ID。

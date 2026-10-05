# NPC 名录 · 07 碧血剑

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。年代 1630–1645，引用 `design/02`。
> 上游：`00-canon.md` v1.8；`decisions/author-requirements.md` AR-18；作者决定与跨文档裁定见 `decisions/author-decisions.md`、`decisions/rulings-v1.md`。
> 引用而不重定义：内功性质、调息档案与路线门槛读取各武学图鉴现值；逐单位主辅运、相冲处理与七参见 `chapters/07-bixue.md` §12.8。本表能力栏只保留武学 ID，不复制性质。
> 标注约定：沿用 `chapters/07-bixue.md` 文首；史实人物用史实生卒辅助存在性，小说行为仍依原著；武学未收录者不预建 ID。
> 版本：v1.5；经脉落地终审、书界 07 配装与完整实战对手同步（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。

能力栏是本作配置与传承索引，不是原著逐人武学清单；新增人物绑定中的本门 / 通行配置均标**（原创扩展配置）**。仅有传承资格不等于开场已掌握，授艺仍读取 `story/07-bixue.md` §8 与图鉴前置、时机和层数条件；人物与招名的既有待考项保留。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_yuanchengzhi` | 袁承志，袁崇焕之子 / 华山弟子 | 约 1623（推算）–? | `sect_huashan` L3 | D5 | 身世、闯军与青青关系；出海前窗口 | 金蛇剑法 `sk_jinshejian`；神行百变 `sk_shenxing` | 否 | 回目待考：华山学艺、北京、出海 |
| `npc_wenqingqing` | 温青青（夏青青），金蛇郎君之女 | 青年；生卒待考 | `sect_shiliang` | D5 | 石梁温家、妒意与共同成长线 | 金蛇传承 `sk_jinsheyouzhang`、`sk_jinshezhui`；解谜与授艺后配置**（原创扩展配置）** | 否 | 回目待考：石梁庄、金蛇洞 |
| `npc_xiaxueyi` | 夏雪宜，金蛇郎君 | 壮年；主线前已故 | 金蛇传承 | D5（回忆 / 改命） | 前史改命或书卷投影；常规时代不可活体招募 | 金蛇剑法 `sk_jinshejian` | 传承 | 回目待考：温仪追述、金蛇洞遗骨 |
| `npc_wenyi` | 温仪，温家女子 / 青青之母 | 中年；命定死亡待考 | `sect_shiliang` | D5 | 温家囚禁与母女团聚改命 | 非战斗 / 医护辅助 | 改命后可 | 回目待考：石梁庄 |
| `npc_hetieshou` | 何铁手，五毒教主 | 青年；生卒待考 | `sect_wudu` L5 | D5 | 正邪线由敌转友；拜师 / 改名细节待考 | 主运 `sk_hunyuanfangzhuang`；辅运 `sk_wuduxinfa`、`sk_wudutuna`；外功 `sk_xieweibian`、`sk_ruanhongzhusuo`、`sk_hanshasheying`、`sk_wuduquan`；通行主运为**（原创扩展配置·待补本门武学）** | 否 | 回目待考：五毒教、华山归服；第四档 7 品主运与本门图鉴缺口见 `chapters/07-bixue.md` §12.8 |
| `npc_murenqing` | 穆人清，神剑仙猿 | 老年；生卒待考 | `sect_huashan` L5 | D5 | 华山门规与袁承志师门链 | 华山配置 `sk_hunyuangong`、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan`**（原创扩展配置）** | 否 | 回目待考：华山授艺 |
| `npc_musang` | 木桑道人，铁剑门前辈 | 老年；生卒待考 | `sect_tiejian` | D4 | 棋局、轻功与阿九传承 | 神行百变 `sk_shenxing` | →鹿鼎传承 | 回目待考：华山 / 北京、收阿九 |
| `npc_huangzhen` | 黄真，铜笔铁算盘 | 中老年；生卒待考 | `sect_huashan` L4→L5 | D4 | 同门许可、军饷与华山善后 | 华山配置 `sk_hunyuangong`、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_huashanrujian07`**（原创扩展配置）** | 否 | 回目待考：师门相认、北京 |
| `npc_guixinshu` | 归辛树，神拳无敌 | 中老年；鹿鼎命定死亡 | `sect_huashan` L4 | D5 | 华山同门与误会；后世刺驾回响 | 主运 `sk_hunyuangong`；外功 `sk_huashandiejinquan07`、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan`、`sk_huashanrujian07` | →鹿鼎 | 回目待考：华山同门、鹿鼎刺驾前史；拳法名为**（原创扩展命名）** |
| `npc_guierniang` | 归二娘，归辛树之妻 | 中年；鹿鼎命定死亡 | `sect_huashan` | D4 | 患儿救治、家庭与同门线 | 主运 `sk_hunyuangong`；辅运 `sk_huashantuna07`、`sk_dantianyangqi`；外功 `sk_huashandiejinquan07`、`sk_hunyuanzhang`、`sk_poyuquan`、`sk_tiezhijue`、`sk_huashanquan07` | →鹿鼎 | 回目待考：归家三口；拳法名为**（原创扩展命名）**；本界试锋与后世首领配装分别见 `chapters/07-bixue.md`、`chapters/08-luding.md` §12.8 |
| `npc_ajiu` | 阿九，长平公主 / 后来的九难 | 小说生卒待考；历史原型约 1629/1630–1646（两者分离）[H04] | 明宫 / `sect_tiejian` | D5 | 宫变断臂与撤离改命；碧血曾入队可在鹿鼎重逢 | 木桑传承索引 `sk_shenxing`；剑法 `sk_tiejianrujian`**（原创扩展配置）**，须按授艺阶段启用 | →鹿鼎 | 回目待考：宫中相识、北京城破 |
| `npc_chengqingzhu` | 程青竹，青竹帮主 | 中老年；生卒待考 | 江湖帮会 | D4 | 护送军饷、帮会声望 | 青竹帮来源长兵 `sk_shuangqiangqiangfa`**（原创扩展配置）**；竹器门类与原著招名仍待考 | 否 | 回目待考：军饷争夺 |
| `npc_jiaowaner` | 焦宛儿，金龙帮人物 | 青年；生卒待考 | `sect_jinlongbang` | D4 | 父仇、帮会重建与袁承志援助 | 金龙帮配置 `sk_jinlongbangxinfa`、`sk_chuangwangchangquan`**（原创扩展配置）** | 否 | 回目待考：金龙帮变故 |
| `npc_jiaogongli` | 焦公礼，金龙帮帮主 | 中老年；命定死亡待考 | `sect_jinlongbang` L5 | D4 | 遇害前短窗；可改命并改变帮会线 | 主运 `sk_jinlongbangxinfa`；外功 `sk_fuhuzhang`、`sk_huweijian`、`sk_biaojujianfa`、`sk_huyuanquan` | 改命后可 | 回目待考：南京金龙帮 |
| `npc_wenfangda` | 温方达，石梁温氏五老之一 | 老年；生卒待考 | `sect_shiliang` L4 | D4 | 温家旧案与交还宝藏 | 主运 `sk_shiliangwuxinggong`；外功 `sk_wenjiawuxingzhen`、`sk_shiliangwuxingzhang`、`sk_shilianggun` | 否 | 回目待考：石梁庄 |
| `npc_wenfangyi` | 温方义，温氏五老之一 | 老年；生卒待考 | `sect_shiliang` L4 | D4 | 五老内部立场与赎罪 | 主运 `sk_shiliangwuxinggong`；外功 `sk_wenjiawuxingzhen`、`sk_shiliangwuxingzhang`、`sk_shilianggun` | 否 | 回目待考：石梁庄 |
| `npc_sunzhongjun` | 孙仲君，飞天魔女 | 青年；结局伤残待考 | `sect_huashan` L3 | D4 | 暴烈行事的问责 / 同门修复 | 主运 `sk_huashanqigong07`；外功 `sk_jianghubaizhanjian`**（原创扩展配置）**、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan`；通行剑维持外功门槛，不提前取得 L4 混元功 | 否 | 回目待考：华山同门冲突 |
| `npc_meijianhe` | 梅剑和，归辛树弟子 | 青壮；生卒待考 | `sect_huashan` L3 | D3 | 同门任务与阻止孙仲君伤人 | 华山 L3 配置 `sk_huashanqigong07`、`sk_hunyuanzhang`、`sk_huashanrujian07`**（原创扩展配置）** | 否 | 回目待考：孙仲君交手段落 |
| `npc_liupeisheng` | 刘培生，归辛树弟子 | 青壮；生卒待考 | `sect_huashan` L3 | D3 | 同门任务 | 华山 L3 配置 `sk_huashanqigong07`、`sk_hunyuanzhang`、`sk_huashanrujian07`**（原创扩展配置）** | 否 | 回目待考：孙仲君交手段落 |
| `npc_yuanchonghuan` | 袁崇焕，明末将领 / 袁承志之父 | 1584–1630（史实）[H04] | 明军 | D5（序幕） | 仅序幕 / 改命锚点；不可在主体常规出现 | 统帅画像，非江湖武学配置 | 传承 | 回目待考：序幕冤狱 |
| `npc_chongzhen` | 崇祯帝朱由检 | 1611–1644（公历；故宫纪年作万历三十八年十二月廿四日）[H04] | 明廷 | D5 | 宫变短时同行 / 结盟；历史结局改命需主线批准 | 非武者；统治与护卫接口 | 否 | 回目待考：北京城破 |
| `npc_lizicheng` | 李自成，闯军领袖 | 1606–1645（常见史实说；结局有争议）[H04] | `sect_chuangwangjun` L5 | D5 | 军饷、入京与军纪选择；战役短时同行 | 军阵 / 刀兵画像 | →鹿鼎传闻 | 回目待考：闯军主线 |
| `npc_wusangui` | 吴三桂，明清将领 | 1612–1678（史实）[H04] | 明军→清 / 平西势力 | D5 | 山海关与陈圆圆线；邪线阶段同行 | 军阵画像 | →鹿鼎 | 回目待考：山海关前后 |
| `npc_duoergun` | 多尔衮，清初摄政王 | 1612–1650（史实）[H04] | 清军 | D5 | 清军政治线、战役限定同行 | 军阵 / 骑射画像 | 否 | 回目待考：关外军政线 |
| `npc_huangtaiji` | 皇太极，清太宗 | 1592–1643（史实）[H04] | 清军 | D5 | 只在对应年份与政治任务出现 | 统帅画像 | 否 | 回目待考：关外线 |
| `npc_chenyuanyuan` | 陈圆圆，名伶 / 吴三桂关系人物 | 约 1623–?（史实生卒有争议）[H04] | 江南 / 平西王府 | D4 | 救援与身世叙事；非战斗同行 | 非战斗同伴 | →鹿鼎 | 回目待考：相关追述 |
| `npc_liyan` | 李岩，闯军将领 / 谋士 | 壮年；原著命定死亡（生卒待考） | `sect_chuangwangjun` | D5 | 军饷、军纪与劝谏链；`dc_07_08` 证据齐备方可与红娘子同时改命 | 军务 / 民生 / 谋略画像 | 改命后可留回响 | 回目待考：闯军会盟、李自成猜忌 |
| `npc_hongniangzi` | 红娘子，李岩伴侣与军中行动者 | 青壮；原著命定死亡（生卒待考） | `sect_chuangwangjun` | D5 | 暗语、撤离网与独立意愿链；主改命须与李岩同时成立 | 军伍配置 `sk_junzhongdao`、`sk_xingjunbu`**（原创扩展配置）**；撤离组织属任务能力 | 改命后可留回响 | 回目待考：闯军线、李岩遇害后 |
| `npc_yuzhenzi` | 玉真子，后金宫廷护卫强敌 | 中老年；命定死亡（生卒待考） | 铁剑门支系 / 后金 | D5 | 宫廷敌对与华山终战；仅可受制短时同行，不作无代价常驻 | 主运 `sk_tiejianxuangong`；外功 `sk_tiejianjianfa`、`sk_mantianhuayu`、`sk_tiejianqipanjian`、`sk_tiejianrujian` | 否 | 回目待考：后金宫廷、华山决战 |
| `npc_hehongyao` | 何红药，五毒教人物 | 中年；命定死亡（生卒待考） | `sect_wudu` | D5 | 夏雪宜旧怨、何铁手关系与金蛇洞终局 | 主运 `sk_wuduxinfa`；辅运 `sk_wudutuna`、`sk_jianghutuna`；外功 `sk_xieweibian`、`sk_ruanhongzhusuo`、`sk_hanshasheying`、`sk_wuduruobian` | 否 | 回目待考：五毒教、金蛇洞；完整精英配装见 `chapters/07-bixue.md` §12.8 |
| `npc_sunzhongshou` | 孙仲寿，袁崇焕旧部 / 山宗骨干 | 中老年；生卒待考 | 山宗 / 袁党 | D4 | 囚车、护饷与出海 / 留守窗口；须先完成袁党旧案链 | 军务 / 护卫画像 | 否 | 回目待考：开篇旧案、护送军饷 |
| `npc_zhangchaotang` | 张朝唐，浡泥来客 | 中年；生卒待考 | 海外来客 / 袁党友方 | D4 | 开篇传讯与海外尾声首尾相接；完成护送和出海信息链后可同行 | 非战斗传讯 / 航路辅助 | 否 | 回目待考：开篇浡泥来客、海外尾声 |
| `npc_cuiqiushan` | 崔秋山，袁党友人 | 中年；生卒待考 | 袁党 | D4 | 保护幼年袁承志、伤势处置与伏虎掌传承链 | 伏虎掌 `sk_fuhuzhang`；正式武学名与人物归属沿图鉴保留**（待考）** | 否 | 回目待考：幼年袁承志获救 |
| 哑巴师兄槽（不建静态 ID） | 华山生活与出海同伴；姓名待考 | 青壮；生卒待考 | `sect_huashan` | D3 | 完成华山杂务与师门许可；出海窗口可同行 | 华山基础武学 / 舟务 | 否 | 回目待考：华山生活、出海同行；运行时生成，不虚构实名 |
| `npc_caohuachun` | 曹化淳，宫廷阴谋线人物；历史与小说身份分存 | 中老年；小说生卒待考 | 明廷 / 宫廷敌对 | D5 | 搜证揭露后仅开放受制短时同行；不可用招募洗白迫害与背叛 | 权术 / 宫禁画像 | 否 | 回目待考：北京宫廷线 |
| `npc_anjianqing` | 安剑清，宫廷卫士 / 安家人物 | 中年；生卒待考 | 明廷卫士 | D4 | 安家冲突、宫变选择与背叛线索齐备后开放限定同行 | 护卫剑术 `sk_huweijian`**（原创扩展配置）** | 否 | 回目待考：安家与宫变线 |
| `npc_shatianguang` | 沙天广，泰山群雄人物 | 中年；生卒待考 | 泰山群雄 | D4 | 会盟立场、护饷与出海窗口；须取得本人同意 | 通行剑术 `sk_jianghurumenjian`、轻功 `sk_caoshangfei`**（原创扩展配置）**；舟务属任务能力，具体表现**（待考）** | 否 | 回目待考：群雄会盟、出海队伍 |
| `npc_anxiaohui` | 安小慧，安家人物 | 青年；生卒待考 | 安家 / 袁党友方 | D4 | 押金与袁党联络支线、安家关系和个人选择 | 剑术 `sk_jianghurumenjian`**（原创扩展配置）**；联络辅助属任务能力 | 否 | 回目待考：押金任务、与崔希敏关系 |
| `npc_cuiximin` | 崔希敏，黄真弟子 | 青年；生卒待考 | `sect_huashan` L3 | D4 | 华山师承、押金支线与个人关系选择；须获离山许可 | 华山 L3 配置 `sk_huashanqigong07`、`sk_hunyuanzhang`、`sk_huashanrujian07`**（原创扩展配置）** | 否 | 回目待考：安小慧相关支线 |
| `npc_wenfangshi` | 温方施，石梁温氏人物 | 中老年；生卒待考 | `sect_shiliang` | D4 | 温仪遇害案搜证、俘获与审理；不以同行洗白其责任 | 主运 `sk_shiliangwuxinggong`；外功 `sk_wenjiawuxingzhen`、`sk_shiliangwuxingzhang`、`sk_shilianggun` | 否 | 回目待考：石梁庄温仪事件 |
| `npc_minzihua` | 闵子华，金龙帮父仇案人物 | 中年；生卒待考 | 仙都关系**（待考）** | D4 | 焦公礼案对质、责任判断与和解 / 问责窗口 | 主运 `sk_xianduyunqi`；外功 `sk_shangqingjianfa07`、`sk_liangyijianfa07`、`sk_lingbaoquan`、`sk_xiandurumenjian` | 否 | 回目待考：金龙帮父仇对质 |

合计：40 名静态 NPC；另有 1 个不建静态 ID 的姓名待考角色槽。

### 史实来源

- [H04] CCTV 袁崇焕专题与故宫博物院明清人物 / 宫廷资料，分别核对袁崇焕、崇祯、李自成、吴三桂、多尔衮与皇太极；长平公主史实原型和小说阿九分开建模。访问 2026-09-26，完整链接见主文 §12。

## 本文新增术语与 ID

本轮无新增术语或 ID；保留上表 40 名静态 NPC 与 1 个不建静态 ID 的角色槽。内功与招式继续复用正式图鉴。

## 数据校验规则与测试用例

- AR-18 复核：归辛树、归二娘的混元功读取调和；温方达、温方义、温方施的石梁五行功读取阴；孙仲君的华山养气功读取调和；玉真子的铁剑玄功读取阳；闵子华的仙都运气诀读取阴。此处仅列读取预期，不另定义性质。
- 何红药的江湖吐纳现为阴；能力栏仍只存 ID。主辅相性、路线门槛与七参从 `chapters/07-bixue.md` §12.8 和正式图鉴解析，不沿用旧性质快照。
- 能力栏的每个 `sk_*` 必须在正式图鉴已有定义；本轮非首领索引读取 `skills-xiake-bixue.md` §8–§13、`skills-bulu-07-bixue.md` §1.2 / §4 与 `skills-general.md` §4 / §5 / §7，不把“已有图鉴”误作原著授艺已核实。
- 何铁手继续采用合法第四档主运 `sk_hunyuanfangzhuang`；其来源包含 ch07，两门五毒辅运均保持。孙仲君继续采用 L3 主运和通行剑，完整配装 / 七参以 `chapters/07-bixue.md` §12.8 为准。

## 待决事项 / 依赖

### 替下游给出的建议值

本轮不新增人物数值；逐单位配置与未实测默认值见 `chapters/07-bixue.md` §12.8、文末 BX-D07 / BX-D08 / BX-D09。

### 本文依赖的上游事实

**已解决：**AR-18 内功性质以 `skills-xiake-bixue.md`、`skills-bulu-07-bixue.md`、`skills-general.md` 当前正式条目为准；本表没有需要替换的旧性质字段。

**已解决：**P07 / P07.R、D07 / D07.R 的 15 名候选已由 F1b 按 14 个静态 NPC 与 1 个不建静态 ID 的哑巴师兄槽补录；本表维持 40 个静态 ID。NXfixD-07 / NXfixD-08 的归氏二人首槽已在两书界统一为 `sk_huashandiejinquan07`（见 `chapters/07-bixue.md` §12.8、`chapters/08-luding.md` §12.8），不再等待对界同步。

**已解决：**非首领的“待图鉴 / 待对应图鉴收录 / 待图鉴核配”已替换为正式 ID；首领的模糊“按图鉴核配”也按本章 §12.8 列出外功。该清理不新增武学定义、获取来源或 NPC ID。

### 对基准的修改提案

无新增提案。

### 原著考据待办

保留上表全部回目、生卒、人物归属待考项；本轮未新增或核实原著事实。

### 开放问题（附默认值）

温家五老、玉真子的主辅相冲与玉真子 / 闵子华的异性外功是否长期保留，见 `chapters/07-bixue.md` 文末 AR-18 配装项；默认保留配装并接受已列代价，行动候选不自行豁免路线门槛。

何铁手的五毒本门内功缺口仍未闭合：默认保持 `sk_hunyuanfangzhuang` 的合法通行主运，等待 `skills-bulu-07-bixue.md` 补入可共享的五毒 ≥7 品内功后再替换、复算（见 `chapters/07-bixue.md` §12.8.2、BX-O11；NXfixE-b 遗留）。孙仲君 L3 的通行剑配置默认不变，不因高阶外功门槛提前授予 L4 内功。

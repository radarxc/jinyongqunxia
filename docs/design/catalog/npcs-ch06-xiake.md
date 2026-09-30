# NPC 名录 · 06 侠客行

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。游戏定年约 1582–1583（原创扩展），引用 `design/02`。
> 上游：作者新增需求 AR-18、`docs/00-canon.md`、`design/18` 与正式武学图鉴。
> 引用而不重定义：本作代表武学按现行图鉴与 `skills-bulu-06-xiake.md` 引用；性质、调息与路线约束读图鉴，主辅运相冲及七参复核见 `chapters/06-xiake.md` §12.7.3，不在人物表重定义。
> 标注约定：游戏扩展标 **（原创扩展）**；原著事实与出处回目待按三联 / 广州修订版核对，保留“待考”。
> 版本：v1.4；经脉落地终审、完整实战对手配装补漏（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_shipotian` | 石破天（狗杂种 / 石中坚），侠客岛悟道者 | 青年；生卒待考 | `sect_jinwupai` / `sect_changlebang` 名义 | D5 | 玄铁令、长乐帮误认、侠客岛悟道全链 | 太玄经、罗汉伏魔功待对应图鉴收录 | 否 | 回目待考：摩天崖、侠客岛石壁 |
| `npc_shizhongyu` | 石中玉，玄素庄长子 / 长乐帮主 | 青年；生卒待考 | `sect_xuansuzhuang` / `sect_changlebang` | D5 | 身份错位与承担责任；邪线可同行 | 雪山武学待对应图鉴收录 | 否 | 回目待考：凌霄城旧案、长乐帮 |
| `npc_shiqing` | 石清，黑白双剑之一 | 中年；生卒待考 | `sect_xuansuzhuang` L5 | D4 | 寻子、身份真相与父子关系 | 上清 / 玄素剑法待对应图鉴收录 | 否 | 回目待考：寻子、凌霄城 |
| `npc_minrou` | 闵柔，黑白双剑之一 | 中年；生卒待考 | `sect_xuansuzhuang` L5 | D4 | 寻子与辨认真相；不可共享石清状态 | 剑法待对应图鉴收录 | 否 | 回目待考：寻子、母子相认 |
| `npc_axiu` | 白阿绣，白万剑之女 | 青年；生卒待考 | `sect_xueshan` | D4 | 紫烟岛相识、辨认石破天与承诺 | 雪山剑法待对应图鉴收录 | 否 | 回目待考：紫烟岛、侠客岛约定 |
| `npc_dingdang` | 丁珰（叮叮当当），丁不三孙女 | 青年；生卒待考 | 丁氏家传 | D4 | 情感、谎言与石中玉身份线 | 丁氏武学待对应图鉴收录 | 否 | 回目待考：误认帮主、丁家事件 |
| `npc_xieyanke` | 谢烟客，摩天居士 | 中老年；生卒待考 | 摩天崖 | D5 | 玄铁令承诺与恶意练功补救 | 主运 `sk_motianyunqi`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_motianzhang`、`sk_bizhenqingzhang`、`sk_konghegong`、`sk_tongbeijin`、`sk_duandashou` | 否 | 回目待考：玄铁令、摩天崖 |
| `npc_beihaishi` | 贝海石，长乐帮军师 | 中老年；命定结局待考 | `sect_changlebang` L4 | D5 | 替身阴谋揭露；正线受制、邪线合作 | 掌法与医术待图鉴 | 否 | 回目待考：长乐帮迎帮主 |
| `npc_baizizai` | 白自在，雪山派掌门 | 老年；生卒待考 | `sect_xueshan` L5 | D5 | 自大成狂、凌霄城内乱与醒悟 | 主运 `sk_lingxiaozhenyuegong`；辅运 `sk_wuwangshengong`、`sk_lingxiaotuna`；外功 `sk_jianghubaizhanjian` **（原创扩展配置·待补本门武学）**、`sk_xueshanjianfa`、`sk_xueshanquan`、`sk_lingxiaorumenjian` | 否 | 回目待考：凌霄城、自大成狂 |
| `npc_shixiaocui` | 史小翠，金乌派创派者 | 老年；生卒待考 | `sect_jinwupai` L5 | D4 | 紫烟岛与祖孙线；需尊重其独立门派 | 金乌刀法待对应图鉴收录 | 否 | 回目待考：紫烟岛、凌霄城 |
| `npc_baiwanjian` | 白万剑，气寒西北 | 中年；生卒待考 | `sect_xueshan` L3 / L4 | D4 | 寻女、父亲失控与门派和解 | 主运 `sk_lingxiaozhenyuegong`；辅运 `sk_wuwangshengong`、`sk_lingxiaotuna`；外功 `sk_xueshanjianfa`、`sk_xueshanquan`、`sk_lingxiaorumenjian` | 否 | 回目待考：寻阿绣、返凌霄城；完整精英配装见 `chapters/06-xiake.md` §12.7 |
| `npc_fengwanli` | 封万里，风火神龙 | 中年；结局待考 | `sect_xueshan` L3 | D4 | 断指旧事、师门忠诚与赎罪 | 主运 `sk_wuwangshengong`；辅运 `sk_lingxiaotuna`、`sk_tunaqianjue`；外功 `sk_xueshanjianfa`、`sk_xueshanquan`、`sk_lingxiaorumenjian` | 否 | 回目待考：玄铁令争夺；完整精英配装见 `chapters/06-xiake.md` §12.7 |
| `npc_dingbusan` | 丁不三，江湖怪客 | 老年；生卒待考 | 丁氏家传 | D4 | “不过三”规矩与祖孙关系 | 主运 `sk_dingshixinfa`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_dingshiqinnashou`、`sk_tongbeijin`、`sk_duandashou`、`sk_jianghuchangquan` | 否 | 回目待考：长江舟上等；完整精英配装见 `chapters/06-xiake.md` §12.7 |
| `npc_dingbusi` | 丁不四，丁不三之弟 | 老年；生卒待考 | 丁氏家传 | D4 | 史小翠旧情与比武纠葛 | 主运 `sk_dingshixinfa`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_dingshiqinnashou`、`sk_tongbeijin`、`sk_duandashou`、`sk_jianghuchangquan` | 否 | 回目待考：碧螺岛 / 凌霄城 |
| `npc_longdaozhu` | 龙岛主，侠客岛主之一 | 高龄；生卒待考 | `sect_xiakedao` L5 | D5 | 参悟石壁后说服二岛主停发赏善罚恶令 | 主运 `sk_xiakedaoqigong`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_xiakedaozhangfa`、`sk_xiakedaoshangshanshou`、`sk_xiakedaozhoufa`、`sk_xiakedaoquanji`、`sk_xiakedaojianji`；不装 `sk_taixuan` / `sk_luohanfumo` | 否 | 回目待考：侠客岛石室 |
| `npc_mudaozhu` | 木岛主，侠客岛主之一 | 高龄；生卒待考 | `sect_xiakedao` L5 | D5 | 与龙岛主共同主线、独立关系状态 | 主运 `sk_xiakedaoqigong`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_xiakedaozhangfa`、`sk_xiakedaoshangshanshou`、`sk_xiakedaozhoufa`、`sk_xiakedaojianji`、`sk_xiakedaoquanji`；不装 `sk_taixuan` / `sk_luohanfumo` | 否 | 回目待考：侠客岛石室 |
| `npc_zhangsan06` | 张三，赏善罚恶使 | 中年；生卒待考 | `sect_xiakedao` L4 | D4 | 铜牌任务、腊八粥与岛主许可 | 主运 `sk_xiakedaoqigong`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_xiakedaozhangfa`、`sk_xiakedaoshangshanshou`、`sk_xiakedaozhoufa`、`sk_xiakedaoquanji`；不装 `sk_taixuan` / `sk_luohanfumo` | 否 | 回目待考：赏善罚恶令 |
| `npc_lisi06` | 李四，赏善罚恶使 | 中年；生卒待考 | `sect_xiakedao` L4 | D4 | 与张三同行但分别记录招募 | 主运 `sk_xiakedaoqigong`；辅运 `sk_jianghutuna`、`sk_tunaqianjue`；外功 `sk_xiakedaozhangfa`、`sk_xiakedaoshangshanshou`、`sk_xiakedaozhoufa`、`sk_xiakedaojianji`；不装 `sk_taixuan` / `sk_luohanfumo` | 否 | 回目待考：赏善罚恶令 |
| `npc_mihengye` | 米横野，长乐帮香主 | 中年；生卒待考 | `sect_changlebang` L4 | D3 | 帮务与帮主真相 | 帮会武学待图鉴 | 否 | 回目待考：长乐帮内讧 |
| `npc_zhanfei` | 展飞，豹捷堂香主 | 中年；生卒待考 | `sect_changlebang` L4 | D3 | 受伤后化解敌意、帮务任务 | 主运 `sk_changlexinfa`；辅运 `sk_changletuna`、`sk_tunaqianjue`；外功 `sk_wuxingliuhezhang`、`sk_changlezhang`、`sk_changleqinna`、`sk_changlequan`；主运仅 5 品，低于具名精英目标 6，四档检索未闭合并阻断生产 | 否 | 回目待考：误击石破天；完整精英配装与 `TS-CONTENT-BOSS-021` 见 `chapters/06-xiake.md` §12.7 |
| `npc_situheng` | 司徒横，八爪金龙 | 中年；生卒待考 | `sect_changlebang` | D4 | 前帮主 / 帮会权力纠纷（身份细节待考） | 帮会武学待图鉴 | 否 | 回目待考：长乐帮权争 |
| `npc_meifanggu` | 梅芳姑，石破天生母 | 中年；命定死亡待考 | 无门派 | D5 | 身世真相与自毁节点；可改命 | 武学待对应图鉴收录 | 改命后可 | 回目待考：结局身世揭示 |
| `npc_shijian` | 侍剑，长乐帮侍女 | 青年；第 16 回命定死亡（广州修订版措辞待考） | `sect_changlebang` | D4 | 第 16 回前完成保护、取得本人同意并离开危险窗口，方可进入 `fate_rescued` 后招募 | 非核心战斗；基础模板 | 改命后可 | 第 16 回：未保护则被丁珰杀死；具体动作待指定版本终校 |
| `npc_dabeilaoren` | 大悲老人，十八泥人持有者 | 老年；第 3 回命定死亡 | 无门派 | D4 | 第 3 回极短救援窗口；默认只结盟 / 留传承，不是侯监集玄铁令持有者 | 罗汉伏魔功传承待图鉴 | 传承 / 改命 | 第 3 回：护少年、遗十八泥人；具体动作待指定版本终校 |
| `npc_miaodi` | 妙谛大师，少林高人 / 侠客岛旧客 | 老年；生卒待考 | `sect_shaolin` L5 | D4 | 三十余年前已赴岛；玩家抵岛后取得本人许可，才可限幕同行 / 支援 | 少林图鉴已有武学核配 | 否 | 第 19–20 回侠客岛旧客；不得出现在本次大陆赴岛名单 |
| `npc_yucha` | 愚茶道长，武当高人 / 侠客岛旧客 | 老年；生卒待考 | `sect_wudang` L5 | D4 | 三十余年前已赴岛；玩家抵岛后独立取得本人许可，才可限幕同行 / 支援 | 武当图鉴项核配 | 否 | 第 19–20 回侠客岛旧客；不得出现在本次大陆赴岛名单 |

合计：26 名。

## 本文新增术语与 ID

本轮无新增术语或 ID；人物与武学均复用既有引用。

## 数据校验规则与测试用例

26 名人物的武学 ID 须在正式图鉴可解析；同一人物的主辅运与 `chapters/06-xiake.md` §12.7 一致。现有武学栏没有性质镜像，保持纯 ID；不能由人物称号或招名反推阴阳。展飞的主运品阶缺口继续阻断生产。

## 待决事项 / 依赖

### 替下游给出的建议值

无新增数值；逐单位七参、相冲代价、调息及节奏复核引用 `chapters/06-xiake.md` §12.7.3。

### 本文依赖的上游事实

**已解决：**AR-18 后所引 12 门内功已核对正式图鉴的 `nature`、`BreathProfile.nature` 与路线 `requiredNature`；本表未内嵌旧性质，纯 ID 无需替换。

### 对基准的修改提案

无。

### 原著考据待办

保留各人物行的生卒、回目及原著身份待考项；本轮未新增或核实原著事实。

### 开放问题（附默认值）

封万里及丁氏的相冲配装默认保留并接受 `chapters/06-xiake.md` §12.7.3 所列代价；异性外功路线可用性待归属规则澄清，不因人物表列入就视为通过。展飞默认保留真实 5 品主运、阻断生产，待图鉴补录合法 ≥6 品主运后复算；完整遭遇回放仍 **（待实测）**。

# NPC 名录 · 11 鸳鸯刀

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。游戏定年约 1740（原创扩展），引用 `design/02`。
> 上游：作者新增需求 AR-18 与已填写决定优先，设计基准为 `00-canon.md` v1.8；武学现值读取 `catalog/skills-kangxi.md`、`catalog/skills-general.md` 与 `catalog/skills-bulu-11-yuanyang.md`。
> 引用而不重定义：内功性质、主辅运与相性 → `design/05` §5；本界七参、相冲处置与节奏 → `chapters/11-yuanyang.md` §12.8；武学栏只存既有引用，不另镜像图鉴性质。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需逐字核对；**（待实测）** = 需回放或实际运行验证；**【建议值】** = 依赖上游的暂用配置。
> 原著及史实原型具名人物共 14 名；另设 6 名明确标注 `origin=expanded` 的原创支线人物，使静态 NPC 达到 20 名。表末保留 7 个无名职能槽作为额外生成位（含游方武当来源槽），不把它们计入静态人物下限。
> 版本：v1.4；多人战整场耐久与完整对手复核（2026-09-29，首领武学栏同步）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。

| ID / 槽 | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_yuanguannan` | 袁冠南，袁氏遗孤 | 青年；生卒待考 | 袁氏传承 | D5 | 双刀身世、萧府祝寿与夫妻刀法 | 主运 `sk_linrenhexinfa`；辅运 `sk_renzhetuna`、`sk_taiyuehuxi`；外功 `sk_fuqidaofa`、`sk_yuanyangshuangdao`、`sk_yuanyangjibenjian` | 否 | 回目待考：夺刀、祝寿、身世 |
| `npc_xiaozhonghui` | 萧中慧（杨中慧），杨伯冲之女 | 18 岁（文本线索，待逐字核） | 萧府 / 杨氏传承 | D5 | 离家夺刀、真实身世与袁冠南关系 | 主运 `sk_linrenhexinfa`；辅运 `sk_renzhetuna`、`sk_taiyuehuxi`；外功 `sk_fuqidaofa`、`sk_yuanyangshuangdao`、`sk_yuanyangjibenjian` | 否 | 回目待考：夺刀、萧府祝寿 |
| `npc_xiaobanhe` | 萧半和（萧义），晋阳大侠 | 中老年；生卒待考 | 萧府 | D5 | 宫中旧事、收养两家遗孤与抗清身份 | 主运 `sk_jundituna`；辅运 `sk_junzhangtuna`、`sk_dantianyangqi`；外功 `sk_junzhongdao`、`sk_daneishuangdao`、`sk_wuyingshou`、`sk_yulinjichudao` **（原创扩展配置）** | 否 | 回目待考：祝寿揭示身世 |
| `npc_linyulong` | 林玉龙，任飞燕之夫 | 青壮；生卒待考 | 夫妻刀法传承 | D4 | 夫妻争执调解、传授刀法 | 主运 `sk_linrenhexinfa`；外功 `sk_fuqidaofa`、`sk_linyulongdao`、`sk_linrenjichudao` | 否 | 回目待考：尼姑庵 / 萧府传艺 |
| `npc_renfeiyan` | 任飞燕，林玉龙之妻 | 青壮；生卒待考 | 夫妻刀法传承 | D4 | 与林玉龙共同任务但独立关系状态 | 主运 `sk_linrenhexinfa`；外功 `sk_fuqidaofa`、`sk_renfeiyandao`、`sk_linrenjichudao` | 否 | 回目待考：夫妻斗嘴交手 |
| `npc_zhouweixin` | 周威信，威信镖局总镖头 | 中年；生卒待考 | `sect_weixinbiaoju` L5 | D4 | 押刀、家眷被挟与镖局责任 | 主运 `sk_jianghutuna`；辅运 `sk_tunaqianjue`、`sk_dantianyangqi`；外功 `sk_weixinliandao`、`sk_weixinbian`、`sk_biaojudaofa`、`sk_weixinbiaoquan`、`sk_weixinjian` **（原创扩展配置）** | 否 | 回目待考：押送鸳鸯刀 |
| `npc_zhuotianxiong` | 卓天雄，大内高手 | 中老年；结局待考 | `sect_qinggong` | D5 | 夺刀敌线；败后受制 / 邪线同行 | 主运 `sk_jundituna`；外功 `sk_daneishuangdao`、`sk_wuyingshou`、`sk_yulinjichudao`、`sk_zhentiansanshizhang`；掌法名称版本依据 **（待考）** | 否 | 回目待考：追夺双刀、萧府 |
| `npc_xiaoyaozi11` | 逍遥子，太岳四侠之首 | 中年；生卒待考 | 太岳四侠 | D4 | 劫镖闹剧、仁者选择 | 主运 `sk_wuguanxinfa`；辅运 `sk_taiyuehuxi`、`sk_zhamabu`；外功 `sk_taiyueshibeishou`、`sk_taiyueqigong`、`sk_taiyuequan` | 否 | 回目待考：拦镖、再夺双刀 |
| `npc_changchangfeng` | 常长风，太岳四侠之二 | 中年；生卒待考 | 太岳四侠 | D4 | 劫镖闹剧链中替他承认误判强弱，并在萧府窗前调停四侠争功 | 主运 `sk_wuguanxinfa`；辅运 `sk_taiyuehuxi`、`sk_zhamabu`；外功 `sk_taiyueshibeishou`、`sk_taiyueqigong`、`sk_taiyuequan` | 否 | 回目待考：拦镖 |
| `npc_huajianying` | 花剑影，太岳四侠之三 | 中年；生卒待考 | 太岳四侠 | D4 | 劫镖闹剧链中保全镖客、拒绝滥杀，再于萧府时机窗完成会合 | 主运 `sk_wuguanxinfa`；辅运 `sk_taiyuehuxi`、`sk_zhamabu`；外功 `sk_taiyueshibeishou`、`sk_taiyueqigong`、`sk_taiyuequan` | 否 | 回目待考：拦镖 |
| `npc_gaiyiming` | 盖一鸣，太岳四侠之四 | 中年；生卒待考 | 太岳四侠 | D4 | 劫镖闹剧链中归还错夺财物、取得其本人认可，并赶上萧府会合窗 | 主运 `sk_wuguanxinfa`；辅运 `sk_taiyuehuxi`、`sk_zhamabu`；外功 `sk_taiyueshibeishou`、`sk_taiyueqigong`、`sk_taiyuequan` | 否 | 回目待考：拦镖 |
| `npc_yuanfuren` | 袁夫人，袁冠南生母 | 中年；生卒待考 | 萧府 / 袁氏 | D4 | 信物与身世揭晓；非战斗同行 | 非战斗 / 情报 | 否 | 回目待考：萧府祝寿 |
| `npc_yangfuren` | 杨夫人，萧中慧生母 | 中年；生卒待考 | 萧府 / 杨氏 | D4 | 信物与身世揭晓；非战斗同行 | 非战斗 / 情报 | 否 | 回目待考：萧府祝寿 |
| `npc_liuyuyi` | 刘於义，小说称“川陕总督” | 1675–1748（史实原型）[H06] | `sect_qinggong` | D5 | 官府押刀线；短时巡视 / 结盟 | 非核心武者；官府调度 | 否 | 回目待考：押刀委任；史实 1732 年口径为署陕西总督，须与小说官衔分开 |
| `npc_chengmo11` | 程墨，袁氏旧仆收留的书僮；**（原创扩展）**，`origin=expanded` | 少年；游戏定年约 1740（原创扩展） | 袁氏友方 | D2（非战斗） | 送达身世信物并取得监护人同意；不可付费战斗雇佣 | 非战斗 / 传讯与识字 | 否 | 原创“旧匣来书”支线；非原著人物，无原著回目 |
| `npc_luchen11` | 鲁忱，威信镖局镖师；**（原创扩展）**，`origin=expanded` | 青壮；游戏定年约 1740（原创扩展） | `sect_weixinbiaoju` | D2 | 找回失镖账册、结清一趟镖契约 | `tmpl_normal`；护卫 / 勘路 | 否 | 原创“失镖账册”支线；非原著人物，无原著回目 |
| `npc_shiwang11` | 石望，威信镖局伤退镖师；**（原创扩展）**，`origin=expanded` | 中年；游戏定年约 1740（原创扩展） | `sect_weixinbiaoju` | D2 | 救回失散家眷并完成交班后可短约同行 | `tmpl_normal`；守护 / 辨路 | 否 | 原创“归镖”支线；非原著人物，无原著回目 |
| `npc_luoning11` | 罗宁，大内侍卫副领；**（原创扩展）**，`origin=expanded` | 青壮；游戏定年约 1740（原创扩展） | `sect_qinggong` | D3 | 出示合法路引、阻止滥杀并完成阵营审查 | `tmpl_elite`；控场 / 护卫 | 否 | 原创“奉檄夺刀”支线；非原著人物，无原著回目 |
| `npc_heqian11` | 何谦，威信镖局趟子手；**（原创扩展）**，`origin=expanded` | 青年；游戏定年约 1740（原创扩展） | `sect_weixinbiaoju` | D2 | 完成护车与安置同僚任务、无欠薪 | `tmpl_normal`；负重 / 探路 | 否 | 原创“空车暗号”支线；非原著人物，无原著回目 |
| `npc_yanhe11` | 严和，萧府管事；**（原创扩展）**，`origin=expanded` | 中年；游戏定年约 1740（原创扩展） | 萧府 | D2（非战斗） | 化解寿宴宾客冲突并安排替班 | 非战斗 / 管理与情报 | 否 | 原创“寿宴名帖”支线；非原著人物，无原著回目 |
| 书僮槽（不建静态 ID） | 袁冠南随行书僮 | 少年 / 青年 | 袁氏 | D2 | 身世线信使；原著具职能无名 | 非战斗 | 否 | 回目待考：袁冠南出场 |
| 张镖师槽（不建静态 ID） | 威信镖局张姓镖师 | 青壮 | `sect_weixinbiaoju` | D2 | 押镖合同与失散救援 | `tmpl_normal` | 否 | 回目待考：镖队遇袭 |
| 詹镖师槽（不建静态 ID） | 威信镖局詹姓镖师（姓氏用字待考） | 青壮 | `sect_weixinbiaoju` | D2 | 押镖合同与证词 | `tmpl_normal` | 否 | 回目待考：镖队人物 |
| 大内侍卫槽（不建静态 ID） | 卓天雄麾下侍卫 | 青壮 | `sect_qinggong` | D2 | 受命夺刀或投降；**（原创扩展）** | `tmpl_elite` | 否 | 原著大内追兵群体锚 |
| 威信趟子手槽（不建静态 ID） | 镖队趟子手 | 青壮 | `sect_weixinbiaoju` | D2 | 护镖 / 家眷救援；**（原创扩展）** | `tmpl_normal` | 否 | 原著七十余人镖队锚 |
| 萧府管事槽（不建静态 ID） | 萧府无名管事 | 中年 | 萧府 | D2 | 寿宴、宾客与密道；**（原创扩展）** | 非战斗 / 设施模板 | 否 | 原著寿宴场景锚 |
| 游方武当道人岗位槽（不建静态 ID） | 沿用 `skills-daojia` §5.5 的无名来源槽；**（原创扩展）** | 成年；具体年龄由生成器给出 | `sect_wudang`；本界 H，不开放常规入门 | D3（来源角色，非战斗） | `q_11_qiyu_03` 余韵返访只开放候选来源；不视为入门、招募完成或自动授艺 | 不参与战斗；武学门槛见章节 §9.5，不跳过 `hard:[sect]` | 否 | 作者决定 P25；无原著人物或回目 |

合计：14 名原著 / 史实原型具名人物（刘於义计入）+ 6 名 `origin=expanded` 的静态原创人物 = **20 名静态 NPC**；另有 7 个不建静态 ID 的无名支持槽，不计入“每部主线 NPC ≥20”下限。

### 史实来源

- [H06] 常州地方志正文核对刘於义 1675–1748，《清史稿·列传九十四》在线转录定位雍正十年（1732）署陕西总督；转录非指定史料版本。访问 2026-09-26；“川陕总督”是小说称谓，不反推为该年的史实官衔。完整链接见主文 §12。

## 本文新增术语与 ID

本轮无新增术语或内容 ID；人物武学栏的纯 ID 引用全部保留。内功性质按图鉴现值读取，主运与辅运的完整配装以 `chapters/11-yuanyang.md` §12.8 为准。

## 数据校验规则与测试用例

- 反查太岳四侠、周威信、袁冠南、萧中慧、林玉龙、任飞燕九人的主运，须与章节改阴后的七参一致；不能沿用旧调和快照。
- 九人相冲组合、已核外功相性及剩余缺口见章节 §12.8；默认保留配装并接受代价，人物名录不赋予桥接或豁免。萧半和、卓天雄的阳性主运保持。
- 人物表未列出的辅运不表示空槽；具名战斗画像按章节读取完整三栏。静态节奏不替代含相冲、调息和护体的固定 RNG 回放 **（待实测）**。
- **已解决：**袁冠南、萧中慧的夫妻刀法已引用 `sk_fuqidaofa`（见 `skills-kangxi` §5.1）；本表无“待图鉴”武学占位。卓天雄的轻功与完整三栏读取章节 §12.8，不另存第二份配装。

## 待决事项 / 依赖

### 替下游给出的建议值

无新增；本轮相冲配装默认值、8 重调息投影与耐久建议统一见章节 §12.8。

### 本文依赖的上游事实

图鉴提供 `nature`、`BreathProfile`、`requiredNature` 与主修经脉；`design/05` §5 和 `design/21` 提供规则。章节已同步九人主运性质；路线兼容语义与六张黄阶外功性质缺口见章节文末，不由人物表补造。

### 对基准的修改提案

无；沿用 Canon v1.8。

### 原著考据待办

保留人物表逐项待考与史实来源说明；优先核《鸳鸯刀》三联 / 广州修订版卓天雄出手段落是否使用“震天三十掌”正式名称，不把补录卡的原创拆招当原文。

### 开放问题（附默认值）

九名改阴人物是否调整辅运以消除相冲，随章节文末 AR-18 配装项等待作者确认；默认保留当前 ID 配装并按 `design/05` 执行代价。经脉与路线的既有开放项均随归属图鉴及规则文档，不在本文另定默认。

卓天雄掌法定名与满层传授条件分别需作者确认，见章节 YY-O03：默认保留 `sk_zhentiansanshizhang` 并标名称 **（待考）**；个人传授仍须本人存活、完成 `q_11_side_08` 释放具结并达 R3，来源上限 10 重、当界有效最多 8 重，观摩最多 6 重。不可用清宫职级或击杀掉落替代。

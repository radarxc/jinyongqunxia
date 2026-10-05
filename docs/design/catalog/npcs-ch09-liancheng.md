# NPC 名录 · 09 连城诀

> 归属：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。游戏定年约 1705–1712（原创扩展），引用 `design/02`。
> 原著人物生卒不可精确定年，不以游戏定年冒充原著史实。出处回目待逐字核对。
> 版本：v1.4；经脉落地终审（2026-09-29）；南四奇完整对手配装同步（2026-09-29）。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_diyun` | 狄云，乡间弟子 / 冤狱幸存者 | 青年；生卒待考 | 戚门 / 丁典传承 | D5 | 荆州冤案、雪谷与水笙信任全链 | 神照经、连城剑法待对应图鉴收录 | 否 | 回目待考：万府、监狱、雪谷 |
| `npc_shuisheng` | 水笙，铃剑双侠之一（与汪啸风并称） | 青年；生卒待考 | 江南侠门 | D5 | 雪谷误会、名节谣言与公开澄清 | 剑法待对应图鉴收录 | 否 | 回目待考：雪谷共生、归庄 |
| `npc_qifang` | 戚芳，戚长发之女 | 青年；命定死亡 | 戚门 / 万家 | D5 | 误会真相与万圭杀机前改命 | 连城剑法基础待图鉴 | 改命后可 | 回目待考：万府、结局救狄云 |
| `npc_dingdian` | 丁典，神照功传人 | 壮年；命定死亡 | 梅念笙传承 | D5 | 狱中信任、凌霜华约定与解毒改命 | 神照经待对应图鉴收录 | 改命后可 | 回目待考：荆州牢狱 |
| `npc_lingshuanghua` | 凌霜华，凌退思之女 | 青年；命定死亡 | 荆州府 | D5 | 菊花之约、囚禁救援与改命 | 非战斗同伴 | 改命后可 | 回目待考：窗台菊花、棺中毒计 |
| `npc_huantiegan` | 花铁干，落花流水之一 | 中老年；命定死亡待考 | 江南侠门 | D5 | 雪谷崩坏前后两套人格；高背叛风险 | 主运 `sk_jianghutuna`；辅运 `sk_xiangxituna`、`sk_huxixingqi`；外功 `sk_luohualiushuijian`、`sk_nansiqijibenjian` **（原创扩展配置）** | 改命后可 | 回目待考：雪谷困境；个人兵器 / 招名待考，完整精英配装见 chapters/09 §12.7 |
| `npc_xuedaolaozu` | 血刀老祖 | 老年；命定死亡 | `sect_xuedaomen` L5 | D5 | 邪线 / 受制短时同行；不可洗白伤害 | 主运 `sk_xuedaojing`；外功 `sk_xuedaofa`、`sk_xuedaoqinfa`、`sk_xuedaojichudao`、`sk_xuedaorumenquan` | 改命后可 | 回目待考：劫水笙、雪谷 |
| `npc_shuidao` | 水岱，“落花流水”之一，水笙之父 | 中年；命定死亡 | 江南侠门 | D5 | 雪谷救援、女儿关系与改命 | 主运 `sk_jianghutuna`；辅运 `sk_xiangxituna`、`sk_huxixingqi`；外功 `sk_luohualiushuijian`、`sk_nansiqijibenjian` **（原创扩展配置）** | 改命后可 | 回目待考：落花流水围血刀；个人招名待考，完整精英配装见 chapters/09 §12.7 |
| `npc_liurenfeng` | 刘乘风，落花流水之一 | 中年；命定死亡 | 江南侠门 | D4 | 雪谷大战前短窗；可改命 | 主运 `sk_jianghutuna`；辅运 `sk_xiangxituna`、`sk_huxixingqi`；外功 `sk_luohualiushuijian`、`sk_nansiqijibenjian` **（原创扩展配置）** | 改命后可 | 回目待考：雪谷大战；个人兵器 / 招名待考，完整精英配装见 chapters/09 §12.7 |
| `npc_lutianshu` | 陆天抒，落花流水之一 | 中年；命定死亡 | 江南侠门 | D4 | 雪谷大战前短窗；可改命 | 主运 `sk_jianghutuna`；辅运 `sk_xiangxituna`、`sk_huxixingqi`；外功 `sk_luohualiushuijian`、`sk_nansiqijibenjian` **（原创扩展配置）** | 改命后可 | 回目待考：雪谷大战；个人兵器 / 招名待考，完整精英配装见 chapters/09 §12.7 |
| `npc_qichangfa` | 戚长发，铁索横江 | 中老年；命定结局待考 | 梅念笙门下 / 戚门 | D5 | 宝藏贪念、父女关系与揭罪 | 主运 `sk_meinianshengxinfa`；外功 `sk_tangshijian`、`sk_qingfengjian`、`sk_huiliuquan`、`sk_jianghurumenjian` | 改命后可 | 回目待考：装死、天宁寺宝藏 |
| `npc_wanzhenshan` | 万震山，五云手 | 中老年；命定结局待考 | `sect_wanjia` L5 | D5 | 师门谋害与万府阴谋；邪线合作 / 问责 | 主运 `sk_meinianshengxinfa`；外功 `sk_tangshijian`、`sk_wanjiajian`、`sk_wanjiaquan`、`sk_wanjiajibenjian` | 改命后可 | 回目待考：万府、砌墙秘密 |
| `npc_yandaping` | 言达平，陆地神龙 | 中老年；命定死亡待考 | 梅念笙门下 | D5 | 化名接近狄云、藏宝图争夺 | 主运 `sk_meinianshengxinfa`；外功 `sk_tangshijian`、`sk_qingfengjian`、`sk_wuyingshou`、`sk_jianghurumenjian` | 改命后可 | 回目待考：老乞丐传剑、宝藏 |
| `npc_meiniansheng` | 梅念笙，铁骨墨萼 | 老年；前史命定死亡 | 梅念笙传承 | D5（回忆 / 改命） | 前史投影或改命；主体只留传承 | 神照经、连城诀待图鉴 | 传承 | 回目待考：丁典追述 |
| `npc_wangui` | 万圭，万震山之子 | 青年；命定结局待考 | `sect_wanjia` L3 | D5 | 陷害狄云、戚芳婚姻与谋杀；高背叛 | 主运 `sk_wanjiazhengqi`；外功 `sk_wanjiaanshenquan`、`sk_wanjiajian`、`sk_wanjiaquan`、`sk_wanjiajibenjian` | 改命后可 | 回目待考：万府陷害、结局 |
| `npc_lingtusi` | 凌退思，荆州知府 | 中老年；命定结局待考 | 官府 / 龙沙帮关系待考 | D5 | 官狱与宝藏阴谋；邪线政治合作 | 主运 `sk_jingzhouyangqigong`；外功 `sk_jingzhouguanfuqinfa`、`sk_yuzhongqinna`、`sk_huiliuquan`、`sk_tongxingfeishi`；非顶级武者 | 否 | 回目待考：荆州牢狱、毒棺 |
| `npc_baoxiang` | 宝象，血刀门僧 | 壮年；命定死亡 | `sect_xuedaomen` | D4 | 追杀段前极短邪线窗口 | 主运 `sk_xuedaoxinfa`；外功 `sk_xuedaofa`、`sk_xuedaoqinfa`、`sk_xuedaojichudao`、`sk_xuedaorumenquan` | 改命后可 | 回目待考：狄云逃狱后 |
| `npc_lukun` | 鲁坤，万震山大弟子 | 青壮；生卒待考 | `sect_wanjia` L3 | D3 | 万门霸凌问责与同门裂变 | 万家剑法待图鉴 | 否 | 回目待考：狄云入万府 |
| `npc_zhouqi09` | 周圻，万震山二弟子 | 青壮；生卒待考 | `sect_wanjia` L3 | D3 | 同门任务与揭露陷害 | 万家剑法待图鉴 | 否 | 回目待考：狄云入万府 |
| `npc_sunjun` | 孙均，万震山弟子 | 青壮；生卒待考 | `sect_wanjia` L3 | D3 | 比剑冲突、是否协助诬陷 | 万家剑法待图鉴 | 否 | 回目待考：万府比剑 |
| `npc_buyuan` | 卜垣，万震山弟子 | 青壮；生卒待考 | `sect_wanjia` L3 | D3 | 诡计与同门证词任务 | 万家剑法待图鉴 | 否 | 回目待考：万府陷害 |
| `npc_wukan` | 吴坎，万震山弟子 | 青壮；命定死亡待考 | `sect_wanjia` L3 | D4 | 戚芳纠葛与万震山杀机前改命 | 万家剑法待图鉴 | 改命后可 | 回目待考：万府内讧 |
| `npc_fengtan` | 冯坦，万震山弟子 | 青壮；生卒待考 | `sect_wanjia` L3 | D3 | 万门支线与证词 | 万家剑法待图鉴 | 否 | 回目待考：万府 |
| `npc_shencheng` | 沈城，万震山弟子 | 青壮；生卒待考 | `sect_wanjia` L3 | D3 | 万门支线与证词 | 万家剑法待图鉴 | 否 | 回目待考：万府 |
| `npc_wangxiaofeng` | 汪啸风，水笙表兄 / 同行 | 青年；终段生死不明（待考） | 江南侠门 | D4 | 误认追逐、出谷证言与天宁寺选择链；只有明确死亡演出才写 `dead` | 剑法待图鉴核配 | 否 | 回目待考：追逐血刀老祖、出谷、天宁寺 |
| `npc_taohong` | 桃红，万府人物 | 青年；生卒与最终去向待考 | `sect_wanjia` 关系人 | D4 | 早期伪证责任、被逐后的砌墙线索与保护取证支线 | 非战斗证人 / 内宅情报 | 否 | 回目待考：万府构陷、夜间砌墙线索 |
| `npc_kongxincai` | 空心菜，戚芳之女 | 幼童；生卒待考 | 戚家 / 万家 | D3（非战斗） | 仅作保护与托孤对象；不得进入付费战斗雇佣池，安全后随监护人同行 | 非战斗儿童 | 否 | 回目待考：夹墙救援、狄云归雪谷 |

合计：27 名。


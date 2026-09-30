# NPC 名录 · 03 神雕侠侣

> 归属（基准 §18）：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。年代 1237–1259，引用 `design/02`。
> 上游：`docs/decisions/author-requirements.md`（含 AR-18）、`docs/decisions/author-decisions.md`、`docs/00-canon.md` v1.8、`docs/decisions/rulings-v1.md`。
> 引用而不重定义：武学性质、调息档案与路线门槛读取对应武学图鉴现值；主辅运与外功相性见 `design/05` §5.2–5.4；本界首领配装与七参见 `design/chapters/03-shendiao.md` §12.8。纯 ID 引用不另存性质副本。
> 标注约定：原著没有的内容标**（原创扩展）**；原著事实待逐字核对标**（待考）**；技术事实未确认标**（待核实）**；实机或账号验证标**（待实测）**；暂定数值标**【建议值】**。
> 同一人物的少年 / 十六年后画像共用 ID；射雕故人按重逢规则处理。出处回目待逐字核对。
> 版本：v1.4；全局审计（2026-09-26）；经脉落地终审（2026-09-29）；NXfixD-03 书界收尾同步（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_yangguo` | 杨过，神雕侠 | 少年→壮年；卒年待考 | `sect_gumu` / 杨过传承 | D5 | 少年线可早招；十六年后需断肠崖重逢与立场链 | 主运 `sk_jiuyin`，首领画像 12 品 9 重；外功 `sk_xuantie`、`sk_anran` | 同书成长 | 回目待考：古墓、剑冢、十六年之约 |
| `npc_xiaolongnv` | 小龙女，古墓掌门 | 青年；卒年待考 | `sect_gumu` L5 | D5 | 古墓门规、绝情谷与十六年之约 | `sk_yunvxinjing`、`sk_suxin`、`sk_zuoyouhubo` | 否 | 回目待考：古墓、绝情谷 |
| `npc_guojing` | 郭靖，襄阳守将 / 大侠 | 中年；卒年待考 | 丐帮盟友 / 襄阳 | D5 | 射雕旧识可走重逢；守城期间限定同行 | `sk_xianglong18`、`sk_jiuyin`、`sk_wumuyishu` | ←射雕 | 回目待考：襄阳守城 |
| `npc_huangrong` | 黄蓉，丐帮帮主 / 守城者 | 中年；卒年待考 | `sect_gaibang` L5 / 桃花岛 | D5 | 重逢、丐帮与子女安危链 | `sk_dagou`、`sk_jiuyin`、桃花岛武学 | ←射雕 | 回目待考：英雄大会、襄阳 |
| `npc_guofu` | 郭芙，郭靖黄蓉长女 | 少女→青年；卒年待考 | 桃花岛 / 襄阳 | D4 | 过错、断臂与襄阳成长线 | 家传武学按图鉴核配 | 否 | 回目待考：英雄大会、襄阳 |
| `npc_guoxiang` | 郭襄，郭二小姐 | 少女；后世卒年待考 | 峨眉前身 | D5 | 风陵渡、生日与少室山前缘；时段限定 | 峨眉前身武学待画像核配 | →倚天传承 | 回目待考：风陵渡、襄阳生日 |
| `npc_wudunru` | 武敦儒，武三通之子 | 青年；卒年待考 | 大理武氏 / 襄阳 | D3 | 武氏兄弟和解与守城任务 | `sk_yiyangzhi` 等需按传承核配 | 否 | 回目待考：桃花岛、襄阳 |
| `npc_wuxiuwen` | 武修文，武三通之子 | 青年；卒年待考 | 大理武氏 / 襄阳 | D3 | 同上，独立关系状态 | `sk_yiyangzhi` 等需按传承核配 | 否 | 回目待考：桃花岛、襄阳 |
| `npc_wusantong` | 武三通，一灯弟子 | 中老年；卒年待考 | `sect_dali` | D4 | 疯病、家事与师门任务 | `sk_yiyangzhi` | 否 | 回目待考：陆家庄、绝情谷 |
| `npc_limochou` | 李莫愁，赤练仙子 | 中年；命定死亡待考 | `sect_gumu` 叛出 | D5 | 正邪线、陆家旧债与绝情谷改命 | 主运 `sk_chiliandugong`；外功 `sk_chilianfuchen`、`sk_chilianshenzhang`、`sk_bingpoyinzhen` | 改命后可 | 回目待考：陆家庄、绝情谷 |
| `npc_luwushuang` | 陆无双，李莫愁弟子 | 青年；卒年待考 | 古墓旁支 | D4 | 逃离师门、表姊重逢与伤足治疗 | 古墓 / 李莫愁系已收录项核配 | 否 | 回目待考：江南、傻姑店 |
| `npc_chengying` | 程英，黄药师弟子 | 青年；卒年待考 | `sect_taohuadao` | D4 | 陆家遗孤与桃花岛信任线 | `sk_lanhuafuxueshou`、桃花岛药理 | 否 | 回目待考：陆家庄、绝情谷外 |
| `npc_gongsunzhi` | 公孙止，绝情谷主 | 中年；命定死亡待考 | `sect_jueqinggu` L5 | D5 | 邪线 / 揭露谷中旧案；高背叛风险 | 主运 `sk_jueqingbixuejue`；外功 `sk_jindaoheijianjue`、`sk_jueqingjian` | 改命后可 | 回目待考：绝情谷婚宴 |
| `npc_qiuqianchi` | 裘千尺，铁掌莲花 | 中老年；命定死亡待考 | `sect_jueqinggu` / 铁掌传承 | D5 | 地穴救援、复仇取舍 | 主运 `sk_tiezhangyunqigong`（9 品／9 重，阳），辅运 `sk_tiezhangxinfa`、`sk_tiezhangzhuang`（均阳）；外功 `sk_tiezhang`（完整 10 品）、`sk_zaoheding`（阴）、`sk_duanfengzhang`、`sk_heishazhang`。阳主运施展枣核钉时 Z5 `−12%`、无豁免；同性质阳招的三运同源 `+4%` 照常计。玩家铁掌来源另为 9 品、最高 9 重残承 | 改命后可 | 回目待考：绝情谷地穴 |
| `npc_gongsunlve` | 公孙绿萼，绝情谷主之女 | 青年；命定死亡 | `sect_jueqinggu` | D5 | 情花毒解药与牺牲节点；可改命 | 绝情谷武学按图鉴核配 | 改命后可 | 回目待考：丹房、地穴 |
| `npc_jinlunfawang` | 金轮法王，蒙古国师 | 中老年；命定死亡待考 | `sect_mizong` | D5 | 蒙古邪线或郭襄救援后的改命线 | `sk_longxiang` | 改命后可 | 回目待考：英雄大会、襄阳高台 |
| `npc_huodu` | 霍都，蒙古王子 / 密宗弟子 | 壮年；命定死亡待考 | `sect_mizong` | D4 | 英雄大会、丐帮卧底揭露前窗口 | 主运 `sk_jinganghufagong`，辅运 `sk_mizonghufashen`、`sk_zhuohuogong`（均阳）；外功 `sk_xueshantieshan`、`sk_huodushanfa`（均阴）、`sk_falunshou`、`sk_jingangjue`。两门阴性扇法按 `design/05` §5.3 在 Z5 均计 `−12%`、无豁免；同性质阳招的三运同源 `+4%` 照常计 | 改命后可 | 回目待考：英雄大会、丐帮大会 |
| `npc_daerba` | 达尔巴，金轮弟子 | 壮年；卒年待考 | `sect_mizong` | D4 | 忠诚与误会澄清线 | `sk_jingangxiangmochu` | 否 | 回目待考：英雄大会、再遇杨过 |
| `npc_yelvqi` | 耶律齐，丐帮帮主 / 辽裔 | 青年；卒年待考 | `sect_quanzhen` / `sect_gaibang` | D4 | 英雄大会、丐帮继任与襄阳 | `sk_kongming`、全真武学核配 | 否 | 回目待考：英雄大会、丐帮大会 |
| `npc_yelvyan` | 耶律燕，耶律齐之妹 | 青年；卒年待考 | 辽裔 / 襄阳 | D3 | 武氏关系与守城任务 | 全真旁传待核配 | 否 | 回目待考：英雄大会后 |
| `npc_wanyanping` | 完颜萍，金国遗民 | 青年；卒年待考 | 金国遗民 | D4 | 复仇与放下任务 | 掌法待对应图鉴收录 | 否 | 回目待考：刺耶律楚材 |
| `npc_hezudao` | 何足道，昆仑三圣 | 青年；卒年待考 | `sect_kunlun` 前身 | D5 | 少室山论剑琴棋线；仅末段窗口 | 昆仑图鉴已收录项核配 | →倚天楔子 | 回目待考：华山 / 少室山前缘 |
| `npc_zhangsanfeng` | 张君宝，觉远弟子 | 少年；小说生年待考 | 少林旁学 / 武当前身 | D5 | 神雕末短窗结缘，倚天可重逢 | 少年九阳见闻；后世补 `sk_taijiquan` `sk_taijijian` | →倚天 | 回目待考：华山、少室山 |
| `npc_jueyuan` | 觉远，少林藏经阁僧 | 老年；命定死亡 | `sect_shaolin` | D5 | 少室山逃亡前短窗；改命会影响九阳传承 | `sk_jiuyang` | 传承 / 改命 | 回目待考：楔子九阳传承 |
| `npc_shendiao` | 神雕，独孤求败遗伴 | 年龄不详 | 剑冢 | D4 | 剑冢试炼、无需人类好感逻辑 | `sk_xuantie` 传承辅助 | 否 | 回目待考：剑冢伴杨过练剑 |
| `npc_zhoubotong` | 周伯通，老顽童 | 老年；生卒待考 | 全真传承 | D4 | 射雕旧识重逢或百花谷新识 | `sk_kongming`、`sk_zuoyouhubo` | ←射雕 | 回目待考：百花谷 |
| `npc_huangyaoshi` | 黄药师，东邪 | 老年；生卒待考 | `sect_taohuadao` L5 | D5 | 射雕旧识、杨过忘年交与襄阳阵法 | 主运 `sk_taohuaguiyuanjue`（神雕完整 11 品），首领画像 11 品 9 重；桃花岛外功按图鉴核配 | ←射雕 | 回目待考：陆家庄、襄阳 |
| `npc_hongqigong` | 洪七公，北丐 | 老年；华山命定死亡 | `sect_gaibang` 前帮主 | D5 | 华山前短窗；可改命但须处理欧阳锋 | `sk_xianglong18`、`sk_dagou` | ←射雕 | 回目待考：华山雪峰 |
| `npc_ouyangfeng` | 欧阳锋，疯癫西毒 | 老年；华山命定死亡 | 白驼山残脉 | D5 | 杨过义父线；与洪七公同一改命事件 | `sk_hama`、`sk_nizhuanjingmai` | ←射雕 | 回目待考：华山雪峰 |
| `npc_yideng` | 一灯大师，南帝 | 老年；生卒待考 | `sect_dali` | D5 | 慈恩、瑛姑与绝情谷救治线 | `sk_yiyangzhi` | ←射雕 | 回目待考：绝情谷解毒 |
| `npc_qiuqianren` | 慈恩（裘千仞），一灯弟子 | 老年；生卒待考 | `sect_dali`；前铁掌帮 | D5 | 须完成旧罪、瑛姑与一灯关系链；只在悔悟后开放 | `sk_tiezhang` | ←射雕 | 回目待考：百花谷 / 瑛姑旧事 |
| `npc_zhuziliu` | 朱子柳，一灯弟子 | 中老年；生卒待考 | `sect_dali` | D4 | 绝情谷援救、师门许可与襄阳守城 | `sk_yiyangzhi`；笔法按图鉴来源 | ←射雕 | 回目待考：绝情谷、襄阳 |
| `npc_fanyiweng` | 樊一翁，绝情谷大弟子 | 中老年；命定结局待考 | `sect_jueqinggu` L4 | D4 | 绝情谷冲突后须完成门人善后与立场选择 | 绝情谷杖法按图鉴来源 | 否 | 回目待考：绝情谷 |
| `npc_fengmofeng` | 冯默风，黄药师弟子 | 中老年；命定死亡待考 | `sect_taohuadao` | D4 | 蒙古军阵前短窗；救援或改命后才可持续同行 | 桃花岛武学按图鉴来源 | 否 | 回目待考：铁匠铺、蒙古军阵 |
| `npc_xiaoxiangzi` | 潇湘子，蒙古阵营江湖高手 | 中老年；命定结局待考 | 蒙古招揽高手 | D5 | 敌对路线、神雕结尾争夺经文后的极短窗口 | 哭丧棒法按图鉴来源 | →倚天楔子因果 | 回目待考：蒙古军营、华山后续 |

合计：35 名。

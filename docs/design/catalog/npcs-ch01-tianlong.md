# NPC 名录 · 01 天龙八部

> 归属：`design/18-npc-and-companions.md` 的主线重要 NPC 数据；本文只列人物画像，不重定义招募、数值、武学或任务规则。
> 年代：1093–1094，引用 `design/02`；人物生卒多为小说未明，按年龄段或（待考）登记。
> 标注：出处均以三联 / 广州修订版为基线；未逐字核对回目号者明确写“回目待考”，不编造编号。
> 版本：v1.4；全局审计（2026-09-26）；经脉落地终审（2026-09-29）。
> 首领配装同步：本轮复核 `chapters/01-tianlong.md` §12.8，段延庆、萧峰、童姥、游坦之、玄慈的已登记主运 / 外功仍与章节一致；新增游骥、游驹完整实战配装。二人当前同源主运仅 5 品，低于手配精英 `G−1=6`，正式生产须按章节所列缺口阻断。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_xiaofeng` | 萧峰（乔峰），丐帮前帮主、辽南院大王 | ?–1094（推算；卒年随雁门关结局） | `sect_gaibang` / `sect_qidan` | D5 | 聚贤庄与雁门关之间的短时同行；改命线可救回 | 主运 `sk_xianglongxinggong`；外功 `sk_xianglong18`、`sk_qinlonggong` | 死亡 / 改命回响 | 回目待考：身世、聚贤庄、雁门关 |
| `npc_duanyu` | 段誉，大理镇南王世子 | 青年；卒年待考 | `sect_dali` | D5 | 大理线相识，尊重王语嫣与家国选择 | `sk_beiming`、`sk_lingbo`、`sk_liumai` | 可留传承 | 回目待考：无量山至大理归国 |
| `npc_xuzhu` | 虚竹，少林僧、灵鹫宫主 | 青年；卒年待考 | `sect_shaolin` / `sect_lingjiu` | D5 | 珍珑、灵鹫宫责任与品德门槛 | `sk_xiaowuxiang`、`sk_bahuang`、`sk_liuyangzhang` | 可留传承 | 回目待考：珍珑棋局、灵鹫宫 |
| `npc_wangyuyan` | 王语嫣，武学见闻渊博 | 青年；生卒待考 | 姑苏王氏 / `sect_murong` 关系 | D4 | 曼陀山庄脱困；不得把情感选择物化为好感门槛 | `full` 见闻型；武学待对应画像 | 否 | 回目待考：曼陀山庄、江南同行 |
| `npc_azhu` | 阿朱，慕容家侍女、萧峰知己 | ?–1093/1094（推算，命定死亡） | `sect_murong` | D5 | 易容与查身世任务；小镜湖前可改命 | 图鉴待收录；`pers_jinshen` | 改命后可 | 回目待考：少林易容、小镜湖 |
| `npc_azi` | 阿紫，星宿弟子 | 少女；卒年随分支待考 | `sect_xingxiu` | D4 | 品德偏低或完成戒毒 / 姐妹线；高背叛风险 | `sk_huagong` 等星宿已收录项 | 否 | 回目待考：小镜湖、辽国 |
| `npc_murongfu` | 慕容复，姑苏慕容家主 | 青壮；卒年待考 | `sect_murong` | D5 | 复国线与放下线互斥；可正邪两路同行 | `sk_douzhuan`、`sk_murongjian` | 否 | 回目待考：还施水阁、少室山 |
| `npc_murongbo` | 慕容博，复国谋主 | 老年；卒年待考 | `sect_murong` | D5 | 少室山真相后仅改命 / 悔悟窗口 | `sk_douzhuan`；少林武学按图鉴核配 | 否 | 回目待考：藏经阁真相 |
| `npc_jiumozhi` | 鸠摩智，吐蕃国师 | 壮年；卒年待考 | `sect_mizong` | D5 | 天龙寺 / 曼陀山庄冲突；散功醒悟后窗口 | `sk_huoyandao`、`sk_xiaowuxiang` | 否 | 回目待考：天龙寺、枯井散功 |
| `npc_duanzhengchun` | 段正淳，大理镇南王 | 壮年；?–1094（推算，命定死亡） | `sect_dali` | D5 | 大理政务 + 诸段关系线；小镜湖后改命 | `sk_yiyangzhi` | 改命后可 | 回目待考：大理王府、小镜湖 |
| `npc_daobaifeng` | 刀白凤，镇南王妃 | 壮年；命定结局待考 | `sect_dali` | D4 | 身世秘密与王府线；不可用送礼越过 | 待对应图鉴收录（不预建 ID） | 改命后可 | 回目待考：玉虚观、段誉身世 |
| `npc_duanyanqing` | 段延庆，四大恶人之首 | 中老年；卒年待考 | `sect_sidaeren` / 大理皇族 | D5 | 身世真相、段誉选择与邪线限定 | 主运 `sk_duanshiyangjue`；外功 `sk_yiyangzhi` | 否 | 回目待考：万劫谷、少室山 |
| `npc_yuelaosan` | 岳老三（南海鳄神） | 壮年；命定死亡待考 | `sect_sidaeren` | D4 | 守诺与师徒喜剧线；死亡前改命窗口 | 待对应图鉴收录（不预建 ID） | 改命后可 | 回目待考：万劫谷、救段誉 |
| `npc_yunzhonghe` | 云中鹤，四大恶人 | 壮年；卒年待考 | `sect_sidaeren` | D4 | 邪线、严格品德代价；犯罪行为不可洗白 | 轻功待对应图鉴收录（不预建 ID） | 否 | 回目待考：万劫谷等 |
| `npc_yeerniang` | 叶二娘，四大恶人 | 中年；命定死亡待考 | `sect_sidaeren` | D5 | 虚竹身世与赎罪分支 | 少林关联武学待核配 | 改命后可 | 回目待考：少室山认子 |
| `npc_dingchunqiu` | 丁春秋，星宿派掌门 | 老年；卒年待考 | `sect_xingxiu` | D5 | 邪线可同行；正线需废功 / 受制窗口 | `sk_huagong`、`sk_sanxiaoxiaoyaosan` | 否 | 回目待考：擂鼓山、少室山 |
| `npc_wuyazi` | 无崖子，逍遥派掌门 | 高龄；命定死亡待考 | `sect_xiaoyao` | D5 | 珍珑前短时 / 精神同行；改命须处理传功 | `sk_beiming`、`sk_xiaowuxiang` | 传承 | 回目待考：擂鼓山传功 |
| `npc_tonglao` | 天山童姥，灵鹫宫主 | 高龄；命定死亡待考 | `sect_lingjiu` | D5 | 三十六洞危机与返老阶段窗口 | 主运 `sk_tianshanliuyangxinfa`；辅运 `sk_zuowangxinfa`、`sk_lingjiuxinfa`；外功 `sk_liuyangzhang`、`sk_zhemei`、`sk_shengsifu`、`sk_piaomiaojian` | 传承 / 改命 | 回目待考：西夏冰窖 |
| `npc_liqiushui` | 李秋水，西夏太妃 | 高龄；命定死亡待考 | `sect_xiaoyao` / `sect_yipintang` | D5 | 与童姥互斥后再和解；西夏身份限制 | `sk_xiaowuxiang`、`sk_baihongzhang` | 传承 / 改命 | 回目待考：冰窖相斗 |
| `npc_suxinghe` | 苏星河，聪辩先生 | 中老年；卒年待考 | `sect_xiaoyao` | D4 | 解珍珑外围谜题并保护函谷门人 | 逍遥杂学按图鉴核配 | 否 | 回目待考：擂鼓山 |
| `npc_xuemuhua` | 薛慕华，阎王敌 | 中年；卒年待考 | `sect_xiaoyao` | D4 | 聚贤庄救治抉择、医者责任 | `pers_yizhe`；医术技能待图鉴 | 否 | 回目待考：聚贤庄救阿朱 |
| `npc_youtanzhi` | 游坦之，聚贤庄少主 | 青年；命定死亡待考 | `sect_juxianzhuang` / 星宿关系 | D4 | 阿紫线与自我选择；避免纯工具化 | 主运 `sk_yijinjing`；外功 `sk_bingcanduzhang`、`sk_youshishuangqiang`、`sk_shuangxiongdundao`、`sk_zhuangkequan` | 改命后可 | 回目待考：冰蚕、少室山 |
| `npc_youji` | 游骥，聚贤庄主之一 | 中年；命定死亡待考 | `sect_juxianzhuang` | D4 | 英雄宴前调停 / 改命 | `full`；主运 `sk_juxianyijue`；辅运 `sk_dantianyangqi`、`sk_huxixingqi`；外功 `sk_youshishuangqiang`、`sk_shuangxiongdundao`、`sk_youjiaduanqiang`、`sk_zhuangkequan`；主运品阶缺口见章节 §12.8.1 | 改命后可 | 回目待考：聚贤庄英雄宴 |
| `npc_youju` | 游驹，聚贤庄主之一 | 中年；命定死亡待考 | `sect_juxianzhuang` | D4 | 与游骥共享危机但各自招募状态 | `full`；主运 `sk_juxianyijue`；辅运 `sk_dantianyangqi`、`sk_huxixingqi`；外功 `sk_shuangxiongdundao`、`sk_youjiadao`、`sk_hengdaorumenzhao`、`sk_zhuangkequan`；主运品阶缺口见章节 §12.8.1 | 改命后可 | 回目待考：聚贤庄英雄宴 |
| `npc_xuanci` | 玄慈，少林方丈 | 老年；命定死亡待考 | `sect_shaolin` L5 | D5 | 带头大哥真相与寺规承担 | 主运 `sk_jinzhongzhao`；外功 `sk_nianhuazhi`、`sk_boruozhang`、`sk_dajingangquan`、`sk_longzhaoshou`、`sk_luohanquan` | 改命后可 | 回目待考：少室山身世揭晓 |
| `npc_saodiseng` | 扫地僧，藏经阁无名高僧 | 耄耋；生卒不详 | `sect_shaolin` | D5 | 藏经阁止斗后短时同行 / 结盟 | `sk_yijinjing` 等需谨慎核配 | 否 | 回目待考：藏经阁止息慕容萧氏 |
| `npc_abi` | 阿碧，慕容家侍女 | 青年；卒年待考 | `sect_murong` | D3 | 琴韵小筑、忠诚与慕容复结局 | 乐理 / 水路辅助，武学待核配 | 否 | 回目待考：琴韵小筑、结局陪伴 |
| `npc_muwanqing` | 木婉清，修罗刀传人 | 青年；卒年待考 | 秦红棉一系 | D4 | 大理身世与誓言冲突 | 暗器 / 刀法待对应图鉴收录 | 否 | 回目待考：无量山后、大理身世 |
| `npc_zhongling` | 钟灵，万劫谷少女 | 少女；卒年待考 | 万劫谷 / 神农帮关系 | D4 | 闪电貂救援、父母关系线 | 驭兽 / 毒抗；武学待图鉴 | 否 | 回目待考：无量山、万劫谷 |
| `npc_kurong` | 枯荣大师，天龙寺高僧 | 老年；卒年待考 | `sect_tianlongsi` L5 | D4 | 保经护寺、段氏身份或高声望 | `sk_liumai`、`sk_yiyangzhi` | 传承 | 回目待考：天龙寺护经 |
| `npc_duanzhengming` | 段正明（保定帝），大理国主 | 中年；生卒待考 | `sect_dali` L5 | D5 | 天龙寺危机与段氏家国线；只在国事许可的短窗同行 | `sk_yiyangzhi`；六脉传承按图鉴门槛 | 否 | 回目待考：大理救援、天龙寺护经 |
| `npc_xiaoyuanshan` | 萧远山，萧峰生父 | 老年；卒年待考 | 契丹 / 少室山旧案 | D5 | 雁门旧案与藏经阁对质后开放悔悟短窗 | 少林旁学按图鉴既有来源核配 | 否 | 回目待考：雁门旧案、藏经阁对质 |
| `npc_baobutong` | 包不同，慕容家臣 | 中年；卒年待考 | `sect_murong` L4 | D4 | 燕子坞立场与复国取舍；须取得本人认可 | 慕容家已收录武学核配 | 否 | 回目待考：江南同行、少室山 |
| `npc_fengboe` | 风波恶，慕容家臣 | 中年；卒年待考 | `sect_murong` L4 | D4 | 切磋、追击与慕容家路线；败而不辱后可同行 | 慕容家已收录武学核配 | 否 | 回目待考：江南诸役 |
| `npc_dengbaichuan` | 邓百川，慕容家臣 | 中年；卒年待考 | `sect_murong` L4 | D4 | 燕子坞组织线与复国资源取舍 | 慕容家已收录武学核配 | 否 | 回目待考：燕子坞、少室山 |
| `npc_zuozimu` | 左子穆，无量剑东宗人物 | 中年；生卒待考 | `sect_wuliang` | D4 | 无量山冲突停战、门人安全与玉壁秘密 | 无量剑系按图鉴核配 | 否 | 回目待考：无量剑比斗 |
| `npc_xinshuangqing` | 辛双清，无量剑西宗人物 | 中年；生卒待考 | `sect_wuliang` | D4 | 无量山两宗证词、受困门人救援与停战 | 无量剑系按图鉴核配 | 否 | 回目待考：无量剑比斗 |
| `npc_baishijing` | 白世镜，丐帮执法长老 | 中年；命定结局待考 | `sect_gaibang` L4 | D5 | 马大元旧案揭露前的邪线短窗；事败后按生死状态处理 | 丐帮擒拿武学按图鉴来源 | 否 | 回目待考：杏子林、马大元旧案 |
| `npc_wuchangfeng` | 吴长风，丐帮长老 | 中老年；生卒待考 | `sect_gaibang` L4 | D4 | 杏子林立场、帮务贡献与长老许可 | 丐帮刀法按图鉴来源 | 否 | 回目待考：杏子林、少室山 |
| `npc_sikongxuan` | 司空玄，神农帮帮主 | 中年；命定结局待考 | 神农帮（组织 ID 待 `design/17` 裁定） | D4 | 无量山毒伤与生死符危机；解毒或解符后开放 | 医毒与神农帮武学按图鉴来源 | 否 | 回目待考：无量山神农帮 |

合计：40 名。


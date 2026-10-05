# NPC 名录 · 02 射雕英雄传

> 归属：`design/18-npc-and-companions.md` 的主线重要 NPC 数据。年代 1217–1227（楔子 1199），引用 `design/02`。
> 跨书人物必须复用同一 `npc_*`；江南七怪命定死亡与改命以 `design/01` 为上游。以下章号与章题已于 2026-09-26 逐章检索“金庸网《射雕英雄传》修订版”在线转录 [N01]，只作交叉核对；该站版本元数据与文字可靠性不等同纸本，发布前仍须按三联 / 广州修订版终校。
> 版本：v1.4；全局审计（2026-09-26）；经脉落地终审（2026-09-29）；NXfixD-02 / NXfixE-a 首领武学栏同步（2026-09-29）；阴阳性质同步 AR-18（2026-09-30）。

| ID | 人物 / 原著身份 | 生卒 / 年龄 | 门派 / 阵营 | 层级 | 招募要点 | 能力要点 | 跨书 | 出处定位 |
|---|---|---|---|---|---|---|---|---|
| `npc_guojing` | 郭靖，蒙古长大的忠良之后 | 约 1200 前后（推算）–? | 江南七怪 / 丐帮盟友 | D5 | 大漠、桃花岛与襄阳价值观链 | `sk_xianglong18`、`sk_jiuyin`、`sk_kongming` | →神雕 | [N01] 第03章《大漠风沙》；第40章《华山论剑》 |
| `npc_huangrong` | 黄蓉，桃花岛主之女 | 少女（推算）–? | `sect_taohuadao` / `sect_gaibang` | D5 | 食艺、丐帮继任与郭靖关系链 | `sk_dagou`、`sk_jiuyin`、桃花岛已收录武学 | →神雕 | [N01] 第07章《比武招亲》；第27章《轩辕台前》 |
| `npc_huangyaoshi` | 黄药师，东邪 | 中老年；生卒待考 | `sect_taohuadao` L5 | D5 | 桃花岛考验与门人旧案 | 主运 `sk_taohuaguiyuanjue`（射雕残承 10 品 9 重）；辅运 `sk_taohuatunaxi`、`sk_yaoputunaxi`；外功 `sk_tanzhi`、`sk_bihai`、`sk_lanhuafuxueshou`、`sk_yuxiaojianfa`、`sk_luoyingshenjianzhang` | →神雕 | [N01] 第14章《桃花岛主》；第40章《华山论剑》 |
| `npc_ouyangfeng` | 欧阳锋，西毒 | 中老年；卒于神雕华山（年份待考） | `sect_baituoshan` L5 | D5 | 射雕邪线；逆经后关系重构 | 主运 `sk_hama`；辅运 `sk_dumaihuqigong`、`sk_shexingtunaxi`；外功 `sk_lingshezhangfa`、`sk_lingshequan`、`sk_shentuoxueshanzhang`、`sk_duwushou`、`sk_shamozhang`；`sk_nizhuanjingmai` 仅为桃花 / 华山逆行能力的叙事来源与脚本姿态，不入首领装配 | →神雕 | [N01] 第15章《神龙摆尾》；第40章《华山论剑》 |
| `npc_hongqigong` | 洪七公，北丐 | 老年；卒于神雕华山（年份待考） | `sect_gaibang` L5 | D5 | 美食与侠义线；帮务窗口 | 主运 `sk_xianglongxinggong`；辅运 `sk_jiudaixingong`、`sk_gaibanghuxinfa`；外功 `sk_xianglong18`、`sk_dagou`、`sk_xiaoyaoyou`、`sk_lianhuazhang`；单人华山请教不装 `sk_dagouzhen` | →神雕 | [N01] 第12章《亢龙有悔》；第40章《华山论剑》 |
| `npc_yideng` | 一灯大师（段智兴），南帝 | 中老年；生卒待考 | `sect_dali` | D5 | 瑛姑 / 周伯通旧事与疗伤抉择 | `sk_yiyangzhi`；先天功待对应图鉴收录（不预建 ID） | →神雕 | [N01] 第30章《一灯大师》；旧事见第31章《鸳鸯锦帕》 |
| `npc_zhoubotong` | 周伯通，老顽童 | 中老年；生卒待考 | `sect_quanzhen` | D4 | 桃花岛脱困与游戏式试炼 | 主运 `sk_jiuyin`；辅运 `sk_quanzhentunajue`、`sk_quanzhenxinfa`；外功 `sk_kongming`、`sk_zuoyouhubo`、`sk_dafumoquan`、`sk_wantongshuangxi`、`sk_sanhuajudingzhang` | →神雕 | [N01] 第17章《双手互搏》 |
| `npc_qiuchuji` | 丘处机，长春子 | 小说生命轴待考；史实 1148–1227 [H01] | `sect_quanzhen` L4 | D4 | 牛家村赌约善后、门派任务 | 全真图鉴已收录武学核配 | 史实影响 | [N01] 第01章《风雪惊变》；第11章《长春服输》 |
| `npc_wangchuyi` | 王处一，玉阳子 | 小说生命轴待考；史实 1142–1217 [H01] | `sect_quanzhen` L4 | D3 | 王府毒伤与全真关系 | 全真图鉴已收录武学核配 | 否 | [N01] 第06章《崖顶疑阵》；第08章《各显神通》 |
| `npc_mayu` | 马钰，丹阳子 | 小说生命轴待考；史实 1123–1183 [H01]，与小说出场分离 | `sect_quanzhen` L5 | D4 | 大漠授功与掌教许可 | `sk_quanzhenxinfa` 等 | 小说化 | [N01] 第06章《崖顶疑阵》（大漠授功段） |
| `npc_kezhene` | 柯镇恶，江南七怪之首 | 老年；卒年待考 | `sect_jiangnanqiguai` | D4 | 十八年教养、桃花岛改命见证 | `sk_tingshengzhangfa`、`sk_duling` | →神雕 | [N01] 第02章《江南七怪》；第34章《岛上巨变》 |
| `npc_zhucong` | 朱聪，妙手书生 | 壮年；桃花岛命定死亡 | `sect_jiangnanqiguai` | D4 | 七怪羁绊；桃花岛改命可救 | `sk_fenjincuogushou` | 改命后可 | [N01] 第02章《江南七怪》；第34章《岛上巨变》 |
| `npc_hanbaoju` | 韩宝驹，马王神 | 壮年；桃花岛命定死亡 | `sect_jiangnanqiguai` | D4 | 七怪羁绊；改命救援 | 马术 / 鞭法待图鉴 | 改命后可 | [N01] 第02章《江南七怪》；第34章《岛上巨变》 |
| `npc_nanxiren` | 南希仁，南山樵子 | 壮年；桃花岛命定死亡 | `sect_jiangnanqiguai` | D4 | 七怪羁绊；中毒线改命 | `sk_nanshanzhangfa` | 改命后可 | [N01] 第02章《江南七怪》；第34章《岛上巨变》 |
| `npc_quanjinfa` | 全金发，闹市侠隐 | 壮年；桃花岛命定死亡 | `sect_jiangnanqiguai` | D4 | 七怪羁绊；改命救援 | 秤杆武学待图鉴核配 | 改命后可 | [N01] 第02章《江南七怪》；第34章《岛上巨变》 |
| `npc_hanxiaoying` | 韩小莹，越女剑 | 壮年；桃花岛命定死亡 | `sect_jiangnanqiguai` | D4 | 七怪羁绊；改命救援 | `sk_yuenvjian02` | 改命后可 | [N01] 第02章《江南七怪》；第34章《岛上巨变》 |
| `npc_zhangasheng` | 张阿生，笑弥陀 | 壮年；大漠早逝 | `sect_jiangnanqiguai` | D4 | 死亡前短窗；不并入桃花岛五人改命 | 外家武学待图鉴核配 | 传承 | [N01] 第02章《江南七怪》；第04章《黑风双煞》 |
| `npc_yangtiexin` | 杨铁心（穆易），忠良之后 | 中年；命定死亡 | 杨家枪传承 | D5 | 比武招亲与王府救援改命 | `sk_lihuaqiang` | 改命后可 | [N01] 第01章《风雪惊变》；第09章《铁枪破犁》 |
| `npc_baoxiruo` | 包惜弱，杨康之母 | 中年；命定死亡 | 赵王府 / 杨家 | D5 | 身世揭露与撤离任务 | 非战斗同伴 | 改命后可 | [N01] 第01章《风雪惊变》；第09章《铁枪破犁》 |
| `npc_munianci` | 穆念慈，杨铁心义女 | 青年；卒年待考 | 杨家 / 洪七公传承 | D4 | 比武招亲、杨康选择与独立成长 | `sk_xiaoyaoyou` | 否 | [N01] 第08章《各显神通》；第09章《铁枪破犁》 |
| `npc_yangkang` | 杨康，金国小王爷 / 杨氏后人 | 青年；命定死亡 | 赵王府 | D5 | 正邪分支核心；可改命但须承担背叛后果 | 全真 / 杨家武学按图鉴核配 | 后人杨过 | [N01] 第09章《铁枪破犁》；第35章《铁枪庙中》 |
| `npc_wanyanhonglie` | 完颜洪烈，金赵王 | 中年；史实原型与小说身份需分开考 | 金国赵王府 | D5 | 邪线政治合作；只能阶段同行 | 护卫型 `full`，非顶级武者 | 否 | [N01] 第01章《风雪惊变》；第23章《大闹禁宫》 |
| `npc_tuolei` | 拖雷，蒙古王子 | 小说生命轴待考；史实生年约 1191–1193（待考）、1232 卒 [H02] | `sect_menggu` | D4 | 安答关系、宋蒙立场选择 | `sk_menggushuaijiao`、骑射图鉴项 | 否 | [N01] 第03章《大漠风沙》；第36章《大军西征》 |
| `npc_huazheng` | 华筝，蒙古公主 | 青年；卒年待考 | `sect_menggu` | D4 | 情感与军情选择；不以郭靖归属决定人格 | 骑射 / 探索辅助 | 否 | [N01] 第05章《弯弓射雕》；第36章《大军西征》 |
| `npc_zhebie` | 哲别，蒙古神箭手 | 小说生命轴待考；史实卒年约 1223–1225（待考）[H02] | `sect_menggu` | D4 | 大漠救命之恩、部族身份 | `sk_zhebiejianshu` | 否 | [N01] 第03章《大漠风沙》；第05章《弯弓射雕》 |
| `npc_tiemuzhen` | 铁木真 / 成吉思汗 | 小说生命轴待考；史实约 1162–1227 [H02] | `sect_menggu` L5 | D5 | 大漠军功与南征拒命；短时战役同行 | 军阵 / 骑射，具体图鉴核配 | 否 | [N01] 第03章《大漠风沙》；第36章《大军西征》 |
| `npc_meichaofeng` | 梅超风，铁尸 | 壮年；命定死亡 | `sect_taohuadao` 叛徒 | D5 | 黑风双煞旧案、赎罪 / 邪线 | 主运 `sk_jiuyinxieliangong`；辅运 `sk_tongshihenglian`、`sk_taohuatunaxi`；外功 `sk_jiuyinbaigu`、`sk_cuixinzhang`、`sk_baimangbianfa` | 改命后可 | [N01] 第04章《黑风双煞》；第23章《大闹禁宫》 |
| `npc_chenxuanfeng` | 陈玄风，铜尸 | 壮年；大漠命定死亡 | `sect_taohuadao` 叛徒 | D4 | 大漠遭遇前极短窗；改命改变郭靖童年线 | 主运 `sk_jiuyinxieliangong`；辅运 `sk_tongshihenglian`、`sk_taohuatunaxi`；外功 `sk_jiuyinbaigu`、`sk_cuixinzhang`、`sk_baimangbianfa` | 改命后可 | [N01] 第04章《黑风双煞》 |
| `npc_qiuqianren` | 裘千仞，铁掌帮帮主 | 中老年；后归一灯，卒年待考 | `sect_tiezhangbang` L5 | D5 | 铁掌峰正邪线与悔悟支线 | 主运 `sk_tiezhangyunqigong`；辅运 `sk_tiezhangxinfa`、`sk_tiezhangtunajue`；外功 `sk_tiezhang`、`sk_duanfengzhang`、`sk_tiezhangdaofa`、`sk_tiebishou`、`sk_heishazhang`；轻功 `sk_shuishangpiao` | →神雕（一灯门下） | [N01] 第28章《铁掌峰顶》（第13章相关冒名情节不得误算裘千仞本人出场） |
| `npc_luyoujiao` | 鲁有脚，丐帮长老 | 壮年；神雕命定死亡 | `sect_gaibang` L4→L5 | D4 | 君山大会后帮务任务 | `sk_dagou`（层数依画像） | →神雕 | [N01] 第26章《新盟旧约》；第27章《轩辕台前》 |
| `npc_ouyangke` | 欧阳克，白驼山少主 | 青年；命定死亡待考 | `sect_baituoshan` L4 | D5 | 赵王府与桃花岛支线；原著死亡前可改命，邪线须承担侵害后果 | 白驼山武学按图鉴核配 | 改命后可 | 回目待考：赵王府、桃花岛、明霞岛 |
| `npc_luchengfeng` | 陆乘风，黄药师弟子、归云庄主 | 中年；生卒待考 | `sect_taohuadao` / 归云庄 | D4 | 归云庄旧案、师门和解与家人安全 | 桃花岛武学按图鉴来源 | →神雕传闻 | 回目待考：归云庄 |
| `npc_luguanying` | 陆冠英，归云庄少主 | 青年；生卒待考 | 归云庄 / 太湖群豪 | D4 | 太湖水路、程瑶迦关系与归云庄善后 | 桃花岛旁传按图鉴来源 | 否 | 回目待考：归云庄 |
| `npc_diancangyuyin` | 点苍渔隐，一灯门下“渔” | 中老年；生卒待考 | `sect_dali` | D4 | 黄蓉求医前通过渔关并尊重旧誓 | 大理段氏武学按图鉴来源 | →神雕 | 回目待考：渔樵耕读四关 |
| `npc_qiaozi` | 樵子，一灯门下“樵”（姓名待考） | 中老年；生卒待考 | `sect_dali` | D4 | 黄蓉求医前通过樵关并尊重旧誓 | `sk_kaishanfufa`；其余按图鉴来源 | →神雕 | 回目待考：渔樵耕读四关 |
| `npc_zhuziliu` | 朱子柳，一灯门下“读” | 中年；生卒待考 | `sect_dali` | D4 | 书法考验、求医与师门许可 | `sk_yiyangzhi`；笔法按图鉴来源 | →神雕 | 回目待考：渔樵耕读四关 |
| `npc_yangmiaozhen` | 杨妙真，红袄军首领 | 生卒待考 | 山东义军；非原著主线人物 | D5 | 山东抗金支线的战役短窗；须经军务与民生取舍 **（原创扩展）** | 枪术按图鉴来源 | 否 | **（原创扩展）**；史实身份与生卒须待可靠来源复核 |

合计：37 名。

### AR-18 配装同步说明

武学栏沿用纯 ID 引用；内功 `nature`、`BreathProfile.nature` 与招式 `requiredNature` 读取当前图鉴，配装计算见 `chapters/02-shediao` §12.6，相性规则只引用 `design/05` §5.2–§5.4。以下为本作配装结果，均属**（原创扩展）**：

- 黄药师：桃花归元诀、桃花吐纳息、药圃吐纳息现均为阴；两门辅运各 `0.50`，阴招获得三运同源 `+4%`。不能沿用旧“调和主运”的 `0.40` 推导。
- 洪七公：降龙行功 / 九袋行功仍为阳，丐帮护心法现为调和；辅运依次 `0.50 / 0.40`，不再有三运同源 `+4%`。
- 陈玄风、梅超风：九阴邪练功 / 铜尸横练为阳，桃花吐纳息现为阴；辅运依次 `0.50 / 0.25`。默认保持配装，接受无桥接相冲的开战内息紊乱风险与闭关心魔概率翻倍；待作者确认见主文文末“开放问题”。
- 欧阳锋：蛤蟆功为阳、毒脉护气功为阴、蛇形吐纳息现为调和；辅运依次 `0.25 / 0.40`。蛇形吐纳息仅 2 品，不能桥接，默认保持配装并接受相冲代价；待作者确认见主文文末“开放问题”。逆转经脉仍只作叙事来源，不因其名称反推阴阳或追加到首领装配。

### 史实来源

- [H01] 中国道教协会人物资料核对丘处机 1148–1227、王处一 1142–1217、马钰 1123–1183，访问 2026-09-26；马钰史实卒年早于游戏射雕年代，故本作明确采用小说化时间，不以史实表覆盖小说出场。完整链接见主文 §12。
- [H02] Britannica 搜索索引支持铁木真常见 1162?–1227；《元史·睿宗传》在线转录只可靠落实拖雷 1232 年卒，Cambridge 摘要确认哲别死亡记载有分歧，故争议字段均标（待考）。访问 2026-09-26，完整链接与证据等级见主文 §12。
- [N01] 金庸网，《射雕英雄传》修订版目录及第 01–40 章：<https://jinyongx.com/she/>，访问 2026-09-26。以上 30 行均至少核到一处姓名实际出现，并给出与目录情节对应的首要章节；网页转录可能有错字，只作检索佐证，三联 / 广州修订版纸本仍是终校基线。

### 审校抽查（N1.R 续检，2026-09-26）

[N01] 本次重访受网络连接限制，保留前次修订的定位；本次以 [N02] <https://m.gsw6.com/book/sdyxz/> 逐页交叉核对下表 27 人。表内章回可能是提及、命名或本人出场，只支持人物出处定位，不自动证明在场或健在。除丘处机、王处一、马钰、拖雷、哲别、铁木真 6 名历史原型外，小说人物为 `27−6=21` 名。此抽查不代替三联 / 广州修订版逐字终校。

| 人物 | 本次定位回目 / 转录页 | 证据状态 |
|---|---|---|
| 郭靖 | [第一回 风雪惊变(5)](https://m.gsw6.com/book/sdyxz/7707.html) | 二手转录，指定版本终校（待考） |
| 黄蓉 | [第七回 比武招亲(3)](https://m.gsw6.com/book/sdyxz/7748.html) | 二手转录，指定版本终校（待考） |
| 黄药师 | [第四回 黑风双煞(6)](https://m.gsw6.com/book/sdyxz/7733.html) | 二手转录，指定版本终校（待考） |
| 丘处机 | [第一回 风雪惊变(4)](https://m.gsw6.com/book/sdyxz/7706.html) | 二手转录，指定版本终校（待考） |
| 王处一 | [第六回 崖顶疑阵(3)](https://m.gsw6.com/book/sdyxz/7741.html) | 二手转录，指定版本终校（待考） |
| 马钰 | [第六回 崖顶疑阵(2)](https://m.gsw6.com/book/sdyxz/7740.html) | 二手转录，指定版本终校（待考） |
| 柯镇恶 | [第二回 江南七怪(3)](https://m.gsw6.com/book/sdyxz/7715.html) | 二手转录，指定版本终校（待考） |
| 朱聪 | [第二回 江南七怪(3)](https://m.gsw6.com/book/sdyxz/7715.html) | 二手转录，指定版本终校（待考） |
| 韩宝驹 | [第二回 江南七怪(3)](https://m.gsw6.com/book/sdyxz/7715.html) | 二手转录，指定版本终校（待考） |
| 南希仁 | [第二回 江南七怪(3)](https://m.gsw6.com/book/sdyxz/7715.html) | 二手转录，指定版本终校（待考） |
| 全金发 | [第二回 江南七怪(4)](https://m.gsw6.com/book/sdyxz/7716.html) | 二手转录，指定版本终校（待考） |
| 韩小莹 | [第二回 江南七怪(3)](https://m.gsw6.com/book/sdyxz/7715.html) | 二手转录，指定版本终校（待考） |
| 张阿生 | [第二回 江南七怪(3)](https://m.gsw6.com/book/sdyxz/7715.html) | 二手转录，指定版本终校（待考） |
| 杨铁心 | [第一回 风雪惊变](https://m.gsw6.com/book/sdyxz/7703.html) | 二手转录，指定版本终校（待考） |
| 包惜弱 | [第一回 风雪惊变(3)](https://m.gsw6.com/book/sdyxz/7705.html) | 二手转录，指定版本终校（待考） |
| 穆念慈 | [第八回 各显神通](https://m.gsw6.com/book/sdyxz/7753.html) | 二手转录，指定版本终校（待考） |
| 杨康 | [第一回 风雪惊变(5)](https://m.gsw6.com/book/sdyxz/7707.html) | 二手转录，指定版本终校（待考） |
| 完颜洪烈 | [第二回 江南七怪](https://m.gsw6.com/book/sdyxz/7713.html) | 二手转录，指定版本终校（待考） |
| 拖雷 | [第三回 大漠风沙(4)](https://m.gsw6.com/book/sdyxz/7725.html) | 二手转录，指定版本终校（待考） |
| 华筝 | [第五回 弯弓射雕](https://m.gsw6.com/book/sdyxz/7734.html) | 二手转录，指定版本终校（待考） |
| 哲别 | [第三回 大漠风沙(4)](https://m.gsw6.com/book/sdyxz/7725.html) | 二手转录，指定版本终校（待考） |
| 铁木真 | [第三回 大漠风沙(3)](https://m.gsw6.com/book/sdyxz/7724.html) | 二手转录，指定版本终校（待考） |
| 梅超风 | [第四回 黑风双煞(3)](https://m.gsw6.com/book/sdyxz/7730.html) | 二手转录，指定版本终校（待考） |
| 陈玄风 | [第四回 黑风双煞(3)](https://m.gsw6.com/book/sdyxz/7730.html) | 二手转录，指定版本终校（待考） |
| 洪七公 | [第十二回 亢龙有悔](https://m.gsw6.com/book/sdyxz/7777.html) | 二手转录，指定版本终校（待考） |
| 欧阳锋 | [第十五回 神龙摆尾(4)](https://m.gsw6.com/book/sdyxz/7806.html) | 二手转录，指定版本终校（待考） |
| 周伯通 | [第十七回 双手互搏](https://m.gsw6.com/book/sdyxz/7816.html) | 二手转录，指定版本终校（待考） |

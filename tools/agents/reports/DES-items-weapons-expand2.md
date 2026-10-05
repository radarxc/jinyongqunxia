# DES-items-weapons-expand2 报告 · 设计补充 · 兵器 ≥220 / 暗器 ≥48 第二次扩充（AR-30：武器也不足）

## 1. 摘要（3–6 行）

兵器名录由 118 增至 247 行机器行，暗器名录由 24 增至 51 行机器行；既有行与 ID 未改写。
本轮新增兵器 129 件（历代 / 地域军器 66、奇门细分 36、原著人物兵器 27），新增暗器 27 件（载具 18、原著名暗器 9）。
玄 / 黄五类每格在全表均达到至少 3 件；年代门禁按 AR-26 落到出处列，后世器形不逆投早期书界。
`design/10` 只在 §5.4.2 登记 23 件新增地阶名器；§14.2 两条完整待登记行留在本报告 §6。
三项指定检查均通过；严格 ID 校验仅报告仓库基线既有的 `sk_babuganchan`，新增错误为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 物理行 / 机器行 | 主要章节 |
|---|---:|---|
| `docs/design/catalog/items-weapons.md` | 311 / 247 | AR-30 历代地域军器、奇门细分、人物兵器、史料口径 |
| `docs/design/catalog/items-hidden-weapons.md` | 94 / 51 | AR-30 历代地域载具、原著名暗器、安全口径 |
| `docs/design/10-items-and-equipment.md` | 2624 / — | §5.4.2 新增天地名器登记 |
| `tools/agents/reports/DES-items-weapons-expand2.md` | 80 / — | 统计、开放项、同步登记行与自检 |

## 3. 关键结论与数值

| 统计面 | 分项 | 合计 |
|---|---|---:|
| 新增兵器类别 | 剑 18；刀 24；枪 14；棍杖 20；奇门 / 鞭索 53 | 129 |
| 新增兵器品阶 | 黄下 / 中 / 上 13 / 15 / 16；玄下 / 中 / 上 17 / 20 / 32；地下 / 中 / 上 9 / 6 / 1 | 129 |
| 新增暗器子类 | 镖 / 飞刀 13；弹丸 6；弩矢 3；针 3；钉锥 2 | 27 |
| 新增暗器品阶 | 黄下 / 中 / 上各 3；玄下 / 中各 3、玄上 5；地下 / 中 / 上 2 / 4 / 1 | 27 |
| 历代通用军器 | 春秋 5；唐 7；宋 8；辽金 6；元 5；明 6；清 6 | 43 |
| 地域军器 | 西域 4；吐蕃 5；蒙古 4；大理 5；回疆 5 | 23 |
| 历代 / 地域暗器载具 | 春秋、唐、宋、元、明、清各 1；西域、吐蕃、蒙古、大理、回疆各 1；江湖通用 7 | 18 |

品阶继续使用 `grade=1..9`；暗器 g1–g9 的 `ammoMul=0.88+0.035g`，故为 0.915 / 0.950 / 0.985 / 1.020 / 1.055 / 1.090 / 1.125 / 1.160 / 1.195；`hiddenHit=3×G(g)` 沿既有表。在线史料已在兵器名录末列链接与 2026-10-01/02 访问日；本任务没有版本、API、价格或限额事实。

### 名器补漏清单

- 《天龙八部》：`eq_yunzhonghegangzhua`、`eq_yeerniangfangdao`、`eq_zhudanchenpanguanbi`、`eq_chuwanlidiaogan`。
- 《射雕英雄传》：`eq_hanbaojinlongbian`、`eq_zhucongtieshan`、`eq_nanxirentiebian`、`eq_zhangashengtuniudao`、`eq_quanjinfadacheng`、`eq_hanxiaoyingyuenvjian`。
- 《神雕侠侣》 / 《倚天屠龙记》：`eq_fanyiwenggangzhang`、`eq_xiaoxiangzikusangbang`、`eq_yinkexijinlongbian`、`eq_nimoxingtieshe`；`eq_jinhuapopojinhuazhang`。
- 《笑傲江湖》 / 《连城诀》：`eq_mugaofengtuojian`、`eq_bujiejiedao`、`eq_danqingshengchangjian`、`eq_tianboguangkuaidao`；`eq_huatiegantieqiang`、`eq_lutianshuguitoudao`、`eq_liuchengfengrouyunjian`、`eq_shuidailengyuejian`。
- 《书剑恩仇录》 / 两部飞狐：`eq_luobingyuanyangdao`、`eq_jiangsigentiejang`、`eq_wangweiyangbaguadao`；`eq_miaorenfengpeijian`。
- 暗器：《天龙》`eq_shengsifubao`；《倚天》`eq_jinhuabiao`；《飞狐》`eq_wuyingyinzhen`；《书剑》`eq_huilongbi`、`eq_feiyanyinsuo`；《碧血剑》`eq_wenfangshifeidao`、`eq_musangtieqizi`、`eq_sunzhongjungangbiao`、`eq_wenfangshifeidaoxia`。
- 本轮未收入非金庸作品的“暴雨梨花针”，也未改动前轮既有的古龙致敬条目。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 本文默认 |
|---|---|---|
| O30-01 | 人物绰号 / 武学名是否足以证明佩兵专名 | 只作“人物 + 描述器形”的图鉴显示名；标（待考），不写成原著专名或唯一剧情门槛 |
| O30-02 | 生死符冰片是否可作持久装备 | 默认冰片包只是招式介质、地上唯一装备；不保存现实配方，不脱离 `bf_shengsifu` 自创毒效 |
| O30-03 | 军器待考形制在考据完成前能否投放 | 默认按标注的原创复原出图并受年代门禁；不得用作考据结论，核实后只修形制与出处 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| AR30-P01 | 基准 §14 吸收“兵器目录 247、暗器目录 51 机器行”的当前内容基线，并把年代门禁列为投放硬约束 | 防止后续随机池把明清器形逆投春秋 / 唐宋书界 |
| AR30-P02 | 基准 §16 明列“人物 + 器形”显示名不等于原著专名，待考项不得成为唯一解谜条件 | 本轮 27 件人物兵器中多件只有持用事实，需防止原创命名反向污染 canon |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `design/10` | §14.2 文末 ID 总登记表 | 后续汇总代理原样加入下列两行；本任务依要求未修改该表 |
| `design/02`、各章节 | 年代池 / 固定取得节点 | 接收春秋→序章、唐→白马、宋→天龙、元→倚天、明→笑傲、清→鹿鼎的原生投放门禁；地域器只进对应区域 |
| `design/05` | 奇门 `altItems` | 需要兼容时引用新 `exoticKind` / `cat=whip` ID，不从器名自动授予武学 |
| `design/17` | 门派装备索引 | 只索引名录已有 `sect=*`；本轮通用地域兵器不反推新门派镇物 |
| `tech/07`、资产清单 | 图鉴批量生成 | 新增 156 个出图行；长件留足端点、成对器逐件完整，暗器机括闭合且不画命中 |

待登记原行（两列，与 §14.2 格式一致）：
| AR-30 兵器第二次扩张（129） | 历代与地域军器（66）：`eq_wuyueqingtongjian` `eq_songjunhuanshoujian` `eq_tangjunzhijian` `eq_liaojinpeijian` `eq_yuanjunzhijian` `eq_tubotiejian` `eq_mingyingpeijian` `eq_dalihujunjian` `eq_qingyingpeijian` `eq_xiyuhuanshoujian` `eq_mengguweishijian` `eq_huibujiaojian` `eq_chunqiuduanmadao` `eq_tanghengdao` `eq_tangyidao` `eq_tangmodao` `eq_songdiaodao` `eq_songzhanmadao` `eq_jinjunchangdao` `eq_yuanjunwandao` `eq_mingmiaodao` `eq_qingyingyaodao` `eq_qingshundao` `eq_xiyuqidao` `eq_tubohuanshoudao` `eq_mengguqibingdao` `eq_dalihujundao` `eq_huibufanqudao` `eq_chunqiutongmao` `eq_songjunzhimao` `eq_tangmaqishuo` `eq_dalijunhuaqiang` `eq_songgoulianqiang` `eq_songyaxiangqiang` `eq_liaojinqiqiang` `eq_yuanjunqishuo` `eq_mingjunlangqiang` `eq_tubochangmao` `eq_qingyingchangqiang` `eq_huibuchangqiang` `eq_chunqiujunbang` `eq_tangjunyingbang` `eq_songbubinggun` `eq_liaojintiebang` `eq_yuanjunmabang` `eq_mingjundabang` `eq_qingyingtiebang` `eq_xiyujietougun` `eq_tubotiebang` `eq_menggugunbang` `eq_dalijunzhang` `eq_huibubaotiebang` `eq_chunqiutongge` `eq_tangjunzhangyue` `eq_songjunpangpai` `eq_liaojintiegu` `eq_jinlangyabang` `eq_yuanjungalengguduo` `eq_mingjunlangxian` `eq_mingtangpa` `eq_qingtengpai` `eq_xiyuyueyachan` `eq_tubotiejingangchu` `eq_menggutietaosuo` `eq_dalijunhuan` `eq_huibutieshan`；奇门兵器细分（36）：`eq_zhujieduanzhang` `eq_emeiduan_ci` `eq_yuanyangyue` `eq_butianwang` `eq_shuangtiechi` `eq_yiziguai` `eq_riyueqiankunquan` `eq_jiujiebian` `eq_lianziqiang` `eq_wujietiedi` `eq_yueyashuanggou` `eq_qingtongtiedi` `eq_xuangutieshan` `eq_xuantielepipa` `eq_tiesuanpan` `eq_jiuhuanxidao` `eq_jiujiegangbian` `eq_hutougou` `eq_sanjietiebang` `eq_fangbianchan` `eq_jinsiduomingbi` `eq_shuangliuxingchui` `eq_bailianruanbian` `eq_hudiejian` `eq_yinyangruanlun` `eq_changbingyueyachan` `eq_heijiaotiechi` `eq_hanbaoyuangun` `eq_fengweishuangbi` `eq_zimuwuyanglun` `eq_wuleitiejian` `eq_xuanmenshuangguai` `eq_tielianfeizhua` `eq_qilinzhen` `eq_yuguanchen` `eq_zhangbaqushemao`；原著人物兵器（27）：`eq_yunzhonghegangzhua` `eq_yeerniangfangdao` `eq_zhudanchenpanguanbi` `eq_chuwanlidiaogan` `eq_hanbaojinlongbian` `eq_zhucongtieshan` `eq_nanxirentiebian` `eq_zhangashengtuniudao` `eq_quanjinfadacheng` `eq_fanyiwenggangzhang` `eq_xiaoxiangzikusangbang` `eq_yinkexijinlongbian` `eq_nimoxingtieshe` `eq_jinhuapopojinhuazhang` `eq_mugaofengtuojian` `eq_bujiejiedao` `eq_danqingshengchangjian` `eq_huatiegantieqiang` `eq_lutianshuguitoudao` `eq_tianboguangkuaidao` `eq_luobingyuanyangdao` `eq_jiangsigentiejang` `eq_wangweiyangbaguadao` `eq_miaorenfengpeijian` `eq_hanxiaoyingyuenvjian` `eq_liuchengfengrouyunjian` `eq_shuidailengyuejian`。 |
| AR-30 暗器第二次扩张（27） | 历代与地域载具（18）：`eq_chunqiutoushinang` `eq_tangfeisuodai` `eq_songshounuxia` `eq_yuanqishoufeidaonang` `eq_mingduanluxia` `eq_qingpiaodaoxia` `eq_xiyufengyebiaonang` `eq_tubofeishinang` `eq_menggumadannang` `eq_daliyinzhenxia` `eq_huibufeidaoxia` `eq_liuxingdanxia` `eq_yanzibiaonang` `eq_tougudingxia` `eq_lianzhuziwunu` `eq_wulianfeibingxia` `eq_jiugongzhenpan` `eq_qingzilianzhuqiangxia`；原著名暗器（9）：`eq_shengsifubao` `eq_jinhuabiao` `eq_wuyingyinzhen` `eq_huilongbi` `eq_feiyanyinsuo` `eq_wenfangshifeidao` `eq_musangtieqizi` `eq_sunzhongjungangbiao` `eq_wenfangshifeidaoxia`。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 规模与格式：兵器 247、暗器 51 机器行；新增均七列、ID 唯一、旧行未改；历代军器 43≥40、地域军器 23、奇门 36≥30、人物名器 27≥20。
- ✅ 玄黄矩阵：按黄下 / 中 / 上、玄下 / 中 / 上，剑 `3/3/3/3/3/7`、刀 `3/4/5/4/5/6`、枪 `3/3/3/3/3/4`、棍杖 `3/3/3/3/6/6`、奇门鞭索 `7/8/8/10/11/19`；30 格均≥3。
- ✅ 约束与考据：年代门禁明确，毒暗器无现实配方，外观可直接出图，`design/10` 仅改 §5；⚠️ 未逐字确认者保留（待考），未冒充已核实事实。
- ✅ 校验：三项指定命令与 `git diff --check` 均通过；严格 ID 校验仅报基线 `sk_babuganchan`，新增错误 0。
- ✅ 需作者确认（附默认）：无新增确认项；§4 O30-01～03 已分别给出显示名、招式介质、待考军器投放默认值并继续完成。
- ✅ 交下游字段清单：ENG-DATA 接 `id/name/subtype/tier/source/grade/cat/hands/tags/exoticKind/unique/sect` 与年代地域门禁；ENG-COMBAT 接 `grade/cat/hands/tags/exoticKind`（暗器另接 `hiddenKind/ammoMul/hiddenHit`）；ENG-ASSET 接完整外观列（全长比例、刃形、护手、柄、鞘、材质、纹饰、时代特征及无人手 / 机括闭合约束）。

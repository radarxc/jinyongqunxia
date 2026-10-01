# DES-items-weapons-expand 报告 · 设计补充 · 兵器与暗器名录扩张（AR-24：六类玄黄各上中下三品 + 天地名器与门派法器）

## 1. 摘要（3–6 行）

兵器名录由 24 行扩为 118 行，暗器名录由 12 行扩为 24 行；原有机器行未删改。
玄黄矩阵覆盖剑、枪、棍、刀、奇门、暗器六类的黄下至玄上六档，`grade=1..6` 无错位。
补投影小说名器、真武剑与主要门派可持用法器，并为每行提供可直接出图的完整静物形制。
全局新增 54 个兵器 ID、8 个暗器 ID；复用既有名器与装备基底，不重造弹药或第 13 件 `divine` 神兵。
三项指定校验全部通过；ID 严格检查只有仓库基线既有 `sk_babuganchan` 未定义，新错误为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/items-weapons.md` | 156 | 37 行玄黄制式矩阵、37 行名器投影、20 行门派法器、史料与出图口径；总计 118 机器行 |
| `docs/design/catalog/items-hidden-weapons.md` | 45 | 6 行玄黄装备本体、6 行名暗器 / 门派装备；总计 24 机器行 |
| `docs/design/10-items-and-equipment.md` | 2527 | v1.6 摘要、§5.4.1 效果补表、54+8 新 ID 登记、考据与 O23–O25 |
| `tools/agents/reports/DES-items-weapons-expand.md` | 96 | 结论、开放问题、同步项与矩阵 / 名器 / 门派自检 |

## 3. 关键结论与数值

- 新出图行：兵器 94、暗器 12；新全局 ID：兵器 54 = 制式 28 + 名器 6 + 法器 20，暗器 8 = 本体 6 + 具名匣体 2。
- 黄下 / 黄中 / 黄上 / 玄下 / 玄中 / 玄上固定映射 `grade=1/2/3/4/5/6`；品阶代表制作质量，不代表朝代越晚越强。
- 暗器沿 §3.5：`ammoMul=0.88+0.035g` → `0.915/0.950/0.985/1.020/1.055/1.090`；`hiddenHit=3×G(g)` → `3.0/3.3/3.6/4.2/4.65/5.1`。
- Ld35 剑主属性复算：地下 `0.30×2.00×606≈364`、地中 `0.30×2.20×606≈400`、地上按完整曲线取整 437；门派法器无额外倍率。
- 真武剑为唯一新增天下样本：`catalogTian=true; divine=false; unique=true; price=null`；基准 12 件 `divine` 闭集不变。
- 史料在线核了《武经总要》手刀 / 枪九色、国博明剑 / 戚氏军刀及故宫清剑；链接与 2026-10-01 访问日见兵器表末。无版本、API、价格或限额类技术事实。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 本文默认 |
|---|---|---|
| O23 | 哪些门派象征物算兵器 | 只收可实际持用的兵器 / 法器；印信、命令旗、掌门指环仍归 `design/11` |
| O24 | 天级数量是否扩大 | 只加非神兵真武剑；其余新增最高地上，12 件 `divine` 不变 |
| O25 | 制式兵器是否按年代多件并存 | 允许宋 / 元 / 明 / 清形制并存；品阶不按年代排序，晚清牛尾刀不投早期书界 |
| O26 | 点苍是否另建门派法器归属 | 不造 `sect_diancang`；渔隐叉暂归一灯门下的 `sect_dali` |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| AR24-P01 | 基准 §14 吸收 `catalogTian` 与 `divine` 二分，并逐件裁定真武剑是否长期保留天下 10 | 防止“天级目录名器”被实现层误当作第 13 件神兵，保护封闭名录 |
| AR24-P02 | 基准 §18 / `design/17` 增加“原创门派法器只作视觉与固定产出，不反推原著”的跨文档口径 | 多数门派没有原著具名镇物，需要明确作者需求与原著事实的边界 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `design/17` | 各门派条目 | 索引对应 `eq_*`；点苍继续作大理人物支，不新造门派 ID；大轮寺统一 `sect_mizong`；明确华山 / 衡山 / 日月等已由具名器物覆盖 |
| `design/11` | 任务物品 / 信物 | 阻止印信、命令旗、掌门指环与本轮可持用法器重复建模；烈火旗仅作兵器特例 |
| `chapters/01–14` | 名器取得节点 | 为新增具名器物配置固定、唯一且符合幕次的取得 / 归还节点，不放随机池或商店 |
| `tech/07`、资产清单 | 图标生成 | 接收 106 个新增出图行；长件斜置留端、暗器按数量并置且机括闭合 |
| 运行数据 / `content` | 装备定义 | 落地 62 个新 ID（54 兵器 + 8 暗器），并为 44 个复用 ID 补图鉴资产键；不得重造九种 `it_*` 弹药 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 玄黄矩阵覆盖（顺序均为黄下 / 黄中 / 黄上 / 玄下 / 玄中 / 玄上）

| 类别 | 各档行数 | 结论 |
|---|---|---|
| 剑 | 1 / 1 / 1 / 1 / 1 / 1 | ✅ |
| 枪 | 1 / 1 / 1 / 1 / 1 / 1 | ✅ |
| 棍 | 1 / 1 / 1 / 1 / 1 / 1 | ✅ |
| 刀 | 1 / 1 / 1 / 1 / 2 / 1 | ✅ 玄中另列牛尾刀 |
| 奇门 | 2 / 2 / 2 / 2 / 2 / 2 | ✅ 覆盖匕、锤、笔、斧、索、叉、钩、扇、笛、旗、杵 |
| 暗器 | 1 / 1 / 1 / 1 / 1 / 1 | ✅ 均为装备本体 / 囊匣 |

### 7.2 天 / 地名器清单（书 → ID；门派原创法器另见 7.3）

- 天龙：`eq_duanyanqingzhang` `eq_lvboxiangludao` `eq_sanxiaosanxia`；射雕：`eq_dagoubang` `eq_baituoshezhang` `eq_yuxiao` `eq_jindao`。
- 神雕：`eq_xuantiejian` `eq_dagoubang` `eq_junzijian` `eq_shunvjian` `eq_jinlun` `eq_ziweiruanjian` `eq_dugulijian` `eq_jinlingsuo` `eq_fuchen` `eq_jindaoheijian` `eq_jinchu` `eq_bingpoyinzhen` `eq_yufengzhen` `eq_zaohedingxia`。
- 倚天：`eq_yitianjian` `eq_tulongdao` `eq_shenghuoling` `eq_liehuoqi` `eq_yingoutiehua` `eq_luzhang` `eq_hebi` `eq_qiankunyiqidai` `eq_wenxuzhen`。
- 笑傲：`eq_zhenwujian` `eq_xiuhuazhen` `eq_qixianqin` `eq_tubiwengbi` `eq_modahuqinjian` `eq_bishuijian` `eq_heixueshenzhen`；侠客：`eq_xuansushuangjian`。
- 碧血：`eq_jinshejian` `eq_hetieshougou` `eq_jinshezhui`；鹿鼎：`eq_bishou` `eq_luochaduanchong`；连城：`eq_xuedao`；鸳鸯：`eq_yuanyangdao`。
- 书剑：`eq_ningbijian` `eq_huoqingtongduanjian` `eq_furongjinzhen`；飞狐 / 雪山：`eq_lengyuedao`；白马：`eq_jinyinxiaojian`。
- 古龙致敬：`eq_bawangqiang` `eq_biyudao` `eq_libiegou` `eq_kongqueling` `eq_xiaolifeidao` `eq_baoyulihuading`。

### 7.3 门派法器清单（门派 → ID）

- 少林→`eq_shaolinhusixizhang`；武当→`eq_zhenwujian`；峨眉→`eq_emeijiejian`；华山→`eq_bishuijian`；衡山→`eq_modahuqinjian`；恒山→`eq_hengshanbeijiejian`；泰山→`eq_daizongfajian`；嵩山→`eq_songyangkuojian`；全真→`eq_quanzhenfajian`。
- 丐帮→`eq_dagoubang` / `eq_gaibangzhubang`；明教→`eq_shenghuoling`；日月→`eq_xiuhuazhen`；星宿→`eq_sanxiaosanxia`；逍遥→`eq_xiaoyaoyubingfuchen`；灵鹫宫→`eq_lvboxiangludao`。
- 大理段氏→`eq_duanshihushenjian`；天龙寺→`eq_tianlongsijiedao`；慕容→`eq_murongcangfengjian`；铁掌帮→`eq_tiezhangkaishanfu`；桃花岛→`eq_yuxiao`；白驼山→`eq_baituoshezhang`；古墓→`eq_yufengzhen`。
- 崆峒→`eq_kongtongshuangou`；昆仑→`eq_kunlunliangyijian`；青城→`eq_qingchengsongfengjian`；点苍渔隐→`eq_yuyincha`（归 `sect_dali`）；天地会→`eq_tiandihuiduandao`；红花会→`eq_honghuahuichangjian`。
- 血刀门→`eq_xuedao`；雪山派→`eq_lingxiaochangjian`；神拳门→`eq_shenquantiehutao`；长乐帮→`eq_changlegangdao`；大轮寺 / 密宗→`eq_jinlun`（`sect_mizong`）。

### 7.4 待考、作者确认与硬性检查

- ⚠️ 制式年代 / 形制定型：`eq_ruanjian` `eq_podao` `eq_mazhadao` `eq_niuweidao` `eq_lihuaqiang` `eq_songshaobang` `eq_bailagan` `eq_yuanmengmabang` `eq_panguanbi` `eq_hushoushuanggou` `eq_liuxingchui` `eq_tonghuangxiujian`；原因均已逐项写在出处列。
- ⚠️ 新名器细节：`eq_zhenwujian` 外形、`eq_modahuqinjian` 藏剑结构、`eq_bishuijian` 取得 / 削铁、`eq_lvboxiangludao` 材质来历、`eq_yuyincha` 叉形、`eq_furongjinzhen` 数量装具，须核三联 / 广州修订版。
- ⚠️ 既有待考投影：`eq_tiedan` `eq_liehuoqi` `eq_jinshejian` `eq_dagoubang` `eq_shenghuoling` `eq_bishou` `eq_yuanyangdao` `eq_lengyuedao` `eq_baituoshezhang` `eq_luzhang` `eq_hebi` `eq_hetieshougou` `eq_ningbijian` `eq_wenxuzhen` `eq_hanshasheying` `eq_heixueshenzhen` `eq_baoyulihuading`；均只保守写场景，未编回目 / 引文。
- ⚠️ 未收：玉女剑 / 无尘剑 / 乌龙鞭缺可靠具名器物锚；胡家刀是刀法 / 家传语义；神木王鼎属任务奇物，生死符属武学产物，方便铲无可靠具名持有者。默认不冒充装备名器。
- ✅ 作者确认默认已落 O23–O25：可持用才算法器；真武剑不扩 `divine`；制式按年代多件并存。
- ✅ 原行保护：两份 catalog 差异均仅新增，无删除 / 改写；七列、完整剪影、长件留端、暗器闭合与无人物 / 手要求已检查。
- ✅ `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-weapons.md --min 90`：118 行通过。
- ✅ `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-hidden-weapons.md --min 24`：24 行通过。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；基线 1 项、新增错误 0；`git diff --check` 通过。
### 7.5 交下游（ENG-*）字段清单
- `ENG-DATA`（装备数据模型）：接收 `grade`、`cat`、`hands`、`exoticKind`、`tags`、`pair`、`unique`、`sect`、`catalogTian`、`divine`、`price`。
- `ENG-COMBAT`（暗器运行时）：接收 `hiddenKind`、`ammoMul`、`hiddenHit`、`ammoSlots`、`perBattle`、`reloadOwnActions`、`range`、`aoe`、`onHit`。
- `ENG-ASSET`（资产链）：接收 106 个新增出图行，其中 62 个新 ID、44 个复用 ID；长件斜置并为尖首 / 杆端留边，暗器机括闭合，全部完整剪影且无人 / 手。

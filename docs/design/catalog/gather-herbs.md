# 采集名录 · 药材与特殊物品分布（`gather-herbs`）

> **归属（基准 §18）**：本表归 `design/11` 的普通采集点分布投放；物品字段、品阶与丹方归 `design/10`，资源四阶九品、估值、库存与经营归 `design/16`。
> **上游**：`author-requirements.md` AR-05、AR-06、AR-26、AR-28，`00-canon.md`，`design/02`、`10`、`11`、`16`、`19`，`catalog/items-medicine.md`。
> **引用而不重定义**：月份、昼夜与 RNG → `design/11` §4.3、§6；药材效果及 `bf_*` → `design/06`、`10`；区域闭集 → `design/11` §2；真实药材基原最终以当期法定标准为准。
> **标注约定**：**（原创扩展）** = 小说未写、为本作投放；**（待考）** = 须按三联 / 广州修订版核原著；**（待核实）** = 学名、历史药名或资料事实仍需专家 / 原始文献复核；**【建议值】** = 可执行默认值。
> **安全边界**：只记录虚构游戏中的辨识、分布与采期，不提供现实剂量、配伍、炮制、服用、捕猎或取材方法；有毒材料仅供剧情 / 暗器 / 解毒设定，受保护动物来源仅作历史旧藏，不设循环采集。

---

## 0. 使用口径

### 0.1 书界与年代

1. AR-26 优先：`ch10_baima` 按**唐代、第一本正式书**处理；稳定 ID 不因展示顺序改名。`design/02`、`19` 尚存清初旧定年，列入 §7.4 同步事项。
2. 表内“全界”展开为 `ch10_baima`、`ch01_tianlong`～`ch09_liancheng`、`ch11_yuanyang`～`ch14_xueshan`；实际还须该界开放所列 `rg_*`。
3. “明后界”展开为 `ch05_xiaoao`～`ch09_liancheng`、`ch11_yuanyang`～`ch14_xueshan`，不含唐代 `ch10_baima`；“清中后界”指 `ch12_shujian`～`ch14_xueshan`。
4. 地理存在不等于当时已有同名药材商品。党参、三七、冬虫夏草等按现存本草记录给保守起用界；早期地图可有无名植物观察点，但不得掉落该 `it_*`。

### 0.2 字段与刷新解释

- 区域只用 `design/11` §13.2 的 30 个 `rg_*`。生境是投放过滤器，不保证整个区域皆产；人工栽培点仍须当地气候可行。
- “月份”为农历近似玩法窗 **【建议值】**；现代资料的公历物候只折为宽季节，未有依据时写“全天 / 无时辰门槛”，不杜撰晨昏药力。
- 点型只取 `urban/wild/ruin`。产量是每个 `refreshIndex` 的完整药材份数；普通点走 `world` RNG 并冻结结果，唯一剧情物不进入刷新。
- 真实原型列用当前常见接受名；多基原、俗名歧义、小说虚构或矿物 / 化石无二名法时明确说明，不用猜测补齐。
- 真实依据只列书名 / 标准名；网络入口与访问日期集中在 §4。药典收载不等于对现实自行使用的建议。

---

## 1. 药材分布表

### 1.1 既有药材与年限变体（12）

| ID / 名称 | 真实原型（中文正名 + 学名） | 产地区域 `rg_*` | 生境 | 采收季节 / 月份 | 时辰或物候 | 出现书界 | 点型 | 稀有度 / 产量 | 原著出处 | 真实依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| `it_renshen` 普通人参 | 人参 `Panax ginseng` | `rg_liaodong`、`rg_dongbei` | 阔叶与针阔混交林下、阴坡腐殖土 | 秋 8～10 月 | 果熟、地上部渐枯；全天 | 全界 | `wild/urban` | 少见 / 1 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_shinianrenshen` 十年人参 | 同人参；“十年”为个体年限 | `rg_liaodong`、`rg_dongbei` | 老林阴坡；人工参圃 | 秋 8～10 月 | 地上部渐枯；全天 | 全界 | `wild/urban` | 稀有 / 1 | **（原创扩展）** | 《中国药典》《中国植物志》 |
| `it_bainianrenshen` 百年人参 | 同人参；百年自然个体为玩法夸饰 | `rg_liaodong`、`rg_dongbei` | 封闭老林固定点 | 秋 8～10 月 | 只在固定奇遇状态；全天 | 全界 | `wild/ruin` | 极稀 / 固定 1 | **（原创扩展）** | 《中国药典》《中国植物志》 |
| `it_qiannianrenshen` 千年人参 | 同人参；千年为武侠夸饰，不作现实年龄事实 | `rg_liaodong`、`rg_dongbei` | 古林 / 遗迹密藏固定点 | 不设循环采期 | 唯一节点 | 全界 | `ruin` | 天材 / 唯一 1 | **（原创扩展）** | 《中国药典》《中国植物志》 |
| `it_xueshen` 普通雪参 | “雪参”俗名可指多种高山根类，学名未定 **（待核实）** | `rg_qingzang`、`rg_hexilongyou`、`rg_xiyu_beijiang` | 高山草甸、碎石坡 | 夏末秋初 7～9 月 **（待核实）** | 地上部可辨时；全天 | 全界 | `wild` | 少见 / 1～2 | **（原创扩展）** | 《本草纲目》名物待核；地方植物志 **（待核实）** |
| `it_shinianxueshen` 十年雪参 | 同上；物种与年限均 **（待核实）** | `rg_qingzang`、`rg_hexilongyou` | 高山草甸背风坡 | 秋 8～9 月 **（待核实）** | 固定成熟株；全天 | 全界 | `wild` | 稀有 / 1 | **（原创扩展）** | 地方植物志 **（待核实）** |
| `it_bainianxueshen` 百年雪参 | 小说化高山根类；无可靠单一原型 | `rg_qingzang`、`rg_hexilongyou` | 雪线下岩隙固定点 | 秋 8～9 月 **（待核实）** | 固定奇遇状态 | 全界 | `wild/ruin` | 极稀 / 固定 1 | **（原创扩展）** | 地方植物志 **（待核实）** |
| `it_qiannianxueshen` 千年雪参 | 小说虚构；现实原型与年龄皆未定 **（待核实）** | `rg_qingzang` | 雪山遗迹密藏 | 不设循环采期 | 唯一节点 | 全界 | `ruin` | 天材 / 唯一 1 | **（原创扩展）** | 无可靠现实对应 **（待核实）** |
| `it_duanchangcao` 断肠草 | 小说植物；玩法原型取钩吻 `Gelsemium elegans` **（待核实：不能断言同物）** | `rg_guanzhong`（剧情）；`rg_fujian`、`rg_jiangxi`、`rg_huxiang`、`rg_lingnan`、`rg_guangxi`、`rg_yundian_qianzhong`（原型） | 绝情谷固定坡；原型见湿润丘陵疏林 / 灌丛 | 原型花期 5～11 月；剧情点不循环 | 原型开花可辨；全天 | `ch03_shendiao` | `wild` | 剧情唯一 / 1 | 《神雕侠侣》；现实对应 **（待考）** | 《中国植物志》 |
| `it_tianshanxuelian` 天山雪莲 | 雪莲花 `Saussurea involucrata` | `rg_xiyu_beijiang` | 高山草甸、碎石坡、石缝，约 2400～3470 m | 7～9 月 | 花果期；白昼采集反馈，不设药力时辰 | `ch10_baima`、`ch12_shujian`～`ch14_xueshan` | `wild` | 极稀 / 固定 1 | 《书剑恩仇录》雪山采莲；细节 **（待考）** | 《中国植物志》《中国药典》 |
| `it_qiannianlingzhi` 千年灵芝 | 灵芝 `Ganoderma lingzhi`；“千年”为玩法夸饰 | `rg_qinba`、`rg_jiangnan_taihu`、`rg_fujian`、`rg_jiangxi`、`rg_jingxiang`、`rg_bashu` | 古木根际 / 遗迹密藏，非普通腐木刷新 | 夏秋；唯一点不循环 | 子实体成熟；全天 | 全界 | `ruin` | 天材 / 唯一 1 | **（原创扩展）** | 《神农本草经》《中国药典》 |
| `it_qiannianxuelian` 千年雪莲 | 同雪莲花；“千年”为玩法夸饰 | `rg_xiyu_beijiang` | 雪线附近遗迹密藏 | 不设循环采期 | 唯一节点 | `ch10_baima`、`ch12_shujian`～`ch14_xueshan` | `ruin` | 天材 / 唯一 1 | **（原创扩展）** | 《中国植物志》《中国药典》 |

### 1.2 黄阶常用药材（26）

| ID / 名称 | 真实原型（中文正名 + 学名） | 产地区域 `rg_*` | 生境 | 采收季节 / 月份 | 时辰或物候 | 出现书界 | 点型 | 稀有度 / 产量 | 原著出处 | 真实依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| `it_aiye` 艾叶 | 艾 `Artemisia argyi` | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang` | 路旁、荒地、河岸及城郊药圃 | 春夏 4～6 月 | 叶盛、未衰黄；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《名医别录》《中国药典》《中国植物志》 |
| `it_bohe` 薄荷 | 薄荷 `Mentha canadensis`（药用基原异名待统一） | `rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_jingxiang`、`rg_huxiang` | 沟边、湿地、田埂、药圃 | 夏秋 6～9 月 | 茎叶繁盛或初花；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《新修本草》《中国药典》《中国植物志》 |
| `it_yuxingcao` 鱼腥草 | 蕺菜 `Houttuynia cordata` | `rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_huxiang`、`rg_lingnan`、`rg_guangxi`、`rg_bashu`、`rg_yundian_qianzhong` | 溪沟、林下、湿地和田埂 | 夏 5～8 月 | 地上部繁茂；全天 | 全界 | `wild/urban` | 常见 / 1～3 | **（原创扩展）** | 《名医别录》《中国药典》《中国植物志》 |
| `it_pugongying` 蒲公英 | 蒲公英 `Taraxacum mongolicum`（代表基原；多基原 **（待核实）**） | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_qilu`、`rg_guanzhong`、`rg_jianghuai`、`rg_dongbei` | 草地、路旁、田野与城郊 | 春至秋 3～10 月 | 花或果序可辨；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《新修本草》《中国药典》《中国植物志》 |
| `it_zisunye` 紫苏叶 | 紫苏 `Perilla frutescens` | `rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_jingxiang`、`rg_huxiang` | 城郊菜圃、药圃与疏林边 | 夏 6～8 月 | 茎叶繁茂、未老；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《名医别录》《中国药典》《中国植物志》 |
| `it_yimucao` 益母草 | 益母草 `Leonurus japonicus` | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jingxiang`、`rg_huxiang` | 荒地、路旁、河滩与城郊 | 春夏 4～7 月 | 初花前后；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_xianhecao` 仙鹤草 | 龙芽草 `Agrimonia pilosa` | `rg_zhongyuan`、`rg_qinba`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_dongbei` | 林缘、草坡、路旁 | 夏秋 6～9 月 | 枝叶茂盛；全天 | 全界 | `wild` | 常见 / 1～3 | **（原创扩展）** | 《滇南本草》《中国药典》《中国植物志》 |
| `it_huoxiang` 藿香 | 藿香 `Agastache rugosa`；与广藿香 `Pogostemon cablin` 分列 **（待核实）** | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_lingnan` | 林缘、草坡、药圃；广藿香限南方栽培 | 夏 6～8 月 | 枝叶盛、花初开；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《名医别录》《中国药典》《中国植物志》 |
| `it_jingjie` 荆芥 | 荆芥 `Nepeta tenuifolia`（接受名 **（待核实）**） | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_guanzhong`、`rg_qilu`、`rg_jianghuai` | 山坡、路旁及药圃 | 夏秋 7～9 月 | 花穗形成；全天 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_huangqi` 黄芪 | 蒙古黄芪 `Astragalus mongholicus` 等药典基原 | `rg_hedong_jinzhong`、`rg_guanzhong`、`rg_hexilongyou`、`rg_monan`、`rg_dongbei` | 向阳草地、林缘、旱坡与药圃 | 春或秋 3～4 / 9～10 月 | 地上部未萌或枯萎；全天 | 全界 | `wild/urban` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_danggui` 当归 | 当归 `Angelica sinensis` | `rg_qinba`、`rg_bashu`、`rg_hexilongyou`、`rg_qingzang` | 高寒湿润山地、药圃 | 秋 9～10 月 | 地上部枯黄；全天 | 全界 | `wild/urban` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_gancao` 甘草 | 甘草 `Glycyrrhiza uralensis` 等药典基原 | `rg_hexilongyou`、`rg_xixia_helan`、`rg_xiyu_nanjiang`、`rg_xiyu_beijiang`、`rg_monan`、`rg_mobei` | 干旱草原、沙质地、河岸阶地 | 春秋 3～5 / 9～10 月 | 萌芽前或地上部枯萎；全天 | 全界 | `wild` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_gegen` 葛根 | 野葛 `Pueraria montana var. lobata` | `rg_zhongyuan`、`rg_qinba`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu` | 山坡灌丛、林缘、沟谷 | 秋冬 10～12 月 | 藤叶衰败后；全天 | 全界 | `wild` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_jiegeng` 桔梗 | 桔梗 `Platycodon grandiflorus` | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_liaodong`、`rg_dongbei` | 山坡草地、林缘及药圃 | 春秋 3～4 / 9～10 月 | 萌芽前或地上部枯萎；全天 | 全界 | `wild/urban` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_ganjiang` 干姜 | 姜 `Zingiber officinale` 的干燥根茎 | `rg_jiangnan_taihu`、`rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_huxiang`、`rg_lingnan`、`rg_bashu` | 温暖湿润农圃；仅采鲜根，干制为物品表现 | 冬 10～12 月 | 茎叶枯黄；全天 | 全界 | `urban` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《本草纲目》 |
| `it_jinyinhua` 金银花 | 忍冬 `Lonicera japonica` | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_jiangxi`、`rg_jingxiang` | 山坡灌丛、林缘、篱架与药圃 | 夏 5～6 月 | 花蕾由绿转白、未全开；白昼 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《名医别录》《中国药典》《中国植物志》 |
| `it_gouqizi` 枸杞子 | 宁夏枸杞 `Lycium barbarum` | `rg_hexilongyou`、`rg_xixia_helan`、`rg_xiyu_beijiang`、`rg_monan` | 河套、荒坡、盐碱边地与果圃 | 夏秋 6～10 月 | 果实红熟；白昼 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_dazao` 大枣 | 枣 `Ziziphus jujuba` | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_guanzhong`、`rg_hedong_jinzhong`、`rg_qilu` | 旱坡、村落果园与城郊 | 秋 8～10 月 | 果实红熟；白昼 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_juhua` 菊花 | 菊 `Chrysanthemum morifolium`（栽培复合群） | `rg_yanjing_zhili`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_jiangxi` | 城郊花圃、药圃 | 秋 9～11 月 | 头状花序盛开；白昼 | 全界 | `urban` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_lianqiao` 连翘 | 连翘 `Forsythia suspensa` | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_guanzhong`、`rg_qinba`、`rg_hedong_jinzhong` | 山坡灌丛、沟谷与药圃 | 秋 7～10 月 | 果实初熟至熟；白昼 | 全界 | `wild/urban` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_cheqianzi` 车前子 | 车前 `Plantago asiatica` 或平车前 `P. depressa` | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_huxiang` | 路旁、田埂、河滩与庭院 | 夏秋 6～9 月 | 果穗成熟；白昼 | 全界 | `urban/wild` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_fuling` 茯苓 | 茯苓菌 `Wolfiporia cocos` | `rg_qinba`、`rg_fujian`、`rg_jiangxi`、`rg_huxiang`、`rg_bashu`、`rg_yundian_qianzhong` | 松属树根际地下菌核、林地栽培窖 | 夏秋 7～10 月 | 菌核成熟；全天 | 全界 | `wild/urban` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》 |
| `it_zhuling` 猪苓 | 猪苓菌 `Polyporus umbellatus` | `rg_qinba`、`rg_hedong_jinzhong`、`rg_jingxiang`、`rg_bashu`、`rg_dongbei` | 山林地下、腐殖土与树根附近 | 夏秋 7～10 月 | 菌核成熟；全天 | 全界 | `wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》 |
| `it_haizao` 海藻 | 海蒿子 `Sargassum pallidum`、羊栖菜 `S. fusiforme` | `rg_liaoxi`、`rg_liaodong`、`rg_zhedong`、`rg_fujian`、`rg_donghai_islands`、`rg_nanhai_islands` | 潮间带岩礁与浅海 | 春夏 3～7 月 **（待核实）** | 退潮露出时；白昼 / 黄昏 | 全界 | `wild` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国海藻志》 |
| `it_dilong` 地龙 | 参环毛蚓 `Pheretima aspergillum` 等药典多基原 **（学名组合待核实）** | `rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_fujian`、`rg_lingnan`、`rg_guangxi` | 湿润土壤、河岸、田园；只作历史动物药投影 | 夏秋 5～9 月 | 雨后地表活动；不设精确时辰 | 全界 | `wild/urban` | 常见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》 |
| `it_shigao` 石膏 | 矿物石膏，主要成分含水硫酸钙 `CaSO4·2H2O` | `rg_zhongyuan`、`rg_guanzhong`、`rg_hedong_jinzhong`、`rg_qilu`、`rg_jingxiang`、`rg_bashu` | 沉积矿层、矿洞与采石遗迹 | 四季 | 无物候；全天 | 全界 | `wild/ruin` | 常见 / 1～3 | **（原创扩展）** | 《神农本草经》《中国药典》《中国矿物药》 |

### 1.3 玄阶药材（20）

| ID / 名称 | 真实原型（中文正名 + 学名） | 产地区域 `rg_*` | 生境 | 采收季节 / 月份 | 时辰或物候 | 出现书界 | 点型 | 稀有度 / 产量 | 原著出处 | 真实依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| `it_qinghao` 青蒿 | 黄花蒿 `Artemisia annua` | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu` | 路旁、河岸、荒地与林缘 | 夏秋 6～9 月 | 花蕾形成前后；全天 | 全界 | `wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《肘后备急方》《中国药典》《中国植物志》 |
| `it_mahuang` 麻黄 | 草麻黄 `Ephedra sinica` 等药典基原 | `rg_yanjing_zhili`、`rg_hedong_jinzhong`、`rg_hexilongyou`、`rg_xixia_helan`、`rg_monan`、`rg_mobei` | 干旱草原、砂质坡地 | 秋 8～10 月 | 草质茎成熟；全天 | 全界 | `wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_shihu` 石斛 | 金钗石斛 `Dendrobium nobile` 等药典多基原 | `rg_qinba`、`rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_lingnan`、`rg_guangxi`、`rg_yundian_qianzhong` | 湿润岩壁或林中树干附生；药圃 | 秋至次春 9～3 月 **（待核实）** | 茎成熟；全天 | 全界 | `wild/urban` | 少见 / 1 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》《香港中药材标准》 |
| `it_baizhu` 白术 | 白术 `Atractylodes macrocephala` | `rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_jiangxi`、`rg_jingxiang` | 山坡草地与药圃，以栽培点为主 | 秋冬 10～12 月 | 地上部枯萎；全天 | 全界 | `urban/wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_dangshen` 党参 | 党参 `Codonopsis pilosula` 等药典基原 | `rg_guanzhong`、`rg_qinba`、`rg_hedong_jinzhong`、`rg_hexilongyou` | 山地灌丛、林缘与药圃 | 秋 9～10 月 | 地上部枯萎；全天 | `ch12_shujian`～`ch14_xueshan` | `urban/wild` | 少见 / 1～2 | **（原创扩展）**；“党参”药名按清代本草保守投放 | 《本草从新》《中国药典》《中国植物志》 |
| `it_chuanxiong` 川芎 | 川芎 `Ligusticum chuanxiong`（接受学名 **（待核实）**） | `rg_bashu`、`rg_qinba` | 湿润山地药圃，以栽培点为主 | 夏 5～7 月 | 茎节明显隆起、地上部枯萎；全天 | 全界 | `urban/wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_danshen` 丹参 | 丹参 `Salvia miltiorrhiza` | `rg_zhongyuan`、`rg_guanzhong`、`rg_qinba`、`rg_qilu`、`rg_jianghuai`、`rg_jingxiang` | 山坡草地、林缘、药圃 | 春秋 3～4 / 9～11 月 | 萌芽前或地上部枯萎；全天 | 全界 | `wild/urban` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_chaihu` 柴胡 | 柴胡 `Bupleurum chinense`、狭叶柴胡 `B. scorzonerifolium` | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_guanzhong`、`rg_hedong_jinzhong`、`rg_qilu`、`rg_dongbei` | 向阳草坡、林缘 | 春秋 3～4 / 9～10 月 | 萌芽前或地上部枯萎；全天 | 全界 | `wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_chuanbeimu` 川贝母 | 川贝母 `Fritillaria cirrhosa` 等药典多基原 | `rg_qinba`、`rg_bashu`、`rg_yundian_qianzhong`、`rg_qingzang`、`rg_hexilongyou` | 高山灌丛草甸、冷杉林下，约 1800～4200 m | 夏 6～8 月 | 地上部枯萎或果熟后；白昼 | 全界 | `wild` | 稀有 / 1 | **（原创扩展）** | 《本草纲目》《中国药典》《中国植物志》 |
| `it_tianma` 天麻 | 天麻 `Gastrodia elata` | `rg_qinba`、`rg_hedong_jinzhong`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu`、`rg_yundian_qianzhong`、`rg_dongbei` | 疏林、林缘腐殖土，与真菌共生 | 冬至次春 11～4 月 | 休眠块茎；全天 | 全界 | `wild` | 稀有 / 1 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_huanglian` 黄连 | 黄连 `Coptis chinensis` 等药典基原 | `rg_qinba`、`rg_jiangxi`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu`、`rg_yundian_qianzhong` | 阴湿山地林下、药圃 | 秋 9～11 月 | 地上部渐枯；全天 | 全界 | `wild/urban` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_huangqin` 黄芩 | 黄芩 `Scutellaria baicalensis` | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_guanzhong`、`rg_hedong_jinzhong`、`rg_qilu`、`rg_liaoxi`、`rg_dongbei` | 向阳干燥山坡、草原与药圃 | 春秋 3～5 / 9～10 月 | 萌芽前或茎叶枯黄；全天 | 全界 | `wild/urban` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_banxia` 半夏 | 半夏 `Pinellia ternata` | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu` | 阴湿草坡、田边、林下与药圃 | 夏秋 7～9 月 | 茎叶渐枯；全天 | 全界 | `wild/urban` | 少见 / 1～2 | **（原创扩展）**；有毒，只作设定 | 《神农本草经》《中国药典》《中国植物志》 |
| `it_sanqi` 三七 | 三七 `Panax notoginseng` | `rg_guangxi`、`rg_yundian_qianzhong`、`rg_dali_cangshan` | 温暖湿润山坡药圃，野生点不常规开放 | 秋冬 10～12 月 | 果后、地上部渐枯；全天 | `ch05_xiaoao`～`ch09_liancheng`、`ch11_yuanyang`～`ch14_xueshan` | `urban/wild` | 稀有 / 1 | **（原创扩展）**；药名按明代以后保守投放 | 《本草纲目》《中国药典》《中国植物志》 |
| `it_wuweizi` 五味子 | 五味子 `Schisandra chinensis` | `rg_yanjing_zhili`、`rg_liaoxi`、`rg_liaodong`、`rg_dongbei` | 山沟、林缘、疏林藤本 | 秋 8～10 月 | 果实紫红成熟；白昼 | 全界 | `wild` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国植物志》 |
| `it_lingzhi` 灵芝 | 灵芝 `Ganoderma lingzhi` | `rg_qinba`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu` | 阔叶树基部、腐木与林下栽培棚 | 夏秋 6～10 月 | 子实体成熟；雨后可见但无时辰门槛 | 全界 | `wild/urban` | 稀有 / 1 | **（原创扩展）** | 《神农本草经》《中国药典》 |
| `it_lurong` 鹿茸 | 梅花鹿 `Cervus nippon`、马鹿 `Cervus elaphus` 的幼角历史药材 | `rg_liaodong`、`rg_dongbei`、`rg_monan`、`rg_mobei` | 仅历史苑囿 / 鹿场旧藏，不设野外取材 | 春夏；不设玩家采收月份 | 任务交付或旧库发现 | 全界 | `urban/ruin` | 稀有 / 固定 1 | **（原创扩展）**；受保护来源只作历史设定 | 《神农本草经》《中国药典》 |
| `it_longgu` 龙骨 | 古代哺乳动物骨骼化石；无单一学名 | `rg_zhongyuan`、`rg_guanzhong`、`rg_hedong_jinzhong`、`rg_hexilongyou`、`rg_xixia_helan` | 黄土层、洞穴堆积与旧药库 | 四季 | 无物候；遗迹调查后 | 全界 | `wild/ruin` | 少见 / 1～2 | **（原创扩展）** | 《神农本草经》《中国药典》《中国古生物化石保护条例》 |
| `it_zhusha` 朱砂 | 辰砂，硫化汞矿物 `HgS` | `rg_huxiang`、`rg_guangxi`、`rg_bashu`、`rg_yundian_qianzhong` | 低温热液矿脉、废矿与旧药库 | 四季 | 无物候；全天 | 全界 | `ruin/wild` | 稀有 / 1 | **（原创扩展）**；有毒，只作设定 | 《神农本草经》《中国药典》《中国矿物药》 |
| `it_xionghuang` 雄黄 | 雄黄矿物，四硫化四砷 `As4S4` | `rg_qinba`、`rg_huxiang`、`rg_guangxi`、`rg_bashu`、`rg_yundian_qianzhong` | 低温热液矿脉、矿洞与旧药库 | 四季 | 无物候；全天 | 全界 | `ruin/wild` | 稀有 / 1 | **（原创扩展）**；有毒，只作设定 | 《神农本草经》《中国药典》《中国矿物药》 |

### 1.4 地阶毒材、珍材与原著奇物（15）

| ID / 名称 | 真实原型（中文正名 + 学名） | 产地区域 `rg_*` | 生境 | 采收季节 / 月份 | 时辰或物候 | 出现书界 | 点型 | 稀有度 / 产量 | 原著出处 | 真实依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| `it_mantuoluo` 曼陀罗花 | 洋金花 `Datura metel`；“曼陀罗”亦可指 `D. stramonium`，本表暂取前者 **（待核实）** | `rg_jianghuai`、`rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_lingnan`、`rg_guangxi`、`rg_yundian_qianzhong` | 温暖地带荒地、路旁与药圃 | 夏秋 6～10 月 | 花开或果熟可辨；白昼 | 全界 | `wild/urban` | 稀有 / 1 | **（原创扩展）**；与情花是否同物不得断言 | 《本草纲目》《中国药典》《中国植物志》 |
| `it_qinghua` 情花 | 小说虚构；曼陀罗等对应说法无定论 **（待核实）** | `rg_guanzhong` | 绝情谷花圃与荒坳固定点 | 随 `ch03_shendiao` 剧情开放，不套现实采期 | 花刺暴露；全天 | `ch03_shendiao` | `wild/urban` | 剧情限定 / 任务样本 1 | 《神雕侠侣》 | 无可靠现实对应 **（待核实）** |
| `it_qixinhaitang` 七心海棠 | 小说虚构；现实植物原型未定 **（待核实）** | `rg_jingxiang` | 药王谷 / 药圃固定剧情点 | 随 `ch13_feihu` 剧情开放 | 花叶可辨；不设药力时辰 | `ch13_feihu` | `urban` | 剧情唯一 / 1 | 《飞狐外传》·程灵素；细节 **（待考）** | 无可靠现实对应 **（待核实）** |
| `it_duanchangshigufuxincao` 断肠蚀骨腐心草 | 小说虚构；现实原型未定 **（待核实）** | `rg_donghai_islands` | 侠客岛药圃固定点 | 十年一熟按原著母题；游戏仅剧情轮次 | 成熟旗标；无时辰门槛 | `ch06_xiake` | `urban/ruin` | 剧情限定 / 固定 1 | 《侠客行》·腊八粥主药；称谓细节 **（待考）** | 无可靠现实对应 **（待核实）** |
| `it_jinboxunhua` 金波旬花 | 小说虚构；现实原型未定 **（待核实）** | `rg_huxiang`、`rg_yundian_qianzhong`（实验线） | 棺木 / 花房证据、封存旧药库；不作野生群落 | 无循环采期 | 任务旗标；全天 | `ch09_liancheng` | `ruin` | 剧情唯一 / 证据或封存物 1 | 《连城诀》·凌退思与丁典；细节 **（待考）** | 无可靠现实对应 **（待核实）** |
| `it_heshouwu` 何首乌 | 何首乌 `Fallopia multiflora`（接受名与属名 **（待核实）**） | `rg_qinba`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_huxiang`、`rg_bashu` | 山谷灌丛、林缘、石隙与药圃 | 秋冬 9～12 月 | 藤叶衰败后；全天 | 全界 | `wild/urban` | 稀有 / 1 | **（原创扩展）** | 《开宝本草》《中国药典》《中国植物志》 |
| `it_wutou` 乌头 | 乌头 `Aconitum carmichaelii`；川乌 / 草乌基原须分表复核 | `rg_qinba`、`rg_jiangnan_taihu`、`rg_jiangxi`、`rg_jingxiang`、`rg_huxiang`、`rg_bashu` | 山坡草地、林缘与受控药圃 | 夏末秋初 7～9 月 **（待核实）** | 茎叶枯萎前后；全天 | 全界 | `wild/urban` | 稀有 / 1 | **（原创扩展）**；有毒，只作设定 | 《神农本草经》《中国药典》《中国植物志》《医疗用毒性药品管理办法》 |
| `it_maqianzi` 马钱子 | 马钱 `Strychnos nux-vomica` | `rg_fujian`、`rg_lingnan`、`rg_guangxi`、`rg_yundian_qianzhong` | 热带 / 亚热带林中；历史栽培与商路点 | 秋冬 8～翌年 1 月 | 果实成熟；白昼 | `ch05_xiaoao`～`ch09_liancheng`、`ch11_yuanyang`～`ch14_xueshan` | `urban/wild` | 稀有 / 1 | **（原创扩展）**；有毒，只作设定 | 《本草纲目》《中国药典》《中国植物志》《医疗用毒性药品管理办法》 |
| `it_dongchongxiacao` 冬虫夏草 | 冬虫夏草菌 `Ophiocordyceps sinensis` 与寄主蝙蝠蛾幼虫复合体 | `rg_qingzang`、`rg_hexilongyou`、`rg_bashu`、`rg_yundian_qianzhong` | 高寒草甸、灌丛草甸，约 3000 m 以上 | 夏 5～7 月 | 子座出土可辨；白昼 | `ch12_shujian`～`ch14_xueshan` | `wild` | 极稀 / 1 | **（原创扩展）**；按清代文献保守投放 | 《本草从新》《中国药典》 |
| `it_shexiang` 麝香 | 林麝 `Moschus berezovskii` 等麝属来源；分类 **（待核实）** | `rg_qinba`、`rg_bashu`、`rg_qingzang`、`rg_dongbei` | **不可采集**；仅古药库、宫廷 / 门派合法旧藏 | 无 | 任务或遗迹固定收据 | 全界 | `urban/ruin` | 极稀 / 固定 1 | **（原创扩展）**；受保护动物来源仅历史设定 | 《神农本草经》《中国药典》；国家林草局麝类保护通知 |
| `it_xiongdan` 熊胆 | 黑熊 `Ursus thibetanus` 等历史来源；物种 **（待核实）** | `rg_qinba`、`rg_bashu`、`rg_liaodong`、`rg_dongbei` | **不可采集**；仅历史旧药、剧情查获或非循环战利品 | 无 | 任务或遗迹固定收据 | 全界 | `urban/ruin` | 极稀 / 固定 1 | **（原创扩展）**；受保护动物来源仅历史设定 | 《新修本草》《中国药典》；珍稀濒危中药材替代品公告 |
| `it_niuhuang` 牛黄 | 牛 `Bos taurus` 胆结石类历史药材 | `rg_yanjing_zhili`、`rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_monan` | 牲畜医治 / 屠宰副产物或旧药库；不设野采 | 四季 | 合法事件结算；全天 | 全界 | `urban/ruin` | 稀有 / 固定 1 | **（原创扩展）** | 《神农本草经》《中国药典》 |
| `it_xijiao` 犀角 | 犀科 `Rhinocerotidae` 历史药材；具体物种未定 | `rg_lingnan`、`rg_nanhai_islands`（仅历史贸易锚） | **不可采集、不可交易**；只允许封存旧藏 / 证据物 | 无 | 唯一剧情节点 | 全界 | `urban/ruin` | 禁限物 / 固定 1 | **（原创扩展）**；受保护动物来源仅历史设定 | 《神农本草经》；国家林草局禁限售文件 |
| `it_pusiqushedan` 菩斯曲蛇胆 | 小说虚构蛇类；现实原型未定 **（待核实）** | `rg_guanzhong` | 剑冢 / 荒谷固定剧情点，不建立养殖或循环猎杀 | 随 `ch03_shendiao` 剧情 | 神雕馈赠收据；无时辰门槛 | `ch03_shendiao` | `wild/ruin` | 剧情限定 / 每界至多 3 | 《神雕侠侣》·神雕喂杨过蛇胆；细节 **（待考）** | 无可靠现实对应 **（待核实）** |
| `it_chansu` 蟾酥 | 中华大蟾蜍 `Bufo gargarizans` 等药典基原 | `rg_zhongyuan`、`rg_qilu`、`rg_jianghuai`、`rg_jiangnan_taihu`、`rg_jingxiang`、`rg_huxiang`、`rg_lingnan` | 湿地、田边、池塘；游戏仅以旧药 / 非伤害性观察任务发放 | 夏秋 5～9 月 **（待核实）** | 雨后可见；不设现实取材交互 | 全界 | `urban/wild` | 稀有 / 1 | **（原创扩展）**；有毒，只作设定 | 《本草衍义》《中国药典》《医疗用毒性药品管理办法》 |

### 1.5 天级原著奇物（3）

| ID / 名称 | 真实原型（中文正名 + 学名） | 产地区域 `rg_*` | 生境 | 采收季节 / 月份 | 时辰或物候 | 出现书界 | 点型 | 稀有度 / 产量 | 原著出处 | 真实依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| `it_mangguzhuha` 莽牯朱蛤 | 小说虚构蛤蟆；现实原型未定 **（待核实）** | `rg_dali_cangshan` | 无量山剧情奇遇固定点 | 不设现实采期 | 唯一奇遇旗标 | `ch01_tianlong` | `wild` | 天材 / 全作唯一 1 | 《天龙八部》·段誉机缘；毒理措辞 **（待考）** | 无可靠现实对应 **（待核实）** |
| `it_bingcan` 冰蚕 | 小说虚构寒毒蚕；现实原型未定 **（待核实）** | `rg_hedong_jinzhong`（章节旅途投影） | 冰蚕旅途 / 隔离剧情节点，不建立养殖点 | 不设现实采期 | 唯一奇遇旗标 | `ch01_tianlong` | `ruin/wild` | 天材 / 全作唯一 1 | 《天龙八部》·游坦之冰蚕线；细节 **（待考）** | 无可靠现实对应 **（待核实）** |
| `it_zhujingbingchan` 朱睛冰蟾 | 小说奇物；现实原型未定 **（待核实）** | `rg_guanzhong`、`rg_yanjing_zhili`（流转节点，产地待考） | 华山门人携带 / 剧情救治，不设自然种群 | 不设现实采期 | 唯一剧情旗标 | `ch07_bixue` | `urban/ruin` | 天材 / 全作唯一 1 | 《碧血剑》·袁承志持有并用于救治；三联本细节 **（待考）** | 无可靠现实对应 **（待核实）** |

---

## 2. 特殊物品采集表

本表只投影可采“资源批次”，不新建背包 `it_*`。运行时须由 `design/16` 的 `res_<category>_<tier><rank>` 生产规则实例化，再由 `design/10` 已登记的具体材料封装；“建议阶品”遵守一品最高、九品最低，且天阶不循环。

| 特殊物品 | 资源类别 / 建议阶品 **【建议值】** | 产地区域 `rg_*` | 采集点 / 工具标签 | 季节 / 物候 | 单轮产出 | 安全与投放边界 |
|---|---|---|---|---|---:|---|
| 铁矿石 | `kuangshi` / 黄九～玄七 | `rg_guanzhong`、`rg_qinba`、`rg_hedong_jinzhong`、`rg_bashu`、`rg_liaodong` | 矿洞、废炉；`mining` | 四季；矿洞无物候 | 1～3 篓 | 只取已勘定浅层矿点，不写现实冶炼配方 |
| 铜矿石 | `kuangshi` / 黄六～玄六 | `rg_jiangxi`、`rg_huxiang`、`rg_yundian_qianzhong`、`rg_dali_cangshan` | 矿洞、旧铸场；`mining` | 四季 | 1～2 篓 | 遗迹坍塌风险走地图门禁 |
| 辰砂矿 | `kuangshi` / 玄六～地九 | `rg_huxiang`、`rg_guangxi`、`rg_bashu`、`rg_yundian_qianzhong` | 矿洞、旧药矿；`mining/protective` | 四季 | 1 篓 | 与药材 `it_zhusha` 分账；有毒，只作设定 |
| 和田玉籽料 / 山料 | 原矿 `kuangshi`、成品 `zhenbao` / 玄三～地七 | `rg_xiyu_nanjiang` | 河谷砾滩、山料遗迹；表面拾取或 `mining` | 夏末秋初水位适宜 **（待核实）** | 1～2 份 | 不把所有白石判作玉；须鉴定后才转珍宝 |
| 岫岩玉料 | 原矿 `kuangshi`、成品 `zhenbao` / 玄六～地九 | `rg_liaodong` | 河谷、旧矿；`mining` | 春至秋，冻土期关闭 | 1～2 份 | 历史开采年代与具体矿口 **（待考）** |
| 松木 | `mucai` / 黄九～黄四 | `rg_qinba`、`rg_hedong_jinzhong`、`rg_bashu`、`rg_liaodong`、`rg_dongbei` | 林地；`cutting` | 冬季修枝 / 风倒木优先 | 1～3 束 | 普通节点只取枯倒木；活木砍伐须林场许可 |
| 竹材 | `mucai` / 黄七～玄八 | `rg_jiangnan_taihu`、`rg_zhedong`、`rg_fujian`、`rg_jiangxi`、`rg_huxiang`、`rg_lingnan`、`rg_bashu` | 竹林 / 庄园；`cutting` | 冬春择成熟竹 **（待核实）** | 1～3 束 | 山野点限疏伐，庄园点须取得经营权 |
| 楠木旧料 | `mucai` / 玄三～地九 | `rg_bashu`、`rg_huxiang`、`rg_yundian_qianzhong` | 废宅梁木、风倒古木；`cutting` | 四季，遗迹状态开放 | 1 份 | 不循环砍古树；遗迹拆取不得破坏主线证据 |
| 羊皮 / 羊毛 | `picao` / 黄六～玄九 | `rg_hexilongyou`、`rg_xixia_helan`、`rg_xiyu_nanjiang`、`rg_xiyu_beijiang`、`rg_monan`、`rg_mobei` | 牧场、集市；容器 | 春剪毛、秋冬皮料 | 1～3 捆 | 家畜副产，购买 / 劳作结算，不以地图滥杀获得 |
| 鹿皮 | `picao` / 玄六～地九 | `rg_qinba`、`rg_liaodong`、`rg_dongbei`、`rg_monan` | 猎户委托、遗迹旧藏；`protective` | 秋冬 | 固定 1 捆 | 仅合法委托或既有战利品，不设重复屠猎点 |
| 雁羽 | `shoucai` / 黄六～玄九 | `rg_qilu`、`rg_jianghuai`、`rg_donghai_islands`、`rg_monan` | 湖滩、驿站鹅舍；`container` | 春秋迁徙或换羽 **（待核实）** | 1～3 份 | 只拾自然脱落羽 / 家禽副产，不捕杀候鸟 |
| 孔雀尾羽 | `shoucai` / 玄三～地九 | `rg_lingnan`、`rg_guangxi`、`rg_yundian_qianzhong` | 庄园鸟苑、林缘观察点；`container` | 换羽期 **（待核实）** | 固定 1 份 | 只取自然脱落羽；物种与历史饲养范围 **（待核实）** |
| 蜂蜡 | `shoucai` / 黄四～玄九 | `rg_jianghuai`、`rg_jiangnan_taihu`、`rg_zhedong`、`rg_fujian`、`rg_lingnan` | 蜂农、废弃蜂巢；`protective/container` | 春夏花期后 | 1～2 份 | 活巢须蜂农许可；不提供现实取蜜步骤 |
| 海贝珠母 | `zhenbao` / 玄六～地九 | `rg_zhedong`、`rg_fujian`、`rg_donghai_islands`、`rg_nanhai_islands` | 海滩旧壳、海商仓与沉船遗迹；`container` | 退潮或遗迹开放 | 1～2 份 | 普通点只拾空壳；珍珠仅固定事件，不以刷贝获得 |

普通节点不得直接产天阶资源。地级楠木、鹿皮、玉料与羽材只在一次性遗迹、任务或每区唯一稀缺点出现；取得价值分别按 `resource/loot/quest` 唯一入账，不因加工或出售再次记为新增经济价值。

---

## 3. 运行投放约束

1. 每条药材候选必须同时满足：当前 `chapterId` 在出现书界、当前 `regionId` 在产地区域、点型匹配、季节 / 月份与物候匹配、唯一收据未占用。
2. 城镇药圃可表现“栽培”，但不能因此把只在清代有可靠药名记录的党参、冬虫夏草倒灌到宋元；跨季库存属于商店 / 储藏，不属于活体刷新。
3. 年限变体共用真实基原但不共用掉落权重：普通 / 十年可进入对应池，百年仅固定稀有点，千年只在天材 / 唯一收据。
4. 小说虚构奇物、情花、七心海棠、金波旬花、菩斯曲蛇胆、莽牯朱蛤、冰蚕与朱睛冰蟾只按剧情固定节点投放；现实物种原型不得由相似名称自动匹配。
5. `it_shexiang`、`it_xiongdan`、`it_xijiao` 永不出现在 `kind=gather` 的循环 `yields[]`；可存在于历史旧库、查获证据或剧情收据，且不可因此鼓励现实交易。
6. 毒材节点只显示抽象“危险 / 需辨识与容器”提示，不能显示现实剂量、加工、提取或施用步骤。无合法工具 / 技艺时拒绝，预览与拒绝不推进 RNG。
7. 表中“全天”只表示没有可靠时辰依据，不表示现实任何时候均适宜；“白昼”用于可见性与安全反馈，不宣称药效随时辰变化。

---

## 4. 参考资料

以下资料只用于核对基原、分布、安全边界与史料时代，不构成医疗、采药、捕猎或交易建议；古代本草只列书名，不伪造卷次、页码。网络资料访问日期均为 **2026-10-02**。

- 国家药品监督管理局：[关于颁布 2025 年版《中国药典》的公告](https://www.nmpa.gov.cn/directory/web/nmpa/xxgk/fgwj/gzwj/gzwjyp/20250325183810122.html)：2025 年版自 2025-10-01 实施，用于确认现行法定标准版本。
- 国家药典委员会：[2025 年版《中国药典》网络版](https://2025.chp.org.cn/)：用于复核药材正名、多基原与标准收载状态；页面检索结果仍须专业人员终审。
- 香港卫生署中医药规管办公室：[香港中药材标准](https://www.cmro.gov.hk/html/eng/useful_information/hkcmms/index.html)及[收载清单](https://www.cmro.gov.hk/html/eng/useful_information/hkcmms/cmmlist.html)：辅助交叉核对常见药材名称与基原。
- 中国科学院植物研究所：[中国植物志](https://www.iplant.cn/z/)与 [Flora of China](https://www.iplant.cn/foc)：用于植物接受名、形态与自然分布；本表的宽季节玩法窗不是逐地物候预报。
- 中国植物志：[钩吻 `Gelsemium elegans`](https://www.iplant.cn/z/frps/45582)：仅支撑现实原型的植物学信息，不证明其就是小说“断肠草”。
- iPlant：[雪莲花 `Saussurea involucrata`](https://www.iplant.cn/info/Saussurea%20involucrata?t=z)：用于天山雪莲原型、海拔与花果期的交叉核对。
- 国家卫生健康委员会：[《医疗用毒性药品管理办法》](https://www.nhc.gov.cn/zwgk/fagui/200804/f57c418589ad4c9395174788cda08768.shtml)：支撑乌头、马钱子等毒材只作受控设定的边界。
- 国家林业和草原局：[关于进一步加强麝、熊资源保护及其产品管理的通知](https://www.forestry.gov.cn/uploadfile/gfxwj/20155/163bd3fd-f0cc-4441-85b4-ee53697edd60.pdf)：支撑麝香、熊胆不设循环野采。
- 国务院：[关于严格管制犀牛和虎及其制品经营利用活动的通知](https://www.gov.cn/gongbao/content/2018/content_5338227.htm)：支撑犀角不可采集、不可交易，只能作为封存证据物。
- 国家药监局、国家中医药局：[关于支持珍稀濒危中药材替代品研制有关事项的公告](https://www.gov.cn/zhengce/zhengceku/202410/content_6981984.htm)：支撑优先采用替代品、不可因历史药名设计循环获取。
- 历史药名与早期使用语境参考《神农本草经》《新修本草》《开宝本草》《本草衍义》《本草纲目》《本草从新》；具体基原仍以现代标准与植物志复核。

## 5. 本文新增术语与 ID

- 本表不新定义全局 ID；它逐行消费 `catalog/items-medicine.md` 的 76 个药材 `it_*`：既有 12 个年限 / 原著条目，加 AR-28 追加 64 个条目（复用 5 个既有 ID、新建 59 个 ID）。这 64 个 AR-28 条目的唯一权威登记见 `design/10` §14.2。
- `gatherEligibility`（投放判定术语）：书界、区域、点型、月份 / 季节、物候、工具 / 技艺及唯一收据的合取结果；实现字段仍归 `design/11`，不是新存档对象。
- “历史旧藏”：受保护动物来源、禁限物或不可持续来源只可作为一次性剧情证据 / 遗迹存量，不进入循环采集、商店补货或经营产出。
- “宽季节玩法窗”：将跨地区自然物候折成可玩的月份范围；不是现实采收建议，也不保证每个 `rg_*` 同月成熟。

## 6. 数据校验规则与测试用例

| 编号 | 检查 / 输入 | 通过条件 |
|---|---|---|
| GH-V01 | 抽取本文 `\| \`it_*\`` 与药物名录所有子类以“药材”开头的行 | 两侧集合相等且均为 76 个唯一 ID；本文无重复、无漏项 |
| GH-V02 | 抽取 AR-28 新增 64 行 | 子类计数为草本 16、根茎 19、花果 9、菌藻 5、动物 11、矿物 4 |
| GH-V03 | 抽取新增 64 行的品阶 | 黄 26（40.625%）、玄 20（31.25%）、地 15（23.4375%）、天 3（4.6875%）；天级 ≤8% |
| GH-V04 | 校验每个药材行 | ID、中文名、原型、区域、生境、季节 / 月份、时辰 / 物候、书界、点型、稀有度 / 产量、原著出处、真实依据均非空 |
| GH-V05 | 区域与点型 | 所有 `rg_*` 属 `design/11` §13.2 闭集；点型只为 `urban/wild/ruin` 的组合 |
| GH-V06 | 时代投放 | 党参、三七、冬虫夏草等保守晚投条目不得在其列出的首界以前生成；`ch10_baima` 按唐代第一正式书判断 |
| GH-V07 | 禁限来源 | `it_shexiang`、`it_xiongdan`、`it_xijiao` 不得进入循环 `yields[]`；天材与剧情唯一物不得随 `refreshIndex` 重生 |
| GH-V08 | 有毒条目 UI / 数据 | 只显示抽象风险与辨识门槛；不得包含现实剂量、配伍、炮制、提取、服用或捕猎步骤 |
| GH-T01 | 同一普通点同一 `refreshIndex` 重进、预览、取消后再采 | 候选和产量不变；只有成功领取推进状态，遵守 `design/11` 的 `world` RNG |
| GH-T02 | 在区域 / 月份 / 工具任一不符时尝试采集 | 拒绝且不耗 RNG、不产生物品或经济价值；提示缺失条件 |
| GH-T03 | 跨月使药材离开季节窗，仓库已有同药材 | 活体节点停止生成；合法旧库存仍可存在，但不伪装成当月新采 |
| GH-T04 | 首次领取唯一奇物后保存、读档、跨点返回 | 唯一收据仍占用，不重复生成；书眠处理只引用 `design/10` / `16` |
| GH-T05 | 特殊物品取得后加工并出售 | 新增价值只在首次取得按 `resource/loot/quest` 之一记账；加工与出售不重复记来源 |

## 7. 待决事项 / 依赖

### 7.1 替下游给出的建议值

- `design/11` / 实现：月份按农历近似、城镇 / 山野 / 遗迹普通点沿 1 / 3 / 5 日刷新；表内“少见 / 稀有 / 极稀”默认权重分别为 20% / 8% / 2%，固定 / 剧情项不掷权重 **【建议值】**。
- `design/12` / 章节：虚构奇物只发唯一收据；菩斯曲蛇胆每书界至多 3 枚，其余原著奇物默认全作 1 枚 **【建议值】**。

### 7.2 本文依赖的上游事实

- 依赖 `design/02` 的年代、`design/19` 的区域地理、`design/10` 的物品与品阶、`design/11` 的采集 / RNG、`design/16` 的资源阶品 / 估值；本文只给逐味投放。
- AR-26 的白马唐代 / 首书决定高于当前 `design/02`、`19` 的旧定年；同步前按作者要求执行。

### 7.3 对基准的修改提案

- **P-GH-01**：基准 §18 增列“普通遗迹、普通采集点及逐味分布归 `design/11`，资源估值 / 经营归 `design/16`，物品效果 / 炼丹归 `design/10`”，以免三份文档重复定义。
- **P-GH-02**：基准书序与时代表吸收 AR-26：`ch10_baima` 稳定 ID 不改，但显示为唐代第一本正式书。

### 7.4 原著考据待办

- 按三联 / 广州修订版逐字核对天山雪莲、莽牯朱蛤、冰蚕、菩斯曲蛇胆、情花 / 断肠草、七心海棠、金波旬花、断肠蚀骨腐心草、朱睛冰蟾的书名、人物、出现地点与用途；未核完前保留 **（待考）**，不写回目号或引文。
- 情花与现实曼陀罗 / 洋金花、小说断肠草与钩吻均不得自动判为同物；雪参、朱睛冰蟾的现实 / 文本原型继续 **（待核实）**。

### 7.5 开放问题（附默认值）

- 药材是否随季节真实缺货：默认活体采集点缺货，商店和仓储可出售合法旧库存，UI 标“存货”而非“本月新采”。
- 普通采集是否需要技能：默认常见黄阶徒手可采；玄阶普通药材按 `med` 对 `design/03` 的 `T(outputGrade)` 判稀有副产，危险 / 地阶毒材按 `poi` 或 `antidote` 判，矿洞要求工具；不新增 `herbalism` / `survival` 玩家技艺。具体规则见 `design/11` §4.3.2。
- 是否显示精确月份：默认图鉴发现前只显示季节，完成辨识后显示本表月份，避免攻略化透底。
- 受保护 / 禁限来源是否可进背包：默认只以不可使用、不可交易的证据收据表现；若剧情必须展示历史药材，限一次且不开放采集动画。

# KIT-xiyu-hist 报告 · 建筑套件 · 西域套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

完成 19 类建筑与 7 类贴片的历史图片检索、下载、目视审阅和真实输入重出；共登记 60 次历史图使用、28 个唯一 URL。
以重出前正式图锁定几何／投影，实际输入 2–3 张历史图；生成 21+10=31 个候选，选 26 个同 ID 覆盖正式 PNG。
26 张成品均与 HEAD 基点不同；manifest 已更新实发提示、真实引用、候选选择、规格化、新尺寸和 SHA，并移除阻断状态。
逐图及灰底总览复核通过；唯一明确未落实项是 `wharf` 仍为石铺渠岸，未呈现尼雅胡杨木跳板。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/xiyu/`：19 张新版 PNG；manifest（885 行）登记 21 候选、39 次历史图输入；`sources/historical-rerender/` 保存 19 张几何锁定图、21 组候选与调用 JSON。
- `assets/default/tile/xiyu/`：7 张新版 PNG；manifest（293 行）登记 10 候选、21 次历史图输入；`source/historical-rerender/` 保存 7 张几何锁定图、10 组候选与调用 JSON。
- `assets/default/prompts/building-map.md`（938 行）：西域套件历史图片输入规则、7 个形制族细节矩阵和来源边界。
- `assets/default/prompts/tile.md`（606 行）：墙门、桥、胡杨、葡萄架的历史细节、排除项及史证强弱。
- `tools/agents/reports/KIT-xiyu-hist.md`（本报告，≤100 行）：返修结果、来源、候选数和校验。下载原图在 `/private/tmp/KIT-xiyu-hist-refs/`，不入库。

## 3. 关键结论与数值

- 覆盖量为 `19+7=26` 类；建筑参考 `18×2+1×3=39` 次，贴片 `7×3=21` 次，合计 60 次、28 个唯一 URL；每类满足 2–3 张。
- 新候选数 `17×1+2×2 + 4×1+3×2 = 21+10 = 31`；每件最多 2 候选，选 26。成品 SHA、候选 SHA、调用记录与 manifest 交叉核验无误。
- 全部保持斜 45°、约俯仰 30°、2:1 地面投影意图、左上光、真 RGBA、清楚底边；ID、类型、占地和旧画布尺寸未变。
- 普通建筑以厚土墙、草筋泥抹、木梁密椽覆土平顶、小深窗和低女儿墙为核心，不泛用灰瓦、斗拱、鸱吻或脊兽；宗教／等级件只局部用砖拱、几何砖饰、木柱雕刻及克制釉砖。
- 规格化仅做 alpha 极值清理、裁框、单次等比 LANCZOS 与透明扩边；未拉伸或重绘。重出前锁定图旧测点已改名 `geometry_qa_prior_round`，不冒充本轮复测；其中三项旧告警须总装重测。

## 4. 开放问题（附默认值）

- `wharf`：默认接收本轮石铺渠岸候选并保留 `candidate`；若作者要求木构优先，后续只重出该件，明确强化胡杨木桩／取水跳板并弱化石铺。
- 年代归属：多数照片为 1915 年或现代遗址／现存建筑，默认只作地域材料与构造旁证，具体书界年代均（待考），不称具名古迹复原。
- 桥和葡萄架：默认继续标（原创扩展）；三原木桥／取水跳板不直接证明 3×5 带栏桥，1963–1964 年葡萄园不直接证明四柱棚架节点。
- 作者确认：默认维持通用南疆绿洲意象、低饱和土木材质、现有占地与 `candidate`；三项轴向告警不豁免，待总装复测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本轮只补资产生产证据与提示词，不建议修改基准、ID、类型、占地或玩法规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么（本任务未改） |
|---|---|---|
| 资产审核记录 | xiyu 套件状态 | 登记本轮 26 张历史重出、31 候选及 `wharf` 木跳板未落实限制。 |
| `docs/design/22-town-layout-and-generation.md`／总装任务 | 西域套件接入与几何验收 | 复核三建筑轴向、门孔、墙角接缝、桥栏遮挡、四向与真机表现。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 26 类均实际下载并目视审阅 2–3 张来源；无整类下载失败。现代 Langar 悬索桥虽下载但判为不适用并排除，未写入 manifest。
- ✅ 26 类都以历史图片作为 `image_generation` 输入；31 个候选均归档，逐候选／成品及灰底总览已 `view_image`。
- ✅ 历史细节总表：土木平顶／夯土土坯／深门窗／素木柱梁；砖拱与几何饰仅限宗教和等级件；墙门见夯层风蚀；胡杨见粗裂扭干；葡萄见密藤尺度；现代修缮和中式瓦作均排除。

| ID／类型 | 历史图片来源（URL）与取用细节 | 候选 |
|---|---|---:|
| `biaoju` | [1915 商队驿站](https://commons.wikimedia.org/wiki/File:A_Caravanserai_on_the_Osh-Kashgar_road.jpg)、[1915 喀什城](https://commons.wikimedia.org/wiki/File:The_City_of_Kashgar.jpg)：厚泥墙、圆木柱梁、密椽土顶、低层围院 | 1 |
| `casino` | [1915 喀什学校](https://commons.wikimedia.org/wiki/File:A_Kashgar_School.jpg)、[商队驿站](https://commons.wikimedia.org/wiki/File:A_Caravanserai_on_the_Osh-Kashgar_road.jpg)：深洞口、素木柱、遮阴廊；功能仍原创 | 1 |
| `courtyard` | [1915 喀什城墙](https://commons.wikimedia.org/wiki/File:The_City_Wall_of_Kashgar.jpg)、[1963 吐鲁番葡萄](https://commons.wikimedia.org/wiki/File:1963-03_1963%E5%B9%B4_%E5%90%90%E9%B2%81%E7%95%AA%E7%9B%86%E5%9C%B0%E8%91%A1%E8%90%84.jpg)：厚墙平顶、内院藤蔓尺度 | 1 |
| `guardhouse` | [喀什城墙](https://commons.wikimedia.org/wiki/File:The_City_Wall_of_Kashgar.jpg)、[叶尔羌喀什门](https://commons.wikimedia.org/wiki/File:Yarkand_Kashgar_Gate.jpg)：依墙低矮守舍、层理、深门洞 | 1 |
| `house_large` | [喀什老城民居](https://commons.wikimedia.org/wiki/File:Kashgar_-_old_town_houses.jpg)、[1915 喀什城](https://commons.wikimedia.org/wiki/File:The_City_of_Kashgar.jpg)：局部木廊挑梁、土墙平顶、密集尺度 | 1 |
| `house_small` | [喀什学校](https://commons.wikimedia.org/wiki/File:A_Kashgar_School.jpg)、[交河 391](https://commons.wikimedia.org/wiki/File:Turpan_May_2007_391.jpg)：单层厚墙、小深窗、土坯与泥抹 | 1 |
| `inn` | [商队驿站](https://commons.wikimedia.org/wiki/File:A_Caravanserai_on_the_Osh-Kashgar_road.jpg)、[1915 喀什城](https://commons.wikimedia.org/wiki/File:The_City_of_Kashgar.jpg)：围院货门、木廊与平顶聚落 | 1 |
| `manor` | [1915 喀什城](https://commons.wikimedia.org/wiki/File:The_City_of_Kashgar.jpg)、[1964 葡萄园](https://commons.wikimedia.org/wiki/File:1964-02_1964%E5%B9%B4_%E5%90%90%E9%B2%81%E7%95%AA%E8%91%A1%E8%90%84%E5%9B%AD.jpg)：土木大院、绿洲藤荫尺度，非宫殿轴线 | 1 |
| `market` | [喀什市场](https://commons.wikimedia.org/wiki/File:Sunday_market_Kashgar_IGP4058.jpg)、[农具摊](https://commons.wikimedia.org/wiki/File:Hand-made_rakes_for_sale._Kashgar_market._2011.jpg)：木铜陶器、绳索与低位捆扎；钢棚等排除 | 1 |
| `pagoda` | [苏公塔](https://commons.wikimedia.org/wiki/File:Emin_Khoja_Minaret.jpg)、[1915 班超塔照片](https://commons.wikimedia.org/wiki/File:The_Pagoda_of_Pan_Chao,_Kashgar.jpg)：收分砖塔、几何砖饰、小券洞 | 1 |
| `palace` | [叶尔羌旧城堡门](https://commons.wikimedia.org/wiki/File:Yarkand-puerta-antigua-ciudadela-d01.jpg)、[阿帕克和卓墓](https://commons.wikimedia.org/wiki/File:Afaq_Khoja_Mausoleum_(2017,_3_by_4_crop).jpg)：砖拱木廊、少量釉砖；具名轮廓不取 | 1 |
| `restaurant` | [商队驿站](https://commons.wikimedia.org/wiki/File:A_Caravanserai_on_the_Osh-Kashgar_road.jpg)、[喀什老城民居](https://commons.wikimedia.org/wiki/File:Kashgar_-_old_town_houses.jpg)：粗木遮阴廊、土墙平顶 | 1 |
| `shop_1f` | [喀什市场 4059](https://commons.wikimedia.org/wiki/File:Sunday_market_Kashgar_IGP4059.jpg)、[喀什学校](https://commons.wikimedia.org/wiki/File:A_Kashgar_School.jpg)：深铺洞、木挑棚、素土墙 | 1 |
| `shop_2f` | [喀什老城民居](https://commons.wikimedia.org/wiki/File:Kashgar_-_old_town_houses.jpg)、[喀什市场](https://commons.wikimedia.org/wiki/File:Sunday_market_Kashgar_IGP4058.jpg)：下层深铺、上层局部木廊／格窗 | 1 |
| `stable` | [商队驿站](https://commons.wikimedia.org/wiki/File:A_Caravanserai_on_the_Osh-Kashgar_road.jpg)、[1915 图曼河](https://commons.wikimedia.org/wiki/File:The_Tuman_Su_at_Kashgar.jpg)：土墙围栏、深檐素木、木桩尺度 | 1 |
| `temple_hall` | [喀什彩柱](https://commons.wikimedia.org/wiki/File:Decorated_pillars._Mosque._Kashgar.jpg)、[叶尔羌阿勒屯](https://commons.wikimedia.org/wiki/File:Yarkand-complejo-mezquita-altyn-d01.jpg)、[艾提尕尔顶棚](https://commons.wikimedia.org/wiki/File:2015-09-10-135433_-_Kashgar,_Id_Kah_Moschee.JPG)：柱廊、尖拱、克制几何彩饰 | 1 |
| `warehouse` | [商队驿站](https://commons.wikimedia.org/wiki/File:A_Caravanserai_on_the_Osh-Kashgar_road.jpg)、[交河 392](https://commons.wikimedia.org/wiki/File:Turpan_May_2007_392.jpg)：少窗厚墙、密椽土顶、夯层 | 1 |
| `wharf` | [1915 图曼河](https://commons.wikimedia.org/wiki/File:The_Tuman_Su_at_Kashgar.jpg)、[中科院尼雅跳板](http://www.igsnrr.cas.cn/cbkx/kpyd/kcsj/94nyx/202009/t20200910_5693325.html)：输入用于土岸浅阶、削平胡杨木；成品仍为石铺渠岸，跳板未落实 ⚠️ | 2 |
| `yamen` | [叶尔羌旧城堡门](https://commons.wikimedia.org/wiki/File:Yarkand-puerta-antigua-ciudadela-d01.jpg)、[喀什学校](https://commons.wikimedia.org/wiki/File:A_Kashgar_School.jpg)：厚土院、克制砖券门、素木柱廊 | 2 |
| `city_gate k4` | [喀什城墙](https://commons.wikimedia.org/wiki/File:The_City_Wall_of_Kashgar.jpg)、[叶尔羌喀什门](https://commons.wikimedia.org/wiki/File:Yarkand_Kashgar_Gate.jpg)、[旧城堡门](https://commons.wikimedia.org/wiki/File:Yarkand-puerta-antigua-ciudadela-d01.jpg)：厚墙、夯层、垛口、深洞 | 2 |
| `city_gate k6` | 同上三图：扩大净宽但保持厚土门墙、平直木过梁和透明通道，不照搬尖拱／门楼 | 2 |
| `wall` | [喀什城墙](https://commons.wikimedia.org/wiki/File:The_City_Wall_of_Kashgar.jpg)、[交河遗址](https://commons.wikimedia.org/wiki/File:Jiaohe_-_Yarkhoto_ruins.jpg)、[交河 392](https://commons.wikimedia.org/wiki/File:Turpan_May_2007_392.jpg)：夯层、土坯块、风蚀缺口 | 1 |
| `wall_corner` | [喀什城墙](https://commons.wikimedia.org/wiki/File:The_City_Wall_of_Kashgar.jpg)、[交河遗址](https://commons.wikimedia.org/wiki/File:Jiaohe_-_Yarkhoto_ruins.jpg)、[交河 391](https://commons.wikimedia.org/wiki/File:Turpan_May_2007_391.jpg)：连续土体、圆钝转角、剥落砌块 | 1 |
| `bridge_deck` | [1906 黑山村三原木桥](https://www.weishoot.com/story/B6C1F090-225C-4811-BDB1-3F0899529B68.html)、[尼雅跳板](http://www.igsnrr.cas.cn/cbkx/kpyd/kcsj/94nyx/202009/t20200910_5693325.html)、[图曼河](https://commons.wikimedia.org/wiki/File:The_Tuman_Su_at_Kashgar.jpg)：旧木纹、削平面、木销与土岸；低栏沿用登记，非直接史证 | 2 |
| `tree_cluster huyang` | [塔里木胡杨](https://commons.wikimedia.org/wiki/File:Tarim_Desert_Highway_-_Desert_poplars,_Xinjiang,_China.jpg)、[胡杨 HDR](https://commons.wikimedia.org/wiki/File:Xinjiang_Diversifolious_Poplar((HDR)2)_(7070314723).jpg)、[老幼胡杨](https://commons.wikimedia.org/wiki/File:Xinjiang_Old_and_young_(Populus_diversifolia_%E8%83%A1%E6%9D%A8)_(4973519309).jpg)：粗裂扭干、疏松宽冠；HDR 色排除 | 1 |
| `grape_arbor` | [1963 葡萄](https://commons.wikimedia.org/wiki/File:1963-03_1963%E5%B9%B4_%E5%90%90%E9%B2%81%E7%95%AA%E7%9B%86%E5%9C%B0%E8%91%A1%E8%90%84.jpg)、[1964 葡萄园](https://commons.wikimedia.org/wiki/File:1964-02_1964%E5%B9%B4_%E5%90%90%E9%B2%81%E7%95%AA%E8%91%A1%E8%90%84%E5%9B%AD.jpg)、[1964 采摘](https://commons.wikimedia.org/wiki/File:1964-02_1964%E5%B9%B4_%E5%90%90%E9%B2%81%E7%95%AA%E8%91%A1%E8%90%84%E5%9B%AD2.jpg)：密藤、果穗与绿洲田网；四柱节点非直接史证 | 1 |

- ✅ 指定检查：建筑 19 图／19 条／0 问题；贴片 7 图／7 条／0 问题；严格 ID 检查退出 0、无新增失败（保留基线既知 `sk_babuganchan` 1 项）。
- ✅ YAML 可解析，26 个文件存在且 SHA 与登记一致；`git diff --check` 通过，只改授权路径，未执行改变仓库状态的 git 命令。
- ⚠️ 无下载失败类型；需作者确认仅为 `wharf` 是否必须再重出木跳板，以及跨年代通用化／原创桥棚母题，默认值见 §4。

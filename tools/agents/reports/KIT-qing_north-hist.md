# KIT-qing_north-hist 报告 · 建筑套件 · 清 · 北方套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

已同 ID 重出清北套件19张建筑与7张贴片，ID、类型和占地均未改变。
每类下载并目视检查2–3张历史 / 存世参考图，实际作为 `image_gen` 输入，并同时输入同类宋基线。
新图强化灰筒板瓦、素脊 / 鸱吻、斗拱等级、柱网、石基、砖砌、棂窗与克制彩画；均为真RGBA。
三项指定检查全部通过；整城拼缝、门孔逐像素对格及碰撞仍（待实测），故状态维持 `candidate`。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/qing_north/`：19 PNG；`manifest.yaml` 1525行，逐件提示词、2–3条历史输入、哈希、尺寸、规格化和细节清单。
- `assets/default/tile/qing_north/`：7 PNG；`manifest.yaml` 539行，同上并保留原 `kind` / `variant` / 占地。
- `assets/default/prompts/building-map.md` 852行、`tile.md` 546行：改写清北节的历史图输入规则与历史细节要点。
- 本报告不超过100行；临时参考图、生成日志和联系表仅在 `/private/tmp/KIT-qing_north-hist-refs/`，未入库。

## 3. 关键结论与数值

- 数量：19建筑 + 7贴片；每项入库1张，纳入评审1–2候选；占地与旧manifest逐ID比对完全一致。
- 规格：正交斜45°、俯仰30°、2:1地面目标、左上光；PIL仅以alpha≥8排除贴边噪点、等比缩放、补四边≥8%透明留白。
- 画幅：建筑短边256–1237 px；贴片短边79–527 px；26图均RGBA、alpha含0/255、边框alpha=0。
- `biaoju`、`market_stall` 各纳入前2候选，工具额外生成的第3图未评审、未采用；不以工具冗余突破“最多2候选”。
- 历史边界：晚清照片 / 现代存世建筑只提供可见形制，不证明所有构件均属清初；作品均为匿名组合 **（原创扩展）**。

## 4. 开放问题（附默认值）

- 整城拼接、门墙接口、桥岸遮挡、院内碰撞与两城门通行孔掩膜（待实测）；默认保持 `candidate`，不宣称发布验收。
- 马厩缺直接同期建筑照片；默认以历史马车 / 马匹尺度加北京胡同附属空间为间接证据，具体厩舍形制（待考）。
- 普通民居参考含现代存世胡同，王府 / 寺观参考含修缮状态；默认只取保守构造母题，不声称清初原状复原。
- 作者是否接受本轮官式建筑的暗朱 / 青绿饱和度；默认保留现候选，不自动升为 `approved`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。素材重出不改变基准规则、玩法、ID、类型或占地。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/22` / 清北城门与墙桥装配：后续联调时登记门孔mask、墙高 / 接缝及桥岸遮挡实测结果；本任务无权修改。
- 城市套件接入清单 / `qing_north`：作者审图后将所选资产状态由 `candidate` 升级；本任务不改上游。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 民居 / 院落（小、大、courtyard；1/2/1候选）：[北京胡同](https://commons.wikimedia.org/wiki/File:Peking_Hutong_courtyard.JPG)、[石家大院](https://commons.wikimedia.org/wiki/File:Shiyuan_tianjin_doorways.jpg)；硬山灰筒板瓦、素脊、青砖下碱、石基、格窗、随墙门。
- ✅ 商铺 / 客栈 / 赌场（1/1/1/1候选）：[Thomas Child街景](https://commons.wikimedia.org/wiki/File:Thomas_Child,_Peking_Streets.jpg)、[1895街景](https://commons.wikimedia.org/wiki/File:William_Henry_Jackson,_Street_scene,_Peking,_1895.jpg)，赌场另用北京胡同；铺面开间、板门 / 格窗、布篷、砖木山墙、院落围合。
- ✅ 酒楼 / 市场棚（1/2候选）：[东四牌楼市场](https://commons.wikimedia.org/wiki/File:Thomas_Child_-_Market_by_Dongsi_Pailou,_Peking_NA01-73.jpg)、[北京华人街](https://commons.wikimedia.org/wiki/File:VIEW_OF_THE_CENTRAL_STREET_IN_THE_CHINESE_QUARTER_OF_PEKING.jpg)，酒楼另用街景；双层木廊、折板门、浅篷；摊棚为榫接木柱、靛蓝布篷、藤筐陶罐。市场棚额外第3输出未纳入。
- ✅ 衙署（2候选）：[平遥县衙主院](https://commons.wikimedia.org/wiki/File:Pingyao_Yamen_Main_Courtyard.jpg)、[县衙院落](https://commons.wikimedia.org/wiki/File:Pingyao_Yamen_courtyard.jpg)；中轴五开间正厅、东西厢房、低月台、暗朱柱、克制彩画。
- ✅ 镖局 / 马厩（2/1候选）：[北京胡同](https://commons.wikimedia.org/wiki/File:Peking_Hutong_courtyard.JPG)、[历史马车马匹](https://commons.wikimedia.org/wiki/File:China,_Miscellaneous_Scenes-_Group_of_people,_carts,_and_horses_or_ponies_in_a_field_(7454211264).jpg)；高墙货院、车门、货仓、车具尺度；马厩用重木柱、半高隔栏、石槽。⚠️ 后者为间接证据；镖局额外第3输出未纳入。
- ✅ 大院 / 王府（1/1候选）：[石家大院](https://commons.wikimedia.org/wiki/File:Shiyuan_tianjin_doorways.jpg)、[恭王府一](https://commons.wikimedia.org/wiki/File:GongWangFu_courtyard_(2917122776).jpg)、[恭王府二](https://commons.wikimedia.org/wiki/File:GongWangFu_courtyard_(2916271883).jpg)、[沈阳故宫](https://commons.wikimedia.org/wiki/File:Imperial_Palaces_of_the_Ming_and_Qing_Dynasties_24351-Shenyang_(49052461177).jpg)；双院、官式柱网、一级斗拱、石台基、青绿赭彩画、局部绿琉璃边。
- ✅ 寺殿（1候选）：[颐和园殿堂](https://commons.wikimedia.org/wiki/File:Summer_Palace,_Beijing_(4692019546).jpg)、[雍和宫](https://commons.wikimedia.org/wiki/File:Lascar_Lama_Temple_(4478015544).jpg)；五开间歇山、灰筒板瓦、鸱吻 / 短脊兽、斗拱、红柱彩画、石台基。
- ✅ 砖塔（1候选）：[慈寿寺塔](https://commons.wikimedia.org/wiki/File:Cishou_Temple_Pagoda.JPG)、[1923–24塔影](https://commons.wikimedia.org/wiki/File:Pagoda_on_way_to_Summer_Palace,_probably_marble,_by_Harold_Stephen_Bucklin,_c._1923-1924,_from_the_Digital_Commonwealth_-_commonwealth_g445g666m.jpg)；八角砖身、十三层密檐、盲券砖雕、塔刹。
- ✅ 守舍 / 仓屋（1/1候选）：[前门城墙](https://commons.wikimedia.org/wiki/File:Thomas_Child_-_Gate_tower_of_Qianmen_and_city_walls,_Peking_NA01-65.jpg)、[北京城门](https://commons.wikimedia.org/wiki/File:Front_Gate,_City_Wall,_Peking,_China_(4822093666).jpg)与北京胡同 / 街景；灰瓦硬山、灰砖石基、通风孔、厚板门、守具。
- ✅ 河埠（1候选）：[通州运河旧照](https://commons.wikimedia.org/wiki/File:On_the_grand_canal_between_Tong-chow_and_Peking_LCCN2004707951.jpg)、[1817通州锚地](https://commons.wikimedia.org/wiki/File:Anchorage_at_Tong-Chow_1817_p138.jpg)；石岸踏步、系泊柱、绳圈、无水面。⚠️ 第一图低分辨率，已由第二图补足语境。
- ✅ 城门 / 直墙 / 外角（1/1/1/2候选）：前门、北京城门及[北京城墙顶](https://commons.wikimedia.org/wiki/File:Felice_Beato_(British,_born_Italy_-_Top_of_the_Wall_of_Peking_-_Google_Art_Project.jpg)；灰砖城台、拱券、双层重檐门楼、平顶错缝墙、石基；外角选第2候选以匹配3米墙高。
- ✅ 石桥（1候选）：[万宁桥西北视图](https://commons.wikimedia.org/wiki/File:Wanning_Bridge_from_the_northwest_(20211008150357).jpg)、[万宁桥](https://commons.wikimedia.org/wiki/File:Wanning_Bridge_1.jpg)；低单拱、券石、栏板、方望柱、磨旧铺面，拱孔透明。
- ✅ 国槐 / 油松（1/1候选）：[国槐](https://commons.wikimedia.org/wiki/File:Sophora_japonica_JPG2Aa.jpg)、[景山古槐](https://commons.wikimedia.org/wiki/File:Jingshan_-_Styphnolobium_japonicum.jpg)、[八达岭油松](https://commons.wikimedia.org/wiki/File:Pinus_tabuliformis_Badaling.jpg)、[油松](https://commons.wikimedia.org/wiki/File:CekCung.jpg)；羽状复叶疏冠 / 板裂干与横展针叶层枝，均无土岛。
- ✅ 全部参考下载成功并用 `view_image(original)` 查看；无“整类下不到图”。逐图最终联系表亦已查看。
- ✅ `check_assets`：建筑19条0问题；贴片7条0问题。`check_ids.py --strict`：退出0，新增严格错误0（仓库基线仍有已知 `sk_babuganchan` 未定义）。
- ⚠️ 需作者确认：官式色彩、匿名十三层密檐砖塔取向，以及上述（待实测）装配项；默认保持当前候选。

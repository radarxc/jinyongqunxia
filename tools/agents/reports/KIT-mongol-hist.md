# KIT-mongol-hist 报告 · 建筑套件 · 蒙古 · 草原套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

- 已对 19 张建筑、7 张墙门 / 环境贴片逐项真实传入 2–3 张历史图片重出，同 ID 覆盖；37 次成功生成调用，26 张入选。
- 11 类各生成 2 候选、15 类各 1 候选；入选原图及第二候选链均归档，manifest 登记实发 prompt、输入路径 / URL / SHA、候选数和历史细节。
- 成品保持原 ID、类型、占地、画布、锚点与 candidate；仅清低 alpha 光晕、归一 alpha、裁框、一次等比 LANCZOS 和透明补边。
- 26 张经棋盘 / 黑 / 白底目视复核；三项指定检查结果见 §7。底面几何、门孔、接缝、碰撞、四向与整城装配仍待实测。

## 2. 产出（文件、行数、主要章节）

| 文件 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| assets/default/building-map/mongol/ | 19 成品 + 23 本轮候选归档；manifest 698 行 | 建筑新图、真实生成链、参考与历史细节 |
| assets/default/tile/mongol/ | 7 成品 + 14 本轮候选归档；manifest 237 行 | 门、墙、桥、植物新图及真实生成链 |
| assets/default/prompts/building-map.md / tile.md | 981 / 629 行 | 蒙古节实际历史图输入流程与细节要点 |
| 本报告 | 63 行 | 产出、边界、逐类来源 / 细节 / 候选数与检查 |

## 3. 关键结论与数值

- 26 / 26 成品均为 RGBA，alpha 极值 (0,255)；画布沿用旧版，建筑短边 304–832 px，贴片短边 57–653 px。
- 11 个候选作为编辑链输入，26 个初始候选都输入 3 张历史图；11 次重试均输入候选1 + 2 张历史图，因此每类始终有 2–3 张历史图片真实参与。
- 透明处理阈值：建筑 / 硬质贴片 alpha <16→0，草与灌木 <8→0，>=248→255；预乘 alpha 等比缩放，不拉伸、warp、镜像或补画。
- 历史细节按毡帐、土木街屋、院落礼制建筑、白塔、防务木栅、木桥和旱地植物分别约束；晚期照片 / 现代桥只作形制类比。

## 4. 开放问题（附默认值）

- 草原总体美术、汉式宫室与白塔取舍：默认保留匿名蒙汉混合地域意象和 candidate，待作者审图。
- 既有建议占地、单视图可用性：默认维持原登记；不把生成图外观当测绘尺寸，四向与整城落位待实测。
- k4 / k6 像素净孔、墙角 / 桥头接缝、碰撞和遮挡：默认以逻辑掩膜为准，本轮不修改工具或上游规则。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务只替换候选美术与生成记录，不修改 Canon、玩法、ID 或上游数值。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- design/22 §3.4、§4.1–§4.3：后续登记 mongol 素材族、非元骨架映射与建议占地；不得自动投放全部元代城市。
- town/schema.yaml 素材接口 / 后续总装：按逻辑掩膜处理门孔并复测锚点、墙桥接缝、碰撞与遮挡，不能以 PNG 画布二次定标。

## 7. 自检（逐条对照本任务的验收标准）

以下图片均于 2026-10-01 下载、目视查看并作为实际 image_gen 输入；逐文件名、SHA、完整 prompt 与尝试链见 manifest。

- ✅ house_small（2取1）、house_large / courtyard（各1）：[库伦聚落](https://commons.wikimedia.org/wiki/File:1913_in_Khuree.jpg)、[库伦街景](https://commons.wikimedia.org/wiki/File:1913_a_street_in_Khuree.jpg)、[和林模型](https://commons.wikimedia.org/wiki/File:Model_of_Karakorum_city%3B_Karakorum_Museum%2C_Mongolia_(4).jpg)；取低矮帐群 / 围护；柳条折壁、辐射椽、烟圈、毡缝、绳带、低门。
- ✅ shop / shop_two_storey（各1）：库伦街景、[Karakorum Modell 1](https://commons.wikimedia.org/wiki/File:Karakorum_Modell_1.jpg)、和林模型；街屋体量；斧斫柱、榫销斜撑、土坯填墙、板窗竖棂、手工灰瓦、外木梯。
- ✅ inn / tavern（各1）：库伦街景 / 聚落、Karakorum Modell 1；tavern 另用[忽必烈出猎图](https://commons.wikimedia.org/wiki/File:KhubilaiOnTheHunt.jpg)；石础、榫梁、简斗拱、油布木棂、灰瓦与时代食具。
- ✅ market / stable / biaoju（各1）：库伦照片、忽必烈出猎图、和林模型；叉头杆 / 绳扎毡篷、木鞍毡垫、木土货栈与货箱；市场 / 镖局功能为原创扩展。
- ✅ warehouse（2取2）：和林模型、库伦街景；分层夯土、重木架、斜撑、板门闩、小通风孔、手工灰瓦。guardhouse（2取2）：[黄宫门](https://commons.wikimedia.org/wiki/File:1913_The_gate_of_Yellow_Palace_in_Khuree.jpg)、[元上都](https://commons.wikimedia.org/wiki/File:Yuan_Shangdu.jpg)；夯土层理、石脚、方木柱、斜撑、重门、竖棂与灰瓦半歇山。
- ✅ manor / yamen / wangfu（各1）：[Karakorum Modell 2](https://commons.wikimedia.org/wiki/File:Karakorum_Modell_2.jpg)、和林模型、库伦街景 / 黄宫门；多重院落、夯土灰砖脚、柱网、二至三跳简斗拱、灰瓦歇山、克制矿物彩画。
- ✅ casino（1）：库伦街景、Karakorum Modell 1、和林模型；土木三开间、草泥墙、板窗 / 竖棂、无字游戏器具；功能为原创扩展。
- ✅ temple_hall（2取2）：和林模型、黄宫门；候选1继续作为编辑输入；五乘四柱网、低台、石础、两跳短出斗拱、浅举折灰瓦歇山、朴素脊端与矿物彩画。
- ✅ stupa（1）：[白塔 A](https://commons.wikimedia.org/wiki/File:Beijing_Baitasi_(2017)_A.jpg)、[B](https://commons.wikimedia.org/wiki/File:Beijing_Baitasi_(2017)_B.jpg)、[C](https://commons.wikimedia.org/wiki/File:Beijing_Baitasi_(2017)_C.jpg)；覆钵、方台、莲瓣、叠轮、华盖与刹顶，不称具名塔等比例复原。
- ✅ wharf（1）：[蒙古木桥](https://commons.wikimedia.org/wiki/File:20080726-0045_Mongolie_pont_bois_02.jpg)、元上都、忽必烈出猎图；干砌石木笼、圆木桩排、缺口横梁、木销斜撑、劈板与麻绳；现代桥仅作类比。
- ✅ city_gate k4/k6、wall、wall_corner（各2取2）：黄宫门、元上都、库伦街景；夯土层理、野石脚、木柱斜撑、简斗拱、灰瓦，及落叶松桩、劈木横杆、皮绳扎结。
- ✅ bridge（2取2）：蒙古木桥、元上都；候选1继续作为编辑输入；粗板、圆木纵梁、三组桩排、缺口横梁、木销交叉撑与单侧绳栏。
- ✅ grass_tuft（2取2）、shrub（2取1）：[Asparagus gobicus](https://commons.wikimedia.org/wiki/File:Asparagus_gobicus.JPG)、元上都、库伦聚落；风弯枯黄灰绿叶、穗头与低矮疏枝，不作古代物种鉴定。
- ✅ 下载失败类型：无。参考图均成功下载和目视检查；无影视 / 游戏截图。26 张均实际使用历史图片输入，没有“仅生成后审校”的条目。
- ✅ 逐张黑 / 白 / 棋盘底检查：真透明、左上光、完整轮廓；未见文字、水印、人物面部、现代物件；门洞和木缝透明。所有新图 SHA 均不同于返修前快照。
- ✅ 指定门禁：建筑 19 图 / 19 条 / 0 问题；贴片 7 图 / 7 条 / 0 问题；ID strict failure count 0。
- ✅ 写集：仅蒙古两套件、两份提示词和本报告；未改 tools/town、其他套件、Canon、TODO 或 decisions。
- ⚠️ 历史断代与几何：具体举折 / 棂格 / 彩画及原创功能组合仍待考；旧 meta 量测不适用于新图，本轮未重测底轴与占地视觉比例，故全部保持 candidate。
- ⚠️ 作者确认：草原总体美术、汉式宫室 / 白塔取舍、建议占地与单视图可用性；默认按现图继续候选阶段。

# KIT-ming_north-hist 报告 · 建筑套件 · 明 · 北方套件 · 按历史图片参考重出（强历史细节）
## 1. 摘要（3–6 行）
已按原 ID 覆盖重出 `ming_north` 19 张建筑与 7 张贴片，保留类型、占地、入口、锚点及画布尺寸。
13 组对象各实看 2 张历史照片 / 古画 / 植物图版；河埠未找到合格历史图片，改据明嘉靖通州土坝文字史料。
成品强化硬山、筒板瓦、砖缝、柱网、门窗、台基、斗拱等级、城砖咬砌和树种细部；均为真 RGBA。
三条指定检查全部通过；静态拼接、门墙接缝、通行孔、遮挡与运行时锚点仍（待实测）。
## 2. 产出（文件、行数、主要章节）
- `assets/default/building-map/ming_north/`：19 张成品、19 张入选源副本；`manifest.yaml` 852 行（提示词、URL、取用细节、SHA、候选数）。
- `assets/default/tile/ming_north/`：7 张成品、7 张入选源副本；`manifest.yaml` 276 行。
- `assets/default/prompts/building-map.md` 674 行：新增 §11.4；`assets/default/prompts/tile.md` 416 行：新增 §10.1。
- 本报告不超过 100 行；工作参考 `refs/` 不入库。
## 3. 关键结论与数值
- 交付 26/26；入选 26；实际生成 29 候选：建筑 21、贴片 8。除 `house_small=3` 外，每项 1–2 候选。
- 19/7 张检查问题均为 0；26 张均 `RGBA`、alpha 极值 `[0,255]`、可见主体距画布边至少 8 px。
- 与旧 manifest 对比：ID、文件名、类型、占地、入口、锚点、画布尺寸零变化；轮廓宽高比变化最大约 5.9%（河埠），低于 30% 改登记阈值。
- 规格化只作 alpha≥8 可见框外扩 4 源 px、一次等比缩放、透明留白与底部对齐；不仿射修形、不重绘像素。
- 普通民居 / 仓 / 市肆不用斗拱；寺殿与王府才用克制斗拱和等级瓦色。所有具名遗存只作构件依据，不声称测绘复原。
## 4. 开放问题（附默认值）
- 运行时接缝、门孔对格、碰撞 / 遮挡、四向与锚点：默认保留 `candidate`、仅供原向静态试贴，待总装实测。
- 寺殿斗拱层级、彩画、王府制度及民居细部断代（待考）：默认匿名“明代北方意象”，不绑定具名建筑。
- 河埠没有合格历史图片：默认按 1528 年通州土坝“木排桩挡土夯筑”文字史料构图，整体标（原创扩展）。
- `house_small` 试验阶段误生成 3 候选：默认接受第 3 张入选；后续任务严格执行每张至多 2 候选。
- 图像接口底层版本、seed、价格和限额未公开：默认只登记回执模型标签，不作未核实声明。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。此次仅替换同 ID 美术候选，不修改基准、玩法、类型、占地或投影契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `design/22` §9.3 / 后续总装验收：实测两种门洞净宽、墙直段 / L 角接缝、桥面落格和植物根锚后登记结果；本任务未越权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 修改仅位于允许写入路径；未改 `tools/town/`、`TODO.md`、基准或其他套件，未执行改变仓库状态的 git 命令。
- ✅ 19 建筑 + 7 贴片同 ID 覆盖；类型 / 占地 / 入口 / 锚点 / 画布逐字段与 HEAD 对比一致。
- ✅ 每组参考均下载并 `view_image`；不使用影视 / 游戏截图，不复制原图构图；URL 与取用细节写入 manifest。
- ✅ 26 张逐图审阅，并在灰底 / 白底核实透明；入选源图归档且 SHA 匹配。
- ✅ `check_assets` 建筑 19 条 0 问题；贴片 7 条 0 问题；`check_ids.py --strict` 通过；`git diff --check` 通过。
- ⚠️ `house_small` 为 3 候选（已如实登记）；河埠没有合格历史图片；全部运行时总装仍（待实测）。
### 7.1 参考来源索引（均访问 2026-09-30；每项后附索引即其 URL）
- R 民居：[Ming courtyard](https://commons.wikimedia.org/wiki/File:Ming_courtyard_(6238830623).jpg) / [平遥院落](https://commons.wikimedia.org/wiki/File:Inside_the_courtyards_of_pingyao.jpg)。
- C 合院：[乔家院航拍](https://commons.wikimedia.org/wiki/File:Aerial_view_of_Qiao_Family_Courtyard.jpg) / [Ming courtyard](https://commons.wikimedia.org/wiki/File:Ming_courtyard_(6238830623).jpg)。
- S 市肆：[南都繁会图局部一](https://commons.wikimedia.org/wiki/File:%E4%BB%87%E8%8B%B1%E3%80%8A%E5%8D%97%E9%83%BD%E7%B9%81%E4%BC%9A%E5%9B%BE%E3%80%8B%E5%B1%80%E9%83%A8.jpg) / [局部二](https://commons.wikimedia.org/wiki/File:%E5%8D%97%E9%83%BD%E7%B9%81%E4%BC%9A%E5%9B%BE%E5%B1%80%E9%83%A8%EF%BC%88%E6%98%8E_%E4%BB%87%E8%8B%B1%EF%BC%89.jpg)。
- O 官署：[霍州署厅 03](https://commons.wikimedia.org/wiki/File:Huozhou_Prefectural_Hall_03_2012-09.JPG) / [04](https://commons.wikimedia.org/wiki/File:Huozhou_Prefectural_Hall_04_2012-09.JPG)。
- T 寺殿：[智化殿一](https://commons.wikimedia.org/wiki/File:%E5%8C%97%E4%BA%AC%E6%99%BA%E5%8C%96%E5%AF%BA%E6%99%BA%E5%8C%96%E6%AE%BF2021_(1).jpg) / [二](https://commons.wikimedia.org/wiki/File:%E5%8C%97%E4%BA%AC%E6%99%BA%E5%8C%96%E5%AF%BA%E6%99%BA%E5%8C%96%E6%AE%BF2021_(2).jpg)。
- P 等级：[明长陵殿](https://commons.wikimedia.org/wiki/File:Beijing_2006_3-64.jpg) / [长陵构件](https://commons.wikimedia.org/wiki/File:Exterior_architectural_detail_at_Changling_tomb,_Beijing.jpg)。
- Q 塔：[慈寿寺塔一](https://commons.wikimedia.org/wiki/File:Ci_Shou_Temple_Pagoda-20240612.jpg) / [二](https://commons.wikimedia.org/wiki/File:Cishou_Temple_Pagoda.JPG)。
- G 仓：[南新仓仓廒](https://commons.wikimedia.org/wiki/File:Former_granaries_at_Nanxincang_(20200814171113).jpg) / [北京南新仓](https://commons.wikimedia.org/wiki/File:%E5%8C%97%E4%BA%AC%E5%8D%97%E6%96%B0%E4%BB%93.jpg)。
- W 墙：[明城墙遗存](https://commons.wikimedia.org/wiki/File:Beijing_Ming_City_Wall_Relics_Park_(20260904130832).jpg) / [东南角楼](https://commons.wikimedia.org/wiki/File:Beijing_Southeast_Corner_Tower_(20210917085427).jpg)。
- E 门：[Gate](https://commons.wikimedia.org/wiki/File:Gate_(6234532518).jpg) / [山海关](https://commons.wikimedia.org/wiki/File:Greatwall-shanhaiguan-2003-10-s.jpg)。
- B 桥：[卢沟桥雕刻](https://commons.wikimedia.org/wiki/File:Lugou-Bridge-east-end-relief-3577.jpg) / [卢沟桥](https://commons.wikimedia.org/wiki/File:Lugou_Bridge_10.jpg)。
- H 槐：[八大处祈福树](https://commons.wikimedia.org/wiki/File:Badachu_Wishing_Tree_(20250427094936).jpg)（只取老树姿态，不据此认定物种）/ [国槐植物图版](https://commons.wikimedia.org/wiki/File:Sophora_japonica_144-8764.jpg)。
- Y 柏：[柏林寺侧柏](https://commons.wikimedia.org/wiki/File:Cypress_tree_in_Bai_Lin_Temple.jpg) / [岱庙汉柏](https://commons.wikimedia.org/wiki/File:Interlocked_Han_Cypress,_Dai_Temple.jpg)。
- D 河埠文字：[北京日报·五闸二坝济漕运](https://peking.bjd.com.cn/content/s643cbf80e4b0017157a4cca5.html)；取木排桩挡土夯筑，未找到合格历史图片。
### 7.2 逐类取用、历史细节清单与候选数
- `house_small` R：三开间 / 砖瓦门窗；硬山、筒板瓦、4柱、中央板门、双格窗、石脚；3选3 ⚠️。
- `house_large` R：北方住宅材料；五开间、6柱、中央板门、四格窗、灰砖石脚；1选1。
- `courtyard` C：院落轴线 / 屋组；正房两厢、院门影壁、灰砖围墙、石铺院；1选1。
- `biaoju` C：合院组织 / 货院材料；木栅门、后厅、短货棚、箱包与石院；1选1。
- `casino` S：敞铺与深檐；三开间、硬山筒板瓦、板门、朴木桌；1选1。
- `inn` S：连续铺面 / 楼层；二层客舍、直栏浅廊、侧翼小院、防火山墙；1选1。
- `manor` C：多进院层级；轴门影壁、五间正厅、厢房、台基与围墙；1选1。
- `market_stall` S：市集棚架；四柱榫接、素布篷、板柜、簸箕竹筐；1选1。
- `restaurant` S：酒楼铺面；二层五间、折叠格扇、直栏浅廊、硬山灰瓦；1选1。
- `shop_1f` S：临街开敞铺；五间、可卸板门、格扇、深檐与灰砖硬山；1选1。
- `shop_2f` S：两层市肆；下铺三间、上层格窗浅廊、防火山墙；1选1。
- `guardhouse` R：民居尺度 / 材料；三开间、板门、双格窗、齐山墙、无斗拱；1选1。
- `stable` C：低翼房尺度；五间低棚、三敞厩、半高栏、土砖填墙、石前场；1选1。
- `temple_hall` T：殿堂柱网 / 屋面；五开间、黑灰歇山、朱木、克制斗拱、格扇石台；1选1。
- `wangfu` P：等级柱网 / 台基；轴院五间殿、深绿主瓦、灰瓦配房、朱木石台；1选1。
- `pagoda` Q：八角砖塔；仿木密檐、券龛、砖雕带、金属刹；1选1。
- `warehouse` G：仓廒形制；厚砖墙、双板门、高气孔、防潮石脚、宽硬山顶；1选1。
- `wharf` D：无图片；木排桩、夯土石铺面、花岗岩踏步、系缆柱；1选1，原创扩展。
- `yamen` O：厅堂 / 深廊；轴门、五间大堂、柱网、灰瓦石台、两侧公房；1选1。
- `city_gate k4` E：砖台券洞 / 门楼；4格透孔、浅券、朱木槅窗、筒板瓦；1选1。
- `city_gate k6` E：砖台券洞 / 长门楼；6格透孔、浅券、朱木槅窗、筒板瓦；1选1。
- `wall brick` W：城砖表皮；大青砖错缝、细灰缝、窑色变化、平顶；1选1。
- `wall_corner` W：墙体转折；包角咬砌、细灰缝、平顶 L 角与空心缺口；1选1。
- `bridge_deck` B：条石 / 凿痕；横铺花岗岩、细缝、磨损、浅侧边，无栏无拱；1选1。
- `tree guohuai` H：树姿 / 植物学叶型；低分叉、圆展冠、裂皮、羽状复叶与根颈；2选2。
- `tree cebai` Y：古柏树姿；红灰裂皮、直立层叠冠、扁平鳞叶小枝与根颈；1选1。
- 下不到图：仅 `wharf`；需作者确认：接受文字复原、`house_small` 三候选偏差、全部 candidate 与待实测默认值。

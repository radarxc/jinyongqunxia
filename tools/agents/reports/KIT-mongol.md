# KIT-mongol 报告 · 建筑套件 · 蒙古 · 草原套件

## 1. 摘要（3–6 行）

完成19张建筑、7张贴片，全部真RGBA、`candidate`，仅原向静态视图；26件成品及本轮下载的历史/考古参考均经`view_image`检查。
本轮只重出审核点名的k4/k6城门，各2候选取第2；其余24张成品逐字节不动。两门真RGBA，外底轴率与宽深比均进入审核阈值。
三项指定检查全部退出0；尺寸、透明边、锚点、SHA、manifest字段与输入溯源另行核验通过。
本批仍为candidate：k4视觉净孔约3.556格（逻辑4格），四向、接缝和整城装配待实测，不冒充release资产。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 数量 | 内容 |
|---|---:|---|
| `assets/default/building-map/mongol/` | 19成品PNG | 19条building、逐图meta及归档；每条登记历史图URL、用途与真实使用阶段 |
| 同目录 `README.md` / `preview.html` / `qa-summary.json` | 38 / 31 / 1行 | 更新几何结论、26件预览尺寸、逐件像素与返修摘要 |
| `assets/default/tile/mongol/` | 7成品PNG | 仅两门重出/重登记；补第3轮候选与几何量测；README同步 |
| `assets/default/prompts/building-map.md` / `tile.md` | §11 / §10 | 登记地域差异、史料边界及“生成后审校≠生成输入”口径 |
| `tools/agents/reports/KIT-mongol.md` | ≤100行 | 七节交接、自检清单与第3轮返修结果 |
## 3. 关键结论与数值

- 基础格64×32；w×h底面目标包围框=`32(w+h)×16(w+h)`。守舍6×5→352×176，实际测得约352.03×154.35；目标和实测已分开标注。仅crop/等比LANCZOS/pad，无warp。
- 锚点按可见底角L/R中点，经实际裁框、缩放和padding换算；未用PNG底中代替。非共线底边及隐藏后角仍属估计，全部保持非发布状态。
- 两门外占地8×4/10×4。k4轴率+0.4614/-0.6148、宽深比2.0444、误差2.22%；k6为+0.5095/-0.4673、2.4642、误差1.43%。按审核0.40–0.62与≤30%口径均通过。
- 前孔占长边0.4444/0.5942（目标0.5/0.6），折算3.556/5.942格；k4偏窄0.444格，碰撞与通行仍严格采用4×4逻辑掩膜。
- 建筑辅助量测：轴率通过9/19、比例通过15/19、同时通过6/19；小毡帐边拟合轴率0.4683仍超限。其余13件至少一项告警，最大比例误差守舍17.90%。TODO§8明确image_gen用目视一致、精确投影靠TOWN管线，故这是发布阻断项而非candidate登记失败。
- `mongol`仅本任务资产套件标签；5类复用元骨架，其余复用宋功能包络【建议值】。未改city/poi/biz/port等玩法ID。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 草原风格、匿名佛塔与汉式宫室是否采用 | 全部candidate，按本批原创地域意象交作者审图；不冒称具名遗址复原 |
| 轴率、比例、净宽和接缝 | 外底硬阈值已过；k4视觉孔残差与两门接缝仍待总装。不拉伸/warp/改占地，保持candidate，通行按逻辑掩膜 |
| 四向、真实高度、桥栏分层与碰撞 | 仅原向；无GLB。门孔掩膜仅逻辑契约，整城装配/遮挡待实测；河埠不启用港口服务 |
| 非元骨架类型与植物种 | 占地沿用表中宋功能建议；草丛/灌木为通用草原意象，确切古代分布和栽植待考 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增：未调整玩法规则、数值或书界年代。地域素材接口建议交归属文档收口，不修改Canon。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容（本次未修改） |
|---|---|
| `design/22` §3.4、§4.1–§4.3 | 登记mongol地域资产族及非元骨架功能映射/建议占地；不得自动套入所有元代城市 |
| `town/schema.yaml`素材接口 / 后续总装 | 消费building底面像素anchor和tile人工锚点；只原向，禁止按PNG宽再次定标；门孔/墙桥接缝另验收 |
| `design/22` §7.4 / 渲染交接 | 左上光、右下短影遵本任务；candidate与发布级几何告警不得被文件检查通过覆盖 |

## 7. 自检（逐条对照本任务的验收标准）

下表兼作完整清单与地域替换对应表；占地为逻辑格，PNG尺寸是含透明边的实际像素。建筑完整type与ID相同。

| ID | 原功能→地域类型 | 占地 | 尺寸 |
|---|---|---:|---:|
| `bld_kit_mongol_house_small` | 小民居→单毡帐 | 7×6 | 512x512 |
| `bld_kit_mongol_house_large` | 大民居→家庭双帐 | 10×8 | 617x512 |
| `bld_kit_mongol_courtyard` | 院落→木栅帐院 | 10×8 | 620x512 |
| `bld_kit_mongol_shop` | 单层铺→木铺毡檐 | 6×5 | 512x512 |
| `bld_kit_mongol_shop_two_storey` | 两层铺→瓦顶木商楼 | 8×6 | 512x512 |
| `bld_kit_mongol_inn` | 客栈→商旅帐院 | 10×8 | 647x512 |
| `bld_kit_mongol_tavern` | 酒楼/茶肆→饮食帐馆 | 10×8 | 612x512 |
| `bld_kit_mongol_market` | 市场棚→毛毡铺棚 | 5×4 | 512x512 |
| `bld_kit_mongol_yamen` | 官署→木厅与帐院 | 16×12 | 960x640 |
| `bld_kit_mongol_biaoju` | 镖局→商队护运货栈 | 14×11 | 864x544 |
| `bld_kit_mongol_casino` | 赌场→娱乐大帐 | 9×7 | 608x512 |
| `bld_kit_mongol_manor` | 山庄→贵族帐院 | 16×13 | 1056x704 |
| `bld_kit_mongol_wangfu` | 王府/宫殿→汉式宫室 | 20×16 | 1248x832 |
| `bld_kit_mongol_temple_hall` | 寺观→匿名佛寺 | 13×10 | 832x656 |
| `bld_kit_mongol_stupa` | 宗教地标→佛塔 | 7×7 | 528x512 |
| `bld_kit_mongol_guardhouse` | 守舍→木骨毡顶小屋 | 6×5 | 432x304 |
| `bld_kit_mongol_stable` | 马厩→木构毡棚 | 8×6 | 592x496 |
| `bld_kit_mongol_warehouse` | 仓屋→木板货仓 | 9×7 | 688x544 |
| `bld_kit_mongol_wharf` | 河埠→木卸货台 | 8×4 | 560x560 |
| `tex_town_mongol_city_gate__k4_r000_v01` | 城门→木土营门（逻辑净宽4） | 8×4 | 652x591 |
| `tex_town_mongol_city_gate__k6_r000_v01` | 城门→木土营门（净宽6） | 10×4 | 652x653 |
| `tex_town_mongol_wall__timber_r000_v01` | 城墙→木栅直段 | 1×1 | 155x108 |
| `tex_town_mongol_wall_corner__outer_ne_v01` | 墙角→木栅转角 | 1×1 | 95x69 |
| `tex_town_mongol_bridge__w3_l5_r000_v01` | 桥→带栏木桥 | 3×5 | 266x181 |
| `tex_town_mongol_grass_tuft__steppe_v01` | 植物→禾草丛 | 1×1 | 84x57 |
| `tex_town_mongol_shrub__steppe_v01` | 植物→旱生灌木 | 1×1 | 80x57 |

来源清单 / 参考资料（文字页2026-09-30访问；历史图片2026-10-01下载并`view_image`，仅作生成后审校，未作为既有成品的image_gen输入；逐件映射在manifest）：
- [UNESCO · Mongol Ger传统工艺](https://ich.unesco.org/en/RL/traditional-craftsmanship-of-the-mongol-ger-and-its-associated-customs-00872)：木架、白毡、绳索与可拆圆帐；现代工艺记录不直接证明元代全部细部。
- [UNESCO · Site of Xanadu](https://whc.unesco.org/en/list/1389/)：汉式宫殿/寺院与游牧营地并存、草原河流环境；不据此复原木栅城门。
- [DAI · Great Hall保护研究](https://www.dainst.org/forschung/projekte/noslug/4924)、[研究专著摘要](https://publications.dainst.org/books/dai/catalog/book/2052)：13世纪和林大殿为佛寺；中国式瓦件/屋顶技术与藏式布局影响；未读专著全文。
- [UNESCO/ICOMOS · 2012评估文件](https://whc.unesco.org/document/152541)：宫城考古材料与营地文字概述，仅用于civic组形制背景，未图像测绘配准。
- [Rubin Museum · White Stupa, Attributed to Anige](https://rubinmuseum.org/projecthimalayanart/essays/white-stupa-attributed-to-nepalese-artist-anige/)：1279元代覆白覆钵、分层基座与叠轮母题；本件不复制51m具名白塔。
- [元上都遗址](https://www.sjycysdyz.org.cn/)：明德门青砖墙体、木门柱基与瓮城遗存；只限定土/砖/木材质语汇，不复制门宽、券顶或瓮城。
- [Khüree 1913](https://commons.wikimedia.org/wiki/File:1913_in_Khuree.jpg)、[和林模型1](https://commons.wikimedia.org/wiki/File:Karakorum_Modell_1.jpg)、[模型2](https://commons.wikimedia.org/wiki/File:Karakorum_Modell_2.jpg)、[博物馆模型院落](https://commons.wikimedia.org/wiki/File:Model_of_Karakorum_city%3B_Karakorum_Museum%2C_Mongolia_(4).jpg)：审校帐群/低屋密度、灰顶街屋与院墙厅堂；1913仅为后世比较，模型不作定尺。
- [DAI和林大殿](https://www.dainst.org/en/research/projects/noslug/4924)、[妙应寺白塔照片](https://commons.wikimedia.org/wiki/File:Beijing_Baitasi_(2017)_A.jpg)：审校台基柱网/汉式瓦顶与覆钵、基座、刹部轮廓；不复制具名建筑。
- [元上都遗址照片](https://commons.wikimedia.org/wiki/File:Yuan_Shangdu.jpg)、[现代蒙古木桥](https://commons.wikimedia.org/wiki/File:20080726-0045_Mongolie_pont_bois_02.jpg)、[Asparagus gobicus](https://commons.wikimedia.org/wiki/File:Asparagus_gobicus.JPG)：审校土墙环境、木板梁栏与低矮分枝；不证明营门/中世纪桥式或古代物种。
- [Pillow · Image module](https://pillow.readthedocs.io/en/stable/reference/Image.html)：核对RGBA/crop/resize/LANCZOS接口；本机实测Python3.11.0、Pillow12.1.1、PyYAML6.0.3。未引入价格/配额/浏览器兼容结论；图像后端版本与effort未披露，不编造。

- ✅ 本轮建筑检查：`python3 tools/agents/check_assets.py assets/default/building-map/mongol --min 18 --max 22 --min-side 256`，19图/0问题/退出0。
- ✅ 本轮贴片检查：`python3 tools/agents/check_assets.py assets/default/tile/mongol --min 5 --max 10 --min-side 32`，7图/0问题/退出0。
- ✅ 本轮ID检查：`python3 tools/lint/check_ids.py --strict`，退出0；既有白名单sk_babuganchan未定义1项，新失败0，不越权改文档。
- ✅ 19+7条manifest均有历史图片URL、用途、访问日和“生成后形制审校；未作为image_gen输入”；下载件已逐张查看。两门4候选及2成品亦原尺寸检查；其余24张成品未改。
- ⚠️ 与宋画风一致性自评：低饱和写实、木石纹理与细节密度接近，毡木地域差异明确；市场/官署写实密度稍高，生成投影和轮廓比有残差，不认定全面风格/几何准出。
- ⚠️ 原著《射雕英雄传》《神雕侠侣》营地细节未逐字核对；具体屋顶、门窗、彩画、佛塔与植物均原创意象/待考，未编引文、回目或历史尺寸。
- ✅ 仓库改动仅在授权路径；宋/其他基线、tools/town、策划文档及TODO未改；本轮补manifest历史图登记、两份授权模板与报告，未改PNG；无改变仓库状态的git命令。作者确认事项及默认值见第4节。

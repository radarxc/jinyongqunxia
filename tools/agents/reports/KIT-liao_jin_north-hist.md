# KIT-liao_jin_north-hist 报告 · 建筑套件 · 辽 · 金北方套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

- 已按同 ID 重出19张建筑、7张贴片；ID、类型、占地与入口登记均未改，全部保持 `candidate`。
- 每件实际输入2张已下载并目视的历史图片，以及上一版同 ID 图作镜头 / 占地控制；共29个真实候选，逐图最多2个。
- 成品均为真RGBA、左上光、透明边；按上一版显著alpha包络宽度等比规格化并映射锚点，避免墙件尺度漂移。
- 历史细节覆盖屋面举折、瓦作、脊饰、斗栱、柱网台基、棂格、残彩、夯土层理与地域材料；不宣称具名复原。

## 2. 产出（文件、行数、主要章节）

| 产出 | 内容 |
|---|---|
| `building-map/liao_jin_north/` | 19张成品＋19张 `sources/historical-detail/` 生成原图；manifest逐项记录提示、2图URL / SHA / 取用细节、成品 / 原图SHA、候选和锚点 |
| `tile/liao_jin_north/` | 7张成品＋7张 `source/historical-detail/` 生成原图；同上，并保留两城门静态逻辑门洞契约 |
| `prompts/building-map.md`、`prompts/tile.md` | 辽金历史细节矩阵改为本轮真实完成记录，补规格化、锚点与待实测边界 |
| 本报告 | 来源、逐类细节、候选数、开放问题与校验回执；≤100行 |

## 3. 关键结论与数值

- 资产为19＋7＝26件；候选为23×1＋3×2＝29。二候选：`house_small`选c1、`city_gate__k4`选c2、`wall__earth`选c2。
- 每件2张历史图＋1张旧同 ID 控制图；历史图共28个本地文件，全部下载成功并目视，无影视 / 游戏截图。
- 规格化：源图取 `alpha>=8` 包络；目标宽度＝旧同 ID 的 `alpha>=8` 包络宽度；高度按同一比例；成品占画布≤83%，建筑短边≥256、贴片≥32。
- 锚点换算：`rel=(old_anchor-old_bbox.xy)/old_bbox.wh`，`new_anchor=offset+rel×resized.wh`；26张边框alpha最大值均0，alpha范围均0–255。
- 画面占地登记未改；文件门禁不验证2:1轴线、墙缝、通行掩膜或遮挡，故这些不被“检查通过”替代。

## 4. 开放问题（附默认值）

- 城门逐格通行掩膜、墙直段 / 外角端面接缝、桥栏遮挡与岸面高差仍 **（待实测）**；默认只作为固定朝向候选，不声明无缝总装。
- 普通辽金民居、商铺棂格、原始彩画及匿名功能组合仍 **（待考）**；默认使用本批克制历史意象，不宣称考古复原。
- `casino`、护运货栈、匿名木桥等为 **（原创扩展）**；默认保留功能映射且不加招牌 / 符号。
- 作者需确认建筑朴素度、城门 / 殿堂装饰浓度、植物风格和密檐砖塔选择；默认全部保持 `candidate`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务不改变玩法、ID、占地、类型、入口或全局公式。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 后续 `tools/town/` 总装：测城门通行掩膜、直墙 / 外角接口、桥栏遮挡与底面轴率；本任务按权限未改。
- 后续作者审批清单：登记本批26项形制 / 装饰 / 植物选择；审批前不得把 `candidate` 改为 `approved`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：仅改授权目录、两份提示词与本报告；未改ID、类型、占地、工具或其他套件。
- ✅ 生成 / 筛选：26件全部重出；每件1–2候选，原图和最终透明棋盘接触表均目视；下不到图的类型：无。
- ✅ 共同细节：正交45° / 30°、2:1意图、左上光、右下短接触影、清楚底边、真RGBA；禁人物、字、现代物、影视 / 游戏图。
- ✅ 参考组URL（均访问2026-10-01）：民间[清明局部](https://commons.wikimedia.org/wiki/File:Along_the_River_During_the_Qingming_Festival_(detail_of_original).jpg)、[分段1](https://commons.wikimedia.org/wiki/File:Along_the_River_During_the_Qingming_Festival_Section_1.jpg)、[分段4](https://commons.wikimedia.org/wiki/File:Along_the_River_During_the_Qingming_Festival_Section_4.jpg)；辽殿[奉国寺](https://commons.wikimedia.org/wiki/File:Fengguo_Temple_1.JPG)、[斗栱](https://commons.wikimedia.org/wiki/File:义县奉国寺大殿斗拱（辽代原构）.JPG)；独乐寺[山门](https://commons.wikimedia.org/wiki/File:The_Shan_Gate_of_Dule_Temple.JPG)、[观音阁](https://commons.wikimedia.org/wiki/File:独乐寺辽代观音阁正面.jpg)；金殿[善化寺](https://commons.wikimedia.org/wiki/File:Shanhua_Temple_1.jpg)。
- ✅ 参考组URL（续）：佛塔[天宁寺塔](https://commons.wikimedia.org/wiki/File:Tianning_Temple_Pagoda.jpg)、[佛宫寺塔](https://commons.wikimedia.org/wiki/File:Fogong_Pagoda_1.jpg)；城墙[辽上京大顺门](https://commons.wikimedia.org/wiki/File:Liao_Shangjing_2017_Dashun_Gate_rammed_earth_A.jpg)、[北墙剖面](https://commons.wikimedia.org/wiki/File:Liao_Shangjing_2017_north_wall_cutting_west.jpg)、[金庆州墙](https://commons.wikimedia.org/wiki/File:Jin_earth_wall_at_Qingzhou_1.jpg)；桥[卢沟桥1877](https://commons.wikimedia.org/wiki/File:Thomas_Child_-_Marco_Polo_Bridge_(Lugou_Qiao)%2C_Peking%2C_1877_NA01-75.jpg)；植物[榆1](https://commons.wikimedia.org/wiki/File:Ulmus_pumila_(2).JPG)、[榆2](https://commons.wikimedia.org/wiki/File:Ulmus_pumila_2.JPG)、[松1](https://commons.wikimedia.org/wiki/File:Pinus_tabuliformis_Badaling.jpg)、[松2](https://commons.wikimedia.org/wiki/File:Pinus_tabuliformis-IMG_20190518_073355.jpg)。
- 逐类来源 / 细节 / 候选（每件另有上一版同 ID 作镜头 / 占地输入）：

| 类别 | 2张历史参考 | 取用细节与历史细节清单 | 候选 |
|---|---|---|---:|
| `house_small` | 清明局部＋辽上京大顺门 | 三间硬山、浅举折灰瓦、素木柱、土抹墙石脚、板门直棂 | 2选c1 |
| `house_large` | 清明局部＋独乐寺山门 | 五间低缓硬山、筒板灰瓦、整齐柱网、简托木、土墙石础 | 1 |
| `courtyard` | 清明局部＋奉国寺 | 正房 / 低厢 / 门屋高差、灰瓦、土围墙石脚、无高级铺作 | 1 |
| `shop_1f` | 清明局部＋分段1 | 三间开铺、支棚 / 柜台、硬山灰瓦、板壁直棂、无牌字 | 1 |
| `shop_2f` | 清明局部＋独乐寺观音阁 | 两层平座、浅举折、疏朗挑栱、木网格、素土填墙 | 1 |
| `inn` | 清明局部＋独乐寺观音阁 | 一院两层主楼 / 低翼、灰瓦深檐、平座走廊、直棂 | 1 |
| `restaurant` | 清明分段4＋独乐寺观音阁 | 两层开敞厅、歇山灰瓦、卷尾鸱吻、两段出跳、低饱和赭木 | 1 |
| `market_stall` | 清明局部＋分段1 | 麻布单坡棚、榫接粗木、木案 / 筐 / 包，无瓦脊斗栱 | 1 |
| `yamen` | 奉国寺＋奉国寺斗栱 | 五间歇山正厅、粗大多层长出跳、厚柱石础、残矿物色 | 1 |
| `biaoju` | 清明分段1＋辽上京大顺门 | 匿名护运货院、硬山仓厅、夯土层 / 石脚、宽板门、货包手车 | 1 |
| `casino` | 清明局部＋独乐寺观音阁 | 匿名两层集会厅、低缓歇山、短平座、素直棂，无赌具招牌 | 1 |
| `manor` | 奉国寺＋清明分段4 | 五间正厅 / 低厢 / 门院、灰瓦鸱吻、两段托栱、夯土围墙 | 1 |
| `wangfu` | 奉国寺＋善化寺 | 五间大殿 / 侧殿 / 门院、厚灰瓦、大鸱吻 / 3小兽、粗大铺作、石台基 | 1 |
| `temple_hall` | 奉国寺＋奉国寺斗栱 | 五间宽殿、低缓庑殿、长出跳多层铺作、厚柱石础、残彩 | 1 |
| `pagoda` | 天宁寺塔＋佛宫寺塔 | 八角密檐砖塔、十三短檐、逐层收分 / 砖雕；木塔只作反例边界 | 1 |
| `guardhouse` | 独乐寺山门＋辽上京大顺门 | 三间硬山、简托木、粗松柱 / 土墙石脚、宽敞口、无武器陈设 | 1 |
| `stable` | 清明分段1＋辽上京大顺门 | 长硬山、粗梁土后墙、宽门 / 木栏 / 槽，无高级斗栱 | 1 |
| `warehouse` | 清明分段1＋辽上京大顺门 | 大进深硬山、重木梁、分层夯土墙 / 石砖脚、宽板门 | 1 |
| `wharf` | 清明分段4＋卢沟桥1877 | 长低粗石岸 / 踏步、木桩横梁 / 低栏；只取桥身比例，不复制石拱 | 1 |
| `city_gate__k4` | 独乐寺山门＋辽上京大顺门 | 2实 / 4空 / 2实、贯通透明孔、夯土墩石脚、灰瓦门楼 / 铺作 | 2选c2 |
| `city_gate__k6` | 独乐寺山门＋辽上京大顺门 | 2实 / 6空 / 2实、贯通透明孔、夯土墩、卷尾鸱吻 / 少量脊兽 | 1 |
| `wall__earth` | 辽上京大顺门＋北墙剖面 | 长低连续段、平顶收分、水平夯层 / 风蚀 / 草梗 / 石脚、净端面 | 2选c2 |
| `wall_corner__outer_ne` | 辽上京北墙剖面＋金庆州墙 | 等高L外角、连续夯层、平冠 / 风蚀 / 石脚，无雉堞塔楼 | 1 |
| `bridge_deck__w3_l5` | 卢沟桥1877＋清明分段4 | 只取长低 / 低栏尺度；原创木梁、横板 / 纵梁 / 榫卯、开放短端 | 1 |
| `tree_cluster__elm` | 榆树图1＋图2 | 灰褐裂皮、曲干、小叶、疏透不规则冠、紧凑根点 | 1 |
| `tree_cluster__pine` | 油松图1＋图2 | 板裂树皮、横展轮生枝、不规则伞冠 / 束针、非圣诞树 | 1 |
- ⚠️ 总装边界：两城门孔透明和墙件形制已目视，但逐格掩膜、墙端接缝、桥栏遮挡仍待运行时实测；不将目录门禁写成精确几何通过。
- ✅ 指定检查实测：建筑19图 / 19条 / 0问题；贴片7图 / 7条 / 0问题；严格ID检查新增失败0（仅报告既有基线 `sk_babuganchan`）。另做26条manifest / 归档 / SHA / URL / 锚点一致性检查及 `git diff --check`。

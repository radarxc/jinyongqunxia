# 大地图整张水墨底图 · 确定性合成器（AR-111）

把内容网格全幅（`CanvasProjection(512, 384, 18)` 的整体放大 `CanvasProjection(W, H, 18·W/512)`）直接画成一张 4:3 水墨山水底图。海陆、湖泊、河流和山势全部来自 GIS，笔墨全部取自仓库里已有的水墨贴图，不调用任何 AI 出图；同一输入、同一种子逐字节同一输出。

## 命令

```bash
python3 tools/map/paint/compose_world.py --sample east          # 样区（全图 4096 尺度原样裁出），写 .agents/coord/ART-worldmap-painted/sample/
python3 tools/map/paint/compose_world.py --full --width 2048 --out <png>   # 低清全图草稿
python3 tools/map/paint/compose_world.py --deliver              # 4096 全图：PNG 母版写 .agents/coord/ART-worldmap-painted/full/，WebP q85 底图与 1024×768 预览写 assets/default/map/world/
python3 tools/map/paint/compose_world.py --check                # 输入 sha256、10 个开放节点投影自检（≤1 网格单位）、两次独立构建同窗逐字节一致、锁文件
python3 tools/map/paint/qa.py <底图> --old <旧图>                 # metrics.json、节点与道路叠图、各区 100% 局部、新旧对照（写 .agents/coord/ART-worldmap-painted/qa/）
python3 tools/map/paint/compose_world.py --write-lock <输出…>    # 审过之后记录配置 / 素材 / 输出哈希到 compose.lock.json
python3 tools/map/paint/review_sheet.py sample east             # 样区 vs 现网底图 vs 已审总图对照、100% 局部
```

依赖：numpy、Pillow、scipy、PyYAML（仓库工具已在用）。原始 GIS 数据在 `.agents/coord/geodata/`（不入库，来源与 sha256 见那里的 README），缺失或哈希不符时直接报错退出。

## 输入

- GIS：Natural Earth 10m `land`、`minor_islands`、`lakes`（剔除 `Reservoir` 类与名单内现代水库，保留斋桑泊；咸海、罗布泊用 `lakes_historic` 的历史湖面）、`rivers_lake_centerlines`（scalerank ≤ `rivers.max_scalerank`，湖中心线不画）、`geography_regions_polys`（沙漠 / 盆地 / 草原分区）；ETOPO 2022 60″ 地表高程拼接。
- 素材（只读）：`assets/default/map/kit/` 的山峰 / 山脉 / 雪山 / 丘陵 / 海面 / 平原小景，`assets/default/map/tiles/` 的水面 / 湖面 / 平原 / 草原 / 沙漠 / 高原平铺与海岸 / 湖岸 / 河流笔触条，作者已审 `ref_map_jianghu__ch01_base01.png` 平原里按纸色抠出的树丛印章。实际读到的每个文件与 sha256 记在 `sprites.USED`，写锁时落盘。

## 画法（全部参数在 `config.json`）

1. 纸底 + 平铺填充：陆地按分区权重（平原 / 草原 / 沙漠 / 高原，分区边界加噪声软过渡）混合两张同类平铺，再叠很淡的 DEM 晕渲，≥4300 m 渐次淡雪白；海面 = 水面平铺 + 近岸加深的淡青洗染 + 稀疏海面小景（近岸密、远海疏，低透明）。
2. 岸线 / 湖岸 / 河流（scalerank ≤4 与点名大河——淮河、汉水、松花江、辽河、鸭绿江、塔里木河、伊犁河、红河——用粗条加宽加深，其余到 scalerank 7 用细条；穿过已剔除水库的湖中心线照画）：沿 GIS 折线按最近线段求（沿线距离, 横向距离）贴笔触条（海岸条水侧宽、陆侧窄），水陆侧由 GIS 掩膜判定；最后沿 GIS 岸线压一道 #554c3e 淡墨（粗细随噪声微变）。
3. 山：在 15 km 窗口起伏度（ETOPO）≥ 阈值处做变尺寸泊松盘落点；起伏 / 海拔决定件类（≥4000 m 雪山，起伏 ≥480 m 用山脉 / 山峰，320–480 m 且不在盆地 / 平原底部（高出约 200 km 窗口 10% 分位 ≥220 m）才放很淡的丘陵或小石山）、大小与疏密（高起伏带用大号山脉件，起伏越小越稀），山脊走向（高程结构张量）选山脉件朝向变体；件的尺寸按落点北侧 / 两侧陆地长度收缩并在必要时换成瘦高件，保证落在陆上（日本、朝鲜、台湾、海南、库页岛照高程出山）；避开主河道与湖面；按落脚点 y 从北往南叠画，每件脚下补一团偏纸色的淡雾，谷地再铺一层噪声调制的云雾；山件自带的白雾边改成偏纸色、降不透明度，只有雪山件保留白顶。
4. 平原：已审总图的树丛印章按湿润度零星散布（草原 / 沙漠更稀），另以极低密度摆平原 / 盆地小景作田畴点缀。
5. 山体层整体按 GIS 陆地掩膜裁切，所以画面海陆与 GIS 完全一致（陆地 IoU 按构造为 1）。

## 已知限制

- 小于约 2 px 的岛只有岸线与淡墨，没有山。
- 河流按 Natural Earth 现代河道（黄河下游为今河道，与 design/19 一致）。

# AR-83 大地图拼合生成器

本目录把 `tools/map/terrain/layers/*.json` 的 GIS / DEM 图层、
`assets/default/map/tiles/` 的填充贴片与边界笔触条，以及
`assets/default/map/kit/` 的山峰、小景和标记拼成确定性 PNG。投影严格
沿用 `docs/design/19-world-map.md` §2；当前只交付 `rg_dali_cangshan` 样区。

## 命令

```bash
python3 tools/map/compose/compose_map.py --sample
python3 tools/map/compose/compose_map.py --sample --check
python3 tools/map/compose/compose_map.py --sample --no-jitter --output /tmp/dali.png
python3 tools/map/compose/compose_map.py --sample --river-threshold 6 --output /tmp/dali-r6.png
python3 tools/map/compose/build_relief.py --check
python3 tools/map/compose/build_sample_gis.py --check
python3 -m unittest discover -s tools/map/compose -p 'test_*.py'
```

`--check` 重建默认、有/无扰动和河流阈值 6/9 四个场景，在内存中再
重复默认场景与换种子场景，校验确定性、扰动范围、泊松间距、时代筛选、
经纬度投影与融合约束，最后逐字节比对仓库产物。固定种子与全部数值均在
`config.json`；单图模式可覆盖种子或河流阈值，不会改配置。

样区山势来自已签名的 ETOPO 2022 v1 30″ DEM，经 design/19 §2
Albers 反算生成 384×256 的晕渲/坡级/起伏度三通道图和 16 位米值高程图。
山体不再用分类纹理表达：程序在海拔≥650 m、局部起伏≥52 m 的 DEM
高地做泊松盘采样，按落脚点 y 叠放山峰/山脉/雪山/丘陵贴图；高程与
起伏决定品类、大小和密度。`build_relief.py` 可重建并逐字节核验。

样区水系是协调者交接 `ne.py` / `geo2.py` 读取与筛选逻辑的仓内副本产物：
Natural Earth 10m 海陆/湖泊/河流，加 Wikidata CC0 洱海、滇池、抚仙湖。
`build_sample_gis.py` 从协调区原始数据重建；正常拼合只读入库 JSON。河线
经三轮 Chaikin 平滑，画成淡青白带与圆头细墨双岸。

## 输出契约

- `rg_dali_cangshan.png`：`ch01` 样区成品。
- `*_rivers_compare_r6_r9.png`：同画幅阈值 6 / 9 左右对比。
- `*_jitter_compare_off_on.png`：同画幅无扰动 / 有扰动左右对比。
- `*_vs_approved.png`：仓库已审区域图 / 程序拼合图左右对照。
- `*_markers.json`：`tianshu.map-markers.v1`；每项含 ID、类型、名称、
  `canvas{x,y}`、`wgs84{lon,lat}`、点击半径、可点击、置信度、区域图限定、
  是否单独绘制、同址 ID 与开放书界。位置不参与随机扰动。
- `*_check.json` 与 `manifest.json`：内建门禁结果、输出大小与 sha256。

低置信度 POI 仅以 32% 淡墨在区域图出现，不给点击半径；同址标记并入
主符号而不挪坐标。道路按书界过滤；城市、门派、驿站、码头和 POI 分别
沿用其上游开放字段。全图与 14 个时代切片留待样区获批后的独立任务。

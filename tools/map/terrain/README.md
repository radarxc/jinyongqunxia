# AR-68 地形图层构建器

`build_terrain.py` 把共享 `geodata` 中的 ETOPO 2022 30 arc-second 高程切片与 Natural Earth 10m 海陆、湖泊、河流转换为 `design/19` 默认 4096×3072 画布上的确定性 JSON 图层，并生成全图、大理、关中三张预览。输出坐标左上为原点，x 向右、y 向下，保留两位小数；全图只显示 scalerank≤3 的骨干河，局部图显示配置内全部主要河流。预览只读取序列化后的五份交付 JSON，不读取分类栅格；`--check` 会打印三类地貌的 JSON 回填覆盖率并以 0.95 为门禁。

```bash
python3 tools/map/terrain/build_terrain.py
python3 tools/map/terrain/build_terrain.py --check
python3 -m unittest discover -s tools/map/terrain -p 'test_*.py'
```

配置见 `config.json`。构建器直接载入 `tools/map/render_map.py::CanvasProjection`，Natural Earth 最小读取器移植自 Gemini 数据交接的 `ne.py`；高程局部起伏度沿用 `basemap_sr2.py --rugged` 的“局部标准差”思路，但为满足依赖约束以积分图方窗实现。原始数据不入库；缺失或哈希不符时构建立即失败。

图层统一使用 `tianshu.terrain-layer.v1`：`features[]` 含稳定排序的 `id`、GeoJSON 风格 `geometry` 与 `properties`。`ridges` 是带平均海拔、相对高度、北向走向角且无自交的折线；`hills`、`plateaus`、`basins_plains` 是闭合 Polygon，`coordinates[0]` 为外环、后续环为孔洞；`water` 含陆地边界环、湖面多边形和主要河流折线。`sea_exterior` 的 `topology` 区分 `land_outer` / `land_hole`，消费方应以海色铺底、依次填外环并扣除孔洞；它不是现代国界。DEM 覆盖外像元不参与分类或脊线；湖泊按交接 `geo2.EXCLUDE` 剔除四项现代水库/季节湖。

# TOOL-map-terrain 报告 · 大地图 · 地形数据：公有领域 DEM + Natural Earth 海陆河湖，按 design/19 Albers 投影分山脉脊线 / 丘陵 / 高原 / 盆地平原 / 水域图层，可复跑脚本与预览（AR-68 第 1 步）
## 1. 摘要（3–6 行）
- 已修复 DEM 范围外边缘钳制伪影、多边形丢外环/错填孔洞、8 条脊线自交及历史水域排除遗漏；重建五层、三预览与 manifest。
- `--check` 从落盘 JSON 回填分类，覆盖率 hills 0.983895、plateaus 0.967162、basins_plains 0.977279，均 ≥0.95。
- 10 个单测和指定 `--check` 均通过；三张预览逐张目检，不再有北/西长条伪影。
## 2. 产出（文件、行数、主要章节）
- `build_terrain.py`：输入校验、有效域采样、分类/拓扑/脊线、水域、JSON 回读预览、覆盖率门禁；`ne_reader.py` 移植交接 `ne.py`。
- `config.json`、`README.md`；投影、几何、确定性、水域测试 4 文件共 10 项。
- 图层：ridges 39/18,270 B；hills 246/600,000 B；plateaus 102/184,390 B；basins_plains 278/575,538 B；water 926/1,537,911 B；含 manifest 总计 2,917,569 B。
- 预览由落盘 `ridges/hills/plateaus/basins_plains/water.json` 回读绘制：full 841,573 B、dali 219,508 B、guanzhong 180,250 B，总计 1,241,331 B。
## 3. 关键结论与数值
- DEM：NOAA NCEI ETOPO 2022 v1 surface 30″，73–135°E/18–54°N，文件 `ETOPO_2022_v1_30s_73E135E_18N54N_surface.tif`，128,645,267 B，sha256 `b30076fe4d8400cfbedf247b3c25cdd98782a47a976ceb05af1ee2f0e74dd06f`；CC0 / 美国公有领域（[元数据](https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.ngdc.mgg.dem:etopo_2022/html)，访问 2026-10-04）。
- NE：land 5.1.1 `e547…22dc`、lakes 5.0.0 `0803…722a`、rivers 5.0.0 `ded7…5c38`，public domain（[条款](https://www.naturalearthdata.com/about/terms-of-use/)，访问 2026-10-04）；复用交接三湖补点及 `geo2.EXCLUDE` 四项排除。
- 参数：1536×1152；平滑 r=3、起伏 r=2；高原 `z≥2500m,rugged≤210m`，丘陵 `200≤z<2500m,rugged≥55m`，盆地平原 `z<2500m,rugged<55m`；脊线 `z≥500m,prominence≥75m,≥6点`。前两半径去除单像元噪声但保留约 7–19 km 地势；阈值用于贴图密度，不作地学命名。
- 复用 `render_map.py::CanvasProjection`，与 design/19 §2 公式/五向量无差异；DEM 有效域外不分类、不生成脊线。Polygon 保留外环并把孔洞归属外环；不再静默丢环。
- overlay2 同口径全图 QA：sea_iou=0.907581、lake_hit=0.970199、extra_water=0.000009，过 ≥0.85/≥0.85/≤0.005；局部河湖来自同一 JSON。
## 4. 开放问题（附默认值）
- O1：阈值尚无作者美术审批；默认交 TOOL-map-compose 先按当前分类控制贴图密度。无新依赖（仅 numpy/Pillow）；缺依赖时消费已提交 JSON/PNG。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- TM-P01 / design/19 登记 `tianshu.terrain-layer.v1`、五层及重建命令 / 让 compose 与运行时共享接口；本任务未改基准。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `design/19` §0.1/§8.1/§11：登记五层、三湖补点、四项现代水域排除与命令；`tech/06`：登记约 2.92 MB JSON 分包；TOOL-map-compose：消费下述接口。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 指定单测 10/10；✅ `--check` 零写入且三类覆盖率均过线；✅ 五向量 ≤0.02 px、Polygon 闭合无自交、39 条 LineString 无自交、双构建 hash 一致。
- ✅ 五层/三预览/manifest 重建，JSON≤15 MiB、PNG≤6 MiB；✅ 预览严格回读五份交付 JSON；✅ 目检无边缘伪影；✅ 未改地图事实或旧渲染器。
- ✅ TOOL-map-compose：`tianshu.terrain-layer.v1`，`features[]={id,geometry,properties}`；Polygon `coordinates[0]` 外环、其后孔洞，LineString；左上原点、x右/y下、4096×3072 px、2 位小数；`sea_exterior.topology=land_outer|land_hole`。

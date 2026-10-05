# TOOL-map-compose 报告 · 大地图 · 拼合生成器（AR-68 第 4 步，按 AR-83 定稿）：程序按 GIS 与 DEM 确定地画——边界笔触条沿边界铺、填充贴片平铺、河流按阈值取舍、DEM 山势图换水墨边、城镇标记贴入后消融；随机与融合并入（山峰贴图只作高山点缀）；固定种子；本轮先出样区（附河流阈值两档、无扰动 / 有扰动两组对比）
## 1. 摘要（3–6 行）
- 已交付固定种子 680083 的 AR-83 拼合器与大理 ch01 样区（1536×1024）；只出样区，未生成全图。
- 返修为暖米色宣纸、DEM 驱动的层叠水墨山体、留白雾带、淡青白河湖与清晰小建筑；分类纹理不再铺山地。
- 28 项单测、DEM/GIS 来源核验、--sample --check 与交接 overlay2.py 全通过；仍以作者对 *_vs_approved.png 的画风目检为最终门禁。
## 2. 产出（文件、行数、主要章节）
- tools/map/compose/compose_map.py（1424 行）、config.json（119）、test_compose.py（260）、build_relief.py（170）、build_sample_gis.py（201）、README.md（49）：生成、配置、28 项测试、可复建数据链与命令契约。
- 成品 assets/default/map/composed/sample/rg_dali_cangshan.png；对比 *_rivers_compare_r6_r9.png、*_jitter_compare_off_on.png、*_vs_approved.png；另有 markers/check/manifest JSON。
- *_markers.json 共 16 条（8 条独立绘制）；字段为 ID/类型/名称、画布与 WGS84 坐标、点击半径/可点击、置信度、区域限定、绘制/同址状态、开放书界。
## 3. 关键结论与数值
- 填充/边界：平原、草原、高原 opacity=0，以纸底与 28 px/10% 边缘墨晕表达；水/湖贴片 0.18/0.12；类别羽化 20 px。条带每 38 px 铺设、重叠 8、接头羽化 5；最终接缝 alpha 最低 0.972549。
- 河流采用 NE10m scalerank（未算 DEM 汇流），默认 <=9，对比 <=6/<=9 为 8/13 条；三轮 Chaikin、3×抗锯齿、宽 14/10/6 px、1 px 灰墨岸、水色 [218,232,238]。
- DEM：ETOPO 2022 v1 30″ 生成 384×256 米值/晕渲/坡级/起伏度；海拔≥650 m 且起伏≥52 m 才候选，104 px 泊松间距、36 件/Mpx，高山≥2600 m、雪山≥3800 m。
- 山体 24 件（山脉12/山峰9/雪山2/丘陵1），按 y 远小近大；山谷/山脚留白雾带 34 px、模糊18、opacity 0.72；绝不以纹理平铺山地。
- 消融为羽化7 px、溶解噪声0.20、墨晕3 px；有向件缩放±15%/旋转±6°/仅水平翻转/墨色±12%，可点击件缩放≤±8%，190 px 内避同变体。
- 实际山体件：shanmai_04/_05/_06、shanfeng_01/_02/_03/_04、xueshan_02/_03、qiuling_01；标记件：dacheng_01、zhoufu_01、xianzhen_01、menpai_02。
- 实际填充件：shuimian_02、humian_02；平原/草原/高原件已加载但 opacity=0，样区无沙漠；湖岸/河流/道路条带参与，样区无海岸与真实区域多边形边界。
- 低置信 POI 共10条：区域图限定、32%淡墨、无点击半径；样区1条因近邻合并未独立绘制，但 JSON 保留精确坐标。
- 最终 PNG SHA=a06f7e9b65096c4668ac6e2b911ddb00fdd7892cb8625e691d00acfa9af583eb；同输入逐像素一致，换种子会变。
- overlay2.py：major=0.98、all=0.98、lake=1.00、extra=0；最差长河钦敦江=0.95，均过 0.85/0.80/0.85/≤0.005 门槛；内陆 sea_iou=null。
- 对照已审图：已消除泥褐像素块，河湖可辨、山体/建筑可读；程序图仍比手绘基线更疏、更符号化，且水系占画面更强，须作者审样。
## 4. 开放问题（附默认值）
- 异常框待协调：漠北宽88 km、西夏贺兰259 km、辽东东至133.25E、东海诸岛3034 km、南海诸岛2103 km；默认不改事实、不生成。
- regions.yaml 无真实区域多边形，故不伪造矩形边界；默认等 GIS 区界。贴片/kit 均为 candidate，默认 ART 审定后同命令重出；无新依赖。
- 全图需全国 DEM/NE 派生、真实区界、海岸样区 sea IoU、30 区/14 书界批量导出与性能预算；默认样区获批后另起任务。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；design/19 §2 投影与交接 Albers/大理取景框一致。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- docs/design/map/regions.yaml / 五个异常区：核定覆盖范围并补真实区域多边形；docs/design/19-world-map.md §7–§8：审样后登记最终阈值、视觉参数及全图/时代导出约定。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ python3 -m unittest discover -s tools/map/compose -p test_*.py：28/28；覆盖投影、NE10m/洱海、平滑河带、DEM四类山体、消融、扰动/泊松/遮挡、时代/标记/对照图。
- ✅ build_relief.py --check、build_sample_gis.py --check、compose_map.py --sample --check 通过；7 个输出逐字节一致，两组必需对比与已审对照齐全。
- ✅ 复用交接投影/NE读取/起伏度及质检逻辑；仅写负责路径，未动上游、node_modules 或 git 状态。⚠️ 仅验大理内陆，作者视觉门禁、海岸、异常框、全图与14书界留后续。

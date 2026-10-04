# ART-map-inkkit-tiles 报告 · 大地图 · 水墨贴片（AR-83）：无缝可平铺的填充贴片（水面 / 湖面 / 平原 / 草原 / 沙漠 / 高原各 2–3）+ 首尾可衔接的边界笔触条（海岸线 / 湖岸 / 河流 / 道路 / 区域边界，粗细各 2–3 档）；画风对齐贴图集与基线；无缝与衔接脚本检验

## 1. 摘要（3–6 行）

内置 image_gen 独立生成22件：12张填充、10条笔触；每次输入江湖总图、大理两张已审基线及同类 kit 1张，全部 candidate。
沿用低饱和灰墨、淡赭、灰绿、灰青、干笔飞白与湿墨渗化；填充压淡作为底纹，不复制地理布局，岸条上水下陆。
完成无缝化、2×2 / 三连 / 曲线对照表、主检查与独立审计；生成过程、原图副本与日志全部外置，无代码绘制主体。
## 2. 产出（文件、行数、主要章节）

`assets/default/map/tiles/`：23张登记PNG，`manifest.yaml`1548行（完整来源、SHA、tile/strip、recipe），`README.md`94行（取件、风格、处理公式、检验与依赖）；目录无其他文件。
`tools/map/tiles/`：`build_tiles.py`264行、`check_tiles.py`290行、`audit_seams.py`71行；对照表 `assets/default/map/tiles/_contact_sheet.png`，2400×5980，六类填充分行、五类笔触分行；本报告30行。
## 3. 关键结论与数值

水面/湖面/平原/草原/沙漠/高原各2张，均512×512不透明RGBA；海岸/湖岸/河流/道路/区域边界各2条，均1024×128透明RGBA，实测墨带宽分别24/48、20/40、18/36、8/16、6/12px；12+10+1表=23。
填充完整缩放、按纸色匀混（水0.32/湖0.22/陆0.38）压淡，双轴64px余弦对边平均；条裁空白/噪点、归一粗细并透明补边，alpha<32的杂色跨度钳至48，左右128px预乘RGB/alpha渐变平均；逐件notes/recipe记录参数。
接缝均值/P95≤内部1倍，16px接缝邻域≤1.75倍（高于周期正弦π/2的自然峰均比）；独立环绕均值/P95≤内部中位数2.5倍，零中位数无容差；端alpha/灰度corr≥0.995、MAE≤1/255、P95≤3/255（8位量级），上下alpha=0。
## 4. 开放问题（附默认值）

作者审淡墨强度、沙漠灰绿颗粒与岸条水纹，默认保留 candidate；同一区域默认连续铺单变体。小尺寸、重复感、GIS急弯/闭环/分岔与真机融合（待实测），默认交 TOOL-map-compose 固定种子样区；图像后端未披露，不猜型号。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；仅新增 map_tile/map_strip 素材键与审样键，不新增玩法、地理或书界ID。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

`assets/README.md`manifest字段：登记tile/strip/recipe与排除contact_sheet；`docs/design/19-world-map.md`§7：引用AR-83本包接口；TOOL-map-compose：消费width_px（整墨带宽）、water_side，验证法线方向、跨变体融合及GIS接头；未修改这些文件。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 各类数量/尺寸/两档粗细、指定基线+kit输入、独立生图与无代码主体均满足；两张基线与kit共74个文件SHA未变，22件最终像素严格等于独立原图按记录recipe处理的结果；对照表中文、2×2、三连、完整曲线与深底均目检。
- ✅ 公共check_assets（--min 23 --max 60 --min-side 128）、check_tiles、--self-test及独立audit_seams均退出0；9个自测含有缝/错位/空笔触与伪修补负例。实测接缝P95=0、邻域/内部P95最大1.100895、端corr=1/MAE=0，上下alpha=0；目录白名单与SHA唯一通过。
- ✅ 只写授权资产/工具/报告及指定外置日志；未改git状态、未临时整仓检出或复制assets；git diff --check通过。过程证据位于 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_asset_logs/assets/default/map/tiles/`；⚠️ 作者审样与运行时样区按第4节默认值留给下游。

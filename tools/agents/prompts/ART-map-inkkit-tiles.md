# 本任务：大地图 · 水墨贴片：无缝可平铺的填充贴片 + 首尾可衔接的边界笔触条（作者 AR-83）；画风对齐已合入的贴图集与两张基线；无缝与衔接用脚本检验

本任务出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68、AR-69、**AR-83**（协调者口径第 1 条）；
- 已合入的贴图集 `assets/default/map/kit/`：`manifest.yaml`、`README.md`、`_contact_sheet.png`；
- 作者已审基线：`assets/default/baseline/map/ref_map_jianghu__ch01_base01.png`（江湖总图）、`assets/default/baseline/map/ref_map_dali__ch01_base01.png`（大理）；
- `docs/design/19-world-map.md` §7 水墨视觉规范；`assets/README.md`：manifest 字段。

## 为什么做

作者 AR-83：大地图改成「贴片 + 程序」的确定性画法。拼合程序（TOOL-map-compose）按 GIS 边界铺笔触条、在同类区域里平铺填充贴片；贴片只提供笔墨质感。

## 要做的事

1. **填充贴片**，无缝可平铺：水面、湖面、平原、草原、沙漠、高原，各 2–3 张。
   - 方形，边长 1024 或 512；
   - 四边无缝：左右、上下对边像素连续，2×2 平铺看不出接缝；
   - 画面只有质感，例如水纹、晕染、草点、沙纹、皴擦；不画具体物件，不画边框，不做中心构图，纹理密度均匀；
   - 低饱和、淡墨，作底纹用，不抢城镇和标记；不透明或半透明都可，写进 manifest。
2. **边界笔触条**，首尾可衔接：海岸线、湖岸、河流、道路、区域边界，每种粗细 2–3 档。
   - 横向长条，长宽比约 8:1，例如 2048×256、1024×128；透明底 RGBA，上下边 alpha 为 0；
   - 左右两端可首尾相接：两端笔触的粗细、墨色、位置一致，重复拼接看不出接头；
   - 粗细档用条内笔触的宽度区分；
   - 海岸线、湖岸分水陆两侧：一侧水纹晕染，一侧干笔岸线。
3. **怎么出**：
   - 用 image_gen 生成。生图时输入两张基线，再加相近品类的已合入贴图 1–2 张作风格参照；
   - 允许用脚本做「无缝化」后处理，例如偏移半幅后在接缝处渐变混合、两端交叉渐变；**不许用代码画主体**；
   - 后处理的做法写进 manifest 的 `notes` 和报告。
4. **检验脚本** `tools/map/tiles/check_tiles.py`：
   - 填充贴片：对边接缝的像素差（均值与 95 分位）不超过贴片内部相邻像素差的若干倍；2×2 平铺后接缝处的梯度不高于内部；
   - 笔触条：左右端列的 alpha 与灰度剖面一致（相关系数、差值各有阈值）；上下边 alpha 为 0；
   - 阈值写在脚本里，报告说明取值理由；
   - `--self-test`：用程序造的已知无缝、已知有缝样本，证明检验有效。
5. **产物与 manifest**：放 `assets/default/map/tiles/`，写 `manifest.yaml`，`status: candidate`。每条加机读字段：
   - 填充贴片：`tile: {kind: water|lake|plain|grassland|desert|plateau, alpha: opaque|translucent}`；
   - 笔触条：`strip: {kind: coast|lakeshore|river|road|region, width_px: <条内笔触宽度>, water_side: top|bottom|none}`。
6. **对照表** `assets/default/map/tiles/_contact_sheet.png`，按品类分行：
   - 填充贴片每张旁边附 2×2 平铺；
   - 笔触条附三连拼接，外加一个沿弯曲路径的示意。
7. **过程文件不进 assets/**：提示词集合、生成记录、临时图放 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_asset_logs/assets/default/map/tiles/`（不入库）或 `/private/tmp`。`assets/default/map/tiles/` 下只放登记在 manifest 的 PNG、`manifest.yaml` 和可选的 `README.md`。

## 约束

- 写集：`assets/default/map/tiles/**`、`tools/map/tiles/**`。写集外的改动在提交时会被丢弃。
- 不改基线与已合入的贴图集。
- 不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/map/tiles --min 23 --max 60 --min-side 128`
- `python3 tools/map/tiles/check_tiles.py` 与 `python3 tools/map/tiles/check_tiles.py --self-test`
- 各品类件数：六种填充贴片各 ≥ 2 张；五种笔触条各 ≥ 2 档粗细
- 独立的接缝复核：填充贴片四边、笔触条两端的环绕接缝差，不超过内部相邻差中位数的 2.5 倍；笔触条上下边 alpha 为 0
- 目录里除登记在 manifest 的 PNG、`manifest.yaml`、`README.md` 外，没有别的文件

## 报告

≤ 30 行，写清：
- 各品类件数与尺寸；
- 无缝化后处理的做法与检验阈值；
- 与贴图集、基线对照的要点；
- 对照表路径；
- 作者要拍板的点（附默认值）。

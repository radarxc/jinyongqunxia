# 大地图 · 水墨填充贴片与边界笔触条（AR-83）

| 项 | 内容 |
|---|---|
| 归属（基准 §18） | 大地图地理与视觉见 `docs/design/19-world-map.md`；本目录只定义素材取件与验证约定 |
| 上游 | 作者 AR-68、AR-69、AR-83；两张已审地图基线；`assets/default/map/kit/` |
| 引用而不重定义 | GIS 边界、河流等级过滤、年代、地点坐标与山势算法由 TOOL-map-compose 消费其上游 |
| 标注约定 | 通用纹理均为（原创扩展）；逐件状态为 `candidate`；运行时视觉表现（待实测） |

结论先行（TL;DR）：本包提供六类各两张无缝淡墨底纹、五类各两档透明笔触条。
先看 [_contact_sheet.png](_contact_sheet.png)：上方并列两张基线，填充按品类展示单件与 2×2 平铺，笔触展示单条、三连、曲线路径及深底透明叠放。
曲线示意仅对已有生成像素重采样；正式 GIS 拐角、河流分岔和闭环融合仍由拼合任务验证。

## 1. 取件与尺寸

| 字段 / 品类 | 件数 | 交付尺寸 | 底色 / 粗细 |
|---|---:|---|---|
| `tile.kind: water` 水面 | 2 | 512×512 | RGBA，不透明；细水纹、灰青晕染 |
| `tile.kind: lake` 湖面 | 2 | 512×512 | RGBA，不透明；进一步压淡的静水纹 |
| `tile.kind: plain` 平原 | 2 | 512×512 | RGBA，不透明；淡赭擦痕、疏草点 |
| `tile.kind: grassland` 草原 | 2 | 512×512 | RGBA，不透明；灰绿草点与纤维擦痕 |
| `tile.kind: desert` 沙漠 | 2 | 512×512 | RGBA，不透明；细沙纹与斜向风蚀痕 |
| `tile.kind: plateau` 高原 | 2 | 512×512 | RGBA，不透明；灰赭皴擦与细碎石质颗粒 |
| `strip.kind: coast` 海岸线 | 2 | 1024×128 | 真透明 RGBA；两档；水侧 `top` |
| `strip.kind: lakeshore` 湖岸 | 2 | 1024×128 | 真透明 RGBA；两档；水侧 `top` |
| `strip.kind: river` 河流 | 2 | 1024×128 | 真透明 RGBA；两档；水侧 `none` |
| `strip.kind: road` 道路 | 2 | 1024×128 | 真透明 RGBA；两档；水侧 `none` |
| `strip.kind: region` 区域边界 | 2 | 1024×128 | 真透明 RGBA；两档；水侧 `none` |

`12 + 10 = 22` 件材质，加 1 张对照表，共 23 条 manifest。只以 `tile` 或 `strip` 字段取件，排除 `role: contact_sheet`。
`width_px` 为每列 `alpha≥128` 的行数中位数取整，代表整条可见墨带的粗细，包含岸条的水陆晕染，不等于岸线中心深墨线宽。
同类粗细各由独立 image_gen 请求绘制，再归一到两档；不是由一张原图派生两个素材。
实际宽度、完整提示词、输入参考、原始路径 / 尺寸 / SHA-256、最终散列、处理参数均逐件见 `manifest.yaml`。
岸条从左向右时，上方为水，下方为陆；反转路径须同步交换法线方向。水平镜像保留水侧，垂直镜像会交换水陆。
笔触自身横向贯通，任意列都有墨迹；上下留透明安全边。填充没有边框、中心景物或可识别地理布局。

## 2. 风格与无缝化

每次生成都输入江湖总图、大理两张基线，加相近品类 kit 一张：海面、湖泊、平原、宽盆、台丘、河流或道路。
低饱和灰墨、淡赭、灰绿与灰青、干笔飞白、湿墨渗化、主体内纸感沿用参考；完整纸底为 `#eee4cc`。
填充刻意比 kit 的城镇、标记更淡，作为大面积底纹；深墨不用于填充的主调。单件不画文字或具体景物。

`tools/map/tiles/build_tiles.py` 只处理已生成像素，不绘制素材主体：

1. 填充完整画幅以 Lanczos 缩至 512 方图，再按 `输出RGB = 纸色×(1−s) + 原图RGB×s` 匀混；水面 `s=0.32`、湖面 `0.22`、陆地 `0.38`，alpha 固定 255。
2. 两轴分别取 64 px 对边带；距边 `d` 的权重 `t=(1+cos(πd/63))/2`，两侧像素向其平均值渐变。最外边严格相同，带外权重为零；中心 384×384 保留缩放与压淡后的原生成纹理。
3. 笔触以 `alpha≥32` 且覆盖超过原宽 3% 的行定位有效带，上下各留 8 px 后裁掉空白与离散噪点；重采样到 1024 横长与目标粗细，居中放入 128 高透明画布。
4. 重采样后，仅对 `0<alpha<32` 的边缘将 RGB 通道跨度钳至 48，压制低 alpha 放大的杂色，保持 alpha 与主体不变。左右端各 128 px 使用同一余弦公式（分母 127），同时混合预乘 RGB 与 alpha，再反预乘、8 位取整；透明像素 RGB 清零，上下外缘 alpha 置零。保留 image_gen 的真实半透明墨迹，不从纸底抠图。

这套处理只修补生成材质的周期边界。不是 GIS 轮廓生成，也不会保证不同种类或不同变体可直接互接。
同类变体混铺应按区域遮罩交叉融合；【建议值】初版使用单一变体连续平铺，跨变体融合由 TOOL-map-compose 样区确定。

## 3. 检验与复跑

```sh
python3 tools/agents/check_assets.py assets/default/map/tiles --min 23 --max 60 --min-side 128
python3 tools/map/tiles/check_tiles.py
python3 tools/map/tiles/check_tiles.py --self-test
python3 tools/map/tiles/audit_seams.py
python3 tools/map/tiles/build_tiles.py contact
```

依赖本项目已用的 Pillow / numpy / PyYAML；检查与对照表重排不依赖外置原图。
重排对照表还需本机中文字体 Hiragino Sans GB / STHeiti / Noto Sans CJK；缺少字体时明确报错，不回退成缺字方框。
重做后处理需外置日志原图仍在：`python3 tools/map/tiles/build_tiles.py ingest --logs <日志目录>`，随后运行 `contact` 及上述校验。
日志目录：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_asset_logs/assets/default/map/tiles/`。
提示词集合、逐次生成记录、原图副本、过程预览和验收日志均在该目录；assets 内只登记最终 PNG、manifest 和本 README。

主检查在预乘 RGB 加原 alpha、黑底、浅底三种视图上实际构造 2×2 / 三连；不透明填充的预乘值就是原始 RGBA。透明材质避免把透明区无意义的 RGB 当成可见梯度：接缝差的均值与 P95 均 ≤ 同轴内部相邻差的 1 倍；环绕差均值 ≤ 内部中位数的 2.5 倍。
接缝左右各 16 px 邻域梯度的均值与 P95 ≤ 内部的 1.75 倍；周期正弦峰值斜率 / 平均斜率为 `π/2≈1.571`，故保留自然局部斜率变化，同时拒绝突变式修补。
笔触两端 alpha 与黑 / 浅底灰度剖面相关系数 ≥ 0.995、平均绝对差 ≤ 1/255、P95 ≤ 3/255；上下 alpha 必须精确为 0。阈值为 8 位像素量级，当前端列实际完全相同。
9 个自测覆盖已知周期填充 / 笔触、横纵有缝、alpha 错位、墨色错误、上边非透明、空笔触、端点相同但邻域突变。
独立审计不导入主检查 / 处理函数：RGBA、RGB、黑 / 浅底的环绕差均值与 P95 均 ≤ 内部中位数的 2.5 倍，零中位数不加容差，并核对笔触上下 alpha。
主检查同时核对各类 2–3 件、两档实测宽度、尺寸、候选状态、散列唯一与目录白名单。

## 参考资料

- 作者需求：`docs/decisions/author-requirements.md` AR-68 / AR-69 / AR-83；视觉归属：`docs/design/19-world-map.md` §7。
- 风格输入：`assets/default/baseline/map/` 两张已审图、`assets/default/map/kit/manifest.yaml` 与 `_contact_sheet.png`。
- 清单字段：`assets/README.md`；素材 ID 前缀：`docs/tech/07-asset-generation.md` §1.4。

## 本文新增术语/约定

资源键为 `map_tile_*`、`map_strip_*` 与审样 `map_tiles_contact_01`，逐件登记；不新增玩法、地理或书界 ID。
机读 `tile: {kind, alpha}` / `strip: {kind, width_px, water_side}` 和 `recipe` 为本素材接口；`role: contact_sheet` 排除运行时取件。
`width_px` 是材质原像素的整墨带宽度，不能直接覆盖 `design/19` §7.3 的画布线宽。

## 待决事项 / 依赖

- 替下游给出的建议值：同一连续区域先铺单变体；淡墨已烘焙，初版按原值贴入。运行时缩放、区域色差与低频扰动由样区审定。
- 本文依赖的上游事实：AR-69 已通过 kit 画法；本轮新素材仍逐件 `candidate`，不据此升级为 approved。
- 对基准的修改提案：无；不重定义地理、山势或旅行规则。
- 原著考据待办：无，本包仅提供通用原创笔墨质感。
- 开放问题（附默认值）：作者审淡墨强度、沙漠灰绿颗粒与岸条水纹；默认保留本包候选。最小显示尺寸、重复感、急弯 / 闭环 / 分岔融合与真机辨识（待实测），默认由 TOOL-map-compose 出固定种子样区对比；曲线审样不替代这些验收。

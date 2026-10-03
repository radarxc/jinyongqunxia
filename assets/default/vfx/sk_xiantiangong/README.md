# 先天功 · 三招特效候选

> 归属（基准 §18）：表现层素材；制作契约见 `docs/design/23-projection-vfx-pipeline.md`。
> 上游：作者本任务原话、`assets/default/STYLE.md`、道家图鉴 §2.2 先天功卡。
> 引用而不重定义：性质、招式与范围归图鉴；几何、混合、节奏归 design/23 §2–6。
> 标注约定：造型与配色为（原创扩展）；书证（待考）；浏览器 / 真机（待实测）；局部版面参数为【建议值】。

## 1. 内容与原著边界

本套件仅使用内置 `image_gen` 生成三张 1536×1024 白底原料，每张四帧、一个候选选入一个；没有第二候选、程序替画或普通招专属原料。
三张原图逐字节保留，完整实发提示词见各套 `prompt.txt` 与 manifest；后端模型名和推理强度未回传，不据工具名推断。
共享掌图仅相对引用 `../emitters/palm/emitter-plate.yaml`，不复制、不抠图、不修改。

原著依据仅引用道家图鉴：先天功为王重阳内功；与段智兴、一阳指及欧阳锋相关的叙述细节仍（待考），核对三联 / 广州修订版《射雕英雄传》一灯追述往事的段落。本次未逐字考据，不添加引文、回目或颜色描写。
三招名称与效果已由图鉴标为（原创扩展）。赤色来自本作 `nature:yang`，不是原著可见颜色；三层罡气弧面、五股归元气带和一炁长带均为（原创扩展）。

| 招式 | 上游范围 / 性质 | 效果套 | 表现边界 |
|---|---|---|---|
| `mv_xiantiangong_gangqi` 先天罡气 | 绝招；`aoe_self`；未标外放 | `effect/mv_xiantiangong_gangqi/` | 三层弧面近掌展开，示意局部护体 |
| `mv_xiantiangong_wuqi` 五气朝元 | 绝招；对敌 `aoe_around`、对己 `aoe_self`；未标外放 | `effect/mv_xiantiangong_wuqi/` | 五股气带收拢成局部旋卷，示意周身运气 |
| `mv_xiantiangong_yiqi` 一炁贯虹 | 普通；`aoe_line n3`、`ranged` 1–3；外放证据待考 | `effect/family/` | 只示范既有 3 格距离，不增加投射加持 |

三招均不声明 `projection:true`，不填写虚构的 `projectionSpreadSteps` 或已解算档位。`mode:baseline` 不是合法战斗事件快照。
内功两招以共享掌面作独立示意发出点；尚不呈现完整人物周身六方向。运行时应消费已解算的护体 / 周身事件和真实人物挂点，不能从这一个有向图层反推命中格。

## 2. 原料与量图

每张采用 2×2 等格裁切，局部 768×512；矩形顺序为 `[0,0,768,512]`、`[768,0,768,512]`、`[0,512,768,512]`、`[768,512,768,512]`。
像素方向 `[1,0]`，`style:ink`、`blend:normal`；RGBA 为 sRGB / straight alpha。
抠图沿用现有 `cut_frames.py`：`white_key`、白阈值 250、全保留差值 64、亮度参考 0.20、epsilon=1/255、去白开启。初试 `white_luma` 最大重建误差达 6/255，已通过上述参数解决；未修改工具。

测量方法：在根部选定 x 的前后各 2 列取 alpha 均值，按像素中心求纵向加权重心（保留 0.1 px）；峰值帧此截面 alpha≥128 的首尾像素跨度作为根宽。参考长取峰值根部至最远可见前端。

| 套 | 各帧根部 x / y（px） | 峰值根宽（px） | 参考长（px） |
|---|---|---:|---:|
| family | x=95.5；y=250.5 / 249.3 / 246.4 / 245.7 | `332−167+1=166` | `725.5−95.5=630` |
| gangqi | x=205.5；y=274.9 / 273.9 / 269.9 / 267.6 | `349−193+1=157` | `649.5−205.5=444` |
| wuqi | x=150.5；y=239.8 / 238.6 / 236.5 / 235.1 | `323−149+1=175` | `660.5−150.5=510` |

原图根部有约 5–7 px 的纵向偏移，已按各帧独立锚点在代码合成时对齐，原图未挪动或重绘；不宣称原图天然满足 ≤2 px 漂移建议。
每套保留 `quality.json` 与黑、灰、白三底联系表，用于检查软边和留白；正式运行消费四张分离 RGBA。原图外缘 32 px 实测含 253–255 的近白波动，并非逐像素全为 255；白阈值已去除这些背景像素，原件仍保留原字节。

## 3. Composition 与节奏

母版画幅 1536×1024，纸底 `#EFE6D2`；展示尺寸 768×512。三招 E=`[600,540]`，θ=0°，`emitter_scale=0.65`，`scale=[1,1]`，均为局部演示【建议值】。
共享掌图锚点 `[850,704]`、发出宽 320 px；显示宽 `0.65×320=208 px`。按 design/23 §4.1，各帧根部变换后严格落在 E，θ=0° 向右。

| 招式 | `range_hex` | `length_px` 的取值依据【建议值】 | sx / sy | 模板与总时长 |
|---|---:|---|---|---|
| gangqi | 0 | 自身局部长度 `1.5×180=270 px`，非 1.5 格玩法射程 | `270/444` / `208/157` | wave：`0.15+0.20+0.40+0.15=0.90 s` |
| wuqi | 0 | 自身运气局部长度 `1.75×180=315 px`，非 1.75 格玩法射程 | `315/510` / `208/175` | wave：`0.15+0.20+0.40+0.15=0.90 s` |
| yiqi | 3 | 既有 1–3 格中的 3 格样例，`3×180=540 px` | `540/630` / `208/166` | linear：`0.10+0.10+0.30+0.10=0.60 s` |

180 px/hex 只是独立版面标尺；以上数值不改伤害、耗内、CT 或射程。普通效果 0.60 s、范围绝招 0.90 s 来自 design/23 §5.2 预留受击时长的模板。
家族四帧 phase=`[0,1/3,0.75,1]`，两绝招=`[0,7/18,5/6,1]`；峰值分别 `(0.1+0.1)/0.6=1/3`、`(0.15+0.2)/0.9=7/18`，直接取第二张原料。
持续连源，`drift_fraction=0`；凝聚缩放绝招 0.95、普通 1；crossfade 使用现有预乘线性插值，方向遮罩 softness=0.08。循环间隔 0.4 s 仅供观看。

## 4. 复现与文件

从仓库根执行，每个命令只生成指定套件内文件；依赖工具与共享图按仓库现状引用。

```sh
for s in family mv_xiantiangong_gangqi mv_xiantiangong_wuqi; do
  python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_xiantiangong/effect/$s/effect-set.yaml --output assets/default/vfx/sk_xiantiangong/effect/$s/effect-set.yaml --root assets/default/vfx/sk_xiantiangong --preview
done
for m in gangqi wuqi yiqi; do
  python3 tools/vfx/compose.py assets/default/vfx/sk_xiantiangong/moves/mv_xiantiangong_$m/composition.yaml --root assets/default/vfx
  python3 tools/vfx/build_demo.py assets/default/vfx/sk_xiantiangong/moves/mv_xiantiangong_$m/composition.yaml --root assets/default/vfx
done
```

每招交付 YAML / JSON / peak.png / demo.html；JSON、峰值和演示均为脚本派生。重建后须更新 manifest 中变更文件的 size / bytes / sha256，再运行任务三项检查。
HTML 唯一显式外链固定为工具指定 Three.js r186 importmap，其余图片与脚本内联；离线首屏保留静态峰值。浏览器模块加载与连续动画未实跑，不能以静态检查代替。

## 本文新增术语与 ID

不新增玩法术语或 ID。复用 `sk_xiantiangong` 与三条既有 `mv_*`；新增素材键为三套 `vfx_sk_xiantiangong__{family,gangqi,wuqi}_base01`、三招 `vfx_mv_xiantiangong_{gangqi,wuqi,yiqi}__base01`，逐项登记于 manifest。

## 数据校验规则与测试用例

以 `check_skill_suite.py` 检查三招齐全与共享路径；`check_assets.py --min 1 --max 60 --min-side 256` 检查登记和主图；`check_ids.py --strict` 检查 ID；另调用现有 `PeakRenderer` / `collect_quality` / `check_html`，使用与 `check_vfx.py --html` 相同的接口验证结构、几何、质量、外链和内联脚本。
`verification.json` 保存静态验收摘要、全帧几何边界、原件及共享发出方哈希验证；不是玩法数据。

## 待决事项 / 依赖

### 替下游给出的建议值

沿用 §3 的局部长度、180 px/hex、锚点版面与缩放；运行时按真实挂点与目标屏幕坐标替换。帧数四帧在上游 4–8 帧许可范围内。

### 本文依赖的上游事实

性质 yang、delivery inner、两绝招一普通招、三招均不标 projection，唯一见道家图鉴；共用掌图与工具不在本任务写集。

### 对基准的修改提案

无。

### 原著考据待办

沿用 §1 与图鉴的一灯追述段落待考；一炁贯虹的 ranged 不等于 AR-16 外放，默认不升级标记。

### 开放问题（附默认值）

- 审美：默认保留赤色、三层护体弧与五气旋卷，全部 `candidate`，待作者确认。
- 完整周身与真实角色接入：默认保留局部掌面演示，不据其包围盒产生 AoE；由下游按已解算事件安排表现。
- 五气初聚至成形仍有轮廓变化：默认四帧 crossfade 与方向遮罩；连续性及移动端表现（待实测），不追加候选。
- 真机 / 浏览器 / CDN：默认沿用现有播放器；未安装浏览器依赖或进行网络可达性、WebGL 与性能实测。

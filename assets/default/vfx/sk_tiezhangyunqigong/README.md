# 铁掌运气功 · 五招特效候选

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作契约下的素材套件；玩法归 `design/05` 与射雕补录图鉴 |
| 上游 | 作者两段式 / Three.js 要求；`skills-bulu-02-shediao` §1.1；`STYLE.md` 招式行 |
| 引用而不重定义 | 阴阳、招式、护体与范围只引用图鉴；几何、节奏见 `design/23` §2–6 |
| 标注约定 | 造型（原创扩展）；原著逐字书证（待考）；CDN（待核实）；浏览器 / 真机（待实测）；美术尺度【建议值】 |

## 结论先行（TL;DR）

三张白底四帧原料，切为十二张 RGBA，由五份 Composition 合成五张峰值与五个 Three.js 演示。
全部登记为 `candidate`。普通招复用家族；两记绝招各有独有造型；只引用共用 palm 发出方。
图鉴明确五招全部 `projection:false`，是自身蓄息、运劲、护臂或守势。演示采用贴掌局部气场。

## 1. 造型与来源

图鉴 §1.1 已将武学名称、全部招名、机制与数值标作（原创扩展）。本套不主张原著有可见赤色内气。
赤色倾向来自 `yang` 与作者阴青阳赤风格约定；少量铁灰、回卷、交叠与三叠峰形均为（原创扩展）。
《射雕英雄传》裘千仞铁掌相关措辞及《神雕侠侣》绝情谷裘千尺承传细节（待考），不杜撰引文或回目。

| 效果套 | 造型 | 生成候选 / 入选 |
|---|---|---|
| `effect/family/` | 赤色圆转回气，少量铁灰墨纹；吐纳、运掌与稳臂共用 | 1 / 1 |
| `effect/mv_tiezhangyunqigong_lianbi/` | 双股墨带交叠回环，表现连臂归气 | 1 / 1 |
| `effect/mv_tiezhangyunqigong_shoufeng/` | 三叠钝峰状护息，表现守峰定息；没有实体山景 | 2 / 第 2 张 |

内置 `image_gen` 共调用四次，选入三张。守峰首稿留白偏窄，第二候选由原稿编辑缩小占位。
完整实发提示词、编辑参考和工具原始路径见 `source_requests.json`；后端模型与 effort 未返回，不猜测。
入选原件逐字节存为各套 `source_sheet.png`；淘汰稿仍在工具源路径，未作为可用素材登记。

## 2. 切帧与锚点

三张原件均 1254×1254，按 2×2 等分，四个裁格为 `(0,0)`、`(627,0)`、`(0,627)`、`(627,627)`，每格 627×627。
`cut_frames.py` 保留源图，输出 straight RGBA。使用 `white_key`、白阈值 250、全保留差值 64、epsilon=1/255、去白开启。
首轮 `white_luma` 在本批饱和色上白底重建误差最高 6/255，故改用色键；没有改工具或腐蚀边缘。

下表 root y 取指定 x 截面 `alpha≥128` 首末像素边界的中点；峰值第二帧的截面跨度作为整套根宽。
参考长取峰值第二帧 `alpha>1` 最右可见像素右边界减 root x，量图单位均为 px。

| 套 | root x | 四帧 root y | 峰值截面 / 根宽 | 参考长 |
|---|---:|---|---|---:|
| family | 115 | 316.5 / 316.5 / 306.5 / 315.5 | `[228,405)` / 177 | `598−115=483` |
| lianbi | 115 | 303 / 301 / 292.5 / 296 | `[215,387)` / 172 | `564−115=449` |
| shoufeng | 170 | 314 / 313.5 / 289 / 286.5 | `[216,411)` / 195 | `510−170=340` |

逐帧锚点补偿实际源根中心变化，不假称生成原图漂移 ≤2 px。合成后各根部严格落在同一 E，纹理呼吸仍保留。
全部原料方向 `[1,0]`、`normal` 混合，末帧非空；播放的零透明末态由节奏包络生成。

## 3. 长度、节奏与演示

共用掌图原始发出点 `[850,704]`，发出宽 320，缩放 0.6，故局部标尺 `W=320×0.6=192 px`。
五招 `range_hex=0`；图鉴未填写数值 range，按明确的“自身”语义做独立基线，见 `design/23` §4.2。
显式正 `length_px` 仅控制气场局部纵深；不用外放射程或 `projectionSpreadSteps`，不反推攻击距离。
统一 E=`[600,560]`、θ=0°、`scale=[1,1]`，根宽均映射到 192 px；发出方与原图始终分离。

| 招式（完整 ID 见同名 moves 目录） | 绝招 / 外放 | 效果套 | 长度【建议值】 | 节奏 |
|---|---|---|---:|---|
| 铁掌吐纳 / tuna | 否 / 否 | family | `1.25W=240` | pulse / 0.60 s |
| 运掌凝劲 / yunzhang | 否 / 否 | family | `1.50W=288` | pulse / 0.60 s |
| 凝息稳臂 / ningxi | 否 / 否 | family | `1.75W=336` | pulse / 0.60 s |
| 连臂归气 / lianbi | 是 / 否 | lianbi | `2W=384` | wave / 0.90 s |
| 守峰定息 / shoufeng | 是 / 否 | shoufeng | `2.25W=432` | wave / 0.90 s |

按 `design/23` §4.1，沿向倍率分别是 `240/483`、`288/483`、`336/483`、`384/449`、`432/340`。
横向倍率 family=`192/177`，lianbi=`192/172`，shoufeng=`192/195`；允许放大原料，未重绘轮廓。
pulse=`0.10+0.15+0.25+0.10=0.60 s`，wave=`0.15+0.20+0.40+0.15=0.90 s`，引用 `design/23` §5.2。
峰值相位分别 `(0.10+0.15)/0.60=5/12` 与 `(0.15+0.20)/0.90=7/18`，均对应第二帧。
逐帧相位为 `[0,峰值,5/6,1]`；crossfade、初始缩放 0.95、零漂移、关闭方向推进遮罩以保留自身护息语义。
间隔 0.4 s，循环周期分别 1.0 / 1.3 s；以上都不是 CT、Buff 时长或伤害事件。

## 4. 复现与检查

在仓库根运行，逐项替换 `<套>` 或 `<mv_id>`。共享发出方要求制作命令 root 为 `assets/default/vfx`。

```sh
PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_tiezhangyunqigong/effect/<套>/effect-set.yaml --output assets/default/vfx/sk_tiezhangyunqigong/effect/<套>/effect-set.yaml --root assets/default/vfx/sk_tiezhangyunqigong
PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/compose.py assets/default/vfx/sk_tiezhangyunqigong/moves/<mv_id>/composition.yaml --root assets/default/vfx
PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/build_demo.py assets/default/vfx/sk_tiezhangyunqigong/moves/<mv_id>/composition.yaml --root assets/default/vfx
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_tiezhangyunqigong --catalog docs/design/catalog/skills-bulu-02-shediao.md
python3 tools/agents/check_assets.py assets/default/vfx/sk_tiezhangyunqigong --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

元数据、质量与几何结果见 `validation.json`、各套 `quality.json`、`build-log.jsonl`、`vfx-check.jsonl`。
HTML 内嵌图片与播放器，唯一显式外链为工具固定的 Three.js r186 importmap；真实加载与设备播放（待实测）。
JSON 是 YAML 与原料元数据的派生，不是另一个真值源；源码参数变动须重建并刷新 manifest 哈希。

## 参考资料

- [射雕补录图鉴 §1.1](../../../../docs/design/catalog/skills-bulu-02-shediao.md)：五招定义及原创边界。
- [特效管线 §2–6](../../../../docs/design/23-projection-vfx-pipeline.md)、[工具说明](../../../../tools/vfx/README.md)。
- [风格](../../STYLE.md)、[素材登记](../../../README.md)、[共用 palm](../emitters/palm/emitter-plate.yaml)。

## 本文新增术语/约定

只新增三条原料资产与五条招式资产 ID，完整见 `manifest.yaml`；复用全部既有 sk / mv，不新增玩法 ID。
`family / lianbi / shoufeng` 是目录简称；W 是本演示掌面像素尺。

## 待决事项 / 依赖

- 【建议值】局部尺度、赤色回气与双带 / 峰形，默认沿用本候选，等待作者审美确认；不提升为 approved。
- 已解决：守峰首稿边距偏窄，第二候选缩小图形，见 `source_requests.json`；首次切帧重建误差超建议值，改色键后复验。
- family 峰值最右薄雾距离格边 29 px，略低于 32 px 建议；8 px 边框无残留，默认保留原件、不裁掉细雾。
- 深底浅赤薄雾较亮，生成纹理及帧间轮廓仍有变化；默认保留并用锚点对齐 crossfade，实际动态观感（待实测）。
- 原著书证（待考）；默认仅按图鉴边界与原创意象制作，不声称有原著颜色或招式引文。
- CDN 模块链（待核实）、浏览器 / 真机（待实测）；默认沿用既定 r186，不下载浏览器或扩任务范围。
- 实际游戏接入依赖人物挂点；本次 palm 是独立演示，不覆盖绑定表中 inner 的 emitter:null。工具的“外放样例”通用标题待维护方改为中性称呼。
- 对基准无修改提案；检查与目检不替代作者批准。

# 罗汉伏魔神功 · 四招特效候选

| 项 | 内容 |
|---|---|
| 归属 | design/23 的表现层资产，不定义玩法规则 |
| 上游 | skills-xiake-bixue §2.2；作者拆图合成要求；共用 palm |
| 引用而不重定义 | 射程、绝招、作用范围见图鉴；几何、混合、节奏见 design/23 §2–§6 |
| 标注约定 | 造型（原创扩展）；书证（待考）；浏览器与真机（待实测）；美术参数【建议值】 |

## 结论先行（TL;DR）

3 张内置 image_gen 白底原图，每张 4 帧；共 12 张 RGBA，普通招复用 family，两绝招各用独有图。
四招均有 Composition YAML / JSON、1536×1024 峰值和 Three.js 演示，全部 `candidate`。
发出方直接引用 `../emitters/palm/emitter-plate.yaml`，没有复制或修改共用图。

## 造型与原著边界

只引用图鉴 §2.2：石破天从泥人所示经脉图修习内功的情节。
图鉴已经把四个招名与调和性质标为玩法化原创；本套回环金气、护罩、周向气旋均为**（原创扩展）**。
金色按本任务 harmony 底色倾向，不宣称小说描述过金色真气、实体罗汉或这些招式轮廓。
泥人数量、经脉图文字、习得顺序及真气显色须对三联 / 广州修订版《侠客行》相应情节逐字核对**（待考）**；本次未补造回目或引文。

| 原料目录 | 造型语汇 | 候选数 / 入选 |
|---|---|---|
| `effect/family/` | 回卷双流，宽根连着圆钝前端 | 1 / 1 |
| `effect/mv_luohanfumo_huti/` | 层叠闭合金弧，留空护罩 | 1 / 1 |
| `effect/mv_luohanfumo_zhuxiang/` | 多瓣墨弧绕中心展开 | 1 / 1 |

完整实发提示词及来源见 `source_requests.json`；未使用参考图输入。工具未返回底层图像模型与 effort，登记为未返回 / 默认。
原件逐字节保留；切帧采用 2×2 显式矩形，每格 768×512，不缩放母版。
锚点逐帧量取，详见 `measurements.json`；三底检查完成后移除预览图，保留每套 `quality.json`。

## Composition 参数核算

以下数值均为表现层**【建议值】**。公共掌图宽 320、缩放 0.6，演示发劲截面 `W=320×0.6=192 px`；方向为 0° 向右。
独立标尺 256 px/hex；所有 Composition 为 `mode: baseline`，不伪造 ProjectionResult 或已解算档位。

| 招式 | 效果套 | range_hex / length_px | emit_at_px | scale | 节奏 |
|---|---|---|---|---|---|
| `mv_luohanfumo_zhenqi` | family | 3 / 768 | [620,550] | [1,1] | pulse / 0.60 s |
| `mv_luohanfumo_zhouliu` | family | 0 / 192 | [700,550] | [1,1] | pulse / 0.60 s |
| `mv_luohanfumo_huti` | 独有护罩 | 0 / 384 | [700,550] | [1,1.5] | wave / 0.90 s |
| `mv_luohanfumo_zhuxiang` | 独有周向气旋 | 0 / 256 | [768,550] | [1,0.7262647262647263] | wave / 0.90 s |

- 真气为唯一外放招：本样例选基础最大距离，`L=range.max×256=3×256=768`。三档都是 `aoe_single`，展幅不增加；运行时按真实目标投影长度替换。
- 周流与护体为自身招：局部长分别取 `W=192`、`2W=384`，不产生自指零长束；护体仅横截面放大 1.5 倍以显出包围感。
- 诸相为近身 `aoe_around`：以自身为局部原点，图形参考半径取一格标尺 `1×256=256`，不等于投送射程；不从瓣数生成伤害段或命中格。
- 参考长 / 根宽为 family `572 / 251`、护体 `562.5 / 302`、诸相 `240.5 / 131` px。按 design/23 §4.1，`sx=L/reference_length`、`sy=192/root_width×scale[1]`。
- 诸相 `scale[1]=(256/240.5)/(192/131)=0.7262647263`，令 `sx=sy` 保持圆形；禁用方向遮罩，其余三招启用 softness 0.08；全部 drift 为 0。
- pulse=`0.10+0.15+0.25+0.10=0.60 s`，wave=`0.15+0.20+0.40+0.15=0.90 s`；峰值分别 `5/12`、`7/18`，与第 2 原料帧对齐，不换算 CT。
- 统一 `screen`、固定深墨底 `#4A433C`、亮度 `[0.8,1,1,1,0.8]`，保留金墨透明细节；不烘整图动画。

## 复现与检查

从仓库根目录对每份 EffectSet 执行 `cut_frames.py --config <yaml> --output <同yaml> --root assets/default/vfx/sk_luohanfumo`；可加 `--preview` 重建三底临时检查图。
对每份 Composition 依次执行 `compose.py <yaml> --root assets/default/vfx` 和 `build_demo.py <yaml> --root assets/default/vfx`；工具均在 `tools/vfx/`。
共享根必须取 `assets/default/vfx`，使引用共用 palm 的相对路径合法。改参数后重建 PNG / JSON / HTML 并更新 manifest 哈希。

```sh
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_luohanfumo --catalog docs/design/catalog/skills-xiake-bixue.md
python3 tools/agents/check_assets.py assets/default/vfx/sk_luohanfumo --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

质量、几何、原件与共用图逐字节核对记录见 `verification.json`。HTML 静态检查不代替浏览器实跑；本轮没有 WebGL / CDN / 真机验收。

## 参考资料

- [武学卡](../../../../docs/design/catalog/skills-xiake-bixue.md) §2.2：唯一玩法依据。
- [制作管线](../../../../docs/design/23-projection-vfx-pipeline.md) §2–§6；[工具说明](../../../../tools/vfx/README.md)。
- [风格](../../STYLE.md)；[manifest 字段](../../../README.md)；[共用发出方](../emitters/palm/emitter-plate.yaml)。

## 本文新增术语/约定

仅新增 manifest 所列 7 个 `vfx_*` 资产 ID；四个 `mv_*` 均复用既有定义，无新玩法术语。JSON 是 YAML 的派生物。

## 待决事项 / 依赖

- 审美默认沿用本批金墨候选。白底反解后淡金偏饱和，仍待作者确认；不因检查通过升为 approved。
- 三套原图角落为 254–255 近白，按阈值 250 去底；有效留白最少 31 / 26 / 28 px，略低于 32 px 建议。8 px 边框为空，主体无裁断，默认保留原件。
- 原帧根部存在位移，以各帧锚点对齐；不声称原件漂移≤2 px。四帧叠化连续性与轮廓变化**（待实测）**，默认沿用。
- 自身招的掌图仅为独立示意，运行时须接角色自身挂点；不得据掌图把武学改成掌法，也不得据圆环扩大 AoE。
- 颜色、局部长度、移动端混合、CDN 模块可达性及实际播放均待后续验收，默认维持本配置；原著待考见前文，无基准修改提案。

# 玉女心经 · 两段式招式特效候选

| 项 | 内容 |
|---|---|
| 归属 | 表现层资产包；管线唯一归属见 `docs/design/23-projection-vfx-pipeline.md` |
| 上游 | 作者两段式决定；`assets/default/STYLE.md`；道家图鉴 §3.3 玉女心经卡 |
| 引用而不重定义 | 武学品阶 / 性质 / 招式范围见图鉴；几何 / 节奏见 design/23 §4–5 |
| 标注约定 | 造型（原创扩展）；小说逐字核对（待考）；浏览器 / 真机（待实测）；制作参数【建议值】 |

## 结论先行（TL;DR）

三张内置 `image_gen` 白底原料各切四帧，共十二张 RGBA。散热复用家族套，
两绝招各用专属套；三招均无 `projection:true`。共用掌图只作独立演示的发出方。
所有条目为 `candidate`；可直接查看各招 `peak.png` 和 `demo.html`，不代表作者已批准。

## 1. 原料与造型依据

| 套 / 目录（位于 `effect/`） | 用途 | 造型与候选 |
|---|---|---|
| `family` | 散热 / 同门共用语汇 | 青气回卷、散为薄烟；1 候选，选 1 |
| `mv_yunvxinjing_hufa` | 护法绝招 | 双弧护持、空心相抱；1 候选，选 1 |
| `mv_yunvxinjing_bingxin` | 冰心玉壶绝招 | 青气勾出虚壶与清明内息；1 候选，选 1 |

三者均为**（原创扩展）**。图鉴记载练功须散热、有人护法，并明确招名及效果为原创扩展；
本包只引用该叙事，不声称原著出现青色气场、实体玉壶、冰块或护盾。
青色来自 `nature: yin` 与风格约定；没有已核实的原著颜色覆盖。
**（待考）**：三联 / 广州修订版《神雕侠侣》古墓传授、花丛合练与散热护法段落的逐字措辞；
原文有无显色描写、版本差异仍由上游考据，不附臆测引文和回目。

每套的 `generation.json` 保存实发完整提示词、原始路径、原件哈希和候选数。
工具未返回底层图像模型标识，登记为未报告；没有调用其他图像供应商，也没有输入参考图。
源图均为 1536×1024、2×2 格；每帧 768×512，显式矩形切分，不紧裁、不改源图。
四阶段图序为初聚、盛势、持续、消散；最后完全透明由时间包络完成。

## 2. 量图、长度与节奏

峰值原料为第二格。根宽取锚点 x±4 列中 `min(R,G,B)<250` 的纵向可见并集；
参考长取该格右侧可见边界减根部 x。逐帧锚点在 EffectSet 中显式保存。

| 套 | 峰值锚点 | 根宽核算 | 参考长核算 |
|---|---|---|---|
| 家族 | `[148,255]` | `357−136+1=222 px` | `727−148=579 px` |
| 护法 | `[160,257]` | `385−120+1=266 px` | `709−160=549 px` |
| 冰心 | `[180,281]` | `365−187+1=179 px` | `715−180=535 px` |

三招共用画幅 1536×1024、纸底 `#EFE6D2`、发出点 `E=[780,580]`、方向 0°。
掌图经相对路径引用 `../emitters/palm/emitter-plate.yaml`；其掌面宽为 320 px，
缩放 0.6，故实际根宽 `320×0.6=192 px`。没有复制、重新抠图或修改共用池。
按 design/23 §4.1：`sx=L/reference_length_px`，`sy=192/root_width_px`，`scale=[1,1]`。

| 招式 | 图鉴语义 / 演示距离 | L【建议值】 | sx / sy | 节奏【建议值】 |
|---|---|---:|---|---|
| 散热 | `aoe_self`；`range_hex=0` | `0.75×256=192 px`，局部 | `192/579` / `192/222` | pulse：`0.10+0.15+0.25+0.10=0.60 s` |
| 护法 | `aoe_single`，1 格友方；`range_hex=1` | `1×256=256 px` | `256/549` / `192/266` | wave：`0.15+0.20+0.40+0.15=0.90 s` |
| 冰心玉壶 | `aoe_allies r2`；默认自身中心，`range_hex=0` | `1.25×256=320 px`，局部 | `320/535` / `192/179` | wave：同上，0.90 s |

256 px/格只是演示标尺；散热和冰心的 0.75 / 1.25 为局部画幅比例，不是新增玩法射程。
冰心卡未单列基础 `range`，本包按自身中心显示，r2 仅保留为友方范围语义；不把 r2 换算成射束。
运行时逐目标效果须由已解算的友方事件安排，不从虚壶轮廓生成受益格、护盾或伤害。
本门不应用 `projectionSpreadSteps` 或 +2/+4 射程；palm 也不把 `inner` 改成掌法。
峰值相位分别为 `(0.10+0.15)/0.60=5/12`、`(0.15+0.20)/0.90=7/18`。
均 crossfade、凝聚缩放 0.95、漂移 0、方向软带 0.08；不会把收招 900 / 1200 CT 换成演出秒数。

## 3. 切帧与复现

采用 `white_key`、白阈值 250、`key_full_8bit=128`、线性去白、straight RGBA、normal 混合。
默认 `white_luma / opaque_luma=0.2` 在深青色像素的白底重建误差最高 6/255，
因此改用现有色键参数；原件与造型不变。最终质量数字见 `verification.json` 和各套 `quality.json`。
预览的黑 / 灰 / 白三底均保留；黑底青色更浓，这是白底分解后的候选观感，不声称恢复原生透明度。

从仓库根目录复现（将变量换为上表的套 / 招式名）：

```sh
set_name=family
move_name=mv_yunvxinjing_sanre
python3 -B tools/vfx/cut_frames.py --config assets/default/vfx/sk_yunvxinjing/effect/$set_name/effect-set.yaml --output assets/default/vfx/sk_yunvxinjing/effect/$set_name/effect-set.yaml --root assets/default/vfx/sk_yunvxinjing --preview
python3 -B tools/vfx/compose.py assets/default/vfx/sk_yunvxinjing/moves/$move_name/composition.yaml --root assets/default/vfx
python3 -B tools/vfx/build_demo.py assets/default/vfx/sk_yunvxinjing/moves/$move_name/composition.yaml --root assets/default/vfx
```

## 参考资料

- [道家图鉴](../../../../docs/design/catalog/skills-daojia.md) §3.3：三招身份与原著边界。
- [制作管线](../../../../docs/design/23-projection-vfx-pipeline.md) §2–6；[工具说明](../../../../tools/vfx/README.md)。
- [风格约定](../../STYLE.md) 招式行；[资产字段](../../../README.md)。

## 本文新增术语/约定

无新增玩法术语。六个 `vfx_*__base01` 资产 ID 唯一登记于 `manifest.yaml`；
Composition JSON 为脚本派生物，YAML 为制作参数真值。提示词要求与实际量图值分开记录。

## 待决事项 / 依赖

- **替下游给出的建议值**：局部 L=192 / 320 px、标尺 256、画幅与发出点见 §2，默认沿用。
- **本文依赖的上游事实**：yin / inner、两绝招与一普通招、护法 1 格与冰心 r2 见图鉴；默认不加外放。
- **对基准的修改提案**：无。
- **原著考据待办**：散热护法段落及颜色逐字核对见 §1，默认所有显形均为原创扩展。
- **开放问题（附默认值）**：默认保留三套候选、冰心自身中心演示；作者决定后才变更 candidate。
- **（待实测）**：原料锚点纵向差最大 7 px，已逐帧对齐；原图没有满足漂移≤2 px 的建议，不据此宣称动画无重影。
- **（待实测）**：浏览器 WebGL 连续播放、CDN、手机性能与真实角色挂点，默认由下游验收；静态检查不代替真机。
- 通用 demo 标题仍写“外放样例”；本包三招实际无外放，文字问题交工具任务统一处理。

# 天山六阳心法 · 五招特效候选

| 项 | 内容 |
|---|---|
| 归属 | 本武学效果原料、Composition 与独立演示；玩法定义仍归图鉴 |
| 上游 | `docs/design/catalog/skills-bulu-01-tianlong.md` §3.1；`docs/design/23-projection-vfx-pipeline.md` §2–§6；`assets/default/STYLE.md` |
| 引用而不重定义 | 招式身份、性质、目标与经脉路线只引用图鉴；合成公式只引用 design/23 |
| 标注约定 | 可见造型均为（原创扩展）；美术参数为【建议值】；浏览器与真机为（待实测） |

## 结论先行（TL;DR）

三张 `image_gen` 白底四帧原料，切成十二张 straight RGBA；五招各有 YAML、JSON、峰值 PNG 和 Three.js HTML。
三记普通招复用 family，两记绝招各有独有原料。每张只生成一次，1 候选选 1，全部登记为 `candidate`。
五招均为自身支援、`projection:false`，用局部气场表现；共享 palm 仅为独立演示发出方，不重定经脉出口。

## 1. 原料与依据

| 效果套 | 原创造型 | 复用范围 |
|---|---|---|
| `effect/family/` | 朱赤呼吸回环、宽根雾气与中空护息弧 | 吐纳、换息、护体 |
| `effect/mv_tianshanliuyangxinfa_hemai/` | 六股气带交织、横向环绕，表达合脉稳身 | 六合脉 |
| `effect/mv_tianshanliuyangxinfa_guiyuan/` | 六缕向心旋纹、小型赤色凝聚核，表达回元 | 六阳归元 |

图鉴 §3.1 已将独立心法名、五招和机制标为**（原创扩展）**。本套只借用该卡的六阳掌 / 灵鹫传承关联，未引用原著句子。
朱赤主色消费 `nature:yang`，淡赭作透明层次；并无已核对的原著可见颜色或气场形状描写，全部视觉也属**（原创扩展）**。
原著逐字考据尚未进行；如需文字背书，须核对三联 / 广州修订版《天龙八部》中童姥向虚竹传六阳掌及灵鹫宫石壁相关情节（待考），不补造回目。
六股是招名意象，不表示六条真实经脉；旋纹不表示额外攻击、反伤或治疗段。

完整实发提示词在 `source_requests.yaml` 和 manifest 的 `prompt`；未使用参考图片输入。源 PNG 逐字节保存工具输出，未重绘、调色或缩放。
工具未返回底层模型名 / 生图 effort，manifest 据实登记为未公开；未将会话模型误写为图像模型。

## 2. 切格、根部与合成参数

每张源图 1536×1024，2×2 格，每格 768×512；从左到右、从上到下切分，无隐式裁紧。
phase=`[0,0.25,0.5,1]`；使用 `white_key`、cutoff=250、key_full=163、线性去白；`normal` 混合保留朱赤墨色。
原件视觉为白底，但不是逐像素 `#FFFFFF`：family / hemai 的 32 px 边带为 253–255；归元含少量 248–249 淡尾像素。
保留生成原件，用既定阈值去底；十二帧 8 px 边框 alpha 残留为 0，三底预览供复核，不把近白原件冒称精确纯白。

| 套 | 根部 x | 四帧根部 y | 参考长 / 根宽（px） |
|---|---:|---|---:|
| family | 180 | 234.2 / 243.2 / 238.2 / 242.1 | 522 / 230 |
| hemai | 180 | 236.2 / 236.8 / 235.1 / 235.5 | 489 / 169 |
| guiyuan | 180 | 216.4 / 214.1 / 215.7 / 215.7 | 478 / 161 |

测量法：在原图每格 x=176..183 的窄带，用 `255−min(R,G,B)` 的逐行均值求色量中心，y 取一位小数近似。
参考长取第三帧 `min(R,G,B)<240` 的最右像素横坐标减 180；根宽取该窄带均值 <200 的首末行跨度（含两端）。
源图 family 根部中心最大漂移约 9 px，超过 design/23 的 2 px 建议；用逐帧锚点对齐 E，未移动或改画原图。连续过渡仍（待实测）。

共享 `../emitters/palm/emitter-plate.yaml` 原样引用：源点 `[850,704]`、宽 320、方向 `[1,0]`。
本套 E=`[680,560]`，角度 0°，发出方缩放 0.55，掌面截面=`320×0.55=176 px`；整图 1536×1024，底色 `#EFE6D2`。
依 design/23 §4.1，`sx=L/reference_length_px`，`sy=176/root_width_px×scale[1]`。根部变换为 E，`drift_fraction=0` 全程连源。
例如归元 `sx=384/478≈0.8033`、`sy=176/161≈1.0932`；family 吐纳 `sx=240/522≈0.4598`、`sy=176/230×0.9≈0.6887`。

| 招式后缀 | 绝招 | 外放 | 效果套 | 局部长 L（px） | 横向修正 | 节奏 |
|---|---|---|---|---:|---:|---|
| tuna | 否 | 否 | family | 240 | 0.9 | pulse / 0.60 s |
| huanxi | 否 | 否 | family | 288 | 0.9 | pulse / 0.60 s |
| huti | 否 | 否 | family | 336 | 1 | pulse / 0.60 s |
| hemai | 是 | 否 | hemai | 384 | 1 | wave / 0.90 s |
| guiyuan | 是 | 否 | guiyuan | 384 | 1 | wave / 0.90 s |

上述局部长为**【建议值】**：沿用 128 px 独立标尺，版面系数 1.875 / 2.25 / 2.625 / 3，分别乘出 240 / 288 / 336 / 384；系数不表示格数。
图鉴只给自身目标，未给 `range.max` 或 `projectionSpreadSteps`；故所有 `range_hex=0`，按 design/23 §4.2 显式给正的局部长，不推导攻击距离。
普通 `0.10+0.15+0.25+0.10=0.60 s`，绝招 `0.15+0.20+0.40+0.15=0.90 s`，直接用 §5.2 模板；不换算 recovery / CT。
峰值取 phase 0.5，即普通 0.30 s、绝招 0.45 s；关闭方向推进遮罩，用根部缩放和透明叠化呈现凝聚、回息。

## 3. 复现与交付

在仓库根执行；`--root assets/default/vfx` 容纳共享池引用。已有合格切帧不必重复切。

```sh
suite=assets/default/vfx/sk_tianshanliuyangxinfa
for effect in "$suite"/effect/*/effect-set.yaml; do
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/cut_frames.py --config "$effect" --output "$effect" --root assets/default/vfx --preview
done
for composition in "$suite"/moves/*/composition.yaml; do
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/compose.py "$composition" --root assets/default/vfx
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/build_demo.py "$composition" --root assets/default/vfx
done
```

重新构建后须同步 manifest 对应派生文件的 size / bytes / SHA-256。JSON 为工具导出，不手工修改。
每套原料附黑 / 灰 / 白底预览与 `quality.json`；每招附 `peak.png` 和自包含 HTML。唯一显式外链为工具固定的 three r186 importmap。
共享掌图没有复制入本套；HTML 内嵌纹理是打包派生，原始共用池文件未改动。

## 参考资料

- 武学事实：`docs/design/catalog/skills-bulu-01-tianlong.md` §3.1、§4。
- 制作契约：`docs/design/23-projection-vfx-pipeline.md` §2–§6；`tools/vfx/README.md`。
- 风格与元数据：`assets/default/STYLE.md` 招式行；`assets/README.md`。

## 本文新增术语/约定

无新增玩法术语或 ID。素材 ID 共八个：三条 `vfx_sk_tianshanliuyangxinfa__*base01` 原料、五条 `vfx_mv_tianshanliuyangxinfa_*__base01` 招式，完整清单见 manifest。

## 待决事项 / 依赖

- 美术审批：默认保留赤色水墨回环 / 交织 / 归元三套候选，不把检查通过升为 approved。
- 局部长度与宽度：默认沿用表中【建议值】，只控制独立演示；游戏人物的自身气场挂点由接入方处理。
- family 原件中心漂移：已通过逐帧锚点补偿；四帧过渡是否需第二候选，默认先验收现有一候选，浏览器连续性（待实测）。
- 图鉴 / bindings 的 `emitter:null` 与本任务强制 palm 示意的区别：默认不改绑定，交协调者决定运行时自身气场挂点。
- 工具标题仍写“外放样例 / 外放招式预览”：不影响五招 `projection:false`；默认报告工具维护者改中性文案，本任务不改工具。
- 原著颜色与轮廓无逐字依据，默认保持原创标注；浏览器 WebGL、CDN 可达性、手机性能与真实人物接入均（待实测）。

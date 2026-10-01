---
asset_id: rig_male_std__back34__hand_R
kind: rig_part
set: male_std
view: back34
part: hand_R
name: 男性标准体 · back34 · 右手
runtime_parts: hand_R
canvas: 40x62
pivot:
- 20
- 6
pivot_desc: 顶中（腕点）
child_joint: grip_R:(20,33) 握点 0.56L
length_m: 0.19
tintable: skin（默认不换色）
output: assets/default/rig/male_std/back34/hand_R.png
manifest: assets/default/rig/male_std/manifest.yaml
background: 透明 RGBA
references:
- path: assets/default/rig/male_std/ref_back34.png
  use: 同视图全身参考图：唯一图片输入，从中截取 / 重绘该部件，保持衣着配色一致
- path: docs/tech/09-character-rig.md
  use: §1.2 部件表（画布 / pivot / 子关节）、§1.4 z 序与描边、§6 manifest
status: ready
order: 1
---

# 男性标准体 · back34 · 右手（`hand_R`）

## 要点

| 项 | 内容 |
|---|---|
| 运行时部件 | hand_R |
| 画布 / pivot | 40×62 px；pivot (20,6) 顶中（腕点） |
| 子关节 | grip_R:(20,33) 握点 0.56L（男 front34 模板像素，女 ×0.9529；本视图可因剪影改画布，关节米长不变） |
| 骨段长度 | 0.190 m |
| tint 槽 | skin（默认不换色） |
| 视图 | 后 3/4 视图：面向屏幕左上，可见后脑与背，近侧为右侧 |

## 提示词

```text
为《金庸群侠传·天书录》default 风格包绘制 男性标准体（male_std）分层部件母版中的单个部件：右手（hand_R），后 3/4 视图：面向屏幕左上，可见后脑与背，近侧为右侧。
以同视图的全身参考图为唯一图片输入，只画这一个部件：裁出或重绘它在参考图里的样子（衣着、配色、墨线风格完全一致），其余身体部位一律不画。
画布 40×62 px（256 px/m），部件轴向竖直摆正；pivot 在顶中（腕点）（约 (20,6)），子关节 grip_R:(20,33) 握点 0.56L，骨段长度约 0.190 m。关节两端各留 6–10 px 与相邻部件重叠的余量（关节处圆润收口，不画成平切）。
画风：2 px 深色墨线描边（烘焙在图里）、低饱和、光源左上、阴影右下；可换色区域为 skin（默认不换色），其余保持素色。真正的透明 RGBA 背景，部件外 alpha=0；无地面、无投影、无光晕。
不画文字、标记点、辅助线；pivot 与关节位置只在 manifest 里登记，不画进图。
排除项：不要文字、伪字、水印、签名、UI；不要背景、地面、投影、光晕、粒子、半透明雾；不要兵器、配饰、披风（它们是另外的装备层）；不要演员脸、具体影视游戏造型；不要日韩动漫、欧美奇幻、赛博朋克；不要透视畸变、多视图拼贴、主体截断；不要抗锯齿以外的柔边或发光描边。
```

## 排除项

不要文字、伪字、水印、签名、UI；不要背景、地面、投影、光晕、粒子、半透明雾；不要兵器、配饰、披风（它们是另外的装备层）；不要演员脸、具体影视游戏造型；不要日韩动漫、欧美奇幻、赛博朋克；不要透视畸变、多视图拼贴、主体截断；不要抗锯齿以外的柔边或发光描边。

## 质检要点

- 只含这一个部件，透明底，alpha 同时含 0 与 255。
- 轴向竖直，pivot 约在 (20,6)；两端留 6–10 px 重叠余量。
- 与同视图全身参考图的衣着、配色、墨线一致；描边 2 px。
- 不含文字 / 辅助线；交 `tools/rig/make_parts.py` 裁边与定枢轴，`preview.py` 看姿势条带无断裂。

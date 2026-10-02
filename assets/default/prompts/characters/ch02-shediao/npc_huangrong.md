---
asset_id: por_npc_huangrong__ch02_youth_bangzhu_base
subject_id: npc_huangrong
name: 黄蓉
book: ch02_shediao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_bangzhu_base.png
manifest: assets/default/character/female/ch02/manifest.yaml
references:
- path: generated_images/exec-b039a5d5-093e-4883-9546-2e9da034a7f5.png
  use: 已实际查看本角色候选1，原始PNG与请求SHA可核实；脸部身份及衣装保留，只纠正仍侧倾的头颈为完全端正正面，不旋转整幅。尚未合格，不自行approved。
- path: .agents/coord/imagegen-reference/identity-20261001/huangrong_1983_wengmeiling.jpg
  use: 第一身份参考：已实际查看来源页1983翁美玲黄蓉角色图；取本人可辨认五官关系，年轻化为项目少女阶段。必须正面头竖直，忽略照片歪头、蓝衣、摄影噪声和背景。来源证据见同名.source.json。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看并核验项目女性基线，只取低饱和色卡和柔光；不取脸、骨相、年龄、头饰、衣服、姿态。原approved不改。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户水墨参考，只取背景淡墨山水和留白，忽略人物脸、皮肤、衣服与体态。
status: ready
realism_revision: user_identity_pose_20261001
---

# 黄蓉 · 人物写实修正

## 人物与阶段

- subject_id：npc_huangrong
- book：ch02_shediao
- gender：female
- age_variant：youth

## 本轮人物写实规范

候选1/2面容改善但仍侧倾，均未完成；本轮候选3/4只修正头部端正正面和颈部轴线，保持翁美玲版少女黄蓉身份。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_huangrong__ch02_youth_bangzhu_base/prompt-b59b7003f1645343bd80c1120f4685c1e22d4c47ffef84ff0b44bec6fa164dba.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
EDIT THE FIRST INPUT ILLUSTRATION. Preserve this specific Huang Rong face identity, clothing, bamboo staff, body and gentle background. The correction is REQUIRED: straighten her head and neck into an upright, truly frontal portrait. Both pupils and inner eye corners must lie on a horizontal line parallel to the top edge of the canvas. The nasal bridge, philtrum, chin midpoint and throat center must follow one vertical line. No roll of the head toward either shoulder, no cheek-forward diagonal pose. Keep the camera and horizon level. Redraw the head/neck anatomically in the upright pose; do not rotate the whole canvas. Maintain the 1983 Huang Rong facial proportions from the second actor reference but IGNORE its tilted posture. There is no story reason for a head tilt in this basic portrait. Do not make her face longer or merge her face with the female style reference. Retain the original youthful character and fully opaque modest clothes.

Create a refined, beautifully REALISTIC hand-painted Chinese wuxia full-body character illustration. The human figure has natural fine skin, coherent solid anatomy, soft continuous light and shadow, intact tailored opaque cloth, clean silhouette, and few broad weight-bearing folds. No fragmented ink, paper erosion, white flecks, torn hems or mottled skin on the figure. Reserve delicate ink washes only for the background. Not a photo or 3D render.

本图为独立基础立绘：黄蓉 npc_huangrong，《射雕英雄传》ch02，君山接掌丐帮之后、铁掌受伤之前。她为十六至十七岁观感的未成年少女，清丽机敏、身形轻巧而非成年曲线。此次用户明确指定翁美玲版本黄蓉的角色面孔作为本人身份参考，覆盖旧稿禁止演员脸的限制。

本次第一输入是已实际查看、面容可用但尚未通过端正姿态检查的本角色候选1，需要纠正头颈；第二输入是来源页面明确标注1983版翁美玲黄蓉的实际角色照片。以这张本人照片的独立五官结构构建年轻黄蓉：短小鹅蛋至心形脸、饱满前额、灵动明亮而有真实大小的杏眼、清楚眼窝、自然细眉、小巧而有体积的鼻头、弓形上唇与自然饱满下唇、利落小下颌。保持其可辨认的俏丽、聪慧与有主见的神情，不把脸重新平均成其他女侠。用真实少女年龄的柔和面颊适当年轻化，不能成人化。照片只提供黄蓉本人身份与神态，不沿用照片中倾斜的头部、蓝色衣装、摄影背景、裁切或旧胶片噪点。
第三输入是项目女性基线，只取低饱和色卡与柔和光感；完全忽略基线人物的脸、眼型、鼻唇、年龄、发饰和站姿。第四输入用户图只取浅淡水墨山水背景与留白，不取其中女子的面孔、服装和肤质。第一身份参考优先，绝不融合不同角色的脸。

构图与姿态：正面面对观者，头部竖直端正，双眼处于同一水平线上，颈部自然与胸骨身体轴线对齐；镜头平视水平，绝不歪头或倾斜镜头。肩颈放松，双脚稳妥落地，眼神机敏自信带轻微聪慧笑意，神态通过眉眼表达。单人单视图完整全身，头顶到双鞋以及竹棒两端完整入画，留自然边距。竖幅2:3，不机械追求88–92%或某一头身数。

衣装为完整暖白汉式交领右衽窄袖衫、浅桃色短褙子、齐腰浅青灰长裙和平底布鞋。完全不透明，领口胸颈遮蔽，剪裁明确，宽缓连续衣褶；不是破旧碎布。黑发束成简洁双侧小髻并收拢余发，只少量小珠饰，不照搬照片夸张发式。桃花岛软猬甲贴身内穿在内衫内，可仅由内领一点细密护层暗示，外衣完整，不掀衣展示，不画成外穿刺猬甲。

只持一根细长青绿竹质打狗棒 eq_dagoubang，竹节清楚且天然轻微弯曲，无金属棒头。一手低握竹棒在身体外侧，另一手自然轻扶腰侧；手指和竹棒连接可信，竹棒完整不穿身、不遮脸，不添加剑或其他武器。人物处于健康接掌时期，尚无铁掌伤病。

背景采用不透明暖浅灰底、远处极淡水墨山石与空疏水岸轮廓，主体占主要画面。不要浓密实景、花海或建筑压过人物。背景纸纹与淡墨只在人物轮廓外，不透进脸、皮肤、服饰和鞋。柔和自然主光，精细清楚的脸、手、布料和器物，面容和身体的连续写实质感统一。

输出目标2048×3072 PNG但接受工具原生2:3尺寸，保留原始PNG字节、不透明。两次独立候选择一；文件与manifest验证后仍candidate，不自动approved。人物阶段与器物依据项目原角色稿和名录，具体衣色、静态站姿与背景为美术补足，不声称逐字原著插图。新规范不回写历史请求。

完整排除项：不要 head tilt、歪头、头靠向肩、侧倾脖子、斜脸卖萌、Dutch angle、倾斜镜头、非必要侧脸；不要把王语嫣或任何其他参考人物的脸混入黄蓉，不做统一尖下巴网红脸。不要照搬剧照歪头、摄影背景、蓝衣或演员成年年龄；保留本项目十六至十七岁少女自然骨相和端庄衣装。不要中年母亲造型、成人曲线、浓妆、深领露腰、透衣或性感化。不要乞丐男装、铁掌伤病容、外穿倒刺甲、金铃索、白手套、佩剑、金属权杖。不要多肢多手多脚、多指、粘手、错接手腕、手棒融合、头足竹棒裁断。不要人物本体飞白、纸屑侵蚀、碎墨断裂、皮肤纸纹、破布、撕裂衣角、浮空布条和过密零碎褶；背景墨迹不能侵入人物。不要照片、三维塑料皮肤、动漫大眼、武器神光、法阵、现代物品、日式刀服、欧式甲胄、第二人物、画面文字、印章logo和新增水印；保留工具溯源。
```

## 排除项

不要 head tilt、歪头、头靠向肩、侧倾脖子、斜脸卖萌、Dutch angle、倾斜镜头、非必要侧脸；不要把王语嫣或任何其他参考人物的脸混入黄蓉，不做统一尖下巴网红脸。不要照搬剧照歪头、摄影背景、蓝衣或演员成年年龄；保留本项目十六至十七岁少女自然骨相和端庄衣装。不要中年母亲造型、成人曲线、浓妆、深领露腰、透衣或性感化。不要乞丐男装、铁掌伤病容、外穿倒刺甲、金铃索、白手套、佩剑、金属权杖。不要多肢多手多脚、多指、粘手、错接手腕、手棒融合、头足竹棒裁断。不要人物本体飞白、纸屑侵蚀、碎墨断裂、皮肤纸纹、破布、撕裂衣角、浮空布条和过密零碎褶；背景墨迹不能侵入人物。不要照片、三维塑料皮肤、动漫大眼、武器神光、法阵、现代物品、日式刀服、欧式甲胄、第二人物、画面文字、印章logo和新增水印；保留工具溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_huangrong__ch02_youth_bangzhu_base.prepared.json`。

---
asset_id: por_npc_chenglinsu__ch13_youth_alive_base
subject_id: npc_chenglinsu
name: 程灵素
book: ch13_feihu
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch13/por_npc_chenglinsu__ch13_youth_alive_base.png
manifest: assets/default/character/female/ch13/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_3-1.png
  use: 第一且唯一人物身份输入：1996原版游戏程灵素HDGRP_3-1，56×58原PNG已实际view、姓名配对沿既有审计。读取紧凑柔和小椭圆脸、细弯眉、横向而纵向开度有限的眼形、较短自然鼻口组合、软下颌与短圆下巴；正面化为朴实机敏少女，鼻翼和鼻尖保留实在体积。像素不支持精确正面测量。原侧转、乌发绿带黄绿领不复制，服饰发质遵循文字。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入只提供背景的暖浅灰纸、远山淡墨与留白；完全忽略画中女性，包括脸、身形、衣服、发型、饰物、姿势和人物绘制比例。不得把背景样图的面容或白色纱裙移植给程灵素。
status: ready
realism_revision: user_identity_face_rebuild_20261001
---

# 程灵素 · 人物写实修正

## 人物与阶段

- subject_id：npc_chenglinsu
- book：ch13_feihu
- gender：female
- age_variant：youth

## 本轮人物写实规范

新策略新轮：仅原游戏本人头像＋用户背景两输入，从紧凑脸廓/横向克制眼裂/完整鼻部体积/短圆下巴独立重建全身。少女白衫蓝裤、微黄稀发、淡菜色、未燃药烛与布药包；正面头直眼平。旧全身候选和女性基线均不进入输入。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-face-rebuild-20261001/backups/por_npc_chenglinsu__ch13_youth_alive_base/prompt-1a8dcf3a251870efc455a186ed0fe4dd68a2a1679cd727d2493a8b4fa03f83a9.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
NEW FULL-BODY CHARACTER REBUILD, starting from the face in INPUT ONE. INPUT TWO is BACKGROUND ONLY: ignore its entire woman. Invent no beauty-template face. FRONT-FACING, head and neck UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, level camera and neutral chin. No head tilt. No Dutch angle.

程灵素（npc_chenglinsu），清乾隆《飞狐外传》药王庄相识后、随胡斐救治苗人凤的生前阶段。十六七至十八岁观感的纤瘦少女，窄肩小身量，安静敏锐、有主见。她的脸朴实自然，轻淡菜色，眼神机敏；保留稀疏略黄褐头发。不成人化，不预设死亡或后续改命。

先按第一输入重建本人脸，再完成全身：紧凑的小椭圆脸，颊侧柔和但有真实体积；下颌缓缓收束，接短、钝圆且有宽度的下巴，不收成一个V尖。细而柔弯的眉，眼裂以横向延伸为主、纵向开度克制，上眼睑自然遮住部分虹膜，目光清醒而不瞪圆。鼻梁较短且低调，但必须画出完整鼻侧、鼻翼和圆鼻尖的实在体积，绝不把鼻子简化成小按钮；闭合嘴唇纤小而有厚度，唇线自然，不刻意嘟唇。面部关系来自这一张小头像的可见轮廓；正面化采用合理真人解剖，不增添长下半脸或细长高鼻。让骨相、眼睑开度、鼻部体积和下巴同时建立独立身份，不能仅靠肤色或衣服区分。

头发朴素收拢，一根细银簪固定。干净暖白素布窄袖衫、素蓝长裤、平底布鞋；两条裤腿分明，衣物宽松、完整不透明。若见交领，为本人左襟盖右襟。无裙袍、薄纱、珠宝和飘带。腰侧一个小灰褐布药包，短系带真实连到腰带。

正面稳立、肩颈放松，两手在腰腹前：一手轻持一支小型未点燃的七心海棠药烛，另一手隔小布垫托烛底。五指、烛身、可见未燃烛芯和布垫彼此分开。药烛仅作虚构故事道具，无火烟毒雾、无配方药签；不画病人或施救动作，无兵器。

人物精细写实、温润有体积，面部和双手清楚，衣料和道具连续坚实、轮廓完整。柔和漫射光、少量自然承重褶皱；不靠碎墨、风化或纸屑画人物。第二输入只取背景：暖浅灰纸底、极淡远山墨色和留白，墨迹停在人物之外。单人单视图完整全身，头、双手、双鞋和道具端点入画，自然边距，原生2:3不透明PNG，目标2048×3072；接受真实原生2:3尺寸，保留原字节不缩放重编码。此新轮默认两张独立candidate，待自查和用户审核。

完整排除项：不要 head tilt、Dutch angle、歪头、斜眼线、俯首、仰头、侧脸回眸或倾斜镜头；不要背景图女性的脸、身体、发型或服装，不复用任何旧全身候选模板。不要大圆杏眼、巨虹膜、纵向瞪大的眼裂、按钮小鼻、鼻翼消失、尖V下巴、统一樱桃唇、网红女主脸、精灵尖颌、浓妆、美颜磨皮或性感成熟身材；不要把朴素少女丑化为病危、饥饿、毒斑或死亡形象。不要霍青桐式拉长下半脸与长鼻线，不把改变仅做成换肤色、换发饰。不要复制像素块、游戏边框、侧转角度、浓密乌发、绿发带和黄绿领。不要裙袍、透明薄纱、低领贴身衣、珠花耳坠、白手套、武器、针筒、现代服饰物件、异域奇幻甲；不要火焰、烟雾、发光药液、可读药方、伤害或施救动作。不要多人物、多视图、额外肢体、粘连多指、手烛融合、悬空药包、错襟或镜像，勿裁断头足与物件。不要人物碎墨、飞白缺块、纸纹透衣、破布、毛边、模糊脸、雾吞轮廓、3D塑料感、强泛光；不要文字、题款、印章、logo或装饰水印，保留工具原有溯源标识和元数据。

FINAL CHECK: INPUT ONE alone defines Cheng Lingsu's face. Compact soft oval, restrained horizontal eye openings, a fully formed natural nose, soft jaw and short rounded chin. Reconstruct the full figure independently. Frontal upright head, level eyes; no head tilt or Dutch angle.
```

## 排除项

不要 head tilt、Dutch angle、歪头、斜眼线、俯首、仰头、侧脸回眸或倾斜镜头；不要背景图女性的脸、身体、发型或服装，不复用任何旧全身候选模板。不要大圆杏眼、巨虹膜、纵向瞪大的眼裂、按钮小鼻、鼻翼消失、尖V下巴、统一樱桃唇、网红女主脸、精灵尖颌、浓妆、美颜磨皮或性感成熟身材；不要把朴素少女丑化为病危、饥饿、毒斑或死亡形象。不要霍青桐式拉长下半脸与长鼻线，不把改变仅做成换肤色、换发饰。不要复制像素块、游戏边框、侧转角度、浓密乌发、绿发带和黄绿领。不要裙袍、透明薄纱、低领贴身衣、珠花耳坠、白手套、武器、针筒、现代服饰物件、异域奇幻甲；不要火焰、烟雾、发光药液、可读药方、伤害或施救动作。不要多人物、多视图、额外肢体、粘连多指、手烛融合、悬空药包、错襟或镜像，勿裁断头足与物件。不要人物碎墨、飞白缺块、纸纹透衣、破布、毛边、模糊脸、雾吞轮廓、3D塑料感、强泛光；不要文字、题款、印章、logo或装饰水印，保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-face-rebuild-20261001/por_npc_chenglinsu__ch13_youth_alive_base.prepared.json`。

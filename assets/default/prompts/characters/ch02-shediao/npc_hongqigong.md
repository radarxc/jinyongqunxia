---
asset_id: por_npc_hongqigong__ch02_elder_bangzhu_base
subject_id: npc_hongqigong
name: 洪七公
book: ch02_shediao
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch02/por_npc_hongqigong__ch02_elder_bangzhu_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: generated_images/exec-e30a7096-64e1-4323-863f-e1ee43b7cdd2.png
  use: 第一编辑底图，旧候选4，已实际查看，右掌展开但错误有5指。仅将右食指齐掌移除为愈合旧缺失，其他画面保留。
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/hongqigong_1983_liudan_sina2001.jpg
  use: 同人1983刘丹面部连续性参考，保持编辑底图已完成面容，不复制参考手部。
status: ready
realism_revision: user_nine_finger_hand_repair_20261001
---

# 洪七公 · 人物写实修正

## 人物与阶段

- subject_id：npc_hongqigong
- book：ch02_shediao
- gender：male
- age_variant：elder

## 本轮人物写实规范

用户最新纠正九指为身份必需，优先修正原候选4本人右手食指；只生成1张局部编辑，不把其他原4次历史改写。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/hand-repair-20261001/backups/por_npc_hongqigong__ch02_elder_bangzhu_base/prompt-8931f1a8c08c1970f239e447a574f5d336be38cbf5772f813c7d2963460a75db.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Edit IMAGE 1, preserving the same complete full-body Hong Qigong illustration, face, upright head, clothing, staff, gourd, feet, colors, background and composition. Make ONLY this localized anatomical correction to his own RIGHT HAND, the open palm on the VIEWER LEFT.

His RIGHT INDEX FINGER is absent flush with the palm: this is the canonical Nine-Fingered Divine Beggar. In image 1 the open palm incorrectly has five digits. REMOVE exactly the FIRST LONG FINGER BESIDE THE THUMB — the leftmost of the four downward-pointing long fingers, approximately at x=260, y=803 in the 1024x1536 original. This is the long digit directly below and beside the outward-pointing thumb, NOT the thumb itself. Replace that one entire finger down to its palm base with a smooth, old, completely healed natural skin contour and background where its former length was. No blood, no fresh wound, no visible bone, no bandage.

Keep the outward-pointing THUMB intact. Keep the OTHER THREE long fingers intact: MIDDLE, RING, and LITTLE, approximately x=282,302,320. Keep their separate recognizable lengths and joints. The corrected right palm must visibly have ONE thumb plus THREE long fingers = FOUR digits total, with a clear natural gap between thumb and middle finger where the index used to be. Do not merely bend the index behind the palm, shorten it into a visible stub, obscure it with clothing, or fuse it with another finger. The missing digit is the INDEX, never the thumb or little finger. Do not leave a fifth fingertip.

Preserve his own LEFT HAND on the VIEWER RIGHT, holding the green bamboo staff, with all five natural digits unchanged. Total across both hands is NINE. Keep image 1's face and identity unchanged; image 2 is the same character's approved-by-user identity direction for facial continuity only, not a source of finger anatomy. Do not change the whole figure or add an inset.

洪七公九指身份局部修正：本人右手（观者左侧）食指齐掌而缺，保留拇指、中指、无名指、小指共四指；本人左手完整五指持棒。仅删除展开右掌紧邻拇指的第一根长指，旧伤平整愈合，无血无创口，不遮藏，不错删其他指。保持刘丹版洪七公本人面容、端正头颈、完整灰褐旧袍、绿竹棒、红葫芦及全身构图。人物完整精细写实，背景水墨，原生2:3不透明PNG，保留原始溯源。No head tilt, no Dutch angle. Output exactly one full image, no text, arrows, labels or comparison panels.

完整排除项：完整五指右手、错删拇指或小指、双手缺指、袖子遮手、融合叠指假装缺失、五个指尖、血或新伤、改变面孔、head tilt、Dutch angle、拼图或文字
```

## 排除项

完整五指右手、错删拇指或小指、双手缺指、袖子遮手、融合叠指假装缺失、五个指尖、血或新伤、改变面孔、head tilt、Dutch angle、拼图或文字

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/hand-repair-20261001/por_npc_hongqigong__ch02_elder_bangzhu_base.prepared.json`。

---
asset_id: por_npc_zhujue__ch00_f_base
subject_id: npc_zhujue
name: 主角（女）· 春秋末·越国
book: ch00_yuenv
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png
manifest: assets/default/character/female/ch00/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/hero-20261001/classic_zhaomin_1993_portrait.jpg
  use: 已实际下载并view_image查看的公开张敏1993赵敏经典剧照。第一人物设计启发，只取有判断力的凝聚目光、英气骨相组织与成年女性主角气场；重新创作28岁原创女主，不继承赵敏或演员身份、蒙古/贵族装、白衣、金冠、折扇、披散发、背景、照片构图或反派神态。来源及原始SHA见参考目录sources.json。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看。第二参考仅提供项目墨线、柔光、暖浅灰纸底和淡雅设色；禁止复制Wang脸、年龄、体型、柔静侧望、发饰与开袍衣装，不更改其原approved状态。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看。第三参考仅取用户指定的精细水墨人物、淡墨层染、纸面透色与衣料笔触；不复制其脸、体型、发式、青白衣装、披帛、姿态或山水背景。
status: ready
---

# 主角（女）· 越女剑 · 春秋末·越国

## 人物要点

| 项 | 内容 | 依据 |
|---|---|---|
| 身份与阶段 | 现代人入书后的普通江湖行旅者；本图是时代基础装，不代表特定门派、现代职业或结局 | `docs/design/01-vision-and-core-loop.md` §4.1–§4.3；**（原创扩展）** |
| 时代与地域 | ch00_yuenv；春秋末·越国；约前482年（原创扩展定年）；越地山路上的普通行旅者 | `docs/design/02-timeline-and-world-tiers.md` §1.2；精确纪年沿上游考据边界 |
| 面容锚点 | 女性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；略长的鹅蛋脸，颧骨有轻微支撑、下颌利落而不尖削，眉形舒展且眉峰轻提，深棕色中等杏眼，鼻梁秀直、鼻头自然，唇线清晰、上下唇厚度适中，右眼外侧下方有一颗浅褐小痣；暖中性肤色，柔润而保留真实体积，无幼态或深皱纹；中等偏高、肩背舒展、腰腹与四肢有行动力量，约7头身；原生发质乌黑、顺直、发丝细密而有韧性；目光专注而有好奇心，嘴角平和，警觉但不怯弱。 | 本任务报告 §7.1 的统一美术默认；`design/01` §4.1 年龄范围【建议值】 |
| 本时代服饰发式 | 竹青与浅麻色相间的简朴深衣，交领右衽、腰束窄布带，裙摆离地便于行走、平底素履；黑发全部收成简约椎髻，以朴素布条固定，无珠翠 | 最新同性别模板 §3；`docs/tech/07-asset-generation.md` §2.7；具体裁制、选色与饰件为**（原创扩展）** |
| 兵器道具 | 空手、无随身兵器，不携青铜名剑或竹棒 | 本任务允许普通兵器或空手；`tech/07` §2.7；选配为**（原创扩展）**，不新增装备 ID |
| 气质姿态 | 双手空着自然放松，尚在观察陌生环境；身体微侧、双足站稳，不模仿越女教学持竹姿势 | `design/01` §4.6；`docs/design/13-progression-and-endings.md` §3；姿态设计为**（原创扩展）** |
| 跨界同一性 | 同性别十五版同脸、同体型、同发质、同成年年龄感；成长只作神态微调，压制不画成衰老或病弱 | 基准 §1；`design/01` §4.2；`design/13` §3 |
| 风格与参考 | 第一参考为本工作区已 approved 的王语嫣女性基线；第二参考为用户本轮指定的自生成水墨人物图。生成前实际查看并载入两图，复核项目基线状态；仅参考纸底色感、光线、笔触与设色，不复制人物、服装或山水背景。 | `assets/default/STYLE.md`；基线 manifest；用户2026-09-30本轮指令；最新版同性别模板 |
| 画幅与交付 | 单人全身、2:3；本批生成目标 2048×3072 PNG；不透明暖浅灰纸底、极淡纸纹、无文字；本文件仅为待生成提示词 | `tech/07` §1.3、§5.2 的尺寸与管线；生成背景按本轮返修要求 |
| 事实边界 | 主角脸、衣色、服装搭配与姿态均为原创美术默认，未声称原著或服饰史逐字复原 | 基准 §16；上游时代语汇；本任务报告 §4 |

## 本轮英雄重绘规范

第三/四候选重设计：以经典成年女侠的有判断力目光与英气骨相启发新成年女主；正面坚定、全收发髻、连续封闭竹青深衣、空手，仁厚可信且有主角气场，摆脱Wang风格图锁脸。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/hero-20261001/backups/por_npc_zhujue__ch00_f_base/prompt-d9d73a2da63a82f1a1d0aeed4db57645d73c3e382ef77df4da25d543b1ecb23d.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
REFERENCE HIERARCHY: IMAGE 1 IS THE PRIMARY CHARACTER-DESIGN INSPIRATION. Create a NEW ORIGINAL LEADING HEROINE, not Wang Yuyan, not Zhao Min, and not a costume change of either woman in images 2 or 3. Take from image 1 only the purposeful gaze, confident facial structure and commanding adult heroine presence, and redesign those qualities into this original protagonist. Images 2 and 3 are SECONDARY PAINTING-MEDIUM REFERENCES ONLY: ink lines, delicate color washes, warm paper and soft light. Never inherit their face, youthful doll proportions, demure side-glance, hairstyle, open robes, long hair or accessories. This is a new full-body painting, not a photo edit.
Character: npc_zhujue, the female player protagonist in ch00, late Spring-and-Autumn Yue, project-original date around 482 BCE. A modern Chinese adult entering the historical story as an ordinary traveler, approximately 28 years old, without royal title, clan uniform, named weapon or modern object. Make her visibly the leading woman of her own adventure: thoughtful, brave, clear-headed, trustworthy, composed and kind, never sinister, arrogant or seductive.
An independent adult face: a slightly elongated oval with gently supported cheekbones, a clean firm jaw that is not pointed, open strong brows with a subtly lifted brow peak, medium dark-brown almond eyes with decisive focus, a straight natural nose and defined moderately full lips. A small light-brown mole sits just below the outer corner of HER RIGHT EYE. Natural adult facial planes and warm-neutral skin; calm determination with attentive curiosity. Chin level, gaze forward toward the viewer, not drifting sideways. No baby face, doll eyes or inherited Wang Yuyan face. Moderately tall, capable and balanced, shoulders naturally open, torso and limbs carrying believable movement strength without bodybuilding muscles.
COSTUME CONSTRUCTION: one plain CLOSED CONTINUOUS bamboo-green shenyi dress. Bodice and long skirt are joined into one coherent garment. The cross-collar closes rightward, the wearer's left lapel overlapping the right. The outer fabric continues into a CLOSED FRONT SKIRT from the waist to just above the shoes. Below the belt the front is continuous green cloth, not an open gap or pale inner-dress panel. Only a narrow pale-hemp inner collar is visible. One narrow plain cloth belt secures the waist. Fully opaque, complete, modest practical clothing, clear large folds, walking-length hem and plain flat cloth shoes. NO OPEN OUTER ROBE, NO COAT OVER A WHITE DRESS, NO BEIZI, NO SEPARATE WHITE CENTER PANEL, NO SHAWL, NO TRAILING SASH. Do not copy the white film costume.
ALL black straight dense hair is gathered into one compact simple chuiji bun, neatly secured with a plain dark cloth strip. No hair or long ribbon hangs at the neck, chest or shoulders. No crown, flowers, jewelry, elaborate pins or film headpiece.
Pose: almost frontal full-body standing with only a slight natural turn. Shoulders and hips face mostly forward; head upright, chest open, spine relaxed and steady. One foot slightly ahead, both feet firmly supporting the body. Both arms hang naturally at the sides with a little space from the torso; BOTH HANDS ARE EMPTY, relaxed and readable, not crossed at the waist and not holding sleeves. She stands to assess her next action, neither posing demurely nor attacking. No fan, sword, bamboo rod, horse or companion.
Unified fine Chinese ink-and-color wuxia illustration: living ink lines on face and hands, soft muted bamboo-green and pale-hemp washes, slight paper showing through, simple large clothing shapes and selectively expressive folds. Reduce photographic pores, cloth noise and glossy highlights. Warm pale-gray opaque paper background, faint texture, no landscape, architecture, floor shadow or narrative scene; soft upper-left diffuse light. Vertical 2:3 PNG, target2048×3072, one figure in one view, full hair, hands, hem and shoes visible with comfortable margins. Natural proportions and complete structure matter more than exact percentages; no measuring marks or rigid height target. Preserve tool provenance.
本次核心：新创作有英气与判断力的28岁原创女主，第一影视图只启发目光和骨相，不要王语嫣换衣脸。更正面平视、肩背舒展、双手空着垂放。竹青深衣是一件闭合的一体长衣，腰带以下也是连续竹青衣料，不能敞开露出白色内裙。头发全部收成朴素紧凑椎髻；右眼外下方小痣保留。春秋越地普通行旅者身份不变。
```

## 排除项

No Wang Yuyan face or pose, teenage doll face, demure side-glance, drooping shoulders, villain expression or seductive styling. No open-front outer robe, white central inner-dress panel, beizi, coat, shawl, trailing sash, loose long hair, crown, jewelry, film costume, Mongolian or royal identity, fan, sword, horse, kneeling, back-facing or over-the-shoulder pose. No photographic rendering, 3D gloss, heavy makeup, huge anime eyes, exaggerated muscles, transparent clothing, extra people, extra limbs or fingers, fused hands, cropped body, text, signature, seal or copied reference watermark; retain tool provenance.

## 质检要点

- 英雄人物方向、身份阶段、衣装与器物按本轮设计检查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/hero-20261001/por_npc_zhujue__ch00_f_base.prepared.json`。

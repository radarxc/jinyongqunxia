---
asset_id: por_npc_minrou__ch06_prime_xunzi_base
subject_id: npc_minrou
name: 闵柔
book: ch06_xiake
gender: female
age_variant: prime
tier: A
output: assets/default/character/female/ch06/por_npc_minrou__ch06_prime_xunzi_base.png
manifest: assets/default/character/female/ch06/manifest.yaml
references:
- path: generated_images/exec-04d87450-bb19-4c7e-b70a-3ba8ec629488.png
  use: 已实际查看的闵柔初始candidate1原始PNG，仅保留衣装全身白剑构图，本次纠正严重偏青年面貌，不作为已批准身份。SHA b231d9c163ca95ec28fe4acd48a1c8da7eded29e7fce6c86f71d9aa4001d0230。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已查看用户水墨背景参考，仅纸底极淡水墨背景，不提供女性身份或年龄。
status: ready
realism_revision: user_identity_pose_20261001
---

# 闵柔 · 人物写实修正

## 人物与阶段

- subject_id：npc_minrou
- book：ch06_xiake
- gender：female
- age_variant：prime

## 本轮人物写实规范

初始单张1中年阶段未建立；根与独立实际视觉复核一致认为属于重大年龄偏差，本次仅一次成熟年龄补2，移除少女基线直接输入，原1及原单候选策略全部保留，实际候选2。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_minrou__ch06_prime_xunzi_base/prompt-41aa24a0b04aebad9b32115f7c2efc5197989986d2c09dbe0bc99892e3532ba9.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
EDIT image 1 to correct ONLY the severely under-age appearance of 闵柔 (Min Rou), a mature middle-aged Chinese woman and mother searching for her adult son in 《侠客行》. Image 1 is our original candidate, NOT an approved identity baseline; retain its coherent full-body clothing, one white sheathed sword and soft painted finish, but rebuild the visibly young face into an unmistakably mature woman of about 45 (an art direction age, not a claim about novel canon). She must NOT appear like her son's peer, a teenage girl or an elderly woman. Use a distinctly elongated oval facial structure with supported jaw, mature cheek volume, subtle natural under-eye contours, fine crow's-feet, fine nasolabial and mouth-corner lines, and ordinary human skin without beauty-filter smoothing. Eyes are naturally proportioned and thoughtful, gentle worried gaze; fine relaxed brows, straight moderate nose and unembellished lips. Preserve graceful beauty and capable martial posture with real middle-aged anatomy. Do not just paste superficial scratches onto the same young face.

身份阶段：闵柔，玄素庄庄主、黑白双剑之一，开篇侯监集寻子、白剑尚未被谢烟客夺走。单人，不加石清或儿子，不解释血缘结局。项目约1582–1583明万历方向为原创定年，不是小说精确年号。脸部细节属于文字原创，没有可核验的本人演员或game参考，不冒称本人既有肖像。

服饰：完整不透明素白交领右衽长袄，穿着者左襟压右襟，暖灰白马面长裙，浅墨青窄布腰带，白色平底布鞋。乌发全部整齐收成简洁成熟鬏髻，一枚素银簪，减少第一图披在肩胸的少女长发。衣料是可穿整片织物，温和细腻手绘材质，克制宽缓褶，不是透纱。只一柄白剑全部入白色足长鞘，白色握柄和小银灰剑格，两条短带连左腰，剑鞘全长可见。左手轻扶剑鞘，右手空着在腰前，人物两手自然可辨。无黑剑、第二剑和额外道具。

姿态：头颈直立、双眼水平、下巴中性，正面端正望前，双足稳定着地、全身及双鞋入画。保持适龄成熟比例，不强行精确占高。人物年龄与面孔是本次唯一必须修正的问题；不要因细微手指、鞋遮挡或小装备问题机械重画。

第二张仅提供暖浅灰不透明纸底、极淡水墨远山和留白，不取其中少女面孔、年龄、头发、白青衣装或歪头。仅背景水墨，人物皮肤、衣料及器物完整实体。不要清晰建筑、花枝或剧情场景。

交付：单人单视图，原生竖幅2:3 PNG，目标2048×3072但接受实际原生尺寸并如实登记，保存原始PNG字节和元数据，不裁切、缩放、重新编码。全部仍candidate待用户审核。This is the single explicitly authorized second candidate for a major age/stage problem; do not produce a grid or multiple views.

排除：少女面孔、幼态大眼、年轻王语嫣模板脸、磨皮、网红尖下巴、浓妆丰唇、老妪白发、夸张衰老、皱纹贴图污斑、摄影照片、3D塑料、换头拼贴；歪头、Dutch angle、侧脸、侧向目光；裸露、透明衣料、性感化、细腰丰胸；现代物件、清朝辫发旗装、日式衣剑、奇幻光效；多肢、明显错接手腕、重复兵器、裁头裁脚；文字、伪字、题款、签名、印章、新增水印。保留工具原始溯源信息。

FINAL: clearly MIDDLE-AGED MATURE MOTHER, naturally about 45, graceful but visibly a generation older than a young adult. Full body FRONT-FACING; head UPRIGHT; eyes LEVEL; one white sheathed sword.

完整排除项：不画青年少女脸或老妪；不新增肢体兵器；不复制背景人物脸；不新增文字水印，保留工具溯源。
```

## 排除项

不画青年少女脸或老妪；不新增肢体兵器；不复制背景人物脸；不新增文字水印，保留工具溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_minrou__ch06_prime_xunzi_base.prepared.json`。

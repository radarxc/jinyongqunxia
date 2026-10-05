---
asset_id: por_npc_renfeiyan__ch11_youth_road_base
subject_id: npc_renfeiyan
name: 任飞燕
book: ch11_yuanyang
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch11/por_npc_renfeiyan__ch11_youth_road_base.png
manifest: assets/default/character/female/ch11/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/f46a8c1b826edad373795882682c04917a7dc9210ffb1f7a6e42f11a3aa3261b.png
  use: 已实际view_image并核对manifest；任飞燕本人旧基础candidate，SHA256 f46a8c1b826edad373795882682c04917a7dc9210ffb1f7a6e42f11a3aa3261b。首要身份参考，只保留可识别眉眼鼻唇、黑发与成年阶段；健康面颊和肩臂体积按新文本自然加强，不继承纤长模特体态、冷艳摆姿、长红外袍和密集衣纹。不是新写实revision或approved。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view_image并核对SHA256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；manifest为candidate、realism_revision=user_character_realism_20261001。仅取完整人物渲染品质、精细面手和连续光影布料，不借男性身份、脸胡须、体型、装束、掌势、龙或背景，不把任飞燕男性化。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看；SHA256 2d1b0b0905e7624d3713ca71422974db15f0eaf42da34376794d040e4855a640，当前manifest approved保持不变。仅作为女性项目低饱和色卡与柔光关系，不取王语嫣脸、少女年龄、纤细体态、衣装、发式或人物墨线斑驳。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户自生成参考，SHA256 61ef2d8af3f0dcc87204f60bb222cf754cc42ff44b69c481dc57eeb3c7fca80b。仅取背景的淡水墨与疏朗留白；不借人物脸、身体、白青衣料、披发、透明薄纱或飘带，不让水墨进入人物。
status: ready
realism_revision: user_character_realism_20261001
---

# 任飞燕 · 人物写实修正

## 人物与阶段

- subject_id：npc_renfeiyan
- book：ch11_yuanyang
- gender：female
- age_variant：youth

## 本轮人物写实规范

任飞燕保留本人识别，升级为成熟结实、明快有主见的江湖少妇；枣红短袄与深茶裙裤构成利落两段剪影，恢复自然有力量的肩臂和腰腹。清晰写实、完整布料，传统弹丸弓与本人普通单刀保留，不武将化或少女化。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_renfeiyan__ch11_youth_road_base/prompt-96e29d784f68e20c2586bafc2b6d7191a003f7d2899d941b9820b5619ce194cb.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

这是任飞燕（npc_renfeiyan）的基础英雄形象升级，保留已有角色身份而改进尚未落实的体态和衣装剪影。《鸳鸯刀》ch11，清乾隆初、游戏约1740年（项目原创定年），林玉龙之妻、夫妻刀法传承者，官道追逐与初遇阶段；健康的成年青壮少妇，视觉二十余岁（美术原创扩展），不是未成年少女，不是战后负伤或孕产阶段。只有她一人，完整头足与全部装备入画。

严格区分四张参考：第一张是已查看的任飞燕本人旧基础图，仅保留她的身份识别、眉眼鼻唇关系、黑发和原本的健康成年感；不要复制其过窄面颊、纤长模特体态、冷艳摆姿、长红外袍或密集衣纹，按下文重建衣装与身体体积。第二张新写实萧峰仅示范精细自然面手、连续解剖、完整布料与连贯柔光的渲染品质，不借其脸、胡须、男性骨架、魁梧肩背、裹巾、衣装、掌势、墨龙或场景。第三张项目王语嫣女性基线仅提供克制低饱和色彩与柔光关系，不借脸、年龄、纤细体态、发式、宋代衣裙或旧人物笔墨纹理。第四张用户王语嫣图仅取背景的浅淡水墨和疏朗留白，不取其中的人物、衣料、飘带或白青造型。

面容保持第一张的可识别五官关系，在原面部基础上给面颊和下颌适度增加健康体积，成为略宽而自然的鹅蛋脸，避免削尖下巴或另换成王语嫣的脸。眉眼有力量，眉尾利落但不怒拧，眼神明快专注，像在等待对方认真答话；鼻唇自然秀丽，嘴角有鲜活、克制的表情。皮肤细腻可信，眼睑、鼻翼、唇缘清楚，柔光连续，没有磨皮或粗糙斑点。体现成熟少妇的主见、重情与干练，不妖艳、不泼妇化，不以苦相或强压眉表现英雄气。

自然成年女性比例约7头身，结实匀称的肩臂、胸背与腰腹有支撑，头颈端正；肩背打开但保持女性自然体态，不复制萧峰的肩宽、肌肉或粗颈。腰围自然、手臂可见的体积与身体相称，不追求极细腰或细长四肢。双脚稳立，一足稍前，身体轻微侧转而重心真实。手部结构明晰，袖口与手腕相接清楚，手指和器物接点不混合。

衣装的实质改进必须明确：低饱和枣红窄袖短袄，衣摆止于髋部至大腿上段；这是独立短上衣，绝不能把旧图红袍继续拖长至膝下或脚踝。下装为深茶色及踝裙，裙内是完整长裤，行旅可迈步；上身枣红肩袖与下身深茶裙裤形成有行动力的清楚两段剪影。腰胸布料自然合身宽松，交领右衽为穿着者左襟压右襟，窄布带系结，素布绑腕，平底布靴。素面棉麻质感完整且有分量，用少量大褶和真实接缝表达垂坠，去除密集锦纹、过多衣片、碎带和无依据破旧。黑发全部收成紧实后脑低髻，一支素铜簪固定，无高耸发冠和长披发。

左手（画面右侧）从容握小型传统弓形弹丸弓正中的握把。握把两侧各有清楚弯臂，两个弓端由连续、未拉开的弦连接，弦正中分接一小片略宽于拇指的浅凹皮承弹兜；弓弦与皮兜连接合理。弓斜向身外下方，不瞄准观者，不配箭支箭袋，不画Y形橡皮弹弓。腰侧有小弹丸袋及一柄普通中式单刀，完整收入足长刀鞘，短承重带连接腰带和鞘侧环。右手（画面左侧）掌根与放松手指轻按刀鞘口外壁，刀柄与护手完整露在手上方，不抓刀柄、不拔刀。她只带本人一刀，不拿鸳鸯宝刀、不一人双刀；器物质朴、无发光和繁复珠宝。双臂双腿完整，无伤口、血迹或包扎，不带孩子或丈夫。

竖幅2:3，单人单视图完整全身，平视近正面略三分之四、中性透视；头顶、双手、双足、衣摆、弓端和刀鞘尾均完整留在画内并有舒适余边。柔和左上漫射主光，面部、手部与衣料光影连续，双足有自然微弱接触阴影。暖浅灰不透明背景，只有极淡疏朗的水墨气息与大片留白，不画具体故事场景、其他人物或醒目山峰。水墨始终留在人物身后，与干净清楚的发丝、衣缘和鞋缘分离。保持default包的温润克制色感，人物清晰写实，不改成摄影或另一套浓艳风格。脸型细化、配色与弹弓器型细节是美术补足，原著未逐字核定处仍待考，不生成任何文字说明。

完整排除项 / Exclusions:
不要少女化的尖窄下巴、极细蜂腰、软弱含胸、冷艳摆拍或武将式魁梧；不要复制王语嫣脸、萧峰面孔胡须或男性体型。不要拖到脚踝的红色长外袍、密集锦纹、宽大披帛、高耸发冠或长披发。不要人物飞白、碎墨、纸屑侵蚀、拼贴切面、刮痕、泛白磨蚀、水彩斑驳、碎布飘带、破洞毛边或无依据脏污；衣服完整不透明，不裸露或性感化。不要含糊五官、塑料磨皮、动漫大眼、摄影剧照或三维模型质感；不要多肢多指、粘连手指、错接手腕、手物融合、裁头裁脚。不要Y形橡皮弹弓、箭支箭袋、篮筐承弹兜、额外挂绳、射出弹丸、第二刀、鸳鸯宝刀、露刃、右手握柄拔刀；不要孩子丈夫同框、伤口包扎、血迹、铠甲、龙形能量或其他无依据特效。不要现代物件、文字题款、签名、印章、logo、新增装饰水印、拼图或多视图；保留工具自带溯源标识。
```

## 排除项

不要少女化的尖窄下巴、极细蜂腰、软弱含胸、冷艳摆拍或武将式魁梧；不要复制王语嫣脸、萧峰面孔胡须或男性体型。不要拖到脚踝的红色长外袍、密集锦纹、宽大披帛、高耸发冠或长披发。不要人物飞白、碎墨、纸屑侵蚀、拼贴切面、刮痕、泛白磨蚀、水彩斑驳、碎布飘带、破洞毛边或无依据脏污；衣服完整不透明，不裸露或性感化。不要含糊五官、塑料磨皮、动漫大眼、摄影剧照或三维模型质感；不要多肢多指、粘连手指、错接手腕、手物融合、裁头裁脚。不要Y形橡皮弹弓、箭支箭袋、篮筐承弹兜、额外挂绳、射出弹丸、第二刀、鸳鸯宝刀、露刃、右手握柄拔刀；不要孩子丈夫同框、伤口包扎、血迹、铠甲、龙形能量或其他无依据特效。不要现代物件、文字题款、签名、印章、logo、新增装饰水印、拼图或多视图；保留工具自带溯源标识。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_renfeiyan__ch11_youth_road_base.prepared.json`。

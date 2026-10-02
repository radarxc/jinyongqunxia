---
asset_id: por_npc_zhangwuji__ch04_youth_scene_jiuyang
subject_id: npc_zhangwuji
name: 张无忌
book: ch04_yitian
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_jiuyang.png
manifest: assets/default/character/male/ch04/manifest.yaml
asset_variant: scene
scene_key: jiuyang
scene_title: 幽谷九阳
stage: 昆仑幽谷学九阳阶段，少年后期至初成年；与光明顶成熟度衔接，不套统一28岁。 本场固定取幽谷后期、出谷前的青年观感，非刚落谷的幼年寒毒患者；索引为 youth。
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅借自然面容与肤质的描绘质量、完整坚实体积、连贯光影、连贯布料和干净轮廓，不复制萧峰的脸、性别、年龄、胡须、头巾、体型、服饰、姿态或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际查看的对应性别项目基线，仅低饱和配色色卡；此位置不作本人身份或人物画法参考，不继承碎墨、飞白、纸纹透衣、破布、脸、年龄、衣饰、武器与姿势。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户王语嫣水墨图，只用于背景的浅淡山水、留白与环境层次；完全忽略其中人物、脸、体型、肤质、服饰、发饰和人物笔触，不让背景纸纹与飞白侵入本场人物。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 张无忌 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhangwuji
- book：ch04_yitian
- gender：male
- age_variant：youth
- scene_title：幽谷九阳
- scene_key：jiuyang
- stage：昆仑幽谷学九阳阶段，少年后期至初成年；与光明顶成熟度衔接，不套统一28岁。 本场固定取幽谷后期、出谷前的青年观感，非刚落谷的幼年寒毒患者；索引为 youth。

## 本轮人物写实规范

作者最新写实修正：幽谷九阳；本人身份连续、实体人物完整美观写实、水墨仅背景。首场建立本人的新写实身份锚点。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhangwuji__ch04_youth_scene_jiuyang/prompt-eb2dc18fc1d2117098e5f5d78061f641f581377233ae9f6b4a055122b9836391.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

本场没有已保存的本人身份 PNG，按下列文字独立创作人物骨相、年龄、性别、体型与气质，建立其首幅写实身份锚点；不得拿参考中的萧峰或王语嫣换衣充当此人。
第一参考为新版萧峰少室山首样，只提供人物绘画质量：细腻真实肤质、完整体积、连贯柔和光影、连贯完整布料及干净轮廓；绝不复用其脸、胡须、头巾、体型、年龄、男性特征、服装、姿态或龙影。本角色仍是张无忌。
第二参考为对应性别项目基线，仅低饱和色卡，不取人物笔触与衣料细节。
第三参考仅用于背景水墨与留白；不取其中人物、白青衣装、肤质或纸纹透衣。

人物身份设计：张无忌的独立设计：宽而温和的椭圆脸，浓直眉与清明深色眼睛，鼻梁端正、唇形自然；青年肩胸厚实、身体结实匀称而不夸张健美，神情仁厚，行动时能承担。英雄气来自救人止戈，不用阴狠眯眼、统一尖下巴或帝王威势。
张无忌，《倚天屠龙记》，幽谷九阳。
阶段：昆仑幽谷学九阳阶段，少年后期至初成年；与光明顶成熟度衔接，不套统一28岁。 本场固定取幽谷后期、出谷前的青年观感，非刚落谷的幼年寒毒患者；索引为 youth。
人物与完整衣装动作：单人全身立在谷石旁，粗布衣、布鞋，神情专注温厚；寒毒渐解阶段不画成熟教主冠服。 衣装设计：自然米褐粗布交领上衣、浅灰长裤、窄布腰束、旧布鞋；黑发简单束起，不戴教主冠。 衣料保持完整可穿、连贯成片、剪裁清楚和整洁收边；旧衣仅显使用后的柔软色泽，不撕烂、不掉碎片、不加成排补丁、密集皱纹或碎带。 人物面部、皮肤、头发、衣服与鞋均采用美观写实的高级国风插画塑造；解剖与实体体积清楚、细腻自然肤质、连贯柔和光影、干净完整轮廓。人物上没有碎墨、纸纹侵蚀或飞白。衣料完整连贯、剪裁明确，袖口与下摆干净连续收边，只有少量自然宽缓承重褶，英雄气来自眼神、体格、姿势与合身份的衣饰。
器物与阶段限制：旧经卷，以素纸折页表示，不生成可读全文；一只白猿可作为次要动物，腹部完整无创伤
仅背景使用水墨：浅淡水墨背景，人物为画面主体。峭壁夹成狭谷，近处野果枝与少量苔石；白猿位于人物侧后下方，不能与手臂粘连。
本场具体构图：画面主体是谷中学成前后的青年张无忌，白猿仅作侧后次要动物，经卷在真实手中；人与猿四肢分开。
单人单视图完整全身，站姿从头顶到足；坐跪姿完整呈现躯干、双手、膝腿与足，主要器物端点入画，留自然边距。仅保留本场明确授权的代表动物，动物肢体不与人粘连。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。真实承重、关节清楚，不机械限定占高、不因衣摆轻微遮鞋返工；人物清楚居前，水墨只在背景且不侵入人体和衣服。
情节与美术边界：原著事件为白猿腹中得经、谷中修习；此图取学成前后的安静整理经卷瞬间。衣色、光线是美术设计；不画开腹过程，不把白猿当宠物或人物化。 本场为独立经典场景变体，保留基础立绘；production record 不表示 PNG 已生成或已查看，不代表审批通过，未来实际成图仍为 candidate。服色、站坐姿及具体衣纹是美术补足，阶段装备与明确伤残优先。 本次执行 REALISTIC-CHARACTERS-20261001.md：人物美观写实、皮肤与衣料完整连续，水墨仅用于背景。旧候选仅为历史记录，不计本轮写实完成；本记录本身不是生成、保存或审批，新图实际查看通过后仍为 candidate。 当前无已保存本人身份 PNG；首场按文字独立建立本人脸、年龄与体型，萧峰首样不能冒充身份参考。

完整排除项：不要圣火令、屠龙刀、真倚天剑、教主皇冠、开腹创伤或把白猿画成人。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。
```

## 排除项

不要圣火令、屠龙刀、真倚天剑、教主皇冠、开腹创伤或把白猿画成人。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhangwuji__ch04_youth_scene_jiuyang.prepared.json`。

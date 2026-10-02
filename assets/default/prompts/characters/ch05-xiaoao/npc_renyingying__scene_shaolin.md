---
asset_id: por_npc_renyingying__ch05_youth_scene_shaolin
subject_id: npc_renyingying
name: 任盈盈
book: ch05_xiaoao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_shaolin.png
manifest: assets/default/character/female/ch05/manifest.yaml
asset_variant: scene
scene_key: shaolin
scene_title: 少林山门求医
stage: 为救重伤令狐冲而自愿留在少林的阶段。
references:
- path: assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_zhuxiang.png
  use: 等待本人首场新写实 PNG 生成、保存并核验 realism_revision=user_character_realism_20261001 后才可使用；当前不声称已查看该新版本。路径存在旧初版不满足依赖。只保持本人面容身份及新版写实人物质量；本场年龄、发式、伤残、衣饰、姿势、器物和背景另绘。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅借自然面容与肤质的描绘质量、完整坚实体积、连贯光影、连贯布料和干净轮廓，不复制萧峰的脸、性别、年龄、胡须、头巾、体型、服饰、姿态或龙影。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看的对应性别项目基线，仅低饱和配色色卡；此位置不作本人身份或人物画法参考，不继承碎墨、飞白、纸纹透衣、破布、脸、年龄、衣饰、武器与姿势。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户王语嫣水墨图，只用于背景的浅淡山水、留白与环境层次；完全忽略其中人物、脸、体型、肤质、服饰、发饰和人物笔触，不让背景纸纹与飞白侵入本场人物。
status: redo
redo_reason: "现图是磨皮网红脸、偏低龄，且五张都由首张场景图衍生；以新出的任盈盈基础立绘为身份参考重画。"
reference_upload:
  - assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_shenggu_base.png
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 任盈盈 · 人物写实修正

## Gemini 提示词

> 2026-10-02 立绘审核（B 组，见 `tools/agents/reports/REVIEW-portraits-B-ch05-09.md`）：**整体重出（随基础立绘）**（P1）。现图是磨皮网红脸、偏低龄，且五张都由首张场景图衍生；以新出的任盈盈基础立绘为身份参考重画。
>
> 参考上传：`assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_shenggu_base.png`。
>
> 依据与待考：场景事实沿用原场景稿（阶段、动作、器物）；画面细节为原创扩展。
>
> 本节是新的出图依据：把下面代码块原样粘贴给 Gemini（有参考上传的先上传图片）。下方原有段落只作历史保留，不再交给出图。

```text
生成一张 2:3 竖幅单人全身剧情场景图。

上传的图片是任盈盈本人的基础立绘，作为身份参考：保持同一张脸（脸型、眉眼、鼻子、嘴、肤色、发际线）和同样的成年年龄、体型，让人一眼认出是同一个人；不要照搬参考图的站姿、构图和背景，服饰、动作和场景按下文。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：任盈盈，《笑傲江湖》女主角，外观约二十岁的成年年轻女子，清秀鹅蛋脸、细长平缓的眉、清冷聪慧而略带腼腆的眼神，成人身材比例。
场景「少林山门求医」：为救重伤的令狐冲，自愿留在少林寺的时期。人物独自站在少林寺山门的石阶下，旅途的疲惫写在脸上，但目光坚定，双手自然收在身前。衣装：浅青灰便行衣裙、米白内衫、深灰布鞋，袖口收紧，发带简洁。背景：少林古寺山门、松根与向上消失在晨雾里的长石阶；山门匾额上不要出现文字。

构图：竖幅 2:3，单人全身剧情场景图，人物是画面主体，从头顶到双脚完整入画（坐姿也要看得见头、身体、双手、双腿和双脚）；场景用浅淡的写实水墨笔法画出，留白充足，背景不能压过人物、不能侵入人物轮廓。画面里只有这一个人物。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要磨皮网红脸、少女幼态；不要换成另一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
```

## 人物与阶段

- subject_id：npc_renyingying
- book：ch05_xiaoao
- gender：female
- age_variant：youth
- scene_title：少林山门求医
- scene_key：shaolin
- stage：为救重伤令狐冲而自愿留在少林的阶段。

## 本轮人物写实规范

作者最新写实修正：少林山门求医；本人身份连续、实体人物完整美观写实、水墨仅背景。依赖本人首场 user_character_realism_20261001，旧初版不能解除依赖。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_renyingying__ch05_youth_scene_shaolin/prompt-7b98e0dda628cf7bb3284a1f8119ad743b1f27c8221908400f2e6611ab3725ad.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须是已完成并经父任务验证 realism_revision=user_character_realism_20261001 的本人首幅写实场景；保持同一个人的面容特征与身份，本场重新绘制服饰、发式、动作、道具和背景。旧初版仅文件存在不满足依赖，未经新版 revision 核验和实际查看不得提交生成。
第二参考为新版萧峰少室山首样，只提供人物绘画质量：细腻真实肤质、完整体积、连贯柔和光影、连贯完整布料及干净轮廓；绝不复用其脸、胡须、头巾、体型、年龄、男性特征、服装、姿态或龙影。本角色仍是任盈盈。
第三参考为对应性别项目基线，仅低饱和色卡，不取人物笔触与衣料细节。
第四参考仅用于背景水墨与留白；不取其中人物、白青衣装、肤质或纸纹透衣。

人物身份设计：任盈盈的独立设计：微圆的鹅蛋脸，舒展眉弧、清亮而有判断力的眼睛，自然鼻唇，嘴角安静；年少青年女子，体态纤秀而有练武力量。清丽、含蓄、有主见，不怯弱，不复制王语嫣长窄脸、怜弱神情或发饰。早期保留年少感，三年后适度成熟而不突然中年化。
任盈盈，《笑傲江湖》，少林山门求医。
阶段：为救重伤令狐冲而自愿留在少林的阶段。
人物与完整衣装动作：单人全身站在山门石阶下，旅行衣裙带疲惫，目光坚定，双手自然垂落或收在身前。 衣装设计：浅青灰便行衣裙、米白内层、深灰布鞋，袖口收紧，发带简洁；衣料完整可穿。 衣料保持完整可穿、连贯成片、剪裁清楚和整洁收边；旧衣仅显使用后的柔软色泽，不撕烂、不掉碎片、不加成排补丁、密集皱纹或碎带。 人物面部、皮肤、头发、衣服与鞋均采用美观写实的高级国风插画塑造；解剖与实体体积清楚、细腻自然肤质、连贯柔和光影、干净完整轮廓。人物上没有碎墨、纸纹侵蚀或飞白。衣料完整连贯、剪裁明确，袖口与下摆干净连续收边，只有少量自然宽缓承重褶，英雄气来自眼神、体格、姿势与合身份的衣饰。
器物与阶段限制：无武器出鞘，不让她持刀胁迫医治
仅背景使用水墨：浅淡水墨背景，人物为画面主体。少林古门、松根与长阶向上消隐；一条淡晨雾留出孤身承担的空间。
本场具体构图：少林山门前孤身站定，眼神疲倦但坚决，双手空出，没有臣服求爱的媚态。
单人单视图完整全身，站姿从头顶到足；坐跪姿完整呈现躯干、双手、膝腿与足，主要器物端点入画，留自然边距。仅保留本场明确授权的代表动物，动物肢体不与人粘连。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。真实承重、关节清楚，不机械限定占高、不因衣摆轻微遮鞋返工；人物清楚居前，水墨只在背景且不侵入人体和衣服。
情节与美术边界：令狐冲与僧人在画外，图表现求医后的自愿承担，不能画成加入少林、被剃度或替别人下跪换爱情奖励。官方该回抓取超时，事件据本地原著表。 本场为独立经典场景变体，保留基础立绘；production record 不表示 PNG 已生成或已查看，不代表审批通过，未来实际成图仍为 candidate。服色、站坐姿及具体衣纹是美术补足，阶段装备与明确伤残优先。 本次执行 REALISTIC-CHARACTERS-20261001.md：人物美观写实、皮肤与衣料完整连续，水墨仅用于背景。旧候选仅为历史记录，不计本轮写实完成；本记录本身不是生成、保存或审批，新图实际查看通过后仍为 candidate。 第一身份引用等待本人首场的新写实版本；即使同路径已有旧 PNG 也不满足，必须核对 manifest realism_revision=user_character_realism_20261001，并保存验证、实际查看后才可注册/prepare/生成本场。

完整排除项：不要剃度、袈裟、现代病院、架刀胁医、第二个人、性感化疲惫姿态。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。
```

## 排除项

不要剃度、袈裟、现代病院、架刀胁医、第二个人、性感化疲惫姿态。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_renyingying__ch05_youth_scene_shaolin.prepared.json`。

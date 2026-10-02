---
asset_id: por_npc_yuanchengzhi__ch07_youth_scene_jinshedong
subject_id: npc_yuanchengzhi
name: 袁承志
book: ch07_bixue
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.png
manifest: assets/default/character/male/ch07/manifest.yaml
asset_variant: scene
scene_key: jinshedong
scene_title: 金蛇遗剑
stage: 青年取得夏雪宜遗物、金蛇传承初开；不是夏雪宜本人。
references:
- path: assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_child_scene_huashan.png
  use: 待本角色首场 por_npc_yuanchengzhi__ch07_child_scene_huashan 新写实PNG生成、保存后，由根任务核验manifest realism_revision=user_character_realism_20261001、当前PNG哈希和实际view_image查看，才可注册或使用。本记录不声称已查看该新身份图；旧同路径文件存在也不满足依赖。届时只保持同人物核心身份与写实人物质量，本场年龄成长、伤残、衣服、发式、动作、器物和背景另绘。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view_image查看并核验新版萧峰首样，manifest realism_revision=user_character_realism_20261001，SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅参考人物自然皮肤、完整体积、连续光影及连贯衣料的渲染质量。绝不复用萧峰面孔、男性形象、年龄、胡须、体型、衣服、姿态或龙影，不作为本角色身份。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际view_image查看并校验可读的同性别项目基线；仅用低饱和色卡，不参考人物身份、面孔、体型、年龄、发饰、衣装、姿态、武器或人物笔触，完全忽略碎墨、纸纹和旧衣渲染，不改基线审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view_image查看并校验可读的用户王语嫣水墨参考；仅用于背景淡墨、山水层次与留白，完全忽略其中人物、脸、皮肤、服装、发饰和体态，墨迹纸纹不可进入新人物。
status: redo
redo_reason: "现图是飘逸长发的偶像小生脸，与原著忠厚稳重不符；以新出的袁承志基础立绘为身份参考重画。"
reference_upload:
  - assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_jinshe_base.png
  - assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 袁承志 · 人物写实修正

## Gemini 提示词

> 2026-10-02 立绘审核（B 组，见 `tools/agents/reports/REVIEW-portraits-B-ch05-09.md`）：**整体重出（随基础立绘）**（P1）。现图是飘逸长发的偶像小生脸，与原著忠厚稳重不符；以新出的袁承志基础立绘为身份参考重画。
>
> 参考上传：`assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_jinshe_base.png`。
>
> 依据与待考：场景事实沿用原场景稿（阶段、动作、器物）；画面细节为原创扩展。
>
> 本节是新的出图依据：把下面代码块原样粘贴给 Gemini（有参考上传的先上传图片）。下方原有段落只作历史保留，不再交给出图。

```text
生成一张 2:3 竖幅单人全身剧情场景图。

上传的图片是袁承志本人的基础立绘，作为身份参考：保持同一张脸（脸型、眉眼、鼻子、嘴、肤色、发际线）和同样的成年年龄、体型，让人一眼认出是同一个人；不要照搬参考图的站姿、构图和背景，服饰、动作和场景按下文。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：袁承志，《碧血剑》男主角，约二十岁的成年青年男子，高大结实、方正偏长的脸、浓黑平直的眉、沉稳坦诚的眼神，健康麦色皮肤。
场景「金蛇遗剑」：在华山金蛇洞中发现金蛇郎君夏雪宜遗物、得到金蛇剑的时期。人物独自在狭小的石洞中刚从蹲姿站起，右手握着金蛇剑——一柄金色的奇形宝剑，剑身弯曲如游动的蛇，剑尖分叉如蛇信，将剑身斜指前下方，认真而敬重地端详；左手自然张开、靠近地上一个旧包裹但不碰剑刃。衣装：青灰束袖练武袍、深色窄腰带、灰褐长裤与布靴，黑发用素巾束起。背景：狭窄石洞、从岩缝透进的天光与岩壁上的旧痕；遗骨留在画外，不画骷髅。

构图：竖幅 2:3，单人全身剧情场景图，人物是画面主体，从头顶到双脚完整入画（坐姿也要看得见头、身体、双手、双腿和双脚）；场景用浅淡的写实水墨笔法画出，留白充足，背景不能压过人物、不能侵入人物轮廓。画面里只有这一个人物。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要偶像小生脸和飘逸长发；不要换成另一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

## 人物与阶段

- subject_id：npc_yuanchengzhi
- book：ch07_bixue
- gender：male
- age_variant：youth
- scene_title：金蛇遗剑
- scene_key：jinshedong
- stage：青年取得夏雪宜遗物、金蛇传承初开；不是夏雪宜本人。

## 本轮人物写实规范

金蛇遗剑；人物美观写实、完整体积与衣料，水墨仅背景；身体从蹲起转为直立，右手持剑柄将独特曲折剑身斜向前下方，左手自然张开靠近旧包裹而不触刃；目光认真端详剑身。狭洞裂光与旧包裹明确传承来源，人物双脚稳立。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong/prompt-3e837bdc74f3f4b43d8851fea655e60cf354743466070b6d220007365bafac91.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须为本角色首场新写实PNG，根任务先核验manifest realism_revision=user_character_realism_20261001、文件哈希并实际查看后方可输入；旧同路径文件存在不满足条件，当前不声称已查看该新身份图。按首场保持本人眉鼻眼口的辨识关系，允许少年到青年自然成长及剧情伤残变化，不固化首场身高、姿态或装备。第二参考为已实际查看的新写实萧峰首样，只取皮肤、体积、连贯光影和完整衣料质量，不能借他的脸、男性外貌、胡须、体型、服装、姿势或龙影。第三参考仅同性别基线低饱和色卡，不作身份和人物画法。第四参考仅背景淡墨山水及留白，不取女子、面孔、肤质或服装。

人物身份：袁承志的独立人物设计：方中带长的脸、平直而浓的眉、沉静的眼睛、清晰鼻梁和较厚实下颌；少年保留脸颊稚气，青年肩背扎实舒展而不肌肉夸张，神情克制诚正。完整长发简单束起；不是令狐冲的狭长脸、网状抹额或洒脱歪身站姿。少年至青年保持眉眼间距和鼻口辨识，以自然成长改变下颌与肩宽。
角色与主题：袁承志，金蛇遗剑。
阶段：青年取得夏雪宜遗物、金蛇传承初开；不是夏雪宜本人。
人物、动作与完整衣装：单人全身蹲起后的直立姿，青灰练武衣，谨慎端详一柄特殊剑，神态敬重。 青年青灰束袖练武袍、深色窄腰带、灰褐长裤与完整布靴，黑发素巾束起。朴素衣料有可信厚度，腰部层次精简，领袖和袍摆均完整整洁。 人物面部、皮肤、头发、衣服和鞋均以美观写实的高级国风插画塑造：坚实完整体积、自然精细肤质、可信五官、连贯柔和光影、干净完整轮廓。衣料有明确剪裁与连续整片织物，仅少量宽缓承重褶；旧衣也完整可穿。水墨、飞白和纸纹仅允许出现在背景，不能侵入或切碎人物。
器物与阶段限制：金蛇剑一柄，蛇形曲折剑身与独特剑尖，不画真蛇缠身；旧包裹与少量金蛇锥在地侧，不漂浮
仅背景使用水墨：浅淡水墨背景，人物为画面主体。狭小石洞、裂隙天光与岩上旧痕；遗骨留在画外，不以骷髅为中心。 背景墨痕和纸纹停留在人物轮廓以外，不穿透衣料与皮肤。
本场具体构图：身体从蹲起转为直立，右手持剑柄将独特曲折剑身斜向前下方，左手自然张开靠近旧包裹而不触刃；目光认真端详剑身。狭洞裂光与旧包裹明确传承来源，人物双脚稳立。
单人单视图完整全身，站姿从头顶到双足，坐姿完整呈现头、躯干、实际存在的手、双腿和足，主要器物端点完整入画；真实重心、自然留边，不机械限定人物占高。竖幅2:3，目标2048×3072 PNG，接受工具原生输出、不透明，保留原始PNG字节。每场两候选择一，生成后实际查看人物写实质量与事实身份，宽松自查后仍为candidate，不能自行approved。
事实与艺术边界：金蛇剑、锥与秘笈来源于夏雪宜遗藏；不画袁承志为金蛇郎君，不提前携游戏原创机关道具。 本场为原著事件基础上的单人艺术取景与原创衣装设计，构图不当作逐字场面复刻；独立场景不覆盖基础图。此production record只准备实际请求，不代表图片已经生成、查看或审批；原始PNG保存后仍须按宽松自查登记candidate，保留原审批状态。 本轮按REALISTIC-CHARACTERS-20261001.md重写人物美术：美观写实、自然皮肤、连贯光影、完整衣料，水墨仅背景；旧场景或旧候选不计本轮修正完成。具体衣色与姿态仍为艺术补足，原著人物、阶段、伤残与器物事实不变。实际生成与查看后才可登记本轮candidate，不自行approved。 首身份引用必须完成新写实revision并实际查看；旧路径存在不能解除依赖。

完整排除项：不要真蛇绕剑或缠身，不要普通笔直剑替代金蛇剑，不要漂浮锥、骷髅主视觉、金蛇郎君面貌或皇帝宝剑。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。
```

## 排除项

不要真蛇绕剑或缠身，不要普通笔直剑替代金蛇剑，不要漂浮锥、骷髅主视觉、金蛇郎君面貌或皇帝宝剑。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.prepared.json`。

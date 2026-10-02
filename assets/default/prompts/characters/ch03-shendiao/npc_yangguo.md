---
asset_id: por_npc_yangguo__ch03_youth_onearm_base
subject_id: npc_yangguo
name: 杨过
book: ch03_shendiao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_onearm_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/yangguo_1995_caption_verified.jpg
  use: 第一且唯一面部身份参考：古天乐 1995 版杨过，已实际 view。取窄长脸、清楚颧骨与棱角下颌、浓直眉、深而清楚的眼神、窄直鼻梁及闭唇关系。改为头正、眼线水平、直接正面；不复制参考图的双臂、侧倾动作、服饰、发饰、细剑、背景或摄影质感。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考，仅项目男性精细画法、青灰炭灰色卡和柔和光照；已实际 view。禁止借用其脸、体型、身份、服装版式、姿势、发饰和兵器；基线 candidate 状态保留。人物必须完整写实，不借任何破墨、纸透或碎片化效果。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考，仅用户指定的浅淡水墨山水、薄雾与背景留白；已实际 view。不得借女性面容、身体、白青薄纱服饰或姿态，也不得把背景纸纹/水墨透进人物皮肤衣料。
status: redo
realism_revision: user_identity_pose_20261001
redo_reason: "面容近乎复刻 1995 版演员（肖像风险），按原著“剑眉入鬓、凤眼生威、清癯俊秀、断右臂、玄铁重剑”用文字原创重做，连同五幅场景"
reference_upload:
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
---

# 杨过 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出**。面容近乎复刻 1995 版演员（肖像风险），按原著“剑眉入鬓、凤眼生威、清癯俊秀、断右臂、玄铁重剑”用文字原创重做，连同五幅场景。
> 本条不上传任何参考图（`reference_upload: []`）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】杨过，《神雕侠侣》南宋的主角，杨康之子、小龙女之徒；被郭芙斩断右臂、得独孤求败玄铁重剑之后，十六年分离之前。孤傲不羁、深情重义。
【年龄与体态】约二十三四岁的青年，身材高挑精瘦，肩背挺直。
【面容】原著写他清癯俊秀、剑眉入鬓、凤眼生威，脸色苍白、颇见憔悴。具体为：清瘦俊秀的长脸、颧骨略高、两颊微陷，浓黑的剑眉斜飞入鬓，一双凤眼细长、眼神锐利而带傲气与落寞，鼻梁高挺，薄唇紧抿，脸色偏苍白、略显憔悴，下巴有短短的胡茬。原创面孔，不像任何演员。
【发式】黑发束成发髻，用一根灰白布条扎住，几缕散发垂在额边。
【服饰】灰青色交领右衽旧布袍（旧而整洁），深色布腰带，深色长裤、布靴。原著断的是右臂：右臂齐上臂断去，右边衣袖空荡荡地打了个结垂在身侧（清楚可见）。
【道具】左手（仅存的手）握着一柄又宽又厚的黑色玄铁重剑——无锋无尖、像一块长铁，剑尖拄地，剑身完整入画。
【姿态与神情】孤身而立，左手扶剑、空袖垂在右侧；神情冷傲而深情，目光看向远方。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要左臂断（原著是右臂）；不要两只手都在；不要细长锋利的普通剑或剑光；不要神雕入画；不要像任何具体演员。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_yangguo
- book：ch03_shendiao
- gender：male
- age_variant：youth

## 本轮人物写实规范

杨过新身份首绘：第一参考采用来源页 1995 分节及图注明确的古天乐杨过原图，保留其窄长俊秀骨相、浓直眉、清晰颧颌和坚定眼神；重新绘成正面端正的完整写实人物，浅水墨仅作背景。以青年断右臂、玄铁重剑练成后且重阳宫救援前为唯一阶段。参考中的双臂、侧倾、影视服饰及细剑均不移植。默认两张独立原生 2:3 candidate；不以精确占高或小衣纹差异机械重绘，不改变任何基线审批状态。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yangguo__ch03_youth_onearm_base/prompt-46d35237858dfb2e36e147f026c29e7575c64f81137bd0b3bdf82435c78fa298.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create one beautiful, fully rendered, full-length character illustration of YANG GUO / 杨过 for a Chinese wuxia game. This is a NEW CHARACTER IDENTITY, recognizably based on LOUIS KOO / 古天乐 as Yang Guo in the 1995 TV adaptation, using the FIRST supplied image as the primary and only facial identity reference. The user explicitly authorizes this classic screen identity. Preserve his recognizable facial structure rather than inventing a generic handsome man or copying a project baseline face. Reference hierarchy is strict: image 1 FACE IDENTITY ONLY; image 2 PAINTING FINISH AND MUTED MALE PALETTE ONLY; image 3 PALE INK LANDSCAPE BACKGROUND ONLY. Do not borrow any face from image 2 or image 3.

FACE AND PRESENCE: A handsome young adult man, clean shaven, with the first reference's long narrow oval face, clearly articulated cheekbones, crisp angular jaw and defined chin, dark substantial almost-straight brows with expressive inner ends, focused dark almond-shaped eyes, a straight narrow high nose bridge, and a neatly defined closed mouth with a moderate upper lip and subtly fuller lower lip. Keep the recognizable relationship between his brows, eyes, nose, cheekbones and jaw. Warm natural skin tone, youthful but weathered by experience, quiet intensity and self-possession, a hint of proud independence and loneliness; no bitter grimace and no villainous sneer. He is a memorable leading swordsman, slender and strong without exaggerated muscles. Render his face, eyes and visible left hand sharply, with coherent realistic anatomy and gentle tonal modelling.

FRONT-FACING IDENTITY VIEW: Head upright and anatomically centered over the neck, face directly toward the viewer, both eyes on a horizontal line, head vertical with no tilt, roll or backward lean. Eye-level camera, neutral perspective, calm direct gaze, chin naturally level. Keep both sides of the face readable and shoulders comfortably open. The full body faces forward in a grounded relaxed stance, with the feet naturally apart. Do not reproduce the first reference's leaning head, raised-arm action or cropped movie-still composition.

CANONICAL PROJECT STAGE: 成年青年杨过，南宋汉族，古墓传人；郭芙斩断其右臂之后，已经在剑冢练成玄铁重剑，尚未前往重阳宫救援，也尚未经历十六年等待。这是本阶段的单人基础立绘，不是少年双臂版、十六年后神雕大侠或黯然销魂掌终局形象。长发整洁束起，少量自然鬓发即可，无白鬓，无面具。

BODY AND RIGHT-SIDE ABSENCE: His anatomical RIGHT ARM IS MISSING; his anatomical LEFT ARM and both legs are present and correctly formed. In this straight frontal view, the missing right side is on the viewer's LEFT, and his visible left arm is on the viewer's RIGHT. The empty RIGHT sleeve is neatly folded and secured at his right waist, distinct from the torso and visibly empty, with no right hand, no prosthesis and no exposed or bleeding stump. Do not assert an exact amputation level. The remaining left shoulder and forearm have credible, restrained sword-training strength. Present him with dignity and normal balance. Do not copy the two-armed anatomy or arm gestures from the screen photograph.

CLOTHING: Complete, opaque, well-constructed South Song Han martial-traveller clothes: a blue-grey long tunic with a crossed collar closing to the wearer's right, the wearer's left collar flap over his right flap; charcoal-grey narrow cloth belt, a fitted left sleeve, coordinated dark trousers and plain dark cloth shoes. Right empty sleeve is folded and fastened at the right waist. The tunic is a continuous cloth garment with intact seams, connected panels and an unbroken hem. Realistic broad fabric folds and modest natural fibre texture, clean readable silhouette, no holes, ragged paper edges, disintegrating cloth or exposed paper inside the body. No checkered television vest, white screen costume, copied television headpiece or added cape.

ONLY PROP: His LEFT HAND alone grips one XUANTIE HEAVY SWORD / 玄铁重剑, eq_xuantiejian. A dark, weighty straight iron sword with a wide plain blunt blade, a rounded blunt tip and an unadorned simple grip; no gems, elaborate carving or glowing edges. Hold it low outside his left leg, angled gently downward so the tip lightly touches the ground and its weight is credible. Show the entire hilt, the continuous thick straight blade and the complete tip. Five coherent left-hand fingers grip the hilt naturally without fusing into it. This is one sword only, no sheath or second weapon. Do not interpret the generic equipment category 'two-handed' as requiring a second arm: this character's canonical one-armed stage requires LEFT-HAND-ONLY use.

RENDERING: A refined Chinese character illustration with a beautiful REALISTIC HUMAN FIGURE. Fully modelled face, complete visible left hand, continuous solid skin, complete opaque woven garments and a solid readable sword. Skin, hair, fabric and metal have distinct believable materials. Soft diffuse light, natural depth, restrained blue-grey and charcoal colours with warm skin. Subtle painterly craftsmanship is welcome, but the person is never made of ink fragments, paper holes, dry-brush gaps or dissolving marks. No unfinished face or clothes. This is a newly composed illustration, not a retouched photograph or a copied film frame.

BACKGROUND AND OUTPUT: A very pale, unobtrusive ink-wash landscape on an opaque warm light-grey paper ground: distant soft mountain shapes and thin mist, ample empty space, with a modest contact shadow beneath his feet. Ink wash and visible paper texture belong to the BACKGROUND ONLY and must not erode the figure, garment edges or weapon. No additional person, giant eagle, caption, seal or ornamental frame. Native vertical 2:3 PNG, one single complete full-body figure per image. Keep the head, left hand, both feet, full hem and the sword's entire endpoints comfortably inside the canvas with natural margins. Use natural adult proportions without imposing a numeric height-coverage or head-count gate. Produce the image in the tool's supported native 2:3 size; record its actual dimensions, preserve the returned original PNG bytes and tool provenance. All outputs remain candidate for user review.

补充明确排除：不要 head tilt 或 Dutch angle；正面头颈竖直、双眼水平，不得借参考的头部侧倾或斜镜头。

完整排除项：歪头、斜眼线、头颈偏斜、仰头、强烈侧脸、低头遮眼；复制第二参考令狐冲的脸、统一模板脸、女性化五官、萧峰宽方脸或络腮胡；粗壮健美体、幼童体貌、十六年后白鬓和中老年脸；把缺失画成左臂、补出右臂或右手、义肢、双手握剑、两个左手、额外肢体、断口流血或残肢特写；薄刃细剑、镶宝剑、木剑、紫薇软剑、第二把剑、刀鞘、弯折或断裂的剑、悬浮剑、手剑融合；电视白色衣装、格纹外褂或原剧照发饰与动作；面具、白发、明清服饰、现代服饰、左衽、镜像、透明衣料、裸露；碎墨脸、模糊眼睛、缺块皮肤、人物内部纸纹透白、侵蚀布片、断裂衣摆、散落的非实体衣料、过曝融边、过密墨点吞没手指；摄影截图、塑料皮肤、三维模型感、动漫大眼、过度磨皮；多人物、神雕、战斗特效、龙形能量、法阵、字句、题款、装饰水印、印章、分格或多视角；裁掉头顶、脚、左手、衣摆或兵器端点。不得删除或伪造工具原有溯源标识。 不要 head tilt 或 Dutch angle；正面头颈竖直、双眼水平，不得借参考的头部侧倾或斜镜头。
```

## 排除项

歪头、斜眼线、头颈偏斜、仰头、强烈侧脸、低头遮眼；复制第二参考令狐冲的脸、统一模板脸、女性化五官、萧峰宽方脸或络腮胡；粗壮健美体、幼童体貌、十六年后白鬓和中老年脸；把缺失画成左臂、补出右臂或右手、义肢、双手握剑、两个左手、额外肢体、断口流血或残肢特写；薄刃细剑、镶宝剑、木剑、紫薇软剑、第二把剑、刀鞘、弯折或断裂的剑、悬浮剑、手剑融合；电视白色衣装、格纹外褂或原剧照发饰与动作；面具、白发、明清服饰、现代服饰、左衽、镜像、透明衣料、裸露；碎墨脸、模糊眼睛、缺块皮肤、人物内部纸纹透白、侵蚀布片、断裂衣摆、散落的非实体衣料、过曝融边、过密墨点吞没手指；摄影截图、塑料皮肤、三维模型感、动漫大眼、过度磨皮；多人物、神雕、战斗特效、龙形能量、法阵、字句、题款、装饰水印、印章、分格或多视角；裁掉头顶、脚、左手、衣摆或兵器端点。不得删除或伪造工具原有溯源标识。 不要 head tilt 或 Dutch angle；正面头颈竖直、双眼水平，不得借参考的头部侧倾或斜镜头。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yangguo__ch03_youth_onearm_base.prepared.json`。

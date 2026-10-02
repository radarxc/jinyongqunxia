---
asset_id: por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm
subject_id: npc_xiaofeng
name: 萧峰
book: ch01_tianlong
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: shaoshi_dragon_palm
scene_title: 少室山·降龙护人
stage: 壮年，约三十岁。已为辽南院大王，南返少室山、出掌相护的阶段；不是重新担任丐帮帮主。
references:
- path: .agents/coord/imagegen-reference/hero-20261001/classic_qiaofeng_still.png
  use: 已实际查看经典乔峰影视图，主要人物神态骨相及真实皮肤布料光影启发；重绘为完整写实国风插画，不复制摄影噪点、群像、前伸手透视或衣装细节。
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 已实际查看作者指定male项目基线；仅低饱和色卡和同类气质，不继承碎墨笔触、破布剪影、原脸、竹棒或姿态；candidate审批不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看用户水墨参考，仅背景淡墨山水与留白，不复制女性人物、白青衣装或将纸纹侵入人物本体。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "萧峰基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
---

# 萧峰 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。萧峰基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】少室山淡墨远峰、几株松影与少林山门一角；人物后上方用很淡的灰墨勾出一条不闭合的龙形意象（象征降龙十八掌，是平面的水墨笔意、不发光、不接触人物）。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】萧峰，《天龙八部》，少室山·降龙护人。阶段：壮年，约三十岁。已为辽南院大王，南返少室山、出掌相护的阶段；不是重新担任丐帮帮主。
【身份参考】随提示词上传的第 1 张图是萧峰本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（身材高大魁伟（比常人高出半头）、肩宽背厚；四方国字脸、下颌方正，浓黑粗眉、眉骨突出，一双大眼目光如电，高鼻梁、鼻翼宽，阔口厚唇，两颊与下巴是短而硬的络腮胡茬，脸上有风霜晒痕、额头两道浅横纹；约三十岁）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】已为辽国南院大王、穿简洁的北地旅装（非王冠礼服）：深炭灰右衽长袍、温灰白内领、深灰腰束，肩上一件完整的暗灰短毡氅，深色长裤、行旅布靴，深灰裹巾包髻。
【动作与神情】平视略正面的稳健弓步，双脚真实承重；右掌向前护人，左掌在胸腹旁蓄势，每只手五根手指清楚；宽胸打开，有克制的力量与领袖气度。
【器物】双手空掌，没有竹棒或刀剑。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_xiaofeng
- book：ch01_tianlong
- gender：male
- age_variant：prime
- scene_title：少室山·降龙护人
- scene_key：shaoshi_dragon_palm
- stage：壮年，约三十岁。已为辽南院大王，南返少室山、出掌相护的阶段；不是重新担任丐帮帮主。

## 本轮人物写实规范

作者最新纠正首样：萧峰少室山降龙，人物美观写实、衣料完整、背景水墨。旧碎墨初版只作历史，绝不计此轮风格修正。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm/prompt-9a09e544bb1af9914f66f9bc6706c84344f5279a29c4acda1c0f1223dbd179af.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. This is a deliberate correction of earlier ragged, fragmented ink figures. The HUMAN FIGURE must be beautifully and coherently painted: solid continuous anatomy, fine natural skin, well-formed face, believable soft light and shadow, intact carefully tailored cloth, clean continuous silhouette. NO dry-brush gaps, white flecks, torn edges, collage fragments, paper texture erosion, scratches or watercolor mottling anywhere on the man's face, skin, clothing or boots. Keep the painterly ink effects ONLY in the distant background. This is refined hand-painted realism, not a photograph, movie screenshot, 3D render or plastic game model.

REFERENCE ROLES: Image 1 is an authorized classic portrayal of Qiao Feng: use its charismatic, resolute facial structure, adult masculine presence and credible skin/cloth lighting as the PRIMARY guide; reinterpret him as a full-body illustration, without copying the foreshortened hand, background people, photo crop or fuzzy pixels. Image 2 is a project male palette guide ONLY; do not inherit its rough ink surface, ragged garments, old face, bamboo staff or pose. Image 3 supplies a faint ink landscape treatment ONLY; do not copy the woman, her face, white dress, hair or body. Text below overrides all reference costume and rendering traits. Make a clearly new complete realistic figure, not a clean-up that leaves the old torn silhouette.

萧峰，《天龙八部》少室山相护阶段，三十岁上下壮年，已经为辽南院大王但穿简洁北地旅装，非王冠礼服。高大宽厚、强健而真实的身材；方阔立体的骨相、浓眉深目、鼻梁与阔口自然，整齐短络腮胡，健康略古铜肤色。目光凛然正直、沉稳有担当，五官俊朗而不是瘦削书生或怒目反派。皮肤真实细腻，鼻翼颧骨与手部用连贯柔和明暗塑造，不磨成塑料，也不画粗糙斑驳面具。

衣装必须全新重画为完整、整洁、可穿的裁剪：深炭灰右衽长袍，内领少量温灰白，深灰细织腰束，肩上完整的暗灰短毡氅。短氅边缘和袖口平整连续，有明确收边；袍摆为完整大片织物，仅受动作扬起，不分裂成条带。袖口适当收束以露出自然手部，腰部层次精炼，不缠绕大量布条。深色长裤、完整朴素行旅布靴；不加金饰铠甲。头上深灰裹巾完整收好黑发，短鬓自然，没有乱飞碎发长带。衣料有真实织物厚度，但仅少量宽阔、有重量的主褶，表面清洁平顺，衣摆没有任何撕裂、补丁、破洞、纸屑、毛边或风化斑点。服装简朴体现身份，美观不靠奢华。

完整全身，平视三分之四略正面，足底真实承重的稳健弓步，右掌朝前护人，左掌在胸腹旁蓄势；一掌一掌各有五根自然手指。肩胯贯通、宽胸打开、双臂结构可信，身体具有克制的力量和领袖气度。手掌不靠近镜头夸大，头顶、双手、衣摆、两条腿与双靴全部完整入画并留边。双手空掌，没有竹棒刀剑。淡淡掌风只可在人物外缘之后，不能把手或衣服溶解。

背景仍为浅淡水墨：少室山远峰、少量松影和少林山门一角，在人物后方留出充分纸面。上方偏后以很淡的灰墨勾出不闭合的龙形意象，表达降龙十八掌，背景对比明显低于人物。龙是平面艺术象征，不是实体神龙，不发光、不咬人、不穿透身体，不覆盖人脸和衣料。整个人物从背景独立清晰地站出来；画面高级、安静而有英雄气。低饱和炭灰、暖灰与微少墨青，肤色自然温润，左上柔和光线，人物体积完整而背景轻盈。竖幅2:3，目标2048×3072PNG，按工具原生尺寸输出，不在图中画标尺或文字；不透明背景。

排除项：人物碎墨、飞白裂纹、纸屑拼贴、颗粒侵蚀、撕烂衣角、流苏般碎袍、污渍破洞、过度褶皱碎带、斑驳脸、漂白磨皮、动漫大眼、夸张健美、血污裸胸、现代服饰、清辫、金冠、铠甲、额外人、实体兵器、多肢多指、错接手腕、裁切头足或手、分格多视图、摄影截图、三维塑料感、题字题款、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

人物碎墨、飞白裂纹、纸屑拼贴、颗粒侵蚀、撕烂衣角、流苏般碎袍、污渍破洞、过度褶皱碎带、斑驳脸、漂白磨皮、动漫大眼、夸张健美、血污裸胸、现代服饰、清辫、金冠、铠甲、额外人、实体兵器、多肢多指、错接手腕、裁切头足或手、分格多视图、摄影截图、三维塑料感、题字题款、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.prepared.json`。

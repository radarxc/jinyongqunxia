---
asset_id: por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard
subject_id: npc_xiaofeng
name: 萧峰
book: ch01_tianlong
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: juxianzhuang_guard
scene_title: 聚贤庄·孤身护人
stage: 壮年，约三十岁。为救治阿朱而赴聚贤庄，交锋已起但尚未到重伤、黑衣人救走的结尾。
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并验证新写实首样；同一萧峰面容、真实皮肤体积、完整布料画法。只保持身份与人物绘法，本场年龄服装动作器物背景另绘，不复制少室掌势或龙。
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 作者指定male基线已看，仅低饱和色卡；绝不沿用其碎墨、破衣、旧脸、竹棒或站姿。原candidate不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已查看，仅背景水墨山水和留白，不借用女子或把纸纹侵入人物。
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
【场景背景】聚贤庄的淡墨庄门、短墙、几笔被扰动的地尘和酒桌一角；没有龙影。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】萧峰，《天龙八部》，聚贤庄·孤身护人。阶段：壮年，约三十岁。为救治阿朱而赴聚贤庄，交锋已起但尚未到重伤、黑衣人救走的结尾。
【身份参考】随提示词上传的第 1 张图是萧峰本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（身材高大魁伟（比常人高出半头）、肩宽背厚；四方国字脸、下颌方正，浓黑粗眉、眉骨突出，一双大眼目光如电，高鼻梁、鼻翼宽，阔口厚唇，两颊与下巴是短而硬的络腮胡茬，脸上有风霜晒痕、额头两道浅横纹；约三十岁）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】灰色右衽旧布长袍、深灰短外衣、素白内领，窄布腰带，深色长裤与布鞋，深褐裹巾包髻；衣服完整整洁。
【动作与神情】两脚前后错开、重心下沉；一掌护在身前，另一手收在肋旁，目光坚定地盯住画外的威胁；身后留出被保护者的空间（不画那个人）。
【器物】不持兵器；身旁酒桌一角可放一只空酒碗作为场景线索。
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
- scene_title：聚贤庄·孤身护人
- scene_key：juxianzhuang_guard
- stage：壮年，约三十岁。为救治阿朱而赴聚贤庄，交锋已起但尚未到重伤、黑衣人救走的结尾。

## 本轮人物写实规范

作者最新人物美观写实修正：聚贤庄·孤身护人；全身完整衣料与自然面容，背景水墨。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard/prompt-129843fcbf4fbef2d9f84ffcdd513d78bb45ed033ee0f42fd83644fc2d76111a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

参考第一张是已经修正好的同人萧峰写实首样，保持其成熟英气面容、方阔骨相与强健体格，以及精细自然皮肤和完整衣料；本场另行构图，绝不复制其掌势、北地披氅或龙影。第二male基线仅色调，忽略它的破布与碎墨画法。第三女子图仅背景墨韵，不借女性脸、体态或衣装。

萧峰，《天龙八部》，聚贤庄·孤身护人。阶段：壮年，约三十岁。为救治阿朱而赴聚贤庄，交锋已起但尚未到重伤、黑衣人救走的结尾。
人物与衣装动作：高大结实、宽额方颌、浓眉深目，胸肩有力量而不过度健美；坚毅、宽厚，英雄气来自判断与担当。 完整灰布右衽长袍、简洁深灰外衣、少量素白内领，窄布腰束、深色长裤与朴素布鞋，深灰裹巾整齐收髻。衣料虽朴素但完整整洁，袖口和衣摆连续收边，无破洞、撕裂、污渍、毛边或碎片。此时是中原行旅，不复制少室首样的北地短毡氅。 两脚前后错开、重心下沉；一掌护在身体前侧，另一手收在肋旁，视线坚定盯住画外威胁；背后留出受到保护者的空间但不画第二人。
器物：不持兵器；庄内桌边一只空酒碗可作为低对比场景线索。
背景：淡墨庄门、短墙、几笔被扰动的地尘，酒桌仅一角。 不使用龙影，本场以独立承压与保护姿态区分少室降龙场。 背景低对比，人物边缘清楚；只保留能够定位场景的少量轮廓，不画其他人物、敌群或写实摄影场景。
仅一个完整人物，头顶、双手、衣摆、两腿双鞋和器物完整入画，自然留边，真实承重。温润肤色、低饱和灰衣、柔和左上光。背景淡而可辨，不能侵入切碎人物。竖幅2:3目标2048×3072PNG，实际工具原生输出，不透明。

排除项：人物飞白、碎墨、拼贴纸屑、颗粒侵蚀、破布、撕裂衣角、斑驳脸、过度褶皱和碎带；不要复制少室山背景、龙影与北地毡氅。不要无依据兵器或竹棒、多肢多指、手物错接、裁切头足或器物、多人群像、摄影截图、3D塑料质感、现代服装、金冠铠甲、文字题款、印章logo或新增水印。保留工具自身溯源。
```

## 排除项

人物飞白、碎墨、拼贴纸屑、颗粒侵蚀、破布、撕裂衣角、斑驳脸、过度褶皱和碎带；不要复制少室山背景、龙影与北地毡氅。不要无依据兵器或竹棒、多肢多指、手物错接、裁切头足或器物、多人群像、摄影截图、3D塑料质感、现代服装、金冠铠甲、文字题款、印章logo或新增水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.prepared.json`。

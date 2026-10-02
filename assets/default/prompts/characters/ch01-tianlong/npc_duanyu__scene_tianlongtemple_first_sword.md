---
asset_id: por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword
subject_id: npc_duanyu
name: 段誉
book: ch01_tianlong
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: tianlongtemple_first_sword
scene_title: 天龙寺·碧烟悟剑
stage: 青年，保留秀雅书生骨相，不作成熟帝王脸。在天龙寺护经冲突中观看图谱、领悟六脉；取初悟时刻，尚未进入鸠摩智挟持东行阶段。 对应《天龙八部》第10回。
references:
- path: assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_wuliang_fan.png
  use: 待本人首幅新写实场景生成、保存并核验 user_character_realism_20261001 后才可使用；当前不声称已查看该新版本。路径即使存在旧初版也不满足依赖。仅保持本人身份与写实人物质量，本场阶段服饰动作器物另绘。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；只取自然皮肤、完整体积、连贯布料及人物写实完成度，绝不借其身份、男性形象、服装、姿势或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际查看的同性别项目基线，仅低饱和色卡；不作为人物画法或身份参考，不继承破布、碎墨、纸纹、脸、发饰、武器与姿态。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户原水墨参考，仅背景淡墨山水、留白及环境层次；完全忽略图中人物、衣料与肤质画法，不将纸纹和飞白带入新人物。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "段誉基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_shizi_base.png
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
---

# 段誉 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。段誉基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】大理天龙寺：极浅的寺院柱脚、素壁与淡碧色香烟；不画僧人与佛像人形。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】段誉，《天龙八部》，天龙寺·碧烟悟剑。阶段：青年，保留秀雅书生骨相，不作成熟帝王脸。在天龙寺护经冲突中观看图谱、领悟六脉；取初悟时刻，尚未进入鸠摩智挟持东行阶段。 对应《天龙八部》第10回。
【身份参考】随提示词上传的第 1 张图是段誉本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（清瘦的长圆脸、额头饱满，眉毛细长平顺、眉尾略垂，眼睛细长、笑起来眼尾弯弯，鼻梁细直、鼻头略圆，嘴唇略厚、嘴角常带一点憨直的笑；肤色白净但有真实纹理，一身书卷气，不是偶像脸）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】浅青俗家长袍、素白交领内衫、长裤，黑发束起（不剃头、不穿僧袍）。
【动作与神情】完整盘坐在低蒲团上，双膝和双脚清楚；一手扶着少许展开的图谱，另一手指势若有所悟，目光专注。
【器物】少许展开的图谱，线迹不写可读文字；身旁一缕淡淡香烟。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_duanyu
- book：ch01_tianlong
- gender：male
- age_variant：youth
- scene_title：天龙寺·碧烟悟剑
- scene_key：tianlongtemple_first_sword
- stage：青年，保留秀雅书生骨相，不作成熟帝王脸。在天龙寺护经冲突中观看图谱、领悟六脉；取初悟时刻，尚未进入鸠摩智挟持东行阶段。 对应《天龙八部》第10回。

## 本轮人物写实规范

作者最新人物美观写实修正：天龙寺·碧烟悟剑；本人身份连续，人物完整写实，水墨仅背景。依赖本人首幅 user_character_realism_20261001，不能沿用旧初版解除依赖。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword/prompt-981fc0b4829093c339247b47f419e41bc0f3d749ba397f5f11e70678317bde49.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须是已完成并经父任务验证 realism_revision=user_character_realism_20261001 的本人首幅写实场景；使用同一面容、体型与完整写实人物质量，本场重新绘制服饰、发式、动作、道具和背景。该路径已有旧初版也不满足依赖，未经新版 revision 核验不得提交生成。
第二参考是已实际查看的新版萧峰少室山首样，仅作为人物渲染质量标准：自然面容、细腻皮肤、连续光影、完整布料、干净收边。它不是身份参考，不能借用萧峰的脸、年龄、胡须、裹巾、体型、男装或动作。本角色仍是段誉，不可变成萧峰。
第三参考是同性别原项目基线，仅低饱和色卡，不参考脸、人物笔触、碎墨、衣料细节、姿态或器物。
第四参考仅用于背景水墨山水、浅淡墨韵和留白；不参考其中人物、脸、皮肤、白青衣装、发饰或纸纹透衣的画法。

段誉，《天龙八部》，天龙寺·碧烟悟剑。阶段：青年，保留秀雅书生骨相，不作成熟帝王脸。在天龙寺护经冲突中观看图谱、领悟六脉；取初悟时刻，尚未进入鸠摩智挟持东行阶段。 对应《天龙八部》第10回。
人物与完整衣装动作：清俊的长椭圆脸、明净眼神，肩背修长而非瘦弱；保留贵公子的教养和不喜伤人的底色，英雄气来自急难时的担当。 完整黑发束起，素簪或简洁束发；全程俗家装束，不剃头、不戴帝王冕旒。 完整浅青俗家长袍、素白交领内衫与深浅相宜的长裤，衣料柔顺厚薄可信。盘坐处有少量承重的大褶，膝腿和双足的整体形体清楚；保持黑发束发，不穿僧袍，不把段誉误作剃度后的段正明。 完整盘坐于低蒲团，双膝、双脚与袍摆构成清楚的坐姿；一手扶展开少许的图谱，另一手指势若有所悟，目光专注而非炫技。 人物面部、皮肤、头发、衣服与鞋采用完整连贯的写实国风插画塑造；实体体积清楚、柔和光影连续、轮廓干净，墨染和纸面纹理只留在背景。
器物与阶段限制：少量展开的图谱，线迹不写可读文字；旁侧一缕淡香烟。
仅背景使用水墨：极浅寺院柱脚、素壁和淡碧烟；不画枯荣、诸僧或佛像人形。 烟线只帮助观者理解凝神观摩，不把无形剑气变成六把实体光剑。 背景只作浅淡场景识别；无第二人物、多人战场、完整神像、可读题字或替身残影。
本场具体构图：完整盘坐于低蒲团，保留青年俗家束发；一手扶少量展开的图谱，另一手若有所悟。膝腿与双足组成完整坐姿，不悬浮、不裁成半身。寺院香烟在背景，不能把烟纹叠在脸、皮肤或衣料上。
单人单视图，完整头顶、躯干、双手、两腿双足及指定器物都入画，站坐依本场而定，自然留边、真实承重。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。肤质细腻自然、衣料完整连贯，少量宽缓承重褶；画面墨韵与纸感只用于背景，不能侵入人物。

完整排除项：不要剃头、僧袍、折扇、悬浮盘坐、下身截断、实体光剑或裸体经络图。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。
```

## 排除项

不要剃头、僧袍、折扇、悬浮盘坐、下身截断、实体光剑或裸体经络图。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword.prepared.json`。

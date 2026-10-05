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
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_jiaozhu_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "e272b054c1b027b808e198a9fc1aea0bf315d83e1c2e2ba3847cba9b5026607d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/zhangwuji_still1.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "05cda173494604ad685f8c87550572831ccb7e4f0f637791bb5b2cf213c20783"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/zhangwuji_game.jpg", "use": "经典武侠游戏插画风格；只借绘画气质、线条、造型感", "sha256": "357b667170634653a545d4881ddabac745cc971539c2e9d1b909ae3ca5085601"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
status: candidate
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
classic_ref:
  version: 2003 年苏有朋、贾静雯版《倚天屠龙记》（作者 AR-32 指定）（随张无忌基础立绘）
  via: npc_zhangwuji.md（por_npc_zhangwuji__ch04_youth_jiaozhu_base 本轮新图）
  stills: []
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_jiaozhu_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/zhangwuji_still1.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/zhangwuji_game.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
redo_reason: "作者 10-02 晚：复合基线风格精修"
codex_prompt_rev: 2026-10-02
composite_job: por_npc_zhangwuji__ch04_youth_scene_jiuyang.resume3
---

# 张无忌 · 人物写实修正

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_zhangwuji__ch04_youth_scene_jiuyang.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【身份】第一张是本轮该主角新基础立绘，面部骨相必须保持一致，只依下文变年龄、衣物、姿态、道具与背景；第二张之后的剧照仅借造型，游戏图仅借古典武侠绘画气质，不恢复演员五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】保留下面指定的阶段场景、建筑和道具；淡水墨空间、暖浅灰纸感、自然远近层次，不抠图。
同一张无忌成年青年面容，幽谷修习九阳的早期成年阶段。灰褐粗布旧衣、简单腰绳、布靴和朴素束发，衣物完整，衣角有自然磨损。两手捧已经取出的经卷，神情温厚专注，身侧一只已康复白猿安静坐于岩石，不画开腹、伤口或手术。背景保留幽谷绿树、溪流、岩洞与温和日光；经卷只有模糊墨痕无可读长文。服装、道具和环境与后期教主阶段明确不同。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 AR-32（7 号出图员，codex exec · image_gen 出图）：上传本轮新出的 por_npc_zhangwuji__ch04_youth_jiaozhu_base（第 1 张，缩到长边 1024 的 JPEG）作身份参考，两张同性别缩小版基线放在最后；场景内容沿用原设定，衣装跟随新版基础立绘。旧提示词保留在后文作历史。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG，也不是油画。
【场景背景】昆仑山深处的幽谷：峭壁夹成狭谷，近处野果枝与少量苔石，远处极淡的瀑布薄雾。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】张无忌，《倚天屠龙记》，幽谷九阳。阶段：昆仑幽谷中修习九阳真经的后期、出谷之前，已是初成年的青年（寒毒渐解，不是病弱孩童）。
【身份参考】随提示词上传的第 1 张图是张无忌本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（偏长的鹅蛋脸、浓黑平直的剑眉、温和明亮的眼睛、挺直的鼻梁、厚薄适中的嘴唇，年轻无须），头顶小发髻的发式也一致；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】米褐色粗布交领短上衣、浅灰长裤、窄布腰束、旧布鞋；黑发在头顶简单束成小髻（与基础立绘同样的发式），不戴冠、没有肩带；衣服旧而完整。
【动作与神情】站在谷石旁，双手捧着一卷摊开的旧经卷低头细看，神情专注温厚。
【器物】一卷旧经卷（素纸折页，不画可读文字）；一只白猿蹲在人物侧后下方的石头上，作为次要动物，肢体与人分开、腹部完整无伤。
【体态】成年男子的身体比例（约 7.5 头身），身材匀称结实，衣着完整。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人（设定里的动物除外）；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽，不要水平镜像；不要现代物品、发光特效、法阵或能量光；不要换成另一张脸；不要分身残影；不要可读文字或图谱口诀。不要圣火令、屠龙刀、倚天剑、教主冠服；不要开腹创伤；不要把白猿画成人或宠物，白猿不要与人的手臂粘连。
【画风基线】上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和水墨处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

---

以下为 AR-32 之前的历史提示词与说明，仅作历史保留。

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

## 原著依据

- 《倚天屠龙记》十六 剥极而复参九阳：“四本薄薄的经书”；https://www.xuges.com/wuxia/jinyong/yttlj/112.htm
- AR-82 返修约束（本节优先于历史提示词）：只将双手捧着的山水卷轴改成一本打开的薄经书，经页为异文中夹蝇头汉字的小字，不画山水。旁边近地的石头上放另三本薄经书与打开油布包，总共四本。脸、体格、衣服、手指、白猿、风景保持原样。

---
asset_id: por_npc_shipotian__ch06_youth_scene_jinwu
subject_id: npc_shipotian
name: 石破天
book: ch06_xiake
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_jinwu.png
manifest: assets/default/character/male/ch06/manifest.yaml
asset_variant: scene
scene_key: jinwu
scene_title: 紫烟岛学刀
stage: 史小翠新立金乌派，石破天拜师学刀；青年初成。 开篇之后已有成长间隔，当前按青年肩背、身高与面部发育；不把首场幼童体型锁到此图。
references:
- path: assets/default/character/male/ch06/por_npc_shipotian__ch06_child_scene_xuantie.png
  use: 等待本人首场新写实 PNG 生成、保存并核验 realism_revision=user_character_realism_20261001 后才可使用；当前不声称已查看该新版本。路径存在旧初版不满足依赖。只保持本人面容身份及新版写实人物质量；本场年龄、发式、伤残、衣饰、姿势、器物和背景另绘。 首场是童年/幼少年，本场青年需正常发育、长大，不能把儿童头身、面颊和身高直接复制过来。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅借自然面容与肤质的描绘质量、完整坚实体积、连贯光影、连贯布料和干净轮廓，不复制萧峰的脸、性别、年龄、胡须、头巾、体型、服饰、姿态或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际查看的对应性别项目基线，仅低饱和配色色卡；此位置不作本人身份或人物画法参考，不继承碎墨、飞白、纸纹透衣、破布、脸、年龄、衣饰、武器与姿势。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户王语嫣水墨图，只用于背景的浅淡山水、留白与环境层次；完全忽略其中人物、脸、体型、肤质、服饰、发饰和人物笔触，不让背景纸纹与飞白侵入本场人物。
status: redo
redo_reason: "基础立绘通过；本场景图的脸是少年模样（石壁会意一张又是另一张偶像脸），与基础立绘不一致、违反禁止幼态；以基础立绘为身份参考重画。"
reference_upload:
  - assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_jinwu_base.png
  - assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 石破天 · 人物写实修正

## Gemini 提示词

> 2026-10-02 立绘审核（B 组，见 `tools/agents/reports/REVIEW-portraits-B-ch05-09.md`）：**微调重出（场景）**（P3）。基础立绘通过；本场景图的脸是少年模样（石壁会意一张又是另一张偶像脸），与基础立绘不一致、违反禁止幼态；以基础立绘为身份参考重画。
>
> 参考上传：`assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_jinwu_base.png`。
>
> 依据与待考：场景事实沿用原场景稿（阶段、动作、器物）；画面细节为原创扩展。
>
> 本节是新的出图依据：把下面代码块原样粘贴给 Gemini（有参考上传的先上传图片）。下方原有段落只作历史保留，不再交给出图。

```text
生成一张 2:3 竖幅单人全身剧情场景图。

上传的图片是石破天本人的基础立绘，作为身份参考：保持同一张脸（脸型、眉眼、鼻子、嘴、肤色、发际线）和同样的成年年龄、体型，让人一眼认出是同一个人；不要照搬参考图的站姿、构图和背景，服饰、动作和场景按下文。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：石破天，《侠客行》男主角，约二十岁的成年青年男子，身材结实匀称、肩背宽厚，日晒肤色，浓眉、眼睛明亮，神情忠厚、坦诚、好奇。
场景「紫烟岛学刀」：史小翠新立金乌派、收石破天为徒、教他金乌刀法的时期。人物独自持一把柴刀演练后收势站立，忠厚专注。衣装：暖灰布上衣、浅褐裤子、短束带与厚布鞋，肩臂结实。背景：岛上小林、柿树与石洞口，枯枝和水线都很淡。

构图：竖幅 2:3，单人全身剧情场景图，人物是画面主体，从头顶到双脚完整入画（坐姿也要看得见头、身体、双手、双腿和双脚）；场景用浅淡的写实水墨笔法画出，留白充足，背景不能压过人物、不能侵入人物轮廓。画面里只有这一个人物。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要少年或孩子的脸和身材；不要偶像化的俊美脸；不要换成另一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

## 人物与阶段

- subject_id：npc_shipotian
- book：ch06_xiake
- gender：male
- age_variant：youth
- scene_title：紫烟岛学刀
- scene_key：jinwu
- stage：史小翠新立金乌派，石破天拜师学刀；青年初成。 开篇之后已有成长间隔，当前按青年肩背、身高与面部发育；不把首场幼童体型锁到此图。

## 本轮人物写实规范

作者最新写实修正：紫烟岛学刀；本人身份连续、实体人物完整美观写实、水墨仅背景。依赖本人首场 user_character_realism_20261001，旧初版不能解除依赖。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_shipotian__ch06_youth_scene_jinwu/prompt-30bf860b73ab6be5c4956dad5dc2ea2eba2faef66e493417e0d393e4d8221784.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须是已完成并经父任务验证 realism_revision=user_character_realism_20261001 的本人首幅写实场景；保持同一个人的面容特征与身份，本场重新绘制服饰、发式、动作、道具和背景。旧初版仅文件存在不满足依赖，未经新版 revision 核验和实际查看不得提交生成。 第一图为童年，仅供身份线索，本场按青年正常成长，调整身高、骨架与面颊，绝不锁定儿童身体。
第二参考为新版萧峰少室山首样，只提供人物绘画质量：细腻真实肤质、完整体积、连贯柔和光影、连贯完整布料及干净轮廓；绝不复用其脸、胡须、头巾、体型、年龄、男性特征、服装、姿态或龙影。本角色仍是石破天。
第三参考为对应性别项目基线，仅低饱和色卡，不取人物笔触与衣料细节。
第四参考仅用于背景水墨与留白；不取其中人物、白青衣装、肤质或纸纹透衣。

人物身份设计：石破天的独立设计：方圆偏长的脸，浓眉、眼裂自然的明亮眼睛，鼻梁自然、嘴角温厚，日晒肤色；开篇保留幼少年的头身与软面颊，长大后肩背宽实、体格健壮匀称。朴实、好奇、坦诚，绝非油滑纨绔；不以呆滞或弱智表情表现不识字，不擅自定其生父母。
石破天，《侠客行》，紫烟岛学刀。
阶段：史小翠新立金乌派，石破天拜师学刀；青年初成。 开篇之后已有成长间隔，当前按青年肩背、身高与面部发育；不把首场幼童体型锁到此图。
人物与完整衣装动作：单人全身，朴素衣裤与厚实布鞋，双手持一把柴刀演练后收势，忠厚专注。 衣装设计：暖灰布上衣、浅褐裤、短束带与厚布鞋，肩臂结实自然；不添金甲。 衣料保持完整可穿、连贯成片、剪裁清楚和整洁收边；旧衣仅显使用后的柔软色泽，不撕烂、不掉碎片、不加成排补丁、密集皱纹或碎带。 人物面部、皮肤、头发、衣服与鞋均采用美观写实的高级国风插画塑造；解剖与实体体积清楚、细腻自然肤质、连贯柔和光影、干净完整轮廓。人物上没有碎墨、纸纹侵蚀或飞白。衣料完整连贯、剪裁明确，袖口与下摆干净连续收边，只有少量自然宽缓承重褶，英雄气来自眼神、体格、姿势与合身份的衣饰。
器物与阶段限制：旧柴刀一把，质朴短柄；不是金色神刀；不同时背雪山长剑
仅背景使用水墨：浅淡水墨背景，人物为画面主体。岛上小林、柿树与石洞口，枯枝和水线均浅淡。
本场具体构图：紫烟林隙单人学刀，旧柴刀收在身前下方，身体真实转胯，忠厚而专注。
单人单视图完整全身，站姿从头顶到足；坐跪姿完整呈现躯干、双手、膝腿与足，主要器物端点入画，留自然边距。仅保留本场明确授权的代表动物，动物肢体不与人粘连。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。真实承重、关节清楚，不机械限定占高、不因衣摆轻微遮鞋返工；人物清楚居前，水墨只在背景且不侵入人体和衣服。
情节与美术边界：金乌是刀法名称，不能画三足金乌灵兽或日轮法术；具体收势为美术设计。与阿绣场使用同岛但不同林隙角度。 本场为独立经典场景变体，保留基础立绘；production record 不表示 PNG 已生成或已查看，不代表审批通过，未来实际成图仍为 candidate。服色、站坐姿及具体衣纹是美术补足，阶段装备与明确伤残优先。 本次执行 REALISTIC-CHARACTERS-20261001.md：人物美观写实、皮肤与衣料完整连续，水墨仅用于背景。旧候选仅为历史记录，不计本轮写实完成；本记录本身不是生成、保存或审批，新图实际查看通过后仍为 candidate。 第一身份引用等待本人首场的新写实版本；即使同路径已有旧 PNG 也不满足，必须核对 manifest realism_revision=user_character_realism_20261001，并保存验证、实际查看后才可注册/prepare/生成本场。

完整排除项：不要金色神刀、太阳光轮、三足乌、雪山双剑、花哨连环兵器或成年阴险公子脸。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。
```

## 排除项

不要金色神刀、太阳光轮、三足乌、雪山双剑、花哨连环兵器或成年阴险公子脸。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_shipotian__ch06_youth_scene_jinwu.prepared.json`。

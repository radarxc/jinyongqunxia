---
asset_id: por_npc_renyingying__ch05_youth_scene_quxie
subject_id: npc_renyingying
name: 任盈盈
book: ch05_xiaoao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_quxie.png
manifest: assets/default/character/female/ch05/manifest.yaml
asset_variant: scene
scene_key: quxie
scene_title: 梅庄箫声
stage: 三年后梅庄成婚与退位后的自在阶段；较竹巷略成熟。
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_renyingying__ch05_youth_shenggu_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "16995424f549c6353993aefa4744a095af1ca8a77a2e47c5aaba136675c807ae"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/renyingying_still1.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "580d5dcfda752f0d3936f14252ee33a7c49f7bebf60043c45083eca24fe1680a"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/renyingying_game.jpg", "use": "经典武侠游戏插画风格；只借绘画气质、线条、造型感", "sha256": "daa70caa7125430bccdc2efad45b77ccddc97bc11660158a4f36d0bf2ce279e8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "cd6b69da364b28cfc91738d9647b8a94962e740cc8adbef303c721bfcf352bed"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "f45e437fad61090b11ba36df0779b783b1996e6a61942c019d49a121b7d9feae"}
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_renyingying__ch05_youth_shenggu_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/renyingying_still1.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/renyingying_game.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg"
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
composite_job: por_npc_renyingying__ch05_youth_scene_quxie.resume3
---

# 任盈盈 · 人物写实修正

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_renyingying__ch05_youth_scene_quxie.resume3`；实际上传顺序见frontmatter，末两张为female项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【身份】第一张是本轮该主角新基础立绘，面部骨相必须保持一致，只依下文变年龄、衣物、姿态、道具与背景；第二张之后的剧照仅借造型，游戏图仅借古典武侠绘画气质，不恢复演员五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】保留下面指定的阶段场景、建筑和道具；淡水墨空间、暖浅灰纸感、自然远近层次，不抠图。
辞位归隐并与令狐冲琴箫相和的成年时期；同一张脸略显从容，不作中老年。淡藕灰右衽长裙、柔软短披帛、简洁发髻；独自站在梅庄湖岸缓吹竹箫，手指与箫孔关系正确，双脚完整。背景夕照湖水、梅枝与木亭，脱离教主权位的自在深情。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

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
场景「梅庄箫声」：三年后与令狐冲成婚、退出江湖纷争的时期，比竹巷时成熟一些。人物独自站在梅庄水榭边吹洞箫，双手按箫的指法自然，衣裙舒展，神态平和而有主见。衣装：温润的浅青灰衣裙与暖白内层，衣缘有小面积淡朱红镶边，素簪束发，布鞋。背景：梅庄水榭、疏梅与开阔湖面；画面里没有第二个人。

构图：竖幅 2:3，单人全身剧情场景图，人物是画面主体，从头顶到双脚完整入画（坐姿也要看得见头、身体、双手、双腿和双脚）；场景用浅淡的写实水墨笔法画出，留白充足，背景不能压过人物、不能侵入人物轮廓。画面里只有这一个人物。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要磨皮网红脸、少女幼态；不要换成另一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

## 人物与阶段

- subject_id：npc_renyingying
- book：ch05_xiaoao
- gender：female
- age_variant：youth
- scene_title：梅庄箫声
- scene_key：quxie
- stage：三年后梅庄成婚与退位后的自在阶段；较竹巷略成熟。

## 本轮人物写实规范

作者最新写实修正：梅庄箫声；本人身份连续、实体人物完整美观写实、水墨仅背景。依赖本人首场 user_character_realism_20261001，旧初版不能解除依赖。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_renyingying__ch05_youth_scene_quxie/prompt-eba421246fa5d010c877b52b63f1c9ed486029b19229f36b08f3b4ffac67a249.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须是已完成并经父任务验证 realism_revision=user_character_realism_20261001 的本人首幅写实场景；保持同一个人的面容特征与身份，本场重新绘制服饰、发式、动作、道具和背景。旧初版仅文件存在不满足依赖，未经新版 revision 核验和实际查看不得提交生成。
第二参考为新版萧峰少室山首样，只提供人物绘画质量：细腻真实肤质、完整体积、连贯柔和光影、连贯完整布料及干净轮廓；绝不复用其脸、胡须、头巾、体型、年龄、男性特征、服装、姿态或龙影。本角色仍是任盈盈。
第三参考为对应性别项目基线，仅低饱和色卡，不取人物笔触与衣料细节。
第四参考仅用于背景水墨与留白；不取其中人物、白青衣装、肤质或纸纹透衣。

人物身份设计：任盈盈的独立设计：微圆的鹅蛋脸，舒展眉弧、清亮而有判断力的眼睛，自然鼻唇，嘴角安静；年少青年女子，体态纤秀而有练武力量。清丽、含蓄、有主见，不怯弱，不复制王语嫣长窄脸、怜弱神情或发饰。早期保留年少感，三年后适度成熟而不突然中年化。
任盈盈，《笑傲江湖》，梅庄箫声。
阶段：三年后梅庄成婚与退位后的自在阶段；较竹巷略成熟。
人物与完整衣装动作：单人全身站姿吹洞箫，双手排列自然，衣裙舒展，神态平和有主见；双足完整。 衣装设计：温润浅青灰衣裙与暖白内层，小幅淡朱饰边，素簪束发，布鞋；较早期成熟三年。 衣料保持完整可穿、连贯成片、剪裁清楚和整洁收边；旧衣仅显使用后的柔软色泽，不撕烂、不掉碎片、不加成排补丁、密集皱纹或碎带。 人物面部、皮肤、头发、衣服与鞋均采用美观写实的高级国风插画塑造；解剖与实体体积清楚、细腻自然肤质、连贯柔和光影、干净完整轮廓。人物上没有碎墨、纸纹侵蚀或飞白。衣料完整连贯、剪裁明确，袖口与下摆干净连续收边，只有少量自然宽缓承重褶，英雄气来自眼神、体格、姿势与合身份的衣饰。
器物与阶段限制：洞箫一支，竖吹；不画横笛或唢呐
仅背景使用水墨：浅淡水墨背景，人物为画面主体。梅庄水榭、疏梅与开阔湖水，细淡喜绸一角可选；不画另一名演奏者。
本场具体构图：单人全身竖吹洞箫，指孔和双手位置清楚，脚立水榭地面，微风轻拂衣摆。
单人单视图完整全身，站姿从头顶到足；坐跪姿完整呈现躯干、双手、膝腿与足，主要器物端点入画，留自然边距。仅保留本场明确授权的代表动物，动物肢体不与人粘连。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。真实承重、关节清楚，不机械限定占高、不因衣摆轻微遮鞋返工；人物清楚居前，水墨只在背景且不侵入人体和衣服。
情节与美术边界：与令狐冲的琴声组成原著合奏，此幅是任盈盈一侧的单人取景；不可把二人的乐器互换。官方该回超时，依本地已核原著表。 本场为独立经典场景变体，保留基础立绘；production record 不表示 PNG 已生成或已查看，不代表审批通过，未来实际成图仍为 candidate。服色、站坐姿及具体衣纹是美术补足，阶段装备与明确伤残优先。 本次执行 REALISTIC-CHARACTERS-20261001.md：人物美观写实、皮肤与衣料完整连续，水墨仅用于背景。旧候选仅为历史记录，不计本轮写实完成；本记录本身不是生成、保存或审批，新图实际查看通过后仍为 candidate。 第一身份引用等待本人首场的新写实版本；即使同路径已有旧 PNG 也不满足，必须核对 manifest realism_revision=user_character_realism_20261001，并保存验证、实际查看后才可注册/prepare/生成本场。

完整排除项：不要七弦琴替代洞箫、横笛、另一位演奏者、清宫女装、少妇浓妆或现代婚礼。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。
```

## 排除项

不要七弦琴替代洞箫、横笛、另一位演奏者、清宫女装、少妇浓妆或现代婚礼。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_renyingying__ch05_youth_scene_quxie.prepared.json`。

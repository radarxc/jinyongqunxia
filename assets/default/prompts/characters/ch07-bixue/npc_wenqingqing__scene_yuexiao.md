---
asset_id: por_npc_wenqingqing__ch07_youth_scene_yuexiao
subject_id: npc_wenqingqing
name: 温青青
book: ch07_bixue
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_yuexiao.png
manifest: assets/default/character/female/ch07/manifest.yaml
asset_variant: scene
scene_key: yuexiao
scene_title: 花坡男装吹箫
stage: 以温青男装身份与袁承志相识的早期；少女至青年。
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_wenqingqing__ch07_youth_disguise_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "20c8a63d391b17645456ebcdd0c6d78e08e9a35cdb870cbb1255e65cda8850b8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/wenqingqing_still1.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "c26bc05d1f25c59456592e5c7ad74fb824d77638c49e4273c40c63dcdac65986"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/wenqingqing_game.jpg", "use": "经典武侠游戏插画风格；只借绘画气质、线条、造型感", "sha256": "daa70caa7125430bccdc2efad45b77ccddc97bc11660158a4f36d0bf2ce279e8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "cd6b69da364b28cfc91738d9647b8a94962e740cc8adbef303c721bfcf352bed"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "f45e437fad61090b11ba36df0779b783b1996e6a61942c019d49a121b7d9feae"}
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_wenqingqing__ch07_youth_disguise_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/wenqingqing_still1.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/wenqingqing_game.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg"
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
composite_job: por_npc_wenqingqing__ch07_youth_scene_yuexiao.resume3
---

# 温青青 · 人物写实修正

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_wenqingqing__ch07_youth_scene_yuexiao.resume3`；实际上传顺序见frontmatter，末两张为female项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【身份】第一张是本轮该主角新基础立绘，面部骨相必须保持一致，只依下文变年龄、衣物、姿态、道具与背景；第二张之后的剧照仅借造型，游戏图仅借古典武侠绘画气质，不恢复演员五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】保留下面指定的阶段场景、建筑和道具；淡水墨空间、暖浅灰纸感、自然远近层次，不抠图。
初行江湖、以男装示人的时期，成年女性同一张脸。浅青右衽书生直身男袍、深蓝腰带、窄袖与露出裤脚的便靴，袍摆不过脚踝；素簪简冠束起全部头发，排除花冠、珠钗、女式半披长发与拖地长裙，脸仍是俊秀成年女性骨相；独自伫立山间岩台，双手持竹箫吹奏，眉目灵动而警觉。背景月下山野、薄雾和疏竹，完整全身，男装不抹去成年女性身份。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 立绘审核（B 组，见 `tools/agents/reports/REVIEW-portraits-B-ch05-09.md`）：**整体重出（随基础立绘）**（P1）。基础立绘新建后需同一张脸；以新出的温青青基础立绘为身份参考重画。
>
> 参考上传：`assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_disguise_base.png`。
>
> 依据与待考：原场景稿：玫瑰坡、竹篮、洞箫与男装温青（原著有据，逐字待考）；站姿为艺术调整。
>
> 本节是新的出图依据：把下面代码块原样粘贴给 Gemini（有参考上传的先上传图片）。下方原有段落只作历史保留，不再交给出图。

```text
生成一张 2:3 竖幅单人全身剧情场景图。

上传的图片是温青青本人的基础立绘，作为身份参考：保持同一张脸（脸型、眉眼、鼻子、嘴、肤色、发际线）和同样的成年年龄、体型，让人一眼认出是同一个人；不要照搬参考图的站姿、构图和背景，服饰、动作和场景按下文。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：温青青，《碧血剑》女主角，外观约二十岁的成年年轻女子，秀气的瓜子脸、英挺上扬的细眉、明亮敏锐而倔强的眼神，成人身材比例。
场景「花坡男装吹箫」：以“温青”男装身份与袁承志相识的早期，月夜在自己种的玫瑰花坡上吹箫。人物独自站在小亭边，双手按着一支竹洞箫吹奏（箫的上端靠唇、下端斜向身前），手指与箫孔关系合理；脚边放着一只小竹篮。衣装：浅米灰男式交领短袍、淡青内衫、窄腰带、深色长裤与布靴，黑发束成男子发髻，没有女饰。背景：低矮的玫瑰花坡、淡淡月色与小亭，花只用少量淡红淡黄。

构图：竖幅 2:3，单人全身剧情场景图，人物是画面主体，从头顶到双脚完整入画（坐姿也要看得见头、身体、双手、双腿和双脚）；场景用浅淡的写实水墨笔法画出，留白充足，背景不能压过人物、不能侵入人物轮廓。画面里只有这一个人物。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要网红脸、少女幼态；不要换成另一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

## 人物与阶段

- subject_id：npc_wenqingqing
- book：ch07_bixue
- gender：female
- age_variant：youth
- scene_title：花坡男装吹箫
- scene_key：yuexiao
- stage：以温青男装身份与袁承志相识的早期；少女至青年。

## 本轮人物写实规范

花坡男装吹箫；人物美观写实、完整体积与衣料，水墨仅背景；两手按持一支竹洞箫，箫上端靠唇、下端斜向身体前侧；肩颈自然，手和箫孔连接合理。完整站在亭边，脚边竹篮留在一侧，月下低矮玫瑰坡稀淡，人物俊秀而有脾气。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_wenqingqing__ch07_youth_scene_yuexiao/prompt-8032e0a69561268648eaa99d01356b7a956125ce1302650506cd7984a9364948.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

本角色当前没有已保存的本人身份PNG，依据下述文字原创独立骨相、年龄、体型与气质；本场将建立首幅新写实身份锚点，不能把其他人换衣当作本人。第一参考为已实际查看并核验新revision的萧峰首样，只取人物自然肤质、实体体积、连续光影和完整衣料质量，绝不复用他的脸、男性外貌、胡须、体型、衣服、年龄、掌势或龙影。第二参考仅同性别项目低饱和色卡，不取身份或人物画法。第三参考仅背景水墨、淡景和留白，不取女性面孔、白青衣装或纸纹透衣。

人物身份：温青青的独立人物设计：偏短的鹅蛋脸、略扬的英挺细眉、明亮敏锐的眼睛、鼻头小巧、下颌有利落转折；体态轻捷结实而不纤弱。神情鲜活、倔强、有判断，不照搬王语嫣温柔怯静的脸。男装时期保留女性原本骨相，以束发与衣装表达伪装，不画成另一个男人；后期服装改变而眉眼身份连续。
角色与主题：温青青，花坡男装吹箫。
阶段：以温青男装身份与袁承志相识的早期；少女至青年。
人物、动作与完整衣装：单人全身男装束发，俊秀而有自己脾气；站在亭边吹洞箫，姿态自然，鞋靴完整。 浅米灰男装交领短袍、淡青内衫、窄腰束、深裤与完整布靴，黑发男装束起而无华贵女饰。衣装剪裁合体、衔接明确，箫前袖口完整，保留少女自身骨相。 人物面部、皮肤、头发、衣服和鞋均以美观写实的高级国风插画塑造：坚实完整体积、自然精细肤质、可信五官、连贯柔和光影、干净完整轮廓。衣料有明确剪裁与连续整片织物，仅少量宽缓承重褶；旧衣也完整可穿。水墨、飞白和纸纹仅允许出现在背景，不能侵入或切碎人物。
器物与阶段限制：竹洞箫一支，取尚未折断之前；小竹篮在脚边，少量素食酒器不遮脚
仅背景使用水墨：浅淡水墨背景，人物为画面主体。自种玫瑰的低丘、浅淡月色与小亭，花只着少量淡红淡黄，不成浓艳花海。 背景墨痕和纸纹停留在人物轮廓以外，不穿透衣料与皮肤。
本场具体构图：两手按持一支竹洞箫，箫上端靠唇、下端斜向身体前侧；肩颈自然，手和箫孔连接合理。完整站在亭边，脚边竹篮留在一侧，月下低矮玫瑰坡稀淡，人物俊秀而有脾气。
单人单视图完整全身，站姿从头顶到双足，坐姿完整呈现头、躯干、实际存在的手、双腿和足，主要器物端点完整入画；真实重心、自然留边，不机械限定人物占高。竖幅2:3，目标2048×3072 PNG，接受工具原生输出、不透明，保留原始PNG字节。每场两候选择一，生成后实际查看人物写实质量与事实身份，宽松自查后仍为candidate，不能自行approved。
事实与艺术边界：原著明确玫瑰坡、竹篮、洞箫与男装温青；站姿为适合全身的艺术调整，不混成任盈盈竹巷。 本场为原著事件基础上的单人艺术取景与原创衣装设计，构图不当作逐字场面复刻；独立场景不覆盖基础图。此production record只准备实际请求，不代表图片已经生成、查看或审批；原始PNG保存后仍须按宽松自查登记candidate，保留原审批状态。 本轮按REALISTIC-CHARACTERS-20261001.md重写人物美术：美观写实、自然皮肤、连贯光影、完整衣料，水墨仅背景；旧场景或旧候选不计本轮修正完成。具体衣色与姿态仍为艺术补足，原著人物、阶段、伤残与器物事实不变。实际生成与查看后才可登记本轮candidate，不自行approved。

完整排除项：不要古琴、横笛或已折断的箫，不要任盈盈竹巷、浓艳玫瑰花海、王语嫣脸与披发女裙、金蛇剑或多指粘箫。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。
```

## 排除项

不要古琴、横笛或已折断的箫，不要任盈盈竹巷、浓艳玫瑰花海、王语嫣脸与披发女裙、金蛇剑或多指粘箫。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_wenqingqing__ch07_youth_scene_yuexiao.prepared.json`。

---
asset_id: por_npc_wenqingqing__ch07_youth_scene_shiliang
subject_id: npc_wenqingqing
name: 温青青
book: ch07_bixue
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_shiliang.png
manifest: assets/default/character/female/ch07/manifest.yaml
asset_variant: scene
scene_key: shiliang
scene_title: 石梁失母
stage: 石梁温家旧事揭开、温仪身亡之后；未发生华山双腿伤。
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
composite_job: por_npc_wenqingqing__ch07_youth_scene_shiliang.resume3r2
---

# 温青青 · 石梁失母

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_wenqingqing__ch07_youth_scene_shiliang.resume3r2`；实际上传顺序见frontmatter，末两张为female项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【身份】第一张是本轮该主角新基础立绘，面部骨相必须保持一致，只依下文变年龄、衣物、姿态、道具与背景；第二张之后的剧照仅借造型，游戏图仅借古典武侠绘画气质，不恢复演员五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】保留下面指定的阶段场景、建筑和道具；淡水墨空间、暖浅灰纸感、自然远近层次，不抠图。
石梁旧事揭开、温仪身故后的时期，成年女性同一张脸。本阶段明确改为成年女性女装：米白色右衽短襦搭深灰蓝色无纹长裙，长裙下露出两只素布鞋；低挽发髻与一支素木簪，不戴男子小冠。衣物轮廓和颜色必须区别于参考基础图的浅青书生长袍，不照搬参考的外袍、绑腿或靴子，不作整套孝服；一手扶旧木门、一手轻攥素帕，目光含悲愤而不夸张哭号。背景温家旧园厅门、旧木窗、稀疏花影和偏冷晨光；衣色与素帕为原创美术意象，不增未核定整套孝服。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 立绘审核（B 组，见 `tools/agents/reports/REVIEW-portraits-B-ch05-09.md`）：**补出（随基础立绘）**（P2）。场景尚未出图；以新出的温青青基础立绘为身份参考补出。
>
> 参考上传：`assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_disguise_base.png`。
>
> 依据与待考：原著：石梁温家旧事揭开、温仪身亡（有据）；素色衣与手帕是美术意象，不宣称原著写了孝服。
>
> 本节是新的出图依据：把下面代码块原样粘贴给 Gemini（有参考上传的先上传图片）。下方原有段落只作历史保留，不再交给出图。

```text
生成一张 2:3 竖幅单人全身剧情场景图。

上传的图片是温青青本人的基础立绘，作为身份参考：保持同一张脸（脸型、眉眼、鼻子、嘴、肤色、发际线）和同样的成年年龄、体型，让人一眼认出是同一个人；不要照搬参考图的站姿、构图和背景，服饰、动作和场景按下文。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：温青青，《碧血剑》女主角，外观约二十岁的成年年轻女子，秀气的瓜子脸、英挺上扬的细眉、明亮敏锐而倔强的眼神，成人身材比例。
场景「石梁失母」：石梁温家的旧事揭开、母亲温仪去世之后的时期。人物独自侧立在温家厅门边，一手扶着旧门框，另一手轻攥一角素帕，目光略低而含悲愤；不要夸张的哭泣。衣装：低饱和灰青色的完整便服、简洁束发、合脚布鞋。背景：温家庄的厅门、旧木窗与一截庭院墙，花影稀疏，留白略冷。

构图：竖幅 2:3，单人全身剧情场景图，人物是画面主体，从头顶到双脚完整入画（坐姿也要看得见头、身体、双手、双腿和双脚）；场景用浅淡的写实水墨笔法画出，留白充足，背景不能压过人物、不能侵入人物轮廓。画面里只有这一个人物。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要网红脸、少女幼态；不要换成另一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

## 人物要点

- **场景与阶段**：石梁温家旧事揭开、温仪身亡之后；未发生华山双腿伤。
- **身体、姿态与表情**：单人全身，衣装以低饱和灰青表现丧恸，握紧双手或轻扶门框，眼神悲愤；无夸张泣血。 低饱和灰青完整便服、简洁束发与合脚行旅鞋；以静冷配色表达丧恸，不增未核定的整套孝服。衣料平整、边线干净，素帕为完整小片，不画残破布条。 人物面部、皮肤、头发、衣服和鞋均以美观写实的高级国风插画塑造：坚实完整体积、自然精细肤质、可信五官、连贯柔和光影、干净完整轮廓。衣料有明确剪裁与连续整片织物，仅少量宽缓承重褶；旧衣也完整可穿。水墨、飞白和纸纹仅允许出现在背景，不能侵入或切碎人物。
- **服饰**：低饱和灰青完整便服、简洁束发与合脚行旅鞋；以静冷配色表达丧恸，不增未核定的整套孝服。衣料平整、边线干净，素帕为完整小片，不画残破布条。
- **器物**：["空手或一角素帕；不擅拿父亲金蛇剑成为固定装备"]
- **淡景与艺术表达**：浅淡水墨背景，人物为画面主体。温家庄厅门、旧木窗与一截庭院墙，花影稀疏，留白略冷。
- **考据与边界**：原著母亡事件是真实；素色丧恸配色与手帕是美术意象，不宣称文本写了此套孝服。不能画温仪仍活着的游戏改命线。 本场为原著事件基础上的单人艺术取景与原创衣装设计，构图不当作逐字场面复刻；独立场景不覆盖基础图。此production record只准备实际请求，不代表图片已经生成、查看或审批；原始PNG保存后仍须按宽松自查登记candidate，保留原审批状态。 本轮按REALISTIC-CHARACTERS-20261001.md重写人物美术：美观写实、自然皮肤、连贯光影、完整衣料，水墨仅背景；旧场景或旧候选不计本轮修正完成。具体衣色与姿态仍为艺术补足，原著人物、阶段、伤残与器物事实不变。实际生成与查看后才可登记本轮candidate，不自行approved。 首身份引用必须完成新写实revision并实际查看；旧路径存在不能解除依赖。

### 依据

- docs/design/catalog/npcs-ch07-bixue.md：npc_wenqingqing 人物行
- docs/design/story/07-bixue.md：原著事件总表及 第7回 对应主线
- docs/design/chapters/07-bixue.md：人物与主线锚点；游戏原创任务不作为原著事件
- {"work": "碧血剑", "author": "金庸", "chapter": "第7回", "url": "https://bixuejian.5000yan.com/", "verification": "原著回目定位；事件依据项目 story 原著事件表，链接仅为原著目录/段落入口，不声称本轮逐字核过整回"}

场景事实与美术补足分别记录；站姿、配色、淡龙或佛道象征不冒称原著逐字画面。此独立场景不覆盖基础立绘。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须为本角色首场新写实PNG，根任务先核验manifest realism_revision=user_character_realism_20261001、文件哈希并实际查看后方可输入；旧同路径文件存在不满足条件，当前不声称已查看该新身份图。按首场保持本人眉鼻眼口的辨识关系，允许少年到青年自然成长及剧情伤残变化，不固化首场身高、姿态或装备。第二参考为已实际查看的新写实萧峰首样，只取皮肤、体积、连贯光影和完整衣料质量，不能借他的脸、男性外貌、胡须、体型、服装、姿势或龙影。第三参考仅同性别基线低饱和色卡，不作身份和人物画法。第四参考仅背景淡墨山水及留白，不取女子、面孔、肤质或服装。

人物身份：温青青的独立人物设计：偏短的鹅蛋脸、略扬的英挺细眉、明亮敏锐的眼睛、鼻头小巧、下颌有利落转折；体态轻捷结实而不纤弱。神情鲜活、倔强、有判断，不照搬王语嫣温柔怯静的脸。男装时期保留女性原本骨相，以束发与衣装表达伪装，不画成另一个男人；后期服装改变而眉眼身份连续。
角色与主题：温青青，石梁失母。
阶段：石梁温家旧事揭开、温仪身亡之后；未发生华山双腿伤。
人物、动作与完整衣装：单人全身，衣装以低饱和灰青表现丧恸，握紧双手或轻扶门框，眼神悲愤；无夸张泣血。 低饱和灰青完整便服、简洁束发与合脚行旅鞋；以静冷配色表达丧恸，不增未核定的整套孝服。衣料平整、边线干净，素帕为完整小片，不画残破布条。 人物面部、皮肤、头发、衣服和鞋均以美观写实的高级国风插画塑造：坚实完整体积、自然精细肤质、可信五官、连贯柔和光影、干净完整轮廓。衣料有明确剪裁与连续整片织物，仅少量宽缓承重褶；旧衣也完整可穿。水墨、飞白和纸纹仅允许出现在背景，不能侵入或切碎人物。
器物与阶段限制：空手或一角素帕；不擅拿父亲金蛇剑成为固定装备
仅背景使用水墨：浅淡水墨背景，人物为画面主体。温家庄厅门、旧木窗与一截庭院墙，花影稀疏，留白略冷。 背景墨痕和纸纹停留在人物轮廓以外，不穿透衣料与皮肤。
本场具体构图：侧立温家厅门，一只手扶旧门框、另一手轻攥一角素帕；目光略低却含悲愤。身体仍健全能站，门窗庭墙只作冷淡轮廓，画外是刚经历的家事。
单人单视图完整全身，站姿从头顶到双足，坐姿完整呈现头、躯干、实际存在的手、双腿和足，主要器物端点完整入画；真实重心、自然留边，不机械限定人物占高。竖幅2:3，目标2048×3072 PNG，接受工具原生输出、不透明，保留原始PNG字节。每场两候选择一，生成后实际查看人物写实质量与事实身份，宽松自查后仍为candidate，不能自行approved。
事实与艺术边界：原著母亡事件是真实；素色丧恸配色与手帕是美术意象，不宣称文本写了此套孝服。不能画温仪仍活着的游戏改命线。 本场为原著事件基础上的单人艺术取景与原创衣装设计，构图不当作逐字场面复刻；独立场景不覆盖基础图。此production record只准备实际请求，不代表图片已经生成、查看或审批；原始PNG保存后仍须按宽松自查登记candidate，保留原审批状态。 本轮按REALISTIC-CHARACTERS-20261001.md重写人物美术：美观写实、自然皮肤、连贯光影、完整衣料，水墨仅背景；旧场景或旧候选不计本轮修正完成。具体衣色与姿态仍为艺术补足，原著人物、阶段、伤残与器物事实不变。实际生成与查看后才可登记本轮candidate，不自行approved。 首身份引用必须完成新写实revision并实际查看；旧路径存在不能解除依赖。

完整排除项：不要血泪、温仪第二人、游戏改命母亲存活情节、金蛇郎君武器套装、预加双腿骨折或夸张永久残疾。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。
```

## 排除项

不要血泪、温仪第二人、游戏改命母亲存活情节、金蛇郎君武器套装、预加双腿骨折或夸张永久残疾。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。

## 质检要点

- 核对人物、阶段、伤残侧别、主要器物和场景可辨识性。
- 完整可读，无重大多肢或结构问题；宽松自查，仍为candidate待最终审核。
- 两候选择一，原始PNG字节保存，实际尺寸模式及参考哈希如实登记。

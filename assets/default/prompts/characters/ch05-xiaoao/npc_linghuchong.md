---
asset_id: por_npc_linghuchong__ch05_youth_huashan_base
subject_id: npc_linghuchong
name: 令狐冲
book: ch05_xiaoao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_huashan_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/linghuchong_still1.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "aa15448343e3dc797c060e52cc5218b7feded2e177e8a179621b38dcc969ee8c"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/linghuchong_still2.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "70441273882c07c4b1b03af6e0fcbade4000f5ae46a070f366127bc74ebbe4e8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/linghuchong_game.jpg", "use": "经典武侠游戏插画风格；只借绘画气质、线条、造型感", "sha256": "daa70caa7125430bccdc2efad45b77ccddc97bc11660158a4f36d0bf2ce279e8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
realism_revision: user_identity_pose_20261001
codex_prompt_rev: 2026-10-02
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/linghuchong_still1.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/linghuchong_still2.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/linghuchong_game.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
classic_ref:
  version: 1996 TVB《笑傲江湖》
  stills:
  - .agents/coord/imagegen-reference/identity-20261002/xiaoao/linghuchong_1996_lvsongxian_sina1.jpg
  - .agents/coord/imagegen-reference/identity-20261002/xiaoao/linghuchong_1996_lvsongxian_sina3.jpg
  crop:
    linghuchong_1996_lvsongxian_sina3.jpg:
    - 225
    - 40
    - 560
    - 318
composite_job: por_npc_linghuchong__ch05_youth_huashan_base.resume3
---

# 令狐冲 · 人物写实修正

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_linghuchong__ch05_youth_huashan_base.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【复合参考】第1至2张是该角色经典影视造型剧照：只借发型、服饰、配色、标志道具、气质和大致脸型，五官不要照搬演员本人，要往经典武侠游戏插画的理想化脸型靠，成品像这个角色而不是像这个演员。第3张是经典武侠游戏绘画参考：借其古典武侠插画的气质、线条与造型感，不保留像素块，不复刻头像角度。最后两张是项目画风基线，只取画风，不取人物五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
成年青年剑客，修长结实的体态，洒脱目光中有重情与不受拘束的侠气；略有胡茬、鼻梁挺而不尖，五官重新理想化为经典武侠游戏人物。素灰蓝华山弟子长袍、暖白右衽内领、旧布腰带；右手自然持一柄普通长剑，左腰必须佩酒葫芦，长剑与酒葫芦同时清晰。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 AR-32 重出（8 号出图员，codex exec · image_gen）：主要角色参考经典造型加项目基线生成。上传顺序：第 1–2 张为 1996 TVB《笑傲江湖》令狐冲剧照（linghuchong_1996_lvsongxian_sina1.jpg；sina3.jpg 裁去台标字幕），最后两张为同性别画风基线（缩小版 JPEG）。参考图只借造型、气质与面部特征，画面按项目画风重绘、不复制照片或像素图。上一版保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【参考图】第 1–2 张参考图是该角色经典影视造型的剧照：借鉴其发型、服饰、配色、标志道具、气质和面部特征，让人一眼认出是这个角色；但必须重新绘制成项目画风，不要照片质感，不要照搬剧照的构图、光影、背景和姿势，也不要做成照片修图。最后两张是本项目画风基线：画风、用色、光线、质感和暖浅灰纸底加淡水墨背景以它们为准。
【剧照借鉴要点】取剧照里那顶灰黑色软布巾帽（帽顶打一个结）、帽下披到肩后的乌黑长发、墨绿交领长衫配白色内领和细细的赭色滚边、俊朗的长脸和明朗带笑、带点狡黠的眼神。姿势和构图按下文的全身立绘来画，不照搬剧照。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】令狐冲，《笑傲江湖》男主角，华山派大弟子，在思过崖面壁、随风清扬学剑的时期。
【年龄与体态】约二十五岁的成年男子，身材修长偏瘦，但肩背、前臂和腿部有多年练剑的结实筋骨；站姿松弛随性，重心略偏一侧，带着浪子的潇洒。
【经典造型】九十年代经典港剧里的浪子剑客：灰黑软布巾帽、帽下长发披肩、一身墨绿长衫，一手握剑、一手拎着酒葫芦；笑容洒脱、眼神里有三分醉意三分狡黠，英俊而不羁。
【面容】按剧照：俊朗的长脸、下颌线利落；浓黑的剑眉；眼睛明亮有神，笑起来眼角弯弯，眼神洒脱又带点狡黠；鼻梁挺直；嘴角上扬、笑容爽朗；肤色是健康的浅麦色。英俊潇洒、有故事的江湖浪子。
【发式】头戴一顶灰黑色软布巾帽（帽顶打一个结），乌黑的长发从帽下披到肩后，两鬓垂着几缕长发。
【服饰】墨绿色交领长衫（右衽，左襟压右襟），白色内领，领缘有细细的赭色滚边；腰间系深色布带，下穿深色长裤、黑布靴。衣服穿得有点旧，但干净完整。
【道具】左手握着一柄连鞘的长剑（深色木鞘、黄铜剑格，剑不出鞘）；右手拎着一只朱红色漆面的酒葫芦，葫芦用细绳系在腰带上。
【姿态与神情】随性洒脱地站着，像对什么都满不在乎，眼神却清亮、重情义。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感，不要像剧照照片、照片修图或拼贴，不要照搬剧照的背景、光影、构图和姿势；不要三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要网巾或额头箍带；不要醉倒踉跄；不要拔剑；不要清代剃发留辫。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。基线图只取画风，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## AR-31 文字版 Gemini 提示词（2026-10-02 凌晨；AR-32 重出之前，历史，不再用于出图）

> 2026-10-02 AR-31 改写（1 号出图员，codex exec · image_gen 出图）：重要人物借鉴经典影视造型，只写成文字——不写演员名、不上传剧照、原创面孔；主角和美人画得好看，去 AI 味，禁止幼态。出图时上传两张同性别基线立绘作画风参考（放在最后）。审核组原稿保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】令狐冲，《笑傲江湖》男主角，华山派大弟子，在思过崖面壁、随风清扬学剑的时期。
【年龄与体态】约二十五岁的成年男子，身材修长偏瘦，但肩背、前臂和腿部有多年练剑的结实筋骨；站姿松弛随性，重心略偏一侧，带着浪子的潇洒。
【经典造型】借鉴经典武侠影视里这个角色深入人心的造型，只取发型、装束、配色、标志道具、气质和脸型类型，用原创面孔画出来，不像任何真实演员：九十年代经典港剧里那位潇洒不羁的浪子剑客——头发在头顶随手束成发髻、用旧青布带扎住，几缕散发垂在额角；一身洗旧的青蓝色华山派长衫；一手握剑、一手拎着酒葫芦；笑容洒脱、眼神里有三分醉意三分狡黠，英俊而不羁。
【面容】脸型偏长、颧骨微显、下颌线利落；眉毛浓黑、眉尾微微上挑；眼睛细长明亮，眼神里有醉意、狡黠和坦荡的笑意，眼角有浅浅笑纹；鼻梁挺直；嘴角一边微微上扬，似笑非笑；唇上和下巴有淡淡的胡茬；肤色是常年山间行走的浅麦色。英俊潇洒、有故事的江湖浪子，不是精致的偶像小生。
【发式】黑发在头顶随手束成一个发髻，用一条旧青布带扎住，几缕散发垂在额角和鬓边；不戴网巾，不戴头箍。
【服饰】华山派弟子的青蓝色旧布交领长衫（右衽，左襟压右襟），白色内领，袖口随意挽起一截；腰间系深色布带，下穿深色长裤、黑布鞋。衣服干净但穿得很旧，布面有自然的洗旧褪色。
【道具】左手握着一柄连鞘的普通长剑（深色木鞘、黄铜剑格，剑不出鞘）；右手拎着一只朱红色漆面的酒葫芦，葫芦用细绳系在腰带上。
【姿态与神情】随性洒脱、爱酒爱笑，像对什么都满不在乎，眼神却清亮、重情义。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要像任何真实演员或明星；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要网巾或额头箍带；不要飘逸长发的偶像造型；不要浓眉大眼的壮汉；不要醉倒踉跄。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。参考图只取画风、光线、质感和背景处理，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## 审核组 Gemini 提示词（2026-10-02 AR-30 重审稿；AR-31 改写前，历史，不再用于出图）

> 2026-10-02 立绘审核（B 组，见 `tools/agents/reports/REVIEW-portraits-B-ch05-09.md`）：**整体重出**（P1）。现图像“路人甲”，网巾头箍与林平之、田伯光同型，且与四张场景图不是同一张脸；按原著浪子剑客气质整体重画，作为全部场景的身份基准。
>
> 参考上传：无（纯文字生成）。
>
> 依据与待考：原著：华山派大弟子、嗜酒、洒脱不羁、重情义（性格概括）。面部细节、青蓝旧衫、朱红酒葫芦为原创扩展；经典形象只借“青衫、长剑、酒葫芦、浪子气”，不复刻任何演员面容。
>
> 本节是新的出图依据：把下面代码块原样粘贴给 Gemini（有参考上传的先上传图片）。下方原有段落只作历史保留，不再交给出图。

```text
生成一张 2:3 竖幅全身人物立绘。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：令狐冲，《笑傲江湖》男主角，华山派大弟子，在思过崖面壁、随风清扬学剑的时期。
年龄与体态：约二十五岁的成年男子，身材修长偏瘦，但肩背、前臂和腿部有多年练剑的结实筋骨；站姿松弛随性，重心略偏一侧，带着浪子的潇洒。
面容：脸型偏长、颧骨微显、下颌线利落；眉毛浓黑、眉尾微微上挑；眼睛细长明亮，眼神里有三分醉意、三分狡黠和坦荡的笑意，眼角有浅浅笑纹；鼻梁挺直；嘴角一边微微上扬，似笑非笑；唇上和下巴有淡淡的胡茬；肤色是常年山间行走的浅麦色。整张脸洒脱、机灵、不羁，是有故事的江湖浪子，不是精致的偶像小生。
发式：黑发在头顶随手束成一个发髻，用一条旧青布带扎住，几缕散发垂在额角和鬓边；不戴网巾，不戴头箍。
服饰：华山派弟子的青蓝色旧布交领长衫（右衽，左襟压右襟），白色内领，袖口随意挽起一截；腰间系深色布带，下穿深色长裤、黑布鞋。衣服干净但穿得很旧，布面有自然的洗旧褪色。
道具：左手握着一柄连鞘的普通长剑（深色木鞘、黄铜剑格，剑不出鞘）；右手拎着一只朱红色漆面的酒葫芦，葫芦用细绳系在腰带上。
神态：随性洒脱、爱酒爱笑，像对什么都满不在乎，眼神却清亮、重情义。

构图：竖幅 2:3，单人全身立绘，从头顶到双脚完整入画，四周留出余白；站姿自然、重心稳定，身体正面或微侧，头颈端正、双眼平视；双手和所持器物完整清楚。背景：暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物轮廓与背景分明、边缘干净（后续要抠图），脚下只有极淡的接触阴影。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要网巾或额头箍带；不要飘逸长发的偶像造型；不要浓眉大眼的壮汉；不要醉倒踉跄；不要和林平之或其他人物同一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

## 人物与阶段

- subject_id：npc_linghuchong
- book：ch05_xiaoao
- gender：male
- age_variant：youth

## 本轮人物写实规范

针对候选2真实头部倾斜，仅修头颈竖直正面及眼线水平；保持本人游戏脸关系、整身衣物与武器和葫芦。两张修正为本项第3/4，历史原图全部保留。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_linghuchong__ch05_youth_huashan_base/prompt-8c4534466de03f48efe62e942733eb6239315edf4ca6e7aabaec24db15c5fd23.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
EDIT the full-body illustration in input image ONE. Correct a specific failed requirement: the head still leans to a shoulder and the eyes are not horizontally level. Rotate/reconstruct ONLY the head and neck into a naturally UPRIGHT, level, primarily FRONTAL portrait. Forehead, bridge of nose and centre of chin form a vertical line; pupils and inner eye corners form horizontal lines. Head centred above the neck, ears balanced in height, camera level. Do not achieve this by tilting the canvas or the whole body. Preserve all other image ONE content: the same young Linghu Chong, face proportions, full blue-gray clothing, hair/net band, same gourd and complete sheathed straight sword, hands, feet and background. Image TWO is the original game identity authority for face relationships; image THREE is only the historic male rendering sample and image FOUR background only. Do not replace his face with the male sample, add another weapon or gourd, cut any feet, or alter this historical stage. This is a targeted head-pose correction, not a new character.

The complete current character requirements follow; where their numbering is unclear, use the explicit four-input order above.

POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia character illustration of LINGHU CHONG / 令狐冲. Reference TWO is the ONLY FACIAL IDENTITY reference: this character's reliably mapped portrait from classic MS-DOS Heroes of Jin Yong, used as a facial design reference, not a rendering style. Preserve recognizable facial relationships rather than a generic handsome template. Reconstruct a natural front-facing realistic face from the low-resolution drawing. Reference THREE provides only restrained male rendering/colour quality and reference FOUR only an ink-wash background. Do not borrow any other person's facial identity.

身份与青年体态：华山大弟子、思过崖授剑时期，尚未被逐或接任恒山掌门，成年约二十五岁观感。身形清瘦修长，但肩背、前臂和腿部有习武者筋骨，不病弱干瘪、不借厚胸壮汉体型。身体主要面向正面，肩颈放松、自然重心微偏而双足稳实，头颈必须直立；可以一足稍前形成从容感，不能斜肩歪头。神态坦率有浪子气，似笑非笑而不醉态踉跄。本图不提前继承后期重伤、退隐婚礼或恒山掌门状态；不把后续场景文件当作身份依赖。

本人面部辨识：第二参考原版游戏令狐冲本人：脸形较长而颧颊略带棱角，下颌逐渐收束但下巴不做尖锥；眉毛自然略挑、有明显转折，眼裂修长且有灵气，保留眉眼距离与看人的爽朗神态。鼻梁直而清楚，鼻头自然，唇线克制、嘴角有轻微不完全对称的似笑非笑；真实的不对称来自嘴角而不能来自头部倾斜。保留这套本人骨相与眉眼鼻唇的关系，自然重建为约二十五岁面容，少量浅胡茬是本阶段文本选择而非借第二参考的脸。目光坦率放松而非官员板脸，不磨成偶像娃娃脸，不画浓络腮胡。原头像明显歪头、略侧转和灰白宽额带不得继承；把同一五官关系自然转正，额鼻颏中线严格竖直、双眼水平。

服装与发式：角色稿的明中叶游戏服装方向，不冒称小说明示年代；灰蓝青素布直身式常服，窄白护领，侧开衩、深色长裤、黑布鞋，窄布绦侧结。汉式交领左襟盖右襟、向本人右侧合拢。衣边、袖口和下摆完整，布料有明确裁剪及连续体积，不撕裂成飞散丝带；仅极轻行旅使用感，面容与衣料保持清楚洁净。黑发从实际发根束成顶髻，低调网巾配窄发带，不复制游戏头像的整条厚灰白额带；少量自然散发、发带尾、衣袂和腰带尾可同向轻动，但不遮双眼、耳颈轮廓。不能把所有发丝死贴头皮，也不做满头乱发或华山弟子破衣。衣装按本人当前角色稿确定，绝不把第三图旧写实基线面孔一起沿用。

唯一长剑与小酒葫芦：只有一柄普通中式直身双刃长剑，剑刃全部在尺寸匹配的深木色长鞘内，没有露刃。本人左手位于观者右侧，握住鞘口下方一段，长鞘立于左腿外侧稍离身体，鞘端在地面上方、不穿地；剑柄、简洁横格、鞘口与封尾全长在同一直线上，剑鞘始终笔直，端点均完整可见。本人右腰位于观者左侧，仅挂一只小酒葫芦，短绳确实固定到腰带，右手自然轻搭葫芦上半部，手指和葫芦结构分开可读。不举酒灌饮，不脱手悬浮，不加第二把剑、第二个葫芦或背后兵器。普通剑和葫芦的具体外形、左右布局是本角色稿及此设计的美术补足；独孤九剑是一门剑术，不是一把名叫独孤九剑的神兵，也不画成九把剑。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第二参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅低饱和色卡与连贯的手绘写实品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认两张独立候选由执行者比较，仍为candidate，等待用户审核；每张画面只含一个本人。

事实与改编边界：本人游戏头像只提供作者指定的面部识别，不证明原著年龄、发式、服饰、伤残或阶段；这些仍按当前基础角色稿与catalog/story。同名头像来自第三方MS-DOS资源归档并与标注初代的姓名表交叉核验，未冒称已验证具体1996原盘位元。原稿的脸型文字属原著概括待考或美术补足，不能压过作者新授权的本人头像；旧“禁止游戏独创造型”和“只按文字新造通用脸”不进入本轮请求。

完整排除项：不要第二参考旧候选令狐冲基线的面孔；新面部只来自第一张36-1本人游戏头像。不要继承游戏头像的歪头、斜眼水平线、侧脸和厚灰白宽额带。不要孩童、中年浓须、厚胸健美壮汉、病态枯瘦、呆板官员脸、恶笑或烂醉踉跄。不要僵硬的敬礼立正、单肩耸起、斜颈靠肩；放松靠自然手势与重心表达。不要恒山掌门徽记礼服、婚礼衣装、后期重伤血迹、清式剃额辫发或官服补子。不要全头乱发遮脸、全部头发贴死、碎布破袖或密集污斑。不要拔剑、露出剑刃、弯刀、日本刀、宽巨剑、第二柄剑、九把飞剑、他书具名神兵或发光独孤九剑。不要剑鞘弯折或短于剑刃、手握剑刃、柄格鞘口错轴、鞘端穿地或穿腿。不要第二个葫芦、具名名酒器、大酒坛、漂浮葫芦、琴或箫；本图只有普通入鞘直剑1柄与小酒葫芦1只。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考旧写实基线的脸、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING LINGHU CHONG. Keep the forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit ANY reference's tilted head, side view or shoulder angle. Keep the character's own recognizable face, current-stage anatomy and all required objects clearly visible.

FINAL EDIT CHECK: his head has to be visibly more UPRIGHT than input ONE, both eyes level, forehead-nose-chin vertical. Preserve identity and the rest of the illustration. No head tilt; no Dutch angle.
```

## 排除项

不要第二参考旧候选令狐冲基线的面孔；新面部只来自第一张36-1本人游戏头像。不要继承游戏头像的歪头、斜眼水平线、侧脸和厚灰白宽额带。不要孩童、中年浓须、厚胸健美壮汉、病态枯瘦、呆板官员脸、恶笑或烂醉踉跄。不要僵硬的敬礼立正、单肩耸起、斜颈靠肩；放松靠自然手势与重心表达。不要恒山掌门徽记礼服、婚礼衣装、后期重伤血迹、清式剃额辫发或官服补子。不要全头乱发遮脸、全部头发贴死、碎布破袖或密集污斑。不要拔剑、露出剑刃、弯刀、日本刀、宽巨剑、第二柄剑、九把飞剑、他书具名神兵或发光独孤九剑。不要剑鞘弯折或短于剑刃、手握剑刃、柄格鞘口错轴、鞘端穿地或穿腿。不要第二个葫芦、具名名酒器、大酒坛、漂浮葫芦、琴或箫；本图只有普通入鞘直剑1柄与小酒葫芦1只。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考旧写实基线的脸、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_linghuchong__ch05_youth_huashan_base.prepared.json`。

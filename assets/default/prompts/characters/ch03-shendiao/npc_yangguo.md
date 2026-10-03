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
status: candidate
realism_revision: user_identity_pose_20261001
references:
- path: .agents/coord/imagegen-reference/identity-20261001/yangguo_1995_caption_verified.jpg
  use: 身份参考：1995 TVB《神雕侠侣》 剧照（作者 10-03 指定版本）；只借造型、气质与五官神韵，按项目画风重画，不照搬照片
  sha256: 0445ec2ad9210b8eef26797e9d3855551f26407008ee6819c41885ca17d5f53e
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 画风基线：项目同性别基线立绘，只取画风、用色、光线、质感和背景处理，不取长相（上传缩小版 JPEG）
  sha256: 3523d4d935ad8bb13db359ce72e73bc211ebdb3af5cb2a9806db346dca6df202
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 画风基线：项目同性别基线立绘，只取画风、用色、光线、质感和背景处理，不取长相（上传缩小版 JPEG）
  sha256: c9f87f225636e3f8166717f1b0c8ccaf13c319210fdc6069e09289e96632fd89
redo_reason: "作者 10-03 AR-44：参考1995 TVB《神雕侠侣》造型重画 base，不要和照片一样"
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w17/staging/still__por_npc_yangguo__ch03_youth_onearm_base__1.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
codex_prompt_rev: 2026-10-03
classic_ref:
  version: 1995 TVB《神雕侠侣》
  stills:
  - .agents/coord/imagegen-reference/identity-20261001/yangguo_1995_caption_verified.jpg
---

# 杨过 · 人物写实修正

## Gemini 提示词

> 2026-10-03 AR-44 新 base（10 号出图员，codex exec · image_gen）：作者要求参考1995 TVB《神雕侠侣》造型、按项目画风重画、不要和照片一样；上传顺序：剧照 1 张，最后两张为同性别画风基线（缩小版 JPEG）。上一版保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【参考图】第 1 张参考图是该角色经典影视造型的剧照：借鉴其发型、服饰、配色、标志道具、气质和面部神韵（眉眼、脸型的印象），让人一眼认出是这个角色；但五官不要照搬演员本人，要往经典武侠游戏插画里理想化的英俊脸型靠——成品像这个角色，而不像这位演员的写真；必须重新绘制成项目画风，不要照片质感，不要照搬剧照的构图、光影、背景和姿势，也不要做成照片修图。最后两张是本项目画风基线：画风、用色、光线、质感和暖浅灰纸底加淡水墨背景以它们为准，但不取基线人物的长相。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】杨过，《神雕侠侣》南宋的主角，杨康之子、小龙女之徒；被郭芙斩断右臂、得独孤求败玄铁重剑之后，十六年分离之前。孤傲不羁、深情重义。
【年龄与体态】约二十四五岁的成年男子，身材高挑、肩背挺拔，精悍结实的练剑身形，不是少年。
【经典造型】以剧照里这位杨过的造型为蓝本：黑发在头顶高高束成马尾髻、用一条米白布带扎住，长发从髻上垂到背后，额前两侧垂下几缕长鬓发框住脸庞；外穿灰褐色粗麻布交领外袍（织纹带细密的暗格纹，旧而整洁），内衬米白交领内衫，腰间一条褐色宽布腰带，深色长裤、布靴；整体带一点浪迹江湖的风尘与不羁。
【面容】俊朗而有棱角的长脸，下颌线清楚有力，颧骨略高；浓黑的剑眉平直而尾端上扬、斜飞入鬓；眼窝略深，一双细长的眼睛眼尾微挑，眼神锐利、桀骜，又带着落寞与深情；鼻梁高挺，薄唇紧抿，嘴角带一丝倔强；肤色健康，下巴有极淡的胡茬。英俊、孤傲、有男人味的青年侠客，不是奶油小生。
【独臂与兵器】原著断的是右臂：右臂从上臂中段以下没有了——右边衣袖从肩下就是空的，扁平、软塌塌地在上臂处打一个结垂下，袖子里明显没有手臂、没有手（独臂必须一眼看清）；只用左手握住一柄乌黑厚重、宽钝无锋、毫无装饰的玄铁重剑，剑尖朝下拄在身体左侧的地上，剑身完整入画。不能画成左臂缺失。
【姿态】站姿挺拔，身体基本朝向正面、略微侧身，头部端正，目光平视前方。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感，不要像剧照照片、照片修图或拼贴，不要照搬剧照的背景、光影、构图和姿势；不要三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要画成双臂齐全，不要出现右手或右前臂，不要两只手握剑；不要神雕或其他动物；不要剧照里举剑过头的姿势。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。基线图只取画风，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## 上一版 Gemini 提示词（AR-44 新 base 之前，历史，不再用于出图）

> 作者10-02晚复合精修；任务 `por_npc_yangguo__ch03_youth_onearm_base.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【复合参考】第1张是该角色经典影视造型剧照：只借发型、服饰、配色、标志道具、气质和大致脸型，五官不要照搬演员本人，要往经典武侠游戏插画的理想化脸型靠，成品像这个角色而不是像这个演员。第2张是经典武侠游戏绘画参考：借其古典武侠插画的气质、线条与造型感，不保留像素块，不复刻头像角度。最后两张是项目画风基线，只取画风，不取人物五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
成年青年杨过，清瘦俊逸、剑眉与细长凤眼，眉间藏倔强不羁和历经伤痛的克制，绝不是演员写真。苍灰青交领右衽长袍、深色腰带，黑发束起，衣料完整自然旧化。原著断的是人物自身右臂，右侧上臂以下缺失，右袖空着妥帖收于右腰；只有左手握一柄乌黑厚重、宽钝无锋的玄铁剑，不能镜像成左臂缺失。人物辨识点：不羁、深情、坚忍；标志物：左手玄铁重剑与空右袖。淡墨远山和谷口，身旁不增加其他人物。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 AR-32 重出（5 号出图员，codex exec · image_gen）：主要角色改为参考经典影视版剧照加项目基线生成。上传顺序：1995 TVB《神雕侠侣》 剧照 1 张（yangguo_1995_caption_verified.jpg），最后两张为同性别画风基线（缩小版 JPEG）。剧照只借造型、气质与面部特征，画面按项目画风重绘、不复制照片。上一版（AR-31 文字版）保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】杨过，《神雕侠侣》南宋的主角，杨康之子、小龙女之徒；被郭芙斩断右臂、得独孤求败玄铁重剑之后，十六年分离之前。孤傲不羁、深情重义。
【年龄与体态】约二十三四岁的青年，身材高挑精瘦，肩背挺直。
【经典造型】以九十年代中期经典港剧里那位俊朗孤傲的杨过为蓝本（见剧照）：清瘦俊朗的脸、浓黑剑眉、深邃的眼睛，孤傲中带着深情与落寞；黑发上半束成小髻、其余披在背后，几缕散发垂在额边；一身深灰青的旧布袍，右边衣袖空荡荡；左手拄着黝黑的玄铁重剑（剧照里双手举剑的姿势和双臂一概不取）。
【面容】原著写他清癯俊秀、剑眉入鬓、凤眼生威，脸色苍白、颇见憔悴。具体为：清瘦俊秀的长脸、颧骨略高、两颊微陷，浓黑的剑眉斜飞入鬓，一双凤眼细长、眼神锐利而带傲气与落寞，鼻梁高挺，薄唇紧抿，脸色偏苍白、略显憔悴，下巴有短短的胡茬。清俊孤傲、剑眉星目的美男子。
【发式】黑发上半部分束成小髻、用一根灰白布条扎住，其余长发披在背后，几缕散发垂在额边。
【服饰】深灰青色交领右衽旧布袍（旧而整洁），深色布腰带，深色长裤、布靴。原著断的是右臂：他的右臂从上臂中段就没有了——右边衣袖从肩下开始就是空的，扁平、软塌塌地垂着，在上臂位置打了一个结，结下垂着一截空袖子；袖子里明显没有手臂、没有前臂、没有手（独臂必须一眼看清）。
【道具】左手（仅存的手）握着一柄又宽又厚的黑色玄铁重剑——无锋无尖、像一块长铁，剑尖拄地，剑身完整入画。
【姿态与神情】孤身而立，左手扶剑、空袖垂在右侧；神情冷傲而深情，目光看向远方。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要左臂断（原著是右臂）；不要两只手都在；不要右袖鼓起像藏着手臂、不要右袖垂到手腕处才打结；不要细长锋利的普通剑或剑光；不要神雕入画。
【参考图】随提示词上传的参考图共 3 张，按顺序：第 1 张是这个角色经典影视造型的剧照：借鉴其发型、服饰、配色、标志道具、气质和面部特征，让人一眼认出是这个角色；但必须重新绘制成本项目的画风，不要照片质感，不要照搬剧照的构图、光影、背景和姿势，也不要做成照片修图；剧照与上文文字有出入时，以上文文字为准。最后两张是本项目的立绘画风基线：画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景以它们为准——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；基线图里人物的长相、年龄、发型、服饰和姿势一律不取。
```

## AR-31 文字版 Gemini 提示词（2026-10-02 凌晨；AR-32 剧照版之前，历史，不再用于出图）

> 2026-10-02 AR-31 改写（1 号出图员，codex exec · image_gen 出图）：重要人物借鉴经典影视造型，只写成文字——不写演员名、不上传剧照、原创面孔；主角和美人画得好看，去 AI 味，禁止幼态。出图时上传两张同性别基线立绘作画风参考（放在最后）。审核组原稿保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】杨过，《神雕侠侣》南宋的主角，杨康之子、小龙女之徒；被郭芙斩断右臂、得独孤求败玄铁重剑之后，十六年分离之前。孤傲不羁、深情重义。
【年龄与体态】约二十三四岁的青年，身材高挑精瘦，肩背挺直。
【经典造型】借鉴经典武侠影视里这个角色深入人心的造型，只取发型、装束、配色、标志道具、气质和脸型类型，用原创面孔画出来，不像任何真实演员：九十年代经典港剧里那位俊朗孤傲的独臂杨过——黑发上半束成小髻、其余披在背后，几缕散发垂在额边；一身深灰青的旧布袍，右边衣袖空荡荡；左手拄着黝黑的玄铁重剑；眉目深邃，孤傲中带着深情与落寞。
【面容】原著写他清癯俊秀、剑眉入鬓、凤眼生威，脸色苍白、颇见憔悴。具体为：清瘦俊秀的长脸、颧骨略高、两颊微陷，浓黑的剑眉斜飞入鬓，一双凤眼细长、眼神锐利而带傲气与落寞，鼻梁高挺，薄唇紧抿，脸色偏苍白、略显憔悴，下巴有短短的胡茬。清俊孤傲、剑眉星目的美男子。
【发式】黑发上半部分束成小髻、用一根灰白布条扎住，其余长发披在背后，几缕散发垂在额边。
【服饰】深灰青色交领右衽旧布袍（旧而整洁），深色布腰带，深色长裤、布靴。原著断的是右臂：他的右臂从上臂中段就没有了——右边衣袖从肩下开始就是空的，扁平、软塌塌地垂着，在上臂位置打了一个结，结下垂着一截空袖子；袖子里明显没有手臂、没有前臂、没有手（独臂必须一眼看清）。
【道具】左手（仅存的手）握着一柄又宽又厚的黑色玄铁重剑——无锋无尖、像一块长铁，剑尖拄地，剑身完整入画。
【姿态与神情】孤身而立，左手扶剑、空袖垂在右侧；神情冷傲而深情，目光看向远方。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要像任何真实演员或明星；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要左臂断（原著是右臂）；不要两只手都在；不要右袖鼓起像藏着手臂、不要右袖垂到手腕处才打结；不要细长锋利的普通剑或剑光；不要神雕入画。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。参考图只取画风、光线、质感和背景处理，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## 审核组 Gemini 提示词（2026-10-02 AR-30 重审稿；AR-31 改写前，历史，不再用于出图）

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

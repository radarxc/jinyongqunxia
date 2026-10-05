---
asset_id: cg_ch02_peach_island_trials
name: "桃花岛三道试题"
book: ch02_shediao
characters:
- npc_guojing
- npc_huangrong
- npc_huangyaoshi
- npc_ouyangfeng
- npc_ouyangke
- npc_hongqigong
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_guojing__ch02_youth_scene_peach_island_square_circle.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_huangrong__ch02_youth_bangzhu_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch02/cg_ch02_peach_island_trials.png
manifest: assets/default/scene/ch02/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_guojing__ch02_youth_scene_peach_island_square_circle.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "a2b01b368f05eda3ed62e1910c1e04242ad762cce8431480d5cf243f76176bee"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_huangrong__ch02_youth_bangzhu_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "7c802d17d03504fdb6176f951dffd87b7a32f9e90c293a409c7ab4e8b776567f"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch02_peach_island_trials.resume3r3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch02_peach_island_trials.resume3r3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
桃花岛求亲三试的第三场默记经文（具体站位为原创扩展构图）。桃竹庭院与竹亭海雾；郭靖居中站定，双手自然下垂、空手，专注地背诵刚才看过的经文，不拿任何器物。清瘦中年黄药师青袍、黑发夹灰与三缕短须，手持无可读字的纸本经卷听其背诵；黄蓉在一旁关切，白衣成年贵公子欧阳克右侧沮丧。远处洪七公长方脸、花白发、颏下极短稀疏微须、朱红葫芦；欧阳锋五十余岁、高大、高鼻深目、棕黄络腮短须、灰黑束发、白衣，绝不是白发白须老仙。明确禁止鲁班锁、木机关方块、魔方、机关盒、棋盘、石块试题或猜谜游戏；三试不是木工解谜，郭靖始终空手。场中不画黄蓉手持打狗棒。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_guojing的本轮立绘；第2张为npc_huangrong的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「桃岛三试」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 作者10-02晚复合精修；任务 `cg_ch02_peach_island_trials.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
桃花岛求亲三试的编辑性群像（原创扩展构图，试题次序和精确同场站位待考）。桃竹庭院、竹亭海雾，郭靖居中凝神应对，黄蓉一旁关切；青袍清癯中年黄药师持玉箫，衣衫朴素的老乞丐洪七公、白衣老者欧阳锋和白衣贵公子欧阳克分处远景。仅郭黄上传身份图，其余按文字，不要把周伯通画成主持三試的人，不画打狗棒在此前情节中作为黄蓉手持物。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_guojing的本轮立绘；第2张为npc_huangrong的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「桃岛三试」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《射雕英雄传》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是郭靖（npc_guojing）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是黄蓉（npc_huangrong）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是黄药师（npc_huangyaoshi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是欧阳锋（npc_ouyangfeng）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 5 张参考图是周伯通（npc_zhoubotong）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十五至十九回，桃花岛三道试题。
地点与时刻：桃花岛竹亭；春日清晨、花雾。
画面瞬间：郭靖在箫声压迫下稳住身形，黄药师执箫、欧阳锋拄杖相对，黄蓉焦急凝视，周伯通从竹后探头。
构图与站位：横向群像；郭靖居中，黄药师和欧阳锋左右对峙，黄蓉近郭靖、周伯通作轻松角点。
情绪基调：雅峻、较量、暗含诙谐。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传郭靖、黄蓉、黄药师、欧阳锋、周伯通。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：三试顺序与同场人物（待考）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


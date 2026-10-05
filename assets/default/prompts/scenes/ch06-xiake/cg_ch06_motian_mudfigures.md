---
asset_id: cg_ch06_motian_mudfigures
name: "十八泥人传承与摩天崖逆练"
book: ch06_xiake
characters:
- npc_shipotian
- npc_xieyanke
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_shipotian__ch06_youth_scene_motianya.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch06/por_npc_xieyanke__ch06_elder_motian_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch06/cg_ch06_motian_mudfigures.png
manifest: assets/default/scene/ch06/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_shipotian__ch06_youth_scene_motianya.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "6c1f5179b7cb159b0b33a20fdafe453a92e8751a5ec7a3cbbe100f48320923f4"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch06/por_npc_xieyanke__ch06_elder_motian_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "5f0f02c18856b04bd9421777af7dcbe5f21b2ad2db49d7ec95192c89e792c18e"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch06_motian_mudfigures.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch06_motian_mudfigures.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
摩天崖石屋冬夜，石破天依十八泥人的姿势静心习练，完整粗布衣和成年身形清楚；约五十岁、灰黑短须、高瘦挺拔的谢烟客立在一旁以复杂严峻目光观察，精神矍铄无衰弱老态，不能画成白须老仙。泥人置在矮石台，炉火暖光对照门外山雾冷色，师徒般表象下暗藏凶险。画面只有当下两人，不增加幽灵叠化。
本图取摩天崖修习单一时点；不把大悲老人赠泥人同时实体化，不出现烧饼。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_shipotian的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「摩天传薪」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《侠客行》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是石破天（npc_shipotian）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是谢烟客（npc_xieyanke）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第三至四回 E04–E05；大悲老人临终赠十八泥人与稍后摩天崖逆练是先后事件，画面叠化为（原创扩展构图）。
地点与时刻：摩天崖石屋；冬夜、炉火。
画面瞬间：石破天依十八泥人的姿势行功，谢烟客在旁审视其阴阳内息将冲未冲；窗外山雾中叠化大悲老人临终赠泥人的追忆。
构图与站位：中景；十八泥人阵列与石破天在画心，谢烟客居右后景，大悲老人仅作雾中低透明追忆且非鬼怪。
情绪基调：传承、信任错置、暗藏凶险。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传石破天、谢烟客；大悲老人 A 级只用文字塑造。
未上传身份参考的人物文字要点：
大悲老人：老年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：E04 与 E05 叠化为（原创扩展构图）；不得出现烧饼，也不得把泥人画成食物夹物；不画幼态石破天。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

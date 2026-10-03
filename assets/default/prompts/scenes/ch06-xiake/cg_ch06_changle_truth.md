---
asset_id: cg_ch06_changle_truth
name: "长乐帮真相曝光"
book: ch06_xiake
characters:
- npc_shipotian
- npc_shizhongyu
- npc_beihaishi
- npc_zhangsan06
- npc_lisi06
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_shipotian__ch06_youth_jinwu_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch06/por_npc_shizhongyu__ch06_youth_bangzhu_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch06_changle_truth_identity_board.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch06/cg_ch06_changle_truth.png
manifest: assets/default/scene/ch06/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_shipotian__ch06_youth_jinwu_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "dab161c89134e3366a31b9d05a127ce3be6b0e095ee79d7245e73aca89e336eb"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch06/por_npc_shizhongyu__ch06_youth_bangzhu_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "0586b34fa350e5286b3dcd0664c687501f0adc43acecc2cfcb0fd95f2fc3fa9b"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch06_changle_truth_identity_board.jpg", "use": "本轮主角身份联系图；源立绘与左右顺序见同名JSON", "sha256": "5d9d66bdfc7bcadda2a71aa1e6b4fb2013308f127689312d641f6ab2d75bc812"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch06_changle_truth.resume3r2
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch06_changle_truth.resume3r2`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
长乐帮总舵宴厅，墙面只能有素木板与纯山水画，不准出现任何圆形字徽、牌匾、寿字、福字或任何可读装饰文字；只有右上角指定四字题名可读。屋顶刚被两张掷出的圆凳撞破，细尘从破洞落下。真正的石中玉已跌落在筵席前，狼狈坐起；厅内张三一胖带笑、李四一瘦神色冷淡，均立于地面，绝不站在屋顶示众。石破天在席旁惊讶而坦诚，病容年长的贝海石满面震惊。石中玉锦衣、石破天朴素厚实，两人均成年；破损屋顶与宴桌交代刚才的揭穿，不互换衣饰神态。
依原著长乐帮揭伪：李四在厅内掷两圆凳撞破屋顶，石中玉落到筵席前；不沿用张李挟他站屋顶的误构图。选落地后静态瞬间，不直接宣告血缘与生母谜底。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_shipotian的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。 第3张是身份联系图，从左到右依次为zhangsan06、lisi06；每一格只锁定该人的身份，不把格数画进成品。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「真假帮主」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《侠客行》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是石破天（npc_shipotian）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是石中玉（npc_shizhongyu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是张三（npc_zhangsan06）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是李四（npc_lisi06）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十五回 E29，张三、李四带回真石中玉，替身计划与逃避赴岛之因曝光。
地点与时刻：镇江府长乐帮总舵屋顶与庭院；夜、灯火。
画面瞬间：张三、李四把真石中玉带到屋顶示众，石破天在庭中抬头与他同时入画，贝海石仰望间再无法维持替身骗局。
构图与站位：仰角中全景；石中玉与张三、李四在屋顶，石破天与贝海石在庭中，以屋檐横线区分真假双方。
情绪基调：揭露、荒诞、骗局崩解。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传石破天、石中玉、张三、李四；贝海石 A 级只用文字塑造。
未上传身份参考的人物文字要点：
贝海石：老年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：两名少年同时在场依 E29；不再表现第四至五回的初次错认；两张相似面容须保持身份可辨。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


---
asset_id: cg_ch07_chongzheng_cannon
name: "毁红夷大炮后潜入崇政殿"
book: ch07_bixue
characters:
- npc_yuanchengzhi
- npc_wenqingqing
- npc_chengqingzhu
- npc_huangtaiji
- npc_yuzhenzi
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yuanchengzhi__ch07_youth_scene_shengjing.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_wenqingqing__ch07_youth_disguise_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch07_chongzheng_cannon_identity_board.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch07/cg_ch07_chongzheng_cannon.png
manifest: assets/default/scene/ch07/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yuanchengzhi__ch07_youth_scene_shengjing.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "cc507abd177275e68206e14377eebbc0116f1e03a375eebc4d8412aa6e5722d6"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_wenqingqing__ch07_youth_disguise_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "20c8a63d391b17645456ebcdd0c6d78e08e9a35cdb870cbb1255e65cda8850b8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch07_chongzheng_cannon_identity_board.jpg", "use": "既有S级身份联系图；从左至右为程青竹、玉真子，源立绘见同名JSON", "sha256": "f1839f9f5c06681f2af6f1955e1f2aeae7f27112cd020137eb62c14855b0aa65"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch07_chongzheng_cannon.resume3
---

## AR-82 当前定稿要求

只改两位人物的指定区域：前景持剑袁承志自身左眉上方（画面右眉）添淡小旧刀疤，其他五官表情不变；左上远处持双竹的程青竹，将现有发髻、露出的两鬓、眉毛、须髯改以白为主，原脸型五官与头巾位置形状不变，不改变其年龄或加笑容。玉真子、皇太极、左上女子以及所有衣物兵器、拂尘、建筑、题字原样。

以上为当前原著核对后的要求，覆盖下文旧版中与之冲突的服饰、器物、伤残、光线和体态描述。

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch07_chongzheng_cannon.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
毁炮与盛京潜入的编辑性双时层宽幅画：左侧较小的回忆层为先前北上途中被毁的旧炮架，温青青男装与程青竹只在这一层警戒，和宫廷空间完全分隔。右侧主画面在崇政殿内，袁承志深青劲装、灰黑披风，持金蛇剑与手执拂尘的玉真子对峙；皇太极在殿中龙椅近旁，约五十一岁、壮硕丰厚、颈肩宽稳、面颊饱满、深色短须夹少量灰，威严沉着而非八十岁衰老形象。殿外冬寒与室内烛光相映，分层之间以大片烟灰留白断开，不把炮架放在宫门旁，不把青青或程青竹画成入殿援兵。
原创扩展双时层构图；毁炮与入殿不是同地同时事件。原著青青在城外约定的破庙等候袁归，不参加殿内对玉真子的交锋；为保留既定五人，将她与程青竹置于先前北上行动的主题回忆层，具体站位原创，不画爆炸伤亡。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_yuanchengzhi的本轮立绘；第2张为npc_wenqingqing的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。 第3张是身份联系图，从左到右依次为chengqingzhu、yuzhenzi；每一格只锁定该人的身份，不把格数画进成品。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「剑动盛京」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《碧血剑》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是袁承志（npc_yuanchengzhi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是温青青（npc_wenqingqing）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是程青竹（npc_chengqingzhu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是玉真子（npc_yuzhenzi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十三至十四回，毁红夷大炮后潜入崇政殿。
地点与时刻：盛京崇政殿外；冬夜、残雪与炮火余光。
画面瞬间：袁承志越过被破坏的炮架直指殿门，玉真子横剑截住去路，温青青与程青竹掩护侧翼，皇太极在门内回身。
构图与站位：超广角；炮架作前景斜线，袁与玉真子居画心对峙，殿门压在远景。
情绪基调：壮烈、险峻、历史洪流。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传袁承志、温青青、程青竹、por_npc_yuzhenzi__ch07_elder_huashan_base；皇太极为威严老年君主、明黄服饰克制。
未上传身份参考的人物文字要点：
皇太极：老年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：把连续行动压成一帧为（原创扩展构图）；不画爆炸伤亡。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《碧血剑》三《经年亲剑铗，长日对楸枰》：“小小疤痕”（https://xuges.com/WUXIA/jinyong/bxj/013.htm）
- 《碧血剑》十《不传传百变，无敌敌千招》：“须眉皆白的老者”（https://xuges.com/WUXIA/jinyong/bxj/066.htm）
- AR-82 返修约束：只改两位人物的指定区域：前景持剑袁承志自身左眉上方（画面右眉）添淡小旧刀疤，其他五官表情不变；左上远处持双竹的程青竹，将现有发髻、露出的两鬓、眉毛、须髯改以白为主，原脸型五官与头巾位置形状不变，不改变其年龄或加笑容。玉真子、皇太极、左上女子以及所有衣物兵器、拂尘、建筑、题字原样。

---
asset_id: cg_ch03_dashengguan_heroes
name: "大胜关英雄大会"
book: ch03_shendiao
characters:
- npc_yangguo
- npc_xiaolongnv
- npc_guojing
- npc_huangrong
- npc_jinlunfawang
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch03_dashengguan_heroes_identity_board.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch03/cg_ch03_dashengguan_heroes.png
manifest: assets/default/scene/ch03/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "ae42658aa3617705e19411f75debe010b372a93aa1f35ece4ef64b21dcc322d8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "f562a725652b9a510f14691e573322f0f1955f43fef8ee52e4a6b705863478d9"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch03_dashengguan_heroes_identity_board.jpg", "use": "本轮主角身份联系图；源立绘与左右顺序见同名JSON", "sha256": "8db9cd0d8deff437ffcde347fd4f1906576b0d55d3ea5d25a3bd735632e1b026"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch03_dashengguan_heroes.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch03_dashengguan_heroes.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
大胜关英雄大会，双臂完好的青年杨过和白衣成年小龙女居台心，杨过手持普通竹棒，神情不羁而坚定；郭靖黄蓉在台侧，沿用本轮射雕基础图同一骨相但自然增龄为中年，郭靖鬓边些许霜意、深色朴素长袍，黄蓉成熟淡雅衣裙与沉静目光，不继承青年发饰或换影视演员。金轮法王为极高极瘦的中老年藏僧，黄色僧袍、头部剃净且额顶自然微陷、下巴仅短须影，手持金轮居远侧，其余金属轮束在腰侧，不画红袍壮汉或长发长髯；群豪低细节，所有站位为编辑性概括构图，具体动作待考。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_yangguo的本轮立绘；第2张为npc_xiaolongnv的本轮立绘；第3张为npc_guojing的本轮立绘；第4张为npc_huangrong的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。 第3张是身份联系图，从左到右依次为guojing、huangrong；每一格只锁定该人的身份，不把格数画进成品。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「大胜群英」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《神雕侠侣》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是杨过（npc_yangguo）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是小龙女（npc_xiaolongnv）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是郭靖（npc_guojing）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是黄蓉（npc_huangrong）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 5 张参考图是金轮法王（npc_jinlunfawang）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十二至十三回，大胜关英雄大会。
地点与时刻：大胜关擂台；夏日午后。
画面瞬间：杨过与小龙女并肩落上擂台，郭靖向前半步欲护，黄蓉按住他的手，金轮法王隔台凝视。
构图与站位：广角群像；杨龙居中、郭黄右侧、金轮左侧，观众压成低细节背景。
情绪基调：热烈、惊异、情义公开。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传杨过 por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff、小龙女 por_npc_xiaolongnv__ch03_youth_scene_dashengguan_silk_bells、郭靖 por_npc_guojing__ch03_prime_base、黄蓉 por_npc_huangrong__ch03_prime_base、金轮法王 por_npc_jinlunfawang__ch03_elder_base；黄蓉须与 ch02 保持同一骨相。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：大会站位（待考）；黄蓉跨书一致性（生产门禁）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《神雕侠侣》第十三回 武林盟主：“这金轮径长尺半”；https://www.xuges.com/wuxia/jinyong/sdxl/092.htm
- 《神雕侠侣》第十三回 武林盟主：“杨过却用铁桨柄去打他后臀”；https://www.xuges.com/wuxia/jinyong/sdxl/088.htm
- AR-82 返修约束（本节优先于历史提示词）：只把正中杨过握的长竹杖改为断裂铁桨的黑色金属桨柄，顶部有断口、不画竹节，手与完整双臂不动。另将右侧金轮法王手中小金轮改成径长尺半的可实战大金轮，腰间小饰轮去掉、其余四轮收到袍下不露。杨过和法王的脸、衣服、手，郭靖黄蓉小龙女及其他人、题字朱印与背景完全不动。


- 《神雕侠侣》第十三回 武林盟主：“这金轮径长尺半”；https://www.xuges.com/wuxia/jinyong/sdxl/092.htm
- 《神雕侠侣》第十三回 武林盟主：“杨过却用铁桨柄去打他后臀”；https://www.xuges.com/wuxia/jinyong/sdxl/088.htm
- AR-82 返修约束（本节优先于历史提示词）：只把正中杨过握的长竹杖改为断裂铁桨的黑色金属桨柄，顶部有断口、不画竹节，手与完整双臂不动。另将右侧金轮法王手中小金轮改成径长尺半的可实战大金轮，腰间小饰轮去掉、其余四轮收到袍下不露。杨过和法王的脸、衣服、手，郭靖黄蓉小龙女及其他人、题字朱印与背景完全不动。

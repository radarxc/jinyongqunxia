---
asset_id: cg_ch04_wanan_fire_rescue
name: "万安寺火塔营救"
book: ch04_yitian
characters:
- npc_zhangwuji
- npc_zhaomin
- npc_zhouzhiruo
- npc_fanyao
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_jiaozhu_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhaomin__ch04_youth_scene_lvliu.resume3r2.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhouzhiruo__ch04_youth_scene_guangmingding.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch04/cg_ch04_wanan_fire_rescue.png
manifest: assets/default/scene/ch04/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_jiaozhu_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "e272b054c1b027b808e198a9fc1aea0bf315d83e1c2e2ba3847cba9b5026607d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhaomin__ch04_youth_scene_lvliu.resume3r2.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "2229259445c498b518aa8af53e05601cbac603340364b70079f294d8aee69b66"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhouzhiruo__ch04_youth_scene_guangmingding.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "6b2535959bcdb658d8bfa2541ed6a5c12edf07b815f7e78042d52faafc5bddc2"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch04_wanan_fire_rescue.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch04_wanan_fire_rescue.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
万安寺火塔营救，选择张无忌塔下接应群雄的瞬间。无忌深灰轻便衣、单掌向侧前方舒展，以乾坤大挪移将下坠者的力道引向横侧，不用双臂硬抱高空坠落者；赵敏换深蓝披肩与简便衣、远离落点在院侧紧张观察，不主动协助救人，周芷若为峨眉弟子素衣，在上层窗边紧张望下；苦头陀范遥为饱经风霜的魁伟成熟男子（确龄待三联纸本核对，不画青年或白须高龄老僧），满脸纵横旧刀疤已经愈合、不见血，长发配深灰褐头陀衣和木念珠，闭口深沉，不能画成光头白须和尚；他只用文字塑造，在高塔上层更远的烟雾栏边照应众人。高塔火光克制，不能吞没面容，营救者沿下降斜线构图。不同先后行动凝为编辑性概括，跃塔顺序待考；不画灭绝被成功救活、不改写原著结局，不画烧伤特写。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_zhangwuji的本轮立绘；第2张为npc_zhaomin的本轮立绘；第3张为npc_zhouzhiruo的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「火塔救群雄」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《倚天屠龙记》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是张无忌（npc_zhangwuji）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是赵敏（npc_zhaomin）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是周芷若（npc_zhouzhiruo）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是灭绝师太（npc_miejueshitai）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第二十七回，万安寺火塔营救。
地点与时刻：大都路万安寺；深夜、塔火与飞雪。
画面瞬间：张无忌在塔下张臂接应跃下者，赵敏在侧指挥让出落点，周芷若扶住灭绝，范遥从烟中破门。
构图与站位：仰角大全景；高塔占左上，四层人物沿下降斜线连接，火光克制且不吞没人脸。
情绪基调：紧迫、救援、代价。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传张无忌、赵敏、周芷若、灭绝；范遥 A 级只写苦头陀装束。
未上传身份参考的人物文字要点：
范遥：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：跃塔顺序与灭绝动作（待考）；不画烧伤特写。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


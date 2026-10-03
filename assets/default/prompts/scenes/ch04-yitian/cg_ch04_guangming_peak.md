---
asset_id: cg_ch04_guangming_peak
name: "光明顶止战"
book: ch04_yitian
characters:
- npc_zhangwuji
- npc_zhouzhiruo
- npc_miejueshitai
- npc_yangxiao
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_jiaozhu_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhouzhiruo__ch04_youth_scene_guangmingding.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch04/cg_ch04_guangming_peak.png
manifest: assets/default/scene/ch04/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_jiaozhu_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "e272b054c1b027b808e198a9fc1aea0bf315d83e1c2e2ba3847cba9b5026607d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhouzhiruo__ch04_youth_scene_guangmingding.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "6b2535959bcdb658d8bfa2541ed6a5c12edf07b815f7e78042d52faafc5bddc2"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch04_guangming_peak.resume3r2
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch04_guangming_peak.resume3r2`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
光明顶六派围攻的止战瞬间。成年张无忌换回朴素灰白行旅袍，站在两阵之间张开双臂，温厚坚定、承担危险；成年周芷若身穿峨眉弟子装持普通峨眉用剑踟蹰，倚天剑只在灭绝手中一柄，不能继承掌门长鞭。灭绝师太为四五十岁左右的中年女尼，容貌端正、两条长眉向外斜垂，神情冷厉，灰尼袍与尼帽、持倚天剑，不画白发老妪；杨逍为已有岁月痕迹的清俊中年男子，长发后束、双眉略向下垂、嘴边自然深纹，素白长袍、黑腰带，唇颏只淡淡胡茬、不画青年少年。二人分处更远两侧只文字塑造。明教与六派人群为远景低细节，广场风沙、山势辽阔。背景绝对不出现旗幡、牌匾、经文或任何写字的物体，所有布幔全部无字纯色；画面只有右上题字“光明止戈”四字，不许额外的“佛”字、门派名或装饰字；杨逍确龄涉及版本异文，待三联纸本核对；精确连战站位与剑刺先后待考，本画取编辑性静态概括。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_zhangwuji的本轮立绘；第2张为npc_zhouzhiruo的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「光明止戈」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《倚天屠龙记》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是张无忌（npc_zhangwuji）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是周芷若（npc_zhouzhiruo）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是灭绝师太（npc_miejueshitai）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十九至二十一回，光明顶止战。
地点与时刻：光明顶广场；夏日正午、风沙。
画面瞬间：张无忌张开双臂立在六派与明教之间，周芷若剑尖停在他身前，灭绝与杨逍隔阵对望。
构图与站位：大全景；张无忌居中，六派与明教左右成两道楔形，周芷若在前景冲突线上。
情绪基调：壮阔、止戈、个人承担。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传张无忌 por_npc_zhangwuji__ch04_youth_scene_guangmingding、周芷若 por_npc_zhouzhiruo__ch04_youth_scene_guangmingding、灭绝 por_npc_miejueshitai__ch04_elder_yitian_base；杨逍 A 级仅文字。
未上传身份参考的人物文字要点：
杨逍：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：连战站位与剑招动作（待考）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


---
asset_id: cg_ch03_chongyang_swords
name: "重阳宫并肩与婚誓"
book: ch03_shendiao
characters:
- npc_yangguo
- npc_xiaolongnv
- npc_jinlunfawang
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_onearm_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaolongnv__ch03_youth_jueqing_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch03/cg_ch03_chongyang_swords.png
manifest: assets/default/scene/ch03/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_onearm_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "0c4fa42a5bbf79f72b7d699ab82766820ad3159245fffec7ed8043781dc42a50"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaolongnv__ch03_youth_jueqing_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "a1ec611c1fca7f9fafafd935e164f3fb9233dd2ce20a804fdc86457ae3cdf6e0"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch03_chongyang_swords.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch03_chongyang_swords.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
重阳宫重逢救援的编辑性构图，具体交战与婚誓先后待考。杨过人物自身右臂已断，仅左手持玄铁重剑，空右袖清楚，不许双臂或普通细剑；他站在疲惫的小龙女身前护住她。小龙女双手各有一柄细长古剑但收势低垂，素白衣被尘沾染仍完整。远处金轮法王是极高极瘦的中老年藏僧，身披黄袍、头部剃净、额顶轮廓自然微陷，脸颊瘦削、下巴仅短须影，不画红袍壮汉或白须仙翁；手持金属轮，其余轮束在腰侧，木殿残烛与碎瓦衬托危险；三人并非画成杨龙各一细剑交叉的错误造型。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_yangguo的本轮立绘；第2张为npc_xiaolongnv的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「重阳同心」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《神雕侠侣》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是杨过（npc_yangguo）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是小龙女（npc_xiaolongnv）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是金轮法王（npc_jinlunfawang）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第二十七至二十八回，重阳宫并肩与婚誓。
地点与时刻：重阳宫大殿；冬日暮色。
画面瞬间：杨过与小龙女双剑交叉挡住金轮攻势，两人短暂对视，残烛与碎瓦见证重逢。
构图与站位：中全景；双人居中背靠斜站，金轮法王左后压进，剑线组成稳定 X。
情绪基调：久别重逢、决绝、相守。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传杨过 por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue、小龙女 por_npc_xiaolongnv__ch03_youth_scene_chongyang_two_sword_combat、金轮法王 por_npc_jinlunfawang__ch03_elder_base。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：合战动作与婚礼先后（待考）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《神雕侠侣》第二十六回 神雕重剑：“剑尖更圆圆的似是个半球”；https://www.xuges.com/wuxia/jinyong/sdxl/187.htm
- AR-82 返修约束（本节优先于历史提示词）：只将杨过左手玄铁重剑的三角尖端改成半球形圆钝厚铁尖，两边不开刃；保持重剑的长度、角度、重量感和原左手。杨过、小龙女、金轮法王全部人物与剑柄、衣服、背景、题字印章保持。

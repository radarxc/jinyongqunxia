---
asset_id: cg_ch01_xingzilin_reveal
name: "杏子林身世揭露"
book: ch01_tianlong
characters:
- npc_xiaofeng
- npc_azhu
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch01/cg_ch01_xingzilin_reveal.png
manifest: assets/default/scene/ch01/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "26770d598a4d432c9cd44f97d4f69b943422e9dec02f03a906888a60967ee734"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "e73c1fd6abb1d97bf1c2b8c275870a9bbcd45e93e8d1a669be99ae03b88c254f"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "d80304aabc32f6b945696496a5d70d02076549c38fd6460e022e3f919d07e39d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch01_xingzilin_reveal.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch01_xingzilin_reveal.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
杏子林身份揭露后的概括构图（原创扩展构图；具体同场站位待考）。萧峰壮年魁伟，灰褐旧袍，孤立在林中前景，面前案上放竹棒；他双手空着，神色豪烈克制。成年阿朱素裙在边缘凝望，群丐穿补缀布衣分散两侧，不复制任何演员。阴天杏林，人物面孔自然，留出空气。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
参考前两张分别是萧峰本轮阶段和基础，同一个人不可复制成两人；第三张是阿朱，严格隔离身份。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「杏林惊变」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《天龙八部》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是萧峰（npc_xiaofeng）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是阿朱（npc_azhu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十五回，杏子林身世揭露。
地点与时刻：无锡杏子林；暮春阴天。
画面瞬间：萧峰将打狗棒横放案前，独自面对分开的丐帮众人，阿朱在人群边缘凝望他。
构图与站位：大全景；萧峰居中前景，丐帮两侧退成弧形，阿朱右后成唯一向内的视线。
情绪基调：震动、孤绝、尊严。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传萧峰 por_npc_xiaofeng__ch01_prime_scene_xingzilin_departure、阿朱 por_npc_azhu__ch01_youth_alive_base；白世镜与吴长风只按中老年丐帮装束文字写。
未上传身份参考的人物文字要点：
白世镜：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
吴长风：老年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：证言来源和动作链（待考）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《天龙八部》第十五回 杏子林中 商略平生义：“立时便将他肩上四柄法刀拔了下来”；“创口中如喷泉般的鲜血立时便止”；https://www.xuges.com/wuxia/jinyong/tlbb/114.htm
- 《天龙八部》第十二回 从此醉：“用一根银色丝带轻轻挽住”；https://www.xuges.com/wuxia/jinyong/tlbb/087.htm
- AR-82 返修约束（本节优先于历史提示词）：正中萧峰两肩各两处拔出法刀后的衣料破口与少量暗红血痕，共四处，刀已拔出不画刀。右侧王语嫣删掉金簪白珠及全部粉红发带，只用一根银灰丝带轻挽长发，有银结与细长银色尾带。两人原脸、耳坠、其余衣服、所有其他人、背景、题字朱印逐像素不变。肩伤采用第一轮局部候选、银带采用第二轮局部候选蒙版合成。

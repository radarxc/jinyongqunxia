---
asset_id: cg_ch04_vajra_circle
name: "金刚伏魔圈"
book: ch04_yitian
characters:
- npc_zhangwuji
- npc_xiexun
- npc_duee
- npc_dujie
- npc_dunan
- npc_zhouzhiruo
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_scene_sandu.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhouzhiruo__ch04_youth_scene_shaolin.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch04/cg_ch04_vajra_circle.png
manifest: assets/default/scene/ch04/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_scene_sandu.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "9363a1b5bfc7bb070cf3c79c43476f1f5f83cb0e983160ce57bd36e9780a0717"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhouzhiruo__ch04_youth_scene_shaolin.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "936ae8e1e268b46675dee01ddfb6b50ee08556d532689fe26812d4c125d84452"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch04_vajra_circle.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch04_vajra_circle.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
少林枯禅林的金刚伏魔圈，以高位中远景概括三渡阵势。张无忌沉稳空手应对，三渡均为面颊深陷的枯瘦高龄老僧，但形貌严格区分：渡厄肤色自然枯黄，人物自身左眼闭合失明而右眼正常；渡劫苍白肤色、双眼正常；渡难自然深黝暖棕肤色、双眼正常，不画黑面具或种族漫画。三人仅稀疏短须，剃度头部、朴素旧僧衣，分坐三株高松树干的凹洞内，各持真实黑色长索，长索在空间里形成三角但没有法阵光。谢逊是高大魁梧、宽厚脸的中老年男子，金黄色浓发披肩、金须和金眉，双眼失明、目光失焦，不画白发老仙或闭单眼；他仍在三株松树之间的地下囚牢内，俯视时仅能从地牢口暗处隐约见到他的上半身；不画山壁洞窟、地面站立或已获救的姿态，此地牢可见性为编辑性剖示；周芷若在阵外握着收拢长鞭观察。松针石地、严肃克制，阵位和救援时序为编辑性构图；渡厄独眼已据正文核对，具体盲侧沿用现有 NPC 左盲默认、待三联纸本确认，另二僧双眼正常。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_zhangwuji的本轮立绘；第2张为npc_zhouzhiruo的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「金刚伏魔」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《倚天屠龙记》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是张无忌（npc_zhangwuji）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是谢逊（npc_xiexun）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是渡厄（npc_duee）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是渡劫（npc_dujie）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 5 张参考图是渡难（npc_dunan）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 6 张参考图是周芷若（npc_zhouzhiruo）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第三十六至三十九回，金刚伏魔圈。
地点与时刻：少林枯禅林；秋日午后、落叶。
画面瞬间：三渡长索在枯树间织成三角，张无忌护住圈中的谢逊，周芷若在阵外收剑观察破绽。
构图与站位：高位大全景；三渡占三角顶点，张无忌与谢逊居中，周芷若在下方边缘。
情绪基调：森严、因果、以战求证。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传张无忌、谢逊、三渡、周芷若。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：阵法细节（待考）；长索真实、不画法阵光效。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


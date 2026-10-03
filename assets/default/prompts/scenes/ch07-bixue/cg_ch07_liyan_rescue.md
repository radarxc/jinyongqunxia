---
asset_id: cg_ch07_liyan_rescue
name: "李岩、红娘子死局"
book: ch07_bixue
characters:
- npc_zhujue
- npc_yuanchengzhi
- npc_liyan
- npc_hongniangzi
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yuanchengzhi__ch07_youth_jinshe_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch07/por_npc_zhujue__ch07_m_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch07_liyan_rescue_identity_board.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch07/cg_ch07_liyan_rescue.png
manifest: assets/default/scene/ch07/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yuanchengzhi__ch07_youth_jinshe_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "2ebb49847a1bbbdd4cfc1b7c788a4574b1a7c39e54a9ce648906d65c5c1f9f7a"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch07/por_npc_zhujue__ch07_m_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "bee96ce4e5a9f78bb0f63a7b376cf703f84e6b8d75fabfc594d66e199bdc1dc8"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch07_liyan_rescue_identity_board.jpg", "use": "本轮主角身份联系图；源立绘与左右顺序见同名JSON", "sha256": "89b344aee1841a3a46faad21d4f5605b457bd01cca4c19f62814edcae220072c"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch07_liyan_rescue.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch07_liyan_rescue.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
黎明冷雨中的军帐，AR-20原创改命瞬间：李岩低头坐于案前，男玩家主角轻按其手臂制止绝望行动，红娘子在一侧扶住他的肩，袁承志掀帐赶到形成明亮出口。四人中景，匕首收在桌面边缘且不接触身体，衣着完整无血腥，表情由绝望转为被唤回。
原创扩展改命；二人获救不是原著结局，营地具体地名待考所以不指定；玩家沿用旧S身份图不纳入本轮精修。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_yuanchengzhi的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。 第3张是身份联系图，从左到右依次为liyan、hongniangzi；每一格只锁定该人的身份，不把格数画进成品。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「碧血留人」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《碧血剑》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是主角（男）· 明末（npc_zhujue）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是袁承志（npc_yuanchengzhi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是李岩（npc_liyan）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是红娘子（npc_hongniangzi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第二十回李岩、红娘子死局；AR-20 改命窗口。
地点与时刻：渭水附近军营（地名待考）；黎明、冷雨。
画面瞬间：主角一手按住李岩尚未落下的匕首，袁承志掀帐赶到，红娘子从另一侧扶住李岩，三人终于形成救援闭环。
构图与站位：四人中景；李岩居中坐案前，主角与红娘子左右制止，袁承志在帐门形成出口。
情绪基调：千钧一发、守望、悲剧可改。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传男主 por_npc_zhujue__ch07_m_base、袁承志、李岩、红娘子。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：（原创扩展改命）；衣着完整、不表现自伤或血腥；身份图审核前（生产门禁）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


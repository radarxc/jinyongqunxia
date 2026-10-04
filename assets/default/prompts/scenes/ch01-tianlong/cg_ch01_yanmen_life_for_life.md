---
asset_id: cg_ch01_yanmen_life_for_life
name: "AR-26“一命换一命”"
book: ch01_tianlong
characters:
- npc_zhujue
- npc_xiaofeng
- npc_azhu
- npc_duanyu
- npc_xuzhu
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch01_yanmen_life_for_life_identity_board.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch01/cg_ch01_yanmen_life_for_life.png
manifest: assets/default/scene/ch01/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "1420e35245e108e790119628c4a3e82c851438a46ee822ea8dfae90224b08833"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "d80304aabc32f6b945696496a5d70d02076549c38fd6460e022e3f919d07e39d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch01_yanmen_life_for_life_identity_board.jpg", "use": "本轮主角身份联系图；源立绘与左右顺序见同名JSON", "sha256": "8a3798f35d2f0a918bf474a80aaaa205112510e42583ae118d66f84eebdbbdfb"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch01_yanmen_life_for_life.resume3r2
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch01_yanmen_life_for_life.resume3r2`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
本作AR-26一命换一命特殊改命，原创扩展，绝非原著结局。雁门关外黄昏绝壁，玩家男主素灰旅装以身拦住萧峰坠势，身体被风带向左侧崖洞；阿朱在安全右侧扶住萧峰，段誉、虚竹伸手相援。动作稳健可读，不画尸体、不画刺胸。萧峰风尘厚袍、神情惊痛；阿朱成年素衣，段誉青衫，虚竹灰僧衣。救阿朱前置已满足；玩家只按文字画普通成年男子背侧影，不借其他人的脸。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张萧峰，第2张阿朱。人物身份严格隔离。 第3张是身份联系图，从左到右依次为duanyu、xuzhu；每一格只锁定该人的身份，不把格数画进成品。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「雁门换命」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《天龙八部》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是主角（男）· 北宋（npc_zhujue）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是萧峰（npc_xiaofeng）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是阿朱（npc_azhu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是段誉（npc_duanyu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 5 张参考图是虚竹（npc_xuzhu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：AR-26“一命换一命”；雁门关止战后。
地点与时刻：雁门关绝壁；冬日黄昏、狂风。
画面瞬间：主角以身拦住萧峰坠势，被狂风卷向崖侧洞口；阿朱冲到萧峰身边，段誉与虚竹同时伸手。
构图与站位：超广角；萧峰与阿朱居右、主角在左侧风线上，段誉虚竹形成连接斜线，避免坠落血腥。
情绪基调：牺牲、顿悟、重逢。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传男主 por_npc_zhujue__ch01_m_base、萧峰、阿朱、段誉、虚竹。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：（原创扩展改命）；偈语内容不在画面写字；待 DES-sleep-events 定稿（生产门禁）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《天龙八部》第十二回 从此醉：“用一根银色丝带轻轻挽住”；https://www.xuges.com/wuxia/jinyong/tlbb/087.htm
- AR-82 返修约束（本节优先于历史提示词）：只将粉衣王语嫣后脑右上珠钗与粉色带尾，改为银色丝带轻挽长发，清楚银带结和细长银带尾，去掉钗针与珍珠饰。保留王语嫣长发、脸和原五官、耳坠、身体姿势及衣服。萧峰、段誉、虚竹、所有其他人、战场、题字和朱印逐像素不变。

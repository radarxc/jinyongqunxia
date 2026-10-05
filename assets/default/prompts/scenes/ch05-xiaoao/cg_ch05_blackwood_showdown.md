---
asset_id: cg_ch05_blackwood_showdown
name: "黑木崖决战（回目待考）"
book: ch05_xiaoao
characters:
- npc_linghuchong
- npc_renyingying
- npc_renwoxing
- npc_xiangwentian
- npc_dongfangbubai
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/audit_support/staging/por_npc_linghuchong__ch05_youth_huashan_base.1791015011194128000/archive/por_npc_linghuchong__ch05_youth_huashan_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/audit_support/staging/por_npc_renyingying__ch05_youth_shenggu_base.1791015013396846000/archive/por_npc_renyingying__ch05_youth_shenggu_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch05_blackwood_showdown_identity_board.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch05/cg_ch05_blackwood_showdown.png
manifest: assets/default/scene/ch05/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/audit_support/staging/por_npc_linghuchong__ch05_youth_huashan_base.1791015011194128000/archive/por_npc_linghuchong__ch05_youth_huashan_base.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "5e7fec4c65b579cc47c70954e9ba5242a001d8063a1c1d700a2b1853834c6bc0"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/audit_support/staging/por_npc_renyingying__ch05_youth_shenggu_base.1791015013396846000/archive/por_npc_renyingying__ch05_youth_shenggu_base.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "16995424f549c6353993aefa4744a095af1ca8a77a2e47c5aaba136675c807ae"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/cg_ch05_blackwood_showdown_identity_board.jpg", "use": "本轮主角身份联系图；源立绘与左右顺序见同名JSON", "sha256": "8cc30c37c828dc20443b1bcfc5213c046530dfbaf256e9ebd828441e627283ca"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch05_blackwood_showdown.resume3
---

## AR-82 当前定稿要求

只改画面最右侧东方不败的深红外袍布料主色为娇艳粉红，与其返修后的基础立绘一致。保留内衫、脸与发冠、绣花针、手、针线与绷架；其他四人的全部像素和整幅题字完全保留，特别是前景黑袍任我行的衣服不改，本场并非出狱一刻。保持原画衣褶、刺绣位置、机位与动作。

以上为当前原著核对后的要求，覆盖下文旧版中与之冲突的服饰、器物、伤残、光线和体态描述。

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch05_blackwood_showdown.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
黑木崖绣房中的紧张交锋：东方不败手拈细针立于绣架旁，令狐冲提剑抵御，任我行与向问天分居前侧和门侧。任盈盈位于后景侧门，警惕观察敌方牵挂所在，表情果断；不把她画成始终与令狐冲同正面围攻的人。针线、绣架、窄窗与剑构成尖锐空间，所有人完整着装，不画血腥。
原创扩展群像构图；为避免擅造杨莲亭具体被制动作，仅示盈盈侧向观察；角色身份各自隔离。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_linghuchong的本轮立绘；第2张为npc_renyingying的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。 第3张是身份联系图，从左到右依次为renwoxing、xiangwentian、dongfangbubai；每一格只锁定该人的身份，不把格数画进成品。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「黑木决战」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《笑傲江湖》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是令狐冲（npc_linghuchong）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是任盈盈（npc_renyingying）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是任我行（npc_renwoxing）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 4 张参考图是向问天（npc_xiangwentian）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 5 张参考图是东方不败（npc_dongfangbubai）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：黑木崖决战（回目待考）。
地点与时刻：黑木崖绣房；白日、窗光锐利。
画面瞬间：东方不败拈针从绣架后掠起，令狐冲与任盈盈一前一后护住任我行，向问天封住侧门。
构图与站位：室内大全景；绣架居中形成障碍，东方不败上方轻捷，四人扇形包围但留退路。
情绪基调：妖异、迅疾、权力反噬。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传五人 S 级立绘。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：令狐冲、任盈盈、任我行、东方不败待重出（生产门禁）；不画血腥特写。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《笑傲江湖》三十一《绣花》：“身穿粉红衣衫”（https://xuges.com/WUXIA/jinyong/xajh/237.htm）
- AR-82 返修约束：只改画面最右侧东方不败的深红外袍布料主色为娇艳粉红，与其返修后的基础立绘一致。保留内衫、脸与发冠、绣花针、手、针线与绷架；其他四人的全部像素和整幅题字完全保留，特别是前景黑袍任我行的衣服不改，本场并非出狱一刻。保持原画衣褶、刺绣位置、机位与动作。

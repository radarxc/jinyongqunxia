---
asset_id: cg_ch07_xueyi_wenyi_memory
name: "夏雪宜与温仪旧事揭晓"
book: ch07_bixue
characters:
- npc_xiaxueyi
- npc_wenyi
- npc_wenqingqing
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_wenqingqing__ch07_youth_scene_shiliang.resume3r2.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch07/por_npc_xiaxueyi__ch07_prime_memory_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg"
output: assets/default/scene/ch07/cg_ch07_xueyi_wenyi_memory.png
manifest: assets/default/scene/ch07/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_wenqingqing__ch07_youth_scene_shiliang.resume3r2.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "f941abe1427d5801f74bae9637b8c56c7571697416c13c8e66bf8a829263c1ed"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch07/por_npc_xiaxueyi__ch07_prime_memory_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "d0bd3e22d2cb4146920ad76c938cfd528549653b3c6119057fab723ce715db02"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "cd6b69da364b28cfc91738d9647b8a94962e740cc8adbef303c721bfcf352bed"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "f45e437fad61090b11ba36df0779b783b1996e6a61942c019d49a121b7d9feae"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch07_xueyi_wenyi_memory.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch07_xueyi_wenyi_memory.resume3`；实际上传顺序见frontmatter，末两张为female项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
石梁温家旧园的双时层记忆画：前景成年温青青穿与新版石梁阶段相同的米白色右衽短襦、深灰蓝长裙与素布鞋握紧素帕，神情迟悟悲愤；中景以更柔暖的画中追忆层表现夏雪宜放下金蛇剑、与温仪静静相对，温仪为端庄成年女子、素色襦裙，只文字。梨花与旧木窗衔接冷暖两层，人物之间不作跨时间触碰。
原创扩展叙事构图；温仪与夏雪宜属旧事追忆而非同一时点生还，具体动作待考。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为本轮已核验入库的温青青石梁阶段，保持该人的成年面容和本阶段衣装；第2张为夏雪宜既有S级人物立绘，保持其壮年面容与金蛇剑特征。温仪仅依据文字塑造，端庄成年女性，母女需有年龄差，不能复制青青同一张脸。最后两张只参考画风，不画入其中人物。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「金蛇旧梦」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《碧血剑》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是夏雪宜（npc_xiaxueyi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是温青青（npc_wenqingqing）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第六至七回，夏雪宜与温仪旧事揭晓。
地点与时刻：石梁温家旧园；春夜、梨花风。
画面瞬间：追忆中的夏雪宜放下金蛇剑替温仪挡住温家人视线，成年温青青在画外层握紧旧信。
构图与站位：纵深中景；旧事二人居暖色中景，温青青冷色前景侧影，信纸无可读文字。
情绪基调：苦恋、迟悟、代际伤痕。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传 por_npc_xiaxueyi__ch07_prime_memory_base、por_npc_wenqingqing__ch07_youth_disguise_base；温仪为端庄成年女子、素色襦裙。
未上传身份参考的人物文字要点：
温仪：成年女性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：双时层为（原创扩展构图）；旧事动作（待考）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


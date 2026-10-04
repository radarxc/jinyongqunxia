---
asset_id: cg_ch07_golden_serpent_cave
name: "金蛇洞遗骨与遗藏"
book: ch07_bixue
characters:
- npc_yuanchengzhi
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch07/cg_ch07_golden_serpent_cave.png
manifest: assets/default/scene/ch07/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "3c7a3363b7e7281af4bdf645c27d1890460e0e030021bb9e859c9c66f6236484"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch07_golden_serpent_cave.resume3
---

## AR-82 当前定稿要求

只在袁承志自身左眉上方（画面右眉）皮肤补一处淡小愈合旧刀疤。保留眉毛眼睛鼻嘴和神情、不改发型、身体、衣物或背景。本图出鞘金蛇剑原有清楚的蛇舌双叉尖，已复核正确，必须保留整柄剑逐像素，不要重画剑。题字不变。

以上为当前原著核对后的要求，覆盖下文旧版中与之冲突的服饰、器物、伤残、光线和体态描述。

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch07_golden_serpent_cave.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
成年袁承志再访华山金蛇洞，独自凝视刚从洞壁拔出的曲折金蛇剑，握剑之手与剑柄关系清晰。旁边石面摆一只朴素小铁盒与无可读字的遗册，二者作为遗藏主题的编辑性道具并置，不画石匣。他神色郑重，岩壁湿润，洞口冷光与细尘映出幽深空间；中全景，传奇而肃静。
改取成年再访取剑：早年初入时尚无力拔剑；容器为铁盒，不是石匣。遗册与铁盒的洞内摆放为原创主题并置，不冒称初次发现当场读完；青青仍未同场，不画夏雪宜实体鬼魂。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_yuanchengzhi的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「金蛇遗藏」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《碧血剑》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是袁承志（npc_yuanchengzhi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是温青青（npc_wenqingqing）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 3 张参考图是夏雪宜（npc_xiaxueyi）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第四回，金蛇洞遗骨与遗藏。
地点与时刻：华山金蛇洞；午后、洞顶冷光。
画面瞬间：袁承志与温青青在石匣前并肩展开遗书，夏雪宜以画中追忆层立在二人身后而非实体鬼魂。
构图与站位：中全景；袁温分居石匣两侧，追忆层居上方暗部，金蛇剑横向连接三人。
情绪基调：传奇、疑团、旧情余波。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传 por_npc_yuanchengzhi__ch07_youth_scene_jinshedong、por_npc_wenqingqing__ch07_youth_disguise_base、por_npc_xiaxueyi__ch07_prime_memory_base。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：追忆叠化为（原创扩展构图）；遗物摆放（待考）；三图待审核。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 原著依据

- 《碧血剑》三《经年亲剑铗，长日对楸枰》：“小小疤痕”（https://xuges.com/WUXIA/jinyong/bxj/013.htm）
- 《碧血剑》四《矫矫金蛇剑，翩翩美少年》：“剑尖竟有两叉”（https://xuges.com/WUXIA/jinyong/bxj/020.htm）
- AR-82 返修约束：只在袁承志自身左眉上方（画面右眉）皮肤补一处淡小愈合旧刀疤。保留眉毛眼睛鼻嘴和神情、不改发型、身体、衣物或背景。本图出鞘金蛇剑原有清楚的蛇舌双叉尖，已复核正确，必须保留整柄剑逐像素，不要重画剑。题字不变。

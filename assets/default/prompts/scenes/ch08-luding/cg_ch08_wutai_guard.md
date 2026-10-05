---
asset_id: cg_ch08_wutai_guard
name: 五台护驾
book: ch08_luding
characters:
- npc_weixiaobao
- npc_shuanger
- npc_sangjie
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_scene_qingmu_incense.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
output: assets/default/scene/ch08/cg_ch08_wutai_guard.png
manifest: assets/default/scene/ch08/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: 作者 10-02 晚：复合基线风格精修
references:
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_scene_qingmu_incense.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
  use: 项目画风基线
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
  use: 项目画风基线
generation_job: cg_ch08_wutai_guard.retry3.r1
generation_attempts: 1
title_text: 五台护驾
title_method: generated
identity_revision: 使用本轮新复合base及对应新阶段立绘
title_verified: 逐字放大核验：五 / 台 / 护 / 驾；原生正确
---

## Gemini 提示词

```text
生成一张3:2横幅写实手绘古风剧情插画，1536×1024。所有人物明确为成年；单幅完整场景，不拼贴不分镜。
第1张参考：韦小宝本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
第2张参考：韦小宝·宫廷与青木堂双重身份阶段图，锁定新身份与年龄，衣物道具以【场面】为准，不复制姿势背景。
第3张参考：双儿本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
最后两张为项目画风基线，只借笔触、设色、自然材质，不借人物身份。各人脸与发式严格隔离，不串脸。未上传的人物只按下述文字塑造，不复制演员面孔。
【场面】五台山寺院雪阶，韦小宝与双儿护住通向禅房的窄路，远处番僧逼近；行痴隐在门内不露脸；不要把后来相遇的九难硬挤同一刻。
【剧情边界】story/08 第18回与第24回择前者护驾节点；天气构图原创扩展，番僧精确站位待考。；题名、画面取景、站位、时刻、服饰配色、成年化均属（原创扩展）；指定版本细节待纸本逐字终校（待考）。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；依照本场天色和灯火布光，明暗自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【构图】画面有近中远层次，视线与肢体动作清晰，人物互相留出空间，头与手可读。保留完整环境背景。不要堆成合影。右上方天空或墙面留出题字空白，文字不挡脸。
【古风题字】右上角一列竖排毛笔楷书，自上至下准确写「五」「台」「护」「驾」，合成「五台护驾」。每字约画宽4%，全列不超过画高40%。墨黑自然笔锋；每字仅一次，不多字不漏字；下方一枚小朱红无字方印。
【时代】清代传统服装；男角剃额留辫，僧侣剃光无辫，圆性素僧帽遮剃发、不戴紫帽珠帘；胡斐按作者例外束发不剃额不结辫，狄云按对应阶段；右衽；禁止现代物件。
排除：除题名外不出现可读文字、字幕、堂匾、签名或水印；不要幼态、儿童比例、色情、裸露、血腥特写、肢体错乱、多指、穿模、照片、演员肖像、塑料CG、厚涂油画、漫画、法阵发光。
```

## 本轮精修记录

- 参考分工见实际提示词；配色、姿势、取景及成年化均为（原创扩展）。
- 本轮结果已逐图目检并入库为 candidate；实际作业与参考哈希见 manifest。

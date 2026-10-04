---
asset_id: cg_ch13_graveside_farewell
name: 墓畔长风
book: ch13_feihu
characters:
- npc_hufei
- npc_yuanziyi
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch13/por_npc_hufei__ch13_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch13/por_npc_hufei__ch13_youth_scene_grave_return_blade.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
output: assets/default/scene/ch13/cg_ch13_graveside_farewell.png
manifest: assets/default/scene/ch13/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: 作者 10-02 晚：复合基线风格精修
references:
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch13/por_npc_hufei__ch13_youth_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch13/por_npc_hufei__ch13_youth_scene_grave_return_blade.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
  use: 项目画风基线
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
  use: 项目画风基线
generation_job: cg_ch13_graveside_farewell.retry3.r1
generation_attempts: 1
title_text: 墓畔长风
title_method: generated
identity_revision: 使用本轮新复合base及对应新阶段立绘
title_verified: 逐字放大核验：墓 / 畔 / 長 / 風；原生题字，繁简同字；规范题名：墓畔长风
title_rendered_text: 墓畔長風
---

## Gemini 提示词

```text
【AR-82 当前原著约束，覆盖后文冲突旧描述】本图是胡斐归刀后将程灵素骨灰放到墓地的同一连续夜景，改为冷月夜色：天空、山林和墓地受冷月蓝灰光照，现日光晴昼完全改为夜色，可在不挪树木地形处留出月光。只改夜景光照和胡斐衣料的月光色，胡斐的头脸、抱坛与跪姿保持，刀已归墓，不重新持刀。画面后方袁紫衣仅在前部头皮补六枚小戒印，其余全身面容保留原像素；原题字墓畔长风的字形像素与红印逐像素保持不变，题字周边采用夜色自然留亮，不留日间矩形天空块；不能重画袁紫衣面孔衣物或题字，夜景保持手绘插画材质。
【AR-82 原文摘句】《飞狐外传》第二十章“恨无常”：“刀光如水，在冷月下流转不定”；“将宝刀放回土坑之中”；《飞狐外传》第十九章“相见欢”：“脑门处并有戒印”。

生成一张3:2横幅写实手绘古风剧情插画，1536×1024。所有人物明确为成年；单幅完整场景，不拼贴不分镜。
第1张参考：胡斐本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
第2张参考：胡斐·墓前归刀阶段图，锁定新身份与年龄，衣物道具以【场面】为准，不复制姿势背景。
第3张参考：袁紫衣·圆性现身本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
最后两张为项目画风基线，只借笔触、设色、自然材质，不借人物身份。各人脸与发式严格隔离，不串脸。未上传的人物只按下述文字塑造，不复制演员面孔。
【场面】沧州胡氏父墓旁的新土，胡斐深灰旅袍旧披肩垂首，正将盛骨灰素瓦坛放入未封的小土坑，包布置旁；刀已归墓，不再佩冷月宝刀。圆性剃度光头无帽、深灰缁衣在远处合十，柏树青草在风里伏动，白马可在极远处，不画平阿四、不画程灵素活体或鬼影，墓碑无字。
【剧情边界】第20章将程灵素骨灰葬父母墓旁与归刀余韵；圆性站位和道具同框为原创压缩构图。https://99csw.com/book/2180/64754.htm 目标三联/广州修订版逐字校勘仍待考。；题名、画面取景、站位、时刻、服饰配色、成年化均属（原创扩展）；指定版本细节待纸本逐字终校（待考）。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；依照本场天色和灯火布光，明暗自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【构图】画面有近中远层次，视线与肢体动作清晰，人物互相留出空间，头与手可读。保留完整环境背景。不要堆成合影。右上方天空或墙面留出题字空白，文字不挡脸。
【古风题字】右上角一列竖排毛笔楷书，自上至下准确写「墓」「畔」「长」「风」，合成「墓畔长风」。每字约画宽4%，全列不超过画高40%。墨黑自然笔锋；每字仅一次，不多字不漏字；下方一枚小朱红无字方印。
【时代】清代传统服装；男角剃额留辫，僧侣剃光无辫，圆性素僧帽遮剃发、不戴紫帽珠帘；胡斐按作者例外束发不剃额不结辫，狄云按对应阶段；右衽；禁止现代物件。
排除：除题名外不出现可读文字、字幕、堂匾、签名或水印；不要幼态、儿童比例、色情、裸露、血腥特写、肢体错乱、多指、穿模、照片、演员肖像、塑料CG、厚涂油画、漫画、法阵发光。
```

## 本轮精修记录

- 参考分工见实际提示词；配色、姿势、取景及成年化均为（原创扩展）。
- 本轮结果已逐图目检并入库为 candidate；实际作业与参考哈希见 manifest。


## 原著依据

- AR-82 同步依据：《飞狐外传》第二十章“恨无常”：“刀光如水，在冷月下流转不定”；“将宝刀放回土坑之中”；《飞狐外传》第十九章“相见欢”：“脑门处并有戒印”。；执行：本图是胡斐归刀后将程灵素骨灰放到墓地的同一连续夜景，改为冷月夜色：天空、山林和墓地受冷月蓝灰光照，现日光晴昼完全改为夜色，可在不挪树木地形处留出月光。只改夜景光照和胡斐衣料的月光色，胡斐的头脸、抱坛与跪姿保持，刀已归墓，不重新持刀。画面后方袁紫衣仅在前部头皮补六枚小戒印，其余全身面容保留原像素；原题字墓畔长风的字形像素与红印逐像素保持不变，题字周边采用夜色自然留亮，不留日间矩形天空块；不能重画袁紫衣面孔衣物或题字，夜景保持手绘插画材质。


## AR-82 当前返修约束

本图是胡斐归刀后将程灵素骨灰放到墓地的同一连续夜景，改为冷月夜色：天空、山林和墓地受冷月蓝灰光照，现日光晴昼完全改为夜色，可在不挪树木地形处留出月光。只改夜景光照和胡斐衣料的月光色，胡斐的头脸、抱坛与跪姿保持，刀已归墓，不重新持刀。画面后方袁紫衣仅在前部头皮补六枚小戒印，其余全身面容保留原像素；原题字墓畔长风的字形像素与红印逐像素保持不变，题字周边采用夜色自然留亮，不留日间矩形天空块；不能重画袁紫衣面孔衣物或题字，夜景保持手绘插画材质。

以本节及原著依据为当前要求，历史提示词与本节冲突时按本节执行；保留作者选定脸、原画质感与对应剧情阶段。

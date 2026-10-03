---
asset_id: cg_ch09_snow_valley
name: 雪谷相守
book: ch09_liancheng
characters:
- npc_diyun
- npc_shuisheng
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch09/por_npc_diyun__ch09_youth_disguise_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch09/por_npc_diyun__ch09_youth_scene_snowvalley_feathers.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_scene_yuyi.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
output: assets/default/scene/ch09/cg_ch09_snow_valley.png
manifest: assets/default/scene/ch09/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: 作者 10-02 晚：复合基线风格精修
references:
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch09/por_npc_diyun__ch09_youth_disguise_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch09/por_npc_diyun__ch09_youth_scene_snowvalley_feathers.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_scene_yuyi.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
  use: 项目画风基线
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
  use: 项目画风基线
generation_job: cg_ch09_snow_valley.retry3.r3
generation_attempts: 3
title_text: 雪谷相守
title_method: generated
identity_revision: 使用本轮新复合base及对应新阶段立绘
title_verified: 逐字放大核验：雪 / 谷 / 相 / 守；原生正确
story_review: resolved
story_review_note: 已解决：水笙以淡黄丝线缀鹰羽衣；狄云在旁守候，不递衣、不接受赠衣。场景并置属原创扩展。
---

## Gemini 提示词

```text
生成一张3:2横幅写实手绘古风剧情插画，1536×1024。所有人物明确为成年；单幅完整场景，不拼贴不分镜。
第1张参考：狄云本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
第2张参考：狄云·雪谷羽衣阶段图，锁定新身份与年龄，衣物道具以【场面】为准，不复制姿势背景。
第3张参考：水笙·雪谷缀羽本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
最后两张为项目画风基线，只借笔触、设色、自然材质，不借人物身份。各人脸与发式严格隔离，不串脸。未上传的人物只按下述文字塑造，不复制演员面孔。
【场面】雪谷山洞口的寒夜求生中景。成年水笙穿淡黄右衽旧缎衫、灰白长裙，去掉红绸花，站在洞口内侧石台旁，左臂托住未全部缀好的黑褐鹰羽与白色雁翎缀成的御寒羽衣，右手轻持细小金钗靠近羽衣边缘，表示正以衣衫抽出的淡黄丝线穿缀；不需要细画穿针步骤。衣料始终完整不裸露。羽衣由水笙制作，捧在手里、尚未给人穿上。成年狄云位于洞外数步远的小火塘旁，穿完整灰褐旧僧衣和深色长裤，光头，正在警戒山谷；他左手扶木杖，整个右前臂自然垂在身侧，右掌完全藏入宽大完整袖中，绝不露出右指、拳头或残端。狄云此刻不得穿参考图中的鸟羽衣，不缝羽衣、不递衣给水笙，也不画成接受赠衣。二人各占一侧、保持清楚距离，火光微弱，雪山和洞壁保留，表达患难中的生存互助而非相拥爱情。身份以本轮新狄云雪谷阶段和新水笙yuyi阶段为准；服饰动作以本段优先。
【剧情边界】《连城诀》第八章羽衣：水笙缀羽衣，黑色鹰羽与白色雁翎相间；狄云根据羽衣细孔和丝线推测她以金钗穿孔并从淡黄衫抽线；狄云并未接受她的赠衣。2026-10-03检索核验 https://www.99csw.com/book/2174/63767.htm 及 https://read.99csw.com/book/2174/63767.html 。画面把制衣与洞外守火并置，为（原创扩展构图），不宣称这是原著逐字同一时刻，不替代狄云拒衣情节；三联/广州修订版紙本逐字校勘（待考）。题字仍为雪谷相守，狄云右手五指缺失且非血腥呈现，stage引用只锁身份、不沿用已穿羽衣装束。 原文中抽线和金钗穿孔是狄云观察后的推测；本图将该推测视觉化，属于原创扩展演出。；题名、画面取景、站位、时刻、服饰配色、成年化均属（原创扩展）；指定版本细节待纸本逐字终校（待考）。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；依照本场天色和灯火布光，明暗自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【构图】画面有近中远层次，视线与肢体动作清晰，人物互相留出空间，头与手可读。保留完整环境背景。不要堆成合影。右上方天空或墙面留出题字空白，文字不挡脸。
【古风题字】右上角一列竖排毛笔楷书，自上至下准确写「雪」「谷」「相」「守」，合成「雪谷相守」。每字约画宽4%，全列不超过画高40%。墨黑自然笔锋；每字仅一次，不多字不漏字；下方一枚小朱红无字方印。
【时代】清代传统服装；男角剃额留辫，僧侣剃光无辫，圆性素僧帽遮剃发、不戴紫帽珠帘；胡斐按作者例外束发不剃额不结辫，狄云按对应阶段；右衽；禁止现代物件。
排除：除题名外不出现可读文字、字幕、堂匾、签名或水印；不要幼态、儿童比例、色情、裸露、血腥特写、肢体错乱、多指、穿模、照片、演员肖像、塑料CG、厚涂油画、漫画、法阵发光。
```

## 本轮精修记录

- 参考分工见实际提示词；配色、姿势、取景及成年化均为（原创扩展）。
- 本轮结果已逐图目检并入库为 candidate；实际作业与参考哈希见 manifest。

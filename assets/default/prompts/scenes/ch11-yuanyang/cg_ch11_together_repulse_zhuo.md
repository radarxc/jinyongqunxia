---
asset_id: cg_ch11_together_repulse_zhuo
name: 双刀同心
book: ch11_yuanyang
characters:
- npc_yuanguannan
- npc_xiaozhonghui
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scholar_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
output: assets/default/scene/ch11/cg_ch11_together_repulse_zhuo.png
manifest: assets/default/scene/ch11/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: 作者 10-02 晚：复合基线风格精修
references:
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scholar_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
  use: 项目画风基线
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
  use: 项目画风基线
generation_job: cg_ch11_together_repulse_zhuo.retry3.r2
generation_attempts: 2
title_text: 双刀同心
title_method: generated
identity_revision: 使用本轮新复合base及对应新阶段立绘
title_verified: 逐字放大核验：双 / 刀 / 同 / 心；原生正确
---

## Gemini 提示词

```text
【AR-82 当前原著约束，覆盖后文冲突旧描述】只把画面中央萧中慧原灰白上衣与两袖改成蓝衫：上衣主体和左右袖为与当前深蓝披片协调的柔和中蓝布色，保留月白领缘和腰带、褐裙、灰裤、原短刀刀势。她的素簪已正确，完全保留。她的脸、头发、手与身体姿势，袁冠南、卓天雄、两个背景人物全部逐像素不变；题字双刀同心和红印逐像素不变。
【AR-82 原文摘句】《鸳鸯刀》“一位蓝衫姑娘”；“从头上拔下一枚金钗”；“细金链上的翡翠狮子”（第三、六、八节）

生成一张3:2横幅写实手绘古风剧情插画，1536×1024。所有人物明确为成年；单幅完整场景，不拼贴不分镜。
第1张参考：袁冠南本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
第2张参考：袁冠南·紫竹初合刀阶段图，锁定新身份与年龄，衣物道具以【场面】为准，不复制姿势背景。
第3张参考：萧中慧本轮后期阶段图，锁定本人成人脸、灰白袄靛披巾褐裙和朴素木簪；不复制姿势背景。
最后两张为项目画风基线，只借笔触、设色、自然材质，不借人物身份。各人脸与发式严格隔离，不串脸。未上传的人物只按下述文字塑造，不复制演员面孔。
【场面】紫竹庵院中，袁冠南一柄长鸳刀、萧中慧一柄短鸯刀交错回护，二人面容从本轮阶段图取；卓天雄收钢鞭后退，远廊林任一左一右注视。画互护默契、不画砍伤或能量光。 萧中慧本期穿灰白短袄、深靛披巾、褐膝裙灰长裤，深褐木簪；不是基础图的蓝衣双刀装。此衣色、外披和换装安排为原创扩展。
【剧情边界】story11事件37–40，急学十二招后逼退卓；精确人物站位（原创扩展构图），不宣称网页分段为指定版回目。；题名、画面取景、站位、时刻、服饰配色、成年化均属（原创扩展）；指定版本细节待纸本逐字终校（待考）。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；依照本场天色和灯火布光，明暗自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【构图】画面有近中远层次，视线与肢体动作清晰，人物互相留出空间，头与手可读。保留完整环境背景。不要堆成合影。右上方天空或墙面留出题字空白，文字不挡脸。
【古风题字】右上角一列竖排毛笔楷书，自上至下准确写「双」「刀」「同」「心」，合成「双刀同心」。每字约画宽4%，全列不超过画高40%。墨黑自然笔锋；每字仅一次，不多字不漏字；下方一枚小朱红无字方印。
【时代】清代传统服装；男角剃额留辫，僧侣剃光无辫，圆性素僧帽遮剃发、不戴紫帽珠帘；胡斐按作者例外束发不剃额不结辫，狄云按对应阶段；右衽；禁止现代物件。
排除：除题名外不出现可读文字、字幕、堂匾、签名或水印；不要幼态、儿童比例、色情、裸露、血腥特写、肢体错乱、多指、穿模、照片、演员肖像、塑料CG、厚涂油画、漫画、法阵发光。

【头饰时期修正】萧中慧必须继承上传的本轮后期阶段图：头顶只有一根无装饰深褐木簪穿过发髻，木色哑光；没有金簪、金钗、珍珠、珠坠、玉珠、发链或任何亮色饰品。她的原金花簪已赠出，本期不能重新佩戴。保留灰白袄、靛披巾、褐裙、成年新脸，以及原场面情节站位和指定题名；仅纠正头饰，不复刻基础图金簪。
```

## 本轮精修记录

- 参考分工见实际提示词；配色、姿势、取景及成年化均为（原创扩展）。
- 本轮结果已逐图目检并入库为 candidate；实际作业与参考哈希见 manifest。


## 原著依据

- AR-82 同步依据：《鸳鸯刀》“一位蓝衫姑娘”；“从头上拔下一枚金钗”；“细金链上的翡翠狮子”（第三、六、八节）；执行：只把画面中央萧中慧原灰白上衣与两袖改成蓝衫：上衣主体和左右袖为与当前深蓝披片协调的柔和中蓝布色，保留月白领缘和腰带、褐裙、灰裤、原短刀刀势。她的素簪已正确，完全保留。她的脸、头发、手与身体姿势，袁冠南、卓天雄、两个背景人物全部逐像素不变；题字双刀同心和红印逐像素不变。


## AR-82 当前返修约束

只把画面中央萧中慧原灰白上衣与两袖改成蓝衫：上衣主体和左右袖为与当前深蓝披片协调的柔和中蓝布色，保留月白领缘和腰带、褐裙、灰裤、原短刀刀势。她的素簪已正确，完全保留。她的脸、头发、手与身体姿势，袁冠南、卓天雄、两个背景人物全部逐像素不变；题字双刀同心和红印逐像素不变。

以本节及原著依据为当前要求，历史提示词与本节冲突时按本节执行；保留作者选定脸、原画质感与对应剧情阶段。

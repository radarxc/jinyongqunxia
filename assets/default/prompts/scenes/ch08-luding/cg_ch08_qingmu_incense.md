---
asset_id: cg_ch08_qingmu_incense
name: 青木盟心
book: ch08_luding
characters:
- npc_weixiaobao
- npc_chenjinnan
- npc_xutianchuan
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_scene_qingmu_incense.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_chenjinnan__ch08_prime_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
output: assets/default/scene/ch08/cg_ch08_qingmu_incense.png
manifest: assets/default/scene/ch08/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: 作者 10-02 晚：复合基线风格精修
title_text: 青木盟心
identity_revision: 使用本轮新复合base及对应新阶段立绘
generation_job: cg_ch08_qingmu_incense.retry3.r1
generation_attempts: 1
title_method: generated
title_verified: 逐字放大核验：青 / 木 / 盟 / 心；原生正确
references:
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_scene_qingmu_incense.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-b/assets/default/character/male/ch08/por_npc_chenjinnan__ch08_prime_base.png
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
  use: 项目画风基线
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
  use: 项目画风基线
---

## Gemini 提示词

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《鹿鼎记》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第1张参考：韦小宝本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
第2张参考：韦小宝·宫廷与青木堂双重身份阶段图，锁定新身份与年龄，衣物道具以【场面】为准，不复制姿势背景。
第3张参考：陈近南本人基础图，只锁定该人的面容与成人体态；未另述衣装时沿用本人base，明确场面要求优先。
最后两张是项目男性画风基线，只借手绘笔触、设色、材质和自然骨相，不把基线人物画进本场景。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第八回，韦小宝拜陈近南并任青木堂香主；少年事件采用成年化追忆（原创扩展）。
地点与时刻：京城青木堂密室；深夜、香火。
画面瞬间：陈近南在香案前跪下，双手捧三枝香郑重立誓；韦小宝在右侧凝神看着师父，收起市井嬉笑；徐天川与四名成年会众肃立后景。
构图与站位：斜侧中全景；陈近南居画面左中、韦小宝居右中，香案在左侧，两人脸均清楚可见；香烟纤细不遮脸。右上方墙面留出竖题字空白，不挡人物。
情绪基调：庄重、矛盾身份、托付。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传韦小宝、por_npc_chenjinnan__ch08_prime_base；徐天川为精干老会众、青布劲装。
未上传身份参考的人物文字要点：
徐天川：老年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
人物辨识点：韦小宝约二十岁成年外观、机警眼神、宝蓝袍与暗红坎肩，腰间一柄入鞘短匕；陈近南中年、端方沉稳、青灰长袍深色外褂；清初男角剃额留辫，衣襟右衽。只画插画人物，不复刻演员肖像。
制作边界：陈近南捧香立誓有文本依据；会众数量、镜头、时刻与成年化为（原创扩展构图），站位（待考）；不生成灵位、堂号或匾额文字。

画风：写实手绘古风，兼有经典武侠游戏插画的线条与造型感，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，暗室烛光与窗外淡月光，可信空间纵深。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光；衣褶和墙面保留纸本笔触。保留完整室内背景，不抠图。

古风题字：右上角留白处一列竖排毛笔楷书，从上到下严格写「青」「木」「盟」「心」，合为「青木盟心」四字，每字约画宽的 4%，全列不超过画高 40%；墨黑、端正、笔锋自然，四字必须正确且各出现一次。下方一枚小朱红无字方印。除这四字外不出现任何可读文字。

排除项：除「青木盟心」外不要其他文字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

## 考据与生产记录

- 情节交叉核对：[修订版第八回](https://www.zhwuxia.com/read/ludingjixiudingban/3431)、[第八回另一转录](https://ludingji.5000yan.com/42256.html)，访问 2026-10-02。两者均有陈近南捧三枝香立誓；网页底本与三联 / 广州纸本逐字一致性仍（待考）。
- 既有名录的“递香”没有作为本次画面动作；本任务禁止改名录旧行，差异记入报告 §6。
- 已解决：第 2 次运行只补目录的旧身份候选已按本轮新韦小宝 base 与青木堂阶段重出；陈近南继续使用已有 S 级身份。上一轮候选随原 manifest 归档。
- 第 2 次运行记录：2026-10-02 23:10:50 首次生成，126 秒、无题字重出。本次沙箱外 runner 于 23:39:56 按新身份重出，178 秒；题字「青木盟心」再次逐字正确，未字体叠加。实际参考顺序与 SHA256 见对应 manifest。
## 本轮精修记录

- 参考分工见实际提示词；配色、姿势、取景及成年化均为（原创扩展）。
- 本轮结果已逐图目检并入库为 candidate；实际作业与参考哈希见 manifest。

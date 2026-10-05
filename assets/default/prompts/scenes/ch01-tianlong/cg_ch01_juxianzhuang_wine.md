---
asset_id: cg_ch01_juxianzhuang_wine
name: "聚贤庄英雄宴"
book: ch01_tianlong
characters:
- npc_xiaofeng
- npc_azhu
- npc_xuemuhua
- npc_youji
- npc_youju
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.repair1.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaofeng__ch01_prime_gaibang_base.r4.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch01/cg_ch01_juxianzhuang_wine.png
manifest: assets/default/scene/ch01/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.repair1.png", "use": "本轮萧峰聚贤庄阶段原图；锁定新脸与该场服饰", "sha256": "7b948a779b64976021e76ce8568ae09e8397b8aef04100c84f356e2f4417aba2"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaofeng__ch01_prime_gaibang_base.r4.png", "use": "本轮萧峰复合基础原图；辅助稳定同一身份，不复制竹棒", "sha256": "455257ac00444c82128b147252ec2304022f25374dc38f76af86aba91d7e0b3d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png", "use": "阿朱既有 S 级立绘；只保持阿朱身份，与萧峰身份隔离", "sha256": "d80304aabc32f6b945696496a5d70d02076549c38fd6460e022e3f919d07e39d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目男基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目男基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch01_juxianzhuang_wine.repair1
---

## Gemini 提示词

> 作者 2026-10-02 晚复合精修；生成任务 `cg_ch01_juxianzhuang_wine.repair1`。上传顺序与 frontmatter 一致，末两张为男基线；萧峰身份只由本轮新阶段与新基础立绘锁定；阿朱使用既有 S 级立绘，人物身份分别保持。本图为 candidate，旧提示词仅作历史留存。

```text
生成一张1536×1024、3:2横幅写实手绘古风剧情插画，《天龙八部》聚贤庄绝交酒场面，保留完整场景，所有人物必须清楚是成年人。
【实际上传顺序】第1张是本轮萧峰聚贤庄阶段立绘，只锁定他的方阔面容、发际、短络腮须、魁伟身形和灰衣阶段造型；第2张是本轮萧峰复合基线基础图，辅助核准同一张脸，不继承竹棒与基础站姿；第3张是S级人物阿朱既有立绘，只锁定她本人面容与成年年龄；最后两张为男性项目画风基线，仅取手绘质感，不取人物身份。每张参考只管自己的角色，不互换脸；所有人物重新绘制，不复制照片或演员，不复刻参考的姿态、背景和光线。
【原著边界】萧峰为救阿朱赴聚贤庄，举碗与旧友饮绝交酒，随后与群雄决裂。这里只画开战之前，没有死亡或血腥。把举酒与护人放在同一画面，是原创扩展构图，不当作原著逐字动作记录；具体站位、天候及修订版字句待考。
【场景】北宋中原庄院，厅前庭院，灰砖、木柱、半开的深色门扇，右侧酒桌上有陶酒坛与两只空碗；秋日薄云午后，微风掠过衣摆，低饱和褐灰、墨青、少量阿朱淡绛色。
【画心】萧峰站在中央略偏左，宽肩厚背、三十岁左右、方脸阔口、短硬络腮须、风霜肤色、目光豪烈而沉痛；深褐简素裹巾、素灰右衽长袍、深灰短外衣、布腰带与布鞋。右手把一只粗陶酒碗举到胸口稍上方，手掌真实托住碗底；左前臂向后微伸护住阿朱，手不要与她的身体混在一起。双脚扎实落地，不持竹棒、不持刀剑。
【阿朱】成年年轻女子，鹅蛋脸、灵动眼睛、秀丽而自然；虚弱但清醒，穿完整不透明的淡绛长衫，坐在萧峰右后方的木椅上，目光看向他。此刻不画灿笑、恋爱拥吻、幼态或血伤，病弱用姿态与神色传达。
【其余人物只按文字】后方左侧薛慕华为沉稳医者，长衫、束发，审视二人；右侧游骥、游驹为壮年庄主，两张各异自然面容、深色劲装，隔出距离对峙；更远处群雄只作低细节成年人剪影，兵刃收低且未触及任何人。不要给配角复制萧峰的脸，不要求可识别其他未命名人物。
【构图】横向中全景，萧峰、酒碗和阿朱构成视觉核心；近景少量背影包围出一道缺口，庄门和群雄退在后景，人物肢体与酒器分开、空间可信。右上角保留干净浅灰雾色和淡墙面的题字区，不遮人脸、酒碗或兵器。背景有纵深，不是竖幅人物拼贴。
【题字必须逐字正确】右上角单列竖排四个简体汉字，从上至下严格是「聚」「贤」「绝」「交」，合起来仅「聚贤绝交」。苍劲端正的毛笔楷书，墨黑，每字约画幅高度的7%，整列高约32%，距右边缘约6%、距上边缘约8%。不增字、不重复、不写拼音、不附落款；本张不加朱印，避免伪字。
【画风】复合基线风格：经典武侠游戏插画的古典气质与理想化人物造型，写实手绘的面部、手掌、布料与建筑；自然明暗、低饱和设色、细腻可见笔触，浅暖灰纸感与淡水墨仅在背景。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。不做厚油画、动漫、照片或影视剧照修图。
排除项：除「聚贤绝交」四字之外不要任何其他文字、字幕、题款、印章、水印、Logo、分镜、边框；不要现代物件、发光武功、龙影、尸体、断肢、血腥、儿童、娃娃脸、性化裸露；不要多肢、多指、手物粘连、悬空酒碗、身份串脸、镜像左衽。所有汉式交领右衽，穿着者左襟压右襟。不要把阿朱画成站立的健康少女，不把萧峰画成瘦弱偶像脸。
```

## 本次入库核验（2026-10-02）

- 原生输出 1536×1024；主角新基础 / 新阶段与阿朱既有 S 级图按 frontmatter 实际顺序上传，未上传 A / B 级人物图。
- 右上角竖排「聚贤绝交」经 2 倍放大逐字核对，四字正确、无多字；原生题字，未字体叠加，无朱印，视觉重出 0 次。
- 主代理与独立复核均通过候选自检；萧峰衣摆毛边较重，保留为 candidate，尚未取得作者审美终审。
- 情节交叉核对：[《天龙八部》第十九章在线文本](https://www.kanunu8.com/wuxia/201102/1626/37125.html)（访问 2026-10-02）；网站版本未独立确认，三联 / 广州修订版逐字核对仍（待考）。只据其交叉核对赴庄救阿朱与绝交酒大情节，未引用原文。

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《天龙八部》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是萧峰（npc_xiaofeng）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是阿朱（npc_azhu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第十九回，聚贤庄英雄宴。
地点与时刻：聚贤庄庭院；秋日午后、风起。
画面瞬间：萧峰把最后一碗酒举向群雄，另一臂护住受伤的阿朱，满院兵刃将动未动。
构图与站位：广角中全景；萧峰与阿朱居中，酒碗在黄金分割点，群雄围成破口圆阵。
情绪基调：豪烈、诀别、护持。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传萧峰、阿朱；薛慕华与游氏兄弟只写医者长衫、庄主劲装。
未上传身份参考的人物文字要点：
薛慕华：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
游骥：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
游驹：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：动作与伤亡（待考）；不画血腥特写。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

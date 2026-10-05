---
asset_id: por_npc_weixiaobao__ch08_youth_bishou_base
subject_id: npc_weixiaobao
name: 韦小宝
book: ch08_luding
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
manifest: assets/default/character/male/ch08/manifest.yaml
references:
- path: generated_images/exec-d31eea37-32ef-4105-b0e2-15ee92877f5d.png
  use: 已实际查看的本人候选1，面容少年化及道具可用但仍侧倾，保留整体仅纠正头部竖直和水平双眼；尚未通过，不计完成。
- path: .agents/coord/imagegen-reference/identity-20261001/luding/weixiaobao_1998_chenxiaochun.jpg
  use: 第一参考，1998 TVB陈小春版韦小宝的本人面部身份输入；已实际view_image查看并核对本地source.json及SHA。优先保留浓黑眉、较窄眼裂与眼间距、平直略扬的外眼角、直鼻梁与较圆宽鼻头、上薄下稍厚的唇形、短圆下巴及略外展耳廓的辨识关系。将这些关系自然回溯为13–17岁少年：较短的未成年面部比例、饱满少年面颊、小而灵活的骨架、无胡须，不照搬成年演员的成熟骨架和纹理。只取本人五官，不复制这张照片的大帽、华贵花纹衣、蓝亮领、胸像裁切或粉紫摄影背景；不据剧照改本书阶段。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考，项目男性基线，已实际view_image查看并核对可读性与SHA；仅取低饱和设色、柔和明暗和细腻连贯的写实手绘质感。当前manifest状态candidate，未批准，不改变审批。绝不借令狐冲的脸型、眉眼鼻唇、成年身材、胡茬、长发发髻、网巾、明代衣装、长剑、站姿或歪头角度；本人面部一律来自第一参考。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考，用户水墨风背景图，已实际view_image查看并核对SHA；只取背景淡墨层次、远景若有若无的山水韵味、暖浅灰纸底与留白。完全忽略其中女性脸孔、头颈倾角、身形、肤质、白青裙装、飘带和发饰；背景墨痕不得侵入韦小宝的人体或衣服。
status: ready
realism_revision: user_identity_pose_20261001
---

# 韦小宝 · 人物写实修正

## 人物与阶段

- subject_id：npc_weixiaobao
- book：ch08_luding
- gender：male
- age_variant：youth

## 本轮人物写实规范

候选1/2仍有头颈侧倾，不计完成；3/4修正为真正端正正面，保留少年小桂子身份及本人独立五官。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_weixiaobao__ch08_youth_bishou_base/prompt-cdfc746c79ab2d2a2568dcdf8a6d0eedad622abfd0b5f2e4b1b973d54dcbbad9.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
EDIT THE FIRST INPUT ILLUSTRATION. Keep this specific Wei Xiaobao identity and adolescent age, the plain cap, queue, clothing, one die, sheathed short dagger and full-body composition. REQUIRED correction: make the head and neck truly upright and directly frontal. The line joining the two pupils must be exactly horizontal and parallel to the top edge of the canvas. The middle of the forehead, nasal bridge, philtrum, chin midpoint and throat must form a vertical centerline. The head must not lean toward a shoulder. No roll, no Dutch angle, no cheek-forward diagonal pose, no sideways neck bend. Do not rotate the canvas or rest of the body. Redraw only the face/head/neck alignment naturally, preserving the real recognizable face from the second reference, age-adapted to a boy. Keep relaxed horizontal shoulders and upright body axis. Use eyes and a slight smile for character, NEVER a head tilt.

Create a refined REALISTIC full-body Chinese wuxia character illustration. Character: Wei Xiaobao, palace identity “Little Guizi”, a boy aged visually 13–17, after he has obtained BOTH the short dagger and the protective inner garment, well before his later ducal title. Reference image 1 is the actual returned candidate with usable face but unpassed head alignment, to be corrected. Use reference image 2 as the ONLY underlying facial-identity source: the recognizable Wei Xiaobao portrayed by Jordan Chan in the 1998 TVB adaptation, naturally age-adapted to this adolescent stage. Images 3 and 4 are style/background references only; they must not contribute facial anatomy. This is an original hand-painted character illustration, not a photograph or copied film still.

身份与年龄：韦小宝（npc_weixiaobao），《鹿鼎记》ch08_luding，清初康熙时代。严格表现宫廷“小桂子”身份，擒鳌拜抄家得匕首后、护身宝衣也已入手的少年条件节点；尚未封鹿鼎公。本图不代表扬州初见、雅克萨或退隐阶段。外观13–17岁，确岁待考；asset的youth键不等于成年。较小、灵活的未成年骨架，少年颊部软组织饱满，约6–6.5头身，无胡须，不拉宽成年胸肩。

本人面部的可辨识锚点：以第二张陈小春版韦小宝照片为唯一脸部身份依据，保留眉眼间距与走向、较窄且清醒灵活的眼裂、略平直微扬的外眼角、浓黑而有轻微自然起伏的眉、直鼻梁与较圆宽的鼻头鼻翼、上唇较薄下唇稍厚的唇形、短圆下巴与略外展耳廓。保留这些有别于其他主角的关系，将成年人面中长度和下颌成熟感自然减弱为少年面貌，面颊柔和充实而不肥胖；不机械缩小成人头脸。不能借男性基线的狭长俊逸脸、胡茬或成人体格，更不能复制第三参考的女性脸。神情机敏、轻微狡黠但有真诚活气，像正要接话和想退路的小少年，不是高武剑客、威严官员或搞笑丑角。

清装与发式：清初汉地少年内侍便装，黛青色窄袖右侧掩襟袍，暗赭色短褂，朴素布腰带，黑布鞋。斜襟向穿着者本人右侧合拢；若露汉式交领则左襟压右襟，不镜像。前额剃发，后脑保留一条细辫；戴贴合少年头部的素小帽，帽缘不要遮死剃额与发际。细辫由后脑自然垂向背后，在肩后露出短小一段即可，不为了展示辫子转头。帽子不是剧照中宽大的官帽，不照搬任何华贵纹样或亮蓝高领。护身宝衣贴身穿在外袍里，只在规整领层露出一线柔韧内衣边，不把宝衣外置为铁甲。完整裁剪、完整下摆和袖口，布料整片连贯，衣物平整可穿、仅少量宽缓承重褶。

手、器物与动作：腰侧只有一柄短匕首，完整收在长度匹配的黑灰素短鞘内，小柄可见，短系带切实连到腰带；不出刃，不长成剑，不再另拿武器。右手在身前腰腹高度轻拈一枚正常小尺寸的无刻字骰子，手指与骰子接触清楚；左手空着自然垂于身侧，双手均完整可见且不被袖口吞没。双脚轻松一前一后、脚掌真实着地，重心稳定，身体朝观者正面，不作剑侠出招架势。

正面与头颈硬要求：平视水平镜头，面部和躯干主要正对观者。头顶到下巴的中心线竖直，头颈自然直立并与身体轴线一致，双眼保持水平，眉眼鼻唇正面清楚；左右肩自然舒展，不高耸单肩。用眼神和嘴角传达机变，不用歪头、回眸、侧脸或倾斜镜头制造神态。面部保留真实细微的不完全对称，但不扭斜头部；不要继承任何参考图的人物倾角和姿势。

画法与参考主次：人物美观写实，皮肤有适龄自然细腻质感，五官可信，躯干与肢体具有坚实完整体积，连续柔和光影，头发、手和鞋轮廓干净。第三张男性基线仅参考低饱和黛青、灰褐设色与克制细腻的手绘质感，不取其中人脸、衣服、剑或站姿。左上方柔和主光，少年面部与双手清楚，皮肤不磨成塑料，衣料不由水墨纸纹拼接。第四张只参考背景水墨韵味：不透明暖浅灰纸底，边角可有极淡、低对比的远山墨色与留白，不出现具体宫殿或故事人物；背景墨痕、纸纹和山影停留在人物轮廓之外。脚下只有少量接触阴影。

构图与交付画面：单人单视图，竖幅2:3，完整全身立绘。头顶、小帽、双足、双手、短匕鞘和衣带端点完整入画，四周留出自然净空，不靠裁头裁脚放大人物，也不为固定占高拉长少年身材。目标2048×3072、不透明PNG；接受工具真实原生尺寸，原始PNG保存，不插值、裁切或重编码。

事实边界：13–17岁是当前角色稿的美术年龄范围，确岁仍待考；宝衣与匕首取得的精确先后仍待纸本核对，本图只采用两物均已取得的条件阶段。衣色、便装选款、单枚骰子的持法为已有草稿的美术补足。本人五官取作者指定的1998陈小春版角色参考，覆盖旧稿“禁止演员脸”的旧约束；不得将照片衣装、成年年龄或拍摄场景说成小说本阶段事实。

完整排除项：不要把13–17岁少年画成二三十岁的演员本人、成年壮汉、宽胸健美身材、长腿模特、成熟情场姿态、胡须或胡茬；不要婴幼儿比例、Q版、动漫大眼、统一俊男模板、网红尖下巴、厚妆丰唇。不要混入令狐冲、萧峰、王语嫣或其他人物的五官；不要用“同一通用男脸换清装”代替陈小春版韦小宝的辨识关系。不要歪头、头倒向一侧肩膀、斜置脸部中线、侧脸、回眸、低头藏眼、仰头藏眼、耸单肩卖萌、倾斜镜头或Dutch angle。不要复制第二参考的成年年龄、宽大宫帽、华贵花袍、亮蓝领、半身构图或粉紫影棚背景；不要直接交付照片、剧照截图、3D模型、塑料磨皮。不要宋明长发发髻、束发网巾、满头长发遮前额、剃成完全无辫的光头；不要晚清大拉翅、近代帽服、僧装或披肩长发。不要蟒袍补服、鹿鼎公爵服、官爵顶戴、黄马褂、官印令牌、皇冠或帝王气派。不要长剑、第二柄匕首、拔出的刀刃、火铳、外露金属宝甲、盔甲、盾牌、法阵、龙形能量、发光道具。右手只能拿一枚正常小尺寸无刻字骰子，左手空着；不要第二枚骰子、数字文字、漂浮骰子、骰子变成珠宝法器、手物粘连或匕鞘悬空。不要水平镜像、错误衣襟、日式刀服、前结宽腰带、欧式奇幻装备或现代物品。人物本体不要飞白断裂、碎墨拼贴、纸纹透肤透衣、白斑、划痕、衣料变碎布、撕裂衣角、过密褶皱、毛边侵蚀或皮肤斑驳；水墨仅限背景。不要额外人物、多视图、分格、脸部特写框、多肢多指、缺手缺脚、裁断头足或器物端点。不要裸露、透衣、性感化、血腥、恶搞或丑化。不要可读文字、题款、签名、印章logo、装饰水印、强逆光、浓雾或复杂宫殿背景；保留工具自身溯源，不删除或伪造。

补充明确排除：不要 head tilt 或 Dutch angle；正面头颈竖直、双眼水平，不得借参考的头部侧倾或斜镜头。

完整排除项：不要把13–17岁少年画成二三十岁的演员本人、成年壮汉、宽胸健美身材、长腿模特、成熟情场姿态、胡须或胡茬；不要婴幼儿比例、Q版、动漫大眼、统一俊男模板、网红尖下巴、厚妆丰唇。不要混入令狐冲、萧峰、王语嫣或其他人物的五官；不要用“同一通用男脸换清装”代替陈小春版韦小宝的辨识关系。不要歪头、头倒向一侧肩膀、斜置脸部中线、侧脸、回眸、低头藏眼、仰头藏眼、耸单肩卖萌、倾斜镜头或Dutch angle。不要复制第一参考的成年年龄、宽大宫帽、华贵花袍、亮蓝领、半身构图或粉紫影棚背景；不要直接交付照片、剧照截图、3D模型、塑料磨皮。不要宋明长发发髻、束发网巾、满头长发遮前额、剃成完全无辫的光头；不要晚清大拉翅、近代帽服、僧装或披肩长发。不要蟒袍补服、鹿鼎公爵服、官爵顶戴、黄马褂、官印令牌、皇冠或帝王气派。不要长剑、第二柄匕首、拔出的刀刃、火铳、外露金属宝甲、盔甲、盾牌、法阵、龙形能量、发光道具。右手只能拿一枚正常小尺寸无刻字骰子，左手空着；不要第二枚骰子、数字文字、漂浮骰子、骰子变成珠宝法器、手物粘连或匕鞘悬空。不要水平镜像、错误衣襟、日式刀服、前结宽腰带、欧式奇幻装备或现代物品。人物本体不要飞白断裂、碎墨拼贴、纸纹透肤透衣、白斑、划痕、衣料变碎布、撕裂衣角、过密褶皱、毛边侵蚀或皮肤斑驳；水墨仅限背景。不要额外人物、多视图、分格、脸部特写框、多肢多指、缺手缺脚、裁断头足或器物端点。不要裸露、透衣、性感化、血腥、恶搞或丑化。不要可读文字、题款、签名、印章logo、装饰水印、强逆光、浓雾或复杂宫殿背景；保留工具自身溯源，不删除或伪造。 不要 head tilt 或 Dutch angle；正面头颈竖直、双眼水平，不得借参考的头部侧倾或斜镜头。
```

## 排除项

不要把13–17岁少年画成二三十岁的演员本人、成年壮汉、宽胸健美身材、长腿模特、成熟情场姿态、胡须或胡茬；不要婴幼儿比例、Q版、动漫大眼、统一俊男模板、网红尖下巴、厚妆丰唇。不要混入令狐冲、萧峰、王语嫣或其他人物的五官；不要用“同一通用男脸换清装”代替陈小春版韦小宝的辨识关系。不要歪头、头倒向一侧肩膀、斜置脸部中线、侧脸、回眸、低头藏眼、仰头藏眼、耸单肩卖萌、倾斜镜头或Dutch angle。不要复制第一参考的成年年龄、宽大宫帽、华贵花袍、亮蓝领、半身构图或粉紫影棚背景；不要直接交付照片、剧照截图、3D模型、塑料磨皮。不要宋明长发发髻、束发网巾、满头长发遮前额、剃成完全无辫的光头；不要晚清大拉翅、近代帽服、僧装或披肩长发。不要蟒袍补服、鹿鼎公爵服、官爵顶戴、黄马褂、官印令牌、皇冠或帝王气派。不要长剑、第二柄匕首、拔出的刀刃、火铳、外露金属宝甲、盔甲、盾牌、法阵、龙形能量、发光道具。右手只能拿一枚正常小尺寸无刻字骰子，左手空着；不要第二枚骰子、数字文字、漂浮骰子、骰子变成珠宝法器、手物粘连或匕鞘悬空。不要水平镜像、错误衣襟、日式刀服、前结宽腰带、欧式奇幻装备或现代物品。人物本体不要飞白断裂、碎墨拼贴、纸纹透肤透衣、白斑、划痕、衣料变碎布、撕裂衣角、过密褶皱、毛边侵蚀或皮肤斑驳；水墨仅限背景。不要额外人物、多视图、分格、脸部特写框、多肢多指、缺手缺脚、裁断头足或器物端点。不要裸露、透衣、性感化、血腥、恶搞或丑化。不要可读文字、题款、签名、印章logo、装饰水印、强逆光、浓雾或复杂宫殿背景；保留工具自身溯源，不删除或伪造。 不要 head tilt 或 Dutch angle；正面头颈竖直、双眼水平，不得借参考的头部侧倾或斜镜头。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_weixiaobao__ch08_youth_bishou_base.prepared.json`。

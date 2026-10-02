---
asset_id: por_npc_luchengfeng__ch02_prime_disabled_base
subject_id: npc_luchengfeng
name: 陆乘风
book: ch02_shediao
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch02/por_npc_luchengfeng__ch02_prime_disabled_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/luchengfeng_1983_guanhaishan_sina2019.jpg
  use: 第一且唯一面部身份：关海山饰1983 TVB黄日华、翁美玲版陆乘风；已核同图角色/演员及版次，并实际查看原图。只取本人可辨面容，不继承侧转微笑、发式、服装、室内背景或具体剧情。上半身参考不证明腿部状态；本项目双腿残疾、完整坐姿及木座足托优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾与留白。已实际查看；完全忽略王语嫣的脸、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨纸纹只在人物与必要座具之外，不侵蚀实体。
status: ready
realism_revision: user_identity_pose_20261001
---

# 陆乘风 · 人物写实修正

## 人物与阶段

- subject_id：npc_luchengfeng
- book：ch02_shediao
- gender：male
- age_variant：prime

## 本轮人物写实规范

关海山1983陆乘风本人脸第一、用户图仅背景第二；归云庄中年双腿残疾、木扶手座椅和低足托完整坐姿。单候选，原始PNG，candidate待审；当前仅design/facts，不生成注册。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_luchengfeng__ch02_prime_disabled_base/prompt-eb24fd091c6bf684c3f16ca2cbf4caeb97ac49fe07759aaf97d7c7bc7f5d9975.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE AND DISABILITY ARE PRIMARY REQUIREMENTS: ONE FRONT-FACING full-body SEATED figure. 陆乘风 has disability in BOTH legs and remains seated in a plain wooden armchair, with BOTH legs and BOTH shoes supported by a low footrest. Do not turn this into a standing figure. Head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt and NO Dutch angle. Natural facial asymmetry must not tilt the head. These rules override the reference pose.

Create a REALISTIC Chinese wuxia full-body SEATED illustration of 陆乘风. Image 1 is the ONLY facial identity source: 关海山 as 陆乘风 in the 1983 TVB 射雕英雄传 starring 黄日华 and 翁美玲. Image 2 supplies ONLY background and ZERO face or anatomy. Preserve the project disability and supported seated pose.

身份与阶段：陆乘风（npc_luchengfeng），《射雕英雄传》ch02_shediao，南宋与金、蒙古并行的本书主体阶段。归云庄主、黄药师旧弟子；归云庄重提师门旧案与和解之前，双腿残疾仍在世。取本书中年庄主，不采用《神雕》传闻替身或康复后行走状态。中年、约四十至五十岁观感，确岁与生卒待考；这是现稿的视觉选段，不把演员拍摄年龄当成角色确岁。文士气质、肩背端直，双腿自然消瘦但结构完整，师门失意与庄主威望并存。

本人面容辨识：以关海山饰1983《射雕英雄传》陆乘风的单人剧照为唯一本人面容：宽额、较长面形，颧颊有体积，眉毛较平直，眉眼区紧凑、眼形细长，眼下与法令区域有自然年龄纹路；鼻梁较挺，鼻尖与鼻翼厚度可辨。口周灰黑髭须，下巴有纵长黑灰须，长须遮住的下颌不臆造精确轮廓；保留这个人的眉眼鼻唇关系。面部成熟、温和克制而有心事，不固定复制参考的微笑和侧转，不套萧峰或陆冠英的脸；不把剧照年长感夸张成衰老百岁像。

服饰发式：青灰宋式交领右衽文士长袍、浅灰内领、窄布带与两只黑布鞋；穿着者左襟压右襟，领胸完整遮蔽。衣摆顺着坐姿双腿自然垂下，双鞋与双腿支撑关系仍清楚，不用厚重衣堆藏掉腿部。黑灰头发收束戴低软巾，采用正式角色稿的发式艺术方案，不复制参考高束发饰、黑色外衣或浅青胸片。黑灰长须整洁、不过度飘飞。完整连续衣边和少量宽缓受力褶皱，无破洞、碎墨、风化污损；不披僧衣、不穿官爵礼服。

坐姿与必要器物：正面平视完整坐姿，臀部实坐于一张朴素木质扶手座椅，靠背、扶手、座板与椅腿结构连贯；木色哑光、榫接清楚。背脊自然自立、头颈端正，温和清醒地朝前，表情克制而不痛苦扭曲。两条腿完整存在、自然屈膝且彼此可区分；双鞋轻放在同一低木足托上并得到稳定支撑，不让双腿站立承重或悬空。左手自然扶左扶手，右手轻置右膝，双手空着、没有兵器。必要木座与足托属于本幅表现残疾的原创辅助方案，不声称原著明言轮椅；不加现代轮轴、脚踏机械或金属支架。

人物画法：美观、精细、完整的写实国风人物插画；可信中年骨相、自然肤质与柔和左上漫射光，低饱和设色配自然肤色。皮肤、头发、须发、手足、衣料与座具均有连贯实体体积和干净清楚轮廓。服装剪裁连续、缝线明确，褶皱顺着坐姿受力；不以碎片、飞白、墨斑或过密褶皱表现真实。不做摄影、电视剧截图、拼贴或三维塑料。

参考边界：第一且唯一面部身份：关海山饰1983 TVB黄日华、翁美玲版陆乘风；已核同图角色/演员及版次，并实际查看原图。只取本人可辨面容，不继承侧转微笑、发式、服装、室内背景或具体剧情。上半身参考不证明腿部状态；本项目双腿残疾、完整坐姿及木座足托优先。 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾与留白。已实际查看；完全忽略王语嫣的脸、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨纸纹只在人物与必要座具之外，不侵蚀实体。

背景与交付：仅采用第二图的极淡水墨远山与留白；木扶手座椅和低足托是支撑本人的必要物件，应完整画出，除此之外不增添家具、房屋、屏风、庭院或归云庄室内场景。椅脚与足托下仅少量自然接触阴影。单人单视图、水平平视、原生竖幅2:3，完整坐姿全身；头顶、发巾、须尾、双手、双腿、双鞋、完整衣摆、扶手、椅腿与足托全部入画，四周自然留净空。不使用固定人物占高或头身数字，不把坐姿拉长为站姿比例。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并准确登记；保存原始PNG字节，禁止插值、裁切或重编码。先生成1张候选，基本清晰、主要正面、人物可辨且残疾坐姿无重大错误即保存；仅严重身份错误、重大结构错误或不可读才追加。细指、轻微衣装或微角偏差如实记录，不反复重做；全部仍candidate待用户审核，不自动approved。

事实边界：小说确岁、具体外貌、长须长度、青衣原文、伤残细节及座具描写未逐字核对，不编造小说引文、回目或页码。双腿残疾与坐姿是当前正式role明示要求，不由头肩剧照推断；木扶手座椅、足托、低软巾、衣色及手势为项目艺术选择，不冒称原著明言轮椅或精确历史复原。参考只核面部身份，原始剧照集数及情节窗口尚未核定。 用户本人影视面容授权覆盖旧禁演员脸规则；完整写实人物、背景水墨与单候选覆盖旧纸底禁山水、精确比例和两候选默认。伤残坐姿优先于通用站立模板。

完整排除项：不要站立、健步、康复行走、单腿支撑站姿、盘腿悬浮或双腿悬空；不要现代轮椅、车轮、金属折叠椅、机械支架、截肢、断腿血口、把双腿完全藏住、无依据畸形或痛苦扭曲表情。不要把归云庄支系当桃花岛岛主，不要神雕传闻替身。不要 head tilt、Dutch angle、明显歪头、斜镜头、侧脸回眸、低头藏眼、仰头或夸张抬下巴。不要共用基线脸、陆冠英青年脸、统一硬汉模板、动漫大眼、浓妆、磨皮塑料、照片截图构图。不要多个人、多视图、拼图、裁断头足、缺肢多肢、严重手物融合、失重座具或断裂支撑。不要破布、飞白缺块、纸纹透肤透衣、墨迹侵蚀人物与座具、碎片化衣料或无依据污损风化。不要现代服饰、拉链、腕表、手机、运动鞋、日式服制、欧式奇幻装备；不要明代网巾、官服补子、清式剃发长辫、马蹄袖、旗装或民国服装，不要错误衣襟或水平镜像。不要刀剑、盲杖、僧人拂尘等额外器物。不要血腥、透明衣物、裸露、恶搞丑化、发光武功、龙蛇能量、法阵或粒子。不要复制参考室内柜架；除必要木座足托外不要具体剧情陈设、清晰建筑家具。不要可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印；保留工具自带溯源标识与元数据。

FINAL POSE CHECK: 陆乘风 remains SEATED and mainly FRONT-FACING, BOTH legs and BOTH shoes supported by the low footrest; NOT standing. Head and neck UPRIGHT, centreline VERTICAL, eyes HORIZONTALLY LEVEL, camera level. Preserve his disability. Include the complete wooden armchair and footrest; do not copy the reference pose or interior.
```

## 排除项

不要站立、健步、康复行走、单腿支撑站姿、盘腿悬浮或双腿悬空；不要现代轮椅、车轮、金属折叠椅、机械支架、截肢、断腿血口、把双腿完全藏住、无依据畸形或痛苦扭曲表情。不要把归云庄支系当桃花岛岛主，不要神雕传闻替身。不要 head tilt、Dutch angle、明显歪头、斜镜头、侧脸回眸、低头藏眼、仰头或夸张抬下巴。不要共用基线脸、陆冠英青年脸、统一硬汉模板、动漫大眼、浓妆、磨皮塑料、照片截图构图。不要多个人、多视图、拼图、裁断头足、缺肢多肢、严重手物融合、失重座具或断裂支撑。不要破布、飞白缺块、纸纹透肤透衣、墨迹侵蚀人物与座具、碎片化衣料或无依据污损风化。不要现代服饰、拉链、腕表、手机、运动鞋、日式服制、欧式奇幻装备；不要明代网巾、官服补子、清式剃发长辫、马蹄袖、旗装或民国服装，不要错误衣襟或水平镜像。不要刀剑、盲杖、僧人拂尘等额外器物。不要血腥、透明衣物、裸露、恶搞丑化、发光武功、龙蛇能量、法阵或粒子。不要复制参考室内柜架；除必要木座足托外不要具体剧情陈设、清晰建筑家具。不要可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印；保留工具自带溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_luchengfeng__ch02_prime_disabled_base.prepared.json`。

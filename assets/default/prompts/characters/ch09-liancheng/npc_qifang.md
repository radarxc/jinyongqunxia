---
asset_id: por_npc_qifang__ch09_youth_mother_base
subject_id: npc_qifang
name: 戚芳
book: ch09_liancheng
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch09/por_npc_qifang__ch09_youth_mother_base.png
manifest: assets/default/character/female/ch09/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/liancheng/qifang_2004_hemeitian_baike_b812_20261002.jpg
  use: 第一输入为2004年王新民版《连城诀》中何美钿饰戚芳的本人剧照，角色与演员版次及同图caption已核，参考独审仅通过身份用途，图片不是approved资产。只承接同一面部骨架、眉眼鼻唇关系及颊颌辨识；依本稿呈现夹墙救援前仍在世的青年成年母亲。不得照搬原图暗蓝光、惊惧张口、侧转仰视、发髻饰物、影视衣服、火盆或室内构图；本图头直正面、豆绿袄米裙与折叠童衣优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二输入是由原用户水墨图经内置image_gen派生的无人物辅助背景，实际查看无人物、面孔、衣装或器物。仅取暖浅灰不透明纸底、极浅低对比水墨远山薄雾和充分留白；墨迹与纸纹止于人物轮廓外。它不是原用户图片，也不是approved资产，不提供人物身份或造型。
status: ready
realism_revision: user_identity_pose_20261001
---

# 戚芳 · 人物写实修正

## 人物与阶段

- subject_id：npc_qifang
- book：ch09_liancheng
- gender：female
- age_variant：youth

## 本轮人物写实规范

2004何美钿饰戚芳本人脸第1，派生无人物水墨背景第2；夹墙救援前青年成年母亲，活体无伤、低髻木簪、豆绿袄米裙内穿长裤、双手持折叠童衣，不抱第二人。正面头直眼平，先1张原生2:3 candidate；待全文独审，不生成注册或自动批准。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_qifang__ch09_youth_mother_base/prompt-46946b9b30cab535851a29c48dc9bd6d1dedb628f587281be7fd4265728512bf.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia full-body illustration of 戚芳 / npc_qifang from Lian Cheng Jue. Image 1 is the verified 2004 television character Qifang portrayed by He Meitian: use this same facial identity only. Image 2 is a derived FIGURE-FREE pale ink-wash background and provides NO character identity. The current project stage is an adult married young mother, alive and uninjured before the wall-rescue crisis. Preserve the face while using the age, clothing, hairstyle, folded child garment and upright front-facing pose written below. Do not copy the still, blue scene lighting, torch, alarmed open mouth or camera angle. Both sources and all new outputs remain unapproved candidates.

身份与阶段：戚长发之女、已嫁入万家的年轻母亲；取夹墙救援前尚在世、护女心切的万府阶段。年龄与体貌：青年成年母亲；身形匀称、面容有操劳感但仍年轻，无临终伤口。已经嫁入万家的青年成年母亲、夹墙救援前尚活着；母亲身份不等于中年，更不是未婚少女或孕妇。体态匀称，有适度操劳感而仍年轻。 书界采用项目清初康熙约1705–1712的美术时代层；这是项目扩展定年，不用来反推原著确岁或生年。

本人面容与身份锚点：以第一图何美钿饰戚芳的同一张脸为唯一身份锚，保留自然圆润的颊部和柔和收束的下颌、额颧比例、细柔眉形及自然眉眼间距、清楚的杏形眼裂、鼻梁鼻尖与唇弓和下唇的相互关系。保持本人辨识而不另造统一美人脸，不放大眼睛或削尖下巴；蓝暗色偏和惊惧张口不作为肤色或五官定型。本阶段只以适度操劳感与温柔焦虑的眼神呈现已婚年轻母亲，双眼水平正视、头颈竖直，不把母亲画成中年贵妇或未成年少女。

服制与发式：低饱和豆绿右衽袄、暖米色长裙、内穿长裤，袖口朴素，窄腰带、平底布鞋，衣料比乡间初登场稍细而不华贵；乌发盘为收敛低髻，一根素木簪固定，不戴少女双髻或婚礼凤冠。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；僧衣和其他服制按各自结构，不镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，朴素不等于破损。

姿态与器物：正面站稳，肩部自然放松、头颈直立、眼平视前方；温柔焦虑通过眉间与眼神表现，不侧望或歪头。双手在腰腹前轻握一件折好的小童布衣，两手分置布衣两端，指节和布料厚度清楚，肘部自然贴近身体。布衣素净无字、面积适中，是折叠织物不是孩子或玩偶，不做孕肚轮廓。两脚稳立、平底鞋可见，无兵器、无第二个人物。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一输入为2004年王新民版《连城诀》中何美钿饰戚芳的本人剧照，角色与演员版次及同图caption已核，参考独审仅通过身份用途，图片不是approved资产。只承接同一面部骨架、眉眼鼻唇关系及颊颌辨识；依本稿呈现夹墙救援前仍在世的青年成年母亲。不得照搬原图暗蓝光、惊惧张口、侧转仰视、发髻饰物、影视衣服、火盆或室内构图；本图头直正面、豆绿袄米裙与折叠童衣优先。 第二输入是由原用户水墨图经内置image_gen派生的无人物辅助背景，实际查看无人物、面孔、衣装或器物。仅取暖浅灰不透明纸底、极浅低对比水墨远山薄雾和充分留白；墨迹与纸纹止于人物轮廓外。它不是原用户图片，也不是approved资产，不提供人物身份或造型。

背景与交付：第二张无人物派生背景图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。按最新FAST指示先生成1张候选，仅明显身份错误、严重结构问题或不可读才追加；所有输出仍为candidate，待用户最终审核，不自动approved。

事实与来源边界：原版game语料尚无戚芳可靠具名配对是历史来源范围，不否认本轮新核实的2004何美钿版戚芳本人图。当前以第一剧照提供身份，配对由同图caption、角色页2004字段及同期新浪cast证明，不靠相貌猜人。参考独审只通过身份用途，不证明图中精确集数或项目夹墙救援前阶段，不自动批准任何成品。项目年龄阶段、豆绿袄米裙、低髻木簪与折叠童衣仍按本稿；童衣是护女主题原创道具，不是原著专属信物。原著确岁、婚后衣饰发式未逐字终校，保留待考。

完整排除项：不要未婚少女双髻、婚礼凤冠嫁衣、母辈中年老化、孕态或成人化性感写真；不要疤痕复制凌霜华、不借王语嫣尖脸。不要血迹刀伤、临终场面、宝剑、女侠攻击架势；折布不能画成婴儿或第二人。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、直接交付演员摄影照片或电视剧截图、台标、火盆或暗蓝戏剧光；不复制参考的惊惧张口、侧转仰视、发髻饰物与影视服装。

FINAL POSE CHECK: FRONT-FACING 戚芳 / npc_qifang. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Preserve the facial identity from image 1 while obeying this adult-mother stage; do not transfer reference age, hairstyle, costume, head lean, expression, lighting or background scene.
```

## 排除项

不要未婚少女双髻、婚礼凤冠嫁衣、母辈中年老化、孕态或成人化性感写真；不要疤痕复制凌霜华、不借王语嫣尖脸。不要血迹刀伤、临终场面、宝剑、女侠攻击架势；折布不能画成婴儿或第二人。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、直接交付演员摄影照片或电视剧截图、台标、火盆或暗蓝戏剧光；不复制参考的惊惧张口、侧转仰视、发髻饰物与影视服装。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_qifang__ch09_youth_mother_base.prepared.json`。

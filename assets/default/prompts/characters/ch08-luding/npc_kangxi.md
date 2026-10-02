---
asset_id: por_npc_kangxi__ch08_youth_xiaoxuanzi_base
subject_id: npc_kangxi
name: 康熙
book: ch08_luding
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch08/por_npc_kangxi__ch08_youth_xiaoxuanzi_base.png
manifest: assets/default/character/male/ch08/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/luding/kangxi_1998_majunwei.jpg
  use: 第一且唯一面部身份：1998 TVB陈小春版《鹿鼎记》的马浚伟饰康熙，本任务已实际view并核对来源记录、SHA、尺寸。第一参考的长椭圆脸、颊面平顺、下颌由颧侧自然收窄而下巴圆钝；眉形较平直、眉峰浅、眉尾略长，眼形自然开阔，清楚上眼睑、内外眼角和眉眼间距。鼻梁纤直、鼻翼较收敛，唇形整齐、浅唇峰、下唇自然略厚。保留这些有别于韦小宝的五官关系，但把成年面中长度和下颌成熟度自然适配约15岁少年，少年面颊柔和、骨架清瘦挺拔而尚未长开，无胡须。不能机械缩小成人头像，也不借令狐冲的窄长剑客脸或陈小春的较宽鼻翼方颌。神情专注好胜而克制，用平视目光表达小玄子的聪敏与自尊，不用怒瞪或成年帝王威严。参考帽子遮住发际，不能从照片推断发际线。 本人五官适配当前阶段，绝不继承照片头倾、身体倾角、其他人物、服装、拍摄背景或半身构图；新图必须正面头颈竖直、双眼水平。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考仅男性项目低饱和色卡、柔和明暗与连贯细腻写实手绘质感；已实际view。不可借令狐冲面孔、成年体型、胡茬、发髻网巾、明代衣装、剑或倾头站姿；manifest实际candidate，保持不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅背景：极浅低对比水墨远山、暖浅灰纸底、薄雾与留白；已实际view。完全忽略其中王语嫣面孔、倾头转身、女性体态、白青薄纱裙装、发饰与飘带；墨痕纸纹不得侵入康熙的人体衣物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 康熙 · 人物写实修正

## 人物与阶段

- subject_id：npc_kangxi
- book：ch08_luding
- gender：male
- age_variant：youth

## 本轮人物写实规范

约15岁小玄子，1998马浚伟康熙作为唯一脸部身份，自然少年化；头颈竖直、双眼水平、正面空手低位布库准备。石青清初箭衣便服、剃额细辫、无帽无仪仗；完整写实少年，水墨仅背景。 两张原生2:3候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_kangxi__ch08_youth_xiaoxuanzi_base/prompt-4ad726430780b31397a79cf95365c33ec6026dde697fcb8cf9f7acd7c22c53bf.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia character illustration of KANGXI / 康熙, palace practice identity Xiao Xuanzi. Use image 1 as the ONLY FACIAL IDENTITY source: Steven Ma / 马浚伟 as Kangxi in the 1998 TVB The Duke of Mount Deer starring Jordan Chan. Preserve this particular character’s recognizable facial relationships, naturally adapted to the specified story age. Image 2 is ONLY a same-gender project colour/rendering sample; image 3 is ONLY the pale ink-wash background sample. No other face may enter the design.

身份与阶段：康熙（npc_kangxi），《鹿鼎记》ch08_luding，清初康熙时代；严格是1669年擒鳌拜前，宫中小玄子与布库演练的少年阶段。约15岁，生日界限可差1岁，未成年少年，asset的youth键不自动等于成年。

本人辨识锚点：第一参考的长椭圆脸、颊面平顺、下颌由颧侧自然收窄而下巴圆钝；眉形较平直、眉峰浅、眉尾略长，眼形自然开阔，清楚上眼睑、内外眼角和眉眼间距。鼻梁纤直、鼻翼较收敛，唇形整齐、浅唇峰、下唇自然略厚。保留这些有别于韦小宝的五官关系，但把成年面中长度和下颌成熟度自然适配约15岁少年，少年面颊柔和、骨架清瘦挺拔而尚未长开，无胡须。不能机械缩小成人头像，也不借令狐冲的窄长剑客脸或陈小春的较宽鼻翼方颌。神情专注好胜而克制，用平视目光表达小玄子的聪敏与自尊，不用怒瞪或成年帝王威严。参考帽子遮住发际，不能从照片推断发际线。

服制与发式：清初满洲宫廷少年练习便服：石青色窄袖箭衣式长袍，掩襟向穿着者本人右侧合拢、窄腰带，深灰长裤与软底深色靴。低调同色织边，衣襟闭合，衣料整片完整，没有破损、勋章、龙纹或重金绣。前额剃发、后脑留一条自然细辫，辫子垂向背后，肩后只露一小段即可；不为显辫子转头。省去帽子，清楚呈现本阶段剃额细辫；照片里的红缨宫帽、明黄华贵领口和朝珠不进入新图。具体石青选款与织边是角色稿的美术补足，不冒称史料精确复原。

姿态与器物：正面站稳、颈部直立、肩线自然舒展，双足微分开，两只软靴都着地，膝部只自然松弛，体态是随时可开始演练的少年。空手，左手在本人左前方腰腹高度自然摊开作低位准备，右手空着靠右腰侧，十指结构清楚、手掌不贴合为一个团；手腕与袖口连贯。手臂不遮挡面部或剃额，不用出掌、抓人、飞踢或戏剧性扭腰表现布库；画面只一个小玄子，没有摔跤对手。姿态侧别为本图美术安排，不当作小说固定招式。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考主次再次限定：第二参考仅男性项目低饱和色卡、柔和明暗与连贯细腻写实手绘质感；已实际view。不可借令狐冲面孔、成年体型、胡茬、发髻网巾、明代衣装、剑或倾头站姿；manifest实际candidate，保持不变。 第三参考仅背景：极浅低对比水墨远山、暖浅灰纸底、薄雾与留白；已实际view。完全忽略其中王语嫣面孔、倾头转身、女性体态、白青薄纱裙装、发饰与飘带；墨痕纸纹不得侵入康熙的人体衣物或器物。

背景与交付：第三图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。默认两张独立候选由执行者比较；所有输出仍为candidate，待用户最终审核，不自动approved。

事实边界：年龄约15岁由年份推算，生日边界可差1岁；演员照片是成年定装照，只用于适龄转译后的身份五官。 少年便服确切剪裁、颜色、眉目及剃额细辫具体细节尚未按三联/广州修订版逐字校勘。 石青箭衣式便服、同色织边、无帽、双手低位布库准备继承角色稿并适配正面姿态。 清瘦未成年身架、五官自然少年化；不把皇帝身份表现为后期仪仗。 用户明确指定1998剧版面容覆盖旧稿禁演员脸要求，但照片年龄、衣装、姿势和场景不变成小说事实。

完整排除项：不要二三十岁成年马浚伟本人年龄、宽胸壮汉、健美肌肉、成年长脸与胡须胡茬；不要婴幼儿或女相化少年。不要借韦小宝、陈小春、令狐冲、萧峰或女性基线面孔。不要红缨大帽、朝珠、龙袍、帝王朝服、黄马褂、龙椅、冕旒、皇冠、仪仗、官印、刀剑、弓箭或任何兵器。不要满头长发、宋明发髻、网巾、完全无辫的僧人光头。不要照搬参考的成年骨架、黄领金绣、胸像裁切或粉紫影棚。不要把布库演练画成绝顶武者、摧山掌法、抡人、飞跃或有第二个少年。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。

FINAL POSE CHECK: FRONT-FACING KANGXI / 康熙, palace practice identity Xiao Xuanzi. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level, chin neutral and gaze forward. NO head tilt and NO Dutch angle. Never inherit reference-photo head lean, sideways gaze, tilted shoulders, turned torso or cropped composition. Preserve only this role’s recognizable facial identity and the current-age full body.
```

## 排除项

不要二三十岁成年马浚伟本人年龄、宽胸壮汉、健美肌肉、成年长脸与胡须胡茬；不要婴幼儿或女相化少年。不要借韦小宝、陈小春、令狐冲、萧峰或女性基线面孔。不要红缨大帽、朝珠、龙袍、帝王朝服、黄马褂、龙椅、冕旒、皇冠、仪仗、官印、刀剑、弓箭或任何兵器。不要满头长发、宋明发髻、网巾、完全无辫的僧人光头。不要照搬参考的成年骨架、黄领金绣、胸像裁切或粉紫影棚。不要把布库演练画成绝顶武者、摧山掌法、抡人、飞跃或有第二个少年。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_kangxi__ch08_youth_xiaoxuanzi_base.prepared.json`。

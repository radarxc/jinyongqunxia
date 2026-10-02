---
asset_id: por_npc_zhoubotong__ch02_elder_base
subject_id: npc_zhoubotong
name: 周伯通
book: ch02_shediao
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch02/por_npc_zhoubotong__ch02_elder_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/zhoubotong_1983_qinhuang_ifeng2019_front.jpg
  use: 第一且唯一面部身份：1983翁美玲版《射雕》秦煌周伯通，已实际view并核验source。保留宽上脸、饱满颊部、圆而有神的眼、鼻梁与圆厚鼻头、灰白蓬松长眉和长须的辨识关系；唇颌部分被胡须遮挡不作精确推断。不继承仰头张口、前倾、白衣剧装、竹帘布景、水印或摄影裁切。重构正面直立、头正眼平。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二仅男性项目设色、柔和光线与连贯细腻写实手绘质感，已实际view；candidate审批状态不变。不借令狐冲脸、成年青年体格、胡茬、头巾、衣装、剑、站姿或头倾。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三仅背景极浅水墨远山、暖浅灰底和留白，已实际view。不取女性脸、发式、体型、倾头、纱裙或饰物，纸纹墨痕不得侵入人物实体。
status: ready
realism_revision: user_identity_pose_20261001
---

# 周伯通 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhoubotong
- book：ch02_shediao
- gender：male
- age_variant：elder

## 本轮人物写实规范

1983秦煌版本人面容第一；正面头直眼平、自然闭口促狭笑。中老年灰白长须发，项目清瘦灵活体态，宋式洗旧灰褐完整布衫；左松拳右张掌的低幅异向空手动作，不带器物。人物连续写实，背景才浅水墨。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhoubotong__ch02_elder_base/prompt-39f90b2b0db6b08307226f2cec16df05321932c09ca4feb2a9a31339957d2167.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing person. Keep head and neck naturally UPRIGHT, forehead–nose–chin centerline VERTICAL, both eyes HORIZONTAL, chin neutral, gaze forward and camera level. No head tilt, no Dutch angle, no head leaning toward either shoulder. The reference pose must not be copied.

Create a refined REALISTIC full-body wuxia illustration of ZHOU BOTONG / 周伯通 in The Legend of the Condor Heroes. Image 1 alone supplies the facial identity of Chun Wong / 秦煌 as Zhou Botong in the 1983 TVB Barbara Yung-era cast. Image 2 supplies only male rendering and colours; image 3 only a faint ink-wash background. Make one original illustration, not a screen capture.

身份与阶段：npc_zhoubotong，《射雕英雄传》ch02_shediao，桃花岛困居末期至脱困、传授左右互搏阶段的老顽童，全真同门长辈。中老年外观，不锁具体岁数；不是《神雕》百花谷更晚阶段。兴致勃勃、天真好胜而头脑清醒，顽皮来自明亮眼神和轻微促狭笑意，不靠歪头、吐舌或婴儿化。

面容以第一张真实剧中本人为唯一依据：额颊较宽、颊部饱满但不臃肿，灰白蓬松长眉，圆而有神的自然眼形、眉眼间距与走向，较直鼻梁和圆厚鼻头鼻翼。保留中老年额纹和眼角笑纹，灰白长须自然覆盖下颌，须发有连续体积但不僵硬。来源图唇颌被须遮挡，不发明精确唇厚和下颌角；在自然闭口微笑中保留本人辨识，不照抄惊讶张嘴或仰头。灰白长发简单拢束，头后低调小束髻，少量未精修散发体现困居，但不横遮眼睛。身躯按项目的清瘦、筋骨灵活长者设计，不能借演员现代照片的体胖或男性基线的青年体格。

服饰：宋式洗旧灰褐右衽布长衫、普通灰褐布腰带、深灰布裤、深色软布鞋。汉式交领为穿着者左襟压右襟，向本人右侧闭合，不镜像。衣料旧而干净完整可穿，有限自然磨旧，整片连续布料、确定剪裁，少量宽缓承重褶；袖口适度收束以露出手腕。没有掌教礼冠，不复制剧照的白色影视衣装和碎边。

正面完整站姿：头颈中线竖直、双眼平齐、肩自然平展，双脚真实落地，一足可轻微前移而身体保持稳。只有两条胳膊两只手，两手均空手、在胸腹前低幅度展示不同动作：本人左手松拳，拳头位置略低；本人右手自然张掌，五指放松分开。双手彼此分离，不挡面、不相交，不作飞跃或夸张打斗，用这一简单差异表示左右互搏的游戏邀约；不画分身、残影或法术。不带任何兵刃、书卷、玩具或道家法器。

人物与背景：人物本体美观写实，可信中老年皮肤、自然骨肉和连续柔和明暗，脸、双手、衣料、鞋有清晰完整轮廓；温暖肤色与低饱和灰褐配色，柔和左上漫射光。男性基线只取细腻绘制和设色，完全忽略基线人物身份。背景为不透明暖浅灰底、极浅低对比远山水墨与充分留白、脚下浅接触阴影；纸纹、水墨和薄雾停在人物轮廓之外，不能穿透皮肤和衣服，无桃花岛洞穴或竹帘实景。

单人单视图完整全身，原生2:3竖幅，头顶、头发、双手、双足和衣摆全入画，留自然边距，不靠裁切与拉长身材凑占高。目标2048×3072不透明PNG，接受工具真实原生尺寸如实登记；原始PNG字节保存，不缩放、裁切或重编码。默认两张独立候选供实际比较，全部candidate待用户审核。

事实边界：年龄、桃花岛阶段、空手与左右互搏来自项目角色稿/catalog/story；衣色、低幅手势和站姿是已有美术补足。第一参考为公开页面标明83版人物上下文的古装剧照，具体集数不明；不把镜头、影视服装或演员现实年龄当原著事实。用户指定此版本人五官覆盖旧稿禁演员脸；原基线candidate不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、仰头张口、俯首藏眼、偏斜脸部中线、双眼高低倾斜、歪镜头、回眸侧脸、耸单肩；不要复制第一参考吃惊张嘴、前倾动作、竹叶竹帘、树枝遮脸、水印文字或摄影裁切。不要青年通用俊男脸、令狐冲或萧峰脸、女性脸、网红尖下巴、动漫大眼、婴儿身体、痴呆表情、滑稽小丑、夸张肥胖或肌肉；不要现代采访服、清式辫子、剃头僧装、掌教礼冠、金冠、盔甲、仙人光环。不要神雕百花谷晚年返老还童形象、整齐年轻剑客发式；不要增剑、拂尘、葫芦、玩具、秘籍或法器，不要分身四臂、残影、两个人、镜像完全相同手势。不要多肢多指、错手错腕、手臂融合、悬浮脚、裁断头足；不要破布碎墨、透纸皮肤、白斑、撕裂衣角、污渍、细碎乱褶、面部斑驳、塑料皮肤、直接照片或三维模型。不要额外人物、分格、多视图、近景头像框、文字、题款、签名、印章logo或装饰水印；不删除工具自带溯源。

FINAL POSE CHECK: frontal face and torso, upright head and neck, vertical facial centerline, eyes level, neutral chin, complete whole body. NO head tilt and NO Dutch angle.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、仰头张口、俯首藏眼、偏斜脸部中线、双眼高低倾斜、歪镜头、回眸侧脸、耸单肩；不要复制第一参考吃惊张嘴、前倾动作、竹叶竹帘、树枝遮脸、水印文字或摄影裁切。不要青年通用俊男脸、令狐冲或萧峰脸、女性脸、网红尖下巴、动漫大眼、婴儿身体、痴呆表情、滑稽小丑、夸张肥胖或肌肉；不要现代采访服、清式辫子、剃头僧装、掌教礼冠、金冠、盔甲、仙人光环。不要神雕百花谷晚年返老还童形象、整齐年轻剑客发式；不要增剑、拂尘、葫芦、玩具、秘籍或法器，不要分身四臂、残影、两个人、镜像完全相同手势。不要多肢多指、错手错腕、手臂融合、悬浮脚、裁断头足；不要破布碎墨、透纸皮肤、白斑、撕裂衣角、污渍、细碎乱褶、面部斑驳、塑料皮肤、直接照片或三维模型。不要额外人物、分格、多视图、近景头像框、文字、题款、签名、印章logo或装饰水印；不删除工具自带溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhoubotong__ch02_elder_base.prepared.json`。

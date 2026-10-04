---
asset_id: cg_ch04_lvliu_footplay
name: 绿柳庄地牢足心制穴
book: ch04_yitian
characters:
- npc_zhangwuji
- npc_zhaomin
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w33/staging/ar88_lvliu_composition.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w33/staging/ar88_zhangwuji_F.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w33/staging/ar88_zhangwuji_F_face.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w33/staging/ar88_zhaomin_AR84.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w33/staging/ar88_zhaomin_AR84_face.jpg
output: assets/default/scene/ch04/cg_ch04_lvliu_footplay.png
manifest: assets/default/scene/ch04/manifest.yaml
size: 1536x1024
status: candidate
references:
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/coord/imagegen-reference/identity-20261002/yitian/author_screenshot_lvliu_footplay_20261004.png
  use: 作者剧照：只取动作、站位和镜头
  sha256: d4d69d78cfb93fd9309bf5a6ffeaded98ed2dabf96a5b932888d31b403e7d268
- path: assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_jiaozhu_base.png
  use: 作者认可张无忌F，身份服饰体格
  sha256: 3320846559f71c5013f03eba4e872004b787141b59e774cba57b33d37bbe7103
- path: assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_lvliu_base.png
  use: 赵敏AR-84恢复base身份发饰；服色依原著嫩绿女装
  sha256: 9f376a0bcf5639eea74c6b319f287d4867f007a1a5f52c7b95bb38b5269508f8
redo_reason: AR-88 照作者剧照的动作和镜头重画
---

## 原著依据

《倚天屠龙记》第二十三回《灵芙醉客绿柳庄》。2026-10-04以通用User-Agent `TianshuBot/1.0`读取[在线原文](https://yitian.5000yan.com/42033.html)，核查文本在 `.agents/coord/_lines/lvliu-redo/original_ch23.txt`；未宣称核对指定纸本版次。

- 地牢摘句：「纯钢所铸」。水阁下陷阱深四五丈，钢壁光滑无细缝、方圆数尺；高处巨大铁翻板由上面的八根钢条锁住。画连续暗钢深井，不画低矮铆钉箱。原文黑暗，微光为绘画可读性处理。
- 逼问摘句：「放我出去」。张无忌落牢前已经取得解药，怀中藏着解毒花草；制足穴是逼赵敏开启翻板，脱困救明教中毒众人，不是此刻逼交解药。原文对双足涌泉穴施为；本次单足托举、拇指按穴与坐矮凳依AR-88作者剧照。
- 张无忌神态摘句：「一心脱困，全无别念」。他急于救人，焦急气恼，画认真逼问且不笑（AR-69），不轻薄。
- 赵敏神态摘句：「又惊又怒」。她硬撑不肯放人，受制时笑哭气恼交错，事后羞红；按作者口径画又羞又恼又强撑的瞬间。
- 赵敏服饰摘句：「嫩绿绸衫」。返回水阁时她已换女装，故用嫩绿衫裙；脸、发髻、玉饰照AR-84恢复base。原著服色女装覆盖base蓝色男装。张无忌此段未另写服色，照F白袍深边。
- 道具：原文双足鞋袜脱下；本图双足赤裸，一足托起、一足落地，软鞋白袜落地。矮木凳依作者剧照加入，原著无凳描述。

## 当前提示词（AR-88，整张新生成）

```text
本次纠正前三张共同问题，下面两条优先级最高：
1. 托足按穴必须是拇指，不是食指。做一个真实的两手抱托足姿势：托前脚掌的手，食指、中指、无名指、小指全部弯曲包在脚掌外侧，绝不伸出任何一根长直食指去戳足底；宽短的拇指从虎口伸出，以柔软的拇指指腹按在足心凹处，拇指根部与手掌的连接必须清楚。手掌部分转向足底、拇指在最靠近足心的一侧，其他四指只抓握支撑。另一手在后跟下承托。画真实的拇指指腹按压，禁止食指指尖戳足心。
2. 张无忌必须是图2/3作者认可F本人，不能另换一个锐鼻硬下巴的侧脸男人。身体侧向赵敏，头自然向镜头稍转约35–45度，两眼均能读到但仍看左边赵敏。完全保留F的眼眉、鼻唇和温和青年颌骨形状，表情严肃不笑，顶髻只有F的黑色发束，不能增加白色玉带冠。不得复制图1演员侧脸。

Use case: historical-scene / illustration-story
从零新生成1536×1024横幅写实手绘武侠剧情插画，《倚天屠龙记》绿柳庄地牢足心制穴，整张重画，全员明确成年。

参考图分工：图1作者剧照，仅取人物动作、左右站位、距离、高低关系、侧面平视镜头和两人全身取景，不取演员脸、服装、发型、灯光、摄影画质或字幕。图2/3是同一位张无忌的作者认可F全身与头肩，唯一的张无忌身份参考；图4/5是同一位赵敏的AR-84恢复base全身与头肩，唯一的赵敏身份参考。使用参考里的同一个人，保留各自骨相五官、发型头饰，不重新设计相似陌生人，不串脸，不借用图1演员。赵敏神态与服色按下述本场要求变化。

动作和镜头照图1：平视侧面中景，两人位于中部，从头到脚都完整入画，左右各留空地和墙面，人物高度约画高65–75%。赵敏在左，坐在地面，背靠钢壁，上身微后仰，一手撑身侧地面、另一手自然放身侧，脸朝右边张无忌看他。两腿从髋部向右前方伸出，一腿稍抬、一只赤足被张无忌双手托起，另一腿伸在地面、另一只赤足着地。长裙完整遮住大腿及小腿上部，膝盖不高耸抱胸。被托脚尖向上，足心大致朝张无忌，侧镜头看见足弓和部分足底，踝、后跟、足掌、五个脚趾真实连贯，腿脚朝向自然，不扭踝、不多脚。

张无忌在右，坐在她脚边的简单矮木凳上，双脚穿深靴自然着地，侧身朝左，身体自然微前倾。他双手共同托起她同一只赤足到自己下胸口，一手托踝下和后跟，另一手托前脚掌，拇指明确按足心凹处；手掌有真实支撑和握力，手指从袖口连续长出、关节自然，每手五指但允许合理遮挡，不能指趾融合、手掌悬空或手指插穿足掌。坐凳男子头部略高于坐地女子，保持图1高低关系和人体重心，不画半跪或蹲坐。两人对视，头稍向画面转来，使自然的三分之二侧脸可读；不看观众。下巴与颌颈过渡自然、脖子从衣领自然长出，不尖长下巴、不扭颈。头身与肩宽照F，头不过大、肩不窄、不是健美体格。

张无忌必须是图2/3的同一青年：F的白色交领袍、深镶边、黑灰腰带与腕部布带，头发束起、侧发珠饰照F。神态急于脱困救明教中毒众人的认真逼问：眼神坚定而焦急，口闭合、嘴角平直、绝不笑，不轻薄不调情。
赵敏必须是图4/5的同一郡主：眼型、眉鼻唇、脸型骨相保持，头顶束髻、浅玉发饰与簪照base，神态又羞又恼又强撑，轻蹙眉、脸颊略红、双唇绷住，倔强看他，不用base的露齿笑。服饰依原著此次已换女装，身穿嫩绿丝绸交领衫与完整长裙，精细古雅暗纹、白内领和腰间玉坠可保留base样式；不可穿蓝色男袍，不照抄图1的红衣黄裙。双足鞋袜均脱，一足托起、一足落地，脱下的软鞋和白色罗袜自然落在两人脚边，不摆齐陈列。剧情是受制逼问和救人之急，不是暧昧摆拍。

地牢依原著：水阁下纯钢铸的狭窄深井，深四五丈，连续光滑冷硬暗钢壁、钢底板，钢壁无明显细缝，克制的金属旧化；不画砖石、栅栏、窗或低矮顶棚。巨大铁翻板闭合在高处，此平视镜头让钢壁向高处消失来暗示井深，不硬塞低顶；上面八根钢条在翻板上方不可见。无第三人、无烛台、无随手可开机关、无满壁铆钉。柔和微光只为面容动作可读的绘画处理，仍显昏暗狭窄。矮凳只依作者指定剧照加入，原著未写凳。

画风照STYLE.md与两份base：写实手绘古风武侠，男性偏写实、女性古典美丽，自然骨相及细微不对称，细腻笔触、皮肤真实而不磨皮，头发不过锐，布料经纬、丝绸厚薄与自然垂坠可读，低饱和沉稳设色、柔和明暗。不是照片、电视剧复刻、3D塑料CG、动漫、网红美颜或厚涂油画。

题字：右上角竖排一列毛笔楷书，严格规范简体，自上而下四字「绿」「柳」「初」「逢」，合为「绿柳初逢」。每字独立清楚准确，占画宽约6%、高约28%，不挡脸；可附无可读文字小朱印。禁止繁体「綠」、日文字形、错字、增减字、其他文字、字幕、水印、Logo或边框。
避免：陌生脸、串脸、剧照演员五官、赵敏蓝男装、张无忌微笑、开心大笑、足部特写、裸露大腿、指趾融合、错肢、拧踝、脚不连腿、鞋袜仍穿在被托脚上、尖长下巴、扭脖、浮空坐姿、照片光影、发光穴位武功。

再次强调：这次不是食指点穴。四根长手指弯曲抓足，大拇指腹按足心；只画F同一身份。
```

## 最终身份合成（AR-53，仅张无忌头部）

选第4张从零整图，随后以F唯一身份生成第5次头部补丁。原生补丁1254×1254，缩至350×350，合成框 `[880,0,1230,350]`；头部边缘2px过渡，颈部收窄蒙版以8px过渡匹配衣领。最终蒙版与参数见 `.agents/coord/_lines/lvliu-redo/selected.json`。蒙版外逐像素保留所选新整图，赵敏、托足、鞋袜、钢壁、题字均不改。已打开头部、颈部接缝、最终整图与base并排表检查。

```text
Use case: identity-preserve / compositing
生成一张1024×1024写实手绘武侠头部补丁，重建图3遮灰的头部，不能做整幅场景。
图1是作者认可的F张无忌，唯一五官身份来源。图2是同一F全身，发型衣领身份补充。必须用这同一个男子，不创造相似的男人。准确保留他的眼眉、鼻唇、颧骨、软而自然的青年下巴，不能换锐鼻硬长下巴的侧脸，不改变年龄。原base的笑意改为急于救人时认真逼问：闭口，嘴角平直、不笑，眉略收。
图3只是构图、头部大小位置、颈部朝向、衣领、钢壁与光线的局部参考，错误旧头已遮灰。不要把灰色轮廓作为新头外轮廓。重新从图1建立F的头发和脸。所有灰色区域都画完整，不能留下灰斑。图3有现成白袍深边、身体倾角与暗钢背景，其余保持图3内容和位置，不改衣服、肩膀、边框。
机位：身体朝左，头稍向画面转来呈自然三分之二侧面，yaw约35–40度，两眼均可读，目光向左下方另一人物；不能正脸看镜头，也不做90度锐鼻侧脸。F原骨相和五官要一眼辨认，同一脸只改变转头和表情。闭口不笑、严肃克制，不轻薄。面容中心大约(415,510)，黑色顶髻中心约(415,70)，下巴约y=760，颈部自然接到图3保留的衣领(y=885附近)；原图的头部大致大小不变，不把脸扩大，不拉长下巴。左边脸廓不要伸到x=160以内，右边头发耳廓不要超出x=650。
发型完全照F黑色半束顶髻，黑发束结，不加白玉冠、白色丝带或别人的头饰。面容与头发用细腻手绘笔触，匹配图3地牢内柔和灰暗光、肤色不过白，不把明亮纸底人脸生硬贴入黑钢壁。颈部肌肉放松自然，下巴圆转，肩颈接合顺畅。保留F侧发细珠饰特征，长发自然沿原肩方向落下。
画满整张正方形补丁，灰色头部由F替换，外部仍为图3自然背景及衣领，不要文字、箭头、标记、边框、照片质感或塑料美颜。最重要：图1F是唯一身份，面容不能再凭通用英俊男演员重设计。
```

## 历史提示词（AR-88之前，不再用于出图）

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch04_lvliu_footplay.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
绿柳庄地牢斗智，张无忌和赵敏均为明确成年人。双人中景，张无忌半跪在下方以手指轻触赵敏左足足心，迫其叫外面守卫打开翻板；赵敏被点穴后靠暗钢壁坐着，笑恼交加；叙事重点是两人目光和表情的交锋。赵敏仍是完整宽松男装长袍，仅左鞋左袜置于身侧，右脚仍穿鞋袜，左足只在画面下缘小比例出现，不特写、不性化、不暴露大腿。狭小封闭钢牢、暗沉金属壁与上方紧闭铁翻板，不放蜡烛、不画可自行开启的机关；微弱轮廓照明为叙事可读性的原创扩展，细节待三联纸本复核；无他人。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_zhangwuji的本轮立绘；第2张为npc_zhaomin的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「绿柳初逢」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《倚天屠龙记》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是张无忌（npc_zhangwuji）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是赵敏（npc_zhaomin）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第二十三回，绿柳庄地牢足心制穴；版次措辞待逐字复核。
地点与时刻：绿柳庄地牢；夜、暖烛与暗石壁。
画面瞬间：张无忌半跪在赵敏身前，以手指轻挠她足心涌泉穴迫其开启机关；赵敏扶墙笑恼交加，鞋袜整齐置于一旁。
构图与站位：双人中景；张无忌左下、赵敏右上，重点在两人表情与对视，双足位于画面下缘且不特写。
情绪基调：诙谐、斗智、初生心动。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传张无忌 por_npc_zhangwuji__ch04_youth_jiaozhu_base、赵敏 por_npc_zhaomin__ch04_youth_scene_lvliu。
未上传身份参考的人物文字要点：
所有具名人物都有合法身份参考；仍须按本场动作重绘，不能照搬参考图姿态。
制作边界：衣着完整、全员成年、不做足部特写或性化；联网交叉核到第二十三回，指定纸本仍（待考）。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```

### 历史实际执行提示词（77849441／AR-86，来自入队前manifest，不再用于出图）

```text
Use case: identity-preserve / historical-scene
生成 1536×1024 横幅写实手绘古风剧情插画。《倚天屠龙记》绿柳庄地牢足心制穴；这是 AR-75 作者明确要求的整张重画。
参考图1：唯一构图、钢牢环境、人物站位、动作、视线关系与题字参考（旧插图）。参考图2：张无忌最新 F 定稿全身，面容、发型、头部和肩胸比例以它为准。参考图3：F 头肩特写，锁定张无忌原面容，不能换脸、不能添笑。参考图4：赵敏作者认可的最新 base 全身（恢复版 f1cd1652），唯一赵敏身份与服饰参考。参考图5：该 base 头肩特写，锁定赵敏眉眼鼻口脸型与发髻。不得从参考图1旧脸取身份。全员明确成年人。
场景与构图：狭窄封闭的暗钢地牢，暗钢壁、铆钉、上方紧闭铁翻板；没有第三人，没有烛台，没有可自行打开的机关。张无忌在画面左下坐蹲/半跪，赵敏靠右侧钢壁坐着，双人中景和原画类似。保持原图俩人朝对方看的视线与完整人体重心；柔和微光使面容可读，低饱和沉稳画风，布料有自然笔触与褶皱，不要照片质感或三维CG。
张无忌：严格照参考2/3 F 的五官与发式，青年成年、沉稳认真，原F头身约7.43，肩胸只略宽，绝非健美身材。穿 F 白色交领深边浅色长袍、深布腰带。侧身逼问赵敏如何命守卫打开地牢翻板，眼神坚定且克制，嘴角不笑，不能画成调情、玩弄、轻薄。
赵敏：严格照参考4/5 base 的五官身份，成年年轻的聪慧郡主，长袍男装、蓝色完整宽松交领衣，头发束髻和原base一致。状态是被制住后又羞又恼、抿唇蹙眉，带难堪的倔强，与张无忌对视；保持骨相五官，不复制 base 的开心笑容。
核心动作：赵敏一腿抬起屈膝，脚向画面下方的张无忌；这只脚已脱掉鞋袜，要从踝到五个脚趾完整清楚地露出，必须是赤足，不能还裹袜子、不能隐藏在袍摆里。张无忌一手稳稳握住该只裸足的后跟/踝部，另一手食指轻触其足心穴道，手与脚解剖自然、手脚不能融合，明确可读的足心制穴动作。鞋与袜整齐放在赵敏身旁，另一脚仍穿鞋袜。长袍遮住大腿，裸足在下缘占适当小比例，不特写；重点是俩人目光交锋与逼问关系。
题字：右上角保留原画竖排毛笔楷书「绿柳初逢」，严格四字从上到下，无其他可读文字；小朱印可沿用旧图气质。
必须通过：俩人一眼是 F 张无忌与最新base赵敏；两脸不能沿用旧插图；赤足脚趾清楚、足心点穴与另一手握足同时可读；赵敏羞恼、张无忌严肃逼问；同原图封闭钢牢与构图关系；人物手绘质感自然、无拼接和错肢。
【不要】不要旧图张无忌或旧图赵敏的脸、陌生脸、串脸、开心大笑、色情或恋物特写、裸露大腿、现代物、第三人、发光武功、浓妆塑料皮肤、真人照片质感、过强轮廓光、错手错足、多余手指、足趾融合、鞋袜还穿在被握的脚上、脚被衣摆遮住、文字错漏。


# 最终头脸补丁（v3；v1/v2张无忌旧脸未通过，不采用）
Use case: identity-preserve
Draw a 1024x1024 hand-painted Chinese wuxia head-and-shoulders patch.
Image 1 is the ONLY facial identity source: the AUTHOR-APPROVED final F portrait of Zhang Wuji. Copy this man's actual facial structure, eye shape, eyebrow shape, modest straight nose, lip shape, youthful jaw and chin. Image 2 is the full portrait of the SAME man, for costume and hair. Image 3 is a local COMPOSITION GUIDE with the obsolete wrong face and crown deliberately blanked out. Reconstruct the blank area as the man from image 1, NOT a generic side-profile actor. There is no face in image 3 to copy. Do NOT copy the contour of the blank area's edge as the head outline.
Output has exactly the framing and neck/collar/steel-cell backdrop of image 3. Face centre approximately (520,460) within a 1024x1024 image; main hair crown at approximately y=180, chin approximately y=700. He is an adult young man, eyes looking towards someone off frame to the RIGHT, yaw about 35 degrees to the right so BOTH eyes are clearly visible, not a near side-profile. Keep the camera orientation and seated body direction from image 3. Natural neck connection, not a pasted frontal face. Serious restrained interrogation, closed mouth, level lips, no smile and no flirtation. Keep image 1's face recognizable in this slight three-quarter turn. Avoid a long projecting nose or broad hard jaw; the soft youthful face must look like image 1.
Hair tied in the same half-up dark topknot as F; retain characteristic dark side locks and beads, softly matched to the cellar lighting. The head should be six percent smaller than the missing old head: use F's comfortable head-to-shoulder proportions. Clothing in image 3 stays white with dark crossing edge and embroidered trim. Steel wall and muted paint texture, warm subtle skin shadows, same hand-drawn style as F. No photorealistic actor snapshot, no plastic skin.
Paint a complete finished image, fill the empty grey silhouette with the proper head, natural face edges and adjoining neck/hair, no grey holes remaining. Do not change the crop borders, shoulders or clothes, because the result will be merged into an existing illustration. No text, no arrows, no labels.
最重要：图1是唯一正确身份。画成该张F的张无忌，不能又画旧插图那张宽鼻侧脸！图3的空白头只是遮掉的错误脸，必须从F重新建立自然三分之二侧转的人脸，两眼都清晰可见。严肃逼问，不笑。


合成：原生1254×1254头肩补丁缩至384×384，合回body v1的[384,172,768,556]，外缘5px过渡；赵敏、赤足、两只手与题字沿用已检查body v1，头肩补丁外逐像素不变。参数与蒙版见 .agents/coord/_lines/zhangwuji-final/composition_lvliu_final.json。
```

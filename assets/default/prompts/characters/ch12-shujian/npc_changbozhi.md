---
asset_id: por_npc_changbozhi__ch12_prime_base
subject_id: npc_changbozhi
name: 常伯志
book: ch12_shujian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch12/por_npc_changbozhi__ch12_prime_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: candidate，当前工作副本 manifest 尚未批准；仅拟参考纸底、光线、笔触与设色，不沿用面容、体型、服饰或道具
status: new
redo_reason: AR-36 补齐当前工作副本缺失的基础立绘；candidate待审
reference_upload:
- .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
codex_prompt_rev: '2026-10-02'
classic_ref: 复用主检出既有候选（保留原始输入记录）
---

<!-- full-coverage-import:current-policy:v1 -->
> 本稿按用户“全部男女角色先出齐”的授权导入，仅为待生成的基础提示词，不表示图片完成或审批。
> 当前生产以[人物写实、背景水墨](../../../../../.agents/coord/portrait-generation/REALISTIC-CHARACTERS-20261001.md)与[宽松自查及项目基线授权](../../../../../.agents/coord/portrait-generation/RELAXED-PRODUCTION-20260930.md)为准；优先于下文旧纸底、精确占高和 approved 参考门槛。身份、年龄、伤残侧别及阶段器物仍须核对；保留参考与输出实际 candidate 状态，不自动批准。
> 正文暂保留原稿供考据。实际生成前必须重新读取最新 INDEX、人物稿和上述规范，由 prepare 重写完整实际提示词，并实际查看、按顺序传入本机绝对路径参考；不能直接提交下文含旧规范的提示词。保存真实 PNG、核验 manifest 后才更新本行完成标记。
<!-- /full-coverage-import:current-policy:v1 -->


# 常伯志 · 《书剑恩仇录》（ch12）

## Gemini 提示词

> ART-cast-fill-b：复用主检出既有候选（保留原始输入记录）；实际提交文本如下。面容细节与衣饰补足为（原创扩展），原著细节沿用原稿（待考）边界。

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

CHARACTER AND STAGE: 常伯志 / npc_changbozhi, por_npc_changbozhi__ch12_prime_base.
《书剑恩仇录》ch12，白无常、红花会六当家，常赫志之弟。取赤套营救与江南接应阶段，兄弟各自独立立绘和人物状态。 本项目书界主线年代为1753–1759年、清乾隆；前史人物严格以其生前回忆阶段为准，不把回忆像当作现时活体。

AGE AND ORIGINAL FACE IDENTITY:
壮年男性prime；瘦长但结实的正常成人体态，不病态瘦骨、老人化或白化妆。 与常赫志共享刻意的兄弟骨相：长窄脸、高而清楚的颧弓、轻凹面颊、瘦削但不针尖的长下颌，狭长眼形、较直细眉、窄直鼻梁、薄唇。常伯志本人的眼角完全没有哥哥的黑痣；眉间较松、眼神平直克制，嘴角自然收住，鼻尖略圆缓、下唇稍有体积，但区别从小特征产生，不把兄弟画成无关面孔。正常温暖肤色，不因白无常绰号变白脸鬼差。无须或极淡短髭为本版原创统一兄弟处理，不借令狐冲年轻偶像脸。

CLOTHING AND HAIR:
清代汉地江湖便装，实际剃额、后脑余发编为整齐长辫自然在背后，素深色小帽露出前额。浅灰青窄袖短袍、墨褐窄布腰带、窄长裤、整齐绑腿与平底布鞋。衣襟向穿着者右方闭合；汉式交领若可见为左襟压右襟。旧布用哑光与温和色阶表达，整片完整不透明，无破洞或碎条；浅色衣与背景分离，不当小说固定白袍。

POSE, EQUIPMENT AND STRUCTURE:
身体与头部正面，眼线水平，颈部自然居中，两肩不故意错高，双脚平稳。穿着者左腰挂一只收拢的金属飞抓，多个抓爪是钝光物理工具、不是手；抓头柄端接一根连续长索，索绕至右腰整理成收拢索圈，挂带与布腰带真实连接。左手轻托飞抓柄不握尖爪，右掌在腹旁自然向内，手腕和工具相互分清；不投掷或施放攻击。无鬼差帽、哭丧棒、黑沙烟雾、浮空索圈、刀剑或其它人物。

ORIGINAL CHARACTER COLOR AND LIGHT:
浅灰青衣、墨褐腰带与正常暖肤色保持低饱和冷暖分离；柔和左上漫射光表现长窄脸、高颧、较松眉间、略圆鼻尖与平直克制目光，两眼角均无哥哥黑痣。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. FAST1 production: first generate ONE candidate. Request another only for a serious identity, structural or readability failure. Every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。唯一输入为不含人物的派生纯背景参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要在眼角添加哥哥的黑痣、双人合影、鬼差帽、哭丧棒、白化病妆、长舌；不要将飞抓做成脱离身体的真实人手，不画黑沙掌烟雾或法阵。

FINAL POSE CHECK: 常伯志 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; No input supplies a face.
```

## 人物要点

| 项 | 内容 | 依据 |
|---|---|---|
| 身份与阶段 | 壮年男子，白无常、红花会六当家，取赤套营救与江南接应阶段 | 名录本人物行；story/12 §1.2 常氏双侠传讯；chapters/12 §8 |
| 项目已登记事实 | 常赫志之弟，黑沙掌画像，与兄长协同而独立招募 | 名录 / 章节 / 图鉴；玩法配置不等于原著装束 |
| 年龄与体貌 | 与兄长外貌相近、体态瘦长，眼角没有哥哥的黑痣；掌功与飞抓为识别物，白无常不是白化肤色 | 原著概括（待考）；名录年龄须与下文边界合读 |
| 服饰与发式 | 清代汉地江湖便装，剃额留辫，低饱和浅灰青短袍、墨褐窄腰带、窄裤绑腿与布鞋；素深色小帽，衣料有旧布质感 | tech/07 §2.7；经典锚点之外均（原创扩展） |
| 兵器与标志物 | 收拢的金属飞抓挂腰，索圈整理在另一侧，一手轻托抓柄，另一掌自然向内；不把白无常具象成鬼差器物 | 名录黑沙掌；飞抓与无痣概括（待考），佩挂细节（原创扩展）；具体形制美术补足（原创扩展） |
| 气质与姿态 | 与常赫志相同的长窄脸、凹颊、高颧与薄唇，约7.5头身；眼角无痣，眉间略松、视线平直；近正面稳立、一肩稍后，嘴角收住、神情冷静，和哥哥不同手势但保留家族骨相 | 具体脸型、比例、神态落实与站姿（原创扩展） |

依据分层：项目事实只取上表归属文件；原著概括均保留（待考）；脸型细节、衣装选款、配色与摆姿不冒充原著明文。

阶段与年龄边界：壮年采用 prime；同门同胞可共享骨相与服制语汇，识别差异来自黑痣有无、衣色与姿态。飞抓不新建ID或变更既有工具规则。

考据定位：《书剑恩仇录》三联/广州修订版，核对本条所选阶段的体貌、衣饰、兵器及出场先后；不据影视形象补证。

补充查证线索：[兄弟外貌线索](https://www.jinyongwang.net/data/2377.html)与[常伯志飞抓情节线索](https://m.gulongbbs.com/jinyong/sjncl/714_3.html)，指定版本仍（待考）。

参考与交付：frontmatter 列的是后续拟输入路径，本任务未调用出图；引用状态以该路径所在工作副本 manifest 的 status 为准。

规格边界：纸底候选按本任务保留不透明背景；tech/07 §1.3 的正式 RGBA 母版及 §5.2 后续处理另行验收，不把提示词 ready 当成图片获批。

## 提示词

```text
Use case: stylized-concept。Asset type: 《金庸群侠传·天书录》default 风格包，男性武侠人物单人全身立绘基础候选，目标 2048×3072、2:3 PNG。题材：常伯志，npc_changbozhi；壮年男子，白无常、红花会六当家，取赤套营救与江南接应阶段。书界：《书剑恩仇录》ch12_shujian，清乾隆，主线项目年代 1753–1759；前史人物以本条明确的回忆阶段为准。参考图：assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png（candidate，当前工作副本 manifest 尚未批准；仅拟参考纸底、光线、笔触与设色，不沿用面容、体型、服饰或道具）；它仅为后续生成时拟载入的同性别风格参考，本人物必须有独立的面容与身份。人物与经典锚点：与兄长外貌相近、体态瘦长，眼角没有哥哥的黑痣；掌功与飞抓为识别物，白无常不是白化肤色（原著概括，待三联/广州修订版逐字核对，待考）；与常赫志相同的长窄脸、凹颊、高颧与薄唇，约7.5头身；眼角无痣，眉间略松、视线平直（原创扩展的具体骨相与比例落实）。服装与发式：清代汉地江湖便装，剃额留辫，低饱和浅灰青短袍、墨褐窄腰带、窄裤绑腿与布鞋；素深色小帽，衣料有旧布质感（经典锚点之外的裁制、配色、饰件细节为原创扩展）；凡汉式交领均右衽，即穿着者左襟压右襟，不水平镜像。动作与兵器道具：收拢的金属飞抓挂腰，索圈整理在另一侧，一手轻托抓柄，另一掌自然向内；不把白无常具象成鬼差器物；近正面稳立、一肩稍后，嘴角收住、神情冷静，和哥哥不同手势但保留家族骨相（具体持法和站姿为原创扩展）；手物连接、兵器承重与悬挂点可信，器物端点完整，刀剑鞘足以容纳刀剑。构图：竖幅 2:3，单人完整全身，平视近正面轻侧、中性透视；人物占画高约 88–92%，头顶、双足、现存手部、兵器端点与衣带全部入画，四周留净空；尊重既有伤残，不补回缺失肢体。画法与光线：武侠，男性偏写实，真实骨相、自然不对称、皮肤与筋腱质感、可信年龄、布料纤维，细腻克制的手绘笔触，低饱和设色，自然衣褶与清楚剪影，柔和左上主光，脸、手和识别物清晰。背景：统一不透明暖浅灰纸底、极淡纸纹和脚下轻微接触阴影，无场景、无文字。排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词。不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、复杂山水建筑、分格或多视图。不要在眼角添加哥哥的黑痣、双人合影、鬼差帽、哭丧棒、白化病妆、长舌；不要将飞抓做成脱离身体的真实人手，不画黑沙掌烟雾或法阵。
```

## 排除项

- 不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。
- 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词。
- 不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。
- 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。
- 不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。
- 不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。
- 不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。
- 不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。
- 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。
- 不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、复杂山水建筑、分格或多视图。
- 不要在眼角添加哥哥的黑痣、双人合影、鬼差帽、哭丧棒、白化病妆、长舌；不要将飞抓做成脱离身体的真实人手，不画黑沙掌烟雾或法阵。

## 质检要点

- 眼角无哥哥黑痣，与常赫志仍然可辨为兄弟。
- 浅灰青衣色是原创区分，不能强行写成小说规定白袍。
- 收拢抓头与索圈有连接，不漂浮，不施放攻击。
- 无鬼怪符号，身体瘦长但不病态恐怖。
- 单人全身，掌形、抓头、双足完整。

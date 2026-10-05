---
asset_id: por_npc_huoayi__ch12_prime_alive_base
subject_id: npc_huoayi
name: 霍阿伊
book: ch12_shujian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch12/por_npc_huoayi__ch12_prime_alive_base.png
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


# 霍阿伊 · 《书剑恩仇录》（ch12）

## Gemini 提示词

> ART-cast-fill-b：复用主检出既有候选（保留原始输入记录）；实际提交文本如下。面容细节与衣饰补足为（原创扩展），原著细节沿用原稿（待考）边界。

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

CHARACTER AND STAGE: 霍阿伊 / npc_huoayi, por_npc_huoayi__ch12_prime_alive_base.
《书剑恩仇录》ch12，木卓伦之子、霍青桐与喀丝丽兄长霍阿伊。取回部会师、抗清军务的战死前阶段；第19回败讯确认战死的后续状态保留，不由这张在世像开启普通重邀。 本项目书界主线年代为1753–1759年、清乾隆；前史人物严格以其生前回忆阶段为准，不把回忆像当作现时活体。

AGE AND ORIGINAL FACE IDENTITY:
青壮男性prime；日晒肤色、肩宽腿长、腰背紧实，成熟青年武者而非父亲的中老年体态；无健美夸张。 独立宽颧、上脸较开阔而下颌收紧的青年成年脸；浓而平的黑眉、眉眼间距紧，正常大小的眼睛稍深、眼尾平直，目光坚定有责任感。鼻梁中高且宽直，鼻尖饱满、鼻翼适中，不夸张成族群标签；嘴宽中等、上唇略薄下唇有体积，唇角自然。短而整洁的络腮胡沿下颌长出，须发深色、皮肤日晒而健康，口鼻轮廓不被胡子覆盖。宽颧只是主稿家族美术关系，不复制父亲衰老脸或姐妹脸，精确五官为文字原创。

CLOTHING AND HAIR:
乾隆回疆骑行衣装：暗赤褐完整长外袍、靛青内衣、宽松长裤、窄皮腰带与平底软靴。外袍交叠或侧襟按地域常服简洁处理，闭襟得体，不套满洲宫廷马蹄袖和清军制服。低矮毡帽收住自然头发，侧后少量自然发束可见，不剃额、不机械配汉地后辫；无夸张羽饰。面料连续不透明，领肩腰腹遮蔽、少量宽缓褶，骑行开衩下有完整裤装，不破碎风化。

POSE, EQUIPMENT AND STRUCTURE:
正面稳立、两腿自然开立，头颈竖直、双眼水平看前方、下巴中性。穿着者左腰一柄普通地区微弧单刃腰刀完整入匹配足长刀鞘，柄格鞘同轴、两短挂带接皮带。背侧一只弓囊和一只短箭袋，承重背带与腰固定带真实相连；囊中弓的可见弧段、弦和箭尾分清，完整轮廓不过头或出框，不把弓弦画成飘带。左手轻扶胸前弓囊背带，右手空着垂在腰侧不遮刀柄；装备是骑战画像的原创可视化，不能冒称已核小说固定组合。无马匹、战场、清军棉甲、巨型神兵或战死伤口。

ORIGINAL CHARACTER COLOR AND LIGHT:
暗赤褐袍、靛青内衣和自然日晒肤色用低饱和暖冷层次表现；柔和左上漫射光保留宽颧、收紧下颌、平浓眉和短络腮胡。坚定成熟的青壮目光，不复制父亲衰老脸或姐妹面貌。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. FAST1 production: first generate ONE candidate. Request another only for a serious identity, structural or readability failure. Every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。唯一输入为不含人物的派生纯背景参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要史实将军补服、清廷棉甲制服、皇族冠饰或把回部人物统一剃额；不要马匹、战场、战死伤口；不要霍青桐翠羽黄衫、妹妹白裙或未经证实的巨型神兵。

FINAL POSE CHECK: 霍阿伊 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; No input supplies a face.
```

## 人物要点

| 项 | 内容 | 依据 |
|---|---|---|
| 身份与阶段 | 青壮男子，木卓伦之子、霍青桐与喀丝丽的兄长，取回部会师与抗清军务阶段，战死之前 | 名录本人物行；story/12 §3.7、§1.2 战事；chapters/12 §8.3 |
| 项目已登记事实 | 回部骑战与军务画像，第19回败讯确认战死；不得普通重邀 | 名录 / 章节 / 图鉴；玩法配置不等于原著装束 |
| 年龄与体貌 | 有勇气的回部青年武者，与父亲和姐妹协作；具体脸型、须发与兵器款式无可靠逐字材料 | 原著概括（待考）；名录年龄须与下文边界合读 |
| 服饰与发式 | 乾隆回疆骑行衣装，暗赤褐长外袍、靛青内衣、宽松长裤、窄皮带与软靴；低矮毡帽收住头发，侧后可见自然发束，不套汉地清俗剃额辫制；无夸张头羽 | tech/07 §2.7；经典锚点之外均（原创扩展） |
| 兵器与标志物 | 一柄普通地区腰刀完整入鞘，背侧挂弓囊与短箭袋，都是骑战画像的原创可视化；弓弦、弓身和箭尾结构清楚，无马匹 | 名录骑战画像；刀、弓箭具体组合为（原创扩展），原著惯用兵器（待考）；具体形制美术补足（原创扩展） |
| 气质与姿态 | 宽颧而下颌收紧、浓而平的眉、短络腮胡、日晒肤色，肩宽腿长、腰背紧实，约7.5头身；与父亲共享宽颧倾向但更年轻；两腿开立、一手扶弓囊背带、另一手垂于腰侧，微侧观察前方，勇健中有保护同伴的责任感 | 具体脸型、比例、神态落实与站姿（原创扩展） |

依据分层：项目事实只取上表归属文件；原著概括均保留（待考）；脸型细节、衣装选款、配色与摆姿不冒充原著明文。

阶段与年龄边界：青壮暂取 prime美术键；具体刀弓组合为原创设计，不把名录骑战自动当原著固定武器事实。

考据定位：《书剑恩仇录》三联/广州修订版，核对本条所选阶段的体貌、衣饰、兵器及出场先后；不据影视形象补证。

补充查证线索：无新增外部材料；依据以上仓库条目，指定版本逐字核对尚未完成。

参考与交付：frontmatter 列的是后续拟输入路径，本任务未调用出图；引用状态以该路径所在工作副本 manifest 的 status 为准。

规格边界：纸底候选按本任务保留不透明背景；tech/07 §1.3 的正式 RGBA 母版及 §5.2 后续处理另行验收，不把提示词 ready 当成图片获批。

## 提示词

```text
Use case: stylized-concept。Asset type: 《金庸群侠传·天书录》default 风格包，男性武侠人物单人全身立绘基础候选，目标 2048×3072、2:3 PNG。题材：霍阿伊，npc_huoayi；青壮男子，木卓伦之子、霍青桐与喀丝丽的兄长，取回部会师与抗清军务阶段，战死之前。书界：《书剑恩仇录》ch12_shujian，清乾隆，主线项目年代 1753–1759；前史人物以本条明确的回忆阶段为准。参考图：assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png（candidate，当前工作副本 manifest 尚未批准；仅拟参考纸底、光线、笔触与设色，不沿用面容、体型、服饰或道具）；它仅为后续生成时拟载入的同性别风格参考，本人物必须有独立的面容与身份。人物与经典锚点：有勇气的回部青年武者，与父亲和姐妹协作；具体脸型、须发与兵器款式无可靠逐字材料（原著概括，待三联/广州修订版逐字核对，待考）；宽颧而下颌收紧、浓而平的眉、短络腮胡、日晒肤色，肩宽腿长、腰背紧实，约7.5头身；与父亲共享宽颧倾向但更年轻（原创扩展的具体骨相与比例落实）。服装与发式：乾隆回疆骑行衣装，暗赤褐长外袍、靛青内衣、宽松长裤、窄皮带与软靴；低矮毡帽收住头发，侧后可见自然发束，不套汉地清俗剃额辫制；无夸张头羽（经典锚点之外的裁制、配色、饰件细节为原创扩展）；凡汉式交领均右衽，即穿着者左襟压右襟，不水平镜像。动作与兵器道具：一柄普通地区腰刀完整入鞘，背侧挂弓囊与短箭袋，都是骑战画像的原创可视化；弓弦、弓身和箭尾结构清楚，无马匹；两腿开立、一手扶弓囊背带、另一手垂于腰侧，微侧观察前方，勇健中有保护同伴的责任感（具体持法和站姿为原创扩展）；手物连接、兵器承重与悬挂点可信，器物端点完整，刀剑鞘足以容纳刀剑。构图：竖幅 2:3，单人完整全身，平视近正面轻侧、中性透视；人物占画高约 88–92%，头顶、双足、现存手部、兵器端点与衣带全部入画，四周留净空；尊重既有伤残，不补回缺失肢体。画法与光线：武侠，男性偏写实，真实骨相、自然不对称、皮肤与筋腱质感、可信年龄、布料纤维，细腻克制的手绘笔触，低饱和设色，自然衣褶与清楚剪影，柔和左上主光，脸、手和识别物清晰。背景：统一不透明暖浅灰纸底、极淡纸纹和脚下轻微接触阴影，无场景、无文字。排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词。不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、复杂山水建筑、分格或多视图。不要史实将军补服、清廷棉甲制服、皇族冠饰或把回部人物统一剃额；不要马匹、战场、战死伤口；不要霍青桐翠羽黄衫、妹妹白裙或未经证实的巨型神兵。
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
- 不要史实将军补服、清廷棉甲制服、皇族冠饰或把回部人物统一剃额；不要马匹、战场、战死伤口；不要霍青桐翠羽黄衫、妹妹白裙或未经证实的巨型神兵。

## 质检要点

- 青壮体魄与父亲中老年造型不同，亲缘线索仅为原创设计。
- 弓囊箭袋均有背带挂点，腰刀在鞘中，无悬空器物。
- 回疆地方衣装符合人物阵营，不能套清廷制服。
- 战死前在世，不能被当作终局后活体。
- 骑战只通过装备暗示，单人全身不加马匹。

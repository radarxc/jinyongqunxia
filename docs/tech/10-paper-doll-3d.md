# tech/10-paper-doll-3d · 3D 纸娃娃换装：模板素体、头身分离与装备贴合流水线（方案）

| 项 | 内容 |
|---|---|
| 文档 | `docs/tech/10-paper-doll-3d.md`（简称 `tech/10-dressup`） |
| 版本 | v1.1（2026-10-07，AR-102 / AR-103；AR-104 五项拍板已回写；AR-105：素体图走 agy、规范窄 A 改 25°、女中等底图定稿；模板路 A、男三型命名身高、允许 Blender 兜底、点数） |
| 上游基准 | `docs/decisions/author-requirements.md` AR-97 / AR-99（素体铁律与体型分型）、AR-100（Tripo 单连接队列）、AR-102（模板化、头身分离、三模板、骨架唯一、代码化成 Skill）、AR-103（方案 + spec 先行，代码交 traex） |
| 平行文档 | `tech/11-paper-doll-3d-impl-spec.md`（实现契约，与本文冲突处以本文 §6 的核验结论为准并回改 spec）、`tech/09-character-rig.md`（2D 分层 rig，仍是战斗主线）、`tech/06`（素材键与 manifest）、`tech/07`（出图管线）、`.claude/skills/tripo-web/SKILL.md`、`.claude/skills/gemini-imagegen/SKILL.md` |
| 本文职责 | 总体思路；作者 5 个问题的根因与解法；素体模板与头的定义；装备 3D 资产离线流水线；three.js 运行时；数据与 schema；按周落地计划；已核验 / 被驳倒 / 待实测断言；需作者拍板的开放问题 |
| 不在本文定义 | 物品属性与穿戴合法性（`design/10`）、战斗数值、具名 NPC 名录、出图提示词细则（进 Skill） |
| 标注约定 | 数值单位统一标注：**mu** = GLB 模型单位（Tripo 归一化，身体最长边 ≈ 0.98 mu）、**m** = 米、**px** = 像素；未在本机实测的标**（待实测）**；被对抗核验驳倒并改写的做法在 §6 列出 status 与 correction |

> **结论先行（TL;DR）**
>
> 1. 素体从"底座"改成"模板"：模板只到规范颈环为止；头是每个角色自己的资产；所有模板共用同一副新骨架（Tripo Humanoid·Mixamo 65 关节，一次绑骨、同源动画），构建期校验模型与动画骨架一致，不一致不进包。
> 2. 装备在中等模板上制作一次，离线贴合（对齐 → 权重转移 → 推离 → 遮罩 → 减面 → unlit 进包 → 门禁 → manifest），再按骨相对坐标 + 体表法向偏移重贴合到娇小 / 修长；武器、饰品挂蒙皮网格派生的插槽，发型、帽子贴规范颅骨表，与模板无关。
> 3. 运行时（three 0.186.1）只做四件事：共享骨架 bind（显式 bindMatrix）、插槽矩阵相乘、`_region` 位掩码隐藏身体区域、unlit 材质；不在浏览器里做任何几何计算；新代码进独立懒加载块 `render-dressup`。
> 4. 整条离线链是 Python（numpy / scipy）+ Node（three 自带 meshopt 解码 / 简化器），不依赖 Blender；写成 `.claude/skills/dressup-3d/SKILL.md` 可批处理命令手册。

---

## 目录

- [0. 一页总览](#0-一页总览)
- [1. 素体与模板](#1-素体与模板)
- [2. 装备 3D 资产生产流水线](#2-装备-3d-资产生产流水线)
- [3. 运行时（three.js）](#3-运行时threejs)
- [4. 数据与 schema](#4-数据与-schema)
- [5. 落地计划](#5-落地计划)
- [6. 已核验 / 被驳倒 / 待实测的断言清单](#6-已核验--被驳倒--待实测的断言清单)
- [7. 开放问题](#7-开放问题)

---

## 0. 一页总览

### 0.1 总体思路（8 条）

1. **唯一坐标系、唯一骨架**：换装只认新模板流水线产出的骨架（`tpl_f_medium/body.glb` 过渡期正本 = Tripo 原版 `anim_idle_walk_run.glb`，105,991 顶点 / 198,436 三角 / 65 骨 / rest = bind）。本地缝头版 `model_rig.glb` 与它是两次不同绑骨（RightHand 朝向差 2.57°、RightForeArm 9.41°、关节位置最大差 0.0158 mu ≈ 2.7 cm），不再作任何基准。
2. **头身分离**：模板 = 颈以下 + 规范颈环；头 = 角色资产（现有 NPC 整头含发切出复用、新角色由立绘出"头 + 颈桩"），颈口压到同一规范环，运行时按骨名绑到当前模板的 Neck / Head 骨。
3. **三套体型模板共享同一骨架命名、颈环、颅骨表、插槽名、区域编号与动作名**；不共享顶点、骨长、IBM 与装备 GLB。每角色 = 模板 + 头 + 肤色 + 发型 + 装备 + 可选 ±3% 骨长微调。
4. **装备在模板身上生成**：2D 装备图不再单独送 Tripo；先用 Gemini 在模板 A 字底图上做图像编辑（同人、同姿势、同构图、光头），过 2D 轮廓门禁后再花 65 点生成，使尺度 / 姿态在生成阶段就与模板一致。
5. **贴合全部离线、全部代码化**：对齐（关节级 Umeyama + 骨局部旋转复制）→ 权重转移（最近三角重心插值 + 置信筛选 + 拉普拉斯填充，按槽位限制关节集合）→ 带符号距离推离 ≥ 3 mm（每轮复查）→ 17 区遮罩统计 → 减面 / 2048² / unlit → `validate.py` 门禁 → `ingest.py` 入库。
6. **刚性件靠数据不靠手调**：`realSizeM` × 语义长度（PCA 主轴，不是 AABB 边）定尺度；锚点按类别（握点 / 绳顶 / 锥顶）移到原点；插槽由每个模板自己的蒙皮网格派生（握点 = 掌心核心顶点质心 + 法线外推），`socket.add(item)` 一次矩阵相乘。
7. **运行时极薄**：`createDressupActor` 加载模板 + 头 + 装备，共享一个 `Skeleton`（每次 `renderer.render()` 只上传一次 boneTexture），区域遮罩用 `_region` u8 顶点属性 + `uniform uint` 位掩码在片元 `discard`，材质统一 `MeshBasicMaterial + NoToneMapping`。
8. **门禁即完成定义**：穿透率、权重和、骨架一致、颈环一致、面数 / 贴图预算、`render-dressup` 体积、100 角色换装 CPU 门全部可执行；draft / approved 两级阈值避免阻塞提交。

### 0.2 作者 5 个问题 → 根因（本机量化）→ 解法

| # | 问题 | 根因（量化） | 解法 |
|---|---|---|---|
| 1 | 本地预览与 Tripo unlit 有差距 | 贴图已 delight（素体肤色均值 (0.857, 0.770, 0.684)，粗糙度 0.49），`scene.ts:84-120` 再用 ACESFilmic + 环境光 0.85 + 三盏方向光（2.2 / 0.95 / 2.2）二次打光；实测 ACES 对 unlit 贴图肤色 ΔE2000 均值 4.5、峰 8.3 | 进包统一 `KHR_materials_unlit` 并真删 normal / metallicRoughness 贴图（每件省 3~10 MB）；viewer `renderer.toneMapping = NoToneMapping`（与战斗 `model-stage.ts` 默认一致）；仍是 PBR 的旧资产运行时换 `MeshBasicMaterial({ map })`；可选 `onBeforeCompile` 半兰伯特包裹光 `mix(0.85, 1.0, ·)`。验收 ΔE2000 < 1.5（修复后贴图逐字节 0） |
| 2 | 素体与头发结合怪 | `hair_ponytail` 被归一化到 0.977 mu 高（= 整个人），页面 scale 0.30 后腔宽 0.06 mu < 头宽 0.097 mu；按包围盒中心（马尾中段，距发顶 0.49 mu）对齐；`hair_bun_fairy` 是带脸胸像（肤色顶点 13.1%） | 发型只贴**规范颅骨表**（`skull_profile_<g>.json`，Head 骨局部，每 5 mm 一行半径）+ 4 mm 余量；新发型在模板头近景底图上由 Gemini 画"同一人物梳 X 发型"再生成，腔体天然匹配；旧马尾按腔宽自动缩放 s ≈ 0.52 并把腔顶对齐 `headTop` 插槽；带脸胸像只能整头替换 |
| 3 | 衣服穿模且不随动 | 道具 GLB 全无 skin（`GLTFLoader` 报 Missing skinIndex → 退化为静态 Mesh）；`cloth_xianxia_dress` 是含颈桩 / 手 / 脚的整身实心人形，袖上沿 16.9° vs 模板手臂 47°，页面放大 1.25 挂 root；5 件衣服正面朝 ±X 而模板朝 +Z（90° 偏航） | 衣服作为 `SkinnedMesh` 共享模板骨架：离线权重转移 + 推离 + 遮罩；新衣由模板底图图像编辑生成，姿态差退化为 ≤ 3% 残差；身体被盖区域按 17 区位掩码 discard；宽袖长裙限制关节集合（Hips / UpLeg / Leg，禁 Foot / Toe） |
| 4 | 饰品缩放不对 | Tripo 把每件归一化到 AABB 最长边 ≈ 0.98 mu（有例外 0.952 / 0.898），玉佩 0.979 mu 高 ≈ 整个人；锚点在包围盒中心（绳中段） | `normalize_prop.py`：`realSizeM`（玉佩 0.20、斗笠直径 0.45~0.50、香囊 0.08、葫芦 0.22、折扇 0.32、佛珠周长 0.90）÷ PCA 主轴实测长 ÷ `mPerMu` 定缩放；锚点（绳顶 / 锥顶 / 环心）移到原点、up → +Y、front → +Z；插槽 `chest / neck / waistL / waistR / back / headTop` 从模板蒙皮网格外表面派生 |
| 5 | 武器放不进手 | 青锋剑斜置（主轴 (−0.36, 0.62, 0.70)，轴向全长 1.441 mu ≈ 2.46 m），页面按包围盒中心对齐，无握点概念；三段 Tripo 动画里指骨全程偏离 bind pose 47°~76°，bind 的张开手在运行时从不出现 | 离线 PCA 转正（柄 → 尖 = +Y，刃面 = +Z，握点 = 柄尾起 7% 处移到原点，`realSizeM` 1.0 → 缩放 ≈ 0.41）；模板侧 `gripR/L` = RightHand 权重 > 0.9 的掌心顶点质心 + 掌面法线外推 (0.0153 + 柄半径) mu，左右分别算不镜像；运行时 `socket.add(weapon)` + `gripRollDeg`；持械时在 `mixer.update` 后用 `fingerPose.fist` 覆盖 15 根指骨 |

### 0.3 两点追问的结论

**脸不一样怎么办**：模板永远只到规范颈环；脸是每个角色的头资产，入库时颈口被压到同一规范环、尺寸被归一到规范头尺寸（用"颈切面轮廓 ↔ 规范环"的相似缩放 + 脸高 ±8% 钳位，不用下巴→颅顶），运行时以 `inv(IBM_neck)` 为 bindMatrix 绑到当前模板骨架。模板共用与脸各不相同互不冲突，换装只碰颈以下；Gemini 出衣图时脸怎么漂都无所谓，因为衣图产出的网格只取颈以下。肤色以头为身份、身体迁就头：按头的 Lab 选模板皮肤 3 档变体（fair / medium / tan），余差用 `MeshBasicMaterial.color` 乘法补，颈带 8 mm 内贴图渐变。

**模板应有娇小 / 中等 / 修长三种**：女 `tpl_f_small` 1.58 m / `tpl_f_medium` 1.66 m / `tpl_f_tall` 1.72 m，男 `tpl_m_lean` 精悍 1.76 / `tpl_m_medium` 中等 1.81 / `tpl_m_bulk` 魁梧 1.86 m（AR-104 已定）。三套共享骨架命名顺序、规范颈环、颅骨表、17 区、插槽名、动作名；不共享顶点与骨长。生成方式按 AR-104 走**路 A**：中等模板以 25° 窄 A 光头底图一次生成，娇小 / 修长由分骨长度缩放 + LBS 派生（0 点、共拓扑、比例精确命中规格）；路 B（三张比例板各生成、腿型变体）留作魁梧型将军肚 / 粗四肢派生不像时的补救，届时另报点数。

---

## 1. 素体与模板

### 1.1 素体正本唯一（骨架唯一）

- 现状问题：工作区 `npc_zhujue__ch00_f_bald_base_body/model_rig.glb`（generator "Tianshu 3D Pipeline (User Selected Body Stitch)"，2 primitive、222,460 顶点、无动画）与 `anim_idle_walk_run.glb`（generator "Tripo"，1 primitive、105,991 顶点、三段动画）骨架不同：IBM 元素最大差 0.248、局部 rest 旋转最大差 20.9°（RightHandRing1）、骨长差达 8%（Neck→Head 0.0548 vs 0.0594 mu）。把 anim 的 clip 按骨名套到 model_rig 上，rest 帧顶点就偏 mean 0.81 cm / max 2.0 cm。
- 统一办法：**过渡期正本** = `assets/default/model3d/dressup/templates/tpl_f_medium/body.glb`（= Tripo 原版 anim 文件，sha256 前缀 647c674f，已随 tech/11 提交）；新模板到位后切换为各模板 `body.glb`。`normalize_rig.py` 做构建期校验：rest == bind（inv(IBM) 与节点世界矩阵差 < 1e-5）、模型与动画 `skin.joints` 名单与 IBM 逐元素一致（< 1e-5）、yaw 统一 +Z、丢弃 clip 里 65 条常量 `.scale` 轨道与 64 条非 Hips 常量 `.position` 轨道（保留 Hips 根运动）；不一致退出码 2、不进包。
- 缝头版的本地头雕（李一桐高模头）不作废：按 §1.2 切成 `head_zhujue_f` 头资产复用。

### 1.2 头身分离：规范颈环、规范头尺寸、肤色匹配

**规范颈环（`canon/ring_f.json` / `ring_m.json`，按规则从模板派生，不写常数）**
- 位置：在 Neck 骨局部系取垂直于 Neck→Head 轴的切面，高度取"切片 100% 由 Neck 主导且长宽比 < 1.3 的第一段"。正本实测该段在 Neck + 0.012~0.018 mu，半径 ≈ 0.026 mu（≈ 4.4 cm）。**不用** Neck + 0.006：那里 17%~36% 是肩顶点、长宽比 1.6~1.8，拟合圆 0.036 mu 比真实颈管大 38%（tech/11 §4 `neckRing` 字段按此回改）。
- 形状：64 点椭圆轮廓（女 a_x ≈ 0.028 / a_z ≈ 0.024 mu，男放大约 1.4 倍，实测一套再定），每点存位置、法线（径向 + 上翘 15°）、蒙皮权重（Neck 0.85 / Spine2 0.10 / 左右 Shoulder 各 0.025，按角度微调，64×4 直接存表）；再加一圈 +0.004 mu 唇环做法线过渡。
- 模板切身 `conform_ring.py`：在环高度切平面，切口顶点径向压到表值，切口下 15 mm 做 smoothstep 混合，权重覆盖成表值。头切口同一张表 → 同骨架 + 同 IBM 下 LBS 逐点结果一致，任何姿态缝闭合（gap 0）。
- 为什么必须有环 + 混合带：41 个绑骨 NPC 在 Neck 附近切片的半径差 2.7 倍，其中主要是衣领 / 缠头 / 披发 / Tripo Neck 关节 ±2~5 cm 放置抖动，真实皮肤颈半径女 0.024~0.027 mu、男 ≈ 0.035 mu（差 1.4 倍）。"直接对接"不可能，但环半径必须按性别从模板派生，否则会把乔峰的粗颈压成女素体的 0.026。

**规范头尺寸与颅骨表**
- 不做"下巴→颅顶"硬归一（40/41 个 NPC 颅顶被发髻 / 帽子盖住，HeadTop_End 28/41 悬空、13/41 埋帽，且 HeadTop_End 比网格顶高 0.038~0.051 mu 并前偏 0.042 mu）。归一化改为：① 以"头的颈切面轮廓 ↔ 规范环"求相似缩放（接缝按构造吻合）；② 用脸高（下巴→眼线）或双耳颞宽做 ±8% 校验钳位；③ 颅骨表 `skull_profile_<g>.json`（Head 骨局部，从下巴到颅顶每 5 mm 一行 x/z 半径，取自光头素体）只给发型 / 帽子贴合用，入库门禁：归一后颅骨轮廓相对表值 ≤ +3 mm，超出再缩 1~2% 并标 `wigFit: tight`。
- 头顶 / 头宽 / 头围全部从 Head 权重 ≥ 0.5 的顶点壳量（正本：头宽 0.0971、头深 0.1171、头围 0.3248 mu），写入 `skeleton.json.measures`。

**头资产的来源与存储**
- 现有 NPC 切头复用（0 点，`cut_head.py <npc_dir>`，约 30 s / 个，40 余个批处理）：
  1. 读其 `model_rig.glb`（Tripo 原版、rest == bind）；
  2. 在**头网格自身地标**切头：下巴最低点向下 Δ，或颈部最小周长环（内轮廓最小半径搜索）；不用各 NPC 旧骨架的 Neck + 常数（Tripo Neck 关节相对解剖位置抖动 0.020~0.076 mu，同一女主四个变体 Neck.y 差 ≈ 5 cm）；
  3. 领口检测：切面上方 20 mm 内非肤色像素占比 > 30%（HSV 肤色分类）则抬高切面到领上，或由 `loft_neck.py` 从规范环到下颌环程序放样 64×6 四边形颈套（贴模板肤色）；
  4. 归一（§1.2 头尺寸规则）→ 压环 + 混合带：带宽自适应 seam→chin−0.002 mu（不固定 15 mm）；5 份 seam→chin < 0.01 mu 的头（zhujue_f、xiaozhonghui、hufei、xiaolongnv、generic_m）单独处理或抬高切面；
  5. 权重重写：下颌线以上 Head 1.0，环上 15 mm 内线性过渡到表值；
  6. `skin_match.py` 取肤色、写 `bodyTintByTemplate`。
  这 40 个头都自带烘焙头发 / 帽子（整身 2k 贴图里脸只占 ~5%，纹素密度低），只能整头（含发）复用，锁 `hair` 槽（帽子按 `hairBaked` 走"头顶挂件不隐藏头发"路线），颈线以下披发会被截断。
- 新角色（65 点 / 人，`make_head_from_bust.py`）：
  1. `gemini-imagegen` 用定稿立绘出"光头头 + 颈桩"三视图（正 / 左 / 背，白底，颈到锁骨，无饰物；神态按 AR-69）；
  2. `check_bust.py` 三图头高一致 ±3%；
  3. Tripo `image_to_model`（先例：`.agents/coord/ART-3d-tripo-web/fresh_run/head_mesh_v20_true.glb`，Tripo 生成、142,490 顶点、3 张 2048² 贴图、仅头颈；多视图仅在正面单图脸部不对称时才用）；
  4. 后半段与 cut_head 相同（量头 → 归一 → 环 → 权重 → 肤色）。
  头单独出图把 0.98 mu 归一化全给了头，脸部纹素密度约为整身出图的 5 倍，也比"整身再切头"便宜（65 vs 85 点）。S 级可招募角色建议走此路（可换发型 / 帽子）。
- 主角：现 `model_rig.glb` 的本地缝头（李一桐高模头）直接切成 `head_zhujue_f`，charmhigh 同理。
- 存储：`assets/default/model3d/dressup/heads/<head_key>/head.glb` —— **存作者模板的蒙皮空间**（Y-up、脚底 y = 0，可直接预览、包围盒工具不误读），`fit.json` 记录 `neckFrame = inv(IBM_neck^作者模板)`；1 个 primitive、2048² 贴图、unlit；JOINTS 只引用 Neck / Head / Spine2 / LeftShoulder / RightShoulder 五根（骨名写 extras）；`manifest.yaml` 字段见 §4.3。头是独立 `SkinnedMesh`，1 个 draw call，任何模板通用。

**肤色统一（头是身份，身体迁就头）**
- `skin_match.py` 在头的颈带（环上 8 mm）与脸颊 UV 固定点取 Lab 均值，在模板皮肤区（手背 / 前臂 / 小腿 UV 固定点）取均值，算 `bodyTint`（线性 sRGB 逐通道，限 0.80~1.25）；模板皮肤贴图离线出 fair / medium / tan 三档（Pillow 按 L* ±8），入库按头的 L* 选最近档，余差运行时 `MeshBasicMaterial.color` 乘法（每实例克隆材质）。验收：接缝上下 10 mm 采样 ΔE2000 < 2。tint 消不掉晒色 / 腮红等纹理差，兜底是按头色重出皮肤贴图变体。

### 1.3 三种体型模板

| 模板 id | 身高 (m) | 骨盆高占比 Hips.y/H | 肩关节距 / H | 2D 板头身比 → 3D | 代表 |
|---|---|---|---|---|---|
| `tpl_f_small` 娇小 | 1.58 | 0.545 | 0.150 | 8.4 → 7.8 | 程灵素、苗若兰 |
| `tpl_f_medium` 中等 | 1.66 | 0.565 | 0.156 | 8.8 → 8.3 | 女主角、赵敏 |
| `tpl_f_tall` 修长 | 1.72 | 0.585 | 0.160 | 9.2 → 8.6 | 霍青桐、小龙女 |
| `tpl_m_lean` 精悍 | 1.76 | 0.535 | 0.195 | 8.4 → 8.0 | 令狐冲、杨过 |
| `tpl_m_medium` 中等 | 1.81 | 0.540 | 0.200 | 8.6 → 8.2 | 张无忌 |
| `tpl_m_bulk` 魁梧 | 1.86 | 0.525 | 0.215 | 8.0 → 7.6 | 萧峰、狄云 |

（41 个现有 NPC 实测骨盆高占比 0.52~0.59、肩关节距 0.134~0.203 mu，上表落在实测分布内。注意该比值是骨盆高占比，不是腿长占比。）

**生成（AR-104 定路 A；路 B 只作补救）**
- 路 A（**采用**；中等模板 65 + 20 点，派生 0 点）：中等模板以 25° 窄 A 光头底图生成（女底图 `por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png` 已由 agy 图像编辑定稿，男底图同法新出），中等模板一次 `image_to_model`（65）+ `rig`（20）+ `retarget`（0）后，娇小 / 修长由 `derive_template.py` 做分骨长度缩放（UpLeg / Leg / Foot、Spine*、Arm*、肩宽）+ LBS 派生：本机演示把 `temp_fresh_body.glb` 的腿骨按 k = 1.0816 / 0.9245 缩放后髋高比精确命中 0.5879 / 0.5567，各 1.5 s，顶点最大位移 0.037 mu、无 NaN。三套共拓扑、共骨架层级，`refit_template.py` 退化为同一组分骨变换。代价：只改骨长不改围度，是"拉伸的同一个人"。
- 路 B（补救，不默认；AR-99 腿型体块）：`make_template_plate.py` 以 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png` 为唯一底图，脖子线以下按目标骨盆高占比纵向重采样（复用 `stretch_apose.py` 逐行拉伸）、肩宽横向重采样，出 3 张板；Gemini 在板上只改腿型（筷子腿 / 猎豹腿）出 frail / martial 两变体；`check_plate.py` 门禁：头顶 / 脚底 y 偏差 < 2%、臂张角与底图差 < 3°、跨度 / 身高比差 < 3%，不合格 0 点重出。Tripo：martial 板 `image_to_model` × 3 → `rig` × 3 → `retarget` → `exportGlb`；frail 变体只生成不绑骨，`transfer_rig.py` 从同模板 martial 取权重。生成后**必须**再跑 `fix_proportion.py`（同路 A 的骨长校正）把关节比例收敛到规格表 —— Tripo 同图重跑尺度自动一致（高 0.98 ± 0.3%）但比例离散约 1%（同图）/ 髋 ±2%（同构图微调），multiview 重建可差 −5.4%；校正量 > 8%（顶点位移 > 0.04 mu）才重出。
- 共同后处理：`normalize_rig.py`（§1.1 校验 + yaw + 丢轨道 + Head/Neck 关节平移归一并重算这两根 IBM）→ `conform_ring.py` 切颈压环 → `export_skeleton.py` 出 `skeleton.json`（65 关节 bind 世界 / IBM、从蒙皮网格量的地标与插槽、17 区、颈环 sha、颅骨表引用、`heightMu` 实测 / `mPerMu`）→ `ingest.py --category model3d-template`。

**三套共享什么**：骨名与顺序（装备 GLB 的 JOINTS 下标按模板打包，骨名用于校验与运行时重映射）、规范颈环表（按性别）、规范头尺寸与颅骨表、17 区编号、插槽名集合、动作名 idle / walk / run（各模板自己同源 clip）。**不共享**：顶点拓扑（路 B）、骨长、IBM、插槽数值、装备 GLB。

**每角色微调（±3% 骨长）**：数据 `avatar3d.boneLengthTweak`（只允许 UpLeg / Leg / Spine1 / Spine2 / Arm / ForeArm，左右对称，0.97~1.03）。运行时**不用** `bone.scale(1,s,1)` + 子骨 `(1,1/s,1)` 补偿（已驳倒：动画里膝 / 肘弯曲时 S·R_c(t)·S⁻¹ 使小腿缩短 2.9%、整条子树非刚性 3%，且 mixer 的 scale 轨道每帧把它复位）。改为两种之一：① `child.position.y *= s`（真改骨长，任何姿态 0 剪切，父段皮肤差值集中在关节混权区）；② 父骨 `scale.y = s` + 父子之间插一个普通 `Object3D`（position = 子骨 rest 偏移，scale.y = 1/s，子骨 position = 0），实测 run 片段膝→踝 0.2198 mu 恒定、非正交 0.00°。前提都是 `normalize_rig.py` 已剥掉 clip 的 scale 轨道与非 Hips position 轨道。比例差 > 3% 不靠微调，换模板。

---

## 2. 装备 3D 资产生产流水线

目录 `tools/model3d/dressup/`（Python 3.11 numpy 2.4 / scipy 1.17 / Pillow + Node 22；不装 Blender、不装新 pip 包；Node 只允许新增 devDependency `meshoptimizer`）。全链走 `.agents/coord/tripo_q/queue.json` 队列（AR-100）投递。

### 2.1 出图规范（以模板图为底做图像编辑）

- 输入：2D 装备图（`assets/default/item/<类>/`，共 1,009 张）+ 当前模板的 A-pose 板（光头、裸足、薄裹胸三角裤）。
- Gemini 提示词固定模板："同一人物、同一站姿、同一构图（头顶 / 脚底像素位置不变）、光头、白底，穿上〈装备图〉；手露出袖口；裙摆离地可见鞋；领高不超过颈根"。规范 A 字张角 **25° ± 3°**（AR-105 由 AR-104 的 30° 改定；窄 A：束袖、直筒裙、双臂展开、空手）；现底图 39°~43° 宽 A 只作过渡期正本，六张模板板与所有衣图统一 30°。
- `check_plate.py` 2D 轮廓门禁（Pillow 前景分割 + 轮廓叠加）：头顶 / 脚底 y 偏差 < 2%、脸 / 手 / 脚轮廓 IoU ≥ 0.9、跨度 / 身高比与板差 < 3%、臂上沿角与板差 < 3°（模板板本身另验绝对角 25° ± 3°）；不合格 0 点重出。此门禁的职责是保证姿态 / 轮廓 / 绑骨前提，不指望它控制 Tripo 的 ~1% 比例抖动。
- 注意：画布留白不影响 3D 尺度（bald 底图人物占画幅 89.6%，charmhigh 占 96.6%，3D 高度都是 0.98 mu）；`SKILL.md:282`"男主减少留白让男高于女"在 3D 上无效，男高于女只能靠 `heightM`。

### 2.2 Tripo 生成与绑骨选型

- 单图 vs 多视图：仙侠女装 / 长发走**单图 A-pose `image_to_model`**（技能 §1.5 选型矩阵；多视图 Front 与 Left/Right 有 5°~10° 透视偏差，Visual Hull 削面颊；同角色 multiview 髋 −5.4%、脚踝 −21.6%）。多视图只在正面单图脸部不对称时用。
- 整身绑骨路线（衣图 → 整身 → `rig` 20 点）：目的不是用它的骨架，而是拿到 Hips / Spine* / Neck / 双肩 / 双膝 / 双踝 等 ≥ 6 个关节做关节级 Umeyama（可判镜像）只消全局差，再按骨复制局部旋转到模板 rest（`SkeletonUtils.retarget` 语义）消姿态差；腕 / 脚残差单独报告不卡。已有同管线样本（charmhigh / 阿青）经 Umeyama 后腕残差 6~9%（10~15 cm），主因是臂张角不一致（43° vs 18~30°）和 Tripo 头部放大 4~15%，这正是 §2.1 统一张角的理由。
- "合体上传整体绑骨再按坐标取回权重"（20 点）：把模板（≤ 7 万三角）+ 对齐后的衣服（减到 ≤ 3 万三角，网页绑骨上限 10 万面）合成一个 GLB（两者不连通、同尺度同姿态），经 Studio 上传 / API `file_token` → `rig`（Humanoid Mixamo）→ 导出；Tripo 绑骨保留顶点集合（最近点最大差 1.9e-4 mu）但打乱顺序，按位置最近匹配取回衣服 JOINTS / WEIGHTS，骨名重映射后绑回模板骨架（每次是新骨架，只复用权重）。官方文档化的同类路径是"先 `segment`（`split_by_connectivity` 或 `ref_image`）→ `rig` → `convert`（`with_animation=true`, `part_names`）"。两者都是复杂套装（宽袖长袍、全身甲）的兜底，**不作默认**。
- `segment v2`（40 点）是否保留 skin / 独立 node / UV：**需实测**，第一周可选项；失败则挂件改走"单独出图 + realSizeM + socket"。

### 2.3 离线贴合（`fit_garment.py` / `fit_hair.py`）

1. 解压：`meshopt_decode.mjs`（three 自带 `meshopt_decoder.module.js`，0.11 s / 件）；Tripo `_raw.glb` 是 gltfpack 1.2 产物（`KHR_mesh_quantization + EXT_meshopt_compression`）。
2. 对齐：有 Tripo 骨架 → §2.2 关节级 Umeyama + 骨局部旋转；无骨架 → 语义锚点（颈桩顶 → 规范环中心高度、脚底 → y = 0、水平 PCA 宽度轴对齐 X、按高度缩放），残差写 `fit.json.align`。Umeyama 强制 det = +1，关节左右误标即 180° 错转，要用 ≥ 6 个对称关节并校验镜像。
3. 删衣内假人（可选）：与模板体表距离 < 1 mm 且法线反向的三角；领口 / 袖口会露背面 → `doubleSided: true` + 贴图边缘 1~2 px 收缩。
4. 权重转移：每顶点找模板最近三角（`cKDTree(workers=-1)` k = 16 质心候选 + 精确点-三角；300 样本抽查 100% 命中真最近三角，k = 8 最大差 0.19 mm）→ 重心插值 4 骨权重；高置信 = 距离 ≤ 5% 对角线且法线夹角 ≤ 30°，其余按邻接拉普拉斯扩散；**按槽位限制关节集合**（body 裙摆：Hips / UpLeg / Leg，禁 Foot / Toe —— 否则 21.3% 裙摆顶点主导骨是脚；袖：Shoulder / Arm / ForeArm / Hand；hair：Head / Neck / Spine2）；离体表 > 10 cm 的裙摆按"到关节线段距离"混合（Hips 为主、腿骨渐变）；归一化 ≤ 4 骨。
5. 推离：带符号距离（最近体表点连线 · 插值法线）< 3 mm 的顶点沿体表法线推到 +3 mm，**每轮推完重跑一次最近面复查**，迭代到 inside = 0（原型写法三轮后正本仍残留 236 顶点，必须按复查迭代），位移做拉普拉斯平滑并检查翻面（原型曾出 1,005 个翻面三角、703 条边拉伸 > 5×）。
6. 遮罩统计：对每个 region，模板三角"质心到衣面 ≤ 15 mm 且法线同向且沿法线射线先打到衣服"三条件占比 > 0.65 → `hideRegions`；`neverHide = [handL, handR, footL, footR]`；可人工覆盖。
7. 裙摆 / 宽袖 / 披风特殊处理：阶段 A 只靠关节集合限制 + 推离；弹簧链（自写 verlet ≤ 6 节 + 头 / 肩 2~3 颗碰撞球，≈ 3 KiB）留 Phase B+；运行时裙摆随腿骨变形"不穿模但不真实"是接受的代价。

Blender（AR-104 允许）：只作对照 / 兜底（切头布尔、高质量减面、Data Transfer 权重对照），需要时 `brew install --cask blender` 或 `pip install bpy`，主链不依赖。

耗时（M2 Pro，158,875 顶点原始裙子，缝头版素体 406k 三角）：权重转移 2.4 s（`workers=-1`；单线程 6.9 s）、遮罩 2.0 s、每轮推离 + 复查 2.1~3.4 s × 3、写回 0.12~0.34 s；单件 ≈ 10~12 s；减面到 ≤ 3 万三角后 ≈ 1~3 s。备选：bpy 4.5.14 已可 pip 装（草稿区 venv 已验证 Data Transfer 转权重 0.9 s），但 AR-102 定不依赖 Blender，只作对照。

### 2.4 跨模板重贴合（`refit_template.py <prop> --from tpl_f_medium --to tpl_f_small,tpl_f_tall`）

1. 源模板逐顶点编码：取权重前 2 骨 (b1, b2)，在骨局部系记录 (p_local_b1, p_local_b2)（沿骨轴分量 ÷ 骨长，径向分量 ÷ 该高度处源体表平均半径 r_src(h)）；再记录到源体表的带符号距离 d 与最近点法线。
2. 解码到目标模板：用目标骨长与 r_dst(h) 反算，按权重混合得 v'；|d| < 0.05 m 的贴身件投影到目标体表最近点再沿目标法线偏移 d；|d| ≥ 0.05 m（裙摆、披风、宽袖）只做骨相对缩放。路 A（共拓扑）下此步退化为同一组分骨变换。
3. 重跑 §2.3 第 4~6 步（目标模板取权重、推离、遮罩）→ 减面 → 打包。
4. 门禁用目标模板**自己同骨架**的 clip（§2.6），不跨骨架套 clip。
5. 产物 `assets/default/model3d/dressup/garments/<id>/<id>.<template>.glb`，manifest `fits:` 记录每模板报告与状态；预判会失败的类别（全身甲、宽袖长袍、拖地裙、腰封贴将军肚）或门禁不过的件，在目标模板板上重画重生成（65 点）走源链；首批 16 件按 30% 兜底估 ≈ 620 点。
6. 恒等回归：from == to 时输出与输入最大位差 < 1e-6。

### 2.5 刚性件归一化（`normalize_prop.py`）

`--class weapon|hat|pendant|pouch|fan|scroll|beads|gourd|generic --real-size-m <m> [--size-axis length|width|height] [--flip] [--grip-ratio 0.07] [--keep largest|all]`：连通块统计（匕首 + 鞘、香囊 + 穗、金球 + 小件是多块）→ PCA 主轴 → +Y；weapon 柄端由剖面宽度判定、握点移原点、刃面 → +Z；hat 锥顶 → 原点、开口 −Y；pendant / pouch 绳顶 → 原点；`scaleApplied = realSizeM / (measuredLengthMu × mPerMu)`，`measuredLengthMu` 取主轴 / 语义长度而非 AABB 边。输出顶点已变换的 GLB（节点无 TRS）+ `fit.json`。

### 2.6 减面、unlit 进包与门禁

- `textures.py`：baseColor ≤ 2048² JPEG q85（现有道具是 8192² + 4096² ORM + 4096² 法线，9~22 MB / 件，体积大头是贴图）；真正从 BIN 删除 normal / metallicRoughness 的 texture / image / bufferView；加 `KHR_materials_unlit`。
- `pack_glb.mjs --simplify`：用 `three/examples/jsm/libs/meshopt_simplifier.module.js`（`simplifyWithAttributes` 只重建索引不改顶点，属性天然保留；JOINTS / `_REGION` 不作误差通道，用 `vertex_lock` 锁颈环与区域边界，`LockBorder`），目标三角：模板 ≤ 8 万、衣物 ≤ 3 万、发型 ≤ 2 万、小件 ≤ 1 万；再 meshopt 编码（`npx -y --registry=https://registry.npmjs.org/ @gltf-transform/cli@4.5.1 meshopt` 或 devDependency `meshoptimizer`）。注意 `node_modules/.pnpm/meshoptimizer@1.1.1` 只是 `@types/three` 的传递依赖，工作区包不能直接 import。meshopt 量化会让 `scene.ts` 用裸 `geometry.boundingBox` 算的身高变成 2.0 → 改用 `SkinnedMesh.computeBoundingBox()` 或关节坐标后再对蒙皮件做 meshopt。
- `validate.py` 门禁 → `report.json`（阈值见 tech/11 §6）：骨架一致（装备 `skin.joints` == 模板、IBM 差 < 1e-5）；权重和 1 ± 1e-3、≤ 4 骨、⊆ `jointsAllowed`；穿透：对模板 idle / walk / run 各采 24~30 帧 LBS（同骨架直接用模板 clip，姿态代码路径与运行时一致），装备顶点带符号距离 < −1 mm 占比 approved ≤ 0.5% / draft ≤ 2%（跨模板 ≤ 1%）；bind 姿势残留 0；贴身区 d 的 p90 与源差 < 5 mm；翻面 0；边长比 [0.7, 1.4] 内三角 ≥ 99%；颈环 / 手 / 脚区不得被遮罩；道具锚点 |pos| < 1e-4 mu、主轴 +Y、尺寸与 realSizeM 差 ≤ 2%；面数 / 贴图预算。level → status：approved → `candidate`（待作者看图）、draft → `draft`、fail 不入库。
- `ingest.py --category model3d-template|model3d-head|model3d-prop|model3d-garment`：写 `manifest.yaml`（字段见 §4.3），构建期 `apps/game/build/dressup-assets.ts` 按 `status != rejected` 复制 glb / fit / report 到 `apps/game/public/assets/default/model3d/dressup/…`。

### 2.7 Skill 手册（`.claude/skills/dressup-3d/SKILL.md`，作者原话"装备贴合这些都要代码化，写成 skill"）

手册按"一件装备从 2D 图到进包"的顺序列命令，每条命令必须 `--help` 可核对、退出码有含义（0 通过 / 2 校验失败 / 3 门禁 fail），并与 `tripo-web`（队列投递、点数）与 `gemini-imagegen`（出图）两个 Skill 衔接：

| 步骤 | 命令（示意） | 产物 | 点数 |
|---|---|---|---|
| 1 出板 | `python3 tools/model3d/dressup/make_template_plate.py --template tpl_f_medium --out plates/` | A-pose 板 + 期望比例 json | 0 |
| 2 出衣图 | `gemini-imagegen` 队列，提示词模板 §2.1 | `plates/<id>.png` | 0 |
| 3 2D 门禁 | `python3 … check_plate.py --plate plates/tpl_f_medium.png --image plates/<id>.png` | `plate_report.json`（y 偏差、IoU、跨度比、臂角） | 0 |
| 4 生成 | `tripo_q` 任务类型 `garment`（`image_to_model` → 可选 `rig` → `exportGlb`） | `<id>_raw.glb` | 65（+20） |
| 5 解压 | `node … meshopt_decode.mjs <id>_raw.glb` | `<id>.decoded.glb` | 0 |
| 6 体检 | `python3 … inspect.py --json <id>.decoded.glb` | 节点 / 骨架 / 包围盒 / 连通块 / 姿势角 | 0 |
| 7a 贴合（衣 / 发） | `python3 … fit_garment.py --kind garment --slot body --id <id> --body templates/tpl_f_medium/body.glb --skeleton …/skeleton.json` | `<id>.glb` + `fit.json` | 0 |
| 7b 归一（刚性件） | `python3 … normalize_prop.py --class weapon --real-size-m 1.0 --grip-ratio 0.07` | `<id>.glb` + `fit.json` | 0 |
| 8 跨模板 | `python3 … refit_template.py <id> --from tpl_f_medium --to tpl_f_small,tpl_f_tall` | `<id>.<tpl>.glb` + fits | 0 |
| 9 减面 / 贴图 / unlit | `python3 … textures.py` → `node … pack_glb.mjs --simplify 0.1` | 进包 glb | 0 |
| 10 门禁 | `python3 … validate.py --template tpl_f_medium <id>.glb` | `report.json` | 0 |
| 11 入库 | `python3 … ingest.py --category model3d-garment <dir>` | `manifest.yaml` | 0 |
| 12 验证 | `pnpm check`；浏览器 `/character-3d` 换装 v2 截图 | — | 0 |

模板 / 头的两条支线（`normalize_rig.py`、`conform_ring.py`、`export_skeleton.py`、`cut_head.py`、`make_head_from_bust.py`、`skin_match.py`、`derive_template.py` / `fix_proportion.py`）同样逐条列入手册；`tripo_q/queue.json` 新增任务类型 `template`（generate → rig → retarget → export）与 `head_bust`（generate → export），`tools/imagegen/tri_pipeline_runner.mjs` 识别后自动调用后处理脚本。手册验收：按 SKILL 从零重跑一件道具能复现 `report.json`（tech/11 §10 C）。

---

## 3. 运行时（three.js）

### 3.1 模块与职责（`packages/render/src/dressup/`，懒加载块 `render-dressup` ≤ 24 KiB gz）

| 文件 | 职责 | 不做 |
|---|---|---|
| `types.ts` | `skeleton.json` / `fit.json` / `report.json` 的 TS 类型 | 运行时校验（交 data 包 Zod） |
| `skeleton-frame.ts` | 读 `skeleton.json`，`getSocket(name)`、区域表、指骨姿势 | 几何计算 |
| `materials.ts` | PBR → `MeshBasicMaterial` 替换与 dispose、`toneMapped`、肤色 tint、可选半兰伯特、`_region` 遮罩注入与 `customDepthMaterial` | 灯光 / 阴影决策 |
| `body-rig.ts` | 加载模板 `body.glb` + 同源 clip；`SkeletonUtils.clone` 后合并为一个 Skeleton；按 `heightM / heightMu` 缩放根节点、脚底 y = 0、面朝 +Z | retargetClip |
| `head.ts` | 头 GLB 加载、骨名重映射、`bind(skeleton, inv(IBM_neck^目标) · IBM_neck^作者)`、tint 下发 | 颈缝几何修补（离线已做） |
| `bone-tweak.ts` | `boneLengthTweak` → 子骨 position / 辅助节点；在 clone 之后、首次 `skeleton.update` 之前施加 | bone.scale 配对法 |
| `equip.ts` | `applyLoadout({slot → key})` 增量 diff；按当前模板解析 `fits` 变体；skinned 件重映射 + bind；rigid 件 `socket.add` + `gripRollDeg`；卸下 dispose | 判定可穿（core） |
| `finger-pose.ts` | 持械时在 `mixer.update` 后覆盖该手 15 根指骨 | 进 core |
| `actor.ts` / `runtime.ts` | `createDressupActor` 装配；`runtime.ts` 是唯一 `import()` 入口 | 被 `packages/render/src/index.ts` 静态 re-export |
| `performance.test.ts` | 100 角色 × 平均 4 件的 `skeleton.update` + 插槽更新 P95 门，进 `pnpm check:perf` | 高负载跳过 |

API 见 tech/11 §8（`setBoneScale` 改名 `setBoneLength`，注释改为"子骨 position 偏移 / 辅助节点"，精度口径"任意姿势 0 剪切"）。战斗侧 `model-stage.ts` 的 `loadPilotModel` 改为 `createDressupActor`（投影给 `avatar3d + equipped + heightM`）；预览页 `Character3dPage.vue` 的逐件 scale / offset / rotation 常量全部删除，改读 manifest；`character-viewer/scene.ts` 身高改读 manifest `heightMu`。

### 3.2 关键机制（均来自核验）

- **共享骨架 bind**：装备 `SkinnedMesh` 的 `skinIndex` 按清洗后骨名（`mixamorig:Hips` → `mixamorigHips`，`PropertyBinding.sanitizeNodeName`）重映射到模板 `skeleton.bones` 下标（JOINTS u8，缺骨权重清零 + `normalizeSkinWeights`，重映射前 clone 属性），`mesh.bind(body.skeleton, bindMatrix)` **必须显式传矩阵**：无参 `bind` 会 `calculateInverses()` 原地改写共享的 `boneInverses` 数组（实测素体顶点漂 10.98 m），`Skeleton.clone()` / `SkeletonUtils.clone()` 与正本按引用共用该数组，任一克隆体无参 bind 都污染正本；要隔离用 `new Skeleton(bones, src.boneInverses.map(m => m.clone()))`。bindMatrix 只能是相似变换（旋转 + 平移 + 均匀正缩放，det > 0）：`skinnormal_vertex` 对法线不做逆转置，非均匀缩放 y×1.15 法线偏 8°，镜像时绕序翻转不补偿。装备 / 头必须挂在角色 root 内（视锥剔除用首次 `computeBoundingSphere` × matrixWorld，挂在外面角色走到 30 m 后被剔除），bind 后 `mesh.updateMatrixWorld(true)` 再做 CPU 侧查询。
- **头绑定**：`bindMatrix = inv(IBM_neck^目标) · IBM_neck^作者模板`（头 GLB 存作者模板蒙皮空间），**绝不用**运行时 `neck.matrixWorld`（viewer 把模型缩到 1.68 m 并居中，误差 ~1 m）。前提：所有模板 Neck / Head 的 bind 坐标系一致，由 `normalize_rig.py` 的 Head / Neck 关节归一 + `ringSha` / `skeletonSha` 门禁保证（同一素体两次 Tripo 绑骨 Neck 朝向可差 4°、头顶偏 1.8 cm）。
- **战斗实例化**：`SkeletonUtils.clone` 会给每个 `SkinnedMesh` 各自 `skeleton.clone()`，破坏共享（每帧 update 次数 = primitive 数 + 装备数）；clone 后遍历取第一个 skeleton，其余 `mesh.bind(shared, mesh.bindMatrix)` 合并，`model-stage.ts:124` 的 `cloneSkeleton` 路径按此改。"每帧一次"精确说是每次 `renderer.render()` 一次（含阴影 pass）。
- **插槽从蒙皮网格派生**：`skeleton.json.sockets`（握点 / headTop / headCenter / neck / chest / back / waistL / waistR / footL / footR）建成挂在对应 Bone 下的 `Object3D`（`matrixAutoUpdate = false`）；prop 矩阵 = socket · `gripAdjust`；offHand 走 `gripL`（左右分别量：腕→中指根右 0.0633 / 左 0.0596 mu，不镜像）。不用 `HeadTop_End`；不用关节距（LeftArm 关节埋皮下 0.040 mu，皮肤肩宽 0.255 mu 而非关节距 0.153）。
- **手指握持覆盖**：三段 clip 都带 40 根指骨轨道（首帧偏离 bind 50~77°，三段各不相同）；持械时对该手 15 根指骨在 `mixer.update` 之后写 `fingerPose.fist` 四元数（或从 clip 剔除这些 track），否则兵器被各片段不同的手指穿过 / 离开（指尖相对 rest 漂 3.7~8.3 cm）。
- **身体区域遮罩**：GLB 写 `_REGION`（u8 SCALAR，glTF 规范禁止 uint32 顶点属性），three 载入后叫 `_region`、`gpuType` 为 Float；shader：`attribute float _region; flat varying uint vRegion; vRegion = uint(_region + 0.5);` 片元 `uniform uint uHideMask; if ((uHideMask & (1u << vRegion)) != 0u) discard;`（≤ 32 区；超出用 uvec4）。区域边界要在导出时沿边界拆点使每个三角三顶点同 ID（flat 由 provoking vertex 决定）。固定 `customProgramCacheKey`；`customDepthMaterial` 同样注入或素体 `castShadow = false`（阴影 pass 不跑 `onBeforeCompile`）；加载后断言 `geometry.attributes._region` 存在。draw call = 素体 primitive 数（正本 1）× (1 + 投影灯数)，与隐藏组合无关；每件装备各 +1。
- **unlit 一致性**：`KHR_materials_unlit` → `MeshBasicMaterial` 仍受 `renderer.toneMapping` 影响（`WebGLPrograms.js:179`），优先整场景 `NoToneMapping`（战斗默认即此，预览页是全仓唯一开 ACES 的地方）而非逐材质 `toneMapped = false`（会让 PBR 底座与 unlit 角色割裂）；渲染到 RenderTarget 时不做色调映射，日后接 `OutputPass` 要在它上面设。PBR 旧资产过渡做法：运行时换 `MeshBasicMaterial({ map })` 并 dispose 旧材质；或保留 PBR 只留 `AmbientLight(0xffffff, Math.PI)`、去平行光、metalness 0（结果 ≈ 0.96 × albedo，ΔE2000 ≈ 0.9），便于日后加体积光。"关阴影 / 强光"对 unlit 是空操作，不作前提。量化用画布像素（`preserveDrawingBuffer: true` 已开）在同一脸部 UV 块取均值算 ΔE2000，不用 OS 截图。
- **骨长微调**：§1.3 的 ① / ②；在 `SkeletonUtils.clone` 之后、第一次 `skeleton.update` 之前施加；`normalize_rig.py` 已剥 scale 轨与非 Hips position 轨，否则 `play()` / 交叉淡入 / `stopAllAction` 会把 tweak 静默复位。
- **分块**：当前分块由 `apps/game/build/content-plugin.ts` 的 `configureBattleModelChunks`（Rolldown `codeSplitting.groups`，`includeDependenciesRecursively: false`，`battleModelLazyChunk(id) ?? manualChunks(id)`）决定，vite `manualChunks` 只是兜底且 Rolldown 在两者并存时忽略它。新增 `dressupLazyChunk(id)` 把 `packages/render/src/dressup/**` 及新引入的每个 `three/examples/jsm/**` 路径逐个列入 `render-dressup`；`GLTFLoader` / `SkeletonUtils` / `BufferGeometryUtils` 已在 `battle-model3d`，允许静态依赖它。three 核心新用到的导出（Raycaster / Triangle 等）会被 tree-shaking 留在急加载的 `render` 块里（实验：仅 OrbitControls + meshopt_decoder ≈ 11.3 KiB），render 主块现 174.4~175.0 KiB / 180（余 ≈ 5 KiB，"0.58 KiB"是旧数），所以换装运行时只用 render 块里已存在的 three 核心 API，每次 `pnpm size` 前后对比 render 行。门禁三处一起改：`tools/perf/check_size.mjs` 加 `appendRenderLazyRecord('render-dressup', findManifestChunk('render-dressup', { sources: ['packages/render/src/dressup/runtime.ts'], manifestNames: ['render-dressup'] }))`（扣除 render 与 battle-model3d 已计闭包）、`check_size.test.mjs` 加"缺块即失败"夹具、`budgets.json` 加 `"render-dressup": 24`；`content-plugin.test.ts` 加分块断言；入口只能 `import()`，`packages/render/src/index.ts` 只 `export type`；`vite.config.ts` PWA `globIgnores` 加 `**/assets/render-dressup-*.js`（否则 SW 首装预缓存）。
- **性能**：共享 Skeleton 每次 render 一次 `computeBoneTexture`；n 件装备 n draw call；热路径零分配；新增 `packages/render/src/dressup/performance.test.ts`（100 角色 × 平均 4 件 `skeleton.update` + 插槽更新 P95 上限，进 `pnpm check:perf`），因为现有 rig 100 角色门只测 2D，3D 换装目前没有门。

---

## 4. 数据与 schema

### 4.1 角色 = 模板 + 头 + 肤色 + 发型 + 装备（`packages/data/src/schemas/avatar3d.ts`，Zod strictObject）

```ts
Avatar3dSchema = {
  template: enum['tpl_f_small','tpl_f_medium','tpl_f_tall','tpl_m_lean','tpl_m_medium','tpl_m_bulk'],
  legs: enum['frail','martial'],                       // 路 A 下只有 martial
  head: string /^head_[a-z0-9_]+$/,                     // 头资产键，必填
  skin: { mode: 'auto' } | { mode: 'override', tint: [r,g,b] 0.8~1.25 },
  hair?: string /^hair_/,                               // head.hairBaked 为 true 时禁止（内容校验报错）
  boneLengthTweak?: record(enum['UpLeg','Leg','Spine1','Spine2','Arm','ForeArm'], number 0.97~1.03),  // 子骨 position 语义
  fitVersion: int                                       // 算法版本，升级时强制重跑校验
}
```

- 挂点：`NpcAppearanceSchema`（`character.ts`）加可选 `avatar3d`；主角 / 可换装队友在 `role-slot.ts` 与存档存同一结构；装备槽仍由 `EquipmentSlotSchema`（11 槽）决定 `equipped: slot → itemId`。core 投影只透传 `{ avatar3d, equipped, heightM }`，不判断素材存在性；ui 只发 `equipItem` 意图；render 通过 `item.assets.model3d` 查素材键。
- 默认表 `content/avatar3d-defaults.yaml`：按 AR-99 代表人物给模板 / 腿型初值，具名 NPC yaml 可覆盖。

### 4.2 `item.assets.model3d`（`packages/data/src/schemas/item.ts`，与现有 `assets.model` 字符串并存，不复用）

| 字段 | 类型 / 取值 | 说明 |
|---|---|---|
| `key` | string | 素材键 → `public/assets/default/model3d/dressup/<kind>s/<key>/<key>[.<template>].glb` |
| `kind` | `'garment' \| 'hair' \| 'prop'` | 蒙皮件 / 发型 / 刚性件 |
| `socket?` | `gripR \| gripL \| headTop \| headCenter \| neck \| chest \| back \| waistL \| waistR` | prop 必填 |
| `scaleRule` | `identity \| realSize \| headWidth \| headCircumference \| shoulder` | 纯函数 `scaleFor(rule, measured, skeleton.measures)` |
| `realSizeM?` / `sizeAxis` | number / `length \| width \| height \| longest` | `realSize` 规则用 |
| `gripRollDeg` / `secondGrip?` | number（默认 0）/ `[x,y,z]` | 握持微调；双手兵器第二握点 |
| `hideRegions?` / `neverHide` | 17 区枚举数组 | 默认取 `fit.json`；`neverHide` 默认手脚 |
| `spring?` | `{ chain, stiffness, drag, gravity, colliders }` | Phase B+ 弹簧链 |
| `fitVersion` | int | 算法版本不匹配时内容校验强制重跑 |
| `lod` | `{ triangles, textureSize }` | 进包脚本回填，供预算校验 |
| `source` | `{ tripoProject, tripoOp, credits }` | 溯源 |

不加模板维度；哪些模板有变体写在素材 manifest 的 `fits`，`tools/content` 校验交叉检查"角色模板 × 装备变体"覆盖，缺变体报 `MODEL3D_FIT_MISSING`（draft 期允许回退 medium 并在 dev 面板警告）；另加检查：head 存在、`hairBaked` 与 `hair` 冲突、`fitVersion` 匹配。

### 4.3 素材 manifest（沿用 `assets/README.md` 字段 + 以下）

- `model3d-template`（`assets/default/model3d/dressup/templates/<id>/`）：`body.glb`（路 B 另有 `body.frail.glb`）、`skeleton.json`、`regions.npy`、`skin_fair/medium/tan.jpg`；字段 `gender`、`heightM`、`heightMu`（ingest 实测写入，不手填）、`mPerMu`、`legRatio`、`shoulderRatio`、`headsRatio`、`ringSha`、`skullProfileSha`、`skeletonSha`（与动画一致性门禁）、`tripo_model`、`credits`、`status`。
- `model3d-head`（`…/heads/<key>/`）：`head.glb`、`fit.json`（`neckFrame`）；`gender`、`source`（npc-cut / bust / local-stitch）、`headHeightMu`、`scaleApplied`、`skullProfileDeltaMm`、`wigFit`、`hairBaked`、`hatSlot`、`skinLab`、`bodyTintByTemplate{}`、`ringSha`、`credits`、`status`。
- `model3d-garment` / `model3d-hair` / `model3d-prop`：tech/11 §7 字段 + `madeOn: tpl_f_medium` + `fits: { <template>: { file, report { penetrationRate, distP90DeltaMm, flipped, stretchOutliers }, status } }`。
- `skeleton.json`（tech/11 §4，字段回改）：`neckRing` 改为 `{ localYMu（按规则派生）, profile[64]{pos, normal, weights[4]}, sha }`；`measures` 全部从蒙皮网格顶点壳算；`heightMu` 实测；`sockets` 左右分别存；`fingerPose.fist`。

### 4.4 `fit.json` / `report.json`

见 tech/11 §5 / §6；新增 `align.method: 'joints'|'landmarks'`、`align.residualMu` 逐关节、`pushOut.rounds[]`（每轮 inside 数）、`refitFrom`、`fits` 报告四指标。

---

## 5. 落地计划

| 周 | 里程碑 | 验收标准 |
|---|---|---|
| W1 | 最小实验（≤ 105 点，§5.1）+ 25° 女中等模板（阶段 T） | 25° 底图过 2D 门禁；`tpl_f_medium` 新正本生成、绑骨、normalize、skeleton.json；娇小 / 修长派生；合体绑骨与 unlit 两项报告落盘（张角与路线已由 AR-104 定） |
| W2 | 阶段 A 离线基础（traex a1~a5：glb_io / inspect / export_skeleton / normalize_prop / fit_garment / refit / validate / textures / pack / ingest） | `selftest.py` 退出 0；正本 skeleton.json 全字段；剑 `measuredLengthMu ≈ 1.44`、`scaleApplied ≈ 0.41`；流仙裙高置信率 ≥ 0.85、bind 残留 0、耗时 < 60 s、report ≥ draft；`pnpm check` 全绿 |
| W3 | 阶段 B 运行时（b1 runtime + b2 预览页"换装 v2"） | `pnpm size` 出现 `render-dressup` ≤ 24 KiB 且 render 主块不增长；`/character-3d` 加载正本 + 流仙裙 + 马尾 + 青锋剑播 walk：裙随腿动、剑在右手、马尾贴颅顶；`stats()` drawCalls = 1 + 装备数、boneTextureUploads 每帧 1；ΔE2000 < 1.5 |
| W4 | 阶段 C 端到端 + Skill（c1 / c2） | 1 模板 + 3 道具 + 2 衣物 + 1 发型全部有 glb / fit / report / manifest；`.claude/skills/dressup-3d/SKILL.md` 每条命令 `--help` 核对，按 SKILL 从零重跑一件道具复现 report |
| W5~W6 | 阶段 D 模板三套 + 头（路 A 0 点 / 路 B 450 点每性别；现有 NPC 切头批处理 40 × 30 s；主角头 0 点） | 三套 skeleton.json 颈环半径差 < 2 mm、头尺寸归一后差 < 1%；`normalize_rig.py` 模型 / 动画一致门禁通过；5 个头在三套模板上缝 gap 0、接缝 ΔE2000 < 2 |
| W7 | 阶段 E 跨模板 refit + 首批 16 件批跑（≈ 620 点兜底） | small / tall 的 report ≥ draft；兜底件走重生成；`MODEL3D_FIT_MISSING` 为 0 |
| W8 | 战斗接入 + 性能门 | `model-stage.ts` 走 `DressupActor`，clone 后合并 Skeleton；`performance.test.ts` 进 `pnpm check:perf` 并通过 |

### 5.1 第一周最小实验（必做三件 + 一件可选）

0. **25° 女中等模板（阶段 T，85 点）**：现光头底图（39°~43°）图像编辑到 25° → `check_plate.py` 过门禁（臂角 25° ± 3°、头顶 / 脚底 < 2%、脸区不变）→ 协调者看图 → Tripo `image_to_model` + `rig` + `retarget` → `normalize_rig.py` + `export_skeleton.py` 替换 `tpl_f_medium` 正本 → `derive_template.py` 派生 `tpl_f_small` / `tpl_f_tall`。
1. **模板图像编辑出一件衣服 + 2D 轮廓门禁 + 65 点生成 + 关节级 Umeyama 残差报告**：以 25° 底图为底，Gemini 画"同一人物穿仙侠长裙"；`check_plate.py` 过门禁（头顶 / 脚底 < 2%、IoU ≥ 0.9、跨度比 < 3%）才投递 `image_to_model`（65）+ `rig`（20，仅为取关节）；对正本做 ≥ 6 个躯干关节 Umeyama（可判镜像），分开报告"可消部分（尺度 / 平移 / 旋转）"与"不可消部分（x/y 比、肢长比、逐关节残差）"；通过线：躯干关节残差 ≤ 2% H，腕 / 脚单独报告，穿戴件相对模板 x/y 尺度比 ≤ 1.02。
2. **一次 20 点"合体上传整体绑骨"**：正本（减到 ≤ 7 万三角）+ 第 1 项对齐后的裙子（≤ 3 万三角）合成一个 GLB，Studio 上传 → Auto Rig；比较绑骨前后顶点集合（最近点最大差应 ≈ 1e-4 mu）与顺序是否打乱，按位置匹配取回裙子 JOINTS / WEIGHTS 并绑回正本骨架，播 walk 统计穿透率；给出"顶点是否不变、权重可否复用"的明确结论写进 SKILL。
3. **unlit 并排 ΔE2000**：`scene.ts` 加 unlit 开关（NoToneMapping + MeshBasic 替换），对正本脸部 UV 固定块在同一浏览器画布读像素，与 Tripo 预览截图同块取均值算 ΔE2000；目标 < 1.5；同时记录 Tripo 预览是否纯 baseColor（待实测）。
4. 可选：`segment v2`（40 点，`ref_image` = 裙身掩码）实测是否独立 node、贴图 / UV / 顶点 / skin 保留。

点数合计 65 + 20 + 20（+ 40）= 105（145）点；现有 18 件道具 0 点兜底对齐只挽救金甲 / 剑 / 玉佩 / 斗笠，其余按新流程重做。

### 5.2 分工与阶段验证（AR-103）

- 代码、脚本执行、Tripo / Gemini 队列调用、`pnpm check` 与 validate 门禁一律交 traex（GPT-5.6-Sol，xhigh），按 tech/11 §12 的任务登记（a1~a5 / b1~b2 / c1~c2，D / E 阶段任务在 W4 末登记）。
- Claude 只在每个大阶段结束后验证：实跑 `selftest.py` / `inspect.py --json` / `export_skeleton.py --check`；浏览器 `/character-3d` 截图与作者图 3 / 图 4 并排；核对 `report.json` 与 manifest `status` 一致；向作者汇报后作者看图定稿。
- tech/11 需随本文回改的条目：§4 `neckRing`（按规则派生、椭圆轮廓）、§8 `setBoneScale`（改子骨 position / 辅助节点，剥轨道前提）、§9 render 余量数字、§11 第 1 条补"生成端 `auto_size` 仅 API"；回改由协调者在 a2 开工前完成。

### 5.3 主要风险与缓解

| 风险 | 等级 | 缓解 |
|---|---|---|
| 模板板 A 字张角不一致，各模板骨架姿态差 > 10° 会污染所有装备对齐 | 中（AR-105 已定 25°） | 六张板统一 30°；`check_plate.py` 臂角门禁 25° ± 3° |
| Tripo 三次独立生成比例离散（同图 ~1%、multiview −5.4%） | 中 | 3D 比例门禁 + `fix_proportion.py` 确定性校正；校正量 > 8% 才重出；不靠 freeRetry |
| 现有 NPC 切头质量上限（纹素低、高领 / 披肩 / 斗笠进切面、胡须干扰下巴检测） | 中 | 领口检测 + 程序颈套；S 级角色改胸像重出 |
| 男性魁梧模板粗颈被压到规范环后 15 mm 混合带内收腰 | 中 | 男环按性别派生并实测一套再定 |
| 肤色只做颜色乘法，晒色 / 腮红纹理差在短袖角色上可见 | 低 | 按头色重出皮肤贴图变体兜底 |
| 跨模板重贴合对贴身大件（全身甲、腰封贴将军肚、宽袖）成功率未知；裙摆权重分到脚骨 | 高 | 首批按 30% 兜底重生成估点；`jointsAllowed` 限制 + 关节线段距离混合；弹簧链 Phase B+ |
| 每件 × 3 模板变体使素材体积与进包时间 ×3（1~3 MB → 3~9 MB） | 低 | 按模板懒加载；draft 件排除在 `pnpm check` 校验之外 |
| 头在运行时独立绑定依赖模板 Neck / Head IBM 同源；某模板漏跑 `normalize_rig.py` 会整体偏 ~1 cm 且缝不闭合 | 中 | 构建期 `ringSha` / `skeletonSha` 门禁拦截 |
| 换装新用到的 three 核心导出落进 render 主块（余 ≈ 5 KiB） | 中 | 只用主块已有 API；每次 `pnpm size` 对比 render 行；不得拆块绕过（tech/01 §5.4） |
| 合体绑骨 / segment 的平台行为（顶点顺序、skin 保留、面数上限 10 万）未定 | 中 | W1 第 2 / 4 项实测写进 SKILL；失败则只走本地权重转移 |

---

## 6. 已核验 / 被驳倒 / 待实测的断言清单

| # | 断言 | status | 采用的修正 |
|---|---|---|---|
| 1 | 正本 rest == bind、65 骨 IBM 完整，可在 bind pose 离线做权重转移与三动作 LBS 穿透统计 | holds（有条件） | 数值成立（LBS 复算差 2.8e-7），但 LBS 零偏差是同义反复；三动作必须来自与装备同骨架的文件，不把 anim clip 按骨名套到缝头版；装备先对齐再转移 |
| 2 | 三模板比例"只能靠 2D 门禁 + 3D 门禁 + freeRetry 收敛"；Tripo 归一化到 0.98 | refuted | 同图重跑尺度自动一致（高 0.98 ± 0.3%），离散的是比例（同图 ~1%，2.7% 混了图版本；multiview −5.4% 是重建比例差）；0.98 有例外（0.952 / 0.898 / pilot 0.9995），`model-stage.ts:49,141` 的 `/0.98` 改读 manifest `heightMu`；比例用分骨长度缩放确定性收敛，freeRetry 只当免费重掷；`model_seed` / `auto_size` 仅 API 有，Studio 请求体待实测 |
| 3 | 41 个 NPC 在 Neck+0.006 切面半径差 2.7 倍，故颈口必须压规范环；头尺寸归一必须用下巴→颅顶 | refuted | 该切片是领线 / 斜方肌（Neck 主导仅 9%~50%），2.7× 来自领 / 发 / 关节抖动；皮肤颈半径同性别差 1.1~1.4×；环位置按规则派生（Neck + 0.012~0.018 mu，半径 ≈ 0.026，椭圆轮廓）；头归一用"颈切面轮廓 ↔ 环"相似 + 脸高钳位；现有 40 个头自带烘焙发，只能整头复用、锁 hair 槽；`hips_y/H` 是骨盆高占比 |
| 4 | `bind(skeleton, bindMatrix)` 显式传矩阵不重算 boneInverses，装备 / 头可在任意父节点与任意预对齐坐标，用模板 Neck 的 bind 世界矩阵绑到任何模板 | disputed → 按修正采用 | 机制成立（实测偏差 5.5e-8 m）；bindMatrix = `inv(IBM_neck)` 而非运行时 `matrixWorld`（错 20 m）；只能相似变换（法线无逆转置、镜像绕序不补）；必须挂角色 root 内（包围球剔除、clone 子树）；克隆体共用 `boneInverses`，无参 bind 全禁；所有模板 Neck 帧必须同源归一（两次绑骨差 4°） |
| 5 | `stitch_user_body.py` 已实现切面 / 压环 / 15 mm 混合 / 权重插值 / 贴图带，`conform_ring.py` 与 `cut_head.py` 只是它的参数化重构；胸像出头有先例 | refuted | 脚本存在（未提交，5 s 可复跑）但是一次性实验：无 15 mm 常量（实际四条带 8.08 / 10.08 / 8.0 / 5.0 mu-mm ≈ 13.8 / 17.2 / 13.7 / 8.5 mm）、默认 seam 0.838 与磁盘产物 0.846 不符、关节序号硬编码、切口 JOINTS/WEIGHTS 错配（行 86-87）、无现成环提取、只支持水平切面；`conform_ring.py` / `cut_head.py` 不存在，按新模块写并新增边界环提取、按名解析关节、多 primitive、参数化带宽；先例是"头 + 颈桩"不是胸像，文件在 `.agents/`（不入库） |
| 6 | numpy 权重转移 6.9 s / 推离 0.02 s / 遮罩 4.9 s / 写回 0.1 s；每件每套 25~40 s；穿透门禁必须用目标模板的 Tripo retarget 动画（跨骨架套 clip 自带 0.6~2 cm 误差） | refuted | 计时测于缝头版且朝向错 90° 的裙子；`workers=-1` 后转移 2.4 s、遮罩 2.0 s；推离每轮需复查 2.1~3.4 s × 3；写回 0.12~0.34 s；"25~40 s"无实测来源，单件 ≈ 10~12 s（减面后 1~3 s）；0.6~2 cm 是 model_rig 与 anim 两套骨架之差，同源 rig 为 0；门禁口径 = 同骨架 + 与运行时相同 clip 源与摆姿代码路径，新骨架方案下拿不到也不需要 Tripo 逐模板 retarget；bpy 4.5.14 可装（对照用） |
| 7 | Mixamo 子关节偏移严格沿父 +Y，`bone.scale(1,s,1)` + 子骨 `(1,1/s,1)` 等价改骨长，s=1.03 剪切 < 1.5% | refuted | 只有同链内（UpLeg→Leg→Foot、Arm→ForeArm→Hand、Spine 链、Neck→Head）沿 +Y，Hips→Spine 14°、Spine2→Neck 2.5°、Spine2→Shoulder 12.6° 不是；动画中 S·R_c(t)·S⁻¹ 使小腿缩短 2.9%（s=1.03）、子树非刚性 3%；mixer 的 scale / position 轨每帧复位；改用 `child.position.y *= s` 或辅助节点方案，并先剥轨道；常量从运行时实际加载的 GLB 量 |
| 8 | 共享 Skeleton：skinIndex 按骨名重映射后 `bind(body.skeleton, identity)`，boneTexture 每帧一次 | holds（加前提） | 装备顶点须已在模板绑定空间；骨名用清洗后的；`SkeletonUtils.clone` 破坏共享需合并；gltfpack 量化 GLB 的 IBM 带解量化不能丢；"每帧一次"= 每次 `render()` 一次 |
| 9 | unlit → MeshBasic 仍受 toneMapping；NoToneMapping 后 albedo 直出，ΔE < 5 | holds（改验收线） | 验收改 ΔE2000 < 1.5（ACES 坏图已是 4.5 能过 5）；关阴影 / 强光对 unlit 空操作、对 PBR 是破坏；渲染到 RenderTarget 不做 tone mapping；Tripo 预览是否纯 baseColor 待实测 |
| 10 | `_REGION` 原样载入，1 个 draw call 隐藏任意区域 | disputed → 按修正采用 | 名字小写、按 float 上传、u8 存；flat varying + 拆点；draw call = primitive 数 × (1 + 投影灯)；阴影 pass 需 `customDepthMaterial`；≤ 32 区 |
| 11 | node_modules 已有 meshoptimizer 可用；simplifyWithAttributes 保留 UV / JOINTS / WEIGHTS / `_REGION`；gltf-transform 可 npx | disputed → 按修正采用 | meshoptimizer 是传递依赖不可 import，用 three 自带 simplifier（55 KB，只离线）或加 devDependency；简化只重建索引，JOINTS / `_REGION` 用 `vertex_lock` 不作误差通道；npx 需 `--registry` 或在仓库目录内；meshopt 量化后 `scene.ts` 裸 bbox 身高错（改 `computeBoundingBox`）；道具体积大头是 8k 贴图 |
| 12 | 素体 bind pose 骨骼足以派生全部插槽与握持帧；同 rig retarget 手骨基底一致、武器不漂 | refuted | 插槽 / 尺寸从蒙皮网格派生（握点在手掌实体内，需外推 0.0153 mu + 柄半径；0.0596 是左手值，右 0.0633）；HeadTop_End 高 0.0435 且前偏 0.042 mu；工作区两文件不是同一 rig；指骨全程偏离 bind 47°~76°，需握持姿势覆盖；手部槽按实际加载文件 sha 生成 |
| 13 | 全部道具归一到 0.974~0.98、单连通实心壳、衣服都是整身人形、按包围盒中心对齐注定失败 | refuted（部分） | 16/18 最长边 0.977~0.982，两件例外；匕首 + 鞘等 3~4 件多块；kunlun 带整头、xianxia / assassin 无可见手脚；袖角逐件 17°~67°（black_assassin 46.8° ≈ 模板），不是类别常量；包围盒对齐对紧凑件（玉佩 / 香囊 / 念珠 / 葫芦）够用，发型 / 武器 / 衣服要语义锚点；尺度来源可为 realSizeM 或 API `auto_size`（待实测） |
| 14 | Tripo rig 无"用已有骨架蒙皮"，retarget 只认 Tripo task_id，衣服随动只能靠本地转移或整身绑骨后 segment | refuted（结论部分） | 前提成立；但可行路径还有"先 segment 后 rig 按 part 导出"（官方文档化）与"合体上传整体绑骨取权重"（顶点集合保留 ≤ 2e-4 mu，顺序打乱），retarget 限制与衣服随动无关；segment 保留 skin 未证实，不作并列选项；bpy 可 pip 装（Data Transfer 1.0 s） |
| 15 | 模板图 + multiview 生成的穿戴整身与素体关键点残差 < 3%，Umeyama 可消；现有道具残差中位 20 cm | refuted | 已有同管线样本腕残差 6~9%；Umeyama 消不掉关节角差；统一 A 字张角 + 用绑骨关节 + 骨局部旋转对齐；"20 cm"是裙顶点到皮肤距离，不是关键点残差；阈值按槽位定 |
| 16 | vite manualChunks 前置一条规则 + budgets 加行即可独立懒块且不触主块 | refuted | 分块由 content-plugin `codeSplitting.groups` 决定；render 余 ≈ 5 KiB（非 0.58）；three 核心新导出落主块；需 check_size / test / budgets / content-plugin.test / PWA globIgnores 一起改；补 3D 换装性能测试 |
| 17 | 同模板同构图整身图经 multiview 后与素体同尺度同位置（头顶 / 髋 < 2%） | refuted | multiview 髋 −5.4%、脚 −21.6%；头顶 0.98 是归一化常数（恒真）；raw 导出居中于原点、绑骨导出才落地、朝向 ±X vs ±Z；必须本地显式对齐 + 门禁 |
| 18 | `segment v2` 保留贴图 / UV / 独立 node / skin；Studio 面板有 `auto_size` / `model_seed` / `T-pose` 开关；Tripo 预览 = 纯 baseColor | 待核验 | W1 可选实验；API 请求体 dry 模式先验证 |
| 19 | 合体上传整体绑骨后顶点集合不变、权重可拆回复用 | 部分核验（raw vs rigged ≤ 1.9e-4 mu，顺序打乱） | W1 第 2 项用一件衣服 20 点定案 |

---

## 7. 开放问题（AR-104 已拍板，2026-10-07）

| # | 问题 | 作者决定 |
|---|---|---|
| 1 | 男性三型命名与身高；女修长 1.72 m 高于 AR-99 上限 | 精悍 `tpl_m_lean` 1.76 / 中等 `tpl_m_medium` 1.81 / 魁梧 `tpl_m_bulk` 1.86 m；女 1.58 / 1.66 / 1.72 m，接受 |
| 2 | 规范 A 字张角 | 25°（± 3°；AR-105 由 30° 改），所有板与衣图统一；现素体只作过渡期正本 |
| 3 | 模板生成路线 | 路 A：中等一次生成（65 + 20 点）+ 分骨缩放派生（0 点）；路 B 只作补救 |
| 4 | Blender | 允许安装作对照 / 兜底，主链不依赖 |
| 5 | 点数预算 | W1 105 点、新角色出头 65 点 / 人、首批装备兜底约 620 点，同意（男中等模板 85 点随路 A） |

仍待后续确认（不阻塞阶段 A / T）：
6. **具名 NPC 默认模板映射表**（`content/avatar3d-defaults.yaml`）：按 AR-99 代表人物给初值后请作者过一遍，尤其男性横练名单。
7. **单位约定**：先按 manifest 实测 `heightMu` 驱动；米制改造列为后续。
8. **现有 18 件道具去留**：只挽救金甲 / 青锋剑 / 玉佩 / 斗笠（0 点规范化），其余按新流程重做；`hair_bun_fairy` 作整头替换样本。

---

## 参考资料

- 本机核验脚本与日志（会话草稿区 `scratchpad/dressup/`，不入库）：`followup/verify1/`、`followup/adv2/`（骨缩放 / 颈环 / 绑定矩阵 / 计时）、`verify_hn/resurvey.py`、`adv_bind_counterexamples.mjs`、`verify_shared_skeleton.mjs`、`web/test.html`（unlit ΔE2000）、`adv_scale/glb_scale_probe.py`、`bench_ns.py` / `bench2.py`、`proto_weight_transfer.py`、`bpy_autoweight_adv2.py`。
- three 0.186.1 源码位置：`src/objects/SkinnedMesh.js:230`（bind）、`src/objects/Skeleton.js:199-225`（update）、`src/renderers/webgl/WebGLObjects.js:46-58`（按帧去重）、`WebGLPrograms.js:177-185`（toneMapped）、`examples/jsm/loaders/GLTFLoader.js:4297 / 4871`（identity bind、属性小写）、`examples/jsm/utils/SkeletonUtils.js:392-423`（clone 复制 skeleton）。
- Tripo 文档（`scratchpad/dressup/tripo_docs/llms-full.txt`）：image-to-model `auto_size` / `model_seed` / `orientation`；mesh-segment v2.0-20260430 `split_by_connectivity` / `ref_image`；animations-rig `input` 接受 task_id / file_token / URL；models-convert `part_names` / `with_animation`。
- 行业做法：Unreal Modular Characters（同一 Skeleton 资产）、UMA Wardrobe（HidesBaseSlots / MeshHideAsset）、Ready Player Me outfit 规范（≤ 4 权重归一、颈缝由衣领遮盖）、Robust Skin Weights Transfer via Weight Inpainting（SIGGRAPH Asia 2023）、VRM SpringBone。

## 本文新增术语 / 约定

- **模板（template）**：颈以下的体型素体，含共享骨架、规范颈环、`skeleton.json`；三套 / 性别。
- **规范颈环（canonical ring）**：按规则从模板派生的 64 点椭圆颈切面轮廓（位置 / 法线 / 权重），头与模板的唯一接口。
- **颅骨表（skull profile）**：Head 骨局部每 5 mm 一行的 x/z 半径表，发型 / 帽子贴合的唯一依据。
- **mu / mPerMu / heightMu**：模型单位、米每模型单位、模板实测高度（ingest 写入，不手填）。
- **fit / report / fits**：单件贴合记录、门禁报告、按模板的变体与报告映射。

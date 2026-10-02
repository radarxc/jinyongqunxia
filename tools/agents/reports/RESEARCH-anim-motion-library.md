# 天书录 · 低成本人物动画方案调研与设计

> 协调者注（2026-10-02）：本报告由调研 agent 在会话草稿目录写成，原型脚本已复制到 `tools/agents/reports/RESEARCH-anim-proto/`；下载的 CC0 动作包与许可原文（约 46 MB）未入库，文件名与 SHA-256 见 §8.5。作者确认事项尚未答复。


| 项 | 内容 |
|---|---|
| 日期 | 2026-10-01 |
| 范围 | 现成动作库 + Gemini 生多视角图 + Python 融合；只调研和设计，未改仓库 |
| 已排除 | Blender 建模逐帧渲染（成本太高）、Project Genie（不能导出帧或资产） |
| 读过的仓库文件（`_prod`） | `docs/decisions/author-requirements.md` AR-22；`docs/tech/09-character-rig.md` 全文；`docs/tech/07-asset-generation.md` §4.4–4.5、§5.4、§8；`packages/render/src/rig/*.ts`；`tools/rig/*.py`；`assets/default/prompts/rig/`；`tools/imagegen/README.md`；`tools/portrait/README.md`；`tools/agents/HANDOFF.md` 末段 |
| 本地验证 | 在会话草稿目录 `scratchpad/proto/` 用两个 CC0 动作包做了投影分析和运行时微基准，并用 Apple Vision 对 4 张立绘做了关键点探测。数据见 §8 |
| 标注 | **（待核实）**：没找到一手来源；**（待实测）**：要在作者账号或真机上验证；**（初值）**：本文给的建议数，未经实测 |

---

## 0. 结论先行

**一句话**：推荐路线 (a)，即「2D 分层部件 + 3D 动作库驱动」。Gemini 对每个角色只出 1 张 A 字站姿三视图设定图，Python 把它切成 `tianshu_rig` 的 13 个源部件；动作取 CC0 动作库，离线烘焙成「骨向量轨迹」，运行时按相机偏航投影成每个部件的 2D 仿射，并实时决定每个部件用哪个视图的贴图、画在哪一层。这条路线与现有 ENG-12 的实例化管线（2 个 draw call、每实例 56 B）完全兼容，每个角色只花 1.5–3 张 Gemini 额度。

1. **现有代码离这条路线不远**：
   - ENG-12 的每实例数据已经是 2×3 仿射（能表达沿骨缩短和躯干变宽），`sortTint` 里的部件 z 也可以逐帧改，图集里三个视图的贴图本来就同时在。
   - 缺的只有三样：动作片段播放、按部件选视图、按深度定绘制顺序。
2. **动作库首选 Mesh2Motion 的人形动作集**：
   - 美术资产 CC0，代码 MIT；截至 2026-10-01 仓库里有 178 个人形动作。
   - 其中大部分来自 Quaternius Universal Animation Library（CC0），剩下的是作者补充的。
   - 覆盖走、跑、待机、转身、剑招、拳、踢、受击、倒地、坐、**打坐（Meditate）**、眩晕、发抖、疲惫、服药、投掷、闪避、格挡、轻功类跳跃。
   - KayKit（CC0，161 个）补单手、双手、空手近战；CMU（产品内可用、不得转售数据）补踢腿和拳法。
   - **枪、棍、中式剑法套路这几类，CC0 库几乎都没有**，需要另行补源（§2.3）。
3. **Gemini 三视图可行，但要按规矩做**：
   - 三个视图放在一张画布上；A 字站姿；手里不拿道具；平涂底色；不要求透明背景（Gemini 不输出 alpha，硬要会画出假棋盘格）。
   - 保持身份主要靠上传立绘作参考，这一点需要作者确认。
4. **本地实测的关键数字**：
   - 走路片段投影到三视图：躯干视图切换 0 次，手臂越过躯干平面 0%，可以直接用。
   - 剑招片段：每段要切换 3–10 次躯干视图；25–60% 的帧里手臂在躯干前后之间翻转。攻击和受击类片段里，肢体投影最短只剩原长的 2–16%。
   - 所以「按部件选视图 + 动态 z + 缩短下限」三件事是必需的，不是锦上添花。
   - 100 个角色 × 16 个部件的片段姿势求值：P95 约 0.10 ms（M2 Pro，系统负载约 15）。现有预算是 0.55 ms。
5. **发现一处规格缺陷，必须在切件前修**：
   - tech/09 §1.3 写「三视图都面向画面左，`nearSide:R`」，z 序表也把右侧肢体放在最前。
   - 但物理上，面向画面左时离镜头近的是**角色的左侧**：front34 时它在画面右，back34 时在画面左。
   - Gemini 画出的三视图在物理上是对的，如果按现有 z 表切件，远侧的手臂会被画到躯干前面（§5.5）。
6. **不推荐其他三条路线**：
   - (b) 3D 人台投影：长袍、宽袖、发髻都要另做代理网格，投影有接缝，光照被烘死，手机上也撑不起 100 个蒙皮网格。
   - (c) 图生 3D：本机没有 NVIDIA 显卡，TRELLIS 和 UniRig 跑不了；混元有地域条款；单图重建的背面是模型臆造的，看起来像手办。
   - (d) 逐帧生图：一个角色两个动作就要约 70 张图，帧间闪烁，而且装备一换就要整套重画，违反 AR-22。

---

## 1. 现状与约束

### 1.1 现有 rig 能做到哪一步（ENG-12 已合入）

| 能力 | 现状 | 对动作库路线的意义 |
|---|---|---|
| 部件与实例 | 16 个运行时部件 + 最多 4 个附加槽；`RigBatch` 一个 `InstancedMesh`，芯和软边两个材质组，**全体人形 2 个 draw call** | 保持不变 |
| 每实例数据 | `uvRect`、`affine2d`（2×3）、`anchorDepth`、`sortTint`，共 56 B | 2×3 仿射天然支持沿骨缩放（透视缩短）和躯干横向缩放，不需要改格式 |
| 部件 z | `sortTint[1]=round((z+2)×20)`，着色器按它做毫米级深度偏移 | 动态 z 只需逐帧写这个值 |
| 视图 | `resolveDirection(Dir8)` 得到整个角色用哪个视图、是否镜像；Dir8 为 0 或 4 时沿用上一次的镜像状态；转身在过渡中点换视图 | 要改成**按部件**选视图（躯干、骨盆、头可以和四肢不同） |
| 动作 | `gait.ts` 用闭式曲线生成 walk / run / idle 的关节角，支持轻中重三档、一拍二（12 fps）、披风二阶弹簧 | 保留，作为默认移动方式；新增片段驱动 |
| 骨架求解 | `solveSkeleton()` 是 2D 正向运动学：子部件挂在父贴图的 `childJoint` 上 | 片段模式下改为**把子部件挂在投影后的 3D 关节上**，见 §5.3 |
| 装备 | `equipment.ts` 已有替换、附加、复合三类分配；附加层用的还是占位格，替换层只改色调 | 武器附加层要加「剑轴」朝向 |
| 美术 | `make_parts.py` 按 alpha 包围盒推枢轴（肩点写死在宽度的 14% 和 86%）；**正式部件图还没有出** | 从 Gemini 三视图切件时，枢轴要改由关键点给出 |
| 战斗大动作 | tech/09 RIG-O03 只留了姿势接口；tech/02 的 `CueApi.playAnim(id, clip, facingYawDeg)` 会触发 `hit` 和 `end` 回调；design/05 的 `MoveDef.anim.clip` 已经有键名，例如 `palm_heavy` | 片段系统正好填进这个接口 |

### 1.2 素材、工具与硬件

- **立绘**：
  - 共 425 张，其中基础形象 345 张，对应 307 个 NPC：S 级 115、A 级 160、B 级 32。另有剧情场景图 80 张。
  - 规格 1024×1536，写实手绘，人物正面略侧，背景是淡水墨。
  - 每张都有英文提示词，里面带「BASE-STAGE CHARACTER FACTS」段落，写明服饰、发式和标志物，可以直接复用来写三视图提示词。
- **抠图**：`tools/portrait/build_portraits.py` 用 BiRefNet（`birefnet-general-lite`，CPU 约 7 秒一张）加 pymatting 去白边，已经跑通。
- **出图**：
  - 走 Gemini 网页版，批处理和入库工具在 `tools/imagegen/`（`gemini_g.js`、`ingest.py`、`key_background.py`）。
  - 额度按时段计。本文按任务给的「每时段约 35 张」做保守估算；HANDOFF 记录 10-01 出物品时实测每时段 50–60 张，周额度较宽。
- **机器**：
  - Apple M2 Pro，32 GB 内存，macOS 15.6.1，没有 NVIDIA 显卡。
  - **数据盘只剩约 12 GB**，不适合下载几 GB 的模型。
  - 已装的 Python 包：rembg、pymatting、scipy、scikit-image、numba、onnxruntime。
  - 没装：opencv、mediapipe、torch。
  - Swift 能用，但 CommandLineTools 默认的 26.2 SDK 和 6.1.2 编译器不匹配，要加 `-sdk …/MacOSX15.5.sdk` 才能编译，已实测。
- **执行器**：GPT CLI（traex）。图片任务必须 `web: true`。

### 1.3 由此得出的硬约束

1. 不训练、不常驻大模型。Python 端只用 CPU 或小体积 ONNX，Apple Vision 优先（不用下载）。
2. 运行时必须守住 tech/09 的契约：每个角色最多 20 个实例，全体 2 个 draw call，100 个角色 rig CPU P95 ≤ 0.80 ms，每帧零分配。
3. Core 是玩法唯一权威。片段里的 `hit` 事件只用于表现同步，不能反推命中或位移。
4. AR-22：装备行走时可见；行走仍由代码轨迹驱动；分别贴图。

---

## 2. 现成动作库（问题 1）

### 2.1 候选一览

「能否商用」按商业网页游戏理解；「能否随游戏分发」指运行包里带烘焙后的动作数据，**不是**把原始文件当素材包发出去。

| # | 候选 | 许可 | 商用 / 随游戏分发 / 署名 | 格式与骨架 | 数量与覆盖 | 获取与地区 |
|---|---|---|---|---|---|---|
| 1 | **Quaternius Universal Animation Library 1 / 2（UAL）** | CC0 1.0（压缩包内 License.txt 原文） | 可商用 / 可分发 / 不需署名 | glTF、FBX、OBJ。UAL1 的 Godot GLB 用 Rigify 的 `DEF-*` 命名（53 个关节）；UAL2 用 UE Mannequin 风格命名（`pelvis/spine_01…/upperarm_l/lowerarm_l/hand_l/thigh_l/calf_l/foot_l/ball_l`，65 个关节）。官方称可重定向到 UE、Unity、Godot | 两版合计 250+。**免费 Standard 档**：UAL1 有 45–46 个（Walk/Jog/Sprint/Idle/Crouch/Roll/Jump、Sword_Attack/Idle、Punch_Jab/Cross、Hit_Chest/Head、Death01、Sitting_*、Spell、Push、Swim 等）；UAL2 有 43 个（Sword_Regular_A/B/C/Combo、Sword_Block/Dash、Melee_Hook、Hit_Knockback、OverhandThrow、LayToIdle、NinjaJump、Shield、Consume 等）。**没有踢腿、转身、枪棍** | quaternius.com、itch.io、OpenGameArt 直接下载，不用账号。UAL1 Pro 档 $9.99 起，含全部 120+；UAL2 付费档价格（待核实）。itch 页称 v3.0（2026-06-16）加了根运动版本 |
| 2 | **Mesh2Motion（人形动作集，首选）** | 代码 MIT；美术资产（模型、骨架、动作）CC0 | 可商用 / 可分发 / 不需署名。注意：mocap 组 16 个动作**没注明来源**（同仓库附带 CMU 样例 FBX），用前要核对（待核实） | GLB（网页版也能导出 FBX）；66 关节，UE 风格命名 | 2026-10-01 读仓库 `static/animations` 三个 GLB 的头部得到：base 87 个（基本是 UAL1+UAL2）、addon 75 个（Meditate、Dizzy、Shivering、Tired Hunched、Idle Hurt、Kneeling Tired、Defend、Dodge 前后左右、Fighting Idle、Left/Right Jab、Death_A/B/C、Two-hand Blast、Power Up、Levitate、Glide、Backflip、Throw Object、Sleeping、Greeting 等）、mocap 16 个（Kick_Breach、Turn_Left/Right_90/180、Salute 等），**合计 178 个人形动作** | GitHub 或 app.mesh2motion.org，浏览器里就能用，不用账号。2026-09-25 更新新增了踢腿和 4 个转身 |
| 3 | **KayKit Character Animations** | CC0 | 可商用 / 可分发 / 不需署名 | FBX、glTF；KayKit 自有的 Rig_Medium / Rig_Large（Q 版比例） | 161 个，免费档 150+。类别包括：单手、双手、空手、双持近战，格挡，受击，死亡，坐，躺等。**双手的刺、劈、旋可以借给枪、棍、刀**。具体动作名（待下载核对） | itch.io，可自定价格（含 0）。Q 版比例做出的动作，套到写实体型上会有点夸张（待实测） |
| 4 | **CMU Graphics Lab Motion Capture** | 官网原文：数据可免费用于研究；*You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form.* 另**请求**在致谢里写资助说明 | 可放进商业产品 / 可随游戏分发烘焙后的数据 / 不得把数据本身转售或再打包发布；署名属请求性质，建议照写 | ASF/AMC、C3D；cgspeed 提供 BVH；RancidMilk 把 2000+ 段重定向到了 Quaternius 骨架，glTF 版约 764 MB | 两千余段：拳击（13、14、79、80）、出拳与踢腿（143、144）、空手道型（135）、早期剑戏（02_07–09，质量较低）、坐、跌倒等。动捕噪声需要清理，几乎没有中式兵器 | mocap.cs.cmu.edu（证书异常，用 http 读到的原文）。不用账号 |
| 5 | **100STYLE** | CC BY 4.0 | 可商用 / 可分发 / **必须署名** | BVH，原始包 1.5 GB | 100 种风格的移动动作（前后、侧移、走跑、待机、过渡），共 478 万帧。**只有移动** | Zenodo |
| 6 | **Rokoko 免费动作包** | 官方页写可用于任何动画、视觉特效、游戏项目，含商用 | 可商用 / 随游戏分发是否允许没写（待核实） / 不要求署名 | FBX，适配 Mixamo、UE、HumanIK 骨架，30 fps | Motion Library 免费 150 个；另有 263 个合集、6 个武术、13 个打斗、10 个打斗与兵器的资源页。具体内容（待下载核对） | 要填注册表（含营销邮件同意），下载链接给 Google Drive，中国大陆网络需要代理 |
| 7 | **Mixamo（Adobe）** | Adobe FAQ：角色和动作可免版税用于个人、商业、非营利项目；**不得把原始角色或动作文件单独再分发** | 可商用 / 可随游戏分发 / 不需署名 | FBX；Mixamo 骨架 | 库最大，含剑盾、大剑、武术、踢腿等 | 要 Adobe ID。**Adobe FAQ 原文：country code 为中国的账号不能用**。不纳入 |
| 8 | 万代南梦宫研究所动作数据集 1/2 | CC BY-NC 4.0（仓库现行 README；早期标的是 BY-NC-ND） | **不可商用** / 只限非商用 / 要署名 | BVH | 数据集 1：17 类内容（含打斗、舞蹈）× 15 种风格，36,673 帧。数据集 2：移动和手部动作，384,931 帧 | GitHub。只在项目永远不商用、不公开时可考虑，默认不用 |
| 9 | SFU Motion Capture | 不可用于商业产品，不得转售 | **不可商用** / 要求署名 | BVH、C3D、FBX | 约 40 余段：武术（武术踢腿、剑道）、中国舞等 | 官网。默认不用 |
| 10 | three.js 官方示例与 Kenney | RobotExpressive 是 CC0（Quaternius 作品）；Xbot、Soldier、Michelle 来自 Mixamo，受其条款约束；Kenney Animated Characters 是 CC0 | — | GLB | RobotExpressive 14 个动作，Kenney 只有 idle/jump/run 3 个 | 只适合做演示或测试，不作生产来源 |

补充来源，不进第一批：

- **HY-Motion 1.0（腾讯，文本生成动作）**：
  - 许可是腾讯混元社区许可。tech/07 已核过：不适用于欧盟、英国、韩国；月活超过 100 万要另行申请；不得用它的输出改进别的 AI 模型。
  - 显存要 26 GB（Lite 版 24 GB），本机跑不了。HF 上有官方 Space 演示，输出 SMPL-H 或 FBX，需要重定向。
  - 可作为「签名招式」的草稿来源，但要作者同意。
- **用 AMASS / HumanML3D 训练的文本生成动作模型（MDM、MoMask 等）**：AMASS 许可禁止商业用途，也禁止用它训练商用模型。输出的权利边界模糊，不用于正式内容。
- **Motifect 免费武术包**：40 个，AI 生成；页面写「可用于个人和商业游戏」，但条款很简略（待核实）。
- **作者自录 + Apple Vision 3D 人体姿态**：
  - macOS 14 以上可用 `VNDetectHumanBodyPose3DRequest`，输出 17 个 3D 关节。
  - 本机实测能在立绘上返回 17 个关节（§8.3）。
  - 没有许可问题，适合补中式招式；视频质量和快速动作下的稳定性（待实测）。

### 2.2 武侠需求覆盖矩阵

图例：✓ 有直接可用的；△ 能借用或数量少；✗ 没有。只统计免费可得的部分。

| 需求 | Mesh2Motion | UAL 免费档 | KayKit | CMU | 说明 |
|---|---|---|---|---|---|
| 走 / 跑 / 待机 | ✓（多种风格） | ✓ | ✓ | ✓ | 行走仍可用现有程序步态 |
| 转身 | ✓（左右 90° 和 180°） | ✗ | （待核实） | △ | 也可沿用程序转身 |
| 剑 | ✓（Sword_Attack、Regular A/B/C、Combo、Block、Dash、空中竖劈） | ✓ | ✓（单手） | △ | 动作偏西式，需要代码风格化（§5.4） |
| 刀 | △（借剑招） | △ | ✓（单手 / 双手劈） | ✗ | |
| 棍 | ✗ | ✗ | △（双手劈、旋） | ✗ | **缺口** |
| 枪 | ✗ | ✗ | △（双手刺） | ✗ | **缺口** |
| 拳掌 | ✓（Jab、Cross、Hook、Two-hand Blast 双掌推、Power Up 运功） | ✓ | ✓ | ✓ | 掌法外放可配 VFX |
| 踢 | △（Kick_Breach 一个） | ✗ | ✓（空手踢，待核实） | ✓（空手道踢、前踢、侧踢） | |
| 受击 | ✓（Chest、Head、Knockback、Idle Hurt） | ✓ | ✓ | △ | |
| 倒地与起身 | ✓（Death_A–D、LayToIdle、Kneeling Tired） | ✓ | ✓ | △ | 倒地时肢体缩短最严重，见 §8.1 |
| 坐 | ✓ | ✓ | ✓ | ✓ | |
| 打坐 | ✓（Meditate） | ✗ | △（坐地） | ✗ | |
| 其他 | 眩晕、发抖（对应寒）、疲惫、服药、投掷暗器、闪避、格挡、轻功（Glide、Levitate、NinjaJump、Backflip）、睡觉 | 部分 | 部分 | — | 正好对上 design/06 里的若干 Buff 表现 |

### 2.3 选库建议

1. **第一批只用 CC0**：
   - 以 Mesh2Motion 的人形动作集为主（UE 骨架，一次拿到 178 个）。
   - 用 KayKit 补双手兵器和空手（枪、棍、刀的替身动作）。
2. **第二批**：
   - 用 CMU 补踢腿和拳法，按它的条款：放进产品可以，不转售数据，致谢写资助说明。
   - 用 100STYLE 补个性化步态（CC BY，必须署名）。
3. **不用**：万代南梦宫、SFU（不可商用）；Mixamo（中国区账号不可用，且不得单独分发原始文件）。
4. **武侠签名招式**（剑法套路、枪棍）：CC0 库是空白，原型做完后从下面三个里选一个：HY-Motion（需作者同意腾讯许可）；作者自录加 Apple Vision 3D；对现有动作做代码变形。见 §6 的 C7。
5. 每个片段在清单里登记 `license / source URL / sha256 / 原动作名`。构建时按白名单（CC0、CMU 条款、CC BY 加署名）校验，不在白名单里的直接拒绝。

---

## 3. Gemini 生多视角图（问题 2）

### 3.1 可行性结论

可行，但**不建议让 Gemini 直接画分离好的部件**：

- Gemini 没有 alpha 通道。
- 分离部件的尺度、角度、关节余量都控制不住，一个视图就要很多张图。
- 现行 GUIDE 是「先出 3 张参考图，再每个视图逐部件出 13 张」，每个体型要 42 张。

推荐改为：**每个角色出 1 张「A 字站姿三视图设定图」**，切件交给 Python（§5）。Gemini 只在补大面积遮挡这类兜底场合用来做定向编辑。

### 3.2 已知局限

| 局限 | 依据 | 对策 |
|---|---|---|
| 不输出 alpha；提示词写「透明」会画出假棋盘格 | 社区多方报告（§9 链接） | 要求平涂浅灰底，比如 `#E6E1D8`，用 BiRefNet 抠图（现有管线） |
| 视图之间细节漂移：背面是臆造的，纹样、腰带结的位置、配饰左右会变；手里拿道具时漂移更严重 | 评测与社区报告（非官方，见 §9）：极端角度和新姿势下一致性会波动；同一张设定图里正面有的腰带侧面就没了；手持道具会加剧漂移 | 三个视图放同一张画布（同一次生成最一致）；去掉手持道具；上传立绘；按识别锚逐项质检；最多重试 2 次 |
| 姿势不一定照做：A 字站姿常被画成手贴身体；宽袖会挡住躯干 | 经验风险（待实测） | 提示词写明腋下要能看到背景；用 sheet_split 检查腋下是否有空隙，不合格就重出 |
| 视角含糊：要侧面可能给 3/4，要背面 3/4 可能给正背面 | 经验风险（待实测） | 用关键点算肩宽与身高之比，自动判断是哪个视图；不对就重出单个视图 |
| 左右衽或惯用手被镜像 | 立绘提示词里已经专门写了右衽规则，说明风险是存在的 | 提示词逐视图重申右衽；质检必查 |
| 各视图身高、头身比不一致 | 经验风险 | 按头顶到脚底的高度统一缩放到 256 px/m |
| 可见水印 | Google 官方：免费档和 Google AI Pro 档的图有可见水印（Gemini sparkle），Ultra 档和 AI Studio 没有；所有图都带 SynthID | 四周留白，入库时裁掉角标（`ingest.py` 已经裁画框） |
| 模型与额度会变 | Google 官方帮助：限额可能不经通知调整。2026 年起 Gemini App 默认用 Nano Banana 2（Gemini 3.1 Flash Image），Plus / Pro / Ultra 可以「Redo with Nano Banana Pro」 | 沿用现有批处理「每张都检查是不是 Pro 模式」；退路是 Nano Banana 2（API 文档写最多 4 个角色参考） |
| 参考图数量 | API 文档：Gemini 3 Pro Image 最多约 6 张物体参考、5 张角色参考，合计约 11 张；发布博客写「最多混合 14 张、保持 5 个人一致」 | 一个角色上传 1 张立绘就够 |
| 隐私 | Gemini Apps 隐私中心：Keep Activity 打开时，上传的媒体可能被人工审阅、用于改进服务 | 上传前请作者关闭 Keep Activity（作者的设置，需作者本人操作，§6） |

### 3.3 推荐的提示词结构

与现有立绘提示词保持同样的英文骨架。【 】里的内容由脚本从角色提示词的「BASE-STAGE CHARACTER FACTS」段落填入：

```text
[参考角色说明 —— 上传立绘时用]
Image 1 is the approved base portrait of 【段誉】. Use it ONLY for identity (face, age, body type),
hairstyle and the exact costume: colors, layers, trims, belt knot position, shoes.
[不上传时换成] CHARACTER FACTS: 【BASE-STAGE CHARACTER FACTS 段落原文】 + 【3 条识别锚】

TASK: a clean CHARACTER TURNAROUND MODEL SHEET of this same person for a 2D cut-out puppet rig.
Exactly THREE full-body figures side by side, left to right:
(1) FRONT THREE-QUARTER: body turned 45° toward the viewer's LEFT, face and chest visible;
    the character's LEFT shoulder, arm and leg are nearer to the viewer.
(2) LEFT-FACING SIDE PROFILE: the character faces the left edge of the image.
(3) BACK THREE-QUARTER: facing away toward the upper-left; back of head and back visible;
    the character's LEFT side is nearer to the viewer.
POSE (identical in all three): neutral A-pose, arms straight and held about 20–30° away from the
body so the armpits show background; palms toward the thighs, fingers relaxed and slightly apart;
legs straight, feet shoulder-width apart, both soles on one common ground line; head level.
Hands EMPTY: no weapon, fan, book, cape or other prop (these are separate layers).
CONSISTENCY: same height (crown and soles aligned), same scale, same costume details in every view;
Han crossed collars right-lapped (wearer's left panel over right) in every view; never mirror a view.
STYLE: same refined realistic hand-painted rendering as image 1; soft diffuse light from the upper
left; muted colors; crisp dark silhouette outline.
LAYOUT: plain flat uniform warm light-grey background (#E6E1D8); no texture, ink wash, ground,
shadow, vignette or frame; at least 6% empty margin around and between figures; orthographic
eye-level view, no perspective distortion. Wide 16:9 canvas.
EXCLUDE: text, labels, arrows, grids, color swatches, extra views, close-ups, duplicate figures,
transparent/checkerboard background.
```

使用要点：

- **单视图兜底**：三视图画布里某个视图不合格时，在同一会话里接着说「Now redraw ONLY the (3) back three-quarter view of the same character, same scale…」。Google 官方建议多轮对话迭代。
- **镜像修正版**：S 级角色需要 `mirrorSafe:false` 修正版时，把三个视图的 LEFT 都改成 RIGHT，再出一张。
- **宽袖长袍**：把 A 字角度降到 15–20°，并加一句「wide sleeves hang naturally without touching the torso」。代价是躯干两侧被遮的部分要靠补画。
- **标准体型（male_std / female_std）**：用同一个模板、不带参考图出，可以替代现在 GUIDE 里每个体型 42 张的逐部件流程。
- **是否套用「Oil painting」模板**：作者对物品图要求用这个模板，三视图建议改为不套模板、以立绘为风格参考（待样张对比）。

### 3.4 每个角色要几张，一天能做多少

| 档 | 内容 | 期望张数 |
|---|---|---:|
| 基础 | 1 张三视图 + 约 0.5 次重试 | **1.5** |
| S 级、主角 | 基础 + 一张面向右的修正版三视图（处理右衽、惯用手、单侧配饰） | **3** |
| 疑难 | 再加 1 张，用于单视图重出或定向补画 | +1 |

- **额度上限**：按每时段 35 张算，每时段 23 人（基础档）或 11 人（S 级）。如果一天用 2 个时段（时段规则待实测），额度上能做 22–46 人。
- **真正的瓶颈是人工质检**：每人约 15–25 分钟，包括看识别锚、修袍下的髋和膝关键点、看预览条带。所以实际约 **每天 15–20 人**。
- **全量估算**：307 个有基础立绘的 NPC，按 S 级 115 × 3 + A 级 160 × 1.5 + B 级 32 × 1.5，约 630 张，即约 18 个时段；人工约 100–130 小时。若 B 级沿用标准体型加调色，可省约 50 张。

---

## 4. Python 融合算法：四条路线比较（问题 3）

### 4.1 (a) 2D 分层部件 + 3D 动作驱动（推荐）

**切件**（离线，CPU）：

1. **抠图拆人**：对三视图画布跑 BiRefNet + pymatting（直接复用 `build_portraits.py` 的 `alpha_for` 和 `cutout`）。按连通域拆出 3 个人形，再按「头顶到脚底的高度 = 身高 × 256」归一到 256 px/m。
2. **关键点**：
   - 首选 Apple Vision 的 2D 人体姿态（19 个关节）和 3D 姿态（17 个关节），零下载。
   - 备选 rtmlib 的 DWPose / RTMW（Apache-2.0，onnxruntime CPU，模型约 100–200 MB），可以多给脚和手的点。
   - 实测在立绘上，**袍子下的髋、膝置信度都低于 0.5**（4 张全部如此，§8.3）。所以袍下关节要用 tech/09 §1.2 的骨长表从踝点和骨盆反推，再人工微调。
   - 背面视图里的左右用已知朝向消歧：三个视图都面向左，近侧是角色左侧。
3. **分区**：
   - 轮廓内每个像素按「到各骨段胶囊体的归一化距离」分给 13 个部件。
   - 加区域先验：躯干限定在肩线和髋线之间；裙或袍从腰线一直到下摆；头部在颈线以上。
   - 关节处切成**子部件侧带圆帽**（半径约等于肢体半宽），父部件保留整圆，这样转动时不露缝。
   - 可选用 SAM 2.1 tiny/small（Apache-2.0，约 150 MB）以骨段中点为提示做边界细化。SAM 3（SAM License，可商用）和 Sapiens 部位分割（CC BY-NC 4.0）都太大或许可不合适，不进主线。
4. **补画遮挡**：
   - 父部件被子肢体挡住的区域（例如侧视图里被近侧手臂挡住的躯干侧面）：面积不超过约 15% 的，用 `skimage.restoration.inpaint_biharmonic`（已装）或 OpenCV Telea；更大的用 LaMa（Apache-2.0，ONNX 约 200 MB）。
   - 面积超过 15% 的标成人工处理，或请 Gemini 做 1 张定向补画。
   - 侧视图的远侧手臂和腿直接复用近侧贴图，在运行时压暗约 15%，不用另外补画。
5. **摆正和定枢轴**：
   - 四肢按骨轴旋转到竖直（Lanczos 重采样），枢轴和子关节直接取关键点坐标。
   - 骨长换算成米，写进 manifest。
   - 被长袍完全遮住的大腿，用标准体模板加采样的裤色生成，以防踢腿时露出来。

**驱动**：

- 运行时把片段里的 3D 骨向量按角色朝向相对相机的偏航旋转，再正交投影到公告板平面。投影只用水平和高度，与直立公告板和 `1/cos30°` 的纵向补偿一致。
- 然后用 rig 自己的骨长做 2D 正向运动学。每个部件的仿射是：枢轴放在父关节，骨轴指向子关节，沿骨方向缩放取「投影长度 / 骨长」并设下限 0.45；躯干另乘肩宽比，夹在 [0.6, 1.4]。
- 躯干、骨盆、头按各自朝向偏航选视图：front34、side、back34 及其镜像，加 10° 滞回。
- 部件 z 由骨段中点的深度量化，写进 `sortTint[1]`。
- 子部件挂在**投影后的关节上**，不挂在父贴图的 `childJoint` 上。

实测（§8.1–8.2）证明这三件事都必需：

- **按部件选视图**：剑招的胸部朝向在 −178° 到 +36° 之间变化，0.5–2 秒内要切 3–10 次。
- **动态 z**：25–60% 的帧里手臂在躯干平面前后翻转。
- **缩短下限**：肢体正对镜头时投影长度只剩 2–16%。

另外，4 个点的仿射拟合在侧视图会退化（两肩投影重合，行列式翻号），所以躯干改用「沿脊柱的相似变换 + 肩宽比」这种受约束的形式。

**先例**：Meta 的 AnimatedDrawings（MIT，在 macOS 上测试过）就是用「3D 骨骼投影 + 不同身体部位用不同投影平面（twisted perspective）+ 用深度驱动关节决定绘制顺序」来驱动单张画的 2D 角色，并支持手工修正关键点。本方案相当于它的多视图、实例化版本。

### 4.2 (b) 3D 人台投影贴图

- **做法**：用 CC0 人台，例如 Quaternius Universal Base Characters（和 UAL 同一骨架，免重定向），或 MakeHuman / MPFB（资产和导出物都是 CC0）。在三个已知偏航角的正交视图上，用关键点三角化出 3D 关节，拟合骨长；按法线与视线夹角挑视图，把图像投影烘焙成贴图；直接用动作库驱动骨骼。
- **长袍、头发、饰物怎么办**：
  - 人台上没有这些几何体，必须另做代理：
    - 长袍做成挂在骨盆上、权重混合左右大腿的锥形裙；
    - 宽袖做成挂在前臂上的喇叭形，加弹簧骨；
    - 发髻和冠做成附着在头骨上的块体。
  - 也可以用三视图（加上镜像共 6 个视图）做视觉外壳（体素雕刻），自动得到整体包络，再自动蒙皮。代价是袍子和腿粘成一体，踢腿时拉伸严重。
- **问题**：
  - 投影有接缝，掠射角处纹理拉花；
  - 画里自带的明暗在转身后会和场景光矛盾；
  - 三个视图覆盖不到手臂内侧和胯下；
  - 运行时要么做实时 3D 蒙皮（每人 1 个以上 draw call，破坏 2 draw call 契约，100 人在手机上压力大），要么离线渲染成帧（回到被否决的逐帧路线，换装还要重渲）。

### 4.3 (c) 图生 3D + 自动绑骨

| 工具 | 本机（M2 Pro、无 NVIDIA、剩 12 GB）能否跑 | 许可与地区 |
|---|---|---|
| TRELLIS.2-4B（微软） | **不能**：官方只在 Linux + 24 GB 以上 NVIDIA 上测试 | MIT（nvdiffrast 等依赖另有许可） |
| 混元 3D 2.1（腾讯） | 官方需要 CUDA；有社区 MPS 移植（非官方），形状生成 2–5 分钟、内存 8–16 GB，贴图阶段大多依赖 CUDA；权重有数个 GB，本机磁盘吃紧 | 腾讯混元社区许可：**不适用于欧盟、英国、韩国**；月活超过 100 万要另申请；不得用输出改进别的 AI；腾讯不主张输出物的权利 |
| SF3D / SPAR3D（Stability） | macOS 15.2 以上的 MPS 后端是实验性的 | Stability 社区许可（年收入 100 万美元以下免费） |
| UniRig（自动绑骨） | **不能**：需要 8 GB 以上的 CUDA | MIT |
| Mesh2Motion 自动绑骨 | 能，浏览器里套模板骨架、手动对点、自动算权重 | MIT / CC0 |
| Meshy（云端） | 能 | 免费档每月 100 积分，图生 3D 每次约 20 积分；绑骨和动作 0 积分；**免费档输出物归 Meshy 所有，以 CC BY 4.0 授权给用户**；Pro 档 $20/月 1000 积分 |
| Mixamo 自动绑骨 | 中国区账号不能用 | — |

- **结论**：本机只能靠社区移植或云服务。单张立绘重建出的背面是模型臆造的，贴图发糊，长袍会和腿粘成「裙状实体」，自动蒙皮后走路踢腿都会拉伸。
- 实时 3D 的问题与 (b) 相同；渲成 8 方向精灵则违反 AR-22 的装备可见要求。只适合动物、Boss 或建筑这类专项。

### 4.4 (d) 姿态条件逐帧生图

- **做法**：把动作片段在每个视图里渲成火柴人或深度图，和立绘一起交给 Gemini，逐帧画。
- **成本**：走路 8 帧 × 3 视图 + 剑招 10 帧 × 3 视图 = 54 张，加 30% 重试约 70 张。**一个角色两个动作就耗掉约 2 个时段**，307 人要几百个时段。
- **一致性**：Gemini 不保证照骨架摆姿势，帧间的脸、纹样、手、兵器会闪烁；还要配准每帧的位置和尺度。
- **AR-22**：装备一换就要整套重画，等于违反「装备行走可见」。

### 4.5 打分

5 分最好。权重：每角色成本 25%、画风一致 25%、工程量 20%、手机性能 15%、许可风险 15%。

| 路线 | 每角色成本 | 与写实手绘立绘的一致性 | 工程量 | 手机端性能 | 许可风险 | 加权 | AR-22（装备可见） |
|---|---:|---:|---:|---:|---:|---:|---|
| **(a) 2D 部件 + 3D 动作驱动** | 5（1.5–3 张图；人工 15–25 分钟） | 4（贴图直接取自 Gemini 写实画；刚性部件有「剪纸感」，一拍二会让它更像 2D 动画） | 3（切件、补画、片段烘焙、运行时投影，中等） | 5（仍是 2 个 draw call；CPU 实测 0.10 ms/100 人） | 5（CC0 动作 + 自出图） | **4.35** | ✓ |
| (b) 3D 人台投影贴图 | 3（2–4 张图 + 1–3 小时代理和拟合） | 2（接缝、拉花、光照冲突） | 2（拟合、投影、代理网格、蒙皮） | 2（蒙皮网格占 draw call 和带宽） | 5 | 2.70 | △（武器能挂骨，衣甲要重投影） |
| (c) 图生 3D + 自动绑骨 | 2（云积分或本机跑不动 + 1–2 小时清理） | 2（「手办感」，背面臆造） | 2 | 2（实时 3D）/ 4（预渲染） | 2–3（混元地域条款、Meshy 免费档要署名） | ≈2.0 | △ / ✗ |
| (d) 姿态条件逐帧生图 | 1（约 70 张 / 人 / 2 个动作） | 3（单帧 5，时间一致性 1） | 3 | 3（精灵图集占显存大） | 4 | 2.65 | ✗ |

---

## 5. 推荐方案（问题 4）

### 5.1 路线与理由

采用 **(a)**，并保留现有程序步态作为默认移动方式：

1. **最省钱**：每个角色只出 1 张三视图，比现行逐部件规程每体型 42 张少一个数量级。动作数据全部 CC0，零费用。
2. **契合现有架构**：沿用 `tianshu_rig` v1 的 13 源部件和 16 个运行时部件、实例缓冲、2 个 draw call、装备层。新增的只是「片段 → 每部件姿态」这一层。
3. **符合 AR-22**：行走仍是代码轨迹；动作片段同样由代码逐帧算出部件变换并分别贴图；武器和其他装备照常是独立层，换装不用重画。
4. **画风**：部件直接取自与立绘同风格的 Gemini 图，没有 3D 渲染的味道。

### 5.2 数据流

```text
立绘 por_*_base.png ─┐   角色提示词「BASE-STAGE FACTS」+ 识别锚
                     ▼   （作者同意后上传立绘；否则只用文字）
     Gemini Pro：A 字三视图设定图（front34 | side | back34，平涂底，16:9）
                     │ tools/imagegen/ingest.py（裁框、归档原图、记录 provenance）
                     ▼
tools/rig/sheet_split.py  ── BiRefNet + pymatting → 3 个人形 → 256 px/m，脚底对齐
                     ▼
tools/rig/keypoints.py    ── Apple Vision 2D/3D（vision_pose.swift）| 可选 DWPose
                     │      → keypoints.json → 人工修正（袍下髋膝）
                     ▼
tools/rig/segment_parts.py ─ 胶囊分区 + 关节圆帽 (+SAM2.1 细化) → 3×13 部件
                     │      补画遮挡 → 四肢摆正 → 枢轴和子关节取自关键点
                     ▼
tools/rig/make_parts.py（改：读枢轴旁注）
     → assets/default/rig/npc/<npcId>__<variant>/{front34,back34,side}/*.png + manifest.yaml

CC0 动作 GLB / BVH（Mesh2Motion、UAL、KayKit、CMU）
                     ▼
tools/rig/clip_import.py  ── 解析 → 映射到 tianshu_humanoid（约 20 关节）→ 30 fps 采样
                     │      → 骨向量、躯干/骨盆/头偏航、剑轴、根运动、事件 → 质检指标
                     ▼
assets/default/rig/clips/<clipId>.json（tianshu-clip.v1）+ clips/manifest.yaml（来源、许可、sha256）
                     ▼
tools/rig/preview.py --clip ── 8 方向 × 帧的条带和 GIF + 指标 JSON（人工质检、金样回归）

运行时（packages/render/src/rig）
core 事件 → CueApi.playAnim(id, clip, facingYawDeg) → RigInstance.playClip()
  → clip-player：一拍二采样、事件、和步态交叉淡入淡出
  → project：偏航旋转 → 2D 正向运动学（rig 骨长）→ 每部件 {视图, 镜像, 仿射, z}
  → writePose → RigInstanceBuffer（56 B）→ RigBatch（2 个 draw call）
```

### 5.3 要新增或改动的模块

**`tools/rig/`（新增）**

| 脚本 | 职责 | 依赖 |
|---|---|---|
| `sheet_split.py` | 拆三视图、归一尺寸、按肩宽与身高之比判断视图 | 复用 `tools/portrait`；无新依赖 |
| `keypoints.py` + `vision_pose.swift` | Apple Vision 2D/3D 关键点，用已知视图朝向消歧左右，用骨长先验补袍下关节 | Swift（编译要加 `-sdk MacOSX15.5.sdk`）；可选 rtmlib |
| `kp_fix.html` | 本地小页面，拖动修正关键点并存 JSON；也可以直接改 YAML | 无 |
| `segment_parts.py` | 分区、圆帽、补画、摆正、枢轴、侧视图远肢复用、被遮部位从标准体回退 | numpy、scipy、scikit-image（已装）；可选 opencv-python-headless、LaMa ONNX |
| `clip_import.py` | 读 glTF/BVH（numpy 实现，原型脚本已证明可行）；骨架映射表（UE、Rigify DEF、Mixamo、CMU）；烘焙；校验 | 无新依赖 |
| `clip_metrics.py` | 缩短、视图切换次数、z 翻转、关节缝隙、踩滑等质检指标 | 无 |
| `preview.py`（改） | 加 `--clip/--dir8/--gif`，输出指标 JSON | Pillow |
| `templates.py`（改） | 加入 `tianshu_humanoid` 关节表和「骨 → 部件」映射 | — |
| 测试 | 合成人形的切件金样、片段解析向量、许可白名单 | pytest |

**`packages/render/src/rig/`**

| 文件 | 改动 |
|---|---|
| `types.ts` | 新增 `RigClip`、`ClipEvent`、`PartPose`；`RigManifestPart` 加可选的 `boneLengthM`、`farFromNear`、`mirrorSafe`；`RigManifest` 加可选的 `kind`、`identity`、`skeleton`、`attachments` |
| `clip.ts`（新） | 加载并校验 `tianshu-clip.v1`，int16 解码进预分配缓冲 |
| `project.ts`（新） | 偏航旋转、2D 正向运动学、按部件选视图（10° 滞回）、缩短下限、躯干肩宽比、动态 z、剑轴；全部零分配 |
| `clip-player.ts`（新） | 一拍二采样、`hit`/`end` 事件、循环、和步态交叉淡入淡出（160 ms）。播放速率 = core 速度 / 片段固有速度，夹在 [0.8, 1.4]：只改表现，不反推 core。根运动默认原地播放 |
| `character.ts` | 新增 `playClip(id, {facingYawDeg, rate, onEvent})` 和 `stopClip()`。`writePose` 改为消费每部件的 `{viewIndex, mirrored, affine, z}`，步态路径也走同一个入口。附加槽加 `hair_back`、`sleeve_L/R` 弹簧层（复用披风弹簧） |
| `manifest.ts` + `batch.ts` | 身份 rig 多了以后，图集改用 `DataArrayTexture`：实例 flags 里带层号，着色器用 `sampler2DArray`，**仍是 2 个 draw call**；或者按区域重新装箱 |
| `scene.ts`（`/rig-demo`） | 片段选择、8 方向轮播、对比「程序步态 / 动作库步态」的开关 |
| 测试 | 投影金样向量、片段 schema、性能测试（片段模式下 100 人 P95 ≤ 0.80 ms，沿用 ENG-12b 方法） |

**数据与文档**

- 新增 `content/anim/clip-map.yaml`：把 `MoveDef.anim.clip` 的键映射到片段 ID 加参数，例如 `palm_heavy → clip_two_hand_blast`。数据驱动，不硬编码。
- 修订 tech/09，升到 v1.1：§1.3/§1.4 的近侧约定；新增 §4.6「片段驱动」；RIG-O03 收口。
- 修订 tech/07 §4.5 和 §5.4：选库结论，三视图切件规程。
- 改 `assets/default/prompts/rig/GUIDE.md`：逐部件出图改为「三视图 + 工具切件」。

**清单格式扩展**（向后兼容，新字段都可选）：

```yaml
schema: tianshu-rig.v1
set: npc_zhujue__ch00_m
kind: identity            # standard | identity
identity: {npcId: npc_zhujue, variant: ch00_m, portrait: por_npc_zhujue__ch00_m_base, sheetSha256: "<hex>"}
skeleton: tianshu_humanoid.v1
nearSide: L               # 三视图都面向画面左，近侧为解剖学左侧（见 §5.5）
boneLengthsM: {torso: 0.53, head: 0.24, upper_arm: 0.31, forearm: 0.27, hand: 0.19, thigh: 0.45, shin: 0.41, foot: 0.25}
parts:
  - {id: upper_arm_L, view: front34, file: front34/upper_arm_L.png, size: [58, 92], pivot: [29, 8],
     childJoint: {elbow_L: [29, 85]}, zOrder: 13, tintable: clothPrimary,
     source: {keypoints: [shoulder_L, elbow_L], inpaintedPct: 3.2}}
attachments:
  - {slot: hair_back, parent: head, view: back34, file: back34/hair_back.png, pivot: [40, 6], spring: {k: 36, c: 10.8}}
```

```json
{
  "schema": "tianshu-clip.v1",
  "id": "clip_sword_regular_a",
  "source": {"pack": "Mesh2Motion human-base-animations.glb", "anim": "Sword_Regular_A", "license": "CC0-1.0", "url": "<raw url>", "sha256": "<hex>"},
  "skeleton": "tianshu_humanoid.v1",
  "fps": 30, "frames": 15, "loop": false, "rootMotion": "inPlace",
  "nativeSpeedMps": 0,
  "mainHand": "R",
  "events": [{"t": 0.20, "type": "hit"}, {"t": 0.47, "type": "end"}],
  "viewHints": {"nearHandWeapon": true, "yawAssistMaxDeg": 30, "minForeshorten": 0.45},
  "tracks": {"encoding": "int16-unit-xyz", "bones": ["torso", "head", "upper_arm_L", "..."], "data": "<base64>"},
  "facingYawDeg": {"pelvis": "<base64>", "chest": "<base64>", "head": "<base64>"},
  "weaponAxis": {"R": "<base64 int16 xyz>"},
  "qa": {"minForeshorten": {"front34": 0.39, "side": 0.08, "back34": 0.28}, "torsoViewSwitches": {"front34": 3}, "armDepthFlipPct": {"front34": 59}}
}
```

每个片段每帧约 110 B，1.5 秒的片段约 5 KB；100 个片段压缩后约 200–500 KB（初值）。

### 5.4 特殊服饰与动作的处理

| 问题 | 做法 |
|---|---|
| **长袍** | `pelvis_skirt` 画成长裙片。裙片用三点仿射：两个髋点固定，下摆中点跟随两膝中点 × 0.6。两腿张开时下摆按两膝距离加宽，等于剪切加展宽，2×3 仿射能直接表达。大腿画在裙片后面。踢腿时腿从下摆钻出，效果类似开衩袍。S 级可以把裙片拆成左右两片，各跟一侧大腿，占附加槽 |
| **宽袖** | 走路时袖子随前臂刚性转动。S 级可加 `sleeve_L/R` 弹簧层：挂在肘部，按重力反向摆动，参数沿用披风弹簧 |
| **披发、飘带** | 拆出 `hair_back` 附加层（背后的长发），挂颈点加二阶弹簧；头前的头发随头部转动 |
| **冠、帽、发髻** | 身份 rig 里直接烘焙进 `head`；换头饰装备时按现行规则覆盖 `hair_or_headgear` |
| **兵器** | 片段离线算出每帧剑轴（手骨朝向 × 握持标定）。武器贴图挂在握点，方向取投影后的剑轴，沿轴缩短的下限 0.45。剑尖轨迹可以直接喂给 VFX 刀光。双手兵器的副手按 tech/09 §2.3 用约束点 |
| **惯用手与镜像** | 镜像方向（Dir8 为 5、6、7）右衽会变左衽、右手变左手。默认接受（经典 2D 做法）。对兵器招式开 `nearHandWeapon`：主手落在远侧时把片段左右镜像，保证兵器在近手，可读性更好。主角和 S 级出面向右的修正版三视图，从根上解决 |
| **西式剑招 → 武侠味** | 代码风格化：时间重映射（蓄势慢、出招快、收势停一拍）；主手剑尖目标加偏移，把劈改成刺、撩；躯干前倾加大；配合一拍二和外放、残影 VFX（design/23）。签名招式另行补源（§2.3） |
| **旋转超过 180° 和倒地类** | 投影时允许 ±30° 的「偏航辅助」，让动作平面尽量和画面平行；倒地方向选成与视线垂直；实在读不清的姿势，用 2D 关键姿势代替（RIG-O03 的兜底） |
| **踩滑** | 走跑片段的固有速度由离线估算得到。实测 UAL 的 Walk_Loop 约 0.97 m/s，周期 1.33 s。播放速率按 core 速度缩放并夹在 [0.8, 1.4]，超出范围就退回程序步态 |

### 5.5 必须先修的规格缺陷：近侧与 L/R

- **向量计算的结果（§8.4）**：三个视图都「面向画面左」时，离镜头近的是**角色解剖学左侧**。front34 时近侧在画面**右**，side 时在中间，back34 时在画面**左**。
- **现状**：
  - tech/09 §1.3 写 `nearSide:R`，§1.4 的 z 表三个视图都把 `*_R` 放最前（13–15）。
  - `make_parts.py` 和 `placeholder.ts` 把 `shoulder_R` 固定放在画面右侧（宽度的 86%），三个视图都一样。
  - rig 部件提示词写「近侧为右侧（nearSide:R）」，和「面向屏幕左下」互相矛盾。
- **后果**：
  - 程序步态左右对称，所以现在看不出问题。
  - 但从物理上正确的 Gemini 三视图切件时，back34 会把远侧手臂画到背部前面，侧视图同理。
  - 3D 片段的左右映射也会错。
- **默认修法（需作者确认 C4）**：
  - `_L/_R` 统一按解剖学左右理解；三个视图都面向画面左，近侧是 `L`。
  - z 表三个视图都改成 `*_L` 在前。
  - 关节位置一律取自关键点，不再用 14% / 86% 的写死值。
  - 部件提示词改成「角色的左肩、左臂、左腿离镜头更近（front34 时位于画面右侧）」。
  - 片段层按解剖学左右投影，近远完全由深度决定。

### 5.6 最小原型

**目标**：用 1 个角色、走路 + 1 个剑招、3 个视图（含镜像，等于 8 个方向），验证切件质量、片段投影、运行时性能和观感。

**输入**

| 输入 | 内容 |
|---|---|
| 角色 | 主角·男 `npc_zhujue`，立绘 `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png`。短褐、绑腿、发髻、宽裤，属于中等难度；他是要换装的主角，正好顺带验证装备层 |
| Gemini | 1 张 A 字三视图（§3.3 模板），最多重试 2 次；作者同意就上传立绘，否则用文字事实 |
| 动作 | Mesh2Motion 的 `Walk`（或 UAL1 `Walk_Loop`）和 `Sword_Regular_A`（0.5 s，属中等难度：躯干切 3–5 次视图）；备选 UAL1 `Sword_Attack`。都是 CC0 |
| 兵器 | 仓库里已入库的一把剑物品图，走现有 `tools/item` 的武器层流程 |
| 代码 | 现有 `packages/render/src/rig`、`tools/rig`，以及本次在 `scratchpad/proto/` 写的 GLB 读取和投影分析原型（可直接移植） |

**步骤与工时**（编码由 GPT CLI 执行器做；作者约 1–2 小时，用于批准上传、看 GIF）

| # | 步骤 | 产出 | 工时 |
|---|---|---|---:|
| P0 | 在原型分支按 §5.5 修近侧约定：z 表、`make_parts` 和占位清单的关节来源 | 补丁和测试 | 2 h |
| P1 | 出图并入库（Gemini 出图 agent） | 三视图 1–3 张 | 0.5 h |
| P2 | `sheet_split.py` | 3 个 256 px/m 人形 | 4 h |
| P3 | `keypoints.py`、`vision_pose.swift`、修正页 | keypoints.json | 6 h |
| P4 | `segment_parts.py`（分区、圆帽、补画、摆正、枢轴） | 39 张部件 PNG 和旁注 | 10 h |
| P5 | `make_parts.py` 支持枢轴旁注和身份 rig 字段 | manifest 通过 `--check` | 3 h |
| P6 | `clip_import.py`（glTF 读取、骨架映射、烘焙、剑轴标定、事件） | 2 个 clip JSON | 6 h |
| P7 | `preview.py --clip`、`clip_metrics.py` | 8 方向条带、GIF、指标 JSON | 5 h |
| P8 | 运行时 `clip.ts`、`project.ts`、`clip-player.ts`，接入 `character.ts`，`/rig-demo` 加开关 | 浏览器里可播放 | 12 h |
| P9 | 测试：schema、投影金样、性能 | `pnpm check` 通过 | 4 h |
| P10 | 汇总指标，交作者 A/B 评审 | 原型报告 | 2 h |
| | **合计** | | **约 54 h（7 个工作日左右）** |

**判定标准**（全部可量化，阈值为初值）

| 编号 | 指标 | 合格线 |
|---|---|---|
| Q1 身份一致 | 3 个视图逐项过 5 条识别锚（发髻、短褐主色、腰带色和结位、裤色、绑腿和鞋）；主色在 Lab 空间 k-means 取前 3 色，与立绘的 ΔE2000 | 5/5；ΔE ≤ 10 |
| Q2 切件 | 自动产出 39 张部件；需人工修的；`make_parts.py --check` 和 RIG-V01/V02；枢轴与关键点的偏差 | 39/39；≤ 3 张；全部通过；≤ 2 px（256 ppm） |
| Q3 关节缝隙 | 静止姿势，以及 8 个方向 × 走路 12 帧：每个关节中心 3 px 内的透明像素数 | 0 |
| Q4 投影正确 | 渲染出的部件关节点与 3D 投影关节点的误差；肢体缩放是否低于 0.45；躯干每秒视图切换次数 | ≤ 2 px（128 ppm）；从不低于；≤ 8 次/秒 |
| Q5 踩滑 | 走路支撑脚每个支撑相的水平漂移，和程序步态并列对比 | ≤ 2 cm |
| Q6 兵器 | 握点偏差；剑轴方向与 3D 投影的偏差 | ≤ 1 px；≤ 5° |
| Q7 性能 | 100 人片段模式的 rig CPU（ENG-12b 方法：预热 120 帧，3 轮 × 600 帧取最好一轮的 P95）；稳态每帧分配；draw call | P95 ≤ 0.80 ms；0 B；2 个 |
| Q8 观感 | 作者对比 GIF：程序步态 vs 动作库走路；剑招 3 视图加镜像 | 作者判定通过 |
| Q9 成本记录 | Gemini 张数；人工分钟数；流水线 CPU 时间 | ≤ 3 张；≤ 30 分钟；≤ 3 分钟 |

**原型通过后的铺开节奏**（初值）

1. 标准体型改走三视图切件：1 天。
2. 片段库 v1，30–40 个：走跑变体、剑招组、拳掌、踢、受击、倒地起身、坐、打坐、眩晕、投掷、闪避、格挡。约 2–3 天。
3. S 级 115 人：约 6–8 天。
4. A 级 160 人：约 8–10 天。
5. `MoveDef.anim.clip` 映射：约 2 天。
6. 三台真机测性能。

---

## 6. 风险与需作者确认（问题 5）

### 6.1 风险

| # | 风险 | 影响 | 缓解（默认） |
|---|---|---|---|
| R1 | Gemini 三视图一致性不足：背面臆造、纹样和结位漂移、左右衽翻转 | 返工，消耗额度 | 三视图放同一画布；上传立绘；识别锚质检；最多重试 2 次；不行就单视图补出 |
| R2 | 不照做 A 字站姿，宽袖遮挡躯干 | 补画面积大 | 提示词写死要求；自动检查腋下空隙；超过 15% 转人工或 Gemini 定向补画 |
| R3 | 袍下和背面关键点不准（实测袍下髋膝置信度 < 0.5） | 枢轴偏 | 用骨长先验反推；每人 3–5 分钟人工修正 |
| R4 | 「剪纸感」、接缝、部件换视图时跳变 | 观感 | 关节圆帽、一拍二、10° 滞回、近侧手臂压在躯干上；以原型 Q3、Q8 为闸门 |
| R5 | 旋转超过 180° 和倒地类动作难读（实测缩短到 2–13%） | 观感 | 偏航辅助 ±30°、挑选动作、退回 2D 关键姿势 |
| R6 | 动作库动作是西式的，不像武侠 | 风格 | 代码风格化 + 签名招式另行补源（C7） |
| R7 | 许可登记出错：Mesh2Motion 的 mocap 组来源未注明，Rokoko 的再分发条款没写，NC 数据混入 | 法务 | 清单强制登记 `license/source/sha256`，构建期白名单校验；mocap 组先不用，核实后再纳入 |
| R8 | §5.5 的近侧缺陷没修就开始切件 | 远侧手臂画到最前 | 原型 P0 先修 |
| R9 | 身份 rig 变多后图集变多页，可能突破 2 draw call 契约 | 性能 | 用 `DataArrayTexture`；按区域装箱；低档 64 ppm |
| R10 | Gemini 模型或额度变化（2026 年默认已改为 Nano Banana 2） | 产能 | 每张检查是不是 Pro 模式（批处理已做）；退路 Nano Banana 2；按每时段 35 张排程 |
| R11 | 隐私与版权：立绘上传到 Google；Pro 档有可见水印 | 合规 | 作者关闭 Keep Activity；裁角标；provenance 里记录 SynthID / C2PA |
| R12 | 磁盘只剩约 12 GB | 装不下大模型 | 只用 Apple Vision 和小 ONNX，不装 torch、SAM3、混元 |
| R13 | Swift 工具链和 SDK 不匹配 | 关键点工具编译失败 | 已实测加 `-sdk MacOSX15.5.sdk` 可以编译 |
| R14 | 执行器在沙箱里没网，或出图工具不可用（之前出过） | 停工 | 图片任务 `web: true`；本地脚本不依赖网络 |
| R15 | 片段的 `hit` 事件被误当成玩法时点 | 违反 core 唯一权威 | `hit` 只用于表现同步，测试里断言 core 不读 render 事件 |

### 6.2 需作者确认（附默认建议）

| # | 问题 | 默认建议 |
|---|---|---|
| **C1** | 能否把立绘上传到 Gemini 作身份参考？（作者对物品图要求过不上传参考图） | **只上传主角和 S 级（115 人）**；A、B 级用提示词文字事实。上传前作者本人在 Gemini 里关闭 Keep Activity |
| C2 | 具名 NPC 是否改用「每人一套身份部件」，即偏离 AR-22 原定「两个体型共 78 张」？ | **是**：具名 NPC 用身份 rig，衣服烘焙进部件，兵器仍走装备层；主角和可换装队友沿用标准体加装备层；路人沿用标准体加调色 |
| C3 | 改出图规程：不再逐部件出 39 张，改为「三视图 + 工具切件」；GUIDE 里「禁止裁旧立绘冒充部件图」改为「只禁止裁旧立绘，允许从新出的 A 字三视图切件」 | **同意** |
| C4 | 按 §5.5 修订 tech/09 的近侧和 L/R 约定 | **同意**：解剖学左右，近侧是 L |
| C5 | 镜像策略（右衽、惯用手） | 普通角色接受镜像；**主角和 S 级加出一张面向右的三视图** |
| C6 | 动作来源许可白名单 | **只用 CC0、CMU 条款、CC BY（要署名）**；不用 NC 数据和 Mixamo |
| C7 | 武侠签名招式（剑法套路、枪、棍）的补充来源 | 原型阶段先不引入；之后在 HY-Motion（腾讯许可，HF Space 在大陆需要代理）、作者自录视频 + Apple Vision 3D、代码变形三者中选，**倾向自录**（零许可风险） |
| C8 | 行走用程序步态还是动作库的 walk？ | 原型做 A/B 再定；默认**保持程序步态**，与 AR-22 原话「代码写轨迹」一致 |
| C9 | 战斗大动作是否全部走「分层部件 + 动作轨迹」（收口 RIG-O03）？ | **是**；整身帧只用于立绘切入（cutin） |
| C10 | 要不要买 UAL Pro（$9.99 起，CC0）？ | 先不买；免费档 + Mesh2Motion 足够做原型 |
| C11 | 三视图要不要套「Oil painting」模板？ | 默认不套，以立绘为风格参考；出样张后对比再定 |

---

## 7. 和现有任务的衔接（供协调者拆任务）

- **ART-rig-parts-male / female**：规程改为每个体型 1 张 A 字三视图（加重试）+ 工具切件；现有 84 份逐部件提示词作废，或只在补画时当参考。
- **新 TOOL-rig-sheet**：P2–P5、P7。
- **新 TOOL-rig-clips**：P6、片段库 v1、许可白名单。
- **新 ENG-12c-clip**：P8–P9。依赖 ENG-12；ENG-10、ENG-11（战斗表现）随后接入 `playAnim`。
- **DES-rig-v1.1**：修订 tech/09 和 tech/07（C3、C4、C9）。

---

## 8. 本次本地验证（全部在会话草稿目录，未入仓库）

### 8.1 CC0 片段投影到三视图的统计

脚本：`scratchpad/proto/analyze_clips.py`、`view_switch.py`，用 numpy 自写的 glTF 正向运动学。

角色朝向设为 front34 = +45°、side = +90°、back34 = +135°，投影用正交加竖直平面。表中：「最短投影比」是肢体投影长度除以骨长的最小值；「z 翻转率」是手肘、手腕相对躯干平面的前后关系与第 0 帧不同的帧占比；「视图切换」是躯干按胸部朝向选视图、加 10° 滞回后的切换次数。

| 片段（来源） | 时长 | 胸部偏航范围 | 躯干视图切换（front34 / side / back34） | z 翻转率 | 最短投影比 |
|---|---:|---|---|---|---|
| Walk_Loop（UAL1） | 1.4 s | −8° ~ +13° | 0 / 0 / 0 | 0% | ≥ 0.70（只有手和脚） |
| Hit_Chest（UAL1） | 0.4 s | +4° ~ +5° | 0 / 0 / 0 | 0–7% | ≥ 0.51 |
| Punch_Jab（UAL1） | 0.9 s | +10° ~ +53° | 2 / 0 / 0 | 0–18% | 0.23（front34 的手） |
| Sword_Attack（UAL1） | 1.6 s | −133° ~ +50° | 6 / 6 / 6 | 25–39% | 0.16–0.26 |
| Sword_Regular_A（UAL2） | 0.5 s | −178° ~ +36° | 3 / 5 / 5 | 39–59% | 0.08–0.39 |
| Sword_Regular_C（UAL2） | 2.0 s | −446° ~ +26°（原地转满一圈） | 10 / 9 / 8 | 32–57% | 0.04–0.13 |
| Melee_Hook（UAL2） | 0.5 s | −41° ~ +98° | 3 / 5 / 4 | 28–52% | 0.11–0.21 |
| Hit_Knockback（UAL2） | 0.9 s | −14° ~ −8° | 0 / 0 / 0 | 0–23% | 0.02（front34 时手正对镜头） |
| Death01（UAL1） | 2.4 s | −10° ~ +18° | 0 / 2 / 2 | 0–33% | 0.10–0.13 |

**结论**：

- 移动、待机、受击直接可用。
- 攻击类必须同时具备按部件选视图、动态 z、缩短下限。
- 原地转圈和倒地要靠偏航辅助或改用 2D 关键姿势。
- 4 点仿射在侧视图退化（两肩投影重合，行列式翻号），所以躯干改用「脊柱相似变换 + 肩宽比」。

### 8.2 运行时微基准

脚本：`scratchpad/proto/clip_bench.mjs`，Node 22。

- 测的是 100 个角色 × 16 个部件，每帧完成：int16 轨迹线性插值、偏航旋转、2D 正向运动学、计算仿射（不用三角函数）、深度 z、带滞回的视图选择。全程零分配。
- 方法同 ENG-12b：预热 120 帧，3 轮 × 600 帧，取 P95。
- 结果：每轮 P95 为 0.103–0.218 ms，**最好一轮 0.103 ms**。测试时 loadavg 约 15，机器 12 核（M2 Pro）。
- 现有预算是关节求值 0.55 ms、总计 0.80 ms。手机按慢 3–5 倍估，约 0.3–0.5 ms（待实测）。

### 8.3 Apple Vision 关键点探测

脚本：`scratchpad/proto/vision_pose.swift`，编译要加 `-sdk MacOSX15.5.sdk`。

| 立绘 | 2D 关节数 | 平均置信度 | 置信度 < 0.5 的关节 | 3D 关节数 |
|---|---:|---:|---|---:|
| 主角·男 | 19 | 0.66 | 双髋、双膝、左耳、根点 | 17（估计身高 1.80 m） |
| 段誉（长袍） | 18 | 0.63 | 双髋、双膝、左脚、根点 | 17 |
| 萧峰（丐帮装） | 19 | 0.62 | 双髋、双膝、左耳、根点 | 17 |
| 主角·女 | 18 | 0.61 | 双髋、双膝、双脚、根点 | 17 |

**结论**：上半身和头部可靠；袍下的髋和膝必须靠骨长先验加人工修正。

### 8.4 近侧向量验算

用 `r = f × up` 计算角色右侧方向（屏幕坐标：x 向右、z 指向观者）：

| 视图 | 近侧（解剖学） | 近侧在画面的位置 |
|---|---|---|
| front34（面向左下） | 左 | 画面右 |
| side（面向左） | 左 | 画面中间 |
| back34（面向左上） | 左 | 画面左 |

所以 tech/09 的 `nearSide:R` 和「右侧肢体 z 在前」与物理不符（§5.5）。

### 8.5 下载记录

都在草稿目录；单个文件不超过 20 MB；Mesh2Motion 只取了 GLB 的 JSON 头。

| 文件 | 来源 | 大小 | SHA-256 |
|---|---|---:|---|
| `universal_animation_librarystandard.zip`（UAL1 Standard） | https://opengameart.org/sites/default/files/universal_animation_librarystandard.zip | 14,541,205 B | `18ff1a7215f4852b320203e8aaf02a1578b5c8eef9027fbaedfcedc7b85a3ac2` |
| `universal_animation_library_2standard.zip`（UAL2 Standard） | https://opengameart.org/sites/default/files/universal_animation_library_2standard.zip | 10,257,419 B | `ec0e40d6d78fe9aaad59e322f40865a8675c22f0745e291622e54520391a9217` |
| Mesh2Motion `human-{base,addon,mocap}-animations.glb` 的 JSON 块（HTTP Range） | https://github.com/Mesh2Motion/mesh2motion-app/tree/main/static/animations | 3.17 + 2.93 + 0.67 MB | — |
| AnimatedDrawings 的 README、config README、LICENSE；混元 3D 2.1 LICENSE；CMU 首页和 FAQ 页 | 见 §9 | 文本 | — |

---

## 9. 参考资料（访问日期 2026-10-01）

**动作库**

- Quaternius UAL：https://quaternius.com/packs/universalanimationlibrary.html ；https://quaternius.com/packs/universalanimationlibrary2.html ；https://quaternius.itch.io/universal-animation-library ；https://opengameart.org/content/universal-animation-library-2
- Mesh2Motion：https://github.com/Mesh2Motion/mesh2motion-app （README 的 Licenses 段、`LICENSE-CC0.MD`）；https://mesh2motion.org/ ；https://mesh2motion.org/news
- KayKit：https://kaylousberg.itch.io/kaykit-character-animations
- CMU：http://mocap.cs.cmu.edu/ （首页许可原文）；cgspeed 动作列表 https://sites.google.com/a/cgspeed.com/cgspeed/motion-capture/the-motionbuilder-friendly-bvh-conversion-release-of-cmus-motion-capture-database/bvh-conversion-release-motions-list ；RancidMilk 重定向版 https://rancidmilk.itch.io/free-character-animations
- 100STYLE：https://zenodo.org/records/8127870
- Rokoko：https://www.rokoko.com/resources/download-263-rokoko-motion-capture-assets ；https://www.rokoko.com/resources/rokoko-mocap-6-free-martial-arts-animations
- Mixamo FAQ（直连 403，条款据搜索摘录）：https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
- 万代南梦宫：https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset
- SFU：https://mocap.cs.sfu.ca/
- Kenney：https://opengameart.org/content/animated-characters
- three.js RobotExpressive：https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive
- Motifect：https://motifect.itch.io/motifect-martial-arts-motion-pack
- HY-Motion：https://huggingface.co/tencent/HY-Motion-1.0 ；https://huggingface.co/spaces/tencent/HY-Motion-1.0
- AMASS 许可：https://amass.is.tue.mpg.de/license.html

**Gemini**

- Nano Banana Pro 发布：https://blog.google/innovation-and-ai/products/nano-banana-pro/
- 图像生成文档：https://ai.google.dev/gemini-api/docs/image-generation
- Gemini Apps 限额：https://support.google.com/gemini/answer/16275805
- 隐私中心：https://support.google.com/gemini/answer/13594961
- 透明背景问题（社区）：https://transparify.app/blog/gemini-transparent-background
- 设定图漂移（社区）：https://atlassc.net/2026/01/15/generate-costume-reference-sheet-with-nano-banana-pro

**算法与工具**

- AnimatedDrawings（MIT）：https://github.com/facebookresearch/AnimatedDrawings ，配置说明 `examples/config/README.md`（retarget 段）；论文 https://arxiv.org/abs/2303.12741
- Apple Vision 3D 姿态：https://developer.apple.com/documentation/vision/vndetecthumanbodypose3drequestrevision1
- rtmlib：https://github.com/Tau-J/rtmlib
- SAM 3 许可：https://github.com/facebookresearch/sam3/blob/main/LICENSE
- Sapiens（CC BY-NC 4.0）：https://huggingface.co/facebook/sapiens
- LaMa（Apache-2.0）：https://github.com/advimman/lama/blob/main/LICENSE
- three.js 重定向示例：https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_animation_retargeting.html

**图生 3D 与绑骨**

- TRELLIS.2：https://huggingface.co/microsoft/TRELLIS.2-4B
- 混元 3D 2.1（含 LICENSE）：https://huggingface.co/tencent/Hunyuan3D-2.1 ；Mac 社区移植 https://github.com/Brainkeys/Hunyuan3D-2.1-mac
- SPAR3D：https://github.com/Stability-AI/stable-point-aware-3d
- UniRig：https://github.com/VAST-AI-Research/UniRig
- Meshy 价格与许可：https://docs.meshy.ai/en/webapp/pricing ；https://help.meshy.ai/en/articles/15696428-what-is-included-on-the-free-plan
- MakeHuman / MPFB（CC0）：https://static.makehumancommunity.org/mpfb/faq/use_in_closed_source.html
- Quaternius Universal Base Characters：https://quaternius.com/packs/universalbasecharacters.html

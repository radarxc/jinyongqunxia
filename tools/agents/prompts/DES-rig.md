# 本任务：角色分层部件绑定与代码步态规格（AR-22）——写 `docs/tech/09-character-rig.md`，改 tech/02 §2.5–§2.6

本任务写技术规格文档，不写代码、不出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-22**（逐字原话）：「盔甲衣服兵器靴子等要用code处理出小图，主角在地图上行走时，要反映出装备特性。行走动画要用代码写出轨迹，分别贴图」。既有相关决定：招式也是几张图 + 代码合成（AR-19 前后作者原话，见 `assets/default/STYLE.md`）；性能要最好（AR-21）。

## 现状（要改掉的决策）

`docs/tech/02-rendering.md` §2.5 决定角色用"2D 精灵公告板 + 预渲染帧（3D 中转 → 8 向正交渲染）"，§2.6 定义了 `sprite-spec.json` v1（帧表、页组、facings），并写明"换兵器外观 ❌ 兵器随图烘焙"。`docs/tech/07-asset-generation.md` §3.2 / §4.5 / §5.4 按帧序列估算数量与绑骨。作者 AR-22 推翻帧序列路线：角色 = **分层部件贴图 + 代码轨迹**，装备可见。保留 §2.5 里仍成立的部分（直立公告板、深度偏移、两段式精灵、法线可选、ppm 分档）。

## 要写的规格（`docs/tech/09-character-rig.md`，新建；每节给表格与数字，不写泛泛描述）

1. **绑定 `tianshu_rig` v1**：部件表（head、hair_or_headgear、torso、pelvis_skirt、upper_arm_L/R、forearm_L/R、hand_L/R、thigh_L/R、shin_L/R、foot_L/R）；每个部件的父关节、枢轴（pivot，在部件贴图里的像素坐标约定：四肢在顶端中央，躯干在骨盆点，头在颈点）、子关节位置、默认长度（米，角色身高 1.70 m 男 / 1.62 m 女）；源贴图 256 px/m（显示按 tech/02 的 64 / 96 / 128 ppm 分档缩放）；三个绘制视图（前 3/4、后 3/4、侧）+ 镜像 → 与 tech/02 §1.5 的 8 方向 / 4 个相机预设的映射表；每个视图的部件 z 序表；描边烘焙、调色槽（衣物可整体 tint 的部件标出）。
2. **装备层**：十一类物品 → 可见层表：兵器（右手握点、单手 / 双手姿势、待机 / 行走时的握持角、刀剑斜背或悬腰可选）、衣物（躯干 + 四肢覆盖或 tint）、制式盔甲（躯干 / 裙甲 / 护肩覆盖）、内甲（不可见）、护肩（成对）、披风（背后层，滞后摆动）、头饰（头部覆盖）、鞋（替换脚部贴图）、腰带（腰部窄层）、暗器（不可见或腰囊）、秘籍 / 药食（不可见）。每层：挂到哪个部件、相对枢轴的偏移与缩放规则、z 序、是否随步态摆动。
3. **从物品图生成小图与覆盖层的代码规则**（交 TOOL-rig-pipeline 实现）：抠底（浅暖灰近象牙底 RGB≈230,225,216 的色键 + 容差 + 边缘羽化 + 去色溢）、裁边、补边 8%、图标尺寸 256 / 128 / 64 / 32，命名 `assets/default/item/<类>/icons/<id>_<size>.png`；覆盖层：兵器 = 抠底图沿主轴摆正 + 握点（按子类的默认握点比例表）+ 按名录长度 / 子类默认长度缩放到 ppm；盔甲 / 衣物 / 护肩 / 鞋 / 腰带 / 披风 / 头饰 = 该槽位的模板形状（随本规格附 SVG 或像素模板尺寸表）填入从物品图采样的主色板与纹理片（采样规则：k-means 主色 3–5 个、纹理片取物品图中心 1/3 区域平铺）；输出 `assets/default/item/<类>/layers/<id>__<slot>.png` + `layers.yaml`（slot、pivot、scale、zOrder、tint）。
4. **步态与轨迹（代码写出，不用帧表）**：参数表与公式：周期 T 随速度（步行步幅 0.70 m、跑步 1.20 m）、髋角 / 膝角 / 踝角 / 肩角 / 肘角随相位 t∈[0,1) 的曲线（给可直接实现的分段正弦或样条，含相位差与非对称）、躯干起伏、头部滞后、披风二阶跟随（刚度 / 阻尼）、兵器摆动、待机呼吸、转向过渡（混合时间）、"一拍二"量化选项（`stepFps` 12，可关）；装备轻重三档（轻 / 中 / 重，按 design/10 重量或类别）对振幅 / 周期 / 步幅的修正系数表；给 **测试向量表**：t = 0 / 0.25 / 0.5 / 0.75 时各关节角（度）与躯干高度偏移（米），步行与跑步、三档各一组，供 ENG-12 做断言。
5. **运行时与性能契约**（交 ENG-12）：`createRigCharacter(rigSet, equipment)`、`setMotion(dir8, speedMps, weightClass)`、`update(dt)`；所有角色的所有部件走同一张图集的 `InstancedMesh`（每实例：部件 UV 矩形、公告板平面内 2D 仿射、z 排序键、tint），每角色 ≤ 2 次 draw call、≤ 20 实例；CPU 每帧算 ≤ 100 角色 × 16 部件的变换（给预算 ms）；法线贴图可选；与 tech/02 §3 深度 / 排序规则对齐。
6. **manifest 与目录**：`assets/default/rig/<set>/manifest.yaml`（set、ppm、views、parts[id、file、view、pivot、childJoint、size、zOrder、tintable]、palette）；`assets/default/rig/<set>/<view>/<part>.png`；预览图约定（`tools/rig/preview.py` 产出的姿势条带）。
7. **改 tech/02**：§2.5 决策改写为"分层部件公告板 + 代码轨迹"（表格重写：画风 / 性能 / 动画 / 显存 / 换装 / 旋转 / 生产 六项重新评价；预渲染帧降为备选 C），§2.6 `sprite-spec.json` 改为指向 `rig-spec`（保留页组 / 分档 / 公告板 / 法线字段中仍适用的）；`docs/tech/07-asset-generation.md` §3.2 数量估算改为部件数（2 体型 × 3 视图 × 13 部件 + 装备层由代码生成）、§4.5 标注"行走 / 待机不再需要绑骨与动作库，仅战斗大动作另议"。每处改动写版本记录"2026-10-01 AR-22"。

约束：每次写入 ≤ 150 行；只改 `docs/tech/09-character-rig.md`（新建）、`docs/tech/02-rendering.md`、`docs/tech/07-asset-generation.md`；原创数字标"初值，待 ENG-12 实测"。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `test -s docs/tech/09-character-rig.md`

## 报告

第 7 节写：部件表与 z 序摘要；装备层表；步态测试向量表；交 TOOL / ART / ENG-12 的接口清单；需作者确认（附默认）。报告 ≤ 100 行。

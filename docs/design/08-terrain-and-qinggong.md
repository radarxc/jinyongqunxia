# 08 · 地形与轻功（Terrain & Qinggong）

> **归属**（基准 §18）：地形目录、轻功（境界能力、动作规格、轻功武学的特技）、探索门禁（类型、节奏、预算、反挫败）、战斗中的地形规则（移动代价、地形效果挂载、互动、坠落）、地形与天气昼夜的换算。
> **上游**：`00-canon.md`（§3 境界规则与"轻功不可携带"、§4 品阶、§6 属性 ID、§7 武功分类、§8 战斗模型、§9 乘区、§10 Buff 规则、§11 轻功阈值 20/50/90/140/200、§12 ID 规范、§13 天级武学、§19 技术基线、§20 装配栏）。
> **引用而不重定义**：轻功值 `qinggong`、`jump`、`mov`、`staMax`、疲惫 → `design/03-attributes.md` §4.4、§4.5、§5.3；Z7 公式本体、命中/伤害计算 → `design/04-damage-formula.md`；武功数据结构、招式 `terrainFx`/`displacement`/`hTol`、修为门槛 `gateCap` → `design/05-martial-arts-system.md`；Buff 定义、钩子 `onTerrainEnter`/`onTerrainStay`/`onDisplaced`、原语 `modTerrain`/`displace` → `design/06-buff-system.md`；集气、AI、撤退、Boss 阶段 → `design/09-combat-system.md`；鞋与道具 → `design/10-items-and-equipment.md`；时辰、天气生成、季节、旅行与坐骑 → `design/11-open-world.md`；声望、门派身份 → `design/12-quests-npc-factions.md`；四阶以上门禁占比的来源公式 → `design/02` §2.10；地图编辑与可达性校验 → `tech/01` §7.4–7.5。
> **标注约定**：**（原创扩展）** = 原著没有的内容；**（待考）** = 需以三联/广州修订版逐字核对的原著细节；**【建议值】** = 依赖他文档、本文先给出可用数值并在 §12 登记。

---

## 0. 本文范围与阅读指引

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1 | 设计目标、核心概念、尺度约定 | 全体 |
| §2 | 数据结构：`TerrainDef` 字段、子结构、地形标签、地表状态 `tst_*`、地形品阶、YAML 示例、TS 类型 | 程序、配表 |
| §3 | **地形目录（48 种）**：每种给出通行、高度、战斗修正、进入/停留效果、探索规则、互动、表现、书界 | 策划、配表、美术 |
| §4 | 轻功：境界能力总表、动作规格与体力、情境加成、轻功武学特技与目录、各书界获取节奏 | 策划、数值 |
| §5 | 高度规则：尺度、纵跃与下跳、坠落伤害、坠崖、高低差修正（Z7 建议）、视线与视野 | 程序、数值 |
| §6 | 探索门禁：门禁类型、表达式、`QinggongGate`、节奏原则、各书界预算、反挫败、校验、坐骑可骑地形 | 策划、关卡 |
| §7 | 战斗中的地形：截取、寻路代价、效果挂载、环境时钟、火/冰/破坏/击退/踏水、AI 评分、演算例 | 程序、战斗 |
| §8 | 天气与昼夜：与 design/11 的接口、天气×地形换算、视野、风、季节 | 程序、关卡 |
| §9 | 十四书界标志性地形与地点（每部 3–6 处，含构成与门禁）；终局战场地形 | 书界策划 |
| §10 | 平衡约束、数据校验、测试用例 | 数值、程序 |
| §11 | 本文新增术语与 ID | 全体 |
| §12 | 待决事项 / 依赖 | 全体 |

---

## 1. 设计目标与核心概念

### 1.1 设计目标

| # | 目标 | 落地手段 |
|---|---|---|
| T1 | **地形即玩法**：每种地形至少改变一个决策（走不走、站哪、推谁、烧不烧） | 每种地形必须有非零的 `moveCost` 差异、战斗修正、效果或互动之一（§10 校验 V3） |
| T2 | **一眼可读**：玩家不看说明也能判断危险 | 门禁地形视觉必须可区分（深水/浅水、薄冰/厚冰、流沙/沙地的"破绽"），`visual.tell` 字段强制（§2.1） |
| T3 | **轻功门禁每部都有意义**（基准 §3 硬规则 1） | 轻功武学不可携带 → 每书界开局回落到 qg1–qg2；门禁按书界"普通玩家可达境界"排布（§6.4–6.5） |
| T4 | **不锁死、少挫败** | 主线门禁必有替代解（§6.6）；单向下落必有出口；体力耗尽不致死（§4.4） |
| T5 | **探索与战斗同一套规则**（基准 §8 就地开战） | 同一张地图、同一高度、同一地形表；只有"时间单位"不同（探索按秒/时辰，战斗按回合与环境时钟 §7.4） |
| T6 | **数据驱动、确定性** | 地形、状态、门禁全部为数据；所有随机走战斗/世界种子 RNG（基准 §19） |
| T7 | **原著地标可辨** | §9 十四书界地标以原著地貌为锚，玩法扩展标注"原创扩展" |

### 1.2 核心概念

| 术语 | ID / 字段 | 定义 |
|---|---|---|
| 格 | `tile` | 网格单元；逻辑尺寸约 1.5 m（半丈）见方。一格同一时刻至多一个单位。 |
| 级 | `h` | 格高度 0–10（基准 §8）。1 级 ≈ 1.5 m；2 级 ≈ 一丈（单层屋檐）。渲染可压缩竖向比例（tech/02 定）。 |
| 地形 | `terrain` / `tr_*` | 格的材质与规则类型（本文 §3），每格恰好一个。 |
| 地表状态 | `tst_*` | 叠加在地形上的临时状态（燃烧、冰封、泥泞、积雪……），每格可同时有多个（§2.4）。**新 ID 前缀，见 §12 P-01。** |
| 冠高 | `canopy` | 地形自带的遮挡物高度（竹、树、垛口），参与视线计算，不参与站立高度。 |
| 虚空格 | `void` | 无地面的格（深谷、云海、场景外悬崖）；进入即坠崖（§5.4）。 |
| 轻功境界 | `qgTier` | 0–5，由 `qinggong` 按基准 §11 阈值换算（03 §4.4）。 |
| 情境轻功 | `qgAction(a)` | 某一动作 `a` 判定时使用的轻功值 = `qinggong + Σ actionBonus[a]`（§4.1 Q4、§4.5）。 |
| 通行模式 | `moveMode` | 单位在某格上的存在方式：`walk` 步行、`wade` 涉水、`swim` 游水（落水）、`waterwalk` 踏水、`climb` 攀爬、`treetop` 树梢、`glide` 滑翔、`boat` 乘船。 |
| 门禁 | `gate` / `gate_*` | 探索中阻止进入某区域的条件（轻功、钥匙、声望、门派、时辰、奇门、水性、驭兽、坐骑、船……，§6）。**新 ID 前缀，见 §12 P-01。** |
| 门禁意图 | `gateIntent` | 关卡对某目标物"应在哪一境界可达"的声明，供 tech/01 L6 可达性校验比对（§6.7）。 |
| 环境时钟 | `envTick` | 战斗中驱动火势蔓延、冰融、水流、摇晃的虚拟行动者（§7.4，建议交 09）。 |
| 地形品阶 | `terrainGrade` | 地形施加的 Buff 的品阶（§2.5）。 |
| 安全落差 | `safeDrop` | 不受坠落伤害的最大下跳高差（§5.2）。 |
| 坠崖 | `plunge` | 落入虚空格：单位离开战场，按单位类型处理（§5.4）。 |
| 水性 | `swimLevel` | 0–3 的探索能力值：游水距离、潜水、落水后的战斗表现（§4.2.3）。**非基准 §6 属性，见 §12 P-03。** |
| 遮蔽 | `cover` | 格对远程/投射攻击提供的命中与伤害减免（§2.2）。 |

### 1.3 尺度约定

| 量 | 值 | 说明 |
|---|---|---|
| 1 格 | ≈ 1.5 m | 人与人之间的最小站位 |
| 1 级高差 | ≈ 1.5 m | 一人肩高；qg1 跃上 1 级 |
| 2 级 | ≈ 3 m（一丈） | 单层屋檐、矮墙；qg2 |
| 3 级 | ≈ 4.5 m | 树梢、二层楼窗、低崖；qg3 |
| 5 级 | ≈ 7.5 m | 城墙（多为 5–6 级）、高崖一段；qg5 |
| 10 级 | ≈ 15 m | 单张地图内的最大高差；更高的山体用"分段地图 + 门禁传送"表达（§6.3） |
| 眼高 | 1 级 | 视线计算时单位的视点在所站格高度 + 1 |
| 战场 | ≤ 20×20 格 | 基准 §8；就地截取（§7.1） |

---

## 2. 数据结构

### 2.1 `TerrainDef` 字段表

| 字段 | 类型 | 必填 | 说明 / 取值 | 例 |
|---|---|---|---|---|
| `id` | string | ✅ | `tr_<拼音>`（基准 §12），全局唯一 | `tr_shenshui` |
| `name` | string | ✅ | 中文名（≤ 5 字） | 深水 |
| `group` | enum | ✅ | `ground` 地面 / `veg` 植被 / `water` 水域 / `icesnow` 冰雪 / `vertical` 高差险地 / `structure` 建筑人工 / `mechanism` 奇门机关 / `hazard` 危险特殊 | `water` |
| `tags` | TerrainTag[] | ✅ | 地形标签（§2.3），供招式、Buff、AI、天气规则匹配 | `[water, deep]` |
| `moveCost` | MoveCost | ✅ | 战斗中**进入**该格消耗的移动点：`{base, byTier?, byMode?}`；`inf` = 不可进入 | `{base: inf, byMode: {waterwalk: 1}}` |
| `exploreSpeed` | number | ✅ | 探索步行速度倍率 0.3–1.2（疾行、坐骑另乘） | `0.4` |
| `pass` | PassRule | ✅ | 可进入/可停留的条件与通行模式（§2.2） | |
| `height` | HeightRules | ✅ | 典型高度、坡向、冠高、是否虚空、攀爬规则（§2.2） | |
| `combat` | CombatMod[] | | 常驻战斗修正（站在此格的单位；§2.2 记法） | `attr:eva pct −20%` |
| `cover` | Cover | | 遮蔽：对 `projectile`/`ranged` 的命中与伤害修正 | `{hit: −10, dmg: −0.10}` |
| `los` | enum | ✅ | 视线：`none` 不挡 / `partial` 半挡 / `full` 全挡（§5.6） | `none` |
| `onEnter` | TerrainEffect[] | | 进入时施加（06 钩子 `onTerrainEnter`），Buff 引用 06 | `bf_zhuoshao` 移除 |
| `onStay` | TerrainEffect[] | | 持有者 S 段开始时所在格（06 钩子 `onTerrainStay`） | `bf_hanqi` 1 层 40% |
| `explore` | ExploreRules | ✅ | 探索规则：体力、足迹、隐藏、迷路、坐骑、采集、危险事件 | |
| `interact` | Interaction[] | | 可被点燃/冻结/破坏/切断/推动等，及转换结果（§2.2） | `freeze → tst_bingfeng` |
| `weather` | WeatherRule[] | | 天气/昼夜对本地形的换算（§8.2） | `rain 2h → tst_nining` |
| `visual` | VisualSpec | ✅ | 材质键 `tex`、`tell`（可读性要点）、特效；命名遵循 tech/07 `tex_tr_<拼音>__<书界>_<变体>` | |
| `audio` | AudioSpec | ✅ | 脚步 `step`、环境 `amb`、互动音效键 | `sfx_step_water` |
| `chapters` | chapterId[] 或 `all` | ✅ | 出现书界 | `all` |
| `origin` | enum | ✅ | `canon` / `expanded` / `canonExpanded`（同 05） | `canon` |
| `canonRef` | string | | 原著出处；不确定写"（待考）" | 神雕·绝情谷 |
| `aiHint` | map | | AI 估值提示（09 使用）：`hazardValue`、`coverValue`、`pushValue` | |

### 2.2 子结构

**`MoveCost`**（战斗移动点；探索中换算为 `exploreSpeed`）：

| 字段 | 说明 |
|---|---|
| `base` | 缺省代价（1–4 或 `inf`） |
| `byTier` | `{qgN: 代价}`：境界 ≥ N 时的代价（取满足条件的最低值） |
| `byMode` | `{moveMode: 代价}`：以某通行模式进入时的代价（如踏水 1） |
| `uphill` | 上坡附加：每上升 1 级 +`uphill`（默认 0；`tr_taijie` 为 1） |

**`PassRule`**：

| 字段 | 取值 | 说明 |
|---|---|---|
| `enter` | `all` / `none` / `modes[]` | 允许以哪些通行模式进入 |
| `stand` | bool | 可否停留（结束移动）；`false` 的格只能"越过"（如虚空、峭壁面） |
| `req` | GateExpr | 进入该格的附加条件（§6.2 语法），如 `{qg: 3, action: treetop}` |
| `maxRun` | `{mode: n}` | 某模式下连续经过的最大格数（踏水 qg3 = 3，qg4 = 6） |
| `occupancy` | `single` / `normal` | `single`：单位不可在此穿越友军（独木桥、栈道） |

**`HeightRules`**：

| 字段 | 说明 |
|---|---|
| `hRange` | 典型高度区间（配图校验用），如屋顶 `[2, 6]` |
| `slope` | `{dir, rise}`：坡/阶方向与每格升高（`rise` ≤ 2）；沿坡移动不受 `jump` 限制（03 §4.4） |
| `canopy` | 冠高（级），用于视线；`0` 表示无 |
| `void` | 是否虚空格（§5.4） |
| `climb` | `sheer`：视为峭壁面，上攀需 `qgTier ≥ 3` 且 `Δh ≤ climbMax`（§5.2）；`free`：普通纵跃规则；`none`：不可上攀 |
| `ceiling` | 室内/洞窟顶高（级），纵跃高度不得超过 `ceiling − 1` |
| `landMul` | 落在此格时的坠落伤害系数（§5.3）：水 0.3、深雪 0.5、植被 0.8、碎石 1.2、机关尖刺 1.5 |
| `fallTarget` | 虚空格的落点：`regionId + cell`（坠崖奇遇，§5.4）或 `null` |

**`CombatMod` 记法**（沿用 06 §4.7，并新增地形专用项）：

| 记法 | 作用 | 来源类型 |
|---|---|---|
| `attr:<id> pct/flat/pp` | 站在此格的单位的属性修正 | 03 修饰来源 `terrain`（**提案**，§12 D-03）：不计入 Buff 数量、不可驱散、离格即失效 |
| `Z7.dealt ±x%` | 站在此格的单位**造成**的伤害（Z7 地形项） | 04 Z7 |
| `Z7.taken ±x%` | 站在此格的单位**受到**的伤害（Z7 地形项） | 04 Z7 |
| `cat:<兵器类别> Z7.dealt` | 仅对某类兵器招式（如竹林中长兵受限） | 04 Z7 |
| `knock +n` | 此格上的单位被击退时距离 +n | 05 §4.5 |
| `noStance` | 在此格不能起架势（06 `exg_stance`），已有架势保留 | 06 |

**`Cover`**：`{vs: [projectile, ranged], hit: 命中评级修正, dmg: Z7.taken 修正, dir: all|front}`；`dir: front` 表示仅对"来自格外沿方向"的攻击生效（城墙垛口）。

**`TerrainEffect`**（`onEnter` / `onStay` 的元素）：

| 字段 | 说明 |
|---|---|
| `buff` / `remove` | 施加的 Buff ID（06）/ 移除的 Buff ID 或标签 |
| `chance` | 基础概率；仍走 06 §4.1 的免疫 → 效果命中/抵抗流程（地形的 `effHit` = 同品阶标准值 `10 + 3 × g`【建议值】） |
| `grade` | `terrain`（取 `terrainGrade`，§2.5）/ `terrain+n` / 定值 / `source`（玩家造成的火、冰取来源招式品阶） |
| `stacks` / `dur` | 层数 / 持续（缺省用 Buff 定义） |
| `exempt` | 豁免条件：`qgTier ≥ n`、`moveMode ∈ [...]`、`tag`（如神龙教众免蛇）、物品 |
| `mode` | `onEnter` 专用：`change`（与前一格地形或状态不同才触发，06 缺省）/ `every`（每进入一格都触发，危险地形用）；`maxPerMove`（每次移动至多触发次数，默认 2） |
| `when` | 条件表达式（06 §2.3 白名单，另加 `mode`、`qgTier`、`swimLevel`、`world.*`） |
| `crack` / `heavyCrack` | 进入时 `tst_liewen` 计数增量（普通 / 负重或被击退落此），用于薄冰、朽木栈道、屋瓦 |

**`Interaction`**：

| 字段 | 取值 | 说明 |
|---|---|---|
| `verb` | `ignite` `extinguish` `freeze` `thaw` `break` `cut` `push` `open` `dig` `light` `study` `crack` | 互动类型 |
| `by` | 招式 `terrainFx`、物品、元素标签（`fire`/`cold`/`hard`）、天气、行动 | 触发者 |
| `result` | `→ tr_x` 转换地形 / `+ tst_x` 加状态 / 事件 ID | 结果 |
| `hp` | 可破坏物件的耐久（§7.5.3 公式系数 `k`） | 石阵阵眼 `k: 3` |
| `dur` | 状态持续（环境时钟 tick 或时辰） | |
| `spread` | 燃烧蔓延率（仅 `ignite`，§7.5.1） | 草地 0.40 |
| `threshold` | `crack` 的破裂阈值 | 薄冰 2 |

**`WeatherRule`**：`{when, result}`；`when` 为累积条件（`rain>=2h`、`snow>=3h`、`temp==freezing && night`；`h` 表示**时辰**，1 时辰 = 2 小时，时间系统归 11），`result` 为 `+tst_x` / `-tst_x` / `→ tr_x` / `reset tst_x`（§8.2）。

**`ExploreRules`**：`sta`（每格/每秒体力，§4.4）、`tracks`（足迹保留时辰）、`hidden`（伪装成其他地形，识破条件）、`lost`（迷路规则）、`mount`（坐骑倍率或禁止）、`gather`（采集节点类型）、`event`（危险事件：落石、雪崩、流沙吞没）、`noise`（噪声等级 0–3，影响潜行，11 定义警觉）。

### 2.3 地形标签（`TerrainTag` 全集）

标签是招式 `terrainFx`（05 §4.1）、Buff 条件 `ctx.tile.terrain`（06 §2.3）、效果钩子 `terrainNoFalloff{tags}`（05 §4.11）、天气规则与 AI 共同使用的匹配键。

| 标签 | 含义 | 典型地形 | 主要用途 |
|---|---|---|---|
| `water` | 任何水面 | 浅水、深水、急流、大江、瀑布底 | 灭火、解灼烧/失明（06）、`terrainNoFalloff`（利涉大川） |
| `shallow` / `deep` | 浅水 / 没顶 | 浅水 / 深水、急流、大江 | 落水判定、冻结结果 |
| `flowing` | 有水流 | 急流、大江、瀑布底 | 环境时钟推移（§7.4） |
| `bigwater` | 大江大湖海面 | 大江湖面 | qg5 一苇渡江 |
| `ice` / `thinice` | 冰面 / 薄冰 | 冰面、薄冰、冰窟、冰封状态 | 滑行、破裂 |
| `snow` / `deepsnow` | 雪 / 深雪 | 雪地、深雪、积雪状态 | qg4 无减速、足迹、寒气 |
| `sand` / `quicksand` | 沙 / 流沙 | 沙地、流沙 | qg4、陷落 |
| `mud` | 泥沼 | 泥沼、毒沼、泥泞状态 | qg4、迟滞 |
| `veg` | 植被 | 草地、花丛、竹林、密林、荆棘、情花丛 | 火势、隐蔽、采集 |
| `flammable` | 可燃（带蔓延率） | 植被、屋顶（茅草）、木桥、船、室内（木构） | §7.5.1 |
| `canopy` | 有冠层遮挡 | 竹林、密林、树梢 | 视线半挡、遮蔽 |
| `treetop` | 树梢可立足 | 树梢 | qg3 |
| `rough` | 崎岖 | 碎石、焦土（初期） | 击退 +1、落石 |
| `thorn` | 带刺 | 荆棘、情花丛 | 流血/情花毒 |
| `edge` | 临渊 | 悬崖边、栈道外沿、城墙外沿、桥 | 击退坠落、AI 推人 |
| `void` | 虚空 | 深谷/断崖、云海 | 坠崖 |
| `roof` | 屋面 | 屋顶、宫殿屋脊 | 飞檐（qg2）、瓦片破裂 |
| `wall` | 墙头/墙体 | 高墙、城墙 | 视线、翻墙 |
| `bridge` / `narrow` | 桥 / 窄道 | 铁索桥、独木桥、栈道 | 单行、侧推坠落 |
| `sway` | 摇晃 | 铁索桥、船甲板、云海栈道 | 失衡（§7.4） |
| `indoor` | 室内（无天气） | 室内、洞窟、墓室、迷宫 | 天气屏蔽、顶高 |
| `dark` | 无光 | 洞窟、墓室、冰窟、迷宫、夜间室外 | 视野、潜行 |
| `cold` / `hot` | 寒 / 热 | 冰窟、雪地 / 熔岩、火焰 | 寒气、灼烧、体力 |
| `poison` | 毒 | 毒沼、蛇窟、毒雾状态 | 中毒 |
| `formation` | 奇门阵 | 石阵、墓室、迷宫 | `formation` 技艺检定 |
| `trap` | 机关陷阱 | 机关地板、墓室、迷宫 | qg4 不触发（基准 §11）、识破 |
| `destructible` | 可破坏 | 石阵阵眼、栈道、屋瓦、木桥、铁索 | §7.5.3 |
| `slippery` | 湿滑 | 冰面、琉璃瓦、湿滑状态 | 滑移、击退 +1 |
| `stealthy` | 利于潜伏 | 草地（高草、芦苇变体）、竹林、密林、花丛、树梢、房梁、暗处 | 06 `bf_yinshen` 条件"暗处地形"；09 所称"`cover` 标签地形"即本标签 |

### 2.4 地表状态（`tst_*`，10 种）

状态是叠加层：不改变格的 `terrain` ID，但覆盖或追加其规则。结算优先级：状态规则 > 地形规则（同一字段冲突时取状态）。

| ID | 名称 | 产生 | 可附着的地形 | 规则 | 持续 | 结束时 |
|---|---|---|---|---|---|---|
| `tst_ranshao` | 燃烧 | 招式 `terrainFx.ignite`、火折子/火油、火焰地形蔓延、雷击（剧情） | 带 `flammable` 的格 | `onEnter`（`mode: every`）与 `onStay`：`bf_zhuoshao`；`los: partial`；每环境 tick 按 §7.5.1 蔓延；每 tick 向下风向相邻格生成 `tst_yanwu` | 竹林 2 / 草地、花丛、荆棘 3 / 密林、屋顶、船、室内 4 环境 tick | 植被 → `tr_jiaotu`；树梢 → 地面 `tr_jiaotu`（其上单位坠落 3 级）；木桥/栈道 → 虚空缺口；屋顶 → 屋顶保留但 `flammable` 清除 |
| `tst_yanwu` | 烟雾 | 燃烧、烟丸（10）、毒沼沼气 | 任意（水面除外） | `los: partial`；格内单位 `attr:hit pct −10%`；对格内目标的投射攻击命中 −10 | 2 环境 tick；每 tick 顺风漂移 1 格 | 消散 |
| `tst_bingfeng` | 冰封 | 招式 `terrainFx.freeze`、寒冬（§8.5） | 浅水、深水、泥沼；急流仅地阶以上寒系招式 | 浅水/泥沼 → 按 `tr_bingmian`；深水/急流 → 按 `tr_baobing`；冻结瞬间格内涉水/落水单位：`bf_dingshen` 1 回合 + `bf_hanqi` 1 层（品阶 = 来源） | `2 + ⌊g/3⌋` 环境 tick（g = 来源品阶）；`freezing` 天气下本场永久 | 恢复原地形；其上单位按原地形重新判定（踏水/落水） |
| `tst_nining` | 泥泞 | 雨（§8.2）、泼水、冰雪融化 | 平地（土）、草地、沙地、焦土 | `moveCost +1`（qg4 免）；`attr:eva pct −5%`；足迹 12 时辰 | 雨停后晴 4 时辰 | 恢复 |
| `tst_jixue` | 积雪 | 降雪（§8.2） | 平地、草地、碎石、屋顶、城墙；雪地上 → 升级为深雪规则 | 按 `tr_xuedi`（雪地上按 `tr_shenxue`） | 气温回升后 6 时辰 | 恢复（转 `tst_nining` 2 时辰） |
| `tst_shihua` | 湿滑 | 雨、泼水、瀑布水雾 | 屋顶、宫殿屋脊、石板、船甲板、冰面 | 带 `slippery`：`knock +1`；在坡面一次移动 ≥ 3 格 → 20% 沿坡下滑 1 格（qg3 免） | 雨停后 2 时辰 | 恢复 |
| `tst_zuji` | 足迹 | 非 qg4 单位走过雪、泥、沙、灰烬 | 雪地、深雪、泥沼、泥泞、沙地、焦土 | 可被追踪（11/12 追踪任务；敌方 AI 追索） | 雪 6、泥 12、沙 2（有风 0.5）、灰烬 4 时辰 | 消失 |
| `tst_youzi` | 油渍 | 火油（10）、打翻油灯（剧情） | 任意非水格 | 变为 `flammable`，蔓延率 80%；其上燃烧的灼烧伤害 ×1.5 | 5 环境 tick / 12 时辰 | 消失 |
| `tst_liewen` | 裂纹 | 进入薄冰、朽木栈道、屋瓦 | 薄冰、栈道（`rotten`）、屋顶 | 计数 1–2；达到阈值（§3 各条）即破裂；UI 显示裂纹贴花（可读性硬要求） | 本场/本日 | 破裂或复原（冰：寒夜复原） |
| `tst_duwu` | 毒雾 | 毒沼沼气（每 4 环境 tick 随机 1 格）、毒烟物品（10） | 任意（水面除外） | `los: partial`；`onStay`：`bf_zhongdu` 1 层（100%，品阶 `terrain+1` 或物品品阶）；顺风漂移 | 3 环境 tick | 消散 |

### 2.5 地形品阶 `terrainGrade`

06 §3.1 为地形来源 Buff 留了占位 `clamp(1, 12, ⌈Ld/6⌉)`。本文定稿为**随书界武运走**的写法（提案替换，§12 D-06）：

```
terrainGrade(tile) = clamp(1, 12, gMain(region) + adj(terrain))
  gMain(region)  = 该区域普通敌人主力品阶中位（design/02 §2.11 表 D，按区域等级带取值）
  adj(terrain)   = 地形条目给定（缺省 0；毒沼、蛇窟 +1；冰窟 +1）
  定值例外        = 情花丛 8（06 情花毒 gradeRange 8–9）、熔岩 10、剧情 Boss 场地可覆写
玩家/敌人造成的地形效果（点火、冻结、毒雾物品）：grade = 来源招式或物品的有效品阶（06 §3.1 skill/item 规则）
```

| 书界例 | 区域 `gMain` | 毒沼中毒品阶 | 06 旧占位（显示等级 Ld） | 说明 |
|---|---|---|---|---|
| 天龙·大理新手区 | 2（黄中） | 3 | ⌈10/6⌉ = 2 | 相近 |
| 神雕·绝情谷 | 7（地下） | 8 | ⌈58/6⌉ = 10 | 旧式偏高 2 品 |
| 鹿鼎·神龙岛 | 3（黄上） | 蛇窟 4 | ⌈44/6⌉ = 8 | 旧式在低武书界高出 4 品，与"武林衰败"相悖 |

- 地形效果的施加者为空（06 §1.2），效果命中评级取 `effHit = 10 + 3 × terrainGrade`【建议值】，走 06 §4.1 的免疫 → 效果命中/抵抗流程。
- 地形 DOT 的境界差（04 Z8）以区域敌人等级带中值作为"施加者等级"快照。
- 地形效果**不受外来压制**（地形是本书界原生的）。

### 2.6 完整 YAML 示例

#### 示例 A：草地（可燃植被）

```yaml
id: tr_caodi
name: 草地
group: veg
tags: [veg, flammable, stealthy]
moveCost: { base: 1 }
exploreSpeed: 1.0
pass: { enter: all, stand: true }
height: { hRange: [0, 10], canopy: 0, climb: free, landMul: 0.8 }
los: none
combat: []                                   # 平常无修正；危险来自"可燃"
interact:
  - { verb: ignite, by: [fire, it_huozhezi, it_huoyou], result: "+tst_ranshao", dur: 3, spread: 0.40 }
weather:
  - { when: "rain>=2h", result: "+tst_nining" }
  - { when: "snow>=3h", result: "+tst_jixue" }
explore: { sta: 0, tracks: 0, mount: 1.1, gather: [herb_common], noise: 1 }
visual: { tex: tex_tr_caodi, tell: "草叶随风摆动；燃烧后变焦黑" }
audio: { step: sfx_step_grass, amb: amb_meadow }
chapters: all
origin: canon
aiHint: { igniteValue: "count(enemies on connected veg) * 8" }
```

#### 示例 B：深水（多通行模式）

```yaml
id: tr_shenshui
name: 深水
group: water
tags: [water, deep]
moveCost: { base: inf, byMode: { waterwalk: 1, swim: 2, boat: 1 } }
exploreSpeed: 0.4                            # 游水速度；踏水按步行 1.0
pass:
  enter: [waterwalk, swim, boat]
  stand: true                                # 踏水者回合末须"踩水"，否则转落水（§4.3）
  maxRun: { waterwalk: { qg3: 3, qg4: 6, qg5: 99 } }
height: { hRange: [0, 3], landMul: 0.3 }
los: none
onEnter:
  - { remove: [bf_zhuoshao, bf_shimang] }   # 06：入水解灼烧、失明
  - { buff: bf_luoshui, when: "mode == swim" }   # 提案 Buff（§12 D-06），规则见 §4.2.3
  - { buff: bf_shishen, dur: 2, when: "mode == swim" }
combat:
  - "mode==swim: attr:eva pct −20%, attr:parry pct −50%, Z7.taken −10%"
  - "mode==waterwalk: attr:parry pct −10%"
interact:
  - { verb: freeze, by: [cold], result: "+tst_bingfeng", note: "按薄冰；格内落水者定身 1 + 寒气 1" }
explore: { sta: { swim: 1, waterwalk: 4 }, dive: { swimMin: 2 }, noise: 2 }
visual: { tex: tex_tr_shenshui, tell: "深蓝、无底纹；与浅水（可见河床）必须一眼区分" }
audio: { step: sfx_step_water_deep, amb: amb_water_still }
chapters: all
origin: canon

#### 示例 C：薄冰（破裂转换）

```yaml
id: tr_baobing
name: 薄冰
group: icesnow
tags: [ice, thinice, slippery, cold]
moveCost: { base: 1 }
exploreSpeed: 0.8
pass: { enter: all, stand: true }
height: { hRange: [0, 4], landMul: 1.0 }
los: none
combat: ["attr:parry pct −10%", "knock +1"]
onEnter:
  - { crack: 1, exempt: ["qgTier>=4"], heavyCrack: 2 }   # 重装（Q_load>0）或被击退落在此格：一次 +2
onStay:
  - { buff: bf_hanqi, chance: 0.20, grade: terrain }
interact:
  - { verb: crack, threshold: 2, result: "→ tr_shenshui + cold", note: "格内单位转落水；该格此后 onStay 寒气 100%" }
  - { verb: thaw, by: [fire, hot], result: "→ tr_shenshui", dur: 2 }
weather: [{ when: "temp==freezing && night", result: "reset tst_liewen" }]
explore: { sta: 0, tracks: 0, noise: 1, event: { crackSfx: true } }
visual: { tex: tex_tr_baobing, tell: "半透明可见水色与气泡；裂纹贴花随 tst_liewen 计数加深" }
audio: { step: sfx_step_ice_thin, onCrack: sfx_ice_crack, onBreak: sfx_ice_break }
chapters: [ch01_tianlong, ch04_yitian, ch06_xiake, ch08_luding, ch09_liancheng, ch12_shujian, ch14_xueshan]
origin: expanded

### 2.7 TypeScript 类型（`packages/data`，Zod 同构）

```ts
export type TerrainId = `tr_${string}`;
export type TerrainStateId = `tst_${string}`;
export type MoveMode = 'walk'|'wade'|'swim'|'waterwalk'|'climb'|'treetop'|'glide'|'boat';
export type QgTier = 0|1|2|3|4|5;

export interface TerrainDef {
  id: TerrainId; name: string;
  group: 'ground'|'veg'|'water'|'icesnow'|'vertical'|'structure'|'mechanism'|'hazard';
  tags: TerrainTag[];
  moveCost: { base: number | 'inf'; byTier?: Partial<Record<`qg${QgTier}`, number>>;
              byMode?: Partial<Record<MoveMode, number>>; uphill?: number };
  exploreSpeed: number;
  pass: { enter: 'all'|'none'|MoveMode[]; stand: boolean; req?: GateExpr;
          maxRun?: Partial<Record<MoveMode, Partial<Record<`qg${QgTier}`, number>>>>;
          occupancy?: 'single'|'normal' };
  height: { hRange: [number, number]; slope?: { dir: Dir8; rise: 1|2 }; canopy?: number;
            void?: boolean; climb?: 'sheer'|'free'|'none'; ceiling?: number; landMul?: number;
            fallTarget?: { region: RegionId; cell: TilePos } | null };
  combat?: string[];                       // §2.2 记法，构建期解析为 Mod[]
  cover?: { vs: ('projectile'|'ranged')[]; hit: number; dmg: number; dir: 'all'|'front' };
  los: 'none'|'partial'|'full';
  onEnter?: TerrainEffect[]; onStay?: TerrainEffect[];
  explore: ExploreRules; interact?: Interaction[]; weather?: WeatherRule[];
  visual: { tex: string; tell: string; vfx?: Record<string, string> };
  audio: { step: string; amb?: string; [k: string]: string | undefined };
  chapters: ChapterId[] | 'all';
  origin: 'canon'|'expanded'|'canonExpanded'; canonRef?: string;
  aiHint?: Record<string, Expr>;
}

export interface TileRuntime {            // 战斗/探索中每格的运行时状态（存档随场景快照）
  terrain: TerrainId; h: number;
  states: { id: TerrainStateId; ticksLeft: number; grade: number; source?: UnitId; value?: number }[];
  objHp?: number;                          // 可破坏物件当前耐久
}
```

---

## 3. 地形目录（48 种）

### 3.0 读表约定

每组两张表：**表 a**（通行 · 高度 · 战斗）与**表 b**（效果 · 探索 · 互动 · 表现 · 书界）。两表合起来即 `TerrainDef` 全部字段。

| 列 / 记号 | 含义 |
|---|---|
| 移动 | 战斗移动点：`1`、`2（qg4:1）`= 基础 2，轻功四阶起 1；`∞` 不可进入；`踏1` = 以踏水模式 1 |
| 探速 | `exploreSpeed`（探索步行倍率） |
| 通行 | `全` 任何人；`qgN` 需轻功境界 N；`踏/游/攀/梢/船` = 通行模式（§1.2）；`站×` 不可停留 |
| 高度 | 典型 `h`；`冠n` 冠高；`坡` 沿坡不受 jump 限制；`峭` 峭壁面（§5.2）；`顶n` 顶高；`落×k` 坠落伤害系数 |
| 战斗 | §2.2 记法；`遮` = 遮蔽 `{hit, dmg}`；`视` = 视线 none/partial/full（无记=none） |
| 进入 / 停留 | 06 Buff ID + 概率 + 品阶（`T` = `terrainGrade`，`T+1` 同理，`源` = 来源招式品阶）；`免` = 豁免条件 |
| 探索 | 体力（每格/每秒）、足迹、隐藏、迷路、坐骑、采集、事件、噪声 |
| 互动 | `点燃 p` = 可燃（蔓延率 p）；`冻结`；`破坏 k` = 可破坏（耐久系数 k，§7.5.3）；`→` 转换结果 |
| 表现 | 材质键省略前缀 `tex_tr_`；脚步音省略前缀 `sfx_step_`；`tell` 为可读性要点 |

### 3.1 地面与植被（13 种）

**表 3.1a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_pingdi` | 平地（土地/石板/官道/庭院） | 1 | 1.0（官道 1.2） | 全 | 0–10；落×1.0 | — |
| `tr_caodi` | 草地（含草原） | 1 | 1.0（骑 1.1） | 全 | 0–10；落×0.8 | —（危险来自可燃） |
| `tr_huacong` | 花丛 | 2（草上飞 1） | 0.8 | 全；骑× | 冠 1；落×0.8 | 遮 {projectile: 命中 −5}；`stealthy` |
| `tr_zhulin` | 竹林 | 2 | 0.7 | 全；骑× | 冠 3；视 partial | 遮 {projectile −10, ranged −5}；`cat:spear,staff Z7.dealt −10%`（长兵为竹所制） |
| `tr_milin` | 密林（含瘴林变体 `miasma`） | 2 | 0.6 | 全；骑× | 冠 3；视 partial | 遮 {projectile −10, ranged −5} |
| `tr_jingji` | 荆棘 | 3 | 0.4 | 全；骑× | 冠 1；落×1.2 | `attr:parry pct −10%` |
| `tr_suishi` | 碎石（戈壁/乱石坡） | 2 | 0.7（骑 0.7） | 全 | 0–10；落×1.2 | `knock +1` |
| `tr_shadi` | 沙地（大漠/海滩） | 2（qg4:1） | 0.7（qg4 1.0；骆驼 1.2；马 0.8） | 全 | 0–10；落×0.9 | `attr:eva pct −5%`（qg4 免） |
| `tr_liusha` | 流沙 | 3（qg4:1） | 0.3（qg4 1.0） | 全（进入即陷） | 0–10 | `attr:eva pct −20%`（qg4 免）；`noStance` |
| `tr_nizhao` | 泥沼 | 3（qg4:1） | 0.5（qg4 1.0） | 全；骑× | 0–4；落×0.6 | `attr:parry pct −10%`（qg4 免） |
| `tr_duzhao` | 毒沼 | 3（qg4:1） | 0.5（qg4 1.0） | 全；骑× | 0–4；落×0.6 | 同泥沼 |
| `tr_jiaotu` | 焦土（燃烧后生成） | 1 | 1.0 | 全 | 同原地形 | — |
| `tr_taijie` | 台阶/坡道/木梯 | 1（上行每升 1 级 +1） | 0.9（上行 0.7） | 全 | 坡 `rise` 1–2，沿坡不受 `jump` 限制 | —（高低差按 §5.5） |

**表 3.1b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_pingdi` | — | 疾行 2/秒；坐骑 ✓；噪声 1（石板 2） | 雨 2 时辰 → `tst_nining`（土质）；雪 3 时辰 → `tst_jixue` | `pingdi__<书界>`（黄土/青石板/官道/庭院砖）；tell"默认地面"；音 `dirt`/`stone` | 全 |
| `tr_caodi` | — | 采集草药；噪声 1 | 点燃 40%，燃烧 3 → `tr_jiaotu`；雨→泥泞；雪→积雪 | `caodi__<草原/山野>`；tell"草叶摆动"；音 `grass` | 全（草原：射雕、白马、书剑） |
| `tr_huacong` | 毒花变体 `poisonous`：停留 `bf_mabi` 20%（T） | 采集花材/药材；夜间潜行 +1 级 | 点燃 35% | `huacong__<桃林/茶花/毒花>`；tell"花团密集；毒花带紫斑"；音 `bush` | 天龙（曼陀山庄茶花）、射雕（桃花岛桃林）、飞狐（药王谷毒花） |
| `tr_zhulin` | — | 无地图时迷路（视野 5）；采集竹材（竹筏、箭杆）；风 ≥ 2 竹涛掩声（潜行 +1 级）；噪声 1 | 点燃 30%，燃烧 2 → 焦土；刀剑砍伐 1 行动 → 平地（冠 0） | `zhulin`；tell"竹竿密立、可透缝隙"；音 `bamboo` | 天龙（大理）、射雕（桃花岛，待考）、笑傲（洛阳绿竹巷）、侠客、书剑 |
| `tr_milin` | 瘴林：停留 `bf_zhongdu` 1 层 50%（T；免：`bf_mian_du` ≥ T、辟瘴丹） | 迷路：无地图/向导时视野 4、出口偏移；猛兽遭遇 ×1.5（11）；采集药材木料 | 点燃 25%，燃烧 4；雨中瘴气概率 ×1.5 | `milin__<南/北>`；tell"树冠压顶；瘴林浮绿雾"；音 `forest` | 全（瘴林：天龙大理、飞狐药王谷、碧血五毒教一带，后者待考） |
| `tr_jingji` | 进入（`every`，每次移动至多 2 次）：`bf_liuxue` 1 层 60%（T；免：蛇行狸翻、`bf_mian_liuxue`） | 每格 −2% `hpMax`（不致死）或花 1 行动砍开；骑× | 点燃 40%；刀剑砍伐 → 平地 | `jingji__<山野/骆驼刺>`；tell"刺枝红果"；音 `bush_thorn` | 全（骆驼刺变体：白马、书剑） |
| `tr_suishi` | — | 坡面每 10 格 5% 落石（−3% `hpMax`）；噪声 2（潜行 −1 级） | 石阵被毁、熔岩凝固的结果地形 | `suishi__<戈壁/山地>`；tell"灰碎石、坡上滚石痕"；音 `gravel` | 全（戈壁：白马、书剑） |
| `tr_shadi` | — | 白昼酷热：体力消耗 +25%（11）；足迹 2 时辰（有风 0.5）；可挖掘；噪声 0 | 沙暴（§8.2）；流沙的伪装基底 | `shadi__<大漠/海滩>`；tell"黄沙波纹"；音 `sand` | 射雕（蒙古大漠）、侠客（海岛沙滩）、白马、书剑 |
| `tr_liusha` | 进入：`bf_xianluo`（陷落，提案）1 层 100%；停留 +1 层；3 层 → `bf_dingshen` 1 回合且每回合 −3% `hpMax`；离格清零（免：qg4） | 伪装为沙地：`lore ≥ 40`、`formation` 探测半径内或踩过后显示；陷入每秒 −5 体力，体力 0 → "流沙吞没"：被拉回上一安全格、−10% `hpMax`（不致死） | — | `liusha`；tell"细微涡纹与下陷（识破后高亮）"；音 `sand_sink` | 白马、书剑（射雕大漠为原创扩展） |
| `tr_nizhao` | 进入：`bf_chizhi` 100%（T，2 回合）；停留：`bf_jiansu` 50%（T）（免：qg4；06 已标注来源"泥沼地形"） | 非 qg4 每格 −1 体力；足迹 12 时辰；噪声 2 | 冻结 → 按冰面（`2 + ⌊g/3⌋` tick）；不可燃 | `nizhao`；tell"暗褐泥浆、气泡"；音 `mud` | 全 |
| `tr_duzhao` | 进入：同泥沼 + `bf_zhongdu` 1 层 100%（T+1；免 qg4"踏足不沾"）；停留：`bf_zhongdu` 1 层 100%（T+1，瘴气，qg4 **不**免）；每 4 tick 随机 1 格生 `tst_duwu` | 探索中停留每时辰判定中毒；`antidote ≥ T(T+1)` 可配辟瘴丹；采集毒草 | 点燃 → **沼气爆燃**：3×3 热伤 `hpMax × 4%`（品阶 = 源）并清除附近毒雾 5 tick（原创扩展）；冻结 → 冰面 | `duzhao`；tell"墨绿泥、紫雾、白骨"；音 `mud_bubble` | 天龙（大理毒林，原创扩展）、碧血（五毒教，待考）、飞狐（药王谷）、鹿鼎（神龙岛，原创扩展） |
| `tr_jiaotu` | 生成后 1 tick 内"余烬"：停留 `bf_zhuoshao` 20%（源） | 足迹 4 时辰；3 日后复为草地（11） | 不可再燃 | `jiaotu`；tell"焦黑与火星"；音 `ash` | 动态 |
| `tr_taijie` | — | 上行疾行体力 ×1.5 | 木梯可燃 20%、可破坏（k 0.5）；石阶不可 | `taijie__<石阶/木梯/坡道>`；tell"阶线清晰；高亮模式显示坡向箭头"；音 `stone_step` | 全 |

### 3.2 水域（5 种）

**表 3.2a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_qianshui` | 浅水（及膝） | 2（踏 1，qg3） | 0.6（踏 1.0） | 全（涉） | 0–3；落×0.5 | 涉水者 `attr:eva pct −10%`（踏水免）；格内目标受 `fire` 招式 `Z7.taken −20%`、受 `cold` 招式 `Z7.taken +10%` |
| `tr_shenshui` | 深水（没顶） | ∞（踏 1 / 游 2 / 船 1） | 游 0.4；踏 1.0 | 踏（qg3 连续 ≤ 3 格；qg4 ≤ 6；qg5 不限）/ 游 / 船 | 0–3；落×0.3 | 游：`attr:eva pct −20%`、`attr:parry pct −50%`、`Z7.taken −10%`，只能施放拳脚、短兵（奇门 `dagger`）与内功招式；踏：`attr:parry pct −10%` |
| `tr_jiliu` | 急流 | ∞（踏 1 / 游 3 / 船 1） | 游 0.3（顺流 1.2） | 踏需 qg4（水上漂等可降阈值，§4.5）/ 游（逆流需水性 3）/ 船（需船夫） | 0–3；落×0.4 | 游者同深水，且每环境 tick 顺流被冲 1 格（撞岸撞礁按 05/06 撞击）；踏者 `attr:parry pct −10%`、`attr:eva pct −5%`；`knock +1`（仅顺流方向） |
| `tr_pubu` | 瀑布（水幕面 / 瀑底） | 水幕：不可进入；瀑底：同急流 | — | 水幕上攀：峭壁规则且湿滑（`climbMax − 1`：qg4 攀 3 级、qg5 攀 4 级） | 峭；视 full（水帘） | 瀑底：`attr:hit pct −10%`；`sonic` 招式半径 −1（轰鸣）；每环境 tick 20% `bf_shiheng`（qg3 免） |
| `tr_dajiang` | 大江湖面（江、大湖、海） | ∞（踏 1，qg5 / 船 1） | 船 1.5 | qg5 一苇渡江 / 船；游：仅离岸 3 格内 | 0–2 | 踏者 `attr:parry pct −10%`；战斗通常发生在船甲板（§3.5） |

**表 3.2b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_qianshui` | 进入：移除 `bf_zhuoshao`、`bf_shimang`（06"入水解除"） | 涉水体力 0；采集鱼贝；噪声 2；不留足迹 | 冻结 → `tst_bingfeng`（按冰面）；河道区域暴雨 6 时辰 → 深水（§8.2）；不可燃 | `qianshui`；tell"可见河床卵石与涟漪"；音 `water_shallow` | 全 |
| `tr_shenshui` | 进入：移除灼烧、失明；游：`bf_luoshui`（落水，提案）+ `bf_shishen`（湿身，提案）2 回合；停留（游、水性 0）：−4% `hpMax`（溺水，Boss 系数按 06 §11.4） | 游水每格 1 体力（水性 1）；潜水（水性 ≥ 2）进入水下通道；物品受潮：火折子 1 时辰内失效；噪声 2 | 冻结 → 按薄冰，格内游者 `bf_dingshen` 1 + `bf_hanqi` 1；灭火 | `shenshui`；tell"深蓝无底纹"（须与浅水一眼区分，tech/07）；音 `water_deep` | 全 |
| `tr_jiliu` | 同深水；被击退入急流：顺流再移 2 格并落水 | 竹筏/船顺流快速旅行（11）；噪声 3（水声掩护：2 格外脚步不可闻） | 仅地阶以上寒系招式可冻结 1 tick；暴雨流速 +1（每 tick 冲 2 格） | `jiliu`；tell"白浪、流向纹理"；音 `water_rapids` | 射雕（渔樵耕读溪瀑，待考）、神雕（剑冢山洪）、书剑（回疆河流，原创扩展）、各书界山区 |
| `tr_pubu` | 瀑底停留：移除灼烧 | 水帘后常藏洞口（`hidden`：靠近 2 格内或 `lore ≥ 30` 显示）；瀑下练功点（11/05 闭关地）；噪声 3 | 天阶寒系招式可冻结水幕 1 tick → 冰瀑按峭壁（qg3 可攀）（原创扩展） | `pubu`；tell"白色水幕与水雾"；音 `waterfall` | 射雕（一灯大师隐居处，待考）、神雕（剑冢山洪）、各书界山区 |
| `tr_dajiang` | 踏者风浪 ≥ 2 级时每 tick 10% `bf_shiheng` | 一苇渡江每格 3 体力（熟练折扣 §4.4）；沙洲、礁石为落脚点（可停下回体力）；渡口船夫按时辰发船（11） | 风浪（§8.4） | `dajiang__<江/湖/海>`；tell"开阔水面、远岸"；音 `water_wave` | 天龙（太湖）、射雕（太湖）、倚天（东海航程、王盘山）、侠客（海）、鹿鼎（辽东外海）、书剑（钱塘江） |

### 3.3 冰雪（5 种）

**表 3.3a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_bingmian` | 冰面（厚冰） | 1 | 0.9（qg4 1.0） | 全 | 0–10 | `attr:eva pct −5%`、`attr:parry pct −10%`、`knock +1`（qg4 免）；**滑行**：移动最后一步若沿直线且前方仍为冰面，再滑 1 格，除非额外支付 1 移动点"刹步"（qg4 免） |
| `tr_baobing` | 薄冰 | 1 | 0.8 | 全 | 0–4 | `attr:parry pct −10%`、`knock +1` |
| `tr_xuedi` | 雪地 | 2（qg4:1） | 0.7（qg4 1.0；马 0.6） | 全 | 0–10；落×0.7 | `attr:eva pct −5%`（qg4 免） |
| `tr_shenxue` | 深雪 | 3（qg4:1） | 0.4（qg4 1.0） | 全；骑× | 0–10；落×0.5 | `attr:eva pct −10%`；从此格起跳 `jump −1`（qg4 免） |
| `tr_bingku` | 冰窟（冰洞、冰隙内部） | 1 | 0.9 | 全 | 顶 3；落×1.0 | 同冰面滑行；`cold` 招式 `Z7.dealt +10%`、`fire` 招式 `Z7.dealt −10%` |

**表 3.3b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_bingmian` | 停留：`bf_hanqi` 1 层 20%（T） | 惯性滑行 1 格（可借滑冰加速 ×1.3）；冰钓（11）；噪声 1 | 火/热 2 tick → 下层水（浅水或深水）；`hard` 绝招命中 → 薄冰 | `bingmian`；tell"白蓝厚冰、不透水色"；音 `ice` | 天龙（天山）、倚天（冰火岛）、侠客（凌霄城）、鹿鼎（辽东、雅克萨冬季）、连城（雪谷）、书剑（天山）、雪山 |
| `tr_baobing` | 进入：`tst_liewen` +1（重装 `Q_load > 0` 或被击退落此 +2；qg4 免）；计数 2 → 破裂为深水（冰水：停留 `bf_hanqi` 100%），其上单位落水；停留：`bf_hanqi` 20% | 探索中踩裂有音效预警（第 1 次）；噪声 1 | 火 2 tick → 深水；寒夜复原裂纹 | `baobing`；tell"半透明见水与气泡；裂纹随计数加深"；音 `ice_thin` / `ice_crack` | 同冰面 |
| `tr_xuedi` | 停留：夜间或暴雪时 `bf_hanqi` 1 层 20%（T） | 足迹 6 时辰（qg4 无）；无御寒装备 → `bf_shouhan`（06）；非 qg4 疾行体力 ×1.5；噪声 1 | 火 2 tick → 平地 + `tst_nining` | `xuedi`；tell"白雪与脚印凹痕"；音 `snow` | 天龙（雁门关外、天山）、射雕（蒙古冬季）、神雕（华山、蒙古）、倚天（昆仑、冰火岛）、侠客、鹿鼎（辽东、五台冬）、连城、书剑（天山）、雪山 |
| `tr_shenxue` | 进入：`bf_xianluo` 1 层（免 qg4）；停留：`bf_hanqi` 1 层 40%（T） | 非 qg4 每格 −1 体力；足迹 12 时辰；**雪崩坡**：区域内发生战斗、`sonic` 招式或爆燃 → 雪崩事件（通道封闭 N 日或生成新坡道，区域脚本）；噪声 0 | 火 → 降为雪地 | `shenxue`；tell"单位下半身没入雪中"；音 `snow_deep` | 天龙（缥缈峰）、倚天（昆仑）、侠客（凌霄城）、连城（雪谷）、雪山（玉笔峰） |
| `tr_bingku` | 停留：`bf_hanqi` 1 层 60%（T+1；06：冰窟→寒气满层冰冻） | 无光视野 3（火把 6）；无御寒每时辰 `bf_shouhan`；采集冰晶、寒玉（10）；回声：`sonic` 半径 +1 | 火 3 tick → 浅水（顶部滴水） | `bingku`；tell"蓝色冰壁、顶悬冰棱"；音 `ice_cave` | 倚天（冰火岛，原创扩展）、雪山（藏宝冰洞）、天龙（天山，原创扩展） |

### 3.4 高差与险地（10 种）

> 峭壁的表示：`tr_qiaobi` 刷在**崖顶岩面**的格上；任何单位从低处进入该格且 `Δh ≥ 3` 时视为攀峭壁（需 qg3，§5.2），`Δh ≤ 2` 按普通纵跃。虚空格 `tr_shengu` 没有地面。

**表 3.4a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_qiaobi` | 峭壁（崖顶岩面） | 1；攀上时 `1 + Δh` | 攀 0.3 | 上攀 `Δh ≥ 3`：qgTier ≥ 3 且 `Δh ≤ climbMax`（§5.2）；攀下同理，否则按坠落 | 峭；0–10 | 居高按 §5.5；周边通常配悬崖边 |
| `tr_xuanya` | 悬崖边 | 1 | 1.0 | 全 | 相邻落差 ≥ 6 或虚空 | `attr:eva pct −5%`（临渊）；`Z7.dealt +5%`（临渊一搏，原创扩展）；朝落差方向被击退 → 坠落/坠崖（§5.3–5.4） |
| `tr_shengu` | 深谷/断崖（虚空） | ∞ | — | 仅跨越：沟宽 `w ≤ jump`（战斗）/ `w ≤ qgTier`（探索）；站× | 虚空；可设 `fallTarget` | 进入即坠崖（§5.4） |
| `tr_wuding` | 屋顶（坡面/屋脊） | 1 | 1.0 | 从地面上屋 `Δh ≤ jump`（檐高 2–4）；在屋面站立、行走需 qg2（飞檐） | 2–6；落×1.0 | 坡面 `attr:eva pct −5%`、`attr:parry pct −5%`；雨中 `tst_shihua` |
| `tr_gaoqiang` | 高墙（墙头） | 1 | 1.0 | 上墙 `Δh ≤ jump`（矮墙 2、院墙 3、高墙 4）；qg3 借壁 +1（§4.2）；墙头站立、行走需 qg2；窄道 | 2–4（高出两侧） | 墙头 `attr:parry pct −10%`；两侧击退 → 坠落；墙体按高度遮挡视线 |
| `tr_shushao` | 树梢 | 1（梢间） | 1.0 | qg3（`treetop`）；从地面上梢 `Δh = 3 ≤ jump` | 地面 + 3；视 partial | `attr:eva pct +10%`、`attr:parry pct −10%`、`noStance`；被击退 → 落地 3 级 |
| `tr_tiesuoqiao` | 铁索桥 | 2（qg3:1） | 0.6（qg3 1.0） | 全；窄道（不可穿越友军） | 悬空，下为虚空 | `attr:eva pct −10%`、`attr:parry pct −10%`（qg3 免）；侧向击退 → 坠崖（qg3+"抓索"50% 自救：留在原格并 `bf_dingshen` 1）；摇晃：风 ≥ 2 每 tick 20% `bf_shiheng`（qg3 免） |
| `tr_dumuqiao` | 独木桥（含石梁变体） | 2 | 0.6 | 全；窄道 | 悬空（水或谷上） | `attr:eva pct −10%`、`attr:parry pct −15%`、`cat:spear,staff Z7.dealt −10%`；侧向击退 → 落水/坠落 |
| `tr_zhandao` | 栈道 | 1 | 0.9 | 全；宽 1 为窄道 | 崖壁中段；内侧峭壁、外侧临渊 | `attr:parry pct −5%`；外侧击退 → 坠落/坠崖 |
| `tr_yunhaizhandao` | 云海栈道 | 1 | 1.0 | qg5（基准 §11）；缺口 2–5 格虚空需跨越 | 高空；常驻雾与强风 | 同栈道；摇晃（qg5 免） |

**表 3.4b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_qiaobi` | — | 攀爬每级 5 体力（03）；超过 5 级的山体用多段 `QinggongGate`（每段 ≤ climbMax，段间为落脚点）；失手（体力 0）→ 滑落至上一落脚点、−3% `hpMax` | 飞爪/绳索（10，建议 `it_feizhua`）：探索中按 qg3 攀 `Δh ≤ 3` 一次，噪声 3；雨中 `climbMax −1` | `qiaobi__<花岗/丹霞/雪崖>`；tell"垂直岩面，可攀处有裂缝与藤"；音 `rock` | 全（华山、思过崖、黑木崖、摩天崖、剑冢、铁掌峰、玉笔峰…） |
| `tr_xuanya` | — | 眺望点（11：揭示周边地图）；坠崖奇遇入口（`fallTarget` 在相邻虚空格）；风力 +1 | 剧情崩塌 | `xuanya`；tell"边缘碎石、下方云雾；UI 显示落差数字"；音 `wind_cliff` | 全 |
| `tr_shengu` | 进入 = 坠崖 | 跨越体力 `4 × w`；桥梁为常规渡口；坠崖奇遇（§5.4） | — | `shengu`；tell"深色虚空与云雾；边缘描白线"；音 `wind_gorge` | 天龙（无量山）、神雕（断肠崖）、倚天（昆仑）、雪山；各书界山区 |
| `tr_wuding` | 进入：从 ≥ 3 级高处落下或被击退落此 → 30% 瓦破，坠入室内（按室内地面计落差） | 屋顶路网绕开巡逻；夜间屋面视为暗处；噪声 2（踩瓦，巡逻警觉，11） | 茅草顶点燃 30%；瓦顶可破坏 k 0.3："揭瓦窥听"（原创扩展）；雨 → `tst_shihua`；雪 → `tst_jixue` | `wuding__<青瓦/茅草/城楼>`；tell"瓦垄与屋脊线"；音 `roof_tile` | 全 |
| `tr_gaoqiang` | — | 翻墙体力 `4 × Δh`；墙根阴影夜间潜行 +1 级；噪声 1 | 飞爪攀墙；破墙 k 5（仅攻城器械/剧情） | `gaoqiang__<院墙/宫墙/牢墙>`；tell"墙头瓦檐"；音 `wall` | 全 |
| `tr_shushao` | — | 梢间穿行每格 2 体力（03）；越过密林、荆棘、沼泽的捷径；眺望；噪声 0 | 下方林木燃烧 → 本格消失，其上单位落地；砍倒（k 1.0）→ 沿倒向生成 3 格 `tr_dumuqiao`（倒木成桥，原创扩展） | `shushao`；tell"树冠顶可立足处（高亮显示落脚点）"；音 `leaves` | 全（天龙大理、神雕、倚天武当、书剑尤多） |
| `tr_tiesuoqiao` | — | qg < 2 每格 1 体力（平衡）；风力 ≥ 3 时 qg < 3 不能通过（等风停）；噪声 2（铁链） | 砍断铁索 k 2.0（仅 `hard` 招式、断兵类神兵或剧情）→ 桥塌：其上单位坠崖，qg4+ 可于塌前跃至 `jump` 内最近可站格 | `tiesuoqiao`；tell"铁链木板、随风晃动"；音 `chain_bridge` | 原创扩展为主：天龙（缥缈峰）、倚天（昆仑、光明顶）、侠客（凌霄城）、碧血（华山）——原著细节均待考 |
| `tr_dumuqiao` | 进入：qg0 单位 20% `bf_shiheng` | qg0 每格 5% 失足（按下方地形落水或坠落），qg1+ 无；噪声 1 | 木质点燃 20%、砍断 k 0.5 → 缺口；石梁变体 `stone` 不可燃不可断 | `dumuqiao__<木/石梁>`；tell"单根圆木 / 窄石条"；音 `wood_log` | 全（射雕渔樵耕读"读"之石梁，待考） |
| `tr_zhandao` | 朽木变体 `rotten`：进入 `tst_liewen` +1，计数 2 → 断为 1 格虚空缺口 | 骑×；对向 NPC 需让路；噪声 2 | 点燃 30% → 缺口；破坏 k 0.5 → 缺口 | `zhandao`；tell"崖壁木桩与木板，朽木发黑"；音 `wood_plank` | 碧血、笑傲（华山险道，原著称华山险峻，栈道细节待考）；天龙、神雕（原创扩展） |
| `tr_yunhaizhandao` | — | 每格 3 体力 + 跨缺口 `4 × w`（03）；视野 4；失手 → 书灵拉回起点（体力 0 + `bf_pibei`） | — | `yunhai`；tell"云海翻涌、木栈时隐时现"；音 `wind_high` | 原创扩展：天龙（缥缈峰）、神雕（华山绝顶）、倚天（昆仑之巅）、碧血（华山）、雪山（玉笔峰） |

### 3.5 建筑与人工（5 种）

**表 3.5a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_chengqiang` | 城墙（墙道与垛口） | 1 | 1.0 | 城内马道/台阶：全；城外攀城：峭壁规则（h 5–6 → qg5，或 qg4 + 借壁）；云梯物件：全 | 5–6；墙道宽 2–3 | 垛口遮蔽 `{projectile, ranged: 命中 −15, Z7.taken −15%, dir: front}`（仅对来自墙外的攻击）；外沿击退 → 坠落 5–6 级 |
| `tr_gongdianwuji` | 宫殿屋脊（琉璃瓦） | 1 | 1.0 | 上殿 `Δh` 4–6：qg4，或 qg3 + 借壁，或梯；屋面：qg2 可走 | 4–8；屋脊为遮挡（+1 级） | `attr:eva pct −5%`（qg3 免）；`slippery`：一次移动 ≥ 3 格 → 20% 沿坡下滑 1 格（qg3 免），滑出檐口即坠落 |
| `tr_chuanjiaban` | 船甲板（含桅杆） | 1 | 1.0 | 全；桅杆：沿桅攀爬视为台阶（不受 `jump` 限制），桅顶 `h+4` 站立需 qg2 | 高出水面 1–2 | 船舷外沿击退 → 落水；风浪 ≥ 2 每 tick 15% `bf_shiheng`（qg3 免） |
| `tr_shinei` | 室内（含房梁） | 1 | 1.0 | 全；房梁（`beam` 格，`h+2`）：qg2 | 顶 3（低屋 2、殿堂 5） | 无天气；梁上 `attr:eva pct +5%`、`attr:parry pct −10%`；家具为可破坏阻挡物 |
| `tr_dongku` | 洞窟/密道 | 1 | 0.9 | 全；窄隙门禁（§6.1）；水下通道需潜水 | 顶 2–4；宽 1 通道为窄道；暗 | 宽 1 通道中 `cat:spear,staff Z7.dealt −10%`；回声：`sonic` 半径 +1 |

**表 3.5b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_chengqiang` | — | 夜间巡逻换班（时辰门禁）；噪声 1 | 滚木礌石：推下 → 城下直线 3 格击退 2 + `hpMax × 5%`（T）；火油 → `tst_youzi`；城门（物件 k 8：开/关/撞）；推倒云梯（其上单位坠落） | `chengqiang__<襄阳/北京/木城>`；tell"垛口与马道"；音 `stone` | 神雕（襄阳）、碧血（北京）、鹿鼎（扬州、雅克萨木城）；倚天、书剑按需（待考） |
| `tr_gongdianwuji` | — | 夜间潜行路线；屋上暗哨（原创扩展）；噪声 2（踩瓦） | 破瓦 k 0.3（噪声 3）；雨 → `tst_shihua`（下滑概率 ×2） | `gongdian`；tell"黄琉璃瓦、吻兽、屋脊"；音 `roof_glazed` | 碧血、鹿鼎（紫禁城）；书剑、飞狐（北京，待考）；天龙（大理/辽宫城，原创扩展） |
| `tr_chuanjiaban` | — | 航行与渡口（11）；噪声 1 | 甲板点燃 20%、帆 60%；沉船（剧情）→ 全体落水 | `jiaban__<小舟/海船/画舫>`；tell"木甲板、船舷、桅杆"；音 `wood_deck` | 天龙（太湖小舟）、倚天（东海航程）、侠客（赴侠客岛）、鹿鼎（辽东外海）、书剑（西湖画舫、钱塘江） |
| `tr_shinei` | — | 夜间无光视野 4（有灯 8）；梁上藏身潜行 +2 级（"梁上君子"）；门锁：钥匙或 `formation ≥ T(g)` 开锁；噪声 1 | 木构点燃 25%；家具破坏 k 0.2 | `shinei__<民居/殿堂/牢房/酒楼>`；tell"地砖木板、梁柱"；音 `wood_floor` | 全 |
| `tr_dongku` | — | 照明门禁：无光视野 3（火把 6、夜明珠 8）；暗门识破 `formation ≥ T(g)` 或 `lore ≥ 50`；蝙蝠受惊 → 视野 −2 持续 1 时辰；回声使噪声传播 ×2 | 落石封路（剧情）；水下通道（§4.2.3） | `dongku`；tell"岩壁、火光摇曳"；音 `cave_drip` | 全（琅嬛福地、周伯通洞、光明顶密道、金蛇洞、思过崖后洞…） |

### 3.6 奇门与机关（5 种）

**表 3.6a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_shizhen` | 石阵/奇门阵 | 2 | 0.5 | 全；骑× | 阵石为阻挡；阵眼 1–3 个（物件 k 3）；视 full（阵内非相邻格互不可见） | 未看破者：视野 2；每次移动第 3 步起每步 25% 偏移到随机相邻可通行格（"迷踪"，战斗种子）；**看破**（`formation ≥ T(g阵)`）：正常；**驭阵**（`formation ≥ T(g阵) + 16`）：阵内友方 `attr:eva pct +10%`、敌方 `attr:hit pct −10%` |
| `tr_jiguan` | 机关地板 | 1 | 1.0 | 全（`hidden` 直至识破） | 陷坑型下有 3–5 级落差 | 进入触发（qg4 不触发，基准 §11）；类型见表 b |
| `tr_mushi` | 墓室机关（古墓） | 1 | 0.8 | 全 | 室内，顶 3；暗 | 寒玉床室停留 `bf_hanqi` 20%（T）；其余同室内 |
| `tr_migong` | 迷宫（高昌） | 1（积沙格 2） | 0.8 | 全 | 土墙通道宽 1–2；室内段暗 | 同室内；宽 1 段长兵受限同洞窟 |
| `tr_shibi` | 石壁（刻图/刻字之壁） | ∞ | — | 不可进入；站× | 墙体；视 full | 被击退撞壁 → 撞击（05/06） |

**表 3.6b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_shizhen` | — | 迷路回环：错误路线送回入口（解谜）；看破：`formation ≥ T(g阵)`（03 §8.1），或向导 NPC、阵图物品（`it_zhentu_*`，10）；噪声 0 | 击毁全部阵眼 → 阵法失效，阵石格转 `tr_suishi`；桃林阵随花期（春）视野再 −1 | `shizhen__<乱石/桃林/竹阵>`；tell"石柱按卦位排布；看破后阵眼泛金光"；音 `wind_stone` | 射雕（桃花岛、归云庄）、神雕（桃花岛；黄蓉布石阵，待考）；其余书界原创扩展 |
| `tr_jiguan` | 进入触发 `trapType`：`arrow` 暗弩（投射伤害 `hpMax × 6%`，可淬 `bf_zhongdu`/`bf_judu`，T+1）；`pit` 翻板（坠落 3–5 级，底部尖刺 落×1.5）；`net` 罗网（`bf_dingshen` 2 或 `bf_fengqinggong` 2）；`gas` 迷烟（`bf_hunshui` 2 或生成 `tst_duwu`）；`blade` 刀轮（`bf_liuxue` 2 层）；`boulder` 滚石（直线击退 2 + 撞击） | 识破半径 `1 + ⌊formation/25⌋`（03 §8.2）或 `lore ≥ 60` 相邻识破；拆除成功率 `0.60 + 0.04 × (formation − T(g))`（03 §8.1）；重置：战斗 5 tick / 探索 1 时辰 | 可被 `hard` 攻击击毁（k 1.0） | `jiguan`；tell"识破后显示砖缝与机括标记"；音 `mechanism` | 神雕（古墓）、倚天（光明顶密道，待考）、碧血（金蛇洞，待考）、白马（高昌迷宫）；鹿鼎、连城（原创扩展） |
| `tr_mushi` | — | 断龙石（剧情门禁：放下则主出口永闭）；暗门（`formation ≥ T(g)`、古墓派身份或古墓地图）；石棺秘道（互动开启 → 通地下水道，潜水）；寒玉床：内功闭关修炼 ×1.5（05/11 接口，原著寒玉床助练内功）；玉蜂：驭兽门禁 | — | `mushi`；tell"青石墓道、长明灯"；音 `tomb` | 神雕（古墓）；射雕、倚天（古墓存在，内容原创扩展） |
| `tr_migong` | — | 无地图：视野 3、回环；迷宫图物品解锁导航；沙暴后部分通道积沙转 `tr_liusha` 6 时辰；散布机关地板与宝藏 | — | `migong`；tell"土坯墙、壁画、积沙"；音 `ruin_wind` | 白马（高昌迷宫）；书剑（回疆迷城，复用，原创扩展） |
| `tr_shibi` | — | 需照明；**参悟**（`study`）：读取壁上武学，规则归 05 与 chapters（侠客岛石壁"识字反碍"：03 D-16 建议修炼速度 × `(1.5 − 0.01 × max(art, lore))`，下限 0.5） | — | `shibi`；tell"刻画与文字；参悟时浮现剑意光纹"；音 — | 侠客（侠客岛石室）、笑傲（思过崖后洞石壁）、天龙（无量玉璧，待考）、神雕（古墓石刻，待考）、碧血（金蛇洞，待考） |

### 3.7 危险与书界特有（5 种）

**表 3.7a 通行 · 高度 · 战斗**

| ID | 名称 | 移动 | 探速 | 通行 | 高度 | 战斗 |
|---|---|---|---|---|---|---|
| `tr_huoyan` | 火焰（固定火场：火盆、火墙、焚烧中的建筑） | 2 | — | 全（受伤） | 视 partial | 进入（`every`）与停留：`bf_zhuoshao` 100%（T+1）；相邻格停留 30% `bf_zhuoshao`（热辐射） |
| `tr_rongyan` | 熔岩/火山 | ∞ | — | 不可自愿进入 | 相邻格带 `hot` | 被击退入熔岩：`hpMax × 25%`（Boss/精英按 06 §11.4 系数）+ `bf_zhuoshao`（品阶 10，3 回合），并弹回最近安全格；相邻停留 20% `bf_zhuoshao`（T） |
| `tr_qinghuacong` | 情花丛（绝情谷） | 2 | 0.7 | 全 | 冠 1 | 遮 `{projectile: 命中 −5}` |
| `tr_sheku` | 蛇窟（神龙岛） | 2 | 0.7 | 全 | 0–6 | —（危险来自蛇毒） |
| `tr_liubai` | 留白（终局书海白页边缘） | ∞ | — | 不可进入（虚空变体 `void: blank`） | 虚空 | 被击退入内 → "留白"：离场 1 回合（下一次行动跳过，不计倒地、无坠落伤害），随后回到最近的空白页边缘空格；**所有单位适用**（13 终卷规则覆写 §5.4 的 Boss 免疫） |

**表 3.7b 效果 · 探索 · 互动 · 表现 · 书界**

| ID | 进入 / 停留 | 探索 | 互动 / 天气 | 表现 | 书界 |
|---|---|---|---|---|---|
| `tr_huoyan` | 见表 a；免：`bf_mian_re` ≥ 品阶、避火装备 | 穿行每格 −8% `hpMax`（不致死） | 灭火：水系招式、泼水、暴雨 → `tr_jiaotu`；每 tick 向相邻可燃格蔓延 40% | `huoyan`；tell"明火、热浪扭曲"；音 `fire` | 倚天（万安寺宝塔，待考）、飞狐（商家堡铁厅，待考）；各书界剧情火场 |
| `tr_rongyan` | 见表 a | 火山地表（相邻）体力消耗 +25%；温泉为恢复点 | 寒系招式冻结 → 凝为 `tr_suishi` 3 tick（临时通道，原创扩展） | `rongyan`；tell"橙红熔流、黑色硬壳"；音 `lava` | 倚天（冰火岛） |
| `tr_qinghuacong` | 进入（`every`，每次移动至多 2 次）与停留：`bf_qinghuadu` 25%（品阶 8，06 定义 8–9）；免：按 06 免疫规则（免疫中毒品阶 ≥ 8 可挡新感染） | 采集情花果（原著情花果多苦涩，待考）；断肠草生于左近（解药材料，06 `rx_yiduigongdu`） | 点燃 35% → 焦土（"焚尽情花"支线，原创扩展） | `qinghua`；tell"粉白花、细刺"；音 `bush` | 神雕 |
| `tr_sheku` | 进入与停留：`bf_shedu` 1 层 50%（T+1）；免：雄黄（10）、驭兽杂学 `effGrade ≥ T+1`、神龙教身份（敌我同理）；驭兽者"驱蛇噬敌"：格内敌方触发概率 ×1.5（原创扩展） | 蛇群遭遇（11）；采集蛇胆、蛇蜕（10）；神龙岛蛇窟暗道 | 燃烧后蛇群四散 3 tick（效果暂停） | `sheku`；tell"盘蛇、洞穴、嘶声"；音 `snake_hiss` | 鹿鼎（神龙岛）；射雕/神雕（白驼山驱蛇以召唤实现，09） |
| `tr_liubai` | — | 仅终局 | — | `liubai`；tell"宣纸留白、墨迹渐淡的页边"；音 `paper_wind` | 终局（13 `fin_j6`，原创扩展） |

---

## 4. 轻功：境界、动作与轻功武学

### 4.1 轻功值与境界判定

轻功值、跳跃、移动力的公式**全部引用 design/03**，本文不重定义：

```
qinggong = (Q_agi + Q_lv + Q_skill + Q_ap + Q_eq + Q_inner + Σflat − Q_load) × (1 + Σpct)     // 03 §4.5
qgTier(q) = 0 (q<20) | 1 (≥20) | 2 (≥50) | 3 (≥90) | 4 (≥140) | 5 (≥200)                    // 基准 §11、03 §4.4
jump = clamp(qgTier(qinggong) + Σflat_jump, 0, 6)      mov = 03 §4.4
```

本文在其上增加的判定规则：

| # | 规则 | 说明 |
|---|---|---|
| Q1 | **探索门禁**判 `qgTier(qinggong)`，含临时加值（丹药、`bf_shenqing`） | 03 §4.4、§11.5-5；临时加值是合法钥匙 |
| Q2 | **战斗距离类**（上跃高差、跨沟宽、攀峭壁高差、安全下跳）用 `jump`（含 flat） | `jump` 的 flat 只在战斗中生效（03 §4.4） |
| Q3 | **战斗资格类**（能否踏水、上树梢、攀峭壁、踏雪无痕、不触发陷阱、滑翔、一苇渡江）用 `qgTier` | 资格是"会不会"，距离是"能多远" |
| Q4 | **情境轻功**：某动作 `a` 的资格与折扣按 `qgAction(a) = qinggong + Σ actionBonus[a]` 判定 | `actionBonus` 来自装配轻功武学特技与少数物品（§4.5），合计 ≤ +40，不计入 06 `fam_move` 上限 |
| Q5 | **封轻功** `bf_fengqinggong`：`qinggong`、`jump` 视为 0（06），即 qg0 | 不能过轻功门禁；战斗中已在水面/树梢者立即按落水/坠落处理 |
| Q6 | **疲惫**（`sta = 0`）：体力回到 20% `staMax` 前不能疾行、纵跃（03 §5.3）；`bf_pibei` 存续期间（至 50%，06 §8.10）不能通过轻功门禁 | 两个阈值并存：前者是动作、后者是门禁（登记 §12 D-02） |
| Q7 | **伤病**：`bf_gushang` 不能跃上 ≥ 2 级、不能过 qg2 以上门禁；`bf_neishang` 战斗外每 5 层轻功值 −10（06） | 轻功门禁因此与医疗、休息联动 |
| Q8 | **负重**：`Q_load`（03，重甲 10、玄铁重剑类 15）直接降低轻功值；另使薄冰裂纹一次 +2（§3.3） | 杨过负玄铁重剑的取舍（原创扩展解读） |

### 4.2 各阶能力总表

#### 4.2.1 境界 × 能力

| 境界 | 阈值 | 战斗 `jump` 基础 | 上跃 | 跨沟 | 安全下跳 | 攀峭壁 | 踏水（深水连续格） | 树梢 | 飞檐走壁 | 雪沙冰沼 / 陷阱 | 滑翔 | 大江 / 云海 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| qg0 不入门 | < 20 | 0 | 0（**攀低坎**：`Δh = 1`，+2 移动点、+4 体力，不可上屋墙树崖） | 0 | 2 | × | × | × | × | 减速 / 触发 | × | × |
| qg1 登堂 | ≥ 20 | 1 | 1 | 1 | 3 | × | × | × | × | 减速 / 触发 | × | × |
| qg2 飞檐 | ≥ 50 | 2 | 2（屋檐、矮墙） | 2 | 4 | × | × | × | **飞檐**：可站立、行走于屋面、墙头、房梁、桅杆 | 减速 / 触发 | × | × |
| qg3 踏水 | ≥ 90 | 3 | 3 | 3 | 5 | ≤ 3 级 | ≤ 3 格；浅水移动 1 | ✓ | **借壁**：跃上墙、屋、峭壁类目标时高度 +1 | 减速 / 触发 | × | × |
| qg4 踏雪 | ≥ 140 | 4 | 4 | 4 | 6 | ≤ 4 级 | ≤ 6 格；急流可踏 | ✓ | 同上 | **无减速、无足迹 / 不触发** | 每下降 2 级可平移 1 格，至多 2 格 | × |
| qg5 凌虚 | ≥ 200 | 5 | 5 | 5 | 7 | ≤ 5 级 | 不限 | ✓ | 同上 | 同上 | 至多 3 格 | ✓ 一苇渡江 / 云海栈道 |

> 战斗中"上跃 / 跨沟 / 攀峭壁 / 安全下跳"四列实际取 `jump` 与 `2 + jump`（Q2），表中为 `Σflat_jump = 0` 时的值；探索中取 `qgTier` 与 `2 + qgTier`。攀峭壁在战斗中另需 `qgTier ≥ 3`（Q3）。
> **飞檐走壁**分两步解锁：qg2"飞檐"（立足屋墙）、qg3"借壁"（蹬墙增高）。**凌空**是五阶"凌虚"的统称表现：滑翔平移 3 格、一苇渡江、云海栈道三者合一，不另设规则。

#### 4.2.2 派生量速查

| 量 | 公式 | 说明 |
|---|---|---|
| 上跃上限 | 战斗 `jump`（借壁 +1）；探索 `qgTier`（借壁 +1，需 qg3） | 室内另受 `ceiling − 1` 限制 |
| 跨沟宽 `w` | `w ≤ jump`（战斗）/ `w ≤ qgTier`（探索） | 落点高差：上 ≤ 上跃上限 − 0（跨沟与上跃不叠加折算：`w + Δh_up ≤ jump + 1`） |
| 安全下跳 `safeDrop` | `2 + jump`（战斗，主动）；`1 + jump`（被击退，失足）；`2 + qgTier`（探索） | §5.2 |
| 主动下跳上限 | `safeDrop + 3` | 超过则 UI 禁止主动跳下 |
| 攀峭壁 `climbMax` | `qgTier ≥ 3` 时：战斗 `jump`、探索 `qgTier`；否则 0 | 瀑布水幕 `climbMax − 1`；雨中 −1 |
| 踏水连续格 `maxRun` | qg3 3 / qg4 6 / qg5 ∞ | 一次移动内经过的深水格数；落脚点（浅水、冰、沙洲、船、陆地）清零 |
| 滑翔平移 | `min(⌊Δh / 2⌋, 2 或 3)` | qg4 至多 2、qg5 至多 3 |

#### 4.2.3 水性 `swimLevel`（0–3）

水性不是轻功，但与水域门禁并列，放在此处定义（提案进入基准，§12 P-03）：

| 水性 | 获得 | 探索 | 战斗（落水时，`bf_luoshui`） |
|---|---|---|---|
| 0 | — | 不能主动入深水；落水后挣扎：每秒 −3 体力，自动漂向 3 格内岸边，漂不到则书灵救回（−10% `hpMax`，不致死） | 溺水：每回合 −4% `hpMax`（06 §11.4 系数）；`mov` 1，只能向岸移动；不能出招 |
| 1 | **主角默认**（现代人多会游泳；01 身份可改为 0 或 2）；水靠 +1（10） | 游水每格 1 体力，连续 ≤ 20 格 | `mov` 2；无溺水伤害；可用拳脚、短兵、内功招式 |
| 2 | 游水累计 300 格或拜渔家为师（12） | 游水不限距；潜水 ≤ 8 格 | `mov` 3；`attr:eva pct −10%`（代替 −20%） |
| 3 | 奇遇/天赋（原创扩展） | 可逆流游；潜水 ≤ 15 格；水下拾取 | `mov` 4；无闪避惩罚；`attr:parry pct −25%`（代替 −50%） |

- **闭气**：潜水格数 +`⌊主运内功 effGrade / 3⌋`（内功深厚者闭气更久，原创扩展）。超出 → 每多 1 格 −5% `hpMax` 并强制上浮。
- 书界原生 NPC 的水性由 chapters 指定（渔家、水寨、海盗为 2–3）。

### 4.3 动作规格

| 动作 | ID | 场合 | 资格 | 距离 / 高度 | 战斗移动点 | 体力（探索＝战斗） | 失败 / 中断 |
|---|---|---|---|---|---|---|---|
| 疾行 | `sprint` | 探索 | — | 速度 ×1.6 | — | 2/秒 | 疲惫后不可 |
| 攀低坎 | `scramble` | 通用 | qg0 起 | `Δh = 1` | +2 | 4 | 一次移动至多 1 次 |
| 纵跃 | `leap` | 通用 | qg1 起 | 上跃 ≤ 上限；跨沟 ≤ `w` | 经过格数 + `⌈Δh_up / 2⌉` | `4 × (Δh_up + w)` | 体力不足则不可选 |
| 借壁 | `wallkick` | 通用 | qg3 | 上跃 +1（目标为墙、屋、峭壁） | 同纵跃 | 纵跃 +4 | — |
| 下跳 | `drop` | 通用 | — | ≤ `safeDrop` 无伤；≤ `safeDrop + 3` 有伤（§5.3） | 1 | 0 | — |
| 攀峭壁 | `climb` | 通用 | qg3 | `Δh ≤ climbMax` | `1 + Δh` | 每级 5 | 探索：体力 0 → 滑落至上一落脚点，−3% `hpMax` |
| 飞檐 | `roofwalk` | 通用 | qg2 | 屋面、墙头、房梁、桅杆 | 1/格 | 0 | — |
| 踏水 | `waterwalk` | 通用 | qg3 | 连续 ≤ `maxRun` | 1/格 | 每格 4；回合末停在水面"踩水"：qg3 6 / qg4 4 / qg5 2 | 付不起踩水 → 落水 |
| 踏急流 | `rapidswalk` | 通用 | qg4 | 同上 | 1/格 | 每格 6 | 同上，并被冲 2 格 |
| 一苇渡江 | `bigwaterwalk` | 通用 | qg5 | 不限 | 1/格 | 每格 3 | 探索：体力 0 → 落水，水性 ≥ 2 可游至沙洲，否则书灵救回起点 |
| 树梢 | `treetop` | 通用 | qg3 | 梢间 | 1/格 | 每格 2 | 被封轻功/体力 0 → 落地 3 级 |
| 踏雪无痕 | `trackless` | 被动 | qg4 | 雪沙冰沼移动 1、无足迹、不触发机关 | — | 0 | — |
| 滑翔 | `glide` | 通用 | qg4 | 下跳时平移 ≤ 2（qg5 3） | 1/格 | 每格 2 | — |
| 云海栈道 | `cloudwalk` | 探索为主 | qg5 | 栈道 + 缺口 | 1/格 | 每格 3 + 跨缺口 `4w` | 书灵拉回起点（体力 0 + `bf_pibei`） |
| 带人 | `carry` | 探索 | 队友 `qgTier ≥ 门禁阶 + 1`，门禁 ≤ qg4 | 同门禁 | — | 由队友承担（不计主角体力） | 每次休息周期可用 `min(3, 1 + ⌊(队友 qinggong − 门禁阶+1 的阈值) / 30⌋)` 次 |
| 游水 | `swim` | 通用 | 水性 ≥ 1 | 见 §4.2.3 | 2/格（深水） | 每格 1 | 体力 0 → 漂向岸边 / 书灵救回 |
| 潜水 | `dive` | 探索 | 水性 ≥ 2 | 闭气格数 | — | 每格 2 | 超格数 → 伤害并上浮 |
| 挤过窄隙 | `squeeze` | 探索 | 轻功武学特技 `squeeze`（蛇行狸翻）或缩骨类杂学（原创扩展） | 宽 < 1 格的石隙 | — | 5 | — |

**熟练折扣**（03 §5.3，全部带阈值的动作适用，疾行的阈值视为 0）：

```
cost' = cost × max(0.5, 1 − (qgAction(a) − 该动作资格阈值) / 200)
```

| 例 | qgAction | 阈值 | 折扣 | 结果 |
|---|---|---|---|---|
| 踏水 3 格（qg3 刚过线） | 95 | 90 | 0.975 | 12 → 11.7 |
| 踏水 3 格（倚天末专精） | 205 | 90 | 0.5（封底） | 12 → 6 |
| 攀峭壁 5 级（qg5 刚过线） | 202 | 90 | 0.44 → 0.5 | 25 → 12.5 |
| 一苇渡江 40 格 | 200 | 200 | 1.0 | 120（03 §5.3 例：STD Lv60 体力上限 163 可一次渡过） |

### 4.4 体力经济与关卡体力预算

体力上限、恢复与疲惫的公式归 03 §5.3（`staMax = 100 + 0.5·con + 0.5·Ld`，STD Lv1 126 / Lv35 147 / Lv70 170；探索中 2 秒未消耗后每秒回 `staMax × 4%`；战斗中每次自身行动开始 +10）。本文补充**关卡体力预算**，保证门禁"考验境界也考验续航"但不苛刻：

| 规则 | 值 | 说明 |
|---|---|---|
| B1 单段门禁体力 | 无折扣消耗 ≤ STD `staMax(该区域等级)` × 70% | 刚达境界的玩家满体力可一次通过，留 30% 余量 |
| B2 长距离水面 | 每 ≤ 40 格设一落脚点（沙洲、礁石、渔舟）；大江超过 55 格必须有中途落脚点（03 §5.3） | 一苇渡江每格 3 |
| B3 高崖 | 每段 ≤ `climbMax` 级，段间落脚点可停下回体力；总高 ≤ 30 级 | 攀峭壁每级 5 |
| B4 战斗中的轻功动作 | 同表消耗；战斗开场体力 = 探索中的当前值 | 进门禁前打一场硬仗会影响战斗中踏水/攀崖 |
| B5 雪原、大漠 | 地图上每 60–90 秒步行距离设一处可休息点（山洞、驿站、帐篷，11） | 配合 `bf_shouhan`、酷热 |
| B6 书灵兜底 | 任何"体力耗尽即坠亡/溺亡"的结果都改为"书灵救回上一安全点"（§6.6 AF5） | 不致死 |

**例**：倚天·冰火岛近海一段 36 格无落脚点的海面（低于 B2 的 40 格上限）；主角 Lv65、`qinggong` 205（qg5，折扣 `1 − 5/200 = 0.975`）：`36 × 3 × 0.975 ≈ 105` 体力；STD Lv65 `staMax` 166 → 剩 61，满足 B1（105 ≤ 116）。

### 4.5 轻功武学的数据扩展（`movement` 字段）

轻功武学沿用 05 的 `SkillDef`（`category: movement`），对 `qinggong` 的贡献由 03 §4.5 的 `QS(g) × (0.40 + 0.06 × layer_eff)` 决定（10 重时等于 `QS`）。本文在 `SkillDef` 上增加可选块 `movement`，承载"情境加成"与"特技"：

| 字段 | 类型 | 说明 | 例 |
|---|---|---|---|
| `actionBonus` | `{actionId: [v@unlock, v@10]}` | 情境轻功加成（Q4），随层线性插值；同一动作多来源相加，合计 ≤ +40 | 水上漂 `{waterwalk: [10, 30], rapidswalk: [10, 30]}` |
| `staMul` | `{actionId: mul}` | 该动作体力倍率（0.5–1.0） | 神行百变 `{sprint: 0.6}` |
| `speedMul` | `{sprint: mul}` | 探索疾行速度倍率（≤ 1.3） | 神行百变 1.3 |
| `moveCostByTag` | `{tag: delta}` | 战斗中对带某标签地形的移动点修正（最低 1） | 草上飞 `{veg: −1}` |
| `specials` | enum[] | 特技开关（解锁层见 `layers`）：`squeeze` 挤过窄隙、`glideEarly` qg3 起可滑翔、`wallkickEarly` qg2 起可借壁、`noThorn` 荆棘不流血、`trackless` 永不留足迹、`threeSkim` 三抄水（qg2 可踏水 ≤ 3 格，每次移动 1 次，起止须为陆地）、`shallowFree` 浅水移动 1 | 蛇行狸翻 `[squeeze, noThorn]` |
| `battle` | 05 `moves` / `passives` | 战斗中的招式与被动（Buff 引用 06） | 梯云纵"纵云梯" |

**约束**：
1. `actionBonus` 与 `specials` 属于**钥匙**：本书界原生轻功的特技若能绕过某门禁（如燕子三抄水之于短水面），该门禁在 §6.5 预算中按"被绕过后的境界"计。
2. 特技不改变 `qgTier` 本身，只影响对应动作（UI 显示为"踏水 · 境界三（水上漂 +30）"）。
3. 装配轻功只有 1 栏（基准 §20），特技随换装即时生效/失效；战斗中不可更换。

### 4.6 轻功武学目录（建议定级，catalog 定稿）

> 基准 §13 只锁定两门天阶轻功（凌波微步 天中、神行百变 天下）。其余为本文建议，交 `design/catalog/` 定稿；定级服从 03 待决 D-03"各书界最高原生轻功品阶"。`QS` 取 03 §4.5 表。

| ID | 名称 | 品阶 | 门派/传承 | 原生书界 | `QS`（10 重 `Q_skill`） | 战斗能力 | 探索特技 / 情境加成 | 出处标注 |
|---|---|---|---|---|---|---|---|---|
| `sk_lingbo` | 凌波微步 | 天中 11 | 逍遥派 | 天龙 | 152 | 常驻 `bf_canying` 残影（06，天阶 3 层）；`mov +1`；**步法生息**：战斗中每移动 1 格回复 `mpMax × 0.5%`（每回合 ≤ 3%） | 疾行体力 ×0.7；`leap +10` | 段誉于无量山琅嬛福地所得（原著）；"以步法行内息"的数值化为原创扩展 |
| `sk_shenxing` | 神行百变 | 天下 10 | 铁剑门 | 碧血、鹿鼎 | 136 | 招式"遁"→ `bf_dunzou`（06）；常驻 `bf_xianji`（06 已列来源） | 疾行速度 ×1.3、体力 ×0.6；`leap +20` | 木桑道人（碧血）、九难传韦小宝（鹿鼎）；鹿鼎"只学逃命"版本可设 `layerCap 5`（原著梗概，细节待考） |
| `sk_shuishangpiao` | 水上漂 | 地上 9 | 铁掌帮 | 射雕 | 120 | 踏水、踩水体力 ×0.5；水面上 `attr:eva pct +5%` | `waterwalk +30`、`rapidswalk +30`（`qinggong` 110 即可踏急流） | 裘千仞绰号"铁掌水上漂"（原著）；武功名为原创定名 |
| `sk_gumuqinggong` | 古墓轻功（名称占位） | 地上 9 | 古墓派 | 神雕 | 120 | 招式"游身"→ `bf_youshi` 游势（06：古墓派轻灵身法） | 树梢移动体力 ×0.5；`treetop +20`、`leap +10` | 原著极言古墓派轻功之妙；名称原创占位，catalog 定名 |
| `sk_tiyunzong` | 梯云纵 | 地上 9 | 武当派 | 倚天 | 120 | 招式"纵云梯"：自身 `bf_shenqing` + `bf_tengyue` 2 回合（06 已列梯云纵为身轻如燕来源）；`wallkickEarly` | 攀峭壁体力 ×0.7；`leap +30`、`climb +20` | 武当轻功（原著）；定级原创扩展 |
| `sk_yiweidujiang` | 一苇渡江 | 地中 8 | 少林派 | 天龙、倚天、笑傲、侠客、鹿鼎 | 104 | 水面上免除 `parry` 惩罚 | `bigwaterwalk +40`、`waterwalk +20`；一苇渡江体力 ×0.7 | 名出达摩渡江传说；作为少林轻功为原创扩展 |
| `sk_taxuewuhen` | 踏雪无痕 | 地中 8 | 雪山派（及天山、辽东流传） | 侠客、书剑、飞狐、雪山 | 104 | 雪、冰、沙、沼上移动 1；`attr:resCold pp +10` | `trackless +40`（`qinggong` 100 即享四阶"踏雪"效果，仅限雪沙冰沼）；`trackless` 永不留足迹 | 武侠通称；归属雪山派为原创扩展 |
| `sk_yanzisanchaoshui` | 燕子三抄水 | 地下 7 | 江湖秘传（姑苏慕容亦擅，原创归属） | 天龙、连城、白马、书剑 | 92 | 水面上 `attr:eva pct +5%` | `threeSkim`（qg2 可踏水 ≤ 3 格）；`waterwalk +15` | 武侠通称；定级原创扩展 |
| `sk_jinyangong` | 金雁功 | 玄上 6 | 全真教 | 射雕、神雕 | 74 | `safeDrop +1` | `glideEarly`（qg3 起可滑翔）；`leap +20` | 全真派轻功名（原著，施展者与回目待考） |
| `sk_shexinglifan` | 蛇行狸翻 | 玄上 6 | 九阴真经 | 射雕、神雕、倚天 | 74 | 受 `projectile`/`ranged` 攻击时 `attr:eva pct +10%`；被击退距离 −1 | `squeeze`、`noThorn`；可匍匐过顶高 1 的矮洞 | 九阴真经所载身法（原著，施展者与回目待考） |
| `sk_luoxuanjiuying` | 螺旋九影 | 玄上 6 | 九阴真经 | 倚天 | 74 | 本回合移动 ≥ 3 格后的首次攻击视为背击（06 `modJudge asBack`） | `leap +15` | 九阴真经所载身法（倚天中施展者待考） |
| `sk_wanliduxing` | 万里独行 | 玄上 6 | 田伯光 | 笑傲 | 74 | `mov +1`；撤退成功率 +30%（09） | 疾行速度 ×1.3、体力 ×0.7 | 田伯光绰号"万里独行"（原著）；武功名为原创定名 |
| `sk_dengpingdushui` | 登萍渡水 | 玄上 6 | 江湖通行 | 全部书界 | 74 | `shallowFree` | `waterwalk +15` | 武侠通称；定级原创扩展（鸳鸯最高原生） |
| `sk_babuganchan` | 八步赶蟾 | 玄下 4 | 江湖通行 | 射雕、碧血、鸳鸯 | 56 | 招式"赶蟾"→ `bf_tengyue` 2 回合（06 已列来源，写作"八步赶蝉"，建议统一为"蟾"） | `leap +10` | 武侠通称；鸳鸯刀盖一鸣的长串绰号中有此名（待考），作彩蛋 |
| `sk_caoshangfei` | 草上飞 | 黄中 2 | 江湖通行 | 全部书界 | 38 | 植被格移动 −1（最低 1） | 疾行体力 ×0.8；草地不留足迹 | 武侠通称（原创扩展）；**各书界开局基础轻功**（§4.7） |

**数量核对**：05 §14.3 规划轻功 37 门（天 2 / 地 5 / 玄 12 / 黄 18）。本表地阶 6 门（地上 3：射雕/神雕/倚天各一门以满足 D-03；地中 2；地下 1：连城、白马的最高原生），比规划多 1 → 提案"地 6 / 玄 11"（§12 D-12）。其余 22 门（玄 5、黄 17）为各门派入门轻功，由 catalog 补足，建议每门只带 1 项特技或无特技。

### 4.7 各书界轻功获取节奏

**原则**：轻功不可携带（基准 §3）→ 每书界重新获得；残篇忆起加速 ×2（02 §5.3）；天阶轻功残篇另有"天级余韵"轻功值 +2（02 §5.5，上限 +10）。

| # | 书界 | 开局基础轻功（主线第 1 幕内，≤ 60 分钟可得） | 中期轻功（主线 ~40%） | 本书界最高原生（D-03） | 普通 / 专精书界末境界（03 §4.5.2） |
|---|---|---|---|---|---|
| 1 | 天龙 | 草上飞（大理城武馆）；序章越女剑已教 qg1 | 登萍渡水；燕子三抄水（姑苏支线）；一苇渡江（少林） | 凌波微步（琅嬛福地） | qg3 / qg4（见 §12 D-01：凌波受 `gateCap` 8 重，qg5 需再 +12 临时加值） |
| 2 | 射雕 | 草上飞（忆起）；八步赶蟾 | 金雁功（全真）；蛇行狸翻（九阴） | 水上漂（铁掌帮，需潜入或交换，原创扩展） | qg4 / qg4 |
| 3 | 神雕 | 草上飞（忆起）、登萍渡水 | 金雁功；蛇行狸翻 | 古墓轻功 | qg4 / qg4（qg5 需临时加值） |
| 4 | 倚天 | 草上飞 | 一苇渡江（少林）；螺旋九影 | 梯云纵（武当） | qg4 / qg5（10 D-01 修正后约 200.3，余量极小，临时加值稳达） |
| 5 | 笑傲 | 草上飞、登萍渡水 | 万里独行（田伯光线） | 一苇渡江 | qg4 / qg4 |
| 6 | 侠客 | 草上飞 | 登萍渡水 | 踏雪无痕（雪山派）、一苇渡江 | qg4 / qg4 |
| 7 | 碧血 | 草上飞 | 登萍渡水、八步赶蟾 | 神行百变（木桑道人） | qg4 / qg5（神行百变专精；10 D-01 指出无"天中鞋"，改用本书界地中鞋后约 200.5，余量 < 1） |
| 8 | 鹿鼎 | 草上飞（扬州） | 一苇渡江（少林） | 神行百变（九难） | qg3 / qg4 |
| 9 | 连城 | 草上飞 | 登萍渡水 | 燕子三抄水 | qg3 / qg4 |
| 10 | 白马 | 草上飞 | 登萍渡水 | 燕子三抄水 | qg3 / qg4 |
| 11 | 鸳鸯 | 草上飞 | 八步赶蟾（盖一鸣彩蛋） | 登萍渡水 | qg3 / qg3（qg4 需临时加值） |
| 12 | 书剑 | 草上飞 | 燕子三抄水 | 踏雪无痕（天山一脉，原创扩展） | qg4 / qg4 |
| 13 | 飞狐 | 草上飞 | 登萍渡水 | 踏雪无痕 | qg4 / qg4 |
| 14 | 雪山 | 草上飞 | 登萍渡水 | 踏雪无痕 | qg4 / qg4 |

> 天龙的琅嬛福地在原著中位于开篇。若 chapters/01 把凌波微步定为 02 §2.9 的"奇遇例外"（`earlyException`），专精玩家约在 Lv 12 前后即达 qg3（1–3 重即 `Q_skill` 70–88）。这是有意的奖励：**主线门禁仍按 qg2 排布**，只让 qg3 支线提前开放。

---

## 5. 高度规则

### 5.1 尺度与表现

- 每格高度 `h` ∈ 0–10（基准 §8），1 级 ≈ 1.5 m（§1.3）。单位的"位置高度"= 所站格 `h`（树梢、房梁、桅杆为该格登记的高度）。
- 超过 10 级的山体（华山、黑木崖、玉笔峰）拆为多张分段地图，段间以 `QinggongGate`（`kind: climb`，§6.3）或机关（吊篮）连接；战斗只在单张地图内发生。
- 渲染可压缩竖向比例（建议 0.6–0.8，tech/02 定），但**高度数字、落差数字**在高亮模式下必须可见（14 定样式）。

### 5.2 纵跃、攀爬与下跳

| # | 规则 |
|---|---|
| H1 | **上行**：相邻格高差 `Δh = 1` → 纵跃（qg1+）或攀低坎（qg0，+2 移动点）；`Δh ≥ 2` → 纵跃 `Δh ≤ 上跃上限`（§4.2.2）。坡/阶沿坡向移动不受限（03 §4.4）。 |
| H2 | **峭壁**：进入 `tr_qiaobi` 格且 `Δh ≥ 3` 时必须"攀"：需 `qgTier ≥ 3` 且 `Δh ≤ climbMax`；`Δh ≤ 2` 按 H1。瀑布水幕、雨中峭壁 `climbMax − 1`。 |
| H3 | **借壁**（qg3+）：目标格为墙、屋、城墙、宫殿屋脊或峭壁时，上跃上限 +1。 |
| H4 | **跨沟**：直线越过 `w` 个不可站立格（虚空、深水对无踏水资格者、荆棘不算）落到第 `w + 1` 格；`w ≤ jump`（探索 `qgTier`），且 `w + Δh_up ≤ jump + 1`；中途不可转向。 |
| H5 | **下行**：`Δh ≤ safeDrop` 无伤；`safeDrop < Δh ≤ safeDrop + 3` 可主动跳下并受坠落伤害（§5.3，UI 以红色显示预估伤害）；更深的落差不可主动跳下，只能被击退或失足坠落。 |
| H6 | **室内**：纵跃最高点不得超过 `ceiling − 1`；房梁格（`beam`）视为 `h + 2` 的可站格，需 qg2。 |
| H7 | **落点被占**：纵跃/跨沟的落点必须为空；击退的落点被占 → 撞击（05 §4.5），不坠落。 |
| H8 | **封轻功**：`jump = 0`、`qgTier = 0`，只剩攀低坎与 `safeDrop = 2`；在树梢、水面上被封 → 立即坠落/落水。 |

### 5.3 坠落伤害

```
safeDrop' = 2 + jump            // 主动跳下
          = 1 + jump            // 被击退、失足、滑出檐口、桥塌（来不及提气）
excess    = Δh − safeDrop'      // ≤ 0 无伤
fallPct   = min(0.40, 0.03 + 0.05 × excess)
fallDmg   = ⌊ hpMax × fallPct × landMul × qgMul × pctFactor ⌋
  landMul  ：落点地形（§2.2）水 0.3、深雪 0.5、植被 0.8、碎石 1.2、机关尖刺 1.5，其余 1.0
  qgMul    = max(0.5, 1 − qinggong / 400)
  pctFactor：普通 1.00 / 精英 0.50 / Boss 0.25（沿用 06 §11.4 的 hpMax 比例型伤害系数）
结算：真实伤害（不经 Z0–Z10），护体真气先吸收（以真气护体卸去坠势），不触发反震、吸血
附带：excess ≥ 2 且落点非水 → bf_gushang，概率 min(60%, 15% × (excess − 1))，品阶 clamp(4, 12, 3 + excess)
      被击退且 excess ≥ 3 → bf_xuanyun 1 回合（受 06"坚毅"约束）
```

| `excess` | 1 | 2 | 3 | 4 | 5 | 6 | 7 | ≥ 8 |
|---|---|---|---|---|---|---|---|---|
| `fallPct` | 8% | 13% | 18% | 23% | 28% | 33% | 38% | 40% |
| 骨伤概率 | 0 | 15% | 30% | 45% | 60% | 60% | 60% | 60% |

**例**：神雕·Lv40 敌人（`hpMax` 约 6,000，`qinggong` 100，qg3，`jump` 3）站在悬崖边，被击退落下 9 级到碎石：`safeDrop' = 1 + 3 = 4`，`excess = 5`，`fallPct = 28%`，× `landMul` 1.2 × `qgMul` 0.75 = 25.2% → **1,512 点**；骨伤概率 60%（品阶 8）；眩晕 1 回合。若他是精英，伤害 ×0.5 = 756。

### 5.4 坠崖（虚空格）与坠崖奇遇

单位进入虚空格（被击退、桥塌、失足）即**坠崖**，离开战场：

| 单位 | 结果 |
|---|---|
| 普通敌人 | 视为击败（计击杀、气势与经验）；其掉落中的非任务物品 50% 随之遗失（原创扩展） |
| 精英 | 视为击败，经验与掉落 ×0.5 |
| Boss | **免疫坠崖**：被推至边缘即停下，改受撞击（05/06）；剧情可配"坠崖遁走"脚本（原著多有坠崖未死者，如萧远山雁门关坠崖） |
| 我方队友 | 离场、不算死亡；战后归队，`hp` 30% 并带 `bf_gushang`（品阶 = 区域 T） |
| 主角 | 同队友；其余队友继续作战；我方全员离场或倒地 → 按 09 的失败规则。若该虚空格配有 `fallTarget` → 战后转场至谷底区域（坠崖奇遇） |

**坠崖奇遇**（原创扩展系统，致敬原著母题：段誉坠崖得入琅嬛福地；张无忌坠崖入昆仑幽谷得九阳真经；杨过跃下断肠崖后与小龙女重逢）：

| 规则 | 值 |
|---|---|
| 数量 | 每书界至多 2 处；须在 chapters 文档登记 |
| 触发 | 首次坠入该虚空格（战斗或探索）；此后同一格按普通坠崖/书灵救回 |
| 保底 | 谷底区域必须有出口（隧道、攀崖路线 ≤ 本书界主线上限境界，或剧情接引） |
| 伤害 | 坠崖奇遇不结算坠落伤害，改为剧情演出 + `hp` 50% |
| 探索中无 `fallTarget` 的坠崖 | 书灵救回上一安全点：−10% `hpMax`、消耗 1 时辰、不致死 |

### 5.5 高低差对命中、伤害、射程的修正（Z7 建议值，交 design/04）

`Δh = 攻方位置高度 − 守方位置高度`。

| 项 | 攻方较高（每级） | 攻方较低（每级） | 上限 | 备注 |
|---|---|---|---|---|
| 近身（`melee`，受 `hTol` 限制） | `Z7 +5%` | `Z7 −5%` | ±10% | `hTol` 默认 2（05 §4.1） |
| 远程（`ranged`/`projectile`） | `Z7 +4%` | `Z7 −4%` | +16% / −12% | 按 `|Δh| ≤ 4` 计 |
| 命中评级 | `hit +4` | `hit −4` | ±12 | 进入 04 的 `hit − eva` |
| 射程 | `Δh ≥ 2`：+1；`Δh ≥ 4`：+2 | — | +2 | 仅远程与投射 |
| 击退 | 向低处击退且第一格低 ≥ 1 级：距离 +1 | 向上 `Δh ≥ 2` 被阻挡 → 撞击（05） | — | |
| 招式钩子 | `heightBonusMult`（飞龙在天）放大"攻方较高"项；`noLowGroundPenalty`（鱼跃于渊）使"攻方较低"项为 0 | | | 05 §4.11 |

**Z7 合成建议**：`Z7 = (1 + 方位项) × (1 + 高差项) × (1 + 地形项)`；地形项 = 攻方所站格 `Z7.dealt` + 守方所站格 `Z7.taken` + 守方遮蔽 `cover.dmg`，钳制 [−30%, +30%]。方位项（背击/侧击）归 04。

### 5.6 视线与遮挡（算法，交 tech/05 实现）

与 05 §4.4 一致：`melee` 只看 `|Δh| ≤ hTol`；`projectile` 被单位与遮挡阻断；`ranged`（气劲）越过单位但被墙体（等效 `Δh ≥ 3`）阻断；`sonic` 无视一切遮挡。

```ts
// 视线高度取"眼高"：所站格 h + 1。格序列为 A→T 连线经过的超覆盖格（supercover），不含两端。
function lineOfSight(A: Unit, T: Unit, delivery: Delivery): { ok: boolean; hitPenalty: number } {
  if (delivery === 'sonic') return { ok: true, hitPenalty: 0 };
  let partial = 0;
  for (const { cell, t } of supercover(A.pos, T.pos)) {          // t ∈ (0,1)：沿线参数
    const y = (A.h + 1) + ((T.h + 1) - (A.h + 1)) * t;           // 该处视线高度
    if (cell.los === 'full') return { ok: false, hitPenalty: 0 };  // 石壁、水幕、石阵内
    if (cell.h - y >= 2) return { ok: false, hitPenalty: 0 };      // 实体遮挡（平地上 3 级墙挡、2 级不挡）
    if (delivery === 'projectile' && cell.unit) return { ok: false, hitPenalty: 0 };
    if ((cell.los === 'partial' || cell.hasState('tst_yanwu', 'tst_duwu', 'tst_ranshao'))
        && cell.h + cell.canopy - y >= 0) partial++;               // 穿过冠层/烟雾
  }
  if (delivery === 'projectile' && partial >= 2) return { ok: false, hitPenalty: 0 };
  return { ok: true, hitPenalty: -10 * Math.min(partial, 2) };     // 命中评级修正（叠加 cover）
}
```

| 例 | 结果 |
|---|---|
| 平地上隔 3 级院墙放暗器 | 墙格 `3 − 1 = 2` → 阻断 |
| 城头（h 6）射城下（h 0）越过 3 级矮墙（中点） | 中点视线高 `7 + (1 − 7) × 0.5 = 4`，`3 − 4 < 2` → 可见 |
| 隔 1 格竹林射暗器 | 冠层计 1 → 命中 −10 |
| 隔 2 格竹林射暗器 | 阻断；改用剑气（`ranged`）则可打，命中 −20 |
| 树梢（h 3）对树梢 | 视线高 4，高于冠顶 3 → 不计遮挡 |

**可见性**（战场迷雾与选目标）：目标在视野半径内（§5.7）且 `lineOfSight` 成立、`partial ≤ 1` → 可见。不可见的单位不能被单体招式与暗器选中（范围招式照常命中格子）；06 的 `bf_yinshen`、`bf_tingfeng` 在此之上生效。

### 5.7 视野

| 情形 | 视野半径（格） | 说明 |
|---|---|---|
| 白昼 | 12 | 20×20 战场基本全开 |
| 黎明、黄昏 | 9 | |
| 夜晚（月明） | 6 | 时辰与月相归 11 |
| 夜晚（无月、阴雨） | 4 | |
| 暗处（洞窟、墓室、冰窟、无灯室内） | 3 | `dark` 标签 |
| 持火把/灯笼 | 夜间与暗处 +3（至多 8） | 代价：自身在 12 格内对敌方可见，潜行失效 |
| 雾、云海栈道 | 4 | |
| 沙暴、暴雪 | 3 | |
| 石阵内未看破 | 2 | §3.6 |
| 眺望点（悬崖边、树梢、塔顶） | 探索中 ×1.5（揭示地图，11） | |

---

## 6. 探索门禁

### 6.1 门禁类型全集

| `kind` | 名称 | 条件 | 典型用法 | 常见替代解 | 关联 |
|---|---|---|---|---|---|
| `qg` | 轻功 | `{qg: n, action?}` | 屋顶捷径、崖上秘境、水上小岛、树梢通道 | 临时轻功加值（`bf_shenqing`、轻身丹）、飞爪、队友带人、船、季节冰封 | 本文 §4 |
| `key` | 钥匙/物品 | `{item, consume?}` | 牢门、密室、宝箱、地图 | 开锁（`formation ≥ T(g)`）、击败守卫取钥匙 | 10 |
| `fame` | 声望 | `{fame ≥ n}`（03 §8.4 阈值） | 名家闭门、英雄大会 | 引荐信（任务） | 03、12 |
| `morality` | 品德 | `{morality: [min, max]}` | 正派禁地、邪派总坛 | 易容 | 03 §8.3 |
| `sect` | 门派身份 | `{sect, rank?}` | 藏经阁、后山禁地 | 潜入、易容 | 12 |
| `status` | 官身/令牌/特殊身份 | `{status}` | 皇宫、官府、神龙教、红花会 | 易容、贿赂（口才/银两） | 12、chapters |
| `time` | 时辰/日期/节令/天气/季节 | `{shichen, day, festival, weather, season}` | 夜探、潮汐、腊八、冬季冰封 | 等待（11 提供"歇息至"） | 11 |
| `quest` | 任务/幕进度 | `{quest, state}` / `{act ≥ n}` | 主线封锁 | — | 12、chapters |
| `formation` | 奇门遁甲 | `{formation ≥ T(g)}`（03 §8.1） | 桃花岛、石阵、暗门 | 向导 NPC、阵图、击毁阵眼 | 03 §8.2 |
| `check` | 技艺检定 | `{skill: music/chess/art/speech/med/poi/antidote/forge, dc}` | 梅庄四友、珍珑棋局、书生谜题 | 另一技艺路线、物品、银两 | 03 §8 |
| `swim` | 水性 | `{swim ≥ n, dive?: cells}` | 水下通道、湖底 | 踏水（qg3+）、船、闭气丹（10） | 本文 §4.2.3 |
| `beast` | 驭兽 | `{beast ≥ g, kind}` 或物品 | 蛇窟、狼群、蜂群、猛禽巢 | 雄黄（蛇）、火把（狼）、玉蜂浆（蜂）、战斗驱赶 | 05 杂学 `beast`、10 |
| `mount` | 坐骑 | `{mount: horse/camel}` | 大漠深处、草原长途 | qg4（沙地无减速）+ 水囊补给 | 11 |
| `boat` | 船 | `{boat: small/sea}` 或渡口 | 太湖、海岛、大江 | qg5 一苇渡江、冬季冰封（湖面） | 11 |
| `light` | 照明 | `{light: true}` | 暗洞、墓室 | 夜明珠、火折子 | §5.7 |
| `squeeze` | 窄隙 | `{special: squeeze}` | 昆仑幽谷石隧（原著：张无忌钻入，朱长龄卡住） | 缩骨类杂学（原创扩展） | §4.5 |
| `device` | 机关装置 | `{device, operator?}` | 吊篮、断龙石、石门、吊桥 | 力量/内力检定、NPC 操作、qg 绕行 | chapters |
| `strength` | 膂力/内力检定 | `{str ≥ n}` 或 `{mpMax ≥ k × MPREF(Ld)}` | 推巨石、抬千斤闸、推石门 | 多人合力（队友 `str` 之和 × 0.6） | 03 |

### 6.2 门禁表达式 `GateExpr`

```
GateExpr := Atom | { all: GateExpr[] } | { any: GateExpr[] } | { not: GateExpr }
Atom     := { qg: 1..5, action?: ActionId, height?: n, width?: n, run?: n, stages?: n }
          | { item } | { fame } | { morality } | { sect, rank? } | { status } | { time } | { quest, state } | { act }
          | { formation: g } | { check: { skill, dc } } | { swim, dive? } | { beast, kind } | { mount } | { boat }
          | { light } | { special } | { device } | { str } | { companion: { qgMin } } | { buff }
Gate     := { id, req: GateExpr, alt?: { expr: GateExpr, cost?: { time?, item?, noise?, sta? } }[], intent, hint }
通过条件  := eval(req) || any(eval(alt[i].expr))；通过时优先使用 req，其次按 alt 顺序并支付 cost
```

```yaml
# 射雕·铁掌峰中指峰顶（§9.2）
id: gate_02_zhongzhifeng
req: { qg: 3, action: climb, height: 9, stages: 3 }        # 三段各 3 级，段间落脚点
alt:
  - { expr: { item: it_feizhua }, cost: { item: 1, noise: 3, time: 1 } }      # 飞爪（10）
  - { expr: { companion: { qgMin: 4 } } }                                     # 队友带人
  - { expr: { quest: q_02_main_07, state: active }, cost: {} }                # 主线演出：被铁掌帮追兵逼上峰顶（一次性，原著梗概待考）
intent: main
earliest: 0.55                                                                # 射雕主线 qg3 门禁最早进度（§6.5.2）
hint: hint_gate_02_zhongzhifeng
```

### 6.3 `QinggongGate` 对象（对接 tech/01 §7.4 Tiled 对象层）

大多数轻功门禁由**刷好的地形与高度自然形成**（寻路自动判定）；只有以下情形需要放置 `QinggongGate` 对象：① 跨地图的竖向转场（高崖分段、塔楼分层）；② 长距离复合路线（多段攀崖、一苇渡江航道、云海栈道）；③ 声明门禁意图供校验（§6.7）。

| 属性 | 类型 | 说明 |
|---|---|---|
| `id` | string | `gate_<书界序号>_<拼音>`（提案前缀，§12 P-01） |
| `kind` | enum | `leap` `climb` `waterwalk` `rapids` `bigwater` `treetop` `gap` `cloud` `snow` `squeeze` `swim` `dive` `device` |
| `tier` | 1–5 | 轻功类 `kind` 的境界要求 |
| `from` / `to` | cell / `{region, cell}` | 起止；跨地图时 `to` 为另一 `rg_*` |
| `height` / `width` / `run` / `stages` | int | 几何量，用于体力预算校验（§4.4 B1–B3） |
| `oneWay` | bool | 单向（只能跳下）；必须在 `to` 一侧提供出口（§6.7 V-G3） |
| `alt` | GateExpr[] | 替代解 |
| `intent` | `main` / `side` / `secret` / `hidden` | 意图等级 |
| `earliest` | 0–1 | 主线进度下限（仅 `main`） |
| `reveal` | `always` / `near10` / `never` | 地图标记显示：主线与支线 `always`；秘境靠近 10 格显示；隐藏 `never` |
| `hint` | textKey | 书灵提示文本 |

其余对象（`Chest`、`NpcSpawn`、`Trigger`）可带 `gateIntent: { requires: {qg: n} | GateExpr }`，声明"应在该条件下才可到达"，由校验器比对。

### 6.4 门禁节奏原则（"每个书界轻功重新获得"下的设计）

| # | 原则 | 规则 |
|---|---|---|
| G1 | 主线上限 | 主线只用"普通玩家书界末境界 − 1"（03 §4.5.2 结论）：天龙 qg2；射雕、神雕、倚天 qg3；中武 qg3；低武 qg2 |
| G2 | 主线时机 | 境界 t 的主线门禁只能出现在"普通玩家预期达到 t 的主线进度 + 10%"之后（§6.5.2） |
| G3 | 支线上限 | = 普通玩家书界末境界：天龙 qg3；高武 qg4；中武 qg4；低武 qg3 |
| G4 | 隐藏上限 | = 专精境界：天龙 qg4（qg5 需临时加值）；射雕 qg4；神雕 qg4（qg5 需临时加值）；倚天 qg5；中武 qg4；碧血 qg5（神行百变专精，余量 < 1，稳妥需临时加值）；鹿鼎 qg4（神行百变，受 G5 的 5% 约束）；连城、白马、鸳鸯 qg3（连城、白马专精可达 qg4，但 G5 占比为 0，qg4 只作同一内容的捷径） |
| G5 | 高阶占比 | qg4 及以上门禁占本书界轻功门禁的比例 ≤ `max(0, (W − 40) × 0.5%)`（02 §2.10）。**例外**：天龙 ≤ 10%（首部从零起步，普通玩家书界末仅 qg3）；鹿鼎 ≤ 5%（神行百变例外，02 §7.1） |
| G6 | 替代解 | 主线轻功门禁 100% 有替代解；支线 ≥ 50%；隐藏不强制 |
| G7 | 回访动机 | 每个区域至少 1 个"本区域中后期才能打开"的门禁，入口门禁不高于主线上限 |
| G8 | 书眠规划的回报 | 每书界起始区域放 1–2 个 qg2 门禁：携带鞋子的玩家开局即 qg2（03 §4.5.2"开局·专精"），奖励为本书界早期实用物品 |
| G9 | 梯度 | 同一区域内相邻门禁境界差 ≤ 2（避免"近在咫尺、差三阶"） |
| G10 | 与其他门禁的比例 | 非轻功门禁数 ≥ 轻功门禁数 ×（高武 0.5 / 中武 0.8 / 低武 1.5）；低武强调口才、易容、技艺、船、时辰（02 §7.3 非战斗主线） |
| G11 | 主题一致 | 门禁地形与书界地理一致：雪山→雪冰；江南→水；大漠→沙；宫廷→屋脊与身份；海岛→船 |
| G12 | 双钥匙 | 放置天阶/地上武学的秘境至少 2 条路线：一条高阶轻功，一条技艺或任务 |

### 6.5 各书界门禁预算

#### 6.5.1 数量与分布【建议值，chapters 采用、±20% 浮动】

| # | 书界 | 区域 | 轻功门禁 | qg1 | qg2 | qg3 | qg4 | qg5 | qg4+ 占比（上限） | 主线 / 支线 / 隐藏上限 | 非轻功门禁（≥）与主题 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 天龙 | 9 | 45 | 12 | 17 | 12 | 3 | 1 | 8.9%（10%，G5 例外） | qg2 / qg3 / qg4（qg5 需加值） | 23：棋（珍珑）、船（太湖水道）、驭兽（闪电貂）、声望（聚贤庄）、门派（少林、丐帮） |
| 2 | 射雕 | 8 | 44 | 6 | 11 | 16 | 11 | 0 | 25%（25%） | qg3 / qg4 / qg4 | 22：奇门（桃花岛、归云庄）、技艺谜题（渔樵耕读）、膂力（耕者巨石）、船、坐骑（大漠） |
| 3 | 神雕 | 9 | 46 | 5 | 11 | 18 | 10 | 2 | 26%（28%） | qg3 / qg4 / qg4（qg5 需加值） | 23：水性（古墓地下水道）、驭兽（玉蜂、鳄鱼）、毒（情花）、机关（古墓）、攻城（襄阳） |
| 4 | 倚天 | 9 | 46 | 4 | 11 | 19 | 9 | 3 | 26%（27.5%） | qg3 / qg4 / qg5 | 23：船（冰火岛、灵蛇岛）、窄隙（昆仑）、内力（光明顶石门）、门派（武当、明教）、时辰（万安寺夜） |
| 5 | 笑傲 | 8 | 34 | 5 | 10 | 14 | 5 | 0 | 14.7%（17.5%） | qg3 / qg4 / qg4 | 28：技艺（梅庄琴棋书画）、身份（黑木崖令牌）、钥匙（地牢）、门派（五岳） |
| 6 | 侠客 | 7 | 30 | 5 | 9 | 12 | 4 | 0 | 13.3%（15%） | qg3 / qg4 / qg4 | 24：邀约（赏善罚恶令）、船、石壁参悟、门派（雪山派） |
| 7 | 碧血 | 7 | 30 | 5 | 10 | 12 | 2 | 1 | 10%（11%） | qg3 / qg4 / qg5 | 24：谜题（金蛇秘笈）、机关（铁盒）、潜行与身份（紫禁城）、攻城（北京） |
| 8 | 鹿鼎 | 7 | 20 | 6 | 9 | 4 | 1 | 0 | 5%（5%，G5 例外） | qg2 / qg3 / qg4 | 30：口才、身份（太监、侍卫腰牌）、易容、驭兽（神龙岛雄黄）、船、贿赂 |
| 9 | 连城 | 6 | 18 | 6 | 8 | 4 | 0 | 0 | 0% | qg2 / qg3 / qg3 | 27：谜题（唐诗剑谱）、钥匙（牢狱）、时辰（雪崩、开春）、医毒、口才 |
| 10 | 白马 | 6 | 16 | 6 | 7 | 3 | 0 | 0 | 0% | qg2 / qg3 / qg3 | 24：地图（高昌迷宫）、坐骑、照明、水源、人情（部落好感） |
| 11 | 鸳鸯 | 6 | 14 | 6 | 6 | 2 | 0 | 0 | 0% | qg2 / qg3 / qg3 | 21：时辰（喜宴）、口才、身份（镖局）、合击（剧情） |
| 12 | 书剑 | 8 | 32 | 6 | 10 | 14 | 2 | 0 | 6.3%（7.5%） | qg3 / qg4 / qg4 | 26：坐骑与骆驼（回疆）、时辰（海宁观潮）、身份（红花会）、驭兽（狼群）、谜题（玉峰） |
| 13 | 飞狐 | 7 | 30 | 6 | 10 | 12 | 2 | 0 | 6.7%（9%） | qg3 / qg4 / qg4 | 24：医毒（药王谷）、身份（掌门人大会）、时辰（雨夜商家堡） |
| 14 | 雪山 | 6 | 28 | 5 | 9 | 12 | 2 | 0 | 7.1%（10%） | qg3 / qg4 / qg4 | 23：机关（吊篮）、钥匙与地图（闯王宝藏）、回忆关卡（剧情） |

> 低武书界 qg4+ 门禁为 0（02 §7.1，鹿鼎例外 1 处）；连城、白马专精玩家的 qg4 只用于**同一内容的轻功捷径**（例：绕开一段口才任务），不单独锁内容。

#### 6.5.2 普通玩家预期境界时间表（G2 依据）【建议值，tools/balance 校验】

模型：书界开局值与书界末值取 03 §4.5.2（普通玩家、无携带鞋）；取得基础轻功后（主线 5%）按 `v(p) = 开局 + (末 − 开局) × (0.15 + 0.85p)` 增长；天龙按 03 §4.9 STD 逐级表。"主线最早进度" = 达到进度 + 10% 后向上取整到 5%。

| 书界 | 开局 → 末 | 达 qg1 | 达 qg2 | 达 qg3 | 达 qg4 | 主线门禁最早进度（qg1 / qg2 / qg3） |
|---|---|---|---|---|---|---|
| 天龙 | 9 → 116 | 6%（Lv3） | 41%（Lv15） | 90%（Lv32） | — | 20% / 55% / — |
| 射雕 | 28 → 146 | 开局 | 5% | 44% | 94% | 0 / 15% / 55% |
| 神雕 | 37 → 162 | 开局 | 5% | 32% | 79% | 0 / 15% / 45% |
| 倚天 | 44 → 185 | 开局 | 5% | 21% | 62% | 0 / 15% / 35% |
| 笑傲、侠客、碧血 | 45 → 144 | 开局 | 5% | 36% | 95% | 0 / 15% / 50% |
| 书剑 / 飞狐 / 雪山 | 45–49 → 145–148 | 开局 | 5% | 31%–36% | 90%–95% | 0 / 15% / 50% |
| 鹿鼎 | 41 → 114 | 开局 | 5% | 61% | — | 0 / 15% / — |
| 连城、白马 | 42 → 115–116 | 开局 | 5% | 59%–60% | — | 0 / 15% / — |
| 鸳鸯 | 43 → 109 | 开局 | 5% | 66% | — | 0 / 15% / — |

> 携带鞋子（+17.5 ~ +27.5）的玩家整体提前约 15%–25% 进度，这正是 G8"书眠规划回报"的来源。

### 6.6 反挫败设计

| # | 设计 | 规则 |
|---|---|---|
| AF1 | **基础轻功早得** | 每书界起始区域在主线第 1 幕内提供 ≥ 2 条习得黄中–玄下轻功的途径（武馆、门派入门、书灵引荐、奇遇）；前书界学过的轻功以残篇忆起 ×2 速度重修（02 §5.3） |
| AF2 | **开局无门禁空窗** | 玩家首次获得轻功之前，主线不出现任何轻功门禁（天龙：Lv3 前；其他书界开局已 ≥ qg1） |
| AF3 | **门禁可读** | 靠近门禁 6 格内显示图标与需求（"需 飞檐 · 二阶"），当前值不足时显示"尚差 N 点"；地图标"待解之处"；书灵手记自动收录并在境界提升时提醒"某处或可一试"（14 定样式） |
| AF4 | **替代钥匙** | 主线门禁 100% 有替代解（G6）；常备替代：轻身丹 `bf_shenqing`（第 2 幕起商店常备，品阶 = 区域 T，`qinggong +10×G`，探索持续 6 时辰，06）、飞爪、队友带人、渡船、向导 |
| AF5 | **失败不致死** | 踏水体力耗尽 → 落水、漂向岸边；攀崖失手 → 滑落至上一落脚点（−3% `hpMax`）；云海栈道失足 → 书灵拉回起点；流沙 → 拉回上一安全格。所有探索失败的最大代价：−10% `hpMax` + 1 时辰 |
| AF6 | **不锁死** | 单向下落与坠崖奇遇的落点必须有出口，出口境界 ≤ 本书界主线上限（§6.7 V-G3）；书灵"引路"可在战斗外随时回到最近营地/客栈（代价：时辰，11 定） |
| AF7 | **带人与引路** | 队友 `qgTier ≥ 门禁阶 + 1` 可带主角过 ≤ qg4 的门禁（§4.3）；奇门阵可请原著人物或向导带路（如桃花岛由黄蓉带路，原著梗概） |
| AF8 | **季节与时辰钥匙** | 冬季湖面冰封（§8.5）、退潮露出沙洲、夜间守卫换班——"等一等"也能过门 |
| AF9 | **多次失败提示** | 同一门禁尝试失败 3 次，书灵给出最近的替代解位置 |
| AF10 | **书眠推荐** | 02 §4.4 书灵推荐在下一书界门禁密集时建议携带高阶鞋（`Q_eq`），并说明理由 |
| AF11 | **临时加值计入** | 丹药/Buff 抬高的 `qinggong` 计入门禁判定（03 §11.5-5）；战斗中不能靠临时加值中途"凭空"获得踏水资格（施加时若身在水面按新值判定） |
| AF12 | **难度模式** | 低难度（13）：探索坠落伤害 ×0.5、门禁"尚差"≤ 10 点时书灵可耗 1 时辰"指点"直接通过（每书界 3 次） |

### 6.7 校验规则（对接 tech/01 §7.5 L6 可达性）

| # | 规则 | 级别 |
|---|---|---|
| V-G1 | 按 qg0→qg5 逐阶计算可达集 `R_t`（关闭替代解）；带 `gateIntent.requires = t` 的对象必须 ∈ `R_t` 且 ∉ `R_{t−1}`；∈ `R_{t−1}` 报"泄漏" | 警告 |
| V-G2 | 主线任务目标在"主线上限境界 + 该幕进度允许的境界（§6.5.2）"下可达；否则报错 | 错误 |
| V-G3 | 对每个 `R_t`：集合内任一格都能在 `R_t` 内走到安全点（入口、客栈、营地）；单向门禁的落点侧必须有出口 | 错误 |
| V-G4 | 各书界轻功门禁数按境界与 §6.5.1 预算比较（±20%）；qg4+ 占比 ≤ G5 上限 | 警告 / 占比超限为错误 |
| V-G5 | `intent: main` 的门禁 `alt` 非空 | 错误 |
| V-G6 | `QinggongGate` 几何满足体力预算 B1–B3（按区域等级的 STD `staMax`） | 警告 |
| V-G7 | 地形 `visual.tell` 非空；门禁地形对（深水/浅水、薄冰/冰面、流沙/沙地）的材质在色彩与纹理上可区分（tech/07 质检项） | 错误 |
| V-G8 | 同一区域相邻门禁境界差 ≤ 2（G9） | 警告 |

### 6.8 坐骑可骑行地形（供 design/10 §11.4、design/11）

10 以"道路、山道、平原、草原、沙地/沙漠"描述坐骑的可骑地形，本文给出其与地形 ID 的对应：

| 坐骑地形类（10 用语） | 包含的地形 | 骑行探速倍率 | 备注 |
|---|---|---|---|
| 道路 | `tr_pingdi`（官道、街巷、庭院）、`tr_taijie`（坡道）、`tr_jiaotu` | ×1.2 | 泥泞状态 ×0.7 |
| 平原 | `tr_pingdi`（田野）、`tr_caodi` | ×1.1 | |
| 山道 | `tr_taijie`（山道石阶）、`tr_suishi` | ×0.8 | 碎石坡落石照常判定 |
| 草原 | `tr_caodi`（草原）、`tr_qianshui`（河滩浅水） | ×1.2；浅水 ×0.8 | |
| 沙地/沙漠 | `tr_shadi`、`tr_suishi`（戈壁） | 骆驼 ×1.2、马 ×0.8 | 骆驼在沙漠不额外耗体力（10）；误入流沙 → 坐骑陷落、强制下马 |
| 雪地 | `tr_xuedi` | ×0.6（仅蒙古马、大宛良驹、小红马） | 深雪不可骑 |
| 不可骑行 | 植被（花丛、竹林、密林、荆棘、情花丛）、泥沼、毒沼、深雪、冰面、薄冰、深水及以上水域、峭壁、悬崖边、屋顶、墙、树梢、各种桥与栈道、室内、洞窟、石阵、迷宫、机关、蛇窟、火焰、熔岩 | — | 进入即自动下马，牵马绕行由寻路处理 |

- 骑行中不能使用任何轻功动作（纵跃、踏水等）；下马 1 秒。就地开战时自动下马（10 §11.4、09）。
- 10 所称"全部陆地道路"（小红马）= 道路 + 平原 + 山道 + 草原 + 沙地 + 雪地。

---

## 7. 战斗中的地形

### 7.1 就地开战的地形截取（基准 §8）

| # | 规则 |
|---|---|
| C1 | 以遭遇点为中心截取 ≤ 20×20 格，越出区域边界时平移窗口；区域本身更小则取整个区域/室内 |
| C2 | 窗口内地形、高度、地表状态（燃烧、积雪、泥泞……）、天气、时辰原样保留 |
| C3 | 窗口外：若原地图是虚空、深水、峭壁落差 → 保留真实规则（可被击落）；否则为不可见边界墙（撞墙按 05/06 撞击） |
| C4 | 布阵：双方单位落在各自出生区（09）的可站格上；单位不会被布置到其无资格站立的格（树梢、水面、屋顶需相应境界） |
| C5 | 可站格 < 40% 的战场（桥上、船上、栈道）使用 09 的"窄场"模板（双方人数上限各 −2，原创扩展建议） |
| C6 | 战斗结束：地表状态写回区域（烧过的草地仍是焦土）；可破坏物件的损毁按 `interact` 定义持久化（城门、铁索桥为剧情物件时由脚本决定） |

### 7.2 移动消耗与寻路

- 移动按 4 邻接（曼哈顿，与 05 射程度量一致）；本次移动总消耗 ≤ `mov`（03 §4.4）。
- 每一步的消耗 = 目标格 `moveCost`（按 `byMode`/`byTier`/轻功特技 `moveCostByTag` 修正，最低 1）+ 动作附加（纵跃 `⌈Δh_up/2⌉`、攀峭壁 `Δh`、攀低坎 2、刹步 1、上坡 `uphill`）。
- 寻路：A*，状态 = `(格, 通行模式, 本次已踏水格数)`；边的合法性按 §5.2 H1–H8 与 `pass`；敌方单位阻挡；友军可穿越（窄道格除外）；截击与控制区归 06/09。同代价路径按"动作少 → 危险格少 → 格编号"确定性择一。
- UI（14 定样式）：可达格按"步行 / 纵跃 / 攀爬 / 踏水 / 危险"五色标示；悬停显示体力消耗与将触发的地形效果。
- 探索寻路同一算法，代价改为时间（`1 / exploreSpeed`），自动路径默认绕开 `hazard` 格与门禁，玩家可长按强制通过。

### 7.3 地形效果的挂载

| 规则 | 内容 |
|---|---|
| 进入 | 移动（含被击退、牵引、滑行、水流推移）每进入一格即检查目标格 `onEnter`；`mode: change` 仅在地形或地表状态组合与前一格不同时触发（06 缺省），`mode: every` 每格触发，但每次移动至多 `maxPerMove`（默认 2）次；**先移除后施加**（入水先解灼烧） |
| 停留 | 持有者 S 段、DOT 之前（**建议 06 设优先级 150**，位于 S1 与 S2 之间），使"站在火里开始回合"当回合即结算 |
| 品阶与命中 | 按 §2.5；豁免（qg4、水性、身份、物品）在触发时按当前值判定 |
| 常驻修正 | 表 a 的 `combat`、`cover` 是属性层/Z7 的地形修正（修饰来源 `terrain`，提案 §12 D-03）：不占 Buff 数量、不可驱散、离格即失效；UI 在单位状态栏显示一枚"地形"标签 |
| 战斗外 | `onStay` 对应探索中"在该地形逗留每时辰"一次判定（如瘴林、毒沼、雪原 `bf_shouhan`），跨战斗规则归 06 §5.4 |

### 7.4 环境时钟 `envTick`（建议交 design/09 采纳）

集气时间轴没有"全场回合"，地形变化需要自己的节拍。设一个不可被选中的虚拟行动者"环境"：`spd` 恒为 100、开场 `CT0 = 500`，每集满 1000 执行一次环境行动（无收招波动）。100 约等于 STD Lv35 的速度（03 §4.3：106），即大约每名普通单位行动一次，环境走一步。

| 段 | 内容（按顺序、确定性） |
|---|---|
| N1 | 燃烧计时 −1；到期者按 §2.4 转换地形；随后按格编号（行优先）对每个燃烧格的 4 邻可燃格掷蔓延骰（§7.5.1） |
| N2 | 烟雾、毒雾顺风漂移 1 格并计时 −1 |
| N3 | 冰封计时 −1（`freezing` 天气下不减）；到期融化并重新判定其上单位 |
| N4 | 水流：处于急流、大江的游水单位沿流向推移 1 格（暴雨 2 格），撞岸撞礁按 05/06 撞击；踏水者不受影响 |
| N5 | 摇晃：铁索桥、船甲板、云海栈道上的单位按风力掷 `bf_shiheng`（§3） |
| N6 | 机关复位计时；雪崩、潮水、塔楼火势等剧情脚本节拍 |

探索中环境时钟按实时 2 秒一跳（用于探索中的放火、冻水解谜）。

### 7.5 地形互动

#### 7.5.1 火

| 项 | 规则 |
|---|---|
| 点燃 | 带 `terrainFx.ignite` 的招式命中可燃格：概率 = 招式 `igniteChance`（缺省 60%）× 天气系数（小雨 0.3、大雨/雪 0）；火折子：相邻格、1 行动、晴天 100%；火油：投掷 3 格内，3×3 生成 `tst_youzi` 后可引燃 |
| 火势品阶 | 招式点燃 = 招式有效品阶；物品点燃与环境火 = `terrainGrade`（火折子只是火种） |
| 蔓延 | 每环境 tick，燃烧格对 4 邻可燃格：`P = 蔓延率 × 风系数 × 天气系数 × (油渍 ? 2 : 1)`，上限 95% |
| 风系数 | 顺风 `1 + 0.5 × 风力`；逆风 `max(0, 1 − 0.4 × 风力)`；侧风 1（风力 0–3，§8.4） |
| 伤害 | 进入与停留：`bf_zhuoshao`（06：`hpMax × 1.2% × G`，取高叠加规则）；击杀记给点火者 |
| 结束 | 按 §2.4 转换；焦土 1 tick 余烬 |
| 反制 | 入水解除灼烧（06）；水系/寒系招式扑灭（冻结优先于燃烧：寒系命中燃烧格 → 灭火，不冻结） |

#### 7.5.2 冰

| 项 | 规则 |
|---|---|
| 冻结 | 带 `terrainFx.freeze` 的寒系招式范围内的浅水、深水、泥沼（急流仅地阶以上）→ `tst_bingfeng`，持续 `2 + ⌊g/3⌋` tick（g 1–2 → 2，3–5 → 3，6–8 → 4，9–11 → 5，12 → 6） |
| 冻住单位 | 冻结瞬间格内涉水/游水单位：`bf_dingshen` 1 回合 + `bf_hanqi` 1 层（品阶 g，走 06 免疫与抵抗） |
| 冻深水 | 按薄冰：可行走，但会裂（§3.3）——"冻湖诱敌、踏裂落水"是寒系流派的战术 |
| 融化 | 火系招式或燃烧命中 → 立即融化；其上单位重新判定（无踏水资格者落水） |
| 冻熔岩 | 寒系招式命中熔岩 → `tr_suishi` 3 tick（原创扩展） |
| 原著锚 | 寒冰绵掌（倚天·韦一笑）、寒冰真气（笑傲·左冷禅）、玄冥神掌（倚天）等寒系武学可带 `freeze`（05/catalog 定具体招式；以掌力冻水为游戏化扩展） |

#### 7.5.3 破坏

```
objHp(k) = k × HP_ref(regionLv)       HP_ref = 03 §10.2 普通敌人模板 STD_E 的 hpMax（区域等级）
对物件的伤害：只有 hard 标签招式、绝招、断兵类神兵（06 bf_duanbing 来源）、攻城器械全额；其余 ×0.25
物件防御 defOut = 1.5 × DEF_LV(regionLv)；不暴击、不吃 Buff、不触发反震
```

| 物件 | k | 毁坏结果 |
|---|---|---|
| 家具、屋瓦 | 0.2 / 0.3 | 碎屑（平地）；屋瓦 → 露出室内 |
| 木梯、朽栈道、独木桥 | 0.5 | 虚空缺口或落差 |
| 树梢（砍倒） | 1.0 | 倒木成桥 3 格（原创扩展） |
| 机关 | 1.0 | 失效 |
| 铁索 | 2.0 | 桥塌 |
| 石阵阵眼 | 3.0 | 全部阵眼毁 → 阵法失效，阵石 → 碎石 |
| 墙体 | 5.0 | 缺口（仅攻城器械或剧情） |
| 城门 | 8.0 | 洞开 |

#### 7.5.4 击退、牵引与坠落（05 §4.5、06 `bf_jitui` 的地形结算）

结算顺序沿用 05：伤害 → 位移 → 撞击/坠落 → 地形效果。位移途经的每一格都执行 `onEnter`（危险地形 `every`），并触发机关（05："位移触发陷阱与区域"）。

| 被推入 / 推落 | 结果 |
|---|---|
| 上坡 `Δh ≥ 2`、墙、单位 | 停下并撞击（05/06 撞击规则） |
| 下坡落差 ≤ `1 + jump` | 无伤落地；第一格低 ≥ 1 级时击退距离 +1（§5.5） |
| 下坡落差 > `1 + jump` | 坠落伤害（§5.3，`safeDrop' = 1 + jump`） |
| 虚空 | 坠崖（§5.4）；Boss 在边缘停下改受撞击 |
| 深水、急流、大江 | 落水（`bf_luoshui`、`bf_shishen`），解灼烧；急流另顺流 2 格 |
| 薄冰、冰封深水 | 裂纹一次 +2 → 通常当场破裂落水 |
| 冰面 | 击退 +1（滑行） |
| 燃烧格、火焰、熔岩 | 灼烧；熔岩按 §3.7 |
| 荆棘、情花丛、毒沼、蛇窟 | 各自 `onEnter` |
| 铁索桥侧向 | 坠崖；qg3+ 50% 抓索自救 |
| 石阵 | 入阵，此后迷踪 |

#### 7.5.5 踏水作战

| 规则 | 内容 |
|---|---|
| 资格 | qg3（深水）、qg4（急流）、qg5（大江）；燕子三抄水 `threeSkim` 可在 qg2 踏 ≤ 3 格（§4.5） |
| 移动 | 每次移动经过的深水格 ≤ `maxRun`；落脚点（浅水、冰、船、陆地）清零 |
| 停留 | 回合结束仍在水面 → 付"踩水"体力（qg3 6 / qg4 4 / qg5 2，水上漂 ×0.5，熟练折扣适用）；付不起 → 落水 |
| 战斗修正 | 踏水者 `attr:parry pct −10%`（一苇渡江免除）；近身攻击水中单位仍受 `hTol` 限制 |
| 被位移 | 被击退或牵引时仍在水面滑行，不额外判定；若此时处于疲惫 → 落水 |
| 冻结 | 脚下被冻 → 改为站在冰上（安全） |
| 典型战术 | 踏水者占据水面，对无资格的敌人风筝；寒系冻湖反制；火攻逼敌入水 |

#### 7.5.6 机关与奇门阵

- 机关对未识破者隐藏；本土敌人（古墓派、神龙教、迷宫守卫）知晓己方机关，AI 绕行。玩家可诱敌踩机关；机关战斗中 5 tick 复位。
- qg4 不触发机关（基准 §11），但被击退落在机关上**照常触发**（身不由己）。
- 石阵：`formation` 看破/驭阵见 §3.6；"驭阵"的敌方首领（原著如黄药师）会把玩家引入阵中（09 Boss 机制）。

### 7.6 地形 AI（给 design/09 的评分项，建议值）

`tileScore = Σ wᵢ × fᵢ`，AI 在可达格中择高分；各项乘以流派系数（03 §10.4）与 AI 档（02 §3.3：`ai_basic` 只用前三项，`ai_adept` 前六项，`ai_expert` 全部，`ai_master` 另会诱敌入阵、诱敌上薄冰）。

| 项 | 定义 | 权重 | 流派加权 |
|---|---|---|---|
| 高差 | 远程单位：相对最近敌人每高 1 级 +6（≤ 4 级）；近战 +3（≤ 2 级） | 1.0 | `arch_anqi`、`arch_lingqiao` ×1.5 |
| 遮蔽 | 敌方远程火力需穿越遮蔽才能打到本格：+8 | 1.0 | `arch_anqi` ×1.5 |
| 危险 | −（本格预计每回合地形伤害占 `hpMax` 百分比 × 4）；燃烧、毒雾且无免疫：−40 | 1.0 | — |
| 临渊 | 敌方有击退招式且下回合可把本单位推入虚空或 `excess ≥ 3` 的落差：−25 | 1.0 | `arch_huwei` ×2 |
| 推落机会 | 本行动可把敌人推入：虚空 +（其剩余气血折算击杀价值）；深水 +12；燃烧 +10；薄冰 +8；荆棘/毒沼 +6 | 1.0 | `arch_gangmeng` ×1.5 |
| 点火机会 | 相连可燃区内敌数 × 8 × 顺风系数 − 同区友方数 × 12 | 0.8 | `arch_dugong` ×1.2 |
| 冻结机会 | 水中敌数 × 10 | 0.8 | — |
| 踏水位 | 有踏水资格且半数以上敌人无资格：水面格 +6；体力 < 2 次踩水费用：−30 | 1.0 | `arch_lingqiao` ×1.5 |
| 石阵 | 驭阵者：引敌入阵 +10；未看破者：入阵 −15 | 1.0 | — |
| 机关 | 已知机关格 −50；可诱敌踩中 +8 | 1.0 | — |

### 7.7 演算例：射雕·太湖岸夜战（草地 + 浅水 + 深水，东风 2 级）

| 步 | 事件 | 计算 |
|---|---|---|
| 0 | 区域 `gMain` = 6（玄上）→ `terrainGrade` T = 6，G = 1.70 | §2.5 |
| 1 | 队友以火折子点燃西侧草地 (3,5) | 晴夜 100% 点燃；火势品阶 = T = 6 |
| 2 | 环境 tick：(3,5) 向东（顺风）蔓延 | `40% × (1 + 0.5×2) = 80%`；向西（逆风）`40% × (1 − 0.8) = 8%`；南北 40% |
| 3 | 敌人 A（`hpMax` 5,800）回合开始时身处燃烧格 | 停留 → `bf_zhuoshao`（品阶 6）：每回合 `5,800 × 1.2% × 1.70 = 118` |
| 4 | 主角以带 `knock 1` 的掌法把 A 推入浅水 | 入水先解灼烧（06），A 涉水 `eva −10%` |
| 5 | 主角（`qinggong` 120，qg3）踏水 3 格追击船上弓手 | 体力 `3 × 4 × (1 − 30/200) = 10.2`；回合末站在船上，无需踩水 |
| 6 | 敌人 B 远程攻击站在船上的主角（船高 1，岸 0） | B 较低 1 级：`Z7 −4%`、`hit −4`（§5.5） |
| 7 | 大风转 3 级：船甲板摇晃 | 每环境 tick 船上无 qg3 的单位 `15%` 失衡；主角 qg3 免 |

---

## 8. 天气与昼夜

### 8.1 与 design/11 的接口

| 本文读取（11 提供） | 取值 | 本文用途 |
|---|---|---|
| `world.weather` | `clear` `cloudy` `rain` `storm` `snow` `blizzard` `fog` `sandstorm` | 地形换算（§8.2）、战斗修正 |
| `world.wind` | `{dir: 8 方向, force: 0–3}`（静/微/劲/狂） | 暗器、音功、火势、烟雾、摇晃（§8.4） |
| `world.temp` | `hot` `mild` `cold` `freezing` | 冰封、融化、受寒、酷热 |
| `world.shichen` → `phase` | 卯 = 黎明；辰—申 = 白昼；酉 = 黄昏；戌—寅 = 夜晚（本文映射） | 视野（§5.7）、潜行 |
| `world.moon` | `bright` / `dark` | 夜间视野 6 / 4 |
| `world.season` | 春夏秋冬 | §8.5 |
| 区域累积量 `rainHours` `snowHours` `dryHours` | 时辰 | 地表状态的生成与消退 |

| 本文提供（11 使用） | 内容 |
|---|---|
| 每种地形的 `weather` 规则 | 何种天气累积多久生成/移除哪种地表状态 |
| 地形的探索体力、足迹、噪声 | 11 的潜行、追踪、旅行时间 |
| 战斗天气修正表 | 就地开战时快照天气（战斗中天气不变，剧情脚本除外） |

### 8.2 天气 × 地形换算与战斗修正

| 天气 | 地形换算（探索中按时辰累积） | 战斗修正 |
|---|---|---|
| 晴 `clear` | 雨后晴 4 时辰：泥泞消退；夏季正午的沙地、火山地表"酷热"：体力消耗 +25% | — |
| 小雨 `rain` | 累计 2 时辰：土质平地、草地、沙地 → `tst_nining`；屋顶、石板、船、冰 → `tst_shihua` | 点燃 ×0.3、蔓延 ×0.5；投射命中 −5；带 `fire` 标签招式 `Z7.dealt −10%`；冻结持续 +1 tick |
| 大雨/雷暴 `storm` | 同上且 1 时辰即生效；河道浅水 → 深水（6 时辰）；急流每 tick 冲 2 格 | 点燃 0，燃烧每 tick 另有 50% 熄灭；视野 −4；投射命中 −10；`sonic` 半径 −1；雷击为剧情事件 |
| 雪 `snow` | 累计 3 时辰：平地、草地、碎石、屋顶、城墙 → `tst_jixue`；雪地 6 时辰 → 按深雪；`freezing` 时浅水、泥沼自然冰封 | 雪地点燃 0、其余 ×0.3；视野 −2；雪地停留寒气概率 +10% |
| 暴雪 `blizzard` | 同上且速度 ×2 | 视野 3；投射命中 −15；非 qg4 雪地移动 +1；探索中无御寒每时辰 `bf_shouhan`（06） |
| 雾 `fog` | — | 视野 4；投射射程 −2；潜行 +2 级（11） |
| 沙暴 `sandstorm` | 沙地足迹清除；迷宫通道积沙（§3.6） | 视野 3；投射命中 −20；露天单位每回合 20% `bf_muxuan`（06：烟尘目眩） |
| 严寒 `freezing`（气温） | 冰封不融；薄冰裂纹寒夜复原 | 无御寒装备：进入战斗时 `bf_shouhan` 转为寒气 1 层（06 §8.10） |

### 8.3 昼夜

- 视野按 §5.7；夜晚 + `stealthy` 地形（竹林、密林、花丛、树梢、房梁、墙根阴影）满足 06 `bf_yinshen`"暗处地形"条件。
- 持火把/灯笼换来视野，也暴露自己（12 格内可见）；熄灭需 1 行动。
- 夜间特定地形事件由 chapters 登记（例：天龙无量山玉璧"月下剑影"——原著有剑湖玉璧现剑影之说，细节待考）。

### 8.4 风

| 对象 | 顺风（攻方在上风） | 逆风 | 侧风 |
|---|---|---|---|
| 暗器（`hidden`，投射） | 射程 +⌊风力/2⌋（至多 +1） | 射程 −风力（最低 1）、命中 −5 × 风力 | 命中 −3 × 风力 |
| 音功（`sonic`，碧海潮生曲、狮子吼等） | 风力 ≥ 2：半径 +1 | 风力 ≥ 2：半径 −1 | — |
| 火势 | 蔓延 ×(1 + 0.5 × 风力) | ×max(0, 1 − 0.4 × 风力) | ×1 |
| 烟雾、毒雾 | 每 tick 顺风漂移 1 格（风力 3：2 格） | | |
| 摇晃地形 | 风力 ≥ 2 触发（铁索桥、船甲板、云海栈道） | | |
| 滑翔 | 顺风平移 +1 格（qg4+） | 逆风 −1 | — |

### 8.5 季节（日历归 11）

| 季节 | 地形影响 | 门禁意义 |
|---|---|---|
| 春 | 融雪：急流 +1、雪崩坡风险 ×2、深雪 → 雪地 | 雪谷类门禁"开春可出"（连城雪谷，§9.9） |
| 夏 | 雷暴、酷热（大漠、火山地表） | 大漠行程需水囊（11） |
| 秋 | 钱塘江大潮（农历八月十八前后为盛） | 书剑海宁观潮（§9.12）的时辰门禁 |
| 冬 | 北方与高山区域的湖面、浅水冰封（整季）；急流不冻 | **天然替代钥匙**：冰封湖面无需 qg3/qg5 即可通行（AF8），但湖边留薄冰带 |

---

## 9. 十四书界标志性地形与地点

### 9.0 读表约定

- 区域 ID 为**建议**（`rg_<书界序号>_<拼音>`，基准 §12），最终以 chapters 文档为准；每书界 6–10 个区域中的"地标区域"在此列出。
- 门禁记法：`主 qgN` / `支 qgN` / `隐 qgN` = 主线 / 支线 / 隐藏内容所需轻功境界，须满足 §6.4 G1–G4 与 §6.5 预算；其后为非轻功门禁与替代解。
- 原著标注：未加注者为原著梗概（高置信）；"（待考）"为需逐字核对的细节；"（原创扩展）"为本作新增的地形或玩法。

### 9.1 天龙八部（上限：主 qg2 / 支 qg3 / 隐 qg4，qg5 需临时加值）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 无量山崖·剑湖 | `rg_01_wuliang` | 密林、峭壁、悬崖边、深谷（`fallTarget` → 琅嬛福地）、深水（剑湖）、石壁（无量玉璧） | 主 qg0–qg1（山道）；**坠崖奇遇**（单向下落）入谷底；支 qg3：玉璧观景台（攀峭壁 3 级）+ 时辰（夜、月明）；剑湖：支 qg3 踏水 或 渡船 | 无量剑派剑湖宫、段誉坠崖入谷；玉璧"月下剑影"之说（待考） | 坠崖奇遇的示范关；剑湖小岛为本书界首个踏水目标 |
| 琅嬛福地 | `rg_01_langhuan` | 洞窟、室内（石室）、石壁（玉像）、深水（谷底湖） | 进入：坠崖奇遇 或 支 qg3 攀下峭壁（回访）；出口：长隧道（qg0，保底出口，§5.4） | 玉像、北冥神功与凌波微步秘籍（原著）；出洞路径细节（待考） | 凌波微步可设为 02 §2.9 的 `earlyException`（§4.7 注） |
| 缥缈峰·灵鹫宫 | `rg_01_piaomiao` | 雪地、深雪、峭壁、悬崖边、铁索桥、云海栈道、宫殿（室内/屋顶） | 主：雪中山道（减速但可走）；支 qg3：断崖捷径；隐 qg4：雪原无痕秘境；隐 qg5（需加值）：云海栈道通往"童姥闭关处"；身份：灵鹫宫（虚竹线） | 灵鹫宫在天山缥缈峰、群豪围攻（原著）；铁索与深涧（待考）；云海栈道与闭关处（原创扩展） | 本书界唯一 qg5 内容，给凌波微步专精玩家 |
| 擂鼓山·珍珑棋局 | `rg_01_leigu` | 台阶山道、密林、室内（木屋） | 主 qg0；棋局：`check chess ≥ 60`，或"舍身一子"剧情解（棋道不足亦可，走虚竹式剧情，原创扩展）；木屋无门：`strength` 或破壁 | 苏星河设局、虚竹解局（原著）；破壁入屋细节（待考） | 技艺门禁与"反技艺"解法并存的范例 |
| 燕子坞·太湖水道 | `rg_01_yanziwu` | 浅水、深水、大江湖面（太湖）、花丛（曼陀山庄茶花）、船甲板、室内（还施水阁） | 船（阿朱、阿碧小舟）；水道迷路（无向导视野 4）；支 qg3 踏水上小岛；`threeSkim`（燕子三抄水，本区支线奖励）qg2 过短水面；曼陀山庄：潜入或王夫人好感 | 阿朱阿碧驾舟、曼陀山庄茶花与琅嬛玉洞（原著）；接人细节（待考） | 船门禁与水道迷宫；qg2 踏水钥匙 |
| 雁门关 | `rg_01_yanmen` | 碎石、峭壁、悬崖边、深谷、城墙（关城）、雪地（冬） | 主线剧情；支 qg3：崖壁下的石壁刻字（攀下 3 级） | 萧远山雁门关外坠崖未死、萧峰终局于雁门关（原著）；崖壁刻字（待考） | 悲剧锚点的地形复现；改命线场景（13） |

> 起始区域建议为大理城（`rg_01_dali`：平地、屋顶、高墙、竹林、花丛）。天龙开局无任何携带（基准 §2），G8 的"开局奖励门禁"在天龙改为 1 个 qg1 门禁（学得草上飞即可开，奖励早期药品）；qg2 屋顶路网作为支线，约在主线 40%（普通玩家达 qg2，§6.5.2）后开放，主线的 qg2 门禁则在 55% 之后。

### 9.2 射雕英雄传（上限：主 qg3 / 支 qg4 / 隐 qg4）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 桃花岛奇门阵 | `rg_02_taohua` | 花丛（桃林）、竹林、石阵（桃花阵）、洞窟（周伯通之洞）、沙地（海滩）、大江湖面（海）、船甲板 | 船（渡海）；奇门：`formation ≥ T(9) = 68`，或黄蓉/哑仆带路（向导），或阵图；隐 qg4：海崖观潮台（攀 4 级）；隐：击毁阵眼 | 桃花岛阵法、周伯通被困岛上岩洞十余年（原著）；渡岛方式（待考）；观潮台（原创扩展） | 奇门门禁的主场；`ai_master` 级阵中 Boss |
| 铁掌峰 | `rg_02_tiezhang` | 峭壁（中指峰，三段各 3 级）、山道、洞窟（历代帮主墓穴）、室内（铁掌帮总舵） | 主 qg3：`gate_02_zhongzhifeng`（§6.2 示例；替代：飞爪、带人、剧情演出）；身份：铁掌帮（敌对，潜入）；支：水上漂秘籍（原创扩展） | 铁掌峰形如五指、中指峰为禁地（待考） | 多段攀崖的体力预算示范（B3） |
| 牛家村·曲三酒馆密室 | `rg_02_niujia` | 平地、室内、密室（洞窟变体）、机关 | 主 qg0；机关：线索任务或 `formation ≥ 20` 找到开关 | 楔子牛家村（1199）、郭靖黄蓉密室疗伤七日七夜（原著）；开关机关（待考） | 06 九阴真经疗伤篇的场景 |
| 渔樵耕读·一灯隐居 | `rg_02_taoyuan` | 急流、瀑布、山道、巨石、独木桥（石梁变体）、峭壁 | 四关皆有非轻功解：渔（船逆流，或支 qg4 踏急流）；樵（`check music` 或 `speech`）；耕（`strength`：托举巨石，`str ≥ 70` 或队友合力）；读（石梁 + 书生问答：`check art ≥ 44` 或 `lore ≥ 40`） | 渔樵耕读四弟子拦路、黄蓉以学识应对书生（原著）；铁舟逆流与各关细节（待考） | "技艺门禁组合"的范本（G10、G12） |
| 华山绝顶 | `rg_02_huashan` | 峭壁、悬崖边、雪地、栈道 | 主 qg3（三段攀）或长山道；隐 qg4：绝壁小洞（藏史古迹 `rs_huashan`，02 §6.6 要求 qg3） | 华山论剑（原著）；论剑时节是否有雪（待考）；栈道（原创扩展） | 与 02 藏史联动 |
| 蒙古悬崖 | `rg_02_menggu` | 草地（草原）、峭壁（高崖分段 10 级）、沙地（大漠） | 教学支线：夜登悬崖（qg1→qg2 的训练，完成得 `apLight +5`、金雁功，原创扩展）；坐骑：大漠行程 | 马钰每夜带郭靖登崖练功（原著梗概，细节待考） | 射雕开局的轻功教学关 |

### 9.3 神雕侠侣（上限：主 qg3 / 支 qg4 / 隐 qg4，qg5 需临时加值）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 终南山古墓 | `rg_03_gumu` | 墓室机关、室内（寒玉床室）、洞窟、机关地板、石壁（石刻）、深水（地下水道） | 身份：古墓派（或暗门 `formation`）；断龙石（剧情门禁）；石棺秘道 → 地下水道：`swim ≥ 2` 潜水 8 格（闭气加成）；玉蜂：驭兽或玉蜂浆 | 活死人墓、断龙石、寒玉床、石棺内刻字（原著）；水道逃生细节（待考） | 水性门禁的主场；寒玉床修炼点 |
| 绝情谷 | `rg_03_jueqing` | 情花丛、深谷（断肠崖，`fallTarget` → 谷底深潭）、深水（谷底潭；鳄鱼潭）、洞窟（地穴）、室内（山庄） | 主：情花为危险而非门禁；谷底：坠崖奇遇，出谷支 qg3 攀峭壁或剧情；地穴：`device`（绳索吊篮）或支 qg3 攀下；鳄鱼潭：驭兽或战斗 | 情花与情花毒、裘千尺困于地穴以枣为食、十六年后杨过自断肠崖跃下（原著）；鳄鱼潭（待考） | 情花毒与断肠草的采集链（06 `rx_yiduigongdu`） |
| 襄阳城墙 | `rg_03_xiangyang` | 城墙、高墙、屋顶、平地、深水（江面，待考）、船 | 主线攻守战（09）；城外攀城：qg4 + 借壁（5 级城墙）或云梯/城门；支 qg3：城楼屋顶狙击点；隐 qg5（需临时加值）：围城中一苇渡江传信（原创扩展） | 郭靖黄蓉守襄阳（原著） | 攻城互动（滚木礌石、火油、推倒云梯） |
| 剑冢 | `rg_03_jianzhong` | 峭壁（剑冢平台 5 级，两段）、洞窟（独孤求败旧居）、急流/瀑布（山洪）、密林 | 支 qg3 攀峭壁；替代：神雕引路（剧情/驭兽）；山洪练剑：瀑底站桩（每 tick 失衡判定 + 体力消耗），完成获玄铁剑法领悟（05）；隐 qg5（需临时加值）：剑冢后绝壁（攀 5 级，原创扩展） | 神雕引杨过至剑冢、山洪中练剑（原著） | 瀑布地形的修炼玩法 |
| 重阳宫 | `rg_03_chongyang` | 台阶、屋顶、室内（大殿）、密林 | 身份：全真；支 qg2：殿顶 | 终南山全真教（原著） | 杨过早年经历的回溯支线 |

### 9.4 倚天屠龙记（上限：主 qg3 / 支 qg4 / 隐 qg5）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 冰火岛 | `rg_04_binghuo` | 熔岩/火山、冰面、雪地、深雪、冰窟（原创扩展）、洞窟（居所）、大江湖面（北海） | 船（漂流，剧情单向）；熔岩为危险；支 qg4：冰原踏雪；隐 qg5：一苇渡江往返近海礁岛（原创扩展）；余韵：造筏返航（`device`） | 张翠山、殷素素随谢逊漂至冰火岛，火山使岛上不寒（原著）；造筏细节（待考） | 冰火并存：寒系冻熔岩、火系融冰的互动示范 |
| 光明顶秘道 | `rg_04_guangming` | 洞窟（秘道）、机关地板、室内（石室）、峭壁、铁索桥（原创扩展） | 主：秘道由小昭带路（向导）或 `formation`；石门：`strength`（内力：`mpMax ≥ 1.2 × MPREF(Ld)`）或机关；支：六大派围攻战场（屋顶、峭壁） | 小昭引张无忌入秘道、阳顶天遗骸与乾坤大挪移心法（原著）；推开石门细节（待考） | 内力检定门禁 |
| 武当山 | `rg_04_wudang` | 台阶（山道）、屋顶（紫霄宫）、峭壁、密林（松林）、树梢 | 身份/好感：武当；主线时辰：张三丰百岁寿宴；支 qg3：松林树梢（梯云纵教学，原创扩展）；支 qg2：真武殿屋顶；隐 qg5：天柱峰绝壁（攀 5 级，原创扩展） | 武当派、张三丰寿宴（原著） | 梯云纵的获取与教学 |
| 昆仑幽谷 | `rg_04_kunlun` | 雪地、深雪、悬崖边、深谷（`fallTarget` → 幽谷）、窄隙、草地与深水（谷内） | 进谷：坠崖奇遇或 `squeeze`（蛇行狸翻 / 缩骨）；出谷：同路 `squeeze` 或隐 qg4 攀峭壁；隐 qg5：昆仑之巅云海栈道（原创扩展） | 张无忌坠崖入谷、钻石隙、朱长龄卡于隙中、白猿腹中得九阳真经（原著） | 窄隙门禁的原著出处 |
| 万安寺宝塔 | `rg_04_wanan` | 室内（塔内 13 层，分段地图）、屋顶（塔檐每层 2 级）、火焰（焚塔）、平地（寺院） | 时辰：夜；易容/内应（范遥）；主线逐层攀檐 qg2，支 qg3 快速路线；焚塔脱出：高空跳下（坠落规则） | 六大派被囚万安寺高塔、范遥卧底、火起后群雄跃下（原著梗概）；接人以卸力的细节（待考） | 原创扩展：持乾坤大挪移者可"接人"，把落下队友的坠落伤害转为 0（每人 1 次，09 实现） |

### 9.5 笑傲江湖（上限：主 qg3 / 支 qg4 / 隐 qg4）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 华山思过崖 | `rg_05_siguoya` | 峭壁、悬崖边、洞窟（后洞）、石壁（五岳剑招及破法刻图）、栈道（原创扩展） | 主：受罚上崖（剧情）；后洞：破开薄石壁（`break`，k 0.5）；风清扬：时辰（夜）+ 事件；支 qg3：崖顶；隐 qg4：更高绝壁（藏史 `rs_huashan`） | 令狐冲面壁思过崖、后洞石壁刻有五岳剑法与破法、风清扬传独孤九剑（原著）；发现后洞的方式（待考） | 石壁参悟与独孤九剑传承 |
| 黑木崖·吊篮 | `rg_05_heimuya` | 峭壁（多段，每段 10 级）、吊篮（`device` 多段）、室内（成德殿）、屋顶 | 主：吊篮（需神教令牌 `status` 或任盈盈同行）；隐 qg4：四段攀崖（每段 4 级，段间落脚点，满足 B3）（原创扩展） | 上黑木崖须乘吊篮（原著）；吊篮段数（待考） | 机关门禁 + 高阶轻功替代路线（G12） |
| 杭州梅庄·湖底地牢 | `rg_05_meizhuang` | 室内（梅庄）、花丛（梅林）、洞窟（湖底地牢，潮湿）、机关（多重铁门）、深水（西湖） | 四关技艺：琴 `music`（黄钟公）、棋 `chess`（黑白子）、书 `art`（秃笔翁）、画 `art`（丹青生）；或以真迹物品替代；地牢门：钥匙（待考）；湖底：无轻功门禁 | 向问天携《广陵散》、呕血谱、张旭书帖、范宽《溪山行旅图》诱江南四友；任我行囚于湖底，铁板刻吸星大法（原著） | 技艺门禁四连（G10）；换囚剧情 |
| 衡阳回雁楼 | `rg_05_huiyan` | 室内（酒楼）、屋顶、平地（衡阳城） | 主 qg0；支 qg2：屋顶追逐（G8 开局奖励门禁）；田伯光线 → 万里独行（原创定名） | 令狐冲与田伯光回雁楼斗酒坐斗（原著） | 开局区域的屋顶路网 |

### 9.6 侠客行（上限：主 qg3 / 支 qg4 / 隐 qg4）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 侠客岛石室 | `rg_06_xiakedao` | 石壁（诸石室刻图与诗句）、洞窟、沙地（海滩）、大江湖面（海）、船甲板 | 邀约：赏善罚恶令（`status`）+ 时辰（腊八之约）；船：岛使接送；石壁参悟（识字反碍，03 D-16） | 侠客岛腊八粥之约、石壁刻《侠客行》诗与太玄经图谱、石破天不识字而悟（原著）；石室数目与诗句对应（待考） | 太玄经获取；"越有学问越难悟"的反向门禁 |
| 凌霄城 | `rg_06_lingxiao` | 雪地、深雪、冰面、城墙、深谷（城外深涧）、吊桥（`device`） | 主：吊桥（雪山派身份或战斗夺桥）；隐 qg4：跨 4 格深涧；踏雪无痕（雪山派，原创归属） | 雪山派凌霄城位于大雪山（原著）；吊桥与深涧（待考/原创扩展） | 雪地城池攻防 |
| 摩天崖 | `rg_06_motian` | 峭壁（三段各 3 级）、悬崖边、洞窟（居所） | 支 qg3；替代：谢烟客携人上崖（剧情/带人） | 谢烟客居摩天崖、携石破天上崖（原著梗概） | 带人门禁的原著出处 |
| 长乐帮总舵 | `rg_06_changle` | 室内、屋顶、高墙、船甲板（江边） | 身份：石破天被误认作帮主（原著）→ 帮主身份门禁；支 qg2 屋顶 | 长乐帮（原著） | 身份误认带来的门禁反转 |

### 9.7 碧血剑（上限：主 qg3 / 支 qg4 / 隐 qg5，神行百变专精，稳妥需临时加值）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 华山金蛇洞 | `rg_07_jinshe` | 峭壁（洞口在崖壁）、洞窟、机关（铁盒暗器）、石壁（遗刻）、云海栈道（原创扩展） | 主：穆人清引导（剧情）；支 qg3：攀峭壁 3 级直达洞口；机关：`formation` 识破或中毒；谜题：金蛇秘笈；隐 qg5：绝壁云海栈道（1 处，神行百变专精） | 袁承志于华山发现金蛇郎君遗洞与秘笈（原著）；铁盒机关、遗刻、秘笈显字细节（待考） | 谜题门禁 + 本书界唯一 qg5 内容 |
| 石梁温家 | `rg_07_shiliang` | 室内（多进大宅）、屋顶、高墙、台阶、石梁（独木桥石梁变体，原创扩展） | 时辰（夜潜）；支 qg2 屋顶路网；五行阵为战斗合击（09），非地形 | 温家五老、五行阵、温仪与夏雪宜旧事（原著） | 夜潜宅院；五行阵 Boss |
| 紫禁城（明末） | `rg_07_zijin` | 宫殿屋脊、宫墙、室内（殿堂）、平地（广场） | 潜行（夜）/ 易容 / 身份；上殿：qg4 或 qg3 + 借壁（宫殿屋脊 `Δh` 4） | 明末北京皇城（原著）；袁承志入宫情节细节（待考） | 与鹿鼎紫禁城共用美术资源（年代变体） |
| 北京城墙 | `rg_07_beijing` | 城墙、屋顶、火焰（城破火起） | 主线攻城（09）；支 qg3 城楼 | 李自成破北京（原著） | 火场地形与撤离 |

### 9.8 鹿鼎记（上限：主 qg2 / 支 qg3 / 隐 qg4，≤ 1 处）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 紫禁城屋脊 | `rg_08_zijin` | 宫殿屋脊、室内（上书房、尚膳监）、平地（御花园、假山）、宫墙 | 身份：小太监 → 御前侍卫（`status`）、腰牌（`key`）、口才；时辰：沐王府夜袭；主 qg2：屋顶追逐；支 qg3：上殿（qg3 + 借壁）；隐 qg4：神行百变"屋脊飞渡"（本书界唯一 qg4，G5 例外） | 韦小宝冒名太监入宫、擒鳌拜、沐王府夜闯皇宫（原著） | 身份与口才门禁为主（G10 低武 ×1.5） |
| 神龙岛 | `rg_08_shenlong` | 蛇窟、密林、毒沼（原创扩展）、峭壁、室内（神龙教大厅）、大江湖面（海）、船甲板 | 船（渡海）；蛇窟：雄黄/驭兽/神龙教身份（白龙使）；口才：挑动教众内乱 → 洪安通失去"宝训"群体增益（02 §7.3 N2） | 神龙教据神龙岛、岛上多蛇、韦小宝受封白龙使、豹胎易筋丸（原著）；雄黄驱蛇细节（待考） | 洪安通 Boss 场地：蛇窟 + 大厅（Boss 阶段召唤蛇群，09） |
| 五台山清凉寺 | `rg_08_wutai` | 台阶（山道）、屋顶（寺）、室内、雪地（冬季，待考） | 身份：奉旨出家（`status`）；时辰；支 qg2：寺顶 | 顺治出家于五台山清凉寺、韦小宝奉康熙之命前往（原著） | 护驾战中的屋顶与台阶高差 |
| 雅克萨 | `rg_08_yakesa` | 城墙（木城）、雪地、冰面、深雪 | 主线攻城战；"泼水成冰"的攻城互动（`freeze` 作用于城墙外侧，原创扩展） | 雅克萨之战（原著）；以水冻城的情节（待考） | 冬季战场，冰面滑行与击退 |
| 扬州丽春院 | `rg_08_yangzhou` | 室内、屋顶、平地（街巷）、深水（运河） | 开局区域：qg2 奖励门禁（G8：携鞋者开局即 qg2）；口才、赌局（`speech`） | 韦小宝出身扬州丽春院（原著） | 低武开局：先学会说话，再学会轻功 |

### 9.9 连城诀（上限：主 qg2 / 支 qg3 / 隐 qg3）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 荆州大牢 | `rg_09_laoyu` | 室内（牢房）、高墙（牢墙 2 级）、屋顶（荆州城）、平地 | 主：越狱（剧情 + 钥匙或 `formation` 开锁）；主 qg2：翻 2 级牢墙；视线互动：牢窗望见知府楼窗台（§5.6） | 狄云与丁典同囚、丁典日日望窗台花盆、神照经（原著） | 狱中生存（02 §7.2）；视线即剧情 |
| 雪谷 | `rg_09_xuegu` | 深雪、雪地、峭壁、冰面、洞窟（避寒山洞）、雪崩坡 | 季节门禁：雪崩封谷，开春雪融方可出谷（§8.5）；支 qg3：攀出谷外取物（不改变剧情，原创扩展）；血刀老祖战：深雪 + 雪崩坡（大声招式触发雪崩，原创扩展） | 狄云、水笙与血刀老祖困于雪谷一冬（原著） | 深雪地形的战斗主场 |
| 天宁寺 | `rg_09_tianning` | 室内（大殿、佛像）、屋顶、平地（寺院） | 谜题：唐诗剑谱密码 → 宝藏所在（`check art` 或 `lore`）；支 qg2 殿顶 | 连城宝藏藏于天宁寺佛像（原著） | 解谜主线的终点 |
| 万家夹墙 | `rg_09_wanjia` | 室内、暗室（夹墙）、屋顶、高墙 | 夜潜；暗室：`formation ≥ T(g)` 识破；口才（套话） | 万家旧宅与夹墙藏尸之事（原著，细节待考） | 调查型门禁 |

### 9.10 白马啸西风（上限：主 qg2 / 支 qg3 / 隐 qg3）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 高昌迷宫 | `rg_10_gaochang` | 迷宫、沙地、流沙、机关地板、室内（殿堂壁画）、洞窟 | 地图（迷宫图，获取方式待考）；照明；`formation`；沙暴后积沙改道（§3.6） | 高昌古国迷宫、宝藏只是中原典籍器物（原著） | 迷宫门禁的主场；"宝藏虚空"的主题落点 |
| 戈壁大漠 | `rg_10_gebi` | 沙地、碎石（戈壁）、流沙、荆棘（骆驼刺）、草地（绿洲） | 坐骑：李文秀的白马（原著）/ 骆驼；水源（体力与补给点，§4.4 B5）；沙暴；支 qg3：岩山眺望点 | 回疆戈壁、白马（原著） | 坐骑门禁；流沙识破（`lore ≥ 40`） |
| 哈萨克草原 | `rg_10_caoyuan` | 草地（草原）、浅水（河）、平地（部落营地，帐篷为室内） | 人情：部落好感（12）；坐骑 | 哈萨克部落、苏普与阿曼（原著） | 人情门禁（低武"每幕 ≥ 2 个非战斗解"） |

### 9.11 鸳鸯刀（上限：主 qg2 / 支 qg3 / 隐 qg3）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 官道驿站 | `rg_11_guandao` | 平地（官道）、室内（驿站、客栈）、屋顶、碎石（山道） | 时辰：夜间劫镖；身份：镖局（`status`）；口才；支 qg2 客栈屋顶（G8） | 威信镖局护送、群雄夺刀（原著） | 喜剧式的夺刀事件链 |
| 萧府 | `rg_11_xiaofu` | 室内、庭院（平地、花丛）、屋顶、高墙 | 时辰：萧府喜事当晚（待考：寿宴/婚宴）；身份：宾客；夜潜 | 萧半和府上群侠聚会、身世揭晓（原著；身世细节待考） | "仁者无敌"之谜的揭晓地 |
| 山林劫道 | `rg_11_shanlin` | 密林、竹林（原创扩展）、荆棘、树梢 | 支 qg3：树梢伏击点；太岳四侠拦路（盖一鸣"八步赶蟾"彩蛋，§4.6） | 太岳四侠（原著）；绰号全称（待考） | 低武书界的轻功小彩蛋 |

### 9.12 书剑恩仇录（上限：主 qg3 / 支 qg4 / 隐 qg4）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 天山玉峰秘洞 | `rg_12_yufeng` | 雪地、冰面、峭壁（玉峰，三段）、洞窟（秘洞） | 主 qg3：攀玉峰（替代：狼群追逼的剧情演出，一次性）；狼群：驭兽或火把 | 陈家洛与香香公主于玉峰秘洞得庄子遗文，悟庖丁解牛掌（原著）；避狼登峰细节（待考） | 庖丁解牛掌获取 |
| 回疆大漠·迷城 | `rg_12_huijiang` | 沙地、流沙、迷宫（迷城，复用 `tr_migong`）、碎石、草地（绿洲）、急流（原创扩展） | 坐骑/骆驼；霍青桐部（身份/好感）；迷城：地图或 `formation`；狼群：火 | 回疆大漠、迷城与狼群（原著）；迷城内部结构（待考） | 迷宫与狼群的组合门禁 |
| 杭州六和塔 | `rg_12_liuhe` | 室内（塔内分层）、屋顶（塔檐）、大江湖面（钱塘江） | 主 qg2：逐层攀檐；支 qg3：快速路线；身份：红花会 | 红花会将乾隆囚于六和塔（原著，细节待考） | 塔的分段地图（§5.1） |
| 海宁观潮 | `rg_12_haining` | 平地（海塘）、大江湖面（钱塘江）、急流（潮头） | 时辰：农历八月十八前后大潮（§8.5）；潮头为危险：海塘上的单位每环境 tick 受潮水击退 1 格（落水），qg4 免 | 乾隆海宁观潮、身世之谜（原著） | 时辰门禁 + 动态危险地形 |
| 铁胆庄 | `rg_12_tiedan` | 室内、暗室（地窖）、屋顶、高墙 | 口才（套话）/ 物品诱惑（千里镜）——道德抉择支线 | 文泰来藏于铁胆庄、周英杰贪千里镜泄密（原著） | 非战斗门禁与品德（03 §8.3） |

### 9.13 飞狐外传（上限：主 qg3 / 支 qg4 / 隐 qg4）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 商家堡铁厅 | `rg_13_shangjia` | 室内（铁厅：`device` 铁门 + 火焰地形升温）、高墙、屋顶、平地（庭院） | 时辰：雨夜群聚（待考）；铁厅脱困：`strength` 破门、或支 qg3 攀梁出天窗（原创扩展）、或内应开门 | 商家堡与铁厅困敌火烤之事（原著梗概，细节待考） | 火焰地形的封闭空间战 |
| 药王谷 | `rg_13_yaowang` | 花丛（毒花）、毒沼、密林（瘴林）、室内（药庐） | 医毒：`antidote ≥ T(g)` 配辟瘴丹，或程灵素同行（向导）；七心海棠（06 `bf_qixin`）为采集物 | 毒手药王门下程灵素、七心海棠（原著） | 毒地形群的主场 |
| 佛山北帝庙 | `rg_13_foshan` | 室内（庙）、屋顶、平地（街巷） | 主线（追索凤天南）；支 qg2：屋顶追逐 | 胡斐为钟阿四一家追杀凤天南（原著） | 义愤主线的追逐战 |
| 北京·掌门人大会 | `rg_13_beijing` | 室内（福康安府）、屋顶、高墙、庭院 | 请柬（`key`/`status`）；易容；夜潜 | 福康安召开天下掌门人大会、胡斐搅局（原著） | 身份门禁 + 屋顶潜入 |

### 9.14 雪山飞狐（上限：主 qg3 / 支 qg4 / 隐 qg4）

| 地点 | 区域 | 地形构成 | 门禁 | 原著锚与标注 | 玩法要点 |
|---|---|---|---|---|---|
| 玉笔峰山庄 | `rg_14_yubi` | 峭壁（极高，分段）、雪地、深雪、室内（杜家山庄）、悬崖边、吊篮（`device`） | 主：吊篮（山庄仆役操作）；绳断被困后：支 qg4 四段攀崖（每段 4 级）或剧情；回忆关卡（剧情） | 玉笔峰杜家山庄、众人一日之间追述往事（原著）；上下山方式与绳断情节（待考） | 终章"封闭山庄"结构 |
| 闯王宝藏冰洞 | `rg_14_baozang` | 冰窟、冰面、洞窟、机关（原创扩展） | 钥匙/地图（开启方式待考）；冰窟寒气；贪念者被困（剧情） | 闯王宝藏、寻宝者之贪（原著梗概） | 寒冷地形 + 道德主题 |
| 雪峰崖顶 | `rg_14_yafeng` | 悬崖边、峭壁、雪地（窄崖） | 主线终战：胡斐与苗人凤（09 Boss）；窄崖击退坠崖风险；最终"劈与不劈"抉择（13） | 胡斐与苗人凤崖上决斗，刀举未落，结局开放（原著） | 地形把"抉择"压到一格之间：临渊一搏 `Z7.dealt +5%` 与坠崖风险并存 |

### 9.15 终局·天书守卷人战场（给 design/13 §7.7）

| 卷 | 场景（13） | 地形构成（本文 ID） | 布局要点（20×20 内） | 地形机制 |
|---|---|---|---|---|
| 卷一 `fin_j1` | 雁门关 | `tr_chengqiang`（关墙 h5）、`tr_shinei`（城门洞，宽 2、顶 3）、`tr_xuanya` + `tr_shengu`（断崖）、`tr_suishi`、`tr_xuedi` | 关墙占北侧 20×3，城门洞居中；南侧 4 格宽断崖带 | 断崖击退 → 坠崖（守卷人免疫，停于边缘受撞击）；垛口遮蔽 |
| 卷二 `fin_j2` | 华山绝顶 → 襄阳城头 | 华山：`tr_qiaobi`（h6–8 台地）、`tr_zhandao`（窄道）、`tr_xuanya`、`tr_xuedi`；襄阳：`tr_chengqiang`、`tr_gaoqiang`、`tr_wuding`、`tst_youzi`（火油格 6 处） | 华山为三层台地以窄道相连；翻面后为宽 3 的城头墙道与城楼 | 窄道单行、侧推坠落；火油格可引燃（§7.5.1） |
| 卷三 `fin_j3` | 光明顶 → 黑木崖 → 侠客岛石室 | 光明顶：`tr_pingdi`（高台 h4）、`tr_taijie`、`tr_huoyan`（火坛 4 格）；黑木崖：`tr_xuanya`、`tr_qiaobi`、`tr_tiesuoqiao`（索道）；石室：`tr_dongku`、`tr_shibi`（石壁格 6 处） | 高台四面台阶；两崖以两条索桥相连；石室六壁环列 | 火坛热辐射；索桥摇晃与侧推坠崖；石壁"读走"（13） |
| 卷四 `fin_j4` | 金蛇洞 → 神龙岛 → 雪谷 | 金蛇洞：`tr_dongku`（暗）、`tr_jiguan`（暗格 4 处）、`tr_sheku`；神龙岛：`tr_sheku`、`tr_milin`、`tr_pingdi`（祭坛 h2）；雪谷：`tr_xuedi`、`tr_shenxue`、`tr_bingmian` | 洞中视野 3（需照明）；祭坛居中；雪谷中央冰面 5×5 | 机关、蛇毒、冰面滑行 |
| 卷五 `fin_j5` | 高昌迷宫 → 回疆大漠 → 药王谷 | 迷宫：`tr_migong`（迷墙）；大漠：`tr_shadi`、`tr_liusha`（流沙 8 处，已识破）；药王谷：`tr_huacong`（毒花）、`tr_duzhao`、`tst_duwu` | 迷宫走廊宽 2；大漠开阔；毒沼成环 | 流沙陷落、毒雾漂移（"七心海棠"毒雾由 13 机制叠加） |
| 终卷 `fin_j6` | 玉笔峰 → 书海白页 | 玉笔峰：`tr_xuedi`、`tr_bingmian`（冰崖）、`tr_dumuqiao`（悬空石梁，石质变体）、`tr_xuanya`；书海白页：`tr_pingdi`（白页变体）+ 四周 `tr_liubai` | 两崖以 6 格石梁相连；白页 14×14 居中，外圈留白 | 石梁窄道；**留白**：被击退出边缘者离场 1 回合（§3.7） |

> 终局不受天道压制（基准 §2），地形品阶取定值 12（地形 Buff 仍走 06 的免疫与抵抗）。

---

## 10. 平衡约束、数据校验与测试用例

### 10.1 平衡约束

| 项 | 约束 | 理由 |
|---|---|---|
| 地形常驻属性修正（`attr:* pct`） | 单格合计 −50% ~ +10%（落水的招架 −50% 为下限实例） | 地形是"处境"，不应比 Buff 更强 |
| Z7 地形项 | 合计钳制 ±30%（§5.5） | 与方位、高差分开相乘 |
| 移动点 | 1–4 或 ∞ | 保证 `mov` 4–5 的单位每回合至少能动 1 格 |
| 地形 `onStay` 伤害 | 单格每回合 ≤ 4.5% `hpMax`（天阶灼烧上限实例 `1.2% × 3.5 = 4.2%`），计入 06 的 DOT 合计上限 12% | 地形伤害是压力而非处决 |
| 坠落 | 单次 ≤ 40% `hpMax`（虚空坠崖另论）；Boss ×0.25、精英 ×0.5；Boss 免疫坠崖 | 防"推下悬崖秒 Boss" |
| 危险格密度 | 普通战场可触发 `onStay` 伤害的格 ≤ 25%；Boss 场地可至 50% 且须有安全格路径 | 避免"无处立足" |
| 轻功武学特技 | `actionBonus` 合计 ≤ +40；`staMul ≥ 0.5`；`speedMul ≤ 1.3`；`mov` 加成计入 06 `fam_move` 上限 +3 | 特技是方向性优势，不替代境界 |
| 门禁 | §6.4 G1–G12 与 §6.5 预算 | 节奏 |
| 临时轻功加值 | `bf_shenqing` 等 flat ≤ +40（06 `fam_move`） | 丹药至多"跨一阶" |

### 10.2 构建期校验（Zod + 自定义规则，tech/04/05 实现）

| # | 规则 | 级别 |
|---|---|---|
| V1 | `id` 匹配 `^tr_[a-z0-9_]+$`、`^tst_[a-z0-9_]+$`、`^gate_\d{2}_[a-z0-9_]+$`，全局唯一 | 错误 |
| V2 | `TerrainDef` 必填字段齐全；`visual.tell` 非空（T2） | 错误 |
| V3 | 每种地形与 `tr_pingdi` 至少在 `moveCost`/`pass`/`combat`/`onEnter`/`onStay`/`interact`/`los` 之一上不同（T1） | 错误 |
| V4 | `onEnter`/`onStay` 引用的 Buff ID 存在于 06 目录（本文提案的 `bf_luoshui` `bf_xianluo` `bf_shishen` 在 06 采纳前以占位通过并告警） | 错误 / 告警 |
| V5 | `combat` 记法可解析为 §2.2 的 Mod；属性 ID ∈ 基准 §6 | 错误 |
| V6 | 定值品阶落在所引 Buff 的 `gradeRange` 内（情花丛 8 ∈ 情花毒 8–9） | 错误 |
| V7 | `chapters` ⊆ 基准 §2 书界 ID；`origin: canon/canonExpanded` 必须有 `canonRef`；含"待考"进入考据清单 | 错误 / 告警 |
| V8 | 轻功武学 `movement` 块：`actionBonus` 键 ∈ §4.3 动作 ID，合计 ≤ 40；`specials` ∈ 枚举 | 错误 |
| V9 | 地图门禁校验 V-G1–V-G8（§6.7） | 见 §6.7 |
| V10 | 每个带 `fallTarget` 的虚空格：目标区域存在，且目标区域存在境界 ≤ 本书界主线上限的出口 | 错误 |

### 10.3 测试用例（玩法核心单元测试，期望值精确）

| # | 场景 | 输入 | 期望 |
|---|---|---|---|
| T1 | 纵跃上屋 | `jump 2`，相邻屋顶 `Δh 2`，qg2 | 合法；移动点 `1 + ⌈2/2⌉ = 2`；体力 8 × 折扣 |
| T2 | 跨沟 + 上跃 | `jump 3`：沟宽 3、落点高 1 / 高 2 | 前者合法（`3 + 1 ≤ 4`）；后者非法（`3 + 2 > 4`） |
| T3 | 峭壁资格 | 战斗中 qg2、`jump 4`（flat +2），峭壁 `Δh 3` | 非法（Q3：`qgTier < 3`）；qg3、`jump 3` → 合法，移动点 4，体力 15 × 折扣 |
| T4 | 坠落伤害 | §5.3 例（`hpMax` 6,000、`qinggong` 100、`jump` 3、被击退落 9 级到碎石） | 1,512；骨伤概率 60%、品阶 8；眩晕 1 |
| T5 | 主动下跳上限 | `jump 1`：落差 6 / 7 | 6：允许，`excess 3` → `fallPct 18%`；7：UI 禁止 |
| T6 | 踏水连续格 | qg3：连续 4 格深水 | 路径非法；3 格深水 + 浅水落脚合法 |
| T7 | 踩水 | qg3、`qinggong` 90（无折扣），回合末停在深水，体力 5 | 付不起 6 → 落水（`bf_luoshui`） |
| T8 | 火势蔓延概率 | 草地燃烧，东风 2 级 | 东 0.80、西 0.08、南北 0.40；同种子两次运行结果一致 |
| T9 | 冻结时长 | 寒系招式 g7 冻浅水 | `tst_bingfeng` 4 tick；格内涉水者判定 `bf_dingshen` 1 + `bf_hanqi` 1 |
| T10 | 薄冰破裂 | A、B 依次进入同一薄冰格（均无负重）；C（qg4）进入另一薄冰格 | A 后计数 1；B 进入计数 2 → 破裂，B 落水；C 计数保持 0 |
| T11 | 视线 | 平地两端之间一格 3 级墙 / 2 级墙；两格竹林 | 阻断 / 可见；暗器阻断、剑气可打且命中 −20 |
| T12 | 情境轻功 | `qinggong` 100 / 110，装配水上漂 10 重（`rapidswalk +30`） | 130 → 不能踏急流；140 → 可以 |
| T13 | 地形品阶 | 区域 `gMain` 3，毒沼 | 中毒品阶 4；每层 `0.8% × 1.40 = 1.12%` `hpMax` |
| T14 | 冰面滑行 | 向东走上冰面，东侧仍为冰面且空；再测东侧被占 | 滑 1 格（未付刹步）；被占则原地停下，不撞击 |
| T15 | 带人次数 | 门禁 qg3，队友 `qinggong` 150 / 200 | 1 次（`1 + ⌊10/30⌋`）/ 3 次（`min(3, 1 + ⌊60/30⌋)`） |
| T16 | 环境时钟 | `spd 100`、`CT0 500` | 第 5 tick 首次环境行动，此后每 10 tick 一次 |
| T17 | 击退入水解灼烧 | 灼烧中的单位被击退入深水，水性 1 | 灼烧移除；`bf_luoshui`（`mov` 2）、`bf_shishen` 2 回合 |
| T18 | 坠崖 | 精英被推入虚空；Boss 被推向虚空 | 精英视为击败、经验与掉落 ×0.5；Boss 停在边缘并受撞击 |

---

## 11. 本文新增术语与 ID

| 术语 / ID | 类型 | 定义 | 章节 |
|---|---|---|---|
| 地形 ID（48） | `tr_*` | 地面植被：`tr_pingdi` `tr_caodi` `tr_huacong` `tr_zhulin` `tr_milin` `tr_jingji` `tr_suishi` `tr_shadi` `tr_liusha` `tr_nizhao` `tr_duzhao` `tr_jiaotu` `tr_taijie`；水域：`tr_qianshui` `tr_shenshui`（基准已有示例） `tr_jiliu` `tr_pubu` `tr_dajiang`；冰雪：`tr_bingmian` `tr_baobing` `tr_xuedi` `tr_shenxue` `tr_bingku`；高差险地：`tr_qiaobi` `tr_xuanya` `tr_shengu` `tr_wuding` `tr_gaoqiang` `tr_shushao` `tr_tiesuoqiao` `tr_dumuqiao` `tr_zhandao` `tr_yunhaizhandao`；建筑：`tr_chengqiang` `tr_gongdianwuji` `tr_chuanjiaban` `tr_shinei` `tr_dongku`；奇门机关：`tr_shizhen` `tr_jiguan` `tr_mushi` `tr_migong` `tr_shibi`；危险特有：`tr_huoyan` `tr_rongyan` `tr_qinghuacong` `tr_sheku` `tr_liubai`（终局） | §3 |
| 地表状态（10） | `tst_*`（新前缀） | `tst_ranshao` 燃烧、`tst_yanwu` 烟雾、`tst_bingfeng` 冰封、`tst_nining` 泥泞、`tst_jixue` 积雪、`tst_shihua` 湿滑、`tst_zuji` 足迹、`tst_youzi` 油渍、`tst_liewen` 裂纹、`tst_duwu` 毒雾 | §2.4 |
| 地形标签 | `TerrainTag` 枚举 | `water` `shallow` `deep` `flowing` `bigwater` `ice` `thinice` `snow` `deepsnow` `sand` `quicksand` `mud` `veg` `flammable` `canopy` `treetop` `rough` `thorn` `edge` `void` `roof` `wall` `bridge` `narrow` `sway` `indoor` `dark` `cold` `hot` `poison` `formation` `trap` `destructible` `slippery` `stealthy` | §2.3 |
| 数据结构 | TS/Zod | `TerrainDef` `TileRuntime` `MoveCost` `PassRule` `HeightRules` `Cover` `TerrainEffect` `Interaction` `ExploreRules` `WeatherRule` | §2 |
| 地形修正记法 | 记法 | `Z7.dealt` `Z7.taken` `cat:<类别> Z7.dealt` `knock +n` `noStance`；修饰来源 `terrain`（提案） | §2.2 |
| 地形品阶 | 公式 | `terrainGrade = clamp(1, 12, gMain(region) + adj)`；地形效果命中 `10 + 3T` | §2.5 |
| 通行模式 | `moveMode` 枚举 | `walk` `wade` `swim` `waterwalk` `climb` `treetop` `glide` `boat` | §1.2 |
| 情境轻功 | `qgAction(a)`、`actionBonus` | 动作判定用轻功值 = `qinggong + Σ actionBonus`（≤ +40） | §4.1、§4.5 |
| 动作 ID（18） | 枚举 | `sprint` `scramble` `leap` `wallkick` `drop` `climb` `roofwalk` `waterwalk` `rapidswalk` `bigwaterwalk` `treetop` `trackless` `glide` `cloudwalk` `carry` `swim` `dive` `squeeze` | §4.3 |
| 派生量 | 公式 | `safeDrop = 2 + jump`、`safeDrop' = 1 + jump`、`climbMax`、`maxRun`（3/6/∞）、滑翔平移 | §4.2.2 |
| 攀低坎 / 借壁 / 踩水 / 刹步 / 抓索 | 规则 | qg0 上 1 级；qg3 上墙屋崖 +1；踏水者回合末体力；冰面止滑；铁索桥自救 | §4.2、§3 |
| 坠落 | 公式 | `fallPct = min(0.40, 0.03 + 0.05 × excess)`、`landMul`、`qgMul = max(0.5, 1 − qinggong/400)` | §5.3 |
| 坠崖 / 坠崖奇遇 | 规则、字段 `fallTarget` | 进入虚空格离场；首次坠入特定格转场谷底（每书界 ≤ 2 处，原创扩展） | §5.4 |
| 水性 | `swimLevel` 0–3（探索能力，提案进基准） | 游水、潜水、落水表现；主角默认 1 | §4.2.3 |
| 环境时钟 | `envTick` | `spd 100`、`CT0 500` 的虚拟行动者，段 N1–N6 | §7.4 |
| 门禁 | `gate_<NN>_<拼音>`（新前缀）、`GateExpr`、`kind` 18 种 | `qg` `key` `fame` `morality` `sect` `status` `time` `quest` `formation` `check` `swim` `beast` `mount` `boat` `light` `squeeze` `device` `strength` | §6.1–6.2 |
| 轻功门禁对象 | `QinggongGate`（tech/01 对象类的字段定义）、`gateIntent`、`intent`（`main`/`side`/`secret`/`hidden`）、`earliest`、`reveal` | 竖向转场、复合路线、意图声明 | §6.3 |
| 规则编号 | — | Q1–Q8（判定）、H1–H8（高度）、B1–B6（体力预算）、G1–G12（门禁节奏）、AF1–AF12（反挫败）、C1–C6（截取）、V-G1–V-G8（门禁校验）、V1–V10、T1–T18 | 各节 |
| 轻功武学（建议，catalog 定稿） | `sk_*` | `sk_shuishangpiao` 水上漂、`sk_gumuqinggong` 古墓轻功、`sk_tiyunzong` 梯云纵、`sk_yiweidujiang` 一苇渡江、`sk_taxuewuhen` 踏雪无痕、`sk_yanzisanchaoshui` 燕子三抄水、`sk_jinyangong` 金雁功、`sk_shexinglifan` 蛇行狸翻、`sk_luoxuanjiuying` 螺旋九影、`sk_wanliduxing` 万里独行、`sk_dengpingdushui` 登萍渡水、`sk_babuganchan` 八步赶蟾、`sk_caoshangfei` 草上飞（基准已有：`sk_lingbo`、`sk_shenxing`） | §4.6 |
| 轻功武学扩展块 | `SkillDef.movement` | `actionBonus` `staMul` `speedMul` `moveCostByTag` `specials`（`squeeze` `glideEarly` `wallkickEarly` `noThorn` `trackless` `threeSkim` `shallowFree`） | §4.5 |
| Buff（**提案**，定义归 06） | `bf_*` | `bf_luoshui` 落水、`bf_xianluo` 陷落、`bf_shishen` 湿身 | §12 D-06 |
| 物品（**建议 ID**，定义归 10） | `it_*` / `eq_*` | `it_feizhua` 飞爪、`it_huozhezi` 火折子、`it_huoyou` 火油、`it_xionghuang` 雄黄、`it_qingshendan` 轻身丹、`it_zhentu_<拼音>` 阵图、`eq_shuikao` 水靠 | §3、§6 |
| 区域（**建议 ID**，定稿归 chapters） | `rg_*` | `rg_01_wuliang` `rg_01_langhuan` `rg_01_piaomiao` `rg_01_leigu` `rg_01_yanziwu` `rg_01_yanmen` `rg_01_dali`；`rg_02_taohua` `rg_02_tiezhang` `rg_02_niujia` `rg_02_taoyuan` `rg_02_huashan` `rg_02_menggu`；`rg_03_gumu` `rg_03_jueqing` `rg_03_xiangyang` `rg_03_jianzhong` `rg_03_chongyang`；`rg_04_binghuo` `rg_04_guangming` `rg_04_wudang` `rg_04_kunlun` `rg_04_wanan`；`rg_05_siguoya` `rg_05_heimuya` `rg_05_meizhuang` `rg_05_huiyan`；`rg_06_xiakedao` `rg_06_lingxiao` `rg_06_motian` `rg_06_changle`；`rg_07_jinshe` `rg_07_shiliang` `rg_07_zijin` `rg_07_beijing`；`rg_08_zijin` `rg_08_shenlong` `rg_08_wutai` `rg_08_yakesa` `rg_08_yangzhou`；`rg_09_laoyu` `rg_09_xuegu` `rg_09_tianning` `rg_09_wanjia`；`rg_10_gaochang` `rg_10_gebi` `rg_10_caoyuan`；`rg_11_guandao` `rg_11_xiaofu` `rg_11_shanlin`；`rg_12_yufeng` `rg_12_huijiang` `rg_12_liuhe` `rg_12_haining` `rg_12_tiedan`；`rg_13_shangjia` `rg_13_yaowang` `rg_13_foshan` `rg_13_beijing`；`rg_14_yubi` `rg_14_baozang` `rg_14_yafeng` | §9 |
| 门禁（示例） | `gate_02_zhongzhifeng` | 射雕铁掌峰中指峰三段攀崖 | §6.2 |
| 坐骑地形类 | 映射 | 道路、平原、山道、草原、沙地/沙漠、雪地、不可骑行 → 地形 ID（供 10 坐骑表） | §6.8 |
| 终局战场地形 | 表 | 六卷战场的地形构成与机制（供 13 §7.7）；终局地形品阶定值 12 | §9.15 |
| 系统玩法（原创扩展） | — | 沼气爆燃、倒木成桥、揭瓦窥听、冻熔岩成路、临渊一搏、乾坤大挪移接人、驱蛇噬敌、舍身一子 | §3、§9 |

---

## 12. 待决事项 / 依赖

### 12.1 对基准（`00-canon.md`）的修改提案（未改动基准文件）

| 编号 | 提案 | 理由 |
|---|---|---|
| P-01 | §12 ID 规范增加：地表状态 `tst_<拼音>`、门禁 `gate_<书界序号>_<拼音>` | 地形状态与门禁是需要被任务、地图、校验器引用的一等对象 |
| P-02 | §11 表补注三句：① "安全下跳 = 2 + 境界（战斗中为 2 + `jump`）"；② "攀峭壁自三阶起（一、二阶只能跃上普通高差，不能攀峭壁面）"；③ "四阶'不触发陷阱'仅指主动踏入，被击退落入照常触发" | 明确"跃"与"攀"的区别、避免击退机关的歧义 |
| P-03 | §6 增列探索能力 `swimLevel`（水性 0–3），注明主角默认 1 | 用户需求中的"水性"门禁需要稳定 ID；它不是轻功，也不宜塞进技艺 |
| P-04 | §8 战斗模型补一句："战场另有固定速度的环境行动者，驱动火势、水流、冰融等地形变化（design/09）" | 集气时间轴无全场回合，地形状态需要统一节拍；若 09 采纳，写入基准可免各文档另起时钟 |

### 12.2 依赖他文档的数值与接口（本文给出建议值，待对方确认）

| 编号 | 依赖文档 | 事项 | 本文当前采用 |
|---|---|---|---|
| D-01 | design/03 | 03 §4.5.1/§4.5.2 假设"天龙专精 = 凌波微步 10 重 → 207（qg5）"，但 05 §3.3 `gateCap` 使天阶在 Lv35 只到 8 重 → 约 189（qg4）；qg5 需再 +12 临时加值 | 天龙隐藏上限按 qg4，qg5 仅"专精 + 临时加值"（§4.7、§6.4 G4）；请 03 更新表格 |
| D-02 | design/03、06 | 疲惫阈值：03"恢复到 20% 前不能疾行、纵跃"与 06 `bf_pibei`"至 50%，不能通过轻功门禁" | 两阈值并存（§4.1 Q6）：20% 管动作、50% 管门禁；请两文档互注 |
| D-03 | design/03 | 修饰来源 `sourceType` 增加 `terrain`：地形常驻修正不计 Buff 数量、不可驱散、离格即失效 | §2.2、§7.3 |
| D-04 | design/04 | Z7 高差与地形项建议值与合成式（§5.5）；视线算法（§5.6）；坠落为真实伤害、护体先吸收（§5.3）；地形效果命中 `10 + 3T`（§2.5）；远程射程随高差 +1/+2 | 建议值 |
| D-05 | design/05 | ① `terrainFx` 采用 `tr_caodi`、`tr_qianshui`（已对齐）；② 招式增字段 `igniteChance`（缺省 60%）；③ 急流冻结需地阶以上寒系；④ `SkillDef.movement` 扩展块（§4.5）；⑤ 05 §4.5 撞击伤害（`collideDmg × 单段伤害`）与 06 `bf_jitui`（`hpMax × 2%×G` + 眩晕）口径不一，请 05/06 统一（本文只管坠落） | §4.5、§7.5 |
| D-06 | design/06 | ① 新增系统 Buff：`bf_luoshui` 落水（游水模式：`mov = 1 + swimLevel`（≤ 4）；闪避 −20%/−10%/0、招架 −50%/−25% 按水性；只能施放拳脚、短兵、内功招式；水性 0 每回合 −4% `hpMax`；离开深水即移除）、`bf_xianluo` 陷落（每层 `mov −1`、`jump` 视为 0；流沙满 3 层转定身并每回合 −3% `hpMax`；离格移除）、`bf_shishen` 湿身（`resHeat +10pp`、灼烧移除且 1 回合内不可被点燃；火器/药粉类暗器失效；寒冷天气每回合 30% 寒气 1 层；2 回合，探索中 1 时辰晾干）；② §3.1 地形品阶占位改为 `terrainGrade`（§2.5）；③ `onTerrainStay` 优先级 150；④ `bf_tengyue` 来源"八步赶蝉"建议改"八步赶蟾" | §2.5、§4.2.3、§7.3 |
| D-07 | design/09 | 环境时钟 `envTick`（§7.4）；地形 AI 评分（§7.6）；窄场模板（§7.1 C5）；坠崖单位处理（§5.4）；乾坤大挪移"接人"（§9.4）；Boss 场地召唤蛇群（§9.8）；移动为 4 邻接（与 05 曼哈顿射程一致） | 建议值 |
| D-08 | design/11 | 天气、风、气温、时辰映射、月相、季节枚举与区域累积量（§8.1）；探索中环境时钟 2 秒一跳；书灵"引路"回营地；渡口时辰表；坐骑地形倍率；雪崩、潮汐脚本；眺望点 | §8 |
| D-09 | design/10 | 飞爪、火折子、火油、雄黄、轻身丹（`bf_shenqing`，第 2 幕起常备）、阵图、水靠（水性 +1）、夜明珠、辟瘴丹、闭气丹；鞋的地形词条；`Q_load` 取值 | §3、§6.6 |
| D-10 | design/02 | 四阶以上门禁占比沿用 `(W − 40) × 0.5%`，但天龙定为 ≤ 10%（原式 22.5%），鹿鼎 ≤ 5%；02 §7.1 表"四阶以上轻功门禁占比"的高武区间需把天龙单列 | §6.4 G5 |
| D-11 | design/01 | 主角默认水性 1（现代人多会游泳），身份目录可改 0 或 2 | §4.2.3 |
| D-12 | design/05、catalog | 轻功数量规划"地 5 / 玄 12"→"地 6 / 玄 11"；§4.6 十五门轻功的定级、特技、原生书界；D-03 各书界最高原生轻功的具体武学 | §4.6 |
| D-13 | tech/01、tech/04、tech/05 | `QinggongGate` 属性与 `gateIntent`（§6.3）；L6 可达性校验 V-G1–V-G8；寻路状态 `(格, 模式, 踏水计数)`；视线算法；`TileRuntime` 随场景存档 | §6.3、§6.7、§7.2 |
| D-14 | tech/07 | 地形材质 = 48 地形（基础）+ 书界变体 + 10 种地表状态贴花；可读性硬要求：深/浅水、薄/厚冰、流沙识破高亮、裂纹贴花；脚步音按地形族约 25 类 | §2.1、§3 |
| D-15 | design/13 | 低难度：探索坠落伤害 ×0.5、"书灵指点"每书界 3 次（AF12）；坠崖奇遇与改命线的关系 | §6.6 |
| D-16 | design/14 | 门禁图标与"尚差 N 点"、可达格五色、落差数字、单位"地形"标签、书灵"待解之处"手记 | §6.6、§7.2 |
| D-17 | chapters/* | §9 地标、区域 ID 与门禁为建议；§6.5.1 门禁预算；坠崖奇遇 ≤ 2 处/书界；天龙凌波微步是否作为 `earlyException` | §6.5、§9 |
| D-18 | design/09 | 09 §8.9 与其待决 D-08-2 使用的蛇窟 ID `tr_shekou` 请改为本文定稿 `tr_sheku`（"窟"读 kū）；09 D-08-1 所列需求（通行消耗与轻功改善、可通行不可停留、遮蔽、视线顶面高度 = `h + canopy`、主动下跳上限 `safeDrop + 3`、冰面击退 +1）已在 §3、§4.2–4.3、§5.2–5.6 给出 | §3、§5 |
| D-19 | design/13 | 13 D13-10 所需终局六卷地形见 §9.15；新增终局专用地形 `tr_liubai` 留白（离场 1 回合，覆写 Boss 坠崖免疫）；终局地形品阶定值 12 | §3.7、§9.15 |
| D-20 | design/10 | 坐骑可骑行地形映射见 §6.8；10 D-01 指出"天中鞋"不存在——碧血、倚天的 qg5 余量据此标为极小（§4.7、§6.4 G4）；"雄黄驱蛇"物品请 10 确认（10 现有 `it_xionghuangjiu` 雄黄药酒用于蛊） | §6.8、§4.7 |

### 12.3 原著考据待核清单（需以三联/广州修订版逐字核对）

| 编号 | 书界 | 待核项 |
|---|---|---|
| K-01 | 天龙 | 无量玉璧"月下剑影"之说；段誉出琅嬛福地的路径；缥缈峰深涧与铁索；擂鼓山木屋"破壁而入"；阿朱阿碧驾舟接人的细节；萧远山雁门关崖壁刻字 |
| K-02 | 射雕 | 桃花岛渡海方式与桃林/竹林布局；铁掌峰"五指"与中指峰帮主墓穴；牛家村密室开关；渔樵耕读四关细节（逆流之舟、樵歌、巨石、书生问答）；华山论剑时节是否有雪；马钰夜授登崖；金雁功施展者 |
| K-03 | 神雕 | 古墓地下水道逃生；绝情谷鳄鱼潭；黄蓉布乱石阵；襄阳城外江面 |
| K-04 | 倚天 | 冰火岛白熊与造筏返航；光明顶石门的开启；万安寺宝塔层数与跃塔接人；螺旋九影施展者 |
| K-05 | 笑傲 | 思过崖后洞的发现方式；黑木崖吊篮段数；梅庄地牢钥匙持有者 |
| K-06 | 侠客 | 侠客岛石室数与诗句对应；凌霄城吊桥与深涧 |
| K-07 | 碧血 | 金蛇洞铁盒机关、遗刻、秘笈显字方法；袁承志入宫情节 |
| K-08 | 鹿鼎 | 神龙岛雄黄驱蛇；五台山冬雪；雅克萨以水冻城；韦小宝神行百变"只学逃命"的原文 |
| K-09 | 连城 | 万家夹墙藏尸之事 |
| K-10 | 白马 | 高昌迷宫地图的来源 |
| K-11 | 鸳鸯 | 萧府喜事性质与萧半和身世；盖一鸣绰号全称是否含"八步赶蟾""踏雪无痕""水上飞" |
| K-12 | 书剑 | 玉峰避狼登峰；迷城内部结构；六和塔囚乾隆 |
| K-13 | 飞狐 | 商家堡雨夜与铁厅火烤 |
| K-14 | 雪山 | 玉笔峰上下山方式与绳断；闯王宝藏开启方式 |
| K-15 | 通用 | 蛇行狸翻、螺旋九影在九阴真经中的原文；金雁功在射雕/神雕中的出处 |

### 12.4 开放问题（需作者拍板）

| 编号 | 问题 | 本文默认 |
|---|---|---|
| O-01 | 战斗移动 4 邻接还是 8 邻接 | 4 邻接（与 05 曼哈顿射程一致），09 最终定 |
| O-02 | 飞爪能否在战斗中使用 | 否，仅探索 |
| O-03 | 坠崖击杀的普通敌人是否遗失部分掉落 | 非任务物品遗失 50%（可调为 0） |
| O-04 | 渲染竖向压缩系数 | 0.6–0.8，tech/02 定 |
| O-05 | 天龙开局是否给"序章回报"装备以启用 G8 | 否（基准：天龙无携带）；G8 在天龙改为 qg1 奖励门禁 |
| O-06 | 探索中是否显示"隐藏"意图门禁的存在 | 不显示（`reveal: never`），由书灵在书眠前的"遗珠"提示中暗示 |

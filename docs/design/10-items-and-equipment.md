# 10 · 物品与装备（Items & Equipment）

> **版本**：v1.6（AR-24 兵器与暗器名录扩张，2026-10-01）；v1.5（AR-20 十一类物品名录与出图契约，2026-10-01）；v1.4（经脉落地终审，2026-09-29）；v1.3（经脉 Buff 载荷迁移，2026-09-27）；v1.2（跨文档同步、全局审计，2026-09-26）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。
> **版本**：v1.6（AR-23 食材／食品扩张，2026-10-01）；v1.5（AR-20 十一类物品名录与出图契约，2026-10-01）；v1.4（经脉落地终审，2026-09-29）；v1.3（经脉 Buff 载荷迁移，2026-09-27）；v1.2（跨文档同步、全局审计，2026-09-26）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。
> **归属**（基准 §18）：装备栏、物品、神兵、锻造、丹药——物品分类与数据结构、装备栏与兵器、品阶→装备数值、词条、神兵宝甲与名器、装备成长（强化/工艺/铭刻/淬毒/锻造）、书眠携带与外来压制对装备的影响、丹药与消耗品、菜肴、秘籍与残页、背包仓库、价格锚点。
> **上游**：`00-canon.md`（§3 境界规则、§4 品阶、§6 属性 ID、§7 武功与兵器类别、§8 战斗模型、§9 乘区、§10 Buff、§12 ID、§13 天级武学、§14 天级神兵宝甲、§16 改编原则、§20 装配栏与装备栏）。
> **引用而不重定义**：外来/本土判定 `nativeTo`、有效品阶 `effGrade`、器合、藏史、史印/史笺、天材骰、掉落品阶分布 → `design/02-timeline-and-world-tiers.md`；属性形态与修饰（`flat`/`flatLv`/`pct`/`pp`）、等级曲线 `ATK_LV`/`DEF_LV`/`HP_LV`、`STD(L)`、技艺门槛 `T(g)`/`gMax`、买卖系数 `buyMul`/`sellMul` → `design/03-attributes.md`；伤害公式与乘区 Z0–Z10 → `design/04-damage-formula.md`；武学字段 `weaponReq`/`kinds`/`Mod_armed`、秘籍阅读天数、残页页数、`sxpGrant` 接口 → `design/05-martial-arts-system.md`；全部 Buff 定义（`bf_*`）、品阶对抗 ρ、族上限、驱散类型 → `design/06-buff-system.md`；套装目录、成员、档位与效果 → `design/07-set-system.md`；地形与轻功门禁、飞爪探索入口 → `design/08-terrain-and-qinggong.md`；六角格物品行动、范围、缴械拾取流程、AI → `design/09-combat-system.md`；统一大地图、时代图层、旅行与客栈休息 → `design/11`、`design/19`；任务、关系与生活技能（含烹饪）→ `design/12`；天书之力与难度模式 → `design/13`；界面 → `design/14`；穴道、经脉、周天、冲穴 → `design/15`；资源、家丁、营生与收入 → `design/16`；门派身份 → `design/17`；NPC 认物与同伴物品 → `design/18`；跨年代传承源、残本、关键信物与校合条件 → `design/20`；图标生成 → `tech/07`。
> **标注约定**：**（原创扩展）**＝原著没有的内容；**（待考）**＝原著细节未逐字核对，需以三联/广州修订版确认；**【建议值】**＝依赖他文档、本文先给出可用数值并在 §16 登记。原著出处一律只写"书名·人物/情节大意"，不写无把握的回目号。
> **v1.3 变更摘要**：按 `design/06` §8.14.3 将装备特效中的旧缠绕 / 封穴运行引用迁为带等级、来源、剩余自身行动与穴位选择的新经脉状态；原触发概率与预算折价不变。
> **v1.4 变更摘要（经脉落地终审，2026-09-29）**：为常长风墓碑登记太岳石碑手的物品侧 `exotic/misc` 兼容介质；把衙门武册、华辉遗谱、宝树旧稿拆成符合单一 `skill` 字段的 7 条秘籍定义，并冻结共享叙事载体的一次性成组取得事务。
> **经脉落地终审（2026-09-30）**：复核墓碑双侧兼容已闭合；登记康熙册三项谱本／残页与白马地上遗物，修正秘籍阅读式，收拢历史物品接口的已解决项与默认边界；终审返修逐条登记少林／五绝／逍遥 25 本秘籍与 5 种残页，回填 O16；第 3 次运行补齐大还丹正式配方，区分解锁 40 与制作 68 的炼丹门槛；第 6 次运行登记家常饭正式实体与失败产物映射，并澄清生血／毒物仍缺的消费契约；第 7 次运行按协调意见删除重复交办 O18，家常饭统一引用 §9.4／§9.3.1，凭据／总账未决保留于任务报告第 6 节。
> **v1.5 变更摘要（AR-20，2026-10-01）**：补齐药物／补品／药材、食材／食品、秘籍、兵器、衣物、制式盔甲、内甲、护肩／披风／头饰、鞋、腰带、暗器十一类的天地玄黄投影名录；新增 `equip-slots.v2` 三槽迁移、官甲违法暴露、药材年限、冲穴药物和暗器命中／毒接口。名录只作本文定义的机器可读出图投影，不成为第二规则源。
> **v1.6 变更摘要（AR-24，2026-10-01）**：为剑／枪／棍／刀／奇门及暗器补齐黄下至玄上六档通用制式；天地档补投影原著名器与主要门派可持用法器。新增 ID 只在 §14.2 登记，名录的史料、形制与出图口径不改写 §3–§5 数值规则。

---

## 0. 本文范围与阅读指引

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1 | 设计目标、硬约束、核心术语 | 全体 |
| §2 | **物品分类总表**、ID 规则、通用与分类字段、运行时实例、TS 类型 | 程序、配表 |
| §3 | **装备栏十一格（`equip-slots.v2`）**：兼容原八格，新增内甲、护肩、披风；兵器装配、衣甲、官甲、暗器、缴械与缴获 | 程序、数值、战斗 |
| §4 | **品阶→装备数值**：主属性公式与速查表、等级封顶与推荐使用区间、词条数量、**词条库（78 条）**、部位权重、随机生成算法、合计上限 | 数值、配表 |
| §5 | **神兵与宝甲**：12 件天级逐件设计、完整 YAML、**47 件地/玄阶名器**、信物、套装成员同步、各书界产出 | 策划、配表 |
| §6 | **装备成长**：强化（精炼）、工艺（开锋/加衬/琢磨）、铭刻、淬毒、锻造/重铸/修复/拆解、器魄、材料体系 | 数值、程序 |
| §7 | **书眠携带与天道压制**：6 件细则、压制对主属性/词条/专属特效的规则、逐件计算、携带策略 | 策划、数值 |
| §8 | **药物、补品与药材**：使用规则、数值模板、年限分级、毒/迷/解药、永久增益、暗器弹药、炼丹 | 配表、数值 |
| §9 | **食材、食品与烹饪**：原料接口、膳食规则、黄蓉菜谱、酒与酒杯 | 策划、配表 |
| §10 | **秘籍与残页**：完整秘籍名录投影、阅读、悟性、残页拼合、原著奇书 | 策划、程序 |
| §11 | 任务物品、钥匙/信物、奇物、坐骑、收藏品（书画琴棋） | 策划 |
| §12 | **背包与仓库**：容量、堆叠、书眠去留、藏史接口、物品图鉴 | 程序、UI |
| §13 | **经济锚点**：价格公式与价格表、买卖修正、商店供货上限、收入锚点 | 数值、design/12 |
| §14 | 本文新增术语与 ID | 全体 |
| §15 | 数据校验规则与测试用例 | 程序 |
| §16 | 待决事项 / 依赖 | 全体 |

---

## 1. 设计目标与硬约束

### 1.1 设计目标

| # | 目标 | 落地手段 |
|---|---|---|
| E1 | **"带什么走"是每部书末尾最难的选择** | 6 件携带不限部位；强化、工艺、铭刻随装备跨书界保留（§6.1）；压制下专属特效分档保留（§7.3），使"天上倚天剑"与"本书界天下匕首"各有取舍 |
| E2 | **神兵是故事，不只是数字** | 12 件天级各有 1 条"核心特效"与 1 条"天阶特效"，并与原著武学联动（§5.2）；47 件名器逐件标明原著出处或**（原创扩展）**，不确定者标 **（待考）** 并列明待核书名、人物与情节 |
| E3 | **品阶有意义但不唯一** | 主属性随品阶系数 G 放大（§4.1）；词条数随大阶增加（§4.5）；但工艺与铭刻让中低品阶的"心爱之物"仍可用 |
| E4 | **装备不随等级"过期"得太快** | 主属性用 `flatLv`（随显示等级缩放），同一品阶在任何等级都保持同一相对强度（03 §4.1）；过时只由"更高品阶的可得性"决定（§4.3 推荐区间） |
| E5 | **开放世界有得逛、有得做** | 材料、配方、菜谱、收藏品、信物构成大量"非战斗收获"；低武书界的强力物品以固定掉落为主（02 §7.3 N5） |
| E6 | **个人游戏，不折磨** | 强化失败无降级、无碎裂，另有"稳炼"确定性选项（§6.2）；背包无重量、自动堆叠；书眠前集中提示将失去的物品 |
| E7 | **手机端可读** | 单件装备最多显示：主属性 ≤ 3 行、词条 ≤ 5 行、工艺 1 行、铭文 1 行、专属 ≤ 2 行；超出折叠（14） |
| E8 | **完全数据驱动、确定性** | 所有生成走种子流 `rng.stream('loot', sourceId)`；词条、特效均为数据（YAML + Zod），代码只实现规则类型（tech/01 §内容规范） |

### 1.2 硬约束（来自基准与上游，不得违反）

| 约束 | 出处 | 本文落实 |
|---|---|---|
| 品阶 1–12，名称与档位固定 | 基准 §4 | 物品一律 `grade: 1..12`；物品的品阶→数值映射由本文定义（§4、§8.2） |
| 装备栏原 8 格：`mainHand` `offHand` `head` `body` `hands` `waist` `feet` `accessory` | 基准 §20；AR-20 后发要求新增缺失槽位 | §3 保留八字段并以 `equip-slots.v2` 加 `innerBody` `shoulder` `cape`；迁移与基准提案见 §3.1.1、§16.3 |
| 书眠共同额度为“携带装备数 + 本书界新藏史装备数 ≤ 6”；天书永久且不占额度 | 基准 §3、§20（V11-R04） | §7.1、§12.3 |
| 外来压制只作用于外来武功与装备，下限黄下 | 基准 §3 | §7.2 |
| 金钱、普通物品、门派身份与活动同伴编组书眠清理；同伴史及传承匣窄例外见上游 | 基准 §3-6；design/18、20 | §12.3；不把活动编组清理写成同伴永久不能重逢 |
| 兵器类别 `sword` `blade` `staff` `spear` `whip` `exotic` `hidden` `unarmed`，装备与"破 X"共用 | 基准 §7 | §3.2 |
| 兵器武学只能使用与主武器类别匹配者；空手时兵器栏不可用 | 基准 §20；05 §6.2–6.3 | §3.2 |
| 天级神兵宝甲 12 件定稿；AR-20 又要求各类均有天级样本 | 基准 §14；AR-20 后发 | §5.1：原 12 件仍是唯一 `divine` 神兵；AR-20 的额外天级样本为固定具名 `catalogTian`，不享神兵通则、不进入随机/锻造/商店 |
| 天级装备只来自具名神兵的固定节点，随机池不产出天级装备；天材骰只出天级材料/丹药 | 02 §2.9 R2、§2.12 | §4.8、§6.8 |
| 精炼/镶嵌/附魔不改变 `nativeTo`（杜绝"精炼洗白"）；锻造物归锻造书界 | 02 §2.2 | §6.1（本文的"强化/工艺/铭刻"即 02 所说的"精炼/镶嵌/附魔"） |
| 先天只接受 `flat`；装备词条为 `equipAffix` 修饰器 | 03 §2.1、§11 | §4.6 |
| 数值类效果须标明作用层或乘区 | 基准 §9；06 §4.7 | §4.6 全部词条按 06 记法标注 |
| 自造与普通名录外装备上限地上（9）；强化不改变绝对品阶；AR-20 额外天级样本只可固定取得与修复 | 基准 §14（V11-R06）；AR-20 后发；03 §8.2 | §5.1、§6.1–§6.6 |

### 1.3 核心术语（本文使用）

| 术语 | ID / 字段 | 定义 |
|---|---|---|
| 物品定义 / 实例 | `ItemDef` / `ItemInstance` | 数据表中的模板 / 存档中的一份实物（§2.3、§2.5） |
| 装备实例 | `EquipInstance` | 装备的实物，带强化、词条、工艺、铭文、`nativeTo` 等（§2.5） |
| 绝对品阶 / 有效品阶 | `absGrade` / `effGrade` | 02 §2.3 定义；装备的 `effGrade` 为压制后品阶 |
| 使用品阶 | `gUse` | `min(effGrade, gCap(Ld))`：再经"等级封顶"后，**一切装备数值的计算品阶**（§4.3） |
| 等级封顶 | `gCap(Ld)` | 显示等级允许发挥的最高装备品阶（"力有不逮"，§4.3） |
| 主属性 | `main` | 部位固有、随 `flatLv` 缩放的攻防气血等（§4.1） |
| 固有属性 | `innate` | 兵器类别/奇门细类/部位自带的小额评级或抗性（§3.1） |
| 词条 | `affix`，`af_*` | 随机或固定附加的一行属性/效果（§4.5–4.6） |
| 品相 | `q` | 词条数值的品质系数 0.70–1.00（§4.5） |
| 专属特效 | `unique`，`ue_*` | 神兵/名器独有的规则效果，分"核心"与"天阶"（§5.1） |
| 神兵标记 | `divine` | 基准 §14 所列 12 件；02 §6.6 用于藏史侵蚀 |
| 强化（精炼） | `refine` | 主属性 +4%/级，上限随大阶（§6.2） |
| 工艺 | `temper` | 兵器"开锋"、护具"加衬"、佩饰"琢磨"：1 个由玩家挑选的工艺词条（§6.3） |
| 铭刻 | `inscription`，`ins_*` | 以书画技艺刻铭，1 条铭文（§6.4） |
| 淬毒 | `poisonCoat` | 以毒术给兵器/暗器附毒，3 场战斗（§6.5） |
| 膳食 | `meal` | 菜肴带来的"下 N 场战斗开场即得"的 Buff 包（§9.1） |
| 学识 | `knowledge` | 已学会的丹方、菜谱、锻造图谱、铭文；跨书界保留（§12.3） |
| 出图名录投影 | `items-*.md` | 本文 `ItemDef` 的七列机器可读投影；只承载 ID、名称、子类、品阶、出处、效果摘要和外观，不覆写本文规则 |
| 目录天级样本 | `catalogTian` | AR-20 新增而不在基准 12 神兵中的天级具名装备；固定、唯一、不可随机/锻造/商店，不得标 `divine` 或自动获得神兵护主 |
| 官甲违法暴露 | `lawProfile` | 制式盔甲的物品侧声明；身份与通缉状态机归 `design/11`、`design/12`，本文只发出穿戴暴露事实（§3.4.1） |

---

## 2. 物品分类总表与数据结构

### 2.1 物品大类总表

"跨书界"一列按基准 §3-6：**只有被选入 6 件携带（或经 02 §6.6 藏史）的装备**会随主角进入下一书界；其余物品一律留在本书界。"学识"（已学会的配方）与"物品图鉴"是主角自身的记忆，跨书界保留（§12.3）。

| 大类 | `kind` | 子类 `sub` | ID 形式 | 品阶 | 堆叠 | 跨书界 | 外来压制 | 可买卖 | 主要来源 | 使用场合 |
|---|---|---|---|---|---|---|---|---|---|---|
| 兵器 | `weapon` | 基准 §7 兵器类别：`sword` `blade` `staff` `spear` `whip` `exotic` `unarmed`（拳套/指虎） | `eq_<拼音>` | 1–12 | 1 | 携带/藏史 | ✅ | ✅（天级否） | 掉落、锻造、任务、商店 | 主手；单手者可作副手副兵器 |
| 衣物 / 护具 | `armor` | `head` `body` `innerBody` `hands` `shoulder` `cape` `waist` `feet`；`clothing` `officialArmor` `innerArmor` `headwear` `shoulder` `cape` `shoes` `belt` | `eq_<拼音>` | 1–12；新增天级目录样本按 `catalogTian` | 1 | 同上 | ✅ | ✅（官甲依法） | 固定节点、掉落、锻造、商店 | 对应部位；官甲见 §3.4.1 |
| 副手器 | `offhand` | `shield` 牌、`pouch` 暗器囊 | `eq_<拼音>` | 1–9 | 1 | 同上 | ✅ | ✅ | 同上 | 副手 |
| 名门暗器 | `hidden` | `needle` `dart` `ball` `awl` `bolt` `powder` `gun` `bow` | `eq_<拼音>` | 1–12；新增天级目录样本按 `catalogTian` | 1 | 同上 | ✅ | ❌ | 名器固定节点 | 副手（兼作暗器囊，自带弹药，§3.5） |
| 佩饰 | `accessory` | `pendant` 玉佩、`sachet` 香囊、`ring` 指环、`beads` 念珠、`gourd` 葫芦、`charm` 护符 | `eq_<拼音>` | 1–9 | 1 | 同上 | ✅ | ✅ | 同上 | 佩饰 |
| 暗器弹药 | `ammo` | 同名门暗器子类 | `it_<拼音>` | 1–9 | 99 | ❌ | — | ✅ | 商店、掉落、打造 | 装入暗器囊（§3.5） |
| 药物 | `pill` | `heal` 补血、`mp` 补气、`cure` 解毒疗伤、`boost` 临时属性、`revive` 复活 | `it_<拼音>` | 1–12 | 99（天级 9） | ❌ | — | ✅（天级否） | 药铺、掉落、炼丹、奇遇 | 战斗/战斗外（§8.1） |
| 补品 | `tonic` | `perm` 永久属性、`innerPower` 内力、`train` 修炼、`meridian` 经脉辅助 | `it_<拼音>` | 1–12 | 20（天级 9） | ❌（永久效果留在角色） | — | ✅（天级否） | 固定节点、炼丹、奇遇 | 战斗外静服（§8.1–8.5） |
| 药材 | `material` | `herb`；可带 `herbFamily` 与 `ageYears` | `it_<拼音>` | 1–12；年限映射见 §8.2.1 | 999 | ❌ | — | ✅（天材否） | 采集、药铺、奇遇 | 炼丹或生服（条目显式声明） |
| 毒药迷药 | `poison` | `poison` 毒、`drug` 迷药、`gas` 毒烟、`powder` 药粉 | `it_<拼音>` | 1–12 | 99 | ❌ | — | 黑市 | 配毒、掉落、奇遇 | 投掷、下药、淬毒（§8.4、§6.5） |
| 解药 | `antidote` | `generic` 通用、`specific` 专属 | `it_<拼音>` | 1–12 | 99 | ❌ | — | ✅（专属否） | 配药、任务 | 06 `antidote` / `special` 驱散 |
| 食材 | `material` | `ingredient`：`grain` `meat` `fish` `vegetable` `fruit` `spice` `rare` | `it_<拼音>` | 1–12 | 999 | ❌ | — | ✅（天材否） | 采集、狩猎、商店 | §9.4 配方输入 |
| 食品 / 干粮 | `food` | `ration` `snack` `preserved` | `it_<拼音>` | 1–12 | 20 | ❌ | — | ✅（天级否） | 商店、烹饪、任务 | 探索回体或即时效果 |
| 菜肴 | `dish` | `dish` 菜、`soup` 汤、`snack` 点心 | `it_<拼音>` | 1–10 | 20 | ❌ | — | ✅ | 烹饪、酒楼、任务 | 膳食（§9） |
| 酒 | `wine` | `wine` | `it_<拼音>` | 1–9 | 20 | ❌ | — | ✅ | 酒肆、任务 | 醉意（§9.3） |
| 材料 | `material` | `metal` 金、`fabric` 丝、`leather` 革、`wood` 木竹、`jade` 玉石、`herb` 药材、`toxin` 毒材、`beast` 兽材、`ingredient` 食材、`ink` 墨料 | `it_<拼音>` | 装备侧换算品阶 1–12；资源自身为天地玄黄 × 九品（一品最高），归 `design/16` | 999 | ❌ | — | ✅（天材否） | `design/16` 资源点、掉落、商店、拆解 | 锻造、强化、炼丹、烹饪、铭刻（§6.8） |
| 探索工具 | `tool` | `climb` 攀援、`light` 照明等 | `it_<拼音>` | 1–9 | 20 | ❌ | — | ✅ | 商店、制作、任务 | 只触发 `design/08` 探索交互；不得进入战斗物品行动 |
| 秘籍 | `manual` | `full` 全本、`partial` 残本、`copy` 抄本、`original` 原本 | `it_miji_<武功拼音>`（普通残本加 `_can`）；20 的传承三卷用 `frag_*` | = 武学绝对品阶；传承三卷按 20 §1.5 降阶 | 1 | 通常 ❌；20 明列的跨年代残本例外 | — | 黄/玄可；传承三卷不可 | 任务、门派、宝箱、拼合；传承调度 | 阅读学习（§10） |
| 残页 | `page` | — | `it_canye_<武功拼音>` | = 武学品阶 | 按武学占 1 格 | ❌ | — | 仅卖出 | 掉落 | 拼合/学习（§10.3） |
| 配方卷 | `recipe` | `forge` 图谱、`alchemy` 丹方、`poison` 毒方、`cook` 菜谱、`inscribe` 铭文帖 | `it_fang_<拼音>` | 1–12 | 1 | ❌（**学识**跨书界） | — | 部分 | 任务、NPC、宝箱 | 阅读后习得 `rc_*`（§12.3） |
| 任务物品 | `quest` | — | `it_<拼音>` | 无 | 1 | ❌ | — | ❌ | 任务 | 任务脚本；"要物"栏不占格 |
| 钥匙/信物 | `token` | `key` 钥匙、`token` 信物、`letter` 书信 | `it_<拼音>` | 无（展示用 1–12） | 1 | 通常 ❌；史笺及 20 明列的关键信物例外 | — | ❌ | 任务、剧情 | 开启、对话、身份（§11.2） |
| 奇物 | `curio` | `beast` 灵物、`vessel` 宝器、`plant` 奇草、`relic` 遗物 | `it_<拼音>` | 6–12 | 1 | ❌ | — | ❌ | 奇遇、Boss | 独特规则（§11.3） |
| 坐骑 | `mount` | `horse` `camel` `donkey` `bird` | `it_<拼音>` | 1–9 | 马厩 | ❌ | — | ✅（名驹否） | 马市、奇遇 | 旅行与探索（§11.4） |
| 收藏品 | `collectible` | `calligraphy` 书、`painting` 画、`score` 琴谱、`chessbook` 棋谱、`antique` 古玩 | `it_<拼音>` | 3–9（估值） | 1 | ❌（**藏品录**跨书界） | — | 部分 | 奇遇、任务、鉴宝 | 研读、馈赠、陈设（§11.5） |
| 系统物品 | `system` | 史印、史笺、器魄、天书 | `it_shiyin` `it_shijian_*`（02）`it_qipo`（02/本文 §6.7）`it_tianshu_NN`（13 已确认） | — | 1 | 史笺经藏史；天书永久 | — | ❌ | 系统 | 藏史、器魄、结局 |
| 货币 | —（钱包字段） | 银两 `silver`（1 两 = 1,000 文） | — | — | 钱包 | ❌ | — | — | 掉落、任务、出售 | 买卖、服务（§13） |

### 2.2 ID 与命名规则

| 对象 | 格式 | 例 | 说明 |
|---|---|---|---|
| 具名装备（神兵、名器） | `eq_<名称拼音>` | `eq_yitianjian` 倚天剑、`eq_junzijian` 君子剑 | 基准 §12 |
| 装备基底（随机/锻造模板） | `eq_<基底拼音>` | `eq_qinggangjian` 青钢剑、`eq_liuyedao` 柳叶刀 | 实例的品阶与词条另存；**`eq_bishou` 已被基准占用为韦小宝匕首**，通用匕首基底改名 `eq_duanbi` 短匕 |
| 普通物品 | `it_<拼音>` | `it_jiuhuayulu` 九花玉露丸 | 基准 §12 |
| 秘籍 / 残页 | `it_miji_<武功拼音>`（残本 `_can`）/ `it_canye_<武功拼音>` | `it_miji_tieshazhang`、`it_canye_luohanquan` | **确认** 05 §16.2 的建议规则 |
| 跨年代传承残本 | `frag_<来源或武功拼音>_<卷名拼音>` | `frag_yuenv_jianying` | Canon v1.2 §12；仅限 `design/20` §9 明列的 117 卷，物品定义见 §10.3.1 |
| 配方卷 / 配方学识 | `it_fang_<拼音>` / `rc_<拼音>` | `it_fang_jiuhuayulu` → `rc_jiuhuayulu` | 卷是物品，读后消失；`rc_*` 是学识记录 |
| 词条 | `af_<拼音>` | `af_fengrui` 锋锐 | 基准 v1.1 正式前缀（V11-04，§16.1 P-A） |
| 专属特效 | `ue_<装备拼音>_<n>` | `ue_yitianjian_1` 削铁如泥 | 同上 |
| 铭文 | `ins_<拼音>` | `ins_xiadazhe` 侠之大者 | 同上 |
| 天书（系统） | `it_tianshu_<NN>` | `it_tianshu_01`《天书·天龙》 | **已确认**：仅 01–14，见 `design/13` §4.1 T10 |

- 拼音全小写、无声调；同名冲突追加书界序号（基准 §12），如两书都有"铁胆"时写 `eq_tiedan12`。
- 实例唯一键 `uid` 为存档内单调递增整数，与 `id` 无关；同 ID 多实例允许（异时之器，02 §6.5），装备栏同 ID 只能装 1 件（`uniqueEquipped`）。

### 2.3 通用字段 `ItemDef`

| 字段 | 类型 | 必填 | 说明 | 例 |
|---|---|---|---|---|
| `id` | string | ✅ | §2.2 | `it_dahuandan` |
| `name` | string | ✅ | 中文名 | 大还丹 |
| `kind` / `sub` | enum | ✅ / 视类 | §2.1 | `pill` / `heal` |
| `grade` | 1–12 \| null | ✅ | 绝对品阶；任务物品/钥匙为 `null` | `9` |
| `gradeRange` | [int, int] | 模板必填 | 基底模板可出现的品阶 | `[1, 9]` |
| `stack` | int | ✅ | 堆叠上限；1 = 不堆叠 | `99` |
| `chapters` | chapterId[] \| `any` | ✅ | 可获得的书界；`any` = 通用 | `[ch04_yitian, ch05_xiaoao]` |
| `origin` | `canon` / `expanded` / `canonExpanded` | ✅ | 与 05/06 一致 | `canonExpanded` |
| `canonRef` | string | 原著物必填 | 原著出处大意；不确定须使用本文规定的考据标记并列出书名、人物/情节 | 《某书》·核对某人物取得该物的情节（按本文标注约定登记） |
| `price` | `auto` \| int（文）\| `null` | ✅ | `auto` 按 §13.1 公式；`null` 不可买卖（天级、任务、信物） | `auto` |
| `flags` | string[] | | `noCarry` `anchorLocked`（02）、`questBound`、`unique`（全局唯一实物）、`hiddenName`（未鉴定显示"无名 X"） | `[unique]` |
| `resourceRef` | `res_*` | | 对应 16 的生产资源；`material` 必填，具名可采集药物/毒物可选。只表示来源与估值，不替代本物品 ID | `res_yaocai_di5` |
| `catalogTian` | bool | AR-20 天级装备样本必填 | 非基准 12 神兵的天级固定样本；序列化时须同时 `flags:[unique]`、`price:null`，并禁止 `divine:true`；名录效果列以 `unique=true` 作投影简写 | `true` |
| `use` | `UseSpec` | 消耗品必填 | §2.4 | |
| `assets` | `{icon, model?, sfx?}` | ✅ | 逻辑素材键：`equip/<拼音>` → `ico_eq_<拼音>`；`item/<拼音>` → `ico_it_<拼音>`（tech/07 §5.6） | `{icon: item/dahuandan}` |
| `text` | `{desc, lore?, short?}` | ✅ | 说明模板可引用 `{v}`；`lore` 为图鉴文案 | |
| `codex` | `{group, order}` | | 物品图鉴分组（§12.5） | `{group: pill, order: 12}` |

### 2.4 分类专属字段

**装备 `EquipDef`（`kind` ∈ `weapon` `armor` `offhand` `hidden` `accessory`）**

| 字段 | 类型 | 必填 | 说明 | 例 |
|---|---|---|---|---|
| `slot` | `EquipSlot` | ✅ | 可装入的格；兵器为 `mainHand`（单手兵器另可入 `offHand`） | `mainHand` |
| `cat` | 基准 §7 兵器类别 | 兵器/副兵器/暗器必填 | 决定兵器武学可用性与"破 X"匹配 | `sword` |
| `exoticKind` | 05 §6.2 `kinds` | 奇门必填 | `brush` `fan` `wheel` `hook` `pestle` `qin` `flute` `dagger` `hammer` `axe` `token` `misc` | `token` |
| `hands` | `1` / `2` / `pair` | 兵器必填 | 单手、双手、成对（占主副两格、计 1 件，§3.3） | `1` |
| `tags` | string[] | | `heavy` 重兵、`soft` 软兵、`long` 长兵、`glove` 手套（取毒针）、`blunt` 钝器、`metal` 金属甲 | `[heavy]` |
| `armorWeight` | `light` / `medium` / `heavy` | 衣必填 | §3.4 | `medium` |
| `mainK` | number | | 主属性系数修正，默认 = 类别 `kA` × 标签修正（§3.2）；神兵不另加系数 | `0.65`（绣花针） |
| `innate` | `Mod[]` | | 覆写类别默认的固有属性 | |
| `fixedAffixes` | `{id, q}[]` | 名器/神兵 | 固定词条，不可重铸 | `[{id: af_fengrui, q: 1}]` |
| `affixRoll` | `{min, max}` | | 覆写随机词条数（默认 §4.5） | `{min: 0, max: 0}` |
| `uniques` | `UniqueDef[]` | 名器/神兵 | 专属特效，含 `core` 标记与压制分档（§5.1） | |
| `divine` | bool | | 基准 §14 所列 12 件 = `true` | `true` |
| `uniqueEquipped` | bool | | 装备栏不可同时装两件同 ID（02 §6.5）；名器与神兵默认 `true` | `true` |
| `reqs` | `{str?, agi?, wis?}` | | 属性需求（不足时"驾驭不住"，§4.3） | `{str: 70}` |
| `matFamily` | `metal` `fabric` `leather` `wood` `jade` | ✅ | 强化与拆解所用材料族（§6.8） | `metal` |
| `ammo` | `AmmoSpec` | 名门暗器必填 | `{kind, perBattle, mul, onHit?}`（§3.5） | |
| `setTags` | `set_*`[] | | 所属套装（本体归 07） | |
| `signature` | npcId | | 具名 NPC 专属兵器：战后不可缴获（§3.6） | `npc_duanyanqing` |
| `refineMax` | int | | 覆写强化上限（默认按大阶，§6.2） | |
| `lawProfile` | `{uniform,allowedIdentityTags[],violation,wantedIntent,normalGate}` | 制式盔甲必填 | 仅声明装备可见时的身份合法性与事件意图；通缉值、追捕和城门状态归 11/12 | `{uniform:true,...}` |
| `concealment` | `{coveredBy?:EquipSlot[],exposure}` | 官甲可选 | `exposure:visible` 才发违法暴露；是否被披风遮住由穿戴外观状态计算 | |
| `specialDefense` | `{thorns?,weaponZ4?,poisonResPp?,bleedImmuneGrade?}` | 内甲可选 | 软猬刺、刀枪减伤、抗毒等摘要；具体 Buff 必须引用 06 | |

**消耗品 `UseSpec`（`pill` `tonic` `poison` `antidote` `food` `dish` `wine` `ammo`）**

| 字段 | 类型 | 说明 | 例 |
|---|---|---|---|
| `context` | `battle` / `field` / `both` | 可用场合 | `both` |
| `action` | `consume` 服用、`throw` 投掷、`apply` 外敷、`eat` 进食、`drink` 饮、`load` 装填、`dose` 下药（战斗外对 NPC/饮食） | 战斗中均占用"行动"（基准 §8 物品行动）；`load` 除外（§3.5） | `consume` |
| `target` | `self` / `ally` / `enemy` / `area` | | `self` |
| `range` / `rangeTemplate` | int / 09 物品范围键 | 投掷与外敷用；只引用六角格语义，坐标枚举归 09；外敷默认 `range: 1` | `3` / 半径 1 邻接环 |
| `effects` | `Op[]` | 06 DSL 原语：`heal`、`restoreMp`、`applyBuff`、`dispel`、`immune`，以及本文物品原语 `healPct`、`mpPct`、`staPct`、`sxpGrant`、`sxpBuff`（05 §8.5）、`permStat`、`permMaxPct`、`revive`、`breakCap`、`meal`、`learn`、`unlock` | |
| `battleLimit` | `{perBattle, cooldown}` | 覆写默认限次（§8.1） | `{perBattle: 1}` |
| `fieldTime` | int（时辰） | 战斗外使用耗时（静服、外敷、研读） | `2` |
| `persistGrade` | bool | 施加的 Buff 品阶取物品品阶（默认 true，06 §3.1） | |
| `meridianAid` | `{rateBp, successBp, costReduceBp, hours, meridians?}` | 仅战斗外冲穴辅助；三项为非负整数 bp，`hours` 为正整数游戏小时，`meridians?` 为 15 的正式 `mer_*` 白名单；总上限与结算只见 15 §5.6 | `{rateBp:500, successBp:0, costReduceBp:0, hours:6}` |

`permStat` 的运行时参数仍为 `{stat: InnateId|'chosenInnate', value: int}`，`InnateId` 只取 `design/03` §2 的七项。七列名录中 `permStat=N` 是“玩家选定一项 +N”的简写；固定多属性可写 `permStat={str:1,con:1}`，内容编译器须按 `con,str,agi,wis,wil,luk,cha` 规范序展开为多个既有 `permStat` op。各值须为正整数，合计计入 §8.5 `permBudget`，任一项越界则整次使用回滚；未知键或重复键构建失败。此写法只扩展既有原语的名录投影，不新增效果字段。

**其他分类的专属字段**

| 类 | 字段 | 说明 |
|---|---|---|
| 材料 `material` | `family`、`resourceRef`（`design/16` 的资源 ID）、`materialGrade`（装备侧 1–12 换算值）、`rare`（天材）、`herbFamily?`、`ageYears?`、`ingredientKind?` | `material` 的 `resourceRef` 必填；具名药材按 §8.2.1 记录年限，食材按 §9.0 投入配方。资源阶品、资源点与库存仍归 `design/16` |
| 秘籍 `manual` | `skill`（`sk_*`）、`maxLayer`（全本 10、残本按条目）、`variant`（full/partial/copy/original）、`readMul`（阅读天数系数）、`attuneFor`（作为 02 印证载体） | §10.1 |
| 残页 `page` | `skill`、`pagesTotal`（= 05 §7.5 的 k） | 实例存页号集合 |
| 配方卷 `recipe` | `teaches: rc_*`、`craft`（forge/alchemy/poison/cook/inscribe）、`req`（技艺门槛） | §6、§8.7、§9.4 |
| 配方学识 `RecipeDef` | `id: rc_*`、`output`、`inputs[]`、`station`（铁匠铺/丹炉/厨房/书案）、`time`、`craftGrade` | 学识跨书界 |
| 坐骑 `mount` | `travelMul`（大地图旅行耗时倍率）、`staMul`（探索体力消耗倍率）、`terrains`（可骑行地形，归 08）、`stable`（马厩位） | §11.4 |
| 收藏品 `collectible` | `study`（研读收益：技艺 +N，一次性）、`giftTo`（偏好此物的 NPC 与好感值，归 12）、`appraise`（鉴宝 DC，`art`） | §11.5 |
| 奇物 `curio` | `rule`（独立规则 ID，§11.3）、`consumable`（是否一次性） | §11.3 |
| 任务物品/钥匙 `quest`/`token` | `quest: q_*`、`opens`（门/机关/区域）、`recognizedBy`（NPC 认物对话） | §11.2 |

### 2.5 运行时实例

**`EquipInstance`**（存档，每件一条）

| 字段 | 类型 | 说明 |
|---|---|---|
| `uid` | int | 存档内唯一 |
| `def` | `eq_*` | 定义 ID |
| `absGrade` | 1–12 | 绝对品阶（模板实例在生成时确定；藏史侵蚀会降低，02 §6.6 S6） |
| `nativeTo` | chapterId | 本土归属（02 §2.2：锻造/获得书界；携带不变；器合改为当前书界） |
| `affixes` | `{id, q, sealed}[]` | 随机 + 固定词条；`sealed` 为压制下被封存（§7.2），玩家可调整封存对象 |
| `temper` | `{id, q}` \| null | 工艺词条（§6.3） |
| `inscription` | `{id, g}` \| null | 铭文与刻铭品阶（§6.4） |
| `refine` | 0–10 | 强化等级（§6.2）；`refineFire` 为当前级的火候加成 pp |
| `poisonCoat` | `{buff, g, battlesLeft}` \| null | 淬毒（§6.5）；书眠清除 |
| `broken` | `{gBreak}` \| null | 断兵（06 `bf_duanbing` 的持久化状态），记录施加者效果品阶；修复前主属性按 §3.6 削减 |
| `owner` | `player` / npcId | 玩家所有或 NPC 自带（§3.6、§7.1） |
| `qipo` | bool | 已用器魄铸"器魂铭"（§6.7） |
| `sleeps` | int | 随主角书眠的次数（"天书铭"条件，§6.4） |
| `history` | `{from, to, year}[]` | 藏史取回、器合等记录（UI 与回响） |

**`ItemInstance`**（非装备）：`{uid, def, count, data?}`；`data` 仅少数类使用：残页 `{pages: int[]}`、秘籍 `{readDays: number}`（已读进度，§10.2）、坐骑 `{name, stamina}`、暗器弹药 `{poisonCoat?}`。

### 2.6 TypeScript 类型（`packages/data`，Zod 同构）

```ts
export type EquipSlotV1 = 'mainHand'|'offHand'|'head'|'body'|'hands'|'waist'|'feet'|'accessory';
export type EquipSlot = EquipSlotV1|'innerBody'|'shoulder'|'cape'; // equip-slots.v2，§3.1.1
export type WeaponCat = 'sword'|'blade'|'staff'|'spear'|'whip'|'exotic'|'hidden'|'unarmed';   // 基准 §7
export type ExoticKind = 'brush'|'fan'|'wheel'|'hook'|'pestle'|'qin'|'flute'|'dagger'|'hammer'|'axe'|'token'|'misc'; // 05 §6.2
export type HiddenKind = 'needle'|'dart'|'ball'|'awl'|'bolt'|'powder'|'gun'|'bow';
export type ItemKind = 'weapon'|'armor'|'offhand'|'hidden'|'accessory'|'ammo'|'pill'|'tonic'|'poison'|'antidote'
  |'food'|'dish'|'wine'|'material'|'tool'|'manual'|'page'|'recipe'|'quest'|'token'|'curio'|'mount'|'collectible'|'system';
export type Grade = 1|2|3|4|5|6|7|8|9|10|11|12;
export interface MeridianAid {
  rateBp: number; successBp: number; costReduceBp: number; hours: number;
  meridians?: `mer_${string}`[];
}

export interface AffixRef { id: `af_${string}`; q: number; sealed?: boolean }       // q ∈ [0.70, 1.00]
export interface UniqueDef {
  id: `ue_${string}`; name: string; core: boolean;                                  // core = 压制到地阶仍保留（§5.1）
  lowTier?: 'half' | 'seal';                                                        // 玄阶及以下的处理（§7.3）
  mods?: unknown[]; triggers?: unknown[]; buffs?: { id: `bf_${string}`; params?: Record<string, string>;
    targetAcupoint?: AcupointTarget }[]; // 06 DSL；AcupointTarget 直接复用 05 §4.1，不在本文重定义
  rules?: string[];                                                                // 规则键；由 04/06 注册并校验
  outOfCombat?: string[];                                                           // 非战斗效果键（身份、对话、世界事件），不受压制
}
export interface EquipDef extends ItemDefBase {
  kind: 'weapon'|'armor'|'offhand'|'hidden'|'accessory';
  slot: EquipSlot; cat?: WeaponCat; exoticKind?: ExoticKind; hiddenKind?: HiddenKind;
  hands?: 1|2|'pair'; tags?: string[]; armorWeight?: 'light'|'medium'|'heavy';
  mainK?: number; fixedAffixes?: AffixRef[]; affixRoll?: { min: number; max: number };
  uniques?: UniqueDef[]; divine?: boolean; catalogTian?: boolean; uniqueEquipped?: boolean;
  lawProfile?: { uniform: true; allowedIdentityTags: string[]; violation: 'uniformImpersonation';
    wantedIntent: 'activate'; normalGate: 'blocked' };
  concealment?: { coveredBy?: EquipSlot[]; exposure: 'visible'|'covered' };
  reqs?: Partial<Record<'str'|'agi'|'wis', number>>; matFamily: 'metal'|'fabric'|'leather'|'wood'|'jade';
  ammo?: { kind: HiddenKind; perBattle: number; mul: number; onHit?: unknown[] };
  setTags?: `set_${string}`[]; signature?: `npc_${string}`; refineMax?: number;
}
// 消耗品定义可选字段；冲穴公式、三槽总上限及快照顺序归 design/15。
export interface ConsumableDef extends ItemDefBase { meridianAid?: MeridianAid }
export interface EquipInstance {
  uid: number; def: `eq_${string}`; absGrade: Grade; nativeTo: ChapterId;
  affixes: AffixRef[]; temper: AffixRef | null; inscription: { id: `ins_${string}`; g: Grade } | null;
  refine: number; refineFire: number; poisonCoat: { buff: `bf_${string}`; g: Grade; battlesLeft: number } | null;
  broken: { gBreak: Grade } | null; owner: 'player' | `npc_${string}`; qipo: boolean; sleeps: number;
  history: { from: ChapterId; to: ChapterId; year: number; how: 'carry'|'stash'|'merge' }[];
}
// 派生（不存档）：effGrade(02 §2.3) → gUse = min(effGrade, gCap(Ld)) → 主属性/词条/特效（§4、§7）
export function gUse(inst: EquipInstance, ch: ChapterDef, Ld: number): Grade;
```

装备触发 `bf_shouqin` / `bf_xueweishoufeng` 时，静态 `params` 必须给 `level: 1..9`，并分别给可选 `holdRange` / 必填 `targetAcupoint`；运行时以实际命中者补 `source`，以配置持续补 `remainingOwnActions`，且令其严格等于 `turnsLeft`。`targetAcupoint` 解析失败时只跳过该 Buff，不回退为旧状态或伪造穴位 ID。其余载荷、合并、硬控与 Boss 递减均引用 `design/06` §2.2.1、§8.14，不在本文重定义。

---

## 3. 装备栏与兵器

### 3.1 十一格总览（`equip-slots.v2`）

主属性均为 `flatLv`（按当前显示等级 `Ld` 的基准曲线缩放，03 §4.1、§11.2②），品阶一律取**使用品阶 `gUse`**（§4.3）。词条池的组名见 §4.6，逐条权重见 §4.7。

| 格 | 可装 | 主属性（`flatLv`） | 固有属性（不随等级缩放） | 随机词条数 | 主要词条池 | 备注 |
|---|---|---|---|---|---|---|
| 主手 `mainHand` | 兵器 7 类（含拳套） | `atkOut = 0.30 × kA × G × ATK_LV` | 按兵器类别/奇门细类（§3.2） | 标准（§4.5） | 攻伐 A、克制 B、触发 C | **决定兵器武学可用性**（基准 §20） |
| 副手 `offHand` | ① 副兵器 ② 牌 ③ 暗器囊 ④ 名门暗器 | ① `atkOut = 0.10 × kA × G × ATK_LV` ② `defOut = 0.10 × G × DEF_LV` ③④ 无 | ① 类别固有 ×0.5 ② `parry +(10 + 3×G)` ③④ `apHidden +2×G`、弹药位（§3.5） | 标准 | ① 攻伐 A ② 守御 D ③④ 暗器专属 | 主手为双手兵器时只能放 ③④（§3.3） |
| 头 `head` | 冠、巾、盔、斗笠 | `defOut = 0.05 × G × DEF_LV`；`hpMax = 0.01 × G × HP_LV` | — | 标准 | 守御 D、抗性 E、心法 G | |
| 衣 `body` | 轻/中/重衣甲 | `defOut = kD × G × DEF_LV`；`defIn = kI × G × DEF_LV` | 按轻重（§3.4） | 标准 | 守御 D、抗性 E | 原神兵宝甲中护身宝衣、乌蚕衣在此；AR-20 天级样本须 `catalogTian` |
| 内甲 `innerBody` | 软猬甲、金丝背心、金丝甲等贴身宝甲 | `defOut = 0.10 × G × DEF_LV`；`defIn = 0.08 × G × DEF_LV` | 条目可带刀枪减伤、猬刺、抗毒；只取明列效果 | 标准 | 守御 D、抗性 E | 与外衣叠穿；同一来源的同名 Buff 只结算一次 |
| 护手 `hands` | 护腕、手套、指套、铁护手 | 同头 | `glove` 标签：可徒手取毒针（§5.4） | 标准 | 攻伐 A（少）、守御 D、拿穴 | |
| 护肩 `shoulder` | 单／双护肩、披膊 | `defOut = 0.025 × G × DEF_LV`；`hpMax = 0.005 × G × HP_LV` | — | 标准 | 守御 D、抗性 E | 系数为小件的一半：`0.05÷2`、`0.01÷2`【建议值】 |
| 披风 `cape` | 披风、斗篷、氅 | 同护肩 | 可带御寒、隐蔽或威仪，均须条目显式声明 | 标准 | 机动 F、抗性 E、技艺 I | 不自动遮蔽官甲；`concealment` 明列后才改变暴露 |
| 腰带 `waist` | 腰带、束带、玉带 | 同头 | — | 标准 | 守御 D、气海、耐力 | |
| 鞋 `feet` | 靴、履、草鞋、快靴 | 同头；另 `qinggong +2.5 × gUse`（固定点，03 §4.5） | — | 标准 | 机动 F、灵动 | 鞋的轻功值**不受强化加成**（保护 03 §4.5 的门禁校准） |
| 佩饰 `accessory` | 玉佩、香囊、念珠（随机基底）；指环、葫芦、护符（仅名器） | 无 | 玉佩：任一评级 `+2 × gUse`；香囊：任一抗性 `+1 × gUse` pp；念珠：`effRes +2 × gUse`、`resMind +0.5 × gUse` pp（生成时定项） | **标准 +1** | 心法 G、先天 H、技艺 I、抗性 E | 技艺词条只出现在佩饰 |

> 主属性系数沿用 03 §4.1 的 D-02 接口，本文定稿兵器类别系数 `kA`（均值≈1.0）、衣甲轻重系数 `kD/kI`、副手与佩饰规则。护肩／披风合计恰等于一个旧小件：`2×0.025=0.05`、`2×0.005=0.01`，既增加外观组合，又不凭空抬高单件预算；全套多出的总预算由装备件数与携带 6 件约束自然支付。

#### 3.1.1 `equip-slots.v1 → v2` 存档迁移

| 项 | 规则 |
|---|---|
| 旧字段保留 | 原八字段原值逐字保留，不改 `uid`、装备实例或携带计数 |
| 新字段 | `innerBody:null`、`shoulder:null`、`cape:null`；存档写入 `equipSlotsVersion:2` |
| 旧宝衣归位 | 基准三件宝衣中软猬甲迁 `body → innerBody`；护身宝衣、乌蚕衣仍为 `body`。金丝背心迁 `body → innerBody`；若导入时目标已有装备，旧 `body` 保持不动并把待迁装备送 §12.1 待拾队列 |
| 原子性 | 三个新槽初始化与宝衣移位同事务；失败整笔回滚，禁止复制或吞掉实例 |
| UI / 配表 | 未支持 v2 的客户端只读原八槽且不得保存；服务端拒绝以 v1 覆写 v2。装备详情按“外衣／内甲／护肩／披风”显示 |

### 3.2 兵器类别与武学装配（基准 §7）

| 类别 `cat` | 中文 | 基底示例（`eq_*`，时代） | 手持 | `kA` | 招架底值 `P_wpn`（03） | 固有属性（×G） | 可用兵器武学 `subType` | 被何种"破 X"匹配（06 §8.6.1） |
|---|---|---|---|---|---|---|---|---|
| `sword` | 剑 | 青钢剑 `eq_qinggangjian`、松纹古剑 `eq_songwenguijian`、龙泉剑 `eq_longquanjian`、软剑 `eq_ruanjian`（`soft`） | 单 | 1.00 | 12 | `hit +2` | `sword` | 破剑 |
| `blade` | 刀 | 单刀 `eq_dandao`、柳叶刀 `eq_liuyedao`、鬼头刀 `eq_guitoudao`、雁翎刀 `eq_yanlingdao`（明清）、朴刀 `eq_podao`（双） | 单（朴刀/斩马刀双） | 1.05（双 1.15） | 10 | `crit +2` | `blade` | 破刀 |
| `staff` | 棍杖 | 齐眉棍 `eq_qimeigun`、白蜡杆 `eq_bailagan`、禅杖 `eq_chanzhang`、铁拐 `eq_tieguai`（单） | 双（拐、短杖单） | 1.10（单 0.95） | 16 | `parry +2` | `staff` | 破枪（含棍）、破棍 |
| `spear` | 枪 | 花枪 `eq_huaqiang`、长枪 `eq_changqiang`、蛇矛 `eq_shemao`、大戟 `eq_daji` | 双 | 1.15 | 12 | `pierce +2` | `spear` | 破枪 |
| `whip` | 鞭索 | 软鞭 `eq_ruanbian`、长索 `eq_changsuo`、三节棍 `eq_sanjiegun`、链子枪 `eq_lianziqiang` | 单 | 0.90 | 4 | `effHit +2` | `whip` | 破索 |
| `exotic` | 奇门 | 判官笔、折扇、钩、轮、杵、琴、箫笛、短匕 `eq_duanbi`、锤、斧、令 | 见下表 | 见下表 | 8 | 见下表 | `exotic` + `kinds` 白名单 | 破鞭（短兵） |
| `unarmed` | 拳套 | 铁指虎 `eq_tiezhihu`、鹿皮拳套 `eq_lupiquantao`、铁手 `eq_tieshou` | — | 0.60 | 0 | `combo +0.4` pp | 无（**视为空手**，拳脚 `Mod_armed` 1.00，兵器栏不可用） | 破掌 |
| `hidden` | 暗器 | 暗器囊、名门暗器（只入副手，§3.5） | — | — | — | `apHidden +2` | `hidden`（暗器栏） | 破箭 |

**奇门细类**（05 §6.2 `kinds`，本文为每类定手持、系数与固有属性）：

| `exoticKind` | 手持 | `kA` | 固有（×G） | 原著例 |
|---|---|---|---|---|
| `brush` 判官笔 | 单（常成对） | 0.90 | `seal +1` pp | 倚天·张翠山"银钩铁划"之笔；笑傲·秃笔翁 |
| `fan` 折扇 | 单 | 0.85 | `eva +2` | 神雕·霍都 |
| `wheel` 轮 | 单 | 1.00 | `pierce +2` | 神雕·金轮法王 |
| `hook` 钩 | 单 | 0.95 | `parry +2` | 倚天·张翠山"银钩" |
| `pestle` 杵 | 双（`heavy`） | 1.15 | `critDmg +3` pp | 神雕·达尔巴 |
| `qin` 琴 | 双 | 0.85 | `effHit +2` | 笑傲·黄钟公 |
| `flute` 笛/箫 | 单 | 0.85 | `effHit +2` | 射雕·黄药师玉箫；书剑·余鱼同金笛 |
| `dagger` 匕首/短兵 | 单 | 0.90 | `crit +2` | 鹿鼎·韦小宝匕首 |
| `hammer` 锤 | 双（`heavy`） | 1.15 | `critDmg +3` pp | 通用 |
| `axe` 斧 | 单 | 1.05 | `pierce +2` | 通用 |
| `token` 令 | 单 | 0.90 | `pierce +2` | 倚天·圣火令 |
| `misc` 其他 | 单 | 0.95 | `effRes +2` | 天龙·鳄嘴剪、笑傲·绣花针、倚天·乾坤一气袋 |

**标签修正**（叠乘在 `kA` 上，05 §6.2 `weaponReq.tags` 读取同一标签）：

| 标签 | 主属性 | `P_wpn` | 负重 `Q_load`（03 §4.5） | 需求 | 说明 |
|---|---|---|---|---|---|
| `heavy` 重兵 | ×1.20 | +4 | 15 | `str ≥ 40 + 3 × gUse`（随压制下降；未满足见 §4.3"驾驭不住"） | 玄铁重剑、屠龙刀、杵、锤 |
| `soft` 软兵 | ×0.92 | −4（≥0） | 0 | — | 另得固有 `eva +1 × G`；软剑仍为 `sword`（破 X 按类别匹配） |
| `long` 长兵 | ×1.00 | +0 | 0 | — | 枪、棍默认带；射程由招式定义（05），本标签只供 AI 与 UI |

**兵器与武学的特殊联动**（除下表外一律按 05 §6.2 `weaponReq.category == 主手类别`）：

| 情形 | 规则 | 出处 |
|---|---|---|
| 独孤九剑以物代剑 | 9 重起 `altCategories: [staff, exotic] × 0.9` | 05 §6.2 |
| 玄铁剑法需重剑 | `weaponReq.tags: [heavy]`；非重剑时失去标注加成 | 05 §6.2 |
| 以针代剑 | 主手绣花针（`misc`）且装配葵花宝典 `sk_kuihua` → 剑类武学可用，`Mod_special × 0.95` | §5.4（原创扩展） |
| 令随拳走 | 主手圣火令且装配圣火令武功 `sk_shenghuoling` → 该武学 `Mod_armed = 1.00` | §5.2（原创扩展） |
| 杖代指力 | 主手段延庆钢杖且装配一阳指 `sk_yiyangzhi` → 一阳指 `Mod_armed = 1.00`、射程 +1 | §5.4 |
| 阴阳倒转 | 公孙止金刀黑剑（成对）：默认视为 `blade`；附加动作"倒转"（不占行动，收招 +50）改为 `sword` | §5.4 |
| 双持武学 `dual` | 副手须同类单手兵器或主手为成对兵器（05 §6.2）；左右互搏"兵器＋兵器"同此（05 §9.3.2） | 05 |
| 暗器武学 | 只看副手：暗器囊有弹药或名门暗器有余量；与主手无关 | §3.5 |
| 拳脚持械降效 | 单手 0.90 / 双手 0.80 / 腿法 1.00；拳套视为空手 | 05 §6.3 |
| 石碑牌兼作奇门 | `eq_changchangfengshibei` 装在副手时，除牌的防御结算外，额外向武学装配检查暴露 `cat:exotic`、`exoticKind:misc`；只可满足明确把该装备列入 `weaponReq.altItems` 的武学，不把所有牌泛化为奇门兵器 | **已闭合**：§5.4 与 `catalog/skills-kangxi` §9.6 的 `sk_taiyueshibeishou.weaponReq.altItems` |

### 3.3 手持规则：单手、双手、成对、副手

| 主手状态 | 副手可放 | 拳脚 `Mod_armed`（05 §6.3） | 兵器栏 |
|---|---|---|---|
| 空手 / 拳套 | 牌、暗器囊、名门暗器（放入副兵器 = 自动移到主手） | 1.00 | 不可用 |
| 单手兵器 | 副兵器（单手、非 `heavy`）、牌、暗器囊、名门暗器 | 0.90 | 与主手类别匹配者可用 |
| 双手兵器 | 暗器囊、名门暗器（"腰间暗器"） | 0.80 | 同上 |
| 成对兵器 `pair` | 自动占用（显示"成对"），不可另放 | 0.90 | 同上；`dual` 武学可用 |

| 项 | 规则 |
|---|---|
| 副兵器 | 主属性 `0.10 × kA × G × ATK_LV`；类别固有 ×0.5；词条全额。副兵器与主手**同类**时可供左右互搏"兵器＋兵器"与 `dual` 武学；异类时只提供属性。 |
| 成对兵器 | 一件实例占主副两格；主属性 `0.36 × kA × G × ATK_LV`（单手 0.30 + 副兵器 0.10 = 0.40 的"两件"方案略强，但成对只占 1 个携带名额，且多有专属联动）；**书眠计 1 件**；不能拆开单用（鸳鸯刀等的"分持"由剧情另设）。 |
| 牌（盾） | 武侠中少见，主要是官兵、镖师所用的藤牌/铁牌（原创扩展定位）；`parry +(10 + 3 × G)`、`defOut 0.10 × G × DEF_LV`；不可与双手兵器同用。 |
| 战斗中换持 | 流程与代价归 05 §6.4（主副互换 +150 收招；从行囊取兵器占行动）。 |
| 非战斗 | 自由换装，无代价（05 §6.4）。 |

### 3.4 衣甲轻重与负重

| 轻重 | 例（基底） | `kD`（外防） | `kI`（内防） | 固有（×G） | `Q_load` | `mov` | 定位 |
|---|---|---|---|---|---|---|---|
| 轻 `light` | 布衣 `eq_buyi`、劲装 `eq_jinzhuang`、道袍 `eq_daopao`、僧衣 `eq_sengyi`、夜行衣 `eq_yexingyi` | 0.16 | 0.12 | `eva +2` | 0 | 0 | 身法型、内家；夜行衣另带 `night` 标签（夜间潜行判定，归 11） |
| 中 `medium` | 皮甲 `eq_pijia`、软甲 `eq_ruanjia`、锁子背心 `eq_suozibeixin` | 0.20 | 0.10 | — | 0 | 0 | 通用（= 03 §4.1 建议值）；三件天级宝衣皆为中甲 |
| 重 `heavy` | 铁甲 `eq_tiejia`、鳞甲 `eq_linjia`、棉甲 `eq_mianjia`（明清） | 0.28 | 0.07 | `resCC +2` pp、`tough +2` | 10 | −1 | 军阵、守城、官兵；重甲下轻功值 −10 使 qg 门禁自然变难（03 §4.5） |

- 三档合计防御系数：轻 0.28 / 中 0.30 / 重 0.35；重甲的额外防御以机动与轻功为代价。
- 负重 `Q_load` 只由"重甲 10"与"重兵 15"两项构成，同时满足时合计 25（03 §4.5 的建议值，本文确认）。

#### 3.4.1 衣物、制式盔甲与内甲

| 类 | 判定 | 数值与特殊效果 |
|---|---|---|
| 衣物 `clothing` | 外衣、袍、劲装、旗衣等入 `body`；头饰入 `head` | 轻／中／重按 §3.4；礼服可取魅力／口才词条，夜行衣可取隐蔽标签，但均不自动授身份 |
| 制式盔甲 `officialArmor` | 官军／衙役／禁军／侍卫等可识别制服或甲胄，入 `body`；必填 `lawProfile` | 防御仍按轻重；合法性不因装备品阶改变。外观可见且穿戴者无任一 `allowedIdentityTags` 时发 `uniformImpersonation` |
| 内甲 `innerArmor` | 贴身穿在 `innerBody`，可与外衣叠穿 | 主属性按 §3.1；软猬甲可反伤，金丝类可刀剑减伤，乌蚕类可抗性，须在条目效果中逐件声明，不从名称猜效果 |

官甲装备侧事件载荷固定为 `{equipId,wearerId,lawProfile,exposure:'visible',locationId,time}`。`design/12` 判断身份是否合法并向 `design/11` 请求激活通缉；正常城门入口随后消费其状态为 `blocked`。脱下或遮蔽官甲只停止新的暴露事件，**不清除既有通缉**；潜行、翻墙、密道等非正常进城路线仍由 `design/11` 判定。本文不定义通缉数值、衰减、追捕或洗罪。

### 3.5 暗器：暗器囊、名门暗器与弹药

暗器武学（基准 §7 `hidden`，不可携带）只能在副手满足下列之一时施放：

| 副手 | 弹药来源 | 固有 | 弹药位 / 容量 | 书眠 |
|---|---|---|---|---|
| 暗器囊 `pouch`（`eq_anqinang`，黄下–地上） | 背包中的暗器弹药，非战斗时"装填"（`load`，不耗时） | `apHidden +2 × G`（资质临时加值，03 §11.1 `equipAffix`） | 弹药位 `2 + ⌊gUse / 4⌋`（2–5 种），每位 30 枚 | 可携带；囊内弹药不跨书界（书眠时清空） |
| 名门暗器（`hidden`，§5.4） | **自带**：每场 `perBattle` 枚，战后自动补足（不消耗背包） | `apHidden +2 × G` + 固定词条 + 专属 | 另可装 1 种普通弹药 | 可携带（整体为装备） |

| 规则 | 值 |
|---|---|
| 弹药倍率 | 暗器招式威力另乘 `ammoMul(g) = 0.88 + 0.035 × g`（g1 0.915 … g6 1.09 … g9 1.195 … g12 1.30），作为 05 §2.7 的 `Mod_special` 项【建议值，04/05 确认】 |
| 命中接口 | 装备可给 `hiddenHit = base + 3×G(gUse)`；最终仍注入 03 的 `hit/effHit`，不另建命中公式。机括类条目可显式给 `range`、`reloadOwnActions`、`perBattle` |
| 消耗 | 每次命中判定消耗 1 枚；多目标招式按实际判定数消耗；未命中不返还 |
| 附带效果 | 弹药自带 `onHit[]` 与淬毒 `poisonCoat`（§6.5）同时生效；毒效果必须引用 06 的 `bf_*` 并带 `gUse`，同一枚最多 2 个附带效果；免疫、削品、抵抗均归 06 |
| 天级目录样本 | AR-20 允许天级暗器固定样本；须 `catalogTian:true`、`unique`、`price:null`、每场限量，不能量产弹药，不自动获 `bf_mian_pobing` |
| 战斗中换囊 | 占用行动（与 05 §6.4"从行囊取兵器"同价） |
| 被"破箭"克制 | 06 `bf_poanqi` 按 `move.category == hidden` 匹配，与弹药无关 |

### 3.6 缴械、拾取与缴获

| 情形 | 规则 |
|---|---|
| 我方被缴械 | 06 `bf_jiaoxie`：兵器落到随机相邻格；拾回占行动（05 §6.4、09）；**战斗结束自动拾回** |
| 神兵护主 | 天阶神兵常驻 `bf_mian_pobing`（06），品阶 ≥ 缴械/断兵效果品阶时免疫（外来压制后品阶按 `gUse`，§7.3） |
| 战斗中拾起敌方兵器 | 按该兵器品阶与主属性生效；兵器武学按其类别匹配 |
| 战后缴获 | 被击败的**普通/精英**敌人的兵器（在地上或在我方手中）→ 缴获为额外战利品：品阶 = 该敌人主武器品阶，随机词条 0–1 条（q ∈ [0.70, 1.00]）；每场至多 2 件 |
| 具名 NPC 专属兵器 | `signature` 兵器战后归还原主，不可缴获（剧情"夺刀""赠剑"任务可覆写） |
| 断兵 | 06 `bf_duanbing` 的"至铁匠修复"在装备上记为 `broken: {gBreak}`，即记录**施加断兵者的效果品阶**：主手兵器主属性 ×（1 − 30%〔`gBreak` 地阶〕/ 50%〔天下、天中〕/ 70%〔天上〕），直至修复（§6.6） |
| 坠崖击杀 | 普通敌人坠崖离场后，其**非任务掉落按确定性顺序仅保留 50%**：先按 `questBound` 排除任务物，再按掉落表原始索引稳定排序，保留前 `ceil(n × 0.5)` 件；任务关键物、主线钥匙与 `questBound` 必定进入战利品，不得因不可到达尸体而丢失。坠落与离场判定归 08/09；本文只定义物品去留（P51） |

飞爪 `it_feizhua` 是 `tool/climb` 探索工具，只消费 08 的攀援交互；**不进入战斗物品栏，也不得作为拉人、拉物或伤害道具**（P50）。

---

## 4. 品阶与装备数值

### 4.1 主属性公式（本文定稿，确认 03 D-02）

```
gUse   = min( effGrade(inst, chapter),  gCap(Ld) )             // effGrade 见 02 §2.3；gCap 见 §4.3
R      = (1 + 0.04 × refineEff) × brokenMul                     // 强化 §6.2；断兵 §3.6（未断为 1）
主手    atkOut += 0.30 × kA × tagK × G(gUse) × ATK_LV(Ld) × R
副兵器  atkOut += 0.10 × kA × tagK × G(gUse) × ATK_LV(Ld) × R
成对    atkOut += 0.36 × kA × tagK × G(gUse) × ATK_LV(Ld) × R
衣      defOut += kD × G × DEF_LV(Ld) × R ;   defIn += kI × G × DEF_LV(Ld) × R     // kD/kI §3.4
头手腰鞋 defOut += 0.05 × G × DEF_LV(Ld) × R ; hpMax += 0.01 × G × HP_LV(Ld) × R
内甲    defOut += 0.10 × G × DEF_LV(Ld) × R ; defIn += 0.08 × G × DEF_LV(Ld) × R
肩披    defOut += 0.025 × G × DEF_LV(Ld) × R ; hpMax += 0.005 × G × HP_LV(Ld) × R // 各自
牌      defOut += 0.10 × G × DEF_LV(Ld) × R ;  parry += 10 + 3 × G                // parry 不乘 R
鞋      qinggong += 2.5 × gUse                                                       // 不乘 R
固有    按 §3.1–3.4 的"×G"值，G = G(gUse)，不乘 R
```

- 全部以 `StatModifier{op: 'flatLv', curve, value: 系数 × G × R, sourceType: 'equipMain', sourceId: 'eq#<uid>', modifierId: 'main:<stat>'}` 注入 03 §11 叠加管线（`curve` 取 `ATK_LV` / `DEF_LV` / `HP_LV`）；固有属性以 `op: 'flat'` 或 `'pp'`、`modifierId:'innate:<stat>:<index>'` 注入。同一装备的不同属性使用不同稳定 `modifierId`，去重键固定为 `(sourceType,sourceId,modifierId)`，重算时不生成随机键。
- `G` 直接使用基准 §4 的品阶系数（与武功、Buff 同一套，玩家对"差几品"有一致直觉）。
- 敌人装备同式，但无强化、无词条（03 §10 模板法），精英/Boss 的"精英词条"归 09。
- 04 §11.3 已接收装备接口：`ammoMul` 进入 Z1 `Mod_special`；`targetParryMult` / `noCrit` 进入 Z0；背击进入 Z7；"外劲部分"减伤先按 `wOut` 拆分，再进入条件 Z4。本文不另建伤害管线。

### 4.2 主属性速查表（`kA = 1`、无强化；中甲；取整）

**兵器 `atkOut`（主手 0.30 × G × ATK_LV）**

| 品阶 \ Ld | 10 | 20 | 35 | 44 | 50 | 60 | 70 |
|---|---|---|---|---|---|---|---|
| 黄下 1 | 29 | 71 | 182 | 284 | 365 | 524 | 712 |
| 黄上 3 | 34 | 85 | 218 | 341 | 438 | 628 | 854 |
| 玄下 4 | 40 | 100 | 255 | 397 | 511 | 733 | 997 |
| 玄中 5 | 44 | 110 | 282 | 440 | 566 | 812 | 1,103 |
| 玄上 6 | 49 | 121 | 309 | 482 | 620 | 890 | 1,210 |
| 地下 7 | 57 | 142 | 364 | 568 | 730 | 1,047 | 1,424 |
| 地中 8 | 63 | 156 | 400 | 624 | 803 | 1,152 | 1,566 |
| 地上 9 | 69 | 171 | 437 | 681 | 876 | 1,257 | 1,708 |
| 天下 10 | 80 | 199 | 509 | 795 | 1,022 | 1,466 | 1,993 |
| 天中 11 | 89 | 220 | 564 | 880 | 1,131 | 1,623 | 2,207 |
| 天上 12 | 100 | 249 | 637 | 993 | 1,277 | 1,833 | 2,492 |

**中甲 `defOut` / `defIn`（0.20 / 0.10 × G × DEF_LV）与小件 `defOut` / `hpMax`（0.05 × G × DEF_LV / 0.01 × G × HP_LV）**

| 品阶 | 衣 Ld35 | 衣 Ld50 | 衣 Ld70 | 小件 Ld35 | 小件 Ld50 | 小件 Ld70 |
|---|---|---|---|---|---|---|
| 黄下 1 | 91 / 45 | 182 / 91 | 356 / 178 | 23 / 50 | 46 / 101 | 89 / 198 |
| 玄下 4 | 127 / 64 | 255 / 128 | 498 / 249 | 32 / 71 | 64 / 142 | 125 / 277 |
| 玄上 6 | 155 / 77 | 310 / 155 | 605 / 303 | 39 / 86 | 78 / 172 | 151 / 337 |
| 地下 7 | 182 / 91 | 365 / 182 | 712 / 356 | 45 / 101 | 91 / 203 | 178 / 396 |
| 地中 8 | 200 / 100 | 401 / 201 | 783 / 392 | 50 / 111 | 100 / 223 | 196 / 436 |
| 地上 9 | 218 / 109 | 438 / 219 | 854 / 427 | 55 / 121 | 109 / 243 | 214 / 476 |
| 天下 10 | 255 / 127 | 511 / 255 | 997 / 498 | 64 / 141 | 128 / 284 | 249 / 555 |
| 天上 12 | 318 / 159 | 639 / 319 | 1,246 / 623 | 80 / 176 | 160 / 355 | 311 / 694 |

对照：`ATK_LV(35) = 606`、`DEF_LV(35) = 455`、`HP_LV(35) = 5,040`（03 §3.3）。Ld35 时一把地上剑（437）约为裸装外攻的 72%；Ld70 时天上剑（2,492）约为 105%——这就是 03 §9.3"倚天剑 1.05 × ATK_LV"的来源。

**鞋与轻功合法算例（C10）**：天级 12 件封闭名录中没有鞋；普通或名录外鞋绝对品阶均 ≤ 9，且强化不放大 `Q_eq`。03/08 应采用以下可复算输入：

- 天龙 Lv35：`10.75 + 10.5 + 152×(0.40+0.06×8) + 8.25 + 2.5×8 + 3×2.2×8/10 = 188.54`，仅达 qg4；再加 10 点临时 Buff 为 198.54，仍未到 qg5。
- 倚天 Lv70：`14.25 + 21 + 120×(0.40+0.06×10) + 12 + 2.5×9 + 3×3.5×10/10 = 200.25`，达到 qg5。
- 可供 03 示例使用的合法具名鞋为 §5.4 **踏云履 `eq_tayunlv`**（地上 9，**原创扩展**）：本土 `Q_eq=22.5`，带入中/低武依 `gUse` 降为 17.5/12.5；它不把任何天级鞋带入封闭名录。

### 4.3 等级封顶（力有不逮）、属性需求与推荐使用区间

**等级封顶 `gCap(Ld) = min(12, gMain(Ld) + 2)`**（`gMain` 为 03 §3.5 STD 主力品阶）：装备永远穿得上，但显示等级不足时只能发挥到 `gCap`。

| 显示等级 `Ld` | 1–3 | 4–7 | 8–12 | 13–16 | 17–21 | 22–25 | 26–29 | 30–34 | 35–38 | ≥ 39 |
|---|---|---|---|---|---|---|---|---|---|---|
| `gCap` | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 |

| 规则 | 内容 |
|---|---|
| 力有不逮 | `effGrade > gCap(Ld)` 时 `gUse = gCap(Ld)`：主属性、词条数值、工艺、铭文均按 `gUse` 计算；词条**数量**不减。UI："力有不逮·发挥为地中"。 |
| 神兵择主 | 同一条件下，**专属特效全部封存**（"器灵未认主"），直至 `Ld ≥ reqLv(effGrade)`。 |
| 驾驭不住 | 属性需求（`heavy` 的 `str ≥ 40 + 3 × gUse` 等）未满足：主属性 × `max(0.5, 1 − 0.02 × 差值)`、`hit −0.5 × 差值`、专属特效封存；满足后立即恢复。 |
| 永不"穿不上" | 需求一律按 `gUse` 与当前属性判定，外来压制后需求同步降低（02 §2.6"保证被压制后反而穿不上不会发生"）。 |
| 中武/低武 | 这些书界 `Ld ≥ 44`，`gCap` 恒为 12，等级封顶只在上半程（天龙—射雕前期）起作用。 |

**满效等级 `reqLv(g)`** 与 **推荐使用区间**：区间起点 = STD 主手开始用到该品阶的等级 `Lmain(g)`；终点 = STD 护具（参考品阶 `gref`）超过该品阶的前一级。"区间末相对强度" = `G(g) / G(gMain(终点))`。

| 品阶 | `reqLv` | 推荐区间（Ld） | 区间末相对主力强度 | 典型来源 |
|---|---|---|---|---|
| 黄下 1 | 1 | 1–4 | 0.91 | 序章、天龙开局商店 |
| 黄中 2 | 1 | 4–11 | 0.92 | 天龙前期商店、普通掉落 |
| 黄上 3 | 1 | 8–18 | 0.77 | 天龙前中期；低武书界主流 |
| 玄下 4 | 4 | 13–25 | 0.82 | 天龙中期；低武精英 |
| 玄中 5 | 8 | 17–32 | 0.70 | 天龙中后期；中武主流 |
| 玄上 6 | 13 | 22–38 | 0.71 | 天龙末、射雕前期；中武精英；低武 Boss |
| 地下 7 | 17 | 26–45 | 0.65 | 天龙 Boss、射雕；中武 Boss |
| 地中 8 | 22 | 30–52 | 0.63 | 射雕、神雕 |
| 地上 9 | 26 | 35–59 | 0.69 | 神雕、倚天主力；各书界名器上限 |
| 天下 10 | 30 | 39–66 | 0.80 | 仅神兵（§5.2） |
| 天中 11 | 35 | 44–70 | 0.89 | 仅神兵 |
| 天上 12 | 39 | 48–70 | 1.00 | 仅倚天剑、屠龙刀 |

> 读法：因主属性随 `Ld` 缩放，装备不会"数值归零"，只会被更高品阶的可得性淘汰；区间末相对强度 ≥ 0.63，意味着一件心爱的地中装备在区间末仍有主力的六成以上，配合强化/工艺仍可一用。

### 4.4 各书界主流装备品阶（依据 02 表 H、表 I）

| 书界 | 境界 | 普通池众数 | 普通池上沿（≥1%） | Boss 池众数 | 本书界固定产出上限 | 外来天上有效品阶 |
|---|---|---|---|---|---|---|
| 天龙 | 高 | 黄上 | 玄上 | 地下 | 天中（打狗棒） | —（首部无携带） |
| 射雕 | 高 | 玄中 | 地中 | 地中 | 天中（打狗棒）、天下（软猬甲） | 12 |
| 神雕 | 高 | 玄上 | 地上 | 地上 | 天中（玄铁重剑、打狗棒）、天下（软猬甲） | 12 |
| 倚天 | 高 | 地下 | 地上 | 地上 | 天上（倚天剑、屠龙刀） | 12 |
| 笑傲 | 中 | 玄中 | 地中 | 地中 | 地上（名器） | 10 |
| 侠客 | 中 | 玄中 | 地下 | 地下 | 地中（名器） | 10 |
| 碧血 | 中 | 玄下 | 地下 | 地下 | 天下（金蛇剑） | 10 |
| 鹿鼎 | 低 | 黄中 | 玄中 | 玄下—玄中 | 天下（匕首、护身宝衣） | 8 |
| 连城 | 低 | 黄上 | 玄中 | 玄中 | 天下（乌蚕衣）、地上（血刀） | 8 |
| 白马 | 低 | 黄上 | 玄中 | 玄中 | 地上（名器/奇物，原创扩展） | 8 |
| 鸳鸯 | 低 | 黄上 | 玄中 | 玄中 | 天下（鸳鸯刀） | 8 |
| 书剑 | 中 | 玄下 | 玄上 | 玄上 | 地中（凝碧剑） | 10 |
| 飞狐 | 中 | 玄下 | 玄上 | 玄上 | 天下（冷月宝刀） | 10 |
| 雪山 | 中 | 玄下 | 地下 | 地下 | 天下（冷月宝刀，器合） | 10 |

结论：**低武书界里，携带进来的天上/天中装备（有效 8/7）高于本地 Boss 池众数 3–4 品；而本地原生天下神兵（不受压制）又高于它们 2 品**——02 §2.3 "携带看绝对品阶，本地看原生"在装备上同样成立。

### 4.5 词条数量与品相

| 品阶 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 随机词条数（普通） | 0 | 0–1 | 1 | 1 | 1–2 | 2 | 2 | 2–3 | 3 | 3 | 3–4 | 4 |
| 大阶上限 `maxAffix` | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 | 4 | 4 | 4 |

- 区间取值：取下限，另以概率 `pExtra` 加 1：普通池 50%、精英池 75%、Boss 池与"精工"锻造 100%。
- **佩饰 +1**（数量与 `maxAffix` 都 +1）。
- 神兵：天下 3 条、天中/天上 4 条，全部固定（§5.2）；名器：按条目固定（§5.4）。天级词条只存在于神兵，随机装备最高地上（02 R2）。
- 工艺（1 条，§6.3）与铭文（1 条，§6.4）是**独立槽位**，不计入上表，也不受 `maxAffix` 封存。
- **品相 `q`**：普通池 U[0.70, 1.00]、精英池 U[0.75, 1.00]、Boss 池 U[0.80, 1.00]；福缘使下限 `+ max(0, luk − 50) / 1000`（福缘 100 → +0.05）；锻造见 §6.6。显示：[0.70, 0.78) 下、[0.78, 0.86) 中、[0.86, 0.94) 上、[0.94, 1.00] 极。
- 去重与互斥：同一件装备不出现两条同 ID 词条；克制组 B、触发组 C 每件至多 1 条；先天组 H、技艺组 I 每件至多 2 条；`af_zhuifeng`/`af_tengyue` 只出现在满足品阶条件的鞋上。

### 4.6 词条库（78 条，9 组）

数值统一写作 `基准 × G(gUse) × q`；下表"g1 / g6 / g9 / g12"列为 `q = 1` 时的值。作用位置按 06 §4.7 记法；**所有词条数值计入 06 §11.1 的族上限**（与 Buff、套装、永久被动同池），另受本文 §4.9 的装备专属上限。暗器囊/名门暗器上的攻伐与触发词条只对暗器招式生效（`cond: move.category == hidden`）。

**A 攻伐（14）**

| ID | 名称 | 作用位置 · 基准 | g1 / g6 / g9 / g12 | 族 / 备注 |
|---|---|---|---|---|
| `af_fengrui` | 锋锐 | `attr:atkOut pct` 2.0%×G | 2.0 / 3.4 / 4.8 / 7.0% | `fam_atk` |
| `af_yunjin` | 蕴劲 | `attr:atkIn pct` 2.0%×G | 同上 | `fam_atk` |
| `af_zhunxin` | 准心 | `attr:hit flat` 3×G | 3 / 5.1 / 7.2 / 10.5 | 装备评级上限 §4.9 |
| `af_huixin` | 会心 | `attr:crit flat` 3×G | 同上 | 同上 |
| `af_shichen` | 势沉 | `attr:critDmg pp` 4×G（= Z6） | 4 / 6.8 / 9.6 / 14 pp | `fam_pct_critDmg` |
| `af_pozhao` | 破招 | `attr:pierce flat` 3×G | 3 / 5.1 / 7.2 / 10.5 | |
| `af_toujia` | 透甲 | `Z2` 防御穿透 1.5%×G | 1.5 / 2.55 / 3.6 / 5.25% | `fam_z2` |
| `af_shayi` | 杀意 | `Z3` 1.5%×G | 同上 | `fam_z3` |
| `af_lianhuan` | 连环 | `attr:combo pp` 0.8×G | 0.8 / 1.36 / 1.92 / 2.8 pp | `fam_pct_combo` |
| `af_yinxue` | 饮血 | `settle` 吸血 0.6%×G（按气血伤害） | 0.6 / 1.02 / 1.44 / 2.1% | `fam_drain` |
| `af_jinei` | 汲内 | `settle`：兵器/拳脚招式命中后回复 `mpMax × 0.4%×G`（每回合 1 次） | 0.4 / 0.68 / 0.96 / 1.4% | 效果类 |
| `af_jushi` | 聚势 | `attr:rageGain pp` 2×G | 2 / 3.4 / 4.8 / 7 pp | 03 `rageGain` 50–200 |
| `af_renxue` | 认穴 | `attr:seal pp` 1×G | 1 / 1.7 / 2.4 / 3.5 pp | `fam_pct_seal` |
| `af_jingzhun` | 精准 | `attr:effHit flat` 3×G | 3 / 5.1 / 7.2 / 10.5 | |

**B 克制（8，每件至多 1 条，同族取高）** —— `Z5:<cat>` 1.2%×G（1.2 / 2.04 / 2.88 / 4.2%），匹配条件照 06 §8.6.1 `poMatch` 的"攻"列，**只有增伤，没有破 X 的招架乘数与大阶质变**；与破 X 同属 `fam_z5_<cat>` 取高（独孤九剑传人不会再从这里获益，给其他人一条"克制"路线）。

| ID | 名称 | 匹配 | ID | 名称 | 匹配 |
|---|---|---|---|---|---|
| `af_kejian` | 克剑 | 目标主手 `sword` | `af_kesuo` | 克软兵 | `whip` |
| `af_kedao` | 克刀 | `blade` | `af_kezhang` | 克拳脚 | 目标空手/拳套 |
| `af_keqiang` | 克长兵 | `spear` 或 `staff` | `af_keanqi` | 克暗器 | 目标装配暗器武学 |
| `af_kebian` | 克短兵 | `exotic` | `af_keqi` | 克内家 | 目标主运内功 `effGrade ≥ 7` 或 `shield > 0` |

**C 触发（7，每件至多 1 条，仅兵器与暗器招式命中时）** —— 概率 `p = 4% + 0.5% × gUse`（g1 4.5% / g6 7% / g9 8.5% / g12 10%），施加的 Buff 品阶 = `gUse`，持续取 06 默认，每回合至多触发 1 次。

| ID | 名称 | 施加（06） | 备注 | ID | 名称 | 施加（06） | 备注 |
|---|---|---|---|---|---|---|---|
| `af_pojiaji` | 破甲 | `bf_pojia` | | `af_zhenshe` | 震慑 | `bf_zhenshe` | `heavy`/`blunt` 概率 ×1.5 |
| `af_fangxue` | 放血 | `bf_liuxue` 1 层 | 刀、爪、钩权重 ×1.5 | `af_hanfeng` | 寒锋 | `bf_hanqi` 1 层 | |
| `af_zhizu` | 滞足 | `bf_chizhi` | | `af_banzu` | 绊足 | `bf_panshan` | 棍、鞭权重 ×1.5 |
| `af_sangongji` | 散功 | `bf_sangong` | | | | | |

**D 守御（15）**

| ID | 名称 | 作用位置 · 基准 | g1 / g6 / g9 / g12 | 族 / 备注 |
|---|---|---|---|---|
| `af_jianjia` | 坚甲 | `attr:defOut pct` 2.5%×G | 2.5 / 4.25 / 6.0 / 8.75% | `fam_def` |
| `af_hunyuan` | 浑元 | `attr:defIn pct` 2.5%×G | 同上 | `fam_def` |
| `af_tipo` | 体魄 | `attr:hpMax pct` 1.5%×G | 1.5 / 2.55 / 3.6 / 5.25% | §4.9 装备合计 ≤ 25% |
| `af_qihai` | 气海 | `attr:mpMax pct` 1.5%×G | 同上 | 同上 |
| `af_lingdong` | 灵动 | `attr:eva flat` 3×G | 3 / 5.1 / 7.2 / 10.5 | |
| `af_jiage` | 架格 | `attr:parry flat` 3×G | 同上 | |
| `af_renxing` | 韧性 | `attr:tough flat` 3×G | 同上 | |
| `af_xieli` | 卸力 | `Z4` 1.2%×G | 1.2 / 2.04 / 2.88 / 4.2% | `fam_z4`（上限 75%） |
| `af_huti` | 护体 | 开场护体 `hpMax × 1.2%×G`（进入 `shield`，受 03 `shieldMax`） | 1.2 / 2.04 / 2.88 / 4.2% | 03 §5.5 来源④ |
| `af_fanzhen` | 反震 | 常驻挂载 06 `bf_fanzhen`，覆写 `reflectPct = 1.5%×G` | 1.5 / 2.55 / 3.6 / 5.25% | `fam_reflect` |
| `af_huichun` | 回春 | `attr:hpRegen pp` 0.25×G | 0.25 / 0.43 / 0.6 / 0.88 pp | HOT 合计 ≤ 8% |
| `af_tiaoxi` | 调息 | `attr:mpRegen pp` 0.25×G | 同上 | 03 `mpRegen` ≤ 6 |
| `af_shouyi` | 守一 | `attr:effRes flat` 3×G | 3 / 5.1 / 7.2 / 10.5 | |
| `af_huoluo` | 活络 | `attr:healRecv pp` 2×G | 2 / 3.4 / 4.8 / 7 pp | `fam_pct_healRecv` |
| `af_sici` | 伺机 | `attr:counter pp` 0.8×G | 0.8 / 1.36 / 1.92 / 2.8 pp | `fam_pct_counter` |

**E 抗性（8）** —— `attr:res<X> pp` 2×G（2 / 3.4 / 4.8 / 7 pp），`fam_res_<tag>`。03 §6.3 规定单一来源 ≥ 5pp 才抬高抵抗品阶 `resGrade`：随机装备最高地上（单条 ≤ 4.8pp），所以**装备抬高抵抗品阶主要靠香囊固有**（`+1 × gUse` pp，玄中起 ≥ 5pp）与名器/神兵。

| ID | 名称 | 属性 | ID | 名称 | 属性 |
|---|---|---|---|---|---|
| `af_bidu` | 辟毒 | `resPoison` | `af_yuhan` | 御寒 | `resCold` |
| `af_bigu` | 辟蛊 | `resGu` | `af_bihuo` | 避火 | `resHeat` |
| `af_huxue` | 护穴 | `resSeal` | `af_dingxin` | 定心 | `resMind` |
| `af_guben` | 固本 | `resInjury` | `af_wenzhong` | 稳重 | `resCC` |

**F 机动（6）**

| ID | 名称 | 作用位置 · 基准 | g1 / g6 / g9 / g12 | 备注 |
|---|---|---|---|---|
| `af_qingshen` | 轻身 | `attr:qinggong flat` 2×G | 2 / 3.4 / 4.8 / 7 | 探索门禁**计入**（03 §11.5 #5）；`fam_move` ≤ +40 |
| `af_jixing` | 疾行 | `attr:spd pct` 0.6%×G | 0.6 / 1.02 / 1.44 / 2.1% | `fam_spd` |
| `af_zhuifeng` | 追风 | `attr:mov flat +1`（不随 G） | +1 | 仅品阶 ≥ 7 的鞋 |
| `af_tengyue` | 腾跃 | `attr:jump flat +1`（仅战斗，03 §4.4） | +1 | 仅品阶 ≥ 8 的鞋 |
| `af_naili` | 耐力 | `attr:staMax flat` 3×G、`attr:staRegen pp` 0.5×G | 3 / 5.1 / 7.2 / 10.5；0.5 / 0.85 / 1.2 / 1.75 | 探索续航 |
| `af_xianji` | 先机 | `ct`：开场集气 +15×G | 15 / 25.5 / 36 / 52.5 | 与 06 `bf_xianji` 同族取高 |

**G 心法（3）**

| ID | 名称 | 作用位置 · 基准 | g1 / g6 / g9 / g12 |
|---|---|---|---|
| `af_ningshen` | 凝神 | 开场 `rage +2×G`（取整） | 2 / 3 / 5 / 7 |
| `af_jienei` | 节内 | `cost mp` −0.8%×G | 0.8 / 1.36 / 1.92 / 2.8% |
| `af_miaoshou` | 妙手 | `attr:healPower pp` 2×G | 2 / 3.4 / 4.8 / 7 pp |

**H 先天（7，每件至多 2 条）** —— `attr:<innate> flat` 1×G（1.0 / 1.7 / 2.4 / 3.5，保留 1 位小数；03 §2.1 临时加值，最终值 ≤ 120）：`af_gengu` 根骨 `con`、`af_bili` 臂力 `str`、`af_shenfa` 身法 `agi`、`af_wuxing` 悟性 `wis`、`af_dingli` 定力 `wil`、`af_fuyuan` 福缘 `luk`、`af_meili` 魅力 `cha`。

**I 技艺（10，佩饰专属，每件至多 2 条）** —— 技艺临时加值 2×G（取整 2 / 3 / 5 / 7）：`af_yili` 医理 `med`、`af_dujing` 毒经 `poi`、`af_jiedu` 解毒 `antidote`、`af_jiangxin` 匠心 `forge`、`af_danxin` 丹心 `alchemy`、`af_qimen` 奇门 `formation`、`af_yinlv` 音律 `music`、`af_shuhua` 书画 `art`、`af_qili` 棋理 `chess`、`af_qiaoshe` 巧舌 `speech`。临时加值参与 03 §8.1 的门槛 `T(g)` 与成功率判定（"佩匠心玉佩打铁"是合法玩法），但不产生技艺经验。

合计：A 14 + B 8 + C 7 + D 15 + E 8 + F 6 + G 3 + H 7 + I 10 = **78 条**。

### 4.7 部位 × 词条权重表（随机生成用）

列：主＝主手；副兵＝副手副兵器；牌；囊＝暗器囊/名门暗器；头；衣；手；腰；鞋；佩＝佩饰。数字为抽取权重，"–"为不出现。

| 词条 | 主 | 副兵 | 牌 | 囊 | 头 | 衣 | 手 | 腰 | 鞋 | 佩 |
|---|---|---|---|---|---|---|---|---|---|---|
| 锋锐 | 3 | 2 | – | – | – | – | 1 | – | – | 1 |
| 蕴劲 | 2 | 1 | – | – | 1 | – | – | 1 | – | 2 |
| 准心 | 3 | 2 | – | 2 | 1 | – | 2 | – | – | 1 |
| 会心 | 3 | 2 | – | 2 | – | – | 2 | – | – | 2 |
| 势沉 | 2 | 1 | – | – | – | – | 2 | – | – | 1 |
| 破招 | 3 | 2 | – | – | – | – | 1 | – | – | 1 |
| 透甲 | 2 | 1 | – | 1 | – | – | – | – | – | 1 |
| 杀意 | 2 | 1 | – | 1 | – | – | – | – | – | 1 |
| 连环 | 2 | 2 | – | – | – | – | 2 | – | – | – |
| 饮血 | 2 | 1 | – | – | – | – | – | – | – | – |
| 汲内 | 1 | – | – | – | – | – | – | – | – | 1 |
| 聚势 | 1 | – | – | – | 1 | – | – | – | – | 2 |
| 认穴（判官笔/指套 ×2） | 1 | – | – | – | – | – | 3 | – | – | 1 |
| 精准 | 1 | – | – | 2 | 1 | – | – | – | – | 2 |
| B 克制（每条） | 1 | 1 | – | – | – | – | – | – | – | – |
| C 触发（每条） | 1 | 1 | – | 1 | – | – | – | – | – | – |
| 坚甲 | – | – | 3 | – | 2 | 3 | 1 | 2 | 1 | – |
| 浑元 | – | – | 1 | – | 2 | 3 | – | 2 | – | 1 |
| 体魄 | – | – | 1 | – | 2 | 2 | – | 3 | 1 | – |
| 气海 | – | – | – | – | 1 | 1 | – | 2 | – | 2 |
| 灵动 | – | – | – | – | 1 | 1 | – | – | 3 | 1 |
| 架格 | 1 | 1 | 3 | – | – | – | 2 | – | – | – |
| 韧性 | – | – | 1 | – | 2 | 2 | – | 2 | – | – |
| 卸力 | – | – | 2 | – | – | 2 | – | 1 | – | – |
| 护体 | – | – | 1 | – | – | 2 | – | 1 | – | 1 |
| 反震 | – | – | 2 | – | – | 2 | – | – | – | – |
| 回春 | – | – | – | – | – | 1 | – | 2 | – | 1 |
| 调息 | – | – | – | – | 1 | – | – | 1 | – | 2 |
| 守一 | – | – | – | – | 2 | 1 | – | – | – | 2 |
| 活络 | – | – | – | – | – | 1 | – | 2 | – | – |
| 伺机 | 1 | 1 | 1 | – | – | – | 2 | – | – | – |
| E 抗性（每条） | – | – | 1 | – | 1 | 1 | 1 | 1 | 1 | 2 |
| 轻身 | – | – | – | – | – | 1 | – | 1 | 3 | – |
| 疾行 | – | – | – | – | – | – | – | 1 | 2 | 1 |
| 追风（鞋 ≥ 7） | – | – | – | – | – | – | – | – | 1 | – |
| 腾跃（鞋 ≥ 8） | – | – | – | – | – | – | – | – | 1 | – |
| 耐力 | – | – | – | – | – | – | – | 2 | 2 | – |
| 先机 | – | – | – | 1 | 1 | – | – | – | 1 | 1 |
| 凝神 | – | – | – | – | 2 | – | – | – | – | 1 |
| 节内 | – | – | – | – | 1 | – | – | 1 | – | 2 |
| 妙手 | – | – | – | – | – | – | 1 | – | – | 2 |
| H 先天（每条） | – | – | – | – | 1 | – | – | 1 | – | 2 |
| I 技艺（每条） | – | – | – | – | – | – | – | – | – | 2 |

### 4.8 随机装备生成算法

```ts
// packages/core/src/items/loot.ts —— 确定性：rng = rng.stream('loot', sourceId)
function genEquip(pool: 'common'|'elite'|'boss', ctx: LootCtx, rng: Rng): EquipInstance {
  const g = gradeRoll(pool, ctx, rng);                       // 02 §2.12；随机池 g ≤ 9（02 R2）
  const slot = pickWeighted(SLOT_WEIGHT, rng);               // 主 18 / 副 8（副兵 3、牌 2、囊 3）/ 头 11 / 衣 14 / 手 12 / 腰 12 / 鞋 12 / 佩 13（%）
  const base = pickBase(slot, g, ctx.chapter.era, ctx.region, rng);   // 基底按时代/地域过滤（下表）
  let n = AFFIX_MIN[g] + (AFFIX_MAX[g] > AFFIX_MIN[g] && rng() < P_EXTRA[pool] ? 1 : 0);
  if (slot === 'accessory') n += 1;
  const affixes: AffixRef[] = [];
  for (let i = 0; i < n; i++) {
    const cand = AFFIX_POOL[subSlot(slot, base)]
      .filter(a => !affixes.some(x => x.id === a.id) && groupQuotaOk(a, affixes) && a.minGrade <= g);
    const a = pickWeighted(cand, rng);
    affixes.push({ id: a.id, q: rollQ(pool, ctx.luk, rng) });   // §4.5
  }
  return { uid: nextUid(), def: base.id, absGrade: g, nativeTo: ctx.chapter.id, affixes,
           temper: null, inscription: null, refine: 0, refineFire: 0, poisonCoat: null,
           broken: null, owner: 'player', qipo: false, sleeps: 0, history: [] };
}
// 显示名："<首条词条前缀>·<基底名>"，如"锋锐·青钢剑"；UI 规则归 design/14
```

| 基底的时代限制（`era`） | 宋（天龙—神雕） | 元（倚天） | 明（笑傲—碧血） | 清（鹿鼎—雪山） |
|---|---|---|---|---|
| 仅此时代出现 | 幞头 `eq_futou`、朴刀 | 蒙古弯刀 `eq_wandao`（原创扩展） | 纱帽 `eq_shamao`、雁翎刀 | 瓜皮帽 `eq_guapimao`、棉甲、罗刹短铳（名器） |
| 通用 | 其余全部基底 | | | |

- 地域过滤：回疆/大漠/草原（射雕、书剑、白马）加权弯刀、皮甲、马靴；江南（天龙燕子坞、笑傲梅庄）加权折扇、玉佩、丝履；塞北（天龙、鹿鼎）加权皮裘（轻甲，`af_yuhan` 权重 ×3）。区域标注归 design/11。
- 随机池从不产出：天级（R2）、名器、名门暗器、`heavy` 重兵中的神兵。

### 4.9 装备合计上限（本文专属，叠加在 06 §11.1 族上限之上）

| 项 | 上限（来自装备：主属性固有 + 词条 + 工艺 + 铭文 + 专属特效数值部分） | 溢出 |
|---|---|---|
| 单项评级 flat（`hit` `eva` `parry` `pierce` `crit` `tough` `effHit` `effRes`） | +40（牌的 `parry` 底值 `10 + 3×G` 另计） | 无效，面板灰显 |
| `hpMax` / `mpMax` pct | 各 +25% | 同上 |
| 先天临时加值 | 单项 +8、七项合计 +20 | 同上 |
| 技艺临时加值 | 单项 +15 | 同上 |
| `apHidden` | +12 | 同上 |
| 开场护体 | 10% `hpMax`（仍受 03 `shieldMax`） | 同上 |
| `mov` / `jump` flat | 各 +1（06 `fam_move` 另计 Buff） | 同上 |
| 触发词条 + 专属特效触发 | 同一次命中至多结算 2 个装备来源的触发（按 `priority`） | 其余本次不判定 |

---

## 5. 神兵与宝甲

### 5.1 神兵通用规则

> **AR-20 后发例外**：基准 §14 的 12 件仍是唯一 `divine:true` 神兵宝甲，且继续完整享用下表通则。十一类名录为满足“天地玄黄等级对应物品”，可收录额外天级具名装备，但必须标 `catalogTian:true`、`divine:false`、`flags:[unique]`、`price:null`；七列投影中的 `unique=true` 序列化时等价写入 `flags:[unique]`。这些样本仅由固定剧情／奇遇节点产出，不进随机池、锻造、商店或天材骰，只可修复。它们没有“神兵护主”、两段专属、器合或藏史优待，除非未来基准逐件吸收。非天级名录条目仍须 ≤ 地上 9。

| 规则 | 内容 |
|---|---|
| 神兵封闭名录 | **`divine` 天级装备 = 基准 §14 的 12 件**；AR-20 `catalogTian` 不计神兵。12 件全部 `divine: true`、`uniqueEquipped: true`、`price: null`、`flags:[unique]`。随机池与锻造不产出任何天级装备 |
| 固定词条 | 天下 3 条、天中/天上 4 条，`q = 1.00`，不可重铸；可另加工艺与铭文（§6.3–6.4）。 |
| 专属特效 | 每件 2 条：**① 核心特效**（`core: true`，压制到地阶仍保留）与 **② 天阶特效**（仅 `gUse ≥ 10` 生效）；分档规则见 §7.3。特效中的非战斗部分（身份、对话、世界事件）不受压制。 |
| 神兵护主（通用） | 天级**兵器**另常驻 06 `bf_mian_pobing`（免疫缴械与断兵），品阶 = `gUse`；06 定义其品阶区间为 10–12，故 `gUse < 10` 时不生成（压制后的神兵可被缴械）。 |
| 获取节点 | 只在 chapters/ 配置的固定节点获得，遵守 02 R3 进度门槛（天下 ≥ 主线第 3 幕、天中 ≥ 第 4 幕、天上 ≥ 第 5 幕或终盘）；锚点所需者标 `anchorLocked`，锚点完成前不可取得/带离（02 HM6）。 |
| 预算 | 天级装备**不计入** 02 R4 的 `playerTianBudget`（该预算只计武学）【建议，02 确认】；天然受"每书界 1–3 件原生神兵"约束。 |
| 强化与修复 | 可强化至 +10（+9/+10 需天材，§6.2）；不可锻造，只可修复（03 §8.2）。 |
| 器合与藏史 | 打狗棒、软猬甲、冷月宝刀可器合（02 §5.8）；藏史侵蚀至多 −1（02 §6.6 S6）。 |
| 数值口径 | 神兵主属性**不另加"神兵系数"**（`mainK = 1`，仅类别与标签系数），与 03 §9.3–9.4 的示例一致；神兵之强在于天阶 G、4 条满品相词条与专属特效。 |

### 5.2 十二件天级神兵宝甲

> 专属特效数值中的 `gUse` 均指使用品阶；概率类写作 `a% + b% × gUse` 时，天上（12）取上限值。所有 Buff 为 06 已定义条目。

**① 倚天剑 `eq_yitianjian`**（剑 · 单手 · 天上 12 · `metal`）

| 项 | 内容 |
|---|---|
| 固定词条 | 锋锐、透甲、破招、会心 |
| ① 核心 `ue_yitianjian_1`「削铁如泥」 | 兵器招式命中持械目标、或攻击被持械目标招架（`onParried`）时，以 `12% + 1% × gUse`（天上 24%）概率对其主武器执行 06 `weaponBreak: break`（→ `bf_duanbing`，品阶 `gUse`）；目标兵器为神兵且品阶 ≥ 本剑 `gUse` 时无效（06） |
| ② 天阶 `ue_yitianjian_2`「倚天不出，谁与争锋」 | 本人剑类招式 `Z3 +8%`；本人剑类绝招不会被 06 §8.6.2 天阶"破招"作废 |
| 联动 | 峨眉派剑法（catalog）→ 正式套装 `set_yitian_emei`（成员与档位见 `design/07` §13.3）；与屠龙刀同在背包时可选择"刀剑互斫"事件 `ev_04_daojianhuzhuo`：取出《九阴真经》《武穆遗书》等藏物，两器变为"倚天断剑" `eq_yitianduanjian` / "屠龙断刀" `eq_tulongduandao`（地上 9 名器，保留①、无②；断器后续为**原创扩展**）。必须同时提供不损毁两器的替代取经路线，二者奖励等价（P20）。**（待考）**核对《倚天屠龙记》三联/广州修订版中刀剑互斫后的断刃流转；考据完成前不据此追加唯一任务门槛 |
| 获取 | 倚天·峨眉/赵敏线，≥ 第 5 幕（chapters/04） |
| 原著出处 | 倚天·郭靖、黄蓉铸成倚天剑与屠龙刀，剑中藏武学秘笈，刀中藏《武穆遗书》；灭绝师太持倚天剑，后为周芷若所得。**（待考）**核对《倚天屠龙记》三联/广州修订版中铸材是否明确掺入西方精金、剑内秘笈的准确组成及断刃流转；"武林至尊，宝刀屠龙，号令天下，莫敢不从；倚天不出，谁与争锋"须据该版本逐字校勘 |

**② 屠龙刀 `eq_tulongdao`**（刀 · **双手** · `heavy` · 天上 12 · `metal` · 需求 `str ≥ 40 + 3 × gUse`，天上时 76）

| 项 | 内容 |
|---|---|
| 固定词条 | 锋锐、势沉、杀意、破招 |
| ① 核心 `ue_tulongdao_1`「削铁如泥」 | 同倚天剑① |
| ② 天阶 `ue_tulongdao_2`「号令天下，莫敢不从」 | `onBattleStart`：对 4 格内敌方**普通**单位施加 `bf_zhenshe`（品阶 `gUse`），精英 50% 概率，Boss 免疫；每战 1 次 |
| 非战斗 | 「宝刀招祸」：持有屠龙刀（装备或背包）时，本书界遭遇表加入"夺刀者"事件（每游戏日 5%【建议值，11 配置】），击退得声望；不受压制 |
| 联动 | 刀中《武穆遗书》→"刀剑互斫"；谢逊、冰火岛回响（02 §6.3 `carry:eq_tulongdao`） |
| 获取 | 倚天·冰火岛/谢逊线，≥ 第 5 幕（chapters/04） |
| 原著出处 | 倚天·屠龙刀中藏《武穆遗书》；谢逊在王盘山扬刀后携往冰火岛。**（待考）**核对《倚天屠龙记》三联/广州修订版中与倚天剑的铸造措辞、王盘山前后流转及刀重原文 |

**③ 玄铁重剑 `eq_xuantiejian`**（剑 · **双手** · `heavy` · 天中 11 · `metal` · 需求 `str ≥ 40 + 3 × gUse`，天中时 73）

| 项 | 内容 |
|---|---|
| 固定词条 | 透甲、破招、杀意、韧性 |
| ① 核心 `ue_xuantiejian_1`「重剑无锋，大巧不工」 | 本剑的兵器招式不能暴击（`onBeforeCrit: noCrit`），改为常驻 `Z3 +12%`；目标对本剑招式的招架率 ×0.5（04 判定乘数 `targetParryMult`） |
| ② 天阶 `ue_xuantiejian_2`「剑冢遗风」 | 装配玄铁剑法 `sk_xuantie` 时：其招式常驻 06 `bf_wushi_zhaojia`（取代①的招架 ×0.5），且 `Z3 +8%` |
| 联动 | 玄铁剑法 `weaponReq.tags: [heavy]`（05）；携入倚天与倚天剑/屠龙刀同场触发"三器共鸣"彩蛋（02 §5.8，无数值）；不可器合 |
| 获取 | 神雕·剑冢（神雕引路），≥ 第 4 幕（chapters/03） |
| 原著出处 | 神雕·杨过在剑冢取得玄铁重剑，依石刻领会重剑境界；倚天追述其后用于铸造倚天剑、屠龙刀。**（待考）**核对《神雕侠侣》三联/广州修订版剑冢石刻全文及剑重是否作“八八六十四斤” |

**④ 打狗棒 `eq_dagoubang`**（棍 · **单手**（竹棒轻巧）· 天中 11 · `wood` · `kA 0.95`）

| 项 | 内容 |
|---|---|
| 固定词条 | 架格、精准、伺机、灵动 |
| ① 核心 `ue_dagoubang_1`「绿竹如意」 | 装配打狗棒法 `sk_dagou` 时，其招式附带的控制类效果（06 `bf_dingshen`、`bf_shouqin` **4 级**、`bf_chaofeng`、`bf_jieji`、`bf_polu` 等，以 05/catalog 为准）施加概率 ×1.25（05 招式 `buffs.chance` 乘数）；受擒载荷保留招式给定的持续与维持距离 |
| ② 天阶 `ue_dagoubang_2`「群丐听令」 | 己方每有 1 名丐帮身份单位在场（含召援，09），本人 `Z4 +2%`，至多 +6% |
| 非战斗 | 丐帮帮主信物：丐帮 NPC 以帮主信物视之（对话、身份检定、支线，归 12）；非帮主持棒会引出"归还"支线（02 §5.8） |
| 获取 | 天龙/射雕/神雕/倚天丐帮线（chapters/01–04）；外来实例可器合 |
| 原著出处 | 丐帮帮主信物与打狗棒法传承相联，天龙、射雕、神雕、倚天均有对应丐帮情节。**（待考）**核对《天龙八部》《射雕英雄传》《神雕侠侣》《倚天屠龙记》三联/广州修订版中历代持有人交接次序及竹棒外形原文 |

**⑤ 软猬甲 `eq_ruanweijia`**（内甲 · `innerBody` · 天下 10 · `metal`）

| 项 | 内容 |
|---|---|
| 固定词条 | 坚甲、浑元、体魄 |
| ① 核心 `ue_ruanweijia_1`「猬刺」 | 常驻 06 `bf_weici`（被拳脚招式命中时，攻击者受其 `hpMax × 1%×G` 伤害并流血 1 层） |
| ② 天阶 `ue_ruanweijia_2`「刀枪难入」 | 常驻 06 `bf_daoqiang`，参数 ×0.5（剑、刀、枪、奇门、暗器招式的外劲部分 `Z4 +4%×G`，类别同 06） |
| 联动 | 桃花岛武学可组成正式套装 `set_taohuadao`；本装备不计件（见 `design/07` §10.2） |
| 获取 | 射雕·桃花岛/黄蓉羁绊线，≥ 第 3 幕（chapters/02）；神雕原生实例可器合，持有人与取得节点由章节稿依原著流转核定 |
| 原著出处 | 射雕·软猬甲为桃花岛宝物，黄蓉贴身穿着，能御刀剑且有倒刺伤及击打者。**（待考）**核对《射雕英雄传》《神雕侠侣》三联/广州修订版中黄药师、黄蓉之间的来历措辞，以及神雕时期持有人 |

**⑥ 圣火令 `eq_shenghuoling`**（奇门 `token` · 单手 · 天下 10 · `metal`）

| 项 | 内容 |
|---|---|
| 固定词条 | 破招、精准、会心 |
| ① 核心 `ue_shenghuoling_1`「令随拳走」 | 装配圣火令武功 `sk_shenghuoling`（基准 §13：拳脚·拳）时，该武学 `Mod_armed = 1.00`（不受持械降效），且其招式 `Z3 +8%`（原创扩展） |
| ② 天阶 `ue_shenghuoling_2`「圣火诡变」 | 圣火令武功招式附带的心神/失衡类效果（以 catalog 为准，如 06 `bf_mihuo` `bf_shiheng`）施加概率 ×1.20 |
| 非战斗 | 明教圣物：明教 NPC 认令（对话、身份，chapters/04） |
| 获取 | 倚天·灵蛇岛/波斯三使线，≥ 第 3 幕（chapters/04） |
| 原著出处 | 倚天·圣火令出自波斯明教总教，令上刻有武功，波斯三使以令为兵器；本作一件实例代表整套令牌。**（待考）**核对《倚天屠龙记》三联/广州修订版中令牌枚数与材质原文 |

**⑦ 金蛇剑 `eq_jinshejian`**（剑 · 单手 · 天下 10 · `metal`）

| 项 | 内容 |
|---|---|
| 固定词条 | 会心、连环、破招 |
| ① 核心 `ue_jinshejian_1`「金蛇吐信」 | 兵器招式命中持械目标时，以 `8% + 0.5% × gUse`（天下 13%）概率对其施加 06 `bf_jiaoxie`（缴械；神兵按 06 免疫） |
| ② 天阶 `ue_jinshejian_2`「金蛇秘笈」 | 装配金蛇剑法 `sk_jinshejian` 时，其招式常驻 06 `bf_wushi_zhaojia`（无视招架；06 已注"金蛇剑法奇诡难架"） |
| 联动 | 金蛇锥与金蛇剑法保留独立联动；旧“金蛇三宝”候选按 `design/07` §19.3 不进入 v1 |
| 获取 | 碧血·华山金蛇洞线（玩家与袁承志的关系与分配由 chapters/07 设计，基准 §16-4） |
| 原著出处 | 碧血·金蛇剑、金蛇锥及秘笈皆与夏雪宜遗藏相联，袁承志在华山洞中取得。**（待考）**核对《碧血剑》三联/广州修订版中剑身与剑尖形制原文 |

**⑧ 韦小宝匕首 `eq_bishou`**（奇门 `dagger` · 单手 · 天下 10 · `metal`）

| 项 | 内容 |
|---|---|
| 固定词条 | 会心、透甲、势沉 |
| ① 核心 `ue_bishou_1`「削铁如泥」 | 同倚天剑①（概率 `12% + 1% × gUse`，天下 22%） |
| ② 天阶 `ue_bishou_2`「出其不意」 | 背击（04 Z7 `back`）伤害 `Z3 +15%`；`onBattleStart` 获得 06 `bf_bibao`（必暴）×1 |
| 联动 | 护身宝衣与相关武学保留独立联动；旧“韦爵爷”候选按 `design/07` §19.3 不进入 v1 |
| 获取 | 鹿鼎·抄没鳌拜家产一线（原著归韦小宝，玩家的获得途径如赌局、赠予由 chapters/08 设计） |
| 原著出处 | 鹿鼎·韦小宝持有削铁如泥的匕首，来历与鳌拜家产相联。**（待考）**核对《鹿鼎记》三联/广州修订版中取得次序及匕首外形原文 |

**⑨ 护身宝衣 `eq_baoyi`**（衣 · 中甲 · 天下 10 · `fabric`）

| 项 | 内容 |
|---|---|
| 固定词条 | 坚甲、韧性、体魄 |
| ① 核心 `ue_baoyi_1`「刀枪不入」 | 常驻 06 `bf_daoqiang`（剑、刀、枪、奇门、暗器招式的外劲部分 `Z4 +8%×G`，免疫品阶 ≤ 本衣的流血） |
| ② 天阶 `ue_baoyi_2`「宝衣护身」 | 每战首次受到兵器/暗器招式的致死伤害时，气血改为 1（机制同 06 `bf_suoxue` ×1，计入其每战次数并获得"重创"） |
| 获取 | 鹿鼎（chapters/08） |
| 原著出处 | 鹿鼎·韦小宝贴身穿宝衣，曾凭其抵御兵刃。**（待考）**核对《鹿鼎记》三联/广州修订版中宝衣来历、材质及各次护身情节 |

**⑩ 乌蚕衣 `eq_wucanyi`**（衣 · 中甲 · 天下 10 · `fabric`）

| 项 | 内容 |
|---|---|
| 固定词条 | 坚甲、浑元、灵动 |
| ① 核心 `ue_wucanyi_1`「刀枪不入」 | 常驻 06 `bf_daoqiang` |
| ② 天阶 `ue_wucanyi_2`「乌衣夜行」（原创扩展） | 夜间或暗处地形（08 标注）`attr:eva pct +10%`；探索中夜间被 NPC 发现距离 −30%（11） |
| 获取 | 连城（chapters/09） |
| 原著出处 | 连城·乌蚕衣刀剑难伤，后来为狄云所得。**（待考）**核对《连城诀》三联/广州修订版中取得经过与材质描写 |

**⑪ 鸳鸯刀 `eq_yuanyangdao`**（刀 · **成对** · 天下 10 · `metal`；主属性按成对 `0.36`）

| 项 | 内容 |
|---|---|
| 固定词条 | 连环、会心、伺机 |
| ① 核心 `ue_yuanyangdao_1`「鸳鸯合璧」 | `attr:combo pp +10`；装配夫妻刀法（catalog，基准 §13 注：地中、合击）且合击搭档在 2 格内时，该武学招式 `Z3 +10%` |
| ② 天阶 `ue_yuanyangdao_2`「仁者无敌」 | 品德 `morality ≥ 60` 时：本人 `Z4 +6%`；敌方**普通**单位气血 ≤ 30% 时，其每回合开始 15% 概率"弃械投降"（离场；经验按 `design/13` §2.4.1，降服与击杀同为 ×1.0；声望与投降流程归 09） |
| 获取 | 鸳鸯刀主线（chapters/11）；剧情分持阶段只记录两刀去向，不生成两份成对装备；终局取得成对实例时原子收束剧情持有记录，仍只计 1 件 |
| 原著出处 | 鸳鸯刀·鸳刀、鸯刀是一对宝刀，江湖争夺所求的秘密归于“仁者无敌”。**（待考）**核对《鸳鸯刀》三联/广州修订版中两刀长短归属及揭示方式 |

**⑫ 冷月宝刀 `eq_lengyuedao`**（刀 · 单手 · 天下 10 · `metal`）

| 项 | 内容 |
|---|---|
| 固定词条 | 锋锐、势沉、杀意 |
| ① 核心 `ue_lengyuedao_1`「冷月寒光」 | 刀类招式命中时 30% 施加 06 `bf_hanqi` 1 层（品阶 `gUse`） |
| ② 天阶 `ue_lengyuedao_2`「胡家传刀」 | 装配胡家刀法 `sk_hujiadao` 时：06 `bf_zhanyi`（战意）层数上限 +2，刀类招式 `Z3 +6%` |
| 获取 | 飞狐、雪山（chapters/13、14）；雪山原生实例可器合（02 §5.8） |
| 原著出处 | 飞狐、雪山·冷月宝刀与胡一刀、胡斐一脉相联。**（待考）**核对《飞狐外传》《雪山飞狐》三联/广州修订版中得刀流转，以及所谓“刀中秘密”是否确有原著依据；考据完成前不以其驱动任务 |

**天级汇总**

| # | 名称 | 类别 | 品阶 | 书界 | 核心特效 | 天阶特效 | 可器合 |
|---|---|---|---|---|---|---|---|
| 1 | 倚天剑 | 剑 | 天上 | 倚天 | 削铁如泥 | 剑招 +8%、绝招不被破 | ✗ |
| 2 | 屠龙刀 | 刀（重） | 天上 | 倚天 | 削铁如泥 | 开场震慑 | ✗ |
| 3 | 玄铁重剑 | 剑（重） | 天中 | 神雕 | 不暴击、+12%、招架 ×0.5 | 配玄铁剑法无视招架 | ✗ |
| 4 | 打狗棒 | 棍（单手） | 天中 | 天龙—倚天 | 打狗棒法控制 ×1.25 | 群丐听令 | ✅ |
| 5 | 软猬甲 | 衣 | 天下 | 射雕、神雕 | 猬刺 | 半额刀枪不入 | ✅ |
| 6 | 圣火令 | 奇门（令） | 天下 | 倚天 | 令随拳走 | 诡变 ×1.20 | ✗ |
| 7 | 金蛇剑 | 剑 | 天下 | 碧血 | 金蛇吐信（缴械） | 配金蛇剑法无视招架 | ✗ |
| 8 | 韦小宝匕首 | 奇门（匕） | 天下 | 鹿鼎 | 削铁如泥 | 背击 +15%、首击必暴 | ✗ |
| 9 | 护身宝衣 | 衣 | 天下 | 鹿鼎 | 刀枪不入 | 锁血 ×1（兵器暗器） | ✗ |
| 10 | 乌蚕衣 | 衣 | 天下 | 连城 | 刀枪不入 | 乌衣夜行 | ✗ |
| 11 | 鸳鸯刀 | 刀（成对） | 天下 | 鸳鸯 | 鸳鸯合璧 | 仁者无敌 | ✗ |
| 12 | 冷月宝刀 | 刀 | 天下 | 飞狐、雪山 | 冷月寒光 | 胡家传刀 | ✅ |

### 5.3 完整 YAML 示例：倚天剑

```yaml
# content/common/items/divine.yaml
- id: eq_yitianjian
  name: 倚天剑
  kind: weapon
  slot: mainHand
  cat: sword
  hands: 1
  grade: 12
  divine: true
  uniqueEquipped: true
  matFamily: metal
  chapters: [ch04_yitian]
  origin: canon
  canonRef: 倚天·郭靖黄蓉铸成倚天剑（追述），灭绝师太持有，后为周芷若所得；**（待考）**核对三联/广州修订版的铸材细目与剑内秘笈组成
  price: null
  flags: [unique]
  fixedAffixes:
    - { id: af_fengrui, q: 1.00 }
    - { id: af_toujia,  q: 1.00 }
    - { id: af_pozhao,  q: 1.00 }
    - { id: af_huixin,  q: 1.00 }
  uniques:
    - id: ue_yitianjian_1
      name: 削铁如泥
      core: true
      lowTier: half                     # 玄阶及以下：概率减半（§7.3）
      triggers:
        - on: onHit                     # 06 §6.1（P7 造成伤害后）
          when: "ctx.move.category == 'weapon' && mainCat(ctx.target) != 'unarmed'"
          chance: "0.12 + 0.01 * gUse"
          limitPerTurn: 1
          ops: [ { op: weaponBreak, mode: break, target: ctx.target, grade: gUse } ]
        - on: onParried                 # 我方攻击被对方招架
          when: "mainCat(ctx.target) != 'unarmed'"
          chance: "0.12 + 0.01 * gUse"
          limitPerTurn: 1
          ops: [ { op: weaponBreak, mode: break, target: ctx.target, grade: gUse } ]
    - id: ue_yitianjian_2
      name: 倚天不出，谁与争锋
      core: false
      lowTier: seal                     # 地阶及以下封存
      mods:
        - { op: modZone, zone: Z3, value: 0.08, when: "ctx.move.subType == 'sword'" }
      rules: [ ultimateUnbreakable ]    # 本人剑类绝招不被天阶"破招"作废（06 §8.6.2）
  passives: [ { buff: bf_mian_pobing, grade: gUse, minGUse: 10 } ]   # 神兵护主（§5.1）
  setTags: [ set_yitian_emei ]          # 07 §13.3 正式反向标签
  events: [ ev_04_daojianhuzhuo ]       # 刀剑互斫（chapters/04 决定是否采用）
  assets: { icon: equip/yitianjian, model: wpn_sword_yitian }
  text:
    short: 天上神兵·剑
    desc: "削铁如泥：兵器招式命中持械者或被其招架时，{p:%} 断其兵刃。{if gUse>=10}倚天不出：剑类招式伤害 +8%，剑类绝招不为破招所制。{/if}"
    lore: 武林至尊，宝刀屠龙，号令天下，莫敢不从；倚天不出，谁与争锋。
```

### 5.4 地阶 / 玄阶名器（47 件）

名器通用规则：`uniqueEquipped: true`、`flags: [unique]`、不可普通出售；只能按估值 30% 典当，并在**本书界内**按原典价赎回（P21，§13）；固定词条 `q = 1.00`（地上 3 条、地中 2–3 条、地下 2 条、玄阶 1–2 条），另可有 0–1 个随机词条位（由条目 `affixRoll` 指定，默认 0）；专属特效 1 条，默认 `core: true`（压制规则同 §7.3）。"获取"一列为给 chapters/ 的建议，具名 NPC 的兵器带 `signature`（§3.6）。

| # | 名称 · ID | 书界 | 类别 · 手持 | 品阶 | 固定词条 | 专属特效（`ue_<ID>_1`） | 获取（建议） | 原著出处 |
|---|---|---|---|---|---|---|---|---|
| 1 | 鳄嘴剪 `eq_ezuijian` | 天龙 | 奇门 `misc` · 单 | 玄上 | 势沉、破招 | 「鳄口剪兵」：命中持 `soft`/鞭索兵器者 15% 施加 `bf_duanbing`；与鳄尾鞭同装（主剪副鞭）时 `critDmg +10pp` | 南海鳄神羁绊/比武（chapters/01） | 天龙·南海鳄神岳老三的兵器鳄嘴剪、鳄尾鞭 |
| 2 | 鳄尾鞭 `eq_eweibian` | 天龙 | 鞭索 · 单 | 玄上 | 精准、绊足 | 「鳄尾横扫」：命中 10% 施加 `bf_jitui` 1 格 | 同上 | 同上 |
| 3 | 段延庆钢杖 `eq_duanyanqingzhang` | 天龙 | 棍杖 · **成对**（两根细杖） | 地中 | 精准、认穴、破招 | 「杖代指力」：一阳指 `Mod_armed = 1.00`、射程 +1（§3.2）；「以杖代足」：免疫品阶 ≤ `gUse` 的 `bf_panshan` | 段延庆线（`signature`，剧情可得） | 天龙·段延庆双腿残废，以两根细钢杖代足，并以杖尖运使一阳指；名称为本文描述名 |
| 4 | 白驼蛇杖 `eq_baituoshezhang` | 射雕 | 棍杖 · 单 | 地上 | 精准、透甲、杀意 | 「灵蛇杖」：兵器招式命中 25% 施加 `bf_shedu` 1 层；每战 1 次"杖中暗器"（`aoe_bolt` 射程 4、×0.8、附蛇毒，无需暗器囊；**原创扩展**） | 欧阳锋终盘线（`signature`） | 射雕·欧阳锋所持蛇杖，杖上盘有毒蛇。**（待考）**核对《射雕英雄传》三联/广州修订版中欧阳锋用杖情节的杖头双蛇、机括与暗器原文 |
| 5 | 玉箫 `eq_yuxiao` | 射雕 | 奇门 `flute` · 单 | 地上 | 精准、认穴、调息 | 「箫中有剑」：玉箫剑法（catalog）招式 `Z3 +8%`；装配碧海潮生曲 `sk_bihai` 时其心神效果施加概率 ×1.25 | 桃花岛拜师/羁绊 | 射雕·黄药师随身玉箫，吹碧海潮生曲，亦以之为兵器 |
| 6 | 毒菱 `eq_duling` | 射雕 | 名门暗器 `dart`（每战 12） | 玄上 | 精准、会心 | 「喂毒铁菱」：命中必定施加 `bf_zhongdu` 1 层 | 江南七怪羁绊 | 射雕·柯镇恶以四面带尖角的铁菱为独门暗器，并有喂毒的毒菱 |
| 7 | 柯镇恶铁杖 `eq_kezhenezhang` | 射雕 | 棍杖 · 单 | 玄中 | 架格 | 「听风辨器」：常驻 06 `bf_tingfeng`（品阶 `gUse`） | 同上 | 射雕·“飞天蝙蝠”柯镇恶目盲，以铁杖为兵器；“柯镇恶铁杖”是本文描述名，不宣称原著另有专名 |
| 8 | 成吉思汗金刀 `eq_jindao` | 射雕 | 刀 · 单 | 地下 | 锋锐、势沉 | 「金刀驸马」：`rageGain +10pp`；非战斗：蒙古势力 NPC 好感 +20、可通行蒙古军营（02 C10 回响） | 蒙古线赏赐（原创扩展：同批赏赐之刀） | 射雕·成吉思汗以金刀赐郭靖，称"金刀驸马" |
| 9 | 洪七公酒葫芦 `eq_jiuhulu` | 射雕 | 佩饰 `gourd` | 地下 | 聚势、回春、耐力 | 「醉中求真」：战斗中"饮"为附加动作（每战 3 次）→ `bf_zuiyi` 1 层；装配降龙十八掌时每层醉意使降龙招式 `Z3 +3%`（原创扩展） | 洪七公羁绊赠物（原创扩展） | 射雕·洪七公背负的大红酒葫芦（物件为原著，效果原创扩展） |
| 10 | 君子剑 `eq_junzijian` | 神雕 | 剑 · 单 | 地中 | 锋锐、准心、破招 | 「君子好逑」：与装备淑女剑的羁绊队友相距 ≤ 2 格时双方 `Z3 +6%`；二人合璧玉女素心剑法时再 `Z3 +6%` | 绝情谷线 | 神雕·绝情谷藏有君子剑、淑女剑，杨过、小龙女取剑后以之合使玉女素心剑法；后郭芙以君子剑斩断杨过右臂 |
| 11 | 淑女剑 `eq_shunvjian` | 神雕 | 剑 · 单 | 地中 | 会心、灵动、连环 | 同君子剑 | 同上 | 同上 |
| 12 | 金轮 `eq_jinlun` | 神雕 | 奇门 `wheel` · 单 | 地上 | 破招、势沉、透甲 | 「五轮齐飞」：每战 2 次掷轮（`aoe_chain` n=2、×0.9，无需暗器囊）；装配龙象般若功时 `bf_longxiang` 每层另 `Z3 +0.5%` | 金轮法王终盘（`signature`） | 神雕·金轮法王以金、银、铜、铁、铅五轮为兵器 |
| 13 | 紫薇软剑 `eq_ziweiruanjian` | 神雕 | 剑 · 单 · `soft` | 地上 | 灵动、连环、会心 | 「不祥之剑」：兵器招式命中 12% 施加 `bf_shouqin` **4 级**、持续 2 次目标自身行动，`source=命中者`、`holdRange=1`；**代价**：攻击时 3% 误伤 2 格内一名友方（×0.5） | 剑冢深谷奇遇（原创扩展：寻回弃剑，需 `qg3`） | 神雕·剑冢石刻载紫薇软剑为独孤求败三十岁前所用，因误伤义士而弃入深谷；本作寻回与 3% 友伤是**（原创扩展）** |
| 14 | 独孤利剑 `eq_dugulijian` | 神雕 | 剑 · 单 | 地中 | 锋锐、杀意、破招 | 「凌厉刚猛」：对气血 ≥ 70% 的目标兵器招式 `Z3 +10%` | 剑冢 | 神雕·剑冢第一柄为无名利剑，石刻述其凌厉刚猛、无坚不摧，是独孤求败弱冠前所用；“独孤利剑”为本文描述名 |
| 15 | 独孤木剑 `eq_dugumujian` | 神雕 | 剑 · 单 | 玄上 | 灵动、守一 | 「草木竹石均可为剑」：本剑 `gUse = clamp(装配剑法最高 effGrade − 1, 6, 9)`（人剑合一，至多地上） | 剑冢 | 神雕·剑冢第三柄为木剑，石刻述四十岁后不滞于物、草木竹石均可为剑；“独孤木剑”为本文描述名 |
| 16 | 金铃索 `eq_jinlingsuo` | 神雕 | 鞭索 · 单 | 地下 | 精准、认穴 | 「金铃打穴」：鞭类招式命中 8% 施加 `bf_xueweishoufeng` **9 级**、持续 1 次目标自身行动，`source=命中者`，`targetAcupoint={mode: targetPrimaryRouteKey}`；按 06 的硬控互斥、坚毅与 Boss 递减结算 | 古墓线 | 神雕·小龙女以末端系金铃的白绸带/金铃软索点穴破阵 |
| 17 | 李莫愁拂尘 `eq_fuchen` | 神雕 | 鞭索 · 单 · `soft` | 地下 | 精准、蕴劲 | 「拂尘卷打」：命中 15% 施加 `bf_polu` | 李莫愁线（`signature`） | 神雕·"赤练仙子"李莫愁以拂尘为兵器 |
| 18 | 冰魄银针 `eq_bingpoyinzhen` | 神雕 | 名门暗器 `needle`（每战 10） | 地中 | 精准、透甲 | 「冰魄」：命中施加 `bf_judu`；**取针须戴手套**：护手无 `glove` 标签时，每战首次使用 50% 自中 `bf_zhongdu` 1 层 | 李莫愁线 | 神雕·李莫愁的冰魄银针剧毒；杨过触碰遗针中毒，黄蓉也以树枝夹针。50% 自中概率是**（原创扩展）** |
| 19 | 玉蜂针 `eq_yufengzhen` | 神雕 | 名门暗器 `needle`（每战 12） | 地下 | 准心、精准 | 「蜂尾之毒」：命中施加 `bf_mabi`（06 已注"玉蜂针附麻痹"） | 古墓线 | 神雕·玉蜂针为古墓派暗器，以六成黄金、四成精钢制成细针，并以玉蜂尾刺毒液淬制 |
| 20 | 金刀黑剑 `eq_jindaoheijian` | 神雕 | 刀＋剑 · **成对** | 地中 | 锋锐、破招、伺机 | 「阴阳倒转」：附加动作切换视为刀/剑（§3.2）；切换后下一招 `Z3 +10%` | 公孙止终盘（`signature`） | 神雕·绝情谷主公孙止以锯齿金刀、黑剑双持，施展阴阳倒乱刃法 |
| 21 | 达尔巴金杵 `eq_jinchu` | 神雕 | 奇门 `pestle` · 双 · `heavy` | 地下 | 势沉、震慑 | 「降魔杵」：杵类招式击退距离 +1 | 达尔巴线 | 神雕·达尔巴以粗长沉重、金光闪闪而似纯金所铸的金刚降魔杵为兵器 |
| 22 | 霍都折扇 `eq_huoduzheshan` | 神雕 | 奇门 `fan` · 单 | 玄上 | 灵动、精准 | 「扇中毒钉」：每战 2 次射出毒钉（`aoe_bolt` 射程 3、×0.7、附 `bf_zhongdu`，无需暗器囊） | 霍都线 | 神雕·霍都以折扇为兵器，扇柄机括可从扇骨射出四枚毒钉 |
| 23 | 银钩铁划 `eq_yingoutiehua` | 倚天 | 奇门 `hook`＋`brush` · **成对** | 地中 | 认穴、精准、架格 | 「书法入武」：书法类武学（张三丰所书二十四字化成之功等，catalog 定）威力 ×(1 + `art`/200)（03 §8.2），且 `Z3 +6%` | 武当/冰火岛线 | 倚天·张翠山号"银钩铁划"，左手烂银虎头钩、右手镔铁判官笔 |
| 24 | 鹿杖 `eq_luzhang` | 倚天 | 棍杖 · 单 | 地中 | 蕴劲、震慑 | 「玄冥寒气」：装配玄冥神掌 `sk_xuanming` 时，杖类招式命中 20% 施加 `bf_hanqi` 1 层 | 鹿杖客（`signature`） | 倚天·玄冥二老之鹿杖客以鹿角杖为兵器 |
| 25 | 鹤嘴双笔 `eq_hebi` | 倚天 | 奇门 `brush` · **成对** | 地中 | 认穴、精准、会心 | 「鹤嘴点穴」：笔类招式命中 10% 施加 `bf_xueweishoufeng` **9 级**、持续 1 次目标自身行动，`source=命中者`，`targetAcupoint={mode: targetPrimaryRouteKey}`；按 06 的硬控互斥、坚毅与 Boss 递减结算；装配玄冥神掌时同鹿杖寒气规则 | 鹤笔翁（`signature`） | 倚天·玄冥二老之鹤笔翁以鹤嘴双笔为兵器；保留既有 ID `eq_hebi`，只纠正展示名与 `hands` |
| 26 | 乾坤一气袋 `eq_qiankunyiqidai` | 倚天 | 奇门 `misc` · 单 | 地下 | 架格、稳重 | 「一气罩人」：命中时，若目标当前主运内功 `effGrade≥10`，且为 `nature:yang` **或**九阳神功 `sk_jiuyang`，则本次定身无效，本袋本场"迸裂"失效；否则按 12% 施加 `bf_dingshen`。九阳为调和，按具名特例触发；辅运不触发，两分支共用天阶有效品阶门槛（规则为**原创扩展**；性质见 `catalog/skills-yitian` §2.1） | 明教五散人线 | 倚天·布袋和尚说不得的乾坤一气袋，张无忌被装入后以九阳真气将其撑破 |
| 27 | 峨眉铁指环 `eq_tiezhihuan` | 倚天 | 佩饰 `ring` | 玄上 | 守一、定心 | 「掌门信物」：装配峨眉派武学 ≥ 2 门时 `Z4 +4%`；非战斗：峨眉 NPC 认物（身份、对话） | 峨眉线（`anchorLocked` 视章节） | 倚天·灭绝师太将峨眉派掌门铁指环传给周芷若，周芷若曾以此证明掌门身份。**（待考）**核对三联/广州修订版是否明言该环始自郭襄 |
| 28 | 蚊须针 `eq_wenxuzhen` | 倚天 | 名门暗器 `needle`（每战 15） | 地下 | 准心、会心 | 「细如蚊须」：本暗器对目标闪避判定视为 `hit +10`；命中施加 `bf_zhongdu` 1 层 | 天鹰教线 | 倚天·殷素素使用细小的蚊须针；**（待考）**核对《倚天屠龙记》三联/广州修订版中王盘山前后针上是否明确淬毒；考据完成前中毒效果按**（原创扩展）**处理 |
| 29 | 绣花针 `eq_xiuhuazhen` | 笑傲 | 奇门 `misc` · 单（`mainK 0.65`） | 地上 | 会心、连环、准心 | 「以针代剑」（§3.2）：装配葵花宝典时剑类武学可用（×0.95），并 `attr:spd pct +5%` | 黑木崖终盘（`signature`） | 笑傲·东方不败以一枚绣花针对敌 |
| 30 | 七弦琴 `eq_qixianqin` | 笑傲 | 奇门 `qin` · 双 | 地中 | 精准、调息、蕴劲 | 「七弦无形剑」：音功/音律类武学（catalog）威力 ×(1 + `music`/200)，其心神效果施加概率 ×1.20 | 梅庄（以《广陵散》相易，§11.5） | 笑傲·梅庄黄钟公以琴音为武（七弦无形剑） |
| 31 | 秃笔翁之笔 `eq_tubiwengbi` | 笑傲 | 奇门 `brush` · 单 | 地下 | 认穴、蕴劲 | 「裴将军诗」：书法类武学威力 ×(1 + `art`/200)；`art ≥ 60` 时再 `Z3 +6%` | 梅庄（以《率意帖》相易） | 笑傲·梅庄秃笔翁以判官笔施展从颜真卿《裴将军诗》帖化出的笔法 |
| 32 | 铁棋枰 `eq_xuantieqipan` | 笑傲 | 副手 · 牌 | 地下 | 坚甲、架格 | 「棋枰为盾」：`chess ≥ 60` 时 `parry +8`，招架成功后 20% 以基础招式反击（×0.5） | 梅庄（以《呕血谱》相易） | 笑傲·黑白子以铁铸十九道棋枰为兵器，可吸住兵刃暗器；旧 ID `eq_xuantieqipan` 仅为兼容，不据此断言材质是玄铁 |
| 33 | 玄素双剑 `eq_xuansushuangjian` | 侠客 | 剑 · **成对** | 地中 | 锋锐、灵动、伺机 | 「黑白双剑」：与羁绊 ≥ 3 的队友同场时 `Z3 +6%` | 玄素庄线（剑名原创扩展） | 侠客行·玄素庄石清、闵柔夫妇，江湖人称"黑白双剑" |
| 34 | 金蛇锥 `eq_jinshezhui` | 碧血 | 名门暗器 `awl`（每战 8） | 地中 | 透甲、会心 | 「金蛇锥」：本暗器 `Z2 +10%`；与金蛇剑同装（主剑副锥）时金蛇剑①概率 +5% | 华山金蛇洞 | 碧血·金蛇剑、二十四枚金蛇锥与藏宝图合称金蛇三宝，袁承志在华山洞中承接夏雪宜遗物 |
| 35 | 何铁手毒钩 `eq_hetieshougou` | 碧血 | 奇门 `hook` · 单 | 地下 | 精准、放血 | 「常淬剧毒」：自带淬毒（`bf_judu`，25%），不占淬毒槽、不计场数 | 五毒教线（`signature`） | 碧血·五毒教主何铁手左手装有铁钩，以毒钩为兵器 |
| 36 | 金丝背心 `eq_jinsibeixin` | 碧血 | 内甲 · `innerBody` | 地中 | 坚甲、韧性、体魄 | 「刀剑难伤」：常驻 `bf_daoqiang`，以参数覆写为外劲部分 `Z4 +3%×G`（品阶 = `gUse`） | 木桑道人棋局/羁绊 | 碧血·木桑道人取得以乌金丝、头发与金丝猴毛混织的护身背心，后经穆人清交袁承志穿用 |
| 37 | 黄马褂 `eq_huangmagua` | 鹿鼎 | 衣 · 轻甲 | 玄上 | 定心、魅力 | 「御赐黄马褂」：对"官兵"类敌人 `Z4 +8%`（原创扩展）；非战斗：可通行宫禁与官衙区域，官府 NPC 口才检定 +15（12） | 鹿鼎主线赏赐 | 鹿鼎·康熙赏韦小宝穿黄马褂 |
| 38 | 罗刹短铳 `eq_luochaduanchong` | 鹿鼎 | 名门暗器 `gun`（每战 2） | 地中 | 透甲、准心 | 「火器」：`ammoMul` 固定 2.0、射程 5、不可招架、无视 `bf_tingfeng`；开火后须 1 回合装填；开火时 5 格内普通敌人 20% `bf_zhenshe` | 罗刹/雅克萨线 | 鹿鼎·书中有罗刹火器与雅克萨之战（此物为原创扩展） |
| 39 | 血刀 `eq_xuedao` | 连城 | 刀 · 单 · `soft` | 地上 | 饮血、放血、锋锐 | 「血刀」：常驻吸血 +3%（与饮血同族 `fam_drain`）；命中 25% 施加 `bf_nanyu`（06 已注血刀来源） | 血刀老祖终盘（`signature`） | 连城·血刀老祖所用血刀，刀身柔软而锋利 |
| 40 | 常长风墓碑 `eq_changchangfengshibei` | 鸳鸯 | 副手 · 牌 · `heavy`；兼容介质 `exotic/misc` | 玄上 | 坚甲、稳重 | 「墓碑为盾」：`resCC +15pp`；招架成功后 25% 震退攻击者 1 格（`bf_jitui`）；负重 15。兼容：仅在武学 `weaponReq.altItems` 明列本 ID 时可作为 `exotic/misc` 使用，仍占副手且沿用牌的防御主属性，不另获奇门攻击主属性 | 太岳四侠喜剧支线 | 鸳鸯刀·太岳四侠常长风外号“双掌开碑”，以随手取来的墓碑作兵器；保留既有 ID，纠正展示名 |
| 41 | 凝碧剑 `eq_ningbijian` | 书剑 | 剑 · 单 | 地中 | 锋锐、透甲、破招 | 「削金断玉」：同倚天剑①，但概率 `6% + 0.5% × gUse`，且只对地阶及以下兵器生效 | 张召重终盘（`signature`） | 书剑·"火手判官"张召重所佩凝碧剑，锋利异常。**（待考）**核对《书剑恩仇录》三联/广州修订版中得剑来历与流转 |
| 42 | 金笛 `eq_jindi` | 书剑 | 奇门 `flute` · 单 | 地下 | 精准、认穴 | 「金笛」：音律/音功类武学心神效果施加概率 ×1.15；笛类招式命中 10% 施加 `bf_luanxin` | 余鱼同羁绊 | 书剑·"金笛秀才"余鱼同以金笛为兵器 |
| 43 | 铁胆 `eq_tiedan` | 书剑 | 名门暗器 `ball`（每战 6） | 玄上 | 势沉 | 「铁胆」：命中 20% 施加 `bf_jitui` 1 格；非战斗：盘玩铁胆，探索 `staRegen +1pp`（原创扩展） | 铁胆庄线 | 书剑·“铁胆”周仲英以铁胆作暗器，曾掷出击敌 |
| 44 | 霍青桐短剑 `eq_huoqingtongduanjian` | 书剑 | 奇门 `dagger` · 单 | 地下 | 会心、灵动 | 「翠羽黄衫」：背击 `Z3 +8%`；非战斗：回疆部族 NPC 好感 +15；双层剑鞘中的蜡丸地图为任务钩子（chapters/12） | 霍青桐羁绊 | 书剑·霍青桐将父亲所赐短剑赠陈家洛；短剑有双层剑鞘，夹层蜡丸中藏迷城地图 |
| 45 | 芙蓉金针 `eq_furongjinzhen` | 书剑 | 名门暗器 `needle`（每战 12） | 地下 | 准心、认穴 | 「绵里针」：命中施加 `bf_chizhi`；本人穴道类效果施加概率 ×1.15 | 陆菲青/李沅芷线 | 书剑·武当陆菲青（"绵里针"）之芙蓉金针 |
| 46 | 踏云履 `eq_tayunlv` | 通用 | 鞋 · `feet` | 地上 | 灵动、追风、耐力 | 「踏云」：探索攀援的体力消耗 −20%；战斗中无效，且不额外增加 `qinggong` | 高武书界 qg4 隐藏探索奖励；每周目仅 1 双 | **（原创扩展）**；用于 C10 的合法鞋类名器接口，不冒充原著器物 |
| 47 | 孔雀翎 `eq_kongqueling` | 碧血 / 鹿鼎 | 名门暗器 `hidden` · 占暗器栏 | 地上 9**【建议值】** | 精准、透甲、震慑**【建议值】** | 「机发唯一」：必须当场装填；`sk_kongquelingfa` 的展屏、回护、收屏、孔雀开屏四个攻击招式共享每场 1 次机发额度，非攻击的验翎不消耗；不可锻造或补充第二件 | 孔雀山庄守庄剧情；唯一实物，取得保管权与使用资格分开 | **（古龙·《七种武器·孔雀翎》）**孔雀翎与秋凤梧相关；玩法招名、装填与额度均**（原创扩展）**，保管、使用及结局细节**（待考）** |

`eq_changchangfengshibei` 的规范化装备字段为 `EquipDef{kind:offhand;sub:shield;slot:offHand;cat:exotic;exoticKind:misc;tags:[heavy]}`。`cat/exoticKind` 只服务 §3.2 的具名兼容检查；主属性、词条池、手持限制和负重仍完全按副手牌结算。

**名器统计**：地上 8、地中 15、地下 14、玄上 9、玄中 1，共 47 件；兵器 31（其中成对 5：段延庆钢杖、金刀黑剑、银钩铁划、鹤嘴双笔、玄素双剑）、名门暗器 9、护具 3（含鞋 1）、副手牌 2、佩饰 2。孔雀翎品阶、词条为待下游实装验证的建议值，不进入天级 12 件闭集；低武书界既有四件固定产出统计不含这项跨作品守庄节点。

#### 5.4.1 AR-24 名器 / 法器效果补表

AR-24 的通用制式只使用 §3.2 类别固有与 §4 普通词条，不另造专属效果。以下仅列本轮**新 ID**中的天地具名器物与门派法器；原 12 神兵及 47 名器仍以 §5.2、§5.4 为准。`catalogTian` 真武剑遵 §5.1 例外，不得取得神兵护主或两段 `ue_*`。

| 名称 · ID | 品阶 / 类别 | 固定词条 | 专属 / 使用规则 | 依据与边界 |
|---|---|---|---|---|
| 真武剑 `eq_zhenwujian` | 天下 10 / 剑；`catalogTian` | 锋锐、破招、守一 | 无 `ue_*`；固定、唯一、`price:null`，不进随机／锻造／商店 | 《笑傲江湖》明确为张三丰佩剑、武当镇山之宝；品阶与效果 **（原创扩展）**，非第 13 件 `divine` |
| 莫大胡琴藏剑 `eq_modahuqinjian` | 地中 8 / 剑 | 会心、精准、灵动 | 「琴中藏剑」：战斗首次由未持剑切换本剑不耗行动；每战 1 次 **（原创扩展）** | 《笑傲江湖》莫大“琴中藏剑，剑发琴音”；藏置结构 **（待考）** |
| 碧水剑 `eq_bishuijian` | 地下 7 / 剑 | 锋锐、会心 | 「龙泉利器」：对 `absGrade≤6` 的普通兵器，断兵效果品阶 `gUse+1`，最高 7 **（原创扩展）** | 《笑傲江湖》岳灵珊佩剑；岳不群自龙泉得来与削铁表现 **（待考）** |
| 绿波香露刀 `eq_lvboxiangludao` | 地下 7 / 刀 | 会心、精准 | 「绿灯万盏」：刀类连锁／多段招式的第二次起命中 `hit+4` **（原创扩展）** | 《天龙八部》乌老大所使绿色宝刀；材质、来历 **（待考）** |
| 金银小剑 `eq_jinyinxiaojian` | 地中 8 / 成对奇门匕 | 会心、连环、灵动 | 成对实例占主副两格，按 §3.3 `pair` 与 0.36 主属性系数结算；不另加伤害特效 | 《白马啸西风》上官虹一金柄、一银柄双匕 |
| 渔隐叉 `eq_yuyincha` | 地下 7 / 奇门 `misc` 双手 | 精准、破招 | 「水畔渔叉」：浅水地形不受兵器命中惩罚；其余引用 `sk_yuyincha` **（原创扩展）** | 一灯门下点苍渔隐持兵形制 **（待考）**；门派字段归 `sect_dali`，不虚构点苍 ID |
| 枣核钉匣 `eq_zaohedingxia` | 地中 8 / 名门暗器 `awl` | 精准、会心 | 自带 9 枚／战；仅供普通暗器武学，口喷免手规则仍只属于 `sk_zaoheding` | 原著有裘千尺口喷枣核；永久匣体、铁钉材质与弹量 **（原创扩展）** |
| 三笑逍遥散匣 `eq_sanxiaosanxia` | 地中 8 / 名门暗器 `powder` | 精准、先机 | 自带 3 次／战，命中引用 `bf_sanxiao`；不提供现实制法 | 原著有三笑逍遥散；专用机匣与投射装备化 **（原创扩展）** |
| 门派法器（20 件） | 地下 7—地上 9 / 见名录 | 按品阶：地下 2、地中 2–3、地上 3 条；配表从相应类别池固定 | 只加 `unique` 与 `sect`，不新建 `ue_*` / Buff；具体清单见 §14.2 与 `catalog/items-weapons.md` | 均为 **（原创扩展）**，只提供门派视觉与固定产出，不宣称原著有同名镇物 |

#### 5.4.2 AR-30 新增天地名器登记

本轮普通军器、玄黄奇门与玄阶具名物仍只使用 §3.2 类别固有和 §4 普通词条；以下仅登记新增的地阶兵器与暗器。固定词条按 §5.4 的地下 2 条、地中 2—3 条、地上 3 条规则；除生死符既有 `bf_shengsifu` 接口外，不新增 `ue_*` 或 Buff。

| 名称 / ID | 品阶 / 类别 | 固定词条 | 专属 / 使用规则 | 依据与边界 |
|---|---|---|---|---|
| 云中鹤钢抓 / `eq_yunzhonghegangzhua` | 地下 7 / 奇门 `misc` 成对 | 精准、连环 | 成对实例按 §3.3 `pair` 结算；无额外特效 | 《天龙八部》人物持器；尺寸待考，定级原创 |
| 朱丹臣判官笔 / `eq_zhudanchenpanguanbi` | 地下 7 / 奇门 `brush` 成对 | 认穴、精准 | 接入笔类武学，不自动授武学 | 《天龙八部》朱丹臣使用判官笔；外观原创 |
| 韩宝驹金龙鞭 / `eq_hanbaojinlongbian` | 地中 8 / 鞭索 | 精准、绊足、灵动 | 只用鞭索类别固有，无额外特效 | 《射雕英雄传》人物持器；装具待考 |
| 全金发大秤 / `eq_quanjinfadacheng` | 地下 7 / 奇门 `misc` 双手 | 势沉、架格 | 秤砣不拆成独立弹药 | 《射雕英雄传》人物持器；外观原创 |
| 樊一翁钢杖 / `eq_fanyiwenggangzhang` | 地中 8 / 棍杖双手 | 势沉、架格、精准 | 只用棍杖类别固有，无额外特效 | 《神雕侠侣》人物持器；长度待考 |
| 潇湘子哭丧棒 / `eq_xiaoxiangzikusangbang` | 地中 8 / 棍杖双手 | 精准、蕴劲、破招 | 毒砂只由对应招式结算，不从装备常驻生成 | 《神雕侠侣》人物持器；棒中机关待考 |
| 金花婆婆金花杖 / `eq_jinhuapopojinhuazhang` | 地中 8 / 棍杖单手 | 精准、认穴、守一 | 金花暗器另由 `eq_jinhuabiao` 结算 | 《倚天屠龙记》持杖与机关细节待考 |
| 木高峰驼剑 / `eq_mugaofengtuojian` | 地下 7 / 剑 | 锋锐、破招 | “驼剑”仅为描述名，无额外特效 | 《笑傲江湖》木高峰使剑；形制待考 |
| 丹青生长剑 / `eq_danqingshengchangjian` | 地下 7 / 剑 | 锋锐、会心 | 不从人物雅号推导额外规则 | 《笑傲江湖》丹青生用剑；专名待考 |
| 田伯光快刀 / `eq_tianboguangkuaidao` | 地中 8 / 刀 | 会心、连环、准心 | 快刀表现只来自固定词条 | 《笑傲江湖》人物刀法；专名待考 |
| 花铁干铁枪 / `eq_huatiegantieqiang` | 地下 7 / 枪双手 | 精准、破招 | 只用枪类别固有，无额外特效 | 《连城诀》人物持铁枪 |
| 陆天抒鬼头刀 / `eq_lutianshuguitoudao` | 地下 7 / 重刀双手 | 势沉、锋锐 | 遵 `heavy` 需求，不附超自然效果 | 《连城诀》人物持器；刀形待考 |
| 骆冰鸳鸯短刀 / `eq_luobingyuanyangdao` | 地下 7 / 刀成对 | 会心、连环 | 成对实例按 §3.3 `pair` 结算 | 《书剑恩仇录》人物绰号与持器细节待考 |
| 蒋四根铁桨 / `eq_jiangsigentiejang` | 地下 7 / 奇门 `misc` 双手 | 势沉、架格 | 水地形交互若需数值由 08 定义 | 《书剑恩仇录》人物持器；尺寸待考 |
| 王维扬八卦刀 / `eq_wangweiyangbaguadao` | 地中 8 / 刀 | 破招、精准、守一 | 刀法需另行习得，不由装备授予 | 《书剑恩仇录》人物武学；佩刀具名待考 |
| 苗人凤佩剑 / `eq_miaorenfengpeijian` | 地上 9 / 剑 | 锋锐、破招、会心 | 只用剑类别固有，无额外特效 | 两部飞狐人物使剑；佩剑专名待考 |
| 生死符冰片包 / `eq_shengsifubao` | 地上 9 / 名门暗器 `awl` | 精准、认穴、先机 | 每战 3 枚，命中引用 `bf_shengsifu`；非敌对目标仍触发 §12 品德 −10 | 《天龙八部》冰片介质；永久装备包与弹量原创 |
| 金花镖 / `eq_jinhuabiao` | 地中 8 / 名门暗器 `dart` | 精准、会心、透甲 | 每战 6 枚；不与金花杖共享弹量 | 《倚天屠龙记》金花状暗器；材质细节待考 |
| 无影银针 / `eq_wuyingyinzhen` | 地中 8 / 名门暗器 `needle` | 准心、精准、先机 | 靴底机括每战 8 枚；换装仍占暗器位 | 《飞狐外传》汤沛靴底机括；弹量原创 |
| 回龙璧 / `eq_huilongbi` | 地中 8 / 名门暗器 `dart` | 精准、破招、连环 | 每战 3 枚；回旋只作招式表现，不自动返还弹量 | 《书剑恩仇录》赵半山所创曲尺弯镖 |
| 飞燕银梭 / `eq_feiyanyinsuo` | 地中 8 / 名门暗器 `dart` | 精准、会心、连环 | 每战 6 枚，无额外追踪规则 | 《书剑恩仇录》赵半山所创；构造待考 |
| 温方施二十四飞刀 / `eq_wenfangshifeidao` | 地下 7 / 名门暗器 `dart` | 准心、连环 | 每战 24 柄；中空柄声效仅表现，不加控制 | 《碧血剑》皮套、二十四柄、尺许刃与中空柄 |
| 木桑铁棋子 / `eq_musangtieqizi` | 地下 7 / 名门暗器 `ball` | 精准、会心 | 每战 16 枚；铁银材质不改变伤害类型 | 《碧血剑》木桑道人以棋子作暗器；数量原创 |

其余本轮新增装备为玄黄制式或玄阶具名物，不进入神兵名器规则；为避免与并行任务争写 §14.2，其正式 ID 登记交由后续汇总，完整待登记行见本任务报告 §6。上表是这些地阶对象的权威定义，名录仅作出图投影。

**数值核对**：新地级法器主手仍严格用 §4.1 `0.30×kA×G(gUse)×ATK_LV`。例如 Ld35 地下剑为 `0.30×1.00×2.00×606=363.6→364`，地中剑为 `0.30×1.00×2.20×606=399.96→400`，地上剑为 `0.30×1.00×2.40×606=436.32→436`（速查表因底层曲线完整精度显示 437，运行时以曲线源值后统一取整）；本轮没有另乘“法器系数”。暗器 g1–g6 的 `ammoMul` 依 §3.5 `0.88+0.035g` 得 0.915 / 0.950 / 0.985 / 1.020 / 1.055 / 1.090。

### 5.5 信物型器物（非装备）

| 名称 · ID | 书界 | 类 | 规则 | 原著出处 |
|---|---|---|---|---|
| 玄铁令 `it_xuantieling` | 侠客 | `token` | 持令者可要求谢烟客（摩天居士）做一件事：开启其羁绊/援手/传艺三选一的任务分支（chapters/06） | 侠客行·谢烟客发出三枚玄铁令，最后一枚辗转落入石破天手中 |
| 赏善罚恶铜牌 `it_shangshanfaepai` | 侠客 | `token` | 侠客岛邀约：主线钥匙，接牌即锁定"赴侠客岛"主线节点 | 侠客行·赏善罚恶二使持铜牌邀各派掌门赴侠客岛喝腊八粥 |
| 黑木令 `it_heimuling` | 笑傲 | `token` | 日月神教身份凭证：通行黑木崖外围、教众对话 | 笑傲·日月神教令牌黑木令 |
| 五岳令旗 `it_wuyuelingqi` | 笑傲 | `token` | 五岳剑派盟主令旗：五岳并派大会主线道具 | 笑傲·嵩山派左冷禅以五岳盟主令旗号令各派（如阻止刘正风金盆洗手） |
| 金盆 `it_jinpen` | 笑傲 | `token` | 刘正风金盆洗手事件道具；余韵期可作收藏品陈设 | 笑傲·刘正风金盆洗手 |
| 四十二章经（八部）`it_sishierzhangjing_<1..8>` | 鹿鼎 | `token`（可拼合） | 八部经书中各藏羊皮碎片，集齐拼成地图（§10.4） | 鹿鼎·八部《四十二章经》内藏地图碎片 |
| 狼皮 `it_langpi` | 白马 | `token` | 情感信物：交与不同 NPC 引出不同结局文本（chapters/10） | 白马啸西风·苏普杀狼、李文秀留存狼皮。**（待考）**核对三联/广州修订版狼皮的赠受顺序，章节稿不得先指定收件人 |
| 高昌迷宫地图 `it_gaochangditu` | 白马 | `key` | 迷宫入口钥匙（chapters/10 谜题） | 白马啸西风·高昌迷宫线索。**（待考）**核对三联/广州修订版路线图所附载体与取得经过；`it_gaochangditu` 是任务抽象名，不先断言为独立纸图 |
| 闯王军刀 `it_chuangwangjundao` | 雪山 | `key` | 开启玉笔峰宝藏的关键之物（chapters/14） | 雪山飞狐·闯王军刀上有配合藏宝图寻找宝藏的方位线索，后落入天龙门相关人物手中 |
| 五龙令 `it_wulongling` | 鹿鼎 | `token` | 神龙教教主令牌：神龙教内乱支线（02 §7.3 N2 削弱洪安通） | **（原创扩展）**；名称取意神龙教青、黄、赤、白、黑五龙使，不宣称原著存在同名令牌 |

### 5.6 套装装备成员同步（套装本体归 design/07）

基准 §20：套装件数统计装配中的武学与穿戴中的装备。`design/07` v1 已收敛为 44 套，唯一正式装备成员是 `eq_yitianjian`；本文以装备侧 `setTags` 与其 §13.3 双向闭合。其余旧提案不进入 v1，保留装备本体与专属效果，不保留候选套装 ID。

| 项 | 装备成员处理 | 正式套装 / 去向 | 装备侧闭合 | 状态 |
|---|---|---|---|---|
| `set_yitian_emei`（倚天·峨眉） | `eq_yitianjian` 为正式成员 | 武学成员、阈值与效果只见 `design/07` §13.3 | `eq_yitianjian.setTags` 已闭合 | v1 正式 |
| 桃花岛主 / 白驼山主 | `eq_yuxiao`、`eq_ruanweijia`、`eq_baituoshezhang` 不计件 | 对应正式套装仍为纯武学成员 | 不写装备反向标签 | v1 不采用装备成员 |
| 金蛇三宝 / 古墓旧名 / 玄冥二老 / 韦爵爷 | 相关装备均不计件 | 旧候选按 `design/07` §19.3 删除，或由古墓玉女正式套装承接主题但不迁入旧成员 | 不写装备反向标签 | v1 不采用旧候选 |
| 重阳道袍 / 七宝指环 | 不建立 `eq_chongyangdaopao`、`eq_qibaozhihuan` 的 `ItemDef` | `design/07` §19.4 明确不进入 v1 | 如未来采用，须先建装备定义、补双向 `setTags` 并重跑可达性 | v1 不采用 |

### 5.7 各书界装备产出一览

| 书界 | 天级（基准 §14） | 名器（§5.4） | 信物/钥匙（§5.5） | 天材骰池（高武 Boss，02 §2.12） |
|---|---|---|---|---|
| 天龙 | 打狗棒 | 鳄嘴剪、鳄尾鞭、段延庆钢杖；踏云履（跨高武隐藏探索候选之一） | — | 冰蚕丝、千年灵芝、万年温玉 |
| 射雕 | 打狗棒、软猬甲 | 白驼蛇杖、玉箫、毒菱、柯镇恶铁杖、成吉思汗金刀、洪七公酒葫芦 | — | 千年灵芝、万年温玉、九转还魂丹 |
| 神雕 | 玄铁重剑、打狗棒、软猬甲 | 君子剑、淑女剑、金轮、紫薇软剑、独孤利剑、独孤木剑、金铃索、李莫愁拂尘、冰魄银针、玉蜂针、金刀黑剑、达尔巴金杵、霍都折扇 | — | 玄铁、千年灵芝、九转还魂丹 |
| 倚天 | 倚天剑、屠龙刀、圣火令、打狗棒 | 银钩铁划、鹿杖、鹤嘴双笔、乾坤一气袋、峨眉铁指环、蚊须针 | — | 玄铁、西方精金、九转还魂丹 |
| 笑傲 | — | 绣花针、七弦琴、秃笔翁之笔、铁棋枰 | 黑木令、五岳令旗、金盆 | — |
| 侠客 | — | 玄素双剑 | 玄铁令、赏善罚恶铜牌 | — |
| 碧血 | 金蛇剑 | 金蛇锥、何铁手毒钩、金丝背心 | — | — |
| 鹿鼎 | 韦小宝匕首、护身宝衣 | 黄马褂、罗刹短铳 | 四十二章经、五龙令 | — |
| 连城 | 乌蚕衣 | 血刀 | — | — |
| 白马 | — | —（以奇物、坐骑、收藏品为主，§11） | 狼皮、高昌迷宫地图 | — |
| 鸳鸯 | 鸳鸯刀 | 常长风墓碑 | — | — |
| 书剑 | — | 凝碧剑、金笛、铁胆、霍青桐短剑、芙蓉金针 | — | — |
| 飞狐 | 冷月宝刀 | — | — | — |
| 雪山 | 冷月宝刀（原生，可器合） | — | 闯王军刀 | — |

---

## 6. 装备成长

### 6.1 总览

02 §2.2 所称"精炼 / 镶嵌 / 附魔"在本文分别对应 **强化 / 工艺 / 铭刻**，三者都**不改变 `nativeTo`**（杜绝"精炼洗白"）。

| 操作 | 技艺（03 §8） | 场所 | 作用 | 成功率 | 跨书界 | 天级 | 名器 |
|---|---|---|---|---|---|---|---|
| 强化（精炼）`refine` | `forge` | 铁匠铺 / 营地铁砧 | 主属性 +4%/级 | 有，失败不降级（§6.2） | ✅ 等级随装备保留 | ✅ 至 +10 | ✅ |
| 工艺 `temper`（开锋/加衬/琢磨） | `forge` | 铁匠铺、裁缝、玉匠 | 1 条自选工艺词条 | 100% | ✅ | ✅ | ✅ |
| 铭刻 `inscribe` | `art` | 书案（客栈、书院、文房） | 1 条铭文 | 100% | ✅ | ✅ | ✅ |
| 淬毒 `poisonCoat` | `poi` | 任意非战斗 | 3 场附毒 | 03 §8.1 公式 | ❌ 书眠清除 | ✅ | ✅ |
| 锻造 `craft` | `forge` | 铁匠铺 | 新造装备 ≤ 地上 | 03 §8.1 | 成品可携带 | ❌ | ❌ |
| 重铸 `reforge` | `forge` | 铁匠铺 | 重掷 1 条随机词条 | 100% | ✅ | ❌（全为固定词条） | 仅随机位 |
| 精修 `hone` | `forge` | 铁匠铺 | 重掷 1 条随机词条的品相，只升不降 | 100% | ✅ | ❌ | 仅随机位 |
| 修复 `repair` | `forge` | 铁匠铺 | 解除断兵 | 100% | — | ✅ | ✅ |
| 拆解 `salvage` | `forge` | 铁匠铺 | 装备 → 材料 | 100% | — | ❌ | ❌ |
| 器合 / 器魄 | — | 剧情 | 02 §5.8；§6.7 | — | ✅ | 限 3 件 | — |

- **代工**：铁匠/裁缝/玉匠 NPC 以其技艺值 `forge_npc` 代工，收费（§13.2 服务费）；玩家自做不收费、获得技艺经验（03 §8.1）。`forge_eff = max(自身 forge + 装备临时加值, 所选 NPC 的 forge_npc)`。
- NPC 工匠档位【建议值，12/chapters 配置具体人物】：乡镇铁匠 30、城中名铺 50、名匠 65、宗师 80（全作不超过 4 位，如神雕中以打铁隐居的冯默风，03 §8.2 所举，其技艺定值待 chapters/03）。

### 6.2 强化（精炼）

| 项 | 规则 |
|---|---|
| 上限 `refineMax` | 按**绝对品阶**大阶：黄 4、玄 6、地 8、天 10（条目可覆写） |
| 效果 | `R = 1 + 0.04 × refineEff`，只乘主属性（§4.1）；**不乘**固有、词条、鞋的轻功值、牌的招架底值 |
| 生效等级 | `refineEff = min(refine, refineMax(大阶(gUse)))`：外来压制/等级封顶使大阶下降时，超出部分暂时封存（§7.2），存档中的等级不变 |
| 失败 | **不降级、不碎裂**；返还一半材料（向下取整），代工费照收；本级火候 `refineFire += 15pp`，成功后清零 |
| 稳炼 | 选择"稳炼"则消耗 `ceil(n_k / P)` 份材料（代工费同比例），必定成功——给不想赌概率的玩家一条确定路线 |
| 成功率 | `P = clamp(P_base(k) + 0.02 × (forge_eff − T_k) + refineFire, 0.20, 1.00)` |

| 目标等级 k | 材料大阶（族 = `matFamily`） | 数量 `n_k` | 可尝试门槛 `T_k`（forge） | `P_base(k)` | 代工费（× 物品价 `P(absGrade)`，§13） |
|---|---|---|---|---|---|
| +1 | 黄 | 2 | 4 | 100% | 5% |
| +2 | 黄 | 3 | 4 | 100% | 6% |
| +3 | 黄 | 4 | 4 | 95% | 8% |
| +4 | 玄 | 2 | 28 | 85% | 10% |
| +5 | 玄 | 3 | 28 | 80% | 12% |
| +6 | 玄 | 4 | 28 | 70% | 15% |
| +7 | 地 | 2 | 52 | 60% | 20% |
| +8 | 地 | 3 | 52 | 50% | 25% |
| +9 | 天（天材，或同 ID 器魄） | 1 | 76 | 40% | 30% |
| +10 | 天（天材，或同 ID 器魄） | 2 | 76 | 30% | 40% |

- 材料大阶是下限：可用更高阶材料替代（1 份高一大阶 = 2 份低一大阶）。
- 天级装备的代工费以 §13.2 估值计。天材只在高武书界产出（02 R2），所以 **+9/+10 只能在天龙—倚天完成**，之后随装备永久保留——这是"巅峰时代锻出的神兵"的数值体现。
- 例：自身 `forge` 60，把地上剑从 +7 强化到 +8：`P = 0.50 + 0.02 × (60 − 52) = 0.66`；稳炼需 `ceil(3 / 0.66) = 5` 份地阶金材。

### 6.3 工艺：开锋 / 加衬 / 琢磨

每件装备 1 个工艺槽，玩家从下表**自选**一条（不随机），不得与该装备已有词条同 ID；可随时重做（旧工艺作废）。数值 = §4.6 同名词条的基准值 × `G(gUse)` × `q_t`（`G` 只乘一次），`q_t = clamp(0.70 + 0.01 × (forge_eff − T(min(absGrade, 9))), 0.70, 1.00)`。

| 工艺 | 部位 | 可选（§4.6 ID） | 门槛 | 材料 | 费用 |
|---|---|---|---|---|---|
| 开锋 | 主手、副兵器、成对兵器 | 锋锐、破招、会心、透甲、准心、连环 | `forge_eff ≥ T(min(absGrade, 9))` | 同族同大阶 ×2 | 10% × `P(absGrade)` |
| 加衬 | 头、衣、手、腰、鞋、牌 | 坚甲、浑元、体魄、卸力、护体、E 组任一抗性 | 同上 | 同上（衣甲可用丝/革） | 同上 |
| 琢磨 | 佩饰、暗器囊、名门暗器 | 精准、守一、凝神、先机、H 组任一先天 | 同上 | 玉石 ×2 | 同上 |

例：天上倚天剑（门槛 `T(9) = 68`），交给 `forge` 80 的宗师开锋：`q_t = 0.82`，选"准心"→ `3 × 3.5 × 0.82 = 8.6` 点命中。

### 6.4 铭刻

| 项 | 规则 |
|---|---|
| 技艺 | 书画 `art`（03 §8.2"书画入武"的延伸）；铭文品阶 `gi = min(gUse, gMax(art_eff))`，`gMax(a) = ⌊(a + 4)/8⌋`（03 §8.1） |
| 前提 | 已"知晓"该铭文（学识 `ins_*`，由事件、书卷、拜师解锁，跨书界保留）；每件 1 条；可磨去重刻（免费、即时） |
| 材料 | 墨料：`gi` 黄 1 份松烟墨、玄 1 份朱砂、地及以上 1 份金粉 |
| 耗时 | 1 时辰（战斗外） |

| ID | 铭文 | 解锁（学识来源） | 效果（`G = G(gi)`） | 部位 |
|---|---|---|---|---|
| `ins_menpai` | 门派铭（参数 `sect`） | 加入该门派 | 装配该门派武学 ≥ 2 门：其招式 `Z3 +1%×G`（≥ 3 门 ×1.5） | 兵器 |
| `ins_xiadazhe` | 侠之大者，为国为民 | 神雕·郭靖对杨过之语（chapters/03 事件） | 品德 ≥ 50：`Z4 +1%×G`；对"外敌/官兵"类敌人另 `Z3 +2%×G` | 任意 |
| `ins_taqiang` | 他强由他强，清风拂山岗 | 倚天·九阳真经口诀（习得九阳或读经事件） | `attr:effRes flat +3×G`、`attr:resMind pp +1×G` | 衣、头、佩 |
| `ins_zhongjian` | 重剑无锋，大巧不工 | 神雕·剑冢石刻 | 仅 `heavy`：`attr:pierce flat +3×G` | 重兵 |
| `ins_kanglong` | 亢龙有悔 | 习得降龙十八掌 | 绝招命中后回复气势 `+2×G`（取整） | 兵器、手 |
| `ins_renzhe` | 仁者无敌 | 鸳鸯刀·刀中之秘 | 品德 ≥ 60：`attr:tough flat +3×G` | 任意 |
| `ins_shibu` | 十步杀一人，千里不留行 | 侠客行·石壁（李白《侠客行》） | 击杀后 `ct +10×G` | 兵器、鞋 |
| `ins_wenshijian` | 问世间，情是何物 | 神雕·李莫愁所吟（元好问词） | 羁绊队友倒地时获得 06 `bf_ruiyi`（数值 ×0.6）2 回合 | 佩 |
| `ins_xiaoao` | 笑傲江湖 | 笑傲·曲洋、刘正风琴箫合谱 | `attr:resMind pp +2×G`、`attr:rageGain pp +2×G` | 佩、衣 |
| `ins_feixue` | 飞雪连天射白鹿，笑书神侠倚碧鸳 | 集齐 ≥ 7 本天书后书灵传授（原创扩展） | 仅可刻于随主角书眠 ≥ 3 次（`sleeps ≥ 3`）的装备：主属性 ×1.05（并入 `R`） | 任意 |
| `ins_minghao` | 名号铭（参数：玩家称号） | 声望称号（12） | 非战斗：本书界声望获取 +10% | 任意 |
| `ins_qihun` | 器魂铭 | 消耗器魄（§6.7） | 该神兵专属特效数值 +20% | 仅器合所得神兵 |

> "天书铭" `ins_feixue` 以金庸自题十四部书名联（"飞雪连天射白鹿，笑书神侠倚碧鸳"）为铭，奖励"陪主角走过多部书的老伙计"，是多周目携带的情感回报。

### 6.5 淬毒

| 项 | 规则 |
|---|---|
| 对象 | 主手/副兵器（拳套除外）、一组暗器弹药、名门暗器（自带毒的除外） |
| 输入 | 毒材（`toxin` 材料或毒药物品）1 份；毒术 `poi_eff ≥ T(gc)` |
| 品阶 | `gc = min(毒材品阶, gMax(poi_eff))` |
| 成功率 | `P = clamp(0.60 + 0.04 × (poi_eff − T(gc)), 0, 1)`（03 §8.1）；失败只损毒材 |
| 效果 | 兵器招式命中时以 `25% + 0.25% × poi`（25%–50%）施加对应 Buff（品阶 `gc`）；针类弹药每枚必定施加，其余弹药按同式概率 |
| 持续 | 兵器 3 场战斗（03 §8.2）；弹药直到用完；**书眠清除** |
| 叠加 | 与触发词条、专属特效共享"同一次命中至多 2 个装备来源触发"（§4.9） |
| 正邪 | 淬毒装备带 `poisoned` 标签；在正派 NPC 面前使用的品德与好感影响由 12 定义 |

| 毒材 | 对应 Buff（06） | 毒材 | 对应 Buff（06） |
|---|---|---|---|
| 蛇涎、蝮蛇毒 | `bf_shedu` | 麻药、蒙汗草 | `bf_mabi` |
| 砒霜、鹤顶红（通用，原创定级） | `bf_zhongdu` | 七心海棠（飞狐） | `bf_qixin` |
| 断肠草（神雕）、金波旬花（连城）、赤练蛇毒 | `bf_judu` | 化尸粉（鹿鼎） | `bf_huagu`（仅对已流血目标） |

### 6.6 锻造、重铸、精修、修复、拆解

**锻造（打造新装备）**

| 项 | 规则 |
|---|---|
| 输入 | 锻造图谱学识 `rc_*`（定基底与品阶上限）+ 主材 1 份（族 = 基底 `matFamily`，品阶 `gm`）+ 同族低一大阶辅材 2 份 + 工时 `2 × go` 时辰 |
| 成品品阶 | `go = min(gm, 图谱上限, gMax(forge_eff), 9)`（03 §8.2：自造上限地上） |
| 成功率 | `P = clamp(0.60 + 0.04 × (forge_eff − T(go)), 0, 1)`；失败返还一半材料 |
| 词条 | 数量按 §4.5，`pExtra = min(1, 0.50 + 0.01 × (forge_eff − T(go)))`；品相下限 `0.70 + 0.01 × min(25, forge_eff − T(go))` |
| 定向 | 多投 1 份主材：指定 1 条词条（该部位池内任选） |
| 本土 | `nativeTo` = 锻造书界（02 §2.2，外来材料亦然） |
| 禁止 | 天级、名器、名门暗器不可锻造（唯一实物） |

| 操作 | 条件与代价 | 结果 |
|---|---|---|
| 重铸 | 同族同大阶材料 2 份 + 10% `P(absGrade)` | 指定 1 条**随机**词条重掷类型与品相（固定词条不可） |
| 精修 | 同族同大阶材料 1 份 + 5% `P(absGrade)` | 指定 1 条随机词条重掷品相，取 `max(旧, 新)` |
| 修复 | `forge_eff ≥ T(min(absGrade, 9))`；同族同大阶材料 1 份 | 解除 `broken`（断兵） |
| 拆解 | 天级、名器不可 | 得 `1 + ⌊absGrade/3⌋` 份同族材料（品阶 `absGrade − 1`，至少 1）；已投入强化材料返还 30% |

### 6.7 器魄 `it_qipo`

| 项 | 规则 |
|---|---|
| 来源 | 02 §5.8 器合时多出的一件（仅打狗棒、软猬甲、冷月宝刀可器合） |
| 绑定 | 器魄记录来源装备 ID，只能用于**同 ID** 装备 |
| 用途（二选一，一次性） | ① **天材替代**：同 ID 装备强化至 +9/+10 时，1 器魄 = 3 份天材（使冷月宝刀在中武的雪山也能强化到 +10）；② **器魂铭**：刻 `ins_qihun`（专属特效数值 +20%），置 `qipo: true` |
| 跨书界 | 器魄是物品，不跨书界；须在器合所在书界用掉 |

### 6.8 材料体系

本节是装备制造对资源系统的**消费映射**，不另建资源库存或采集规则。`design/16` 以天地玄黄 × 九品记录资源（**一品最高、九品最低**）；进入本文配方时，经 `resourceRef` 映射为 `materialGrade` 1–12。换算已由 `design/16` §2.4 / §3.4 定稿：同一大阶内九品压到上/中/下三个装备档（7–9 品→下、4–6 品→中、1–3 品→上），天材仍须具名固定节点或天材骰。资源点、家丁、库存默认不跨书界，本文只接收当界可消费数量（AR-05）。

`resourceRef` 只回答“这件具体 `it_*` 从哪一类生产资源封装而来”，不允许以同一资源 ID 替代具名任务物、独有药物或配方点名材料。16 §3.3 已定稿的五个兼容映射及冰蚕丝接口如下；物品 ID、功效、唯一性和投放仍归本文。

| 物品 ID | `family` | `materialGrade` | `resourceRef` | 边界 |
|---|---|---:|---|---|
| `it_qiannianrenshen` | `herb` | 10 | `res_yaocai_di5` | AR-20 年限令物品升天阶；旧资源映射仅保留其来源／估值，不得把普通地五品资源直接封装为千年人参 |
| `it_tianshanxuelian` | `herb` | 9 | `res_yaocai_di1` | 固定节点物品，不因映射进入普通量产 |
| `it_duanchangcao` | `toxin` | 7 | `res_ducai_di9` | 专属配方仍须匹配物品 ID |
| `it_qixinhaitang` | `toxin` | 8 | `res_ducai_di5` | 不可由任意地五品毒材替代 |
| `it_jinboxunhua` | `toxin` | 9 | `res_ducai_di2` | 任务与毒性语义仍见本文 §8.4、06 |
| `it_bingcansi` 冰蚕丝 | `fabric` | 10 | `res_sicha_tian9` | `kind:material/sub:fabric/grade:10/rare:true/stack:999/price:null`；仅 §5.7 天龙天材池及章节已登记的固定材料节点 |

冰蚕丝是**（原创扩展）**的丝材，`origin:expanded`、`chapters:[ch01_tianlong]`、图标 `item/bingcansi`；天材 10 品由资源天九品映射得到。不附带冰蚕寒毒、淬毒或伴修效果，不与奇物 `it_bingcan` 互换，也不从普通丝茶资源量产；普通材料书眠时清空。

| 族 `family` | 黄（1–3） | 玄（4–6） | 地（7–9） | 天（10–12，天材） | 用途 |
|---|---|---|---|---|---|
| 金 `metal` | 生铁、熟铁、百炼钢 | 精钢、镔铁、乌钢 | 寒铁、乌金、赤金 | 玄铁（10）、西方精金（11；**（待考）**核对《倚天屠龙记》三联/广州修订版铸刀剑追述是否明确使用此名与此材） | 兵器、金属甲、强化 |
| 丝 `fabric` | 粗布、麻、棉 | 蜀锦、云锦、生丝 | 金丝、雪蚕丝（原创扩展） | 冰蚕丝（10，原创扩展，取意天龙冰蚕） | 轻甲、软甲 |
| 革 `leather` | 牛皮、羊皮 | 鲨鱼皮、犀皮 | 蛟皮（原创扩展）、熊皮 | — | 皮甲、护手、鞋 |
| 木竹 `wood` | 白蜡杆、枣木、毛竹 | 铁木、紫竹、檀木 | 沉香木、千年古藤 | — | 棍杖、弓、剑鞘 |
| 玉石 `jade` | 青玉、岫玉 | 碧玉、和田玉 | 羊脂玉、寒玉（原创扩展，取意古墓寒玉床） | 万年温玉（10，原创扩展） | 佩饰、琢磨、强化 |
| 药材 `herb` | 甘草、当归、田七 | 灵芝、何首乌、熊胆 | 百年人参、天山雪莲、百年雪参 | 千年人参、千年灵芝、千年雪参／雪莲（10） | 丹药（§8.7） |
| 毒材 `toxin` | 蛇涎、砒霜、蒙汗草 | 蝎尾、蜈蚣、断肠草 | 七心海棠、金波旬花、赤练蛇毒 | —（天阶之毒只在固定节点） | 淬毒、配毒 |
| 兽材 `beast` | 兽骨、兽筋 | 虎骨、鹿茸、蛇胆 | 蟒胆、雪貂皮 | — | 丹药、护具 |
| 食材 `ingredient` | 米面、鸡、猪羊 | 斑鸠、火腿、獐肉 | 熊掌、驼峰、燕窝 | — | 烹饪（§9） |
| 墨料 `ink` | 松烟墨 | 朱砂 | 金粉 | — | 铭刻（§6.4） |

| 规则 | 内容 |
|---|---|
| 获取 | 资源点、家丁与库存归 `design/16`，地图位置归 `design/11`/`19`；战利品先掷 02 §2.12 品阶骰，再按 `family` 映射资源；商店与拆解见 §13、§6.6 |
| 合成 | 3 份同族 → 1 份高一小阶（如 3 × 玄中 → 1 × 玄上）；上限地上 9；在对应作坊进行，100% 成功 |
| 天材 | 只由 02 天材骰（高武 Boss 池，概率 `(W − 80) × 0.25%`）与 chapters/ 固定节点产出；**不可合成、不可购买、不跨书界** |
| 天材骰产出 | 见 §5.7 最后一列：天龙〔冰蚕丝、千年灵芝、万年温玉〕、射雕〔千年灵芝、万年温玉、九转还魂丹〕、神雕〔玄铁、千年灵芝、九转还魂丹〕、倚天〔玄铁、西方精金、九转还魂丹〕，池内等权（回应 02 待决 P10） |

---

## 7. 书眠携带与天道压制

### 7.1 携带 6 件细则（基准 §3、§20；流程与界面归 02 §4.3 第 4 步）

| # | 规则 |
|---|---|
| C1 | 可选范围：装备栏、背包、仓库中**玩家所有**的装备，以及已交给队友穿戴、`owner: player` 的装备（书眠时视为归还）；队友自带（`owner: npc_*`）不可选 |
| C2 | 上限：`携带件数 + 本书界新藏史件数 ≤ 6`（02 §6.6 S4）；成对兵器计 1 件 |
| C3 | 不可选：`noCarry`、`anchorLocked`（02 §6.5 HM6）、`questBound` |
| C4 | 同 ID 至多携带 1 件（异时之器已通过器合或归还处理；避免下一书界出现三件同名） |
| C5 | 保留：`absGrade`、`nativeTo`（不变 → 在新书界成为外来）、`affixes`（含封存选择）、`temper`、`inscription`、`refine` 与 `refineFire`、`broken`、`qipo`；`sleeps += 1` |
| C6 | 清除：`poisonCoat`；暗器囊内弹药；装备上一切非永久 Buff（06 书眠净化） |
| C7 | 未被选中的装备与其余全部物品留在本书界（§12.3）；02 §4.4 的 `EQUIP_LT6` / `HIGH_EQUIP_LEFT` 警告在此触发 |

### 7.2 外来压制对装备的影响（总表）

以下全部使用 `gUse = min(effGrade, gCap(Ld))`；`effGrade` 接收 02 已完成本土／外来判定、装备抵消与难度修正的结果，不在本文重复减品。下面算例采用标准难度、外来且无抵消的基线 `effGrade = max(1, absGrade − S)`（S：高 0 / 中 2 / 低 4；印证与器合规则见 02）。

| 项 | 规则 | 例：倚天剑 +10 天上 12 → 连城（低武，Ld 46） |
|---|---|---|
| 主属性 | 按 `gUse` 查 §4.1 | `gUse = 8`：`0.30 × 2.2 × ATK_LV(46)` = 681 |
| 强化 | `refineEff = min(refine, refineMax(大阶(gUse)))` | 地阶上限 8 → ×1.32 → **899** |
| 词条数量 | 生效条数 = `min(总数, maxAffix(gUse))`（§4.5），多出者**封存**；封存对象默认取评分最低者，玩家可在 02 书眠第 4 步或铁匠处免费调整 | 4 条 → 3 条生效 |
| 词条数值 | 按 `G(gUse)` 重算 | 锋锐 7.0% → 4.4% |
| 工艺、铭文 | 不封存，数值按 `G(gUse)`（铭文取 `min(gi, gUse)`） | |
| 专属特效 | 按大阶分档（§7.3） | 地阶：只保留核心①，概率 `12% + 1% × 8` = 20% |
| 神兵护主 | `gUse ≥ 10` 才存在（06 品阶区间） | 无（可被缴械、断兵） |
| Buff 品阶 | 装备施加/常驻的 Buff 品阶 = `gUse`，06 品阶对抗照常 | 断兵品阶 8：对血刀（地上 9）只按 ρ 部分生效（02 E3） |
| 需求 | 按 `gUse` 重算，永不"穿不上" | |
| 套装 | 件数照计，档位按 07 | |
| 非战斗效果 | 不受压制（身份、对话、世界事件） | 屠龙刀"宝刀招祸"照常 |
| 估值 | 按 `absGrade`（天级不可卖） | |

### 7.3 专属特效的压制分档

| `gUse` 大阶 | 神兵 ① 核心特效 | 神兵 ② 天阶特效 | 神兵护主 | 名器专属 |
|---|---|---|---|---|
| 天（10–12） | 全额 | 全额 | ✅ | —（名器不超过地上） |
| 地（7–9） | 全额（数值、概率按 `gUse` 计） | 封存 | ❌ | 全额 |
| 玄（4–6） | 按条目 `lowTier`：`half` = 数值与概率 ×0.5，规则性部分保留（如 `Mod_armed = 1`、招架乘数的"条件"）；`seal` = 封存。装备挂载的 Buff 仍直接创建当前品阶实例 | 封存 | ❌ | `half` |
| 黄（1–3） | 封存 | 封存 | ❌ | 封存 |

- 标准难度、等级封顶不额外降低 `gUse` 时，天级神兵绝对品阶 ≥ 10，天下品带入低武（−4）为玄上 6；藏史侵蚀后再入低武为玄中 5，此时至少保留“减半的核心特效”。若等级封顶或其他正式规则使 `gUse < 4`，仍按上表封印核心，不豁免黄阶档。
- 12 件神兵的 `lowTier`：削铁如泥（倚天剑、屠龙刀、匕首）、重剑无锋、绿竹如意、令随拳走、金蛇吐信、鸳鸯合璧、冷月寒光、猬刺（软猬甲）、刀枪不入（护身宝衣、乌蚕衣）均为 `half`；没有装备 `mods` 替身。
- **C09 运行口径**：`bf_weici` 与 `bf_daoqiang` 的原生目录范围均为 `[4,12]`；构建期只用该范围检查原生配表。软猬甲、护身宝衣、乌蚕衣始终直接挂载相应 Buff，实例品阶取当前 `gUse`。压制或削品令实例降到 1–3 时仍合法，不报错、不钳回 4、更不保留原天级威力；是否因本表黄阶档而封存由专属分档另判。

### 7.4 逐件计算示例（主属性含强化；`kA` 已计）

| 装备（绝对品阶 · 强化） | 倚天末（高武，Ld 70） | 笑傲开局（中武 −2，Ld 60） | 鹿鼎开局（低武 −4，Ld 44） | 要点 |
|---|---|---|---|---|
| 倚天剑（天上 12 · +10） | `gUse` 12：外攻 **3,488**；4 词条；①②；护主 | 10：**2,053**；4 词条；①②；护主 | 8：**824**（强化封存到 +8）；3 词条；仅①（20%）；无护主 | 与 03 §9.4 的 2,492 / 1,466 / 624（无强化）一致 |
| 打狗棒（天中 11 · +10，`kA 0.95`） | 11：2,935 | 9：1,576（②封存） | 7：712 | 带入中武后"群丐听令"封存，但丐帮信物身份照旧 |
| 金蛇剑（天下 10 · +8，于碧血取得后携带） | — | — | 6：**598**；2 词条；①减半（金蛇吐信 `(8% + 0.5% × 6) × 0.5` = 5.5%） | 天下品带入低武 = 玄上，仍高于鹿鼎普通池上沿（玄中） |
| 软猬甲（天下 10 · +8） | 10：外防 997×1.32 = 1,316 | 8：760 / 380；3 词条；①直接挂 `bf_weici(g8)`、②封存 | 6：299 / 150；2 词条；①直接挂 `bf_weici(g6)` 且数值 ×0.5 | 宝甲在低武被本地护身宝衣（天下，不压制）超过 |
| 护身宝衣（天下 10 · +8） | 10：直接挂 `bf_daoqiang(g10)`；①②全额 | 8：直接挂 `bf_daoqiang(g8)`；①全额、②封存 | 6：直接挂 `bf_daoqiang(g6)`，核心数值 ×0.5；②封存 | g6 的外劲条件减伤为 `8%×G(6)×0.5 = 6.8%`，不复制 Buff 公式 |
| 地上鞋（9 · +8） | 9：轻功 +22.5 | 7：+17.5 | 5：+12.5 | 鞋的轻功值不吃强化；低武中本地地中鞋（+20）反而更好 |
| **对照：鹿鼎原生韦小宝匕首**（天下 10，`kA 0.90`） | — | — | 10（本土）：+0 **715**，+8 **944**；①② 全额；护主 | **本地天下神兵 > 携带进来的天上神兵**（03 §9.3 结论） |

### 7.5 推荐携带策略

**判断口径**：对每件候选装备计算"目标书界携带价值" `Vc = G(gUse_target) × slotW × Rtarget + uniqueW + setΔ + matchW`，其中 `slotW`（主手 1.5、衣 1.2、其余 1.0）、`setΔ`、`matchW`（主手类别与携带兵器武学一致 +0.5）取自 02 §4.4 书灵推荐；本文新增 `Rtarget = 1 + 0.04 × refineEff(target)` 与 `uniqueW`（目标书界 `gUse ≥ 10`：+0.40；地阶保留核心：+0.20；玄阶减半：+0.10）【建议 02 §4.4 采纳】。

| 情境 | 推荐 | 理由（附数值） |
|---|---|---|
| 高武 → 高武（射雕→神雕→倚天） | 主手神兵 + 衣甲 + 4 件最高强化的小件；空位留给"下一书界可器合"的神兵（打狗棒、软猬甲） | 无压制，携带即全额；器合可把外来件变本土，还能得器魄 |
| 倚天 → 笑傲（高→中） | 主手必带绝对品阶最高者（倚天剑/屠龙刀，`gUse` 10 仍是天阶，②与护主保留）；带与"携带兵器武学"同类的兵器；带 +9/+10 的件（天材只在高武） | 天上 −2 = 天下，全部特效仍在；中武无天材，+9/+10 是"时代红利" |
| 中武 → 低武（碧血→鹿鼎） | 优先绝对品阶 12/11 的件（→ 8/7，地阶保留核心）；天下件（→ 玄上）只在无更好选择时带；把重甲、`heavy` 兵器换成轻装 | 02 §2.8"携带看绝对品阶"；低武本地天下神兵会超过外来件，携带件主要用来撑过开局 |
| 低武 → 低武（鹿鼎→连城→白马→鸳鸯） | 带上一部的**本地天下神兵**（匕首、宝衣、乌蚕衣）与一路随行的天上件；用"天书铭"奖励老伙计 | 本地天下 −4 = 玄上 6，与外来天上的 8 形成主次；随行 ≥ 3 次的装备可刻天书铭 +5% |
| 低武 → 中武（鸳鸯→书剑） | 同上；此时压制从 −4 回到 −2，被封存的词条与强化自动恢复 | 倚天剑回到天下 10，②与护主复活 |
| 预判下一书界为"本地神兵书界"（碧血、鹿鼎、连城、鸳鸯、飞狐） | 可少带一件同部位装备，把名额留给其他部位 | 例：进鹿鼎前少带一件衣，醒来后争取护身宝衣 |
| 藏史配合（02 §6.6） | 高武末期把一件**不急用**的天级藏于古迹，跳过中间书界的携带额度 | 取回物 = 绝对品阶 − 侵蚀 − 压制，适合"想在某个后续书界重用"的件，如倚天剑藏于峨眉、于笑傲取回 |

**反例提示**（书灵在 02 §4.4 `USELESS_CARRY` 之外的装备专属提示）：
- 带一件在目标书界 `gUse ≤ 3` 的装备（如玄中带入低武）："此物入彼界，与凡铁无异"。
- 携带的兵器与携带的兵器武学类别全不匹配："所携兵器，无一门武学可用"。
- 6 件中无主手兵器且携带了兵器武学："识海有剑法，行囊无剑"。

---

## 8. 药物、补品、药材与消耗品

### 8.1 使用规则

| 项 | 规则 |
|---|---|
| 战斗中 | 物品行动（基准 §8）：占用本次行动的"行动"部分，仍可移动；目标为自身或相邻友方（`med ≥ 40` 时射程 2） |
| 每场限次 | 每名单位丹药/解药 ≤ `3 + ⌊med/40⌋` 次（医术 0–39：3；40–79：4；80+：5）；同 ID 冷却 2 回合；天级丹药每场 1 次 |
| 战斗外 | 不限次；"静服"类（修炼、永久增益）需 `fieldTime`（时辰），期间不能旅行 |
| 品阶 | 非装备物品不跨书界，永为本土，**不存在外来压制**；施加的 Buff 品阶 = 物品品阶（06 §3.1） |
| 驱散 | 解毒/解伤类为 06 `antidote` 驱散：强度 = 物品品阶，标签由条目指定；高品阶效果按 06 §3.5.3 削品 |
| 直接治疗 | `healPct`/`mpPct` 为一次性回复，不计入 06 HOT 每回合上限；受 03 `healRecv` 修正，不受 `healPower` 修正（药力不因施药者医术而变，医术只扩大射程与限次） |
| 投掷 | 毒药、迷药、石灰等 `action: throw`：射程 3（条目可改）；点、环、区域、多目标等只声明**语义**，具体六角格范围键与坐标枚举引用 09（AR-12）；效果命中用投掷者 `effHit`（毒类另按 03 §8.2 `poi` 加成） |
| 下药 | `action: dose`：战斗外对 NPC 饮食下药，`poi` 对 NPC 识破检定（12）；成功则对应敌人**开场**带该 Buff |
| 敌人用药 | 精英/Boss 的携药量与用药时机归 09 AI |
| 冲穴辅助 | 只接受显式 `meridianAid={rateBp,successBp,costReduceBp,hours,meridians?}`；同一时刻多种药物按每槽取最高，不相加，持续到各自 `hours` 到期；适用经脉须命中可选白名单。穴道、经脉、小/大周天、十二经周流、九转、总上限与快照结算全部引用 `design/15` §5.6，不由药物反向定义 |

#### 8.1.1 冲穴辅助药物（原创扩展）

| 物品 | `meridianAid` | 使用与投放 |
|---|---|---|
| `it_buqidan` 补气丹（黄上 3） | `{rateBp:500, successBp:0, costReduceBp:0, hours:6}` | 战斗外静服；普通药铺，每书界最多购 3 枚 |
| `it_jiuzhuandan` 九转丹（模板，玄中 5） | `{rateBp:800, successBp:300, costReduceBp:500, hours:6}` | 战斗外静服；名店或门派兑换，每书界最多购 2 枚 |
| `it_dingshendan` 定神丹（地中 8） | `{rateBp:0, successBp:600, costReduceBp:1000, hours:12}` | 战斗外静服；固定节点，每书界最多 1 枚；若用于既有“走火降 1 级”，同一枚不能再提供冲穴辅助 |

上述值按 15 的总钳制核算：即便九转丹与定神丹并存，药物同来源逐槽取高仍只得到 `rate +800bp`、`success +600bp`、`costReduce +1000bp`，不是逐药相加；再与地点、师父等不同来源加算。药物只改善后续 session，不直接增加 `H`、开启穴道或免除最低 2% 失败风险。

### 8.2 数值模板（按品阶）

| 模板 | 公式 | g1 | g4 | g7 | g9 | g10 | g12 |
|---|---|---|---|---|---|---|---|
| 疗伤 `healPct` | `hpMax × 5% × G` | 5% | 7% | 10% | 12% | 14% | 17.5% |
| 回内 `mpPct` | `mpMax × 6% × G` | 6% | 8.4% | 12% | 14.4% | 16.8% | 21% |
| 回体 `staPct` | `staMax × 10% × G` | 10% | 14% | 20% | 24% | 28% | 35% |
| 修炼 `sxpGrant`（05 §8.5，`pctNext`） | 黄 0.10 / 玄 0.20 / 地 0.35 / 天 0.50 | 0.10 | 0.20 | 0.35 | 0.35 | 0.50 | 0.50 |
| 修炼加速 `sxpBuff` | 黄 ×1.15 / 玄 ×1.20 / 地 ×1.30 / 天 ×1.40，持续 5 场 | | | | | | |

- 节奏校准：基准 §5 同级普通敌人 8–12 击杀主角（每击约 8%–12% 气血），黄阶疗伤约抵半击、地上约抵一击、天级约抵一击半——吃药是"用一次行动换一击"，不会比攻击更划算。
- 05 §8.5 限制：同一武学在同一书界经丹药获得的层数 ≤ 2（防嗑药速成），本文所有 `sxpGrant` 受此约束。

#### 8.2.1 AR-20 四阶取样、补品预算与药材年限

为名录与出图取同阶代表值：黄／玄／地／天分别用 `grade=3/6/9/10`，对应基准 `G=1.20/1.70/2.40/2.80`。因此：

- 补血 `healPct=5%×G` → `6%/8.5%/12%/14%`；补气 `mpPct=6%×G` → `7.2%/10.2%/14.4%/16.8%`。小数按 03 §0.3 到结算末尾向下取整。
- 临时属性只引用 06 `bf_*`，品阶即物品 `grade`；永久属性必须走 §8.5 `permBudget`：黄／玄／地／天单份最多先天 `+0/+1/+1/+2` 或 `hpMax/mpMax +0/+0.5%/+1%/+2%`【建议值】，两种预算不可同份叠满。
- 复活只允许天级固定物品，挂 06 `bf_fuhuo`，每战 1 次；疗伤、解毒、经脉辅助不能以“复活”文案绕过该限制。
- `meridianAid` 只改善后续冲穴 session，不直接开穴、加 `H` 或永久强化经脉；字段与总钳制仍只见 `design/15` §5.6。

| `ageYears` 档 | 展示 | 大阶 | 代表品阶 | 资源 / 玩法约束 |
|---|---|---|---:|---|
| `0..9` / `null` | 普通 | 黄 | 3 | 常规采集与药铺；无永久属性 |
| `10..99` | 十年 | 玄 | 6 | 精英采集点；可作玄阶炼丹主材 |
| `100..999` | 百年 | 地 | 9 | 固定稀有点；每书界同族至多 3 份【建议值】 |
| `>=1000` | 千年 | 天 | 10 | 天材／固定奇遇；每书界同族至多 1 份【建议值】，不可商店刷新 |

年限只决定**最低大阶**，不会把普通草药自动变成补血／永久增益成品；效果仍由药材条目的 `use` 或丹方决定。名字写“千年”却 `ageYears<1000`、或同一 `herbFamily` 年限越高而品阶越低，均为构建错误。

AR-28 的具名药材字段、子类、效果与炼丹消费接口仍以本文 §2、§8.7 为准；资源四阶九品、估值与库存封装只引用 `design/16` §2～§3，普通采集刷新及逐味地区 / 月份分别引用 `design/11` §4.3 与 `catalog/gather-herbs.md`。同一采得批次从 `resourceRef` 封装为 `it_*` 时只记一次 `economySource=resource`；炼丹和出售只是资产转化，不重复生成经济来源。

### 8.3 丹药目录

**A. 疗伤 · 回内 · 保命（18）**

| ID | 名称 | 品阶 | 效果（06 Buff 引用） | 获取 | 原著出处 / 标注 |
|---|---|---|---|---|---|
| `it_jinchuangyao` | 金创药 | 黄下 1 | 外敷：`healPct` + `antidote` 驱散 `bleed`（g1） | 药铺 | 江湖通用（原创定级） |
| `it_huoxuewan` | 活血丸 | 黄中 2 | `healPct` | 药铺 | 原创扩展 |
| `it_buqidan` | 补气丹 | 黄上 3 | `mpPct`；战斗外静服：`sxpBuff ×1.15` 5 场 | 药铺 | 原创扩展（05 §8.5 建议之"补气丹"） |
| `it_xiaohuandan` | 小还丹 | 玄中 5 | `healPct` + `bf_huichun` 3 回合 | 少林、药铺 | **（原创扩展）**；沿用武侠游戏常见药名，不作为金庸原著专名 |
| `it_tianqishadansan` | 田七鲨胆散 | 玄上 6 | `healPct` + 驱散 `injury`（g6） | 射雕·桃花岛线、药铺 | 射雕·黄药师配制，黄蓉曾交给受伤的柯镇恶；具体数值为**（原创扩展）** |
| `it_huxindan` | 护心丹 | 玄上 6 | `bf_suoxue` ×1 | 药铺 | 原创扩展（06 已列为锁血来源） |
| `it_yufengjiang` | 玉蜂浆 | 玄上 6 | `bf_huinei` 3；战斗外 `bf_yangsheng` | 神雕·古墓 | 神雕·古墓以玉蜂蜜浆解蜂毒；回内、养生效果为**（原创扩展）**（06 已注） |
| `it_baiyunxiongdanwan` | 白云熊胆丸 | 地下 7 | 内服：`healPct` + 驱散 `injury`（g7） | 笑傲·恒山派 | 笑傲·恒山派疗伤圣药 |
| `it_tianxiangduanxujiao` | 天香断续胶 | 地下 7 | 外敷：`healPct × 0.6` + `bf_huoluo` 3 + 驱散 `bleed`、`injury.bone`（g7） | 笑傲·恒山派 | 笑傲·恒山派外伤灵药（06 已注） |
| `it_bilingdan` | 碧灵丹 | 地上 9 | `healPct` + 驱散 `poison`、`injury`（g9，专属类除外） | XK 跨界致敬固定委托 **（原创扩展）** | 梁羽生《云海玉弓缘》有碧灵丹与天山派／雪莲语境；具体药效边界 **（待考）**，数值与投放为 **（原创扩展）** |
| `it_yudongheishidan` | 玉洞黑石丹 | 地中 8 | 驱散 `poison`（g8）；随后 2 时辰显示“腹痛”叙事状态（无战斗数值） | 倚天·崆峒派 | 倚天·崆峒派解毒药；张无忌令何太冲夫妇服药以延缓毒性，服后会腹痛。品阶与精确驱散范围为**（原创扩展）** |
| `it_tianwangbaomingdan` | 天王保命丹 | 地中 8 | `bf_suoxue` 2 回合 + `healPct × 0.5` | 鹿鼎·神龙教固定节点 | 鹿鼎·洪安通将三颗天王保命丹交陆高轩救治青龙使；锁血与回复数值为**（原创扩展）** |
| `it_qiannianrenshen` | 千年人参 | 天下 10 | 战斗：`healPct` + `mpPct × 0.5`；战斗外静服（2 时辰）：永久 `hpMax pct +2%`、`mpMax pct +2%`（§8.2.1、§8.5 预算） | 辽东／塞北固定奇遇；每书界同族至多 1 份 | 通用珍药；千年→天阶及玩法数值均**（原创扩展）** |
| `it_dahuandan` | 大还丹 | 地上 9 | **二选一**：急服（战斗）＝`healPct` + `bf_xuming` 3 + `bf_mian_shang` 2；静服（战斗外 1 日）＝主运内功 `sxpGrant pctNext 0.35` | 少林方丈/藏经阁任务 | **（原创扩展）**；沿用武侠游戏常见“少林大还丹”设定，未作为金庸原著专名（05 K11；06 已注） |
| `it_jiuhuayulu` | 九花玉露丸 | 地上 9 | `healPct` + `bf_xuming` 3 + 驱散 `injury`（g9）；战斗外：清除全部内伤层数 | 射雕·桃花岛（丹方 `rc_jiuhuayulu`，需桃花岛花露） | 射雕·黄药师所制，以珍异药材及九种花瓣上的清晨露水调配；具体治疗数值为**（原创扩展）** |
| `it_heiyuduanxugao` | 黑玉断续膏 | 地上 9 | 外敷：立愈 `bf_gushang`、驱散 `bf_huagu`（06 已注）；战斗外：治愈剧情"断骨/残肢"伤势标记（chapters） | 倚天·金刚门（赵敏线） | 倚天·西域金刚门秘药，续接断骨，治愈俞岱岩、殷梨亭 |
| `it_xumingbawan` | 续命八丸 | 地上 9 | 战斗：`bf_xuming` 3；战斗外：走火入魔 3 级暂缓 5 日（05 §10.3）、`bf_yizhongzhenqi` −5 层 | 笑傲·黄河老祖线固定节点 | 笑傲·老头子为女儿老不死所备的八颗丸药，祖千秋盗取后混入酒中给令狐冲服下；本作治走火与异种真气效果为**（原创扩展）** |
| `it_tianshanxuelian` | 天山雪莲 | 地上 9 | 战斗：`healPct`；战斗外：`antidote` 驱散全部 `poison`、`cold`（g9，专属类除外）+ 永久 `resCold pp +3` | 书剑·天山 | 书剑恩仇录·陈家洛与喀丝丽在雪山峭壁遇见雪中莲；药效与永久抗寒为**（原创扩展）** |
| `it_jiuzhuanhuanhundan` | 九转还魂丹 | 天下 10 | 服下即挂 `bf_fuhuo`（本场倒地时复活，06）；每场 1 次 | 天材骰（高武 Boss） | 原创扩展（06 已列为复活来源） |

**B. 解毒 · 专属解药（12）**

| ID | 名称 | 品阶 | 效果 | 获取 | 原著出处 / 标注 |
|---|---|---|---|---|---|
| `it_xingjiutang` | 醒酒汤 | 黄下 1 | 驱散 `bf_zuiyi` | 酒肆 | 通用 |
| `it_xionghuangjiu` | 雄黄药酒 | 黄上 3 | `bf_bigu` 3⁺ + 临时 `bf_mian_gu` 2 | 酒肆、端午节令 | 民俗（原创定级；06 已注） |
| `it_bidudan` | 辟毒丹 | 玄下 4 | `bf_bidu` 3⁺ + 临时 `bf_mian_du` 2 | 药铺 | 原创扩展（06 已注） |
| `it_jieduwan` | 解毒丸（模板 1–9） | 1–9 | `antidote` 驱散 `poison`（品阶 = g；专属类除外） | 药铺、配药 | 通用（原创扩展） |
| `it_nuanyangdan` | 暖阳丹 | 地下 7 | 压制 `bf_handu` 24 时辰 | 药铺、道观 | 原创扩展（06 已注） |
| `it_shixiangruanjinsan_jieyao` | 十香软筋散解药 | 地下 7 | 专属驱散 `bf_shixiang` | 倚天·万安寺线 | 倚天·赵敏所用迷药之解药 |
| `it_beisuqingfeng_jieyao` | 悲酥清风解药 | 地中 8 | 专属驱散 `bf_beisu` | 天龙·西夏一品堂 | 天龙·悲酥清风使用者预先在鼻中塞解药，受毒者可用同类解药解除 |
| `it_dingshendan` | 定神丹 | 地中 8 | 走火入魔降 1 级 | 固定节点 | 原创扩展（06 已注） |
| `it_shengsifu_zhentongwan` | 生死符镇痛丸 | 地中 8 | 压制 `bf_shengsifu` 发作 30 日（不根治） | 天龙·灵鹫宫 | 天龙·天山童姥赐药止痛以制群豪（药名原创扩展） |
| `it_baotai_jieyao` | 豹胎易筋丸解药 | 地中 8 | 重置 `bf_shouzhi` 期限 | 鹿鼎·神龙教 | 鹿鼎·神龙教定期赐解药 |
| `it_sanshi_jieyao` | 三尸脑神丹解药 | 地上 9 | 重置 `bf_gu_sanshi` 期限（06 示例 D 已引用此 ID） | 笑傲·日月神教 | 笑傲·每年须服解药 |
| `it_jueqingdan` | 绝情丹 | 地上 9 | 专属根治 `bf_qinghuadu`；`unique` | 神雕·绝情谷 | 神雕·绝情谷祖传解情花毒之丹；裘千尺毁去大批后仅留三枚，剧情推进时世间只余一枚可争夺 |

**C. 战斗增益（7，品阶模板 1–9，Buff 取 06 默认持续）**

| ID | 名称 | 施加（06） | ID | 名称 | 施加（06） |
|---|---|---|---|---|---|
| `it_daliwan` | 大力丸 | `bf_waigong_sheng` | `it_shenxingdan` | 神行丹 | `bf_jisu` |
| `it_jiuzhuandan` | 九转丹 | `bf_neijin_sheng` | `it_qingshendan` | 轻身丹 | `bf_shenqing`（探索中持续 6 时辰，临时轻功可过门禁，03 §11.5 #5） |
| `it_guijiadan` | 龟甲丹 | `bf_jiangu` | `it_dingxinwan` | 定心丸 | `bf_shouyi` |
| `it_yingmusan` | 鹰目散 | `bf_ningshen` | | | |

以上七种皆为原创扩展（06 §8.1 已列为对应 Buff 的来源），药铺按书界供货上限出售（§13.4）。

**D. 永久增益 · 修炼 · 奇物（7）**

| ID | 名称 | 品阶 | 效果 | 限制 | 获取 | 原著出处 / 标注 |
|---|---|---|---|---|---|---|
| `it_mangguzhuha` | 莽牯朱蛤 | 天下 10 | 服食：永久 06 `bf_mian_du`（百毒不侵，品阶 10，不受压制——永久被动随角色而非物品） | `unique`，全作 1 只；其血另可作 06 §9.4“万毒之王”解金蚕/碧蚕蛊 1 次（二者择一） | 天龙·无量山奇遇（chapters/01） | 天龙·段誉先中闪电貂毒，后在无量山误吞号称万毒之王的莽牯朱蛤，从此百毒不侵；取血解蛊为**（原创扩展）** |
| `it_pusiqushedan` | 菩斯曲蛇胆 | 地上 9 | 静服：永久 `str +1`、`con +1`（两个 `permStat` 原子结算） | 每书界 ≤ 3 枚；计入 §8.5 先天预算 | 神雕·剑冢（神雕所喂） | 神雕·神雕反复取菩斯曲蛇胆给断臂后的杨过服食，助其力气大增、内息畅行；点数与枚数上限为**（原创扩展）** |
| `it_shengshengzaohuadan` | 生生造化丹 | 天下 10 | 静服 1 日：`breakCap`（玩家选定一项先天上限 +5）并该项永久 +2 | 每书界 ≤ 1（03 §2.1 与奇遇合计 ≤ 2） | 飞狐·药王庄固定节点或天材骰 | 飞狐外传·《药王神篇》记载此丹可令无药可治的中毒者延命九年，再服无效；本作改为突破上限与加先天，属**（原创扩展）** |
| `it_tongxidilongwan` | 通犀地龙丸 | 地上 9 | **佩持而非服食**：在背包时 `resPoison pp +8`、`resGu pp +4`；离开背包立即失效 | `unique`；不计 §8.5 永久抗性预算 | 射雕·桃花岛求亲线固定节点 | 射雕·欧阳锋以西域异兽材料配药制成，仅一颗，佩在身上可以辟毒；本作抗性数值为**（原创扩展）** |
| `it_baoshexue` | 宝蛇之血 | 地上 9 | 饮：永久 `resPoison pp +10`、`mpMax pct +1%` | `unique` | 射雕·梁子翁线 | 射雕·郭靖吸饮梁子翁以珍药养成的宝蛇之血，气力与内力由此增长；永久抗毒与数值为**（原创扩展）** |
| `it_labazhou` | 腊八粥 | 地上 9 | 食：永久 `mpMax pct +2%`，并主运内功 `sxpGrant pctNext 0.35` | 侠客岛上至多 3 碗；属菜肴类，不占膳食位 | 侠客·侠客岛 | 侠客行·侠客岛以十年一开的“断肠蚀骨腐心草”为主药熬粥，趁热服对练武者大有补益；具体数值与三碗上限为**（原创扩展）** |
| `it_xuanbingbihuojiu` | 玄冰碧火酒 | 地中 8 | 饮：30 日内 05 §5.4 阴阳相冲判定概率 ×0.5，并 `mpPct × 0.5` | 每书界 1 瓶 | 侠客·丁家线 | 侠客行·丁珰盗取丁不三所酿玄冰碧火酒给石破天饮下，暂压其体内阴阳二气冲突；持续与数值为**（原创扩展）** |

上表中 `it_buqidan`、`it_jiuzhuandan`、`it_dingshendan` 的冲穴辅助是同一 ItemDef 上的附加字段，分别见 §8.1.1；不增加目录数量，也不改变其战斗效果。

### 8.4 毒药与迷药（11）

| ID | 名称 | 品阶 | 用法 | 效果（06） | 获取 | 原著出处 / 标注 |
|---|---|---|---|---|---|---|
| `it_shihuifen` | 石灰粉 | 黄中 2 | 投掷（单体，射程 2） | `bf_shimang` | 杂货铺 | 鹿鼎·韦小宝曾以石灰撒敌眼睛，亦曾从棺中扬灰脱身（06 已注） |
| `it_menghanyao` | 蒙汗药 | 黄上 3 | 下药：目标开场 `bf_hunshui`；投掷（六角半径 1 邻接环，09）：施加概率 ×0.6 | `bf_hunshui` | 黑市 | 江湖通用 |
| `it_mixiang` | 迷香 | 玄下 4 | 投掷（六角半径 1 区域，持续 2 回合，09） | `bf_mihuo` | 黑市 | 江湖通用（06 已注） |
| `it_duanchangcao` | 断肠草 | 地下 7 | 服：情花毒持有者触发 06 `rx_yiduigongdu`（移除情花毒，中剧毒 2 回合）；否则中剧毒；亦为淬毒材 | `bf_judu` | 神雕·断肠崖 | 神雕·杨过以断肠草解情花毒 |
| `it_huashifen` | 化尸粉 | 地下 7 | 战斗外：毁尸灭迹（任务用，11/12）；淬毒材 | `bf_huagu`（仅对流血目标） | 鹿鼎·海大富 | 鹿鼎·海大富、韦小宝所用化尸粉 |
| `it_shixiangruanjinsan` | 十香软筋散 | 地下 7 | 下药（战斗外） | `bf_shixiang` | 倚天·赵敏线 | 倚天·赵敏以之擒六大派高手 |
| `it_qixinhaitang` | 七心海棠 | 地中 8 | 下药、淬毒 | `bf_qixin` | 飞狐·药王谷 | 飞狐·程灵素所种七心海棠，无色无味 |
| `it_beisuqingfeng` | 悲酥清风 | 地中 8 | 投掷（六角半径 1 区域、射程 3，09） | `bf_beisu` | 天龙·西夏一品堂 | 天龙·一品堂所用毒气（06 已注） |
| `it_baotaiyijinwan` | 豹胎易筋丸 | 地中 8 | 剧情强制服用 | `bf_shouzhi` | 鹿鼎·神龙教 | 鹿鼎·洪安通以之控制教众 |
| `it_tianyishenshui` | 天一神水 | 地上 9 | 下药（战斗外）；不得配制 | `bf_judu` | XK·神水宫唯一封存节点 | 古龙《楚留香传奇·画眉鸟》相关案件；宫门人物与药物细节 **（待考）**，玩法与安全化表现 **（原创扩展）**；不写现实配方或摄入方式 |
| `it_jinboxunhua` | 金波旬花 | 地上 9 | 下药、淬毒 | `bf_judu` | 连城 | 连城·凌退思以奇毒金波旬花害丁典，并将毒涂于凌霜华棺木；投掷/淬毒用法为**（原创扩展）** |
| `it_sanshinaoshendan` | 三尸脑神丹 | 地上 9 | 剧情强制服用 | `bf_gu_sanshi` | 笑傲·日月神教 | 笑傲·日月神教以之控制部众（06 示例 D） |

**合计**：A 19 + B 12 + C 7 + D 7 + 毒迷 12 = **57 种**；新增跨作者样本为梁羽生碧灵丹与古龙天一神水，均保留考据边界。

### 8.5 永久增益物品的预算

与 03 §2.9、D-13、D-14 对齐；"丹药部分"之外的份额留给奇遇（11）与传功（05 §8.4）。

| 项 | 全程上限（丹药/食物部分） | 每书界投放上限（高 / 中 / 低武） | 来源示例 | 超额处理 |
|---|---|---|---|---|
| 先天永久点 | +20（03 全程 +50 中，其余归奇遇） | 3 / 1 / 每两部 1 | 菩斯曲蛇胆、生生造化丹 | "药力已饱和"：只保留临时部分 |
| `breakCap` | 与奇遇合计每书界 ≤ 2（03 §2.1） | 丹药 ≤ 1 | 生生造化丹 | 同上 |
| `hpMax` pct | +16%（03 D-14：丹药 + 传功 ≤ 30%，预留传功 12%） | +2% / +1% / +0.5% | 千年人参 | 同上 |
| `mpMax` pct | +28%（≤ 40%，预留传功 12%） | +3% / +2% / +1% | 腊八粥、千年人参、宝蛇之血 | 同上 |
| 抗性 pp（永久） | 每项 +15pp | — | 宝蛇之血、天山雪莲；通犀地龙丸仅为佩持加值，不计永久预算 | 同上 |
| 永久免疫 | 全作仅莽牯朱蛤 1 例 | — | — | — |

- 校验：高 4 部 × +2% + 中 6 部 × +1% + 低 4 部 × 0.5% = 16%（`hpMax`）；`mpMax` 4 × 3 + 6 × 2 + 4 × 1 = 28%；先天 4 × 3 + 6 × 1 + 2 = 20。
- 存档字段 `permBudget: {innate, hpPct, mpPct, res: Record<tag, number>}`；书界投放上限由内容校验（§15）保证。

### 8.6 暗器弹药

| ID | 名称 | `kind` | 品阶范围 | 特性 | 附带（本次命中） | 来源 |
|---|---|---|---|---|---|---|
| `it_feihuangshi` | 飞蝗石 | `ball` | 1–3 | 钝击 | 10% `bf_chihuan` | 通用 |
| `it_jinqianbiao` | 金钱镖 | `dart` | 1–4 | — | — | 通用 |
| `it_xiujian` | 袖箭 | `bolt` | 2–6 | 射程 +1 | 本次 `pierce +5` | 通用 |
| `it_tiejili` | 铁蒺藜 | `dart` | 2–6 | 可布地：六角半径 1 区域（2 回合，09），入格者 `bf_panshan` | — | 通用 |
| `it_sangmending` | 丧门钉 | `awl` | 3–7 | — | 10% `bf_liuxue` | 通用 |
| `it_feidao` | 飞刀 | `dart` | 3–9 | 本次 `crit +5` | — | 通用 |
| `it_duzhen` | 毒针 | `needle` | 3–9 | 自带淬毒，每枚必定施加 | `bf_zhongdu`（品阶 = g） | 通用 |
| `it_touguding` | 透骨钉 | `awl` | 4–8 | 本次 `Z2 +5%` | 15% `bf_liuxue` | 通用 |
| `it_meihuazhen` | 梅花针 | `needle` | 4–8 | 一次选 3 个合法目标（多目标模板归 09），消耗 3 | — | 通用 |

- 弹药倍率 `ammoMul(g)` 见 §3.5；弹药为普通物品，书眠时清空。
- 名门暗器的自带弹药不在此表（§5.4）。

### 8.7 炼丹、配毒、配解药

| 项 | 规则 |
|---|---|
| 配方 | 学识 `rc_<拼音>`（丹方/毒方/解方），得自配方卷 `it_fang_*`、NPC 传授、奇遇；**跨书界保留**（§12.3） |
| 场所 | 丹炉（药铺、道观、门派丹房）；奇物"神木王鼎"可随身配毒（§11.3） |
| 门槛与成功率 | 技艺 ≥ `T(g)`；`P = clamp(0.60 + 0.04 × (技艺 − T(g)), 0, 1)`（03 §8.1）；技艺：丹药 `alchemy`、毒药 `poi`、解药 `antidote`（03 §8.2） |
| 产量 | `1 + ⌊(技艺 − T(g)) / 25⌋`（03 §8.2） |
| 材料 | 主药 1 份（品阶 ≥ g）＋辅药 2 份（品阶 ≥ g − 2）＋药引（配方指定，如九花玉露丸须"桃花岛花露"，只在桃花岛采集） |
| 耗时 | `g` 时辰 |
| 失败 | 返还一半药材，无"炸炉"惩罚 |
| 天级 | 天级丹方只在固定节点；主药须天材；`alchemy ≥ T(10) = 76` |
| 示例 | `rc_jinchuangyao`（黄下，门槛 4）、`rc_xiaohuandan`（玄中，36）、`rc_baiyunxiongdanwan`（地下，52，恒山派贡献兑换）、`rc_jiuhuayulu`（地上，68，桃花岛）、`rc_heiyuduanxugao`（地上，68，金刚门）、`rc_menghanyao`（毒方，黄上，20） |

#### 8.7.1 大还丹正式配方（经脉落地终审返修）

**（原创扩展）**：本配方承接少林册 §1.7.3 少林伤科的“大还丹方”被动；成药效果只引用 §8.3 的 `it_dahuandan`，不作为原著丹方。

| 项 / `RecipeDef` 字段 | 定义 |
|---|---|
| `id` / 名称 | `rc_dahuandan` / 大还丹方 |
| `output` / `craftGrade` | `it_dahuandan` / `9`（地上）；每炉成功产量按本节通则结算，不另发配方卷 |
| 配方解锁 | 已习得 `sk_shaolinshangke` ≥7 重且 `alchemy ≥40` 时获得学识，沿少林册既有解锁门槛【建议值】；这是配方学习条件，不是整门伤科的学习门槛或制作许可 |
| 实际制作 | 已学 `rc_dahuandan` 且 `alchemy ≥ T(9)=8×9−4=68`，并满足材料、丹炉要求；未达门槛不可尝试、不扣材料。技艺有效值口径见 03 §8 与本文 §4.6 |
| `inputs[]` | 按 §8.7 通则：主药 `family:herb`、`materialGrade ≥9`，1 份；辅药 `family:herb`、`materialGrade ≥7`，2 份。药引【建议值】：另用 `family:herb`、`materialGrade ≥7` 的药材 1 份，复用辅药品阶下限，不要求具名物品；每炉共 4 份，主药、辅药与药引不得重复使用同一份材料；资源封装见 §6.8 与 16 §3 |
| `station` / `time` | 丹炉（药铺、道观或门派丹房），按 §8.7 耗时 `g=9` 时辰；神木王鼎的随身配毒许可不代替炼丹场所 |
| 成功率 / 产量 / 失败 | 全部沿 §8.7 与 03 §8.1–8.2：`P=clamp(0.60+0.04×(alchemy−68),0,1)`；成功得 `1+⌊(alchemy−68)/25⌋` 枚 `it_dahuandan`；失败无成药，返还一半药材。材料按炉消耗，不随成功产量重复扣除 |
| 保留 | 学识依 §12.3 跨书界保留；伤科重数与解锁门槛只在首次学方时检查，后续制作不重复要求伤科。成药及材料仍按普通物品书眠清空 |

核算：伤科 7 重、`alchemy=40` 仅解锁；`alchemy=68` 时 `P=0.60`、成功产量 `1+⌊0/25⌋=1`；78 时 `P=1.00`、产量 `1+⌊10/25⌋=1`；93 时 `P=1.00`、产量 `1+⌊25/25⌋=2`。不得把解锁值 40 当作 `T(9)`，也不得把配方品阶降为伤科自身的玄中 5。

---

## 9. 食材、食品、菜肴与烹饪

### 9.0 食材与食品接口（AR-20）

| 类 | 子类 | 字段 / 使用 | 与烹饪衔接 |
|---|---|---|---|
| 食材 `material/ingredient` | `grain` 谷物、`meat` 肉、`fish` 水产、`vegetable` 菜蔬、`fruit` 果、`spice` 调料、`rare` 珍材 | `ingredientKind`、`materialGrade`、`resourceRef`；默认不可直接使用 | §9.4 的 `inputs[]` 消耗物；实际资源点、狩猎和库存归 `design/16` |
| 食品 `food` | `ration` 干粮、`snack` 点心、`preserved` 腌藏 | 可直接 `eat`，通常只给 `staPct` 或短时养生 | 可作为菜肴配方的已加工输入；不得同时作为同批成品与输入 |
| 菜肴 `dish` | `dish` 菜、`soup` 汤、`snack` 点心 | 以 `meal` 提供整场 ×0.5 Buff，或条目声明即时／永久效果 | 由菜谱、食材品阶和 `recipeMastery` 结算（§9.4） |

四阶样本同 §8.2.1 取 `grade=3/6/9/10`。食材品阶限制可制作上限但不直接把食品效果放大：成品 `gCook` 仍以 `design/12` §10.4 返回值为准。天级食材／食品只来自天材或固定剧情，不能由普通厨房靠熟练度“升炼”出来。

### 9.1 膳食规则

| 项 | 规则 |
|---|---|
| 膳食位 | 每名角色 1 个"膳食"状态，新食替换旧食；"酒"独立计（06 `bf_zuiyi`），二者可并存 |
| 进食 | 战斗外，耗时 0.5 时辰；获得膳食状态，持续 `N` 场战斗或 `M` 时辰（先到者） |
| 战斗效果 | 每场 `onBattleStart` 按菜肴配置施加 06 Buff：持续 `battle`（整场）、**数值 × 0.5**（`mealScale`）、品阶 = 菜肴品阶；与同名临时 Buff 按 06 叠加规则处理 |
| 战斗外效果 | 部分菜肴附 06 `bf_yangsheng`（养生）、回体、`staMax`、御寒等 |
| 同席 | 客栈/营地"同席"：一道菜供 1 人，名菜一道供 4 人（在场队友） |
| 书眠 | 膳食状态消失 |

> 为什么是"整场 × 0.5"：06 的增益多为 3 回合，整场生效等于放大 3–5 倍；减半后一道地阶名菜约等于"整场一条黄上—玄下强度的增益"，是有感但不喧宾夺主的开场红利。

### 9.2 黄蓉菜谱（射雕致敬）

原著中黄蓉以美食换得洪七公传授郭靖降龙十八掌（射雕）。本作：把下列任意 3 道菜献给洪七公 → 好感大增并开启"拜师"节点（chapters/02）；菜谱学识得自黄蓉羁绊线，**跨书界保留**，以后在任何书界凑齐食材都能做。

| ID | 菜名 | 品阶 | 食材（主） | 膳食效果（开场、整场、×0.5） | 战斗外 | 持续 | 原著出处 |
|---|---|---|---|---|---|---|---|
| `it_jiaohuaji` | 叫化鸡 | 玄中 5（黄蓉亲手 地下 7） | 鸡、黄泥、荷叶 | `bf_jiangu` | 体力全满、`bf_yangsheng` | 4 场 / 12 时辰 | 射雕·黄蓉制叫化鸡款待洪七公，由此引出以美食换传功的情节 |
| `it_yudishuijiatingluomei` | 玉笛谁家听落梅 | 地中 8 | 羊羔坐臀、小猪耳朵、小牛腰子、獐腿、兔肉 | "五味"：`bf_waigong_sheng`、`bf_neijin_sheng`、`bf_ningshen`、`bf_huixin`、`bf_jisu` | — | 3 场 / 12 时辰 | 射雕·黄蓉为洪七公所制，将羊、猪、牛、獐、兔五味组合成肉条，取“五五梅花”之意 |
| `it_haoqiutang` | 好逑汤 | 地下 7 | 樱桃、斑鸠、嫩笋、荷叶、花瓣 | 同席全员 `bf_ruiyi`（数值 ×0.4） | 同席的羁绊队友之间本书界羁绊 +2（每人每书界 1 次，12） | 3 场 / 12 时辰 | 射雕·黄蓉以荷叶清汤、笋丁、花瓣和嵌斑鸠肉的樱桃制汤，借“君子好逑”命名 |
| `it_ershisiqiaomingyueye` | 二十四桥明月夜 | 地中 8 | 火腿、豆腐 | `bf_dingxin`、`bf_shouyi`、`bf_huinei` | 12 时辰内闭关收益 ×1.10（05 §8.3） | 3 场 / 12 时辰 | 射雕·黄蓉在火腿中挖二十四孔嵌入豆腐球蒸制，成菜只取豆腐 |

### 9.3 其他菜肴、酒与酒杯

| ID | 名称 | 品阶 | 类 | 效果 | 持续 | 出处 / 标注 |
|---|---|---|---|---|---|---|
| `it_mantou` | 馒头 / 烧饼 | 黄下 1 | 干粮 | 即时回体 `staPct` | — | 通用 |
| `it_jiachangfan` | 家常饭 | 黄下 1 | 菜 | 仅即时回体 `staPct`，详见 §9.3.1 | — | 烹饪失败产物 **（原创扩展）** |
| `it_jiangniurou` | 酱牛肉 | 黄中 2 | 菜 | `bf_waigong_sheng` | 2 场 | 江湖酒馆"切二斤牛肉"的通用风味（原创定级） |
| `it_lingjiaogeng` | 菱角羹 | 玄下 4 | 汤 | `bf_huichun` | 3 场 | 天龙·燕子坞阿碧采菱的江南风味（菜名原创扩展） |
| `it_kaoquanyang` | 烤全羊 | 玄上 6 | 名菜（供 4 人） | `bf_waigong_sheng`、`bf_jiangu` | 3 场 | 草原风味：射雕、书剑、白马（原创扩展） |
| `it_yushan` | 御膳 | 地中 8 | 名菜（供 4 人） | 自选 3 条：外攻/内劲/坚固/凝神/会心/疾速 | 3 场 | 鹿鼎·韦小宝曾在御膳房当差（菜品原创扩展） |
| `it_labazhou` | 腊八粥 | 地上 9 | 汤 | 见 §8.3 D（永久增益，不占膳食位） | — | 侠客行·侠客岛 |
| `it_nverhong` | 女儿红 | 黄上 3 | 酒 | `bf_zuiyi` 1 层 | 06 | 通用 |
| `it_manaijiu` | 马奶酒 | 黄上 3 | 酒 | `bf_zuiyi` 1 层 + `bf_yuhan` | 06 | 草原通用 |
| `it_fenjiu` | 汾酒 | 玄下 4 | 酒 | `bf_zuiyi` 1 层；配玉杯 ×1.5 | 06 | 笑傲·祖千秋论酒，称汾酒当用玉杯 |
| `it_putaojiu` | 葡萄酒 | 玄中 5 | 酒 | 同上；配夜光杯 ×1.5 | 06 | 同上 |
| `it_zhuangyuanhong` | 状元红 | 玄中 5 | 酒 | 同上；配古瓷杯 ×1.5 | 06 | 同上 |

**AR-23 新增原著场景菜肴**：下表只登记成品与膳食投影；七列机器名录、外观、史实边界与 **（待考）** 标记见 `catalog/items-food.md`。`meal` 仍按 §9.1 在战斗开场施加整场 ×0.5 Buff；数值、菜式复原与未见原著定本的形制均为 **（原创扩展）**。

| ID | 书界 / 场景 | 品阶 | 类 | `meal` | 供餐 | 考据状态 |
|---|---|---:|---|---|---:|---|
| `it_tangshuangtaotiao` | 射雕·黄蓉所点糖霜桃条 | 玄中 5 | 腌藏 | `bf_juqi:1battle` | 1 | 原著明确果品；宋代食单化用 |
| `it_huayuan_gaobing` | 越女·范蠡花园糕饼 | 玄下 4 | 点心 | `bf_jiangu:2battle` | 1 | 原著明确糕饼；品种 **（待考）** |
| `it_aqing_qingcha` | 越女·阿青喝茶吃饼 | 玄中 5 | 汤 | `bf_ningshen:2battle` | 1 | 原著明确清茶；茶种 **（待考）** |
| `it_muwu_gancaifan` | 天龙·木屋干菜白饭 | 玄下 4 | 菜 | `bf_qingxin:2battle` | 1 | 原著明确食物组合 |
| `it_liaoying_yangrou` | 天龙·萧峰辽营羊肉 | 地下 7 | 菜 | `bf_shichen:2battle` | 1 | 羊肉细节 **（待考）** |
| `it_dali_qingming_chadian` | 天龙·大理王府清茗点心 | 玄中 5 | 点心 | `bf_ningshen:1battle` | 1 | 原著明确奉茶、点心；茶种与品种 **（待考）**，不称现代普洱茶餐 |
| `it_songhelou_xiaren` | 天龙·姑苏松鹤楼虾仁 | 玄中 5 | 菜 | `bf_yangsheng:1battle` | 1 | 江南酒楼场景；菜名 **（待考）** |
| `it_shaolin_sumian` | 天龙·虚竹镇甸素面 | 玄下 4 | 菜 | `bf_qingxin:1battle` | 1 | 原著明确点两碗素面 |
| `it_qingshui_yufeng_mijiang` | 神雕·清水调玉蜂蜜浆 | 玄中 5 | 汤 | `bf_huinei:2battle` | 1 | 原著明确饮食 |
| `it_qingcai_doufu_xiaoyufan` | 神雕·程英青菜豆腐小鱼饭 | 地下 7 | 名菜 | `bf_ruiyi:2battle` | 4 | 原著明确食物组合；供餐原创 |
| `it_hanshui_siwan_fancai` | 倚天·汉水鸡肉鱼蔬四碗 | 玄中 5 | 名菜 | `bf_huichun:2battle` | 4 | 原著明确食物组合 |
| `it_binghuodao_kaoxiongrou` | 倚天·冰火岛熊洞烤熊肉 | 玄上 6 | 菜 | `bf_yuhan:2battle` | 1 | 原著明确食物 |
| `it_guangmingding_suxian_yuanbing` | 倚天·光明顶素馅圆饼 | 黄上 3 | 干粮 | `bf_qingxin:1battle` | 1 | 原著明确食物 |
| `it_fuzhou_yeji_huangtu` | 笑傲·福州酒铺野鸡黄兔 | 玄中 5 | 菜 | `bf_ningshen:2battle` | 1 | 原著明确下酒食物 |
| `it_hengshan_suxianzong` | 笑傲·草菇莲子素馅粽 | 地下 7 | 名菜 | `bf_dingxin,bf_yangsheng:2battle` | 4 | 原著明确素馅；配料终校 **（待考）** |
| `it_hengshan_qingcaidoufu` | 笑傲·恒山持斋青菜豆腐 | 玄中 5 | 菜 | `bf_shouyi:1battle` | 1 | 原著明确食物；场景承接持斋 |
| `it_huiyanlou_huncai` | 笑傲·衡阳回雁楼荤菜 | 黄上 3 | 名菜 | `bf_qingxin:1battle` | 4 | 原著明确牛猪鸡鸭鱼虾 |
| `it_xiakedao_siyang_dianxin` | 侠客·侠客岛四样点心 | 玄下 4 | 名菜 | `bf_jiangu:2battle` | 4 | 原著明确烧卖、春卷、蒸糕等 |
| `it_houjianji_shaobing` | 侠客·侯监集烧饼 | 玄中 5 | 干粮 | `bf_yuhan:2battle` | 1 | 原著明确烧饼 |
| `it_huashan_qingcai_doufufan` | 碧血·乱世青菜豆腐饭 | 黄上 3 | 菜 | `bf_yangsheng:1battle` | 1 | 原著明确食物组合 |
| `it_wenjia_huotui_larouyan` | 碧血·温家火腿腊肉宴 | 地下 7 | 名菜 | `bf_bidu:2battle` | 4 | 原著明确火腿、腊肉、肥鸡、鲜鱼 |
| `it_zhayangwei` | 鹿鼎·韦小宝在京师点菜 | 玄上 6 | 菜 | `bf_yuhan:2battle` | 1 | 原著菜名场景 |
| `it_milian_huotui` | 鹿鼎·款待沐剑屏 | 地中 8 | 名菜 | `bf_huichun,bf_juqi:3battle` | 4 | 原著食材组合；效果原创 |
| `it_yangzhou_tangbao_changyumian` | 鹿鼎·韦小宝说扬州汤包长鱼面 | 地下 7 | 名菜 | `bf_wenzhong,bf_juqi:2battle` | 4 | 原著明确食品名；是否为当席实食 **（待考）** |
| `it_pomiao_shutang` | 连城·破庙毒鼠汤 | 黄下 1 | 汤 | `bf_xuruo:1battle` | 1 | 危险剧情食物；不作增益菜谱 |
| `it_yuzhou_fanshu_caomifan` | 连城·渔舟番薯糙米饭 | 玄下 4 | 干粮 | `bf_yuhan:2battle` | 1 | 原著明确番薯、高粱混饭 |
| `it_naiyou_recha` | 白马·计老人奶油热茶 | 玄下 4 | 汤 | `bf_yuhan:2battle` | 1 | 原著明确饮食 |
| `it_yangrulao` | 白马·计老人乳酪待客 | 玄中 5 | 腌藏 | `bf_wenzhong:2battle` | 1 | 原著明确饮食 |
| `it_xiaofu_shoujiuxi` | 鸳鸯·萧府寿酒席 | 玄中 5 | 名菜 | `bf_juqi:2battle` | 4 | 寿酒、喜酒明确；菜品 **（待考）** |
| `it_huodui_kaozhangji` | 鸳鸯·洞前烤獐麂 | 黄上 3 | 菜 | `bf_wenzhong:1battle` | 1 | 原著明确食物 **（待考）** |
| `it_huibu_zhuafan_kaorou` | 书剑·抓饭烤肉蜜瓜 | 地下 7 | 名菜 | `bf_shichen,bf_yuhan:2battle` | 4 | 原著明确食物组合 |
| `it_xuedi_kaohuangyang` | 书剑·雪地烤黄羊 | 地中 8 | 名菜 | `bf_ruiyi,bf_juqi:3battle` | 4 | 原著明确食物 |
| `it_honghuahui_zongduo_yanxi` | 书剑·红花会总舵群雄宴饮 | 玄上 6 | 名菜 | `bf_juqi:2battle` | 4 | 宴饮场景；具体菜点与配料 **（待考）** |
| `it_chenglingsu_sancai_yitang` | 飞狐·程灵素三菜一汤 | 地中 8 | 名菜 | `bf_bidu,bf_huichun:3battle` | 4 | 原著明确四样菜 |
| `it_miaojia_huofan_sancai` | 飞狐·苗家镬饭三菜 | 黄上 3 | 名菜 | `bf_yangsheng:1battle` | 4 | 原著明确饭菜组合 |
| `it_humiao_mantou_jiyangtui` | 雪山·胡苗馒头鸡羊腿 | 玄中 5 | 名菜 | `bf_yuhan:2battle` | 4 | 原著明确食物组合 |
| `it_dianchi_shurou_shaoji` | 雪山·滇池熟肉烧鸡 | 玄下 4 | 名菜 | `bf_wenzhong:2battle` | 4 | 原著明确熟肉、烧鸡、馒头 |

**AR-23 史实名菜**：以下 12 道不绑定某部小说，按史料年代与地域进入酒楼、宴席或菜谱节点；史料说明与链接见 `catalog/items-food.md`“史实与出处依据”。

| ID | 史料 | 品阶 | 类 | `meal` | 供餐 |
|---|---|---:|---|---|---:|
| `it_xieniangcheng` | 宋《山家清供》蟹酿橙 | 地下 7 | 名菜 | `bf_qingxin,bf_ningshen:2battle` | 4 |
| `it_shanhaidou` | 宋《山家清供》笋蕨鱼虾蒸兜 | 地下 7 | 名菜 | `bf_dongxi,bf_yangsheng:2battle` | 4 |
| `it_dongporou` | 清《调鼎集》载做法；宋代定型 **（待考）** | 地中 8 | 名菜 | `bf_jiangu,bf_wenzhong:2battle` | 4 |
| `it_shanyaozhou` | 元《饮膳正要》 | 玄中 5 | 汤 | `bf_yangsheng:2battle` | 1 |
| `it_heliandouzi` | 元《饮膳正要》 | 地中 8 | 名菜 | `bf_juqi,bf_huichun:2battle` | 4 |
| `it_tuanyutang` | 元《饮膳正要》团鱼汤 | 地下 7 | 汤 | `bf_yuhan,bf_jiangu:2battle` | 1 |
| `it_shanjia_sancui` | 宋《山家清供》山家三脆 | 玄上 6 | 菜 | `bf_qingxin:2battle` | 1 |
| `it_lubeiji` | 宋元《吴氏中馈录》炉焙鸡 | 地下 7 | 菜 | `bf_jiangu:2battle` | 1 |
| `it_wangtaishou_babaodoufu` | 清《随园食单》王太守八宝豆腐 | 地中 8 | 名菜 | `bf_huixin,bf_ningshen:2battle` | 4 |
| `it_jiangshilang_doufu` | 清《随园食单》蒋侍郎豆腐；配料 **（待考）** | 地下 7 | 名菜 | `bf_qingxin,bf_dingxin:2battle` | 4 |
| `it_shaoxiaozhu` | 清《随园食单》《调鼎集》 | 地上 9 | 名菜 | `bf_shichen,bf_jiangu:3battle` | 4 |
| `it_yanwojisitang` | 清《扬州画舫录》满汉席菜单 | 天下 10 | 名菜 | `bf_huichun,bf_huinei:3battle` | 4 |

- **以杯配酒**：背包中持有“祖千秋酒杯组”（收藏品 §11.5）时，饮对应之酒：汾酒配玉杯、葡萄酒配夜光杯、状元红配古瓷杯；醉意数值 ×1.5，且醉倒阈值从 3 层升为 4 层。杯酒配对取意《笑傲江湖》祖千秋论酒，数值与阈值为**（原创扩展）**。
- 酒在战斗中饮用占物品行动；持洪七公酒葫芦（§5.4）可作附加动作。

#### 9.3.1 家常饭正式物品（经脉落地终审返修）

家常饭是 §9.4 与 `design/12` §10.4 已定的烹饪失败产物，正式 ID 为 `it_jiachangfan`；`chapters/02` §10.3.2 的 `outputFallback:householdMeal` 唯一映射到此 ID，语义键不另作物品 ID。以下玩法与文案为**（原创扩展）**。

| 字段 / 接口 | 定义 |
|---|---|
| `id` / `name` | `it_jiachangfan` / 家常饭 |
| `kind` / `sub` / `grade` | `dish` / `dish` / `1`（黄下；失败成品不继承原菜谱或食材品阶） |
| `stack` / `chapters` / `origin` | `20` / `any` / `expanded`；堆叠沿 §2.1，通用失败产物覆盖所有允许烹饪的书界【建议值】 |
| `price` / `flags` | `auto` / `[]`【建议值】；菜肴 g1 基础估值按 §13.1–13.2 为 `50×2.2^(1−1)=50` 文，实际卖价见 §13.3；不因此新增商店供货 |
| `use` | `context:field`、`action:eat`、`target:self`；耗时沿 §9.1 的 0.5 时辰；每次消耗 1 份、供 1 人【建议值】 |
| `use.effects` | 仅执行 §8.2 黄下模板 `staPct`：回复 `staMax×10%×G(1)`，不回复气血／内力，不授予经验或永久增益 |
| 膳食例外 | 本品无 `meal` / `applyBuff` 效果，不占用或替换既有膳食位，不附开场或持续增益【建议值】 |
| 失败发放 | 通过材料／场所等前置检查、实际执行烹饪且判定失败后，每批入包 1 份【建议值】，食材不返还；前置拒绝、取消不发放；入包满格沿 §12.1 待拾队列 |
| `assets` / `text` | `{icon:item/jiachangfan}`；`desc:"火候欠佳的一份饭食，只能补些体力。"`【建议值】；图标资产由素材任务接入 |
| 书眠 | 按基准 §3 与本文 §12.3 清除实物；不属于装备携带或传承匣例外 |

按基准 §4，`G(1)=1.00`；实际回复依 03 §0.3 向下取整并封顶：`Δsta=min(staMax−sta, floor(staMax×0.10×1.00))`。例：`staMax=147,sta=100` 时回复 `floor(14.7)=14`，结算为 114；`sta=142` 时只回 5 至 147。该即时回复不乘膳食 `mealScale=0.5`。具体默认登记于 D-20；章节只需同步引用，不再承担本实体定义。

### 9.4 烹饪（接口）

| 项 | 规则 |
|---|---|
| 归属 | 烹饪属生活技能，熟练度、成长与名厨 NPC 归 `design/12` §10.4；不新增全局 `cook`，也不读取仅用于炼丹的 `alchemy` |
| 菜谱 | 学识 `rc_<拼音>`（得自菜谱卷 `it_fang_*`、名厨、黄蓉羁绊）；跨书界保留 |
| 菜谱熟练 | 只读 `design/12` §10.4 的 `recipeMastery[rc_*]∈[0,10]`；未学 / 无记录按 0 且不可烹饪，初学菜谱写入 1 |
| 场所 | 厨房（客栈、自宅、营地篝火——营地只能做 ≤ 玄阶） |
| 成品品阶 | 调用 `design/12` §10.4 的烹饪结算；例：熟练 6、主材 6 品、配方上限 9，结算返回 `gCook=7` |
| 成功率 | 调用 `design/12` §10.4 的烹饪结算；上例返回 `Pcook=0.92`（`T(7)=52`） |
| 失败 | "火候不到"：`householdMeal → it_jiachangfan`（§9.3.1，黄下，仅回体力）；每批 1 份【建议值】，食材不返还 |
| 购买 | 酒楼出售菜肴，品阶受书界供货上限（§13.4） |
| 代厨 | 名厨 NPC（射雕/神雕黄蓉、鹿鼎御膳房等）以好感或银两代做名菜（12） |

---

## 10. 秘籍与残页

### 10.1 秘籍物品

AR-20 名录 `catalog/items-manuals.md` 只投影本文已登记的 `it_miji_*`，不创建同武学的美术别名。每行必须写 `manual.skill` 所属武学品阶；全本／残本／抄本仍按下表读取，残页继续只归 §10.3。若名录缺一档，优先复用 §10.1.1–§10.1.3 的现有实体；只有技能图鉴已经声明 `manual it_miji_*` 且本文确有实体缺口时，才在 §14.2 注册补录，不能从武学名称批量臆造秘籍。

| 变体 `variant` | ID | `maxLayer` | 可交易 | 说明 |
|---|---|---|---|---|
| 全本 `full` | `it_miji_<武功拼音>` | 10 | 黄、玄可卖 | 标准学习途径（05 §7.1 `manual`） |
| 残本 `partial` | `it_miji_<武功拼音>_can` | 条目定（如倚天丐帮降龙残本 6，05 §13.1） | 同上 | 学至上限后须另寻途径 |
| 抄本 `copy` | 同全本 ID，`variant: copy` | 同来源 | 可赠、可卖 | 残页集齐自动拼合（§10.3） |
| 注本 `annotated` | 同全本 ID，`variant: annotated` | 10 | 否 | 高人批注（原创扩展）：阅读天数 ×0.8，该武学 `bonusMult +10%`（05 §8.1） |
| 原本 `original` | 同全本 ID，`variant: original` | 10 | 否 | 可作 02 §2.2 印证载体（"读到本书界秘籍原本"） |

- 秘籍品阶 = 武学绝对品阶；**天级秘籍只来自固定节点**（02 R1）；门派秘籍多为"借阅"（藏经阁等），须按期归还（12）。
- 读完后秘籍不消失：可赠队友学习（队友武学规则归 12/13）、可出售（黄/玄阶）、可留作收藏。
- 秘籍是普通物品，不跨书界；学到的武学按 02 的携带/残篇规则延续。

#### 10.1.1 按书补录武学的共享载体（经脉落地终审）

> “衙门武册”“华辉遗谱”“宝树旧稿”是叙事中的共享实体来源，不改变 `manual.skill` 只能指向一门武学的 schema。内容层将每门可学武学序列化为一条标准 `ItemDef`；同一取得事务同时发放该组全部条目。7 条均为 **（原创扩展）**，公共字段为 `kind:manual`、`origin:expanded`、`stack:1`、`readMul:1`、`price:null`、`flags:[unique]`；每条的 `sub` 与表中 `variant` 取同一值。`chapters` 分别为衙门组 `[ch09_liancheng]`、华辉组 `[ch10_baima]`、宝树组 `[ch14_xueshan]`。每条 `assets.icon` 按 `item/<去掉 it_ 前缀的 ID>` 生成，`text.short` 取表中名称，`text.desc` 取表中获取与安全条件。它们不可由商店、普通掉落或击败具名人物直接产出，也不跨书眠。武学门槛仍由对应图鉴校验，持有秘籍不等于立即学会。

| 叙事载体 / 取得事务 | ItemDef | `skill` | 品阶 | `variant` / `maxLayer` | 获取与安全条件 |
|---|---|---|---:|---|---|
| 衙门武册（同一次发放 2 条） | `it_miji_jingzhouguanfuqinfa` 荆州官府擒法·衙门武册 | `sk_jingzhouguanfuqinfa` | 5 | `full` / 10 | 会审后由留任教头移交，或按章节合法缴获；不得由凌退思尸体掉落。官府关系 / 身份只影响教头传授，武册路线仍校验本卡属性与擒拿资质 |
| 同上 | `it_miji_jingzhouyangqigong` 荆州养气功·衙门武册 | `sk_jingzhouyangqigong` | 5 | `full` / 10 | 与上一条原子同发；另须 `sk_jingzhouguanfuqinfa` 4 重，不因取得武册豁免前置 |
| 华辉遗谱（同一次发放 3 条） | `it_miji_huahuixinfa` 华辉心法·遗谱 | `sk_huahuixinfa` | 9 | `partial` / 8 | 完成旧案问证，确认练习谱未淬毒、双方安全隔离，并由李文秀辨认；不从瓦耳拉齐或马家骏尸体掉落 |
| 同上 | `it_miji_walalizhi` 瓦耳拉齐指·遗谱 | `sk_walalizhi` | 9 | `partial` / 8 | 与上一条原子同发；名称沿补录图鉴当前裁定，武学并非人物独占 |
| 同上 | `it_miji_majiajunfeizhen` 马家骏飞针·遗谱 | `sk_majiajunfeizhen` | 9 | `partial` / 8 | 与上一条原子同发；取得前必须完成练习针谱的无毒确认 |
| 宝树旧稿（同一次发放 2 条） | `it_miji_cangfengxingqi` 藏锋行气·宝树旧稿 | `sk_cangfengxingqi` | 7 | `partial` / 8 | 完成当面对质 / 交换并保全旧稿，或在处置线由任务结算发放；不得按击杀掉落 |
| 同上 | `it_miji_cuomaifanzhang` 错脉翻掌·宝树旧稿 | `sk_cuomaifanzhang` | 7 | `partial` / 8 | 与上一条原子同发；两条只开放个人医毒散承学习，不授药王门身份 |

**成组事务**：每组执行“检查任务资格与组内二 / 三 / 二条是否均未持有 → 一次写入整组物品 → 记录共享载体已领取”。任一写入失败则整组回滚；重复领取不补发、不转钱。组内每条有独立阅读进度，可分别交给不同角色阅读，但转移不改变 `maxLayer`、前置或身份规则。章节 / 任务只引用上述 ID 并决定取得时点，不再创建一个带 `skills[]` 的复合秘籍。

#### 10.1.2 康熙册谱本与残页正式登记（经脉落地终审）

以下三项的载体与路径均为**（原创扩展）**。共同字段为 `origin:expanded`、`price:null`、`readMul:1`（仅秘籍）、`flags:[unique]`；不进入随机掉落或通用商店，不可售出、拆分交易或重复领取，不跨书眠。两条秘籍均为 `kind:manual/sub:partial/variant:partial/stack:1`；残页为 `kind:page`，同武学各页合并一格并按页号去重。素材键沿 §2.3，名称和来源说明沿下表。获得物品仍须检查图鉴前置、门派／人物条件和天级取得账本。

| 正式 ID / 名称 | 来源载体 | `skill` / 品阶 | 上限与取得边界 |
|---|---|---|---|
| `it_miji_ningxue_can` 凝血神爪遗谱 | 陈近南遗谱 | `sk_ningxue` / 10；`chapters:[ch08_luding]` | `maxLayer:8`；仅图鉴声明的陈近南改命遗谱路径；具体节点由 `chapters/08` 登记，登记并迁移前不生成实例；与亲授共用鹿鼎天级获取账本，非尸体随机掉落 |
| `it_miji_shenzhao_can` 神照经狱墙拓录 | 狱墙拓录 | `sk_shenzhao` / 10；`chapters:[ch09_liancheng]` | `maxLayer:6`；狱墙逐段拓录、核对笔迹，出狱整理后一次取得；不包含唐诗密码，不复制丁典口传全本 |
| `it_canye_xuedaojing` 血刀经残页 | 原 ID 原地转正 | `sk_xuedaojing` / 9；`chapters:[ch09_liancheng]` | `pagesTotal:6`；雪上戒刀、战场清点、门内档案三个既定节点合计只投页号 `{1,2,3,4}`，默认依次 `1/1/2` 页 |

血刀路径的最高层数由通用式推出：`ceil(10×4/6)=7`；单页依次对应 `2/4/5/7` 重。第 5／6 页不进入本路径，重复清点不给新页、经验或银两；不得把 `pagesTotal` 改成 4（那会错误升到 10 重），也不新增 `page.maxLayer` 绕过 §10.3。全本 10 重仍需图鉴已登记的血刀老祖／合法门派传授。图鉴 `learnSources` 与章节奖励引用新 ID 后才视为运行内容闭合。

迁移旧 ID：`it_ningxue_miji` → `it_miji_ningxue_can`；`it_shenzhao_yuwen` → `it_miji_shenzhao_can`。旧 ID 只作迁移输入，不得同时注册第二份可取得物品；`it_canye_xuedaojing` 原地转正。

#### 10.1.3 少林、五绝与逍遥旧候选正式登记（经脉落地终审返修）

下列 25 本复用各册已有 ID，逐条绑定现行获取卡；物品载体及游戏化投放均按**（原创扩展）**登记，不把卡中的武学原著出处扩大为秘籍实物考据。共同字段：`kind:manual`、`origin:expanded`、`stack:1`、`readMul:1`、`flags:[]`；`sub=variant`，`assets.icon=item/<去掉 it_ 前缀的 ID>`，`text.short=name`、`text.desc=表中来源边界`。地／天阶 `price:null`；黄／玄阶 `price:auto` 按 §13.1 秘籍锚点估价，只允许既有规则中的转赠／出售，不据此增设商店或随机产出。全部不跨书眠，且保留来源卡的门派、前置与 `reqsOverride`；书界有效层数上限与物品 `maxLayer` 分别结算（05 §7.2）。

| 少林册 ID / `name` | `skill` / `grade` | `variant` / `maxLayer` | `chapters` / 来源边界 |
|---|---|---|---|
| `it_miji_tiebushan` 铁布衫秘籍 | `sk_tiebushan` / 7 | `full` / 10 | `[ch08_luding]`；鹿鼎全本；不增加倚天可学来源 |
| `it_miji_jinzhongzhao` 金钟罩秘籍 | `sk_jinzhongzhao` / 8 | `full` / 10 | `[ch05_xiaoao]`；笑傲全本；该来源前置改为 `sk_tongrenhenglian` 7 重，倚天排除 |
| `it_miji_xisuijing` 洗髓经藏本 | `sk_xisuijing` / 9 | `partial` / 8 | `[ch08_luding]`；藏经阁／韦小宝线借阅；不把借阅转换为无条件持有或完整传授 |
| `it_miji_dajingangzhang` 大金刚掌秘籍 | `sk_dajingangzhang` / 7 | `full` / 10 | `[ch06_xiake]`；侠客全本 |
| `it_miji_yizhichan` 一指禅残本 | `sk_yizhichan` / 8 | `partial` / 8 | `[ch06_xiake]`；侠客残本；不继承其他书界师授的 10 重上限 |
| `it_miji_ruyingsuixingtui` 如影随形腿残本 | `sk_ruyingsuixingtui` / 7 | `partial` / 8 | `[ch06_xiake]`；侠客残本；该来源前置改为 `sk_tantui` 7 重 |

| 五绝册 ID / `name` | `skill` / `grade` | `variant` / `maxLayer` | `chapters` / 来源边界 |
|---|---|---|---|
| `it_miji_xianglong18_can` 降龙十八掌残本 | `sk_xianglong18` / 12 | `partial` / 6 | `[ch04_yitian]`；倚天丐帮残承，沿 05 §13.1；书眠／现影不补全 |
| `it_miji_dagou_can` 打狗棒法残本 | `sk_dagou` / 11 | `partial` / 6 | `[ch04_yitian]`；倚天残谱；10 重须另走图鉴的寻谱补诀固定节点 |
| `it_miji_tiebogong_can` 铁钵功残本 | `sk_tiebogong` / 7 | `partial` / 7 | `[ch07_bixue]`；碧血残本；倚天掌钵龙头见闻不产可学物品 |
| `it_miji_suohouqinnashou` 锁喉擒拿手遗谱 | `sk_suohouqinnashou` / 6 | `full` / 10【建议值】 | `[ch01_tianlong]`；马大元遗物；仍须丐帮五袋门槛，非任意击杀掉落 |
| `it_miji_shexinshu` 摄心术遗谱 | `sk_shexinshu` / 6 | `full` / 10【建议值】 | `[ch03_shendiao]`；彭长老遗谱；“摄心术”为图鉴待考暂名，不扩大原著断言 |
| `it_miji_canfengyinlugong` 餐风饮露功秘籍 | `sk_canfengyinlugong` / 4 | `full` / 10【建议值】 | `[ch07_bixue,ch08_luding]`；丐帮二袋来源；保留图鉴对对应书界分舵实际设置的限制 |
| `it_miji_xuanfengsaoyetui` 旋风扫叶腿修习谱 | `sk_xuanfengsaoyetui` / 6 | `full` / 10 | `[ch02_shediao]`；归云庄事件后黄药师所赠谱；具体可取得事务由章节绑定 |
| `it_miji_taohuayaoli` 桃花药理秘籍 | `sk_taohuayaoli` / 4 | `full` / 10【建议值】 | `[ch02_shediao,ch03_shendiao]`【建议值】；仅桃花岛药圃藏本；沿本卡两个原生书界，节点未登记的书界不生成实例 |
| `it_miji_shentuoxueshanzhang` 神驼雪山掌遗谱 | `sk_shentuoxueshanzhang` / 6 | `partial` / 8 | `[ch03_shendiao]`；白驼山庄遗谱 |
| `it_miji_baituodujing` 白驼毒经残本 | `sk_baituodujing` / 5 | `partial` / 8 | `[ch03_shendiao]`；白驼毒经秘籍来源；保留门派硬门槛 |
| `it_miji_jiuyinbaigu_su` 九阴白骨爪速成篇 | `sk_jiuyinbaigu` / 9 | `full` / 10 | `[ch04_yitian]`；倚天剑藏经速成篇、周芷若线；仍适用 P20 保全神兵的等价取经路线 |
| `it_miji_baimangbianfa_su` 白蟒鞭法速成篇 | `sk_baimangbianfa` / 7 | `partial` / 8 | `[ch04_yitian]`；藏经速成篇；保持图鉴的原创扩展推定，仍适用 P20 |
| `it_miji_tongshihenglian` 铜尸横练遗谱 | `sk_tongshihenglian` / 6 | `full` / 10 | `[ch02_shediao]`；黑风双煞遗物，不增设跨年代固定来源 |
| `it_miji_tiezhangxinfa` 铁掌心法残本 | `sk_tiezhangxinfa` / 5 | `partial` / 8 | `[ch03_shendiao]`；神雕遗谱来源；保留铁掌帮身份与黑砂掌前置 |
| `it_miji_lihuaqiang` 梨花枪残本 | `sk_lihuaqiang` / 7 | `partial` / 8 | `[ch03_shendiao]`；神雕残本，射雕／碧血师授上限不写入本物品 |
| `it_miji_yangjiaqiangfa` 杨家枪法遗谱 | `sk_yangjiaqiangfa` / 6 | `full` / 10 | `[ch03_shendiao]`；杨铁心遗谱，沿本卡来源前置 |

| 逍遥册 ID / `name` | `skill` / `grade` | `variant` / `maxLayer` | `chapters` / 来源边界 |
|---|---|---|---|
| `it_miji_baihongzhang` 白虹掌力藏本 | `sk_baihongzhang` / 9 | `partial` / 7 | `[ch01_tianlong]`；曼陀山庄琅嬛玉洞藏本，保留门派门槛 |
| `it_miji_canhezhi` 参合指藏本 | `sk_canhezhi` / 8 | `partial` / 7 | `[ch01_tianlong]`；还施水阁偷阅来源，不转化为慕容复亲授 10 重 |
| `it_miji_douzhuan` 斗转星移藏本 | `sk_douzhuan` / 10 | `partial` / 6 | `[ch01_tianlong]`；还施水阁固定偷阅来源；事发仍按原卡慕容家好感 −30，计入天级取得账本 |

四个未明写来源层数的旧 `manual`（锁喉擒拿手、摄心术、餐风饮露功、桃花药理）按 05 §7.1／本文 §10.1 的全本默认值暂登记 `full/10`，标为【建议值】供对应图鉴显式回填；不据此推翻已有低于 10 的来源。桃花药理的书界列表是本卡原生书界与药圃来源的默认交集，具体投放仍由章节绑定。以上缺省值待确认事项登记于 O16；其余 21 本的品阶、来源上限直接来自现行卡面。

### 10.2 阅读规则

| 项 | 规则 |
|---|---|
| 天数 | 05 §7.4 的基准天数 `baseDays=ceil(2 × GF(g) × 100 / (wis + 30))`；最终 `ceil(baseDays × readMul)`（`readMul`：注本 0.8、艰深 1.3，条目指定） |
| 悟性 | 同时影响天数（上式）与软门槛（05 §7.3：`wis` 常为地/天阶门槛，不足时修炼 ×0.7 并有走火风险） |
| 场所 | 安全点（客栈、门派居所、寺观、自宅、营地）；每读 1 天推进 1 游戏日 |
| 中断 | 可随时中断，进度存于物品实例 `readDays`；进度不在角色间共享 |
| 结果 | 读满：习得第 1 重，`sourceCap = maxLayer`（05 §7.2）；已习得者再读只提升 `sourceCap`，不给经验 |
| 识字（钩子） | 主角现代身份若带 `readsClassical`（03 §2.7 `OriginBonus.flags`），天数 ×0.9；否则书灵协助，不加罚（身份目录归 design/01） |

例：悟性 50 读地上秘籍：`ceil(2 × 3.8 × 100 / 80) = ceil(9.5) = 10` 天；同一本注本 `ceil(10 × 0.8) = 8` 天。

### 10.3 残页与拼合

| 项 | 规则 |
|---|---|
| 页数 | `pagesTotal = k`：黄 3、玄 4、地 6、天 8（天阶仅特例，05 §7.5） |
| 背包 | 同一武学的残页合为 1 格"残卷"，显示已集页号 |
| 学习 | 第 1 页即可习得；`sourceCap = ceil(10 × 已集页数 / k)`（05 §7.5） |
| 掉率 | 普通敌人 `0.5% + 0.02% × W`（02 §2.10），精英 ×2、Boss ×4；从掉落者门派/流派武学池抽武学，页号 70% 取"尚缺页"、30% 完全随机 |
| 重复页 | 已习得：转为该武学 `sxp` + 10% × `ExpToNext`（05 §7.5）；未习得：可出售 |
| 拼合 | 集齐 k 页 → 自动生成抄本秘籍（`variant: copy`），可赠队友 |
| 天级 | 随机池不产出天级残页（02 R1）；天级残卷只在固定节点（如九阴真经上下卷） |
| 书眠 | 残页（物品）不跨书界；已习得武学的 `pages` 记录随其 `SkillState` 保留（05 §2.6） |

**跨年代传承例外（AR-13 接口）**：`design/20` 把每个传承源的上/中/下残本标为 `legacyCarry`，并指定一件 `keyToken`；只有这两类被 20 明列的物品跨书眠保留。每卷仍是本文 `manual/partial`，可单独按其配置的降阶 `maxLayer` 修炼；集齐、信物消费、人物/门派消隐、概率、保底与合成条件全部由 20 决定，本文只执行原子物品事务“校验所需实例 → 消耗 `keyToken` → 移除三卷 → 生成全本”。普通随机残页、现有残本和任务信物不得借该接口跨界。

#### 10.3.1 跨年代传承残本最小目录（117 卷）

> 下表逐项定义 `ItemDef` 的 ID、名称与品阶，并用来源 / 卷位外键闭合 `design/20` §9 的 39 × 3 目录；来源资格、投放书界、目标武学与校合语义仍只见 `design/20`。各卷统一为 `kind=manual`、`variant=partial`、`maxLayer=4`、`stack=1`、`price=null`、`flags=[unique, legacyCarry]`，存入传承匣且不可交易、丢弃、赠予或藏史；`unique` 表示同一周目同一卷位最多持有一个物品实例，重复发现按 20 §1.5 转为校勘心得。三卷展示名均为**（原创扩展命名）**；品阶由 20 §1.5 的 `fragmentGrade(g)` 推出。

| ID | 名称 | 品阶 | 所属传承源 | 卷位 | 唯一物 |
|---|---|---:|---|---|:---:|
| `frag_yuenv_jianying` | 剑影卷 | 7 | `lgs_yuenv_aqing` | `upper` | ✅ |
| `frag_yuenv_yuanbu` | 猿步卷 | 7 | `lgs_yuenv_aqing` | `middle` | ✅ |
| `frag_yuenv_wuhen` | 无痕卷 | 7 | `lgs_yuenv_aqing` | `lower` | ✅ |
| `frag_yijin_jingluo` | 经络卷 | 9 | `lgs_shaolin_yijin` | `upper` | ✅ |
| `frag_yijin_xisui` | 洗髓卷 | 9 | `lgs_shaolin_yijin` | `middle` | ✅ |
| `frag_yijin_huangu` | 换骨卷 | 9 | `lgs_shaolin_yijin` | `lower` | ✅ |
| `frag_liumai_zhimai` | 指脉卷 | 9 | `lgs_dali_liumai` | `upper` | ✅ |
| `frag_liumai_jianqi` | 剑气卷 | 9 | `lgs_dali_liumai` | `middle` | ✅ |
| `frag_liumai_zongtu` | 总图卷 | 9 | `lgs_dali_liumai` | `lower` | ✅ |
| `frag_beiming_nahai` | 纳海卷 | 9 | `lgs_xiaoyao_beiming` | `upper` | ✅ |
| `frag_beiming_sanmai` | 散脉卷 | 9 | `lgs_xiaoyao_beiming` | `middle` | ✅ |
| `frag_beiming_guiyuan` | 归元卷 | 9 | `lgs_xiaoyao_beiming` | `lower` | ✅ |
| `frag_xiaowuxiang_wuxiang` | 无相卷 | 8 | `lgs_xiaoyao_xiaowuxiang` | `upper` | ✅ |
| `frag_xiaowuxiang_huasheng` | 化生卷 | 8 | `lgs_xiaoyao_xiaowuxiang` | `middle` | ✅ |
| `frag_xiaowuxiang_yinni` | 隐迹卷 | 8 | `lgs_xiaoyao_xiaowuxiang` | `lower` | ✅ |
| `frag_lingbo_guabu` | 卦步卷 | 8 | `lgs_xiaoyao_lingbo` | `upper` | ✅ |
| `frag_lingbo_feifu` | 飞凫卷 | 8 | `lgs_xiaoyao_lingbo` | `middle` | ✅ |
| `frag_lingbo_luowa` | 罗袜卷 | 8 | `lgs_xiaoyao_lingbo` | `lower` | ✅ |
| `frag_douzhuan_jieli` | 借力卷 | 7 | `lgs_murong_douzhuan` | `upper` | ✅ |
| `frag_douzhuan_yixing` | 移星卷 | 7 | `lgs_murong_douzhuan` | `middle` | ✅ |
| `frag_douzhuan_huanshi` | 还施卷 | 7 | `lgs_murong_douzhuan` | `lower` | ✅ |
| `frag_xianglong_gang` | 刚健卷 | 9 | `lgs_gaibang_xianglong` | `upper` | ✅ |
| `frag_xianglong_bian` | 变易卷 | 9 | `lgs_gaibang_xianglong` | `middle` | ✅ |
| `frag_xianglong_shibazhang` | 十八掌次第卷 | 9 | `lgs_gaibang_xianglong` | `lower` | ✅ |
| `frag_dagou_bazijue` | 八字诀卷 | 8 | `lgs_gaibang_dagou` | `upper` | ✅ |
| `frag_dagou_banglu` | 棒路卷 | 8 | `lgs_gaibang_dagou` | `middle` | ✅ |
| `frag_dagou_koujue` | 口诀卷 | 8 | `lgs_gaibang_dagou` | `lower` | ✅ |
| `frag_jiuyin_zonggang` | 总纲卷 | 9 | `lgs_huangshang_jiuyin` | `upper` | ✅ |
| `frag_jiuyin_lianqi` | 炼气卷 | 9 | `lgs_huangshang_jiuyin` | `middle` | ✅ |
| `frag_jiuyin_yongfa` | 用法卷 | 9 | `lgs_huangshang_jiuyin` | `lower` | ✅ |
| `frag_yiyang_dianxue` | 点穴卷 | 8 | `lgs_dali_yiyang` | `upper` | ✅ |
| `frag_yiyang_liaoshang` | 疗伤卷 | 8 | `lgs_dali_yiyang` | `middle` | ✅ |
| `frag_yiyang_yunjin` | 运劲卷 | 8 | `lgs_dali_yiyang` | `lower` | ✅ |
| `frag_bihai_yinlv` | 音律卷 | 7 | `lgs_taohua_bihai` | `upper` | ✅ |
| `frag_bihai_chaosheng` | 潮生卷 | 7 | `lgs_taohua_bihai` | `middle` | ✅ |
| `frag_bihai_shexin` | 摄心卷 | 7 | `lgs_taohua_bihai` | `lower` | ✅ |
| `frag_xuantie_zhongjian` | 重剑卷 | 8 | `lgs_dugu_xuantie` | `upper` | ✅ |
| `frag_xuantie_haichao` | 海潮卷 | 8 | `lgs_dugu_xuantie` | `middle` | ✅ |
| `frag_xuantie_wufeng` | 无锋卷 | 8 | `lgs_dugu_xuantie` | `lower` | ✅ |
| `frag_yunv_shierduo` | 十二多卷**（原创扩展命名；对应待考）** | 7 | `lgs_gumu_yunv` | `upper` | ✅ |
| `frag_yunv_shiershao` | 十二少卷**（原创扩展命名；对应待考）** | 7 | `lgs_gumu_yunv` | `middle` | ✅ |
| `frag_yunv_suxin` | 素心卷**（原创扩展命名；对应待考）** | 7 | `lgs_gumu_yunv` | `lower` | ✅ |
| `frag_taijiquan_song` | 松沉卷 | 8 | `lgs_taiji_quan` | `upper` | ✅ |
| `frag_taijiquan_huajin` | 化劲卷 | 8 | `lgs_taiji_quan` | `middle` | ✅ |
| `frag_taijiquan_guiyuan` | 归圆卷 | 8 | `lgs_taiji_quan` | `lower` | ✅ |
| `frag_taijijian_yuan` | 圆转卷 | 8 | `lgs_taiji_jian` | `upper` | ✅ |
| `frag_taijijian_nian` | 黏随卷 | 8 | `lgs_taiji_jian` | `middle` | ✅ |
| `frag_taijijian_wang` | 忘招卷 | 8 | `lgs_taiji_jian` | `lower` | ✅ |
| `frag_jiuyang_yangmai` | 阳脉卷 | 9 | `lgs_jiuyang_zhenjing` | `upper` | ✅ |
| `frag_jiuyang_huti` | 护体卷 | 9 | `lgs_jiuyang_zhenjing` | `middle` | ✅ |
| `frag_jiuyang_yuanyuan` | 源流卷 | 9 | `lgs_jiuyang_zhenjing` | `lower` | ✅ |
| `frag_qiankun_yinqian` | 引潜卷 | 8 | `lgs_mingjiao_qiankun` | `upper` | ✅ |
| `frag_qiankun_nuoyi` | 挪移卷 | 8 | `lgs_mingjiao_qiankun` | `middle` | ✅ |
| `frag_qiankun_qiceng` | 七层卷 | 8 | `lgs_mingjiao_qiankun` | `lower` | ✅ |
| `frag_dugu_zongjue` | 总诀卷 | 9 | `lgs_dugu_jiujian` | `upper` | ✅ |
| `frag_dugu_pobing` | 破兵卷 | 9 | `lgs_dugu_jiujian` | `middle` | ✅ |
| `frag_dugu_poqi` | 破气卷 | 9 | `lgs_dugu_jiujian` | `lower` | ✅ |
| `frag_xixing_najin` | 纳劲卷 | 8 | `lgs_riyue_xixing` | `upper` | ✅ |
| `frag_xixing_sangong` | 散功卷 | 8 | `lgs_riyue_xixing` | `middle` | ✅ |
| `frag_xixing_guiqi` | 归气卷 | 8 | `lgs_riyue_xixing` | `lower` | ✅ |
| `frag_kuihua_xingqi` | 行气卷 | 8 | `lgs_kuihua_baodian` | `upper` | ✅ |
| `frag_kuihua_xunji` | 迅疾卷 | 8 | `lgs_kuihua_baodian` | `middle` | ✅ |
| `frag_kuihua_zhenfa` | 针法卷 | 8 | `lgs_kuihua_baodian` | `lower` | ✅ |
| `frag_bixie_xunjian` | 迅剑卷 | 7 | `lgs_fuwei_bixie` | `upper` | ✅ |
| `frag_bixie_shenfa` | 身法卷 | 7 | `lgs_fuwei_bixie` | `middle` | ✅ |
| `frag_bixie_xinfa` | 心法卷 | 7 | `lgs_fuwei_bixie` | `lower` | ✅ |
| `frag_taixuan_tu` | 图形卷 | 9 | `lgs_xiakedao_taixuan` | `upper` | ✅ |
| `frag_taixuan_xue` | 穴位卷 | 9 | `lgs_xiakedao_taixuan` | `middle` | ✅ |
| `frag_taixuan_zongbi` | 总壁卷 | 9 | `lgs_xiakedao_taixuan` | `lower` | ✅ |
| `frag_luohan_renmai` | 任脉卷 | 7 | `lgs_luohan_niren` | `upper` | ✅ |
| `frag_luohan_dumai` | 督脉卷 | 7 | `lgs_luohan_niren` | `middle` | ✅ |
| `frag_luohan_hemai` | 合脉卷 | 7 | `lgs_luohan_niren` | `lower` | ✅ |
| `frag_taxue_lingxue` | 凌雪卷 | 2 | `lgs_xueshan_taxue` | `upper` | ✅ |
| `frag_taxue_wuhen` | 无痕卷 | 2 | `lgs_xueshan_taxue` | `middle` | ✅ |
| `frag_taxue_lingxiao` | 凌霄卷 | 2 | `lgs_xueshan_taxue` | `lower` | ✅ |
| `frag_jinshe_youshen` | 游身卷 | 7 | `lgs_jinshe_miji` | `upper` | ✅ |
| `frag_jinshe_tuxin` | 吐信卷 | 7 | `lgs_jinshe_miji` | `middle` | ✅ |
| `frag_jinshe_guiwan` | 诡腕卷 | 7 | `lgs_jinshe_miji` | `lower` | ✅ |
| `frag_shenxing_bianbu` | 变步卷 | 7 | `lgs_tiejian_shenxing` | `upper` | ✅ |
| `frag_shenxing_yufeng` | 御风卷 | 7 | `lgs_tiejian_shenxing` | `middle` | ✅ |
| `frag_shenxing_baibian` | 百变卷 | 7 | `lgs_tiejian_shenxing` | `lower` | ✅ |
| `frag_hunyuan_yangqi` | 养气卷 | 3 | `lgs_huashan_hunyuan` | `upper` | ✅ |
| `frag_hunyuan_zhangjin` | 掌劲卷 | 3 | `lgs_huashan_hunyuan` | `middle` | ✅ |
| `frag_hunyuan_heyi` | 内外合卷 | 3 | `lgs_huashan_hunyuan` | `lower` | ✅ |
| `frag_ningxue_tanmai` | 探脉卷 | 7 | `lgs_tiandihui_ningxue` | `upper` | ✅ |
| `frag_ningxue_fengmen` | 封门卷 | 7 | `lgs_tiandihui_ningxue` | `middle` | ✅ |
| `frag_ningxue_ningzhi` | 凝滞卷 | 7 | `lgs_tiandihui_ningxue` | `lower` | ✅ |
| `frag_shenlong_tuxi` | 吐息卷 | 3 | `lgs_shenlong_xinfa` | `upper` | ✅ |
| `frag_shenlong_bidu` | 辟毒卷 | 3 | `lgs_shenlong_xinfa` | `middle` | ✅ |
| `frag_shenlong_huti` | 护体卷 | 3 | `lgs_shenlong_xinfa` | `lower` | ✅ |
| `frag_shenzhao_shouxi` | 守息卷 | 7 | `lgs_shenzhao_jing` | `upper` | ✅ |
| `frag_shenzhao_xumai` | 续脉卷 | 7 | `lgs_shenzhao_jing` | `middle` | ✅ |
| `frag_shenzhao_huming` | 护命卷 | 7 | `lgs_shenzhao_jing` | `lower` | ✅ |
| `frag_xuedao_xuexi` | 血息卷 | 3 | `lgs_xuedao_jing` | `upper` | ✅ |
| `frag_xuedao_fuxue` | 伏雪卷 | 3 | `lgs_xuedao_jing` | `middle` | ✅ |
| `frag_xuedao_jingdao` | 经刀合卷 | 3 | `lgs_xuedao_jing` | `lower` | ✅ |
| `frag_tangshi_duanju` | 断句卷 | 2 | `lgs_liancheng_tangshi` | `upper` | ✅ |
| `frag_tangshi_cangjue` | 藏诀卷 | 2 | `lgs_liancheng_tangshi` | `middle` | ✅ |
| `frag_tangshi_liancheng` | 连城卷 | 2 | `lgs_liancheng_tangshi` | `lower` | ✅ |
| `frag_gaochang_men` | 门径卷 | 3 | `lgs_gaochang_shouhu` | `upper` | ✅ |
| `frag_gaochang_jiguan` | 机关卷 | 3 | `lgs_gaochang_shouhu` | `middle` | ✅ |
| `frag_gaochang_shoujian` | 守剑卷 | 3 | `lgs_gaochang_shouhu` | `lower` | ✅ |
| `frag_fuqi_linlu` | 林路卷 | 2 | `lgs_yuanyang_fuqi` | `upper` | ✅ |
| `frag_fuqi_renlu` | 任路卷 | 2 | `lgs_yuanyang_fuqi` | `middle` | ✅ |
| `frag_fuqi_tongxin` | 同心卷 | 2 | `lgs_yuanyang_fuqi` | `lower` | ✅ |
| `frag_baihua_xushi` | 虚实卷 | 7 | `lgs_tianchi_baihua` | `upper` | ✅ |
| `frag_baihua_baijia` | 百家卷 | 7 | `lgs_tianchi_baihua` | `middle` | ✅ |
| `frag_baihua_guiyi` | 归一卷 | 7 | `lgs_tianchi_baihua` | `lower` | ✅ |
| `frag_paoding_xunli` | 循理卷 | 7 | `lgs_yufeng_paoding` | `upper` | ✅ |
| `frag_paoding_youren` | 游刃卷 | 7 | `lgs_yufeng_paoding` | `middle` | ✅ |
| `frag_paoding_shenyu` | 神遇卷 | 7 | `lgs_yufeng_paoding` | `lower` | ✅ |
| `frag_hujiadao_yingmen` | 迎门卷 | 7 | `lgs_hujia_daopu` | `upper` | ✅ |
| `frag_hujiadao_liaodi` | 料敌卷 | 7 | `lgs_hujia_daopu` | `middle` | ✅ |
| `frag_hujiadao_yuanrong` | 圆融卷 | 7 | `lgs_hujia_daopu` | `lower` | ✅ |
| `frag_miaojia_zhengfeng` | 正锋卷 | 3 | `lgs_miaojia_jianpu` | `upper` | ✅ |
| `frag_miaojia_xunxi` | 寻隙卷 | 3 | `lgs_miaojia_jianpu` | `middle` | ✅ |
| `frag_miaojia_huzhao` | 互照卷 | 3 | `lgs_miaojia_jianpu` | `lower` | ✅ |

#### 10.3.2 少林、五绝与逍遥残页实体（经脉落地终审返修）

下列 5 项为各册既有残页 ID 的正式物品定义，载体与掉落安排均为**（原创扩展）**。共同字段：`kind:page`、`origin:expanded`、`stack:1`（同武学页号并入同一残卷实例）、`price:null`【建议值】、`flags:[]`；因尚无逐页估价，本批默认暂不买卖（含未习得重复页），作为 §10.3 可售规则的待确认例外登记于 O16；拼合／转赠与已习得重复页修习经验仍按 §10.3。`assets.icon=item/<去掉 it_ 前缀的 ID>`，`text.short=name`、`text.desc=表中来源边界`；实例保存唯一页号集合，定义不新增 `maxLayer` 绕开页数式。`chapters` 只收卡面可学来源的书界，NPC 见闻不是掉落许可。

| ID / `name` | `skill` / `grade` | `pagesTotal` | `chapters` / 来源边界 |
|---|---|---:|---|
| `it_canye_dajingangquan` 大金刚拳残页 | `sk_dajingangquan` / 7 | 6 | `[ch01_tianlong]`；少林本门武学掉落池；保留 C14 倚天排除，倚天不得掉落可拼成完整秘籍的残页 |
| `it_canye_lianhuazhang` 莲花掌残页 | `sk_lianhuazhang` / 5 | 4 | `[ch02_shediao,ch03_shendiao,ch04_yitian,ch05_xiaoao,ch07_bixue,ch08_luding]`；本卡丐帮可学来源／武学池，不扩大到仅见闻书界 |
| `it_canye_luoyingshenjianzhang` 落英神剑掌残页 | `sk_luoyingshenjianzhang` / 7 | 6 | `[ch02_shediao,ch03_shendiao]`；本卡桃花岛传承武学池，不改变黄蓉／程英师授途径 |
| `it_canye_chousuizhang` 抽髓掌残页 | `sk_chousuizhang` / 8 | 6 | `[ch01_tianlong]`；星宿门人掉落，保留本卡门派与前置条件 |
| `it_canye_dashouyin` 大手印残页 | `sk_dashouyin` / 6 | 4 | `[ch01_tianlong,ch03_shendiao,ch04_yitian,ch08_luding]`；本卡番僧掉落；鹿鼎书界有效层数限制仍按上游执行 |

**页数核算与旧字段迁移**：地阶三项均为 `k=6`，集得 `1…6` 页对应 `sourceCap=ceil(10n/6)=2/4/5/7/9/10`；玄阶两项均为 `k=4`，对应 `3/5/8/10`。逍遥册大手印为玄上 6，旧 `learnSources.pagesTotal:6` 与 05 §7.5 冲突，正式定义采用 **4**；交图鉴任务将来源字段同次改为 4，迁移前不得把 6 页源作为另一版物品启用。与康熙血刀“六页中仅投四页”的受限来源不同，此处总页数本身就是 4。

### 10.4 原著奇书

| 奇书 | 书界 | 形态 | 本作规则 | 原著出处 |
|---|---|---|---|---|
| 九阴真经（上卷 / 下卷） | 射雕 | 两部残本 `it_miji_jiuyin_shang` / `_xia` | 上卷为内功总纲，下卷为招式（九阴神爪、九阴白骨爪等）；两卷合为全本 | 射雕·王重阳死前托周伯通保管上下两卷；陈玄风、梅超风后来从桃花岛盗走下卷 |
| 武穆遗书 | 射雕（倚天藏于屠龙刀） | 兵书（非武学） | 研读得学识“兵法”：解锁守城战与军阵指挥（09 阵法） | 射雕·完颜洪烈长期寻觅岳飞遗书，郭靖、黄蓉最终在铁掌峰取得；倚天追述其后藏入屠龙刀 |
| 金蛇秘笈 | 碧血 | 秘笈 + 机关 | 须依书中指示行事（`wis`、`lore` 检定），违者触发机关 | 碧血·夏雪宜遗留的金蛇秘笈与藏宝线索。机关检定为**（原创扩展）**；**（待考）**核对三联/广州修订版秘笈所附机关或警示的具体方式 |
| 连城剑谱（唐诗剑法） | 连城 | 剑谱 + 诗谜 | 05 §7.6 `poem`：剑招序号对应唐诗文字，解出宝藏所在 | 连城·唐诗剑谱之秘 |
| 胡家刀谱 | 飞狐 | 残本（缺首二页） | `sk_hujiadao` 残本 `maxLayer 8`；于雪山寻回二页（阎基/宝树线）合为全本 | 飞狐·胡家刀谱首二页为阎基所得 |
| 四十二章经（八部） | 鹿鼎 | 信物拼合 | 八部经书各藏羊皮碎片，集齐拼成地图（§5.5） | 鹿鼎·八部经书藏图 |
| 辟邪剑谱 | 笑傲 | 原本（袈裟） | 阅读前弹出 05 §9.1.4"断尘之誓"确认 | 笑傲·林家老宅袈裟所录剑谱 |
| 药王神篇 | 飞狐 | 医毒典籍（非武学） | 研读：`med`、`poi`、`antidote` 各 +5（03 §8.1 典籍 +3～+10），并解锁七心海棠毒方 | 飞狐外传·无嗔大师晚年所著医书，又称《无嗔医药录》，由程灵素保管 |
| 侠客行石壁 | 侠客 | 地点（非物品） | 05 §7.6 `stroke`；可拓印"石刻拓片"为收藏品 | 侠客行·侠客岛石室 |

---

## 11. 任务物品、钥匙/信物、奇物、坐骑、收藏品

### 11.1 任务物品 `quest`

| 规则 | 内容 |
|---|---|
| 存放 | "要物"栏，不占背包格、无数量上限 |
| 限制 | 不可丢弃、出售、赠予（除任务脚本）；`questBound` 不可携带 |
| 结束 | 任务完成后按配置移除，或转为"纪念品"（`keepsake`，进物品图鉴，不占格） |

### 11.2 钥匙与信物 `token`

| 规则 | 内容 |
|---|---|
| 字段 | `opens`（门、机关、区域）、`recognizedBy`（认物 NPC 与对话节点）、`quest` |
| 身份类信物 | 黑木令、五岳令旗、玄铁令等（§5.5）：对话与门禁检定视为身份凭证；非法持有者可能触发敌意（12） |
| 装备型信物 | 打狗棒、圣火令、峨眉铁指环、黄马褂、成吉思汗金刀：同时是装备，其"信物"部分属非战斗效果，**不受外来压制**（§7.2） |
| 书眠 | 钥匙与信物留在本书界；史笺（02 §6.6）是唯一可经藏史跨书界的书信类物品 |
| 跨年代例外 | `design/20` 明列为 `keyToken` 的 39 件关键信物存入 `runLegacy.inventory`，跨书眠保留并在合成全本时原子消耗；它们不可交易、不可丢弃、不可藏史、不可被普通任务清理。未被 20 登记者仍按上一行清除 |

#### 11.2.1 跨年代传承信物目录（39 件）

> 下表只定义 `ItemDef` 的名称、类别与生命周期。每件均 `kind=token`、`sub=keyToken`、`unique=true`、`price=null`，取得后进入 `runLegacy.inventory`；不可交易、丢弃、赠予或藏史，跨相邻书眠与雪山→终局保留，新周目重置。来源、出现概率、三卷配对、校合条件与消费事务唯一归 `design/20` §9。除另有原著锚点者外，这些逻辑信物均为**（原创扩展）**。

| ID | 名称 | 类别 | 来源引用 |
|---|---|---|---|
| `it_xinwu_aqingshoujuan` | 阿青墓中手卷**（原创扩展；墓址待考）** | `token` / `keyToken` | `lgs_yuenv_aqing`（阿青剑源） |
| `it_xinwu_yijin_fanjia` | 梵夹次第签 | `token` / `keyToken` | `lgs_shaolin_yijin`（少林易筋经） |
| `it_xinwu_liumai_jianpu` | 六脉剑谱次第图 | `token` / `keyToken` | `lgs_dali_liumai`（大理六脉） |
| `it_xinwu_beiming_botu` | 经脉帛图 | `token` / `keyToken` | `lgs_xiaoyao_beiming`（逍遥北冥） |
| `it_xinwu_xiaowuxiang_yuxin` | 无相玉心印 | `token` / `keyToken` | `lgs_xiaoyao_xiaowuxiang`（逍遥小无相） |
| `it_xinwu_lingbo_butu` | 六十四卦步图 | `token` / `keyToken` | `lgs_xiaoyao_lingbo`（逍遥凌波） |
| `it_xinwu_douzhuan_shipu` | 还施水阁识谱印 | `token` / `keyToken` | `lgs_murong_douzhuan`（姑苏斗转） |
| `it_xinwu_xianglong_bangji` | 历代帮主授掌记 | `token` / `keyToken` | `lgs_gaibang_xianglong`（丐帮降龙） |
| `it_xinwu_dagou_bangjie` | 帮主棒节信记 | `token` / `keyToken` | `lgs_gaibang_dagou`（丐帮打狗） |
| `it_xinwu_jiuyin_jiaokan` | 九阴校勘记 | `token` / `keyToken` | `lgs_huangshang_jiuyin`（黄裳九阴） |
| `it_xinwu_yiyang_duanzhi` | 段氏指诀印记 | `token` / `keyToken` | `lgs_dali_yiyang`（大理一阳指） |
| `it_xinwu_bihai_yuxiaoji` | 玉箫旧谱记 | `token` / `keyToken` | `lgs_taohua_bihai`（桃花碧海） |
| `it_xinwu_xuantie_beituo` | 剑冢碑文旧拓 | `token` / `keyToken` | `lgs_dugu_xuantie`（剑冢玄铁） |
| `it_xinwu_yunv_shuangyin` | 双人合练印**（原创扩展；卷名对应待考）** | `token` / `keyToken` | `lgs_gumu_yunv`（古墓玉女） |
| `it_xinwu_taiji_chutu` | 太极初传图 | `token` / `keyToken` | `lgs_taiji_quan`（武当太极拳） |
| `it_xinwu_taijijian_mujian` | 初传木剑铭 | `token` / `keyToken` | `lgs_taiji_jian`（武当太极剑） |
| `it_xinwu_jiuyang_jiaoben` | 三家九阳校本 | `token` / `keyToken` | `lgs_jiuyang_zhenjing`（九阳全本） |
| `it_xinwu_qiankun_shenghuolingyin` | 圣火令拓印 | `token` / `keyToken` | `lgs_mingjiao_qiankun`（明教乾坤） |
| `it_xinwu_dugu_jianshi` | 剑冢剑意拓 | `token` / `keyToken` | `lgs_dugu_jiujian`（独孤九剑） |
| `it_xinwu_xixing_tiesuo` | 地牢铁牌拓 | `token` / `keyToken` | `lgs_riyue_xixing`（吸星大法） |
| `it_xinwu_kuihua_hongyin` | 红印校记 | `token` / `keyToken` | `lgs_kuihua_baodian`（葵花宝典） |
| `it_xinwu_bixie_jiapao` | 袈裟墨迹残片 | `token` / `keyToken` | `lgs_fuwei_bixie`（林家辟邪） |
| `it_xinwu_taixuan_shike` | 石壁原拓角 | `token` / `keyToken` | `lgs_xiakedao_taixuan`（侠客岛太玄） |
| `it_xinwu_luohan_nirenxin` | 泥人空心图 | `token` / `keyToken` | `lgs_luohan_niren`（罗汉泥人） |
| `it_xinwu_taxue_xueyin` | 雪山步印拓 | `token` / `keyToken` | `lgs_xueshan_taxue`（雪山踏雪） |
| `it_xinwu_jinshe_jiantu` | 金蛇剑槽拓图 | `token` / `keyToken` | `lgs_jinshe_miji`（金蛇秘谱） |
| `it_xinwu_shenxing_qipan` | 铁剑棋盘暗记 | `token` / `keyToken` | `lgs_tiejian_shenxing`（铁剑神行） |
| `it_xinwu_hunyuan_zhangyin` | 混元掌印谱 | `token` / `keyToken` | `lgs_huashan_hunyuan`（华山混元） |
| `it_xinwu_ningxue_xiangtang` | 香堂暗押 | `token` / `keyToken` | `lgs_tiandihui_ningxue`（天地会凝血） |
| `it_xinwu_shenlong_longyin` | 神龙教主印拓 | `token` / `keyToken` | `lgs_shenlong_xinfa`（神龙心法） |
| `it_xinwu_shenzhao_yuwen` | 狱墙字样原拓 | `token` / `keyToken` | `lgs_shenzhao_jing`（神照经） |
| `it_xinwu_xuedao_xueyin` | 血刀刀背经印 | `token` / `keyToken` | `lgs_xuedao_jing`（血刀经） |
| `it_xinwu_tangshi_puzi` | 剑谱排列签 | `token` / `keyToken` | `lgs_liancheng_tangshi`（唐诗剑谱） |
| `it_xinwu_gaochang_bihua` | 迷宫壁画叠片 | `token` / `keyToken` | `lgs_gaochang_shouhu`（高昌守藏） |
| `it_xinwu_fuqi_shuangpu` | 双谱合页 | `token` / `keyToken` | `lgs_yuanyang_fuqi`（夫妻刀法） |
| `it_xinwu_baihua_cuopu` | 错拳次第谱 | `token` / `keyToken` | `lgs_tianchi_baihua`（天池百花错） |
| `it_xinwu_paoding_dongwen` | 玉峰洞文拓片 | `token` / `keyToken` | `lgs_yufeng_paoding`（玉峰庖丁） |
| `it_xinwu_hujiadao_shouye` | 刀谱首二页 | `token` / `keyToken` | `lgs_hujia_daopu`（辽东胡刀） |
| `it_xinwu_miaojia_jianxin` | 苗家剑心记 | `token` / `keyToken` | `lgs_miaojia_jianpu`（苗家剑谱） |

#### 11.2.2 天书与终局书页丹

| ID | `kind/sub` | 品阶 / 堆叠 | `use` / 规则 | 来源 / 边界 |
|---|---|---|---|---|
| `it_tianshu_01`…`it_tianshu_14` | `system/book` | `grade:null` / 1 | 收入书灵“天书匣”；`price:null`，不可丢弃、不占背包或书眠 6 件额度，跨书界永久；与 13 的 `tsp_*` 一一对应 | 取得、天书之力与终局归 `design/13` §4.1；不存在 `it_tianshu_15` |
| `it_shuyedan` | `pill/heal` | 系统 g12 / 9 | `{context:battle,action:consume,target:self,effects:[healPct:0.30,mpPct:0.30],battleLimit:{perBattle:1}}`；占物品行动，回复量各自向下取整，受 `healRecv`、不受 `healPower`；`price:null`，无永久增益或冲穴辅助 | `chapters:[ch15_guimeng]`；每卷卷间调息由 `design/13` §7.3 发放 2 枚，离开终局删除。名称与效果均为**（原创扩展）** |

难度不改本文 §6.2 的强化成功率，统一乘数为 `×1.0`；“天书铭” `ins_feixue` 在本周目集齐 7 本时解锁，见 §6.4。三项均消费 `design/13` 的确认，不在本文重定义成长或难度。

### 11.3 奇物 `curio`

| ID | 名称 | 书界 | 规则 | 原著出处 / 标注 |
|---|---|---|---|---|
| `it_shenmuwangding` | 神木王鼎 | 天龙 | 随身配毒炉：可在野外配毒（§8.7），毒方产量 +1；装配化功大法（catalog）时其修炼 `bonusMult +15%` | 天龙·星宿派丁春秋之宝鼎，阿紫盗之（功用数值原创扩展） |
| `it_bingcan` | 冰蚕 | 天龙 | 一次性二选一：① 淬毒一次（`bf_handu`，品阶 10）；② 伴修内功 30 日，主运内功 `bonusMult +20%`（原创扩展） | 天龙·游坦之借冰蚕寒毒练成冰蚕毒掌；本作可控的二选一培养方式为**（原创扩展）** |
| `it_shandiandiao` | 闪电貂 | 天龙 | 驭兽伙伴（05 杂学 `beast`）：战斗中召出，噬咬附 `bf_zhongdu` | 天龙·钟灵所养闪电貂 |
| `it_yufengchao` | 玉蜂巢 | 神雕 | 驭蜂（05 杂学 `beast`）：在 09 的六角区域模板内结算蜂群并附 `bf_mabi`；可采玉蜂浆（§8.3） | 神雕·古墓小龙女驭玉蜂 |
| `it_mangguzhuha` | 莽牯朱蛤 | 天龙 | 见 §8.3 D | 天龙 |
| `it_gaochangyibao` | 高昌遗宝 | 白马 | `kind:curio/sub:relic/grade:9/stack:1/price:null`；`chapters:[ch10_baima]`；仅 `dc_10_07` 固定选择节点可取走或永久封藏，见下文 | **（原创扩展）**；泛称剧情遗物，不宣称原著有某件具名宝物 |

奇物全部 `unique`、不可买卖、不跨书界。闭关灵地（如古墓寒玉床）是地点而非物品，归 design/11。

**高昌牺牲物（P10／D10 交接）**：`it_gaochangyibao` 是地上 9 的非战斗剧情奇物，不是玄上 6 收藏品 `it_gaochangguwu`，也不是 `design/20` 的传承信物。它无属性、无武学与永久增益，不可装备、拆解、赠予、藏史或作为传承合成材料；`origin:expanded`、`consumable:false`、`flags:[unique,questBound,noCarry]`，图标 `item/gaochangyibao`。取走时原子登记唯一实例与章节取走结果；选择封藏时不发放实例，按剧情记录永久封藏结果，后续不能再取回或转成金钱。先救人、弃物与改命的条件只由 `story/10`、`chapters/10` 判断，不能以放弃普通古物替代。物品名称与无战斗收益是本版默认值，见 O15。

探索工具另走 `tool`：飞爪 `it_feizhua` 为普通消耗品，按 08 的 qg3 攀援替代入口使用，产生噪声并消耗 1 件；P50 已定其**仅探索可用**。火折子、火油、水靠等候选也只向 08 暴露物品 ID 与数量，不在本文复制地形门禁。

### 11.4 坐骑 `mount`

坐骑只提供物品定义及旅行倍率；统一江湖大地图、时代图层、历史城市、驿路/水路和图外专线分别归 `design/11` 与 `design/19`（AR-04、AR-11），本文不建立第二张地图或路线表。

| ID | 名称 | 品阶 | `travelMul` | `staMul` | 可骑地形（归 08） | 获取 | 出处 |
|---|---|---|---|---|---|---|---|
| `it_maolv` | 毛驴 | 黄下 1 | 0.90 | 0.85 | 道路、山道 | 马市 | 通用 |
| `it_numa` | 驽马 | 黄下 1 | 0.80 | 0.90 | 道路、平原 | 马市 | 通用 |
| `it_chuanma` | 川马 | 黄上 3 | 0.75 | 0.85 | + 山道 | 马市 | 通用 |
| `it_luotuo` | 骆驼 | 玄下 4 | 0.80 | 0.70 | 沙漠（沙漠中不额外耗体力） | 回疆、大漠 | 通用 |
| `it_mengguma` | 蒙古马 | 玄中 5 | 0.70 | 0.80 | + 草原、沙地 | 北方马市 | 通用 |
| `it_dawanma` | 大宛良驹 | 地下 7 | 0.60 | 0.75 | 同蒙古马 | 奇遇 | 通用 |
| `it_baima` | 白马 | 地中 8 | 0.55 | 0.65 | 草原、沙漠 | 白马（chapters/10） | 白马啸西风·李文秀的白马 |
| `it_xiaohongma` | 小红马（汗血宝马） | 地上 9 | 0.45 | 0.60 | 全部陆地道路 | 射雕·蒙古线 | 射雕·郭靖所得汗血宝马 |
| `it_baidiao` | 白雕（灵禽） | 地中 8 | — | — | 不可骑；侦察：揭示区域迷雾、传书（11） | 射雕·蒙古线 | 射雕·郭靖与华筝所养白雕 |

- `travelMul`：大地图旅行耗时倍率（11）；`staMul`：探索奔跑体力消耗倍率（08）。
- 坐骑不参战：就地开战时自动下马（基准 §8）；白马书界的"草原骑乘"特殊玩法归 chapters/10（02 §7.2）。
- 马厩 3 位；坐骑不跨书界（**坐骑图鉴**跨书界记录）。

### 11.5 收藏品：书画琴棋 `collectible`

| ID | 名称 | 类 | 估值品阶 | 研读（一次性，战斗外 1 日） | 馈赠（好感，12） | 原著出处 |
|---|---|---|---|---|---|---|
| `it_guanglingsan` | 《广陵散》琴谱 | 琴谱 | 地上 9 | `music +8` | 梅庄黄钟公（大增，引出七弦琴与梅庄主线） | 笑傲·曲洋掘古墓寻得《广陵散》，向问天以琴谱投黄钟公所好 |
| `it_xiaoaoqupu` | 《笑傲江湖》曲谱 | 琴谱 | 地上 9 | `music +10`；解锁铭文 `ins_xiaoao` | 任盈盈 | 笑傲·曲洋、刘正风合撰琴箫之曲 |
| `it_ouxuepu` | 《呕血谱》 | 棋谱 | 地中 8 | `chess +8` | 梅庄黑白子（引出玄铁棋盘） | 笑傲·刘仲甫与骊山仙姥对弈、呕血之局 |
| `it_shuaiyitie` | 张旭《率意帖》 | 书法 | 地中 8 | `art +8` | 梅庄秃笔翁（引出秃笔翁之笔） | 笑傲·向问天携往梅庄 |
| `it_xishanxinglvtu` | 范宽《溪山行旅图》 | 画 | 地中 8 | `art +6` | 梅庄丹青生 | 笑傲·向问天携往梅庄 |
| `it_zhenlongqiju` | 珍珑棋局图 | 棋谱 | 地中 8 | `chess +6` | 苏星河 | 天龙·无崖子创珍珑棋局，苏星河奉命摆局；“棋局图”这一可携物件为**（原创扩展）** |
| `it_wuyazihuajuan` | 无崖子画卷 | 画 | 地中 8 | `art +5` | 逍遥派一脉 NPC | 天龙·无崖子交虚竹画卷，令其寻画中人学习武功。**（待考）**核对三联/广州修订版画中人物究竟按何种称谓辨识，任务对白不先实名 |
| `it_shiketapian` | 石刻拓片 | 书法 | 地下 7 | `lore +3` | — | 侠客行石壁、笑傲思过崖石刻之拓（原创扩展，02 §6.4 已列） |
| `it_zuqianqiujiubei` | 祖千秋酒杯组 | 古玩 | 地下 7 | —（以杯配酒，§9.3） | 祖千秋、令狐冲 | 笑傲·祖千秋论不同酒须配不同杯；本作只收录 §9.3 三组配对 |
| `it_gaochangguwu` | 高昌古物 | 古玩 | 玄上 6 | `art +3` | 回疆部族长老 | 白马啸西风·高昌迷宫所藏多为汉家典籍器物。**（待考）**核对三联/广州修订版中典籍、器物的具体类别；本文不先填写单件古物名称 |

- 研读收益受 03 §8.1"典籍 +3～+10、不超过典籍品阶门槛 `T(g)`"约束（例：地上 9 的门槛 68，技艺已 ≥ 68 时研读无效）。
- 收藏品不跨书界，但入**藏品录**（§12.5）永久记录。梅庄四宝换取四友之好，是原著情节的直接改编（向问天与令狐冲携四宝入梅庄）。

---

## 12. 背包、仓库与跨书界

### 12.1 背包

| 项 | 值 |
|---|---|
| 容量 | 初始 80 格；"行囊"升级 3 次（每次 +20，12 定价格）→ 140 格 |
| 分页 | 装备 / 丹药 / 材料 / 秘籍残页 / 杂物；另有不占格的"要物"（任务、钥匙、信物）与"藏品匣"（收藏品） |
| 堆叠 | 装备、秘籍、奇物 1；丹药、毒药、解药、暗器弹药 99（天级丹药 9）；材料 999；菜肴、酒、干粮 20；残页按武学 1 格 |
| 重量 | 无（手机端友好）；负重只来自装备的 `Q_load`（§3.4） |
| 整理 | 自动归类堆叠；"一键出售杂物"只卖白色（无词条黄阶）装备与重复残页 |
| 满包 | 战利品进入"待拾"（保存到下一次整理，最多 20 件），不直接丢失 |

### 12.2 仓库（寄存）

| 项 | 值 |
|---|---|
| 位置 | 客栈"寄存"、门派居所、自宅（11/12） |
| 容量 | 每书界 200 格，本书界内各寄存点互通（"江湖寄存"，原创扩展便利） |
| 费用 | 免费 |
| 书眠 | 仓库内容**不跨书界**；02 书眠第 4 步可从仓库选装备携带 |

### 12.3 书眠时物品去留

| 物品 | 去留 | 依据 |
|---|---|---|
| 被选中的 ≤ 6 件装备 | 带入下一书界（外来），强化/工艺/铭刻/词条保留，淬毒清除 | 基准 §3、§20；§7.1 |
| 已藏史的装备与史笺 | 留在古迹，后续书界寻回 | 02 §6.6 |
| 其余装备（含仓库、队友手中） | 留在本书界 | 基准 §3-6 |
| 金钱 | 清空 | 基准 §3-6 |
| 丹药、毒药、材料、菜肴、酒、弹药 | 清空 | 同上 |
| 秘籍、残页、配方卷 | 清空（已学武学按 02；已学配方为学识，保留）；20 明列的 `legacyCarry` 残本例外 | 基准 §3；AR-13 / `design/20` |
| 任务物品、钥匙、信物、奇物、坐骑、收藏品 | 清空；20 明列的 `keyToken` 例外 | 基准 §3；AR-13 / `design/20` |
| 史印 `it_shiyin` | 入眠即失效 | 02 §6.6 S1 |
| **保留（主角自身）** | 永久增益（`pillPerm`）、`permBudget`、学识（丹方/菜谱/图谱/铭文 `rc_*`/`ins_*`）、物品图鉴、藏品录、神兵谱、天书（`it_tianshu_NN`，书灵"天书匣"） | 本文；天书归 13 |

AR-13 的例外只保存被 20 登记的物品实例，不把已发现遗迹、后人或合成概率搬进本文；构建器不得把任意普通物品猜成 `legacyCarry/keyToken`。

- **余韵期整理提示**（02 §4.1）：进入余韵期时，书灵列出"将随书眠消逝之物"的估值合计与三个出路：变卖（§13）、馈赠 NPC（可产生 02 §6.3 的物件/好感回响，奖励受"不超过地阶"约束）、散财行善（捐与寺观/帮会换本书界声望，12）。
- `design/16` 的资源库存、资源点占有、家丁以及行脚/教头/客卿任职默认随书眠清除；客卿唯一性、营生结算与例外白名单均由其处理（AR-05、AR-06）。`design/12` 的门派 L1–L5 身份、月钱资格与 `design/16` 的资源配给同样不由背包物品绕过（AR-07）。

### 12.4 藏史接口（规则本体归 02 §6.6）

| 本文提供 | 说明 |
|---|---|
| 可藏之物 | 装备（`EquipInstance` 完整存入）与史笺；`noCarry`、`anchorLocked`、`questBound` 不可藏 |
| 存入时 | 清除 `poisonCoat`；其余字段原样保留（含 `refine`、`temper`、`inscription`、`affixes`、`broken`） |
| 取回时 | `absGrade −= ageDecay`（02 S6，神兵至多 −1）；若大阶下降：`refineMax`、`maxAffix` 按新大阶，超出部分封存（同 §7.2）；`nativeTo` 不变（外来）；`history` 追加 `{how: 'stash'}` |
| 器合 | 取回物若在当前书界有原生同名实例，可按 02 §5.8 器合 |

### 12.5 物品图鉴、神兵谱与藏品录

| 图鉴 | 收录 | 里程碑奖励（全部跨书界永久） |
|---|---|---|
| 物品图鉴 | 获得过的全部物品定义（含纪念品） | 收录 100 / 300 / 600 种：`lore` +1 / +1 / +2 |
| 神兵谱 | 天级 12 件 + 名器 47 件（持有过即收录） | 天级 3 / 6 / 12 件：`forge` +2 / +3 / +5；名器 15 / 30 / 47 件：称号"识宝" / "藏锋" / "神兵谱主"；**剑冢四剑**（玄铁重剑、紫薇软剑、独孤利剑、独孤木剑）同时持有过：`lore` +3、称号"剑魔传人"（原创扩展） |
| 藏品录 | 收藏品、奇物、坐骑、菜谱、酒 | 书画琴棋各收 3 件：对应技艺 +2；全部梅庄四宝：称号"梅庄贵客" |

- 图鉴只记"曾经拥有"，不要求书眠时仍在身边；奖励为技艺/常识小额加成（03 §8.1 技艺成长的旁路，不计入装备临时加值上限）。

---

## 13. 经济锚点（与 design/12 对接）

### 13.1 价格公式

```
P(cat, g) = P0(cat) × 2.2^(g − 1)              // 单位：两（银）；取两位有效数字；< 1 两以文计（1 两 = 1,000 文）
装备估值  V = P(cat, absGrade) × (1 + 0.15 × 生效词条数) × (1 + 0.04 × refine) × 名器 3 / 神兵 5（神兵只估不卖）
```

- 每升一小品约 ×2.2，一大阶约 ×10.6：与"地阶装备大约是玄阶十倍身价"的直觉一致，也与 02 表 H 的掉落稀有度同量级。
- 天级（10–12）行只作"估值"（UI 显示、当铺抵押、馈赠价值），商店不出售（02 R2、R1）。

### 13.2 价格表（`P(cat, g)`，两；★ = 仅估值）

| 品阶 | 主武器 | 衣 | 副手/佩饰 | 头手腰鞋 | 疗伤/回内丹药 | 增益丹药 | 暗器弹药（枚） | 材料（份） | 秘籍 | 菜肴 | 坐骑 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 黄下 | 2 | 1.5 | 1 | 0.8 | 200 文 | 300 文 | 20 文 | 100 文 | 5 | 50 文 | 15 |
| 2 黄中 | 4.5 | 3.5 | 2.5 | 2 | 450 文 | 650 文 | 40 文 | 200 文 | 11 | 100 文 | 33 |
| 3 黄上 | 9.5 | 7.5 | 6 | 4 | 1 | 1.5 | 100 文 | 500 文 | 24 | 250 文 | 73 |
| 4 玄下 | 21 | 17 | 13 | 8.5 | 2 | 3 | 200 文 | 1 | 53 | 500 文 | 160 |
| 5 玄中 | 47 | 37 | 28 | 19 | 4.5 | 7 | 450 文 | 2.5 | 120 | 1 | 350 |
| 6 玄上 | 100 | 82 | 62 | 41 | 10 | 15 | 1 | 5 | 260 | 2.5 | 770 |
| 7 地下 | 230 | 180 | 140 | 91 | 23 | 34 | 2.5 | 11 | 570 | 5.5 | 1,700 |
| 8 地中 | 500 | 400 | 300 | 200 | 50 | 75 | 5 | 25 | 1,200 | 12 | 3,700 |
| 9 地上 | 1,100 | 880 | 660 | 440 | 110 | 160 | 11 | 55 | 2,700 | 27 | 8,200 |
| 10 天下 ★ | 2,400 | 1,900 | 1,400 | 970 | 240 | 360 | — | 120 | 6,000 | 60 | — |
| 11 天中 ★ | 5,300 | 4,200 | 3,200 | 2,100 | 530 | 800 | — | 270 | 13,000 | 130 | — |
| 12 天上 ★ | 12,000 | 9,300 | 7,000 | 4,700 | 1,200 | 1,800 | — | 580 | 29,000 | 290 | — |

**服务费**（以被服务物品的 `P(cat, absGrade)` 为基数；自做免费）：强化代工见 §6.2（5%–40%/级）；工艺、重铸 10%；精修、修复 5%；拆解免费；铭刻只收墨料；炼丹/配毒代工 = 成品价 × 30%；医治、客栈、驿马等服务价格归 12/11。

### 13.3 买卖修正

| 项 | 公式 | 出处 |
|---|---|---|
| 买价 | `V × buyMul(cha) × (1 − 0.001 × speech) × shopMul × chapterPriceMul` | `buyMul = 1.15 − 0.003·cha`、议价见 03 §2.3、§8.2；`shopMul`（声望、门派折扣）与 `chapterPriceMul`（书界物价）归 12 |
| 卖价 | `V × sellMul(cha) × outlet` | `sellMul = 0.35 + 0.0015·cha`（魅力 50 → 0.425）；`outlet`：专营店 1.0、杂货铺 0.8、当铺 0.8 |
| 名器 | 只能当给当铺，得 `V × 0.30`（本书界内可原价赎回） | 本文 |
| 神兵、任务物品、信物、天材 | 不可买卖 | 本文 |

例：地中剑（500 两）带 2 条词条、+3：`V = 500 × 1.30 × 1.12 = 728`；魅力 50、口才 40 买入 `728 × 1.00 × 0.96 = 699` 两，卖出 `728 × 0.425 = 309` 两。

### 13.4 商店供货上限

| 境界 | 普通店铺（药铺、铁匠、杂货） | 名店 / 门派兑换 | 黑市（毒药、迷药、赃物） |
|---|---|---|---|
| 高武 | 玄上 6 | 地下 7 | 地下 7 |
| 中武 | 玄中 5 | 玄上 6 | 地下 7 |
| 低武 | 玄下 4 | 玄中 5 | 玄上 6 |

- 另受区域等级约束：`供货品阶 ≤ gMain(区域等级)`（03 §3.5），新手区不卖高阶货。
- 地阶以上装备、秘籍不在普通商店出售；门派兑换（贡献）与特殊商人（chapters/）除外。低武书界"强力物品 ≥ 70% 来自固定掉落"（02 §7.3 N5）由此保证。

### 13.5 收入锚点（给 design/16 的建议）

收入、赌场/镖局/山庄营生、行脚/教头/客卿资格与月结均归 `design/16`（AR-06），门派月钱资格归 `design/12`、金额与资源配给归 `design/16`（AR-07）。本节只给物品价格侧的消费锚，不据此重定义职位或经济循环。

| 项 | 建议 |
|---|---|
| 每小时净收入 | `I ≈ 2 × P(主武器, g_mode) × chapterIncomeMul`，`g_mode` = 本书界普通池众数品阶（§4.4）。例：天龙 `2×9.5×1=19` 两/时、射雕 ≈ 94、神雕 ≈ 200、倚天 ≈ 460、笑傲 ≈ 94 |
| 书界系数 `chapterIncomeMul` | 默认 1.0；鹿鼎 5.0（宫廷、赌场、贿赂——"韦小宝式发家"）、书剑 1.5（乾隆盛世）、白马 0.6（草原以物易物）【建议值，12 定】 |
| 收入构成 | **已由 16 §12.1 定稿**：任务 40%、战利品出售 25%、敌人现银 10%、城市营生 10%、资源点 8%、门派 5%、赌场/其他 2%；合计 `40+25+10+10+8+5+2=100%`，相邻桶只可按 16 的约束挪动 |
| 敌人掉钱 | 普通 `0.02 × P(主武器, g_敌)`、精英 ×3、Boss ×10 |
| 消费锚点 | 一件众数品阶装备 ≈ 0.5 小时收入；一颗同品阶疗伤丹 ≈ 3 分钟；+1～+6 强化（代工费 56% + 材料约 27% 的物品价）≈ 0.4 小时 |
| 开局银两 | 每书界开局 `4 × P(主武器, g_mode)`（开局身份可改，chapters/ §2） |
| 跨书界 | 金钱清零（基准 §3-6）；余韵期的"散财"出路见 §12.3 |

---

## 14. 本文新增术语与 ID

### 14.1 术语与字段

| 术语 | ID / 字段 | 类别 | 定义 | 节 |
|---|---|---|---|---|
| 物品大类 | `ItemKind`（24 值） | 枚举 | `weapon` `armor` `offhand` `hidden` `accessory` `ammo` `pill` `tonic` `poison` `antidote` `food` `dish` `wine` `material` `tool` `manual` `page` `recipe` `quest` `token` `curio` `mount` `collectible` `system` | §2.1 |
| 物品定义 / 装备定义 | `ItemDef` / `EquipDef` / `UseSpec` | 数据结构 | 通用字段、装备专属字段、消耗品用法 | §2.3–2.4 |
| 装备实例 | `EquipInstance` | 数据结构 | 含 `absGrade` `nativeTo` `affixes` `temper` `inscription` `refine` `refineFire` `poisonCoat` `broken` `owner` `qipo` `sleeps` `history` | §2.5 |
| 使用品阶 | `gUse` | 计算量 | `min(effGrade, gCap(Ld))`，一切装备数值的计算品阶 | §4.3 |
| 等级封顶 | `gCap(Ld)` | 公式 | `min(12, gMain(Ld) + 2)`；"力有不逮" | §4.3 |
| 满效等级 | `reqLv(g)` | 表 | 发挥全部品阶与专属特效所需显示等级 | §4.3 |
| 神兵择主 / 驾驭不住 | — | 规则 | 等级不足封存专属；属性不足主属性衰减 | §4.3 |
| 兵器类别系数 | `kA` | 系数 | 按类别/奇门细类的主属性系数 | §3.2 |
| 衣甲轻重 | `armorWeight`、`kD` `kI` | 枚举 / 系数 | 轻 0.16/0.12、中 0.20/0.10、重 0.28/0.07 | §3.4 |
| 手持 | `hands`：`1` `2` `pair` | 枚举 | 单手、双手、成对（占两格计 1 件） | §3.3 |
| 兵器标签 | `heavy` `soft` `long` `glove` `blunt` `metal` `night` `poisoned` | 标签 | 主属性修正、需求、特殊判定 | §3.2 |
| 暗器细类 | `HiddenKind`：`needle` `dart` `ball` `awl` `bolt` `powder` `gun` `bow` | 枚举 | 名门暗器与弹药 | §2.6、§3.5 |
| 暗器囊 / 名门暗器 | `pouch` / `hidden` | 装备子类 | 副手的暗器载具 | §3.5 |
| 弹药倍率 | `ammoMul(g)` | 公式 | `0.88 + 0.035 × g` | §3.5 |
| 词条 / 品相 | `af_*` / `q` | ID / 系数 | 78 条词条；品相 0.70–1.00，下中上极 | §4.5–4.6 |
| 大阶词条上限 | `maxAffix` | 表 | 黄 1、玄 2、地 3、天 4（佩饰 +1） | §4.5 |
| 专属特效 | `ue_*`、`core`、`lowTier`（`half` `seal`） | ID / 字段 | 神兵 2 条、名器 1 条；压制分档；装备 Buff 直接使用当前 `gUse` | §5.1、§7.3 |
| 神兵护主 | — | 规则 | 天级兵器 `gUse ≥ 10` 时常驻 06 `bf_mian_pobing` | §5.1 |
| 强化 | `refine`、`refineMax`、`refineEff`、`refineFire`、稳炼 | 字段 / 机制 | 主属性 +4%/级；失败不降级 | §6.2 |
| 工艺 | `temper`（开锋 / 加衬 / 琢磨） | 机制 | 自选 1 条工艺词条 | §6.3 |
| 铭刻 / 铭文 | `inscription` / `ins_*` | 机制 / ID | 12 条铭文，书画技艺 | §6.4 |
| 淬毒 | `poisonCoat` | 机制 | 3 场战斗附毒 | §6.5 |
| 锻造 / 重铸 / 精修 / 修复 / 拆解 | `craft` `reforge` `hone` `repair` `salvage` | 操作 | 装备的打造与维护 | §6.6 |
| 材料族 | `family`：`metal` `fabric` `leather` `wood` `jade` `herb` `toxin` `beast` `ingredient` `ink` | 枚举 | 材料体系 | §6.8 |
| 资源引用 | `resourceRef` | 字段 | 具体材料物品映射到 16 的 `res_*` 生产资源；不替代物品 ID | §2.4、§6.8 |
| 冲穴药物辅助 | `MeridianAid` / `meridianAid` | 数据结构 / 字段 | `{rateBp,successBp,costReduceBp,hours,meridians?}`；同来源逐槽取最高，总结算归 15 | §2.4、§8.1 |
| 装备经脉状态载荷 | `targetAcupoint`、`level`、`holdRange`、`remainingOwnActions` | 06 接口 | 装备只提供等级、持续、穴位选择 / 维持距离；运行时补实际 `source`。`bf_shouqin`、`bf_xueweishoufeng` 为可施加实例；`bf_jingqizhizhi`、`bf_jingmaizhangsun` 为模块派生视图；`bf_hutineijin` 为合法护体路线投影 | §2.6、§5.2、§5.4；定义见 06 §8.14 |
| 装备兼容介质 | `eq_changchangfengshibei` → `exotic/misc` | 装配桥 | 墓碑保持副手牌数值，只向明列本 ID 的 `weaponReq.altItems` 暴露奇门 / 其他介质；不泛化全部牌 | §3.2、§5.4 |
| 共享叙事载体 | 衙门武册 / 华辉遗谱 / 宝树旧稿 | 取得事务 | 一个叙事实体原子发放 2 / 3 / 2 条单 `skill` 的标准秘籍，避免扩张为 `skills[]` | §10.1.1 |
| 跨年代携带标记 | `legacyCarry` / `keyToken` | 20 提供的引用标记 | 仅 20 明列的残本与关键信物跨书眠；本文执行物品事务 | §10.3、§11.2、§12.3 |
| 天材 | — | 物品类别 | 天级材料，只由天材骰与固定节点产出 | §6.8 |
| 学识 | `rc_*`（配方）、`ins_*`（铭文） | 记录 | 跨书界保留的知识 | §2.2、§12.3 |
| 菜谱熟练度 | `recipeMastery[rc_*]` | 12 定义的生活技能状态 | 每张菜谱 0–10；本文只按 `design/12` §10.4 消费它来产出菜肴 | §9.4 |
| 烹饪失败产物映射 | `householdMeal` | 来源语义键 | 唯一映射到家常饭正式物品；黄下仅即时回体，不生成膳食状态 | §9.3.1 |
| 配方卷 | `it_fang_*` | 物品 | 读后习得配方学识 | §2.2 |
| 膳食 | `meal`、`mealScale` | 机制 | 菜肴的整场开场 Buff，数值 ×0.5 | §9.1 |
| 永久增益预算 | `permBudget` | 存档字段 | 先天、上限百分比、抗性的丹药投放计数 | §8.5 |
| 物品图鉴 / 神兵谱 / 藏品录 | — | 图鉴 | 跨书界的收集记录与里程碑 | §12.5 |
| 估值 | `V` | 公式 | 装备价值（词条、强化、名器、神兵系数） | §13.1 |
| 书界物价 / 收入系数 | `chapterPriceMul` / `chapterIncomeMul` | 系数（建议，12 定） | 书界经济差异 | §13.3、§13.5 |
| 装备槽版本 | `equip-slots.v2` / `equipSlotsVersion` | schema / 存档字段 | 原八槽加 `innerBody` `shoulder` `cape`；迁移原子化 | §3.1.1 |
| 目录天级 | `catalogTian` | 装备字段 | AR-20 额外天级样本；固定唯一但非 `divine` | §2.3、§5.1 |
| 官甲合法性 | `lawProfile` / `uniformImpersonation` | 装备字段 / 事件 | 只发身份违法暴露；通缉与城门处理归 11/12 | §3.4.1 |
| 药材年限 | `herbFamily` / `ageYears` | 材料字段 | 普通／十年／百年／千年映射黄／玄／地／天 | §8.2.1 |
| 食材细类 | `ingredientKind` | 材料字段 | 谷物、肉、水产、菜蔬、果、调料、珍材 | §9.0 |
| 物品出图名录 | `catalog/items-*.md` | 投影 | 十一份七列表，每 ID 一行；规则权威仍为本文 | §1.3、§15.1 |

十一份固定投影路径为：`catalog/items-medicine.md`、`items-food.md`、`items-manuals.md`、`items-weapons.md`、`items-clothing.md`、`items-armor.md`、`items-innerarmor.md`、`items-accessories.md`、`items-shoes.md`、`items-belts.md`、`items-hidden-weapons.md`（均相对 `docs/design/`）。`tech/04` §2.5 的运行时 ID 注册表由内容定义扫描生成，**不是可手改文件**；因此本轮在下表登记全部新 ID，构建时再生成 `SymbolEntry`。

### 14.2 ID 清单

| 类别 | ID |
|---|---|
| 神兵（基准已有） | `eq_yitianjian` `eq_tulongdao` `eq_xuantiejian` `eq_dagoubang` `eq_ruanweijia` `eq_shenghuoling` `eq_jinshejian` `eq_bishou` `eq_baoyi` `eq_wucanyi` `eq_yuanyangdao` `eq_lengyuedao` |
| 神兵专属特效 | `ue_<上列拼音>_1`、`ue_<上列拼音>_2`（24 条） |
| 名器（47） | `eq_ezuijian` `eq_eweibian` `eq_duanyanqingzhang` `eq_baituoshezhang` `eq_yuxiao` `eq_duling` `eq_kezhenezhang` `eq_jindao` `eq_jiuhulu` `eq_junzijian` `eq_shunvjian` `eq_jinlun` `eq_ziweiruanjian` `eq_dugulijian` `eq_dugumujian` `eq_jinlingsuo` `eq_fuchen` `eq_bingpoyinzhen` `eq_yufengzhen` `eq_jindaoheijian` `eq_jinchu` `eq_huoduzheshan` `eq_yingoutiehua` `eq_luzhang` `eq_hebi` `eq_qiankunyiqidai` `eq_tiezhihuan` `eq_wenxuzhen` `eq_xiuhuazhen` `eq_qixianqin` `eq_tubiwengbi` `eq_xuantieqipan` `eq_xuansushuangjian` `eq_jinshezhui` `eq_hetieshougou` `eq_jinsibeixin` `eq_huangmagua` `eq_luochaduanchong` `eq_xuedao` `eq_changchangfengshibei` `eq_ningbijian` `eq_jindi` `eq_tiedan` `eq_huoqingtongduanjian` `eq_furongjinzhen` `eq_tayunlv` `eq_kongqueling`（专属 `ue_<ID 拼音>_1`） |
| 装备基底（节选） | `eq_qinggangjian` `eq_songwenguijian` `eq_longquanjian` `eq_ruanjian` `eq_dandao` `eq_liuyedao` `eq_guitoudao` `eq_yanlingdao` `eq_podao` `eq_qimeigun` `eq_bailagan` `eq_chanzhang` `eq_tieguai` `eq_huaqiang` `eq_changqiang` `eq_shemao` `eq_daji` `eq_ruanbian` `eq_changsuo` `eq_sanjiegun` `eq_lianziqiang` `eq_duanbi` `eq_tiezhihu` `eq_lupiquantao` `eq_tieshou` `eq_buyi` `eq_jinzhuang` `eq_daopao` `eq_sengyi` `eq_yexingyi` `eq_pijia` `eq_ruanjia` `eq_suozibeixin` `eq_tiejia` `eq_linjia` `eq_mianjia` `eq_futou` `eq_shamao` `eq_guapimao` `eq_wandao` `eq_anqinang` |
| 词条（78） | A：`af_fengrui` `af_yunjin` `af_zhunxin` `af_huixin` `af_shichen` `af_pozhao` `af_toujia` `af_shayi` `af_lianhuan` `af_yinxue` `af_jinei` `af_jushi` `af_renxue` `af_jingzhun`；B：`af_kejian` `af_kedao` `af_keqiang` `af_kebian` `af_kesuo` `af_kezhang` `af_keanqi` `af_keqi`；C：`af_pojiaji` `af_fangxue` `af_zhizu` `af_sangongji` `af_zhenshe` `af_hanfeng` `af_banzu`；D：`af_jianjia` `af_hunyuan` `af_tipo` `af_qihai` `af_lingdong` `af_jiage` `af_renxing` `af_xieli` `af_huti` `af_fanzhen` `af_huichun` `af_tiaoxi` `af_shouyi` `af_huoluo` `af_sici`；E：`af_bidu` `af_bigu` `af_huxue` `af_guben` `af_yuhan` `af_bihuo` `af_dingxin` `af_wenzhong`；F：`af_qingshen` `af_jixing` `af_zhuifeng` `af_tengyue` `af_naili` `af_xianji`；G：`af_ningshen` `af_jienei` `af_miaoshou`；H：`af_gengu` `af_bili` `af_shenfa` `af_wuxing` `af_dingli` `af_fuyuan` `af_meili`；I：`af_yili` `af_dujing` `af_jiedu` `af_jiangxin` `af_danxin` `af_qimen` `af_yinlv` `af_shuhua` `af_qili` `af_qiaoshe` |
| 铭文（12） | `ins_menpai` `ins_xiadazhe` `ins_taqiang` `ins_zhongjian` `ins_kanglong` `ins_renzhe` `ins_shibu` `ins_wenshijian` `ins_xiaoao` `ins_feixue` `ins_minghao` `ins_qihun` |
| 丹药与消耗品（56） | A：`it_jinchuangyao` `it_huoxuewan` `it_buqidan` `it_xiaohuandan` `it_tianqishadansan` `it_huxindan` `it_yufengjiang` `it_baiyunxiongdanwan` `it_tianxiangduanxujiao` `it_yudongheishidan` `it_tianwangbaomingdan` `it_qiannianrenshen` `it_dahuandan` `it_jiuhuayulu` `it_heiyuduanxugao` `it_xumingbawan` `it_tianshanxuelian` `it_jiuzhuanhuanhundan`；B：`it_xingjiutang` `it_xionghuangjiu` `it_bidudan` `it_jieduwan` `it_nuanyangdan` `it_shixiangruanjinsan_jieyao` `it_beisuqingfeng_jieyao` `it_dingshendan` `it_shengsifu_zhentongwan` `it_baotai_jieyao` `it_sanshi_jieyao` `it_jueqingdan`；C：`it_daliwan` `it_jiuzhuandan` `it_guijiadan` `it_yingmusan` `it_shenxingdan` `it_qingshendan` `it_dingxinwan`；D：`it_mangguzhuha` `it_pusiqushedan` `it_shengshengzaohuadan` `it_tongxidilongwan` `it_baoshexue` `it_labazhou` `it_xuanbingbihuojiu`；毒迷：`it_shihuifen` `it_menghanyao` `it_mixiang` `it_duanchangcao` `it_huashifen` `it_shixiangruanjinsan` `it_qixinhaitang` `it_beisuqingfeng` `it_baotaiyijinwan` `it_jinboxunhua` `it_sanshinaoshendan`；终局：`it_shuyedan` |
| 暗器弹药（9） | `it_feihuangshi` `it_jinqianbiao` `it_xiujian` `it_tiejili` `it_sangmending` `it_feidao` `it_duzhen` `it_touguding` `it_meihuazhen` |
| 菜肴与酒（16） | `it_jiaohuaji` `it_yudishuijiatingluomei` `it_haoqiutang` `it_ershisiqiaomingyueye` `it_mantou` `it_jiachangfan` `it_jiangniurou` `it_lingjiaogeng` `it_kaoquanyang` `it_yushan` `it_nverhong` `it_manaijiu` `it_fenjiu` `it_putaojiu` `it_zhuangyuanhong`（`it_labazhou` 见上） |
| 秘籍与奇书 | `it_miji_jiuyin_shang` `it_miji_jiuyin_xia`；共享载体 `it_miji_jingzhouguanfuqinfa` `it_miji_jingzhouyangqigong` `it_miji_huahuixinfa` `it_miji_walalizhi` `it_miji_majiajunfeizhen` `it_miji_cangfengxingqi` `it_miji_cuomaifanzhang`；康熙册正式登记 `it_miji_ningxue_can`、`it_miji_shenzhao_can`、`it_canye_xuedaojing`（§10.1.2） |
| 历史图鉴秘籍／残页（30） | 少林 6 本／1 种、五绝 16 本／2 种、逍遥 3 本／2 种；30 个复用 ID 逐条定义见 §10.1.3、§10.3.2，无新增 ID 或同名别名 |
| AR-20 秘籍缺口补录（12） | 黄：`it_miji_luohanquan` `it_miji_taizuchangquan`；玄：`it_miji_quanzhenxinfa` `it_miji_liangyixinfa`；地：`it_miji_longzhaoshou` `it_miji_tongguijian` `it_miji_chilianshenzhang_can` `it_miji_bingpoyinzhen` `it_miji_chunyangwuji` `it_miji_huzhaojuehushou` `it_miji_wujixuangongquan` `it_miji_shenmen13`。均复用图鉴已声明的 `manual` ID，物品载体为**（原创扩展）**；字段与来源仍按对应技能图鉴 |
| AR-20 药物／补品／药材新增（19） | 药物：`it_wuchangdan` `it_fulingshouwuwan` `it_xueshenyuchanwan` `it_yulongsuheisan` `it_bilingdan` `it_tianyishenshui`；补品：`it_yangjingwan` `it_bailucao` `it_zixiaoyangqidan` `it_tiansuixuminglu`；药材：`it_renshen` `it_shinianrenshen` `it_bainianrenshen` `it_xueshen` `it_shinianxueshen` `it_bainianxueshen` `it_qiannianxueshen` `it_qiannianlingzhi` `it_qiannianxuelian`。后两项分别取梁羽生、古龙作品；新增玩法与未见于原著的形制均**（原创扩展）** |
| AR-28 药材扩张（64） | `it_aiye`～`it_zhujingbingchan`，完整有序清单：`it_aiye` `it_bohe` `it_yuxingcao` `it_pugongying` `it_zisunye` `it_yimucao` `it_xianhecao` `it_huoxiang` `it_jingjie` `it_huangqi` `it_danggui` `it_gancao` `it_gegen` `it_jiegeng` `it_ganjiang` `it_jinyinhua` `it_gouqizi` `it_dazao` `it_juhua` `it_lianqiao` `it_cheqianzi` `it_fuling` `it_zhuling` `it_haizao` `it_dilong` `it_shigao` `it_qinghao` `it_mahuang` `it_shihu` `it_baizhu` `it_dangshen` `it_chuanxiong` `it_danshen` `it_chaihu` `it_chuanbeimu` `it_tianma` `it_huanglian` `it_huangqin` `it_banxia` `it_sanqi` `it_wuweizi` `it_lingzhi` `it_lurong` `it_longgu` `it_zhusha` `it_xionghuang` `it_mantuoluo` `it_qinghua` `it_qixinhaitang` `it_duanchangshigufuxincao` `it_jinboxunhua` `it_heshouwu` `it_wutou` `it_maqianzi` `it_dongchongxiacao` `it_shexiang` `it_xiongdan` `it_niuhuang` `it_xijiao` `it_pusiqushedan` `it_chansu` `it_mangguzhuha` `it_bingcan` `it_zhujingbingchan`。其中复用既有 5 个 ID，新建 59 个；字段 / 外观见 `catalog/items-medicine.md`，逐味分布见 `catalog/gather-herbs.md` |
| AR-20 食材／食品新增（20） | 食材：`it_jingmi` `it_huotuijian` `it_xianyu` `it_cumian` `it_xuelianzi` `it_yuxueguo` `it_xianggu` `it_longganfengsui` `it_binghuxueou` `it_xueshanlufu` `it_tianshanlingmi` `it_baihualinglu`；食品：`it_ganliang` `it_guisugao` `it_niurougan` `it_furonggao` `it_baihuagao` `it_yuluwan` `it_xueyulengchan` `it_tianxiangyulu`。除明确书名来源者外均**（原创扩展）** |
| AR-23 食材／食品扩张（146） | 食材：`it_zhurou` `it_niurou` `it_yangrou` `it_jirou` `it_yarou` `it_erou` `it_lvrou` `it_marou` `it_gourou` `it_turou` `it_gerou` `it_anchunrou` `it_zhudu` `it_yangweizhi` `it_xianlurou` `it_xiongzhang` `it_tuofeng` `it_xingchun` `it_baotai` `it_shiyu` `it_hetun` `it_huajiao` `it_haishen` `it_baoyu` `it_yanwo` `it_yuchi` `it_xueha` `it_xiongbai` `it_jiangxia` `it_heli` `it_hanshui_qingyu` `it_taihu_yinyu` `it_huxie` `it_haiyu` `it_haili` `it_huangyu` `it_jiangyaozhu` `it_lianou` `it_qingcai` `it_baicai` `it_jiucai` `it_qincai` `it_cong` `it_shengjiang` `it_luobo` `it_qiezi` `it_donggua` `it_chunsun` `it_juecai` `it_muer` `it_doufu` `it_lajiao` `it_fanshu` `it_yumi` `it_xiaomi` `it_gaoliang` `it_qiaomai` `it_dadou` `it_lvdou` `it_chidou` `it_hongzao` `it_li` `it_tao` `it_xing` `it_putao` `it_shiliu` `it_lizhi` `it_hutao` `it_yan` `it_jiangzhi` `it_micu` `it_huajiao_xiangliao` `it_shizhuyu` `it_hujiao` `it_zhetang` `it_jiuzao` `it_douchi`；食品：`it_hubing` `it_zhengbing` `it_zhimashaobing` `it_nangbing` `it_qingkezanba` `it_naigan` `it_songhelou_xiaren` `it_guokui` `it_huiyanlou_huncai` `it_shaolin_sumian` `it_dingshenggao` `it_guangmingding_suxian_yuanbing` `it_yuebing` `it_hengshan_qingcaidoufu` `it_meigui_subing` `it_suyoubing` `it_jinyinmantou` `it_xianrou` `it_larou` `it_banya` `it_zaoyu` `it_furu` `it_sunzha` `it_fenggan_yangrou` `it_mizi_jinju` `it_tangshuangtaotiao` `it_huayuan_gaobing` `it_aqing_qingcha` `it_muwu_gancaifan` `it_liaoying_yangrou` `it_dali_qingming_chadian` `it_qingshui_yufeng_mijiang` `it_qingcai_doufu_xiaoyufan` `it_hanshui_siwan_fancai` `it_binghuodao_kaoxiongrou` `it_fuzhou_yeji_huangtu` `it_hengshan_suxianzong` `it_xiakedao_siyang_dianxin` `it_houjianji_shaobing` `it_huashan_qingcai_doufufan` `it_wenjia_huotui_larouyan` `it_zhayangwei` `it_milian_huotui` `it_yangzhou_tangbao_changyumian` `it_pomiao_shutang` `it_yuzhou_fanshu_caomifan` `it_naiyou_recha` `it_yangrulao` `it_xiaofu_shoujiuxi` `it_huodui_kaozhangji` `it_huibu_zhuafan_kaorou` `it_xuedi_kaohuangyang` `it_honghuahui_zongduo_yanxi` `it_chenglingsu_sancai_yitang` `it_miaojia_huofan_sancai` `it_humiao_mantou_jiyangtui` `it_dianchi_shurou_shaoji` `it_xieniangcheng` `it_shanhaidou` `it_dongporou` `it_shanyaozhou` `it_heliandouzi` `it_tuanyutang` `it_shanjia_sancui` `it_lubeiji` `it_wangtaishou_babaodoufu` `it_jiangshilang_doufu` `it_shaoxiaozhu` `it_yanwojisitang`。规则与外观见 `catalog/items-food.md`；数值及无定本形制均**（原创扩展）** |
| AR-20 天级食品补录 | `it_tianxiangyuyan` 天香御宴：`food/feast`、天下 10、固定御膳奇遇、`flags:[uniqueBatch]`；整套菜式、效果与外观均**（原创扩展）** |
| AR-20 衣物补录（5，另复用乌蚕衣） | `eq_taohuajinpao` `eq_xiyuhufu` `eq_yunjinhechang`（地上 9）；`eq_tianchanbaoyi` `eq_zixiaqingyi`（天下 10、`catalogTian`）；另复用神兵宝甲 `eq_wucanyi`。新增五件均为**（原创扩展）** |
| AR-20 制式盔甲（8） | `eq_songxunyijia` `eq_qingzaolijia`（黄上 3）；`eq_yuanqibingjia` `eq_mingweisuojia`（玄上 6）；`eq_songjinjunburenjia` `eq_mingjinyiweijia`（地上 9）；`eq_yuansuweiqiejia` `eq_qingyulinjia`（天下 10、`catalogTian`）。均为**（原创扩展）**并必填 `lawProfile` |
| AR-20 内甲（6 新 + 2 复用） | 新：`eq_zhusutiejia` `eq_pirutiejia` `eq_ruansijia` `eq_jinsijia` `eq_xuansuoruanjia` `eq_tianchansiruanjia`；复用 `eq_jinsibeixin` `eq_ruanweijia`。新条目均为**（原创扩展）** |
| AR-20 护肩／披风／头饰（12） | `eq_pijian` `eq_bumianpifeng` `eq_qingjin` `eq_linpijian` `eq_wuyepifeng` `eq_baiyuguan` `eq_xuantiepijian` `eq_heyudachang` `eq_zijinfaguan` `eq_longlinpijian` `eq_tianfengpifeng` `eq_qixingbaoguan`。均为**（原创扩展）** |
| AR-20 鞋（7 新 + 1 复用） | 新：`eq_caoxie` `eq_bukuaixue` `eq_qingyunlv` `eq_feiyuxue` `eq_xuexingxue` `eq_wuyinglv` `eq_tianmalv`；复用 `eq_tayunlv`。新条目均为**（原创扩展）** |
| AR-20 腰带（8） | `eq_mayaodai` `eq_pihudai` `eq_qingyudai` `eq_baonadai` `eq_xuantiedai` `eq_yunlongyudai` `eq_qiankundaidai` `eq_tianchanyaodai`。均为**（原创扩展）** |
| AR-25 衣物扩张（18） | `eq_jinzhizhisunpao_nan` `eq_mingjinmamianqun_nv` `eq_songziluogongpao_nan` `eq_qingqizhuangjifu_nv` `eq_liaodiaoqiupao_nan` `eq_mingzhijinbijia_nv` `eq_mingqingyesa_nan` `eq_dalibaiduanqun_nv` `eq_jinchunshuipanlingpao_nan` `eq_songluobeizi_nv` `eq_qinglanmagua_nan` `eq_xixiazhaiheshan_nv` `eq_songqingyuanlingpao_nan` `eq_mingbuaoqun_nv` `eq_huijiangjiapan_nan` `eq_qinghanvjiaao_nv` `eq_zangdicuobu_nan` `eq_songmabuduanru_nv`。地／玄／黄各上中下 × 男女完整覆盖，均为**（原创扩展）** |
| AR-25 披风 / 头饰扩张（36） | 披风：`eq_qingxuanhuyuduandoupeng_nan` `eq_mingyunjinhechang_nv` `eq_yuanzhijinzhanshidoupeng_nan` `eq_qingdiaoqiufengchang_nv` `eq_liaoyinshupi_nan` `eq_dalijinxiupeibo_nv` `eq_mingqingduandachang_nan` `eq_qingyuduanpifeng_nv` `eq_jinhubianpifeng_nan` `eq_songluoshahechang_nv` `eq_yuanmengguzhanpi_nan` `eq_huijiangnihuaipi_nv` `eq_mingmianbupifeng_nan` `eq_mingshuitianpi_nv` `eq_xixiacuzhanpi_nan` `eq_songyoujuanyupi_nv` `eq_songzonglvsuoyi_nan` `eq_qingqingbufengpi_nv`；头饰：`eq_songzhijiaofutou_nan` `eq_yuanguguquan_nv` `eq_mingzhongjingguan_nan` `eq_qingzhenzhudiantzi_nv` `eq_yuanqibaolimao_nan` `eq_songjinhuaguan_nv` `eq_mingdongpojin_nan` `eq_dalijinhuaguan_nv` `eq_jinzaoluojin_nan` `eq_mingyudiebuyao_nv` `eq_qinghongyingnuanmao_nan` `eq_songziluogaitou_nv` `eq_mingwushafangjin_nan` `eq_qingbaobu_nv` `eq_menggubailimao_nan` `eq_xixiaxiaotuanguan_nv` `eq_songmabufujin_nan` `eq_huijianghuatoujin_nv`。两类各自完整覆盖 18 格，均为**（原创扩展）** |
| AR-25 腰带扩张（18） | `eq_jinchunshuiyutuhu_nan` `eq_minghoufeijindadai_nv` `eq_mingbaiyutingdai_nan` `eq_yuanhongjinyaodai_nv` `eq_liaoyudiexiedai_nan` `eq_qingxiuhuahebaodai_nv` `eq_songdujinaomiandai_nan` `eq_songyuhuanxiu_nv` `eq_yuanshutongkuaodai_nan` `eq_daliyinkoujindai_nv` `eq_qinggedaihebao_nan` `eq_mingqingjintaosheng_nv` `eq_jintongkuatuhu_nan` `eq_qinghannvsichou_nv` `eq_huijianghongbudai_nan` `eq_xixiaxiubianbodai_nv` `eq_songmabutaosheng_nan` `eq_songsubodai_nv`。完整覆盖 18 格，均为**（原创扩展）** |
| AR-25 鞋扩张（18） | `eq_qingxuanduanchaoxue_nan` `eq_mingzhijinxiuhuagongxie_nv` `eq_yuanchijinpiqixue_nan` `eq_qingjinxiuhuapendixie_nv` `eq_liaowupiqixue_nan` `eq_songjinxiuyuntoulv_nv` `eq_mingzaopixue_nan` `eq_dalijingxiulv_nv` `eq_zangdihougechangxue_nan` `eq_yuanhongzhanxue_nv` `eq_qingqingduanxingxue_nan` `eq_huijiangxiubianpixue_nv` `eq_jinwupixue_nan` `eq_xixiayuanlvgongxie_nv` `eq_mengguyangmaozhanxue_nan` `eq_songqingbuyuantoulv_nv` `eq_songmabuxie_nan` `eq_mingmianbuhualv_nv`。完整覆盖 18 格；轻功值均按 `2.5 × grade`，均为**（原创扩展）** |
| AR-20 兵器补录（4） | `eq_biyudao` 碧玉刀、`eq_libiegou` 离别钩、`eq_liehuoqi` 烈火旗（地上 9）、`eq_bawangqiang` 霸王枪（天下 10、`catalogTian`）；前二与霸王枪取古龙作品名物，烈火旗取《倚天屠龙记》明教五行旗且用途**（待考）**，玩法与形制均**（原创扩展）** |
| AR-20 暗器补录（4） | `eq_hanshasheying` 含沙射影（玄上 6，《碧血剑》五毒教归属**（待考）**）、`eq_heixueshenzhen` 黑血神针（地上 9，《笑傲江湖》曲洋；淬毒与器物细节**（待考）**）、`eq_xiaolifeidao` 小李飞刀、`eq_baoyulihuading` 暴雨梨花钉（天下 10、`catalogTian`；古龙《楚留香传奇》，具体篇目与构造**（待考）**）；玩法与形制均**（原创扩展）** |
| AR-24 兵器扩张（54） | 通用制式新 ID（28）：`eq_songzhijian` `eq_mingyaojian` `eq_qingzhijian` `eq_minggangjian` `eq_songshoudao` `eq_mazhadao` `eq_mingyanlingyaodao` `eq_niuweidao` `eq_songbuqiang` `eq_huanziqiang` `eq_yuanmengqiqiang` `eq_mingchangqiang` `eq_lihuaqiang` `eq_songshaobang` `eq_qimeiyinggun` `eq_yuanmengmabang` `eq_tiehuanchanzhang` `eq_sutieduanbi` `eq_duanbingmuchui` `eq_panguanbi` `eq_songduanfu` `eq_sangujiecha` `eq_hushoushuanggou` `eq_zhugutieshan` `eq_qingtonghengdi` `eq_liuxingchui` `eq_tieguzhanqi` `eq_bintiejiangmochu`；矩阵另复用已登记基底 9 件，不计本行 N。天地名器（6）：`eq_zhenwujian` `eq_modahuqinjian` `eq_bishuijian` `eq_lvboxiangludao` `eq_jinyinxiaojian` `eq_yuyincha`；门派法器（20）：`eq_shaolinhusixizhang` `eq_emeijiejian` `eq_hengshanbeijiejian` `eq_daizongfajian` `eq_songyangkuojian` `eq_quanzhenfajian` `eq_gaibangzhubang` `eq_xiaoyaoyubingfuchen` `eq_duanshihushenjian` `eq_tianlongsijiedao` `eq_murongcangfengjian` `eq_tiezhangkaishanfu` `eq_kongtongshuangou` `eq_kunlunliangyijian` `eq_qingchengsongfengjian` `eq_tiandihuiduandao` `eq_honghuahuichangjian` `eq_lingxiaochangjian` `eq_shenquantiehutao` `eq_changlegangdao`。全部形制 / 数值与非原著器名为**（原创扩展）**；待考边界见对应名录 |
| AR-24 暗器扩张（8） | 通用装备本体：`eq_feishinang` `eq_feibiaonang` `eq_tonghuangxiujian` `eq_lianzhudangong` `eq_feidaoxia` `eq_lianfaxiunu`；具名装备：`eq_zaohedingxia` `eq_sanxiaosanxia`。只收副手本体 / 囊匣，不重造九种 `it_*` 弹药；全部装备化、弹量、数值与形制为**（原创扩展）** |
| 白马固定遗物 | `it_gaochangyibao`：地上 9 非战斗奇物，定义见 §11.3；不复用 `it_gaochangguwu` |
| 具名天材 | `it_bingcansi` |
| 跨年代传承残本（117） | `frag_*` 全量逐项见 §10.3.1；均为 `manual/partial`、`unique/legacyCarry`，物品本体由本文定义，来源与校合语义引用 20 |
| 工具、信物、钥匙、奇物、坐骑、收藏品 | `it_feizhua`；`it_xuantieling` `it_shangshanfaepai` `it_heimuling` `it_wuyuelingqi` `it_jinpen` `it_sishierzhangjing_<1..8>` `it_langpi` `it_gaochangditu` `it_chuangwangjundao` `it_wulongling`；`it_shenmuwangding` `it_bingcan` `it_shandiandiao` `it_yufengchao`；`it_maolv` `it_numa` `it_chuanma` `it_luotuo` `it_mengguma` `it_dawanma` `it_baima` `it_xiaohongma` `it_baidiao`；`it_guanglingsan` `it_xiaoaoqupu` `it_ouxuepu` `it_shuaiyitie` `it_xishanxinglvtu` `it_zhenlongqiju` `it_wuyazihuajuan` `it_shiketapian` `it_zuqianqiujiubei` `it_gaochangguwu` |
| 跨年代关键信物（39） | `it_xinwu_*` 全量逐项见 §11.2.1；均为 `token/keyToken`，物品本体由本文定义，传承语义引用 20 |
| 系统（已确认） | `it_tianshu_01`…`it_tianshu_14`（天书，13 §4.1 T10 已确认）；可选事件 `ev_04_daojianhuzhuo`（刀剑互斫）及其产物 `eq_yitianduanjian` `eq_tulongduandao`；chapters/04 必须并列提供保全两件神兵的等价取经路线（P20） |
| 配方学识（示例） | `rc_jinchuangyao` `rc_xiaohuandan` `rc_baiyunxiongdanwan` `rc_jiuhuayulu` `rc_heiyuduanxugao` `rc_menghanyao` `rc_jiaohuaji` `rc_yudishuijiatingluomei` `rc_haoqiutang` `rc_ershisiqiaomingyueye` |
| 大还丹正式配方 | `rc_dahuandan`：`RecipeDef`，输出既有 `it_dahuandan`、`craftGrade:9`；伤科 7 重且炼丹 40 解锁，实际制作炼丹 68；完整定义见 §8.7.1 |
| 套装装备成员（归 07） | `set_yitian_emei`；v1 唯一装备成员为 `eq_yitianjian`，其余装备不写 `setTags` |

---

## 15. 数据校验规则与测试用例

### 15.1 构建期校验（Zod + 自定义规则，tech/04 管线）

| # | 规则 | 级别 |
|---|---|---|
| V1 | `eq_*` ↔ 装备类 `kind`；`it_*` ↔ 非装备；`af_`/`ue_`/`ins_`/`rc_` 全局唯一 | 错误 |
| V2 | 品阶 10–12 的装备只能是：①基准 §14 的 12 件且 `divine:true`；或 ②AR-20 名录注册的 `catalogTian:true` 固定样本。两类互斥；后者必为 `divine:false`、`unique`、`price:null`，且不进随机、锻造、商店、天材骰 | 错误 |
| V3 | 随机基底 `gradeRange` 与锻造图谱品阶上限 ≤ 9 | 错误 |
| V4 | 神兵固定词条：天下 3、天中/天上 4；名器：地上 3、地中 2–3、地下 2、玄阶 1–2 | 错误 |
| V5 | 每个 `af_*` 标注作用位置（06 §4.7 记法）；按 g12、q = 1 计算的数值 ≤ 所在族上限 × 20% | 错误 / 警告 |
| V6 | 神兵 `uniques` 恰 2 条，其中 `core: true` 恰 1 条；`lowTier` 必填 | 错误 |
| V7 | 引用的 `bf_*` 存在于 06；`sk_*` 存在于 05/catalog；`set_*` 存在于 07（建议 ID 仅告警） | 错误 / 警告 |
| V8 | `origin: canon`/`canonExpanded` 必须有 `canonRef`；含"待考"进入考据清单 | 警告 |
| V9 | 永久增益物品的每书界投放合计 ≤ §8.5 表；`breakCap` 物品每书界 ≤ 1 | 错误 |
| V10 | 天级丹药、天材只出现在高武书界的固定节点或天材骰表 | 错误 |
| V11 | `price: auto` 必有 `grade`；`price: null` 的物品不得出现在商店表 | 错误 |
| V12 | 商店供货品阶 ≤ §13.4 | 错误 |
| V13 | `hands: 2` 的兵器不得声明副兵器联动；`pair` 兵器必须声明副手外观 | 错误 |
| V14 | `cat: exotic` 必填 `exoticKind`；名门暗器与弹药必填 `hiddenKind` | 错误 |
| V15 | `signature` 引用的 NPC 存在于 chapters/ | 警告 |
| V16 | `bf_weici`、`bf_daoqiang` 的**原生目录** `gradeRange` 必须为 `[4,12]`；运行时由压制/削品产生的 1–3 品实例允许创建，但其封存与倍率必须按 §7.3 计算 | 错误 |
| V17 | 普通鞋类 `absGrade ≤ 9`；AR-20 天级鞋必须在名录注册且满足 V2 的 `catalogTian` 约束。所有鞋 `qinggong = 2.5 × gUse`，不得乘 `R` | 错误 |
| V18 | 书眠结算满足 `carryEquipCount + newArchiveEquipCount ≤ 6`，成对兵器计 1、天书不计入该额度 | 错误 |
| V19 | `material` 必填 `resourceRef` 与 `materialGrade`；资源等级只接受天地玄黄 × 一至九品，且一品最高 | 错误 |
| V20 | `meridianAid` 五字段形状合法、三项 bp 为非负整数、`hours ≥ 1`，`meridians` 只引用 15 的正式 ID；药物不得直接修改穴道进度或成功结果 | 错误 |
| V21 | `legacyCarry/keyToken` 只能引用 20 的正式登记；普通残页、残本与信物不得据名称猜测跨界；合成事务必须全有或全无 | 错误 |
| V21a | §10.3.1 必须恰有 117 个唯一 `frag_*`；20 的 39 个 `lgs_*` 各闭合 `upper/middle/lower` 三卷且无跨源复用；每卷品阶必须等于 20 §1.5 的 `fragmentGrade(g)` | 错误 |
| V22 | `it_tianshu_01`…`14` 完整且不存在 15；`it_shuyedan` 仅在终局掉落表出现，离开终局清除 | 错误 |
| V23 | `recipeMastery[rc_*]` 仅取 0–10；0 / 未学不得烹饪，已学至少为 1；烹饪事务不得读取 `alchemy` 或不存在的全局 `cook` | 错误 |
| V24 | 新装备内容不得写已迁移的缠绕 / 封穴 ID；`bf_shouqin` 必须有 `level∈[1,9]`，`bf_xueweishoufeng` 另必须有合法 `targetAcupoint`；运行时 `source` 为实际命中者且 `remainingOwnActions=turnsLeft`。模块派生视图不得由装备 `applyBuff`，护体投影不得由无合法路线的装备创建 | 错误 |
| V25 | `eq_changchangfengshibei` 保持 `kind:offhand/sub:shield/slot:offHand`，兼容介质恰为 `exotic/misc`；只有武学侧 `weaponReq.altItems` 明列本 ID 才可匹配，且不得重复结算牌与兵器主属性 | 错误 |
| V26 | §10.1.1 七条 `manual` 各只有一个 `skill` 且引用存在；每条 `sub` 与 `variant` 相等并属于 `full/partial/copy/original`；品阶等于目标武学绝对品阶，组内 `maxLayer` 分别为衙门 `10/10`、华辉 `8/8/8`、宝树 `8/8`；三组取得事务全有或全无 | 错误 |
| V27 | §10.1.2 三项只能按正式 ID 生成；两秘籍上限 8／6；血刀 `pagesTotal=6` 且该路径只投四个唯一页号，重复事件不补页。旧两条秘籍名称仅作迁移记录 | 错误 |
| V28 | `it_gaochangyibao` 与 `it_gaochangguwu` 类型／品阶／选择后果分离；已封藏不能补发，不能通过赠予、藏史、合成绕过永久放弃 | 错误 |
| V29 | 同一装备修饰须含稳定 `modifierId`；去重键为 `(sourceType,sourceId,modifierId)`，两个不同属性不能覆盖 | 错误 |
| V30 | 冰蚕丝为 `material/fabric`、`materialGrade=10`、`resourceRef=res_sicha_tian9`；不能从普通丝茶库存或奇物冰蚕转换产出，也不得进入商店 | 错误 |
| V31 | §10.1.3 的 25 本须逐条校验 `skill/grade/chapters/variant/maxLayer`；§10.3.2 的 5 种按地 6／玄 4 页校验；来源前置、倚天排除与师授／秘籍上限不得相互覆盖。大手印旧 6 页字段不能作为新物品版本并存 | 错误 |
| V32 | `rc_dahuandan.output=it_dahuandan`、`craftGrade=9`；首次解锁须同时满足伤科 ≥7 重与炼丹 ≥40，制作须已学方且炼丹 ≥68、合法丹炉及 §8.7.1 四份材料。两套门槛不得互换；学识跨界保留，产量不能改变单炉材料用量 | 错误 |
| V33 | `householdMeal` 仅映射 §9.3.1 的 `it_jiachangfan`，固定 `dish/dish/grade:1/stack:20`；仅实际烹饪失败每批发 1 份，不能由前置拒绝发放或沿用成功成品品阶。使用仅回复向下取整且封顶的 10% 体力，不生成／替换膳食，不可战斗使用或跨书眠携带 | 错误 |
| V34 | 十一份 `catalog/items-*.md` 每行恰为七列；ID 全局唯一且仅 `it_`／`eq_`；品阶只取天地玄黄，且效果字段 `grade=N` 必须同阶（1–3 黄／4–6 玄／7–9 地／10–12 天）；出处、效果、外观非空；每个 ID 必须在 §14.2 注册 | 错误 |
| V35 | `ageYears` 普通／十年／百年／千年分别满足 `<10`／`10..99`／`100..999`／`>=1000` 且大阶不降；同一 `herbFamily` 年限增大时品阶不得降低 | 错误 |
| V36 | 制式盔甲必填完整 `lawProfile`；穿戴暴露事件只含 §3.4.1 六字段。`equip-slots.v1→v2` 迁移后三个新槽存在，软猬甲／金丝背心恰在 `innerBody` 且实例总数不变 | 错误 |

### 15.2 金标准测试用例（玩法核心单元测试）

| # | 场景 | 输入 | 期望 |
|---|---|---|---|
| T1 | 主属性 | 地中剑，Ld 50，+0 | `atkOut += 0.30 × 2.2 × 1,216.4 = 802.8`（与 03 §11.2 示例 803 一致） |
| T2 | 等级封顶 | 打狗棒（天中 11），Ld 30 | `gCap = 10` → `gUse = 10`；`Ld < reqLv(11) = 35` → 专属全部封存；神兵护主存在（`gUse ≥ 10`） |
| T3 | 外来压制 | 倚天剑 +10 带入连城（Ld 46） | `gUse 8`；`R = 1.32`；`atkOut` 899；生效词条 3；只保留①，概率 20%；无护主 |
| T4 | 强化失败 | +7→+8，`forge_eff 52`，`P = 0.50`，判定失败 | 仍 +7；返还 1 份材料（3 份的一半向下取整）；`refineFire = 15`；下次 `P = 0.65` |
| T5 | 稳炼 | 同 T4，选稳炼 | 消耗 `ceil(3 / 0.50) = 6` 份，必定成功 |
| T6 | 生成确定性 | 普通池、g8、固定种子 | 词条数 ∈ {2, 3}；同种子重复生成结果逐字段相同 |
| T7 | 佩饰 +1 | 普通池、g6 佩饰 | 词条数 3 |
| T8 | 成对计件 | 书眠携带鸳鸯刀 + 另 5 件 | 合法（计 6 件） |
| T9 | 淬毒 | `poi 60`，地下毒材 | `gc = min(7, gMax(60) = 8) = 7`；`P = 0.60 + 0.04 × (60 − 52) = 0.92` |
| T10 | 永久预算 | 高武书界服第 4 枚菩斯曲蛇胆 | 永久部分被拒，提示"药力已饱和" |
| T11 | C09 低品 Buff 实例 | 护身宝衣带入连城（`gUse 6`） | 直接挂 `bf_daoqiang(g6)`，核心倍率 ×0.5：兵器外劲条件减伤 `8% × G(6) × 0.5 = 8% × 1.7 × 0.5 = 6.8%`；不生成装备 `mods` 替身；宝衣护身封存 |
| T12 | 书眠清理 | 携带淬毒剑；背包丹药 30；银两 500 | 醒来：剑无淬毒；丹药 0；银两 0；学识与图鉴不变 |
| T13 | 名器专属 | 君子剑（主角）与淑女剑（羁绊 4 的队友），相距 2 格 | 双方 `Z3 +6%` |
| T14 | 藏史降阶 | 地下 7 护手 +7，藏 150 年后取回 | `absGrade 6`；大阶玄 → `refineEff 6`、`maxAffix 2`（多出词条封存） |
| T15 | 本地神兵对照 | 鹿鼎 Ld 44：原生匕首 +8 vs 外来倚天剑 +10 | 944 > 824（§7.4） |
| T16 | C10 天龙鞋门槛 | Lv35、`agi=73`、`apLight=55`、凌波微步绝对 11 品且有效 8 重、本土 8 品鞋、主运 8 品内功 8 重、临时轻功 +10 | `10.75 + 10.5 + 152×0.88 + 8.25 + 20 + 5.28 + 10 = 198.54 < 200`，仍为 qg4；强化鞋不改变结果 |
| T17 | C10 倚天鞋门槛 | Lv70、`agi=87`、`apLight=80`、9 品轻功 10 重、本土 9 品鞋、主运 12 品内功 10 重 | `14.25 + 21 + 120 + 12 + 22.5 + 10.5 = 200.25`，达到 qg5 |
| T18 | 书眠共同额度 | 已选携带 5 件，再新藏史 2 件；另持 1 本天书 | 拒绝第 2 件新藏史装备；`5 + 1 = 6` 合法，天书不占额度 |
| T19 | 坠崖掉落 | 普通敌人有 5 件非任务掉落、1 件任务钥匙，坠崖离场 | 任务钥匙必得；非任务掉落按稳定排序保留前 `ceil(5×50%) = 3` 件 |
| T20 | 名器典当 | 踏云履估值 1,000 两，在当前书界典当后书眠 | 当场得 300 两且可在本书界赎回；书眠后银两与赎回权一并清除 |
| T21 | 冲穴药物同源取高 | 同时有效：补气丹、九转丹、定神丹 | 药物槽为 `rate=800bp`、`success=600bp`、`costReduce=1000bp`；不是 `1300/900/1500`，再交 15 与其他来源加算 |
| T22 | 具名资源映射不替物 | 配方要求 `it_qixinhaitang`；库存只有同 `resourceRef=res_ducai_di5` 的通用毒材 | 不满足配方；只有具体 `it_qixinhaitang` 实例可消费 |
| T23 | 终局书页丹 | `hpMax=1001`、`mpMax=701`，各缺半；使用 `it_shuyedan` | 回复基值分别为 `floor(1001×0.30)=300`、`floor(701×0.30)=210`（再受各自上限/治疗修正）；本场再次使用被拒 |
| T24 | 菜谱熟练接口 | `recipeMastery[rc_jiaohuaji]=6`、主材 6 品、配方上限 9 | 按 `design/12` §10.4 结算返回 `gCook=7`、`Pcook=0.92`；不读取 `alchemy`，本文不复写上游公式 |
| T25 | 传承残本目录闭合 | 从 20 §9 枚举 39 个来源并与 §10.3.1 双向比较 | 恰为 `39×3=117` 个唯一 ID；每源卷位集合为 `{upper,middle,lower}`，品阶与 `fragmentGrade(g)` 相同，均为唯一、不可交易的 `manual/partial` |
| T26 | 装备经脉状态迁移 | 紫薇软剑、金铃索、鹤嘴双笔分别触发；命中者 U，目标主要路线关键穴 A | 原 12% / 8% / 10% 概率不变；软剑生成受擒 4 级、剩 2、`source=U`、`holdRange=1`；后两件均生成穴位受封 9 级、剩 1、`source=U`、`acupointRef=A` |
| T27 | 装备点穴无合法穴位 | 金铃索触发成功，但目标没有可解析的主要路线关键穴 | 只跳过穴位受封，不消耗额外 RNG、不创建旧状态、不伪造 `ap_*`；本次攻击其余伤害与效果照常 |
| T28 | 墓碑兼容 | 副手装备 `eq_changchangfengshibei`；武学分别为已明列 / 未明列本 ID 的 `exotic/misc` | 已明列者通过介质检查且只结算牌属性；未明列者仍不匹配，其他副手牌也不匹配 |
| T29 | 三组载体原子发放 | 分别触发衙门武册、华辉遗谱、宝树旧稿；模拟组内第二项写入失败 | 正常时分别得到 2 / 3 / 2 条独立秘籍；失败时该组得到 0 条且不写已领取标记；重复触发不补发、不转钱 |
| T30 | 康熙谱本与残页 | 读完两秘籍；按 `1/1/2` 取得四页血刀残页后重复清点 | 来源上限分别为 8、6、`ceil(40/6)=7`；无第 5／6 页，重复事件不发物、不增经验；亲授上限不受此降低 |
| T31 | 秘籍阅读式 | 悟性 50，地上 9，`GF=3.8` | 全本 `ceil(2×3.8×100/80)=10` 天；注本 `ceil(10×0.8)=8` 天 |
| T32 | 白马封藏 | 已取得普通 `it_gaochangguwu`，选择永久封藏 `it_gaochangyibao` | 普通古物照常保留；高阶遗物不生成，重复进入节点不补发；改命结果仍由章节五项条件决定 |
| T33 | 同装备多属性 | 同一护手来源有 `main:defOut` 与 `main:hpMax`，随后刷新 | 两属性同时存在；刷新替换同键而不叠加；不同键不会互相覆盖 |
| T34 | 历史秘籍与页数 | 鹿鼎铁布衫全本、侠客一指禅残本分别读满；天龙抽髓掌取得 4 页，大手印取得 3 页；尝试从倚天见闻生成大金刚拳残页 | 来源上限为 10、8、`ceil(40/6)=7`、`ceil(30/4)=8`；倚天生成失败；实际可用层数仍另受当界限制 |
| T35 | 大还丹配方解锁 | 尚未学方，依次测试伤科重数／炼丹为 `6/68`、`7/39`、`7/40` | 前两组不解锁；第三组获得 `rc_dahuandan`，但制作仍置灰；不发成药或配方卷 |
| T36 | 大还丹制作硬门槛 | 分别测试未学方但炼丹 68；已学方且炼丹 40／67；已学方且炼丹 68 但无丹炉／只有神木王鼎 | 均不可开炉，不扣材料、不发成药；不以 40 或伤科品阶代替制作门槛 68 |
| T37 | 大还丹制作核算 | 已学方、材料与丹炉齐备，炼丹依次 68、78、93，均判定成功 | 成功率分别 60%／100%／100%，产量分别 1／1／2 枚 `it_dahuandan`（地上 9）；每炉耗时 9 时辰、消耗 4 份材料 |
| T38 | 大还丹材料与失败 | 已学方、炼丹 68、丹炉齐备；主药仅 8 品，或库存仅 1 份 9 品＋2 份 7 品；另测合规材料齐备但判定失败 | 前两组因主药不足／缺药引拒绝，不重复占用辅药；失败组无成药，返还药材按 §8.7 通则，不降成药品阶 |
| T39 | 大还丹学识跨界 | 已解锁后书眠，伤科未携带，炼丹 68；新书界重新取得合规材料与丹炉 | `rc_dahuandan` 仍已学，允许制作且成功率 60%；不复查伤科 7 重，不保留上界成药或材料 |
| T40 | 家常饭失败映射 | 合法烹饪判定失败，原配方拟产地阶菜；另测缺食材前置拒绝 | 前者消耗原料、仅产 1 份黄下 `it_jiachangfan`，不发成功成品；后者不扣料、不发家常饭 |
| T41 | 家常饭回体封顶 | 战斗外 `staMax=147`，分别 `sta=100/142/147`，每次食用 1 份 | 分别回复 `14/5/0`，体力为 `114/147/147`；各耗 1 份与 0.5 时辰，气血／内力不因本物品改变 |
| T42 | 家常饭膳食边界 | 已有膳食时吃家常饭；另测战斗中使用 | 战斗外仅回体，既有膳食不被替换，无新 Buff 或开场收益；战斗中拒绝且不扣物品 |
| T43 | 家常饭库存与生命周期 | 同 ID 已堆 20 份且背包满、待拾队列为空，再烹饪失败；另测背包持有家常饭后书眠 | 新 1 份进入 §12.1 待拾队列，不丢失或改品阶；书眠清除实物，配方学识仍按 §12.3 保留 |
| T44 | AR-20 目录天级 | 加载 `eq_wuyinglv` 与基准神兵 `eq_yitianjian` | 前者仅 `catalogTian=true` 且无神兵护主／专属；后者仅 `divine=true` 且仍按 §5.1 生效；二者均不进入随机、商店或锻造 |
| T45 | 官甲身份暴露 | 无合法身份穿可见 `eq_mingjinyiweijia` 走正常城门，随后脱甲 | 穿戴时发六字段事件，12 判违法、11 激活通缉并阻止正常进城；脱甲不清除既有通缉 |
| T46 | 槽位迁移原子性 | v1 存档的 `body=eq_ruanweijia`，模拟写新槽后事务失败，再成功重试 | 失败时存档逐字段不变；成功时 `body=null`、`innerBody` 为原同一 `uid`，肩／披风为空，总实例数不变 |
| T47 | 年限分级 | 普通／10／100／1000 年人参，再尝试 100 年黄阶人参 | 前四项依次黄／玄／地／天；最后一项构建失败，不因名称或年限自动获得成药效果 |

---

## 16. 待决事项 / 依赖

### 16.1 替下游给出的建议值

| 编号 | 下游 | 建议值 / 接口 | 本文落点 |
|---|---|---|---|
| D-01 | design/03 | ① 确认主属性 `flatLv` 与 `kA`、`kD/kI`、`gCap` 接口；② 删除不存在的“天中鞋”，改用地上名器踏云履 `eq_tayunlv`，重算为天龙 188.54（临时 +10 后 198.54，仍 qg4）、倚天 200.25（qg5）；③ 佩饰固有沿用评级 `+2×g`、抗性 `+g pp` | §3.1、§4.1–4.3、T16–T17 |
| D-02 | design/04 | **已接收**：`ammoMul(g)=0.88+0.035g` 进入 Z1；`targetParryMult`/`noCrit` 进入 Z0；背击进入 Z7；外劲条件减伤先按 `wOut` 拆分再进 Z4 | §3.5、§4.1、§5.2；见 04 §11.3 |
| D-03 | design/05 | 奇门细类、`hands` 与 `HiddenKind`；特殊联动由对应武学声明 `altItems`；`sxpGrant` 档位黄/玄/地/天为 0.10/0.20/0.35/0.50。**已解决**：墓碑物品侧 `exotic/misc` 与康熙册 §9.6 `weaponReq.altItems` 双向闭合；秘籍阅读同步 05 §7.4 的 ×100；康熙三项谱本／残页正式 ID 已登记，图鉴／章节须迁移引用 | §3.2、§5.4、§8.2、§10.1.2、§10.2、V25／V27 |
| D-04 | design/06 | **已接收**：C09 的低品运行实例、`BuffRef` 覆写与 `ultimateUnbreakable`；并按 06 §8.14.3 将装备旧缠绕 / 封穴引用迁为受擒 4 级、穴位受封 9 级，保留原触发概率，补齐来源、持续、维持距离和穴位选择 | §2.6、§4.6、§5.2、§5.4、§7.3、§9.1、V16/V24、T11/T26–T27 |
| D-05 | design/07 | **已解决**：07 已定稿 44 套；装备侧只登记唯一正式成员 `eq_yitianjian.setTags=[set_yitian_emei]`。外来压制后按有效品阶算套装档；“天书铭”不改变件数 | §5.6、§14.2；与 `design/07` §13.3 双向闭合 |
| D-06 | design/09 | 物品行动限次 `3+⌊med/40⌋` 与同 ID 冷却 2；六角范围模板；弃械投降、战后缴获、驭兽/驭蜂、敌人用药；P51 坠崖掉落按稳定序保留 `ceil(n×0.5)` | §3.6、§8.1、§11.3、T19 |
| D-07 | design/11、design/19 | 屠龙刀夺刀遭遇每日 5%；采集点、营地、坐骑旅行、乌蚕衣夜间发现距离及奇遇永久增益落地；统一地图和时代图层只消费物品 ID，不另建地图 | §5.2、§6.8、§8.5、§11.4 |
| D-08 | design/12、design/16 | **已接收 12/16 接口**：烹饪使用 `recipeMastery[rc_*]`；五个具名 `resourceRef`、冰蚕丝物品定义与 40/25/10/10/8/5/2 收入桶已同步。16 §3.3 可将冰蚕丝的待登记描述改为正式 ID；工匠/名厨、馈赠、淬毒品德、秘籍借阅和行囊价格继续引用 12 | §6.8、§9.4、§11.5、§13.5 |
| D-09 | design/13 | **已解决**：天书 ID 与“天书匣”、难度强化成功率 ×1.0、集齐 ≥7 本解锁“天书铭”以及 `it_shuyedan` 均已接收 | §6.4、§11.2.2、§12.3、§14.2 |
| D-14 | design/15 | **已解决**：定稿 `meridianAid={rateBp,successBp,costReduceBp,hours,meridians?}`，三种药物与同来源逐槽取高规则 | §2.4、§8.1.1、V20、T21；冲穴公式仍归 15 |
| D-15 | design/20 | **已接收**：AR-13 的 117 卷残本与 39 件关键信物已分别在 §10.3.1、§11.2.1 落最小 `ItemDef`；来源、投放概率和校合条件仍只引用 20 | §10.3.1、§11.2.1、§12.3 |
| D-10 | design/02 | 天级装备不计 `playerTianBudget`；自动携带评分加入 `Rtarget`/`uniqueW`；接收器魄用途、天材骰清单及工艺术语映射 | §6.7–6.8、§7.5 |
| D-11 | design/14 | 装备详情折叠、封存词条调整、书眠专属档位显示、背包分页与待拾队列 | §1.1、§7.2、§12.1 |
| D-12 | tech/06、tech/07 | 独立图标约 93 件、基底约 40 模板族；逻辑键 `equip/<拼音>`/`item/<拼音>`；成对兵器用双手挂点 | §2.3、§5 |
| D-13 | chapters/* | 固定获取节点、`anchorLocked`/`signature`、商店与 NPC；P20 刀剑互斫必须并列保全神兵等价路线；未完成考据不得变成唯一任务门槛。本轮七条秘籍已由 §10.1.1 定义，章节 / 任务须将三个共享叙事来源改为 2 / 3 / 2 条原子发放并引用正式 ID | §5、§10.1.1、§11、§16.4 |
| D-16 | catalog/skills-kangxi、chapters/08–09 | **本轮物品定义已解决**：凝血遗谱、神照狱墙拓录与血刀残页；旧 → 新及 `maxLayer/pagesTotal` 见 §10.1.2。图鉴和章节必须同次切换，未切换的旧来源不得生成第二份物品 | §10.1.2、V27、T30 |
| D-17 | chapters/10、story/10 | **本轮物品定义已解决**：D07 牺牲槽用 `it_gaochangyibao`，保持地上 9、唯一、不可找回；不替代普通 `it_gaochangguwu`。剧情只消费物品状态，不反向定义数值 | §11.3、V28、T32 |
| D-18 | catalog/skills-shaolin／skills-wujue／skills-xiaoyao、对应 chapters | **实体登记已解决**：RCs／RCw／RCx 的 25 本秘籍、5 种残页已落表；少林／五绝／逍遥术语表应改“已由 10 定义”。五绝显式回填四本 `full/10` 默认及桃花药理书界；逍遥大手印残页由 6 改 4；章节只绑定固定取得／借阅事务，不重定义上限 | §10.1.3、§10.3.2、V31、T34、O16 |
| D-19 | catalog/skills-shaolin、tech/04／05 | **大还丹配方挂接已解决**：伤科 7 重且炼丹 ≥40 解锁 `rc_dahuandan`，成药为 `it_dahuandan`；制作门槛 68。沿既有解锁【建议值】，药引默认额外 `herb` ≥7 品 1 份，不新造具名物品；图鉴改引 §8.7.1，技术承接独立解锁／制作校验与跨界学识 | §8.7.1、V32、T35–T39 |
| D-20 | chapters/02、design/12、tech/04／05、assets | **家常饭实体与映射已解决**：`householdMeal → it_jiachangfan`；黄下仅回体，恢复量按 §8.2。缺省【建议值】：通用烹饪失败每批 1 份、单次供 1 人且耗 1 份、`stack:20`、`price:auto`、无特殊 flags、无膳食状态；0.5 时辰沿 §9.1。章节／生活技能仅接正式 ID；技术实现 V33／T40–T43，素材接 `item/jiachangfan`，不得把本实体定义继续交回章节 | §9.4、§9.3.1、V33、T40–T43 |
| D-21 | design/11、design/12 | AR-20 官甲只发 `{equipId,wearerId,lawProfile,exposure,locationId,time}`；12 校验 `allowedIdentityTags`，11 承接通缉激活与正常城门 `blocked`，且脱甲不自动洗罪 | §3.4.1、V36、T45 |
| D-22 | tech/04／05、design/14 | `equip-slots.v2` 新增 `innerBody/shoulder/cape`，三字段初始化与软猬甲／金丝背心移槽必须原子；客户端 v1 只读不得覆写 | §3.1.1、V36、T46 |
| D-23 | ART-item-*、tech/07 | 十一份 `catalog/items-*.md` 是批量出图输入；逐行消费 ID 与外观要点，沿 `assets/default/prompts/item.md` 的统一风格，不从名录反写玩法 | §1.3、§14.2、V34 |

### 16.2 本文依赖的上游事实

| 上游 | 本文依赖 | 状态 |
|---|---|---|
| `00-canon.md` v1.4 + AR-20 | 1–12 品阶、12 件 `divine` 神兵封闭名录；AR-20 后发要求各类有天级样本；共同额度 `carryEquipCount + newArchiveEquipCount ≤ 6`、天书不占额度、强化不改绝对品阶 | 以 `divine`／`catalogTian` 互斥兼容，见 §1、§5、§7、§12、V2/V3/V17/V18 |
| design/02 | 外来压制、器合、藏史、天材骰、掉落池；本文不重定义 | 接口见 §4.4、§6.7–6.8、§7、§12.4 |
| design/03 | 等级曲线、属性 ID、技艺门槛、治疗修饰；装备系数由本文定稿后需回填其 D-02 和 C10 算例 | **已同步**：03 本轮已移除非法“天中鞋”并按地上 9 上限重算合法 STD；本文保留 T16–T17 对照 |
| design/04 | Z0–Z10 与兵器攻击、装备主属性落点 | **已接收**，见 04 §11.3；本文 §4.1 只提供装备来源值 |
| design/05 / 06 / 07 / 09 | 武学装配、Buff/品阶对抗、套装、六角战斗与物品行动 | 只引用；06 的五类经脉状态与迁移预算已在 §2.6、§5.2 / §5.4、V24、T26–T27 接收；07 已定稿 44 套，唯一装备成员 `eq_yitianjian` 已在 §5.2 / §5.6 完成 `setTags` 双向同步 |
| design/11 / 12 / 15 / 16 / 17 / 18 / 19 | 大地图、任务关系、冲穴、资源营生、门派、NPC 与地图资产 | 15/16 接口已同步到 §6.8、§8.1、§13.5；其余只保留引用，不重定义 |
| design/20 | 跨年代传承源、残本三卷、39 件关键信物、概率与合成 | **已同步**：§10.3.1 / §11.2.1 定义 117 卷残本与 39 件信物的最小 `ItemDef`；来源 / 概率 / 三卷与校合语义仍由 20 定义 |

### 16.3 对基准的修改提案

| 编号 | 状态 | v1.1 落点 | 本文处理 |
|---|---|---|---|
| P-A | **已采纳（v1.1）** | V11-04、V11-05：统一 `af_*`、`ue_*`、`ins_*`、`rc_*`、`it_fang_*`、`it_miji_*`、`it_canye_*`、`it_tianshu_*`、`ev_*` | 全文与 §14.2 均按正式前缀使用 |
| P-B | **已采纳（v1.1；受 AR-20 后发补充）** | V11-31：天级 `divine` 装备封闭为基准 §14 的 12 件，普通名录外装备 ≤9 | 原 12 件不变；AR-20 额外天级样本按 P-G 的 `catalogTian` 例外隔离，踏云履仍为地上 9 |
| P-C | **已采纳（v1.1）** | V11-32：成对兵器计 1 件；双手主手与副手槽合法性 | §3.3、§7.1 C2 对齐 |
| P-D | **已采纳（v1.1）** | V11-16：学识、图鉴、永久增益跨书界保留 | §2.2、§8.5、§12.3 对齐 |
| P-E | **已解决（跨文档同步）** | V11-42：烹饪归生活技能、不新增 `cook`；基准 §6 明确 `alchemy` 只用于炼丹 | §9.4 改为引用 `design/12` §10.4 的 `recipeMastery[rc_*]`，不再以 `alchemy` 代行 |
| P-F | **本轮提案** | 基准 §20 的八格装备栏增补 `innerBody`、`shoulder`、`cape`，版本升为 `equip-slots.v2` | AR-20 明列内甲、护肩、披风；保留原八字段并用原子迁移降低兼容风险，见 §3.1.1 |
| P-G | **本轮提案** | 将基准 §14“天级装备封闭”收窄为“`divine` 神兵宝甲封闭”；允许 AR-20 登记的固定 `catalogTian` 样本 | 后发 AR-20 要求每类天地玄黄；互斥字段与禁止随机／锻造／商店可保住原神兵稀缺性，见 §5.1、V2 |

P-F／P-G 待基准吸收；在此之前运行数据按作者要求优先级执行 AR-20，旧存档按 §3.1.1 兼容。

### 16.4 原著考据待办

下表只列正文尚保留的 **（待考）** 事实，不重复已确认项目；均须对照三联/广州修订版逐字核对。

| 分类 | 书界 / 书目 | 剩余事项 | 未确认时的安全处理 |
|---|---|---|---|
| **影响规则或任务** | 倚天 | 倚天剑/屠龙刀的剑内秘笈组成、断刃流转；西方精金是否为该版本明确用名；殷素素蚊须针是否明确淬毒 | 刀剑互斫不得成为唯一取经门槛；西方精金只作暂名；蚊须针中毒按**（原创扩展）** |
| **影响规则或任务** | 射雕 | 白驼蛇杖是否明载杖头双蛇、机括和暗器 | “杖中暗器”按**（原创扩展）**，不冒充原著结构 |
| **影响规则或任务** | 碧血 | 金蛇秘笈是否附机关或警示及具体方式 | 机关检定按**（原创扩展）** |
| **影响规则或任务** | 白马 | 狼皮赠受顺序；高昌路线图的载体与取得经过 | 章节稿不锁定收件人；地图仅作抽象任务 ID |
| **仅影响文本** | 倚天 | 倚天剑/屠龙刀铸造措辞、屠龙刀重量与王盘山前后流转；圣火令枚数和材质；峨眉铁指环是否明言始自郭襄 | 不影响既定数值；图鉴保持概括表述 |
| **仅影响文本** | 神雕、射雕 | 玄铁重剑石刻全文与“八八六十四斤”；软猬甲来历措辞和神雕时期持有人 | 不写未校准引文与确定持有人链 |
| **仅影响文本** | 天龙 | 打狗棒跨四部书的历代交接与竹棒外形；无崖子画卷中人物的版本称谓 | 图鉴只写信物性质；任务对白不先实名 |
| **仅影响文本** | 碧血、鹿鼎、连城、鸳鸯、书剑、飞狐/雪山 | 金蛇剑形制；匕首/宝衣细节；乌蚕衣材质与取得；鸳鸯刀长短归属；凝碧剑来历流转；冷月宝刀流转及“刀中秘密”是否有据 | 不影响数值；“刀中秘密”考据完成前不驱动任务 |
| **仅影响文本** | 白马 | 高昌古物的典籍器物细目 | 不先编造单件古物名称 |
| **仅影响文本** | 古龙《楚留香传奇·画眉鸟》、梁羽生《云海玉弓缘》 | 天一神水的案件与药物细节；碧灵丹的天山派归属、雪莲材料与疗伤／解毒边界 | 保留作品与物名，全部具体药效、投放和容器形制按 **（原创扩展）**；不得写现实配方或摄入方式 |
| **AR-24 兵器形制** | 天龙、射雕／神雕、笑傲、书剑 | 绿波香露刀材质来历；渔隐叉具体叉形；莫大胡琴藏剑结构；碧水剑取得与削铁表现；真武剑外形；芙蓉金针数量与装具 | 名称与可靠场景可入表；尺寸、材质、结构、数值均按 **（原创扩展）**，不写伪引文或回目 |
| **AR-24 通用制式** | 宋—清兵器史 | 朴刀名称／形制定型下限、麻札刀器形、白蜡杆／梨花枪／流星锤／护手钩／牛尾刀确切定型年代 | 只作出图通用基底并标 **（待考）**；不据晚出形制向宋元书界投放 |

### 16.5 开放问题（附默认值）

| # | 问题 | 本文默认 |
|---|---|---|
| O1 | **已解决（P17）**：强化失败不降级、不碎裂；返还一半材料、火候保底，并提供稳炼 | 见 §6.2、T4–T5 |
| O2 | **已解决（P18）**：紫薇软剑保留 3% 误伤友方，作为剑冢弃剑之险的游戏化 | 见 §5.4 |
| O3 | **已解决（P19）**：罗刹短铳保留为鹿鼎特色名门暗器，不降为收藏品 | 见 §5.4 |
| O4 | **已解决（P20）**：刀剑互斫为可选事件，并提供保全两件神兵的等价取经路线 | 见 §5.2、D-13 |
| O5 | **已解决（P21）**：名器只可按估值 30% 典当，并只可在本书界赎回 | 见 §13.3、T20 |
| O6 | **已解决（P22）**：背包无重量；负重只来自装备 | 见 §3.4、§12.1 |
| O7 | **已解决（P50）**：飞爪只作探索工具，不进入战斗物品栏 | 见 §3.6、§11.3 |
| O8 | **已解决（P51）**：普通敌人坠崖时非任务掉落损失 50%，任务关键物必得 | 奇数件按稳定顺序保留 `ceil(n×0.5)`，见 §3.6、T19 |
| O9 | **已解决**：`design/16` 已定稿资源 36 级到装备 12 品的换算及五个具名映射；冰蚕丝物品侧也已登记 | 同一大阶内资源 7–9/4–6/1–3 品映射装备下/中/上品；`it_bingcansi` 对应 `res_sicha_tian9`，见 §6.8 |
| O10 | **已解决**：`design/12` §10.4 已决定不新增独立 `cook`，烹饪也不读取 `alchemy` | 按菜谱独立使用 `recipeMastery[rc_*]∈[0,10]`；未学为 0、初学为 1，见 §9.4、V23、T24 |
| O11 | **已解决（AR-13 / design/20）**：117 卷 `frag_*` 与 39 件 `it_xinwu_*` 关键信物已落物品定义 | 只接受 20 正式登记的 `legacyCarry/keyToken`，见 §10.3.1、§11.2.1、§12.3；普通物品无例外 |
| O12 | **已解决**：`design/07` 已定稿，装备侧反向 `setTags` 已按正式成员表同步 | v1 仅 `eq_yitianjian` 属于 `set_yitian_emei`；其余旧候选不进入运行数据，见 §5.6 |
| O13 | **已解决（NXB09 / NXB10 / NXB14）**：衙门武册、华辉遗谱、宝树旧稿是否建立实体物品 | 建立 7 条单武学 `manual`；三个叙事载体分别原子发放 2 / 3 / 2 条，层数与安全条件见 §10.1.1 |
| O14 | **已解决（NXB11／NXfix-kangxi）**：常长风墓碑能否合法施展太岳石碑手 | 本文 §3.2／§5.4 的 `exotic/misc` 与康熙册 §9.6 的 `weaponReq.altItems:[eq_changchangfengshibei]` 已闭合；牌属性、占副手与负重不变，见 V25、T28 |
| O15 | 白马 D07 高阶遗物的具体外形与是否有额外收益 | 默认泛称“高昌遗宝” `it_gaochangyibao`，地上 9、无战斗与永久属性收益；仅承接既有取走／封藏选择。具体原著器物未经核对不命名，见 §11.3 |
| O16 | **实体缺口已解决**：RCs／RCw／RCx／NXfix-shaolin 的 25 本秘籍与 5 种残页已逐项定义；仍待缺省来源／残页售价确认 | 正式表见 §10.1.3／§10.3.2。锁喉擒拿手、摄心术、餐风饮露功、桃花药理四本默认 `full/maxLayer:10`【建议值】（05 §7.1）；桃花药理默认仅射雕／神雕药圃【建议值】，未绑定固定节点不生成实例。大手印按玄阶正式 4 页，旧图鉴 6 页须迁移；五种残页在逐页估价落定前默认 `price:null`【建议值】，未习得重复页暂不可售，已习得重复页仍转修习经验。其余来源沿卡面，不再整批转交物品实体登记 |
| O17 | 袈裟类奇门、“塞耳”、火药筒、生血、毒物、箭及伞／环的旧候选接口 | 默认不从通配键生成实体；既有袖箭不能冒充弓箭、普通僧衣不能冒充袈裟兵器。“塞耳”先由 05／06 明确音功档位、心神防护与大成绕过接口，再由本文收具体物品；伞／环仍只可用 `exotic/misc`，不新增武学子类。生血已有狩猎来源及闭关用途（逍遥册 §3.3）；毒物已有化功闭关用途及持有神木王鼎的免料条件（逍遥册 §4.3），两者缺料均为闭关收益 ×0.5。尚缺每次消费单位、最低品阶与通用兽材／毒材替代规则；核定前不自动以材料族替代点名物，不据用途已定就虚构实体 |
| O19 | D10／chapters/10 §9.5 的四件具名固定装备预算尚无具体名单 | 默认不凭四个预算槽另造装备；白马先投已登记奇物与坐骑，§11.3 高昌遗宝是非装备剧情物，不能冒充四件装备之一。白马无专属冲穴药物，普通治疗药不产生 `meridianAid`；最终名单与节点由书界任务提供后逐项登记 |
| O20 | AR-20 `catalogTian` 是否最终并入基准的“神兵”称谓 | 默认不并入：只作固定、唯一、不可量产的天级目录样本，不得取得 `divine` 通则；待基准按 P-G 收口 |
| O21 | 护肩／披风各半个小件预算是否需在全套数值压测后调整 | 默认各取 `defOut 0.025×G×DEF_LV + hpMax 0.005×G×HP_LV`，二者合计恰为旧一小件；压测前不增加额外免费槽位收益 |
| O22 | 官甲被披风覆盖时的识别阈值与通缉强度 | 默认普通披风不遮蔽；只有显式 `concealment.coveredBy` 才把本次暴露改为 `covered`。通缉强度、消除方式与特殊进城路线仍由 11／12 决定 |
| O23 | AR-24 哪些门派象征物算可装备法器 | 默认仅收可实际持用的兵器／法器；印信、令旗、掌门指环继续归 `design/11` 任务物品。无原著具名器物的门派以一件地级 **（原创扩展）** 公用法器补视觉位，不宣称为原著镇物 |
| O24 | AR-24 天级兵器数量是否扩大 | 默认只新增原著明确为武当镇山之宝的真武剑，按 `catalogTian=true; divine=false`；基准 12 件 `divine` 闭集不变，其余新增名器／门派法器最高地上 9 |
| O25 | AR-24 制式兵器是否按年代多件并存 | 默认是：同一六档矩阵允许宋／元／明／清形制并存，品阶代表制作质量而非年代先后；晚清牛尾刀不得投放到早期书界 |

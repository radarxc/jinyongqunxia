# 07 · 套装体系（Set System）

> 归属（基准 §18）：套装的数据结构、计件、有效品阶、档位效果、跨品阶混搭、可达性、平衡预算与正式套装目录。
> 上游：`00-canon.md` v1.2（§3～§5、§9、§12、§20）；作者新增需求与决定见 `decisions/author-requirements.md`、`decisions/author-decisions.md`；冲突裁定见 `decisions/rulings-v1.md`。
> 引用而不重定义：书眠携带与外来压制 → `design/02-timeline-and-world-tiers.md`；属性 → `design/03-attributes.md`；Z0～Z10 → `design/04-damage-formula.md`；武学装配、`effGrade` 与 `setTags` → `design/05-martial-arts-system.md`；Buff DSL、叠加族与上限 → `design/06-buff-system.md`；装备与成对兵器 → `design/10-items-and-equipment.md`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需以三联／广州修订版逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档、先给可用数值并在文末登记。
> 版本：v1.2（审校 C2.R；全局审计，2026-09-27）；阴阳性质同步 AR-18（2026-09-30）；经脉落地终审（2026-09-30）。
> 变更记录：v1.0 首次冻结规则与 44 套正式目录；把 11 份技能图鉴的候选收敛为可双向闭合的首发集合。v1.1 对齐 Canon v1.2 与 06 DSL，重校平衡预算、低武路径、古龙投放和全部淘汰候选去向，并补双向关系审计规则。v1.2 增加机器可读正式成员注册表；§19 保留原 `set_*` 候选键，供检查脚本读取“弃用／并入”映射，且不得进入运行态 `setTags`。
> 经脉落地终审（2026-09-30）：复核八门补录天阶与崆峒五行心法的空标签边界、崆峒七伤七成员双向闭合与中位数；补终局装配重算，回填已采纳基准提案。正式 44 套及成员集合不变。

---

## 0. 结论先行与阅读指引

1. 首发共 **44 套**；套装是装配构筑，不是收藏成就，也不改变武学或装备的获取条件。
2. 只统计当前装配的武学与当前穿戴的装备；同一成员 ID 对同一套装最多计 1 件。
3. 天、地、玄、黄可以混搭。套装品阶取已计件成员压制后有效品阶的中位数并向下取整。
4. 档位效果以 `origin.type=set` 的不可驱散永久被动实例表达；数值仍进入 `design/06` §11.1 的共享上限。
5. 低武携带只有内功／拳脚／兵器各 1 门；轻功、暗器、杂学不能携带，但在当前书界重新学会后可以装配并计件。
6. `set_shaolin_jingang` 是贯穿规则的金标准：鹿鼎携入易筋经与龙爪手，本土补铁砂掌、铜人横练，依次取得拿穴、招架、伤害。
7. §8～§18 是唯一 `SetDef.members` 正向目录；图鉴中的 `setTags` 必须与之双向一致。

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1～§4 | 目标、结构、计件、品阶 | 策划、程序、配表 |
| §5 | 书界可达性与路径记法 | 关卡、数值、QA |
| §6 | 效果原语、乘区、叠加与互斥 | 战斗、程序 |
| §7 | 平衡预算与模板 | 数值、QA |
| §8～§18 | 44 套正式目录 | 全体 |
| §19 | 未采用候选及去向 | 图鉴维护者 |
| §20～§22 | ID、校验、依赖 | 程序、审校 |

---

## 1. 设计目标与边界

### 1.1 目标

| 编号 | 目标 | 可验收结果 |
|---|---|---|
| S1 | 让跨门派、跨品阶武学形成可读构筑 | 每套有明确成员、阈值和主题 |
| S2 | 低武仍有成套选择 | 每套逐项写高／中／低武路径或不可达原因 |
| S3 | 奖励是“锦上添花”而非强制毕业装 | 4 件静态峰值不高于同阶两门武学的 `layerStats`，且逐套通过实战回归 |
| S4 | 不绕过上游代价 | 门派、前置、断尘、阴阳相冲、武器要求照常检查 |
| S5 | 数据可静态验证 | `members ↔ setTags` 双向闭合，阈值和 ID 可 lint |
| S6 | 规则稳定、目录可扩展 | 新套装只增数据，不另写专用计件代码 |

### 1.2 非目标

- 套装不授予成员武学，不补齐缺失层数，也不把残篇升级为完整传承。
- 套装不改变书眠携带上限、装配栏数量或装备槽位。
- 套装不把人物传承等同于门派归属，不更改 `sect_*`、`lineage` 或任务阵营。
- 套装不免除七伤、葵花／辟邪、吸星异种真气等明确代价。
- 套装目录不重定义 Buff、伤害公式、装备数据或原著事实。
- “拥有过”“仓库中”“同伴装配”均不自动给当前角色计件；队伍型条件必须在效果中另写选择器。

### 1.3 首发收敛原则

候选进入首发须同时满足：至少 4 个可闭合成员；主题能与现有武学机制对应；在至少一个标注书界能达 4 件；不依赖尚未落盘的装备反向标签；与既有正式套装不只是换名重复。角色标签只有 1～3 件者并入更大的传承套或留作未来扩展。

`eq_yitianjian` 是首发唯一装备成员：它在 `design/10` 已有 `set_yitian_emei` 反向标签。其他候选装备即便存在 ID，只要装备定义未登记同名 `setTags`，本版都不进入 `members`。

---

## 2. 数据结构

### 2.1 `SetDef` 字段

| 字段 | 类型 | 必需 | 约束 |
|---|---|:---:|---|
| `id` | `set_${string}` | 是 | 全局唯一，命名见基准 §12 |
| `name` | string | 是 | UI 中文名 |
| `origin` | enum | 是 | `canonTheme` / `expanded`；只表示主题来源，不宣称“原著套装” |
| `canonNote` | string | 是 | 原著依据、待考项或原创扩展说明 |
| `members` | `SetMember[]` | 是 | ≥4；唯一 ID；必须双向闭合 |
| `thresholds` | `SetTier[]` | 是 | 严格递增；首档 ≥2；末档 ≤成员数 |
| `gradeRule` | enum | 是 | v1 固定 `effectiveMedianFloor` |
| `reachable` | `Reachability[]` | 是 | 按书界境界与本土来源给路径 |
| `balance` | `SetBalance` | 是 | 基准系数、峰值评估与回归标签；不参与运行时结算 |
| `exclusiveGroup` | string | 否 | 套装自身互斥；不同套默认可并存 |
| `ui` | object | 是 | 图标、短说明、进度显示 |
| `version` | int | 是 | 数据迁移版本，首发为 1 |

`SetMember` 只接受 `skill` 与 `equip`。物品、秘籍、奇物、角色、称号和任务道具不能计件；若未来把奇物做成可穿戴装备，须先在 `design/10` 建 `eq_*` 并补反向标签。

### 2.2 YAML 金标准：少林金刚

```yaml
id: set_shaolin_jingang
name: 少林金刚
origin: canonTheme
canonNote: "易筋经与少林拳掌、横练同属少林传承；四件成套及奖励为原创扩展"
members:
  - { kind: skill, id: sk_longzhaoshou }
  - { kind: skill, id: sk_yijinjing }
  - { kind: skill, id: sk_tieshazhang }
  - { kind: skill, id: sk_tongrenhenglian }
gradeRule: effectiveMedianFloor
thresholds:
  - count: 2
    mods: [{ op: modStat, stat: seal, kind: pp, value: "4 * G" }]
  - count: 3
    mods: [{ op: modStat, stat: parry, kind: pct, value: "0.03 * G" }]
  - count: 4
    mods: [{ op: modZone, zone: Z3, value: "0.04 * G", filter: { cat: unarmed } }]
reachable:
  - { chapters: [ch08_luding], count: 4, carry: [sk_yijinjing, sk_longzhaoshou], local: [sk_tieshazhang, sk_tongrenhenglian] }
balance: { scale: G, peakScore: 22.0, compare: sameGradeFullSkill, regression: set_shaolin_jingang }
ui: { icon: set/shaolin_jingang, showNextThreshold: true }
version: 1
```

### 2.3 TypeScript 类型

```ts
export type SetId = `set_${string}`;
export type SkillId = `sk_${string}`;
export type EquipId = `eq_${string}`;
export type ChapterId = `ch${string}`;
import type { Mod, Op, Trigger } from './buff/types'; // 唯一原语语义见 design/06 §6.4

export type SetMember =
  | { kind: 'skill'; id: SkillId }
  | { kind: 'equip'; id: EquipId };

export interface SetTier {
  count: number;
  mods?: Mod[];       // 06 §6.4 的 modStat/modZone/modJudge/modCost/modRange 只能放这里
  triggers?: Trigger[]; // 事件钩子；动作只放 Trigger.ops
  onApply?: Op[];     // 档位永久来源实例生效时执行
  onRemove?: Op[];    // 档位永久来源实例失效时执行（若原语需要显式清理）
}

// SetTier 本身是一条不可驱散的永久来源；具体 duration/grade/origin 由 §6.1 包装。

export interface SetBalance {
  scale: 'G';
  peakScore: number;  // §7 的审计分；不是运行时强度参数
  compare: 'sameGradeFullSkill';
  regression: string;
}

export interface Reachability {
  chapters: ChapterId[];
  count: number;
  carry: Array<SkillId|EquipId>;
  local: Array<SkillId|EquipId>;
  note?: string;
}

export interface SetDef {
  id: SetId;
  name: string;
  origin: 'canonTheme'|'expanded';
  canonNote: string;
  members: SetMember[];
  thresholds: SetTier[];
  gradeRule: 'effectiveMedianFloor';
  reachable: Reachability[];
  balance: SetBalance;
  exclusiveGroup?: string;
  ui: { icon: string; showNextThreshold: boolean };
  version: 1;
}
```

### 2.4 运行时派生，不进存档

```ts
interface ActiveSetState {
  id: SetId;
  countedMemberIds: Array<SkillId|EquipId>;
  count: number;
  setGrade: number|null;
  activeThresholds: number[];
  suppressedThresholds: number[];
}
```

存档只保存装配、装备和技能状态。加载、换装、书眠压制变化、武学失效或装备损坏后重新派生 `ActiveSetState`；不保存旧件数，避免回档或数据升级留下“幽灵套装”。

### 2.5 构建期索引

构建器由 `SetDef.members` 生成 `memberToSets`，同时读取技能／装备侧 `setTags` 做等价校验，而不是把两边合并。若正向与反向不一致，应直接失败并打印 `setId`、`memberId`、缺失侧和定义文件。

---

## 3. 件数计算

### 3.1 计件集合

对角色 `u` 与套装 `S`：

```text
equippedSkillIds = 主运内功 ∪ 辅运内功 ∪ 拳脚栏 ∪ 兵器栏 ∪ 轻功栏 ∪ 暗器栏 ∪ 杂学栏
wornEquipIds     = 当前实际占用装备槽的装备唯一 ID
activeIds        = unique(equippedSkillIds ∪ wornEquipIds)
counted(S,u)     = activeIds ∩ S.members
pieces(S,u)      = |counted(S,u)|
```

只拥有、学会、背包携带、仓库存放、设为快捷栏或由同伴装配均不计件。锁定但仍在装配栏内的武学，若锁定原因只是兵器不匹配，则仍计件；若武学因剧情被移除、数据失效或未达到最低可用层数，则不计。

### 3.2 武学细则

1. 主运与辅运内功都计件；同一内功不可能在多个内功槽重复占位。
2. 拳脚、兵器、轻功、暗器、杂学均按装配栏计；类别不影响计件权重。
3. 兵器武学因当前主武器类别不匹配而不可施展，仍算已装配的一件。
4. 一门武学属于多个套装时，可分别为每个套装贡献一件；不会为同一个套装贡献多件。
5. 临时复制、镜像招式、合击借用、观摩招式不产生新的技能成员。
6. 自创武学只继承一个 `setTags`，规则见 `design/05` §12；继承后按普通成员计一件。
7. 同一武学的合法师承、学习来源或残承／完整来源不产生第二套 `setTags`；它们只按上游影响可用性与 `effGrade`。例如狮子吼不因来自少林而失去 `set_mingjiao_sida_fawang`，也不因谢逊与少林双来源计两件。

### 3.3 装备与成对兵器

- 装备必须处于穿戴状态；背包、快捷栏和剧情展示不计。
- `eq_yitianjian` 是本版唯一正式装备成员。
- 一件装备占两个槽也只按唯一 ID 计一件。
- “成对兵器”若数据是一件 `pair` 装备，占主／副手但只计一个成员；若是两个独立 `eq_*` 实例，则各按各自 ID 判断。
- 同一唯一装备 ID 的多个实例不重复计件；精炼、附魔、耐久、天书铭均不改变件数。
- 装备被战斗内临时封锁但仍穿戴时继续计件；装备真正卸下或损坏到定义要求的失效态才触发重算。

### 3.4 阈值激活

达到高档时，低档效果继续生效；`activeThresholds = thresholds.filter(t => pieces >= t.count)`。目录中“2／3／4件”是三个累计档，不是三选一。效果若写“升级”或“替换”，必须显式用同一 `exclusiveGroup` 或同一 Buff 定义的 `highest` 规则，防止重复叠加。

### 3.5 少林金刚计件例

角色装配易筋经、铜人横练、龙爪手、铁砂掌时为 4 件；只学会而未装配铁砂掌则为 3 件；把龙爪手卸下、换成同套装之外的掌法后立刻降为 2 件。易筋经既属于金刚、达摩、扫地僧、方证四套，但对金刚仍只贡献 1 件。

---

## 4. 跨品阶与套装品阶

### 4.1 公式

令已计件成员的有效品阶排序为 `e1 ≤ e2 ≤ … ≤ en`：

```text
median(E) = e((n+1)/2)                         n 为奇数
median(E) = (e(n/2) + e(n/2+1)) / 2           n 为偶数
g_set     = floor(median(E))
```

成员“有效品阶”先按 `design/02`、`design/05` 完成来源限制、书界压制及合法抵消，再进入中位数；传承合成来源还须消费 `design/20` 的当界有效品阶上限。读取各成员已经派生出的 `effGrade`，不得在套装层再次压制、按绝对品阶替代或因补录天阶身份抬档。若当前不足 2 件，套装不激活且 `setGrade=null`。有效品阶变化会重算全部已激活档位的数值和效果品阶。

### 4.2 为什么用中位数

中位数允许天、地、玄、黄混搭，并让低阶凑件产生可见代价；相比最低值，它不会让一门入门武学摧毁整套；相比平均值，它又不允许单门天上把三门黄阶整体“抬飞”。偶数向下取整保证客户端与服务端整数一致。

### 4.3 品阶映射

| `g_set` | 显示档 | `G(g_set)` | 套装效果品阶 |
|---:|---|---:|---|
| 1 | 黄下 | 1.00 | 1 |
| 2 | 黄中 | 1.10 | 2 |
| 3 | 黄上 | 1.20 | 3 |
| 4 | 玄下 | 1.40 | 4 |
| 5 | 玄中 | 1.55 | 5 |
| 6 | 玄上 | 1.70 | 6 |
| 7 | 地下 | 2.00 | 7 |
| 8 | 地中 | 2.20 | 8 |
| 9 | 地上 | 2.40 | 9 |
| 10 | 天下 | 2.80 | 10 |
| 11 | 天中 | 3.10 | 11 |
| 12 | 天上 | 3.50 | 12 |

目录里的 `a×G` 直接查本表，不再乘武学层数系数 `L(n)` 或 Buff 的 `Lb`。套装不是某一门武学的附属，因此 `origin.type=set` 时 `Lb=1.00`，见 `design/06` §3.2。

### 4.4 少林金刚核算

完整四件绝对品阶为龙爪手 8、易筋经 12、铁砂掌 5、铜人横练 6。排序 `[5,6,8,12]`：

```text
g_set = floor((6 + 8) / 2) = 7
G(7)  = 2.00
```

因此地阶档时，2 件拿穴为 `4pp×2=8pp`，3 件招架为 `3%×2=6%`，4 件拳脚增伤为 `4%×2=8%`。进入鹿鼎后若压制结果为 `[4,5,6,8]`，则 `g_set=floor((5+6)/2)=5`，三档分别为 `6.2pp`、`4.65%`、`6.2%`；运行时以 bp／整数规则换算，UI 可显示一位小数。

---

## 5. 书界可达性

### 5.1 计算顺序

每个书界按以下顺序验证：

1. 取当前书界允许携入的核心武学：高武 `3/3/3`、中武 `2/2/2`、低武 `1/1/1`。
2. 加入当前书界按正常来源重新学会、且能装进栏位的本土成员。
3. 加入最多 6 件携带装备中实际穿戴的正式装备成员。
4. 轻功、暗器、杂学不得跨书携带；只有在本界重新学会后才可装配计件。
5. 检查装配栏：内 3、拳脚 3、兵器 3、轻功 1、暗器 1、杂学 2。
6. 按有效品阶重算 `g_set`，而不是沿用上一书界的档位。

“可达 4”表示存在合法构筑，不表示剧情必然同时开放；互斥路线、门派身份、任务窗口仍由所属书界和 `design/12` 决定。目录若写“本土全套”，是指候选来源可在该书界内取得，章节落地仍须验证同周目非互斥。

### 5.2 路径记法

目录统一写三档：

- **高**：高武任一可行代表路径；无本土时最多可携入内／拳／兵各 3。
- **中**：中武代表路径；常用“携入 2+2+2”或“本土重学”。
- **低**：鹿鼎、连城、白马、鸳鸯中至少一个明确路径，并说明其他低武的上限。

套装依赖不可携带类别时，应明确“离开原生书界掉档”。目录中的 `C:` 表示携入，`L:` 表示本土重学，`E:` 表示穿戴装备；这些缩写仅用于本文可达性说明，不进入数据枚举。

### 5.3 少林金刚路径

| 境界 | 路径 | 结论 |
|---|---|---|
| 高武 | `C:易筋经+铜人横练+龙爪手+铁砂掌`（内2、拳2） | 4 件 |
| 中武 | 同上，恰占内2、拳2 | 4 件 |
| 低武·鹿鼎 | `C:易筋经+龙爪手`；`L:铁砂掌+铜人横练` | 4 件 |
| 低武·其余 | 只携一内一拳，无对应本土传承 | 2 件 |

这条路径是任务给定的强制样板。它同时证明“低武最多带入两件”不等于“低武最多两件”：本土重学不占书眠携带数，但仍占装配栏。

---

## 6. 效果、Buff 与乘区

### 6.1 实现模型

每个已激活档位实例化一条 `duration: permanent`、`dispellable:false` 的被动，运行时 `origin={type:set,id:setId}`、`grade=g_set`。换装使档位失效时移除；品阶变化时原位重算。常驻数值使用 `mods`，事件响应使用 `triggers` 与 `design/06` §6.4 原语。

禁止为套装复制一份功能相同的新 Buff 来绕过叠加。已有状态应 `applyBuff` 既有 `bf_*`；新机制若确需 Buff，先进入 06 的目录与家族校验，再由本文引用。

### 6.2 作用层

| 本文记法 | 落点 | 合并规则 |
|---|---|---|
| `attr:* flat/pct/pp` | 属性层 | 同属性、同族按 03／06 合并 |
| `Z0` | 命中、效果命中、招架、暴击判定 | 只改写明确判定，不造成伤害 |
| `Z2` | 防御减免层 | 防御穿透进入 `fam_z2` |
| `Z3` | 攻方增伤 | 与全部 Z3 加法合并，上限 +100% |
| `Z4` | 守方减伤 | 与全部 Z4 加法合并，上限 +75% |
| `Z5:<cat>` | 相性／破兵 | 同类取最高，不叠加 |
| `Z9` | 招架减免 | 仅招架成功分支 |
| `settle` | 护体、吸取、回复等 | 按 04／06 结算顺序 |
| `cost` / `ct` | 消耗／集气 | 分别受 −50% 与时间轴规则限制 |

目录所有数值都标注此落点；“机制”则写明触发次数、冷却和边界。

### 6.3 叠加

1. 同一套装各档累计生效；同一档只有一个来源实例。
2. 不同套装默认可同时生效，但最终数值进入 `design/06` §11.1 的族上限。
3. 同名 Buff 按其 `stack.rule` 和 `stackKey` 处理；套装不能另开私有层池。
4. `Z5:破X` 与武学“破 X”取最高，不相加。
5. 相同事件每个套装每回合至多触发一次，除非目录明确写更严的“每场一次”。
6. 攻击派生反应直接继承 06 §5.3.1 的 `reflected`／`redirected`／`mirrored`／`countered` 来源位，并受反应队列深度 3 限制；同一实例的同一触发器在同一事件至多执行一次。本文不另造 `noSetChain`。
7. 套装造成的回复、护体、DOT、吸取都进入 06 的 HOT、护体、DOT、吸取上限。

### 6.4 互斥与取高

- 只有 `exclusiveGroup` 相同的档位互斥；默认保留 `g_set` 高者，仍同品则保留阈值高者，再同则按 `setId` 字典序保证确定性。
- 目录里“与既有被动取高”按效果语义取高，不因为来源不同相加。
- 套装不能移除成员自身的 `conflicts`；阴阳内功相冲、武器不匹配、代价型被动仍先于套装收益结算。
- 队伍型套装只给实际满足距离条件者，不把队友成员合并到持有者件数；首发效果不读取 06 表达式白名单之外的羁绊／阵法运行态。

### 6.5 动态变化时机

装配界面确认、战斗开始、装备卸下／损坏、武学临时失效、压制变化时重算。战斗中重算发生在当前原子事件结束后、下一次 P1 之前；已经排队的伤害不回溯。若重算后失去阈值，其永久被动立即移除，但此前合法施加的限时 Buff 按自身持续规则结束。

终局“万卷归一”只把合法回归武学加入可装配池，须实际装配才按 §3 计件；进入终局、卷间换装与终局结束均走上述重算。书影按自身装配独立计算，不能把书影成员并给主角；来源、层数与终局可用范围见 `design/13` §7.6。

### 6.6 目录效果到 DSL 的固定映射

目录是玩家可读摘要，运行数据必须按下表展开；表中没有的“直接改 Buff 持续、直接改招式冷却、改既有 Buff 内部参数”等旁路一律禁止。临时属性效果通过现有 `bf_*` 实例承载，不能把 `modStat` 写进 `triggers[].ops`。

| 目录效果 | `SetTier` 落点 | 关键约束 |
|---|---|---|
| 常驻属性、Z 区、消耗、射程 | `mods: [modStat/modZone/modCost/modRange]` | `when` 只读 06 §2.3 白名单；百分数写小数 |
| 临时属性提升 | `triggers[].ops: [applyBuff]` | 只引用 06 已登记 `bf_*`；本文采用 `bf_renjin`、`bf_yuanzhuan`、`bf_ningshen`、`bf_piaohu` |
| 气势、集气、治疗、回内 | `triggers[].ops: [modRage/ctShift/heal/restoreMp]` | 写明 `limitPerTurn`／`limitPerBattle`；目标必须显式 |
| 免疫、驱散、架势 | `applyBuff`／`dispel` | `dispel` 只能在效果已存在且事件上下文提供目标时执行；预防型一律先挂免疫 |
| 反击、奉还、锁血 | `triggerMove`／`mirror`／`lockHp` | 使用 06 来源位防循环；奉还受距离、绝招品阶及每战次数约束 |
| 雪地移动折扣 | `onApply: [modTerrain]` | `modTerrain` 是 06 §6.4 的 `Op`，不冒充 `Mod`；规则贡献以来源实例 `iid` 为键，来源移除即撤销，最终移动代价最低 1 |

几个容易误实现的定稿例：星宿 4 件用 `onBuffApply → modRage`，不延长毒实例；大轮 5 件用 `onUltimate → ctShift`，不修改招式冷却；明教的预防档在 `onBattleStart` 施加既有免疫 Buff，不在“命中后”倒序驱散；鸳鸯改用 `onAllyHurt → heal/modRage`，不从攻击方越权改写目标死亡流程。

下列是目录中事件短语到 06 钩子的规范化映射：开战→`onBattleStart`；回合开始／施招→`onTurnStart`／`onSkillCast`；攻击发起／奉还判定→`onBeforeAttack`／`onBeforeHit`；命中／受伤→`onHit`／`onHurt`；招架／闪避→`onParry`／`onDodge`；击杀／友方倒地／友方受伤→`onKill`／`onAllyDeath`／`onAllyHurt`；施治／向他人施加 Buff→`onHeal`／`onBuffApply`；施放绝招→`onUltimate`；首次跌破气血阈值→`onHpBelow`。

“某门派／某套／某性质招式”及 `poison`／`mind`／`cc` 等语义筛选在构建期据 05／06 的正式定义展开为 `ctx.move.id` 或 `ctx.buff` 的 ID 等值集合；运行时表达式仍只读取 06 §2.3 已公开字段，不新增 `ctx.mode`、目标生命值等私有字段。距离／邻接直接使用白名单函数 `dist`、`count` 与选择器；是否有至少两名近邻由 `count(allies(holder,2)) >= 2` 表达。首发不以羁绊或阵法运行态作为效果条件。

---

## 7. 平衡预算

### 7.1 预算单位

参照唯一取 `design/05` §3.6 的同大阶单门外功 `layerStats` 满层上限 `P_skill`：黄／玄／地／天分别为 6／10／15／20 点。这里比较的是**装配成长数值**，不是整门武学的招式与全部被动；旧稿把三档实际效果误记成 `3+2+3=8`，又声称“小于半门武学”，两者都不能由 05 推出，现删除。

静态审计分 `B_static` 按最终面板量计算：RAT 的 `pct`、PCT 的 `pp`、条件 Z3／Z4 每 1 个百分点计 1 点；无条件 Z3／Z4、Z2 每 1 个百分点计 1.5 点；消耗降低每 1 个百分点计 0.8 点。目录中的 `a×G` 要先代入当前 `G(g_set)`，再累计已激活档。限次、驱散、射程等机制不伪装成静态点，另按 §7.2 记 `B_mech` 并做实战门禁。

| 已激活最高档 | `B_static + B_mech` 累计上限 | 与同阶一门 `layerStats` 比较 |
|---:|---:|---:|
| 2 件 | `1.00 × P_skill` | 至多一门的装配成长 |
| 3 件 | `1.50 × P_skill` | 至多一门半 |
| 4 件 | `2.00 × P_skill` | 至多两门；相对四个成员合计栏位预算不超过一半 |
| 5 件 | `2.25 × P_skill` | 只允许窄条件或限次机制扩展 |
| 6 件 | `2.50 × P_skill` | 仍须受 §7.4 实战门禁约束 |

上限按**当前** `g_set` 所属大阶查表，并包含所有低档。它是配表审计线，不改变 03／04／06 的实际合成与族上限；跨层效果只能用于比较，不能相互换算后写回运行数据。

### 7.2 常用效果成本

| 效果 | 预算折算 |
|---|---:|
| RAT `pct`／PCT `pp`／条件 Z3、Z4 | 最终 1% 或 1pp = 1 点 |
| 无条件 Z3、Z4／Z2 | 最终 1% = 1.5 点 |
| `cost` 降低 | 最终 1% = 0.8 点 |
| 每场一次的小型怒气、集气、驱散或护体 | `B_mech=2～4` |
| 射程、额外段数、必定触发、锁血等高税机制 | `B_mech=4～8`，逐条评审 |

目录采用基线 `2件: 2～4×G`、`3件: 2～3×G`、`4件: 3～4×G`；条件越窄可取上沿，无条件 Z3／Z4 取下沿。触发效果按最长可用持续和最高合法次数计，不因“实战未必触发”免除上限。

### 7.3 机制税与禁区

- 改写行动次数、复活、无敌、必暴、必命中、额外段数属于高税机制；首发只保留每场一次或严格条件版本。
- 不用“品德下降”“门派锁”“原著人物限定”抵扣战斗预算；这些不是可交换成本。
- 套装不得新增无法由 06 原语表达的隐式战斗规则。
- 4 件效果若同时含机制和数值，数值至少下调 25%。
- 低武本土即可满档的套装，不因可达早而额外削弱；有效品阶中位数已经自然压低其数值。

少林金刚完整四件 `g_set=7`、`G=2.00`：2 件 `seal +8pp` 得 8 点；累计 3 件再加 `parry +6%` 得 14 点；累计 4 件再加条件拳脚 Z3 `+8%` 得 **22 点**。地下参照 `P_skill=15`，三档上限依次为 15／22.5／30，故 `8≤15`、`14≤22.5`、`22≤30`。这才是 YAML `balance.peakScore:22` 的来源。

### 7.4 回归基准

QA 以同等级、同装备、只替换装配构筑的标准敌人比较：2 件对 TTK／承伤影响目标 3%～6%，3 件累计 6%～10%，4 件累计 10%～16%，5／6 件累计不超过 20%。任何单套令标准战斗 TTK 改变超过 25%，或与第二套叠加后触及 06 红线，应下调而不是新增特殊上限。静态审计通过不等于实战通过；机制套至少覆盖“永不触发／恰触发上限”两端。

---

## 8. 正式目录读法

### 8.1 共通字段

以下 44 套均采用 §2～§7 的共同规则。每套成员按唯一 ID 列出；“跨度”是成员绝对品阶的大阶范围，仅供配表阅读，实际数值只看 `g_set`。效果中的 `G` 是 `G(g_set)`。

### 8.2 可达性共通简写

若本套至少含一内、一拳、一兵，高／中／低在无本土来源时的纯携入上限分别是 9／6／3，但还受成员实际类别与装配栏约束。目录仍逐套给代表路径；“低 2”不等于系统禁止更高，而是基于当前图鉴来源的可证明上限。

### 8.3 原著标注

“原著主题”只表示成员、人物或门派关系有原著基础；套装组合、阈值与全部数值均为**（原创扩展）**。不确定的具体武学名或传授细节继续沿用所属图鉴的**（待考）**标记。

### 8.4 正式成员注册表（机器可读镜像）

下表是 §9～§17 各条目“武学成员”的机器可读镜像，不是第二份设计定义。两处必须逐字同改；构建与 lint 以本表解析武学侧 `SetDef.members`，正文负责完整成员（含装备）、阈值、可达性和考据说明。表中共 44 套、305 个武学成员关系、292 个唯一武学；唯一装备成员 `eq_yitianjian` 仍以 §13.3 与 `design/10` 的双向登记为准，不在本技能图鉴镜像中重复。

| 套装 ID | 名称 | 成员 |
|---|---|---|
| `set_shaolin_jingang` | 少林金刚 | `sk_longzhaoshou`、`sk_yijinjing`、`sk_tieshazhang`、`sk_tongrenhenglian` |
| `set_shaolin_luohan` | 少林罗汉 | `sk_luohanquan`、`sk_shaolinzhuanggong`、`sk_shaolinxinfa`、`sk_shaolingunfa`、`sk_luohanbu` |
| `set_shaolin_damo` | 达摩遗风 | `sk_yijinjing`、`sk_xisuijing`、`sk_damoxinjing`、`sk_damojianfa`、`sk_yiweidujiang` |
| `set_saodiseng` | 扫地僧·藏经阁 | `sk_yijinjing`、`sk_boruoxinjing`、`sk_xumishanzhang`、`sk_nianhuazhi` |
| `set_fangzheng` | 方证·少林三战 | `sk_yijinjing`、`sk_qianshourulaizhang`、`sk_yizhichan`、`sk_jinzhongzhao` |
| `set_gaibang_bangzhu` | 丐帮帮主 | `sk_xianglong18`、`sk_dagou`、`sk_dagouzhen`、`sk_canfengyinlugong`、`sk_yunyoubu` |
| `set_taohuadao` | 桃花岛主 | `sk_tanzhi`、`sk_bihai`、`sk_lanhuafuxueshou`、`sk_yuxiaojianfa`、`sk_luoyingshenjianzhang`、`sk_bitaoxuangong` |
| `set_baituoshan` | 白驼山主 | `sk_hama`、`sk_lingshezhangfa`、`sk_lingshequan`、`sk_nizhuanjingmai`、`sk_tashaxing`、`sk_shexingdiaoshou` |
| `set_dali_yiyang` | 一阳 | `sk_yiyangzhi`、`sk_liumai`、`sk_kurongchangong`、`sk_yiyangshuzhi`、`sk_duanjiajianfa`、`sk_tiannanxinfa` |
| `set_jiuyin_zhengzong` | 九阴正宗 | `sk_jiuyin`、`sk_jiuyinshenzhao`、`sk_yihun`、`sk_dafumoquan`、`sk_yijinduangupian`、`sk_shexinglifan`、`sk_jiuyinliaoshangpian`、`sk_jiuyintiaoxipian`、`sk_shoujinpian`、`sk_biguqipian` |
| `set_guojing_xiazhe` | 侠之大者 | `sk_xianglong18`、`sk_jiuyin`、`sk_kongming`、`sk_zuoyouhubo`、`sk_zhebiejianshu`、`sk_wumuyishu` |
| `set_quanzhen_beidou` | 全真·北斗 | `sk_xiantiangong`、`sk_jinguanyusuo`、`sk_quanzhenxinfa`、`sk_quanzhenjian`、`sk_tongguijian`、`sk_tiangang`、`sk_dabeidouzhen` |
| `set_gumu_yunv` | 古墓·玉女 | `sk_yunvxinjing`、`sk_hanyuxinjue`、`sk_yunvjian`、`sk_suxin`、`sk_meinvquan`、`sk_jinlingsuo`、`sk_gumuqinggong`、`sk_yufengzhen` |
| `set_shendiao_xialv` | 神雕侠侣 | `sk_suxin`、`sk_anran`、`sk_xuantie`、`sk_yunvxinjing`、`sk_yunvjian`、`sk_quanzhenjian` |
| `set_dugu_jianzhong` | 独孤剑冢 | `sk_xuantie`、`sk_lijianyi`、`sk_ruanjianyi`、`sk_zhongjianyi`、`sk_mujianyi`、`sk_haichaolianjian`、`sk_jianzhongtuna`、`sk_dugu9` |
| `set_wudang_taiji` | 武当·太极 | `sk_taijiquan`、`sk_taijijian`、`sk_liangyixinfa`、`sk_taijituishou`、`sk_mianzhang`、`sk_tiyunzong` |
| `set_wudang_zhenwu` | 武当·真武 | `sk_chunyangwuji`、`sk_wudangjiuyang`、`sk_huzhaojuehushou`、`sk_wujixuangongquan`、`sk_shenmen13`、`sk_yitiantulonggong`、`sk_zhenwuqijie` |
| `set_xiaoyao_xiaoyaoyou` | 逍遥游 | `sk_beiming`、`sk_lingbo`、`sk_zhemei`、`sk_baihongzhang`、`sk_langhuanjian`、`sk_zuowangxinfa`、`sk_tianjianzhifa`、`sk_fuyaotui` |
| `set_xingxiu_laoxian` | 星宿老仙 | `sk_huagong`、`sk_chousuizhang`、`sk_sanxiaoxiaoyaosan`、`sk_fushidu`、`sk_huoduozhang`、`sk_lianchongshu`、`sk_chanhunwang`、`sk_bilinzhang`、`sk_xingxiudugong` |
| `set_murong_huanshi` | 以彼之道 | `sk_douzhuan`、`sk_canhezhi`、`sk_baijiadao`、`sk_murongjian`、`sk_canheqigong`、`sk_shuixiefeidao`、`sk_longchengxinfa`、`sk_yizhenfengdao` |
| `set_mizong_mingwang` | 大轮明王 | `sk_huoyandao`、`sk_xiaowuxiang`、`sk_dashouyin`、`sk_mizonghufashen`、`sk_zhuohuogong`、`sk_jingangjue`、`sk_wuxiangjiezhi`、`sk_duoluoyezhi`、`sk_ranmudaofa`、`sk_jiashafumogong` |
| `set_qidan_xiaofeng` | 契丹英雄 | `sk_xianglong18`、`sk_qinlonggong`、`sk_jingedangkouqiang`、`sk_canglangdao`、`sk_tuxiongbohuquan`、`sk_taizuchangquan`、`sk_caoyuanchangqiang`、`sk_liaodongpaochui` |
| `set_mingjiao_guangming` | 光明圣火 | `sk_qiankun`、`sk_dajiutianshou`、`sk_guangmingxinfa`、`sk_dafengyunfeizhang`、`sk_guangmingquan`、`sk_guangmingduandao` |
| `set_mingjiao_shenghuo` | 波斯圣火 | `sk_shenghuoling`、`sk_shenghuoxinfa`、`sk_shenghuotunajue`、`sk_mingjiaoduanjian`、`sk_shenghuobu` |
| `set_yitian_emei` | 倚天·峨眉 | `sk_emeijiuyang`、`sk_emeixinfa`、`sk_jindingmianzhang`、`sk_piaoxuechuanyunzhang`、`sk_jindingjiushi`、`sk_miejuejian`、`sk_emeitunajue`、`sk_emeirumenzhang`、`sk_emeirumenjian`、`sk_liuxujian`、`sk_emeishenfa` |
| `set_kongtong_qishang` | 崆峒七伤 | `sk_qishangquan`、`sk_qishangchujue`、`sk_kongtongyangshenggong`、`sk_kongtongjian`、`sk_kongtongtunajue`、`sk_kongtongrumenquan`、`sk_kongtongrumenjian` |
| `set_mingjiao_sida_fawang` | 四大法王 | `sk_hanbingmianzhang`、`sk_lieyanzhang`、`sk_qingyifashen`、`sk_shizihou` |
| `set_huashan_qijian` | 华山气剑 | `sk_huashanrumenjian`、`sk_huashantuna`、`sk_huashanjianfa`、`sk_yangwujian`、`sk_huashanxinfa`、`sk_kuangfengkuaijian`、`sk_taiyuesanqingfeng`、`sk_zixiashengong` |
| `set_songshan_hanbing` | 嵩山寒岳 | `sk_songshanrumenjian`、`sk_songyangtuna`、`sk_songshanjianfa`、`sk_songyangxinfa`、`sk_dayinyangshou`、`sk_hanbingzhenqi` |
| `set_riyue_heimu` | 黑木日月 | `sk_heimuyarumenjian`、`sk_heimutuna`、`sk_riyuejianfa`、`sk_riyuexinfa`、`sk_heimuyajianfa`、`sk_xixing`、`sk_kuihua` |
| `set_linjia_bixie` | 林家辟邪 | `sk_linjiarumenjian`、`sk_biaojuxinfa`、`sk_linjiajianfa`、`sk_linjiashou`、`sk_fantianzhang`、`sk_bixie`、`sk_kuihua` |
| `set_xueshan_jinwu` | 雪山金乌 | `sk_taxuewuhen`、`sk_xueshanjianfa`、`sk_wuwangshengong`、`sk_jinwudaofa` |
| `set_huashan_hunyuan` | 华山混元 | `sk_hunyuangong`、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan` |
| `set_tiejian_musang` | 铁剑木桑 | `sk_shenxing`、`sk_tiejianjianfa`、`sk_mantianhuayu`、`sk_tiejianqipanjian`、`sk_tiejianxinfa` |
| `set_shenlong_jiaozhu` | 神龙教·教主武库 | `sk_shenlongrumenquan`、`sk_shenlongshebu`、`sk_shenlongzhang`、`sk_yingxiongsanzhao`、`sk_meirensanzhao`、`sk_shenlongxinfa` |
| `set_shenzhao_liancheng` | 神照·连城 | `sk_yuzhongduanquan`、`sk_yuzhongduandao`、`sk_yuzhongqinna`、`sk_xiangxituna`、`sk_meinianshengxinfa`、`sk_shenzhao` |
| `set_yuanyangdao_renzhe` | 鸳鸯刀·仁者 | `sk_yuanyangjibenjian`、`sk_renzhetuna`、`sk_yuanyangshuangdao`、`sk_fuqidaofa` |
| `set_honghua_shisidangjia` | 红花十四当家 | `sk_baihuacuo`、`sk_paoding`、`sk_honghuahuiheji`、`sk_honghuaxinfa`、`sk_jindifa`、`sk_honghuachangquan`、`sk_honghuajian`、`sk_honghuabu` |
| `set_hujia_lengyue` | 胡家冷月 | `sk_hujiadao`、`sk_hujiaquan`、`sk_hujiadaoxinfa`、`sk_hujiaxiaolianquan`、`sk_liaodonghushendao` |
| `set_jianghu_baijia` | 江湖百家 | `sk_jianghubaizhanjian`、`sk_yanzisanchaoshui`、`sk_qingfengjian`、`sk_panlonggun`、`sk_dengpingdushui`、`sk_feishahuangshi`、`sk_luoyedao`、`sk_liuxingchui`、`sk_wuyingshou`、`sk_jianghutuna`、`sk_xingqizhou`、`sk_yexinggong`、`sk_hutiaodaofa`、`sk_huiliuquan`、`sk_taizuchangquan`、`sk_jianghurumenjian`、`sk_pingfengjian`、`sk_hengdaorumenzhao`、`sk_shaobanggun`、`sk_duanqiangfa`、`sk_sanshou`、`sk_yanxingbu`、`sk_tunaqianjue`、`sk_dantianyangqi`、`sk_huxixingqi`、`sk_tongxingfeishi`、`sk_tiexiu`、`sk_jianghuchangquan`、`sk_caoshangfei` |
| `set_junwu_baizhan` | 军伍百战 | `sk_pojunqiangfa`、`sk_baizhanxinfa`、`sk_shouchengzhen`、`sk_duanzhenqiang`、`sk_junzhongdao`、`sk_zhenqijian`、`sk_jundituna`、`sk_xingjunbu`、`sk_shouchengfa`、`sk_changqiangrumen`、`sk_junwuduandao`、`sk_junwuchangjian` |
| `set_penglai_chaosheng` | 蓬莱潮生 | `sk_donghaichaoshengzhang`、`sk_tianwangbuxin`、`sk_penglaiquan`、`sk_chaoyinxinfa`、`sk_penglairumenquan`、`sk_haifengbu` |
| `set_yihua_shuangbi` | 移花双璧 | `sk_yihuagongjian`、`sk_yihuagongqinggong`、`sk_yihuajieyu`、`sk_mingyugong` |
| `set_baiyun_juezhan` | 白云决战 | `sk_baiyunjichujian`、`sk_baiyunjianwei`、`sk_feixiandao`、`sk_tianwaifeixian`、`sk_ximenjiandao` |

### 8.5 补录天阶与崆峒五行心法复核（经脉落地终审）

补录、升阶与主运地位都不自动产生套装关系。以下九门均无正式套装标签（空数组或省略），本版保持不加入；此表是排除边界与提案处置记录，不是 `SetDef.members` 的追加层。以后若作者采纳入套，须同次修改 §8.4、对应正式条目与武学卡反向标签，再复算实际栏位、有效品阶中位数和预算。

| 武学 | 绝对品阶 | 相关主题与本版处置 |
|---|---:|---|
| `sk_duanshiyangjue` 段氏一阳诀 | 11 | 不加入 `set_dali_yiyang`；维持其六成员 |
| `sk_xianglongxinggong` 降龙行功 | 12 | 不加入 `set_gaibang_bangzhu` 或 `set_qidan_xiaofeng`；维持五／八成员 |
| `sk_tianshanliuyangxinfa` 天山六阳心法 | 11 | 不加入 `set_xiaoyao_xiaoyaoyou`；维持八成员 |
| `sk_taohuaguiyuanjue` 桃花归元诀 | 11 | 不加入 `set_taohuadao`；射雕残承／神雕完整仍为同一武学，不按两个来源计件 |
| `sk_tiezhangyunqigong` 铁掌运气功 | 10 | 不复活 §19 已淘汰的铁掌候选，也不新建套装 |
| `sk_xuanminghanyuangong` 玄冥寒元功 | 10 | 不复活 §19 已淘汰的玄冥候选；装备兼容与套装计件分开 |
| `sk_bosishenghuoxuangong` 波斯圣火玄功 | 10 | 不加入 `set_mingjiao_shenghuo`；维持五成员 |
| `sk_huashanziqijue` 华山紫气诀 | 10 | 不加入 `set_huashan_qijian`；维持八成员 |
| `sk_kongtongwuxingxinfa` 崆峒五行心法 | 8 | 不加入 `set_kongtong_qishang`；维持七成员，见 §13.4 |

上述八门天阶的卡片归 `catalog/skills-bulu-01/02/04/05`，崆峒五行心法归补录 04；具体路线、性质和主运规则只引用图鉴与 `design/21`。正式成员注册表仍为 44 套、305 条武学关系、292 个唯一武学；`eq_yitianjian` 仍是唯一装备成员。

---

## 9. 少林（5 套）

### 9.1 `set_shaolin_jingang` 少林金刚

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_longzhaoshou`、`sk_yijinjing`、`sk_tieshazhang`、`sk_tongrenhenglian` |
| 2 件 | 拿穴 `attr:seal pp +4×G`【属性层】 |
| 3 件 | 招架 `attr:parry pct +3%×G`【属性层】 |
| 4 件 | 拳脚招式 `Z3 +4%×G`【Z3】 |
| 品阶 | 玄中～天上；完整绝对品阶 `[5,6,8,12]` → `g_set=7` |
| 依据 | 易筋经、龙爪手为少林传承；铁砂掌、铜人横练的组合与奖励为**（原创扩展）** |

可达：高 `C:四门` →4；中 `C:二内+二拳` →4；低·鹿鼎 `C:易筋经+龙爪手，L:铁砂掌+铜人横练` →4；连城／白马／鸳鸯只有携入一内一拳 →2。

### 9.2 `set_shaolin_luohan` 少林罗汉

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_luohanquan`、`sk_shaolinzhuanggong`、`sk_shaolinxinfa`、`sk_shaolingunfa`、`sk_luohanbu` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | `attr:resCC pp +3×G`【属性层】 |
| 4 件 | 少林招式 `Z3 +3%×G`【Z3】 |
| 品阶 | 黄下～黄中；入门保底套 |
| 依据 | 罗汉拳及少林基础传承为主题；桩功、心法、步法与奖励为**（原创扩展）** |

可达：高／中在任一少林投放书界本土学拳、桩、心法、棍即 4；低·鹿鼎同样本土 4；连城／白马／鸳鸯无少林本土，只能携入内、拳、兵 →3，轻功不能携带。

### 9.3 `set_shaolin_damo` 达摩遗风

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_yijinjing`、`sk_xisuijing`、`sk_damoxinjing`、`sk_damojianfa`、`sk_yiweidujiang` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 内功招式 `cost −2%×G`【cost】 |
| 4 件 | 内功来源招式 `Z3 +3%×G`【Z3】 |
| 品阶 | 玄中～天上 |
| 依据 | 达摩与少林内功传说主题；“洗髓经”纳入、成套和效果为**（原创扩展）**，达摩剑法名目**（待考）** |

可达：高·天龙 `L:易筋经+达摩心经+一苇渡江，C:达摩剑法` →4；中·侠客 `L:洗髓经+达摩心经，C:易筋经+达摩剑法` →4；低·鹿鼎 `L:洗髓经，C:易筋经+达摩剑法` →3，轻功不可携入；其余低武至多 2。

### 9.4 `set_saodiseng` 扫地僧·藏经阁

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_yijinjing`、`sk_boruoxinjing`、`sk_xumishanzhang`、`sk_nianhuazhi` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 七十二绝技招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 开战对自身 `applyBuff bf_mian_xin` 1 回合，每场一次【机制】 |
| 品阶 | 玄下～天上 |
| 依据 | 扫地僧在藏经阁化解萧远山、慕容博戾气的原著主题；具体套装为**（原创扩展）**；须弥山掌名目**（待考）** |

可达：高·天龙四门本土 →4；中无共同本土，`C:易筋经+须弥山掌+拈花指`，心经不能携入 →3；低·鹿鼎 `L:般若心经+拈花指，C:易筋经+须弥山掌` →4；其他低武仅一内一拳 →2。

### 9.5 `set_fangzheng` 方证·少林三战

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_yijinjing`、`sk_qianshourulaizhang`、`sk_yizhichan`、`sk_jinzhongzhao` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | `attr:counter pp +2×G`【属性层】 |
| 4 件 | 对 `sect_riyue` 目标 `Z3 +3%×G`【Z3】 |
| 品阶 | 地中～天上 |
| 依据 | 方证的易筋经、千手如来掌及笑傲三战主题有原著依据；一指禅、金钟罩关联及数值为**（原创扩展）** |

可达：高·倚天只可携四门（内2、拳2）→4；中·笑傲四门本土 →4，其他中武也可携四门 →4；低武一内一拳最多 2，鹿鼎虽有少林来源仍须章节验证同周目，保守记 3。

---

## 10. 五绝与射雕传承（6 套）

### 10.1 `set_gaibang_bangzhu` 丐帮帮主

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_xianglong18`、`sk_dagou`、`sk_dagouzhen`、`sk_canfengyinlugong`、`sk_yunyoubu` |
| 2 件 | `attr:tough pct +3%×G`【属性层】 |
| 3 件 | 棍杖／拳掌招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 相邻友方倒地时对自身 `modRage +6×G`，每回合一次【机制】 |
| 品阶 | 黄上～天上 |
| 依据 | 降龙、打狗棒法与丐帮帮主关联有原著依据；阵法、心法、步法和奖励含**（原创扩展）** |

可达：高·射雕本土五门 →5；中·笑傲本土餐风、打狗阵并携降龙、打狗 →4；低·鹿鼎本土餐风、云游步并携降龙、打狗 →4；其余低武携一拳一兵 →2。打狗棒、酒葫芦未进入成员。

### 10.2 `set_taohuadao` 桃花岛主

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_tanzhi`、`sk_bihai`、`sk_lanhuafuxueshou`、`sk_yuxiaojianfa`、`sk_luoyingshenjianzhang`、`sk_bitaoxuangong` |
| 2 件 | `attr:effHit pct +3%×G`【属性层】 |
| 3 件 | 侧击／背击招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次向目标施加 `mind` 或 `seal` 时，对自身 `ctShift +30×G`【ct】 |
| 品阶 | 地下～天下 |
| 依据 | 黄药师及桃花岛武学为原著主题；碧涛玄功、成套效果为**（原创扩展）**，程英相关来源**（待考）** |

可达：高·射雕／神雕本土任选内、拳2、兵、杂即 4；中无本土时 `C:碧涛+弹指+兰花+玉箫剑` →4；低只能携一内、一拳、一兵 →3，碧海不可携。玉箫、软猬甲不计成员。

### 10.3 `set_baituoshan` 白驼山主

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_hama`、`sk_lingshezhangfa`、`sk_lingshequan`、`sk_nizhuanjingmai`、`sk_tashaxing`、`sk_shexingdiaoshou` |
| 2 件 | `attr:resPoison pp +3×G`【属性层】 |
| 3 件 | 对中毒目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 每回合首次被拳脚近身招式伤害后，对自身 `applyBuff bf_renjin` 1 回合【属性层／机制】 |
| 品阶 | 黄中～天下 |
| 依据 | 欧阳锋白驼武学与蛇毒主题有原著依据；踏沙行、蛇形刁手和效果为**（原创扩展）**；杖法正式名**（待考）** |

可达：高·射雕／神雕本土 6 选4；中 `C:蛤蟆+逆转+灵蛇拳+灵蛇杖`（内2、拳1、兵1）→4；低只能一内、一拳、一兵 →3，轻功不能携。白驼蛇杖不计成员；阴阳相冲照常。

### 10.4 `set_dali_yiyang` 一阳

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_yiyangzhi`、`sk_liumai`、`sk_kurongchangong`、`sk_yiyangshuzhi`、`sk_duanjiajianfa`、`sk_tiannanxinfa` |
| 2 件 | `attr:seal pp +3×G`【属性层】 |
| 3 件 | 阳性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 治疗招式 `attr:healPower pp +3×G`【属性层】 |
| 品阶 | 黄上～天上 |
| 依据 | 大理段氏、一阳指、六脉神剑及枯荣禅功为原著主题；天南心法与数值为**（原创扩展）** |

可达：高·天龙／射雕／神雕本土可取内2、拳2、兵2 →4以上；中 `C:枯荣+天南+一阳指+段家剑` →4；低一内、一拳、一兵 →3，无大理本土补位。

### 10.5 `set_jiuyin_zhengzong` 九阴正宗

| 项 | 定稿 |
|---|---|
| 成员（10） | `sk_jiuyin`、`sk_jiuyinshenzhao`、`sk_yihun`、`sk_dafumoquan`、`sk_yijinduangupian`、`sk_shexinglifan`、`sk_jiuyinliaoshangpian`、`sk_jiuyintiaoxipian`、`sk_shoujinpian`、`sk_biguqipian` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 九阴系效果 `attr:effHit pct +2%×G`【属性层】 |
| 4 件 | 九阴系招式 `Z3 +3%×G`【Z3】 |
| 6 件 | 每场首次回合开始且自身有 `injury` 时，对自身 `dispel` 1 个不高于 `g_set` 的 `injury`【机制】 |
| 品阶 | 玄中～天上 |
| 依据 | 《九阴真经》诸篇与正练主题有原著名目；拆分为多技能、阈值与效果为**（原创扩展）**，神爪名称**（待考）** |

可达：高·射雕／神雕本土可装内3、拳2、杂2、轻1达 6；中纯携入内2、拳2达 4，非核心不可携；低携一内一拳最多 2。邪练白骨爪不属于本套。

性质核对（AR-18）：九阴正宗按九阴传承计成员；九阴调息篇 `sk_jiuyintiaoxipian`、辟谷气篇 `sk_biguqipian` 现均为阴，见 `catalog/skills-wujue.md` 对应卡。它们与调和的九阴总纲同属本套；“九阴系”效果是谱系筛选，不要求全套内功同为阴或调和，故 §8.4 成员、上述档位及可达件数均不变。

### 10.6 `set_guojing_xiazhe` 侠之大者

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_xianglong18`、`sk_jiuyin`、`sk_kongming`、`sk_zuoyouhubo`、`sk_zhebiejianshu`、`sk_wumuyishu` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 拳掌招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 相邻友方受伤后，对自身 `applyBuff bf_yuanzhuan` 1 回合，每回合一次【属性层／机制】 |
| 品阶 | 地中～天上 |
| 依据 | 郭靖所学降龙、九阴、空明、左右互搏、哲别箭术和《武穆遗书》均有原著关联；成套为**（原创扩展）** |

可达：高·射雕／神雕本土可装拳2、内1、杂2、暗1 →6；中只能携九阴、降龙、空明（内1、拳2）→3；低携九阴、降龙 →2，左右、箭术、兵法不可携。

---

## 11. 道家、古墓与剑冢（6 套）

### 11.1 `set_quanzhen_beidou` 全真·北斗

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_xiantiangong`、`sk_jinguanyusuo`、`sk_quanzhenxinfa`、`sk_quanzhenjian`、`sk_tongguijian`、`sk_tiangang`、`sk_dabeidouzhen` |
| 2 件 | `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 全真招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 与至少 2 名友方距离≤2时 `Z4 +3%×G`；否则 `attr:parry pct +2%×G`【Z4／属性层】 |
| 品阶 | 玄中～天中 |
| 依据 | 全真教与天罡北斗阵为原著主题；心法拆分、档位效果为**（原创扩展）** |

可达：高·射雕／神雕本土内3、兵2、杂2中任选 4；中可携内2、兵2 →4；低 `C:先天功+同归剑`，鹿鼎本土全真心法 →3，杂学不能携。

### 11.2 `set_gumu_yunv` 古墓·玉女

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_yunvxinjing`、`sk_hanyuxinjue`、`sk_yunvjian`、`sk_suxin`、`sk_meinvquan`、`sk_jinlingsuo`、`sk_gumuqinggong`、`sk_yufengzhen` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 阴性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 开战对自身 `applyBuff bf_youshi` 2 回合，每场一次【机制】 |
| 品阶 | 玄下～天下 |
| 依据 | 古墓、玉女心经、玉女剑法等为原著主题；寒玉心诀与数值为**（原创扩展）** |

可达：高·神雕本土任取内2、剑2、拳1、轻1 →4以上；中 `C:玉女心经+寒玉心诀+玉女剑+金铃索` →4；低一内、一拳、一兵 →3，轻功／暗器不可携。

### 11.3 `set_shendiao_xialv` 神雕侠侣

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_suxin`、`sk_anran`、`sk_xuantie`、`sk_yunvxinjing`、`sk_yunvjian`、`sk_quanzhenjian` |
| 2 件 | 与任一友方相距≤2时 `Z3 +3%×G`【Z3】 |
| 3 件 | `attr:resPoison pp +3×G`【属性层】 |
| 4 件 | 每场首次有相邻友方倒地时，对自身 `modRage +8×G`【机制】 |
| 品阶 | 玄中～天中 |
| 依据 | 杨过、小龙女及玉女素心合璧为原著主题；黯然、玄铁并入与奖励为**（原创扩展）** |

可达：高·神雕六门本土，内1、拳1、兵3可达 5；中可携内1、拳1、兵2 →4；低只有一内、一拳、一兵 →3。君子／淑女剑未有装备反向标签，暂不计。

### 11.4 `set_dugu_jianzhong` 独孤剑冢

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_xuantie`、`sk_lijianyi`、`sk_ruanjianyi`、`sk_zhongjianyi`、`sk_mujianyi`、`sk_haichaolianjian`、`sk_jianzhongtuna`、`sk_dugu9` |
| 2 件 | 剑法 `Z2 +3%×G`【Z2】 |
| 3 件 | `attr:crit flat +3×G`【属性层】 |
| 4 件 | 剑法攻击的目标招架率系数 `targetParryMult = max(0.50, 1−0.04×G)`【Z0 判定】 |
| 5 件 | 剑法 `Z3 +3%×G`【Z3】 |
| 品阶 | 黄中～天上 |
| 依据 | 剑冢重、木、无剑境与独孤九剑关联为跨书主题；组合与数值为**（原创扩展）** |

可达：高·神雕本土玄铁、四剑意、海潮、吐纳可达 5；中·笑傲 `L:独孤九剑，C:玄铁剑+海潮剑+剑冢吐纳` →4；低只能携一内一兵，剑意杂学不可携 →2。玄铁重剑装备不计成员。

### 11.5 `set_wudang_taiji` 武当·太极

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_taijiquan`、`sk_taijijian`、`sk_liangyixinfa`、`sk_taijituishou`、`sk_mianzhang`、`sk_tiyunzong` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | `attr:counter pp +2×G`【属性层】 |
| 4 件 | 招架成功后 30% 对攻击者 `applyBuff bf_shiheng` 1 回合；同类取高【机制】 |
| 品阶 | 玄中～天中 |
| 依据 | 张三丰太极拳剑与武当主题有原著依据；推手、两仪心法和奖励为**（原创扩展）** |

可达：高·倚天本土六选4；中·笑傲本土太极残承、两仪、推手、绵掌可 4；低 `C:太极拳+两仪心法+太极剑` →3，连城／鸳鸯本土绵掌可补至 4。

### 11.6 `set_wudang_zhenwu` 武当·真武

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_chunyangwuji`、`sk_wudangjiuyang`、`sk_huzhaojuehushou`、`sk_wujixuangongquan`、`sk_shenmen13`、`sk_yitiantulonggong`、`sk_zhenwuqijie` |
| 2 件 | 武当招式 `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 阳性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 与至少 2 名友方距离≤2时 `Z4 +3%×G`；否则 `attr:resCC pp +2×G`【Z4／属性层】 |
| 品阶 | 地下～地中 |
| 依据 | 武当七侠与真武七截阵为原著主题；技能拆分与奖励为**（原创扩展）** |

可达：高·倚天本土七门 →4以上；中·笑傲／侠客本土除九阳、倚天屠龙功外可达 5；低 `C:纯阳+虎爪+神门剑` →3，无本土时不能 4。

---

## 12. 天龙旁支与跨门传承（5 套）

### 12.1 `set_xiaoyao_xiaoyaoyou` 逍遥游

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_beiming`、`sk_lingbo`、`sk_zhemei`、`sk_baihongzhang`、`sk_langhuanjian`、`sk_zuowangxinfa`、`sk_tianjianzhifa`、`sk_fuyaotui` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 对距离≥3的目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 开场对自身 `applyBuff bf_canying` 1 层，每场一次【机制】 |
| 5 件 | 拳脚命中后自身 `drainHp pctOfDamage:min(0.15,0.02×G)`，每回合一次【settle】 |
| 品阶 | 黄上～天上 |
| 依据 | 逍遥派诸绝学有原著主题；坐忘、天鉴、扶摇、琅嬛剑及成套为**（原创扩展）** |

可达：高·天龙本土可装内2、拳3、兵1、轻1达 5；中可携内2、拳2、兵1 →5；低一内、一拳、一兵 →3，无本土补位。七宝指环未落装备标签，不计。

### 12.2 `set_xingxiu_laoxian` 星宿老仙

| 项 | 定稿 |
|---|---|
| 成员（9） | `sk_huagong`、`sk_chousuizhang`、`sk_sanxiaoxiaoyaosan`、`sk_fushidu`、`sk_huoduozhang`、`sk_lianchongshu`、`sk_chanhunwang`、`sk_bilinzhang`、`sk_xingxiudugong` |
| 2 件 | 毒效果 `attr:effHit pct +3%×G`【属性层】 |
| 3 件 | 对中毒目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 自身每回合首次向目标施加 `poison` 时，对自身 `modRage +3×G`【机制】 |
| 5 件 | `attr:resPoison pp +3×G`【属性层】 |
| 品阶 | 黄上～地上 |
| 依据 | 丁春秋、化功大法与星宿用毒为原著主题；多门补位和奖励为**（原创扩展）** |

可达：高·天龙本土内3、拳3、兵1、杂2可达 5；中携内2、拳2、兵1 →5；低携一内、一拳、一兵 →3，毒杂学不可携。神木王鼎是奇物，不计。

### 12.3 `set_murong_huanshi` 以彼之道

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_douzhuan`、`sk_canhezhi`、`sk_baijiadao`、`sk_murongjian`、`sk_canheqigong`、`sk_shuixiefeidao`、`sk_longchengxinfa`、`sk_yizhenfengdao` |
| 2 件 | `attr:counter pp +2×G`【属性层】 |
| 3 件 | 受到招式伤害后对自身 `modRage +3×G`，每回合一次【机制】 |
| 4 件 | 招架成功后对攻击者 `triggerMove basic`、`powerMul:0.4`、`tag:counter`，每回合一次【机制】 |
| 5 件 | 每场首次遭距离≤3、品阶不高于 `g_set` 的绝招命中判定时，`mirror chance:1 powerMul:0.8 maxRange:3`【机制】 |
| 品阶 | 黄上～天下 |
| 依据 | 姑苏慕容“以彼之道”与斗转星移为原著主题；补位武学和成套为**（原创扩展）** |

可达：高·天龙本土内3、拳1、兵3、暗1可达 5；中携内2、拳1、兵2 →5；低携一内、一拳、一兵 →3，暗器不能携。

### 12.4 `set_mizong_mingwang` 大轮明王

| 项 | 定稿 |
|---|---|
| 成员（10） | `sk_huoyandao`、`sk_xiaowuxiang`、`sk_dashouyin`、`sk_mizonghufashen`、`sk_zhuohuogong`、`sk_jingangjue`、`sk_wuxiangjiezhi`、`sk_duoluoyezhi`、`sk_ranmudaofa`、`sk_jiashafumogong` |
| 2 件 | 火焰招式 `Z3 +3%×G`【Z3】 |
| 3 件 | `attr:rageGain pp +3×G`【属性层】 |
| 4 件 | 火焰刀 `modRange delta:+1`【招式射程】 |
| 5 件 | 每场首次施放绝招后，对自身 `ctShift +20×G`【ct】 |
| 品阶 | 黄上～天中 |
| 依据 | 鸠摩智以小无相功催动少林绝技为原著主题；密宗补位、范围与数值为**（原创扩展）** |

可达：高·天龙本土十选 5；中携内2、拳2、兵2可达 5；低·鹿鼎 `C:小无相+火焰刀+燃木刀，L:拙火+护法身+大手印+金刚橛`，按内3、拳2、兵2实际可达 7；其他低武纯携入 3。

### 12.5 `set_qidan_xiaofeng` 契丹英雄

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_xianglong18`、`sk_qinlonggong`、`sk_jingedangkouqiang`、`sk_canglangdao`、`sk_tuxiongbohuquan`、`sk_taizuchangquan`、`sk_caoyuanchangqiang`、`sk_liaodongpaochui` |
| 2 件 | 拳脚招式 `Z2 +3%×G`【Z2】 |
| 3 件 | 相邻敌人≥3时 `Z3 +3%×G`、`Z4 +2%×G`【Z3／Z4】 |
| 4 件 | 击杀后对自身 `modRage +5×G`，每回合一次【机制】 |
| 5 件 | 气血首次低于30%时对自身 `applyBuff bf_kuangshi` 2 回合，每场一次【机制】 |
| 品阶 | 黄上～天上 |
| 依据 | 萧峰的降龙、擒龙与契丹身份为原著主题；军阵武学组合与数值为**（原创扩展）** |

可达：高·天龙本土并携跨组成员可达 5；中携拳2、兵2，且通行太祖长拳本土重学 →5；低携降龙、金戈枪并本土重学太祖长拳 →3。正式成员中没有第二门鹿鼎本土契丹武学，故低武不能据现有投放达到 4 件。

---

## 13. 倚天门派（5 套）

### 13.1 `set_mingjiao_guangming` 光明圣火

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_qiankun`、`sk_dajiutianshou`、`sk_guangmingxinfa`、`sk_dafengyunfeizhang`、`sk_guangmingquan`、`sk_guangmingduandao` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 阳性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 开战对自身 `applyBuff bf_mian_kong` 1 回合，每场一次【机制】 |
| 品阶 | 黄中～天中 |
| 依据 | 明教、乾坤大挪移及光明顶为原著主题；补位武学和效果为**（原创扩展）** |

可达：高·倚天本土六选4；中携内2、拳2或内2、拳1、兵1 →4；低一内、一拳、一兵 →3。九阳神功 `setTags` 为空，明确不计成员。

### 13.2 `set_mingjiao_shenghuo` 波斯圣火

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_shenghuoling`、`sk_shenghuoxinfa`、`sk_shenghuotunajue`、`sk_mingjiaoduanjian`、`sk_shenghuobu` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 侧击招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次闪避成功后对自身 `applyBuff bf_ningshen` 1 回合【属性层／机制】 |
| 品阶 | 黄中～天上 |
| 依据 | 圣火令与波斯总教为原著主题；心法、短剑、步法与奖励为**（原创扩展）** |

可达：高·倚天本土 5；中携两内、一拳、一兵 →4，轻功不能携；低携一内、一拳、一兵 →3，无明教本土补位。`sk_shenghuoling` 是拳脚武学；圣火令装备不计。

### 13.3 `set_yitian_emei` 倚天·峨眉

| 项 | 定稿 |
|---|---|
| 成员（12） | `sk_emeijiuyang`、`sk_emeixinfa`、`sk_jindingmianzhang`、`sk_piaoxuechuanyunzhang`、`sk_jindingjiushi`、`sk_miejuejian`、`sk_emeitunajue`、`sk_emeirumenzhang`、`sk_emeirumenjian`、`sk_liuxujian`、`sk_emeishenfa`、`eq_yitianjian` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | 掌／剑招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 治疗与护心效果 `attr:healPower pp +2×G`【属性层】 |
| 6 件 | 持倚天剑时剑法 `Z2 +3%×G`；未持剑则 `attr:resMind pp +2×G`【Z2／属性层】 |
| 品阶 | 黄中～天中；装备有效品阶也先受本界规则处理 |
| 依据 | 峨眉传承与倚天剑为原著主题；入门链、六件效果为**（原创扩展）**，部分武学名目**（待考）** |

可达：高·倚天本土内3、拳3、兵3、轻1并穿倚天剑，可达 6；中携内2、拳2、兵2并穿装备可达 6；低携内1、拳1、兵1＋倚天剑 →4。铁指环、九阴不计。

### 13.4 `set_kongtong_qishang` 崆峒七伤

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_qishangquan`、`sk_qishangchujue`、`sk_kongtongyangshenggong`、`sk_kongtongjian`、`sk_kongtongtunajue`、`sk_kongtongrumenquan`、`sk_kongtongrumenjian` |
| 2 件 | `attr:resInjury pp +3×G`【属性层】 |
| 3 件 | 七伤拳施放时对自身 `shield hpMax×1%×G` 1 回合，每回合一次【settle】 |
| 4 件 | 气血低于50%时拳掌 `Z3 +3%×G`【Z3】 |
| 品阶 | 黄中～地上 |
| 依据 | 崆峒七伤拳为原著主题；初诀、养生功、入门链及奖励为**（原创扩展）** |

可达：高·倚天本土 7 选4；中携内2、拳2、兵2可达 4；低一内一拳一兵 →3。套装只缓和、不删除七伤代价。

**终审核算**：七成员依上表顺序的绝对品阶为 `[9,6,5,4,3,3,2]`；倚天本土全装时占内2、拳3、兵2，排序 `[2,3,3,4,5,6,9]`，故 `g_set=4`。若只装七伤拳、七伤初诀、崆峒养生功、崆峒剑，则排序 `[4,5,6,9]`，`g_set=floor((5+6)/2)=5`；增加低阶成员可以降低中位数，不能只取最高四件。后四件携至中武、无抵消且均为完整外来来源时为 `[2,3,4,7]`，`g_set=floor((3+4)/2)=3`。低武只携七伤拳、养生功、崆峒剑则为 `[5,1,1]`，`g_set=1`，仅激活 2／3 件档。

`catalog/skills-yitian` 的七条正式 `setTags` 与 §8.4／本条逐 ID 闭合；补录 04 的崆峒五行心法 `setTags:[]` 不计第八件。养生功与五行心法现为阴、崆峒吐纳诀为调和，不改变成员资格；七伤免代价所需的主运与有效品阶仍只见 `design/05` §9.1.1，辅运、套装护盾或多件齐备均不能代替该条件。

### 13.5 `set_mingjiao_sida_fawang` 四大法王

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_hanbingmianzhang`、`sk_lieyanzhang`、`sk_qingyifashen`、`sk_shizihou` |
| 2 件 | `attr:resCC pp +3×G`【属性层】 |
| 3 件 | 冰／火／音功招式 `attr:effHit pct +3%×G`【属性层】 |
| 4 件 | 每场首次向目标施加 `cc` 时，对自身 `modRage +5×G`【机制】 |
| 品阶 | 玄～天；具体品阶见所属图鉴 |
| 依据 | 明教四大法王人物与武学意象为原著主题；四风格成套和奖励为**（原创扩展）** |

可达：高·倚天四门本土 →4；中携两拳，轻功／音功不能携 →2；低同为 2。狮子吼只表示谢逊来源，不改变少林归属。

---

## 14. 笑傲江湖门派（4 套）

### 14.1 `set_huashan_qijian` 华山气剑

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_huashanrumenjian`、`sk_huashantuna`、`sk_huashanjianfa`、`sk_yangwujian`、`sk_huashanxinfa`、`sk_kuangfengkuaijian`、`sk_taiyuesanqingfeng`、`sk_zixiashengong` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | 内功招式与剑法招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 剑法招架成功后对自身 `ctShift +20×G`，每回合一次【ct】 |
| 6 件 | 剑法 `Z2 +2%×G`【Z2】 |
| 品阶 | 黄上～天上 |
| 依据 | 华山气宗、剑宗与独孤九剑为原著主题；基础链与跨宗成套为**（原创扩展）** |

可达：高可携内3、兵3 →6；中·笑傲本土内3、剑3可达 6；低只能一内一兵 →2，无华山本土补位。

### 14.2 `set_songshan_hanbing` 嵩山寒岳

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_songshanrumenjian`、`sk_songyangtuna`、`sk_songshanjianfa`、`sk_songyangxinfa`、`sk_dayinyangshou`、`sk_hanbingzhenqi` |
| 2 件 | `attr:resCold pp +3×G`【属性层】 |
| 3 件 | 对有 `cold` 状态目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 施加寒气的效果命中 `attr:effHit pct +2%×G`【属性层】 |
| 品阶 | 黄上～地；具体见图鉴 |
| 依据 | 嵩山剑法、寒冰真气及左冷禅主题有原著依据；入门链和奖励为**（原创扩展）** |

可达：高可携内2、拳1、兵2 →5；中·笑傲本土 6 →4以上；低一内一拳一兵 →3。吸星对寒冰的反制照常。

### 14.3 `set_riyue_heimu` 黑木日月

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_heimuyarumenjian`、`sk_heimutuna`、`sk_riyuejianfa`、`sk_riyuexinfa`、`sk_heimuyajianfa`、`sk_xixing`、`sk_kuihua` |
| 2 件 | `attr:spd pct +2%×G`【属性层】 |
| 3 件 | 侧击／背击 `Z3 +3%×G`【Z3】 |
| 4 件 | 近身内功招式命中后对自身 `applyBuff bf_piaohu` 1 回合，每回合一次【属性层／机制】 |
| 品阶 | 黄上～天阶 |
| 依据 | 日月神教、黑木崖、吸星与葵花为原著主题；入门链和奖励为**（原创扩展）** |

可达：高可携内3、兵3 →6；中·笑傲本土 7 选4；低携一内一兵 →2。易筋经不是成员；吸星异种真气和葵花代价不可免除。

### 14.4 `set_linjia_bixie` 林家辟邪

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_linjiarumenjian`、`sk_biaojuxinfa`、`sk_linjiajianfa`、`sk_linjiashou`、`sk_fantianzhang`、`sk_bixie`、`sk_kuihua` |
| 2 件 | `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 对距离≥2的目标使用剑法时 `Z3 +3%×G`【Z3】 |
| 4 件 | 每回合首次击倒目标后对自身 `ctShift +25×G`【ct】 |
| 品阶 | 黄上～天阶 |
| 依据 | 林家辟邪剑谱与葵花同源为原著主题；基础链、套装奖励为**（原创扩展）** |

可达：高携内2、拳2、兵3可达 7；中·笑傲本土 7 选4；低一内一拳一兵 →3。断尘之誓及正本／残篇差异照常。

---

## 15. 侠客、碧血与明清书界（8 套）

### 15.1 `set_xueshan_jinwu` 雪山金乌

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_taxuewuhen`、`sk_xueshanjianfa`、`sk_wuwangshengong`、`sk_jinwudaofa` |
| 2 件 | `attr:resCold pp +3×G`【属性层】 |
| 3 件 | 对持剑目标的刀法或对持刀目标的剑法 `Z5 +3%×G`【Z5】 |
| 4 件 | 档位生效时登记 `modTerrain terrain:snow costMul:0.5`（最终每格最低 1）；站在雪地时招式 `Z3 +2%×G`【地形／Z3】 |
| 品阶 | 玄上～地中 |
| 依据 | 雪山派与金乌刀法克雪山剑法为原著主题；套装效果为**（原创扩展）**，无妄神功细节**（待考）** |

可达：高可携内1、兵2，轻功不可携 →3；中·侠客／雪山本土四门 →4；低一内一兵 →2。

### 15.2 `set_huashan_hunyuan` 华山混元

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_hunyuangong`、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan` |
| 2 件 | `attr:tough pct +3%×G`【属性层】 |
| 3 件 | 拳脚招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 拳脚命中后回复 `mpMax×0.5%×G`，每回合一次【settle】 |
| 品阶 | 玄中～地上 |
| 依据 | 《碧血剑》华山混元功、混元掌主题；铁指诀、破玉拳细节**（待考）**，成套为**（原创扩展）** |

可达：高携一内三拳 →4；中·碧血本土四门 →4；低一内一拳 →2，无本土补位。

### 15.3 `set_tiejian_musang` 铁剑木桑

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_shenxing`、`sk_tiejianjianfa`、`sk_mantianhuayu`、`sk_tiejianqipanjian`、`sk_tiejianxinfa` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 暗器／剑法 `attr:hit pct +3%×G`【属性层】 |
| 4 件 | 每场首次闪避成功后对自身 `ctShift +30×G`【ct】 |
| 品阶 | 玄中～天下 |
| 依据 | 木桑道人、神行百变、暗器与弈棋意象为原著主题；剑法／心法命名和成套为**（原创扩展）** |

可达：高／中·碧血本土可装内1、兵2、轻1、暗1 →5；其他中武携一内、兵2 →3；低一内一兵 →2。金丝背心不计。

### 15.4 `set_shenlong_jiaozhu` 神龙教·教主武库

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_shenlongrumenquan`、`sk_shenlongshebu`、`sk_shenlongzhang`、`sk_yingxiongsanzhao`、`sk_meirensanzhao`、`sk_shenlongxinfa` |
| 2 件 | `attr:effHit pct +3%×G`【属性层】 |
| 3 件 | 对受控制目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 开战对自身 `applyBuff bf_mian_kong` 1 回合，每场一次【机制】 |
| 品阶 | 黄～地；具体见图鉴 |
| 依据 | 神龙教与洪安通武库为原著主题；技能拆分与效果为**（原创扩展）** |

可达：高／中可携内1、拳3，轻功不能携 →4；低·鹿鼎六门本土可达 4；其他低武一内一拳 →2。

### 15.5 `set_shenzhao_liancheng` 神照·连城

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_yuzhongduanquan`、`sk_yuzhongduandao`、`sk_yuzhongqinna`、`sk_xiangxituna`、`sk_meinianshengxinfa`、`sk_shenzhao` |
| 2 件 | `attr:resInjury pp +3×G`【属性层】 |
| 3 件 | 气血低于50%时 `Z4 +3%×G`【Z4】 |
| 4 件 | 每场首次气血低于25%时对自身 `heal hpMax×1%×G`【settle】 |
| 品阶 | 黄下～天阶；具体见图鉴 |
| 依据 | 神照经、丁典—狄云牢狱传承为原著主题；狱中武学、湘西吐纳与奖励为**（原创扩展）** |

可达：高携内3、拳2、兵1可达 6；中受内功携带上限 2 约束，携内2、拳2、兵1可达 5；低·连城六门本土，内功3、拳脚2、兵器1 均在装配栏上限内，可达 6；其他低武一内一拳一兵 →3。锁穴效果次数不增加。

### 15.6 `set_yuanyangdao_renzhe` 鸳鸯刀·仁者

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_yuanyangjibenjian`、`sk_renzhetuna`、`sk_yuanyangshuangdao`、`sk_fuqidaofa` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 对气血高于50%目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次相邻友方受伤后，对该友方 `heal hpMax×1%×G`，再对自身 `modRage +5×G`【settle／机制】 |
| 品阶 | 黄～地；具体见图鉴 |
| 依据 | 鸳鸯刀“仁者无敌”主题有原著依据；基础剑、吐纳、成套奖励为**（原创扩展）**，人物关系细节**（待考）** |

可达：高携一内、三兵可达 4；中纯携入受兵器携带上限 2 限制，只能一内、两兵 →3；低·鸳鸯四门均为本土，且一内、三兵恰占栏位上限，可达 4；其他低武一内一兵 →2。鸳鸯刀装备不计。

### 15.7 `set_honghua_shisidangjia` 红花十四当家

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_baihuacuo`、`sk_paoding`、`sk_honghuahuiheji`、`sk_honghuaxinfa`、`sk_jindifa`、`sk_honghuachangquan`、`sk_honghuajian`、`sk_honghuabu` |
| 2 件 | `attr:combo pp +2×G`【属性层】 |
| 3 件 | 相邻友方存在时 `Z4 +3%×G`【Z4】 |
| 4 件 | 相邻友方命中后对自身 `ctShift +5×G`，每回合一次【ct】 |
| 6 件 | 开战对自身 `modRage +5×G`【机制】 |
| 品阶 | 黄中～地；具体见图鉴 |
| 依据 | 红花会十四当家与群侠接应为原著主题；合击技能、阈值与数值为**（原创扩展）** |

可达：高可携内1、拳2、兵2，轻／杂不可携 →5；中·书剑本土栏位内可达 6；低一内一拳一兵 →3。

### 15.8 `set_hujia_lengyue` 胡家冷月

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_hujiadao`、`sk_hujiaquan`、`sk_hujiadaoxinfa`、`sk_hujiaxiaolianquan`、`sk_liaodonghushendao` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | 刀法／拳法 `Z3 +3%×G`【Z3】 |
| 4 件 | 招架拳脚招式时 `Z9 +3pp×G`【Z9】 |
| 品阶 | 黄上～天阶；具体见图鉴 |
| 依据 | 胡家刀法与拳经互证为原著主题；小练拳、护身刀与奖励为**（原创扩展）** |

可达：高携内1、拳2、兵2 →5；中·飞狐／雪山本土五门 →5；低一内一拳一兵 →3。冷月宝刀不计。

---

## 16. 通行传承（3 套）

### 16.1 `set_jianghu_baijia` 江湖百家

| 项 | 定稿 |
|---|---|
| 成员（29） | `sk_jianghubaizhanjian`、`sk_yanzisanchaoshui`、`sk_qingfengjian`、`sk_panlonggun`、`sk_dengpingdushui`、`sk_feishahuangshi`、`sk_luoyedao`、`sk_liuxingchui`、`sk_wuyingshou`、`sk_jianghutuna`、`sk_xingqizhou`、`sk_yexinggong`、`sk_hutiaodaofa`、`sk_huiliuquan`、`sk_taizuchangquan`、`sk_jianghurumenjian`、`sk_pingfengjian`、`sk_hengdaorumenzhao`、`sk_shaobanggun`、`sk_duanqiangfa`、`sk_sanshou`、`sk_yanxingbu`、`sk_tunaqianjue`、`sk_dantianyangqi`、`sk_huxixingqi`、`sk_tongxingfeishi`、`sk_tiexiu`、`sk_jianghuchangquan`、`sk_caoshangfei` |
| 2 件 | `attr:hit pct +2%×G`【属性层】 |
| 4 件 | `attr:parry pct +2%×G`【属性层】 |
| 6 件 | 通行武学招式 `Z3 +2%×G`【Z3】 |
| 品阶 | 黄下～地中；6 件封顶，不按 29 件继续增长 |
| 依据 | 江湖公开传承集合，整体为**（原创扩展）**；部分通称沿各图鉴考据标记 |

可达：高／中／低十四书界均有 `ALL14` 本土底座；低武可用本土内1、拳1、兵3、轻1或暗1达 6。高／中也可在本土完成 6，不要求跨书携带。

### 16.2 `set_junwu_baizhan` 军伍百战

| 项 | 定稿 |
|---|---|
| 成员（12） | `sk_pojunqiangfa`、`sk_baizhanxinfa`、`sk_shouchengzhen`、`sk_duanzhenqiang`、`sk_junzhongdao`、`sk_zhenqijian`、`sk_jundituna`、`sk_xingjunbu`、`sk_shouchengfa`、`sk_changqiangrumen`、`sk_junwuduandao`、`sk_junwuchangjian` |
| 2 件 | `attr:tough pct +3%×G`【属性层】 |
| 3 件 | 相邻友方存在时 `Z4 +3%×G`【Z4】 |
| 4 件 | 对距离≤2的目标 `Z3 +3%×G`【Z3】 |
| 6 件 | 击退抵抗 `attr:resCC pp +3×G`【属性层】 |
| 品阶 | 黄上～地上 |
| 依据 | 历代军伍与守城主题；技能体系和全部奖励为**（原创扩展）** |

可达：高以内2、兵3、杂1可达 6；中同样可达 6。低武携入 `sk_baizhanxinfa`，并在 `ALL14` 本土重学 `sk_jundituna`、三门兵器与 `sk_xingjunbu`，按内2、兵3、轻1可达 6；不依赖杂学携带。

### 16.3 `set_penglai_chaosheng` 蓬莱潮生

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_donghaichaoshengzhang`、`sk_tianwangbuxin`、`sk_penglaiquan`、`sk_chaoyinxinfa`、`sk_penglairumenquan`、`sk_haifengbu` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | 水岸／浅水格上招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次施治后对自身 `ctShift +20×G`【ct】 |
| 品阶 | 黄中～地下 |
| 依据 | 蓬莱传承整体为**（原创扩展）**；天王补心针名目与归属**（待考）** |

可达：高·天龙本土拳3、内1、暗1、轻1可达 6；中纯携入一内、两拳 →3；低纯携入一内、一拳 →2。现有六门的 `sourceChapters` 都只有天龙，中／低武没有已登记本土补件，轻功／暗器也不可携。

---

## 17. 古龙扩展组（2 套）

### 17.1 `set_yihua_shuangbi` 移花双璧

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_yihuagongjian`、`sk_yihuagongqinggong`、`sk_yihuajieyu`、`sk_mingyugong` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 远程招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次遭远程招式伤害后，对自身 `applyBuff bf_youshi` 1 回合【机制】 |
| 品阶 | 黄～地；具体见图鉴 |
| 依据 | 移花宫与明玉功主题来自古龙作品；跨作者扩展接入本作属**（原创扩展）** |

可达：中武·侠客为主投放，本土可装一内、一拳、一兵、一轻 →4；中武·笑傲隐藏线只落明玉功与入门剑，保守 2；高武无本土时可携一内、一拳、一兵 →3，轻功不可携；低武同样纯携入一内、一拳、一兵 →3。投放到金庸书界均为**（原创扩展）**。

### 17.2 `set_baiyun_juezhan` 白云决战

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_baiyunjichujian`、`sk_baiyunjianwei`、`sk_feixiandao`、`sk_tianwaifeixian`、`sk_ximenjiandao` |
| 2 件 | 剑法 `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 单体剑招 `Z3 +3%×G`【Z3】 |
| 4 件 | 剑法 `attr:crit flat +3×G`【属性层】 |
| 品阶 | 黄～天；具体见图鉴 |
| 依据 | 白云城主与西门吹雪决战主题来自古龙作品；技能组合、数值为**（原创扩展）**，不改写原作胜负 |

可达：中武·碧血为主投放，本土四门剑法中任选三门，再装轻功 `sk_feixiandao`，恰达 4；第四门剑法受三个兵器栏限制不能同时计件。高武无本土时可携三门兵器，轻功不可携，最多 3；其他中武最多携两门兵器，低武最多携一门兵器，均不能只靠跨书携入激活 4 件。投放到碧血书界为**（原创扩展）**。

---

## 18. 全目录总览与可达矩阵

### 18.1 数量

| 分组 | 套装数 | ID |
|---|---:|---|
| 少林 | 5 | 金刚、罗汉、达摩、扫地僧、方证 |
| 五绝／射雕 | 6 | 丐帮、桃花、白驼、大理、九阴、郭靖 |
| 道家／古墓／剑冢 | 6 | 全真、古墓、侠侣、剑冢、太极、真武 |
| 天龙旁支 | 5 | 逍遥、星宿、慕容、明王、萧峰 |
| 倚天 | 5 | 光明、波斯圣火、峨眉、崆峒、法王 |
| 笑傲 | 4 | 华山、嵩山、日月、林家 |
| 侠客／碧血／明清 | 8 | 雪山、混元、木桑、神龙、神照、鸳鸯、红花、胡家 |
| 通行 | 3 | 江湖、军伍、蓬莱 |
| 古龙扩展 | 2 | 移花、白云 |
| **合计** | **44** | 位于要求的 30～45 套区间 |

### 18.2 高／中／低武可达档总览

下表数字是当前可证明、足以覆盖最高奖励档的代表路径件数，不承诺穷举数学最大值；带 `L` 表示依赖标注书界本土重学，带 `E` 表示依赖装备。精确成员路径见各套条目。

| 套装 | 高 | 中 | 低 | 低武 4 件结论 |
|---|---:|---:|---:|---|
| 少林金刚 | 4 | 4 | 4L/2 | 鹿鼎可 |
| 少林罗汉 | 4L | 4L | 4L/3 | 鹿鼎可 |
| 达摩遗风 | 4L | 4L | 3L/2 | 不可 |
| 扫地僧 | 4L | 3 | 4L/2 | 鹿鼎可 |
| 方证 | 4 | 4L | 3L/2 | 保守不可 |
| 丐帮帮主 | 5L | 4L | 4L/2 | 鹿鼎可 |
| 桃花岛主 | 4L | 4 | 3 | 不可 |
| 白驼山主 | 4L | 4 | 3 | 不可 |
| 大理一阳 | 4L | 4 | 3 | 不可 |
| 九阴正宗 | 6L | 4 | 2 | 不可 |
| 侠之大者 | 6L | 3 | 2 | 不可 |
| 全真北斗 | 4L | 4 | 3L | 不可 |
| 古墓玉女 | 4L | 4 | 3 | 不可 |
| 神雕侠侣 | 5L | 4 | 3 | 不可 |
| 独孤剑冢 | 5L | 4L | 2 | 不可 |
| 武当太极 | 4L | 4L | 4L/3 | 连城／鸳鸯可 |
| 武当真武 | 4L | 5L | 3 | 不可 |
| 逍遥游 | 5L | 5 | 3 | 不可 |
| 星宿老仙 | 5L | 5 | 3 | 不可 |
| 以彼之道 | 5L | 5 | 3 | 不可 |
| 大轮明王 | 5L | 5 | 7L/3 | 鹿鼎可 |
| 契丹英雄 | 5L | 5L | 3L/3 | 不可 |
| 光明圣火 | 4L | 4 | 3 | 不可 |
| 波斯圣火 | 5L | 4 | 3 | 不可 |
| 倚天峨眉 | 6L | 6 | 4E | 可，依赖倚天剑 |
| 崆峒七伤 | 4L | 4 | 3 | 不可 |
| 四大法王 | 4L | 2 | 2 | 不可 |
| 华山气剑 | 6 | 6L | 2 | 不可 |
| 嵩山寒岳 | 5 | 4L | 3 | 不可 |
| 黑木日月 | 6 | 4L | 2 | 不可 |
| 林家辟邪 | 7 | 4L | 3 | 不可 |
| 雪山金乌 | 3 | 4L | 2 | 不可 |
| 华山混元 | 4 | 4L | 2 | 不可 |
| 铁剑木桑 | 5L | 5L | 2 | 不可 |
| 神龙教主 | 4 | 4 | 4L/2 | 鹿鼎可 |
| 神照连城 | 6 | 5 | 6L/3 | 连城可 |
| 鸳鸯仁者 | 4 | 3 | 4L/2 | 鸳鸯可 |
| 红花十四当家 | 5 | 6L | 3 | 不可 |
| 胡家冷月 | 5 | 5L | 3 | 不可 |
| 江湖百家 | 6L | 6L | 6L | 四界均可 |
| 军伍百战 | 6L | 6L | 6L | 四界均可 |
| 蓬莱潮生 | 6L | 3 | 2 | 不可 |
| 移花双璧 | 3 | 4L/2 | 3 | 侠客本土可 |
| 白云决战 | 3 | 4L/2 | 1 | 碧血本土可 |

### 18.3 低武分布结论

十四书界中，鹿鼎有少林金刚、少林罗汉、扫地僧、丐帮帮主、大轮明王、神龙教主与两套通行套；连城有武当太极、神照连城和两套通行套；鸳鸯有武当太极、鸳鸯仁者和两套通行套；白马以江湖百家、军伍百战作为稳定满档，本土专属套装留给章节后续设计。契丹英雄在低武仅可达 3 件，不计入四件名单。这样既保留低武地域特色，也不靠未登记装备或未登记本土武学伪造可达性。

---

## 19. 候选收敛与去向

### 19.1 收敛口径

11 份技能图鉴实际提交约 163 个唯一候选 ID，明显高于任务描述中的“10 个图鉴、约 50 个候选”。本版从中保留 44 套。未入选候选的技能标签从图鉴实际 `setTags` 移除，候选节改为本节所列去向；不删除武学本身。

### 19.2 合并到正式套装

| 原候选 | 去向 | 理由 |
|---|---|---|
| `set_shaolin_henglian`、`set_shaolin_banruo`、`set_shaolin_gunseng` | 主题并入 `set_shaolin_jingang`／`set_shaolin_luohan`／`set_shaolin_damo` | 减少少林碎套；并入不表示把原候选全部成员迁入正式表 |
| `set_sandu`、`set_chengguan` | 主题并入 `set_saodiseng`／`set_fangzheng` | 同为少林人物、佛法主题，避免重叠 |
| `set_gaibang_tuobo`、`set_gaibang_xingyi` | 主题并入 `set_gaibang_bangzhu` | 入门与行艺留作帮主成长链 |
| `set_huangrong_nvzhuge`、`set_taohua_qimen` | 主题并入 `set_taohuadao`／`set_guojing_xiazhe` | 人物与奇门成员高度重叠 |
| `set_baituo_shenu` | 主题并入 `set_baituoshan` | 同门蛇毒主题 |
| `set_dali_huwei` | 主题并入 `set_dali_yiyang` | 大理入门链已由一阳主题覆盖 |
| `set_zhoubotong_wantong` | 主题并入 `set_guojing_xiazhe`／`set_jiuyin_zhengzong` | 空明、互搏、九阴关系高度重叠 |
| `set_xiaoyao_xuzhu`、`set_lingjiu_jiutian` | 主题并入 `set_xiaoyao_xiaoyaoyou` | 人物与门派主轴重叠 |
| `set_mizong_jinlun` | 主题并入 `set_mizong_mingwang` | 避免共用大手印、护法身、拙火的两套同开 |
| `set_mingjiao_wuxingqi`、`set_tianying_baimei` | 主题并入 `set_mingjiao_guangming` | 明教内部集中为主套，支系武学仍保留 |
| `set_huashan_liangyi`、`set_liangyi_sixiang` | 主题并入 `set_huashan_qijian`／`set_wudang_taiji` | 两仪作为武学关系，不另开小套 |
| `set_meizhuang_siyou`、`set_renwoxing`、`set_dongfang_kuihua` | 主题并入 `set_riyue_heimu`／`set_linjia_bixie` | 避免吸星、葵花多套叠益 |
| `set_humiao_bainian`、`set_miaojia_jianxin` | 主题并入 `set_hujia_lengyue` | 飞狐刀剑对照保留为剧情关系；两 ID 不再列于删除表 |
| `set_fuqidao_tongxin` | 主题并入 `set_yuanyangdao_renzhe` | `sk_fuqidaofa` 已是正式成员 |
| `set_wanmei_gucheng` | 主题并入 `set_baiyun_juezhan` | 西门剑道已进入正式成员 |
| `set_shenjian_wangfan` | 不并成员；叙事对照并入 `set_baiyun_juezhan` | 谢晓峰不是白云决战成员，避免误称成员迁移 |

### 19.3 删除：成员不足、依赖未闭合或主题重复

以下逐项登记未入选历史键；统一保留原 `set_*` ID，供 `check_ids.py` 读取“旧候选 → 正式套装／删除”的弃用映射，但不得写入运行态 `setTags`。连同 §19.2 的“主题并入”项，旧键均不进入运行数据。`set_tiezhang_shuishangpiao` 在五绝、道家两册重复出现，所以两表覆盖 120 次图鉴提及、119 个唯一历史键。

| 图鉴 | 未入选候选（逐项） | 去向／理由 |
|---|---|---|
| 少林 | `set_nanshaolin_hongmen` | 书剑专属，和红花／少林主套重叠；留未来扩展 |
| 五绝 | `set_heifeng_shuangsha`、`set_tiezhang_shuishangpiao`、`set_jiangnan_qiguai`、`set_yangjia_jiangmen`、`set_menggu_shediao`、`set_menggu_mufu`、`set_tiezhang_shanzhai` | 人物或势力分散；首发优先六个主传承 |
| 道家 | `set_shujian_mianlizhen`、`set_chilian_xianzi`、`set_jueqing_gongsun`、`set_tiezhang_shuishangpiao` | 非核心携带、装备依赖或主题重叠；铁掌项与五绝同一 ID |
| 逍遥 | `set_sidaeren`、`set_yipintang_tieyao` | 备选未展开；保留未来阵营包 |
| 倚天 | `set_xuanming` | 只有两门技能，鹿杖／鹤笔装备反向未闭合 |
| 倚天 | `set_kunlun_liangyi`、`set_ruyang_suwei`、`set_haisha_duyan`、`set_jujing_fenshui`、`set_shenquan_cuijun` | 可闭合但首发容量收敛；保留未来门派包 |
| 五岳 | `set_taishan_daizong`、`set_hengshan_yunwu`、`set_hengshan_cibei`、`set_qingcheng_songfeng`、`set_wuxian_baidu`、`set_xiaoao_yiren` | 首发只留四条差异较大的成长线 |
| 五岳 | `set_xiaoao_qinxiao` | 仅 3 个技能成员，未达正式套最小 4 件 |
| 侠客／碧血 | `set_xiakedao_shibi`、`set_xiake_fumo`、`set_motian_qingzhang`、`set_changle_wuxing`、`set_jindao_pigua`、`set_shangqing_xuansu`、`set_shiliang_wuxing` | 各仅 3 件，未达最小成员数 |
| 侠客／碧血 | `set_xuansu_shuangjian`、`set_wudu_tieshou`、`set_jinshe_sanbao` | 依赖未登记装备；移除装备后不足稳定 4 件或主题不完整 |
| 侠客／碧血 | `set_xiandu_shangqing`、`set_chuangwang_shanzong` | 可闭合但首发辨识度／跨界价值较低 |
| 康熙 | `set_chenjinnan`、`set_haidafu` | 单件人物标签，不构成套装 |
| 康熙 | `set_pingxi_junbei`、`set_lvliang_sanjie`、`set_qinggong_yadao` | 各只有 2 件 |
| 康熙 | `set_huahui_yexing`、`set_nansiqi_xuegu` | 各只有 3 件 |
| 康熙 | `set_tiandihui_fanqing`、`set_muwang_hufu`、`set_wangwu_shandao`、`set_qinggong_neiting`、`set_xuedao_xuegu`、`set_wanjia_shimen`、`set_liancheng_shijian`、`set_gaochang_migong`、`set_hasake_caoyuan`、`set_weixin_hubiao`、`set_taiyue_sixia` | 可闭合但首发容量收敛；分别留天地会、沐府、王屋、清宫、血刀、万家、诗剑、高昌、哈萨克、威信、太岳扩展池 |
| 乾隆 | `set_guandong_liumo` | 只有 2 件 |
| 乾隆 | `set_tianchi_shuangying`、`set_huibu_cuiyu`、`set_shangjiabao_fuchou`、`set_yaowang_yidu`、`set_taijimen_guangping`、`set_bagua_youlong`、`set_tianlong_nanbei`、`set_weituo_hufa`、`set_baxian_zuijian`、`set_baji_tieshan`、`set_jiulong_chanrao`、`set_zhangmen_dahui` | 可闭合但首发容量收敛；不删除武学，留未来支线包 |
| 通用 | `set_guchong_mifa`、`set_huanyirong` | 各只有 3 件 |
| 通用 | `set_xinglin_qihuang` | 七名成员均为杂学，受 2 个杂学装配栏限制，无法达到 4 件 |
| 通用 | `set_yuenv_jianyuan`、`set_junwu_yanmeng`、`set_biaoju_sihai`、`set_wuguan_jiben`、`set_dujia_baicao`、`set_qimen_jianghu`、`set_yayue_qingxin`、`set_hanmo_yiqi`、`set_baishou_xunyuan` | 可闭合但与正式通行套重叠或首发容量收敛 |
| 古龙 | `set_erengu_qiaobian`、`set_daqi_tiexue`、`set_shenshui_shenmiao`、`set_wuzheng_tingfeng`、`set_qinglong_ancao`、`set_kuaihuo_mifu`、`set_xueyu_yanluo`、`set_tangmen_qiaoji`、`set_kongque_shouzhuang`、`set_jinqian_juesu`、`set_renyi_xuanhong` | 首发古龙组只留两套代表；留未来独立平衡 |

### 19.4 装备候选的统一去向

`eq_dagoubang`、`eq_jiuhulu`、`eq_yuxiao`、`eq_ruanweijia`、`eq_baituoshezhang`、`eq_chongyangdaopao`、`eq_junzijian`、`eq_shunvjian`、`eq_xuantiejian`、`eq_qibaozhihuan`、`eq_jinlun`、`eq_shenghuoling`、`eq_tiezhihuan`、`eq_lengyuedao`、`eq_jinsibeixin`、`eq_yuanyangdao` 等均不进入 v1 `members`。若 `design/10` 日后补同名反向标签，可在不改变武学侧的情况下作为版本 2 成员提案；此时必须重跑可达性与中位数回归。

### 19.5 收敛计数复核

| 项 | 数量 | 算式 |
|---|---:|---|
| 原图鉴候选 | 163 个唯一 ID | 11 册原候选节去重 |
| 首发正式 | 44 | §9～§17 |
| 未入选 | 119 个唯一 ID | `163−44=119` |
| 未入选图鉴提及 | 120 | `119+1`；`set_tiezhang_shuishangpiao` 跨两册重复 |

§19.2 列 27 个未入选 ID，§19.3 列 92 个未入选 ID，合计 `27+92=119`；同一 ID 不在两表重复。装备候选只是候选的附属成员，不另计入 163 个 `set_*`。

---

## 20. 本文新增术语与 ID

### 20.1 术语

| 术语 | 定义 |
|---|---|
| 已计件成员 | 同时属于套装 `members` 且当前处于装配／穿戴集合的唯一 ID |
| 套装品阶 `g_set` | 已计件成员有效品阶中位数向下取整 |
| 档位 | 达到某个 `threshold.count` 后实例化的永久被动效果组 |
| 本土补件 | 在当前书界按正常来源重新学会并装配的成员，不占书眠携带数 |
| 纯携入上限 | 不考虑本土来源时，由携带上限和装配栏共同决定的最大件数 |
| 双向闭合 | `member∈SetDef.members ⇔ setId∈member.setTags` |

### 20.2 新数据结构与枚举

`SetDef`、`SetMember`、`SetTier`、`SetBalance`、`Reachability`、`ActiveSetState`、`effectiveMedianFloor`、`canonTheme` 为本文新增数据约定。44 个 `set_*` ID 均复用图鉴候选，不新造套装 ID。

---

## 21. 数据校验规则与测试用例

### 21.1 构建期硬校验

| ID | 规则 | 失败级别 |
|---|---|---|
| SET-V01 | `setId` 全局唯一且匹配 `^set_[a-z0-9_]+$` | 失败 |
| SET-V02 | `members.length≥4`，成员唯一且目标 ID 存在 | 失败 |
| SET-V03 | 成员 kind 与目标前缀一致，只允许 `sk_*`／`eq_*` | 失败 |
| SET-V04 | `members` 与技能／装备 `setTags` 双向完全一致 | 失败 |
| SET-V05 | 阈值严格递增、无重复、首档≥2、末档≤成员数 | 失败 |
| SET-V06 | 数值效果必须标属性层、Z 区或结算位 | 失败 |
| SET-V07 | `G` 只能读取 `g_set`，套装来源不得乘 `Lb`／`L(n)` | 失败 |
| SET-V08 | 所有 `bf_*` 外键存在于 06，且套装不得复制同义 Buff | 失败 |
| SET-V09 | 每套至少给高／中／低路径或明确不可达原因 | 失败 |
| SET-V10 | 装备成员必须在 10 的真实定义中有反向 `setTags` | 失败 |
| SET-V11 | 首发套装数在 30～45；当前期望 44 | 失败 |
| SET-V12 | 机制效果有次数／冷却／上限，触发链带防循环标记 | 失败 |
| SET-V13 | 06 的常驻修饰 `modStat`／`modZone`／`modJudge`／`modCost`／`modRange` 仅在 `mods`；`modTerrain` 及其他动作原语仅在 `triggers[].ops` 或生命周期 `onApply/onRemove` | 失败 |
| SET-V14 | `balance.peakScore` 按 §7 复算且不超过最高档累计上限 | 失败 |
| SET-V15 | §8.5 排除表中的九门不得因补录、升阶或同门派自动写入正式成员；崆峒七伤保持七条双向关系，新增关系须同步正反两侧与版本 | 失败 |

### 21.2 单元测试

本节是待实现的设计验收用例；本轮新增 SET-V15、SET-T31～T33 仅冻结约束与期望结果，不代表已有对应自动化测试实现。

| 用例 | 输入 | 期望 |
|---|---|---|
| SET-T01 | 金刚四件品阶 `[8,12,5,6]` | 排序 `[5,6,8,12]`，`g_set=7` |
| SET-T02 | 金刚鹿鼎压制 `[8,6,5,4]` | 排序 `[4,5,6,8]`，`g_set=floor((5+6)/2)=5` |
| SET-T03 | 只装易筋经、龙爪手，背包有另两门 | 2 件，不读背包 |
| SET-T04 | 同一装备 ID 两实例都穿戴 | 对同套装只计 1 件 |
| SET-T05 | 成对装备为单一 `pair` ID | 占两槽但只计 1 件 |
| SET-T06 | 兵器武学已装配但武器不匹配 | 仍计件，招式不可用 |
| SET-T07 | 辅运内功属于套装 | 计 1 件 |
| SET-T08 | 同一武学属于四套 | 每套各 +1；任一套内不重复 |
| SET-T09 | 从 4 件换装到 3 件 | 4 件档移除，2／3 件档保留 |
| SET-T10 | `g_set` 因压制下降 | 所有档位数值与 Buff 品阶同帧重算 |
| SET-T11 | 套装 Z3 与武学 Z3 并存 | 进入同一加法池并受 +100% 上限 |
| SET-T12 | 套装破剑与武学破剑并存 | 取最高，不相加 |
| SET-T13 | 鹿鼎金刚路径 | 携入 2＋本土 2，合法 4 件 |
| SET-T14 | 低武尝试携带轻功成员 | 拒绝携带；只有本土重学才计 |
| SET-T15 | `set_yitian_emei` 穿倚天剑 | 装备计 1 件；卸下立即减 1 |
| SET-T16 | 未登记装备被写入成员 | SET-V04／V10 失败 |
| SET-T17 | 事件套装触发产生反击 | 继承 `countered` 来源位且受反应深度 3 限制，同一触发器不重入 |
| SET-T18 | 两套同加 `fam_z4` | 合并后钳制于 75% |
| SET-T19 | 金刚地下三档静态审计 | `8`、`8+6=14`、`8+6+8=22`，分别不超过 `15/22.5/30` |
| SET-T20 | 连城本土神照六成员 | 内3＋拳2＋兵1，合法 6 件 |
| SET-T21 | 中武纯携入鸳鸯仁者 | 内1＋兵2，只能 3 件；鸳鸯本土可 4 |
| SET-T22 | 碧血本土白云决战 | 兵4中任选3＋轻1，可达 4；`sk_baiyunjianwei` 按剑法计 |
| SET-T23 | 鹿鼎本土大轮明王 | 携入内1＋兵2，本土内2＋拳2；装配内3＋拳2＋兵2，合法 7 件 |
| SET-T24 | 低武契丹英雄 | 携入拳1＋兵1，本土太祖长拳1；共 3 件，不得误判为 4 件 |
| SET-T25 | 波斯圣火纯携入 | 中武内2＋拳1＋兵1=4；低武内1＋拳1＋兵1=3 |
| SET-T26 | 蓬莱潮生纯携入 | 中武内1＋拳2=3；低武内1＋拳1=2，轻功／暗器均不得携入 |
| SET-T27 | 白云决战类别与栏位 | `sk_baiyunjianwei` 是剑法、`sk_feixiandao` 是轻功；碧血本土兵3＋轻1=4 |
| SET-T28 | 目录事件 DSL | 星宿不改持续、大轮不改冷却；预防免疫先于命中；临时属性均由既有 `bf_*` 承载；目录条件只读 06 白名单字段 |
| SET-T29 | 来源位防循环 | 慕容反击继承 `countered`；奉还继承 `mirrored`，两者受 06 反应深度 3 与同事件去重限制 |
| SET-T30 | 雪山地形操作 | 4 件生效时经 `onApply` 登记 `modTerrain`；换装失效时按来源 `iid` 撤销，雪地最终每格代价≥1 |
| SET-T31 | 崆峒七伤四件／七件 | 本土 `[4,5,6,9]→5`，加入三门黄阶后 `[2,3,3,4,5,6,9]→4`；四件完整外来中武 `[2,3,4,7]→3` |
| SET-T32 | 三门天龙补录主运、其余五门补录天阶及崆峒五行心法已装配 | 因均无正式套装标签（空数组或省略）而不额外计件；不变更已有套装的中位数或低武可达路径 |
| SET-T33 | 万卷归一恢复武学池后换装；书影同场 | 只有实际装配成员进入当前角色的集合；书影独立计算，主角不能借用其件数 |

### 21.3 可达性回归

每次改 `sourceChapters`、携带上限、装配栏或套装成员后，重新枚举所有书界的合法装配组合。至少断言：鹿鼎少林金刚 4、大轮明王 7、契丹英雄 3；连城神照 6；波斯圣火纯携入中4／低3；蓬莱纯携入中3／低2；鸳鸯仁者本土 4、中武纯携入 3；白马江湖百家 4；侠客本土移花 4；碧血本土白云 4；所有目录写明“不可 4”的纯携入路径不得被错误判为可达。

---

## 22. 待决事项 / 依赖

### 22.1 替下游给出的建议值

| 编号 | 下游 | 建议值 |
|---|---|---|
| S-D01 | `tech/05` | `g_set` 用整数排序与 `(a+b)>>1` 等价的向下取整；档位变更在原子事件后提交 |
| S-D02 | UI | 套装面板显示“已装配 x/y、当前品阶、下一档”，不显示背包候选为已计件 |
| S-D03 | QA | 以 §21 的 33 条为最低自动化集合；44 套逐套生成双向与阈值测试 |

### 22.2 本文依赖的上游事实

- 携带、压制与残篇服从 `design/02`；若低武携带规则改变，§18.2 全表重算。
- 属性和乘区服从 `design/03`、`design/04`；Buff 原语和上限服从 `design/06`。
- 装配栏与技能有效性服从 `design/05`；装备槽、成对兵器与装备标签服从 `design/10`。
- 图鉴 `sourceChapters` 只证明候选来源；同周目互斥须由各 `chapters/*` 最终验证。

### 22.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| SET-P01 | **已解决**：基准 V13-08／§20 已采纳 `g_set=floor(median(counted effGrade))` 与偶数定义 | 本文 §4 消费唯一公式 |
| SET-P02 | **已解决**：基准 V13-08／§20 已采纳同一唯一 ID 不因多实例重复计件 | 本文 §3 按唯一成员去重 |
| SET-P03 | **已解决**：基准 V13-08／§20 已采纳辅运与暂不可施展的已装兵器武学仍计件 | 本文 §3.2 与 05 §6.5 对齐 |

### 22.4 原著考据待办

继承图鉴现有待考项：达摩剑法／须弥山掌具体出处、九阴神爪版本名、白驼杖法正式名、峨眉部分招名、雪山无妄神功细节、铁剑木桑相关武学名、天王补心针归属。核对只校正文案和 `origin`，默认不改 ID、品阶与首发名额。

### 22.5 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| SET-O01 | 后续是否允许更多装备进入正式成员 | 不允许；先由 10 补真实 `setTags`，再升 `version` |
| SET-O02 | 古龙扩展组后续是否另建独立书界 | 不建；当前按图鉴既定原创投放，移花主投侠客、白云主投碧血 |
| SET-O03 | `set_baiyun_juezhan` 四件是否受三兵器栏限制 | 是；本土以轻功 `sk_feixiandao` 作第 4 件，纯携入最多依境界为高3／中2／低1 |
| SET-O04 | 白马是否需要独占套装 | 首发不加；以江湖／军伍通行套保证完整体验 |
| SET-O05 | 是否将被删候选作为后续赛季套 | 保留 ID 历史但不进运行数据；新增前重新做 C22 与预算审查 |
| SET-O06 | NXB01-O03／NXB04-O05：补录天阶或崆峒五行心法是否入套 | 默认均不加入；已完成本版闭合审查，见 §8.5、§13.4。若作者改定，正反标签与中位数／可达性必须同次更新 |

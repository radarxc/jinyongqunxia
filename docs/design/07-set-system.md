# 07 · 套装体系（Set System）

> 归属（基准 §18）：套装的数据结构、计件、有效品阶、档位效果、跨品阶混搭、可达性、平衡预算与正式套装目录。
> 上游：`00-canon.md` v1.1（§3～§5、§9、§12、§20）；作者新增需求与决定见 `decisions/author-requirements.md`、`decisions/author-decisions.md`；冲突裁定见 `decisions/rulings-v1.md`。
> 引用而不重定义：书眠携带与外来压制 → `design/02-timeline-and-world-tiers.md`；属性 → `design/03-attributes.md`；Z0～Z10 → `design/04-damage-formula.md`；武学装配、`effGrade` 与 `setTags` → `design/05-martial-arts-system.md`；Buff DSL、叠加族与上限 → `design/06-buff-system.md`；装备与成对兵器 → `design/10-items-and-equipment.md`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需以三联／广州修订版逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档、先给可用数值并在文末登记。
> 版本：v1.0（2026-09-26）。
> 变更记录：v1.0 首次冻结规则与 44 套正式目录；把 11 份技能图鉴的候选收敛为可双向闭合的首发集合。

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
| S3 | 奖励是“锦上添花”而非强制毕业装 | 满档累计预算低于同品阶一门武学被动预算 |
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
    budget: 3
    effects: [{ op: modStat, stat: seal, kind: pp, value: "4 * G" }]
  - count: 3
    budget: 2
    effects: [{ op: modStat, stat: parry, kind: pct, value: "3% * G" }]
  - count: 4
    budget: 3
    effects: [{ op: modZone, zone: Z3, value: "4% * G", filter: { cat: unarmed } }]
reachable:
  - { chapters: [ch08_luding], count: 4, carry: [sk_yijinjing, sk_longzhaoshou], local: [sk_tieshazhang, sk_tongrenhenglian] }
exclusiveGroup: null
ui: { icon: set/shaolin_jingang, showNextThreshold: true }
version: 1
```

### 2.3 TypeScript 类型

```ts
export type SetId = `set_${string}`;
export type SkillId = `sk_${string}`;
export type EquipId = `eq_${string}`;
export type ChapterId = `ch${string}`;
import type { Op } from './buff/types'; // 共享战斗 DSL；唯一原语语义见 design/06 §6.4

export type SetMember =
  | { kind: 'skill'; id: SkillId }
  | { kind: 'equip'; id: EquipId };

export interface SetTier {
  count: number;
  budget: number;
  effects: Op[]; // 直接复用 06 的原语，不在套装域另造字段或语义
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

成员“有效品阶”先经过 `design/02` 的书界压制，再进入中位数。若当前不足 2 件，套装不激活且 `setGrade=null`。有效品阶变化会重算全部已激活档位的数值和效果品阶。

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
6. 由一击触发的套装反应带 `noSetChain`，不能再次触发套装，防止反击、治疗、吸取循环。
7. 套装造成的回复、护体、DOT、吸取都进入 06 的 HOT、护体、DOT、吸取上限。

### 6.4 互斥与取高

- 只有 `exclusiveGroup` 相同的档位互斥；默认保留 `g_set` 高者，仍同品则保留阈值高者，再同则按 `setId` 字典序保证确定性。
- 目录里“与既有被动取高”按效果语义取高，不因为来源不同相加。
- 套装不能移除成员自身的 `conflicts`；阴阳内功相冲、武器不匹配、代价型被动仍先于套装收益结算。
- 队伍型套装只给实际满足距离／羁绊／阵位条件者，不把队友成员合并到持有者件数。

### 6.5 动态变化时机

装配界面确认、战斗开始、装备卸下／损坏、武学临时失效、压制变化时重算。战斗中重算发生在当前原子事件结束后、下一次 P1 之前；已经排队的伤害不回溯。若重算后失去阈值，其永久被动立即移除，但此前合法施加的限时 Buff 按自身持续规则结束。

---

## 7. 平衡预算

### 7.1 预算单位

以 `design/05` §4.2 的同品阶单门武学 `layerStats` 满层预算作 100% 参照：黄／玄／地／天分别约 6／10／15／20 点。套装奖励无需修炼且可跨门叠，因此累计上限取参照的一部分，并预留机制税。

| `g_set` 大阶 | 单门被动参照 | 2 件累计 | 3 件累计 | 4 件累计 | 5 件累计 | 6 件累计 |
|---|---:|---:|---:|---:|---:|---:|
| 黄 | 6 | 1.5 | 2.5 | 3.5 | 4.0 | 4.5 |
| 玄 | 10 | 2.5 | 4.0 | 5.5 | 6.5 | 7.0 |
| 地 | 15 | 3.5 | 5.5 | 7.5 | 9.0 | 10.0 |
| 天 | 20 | 4.5 | 7.0 | 10.0 | 12.0 | 13.5 |

“累计”包含低档；4 件天套最多约半门天阶被动，不能等价于四门额外武学。5／6 件主要奖励构筑方向或限次机制，不能继续线性叠数值。

### 7.2 常用效果成本

| 效果 | 预算折算 |
|---|---:|
| `attr:hit/eva/parry pct +1%×G` | 1.0 |
| `attr:seal/resX/counter pp +1×G` | 1.0 |
| 条件 Z3／Z4 `+1%×G` | 1.0 |
| 无条件 Z3／Z4 `+1%×G` | 1.5 |
| Z2 `+1%×G` | 1.5 |
| `cost −1%×G` | 0.8 |
| 每场一次的小型驱散／护体／怒气 | 2～4 |
| 改距离、额外段数、必定触发、免死等机制 | 4～8，逐条评审 |

目录采用基线 `2件: 2～4×G`、`3件: 2～3×G`、`4件: 3～4×G`；条件越窄可取上沿，无条件 Z3／Z4 取下沿。显示值不代表脱离族上限。

### 7.3 机制税与禁区

- 改写行动次数、复活、无敌、必暴、必命中、额外段数属于高税机制；首发只保留每场一次或严格条件版本。
- 不用“品德下降”“门派锁”“原著人物限定”抵扣战斗预算；这些不是可交换成本。
- 套装不得新增无法由 06 原语表达的隐式战斗规则。
- 4 件效果若同时含机制和数值，数值至少下调 25%。
- 低武本土即可满档的套装，不因可达早而额外削弱；有效品阶中位数已经自然压低其数值。

### 7.4 回归基准

QA 以同等级、同装备、只替换装配构筑的标准敌人比较：2 件对 TTK／承伤影响目标 3%～6%，3 件累计 6%～10%，4 件累计 10%～16%，5／6 件累计不超过 20%。任何单套令标准战斗 TTK 改变超过 25%，或与第二套叠加后触及 06 红线，应下调而不是新增特殊上限。

---

## 8. 正式目录读法

### 8.1 共通字段

以下 44 套均采用 §2～§7 的共同规则。每套成员按唯一 ID 列出；“跨度”是成员绝对品阶的大阶范围，仅供配表阅读，实际数值只看 `g_set`。效果中的 `G` 是 `G(g_set)`。

### 8.2 可达性共通简写

若本套至少含一内、一拳、一兵，高／中／低在无本土来源时的纯携入上限分别是 9／6／3，但还受成员实际类别与装配栏约束。目录仍逐套给代表路径；“低 2”不等于系统禁止更高，而是基于当前图鉴来源的可证明上限。

### 8.3 原著标注

“原著主题”只表示成员、人物或门派关系有原著基础；套装组合、阈值与全部数值均为**（原创扩展）**。不确定的具体武学名或传授细节继续沿用所属图鉴的**（待考）**标记。

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
| 4 件 | 开战 `applyBuff bf_mian_xin` 1 回合，每场一次【机制】 |
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
| 4 件 | 相邻友方倒地时 `modRage +6×G`，每回合一次【机制】 |
| 品阶 | 黄上～天上 |
| 依据 | 降龙、打狗棒法与丐帮帮主关联有原著依据；阵法、心法、步法和奖励含**（原创扩展）** |

可达：高·射雕本土五门 →5；中·笑傲本土餐风、打狗阵并携降龙、打狗 →4；低·鹿鼎本土餐风、云游步并携降龙、打狗 →4；其余低武携一拳一兵 →2。打狗棒、酒葫芦未进入成员。

### 10.2 `set_taohuadao` 桃花岛主

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_tanzhi`、`sk_bihai`、`sk_lanhuafuxueshou`、`sk_yuxiaojianfa`、`sk_luoyingshenjianzhang`、`sk_bitaoxuangong` |
| 2 件 | `attr:effHit pct +3%×G`【属性层】 |
| 3 件 | 侧击／背击招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次施加 `mind` 或 `seal` 成功后 `ctShift +30×G`【ct】 |
| 品阶 | 地下～天下 |
| 依据 | 黄药师及桃花岛武学为原著主题；碧涛玄功、成套效果为**（原创扩展）**，程英相关来源**（待考）** |

可达：高·射雕／神雕本土任选内、拳2、兵、杂即 4；中无本土时 `C:碧涛+弹指+兰花+玉箫剑` →4；低只能携一内、一拳、一兵 →3，碧海不可携。玉箫、软猬甲不计成员。

### 10.3 `set_baituoshan` 白驼山主

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_hama`、`sk_lingshezhangfa`、`sk_lingshequan`、`sk_nizhuanjingmai`、`sk_tashaxing`、`sk_shexingdiaoshou` |
| 2 件 | `attr:resPoison pp +3×G`【属性层】 |
| 3 件 | 对中毒目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 自身蓄势被打断时获得 `attr:tough pct +3%×G` 1 回合【属性层／机制】 |
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
| 6 件 | 每场首次受 `injury` 时 `dispel` 1 个不高于 `g_set` 的 `injury`【机制】 |
| 品阶 | 玄中～天上 |
| 依据 | 《九阴真经》诸篇与正练主题有原著名目；拆分为多技能、阈值与效果为**（原创扩展）**，神爪名称**（待考）** |

可达：高·射雕／神雕本土可装内3、拳2、杂2、轻1达 6；中纯携入内2、拳2达 4，非核心不可携；低携一内一拳最多 2。邪练白骨爪不属于本套。

### 10.6 `set_guojing_xiazhe` 侠之大者

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_xianglong18`、`sk_jiuyin`、`sk_kongming`、`sk_zuoyouhubo`、`sk_zhebiejianshu`、`sk_wumuyishu` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 拳掌招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 相邻友方受伤后，自身 `attr:parry pct +2%×G` 1 回合，每回合一次【属性层／机制】 |
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
| 4 件 | 阵中 `Z4 +3%×G`；未装阵则 `attr:parry pct +2%×G`【Z4／属性层】 |
| 品阶 | 玄中～天中 |
| 依据 | 全真教与天罡北斗阵为原著主题；心法拆分、档位效果为**（原创扩展）** |

可达：高·射雕／神雕本土内3、兵2、杂2中任选 4；中可携内2、兵2 →4；低 `C:先天功+同归剑`，鹿鼎本土全真心法 →3，杂学不能携。

### 11.2 `set_gumu_yunv` 古墓·玉女

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_yunvxinjing`、`sk_hanyuxinjue`、`sk_yunvjian`、`sk_suxin`、`sk_meinvquan`、`sk_jinlingsuo`、`sk_gumuqinggong`、`sk_yufengzhen` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 阴性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 开战 `applyBuff bf_youshi` 2 回合，每场一次【机制】 |
| 品阶 | 玄下～天下 |
| 依据 | 古墓、玉女心经、玉女剑法等为原著主题；寒玉心诀与数值为**（原创扩展）** |

可达：高·神雕本土任取内2、剑2、拳1、轻1 →4以上；中 `C:玉女心经+寒玉心诀+玉女剑+金铃索` →4；低一内、一拳、一兵 →3，轻功／暗器不可携。

### 11.3 `set_shendiao_xialv` 神雕侠侣

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_suxin`、`sk_anran`、`sk_xuantie`、`sk_yunvxinjing`、`sk_yunvjian`、`sk_quanzhenjian` |
| 2 件 | 与羁绊≥3友方相距≤2时 `Z3 +3%×G`【Z3】 |
| 3 件 | `attr:resPoison pp +3×G`【属性层】 |
| 4 件 | 羁绊友方首次倒地时 `modRage +8×G`，每场一次【机制】 |
| 品阶 | 玄中～天中 |
| 依据 | 杨过、小龙女及玉女素心合璧为原著主题；黯然、玄铁并入与奖励为**（原创扩展）** |

可达：高·神雕六门本土，内1、拳1、兵3可达 5；中可携内1、拳1、兵2 →4；低只有一内、一拳、一兵 →3。君子／淑女剑未有装备反向标签，暂不计。

### 11.4 `set_dugu_jianzhong` 独孤剑冢

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_xuantie`、`sk_lijianyi`、`sk_ruanjianyi`、`sk_zhongjianyi`、`sk_mujianyi`、`sk_haichaolianjian`、`sk_jianzhongtuna`、`sk_dugu9` |
| 2 件 | 剑法 `Z2 +3%×G`【Z2】 |
| 3 件 | `attr:crit pp +3×G`【属性层】 |
| 4 件 | 剑法被招架时 `Z9` 减免降低 `4pp×G`【Z9】 |
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
| 4 件 | 招架成功后 30% `applyBuff bf_shiheng` 1 回合；同类取高【机制】 |
| 品阶 | 玄中～天中 |
| 依据 | 张三丰太极拳剑与武当主题有原著依据；推手、两仪心法和奖励为**（原创扩展）** |

可达：高·倚天本土六选4；中·笑傲本土太极残承、两仪、推手、绵掌可 4；低 `C:太极拳+两仪心法+太极剑` →3，连城／鸳鸯本土绵掌可补至 4。

### 11.6 `set_wudang_zhenwu` 武当·真武

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_chunyangwuji`、`sk_wudangjiuyang`、`sk_huzhaojuehushou`、`sk_wujixuangongquan`、`sk_shenmen13`、`sk_yitiantulonggong`、`sk_zhenwuqijie` |
| 2 件 | 武当招式 `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 阳性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 阵中 `Z4 +3%×G`；未装阵则 `attr:resCC pp +2×G`【Z4／属性层】 |
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
| 3 件 | 本回合移动≥3格后 `Z3 +3%×G`【Z3】 |
| 4 件 | 开场 `applyBuff bf_canying` 1 层，每场一次【机制】 |
| 5 件 | 吸内发生时回复吸取量 25% 气血，每回合≤2% hpMax【settle】 |
| 品阶 | 黄上～天上 |
| 依据 | 逍遥派诸绝学有原著主题；坐忘、天鉴、扶摇、琅嬛剑及成套为**（原创扩展）** |

可达：高·天龙本土可装内2、拳3、兵1、轻1达 5；中可携内2、拳2、兵1 →5；低一内、一拳、一兵 →3，无本土补位。七宝指环未落装备标签，不计。

### 12.2 `set_xingxiu_laoxian` 星宿老仙

| 项 | 定稿 |
|---|---|
| 成员（9） | `sk_huagong`、`sk_chousuizhang`、`sk_sanxiaoxiaoyaosan`、`sk_fushidu`、`sk_huoduozhang`、`sk_lianchongshu`、`sk_chanhunwang`、`sk_bilinzhang`、`sk_xingxiudugong` |
| 2 件 | 毒效果 `attr:effHit pct +3%×G`【属性层】 |
| 3 件 | 对中毒目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 本方施加的 `poison` 持续 +1 回合，同定义只取高【机制】 |
| 5 件 | `attr:resPoison pp +3×G`【属性层】 |
| 品阶 | 黄上～地上 |
| 依据 | 丁春秋、化功大法与星宿用毒为原著主题；多门补位和奖励为**（原创扩展）** |

可达：高·天龙本土内3、拳3、兵1、杂2可达 5；中携内2、拳2、兵1 →5；低携一内、一拳、一兵 →3，毒杂学不可携。神木王鼎是奇物，不计。

### 12.3 `set_murong_huanshi` 以彼之道

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_douzhuan`、`sk_canhezhi`、`sk_baijiadao`、`sk_murongjian`、`sk_canheqigong`、`sk_shuixiefeidao`、`sk_longchengxinfa`、`sk_yizhenfengdao` |
| 2 件 | `attr:counter pp +2×G`【属性层】 |
| 3 件 | 被命中后，下一招若同大类则 `Z3 +3%×G`【Z3】 |
| 4 件 | `bf_douzhuan` 奉还倍率 +0.05，与本体上限合并【机制】 |
| 5 件 | 每场首次被不高于 `g_set` 的绝招命中时，触发一次合法奉还【机制】 |
| 品阶 | 黄上～天下 |
| 依据 | 姑苏慕容“以彼之道”与斗转星移为原著主题；补位武学和成套为**（原创扩展）** |

可达：高·天龙本土内3、拳1、兵3、暗1可达 5；中携内2、拳1、兵2 →5；低携一内、一拳、一兵 →3，暗器不能携。

### 12.4 `set_mizong_mingwang` 大轮明王

| 项 | 定稿 |
|---|---|
| 成员（10） | `sk_huoyandao`、`sk_xiaowuxiang`、`sk_dashouyin`、`sk_mizonghufashen`、`sk_zhuohuogong`、`sk_jingangjue`、`sk_wuxiangjiezhi`、`sk_duoluoyezhi`、`sk_ranmudaofa`、`sk_jiashafumogong` |
| 2 件 | 火焰招式 `Z3 +3%×G`【Z3】 |
| 3 件 | `attr:rageGain pp +3×G`【属性层】 |
| 4 件 | 火焰刀射程 +1，每回合至多一次【机制】 |
| 5 件 | 首次施放绝招后，火焰刀冷却 −1，每场一次【机制】 |
| 品阶 | 黄上～天中 |
| 依据 | 鸠摩智以小无相功催动少林绝技为原著主题；密宗补位、范围与数值为**（原创扩展）** |

可达：高·天龙本土十选 5；中携内2、拳2、兵2可达 5；低·鹿鼎 `C:小无相+火焰刀+燃木刀，L:拙火+护法身+大手印+金刚橛`，栏位内可达 6；其他低武纯携入 3。

### 12.5 `set_qidan_xiaofeng` 契丹英雄

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_xianglong18`、`sk_qinlonggong`、`sk_jingedangkouqiang`、`sk_canglangdao`、`sk_tuxiongbohuquan`、`sk_taizuchangquan`、`sk_caoyuanchangqiang`、`sk_liaodongpaochui` |
| 2 件 | 拳脚招式 `Z2 +3%×G`【Z2】 |
| 3 件 | 相邻敌人≥3时 `Z3 +3%×G`、`Z4 +2%×G`【Z3／Z4】 |
| 4 件 | 击杀后 `modRage +5×G`，每回合一次【机制】 |
| 5 件 | 气血首次低于30%时 `applyBuff bf_kuangshi` 2 回合，每场一次【机制】 |
| 品阶 | 黄上～天上 |
| 依据 | 萧峰的降龙、擒龙与契丹身份为原著主题；军阵武学组合与数值为**（原创扩展）** |

可达：高·天龙本土并携跨组成员可达 5；中携拳2、兵2，且通行太祖长拳本土重学 →5；低携降龙、金戈枪并本土重学太祖长拳 →3，鹿鼎若本土契丹补位可到 4。

---

## 13. 倚天门派（5 套）

### 13.1 `set_mingjiao_guangming` 光明圣火

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_qiankun`、`sk_dajiutianshou`、`sk_guangmingxinfa`、`sk_dafengyunfeizhang`、`sk_guangmingquan`、`sk_guangmingduandao` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 阳性招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次被控制命中时 `dispel` 该效果，强度=`g_set`【机制】 |
| 品阶 | 黄中～天中 |
| 依据 | 明教、乾坤大挪移及光明顶为原著主题；补位武学和效果为**（原创扩展）** |

可达：高·倚天本土六选4；中携内2、拳2或内2、拳1、兵1 →4；低一内、一拳、一兵 →3。九阳神功 `setTags` 为空，明确不计成员。

### 13.2 `set_mingjiao_shenghuo` 波斯圣火

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_shenghuoling`、`sk_shenghuoxinfa`、`sk_shenghuotunajue`、`sk_mingjiaoduanjian`、`sk_shenghuobu` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 侧击招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 换位后 `attr:hit pct +2%×G` 1 回合【属性层／机制】 |
| 品阶 | 黄中～天上 |
| 依据 | 圣火令与波斯总教为原著主题；心法、短剑、步法与奖励为**（原创扩展）** |

可达：高·倚天本土 5；中携内2、兵2 →4，轻功不能携；低一内一兵 →2，无明教本土补位。圣火令装备不计。

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
| 3 件 | 七伤拳自伤结算 −`2%×G`，最低保留原值 50%【settle】 |
| 4 件 | 气血低于50%时拳掌 `Z3 +3%×G`【Z3】 |
| 品阶 | 黄中～地上 |
| 依据 | 崆峒七伤拳为原著主题；初诀、养生功、入门链及奖励为**（原创扩展）** |

可达：高·倚天本土 7 选4；中携内2、拳2、兵2可达 4；低一内一拳一兵 →3。套装只缓和、不删除七伤代价。

### 13.5 `set_mingjiao_sida_fawang` 四大法王

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_hanbingmianzhang`、`sk_lieyanzhang`、`sk_qingyifashen`、`sk_shizihou` |
| 2 件 | `attr:resCC pp +3×G`【属性层】 |
| 3 件 | 冰／火／音功招式 `attr:effHit pct +3%×G`【属性层】 |
| 4 件 | 每场首次施加控制成功后 `modRage +5×G`【机制】 |
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
| 3 件 | 先运内功再出剑时 `Z3 +3%×G`【Z3】 |
| 4 件 | 剑法招架成功后 `ctShift +20×G`，每回合一次【ct】 |
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
| 4 件 | 吸取内力后 `attr:eva pct +2%×G` 1 回合【属性层／机制】 |
| 品阶 | 黄上～天阶 |
| 依据 | 日月神教、黑木崖、吸星与葵花为原著主题；入门链和奖励为**（原创扩展）** |

可达：高可携内3、兵3 →6；中·笑傲本土 7 选4；低携一内一兵 →2。易筋经不是成员；吸星异种真气和葵花代价不可免除。

### 14.4 `set_linjia_bixie` 林家辟邪

| 项 | 定稿 |
|---|---|
| 成员（7） | `sk_linjiarumenjian`、`sk_biaojuxinfa`、`sk_linjiajianfa`、`sk_linjiashou`、`sk_fantianzhang`、`sk_bixie`、`sk_kuihua` |
| 2 件 | `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 移动后剑法 `Z3 +3%×G`【Z3】 |
| 4 件 | 每回合首次击倒目标后 `ctShift +25×G`【ct】 |
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
| 4 件 | 雪地移动代价 −1，最低 1；寒地招式 `Z3 +2%×G`【机制／Z3】 |
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
| 4 件 | 每场首次闪避成功后 `ctShift +30×G`【ct】 |
| 品阶 | 玄中～天下 |
| 依据 | 木桑道人、神行百变、暗器与弈棋意象为原著主题；剑法／心法命名和成套为**（原创扩展）** |

可达：高／中·碧血本土可装内1、兵2、轻1、暗1 →5；其他中武携一内、兵2 →3；低一内一兵 →2。金丝背心不计。

### 15.4 `set_shenlong_jiaozhu` 神龙教·教主武库

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_shenlongrumenquan`、`sk_shenlongshebu`、`sk_shenlongzhang`、`sk_yingxiongsanzhao`、`sk_meirensanzhao`、`sk_shenlongxinfa` |
| 2 件 | `attr:effHit pct +3%×G`【属性层】 |
| 3 件 | 对受控制目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次被缴械／缠绕命中时 `dispel` 该效果，强度=`g_set`【机制】 |
| 品阶 | 黄～地；具体见图鉴 |
| 依据 | 神龙教与洪安通武库为原著主题；技能拆分与效果为**（原创扩展）** |

可达：高／中可携内1、拳3，轻功不能携 →4；低·鹿鼎六门本土可达 4；其他低武一内一拳 →2。

### 15.5 `set_shenzhao_liancheng` 神照·连城

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_yuzhongduanquan`、`sk_yuzhongduandao`、`sk_yuzhongqinna`、`sk_xiangxituna`、`sk_meinianshengxinfa`、`sk_shenzhao` |
| 2 件 | `attr:resInjury pp +3×G`【属性层】 |
| 3 件 | 气血低于50%时 `Z4 +3%×G`【Z4】 |
| 4 件 | 每场首次气血低于25%时 `heal hpMax×1%×G`【settle】 |
| 品阶 | 黄下～天阶；具体见图鉴 |
| 依据 | 神照经、丁典—狄云牢狱传承为原著主题；狱中武学、湘西吐纳与奖励为**（原创扩展）** |

可达：高／中携内2、拳2、兵1可达 5；低·连城六门本土，栏位内可达 5；其他低武一内一拳一兵 →3。锁穴效果次数不增加。

### 15.6 `set_yuanyangdao_renzhe` 鸳鸯刀·仁者

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_yuanyangjibenjian`、`sk_renzhetuna`、`sk_yuanyangshuangdao`、`sk_fuqidaofa` |
| 2 件 | `attr:resMind pp +3×G`【属性层】 |
| 3 件 | 对气血高于50%目标 `Z3 +3%×G`【Z3】 |
| 4 件 | 本方造成致死伤害时可将目标留在 1 HP，每场一次；触发后 `modRage +5×G`【机制】 |
| 品阶 | 黄～地；具体见图鉴 |
| 依据 | 鸳鸯刀“仁者无敌”主题有原著依据；基础剑、吐纳、成套奖励为**（原创扩展）**，人物关系细节**（待考）** |

可达：高／中携一内、三兵可达 4；低·鸳鸯四门本土且兵器栏 3 →4；其他低武一内一兵 →2。鸳鸯刀装备不计。

### 15.7 `set_honghua_shisidangjia` 红花十四当家

| 项 | 定稿 |
|---|---|
| 成员（8） | `sk_baihuacuo`、`sk_paoding`、`sk_honghuahuiheji`、`sk_honghuaxinfa`、`sk_jindifa`、`sk_honghuachangquan`、`sk_honghuajian`、`sk_honghuabu` |
| 2 件 | `attr:combo pp +2×G`【属性层】 |
| 3 件 | 相邻友方存在时 `Z4 +3%×G`【Z4】 |
| 4 件 | 友方击倒目标后自身 `ctShift +20×G`，每回合一次【ct】 |
| 6 件 | 开战 `modRage +5×G`【机制】 |
| 品阶 | 黄中～地；具体见图鉴 |
| 依据 | 红花会十四当家与群侠接应为原著主题；合击技能、阈值与数值为**（原创扩展）** |

可达：高可携内1、拳2、兵2，轻／杂不可携 →5；中·书剑本土栏位内可达 6；低一内一拳一兵 →3。

### 15.8 `set_hujia_lengyue` 胡家冷月

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_hujiadao`、`sk_hujiaquan`、`sk_hujiadaoxinfa`、`sk_hujiaxiaolianquan`、`sk_liaodonghushendao` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | 刀法／拳法 `Z3 +3%×G`【Z3】 |
| 4 件 | 未移动时下一次招架 `Z9 +3pp×G`【Z9】 |
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
| 4 件 | 对处于阵法范围内目标 `Z3 +3%×G`【Z3】 |
| 6 件 | 击退抵抗 `attr:resCC pp +3×G`【属性层】 |
| 品阶 | 黄上～地上 |
| 依据 | 历代军伍与守城主题；技能体系和全部奖励为**（原创扩展）** |

可达：高本土／携带内2、兵3、杂1可达 6；中同样可达 6；低 `ALL14` 本土三兵、两内及行军步可达 6，杂学可本土重学。

### 16.3 `set_penglai_chaosheng` 蓬莱潮生

| 项 | 定稿 |
|---|---|
| 成员（6） | `sk_donghaichaoshengzhang`、`sk_tianwangbuxin`、`sk_penglaiquan`、`sk_chaoyinxinfa`、`sk_penglairumenquan`、`sk_haifengbu` |
| 2 件 | `attr:parry pct +3%×G`【属性层】 |
| 3 件 | 水岸／浅水格上招式 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次治疗或施加 `mind` 后 `ctShift +20×G`【ct】 |
| 品阶 | 黄中～地下 |
| 依据 | 蓬莱传承整体为**（原创扩展）**；天王补心针名目与归属**（待考）** |

可达：高·天龙本土拳3、内1、暗1、轻1可达 6；中可携一内、两拳，并在本土有通行投放时补至 4，未投放则 3；低携一内一拳 →2，轻功／暗器不可携且无蓬莱本土来源。

---

## 17. 古龙扩展组（2 套）

### 17.1 `set_yihua_shuangbi` 移花双璧

| 项 | 定稿 |
|---|---|
| 成员（4） | `sk_yihuagongjian`、`sk_yihuagongqinggong`、`sk_yihuajieyu`、`sk_mingyugong` |
| 2 件 | `attr:eva pct +3%×G`【属性层】 |
| 3 件 | 招架后下一招 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次遭远程命中时 `applyBuff bf_youshi` 1 回合【机制】 |
| 品阶 | 黄～地；具体见图鉴 |
| 依据 | 移花宫与明玉功主题来自古龙作品；跨作者扩展接入本作属**（原创扩展）** |

可达：高／中在古龙扩展书界本土四门 →4；无本土时携一内一兵，轻功不可携，第三门类别以图鉴为准可达 2～3；低无本土保守 2。

### 17.2 `set_baiyun_juezhan` 白云决战

| 项 | 定稿 |
|---|---|
| 成员（5） | `sk_baiyunjichujian`、`sk_baiyunjianwei`、`sk_feixiandao`、`sk_tianwaifeixian`、`sk_ximenjiandao` |
| 2 件 | 剑法 `attr:hit pct +3%×G`【属性层】 |
| 3 件 | 单体剑招 `Z3 +3%×G`【Z3】 |
| 4 件 | 每场首次双方皆未受伤时命中，`attr:crit pp +3×G`【属性层／机制】 |
| 品阶 | 黄～天；具体见图鉴 |
| 依据 | 白云城主与西门吹雪决战主题来自古龙作品；技能组合、数值为**（原创扩展）**，不改写原作胜负 |

可达：高／中在古龙扩展书界本土可装 3 门剑法，并由本土轻功 `sk_baiyunjianwei` 补至 4；纯跨书携带受兵器栏与携带上限约束，中／低最多携入 3 门兵器，不能只靠跨书携入激活 4 件。具体书界接入待章节表落盘。

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

下表数字是当前可证明的代表性最高件数；带 `L` 表示依赖标注书界本土重学，带 `X` 表示只在原生／扩展书界成立。精确成员路径见各套条目。

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
| 大轮明王 | 5L | 5 | 6L/3 | 鹿鼎可 |
| 契丹英雄 | 5L | 5L | 4L/3 | 鹿鼎可 |
| 光明圣火 | 4L | 4 | 3 | 不可 |
| 波斯圣火 | 5L | 4 | 2 | 不可 |
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
| 神照连城 | 5 | 5 | 5L/3 | 连城可 |
| 鸳鸯仁者 | 4 | 4 | 4L/2 | 鸳鸯可 |
| 红花十四当家 | 5 | 6L | 3 | 不可 |
| 胡家冷月 | 5 | 5L | 3 | 不可 |
| 江湖百家 | 6L | 6L | 6L | 四界均可 |
| 军伍百战 | 6L | 6L | 6L | 四界均可 |
| 蓬莱潮生 | 6L | 3～4 | 2 | 不可 |
| 移花双璧 | 4X | 4X | 2～3 | 仅扩展本土可 |
| 白云决战 | 4X | 4X | 2～3 | 仅扩展本土可 |

### 18.3 低武分布结论

十四书界中，鹿鼎有少林金刚、少林罗汉、扫地僧、丐帮帮主、大轮明王、契丹英雄、神龙教主与两套通行套；连城有武当太极、神照连城和两套通行套；鸳鸯有武当太极、鸳鸯仁者和两套通行套；白马以江湖百家、军伍百战作为稳定满档，本土专属套装留给章节后续设计。这样既保留低武地域特色，也不靠未登记装备伪造可达性。

---

## 19. 候选收敛与去向

### 19.1 收敛口径

11 份技能图鉴实际提交约 163 个唯一候选 ID，明显高于任务描述中的“10 个图鉴、约 50 个候选”。本版从中保留 44 套。未入选候选的技能标签从图鉴实际 `setTags` 移除，候选节改为本节所列去向；不删除武学本身。

### 19.2 合并到正式套装

| 原候选 | 去向 | 理由 |
|---|---|---|
| `set_shaolin_henglian`、`set_shaolin_banruo`、`set_shaolin_gunseng` | 并入少林金刚／罗汉／达摩主题池 | 减少少林内部碎套；成员仍可作为普通武学 |
| `set_sandu`、`set_chengguan` | 并入扫地僧／方证的人物佛门套 | 同为少林人物与佛法主题，避免四成员重复 |
| `set_gaibang_tuobo`、`set_gaibang_xingyi` | 并入丐帮帮主 | 入门、行艺成为帮主套的成长路径 |
| `set_huangrong_nvzhuge`、`set_taohua_qimen` | 并入桃花岛主／侠之大者 | 黄蓉成员高度重叠 |
| `set_baituo_shenu` | 并入白驼山主 | 同门蛇毒主题 |
| `set_dali_huwei` | 并入一阳 | 大理入门链已在一阳套内 |
| `set_zhoubotong_wantong` | 并入侠之大者／九阴正宗 | 空明、互搏、九阴三件高度重叠 |
| `set_xiaoyao_xuzhu`、`set_lingjiu_jiutian` | 并入逍遥游 | 天阶成员与逍遥门派主题重叠 |
| `set_mizong_jinlun` | 并入大轮明王的密宗玩法池 | 避免两套共用大手印、护法身、拙火 |
| `set_mingjiao_wuxingqi`、`set_tianying_baimei` | 并入光明圣火 | 明教内部集中为主套，角色支系保留武学 |
| `set_huashan_liangyi`、`set_liangyi_sixiang` | 并入华山气剑／武当太极 | 两仪作为招式关系，不另做小套 |
| `set_meizhuang_siyou`、`set_renwoxing`、`set_dongfang_kuihua` | 并入黑木日月／林家辟邪 | 避免吸星、葵花在多套重复叠收益 |
| `set_humiao_bainian`、`set_miaojia_jianxin` | 并入胡家冷月 | 飞狐刀剑对照保留为剧情，不另占套装槽 |
| `set_fuqidao_tongxin` | 并入鸳鸯刀·仁者 | `sk_fuqidaofa` 已作为仁者套成员 |
| `set_wanmei_gucheng`、`set_shenjian_wangfan` | 并入白云决战 | 西门、谢晓峰主题不再各开一套 |

### 19.3 删除：成员不足、依赖未闭合或主题重复

| 图鉴 | 未入选候选 | 处理理由 |
|---|---|---|
| 少林 | `set_nanshaolin_hongmen` | 书剑专属、与红花／少林主题重叠；留作赛季扩展 |
| 五绝 | `set_heifeng_shuangsha`、`set_tiezhang_shuishangpiao`、`set_jiangnan_qiguai`、`set_yangjia_jiangmen`、`set_menggu_shediao`、`set_menggu_mufu`、`set_tiezhang_shanzhai` | 候选过大或人物／势力分散；首发优先六个主传承 |
| 道家 | `set_shujian_mianlizhen`、`set_chilian_xianzi`、`set_jueqing_gongsun`、`set_tiezhang_shuishangpiao` | 依赖装备／非核心携带或与保留套重叠 |
| 逍遥 | `set_sidaeren`、`set_yipintang_tieyao` | 备选未展开，优先保留门派主轴 |
| 倚天 | `set_xuanming` | 只有两门技能，鹿杖／鹤笔装备反向未闭合 |
| 倚天 | `set_kunlun_liangyi`、`set_ruyang_suwei`、`set_haisha_duyan`、`set_jujing_fenshui`、`set_shenquan_cuijun` | 首发容量收敛；保留为未来门派包 |
| 五岳 | `set_taishan_daizong`、`set_hengshan_yunwu`、`set_hengshan_cibei`、`set_qingcheng_songfeng`、`set_wuxian_baidu`、`set_xiaoao_yiren` | 首发只保留四条最具差异的纵向成长线 |
| 五岳 | `set_xiaoao_qinxiao` | 仅 3 个技能成员，未达正式套最小 4 件 |
| 侠客／碧血 | `set_xiakedao_shibi`、`set_xiake_fumo`、`set_motian_qingzhang`、`set_changle_wuxing`、`set_jindao_pigua`、`set_shangqing_xuansu`、`set_shiliang_wuxing` | 仅 3 件，未达最小成员数 |
| 侠客／碧血 | `set_xuansu_shuangjian`、`set_wudu_tieshou` | 依赖未登记装备；去掉装备后主题完整性不足 |
| 侠客／碧血 | `set_jinshe_sanbao` | 依赖金蛇剑／锥装备且当前技能侧不足稳定 4 件 |
| 侠客／碧血 | `set_xiandu_shangqing`、`set_chuangwang_shanzong` | 可闭合但与正式三套相比辨识度／跨界价值较低 |
| 康熙 | `set_chenjinnan`、`set_haidafu` | 单件人物标签，不构成套装 |
| 康熙 | `set_pingxi_junbei`、`set_lvliang_sanjie`、`set_qinggong_yadao` | 只有 2 件 |
| 康熙 | `set_huahui_yexing`、`set_nansiqi_xuegu` | 只有 3 件 |
| 康熙 | 其余天地会、沐府、王屋、清宫、血刀、万家、诗剑、高昌、哈萨克、威信、太岳候选 | 首发容量收敛；保留为章节／DLC 扩展池 |
| 乾隆 | `set_guandong_liumo` | 只有 2 件 |
| 乾隆 | 天池、回部、苗家、商家、药王、广平、八卦、天龙南北、韦陀、八仙、八极、九龙、掌门大会 | 首发容量收敛；不删除武学 |
| 通用 | `set_guchong_mifa`、`set_huanyirong` | 只有 3 件 |
| 通用 | `set_xinglin_qihuang` | 七名成员均为杂学，受 2 个杂学装配栏限制，任何书界都无法达到 4 件 |
| 通用 | 越女、雁门、镖局、武馆、毒家、奇门、雅乐、翰墨、百兽候选 | 与已有正式套重叠或首发容量收敛 |
| 古龙 | 恶人谷、大旗、神水、无争、青龙、快活、血雨、唐门、孔雀、金钱、仁义候选 | 首发扩展组只留两套代表；其余留未来独立平衡 |

### 19.4 装备候选的统一去向

`eq_dagoubang`、`eq_jiuhulu`、`eq_yuxiao`、`eq_ruanweijia`、`eq_baituoshezhang`、`eq_chongyangdaopao`、`eq_junzijian`、`eq_shunvjian`、`eq_xuantiejian`、`eq_qibaozhihuan`、`eq_jinlun`、`eq_shenghuoling`、`eq_tiezhihuan`、`eq_lengyuedao`、`eq_jinsibeixin`、`eq_yuanyangdao` 等均不进入 v1 `members`。若 `design/10` 日后补同名反向标签，可在不改变武学侧的情况下作为版本 2 成员提案；此时必须重跑可达性与中位数回归。

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

`SetDef`、`SetMember`、`SetTier`、`Reachability`、`ActiveSetState`、`effectiveMedianFloor`、`canonTheme` 为本文新增数据约定。44 个 `set_*` ID 均复用图鉴候选，不新造套装 ID。

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

### 21.2 单元测试

| 用例 | 输入 | 期望 |
|---|---|---|
| SET-T01 | 金刚四件品阶 `[8,12,5,6]` | 排序 `[5,6,8,12]`，`g_set=7` |
| SET-T02 | 金刚鹿鼎压制 `[8,6,5,4]` | `g_set=5` |
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
| SET-T17 | 事件套装触发产生反击 | `noSetChain` 阻止套装再次递归 |
| SET-T18 | 两套同加 `fam_z4` | 合并后钳制于 75% |

### 21.3 可达性回归

每次改 `sourceChapters`、携带上限、装配栏或套装成员后，重新枚举所有书界的合法装配组合。至少断言：鹿鼎少林金刚 4；连城神照 4；鸳鸯仁者 4；白马江湖百家 4；所有目录写明“不可 4”的纯携入路径不得被错误判为可达。

---

## 22. 待决事项 / 依赖

### 22.1 替下游给出的建议值

| 编号 | 下游 | 建议值 |
|---|---|---|
| S-D01 | `tech/05` | `g_set` 用整数排序与 `(a+b)>>1` 等价的向下取整；档位变更在原子事件后提交 |
| S-D02 | UI | 套装面板显示“已装配 x/y、当前品阶、下一档”，不显示背包候选为已计件 |
| S-D03 | QA | 以 §21 的 18 条为最低自动化集合；44 套逐套生成双向与阈值测试 |

### 22.2 本文依赖的上游事实

- 携带、压制与残篇服从 `design/02`；若低武携带规则改变，§18.2 全表重算。
- 属性和乘区服从 `design/03`、`design/04`；Buff 原语和上限服从 `design/06`。
- 装配栏与技能有效性服从 `design/05`；装备槽、成对兵器与装备标签服从 `design/10`。
- 图鉴 `sourceChapters` 只证明候选来源；同周目互斥须由各 `chapters/*` 最终验证。

### 22.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| SET-P01 | 基准 §20 增补 `g_set=floor(median(counted effGrade))` 与偶数定义 | 当前只有计件原则，跨品阶档位需唯一公式 |
| SET-P02 | 基准 §20 明写同一唯一 ID 不因多实例重复计件 | 防止双持／复制装备刷件数 |
| SET-P03 | 基准 §20 明写辅运内功和不可施展的已装兵器武学仍计件 | 与 05 §6.5 对齐，避免客户端分歧 |

### 22.4 原著考据待办

继承图鉴现有待考项：达摩剑法／须弥山掌具体出处、九阴神爪版本名、白驼杖法正式名、峨眉部分招名、雪山无妄神功细节、铁剑木桑相关武学名、天王补心针归属。核对只校正文案和 `origin`，默认不改 ID、品阶与首发名额。

### 22.5 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| SET-O01 | 后续是否允许更多装备进入正式成员 | 不允许；先由 10 补真实 `setTags`，再升 `version` |
| SET-O02 | 古龙扩展组对应哪个正式书界 | 暂标扩展本土 `X`；不计十四书界覆盖承诺 |
| SET-O03 | `set_baiyun_juezhan` 四件是否受三兵器栏限制 | 是；轻功作为第 4 件须本土重学，纯携入最多 3 |
| SET-O04 | 白马是否需要独占套装 | 首发不加；以江湖／军伍通行套保证完整体验 |
| SET-O05 | 是否将被删候选作为后续赛季套 | 保留 ID 历史但不进运行数据；新增前重新做 C22 与预算审查 |


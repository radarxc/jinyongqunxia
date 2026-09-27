# 18 · NPC 与同伴系统（NPC & Companions）

> 归属（基准 §18）：NPC 身份与生卒年、分层名录、招募难度与任务门槛、好感与羁绊、离队 / 死亡 / 背叛、同伴跨书界重逢及持久化。
> 上游：`docs/decisions/author-requirements.md` AR-09（高于基准）、`docs/00-canon.md`、`design/01-vision-and-core-loop.md`、`design/02-timeline-and-world-tiers.md`、`design/03-attributes.md`、`design/13-progression-and-endings.md`、`design/17-sects-compendium.md`、`design/20-legacy-inheritance.md`。
> 引用而不重定义：任务与门派流程 → `design/12-quests-npc-factions.md`；战斗编组、合击与 AI → `design/09-combat-system.md`；城市 ID / 坐标 / 时代名 → `design/19-world-map.md` 与 `design/map/cities.yaml`，区域玩法 → `design/11-open-world.md`；营生场所、家业合同与排班 → `design/16-resources-and-estates.md`；传承来源、残本与载体调度 → `design/20-legacy-inheritance.md`；武学 → `design/05` 与 `design/catalog/skills-*.md`；存档 Schema / 运行时 → `tech/04-data-pipeline.md` / `tech/05-gameplay-engine.md`。本文只定义人物实体、生命轴、招募判断和人物侧互斥。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需按三联 / 广州修订版逐字核对；**（推算）** = 由本文所列原著线索和游戏定年估算；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需真机或完整存档验证；**【建议值】** = 依赖其他文档、先给可运行值并在文末登记。
> 版本：v1.2（跨文档同步，2026-09-26）；全局审计（2026-09-26）。

---

## 0. 结论先行与阅读指引

1. AR-09 的“NPC 都可成为同伴”是默认规则。NPC 按 D1–D5 分级；等级越高，越依赖身份、任务、品德、声望和剧情窗口，而不是简单提高好感数值。
2. 战斗队伍仍最多 6 人，即主角 + 最多 5 名队友；其余已招募者在本时代据点、客栈或指定门派留守。战斗内站位、AI、合击均见 `design/09-combat-system.md`。
3. “书眠”是叙事与存档阶段名；主角借《长生诀》沉睡至下一书界。切换时清空活动编组，但保留招募史、羁绊与离队快照。
4. 旧基准“队友不跨书界”由 AR-09 覆盖：故人若在苏醒年仍健在，可经重逢任务再次加入。能力以旧快照为逐项下限，再按新书形象补入武学、层数和功力，只增不减。
5. 具名、可招募 NPC 走 `design/03` 的 `full` 数值管线；普通设施 NPC 与路人走 `template` 管线。年龄段只修正输入画像，不另造第二套战斗公式。
6. 分层名录拆在 `catalog/npcs-*.md`：14 部主线各有 20–40 名带 `npc_*` 的静态 NPC，当前合计 420 条出场索引、395 个唯一人物；另有 13 个不建静态 ID 的角色 / 支持槽，不计入人物下限。其后再列 12 个不占主线配额的具名授艺 / 组织来源、99 个组织、设施和路人模板。名录字段是生产数据候选，不替代原著考据。

### 0.1 章节导航

| 章节 | 内容 | 主要使用者 |
|---|---|---|
| §1 | NPC 分层、身份与状态机 | 策划、叙事 |
| §2 | D1–D5 招募与具名任务链 | 任务、叙事 |
| §3 | 好感、羁绊、队伍与留守 | 系统、战斗 |
| §4 | 离队、死亡、改命与背叛 | 任务、存档 |
| §5 | 生卒年、年龄段与能力段 | 数值、数据 |
| §6 | 《长生诀》沉睡与跨书重逢 | 叙事、存档 |
| §7 | YAML / TypeScript 数据契约 | 客户端、工具链 |
| §8 | 分层名录生产规则 | 内容团队 |
| §9 | 设施、路人及传承载体生成接口 | 城市、经济、传承 |
| §10 | 跨文档接口与事件 | 全体 |
| §11 | 名录索引与覆盖统计 | QA、内容团队 |
| §12 | 参考资料 | 考据 |
| §13–§15 | 术语、校验、待决事项 | 工具链、作者 |

### 0.2 唯一归属边界

| 概念 | 唯一归属 | 本文处理 |
|---|---|---|
| NPC 是谁、何时活着、是否可招募 | 本文 | 定义 |
| 招募条件引用与同伴生命周期 | 本文 | 定义 |
| 任务节点、条件表达式、奖励动作 | `design/12` | 只给兼容载荷 |
| 门派历史、组织状态、职级称谓 | `design/17` | 只挂接 `sect_*` / L1–L5 |
| 战斗上场、AI、合击、倒地 | `design/09` | 只提供角色引用 |
| 属性、敌人模板、等级跟随 | `design/03` | 只给画像修正与管线选择 |
| 武学内容、层数与品阶 | `design/05` / 图鉴 | 只引用已存在 `sk_*` |
| 城市 ID、坐标与时代图层 | `design/19` / `design/map/cities.yaml` | 只挂接已登记 `city_*` |
| 区域探索与城市入口玩法 | `design/11` | 只提出留守 / 重逢地点需求 |
| 赌场 / 镖局 / 山庄营生、月钱 | `design/16` | 只定义人物侧状态与雇佣入口 |
| 传承源、残本、载体调度与挖掘 | `design/20` | 只生成 / 复用载体 NPC 并判定招募 |
| 改命消耗、多周目、成就 | `design/13` | 发事件、保存结果 |
| NPC Schema 与存档迁移 | `tech/04` / `tech/05` | 给出逻辑契约 |

### 0.3 设计原则

- **先人物、后数值**：先确定人物在该书界的身份、立场、时间与关系，再选数值模板。
- **门槛有意义**：D4 / D5 不得退化为“刷满好感 + 交钱”；至少有一个改变关系的专属剧情节点。
- **窗口可读**：暂不可招募必须显示原因与下一次可尝试时机；永久错过前至少一次明确预警。
- **尊重死亡**：死亡不是普通离队。没有完成改命救人时，不得靠住店、复活道具或跨界重置绕过。
- **历史可追溯**：史实人物的年份与身份给来源；小说人物不能精确定年时用范围、年龄段或 `unknown`，不得伪造精确年份。
- **跨书有记忆**：同一人物跨书时使用同一 `npc_*`，别号、阵营与画像用 `appearances` 分段，不复制成两个 NPC。
- **内容可校验**：名录、招募引用、生卒年、武学 ID 与书界出现关系都能静态检查。

---

## 1. NPC 分层、身份与状态机

### 1.1 四层内容名录

名录顺序是内容生产优先级，不等同于战斗强度：

| 层 | 名称 | 定义 | 最低内容量 | 常见难度 | 名录 |
|---|---|---|---:|---|---|
| L-A | 主线重要 NPC | 推动原著主线、正邪线、锚点或改命分支的人物 | 每书界 20–40 | D3–D5 | `catalog/npcs-ch*.md` |
| L-B | 门派 NPC | 99 个组织的掌门、长老、亲传及必要史实人物 | 每组织至少 1 个代表槽 | D3–D5 | `catalog/npcs-sects.md` |
| L-C | 设施 NPC | 店铺、赌场、镖局、山庄、客栈、武馆、医馆等经营人员 | 每开放城市按场所生成 | D2，少数 D3 | `catalog/npcs-facilities.md` |
| L-D | 路人甲 | 填充街巷、驿路、村镇和江湖生态的可招募普通人 | 按人口预算动态生成 | D1 | `catalog/npcs-commoners.md` |

同一个人只建一个主记录。若兼具主线和门派身份，主线名录列完整招募摘要，门派名录仅用同一 ID 建索引，禁止复制状态。

### 1.2 身份组成

NPC 的长期身份由五部分组成：

1. `identity`：姓名、别号、性别表达、史实 / 小说 / 原创标签。
2. `lifespan`：生卒年、精度、证据与例外事件。
3. `appearances`：在每个书界中的年龄、所属组织、职级、地点、能力画像。
4. `recruitment`：D1–D5、任务引用、硬门槛、窗口与拒绝原因。
5. `companionState`：是否曾加入、羁绊、活动编组、留守点、离队快照、生死与背叛。

“同名不同人”必须分 ID；“同一人改名 / 改号”不得分 ID。例如张君宝与张三丰共用 `npc_zhangsanfeng`，在神雕出现段将 `displayName` 写为“张君宝”。周伯通统一使用 `npc_zhoubotong`；仓库遗留 `npc_zhouboting` 是待迁移别名，不得新建第二人物。

### 1.3 内容层与招募难度相互独立

| 例子 | 内容层 | 难度 | 原因 |
|---|---|---|---|
| 城门脚夫 | L-D | D1 | 普通路人，可凭好感或银两同行 |
| 药铺坐堂医 | L-C | D2 | 有职业责任，需代班 / 小任务或雇佣 |
| 门派亲传弟子 | L-B | D3 | 受职级、师门许可和门派任务约束 |
| 黄蓉 | L-A / L-B | D4–D5 分段 | 专属关系链与主线时机约束 |
| 史实皇帝 | L-A | D5 | 原则上有“同行化身”或结盟窗口，是否列极窄例外由作者拍板 |

强者不一定 D5；D 级衡量“建立可持续同行关系的叙事难度”，不是武功强度。

### 1.4 NPC 世界状态

```text
unseen → known → available → recruited ↔ stationed
                    ↓             ↓   ↘
                 refused       departed → available
                    ↓             ↓
                  locked       betrayed
                                  ↓
alive ───────────────────────── dead / fate_rescued
```

| 状态 | 含义 | 可否对话 | 可否入队 | 持久化 |
|---|---|---:|---:|---:|
| `unseen` | 尚未遇见 | 否 | 否 | 否，可由剧情推导 |
| `known` | 已获知或见过，窗口未开 | 是 / 远程线索 | 否 | 是 |
| `available` | 招募任务或条件可推进 | 是 | 条件满足后 | 是 |
| `recruited` | 已招募且在活动编组 | 是 | 已在队 | 是 |
| `stationed` | 已招募，在据点 / 客栈留守 | 是 | 换编组后 | 是 |
| `departed` | 主动或剧情离队，仍可修复 | 视地点 | 重新招募后 | 是 |
| `refused` | 本次邀请被拒 | 是 | 冷却后 | 是 |
| `locked` | 本分支永久失去招募窗口 | 视剧情 | 否 | 是 |
| `betrayed` | 已背叛，进入敌对 / 修复链 | 视任务 | 修复后 | 是 |
| `dead` | 已确认死亡 | 遗物 / 追忆 | 否 | 是 |
| `fate_rescued` | 命定死亡被改命救回 | 是 | 依新窗口 | 是 |

`alive/dead` 是生命轴，`available/recruited/...` 是关系轴；两者不得挤在一个枚举里。死亡优先于所有关系状态。

### 1.5 可见性与不可招募原因

客户端必须从结构化原因渲染提示，不拼接任务内部变量：

| 原因码 | 玩家提示语义 | 是否展示下一步 |
|---|---|---:|
| `RECRUIT_WINDOW_NOT_OPEN` | 时机未到 | 是，显示模糊线索 |
| `RECRUIT_WINDOW_CLOSED` | 已错过本段窗口 | 是，若有改命 / 重逢补救 |
| `RECRUIT_MORALITY_LOW/HIGH` | 行事道路不合 | 是，显示所需方向，不必泄露精确阈值 |
| `RECRUIT_FAME_LOW` | 声名不足 | 是 |
| `RECRUIT_SECT_RANK_LOW` | 门派身份不足 | 是 |
| `RECRUIT_MASTER_DENIED` | 尚无掌门 / 师长许可 | 是 |
| `RECRUIT_QUEST_REQUIRED` | 有未了之事 | 是，指向任务日志 |
| `RECRUIT_PARTY_FULL` | 活动队伍已满 | 是，允许直接送往留守点 |
| `RECRUIT_CONFLICT` | 与当前同伴 / 誓约冲突 | 是，说明冲突对象 |
| `RECRUIT_DEAD` | 人物已经死亡 | 是，若改命仍可达则指向线索 |
| `RECRUIT_ALLIANCE_ONLY` | 当前只可结盟 | 否 / 见开放问题 |

---

## 2. 招募难度 D1–D5

### 2.1 总表

| 等级 | 对象 | 必要门槛 | 可选门槛 | 典型耗时 | 是否必须任务引用 |
|---|---|---|---|---|---:|
| D1 | 路人甲 | 好感或一次性银两 | 职业检定、救助 | 即时–1 个短事件 | 否 |
| D2 | 设施 NPC | 好感 + 小任务，或正式雇佣 | 场所关系、代班、违约金 | 1–3 个节点 | 是，任务或雇佣合同二选一 |
| D3 | 门派 NPC | 玩家职级 / 掌门许可 / 门派任务至少一项 | 贡献、同门关系、值守安排 | 3–6 个节点 | 是 |
| D4 | 有名 NPC | 专属任务链 + 品德 / 声望 / 时机窗口 | 特定同伴、武学、选择历史 | 1 条完整支线 | 是，且不可复用通用模板作为全部内容 |
| D5 | 主线核心人物 | 主线关键幕后 + 原著 / 改命分支限制 | 多重立场、命运、生死与互斥 | 跨幕或跨锚点 | 是，必须有锁定 / 补救设计 |

### 2.2 D1 · 路人甲

满足以下任一路径即可发出同行邀请：

- `affinity >= 20`【建议值】且没有职业 / 家庭硬约束；
- 支付 `hireFee`，完成最短 3 天、最长 30 天【建议值】的短约；
- 在随机事件中救助后获得一次“免门槛邀请”；
- 以同乡、同业或门派关系通过 `speech` 检定，失败只进入 1 天冷却，不永久锁死。

D1 同伴不应成为免费消耗品：其死亡、弃约和拖欠工钱会影响品德、相关城市口碑与同职业 NPC 的价格。

### 2.3 D2 · 设施 NPC

D2 有两条等价路径：

1. **关系路径**：好感达到 30【建议值】并完成一个与职业责任有关的小任务，如替掌柜看店、为郎中采药、替镖师完成未竟镖单。
2. **雇佣路径**：签订合同、支付定金并安排场所代班者；在合同期内可进队，期满自动转 `stationed` 或续约。

设施 NPC 离岗会改变场所状态。若该 NPC 是唯一关键服务者，必须先生成替班者；非关键服务才可显式暂停，不能出现“人已在队、柜台仍同时营业”的双重存在。

### 2.4 D3 · 门派 NPC

D3 至少检查一项门派结构条件：

- 玩家达到 `design/17` 的抽象 L2–L4；
- 本派 L5 / 当前主事人出具许可；
- 完成护送、值守、调解、比武或同门救援任务；

以上门派条件至少满足一项，且 NPC 本人必须处于可离山状态；“有空”不能单独替代职级、许可或任务。具名人物即使列为 D3，也必须完成该人物的任务门槛，不能只靠职级直接招募。

默认规则【建议值】：

| NPC 职级 | 玩家最低关系 | 附加条件 |
|---|---|---|
| L1 外门 / 沙弥 / 帮众 | 同派 L1 或友好 | 完成入门共同任务 |
| L2 入门 / 正式弟子 | 同派 L2 | 当前师长许可 |
| L3 亲传 / 堂主以下骨干 | 同派 L3 | 掌门许可或专属任务 |
| L4 长老 / 护法 / 香主 | 同派 L4 | 临时同行，需门派事务理由 |
| L5 掌门 / 方丈 / 教主 | 不以玩家职级直解 | D4 / D5 专属任务与主线窗口 |

叛派、兼任、敌对门派同队的后果归任务 / 门派系统；本文只记录 `conflicts` 与队伍校验结果。

### 2.5 D4 · 有名 NPC

D4 必须同时具备：

1. 唯一 `questRef`；
2. 至少一个人物价值观门槛（品德、声望、承诺、阵营行为）；
3. 至少一个开放 / 关闭窗口；
4. 至少一次由玩家选择而非战斗胜负决定的关系节点；
5. 拒绝、错过和成功三种结果。

不允许用“送礼 100 次”代替人物线。礼物可降低软门槛，但不得绕过人格与剧情硬门槛。

### 2.6 D5 · 主线核心人物

D5 在 D4 基础上增加：

- `mainlineGateRef`：至少一个主线幕 / 锚点 / 正邪分支条件引用；
- `windowKeys`：明确哪些时段忙于原著事件而不能同行；
- `canonicalConsequenceRef`：加入是否改变原著事件，若改变须指向改命线；
- `fallbackAllianceRef`：无法同行时，是否以援军、情报、庇护或结盟方式兑现关系；
- `lockWarningRef`：永久锁定前至少一次可见预警；
- `fateRuleRef`：若有命定死亡，写明原著线与改命线两种结果引用。

D5 并非“永不加入”。例如一国之君、在位掌门或主线首脑可用短时同行、易装化名、限定副本支援等方式实现 AR-09，同时保持世界可信度。

### 2.7 “永不可招募但可结盟”极窄名单提案

AR-09 原则是人人可招募，因此本文默认名单为空。为处理主权与历史事件不可拆离的角色，仅提出以下候选，等待作者确认；未确认前数据仍按 D5 的“短时同行化身”实现：

| 候选类型 | 候选人物 | 不常驻编组理由 | 默认可交互形态 | 默认裁定 |
|---|---|---|---|---|
| 在位君主 | 宋、元、明、清在位皇帝及大理 / 辽 / 西夏君主 | 长期离位破坏时代主线 | 宫禁副本短时同行、结盟援军 | **可短时招募，不列永久例外** |
| 大规模战争统帅 | 正在统军的史实统帅 | 时间与军务硬约束 | 一场战役的友军领队 | **可短时招募，不列永久例外** |
| 已抽象为世界意志者 | 书灵、守卷人 | 非普通 NPC，属于元叙事机制 | 终局援助 / 结盟 | **建议列为唯二例外** |

最终建议：只有“书灵、守卷人”保留 `allianceOnly: true`；所有书内人物都至少存在一个可控同行窗口。该建议列入 §15.5 开放问题。

### 2.8 招募资格统一求值

```text
evaluateRecruitment(npc, world, player):
  if npc.life == dead: return RECRUIT_DEAD
  if appearance 不存在或当前年份不在出现段: return RECRUIT_NOT_PRESENT
  if allianceOnly: return RECRUIT_ALLIANCE_ONLY
  if 当前窗口未开/已关: return 对应窗口原因
  if 主线、门派、品德、声望、关系、冲突条件任一失败: return 首个可行动原因
  if 活动编组已满: return RECRUIT_PARTY_FULL（仍允许招至留守点）
  return RECRUIT_OK
```

求值顺序固定，避免同一存档在客户端和服务器显示不同原因；详细布尔表达式由 `design/12` 的任务 DSL 执行。

---

## 3. 具名 NPC 专属任务链、好感与队伍

### 3.1 与任务 DSL 的边界

本文只保存任务引用和招募结果，不定义任务 DSL 本身。约定 `design/12` 至少能表达：

- `require`: 旗标、数值、物品、门派、职级、同伴、生死、年份和时间窗；
- `choice`: 玩家承诺与立场选择；
- `effect`: 好感 / 羁绊变化、关系状态、加入 / 离队、站点、生死与改命事件；
- `fail`: 可恢复失败、永久错过、背叛；
- `emit`: 向 13、成就与遥测发结构化事件。

当前 14 份主线名录是**策划索引**，其“招募要点”用于检查每名 D4 / D5 都有专属事件、价值观 / 主线取舍或时机窗口的语义，不冒充已落盘的任务节点。`design/12` 已定稿任务 DSL 和 `companion/*` 动作；本文的 `q_02_bond_01`、`q_03_bond_01` 仍只是格式示例，未在正式任务 manifest 中定义，当前不可解析。后续序列化为 `NpcDef` 时，D4 / D5 必须补齐真实 `questRef`、`gateRef`、`valueGateRefs`、非空 `windowKeys`；D5 还必须补齐 `mainlineGateRef`、`canonicalConsequenceRef`、`fallbackAllianceRef`、`lockWarningRef` 与 `fateRuleRef`（允许为空的字段仍须显式给 `null`）。在这些引用可解析前，生产数据构建不得通过。

### 3.2 D4 / D5 专属任务链模板

| 阶段 | 节点职责 | 必备字段 | 成功输出 | 失败 / 替代 |
|---|---|---|---|---|
| R0 听闻 | 让玩家获知人物与地点 | `rumor`, `sourceNpc`, `openAt` | `known=true` | 可从第二线索补获知 |
| R1 相识 | 首次验证价值观 | `meetScene`, `softGate` | `affinity ±` | 拒绝后冷却，不锁死 |
| R2 试事 | 共同完成与人物相关的小事 | `questRef`, `choice` | `trustFlag` | 产生补救任务 |
| R3 取舍 | 人物线的道德 / 立场选择 | `moralGate`, `branch` | 原著 / 改命倾向 | 进入另一关系分支 |
| R4 共患 | 至少一次不可由送礼替代的共同危机 | `encounterRef` | `bondUnlock` | 结盟但不同行 / 关系受损 |
| R5 邀请 | 判断窗口、队伍、冲突 | `recruitGateRef` | `recruited` 或 `stationed` | 明确原因和重试时机 |
| R6 余波 | 入队后的个人目标 | `companionQuestRef` | 羁绊上限、合击资格 | 离队 / 背叛风险 |

D5 可把 R2–R4 分散到多幕，但不得跳过 R3 的玩家选择。

### 3.3 任务载荷示例

```yaml
recruitment:
  difficulty: D4
  questRef: q_02_bond_01
  windows:
    - key: mobei
      chapter: ch02_shediao
      fromYear: 1217
      toYear: 1220
      require: flag_met_tuolei
    - key: xiangyang
      chapter: ch03_shendiao
      fromYear: 1257
      toYear: 1259
      require: flag_xiangyang_aid
  hardGates:
    - morality_gte: 20
    - not_flag: betrayed_xiangyang
  onSuccess:
    - setCompanionState: recruited
    - emit: companionRecruited
  onMiss:
    fallback: alliance_xiangyang_defender
```

示例只说明结构，具体郭靖任务与年份节点由射雕 / 神雕故事文档校正。

### 3.4 好感与羁绊分工

| 值 | 范围 | 含义 | 来源 | 跨书界 |
|---|---:|---|---|---:|
| `affinity` 好感 | −100..100 | 当前人物对主角的即时态度 | 对话、礼物、任务、阵营行为 | 保留历史值，重逢可修正 |
| `bond` 羁绊 | 0..100 | 经共同经历形成的长期关系 | 共患、个人任务、关键选择、并肩战斗 | 是 |
| `trustFlags` 信任旗标 | 集合 | 不能被数值替代的承诺 / 事实 | 专属任务 | 是 |
| `resentment` 芥蒂 | 0..100 | 违约、伤害亲友、背叛积累 | 任务与队伍事件 | 是，不能靠书眠洗掉 |

`affinity` 高不代表已建立羁绊；D4 / D5 的加入以 `trustFlags` 和任务链为硬门槛。

### 3.5 好感变化【建议值】

| 行为 | 好感 | 羁绊 | 限制 |
|---|---:|---:|---|
| 符合人物偏好的普通对话 | +1～+2 | 0 | 同类话题每日一次 |
| 合宜礼物 | +2～+5 | 0 | 每 7 日同类衰减 |
| 完成小请求 | +5～+10 | +0～+2 | 由任务配置 |
| 专属链关键选择 | −20～+20 | +5～+15 | 不受每日上限 |
| 共患 / 救命 | +10～+25 | +10～+20 | 必须是唯一剧情节点 |
| 违背承诺 | −15～−40 | −5～−20 | 同时写 `resentment` |
| 伤害亲友 / 门派 | −30～−100 | −20～−100 | 可触发离队 / 背叛 |

每日通过重复礼物 / 对话获得的好感最多 +5【建议值】；任务变化不受此限。

### 3.6 羁绊档位与 09 合击接口

| 羁绊 | 关系档 | 本文解锁 | 09 可消费的接口 |
|---:|---|---|---|
| 0–19 | 陌路 | 无 | 无 |
| 20–39 | 相识 | 留守通信、一次重邀 | 基础协同行为权重 |
| 40–59 | 同行 | 个人任务第二段 | 可配置 `comboCandidate` |
| 60–79 | 知交 | 跨界重逢线索优先、结局候选 | `comboEligible=true` |
| 80–89 | 生死 | 命定死亡改命提示 | 专属合击仍需 09 的站位 / 武学条件 |
| 90–100 | 生死与共 | 专属后日谈、终局关系候选 | 可配置终局合击；仍需 09 的站位 / 武学条件 |

`design/09` 消费的是 **0–5 整数羁绊等级**，本文保存的是 0–100 连续进度；唯一换算如下，避免把 60 点误当成 60 级：

```text
bondLevel = 0, bond 0–19
          = 1, bond 20–39
          = 2, bond 40–59
          = 3, bond 60–79
          = 4, bond 80–89
          = 5, bond 90–100
```

因此 `bond=40` 只表示可进入合击候选池，`bond=60 → bondLevel=3` 才满足当前通用合击示例的最低等级；`bond≥90 → bondLevel=5` 是终局关系档。本文只给合击资格和关系标签；伤害、触发时机、站位与动画仍由 `design/09` 定义。

### 3.7 队伍、留守与换编组

活动战斗编组上限固定为 6：

```text
activeParty = 主角 1 + companions 0..5
roster = 本书界已招募且仍可联络的全部 NPC
stationed = roster - activeParty
```

换编组地点：

- 主据点：免费、即时；
- 已登记客栈：免费，但远程调入需等待按地图路程计算的游戏时间；
- 友好门派：同派成员免费，外派成员需门派许可；
- 野外营地：只能在当前随行人员中换上场位，不能把远方留守者瞬移过来；
- 主线临时集结点：由任务显式允许。

活动队伍满员时仍可完成招募，新同伴默认送往玩家指定的有效留守点；没有有效点时用最近已登记客栈。

### 3.8 留守职责

| 职责 | 适用对象 | 效果归属 | 冲突 |
|---|---|---|---|
| 休养 | 受伤 / 中毒同伴 | 03 / 10 | 不能同时执行差事 |
| 看守据点 | 任意同伴 | 16 | 可能触发守卫事件 |
| 设施代班 | 对应职业 D1 / D2 | 16 | 入队即暂停代班 |
| 门派值守 | D3 门人 | 12 / 17 | 离山许可到期后必须返回 |
| 修炼 | 已招募同伴 | 13 | 不上场经验份额见下 |
| 调查线索 | 具备技能者 | 12 | 占用若干游戏日 |

不上场同伴的武学经验份额默认是同队基准份额的 25%【建议值，引用 `design/13`】；角色等级按 13 的等级跟随，不另存一套角色经验。

#### 3.8.1 家业任职互斥与原子交班

家业岗位及合同状态唯一归 `design/16` §7、§14；本文只维护人物侧排他占用。对同一 `npcId`，`assignmentState=estate` 与关系态 `recruited` / `stationed` 不得同时成立：`stationed` 是可随时换入活动编组的同伴留守态，不等于经营岗位。

- 转随队：先由 16 完成岗位交班、释放排班块并写合同 / 指派收据，再把人物从 `estate` 转为 `stationed` 或 `recruited`；若没有合法副手、交班失败或仍有未结职责，人物状态不变。
- 转家丁：先从活动编组移除并完成同伴驻点事务，再由 16 建立自愿合同和岗位指派；不得在两个域各写一份“同一人已到岗”。
- 上层命令以 `npcId + expectedRevision + transitionKey` 幂等；人物占用、岗位 / 排班、合同和 `companionStationChanged` 同事务提交，任一步失败全部回滚。具体工资、能力、合同字段、一个日程块的交接成本及 `assign_servant` 动作见 `design/16` §7、§14。
- 设施唯一服务者仍须先补替班；生成家丁的经营能力、工资和合同读取 16，人物姓名、年龄、人格、生卒与是否可招募读取本文。

### 3.9 同伴冲突

NPC 可声明：

- `hardConflictWith`：绝不同时处于活动队伍；
- `softConflictWith`：可同行，但营地事件与芥蒂变化；
- `requiresWith`：限定任务中必须与另一 NPC 同行；
- `protects`：保护对象被主角伤害时触发强制离队；
- `sectConflict`：由门派关系动态解析，不能把所有敌对门派写死进人物表。

硬冲突不影响两人分别留守；剧情明确要求二选一时才锁定另一人的招募线。

---

## 4. 离队、死亡、改命与背叛

### 4.1 离队类型

| 类型 | 触发 | 状态 | 快照 | 能否重邀 |
|---|---|---|---:|---:|
| 玩家换下 | 在有效换编组点移出活动队伍 | `stationed` | 实时更新 | 是 |
| 合同期满 | D1 / D2 雇佣日数耗尽 | `departed` | 是 | 续约或转长期关系 |
| 门派召回 | 离山许可到期、门派告急 | `departed` | 是 | 完成门派事务后 |
| 个人事务 | 专属任务进入独行阶段 | `departed` | 是 | 到指定节点 |
| 价值观冲突 | 品德、杀害亲友、违诺越界 | `departed` | 是 | 视补救链 |
| 背叛 | 蓄积芥蒂或剧情立场反转 | `betrayed` | 是，背叛前一刻 | 修复任务后；部分分支永久敌对 |
| 死亡 | 原著命定或动态事件确认死亡 | `dead` | 封存 | 仅改命救回后 |
| 书眠 | 进入下一时代图层 | 关系不变，活动编组清空 | 强制保存 | 健在且完成重逢后 |

普通离队不清除好感、羁绊、装备归属和已学武学。任务临时收走的剧情物必须由任务载荷列明，不能把“离队”当作无提示没收。

### 4.2 离队能力快照

每次从 `recruited` 转为其他状态，以及 `BS_COMMIT` 书眠提交前，写入不可变快照：

```yaml
snapshotId: 018f0c43-4b98-7a21-a9be-6c551839ace1 # 运行时 UUID 示例，不是内容 ID
npcId: npc_guojing
chapterId: ch02_shediao
worldYear: 1227
reason: book_sleep
realLevel: 50
permInnates: { con: 82, str: 84, agi: 62, wis: 64, wil: 88, luk: 55, cha: 72 }
innateCapBreaks: { con: 0, str: 0, agi: 0, wis: 0, wil: 0, luk: 0, cha: 0 }
skills:
  - skillId: sk_xianglong18
    trueLayer: 10
    sxp: 0
    sourceCap: 10
    learnedIn: ch02_shediao
    nativeTo: ch02_shediao
    sourceGrade: 12
    latentExp: 0
    movesEquipped: []
    flags: []
  - skillId: sk_jiuyin
    trueLayer: 8
    sxp: 0
    sourceCap: 10
    learnedIn: ch02_shediao
    nativeTo: ch02_shediao
    sourceGrade: 12
    latentExp: 0
    movesEquipped: []
    flags: []
equipmentRefs: []
permanentMods: []
aiPersonality: pers_huzhu
bond: 78
affinity: 74
```

上述数字仅演示结构，不是郭靖最终配表。`skills` 保存 `design/05` §2.6 的持久 `SkillState` 必需字段，并补上 `design/02` §2.2 要求随实例保留的 `sourceGrade`；不能只存 `skillId + trueLayer` 后按新书界默认值重建，否则残承会被错误补全。快照只保存永久先天底子 `perm_X`，不冻结装备、内功、Buff 形成的 `temp_X`；显示层数、外来压制、有效品阶与最终先天仍由 `design/02`、`03`、`05` 在目标书界重新计算。

### 4.3 动态倒地与永久死亡

战斗“倒地 / 失去战斗能力”属于 `design/09`，默认不等于剧情死亡。只有以下动作能把生命轴改为 `dead`：

1. 原著 / 改命锚点任务执行 `confirmNpcDeath`；
2. 铁血等明确开启永久死亡的规则集在战后执行结算；
3. 玩家作出带永久死亡预警的剧情选择；
4. 数据修复时依据已落盘的死亡事实迁移。

死亡记录至少包含 `year`、`precision`、`causeRef`、`branch`、`witnessed`。同一人物不得在同一时间线既 `dead` 又可被普通招募条件复活。

### 4.4 原著命定死亡与改命

AR-09c 已决定“可救回原著命定死亡的同伴”。默认流程：

1. 故事文档把死亡标成 `fatedDeath: true`，同时给原著线死亡节点和改命线救援条件；
2. NPC 必须曾加入过队伍，才能触发“同伴改命”的系统代价；未曾加入者仍可由剧情改命，但不发同伴事件；
3. 救援成功后写 `lifeState=fate_rescued`，原 `died` 进入 `canonicalDied`，运行时死亡年改为 `null` 或新的分支结果；
4. 发 `companionFateRescued(chapterId, npcIds)`；
5. `design/13` 对该书界首次成功扣 2 点修为余韵；同一次救多人仍只计一次，不足写入 `yuyun.fateDebt`；
6. 后续重逢与结局读取救回事实，不强迫另一角色代死。

示例核算：现有余韵 1，同一锚点救回 2 名曾入队同伴，系统所需 `2`，立即扣 `min(1,2)=1`，记债 `2−1=1`；下一个产出的余韵先令 `fateDebt: 1→0`，可花费余韵不增加。

### 4.5 背叛判定

背叛必须可追溯，不得只按随机数触发：

```text
betrayalScore = resentment
              + brokenHardPromises × 25
              + harmedProtectedNpc × 40
              + sectHostilityTerm
              − bond × 0.5
```

阈值默认 60【建议值】。达到阈值先触发一次“最后通牒”；玩家再次越界、拒绝补救或剧情明确立即反目，才进入 `betrayed`。D5 反派的预谋背叛可以绕过分数，但必须在任务链留下至少两条可发现线索。

背叛后的装备处理：NPC 自有物随人离开；玩家借给的普通装备进追索清单；剧情信物依任务结果转移。不得静默复制或销毁唯一装备。

### 4.6 死亡后的传承、遗物与后人

已故者不能通过书眠“史自愈”复活。可用三种回响，均为**（原创扩展）**且不能伪装成原著事实：

| 回响 | 数据 | 内容边界 |
|---|---|---|
| 传承 | `legacy.skillRefs` | 只引用图鉴已有武学；取得仍受 05 门槛 |
| 遗物 | `legacy.itemRefs` | 由 10 定义物品；不凭空复制唯一器物 |
| 后人 / 门人 | `legacy.heirNpcRefs` | 新人物须独立 `npc_*`，关系标原创扩展或待考 |

若无可靠后人资料，宁可只留墓、传闻或旧址，不虚构姓名。需要由后人 / 门人承载残本时，来源调度和残本结果归 `design/20`，人物实体按 §9.5 生成；“后人”是载体总称，不自动断言血缘。

---

## 5. 生卒年、年代与年龄能力段

### 5.1 `born` / `died` 字段规范

生卒字段不是裸整数，而是带证据的时间值：

```ts
type YearValue =
  | { kind: 'exact'; year: number; basis: 'historical' | 'textual'; ref: string }
  | { kind: 'range'; from: number; to: number; basis: 'inferred'; note: string }
  | { kind: 'circa'; year: number; tolerance: number; basis: 'inferred'; note: string }
  | { kind: 'unknown'; ageBand?: AgeBand; note: string };
```

| 标法 | 使用条件 | 名录写法 |
|---|---|---|
| 史实 | 可靠史料可核实 | `1148–1227（史实）[Hxx]` |
| 文本明确 | 原著给年、年龄或可唯一换算 | `生于约 X（推算）`，同时记录换算线索 |
| 范围推算 | 只知事件间年龄段 | `约 1200–1210（推算）` |
| 待考 | 记得有线索但未逐字核 | `?–?（待考：书名、人物、情节）` |
| 年龄段 | 设施 / 路人或无定年必要 | `adult` / `elder` |

史实人物也必须区分“历史上的人”和“小说中的艺术形象”：`identity.origin=historical_fictionalized`。`lifespan` 始终是**小说 / 游戏生命轴**，用于 appearance 与重逢判定；史实生卒另存 `historicalProfile.born` / `historicalProfile.died`，只作考据和冲突告警，不直接裁掉小说中明确出现的人物。若二者一致，可在 `lifespan` 用史实值并把同一 `[Hxx]` 作为依据；若马钰、李自成、郑克塽等小说出场与史实年份冲突，则小说轴写 `unknown / range + explicitAliveAt`，史实精确年只放 `historicalProfile`。

### 5.2 年份语义与健在判定

精确生卒采用三态判定，不能用一个半开区间布尔式吞掉“同年死亡但事件先后未知”的边界：

```text
presenceAt(y):
  if exact born > y: absent
  else if died is null/unknown: unknown unless explicitAliveAt proves alive
  else if exact died > y: alive
  else if exact died < y: dead
  else: life_unknown  # died == y，等事件顺序
```

- `died > wakeYear`：可自动判断健在；
- `died < wakeYear`：已故；
- `died == wakeYear`：年级精度不足，必须看事件先后；未配先后时返回 `life_unknown`，不能自动招募；
- 原著明确某年 / 某事件仍在世，可用 `explicitAliveAt` 覆盖**小说生命轴**的模糊推算；它不改写 `historicalProfile` 中的史实死亡，冲突必须显式告警；
- 改命分支的 `fate_rescued` 优先于原著死亡值。

精确 `born` 晚于书界结束、或精确 `died` 早于书界开始的 NPC，不得在该书界配置实体出现；卒年等于入场年时仍按上述同年边界核定事件先后。回忆、碑文和祖师像用 `presenceMode=reference`，不算活体，也不能触发招募。范围 / 约年须比较完整区间；未知寿年不得当作死亡证据。

### 5.3 年龄段

| ID | 中文 | 默认年龄 | 说明 |
|---|---|---:|---|
| `child` | 幼年 | 0–12 | 不进入常规雇佣池；剧情同行须保护规则 |
| `youth` | 少年 | 13–17 | 身法成长快，体魄未成 |
| `young_adult` | 青年 | 18–29 | 初入江湖至成名 |
| `prime` | 壮年 | 30–49 | 通用完整画像基准 |
| `mature` | 中老年 | 50–64 | 经验增长，体能开始变化 |
| `elder` | 老年 | 65–79 | 普通人衰老显著，宗师可例外 |
| `venerable` | 耄耋 | 80+ | 必须人工画像；不可只按年龄判弱 |

年龄由 `appearanceYear − born` 推导；只有年龄段字段时，生成器在区间内取值并锁入存档，后续逐年增长。

### 5.4 年龄段到能力段的换算

具名 NPC 先手配不含年龄的“人物底稿”，再叠年龄修正，最后进入 `design/03` 的 `full` 管线：

```text
innateAged[k] = clamp(innateBase[k] + ageDelta[band,k] + portrayalOverride[k], 1, cap_X)
# cap_X 通常为 100；仅已有 breakCap 记录时按 design/03 §2.1 提高，最高 120
realLevelTarget = clamp(levelByStoryRole + ageLevelDelta + portrayalLevelOverride, 1, 70)
displayLevel = min(realLevelTarget, chapterLevelCap)
# 只有 design/02 登记的 capExempt Boss：
displayLevelBoss = min(realLevelTarget, 70, chapterLevelCap + capExemptMax[tier])
finalStats = design03.full(innateAged, displayLevel, skills, equipment, templateRole)
```

年龄修正建议表【建议值】：

| 年龄段 | `con` | `str` | `agi` | `wis` | `wil` | 等级段修正 | 武学层数处理 |
|---|---:|---:|---:|---:|---:|---:|---|
| 幼年 | −15 | −18 | −5 | −8 | −6 | −12 | 普通上限 3，剧情神童人工覆写 |
| 少年 | −6 | −8 | +3 | −3 | −2 | −6 | 普通上限 6，主角级人物可覆写 |
| 青年 | 0 | 0 | +2 | 0 | 0 | 0 | 按画像 |
| 壮年 | +2 | +2 | 0 | +2 | +2 | +3 | 按画像 |
| 中老年 | 0 | −2 | −2 | +5 | +5 | +4 | 已掌握层数不因年龄下降 |
| 老年 | −5 | −6 | −6 | +7 | +8 | +2 | 层数不降；可用健康负面表现体衰 |
| 耄耋 | −9 | −10 | −10 | +9 | +10 | 0 | 必须人工覆写；宗师体能衰减可减免 |

说明：

- `luk`、`cha` 不由年龄统一修正；魅力与际遇逐人设定。
- “等级段修正”只改变真实等级目标且不得超过 70。普通可招募 NPC 的显示等级仍为 `min(realLevelTarget, chapterLevelCap)`；只有 `design/02` 每界显式登记、每界至多 2 名的 `capExempt` Boss 才能按高 / 中 / 低武分别超上限 `+3/+4/+6`，并且不放宽武学层数上限。例：故事角色基准 Lv30、壮年修正 `+3`，得真实等级 33；若本界上限 32，则普通角色显示 32，而不是自动获得 Boss 超限。
- 武学历史最高层数只增不减；衰老、伤病若要降低战斗表现，用永久创伤 / Buff 或装配变化表达，不改写历史层数。
- 张三丰、天山童姥等原著明确违背普通年龄体能曲线者，使用 `portrayalOverride`；这是人物刻画，不是所有高龄 NPC 的自动豁免。
- 模板 NPC 不手配七项先天：先由 `tmpl_normal` / `tmpl_elite` / `tmpl_head` / `tmpl_boss` 生成，再按年龄表改先天输入；可招募后转 `full` 固化，避免重进地图重掷。

### 5.5 年龄与武学层数的独立性

年龄只决定身体与阅历画像，不直接授予武学。一个 70 岁普通掌柜仍是 `tmpl_normal`；一个 18 岁原著天才可凭明确画像进入精英或完整法。配置必须同时回答：

1. 该人物为何有这个等级；
2. 武学从何而来，ID 是否已在图鉴；
3. 层数来自何段原著形象；
4. 年龄修正是否被伤病或宗师画像覆盖。

### 5.6 各书界年代对照

下表直接引用 `design/02` §1.5，不在本文重新裁定年代：

| 书界 | 入场—出场年 | 年代性质 | NPC 年龄计算基准 |
|---|---|---|---|
| 天龙 | 1093–1094 | 史年锚定 | 1093 入场、1094 离界 |
| 射雕 | 1217–1227（楔子 1199） | 史年锚定 | 具体 appearance 可取楔子或主体年 |
| 神雕 | 1237–1259 | 史年锚定 | 少年段与十六年后分 appearance |
| 倚天 | 1336–1363（楔子约 1262） | 主体史年锚定 | 张君宝只在楔子 appearance |
| 笑傲 | 约 1523–1525 | 原创扩展定年 | 年份一律带 `approx` |
| 侠客 | 约 1582–1583 | 原创扩展定年 | 年份一律带 `approx` |
| 碧血 | 1630–1645 | 史年锚定 | 序幕 / 主体分 appearance |
| 鹿鼎 | 1669–1690 | 史年锚定 | 按历史事件窗口分段 |
| 连城 | 约 1705–1712 | 原创扩展定年 | 年份一律带 `approx` |
| 白马 | 约 1725–1726 | 原创扩展定年 | 年份一律带 `approx` |
| 鸳鸯 | 约 1740 | 原创扩展定年 | 年份一律带 `approx` |
| 书剑 | 1753–1759 | 史年锚定 | 1753 开局、1759 终段 |
| 飞狐 | 约 1766–1771 | 推定游戏年 | 年份带 `approx` |
| 雪山 | 1780 | 文本年锚定 | 1780 |

---

## 6. 《长生诀》书眠与跨书界同伴

### 6.1 术语与 14 段沉睡

“书眠”是系统阶段名；“《长生诀》沉睡”是 AR-09 指定的叙事机制，均为**（原创扩展）**。主角沉睡期间不老。`sleepYears` 由 `design/02` 以 `下一书界入场年 − 当前书界出场年` 派生：

| 转场 | 算式 | 沉睡年数 |
|---|---:|---:|
| 越女 → 天龙 | `1093 − (−482)` | 1575 |
| 天龙 → 射雕 | `1217 − 1094` | 123 |
| 射雕 → 神雕 | `1237 − 1227` | 10 |
| 神雕 → 倚天 | `1336 − 1259` | 77 |
| 倚天 → 笑傲 | `1523 − 1363` | 160 |
| 笑傲 → 侠客 | `1582 − 1525` | 57 |
| 侠客 → 碧血 | `1630 − 1583` | 47 |
| 碧血 → 鹿鼎 | `1669 − 1645` | 24 |
| 鹿鼎 → 连城 | `1705 − 1690` | 15 |
| 连城 → 白马 | `1725 − 1712` | 13 |
| 白马 → 鸳鸯 | `1740 − 1726` | 14 |
| 鸳鸯 → 书剑 | `1753 − 1740` | 13 |
| 书剑 → 飞狐 | `1766 − 1759` | 7 |
| 飞狐 → 雪山 | `1780 − 1771` | 9 |

数组校验值固定为 `[1575,123,10,77,160,57,47,24,15,13,14,13,7,9]`，本文不复制 `ChapterDef` 的权威配置。

### 6.2 书眠提交时的同伴处理

在 `BS_COMMIT`：

1. 对每名已招募且活着的 NPC 写最后快照；
2. 清空 `activeParty` 中的同伴，只保留主角；
3. 保留 `everRecruited`、好感、羁绊、信任、芥蒂、死亡与改命事实；
4. 把当代地点记为 `lastKnownLocation`，不直接沿用到后世；
5. 目标时代按 appearance 与生命判定生成“故人线索”；
6. 不自动把任何人塞回活动队伍。

这覆盖基准 §3 的旧“队友不跨书界”：活动编组确实不跨，但人物关系与可重逢资格跨界。

### 6.3 苏醒后的健在判定

```text
canReunite(npc, wakeYear):
  require everRecruited == true
  require targetAppearance exists
  if lifeState == fate_rescued: use branch lifespan
  if targetAppearance.presenceMode == reference: absent
  if exact born > wakeYear: absent
  if current branch lifeState == dead: dead
  if explicitAliveAt contains wakeYear/event: alive
  else if exact died > wakeYear: alive
  else if exact died < wakeYear: dead
  else if exact died == wakeYear: unknown until event ordering
  else if inferred range spans wakeYear: unknown, open考据分支而非自动招募
  else unknown; keep rumor, do not auto-recruit or confirm death
```

“原著明确在世”是强证据，例如同一人物确在目标作品出场；但目标作品只是提及先人时，不算健在。

### 6.4 重逢任务模板

| 阶段 | 内容 | 最低要求 |
|---|---|---|
| U0 苏醒汇总 | 列出“可能仍在人间”的故人，不直接报精确位置 | 读取 `everRecruited` 与健在结果 |
| U1 闻讯 | 从门派、城市或旧地取得近况 | 至少两种线索来源，防 NPC 被任务状态卡死 |
| U2 寻访 | 到新身份所在处，处理门禁 | 目标时代 location / sect / rank 生效 |
| U3 相认 | 对照旧信物、共同经历或羁绊 | 不要求玩家重复完整首次招募链 |
| U4 今昔 | 处理其新责任、旧承诺与本时代冲突 | 给“同行 / 留守 / 结盟”选择 |
| U5 归队 | 合并能力，写新快照并发事件 | `companionRejoined` |

羁绊 ≥ 60 时 U1 直接给一条可靠线索；20–59 给模糊线索；低于 20 仍能重逢，但需先修复旧日关系。不得增设“最多沉睡 80 年”之类与 AR-09 无关的硬门槛。

### 6.5 能力合并：旧快照为下限、后世画像只增不减

令 `S_old` 为离队快照，`P_new` 为目标书界原著画像，`M` 为合并结果：

```text
M.permInnates[k]   = max(S_old.permInnates[k], P_new.permInnates[k])
M.innateCapBreaks[k] = max(S_old.innateCapBreaks[k], P_new.innateCapBreaks[k])
M.realLevel       = max(S_old.realLevel, P_new.realLevel)
M.skills          = mergeSkillStates(S_old.skills, P_new.skills)
M.skills[id].trueLayer = max(S_old.skills[id]?.trueLayer ?? 0,
                             P_new.skills[id]?.trueLayer ?? 0)
# 同一武学的来源状态不凭画像猜默认值：
M.skills[id].sourceCap   = max(old.sourceCap ?? 0, new.sourceCap ?? 0)
M.skills[id].sourceGrade = max(old.sourceGrade ?? 0, new.sourceGrade ?? 0)
# learnedIn 保留首次值；sxp / latentExp / insight 取不丢进度的较高值；pages / flags 做集合并集。
# movesEquipped 保留旧配置；新增招式进入已解锁池，经 05 的 moveSlots / 需求校验后换装，不并集合并装配栏。
# nativeTo / attuned* 不能简单取 max：若后世画像来自当前书界的完整来源，按
# design/02 §2.2 的 full 印证把 nativeTo 改为当前书界；若仅 partial，则保留旧
# nativeTo 并写 attunedGrade / attunedIn；两者都没有时保持旧值。
M.permanentMods   = unionByStableId(S_old.permanentMods, P_new.permanentMods)
M.codexKnowledge  = union(S_old.codexKnowledge, P_new.codexKnowledge)
M.equipment       = resolveOwnership(S_old, P_new, currentWorld)
M.permInnates[k]   = clamp(M.permInnates[k], 1, cap_X) # cap_X=100+5×M.innateCapBreaks[k]，≤120
M.realLevel       = clamp(M.realLevel, 1, 70)
M.skills[id].trueLayer = clamp(M.skills[id].trueLayer, 1,
                               min(skillDef.maxLayer ?? 10, M.skills[id].sourceCap))
M.displayLevel    = min(M.realLevel, targetChapter.levelCap)
M.skills[id].effLayer = min(M.skills[id].trueLayer, tierCapEff,
                             gateCap(skillDef.grade, M.displayLevel),
                             skillDef.special?.layerCap ?? 10)
M.effectiveStats  = design02.applyWorldSuppression(design03.full(M))
```

边界：

- 合并前验证旧快照与新画像均满足 03 / 05 上限；若旧数据已越界，应停止重逢提交并进入迁移修复，不能靠 clamp 静默降低旧值。公式中的截断只作为合法输入的防御性边界。
- “只增不减”约束保存的真实能力，不取消新书界天道压制；因此 UI 可显示有效品阶或有效层数下降，但 `realLevel`、永久先天与 `trueLayer` 不减。
- `permInnates` 是 `design/03` §2.1 的永久底子；`innateCapBreaks` 同样逐项取旧快照 / 新画像最大值。通常上限 100，只有已有 `breakCap` 记录可把对应 `cap_X` 逐次提高至最多 120；装备、内功、Buff 等 `temp_X` 不写入快照，重算后的最终先天统一截断至 1–120。真实等级始终在 1–70，武学真实层数还受该实例 `sourceCap` 与武学 `maxLayer` 约束。“只增不减”不能凭空突破这些硬上限。
- 有效层数必须原样走 `design/02` §2.4 / `design/05` §3.4 的权威口径：`min(trueLayer, tierCapEff, gateCap(absGrade, displayLevel), special.layerCap ?? 10)`。`sourceCap` 先约束可保存的 `trueLayer`，不能因跨书重逢消失，但不在有效层数公式里重复列项。普通同伴显示等级仍截断到目标书界 `levelCap`，不继承 Boss `capExempt`。
- `full` 同伴的 `hpMax` 目标仍须落在 `design/03` §10 的“同级同书界 `tmpl_boss` 气血 ×0.6–1.2”区间；合并只提高输入画像，不绕过该模板上限。
- 新画像只可引用图鉴已有 `sk_*`；图鉴尚未收录者写“待对应图鉴收录（不预建 ID）”，不得临时造 ID。
- 原著明确的伤残或疾病不删属性与层数，而以装备限制、永久创伤或状态表现；治愈后可恢复。
- 同一永久加成按稳定 ID 去重，不得因两份画像重复叠加。
- NPC 自有唯一器物按目标时代原著状态解析，不能因快照复制；玩家借用物另走 §4.5 的所有权清单。

### 6.6 未曾加入者与已故者

- 未曾加入：不读取旧画像下限，直接按目标作品的新 appearance 生成；玩家曾见过但没招募不算“曾加入”。
- 曾加入但目标时代无 appearance：只留传闻，不因系统需要强行长寿。
- 已故：进入 §4.6 的传承 / 遗物 / 后人回响；若原著或史实没有后人资料，标原创扩展或不创建。
- 被改命救回：按分支 lifespan 和目标 appearance 评估；目标故事须说明此人存在对后世主线的影响。

### 6.7 算例一：郭靖 · 射雕 → 神雕

射雕离界 1227，神雕入场 1237，沉睡 `1237−1227=10` 年。郭靖在《神雕侠侣》明确在世并为襄阳守城核心，因此健在。

示例旧快照：真实等级 50，`sk_xianglong18 / sk_jiuyin / sk_kongming / sk_zuoyouhubo / sk_wumuyishu = 9/7/8/8/8` 重；神雕画像：真实等级 62，五项为 `10/9/9/8/10` 重，且五个实例均为完整来源 `sourceCap=10`。后二项在《射雕》阶段已经习得 / 取得，不得误列为神雕新增能力。合并为真实等级 `max(50,62)=62`、五项真实层数 `10/9/9/8/10`。神雕是高武，`levelCap=62、tierCapEff=10`；Lv62 对天 / 地阶的 `gateCap` 都为 10，五项 `special.layerCap` 亦按 10，故显示等级 `min(62,62)=62`，有效层数为 `min(trueLayer,10,10,10)=10/9/9/8/10`，不是把神雕误按 9 重截断。

### 6.8 算例二：黄蓉 · 射雕 → 神雕

同样沉睡 10 年。黄蓉在神雕明确在世，身份从少女 / 丐帮继任者变为帮主、襄阳守城者与母亲。旧快照的 `sk_dagou`、`sk_jiuyin` 和桃花岛武学保留；新画像补充阵法、医理或层数时只增不减。她的新责任会把部分年份标为“只能结盟 / 限定任务同行”，但不是永久不可招募。

### 6.9 算例三：周伯通与黄药师 · 射雕 → 神雕

两人均在神雕明确出场，故不需要虚构卒年即可通过 `explicitAliveAt`。周伯通旧有 `sk_kongming`、`sk_zuoyouhubo` 取层数上限，新画像可补后世关系与百花谷位置；黄药师保留桃花岛武学，补入神雕阶段的画像。二人分别建重逢任务，不能因为同属“五绝”合并成一个公共招募开关。

### 6.10 算例四：张君宝 · 神雕 → 张三丰 · 倚天

神雕离界 1259，倚天主体入场 1336，沉睡 77 年。张君宝在《神雕侠侣》末段 / 《倚天屠龙记》楔子后成为张三丰，倚天主体明确健在；同一人物统一为 `npc_zhangsanfeng`，神雕 appearance 显示名“张君宝”。

数值例：少年快照真实等级 28、`sk_shaolinxinfa=4`，倚天张三丰画像真实等级 70，含 `sk_taijiquan=10`、`sk_taijijian=10`、`sk_chunyangwuji=10`，各实例均按完整来源 `sourceCap=10`。合并为真实等级 `max(28,70)=70`，技能集合保留 `sk_shaolinxinfa=4` 并加入三门 10 重；倚天 `levelCap=70、tierCapEff=10`，Lv70 对天 / 地 / 黄阶均有 `gateCap=10`，故显示等级 70，有效层数分别为 4 / 10 / 10 / 10。少年听闻九阳的具体可用武学仍待原著 / 图鉴核配，不因此凭空加入全本 `sk_jiuyang`。其精确出生年与寿数按小说线索仍标（待考），不拿民间传说年份冒充小说事实。

### 6.11 算例五：九难 · 碧血 → 鹿鼎

碧血离界 1645，鹿鼎入场 1669，沉睡 `1669−1645=24` 年。阿九在后作以九难身份明确出现，故可重逢。数值例：旧快照真实等级 54、`sk_shenxing=8`；鹿鼎画像真实等级 58、`sk_shenxing=10`，完整来源 `sourceCap=10`。合并真实等级 `max(54,58)=58`、真实层数 `max(8,10)=10`；鹿鼎 `levelCap=44、tierCapEff=8`，普通同伴显示等级为 `min(58,44)=44`。神行百变是天下 10 品，Lv44 的 `gateCap=9`，故有效层数 `min(10,8,9,10)=8`；存档中的 58 / 10 均不下降，也不借低武 Boss 的 `+6` 超限显示 50。她对吴三桂、清廷和旧明的立场成为重逢 U4 的责任冲突。

### 6.12 算例六：赵半山 · 书剑 → 飞狐

书剑离界 1759，飞狐入场约 1766，沉睡 `1766−1759=7` 年。赵半山在两作均出现，若书剑中曾入队即可从红花会旧识线重逢；未曾加入则按飞狐 appearance 重新生成。数值例：旧快照真实等级 51、`sk_taijimenquan=8`、`sk_guangpingxinfa=7`；飞狐画像真实等级 55、两门为 9 / 8 重，均为完整来源 `sourceCap=10`。合并为真实等级 `max(51,55)=55`、真实层数 9 / 8；飞狐 `levelCap=55、tierCapEff=9`，显示等级 55。太极门拳为玄上 6 品、广平心法为玄下 4 品，Lv55 的 `gateCap` 均为 10，故有效层数分别为 `min(9,9,10,10)=9` 与 `min(8,9,10,10)=8`。相关图鉴未收录的暗器招法仍写“待对应图鉴收录（不预建 ID）”。

### 6.13 同书人物成长算例：少年杨过 → 神雕侠

这不是跨书眠，而是同一书界内多 appearance 的同规则应用：少年杨过的快照为下限，十六年后画像补入 `sk_xuantie`、`sk_anran` 等图鉴已有武学与功力；断臂不删除既有属性或武学，而由画像、装备槽与招式适配表现。此例验证“人物变强不重建 ID”。

---

## 7. NPC 数据结构与持久化契约

### 7.1 YAML 完整示例

以下是结构示例，不是郭靖最终数值表；任务 ID 遵循基准 §12 的 `q_<书界>_<类型>_<nn>`，不会另造 `qst_*` 前缀。城市 ID 必须解析到 `design/map/cities.yaml`；无法落到城市的小说地点用 `cityId: null + placeKey`，不得另造未登记的 `city_*`。

```yaml
id: npc_guojing
identity:
  name: 郭靖
  aliases: [郭大侠]
  origin: fictional
  sourceWorks: [射雕英雄传, 神雕侠侣]
lifespan:
  born:
    kind: range
    from: 1200
    to: 1205
    basis: inferred
    note: 待按射雕开篇十八年之约与主体事件逐字复算
  died:
    kind: unknown
    note: 神雕结局后至倚天前的襄阳结局线索待考
  explicitAliveAt:
    - { chapterId: ch03_shendiao, from: 1237, to: 1259, source: 神雕出场 }
# 只有历史人物 / 历史原型才填；不得驱动小说生命轴
historicalProfile: null
appearances:
  - key: shediao_late # NPC 记录内局部键
    chapterId: ch02_shediao
    years: { from: 1225, to: 1227, approx: false }
    displayName: 郭靖
    presenceMode: living
    ageBand: young_adult
    sects:
      - { sectId: sect_gaibang, rank: null, relation: ally }
    location:
      cityId: city_hangzhou
      placeKey: null
    contentLayer: mainline
    recruitment:
      difficulty: D5
      questRef: q_02_bond_01
      gateRef: q_02_bond_01#recruit_gate
      valueGateRefs: [q_02_bond_01#value_gate]
      mainlineGateRef: q_02_bond_01#mainline_gate
      windowKeys: [mobei, shediao_late]
      canonicalConsequenceRef: q_02_bond_01#canonical_consequence
      fallbackAllianceRef: q_02_bond_01#alliance_fallback
      lockWarningRef: q_02_bond_01#lock_warning
      fateRuleRef: null
    build:
      pipeline: full
      templateRole: tmpl_elite
      levelTarget: 50
      portrayal: young_hero
      skills:
        - { skillId: sk_xianglong18, trueLayer: 9 }
        - { skillId: sk_jiuyin, trueLayer: 7 }
        - { skillId: sk_kongming, trueLayer: 8 }
      unregisteredSkills: []
    ai: { tier: ai_expert, personality: pers_huzhu }
  - key: shendiao_late # NPC 记录内局部键
    chapterId: ch03_shendiao
    years: { from: 1257, to: 1259, approx: false }
    displayName: 郭靖
    presenceMode: living
    ageBand: mature
    sects:
      - { sectId: sect_gaibang, rank: null, relation: ally }
    location:
      cityId: city_xiangyang
      placeKey: xiangyang_command # 城市记录内局部键
    contentLayer: mainline
    recruitment:
      difficulty: D5
      questRef: q_03_bond_01
      gateRef: q_03_bond_01#recruit_gate
      valueGateRefs: [q_03_bond_01#value_gate]
      mainlineGateRef: q_03_bond_01#mainline_gate
      windowKeys: [xiangyang_sortie]
      canonicalConsequenceRef: q_03_bond_01#canonical_consequence
      fallbackAllianceRef: q_03_bond_01#alliance_fallback
      lockWarningRef: q_03_bond_01#lock_warning
      fateRuleRef: q_03_bond_01#fate_rule
    build:
      pipeline: full
      templateRole: tmpl_head
      levelTarget: 62
      portrayal: xiangyang_defender
      skills:
        - { skillId: sk_xianglong18, trueLayer: 10 }
        - { skillId: sk_jiuyin, trueLayer: 9 }
        - { skillId: sk_kongming, trueLayer: 9 }
        - { skillId: sk_zuoyouhubo, trueLayer: 8 }
        - { skillId: sk_wumuyishu, trueLayer: 10 }
      unregisteredSkills: []
    ai: { tier: ai_master, personality: pers_huzhu }
recruitment:
  everRecruitable: true
  allianceOnly: false
  hardConflictWith: []
  softConflictWith: []
bonds:
  tags: [xiangyang, xiazhe] # NPC 系统内局部标签，不是全局内容 ID
  comboCandidateRefs: []
crossBook:
  enabled: true
  reunionQuestByChapter:
    ch03_shendiao: q_03_bond_01
  legacy: { skillRefs: [], itemRefs: [], heirNpcRefs: [] }
sources:
  - kind: novel
    work: 射雕英雄传
    locator: 回目待考：大漠成长、华山论剑相关段落
  - kind: novel
    work: 神雕侠侣
    locator: 回目待考：襄阳守城相关段落
```

### 7.2 TypeScript 类型

以下为完整声明；§5.1 的 `YearValue` 是同一定义的节选，汇总编译时只保留此处一份，与 §7.3 联合使用。

```ts
type NpcId = `npc_${string}`;
type Digit = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9';
type TwoDigits = `${Digit}${Digit}`;
type ChapterId = `ch${TwoDigits}_${string}`;
type SectId = `sect_${string}`;
type SkillId = `sk_${string}`;
type InnateId = 'con'|'str'|'agi'|'wis'|'wil'|'luk'|'cha';
type Grade = 1|2|3|4|5|6|7|8|9|10|11|12;
type QuestKind = 'main'|'side'|'faction'|'bond'|'qiyu';
type QuestId = `q_${TwoDigits}_${QuestKind}_${TwoDigits}`;
type CityId = `city_${string}`;
type TaskNodeRef = `${QuestId}#${string}`;
type RecruitmentDifficulty = 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
type ContentLayer = 'mainline' | 'sect' | 'facility' | 'commoner';
type AgeBand = 'child' | 'youth' | 'young_adult' | 'prime' | 'mature' | 'elder' | 'venerable';
type AiTier = 'ai_basic' | 'ai_adept' | 'ai_expert' | 'ai_master';
type AiPersonality =
  | 'pers_mangfu' | 'pers_jinshen' | 'pers_jiaozha' | 'pers_huzhu'
  | 'pers_yizhe' | 'pers_duzhe' | 'pers_zhenfa';

type YearValue =
  | { kind: 'exact'; year: number; basis: 'historical' | 'textual'; ref: string }
  | { kind: 'range'; from: number; to: number; basis: 'inferred'; note: string }
  | { kind: 'circa'; year: number; tolerance: number; basis: 'inferred'; note: string }
  | { kind: 'unknown'; ageBand?: AgeBand; note: string };

interface HistoricalProfile {
  name: string;
  born: YearValue; died: YearValue | null;
  refs: string[]; // Hxx / Sxx；只作考据，不参与小说 appearance 存活裁定
}

interface NpcDef {
  id: NpcId;
  identity: {
    name: string; aliases: string[];
    origin: 'fictional' | 'historical_fictionalized' | 'expanded' | 'generated';
    sourceWorks: string[];
  };
  lifespan: {
    born: YearValue; died: YearValue | null;
    explicitAliveAt?: Array<{ chapterId: ChapterId; from: number; to: number; source: string }>;
    canonicalDied?: YearValue;
  };
  historicalProfile?: HistoricalProfile | null;
  appearances: NpcAppearance[];
  recruitment: {
    everRecruitable: boolean; allianceOnly: boolean;
    hardConflictWith: NpcId[]; softConflictWith: NpcId[];
  };
  bonds: { tags: string[]; comboCandidateRefs: string[] };
  crossBook: {
    enabled: boolean; reunionQuestByChapter: Partial<Record<ChapterId, QuestId>>;
    legacy: { skillRefs: SkillId[]; itemRefs: string[]; heirNpcRefs: NpcId[] };
  };
  sources: SourceRef[];
}

interface NpcAppearance {
  key: string; // 仅在所属 NPC 内唯一，不注册全局前缀
  chapterId: ChapterId;
  years: { from: number; to: number; approx: boolean };
  displayName: string;
  presenceMode: 'living' | 'reference';
  ageBand: AgeBand;
  sects: Array<{ sectId: SectId; rank: 'L1'|'L2'|'L3'|'L4'|'L5'|null; relation: string }>;
  location: { cityId: CityId|null; placeKey: string|null };
  contentLayer: ContentLayer;
  recruitment: RecruitmentSpec;
  build: FullBuild | TemplateBuild;
  ai: { tier: AiTier; personality: AiPersonality };
}

interface RecruitmentD1ToD3 {
  difficulty: 'D1' | 'D2' | 'D3';
  questRef: QuestId | null;
  contractRef?: string;
  gateRef: TaskNodeRef | null;
  windowKeys: string[]; // 所属 appearance / 任务内局部键
}

interface RecruitmentD4 {
  difficulty: 'D4';
  questRef: QuestId;
  gateRef: TaskNodeRef;
  valueGateRefs: [TaskNodeRef, ...TaskNodeRef[]];
  windowKeys: [string, ...string[]];
}

interface RecruitmentD5 {
  difficulty: 'D5';
  questRef: QuestId;
  gateRef: TaskNodeRef;
  valueGateRefs: [TaskNodeRef, ...TaskNodeRef[]];
  mainlineGateRef: TaskNodeRef;
  windowKeys: [string, ...string[]];
  canonicalConsequenceRef: TaskNodeRef;
  fallbackAllianceRef: TaskNodeRef | null;
  lockWarningRef: TaskNodeRef;
  fateRuleRef: TaskNodeRef | null;
}

type RecruitmentSpec = RecruitmentD1ToD3 | RecruitmentD4 | RecruitmentD5;

interface FullBuild {
  pipeline: 'full'; templateRole: 'tmpl_normal'|'tmpl_elite'|'tmpl_head'|'tmpl_boss';
  levelTarget: number; portrayal: string;
  skills: Array<{ skillId: SkillId; trueLayer: number }>;
  unregisteredSkills: Array<{ name: string; note: '待对应图鉴收录（不预建 ID）' }>;
}

interface TemplateBuild {
  pipeline: 'template'; templateId: 'tmpl_normal'|'tmpl_elite'|'tmpl_head'|'tmpl_boss';
  ageBand: AgeBand; archetype?: string; seedPolicy: 'stable_per_save';
}

interface SourceRef {
  kind: 'novel'|'history'|'repository'|'expanded';
  work?: string; locator: string; url?: string; accessed?: string;
}

type LegacyHeirKind = 'bloodline'|'disciple'|'custodian'|'imitator'|'anonymous';
interface LegacyHeirSpawnRequest {
  sourceId: `lgs_${string}`;
  chapterId: ChapterId;
  heirKind: LegacyHeirKind;
  roleTags: string[];
  difficultyBand: readonly [RecruitmentDifficulty, RecruitmentDifficulty];
  locationHints: Array<{ regionId: string; cityId?: CityId; placeKey?: string }>;
  evidenceRefs?: string[]; // heirKind=bloodline 时必填，且须解析到原著、史料或已审校游戏谱系事实
}
interface LegacyHeirSpawnResult {
  sourceId: `lgs_${string}`;
  npcId?: NpcId;                 // 既有或新增长期具名人物
  generatedNpcRuntimeId?: string; // 一次性无名人物，运行时 UUID
  difficulty: RecruitmentDifficulty;
  recruitable: boolean;
  fallback: 'none'|'alternate_carrier'|'cache';
}
```

`NpcAppearance.build.skills` 只保存 `skillId` 与人物真实层数 `trueLayer`；武学名称、类型和品阶统一通过 `skillId → SkillDef.grade` 从 `design/05` 与对应图鉴解析，NPC 数据不得重复存储或覆写品阶。该二字段列表只是设计索引：运行时生成 / 重逢前，构建器必须从对应书界的合法来源展开为 §7.3 的完整 `CompanionSkillSnapshot`（含 `sourceCap`、`sourceGrade`、`nativeTo` 等）；找不到来源即报错，不能一律补成完整十重来源。若图鉴尚无该武学，只能写入 `unregisteredSkills` 并标“待对应图鉴收录（不预建 ID）”，在图鉴正式建档前不得伪造 `sk_*`。

### 7.3 运行时同伴状态

```ts
interface CompanionState {
  npcId: NpcId;
  lifeState: 'alive' | 'dead' | 'fate_rescued' | 'unknown';
  relationState: 'known'|'available'|'recruited'|'stationed'|'departed'|'refused'|'locked'|'betrayed';
  everRecruited: boolean;
  affinity: number; bond: number; resentment: number;
  trustFlags: string[];
  currentChapterId: ChapterId;
  stationRef: string | null;
  activeSlot: number | null;
  lastKnownLocation: string | null;
  latestSnapshotId: string | null;
  fate?: { canonicalDeathRef: string; rescuedIn: ChapterId; branchDied?: YearValue|null };
  contracts: string[];
}

interface CompanionSnapshot {
  snapshotId: string; // 运行时 UUID，不是内容 ID
  npcId: NpcId; chapterId: ChapterId; worldYear: number; reason: string;
  realLevel: number;
  permInnates: Record<InnateId, number>;
  innateCapBreaks: Record<InnateId, number>;
  skills: CompanionSkillSnapshot[];
  equipmentRefs: string[]; permanentMods: string[];
  aiPersonality: AiPersonality; affinity: number; bond: number;
}

// 字段语义直接引用 design/02 §2.2、design/05 §2.6；这里仅声明快照所需子集。
interface CompanionSkillSnapshot {
  skillId: SkillId;
  trueLayer: number; sxp: number;
  sourceCap: number; sourceGrade: Grade;
  learnedIn: ChapterId; nativeTo: ChapterId;
  attunedGrade?: Grade; attunedIn?: ChapterId;
  latentExp: number; movesEquipped: string[]; flags: string[];
  insight?: number; pages?: number[]; // 05 已有的参悟 / 残页进度，存在时一并保留
}
```

### 7.4 事件接口

| 事件 | 生产者 | 消费者 | 最小载荷 |
|---|---|---|---|
| `companionRecruited` | 本文运行时 / 12 | 13、成就、遥测 | `npcId, chapterId, difficulty, firstTime` |
| `companionDeparted` | 本文运行时 | 任务、UI | `npcId, reason, recoverable` |
| `companionBetrayed` | 任务 / 本文状态机 | 任务、成就 | `npcId, causeRef` |
| `companionDied` | 故事 / 规则集 | 13、后日谈 | `npcId, chapterId, year, fated` |
| `companionFateRescued` | 本文 / story | 13 | `chapterId, npcIds[]` |
| `companionRejoined` | 重逢任务 | 13、成就 | `npcId, fromChapterId, toChapterId, sleepYears` |
| `companionStationChanged` | 编组 UI | 11、16 | `npcId, from, to` |

事件名必须稳定；任务内部节点 ID 不得充当跨系统事实。

### 7.5 Schema 迁移底线

- NPC 定义版本与存档状态版本分开；改名通过 alias 映射迁移，例如遗留 `npc_zhouboting` → `npc_zhoubotong`。
- 删除 appearance 不得删除历史快照；迁移到 `archivedAppearanceId`。
- 新增武学画像只在下次重逢 / 刷新时合并，不在读档瞬间静默改变当前活动队员。
- 生卒考据修正若会让存档中的活人变已故，保留该存档既有分支并标 `legacyTimeline=true`，新游戏使用新事实。
- 任务引用缺失应阻止内容构建；生产环境不得自动把 D4 / D5 降为无门槛 D1。
- ID 政名通过版本化 alias 表在加载前迁移；本版新增 `npc_ningqiangdao → npc_songqiangdao`。旧 ID 只允许出现在迁移表和旧存档，不得继续写入剧情、名录或新快照。

---

## 8. 分层名录的生产规则

### 8.1 主线重要 NPC 字段

14 部名录每行压缩为：`ID｜人物 / 身份｜生卒｜门派 / 阵营｜D 级｜招募要点｜能力要点｜跨书｜出处`。

- 每部 20–40 人；少于 20 构建失败。
- 人物跨书时复用 ID，`跨书` 标目标书界或来源书界。
- `能力要点` 只引用现有图鉴 ID；没有对应图鉴时写“待对应图鉴收录（不预建 ID）”。
- `出处` 不编造回目号：有把握时写情节定位；未逐字核对写“回目待考：人物 / 情节”。
- 同一 NPC 在不同书界可以 D 级变化，因为责任和主线窗口会变化。
- 小说人物生卒通常无法精确定年，优先用年龄段 / 范围与“待考”，不伪造数字。

### 8.2 门派 NPC 字段

`catalog/npcs-sects.md` 必须覆盖 `design/17` 的 99 个 `sect_*`，每组织一行：

| 字段 | 规则 |
|---|---|
| `sectId` | 必须存在于 17 的矩阵 |
| 开放时代 | 直接引用 17 的 O/P/H/M/D/N，不重定义组织历史 |
| L5 / L4 / L3 | 掌门 / 长老 / 亲传代表；原著无名者用角色槽，不虚构姓名 |
| 史实人物 | 标“（史实）”并给参考编号；历史宗教人物不自动成为小说武林高手 |
| 招募 | 通常 D3；掌门与剧情核心升 D4 / D5 |
| 地点 | 17 的建议地点；待 11 定稿后回填 |

古龙 15 组织是 AR-08 的跨作品扩展模块，不冒充金庸原著门派；其人员栏可以使用“待古龙图鉴 / 内容包定名”的角色槽。

### 8.3 设施 NPC 字段

设施表按 `场所模板｜职位｜功能｜对话钩子｜D2 路径｜雇佣价公式｜替班规则` 组织。实例表至少覆盖天龙时代的汴梁、大理、辽上京、兴庆、大同、雁门关附近、洛阳、苏州；城市键必须来自 `design/map/cities.yaml`。雁门关没有独立城市 ID，按 `design/19` 的雁门驿路挂到 `city_xinzhou + placeKey=yanmenguan`，不把关隘冒充城市。

不得给普通设施 NPC 安排未经图鉴收录的具名绝学；战斗配置用 `tmpl_normal` / `tmpl_elite` 与职业原型。

### 8.4 路人甲字段

路人由稳定种子生成：

```text
seed = hash(saveSeed, chapterId, cityId, districtId, spawnWeek, slotIndex)
NPC = surname(region, era) + givenName(genderExpression, era)
    + occupation(cityTags) + ageBand + temperament + rumor + D1 contract
```

名字池必须按地域、族群与时代分组，并维护禁用组合；不得从主线具名 NPC 池拼接同名同姓。

### 8.5 名录中的 ID 策略

- 已有 ID 必须复用。
- 小说具名人物用 `npc_<拼音>`；同音异人依基准 §12 在拼音后加两位书界序号，例如周圻 `npc_zhouqi09`、周绮 `npc_zhouqi12`。
- 设施 / 路人实例先用运行时 UUID；若需要跨系统可读的持久 ID，则采用 §15 提案中的 `npcg_<base32hash>`，在基准接纳前不得把该候选前缀写入生产内容清单。
- 角色槽不是 NPC ID，写成“掌柜槽 / 长老槽”，待下游实例化；这避免给原著未命名角色捏造姓名。
- 名录出现的新 `npc_*` 均登记在对应目录文件，不在主文档重复列 300 余条术语。

---

## 9. 设施 NPC、路人与经济接口摘要

### 9.1 设施雇佣定价

经济锚点读取 `design/16` §12；D1 / D2 冒险同行的风险倍率仍由本文定义：

```text
I_hour(ch) ≈ 2 × P(主武器, g_mode) × chapterIncomeMul
D1日佣 = I_hour × 0.25h × skillMul
D2日佣 = I_hour × 0.50h × skillMul
D2定金 = 3 × D2日佣
```

其中 `skillMul`【建议值】为学徒 0.8、熟手 1.0、名手 1.5。例：天龙正式锚 `I_hour=19 两/时`，熟手 D2 日佣 `19×0.50×1.0=9.5 两`，三日定金 `3×9.5=28.5 两`；射雕 `I_hour=94`，同档日佣 `94×0.5=47 两`，定金 `141 两`。不上场家丁的工资、食宿、取整及合同字段另见 `design/16` §7.5，不得沿用冒险日佣。

### 9.2 招募数量软上限

为了“人人可招募”而不让管理界面失控，限制的是激活与供养，不是终身名录：

| 池 | 上限【建议值】 | 超限处理 |
|---|---:|---|
| 活动战斗编组 | 6 人含主角 | 必须送留守 |
| D1 短约同时有效 | 6 人 | 新签约前先结清 / 结束一份 |
| D2 雇佣同时有效 | 4 人 | 受据点床位和工资约束 |
| 已招募总名录 | 不设硬上限 | UI 分地点、关系和时代筛选 |
| 单一据点留守 | `4 + 据点等级×2` | 转移至客栈 / 门派 |

客卿职位“同一时间只能在一家镖局或山庄任职”约束的是玩家职业，来自 AR-06，不等于 NPC 只能雇一个。

### 9.3 生成 NPC 的时间推进

- 静态具名 NPC：按 `appearances.years` 切换画像。
- 设施 NPC：若未死亡，每过一年年龄 +1；场所易主时可转留守或生成接班槽。
- 路人：已招募或已建立 `bond≥20` 者转持久 NPC；其余离开视野 30 个游戏日后可回收，下次按新周种子生成。
- 书眠：未持久路人全部重建；已招募路人按生卒与年龄正常经历时间，绝不随主角冻结年龄。

### 9.4 儿童、老人和非战斗职业保护

“可成为同伴”不等于所有人都被迫战斗：

- `child` 只能以护送 / 家属形态随行，不占可控战斗位，不可雇为战士；
- 非战斗职业可配置 `combatEligible=false`，仍能在探索、营地、解谜与经营中成为同伴；
- 老年普通人默认不接高危委托；玩家强行带入危险区需二次确认；
- 原著武林高手按人物画像例外，不用年龄歧视式硬禁。

### 9.5 传承载体生成接口

`design/20` §5.2、§10.3 只提交 `LegacyHeirSpawnRequest`；本文负责把请求解析为人物实体和 D1–D5 招募结果，不反向定义传承源、残本或概率。处理顺序固定：

1. 校验六个请求字段 `sourceId/chapterId/heirKind/roleTags/difficultyBand/locationHints`，并确认 `sourceId` 与书界、地点提示可解析；`difficultyBand` 的上下界必须按 D1→D5 有序。
2. `heirKind=bloodline` 时必须有非空 `evidenceRefs`，且每条能解析到原著、可靠史料或已审校的游戏谱系事实；缺证据直接拒绝，不能把“后人”玩法名倒推成血缘。其余类型按 20 §5.1 标**（原创扩展）**，默认优先 `disciple/custodian/imitator/anonymous`。
3. 若有合法既有人物，复用同一 `npc_*` 并验证当界 living appearance；新的长期具名人物须在名录登记独立 `npc_*`、`origin=expanded`。一次性 `anonymous` 使用稳定运行时 UUID，不预建静态 ID。
4. 无名身份种子读取 `tech/05` 的 `(runId, chapterId, templateId, spawnKey, spawnOrdinal)` UUIDv5 规则；同一 `sourceId + chapterId + spawnKey` 重进必须复用姓名、外观、年龄、人格和能力画像，不得临场重掷。
5. 从请求区间、人物责任和 §2 规则确定 D1–D5，再独立判断 `recruitable`；获得残本与招募不是同一结果。人物被占用、死亡或路线排斥时使用 20 已写入的确定性备选，返回 `alternate_carrier` 或 `cache`，不得另抽一个更有利结果。

该接口的 `roleTags`、地点提示和难度带只约束生成，不是新的全局 ID；人物出生、死亡、年龄、职业、人格、战斗资格、招募与驻扎仍以本文为准。

---

## 10. 与其他文档的接口

| 文档 | 本文输入 | 本文输出 / 待同步 |
|---|---|---|
| `design/01` | 《长生诀》叙事、改命锚点 | 重逢、故人告别与跨书人物结果 |
| `design/02` | 14 书界入出场年、14 段沉睡、书眠快照 | 生存判定、重逢候选、能力合并 |
| `design/03` | `full` / `template` 管线与四模板 | 年龄修正输入、NPC 画像选择 |
| `design/05` / 图鉴 | 已存在 `sk_*`、层数规则 | NPC 武学引用；不定义新武学 |
| `design/09` | 编组 ≤6、AI 人格、合击运行时 | `ai`、羁绊与合击资格 |
| `design/19` / `design/map/cities.yaml` | 正式城市 ID、坐标、时代名称与路线 | `cityId`、雁门关附近锚点 |
| `design/11` | 区域探索、入口与城市玩法 | 留守点、重逢地点需求 |
| `design/12` | `quest.v1`、门派关系和 `companion/*` 动作 | `questRef`、招募条件与状态事件 |
| `design/13` | 余韵代价、多周目、成就 | `companionFateRescued`、`companionRejoined` |
| `design/16` | 营生、场所、家丁合同、工资、排班与据点 | 人物身份、替班条件与排他占用 |
| `design/17` | 99 组织、时代状态、L1–L5 称谓 | 门派人物槽与招募难度 |
| `design/20` | 传承源、载体调度、血缘证据与确定性备选 | `LegacyHeirSpawnRequest` 的人物实体、D1–D5 与招募结果 |
| `tech/04` | 内容 Schema 与构建管线 | `NpcDef`、引用校验、版本迁移需求 |
| `tech/05` | 运行时与存档 | `CompanionState`、快照、事件幂等需求 |

### 10.1 `design/12` 接口

`design/12` 的“NPC”和“队友”两节应改为引用本文；其职责仅保留任务 DSL、门派 / 阵营关系、任务实例和经济行为。招募结果动作最少支持 `recruit`、`station`、`depart`、`betray`、`confirmDeath`、`fateRescue`。

### 10.2 `tech/04` 内容构建接口

构建期应：解析所有静态 NPC、展开 appearance 索引、检查跨文件唯一 ID、解析 `sect_*` / `sk_*` / `q_*` / `city_*` 引用、生成每书界 NPC 包与全局轻量索引。地图已定稿，因此任何非空 `cityId` 无法在 `design/map/cities.yaml` 解析都直接报错；无城市归属的小说地点只能使用 `cityId: null + placeKey`。

### 10.3 `tech/05` 运行时接口

运行时应：按年份挑 appearance；以幂等事件更新状态；书眠事务中先写全部快照再清活动编组；重逢合并采用稳定排序和集合去重；存档升级保留旧时间线。重逢事务若中途失败，必须整体回滚，避免“事件已发但 NPC 未归队”。

---

## 11. 分层名录索引与覆盖统计

### 11.1 主线重要 NPC（顺序固定）

| # | 书界 | 文件 | 目标 / 实际数 |
|---:|---|---|---:|
| 1 | 天龙 | `catalog/npcs-ch01-tianlong.md` | 20–40 / 40 |
| 2 | 射雕 | `catalog/npcs-ch02-shediao.md` | 20–40 / 36 |
| 3 | 神雕 | `catalog/npcs-ch03-shendiao.md` | 20–40 / 35 |
| 4 | 倚天 | `catalog/npcs-ch04-yitian.md` | 20–40 / 32 |
| 5 | 笑傲 | `catalog/npcs-ch05-xiaoao.md` | 20–40 / 26 |
| 6 | 侠客 | `catalog/npcs-ch06-xiake.md` | 20–40 / 26 |
| 7 | 碧血 | `catalog/npcs-ch07-bixue.md` | 20–40 / 40 名静态 NPC（另 1 角色槽） |
| 8 | 鹿鼎 | `catalog/npcs-ch08-luding.md` | 20–40 / 32 |
| 9 | 连城 | `catalog/npcs-ch09-liancheng.md` | 20–40 / 27 |
| 10 | 白马 | `catalog/npcs-ch10-baima.md` | 20–40 / 21 名静态 NPC（另 3 支持槽） |
| 11 | 鸳鸯 | `catalog/npcs-ch11-yuanyang.md` | 20–40 / 20 名静态 NPC（另 6 支持槽） |
| 12 | 书剑 | `catalog/npcs-ch12-shujian.md` | 20–40 / 34 名静态 NPC（另 1 群体槽） |
| 13 | 飞狐 | `catalog/npcs-ch13-feihu.md` | 20–40 / 28 |
| 14 | 雪山 | `catalog/npcs-ch14-xueshan.md` | 20–40 / 23 名静态 NPC（另 2 支持槽） |

### 11.2 其余三层

| 层 | 文件 | 覆盖要求 |
|---|---|---|
| 门派 NPC | `catalog/npcs-sects.md` | 99 / 99 `sect_*` 生产行 |
| 设施 NPC | `catalog/npcs-facilities.md` | 9 类模板；天龙 8 城、24 场所、96 个生产槽 |
| 路人甲 | `catalog/npcs-commoners.md` | 16 职业、7 年龄段、D1、持久化与多地域命名闸门 |

以上主线计数只统计首列带 `npc_*` 的静态人物。碧血、白马、鸳鸯、书剑与雪山合计另有 13 个“不建静态 ID”的角色 / 支持槽，只用于运行时生成、群体叙事或场景职能，不计入“每部主线 NPC ≥20”的验收下限，也不会被包装成原著具名人物。主线静态索引与角色槽合计 `420+13=433` 行；其中 420 条静态索引由 395 个唯一人物与 25 条跨书复用组成。§13.3 的 12 个具名授艺 / 组织来源另计，不占十四书配额。

---

## 12. 参考资料

### 12.1 项目内权威来源

| 来源 | 本文使用范围 | 边界 |
|---|---|---|
| `docs/decisions/author-requirements.md` AR-09 | D1–D5、人人可招募、生卒年、《长生诀》沉睡、跨书界重逢、能力只增不减与四层名录 | 作者新增需求，高于基准旧“队友不跨书界” |
| `docs/00-canon.md` §1–§3、§6、§8、§12、§16–§18 | 术语、年代与压制、江湖属性、六人编组、ID、原著边界、书界人物字段 | 四项需同步的基准修订只登记于 §15.3，不直接修改基准 |
| `design/02-timeline-and-world-tiers.md` §1.5、§4、§6 | 书界定年、14 段沉睡、书眠事务与跨界连续性 | 本文消费其权威时间线，不另裁定年代 |
| `design/03-attributes.md` §10 | `full` / `template` 管线、四档模板与等级上限 | 年龄修正只作用于输入画像，不另建属性公式 |
| `design/09-combat-system.md` §8 | 上场人数、AI 人格、合击 | 本文只提供同伴资格与羁绊数据 |
| `design/13-progression-and-endings.md` §6.6 | 命定死亡改命的 2 点余韵与 `fateDebt` | 本文定义人物事实并发稳定事件，不重复定义成长经济 |
| `design/17-sects-compendium.md` §1、§3 | L1–L5、99 个组织与时代状态 | `catalog/npcs-sects.md` 必须与其集合一致 |
| `docs/decisions/rulings-v1.md` | ID 重命名、图鉴归属与现有 `sk_*` | 名录不得抢建新武学 ID |

小说人物的身份、关系和情节定位以三联 / 广州修订版为最终校对基线。本次没有可合法全文检索的指定纸本版本电子文本，因此其余 13 部名录继续保留“回目待考”，不编造章节。前次修订保留的射雕名录 30 人 [N01] 章号 / 章题，以及本次续检的 27 人 [N02] 逐页定位，均只作**二手交叉核对**；该结果仍须按指定纸本终校，不能据此声称版本逐字一致。网络人物表不作为史实年份证据。

小说在线交叉核查来源（访问 **2026-09-26**）：

| 编号 | 来源 | 使用边界 |
|---|---|---|
| N01 | 金庸网，《射雕英雄传》修订版目录及第 01–40 章：<https://jinyongx.com/she/> | 对 `npcs-ch02-shediao.md` 30 人逐章检索姓名，并核对所列情节章号 / 章题；网站版本元数据与文本可靠性不等同三联 / 广州修订版，纸本终校前均视为二手定位 |
| N02 | 古诗文网，《射雕英雄传》分回转录目录：<https://m.gsw6.com/book/sdyxz/> | N1.R 续检逐页读取第 1–9、12、15、17 回，复核 27 个人名的定位，其中 21 名为非史实原型小说人物；可为提及、命名或实体出场，不据此授予 alive。具体页码链接见射雕名录“审校抽查”。未证明与指定纸本逐字一致 |

### 12.2 史实人物联网来源

以下链接均于 **2026-09-26** 访问；仅支持所列年份或历史身份，不证明小说中的门派、武学、亲属改写与行动。

| 编号 | 来源 | 支持的字段 |
|---|---|---|
| H01-1 | 中国道教协会，“丘处机”：<http://www.taoist.org.cn/getDjzsById.do?id=728> | 丘处机 1148–1227 |
| H01-2 | 中国道教协会，“全真教人物资料”：<http://www.taoist.org.cn/getDjzsById.do?id=370> | 马钰 1123–1183、王处一 1142–1217，并再次列丘处机 1148–1227 |
| H02-1 | Encyclopaedia Britannica, “Genghis Khan”：<https://www.britannica.com/biography/Genghis-Khan> | 搜索索引摘要列铁木真 1162?–1227；本次正文访问受限，且生年本有争议，故只支持“约 1162–1227（生年待考）” |
| H02-2 | 《元史·睿宗传》在线转录：<https://m.gushiwen.cn/guwen/bookv_0d82b5e47bb6.aspx> | 正文可定位拖雷壬辰年去世线索；转录非本项目指定史料版本，支持 1232 卒，生年仍（待考） |
| H02-3 | Cambridge University Press, “The Last Campaign and Death of Jebe Noyan”：<https://www.cambridge.org/core/journals/journal-of-the-royal-asiatic-society/article/abs/last-campaign-and-death-of-jebe-noyan/A9D56DDD3328025ED8C43EBAC2153C52> | 摘要说明哲别最后战役与死亡记载存在歧义；不足以定唯一卒年，故名录保留约 1223–1225（待考） |
| H03-1 | 故宫博物院，“洪武皇帝”：<https://www.dpm.org.cn/court/lineage/226244.html> | 朱元璋 1328–1398 |
| H03-2 | 怀远县人民政府，“常遇春”：<https://www.ahhy.gov.cn/zjhy/lswh/lsrw/80744121.html>；蚌埠市人民政府，“常遇春”：<https://www.bengbu.gov.cn/zjbb/lsrw/19413561.html> | 两个地方政府页面分别列 1330–1369、1329–1369；生年有一岁分歧，名录不得写成无争议精确值 |
| H03-3 | 故宫博物院，“徐达”：<https://www.dpm.org.cn/lemmas/245152.html> | 徐达 1332–1385 |
| H03-4 | 中国社会科学院历史研究所，“洪武初年甘肃的地缘政治与明朝西北疆界的形成”：<http://lishisuo.cssn.cn/xsyj/ms/202001/t20200116_5078461.shtml> | 扩廓帖木儿的北元活动背景；本次正文访问不稳定，且该文不足以裁定唯一卒年，1375/1376 仍（待考） |
| H04-1 | CCTV，“袁崇焕”：<https://discovery.cctv.com/special/C20010/20071203/105412.shtml> | 袁崇焕 1584–1630 |
| H04-2 | 故宫博物院，“崇祯皇帝”：<https://www.dpm.org.cn/court/lineage/226246.html>；Encyclopaedia Britannica, “Chongzhen”：<http://www.members.eb.com/biography/Chongzhen> | 故宫按明万历纪年写“万历三十八年（1610）十二月廿四日”；换算公历生日落在 1611 年，Britannica 列 1611–1644。名录统一采用公历 1611–1644，并保留历法说明 |
| H04-3 | 故宫博物院，“李自成”：<https://www.dpm.org.cn/lemmas/243081.html> | 李自成 1606–1645；只支持通行生卒年，小说在鹿鼎时代仍出现须走独立小说生命轴 |
| H04-4 | 故宫博物院，“吴三桂”：<https://www.dpm.org.cn/lemmas/243080.html> | 吴三桂 1612–1678 |
| H04-5 | 故宫博物院，“多尔衮”：<https://www.dpm.org.cn/lemmas/243192.html> | 多尔衮 1612–1650；搜索结果与页面编号已复核 |
| H04-6 | 故宫博物院，“皇太极”：<https://www.dpm.org.cn/court/lineage/226251.html> | 皇太极 1592–1643 |
| H05-1 | 故宫博物院，“康熙皇帝”：<https://www.dpm.org.cn/court/lineage/226256.html>；“康熙设计擒鳌拜”：<https://www.dpm.org.cn/court/event/162313.html> | 康熙 1654–1722、鳌拜 ?–1669，并核对 1669 年擒鳌拜事件 |
| H05-2 | 故宫博物院，“郑克塽”：<https://www.dpm.org.cn/lemmas/241767.html> | 郑克塽 1670–1707 |
| H05-3 | 故宫博物院，“施琅”：<https://www.dpm.org.cn/court/figure/104030.html> | 施琅 1621–1696 |
| H05-4 | The Presidential Library, “Sophia Alekseevna”：<https://www.prlib.ru/en/history/619576>；馆藏专题：<https://www.prlib.ru/section/682864> | 搜索索引摘要列索菲娅 1657–1704；本次人物正文跳转挑战页，故明确按“机构索引摘要佐证”而非正文直核 |
| H05-5 | 光明网，“经师、人师：一代通儒顾炎武”：<https://news.gmw.cn/2021-08/14/content_35079733.htm> | 顾炎武 1613–1682；续检正文返回限制页，以同页搜索索引摘要复核 |
| H05-6 | 浙江档案数据库，“黄宗羲”：<https://zjdy.zjdafw.gov.cn/art/2012/9/12/art_25_8989.html> | 黄宗羲 1610–1695 |
| H05-7 | 故宫博物院，“颁布《大义觉迷录》”：<https://www.dpm.org.cn/court/event/161109.html> | 吕留良 1629–1683 |
| H06 | 常州市地方志办公室，“刘于义（1675—1748）”：<https://fzg.changzhou.gov.cn/html/fzg/2016/POBKOFQN_0628/32266.html>；《清史稿·列传九十四》在线转录：<https://m.gushiwen.cn/guwen/bookv_a42e74194b3c.aspx> | 地方志正文支持刘於义 / 刘于义 1675–1748；《清史稿》转录可定位“十年，署陕西总督”，即雍正十年（1732）。转录非指定史料版本；小说“川陕总督”仍按原著称谓 |
| H07-1 | 故宫博物院，“乾隆皇帝”：<https://www.dpm.org.cn/court/lineage/226263.html> | 乾隆 1711–1799；小说身世说不写作史实 |
| H07-2 | 北京市西城区人民政府，“兆惠府第遗存”：<https://www.bjxch.gov.cn/xcfw/whfw/xxxq/pnidpv959527.html> | 兆惠 1708–1764 |
| H08-1 | 故宫博物院论文 PDF，“福康安、和琳与袁枚的诗文交往”：<https://www.dpm.org.cn/Uploads/pdf/4024/T00002_00.pdf> | 论文正文 / 索引可定位福康安 1754–1796 的口径 |
| H08-2 | 故宫博物院，“福康安”：<https://www.dpm.org.cn/lemmas/241274.html> | 馆方人物页仅载 ?–1796；与同馆论文精度不同，故名录将 1754 标作待考而不伪装成一致结论 |

#### 史实人物审校抽查（N1.R）

2026-09-26 逐项复核了下列 **27 名**史实人物 / 历史原型的姓名与生卒字段：丘处机、王处一、马钰、铁木真、拖雷、哲别、朱元璋、常遇春、徐达、袁崇焕、崇祯、李自成、吴三桂、多尔衮、皇太极、康熙、鳌拜、郑克塽、施琅、索菲娅、顾炎武、黄宗羲、吕留良、刘於义、乾隆、兆惠、福康安。福康安的两种馆方口径只算一人；崇祯已消除传统纪年与公历年份混写。证据强度分级如下：

- **机构正文直接可核（20 人）**：丘处机、王处一、马钰、朱元璋、徐达、袁崇焕、崇祯、李自成、吴三桂、多尔衮、皇太极、康熙、鳌拜、郑克塽、施琅、黄宗羲、吕留良、刘於义、乾隆、兆惠。该组达到审校门槛“≥20 名”；崇祯原页给传统纪年，公历换算精度单列说明。
- **正文 / 学术摘要只支持部分字段或来源互有差异（4 人）**：拖雷只落实 1232 卒；哲别只能确认卒年争议；常遇春的两级政府页面分列 1329、1330 生；福康安同馆论文列 1754、人物页不载生年。相应字段均不得序列化为无争议 `exact`。
- **正文受限、仅机构搜索索引摘要佐证（3 人）**：铁木真、索菲娅、顾炎武。保留链接与访问日，但不据摘要扩写事迹；铁木真生年继续写约年，索菲娅的年份只作历史背景。

上述分级只证明表内所列字段，不等价于对来源全部叙述背书。小说生命轴仍以指定版本原著为准；史实与小说冲突时必须分存。

### 12.3 已联网但仍不作定论的项目

| 项目 | 原因 | 当前处理 |
|---|---|---|
| 哲别卒年 | 现代研究对 1223 战死、约 1224 / 1225 返程去世有不同判断 | `died=unknown`，备注约 1223–1225（待考）；小说 presence 以原著为准 |
| 拖雷生年 | 常见 1191、1192、1193 等口径；本任务未取得足以裁定的权威人物页 | 生年写约 1191–1193（待考），1232 卒可用 |
| 常遇春生年 | 怀远县与蚌埠市政府页面分别采用 1330、1329 | 写 1329/1330–1369（生年待考），不得静默选一 |
| 彭莹玉卒年 | 可见 1352 与 1353 两说，本任务未取得能消除版本差异的一手材料 | 写约 1352/1353（待考） |
| 扩廓帖木儿卒年 | 常见 1375 / 1376 两说 | 写约 1375/1376（待考） |
| 福康安生年 | 故宫论文采用 1754，故宫人物页只载“？–1796” | 写约 1754–1796（生年待考），保留两种馆方精度 |
| 崇祯出生年 | 故宫按万历三十八年（1610）十二月廿四日记载，公历换算为 1611 年；直接并列会造成“相差一年”的假冲突 | 名录统一写公历 1611–1644；来源表保留两种历法口径 |
| 长平公主 | 史料与现代文章常见生于 1629/1630、卒于 1646；小说阿九 / 九难明确活至鹿鼎时代 | 名录把历史原型约年与小说生卒彻底分栏；不让史实死亡覆盖小说 appearance |
| 陈圆圆 | 生年与卒年资料口径分歧较大 | 保留“约 1623–?（史实生卒有争议）” |
| 小说人物回目 | 未取得指定三联 / 广州修订版全文逐字校对条件；仅射雕完成 [N01] / [N02] 二手在线转录交叉核查 | 射雕 30 人保留 [N01] 章号 / 章题，续检 27 人另附 [N02] 逐页定位，均等待纸本终校；其余 13 部只写情节定位并标“回目待考”，不编回目号或引文 |

### 12.4 技术参考

| 编号 | 来源 | 本文使用范围 |
|---|---|---|
| T01 | RFC Editor, RFC 9562 §5.5 “UUID Version 5”：<https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5> | 核实 UUID v5 是基于命名空间与名称的确定性 UUID 方案；路人实现也可采用具备同等稳定性的方案。访问 2026-09-26 |

---

## 13. 本文新增术语与 ID

### 13.1 术语与字段

| 术语 / 字段 | 类型 | 定义 / 所属 |
|---|---|---|
| NPC 内容层 L-A–L-D | 内容分类 | 主线、门派、设施、路人四层；与 D1–D5 难度独立，见 §1.1 |
| 招募难度 D1–D5 | 枚举 | 路人、设施、门派、具名、主线核心五级，见 §2 |
| `affinity` / `bond` / `resentment` | 同伴关系字段 | 即时好感 / 长期羁绊 / 芥蒂，见 §3.4 |
| `trustFlags` | 同伴关系字段 | 不可由数值替代的承诺与共同事实 |
| `allianceOnly` | NPC 字段 | 只能结盟、不可进入可控编组；默认仅书灵与守卷人候选 |
| `appearances` | NPC 字段 | 同一人物按书界、年份和身份分段的画像 |
| `explicitAliveAt` | 生卒字段 | 原著明确在目标作品存活时的正证据 |
| `life_unknown` | 求值结果 | 年份精度不足或卒年与苏醒年同年、尚不能判断事件先后 |
| 离队能力快照 | `CompanionSnapshot` | 离队 / 书眠前保存真实等级、先天、武学层数、永久修正和关系 |
| 同伴重逢 | `companionReunion` | 健在旧同伴经闻讯、寻访、相认、今昔与归队重新加入 |
| 能力合并 | `mergeCompanionPortrait`（逻辑名） | 旧快照为逐项下限，新书画像仅补增，再应用世界压制 |
| 原著命定死亡 | `fatedDeath` | 原著线预定死亡锚；可由已确认 AR-09c 改命救回 |
| 角色槽 | 局部数据 | 无可靠姓名时的生产位置；不是内容 ID，不进入静态 NPC 唯一性集合 |
| `facilityKey` / `roleKey` | 局部键 | 分别只在城市、设施父记录内唯一，不注册全局前缀 |
| `runtimeId` | 运行时 UUID | 设施 / 路人固化后的实例身份，不写入静态内容命名空间 |
| `LegacyHeirSpawnRequest` | 跨域请求 | 20 向本文提交的传承载体生成人物约束，见 §9.5 |
| `assignmentState=estate` | 人物占用态 | 由 16 的家丁合同驱动；与 `recruited/stationed` 互斥，见 §3.8.1 |

### 13.2 新增或采用的稳定事件名

| 事件 | 语义 | 消费方 |
|---|---|---|
| `companionRecruited` | 首次或再次招募成功 | 13、成就、遥测 |
| `companionDeparted` | 可恢复或永久离队 | 任务、UI |
| `companionBetrayed` | 背叛事实成立 | 任务、成就 |
| `companionDied` | 叙事死亡已确认 | 13、后日谈 |
| `companionFateRescued` | 命定死亡改命成功 | 13 的余韵 / 成就 |
| `companionRejoined` | 跨书重逢后重新加入 | 13、成就 |
| `companionStationChanged` | 活动编组与留守点之间移动 | 11、16、UI |

### 13.3 内容 ID 登记方式

下列四项是跨书界固定系统实体，由本文登记身份与招募边界；其中主角与墨侠不是“可邀请的他人”，故不属于 AR-09b 的结盟例外名单：

| ID | 名称 | 类别 / 来源 | 存在与招募 | 关键字段 |
|---|---|---|---|---|
| `npc_zhujue` | 主角 | 玩家化身；身份与外观见 `design/01` §4 | 全程存在；不对自身执行招募 | `origin=expanded`、`everRecruitable=false`、`allianceOnly=false` |
| `npc_shuling` | 书灵（默认真名“余墨”） | 天书录器灵；**（原创扩展）**，人格与形态见 `design/01` §5 | 跨书常驻的非战斗伙伴；只结盟，不进六人战斗编组 | `origin=expanded`、`everRecruitable=false`、`allianceOnly=true`、`combatEligible=false` |
| `npc_shoujuanren` | 天书守卷人 | 前代穿书者 / 终局 Boss；**（原创扩展）**，身份见 `design/01` §3.8，战斗见 `design/13` §7.4 | 只在终局与轮回投影出现；只可结盟，不进入常规同伴池 | `origin=expanded`、`everRecruitable=false`、`allianceOnly=true`、`contentLayer=mainline` |
| `npc_moxia` | 墨侠 | 书影空位的终局临时战斗投影；**（原创扩展）**，生成规则见 `design/13` §7.6 | 不是独立人物，不生成生卒、关系、招募或跨书快照 | `origin=generated`、`systemProjection=true`、`persistent=false`、`comboEligible=false` |

下列具名人物由武学图鉴或组织名录引用，但未进入十四书主线 20–40 人配额；本文作最小静态登记，生产时仍须补 `appearances` 与正式任务引用。生卒未见可靠锚点者统一记 `unknown`，不得据年龄外推年份：

| ID | 人物 / 来源 | 生卒 | 组织 | 分级与最小招募边界 |
|---|---|---|---|---|
| `npc_batianshi` | 巴天石；《天龙八部》大理臣属，善轻功 | `unknown`（待考） | `sect_dali` | D4；王府职责许可后限时同行 |
| `npc_benyin` | 本因；《天龙八部》天龙寺僧 | `unknown`（待考） | `sect_tianlongsi` | D4；护经与寺务许可后阶段同行，僧职称谓待考 |
| `npc_fuminyi` | 符敏仪；《天龙八部》灵鹫宫九天九部具名首领、“针神” | `unknown`（待考） | `sect_lingjiu` | D4；灵鹫宫和九部任务许可后同行 |
| `npc_fusigui` | 傅思归；《天龙八部》大理臣属，持熟铜棍 | `unknown`（待考） | `sect_dali` | D4；王府护卫交班并获许可后同行 |
| `npc_guducheng` | 古笃诚；《天龙八部》大理臣属，持板斧 | `unknown`（待考） | `sect_dali` | D4；王府护卫交班并获许可后同行 |
| `npc_heliantieshu` | 赫连铁树；《天龙八部》西夏一品堂统领 | `unknown`（待考） | `sect_yipintang` | D4；仅西夏阵营或受制 / 和解支线限时同行 |
| `npc_meijian` | 梅剑；《天龙八部》灵鹫宫梅兰竹菊四剑之一 | `unknown`（待考） | `sect_lingjiu` | D4；灵鹫宫职责交班并获本人许可后同行 |
| `npc_zhaixingzi` | 摘星子；《天龙八部》星宿派具名弟子 | `unknown`（待考） | `sect_xingxiu` | D4；星宿排行与立场任务后同行 |
| `npc_zhudanchen` | 朱丹臣；《天龙八部》大理臣属，使用判官笔 | `unknown`（待考） | `sect_dali` | D4；王府护卫交班并获许可后同行 |
| `npc_tianhong` | 天虹禅师；《书剑恩仇录》南少林人物，称谓与关系待考 | `unknown`（待考） | `sect_nanshaolin` | D5；寺务与身世线许可后阶段同行 |
| `npc_yaoyue` | 邀月；古龙《绝代双骄》移花宫宫主 | `unknown`（待考） | `sect_yihuagong` | D5；侠客书界客串线只在立场解锁后短时同行 |
| `npc_lianxing` | 怜星；古龙《绝代双骄》移花宫宫主 | `unknown`（待考） | `sect_yihuagong` | D5；与邀月分别求值，取得本人许可后短时同行 |

这 12 项只闭合具名人物身份，不为武学图鉴中的通用教头、院堂、士兵、猎人、庄丁、门人或群体建立伪静态 NPC；此类引用应改用 `roleKey` / `facilityKey` 或明确的运行时槽。

- 420 条主线静态人物索引行的 `npc_*` 在各 `catalog/npcs-ch*.md` 对应行登记；其中 395 个唯一人物 ID，另 25 行是同一人物的跨书 appearance 索引，故跨文件出现不等于重复定义。§13.3 另登记 12 个不占主线配额的具名来源。慈恩沿用裘千仞的 `npc_qiuqianren`，只新增神雕 appearance，不另建人物。
- 周圻 / 周绮分别为 `npc_zhouqi09` / `npc_zhouqi12`；侠客张三 / 李四分别为 `npc_zhangsan06` / `npc_lisi06`，以书界号消解同名。
- 白马旧导入键 `npc_ningqiangdao` 已迁为 `npc_songqiangdao`（显示“姓宋的强人”）；旧键只保留作 alias，禁止新内容继续引用。
- 99 个 `sect_*` 全部引用 `design/17`，本文未新建组织 ID。
- 所有 `sk_*` 均引用现有图鉴；“待图鉴”项没有预建 ID。
- 本文示例任务引用遵循既有 `q_<书界>_<类型>_<nn>`，但示例 `q_02_bond_01` / `q_03_bond_01` **不登记为已存在内容 ID**；须由 12 / story / chapters 的任务清单正式定义后才能通过引用校验。appearance、窗口、场所、角色、羁绊标签均为父记录内局部键。
- `npcg_<base32hash>` 只是一项生成 NPC 可读持久 ID 的基准提案，在 §15.3 获采纳前不属于正式内容 ID；当前实现使用运行时 UUID。

---

## 14. 数据校验规则与测试用例

### 14.1 构建期强校验

| ID | 检查 | 通过条件 / 失败级别 |
|---|---|---|
| NPC-V01 | 静态 ID 格式与唯一性 | 每条正式人物 ID 匹配 `^npc_[a-z0-9]+(?:_[a-z0-9]+)*$`；同一人物跨书允许多 appearance / 索引行，但全局只有一个 `NpcDef`；不同人物不得同 ID。当前 420 条主线索引行解析为 395 个唯一 ID + 25 条跨书复用；另有 12 个不占主线配额的具名来源。失败 = 构建失败 |
| NPC-V02 | 同名消歧 | 不同人物经规范化姓名相同或拼音冲突时追加两位书界号；已知周圻 / 周绮、侠客张三 / 李四通过。失败 = 构建失败 |
| NPC-V03 | 生卒顺序 | exact / range 值满足 `born ≤ died`；appearance 与 lifespan 无交集时，只能是 `presenceMode=reference`。失败 = 构建失败 |
| NPC-V04 | 出现书界一致性 | 每个活体 appearance 与 `design/02` 年区间有交集；`approx` 书界不得把推定年伪装为精确史实。失败 = 构建失败 |
| NPC-V05 | D4 / D5 门槛（两阶段） | 策划索引阶段：每行“招募要点”非空且明确专属事件 / 取舍 / 窗口语义，失败 = 审校错误。生产数据阶段：D4 / D5 必有可解析 `questRef`、`gateRef`、非空 `valueGateRefs` 与 `windowKeys`；D5 另须有 `mainlineGateRef`、`canonicalConsequenceRef`、`fallbackAllianceRef`、`lockWarningRef`、`fateRuleRef`（可空者显式为 `null`）。任一缺失或引用不可解析 = 构建失败。当前仅通过前一阶段，正式任务清单尚未落盘 |
| NPC-V06 | D1 / D2 伦理门槛 | 儿童不能进入付费战斗雇佣池；唯一设施服务者招募前必须有替班。失败 = 构建失败 |
| NPC-V07 | 每书主线下限 | 14 个文件各有 20–40 条带 `npc_*` 的静态人物行；无名 / 职能支持槽另计，不得充当下限。失败 = 构建失败 |
| NPC-V08 | 武学引用 | 每个 `sk_*` 必须在图鉴唯一归属文档存在；未收录武学只写名称与“待对应图鉴收录（不预建 ID）”。失败 = 构建失败 |
| NPC-V09 | 门派引用 | `catalog/npcs-sects.md` 的首列集合恰等于 `design/17` 的 99 个组织；无多、无少、无重复。失败 = 构建失败 |
| NPC-V10 | 跨书人物复用 | 跨书同一人必须同 ID；不同人不得因同名误合并；appearance 年份有序且不重叠。失败 = 构建失败 |
| NPC-V11 | 设施与路人 ID | 未持久实例无静态 `npc_*`；持久实例用 UUID；`facilityKey` / `roleKey` 只在父级唯一。失败 = 构建失败 |
| NPC-V12 | 来源完整性 | 带“史实”及精确年的行必须有可解析的来源组引用 `[H01]`–`[H08]`（解析到 §12.2 同编号前缀的具体来源）或门派 `[Sxx]`；仅有弱证据或史料分歧者必须写（待考）并禁止序列化为无争议 `exact`。失败 = 警告，发布版升级为错误 |
| NPC-V13 | 任务动作闭合 | `recruit` / `station` / `depart` / `betray` / `confirmDeath` / `fateRescue` 的目标 NPC 存在，动作与生命轴不矛盾。失败 = 构建失败 |
| NPC-V14 | 代码与表格格式 | YAML 可解析；TS 类型检查；Markdown 围栏成对、表格列数一致、无未完成占位标记。失败 = 构建失败 |
| NPC-V15 | 传承载体请求 | 六个基础字段完整；`bloodline` 有可解析 `evidenceRefs`；返回结果恰有一个静态 `npcId` 或运行时 UUID；同一确定性 spawn key 重放不换人。失败 = 构建失败 |
| NPC-V16 | 家业 / 同伴排他占用 | 同一人物不得同时 `assignmentState=estate` 与 `recruited/stationed`；交班事务同时更新排班、合同、人物占用和事件。失败 = 构建失败 |

### 14.2 当前目录金标准

| ID | 输入 / 算式 | 精确期望 |
|---|---|---|
| NPC-T01 | 14 部静态人物行 | `40+36+35+32+26+26+40+32+27+21+20+34+28+23 = 420`；每项均在 20–40 |
| NPC-T02 | 唯一人物与支持槽 | 420 条主线静态索引 = 395 个唯一 `npc_*` + 25 条跨书复用；另有 13 个不建静态 ID 的角色 / 支持槽，主线目录总行 `420+13=433`；§13.3 的 12 个具名来源另计 |
| NPC-T03 | 组织分组 | `29+22+33+15 = 99`，集合与 17 完全相等 |
| NPC-T04 | 设施范例 | `8 城×3 场所×4 槽 = 96`；场所数 `8×3=24` |
| NPC-T05 | 路人年龄权重 | `5+12+24+34+16+7+2 = 100%` |
| NPC-T06 | 书眠间隔 | `[1575,123,10,77,160,57,47,24,15,13,14,13,7,9]`，逐项等于下一书入场年减本书离场年 |
| NPC-T07 | 战斗编组 | 主角 1 + 同伴至多 5 = 总上场 ≤6；第 6 名同伴只能转留守 |
| NPC-T08 | 命定死亡费用 | 余韵 1、同一事件救 2 名曾入队同伴：需 2、先扣 1、`fateDebt=1`，只计一次事件 |
| NPC-T09 | 日佣 | 天龙 `I_hour=19`、熟手 D2：`19×0.50×1=9.5` 两 / 日，三日定金 `3×9.5=28.5` 两 |
| NPC-T10 | 年份同年边界 | `died=1669, wakeYear=1669` → `life_unknown`；只有事件顺序或 `explicitAliveAt` 可裁定，不自动判活 |
| NPC-T10a | D4 / D5 目录门槛 | 14 份名录所有 D4 / D5 行均有非空“招募要点”；不得据此宣称示例 `q_*` 已可解析，待正式任务清单落盘后再执行 NPC-V05 生产阶段 |

### 14.3 跨书与状态机测试

| ID | 前置 / 操作 | 期望 |
|---|---|---|
| NPC-T11 | 郭靖射雕曾加入；1227 快照；1237 苏醒；神雕明确在世 | 清活动队伍但保留关系；生成重逢线；能力逐项取旧快照 / 神雕画像最大值后再受新书压制 |
| NPC-T12 | 同一郭靖仅见过、从未加入 | 不读取旧快照；直接按神雕 appearance 生成，不触发 `companionRejoined` |
| NPC-T13 | 张君宝神雕曾加入，倚天以张三丰出现 | 仍用 `npc_zhangsanfeng`；别号与画像切换；旧武学不减，新画像补太极相关既有 `sk_*` |
| NPC-T14 | 阿九碧血曾加入，鹿鼎以九难出现 | 仍用 `npc_ajiu`；历史原型 1646 卒不覆盖小说 appearance；进入重逢 U0–U5 |
| NPC-T15 | `died < wakeYear` 且未改命 | 不生成活体重逢；只开放传承 / 遗物 / 后人回响，不把书眠当复活 |
| NPC-T16 | `lifeState=fate_rescued` 且有后世 appearance | 使用分支 lifespan，再做健在判定；不会被 `canonicalDied` 二次杀死 |
| NPC-T17 | 重逢合并时新画像某层数低于旧快照 | 保存的 `trueLayer` 不下降；有效层数仍由新书界上限压制 |
| NPC-T18 | 背叛事务中途失败 | 关系、装备追索清单与事件均回滚；不得出现已发事件但人物仍在队 |
| NPC-T19 | 招募唯一客栈掌柜 | 先生成 / 调入替班，再把本人转为同伴；住宿与换队入口持续可用 |
| NPC-T20 | 非汉语地域姓名池未审校 | 使用地域 + 职业称谓并警告，不回退到随机汉名或伪造音译名 |
| NPC-T21 | `LegacyHeirSpawnRequest.heirKind=bloodline` 但无 `evidenceRefs` | 构建失败；不生成血亲，也不静默改写原著谱系 |
| NPC-T22 | 同一匿名传承载体请求以相同 spawn key 重放 | 复用相同运行时 UUID、姓名、外观、人格与 D 级；不得换人或重掷招募性 |
| NPC-T23 | 资源点主管请求转入活动编组，交班步骤中途失败 | 人物仍为家业任职、排班与合同不变，不出现 `recruited/stationed` 双占用；重试只提交一份收据 |
| NPC-T24 | 读取 `npc_ningqiangdao` 旧存档 | 加载前迁为 `npc_songqiangdao`；后续快照、事件与存档只写新 ID |
| NPC-T25 | 飞狐程灵素完成唯一主改命，进入雪山 | 飞狐原著轴为 `dead`；改命轴写 `fate_rescued` 后才可进入雪山重逢候选。马春花本版按第 19 章 `dead`，不得随同跨界 |
| NPC-T26 | 雪山结局键 `pi/bupi/liangquan` | 胡斐生命态依次 `alive/dead/alive`，苗人凤依次 `dead/alive/alive`；三种结果均标原著留白上的**（原创扩展）** |

### 14.4 人工考据抽查

1. 每部至少抽查 5 名核心人物，逐字核对三联 / 广州修订版的人名、别号、关系、死亡与情节定位。
2. 所有“命定死亡”必须在故事文档中有原著线死亡节点；只有记忆、不确定结局的行继续标（待考）。
3. 史实人物抽查链接、访问日期、姓名与生卒；小说形象和历史人物的冲突必须有分离说明。
4. 所有“回目待考”不得在下游自动替换成推测的回目号；只有人工校订后才可移除标记。
5. 碧血、白马、鸳鸯、书剑与雪山的角色 / 支持槽不得在生成时固化成“原著具名人物”；其身份来源必须保留无名职能或群体标记。原创静态补员必须保留 `origin=expanded` 与“原创扩展”。

---

## 15. 待决事项 / 依赖

### 15.1 替下游给出的建议值

以下数值均是可实现默认，不取代归属文档定稿；下游落稿后应把本表条目改为“已解决：见对应文档 §X”。

| 编号 | 下游 | 本文给出的建议值 |
|---|---|---|
| N18-D01 | `design/12` | **已解决：**D1 / D2 门槛、R0–R6 入口与每日关系收益上限已接入任务条件 / 动作；见 `design/12` §5.1、§5.3–§5.4 |
| N18-D02 | `design/12` | **已解决：**D3 读取 L1–L5 与许可，L5 不以职级绕过 D4 / D5 专属链；见 `design/12` §5.4、§6.4 |
| N18-D03 | `design/12` | **已解决：**D4 / D5 使用 R0–R6，任务侧消费本文关系刻度及离队 / 背叛动作；见 `design/12` §5.3–§5.4 |
| N18-D04 | `design/09` | 羁绊 40 开放候选合击、60 稳定合击、90 角色终局合击；具体倍率和站位仍归 09 |
| N18-D05 | `design/11` / `16` | **部分解决：**单据点床位 `4+据点等级×2` 已由 `design/16` §7.6 接纳；D1 同时短约 6、D2 同时雇佣 4 与设施同屏 3 / 6 / 8 仍待运行时 / 性能实测 |
| N18-D06 | `design/16` | **已解决（边界）：**家丁工资、食宿与取整见 `design/16` §7.5；D1 / D2 冒险同行仍按本文 §9.1 的 `0.25h/0.50h×skillMul`，D2 三日定金 |
| N18-D07 | `tech/05` | 未持久路人离开视野 30 游戏日可回收；单街区 12、单城 48；持久 NPC 不设玩法硬上限但需分页 / 卸载 |
| N18-D08 | `tech/04` | 本文 §14 的 NPC-V01–V16 作为构建闸门；`design/map/cities.yaml` 已落盘，非空城市 ID 无法解析时直接报错 |

### 15.2 本文依赖的上游事实

| 上游 | 状态与本文采用 |
|---|---|
| AR-09 | **已解决：作者需求明确覆盖基准旧规则。** 曾加入且健在的同伴可跨书重逢；能力只增不减 |
| AR-09c / `design/13` §6.6 | **已解决：**原著命定死亡同伴可改命救回；每书界首次成功 2 点余韵，不足记债 |
| `design/02` §1.5 | **已解决：**采用 14 段沉睡数组，不在本文另设最大跨年限制 |
| `design/03` §10 | **已解决：**具名可招募角色用 `full`，普通设施 / 路人用 `template`；年龄仅修正输入 |
| `design/09` | **已解决：**活动战斗编组 ≤6、AI 与合击运行规则归 09 |
| `design/17` | **已解决：**门派名录严格覆盖 99 个组织及其时代状态、L1–L5 抽象层级 |
| `design/19` / `design/map/cities.yaml` | **已解决：**八个设施范例已使用正式城市 ID；雁门关用 `city_xinzhou + placeKey=yanmenguan` 接入既有雁门驿路 |
| `design/11` | **已解决（设计接口）：**区域、城市入口、十二时辰、留守 / 重逢位置读取其正式定义；人物不改写 19 的城市 ID / 坐标 |
| `design/12` | **已解决（设计接口）：**任务使用 `quest.v1` 与 `companion/*` 动作；本文示例 `q_02_bond_01/q_03_bond_01` 仍须在正式 manifest 定义后才能解析 |
| `design/16` | **已解决（设计接口）：**场所、家丁工资、合同、班次与经营影响读取 16；人物侧排他占用与原子交班见 §3.8.1 |
| `design/20` | **已解决（设计接口）：**载体调度只提交六字段请求；人物生成、血缘证据闸门、D1–D5 与招募见 §9.5 |
| `tech/04` / `tech/05` | 文档已落稿；仍需在实现中接入本文补充的 alias、传承载体与跨域原子交班，并做性能 / 真机实测 |

### 15.3 对基准的修改提案

> 只登记提案，不修改 `docs/00-canon.md`；AR-09 已是现行高优先级需求，下列用于 A3 把事实源同步成自洽文本。

| 编号 | 提案 | 理由 / 建议落点 |
|---|---|---|
| N18-P01 | 基准 §1“书眠”补注：叙事机制名为《长生诀》；进入下一书界即主角以《长生诀》沉睡 `sleepYears` 年并在下一时代图层苏醒，主角不老 | 落实 AR-09，避免把书眠误解成瞬时传送；具体年份仍引用 02 |
| N18-P02 | 基准 §3“队友不跨书界”改为：“活动战斗编组不直接跨界；招募史、羁绊和离队能力快照保留。曾加入且在目标书界健在者，经 18 的重逢任务可再次加入，真实能力以旧快照为下限并只补增；仍受目标书界天道压制。” | AR-09 明确覆盖旧句；同时保留编组清空与压制 |
| N18-P03 | 基准 §12 保留静态人物 `npc_<拼音>`，另登记生成 / 设施持久实例前缀候选 `npcg_<base32hash>`；在接纳前实现继续用运行时 UUID | 静态内容 ID 与无限生成实例必须分域；避免 `npc_gen_*` 占用静态命名空间 |
| N18-P04 | 基准 §18 把“NPC 身份 / 生卒、招募、同伴生命周期与跨书重逢”唯一归属改为 `design/18`；`design/12` 仅保留任务 DSL、任务实例和门派 / 阵营流程并引用 18 | 落实 AR-09 已声明的唯一归属，消除 12 与 18 双重定义 |

### 15.4 原著考据待办

| 范围 | 待办 | 当前不阻断的默认 |
|---|---|---|
| 全 14 部 | 逐条核定名录的情节定位与回目，基线为三联 / 广州修订版 | 保留“回目待考”，不得编回目号或引文 |
| 射雕 | 马钰、王处一、丘处机的小说时间与史实生卒冲突；拖雷、哲别精确生卒 | appearance 采用小说存在事实；史实字段保守标冲突 / 待考 |
| 神雕 / 倚天 | 张君宝至张三丰的年龄线、郭襄少林楔子年距 | 用同一 ID 和 02 定年，精确出生 / 寿数不写死 |
| 倚天 | 彭莹玉、常遇春、扩廓帖木儿历史年份口径；小说与史实身份差异 | 约年 / 双年份带（待考），小说 appearance 独立 |
| 碧血 / 鹿鼎 | 阿九 / 九难与长平公主历史原型、李自成小说存活、陈圆圆生卒争议 | 历史 / 小说 lifespan 分离；后作明确出场优先决定小说存活 |
| 白马 | 丁同、桑斯儿、云 / 全 / 宁强盗在指定修订版的准确称谓和行为；瓦耳拉齐 / 华辉用字 | 当前仅采用可检索情节定位，全部回目仍待考 |
| 鸳鸯 | 刘於义在修订版的“川陕总督”用字与任务时点 | 保留小说称谓；史实栏只写 1732 署陕西总督 |
| 飞狐 / 雪山 | 福康安生年两种馆方资料精度、胡苗田范相关人物与掌门大会身份 | 展示约 1754–1796（生年待考），并注明人物页只载 ?–1796 |

### 15.5 开放问题（附默认值）

| 编号 | 需作者拍板 | 本版默认值 / 理由 |
|---|---|---|
| N18-O01 | “永不可招募但可结盟”名单是否包含书内君主、统帅或掌门 | 默认不包含；所有书内人物至少给一个短时可控同行窗口。仅元叙事角色书灵、守卷人建议 `allianceOnly=true`，最贴合 AR-09“NPC 都可成为同伴” |
| N18-O02 | 原著命定死亡的同伴是否允许救回 | **已解决：AR-09c 采用“可”。** 默认按 01 / 13 改命规则；每书界首次成功 2 余韵，同事件多人一次收费 |
| N18-O03 | 生卒未知且沉睡跨度极大的普通 NPC 是否允许“奇遇长寿” | 默认不允许。只有原著明确在世、改命分支、或独立且有代价的原创长寿任务才可覆写，不能因曾入队自动长寿 |
| N18-O04 | 生成 NPC 是否需要可读的全局内容 ID | 默认不需要，使用 UUID；仅当调试 / 跨服务确有需求时采纳 `npcg_*`，并由基准统一登记 |
| N18-O05 | D1 / D2 是否允许永久买断 | 默认不允许“买人”；银两只购买有期限劳动 / 同行服务，长期同伴必须建立关系并取得本人同意 |

至此，旧“待决事项”未被删除：已由 AR-09 / AR-09c 解决者在表中保留追溯，未解决者均带默认值继续完成设计。

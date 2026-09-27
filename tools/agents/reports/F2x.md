# F2x 报告 · ID 检查脚本收口（07 套装目录、§19 弃用映射、操作 / 修饰键、迁移语境、route_ 豁免、严格口径）

## 1. 摘要（3–6 行）

在上次运行已完成的脚本与测试基础上收尾；未重写实现、未修改文档、未刷新基线。
检查器现从 07 §8–§18 读取 44 套 / 306 条正式成员关系，并从 §19 读取 119 条弃用映射。
任务 DSL 操作键、属性修饰键、迁移 / 别名 / 历史 / 否定语境均按结构识别，`route_*` 不再整族豁免。
严格模式现阻断冲突定义与套装不对称，近似名仅告警并由独立合法近名清单降噪。
49 项单元测试通过；依续作要求未重新运行全仓扫描，计数取上次保留的前后 JSON 快照。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `tools/lint/check_ids.py` | 2,400 | 六类规则实现、严格模式口径、JSON 输出 |
| `tools/lint/test_check_ids.py` | 1,323 | 正反例、真实 07 目录与 CLI 严格模式回归 |
| `tools/lint/check_ids_near_allowlist.json` | 21 | 4 对已审定合法近名 |
| `tools/lint/README.md` | 185 | 用法、五类问题、语境规则、白名单与严格模式 |
| `tools/agents/reports/F2x.md` | 142 | 本报告七节 |

## 3. 关键结论与数值

1. 真实 07 解析断言为 `44` 套、`306` 条成员关系；`set_shaolin_jingang` 正确读到 4 个成员，不再只读 §2.2 样例。
2. §19 共解析 `119` 个候选套装旧 ID；活动引用按废弃项报告，并携正式去向或“删除 / 延后”。
3. 合法近名清单含 `npc_sangjie/npc_sangsi`、`npc_meijian/npc_shijian`、`sk_xuansujian/sk_xuanxujian`、`vid_ch00_intro/vid_ch01_intro`。
4. `--strict` 失败数公式为：新增未定义 + 新增废弃 + 全部冲突定义 + 全部套装不对称；近似名不计入。
5. 基线仍保持原样，只收录未定义与废弃 ID；冲突、不对称、近似名均不会写入基线。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| F2x-O01 | 186 条套装不对称中多少是 `setTags` 非标准写法导致的残余解析误报 | 全部保留为严格错误，不扩豁免；由 F2 汇总逐条核对 |
| F2x-O02 | 4 对剩余近似名是否都是真拼写错误 | 仅告警；未经归属代理确认不得加入合法近名清单 |
| F2x-O03 | 本机 `python` 命令不可用 | 验证使用同一 Python 3.11 的 `python3.11`；CI 继续用可用的 Python 3 命令 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| F2x-P01 | Canon §12 明记：迁移源、别名、历史提案、非生产夹具与否定举例不构成活动引用 | 把本次工具语境规则固化为跨文档写作契约 |
| F2x-P02 | Canon §12 明记 `route_*` 仅用于地图路线，剧情路线状态统一用 `flag_*_route` | 防止内容 ID 与运行时状态键再次碰撞 |
| F2x-P03 | Canon §12 或 §18 引用 07 §19 为套装旧 ID 的弃用来源 | 当前中央 rulings 重命名表并未覆盖这 119 个候选套装 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/12-quests-npc-factions.md`、`docs/design/chapters/04-yitian.md` | `q_04_bond_97` 定义 | 统一“八臂旧名 / 八臂旧号”，消除 1 个冲突定义 |
| `docs/design/chapters/04-yitian.md`、`story/06-xiake.md` | 剧情状态 | `route_04/06` 改为 `flag_04/06_route` |
| `docs/design/chapters/08-luding.md`、`chapters/11-yuanyang.md`、`story/03-shendiao.md`、`story/10-baima.md` | 状态键 | 核定并改写 `route_zheng/xie/examiner/archive_sealed/locked_at`；不得借地图路线豁免 |
| `docs/design/05`、`10`、各技能图鉴、`chapters/02/07` | 活动套装引用 | 依据 07 §19 替换或删除 132 条引用（78 个唯一旧套装 ID） |
| 武学 / 装备 / 物品归属图鉴 | `setTags` | 对齐 07 的 44 套目录；当前 150 条缺反向 tag、36 条反向多余 |
| `docs/design/05` 与技能图鉴 | NPC / AOE / 任务引用 | 处理剩余 50 个未定义 ID；详见下节按文档分组 |
| `docs/design/11`、`15`、`18`、`12`、`canon-proposals-v1.2.md` | 迁移、别名、夹具、否定提案 | 后续保持可识别表头 / 小节标题与否定措辞，不把旧 ID 写成无标记活动正文 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 每条新规则的实现与理由

- ✅ **07 正式目录**：只匹配 §8–§18 三级标题的 `set_*`，向下读取“成员（N）”表行；明确排除 §2.2 样例和 §19。理由是正式目录才是发布集合。
- ✅ **§19 弃用映射**：按“原候选 / 未入选候选”与“去向”列动态解析；多目标完整展示，无目标稳定显示“删除 / 延后”。已废弃 ID 从未定义类去重。
- ✅ **操作 / 修饰键**：从 03 修饰三元组、12 `allowedEffects`、16 `kind` 判别联合与代码块判别字段识别，不维护逐 token 白名单；普通正文的未知 `set_*` 仍报告。
- ✅ **迁移语境**：标题 / 表头含迁移、旧 ID、别名、历史、不采纳等，或同行含禁止、只作迁移源等否定语义时不算活动引用；同一旧 ID 在普通正文仍报告。
- ✅ **`route_` 收窄**：删除 `route_数字/zheng/xie/...` 整族占位豁免；只有 design/19 或地图 YAML 按正常归属定义的地图路线有效。
- ✅ **严格口径**：冲突定义与套装不对称始终失败；基线仅抵扣未定义 / 废弃；近似名仅警告。
- ✅ **合法近名文件**：JSON schema v1、无序二元组；缺失或非法时警告且零放行，避免内嵌名单与代码耦合。

### 7.2 测试清单

- ✅ 指定模块共 `49/49` 通过：`python3.11 -m unittest tools/lint/test_check_ids.py`。
- ✅ 真实仓库断言：44 套、306 条成员关系、119 条 §19 弃用规则，以及金刚套 4 名成员。
- ✅ 临时仓库正反例：§2.2 / §19 不建套装定义，§19 合并 / 删除目标正确，废弃项不重复报未定义。
- ✅ 操作 / 修饰键：4 个已声明键不报错，未声明 `set_missing` 仍报错。
- ✅ 迁移语境：旧新表、CP-45 否定例、任务 fixture 不活跃；普通正文的同一旧 ID 仍报。
- ✅ 路线：已定义地图路线通过，`route_04` / `route_zheng` 报未定义。
- ✅ 严格模式：冲突 + 不对称产生 2 个失败；仅近似名时退出 0；baseline payload 排除 2 / 3 / 5 类。
- ✅ 白名单：只消除声明对，非法 JSON 条目产生 warning。
- ⚠️ 原命令 `python -m unittest tools/lint/test_check_ids.py` 因系统 `python` 触发 `xcode-select: Failed to locate 'python'` 未运行；用 `/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11` 执行同一模块通过。

### 7.3 改动前 / 后计数

续作要求不重跑大范围检查；下表直接读取上次保存的 `/private/tmp/F2x-before.json` 与
`/private/tmp/F2x-after-pass4.json`。两份均为 94 文件（90 Markdown + 4 YAML）的全仓快照。

| 类别 | 改动前 | 改动后 | 差值 / 解释 |
|---|---:|---:|---|
| 未定义 | 172 | 50 | −122；迁移 / 操作键误报清除，§19 旧套装转入废弃类 |
| 废弃 | 0 | 132 | +132；§19 的 119 条映射命中 132 个活动引用聚合项 |
| 冲突定义 | 1 | 1 | 不降噪；真实冲突保留并进入 strict |
| 套装不对称 | 4 | 186 | §2.2 单样例假象改为 44 套全量双向检查；150 正向缺 tag + 36 反向多余 |
| 近似名 | 4 | 4 | 合法对由白名单处理；剩余 4 对保持警告 |
| strict failure count | 133 | 277 | 新口径纳入 1 个冲突与 186 个不对称；非问题清零后暴露真实债务 |

“废弃 132”是活动问题条目数，不等于 §19 的 119 个映射规则数；同一旧 ID 可在多个
文档形成多个聚合项。改后扫描读取到 44 个 SetDef，说明不再使用单个 YAML 样例。

### 7.4 剩余问题按归属文档分组

未定义 50 项按发生文档归组（括号为唯一 ID 数）：

- `design/05`（6）：5 个少林 / 全真 NPC 与 `q_03_side_91`。
- `design/09`（1）：`rg_islands`。`design/10`（2）：`set_gumu`、`set_weijuye`。
- `skills-daojia`（3）：`aoe_sweep` 与 2 NPC；`skills-general`（1）：`sk_feishi`；`skills-gulong`（2）：`mer_du/ren`。
- `skills-kangxi`（1）：`q_08_shenlong_91`；`skills-yitian`（1）：`q_04_main_96`。
- `skills-shaolin`（6）：`aoe_cross/diamond/sq3` 与 3 NPC。
- `skills-wujue`（8）：`aoe_sq5` 与 7 NPC；`skills-xiake-bixue`（2）：`mer_chong/dai`。
- `skills-xiaoyao`（8）：聚贤庄、辽、西夏、密宗、无量 8 个 NPC。
- `chapters/04`（1）、`story/06`（1）：`route_04/06`；`chapters/08`（2）：`route_xie/zheng`。
- `chapters/11`（1）、`story/03`（1）、`story/10`（3）：`route_examiner`、`route_archive_sealed`、`route_locked_at`，以及 `npc_ningqiangdao`、`rg_xiyu`。

废弃 132 项分布：`design/09` 2、`design/10` 2、`skills-daojia` 4、`skills-general` 50、
`skills-gulong` 13、`skills-qianlong` 11、`skills-shaolin` 1、`skills-wujue` 8、
`skills-wuyue` 7、`skills-xiake-bixue` 5、`skills-xiaoyao` 6、`skills-yitian` 16、
`chapters/02` 3、`chapters/07` 4。应按诊断 replacement 替换，不应重新定义旧候选。

套装不对称 186 项全部归套装目录与武学 / 装备 / 物品图鉴的双向镜像：
`member_missing_setTag=150`，`set_missing_member=36`，涉及 35 个正式套装。优先核对
自创武学槽 `sk_zichuang01..03` 以及卡片中远离定义行的 `setTags`，再交归属图鉴修正。

冲突定义仅 1 项：`q_04_bond_97` 在 design/12 为“八臂旧名”，在 chapters/04 为
“八臂旧号”。近似名仅 4 对：`aoe_swap/aoe_sweep`、`npc_miaodi/npc_qiaozi`、
`npc_ningqiangdao/npc_songqiangdao`、`rg_qilu/rg_xiyu`。

### 7.5 仍可能是误报但未放行

- ⚠️ `mer_du/ren/chong/dai` 可能仍是短 ID 迁移源；它们出现在技能图鉴的活动语境，未因 token 本身豁免。应补清晰“短 ID 迁移”标题或改为正式长 ID。
- ⚠️ `npc_ningqiangdao` 可能是别名遗漏语境；story/10 的活动行仍被检出，因此没有让 18 的别名表吞掉跨文档活跃引用。
- ⚠️ `rg_xiyu` 可能是旧区域迁移输入；当前活动行不在可解释迁移标题下，继续报告。
- ⚠️ `route_archive_sealed/examiner/locked_at/xie/zheng` 很像运行时状态键；按新裁定不能以 `route_*` 族放行，应改名或建立真正地图路线定义。
- ⚠️ `set_gumu/set_weijuye` 可能是未登记旧候选；§19 无对应映射，故仍作为未定义而非擅自判废弃。
- ⚠️ 186 条套装不对称中可能仍有卡片布局解析遗漏；因其会破坏双向数据闭合，严格模式保守阻断，待 F2 汇总逐项核验。
- ⚠️ `npc_miaodi/npc_qiaozi` 的拼音距离提示语义关联很弱；当前不擅自加入合法近名清单，等待人物归属审定。

### 7.6 完整性与授权范围

- ✅ 只修改 / 创建 `tools/lint/**` 与本报告；未修改 Canon、decisions、任务清单或其他文档。
- ✅ 未执行 commit、checkout、reset、stash、rebase、merge 等改变仓库状态的 Git 命令。
- ✅ 未运行 `--update-baseline`，`check_ids_baseline.json` 未改。
- ✅ README 已同步正式套装、§19 弃用、操作 / 修饰键、迁移语境、`route_*`、严格模式与合法近名文件。
- ✅ 报告七节齐全；没有未完成占位语句。
- ✅ 所有补丁均低于 50 行，符合续作分次小补丁要求。

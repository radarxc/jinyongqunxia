# F2y 报告 · 跨组遗留的文档收口（旗标改名、重复定义、旧区域、套装引用、门禁文字、回响、提案追加）

## 1. 摘要（3–6 行）

- 已在授权范围内收口剧情旗标、重复任务定义、旧区域引用、NPC 岗位槽、套装引用、技术门禁、跨书回响及 03→04 书眠接口。
- `q_04_bond_97` 现唯一归 `chapters/04`，`design/12` 只引用；`npc_qiaozi` 已补正式人物卡，其余群体 / 岗位伪 NPC 改用局部槽。
- 套装消费统一到 07 的 44 套正式目录，装备侧 v1 唯一成员闭合为 `eq_yitianjian → set_yitian_emei`；另完整登记 39 源 × 3 卷 = 117 个 `frag_*`。
- 地图 30 区校验通过并解除当前 `TS-CONTENT-MAP-030`；最终 strict 仍因全仓 131 个基线外未定义 ID 退出 1，未刷新基线、未虚报通过。
- 已逐项比对指定 15 份后合入报告的 §5，并把新增候选追加到 `canon-proposals-v1.2.md` 的“v1.2 之后新增（待 v1.3）”。

## 2. 产出（文件、行数、主要章节）

以下行数为本轮最终校验前的当前工作树行数；共修改 30 份既有文档，并创建本报告。

| 文件 | 行数 | 主要改动位置 |
|---|---:|---|
| `docs/decisions/canon-proposals-v1.2.md` | 323 | §6“v1.2 之后新增”：15 份报告逐项比对、合并与处置 |
| `docs/design/06-buff-system.md` | 2,176 | §6.5：导出共享 `ModOp / ActionOp / Mod / Op / Trigger` |
| `docs/design/09-combat-system.md` | 3,192 | §6.8.3、§13.3：撤销三渡候选降人数；神龙岛区域与任务完成态收口 |
| `docs/design/10-items-and-equipment.md` | 2,208 | §5–§7、§10.3.1、附录：正式套装、装备反向成员、117 卷目录 |
| `docs/design/12-quests-npc-factions.md` | 1,869 | 原 §13.3 附近：删除 `q_04_bond_97` 重复定义并改为章节引用 |
| `docs/design/13-progression-and-endings.md` | 1,856 | §4.2.1、§10：登记并定义 `echo_07_fate` |
| `docs/design/14-ui-ux-mobile.md` | 1,327 | §2、§4、依赖表：只读取 07 正式注册表 |
| `docs/design/18-npc-and-companions.md` | 1,642 | §12–§14：NPC 总数更新为 421 / 396 / 25 / 13 / 434 |
| `docs/design/20-legacy-inheritance.md` | 1,657 | §7：删除旧 `set_yuenv_jianyuan` 活跃玩法引用 |
| `docs/design/catalog/npcs-ch02-shediao.md` | 87 | 射雕人物表新增 `npc_qiaozi`，合计 37 名 |
| `docs/design/chapters/01`–`07` | 1,763 / 1,423 / 1,668 / 1,485 / 1,520 / 1,614 / 1,735 | 正式套装引用；03→04 视频；倚天旗标与唯一任务定义；旧区域文字 |
| `docs/design/chapters/08`–`14` | 1,732 / 1,213 / 1,364 / 1,483 / 1,564 / 1,168 / 1,559 | 鹿鼎旗标、岗位槽、回响；各书正式套装并入 / 淘汰结论 |
| `docs/design/story/04-yitian.md` | 1,878 | 全文 / 表格 / YAML：`route_04 → flag_04_route` |
| `docs/design/story/06-xiake.md` | 1,844 | §5、§13：`route_06 → flag_06_route`；移除活跃旧粗区别名 |
| `docs/design/story/10-baima.md` | 1,544 | 文首区域表：移除活跃 `rg_xiyu` |
| `docs/tech/04-data-pipeline.md` | 1,716 | §3.7、§11、§16：30 区验收、解除地图门禁、strict / baseline 规则 |
| `docs/tech/06-asset-storage.md` | 2,347 | §3：无量弟子资产别名改为岗位槽路径 |
| `docs/tech/09-roadmap.md` | 1,055 | §3.5：strict 与 baseline 刷新门禁 |
| `tools/agents/reports/F2y.md` | 183 | §1–§7：结论、提案、同步项、处理总表和校验证据 |

## 3. 关键结论与数值

1. `route_` 保留给地图路线；剧情局部状态使用 `flag_04_route`、`flag_06_route` 与鹿鼎既有 `fl_08_route_zheng/xie`。选项键 `seal_route`、`false_route_delay` 未被误改。
2. 书界支线 / 羁绊任务内容唯一归章节：`q_04_bond_97` 统一名为“八臂旧号”，由 `chapters/04` §6.2 定义，`design/12` 只提供 DSL / manifest 契约并引用。
3. 神龙岛使用 `rg_donghai_islands`。地图闭集为 30 区；校验得到 189 城、99 门派、3 图外节点、24 驿站、28 码头、48 常规路线、3 专线、81 陆地多边形、14 河流组、11 山系组。
4. NPC 目录为 `421 = 396 + 25` 条静态索引，另有 13 个运行时槽，总计 `421 + 13 = 434`；`npc_qiaozi` 是具名人物，通用教头 / 游方道人 / 群体改用 `roleKey / facilityKey`。
5. v1 套装固定 44 套；装备成员只有 `eq_yitianjian`。`eq_chongyangdaopao`、`eq_qibaozhihuan` 明确不采用；`set_sandu` 不再降低阵法人数，二僧成圈只由阵法有效 10 重触发。
6. 117 卷目录满足 117 个唯一 `frag_*`、39 个来源、每源 `upper/middle/lower` 恰三卷；统一 `manual/partial`、`maxLayer=4`、`stack=1`、`price=null`、`[unique, legacyCarry]`。品阶按 `g≥10 ? g−3 : g−6` 推出，分布为 g2=9、g3=15、g7=39、g8=30、g9=24。
7. `echo_07_fate := (bx_anchor_4 == fate && npc_liyan.state == alive && npc_hongniangzi.state == alive)`；旧档缺字段为 `false`，只影响鹿鼎对白 / 图鉴，不授奖励、不改主线。
8. 03 与 04 两侧均显式引用 `vid_sleep_03_04`。地图检查通过后，`TS-CONTENT-MAP-030` 只保留为回归诊断。

## 4. 开放问题（附默认值）

| 开放问题 | 默认值 / 当前处理 |
|---|---|
| 全仓仍有 131 个基线外未定义 ID，是否刷新 baseline | **不刷新**；strict 保持失败，先由各 owner 清零，再从仓库根默认全量扫描刷新并记录前后债务数与清零计划 |
| 4 条 `set_shaolin_jingang` 不对称如何处理 | 采用 C2.R 专项审计的 0/0 结论，不删正式成员；由 F2x 修表式目录解析，修复前如实保留工具告警 |
| `legacy/completeSynthesis` 与事件载荷使用 `recipeId` 还是 `recipeKey` | 默认统一为 `recipeKey`，需 `design/12`、`design/20` 与技术消费者同批改并补迁移 / 重放夹具 |
| `LegacyCacheRuntimePhase` 最终值域与归属 | 默认归 `design/20`；暂沿用技术建议五值 `hidden/revealed/working/ready/opened`，在 owner 定稿前保持【建议值】 |
| 樵子的姓名、回目与部分招名 | 默认显示“一灯门下樵子”，精确姓名 / 回目继续标（待考），不据猜测新造人名或引文 |
| 鹿鼎其余描述性 `proposalKey` 是否升级为 `echo_*` | 默认禁用未登记投影；仅本轮已正式登记的 `echo_07_fate` 可读取 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 / 来源 | 提案 | 建议处理 / 理由 |
|---|---|---|
| SET-P01～03（C2 / C2.R） | §20 补套装中位数品阶、同 ID 去重、辅运及已装但暂不可施展武学计件 | 待 v1.3 建议采纳；是数据、客户端与 core 共用不变量 |
| F1b-P01 / F2L-P03 | 澄清 story 策划源编译为 `quest.v1` 后仍保留同一带路线码 ID | 待 v1.3 澄清；避免误解成另一套无路线码生产 ID |
| F2L-P04 / F2t-P02 | `dc_*` 全仓唯一策划节点与父任务局部运行态的边界 | 待 v1.3 建议采纳；兼容全局引用与不创建独立 `DecisionDef` |
| F2L-P02 / F2d2-P02 | 四个短经脉旧名纳入中央 `idRemaps` | 待 v1.3 配套；统一读旧写新，不改变经脉规则 |
| F2a-P01 | 五个旧 AOE 纳入中央 `idRemaps` | 待 v1.3 配套；防止四方向语义回流并使工具报告 deprecated |
| F1b-P02 | `npc_ningqiangdao → npc_songqiangdao` | 进中央迁移表、不扩 Canon 正文；属于单内容键读旧写新 |
| F2t-P03 | 传承缓存运行态枚举归 `design/20` | 待 v1.3 只补归属；具体五值留 owner，不在 Canon 复制 |

E3 / E3.R 的工时与阶段映射、F1b 的类型别名、D01.R / D05.R / D11.R / D13.R 的已吸收项，以及 F2a / F2b / F2d1 / F2d2 / F2t 的工具实现项，已分别标为“已覆盖”或“不升格”；没有重复提案。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 负责范围 | 位置 | 需同步内容 |
|---|---|---|
| `tools/lint/check_ids.py` / F2x | 套装解析、历史 / 否定语境 | 解析 07 §8–§18 表式正式目录并忽略 §19 淘汰表；当前只识别 1 个 YAML `SetDef`，产生 4 条假不对称；继续收窄迁移 / 否定语境 |
| `design/05`、`catalog/skills-*.md` / F2c | 学习来源、AOE、经脉、NPC 岗位 | 清理 `q_03_side_91`、`q_04_main_96`、`q_08_shenlong_91`、`npc_cien`、五个旧 AOE、四个短经脉及岗位伪 `npc_*`；不得为消警造定义 |
| `docs/design/12-quests-npc-factions.md` + `20-legacy-inheritance.md` | legacy opcode / event | `recipeId` 同批迁为 `recipeKey`，同步 tech 消费并补旧档 / 重放测试 |
| `docs/tech/05-gameplay-engine.md`、`design/20` | 缓存状态 | 由 20 定稿 `LegacyCacheRuntimePhase` 值域，tech 仅消费 |
| `docs/design/02`、后续 chapters | 回响注册表 | 鹿鼎其余候选回响经查重后再登记；未登记者保持禁用，不从描述性 `proposalKey` 猜造 ID |
| `docs/00-canon.md`、`rulings-v1.md` / 后续 v1.3 | §12、§18、§20、中央迁移表 | 评审 §5 七组提案；本任务只追加提案表，未改基准正文 |
| 全仓各唯一归属文档 | 131 个 strict 新债 | 按 owner 逐项定义、改名或标明非活跃语境；不得以限定路径或扩大 baseline 掩盖 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 跨组遗留逐项处理

| 编号 | 来源报告 § | 目标文档 § | 状态 / 改动位置 |
|---|---|---|---|
| Y-01 | F2d1 §7.4 SY-01～04 | `story/04` 全文；`chapters/04` §1、§5、§11、ID / 测试 | **已改：**`route_04 → flag_04_route`；正文、表格、YAML 同步，`seal_route` / `false_route_delay` 保留 |
| Y-02 | F2d1 §7.4 SY-04 | `story/06` §5、§13 | **已改：**`route_06 → flag_06_route`，并移除活跃旧粗区别名 |
| Y-03 | F2d2 §7.6、§7.7 | `story/08` 路线旗标；`chapters/08` §10 / 测试 | **已改：**`route_zheng/xie → fl_08_route_zheng/xie`；换轨仍同事务一置一清 |
| Y-04 | F2d1 §7.4 SY-10；F2L §7.3 | `chapters/04` §6.2；`design/12` 原 §13.3 附近 | **已改：**“八臂旧号”唯一归章节；12 删除重复任务行并改为明确引用 |
| Y-05 | F2b §7.4 SY-B11 | `design/map/*`、`design/11/19` | **此前已落实：**F2b 已原子迁移 19→30 区，本轮复跑地图闭集通过 |
| Y-06 | F2b §6、§7.5 | `design/09` §13.3；`story/06/10`；`chapters/06/12` | **已改：**神龙岛改 `rg_donghai_islands`；其他活跃旧粗区 ID 改正式 30 区 ID 或不点名 |
| Y-07 | F2b §7.5 岗位清单 | `catalog/npcs-ch02-shediao` 人物表；`design/18` §12–§14 | **已改：**`npc_qiaozi` 按具名人物补卡；计数改为 421 静态索引 / 396 唯一人物 / 25 复用 |
| Y-08 | F2b §6、§7.5 | `chapters/08` §9.3 / 附录；`chapters/09` §9 / 附录 | **已改：**白云观道长、武当游方授艺者改为 `roleKey / facilityKey`，不建静态 `npc_*` |
| Y-09 | F2b §7.5 | `tech/06` §3 | **已改：**无量弟子群体的资产别名改 `portrait/role-slot/*`，不把岗位写成 NPC ID |
| Y-10 | C2 / C2.R §6 | `design/06` §6.5 | **已改：**导出共享效果原语联合类型供 `SetTier` 复用 |
| Y-11 | C2 / C2.R §6 | `design/10` §5.3、§5.6、§7、附录 | **已改：**旧候选表按 07 的正式 / 并入 / 不采用状态收口；唯一装备成员闭合为 `eq_yitianjian` |
| Y-12 | C2 / C2.R §6 | `design/10` §5.6、附录 | **已改：**`eq_chongyangdaopao`、`eq_qibaozhihuan` 明确 v1 不采用，不建伪 `ItemDef` |
| Y-13 | C2 / C2.R §6；F2d1 §7 | `chapters/01/02/05/06/07` 套装段与待决项 | **已改：**只引用 07 正式目录；灵鹫、黄蓉、江南七怪、金蛇、古墓等旧候选按 §19 并入或关闭 |
| Y-14 | C2 / C2.R §6；F2d2 §7.6 | `chapters/08/10/11/12/13/14` 套装段与待决项 | **已改：**韦爵爷、高昌 / 哈萨克、胡苗等候选映射为正式套装或关闭；缺注册表时失败关闭 |
| Y-15 | C2 / C2.R §6 | `design/09` §6.8.3；`design/20` §7 | **已改：**删除 `set_sandu` 降人数条件与 `set_yuenv_jianyuan` 活跃玩法引用 |
| Y-16 | C2 / C2.R §6 | `design/14` §2 / §4 / 依赖表 | **已改：**UI 只展示 07 正式注册表的有效结果，不从旧候选猜效果 |
| Y-17 | C2 §1–§4；C2.R §7 | `design/07`、`catalog/skills-*` | **此前已落实：**C2 已定稿 44 套、306 关系及技能侧双向闭合；本任务未改 07 / 武学图鉴 |
| Y-18 | C2.R §6 / §7 | `tools/lint/check_ids.py` | **遗留：**工具只解析 1 个 YAML `SetDef`，把少林金刚 4 个成员误报不对称；交 F2x |
| Y-19 | F2d2 §6 | `design/09` §13.3 | **已改：**`q_08_side_91_done/92_done` 改为正式 `q_08_faction_02/03.completed` 条件 |
| Y-20 | F2b §7.4 SY-B02 / §6 | `design/12` §2.6 / 测试 | **此前已落实：**鹿鼎主线采用路线码正式 ID，不恢复 `q_08_main_01..18` 第二套流水号 |
| Y-21 | F2b §6；F2t §7.5 | `tech/04` §3.7、§11、§16 | **已改：**复核地图 v2 后解除当前 `TS-CONTENT-MAP-030`，保留回归诊断 |
| Y-22 | F2t §7.4 S03 | `tech/04` §11；`tech/09` §3.5 | **已改：**strict 四类边界、近似名 warning、全量 baseline 刷新与变更记录要求写清 |
| Y-23 | F2d1 §7.4 SY-07 / SY-22 | `story/07` A07-4 | **此前已落实：**本地改命锚点及李岩、红娘子生命事实已由上游写出 |
| Y-24 | F2d1 §7.4 SY-22；F2d2 §7.6 | `design/13` §4.2.1 / §10；`chapters/08` §11.1 | **已改：**登记并消费 `echo_07_fate`；仅改对白 / 图鉴，不改鹿鼎锚点或奖励 |
| Y-25 | F2d1 §7.4 SY-06 | `chapters/03` §11；`chapters/04` §11 | **已改：**03 写出与 04 消费两侧均显式引用 `vid_sleep_03_04` |
| Y-26 | F2a §6、§7.4 SY-A15 | `design/10` §10.3.1 | **已改：**补齐 117 个 `frag_*` 最小物品定义并通过 39×3 闭集检查 |
| Y-27 | F2a §7.4 SY-A14；F2b §7.5 | `design/10` 的 39 个 `it_xinwu_*` | **此前已落实：**信物 ItemDef 已由 F2a 登记，本轮保持与 20 的用途引用分工 |
| Y-28 | F2a §7.4 SY-A08 / A09；F2d1 §7.4 SY-20 | `design/09` Boss / 合击 / 资源槽目录 | **此前已落实：**27 个 `bsc_*`、4 个碧血 `cmb_*` 与 `gauge_fengsuo` 已由 F2a 闭合 |
| Y-29 | F2a §7、F2b §7、F2d1 §7、F2d2 §7、F2t §7 | `catalog/skills-*`、`design/05` 等 F2c 写集 | **遗留：**旧 AOE / 短经脉 / 任务来源 / `npc_cien` / 岗位伪 NPC 由 F2c 收口，本任务不越权改武学图鉴 |
| Y-30 | F2t §7.5 | `design/12` §2.3；`design/20` §10.3 / §11 | **遗留：**`recipeId` 与 `recipeKey` 漂移需联合迁移，非本轮小改 |
| Y-31 | F2t §5 / §7.5 | `design/20` 运行态；`tech/05` §10 | **遗留：**缓存 phase 归属和值域待 20 定稿；本轮只追加 v1.3 归属提案 |
| Y-32 | 指定 15 份报告 §5 | `canon-proposals-v1.2.md` §6 | **已改：**逐项比对；新项追加“v1.2 之后新增”，已覆盖 / 不升格项保留对应说明 |

状态合计：**已改 22 项、此前已落实 6 项、遗留 4 项，共 32 项**。

### 7.2 ID 检查：处理前 / 后

命令均为仓库根默认全量扫描；本机无 `python` shim，实际运行 `python3 tools/lint/check_ids.py --json`。未刷新 `tools/lint/check_ids_baseline.json`。

| 指标 | 处理前 | 处理后 | 本任务相关解释 |
|---|---:|---:|---|
| 未定义引用（唯一 ID） | 172 | 169 | 净减 3；候选套装虽已从消费者移除，07 §19 历史 / 淘汰表仍被当前 checker 计为引用 |
| 冲突定义 | 1 | 0 | `q_04_bond_97` 从双定义收为章节唯一 owner |
| 近似名 | 4 | 3 | 只处理有确定映射者；未按编辑距离误合并专名 |
| deprecated | 0 | 0 | 中央迁移表尚未吸收旧 AOE / 经脉等提案 |
| 套装成员不对称 | 4 | 4 | 四条均为 `set_shaolin_jingang` 表式目录解析假阳性；C2 专项边界审计为 0 / 0 |
| strict 失败数 | 133 | 131 | 最终 `--strict` 退出 1；131 个均为 baseline 外未定义 ID，不能宣称门禁通过 |

最终扫描覆盖 94 文件（90 Markdown + 4 data）、47,068 次出现、10,826 个定义；冲突定义与 deprecated 均为 0。专项残留为：目标剧情旧旗标 0、活跃正文旧粗区 ID 0、受影响消费者中的六个点名淘汰套装 0。

### 7.3 遗留清单（按严重度）

#### 高：当前全仓门禁不通过

1. `python3 tools/lint/check_ids.py --strict` 最终退出 1：169 个未定义引用中有 131 个不在既有 baseline。主要来源是 07 §19 的淘汰 / 并入历史 ID、F2c 写集中的旧 AOE / 短经脉 / 任务与岗位引用，以及少量否定或迁移语境。必须按 owner 和语境逐项处置，当前不能刷新 baseline。
2. checker 同时报 4 条 `set_shaolin_jingang` 成员不对称：`sk_longzhaoshou`、`sk_tieshazhang`、`sk_tongrenhenglian`、`sk_yijinjing`。C2.R 已确认这是未解析 07 表式正式目录的假阳性；不能删除正确 `setTags`，应由 F2x 修解析器并回归。

#### 中：需跨 owner 联合修改

3. F2c 权限内仍需处理 `q_03_side_91`、`q_04_main_96`、`q_08_shenlong_91`、`npc_cien`、五个旧 AOE、四个短经脉，以及武学图鉴中的岗位 / 群体伪 `npc_*`；本任务不碰 `design/04/05/07` 与 `catalog/skills-*`。
4. `design/12` 的 `legacy/completeSynthesis.recipeId` 与 `design/20` 的 `legacy/synthesisStarted.recipeId` 仍和正式 `recipeKey` 漂移；需连同 tech 消费、旧档迁移及事件重放夹具同批修改，局部改一处会造成协议断裂。

#### 低：归属文字与实测

5. `LegacyCacheRuntimePhase` 五值目前只在 `tech/05` 标为【建议值】；待 `design/20` 定稿 owner 后再消除建议标记。
6. 既有原著考据、真机 / 真账号 / 真实素材与跨引擎录像仍保持（待考）/（待实测）/（待核实）；本轮没有把未验证事实改写为已确认。

### 7.4 验收标准逐条自检

| 验收项 | 结果 | 说明 |
|---|---|---|
| 事实优先级与唯一归属 | ✅ | 按作者决定 / 需求、Canon v1.2、rulings、§18 顺序执行；跨 owner 只引用或列 §6 |
| 写入范围 | ✅ | 最终工作树仅有 30 份授权既有文档与本报告；未改 Canon、TODO、04 / 05 / 07、武学图鉴、`tools/lint/*` |
| 剧情旗标改名 | ✅ | 目标文件中 `route_04`、`route_06`、`route_zheng`、`route_xie` 残留 0；`seal_route`、`false_route_delay` 仍存在 |
| 重复任务定义 | ✅ | checker 冲突定义由 1 降为 0；`q_04_bond_97` 只有章节内容定义，名称统一“八臂旧号” |
| 旧区域 ID | ✅ | 活跃正文残留 0；旧名只在 `design/11` 权威迁移表及 chapters/10 的负向测试 / 搜索命令出现 |
| NPC 与岗位槽 | ✅ | 补 `npc_qiaozi`；本任务可改的白云观、武当游方、无量弟子引用均改为岗位 / 设施槽 |
| 套装与装备闭合 | ✅ / ⚠️ | 消费方只用 44 套正式目录，装备 v1 成员闭合；4 条通用 checker 假阳性待 F2x，未虚报全仓工具通过 |
| 技术门禁 | ✅ | 地图闭集通过并解除当前 MAP-030；strict / baseline / warning 文案在 tech/04 与 tech/09 一致 |
| 跨书回响与书眠 | ✅ | 鹿鼎消费 `echo_07_fate`；03 / 04 两侧引用 `vid_sleep_03_04`，均不改后书主线起点 |
| 117 卷残本 | ✅ | 117 行、117 唯一 ID、39 来源、每源三卷；品阶、唯一性与生命周期字段完整 |
| v1.3 提案追加 | ✅ | 指定 15 份报告 §5 全部比对；新增项追加、重复项合并、已覆盖与不升格项注明依据 |
| 数值可推导 | ✅ | 30 区规模、NPC `421=396+25` / `421+13=434`、残本 `39×3=117` 及品阶公式均可复核 |
| 原著与标注 | ✅ | 樵子精确姓名 / 回目等保持（待考）；新增三卷名称标（原创扩展命名），未编造引文或回目号 |
| 旧待决追溯 | ✅ | 已解决项保留原问题并写“已解决”；未解决项未删除，默认值见 §4 |
| 格式与完整性 | ✅ | `git diff --check` 通过；改动 Markdown 围栏成对；未新增 `TODO`、`此处省略`、`待补充` 占位 |
| 变更规模 | ✅ | 最大缩短为 `chapters/07` 的约 0.29%，无文档缩短超过 15%；均为局部收口，无整节重写 |
| 地图回归 | ✅ | `python3 tools/map/render_map.py --check` 通过，规模与 §3 一致 |
| lint 单测 | ✅ | `python3 -m unittest -v tools.lint.test_check_ids`：35 / 35 通过 |
| 全仓 strict | ⚠️ | `--strict` 退出 1，131 个 baseline 外未定义 ID；如实列为高严重度遗留，未刷新 baseline |




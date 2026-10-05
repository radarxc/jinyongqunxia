# NXfix-shaolin 报告 · 终审·收尾（门派图鉴）· 少林

## 1. 摘要（3–6 行）

- 已完成少林册经脉落地终审：52 记绝招的索引、正文与镜像重新对齐，动作末端缺失 / 位置命中由 `13 / 2` 清至 `0 / 0`。
- 按作者音功新口径，将狮子吼五记、金刚怒吼两记伤害音功逐招标为外放；少林册外放总数由 23 增至 30，并保留音功 0 档普通结算边界。
- 已按实际伤害效果纠正 17 条索引 `purpose`，修正 23 条显式绝招路线，且 52 条绝招路线全仓无完全重复或 ≥80% 高相似。
- 14 本补录册均已核对：少林仅涉及倚天册两项既有来源复用，原卡早已包含倚天，不需要新增 `sourceChapters`；铁掌等来源扩展不属本册。
- 指定 ID、单测、三项模拟、图鉴严格 / 多样性、路线唯一性、未定义引用与差异格式检查均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-shaolin.md` | 1646 | v1.3；§0 绝招路线索引；§1.5.3 狮子吼；§1.7.3 金刚怒吼；§5.1 外放审计；§5.7 经脉路线及镜像；§7 校验；§8 依赖与开放问题 |
| `tools/agents/reports/NXfix-shaolin.md` | 144 | 本报告；来源扩展、外放改标、遗留处置、末端诊断与交接清单 |

## 3. 关键结论与数值

1. **外放统计**：`23+7=30`；按大阶为天 / 地 / 玄 / 黄 `5/22/3/0`，按品级为天下 5、地下 9、地中 3、地上 10、玄上 2、玄下 1。新增七记均为伤害音功；纯支援“当头棒喝”仍非外放。
2. **音功三档边界**：静态卡使用 `projection:true` 与 `DamageKind:'projected'`；0 档保持卡内基础范围、普通 Z5M、零外放增耗，只有 1／2 档启用外放曲线与范围扩张。全场“狮子吼”无更大合法几何，三档同形。
3. **路线收口**：52 条绝招路线、52 个不同有序序列，完全相同 0 对、跨册完全相同 0 对、≥80% 相似 0 对。修改 23 条显式绝招步骤；所有动作关键穴落在末 1–3 段，外放路线命中合法端点。
4. **普通音功路线**：新增展开 4 条既有招式对应路线。狮吼震、慑魂、破阵吼各为 8 段、`8×70=560 CT`；金刚怒吼“怒吼”为 6 段、`6×70=420 CT`、风险 `80+100+120+140+160+180=780`。
5. **镜像数值**：天阶 10 段路线为 750 / 800 CT，地阶 8 段为 600 / 720 CT，玄上九条 6 段路线为 600 CT、风险 900，罗汉阵 8 段为 600 CT、风险 1080；均满足 `recovery+ΣsegmentCt≤2000`。
6. **预算复算**：狮吼震 `0.75×1.34×0.85×0.85−0.05−0.03=0.6461≈0.65`；破阵吼 `0.70×1.41×0.85×0.85−0.10=0.6131`，显示 0.60；聚音成线 `3.00×0.85×0.85−0.10=2.0675`，显示 2.05；偏差均在允许的 `±0.05`。
7. **护体内劲与穴位**：`innerGuard.reflectBp` 统一明确为 0，实际抵消由运行时层数投影结算；本册所有 `ap_*` 均可在 `design/15` 解析，未登记穴位 0。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本次默认值 |
|---|---|---|
| NXSL-O01 | 人声音功路线能否只以天突 / 廉泉满足外放端点 | 仍同时保留喉部端点和现行 lint 的手部白名单端点；即使构建器日后支持二选一，也不主动删去既定手部导引 |
| NXSL-O02 | 七个远程 / 贯穿候选是否确为离体真气 | 保持“待考”且不赋 `projection:true`；待按三联 / 广州修订版核实后再逐招处理 |
| NXSL-O03 | AR-16 范围硬顶、额外耗内和 Z5M 曲线 | 沿 `design/21` 默认：0 / 1 / 2 档为 `+0/+2/+4` 格、作用范围 `+0/+1/+2` 档、额外耗内 `0/2%/4% MPREF`，总威力硬界 6500–22000 bp |
| NXSL-O04 | 实际书界学习池的互斥来源与前置可达性 | 目录层按 `ALL14` 底座继续通过；章节任务实际落地前不宣称全书界可达性已闭合 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 / 状态 |
|---|---|---|
| NXSL-P01 | Canon §12 / §18 正式登记 `mfr_*`、`txp_*` 及 `design/21` 的战斗经脉唯一归属 | 沿用本册 BP-6 与 21 的既有提案；当前图鉴已实际引用两类 ID，但 Canon 命名表仍应形成正式闭包 |
| NXSL-P02 | 七十二绝技“戾气”列入 `design/05` 走火触发源 | 沿用本册 BP-4；属于组合装配规则，应由 05 定义，避免图鉴独占运行规则 |
| NXSL-P03 | 铁布衫、金钟罩、一苇渡江以原创纳入方式计入 `lg_shaolin72` | 沿用本册 BP-5；影响同源加速与戾气计数，需在基准正式收录前继续标“原创扩展” |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/04-damage-formula.md`、`docs/design/05-martial-arts-system.md`、`docs/tech/04-data-pipeline.md`、`docs/tech/05-gameplay-engine.md` | 外放运行时 / 构建接口 | 接入七记音功的 0 档兼容分支：普通 Z5M、基础范围、零外放增耗；1／2 档才应用外放曲线 |
| `docs/design/05-martial-arts-system.md`、`docs/design/09-combat-system.md` | 少林建议接口 | 承接少林伤科 `med=30`、七重配方 `alchemy=40`、罗汉阵 `formation=30`、金刚伏魔圈 `formation=50`，并校准最终值 |
| `docs/design/05-martial-arts-system.md`、F2、`docs/design/chapters/*` | 十四书界可习得池 | 依少林册 §5.6 重算路线唯一 ID 并验证非互斥来源和前置闭包；为四门 AR-01 新武学落实章节授艺来源 |
| `docs/design/06-buff-system.md` | `bf_zhaomen`、`bf_fanzhen` 等 | 确认罩门参数与反震钩子；实现须继续避免与 `innerGuard.reflectBp:0` 重复结算 |
| `docs/design/07-set-system.md` | 少林套装 | 采纳 / 校准本册 11 个套装候选，并保持 `SetDef.members ↔ SkillDef.setTags` 双向一致 |
| `docs/design/10-items-and-equipment.md` | 物品 / 装备 | 建立本册 §6 的秘籍、残页、袈裟奇门、“塞耳”实体并挂接大还丹配方 |
| `docs/design/12-quests-npc-factions.md`、`docs/design/16-resources-and-estates.md` | 门派与资源 | 承接贡献、还俗后果、制服后的劝降 / 盘问、跨门好感与月钱资源档位 |
| `docs/design/chapters/01-tianlong.md`、`02-shediao.md`、`03-shendiao.md`、`04-yitian.md`、`05-xiaoao.md`、`06-xiake.md`、`08-luding.md`、`12-shujian.md` | 事件与学习来源 | 替换占位 NPC / 任务并落实射雕易筋经、铜人巷、金刚伏魔圈、少林三战、清凉寺等事件 |
| `docs/design/catalog/skills-yitian.md` | 谢逊来源 | 继续用同一 `sk_shizihou`，且仅谢逊来源计 `set_mingjiao_sida_fawang` |
| `docs/design/catalog/skills-xiaoyao.md`、西域 / 吐蕃归属图鉴 | 小无相与燃木刀协同 | 保持小无相功观摩上限 8，校验四门少林绝技双向标签，并补 `sk_huoyandao × sk_ranmudaofa` 反向登记 |
| 其他 NXfix 册 | 来源扩展 | `sk_tiezhang→ch03_shendiao` 由五绝册处理；`sk_baizhanxinfa→ch12/ch14`、`sk_pojunqiangfa→ch14` 由通行册处理，本册不越权写入 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单

| 补录册 | 与少林册有关的条目 | 本次处理 |
|---|---|---|
| `skills-bulu-01-tianlong` | 无 | ✅ 三门均为补录册新卡，无旧卡来源扩展 |
| `skills-bulu-02-shediao` | `sk_tiezhang→ch03_shendiao` | ✅ 归 `skills-wujue.md`，本册跳过；神雕池已达 18，应由五绝册优先按“神雕残承”处理 |
| `skills-bulu-03-shendiao` | 无 | ✅ `sk_jiuyin`、`sk_pojunqiangfa` 已含神雕，不需回写少林册 |
| `skills-bulu-04-yitian` | `sk_jingangbuhuai`、`sk_huanyinzhi` | ✅ 两卡原生书界已含 `ch04_yitian`，直接复用，无新增来源 |
| `skills-bulu-05-xiaoao` | 无 | ✅ 新卡自带笑傲来源，复用项也已覆盖 |
| `skills-bulu-06-xiake` | 无 | ✅ 新卡自带侠客来源，复用项也已覆盖 |
| `skills-bulu-07-bixue` | 无 | ✅ 新卡自带碧血来源，复用项也已覆盖 |
| `skills-bulu-08-luding` | 无 | ✅ `sk_dashouyin` 已在逍遥册含鹿鼎来源，不需回写少林册 |
| `skills-bulu-09-liancheng` | 无 | ✅ 无旧卡来源扩展 |
| `skills-bulu-10-baima` | 无 | ✅ 四门均为补录册新卡，无旧卡来源扩展 |
| `skills-bulu-11-yuanyang` | 无 | ✅ `sk_taiyueshibeishou` 已含鸳鸯来源；装备兼容属康熙册任务 |
| `skills-bulu-12-shujian` | `sk_baizhanxinfa→ch12_shujian` | ✅ 归 `skills-general.md`，本册跳过 |
| `skills-bulu-13-feihu` | 无 | ✅ 复用项已含飞狐来源，新卡自带来源 |
| `skills-bulu-14-xueshan` | `sk_baizhanxinfa`、`sk_pojunqiangfa→ch14_xueshan` | ✅ 均归 `skills-general.md`，本册跳过 |

结论：14 册中没有需要修改 `skills-shaolin.md` 的新增来源，因此不添加空泛的“本门补录武学见……”索引行。

### 7.2 改标外放清单

| 武学 | 改标招式 | 数量 | 处理 |
|---|---|---:|---|
| 狮子吼 `sk_shizihou` | `mv_shizihou_zhenhou`、`mv_shizihou_shehun`、`mv_shizihou_pozhen`、`mv_shizihou_juyin`、`mv_shizihou_shizihou` | 5 | ✅ 补 `projection:true`、基础 `range/aoe`、三档 spread、`DamageKind:'projected'` 与合法路线；“当头棒喝”保持非外放 |
| 金刚怒吼 `sk_jingangnuhou` | `mv_jingangnuhou_nuhou`、`mv_jingangnuhou_zhenshe` | 2 | ✅ 从紧凑卡展开正式合同并补同套外放字段；普通“怒吼”新增显式路线，绝招“震慑”同步索引 |

### 7.3 遗留处理表

| 遗留项 | 本册处理 |
|---|---|
| 文首索引与正文 `purpose` 不一致 | ✅ 以正文效果为准修正 17 条：倒拽九牛尾、撼山、聚音成线、狮子吼、般若波罗蜜、芥子须弥、压顶、接引、万佛、影踪、捣虚、龙爪三十六路、剑行、袈裟伏魔、伏魔、虎鹤双形、无相；索引和镜像只留同一值 |
| 过期镜像的模板代号、CT 与风险 | ✅ 同门第二 / 第三绝招镜像补完整风险列；玄上十路改为“见文首索引”，九路总风险 900、罗汉阵 1080，并重算 CT / 收招合计 |
| 动作末端缺失 / 位置错误 | ✅ 修正 23 条显式绝招步骤；掌收劳宫、指收指端、腿收足三阳、兵器收腕部导引，攻击内功经过任 / 督，外放经过合法端点 |
| 阳性 / 内功路线 | ✅ 少林九阳周天改经督脉至阳；少林册不含任务所列焚天、北冥、小无相、化功、龙象、乾坤攻击绝招，相关项跳过 |
| `innerGuard.reflectBp` | ✅ 明确固定为 0，既有反震 Buff 不重复结算，运行值由实际 `MeridianProfile` 层数投影得出 |
| 条件加成加法 / 乘法混用 | ✅ 精确复核未发现本册存在任务所指 `3.00+0.15−0.05` / `3.00×(1+0.15)` 混用；三处陈旧预算抽查已按正文重算 |
| 非法穴位 ID | ✅ 本册所有 `ap_*` 对照 15 均已登记，含玄上路线；无需替换 |
| 绝招段数 | ✅ 本册不含“碧涛玄功·万里”“易筋锻骨篇·脱胎”，无需调整；全册绝招均满足品阶建议段数及 2000 CT 上限 |
| 跨武学路线高度相同 | ✅ 52 条路线完全相同 0、≥80% 相似 0；未以轮换 / 逆序制造伪差异 |
| 其他册专项 | ✅ 降龙、康熙装备桥、康熙 / 乾隆 / 古龙 purpose、通行 / 倚天 / 乾隆穴位均不在本册，未越权修改 |

### 7.4 末端规则命中数（改前 / 改后）

| 状态 | 路线 | 已分类 | 规则检查 | 缺失违规 | 位置违规 | 未分类 |
|---|---:|---:|---:|---:|---:|---:|
| 修改前 | 52 | 36 | 34 | 13 | 2 | 16 |
| 修改后 | 52 | 36 | 39 | 0 | 0 | 16 |

未分类 16 条为工具无法可靠判定动作类别的路线，按要求不强行补类型；规则检查数由 34 增至 39，源于七记音功改标后外放规则与动作规则的叠加。

### 7.5 指定门禁

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；严格失败 0；仅提示仓库既有基线 `docs/README.md` 的 `sk_babuganchan` 未定义 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 126 / 126 通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-shaolin.md` | ✅ `errors=0`；52 路线、52 序列、重复 / 高相似 / 跨册重复均为 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-shaolin.md` | ✅ 缺失 0、位置 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-shaolin.md` | ✅ 与全仓其他武学完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-shaolin.md` | ✅ 未定义引用 0 |
| `git diff --check` | ✅ 通过 |

### 7.6 交其他任务

- ⚠️ **五绝册**：落实 `sk_tiezhang→ch03_shendiao`；因神雕完整原生天阶池已达 18，应优先登记“神雕残承”，不得再计完整天阶池。
- ⚠️ **通行册**：落实 `sk_baizhanxinfa→ch12_shujian/ch14_xueshan`、`sk_pojunqiangfa→ch14_xueshan`，并修正 `mfr_tuinaliaofa_tuigong` 的正式百会 ID。
- ⚠️ **五绝册 / 05 / 21**：按已定口径闭合降龙十八掌三记绝招的外放字段、统计与路线；少林册未改跨册定义。
- ⚠️ **其余门派册**：继续处理各自音功、大手印、purpose、路线末端和过期镜像；本任务只清零少林册。
- ⚠️ **运行时与构建器**：落实七记少林音功 0 档普通结算 / 1–2 档外放加持，并保持人声音功喉部端点例外与手部白名单的兼容。

### 7.7 范围、格式与完整性

- ✅ 只修改授权的少林图鉴与本报告；未执行 commit、push、checkout、reset、stash、rebase 或 merge。
- ✅ 保留既有待决事项并将已解决项改写为可追溯状态；未越权改 Canon、TODO、21 或其他图鉴。
- ✅ 长补丁均控制在约 150 行内；终检确认目录与正文一致、表格和代码围栏闭合、无截断句。
- ✅ 未新增无依据的武学 / 招式 ID；四条普通音功 `mfr_*` 均由既有正式 `mv_*` 一一派生。
- ⚠️ 尚余原著考据 K-01～K-12、实际书界可达性与作者默认值，均已保留在正文 §8，不冒充已核定事实。

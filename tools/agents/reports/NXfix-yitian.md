# NXfix-yitian 报告 · 终审·收尾（门派图鉴）· 倚天

## 1. 摘要（3–6 行）

已完成 `skills-yitian.md` 的 AR-14 / AR-15 / AR-16 经脉落地终审，并追加 2026-09-29 版本记录。
14 本补录图鉴及 NXB01–NXB14 报告均已复核：没有唯一归属在倚天册的来源扩展项；已补 `skills-bulu-04-yitian.md` 入口。
本册末端规则由改前 12 条缺失、2 条位置问题收敛为 0 / 0；42 条绝招路线互不重复，也没有 ≥80% 高重合提示。
九阳反震改为层数投影、圣火气海改用正式穴位 ID，8 记绝招统一乘法口径，42 行过期镜像按显式路线重算。
全部指定门禁通过；ID 检查仅保留仓库基线已知的 `docs/README.md:sk_babuganchan`，本任务新增严格失败为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-yitian.md` | 1811 | 文首绝招路线索引、武学卡、AR-16 审计、§10 经脉系统落地、§12 校验规则、§13 待决事项 |
| `tools/agents/reports/NXfix-yitian.md` | 146 | 本报告：来源扩展、外放、遗留、末端命中、跨任务交接与门禁证据 |

正文相对任务起点为 127 行新增、107 行删除，未缩短原文；没有修改写集外文件。

## 3. 关键结论与数值

1. **来源扩展**：倚天册回填 0 条；14 册实际待回填的 4 个“武学 × 书界”组合均归五绝册或通行册，本任务按写集跳过。`sk_tiezhang` 不在本册，未把神雕完整天阶池扩到 19。
2. **外放**：新改标 0 条。本册没有音功或“大手印”；`sk_dajiutianshou` 是“大九天手”，不套用大手印裁定。既有 4 条外放仍为 `mv_xuanming_gusui`、`mv_shenghuoling_yinfengdao`、`mv_dajiutianshou_lieyang`、`mv_dajiutianshou_guanri`。
3. **路线门禁**：改前 `routes=42, classified=27, checked_rules=23, violations=12, tail_violations=2, unclassified=15`；改后为 `42 / 27 / 22 / 0 / 0 / 15`。用途修正后少做一次内功攻击规则检查，故 `checked_rules` 从 23 降为 22。
4. **路线镜像**：天／地阶 26 记、玄上 16 记，共 42 记绝招都以文首索引为步骤唯一来源；镜像重算段数、路线 CT、风险数组／总风险和收招合计，并给玄上 16 行补齐 `ultimate:true`。路线 CT 为 510–800，均满足 `1200 + routeCt ≤ 2000`。
5. **九阳反震**：`innerGuard.reflectBp:1200 → 0`；`ps_jiuyang_taheng` 按当前有效层数把近战反震由 5% 线性投影至 12%，再按内劲结算，避免双算。
6. **穴位与用途**：圣火心法 `ap_qihai → ap_renmai_qihai`；换形、掠影的 `purpose` 校正为 `movement` 后，路线分别收束为冲脉／带脉转身接阳跷，以及阴性蓄势接足少阳、阳跷并以涌泉直进；真武阳和与金顶调息分别补 `ap_renmai_qihai`、`ap_renmai_guanyuan`。
7. **低段例外**：保留九阳护体 8 段与刚柔逆转 6 段；前者用自身护体＋驱寒换取相对天阶 10 段最短路线 150 CT 先手，后者用招架后反击换取相对地阶 8 段最短路线 180 CT 先手，绑定表与镜像均已登记。
8. **绝招倍率**：统一为 `3.00 × AF × (1 + Σadj) × Kd × Kp − 成本`。调整结果：烈阳贯掌 `2.15→2.45`、正奇互生 `2.65→2.90`、阴阳吞吐 `2.40→2.70`、七劲齐发 `2.80→3.05`、刚柔逆转 `3.00→3.30`、灭绝双锋 `2.75→3.45`、正势一剑 `3.15→3.45`、第三拳 `3.10→3.40`；正文 O-12 登记为待作者确认。

## 4. 开放问题（附默认值）

本轮新增 O-12；其余保留并继续执行正文既有未决项：

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| O-2 | 灭剑与绝剑是否拆成两门 | 不拆，保留 `sk_miejuejian` 双姿态；若拆须等量合并或删除另一门玄阶 |
| O-3 | 汝阳王府是否可正式拜入 | 走宿卫／客卿五级映射，不等同加入蒙古官署 |
| O-4 | 小帮会地阶是否允许满 10 重 | 门派 L4 / L5 可满 10 重，缴获残谱旁路封 8 重 |
| O-7 | 新增 38 门玄黄如何兼容旧倚天可习得池 | 默认由 C3 重分配旧复现／通行投放，保留本册 88 门定义 |
| O-11 | 六个范围／远程掌劲候选是否确为离体真气 | 无逐字证据前保持**（待考）**且不标 `projection:true` |
| O-12 | 绝招条件加成最终采用加法还是乘法 | 默认按 `design/05` §4.2 字面采用乘法；8 记变化为烈阳贯掌 `2.15→2.45`、正奇互生 `2.65→2.90`、阴阳吞吐 `2.40→2.70`（含七伤等效自损 `adj +0.12`）、七劲齐发 `2.80→3.05`、刚柔逆转 `3.00→3.30`、灭绝双锋 `2.75→3.45`、正势一剑 `3.15→3.45`、第三拳 `3.10→3.40`；待作者统一确认 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

本轮无新增提案；正文仍有两项有效旧提案：

| 编号 | 提案 | 理由 |
|---|---|---|
| P-2 | 由 C3 重算倚天全部可习得池比例，不在旧 `12/27/40/41=120` 上直接叠加 38 门玄黄 | 直接叠加为 `12/27/59/60=158`，占比 `7.59/17.09/37.34/37.97%`，会偏离高武目标 |
| P-3 | 明确地阶特殊机制比例以 AR-01 后全图鉴约 153 门为分母，并允许锚点强制的小册离散说明 | 倚天册仅 12 门地阶，七伤拳又必须为代价型；单册最低非零比例 8.33%，全局贡献约 0.65% |

P-1、P-4、P-5 已分别由现行总账、Canon v1.6 天阶池和 Canon v1.3 ID 前缀登记解决，正文保留“已解决”追溯。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/catalog/skills-daojia.md` | `mfr_wudangjiemaishou_huantiao` | “点环跳”为指招，路线须在最后 1–3 段落到合法指端；本任务无权修改 |
| `docs/design/catalog/skills-wujue.md` | `sk_tiezhang` 来源 | NXB02 请求 `ch03_shendiao`；因神雕完整原生天阶池已到 18，归属任务应采用“神雕残承”登记，不再扩完整可学池 |
| `docs/design/catalog/skills-general.md` | `sk_baizhanxinfa.sourceChapters` | 按 NXB12 / NXB14 加 `ch12_shujian`、`ch14_xueshan` |
| `docs/design/catalog/skills-general.md` | `sk_pojunqiangfa.sourceChapters` | 按 NXB14 加 `ch14_xueshan` |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单

| 补录册 | 来源扩展登记 | 本册处理 |
|---|---|---|
| 01 天龙 | 0 | 无需回填 |
| 02 射雕 | `sk_tiezhang → ch03_shendiao` | 不在倚天册；转交五绝册，并要求按“神雕残承”处理以守住 18 门上限 |
| 03 神雕 | 0 | 无需回填 |
| 04 倚天 | 0 | `sk_jingangbuhuai`、`sk_huanyinzhi` 已含倚天来源；补录新武学自带原生来源 |
| 05 笑傲 | 0 | 无需回填 |
| 06 侠客 | 0 | 无需回填 |
| 07 碧血 | 0 | 无需回填 |
| 08 鹿鼎 | 0 | `sk_dashouyin` 已含鹿鼎来源 |
| 09 连城 | 0 | 无需回填 |
| 10 白马 | 0 | 无需回填 |
| 11 鸳鸯 | 0 | `sk_taiyueshibeishou` 已含鸳鸯来源 |
| 12 书剑 | `sk_baizhanxinfa → ch12_shujian` | 不在倚天册；转交通行册 |
| 13 飞狐 | 0 | 无需回填 |
| 14 雪山 | `sk_baizhanxinfa`、`sk_pojunqiangfa → ch14_xueshan` | 不在倚天册；转交通行册 |

结论：倚天册目标武学回填 **0 条**；文首已新增 `skills-bulu-04-yitian.md` 入口，并明确其覆盖明教／波斯总教、成昆旁支、昆仑、崆峒、华山倚天支与玄冥二老。

### 7.2 改标外放清单

| 项目 | 结果 |
|---|---|
| 音功新口径 | 本册无音功，0 条 |
| 大手印跃击 | 本册无 `sk_dashouyin`；`sk_dajiutianshou` 为大九天手，不能据名称误套，0 条 |
| 既有外放复核 | 4 条保持不变：玄冥骨髓、圣火阴风刀、大九天手烈阳贯掌／九天贯日；均为 attack 路线且命中合法手部端点 |
| 待考候选 | 九阳普照、寒冰绵掌·寒潮等 6 招仍按正文 O-11 保守不标；没有以范围几何代替离体证据 |

### 7.3 遗留处理表

| 遗留 | 处理结果 |
|---|---|
| 九阳 `innerGuard.reflectBp:1200` | ✅ 改为 0；由 `ps_jiuyang_taheng` 按有效层数投影 5%→12% |
| 圣火心法未登记 `ap_qihai` | ✅ 改为 `ap_renmai_qihai`；并逐条对照 `design/15` 核查本册玄上路线 |
| 绝招条件加成加法／乘法混用 | ✅ 总则及 8 记受影响绝招统一为 `3.00 × AF × (1 + Σadj) × Kd × Kp − 成本` |
| 天／地、玄上过期镜像 | ✅ 26 + 16 行均改“见文首索引”，重算段数、CT、风险与收招；索引／正文／镜像一致 |
| 玄上镜像真值缺失 | ✅ 16 行显式补 `ultimate:true`；严格检查 `正文≠索引=0` |
| 低于建议段数 | ✅ 选择保留原段数并写明 CT 优势：九阳护体为自身护体＋驱寒，8 段 600 CT／收招 1800，较天阶 10 段最短 750／1950 快 150；刚柔逆转为招架后反制，6 段 540／1740，较地阶 8 段最短 720／1920 快 180 |
| 两条 movement 路线 | ✅ 换形：`督脉神道→任脉气海／神阙→手厥阴间使／中冲→手少阳翳风` 改为 `冲脉气冲／横骨→带脉章门／带脉→阳跷跗阳／申脉`，表现转身换位；掠影：`任脉气海→阳维金门→手太阴太渊→足太阴地机→足少阴然谷→足太阳承山→手阳明曲池／合谷` 改为 `阴跷交信→阴维府舍→足太阴地机→足太阳承山→足少阳光明／悬钟→阳跷跗阳→涌泉`，表现直进掠身；段数、CT、风险不变 |
| 两条内功防守路线 | ✅ 真武阳和首段 `ap_shoushaoyang_zhigou → ap_renmai_qihai`；金顶调息首段 `ap_yangwei_jianjing → ap_renmai_guanyuan`，均补任脉且不改段数、CT、风险 |
| 路线用途 | ✅ 圣火心法·换形、青翼飞身·掠影保持 movement，其余以正文效果为准 |
| 文首补录说明 | ✅ 一行明确补录覆盖明教／波斯总教、成昆旁支、昆仑、崆峒、华山倚天支与玄冥二老，并明确其余五门无补录 |
| 乘法开放问题 | ✅ 新增 O-12，默认乘法并列出 8 记绝招改前→改后；待作者统一确认 |
| 末端规则缺失／位置 | ✅ 12 条缺失、2 条位置全部清零，详见 §7.4 |
| 路线多样性 | ✅ 进一步区分阴风刀、正奇互生、两仪化象、三叠神拳·三；42 条序列全不同，≥80% 重合 0 |
| 本任务列出的其他册遗留 | ⚠️ 康熙、乾隆、古龙、少林、通行、道家、五绝等均不在写集；未越权修改，相关项转交对应任务 |

### 7.4 末端规则命中数（改前 / 改后）

| 状态 | 路线 | 已分类 | 规则检查 | 缺失 | 位置（`-tail`） | 未分类 |
|---|---:|---:|---:|---:|---:|---:|
| 改前 | 42 | 27 | 23 | 12 | 2 | 15 |
| 改后 | 42 | 27 | 22 | 0 | 0 | 15 |

改前 12 条缺失为：攻击内功 1、掌 3、兵器 8；2 条位置均为兵器。已逐条修正路线而未删改动作事实。改后检查次数少 1，是 `mfr_shenghuoxinfa_huanxing` 从错误的 attack 改为 movement 后不再触发“攻击内功须经任／督”检查。

### 7.5 指定门禁

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；扫描 111 文件、61,518 次出现、13,870 个定义；仅基线已知 `sk_babuganchan`，新增严格失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 126 / 126，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 checks passed，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ all checks passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ all checks passed |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict --details docs/design/catalog/skills-yitian.md` | ✅ errors 0；42 路线、42 序列、完全重复 0、高重合提示 0、跨册重复／高重合 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-yitian.md` | ✅ 缺失 0、位置 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-yitian.md` | ✅ 与全仓其他武学完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-yitian.md` | ✅ 未定义引用 0 |
| `git diff --check` | ✅ 通过 |

### 7.6 交其他任务

- ⚠️ 道家册：`mfr_wudangjiemaishou_huantiao` 是远程指风“点环跳”，须按 21 §4.3.1 在末三段落合法指端。
- ⚠️ 五绝册：`sk_tiezhang` 的 `ch03_shendiao` 来源须采用神雕残承，而非完整原生天阶池；否则会把 18 门上限推到 19。
- ⚠️ 通行册：落实 `sk_baizhanxinfa → ch12_shujian/ch14_xueshan`、`sk_pojunqiangfa → ch14_xueshan`。
- ⚠️ 用户列出的康熙／乾隆／古龙／少林 purpose、装备兼容、表格及镜像遗留属于各自 NXfix 写集，本任务未修改。
- ✅ 范围：只修改 `skills-yitian.md` 与本报告；未新造 ID，未执行改变仓库状态的 Git 命令，未删除既有待决事项。


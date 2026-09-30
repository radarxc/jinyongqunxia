# NR4-gulong 报告 · 阴阳性质落地 · 古龙（AR-18：主修经脉、内功性质、路线性质）

## 1. 摘要（3–6 行）

- 已为古龙册 3 张不可审计的内功卡补成显式 `inner.meridians`，并按卡片既有招式用途、门派设定和原创配路说明依据；9/9 内功现均可审计。
- 已将大旗吐纳、青龙吐纳由调和改为阴，并同步总表、卡片、统计、`BreathProfile.nature`、自然护体档及黄阶局部路线的 `requiredNature` 派生。
- 本册改前、改后均无显式路线性质冲突；44 条显式绝招路线未改，但两卡的自然护体与黄阶局部防守会由调和模板改按阴性模板展开，穴位和风险随之变化。
- NR4 三项命中由 `0 / 2 / 3` 清零为 `0 / 0 / 0`；全部指定校验通过，未新造 ID 或高相似路线。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-gulong.md` | 1694 | 文首版本；§0.3 AR-18 口径；§2、§4、§5、§6、§7、§10 内功卡；§18.3 统计；§19A.3–§19A.4 路线派生、调息与护体；§20.2 性质票数；§21 回归规则；§22.5 默认值 |
| `tools/agents/reports/NR4-gulong.md` | 101 | 改动清单、三项计数、校验结果、跨文档交接 |

## 3. 关键结论与数值

- AR-18 逐脉计票：任脉、阴跷、手太阴各投阴票；督脉、阳跷各投阳票；阴阳平票取调和。冲脉、带脉按 AR-18a 默认不投票。
- 3 张补字段卡：明玉功 `任脉+阴跷=阴 2 / 阳 0→yin`；嫁衣神功 `督脉+阳跷=阴 0 / 阳 2→yang`；神水内功 `任脉+手太阴=阴 2 / 阳 0→yin`。
- 2 张改性质卡：大旗吐纳、青龙吐纳都只主修任脉，均为 `阴 1 / 阳 0`，所以 `harmony→yin`。
- 九门内功分布由“阴 3 / 阳 2 / 调和 4”变为“阴 5 / 阳 2 / 调和 2”；IP、品阶和贡献值不变；调息不再乘调和 `natureBp=10500`，改用阴性 `10000`。
- 青龙吐纳：`reliefBp=500+100×3+80×10=1600`，`repairUnits=120+24×3+18×10=372`，由 `1680 / 390→1600 / 372`；大旗吐纳同理为 `1500 / 348`，由 `1575 / 365→1500 / 348`。
- 两卡的 `BreathProfile.nature` 均改为 `yin`；自然护体 `G-HN2→G-YN2`，黄阶局部防守 `G-HD4→G-YD4`。本册 44 条显式绝招路线未改且性质冲突保持 0；模板路线的段数与 CT 不变，穴位和风险按阴性模板更新。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| AR-18a | 冲脉、带脉是否参与内功与路线性质投票 | 不投票；本册九门内功结论不依赖改变二脉归属 |
| AR-18b | 后溪是否加入外放 13 端点白名单 | 不加入；本册两条外放掌端均以劳宫收束，不受影响 |
| K-01～K-03 | 三张地阶内功的主修经脉配表是否需逐字原著考据 | 保持按卡片既有机制的原创配表；原著功效措辞仍随 §22.4 既有考据项核对，不把配表冒充原著事实 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。Canon v1.8 与 `design/05` §5.3 已完整定义本任务所需的主修经脉计票规则；AR-18a / b 保持既有待作者确认状态。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `design/05` §5.3.1 | 无需改正文；迁移清单已预告 `sk_daqixinfa harmony→yin`、`sk_qinglongtuna harmony→yin`，本任务已完成消费侧落地 |
| 实现期武学数据 / 构建产物 | 生成正式数据时以本册为源，将两卡 `nature`、`BreathProfile.nature`、自然护体骨架及黄阶局部路线 `requiredNature` 一并写入；当前仓库没有独立生产数据文件可同步 |
| 书界章节、人物档案、Boss 配装、其他图鉴 | 全仓检索未发现两张改性质卡的性质镜像或配装声明；当前无须交其他任务修改 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 补主修经脉清单

| 内功 | 补的经脉 | 依据 | 推出的性质 |
|---|---|---|---|
| `sk_mingyugong` 明玉功 | `[mer_renmai,mer_yinqiao]` | 本卡“内敛、回流、寒玉护体”分别以任脉蓄纳、阴跷收摄表达；属原创配表，不由旧 `nature` 反推 | `yin`（阴 2 / 阳 0） |
| `sk_jiayishengong` 嫁衣神功 | `[mer_dumai,mer_yangqiao]` | 本卡“重振、破后再起、爆发”由督脉与阳跷承接；属原创配表，不由旧 `nature` 反推 | `yang`（阴 0 / 阳 2） |
| `sk_shenshuineigong` 神水内功 | `[mer_renmai,mer_shoutaiyin]` | 本卡“水势、回澜、水幕、吐纳”由任脉蓄纳与手太阴承接；属原创配表，不由旧 `nature` 反推 | `yin`（阴 2 / 阳 0） |

### 7.2 改性质清单

| 内功 | 改前 → 改后 | 连带改动 |
|---|---|---|
| `sk_daqixinfa` 大旗吐纳 | `harmony→yin` | 总表 / 卡片 / §20.2；`txp_daqixinfa` 的 `BreathProfile.nature harmony→yin`，调息 `1575 / 365→1500 / 348`；黄调和档 / `G-HN2` → 黄阴档 / `G-YN2`；黄阶局部路线 `requiredNature:[harmony]→[yin,harmony]`、防守 `G-HD4→G-YD4`；无显式路线 |
| `sk_qinglongtuna` 青龙吐纳 | `harmony→yin` | 总表 / 卡片 / §20.2；`txp_qinglongtuna` 的 `BreathProfile.nature harmony→yin`，调息 `1680 / 390→1600 / 372`；黄调和档 / `G-HN2` → 黄阴档 / `G-YN2`；黄阶局部路线 `requiredNature:[harmony]→[yin,harmony]`、防守 `G-HD4→G-YD4`；无显式路线 |

### 7.3 路线改动清单

| 路线 | 改前模板 → 改后 | 改动穴位 | 段数、CT、风险 |
|---|---|---|---|
| 两卡自然护体 | `G-HN2→G-YN2` | `涌泉→命门` 改为 `气海→劳宫` | 均为 2 段、140 CT；风险 `[80,120]→[80,100]`，总风险 `200→180` |
| 两卡黄阶局部防守（2 段） | `G-HD4` 前 2 段 → `G-YD4` 前 2 段 | `足临泣→维道` 改为 `气海→关元` | 均为 2 段、140 CT；风险 `[80,100]→[50,80]`，总风险 `180→130` |
| 两卡黄阶局部防守（3 段） | `G-HD4` 前 3 段 → `G-YD4` 前 3 段 | `足临泣→维道→带脉` 改为 `气海→关元→中脘` | 均为 3 段、210 CT；风险 `[80,100,120]→[50,80,100]`，总风险 `300→230` |
| 44 条显式绝招路线 | 冲突 `0→0` | 无 | 段数、CT、收招合计与风险不变 |

两张改性质的黄阶卡没有正式 `mv_* / mfr_*`，上述局部防守按 §19A.3 模板在构建时生成；因此不进入显式绝招索引，但模板变化仍须按表同步穴位与风险。

### 7.4 `--delivery` 三项计数：改前 / 改后

| 项目 | 改前 | 改后 |
|---|---:|---:|
| `DELIVERY rule=nature-conflict` | 0 | 0 |
| `INNER_NATURE` | 2 | 0 |
| `inner_missing_meridians` | 3 | 0 |

### 7.5 交其他任务的条目

- ✅ 无内容侧遗留：本册以外未发现大旗吐纳、青龙吐纳的性质镜像或依赖条件。
- ⚠️ 实现期构建产物尚不存在；后续生成时须消费本册已经闭合的 nature、调息、护体与局部路线派生字段，不能沿用旧调和值、`G-HN2/G-HD4` 穴位或风险。

### 7.6 验收标准逐条结论

- ✅ 写集：只修改 `docs/design/catalog/skills-gulong.md` 并创建本报告；未修改 TODO、基准或其他文档，未执行改变仓库状态的 git 命令。
- ✅ 补字段：3 张缺失卡均显式写成 `inner.meridians`；另将其余 6 张现有经脉声明统一为显式字段名，9/9 可审计。
- ✅ 性质联动：两张命中卡的总表、卡片、统计、调息结果、护体、局部 `requiredNature` 和 §20.2 镜像均已同步；无相反性质依赖残留。
- ✅ 路线约束：44 条显式路线未改，其末端、外放、段数、CT、风险、同门互异和全仓唯一性保持通过；两卡自然护体与局部防守的模板穴位和风险已改为阴性档，段数与 CT 不变。
- ✅ `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-gulong.md`：三项均为 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；严格新增失败 0，仅保留仓库基线 `docs/README.md` 的 `sk_babuganchan` 已知项。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：170 tests，OK。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过，known deviations 0。
- ✅ `python3 tools/balance/meridian_flow_sim.py --check`、`projection_sim.py --check`：均通过。
- ✅ `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-gulong.md`：errors 0；44 条路线互异；册内 / 跨册 ≥80% 配对均为 0。
- ✅ `python3 tools/agents/check_route_unique_for.py ...`：与全仓其他武学完全相同路线 0；`check_undefined_in.py ...`：无未定义引用。
- ✅ `python3 tools/agents/check_nr3_unit.py gulong`：24 对已改开、未处理 0、新造 ≥80% 配对 0。
- ✅ 格式：版本行已追加指定文本；无新增 ID、占位文本、截断表格或未闭合代码块；`git diff --check` 通过。

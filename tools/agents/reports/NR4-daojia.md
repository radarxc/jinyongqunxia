# NR4-daojia 报告 · 阴阳性质落地 · 道家（AR-18：主修经脉、内功性质、路线性质）

## 1. 摘要（3–6 行）

已为道家图鉴 19 门缺正式字段的内功补齐 `inner.meridians`，并复核原有 4 门，共 23/23 门可审计。
返修恢复五门旧卡经脉配属；连同北斗心法、武当养生功，共 7 门按 AR-18 改性质，并同步调息档、统计与镜像，护体档均不变。
16 条性质冲突路线已清零；八条曾误换出口的路线均恢复原动作尾段，段数、CT、风险与收招不变。
定向检查已确认 `--delivery` 三项由 `16 / 19 / 2` 清零为 `0 / 0 / 0`；完整 10 项验收见 §7.6。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-daojia.md` | 2685 | 文首 16 条绝招路线；内功卡主修经脉；§8.7.5 路线数值镜像；§8.7.7 调息同步；§8.7.8 AR-18 审计；§10 校验；§11 开放问题 |
| `tools/agents/reports/NR4-daojia.md` | 147 | 本报告：结论、逐项清单、验收证据与跨文档移交 |

## 3. 关键结论与数值

- 内功性质只由主修经脉投票：阴 13、阳 7、调和 3；正逆周天不参与性质判定。
- 五门争议内功均无独立证据推翻旧配属，故恢复为全真吐纳诀 / 白云观心法 / 太和功 / 真武导引主修任脉、剑冢吐纳主修督脉；性质相应为阴 / 阴 / 阴 / 阴 / 阳。
- 北斗心法：任脉 1 阴票、督脉 1 阳票，`yang → harmony`；调息 `1800/420 → 1890/441`，算式为 `floor(1800×1.05)=1890`、`floor(420×1.05)=441`。
- 武当养生功：任脉 1 阴票、冲脉 0 票，`harmony → yin`；调息 `1890/441 → 1800/420`。
- 五门黄阶内功护体档均保持 I，两门玄中内功保持 II；五门中四门 `harmony→yin/yang` 的调息由 `1575/365` 改为 `1500/348`，全真吐纳诀为单性互换、仍为 `1500/348`。
- 全册未发现上述七门的 `requiredNature` 或绝招路线依赖；16 条路线保持原段数 6–10、路线 CT 600–800、总风险 900–1900、`recovery + ΣCT ≤ 2000`。
- AR-18a、AR-18b 暂沿默认：冲脉 / 带脉不投票；后溪不加入外放 13 端点白名单。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 本次默认值 |
|---|---|---|
| AR-18a | 冲脉、带脉是否投阴阳票 | 不投票；只修冲带或体段只剩冲带时取调和 |
| AR-18b | 后溪是否加入外放 13 端点白名单 | 不加入；可作兵器 / 动作经路，但不能单独证明 `projected` 合法 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务直接执行 Canon v1.8 与 AR-18，未发现需要改写基准的新冲突。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/05-martial-arts-system.md` | §5.3.1 道家迁移清单 | 在已列北斗心法、武当养生功之外，补记全真吐纳诀 `yang→yin`、白云观心法 `harmony→yin`、剑冢吐纳 `harmony→yang`、太和功 `harmony→yin`、真武导引 `harmony→yin` |
| `docs/design/chapters/08-luding.md` | §8.3 白云观岗位说明 | “基础阳性内功”改为“基础阴性内功”，对应全真吐纳诀恢复任脉后的性质 |
| `docs/design/chapters/03-shendiao.md` | §11.9 重阳七星阵首配装 | 主运全真周天功、辅运全真心法＋全真吐纳诀；吐纳诀改阴后形成阳 / 阴相冲，需确认接受相冲或调整辅运 |
| `docs/design/chapters/12-shujian.md` | §11.4.2 张召重三套 Boss 配装 | 主运纯阳无极功、辅运两仪心法＋太和功；太和功改阴后形成阳 / 阴相冲，需确认接受相冲或调整辅运 |
| 其他人物 / Boss / 图鉴 | 引用上述五门处 | 未发现显式旧性质、`requiredNature` 或调息镜像；后续任务仍应按实际槽位复查相冲 |
| `tools/lint/check_skill_catalogs.py` | `route_outlet_points`（当前约第 2367–2388 行） | 补上 `movement` / `inner` 路线的动作出口剥离；当前脚本会把这两类路线的原动作尾段一并计入性质票数 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 补主修经脉清单

| 内功 | 补入的 `inner.meridians` | 卡片 / 门派依据 | 推出性质 |
|---|---|---|---|
| 全真吐纳诀 | `[mer_renmai]` | **保留原配属**；旧卡原写任脉，无独立依据推翻；本作以腹部敛气解释入门吐纳（原创扩展） | 阴 |
| 全真心法 | `[mer_dumai,mer_shouyangming]` | **新增正式字段**；原著有马钰夜授吐纳、攀崖锻体情节，本作门派设定取督脉为纲、手阳明承力（配属为原创扩展） | 阳 |
| 金关玉锁二十四诀 | `[mer_renmai,mer_dumai]` | **新增正式字段**；卡片原文“金关属阳、玉锁属阴、阴阳互济”（原创扩展设定） | 调和 |
| 先天功 | `[mer_dumai,mer_yangwei]` | **新增正式字段**；卡片机制为先天一炁、罡气护体、返本还元，阳脉配属为原创扩展 | 阳 |
| 白云观心法 | `[mer_renmai]` | **保留原配属**；旧卡原写任脉，无独立依据推翻；观心守中为原创扩展解释 | 阴 |
| 古墓心法 | `[mer_zushaoyin]` | **新增正式字段**；原著寒玉床静修与卡片清心寡欲叙事，足少阴配属为原创扩展 | 阴 |
| 寒玉心诀 | `[mer_zushaoyin,mer_yinqiao]` | **新增正式字段**；卡片寒玉静修机制取足少阴蓄藏、阴跷敛息（原创扩展） | 阴 |
| 玉女心经 | `[mer_renmai,mer_zushaoyin,mer_yinqiao]` | **新增正式字段**；卡片周身散热、寒玉相济、清静柔行机制（配属为原创扩展） | 阴 |
| 古墓导引 | `[mer_zushaoyin]` | **新增正式字段**；门派设定承接古墓心法的清静导引（原创扩展） | 阴 |
| 剑冢吐纳 | `[mer_dumai]` | **保留原配属**；旧卡原写督脉，无独立依据推翻；背脊蓄力承接山洪、海潮炼剑为原创扩展解释 | 阳 |
| 太和功 | `[mer_renmai]` | **保留原配属**；旧卡原写任脉，无独立依据推翻；入门养息、守中调和为原创扩展解释 | 阴 |
| 两仪心法 | `[mer_renmai,mer_dumai]` | **新增正式字段**；卡片“两仪相生”设定取任督各主阴阳（原创扩展） | 调和 |
| 纯阳无极功 | `[mer_dumai,mer_yangwei]` | **新增正式字段**；原著武学名目与卡片纯阳驱寒、真火护体机制，配属为原创扩展 | 阳 |
| 武当吐纳 | `[mer_dumai]` | **新增正式字段**；门派入门桩息循背脊上行（原创扩展） | 阳 |
| 真武导引 | `[mer_renmai]` | **保留原配属**；旧卡原写任脉，无独立依据推翻；腹部导引、敛息守中为原创扩展解释 | 阴 |
| 真武桩功 | `[mer_dumai]` | **新增正式字段**；卡片桩中运气并承接玄真心法的门派设定（原创扩展） | 阳 |
| 绝情心诀 | `[mer_yinwei]` | **新增正式字段**；卡片绝情、断情、抵御迷惑机制取阴维收束心神（原创扩展） | 阴 |
| 闭穴功 | `[mer_renmai,mer_yinwei]` | **新增正式字段**；原著有闭穴功名目，卡片封穴锁元机制与具体配属为原创扩展 | 阴 |
| 绝情导引 | `[mer_yinwei]` | **新增正式字段**；门派入门导引承接绝情心诀（原创扩展） | 阴 |

其余原有 4 门也已复核并保留配属：北斗心法 `[任,督]→调和`、寒玉静功 `[足少阴,阴跷]→阴`、武当养生功 `[任,冲]→阴`、玄真心法 `[督,阳维]→阳`。以上经脉选择均先依据旧卡、卡片机制或修习叙事；没有从旧 `nature` 倒推。

### 7.2 改性质清单

| 内功 | 改前 → 改后 | 连带改动 |
|---|---|---|
| 全真吐纳诀 | `yang → yin` | 恢复 `inner.meridians:[mer_renmai]`；`BreathProfile.nature` 同步；单性互换故 `reliefBp/repairUnits` 仍为 `1500/348`；护体档 I 不变；无 `requiredNature` / 路线依赖；本册推荐辅运改为调和的北斗心法，避免与阳性全真心法无桥接相冲 |
| 白云观心法 | `harmony → yin` | 恢复 `inner.meridians:[mer_renmai]`；`BreathProfile.nature` 同步；`1575/365 → 1500/348`；护体档 I 不变；无 `requiredNature` / 路线依赖 |
| 北斗心法 | `yang → harmony` | `BreathProfile.nature` 同步；`reliefBp/repairUnits 1800/420 → 1890/441`；护体档 II 不变；无 `requiredNature` / 路线依赖 |
| 剑冢吐纳 | `harmony → yang` | 恢复 `inner.meridians:[mer_dumai]`；`BreathProfile.nature` 同步；`1575/365 → 1500/348`；护体档 I 不变；无 `requiredNature` / 路线依赖 |
| 太和功 | `harmony → yin` | 恢复 `inner.meridians:[mer_renmai]`；`BreathProfile.nature` 同步；`1575/365 → 1500/348`；护体档 I 不变；无 `requiredNature` / 路线依赖；外册配装相冲检查移交 |
| 武当养生功 | `harmony → yin` | `BreathProfile.nature` 同步；`reliefBp/repairUnits 1890/441 → 1800/420`；护体档 II 不变；无 `requiredNature` / 路线依赖 |
| 真武导引 | `harmony → yin` | 恢复 `inner.meridians:[mer_renmai]`；`BreathProfile.nature` 同步；`1575/365 → 1500/348`；护体档 I 不变；无 `requiredNature` / 路线依赖 |

已顺查本册其余三处“推荐装配”：古墓两处均由调和的金关玉锁桥接，绝情谷一处为阴 / 阴同运，未因本次性质迁移新增相冲。

### 7.3 路线改动清单

所有条目均保持原动作出口、段数、逐段 CT 与风险列表；换穴摘要只列体段变化。脚本命中计数按当前 `route_outlet_points` 计算（尚不剥离 `movement` / `inner` 出口），人工体段票数按 `design/21` §4.3.1 剥离最终路线实际命中的动作尾段。票数均为“阴 / 阳”；雁回末段只剥离五枢、悬钟，新第 4 段承山不命中轻功出口规则，故仍投 1 阳票。

| 路线 | 脚本命中计数（改前 → 改后） | 人工体段票数（改前 → 改后） | 体段换穴摘要 | 段数 / CT / 风险 |
|---|---|---|---|---|
| `mfr_xiantiangong_wuqi` | 10/0 → 2/8 | 8/0 → 0/8 | 八段阴脉 → 督脉 6＋足阳明 2 | 10 / 800 / 不变 |
| `mfr_tiangang_guiyi` | 10/0 → 0/10 | 10/0 → 0/10 | 阴跷、阴维、三阴经、任脉 → 阳维 8＋手少阳 2 | 10 / 800 / 不变 |
| `mfr_tongguijian_tonggui` | 7/0 → 0/7 | 7/0 → 0/7 | 七段阴脉 → 足太阳 4＋手太阳 3 | 8 / 720 / 不变 |
| `mfr_yunvxinjing_hufa` | 3/5 → 7/3 | 3/2 → 7/0 | 冲带、阴 3、阳 2 → 任脉 6＋阴跷 1 | 10 / 795 / 不变 |
| `mfr_gumuqinggong_youshen` | 1/5 → 6/2 | 0/3 → 5/0 | 带脉 2＋阳脉 3 → 阴跷 5 | 8 / 712 / 不变 |
| `mfr_anran_daimu` | 1/8 → 8/1 | 1/8 → 8/1 | 前七段阳脉 → 阴维 7 | 10 / 795 / 不变 |
| `mfr_huzhaojuehushou_juehu` | 6/0 → 0/6 | 6/0 → 0/6 | 六段阴脉 → 督脉 6 | 8 / 720 / 不变 |
| `mfr_wujixuangongquan_huoshou` | 6/0 → 0/6 | 6/0 → 0/6 | 六段阴脉 → 足阳明 6 | 8 / 720 / 不变 |
| `mfr_shenmen13_shisan` | 6/1 → 0/7 | 6/1 → 0/7 | 阴脉 6＋手太阳 1 → 阳维 6＋手太阳 1 | 8 / 720 / 不变 |
| `mfr_tiyunzong_fuyao` | 4/3 → 1/7 | 3/2 → 0/6 | 前六段阴 3 / 阳 2 / 冲 1 → 阳跷 6 | 9 / 675 / 不变 |
| `mfr_zhenwuqijie_guizhen` | 6/2 → 0/8 | 6/2 → 0/8 | 阴 6 / 阳 2 → 督脉 8 | 8 / 720 / 不变 |
| `mfr_sanhuajudingzhang_juding` | 5/0 → 0/5 | 5/0 → 0/5 | 五段阴脉 → 手太阳 2＋手阳明 3 | 6 / 600 / 不变 |
| `mfr_jinyangong_yanhui` | 4/1 → 0/5 | 4/0 → 0/4 | 四段阴脉 → 足少阳 3＋足太阳承山 1；五枢→悬钟出口不变 | 6 / 600 / 不变 |
| `mfr_chongyangzhang_diezhang` | 3/2 → 0/5 | 3/2 → 0/5 | 阴脉 3＋手阳明 2 → 手阳明 5 | 6 / 600 / 不变 |
| `mfr_beidoufuchen_chanchen` | 3/2 → 2/3 | 3/2 → 2/3 | 前三段阴 1 / 阳 2 → 手少阳 3 | 6 / 600 / 不变 |
| `mfr_furongjinzhen_mianli` | 5/0 → 0/5 | 5/0 → 0/5 | 五段阴脉 → 手太阳 5 | 6 / 600 / 不变 |

### 7.4 `--delivery` 三项计数

| 指标 | 改前 | 改后 |
|---|---:|---:|
| `nature-conflict` | 16 | 0 |
| `inner_missing_meridians` | 19 | 0 |
| `INNER_NATURE` | 2 | 0 |

改后同时为 `inner_nature=23/23`、`palm_endpoint_matches=7/7`、一般 delivery 违规 0、尾部违规 0。

### 7.5 交其他任务的条目

- `docs/design/05-martial-arts-system.md` §5.3.1：在既有两项外补列五门旧配属恢复后的性质迁移，见报告 §6。
- `docs/design/chapters/08-luding.md` §8.3：把全真吐纳诀“基础阳性内功”改为“基础阴性内功”。
- `docs/design/chapters/03-shendiao.md` §11.9：重阳七星阵首的阳主运＋阴辅运全真吐纳诀产生相冲，需确认配装。
- `docs/design/chapters/12-shujian.md` §11.4.2 张召重三套 Boss 配装：太和功改阴后与纯阳无极功相冲，需确认是否接受相冲，或改用不破坏角色定位的辅运 / 桥接方案。
- `tools/lint/check_skill_catalogs.py` `route_outlet_points`（当前约第 2367–2388 行）：补上 `movement` / `inner` 路线的动作出口剥离；当前实现会把这两类路线的尾部动作穴位计入体段。
- 其余外册引用未发现显式旧性质、`requiredNature` 或调息镜像；后续任务仍应按配装实际槽位复查相冲。

### 7.6 验收命令（2026-09-29 第 4 次运行复跑）

| 状态 | 检查 | 结果 |
|---|---|---|
| ✅ | `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-daojia.md` | `nature_conflicts=0；inner_missing_meridians=0；inner_nature_conflicts=0` |
| ✅ | `python3 tools/lint/check_ids.py --strict` | 新增失败 0；仅基线已知 `sk_babuganchan` 未定义 |
| ✅ | `python3 -m unittest discover -s tools/lint -p "test_*.py"` | 170 tests OK |
| ✅ | `python3 tools/balance/damage_sim.py --check` | 47 checks passed |
| ✅ | `python3 tools/balance/meridian_flow_sim.py --check` | all checks passed |
| ✅ | `python3 tools/balance/projection_sim.py --check` | all checks passed |
| ✅ | `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-daojia.md` | errors 0；65 条路线全异；册内 / 跨册 ≥80% 配对 0 |
| ✅ | `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-daojia.md` | 完全相同路线 0 |
| ✅ | `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-daojia.md` | 未定义引用 0 |
| ✅ | `python3 tools/agents/check_nr3_unit.py daojia` | 名下 30 对已改开；本任务新造 ≥80% 配对 0 |
| ✅ | 写集边界 | 仅修改图鉴并新增本报告；未修改基准、任务清单、脚本或其他文档 |

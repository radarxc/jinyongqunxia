# NR5-shaolin 报告 · 路线唯一性第五轮 · 少林（显式普通路线纳入全仓比较后的完全相同与高相似配对）

## 1. 摘要（3–6 行）

- 已修改狮子吼两条显式普通路线，每条只换第 2／3 穴，共换 4 个步骤穴位；名下 4 对高相似配对全部改开，无理由豁免。
- 四对重合度由 8333／10000／8000／8000 bp 降为 6666／5000／4000／6000 bp；无新造完全相同或 ≥8000 bp 配对。
- 两条均保持 8 段、560 路线 CT、1560 收招合计、1200 风险总和；人声出口、手部导引尾段、出招方式及全部绝招路线均未改动。
- 文首普通路线索引、正式实例、叙事、计票和风险镜像已同步；NR4 三项计数保持 0/0/0，11 项指定检查全部通过，193 项单测通过。
- 涉及少林但属于其他任务的 11 对既有警告仍保留并列明归属；本报告不宣称全仓普通路线清零。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-shaolin.md` | 1738（原 1710，增加 28） | 版本行；§0 普通显式路线索引；§1.5.3 狮子吼叙事；§5.7.2 正式实例；§5.7.4 后 NR5 逐对表与核算、AR-18 追溯；§7.1 V-SL-22；§8.2 D-16 |
| `tools/agents/reports/NR5-shaolin.md` | 143 | 本报告：前后序列、逐对 bp、门禁输出与跨任务遗留 |

## 3. 关键结论与数值

1. 名下闭包：`4 = 4 改开 + 0 理由 + 0 未处理`；原完全同序配对为 0，其中一对 10000 bp 是较短路线的穴位集合被包含，改后降为 5000 bp。
2. 每条替换下界为 `floor(0.2×8)+1=2`，实际各替换 2 穴。只使用 `design/15` 已登记的腰俞、身柱、脊中、心俞，不新造任何内容 ID。
3. 每条 `8×70=560 CT`；普通收招按本册 §0 默认 1000，故 `1000+560=1560≤2000 CT`。8 段处于天下普通路线建议 5–12 段内。
4. 逐段风险保持 `[80,100,120,140,400,100,120,140]`，总和 `80+100+120+140+400+100+120+140=1200`；各段均在 0–1200 内。总和不是整招失败概率。
5. 改后破阵吼体段阴:阳为 `2:5`，狮吼震为 `1:6`，均与改前相同；仅排除末三段内的天突，人声路线的曲池、合谷／劳宫仍属于体段。
6. 全仓比较覆盖 `654+207=861` 条显式路线；两条改线与其他武学的最大重合均为 7500 bp。只为同武学复核另展开当头棒喝模板，狮子吼六招 15 对均 ≤50%，无同序、轮换或逆序。

## 4. 开放问题（附默认值）

无本轮新增待作者拍板项。既有开放问题和默认值全部保留：

| 事项 | 默认值 / 本轮影响 |
|---|---|
| AR-18a：冲脉／带脉是否参与阴阳计票 | 默认不投票；本轮两条路线未使用冲脉／带脉 |
| AR-18b：后溪是否加入外放端点白名单 | 默认不加入；本轮保留天突及既有合谷／劳宫导引 |
| 仅绑定共享模板的普通路线是否跨武学比较 | 按 2026-09-29 协调者裁定不展开；同武学人工复核展开当头棒喝不改变此范围 |

配路叙事均标为**（原创扩展）**，不新增原著事实、引文或回目；本轮未进行原著逐字核实，既有 K-01～K-12 考据待办原样保留。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案。本轮在 Canon V17-06、V18-03 及 `design/21` 既有规则内完成；本册已有 BP-1～BP-7 的文本和状态均保留，未改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

以下 11 对经 `tools/agents/nr5/pairs.json` 逐对核对，均属原分派快照，且本册一侧都是未改动的绝招。交对应任务处理其普通路线；不是本任务遗漏或新造配对。

| 负责单元 / 文档 | 普通路线 / 位置 | 少林另一侧与当前 bp；需处理内容 |
|---|---|---|
| NR5-bulu-a / `skills-bulu-02-shediao.md` | `mfr_tiezhangyunqigong_tuna` | `mfr_dajingangquan_yinu`、`mfr_longzhaoshou_daoxu`，各 8000；按原分派处理吐纳侧 |
| NR5-bulu-c / `skills-bulu-07-bixue.md` | `mfr_shanzongzhengqigong_tiqi` | `mfr_dajingangquan_yinu`、`mfr_longzhaoshou_daoxu`，各 10000；按原分派处理提气侧 |
| NR5-bulu-d / `skills-bulu-11-yuanyang.md` | `mfr_zhentiansanshizhang_huisuo` | `mfr_qianshourulaizhang_wanfo`，8333；按原分派处理回缩侧 |
| NR5-bulu-d / `skills-bulu-13-feihu.md` | `mfr_miaojiazhang_jiewan` | `mfr_weituochu_dachu`、`mfr_jingangfumoquan_chanxin`，各 8000；按原分派处理解腕侧 |
| NR5-kangxi / `skills-kangxi.md` | `mfr_shenlongxinfa_tuxi` | `mfr_shizihou_shizihou`、`mfr_dajingangzhang_dali`、`mfr_qianshourulaizhang_jieyin`，各 8000；按原分派处理吐息侧 |
| NR5-wujue / `skills-wujue.md` | `mfr_tanzhi_tanzhi` | `mfr_xumishanzhang_yading`，10000；按原分派处理弹指侧 |

全仓 docs 检索未发现其他文档直接引用本轮两条改线 ID，无外部步骤镜像需要同步。无新增检查脚本交办；历史 NR4 的出口／重复采集缺口已由 LINT-outlets 修复，当前正式解析及体段计票均正确。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

| # | 配对（本单元普通路线 / 另一侧） | 改前 bp | 处理方式 | 改动的穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_shizihou_zhenhou` / `mfr_jingangnuhou_zhenshe` | 8333（5/6） | ✅ 改开到 `floor(10000×4/6)=6666` | 第 2／3 穴：命门、至阳 → 脊中、心俞 |
| 2 | `mfr_shizihou_pozhen` / `mfr_shanzongzhengqigong_tiqi` | 10000（4/4） | ✅ 改开到 `10000×2/4=5000` | 第 2／3 穴：命门、至阳 → 腰俞、身柱 |
| 3 | `mfr_shizihou_zhenhou` / `mfr_shenlongxinfa_tuxi` | 8000（4/5） | ✅ 改开到 `10000×2/5=4000` | 第 2／3 穴：命门、至阳 → 脊中、心俞 |
| 4 | `mfr_shizihou_pozhen` / `mfr_tiezhangyunqigong_tuna` | 8000（4/5） | ✅ 改开到 `10000×3/5=6000` | 第 2／3 穴：命门、至阳 → 腰俞、身柱 |

### 7.2 改过的路线清单

**`mfr_shizihou_pozhen`（破阵吼）：**

- 改前：`ap_renmai_qihai→ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_renmai_danzhong→ap_yinwei_tiantu→ap_shouyangming_quchi→ap_shouyangming_hegu`。
- 改后：`ap_renmai_qihai→ap_dumai_yaoshu→ap_dumai_shenzhu→ap_dumai_shendao→ap_renmai_danzhong→ap_yinwei_tiantu→ap_shouyangming_quchi→ap_shouyangming_hegu`。
- ✅ 体段阴:阳 `2:5→2:5`；任脉 2 票阴、督脉 3 票阳、手阳明 2 票阳，天突出口不投票。尾三段完全不变；8 段／560 CT／1560 收招合计／风险列表及总和 1200 全不变。

**`mfr_shizihou_zhenhou`（狮吼震）：**

- 改前：`ap_dumai_yaoyangguan→ap_dumai_mingmen→ap_dumai_zhiyang→ap_zutaiyang_feishu→ap_zuyangming_fenglong→ap_shouyangming_quchi→ap_yinwei_tiantu→ap_shoujueyin_laogong`。
- 改后：`ap_dumai_yaoyangguan→ap_dumai_jizhong→ap_zutaiyang_xinshu→ap_zutaiyang_feishu→ap_zuyangming_fenglong→ap_shouyangming_quchi→ap_yinwei_tiantu→ap_shoujueyin_laogong`。
- ✅ 体段阴:阳 `1:6→1:6`；改后督脉 2 票阳、足太阳 2 票阳、足阳明 1 票阳、手阳明 1 票阳、劳宫 1 票阴，天突出口不投票。尾三段完全不变；8 段／560 CT／1560 收招合计／风险列表及总和 1200 全不变。

两条均**只换穴**，未改 `MoveDef`、`purpose`、`ultimate`、`voice`、`projection`、`requiredNature`、威力或范围；未添加 `allowOpposedNature`。狮吼震与同门狮子吼绝招共享由 `6/8` 降为 `4/8`；六招全部 15 对最高 50%，其中另一最高项为狮子吼绝招 / 当头棒喝 `3/6`。

### 7.3 `check_nr5_unit.py` 与 `check_nr4_unit.py` 改前 / 改后输出

改前 NR5（退出 1）：

```text
单元 shaolin：名下 4 对；已改开 0，已写理由 0，仍完全相同 0，未处理 4；本任务新造配对 0
  未处理： mfr_jingangnuhou_zhenshe|mfr_shizihou_zhenhou 5 / 6
  未处理： mfr_shanzongzhengqigong_tiqi|mfr_shizihou_pozhen 4 / 4
  未处理： mfr_shenlongxinfa_tuxi|mfr_shizihou_zhenhou 4 / 5
  未处理： mfr_shizihou_pozhen|mfr_tiezhangyunqigong_tuna 4 / 5
```

改后 NR5（退出 0）：

```text
单元 shaolin：名下 4 对；已改开 4，已写理由 0，仍完全相同 0，未处理 0；本任务新造配对 0
```

NR4 改前与改后输出完全相同，均退出 0：

```text
✔ shaolin：nature_conflicts=0；inner_missing_meridians=0；inner_nature_conflicts=0
```

### 7.4 额外事项处理结果与交其他任务的条目

- ✅ 任务明确“本单元额外事项：无”，未修改任何绝招或另一侧路线。
- ✅ 本任务 4 对的另一侧无需为这些配对再调整；其余 11 对既有警告的负责单元与路线均见 §6，按原分派处理。
- ⚠️ 全仓普通路线尚未整体清零：限定少林参与的比较仍报告 11 对 ≥8000 bp、0 对完全相同；它们均为未改动少林绝招与他册普通路线的配对。
- ✅ 无新增脚本问题。首次把普通完整步骤重复写入文首镜像时，严格检查报重复定义 2 项；已改为索引引用及核算镜像，正式 `steps` 只定义于 §5.7.2，最终重复定义 0。

### 7.5 指定检查与补充核验

下表为最终结果；各指定命令均实际执行并退出 0。

| 检查命令 | 最终结果 |
|---|---|
| `python3 tools/agents/check_nr5_unit.py shaolin` | ✅ 名下 4 对改开 4；理由、完全相同、未处理、新造配对均 0 |
| `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-shaolin.md` | ✅ `nature_conflicts=0; inner_missing_meridians=0; inner_nature_conflicts=0` |
| `python3 tools/lint/check_ids.py --strict` | ✅ 扫描 111 文件；新失败 0、冲突定义 0、旧 ID 活跃引用 0、套装不对称 0；⚠️ 仍有基线 `docs/README.md` 的 `sk_babuganchan` 未定义，非本轮新增 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 193 项通过，`OK` |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ `meridian_flow_sim: all checks passed` |
| `python3 tools/balance/projection_sim.py --check` | ✅ `projection_sim: all checks passed` |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-shaolin.md` | ✅ `errors=0`；52 绝招 / 52 序列，同门重复、重复步骤定义、正文≠索引、绝招间相似均 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-shaolin.md` | ✅ 完全相同 0；保留他任务 11 对既有普通相关警告；加 `--strict-normal` 后同样通过 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-shaolin.md` | ✅ 指定文件未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py shaolin` | ✅ 名下 24 对改开 24、理由 0、未处理 0、新造 ≥80% 配对 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-shaolin.md` | ✅ 52 绝招路线、46 已分类、57 项规则；动作／尾段违规 0，4 条普通外放路线违规 0，性质三项 0/0/0 |
| 只读 Python 前后断言与全仓比较 | ✅ 只改变两条指定普通路线的各 2 穴；所有路线 ID、其他显式步骤及 CT／风险列不变；尾三段不变；各路线无重复穴；全仓最大重合均 7500 bp；同武学六招 15 对均 ≤50% |
| `git diff --check` 与全文结构扫描 | ✅ 差异格式通过；表格完整、代码块闭合；无截断句及未完成占位词 |

### 7.6 范围、格式与同步

- ✅ 只修改授权图鉴与本报告；未改 `TODO.md`、基准、检查脚本或其他图鉴，未执行改变仓库状态的 Git 命令。
- ✅ 版本行已追加“路线唯一性第五轮（2026-09-30）”；不新增内容 ID，全部替换穴位已由 `design/15` 登记。
- ✅ 文首普通索引镜像来源、换穴、段数／CT／风险；§5.7.2 保留唯一显式步骤，§5.7.3 的既有绑定无需改 ID；狮子吼卡、NR5 表及 AR-18 追溯同步。
- ✅ 每次写入均小于约 150 行；图鉴由 1710 行增至 1738 行，无删节，原有待决事项全部保留。
- ⚠️ 既有原著考据、AR-18a/b 与他任务配对仍按原默认及分派跟进；本次没有把尚未核实或未由本任务处理的内容记为已完成。

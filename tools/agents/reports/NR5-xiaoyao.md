# NR5-xiaoyao 报告 · 路线唯一性第五轮 · 逍遥（显式普通路线纳入全仓比较后的完全相同与高相似配对）

## 1. 摘要（3–6 行）

- 名下 1 对高相似路线已改开：函谷七音落音与琅嬛剑法凌虚的 `overlapBp` 从 10000 降至 7500；无需保留理由。
- 只改普通路线 `mfr_hanguqiyin_luoyin` 的首穴，横骨换为气冲；4 段、CT、风险、调和性质及外关→阳池持乐器出口均保持不变。
- 同步 §0.7 普通显式索引、配路说明与 §2.4 正文镜像，版本追加“路线唯一性第五轮（2026-09-30）”；绝招路线未改。
- 11 条指定命令全部退出 0；NR5 新造配对 0，NR4 三项计数均为 0，NR3 名下 30 对仍全部改开。
- 全仓比较仍显示 9 对涉及本册的既有高相似，均已分派给其他任务；全仓 ID 检查保留 1 个已知基线未定义项，无新增。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-xiaoyao.md` | 2785（原 2782） | 版本、§0.7 普通路线实例及说明、§2.4 函谷七音普通路线镜像 |
| `tools/agents/reports/NR5-xiaoyao.md` | 130 | 本报告：逐对处理、前后序列与计票、全部检查结果、跨任务交接 |

仅修改上述两个允许文件；不改 Canon、TODO、检查脚本、其他图鉴或已有报告，未执行改变仓库状态的 git 命令。

## 3. 关键结论与数值

- 本侧长度 `L=4`，最低替换数 `floor(0.2×4)+1=1`；实际只换首穴，保留有序末段。配对交集由 4 穴减为 3 穴，`floor(10000×3/min(4,8))=7500<8000`。
- 改后落音与全仓任意其他武学显式路线的最大重合度为 7500 bp，没有完全相同或新增 ≥8000 bp 配对。全仓比较池仍为 654 条绝招 + 207 条显式普通路线。
- `segmentCt=[70,70,70,70]`，`riskBp=[90,90,90,90]`；`flowCt=4×70=280`，`ΣriskBp=4×90=360`。风险合计仅是段风险之和，不是联合失败概率。
- 普通招 `recovery=1000` 沿用 `design/05` §4.1 默认，收招合计 `1000+280=1280≤2000 CT`；4 段位于 `design/21` §4.2 玄上普通路线建议的 3–6 段内，未缩短。
- 气冲按 `design/15` §3.16 的游戏归属冲脉、维道按 §3.17 带脉，均默认不投票；外关、阳池属于末两段持乐器出口，依 21 §2.4 排除。体段阴 / 阳改前、改后均为 `0/0 → harmony`。
- 与本武学七音归一的共享为 `0/4`；清音、和音沿用本册 D4H 支援模板时各共享维道一穴，`1/4=25%≤50%`，不是轮换或逆序。

## 4. 开放问题（附默认值）

本轮没有新增需要作者拍板的问题。沿用本册 §17.5 的 AR-18a：冲脉、带脉保持 `harmony`，默认不投阴阳票；气冲不得因标准归经足阳明而改投阳票。原有全部待决事项原样保留，外放白名单亦沿用现行 13 穴。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案。按 Canon V17-06、AR-18 与 `design/21` §2.4、§4.3.4 执行；普通共享模板按本次任务给定的协调者裁定排除在跨武学比较范围外。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

本轮改穴没有册外步骤镜像需要回写。以下是改后比较仍报告、且 `tools/agents/nr5/pairs.json` 已分派给其他任务的 9 对；各任务只处理其名下普通路线，本册另一侧维持原定稿。

| 文档 / 负责单元 | 普通路线位置 | 本册另一侧 / 当前 bp | 需处理内容 |
|---|---|---|---|
| `skills-general.md` / general | `mfr_chuanyunxiao_chuanyun` | `mfr_damingzhou_hezhou` / 10000 | 按既有分派改开或说明共同传承 |
| `skills-kangxi.md` / kangxi | `mfr_shenlongxinfa_tuxi` | `mfr_huoyandao_hufa` / 10000 | 同上 |
| `skills-kangxi.md` / kangxi | `mfr_shenlongxinfa_tuxi` | `mfr_huoyandao_fentian` / 10000 | 同上 |
| `skills-bulu-03-shendiao.md` / bulu-a | `mfr_chiliandugong_cuidu` | `mfr_liuyangzhang_liuyang` / 8000 | 同上 |
| `skills-bulu-03-shendiao.md` / bulu-a | `mfr_caoyuanjunzhenxinfa_zhengqi` | `mfr_liuyangzhang_bafu` / 10000 | 同上 |
| `skills-bulu-06-xiake.md` / bulu-b | `mfr_motianyunqi_cuijin` | `mfr_huoyandao_fentian` / 10000 | 同上 |
| `skills-bulu-07-bixue.md` / bulu-c | `mfr_huashandiejinquan07_lijia` | `mfr_qinlonggong_shuaizhi` / 8000 | 同上 |
| `skills-bulu-13-feihu.md` / bulu-d | `mfr_miaojiazhang_jiewan` | `mfr_zhemei_liuchu` / 8000 | 同上 |
| `skills-bulu-13-feihu.md` / bulu-d | `mfr_miaojiazhang_huishen` | `mfr_bingcanduzhang_shixin` / 8000 | 同上 |

全仓 ID 检查另有既有基线 `sk_babuganchan` 未定义（输出首处为 `docs/README.md:185`，6 处引用）；本轮不新增、不越权修复，仍交原 ID 归属任务处理。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

| 配对 | 改前 bp | 处理方式 | 改动的穴位 |
|---|---:|---|---|
| `mfr_hanguqiyin_luoyin` / `mfr_langhuanjian_lingxu` | 10000（4/4，非同序完全相同） | ✅ 改开至 7500（3/4）；未写高相似保留理由 | 只改本侧首穴 `ap_chongmai_henggu → ap_chongmai_qichong`；凌虚绝招不改 |

### 7.2 改过的路线清单

仅 `mfr_hanguqiyin_luoyin` 一条，`ultimate:false`、`purpose:attack`、`requiredNature:[yin,yang,harmony]` 不变。

| 项目 | 改前 | 改后 |
|---|---|---|
| 穴位序列 | `ap_chongmai_henggu → ap_daimai_weidao → ap_shoushaoyang_waiguan → ap_shoushaoyang_yangchi` | `ap_chongmai_qichong → ap_daimai_weidao → ap_shoushaoyang_waiguan → ap_shoushaoyang_yangchi` |
| 体段 | 横骨（冲脉）、维道（带脉） | 气冲（冲脉）、维道（带脉） |
| 体段阴 / 阳计票 | `0/0 → harmony` | `0/0 → harmony` |
| 出口段 | 外关→阳池，持乐器末两段；不参与体段计票 | 不变，两穴均在外放白名单 |
| 段数 / 逐段 CT | `4 / [70,70,70,70]` | 不变 |
| 路线 CT / 收招 / 合计 | `280 / 1000 / 1280` | 不变 |
| 逐段风险 / 风险和 | `[90,90,90,90] / 360` | 不变；只换穴 |

✅ 4 个穴位均已由 `design/15` 登记，无重复；1–18 段、单段 CT 40–120、风险 0–1200 与总 CT 上限全部满足。
✅ 保持冲脉→带脉承接和琴箫持乐器动作；与同门绝招共享 0，与两条支援模板各共享 1，不是轮换或逆序。
✅ §0.7 索引和 §2.4 正文镜像使用同一完整四段序列，配路标为原创扩展；文首绝招索引及 §0.12 绝招镜像逐字未变。

### 7.3 额外事项处理结果

✅ 本单元额外事项为“无”。没有改绝招、外放字段、效果倍率、范围、解锁、主修经脉或武学性质；没有新增 ID 或 `allowOpposedNature`。

### 7.4 NR5 / NR4 改前与改后输出

`python3 tools/agents/check_nr5_unit.py xiaoyao` 改前（exit 1）：

```text
单元 xiaoyao：名下 1 对；已改开 0，已写理由 0，仍完全相同 0，未处理 1；本任务新造配对 0
  未处理： mfr_hanguqiyin_luoyin|mfr_langhuanjian_lingxu 4 / 4
```

改后（exit 0）：

```text
单元 xiaoyao：名下 1 对；已改开 1，已写理由 0，仍完全相同 0，未处理 0；本任务新造配对 0
```

`python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-xiaoyao.md` 改前与改后输出相同（均 exit 0）：

```text
✔ xiaoyao：nature_conflicts=0；inner_missing_meridians=0；inner_nature_conflicts=0
```

### 7.5 指定检查结果

下列命令均在工作副本根目录运行；图鉴参数均为 `docs/design/catalog/skills-xiaoyao.md`。

| 命令 | 结果 |
|---|---|
| `python3 tools/agents/check_nr5_unit.py xiaoyao` | ✅ exit 0；名下 1 对已改开、新造 0，详见 §7.4 |
| `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-xiaoyao.md` | ✅ exit 0；三项均为 0，详见 §7.4 |
| `python3 tools/lint/check_ids.py --strict` | ✅ exit 0；strict failure 0、new 0；⚠️ 已知基线未定义 1 项，见 §6 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ exit 0；193 项全部通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ exit 0；47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ exit 0；`meridian_flow_sim: all checks passed` |
| `python3 tools/balance/projection_sim.py --check` | ✅ exit 0；`projection_sim: all checks passed` |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-xiaoyao.md` | ✅ exit 0；errors 0、正文≠索引 0；66 条绝招 / 66 种序列，册内及跨册绝招相似 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-xiaoyao.md` | ✅ exit 0；绝招之间完全相同 0、普通相关完全相同 0；⚠️ 仍报告其他任务负责的 9 对既有高相似，见 §6 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-xiaoyao.md` | ✅ exit 0；指定文件中的未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py xiaoyao` | ✅ exit 0；名下 30 对、已改开 30、已写理由 0、未处理 0、新造 ≥80% 配对 0 |

### 7.6 交其他任务的条目与范围自检

- ⚠️ 9 对跨任务既有配对及 ID 基线项详见 §6；本任务名下配对的“另一侧”已无需调整。未发现需要检查脚本跟进的新问题。
- ✅ 只使用已登记气冲；没有新增原著事实、引文或招名，无新增原著考据事项。
- ✅ 图鉴 2782→2785 行，未删无关内容；全部标题、127 张表和 3 组代码围栏完整，未引入占位词或截断行。
- ✅ 本册 §17 待决事项至文件末尾与改前逐字一致；AR-18a 继续采用既定默认值。
- ✅ 单次写入均低于约 150 行，`git diff --check` 通过；仅写允许的图鉴及本报告。

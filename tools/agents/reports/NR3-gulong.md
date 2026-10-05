# NR3-gulong 报告 · 路线叙事第三轮 · 古龙（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

- 已重配古龙册 13 条显式绝招路线；名下 24 对高相似路线全部改到 `overlapBp<8000`，未使用理由豁免，也未新造高相似配对。
- 同批清零 3 条护体 / 蓄气任督缺失和 3 条位移核心脉缺失；拳 / 擒拿、非绝招外放与动作末三段均无遗留命中。
- 改线只替换穴位，保持出招方式、段数、逐段 CT、风险列、收招和效果不变；地阶仍为 1920 CT，玄上仍为 1800 CT。
- 本册没有 `sonic` 人声音功招，故没有需要补写 `voice` 的对象；性质冲突命中为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/catalog/skills-gulong.md` | 1689 | 文首绝招显式路线索引重配 13 路；§19A.3 增补第三轮路线叙事与交付参数镜像；§21 增补多样性规则及 NR3 回归用例；版本行追加本轮记录 |
| `tools/agents/reports/NR3-gulong.md` | 156 | 逐对结果、delivery 前后对照、路线变更、开放项及全套命令验收 |

## 3. 关键结论与数值

- 名下配对：24 对，改开 24、写理由 0、未处理 0；其中 9 对原为 10000 bp，全部改开。
- 本册最终 44 条显式绝招路线均为不同序列，册内 `overlapBp≥8000` 为 0；全仓完全相同路线为 0，本任务新造高相似配对为 0。基点 `0c298ea` 的 10 对跨册遗留及监督复核时主分支尚存的 4 对，均已冻结分配给其他单元，见 §7.4。
- 玄上等长 6 段路线至少替换 `floor(0.2×6)+1=2` 穴；地阶等长 8 段路线至少替换 `floor(0.2×8)+1=2` 穴。本轮每条目标路线均替换不少于 2 穴。
- 玄上路线：`6×100=600 CT`，收招合计 `1200+600=1800 CT`，总风险 `100+120+140+160+180+200=900`。
- 地阶路线：`8×90=720 CT`，收招合计 `1200+720=1920 CT`，总风险 `100+120+140+160+180+200+220+240=1360`。
- `--delivery`：44 路、已分类 29、规则检查 29；违规 `6→0`，末三段违规 `0→0`，未分类 15，非绝招外放 `2/0`，性质冲突 `0`。
- 本册只有 2 条普通外放路线，原已落合法掌端；没有 `sonic` 人声音功，`voice` 补标为 0 条。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| NR3-GL-O01 | `design/21` §2.4 对“含任督 / 奇经混合方案时取 harmony”的计票读法与字面读法仍待作者确认 | 按任务要求，本轮不为性质改线，也不添加 `allowOpposedNature`；古龙册当前脚本命中为 0 |
| NR3-GL-O02 | §22.5 既有 G-05～G-13 等开放项尚未全部由作者另行拍板 | 保留正文既有默认值，本轮不删除、不越权结案 |
| NR3-GL-O03 | §22.4 K-01～K-09 原著考据仍未逐字核对 | 继续以三联 / 广州修订版为后续核对基线；本轮只改原创经脉路线，不新增原著断言 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

本任务不新增基准修改提案。Canon V17-06 与 `design/21` §4.3.4 已足以约束高相似路线；正文既有 C1g-P01～P04 均保留原状态。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `design/21` §2.4 及后续协调任务 | 作者确认“任督 / 奇经混合即 harmony”的精确判定后，统一重跑全目录性质冲突；本册当前无脚本命中，不先行改线 |
| 其余 NR3 图鉴任务 / 各自分配清单 | 与本册相连的“另一侧”无需为本任务配对再改：古龙侧已全部降至 8000 bp 以下；各册只处理其自己名下的其他配对 |
| `tools/agents/nr3/gulong.md` | 该文件是协调器冻结的分配输入，不应回写；最终处理结果以本报告和 `check_nr3_unit.py gulong` 为准 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

| 配对 | 改前 bp | 处理方式 / 改后 bp | 本侧改动穴位（旧 → 新） |
|---|---:|---:|---|
| `mfr_tangmenbidu_shoumai` / `mfr_anran_xiangru` | 10000 | 改开至 3333 | 大敦、中都、水泉、公孙 → 尺泽、气海、关元、太渊 |
| `mfr_shenshuineigong_zhongchao` / `mfr_dugu9_wuzhao` | 10000 | 改开至 7500 | 腹哀、蠡沟 → 尺泽、鱼际 |
| `mfr_jifengqishu_chitu` / `mfr_emeijiuyang_chaoyang` | 10000 | 改开至 3333 | 脊中、阳池、少泽、二间 → 申脉、悬钟、昆仑、外关 |
| `mfr_mingyugong_huiliu` / `mfr_hama_quanjin` | 10000 | 改开至 7500 | 大包、隐白 → 照海、气海 |
| `mfr_jifengqishu_chitu` / `mfr_qimenbuzhen_bamen` | 10000 | 改开至 3333 | 同上 |
| `mfr_tangmenbidu_shoumai` / `mfr_jiuyinshenzhao_shounao` | 10000 | 改开至 3333 | 同守脉改动 |
| `mfr_mingyugong_huiliu` / `mfr_zhemei_xunmei` | 10000 | 改开至 7500 | 同回流改动 |
| `mfr_tangmenbidu_shoumai` / `mfr_yiyangzhi_liaoshang` | 10000 | 改开至 3333 | 同守脉改动 |
| `mfr_tianyishenshui_fengxia` / `mfr_yunvxinjing_bingxin` | 10000 | 改开至 5000 | 膻中、水分、灵道 → 地机、中极、蠡沟 |
| `mfr_mingyugong_huiliu` / `mfr_anran_xiaohun` | 8750 | 改开至 6250 | 大包、隐白 → 照海、气海 |
| `mfr_ximenjiandao_yingxue` / `mfr_bihai_dingshen` | 8750 | 改开至 2500 | 阴陵泉、神阙、间使、中冲、神门 → 照海、筑宾、蠡沟、郄门、通里 |
| `mfr_mingyugong_huiliu` / `mfr_bixuegong_suoyuan` | 8750 | 改开至 6250 | 同回流改动 |
| `mfr_ximenjiandao_yingxue` / `mfr_huoyandao_hufa` | 8750 | 改开至 2500 | 同映雪改动 |
| `mfr_mingyugong_huiliu` / `mfr_pojunqiangfa_cuifeng` | 8750 | 改开至 6250 | 同回流改动 |
| `mfr_mingyugong_zhaoye` / `mfr_xiantiangong_wuqi` | 8750 | 改开至 6250 | 气海、天府 → 石门、尺泽 |
| `mfr_tianyishenshui_fengxia` / `mfr_baicaobiandu_xiangke` | 8333 | 改开至 3333 | 膻中、水分、灵道 → 地机、中极、蠡沟 |
| `mfr_qinglongcisha_yici` / `mfr_baichousuofa_juanwan` | 8333 | 改开至 5000 | 承浆、石门 → 筑宾、阴廉 |
| `mfr_daqiqiang_chongying` / `mfr_hujiadao_fengxue` | 8333 | 改开至 3333 | 申脉、哑门、昆仑 → 承山、阳陵泉、天井 |
| `mfr_daqiqiang_chongying` / `mfr_qianshourulaizhang_wanfo` | 8333 | 改开至 3333 | 同冲营改动 |
| `mfr_shenshuineigong_zhongchao` / `mfr_duanzhenqiang_pozhen` | 8333 | 改开至 5000 | 腹哀、蠡沟 → 尺泽、鱼际 |
| `mfr_tangmenbidu_shoumai` / `mfr_huanyinzhi_wuxiang` | 8333 | 改开至 3333 | 大敦、中都、水泉、公孙 → 尺泽、气海、关元、太渊 |
| `mfr_tianyishenshui_fengxia` / `mfr_jiuyinshenzhao_shounao` | 8333 | 改开至 3333 | 同“封匣”路线改动 |
| `mfr_tianyishenshui_fengxia` / `mfr_meirensanzhao_feiyan` | 8333 | 改开至 3333 | 同“封匣”路线改动 |
| `mfr_tianyishenshui_fengxia` / `mfr_xuedaojing_yinren` | 8333 | 改开至 3333 | 同“封匣”路线改动 |

逐对值均按 `floor(10000×|A∩B|/min(|A|,|B|))` 重算。跨武学没有足够的共同传承依据，因此全部采用改开而非理由豁免。

### 7.2 `--delivery` 命中数（改前 / 改后）

| 规则 | 改前 | 改后 | 处理 |
|---|---:|---:|---|
| 拳 / 擒拿末端 | 0 | 0 | 无本册命中 |
| 位移核心脉 / 涌泉 | 3 | 0 | 暗翔补带脉 / 足少阳；驰突补阳跷 / 足少阳；归岛补涌泉、阳跷、带脉 / 足少阳 |
| 护体 / 蓄气任督 | 3 | 0 | 护庄、护心补任督；守脉补任脉 |
| 非绝招外放合法端点 | 0 / 2 路 | 0 / 2 路 | 凝玉、纳流原已合法，不改 |
| 动作末三段 | 0 | 0 | 无命中 |
| 性质冲突 | 0 | 0 | 按要求只报告、不据此改线 |
| 总 `violations` | 6 | 0 | 全部清零 |

性质补注：按脚本计票读法，本轮改线后 `mfr_qinglongneifa_huxin` 由 harmony 变 yin、`mfr_feixiandao_guidao` 由 yin 变 yang、`mfr_wuzhengxinfa_huzhuang` 仍为 yin；三门武学均为调和，脚本不计冲突。改线分别为满足护体任督或位移核心脉规则，并非为改变性质。

最终摘要为 `delivery_routes=44; classified=29; checked_rules=29; violations=0; tail_violations=0; unclassified=15; nonultimate_projection_routes=2; nonultimate_projection_violations=0; nature_conflicts=0`。

### 7.3 改过的路线清单

| 路线 | 原因 | 段数 | CT / 收招合计 | 风险 |
|---|---|---:|---|---|
| `mfr_mingyugong_huiliu` | 5 对高相似 | 8 | `720 / 1920`，不变 | `1360`，列表不变 |
| `mfr_mingyugong_zhaoye` | 1 对高相似 | 8 | `720 / 1920`，不变 | `1360`，列表不变 |
| `mfr_shenshuineigong_zhongchao` | 2 对高相似 | 8 | `720 / 1920`，不变 | `1360`，列表不变 |
| `mfr_qinglongcisha_yici` | 1 对高相似 | 8 | `720 / 1920`，不变 | `1360`，列表不变 |
| `mfr_ximenjiandao_yingxue` | 2 对高相似；与回澜最长同序连续段 `5→2` | 8 | `720 / 1920`，不变 | `1360`，列表不变 |
| `mfr_daqiqiang_chongying` | 2 对高相似 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_tianyishenshui_fengxia` | 5 对高相似 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_jifengqishu_chitu` | 2 对高相似 + 位移规则 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_tangmenbidu_shoumai` | 4 对高相似 + 护体规则 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_wuzhengxinfa_huzhuang` | 护体规则 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_bianfushenfa_anxiang` | 位移规则 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_qinglongneifa_huxin` | 护体规则 | 6 | `600 / 1800`，不变 | `900`，列表不变 |
| `mfr_feixiandao_guidao` | 位移规则 | 6 | `600 / 1800`，不变 | `900`，列表不变 |

### 7.4 交其他任务的条目

- ✅ 24 对的“另一侧”均无需因这些配对再调整；古龙侧当前重合率最高为 7500 bp。
- ⚠️ 按基点 `0c298ea` 复算，全仓曾检出下列 10 对涉及古龙册的既有跨册高相似路线；它们均已冻结分配给表中其他单元，本任务没有改动这些古龙路线，也没有新造这些配对。

| 负责单元 | 既有配对 | 当前 bp |
|---|---|---:|
| `daojia` | `mfr_bingpoyinzhen_shehun` / `mfr_tangmenanshou_baoyu` | 8750 |
| `daojia` | `mfr_shenmen13_shisan` / `mfr_shenshuineigong_huilan` | 8750 |
| `wujue` | `mfr_kurongchangong_fengchun` / `mfr_jiayishengong_liehuo` | 8750 |
| `wuyue` | `mfr_qingchengcuixinzhang_duanmai` / `mfr_jiayishengong_liehuo` | 8750 |
| `qianlong` | `mfr_baihuacuo_fanchang` / `mfr_shenshuineigong_huilan` | 8750 |
| `xiaoyao` | `mfr_huoyandao_hufa` / `mfr_shenshuineigong_huilan` | 10000 |
| `qianlong` | `mfr_baihuacuo_cuoluo` / `mfr_tangmenanshou_baoyu` | 8750 |
| `yitian` | `mfr_shenghuoling_wuding` / `mfr_tangmenanshou_baoyu` | 10000 |
| `wuyue` | `mfr_songshanjianfa_kaimen` / `mfr_kongquezhen_bimen` | 8333 |
| `wuyue` | `mfr_yangwujian_haoran` / `mfr_sanzhuangheji_tongji` | 8333 |

- 据监督复核，截至主分支合入 `wuyue` / `shaolin` / `qianlong` / `xiaoyao` 后，上述 10 对只剩 4 对仍 ≥80%：`daojia` 名下 `mfr_bingpoyinzhen_shehun` / `mfr_tangmenanshou_baoyu` 与 `mfr_shenmen13_shisan` / `mfr_shenshuineigong_huilan`，`wujue` 名下 `mfr_kurongchangong_fengchun` / `mfr_jiayishengong_liehuo`，`yitian` 名下 `mfr_shenghuoling_wuding` / `mfr_tangmenanshou_baoyu`。
- ⚠️ 性质规则若在协调者确认后改变，应由统一后续任务重跑；古龙册本轮命中清单为空。

### 7.5 验收清单

- ✅ 写集：仅修改 `docs/design/catalog/skills-gulong.md`，并新建本报告。
- ✅ 版本：已追加“路线叙事第三轮（2026-09-29）”，上游版本同步为 `design/21` v2.6。
- ✅ 逐对：24/24 改开；9 个 10000 bp 配对全部改开；未使用理由豁免；新造 ≥80% 配对 0。
- ✅ 路线硬约束：不缩短、不改 CT / 风险 / 出招方式；穴位不重复，均在 `design/15` 登记；动作末端、任督、步法核心脉与外放端点通过。
- ✅ 同门互异：本册 `同门重复=0`，44 条路线均为不同序列，册内高相似对 0。
- ✅ 镜像：§19A.2 / §19A.3 继续以“显式（见本册绝招显式路线索引）”引用唯一 steps；新增 13 路参数镜像，段数、路线 CT、收招合计、总风险及列表齐全。
- ✅ 人声字段：本册没有 `sonic` 人声音功，按任务规则跳过，补标 0 条。
- ✅ 性质冲突：`--delivery --details` 命中 0；遵守“本轮先不改”的要求。
- ✅ 占位与格式：无新增 `TODO` / “此处省略” / “待补充”；Markdown 表格和代码围栏完整，`git diff --check` 通过。
- ✅ `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-gulong.md`：退出 0，违规 0。
- ✅ `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-gulong.md`：退出 0，44 条路线、44 个序列、本册高相似对 0。
- ✅ 全仓 `--json --diversity` 交叉复核：当前工作副本（基点 `0c298ea`）涉及古龙册的完全相同路线 0、跨册高相似路线 10 对；监督复核时主分支已降至 §7.4 所列 4 对，均属其他冻结单元。
- ✅ `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-gulong.md`：完全相同路线 0。
- ✅ `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-gulong.md`：退出 0，无输出。
- ✅ `python3 tools/agents/check_nr3_unit.py gulong`：24 对全改开、未处理 0、新造 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；111 文件、63,135 次出现、13,906 个定义；仅既有 `sk_babuganchan` 基线提示，严格新增失败 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：145 / 145 通过。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过，known deviations 0。
- ✅ `python3 tools/balance/meridian_flow_sim.py --check`：通过。
- ✅ `python3 tools/balance/projection_sim.py --check`：通过。

# NXfix-gulong 报告 · 终审·收尾（门派图鉴）· 古龙

## 1. 摘要（3–6 行）

- 已完成古龙册 AR-14～AR-17 终审：44 条显式绝招路线全部通过出招末端、路线唯一性与多样性检查。
- 修正 8 条末端路线、1 条相似路线，并把 5 个伤害绝招的 `purpose` 由错误的 `defense` 统一为 `attack`。
- 14 本补录册没有来源扩展指向古龙册；本册也没有符合 AR-17 新口径的音功或大手印跃击，外放维持 2 招。
- 无命快剑·绝回按 `design/05` §4.2 / §4.8 统一为 `3.00+0.30=3.30`；全部指定门禁通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/catalog/skills-gulong.md` | 1,671 | 文首显式路线索引；§18.4 外放复核；§19A.3 路线终审说明；§21 校验规则与用例；§22 待决追溯 |
| `tools/agents/reports/NXfix-gulong.md` | 138 | 本报告：结论、开放项、同步项、来源 / 外放 / 遗留 / 末端审计与门禁 |

## 3. 关键结论与数值

- 本册仍为 68 门：`天/地/玄/黄=0/10/29/29`；本任务不新增武学、招式、路线或穴位 ID。
- 显式绝招路线为 `18 地阶 + 26 玄上 = 44`；修改后 44 条路线对应 44 个不同序列，册内及跨册完全相同路线均为 0，册内 `≥80%` 相似对为 0。
- 末端扫描改前为 `delivery_routes=44, classified=24, checked_rules=15, violations=6, tail_violations=2, unclassified=20`；合并“缺失 / 位置”诊断为 8 条命中。改后为 `44, 24, 18, 0, 0, 20`。
- 五条伤害绝招 `mfr_mingyugong_zhaoye`、`mfr_jiayishengong_liehuo`、`mfr_shenshuineigong_zhongchao`、`mfr_kongquelingfa_shouping`、`mfr_kongquelingfa_kaiping` 的唯一用途均为 `attack`。
- `mfr_mingyugong_zhaoye` 作为内功攻击绝招补入任脉气海；其余两条地阶内功攻击路线原已有督 / 任脉。古龙册所用 138 个不同 `ap_*` 均能在 `design/15` 找到登记。
- 外放维持 `天/地/玄/黄=0/2/0/0`：仅凝玉、纳流两招；均经内关并收于劳宫。没有音功伤害招或大手印跃击可依 AR-17 新增改标。
- 绝回保持单体 3.30：按绝招单体基准 3.00，加罕见条件绝对加项 0.30，`3.00+0.30=3.30`，不写成 `3.00×1.30`。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| GL-F-O01 | AR-16 的外放射程、范围、耗内与 Z5M 曲线仍带上游“待作者确认”状态 | 继续采用 Canon v1.6 / `design/21` v2.5 的现行三档默认；不阻断本册 |
| GL-F-O02 | 古龙册原有 G-05～G-13 等玩法与投放开放项尚未由作者全部拍板 | 保留正文 §22.5 的既有默认值；本任务不删除或越权结案 |
| GL-F-O03 | 原著考据 K-01～K-09 尚需按三联 / 广州修订版核对 | 继续保留“待考 / 原创扩展”边界，不据网络二创补写事实 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

本任务不新增基准修改提案。正文旧提案 `C1g-P04` 已追溯为解决：Canon v1.3 V13-01～05 / V13-C01 已接纳经脉 ID 前缀、乘区、护体、速度与确定性边界。其余既有 `C1g-P01`～`C1g-P03` 保留原状。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `docs/design/catalog/skills-wujue.md` / `sk_tiezhang` | 按 NXB02 将神雕来源以残承登记；神雕完整原生天阶池已为 18，不应把 10 品铁掌作为完整新增池项 |
| `docs/design/catalog/skills-general.md` / `sk_baizhanxinfa`、`sk_pojunqiangfa` | 按 NXB12 / NXB14 分别补 `ch12_shujian`、`ch14_xueshan` 来源；均不属于古龙册 |
| `docs/design/catalog/skills-kangxi.md` / `sk_taiyueshibeishou` | 按总任务要求核对并加入 `weaponReq.altItems:[eq_changchangfengshibei]`；另由 `design/10` 维护装备类别兼容 |
| 康熙、乾隆、少林、道家、通行、倚天、五绝及其他 NXfix 册 | 完成本任务明确列给各册的 purpose、穴位、护体反震、过期镜像、降龙外放、公式及末端修复；古龙册不越权修改 |
| `docs/README.md` | 既有 `sk_babuganchan` 未定义引用仍是 `check_ids.py` 基线项；本任务无新增严格失败 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单（逐条）

| 补录册登记 | 唯一归属 | 古龙册处理 |
|---|---|---|
| `sk_tiezhang → ch03_shendiao` | `skills-wujue.md` | ✅ 跳过；报告 §6 交五绝册，按任务前提应采用“神雕残承”路径以避免完整原生天阶池从 18 超限 |
| `sk_baizhanxinfa → ch12_shujian` | `skills-general.md` | ✅ 跳过；报告 §6 交通行册 |
| `sk_baizhanxinfa → ch14_xueshan` | `skills-general.md` | ✅ 跳过；报告 §6 交通行册 |
| `sk_pojunqiangfa → ch14_xueshan` | `skills-general.md` | ✅ 跳过；报告 §6 交通行册 |
| 其余补录册 | 各自新卡或既有来源已覆盖 | ✅ 无待落实项；没有任何来源扩展目标位于 `skills-gulong.md`，故未添加补录索引 |

### 7.2 改标外放清单

- ✅ 新增改标 0 招：古龙册无满足 AR-17 的深厚内力可控伤敌音功，也无大手印跃击；NXT §7.2 未列古龙候选。
- ✅ 既有 2 招复核通过：`mv_mingyugong_ningyu`、`mv_shenshuineigong_naliu` 保持 `projection:true`、三档范围及合法劳宫末端。
- ✅ 实体暗器、孔雀翎机括、龙凤双环与阎罗索继续为 `not_projected`，未按“远程 / 投射”批量误标。

### 7.3 遗留处理表

| 遗留 | 本册结论 | 状态 |
|---|---|---|
| 5 个索引 / 镜像 `purpose` 不一致 | 依据正文均为伤害招，索引统一改为 `attack`；§19A 镜像原已为 `attack` | ✅ 已解决 |
| 内功攻击绝招需含任 / 督 | 明玉照夜补任脉气海；嫁衣烈火原有督脉，神水重潮原有任脉 | ✅ 已解决 |
| 绝招条件加成加法 / 乘法混用 | 绝回明确按 §4.8 的 3.00 基准加 §4.2 条件绝对项：`3.00+0.30=3.30` | ✅ 已解决 |
| 玄上穴位 ID 未登记风险 | 本册 138 个不同 `ap_*` 与 `design/15` 对照，差集为 0 | ✅ 已解决 |
| 末端“缺失 / 位置”诊断 | 修正 8 路，逐项见 §7.4 | ✅ 已解决 |
| 高相似路线 | 重排绝回与循声后，44 条路线 `≥80%` 相似对为 0 | ✅ 已解决 |
| AR-17 音功 / 大手印新口径 | 本册无候选，正文 §18.4 留复核结论，统计仍为 2 | ✅ 已核对，无修改项 |
| 补录来源扩展 | 14 册无目标在古龙册，不添加无实际目标的补录索引 | ✅ 已核对，无修改项 |
| 旧待决 G-12 / C1g-P04 | 按 Canon v1.3 与 `design/05` v1.4 改写为“已解决”，保留追溯 | ✅ 已解决 |
| 其他册点名事项 | 不在本任务写集，逐项归还对应 NXfix 任务 | ✅ 见 §6 / §7.6 |

### 7.4 出招方式末端规则命中数（改前 / 改后）

| 指标 | 改前 | 改后 |
|---|---:|---:|
| 显式路线 `delivery_routes` | 44 | 44 |
| 已分类 `classified` | 24 | 24 |
| 已检查规则 `checked_rules` | 15 | 18 |
| 违规 `violations` | 6 | 0 |
| 末三段位置违规 `tail_violations` | 2 | 0 |
| 未可靠分类 `unclassified` | 20 | 20 |
| “缺失 / 位置”逐条命中 | **8** | **0** |

已修路线：

1. `mfr_qinglongcisha_yici`：收于腕骨。
2. `mfr_longfengshuanghuan_huihuan`：收于阳池。
3. `mfr_ximenjiandao_yingxue`：收于腕骨。
4. `mfr_tianwaifeixian_tianwai`：以足三阳起势，末三段经天井、外关收于阳谷。
5. `mfr_daqiqiang_chongying`：收于外关。
6. `mfr_yanluosan_xuanmian`：收于阳池。
7. `mfr_jingwumingkuaijian_juehui`：末三段经大陵、神门收于腕骨，并与明玉回流区分。
8. `mfr_baiyunjianwei_huijian`：收于外关。

另重排 `mfr_tingfengbianwei_xunsheng` 为“大钟 → 廉泉 → 听宫 → 瞳子髎 → 风府 → 足三里”的听觉辨位路线，以消除其与唐门解器·反扣的高相似，不冒充音功外放。

### 7.5 命令验收

| 命令 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；扫描 111 文件，严格新增失败 0；仅仓库既有基线 `sk_babuganchan` |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 126 项通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-gulong.md` | ✅ `errors=0`；44 / 44 序列，完全相同与 `≥80%` 相似均 0 |
| 同脚本加 `--delivery --details` | ✅ `violations=0`、`tail_violations=0` |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-gulong.md` | ✅ 与全仓其他武学完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-gulong.md` | ✅ 未定义引用 0 |
| `git diff --check` | ✅ 通过 |

### 7.6 交其他任务的条目

- ✅ 已按写集隔离：仅修改古龙册与本报告，没有修改其他图鉴、基准、进度清单或工具。
- ⚠️ 五绝册：`sk_tiezhang` 的神雕来源采用残承，不计完整原生天阶池；同步五绝降龙三绝招外放与统计 `39→42`。
- ⚠️ 通行册：落实 `sk_baizhanxinfa` 的书剑 / 雪山来源、`sk_pojunqiangfa` 的雪山来源，并核对 `mfr_tuinaliaofa_tuigong` 正式百会 ID。
- ⚠️ 康熙册：落实太岳石碑兼容，并核对两处 purpose；乾隆册核对四处 purpose、QL-O08 表格与八卦掌百会；少林册处理约 17 处 purpose 及过期镜像。
- ⚠️ 倚天册：九阳 `innerGuard.reflectBp` 归零并走层数投影、圣火心法气海 ID；其余各册按任务清单处理焚天 / 北冥 / 小无相 / 化功 / 龙象 / 乾坤路线、29 记段数与过期镜像。
- ⚠️ `docs/README.md` 的 `sk_babuganchan` 是严格 ID 检查允许的既有基线项，不属于本册。

### 7.7 最终内容自检

- ✅ 文首已追加“经脉落地终审（2026-09-29）”，上游更新到 AR-17 / `design/21` v2.5。
- ✅ 索引、§19A 镜像、说明与验证表同步；没有新造 ID，也没有重复定义上游算法。
- ✅ 未删除既有待决事项；已解决项保留编号与依据。
- ✅ 无截断表格或句子、无未闭合代码围栏、无新增占位标记。
- ✅ 改动规模远低于原文 15%，且仅触及授权路径。


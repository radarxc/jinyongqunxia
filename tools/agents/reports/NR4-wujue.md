# NR4-wujue 报告 · 阴阳性质落地 · 五绝（AR-18：主修经脉、内功性质、路线性质）

## 1. 摘要（3–6 行）

已为五绝图鉴 29 门内功补齐 `inner.meridians`：本轮处理 17 门，其中 12 门补判 / 扩充主修经脉、5 门沿用旧裸 `mer_*` 记录规范入字段，缺字段由 17 降为 0。
按 AR-18 主修经脉计票修正 9 门内功性质，并同步性质汇总、正式卡、`BreathProfile.nature`、护体档说明及两条相关 `requiredNature`。
已改 14 条本册路线及 `design/21` §12.1 的 3 条降龙绝招路线，均保留动作末端、段数、逐段 CT / 风险、收招与出招方式。
聚合审计的 16 条路线性质冲突已全部归零；缺主修经脉与内功性质冲突也均为 0，十项指定门禁全部通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-wujue.md` | 3613 | 版本行；§0.3 内功性质汇总；§0.11 调息 / 护体档；§0.12 路线与镜像；17 门正式卡；§16 校验；§17.5 开放问题 |
| `docs/design/21-meridian-flow-and-moves.md` | 2343 | §12.1 三条降龙绝招路线体段；§6.2 镜像表与路线说明 |
| `tools/agents/reports/NR4-wujue.md` | 147 | 本报告：经脉、性质、路线、门禁与跨任务交接清单 |

未修改 `TODO.md`、Canon、`design/05`、`design/15`、检查脚本或其他图鉴；未新造 ID。

## 3. 关键结论与数值

- 内功审计：29 / 29 门均有主修经脉；计票后为阳 14、阴 8、调和 7。冲脉、带脉按 AR-18a 默认值不投票。
- 改性质 9 门：`yang→harmony` 1 门、`yin→harmony` 2 门、`harmony→yin` 5 门、`yang→yin` 1 门；均由经脉票推出，不由旧 `nature` 反推经脉。
- 路线修正 17 条：阳向 14 条、阴向 3 条；仅替换体段穴位，共替换 59 个槽位。
- 17 条路线的段数保持 6–10；逐段 CT、风险、`recovery:1200` 均未变；ΣCT 保持 450–800，含收招保持 1650–2000。
- `--delivery` 总计 89 路，`nature_conflicts=0`、`inner_missing_meridians=0`、`inner_nature_conflicts=0`；动作规则、尾部规则及普通外放违规均为 0。
- 严格多样性：89 条路线、89 个不同序列、完全重复 0、≥80% 相似配对 0；NR3 本任务新造 ≥80% 配对 0。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| AR-18a | 冲脉、带脉是否继续不投阴阳票？ | 不投票；本轮所有内功与路线按此完成，作者改口时须重跑全册迁移 |
| AR-18b | 后溪是否加入外放 13 端点白名单？ | 不加入；后溪仅在动作明确为手刀、掌刃、掌缘、掌侧或劈掌时作为掌法动作末端 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准修改提案。Canon v1.8、`design/05` §5.3 / §5.3.1、`design/15` 与 `design/21` §4.3.1 已足以定义本轮口径；AR-18a / b 沿既有默认值等待作者确认。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

`design/21` §12.1 三条降龙路线及 §6.2 镜像说明已在本任务同步完成，不再作为下游交接项。

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/05-martial-arts-system.md` | §5.3.1，`skills-wujue` 审计行及汇总计数 | 将本册改性清单由 6 门更新为 9 门，补 `sk_yaoputunaxi harmony→yin`、`sk_shexingtunaxi yin→harmony`、`sk_wangfutunaxi yang→yin`，并重算全册性质不符总数 |
| `docs/design/chapters/02-shediao.md`；`docs/design/catalog/npcs-ch02-shediao.md` | 1226–1227；35–36 | 陈玄风、梅超风：桃花吐纳息辅运比例 `0.40→0.25`；无品阶 ≥7 调和桥接，新引入阴阳相冲风险 |
| `docs/design/chapters/02-shediao.md`；`docs/design/catalog/npcs-ch02-shediao.md` | 1230；13 | 洪七公：丐帮护心法辅运比例 `0.50→0.40`，且失去三运同源 `+4%` |
| `docs/design/chapters/02-shediao.md` | 1233 | 君山阵首：丐帮护心法辅运比例 `0.50→0.40`，且失去三运同源 `+4%` |
| `docs/design/chapters/02-shediao.md`；`docs/design/chapters/03-shendiao.md`；`docs/design/catalog/npcs-ch02-shediao.md` | 1229；1518；11 | 黄药师：按当前调和主运，桃花吐纳息与药圃吐纳息均由调和改阴，两门辅运各 `0.50→0.40` |
| `docs/design/chapters/01-tianlong.md` | 1419 | 段延庆：按当前调和主运，段氏养生功辅运比例 `0.50→0.40` |
| `docs/design/chapters/02-shediao.md`；`docs/design/catalog/npcs-ch02-shediao.md` | 1232；12 | 欧阳锋：蛇形吐纳息由阴改调和，辅运比例 `0.25→0.40`；但毒脉护气功仍为阴，故整套装的阴阳相冲风险尚未消除 |
| `docs/design/catalog/skills-bulu-01-tianlong.md` | 34、72 | 段氏养生功仅作段氏养阳诀的前置；重跑前置与修炼节奏校验，性质变化不改前置层数 |
| `docs/design/07-set-system.md` | 460、625 | 九阴调息篇、辟谷气篇仍为九阴正宗成员；复核套装计件，性质变化不改成员清单 |

以上角色配装须由下游统一按 `design/05` §5.2–§5.4 重算辅运贡献、阴阳相冲、三运同源加成及战斗节奏；章节与 NPC 名录中的镜像需同时更新。王府吐纳息在写集外未发现角色配装，只在本册作为段氏养生功与大理长刀前置，故本轮无册外配装交接。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 补主修经脉清单

| 内功 | 补入的 `inner.meridians` | 依据 | 推出性质 |
|---|---|---|---|
| 餐风饮露功 | 足阳明、督脉 | 纳谷耐饥、督脉强脊以耐长途 | 阳 2 / 阴 0 → `yang` |
| 托钵桩 | 督脉 | 立桩强脊（旧裸 `mer_dumai` 规范入字段，不扩脉） | 阳 1 / 阴 0 → `yang` |
| 碧涛玄功 | 任脉、督脉、冲脉 | 潮息往复、攻守相济；冲脉调气血 | 阴 1 / 阳 1 → `harmony` |
| 药圃吐纳息 | 任脉（旧裸 `mer_renmai` 规范入字段，不扩脉） | 黄阶表原记录即任脉；无独立依据支持增补足阳明 | 阴 1 / 阳 0 → `yin` |
| 蛤蟆功 | 督脉、足太阳、足少阳 | 蓄劲贯背、伏地发力与侧身转势 | 阳 3 / 阴 0 → `yang` |
| 逆转经脉 | 任脉、手厥阴 | 逆息归任、由心包收束逆行 | 阴 2 / 阳 0 → `yin` |
| 蛇形吐纳息 | 冲脉（旧裸 `mer_chongmai` 规范入字段，不扩脉） | 黄阶表原记录即冲脉；无独立依据支持增补阴维 | 阴 0 / 阳 0 → `harmony` |
| 枯荣禅功 | 任脉、督脉 | 半枯半荣、守攻相济 | 阴 1 / 阳 1 → `harmony` |
| 天南心法 | 督脉、手阳明 | 鼓动阳气并导向食指出指 | 阳 2 / 阴 0 → `yang` |
| 王府吐纳息 | 任脉（旧裸 `mer_renmai` 规范入字段，不扩脉） | 黄阶表原记录即任脉；无既有设定支持增补督脉、手阳明 | 阴 1 / 阳 0 → `yin` |
| 九阴真经 | 任脉、督脉、冲脉 | 百家兼收、损补相济 | 阴 1 / 阳 1 → `harmony` |
| 易筋锻骨篇 | 足太阴、足阳明、冲脉 | 脾胃运化以易筋锻骨，冲脉调气血 | 阴 1 / 阳 1 → `harmony` |
| 铜尸横练 | 督脉、足太阳 | 贯背固体 | 阳 2 / 阴 0 → `yang` |
| 铁掌心法 | 督脉、手阳明 | 督脉鼓劲、手阳明运掌 | 阳 2 / 阴 0 → `yang` |
| 铁掌桩 | 督脉 | 立桩强脊固腰（旧裸 `mer_dumai` 规范入字段，不扩脉） | 阳 1 / 阴 0 → `yang` |
| 笑弥陀桩 | 督脉、足太阳 | 贯背立桩 | 阳 2 / 阴 0 → `yang` |
| 草原吐纳息 | 督脉、足太阳 | 强脊通背以耐骑行长途 | 阳 2 / 阴 0 → `yang` |

以上依据中涉及原创武学者均沿卡片已有门派风格作**（原创扩展）**；未新增原著引文、回目或招名。

### 7.2 改性质清单

| 内功 | 改前 → 改后 | 连带改动 |
|---|---|---|
| 丐帮护心法 | `yang → harmony` | §0.3、正式卡、`txp_gaibanghuxinfa` 与护体档说明；无绝招 `requiredNature` |
| 桃花吐纳息 | `harmony → yin` | §0.3、正式卡、`txp_taohuatunaxi` 与护体档说明；无绝招 `requiredNature` |
| 白驼吐纳术 | `yin → harmony` | §0.3、正式卡、`txp_baituotunadu` 与护体档说明；无绝招 `requiredNature` |
| 段氏养生功 | `harmony → yin` | §0.3、正式卡、`txp_duanshiyangshenggong`、护体档、`requiredNature:[yin,harmony]`，并重配护脉路线 |
| 九阴调息篇 | `harmony → yin` | §0.3、正式卡、`txp_jiuyintiaoxipian` 与护体档说明；无绝招 `requiredNature` |
| 辟谷气篇 | `harmony → yin` | §0.3、正式卡、`txp_biguqipian`、护体档、`requiredNature:[yin,harmony]`；原路线派生调和，无冲突，无须改体段 |
| 药圃吐纳息 | `harmony → yin` | §0.3、黄阶卡、`txp_yaoputunaxi` 与护体档说明；无招式路线或 `requiredNature` |
| 蛇形吐纳息 | `yin → harmony` | §0.3、黄阶卡、`txp_shexingtunaxi` 与护体档说明；无招式路线或 `requiredNature` |
| 王府吐纳息 | `yang → yin` | §0.3、黄阶卡、`txp_wangfutunaxi` 与护体档说明；无招式路线或 `requiredNature` |

### 7.3 路线改动清单

| 路线 | 改前票 → 改后票 | 替换穴位 | 段数 / CT / 风险 |
|---|---|---|---|
| `mfr_tiebogong_zhenbafang` | 阴4/阳2 → 阴1/阳5 | 燃谷→腰阳关；阴陵泉→巨骨；云门→天宗 | 8 / 640 / 1520，不变 |
| `mfr_hama_fajin` | 阴6/阳3 → 阴3/阳6 | 太渊→腰阳关；太冲→申脉；阴陵泉→足三里 | 10 / 750 / 1580，不变 |
| `mfr_hama_quanjin` | 阴10/阳0 → 阴3/阳7 | 膝关→申脉；大钟→昆仑；血海→外丘；隐白→阳陵泉；曲骨→腰阳关；天泉→命门；郄门→脊中 | 10 / 800 / 1900，不变 |
| `mfr_yiyangzhi_liaoshang` | 阴9/阳0 → 阴1/阳8 | 前 8 段改为申脉、委中、阳陵泉、足三里、腰阳关、命门、天宗、外关 | 10 / 800 / 1900，不变 |
| `mfr_cuixinzhang_liemai` | 阴2/阳4 → 阴4/阳2 | 至阳→中脘；丰隆→地机 | 8 / 600 / 1080，不变 |
| `mfr_tiezhang_hushen` | 阴4/阳3 → 阴3/阳4 | 燃谷→腰阳关 | 10 / 750 / 1450，不变 |
| `mfr_tiezhang_qingtian` | 阴4/阳3 → 阴3/阳4 | 大敦→外丘 | 10 / 800 / 1540，不变 |
| `mfr_lihuaqiang_wudishou` | 阴4/阳2 → 阴2/阳4 | 气海→腰阳关；蠡沟→光明 | 8 / 600 / 1080，不变 |
| `mfr_pojunguitoudao_huishou` | 阴2/阳1 → 阴1/阳2 | 太冲→光明 | 7 / 525 / 910，不变 |
| `mfr_xuanfengsaoyetui_canye` | 阴2/阳1 → 阴1/阳2 | 神门→承山 | 6 / 450 / 750，不变 |
| `mfr_tongshihenglian_yingqiao` | 阴4/阳2 → 阴2/阳4 | 太渊→腕骨；阴陵泉→足三里 | 7 / 525 / 910，不变 |
| `mfr_tiebifangshen_sheshen` | 阴5/阳1 → 阴2/阳4 | 太冲→足三里；太渊→曲池；神门→腕骨 | 7 / 525 / 910，不变 |
| `mfr_huodushanfa_ansuan` | 阴2/阳4 → 阴4/阳2 | 至阳→中脘；丰隆→地机 | 8 / 600 / 1080，不变 |
| `mfr_duanshiyangshenggong_humai` | 阴1/阳5 → 阴7/阳0 | 前 6 段改为交信、复溜、大横、蠡沟、地机、内关 | 7 / 525 / 910，不变 |
| `mfr_xianglong18_zhenjing` | 阴4/阳3 → 阴0/阳7 | 气海→长强；关元→腰俞；中脘→腰阳关；膻中→脊中 | 9 / 765 / 2600，不变 |
| `mfr_eighteen_palms_chain` | 阴4/阳0（冲脉4弃权）→阴0/阳8 | 前 8 段改为关冲、液门、中渚、阳池、少泽、前谷、腕骨、天宗 | 10 / 800 / 1500，不变 |
| `mfr_xianglong18_shenlong` | 阴3/阳1（带脉2弃权）→阴0/阳5（带脉1弃权） | 涌泉→昆仑；太溪→外丘；复溜→申脉；维道→仆参；肩髃→跗阳 | 8 / 760 / 3950，不变 |

表中 CT 为 ΣCT、风险为总 `riskBp`；所有路线 `recovery:1200`，含收招分别为 ΣCT+1200。动作出口段保持不变，或该支援 / 内功路线无动作出口；本册路线的 §0.12.5 逐段风险及 `design/21` §12.1 三路镜像说明均已同步。

### 7.4 `--delivery` 三项计数与命令结果

| 项目 | 改前 | 改后 | 结论 |
|---|---:|---:|---|
| `nature_conflicts` | 16 | 0 | ✅ |
| `inner_missing_meridians` | 17 | 0 | ✅ |
| `inner_nature_conflicts` | 6 | 0 | ✅ |

- ✅ `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-wujue.md`：三项均为 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出码 0；仅保留基线已知未定义 `sk_babuganchan`，新增失败 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：170 项通过。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过；`meridian_flow_sim.py --check`、`projection_sim.py --check` 均通过。
- ✅ `check_skill_catalogs.py --strict --diversity-strict`：89 路 / 89 序列，完全重复与 ≥80% 相似配对均为 0；`check_route_unique_for.py`、`check_undefined_in.py`、`check_nr3_unit.py wujue` 均通过。
- ✅ 文档未缩短（净增 15 行以上）、`git diff --check` 通过，无 `TODO` / “此处省略” / “待补充”占位。

### 7.5 交其他任务的条目

- `design/05` §5.3.1：本册改性清单由 6 门更新为 9 门，并重算汇总计数。
- `chapters/02-shediao` 1226–1227 与 `catalog/npcs-ch02-shediao` 35–36：黑风双煞的桃花吐纳息 `0.40→0.25`，新增无桥接相冲风险。
- `chapters/02-shediao` 1230、1233 与 `catalog/npcs-ch02-shediao` 13：洪七公、君山阵首的丐帮护心法 `0.50→0.40`，失去三运同源 `+4%`。
- `chapters/02-shediao` 1229、`chapters/03-shendiao` 1518 与 `catalog/npcs-ch02-shediao` 11：黄药师两门辅运均由调和改阴，各 `0.50→0.40`。
- `chapters/01-tianlong` 1419：段延庆的段氏养生功 `0.50→0.40`。
- `chapters/02-shediao` 1232 与 `catalog/npcs-ch02-shediao` 12：欧阳锋的蛇形吐纳息 `0.25→0.40`，但毒脉护气功仍令相冲风险存在。
- `catalog/skills-bulu-01-tianlong` 34、72 与 `design/07` 460、625：复核段氏养生功前置及九阴套装计件，性质变化不改前置层数或成员清单。

上述角色配装统一按 `design/05` §5.2–§5.4 复核辅运贡献、相冲、同源加成与配装节奏。`design/21` §12.1 三条降龙路线已在本任务改完，不再交其他任务。

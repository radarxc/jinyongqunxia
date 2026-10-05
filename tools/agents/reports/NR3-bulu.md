# NR3-bulu 报告 · 路线叙事第三轮 · 14 本补录图鉴（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

本单元名下 12 对高相似路线全部采用“改开”，改后 `overlapBp` 均低于 8000，未使用共同传承理由豁免。
共改动 9 条路线：7 条用于拆分高相似集合，2 条用于补足护体 / 蓄气的任督要求；段数、逐段 CT、收招、风险数组和出招方式均保持不变。
全仓高相似配对由 280 对降至 268 对，恰好移除本任务 12 对；没有新造完全相同路线或新的 ≥80% 配对。
射雕、书剑、雪山的过期来源扩展状态及碧血剑金龙帮门派归属已按上游落实情况关闭；7 条性质冲突依任务要求仅登记、不改线。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要改动 |
|---|---:|---|
| `skills-bulu-01-tianlong.md` | 254 | 版本、天山六阳心法路线 / 叙事 / 镜像；复核天阶统计为 `59=9+18+32` |
| `skills-bulu-02-shediao.md` | 363 | 版本、全真周天功路线 / 互异 / 镜像；铁掌神雕来源改为已解决 |
| `skills-bulu-03-shendiao.md` | 414 | 版本、赤练毒功路线 / 叙事 / 镜像 |
| `skills-bulu-04-yitian.md` | 575 | 版本记录 |
| `skills-bulu-05-xiaoao.md` | 483 | 版本、华山紫气诀路线 / 叙事 / 镜像 |
| `skills-bulu-06-xiake.md` | 342 | 版本记录 |
| `skills-bulu-07-bixue.md` | 456 | 版本、两条任督修正及镜像、金龙帮正式门派归属 |
| `skills-bulu-08-luding.md` | 354 | 版本、延平海防心法路线 / 叙事 / 镜像 |
| `skills-bulu-09-liancheng.md` | 192 | 版本记录 |
| `skills-bulu-10-baima.md` | 305 | 版本记录 |
| `skills-bulu-11-yuanyang.md` | 167 | 版本记录 |
| `skills-bulu-12-shujian.md` | 271 | 版本、天池神功路线 / 互异 / 统计 / 测试 / 镜像；百战心法来源改为已解决 |
| `skills-bulu-13-feihu.md` | 392 | 版本记录 |
| `skills-bulu-14-xueshan.md` | 207 | 版本、错脉翻掌路线 / 叙事 / 镜像；两项通行册来源改为已解决 |
| `tools/agents/reports/NR3-bulu.md` | 115 | 本报告：处理证据、数值、遗留项与验收结果 |

14 册图鉴合计 4,775 行；均追加“路线叙事第三轮（2026-09-29）”版本记录。

## 3. 关键结论与数值

- 12/12 个分派配对已改开；改后最高为 6666 bp，低于 8000 bp 门槛。全仓 ≥80% 配对 `280 → 268`，新增配对 0，完全相同路线 0。
- 9 条改线均未缩短：8 段路线仍为路线 720 CT、收招后合计 1920 CT；10 段路线仍为路线 800 CT、合计 2000 CT。
- 风险数组、风险位置及逐段 CT 均未改变。风险总和：天山六阳 1640，华山紫气 1540，全真三元 1440，赤练 / 延平 / 错脉 / 天池各 1360，金龙 / 明宫各 1080。
- `--delivery` 普通违规 `2 → 0`，两项均为护体 / 蓄气缺少任督；拳 / 擒拿末端、位移核心脉、非绝招外放端点与其他末端违规均为 `0 → 0`。
- 14 册没有人声音功招式或 `voice` 候选，故没有机械补标 `ProjectionInput.voice`。
- 已关闭来源状态：`sk_tiezhang → ch03_shendiao`（五绝册 9 品残承）、`sk_baizhanxinfa → ch12_shujian`、`sk_baizhanxinfa / sk_pojunqiangfa → ch14_xueshan`（通行册）。
- `sk_jinlongbangxinfa` 已改用正式 `sect_jinlongbang`，门派 3 级硬门槛与卡片字段同步。

## 4. 开放问题（附默认值）

1. **任督 / 奇经混合路线如何判定性质**：等待协调者确认 `design/21` §2.4 是“出现即取 harmony”的字面读法，还是按路线组成计票。默认值：本轮保持现状，只报告、不为性质改线。命中 7 条：`mfr_tianshanliuyangxinfa_guiyuan`、`mfr_lutouzhangfa_hengjue`、`mfr_bukuhutiaogong_hushen`、`mfr_fansenghutigong_jingang`、`mfr_pingxixingqijue_lianzhen`、`mfr_hujiaxuangong_guanshan`、`mfr_nanhaiwuhuxinfa_guichao`。
2. **其余来源扩展登记**：本任务涉及的四项均已有明确上游落点。默认值：维持“已解决”，不重新打开待决项。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NR3-BULU-P01 | 在基准 / `design/21` §2.4 明定混合任督、奇经时，性质是按“出现即 harmony”还是按成分计票，并给一条正反例。 | 当前两种读法分别约命中 25 与 104 条；不澄清会让同一路线随检查器解释改变性质。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/21-*` | §2.4 | 作者拍板后写明性质判定算法，并同步检查器；本轮 7 条只登记。 |
| `TODO.md` | NR3 进度 / 冲突追踪 | 由调度器登记 NR3-bulu 的 12 对均已改开、无新增高相似配对。 |
| 其他配对侧图鉴 | 对应路线 | 无需改动；本任务只改分派侧，12 对均已低于阈值。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

穴位变更集：A＝天池神功移除涌泉、太溪、委中、命门、足临泣、维道、带脉、膻中，加入然谷、大赫、石门、神阙、腰俞、身柱、间使、大陵；B＝华山紫气移除足三里、丰隆、天枢，加入金门、阳交、天髎；C＝全真三元移除会阴、中极，加入金门、阳交；D＝赤练毒火移除太溪、太冲，加入然谷、行间；E＝错脉翻掌移除青灵、尺泽，加入郄门、间使；F＝延平镇舱移除足三里、曲池，加入章门、中脘；G＝天山六阳移除横骨、四满、章门，加入阴都、腹通谷、膻中。

| 配对（本侧 / 另一侧） | 改前 bp | 处理方式 | 改动穴位 |
|---|---:|---|---|
| `mfr_tianchishengong_guiyuan` / `mfr_tianlongchanbu_tuili` | 10000 | ✅ 改开至 0 | A |
| `mfr_tianchishengong_guiyuan` / `mfr_gumuqinggong_youshen` | 8750 | ✅ 改开至 0 | A |
| `mfr_huashanziqijue_guiyuan` / `mfr_shangjiabaoqi_tieting` | 8750 | ✅ 改开至 5000 | B |
| `mfr_quanzhenzhoutiangong_sanyuan` / `mfr_huashanziqijue_yingfeng` | 8750 | ✅ 改开至 6250 | C |
| `mfr_tianchishengong_guiyuan` / `mfr_lingbo_jiangfei` | 8750 | ✅ 改开至 0 | A |
| `mfr_tianchishengong_guiyuan` / `mfr_pojunqiangfa_xianzhen` | 8750 | ✅ 改开至 0 | A |
| `mfr_tianchishengong_guiyuan` / `mfr_shexinglifan_baibian` | 8750 | ✅ 改开至 0 | A |
| `mfr_tianchishengong_guiyuan` / `mfr_taixuan_shibu` | 8750 | ✅ 改开至 0 | A |
| `mfr_chiliandugong_duhuo` / `mfr_jinsheyouzhang_chanshen` | 8333 | ✅ 改开至 6666 | D |
| `mfr_cuomaifanzhang_fanmai` / `mfr_sanhuajudingzhang_juding` | 8333 | ✅ 改开至 5000 | E |
| `mfr_yanpinghaifangxinfa_zhencang` / `mfr_shexinshu_mihun` | 8333 | ✅ 改开至 5000 | F |
| `mfr_tianshanliuyangxinfa_guiyuan` / `mfr_taohuaguiyuanjue_guanchao` | 8000 | ✅ 改开至 5000 | G |

### 7.2 `--delivery` 命中数

| 规则 | 改前 | 改后 | 结果 |
|---|---:|---:|---|
| 拳 / 擒拿末端 | 0 | 0 | ✅ |
| 位移核心脉 / 涌泉 | 0 | 0 | ✅ |
| 护体 / 蓄气含任督 | 2 | 0 | ✅ 修正金龙定桩、明宫拱卫 |
| 非绝招外放合法端点 | 0 | 0 | ✅ |
| 其他普通 / 动作末端违规 | 0 | 0 | ✅ |
| 路线性质冲突 | 7 | 7 | ⚠️ 按任务要求只报告 |

### 7.3 改过的路线清单

| 路线 | 段数 | 路线 CT / 含收招 | 总风险 | CT / 风险变化 |
|---|---:|---:|---:|---|
| `mfr_tianshanliuyangxinfa_guiyuan` | 10 | 800 / 2000 | 1640 | 无 / 无 |
| `mfr_huashanziqijue_guiyuan` | 10 | 800 / 2000 | 1540 | 无 / 无 |
| `mfr_quanzhenzhoutiangong_sanyuan` | 8 | 720 / 1920 | 1440 | 无 / 无 |
| `mfr_chiliandugong_duhuo` | 8 | 720 / 1920 | 1360 | 无 / 无 |
| `mfr_cuomaifanzhang_fanmai` | 8 | 720 / 1920 | 1360 | 无 / 无 |
| `mfr_yanpinghaifangxinfa_zhencang` | 8 | 720 / 1920 | 1360 | 无 / 无 |
| `mfr_tianchishengong_guiyuan` | 8 | 720 / 1920 | 1360 | 无 / 无 |
| `mfr_jinlongbangxinfa_dingzhuang` | 8 | 720 / 1920 | 1080 | 无 / 无；石关、幽门 → 气海、关元 |
| `mfr_minggonghuyuangong_gongwei` | 8 | 720 / 1920 | 1080 | 无 / 无；风府、哑门 → 神道、百会 |

### 7.4 门禁、范围与交接

- ✅ `check_ids.py --strict`：新严格失败 0（仅输出允许的既有 README 基线项）。
- ✅ 单元测试：145 项通过；`damage_sim` 47 项、`meridian_flow_sim`、`projection_sim` 均通过。
- ✅ 图鉴严格 / 多样性检查：124 条路线；选定图鉴内 ≥80% 配对 0。`check_route_unique_for.py` 完全相同路线 0。
- ✅ `check_undefined_in.py`：未定义引用 0。`check_nr3_unit.py bulu`：12 对已处理、未处理 0、新造 ≥80% 配对 0。
- ✅ 14 册路线正文与镜像均同步“见文首索引”、段数、路线 CT、收招合计、风险列表和总风险；无截断、占位或未闭合代码块，`git diff --check` 通过。
- ✅ 修改范围仅为 14 册指定图鉴与本报告；未改基准、`TODO.md` 或配对另一侧。
- **交其他任务的条目**：无。12 对均通过本侧改线降至阈值以下，另一侧无需为本轮配对再调整；7 条性质冲突交统一裁定任务处理。

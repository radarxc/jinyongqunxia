# NAu-21 报告 · 终审·21 号文档回填与参考实现

## 1. 摘要（3–6 行）

- 已将 21 号文档升至 v2.6，按 Canon v1.3–v1.7 及 05 / 06 / 09 / tech-04 / tech-05 回填正式前缀、Buff、字段、乘区和时序。
- 已收口绝招取值判据、四门整门外放锚点、降龙三绝招路线、神雕人物地位次序，以及生产构建禁用地位下限兜底。
- 已强化 MF-T17、MF-T23、MF-T24 可执行断言，并为 `boss_pacing.py` 的所有估算输出补 `estimateOnly=true`；原 golden 未改动。
- 九项指定验收全部退出 0；delivery 的仓库既有提示不含 21 号文档，ID 严格检查本任务新增失败为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/21-meridian-flow-and-moves.md` | 2311 | v2.6；§4 绝招 / 外放；§6.2 降龙；§8–§9 Buff；§11.9.1 首领闸门；§12 / §16 schema；§17 用例；§18 状态收口 |
| `tools/balance/meridian_flow_sim.py` | 1200 | `--check` 接入 MF-T17；公共 API 与 golden 生成逻辑不变 |
| `tools/balance/ultimate_rotation_sim.py` | 108 | 分层可用绝招函数、7 / 9 / 10 解锁、CT、F2 / E2 冷却与禁重复夹具 |
| `tools/balance/projection_sim.py` | 447 | 音功普通 / 外放 Z5M 分支、人声音功端点、MF-T23 / MF-T24 正反例 |
| `tools/balance/boss_pacing.py` | 371 | 所有离线估算输出 `estimateOnly=true`，并由 `--check` 断言 |
| `tools/agents/reports/NAu-21.md` | 108 | 本报告、验收证据与写集外交接 |

## 3. 关键结论与数值

1. `mfr_* / qnl_* / dxl_* / txp_*` 已是 Canon §12 正式前缀；运行时只写 `bf_shouqin`、`bf_xueweishoufeng`，旧 `bf_chanrao / bf_fengxue / bf_fengnei / bf_fengjingmai` 仅可由存档加载器读取并迁移。
2. 天中 / 地中区间取上限的唯一判据为 `F=2 && M>=1 && F+M+T>=5`；否则分别取 2 / 1。九品玄已按玄上 grade 6 结案。
3. 降龙三绝招为：震惊百里 9 段，`1200+9×85=1965 CT`；十八掌连环 10 段，`1200+10×80=2000 CT`；神龙摆尾 8 段，`1200+8×95=1960 CT`。三路仅共享末端内关、劳宫。
4. 同门绝招在 F2 原子支付并写 `ultimateCooldown=1`；当次 E2 不减，下一次自身正常行动结束后归零；冷却归零仍禁止连续选择同一 `moveId`。
5. 神雕地位次序落实为金轮 `11/8` < 五绝 `11/9` < 杨过 `12/9`；射雕五绝为 `10/9`。陈家洛、苗人凤、胡斐为 `9/9`，瓦耳拉齐、马家骏为 `9/8`。
6. 地位下限只作校验目标：无合法真实主运 `sk_*` 时生产构建以 `TS-CONTENT-BOSS-021` 阻断；只有离线 `boss_pacing.py` 可读取旧估值并输出 `estimateOnly=true`。
7. 音功 0 档固定 `projectionBoostActive=false`、基础范围、0 增耗、普通 Z5M；1 / 2 档才使用外放曲线、+2 / +4 格与 200 / 400 bp MPREF。`MPREF=12345` 时增耗为 247 / 494。
8. 人声发劲可取天突 / 廉泉，持乐器音功仍取 13 个手 / 腕端点；大手印只有落点掌风是 `projected` 伤害段，跃迁不造第二伤害段。

## 4. 开放问题（附默认值）

| 开放问题 | 本次默认值 |
|---|---|
| AR-16 范围、耗内与外放曲线是否最终定值 | 继续执行 Canon v1.5 默认：+0 / +2 / +4 格、0 / 200 / 400 bp MPREF、Z5M 6500–22000；保留作者确认入口 |
| 音功 0 档是否连 `DamageKind` 一起改 | 不改；静态仍为 `projected`，护体内劲仍按 40% 适用，仅切普通 Z5M、基础范围和零增耗 |
| 待机预置轻防额度 | 继续用 3 段 / 240 CT，待实战验证反应密度 |
| 手机经脉子预算 | 继续采用 §11.8 建议值；三档真机结果仍标 **（待实测）** |
| 原著招名与情节 | 继续按三联 / 广州修订版列 **（待考）**，未核实前不增加引文或回目号 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 / 状态 |
|---|---|---|
| M5-P01 / M5-P02 | Boss 主运最低目标、地位下限、七参同源和 21 / 各章分工 | **已由 Canon v1.7 V17-03 / V17-04 接纳**；不再作为开放提案 |
| NR0-P01 | 跨武学绝招路线不得完全同序列、重合 ≥80% 人工复核 | **已由 Canon v1.7 V17-06 接纳**；不再作为开放提案 |
| 无新增提案 | 本任务其余改动均为既有 V13-02～07、V14-01、V15-01～04、V16-03、V17-01～07 的回填 | 不另造重复规则或编号 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/chapters/14-xueshan.md` | §12.6 及胡斐 / 苗人凤行 | 用补录册真实 `sk_hujiaxuangong` / `sk_miaojiaxuangong` 主运替换“缺 9 品主运 / 地位下限兜底”旧行并重跑节奏 |
| `docs/design/catalog/skills-xiaoyao.md` | `sk_dashouyin`、外放审计表 | 把 `mv_dashouyin_dashouyin` 改为逐招外放，补三档范围和合法端点；只让落点掌风成为伤害段，删除“已审不标”旧结论 |
| `docs/design/catalog/skills-shaolin.md`、`skills-wujue.md`、`skills-wuyue.md`、`skills-general.md`、`skills-qianlong.md`、`skills-xiaoyao.md` | §18.6 所列音功逐招 | 按伤害段逐招改标 / 复核并接音功 0 档；纯支援、纯控制、实体笛 / 箫招保持非外放 |
| `docs/design/04-damage-formula.md` | 音功外放分支 | 交 NAu-rulesB：补 0 档普通 Z5M / 基础范围 / 零外放增耗口径 |
| `docs/design/05-martial-arts-system.md`、`docs/tech/04-data-pipeline.md` | 音功字段、MF-V16 / MF-V17 | 交 NAu-nxt：补音功与人声判定字段，并登记 MF-V16 / MF-V17；tech/04 当前只有 MF-V13～V15 与 MF-V14 人声端点例外 |
| 各章仍出现旧兜底的历史或现行文字 | `chapters/02-shediao.md`、`06-xiake.md`、`13-feihu.md`、`14-xueshan.md` | 已解决项保留追溯但明确不得进入生产 IR；14 的现行配表必须实际替换，不能只改说明 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 处理总表（按 21 的节）

| 21 节 | 处理结果 |
|---|---|
| §0 | ✅ 恢复 v2.1，并保留 v2.3 / v2.4 / v2.5 摘要；新增 v2.6 版本和终审变更记录 |
| §4.2–§4.3 | ✅ 逐字照录作者天中 / 地中判据并引 V17-01；九品玄结案；7 / 9 / 10 解锁与 F2 / E2 共享冷却 |
| §4.4.1、§4.5 | ✅ 四门按 V17-07 记为整门外放锚点且字段仍逐招落表；音功分支、人声 / 乐器端点、反击范围、`range.max` 与 F2 原子支付闭合 |
| §4.8、§6.2、§12.1 | ✅ 接 `bf_hutineijin` 投影边界；降龙 18 / 19 外放标记、图鉴路线优先级与三绝招内关→劳宫路线闭合 |
| §8.6、§9.5–§9.6、§12.3、§16 | ✅ 正式 Buff / 前缀 / `acupointRef` / `outOfBattleScaleBp` 回填；`bf_jianyi` 仅免疫 `cc.bind`；旧 Buff 仅存档加载器读 |
| §11.6、§11.9.1 | ✅ F0 / F1 / F2 / E2 术语统一；V17-04 生产阻断、V17-05 神雕次序与补位名词更新 |
| §17 | ✅ MF-T19 改为 10 段夹具；MF-T17 / T23 / T24 描述与实现一致 |
| §18 | ✅ M5-P01 / P02、NR0-P01 改记 v1.7 已接纳；如实标出 04 / 05 / tech-04 音功分支未完成，未夸大同步状态 |

### 7.2 参考实现新增断言

- ✅ `meridian_flow_sim.py --check` 调用 `ultimate_rotation_sim.run_checks()`：`available_ultimates(layer)` 断言 6 重为空、7 / 8 重仅连环、9 重增加神龙、10 重三招齐备，并验证 V9 的首招 `≤7`、后二招 `9 / 10`；同时覆盖路线、CT、F2 / E2 冷却与禁连用。
- ✅ `projection_sim.py` MF-T23：断言音功 0 / 1 / 2 档的激活位、范围 3 / 5 / 7、增耗 0 / 247 / 494、普通 / 外放 Z5M 二选一，且天突 / 廉泉只对人声音功开放。
- ✅ `projection_sim.py` MF-T24：以图鉴真实 8 段路线验证正确夹具，并断言跃迁带伤害、掌风非 `projected`、两个伤害段、路线无手 / 腕端点四种反例均抛错。
- ✅ `boss_pacing.py --check` 断言所有离线节奏估算均输出 `estimateOnly=true`，避免结果流入发布 IR。
- ✅ 未改写 `meridian_flow_golden.json`；`meridian_flow_sim.py` 保持 1200 行，`boss_pacing.py`、`projection_sim.py`、`damage_sim.py` 的导入链通过。

### 7.3 交其他任务

- ⚠️ NAu-rulesB：在 `design/04` 补音功 0 档普通 Z5M、基础范围、零外放增耗分支。
- ⚠️ NAu-nxt：在 `design/05` 补音功 / 人声判定字段，在 `tech/04` 补 MF-V16 / MF-V17；当前 tech/04 已有 MF-V13～V15 与 MF-V14 人声端点例外。
- ⚠️ NXfix：完成 §18.6 所列音功逐招改标，并修正 `skills-xiaoyao.md` 的大手印旧 `not_projected` 结论；本任务因写集限制只提供规则与夹具。
- ⚠️ NXfix-chapters：把 `chapters/14-xueshan.md` 胡斐 / 苗人凤旧兜底替换为补录册真实主运，并清理其他章节仍可能被解析为现行输入的兜底措辞。
- ✅ 决策 / 基准维护：NAu-canon 已同步 `author-requirements.md`，Canon v1.7 V17-03 / V17-04 / V17-06 已接纳 M5-P01 / P02、NR0-P01；21 已回填。
- ⚠️ 发布流程：决定何时把 `check_skill_catalogs.py --diversity-strict` 纳入常态 CI；现行 `--strict` 兼容语义不变。

### 7.4 命令验收

| 命令 | 最终结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；111 文件、13,845 定义；仅既有 baseline `sk_babuganchan`，new=0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 126 tests，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 checks passed；known deviations=0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ passed，含 MF-T17 |
| `python3 tools/balance/boss_pacing.py --check` | ✅ passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ passed，含 MF-T23 / MF-T24 |
| `python3 tools/lint/check_skill_catalogs.py --strict` | ✅ 25 catalogs，errors=0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details` | ✅ 退出 0；本任务可写文件命中 0；仓库既有 125 条图鉴提示含写集外大手印路线，已在 §7.3 交接 |
| `git diff --check` | ✅ 通过 |

- ✅ 仅改允许写集；未修改 Canon、TODO、05 / 06 / 09 / tech 或图鉴。
- ✅ 无截断句、未闭合代码围栏或占位词；旧 ID 只留在明确迁移 / 禁止语境；未新增生产内容 ID。

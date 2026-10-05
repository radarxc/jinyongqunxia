# NAu-nxt 报告 · 终审·NXT 同步（05 / tech 04 / tech 05 / 检查脚本：天阶 59、补录定义源、音功分支与端点）

## 1. 摘要（3–6 行）

本任务已把 Canon v1.6 V16-01～V16-04 与 `design/21` v2.6（`f62de7d`）的 NXT / `voice` 口径同步到 05、tech/04、tech/05 和图鉴检查器。
普通天阶严格改为 `59=9+18+32`；11 册 `51/169/459/459=1,138` 只保留为历史基线，含补录低三阶总量不猜数。
音功 0 档、`projectionBoostActive` 判定点、大手印单伤害段、MF-V14 / V16 / V17 及补录图鉴扫描契约均已闭合。
lint 保持旧 `--strict` 语义，并以只报告方式接入 `voice` 端点、玄上提示及 delivery (a)～(f)；全部要求的 strict、145 项单测和三套平衡检查通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要产出 |
|---|---:|---|
| `docs/design/05-martial-arts-system.md` | 3,022 | v1.6 变更记录；§4.1 / §4.2.2 `voice`、外放字段与音功分支；§11.1 正式定义源；§14 天阶 59、11 册基线与书界池；V38～V41、T37～T39、P-16 |
| `docs/tech/04-data-pipeline.md` | 1,973 | v1.6；完整 `skills-*.md` importer；59 门与书界池门禁；MF-V14 / V16 / V17；`voice` schema、诊断码与 CI 契约 |
| `docs/tech/05-gameplay-engine.md` | 2,380 | v1.6；F0 `projectionBoostActive`；F0～F7 顺序；大手印“两阶段、一伤害段”；D-13 / D-14 |
| `tools/lint/check_skill_catalogs.py` | 2,875 | strict 兼容提示；`voice` 字段优先端点；delivery (a)～(f) 及独立 JSON 计数 / 明细 |
| `tools/lint/test_check_skill_catalogs.py` | 1,478 | strict 三类兼容 fixture、`voice` 三态、(a)～(f)、紧凑卡与前置链回归、JSON 分栏与正式白名单结构断言 |
| `tools/lint/README.md` | 332 | strict 旧语义、`voice` 回退、(a)～(f) 分类与只报告约定 |
| `tools/agents/reports/NAu-nxt.md` | 本报告 | 处理、数值、开放项、交接与验收证据 |

## 3. 关键结论与数值

1. 现行普通天阶为 `59 = 天上 9 + 天中 18 + 天下 32`，相对 11 册基线 `51=8+15+28` 净增 8；注明“作者决定扩容（2026-09-28）”。
2. 门派图鉴 11 册仍只作为 `51/169/459/459=1,138` 历史基线。`skills-bulu-NN-*.md` 已与门派册同列正式定义源；地 / 玄 / 黄和总量须待 NXfixC 收口后由 NAu-final 机器重算。
3. 完整原生池门禁为高武 `6–18`、中武 `1–6`、低武 `0–2`；高武四界锚点为天龙 17、射雕 16、神雕 18、倚天 13，中武笑傲为 6。完整来源省略 `lineageGrade`，残承才携带该字段，并按 `nativeTo` / 书界及全局 `sk_*` 去重。
4. 音功派生式为 `projection && (!sonic || projectionStep >= 1)`。音功 0 档得到 false，使用普通 Z5M、基础范围和 0 增耗；1 / 2 档得到 true，使用审核范围、200 / 400 bp MPREF 与外放 Z5M。静态 `projected` 和护体内劲 40% 不变。
5. `projectionBoostActive` 只在 F0 的纯 `projectProjection` 判定并冻结；F1 后不得按距离、命中、伤害类别或资源重判。F2 原子付费，F3～F5 提交路线，F6 二选一执行唯一 Z5M，F7 按静态伤害类别结算护体。
6. `mv_dashouyin_dashouyin` 的跃迁阶段不建 `AttackFrame`；落点掌风是唯一 `projected` 语义伤害段。多目标只展开该段的 frame，不产生第二路线、第二伤害段或第二 Z5M。
7. MF-V14 保留普通伤害招的 attack 路线硬要求；仅 `kind:stance + target:self + projection:true + 主动阶段无伤害 + 伤害只来自 stanceCounter` 的外放反击架势可沿唯一 defense 路线，且仍须命中合法外放端点。
8. `ProjectionInput.voice = (MoveDef.voice === true)`，只与 `sonic && projection:true` 联用且不参与 `projectionBoostActive`；`voice:true` 而无 `sonic` 触发 `TS-CONTENT-MFR-013`。人声可取天突 / 廉泉，其余外放招及持乐器音功仍使用原 13 个手 / 腕端点。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 当前处置 |
|---|---|---|
| `NAu-nxt-O01` | 含补录的地 / 玄 / 黄及全目录总量 | 不设硬编码猜测值；构建报告按实际扫描分阶输出，NXfixC 收口后由 NAu-final 回填 |
| `NAu-nxt-O02` | 何时把玄上未登记穴位升级为 strict error | 当前仅 warning；两条内容债清零并复核后，由 NAu-final 升严 |
| `NAu-nxt-O03` | 何时把 `--delivery` 末端规则升级为发布硬门 | 当前继续只报告、不改退出码；本快照 182 条缺失、19 条位置问题及 101 条性质冲突由图鉴任务清理后另行升门 |
| `NAu-nxt-O04` | `voice` 旧数据何时全部结构化 | 当前 `MoveDef.voice` 字段优先，读不到才回退五项显式人声白名单；图鉴迁移完成后可移除回退 |
| `NAu-nxt-O05` | AR-16 范围、耗内与外放曲线数值待作者确认 | 继续执行 Canon 默认：`+0/+2/+4` 格、0 / 200 / 400 bp MPREF、唯一 Z5M、6500–22000 bp |
| `NAu-nxt-O06` | 21 §2.4 “含任督 / 奇经混合方案”如何解释 | 默认读法 1：按 15 §2.1 逐节点计票，冲 / 带不计，阴阳多数决、平票含 0:0 为调和；读法 2（出现任督或奇经即调和）仅作对照，待作者确认 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 / 状态 |
|---|---|---|
| — | 无新增 Canon 修改提案 | 天阶扩容、补录定义源、音功与大手印边界已由 Canon v1.6 V16-01～V16-04 采纳；本任务只同步消费者与检查器 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `docs/README.md` 武学规模 | 仍称 `1,138` 为正式全目录、普通天级 51 门闭集；改为 11 册基线，并引用现行天阶 59 与低三阶待重算 |
| `docs/design/02-timeline-and-world-tiers.md` §3.4、汇总与 P1 | 高 / 中武仍写 `6–16 / 1–5`；同步 Canon v1.6 的 `6–18 / 1–6` |
| `docs/design/17-sects-compendium.md` 总则、校验与提案 | 多处仍写“天级 51 门闭集”；改为现行 59 门，并保留新增候选不得擅自扩表的原则 |
| `docs/design/20-legacy-inheritance.md` §7.7、提案与开放项 | 多处仍以普通天级 51 为闭集；同步 59，但继续把 `legacy_complete` 视为同 `sk_*` 形态而非新门数 |
| `docs/design/04-damage-formula.md` Z5M / 护体说明 | 接入音功 0 档普通 Z5M、1 档起外放的动态分支；静态 `projected` 与护体 40% 保持 |
| `docs/design/chapters/01-tianlong.md` TL-P06 | 仍写从 51 增至 54 的阶段提案；更新为 Canon v1.6 最终 59，并保留天龙完整池 17 |
| `docs/design/catalog/skills-general.md` / `skills-yitian.md` | 分别把玄上路线中的 `ap_baihui`、`ap_qihai` 改为正式 `ap_dumai_baihui`、`ap_renmai_qihai`；清零后升级 lint 严格级别 |
| `docs/design/21-meridian-flow-and-moves.md` §12.1 | `mfr_xianglong18_shenlong` 仍缺劳宫与合法外放端点；交 NAu-21 修路线 |
| `docs/design/21-meridian-flow-and-moves.md` §18 | NXT-D01 与 §18.6 的 `design/05`、`tech/04` 两行仍写“尚待 NAu-nxt”；交 NAu-final 回填已同步状态 |
| `docs/decisions/ultimate-counts-tianzhong-dizhong.md` | 当前仍有 28 门 8 / 11 品武学未入逐门裁定表提示；复核后登记，不依赖固定行数测试 |
| 各 `docs/design/catalog/skills-*.md` | 按当前 `--delivery --details` 清理 182 条缺失、19 条末三段位置、101 条性质冲突；104 条未分类只在有可靠动作事实时结构化，不猜测 |
| `tools/lint/check_skill_catalogs.py`（NAu-final） | 天 / 地旧“路线行”未登记、重复、段数、CT、风险、recovery 检查因 `route.line` 指向索引行，当前覆盖 0 条；内容清零后应改按 signature / 最终实例行并统一转严格 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 处理总表（按文档 / 脚本）

| 对象 | 要求 | 状态 / 落点 |
|---|---|---|
| `design/05` | 天阶 59、正式补录源、低三阶口径、音功 / 大手印 / `voice` | ✅ §4.1、§4.2.2、§11.1、§14、V38～V41、T37～T39；C14 / C15 同列 11 册快照与现行值，未猜低三阶总量 |
| `tech/04` | 全 glob、59 / 书界池、MF-V14 / V16 / V17、`voice` schema | ✅ 构建门禁、诊断码与 CI 表完成；反击架势例外保持窄条件，`voice` 无 `sonic` 报 MFR-013 |
| `tech/05` | F0 判定与结算顺序、大手印段拆分、`voice` 投影 | ✅ `voice` 只投影到 `ProjectionInput`，不改变 boost 判定；判定不写回状态 |
| `check_skill_catalogs.py` | strict 兼容、音功端点、玄上提示、delivery (a)～(f) | ✅ 旧 strict error / 退出码不变；紧凑卡会保留本招 `MoveDef`，拳类身份不再读取前置链；新增项均只报告且分栏 |
| 单元测试 / README | 结构性 fixture 与使用说明 | ✅ 覆盖 strict 三场景、`voice` 三态、(a)～(f)、紧凑卡同行隔离与杂学前置链；不写死图鉴计数 |

前序报告落入本写集的交接逐项处置如下：

| 来源 | 交接项 | 处置 |
|---|---|---|
| `NXT` §6 | 05 的 59 门 / 定义源 / 音功；tech/05 运行时分支；lint 音功端点 | 已处理：分别落在 05 §4 / §11 / §14、tech/05 F0～F7、lint delivery |
| `NAu-lint` §6 / §7.4 | 05 降龙外放 | 已由 NAu-rulesA 完成，本任务复核 05 v1.6 的三记绝招与伤害招 `projection:true` |
| `NAu-lint` §6 / §7.4 | NAu-O03 临时跨文档降龙映射 | 已处理：MoveDef 在 05、路线在 21，均不在五绝册，保留映射；`projection=True` 与 05 v1.6 一致 |
| `NAu-lint` §6 / §7.4 | CI 追加只报告 `--delivery` | 已处理：tech/04 §11 CI 表与动作末端段已落点，仍不影响 `--strict` |
| `NAu-lint` §6 / §7.4 | `mfr_xianglong18_shenlong` 缺劳宫 / 外放端点 | 不处理（写集外）：交 NAu-21，见 §6 / §7.5 |
| `NAu-lint` §6 / §7.4 | 裁定表 28 门 | 不处理（归属 decisions）：交相应裁定表任务；测试不锁数量 |
| `NAu-lint` §6 / §7.4 | `ap_baihui` / `ap_qihai` | 不处理（图鉴写集外）：交 general / yitian 图鉴任务 |
| `NAu-rulesA` §6 / §7.2 | MF-V14 外放反击架势例外 | 已处理：tech/04 允许 defense 路线但必须命中合法外放端点 |
| `NAu-rulesA` §6 / §7.2 | 05 §14 最终总账 | 部分处理：现行天阶 59 已落；含补录低三阶交 NAu-final 重算 |
| `NAu-tech` §6 / §7.2 | NAu-tech-O01 / P01 | 已解决：音功 0 档、F0 判定点、付费与唯一 Z5M 顺序已闭合 |
| `NAu-tech` §6 / §7.2 | `--delivery` 保持只报告 | 已处理：新增 (a)～(f) 均不进入 strict errors |
| `NAu-tech` §6 / §7.2 | tech/04 §11.2 最终债务数 | 不处理（数据尚在合并）：交 NAu-final 在主检出重跑回填 |
| `NAu-tech` §6 / §7.2 | 21 地位下限兜底 | 不处理（21 归属）：交 NAu-21 |

### 7.2 音功端点判定依据与放行清单

判定顺序为“字段优先、清单回退”：检查器先读招式 `MoveDef.voice`；显式 `true` 即使不在清单也放行天突 / 廉泉，显式 `false` 即使属于清单也不放行；只有字段缺失时才回退 `VOCAL_SONIC_SKILLS`。白名单依据逐项为：`sk_shizihou` 狮子吼（吼）、`sk_jingangnuhou` 金刚怒吼（吼）、`sk_chuanyunxiao` 穿云啸（啸）、`sk_chuanyinsouhun` 传音搜魂大法（人声传音）、`sk_damingzhou` 大明咒（诵咒）。

按 NXT §7.2 候选清单明确排除的持乐器音功为：碧海潮生曲（箫）、七弦无形剑（琴）、笑傲江湖曲（琴箫）、七弦音（琴）、金笛法（笛）、函谷七音（琴箫）；它们与其余外放招仍须命中原 13 个手 / 腕端点。白名单结构测试已验证每个 `sk_*` 都在正式图鉴定义且品阶行标为音功。

### 7.3 末端规则检查命中数（改前 / 改后）

| 快照 | 路线 | 已分类 | 规则检查 | 缺失 | 位置（末三段） | 未分类 |
|---|---:|---:|---:|---:|---:|---:|
| 同一数据改前（工作区基点 `00efc34` 旧脚本） | 653 | 462 | 350 | 127 | 17 | 191 |
| 同一数据改后（本脚本，绝招口径） | 653 | 549 | 600 | 182 | 19 | 104 |

同一数据上的增量来自新分类 / 新规则，不是图鉴变化；本轮收窄拳类身份后，`sk_honghuahuiheji` 因“杂学/阵法”且只有前置武学名含“拳”转入未分类，故已分类、规则检查、缺失各减 1，未分类加 1。人声例外对绝招部分变化为 0（五个白名单武学当前没有 `projection:true` 绝招路线）。非绝招外放与性质冲突另列，不计入上表绝招路线数。NAu-lint 的另一数据快照为 `645 / 454 / 350 / 158 / 25 / 191`，不可与本表直接作代码差值。

未登记穴位由改前 0（signature 未检查）变为只报告 2：玄上 2、天 / 地 0，具体为 `general:mfr_tuinaliaofa_tuigong → ap_baihui`、`yitian:mfr_shenghuoxinfa_huanxing → ap_qihai`；不进入 errors。监督复核还确认天 / 地旧“路线行”检查保持原样，但当前 457 条路线的 `route.line` 均指向无三元组索引行，实际覆盖 0 条。
旧脚本与新脚本已在同一路径 / 同一数据上逐字段比较：全部旧审计字段差异为 0，二者均为 `errors=0`、退出 0；三种 strict 模式只新增摘要列、两条 warning 及 details 展开，符合兼容要求。

delivery (a)～(e) 的本快照命中如下（缺失与 `-tail` 分列）：

| 项 | 命中 / 按册分布 |
|---|---|
| (a) 加粗掌法 | 新识别乾隆 2：鹰扬掌缺劳宫 1，八卦掌通过 1 |
| (b) 拳 / 擒拿 | 缺失 27：道家4、通行1、康熙2、乾隆3、少林3、五绝8、逍遥1、倚天5；`-tail` 2：乾隆1、倚天1 |
| (c) 轻功 / 位移 | 缺失 13：道家4、通行2、古龙3、少林3、倚天1 |
| (d) 内功 / 护体 / 疗伤 | 防守路线缺任督 14：碧血补录2、古龙4、康熙1、五绝1、五岳2、逍遥2、倚天2；虚构丹田 0；既有内功攻击缺失仍为 9 |
| (e) 外放端点 | 绝招外放 37、违规 1：五绝 `mfr_xianglong18_shenlong`；非绝招外放 80、违规 0（道家2、古龙2、康熙2、乾隆1、少林14、五绝32、五岳7、侠客碧血4、逍遥16） |

紧凑卡解析补收 `mv_bizhenqingzhang_qingzhang` 与 `mv_konghegong_konghe` 两条普通外放路线；两者均命中显式覆写路线且端点合法，故只令非绝招外放 `78 → 80`，违规仍为 0，绝招口径与性质冲突总数不变。

(f) 默认读法 1 命中性质冲突 101（绝招 76、非绝招 25）：天龙补录1、倚天补录1、鹿鼎补录3、飞狐补录2、道家16、通行9、少林19、五绝26、侠客碧血2、逍遥18、倚天4。少林 19 条中，18 条没有阳性或督脉节点；`mfr_mohezhi_wuliang` 有 2 个阳性节点，但路线仍由阴性多数判为阴。完整 `mfr_*` 清单由 `--delivery --details` 输出。

(f) 按册清单（基点快照）：

- 天龙补录（1）：`mfr_tianshanliuyangxinfa_guiyuan`。
- 倚天补录（1）：`mfr_lutouzhangfa_hengjue`。
- 鹿鼎补录（3）：`mfr_bukuhutiaogong_hushen`、`mfr_fansenghutigong_jingang`、`mfr_pingxixingqijue_lianzhen`。
- 飞狐补录（2）：`mfr_hujiaxuangong_guanshan`、`mfr_nanhaiwuhuxinfa_guichao`。
- 道家（16）：`mfr_xiantiangong_wuqi`、`mfr_tiangang_guiyi`、`mfr_tongguijian_tonggui`、`mfr_yunvxinjing_hufa`、`mfr_gumuqinggong_youshen`、`mfr_anran_daimu`、`mfr_huzhaojuehushou_juehu`、`mfr_wujixuangongquan_huoshou`、`mfr_shenmen13_shisan`、`mfr_tiyunzong_fuyao`、`mfr_zhenwuqijie_guizhen`、`mfr_sanhuajudingzhang_juding`、`mfr_jinyangong_yanhui`、`mfr_chongyangzhang_diezhang`、`mfr_beidoufuchen_chanchen`、`mfr_furongjinzhen_mianli`。
- 通行（9）：`mfr_pojunqiangfa_cuifeng`、`mfr_yanmengqishe_yanluo`、`mfr_kaimenpiguaquan_kaihe`、`mfr_tianwangbuxin_sanzhen`、`mfr_duanzhenqiang_pozhen`、`mfr_junzhongdao_zhanma`、`mfr_jiebiaodaofa_fenglu`、`mfr_tantui_tongxing_chuaimen`、`mfr_panlonggun_tanshou`。
- 少林（19）：`mfr_jingangbuhuai_jinshen`、`mfr_shizihou_shizihou`、`mfr_tiebushan_gangqi`、`mfr_jinzhongzhao_bupo`、`mfr_shaolinjiuyang_zhoutian`、`mfr_dajingangzhang_dali`、`mfr_xumishanzhang_yading`、`mfr_mohezhi_wuliang`、`mfr_ruyingsuixingtui_yingzong`、`mfr_longzhaoshou_sanshiliu`、`mfr_ranmudaofa_yehuo`、`mfr_jingangfumoquan_fumo`、`mfr_huheshuangxingquan_shuangxing`、`mfr_tongrenhenglian_tongrenxiang`、`mfr_xinyiba_heyi`、`mfr_xiangmochu_pojia`、`mfr_fumosuofa_huanyuan`、`mfr_jingangnuhou_zhenshe`、`mfr_wulangbaguagun_pozhen`。
- 五绝（26）：`mfr_hama_fajin`、`mfr_hama_quanjin`、`mfr_yiyangzhi_liaoshang`、`mfr_tiezhang_hushen`、`mfr_shentuoxueshanzhang_fuzhong`、`mfr_tongshihenglian_yingqiao`、`mfr_huodushanfa_ansuan`、`mfr_pikongzhang_geshan`、`mfr_pikongzhang_liekong`、`mfr_pikongzhang_pikong`、`mfr_pikongzhang_saozhu`、`mfr_xianglong18_diyang`、`mfr_xianglong18_feilong`、`mfr_xianglong18_hongjian`、`mfr_xianglong18_huoyue`、`mfr_xianglong18_jianlong`、`mfr_xianglong18_kanglong`、`mfr_xianglong18_lishe`、`mfr_xianglong18_longzhan`、`mfr_xianglong18_lvshuang`、`mfr_xianglong18_miyun`、`mfr_xianglong18_shicheng`、`mfr_xianglong18_shuanglong`、`mfr_xianglong18_sunze`、`mfr_xianglong18_turu`、`mfr_xianglong18_yuyue`。
- 侠客碧血（2）：`mfr_taxuewuhen_lingxiao`、`mfr_bizhenqingzhang_yixian`。
- 逍遥（18）：`mfr_liuyangzhang_bafu`、`mfr_liuyangzhang_liuyang`、`mfr_baihongzhang_bingjiao`、`mfr_bahuang_duzun`、`mfr_huagong_duwu`、`mfr_huagong_huajin`、`mfr_huoyandao_hufa`、`mfr_huoyandao_fentian`、`mfr_longxiang_banruo`、`mfr_chuanyinsouhun_shixin`、`mfr_fushidu_shidu`、`mfr_duanmaidao_wuhen`、`mfr_huoyandao_duanxiang`、`mfr_huoyandao_fenxin`、`mfr_huoyandao_huolun`、`mfr_huoyandao_liaoyuan`、`mfr_huoyandao_pikong`、`mfr_liuyangzhang_yangsui`。
- 倚天（4）：`mfr_jiuyang_puzhao`、`mfr_duyanfeisha_fengjiang`、`mfr_xunleijianfa_shiliu`、`mfr_yingsheshengsibo_shengsi`。

读法 2（任督 / 奇经任一节点即直接调和）对照仅剩冲突 25：五绝19、逍遥6。本报告数据基于工作区基点 `00efc34`；该点看不到后续 NXfix 各册与 NAu-21 主分支内容，合入后须在主检出重跑。

### 7.4 命令验收

| 命令 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；111 文件、61,482 次出现、13,845 个定义；仅既知 `sk_babuganchan` 基线提示，新增严格失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 / 145 通过；专项 `test_check_skill_catalogs` 89 / 89 |
| `python3 tools/lint/check_skill_catalogs.py --strict` | ✅ 25 册，`errors=0`；未登记穴位提示 2 |
| `python3 tools/lint/check_skill_catalogs.py --strict --details` | ✅ 退出 0；展开两条玄上 warning，无新增 error |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict` | ✅ 退出 0；653 条路线序列各异，573 个 ≥80% 相似对只报告 |
| `python3 tools/lint/check_skill_catalogs.py --delivery` | ✅ 退出 0；绝招 `653/549/600/182/19/104`，非绝招外放 `80/0`，性质冲突 101 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details` | ✅ 退出 0；逐条输出缺端点、`-tail` 与性质冲突清单 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --json` | ✅ 退出 0；原 `routes` 为 653 条绝招，新增 `nonultimate_projection_route_details` 为 80 条；性质冲突另列 101，三组口径未混合 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `git diff --check` | ✅ 通过 |
| 单测技能收尾 | ✅ 仓库无 CI 覆盖率阈值且非 Flux，按规则跳过百分比门禁；`utree flush` 退出 0 |

### 7.5 交其他任务

- ⚠️ NAu-final / NXfixC：合并所有补录后重算地 / 玄 / 黄及全目录总量，回填机器结果；不得从 11 册基线外推。并回填 21 v2.6 §18 的 NXT-D01、§18.6 中 05 / tech04 状态。
- ⚠️ NAu-21：修正 §12.1 `mfr_xianglong18_shenlong`，补劳宫与合法外放端点；另处理其地位下限兜底。
- ⚠️ 图鉴内容任务：用 `--delivery --details` 修正两条玄上非正式穴位 ID，以及 182 / 19 条末端债、101 条性质冲突；104 条未分类项只在证据可靠时补分类。
- ⚠️ NAu-final（升严）：内容债清零后，把 signature 未登记三档提示和 delivery 转严格；同时修复天 / 地旧路线行检查当前覆盖 0 条的问题，按 signature / 最终实例行检查。
- ⚠️ 文档归属任务：同步 §6 中 README、02、04、17、20 和天龙章节的旧口径；本任务因写集限制未修改。
- ✅ 前序交接：NXT 落在 05 / tech/04 / tech/05 的音功分支、MF-V16 / MF-V17 与 `voice`，NAu-rulesA 的 MF-V14，以及 NAu-lint 的端点与玄上检查均已处理；不在本写集的条目已列入 §6。
- ✅ 范围纪律：只修改许可写集，未新增游戏内容 ID，未删除既有待决项，未执行改变仓库状态的 Git 命令。

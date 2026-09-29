# NXfix-xiakebixue 报告 · 终审·收尾（门派图鉴）· 侠客碧血

## 1. 摘要（3–6 行）

完成《侠客行／碧血剑》基础门派图鉴的经脉落地终审，版本升至 v1.3，并保留基础池 `4/12/36/36 = 88` 不变。
按 `design/21` §4.3.1 修复 8 条末端违规路线，并拆分改前唯一一对册内高相似路线；34 条绝招路线最终无末端违规、无全仓完全重复，本册内 ≥80% 高相似为 0 对。
返修再区分 3 条跨册高相似路线；全仓 `--diversity` 中涉及本册的跨册警告由终审改前 63 条降至 37 条，剩余均属本轮未改写路线。
按 `design/05` §4.2 / §4.8 统一 6 记绝招的条件加成乘区，补齐侠客 6 门、碧血 7 门补录入口；14 份补录册没有需回写本册旧卡的来源扩展。
本册无音功或大手印招式，逐招外放复核改标 0 项，既有 6 招外放契约保持不变；全部指定门禁通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-xiake-bixue.md` | 1672 | v1.3 修订记录；绝招显式路线索引；补录入口；§15 外放审计；§17 路线镜像与终审追溯；§19 末端规则校验；§20 已解决事项 |
| `tools/agents/reports/NXfix-xiakebixue.md` | 163 | 本报告：结论、开放项、同步项、来源／外放／遗留／末端规则清单与门禁结果 |

改动只落在任务允许的两个路径；未修改 Canon、项目进度清单、其他图鉴或工具脚本，未执行改变仓库状态的 git 命令。

## 3. 关键结论与数值

| 项 | 终审结论 |
|---|---|
| 基础武学池 | 88 门：天 4、地 12、玄 36、黄 36；侠客／碧血各 44。补录增量侠客 6、碧血 7，不并入基础 88 |
| 绝招 | 天 9、地 13、玄上 12，共 34；正文与索引一致，解锁和配额违规均为 0 |
| 外放 | 6 招：天 3、地 1、玄 2；本轮按音功／大手印新口径复核，改标 0 项 |
| 路线 | 34 条显式绝招路线，34 个不同序列；完全重复 0；本册内 ≥80% 高相似 0 对；跨册警告 63→37 条 |
| 末端规则 | 改前：34 路线、可靠分类 28、缺失 7、末端位置 1、未分类 6；改后：缺失 0、末端位置 0、未分类仍 6 |
| 穴位 ID | 本册 `ap_*` 与 `design/15` 差集为空；未登记穴位 0 |
| 条件倍率 | `mv_taixuan_guiyi 2.65→3.10`；`mv_bizhenqingzhang_yixian 3.15→3.45`；`mv_hunyuanzhang_hezhang 2.95→3.25`；`mv_shenxing_taxi 3.00→3.30`；`mv_jinshejian_nilinhui 2.80→3.10`；`mv_shuangqiangqiangfa_huima 2.95→3.25` |

六条倍率统一按 `power = 3.00 × AF × (1 + Σadj) × Kd × Kp − Σcost`；条件加成不再在投送乘区之后直接相加，标准绝招耗内与收招不重复进入 `Σadj`。路线修改均保持原段数、逐段 CT、风险序列、总 CT、purpose 与绝招标记。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NXfix-XB-O01 | 既有逐项原著考据何时完成 | 沿正文 §20.4 保留 9 项 **（待考）**，不补写未经逐字核对的招名、回目或授艺次序 |
| NXfix-XB-O02 | `design/05` 尚未统一定价的路线适配、多段触发等条目级价值 | 保留正文既有 **【建议值】**，本轮只修正加法／乘法顺序，不扩写全局价表 |
| NXfix-XB-O03 | 6 条 delivery 未分类路线是否强行补类型 | 默认不补；踏雪跳斩、神行两式、阵法、棋子暗器、金蛇锥无法仅凭当前文本可靠归入掌／指／腿／兵器／内功，按规则保留未分类而不篡改动作事实 |
| NXfix-XB-O04 | 明代宫禁补录是否建立正式门派章节 | 默认不建；仅在总览链接 `skills-bulu-07-bixue.md`，沿补录册既定“宫禁来源标签”处理 |
| NXfix-XB-O05 | 本册既有 O-2～O-9 | 全部沿正文 §20.5 的默认值；其中 O-8 已依 Canon v1.3 V13-05 / V13-C01 改写为已解决 |
| NXfix-XB-O06 | 条件加成口径需跨册统一 | 本册默认按 05 §4.2 字面式 `3.00×AF×(1+Σadj)×Kd×Kp−Σcost`（乘法）处理；若协调者改定加法式，则按下列清单回退 |

若统一改为 `(3.00+Σadj)×AF×Kd×Kp−Σcost`，本册 6 招的显示倍率按 0.05 档回退如下：

- `mv_taixuan_guiyi`：`(3.00+0.30)×0.85−0.20=2.605≈2.60`。
- `mv_bizhenqingzhang_yixian`：`(3.00+0.15)×1=3.15`。
- `mv_hunyuanzhang_hezhang`：`(3.00+0.15)×1−0.06−0.15=2.94≈2.95`。
- `mv_shenxing_taxi`：`(3.00+0.15)×1−0.15=3.00`。
- `mv_jinshejian_nilinhui`：`(3.00+0.15)×1−0.15−0.20=2.80`。
- `mv_shuangqiangqiangfa_huima`：`(3.00+0.15)×1−0.20=2.95`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NXfix-XB-P01 | 无新增基准修改提案 | 末端规则、外放口径、条件加成乘区、ID 前缀与图鉴实例归属均已由 Canon v1.3–v1.6、`design/05`、`design/21` 覆盖 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/catalog/skills-wujue.md` | `sk_tiezhang.sourceChapters` | 按 NXB02 加入 `ch03_shendiao`；优先登记“神雕残承”，避免神雕完整原生天阶池由 18 超上限到 19。本册不含 `sk_tiezhang`，未越权修改 |
| `docs/design/catalog/skills-general.md` | `sk_baizhanxinfa`、`sk_pojunqiangfa` | 分别落实 NXB12 / NXB14 的 `ch12_shujian`、`ch14_xueshan` 来源扩展；均不归本册 |
| `docs/design/catalog/skills-yitian.md` | 九阳神功与武当截脉手 | `innerGuard.reflectBp:1200→0` 并改层数投影；点环跳指招落指端；本册无对应 ID |
| 其他 NXfix 门派册 | 各自点名遗留 | 碧涛玄功／易筋锻骨段数，焚天及北冥／小无相／化功／龙象／乾坤路线，康熙／乾隆／古龙／少林 purpose 与镜像，五绝降龙外放 39→42，太岳石碑手装备兼容，通行／乾隆穴位 ID 等由对应写集处理 |
| 全部门派图鉴 | 绝招条件加成核算 | 协调者需统一乘法式或加法式；本册当前采用 05 §4.2 字面乘法式，若改定加法式则按 §4 NXfix-XB-O06 的 6 招算式同步回退 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单（逐条）

| 来源 | 登记项 | 本册处理 |
|---|---|---|
| NXB01 天龙 | 无 | ✅ 无需处理 |
| NXB02 射雕 | `sk_tiezhang → ch03_shendiao` | ✅ 判定不属本册；交 `skills-wujue`，建议按“神雕残承”登记 |
| NXB03 神雕 | 无 | ✅ 无需处理 |
| NXB04 倚天 | 复用项已含倚天 | ✅ 无需处理 |
| NXB05 笑傲 | 无 | ✅ 无需处理 |
| NXB06 侠客 | 六门均为新卡且已含 `ch06_xiake` | ✅ 在本册 §2／§3 加补录入口；不改旧卡 `sourceChapters` |
| NXB07 碧血 | 七门均为新卡且已含 `ch07_bixue` | ✅ 在 §8／§9／§10／§12／§13 加入口；明宫在 §1 总览单列入口；不改旧卡来源 |
| NXB08 鹿鼎 | `sk_dashouyin` 已含鹿鼎 | ✅ 无需处理 |
| NXB09 连城 | 无 | ✅ 无需处理 |
| NXB10 白马 | 无 | ✅ 无需处理 |
| NXB11 鸳鸯 | 无；另有装备兼容桥 | ✅ 无来源回写；装备桥不属本册 |
| NXB12 书剑 | `sk_baizhanxinfa → ch12_shujian` | ✅ 判定不属本册；交 `skills-general` |
| NXB13 飞狐 | 无 | ✅ 无需处理 |
| NXB14 雪山 | `sk_baizhanxinfa`、`sk_pojunqiangfa → ch14_xueshan` | ✅ 判定不属本册；交 `skills-general` |

结论：14 份补录图鉴均已审阅；需要修改本册旧武学卡的来源扩展为 0。`sk_tiezhang` 不在本册，按任务要求跳过正文修改。

### 7.2 改标外放清单

| 检查项 | 结果 |
|---|---|
| 音功新口径 | ✅ 本册无碧海潮生曲、穿云啸、七弦无形剑、笑傲江湖曲、金笛法或其他音功，改标 0 项 |
| 大手印跃击掌风 | ✅ 本册无大手印，改标 0 项 |
| 既有逐招审计 | ✅ 仍为 6 招外放；六条均有 `projection:true`、三档 spread、`DamageKind:projected` 与合法 attack 路线端点 |
| 统计同步 | ✅ §15.4 继续为天 3／地 1／玄 2／黄 0，不因本轮口径虚增 |

### 7.3 遗留处理表

| 遗留 | 处理 | 结果 |
|---|---|---|
| 九阳反震、武当点环跳 | 本册无对应武学 | 交其他任务 |
| 29 记段数异常、焚天／北冥等路线 | 本册无点名武学 | 交其他任务 |
| 条件加成加法／乘法混用 | 修正本册 6 记绝招并同步显示倍率 | ✅ 已解决，算式见 §3 |
| 康熙／乾隆／古龙／少林 purpose 与过期镜像 | 本册无对应条目 | 交其他任务 |
| 未登记穴位 ID | 将本册全部 `ap_*` 与 `design/15` 做集合差 | ✅ 差集为空 |
| 五绝降龙十八掌 | 本册无该武学 | 交五绝任务 |
| 太岳石碑手 `altItems` | 本册无该武学 | 交康熙任务 |
| 补录索引 | 对确有补录的体系加入对应册入口；明宫在总览单列 | ✅ 已解决 |
| `mfr_taixuan_shibu` 与 `mfr_shenxing_taxi` 高相似 | 神行踏隙改为阳跷／足阳明／足少阳起势，太玄保留足少阴图意 | ✅ 90%→低于 80% |
| 三条返修路线的跨册高相似 | 上清归真换百会／阳池；神行踏隙换命门／肾俞／天柱；金蛇狂舞换期门及曲池／阳溪／阳池 | ✅ 点名的 6 条跨册警告全部消除；未新增本册内或跨册警告 |
| 过期“拟登记”状态 | 依 Canon v1.3 V13-05 / V13-C01 改为已登记前缀、实例归图鉴 | ✅ 已解决并保留 M2-P01 追溯 |

### 7.4 末端规则命中数（改前 / 改后）

| 指标 | 改前 | 改后 |
|---|---:|---:|
| 绝招路线 | 34 | 34 |
| 可靠分类 / 已检查规则 | 28 / 28 | 28 / 28 |
| 缺失关键末端 | 7 | 0 |
| 关键末端位置错误 | 1 | 0 |
| 无法可靠分类 | 6 | 6 |
| 完全相同路线 | 0 | 0 |
| 本册内 ≥80% 高相似路线对 | 1 | 0 |
| 跨册 ≥80% 警告（全仓 `--diversity` 中涉及本册） | 63 | 37 |

修正路线：`mfr_xiakedaozhangfa_heyin`、`mfr_jinshejian_kuangwu`、`mfr_bizhenqingzhang_yixian`、`mfr_wuwangshengong_weide`、`mfr_ruanhongzhusuo_luowang`、`mfr_liangyijianfa07_huanzhuan`、`mfr_shuangqiangqiangfa_huima`、`mfr_shangqingjianfa06_guizhen`；另为多样性调整 `mfr_shenxing_taxi`。剩余 37 条跨册警告均涉及本轮未改写路线，留待后续叙事审校。

### 7.5 交其他任务

- `skills-wujue`：`sk_tiezhang` 增加神雕来源时按残承处理；降龙三绝招 AR-16 / V-P01 与外放总数 39→42。
- `skills-general`：`sk_baizhanxinfa` 增书剑、雪山来源，`sk_pojunqiangfa` 增雪山来源。
- `skills-yitian`：九阳反震归零并走层数投影；武当截脉手点环跳落指端。
- 康熙／乾隆／古龙／少林及其他门派册：处理各自 purpose、镜像、段数、路线性质、穴位 ID、装备兼容等点名遗留；本任务未越权修改。

### 7.6 验收命令

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；全仓仅报告基线已知 `docs/README.md` 的 `sk_babuganchan`，新增严格失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 126 项通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，已知偏差 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-xiake-bixue.md` | ✅ errors 0、warnings 0；34/34 路线各异 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-xiake-bixue.md` | ✅ 与全仓其他武学完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-xiake-bixue.md` | ✅ 未定义引用 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-xiake-bixue.md` | ✅ 缺失 0、末端位置 0；未分类 6 |
| `python3 tools/lint/check_skill_catalogs.py --diversity --details docs/design/catalog/skills-*.md` | ✅ 本册内 0 对；跨册涉及本册 37 条（终审改前 63）；本轮点名三路线残留 0，剩余为未改写路线 |
| `git diff --check` | ✅ 通过 |

### 7.7 范围与完整性

- ✅ 只修改本任务允许的正文并新建本报告；没有触碰写集外文件。
- ✅ 版本行和修订记录均追加“经脉落地终审（2026-09-29）”。
- ✅ 未新增 `sk_*`、`mv_*`、`mfr_*`、`txp_*` 或 `ap_*` ID；所有穴位均可在 `design/15` 解析。
- ✅ 长度由 1651 行增至 1672 行，未缩短正文；无未完成标记或省略性占位。
- ✅ 旧待决项未删除；已解决项保留追溯，未核实原著事项继续标 **（待考）**。
- ⚠️ 6 条 delivery 路线因当前招式事实无法可靠分类而保留 `unclassified`；该检查为信息项，缺失与位置违规均已归零。

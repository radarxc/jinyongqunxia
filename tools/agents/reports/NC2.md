# NC2 报告 · 经脉系统落地 · 武学图鉴（五绝 / 逍遥）

## 1. 摘要（3–6 行）

已将 AR-14 与 `design/21` v2.0 的内容接口落到五绝、逍遥两册图鉴；21 继续拥有 schema、算法、共享模板与示例，两册拥有本组逐武学 `mfr_* / txp_*` 具体实例。
五绝完成 36 / 36 门天 / 地阶、232 / 232 招路线，另覆盖 24 / 24 门轻功、29 / 29 门内功；逍遥完成 24 / 24 门、108 / 108 招、14 / 14 门轻功、23 / 23 门内功。
60 门高阶武学均至少一记绝招；凌波微步以既有“将飞未翔”升级为 movement 绝招，没有另造招名。
三项 `python3` 门禁与 `git diff --check` 全部通过；剩余接入风险为 12 门无主动招轻功所需的局部基础 `MoveDef` 生成契约尚未由 05 / 构建器正式定义。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `docs/design/catalog/skills-wujue.md` | 3,082 | §0.6 接口与所有权；§0.7 共享展开码；§0.8–§0.9 高阶逐招；§0.10 轻功；§0.11 调息 / 护体；§15–§17 术语、校验与依赖 |
| `docs/design/catalog/skills-xiaoyao.md` | 2,349 | §0.6 接口与所有权；§0.7 共享展开码；§0.8–§0.9 高阶逐招；§0.10 轻功；§0.11 调息 / 护体；§2.3 凌波绝招；§15–§17 术语、校验与依赖 |
| `tools/agents/reports/NC2.md` | 本报告 | 结论、开放项、同步项、§18.6 总表与检查证据 |

相对 HEAD 基线 2,884 / 2,177 行，两册分别增加 198 / 172 行，没有缩短。写入仅限任务授权的两册图鉴和本报告。

## 3. 关键结论与数值

| 项 | 结论 / 核算 |
|---|---|
| 所有权 | 21 定义 `MeridianRouteDef` / `BreathProfile` schema、算法、共享模板与示例；本组图鉴定义逐武学 `mfr_* / txp_*` 实例；15 独占穴位、冲穴、周天与九转 |
| 05 接口 | 主动招用 `MoveDef.meridianRouteRef`，真实被动触发用 `routeOnTriggerRef`，轻功用 `SkillDef.movementRouteRef`，内功用 `inner.breathProfileRef` 与 `inner.innerGuard` |
| 高阶覆盖 | 五绝 36 门 / 232 招 / 232 个唯一引用；其中 231 个本册同体 `mfr_*`，另引用 21 的 `mfr_eighteen_palms_chain`。逍遥 24 门 / 108 招 / 108 个本册同体 `mfr_*` |
| 绝招 | 五绝 36 / 36、逍遥 24 / 24 门至少一记；路线 `ultimate` 只镜像既有 `MoveDef.ultimate`，不建立第二真值 |
| 模板 CT | A4 / A6 / A8 / A10 = 280 / 450 / 640 / 800；D3 / D4 / D6 = 210 / 300 / 540；M4 / M6 / M8 / M10 = 240 / 390 / 560 / 700 |
| 时间硬界 | 天阶攻击绝招 `1200+800=2000`；地阶攻击绝招 `1200+640=1840`；支援绝招 `1200+540=1740`；天阶 movement 绝招 `1200+700=1900`，均 ≤ 2000 CT |
| 路线硬界 | 1–18 个不重复且已登记 `ap_*`；每段 CT 40–120、风险 0–1200；Y / I / H 分别允许 `[yang,harmony]` / `[yin,harmony]` / `[yin,yang,harmony]` |
| 调息 | 两册共 52 个完整 `txp_*`；默认 `ct=1000, mpCostBp=0, outOfBattleScaleBp=15000`，蛤蟆功 `ct=1200`；scope 为黄 1、玄 2、地 / 天 3 |
| 调息公式 | `reliefBp=clamp(floor((500+100g+80n)×natureBp/10000),500,2500)`；`repairUnits=floor((120+24g+18n)×natureBp/10000)`；调和 `natureBp=10500`，其余 10000 |
| 护体 | 两册 52 门内功均为 `{enabled:true,reflectBp:0}`；斗转 `bf_douzhuan` 保持概率整招镜返、独立且防递归，不伪装固定反震 |
| 凌波绝招 | `mv_lingbo_jiangfei`：`ultimate:true`、气势 100、耗内 10%、无冷却、收招 1200，路线 `mfr_lingbo_jiangfei` / M10H |
| 实例隔离 | 每个独立行动单位恰有一个 `MeridianFlowModule`；图鉴不保存水量、迟滞、胀损、点穴或 RNG |

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NC2-O01 | 7 门五绝、5 门逍遥轻功没有既有主动 `mv_*`，而 21 的 `MeridianRouteDef.moveRef` 要求已登记招式 | 构建期为各武学生成局部基础移动 `MoveDef` 并绑定已登记 `mfr_<skill-slug>`；生成器未实现时显式拒绝构建，不伪造全局招名，也不静默回退 |
| NC2-O02 | 玄 / 黄阶模板何时实例化 | 构建前按武学性质与招式用途生成稳定同体 `mfr_*` 并展开真实 steps；A4Y 等短码不得进入 Core |
| NC2-O03 | 凌波“将飞未翔”升级为绝招是否保留 | 默认保留；它复用既有招名与效果，只升级资源 / 时序字段以满足每门高阶至少一绝招 |
| NC2-O04 | 21 §12.3 `BreathProfile` 是否应包含 YAML 已用字段 | 默认补 `outOfBattleScaleBp: Bp`；在类型同步前，内容仍按 §12.1 YAML 契约保存 15000 |
| NC2-O05 | **已解决：**逐招路线如何满足单值 `moveRef` | 每个 `mv_<body>` 对应唯一 `mfr_<body>`；共享的只是展开码参数，具体路线仍各有单一 `moveRef` |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| WJ-P03 / RCx-P03 | 在 Canon §12 / §18 将已登记前缀的唯一归属细化为：21 拥有经脉 schema、算法、`qnl_* / dxl_*`、共享模板与示例；各武学图鉴拥有本册逐武学 `mfr_* / txp_*` 实例 | 避免 21 膨胀为全武学内容库，同时保持算法和严重度档案单一事实源；两册已按此边界落盘 |

不另提攻击、防守、速度曲线或护体结算规则；继续采用 Canon v1.3 已接纳的 M2-P01 / P03、M3-P01～P04。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/05-martial-arts-system.md` / 内容构建器 | §5.11、V27 / V31 | 明确“无主动招轻功”的局部基础 `MoveDef` 生成 schema、稳定 `moveRef` 与校验方式，闭合 NC2-O01 的 12 门引用 |
| `docs/design/21-meridian-flow-and-moves.md` | §12.3 TypeScript | 给 `BreathProfile` 补 `outOfBattleScaleBp: Bp`，与 §12.1 YAML 和两册 52 个档案一致；不重复收录图鉴实例 |
| `docs/00-canon.md` | §12 / §18 | 将 `mfr_* / txp_*` 的逐武学实例所有权明确给各图鉴，21 保留 schema、算法、共享模板 / 示例；落实 WJ-P03 / RCx-P03 |
| `tools/lint/check_ids.py` / 内容校验 | ID 定义识别、05 V27–V31 | 识别图鉴压缩表中的具体 `mfr_* / txp_*` 定义并检查 `moveRef`、绝招镜像、性质、steps 与引用闭合；当前 strict 尚不覆盖这些语义 |
| `docs/design/03/04/06/08/09/13/14/15`、`docs/tech/05` | 21 §18.6 各自指定处 | 由对应任务接入独立乘区、护体、速度、Buff、UI、成长投影、逐单位模块与确定性；本任务未越权修改 |
| 其他武学图鉴 | 各册 AR-14 接口 | 由 NC1 / NC3 / NC4 覆盖其攻防、轻功、绝招、调息与护体；九阳、金刚不坏、太极、形意不属本组 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 `design/21` §18.6 处理总表

| §18.6 条目 | 目标文档 § | 状态 | 改动位置 / 处置 |
|---|---|---|---|
| 武学图鉴全册：为现有攻、防、轻功招式选 `purpose` 路线 | 五绝 §0.6–§0.10；逍遥 §0.6–§0.10 | 已落实 | 60 门高阶的 340 个既有招式逐招登记；防守与 movement 使用独立用途；玄 / 黄阶引用模板 |
| 武学图鉴全册：绝招沿用 `MoveDef.ultimate` | 两册 §0.8–§0.9、§16 | 已落实 | 60 / 60 门至少一记；路线只作相等断言 |
| 武学图鉴全册：凌波示例 | 逍遥 §0.10、§2.3 | 已落实 | `feifu` / `piaohu` / `jiangfei` 均挂 movement 路线；“将飞未翔”升级为绝招 |
| 图鉴专项：轻功顶层速度路线 | 五绝 §0.10；逍遥 §0.10 | 已落实，带 1 项接口遗留 | 24 / 24、14 / 14 均填 `movementRouteRef`；其中 12 门需局部基础 `MoveDef` 构建契约，见 NC2-O01 |
| 图鉴专项：内功调息 / 护体 | 五绝 §0.11；逍遥 §0.11 | 已落实 | 29 / 29、23 / 23 定义完整 `txp_*` 并填 `innerGuard`；具体实例归两册 |
| 九阳护体 / 金刚不坏 / 太极卸力 / 形意 6 段 | 其他图鉴 | 非本组 | 不在授权文件范围；交 NC1 / NC3 / NC4 对应图鉴承接 |
| `design/05` 的 `MoveDef` / 内功接口 | 本组消费 N05 最终 schema | 此前已有 | 本册使用 `meridianRouteRef`、`routeOnTriggerRef`、`movementRouteRef`、`breathProfileRef`、`innerGuard` |
| `design/03/04/06/08/09/13/14/15`、`tech/05` | 各自 §18.6 指定位置 | 非本组 | 未修改；需同步项见报告 §6 |
| Canon §8 / §9 / §11 / §12 / §18 / §19 | Canon v1.3 | 此前已有，归属尚需细化 | 已接纳 M2-P01 / P03、M3-P01～P04；WJ-P03 / RCx-P03 补实例所有权边界 |

### 7.2 检查结果

| 检查 | 结果 |
|---|---|
| `python tools/lint/check_ids.py --strict` | ⚠️ 系统 `python` 启动器不可用（exit 72：`xcode-select: Failed to locate 'python'`）；改用下列 `python3` 等价命令 |
| `python3 tools/lint/check_ids.py --strict` | ✅ exit 0；strict 新失败 0；仅报告基线允许的 `docs/README.md` 中 `sk_babuganchan` 未定义。该 lint 尚不识别压缩表全部实例语义，不能代替专项审计 |
| `python3 tools/balance/damage_sim.py --check` | ✅ exit 0；40 / 40 checks passed，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ exit 0；`meridian_flow_sim: all checks passed` |
| 专项覆盖审计 | ✅ 五绝 36 门 / 232 招 / 232 唯一路线 / 36 门有绝招；逍遥 24 / 108 / 108 / 24；与 N05 最终 `mv_*` 集合逐门一致 |
| 路线结构审计 | ✅ 两册各 33 个展开码；穴位存在且单路不重复；段 CT / 风险 / 总 CT 全部合规 |
| 调息 / 轻功审计 | ✅ 29 + 23 个 `txp_*` 字段、scope、CT、反震合规；24 + 14 门轻功全覆盖；⚠️ 12 门局部基础 `MoveDef` 见 NC2-O01 |
| Markdown 静态审计 | ✅ 五绝围栏 0；逍遥围栏 6 且闭合；连续表格列数一致；新增差异无占位词 |
| `git diff --check` | ✅ exit 0 |
| 写入范围 / 体积 | ✅ 仅两册图鉴与本报告；两册分别增加 198 / 172 行，均未缩短 |

### 7.3 遗留清单（按严重度）

- **中：**12 门无主动招轻功目前依赖“局部基础 `MoveDef`”生成约定，但 05 / 构建器尚未给出正式 schema；生产导出前须闭合 `moveRef`，否则 V27 应拒绝。本册明确列出五绝 7 门、逍遥 5 门，未伪称全局 ID 已存在。
- **中：**21 §12.3 TypeScript `BreathProfile` 漏 `outOfBattleScaleBp`，与同文 YAML 不一致；建议补字段后再生成强类型内容。
- **中：**现有 `check_ids.py --strict` 对图鉴压缩表中的 `mfr_* / txp_*` 具体实例所有权与引用语义覆盖不足；需要扩充 lint，当前结论另有专项静态审计支撑。
- **低：**凌波既有招式升级绝招采用默认裁定；若作者否决，应改选另一已有招式，不能删除高阶逐门至少一绝招的验收要求。
- **低：**本轮没有新增小说招名；正文原有（待考）项目仍按两册 §17.4 逐项核对三联 / 广州修订版。

# F2b 报告 · 全局审计 · 设计核心 B（12–20、NPC 名录、地图数据）

## 1. 摘要（3–6 行）

本组已完成 `design/12–20`、NPC 名录与地图数据的全局一致性审计，并把 Canon v1.2、作者需求、C01–C23 及跨组遗留落实到各自唯一归属。
地图已从旧 19 粗区原子迁移到 `design/11` 的 30 区终稿：四份 v2 数据源、派生区域字段、生成器校验和 15 张 SVG 同批通过。
本组 scoped 未定义 ID 从 45 个 / 51 次降至 42 个 / 47 次；近似名由 7 降至 0，废弃 ID 与冲突定义均为 0。剩余项均为外组物品定义或明确的经脉迁移源，未用虚构实体消警。
NPC 主线名录现为 420 条静态索引、395 个唯一人物、25 条跨书 appearance，并保留 13 个运行时角色 / 支持槽；补录均以待考或原创标注守住原著边界。

## 2. 产出（文件、行数、主要章节）

| 文件 / 组 | 当前行数 | 本次主要产出 |
|---|---:|---|
| `docs/design/12-quests-npc-factions.md` | 1,875 | §2.6 路线码主线迁移；§2.2–2.3 传承 DSL；§6.7 `sectTrainingMult`；§13.3 非主线任务登记 |
| `docs/design/13-progression-and-endings.md` | 1,853 | §2.5 飞狐任务当量；§4.2 十四书局部结局映射；`echo_12_fate`；精确 `bossUnit` |
| `docs/design/14-ui-ux-mobile.md` | 1,327 | 三十区 v2 地图接口完成态；保留 C19 书眠视频与正式导航契约 |
| `docs/design/15-meridians-and-acupoints.md` | 1,540 | §6.4 / §10.3 Buff 已收录状态；§11.7 四个短 ID 迁移表；12–14 接口状态 |
| `docs/design/16-resources-and-estates.md` | 1,664 | Canon v1.2 唯一归属、生命周期、经济分桶与前缀同步；B16-P01～P04 结案 |
| `docs/design/17-sects-compendium.md` | 2,196 | 99 门派三十区落点；CN-02 / CN-03 正式武学 ID、品阶、类别回写；历史候选隔离 |
| `docs/design/18-npc-and-companions.md` | 1,642 | §11 / §13.3 / §14 统计与登记；系统人物、12 个具名来源、静态人物与槽位边界 |
| `docs/design/19-world-map.md` | 997 | §3.7 旧区迁移表；§11 生成流程；§12 风险与原子迁移；§15 v2 校验 |
| `docs/design/20-legacy-inheritance.md` | 1,657 | `LegacyHeirSpawnRequest`；`legacyWorldCap`；正式缓存条件；12 / 13 / 14 / 16 / 18 接口收口 |
| `docs/design/catalog/npcs-ch01/02/03/04/05/08-*.md` | 315 | 分别补 10 / 6 / 5 / 4 / 1 / 2 条静态人物，更新每书合计；慈恩复用裘千仞 ID |
| `docs/design/catalog/npcs-facilities.md` | 148 | 设施岗位继续作为生成槽；更新 11 / 12 / 16 引用 |
| `docs/design/map/{regions,cities,sects,routes}.yaml` | 58,225 | schema v2；30 区、189 城、99 门派、52 旅行节点与 51 路线的区域字段原子迁移 |
| `tools/map/render_map.py` | 694 | 强制 schema v2、30 区闭集及城市 / 门派 / 节点 / 路线区域一致性 |
| `tools/map/migrate_regions_v2.py` | 119 | 新增可重复执行迁移器；只读 `design/11` §3.2 的 189 城权威归属 |
| `docs/design/map/jianghu-base.svg`、`jianghu-ch01.svg`～`ch14.svg` | 15 张 | 全量重绘并验证 XML 与连续生成 SHA-256；内容确定且本次无字节差异 |

未改动的 10 份 NPC 名录也已纳入计数、唯一性和格式检查；本报告本身不计入上表行数。

## 3. 关键结论与数值

1. 地图运行闭集为 30 区；数据规模为 189 城、99 门派、3 图外节点、24 驿站、28 码头、48 常规路线、3 专线、81 陆地多边形、14 河流组、11 山系组。区域事实只读 `design/11`，地图源保存几何与派生镜像。
2. NPC 十四书静态行数为 `40+36+35+32+26+26+40+32+27+21+20+34+28+23=420`，每书均在 20–40；解析为 395 个唯一人物和 25 条跨书 appearance。另有 13 个运行时角色 / 支持槽及 12 个非主线具名来源。
3. 慈恩与裘千仞是同一人物，统一 `npc_qiuqianren`；不创建 `npc_cien`。通用教头、院堂、士卒、猎户、家丁、门人、守卫和群体仍用 `roleKey` / `facilityKey` / 运行时槽。
4. 经脉迁移固定为 `mer_ren→mer_renmai`、`mer_du→mer_dumai`、`mer_chong→mer_chongmai`、`mer_dai→mer_daimai`；旧短 ID 只作读兼容，不写回。
5. 门派修炼倍率由 12 输出单值：默认 `sectTrainingMult=1.00`；少林正式成员处于剃度、身份未冻结且修炼 `sect_shaolin` 武学时，`(10000+1000)/10000=1.10`。同一 `sourceKey` 去重，消费者只乘一次。
6. 十四书局部结局键均映射到 `tsp_NN_canon/fate`；书剑回响定义为 `echo_12_fate := (fateRoute12 == fate)`，旧档缺字段默认 `false`。飞狐任务当量纠正为 `59+52+37=148`。
7. 终局 Boss 单位值按上游公式精算：`roundHalfUp(30,221.8001068032 × 7 × 1.35)=285,596`。
8. 传承合成执行 Canon v1.2 默认 `legacyWorldCap=12/10/9`；普通规则不保留 v1.1 回退，只有显式 `rule_wutiandao` 关闭。缓存条件统一读取 `legacyCache.state=opened`。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本版默认值 / 后续动作 |
|---|---|---|
| F2b-O01 | O-A3-01：越女合成全本是否作为普通 51 门闭集外形态 | 默认采用 `sk_yuenvjian@legacy_complete=10`，仍为同一技能且不计第 52 门；保持 **⚠️ 待作者确认** |
| F2b-O02 | O-A3-02：`legacy_synthesis` 当界上限细值 | 默认执行 12 / 10 / 9；仅 `rule_wutiandao` 关闭，保持 **⚠️ 待作者确认** |
| F2b-O03 | 39 个传承缓存的精确 `placeKey` / 坐标 | 默认继续使用区域级线索；待逐点考据后再落局部点，不按坐标猜史地 |
| F2b-O04 | `design/17` 古龙 20 项调阶与 23 个补位 | 保留为非消费历史候选；因需整节重写，交专项处理 |
| F2b-O05 | 组织目录中的晋威镖局等是否建立正式 `sect_*` | 默认不新建、不误并为威信镖局；由门派 / 剧情专项逐项裁定 |
| F2b-O06 | NPC 补录条目的精确生卒、命定结局和回目 | 未获可靠锚点均保持“待考 / unknown”；不据年龄猜年份，不编造回目号 |
| F2b-O07 | 本组之外仍存在的任务占位 / 状态键 | 不在 12 伪造任务；剧情调用方按 §7.6 的单列清单改名或登记 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 / 状态 | 理由 |
|---|---|---|
| F2b-P02 | 在 Canon §12 的 ID 迁移说明明确：迁移源、历史表和非生产夹具不因出现即构成活跃未定义引用 | 旧 `mer_*` 与旧 `rg_*` 在迁移表中应被 lint 识别为只读源；当前 strict 会把 11 的五个旧区视为新增问题 |
| F2b-P03 | 在 Canon §18 / 任务归属补一句：主线 `q_*` 具体定义唯一归 `story/NN`，12 只拥有 DSL、非主线注册与迁移 manifest | 贯彻 A3/F1b 已采用的所有权边界，避免为修 lint 在 12 虚构剧情任务 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 负责组 | 位置 | 需要同步的内容 |
|---|---|---|
| `docs/design/catalog/skills-gulong.md`、`skills-kangxi.md`、`skills-qianlong.md`、`skills-xiake-bixue.md` / F2c | `meridians`、术语及待决表 | 用 15 §11.7 的四项迁移替换活跃短 ID，删除“15 尚不存在”陈述；旧 ID 仅留 alias / migration |
| `docs/design/catalog/skills-wujue.md` / F2c | 慈恩来源 | 将唯一活跃 `npc_cien` 改为 `npc_qiuqianren`；慈恩只是神雕 appearance，不建第二人物 |
| `docs/design/10-items-and-equipment.md` / F2a | 传承信物目录 | 为 39 个 `it_xinwu_*` 建正式 `ItemDef`；20 只定义传承用途，不能冒充物品归属 |
| `docs/design/story/02/03/04/05/08`、对应 chapters / F2d1、F2d2 | 任务引用 | 逐条处理 §7.6 的 7 个 `q_*`：登记真实任务或改为正式 ID；两个 `_done` 应迁为状态旗标 |
| `docs/design/05-martial-arts-system.md` / F2c | `q_03_side_91` 等来源 | 由剧情正式任务替换占位；不得由 12 猜建定义 |
| `docs/design/06-buff-system.md` / F2c | `q_05_side_sanshi` | 接收剧情正式根治任务 ID，保留三尸规则唯一归 06 |
| `docs/design/09-combat-system.md` / F2c | 神龙战场条件 | 将 `q_08_side_91_done/92_done` 改成正式 `fl_*` / 局部状态事实，不把状态当任务 |
| `docs/design/catalog/skills-yitian.md` / F2c | `q_04_main_96` | 用倚天生产 manifest 的正式路线码任务 / 阶段引用替换语义占位 |
| `docs/design/catalog/skills-kangxi.md` / F2c | `q_08_shenlong_91` | 按 chapters/08 已定改为 `q_08_faction_02/03`，并同步学习来源文字 |
| `tools/lint/check_ids.py` / F2t | 迁移语境、owner 扫描 | 识别 11 / 15 的旧 ID 迁移源为非活跃；局部 `st_/tr_*` 继续按同一 `quest.v1` 围栏作用域处理 |
| `docs/tech/04-data-pipeline.md` / F2t | `TS-CONTENT-MAP-030` | 地图 v2 已完成后接收 30 区校验结果并解除阻断；不要绕过 `render_map.py --check` |
| `docs/tech/04`、`docs/tech/05` / F2t | 传承与任务 schema | 接 `LegacyHeirSpawnRequest`、`legacyCache` 条件、六动作、`legacyWorldCap` 和版本迁移；旧 `LegacyHeirRequest` 只读兼容 |
| `docs/design/02`、武学图鉴、chapters / 对应组 | 传承携带与投放 | 接传承匣相邻书眠窄白名单、`legacy_synthesis` 来源 / 越女 form、章节事实与机会配额 |
| `docs/design/11-open-world.md`、chapters / F2a、F2d | 历史迁移文字 / 章节区域引用 | 活跃数据只写 30 区；旧 19 区只在迁移表保留，不复制进新内容 |
| `TODO.md`、`_coordinator-notes.md` / 调度器 | CN-02、CN-03、CN-07、地图门禁 | 登记 CN-02 / CN-03 / 设计侧 CN-07 与 19→30 迁移已完成；保留图鉴回写、技术解锁及本报告遗留 |

本组未修改以上文件；需要大段重写的古龙门派武学回写和 39 个缓存精确地理考据仍作为遗留，不作半迁移。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 ID 检查：处理前 / 后

统计方法为先加载全仓定义，再只筛本组 30 个 Markdown / YAML；因此不会把外组已定义 ID 误算为本组缺失。

| 指标 | HEAD 基线 | 当前 | 变化 / 解释 |
|---|---:|---:|---|
| 本组文件中 ID 出现次数 | 5,300 | 5,823 | +523；新增人物、迁移表和 v2 地图字段 |
| 可解析定义数 | 1,770 | 1,828 | +58 |
| 归属本组且尚未定义 | 73（F2L 交接） | 0 个应新建的正式实体 | 43 项已定义 / 正式处理；余 30 项均不得建新人物或新经脉 |
| 本组文档中未定义引用 | 45 个 / 51 次 | 42 个 / 47 次 | 当前为 39 个 `it_xinwu_*` 共 44 次，加 3 个短经脉迁移源各 1 次 |
| 近似名 | 7 | 0 | 全部核对并清除本组活跃近似引用 |
| 废弃 ID | 0 | 0 | 无回归 |
| 冲突定义 | 0 | 0 | 无回归 |

F2L 的 73 个“设计 B”交接项中，43 项现已形成定义或正式处置；30 项不应新建定义：四个短经脉迁移源、25 个岗位 / 群体伪 NPC、一个同人异名 `npc_cien`。当前 scoped 统计只看到 `mer_chong/mer_dai/mer_du`，因为 `mer_ren` 已不在本组活跃 / 迁移文字中出现；这不改变四项迁移契约。

最终全仓 `python3.11 tools/lint/check_ids.py --strict --json` 扫描 93 个文件、47,633 次出现、10,706 个定义：121 个未定义、4 组近似名、0 个废弃 ID、0 个冲突定义；strict 的 5 个基线外项均为不可改的 `design/11` 历史迁移源 `rg_islands/rg_jingchu/rg_liangzhe/rg_xiyu/rg_yungui`，已交 F2t 按迁移语境处理。

### 7.2 C01–C23 核对表

| 冲突 | 本组文档 / 位置 | 状态 |
|---|---|---|
| C01 Z1 只归一一次 | 13 §4 / 终局数值仅引用 04、05 | ✅ 此前已落实；未复制第二套 Z1 |
| C02 `MPREF` 与合法配装 | 15 §4、§8；13 数值接口 | ✅ 此前已落实；只读合法 STD / `MPREF` |
| C03 回内上限 6% | 13 天书效果；15 内劲接口 | ✅ 此前已落实；未把 HOT / 回内混算 |
| C04 突破点按显示等级 | 13 §2 / §5；15 §9 | ✅ 此前已落实；保留记录与当界生效分离 |
| C05 封顶经验与武学积蕴 | 13 §2.6–2.7 | ✅ 此前已落实；阈值分段仍为权威 |
| C06 经验与四档难度 | 13 §2.4.1 / §5.1 | ✅ 此前已落实；飞狐当量本次修为 148 |
| C07 九阳非毒免 / 伤免 | 本组无唯一归属；13 只消费 Buff | ✅ 核对无冲突重定义 |
| C08 战后 / 休息清理 | 12 事件入口；13 / 15 生命周期 | ✅ 此前已落实；仅引用 06 / 09 |
| C09 猬刺 / 刀枪品阶 | 本组无归属 | ✅ 核对无反向定义 |
| C10 合法鞋与有效轻功层 | 14 显示；15 输入 | ✅ 核对仅消费 03 / 08 结果 |
| C11 疲惫与撞击 | 14 战斗 UI | ✅ 核对只引用 06 / 09，不维护旧阈值 |
| C12 重命名与前缀 | 12、14、17、18、20 | ✅ 本次核对旧名；慈恩按同人规则复用正式 ID |
| C13 两阵四人起阵 | 本组仅 UI / NPC 编组消费 | ✅ 无三人 / 七人旧定义 |
| C14 目录目标 | 17 候选快照；20 传承源 | ✅ 使用 v1.2 的 1,138 目标，不复活 661 门口径 |
| C15 51 门完整池 / 残承 | 13 / 20 | ✅ 普通 51 门与越女合成形态分开；O-A3-01 明示待确认 |
| C16 `dualWield` 0–10 | 本组仅消费 | ✅ 未定义副手档位 |
| C17 结构化技艺 / OR 前置 | 12 DSL；20 校合条件 | ✅ 沿用结构化条件，不以自然语言替 schema |
| C18 `packages/spec/` | 本组无技术路径归属 | ✅ 核对无旧 `packages/data/spec/` 活跃契约 |
| C19 书眠视频 20–30 秒 | 14 资源与加载交互 | ✅ 目标 24 秒、范围 20–30 秒及 `vid_sleep_NN_MM` 保留 |
| C20 朝向 / 色板 / 镜头 | 14 §1–§2 | ✅ 只引用共享色板与朝向映射 |
| C21 四画质 / 异步渲染 | 14 接口 | ✅ 此前已落实；未把未过闸门的 WebGPU 写成完成 |
| C22 套装成员闭合 | 17 门派只引用图鉴 | ✅ 本次候选 ID 回写，不在 17 定义套装成员 |
| C23 19 个 Buff | 13 §4.9；15 §6.4 / §10.3 | ✅ 15 个经脉与天书 / 终局 Buff 均改为已由 06 收录 |

### 7.3 AR-01–AR-13 核对表

| AR | 本组文档 | 状态 |
|---|---|---|
| AR-01 武学比例 | 13、17、20 | ✅ 只引用 Canon v1.2 的 1:3:9:9 / 1,138，不重定义图鉴配额 |
| AR-02 阴阳调和 | 15、20 | ✅ 经脉相性与校合条件沿用三性 |
| AR-03 冲穴 | 15；13、14 接口 | ✅ 20 脉 / 180 穴、九转、跨书保留及迁移表均落实 |
| AR-04 统一地图 / 时代层 | 14、17、19、map | ✅ 本次完成 30 区 v2 原子迁移 |
| AR-05 资源点 / 家丁 | 16；12、14 接口 | ✅ 36 级、经营与书眠清理对齐 Canon |
| AR-06 城市营生 | 16；12、14 接口 | ✅ 客卿唯一、教头 / 行脚边界保留 |
| AR-07 门派职级 / 月钱 | 12、16、17 | ✅ L1–L5、称谓映射、月钱资源职责分离 |
| AR-08 门派资料 | 17、19 | ✅ 99 门派与 15 个古龙组织、正式驻地及武学引用边界落实 |
| AR-09 NPC / 同伴 | 18、NPC 名录；12 / 13 / 14 接口 | ✅ 20–40 / 书、D1–D5、生卒 / 重逢 / 只增不减及槽位边界落实 |
| AR-10 双主线 / 选择 | 12、13、18 | ✅ 接收剧情具体事实并提供正式迁移 / 结局 / 生死接口，不在本组重写剧情 |
| AR-11 水墨地图 | 19、map、14 | ✅ WGS84 / Albers、历史地名、图外专线、15 SVG 与 v2 校验通过 |
| AR-12 六角战斗 | 14、15 | ✅ UI 与属性接口只消费 pointy-top 六角正式契约 |
| AR-13 跨年代传承 | 20；12–14、16–19 | ✅ 39 源、三卷 / 信物 / 校合、后人 / 宝藏、跨书与 12/10/9 默认落实 |

### 7.4 同步处理总表

| 编号 | 来源 | 目标 | 状态 |
|---|---|---|---|
| SY-B01 | A3 §6 / Canon V12-03、09、11、15 | 12–20 | 本次已改：版本、唯一归属、生命周期、前缀及经济边界同步 |
| SY-B02 | A3 §6；F1b-P01 / P03 | 12、13 | 本次已改：正式路线码、story 所有权、局部结局映射与 manifest 边界 |
| SY-B03 | F1a §6 | 13 | 本次已改：`bossUnit=285,596`、飞狐顺序相关的任务当量核算 |
| SY-B04 | F1a §6；C23 / R06 | 15 | 本次已改：15 个经脉 Buff 改为正式收录并引用 06 |
| SY-B05 | F1n F1n-28 | 12 | 本次已改：稳定单值 `sectTrainingMult`、1.00 / 1.10 与去重责任 |
| SY-B06 | CN-02 / CN-03；F1n-32/33 | 17 | 本次已改：候选武学回写正式图鉴 ID、品阶、类别 |
| SY-B07 | CN-07；M1 / F1n-34 | 15 | 本次已改：四个旧短 ID → 正式经脉 ID 迁移表；图鉴活跃引用交 F2c |
| SY-B08 | F1b-P05 / H1 | 18、20 | 本次已改：统一 `LegacyHeirSpawnRequest` 与旧 schema alias |
| SY-B09 | H1 §6 / F1b | 12、13、14、16、18、20 | 本次已改：DSL、成就、UI、家丁挖掘、NPC 载体和传承生命周期收口 |
| SY-B10 | F1b SY-006 / SY-038 | 19 / 缓存点 | 遗留：剧情锚点与 39 缓存需逐点考据；本次不猜坐标 |
| SY-B11 | F1b SY-007；F1t 地图门禁 | 17、19、map、render | 本次已改：19→30 区、189 城、99 门派、52 节点、51 路线与 15 SVG 原子迁移 |
| SY-B12 | F1b SY-042 / M1 | 15 | 本次已改：CN-07 设计侧完成 |
| SY-B13 | F1b SY-049/051/055/057/061/064/067 | 18 / NPC 名录 | 此前已落实：06/07/09/10/12/13/14 名录及生命态；本次复核 |
| SY-B14 | F1b SY-054 及 P01–P08 报告 | 18 / ch01–05、08 名录 | 本次已改：补 28 条点名静态人物；群体继续用槽位 |
| SY-B15 | F1b SY-063 | 13 | 此前已落实并本次复核：飞狐 `59+52+37=148` |
| SY-B16 | F1b SY-065 | 17、19 | 部分已改：正式驻地已迁；组织新 ID 与未核地望继续遗留 |
| SY-B17 | F1t §6 | 18 | 此前已落实：`CompanionSnapshot` 无重复字段、事件名统一；本次复核 |
| SY-B18 | F1t §6 | 13 §9.4 | 此前已落实：确定性 intent / revision / ack 边界；本次复核 |
| SY-B19 | F2L §7.3 | 12–20 / NPC / map | 本次已改：43 个设计 B 缺口正式处理；30 个不合法候选不造定义 |
| SY-B20 | `_coordinator-notes` CN-02/03/07 | 17、15 | 本次已改；图鉴侧 CN-07 另交 F2c |

### 7.5 遗留清单（按严重度）

#### 高：影响生产构建或跨组闭合

| 项目 | 状态与建议处理 |
|---|---|
| 39 个 `it_xinwu_*` 未定义 | 归 `design/10`。F2a 应按 20 的信物表建立正式 `ItemDef`；当前本组 44 次引用必须继续报错，不能在 20 重复定义 |
| 地图技术阻断尚待消费 | F2t 在核对 v2 数据与 `render_map.py --check` 后解除 `TS-CONTENT-MAP-030`；不得仅删门禁 |

#### 中：内容一致性与正式迁移

| 项目 | 状态与建议处理 |
|---|---|
| 四册图鉴仍用短经脉 ID | F2c 执行 15 §11.7 映射；写新 ID、读旧 alias，不改 15 的正式目录 |
| 39 个缓存缺精确点位 | 逐项核书目 / 历史地理后补 `placeKey`；在此之前保留区域级提示 |
| 古龙 20 项调阶 + 23 个补位 | 涉及 17 §11 整节，不符合本轮“小改”原则；另立专项并以图鉴为武学唯一归属 |
| 晋威等组织 ID | 由 17 / 剧情共同裁定；不得误并 `sect_weixinbiaoju`，也不得为 lint 临时造组织 |
| NPC 精确生卒 / 回目 | 按三联 / 广州修订版与可靠史料逐项考据；现有 `unknown` / 待考不阻断结构构建 |

#### 建议引用方改名（不在本组伪造定义）

| 当前引用 | 建议处理 |
|---|---|
| `q_08_shenlong_91` | 改为 chapters/08 已采用的 `q_08_faction_02/03`，按具体学习分支选择 |
| `q_08_side_91_done`、`q_08_side_92_done` | 改成正式 `fl_*` 或所属任务局部状态键；二者是完成态，不是任务 ID |
| `npc_cien` | 改为 `npc_qiuqianren`；显示名 / appearance 为“慈恩” |
| `q_02_main_07`、`q_03_side_91`、`q_04_main_96`、`q_05_side_sanshi` | 由各剧情生产 manifest 登记或改用已有正式任务；证据不足，12 不猜号 |

#### 交其他组

| 负责组 | 条目 |
|---|---|
| F2a | 39 个 `it_xinwu_*` 正式物品定义；11 的五个旧 `rg_*` 只留迁移语境 |
| F2c | 四册图鉴经脉回写、`npc_cien`、武学学习来源中的任务占位 |
| F2d1 | `q_02_main_07`、`q_03_side_91`、`q_04_main_96`、`q_05_side_sanshi` |
| F2d2 | `q_08_shenlong_91`、`q_08_side_91_done`、`q_08_side_92_done` |
| F2t | 迁移源 lint 语义、`TS-CONTENT-MAP-030` 解锁、传承 / NPC / 任务 strict schema |
| F2 汇总 | 跨组剩余 ID 与报告状态合并 |

F2L 指出的 25 个岗位 / 群体伪 NPC 不列为缺失人物：`npc_baituo_shenutou`、`npc_baiyunguan_daozhang`、`npc_gaibang_chuangong`、`npc_gaibang_zhanglao`、`npc_generic_jiaotou`、`npc_juxian_zhuangding`、`npc_liao_jiaotou`、`npc_liao_lieren`、`npc_liao_wushi`、`npc_ming_jiaotou`、`npc_mizong_lama`、`npc_nanshaolin_luohantang`、`npc_qiaozi`、`npc_quanzhen_sandai`、`npc_shaolin_banruotang`、`npc_shaolin_damoyuan`、`npc_shaolin_fangzhang`、`npc_shaolin_jielvyuan`、`npc_shaolin_luohantang`、`npc_shaolin_shibaluohan`、`npc_shaolin_wuseng`、`npc_wudang_youfang`、`npc_wuliang_dizi`、`npc_xixia_jiaotou`、`npc_xixia_wushi`。调用方应迁为岗位 / 设施 / 群体槽。

### 7.6 最终验收

| 验收项 | 结果 |
|---|---|
| 事实优先级与唯一归属 | ✅ 已读作者决定 / 需求、Canon v1.2、rulings；本组只在 owner 定义本组实体 |
| 允许写入范围 | ✅ 变动 / 新增路径全部位于 F2b allowlist；未修改 Canon、decisions、TODO、story、chapters、图鉴或 tech |
| 版本与追溯 | ✅ 所有被改设计文档含“全局审计（2026-09-26）”；已有待决项保留并将已解决项显式结案 |
| 地图迁移 | ✅ 30 区 / 189 城 / 99 门派 / 52 节点 / 51 路线同批迁移；`--check`、`--render`、XML 与确定性通过 |
| NPC 专项 | ✅ 420 行、395 唯一、25 跨书、每书 20–40；槽位未伪造人物；慈恩不拆 ID |
| ID 闭合 | ✅ 本组可安全定义项已处理；scoped near-match / deprecated / conflict 均为 0；外组债如实交接 |
| 数值可推导 | ✅ 148、285,596、1.10、30 区与 NPC 总数均列算式 / 枚举来源 |
| 原著边界 | ✅ 未编造引文 / 回目号；不确定生卒与情节均标待考，原创扩展显式标注 |
| 文档完整性 | ✅ Markdown 围栏、表格、差异空白、文件缩短阈值均通过；无 `TODO` / “此处省略” / “待补充”占位 |
| Git 纪律 | ✅ 未执行 commit、push、checkout、switch、reset、stash、rebase 或 merge |
| 尚未完成项 | ⚠️ 外组 ID、技术门禁、精确缓存点和两项 O-A3 作者确认按本节遗留交接，未虚报完成 |

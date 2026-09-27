# F2t 报告 · 全局审计 · 技术与工具（tech/01–09、ID 检查脚本）

## 1. 摘要（3–6 行）

完成 `docs/tech/01–09` 与 `tools/lint` 的 Canon v1.2 终审，小改覆盖版本引用、路线图阶段、WebGPU 闸门、正式 schema、素材预算、书眠 / 终局资源及 ID 门禁。
`tech/04/05/09` 已正式接入 `design/20` 的 `legacy.v1` 五表、传承运行时与 LEG-V/T；经脉、Buff、经营和重复遭遇接口同步到最新归属契约。
`vid_sleep_14_15` 未被定义：检查器仅在精确否定语境中忽略它，正向引用和其他越界书眠仍失败；终局只用三个 `vid_end_*`。
全仓扫描由 F2L 基线的 161 个未定义 ID 降为 160；本组归属缺口由 1 降为 0，strict 新债为 0。
遗留主要是跨组定义、设计字段漂移、19→30 区数据迁移，以及真机、账号和真实产物验证。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 本次主要产出 |
|---|---:|---|
| `docs/tech/01-architecture.md` | 1,767 | Canon v1.2；WebGPU 五项硬门 + 二级收益门；阶段映射；一域四切片；输入与崩溃恢复边界 |
| `docs/tech/02-rendering.md` | 2,060 | Canon v1.2；WebGPU 门禁层级与复评时点；渲染阶段和天龙切片映射 |
| `docs/tech/03-mobile-performance.md` | 2,102 | 全局审计版本；P0–P16 阶段映射；一域四局部切片 |
| `docs/tech/04-data-pipeline.md` | 1,716 | `legacy.v1` 五表、LEG-V01–V10；正式经脉 / 经营 / 遭遇字段；ID strict baseline 规则 |
| `docs/tech/05-gameplay-engine.md` | 2,153 | 传承运行态、`qiyu` RNG、双配额收据、书眠事务、LEG-T01–T15；经脉 / 经营 / 遭遇消费 |
| `docs/tech/06-asset-storage.md` | 2,347 | 46 条视频 / 24.7 分钟核算；13 条合法书眠；独立终局资源；阶段映射 |
| `docs/tech/07-asset-generation.md` | 1,968 | 一域四切片；1,138 武学与 247 Buff 资产预算；46 条视频；v1.2 素材 ID 状态 |
| `docs/tech/08-backend-and-online.md` | 2,993 | 全局审计版本；后端 Phase 与 P0–P16 映射；协议判别值 lint 边界 |
| `docs/tech/09-roadmap.md` | 1,055 | Canon v1.2；strict baseline 清零计划；`legacy.v1` 门禁；P16 终局视频边界 |
| `tools/lint/check_ids.py` | 2,135 | `vid_sleep_14_15` 否定语境与 `set_allowed_flag` JSON Schema 判别值的窄豁免 |
| `tools/lint/test_check_ids.py` | 896 | 新增 3 个测试方法 / 7 个正反场景；总计 35 项通过 |
| `tools/agents/reports/F2t.md` | 220 | 计数、C / AR / 同步核对、跨组遗留与验收证据 |

`tools/lint/check_ids_baseline.json` 与 `tools/lint/README.md` 已复核但未修改；前者仍是 F2 过渡基线，须由汇总任务在全组清零后统一刷新。

## 3. 关键结论与数值

1. **ID 闭合**：F2L 交接的技术组唯一缺口 `vid_sleep_14_15` 是禁止创建的反例，不是资产需求。合法参数族严格为 `vid_sleep_01_02`–`vid_sleep_13_14`；终局使用 `vid_end_guixiang`、`vid_end_wuzi`、`vid_end_juanzhong`。
2. **视频预算**：正式成片 `1+1+14+14+13+3=46` 条；中心时长 `105+25+14×37.5+14×17.5+13×24+3×90=1,482 s=24.7 min`，其中书眠 `13×24=312 s=5.2 min`。
3. **武学与 Buff 素材**：武学目标 `51+169+459+459=1,138`；独立图鉴插画 `51+169=220`；图标候选上限 `1,138×4=4,552`，插画候选 `220×4=880`。Buff 正式目录 `237+10=247`，未复用候选上限 `247×4=988`。
4. **传承**：`legacy.v1` 固定 `sources/caches/fragments/keystones/recipes` 五表；39 源、117 卷、39 缓存、39 信物闭合。运行时只消费既有 `qiyu` RNG，并区分 `quota_full_before_batch` 与 `lottery_deferred`。
5. **确定性与经营**：`partial` 报酬为 `0.60=6000 bp` 且状态落 `completed`；重复遭遇倍率按 `spawnPointId + worldDay` 为第 1–3 次 10000、第 4–7 次 5000、第 8 次起 2000。
6. **渲染与排期**：WebGPU 必须先过 `tech/02` 五项硬门，再应用 R09-S04 二级收益门；P1/M2 只做 `rg_dali_cangshan` 一域、四个局部切片、`q_01_main_01` 一幕。
7. **存档恢复**：行动开始 checkpoint 只服务当前进程内悔招；页面 / 进程中断恢复战斗前自动档，不承诺跨进程半场续接。
8. **检查结果**：最终默认扫描 93 个文件（89 Markdown + 4 YAML），47,134 次出现、10,648 个定义；160 个未定义 ID / 503 次引用、0 冲突定义、0 deprecated、25 组 near-match、0 set 不对称；strict 新增失败 0。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 后续判定点 |
|---|---|---|
| F2t-O01 | `LegacyCacheRuntimePhase` 正式值域 | 暂用 `hidden/revealed/working/ready/opened` **【建议值】**；由 `design/20` 登记后再固化 schema |
| F2t-O02 | `sectTrainingMult` 单一 DTO | 默认 1.0，少林剃度为 1.10；由 `design/12` 定义来源与合并责任，技术侧不另造第二份规则 |
| F2t-O03 | 真实设备与 WebGPU | 使用作者主力手机 + 一台中端 Android + iPad；型号、入口、P95、能耗和温控均在 P0 **（待实测）** |
| F2t-O04 | 传承确定性样本量 | 默认 10,000 个业务 seed；发布候选抽 30 份 V8 / JSC 完整录像 **【建议值】**，实测后调整但必须留 ADR |
| F2t-O05 | 素材体积与编码 | 保持 60 MB 冷进入、25/12 MB 区域 / 时代块、AAC-LC、UASTC 并发 4→2 降载等现行默认；以首批真实包和目标工作站 **（待实测）** |
| F2t-O06 | 全仓 ID baseline | F2 各组未定义债清零前不刷新；清零后默认全量扫描为 0，再运行 `python3 tools/lint/check_ids.py --update-baseline` |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| F2t-P01 | Canon §18 明确 `it_xinwu_*` 的对象目录与传承投放分工：建议 `design/10` 登记 ItemDef，`design/20` 定义传承用途 / 配方；或明确联合字段归属 | 当前 39 个 ID 仅由 `design/20` 使用，而 §18 将物品目录唯一归 `design/10`；机械 owner 校验仍有 39 个真缺口 |
| F2t-P02 | Canon / 中央迁移表明确 `dc_*` 究竟是全局选择节点还是 story 内局部策划键 | Canon §12 登记全局前缀，`design/12` 又描述为局部标签；检查器目前按 story 文件号做兼容解释 |
| F2t-P03 | Canon §18 或中央 schema 清单补充“传承缓存运行态 phase 值域由谁定义” | `design/12` 允许读取 `state`，`design/20` 尚未列出值域；技术侧只能保留五值建议，不能越权定稿 |

其余本次遇到的旧提案已被 Canon v1.2 V12-09 / V12-13 / V12-15 吸收，文档中已改为“已采纳”，不重复申请。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 组 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/18-npc-and-companions.md` / F2b | NPC 唯一目录 | 登记或正式 remap `npc_zhujue`、`npc_shuling`；本组技术文档仅保留引用，不再错误声称由 `design/01` 定义 |
| `docs/design/10-items-and-equipment.md` / F2a | 物品目录 | 按 Canon §18 登记 39 个 `it_xinwu_*` ItemDef，并与 `design/20` 信物用途一一对应；若采用联合归属，先落实 F2t-P01 |
| `docs/design/12-quests-npc-factions.md` / F2b、F2 | legacy opcode | `legacy/completeSynthesis` 的字段从 `recipeId` 统一为 `recipeKey`，与 `design/20`、tech/04/05 一致 |
| `docs/design/12-quests-npc-factions.md` / F2b | 门派修炼接口 | 输出单一 `sectTrainingMult` DTO；默认 1.0、少林剃度 1.10，避免 05 与 12 双重相乘 |
| `docs/design/20-legacy-inheritance.md` / F2、后续归属修订 | 运行态 / 事件 | 决定并登记缓存 phase 值域；另将 `legacy/synthesisStarted` 载荷的 `recipeId` 同步为 `recipeKey` |
| `docs/design/chapters/14-xueshan.md` / F2d2、F2 | 三处否定句 | 无需改写；保持“不经过 / 不创建 `vid_sleep_14_15`”，不得登记该 ID。若改成正向引用，lint 应立即失败 |
| `docs/design/map/*.yaml`、`design/11/17`、章节 / F2 | 19→30 区迁移 | 原子迁移城市归区、几何 / 邻接、路线、门派派生区域、包名与章节引用；完成前保留 `TS-CONTENT-MAP-030` 阻断 |
| `docs/design/09-combat-system.md` / F2a | 首轮与范围 | 将 `openingPriority` 写入正式排序公式；范围随机顺序区分模板格序与目标 `unitIndex` |
| `docs/design/13-progression-and-endings.md` / F2b | Meta 同步 | 对齐 `MetaProfileIntent.intentId`、规则投影 revision 与 ack 边界，平台墙钟不得回流 core |
| `docs/design/01/18` / F2b | 主角 / 书灵 ID 归属 | `design/01` 保留身份叙事，`design/18` 负责 NPC 目录；避免技术 / 素材文档引用被误当定义 |
| `TODO.md`、协调记录 / 调度器 | F2t 状态 | 登记本报告、三项基准提案、跨组遗留与最终验证计数；本任务无写权限 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 ID 处理前 / 后计数

| 指标 | 处理前 | 处理后 | 结论 |
|---|---:|---:|---|
| 归属技术组且未定义 | 1 个唯一 ID（`vid_sleep_14_15`；当前检出三处否定引用） | 0 | ✅ 不造伪定义；只对精确 ID + 同句禁止措辞作窄豁免 |
| `docs/tech` 内有效的跨组未定义引用 | 2 个唯一 ID / 4 次引用 | 2 / 4 | ⚠️ 均为 `npc_zhujue`、`npc_shuling`，应由 `design/18` 登记；技术文档已纠正归属说明但不越权定义 |
| `docs/tech` 近似名 | 1 对 | 1 对 | ✅ `vid_ch00_intro` / `vid_ch01_intro` 均是合法、已定义且语义不同的相邻名 |
| `docs/tech` deprecated ID | 0 | 0 | ✅ 活跃文本未使用重命名表旧 ID；历史追溯不算活跃引用 |
| 全仓未定义 | 161 个唯一 ID / F2L 快照 504 次引用 | 160 / 503 | ✅ 只消除禁止性 `vid_sleep_14_15`；未用宽豁免吞掉其他组真缺口 |
| 全仓冲突定义 / deprecated / near-match / set 不对称 | 0 / 0 / 25 / 0 | 0 / 0 / 25 / 0 | ⚠️ `design/07` 不存在，set 双向检查按既有规则跳过，故最后一个 0 不代表已完成套装闭合 |
| strict baseline 新债 | 0 | 0 | ✅ `python3 tools/lint/check_ids.py --strict` 退出 0；baseline 仍保留 161 个历史键，未在单组任务擅自刷新 |

补充：全仓 JSON 的“首个引用位置”不能用于统计某目录内的全部引用，所以本表另按同一活跃 / 定义 / 局部 / 参数族规则遍历 `docs/tech`，得到 2 个唯一 ID / 4 次引用。`set_allowed_flag` 是 `tech/08` JSON Schema 的协议判别值；新增规则只在该文件代码围栏内的精确 `"const": "set_allowed_flag"` 形状忽略，正文同名引用和任意 `set_missing` 仍失败。

### 7.2 C01–C23 核对表

| 冲突 | 文档 / 位置 | 状态 |
|---|---|---|
| C01 Z1 单次归一 | tech/04 schema、tech/05 §8 | 此前已落实：公式只消费 `design/04` 的 Z0–Z10 / `P_ref` |
| C02 MPREF 与合法配装 | tech/03 §3–§4、tech/05 §8 | 此前已落实：`MPREF=STD.mpMax`，合法装备数值由 03 / 04 提供 |
| C03 回内上限 6% | tech/03 §4.8、tech/05 §5 / §8 | 此前已落实：真实 `mpMax` 回复与 6% 上限一致 |
| C04 显示等级突破点 | tech/04 / 05 状态投影 | 此前已落实：保存真实分配、运行只启用 `突破等级≤Ld` |
| C05 满级经验 / 武学积蕴 | tech/05 §11.5 | 此前已落实：角色经验、余韵、`sxp/latentExp` 分账 |
| C06 经验与难度 | tech/05 §11.5 | 此前已落实：引用 `design/13` 正式公式，不维护平行难度表 |
| C07 九阳免疫边界 | tech/05 Buff 消费 | 此前已落实：按正式 Buff / 被动定义，不附送毒免或内伤免疫 |
| C08 战后 / 休息清理 | tech/05 战末与书眠事务 | 此前已落实：消费 `design/06/09` 生命周期，不另造清理表 |
| C09 猬刺 / 刀枪压制实例 | tech/04 Buff schema、tech/05 runtime | 此前已落实：原生范围和压制后实例范围分离 |
| C10 合法鞋与有效层数 | tech/03 轻功预算 | 此前已落实：普通鞋最高 9 品，天龙凌波按有效八重 |
| C11 疲惫 / 撞击一次 | tech/04 `MoveDefSchema`、tech/05 位移结算 | 本次已改：删除废弃 `collideDmg` 字段，继续以 `D_hit` 单次撞击为唯一入口 |
| C12 重命名 / 前缀 | tech/04 remap、tools/lint | 此前已落实：活跃 deprecated 为 0，迁移别名不当生产定义 |
| C13 七人阵四单位起阵 | tech/05 阵法消费 | 此前已落实：只消费 `design/05/09` 的四实际单位规则 |
| C14 661 旧目标 | tech/07 §3 / §5 / §8 | 本次已改：按高优先级 AR-01 / Canon v1.2 改为 `51/169/459/459=1,138` |
| C15 51 天级闭集 | tech/04 / 05 内容与运行校验 | 此前已落实：完整 / 残承来源分开，技术层不扩天级 ID |
| C16 `dualWield` 0–10 | tech/04 / 05 | 此前已落实：整数层数值，不恢复 0–3 档或副手布尔 |
| C17 `Reqs.skills/anyOf` | tech/04 schema、tech/05 条件 IR | 此前已落实：结构化技艺门槛与 OR 前置 |
| C18 `packages/spec/` | tech/01/02/04/06/07 | 此前已落实：跨语言静态契约只有根目录一份 |
| C19 书眠视频 | tech/06 §4.5、tech/07 §5.7、tech/09 P16 | 本次已改：13 条相邻视频，14 后改独立 `vid_end_*`，禁止 `vid_sleep_14_15` |
| C20 朝向 / 品阶色 | tech/02 / 07 | 此前已落实且受 AR-12 覆盖：规则六向、资产完整 `battle8`、四镜头预设 |
| C21 四档 / 异步 / WebGPU | tech/01 §2.6、tech/02 §9.3 | 本次已改：五项硬门先行，R09-S04 仅作二级收益门 |
| C22 套装双向闭合 | tech/04 set-lint | 遗留：接口已存在，但 `design/07-set-system.md` 缺失导致实际检查跳过；交 F2a / F2 |
| C23 19 Buff 缺口 | tech/04 §5.4、tech/05 Buff runtime、tech/07 §5.6 | 本次已改：缺失引用直接 error；素材按完整正式目录 247，而非旧快照 227 |

### 7.3 AR-01–AR-13 核对表

| AR | 文档 / 技术影响 | 状态 |
|---|---|---|
| AR-01 武学比例 | tech/07、tech/09 | 本次已改：1,138 总量、220 插画及候选量全部重算 |
| AR-02 阴 / 阳 / 调和 | tech/04 / 05 | 此前已落实：schema 与运行时只消费 `design/05` 的 `nature` |
| AR-03 经脉 / 九转 | tech/04 §3.8、tech/05 §11.1 | 本次已改：`MeridianAid`、S0–S8、正式五个斜杠事件主题与 keyed RNG 对齐 |
| AR-04 统一地图 / 时代层 | tech/02–07 | 本次已改：P1/M2 固定一域四局部切片；分包仍为共享区域 + 时代状态 |
| AR-05 资源 / 家丁 | tech/04 §3.9、tech/05 §11.2–§11.3 | 本次已改：正式 schema、报价、调度与书眠清理接齐 |
| AR-06 城市营生 | tech/04 / 05 | 本次已改：`partial=6000 bp` 且合同 `completed`，客卿唯一保持 |
| AR-07 门派职级 / 月钱 | tech/04 / 05 | 此前已落实：L1–L5 映射、30 日经济月、职责后结算 |
| AR-08 门派资料 | tech/04 / 05 / 06 / 07 | 此前已落实：消费 `sect-compendium.v1`，不复制 99 派事实表 |
| AR-09 NPC / 同伴 | tech/04 / 05 / 06 / 08 | 本次已改：跨书投影与生成请求保持；主角 / 书灵的目录归属纠正为待 `design/18` 登记 |
| AR-10 双主线 / 选择节点 | tech/04 / 05 / 09 | 此前已落实：`quest.v1`、局部键、Ink bridge、事务与幂等边界 |
| AR-11 地图绘制 | tech/02 / 04 / 06 / 07 | 此前已落实：4096×3072 base + 14 时代层及派生瓦片；19→30 数据迁移仍遗留 |
| AR-12 六角战棋 | tech/01–05、07 | 本次已改：六向规则 / 八向资产边界保持，双指轻点默认不绑定 |
| AR-13 跨年代传承 | tech/04 / 05 / 09 | 本次已改：`legacy.v1`、新前缀、LEG-V/T、RNG、配额收据、书眠与 cap 正式接入 |

### 7.4 同步处理总表

| 编号 | 来源 | 目标 | 状态 |
|---|---|---|---|
| S01 | A3 §6 / Canon v1.2 | tech/01–09 的当前基准引用、三哈希、256 KiB、四画质、CAS、离线与确定性硬边界 | 本次已改：九份文档头与当前事实统一到 v1.2；历史“已采纳（v1.1）”保留追溯 |
| S02 | A3 §6 | tech/09 的 v1.2 阶段门禁 | 本次已改：ID strict、`legacy.v1`、P16 独立终局视频进入路线图 |
| S03 | F2L §6 | tech/04 baseline 差集、完整扫描刷新与清零计划 | 本次已改：门禁命令固定为 `python3 tools/lint/check_ids.py --strict`，禁止局部刷新 |
| S04 | F2L §7.3；协调者追加要求 | tools/lint、tech/06/07/09 的 `vid_sleep_14_15` | 本次已改：不登记伪资产；精确否定语境窄豁免，正向引用仍失败，终局只用 `vid_end_*` |
| S05 | F1a §6 | tech/04/05 的 Buff、经脉、经验、先机、重复遭遇与经济字段 | 本次已改：接入 `applyMode`、`MeridianAid`、正式事件、`expFp`、`spawnPointId`、600 ticks 与 partial 事务；`openingPriority` 上游公式仍遗留 |
| S06 | F1a §6 | tech/06 与调用方的双轴分包键 | 此前已落实：`region-<rg_id>`、`era-chNN`、`state-<rg_id>` 已统一 |
| S07 | F1b §6 | tech/04/05 的 quest legacy opcode、经营报价、NPC 生成与局部键 | 本次已改：正式 opcode / `EstateSacrificeQuote` / 原子交班已接；局部键识别由 F2L 此前已落实 |
| S08 | F1b §6 | tech/06 的共享 base、时代增量、2K/4K 与真机门禁 | 此前已落实：结构已统一；真实浏览器 / 真机证据遗留到阶段出口 |
| S09 | F1t T12 | tech/01/05 的 checkpoint 与自动档恢复语义 | 本次已改：悔招 checkpoint 仅进程内；进程中断只恢复战斗前自动档 |
| S10 | F1t T31–T33；P01/P08/P13/P14.R | tech/04 的剧情 schema、局部键和 ID owner | 此前已落实：通用 `quest.v1`、局部作用域 lint 已在；逐章草稿数量不硬编码，`dc_*` owner 裁定仍遗留 |
| S11 | F1t T45；H1.R §6 | tech/04/05/09 的传承 schema、运行时、测试与阶段门 | 本次已改：接入五表、39/117/39/39 闭合、`qiyu`、双收据、LEG-V01–V10 / LEG-T01–T15 |
| S12 | F1n §6 | tech/05 的统一伤害结算与金标准 | 此前已落实：继续消费 `design/04` 的区间取整、共享资源预留与规则真伤边界 |
| S13 | E3.R §6 | tech/01–08 的 P0–P16 映射与天龙切片 | 本次已改：旧 Phase 映射落文；P1/M2 固定一域、四局部切片、一幕 |
| S14 | E3.R §6 | tech/01/02 的 WebGPU 复评 | 本次已改：五项硬门先行，R09-S04 只作二级收益门 |
| S15 | E3.R §6 | tech/05/08 的 30 份跨引擎录像 | 本次已改：三文统一为发布候选建议门；真实账号限额仍遗留 |
| S16 | M1.R §6 | tech/04/05 的正式经脉 schema、事件与 keyed RNG | 本次已改：五个斜杠主题、S0–S8、ordinal / outbox 与辅助字段对齐 |
| S17 | M1.R O15-03/O15-04 | tech/04/05 的 Buff 施加上下文与缺引用策略 | 本次已改：`create/stack/refresh` 及正式构建直接 error 均落文 |
| S18 | D01/D07/D14.R §6 | tech/04/05 的章节特色字段、原子提交与旧档缺省 | 遗留：应由归属文档先汇总为正式通用 schema；本次不把逐章 provisional 载荷写入技术真源 |
| S19 | D02.R §6 | tech/04 的章节特色装配 schema | 遗留：华山、九阴、厨艺、西征字段尚未由设计归属统一，避免技术侧逐章造联合 |
| S20 | D06.R §6 | tools/lint 的 `bs_chNN_intro` 参数族 | 遗留：`bs_ch06_intro` 尚无 owner 中的实际 Ink 节点定义；不以通配符吞掉缺节点错误，交 design/02 / F2a 登记或 remap |
| S21 | D13.R §6 | tech/06/07 的 `vid_sleep_12_13` | 此前已落实：合法相邻书眠参数族、24 秒目标与静帧降级均已覆盖 |
| S22 | P11.R §6 | tech/05 的非致命结算去重 | 遗留：四个局部证据键须先映射正式 `enc_*`，并由 design/09/12 定义计数生命周期 |
| S23 | R03/R06/R09.R 与协调备忘 CN-09/CN-10 | tech/03–07 的合法 STD、Buff 目录与素材计数 | 本次已改：247 Buff 与素材候选预算已更新；STD / Buff 运行契约此前已落实 |
| S24 | _coordinator-notes CN-11 | tech/02/05 的六角尺度消费 | 此前已落实：技术侧按 design/09 六角口径消费；design/08 的 1 m 旧表述仍交 F2a / F2 回写 |

### 7.5 遗留清单（按严重度）

#### 高：阻断正式构建或跨文档确定性

- `design/07-set-system.md` 缺失，C22 的成员 ↔ `setTags` 检查实际跳过；应先补唯一归属文档，再启用双向 hard error。
- `design/map/*.yaml` 尚未完成 19→30 区原子迁移；继续保持 `TS-CONTENT-MAP-030` 阻断，不能只改包名或章节引用。
- `design/12` 的 `legacy/completeSynthesis.recipeId`、`design/20` 的 `legacy/synthesisStarted.recipeId` 与正式 `recipeKey` 漂移；两处需一起改并补迁移 / 重放夹具。
- 全仓仍有 160 个 baseline 内未定义 ID；F2 各归属组必须清零后，才可刷新空 baseline。

#### 中：上游契约或目录待补

- `npc_zhujue`、`npc_shuling` 在技术文档有 4 次有效引用但未由 `design/18` 登记；不得由素材文档反向定义。
- 39 个 `it_xinwu_*` 仍缺 Canon §18 所要求的 ItemDef；应由 `design/10` 登记本体，`design/20` 只保留传承用途 / 配方。
- `LegacyCacheRuntimePhase` 五值和统一 `sectTrainingMult` DTO 尚未由各自上游定稿；技术侧继续使用 §4 的默认值并显式标【建议值】。
- `design/09` 文字已有 `openingPriority`，正式排序公式尚未纳入；技术侧默认 0，不得形成第二套战斗规则。
- 各 D/P 章节的特色载荷、非致命证据和逐章数量仍属 provisional；应先在 design/09/12 收敛通用字段，再生成 tech/04 schema。

#### 低：需真实环境或产物证据

- 三类真机、WebGPU P95 / 画面 / 能耗、完整素材包体、编码、Cloudflare 账号限额、备份恢复及 30 份跨引擎录像均仍为 **（待实测）/（待核实）**。

#### 建议引用方改名

- 四个短经脉 ID 应按既有迁移表改为 `mer_renmai / mer_dumai / mer_chongmai / mer_daimai`；旧名只进 remap。
- `q_08_side_91_done`、`q_08_side_92_done` 外形是状态键；F2d2 应改引正式旗标，或在确为任务时登记 QuestDef，不能仅为 lint 定义假任务。
- 任何正向 `vid_sleep_14_15` 都应按具体结局改引三个 `vid_end_*` 之一；`chapters/14` 当前三处均是否定句，不需要改名。

#### 交其他组

- F2a：补 `design/07`、39 个 `it_xinwu_*` ItemDef、`openingPriority` 公式、19→30 区迁移，并裁定 `bs_ch06_intro`。
- F2b：登记主角 / 书灵 NPC，统一 `sectTrainingMult`，修复 design/12 / 20 的 `recipeKey` 漂移并定缓存 phase。
- F2c：执行四个短经脉 ID 迁移并复核武学 / Buff 引用闭合。
- F2d2 / F2：保持 `chapters/14` 三处否定语义，不登记 `vid_sleep_14_15`；若改成正向引用则必须改用 `vid_end_*`。
- F2 汇总：收口剩余 160 个 ID、核实默认扫描为 0，再统一刷新 baseline；不得用扩大豁免代替归属登记。

### 7.6 最终验收自检

| 验收项 | 状态 | 证据 / 说明 |
|---|---|---|
| 写入范围 | ✅ | `git status --short` 仅含 `docs/tech/01–09`、`tools/lint/check_ids.py`、`tools/lint/test_check_ids.py` 与本报告；未修改 Canon、decisions、TODO 或设计 / 剧情文档 |
| 事实优先级与唯一归属 | ✅ | 当前事实按作者决定 / 需求、Canon v1.2、rulings、归属文档顺序核对；跨组缺口只引用或登记到 §6 / §7.5，未越权补定义 |
| Canon v1.2 与版本标记 | ✅ | 九份文档当前上游引用均为 v1.2，版本行均含“全局审计（2026-09-26）”；剩余 v1.1 只出现在“已采纳”历史追溯 |
| C01–C23 / AR-01–AR-13 | ✅ | 已逐项列于 §7.2 / §7.3；本组可改项均已落实，C22 等跨组前置缺口明确列为遗留 |
| ID 闭合与过渡基线 | ✅ | 默认 JSON 扫描为 160 个未定义 / 503 次引用；本组 owner 缺口 0、deprecated 0、冲突定义 0、strict 新债 0；未刷新 161 键过渡 baseline |
| `vid_sleep_14_15` 边界 | ✅ | 未创建定义；仅精确 ID + 同句否定词豁免。合法 13 条相邻书眠和 3 个独立 `vid_end_*` 已落文，正向引用回归用例仍报错 |
| lint 回归 | ✅ | `python3 -m unittest -v tools.lint.test_check_ids`：35/35 通过；`python3 -m py_compile tools/lint/check_ids.py tools/lint/test_check_ids.py`：通过 |
| 全仓 ID 门禁 | ✅ | `python3 tools/lint/check_ids.py --json` 完成 93 文件 / 47,134 occurrences / 10,648 definitions；`python3 tools/lint/check_ids.py --strict` 退出 0 |
| 文档结构 | ✅ | 九份 tech 均保持“项 / 内容”头表、TL;DR、参考资料、术语、待决事项顺序；Markdown 围栏成对，忽略行内代码后各表列数一致 |
| 完整性与占位 | ✅ | 无截断句、未闭代码块或“此处省略 / 待补充”占位；`TODO.md` 命中均为合法文件引用；既有待决项保留并以“已解决”追溯 |
| 变更规模 | ✅ | 九份 tech 相对 HEAD 行数变化为 0%～+2.87%，无文件缩短，更未触及 15% 拒绝线；改动均为局部同步 |
| 差异卫生 | ✅ | `git diff --check` 通过；最终工作树无写集外文件 |
| 未核实事项 | ⚠️ | 真机 / 账号 / 真实素材包与跨引擎录像尚未执行，均保持（待实测）或（待核实）；跨组遗留与默认值见 §4、§6、§7.5 |

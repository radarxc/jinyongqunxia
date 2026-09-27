# F1t 报告 · 跨文档同步落实 · 技术（tech/01–08）

## 1. 摘要（3–6 行）

- 已通读 `TODO.md`、事实优先级文件、作者需求、协调者备忘及全部代理报告，并将初稿/审校稿同义交接合并，以审校稿为准核对 `tech/01–08`。
- 八份技术文档均更新为 `v1.2（跨文档同步，2026-09-26）`；Core、确定性、六角渲染、性能、内容 schema、玩法状态、素材与后端接口已形成同一套术语和边界。
- 处理总表共 **48 项**：**此前已落实 2 项，本次已改 40 项，遗留 6 项**；遗留均因缺正式上游、需要设计裁定或必须真机/真实产物验证，没有用技术文档越权定规则。
- `design/map/*.yaml` 仍是 19 粗区，故明确以 `TS-CONTENT-MAP-030` 阻断生产构建；缺失的 `design/20` 只保留扩展边界，不猜 schema。
- 静态格式与差异检查完成；全仓严格 ID 门禁仍受仓库既有未定义引用影响，具体结果见 §7.2。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 本次主要落点 |
|---|---:|---|
| `docs/tech/01-architecture.md` | 1,760 | §3.6–§3.7 Core API / 原子读档 / Worker；§4–§8 四档、目录、私有托管、确定性；§6.9 CAS |
| `docs/tech/02-rendering.md` | 2,056 | §0–§2 全国图、30 区、pointy-top 六角；§8–§11 预算、整数分频、T0–T3、范围预览 |
| `docs/tech/03-mobile-performance.md` | 2,102 | §2 逻辑/表现单位与 AI 预算；§5 256 KiB；§7–§9 真机、缓存与 `.tsav` |
| `docs/tech/04-data-pipeline.md` | 1,670 | §2–§5 ID/schema/59 hooks/50 `OpId`/跨域 lint；§3.7 地图；§8 hash；§11 CI |
| `docs/tech/05-gameplay-engine.md` | 2,093 | §3 Core 状态与书眠事务；§4–§9 确定性/六角/战斗/Buff；§10–§14 正式状态与录像 |
| `docs/tech/06-asset-storage.md` | 2,347 | §1–§5 地图、角色、图标、`battle8`、视频；§7–§9 私有分发和缓存 |
| `docs/tech/07-asset-generation.md` | 1,968 | §1–§6 根契约、地图/NPC/图标/`battle8` 生产；§8 容量与工时锚 |
| `docs/tech/08-backend-and-online.md` | 2,991 | §3–§5 原子读档/CAS/Meta；§8 私有部署；§9 NPC 归属；§10 战斗域录像 |
| `tools/agents/reports/F1t.md` | 150 | 本报告；来源去重、遗留、跨组同步与逐项状态 |

## 3. 关键结论与数值

1. **Core 唯一协议**：`GameplayCore = Core`；`dispatch(command)` 与单步 `tick()` 均返回 `DispatchResult`，成功字段为 `stateVersion`；`snapshot()` 返回脱离活树引用的 JSON 快照。读档必须“完整校验 → 构造候选实例 → 只读冒烟 → `CoreHost` 原子换载”。
2. **战斗确定性**：CT 内部范围 `[-1000, 1299]`，行动阈值 1000；AI seed 只预览，成功命令才消费。AI `workBudget` 暂为 1,024 / 4,096 / 16,384 / 32,768【建议值】，5 / 15 / 40 / 80 ms 仅为 host SLO。
3. **录像边界**：runner 五元键为 `appBuild + coreVersion + rulesProtocol + rngProtocol + contentHash`；hash 域为 `['tianshu:battle-replay:v1', appBuild, coreVersion, rulesProtocol, rngProtocol, contentHash, runtimeMartialArts, session]`。只上传 `BattleReplayV1` 战斗域，不上传完整 `GameState`。
4. **地图与区域**：全国图 4096×3072（4:3），共享 base + 14 个时代增量；low 为 2048×1536，mid/high 为 4096×3072；512² 切片为 `8×6=48`。正式闭集为 30 区、189 城、99 门派、3 图外节点；当前 19 区源尚未迁移。
5. **六角与性能**：pointy-top 轴坐标、6 向逻辑、可选 12 向瞄准；16 / 24 / 30 / 30 是四档活动**表现**单位预算，不得删减 core 逻辑单位。原始 JSON 叶片与单次解析均 ≤256 KiB。区域基础包 25 MB + 时代状态包 12 MB = 37 MB【建议值】，双区原子切换缓存峰值 `2×37=74 MB`【建议值】。
6. **素材方向**：`battle8` 提供完整 8 视图；固定镜头驻留 6、旋转瞬时 8；`battle4` 仅能作为历史迁移输入。物品/装备约 93 个独立图标、约 40 个模板族；成对兵器输出双外观与双手挂点。
7. **内容管线**：59 hooks、50 `OpId` 与 expression opcode 从同一 registry 生成；CI 首步为 `python3 tools/lint/check_ids.py --strict docs`。`idRemaps.since` 表示重命名前最后可读旧 `contentHash`；Boss 正式 ID 使用 `bsc_*`。
8. **作者新增系统**：`tech/04/05` 已消费 `design/12/15/16/17/18/19` 的正式接口；资源与职位前缀统一为 `res_/rp_/sv_/biz_/job_`。`frag_/lgs_/cache_` 因 `design/20` 缺失只作预留，不能视为正式 schema。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本次默认值 / 后续动作 |
|---|---|---|
| F1t-O01 | 行动开始 checkpoint 与战斗前自动档的玩家可见恢复语义冲突 | 默认保留 `tech/05` 的战内内存 checkpoint/悔招与 `tech/01` 的常规战斗前自动档，不宣称崩溃后恢复到行动开始；由 `design/09`、`design/13` 裁定后再统一 |
| F1t-O02 | 24 个活动表现单位及 105 MB 角色精灵 / 160 MB GPU 总预算是否能在目标设备达标 | 默认保留为 `mid` 预算，不降低逻辑单位；按作者主力手机、中端 Android、iPad 三类设备（待实测） |
| F1t-O03 | 区域包 25 MB、时代状态包 12 MB、双区 74 MB 峰值是否适合真实产物 | 默认作为 CI 警戒值【建议值】；用真实 30 区地图、KTX2 与音频产物复核后收口 |
| F1t-O04 | AI `workBudget`、64 KiB 快照和 2 ms clone 目标 | 默认沿用 §3 数值；只允许版本化调参，不按墙钟或设备改变确定性搜索边界（待实测） |
| F1t-O05 | `design/20` 的传承字段、ID 与生命周期尚不存在 | 默认只保留 `frag_/lgs_/cache_` 扩展点，禁止生产数据引用；待归属文档落盘后再补 strict schema 与迁移夹具 |
| F1t-O06 | 剧情报告中的逐章数量、四类非致命收束、`chapterKillCount`、`ev_*`/`dc_*` 所有权尚无统一正式数据源 | 默认只保留通用 Quest/Decision/Event 与战斗 finalize 能力，不硬编码 provisional 数量或新造持久字段；等 story/quest 权威数据落盘后接入 |
| F1t-O07 | `@cloudflare/vitest-pool-workers@0.22.0`、浏览器版本、价格与限额可能漂移 | 实施默认 `services/api` 独立 Vitest 4；所有版本/价格/API 限额在安装或部署日重新核实（待核实） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| F1t-P01 | 基准 §19 登记 Core 单步 `tick()`、`meta.stateVersion`、候选实例原子换载、AI seed 提交消费与战斗域 hash | 这些是 `tech/01/05/08` 共同依赖的可重放不变量，避免后续实现重新分叉 |
| F1t-P02 | 基准 §19 登记 `QualityTier` 四档、`sourceRefreshHz → pacingFps` 稳定整数分频、会话内自动只降不升及 T0–T3 | 画质、性能与素材三文档已共同采用，需要上升为跨文档契约 |
| F1t-P03 | 基准 §12/§18 登记 30 区正式闭集迁移门禁，以及 `res_/rp_/sv_/biz_/job_`；`frag_/lgs_/cache_` 待 `design/20` 冻结后再决定 | 防止 19 粗区数据或未定传承前缀被误当生产事实 |
| F1t-P04 | 基准 §19 登记规则/文本原始 JSON 叶片及运行时单次 parse 均 ≤256 KiB | 消除 300 KB、256 KB、分片与解析四种混用口径 |
| F1t-P05 | 基准 §19 登记私有同源 Worker Static Assets、槽位 `rev` CAS、自动档设备命名空间、具名槽人工选冲突及落选版至少保留 30 天 | 统一架构、存储与后端的不丢档/不公开边界 |
| F1t-P06 | 基准 §19 登记 `BattleReplayV1` 仅覆盖战斗域，runner 使用五元键且禁止上传完整 `GameState` | 将遥测最小化与确定性兼容同时固化，避免后端扩张为第二套玩法状态源 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `tools/agents/reports/_coordinator-notes.md` / 后续 F2 | CN-01、CN-02、CN-03、CN-07、CN-09、CN-10、CN-11 | 分别处理五绝图鉴预算、药王门品阶、门派候选 ID、经脉 ID 回写、合法 STD 与模拟金标、Buff 收录、六角 1 m 尺度裁定；均非技术组唯一归属，本任务未越权修改 |
| `docs/design/map/*.yaml`、`design/17`、章节地图引用 | 19→30 区迁移 | 原子更新区域定义、189 城归区、几何/邻接、路线、门派派生区域、包名与章节引用；在完成前 `tech/04` 保持 `TS-CONTENT-MAP-030` 阻断 |
| `docs/design/20-legacy-inheritance.md`（缺失） | 正式 schema / 校验 / 生命周期 | 定义跨年代传承后，向 `tech/04/05` 输出正式字段、前缀和迁移规则；当前不得将扩展点当作已实现 |
| `docs/design/09-combat-system.md` | 范围结算 / 首轮 / 恢复语义 | 补 `openingPriority` 入排序公式；统一与 `design/13` 的行动开始 checkpoint、战斗前自动档及崩溃恢复边界 |
| `docs/design/11-open-world.md` | §6.1 示例 | 将 `core.tick(1)` 改为单步 `core.tick()`，批量追帧由 host 重复调用 |
| `docs/design/12-quests-npc-factions.md`、`docs/design/16-resources-and-estates.md` | 历史 provisional 追溯 | 将已被正式 schema 替代的 provisional 文字改为“已解决”，同时保持定义唯一归属 |
| `docs/design/18-npc-and-companions.md` | `CompanionSnapshot` 示例 | 去除重复 `level/innates` 声明并统一事件名 |
| `docs/design/13-progression-and-endings.md` | §9.4 Meta 边界 | 对齐确定性 `MetaProfileIntent.intentId`、规则投影 revision、ack 边界；平台墙钟不回流 core |
| `docs/design/04-damage-formula.md`、`tools/balance/damage_sim.py` | 合法 STD 与节奏金标 | 按普通装备 ≤地上 9 的合法 STD 重生节奏表与 golden；旧脚本 36/36 PASS 只证明旧输入自洽 |
| `docs/design/06-buff-system.md` | 正式 Buff 目录 | 落 CN-10 与 R06/R13 交接的 Buff；素材和 runtime 仅消费正式目录，不能由技术文档反向定义 |
| `docs/design/story/*`、`docs/design/chapters/*`、`docs/design/12-*` | 正式剧情/任务生产数据 | 冻结 Quest/Decision/Event ID、旗标与逐章节点后，再由通用管线接入；P11 四类非致命收束、`chapterKillCount` 与 P13 story 所有权同时裁定 |
| `TODO.md`、`docs/decisions/*` | F1t 状态与提案 | 由调度器登记本报告计数、遗留与 F1t-P01～P06；本任务无写权限 |

## 7. 自检与处理总表

### 7.1 处理总表

说明：初稿与审校稿同义项合并，以 `.R.md` 为优先来源；一个来源行若要求多个技术文档协同，按一个跨文档事项计数。

| 编号 | 来源 | 目标 | 状态 |
|---|---|---|---|
| T01 | A2.R §6（合并 A2 §6） | `tech/01/04/05/08`：来源品阶、Boss 例外、天书/藏史、分类抵消、门槛、经验、迁移 | 本次已改（`tech/04` §2.6、§3.10、§5.3–§5.4；`tech/05` §3.2、§11.5、§14；`tech/01` §3.6；`tech/08` §3.6） |
| T02 | A2.R §6（合并 A2 §6） | `tech/02/03/07`：24 活动单位、目录、视频、方向与预算 | 本次已改（`tech/02` §1–§2、§8–§10；`tech/03` §2、§8；`tech/07` §5.4、§5.7） |
| T03 | B1.R §6（合并 B1 §6） | `tech/01`：bp、区边界取整与 RNG 契约追溯 | 本次已改（`tech/01` §8.3、待决事项） |
| T04 | B1.R §6（合并 B1 §6） | `tech/05`：整数 bp、Z0、`DamageTrace`、`Settlement` 与 golden | 本次已改（`tech/05` §4.3、§8、§15） |
| T05 | B2.R §6（合并 B2 §6） | `tech/06/07`：主角/书灵、时代装、13 段书眠视频及序章/终局资源 | 本次已改（`tech/06` §1.2、§4、§5.8；`tech/07` §3、§5.7） |
| T06 | B3.R §6（合并 B3 §6） | `tech/02/03`：30 区、160² 常规/256² 压力、区域包与解析 | 本次已改（`tech/02` §0.5、§2.2；`tech/03` §2.8、§5.6、§8） |
| T07 | B3.R §6（合并 B3 §6） | `tech/04`：正式地图/时代 schema、V-OW01–V-OW26、旧 Boss ID | 本次已改（`tech/04` §2.6、§3.7、§5.4、§5.7） |
| T08 | B3.R §6（合并 B3 §6） | `tech/05`：10 Hz、机会点 RNG、战斗暂停、确定性快进 | 本次已改（`tech/05` §4–§5、§7） |
| T09 | B3.R §6（合并 B3 §6） | `tech/06`：区域基础包 + 时代状态包 + 章节剧情依赖 | 本次已改（`tech/06` §4.1–§4.5） |
| T10 | B4 §6 | `tech/04/05`：正式 Quest schema、Ink bridge、阶段事务与幂等 | 本次已改（`tech/04` §3.4–§3.5、§7；`tech/05` §10） |
| T11 | B4 §6 | `tech/08`：NPC 人设归 `design/18`，任务效果封顶归 `design/12` | 本次已改（`tech/08` §1.2、§1.4、§9.5–§9.7、待决事项） |
| T12 | B5.R §6（合并 B5 §6） | `tech/01`：行动开始 checkpoint / 战斗前自动档及双指轻点 | 遗留（恢复语义跨 `design/09`/`13` 有冲突；建议先裁定崩溃恢复层级，默认见 F1t-O01） |
| T13 | B5.R §6（合并 B5 §6） | `tech/06`：4:3 大地图、多时代派生与瓦片 | 本次已改（`tech/06` §1.2、§3.3、§4、§5.3） |
| T14 | B5.R §6（合并 B5 §6） | `tech/01/03`：44 pt / 44 CSS px / 24 dp 浏览器表述 | 本次已改（`tech/01` §6.5；`tech/03` §6.5、待决事项） |
| T15 | B5.R §6（合并 B5 §6） | `tech/03/08`：新存档扩展名 `.tsav` | 本次已改（`tech/03` §3.8；`tech/08` §3） |
| T16 | B6a.R §6（合并 B6a §6） | `tech/01/02/06/07/08`：Worker、四档、字体、媒体、T0–T3、`battle8`、迁移 UI | 本次已改（`tech/01` §3.7、§4、§6；`tech/02` §10；`tech/06` §4–§8；`tech/07` §5；`tech/08` §4.11） |
| T17 | B6a.R §6（合并 B6a §6） | `tech/04`：规则/文本分片和 parse 边界 | 本次已改（`tech/04` §1.2、§8.3–§8.4） |
| T18 | B6b.R §6（合并 B6b §6） | `tech/01/03/04/05/06`：CAS、私有托管、协同验收、manifest、录像、单线路 | 本次已改（`tech/01` §6.9、§7.6、§8.3；`tech/03` §3.8、§8；`tech/04` §8；`tech/05` §14；`tech/06` §7–§9） |
| T19 | B7.R §6（合并 B7 §6） | `tech/04/05`：正式资源/职位键、lot、客卿唯一、事务与书眠清理 | 本次已改（`tech/04` §3.9、§5.4；`tech/05` §10–§11） |
| T20 | E1.R §6（合并 E1 §6） | `tech/01/03/07/08`：256 KiB、根契约、VFX、`idRemaps.since` | 本次已改（`tech/01` §3.7；`tech/03` §2.8、§5.6；`tech/07` §1、§6；`tech/08` §3.6） |
| T21 | E1 §6 | `tech/02/06`：共享区域底图、时代 patch、最终 `RegionMap` 与 manifest | 本次已改（`tech/02` §2.1–§2.2；`tech/06` §4） |
| T22 | E2.R §6（强制） | `tech/01` §3.6：Core/API/版本/单步 tick/原子读档/快照 | 本次已改（`tech/01` §3.6） |
| T23 | E2.R §6（强制） | `tech/01` §8.3：10 Hz、负 CT、AI seed、replay hash 域 | 本次已改（`tech/01` §8.3） |
| T24 | E2.R §6（强制） | `tech/03`：确定性 `workBudget` 与墙钟 SLO、64 KiB / 2 ms | 本次已改（`tech/03` §2.3、§6.3、§8.4） |
| T25 | E2.R §6（强制） | `tech/04`：同源 59 hooks / 50 `OpId` / opcode，接正式 12/15/16 | 本次已改（`tech/04` §3.4–§3.9、§4.6、§11） |
| T26 | E2.R §6（强制） | `tech/08` §10：版本字段、战斗域 hash、动态闭包、中间 hash、不传完整状态 | 本次已改（`tech/08` §10.1–§10.4） |
| T27 | E2.R §6（强制） | `tech/08` / `tech/05`：确定性 Meta intent、投影 revision、ack、墙钟隔离 | 本次已改（`tech/05` §3.2–§3.4；`tech/08` §4.10） |
| T28 | L1b §6 / CN-08 | `tech/04`：旧 Boss ID 与全仓 ID CI 首步 | 本次已改（`tech/04` §2.6、§11） |
| T29 | M1 §6 / AR-03 | `tech/04/05`：正式经脉 schema、事务、keyed RNG、事件 | 本次已改（`tech/04` §3.8；`tech/05` §11.1） |
| T30 | N1.R §6 / AR-09 | `tech/04/05`：NPC 两阶段闸门、持久状态、重逢与 UUID | 本次已改（`tech/04` §3.10；`tech/05` §12） |
| T31 | P01 §6、P02.R §6、P14 §6 | `tech/04/05`：逐章 Quest/Decision/Event 数量与 provisional YAML | 遗留（逐章数字和字段仍是 story 草稿；建议正式数据冻结后通过通用 schema 导入，不硬编码报告数量） |
| T32 | P11 §6 | `tech/05`：四类非致命收束与 `chapterKillCount` | 遗留（缺归属文档统一持久 schema；建议 `design/09/12` 先定义结算事实与计数生命周期） |
| T33 | P13 §6 | `tech/04`：story `ev_*` owner 与 `dc_*` 登记 | 遗留（须先由基准/归属文档接纳 story 所有权；建议接纳后扩展 ID registry 与严格门禁） |
| T34 | R02 §6 | `tech/04/05/06/07`：来源状态、原子书眠、突破草稿、书眠视频映射 | 本次已改（`tech/04` §3.10；`tech/05` §3、§14；`tech/06` §3–§5；`tech/07` §5.7） |
| T35 | R05 / R06 / RCw §6 | `tech/05/06`：武功、Buff、效果钩子/条件、DSL、负 CT 与图标母题 | 本次已改（`tech/05` §6–§9、§15；`tech/06` §3、§11） |
| T36 | R08 / R09.R §6（合并 R09） | `tech/01/02/03/05/07`：六角 DTO、投影/拾取、性能、寻路/范围、`battle8` | 本次已改（`tech/01` §3.6；`tech/02` §1–§2；`tech/03` §2、§8；`tech/05` §6–§7；`tech/07` §5.4） |
| T37 | R10 §6 | `tech/06/07`：约 93 图标、约 40 模板族、正式逻辑键、成对双手挂点 | 本次已改（`tech/06` §1.2、§3.3；`tech/07` §5.6.2） |
| T38 | R13 §6 | `tech/01/04/05/07/08`：经验/余韵、28 变体、结局素材与 Meta 同步 | 本次已改（`tech/01` §3.6；`tech/04` §3.4、§5.4；`tech/05` §11.5；`tech/07` §5.7；`tech/08` §4.10） |
| T39 | RT1 §6 | `tech/02/03/04/05/06/07/08`：C21 追溯、真机、根契约、正式系统、四档与部署 | 本次已改（各文对应 §1–§11；历史待决已改为已解决，实测项保留） |
| T40 | RT2 §6 | `tech/01/03/04/05/06/07`：异步渲染、六角 RegionMap、纹理/精灵与相机契约 | 本次已改（`tech/01` §4.3；`tech/03` §2；`tech/04` §3.7、§6；`tech/05` §6；`tech/06` §5.2、§5.5；`tech/07` §5.4–§5.5） |
| T41 | RT6 §6 | `tech/01/02/03/04/07/08`：`injectManifest`、双轴分包、预算、引用图、生产契约与鉴权路由 | 本次已改（`tech/01` §7.2；`tech/02` §2；`tech/03` §2/§5；`tech/04` §3.7/§4.7；`tech/07` §5–§6；`tech/08` §5.9） |
| T42 | RT7 §6 | `tech/01/02/06/07`：根 `packages/spec`、palette、`battle8` 页组与视频映射 | 本次已改（`tech/01` §4；`tech/02` §2.6、§5；`tech/06` §3–§5；`tech/07` §1、§5–§6） |
| T43 | W1.R §6（合并 W1 §6） | `tech/04/06`：地图 schema、4096×3072、共享 base + 时代增量、AssetKey/切片 | 本次已改（`tech/04` §3.7；`tech/06` §1.2、§3.3、§4、§5.3） |
| T44 | 作者需求 AR-04/05/06/07/08/09/11/12 | `tech/02–07`：地图、资源营生、门派、NPC、六角及资产接口 | 本次已改（`tech/02` §0.5；`tech/04` §3.7–§3.10；`tech/05` §6、§10–§12；`tech/06/07` 上下游接口） |
| T45 | 作者需求 AR-13 | `tech/04/05`：跨年代传承 schema、生命周期与迁移 | 遗留（`design/20` 缺失；建议正式文档落盘后再接 strict schema，不猜字段） |
| T46 | R08 / AR-12 | `tech/02`：pointy-top 与 `HexDir` 基础约定 | 此前已落实（仅指既有基础约定；六角 DTO、拾取与运行时接线见 T36） |
| T47 | B6a.R §6 | `tech/08`：8 位、5 分钟临时配对码 | 此前已落实（仅指既有配对码；四档、素材与迁移 UI 等同步见 T16） |
| T48 | 协调备忘 CN-01～CN-11 | 技术组与跨组接收方：图鉴/设计/工具债 | 遗留（CN-01/02/03/07/09/10/11 非本组归属，建议交对应 F2/A3/CX；CN-08 已由 T28 落实；其余协调项已有归属） |

计数：**此前已落实 2 项；本次已改 40 项；遗留 6 项；合计 48 项。**

### 7.2 自检

| 验收项 | 结果 | 说明 |
|---|---|---|
| 写入范围 | ✅ | `git status --short` 仅列八份 `docs/tech/01–08` 与本报告，均在授权范围 |
| 版本 | ✅ | 八份文件均为精确字符串 `v1.2（跨文档同步，2026-09-26）` |
| 来源收集 | ✅ | 已读全部报告；总表对初稿/审校稿同义项去重，E2.R 技术组 6 条逐项列出 |
| 归属边界 | ✅ | 设计规则均引用 `design/*`；技术文档只定义 schema、事务、渲染、存储、性能与验证入口 |
| Core / 后端一致性 | ✅ | `Core`、`stateVersion`、单步 tick、候选实例读档、负 CT、AI seed、录像 hash 与上传边界一致 |
| 内容管线 | ✅ | 同源 59 hooks / 50 `OpId` / opcode；正式 12/15/16/17/18/19 接口；CN-08 为 CI 首步 |
| 地图 / 六角 / 资产 | ✅ | 30 区目标与 19 区迁移阻断并存；4096×3072、时代增量、pointy-top、`battle8` 与地图素材契约一致 |
| 数值推导 | ✅ | 关键数值保留算式：48 切片、2.56× 压力比、37/74 MB 闭包、活动表现单位四档 |
| 遗留诚实性 | ✅ | 缺 `design/20`、剧情正式 schema、恢复语义与真机/产物验证均未冒充完成 |
| Markdown 完整性 | ✅ | 八份围栏数依次为 60/62/64/52/104/118/50/108，均为偶数；文末章节顺序正确；占位扫描无命中；`git diff --check` 通过 |
| ID 门禁 | ✅ | 严格检查当前 242 个失败（全为既有未定义引用），HEAD 为 246（245 未定义 + 1 活跃废弃）；新增问题 0，移除问题 4 |
| 文件缩短比例 | ✅ | 对比 HEAD，八份变动为 +1.38%/+0.29%/+1.50%/+6.64%/−1.69%/+0.64%/+0.56%/+0.07%，均未缩短 15% |

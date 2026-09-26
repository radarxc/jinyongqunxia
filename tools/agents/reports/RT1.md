# RT1 报告 · 修订 tech/01 总体架构与选型（评审 + 冲突 + 考据）

## 1. 摘要（3–6 行）

`docs/tech/01-architecture.md` 已修订为 v1.1（审校修订，2026-09-26），完成 F1 完整评审、C18/C21 冲突收敛、Canon v1.1 对齐、作者决定 P01/P03/P04/P53 与 AR-01～AR-12 的架构接口落实。
C18 将跨语言静态契约唯一收敛到根 `packages/spec/`；C21 定稿四档 `QualityTier`、三档素材复用和异步 `RenderWorld`，并把 WebGPU 完整 render 预算从错误的 260 KB 修正为 300 KB 闸门，当前估算 330 KB，仍不通过。
评审另修正了 Worker 大对象回传、iOS BGM 音量、`deviceMemory` 判档、六角运行时契约、TypeScript 升级条件、CI 跨工作流产物断链、公开 Pages 与“不公开分发”的冲突，以及 YAML 示例语法。
版本、API、浏览器支持、云服务配额与 Action 版本已尽量用公开资料复核；修订后剩 5 处（待核实）、11 处（待实测）、0 处（待考），均有安全默认值，不阻塞 WebGL 基线路线。
正文已通过 Markdown 结构、YAML、TypeScript 片段和差异检查，可供 `tech/02`～`tech/09` 下游引用；需跨文档同步的事项集中列于第 6 节。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 产出 |
|---|---:|---|
| `docs/tech/01-architecture.md` | 1,736 | v1.1 总体架构定稿；12 个主体章节，另含参考资料、术语/约定与待决追溯 |
| `tools/agents/reports/RT1.md` | 186 | 本次冲突、作者决定、AR、核算、标注、开放问题与跨文档交接报告 |

主要增修：

- §1～§3：同步 Canon v1.1、作者决定和 AR-01～AR-12 的分层接口；明确大地图仅作导航/UI，区域抵达后才挂载；战斗运行时统一 pointy-top 六角轴坐标。
- §2、§5：复核候选库版本与评分，重算 WebGL/WebGPU 同功能包体、路线预算与切换闸门。
- §3～§6：补齐 Worker 边界、根 `packages/spec/` 契约包、四档画质、完整异步 `RenderWorld`、iOS WebAudio 增益链和 `deviceMemory` 三轴判档。
- §7～§8：修复私有部署方案、CI workflow 断链与 YAML 语法；更新 TypeScript 6/7 兼容条件和确定性数学规则。
- §10～文末：更新风险、资料来源、C18/C21/重命名/Buff 迁移检查、既有待决项追溯与 O1～O7 默认值。

相对 HEAD：原文 1,629 行，修订稿 1,736 行，净增 107 行（`107 / 1629 = 6.57%`）；`git diff --numstat` 为增加 256 行、删除 149 行，不存在缩短 15% 的问题。

## 3. 关键结论与数值

### 3.1 冲突、裁定迁移与接口定稿

| 项 | 改了哪里 | 定稿结果 |
|---|---|---|
| C18 | TL;DR、§3.1、§4.1～§4.3、§9.3、术语与待决追溯 | 跨 TypeScript/Python/Blender/运行时的静态 JSON 契约唯一位于根 `packages/spec/`（`@tianshu/spec`）；`packages/data` 只保留内容 schema、Zod 类型和构建校验，不复制契约。依赖图明确 render、data 构建器、asset-pipeline 与 Python/Blender 都消费 spec。本文是该目录裁定的落地权威位置。 |
| C21 | TL;DR、§2.6、§4.3、§5.4、§6.1、术语与待决追溯 | `QualityTier = 'low' \| 'mid' \| 'high' \| 'ultra'`；素材仍为 low/mid/high，ultra 复用 high。`createRenderer`、`mountRegion`、`enterBattle`、`setQuality`、`playEvents` 均返回 Promise；补齐 `syncWorld`、`render(alpha)`、`cues`、`camera`、`showPath`、`tileAnchorToScreen`、`stats`，`pick(screen, mode)` 支持 tile/unit/any 并返回 `PickResult \| null`。完整 WebGPU render 上限为 300 KB，不再沿用旧 260 KB。 |
| 裁定重命名表 | 全文 ID/旧名扫描、术语末尾迁移检查 | `rulings-v1.md` §2 所列旧 ID/旧名无命中，故无机械迁移；新类型只使用通用 TypeScript 名，不新建业务内容 ID。 |
| C23 Buff 缺口清单 | §1.3、§3.2.1、§4.3、§8.3、术语与待决追溯 | 本文不定义具体 `bf_*` 实例；19 个目录缺口与撤回项继续由 `design/06` 唯一定义。运行时校验拒绝不存在的 Buff 引用，不允许用 `bf_tsp_*` 通配前缀冒充实例。 |

C21 最终异步入口：

| 入口 | 返回值 |
|---|---|
| `createRenderer(canvas, opts)` | `Promise<RenderWorld>` |
| `mountRegion(region, assets)` | `Promise<void>` |
| `enterBattle(grid)` | `Promise<void>` |
| `setQuality(tier, overrides?)` | `Promise<void>` |
| `playEvents(batch, speed)` | `Promise<void>` |

### 3.2 Canon v1.1 与作者决定

| 来源 | 检查与落实结果 |
|---|---|
| Canon V11-01～08、V11-43、V11-R08 | ID 前缀、战斗/书眠脚本前缀、存档容器与校验入口按 Canon 使用；本文不另造内容 ID。`packages/spec/` 与 `packages/data` 的边界用于承载跨工具契约和内容 schema。 |
| Canon V11-09～16、V11-18～40、V11-R01～R06 | `WorldState`、Command/DomainEvent、可重放确定性 core 与分包边界只承载真实/显示状态、天道压制、装备/存档/战斗等上游结果，不在架构文重定义公式。数值归属继续引用 `design/02`～`design/13`。 |
| Canon V11-17 | 内容校验中的完整原生天级池同步为高武 6–16，不保留旧 6–15；武学规模接口按 AR-01 支持约 1,100–1,150 门。 |
| Canon V11-31～32 | 装备与存档结构继续以 `design/10`/Canon §20 为源，不在架构层增加第二套携带槽规则。 |
| Canon V11-35 | UI、云同步、存档、水性等唯一归属保持分层引用；新增需求也只落实 DTO、事件、存档和包边界。 |
| Canon V11-36～39 | 战斗 core 保留队伍/AI 友军、负 CT、免费动作与倒地结果的可序列化承载能力，具体规则只引用 `design/09`。AR-12 的六角需求另按更高优先级接口落地。 |
| Canon V11-41、V11-R07 | 年代与原著考据不属于总体架构定义；本文不复制年表，也未新增未经核实的原著事实。 |
| Canon V11-42 | 不新增 `cook` 属性；资源与营生仅提供 AR-05/06 的通用 schema/命令/事件接口。 |
| 本文旧“对基准的修改提案” | 已由 v1.1 吸收的 ID、状态、归属边界和高武 6–16 等条目标为“已采纳（v1.1）”；新提案 RT1-P01～P03 单独保留待 A3 合入。 |
| 作者决定 P01 | §2.6、§10、§11、文末 P1/O1：必测矩阵固定为作者主力手机 + 一台中端 Android + 一台 iPad，型号、OS、浏览器/入口与实测档位现场登记。 |
| 作者决定 P03 | §1.1、§7.6、§10、文末 P6：暂不备案、不做国内/香港镜像；只走 Cloudflare Worker Static Assets + 会话闸门，不采用公开 Pages。 |
| 作者决定 P04 | §10 R6、文末 P13/O4：只选逐项核实许可的 OFL 标题/书法字体；未选定前使用系统字体回退。 |
| 作者决定 P53 | §1.1、§3.2.1、§6.4、文末 P9：大地图只负责导航/路线选择和旅程事件，抵达目的地后才挂载可行走 2.5D 区域。 |

### 3.3 作者新增需求 AR-01～AR-12

| AR | 改了哪里 | 落实结果 / 未在本文展开的原因 |
|---|---|---|
| AR-01 武学扩容 | §1.3、§3.2.1、§5.3、§7.5、§9.3 | `SkillDef`、索引、按书界分包与校验支持约 1,100–1,150 门；core 只解释效果原语，禁止逐武学硬编码。具体名录/比例归 `design/05` 与图鉴。 |
| AR-02 阴/阳/调和 | §1.3、§3.2.1、§7.5、§9.3 | 内功 schema 顶层 `nature` 必填且仅 yin/yang/harmony；非内功才可 neutral。伤害、冲穴和走火规则分别引用 `design/03`、`design/15`、`design/05`，本文不重定义。 |
| AR-03 冲穴 | §3.2.1、§3.6、§4.3 | 存档保留跨书界穴道/经脉/周天投影，core 发事件，UI/render 消费 DTO/Cue；穴位数、九转和速率归尚待产出的 `design/15`。 |
| AR-04 统一大地图/时代图层 | §1.1、§3.2.1、§6.4 | `WorldState` 区分导航层与已挂载区域；区域基础包与时代状态包组合。地理、时代与开放规则只引用 `design/11`/`design/19`。 |
| AR-05 资源/家丁 | §3.2.1、§3.6、§4.3 | 提供资源点、库存、家丁和周期结算的可序列化 schema/命令/事件；四阶九品、产出和跨界规则归尚待产出的 `design/16`。 |
| AR-06 城市营生 | §3.2.1、§3.6、§4.3 | 提供职位、雇佣、营业周期和冲突检查接口；赌场/镖局/山庄规则归 `design/16`，任务时序引用 `design/12`。 |
| AR-07 门派层级/月钱 | §3.2.1、§3.6 | 以稳定 `sect_*` 和抽象层级保存关系，显示称谓来自数据；五级层级、月钱与晋升规则归 `design/12`/`design/17`。 |
| AR-08 门派资料 | §3.2.1、§6.4 | 驻地、时代开放、称谓、服饰和武学均从书界/时代数据包读取；门派史与具体资料归 `design/17`，本文无平行名录。 |
| AR-09 NPC/同伴 | §3.2.1、§3.6 | `profile.companionLedger` 跨书界保存稳定 NPC ID、相遇时代、状态与加入快照，当前队伍仍属 `party`；招募难度、生卒与剧情归尚待产出的 `design/18`。 |
| AR-10 双主线 | §3.2.1、§5.1、§6.8 | 正/邪选择节点继续由 Ink 文本 + YAML 任务 schema 驱动，core 只解释条件、旗标和命令；十四书剧情由 `docs/design/story/*` 与 `design/12` 定义。 |
| AR-11 大地图绘制 | §1.1、§3.2.1、§6.4 | 全国 SVG/地图资产只在导航层使用，沿路旅行可发事件，抵达后才 `mountRegion()`；Albers 投影和图外节点归 `design/11`。 |
| AR-12 六角战棋 | TL;DR、§1.1、§3.2.1、§4.3、§6.6、§7.4～§7.5 | 运行时统一 pointy-top `HexCoord { q, r }`/`HexDir`，`20 × 20 = 400` 为轴坐标槽上限；Tiled 构建期规范化。移动、范围和战斗规则归 `design/09`，精确渲染接口归 `tech/02`。 |

全部 AR 均已落实到总体架构所拥有的接口层；没有把 `design/15`、`design/16`、`design/11`、`design/12` 等主定义复制进本文。尚不存在的归属文档因此只留可实现接口与引用，不视为本任务漏写规则。

### 3.4 关键数值复算（至少 10 处）

| # | 核算 | 结果 / 修订结论 |
|---:|---|---|
| 1 | 引擎评分按十项权重重算 | Three/Pixi/Babylon/Phaser/PlayCanvas/Cocos/Unity/Godot = `90/78/73/69/68/66/64/58`，表内一致 |
| 2 | Three 对 Babylon 最小场景 | `132 / 332 = 39.8%`，即小 `60.2%` |
| 3 | Three 对 PlayCanvas 最小场景 | `132 / 489 = 27.0%`，即小 `73.0%` |
| 4 | Worker 一万/五万/十万对象结构化克隆相对主线程 parse | `17.8 / 7.4 = 2.41×`、`82.1 / 38.6 = 2.13×`、`249.5 / 46.1 = 5.41×`；据此改为 Transferable bytes + 主线程分片 parse |
| 5 | 同功能 WebGPU 与 WebGL 构建差 | `297 − 156 = 141 KB` |
| 6 | 300 KB WebGPU 闸门余量 | `300 − 297 = 3 KB`，不足容纳自有渲染代码 |
| 7 | WebGPU 估算超额 | `330 − 300 = 30 KB`，当前不通过 |
| 8 | WebGL 路线总预算 | `170 + 180 = 350 KB gzip` |
| 9 | 未来 WebGPU 路线总预算 | `170 + 300 = 470 KB gzip` |
| 10 | entry 分项预算 | `24 + 3 + 31 + 34 + 4 + 9 = 105 KB`，低于 170 KB 门槛，余 65 KB 给自有代码/胶水 |
| 11 | Basis 延迟 chunk | `240 + 15 = 255 KB`，符合 ≤260 KB 独立预算 |
| 12 | GitHub Free 月度粗算 | `floor(2000 / 7) = 285` 次 7 分钟 CI；修正旧稿写死“约 280 次额度”的口径 |
| 13 | 战斗容量 | `20 × 20 = 400` 个轴坐标槽，不等于正交方格契约 |
| 14 | 固定逻辑 tick | `10 Hz = 100 ms/tick` |
| 15 | WebGPU 切换 CPU 条件 | `1 / 1.25 = 80%`，即 R2 CPU time 须不高于 R1 的 80% 才达到“至少改善 25%” |

### 3.5 技术事实核查与标注

已复核并在“参考资料”注明访问日期/来源的主要事实：npm 包版本、发布日期、peer/engines；Three.js `WebGPURenderer.forceWebGL` 与 Basis 体积；TS 7/`typescript-eslint` 兼容边界；`deviceMemory` 取值和 Safari 缺失；iOS `HTMLMediaElement.volume` 行为、WebAudio 增益链、Opus；Safari/Chromium WebGPU 与 PWA display/fullscreen；Tiled/LDtk；GitHub Actions 版本和 Free 配额；Cloudflare Workers/Static Assets 配额与路由；ECMAScript `Math.sqrt`/实现近似函数语义。Unity 6.6 WebGPU 条目保留发布报道与 Unity 官方浏览器兼容文档并列，不把第三方报道表述成 Unity 一手发布稿。

标注计数：

| 口径 | 修订前 | 修订后 | 说明 |
|---|---:|---:|---|
| 标准 `（待核实）` | 3 | 5 | 原稿另有 8 次不带括号的描述文字；修订时统一采用标准标注，不能把两种口径混算 |
| 标准 `（待实测）` | 0 | 11 | 把公开资料无法证明的包体、真机、宿主与实际流量问题正确分类，不是用“已核实”掩盖实测债务 |
| 标准 `（待考）` | 0 | 0 | 本文未新增原著事实或引文 |

剩余 5 处（待核实）：§7.1 与 §10 R5、O3 共 3 处，均指普通微信 H5 XWeb 远程调试及 XWeb/iOS 微信 WKWebView 是否暴露 WebGPU；§10 R6 与 O4 共 2 处，均指尚未选定的具体 OFL 标题字体及嵌入/子集许可。两类问题均已有“不依赖 WebGPU / 未选字体前系统回退”的默认值。

剩余 11 处（待实测）：§2.1 Cocos 包体表与说明 2 处、§2.6 三类设备 1 处、§5.1 `vue-i18n` gzip 1 处、§5.4 完整 WebGPU render 复现 1 处、§7.6 Cloudflare 实际流量/CPU 1 处、§10 R2 iOS 峰值/杀页 1 处，以及 O1/O5/O6/O7 汇总追踪 4 处。去重后对应 O1、O5、O6、O7 四组执行任务；正文重复标注用于让局部阅读者不漏风险。

## 4. 开放问题（附默认值）

| # | 开放问题 | 当前默认值 / 继续执行方式 |
|---|---|---|
| O1 | 三类实机信息、完整 WebGPU render 复现和 R1/R2/R3 性能；`vue-i18n` gzip | 固定当前 WebGL；完整 WebGPU render 先压到 ≤300 KB，之后才在作者主力手机、中端 Android、iPad 记录型号/OS/入口、P50/P95、5 分钟发热和内存；同一脚本补测 i18n。 |
| O2 | 探索 tick 到世界时辰的换算 | 架构继续使用 `10 Hz = 100 ms/tick`；`worldTick` 只按整数推进，暂停/后台不补跑。具体“一时辰多少 tick”由 `design/11`（或其归属调整后的世界规则文档）给出，`tech/05` 实现。 |
| O3 | 普通微信 H5 XWeb 远程调试、XWeb/iOS 微信 WebGPU | 默认不依赖：开发环境用 eruda，生产基线 WebGL2 并提示可转系统浏览器；目标微信版本真机 `navigator.gpu`/adapter 探测通过后才调整。 |
| O4 | 具体 OFL 标题/书法字体与许可 | 未选定前全部使用系统字体回退；选定后逐字体保存许可证原文，检查 Reserved Font Name、嵌入、子集与再分发条款。 |
| O5 | Cocos Creator 等功能 Web 包体 | 不影响当前 Three.js 选型；只有发行目标转为小游戏时，才用同功能样例和同一 gzip/Brotli 脚本实测。 |
| O6 | Cloudflare Free 对受保护静态请求和 CPU 的实际容量 | 先按公开的 100,000 requests/day、10 ms CPU/request 运行并报警；根据实际用量决定是否升 Paid，不能为省额度绕过会话闸门。 |
| O7 | iOS 峰值内存、后台杀页和 BGM 增益链恢复 | 遵守 S 级 GPU 128 MB 封顶与隐藏即存档；三类实机记录峰值、切后台 10 次、上下文恢复及交叉淡化。失败时默认 BGM 硬切并插入 0.3 s 静音。 |

这些开放项均已在正文文末保留，未删除原有 P1～P13；已解决条目改写为“已解决/已采纳”并指向落点。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| 已采纳（v1.1） | 保留 Canon v1.1 已吸收的 ID 前缀、战斗状态、归属边界、高武完整原生天级池 6–16 等变更，不再从 tech/01 重复提第二套定义。 | 本文旧提案已由 V11-01～V11-43、V11-R01～R08 覆盖；标记已采纳可保留追溯。 |
| RT1-P01 | Canon §19 登记四档 `QualityTier`、三档素材且 ultra 复用 high，并索引 `tech/02` §11.2 的异步 `RenderWorld`。 | C21 已在 tech/01/02 定稿；升格为技术基线可阻止调用方继续复制旧三档和同步签名。 |
| RT1-P02 | Canon §19 明确全国大地图是导航/UI 资产，玩家抵达后才挂载区域 2.5D 场景。 | 作者决定 P53 与 AR-04/11 已消除旧歧义；可避免实现第二套可行走全国地形。 |
| RT1-P03 | Canon §19 增加私有部署边界：应用外壳、API 与受保护素材先经会话闸门，不采用公开 Pages。 | Canon §0 的“不公开分发”必须在托管入口具备可验收的技术约束。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/00-canon.md` | §18、§19 | 合入 RT1-P01～P03。§18 当前索引仍列旧规划名 `design/11-open-world.md`、`design/12-quests-npc-factions.md`；而新增需求采用 `design/15`～`design/19` 分工，A3 需统一归属索引，不能留下双归属。 |
| `docs/tech/02-rendering.md` | C21 历史说明/待决追溯 | 正文接口已与本文一致，但仍有“tech/01 为旧三档/待同步”的历史措辞；后续审校改成“已解决（见 tech/01 §4.3）”，保留追溯即可。 |
| `docs/tech/03-mobile-performance.md` | F1/F3/F11 的调用方落地 | 本文已经消费 `deviceMemory`、iOS BGM 和 Worker 回传结论；后续真机结果需回填 P01 三类设备、WebGPU 复现、iOS 峰值/杀页与增益链恢复。 |
| `docs/tech/04-*`（尚不存在） | 内容 schema、构建转换、存档迁移 | 实现根 `packages/spec/` 契约、Tiled offset/像素坐标到六角轴坐标规范化、内功顶层 `nature` 校验、Worker Transferable bytes 与主线程分片 parse。 |
| `docs/tech/05-*`（尚不存在） | core/玩法引擎 | 实现 `10 Hz`、六角寻路/范围 DTO、冲穴/资源/营生/门派/NPC 的命令事件接口，并继续引用各 design 主规则；不得逐武学或逐 Buff 硬编码。 |
| `docs/tech/06-asset-storage.md` | 术语表、C18 待决项、manifest | `QualityTier` 从 low/mid/high 改为四档，注明 ultra 复用 high 素材；把 C18 改为已解决并统一根 `packages/spec/`，补受保护素材 manifest 必须经过会话闸门。 |
| `docs/tech/07-asset-generation.md` | 全文契约路径 | 将所有 `packages/data/spec/` 改为 `packages/spec/`；生成器、Python/Blender 直接消费根契约包，不能保留镜像副本。 |
| `docs/tech/08-backend-and-online.md` | 测试工具、部署方案 | 当前 `@cloudflare/vitest-pool-workers@0.22.0` peer 只接受 `vitest ^4.1`，与本文工作区 `Vitest ^5.0.2` 冲突；需决定 services 单独锁 Vitest 4，或不使用 pool、改用 `getPlatformProxy()`。同时沿用 Worker Static Assets + 会话闸门、`workers_dev=false`、`preview_urls=false`，删除任何公开 Pages 候选。 |
| `docs/design/09-combat-system.md` | 地图邻接、方向、范围/拾取接口 | 仍有方格四邻/战斗四向旧规则，与 AR-12 pointy-top 六角冲突；改为 `HexCoord`/`HexDir` 和六邻，规则输出格集合，勿把精灵 `Dir8` 当作逻辑方向。 |
| `docs/design/11-*`、`docs/design/12-*` | 新归属文档（尚不存在） | 按 Canon/A3 最终命名建立大地图/时代与门派层级/任务归属；补 O2 世界时辰换算。当前已有 `design/19-world-map.md`，需避免与拟议 `design/11` 重复定义大地图。 |
| `docs/design/15-*`、`16-*`、`18-*`（尚不存在） | 冲穴、资源与营生、NPC/同伴 | 落实 AR-03、AR-05/06、AR-09 主规则；本文只提供 schema/DTO/事件/存档接口，不应成为规则事实源。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 修订结论

| 严重度 | 发现并修正的问题 |
|---|---|
| 严重 | C18 的 `packages/spec/` / `packages/data/spec/` 双目录；C21 的三档画质、缺失/同步 `RenderWorld` 入口和错误 260 KB WebGPU 预算；公开 Cloudflare/GitHub Pages 与“不公开分发”的冲突。 |
| 中等 | Worker 解析后回传大对象导致结构化克隆成本；iOS 用 `<audio>.volume` 控 BGM 无效；`deviceMemory ≤3` 的错误档位假设；方格运行时契约与 AR-12 六角冲突；TS 7 按小版本自动升级的错误条件；CI 上传 artifact 但 deploy workflow 未下载；flow-style YAML 中未引用 GitHub `github.ref` 表达式导致示例不能通用解析。 |
| 一般 | `SkillDef.nature` 的顶层/内功约束；PWA `display: fullscreen` 的跨浏览器假设；把 `Math.sqrt` 泛化成“精确运算”的不严谨表述；表格中的反引号键破坏列解析。 |

剩余清单：5 处（待核实）、11 处（待实测）、0 处（待考），详见 §3.5；去重后未核实事项仅为微信宿主能力和具体 OFL 字体许可，待实测事项归 O1/O5/O6/O7。其他文档必须跟进的接口和冲突见第 6 节，尤其是 `tech/06`、`tech/07`、`tech/08` 与 `design/09`。

### 验收逐项

- ✅ **修改范围**：只修改 `docs/tech/01-architecture.md` 与本报告；未修改 Canon、任务清单或其他文档，未执行改变仓库状态的 git 命令。
- ✅ **格式与版本**：文首为“项/内容”表格，版本为 v1.1（审校修订，2026-09-26），随后为 TL;DR；文末依次是“参考资料”“本文新增术语/约定”“待决事项 / 依赖”。
- ✅ **C18/C21/重命名/Buff**：逐项落实并在 §3.1 给出落点；无旧路径、旧三档签名或 260 KB WebGPU 预算残留。
- ✅ **Canon v1.1**：逐项检查与架构相关变更，旧提案按“已采纳（v1.1）”保留追溯；不在技术文档重定义玩法公式。
- ✅ **作者决定**：P01/P03/P04/P53 已写入正文和开放问题；未填写的决定不擅自当作作者确认。
- ✅ **AR-01～AR-12**：逐条写入 §3.2.1 的架构接口，并在本报告 §3.3 说明落点与归属；对 design 主规则只引用。
- ✅ **数值评审**：复算 15 组关键数值，修正 WebGPU、CI 次数和 Worker 结论；关键预算给出算式。
- ✅ **技术核查**：公开可核事实已在正文参考资料列出来源与 2026-09-26 访问日期；无法由公开资料证明者保留标准标注和安全默认。
- ✅ **代码/数据片段**：3 个 YAML 围栏均通过 PyYAML；3 个 JSONC 围栏均通过 TypeScript JSONC 解析器；13 个 TypeScript 围栏均通过本机 Trae 内置 TypeScript 5.9.3 API 的 `transpileModule` 语法检查。此检查只覆盖语法，不冒充完整项目类型检查或运行时测试。
- ✅ **Markdown 完整性**：60 个围栏成对闭合；忽略代码围栏后表格列数一致；目录与一级/二级章节一致；无截断句或任务禁止的占位语句。
- ✅ **差异质量**：`git diff --check` 通过；正文由 1,629 行增至 1,736 行（+6.57%），无缩短风险。
- ⚠️ **真机/真账号与未产出上游**：本任务没有作者设备、微信宿主或 Cloudflare 实际流量，故 O1/O3/O6/O7 不能冒充完成；`design/15`、`design/16`、`design/18`、`tech/04`、`tech/05` 尚待后续任务，本文已给不阻塞实现的默认边界。

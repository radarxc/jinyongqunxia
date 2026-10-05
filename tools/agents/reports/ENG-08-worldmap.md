# ENG-08-worldmap 报告 · 游戏工程 · 大地图（城镇间行走 / 野外遗迹进入 / 城镇进入）

## 1. 摘要（3–6 行）

- 已将大地图 schema/内容校验迁入 `packages/data`，将状态、A*、旅行、城门判定、场景事件及存档语义迁入 `packages/core`。
- `apps/game` 现只负责命令转发与只读投影消费；core 发出的 `worldmap/sceneRequested` 留给 ENG-09 场景挂载，不再保存可写边车或实现玩法规则。
- Three.js r186 大地图、14 章数据、UI 与 12 个聚焦用例全部通过；无新依赖，锁文件未改。
- 四条强制检查均退出 0；桌面无头 Chrome 实测维持 60 fps，合并 ENG-10 后 entry 为 126.14 KiB gzip。

## 2. 产出（文件、行数、主要章节）

| 文件范围 | 文件数 / 行数 | 主要内容 |
|---|---:|---|
| `packages/render/src/worldmap/` | 5 / 313 | 2.5D 几何、道路/节点实例化、节点图集、rig、镜头、拾取、统计、无头 smoke |
| `packages/data` worldmap | 新增 2 / 161 | `worldmap.v1` schema、注册信封、跨字段图校验与 2 个 schema 测试；registry 增 1 个路由回归 |
| `packages/core/src/world/worldmap-*` | 5 / 571 | 权威状态、预分配整数 A*、旅行/执法/事件 runtime、存档语义、6 个规则测试 |
| `apps/game/` | 18 个改动 + 1 个页面 | CoreHost 命令转发、规范状态装配、只读投影、场景事件消费、UI/PWA 与装配测试；保留 ENG-10 战斗 |
| `tools/content/worldmap_from_towns.py` | 1 / 270 | 从权威城镇/路线/时间线确定性生成及 `--check` |
| `content/world/ch01..ch14/map.yaml` | 14 / 4,423 | `event.v1` + `mountWorldMap` 的 `worldmap.v1` 数据 |
| CLAUDE / 报告 | 3 文件 | 更新 data/core/app/render 边界、性能数据、开放项与 ENG-09 交接 |
| 本报告 | 1 / ≤100 | 结论、性能、开放项和 ENG-09 交接 |

## 3. 关键结论与数值

- 架构结论：data 权威定义/校验 `worldmap.v1`；core 权威持有 `GameState.chapter.worldMap`，执行 A*、旅行时间、遭遇、城门执法、场景事件和存档语义；app 只装配、转发与投影。
- 应用层旧 `runtime/worldmap/` 已删除；会话仅调用 `createWorldMapRuntime().dispatch` 并写回规范 `GameState`，快照不存在顶层可写 `worldmap` 边车。
- 场景结构：高度地形 1 mesh；道路 1 `InstancedMesh`；河流/山脉各 1 batch；节点 1 `InstancedMesh` + 2×2 atlas；玩家 rig 2 pass；目的地 marker 按需显示。静态 5 draw，玩家合计 7，marker 可见为 8。
- 数据：每章 201 节点；当代可见 ch01–ch14 为 153/163/162/175/173/172/172/182/172/173/177/181/179/178；道路为 90/101/100/101/97/93/94/101/93/94/93/97/95/94。
- 权威道路只覆盖起点连通分量 84–95 节点；剩余 69–90 个开放节点不伪造路线，UI 显示“尚无已登记道路”。
- 时间：`LI_PER_HOUR=10`、`stepLi=10`；`10 li ÷ 10 li/h = 1 h = 60 min = 600 tick`。距离为源路线小时×10 的等效里，非现实测绘里程。
- A* 全程整数、稳定 ID/边序、typed-array/heap 预分配；相同代价按节点 ID 确定性裁决。
- 性能测法：生产包 + 1440×900、DPR1、Headless Chrome 151/SwiftShader；预热 3 s 后 12×500 ms HUD 样本，加 180 帧 rAF。结果 7 draw、FPS 中位/最小 60/60、CPU P95 0.20 ms、rAF P95 16.8 ms；无页面错误，水墨图加载成功。该无头软件栈不替代真机 GPU。
- 包体：entry 126.14/170 KiB、render 143.95/180 KiB、WebGL 合计 270.09/350 KiB，`pnpm size` 通过；地图页 2.88 KiB gzip。
- ENG-09 类型：`WorldMapCommand`、`SceneEntry`、`WorldMapProjection` 均在 `packages/core/src/world/worldmap-types.ts`；runtime 在 `worldmap-runtime.ts` 发事件。
- ENG-09 命令：进入目的地用 `worldmap/enter`，离场用 `worldmap/leave`；旅行另有 `worldmap/travel|step|cancel|resume`，全部交同一 CoreHost。
- ENG-09 事件：消费 `worldmap/sceneRequested` 的 `SceneEntry {kind,nodeId,name,chapterId,era,sceneId,townSpec,templateYear,gateId,spawn,accessNote,returnNodeId}`；离场成功收到 `worldmap/sceneLeft`。城门拒绝为 `worldmap/gateBlocked`，不得挂载城镇。

## 4. 开放问题（附默认值）

- O1：正式章节加载器未落地；默认首屏只编译 ch01，后续按章动态读取其余 13 份地图，禁止全量塞入首屏。
- O2：现有权威陆路未连接全部开放节点；默认明确禁行，不自动造路；待 design/19 补路线后重生成。
- O3：正式事件锚点/随机遭遇选择器未注入会话；默认仍发 `worldmap/encounterProbe`，端口返回 null，不自行开战。
- O4：官甲 `lawProfile`、玩家 `identityTags` 尚未进入正式内容 schema；默认只按显式规则判断，不解析说明文字。
- O5：移动中端机 ≥30 fps、触屏/横竖屏、Safari/Android 与离线地图首次安装（待实测）；默认保留 DPR≤2、响应式布局及 ch01 水墨图 precache。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG08-P01 / 在 design/19 正式登记“大地图等效里/小时”与道路连通性要求 / 当前 10 里/小时来自源时长的工程建议值，且开放节点存在数据孤岛。
- ENG08-P02 / 在架构文档登记 core 的 WorldMapState、SceneEntry 与官甲身份契约 / 实现已进入 core/data，需让后续工程共享同一权威接口。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 接口 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/19-world-map.md` / 路网数据 | 路线与里程 | 补开放节点连通路线，并裁定 10 等效里/小时 |
| `docs/tech/01-architecture.md`、`05-gameplay-engine.md` | 场景/时钟 | 登记 core worldmap 命令、规范状态、事件锚点与遭遇端口 |
| ENG-09 城镇工程 | `packages/core/src/world/worldmap-types.ts` | 消费 `SceneEntry` 的 gateId/spawn/townSpec；进入事件 `worldmap/sceneRequested`；离场命令 `worldmap/leave`，成功事件 `worldmap/sceneLeft` |
| ENG-06 / data schema | 官甲执法 | 结构化 `lawProfile` 与 `identityTags`，移除应用层手工注入 |
| ENG-10 战斗/遭遇 | 旅行遭遇 | 安装确定性 encounter selector，消费 `worldmap/encounterRequested` |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 场景结构：2.5D 高度地形、approved ch01 水墨纹理、实例化道路/节点、图集、rig 玩家、跟随/缩放/拾取均已接入；不含城镇内部或战斗。
- ✅ 数据与年代：14 章共 2,814 节点记录、1,343 条道路，均按年代隐藏；生成器 `--check` 与内容校验通过，逐章统计见 §3。
- ✅ 交互与边界：点选、整数 A*、按里程推进 GameClock、暂停/恢复、遭遇、通缉拦截及场景事件均由 core 权威执行；app 仅转发/投影。
- ✅ 渲染 smoke：场景几何可建，5 个静态对象、2 节点实例、2 道路段符合 fixture；资源可幂等释放。
- ✅ 单测：12 个聚焦用例通过（data schema 2 + registry 路由 1 + core 规则 6 + app 装配 1 + render smoke 2）；无适用的 CI 增量覆盖率阈值。
- ✅ 性能：实例化/atlas/静态合批；桌面无头实测 60 fps、7 draw、CPU P95 0.20 ms；`pnpm size` 通过。⚠️ 中端手机 ≥30 fps 待真机；Vite 仍提示 render 原始 chunk >500 kB，但 gzip 门禁通过。
- ✅ ENG-09：接口文件、命令与事件见 §3/§6；app 不复制进入规则，城镇/遗迹退出均向 CoreHost 提交 `worldmap/leave`。
- ✅ 检查（本轮实测）：冻结安装通过；`pnpm check` 为常规 68 文件/352 测试 + rig 性能 1 文件/2 测试、389 文件/对象、包体全绿；游戏 build 256 modules，严格 ID 检查退出 0。
- ✅ 依赖与仓库状态：无新依赖、锁文件未改、未执行改变仓库状态的 git 命令；`git diff --check` 通过。
- ✅ 架构边界：P0 已修复；data 管 schema/加载校验，core 是玩法与存档唯一权威，app 不含第二份可写状态或规则实现。
- ⚠️ PWA：ch01 水墨图已加入 precache；其余章尚无专属地图底图/加载器，使用结构化程序地形的方案已保留。

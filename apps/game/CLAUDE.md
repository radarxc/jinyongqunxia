# @tianshu/game

| 项       | 内容                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 归属     | Vite + Vue 装配与发布层；游戏规则归 core，通用组件归 ui，浏览器能力归 platform                                |
| 上游     | 作者 AR-19 / AR-21；tech/01、tech/05；design/02、03、09、10、11、13、14、15、18、21、22；ENG-01～08 / 10 / 12 |
| 当前入口 | 启动先开存储并读设置，再显示标题；继续 / 新游戏进入 ENG-07 壳；角色部件演示仅开发模式提供 `/rig-demo`         |
| 栈       | Vue 3.5 + Pinia + 模块 Worker / Comlink + ENG-01 IndexedDB；不引入新 UI 框架                                  |

## 结论先行（TL;DR）

core 默认运行在模块 Worker；仅启动失败或不支持 Worker 时回退主线程。命令通过 CoreHost 串行进入会话适配器，core 纯函数返回新状态，selector 只重建脏分支，再将裁剪投影写入 Pinia shallowRef。组件不持有 GameState，不重算玩法公式，不先行扣物品。

正式入口默认建立 ch00 空白新档；身份与难度由 `createNewGame()` 提交，`masterSeed` 只在浏览器宿主用 `crypto.getRandomValues` 生成。ch01 交互会话只在显式开发 `demo` 模式使用独立数据库 tianshu-ui-preview，绝不自动迁入正式数据库 tianshu。所有演示状态为（原创扩展），不是原著开局或剧情奖励。

大地图定义由 data 校验，权威 `WorldMapState`、整数 A*、旅行事务、城门判定与场景事件均由
core 持有。应用层只转发命令并消费只读 `WorldMapProjection.scene`；`worldmap/sceneRequested`
保留给 ENG-09 的场景挂载协调器，不得在 app 新增规则副本。
战斗页以 ENG-04 内容夹具演示六角范围、CT 与逐行动播放；seed 由 core 入场事务从 world 流派生，自动事件与结算均归 `BattleSession`。
城镇定义由 data 校验；可走性、整数 A*、碰撞、建筑阶段、锚点判定和打坐遇袭全在 core。
`TownPage` 只消费投影并把拾取结果转成命令；Three 场景按需载入，主角与 NPC 统一使用 ENG-12 rig。

## 目录与组件

| 路径                                                                                  | 职责                                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| src/main.ts、loop.ts、App.vue、style.css                                              | 装配 Pinia / controller、10 Hz 探索驱动、HUD、导航、快捷栏、键盘、无障碍设置和生命周期               |
| src/settings.ts、recovery.ts、pages/TitlePage.vue、SettingsPage.vue、RecoveryPage.vue | 设置迁移、标题前存储探测、纯 DOM 故障恢复与异步页面                                                  |
| src/core-host.ts、core-worker.ts                                                      | Worker 握手、10 秒启动超时、Comlink 端口及启动期兼容回退                                             |
| src/runtime/                                                                          | 会话聚合、命令转发、预览装配与应用快照验证；不持有大地图规则或可写边车                               |
| src/projection.ts、selectors/                                                         | 脏标记 selector、物品分类、人物遮蔽、真实资源与经脉强度投影                                          |
| src/pages/                                                                            | 懒加载 TownPage、WorldMapPage、CharacterPage、InventoryPage、SavePage；武功 / 任务 / 设置由 App 装配 |
| src/scenes/ScenePlaceholder.vue                                                       | 遗迹等尚未实现的下游入口占位；城镇和战斗已有专页                                                     |
| src/battle/                                                                           | 战斗 Worker 适配、浅投影、六角场、CT、行动菜单、日志、自动回放与结算                                 |
| src/storage/                                                                          | 槽位摘要与 ENG-01 保存 / 读取 / 删除 / 单槽导入导出                                                  |
| build/                                                                                | 构建期解析已验证内容、经脉目录与素材清单；不把 YAML 解析器放进浏览器                                 |
| scripts/worker-smoke.mjs                                                              | 对生产构建的 Worker 做 Node 独立线程 RPC 冒烟；不等同浏览器实测                                      |

通用组件位于 packages/ui/src/components：除既有 HUD / 背包 / 存档组件外，标题、设置、恢复、旋转提示及纯展示的对话 / 任务组件也由 ui 提供；旧 `GameUi.vue` 已删除。

M1 流程组件和页面都必须按首次使用异步加载；`src/flow/` 只放纯状态 / 展示适配，不重算 core 的预算、上下限、可用性或年份。标题入口传入的旧占位身份只令 controller 进入 `pendingCreation`，正式 `run/create` 必须等创角确认。对话和初眠事务期间手动存档继续被 controller 拒绝，初眠必须原样消费 `firstSleepAllocation.ruleVersion`。正式 ch00 / ch10 文本归内容包；流程卡使用 `flow.<chapter>.<scene>.<三位序号>.(title|body)`，卡数由完整键对决定。目录缺失时显示可读错误，绝不把原始 ID 当玩家文案。

应用壳只从 @tianshu/ui/runtime 和单组件公开子路径取运行时依赖，页面组件动态加载。Worker 只引 @tianshu/platform/host，避免捎入 Dexie。不要从壳静态导入完整 UI 聚合入口，否则页面代码会提前载入。

## 桥接与下游接入约定

1. GameRemote 为 dispatch / query / snapshot / validate / restore；GameHost 另有 subscribe / dispose / mode。参数与结果必须可结构化克隆；快照仅交给存档服务。新档以传输命令 `run/create` 进入，公开便捷入口为 `NewGameHost.createNewGame()`。
2. dispatch、query、snapshot、restore 共用 FIFO 队列；保存快照排在先前命令之后。订阅返回退订函数；dispose 清理 Worker、监听器并拒绝尚未完成的请求。
3. GameUpdate 包含 accepted、changes、events 和可选 error。主线程按 changes 合并浅投影；拒绝命令不改 UI 与存档。stateVersion / nextEventSeq 只由 core 事务推进；session 不再拼状态或事件信封。
4. GameCommand 复用 core `Command` 联合；战斗界面 DTO 经 `BattleRuntime.coreCommand()` 转发，原生 act / setAuto / retry / finalize / leave 直接进 core 总线。旅行 step 仍携带 journeyId 与 expectedTravelledLi。
5. dirty 分支含 hud / characters / inventory / equipment / quests / dialogue / worldmap；旅行步进同时更新 hud 与 worldmap，restore 全量投影。增加玩法写入时同时登记 dirty 分支。
6. 未遇见人物在 Worker selector 内变成无姓名、无 NPC ID、无门派、无图片路径和无详情的剪影；相遇数据变化后才开放资料。affinity 沿用 design/18 的 −100..100，不从好感数值推断结交。
7. 所有非战斗事件都使用 core 的 `seq/stateVersion/causeId/parentSeq/payload` 信封。ENG-08 / 09 / 10 应复用 host.subscribe，禁止另开一份可写 core。
8. `SessionSnapshot` 就是唯一 `GameState`：known 在 `chapter.npcs`，chapterUses 在 `chapter.itemChapterUses`，itemTargets 已吸收进 CharacterState，location 从 `world.navigation` 投影。`ui-session.v1` 只允许出现在 schema 1 迁移和测试夹具中。
9. ENG-08 发 `worldmap/sceneRequested`，payload 是 SceneEntry（kind / nodeId / sceneId / townSpec / templateYear / gateId / spawn / returnNodeId）。ENG-09 消费此入口并以 worldmap/leave 返回；战斗与真实相遇由 ENG-10 接入。场景显示层不直接改投影。
10. 主线程兼容宿主也克隆边界值；运行中 Worker 或 core 内部错误会锁死玩法命令和探索 tick、显示内部错误，不静默重启到初态；存档导出仍可用。
11. `GameProjection.battle` 是增量包：进入 / query 含 `info` 与全单位，后续按 core 单位 revision 投影；controller 以 ID 合并。snapshot / restore 包含完整 BattleSession；战斗中 world/tick 由 core 返回 WORLD_PAUSED，界面 leave 先 finalize，再返回冻结的 returnContext。
12. UI 的范围、目标合法性、可达集和路径只调用 core 的 `queryMoveAt()` / `queryReachable()` /
    `queryPath()`；提交完整行动计划后由 core 再算一次。CT 预计在一次性 timeline 副本上调用 core 调度函数，不推进真实状态或 RNG。
13. 自动战斗每个 `requestAnimationFrame` 至多发一个 `battle/step`，1× / 2× 只改回放间隔，“跳过”只省表现；关闭自动先停排帧，再经宿主 FIFO 切回手动。
14. ENG-11 通过 `controller.battle.onMoveResolved((moveId, from, to, result) => ...)` 注册播放器；异常只记录，不改结算。日志与飘字消费 core 事件自带 `message`，不重选周天 / 外放文案。
15. 城镇命令为 move / settle-building / exit-building / interact / meditate。点击只发整数格；core 返回整条路径并决定是否进入，页面以 90 ms / 格逐格驱动 rig（减少动效为 0）。到达后建筑淡变 260 ms（减少动效为 0）再发 settle-building，组件不得直接改阶段。
16. `town-runtime.v1`、townRevision 与存档必须一致；构建期按章读 `content/town/chNN/*.json` 并复制其 atlas 素材。大理 / 杭州是当前基线，不把全部章节城镇塞进首屏；Three 模块只在进入城镇后动态加载。
17. NPC 出现同时要求 eraLayer、sceneId 与 presence 匹配；精确格位来自 `townNpcPlacements`。事件只读 `townEventAnchors`，不得由人物简介或城市归属猜坐标。当前生产注册表显式为空，直到内容任务提供权威锚点。
18. 室内打坐锚点只有对应建筑处于 inside 才投影和受理。`TownRuntime.meditate()` 在 core 内原子完成敌意 NPC 筛选、是否掷骰、RNG、风险、岔气或恢复 / 练功、时钟与 `BattleSetup`；应用只提交内容事实、落盘返回状态并装配 `BattleLaunch`。战斗准备失败不提交状态或 RNG；无正式 encounter 时安全完成 600 tick 且不消费 RNG。
19. `loop.ts` 仅用墙钟驱动 `world/tick`：固定 100 ms、帧差上限 250 ms、每帧最多 5 次；hidden、菜单、对话、战斗、加载或存档时清积压。Worker 请求未返回时不叠发，旧积压直接丢弃。场景必须显式声明是否运行探索时钟。
20. 演示 setup 携带逐单位经脉与奖励声明；`BattleRuntime` 只做命令适配、预览和投影。
    终局 `projectBattleRewards()` 零 RNG 展示已知奖励；随机掉落只在 core finalize 消费世界 loot 流，
    由 `battle/rewards` 运输事件公布实领结果。应用不持有战斗 RNG、判平规则或奖励账本。
21. `AsyncCore.read()` 仅用于同宿主只读投影，严禁修改或跨线程发送；`snapshot()` 才深拷贝完整状态。
    `BattleRuntime.transcript()` 导出真实入场 seed、已接受命令与本地事件；拒绝命令不进入录像前缀。

## 页面与持久化约定

- 大地图只显示当代 open 节点；点击后沿已登记陆路 A* 寻路。每 10 等效里推进 60 分钟（600 tick），可停步、继续或路中改道；无道路节点明确禁用，不凭空补路线。
- 城镇支持点击寻路、WASD/QE 六向步进、锚点点击、0.65–2.5 缩放和返回大地图。进入建筑不切场景：目标外墙渐隐、室内简化地面/柜台显现；店铺和 NPC 只发 ENG-06 / ENG-05 请求事件。
- 当前仅编译 ch01 地图进应用；14 章 `content/world/chNN/map.yaml` 由 `tools/content/worldmap_from_towns.py` 生成。时代切换应按章动态装载，不得把 14 章静态塞入首屏。
- HUD 显示 HP / MP、行动槽、年月日时辰、地点和文钱；非战斗行动槽显示静息。无独立人物等级条。主菜单覆盖人物、物品、武功、任务、存档、设置。
- C / B / K / J / M 切页，1–3 使用快捷药品，Escape 返回江湖；输入控件和确认框内不拦截快捷键。列表支持方向键 / Home / End；触屏点选等价于拖装。精确指针最小 44 px、触屏 60 px。
- 配色引用 design/14，字体按 P04 使用系统中文黑体 / 宋体栈；不下载影视游戏字体。文字 100 / 125 / 150%、减少动效、字幕、分类音量、画质与难度写入 ENG-01 settings；旧“大字”只作单向迁移输入。
- 背包分类为十一种素材类别加任务物品；只有存在未映射项目时才出现“其他”。装备栏完整展示 ENG-06 的十一槽，双手 / 成对限制由 core 判断。
- 保存复用十二手动槽、一个快速槽、三个自动轮换槽。普通保存仅写手动 / 快速槽；特殊旅程检查点保留只读展示与导出，不擅自提供恢复和删除。
- 覆盖、读档、删除、导入先在模态框确认；快速保存按钮是显式覆盖快速槽的快捷操作。操作期间阻止重复按钮提交。
- 自动保存使用 ENG-01 的 30 秒节流与三槽轮换；变更后请求保存，30 秒轮询补落最后一次节流变更。hidden / pagehide 强制请求为尽力而为，移动端进程终止落盘仍为（待实测）。
- 对话期间 `snapshot()` 明确抛 `DIALOGUE_SAVE_UNAVAILABLE`；controller 的事件自动存档请求可到达，
  但不得生成半段 Ink 存档。书眠同类门禁由 ENG-17 接入。
- 单槽文件为 TSAV v1（.tsav），正文只含 schema 2 `GameState`；旧 TSUI / `ui-session.v1` 仅可导入并经 1→2 迁移，不再导出。高版本或协议不兼容不会被当作损坏而回退到更老一代。
- 战外命令总线接通 healPct / mpPct / staPct / dispel / permStat / permMaxPct，`fieldTime` 按时辰换算；战斗物品及次数 / 冷却走 core action，章节限用随 finalize 原子写回。
- core 命令已支持移动 + 招式 / 待机，以及战斗物品、防御、急性聚气；现有按钮仍按 capability
  显式禁用并显示原因，交 ENG-16e 接已导出的只读可用性查询。禁止 UI 自算次数、冷却、
  路线满载或防御规则。经脉面板仍展示 core 已提供的透劲、占穴、丹田损伤与 Buff。
- 已有装备 schema 缺数值 modifiers / 执法配置，当前换装只改变装备与背包；不得从说明文本解析出属性、通缉或剧情奖励。正式人物 / 装备汇总接齐后才扩展面板。

## 素材（图片资源从哪来、怎么进包）

- 全部图片素材在仓库根 `assets/default/<类别>/`，每个目录一份 `manifest.yaml`（字段见 `assets/README.md`）：物品 `item/<类>/`、建筑 `building-map/<kit>/`、贴片 `tile/<kit>/`、角色部件 `rig/<set>/`、地图 `map/`、特效 `vfx/`、作者已审基线 `baseline/`。
- 哪些图还没出、每张图的提示词与输出路径：`assets/default/prompts/INDEX.md`（物品 / 地图 / 角色部件）、`assets/default/prompts/characters/INDEX.md`（人物立绘）。出图由另外的 agent 做；代码不要等图，缺图时用同尺寸占位（`packages/render` 的 placeholder 约定）。
- 进包：构建时按 manifest 把 `status` 不为 `rejected` 的条目复制到 `apps/game/public/assets/default/<类别>/…`（保持相对路径），运行时通过 `art://` 键或相对路径读取（`docs/tech/06` 的素材键与清单约定）；不要把图片 import 进 JS bundle，也不要改 `assets/default/` 下的任何文件。

ENG-07 当前仅复制清单中存在的 64 px 物品图与 portrait 文件，并把可用相对路径投影给界面；缺文件、未遇人物和 rejected 条目使用占位。生成目录已忽略，不提交副本。本次有 150 张物品图可用，人物 portrait 尚缺。新图登记清单后重启 dev / 重建即可生效。

## 构建与验证

- 必须执行 pnpm install --frozen-lockfile、pnpm check、pnpm --filter ./apps/game build、python3 tools/lint/check_ids.py --strict；pnpm check 已包含首屏 / render 包体预算与现有 rig 性能闸门。
- 构建后可运行 node apps/game/scripts/worker-smoke.mjs，验证实际输出的 Worker 在独立线程完成查询、装备命令、恢复和经脉计数。
- Vitest 的 app-flow.test.ts 使用 happy-dom + fake-indexeddb 走整页键盘 / 装备 / 保存 / 读取；storage/save-flow.test.ts 覆盖真实 ENG-01 API 和损坏导入；其余覆盖增量投影、遮蔽、药品事务、宿主队列与虚拟列表。
- Vite 8.3.1 使用 configLoader runner 处理工作区 TypeScript 构建插件；默认打包配置把 data/tooling 外部化会触发 Node ESM 扩展名错误。该选项在本地安装的 Vite CLI 标为实验性，已实际构建验证。
- core 中未使用模块按纯导出裁剪；不要把注册副作用放入 core barrel。当前规范 JSON 帮助函数与兼容宿主所用纯函数同在 core 分块，主线程入口会加载此块；正常启动的会话实例与命令计算仍只在 Worker。render 独立动态加载，首屏预算按实际入口依赖闭包计算，禁止为通过检查而放宽。
- 构建的经脉投影从 design/15 §2–§3 抽取，并检查 20 脉 / 180 个唯一穴位；章节 NPC 当前只编译天龙书界，后续章节须由加载器扩展，不要把所有书界静态拼入首屏。

## 参考资料

以下为技术核实来源，除单项注明外访问日期均为 2026-10-01；不涉及付费服务、价格或远程配额。

- [Vue shallowRef / markRaw](https://vuejs.org/api/reactivity-advanced.html)、[Vue 大列表与浅响应性能建议](https://vuejs.org/guide/best-practices/performance.html)：深层对象不代理、长列表需虚拟化。
- [Vite Worker 构建](https://vite.dev/guide/features.html#web-workers)、[Vite 配置加载](https://vite.dev/config/)、[Rolldown 按模块裁剪](https://rolldown.rs/options/treeshake)：模块 Worker URL、构建期 TS 配置与纯导出裁剪；runner 同时查验本地 vite/dist/node/cli.js。
- [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)、[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)、[Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static)：主流浏览器提供这些接口；Worker 启动仍须处理失败，Object URL 必须回收。
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)：大地图随浏览器刷新节奏绘制，后台标签会暂停；玩法时间只由 Worker 旅行命令推进。
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)、[SHA-256 digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)：客户端存储与校验；digest 要求安全上下文，正式站点须 HTTPS。本机 localhost 可用于开发。
- [Crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)：
  新档 `masterSeed` 的浏览器熵源；广泛支持且输出适合密码学用途的随机值（访问 2026-10-02）。
- [inkjs 2.4.0](https://registry.npmjs.org/inkjs/2.4.0)：锁文件采用的 Ink JSON 运行时版本（访问 2026-10-02）。
- 精确版本来自锁文件并核对 npm registry：[Vue 3.5.43](https://registry.npmjs.org/vue/3.5.43)、[Pinia 4.0.3](https://registry.npmjs.org/pinia/4.0.3)、[Comlink 4.4.2](https://registry.npmjs.org/comlink/4.4.2)、[Vite 8.3.1](https://registry.npmjs.org/vite/8.3.1)。
- 测试版本同样核对：[Vitest 5.0.3](https://registry.npmjs.org/vitest/5.0.3)、[Vue Test Utils 2.5.1](https://registry.npmjs.org/@vue/test-utils/2.5.1)、[happy-dom 20.14.5](https://registry.npmjs.org/happy-dom/20.14.5)、[fake-indexeddb 6.2.5](https://registry.npmjs.org/fake-indexeddb/6.2.5)。
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)、[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)：战斗回放分帧与画布尺寸监听；访问日期 2026-10-01，均为广泛支持的基线 API。
- [Three InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)、[Raycaster](https://threejs.org/docs/pages/Raycaster.html)、[OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html)、[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)：城镇合批、实例拾取、固定斜视镜头与 draw/triangle 统计；2026-10-02 联网均返回 HTTP 200。锁文件版本 Three 0.186.1，无新增依赖、价格或远程限额。
- [Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)、[prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)：读取系统减少动态偏好并保持 CSS 与持久设置一致；访问日期 2026-10-03。
- [Vite env 常量](https://vite.dev/guide/env-and-mode.html)：`import.meta.env.DEV` 会在生产构建中静态替换，使开发专用 `/rig-demo` 分支可被裁剪；访问日期 2026-10-03。
- [Math.imul](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul)、[Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)：core 重试种子的 32 位乘法与递归冻结历史的依据；访问日期 2026-10-03。

## 本文新增术语/约定

- GameHost / GameRemote / GameUpdate：应用的强类型命令 / 投影宿主；packages/platform 泛型 ProjectionHost 不依赖 UI。
- ui-session.v1 / TSUI v1：只读历史输入；由纯迁移转为 schema 2 GameState，任何无法安全归位的数据明确失败。
- TSAV v1：当前单槽文件信封；头登记 `saveSchema/rulesProtocol/rngProtocol/coreBuild/contentHash`。
- dirtyRevision / savedRevision：仅属 controller 的落盘追踪序号；I/O 期间若收到后续 core 事件，不会误把新变更当作已保存。它不是玩法时钟或存档 schema 字段。
- worldmap.v1 / SceneEntry：构建期验证的大地图定义，以及交给 ENG-09 的只读场景入口；都不在渲染层推导。
- NewGameRequest / DialogueView：前者含身份与江湖 / 侠客 / 宗师难度，seed 由宿主补；
  后者只投影 story 标识、说话人、文本 key、选择锁定理由与历史。
- 无新增玩法、人物、物品、穴道或槽位 ID；命名复用 canon §12 与现有内容。
- BattlePacket / BattleView：Worker 到主线程的全量首包与增量战况包；不是第二份规则状态。
- BattleSession / outcomeSeq：core 会话与结局序号；世界结算以 battleId+outcomeSeq 去重，应用不另建回执。
- onMoveResolved：交 ENG-11 的只读播放钩子，签名为 `(moveId, from, to, result)`。
- town-runtime.v1 / TownProjection：构建期城镇格网与浏览器只读投影；前者含 RLE 地面、导航、建筑、锚点和 atlas 引用，后者只含角色、可见 NPC/锚点与建筑阶段。

## 待决事项 / 依赖

- 已解决：Worker 默认运行、浅投影、列表虚拟化、槽位流程、大地图与素材占位已落地；验证入口见上文。桌面 Chrome 性能结果见 ENG-08 报告；真实横屏 / 竖屏、触屏、Safari / Android、PWA 离线与生命周期落盘仍为（待实测）。
- 【建议值】演示主角初始七项先天均 50，一层黄上太祖长拳、无开穴；core 得 HP=300+(30+4×3)×1=342、MP=200。两名已遇 NPC 与零好感仅供界面演示；正式初态由 ENG-10 创角 / 剧情提供。
- 【建议值】福缘目前随其他先天显示数值，design/03 的五档词未给出阈值；默认保持真实数值，待上游提供档位映射后改为词并提供设置切换。
- 依赖后续聚合：真实 NPC 招募、装备 modifiers / lawProfile、战外临时 Buff 的持久解释、任务中文名；默认没有配置便不创建效果或新规则。
- 已解决：正式 TSAV v1 与 schema 2 已接线，默认演示只导出 TSAV / JSON；旧 TSUI 保留单向迁移。特殊检查点恢复、铁人模式与正式战斗存档条件仍交后续任务。
- 已解决：ENG-16c 将移动、招式、物品、防御、急性聚气统一送入 core 总线；finalize 原子
  写回背包、资源、章节限用和训练次数。ENG-16e 仍需接按钮可用性 / 高亮；当前默认能力继续禁用。
- 已解决：`itemState.battleUses` 只在活动 BattleState，重试恢复入场值，finalize 丢弃；
  `itemChapterUses` 从世界冻结入场并原子写回，应用没有第二份账本。
- 依赖章节内容装载：默认天龙三名 NPC 加主角、367 件已编译物品，不表示这些物品在正式开局可得。
- 已解决：战外使用传空 battleUses 且只提交 chapterUses；战斗规则与账本归 core（见桥接约定 20–21）。
- 依赖 ENG-06 / 内容 schema：正式官服装备 lawProfile 与玩家 identityTags 尚未入当前内容；没有配置时城门仅遵循已有通缉状态，不从文案猜执法规则。
- 依赖事件装配：EventAnchor 与随机遭遇端口已定义并发 probe / request 事件，正式会话当前未注入锚点或选择器。
- 依赖内容装配：`townNpcPlacements` / `townEventAnchors` 当前为空，默认不显示或触发未登记 NPC/位置事件；须由 ENG-05 内容提供 scene + era + 整数格坐标后接入。
- 依赖正式打坐遭遇：core 与 ENG-10 入口已测试，但现有内容没有可复用的通用 `enc_*` 和正式 CharacterState→BattleUnitSeed 转换；默认无遭遇时完成周天，不用演武夹具冒充剧情。
- 依赖养成 / 世界结算：SXP、永久经脉增益、伤势 / 调息、地形和任务写回尚需完整输入；默认只持久化可核算的训练事实。随机掉落的结果展示交 ENG-16e 消费 finalize 事件。
- 依赖 ENG-22：全局录像、deploy/order/free/concede/undo 和 Safari / Android hash 对拍；当前 Node 回归覆盖实际应用命令、自动事件、重试及行动上限。
- （待实测）城镇桌面 ≥60 fps、中端手机 ≥30 fps、触屏拾取、横竖屏和上下文丢失；页面展示实时 renderer 统计，Node 合批测试不作帧率结论。
- 对基准的修改提案：无；以上为实现边界和上游待归位事项，不重定义 canon 规则。
- 原著考据：人物简介仅引用内容已有 sourceWorks / locator 并保留“回目待考”；不新增回目、引文或人物身世断言。

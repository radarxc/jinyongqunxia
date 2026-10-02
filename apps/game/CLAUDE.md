# @tianshu/game

| 项 | 内容 |
|---|---|
| 归属 | Vite + Vue 装配与发布层；游戏规则归 core，通用组件归 ui，浏览器能力归 platform |
| 上游 | 作者 AR-19 / AR-21；tech/01、tech/05；design/03、09、10、13、14、15、18、21；ENG-01～04 / 06 / 12 |
| 当前入口 | ENG-07 壳 + ENG-10 六角战斗；根路径可切战斗，角色部件演示仍为 /rig-demo |
| 栈 | Vue 3.5 + Pinia + 模块 Worker / Comlink + ENG-01 IndexedDB；不引入新 UI 框架 |

## 结论先行（TL;DR）

core 默认运行在模块 Worker；仅启动失败或不支持 Worker 时回退主线程。命令通过 CoreHost 串行进入会话适配器，core 纯函数返回新状态，selector 只重建脏分支，再将裁剪投影写入 Pinia shallowRef。组件不持有 GameState，不重算玩法公式，不先行扣物品。

当前默认会话是明确标识的交互演示，使用独立数据库 tianshu-ui-preview。战斗页以 ENG-04 固定种子夹具演示六角范围、CT、逐行动自动回放与结算；正式创角、遭遇和地图仍由后续任务装配。演示进度不迁入正式数据库 tianshu，且不发旅程奖励。

## 目录与组件

| 路径 | 职责 |
|---|---|
| src/main.ts、App.vue、style.css | 装配 Pinia / controller、HUD、导航、快捷栏、键盘、无障碍设置和生命周期 |
| src/core-host.ts、core-worker.ts | Worker 握手、10 秒启动超时、Comlink 端口及启动期兼容回退 |
| src/runtime/ | 会话聚合、ENG-06 命令适配、预览初态、快照验证；content.ts 为编译内容 DTO |
| src/projection.ts、selectors/ | 脏标记 selector、物品分类、人物遮蔽、真实资源与经脉强度投影 |
| src/pages/ | 懒加载 CharacterPage、InventoryPage、SavePage；武功 / 任务 / 设置由 App 装配 |
| src/scenes/ScenePlaceholder.vue | 大地图 / 城镇 / 战斗的切换占位，没有地图或战斗规则 |
| src/battle/ | 战斗 Worker 适配、浅投影、六角场、CT、行动菜单、日志、自动回放与结算 |
| src/storage/ | 槽位摘要与 ENG-01 保存 / 读取 / 删除 / 单槽导入导出 |
| build/ | 构建期解析已验证内容、经脉目录与素材清单；不把 YAML 解析器放进浏览器 |
| scripts/worker-smoke.mjs | 对生产构建的 Worker 做 Node 独立线程 RPC 冒烟；不等同浏览器实测 |

通用组件位于 packages/ui/src/components：TxHud、TxResourceBar、TxAsset、TxVirtualList、TxModal、TxCharacterCollection、TxMeridianMap、TxInventory、TxSaveSlots；原有 TxButton / TxPanel / GameUi 保留兼容。

应用壳只从 @tianshu/ui/runtime 和单组件公开子路径取运行时依赖，页面组件动态加载。Worker 只引 @tianshu/platform/host，避免捎入 Dexie。不要从壳静态导入完整 UI 聚合入口，否则页面代码会提前载入。

## 桥接与下游接入约定

1. GameRemote 为 dispatch / query / snapshot / validate / restore；GameHost 另有 subscribe / dispose / mode。参数与结果必须可结构化克隆；快照仅交给存档服务。
2. dispatch、query、snapshot、restore 共用 FIFO 队列；保存快照排在先前命令之后。订阅返回退订函数；dispose 清理 Worker、监听器并拒绝尚未完成的请求。
3. GameUpdate 包含 accepted、changes、events 和可选 error。主线程按 changes 合并浅投影；拒绝命令不改 UI 与存档。stateVersion 由成功命令递增，worldTick 只由 core 时钟推进。
4. 当前 UiCommand 为 world/tick、inventory/equip（itemId、slot）、inventory/unequip（slot）、inventory/use（itemId、targetId）。组件经 uiBus 发意图，controller 等待宿主结果后更新。
5. dirty 分支为 hud / characters / inventory / equipment / quests；tick 只更新 hud，装卸只更新 inventory 与 equipment，已接通药效更新 hud / characters / inventory，restore 全量投影。增加玩法写入时同时登记 dirty 分支。
6. 未遇见人物在 Worker selector 内变成无姓名、无 NPC ID、无门派、无图片路径和无详情的剪影；相遇数据变化后才开放资料。affinity 沿用 design/18 的 −100..100，不从好感数值推断结交。
7. WorldTickedEvent 沿用 ENG-02 的顶层 seq / stateVersion / worldTick；其他 ENG-06 事实装入 RuntimeDomainEvent.payload，保留原事实字段。ENG-08 / 09 / 10 应复用 host.subscribe，禁止另开一份可写 core。
8. SessionSnapshot 的 known / usage / itemTargets / location 是上游 GameState 缺字段时的应用聚合边车，不是新的权威玩法 schema。后续状态归位需显式迁移 ui-session.v1，不能只改序列化字段名。
9. ENG-08 接场景资源、位置与入场事件；ENG-09 接战斗状态和行动槽、战斗消耗品、忙碌阶段存档门禁；ENG-10 接任务名称 / 状态、真实相遇与关系、正式新旅程。全部通过 Worker 会话命令 / 事件完成，场景显示层不直接改投影。
10. 主线程兼容宿主也克隆边界值；运行中 Worker 报错会使操作失败，不静默重启到初态。下游若添加自动恢复，须先冻结最后成功快照及命令序号。
11. `GameProjection.battle` 是 ENG-10 增量包：进入 / query 含 `info` 与全单位，后续只含变化单位；controller 以单位 ID 合并。战斗中 snapshot / restore / 普通命令被 Worker 拒绝，结束后 `battle/leave` 返回冻结的 `returnContext`。
12. UI 范围只调用 core `resolveAreaCells()`，提交前再次查询并稳定排序目标；CT 预计在一次性 timeline 副本上调用 core 调度函数，不推进真实状态或 RNG。
13. 自动战斗每个 `requestAnimationFrame` 至多发一个 `battle/step`，1× / 2× 只改回放间隔，“跳过”只省表现；关闭自动先停排帧，再经宿主 FIFO 切回手动。
14. ENG-11 通过 `controller.battle.onMoveResolved((moveId, from, to, result) => ...)` 注册播放器；异常只记录，不改结算。日志与飘字消费 core 事件自带 `message`，不重选周天 / 外放文案。

## 页面与持久化约定

- HUD 显示 HP / MP、行动槽、年月日时辰、地点和文钱；非战斗行动槽显示静息。无独立人物等级条。主菜单覆盖人物、物品、武功、任务、存档、设置。
- C / B / K / J / M 切页，1–3 使用快捷药品，Escape 返回江湖；输入控件和确认框内不拦截快捷键。列表支持方向键 / Home / End；触屏点选等价于拖装。精确指针最小 44 px、触屏 60 px。
- 配色引用 design/14，字体按 P04 使用系统中文黑体 / 宋体栈；不下载影视游戏字体。大字 / 减少动效为纯显示设置，写入 ENG-01 settings。
- 背包分类为十一种素材类别加任务物品；只有存在未映射项目时才出现“其他”。装备栏完整展示 ENG-06 的十一槽，双手 / 成对限制由 core 判断。
- 保存复用十二手动槽、一个快速槽、三个自动轮换槽。普通保存仅写手动 / 快速槽；特殊旅程检查点保留只读展示与导出，不擅自提供恢复和删除。
- 覆盖、读档、删除、导入先在模态框确认；快速保存按钮是显式覆盖快速槽的快捷操作。操作期间阻止重复按钮提交。
- 自动保存使用 ENG-01 的 30 秒节流与三槽轮换；变更后请求保存，30 秒轮询补落最后一次节流变更。hidden / pagehide 强制请求为尽力而为，移动端进程终止落盘仍为（待实测）。
- 单槽文件为 TSUI v1（.tsui）：5 字节魔数 / 版本、4 字节小端头长度、JSON 头与规范快照，头上限 16 KiB、快照上限 32 MiB。SHA-256 与结构 / 引用 / 模式校验均通过后才写所选槽位。它不冒充 tech/08 的 TSAV，也不调用替换全库的 TSDB 导入。
- 当前仅接通完整 healPct / mpPct / dispel 药效；含未接 Buff、体力、永久加值或经脉组合效果的道具会禁用，避免扣除物品却漏结算。ENG-06 战外 perBattle 计数暂由适配器隔离并保留战斗账本。
- ENG-04 当前生产命令只有招式 / 待机；移动、战斗物品、防御、急性聚气按钮按 capability 显式禁用并显示原因，禁止 UI 自算规则。经脉面板仍展示 core 已提供的透劲、占穴、丹田损伤与 Buff。
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

以下为技术核实来源，访问日期均为 2026-10-01；不涉及付费服务、价格或远程配额。

- [Vue shallowRef / markRaw](https://vuejs.org/api/reactivity-advanced.html)、[Vue 大列表与浅响应性能建议](https://vuejs.org/guide/best-practices/performance.html)：深层对象不代理、长列表需虚拟化。
- [Vite Worker 构建](https://vite.dev/guide/features.html#web-workers)、[Vite 配置加载](https://vite.dev/config/)、[Rolldown 按模块裁剪](https://rolldown.rs/options/treeshake)：模块 Worker URL、构建期 TS 配置与纯导出裁剪；runner 同时查验本地 vite/dist/node/cli.js。
- [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)、[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)、[Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static)：主流浏览器提供这些接口；Worker 启动仍须处理失败，Object URL 必须回收。
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)、[SHA-256 digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)：客户端存储与校验；digest 要求安全上下文，正式站点须 HTTPS。本机 localhost 可用于开发。
- 精确版本来自锁文件并核对 npm registry：[Vue 3.5.43](https://registry.npmjs.org/vue/3.5.43)、[Pinia 4.0.3](https://registry.npmjs.org/pinia/4.0.3)、[Comlink 4.4.2](https://registry.npmjs.org/comlink/4.4.2)、[Vite 8.3.1](https://registry.npmjs.org/vite/8.3.1)。
- 测试版本同样核对：[Vitest 5.0.3](https://registry.npmjs.org/vitest/5.0.3)、[Vue Test Utils 2.5.1](https://registry.npmjs.org/@vue/test-utils/2.5.1)、[happy-dom 20.14.5](https://registry.npmjs.org/happy-dom/20.14.5)、[fake-indexeddb 6.2.5](https://registry.npmjs.org/fake-indexeddb/6.2.5)。
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)、[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)：战斗回放分帧与画布尺寸监听；访问日期 2026-10-01，均为广泛支持的基线 API。

## 本文新增术语/约定

- GameHost / GameRemote / GameUpdate：应用的强类型命令 / 投影宿主；packages/platform 泛型 ProjectionHost 不依赖 UI。
- ui-session.v1：ENG-07 临时聚合快照，包含规范 GameState 及尚未归位的持久边车；restore 原子验证。
- TSUI v1：本次单槽文件信封；正式 codec 接入时要保留迁移入口，不与 TSAV / TSDB 混用。
- dirtyRevision / savedRevision：仅属 controller 的落盘追踪序号；I/O 期间若收到后续 core 事件，不会误把新变更当作已保存。它不是玩法时钟或存档 schema 字段。
- 无新增玩法、人物、物品、穴道或槽位 ID；命名复用 canon §12 与现有内容。
- BattlePacket / BattleView：Worker 到主线程的全量首包与增量战况包；不是第二份规则状态。
- onMoveResolved：交 ENG-11 的只读播放钩子，签名为 `(moveId, from, to, result)`。

## 待决事项 / 依赖

- 已解决：Worker 默认运行、浅投影、列表虚拟化、槽位流程与素材占位已落地；验证入口见上文。浏览器交互截图未获得：Chromium 启动被沙箱 MachPortRendezvousServer 权限拒绝；真实横屏 / 竖屏、触屏、Safari / Android、PWA 离线与生命周期落盘仍为（待实测）。
- 【建议值】演示主角初始七项先天均 50，一层黄上太祖长拳、无开穴；core 得 HP=300+(30+4×3)×1=342、MP=200。两名已遇 NPC 与零好感仅供界面演示；正式初态由 ENG-10 创角 / 剧情提供。
- 【建议值】福缘目前随其他先天显示数值，design/03 的五档词未给出阈值；默认保持真实数值，待上游提供档位映射后改为词并提供设置切换。
- 依赖 ENG-02 / 06 后续聚合：真实 NPC 招募 / 相遇账本、装备 modifiers / lawProfile、完整 Buff / 体力 / 经脉用药、任务中文名；默认没有配置便不创建效果或新规则。
- 依赖 ENG-04 扩展生产命令：移动 / 可达路径、战斗物品、防御与 `BattleState.meridianByUnit` 急性聚气尚未进入统一 resolver；默认能力禁用，待上游提供后只接命令和投影。
- 依赖正式 TSAV codec：默认演示继续用 TSUI，导入须保持 preview 模式一致；特殊检查点恢复、铁人模式与正式战斗存档条件交 ENG-09 / 10。
- 依赖章节内容装载：默认天龙三名 NPC 加主角、367 件已编译物品，不表示这些物品在正式开局可得。
- 依赖 ENG-06 修正战外 perBattle 校验：适配器当前传入空 battleUses 做战外结算，再保留旧战斗账本；修正上游后可移除兼容分支，保留回归测试。
- 对基准的修改提案：无；以上为实现边界和上游待归位事项，不重定义 canon 规则。
- 原著考据：人物简介仅引用内容已有 sourceWorks / locator 并保留“回目待考”；不新增回目、引文或人物身世断言。

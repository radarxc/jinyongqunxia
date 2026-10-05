# ENG-07-ui-panels 报告 · 游戏工程 · 交互页面（控制面板 / 人物卡片收集 / 物品栏 / 存档）

## 1. 摘要（3–6 行）

- 已完成 Vue / Pinia 交互壳、Worker CoreHost、增量只读投影、人物卡片与经脉、背包十一槽装备及存档页面。
- 规则调用 ENG-02 / 06，持久化调用 ENG-01；未修改 core、内容、基准或其他任务文件。
- 默认入口明确标为交互演示，独立数据库隔离；大地图、城镇和战斗保留场景占位，等待 ENG-08 / 09 / 10 接入。
- 第 2 次运行只展开 main.ts / style.css 的压缩行并更新本报告；冻结安装、全量检查、生产构建、严格 ID 检查已全部重跑通过，截图与移动端交互仍待实测。

## 2. 产出（文件、行数、主要章节）

以下行数为本次新增或修改文件的最终长度，不是新增行数；生成的 dist / 素材副本不计入。

| 文件范围 | 文件数 / 行数 | 主要内容 |
|---|---|---|
| `apps/game/` | 35 / 1,761 | 应用壳、3 个页面、Worker 会话、selector、存档、构建插件和测试 |
| `apps/game/CLAUDE.md`（含于上行） | 1 / 106 | 目录、桥接、页面、素材、验证、技术来源和下游约定 |
| `packages/ui/` | 19 / 838 | 9 个通用组件、投影 DTO、shallowRef store、主题、中文文案与组件测试 |
| `packages/platform/` | 7 / 203 | 泛型投影宿主、FIFO / 订阅 / 释放、下载、公开入口与宿主测试 |
| `pnpm-lock.yaml` | 1 / 6,566 | 仅新增 9 行 importer 引用，无新增外部解析版本 |
| 本报告 | 1 / 78 | 验收、续作修复、限制和跨任务交接 |

- 依赖：应用补声明已有 `@tianshu/shared` / `@tianshu/data` 工作区依赖和已在锁中解析的 `fake-indexeddb@6.2.5`；未新增 UI 框架，根 `package.json` 未改。
- 上次运行已登记技术版本、Worker / IndexedDB / ResizeObserver 等 API 的联网核对；链接和访问日期 2026-10-01 见 `apps/game/CLAUDE.md`「参考资料」。本轮只改格式，未新增技术事实或依赖，未重复联网核对。

## 3. 关键结论与数值

- 已解决：疑似截断来自语句与声明压在单行。`main.ts` 43→55 行（基线 52；55/52=105.8%），`style.css` 39→290 行（基线 113；290/113=256.6%），均超过 85%；格式化前后规范输出一致。
- Worker 默认承载会话；启动失败才兼容回退主线程。主线程入口仍加载含规范 JSON 帮助函数的 core 纯函数分块，正常模式不在主线程创建会话。
- dirty 分支为 hud / characters / inventory / equipment / quests；投影以 Pinia `shallowRef` 替换脏分支，干净数组保留引用；人物与背包都虚拟滚动。
- 演示（原创扩展）HP 按 core / design/03 得 `300+(30+4×3)×1=342`，MP=200；药品回归为 `100+floor(342×500/10000)=117`，UI 不另算属性。
- 时钟沿用 core：10 tick / 分钟、600 / 小时、1,200 / 时辰、14,400 / 日；30 日 / 月、12 月 / 年。
- 素材与内容：367 件物品、150 张可用 64 px 图、0 张已就绪 portrait；主角加 3 名 NPC 卡片，未遇人物在 Worker 内遮蔽身份。经脉目录为 20 脉 / 180 个唯一穴位。
- 存档：12 手动 + 1 快速 + 3 自动槽；自动档沿用 30 秒节流、三槽轮换。临时 TSUI v1 单槽文件校验 SHA-256，头限 16 KiB、快照限 32 MiB。
- 包体 gzip：entry `151.70 ≤ 170 KiB`、render `127.63 ≤ 180 KiB`、WebGL 合计 `279.33 ≤ 350 KiB`；预算未放宽。
- 精确指针交互目标至少 44 px，触屏至少 60 px；配色引用 design/14，字体遵循作者 P04 的系统字体默认。

## 4. 开放问题（附默认值）

- O1：正式创角 / 剧情相遇未装配。默认演示库 `tianshu-ui-preview`，正式库 `tianshu`；拒绝跨 preview 模式恢复，演示物品和关系不作为正式开局。
- O2：装备数值 modifiers / lawProfile、完整 Buff / 体力 / 永久加值 / 经脉药效尚缺应用聚合。默认只接完整 healPct / mpPct / dispel；其他组合禁用，不扣物品也不编造效果。
- O3：GameState 尚缺相遇、使用账本和位置等字段。默认由 `ui-session.v1` 边车持久化，正式状态归位时做显式迁移。
- O4：正式 TSAV codec 未提供。默认使用明确标识的 `.tsui` 单槽导入导出；特殊检查点只展示 / 导出，战斗门禁和铁人模式交 ENG-09 / 10。
- O5：portrait 缺失及福缘五档阈值未定义。默认使用占位、福缘真实数值；不自行划档，不新增原著断言或未经核对的回目。
- O6：浏览器布局、触屏、Safari / Android、PWA 离线及进程终止落盘（待实测）；默认保留响应式布局及 hidden / pagehide 尽力保存，不宣称真机性能已达标。
- O7：ENG-06 战外使用仍检查 perBattle。默认战外适配传空 battleUses 并保留原战斗账本；已有回归测试，待上游修正后移除兼容分支。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。本次不新增或重定义玩法 ID、公式、剧情奖励与基准规则；临时工程约定和未接通能力按第 4 节保留依赖。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 接口 | 位置 | 需同步内容 |
|---|---|---|
| `docs/tech/01-architecture.md` | §5 | Worker 投影桥接、dirty selector、浅 store、懒页面及真实首屏依赖 |
| `docs/tech/05-gameplay-engine.md` / `packages/core/CLAUDE.md` | §2 / 状态聚合 | dispatch / query / subscribe 接线；归位 known / usage / itemTargets / location 并迁移 |
| `docs/tech/08-backend-and-online.md` | §3 / §12.6 | TSUI 临时单槽、TSAV 正式 codec、TSDB 全库包的边界与迁移 |
| `docs/design/10-items-and-equipment.md` / data schema | 装备与药效数据 | 完整 modifiers / lawProfile、药效结构与聚合，补齐后开放相应 UI 操作 |
| `packages/core/src/economy/consumables.ts` | perBattle 校验 | 按战斗上下文应用战斗次数限制，避免战外受旧战斗账本阻挡 |
| `docs/design/03-attributes.md` | §1.3.1 | 提供福缘五档数值阈值后改显示并增加设置切换 |
| ENG-08 / 09 / 10 交接说明 | 场景 / 战斗 / 任务 | 复用同一 GameHost；接真实入场、战斗行动槽、任务名称、相遇与正式新旅程 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 页面 / 组件：HUD、快捷栏、人物 / 物品 / 武功 / 任务 / 存档 / 设置；CharacterPage、InventoryPage、SavePage；TxHud、TxResourceBar、TxAsset、TxVirtualList、TxModal、TxCharacterCollection、TxMeridianMap、TxInventory、TxSaveSlots。
- ✅ 控制面板：HP / MP / 行动槽、年月日时辰、地点、金钱；键盘切页、方向键列表和触屏点选；人物与物品列表虚拟化，不写地图或战斗场景。
- ✅ 人物 / 物品：关系、简介、面板、武功层数、开脉开穴强度；十一类加任务物品、数量、品阶 / 年限 / 效果 / 出处、十一装备槽、点选 / 拖放装卸和可支持消耗品。
- ✅ 桥接：GameRemote dispatch / query / snapshot / validate / restore，GameHost 增加 subscribe / dispose / mode；FIFO、原子恢复、退订与销毁；核心状态不进入深响应式。
- ✅ 存档：槽位摘要、存 / 读 / 删 / 导入 / 导出、确认框、忙碌状态及自动档提示；fake-indexeddb 验证 ENG-01 实际 API、损坏文件拒绝与整页流程。
- ✅ 本轮测试：常规 45 文件 / 238 测试 + rig 性能 1 文件 / 2 测试，共 46 文件 / 240 测试通过；覆盖投影引用、身份遮蔽、命令、存档、FIFO 和 10,000 项虚拟列表。
- ✅ 本轮重跑 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm --filter ./apps/game build` 全通过；内容 375 文件 / 375 对象及首屏包体门禁通过，锁文件未漂移。
- ✅ 生产 Worker（上次运行记录）：`node apps/game/scripts/worker-smoke.mjs` 已在 Node 独立线程验证查询、装备、恢复、身份遮蔽和 20 / 180 经脉目录；本轮格式调整未重复该冒烟，不作为浏览器实测。
- ✅ 本轮 `python3 tools/lint/check_ids.py --strict` 通过、严格失败数 0；保留既有基线 `docs/README.md:185` 的 `sk_babuganchan` 未定义提示，未越权改文档。
- ✅ 下游接口：`apps/game/CLAUDE.md` 已列目录、命令 / 事件、快照、场景接入和各项默认值；没有新增 UI 框架或修改 core / 计划清单 / 基准，`git diff --check` 通过。
- ⚠️ 构建仍有 render 未 gzip 分块大于 500 kB 提示，现有 gzip 门禁全过；实际移动设备帧耗时待实测。
- ⚠️ 截图说明：上次缓存 Chromium 启动被沙箱 MachPortRendezvousServer 权限拒绝，未获得截图；本轮未重试，happy-dom 组件测试和 Node 线程冒烟不证明浏览器视觉与触屏效果。
- ✅ 续作范围：只改上述两文件与本报告，每次补丁 ≤50 行；两文件符合仓库 Prettier 配置，保留现有逻辑和 CSS，85% 行数检查通过；完整调度器 finish 留给调度器执行。

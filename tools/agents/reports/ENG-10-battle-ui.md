# ENG-10-battle-ui 报告 · 游戏工程 · 战斗界面（六角战旗 / 速度条 / 行动与聚气 / 范围预览 / 自动战斗 / 提示文案）

## 1. 摘要（3–6 行）

- 已交付 Three r186 的 2.5D 六角战旗、分层 rig 单位、增量 HUD、CT 条带、范围预览、日志 / 飘字、自动回放与结算返回。
- UI 只消费 ENG-04 查询、命令和事件：范围由 `resolveAreaCells()` 同源查询，结算不在界面重算。
- 战斗页、controller、求解桥均按需加载；高亮只改 uniform，自动战斗每帧至多推进一步，可随时切回手动。
- 8 个新增测试文件覆盖组件命令、范围一致性、自动接管、黄金事件序列、实例高亮与选格；全部仓库门禁通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `apps/game/src/battle/`（22 文件） | 1,201 | 页面装配、协议 / 求解桥、投影、8 个组件及 6 个测试文件 |
| `packages/render/src/battle/`（6 文件） | 287 | 实例化六角层、rig 战场、拾取 / 投影、2 个测试文件 |
| `apps/game/src/{App,game-controller,core-host}.ts/.vue`、`runtime/*` | 439 | 壳接入、Worker 协议、存档门禁、按需加载与会话测试 |
| `apps/game/CLAUDE.md`、`packages/render/CLAUDE.md` | 163 | 能力边界、性能契约、ENG-11 钩子与官方资料 |
| `packages/render/package.json` | 22 | 新增 `@tianshu/render/battle` 导出；无新增依赖，锁文件未改 |

## 3. 关键结论与数值

1. 战场上限沿用宿主校验：最多 400 格、100 个标记；格子为单个 `InstancedMesh`，状态经 uniform 更新，不重建 geometry。
2. CT 就绪线与预计顺序直接投影 ENG-04 timeline；6 / 12 向范围均调用 core `resolveAreaCells()`，命中单位来自同一结果。
3. 自动 1× / 2× 的步进间隔为 `900/速度` ms；“跳过”令间隔为 0 且省表现，但仍每个动画帧最多一条命令。
4. 日志保留最近 200 条、飘字保留最近 8 条；单位投影只合并变更单位，画布 HUD 坐标原位更新。
5. size 实测：entry 164.34 KiB / 170，render 139.34 KiB / 180，WebGL 总计 303.68 KiB / 350。
6. rig 性能门禁：20 人 / 400 实例最低 P95 0.072 ms；100 人 / 1,600 实例最低 P95 0.316 ms。

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 当前边界 |
|---|---|
| 移动、物品、防御、急性聚气 | ENG-04 正式 resolver 仅有招式 / 待机；按钮按 capability 禁用并显示原因，不由 UI 伪造规则 |
| 经脉完整度 / 在途气量 / 承载上限 | `BattleUnit` 尚未提供时显示“未提供”或“—”；攻击倍率仅显示 core 已给的 `meridianAttackBp` |
| 掉落、经验 / 熟练度、周天奖励 | core 终局尚无奖励载荷，默认显示无奖励；不生成占位数值 |
| 正式角色资源 | 默认使用 ENG-12 rig 的分层占位 manifest；正式入口可注入生产 `RigManifest`，装备层已随单位更新 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 AR-19 / AR-21、`design/09`、`tech/05` 与 ENG-04 交付边界，未修改玩法公式或新增事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| ENG-04 / 后续 combat core | `BattleUiCommand` | 补齐移动、物品、防御、急性聚气 resolver 与经脉运行态字段后，开启现有 capability 按钮 |
| ENG-04 / 奖励结算 | `BattlePacket.rewards` | 输出掉落、经验 / 熟练度、周天奖励；UI 已有弹窗消费位置 |
| ENG-12 角色 rig | 生产资源装配 | 从正式入口注入角色 `RigManifest`，替换当前默认分层占位资源 |
| ENG-11 动效 | 招式播放器 | 注册 `onMoveResolved(moveId, from, to, result)`，只消费结算结果，不回写命中规则 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 组件清单

- ✅ `BattlePage` 装配；`BattleField` 六角 / rig / HUD；`BattleTimeline` CT；`BattleActions` 行动；`BattleMeridians` 经脉；`BattleLog` 日志明细；`BattleControls` 自动；`BattleResult` 结算。
- ✅ 选中 / 当前行动 / 范围 / 命中高亮，朝向、地形、单位状态图标、血 / 内力 / CT 条，以及参战人物与胜负条件均可见；renderer 已保留可达格 uniform，待移动查询开放后传值。
- ⚠️ 移动、物品、防御、急性聚气界面齐备但按上游 capability 禁用；这是 ENG-04 已记录边界，不在 UI 内补公式。

### 事件 → 文案对照

| 事件 | 展示 |
|---|---|
| `qi.fullCycleCrit` | 优先 core `message`，含“运转一周天，内劲喷涌而出，难以抵挡” |
| `combat.qiRepel` | 优先 core `message`，含“真气鼓荡震开攻击” |
| `battle/foreignQiInjected` | “透劲入体，经脉受阻” |
| `battle/acupointOccupied` | “打穴封脉，穴位被占” |
| `buff/damage` / `buff/actionSkipped` / `buff/expired` | “负面效果伤害” / “行动受阻” / “状态消退” |

### 自动战斗交互与 ENG-11 钩子

- ✅ 自动开关进入同一 ENG-04 resolver；1× / 2× / 跳过仅影响回放节奏，关闭时停止排帧并经宿主 FIFO 接回手动。
- ✅ `onMoveResolved(moveId, from, to, result)` 为只读播放钩子；回调异常隔离，不能改变 core 已提交的结果。

### 门禁与完整性

- ✅ `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm --filter ./apps/game build`、`python3 tools/lint/check_ids.py --strict`、`pnpm size` 与 `git diff --check` 全通过。
- ✅ 全量 65 个测试文件 / 340 项普通测试及 2 项 rig 性能测试通过；内容校验 375 文件 / 375 对象通过。
- ✅ strict ID 仅报告仓库基线已有 `sk_babuganchan`，新增失败为 0；未新增依赖、未改 core、未改允许写集之外文件。
- ✅ Three `InstancedMesh` / `ShaderMaterial` / `Raycaster` 与 MDN `requestAnimationFrame` / `ResizeObserver` 已联网核实，来源和 2026-10-01 访问日见两份 `CLAUDE.md`。


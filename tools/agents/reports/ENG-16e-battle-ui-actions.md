# ENG-16e-battle-ui-actions 报告 · 游戏工程 · 战斗补全 E：战斗界面接通移动 / 防御 / 物品 / 聚气与可达高亮

## 1. 摘要（3–6 行）

- 战斗 HUD 已只消费 core 查询，接通移动草稿、招式 / 待机 / 防御 / 物品完整计划，以及不可带移动的急性聚气。
- 可达格、路径、幽灵终点复用固定 DataTexture；单位实时位置 / 朝向 / 经脉路线和终局奖励均来自 core 投影。
- happy-dom、runtime / controller 与 mock Three 回归已覆盖关键流程；规定的安装、全量检查、game 测试 / 构建、严格 ID 检查全部通过。
- 浏览器触控手感、WebGL 帧率及 VFX 观感仍为（待实测）。

## 2. 产出（文件、行数、主要章节）

- `apps/game/src/battle/`：修改 13 个既有文件，新建 2 个组件测试；DTO、只读查询、runtime / controller、三块 UI、样式与回归共 +771/-110 行。
- `packages/render/src/battle/`：4 文件接入 path / ghost 纹理通道与 4 draw-call 回归；`packages/render/CLAUDE.md` 同步约定。
- `packages/ui/src/i18n.ts`：新增 63 行操作、拒绝原因、背包 / 经脉与奖励文案。
- 本报告 1 文件；未改 core、依赖、门禁、预算或 `node_modules`。

## 3. 关键结论与数值

- 移动草稿只存于 app runtime；选格调用 core `queryReachable/queryPath/queryBattleAction`，取消与确认前均不推进 session、RNG 或 transcript。
- 物品逐 item / target 预检 core 冷却与限额；UI 显示 `itemUses/itemMaxUses`。路线用 `queryBattleQi/previewBattleRoute/queryBattleAction`，满载等原因由 core code 翻译。
- 高亮为 `400 × 1 × 4 = 1600 bytes` RGBA8 DataTexture：R=可达/路径、G=范围、B=就绪、A=幽灵/选中；固定 1 个 terrain draw，战场测试总计仍为 4 draw calls。
- `pnpm size`：entry 37.99/170 KiB gzip，render 168.93/180，WebGL total 206.92/350，session 96.63/110；战斗增量闭包 53.20 KiB。战斗页仍为独立懒加载 chunk。
- Three 0.186.1；官方 [DataTexture](https://threejs.org/docs/pages/DataTexture.html) 已于 2026-10-04 核实 RGBA 每 texel 四分量及数据纹理接口。

## 4. 开放问题（附默认值）

- core `BattleUnit` 尚无实时 `qiNature`：默认不再沿用静态 launch marker，VFX 使用既有 binding fallback；待 core 投影字段后直接透传。
- `projectBattleRewards()` 只给使用统计 / 掉落，不给结算后的武学经验、熟练度名称载荷：默认成长栏显示“本次未提供成长结算”。
- （待实测）默认以现有吸附、色值和触控命中区进入集成；由协调者在沙箱外核对横竖屏、取消手感、低端 Android FPS / 显存与特效同步。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 design/09 §4.6–§4.8、design/14 §5.3 / §6.1 与 tech/05 §3.4 / §6.5。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `apps/game/CLAUDE.md` / 页面与持久化约定：将“交 ENG-16e”改为已接通，并登记 `qiNature` / 成长载荷缺口；因不在写集未改。
- `packages/core` / 战斗投影契约：后续补单位实时 `qiNature`；若奖励面板需成长实值，再补 finalize 后经验 / 熟练度的展示载荷。
- ENG-19 主流程：战斗进出沿用 `BattleController.command({t:'battle/enter',launch})`、增量 `GameProjection.battle`、`battle/leave`；页面只绑定 `view/command/preview/dispose`，不另建规则状态。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 操作 / 命令：移动+招式→`battle/act {actor,walkTo,action:{t:'skill',…},expectedRevision}`；待机 / 防御 / 物品同包分别为 `wait` / `guard` / `item`。聚气→`battle/act {actor,action:{t:'acuteQiGather',routeRef},expectedRevision}`，无 `walkTo`。
- ✅ 移动两段确认：core 可达高亮→选格路径 / 幽灵→选招或待机 / 防御 / 物品→一次确认；取消及 revision 变化清草稿且不改 transcript。
- ✅ 可用性 / 投影：移动、防御、物品、聚气、待机均取 core 预检；单位位置 / 朝向 / active route 及奖励载荷取 core；app 不重算规则或几何。
- ✅ 渲染：复用 1600-byte DataTexture，无大 uniform array、无新增 draw call；mock Three 验证纹理字节，scene 维持 4 calls。
- ✅ 测试：`pnpm check` 170 files / 1228 tests；game 39 files / 157 tests；独立 game build、frozen install、strict IDs 均 exit 0。strict 仅报告既有基线 `sk_babuganchan`，新增失败 0。
- ✅ 体积 / 懒加载：全部预算 PASS，BattlePage chunk 12.22 KiB gzip、战斗闭包 53.20 KiB；未放宽任何门禁。
- ⚠️ core 待补：实时 `qiNature` 与可展示的武学经验 / 熟练度结算；当前采用上述显式降级，无静态伪值。
- ⚠️ 手感 / 帧率：Chromium / 真机由协调者沙箱外验证；Node 测试不冒充 GPU 实测。构建日志仅有既有 `ASSET_SOURCE_MISSING` 占位提示。

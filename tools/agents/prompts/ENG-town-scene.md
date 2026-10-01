# 本任务：游戏工程 · 城镇小地图（three.js 高低起伏贴图、建筑直接进入半透明、NPC / 位置事件锚点、打坐被袭岔气）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`apps/web/CLAUDE.md`、`packages/core/CLAUDE.md`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 交互层 3.3 小地图（城镇、大型建筑、地下迷宫探险等）：3.3.1 城镇中的移动、高低起伏（threejs 贴图）；3.3.2 店铺等建筑可直接进入（不切地图），贴图半透明，和 NPC 交互；3.3.3 NPC / 位置等事件锚点；3.3.4 可找地方打坐练功，NPC 可能攻击，被攻击时岔气。

## 设计依据

`docs/design/22-town-layout-and-generation.md`（CitySpec、布局、贴片 / 建筑套件、45° 出图）、`docs/design/town/<city_id>__<chNN>.yaml`（布局：格子坐标、建筑 ID、旋转、湖体多边形）、`tools/town/{gen_layout,render_town,plan_view}.py`（栅格与投影参数，运行时须与之一致）、贴片 `assets/default/tile/<kit>/manifest.yaml`、建筑 `assets/default/building-map/<kit>/manifest.yaml`、`tools/agents/prod_plan.py` 的 `kit_for(region, band)`；ENG-05 事件锚点与对话、ENG-06 店铺、ENG-03 打坐 / 岔气、ENG-04 战斗入口（`BattleSetup` 城镇打坐被袭）。

## 要做的事

1. 运行时数据：`tools/content/town_runtime.py`：把 CitySpec + 布局 YAML 转成运行时 JSON（格子网、每格贴片 / 高度 / 可走性、建筑占地与入口、湖体格、锚点位；贴片 / 建筑图集引用）；生成 `content/town/<chNN>/<city_id>.json`（至少基线两城：杭州南宋、大理北宋，其余按已合入的 CITY-* 规格批量生成并 `--check`）。
2. `packages/render` 城镇场景：three r186：地面格子贴片（图集 + 实例化）、高低起伏（高度图位移 + 贴图，台阶 / 坡道可走）、建筑精灵 / 面片按 45° 投影摆放（与 render_town.py 同一投影）、8 向边件；镜头固定斜视可缩放；玩家移动（点击寻路 + 方向键，整数格，碰撞）；性能：大城 ≥ 60 fps 桌面（统计 draw call）。
3. 建筑直接进入：玩家走到建筑入口 → 不切地图，建筑贴图渐变半透明露出内部（内部为简化地面 + 柜台 / NPC 位），走出恢复；店铺内与 NPC 交互 → 调 ENG-06 买卖、ENG-05 对话。
4. 事件锚点：从 ENG-05 注册表取 NPC 锚点 / 位置锚点，渲染可交互提示（图标 / 高亮），触发 → 发 core 命令；NPC 按书界时代图层与剧情状态出现 / 消失。
5. 打坐：标记可打坐位置（庙宇、客栈房、僻静处）；打坐 → ENG-03 推进时间 / 周天；敌意 NPC 可能来袭（概率与书界 / 时段 / 通缉有关） → `interruptMeditation()` 岔气 → 构造 `BattleSetup`（ENG-04）进入战斗（ENG-10 UI，本任务只发命令并切场景占位）。
6. 测试：运行时数据生成 `--check`（两基线城通过）、可走性 / 寻路、建筑进入状态机、锚点触发命令、打坐被袭流程（用假随机种子）；渲染 smoke 测试；`pnpm check` 全绿；web build 成功。
7. 更新 `packages/render/CLAUDE.md`、`apps/web/CLAUDE.md`。

约束：不改 `tools/town/` 的出图逻辑（只读其参数）；每次写入 ≤ 150 行；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/web build`
- `python3 tools/content/town_runtime.py --check content/town`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：运行时数据结构；投影一致性验证方法；性能数据；进入 / 锚点 / 打坐接口；交 ENG-10 的战斗入口。报告 ≤ 100 行。

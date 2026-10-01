# 本任务：游戏工程 · 大地图（城镇间行走、野外遗迹进入、城镇进入）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/render/CLAUDE.md`、`packages/core/CLAUDE.md`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 交互层 3.2：大地图——城镇间行走、野外遗迹进入、城镇进入。

## 设计依据

`docs/tech/01-architecture.md`（three r186 场景、2.5D）、`docs/tech/05-gameplay-engine.md` §5（旅行推进时间）、`docs/design/02-timeline-and-world-tiers.md`（书界地理与定年）、`docs/design/22-town-layout-and-generation.md`（城镇清单与坐标：`docs/design/town/*.yaml` 的 `city_id` / 经纬或平面坐标 / 年代带）、`tools/town/`（城镇规格读取方式）、大地图美术若有（`assets/default/` 下搜 `worldmap` / `map`；没有就用程序化地形 + 贴片 `assets/default/tile/<kit>/` 做占位，报告写明）。ENG-05 的事件锚点与时间 API、ENG-06 的通缉 / 城门标志。

## 要做的事

1. `packages/render`：大地图场景（three r186）：2.5D 斜视地形层（高度图或分层贴图）、道路网、城镇 / 遗迹节点（按年代带显示 / 隐藏）、玩家标记与行走动画、镜头跟随与缩放；性能：节点实例化、纹理图集、≥ 60 fps（桌面）。
2. 交互：点选城镇 / 遗迹 → 沿道路寻路（A*，整数格）→ 行走中按里程推进 `GameClock`（ENG-05）→ 到达触发：城镇进入（检查城门拦截 / 通缉标志，ENG-06；通过则切城镇场景，ENG-09 的入口）、野外遗迹进入（切遗迹场景占位）、路上遭遇钩子（事件锚点 / 随机遭遇接口，战斗由 ENG-04 / ENG-10 处理，这里只发命令）。
3. 数据：`content/world/<chNN>/map.yaml`（节点、道路、里程、年代带；从 `docs/design/town/*.yaml` 与 design/02 生成：写 `tools/content/worldmap_from_towns.py`）。
4. UI：在 ENG-07 的壳里挂大地图页；节点悬浮信息（城名、年代、等级）；行走中可取消。
5. 测试：寻路（整数、确定）、里程 → 时间换算、进入判定（通缉拦截）、地图数据校验；渲染层用无头 smoke 测试（场景可构建、对象数符合）；`pnpm check` 全绿；web build 成功。
6. 更新 `packages/render/CLAUDE.md`、`apps/game/CLAUDE.md`。

约束：不写城镇内部与战斗；每次写入 ≤ 150 行；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告；three 用法与 `tools/vfx/web/` 一致的 importmap / 版本。

性能是作者硬要求（AR-21「性能要最好」）：节点 / 道路实例化、纹理图集、静态几何合批；寻路整数 A* 预分配；桌面 ≥ 60 fps、中端手机 ≥ 30 fps（tech/03），报告给 draw call 与帧时间；`pnpm size` 必须过。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：场景结构；数据生成统计（节点 / 道路数）；性能测量方式与结果；交 ENG-09 的进入接口。报告 ≤ 100 行。

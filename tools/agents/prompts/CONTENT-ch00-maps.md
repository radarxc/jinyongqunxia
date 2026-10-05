# 本任务：内容 · 序章 ch00 地图：竹林、山径、越营、长白山洞四个场景（Tiled）

本任务画 Tiled 地图（`.tmj`），**不写引擎代码**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `content/CLAUDE.md`、`content/README.md`、`content/tiled/README.md`；
- 报告 `tools/agents/reports/ENG-18b-tiled-regionmap.md`：怎么画、图层与对象类、属性、校验、放哪，必须照做；
- 设计 `docs/design/chapters/00-yuenv.md` §2.1–§2.3（场景、出口、门禁、安全锚点）、§5（三个战场的格数）；`docs/design/08-terrain-and-qinggong.md` §3（地形 ID）、§6.3（轻功门）。

## 为什么做

M1 序章的探索场景（ENG-20a / 20b 负责运行时）要有地图数据。设计已定场景、尺寸、出口与门禁。

## 范围

| 场景 | 位置 | 尺寸 | 要点 |
|---|---|---|---|
| `sc_00_zhulin` | `content/world/regions/rg_jiangnan_taihu/` | 18×14，约 170 格 | 竹、平地、浅水、独木桥，h0–1；入口 `bookfall`；东北出口 `to_shanjing` 在 C01 前软锁 |
| `sc_00_shanjing` | 同上 | 20×16，约 210 格 | h0–2；qg1 沟，或绕行 10 格 |
| `sc_00_yueying` | 同上 | 20×18，约 260 格 | h0–2；西北出口；`transmission_inkpoint`（传功在越营）；营门在 C03 前软锁 |
| `sc_00_changbai_cave` | `content/world/regions/rg_dongbei/` | 10×8，约 42 格 | 雪、冰、岩，h0–1；单向进入；不打不捡；配点提交前不能离开 |

- 区域：
  - 三个越地场景复用 `rg_jiangnan_taihu`，界面显示「越地」。如果 ENG-18b 的 schema 支持显示别名就写上；不支持，在报告里列为待补（协调者裁定）。
  - 长白山洞归 `rg_dongbei`（协调者裁定）。
- 每张图都要有：出生点；成对的出口；三个入口处的安全锚点；轻功门；三个战场（BattleArena，各 ≤ 400 格、跨度 ≤ 20）；人物出生点；竹棒、桃、墨点等拾取或交互点；自动存档触发。ID 与 CONTENT-ch00a 的人物、道具、任务对上。
- 春秋越地没有建筑与贴片套件，地形用占位 tileset，正式素材到位后不改地图。

约束：
- 写集：`content/world/regions/rg_jiangnan_taihu/sc_00_*.tmj`、`content/world/regions/rg_dongbei/sc_00_changbai_cave.tmj`，以及 ENG-18b 约定的同目录附属文件。写集外的改动在提交时会被丢弃。
- 不改 `packages/**`、`apps/**`、`docs/**`、`content/tiled/**`；tileset 有缺口就在报告里写明。
- 每次写入 ≤ 150 行（大图分块写）。

检查：以下命令必须全部通过。
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 四张图的尺寸、格数、出口与门禁表；
- 锚点 ID 清单；
- 战场格数；
- 校验结果；
- 交给 CONTENT-ch00c（战场 ID）、ENG-20a / 20b（实际用到的对象类）的接口。

报告 ≤ 60 行。

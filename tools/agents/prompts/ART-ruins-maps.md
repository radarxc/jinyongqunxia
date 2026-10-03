# 本任务：遗迹与探险地宫地图 · 九老洞、敦煌地宫等（Tiled 场景地图 + 预览；作者 2026-10-02 晚）

本任务写内容数据（Tiled 场景地图）并出预览图，不写运行时代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `tools/agents/prompts/_codex_worker.md`（执行环境）、**`tools/agents/reports/ENG-18b-tiled-regionmap.md`（已合入：Tiled → RegionMap 的合同、目录约定、图层与对象类、校验命令，第 7 节交接必须照做）**、`docs/tech/04-data-pipeline.md` §6、`docs/design/11-open-world.md` §1.2–§1.3（场景尺寸档）、§4.4（遗迹类型、结构、数量预算）、`docs/design/08-terrain-and-qinggong.md` §3（48 种地形）、`content/tiled/README.md` 与 `content/tiled/tilesets/`。

## 作者原话（2026-10-02 晚，逐字）
> 同时再开一个codex exec（gpt-6 astra extra high），负责把遗迹、探险地宫等地图绘制完成（九老洞，敦煌地宫等）

## 范围与顺序
1. 先列清单：`grep -n "遗迹\|地宫\|洞\|墓\|地窖\|密道" docs/design/chapters/*.md docs/design/11-open-world.md docs/design/20-legacy-inheritance.md`，整理出各书的遗迹 / 探险地宫（具名的如九老洞、敦煌地宫、无量山玉洞、琅嬛玉洞、古墓、绝情谷、侠客岛、雪谷等），记入报告；以章节文档登记的 `sc_*` / `poi_*` ID 为准，没有 ID 的只在报告第 6 节列出，不自造。
2. 顺序：M1 相关（序章长白山洞、白马冷入口沿线、ch10 的废驿 / 迷宫）→ 作者点名（九老洞、敦煌地宫）→ 天龙 → 射雕 → 神雕 → 倚天 → 其余各书。
3. 每座遗迹：按 design/11 §4.4.1 的最小闭环（入口 → 1～3 个外围房 / 岔路 → 核心遭遇或谜题 → 奖励 → 可回返出口），按真实地貌布置（洞窟、墓道、地宫、山谷各不相同，不要同一套换名）；尺寸按 §1.2 档位；图层与对象按 ENG-18b 合同（terrain / height / deco / objects，PlayerSpawn、门禁、采集点、遭遇点等对象类）。
4. 每张地图出一张预览 PNG（用 ENG-18b 的预览工具；没有就用 PIL 按地形表配色画格网 + 对象标记），`view_image` 目检通路连通、入口出口可达。
5. `done.txt` 记每张；被中断后续做。

## 产物
- `content/world/regions/<rg_id>/<sc_id>.tmj`（Tiled 1.12 正交有限地图，图层与属性按合同）；
- 预览 `content/world/regions/<rg_id>/<sc_id>.preview.png`（若合同规定别处，照合同）；
- 必要的 tileset 引用只用 `content/tiled/tilesets/` 已有的；缺的地形贴片写进报告第 6 节。

## 约束
- 只写：`content/world/regions/**`、`content/tiled/tilesets/**`（只增不改已有）、本任务报告。
- 不改 `packages/**`、`tools/**`、设计文档；每次写入 ≤ 150 行；报告 ≤ 100 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm content:validate`
- `pnpm content:build`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：遗迹清单（书、ID、类型、尺寸档、房间数）与预览路径；未做的与原因；第 6 节：没有 ID 的遗迹、缺的贴片。

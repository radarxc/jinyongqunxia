# 本任务：设计 · 遗迹 / 地宫补 ID——九老洞、敦煌地宫（作者 AR-36 点名）与章节文档里具名但没有 ID 的遗迹

本任务改文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` AR-36（「把遗迹、探险地宫等地图绘制完成（九老洞，敦煌地宫等）」）；
- `tools/agents/prompts/ART-ruins-maps.md` 第 9–10 行（清单做法与顺序）——ART-ruins-maps 正在跑，它只做已有 `sc_*` / `poi_*` ID 的遗迹，九老洞、敦煌地宫因为没有 ID 做不了，本任务就是补 ID；
- `docs/design/11-open-world.md`（区域 `rg_*`、兴趣点 `poi_*` 的规则与表；第 166 行 `rg_hexilongyou`、第 412 行 `city_dunhuang`）、`docs/design/19-world-map.md`（`poi_*` 登记表与节点坐标）；
- `docs/design/chapters/04-yitian.md`（峨眉、蜀地）、`chapters/10-baima.md`（河西、敦煌；`sc_10_fengshi_feiyi` 的写法见第 128、186 行）、`chapters/12-shujian.md`（敦煌县境）、`docs/design/20-legacy-inheritance.md`、`docs/design/25-*.md`（长生诀主线，若提到遗迹 / 地宫）；
- `tools/lint/check_ids.py` 第 44、130–131 行：`sc_` 归 `docs/design/chapters/*.md`，`poi_` 归 11-open-world / 19-world-map。

## 要做的事

1. **列清单**：按 ART-ruins-maps 第 1 条的 grep（`遗迹|地宫|洞|墓|地窖|密道`）扫 `docs/design/chapters/*.md`、`11-open-world.md`、`20-legacy-inheritance.md`，列出具名却没有 `sc_*` / `poi_*` ID 的遗迹 / 洞窟 / 地宫 / 墓 / 密道；再加作者点名的两处：
   - **九老洞**：峨眉山真实洞穴；默认归《倚天屠龙记》（ch04，峨眉派所在的蜀地区域），若 20 / 25 已把它设计成跨书探险点就按那个归属，并说明；
   - **敦煌地宫**：河西 `rg_hexilongyou`，依 `city_dunhuang`（石窟寺与商旅节点）；白马 ch10 是唐代、书剑 ch12 是清代——按 11-open-world 的年代规则写成一个 `sc` 带两套年代说明，或两个相位，二选一并说明理由。
2. **登记 ID**：每处在对应章节文档的场景 / 关卡表里登记 `sc_<章>_<slug>`（照 `sc_10_fengshi_feiyi` 的格式：名称、类型、尺寸档、房间数、入口条件、年代、所属区域、关联任务 / 奇遇），并在 11-open-world 与 19-world-map 的兴趣点表登记 `poi_<slug>`（节点坐标、所属 `rg_`、可达条件）。没有章节归属的跨书遗迹放 11-open-world 的通用遗迹表并说明。ID 命名照既有规则，不与现有 ID 撞名。
3. 不设计新任务线：入口条件只引用已有的 `q_*` / 相位 / 奇遇，没有就写「（待设计）」；原著没有的写「（原创扩展）」。
4. `python3 tools/lint/check_ids.py --strict` 通过（新 ID 必须落在 OWNERSHIP 允许的文件里）。

## 约束

- 只改：`docs/design/chapters/*.md`、`docs/design/11-open-world.md`、`docs/design/19-world-map.md`，以及报告。不改 `content/**`、`assets/**`、`tools/**`。
- 不改既有 ID、不改状态机与事件。

## 报告

`tools/agents/reports/DES-ruins-ids.md`，按 `_common.md` 的格式；§3 给「新增遗迹 ID 清单」表（ID、名称、章、区域、类型、尺寸档、入口条件），供 ART-ruins-maps 接力任务直接使用；§6 列仍需作者定的归属或年代问题；§7 逐条对照第 1–4 条。

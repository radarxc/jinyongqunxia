# 本任务：文档同步 · 白马年份、序章人物登记、任务 ID 例外、传功地点（协调者裁定，2026-10-02）

本任务只做文档之间的一致性同步，不改设计意图，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 协调者裁定（作者可以推翻；以此为准）
1. **白马年份以章节归属文档 `docs/design/chapters/10-baima.md` 为准，即 702–703 年**（武周长安年间）。
   - 以下几处写成 640–641 的，改为 702–703：`docs/00-canon.md` §2 书序表、`docs/design/02-timeline-and-world-tiers.md`、`docs/design/13-progression-and-endings.md`、`docs/design/25-changshengjue.md`。
   - 所有由年份推出的数值一起重算：
     - 初眠 `sleepYears`：约前 482 → 702，即 1184 年，原写 1122；
     - 白马 → 天龙：702 → 1093，即 391 年，原写 452；
     - 转场与成长曲线里用到这两段的地方。
   - 写出算式，不凭空改数。
   - canon 文首变更记录加一条（v1.9 之后续号）。
2. **阿青、白猿、范蠡在 `docs/design/18-npc-and-companions.md` 补条目**：
   - 照 design/18 的人物条目格式；
   - 序章设计（`chapters/00-yuenv.md`、`story/00-yuenv.md`）里给他们用的 ID 和身份要对上；
   - 白猿是动物，按 design/18 对非人角色的规定处理；
   - 阿青为 S 级，范蠡为 A 级（立绘提示词已按此出）。
3. **`q_00_main_*` 与 design/12 的任务 ID 正则冲突**：在 `docs/design/12-quests-npc-factions.md` 的 ID 规则里开一条例外：序章主线允许 `q_00_main_c_<nn>`，写明理由与范围。代码里的检查规则由工程任务处理，本任务不改代码。
4. **阿青传功地点**：作者原话是「越女剑序章后，阿青传授长生诀」，地点以序章文档为准，在越地（越营）。
   - `docs/design/catalog/key-scenes.md` 和 `assets/default/prompts/scenes/` 里把传功写在长白山洞的场景，改到越地；
   - 长白山洞只保留雪崩后的初眠场景。

## 约束
- 只写：
  - `docs/00-canon.md`
  - `docs/design/02-timeline-and-world-tiers.md`
  - `docs/design/13-progression-and-endings.md`
  - `docs/design/25-changshengjue.md`
  - `docs/design/18-npc-and-companions.md`
  - `docs/design/12-quests-npc-factions.md`
  - `docs/design/catalog/key-scenes.md`
  - `assets/default/prompts/scenes/**`
  - 本任务报告
- 其余文档里如果还有 640–641 或旧的 sleepYears，写进报告第 6 节。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 改了哪些地方：文件、节号、旧值 → 新值；
- 重算的算式。

报告 ≤ 50 行。

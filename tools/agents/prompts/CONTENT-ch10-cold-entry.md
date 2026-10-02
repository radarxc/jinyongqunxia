# 本任务：内容 · 白马（唐）ch10 冷入口（M1 到停点为止）：烽燧废驿场景、人物、第一段对话、题卡

本任务写内容数据（Tiled / YAML / Ink / 文本），**不写引擎代码**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `content/CLAUDE.md`、`content/README.md`；
- 设计：`docs/design/chapters/10-baima.md` §2.1–§2.2（冷入口与 M1 停点）、§2.5、§3.2；`docs/design/story/10-baima.md` §2.1、§2.4；
- 报告（写法约定必须照做）：
  - `ENG-18b-tiled-regionmap.md`：地图；
  - `ENG-25-content-schemas-m1.md`：道具与 Ink 动作；
  - `ENG-17a-newrun-dialogue.md`：说话人标签；
  - `ENG-17-booksleep-m1.md`：ch10 章节定义已由它写，本任务不写；
  - `ENG-18-content-build.md`：Ink 与文本。

## 为什么做

M1 终点是「书眠进入白马（唐）冷入口」（作者 AR-29）。苏醒后要有一个能走、能对话、能自动存档的场景，并在停点显示题卡。

## 范围（只到 M1 停点）

- **区域** `rg_xiyu_beijiang`。
- **场景** `content/world/regions/rg_xiyu_beijiang/sc_10_fengshi_feiyi.tmj`，48×32：
  - 西低东高；残墙围出 12×10 的安全院子；地形 `tr_shadi`、`tr_suishi`、`tr_shinei`；qg0；
  - 西边是西行过场的落点，即玩家出生点；东出口在第一段对话后打开；北边碎石路封闭；
  - 火盆：自动存档，并补一次基础生存；
  - 交互点：水囊、年号刻字、带黄线的旧鞍、墙上的唐军刻痕。后两样不给物品；旧鞍在 M1 **不得**触发 `q_10_main_c_01`；水囊做场景交互点，不新造物品 ID。
- **人物**：`npc_shenqinghe10`、`npc_liwenxiu`（成年视觉代理，带白马）、一名无名驿卒（一句台词）。立绘归出图线，不管。
- **Ink** `story_ch10_cold_entry`，knot 建议为 `westward_journey`、`fengshi_first_talk`、`title_card`：
  - 沈青禾、李文秀各一句；
  - 玩家三个选项（问年份、问旧城、帮捡药囊）全部汇合，不分支。
- **文本**（只写 ch10 的键）：
  - 年号刻字「长安二年（702）·西州以北」（白马年份按协调者裁定取 702–703）；
  - 旁白，chapters/10 §2.1；
  - 停点题卡「第一卷·白马啸西风」；
  - 45–60 秒可跳过的西行过场，用文字加静帧，没有视频 ID。
- **停点**：过场播放或跳过 → 场景载入 → 玩家移动 → 对话完成 → 东出口点亮 → 自动存档可读 → 题卡 → 自由操作。
- **不做**：场景 B、C01 任务、两个水贼的可选战斗、经济、门派、迷宫、大地图（`content/world/ch10/map.yaml` 的清初旧数据另有任务处理）。

约束：
- 写集：
  - `content/world/regions/rg_xiyu_beijiang/**`；
  - `content/chapters/ch10_baima/npcs/**`、`content/chapters/ch10_baima/events/**`；
  - `content/story/ch10/**`；
  - `content/locales/zh-Hans/ch10*`。
  - 写集外的改动在提交时会被丢弃。
- 不改 `packages/**`、`apps/**`、`docs/**`、`content/world/ch10/**`；schema 不够用就在报告里写明。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm content:validate`
- `pnpm content:build`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 场景对象与锚点表；
- 对话 knot；
- 文本键；
- 停点各步对应的内容；
- 与设计的出入；
- 交给 ENG-19b（题卡）、ENG-23b（离线闭包成员）的接口。

报告 ≤ 60 行。

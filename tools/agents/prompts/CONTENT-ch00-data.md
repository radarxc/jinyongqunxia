# 本任务：内容 · 序章 ch00（越女剑）数据与剧情：人物、角色槽、道具、武学与招式、任务、剧情 DAG、Ink 剧本、文本

本任务写内容数据（YAML / Ink / 文本），**不写引擎代码**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `content/CLAUDE.md`、`content/README.md`；
- 设计：`docs/design/chapters/00-yuenv.md`、`docs/design/story/00-yuenv.md`（DES-prologue-v2 合入后的 v1.1），`docs/design/25-changshengjue.md` §1；
- 报告（第 7 节的写法约定必须照做）：
  - `ENG-25-content-schemas-m1.md`：任务、招式、道具、Ink 动作怎么写；
  - `ENG-17a-newrun-dialogue.md`：说话人标签、序章模式回执；
  - `ENG-17-booksleep-m1.md`：章节定义已由它写，本任务不写；
  - `ENG-18-content-build.md`：Ink 与文本放哪、怎么编译；
  - `TOOL-items-catalog.md`：物品生成器。

## 为什么做

M1 要能完整走完序章（`docs/tech/09-roadmap.md` §3.1、§3.5「序章完整通关」）。引擎能力已由 ENG 任务补齐，本任务按设计把序章内容落成数据。

## 范围（M1）

- **人物**：`npc_aqing`、`npc_baiyuan`、`npc_fanli`。
  - design/18 的条目由协调者的文档同步任务补；已合入就照写，否则按 DES-prologue-ch00 报告 O02 的默认做灰盒，带显式 `mockRef`。
  - 角色槽（`tmpl_normal` 加梦境档位，chapters/00 §3.2）：`role_road_swordsman` ×2、`role_wu_swordsman` ×2、`role_yue_soldier` ×2。
- **道具**（chapters/00 §4）：
  - `prop_bamboo_staff`：章内绑定，离章销毁；
  - `it_jinchuangyao` ×2、`it_huoxuewan` ×1：已有；
  - `it_tao`、`it_aqing_qingcha`：用修好的物品生成器从名录生成，不手写。
- **武学与招式**：
  - `sk_yuenvjian` 教学版及 `mv_yuenvjian_*`：catalog/skills-general §2.1；
  - `sk_changshengjue`：`story_art`，九层预览加真实第一层；
  - 角色武学：skills-general 第 248–253 行。
  - 招式名以 catalog 为准。v1.1 §5.4 说不复用「竹影点锋 / 白猿回枝」，与 catalog 冲突，在报告里登记。
- **任务**：`q_00_main_c_01`–`04`，阶段、白猿分支键、`fx_*` 回执照 story/00 §5.2–§5.4。ID 例外已获批。
- **剧情 DAG**（story.v1）：文件 `content/story/ch00/00-yuenv-main.yaml`（照 ch01 的 `01-tianlong-main.yaml` 命名）；12 个节点、11 条边、`dc_00_01`（full / summary / skip）、结局标签 `first_sleep_to_baima`（story/00 §4.1）。
- **Ink `story_ch00_main`**：16 个 knot（story/00 §3.1），说话人与动作标签照 ENG-17a / ENG-25。
  - 传功在**越营**（协调者裁定）；
  - 跳过与摘要路径走到同一个出口。
- **文本**（`content/locales/zh-Hans/`，只写 ch00 的键）：剧情与任务标题、`dc_00_01` 三个选项及确认文案、7 张摘要卡、约 17 张教学卡（chapters/00 §6.1）、四个场景名、人物名、角色名、竹棒名。
- **不做**：
  - 章节定义 `chapter.yaml`（ENG-17）；
  - 地图（CONTENT-ch00b）；
  - 三场遭遇（CONTENT-ch00c）；
  - 立绘与场景图（出图线）。

## 约束

- 写集：
  - `content/chapters/ch00_yuenv/npcs/**`、`roles/**`、`props/**`、`quests/**`；
  - `content/story/ch00/**`；
  - `content/locales/zh-Hans/ch00*`、`content/locales/zh-Hans/common*`（只追加序章用到的通用键）；
  - `content/common/skills/**`、`content/common/moves/**`；
  - `content/items/**`（只经生成器）；
  - `tools/lint/check_ids.py`（只在它的任务 ID 正则拒掉 `q_00_main_c_*` 时加例外）。
  - 写集外的改动在提交时会被丢弃。
- 不改 `packages/**`、`apps/**`、`docs/**`。schema 不够用就在报告里写明缺什么，不要绕。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm content:validate`
- `python3 tools/lint/check_story_dag.py content/story/ch00/00-yuenv-main.yaml`
- `python3 tools/content/items_from_catalog.py --check`
- `pnpm content:build`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

如果 `pnpm content:compile-story` 已存在（ENG-18c），也要跑通。

## 报告

第 7 节写：
- 内容清单（ID → 文件）；
- Ink knot 与 DAG 节点对照；
- 文本键数量；
- 灰盒与 `mockRef` 清单；
- 与设计的出入及登记；
- 交给 CONTENT-ch00b / ch00c（锚点、出口、遭遇引用的 ID）、ENG-19b（文本键）的接口。

报告 ≤ 80 行。

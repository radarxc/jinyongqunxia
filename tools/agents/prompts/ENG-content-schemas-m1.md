# 本任务：游戏工程 · M1 内容所需的数据 schema（任务 quest.v1、招式 MoveDef、剧情功法与章内道具、Ink 动作白名单）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`、`content/CLAUDE.md`、`content/README.md`；
- 报告 `tools/agents/reports/ENG-18-content-build.md`（字段分类、`#ts:` 标签解码与白名单放在哪、registry 怎么登记新 kind）、`ENG-16a-battle-geometry.md` §7.2（`BattleMove` 的射程 / 投送 / 形状字段）。

## 为什么做

序章与白马冷入口的内容（CONTENT-ch00 / ch10）要落数据，但现有 schema 缺几类（内容调研，10-02）：
- **任务**：没有 `quest.v1` schema 与 registry kind；design/12 §11.1 的 ID 正则会拒掉序章的 `q_00_main_c_<nn>`。
- **招式**：没有 MoveDef（`mv_*`）：`martial-art.v1` 只有 `moveIds`，战斗用的 `BattleMove` 只能在代码里写死。
- **剧情功法与章内道具**：
  - `martial-art.v1` 的分类枚举没有 `story_art`，`sk_changshengjue` 放不进去（design/25 §1）；
  - 没有序章「临时教学投影」的学习来源；
  - `ItemIdSchema` 拒绝 `prop_*`，也没有「章内绑定、离章销毁」的标记（序章竹棒，DES-prologue-ch00 报告 O04）。
- **Ink 动作**：序章与冷入口要用一批 `#ts:` 动作，ENG-18 的白名单未必覆盖：开战、设旗标、推进任务、给 / 扣物品、开出口、教学标记、传功请求、打开配点、题卡、自动存档、说话人。

## 规格（照这些写，不自创）

- `docs/design/12-quests-npc-factions.md` §11.1：任务结构。ID 正则加对 `q_00_main_c_<nn>` 的显式例外（DES-prologue-ch00 报告 O01 默认值），报告登记交文档同步。
- `docs/design/05-martial-arts-system.md`：招式字段与学习来源；`docs/design/catalog/skills-general.md` §2.1（`sk_yuenvjian` 与 `mv_yuenvjian_*`）。
- `docs/design/09-combat-system.md` §13.3 `EncounterDef` 中引用招式的写法；§5.2–§5.4 射程与范围字段。
- `docs/design/25-changshengjue.md` §1：`story_art`，不占 3+3，序章九层预览离章失效。
- `docs/design/10-items-and-equipment.md` §2：物品分类与 ID 规则。
- `docs/tech/04-data-pipeline.md` §7：Ink 写作约定与 `#ts:` 标签；§4.5 字段分类。

## 要做的事

1. **`quest.v1`**：schema、registry kind、引用检查（剧情节点、旗标、奖励引用的 ID 必须存在），含 `q_00` 例外。
2. **MoveDef**：
   - `mv_*` schema 覆盖 `BattleMove` 需要的字段（威力、收招、内力消耗、部位、射程 / 投送 / 形状、经脉路线引用等）；
   - 武学引用招式要做存在性检查；
   - 提供纯函数把 MoveDef 编成 core 的 `BattleMove`。放 data：只做字段映射，不做规则结算。
3. **`story_art` 分类、教学投影学习来源、章内道具**：
   - `prop_*` ID 规则与 `chapterBound` 标记，离章时由 core 销毁，规则在 ENG-17；
   - 只改 schema 与校验。
4. **Ink 动作白名单**：在 ENG-18 的白名单位置补齐上述动作的 opcode 与参数 schema。重复参数、未知 opcode、自由 JSON 一律失败。执行由 core（ENG-17a）做，本任务只定义与校验。
5. **测试**：每个新 schema 的正反例；引用检查反例；MoveDef → BattleMove 映射；每个 opcode 一正一反；现有内容校验结果不变。

约束：
- 写集：`packages/data/src/**`（不含 ENG-18b 的 `schemas/region-map.ts`）、`packages/data/CLAUDE.md`、`content/CLAUDE.md`、`content/README.md`。写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`、`apps/game/**`、`content/` 下的数据文件（夹具放测试目录）、`docs/**`。
- data 不做规则结算；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/data test`
- `pnpm content:validate`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 新 schema 与字段表；
- 引用检查表；
- opcode 白名单表（opcode → 参数 → 由谁执行）；
- 文档同步登记：design/12 正则例外、tech/04 §7 opcode；
- 交给 ENG-17a（opcode 执行）、ENG-26（遭遇构建用到的 MoveDef 与模板）、CONTENT-ch00 / ch10（怎么写任务、招式、道具与 Ink 动作）的接口。

报告 ≤ 80 行。

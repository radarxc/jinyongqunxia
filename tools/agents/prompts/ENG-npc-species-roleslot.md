# 本任务：游戏工程 · 人物数据契约补两处：NPC 加物种（非人不进人类年龄管线），新增角色槽 RoleSlotDef（加载与校验）

本任务写数据 schema、校验与装载代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`；
- 设计：
  - `docs/design/18-npc-and-companions.md`：
    - 第 98 行一带：非人角色显式写 `identity.species`，不套人类年龄段；
    - 第 1030 行一带：`species?: Species`，省略即 human；
    - 第 1059 行一带：`ageBand: AgeBand|null`，species 不是 human 时为 null；
    - 第 1228–1258 行一带：角色槽不是 NPC ID，由下游实例化，不给原著无名者捏造姓名；
  - `docs/design/chapters/00-yuenv.md` §3「人物与角色槽」：序章 6 个角色槽、确定性 UUID 种子、梦境档位；
- 代码：`packages/data/src/schemas/character.ts`（NPC、模板、`AgeBandSchema`）、`content-registry.ts`、`content-index.ts`；
- 审核意见 `.agents/reviews/CONTENT-ch00a-data.r1.md` 第 3、4 条；工程报告 `ENG-25-content-schemas-m1.md`。

## 为什么做

CONTENT-ch00a 的内容口径审核 r1 FAIL，其中两条是数据契约缺口，内容任务的写集补不了：

1. **白猿是动物**：design/18 要求 `species=animal`、`ageBand=null`、不进人类年龄管线。但 `character.ts` 没有 species 字段，`ageBand` 是必填（appearance 第 36 行一带），只能写成 `mature` 冒充。
2. **序章 6 个角色槽**：design/chapters/00-yuenv.md 定义了匿名角色槽（模板、数量、梦境档位、确定性实例化）。但仓库没有 RoleSlotDef schema，ch00a 只能写在 README 里，引擎无从消费。

协调者裁定（10-03 14:31、14:34）：合并成本任务，排在 ENG-region-gates-data、ENG-event-executor 之后。

## 要做的事

1. **物种**（`character.ts`）：
   - NPC 加可选 `species`，省略即 `human`；取值以 design/18 的 `Species` 为准，没写全的先给 `human` / `animal` / `spirit` 等最小集合，并在报告登记；
   - `species` 不是 human 时，`ageBand` 必须为 `null`；是 human 时保持现有必填规则。用 refine 表达，错误码可读；
   - 「非人不进人类年龄管线」：找出现在消费 `ageBand` 的地方（目前看只有 schema 自身，若 core 或 app 有就一并处理），非人时跳过年龄推导，不给默认年龄段。
2. **角色槽**（新文件 `packages/data/src/schemas/role-slot.ts`）：
   - `schemaVersion: 'role-slot.v1'`；
   - `slotId`：命名规则以 design 为准，没有就提议一个前缀并在报告第 6 节登记，交 check_ids 同步；
   - `chapter`、`templateId`（必须是已登记的 characterTemplate）、`count`；
   - `dreamTier`：梦境档位，取值以 00-yuenv §3 为准；
   - `seed`：确定性种子策略，按 design/18 的确定性 UUID；
   - 可选 `displayRoleKey`：「掌柜槽 / 长老槽」这类文本键。
   - 内容位置：`content/chapters/<ch>/roles/*.yaml`。00-yuenv 若已约定别的位置，以它为准。
   - 在 `content-registry.ts` 登记 kind；`content-index.ts` 检查模板引用存在。
   - 编进对应章节包；提供按章节查询角色槽的接口，交遭遇构建（ENG-26）与实例化消费。本任务不做实例化本身：若现成的实例化代码能直接接上就接，否则在报告第 7 节写清交接接口。
3. **测试**：
   - species 正反例：动物带 ageBand 报错，人类缺 ageBand 报错；
   - 角色槽 schema 正反例、模板引用不存在报错；
   - 章节包包含角色槽叶片；
   - 现有内容（`content/**`）在新规则下仍然全绿。

## 与 CONTENT-ch00a 的衔接（10-03 14:50 补，协调者 14:47 同意）

CONTENT-ch00a 正在返修。按协调者的默认方案，在本任务合入前：
- 白猿用显式灰盒 `mockRef` 表达 `species=animal`、`ageBand=null`、不可招募；
- 6 个角色槽写成交接数据文件；
- schema 不认的，放在 content:validate 不扫描的 `_drafts/` 下。

若你开工时 ch00a 已合入，而它的角色槽、白猿数据和本任务的新 schema 对不上：
- 允许把这些文件**迁到新 schema**：
  - 只迁格式（字段名、结构、文件位置，包括从 `_drafts/` 移到正式位置）；
  - 不改内容取舍：模板、数量、梦境档位、白猿不可招募等一律照原样。
- 写集为此加两项：`content/chapters/ch00_yuenv/roles/**`、`content/chapters/ch00_yuenv/npcs/**`。只动角色槽和白猿相关文件，其他 NPC 不动。
- 迁了哪些文件、字段怎么对应、原值是什么，在报告第 7 节逐项列明。
- 遇到一对多、或要改语义的情况，就不迁，在报告第 7 节交 CONTENT-ch00a。

若 ch00a 还没合入：不动它的文件，只在报告第 7 节写清交接格式。

## 约束

- 写集：
  - `packages/data/src/schemas/character.ts`、`packages/data/src/schemas/role-slot.ts`、`packages/data/src/schemas/index.ts`
  - `packages/data/src/content-registry.ts`、`packages/data/src/content-index.ts`
  - `packages/data/src/build/**`（只做角色槽进章节包所需的最小改动）
  - `packages/data/src/**/*.test.ts`、`packages/data/src/**/__fixtures__/**`
  - `content/CLAUDE.md`（写角色槽文件位置约定）
  - `content/chapters/ch00_yuenv/roles/**`、`content/chapters/ch00_yuenv/npcs/**`（只按上节迁 ch00a 的角色槽与白猿格式）
  - 写集外的改动在提交时会被丢弃。
- 不改 `content/chapters/**` 正式内容（由 CONTENT-ch00a 写；唯一例外是上节的格式迁移）、`packages/core/**`（若年龄管线在 core 里，写进报告交后续）、`apps/**`、`docs/**`、`tools/perf/**`。
- ENG-region-gates-data 也改 `content-registry.ts` / `content-index.ts`，合入顺序在它之后时，按集成分支最新代码续写，不覆盖它的改动。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/data test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- species 取值与规则；
- 角色槽字段表与文件位置；
- 年龄管线的处理范围。

第 6 节写新增 ID 前缀与逻辑名。

第 7 节写交接：
- 交 CONTENT-ch00a：白猿、6 个角色槽怎么写；
- 交 ENG-26：怎么查询、消费角色槽。

报告 ≤ 50 行。

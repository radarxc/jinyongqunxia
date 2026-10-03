# 本任务：游戏工程 · 属性 v2（一）：内息 `bre` 全链、修炼永久属性 `trainingAttrs`、类别熟练度与真元账、内息容量 / 回复（AR-27 数据与成长层）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`packages/data/CLAUDE.md`；
- 设计报告 `tools/agents/reports/DES-attr-v2.md`：§3 数值、§4 默认值、§6 同步表、§7「工程交接清单」的 `ENG-ATTR-01`、`ENG-SKILL-01`；
- 工程报告（都在 `tools/agents/reports/`）第 7 节交给后续任务的接口：`ENG-17-booksleep-m1.md`（`innate.bre` 已加键、`sleepPoints`、`saveSchema` 版本与迁移链）、`ENG-25-content-schemas-m1.md`、`ENG-18c-content-from-docs.md`、`ENG-16c-battle-session.md`（状态树里的战斗槽）。

## 为什么做

作者 AR-27（`docs/decisions/author-requirements.md`）：先天属性八项（现有七项加内息 `bre`），沉睡时配点六项。DES-attr-v2（4e9daeb2）已把规格写进 design/03、05、08、21，并列出工程交接项。ENG-17 只给 `innate` 加了 `bre` 键、做了初眠配点，其余交接项还没人做。

本任务只做**数据与成长层**：属性 ID 全链、`trainingAttrs`、熟练度 / 真元账、内息容量与回复。战斗公式（硬功 / 外放两支攻击、内劲防御、唯一速度 `spd`、rules protocol 4）归 ENG-27b，本任务不碰 `packages/core/src/battle/**`。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- `packages/data/src/schemas/character.ts` 的 `innate` 原为七项枚举，ENG-17 合入后应已有 `bre`；其他列属性 ID 的地方（`reqs.attrs`、身份 / 天赋加成、物品 `permStat` 等）各写各的，未必有 `bre`；
- `SkillDef`（`packages/data/src/schemas/martial-art.ts`）没有 `trainingAttrs`；
- 没有 `masteryXp`、`trueEssence`；`mpMax` / `mpRegen` 不读内息。

## 规格（照这些写，不自创）

**数值来源**：只引用 design/03、05（以及其中引到的 04、21 条文；DES-attr-v2 4e9daeb2 已合入，经审核），不自创数值、不改阈值。作者原话：
- AR-26「沉睡中可以进行点数配置」；
- AR-27「轻功修炼升级本身可以提升身法」；
- AR-27「武功修炼可以对比例、根骨、定力、身法等进行增加（不同武功需要设定不同值，根据武功源流和小说介绍配置）」。

文档里的 `trainingAttrs`、配点与封顶是这几句的落地，照文档实现。文档与原话看似冲突时，不自行改数，在报告第 7 节登记。

- `docs/design/03-attributes.md`：
  - §1.2 计算顺序；§1.3.1 先天属性表（`bre` 的定义与分工）；
  - §2.4.1 沉睡六项配点：可配集合 `str/con/bre/wis/agi/wil`，`luk/cha` 不配点；永久值先钳 1–100，只有 `breakCap:true` 的来源可到 120，超出部分**拒绝**而不是吞点；
  - §2.9 / §2.9.1 全程预算（`trainingAttrs` 角色合计 ≤ 48、单项累计 ≤ 24）；
  - §5.2 内力：`breMpBp=clamp(10000+60×(bre−50),7000,14200)`，只在 `mpRoot` 之后乘一次，`wil` 不加容量；`mpRegen` 基线 `1+0.02×(bre−50)` 个百分点；示例 `mpRoot=1222,bre=80 → 1441`；
  - §7.0 与 §11.3（DES-sync-design-b b6fc912d 已同步，以它为准）：
    - 资源有三类：顿悟点 `epiphany`；类别熟练度 `masteryXp[MasteryCategory]`，12 个类别为 `fist/finger/leg/grapple/sword/blade/staff/spear/whip/exotic/hidden/movement`；按性质分账的真元 `trueEssenceByNature.{yang,yin,harmony}`。
    - 都是精确非负 int64，存档线格式照 §11.3。`trueEssence` 只是三账之和，只读。
    - 投放：顿悟跨类别 1:1；真元在第七层前只投同性质内功，第七层起可跨性质 1:1；单门每层由资源补入的经验不超过该层 `ExpToNext` 的 50%；《长生诀》不收。
    - 旧档迁移补偿式见 §7.0 第 1–4 条。
- `docs/design/05-martial-arts-system.md`：§2.1 `SkillDef` 字段表（`trainingAttrs`）、§2.4 学习门槛 `Reqs`（接纳 `bre`）、§2.9 TS 类型、§3.7 `trainingAttrs` 发放规则（真实层数首次到 3 / 6 / 9 重各结算一次；卸下、书界压制、散功都不倒扣；默认模板）、§16 校验 V10A。
- `docs/design/01-vision-and-core-loop.md`：身份加成 schema 的 `innate` 联合类型加 `bre`（以 DES-sync 任务合入后的文本为准）。
- DES-attr-v2 报告 §4 默认值：`trainingAttrs` 达到角色 48 上限后，溢出部分等量转为对应类别的熟练度，内功转真元。
- `docs/tech/05-gameplay-engine.md` §14.1–§14.2 读档与迁移顺序；`docs/tech/08-backend-and-online.md` §3.5 迁移链。
- 文档之间不一致时，以 design/03（AR-27 版）为准，在报告里登记。

## 要做的事

1. **属性 ID 全链（data）**：
   - 建一处属性 ID 常量与 Zod 枚举（八项先天、六项可配），凡列属性 ID 的 schema 都引用它，不再各写一份；
   - `reqs.attrs`、身份 / 天赋加成、物品 `permStat` 等接纳 `bre`；沉睡配点集合不含 `luk/cha`。
2. **`trainingAttrs`（data）**：`SkillDef.trainingAttrs?: { layer: 3|6|9; attrs: Partial<Record<可配六项, 1..4>> }[]`，按 V10A 校验：各层唯一、只含六项、每个里程碑 Σ ≤ 4、单门合计 ≤ 12、不与 `layerStats` 混算。非法内容让 `pnpm content:build` 失败，并报出武学 ID 与字段。
3. **状态与存档（core/state）**：
   - 按 design/03 §7.0 / §11.3 指定的位置加 `epiphany`、`masteryXp`（12 类别）、`trueEssenceByNature`（三性质），都是精确非负 int64；`trueEssence` 只读求和，不另存；
   - 加 `trainingAttrs` 发放账：每门已发放的里程碑、角色累计、单项累计，用于封顶与防重复；
   - `saveSchema` 升一版，挂纯函数迁移，按 §7.0 迁移式给旧档一次性补偿（缺使用次数时只计层数项）；迁移幂等。
4. **成长规则（core/progression）**：
   - 真实层数首次到 3 / 6 / 9 重时按 `trainingAttrs` 发放永久先天属性，受单门 12、角色 48、单项 24 与永久值上限封顶；超出部分按 DES-attr-v2 默认转熟练度 / 真元（真元记入该武学的性质账）；同一里程碑只发一次；卸下、压制、散功不倒扣；
   - 顿悟 / 真元的投入：做成一条命令或事务步骤（以 ENG-15 命令总线的写法为准，命令注册表只加一行）。规则：
     - 顿悟跨类别 1:1；
     - 真元按 §7.0 的第七层门控，层数读 ENG-17 已加的 `changshengLayer`；
     - 单门每层不超过 50%；
     - 《长生诀》`sk_changshengjue` 不收；
     - 任一不合法就原子拒绝。
   - `mpMax` / `mpRegen` 接入 `breMpBp` 与回复基线，只消费一次。
5. **夹具**：测试夹具放在包内（`packages/data` / `packages/core` 的测试目录），不改 `content/**` 下的名录或正式内容。名录的 `reqs.attrs` 重配归 DES-skills-reqs-v2-* 任务。
6. **测试**：
   - schema：V10A 每条规则各一条合法 / 非法向量；
   - 发放：3 / 6 / 9 首次发放、重复到达不重发、单门 / 角色 / 单项封顶与溢出转化；
   - `breMpBp`：`bre=1/50/80/100/120` 分别得 `7060/10000/11800/13000/14200`；另用一个越界输入测下限 7000；§5.2 示例 `1222 → 1441`；`mpRegen` 换成整数 bp（1 pp = 100 bp），core 不用浮点；
   - 迁移：§7.0 补偿式两例；n→n+1 迁移两次逐字节相同；
   - 投入：design/03 §7.0 / §11.3 的 V03-23、T03-28～29（含第七层 `{yang:3000,yin:2000}` 投入 5000 后账变 `{7000,5829,0}` 的算例、第六层跨性质原子拒绝）、50% 上限、《长生诀》拒收；
   - 拒绝路径状态无差异、版本不变；规范 hash 确定性；主线程宿主与 Worker 宿主结果一致。

## 约束

- 写集：
  - data：`packages/data/src/schemas/**`、`packages/data/src/content-index.ts`、`packages/data/src/content-registry.ts`、`packages/data/src/*.test.ts`、`packages/data/CLAUDE.md`；
  - core：`packages/core/src/progression/**`、`packages/core/src/state/**`、`packages/core/src/command/**`、`packages/core/src/api/**`、`packages/core/CLAUDE.md`；
  - 应用：`apps/game/src/storage/**`（只在迁移接线需要时）。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/battle/**`（ENG-27b）、`tools/balance/**`、`docs/**`、`content/**`、`packages/render/**`、`packages/ui/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 字段新旧对照、`saveSchema` 版本与迁移式；
- 校验码 / 拒绝码表；
- 交给 ENG-27b 的接口：八属性快照、`mpMax` 链、属性读取入口；
- 交给 ENG-28a 的接口：熟练度 / 真元的投入命令与查询、`trainingAttrs` 账；
- 交给界面任务（ENG-19 系列）的只读查询；
- 文档漂移清单。

报告 ≤ 80 行。

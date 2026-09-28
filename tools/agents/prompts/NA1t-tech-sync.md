# 本任务：经脉系统与绝招新规则的技术文档同步（审计第一段 · tech/01 / 04 / 05 / 08 / 09）

经脉系统（design/21 v2.1）与绝招新规则（M4）已在设计文档与 11 册武学图鉴落地。新规则包括：
- 各品绝招数：grade 1..12 = `0/0/0/0/0/1/1/1–2/2/2/2–3/3`。
- `MoveDef.ultimate` 是唯一真值。
- 解锁层：第一 / 第二 / 第三绝招依次在 7 / 9 / 10 重。
- 共享与限制：共享气势、本门共享冷却、禁止连用同一绝招。
- 路线：一记绝招一条路线。

Ntech 报告第 6 节（`tools/agents/reports/Ntech.md`）列出了技术文档的待同步项。本任务只改下列技术文档；规则文档由并行任务 NA1 处理，图鉴由 NA2 处理。

## 要做的事

1. **tech/04 数据管线**（`docs/tech/04-data-pipeline.md`）：
   - 构建校验增加以下检查：
     - 各品绝招数量配额；
     - V-M01（`route.ultimate == MoveDef.ultimate`）；
     - 一招一路（同一门武学的绝招不得共用路线 ID，也不得照抄穴位序列）；
     - 路线时长（`收招 + 满路线 CT ≤ 2000`）；
     - 同一路线穴位不重复。
   - 无主动招的轻功由构建器生成本门基础移动招，未生成则拒绝构建。
   - 首领配装的构建闸门（每个 Boss 1 主运 + 2 辅运 + 3–5 外功，禁止静默回退 `1/1/harmony`）先按 design/21 §11.9 现行写法引用；具体口径由并行任务 NB3 定稿，写成"以 21 §11.9 为准"。
   - 把 §2.5 与开放问题 O6 的 `provisionalPrefixOwner` 等"尚待 Canon v1.3 登记"的过时提法，改为引用基准 v1.3 对应条目（V13-xx）。
2. **tech/05 玩法引擎**（`docs/tech/05-gameplay-engine.md`）：
   - 战斗临时状态 `ultimateCooldown: 0|1` 与 `lastUltimateMoveId` 只在战斗中记录、不存档；写明回放确定性。
   - 降龙大成的 `cdMinus` 不减共享冷却。
3. **tech/01 架构**（`docs/tech/01-architecture.md`）：写明以下四点。
   - `meridianByUnit`：每单位一个经脉模拟实例；
   - 单一 battle 随机流由 Core 注入；
   - 预估零副作用；
   - 协议 2 的 hash 域。
4. **tech/08 后端与联机**（`docs/tech/08-backend-and-online.md`）：存档 / 录像版本表登记 `rulesProtocol=2` 与 `meridian-flow-state.v1`。
5. **tech/09 路线图**（`docs/tech/09-roadmap.md`）：写入以下三项。
   - TS runner；
   - 黄金数据对拍；
   - 三机七项性能预算门禁。
6. 各文档版本行 / 变更记录追加本条；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）。

检查：`python3 tools/lint/check_ids.py --strict` 与 `python3 -m unittest tools/lint/test_check_ids.py` 必须通过；每次写入不超过约 150 行。

## 报告

第 7 节写：处理总表（来源 / 条目 / 目标文档与节 / 状态），以及仍需其他文档配合的条目。

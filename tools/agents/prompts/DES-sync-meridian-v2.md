# 本任务：文档同步 · 经脉快照名与协议号按 design/21 统一（tech/01、05、08、09）

本任务改文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

- 作者 2026-10-01：经脉快照名以归属文档 `design/21` 的 `meridian-flow-state.v2` 为准；tech/08、tech/09 写的 v1 是旧文。
- ENG-14 报告 §6（`tools/agents/reports/ENG-14-meridian-golden.md`）列出的同步项：
  - `docs/tech/08-backend-and-online.md` 行 9、18、529、531、2012、2922、2942 的 `meridian-flow-state.v1`；
  - `docs/tech/09-roadmap.md` §3.3 行 316；
  - golden 协议标注：保留 `rngProtocol=1`，注明它只用 `nextU32() % 10000`、不依赖 `intInclusive`，所以不用重录。
- 协调者另外 grep 到：`docs/tech/01-architecture.md` 行 1468，`docs/tech/05-gameplay-engine.md` 行 32、1901、2160、2300 也写着 `meridian-flow-state.v1`。

## 规格（照这些写，不自创）

- `docs/design/21-meridian-flow-and-moves.md`：
  - 快照 schema（约行 1987）；
  - 版本说明（约行 2016）：v2.0 起 `fixtureVersion/rulesProtocol` 为 2；AR-19 迁移另升 `rulesProtocol=3` 与 `meridian-flow-state.v2`，旧 v1 runner 只读旧录像；
  - 对 tech/05 的待同步说明（约行 2650）。
- 实现现状：`packages/core/src/battle/meridian-flow/` 的快照 schema 与 golden 夹具。只读核对，不改代码。

## 要做的事

1. 逐处核对上面列出的行，按 design/21 改：
   - 当前协议的快照名写 `meridian-flow-state.v2`，协议号跟 design/21 一致；
   - 只在讲旧录像 / 旧 runner 兼容的地方保留 v1，并写明「仅旧录像」。
2. golden 的 `rngProtocol=1` 兼容说明，加在 tech/05 讲跨引擎 golden 的小节（§4.6）或 tech/08 的版本登记表里，一两句即可。
3. 只改快照名、协议号和这条说明相关的句子，其余文字一律不动。
   - `docs/tech/09-roadmap.md` 只改 §3.3 经脉那一行的快照名；素材行的「Blender 中转」、M1 终点等其他行**不动**（作者在评估）。

检查：
- `python3 tools/lint/check_ids.py --strict`
- `grep -n "meridian-flow-state" docs/tech/01-architecture.md docs/tech/05-gameplay-engine.md docs/tech/08-backend-and-online.md docs/tech/09-roadmap.md`：结果逐条写进报告。

## 报告

第 7 节写：
- 改动对照表：文件 / 行 / 原文 → 新文 / 依据小节；
- 保留 v1 的地方及理由；
- 需作者确认（附默认）；没有就写「无」。

报告 ≤ 40 行。

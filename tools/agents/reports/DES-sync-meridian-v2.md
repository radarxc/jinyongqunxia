# DES-sync-meridian-v2 报告 · 文档同步 · 经脉快照名与协议号按 design/21 统一（meridian-flow-state.v2；tech/01、05、08、09）
## 1. 摘要（3–6 行）
- 已按 `design/21` §12.3–§12.5 将现行经脉录像/检查点统一为 `rulesProtocol=3`、`meridian-flow-state.v2`。
- `tech/08` 现行 RNG 登记及 NDJSON 示例同步实现现状 `rngProtocol=2`；协议 2 / v1 只保留旧录像兼容。
- 旧 golden 保持 `fixtureVersion=2/rulesProtocol=2/rngProtocol=1`；兼容说明已按返修移至 `tech/05` §4.6，因只用 `nextU32() % 10000`、不依赖 `intInclusive`，无需重录。
- `tech/09` 严格只改 §3.3 经脉行的快照名，其他行未动。
## 2. 产出（文件、行数、主要章节）
- `tech/01` 1822 行：TL;DR、§3.2.1/§3.6、§8.3、术语/追溯；`tech/05` 2397 行：TL;DR、§0、§3.3、§4.6、§11.2、§14.3、术语/依赖。
- `tech/08` 3013 行：文首、§3.5.1、§10.2、术语/追溯；`tech/09` 1077 行：仅 §3.3；本报告 31 行。
## 3. 关键结论与数值
- 当前生产组合：`rulesProtocol=3` + `rngProtocol=2` + `meridian-flow-state.v2`；旧录像组合：协议 2 + v1，必须交匹配旧 runner。
- golden 身份 `2/2/1` 与 seed/hash 均未改；本任务无公式或玩法数值变更。
## 4. 开放问题（附默认值）
- 无；需作者确认：无。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；`design/21` 已给出当前协议和迁移边界。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/00-canon.md` §19“确定性”：当前仍写“协议 2 战斗摘要”，与现行 `rulesProtocol=3` 冲突；需协调者同步为协议 3（Canon 不在本任务修改范围）。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 改动对照 `tech/01:25,351,445,545,1468,1776,1801`：当前“协议 2 / v1”→“协议 3 / v2”；依据 `design/21` §12.5。
- ✅ 改动对照 `tech/05:32,34,92,484,495,1892-1903,2162,2302,2353,2382-2383`：当前 `BattleState.flow`、运行时端口及快照 v1→v2，协议 2→3；依据 `design/21` §12.3–§12.5。
- ✅ 改动对照 `tech/05:791,2174`：§4.6 增加旧 golden 的 `nextU32()%10000` / 不依赖 `intInclusive` / 无需重录说明；v1 改为“仅旧录像”；§15:2211 恢复原句；依据 ENG-14 §6。
- ✅ 改动对照 `tech/08:9,18,527-531,2001,2012,2922,2942,3007`：现行 `2/1/v1`→`3/2/v2`，旧 `2/v1` 限定旧录像；依据 §12.5 与实现。
- ✅ 改动对照 `tech/09:316`：仅 `meridian-flow-state.v1`→`.v2`；素材与 M1 其他文字未动。
- ✅ 最终 grep `tech/01`：1468(v2)；`tech/05`：32,1903,2162,2302,2353,2382(v2)，2174(v1 仅旧录像)。
- ✅ 最终 grep `tech/08`：9,18,529,531,2012,2922,2942(v2；531/2012 同行 v1 仅旧录像)；`tech/09`：316(v2)。
- ✅ 保留完整快照名 `.v1`：`tech/05:2174`、`tech/08:531,2012`；兼容摘要中的 v1 简称：`tech/05:2302,2382`、`tech/08:2922,2942`；均仅指旧录像/旧 runner。
- ✅ `python3 tools/lint/check_ids.py --strict`：130 文件、68,236 次出现、基线 undefined 1、新失败 0；`git diff --check` 通过。
- ✅ 范围：仅修改四份负责技术文档并新增本报告；返修已撤回 §14.3 额外字段及依赖表版本/摘要的越界改动；未改代码/golden/TODO，未执行改变仓库状态的 git 命令。
- ✅ 交下游 ENG-* 的字段清单：当前 `rulesProtocol=3 / rngProtocol=2 / meridian-flow-state.v2`；旧录像边界 `rulesProtocol=2 / meridian-flow-state.v1`；旧 golden 固定 `fixtureVersion=2 / rulesProtocol=2 / rngProtocol=1`，只使用 `nextU32()%10000`。
- ✅ 需作者确认：无。

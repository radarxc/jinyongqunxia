# 本任务：修正 ID 检查脚本的定义识别（F2 分组审计前置）

基准 v1.2（A3）在 §12 登记了大量新前缀、在 §18 登记了 `design/15`–`20` 与 `story/NN-*` 的唯一归属。此后 `python tools/lint/check_ids.py --json` 报出约 1,600 个"引用但未定义"的唯一 ID，但抽样表明绝大多数**不是真的缺定义**，而是脚本认不出定义：

- `docs/design/map/*.yaml` 里定义的 `city_*`（189）、`route_*`、`offmap_*`、`port_*`、`post_*`、`rg_*`、`sect_*` 等——脚本只扫 Markdown；
- 归属文档里以表格、YAML 代码块或小节标题定义的 ID：`design/15` 的 `ap_*`（180 穴）、`mer_*`、`zt_*`；`design/20` 的 `frag_*`、`lgs_*`、`cache_*`；`design/16` 的 `res_*`、`job_*`、`sv_*`；`design/02` 的 `vid_sleep_NN_MM`；`story/NN-*` 的 `dc_NN_nn`、`q_NN_main_*`；各书界 `chapters/NN-*` 的本界实例 `sc_NN_*`、`rp_*`、`biz_*`（按 `design/16` 的 schema，实例由书界文档定义）；
- 任务 / YAML 内的局部键（`tr_*`、`st_*`、`edge_*` 等）被当成全局 ID。

六个 F2 分组审计要在你之后，按一份**准确的**未定义清单去补定义；如果脚本继续误报，它们会白费功夫甚至造出重复定义。本任务只改 `tools/lint/`，不改任何文档。

## 要做的事

1. 读 `docs/00-canon.md` §12（前缀与定义规则）、§18（唯一归属），以及现有 `tools/lint/check_ids.py`、`tools/lint/test_check_ids.py`。运行 `python tools/lint/check_ids.py --json`，按前缀 × 文件统计未定义引用，抽查每类前缀在其归属文档中的实际写法。
2. **定义来源**：
   - 读取 `docs/design/map/*.yaml`（及仓库内其他明确作为数据源的 YAML，如有）中的 ID 定义；
   - 按 §18 归属，识别归属文档中的定义写法：表格首列（或明确的 ID 列）、YAML / JSON 代码块中的 `id:` 键或作为键名的 ID、定义性小节标题等。**只在归属文档中把这些写法算作定义**，其他文档中的同样写法仍算引用，避免把引用误当定义；
   - 书界本地实例（`sc_NN_*`，以及 `rp_*` / `biz_*` 的实例）以对应书界文档为归属；剧情的 `dc_NN_nn`、主线幕以对应 `story/NN-*` 为归属。
3. **局部作用域**：任务内局部键（`tr_*`、`st_*`、`edge_*`、`fx_*`、`chk_*` 等，以 §12 与 `design/12` 为准）只在其所在任务定义 / 代码块内解析，不报全局未定义；文档中明确标为示例的 ID（如 `ach_example`）按一条明确规则豁免。
4. **过渡基线**：`tech/04` 已把 `check_ids.py --strict` 设为 CI 首步门禁。增加基线机制：`tools/lint/check_ids_baseline.json` 记录当前已知的真问题，`--strict` 只对基线之外的新增问题失败；提供刷新命令（如 `--update-baseline`）。基线文件先用本任务结束时的结果生成；F2 汇总结束时会再刷新。
5. **测试**：为以上每条新规则在 `tools/lint/test_check_ids.py` 增加用例（YAML 定义、归属文档表格定义、非归属文档不算定义、局部键、示例豁免、基线过滤），`python -m unittest tools/lint/test_check_ids.py` 必须通过。
6. **不要为了降数字而放宽规则**：真正缺定义的（抽样看主要是 `npc_*`、`it_*`、`aoe_*`、`bsc_*`、`cmb_*`、部分 `q_*`）必须仍然报出来，留给分组审计登记。

## 报告

第 7 节写：修改前 / 后的计数（唯一未定义 ID 与引用数，按前缀列表对比，至少列前 30 个前缀）；每条新规则的说明与理由；修改后仍未定义的 ID 按"归属文档"分组的清单（供六个分组各取所需：设计 A / 设计 B / 武学与数值 / 剧情与书界 01–07 / 08–14 / 技术）；疑似仍是误报、但你没有把握放行的条目。

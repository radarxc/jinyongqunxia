# 协调者备忘（跨任务待处理问题）

> 由主会话（Claude 协调者）维护，汇总各任务报告中"需要其他任务跟进"的跨文档问题，供 C3 / CX* / A3 / F2 读取。条目解决后标 ✅ 并写明处理任务。

| # | 问题 | 来源 | 应由谁处理 |
|---|---|---|---|
| CN-01 | `catalog/skills-wujue.md` §0.2 招式预算沿用"Buff 成本 × 持续回合"旧口径，与 `design/05` §4.2 不一致，可能系统性低估该图鉴倍率；RCw 复算按其自身口径通过，未改口径 | C1e.R 报告 | CXw（扩充时统一口径并重算）、C3（核对）、F2 |
| CN-02 | `design/17` 药王门候选 `sk_qixinhaitang` 7 地下 vs `skills-qianlong` 定为 8 地中（满足 `bf_qixin` 来源 8–10） | C1e / C1e.R | F2（回写 17） |
| CN-03 | `design/17` 各派"代表武学 / 待收录"候选 ID 与图鉴实际存在漂移（C1a.R 列出：`sk_qiankun`→11、`sk_shenghuoling`→10 拳脚、`sk_emeijiufa`→`sk_emeijiuyang`、`sk_miejuejian`→6、`sk_liangyijian`→`sk_zhengliangyi` 9；C1c.R 列出 `sk_zixia`→`sk_zixiashengong`、`sk_daiyiruhe`→`sk_daizongruhe` 等） | C1a.R、C1c.R | F2（统一回写 17） |
| CN-04 | 资源 ID 前缀改为 `res_`（`rs_` 为 02 古迹专用），已写入 author-requirements AR-05 与 B7 提示词 | R02 | A3（登记基准 §12） |
| CN-05 | `design/05` §4.2 与 §13.2 对独孤九剑六式倍率（1.00 vs 1.10）自相矛盾 | C1c.R | R05 未处理 → C3（已写进 C3 提示词） |
| CN-06 | `dualWield` 应收敛为 `int[0,10]`（X0-P01）、左右互搏归杂学·心神、弓箭归暗器不可携带（X0-P02） | RCw、X0 | R05（05）、A3（基准） |
| CN-07 | 各图鉴 `mer_*`（专精经脉）均为预留 ID，待 `design/15` 定稿后按迁移表替换 | C1a–C1e 报告 | M1（定义）、F2（回写） |
| CN-08 | `tools/lint/check_ids.py` 完成前，各审校以只读脚本替代；L1 合入后 F2 需对全部图鉴复跑 | 各审校报告 | L1、F2 |
| CN-09 | R03 重算了合法 STD（普通装备 ≤ 地上 9）：Lv70 hp 40,409 / mp 28,887，MPREF(35) 4,697；但 `tools/balance/damage_sim.py` 仍用旧 STD（36/36 PASS 只证明旧脚本自洽）。需把玩家装备改 `min(grade,9)` 后重生 04 §9 节奏表与金标准 | R03 报告 | F2（或 A3 后的补充任务；需同时更新 04 文档表格） |
| CN-10 | 09 v2.0 新增 5 个 Buff（`bf_hunmi`/`bf_kangfen`/`bf_minjie`/`bf_zhuanzhu`/`bf_muguangruju`）与 `bf_mabi` 补 `str −3×G`；06 §8.11 `bf_pibei` 按 C11 改 20% 阈值；`bf_shangshi` 与 `bf_tsp_*` 正式收录 | R09.R、R03 报告 | R06（若已开跑未覆盖则 F2 补） |
| CN-11 | 08 §1.2 邻距 1 m 与 09 六角邻距 √3R ≈ 1.1547 m 的尺度冲突（09 D-08-1）未解决 | R09.R 报告 | F2（裁定后回写 08 或 09） |

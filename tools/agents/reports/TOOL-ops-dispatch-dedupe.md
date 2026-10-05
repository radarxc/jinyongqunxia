# TOOL-ops-dispatch-dedupe 报告 · 工具 · 小修：ops_dispatch 的 HOLD / ERROR / READY / 校验失败事件按「任务 + 状态 + 失败摘要」去重（键不含 HEAD 与 updated 时间戳），状态或摘要变了才再报；单测
## 1. 摘要（3–6 行）
- 状态事件改用稳定摘要键，并把当前活跃键持久化到 `state.json`；本轮修正 READY 最新失败尝试与 pending 原文刷新。
- 同状态同摘要静默；状态或摘要变化、离开后再回来才重报。
- 未改 `classify()`、执行层、安全边界或 stall / merge / prod_check 去重。
## 2. 产出（文件、行数、主要章节）
- `ops_dispatch.py` 801 行；`test_ops_dispatch.py` 661 行（新增 12 条去重边界测试）；本报告 15 行。
## 3. 关键结论与数值
- HOLD-* / ERROR 键=`任务+state+detail`；HOLD-VALIDATE=`任务+state+last_failure 尾 1600 字符`；READY=`任务+state+最新失败尝试的冲突集合或失败首行`；均不含 HEAD、`updated` 或配置。
## 4. 开放问题（附默认值）
- 无。
## 5. 对基准的修改提案（编号 / 提案 / 理由）：无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）：无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ HEAD/updated 不重报、摘要/状态变化重报、离开再回来重报、READY 冲突缩减/新失败原因、pending 原文刷新均有单测；指定 unittest 72 条、dry-run、strict ID 检查全部通过。

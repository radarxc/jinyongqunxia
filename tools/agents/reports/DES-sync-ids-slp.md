# DES-sync-ids-slp 报告 · 文档同步 · 休眠事件 ID 转正式注册（check_ids OWNERSHIP 接纳 slp_、sleep-events.md 28 个 ID 正式登记）
## 1. 摘要（3–6 行）
`slp_` 已纳入 ID 校验器唯一归属，且新增正归属 / 反归属单测。
`sleep-events.md` §1、28 个事件标题与 §7 已由建议 ID 转为正式登记，ID 字符串未改。
全套 260 项 lint 单测通过；严格检查新增失败为 0，仅保留基线 `sk_babuganchan` 提示。
## 2. 产出（文件、行数、主要章节）
`tools/lint/check_ids.py` 2547 行：`OWNERSHIP` 新增 1 项；`tools/lint/test_check_ids.py` 1622 行：新增 1 个归属用例；`docs/design/story/sleep-events.md` 369 行：同步 §1、各书事件标题、§7；本报告 28 行。
## 3. 关键结论与数值
`tools/lint/check_ids.py:102` 新增 `"slp_": ("docs/design/story/sleep-events.md",),`；正式 ID 共 14×2=28 个：
`slp_01_yanmenxiexin`、`slp_01_yiminghuanyiming`、`slp_02_huashanxiefeng`、`slp_02_taohuatingchao`
`slp_03_gumushouyue`、`slp_03_xiangyangxiexing`、`slp_04_guangmingxieqi`、`slp_04_haishoutingchao`
`slp_05_siguotingxian`、`slp_05_jianghuyuanqu`、`slp_06_shishiwuwenzi`、`slp_06_haishangwanggui`
`slp_07_huashanxiejian`、`slp_07_duzhousongbie`、`slp_08_tongchidaoyin`、`slp_08_yangzhoujiugu`
`slp_09_xuegubimen`、`slp_09_jupuxiexin`、`slp_10_kongkantingfeng`、`slp_10_baimayuansong`
`slp_11_songlinxiedao`、`slp_11_gudengshouyi`、`slp_12_xihuxieshu`、`slp_12_huijiangwangsha`
`slp_13_yaowangtingyu`、`slp_13_muqianhuandao`、`slp_14_yubifengjing`、`slp_14_baiyeshumian`
## 4. 开放问题（附默认值）
无新增；沿用原文 SE-O01–03 默认值。本任务不处理 story / chapters 挂接口。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无；Canon §12 已登记 `slp_<稳定书界编号>_<拼音>`。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
`tools/agents/reports/DES-sleep-events.md` §6 第 1 条与 §7 末条可标为已解决；各 `story/NN` / `chapters/NN` 接口仍由 DES-story-hooks-* 处理。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
✅ 仅改四个授权路径；每次补丁 ≤50 行；未执行改变仓库状态的 git 命令。
✅ 28 个唯一 `slp_*` 均正式登记，具体 ID 的“建议 ID”残留为 0，字符串集合未改变。
✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：260 项通过。
✅ `python3 tools/lint/check_ids.py --strict`：退出 0，新增严格失败 0；基线 `sk_babuganchan` 不计。
⚠️ 仍有既存近似名提示 `it_miji_longzhaoshou` / `it_miji_yingzhaoshou`，不属于严格失败或本任务范围。

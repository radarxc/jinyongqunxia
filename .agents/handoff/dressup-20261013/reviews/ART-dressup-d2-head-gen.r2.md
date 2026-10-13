VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 改动仅位于任务允许的 `npc_munianci/**`、点数台账、报告及协调者追加授权的 `cut_head.py`、`tests_head.py`；`git diff --check` 无异常，未发现已批准素材被修改。
- Tripo 操作与点数：通过 —— 台账完整记录两次 generate/rig，余额 `17,260 → 17,090`，共花 `170` 点；第二次生成符合协调者裁定，没有第三次提交。
- 源件与追溯：通过 —— 两次项目/op、参考图 SHA、减面来源、inspect、65 关节体检和首次失败历史均已登记；manifest 中 18 个文件的 SHA 与磁盘一致。
- 三体型 V4 数值门禁：通过 —— medium/tall/small 均为 `draft/pass`，三角分别为 `28,802 / 28,259 / 28,497`；G1、台阶、鼓包、ΔE、遮罩、73 帧穿插和顶带外露均在阈值内。
- 颈缝视觉验收：通过 —— 三张最终运行时总图中未再看到后颈红色薄片、亮白横带、黑缝或动作开裂；切口调平解决了 r1 指出的色阶问题。
- 自动检查：通过 —— 监督器 2026-10-10 07:11 的完整校验为通过；本轮严格只读，未重跑可能建立临时目录或缓存的测试命令。
- 脸部/耳区硬规则：不通过 —— [源封面](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/source/cover.png>) 双耳下方均有浅色矩形悬垂片；[medium 运行时总图](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/shots/sheet.tpl_f_medium.jpg>) 的正面和侧面还能看到耳垂下的环状/块状几何，small/tall 同样存在。不论它源于耳饰还是耳侧细发误重建，都违反 `tripo-web` §1.4“严禁耳饰、耳垂下彻底露空”的硬规则。原参考图耳侧仍留有两缕细发，也与任务所述净化输入不一致。
- QC 与报告准确性：不通过 —— [source.json:114](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/source/source.json:114>) 将耳前悬浮薄片记为 `none visible`，[source.json:118](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/assets/default/model3d/dressup/heads/npc_munianci/source/source.json:118>) 将耳下肉块记为 `none visible`；[报告:14](</Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-d2-head-gen/tools/agents/reports/ART-dressup-d2-head-gen.md:14>) 又称八项 QC 全部未见缺陷，与实际素材不符。

## 返修说明

1. 不得再调用 Tripo或花点。用现有第二版源件处理双耳下的悬垂块/片：保留完整耳廓和耳垂，只删除耳垂以下及耳前外悬的异常几何；三体型都必须处理。
2. 给 `cut_head.py` 增加可复现的耳区残片清理规则及合成回归测试，确保不会删除正常耳朵、鬓角或后脑头发；同时对真实穆念慈三体型断言残片已消失。
3. 重切 medium/tall/small，重新生成 fit/report/manifest、预览及运行时截图；现有 V4 阈值不得放宽。
4. 新截图须增加或保留能清楚看到双耳下缘的正面、左右侧面机位，并覆盖 bind/idle/walk/run。耳垂下必须露空，不得通过裁图、遮挡或换机位规避。
5. 修正 `source.json.qc` 和报告第 3、7 节，使 QC 结论与最终产物一致。若现有源网格无法安全去除而不损伤耳廓，应如实停止并交协调者更换参考图；不得自行第三次生成。

## 需作者确认

无。
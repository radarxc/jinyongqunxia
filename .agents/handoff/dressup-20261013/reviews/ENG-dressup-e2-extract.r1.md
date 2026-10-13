VERDICT: FAIL

## 逐项结论

- 写集：不通过 —— 两份 `_fixture_bodysuit` 产物仍有计时字段改动：[fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/assets/default/model3d/dressup/garments/_fixture_bodysuit/fit.json:854) 和 [refit_nonidentity/fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/assets/default/model3d/dressup/garments/_fixture_bodysuit/refit_nonidentity/fit.json:191)。二者不在允许写集内，也直接违背任务中“提交前还原”的要求。
- `eq_jinzhuang` 抽壳拓扑：不通过 —— [extract.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/assets/default/model3d/dressup/garments/eq_jinzhuang/extract_run/extract.json:332) 报语义开口 4，但同一产物的实际闭合边界环为 11（[rawLoopCount](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/assets/default/model3d/dressup/garments/eq_jinzhuang/extract_run/extract.json:376)）。其中还有周长 0.2608、0.1908、0.0733 mu 的明显额外孔洞，不能当作微小退化环忽略。
- 开口统计实现：不通过 —— [extract_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/tools/model3d/dressup/extract_garment.py:431) 从真实环中强制挑选领口、双袖口和下摆；[boundary_loops](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/tools/model3d/dressup/extract_garment.py:528) 随后把 `count` 设为所挑语义环数。这会让任何拥有至少四个有效环的破损网格表面上通过“开口环 = 4”检查。
- 分割覆盖与禁区：通过 —— 1 个焊接连通块；torsoUpper/lower 为 0.9033/0.9899，双上臂为 1.0，双前臂为 0.9027/0.9264；头、颈、手、脚、小腿覆盖均为 0。矩形缺口已不再出现在前后质检图中。
- 对齐：通过 —— det=+1，躯干 RMS 为 1.91645%H，腕和脚分别单列；符合本任务采用的 RMS ≤ 2%H 口径。
- UV 颜色质检图：不通过 —— [extract_color_check_front.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/assets/default/model3d/dressup/garments/eq_jinzhuang/extract_run/extract_color_check_front.png) 显示的是后脑和后衣襟，而不是与 E1 正面封面一致的正视图，不能完成协调者要求的正面采样核对。`top-left/v-down` 的代码和合成断言本身正确。
- 毛边质检：部分通过 —— `extract_edges_detail.png` 提供了前后对比，切边比清理前平顺；但真实边界仍有 11 环，因此尚不能认定领口、袖口和下摆清理完成。
- `fit_garment.py --align`：通过 —— `auto` 保持旧分支，`joints` 要求源 skin，`none` 跳过空间对齐并转移模板权重，新增用例覆盖 `none` 分支；未见包围盒对齐、骨缩放配对或其他 §11 禁区做法。
- A/B 权重比较：通过 —— 报告给出了相同口径的 highConfidence、bind、三动作穿透、翻面及边长数据；A 的三动作穿透低于 B，选择 A，并写入正式 `fit.json.notes`。
- 三体型实验入库：通过 —— medium/small/tall 文件齐全，manifest 按最新裁定使用 `status: draft`、`experimental: true`、`gateLevel: fail`；三份 `hideRegions` 均为空并保留 `hideRegionsComputed`。三份 report 如实为 fail，符合 06:35 的实验件例外。
- GLB 契约与预算：通过 —— 三套正式件均为单 mesh/单 skin、mesh 节点无 TRS、unlit、double-sided、仅 baseColor；`_REGION` 为 u8 SCALAR，IBM 检查为 0，均为 25,600 三角、贴图 2048²。
- 自测与门禁命令：通过 —— 监督日志记录 `tests_extract.py` 3/3、`tests_garment.py` 18/18、`selftest.py` 7 项、冻结安装及 `pnpm check` 184 files/1,313 tests 全部通过，最终自动校验退出码为 0；这些结果不能覆盖上述产物语义和写集问题。
- 任务报告：不通过 —— [报告第 24 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/tools/agents/reports/ENG-dressup-e2-extract.md:24) 写抽壳 13.7s/约1.03GiB，但提交的 `extract.json` 是 14.8015665s/937.03125MiB；[第 50 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-e2-extract/tools/agents/reports/ENG-dressup-e2-extract.md:50) 又称 fixture 已恢复、无越界修改，与当前工作区相反。报告虽为 51 行且七节齐全，但真实性不合格。
- 已有源件：通过 —— `source/` 相对基点逐字节未改，未发现已批准素材被覆盖。

## 返修说明

1. 将两份 `_fixture_bodysuit` 的 `fit.json` 恢复到基点 `8166c501…` 内容，确保最终 `git diff` 只出现允许写集。
2. 修补衣壳真实拓扑中的额外孔洞，尤其是 76、54、33 顶点的大环；最终必须满足 `rawLoopCount == 4`、`openChains == 0`，且四环确为领口、左右袖口和下摆。不能只筛选四个环或改统计字段。
3. 将统计契约拆清：原始真实环数作为门禁 `count`；语义命名另存 `semanticOpenings`。在 `tests_extract.py` 同时断言真实环数为 4，并增加“存在第五个真实孔洞时必须失败”的回归测试。
4. 修正 `extract_color_check_front.png` 的相机深度排序/朝向，确保它确实是正面，并能与 E1 `cover.png` 对照看到交领、腰带结和前垂带。
5. 拓扑修复后重新生成双 raw GLB、四张 QC 图、A/B 比较、三体型正式 GLB/fit/report 和 manifest；继续保留最新裁定的实验件状态与 `hideRegions: []`，不要放宽 validate 阈值。
6. 用最终产物中的实际数值同步报告，特别是抽壳耗时、峰值内存、真实开口数及写集状态；完成全部测试后再次恢复 fixture 计时字段。

## 需作者确认

无。
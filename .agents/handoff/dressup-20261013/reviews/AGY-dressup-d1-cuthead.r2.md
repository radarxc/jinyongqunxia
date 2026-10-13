VERDICT: FAIL
## 逐项结论
- cut_head.py / report.json: 不通过 —— 任务明确要求“用模板 idle / walk / run 各 24 帧 LBS（与 validate 同法）量……与头部顶点穿入身体比例；写进 report.json”，但代码及 `report.json` 中仅计算并写入了接缝的最大位差（`maxDiffMu` 和 `maxDiffMm`），完全遗漏了“头部顶点穿入身体比例”的计算。
- preview.png / cut_head.py: 不通过 —— 质检图 `preview.png` 中，黄蓉一半的面部被模板的灰色光头遮挡（由于 z-fighting），导致协调者无法看清脸，不符合“协调者要能看清脸”的要求。在调用 `render_textured_qc` 时应当隐藏模板的头部顶点，或者在渲染逻辑内部剔除模板的头部多边形。

## 返修说明
1. 任务要求“头部穿入身体比例都要真实计算并写入 fit.json / report.json”，请在现有的 72 帧循环检测逻辑中，补充计算“头部网格顶点穿透进入身体网格内部的比例”并将其写入 `report.json`（例如增加 `seam.penetrationRatio` 字段）。
2. 在渲染 `preview.png` 的 `render_textured_qc` 函数中（或传入给它的数据中），剔除或隐藏 `tpl_mesh` 的头部顶点（例如过滤掉 `mixamorig:Head` 权重大于一定阈值的面），避免其与切出的新头部发生 z-fighting 而导致人脸被灰色遮挡，确保质检图能清晰呈现人物脸部。

## 需作者确认
无
补充说明：你在本地执行的 `pnpm check`（或其中的 `pnpm test`）中有测试用例因超时失败（`apps/game/build/dressup-assets.test.ts` 和 `apps/game/build/content-plugin.test.ts`），这同样违反了门禁必须全部通过的要求（在沙箱执行耗时脚本时可能需要排查是否由于资源竞争或本地运行环境问题导致超时，或需确认该修改是否引入了性能退化）。请在下次提交前务必亲自运行门禁并确保所有测试全部通过（退出码为 0）。

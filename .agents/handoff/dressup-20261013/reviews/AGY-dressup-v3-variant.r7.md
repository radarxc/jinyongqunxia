VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 相对基点仅修改或新增任务允许的路径；`git diff --check` 通过，未发现写集外文件或门禁阈值改动。
- 变体衣图与三视图 manifest：通过 —— 使用指定图像工具产物及对齐参数；灰褐粗麻、交领、腰带、人物姿势与轮廓符合要求，无文字或水印。`check_plate.py` 七项通过，衣服区 IoU（25/40/60）为 `0.956281 / 0.922671 / 0.783253`。
- 网格贴图质量：通过 —— `variantFillRatio=1.0`、亮纹异常占比 `0.0`、投影覆盖率 `0.101177`；各 UV 岛均有颜色，未见此前的大块黑色或白色划痕。
- GLB 不变量：通过 —— 三模板的几何、UV、skin、joints、inverseBindMatrices 与对应版型件一致；`_REGION` 为 u8 SCALAR，材质为 `KHR_materials_unlit` 且只引用 baseColor。
- 网格及身体贴图层预览：通过 —— 网格前后视图使用正确 baseColor，能辨认灰褐粗麻短褐；身体层覆盖率及透明像素规则符合记录。胸口肤色块属于版型件继承缺陷，已按协调者裁定仅记录、不作为本任务失败项。
- 入库元数据与报告：通过 —— `status: draft`、`experimental: true`、`base: eq_jinzhuang`、`item: eq_buyi` 均已记录；三个验证报告如实保留 `gateLevel: fail`；任务报告七节齐全且未超过 50 行。
- 自动测试与总门禁：通过 —— 监督日志证明 `tests_variant.py` 4/4、`selftest.py` 7/7、`check_plate.py` 7/7，最终 `pnpm check` 为 186 个文件、1322 项测试全部通过。
- 生产门禁执行：不通过 —— [retexture_variant.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/model3d/dressup/retexture_variant.py:414) 的 `--iou-only` 只输出数值，无论 IoU 是否达到 `0.95` 都返回成功；用两张相同裸模底板复现得到 `iou_25=0.0`，进程仍为退出码 0。完整生成流程同样只统计 `variantFillRatio`，未在 `<0.995` 时失败。当前产物数值虽合格，但工具没有落实任务明确规定的两个量产门禁，且现有测试未覆盖这一行为。

## 返修说明

- 在 `retexture_variant.py` 中把衣服区 IoU 和有效纹素填充率落实为可执行门禁：
  - `--iou-only` 在 `iou_25 < 0.95` 时打印明确错误并以非零退出码结束；
  - 完整生成流程同样拒绝 `iou_25 < 0.95`；
  - `variantFillRatio < 0.995` 时以非零退出码结束，不得把该次运行报告为成功。
- 在 `tests_variant.py` 增加 CLI 级失败用例：已知 IoU 为 0 的输入必须失败；构造填充率低于 99.5% 的情况并断言完整流程失败。保留现有正面投影、背面 LUT、GLB 字节不变量及错误输入测试。
- 返修后重新运行任务列出的五组检查；无需处理协调者已明确豁免的胸口肤色块。

## 需作者确认

无
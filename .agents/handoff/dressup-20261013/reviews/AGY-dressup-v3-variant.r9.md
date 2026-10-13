VERDICT: FAIL

## 逐项结论

- 写集：通过 —— `git status` 与基点差异仅包含任务声明允许的衣图、两个资产目录、两个 Python 文件、manifest 和报告；未发现遗留辅助脚本或日志。
- 变体衣图：通过 —— 灰褐粗麻、交领、袖长、衣摆、系带和人物轮廓符合参考；只读实跑 `check_plate.py` 七项全过。按规定算法独立复算 IoU 25/40/60 为 `0.956281/0.922671/0.783253`，25 阈值满足 ≥0.95；[manifest.yaml](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/assets/default/character/female/ch00/threeview/manifest.yaml:208) 已登记提示词、参考、归一化、门禁数字和 candidate 状态。
- 网格贴图与质检图：通过 —— UV 岛均有颜色，无大片黑区、蓝紫错贴图、白色划痕或明显浅色轮廓；前后预览能辨认灰褐粗麻短褐。胸口肤色块和领缘缺口属于协调者明确豁免的 E2 版型遗留。
- GLB 不变性：通过 —— 独立逐模板比较确认 accessor JSON、所有 accessor 字节、全部非图片 bufferView、skin joints 均与 `eq_jinzhuang` 相同；三份 GLB 只有 baseColor 图片和相应布局元数据变化。
- 投影、LUT 与填充门：通过 —— 正面投影限定衣服区、z-buffer 和 `|n·z|≥0.35`，其余走 Lab LUT；fit 登记投影率 `10.117653%`、填充率 `1.0`、亮纹率 `0`。圆柱测试覆盖正面变体色、背面 LUT 色、已知 IoU、GLB 非图片字节不变及低填充拒绝。
- 变体皮肤色统计：不通过 —— [retexture_variant.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/model3d/dressup/retexture_variant.py:214) 在生成最终贴图前对 `base_tex_arr` 统计皮肤色，因此 [fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/assets/default/model3d/dressup/garments/eq_buyi/fit.json:452) 和[报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/agents/reports/AGY-dressup-v3-variant.md:15) 的 `1.400108%` 是版型原贴图指标，不是协调者要求的最终变体贴图指标。对最终 `baseColor.png` 用同一 Lab 条件复算为 `0.119943%`。
- CLI 契约：不通过 —— [fail_gate](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/model3d/dressup/retexture_variant.py:73) 对门禁失败抛出退出码 2，而 spec 规定门禁失败为 3；缺少衣图时又因 [main](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/model3d/dressup/retexture_variant.py:400) 没有统一异常处理，裸 traceback 并退出 1，而输入错误应退出 2。现有测试只断言“非零”，没有锁定正确退出码和结构化错误。
- 身体贴图层：通过 —— 使用变体网格件、体表法线射线、最外侧交点、距离合格 nearest fallback、轮廓羽化和岛外 gutter；禁区覆盖为 0。预览仍有版型胸口碎块，但属于上述协调者豁免项。
- 三模板入库与 validate：通过（按本任务限定）—— manifest 为 `draft`、`experimental: true`、`base: eq_jinzhuang`、`item: eq_buyi`；三个 report 的失败项与版型件逐项一致，未新增几何退化，且报告如实披露。
- 检查证据：部分通过 —— 本轮只读复跑 `check_plate.py` 通过；报告记录 `tests_variant.py 6/6`、`selftest.py 7/7`、`pnpm check 1322/1322`。但现有测试没有发现上述退出码和统计对象错误。

## 返修说明

1. 在最终 `out_tex` 完成投影、亮纹清理与回填后，再对 `covered` 纹素计算 `variantSkinRatio`；重生成三个 fit，并把报告数字改为最终变体贴图的真实值。不要改协调者的“只报不判”口径。
2. 将门禁失败改为退出码 3；参数、缺文件、尺寸错误等输入问题统一捕获并退出 2。`--json` 模式输出单个 JSON 结果，诊断写 stderr，不得出现 traceback。
3. 加强 `tests_variant.py`：明确断言 IoU/填充门返回 3，缺文件或坏尺寸返回 2，并用已知最终纹理断言皮肤色统计来自变体输出而非版型输入。
4. 重跑 `tests_variant.py`、`check_plate.py`、`selftest.py` 和 `pnpm check`，再更新报告中的测试数与最终指标。

## 需作者确认

无。
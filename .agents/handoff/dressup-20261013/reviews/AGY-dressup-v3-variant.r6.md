VERDICT: FAIL

## 逐项结论

- 写集与仓库状态：通过 —— 当前改动全部位于允许路径，未发现写集外辅助脚本、日志或测试放宽；`git diff --check` 通过。
- 变体衣图与 threeview manifest：通过 —— 使用指定 agy 对齐稿，SHA-256 一致；灰褐粗麻、轮廓及姿势符合要求，无文字、水印或现代元素。`check_plate` 7/7；衣服区 IoU 25/40/60 为 `0.956281/0.922671/0.783253`。
- `retexture_variant.py` 核心算法：通过 —— 已实现动态投影标定、正交 z-buffer、衣服区与 `|n·z| ≥ 0.35` 限制、9³ Lab LUT、掠射羽化、亮纹治理和 UV 岛填充。
- `tests_variant.py`：通过 —— 闭合 UV 圆柱覆盖正面投影与遮挡背面 LUT；另覆盖已知 IoU、错误输入、JPEG/MIME、accessor/IBM/非图片字节不变。监督日志实跑 4/4。
- 三模板 GLB：通过 —— accessors、非图片 bufferView、skin、mesh、node 均与 `eq_jinzhuang` 相同；材质为双面 `KHR_materials_unlit` 且只引用 baseColor。三份哈希和大小与 manifest 一致。
- 网格贴图：通过 —— `variantFillRatio=1.0`、亮纹比例 `0`、皮肤色纹素比例 `0.0140011`；没有大片黑岛或白色划痕。胸口版型遗留按协调者 18:40 裁定只报不判。
- 身体贴图层：通过 —— RGBA 契约正确，alpha=0 时 RGB 全零；torso、双上臂、双前臂覆盖及禁区满足 E3 门禁，manifest 哈希一致。胸口与衣摆遗留纹素按既有 E2 缺陷处理。
- 网格质检渲染：不通过 —— [retexture_variant.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/model3d/dressup/retexture_variant.py:582) 对 UV 使用 `% 1.0`，而协调者明确要求与 `bake_texture_layer.py` 相同的采样约定；E3 是将原始 UV 交给 `bilinear_sample` 后裁剪。当前实现会把边界 UV `1.0` 错采到 `0.0`，可能制造接缝。
- 报告：不通过 —— [AGY-dressup-v3-variant.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/tools/agents/reports/AGY-dressup-v3-variant.md:8) 声称 `eq_buyi_tex/**` 有 9 个文件，实际为 10 个，遗漏了 manifest 的计数；不满足“报告必须如实”。其余数字和 7 节结构均正确。
- 门禁证据：通过 —— 最后一次监督日志记录 `tests_variant` 4/4、`check_plate` 7/7、`selftest` 7/7、冻结安装与 `pnpm check` 186/186 文件、1322/1322 测试通过。三模板 validate 的既有版型失败也已如实标为 `draft/experimental`。

## 返修说明

1. 将 `render_orthographic_layered` 的 `uvs = ... % 1.0` 改为与 `bake_texture_layer.py` 完全相同的原始 UV + `bilinear_sample` 裁剪约定，重新生成 `preview_mesh_front.png` 和 `preview_mesh_back.png`。
2. 把报告第 8 行的 `eq_buyi_tex/** 9 文件`改为实际的 `10 文件`。
3. 重跑 `tests_variant.py`、`selftest.py`、`check_plate.py` 和 `pnpm check`，确认产物哈希及 manifest 仍一致。

## 需作者确认

无。
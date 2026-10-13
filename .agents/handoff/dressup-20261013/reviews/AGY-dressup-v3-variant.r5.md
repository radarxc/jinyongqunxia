VERDICT: FAIL

## 逐项结论
- 写集与仓库状态：通过 —— 改动均在声明的 WRITES 范围内，未发现此前的辅助脚本、日志或测试放宽；`git diff --check` 通过。
- `por_npc_zhujue__ch00_f_dressup_eq_buyi_front.png`：通过 —— 与协调者指定的 agy 对齐稿 SHA-256 完全一致；目视为灰褐粗麻短褐，无文字、水印或现代元素。实测 `check_plate.py` 7/7，通过；衣服区 IoU 25/40/60 为 `0.956281/0.922671/0.783253`，25 阈值满足门禁。manifest 的 prompt、references、归一参数和数字完整。
- `retexture_variant.py` / 正面投影：不通过 —— `project_front_pixels` 在第 124–140 行仅用 `abs(nz) >= 0.35` 和二维衣服掩码判断投影，没有实现任务要求的 z-buffer 正面可见性；背向或被遮挡表面只要投到衣服区，同样会取正面衣图。第 106、121–122 行还写死人物高、脚底和中线常数，没有从输入底板及模板计算映射。
- `retexture_variant.py` / 背侧颜色映射：不通过 —— 第 55–75 行实现的是全局 RGB 二次多项式，不是任务要求的 Lab 3D LUT 或分段仿射；报告和测试却称其为 LUT。
- `tests_variant.py`：不通过 —— 第 39–57 行构造的是两个横向错开的平面四边形，不是“带 UV 的圆柱衣”；第 96–100 行又刻意让后片落在衣服掩码之外，因此没有验证同一屏幕像素下 z-buffer 应选择前片、后片走 LUT 的核心契约。现有 4/4 不能覆盖生产实现的缺陷。
- 三模板 GLB 几何契约：部分通过 —— 实际逐份比较确认 8 个 accessor、skin joints、inverseBindMatrices 和非图片 bufferView 均与 `eq_jinzhuang` 逐字节相同；`_REGION`、unlit、doubleSided、仅 baseColor 也通过 validate。
- 三模板 GLB 图片编码：不通过 —— `baseColor.png` 被原样嵌入，三份 GLB 的图片数据均以 PNG 文件头 `89 50 4e 47` 开始，但 JSON 仍声明 `mimeType: image/jpeg`。原因是 `replace_image_glb` 第 206–214 行替换字节却不更新编码声明；同时违反 `docs/tech/11` §5.5 的 JPEG q85 契约。
- 网格贴图与预览：通过 —— `variantFillRatio=1.0`、亮纹比例 `0`、皮肤色比例 `0.0140011` 已写入三份 fit；baseColor 岛没有大片黑色或成串白线。前后网格预览为正常肤色身体上的灰褐粗麻短褐；胸口遗留肤色按协调者最终裁定只报不判。
- `eq_buyi_tex` 身体贴图层：不通过 —— `bake_variant_vertices` 第 247 行已经算出射线与合格 nearest fallback 的并集，但第 253 行只把 `ray.hit` 记作衣服，丢弃全部 fallback，偏离 E3 流程。产物 `layer.json:130` 的 `torsoUpper=0.872509`，低于 E3 第 4 版的 `≥0.9` 门禁；总命中率仅 `0.790506`，预览胸腋区域也有明显缺覆。
- manifest、fit、report：部分通过 —— 哈希、大小、`base: eq_jinzhuang`、`draft/experimental` 和三模板失败门如实记录；但报告第 27 行宣称身体层复用了 E3 完整流程，与上述 fallback 丢弃和覆盖门失败不符，也未披露 GLB MIME/编码不一致。

## 返修说明
1. 为正面投影实现真实 z-buffer：同一屏幕像素只允许最前面的版型表面使用衣图，并同时满足 `|n·z| ≥ 0.35` 和衣服区掩码；其余纹素全部走颜色映射。人物高、脚底和中线应从输入底板与模板几何计算，不能写死。
2. 按要求改成同位衣服像素训练的 Lab 3D LUT 或分段仿射，并重新报告拟合误差。
3. GLB 应定位材质实际引用的 baseColor image，嵌入 JPEG q85 并保持 `image/jpeg` 与字节一致；增加 PNG/JPEG 文件头和 MIME 一致性测试。
4. 身体层按 E3 第 4 版语义处理合格 nearest fallback，使 `torsoUpper/torsoLower ≥ 0.9`、上臂和前臂 ≥ 0.8、禁区为 0；重生成 layer、JSON、全部质检图和哈希。
5. 测试改用闭合圆柱或等价前后重叠壳体，真实断言前面取变体色、被遮挡背面取映射色；保留 accessor/IBM/非图片字节、已知 IoU 和错误输入测试。
6. 重跑三模板生成、validate 和规定的全部检查，并把报告中的流程说明及实际门禁数字改为与产物一致。

## 需作者确认
无。
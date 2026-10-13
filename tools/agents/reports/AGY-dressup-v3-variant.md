# AGY-dressup-v3-variant 报告 · 3D 纸娃娃换装 · V3 · 贴图变体：粗布短褐（同版型改图 + 烘焙，0 点；agy；AR-108 V3）
## 1. 摘要（3–6 行）
完成 `eq_buyi` 衣图、三模板同版型网格变体、身体贴图层与质检图，Tripo 消耗 0 点。
第 20 次续作把皮肤色统计移到最终贴图，并锁定输入错误码 2、门禁错误码 3 与单 JSON 输出；已通过图像不重出。
网格有效纹素填充率 100%，三模板全部 accessor 字节与 `eq_jinzhuang` 相同；资产维持 `draft/experimental`。
## 2. 产出（文件、行数、主要章节）
- `retexture_variant.py` 690 行；动态标定/z-buffer/Lab LUT、GLB 只换 JPEG、E3 射线烘焙、预览与结构化 CLI；`tests_variant.py` 297 行、6 测试。
- `eq_buyi/**` 12 文件：3 GLB、3 fit、3 report、manifest、前/后网格预览；`eq_buyi_tex/**` 10 文件：baseColor、layer、元数据与 6 张质检图。
- 衣图 PNG + `threeview/manifest.yaml` candidate 条目；本报告 33 行。
- `pnpm install --frozen-lockfile`：通过；最终 `pnpm check` 一次通过：186 files / 1322 tests、1777 内容文件 / 1708 对象，剧情编译与体积门全绿。
## 3. 关键结论与数值
- 出图 1 次图像工具；采用首轮原图，对齐缩放 1.2072、偏移 (0,5)；check_plate 七项通过，左右臂 26.673°/26.616°、face IoU 0.963193。
- 衣服区 IoU（RGB 最大通道差、无形态学）阈值 25/40/60 = `0.956281/0.922671/0.783253`；仅 25 作 ≥0.95 门禁。
- 同位衣服像素训练 9³ CIE Lab delta LUT：ΔE MAE/RMSE `6.843899/8.614049`；真实 z-buffer 正面投影覆盖 UV 有效纹素 `10.117653%`，其余走 LUT。
- `variantFillRatio=1.0`、亮于衣图衣服区 P99 比例 `0`；最终变体贴图皮肤色 `1802/1502384=0.001199427`（只报不判）；完整工具 `106.94 s`、峰值 `1968.98 MiB`。
- 身体层 torsoUpper/Lower `0.998621/1.0`，双上臂 `1/1`，双前臂 `0.996628/0.998567`，禁区均 0；纹素命中率 `0.790506`（含 nearest fallback 184265）。
## 4. 开放问题（附默认值）
- 贴图变体不能改变腰带结、系带、袖长、衣摆等几何；默认仅同轮廓款走 P3，形制差异改走新 P2 版型。
- 胸口肤色块/领口碎斑继承自 E2 劲装抽取；默认保留填充率，后续清理版型件后同版型变体统一再生。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/12-dressup-production.md` / V3：协调者验收后登记样例是否过闸；本任务不越权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 图像工具产物与原提示词/引用/归一/check_plate 入 manifest；衣图 IoU 25 门禁通过。
- ✅ 闭合圆柱同屏遮挡：前面取变体色、背面取 LUT 色；全肤色输入映射后的最终纹理皮肤色比例断言为 0；IoU=1/3、GLB 非图片字节不变。
- ✅ CLI 契约实测：IoU/填充门均退出 3；缺文件/坏尺寸均退出 2、无 traceback；`--json` stdout 恰为单个结构化 JSON。
- ✅ 三模板 GLB 仅实际 baseColor image 与布局元数据变化；JPEG q85 文件头/MIME 一致，各 8 accessor 逐字节相同。
- ✅ 纹理填充 100% ≥99.5%，亮纹 0% <0.1%；身体层复用 E3 最外交点+合格 nearest fallback+真实边界羽化；质检图目视复核。
- ✅ `python3 tools/model3d/dressup/tests_variant.py`：6/6；`check_plate.py`：7/7；`selftest.py`：7/7；图像工具 1 次、Tripo 0 点。
- ⚠️ 三模板 `validate.py --level draft` 已重跑：medium `33/39`、small `32/39`、tall `33/39`，均维持 `fail/draft`；失败为版型件既有穿透、翻面/边长门（贴图变体几何逐字节不变），未伪报通过。
- ✅ `pnpm install --frozen-lockfile` 与 `pnpm check` 通过（1322/1322）；共享锁因沙箱禁止写仓库外 lock 而无法包装，检查本体直接通过；写集与 `git diff --check` 通过。
- ✅ P3 量产序列：先 `check_plate.py`；再 `retexture_variant.py --base <版型目录> --base-plate <版型衣图> --plate <变体衣图> --id <id> --out <garments/id> --json`；随后三模板 `validate.py --level draft`；最后 `tests_variant.py`、`selftest.py`、`pnpm check`。

# 本任务：城镇 3D 古建 · 贴图层后处理 `make_seamless.py`——去接缝、按真实尺度归一、对色、3×3 平铺预览、FFT 查重复

**第一个动作**：读 `docs/tech/16-town-3d-spec.md` §12.1（每套件 16 层 + 道具 8 层、每层 `repeatM`、母版 1024²、按档条带）与 §12.2（出图流程：Gemini 出可平铺样片后用本工具处理），再看 `tools/buildgen/` 下 TOOL-buildgen-t1-placeholders 已有的 `common.py`（若该任务已合入；未合入就不依赖它，自己写工具函数）；读完直接动手，不要先写计划。

本任务写离线工具（Python）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（不改 `assets/default/` 下已有文件）。

## 背景
作者 AR-114（2026-10-10）：城镇 3D 古建要"写实古风"，贴图按真实尺寸平铺（瓦距 230 mm、宋砖约 410 × 200 × 80 mm、地砖 400–600 mm）。闸门 A 之后，出图线会用 Gemini 生成各层的可平铺样片；图像模型给的图通常有接缝、尺度不对、颜色与已审手绘图不一致、还常有明显重复图案。本工具把这些样片变成可直接进套件的贴图层：无缝、按 `repeatM` 归一尺度、与参考色对齐，并给出 3×3 平铺预览与重复度报告供人眼核查。

## 要做的事
1. **`tools/buildgen/make_seamless.py`**（Pillow + numpy，命令行）：
   - `--in <样片> --out <层 PNG> --size 1024 --repeat-m <w>x<h> [--src-scale-m <样片覆盖的真实米数>] [--ref <参考图或色卡> --match-color] [--blend 0.12]`；
   - **去接缝**：半移位（把四边接缝移到中心）后，用宽度 `blend × size` 的羽化蒙版把中心十字与原图交叉融合（或按最小误差路径缝合，二选一写清）；结果做四边连续性检查——左右边、上下边的对应像素 ΔE2000 平均 < 2；
   - **尺度归一**：给了 `--src-scale-m` 时，把样片按"样片覆盖米数 → `repeatM`"缩放并重复 / 裁切到 `size`；
   - **对色**：`--match-color` 时把均值与标准差在 Lab 空间对齐到参考（只调整整体色调，不改纹理），输出与参考的 ΔE2000（期望 ≤ 12）；
   - **预览**：输出 `<out>.tile3x3.png`（3×3 平铺，便于看接缝与重复）；
   - **重复度**：对灰度图做 2D FFT，找除直流外最强的周期峰；峰值显著（与平均能量比超过阈值）且周期小于 `size/3` 时打印警告 `REPEAT_PATTERN`（不改图，只报告）；
   - 输出一行 JSON 摘要（接缝 ΔE、对色 ΔE、重复峰、尺寸）。
2. 不实现批处理或任何联网；不读写 `assets/default/` 下已有文件（测试只用临时目录）。

## 测试（`tools/buildgen/tests/test_seamless.py`，unittest）
命名用例：
- 带明显接缝的合成纹理（左右半边色差大）处理后，四边连续性 ΔE 平均 < 2；无接缝输入处理后变化很小（与原图平均 ΔE < 3）。
- 尺度归一：`--src-scale-m 2 --repeat-m 1x1` 时输出等于样片缩小一半后平铺 2×2（容差内）。
- 对色：把纹理整体偏蓝后对齐到原色卡，ΔE2000 ≤ 12。
- FFT：人为生成周期 64 px 的强重复图案 → 报 `REPEAT_PATTERN`；随机噪声纹理不报。
- 预览图尺寸 = 3 × size；同输入两次输出 sha256 相同（确定性）。

## 约束
- 只写：`tools/buildgen/make_seamless.py`、`tools/buildgen/tests/test_seamless.py` 与本任务报告。
- 不改 t1 的文件（`common.py` 等）；不新增依赖（Pillow / numpy 已有；Lab / ΔE2000 自己实现，不引 colormath 等库）。

检查：
- `python3 -m unittest tools/buildgen/tests/test_seamless.py`
- `pnpm install --frozen-lockfile`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-buildgen-t4-seamless.md`（≤ 40 行）：第 3 节写命令行参数、去接缝方法、阈值；第 7 节写给出图线（Gemini 样片出图后的处理命令示例、要看的三项指标）的交接。

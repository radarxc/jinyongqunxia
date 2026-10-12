# TOOL-buildgen-t4-seamless 报告 · 城镇 3D 古建 · 贴图层后处理 make_seamless.py（去接缝、尺度归一、对色、3×3 预览、FFT 查重复）
## 1. 摘要（3–6 行）
- 已交付确定性 Pillow + NumPy CLI：尺度归一、中心十字羽化去缝、Lab 对色、3×3 PNG 预览和 FFT 重复告警。
- 合成验收实测对边平均 ΔE2000=0，已无缝输入处理变化 0.0893，对色后均色 ΔE2000=0.00838。
- 返修已把噪声源改为测试内固定种子 Mulberry32；专项 10/10、全量 274 文件 / 2325 测试及其余门禁通过。
## 2. 产出（文件、行数、主要章节）
- `tools/buildgen/make_seamless.py` 377 行：CLI、尺度、CIE Lab/ΔE2000、羽化、对色、FFT、PNG/JSON 输出。
- `tools/buildgen/tests/test_seamless.py` 166 行：10 个命名 unittest，含测试内固定种子 Mulberry32；未写 `assets/default/**`。
- `pnpm install --frozen-lockfile`：通过，8 workspace，lockfile 无变化，0.704 s。
- `python3 -m unittest tools/buildgen/tests/test_seamless.py`：10/10 通过，0.421 s。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：退出 0；274/274 文件、2325/2325 测试（114.18 s），1793 文件/1720 对象/4 Ink/65 地图；`[dev-chunks] PASS assets=981 manifest=101`。
## 3. 关键结论与数值
- 参数：`--in/--out/--repeat-m WxH` 必填；`--size 1024`、`--src-scale-m M|WxH`、`--ref ... --match-color`、`--blend 0.12`。
- 顺序：先按 `repeat/srcScale` 缩放后左上平铺/裁切；再半移位，把原四边移到中心，以 smoothstep 对中心十字做总宽 `blend×size` 的对称羽化，移回并锁定对边像素；无最小误差路径。
- 对色逐 Lab 通道匹配均值/标准差，不改像素位置；CIEDE2000 标准对 `2.0425` 实算 `2.04245968`。
- FFT 对灰度功率谱去直流，最强峰/非直流平均能量 `>50` 且周期 `<size/3` 时 stderr 打 `REPEAT_PATTERN`；64 px 合成周期实测 64 px、比值 32767.06，Mulberry32 噪声比值 9.6385、不告警。
- 一致处：母版默认 1024²、每图一个 `repeatM`、JSON 单行摘要与 `<out>.tile3x3.png`；偏离处：无。
- 接口已据官方资料联网核实（访问 2026-10-12）：[NumPy FFT](https://numpy.org/doc/stable/reference/routines.fft.html)、[Pillow LANCZOS](https://pillow.readthedocs.io/en/stable/handbook/concepts.html#filters)。
## 4. 开放问题（附默认值）
- FFT 阈值暂无真实 Gemini 批次标定；默认峰均能量比 50、短周期界为 `size/3`，只告警不改图。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/16` §12.2 / 出图线手册：后续可登记本命令、JSON 指标和 FFT 默认阈值；本任务按写集未改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只新增三份写集文件；源码 377 行（≤400），无新依赖、联网/批处理、素材改写、skip/todo；`git diff --check` 通过。
- ✅ 接缝两轴均值 0<2；无缝变化 0.0893<3；2 m→1 m 严格缩半并 2×2 平铺；偏蓝对色 0.00838≤12。
- ✅ 64 px 周期报 `REPEAT_PATTERN`、测试内固定种子 Mulberry32 噪声不报且比值≤50；预览 3×size；双运行主图与预览 SHA-256 均相同；stdout 恰一行 JSON。
- ✅ 全量门首次/中间曾因既有 `scene-allocation.test.ts` 采样窗波动失败（0/1 窗，要求 3），未改断言；同代码最终原阈值完整通过。
- ✅ 出图线示例：`python3 tools/buildgen/make_seamless.py --in sample.png --out layer.png --size 1024 --repeat-m 2x2 --src-scale-m 3x3 --ref approved.png --match-color --blend 0.12`；人眼看 3×3 接缝/重复，机器看 seam ΔE<2、color ΔE≤12、无 `REPEAT_PATTERN`。

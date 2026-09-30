# 本任务：外放招式特效管线 · Python 工具（`tools/vfx/`）

本任务写代码，不改策划 / 技术文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等规则照常适用。

## 背景

作者定下外放招式的两段式制作方式（原文见 `assets/default/STYLE.md` 文首末段）：白底效果多帧图用 Python 抠成多张透明 PNG；发出方图单独生成；程序按发出方向把效果叠到发出方上成整图；多帧加过渡成动效。设计与数据格式已定稿：`docs/design/23-projection-vfx-pipeline.md`、`docs/design/vfx/schema.yaml`。本任务按它实现。

## 要做的事

1. **`tools/vfx/cut_frames.py`**：输入白底效果图（单张长图分格，或多张单图）+ 分格参数 → 按 design/23 §2 的抠图算法输出 RGBA 帧序列 PNG 与 `EffectSet` YAML（锚点、方向、尺寸、帧数）。支持 `--preview` 输出黑底 / 灰底对比图便于检查抠图质量。
2. **`tools/vfx/compose.py`**：输入 `EffectSet` + `EmitterPlate` + `Composition`（YAML）→ 按方向 / 射程 / 缩放 / 混合模式合成每一帧整图，输出帧序列 PNG。
3. **`tools/vfx/animate.py`**：输入合成帧序列 + 节奏 / 过渡参数 → 输出：① 自包含 HTML 演示（帧以 WebP data URI 内嵌，Canvas 播放，含播放 / 暂停 / 速度 / 减少动态静帧，能在 `<iframe sandbox="allow-scripts" srcdoc>` 里运行，单文件 ≤ 3 MB）；② 可选 APNG 或 WebP 动图；③ 峰值帧 PNG。
4. **`tools/vfx/check_vfx.py`**：校验 EffectSet / EmitterPlate / Composition 的 schema、帧尺寸一致、alpha 真实（不是假透明）、锚点在图内、演示文件大小与自包含（grep 外链）。
5. **单元测试** `tools/vfx/test_vfx.py`：用程序生成的小图（白底色块、透明发出方）跑通抠图、合成、过渡、校验各一例，不依赖真素材。
6. **占位样例**：用程序生成的占位效果（例如白底上的金色渐变弧）与占位发出方（灰色掌形轮廓）跑全流程，输出到 `assets/default/baseline/vfx/preview/`（帧序列缩略 + `demo_placeholder.html` + README 说明为占位），不进 manifest。
7. **`tools/vfx/README.md`**：用法、数据流、参数说明、常见问题（抠图白边、方向约定）。
8. 只用标准库 + PIL + numpy + PyYAML（仓库已有）；Python 3.11；注释与命名遵循仓库其他工具风格；每次写入不超过约 150 行，分多次写。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/vfx -p "test_*.py"`
- `python3 tools/vfx/check_vfx.py --self-test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：各脚本用法与关键参数；抠图质量的量化指标（如残余白边像素比）；占位样例的输出清单；对 design/23 的偏离或补充；交 VFX-plates 的要点；需作者确认的事项。

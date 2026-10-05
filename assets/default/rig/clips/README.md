# `tianshu-clip.v1` 离线片段

本目录是动作原型 P6–P7 的运行时输入。原始动作包不入库，来源、许可和哈希见 `SOURCES.md`。

## 文件

- `clip.schema.json`：片段 JSON Schema（Draft 2020-12）。
- `clip_*.json`：30 fps 骨向量片段；`clip_walk` 与通过 Q4–Q6 的 `clip_sword_attack` 是原型主片段；`clip_sword_regular_a` 保留为 Q4 失败压力样本，另有 7 个备用片段。
- `clip_{walk,sword_attack,sword_regular_a}.metrics.json`：八个相机偏航方向的投影指标。
- `clip_{walk,sword_attack,sword_regular_a}.strip.png`：同一代表帧的八方向火柴人目检条带（Walk 取中帧，Sword 取 `hit` 帧）。

## 复现

从 `SOURCES.md` 固定 URL 下载源 GLB 并核对 SHA-256，然后执行：

```bash
python3 tools/rig/clips/clip_import.py SOURCE.glb \
  --animation Walk --id clip_walk --fps 30 --loop \
  --native-speed-mps 0.78 --license CC0-1.0 \
  --source-url URL --output assets/default/rig/clips/clip_walk.json
python3 tools/rig/clips/clip_metrics.py assets/default/rig/clips/clip_walk.json \
  --json assets/default/rig/clips/clip_walk.metrics.json \
  --png assets/default/rig/clips/clip_walk.strip.png
```

需要一拍二源数据时把 `--fps 30` 改成 `--fps 12`；30 fps 和 12 fps 都含末帧，事件时间按“半值远离零”整数化到帧。运行时播放器由后续 ENG-12c-clip 实现，本目录不包含播放器代码。

# 本任务：动作原型 P6–P7 · CC0 动作片段导入、烘焙与投影指标（AR-29）

本任务写离线工具和片段数据。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本任务已开联网，用来下载 CC0 动作库。

## 背景

作者决定做人物动作原型（`docs/decisions/author-requirements.md` AR-29）。调研报告 `tools/agents/reports/RESEARCH-anim-motion-library.md` 必读：
- §2（动作库与许可）、§4.1、§5.2 数据流、§5.3 模块、§5.6 最小原型（P6、P7 与判定标准 Q4–Q6）；
- §8.1–8.2 投影统计与微基准、§8.5 下载记录（文件名与 SHA-256）。

调研时写的分析脚本在 `tools/agents/reports/RESEARCH-anim-proto/`，可直接移植：`glb_fk.py`、`analyze_clips.py`、`view_switch.py`、`torso_fit.py`、`clip_bench.mjs`。

前置任务 `TOOL-rig-nearside` 已把近侧约定改为解剖学左侧，片段按解剖学左右投影。

## 要做的事

1. **取动作源**：
   - 首选 **Mesh2Motion 人形动作集**（美术资产 CC0、代码 MIT）；备选 **Quaternius Universal Animation Library 1 / 2**（CC0）。
   - 只用报告 §2 的白名单：CC0、CMU 条款、CC BY 加署名。不用 Mixamo、万代南梦宫、SFU。
   - Mesh2Motion 的 mocap 组 16 个动作来源不明，不用。
   - 原始 GLB / ZIP 不入库，放 `.agents/coord/motion_src/`（不入库目录）。入库的是 `assets/default/rig/clips/SOURCES.md`：每个来源的 URL、许可原文链接、下载日期、文件名、SHA-256。
2. **`tools/rig/clips/clip_import.py`**：
   - glTF 读取，可以用纯 Python 解析 GLB，参考 `glb_fk.py`，不要引入大依赖；
   - 骨架映射到 `tianshu_rig` 关节（UE 风格 66 关节和 Rigify 53 关节两种映射表）；
   - 烘焙成「骨向量轨迹」clip JSON：每帧每骨的 3D 方向与长度比，帧率 30 fps，可选降到 12 fps；
   - 剑轴标定：握点、剑尖方向；
   - 事件：`hit`、`end`，供 `CueApi.playAnim` 的回调用；
   - 写出 schema 文件 `assets/default/rig/clips/clip.schema.json`。
3. **原型片段**：
   - `Walk` 和 `Sword_Regular_A`（或 UAL1 的 `Walk_Loop`、`Sword_Attack`）各一份 clip JSON，放 `assets/default/rig/clips/`；
   - 另外导出 5–8 个常用片段备用：idle、run、受击、倒地、打坐 Meditate、闪避、出拳。
4. **`tools/rig/clips/clip_metrics.py`**：按相机偏航 8 方向投影，输出：
   - 每方向躯干视图切换次数；
   - 肢体最短缩放（缩短下限按报告取 0.45）；
   - 手臂越过躯干平面的帧比例；
   - 走路支撑脚踩滑（cm）；
   - 剑轴与投影偏差。
   
   写成 JSON；再出一张 8 方向火柴人条带图（PNG），用于目检。
5. **测试**：`tools/rig/clips/test_clip_import.py` 覆盖解析、映射、烘焙的确定性（同输入同输出、整数化规则），以及 schema 校验。
6. **`docs/tech/09-character-rig.md`**：新增「动作片段」一节，写 clip 数据格式、关节映射、事件、许可白名单。这一节只追加，不改前面各节：前置任务刚改过。

## 约束
- 只写：
  - `tools/rig/clips/**`
  - `assets/default/rig/clips/**`
  - `docs/tech/09-character-rig.md`（只追加新一节）
  - 本任务报告
- 不改 `packages/**`：运行时播放器是后续任务 ENG-12c-clip。
- 下载只取报告 §8.5 列明或同一官方来源的 CC0 文件，核对 SHA-256。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`

## 报告

第 3 节写：
- 导入的片段清单与许可；
- 两个原型片段的指标（对照报告 Q4–Q6）；
- 条带图路径；
- 映射里没法对上的关节。

报告 ≤ 60 行。

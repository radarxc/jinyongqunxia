# 动作片段来源与许可

> 本目录只提交由动作源烘焙出的骨向量 JSON、质量指标和目检条带；原始 GLB / ZIP 不入库。
> 下载与许可于 **2026-10-02** 联网核实；哈希针对下载字节，来源固定到 Git commit `79f3f61a9852ef70234a5a4a7c13ed87f7a71833`。

## 许可白名单

构建工具只接受 `CC0-1.0`、`CMU-commercial`、`CC-BY-4.0`。CC BY 必须在发行致谢中署名；CMU 数据不得作为数据本身转售。当前入库片段全部来自 Mesh2Motion 的 CC0 美术资产，没有使用来源未明的 `human-mocap-animations.glb`，也没有使用 Mixamo、万代南梦宫或 SFU 数据。

Mesh2Motion 仓库声明原文：“The code and platform are all licensed under the very permissive MIT license. The art assets (3d models, rigs, animations) are all licensed under CC0.” 其 `LICENSE-CC0.MD` 另写：“All 3d models, blend files, rigs, animations / CC0 1.0 Universal”。

许可链接：

- Mesh2Motion 仓库许可段：<https://github.com/Mesh2Motion/mesh2motion-app#licenses>
- 仓库内美术许可原文：<https://github.com/Mesh2Motion/mesh2motion-app/blob/79f3f61a9852ef70234a5a4a7c13ed87f7a71833/LICENSE-CC0.MD>
- CC0 1.0 法律文本：<https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt>

## 下载记录

| 文件 | 官方固定版本 URL | 字节数 | SHA-256 | 用途 |
|---|---|---:|---|---|
| `human-base-animations.glb` | <https://raw.githubusercontent.com/Mesh2Motion/mesh2motion-app/79f3f61a9852ef70234a5a4a7c13ed87f7a71833/static/animations/human-base-animations.glb> | 5,656,648 | `406eb0a8dc4ab366e623b79b6e3005a4951392e1bda78ae39c1099d31147733c` | Walk、Sword_Regular_A、Idle_A、Sprint、Hit_Chest、Death_D、Punch_Jab |
| `human-addon-animations.glb` | <https://raw.githubusercontent.com/Mesh2Motion/mesh2motion-app/79f3f61a9852ef70234a5a4a7c13ed87f7a71833/static/animations/human-addon-animations.glb> | 5,292,804 | `a0d64d555e0d492026b72d58bf8e16c5e86779295f9093e376dcc001915c2c95` | Meditate、Dodge_back |

下载命令应把源文件写到仓库外的 `.agents/coord/motion_src/`；本次执行环境不允许写该共享目录，故实际下载到 `/private/tmp/tianshu-motion-src/` 后完成哈希核对。临时文件不是交付物，后续复现须重新从上表固定 URL 下载并核哈希。

## 入库片段清单

| clip ID | 原动作 | 源文件 | 30 fps 帧数 | 循环 | 表现事件 | 用途 |
|---|---|---|---:|---|---|---|
| `clip_walk` | `Walk` | base | 51 | 是 | `end@50` | 原型、行走 |
| `clip_sword_attack` | `Sword_Attack` | base | 58 | 否 | `hit@25,end@57` | 原型主剑招、单剑攻击 |
| `clip_sword_regular_a` | `Sword_Regular_A` | base | 15 | 否 | `hit@6,end@14` | 压力样本；Q4 失败，不默认启用 |
| `clip_idle` | `Idle_A` | base | 95 | 是 | `end@94` | 待机 |
| `clip_run` | `Sprint` | base | 26 | 是 | `end@25` | 跑步 |
| `clip_hit_chest` | `Hit_Chest` | base | 13 | 否 | `end@12` | 受击 |
| `clip_fall` | `Death_D` | base | 66 | 否 | `end@65` | 倒地；不是剧情死亡 |
| `clip_meditate` | `Meditate` | addon | 46 | 是 | `end@45` | 打坐 |
| `clip_dodge_back` | `Dodge_back` | addon | 31 | 否 | `end@30` | 闪避 |
| `clip_punch_jab` | `Punch_Jab` | base | 34 | 否 | `hit@13,end@33` | 出拳 |

`hit` / `end` 都是 `CueApi.playAnim` 的表现回调，不参与伤害、命中或死亡判定。

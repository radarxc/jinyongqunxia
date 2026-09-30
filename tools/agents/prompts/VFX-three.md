# 本任务：外放招式 · Three.js 合成播放器与两招样例（降龙十八掌·亢龙有悔、六脉神剑）

本任务写代码（Three.js 播放器、演示打包脚本）、改设计文档的对应章节、整理两招样例素材。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等规则照常适用。

## 作者要求（原话）

2026-09-29：

> 外放招式以后也分成两部分来做
> 1. 招式外放白底效果图（比如降龙十八掌的龙形），连续多张，然后用python切出多个png图
> 2. 招式发出方图（比如掌 for 掌法，剑+手 for 剑法）
> 用程序为外放效果按照发出方向 叠加上去，形成整图。多个效果图 + python程序实现过渡，形成动效图

2026-09-30：

> 明确其实就是几个图，然后用代码合成。

> 招式也是拆成几个图和合成的代码（用threejs或者类似的web 库做）

游戏客户端就是 Three.js（`docs/tech/01-architecture.md`：`three@0.186.1`，r186，`WebGLRenderer`）。所以：**Python 只负责把白底图切开、抠成透明 PNG；合成与动效在网页里用 Three.js 做**，播放器代码将来直接进游戏的渲染包。现有 `tools/vfx/` 里用 Python 合成关键帧、重采样成 WebP 帧再塞进 Canvas 播放器的那一段（`compose.py` 的动效部分、`animate.py`、`player.html`）作废。

## 现有材料

- 两招的原料图与切帧结果在另一个任务的工作区（只读，先整目录复制进本工作区的同路径）：
  `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/VFX-plates/assets/default/baseline/vfx/mv_xianglong18_kanglong/`
  `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/VFX-plates/assets/default/baseline/vfx/sk_liumai/`
  每套里：`effect/source_sheet.png`（白底 6 帧一张图）、`effect/frame_000–005.png`（Python 抠出的 RGBA 帧）、`effect/effect-set.yaml`、`emitter/source_*.png`（透明底的掌 / 指）、`emitter/emitter-plate.yaml`、`composition.yaml`（发出点、方向、长度、混合、节奏）。其余（`frames/`、`qa/`、`animation.json`、`demo.html`、`peak.png`）是旧合成的产物，不要复制。
  同一工作区的 `assets/default/prompts/vfx.md`（两段式模板）与 `manifest.yaml` 里两条 `vfx_*` 条目（`pipeline: two-part`）也拿过来作起点。
- 设计：`docs/design/23-projection-vfx-pipeline.md`（§2 切帧、§3 发出方、§4 几何与混合、§5 节奏、§6 数据格式）、`docs/design/vfx/schema.yaml`。§4–§5 的公式与节奏定义保留，只是执行者从 Python 换成 Three.js。
- 工具：`tools/vfx/`（`cut_frames.py` 保留；`check_vfx.py` 改造；其余按下文取舍）。

## 要做的事

### 1. Three.js 播放器 `tools/vfx/web/`

- `timeline.js`：纯函数、无 three 依赖：输入 Composition（JSON）与时间 t，输出当前帧索引与混合系数、alpha 包络、沿向缩放、消散位移、亮度增益、阶段名（凝聚 / 发出 / 持续 / 消散）。按 design/23 §5 的定义，用 node 可测（`tools/vfx/web/test_timeline.mjs`，`node --test`）。
- `vfx_player.js`：ES module，`createVfxPlayer(THREE, { canvas, composition, emitterImage, effectFrames })` → `{ play, pause, seek, setSpeed, dispose, duration, onFrame }`。THREE 由调用方传入（演示页用 CDN 的 r186 ESM，游戏里传自己的 `three`），不要在模块里 import three。
  - 正交相机、像素单位；背景色取 Composition；发出方是一张带 alpha 的平面；效果是一张平面，锚在发出点、沿方向旋转，长度 / 宽度按 design/23 §4 公式。
  - 帧过渡用 ShaderMaterial：两张相邻帧纹理按混合系数插值（预乘 alpha，根部对齐），再乘 alpha 包络与亮度；混合模式按类别：金龙 lighter / screen（`THREE.AdditiveBlending` 或 CustomBlending 实现 screen），气剑 screen；水墨类 normal。
  - 显现 / 消散不只靠整体淡入淡出：加一条**沿发出方向的推进遮罩**（凝聚期从根部向前端显现，消散期从根部向前端退去或整体飘散），让"发出 → 持续 → 消散"有方向感；参数放进 Composition（新增字段，schema 同步）。
  - 不在代码里画任何造型；所有可见像素都来自原料图。
- `build_demo.py`（Python）：把播放器、Composition（YAML → JSON）、发出方图与效果帧（data URI）打进一个 `demo.html`：`<script type="importmap">` 把 `three` 指到 `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js`（与游戏同版本；这是演示页唯一允许的外链），其余全部内联；带播放 / 暂停 / 速度 / 减少动态开关；首屏静止显示峰值相位。单文件 ≤ 3 MB。
- `compose.py` 只保留"按同一份 Composition 贴一张静态峰值帧 `peak.png`"的功能（给清单缩略图与审批页用），删掉动效相关代码；`animate.py`、`player.html`、`make_placeholder.py` 及只为它们服务的代码与测试删除。`check_vfx.py`：YAML 校验保留；`--html` 检查改为"除 importmap 里那一条 three 的 jsdelivr 地址外没有外链、≤ 3 MB、内联脚本能过 `node --check`"。`README.md` 重写为新流程。

### 2. 两招样例

- 每套目录整理为：`effect/source_sheet.png`、`effect/frame_*.png`、`effect/effect-set.yaml`、`emitter/source_*.png`、`emitter/emitter-plate.yaml`、`composition.yaml`、`composition.json`（由脚本导出）、`peak.png`、`demo.html`。其他文件不要。
- 用 `build_demo.py` 生成两份 `demo.html`；`compose.py` 生成两张 `peak.png`；`view_image` 看峰值帧：效果从发出点沿方向发出、根部与掌面 / 指尖衔接、没有白边或切口。
- 六脉神剑样例目前偏细、偏灰，像一根细棍；在播放器里用亮度 / 叠加与推进遮罩把"内力凝缩、线性持续"的感觉做出来（参数调 Composition），**不要重新生图**——原料图是否重出等作者审批意见。
- manifest 两条 `vfx_*` 条目更新：`code` 指向新 `demo.html`，`files` 清单按新目录，`size` / `sha256` 实测；`pipeline: two-part`，`status: candidate`；旧的两条 `ref_*` 条目与文件不动。
- `assets/default/prompts/vfx.md`：合成一节改为 Three.js 播放器与 Composition 参数说明；原料出图模板保留。

### 3. 设计文档同步

`docs/design/23-projection-vfx-pipeline.md` §5.3（输出与脚本分工）、§6（数据格式，新增推进遮罩等字段）、§9.1 按新分工改写；§0 结论加一句"合成与动效在 Three.js 里做，Python 只切帧"。`docs/design/vfx/schema.yaml` 同步新增字段。不重写其他章节。

## 约束

- 沙箱里没有浏览器也没有 GPU：`timeline.js` 用 node 测；`vfx_player.js` 只做 `node --check` 与代码复核；真实浏览器实跑由协调者验收，报告里如实写"未在浏览器实跑"。
- 只用仓库已有依赖（Python：标准库、Pillow、numpy、PyYAML；JS：无第三方，three 由页面从 CDN 加载）。
- 每次写入不超过约 150 行，分多次写。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/vfx -p "test_*.py"`
- `node --test tools/vfx/web/`
- `node --check tools/vfx/web/vfx_player.js`
- 两套各跑：`python3 tools/vfx/check_vfx.py <套件>/effect/effect-set.yaml <套件>/emitter/emitter-plate.yaml <套件>/composition.yaml --root <套件> --html <套件>/demo.html`（`<套件>` = `assets/default/baseline/vfx/mv_xianglong18_kanglong`、`assets/default/baseline/vfx/sk_liumai`）
- `python3 tools/agents/check_assets.py assets/default/baseline/vfx --min 2 --max 4`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：播放器接口与 Composition 新增字段；两招的参数（发出点、方向、长度、混合、节奏、推进遮罩）；删除了哪些旧代码；设计文档改了哪些节；待协调者浏览器验收的清单；需作者审批的事项（原料图是否重出、手部画法）。报告控制在 150 行以内。

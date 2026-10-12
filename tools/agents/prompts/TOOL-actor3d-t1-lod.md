# 本任务：城镇 3D 人物 · 城镇减面工具链 `town_lod.py` + 量身高与原生步速 `measure_gait.mjs`；首批六个模型的 LOD0 / LOD1

**第一个动作**：打开 `tools/model3d/dressup/pack_glb.mjs`（`--simplify`：保 UV、蒙皮权重、区域边界并 meshopt 压缩）、`tools/model3d/dressup/textures.py`（`--max`、`--quality`）、`tools/model3d/dressup/meshopt_decode.mjs`（在 Node 里解 meshopt 的写法）、`tools/model3d/dressup/glb_io.py` 与 `docs/tech/16-town-3d-spec.md` §9.1、§9.2、§9.4、§9.6；再看六个源模型目录（`assets/default/model3d/{npc_generic_m,npc_generic_f,npc_zhujue__ch00_m,npc_zhujue__ch00_f,npc_duanyu,npc_liwenxiu__ch10_youth}/` 的 `manifest.yaml`、`model_rig.glb`、`anim_idle_walk_run.glb`）；读完直接动手，不要先写计划。

本任务写离线工具（Python + Node）并产出新素材文件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（不改 `assets/default/` 下已有文件，只新增）。

## 背景
作者 AR-114（2026-10-10）：「人物大小和建筑不匹配」；作者拍板人物用 3D 模型、按身高缩放，并有城镇减面版。现在每个 Tripo 模型约 10 万三角、三张 2048² 贴图（约 64 MiB 显存），城里同屏 4–20 个人就超预算。城镇版：LOD0 ≤ 2.5 万三角、只留 baseColor ≤ 1024²；LOD1 ≤ 9 千、512²。还要量出每个模型的头顶骨骼高度（`statureMu`，用来按数据身高缩放）和走 / 跑动画的原生速度（`nativeHps`，倍率 1 时每秒走过几个身高，用来让播放率与移动速度匹配、脚不打滑）。

## 要做的事
1. **`tools/model3d/town_lod.py <模型目录>... [--out-subdir town]`**：对每个模型目录串起 ① 去掉法线与金属粗糙度贴图、只留 baseColor；② `textures.py --max 1024`（LOD0）/ `--max 512`（LOD1）；③ `pack_glb.mjs --simplify <比例>`（比例按目标三角数从源三角数算出，迭代至 ≤ 目标）；④ `measure_gait.mjs`；⑤ 写 `assets/default/model3d/<id>/town/town.json`（`{ lod: [{ file, triangles, textureSize, bytes }, …], statureMu, nativeHps: { walk, run }, source: { file, sha256 }, tool: { version } }`）与 `town/{lod0,lod1}.glb`；⑥ 在该目录 `manifest.yaml` **旁边**新建 `town/manifest.yaml`（不改原 manifest），字段照 `assets/README.md`，`status: candidate`、出处指向源文件与本工具。
2. **`tools/model3d/measure_gait.mjs <glb> [--clips <anim.glb>]`**：用 three（仓库已有依赖）在 Node 里加载（meshopt 解码照 `meshopt_decode.mjs`）：`statureMu` = 绑定姿势下 `HeadTop_End`（或 `mixamorig:HeadTop_End`）骨骼的世界高度（模型单位）；`nativeHps.walk / run` = 在走 / 跑片段一个完整周期内，以支撑脚（每帧取更低的那只脚骨骼）的水平位移累计除以周期时长与身高（若片段带根运动则直接用根位移）；输出 JSON。**不按包围盒量身高**。
3. **校验**（工具内置，任一不过非零退出）：LOD0 ≤ 25,000 三角、LOD1 ≤ 9,000；贴图边长 ≤ 1024 / 512；骨骼名与数量与源一致；每个顶点权重和 = 1 ± 1e-3；减面后 `statureMu` 与源相差 ≤ 1%；LOD0 文件 ≤ 1.6 MB；脚底支撑滑移（同一支撑相内支撑脚水平漂移）≤ 2 cm（按 1.81 m 身高换算）。
4. **产出**：`npc_duanyu`、`npc_liwenxiu__ch10_youth` 只有 `model_rig.glb`、没有自带动画片段——用同性别通用模型（`npc_generic_m` / `npc_generic_f`）的 `anim_idle_walk_run.glb` 量步速（与运行时 `retargetBattleClips` 重定向一致），`town.json` 记 `clipsFrom`。对上述六个模型各跑一次，提交 `town/` 下的新文件（GLB、town.json、town/manifest.yaml）。转台截图需要浏览器，本任务**不做**（协调者用常驻浏览器另拍），在报告里列出待拍清单。

## 测试
- `tools/model3d/tests_town_lod.py`（unittest）：用程序构造的最小蒙皮 GLB（两根骨骼 + `HeadTop_End` + 一段走路片段）跑全流程：三角上限、骨骼保持、权重和、`statureMu` 精确值、`nativeHps` 与构造的步速一致（±2%）、`town.json` 字段齐全；对同一输入两次运行产物 sha256 相同（确定性）。
- `measure_gait.mjs` 的 `node --test` 用例（`tools/model3d/measure_gait.test.mjs`）：同一最小 GLB 的 `statureMu` 与 `nativeHps`。

## 约束
- 只写：`tools/model3d/{town_lod.py,measure_gait.mjs,measure_gait.test.mjs,tests_town_lod.py}`、`assets/default/model3d/{npc_generic_m,npc_generic_f,npc_zhujue__ch00_m,npc_zhujue__ch00_f,npc_duanyu,npc_liwenxiu__ch10_youth}/town/**`（只新增）与本任务报告。
- 不改 `tools/model3d/dressup/**`（换装线的工具；需要新参数就在 `town_lod.py` 里包装，或在报告提出）、不改任何已有素材文件、不碰 `assets/default/model3d/dressup/**` 与 `*_base_body` 目录（换装线在用）；不新增依赖（Python 用已有的 Pillow / numpy，Node 用已有的 three / meshoptimizer）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `python3 -m unittest tools/model3d/tests_town_lod.py`
- `node --test tools/model3d/measure_gait.test.mjs`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-actor3d-t1-lod.md`（≤ 60 行）：第 3 节列六个模型的源 / LOD0 / LOD1 三角数、贴图边长、文件字节、`statureMu`、`nativeHps`、滑移实测；第 7 节写给 ENG-actor3d-a2-port（`town.json` 怎么读成 `ActorAssetSet`）、协调者（待拍转台图清单）与换装线（本任务没碰换装文件的确认）的交接。

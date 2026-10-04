# 本任务：游戏工程 · 战斗单位用 3D 模型：有专属模型用专属，没有的按性别用通用模型（npc_generic_m / _f），单位旁显示可区分的标识；通用模型未到位时临时用普通形象男女主角模型（作者 AR-85）

本任务写渲染与界面装配代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能。

先读：
- `docs/decisions/author-requirements.md` 的 AR-85（作者原话与协调者口径）、AR-64（默认懒加载）、AR-79（3D 比例，只读了解）；
- `CLAUDE.md` 的分层与性能规则；`tools/perf/budgets.json`；
- 现状：
  - 战斗场景 `packages/render/src/battle/scene.ts` 目前用 2D 纸偶（RigBatch）画单位；
  - 3D 只在 ENG-12e 的试点里：`packages/render/src/gltf/`（`load.ts`、`pilot-scene.ts`、`retarget.ts`）；
  - 模型在 `assets/default/model3d/<目录>/`：`model_rig.glb`（65 关节 mixamorig）、动作 `anim_*.glb`、`manifest.yaml`。现有 37 套，目录命名两种并存（`npc_xiaofeng`、`npc_<名>__chNN_youth`），身高已归一到约 0.98，贴图 2k，每个 GLB 约 6 MB；目前构建不复制这些文件；
- `docs/design/26-immersive-ui.md`：战斗 HUD、头像与标识的口径；
- ENG-npc-species-roleslot 的报告：NPC 的 `species` 字段。

## 要做的事

1. **模型解析**（数据驱动，不硬编码人名）：
   - 单位有专属模型就用专属；目录名与 NPC ID 的对应写成映射表，两种命名都要认；
   - 没有专属模型的人类单位，按性别用通用模型：`assets/default/model3d/npc_generic_m/`、`npc_generic_f/`。A 字图正在出，模型由 Tripo 子代理做；
   - 通用模型还没到位时，临时用普通形象男女主角模型 `npc_zhujue__ch00_m` / `npc_zhujue__ch00_f` 顶替。正式模型入库后只换资源、不改代码：解析在构建期按 manifest 是否存在决定；
   - 性别来源：NPC 数据的 `identity.gender`。在 npc.v1 加这个可选字段（`male` / `female`），为 M1 两章（ch00、ch10）参战的 NPC 补值；模板生成的杂兵按模板取；还缺的按男处理，报告列出清单；
   - 非人类单位（`species` 不是人，如白猿）不套人类通用模型，保持现有 2D 画法或占位，报告写明。
2. **战斗渲染**：
   - 战斗单位改用 3D 模型渲染，沿用 ENG-12e 的加载与骨骼重定向；同一模型的多个单位共享几何与材质；
   - 模型加载失败时退回现有 2D 纸偶，战斗照常进行；
   - 身高按归一化高度与角色身材缩放；朝向、移动、待机与走跑动作接上现有战斗事件。
3. **可区分的标识**：单位旁显示标识，按 design/26 的口径定：姓名牌加头像小圆框，或者阵营色脚环加姓名。
   - 通用模型的单位必须有；有专属模型的是否也显示，按 design/26 定，写进报告；
   - 不遮挡战场：不压目标格中心、不挡浮字；手机竖屏（390 宽）也看得清，给出字号与尺寸。
4. **资源发布**：构建时把战斗用到的模型复制进 `apps/game/public/assets/default/model3d/…`，按 manifest 走，与现有素材发布同一套。
   - 守住离线闭包：单文件 ≤ 8 MiB，章节进入闭包 ≤ 60 MiB（ENG-23b）；
   - 只发布被引用的模型，不整目录复制。
5. **体积与性能**：
   - glTF 加载、骨骼与动作相关代码放懒加载块，不进 entry 和 render 的静态闭包。render 余量约 11 KiB，报告写实测；
   - 报告给出 3D 单位 6 个、12 个时的 draw call 与帧时间。
6. **测试**：
   - 解析：专属 → 通用（按性别）→ 主角模型顶替，三级各有用例；两种目录命名都认；非人类不套通用模型；
   - 发布：只复制被引用的模型；通用模型目录出现后，解析自动改用它；
   - 标识：通用模型单位一定有标识；竖屏宽度下的尺寸断言；
   - 加载失败退回 2D 的用例。

## 约束

- 写集：`packages/render/src/**`、`packages/ui/src/**`、`packages/data/src/schemas/**`、`apps/game/src/**`、`apps/game/build/**`、`content/chapters/ch00_yuenv/npcs/**`、`content/chapters/ch10_baima/npcs/**`。写集外的改动在提交时会被丢弃。
- 不改 core 规则，不改 `assets/default/model3d/**`，不改门禁与预算。不加新依赖：three 的 GLTFLoader 已在用。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 50 行，写清：
- 模型解析规则与映射表的位置；性别来源与缺值清单；
- 标识的样式、尺寸与 design/26 的对应；
- 发布了哪些模型，大小与闭包数字；
- 懒加载块大小，entry / render / 首次会话的数字；
- 6 个、12 个 3D 单位的 draw call 与帧时间；
- 通用模型到位后要做的事（应为零代码改动）。

# 本任务：3D 角色 · 用 Tripo API 优化男女主角（`npc_zhujue__ch00_m` / `npc_zhujue__ch00_f`）：高质量模型 + 骨架 + 预设动作；并写出可复用的 `tools/model3d/tripo_cli.py`（作者 AR-41，2026-10-03）

本任务出模型并登记，顺带写一个小工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本机 Codex 沙箱**已开网络**。

先读：
- `docs/decisions/author-requirements.md` AR-41（作者原话）、AR-38（Tripo 试点：作者免费档单图生成的 `apps/game/public/pilot/zhujue_tripo_v1.glb`，65 个 Mixamo 关节、无动画，**左侧头发呈肉色**是上一版的问题）、AR-39（产物落库）；
- Tripo 官方文档（作者指定）：https://developers.tripo3d.ai/zh/docs/quick-start ，以及它链接到的 API 参考（任务类型 `image_to_model` / `multiview_to_model` / `animate_prerigcheck` / `animate_rig` / `animate_retarget`、上传接口、任务轮询、余额接口、`model_version` 与 `texture / pbr / texture_quality / face_limit / auto_size` 等选项、点数价目）。**一切以文档为准**，本说明里的端点名只是提示。
- 输入素材：男主角立绘 `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png`、三视图 `assets/default/rig/npc_zhujue__ch00_m/sheet/sheet_L.png`（front34 | side | back34，三人并排，需要你自己裁成单视图）、若已入库的 `sheet_side_L.png`（纯侧视，ART-rig-sheet-side）；女主角立绘 `assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png`（没有三视图）。
- `packages/render/CLAUDE.md`「3D 试点（ENG-12e）」：运行时按 Mixamo `mixamorig:*` 或 UE 骨名映射到 20 关节，统一缩放 1.70 m、脚底 `y=0`；`/rig-demo?model=<glb url>` 可加载任意 GLB。

## 密钥（最重要的约束）

- key 在主检出 `/Users/bytedance/Projects/jinyongqunxia/.env`，一行 `tripo_key=…`。运行时这样取：`export TRIPO_KEY="$(grep -m1 '^tripo_key=' /Users/bytedance/Projects/jinyongqunxia/.env | cut -d= -f2-)"`。
- **绝不**把 key 打印到终端 / 日志 / 报告 / manifest / 任何文件；不 `set -x`；curl 用 `-H "Authorization: Bearer $TRIPO_KEY"`，不要把完整命令回显；错误信息里若含 key 也要删掉再记。
- 工作区里不要创建 `.env`；不复制主检出的 `.env`。

## 要做的事

1. **工具** `tools/model3d/tripo_cli.py`（新，Python 3，只用标准库 + `requests` 若环境里有，否则用 `urllib`）：子命令 `balance`、`upload <image>`、`image-to-model <image> [--options json]`、`multiview-to-model --front … [--left …] [--back …] [--right …]`、`rig <model_task_id>`、`retarget <rig_task_id> --animation <preset>`、`wait <task_id>`、`download <task_id> --out <dir>`（下载 GLB 与渲染预览，记录 sha256 / 大小），全部从 `TRIPO_KEY` 环境变量取 key，`--json` 输出机器可读结果（task_id、status、credits、urls）。带 `--dry-run`。写 `tools/model3d/README.md`（用法、点数提醒、密钥规则）。
2. **预算**：先 `balance` 记录余额；本任务上限 **600 点**；每次创建任务前估算、每次完成后累计；到上限立即停，报告写明。
3. **男主角**：
   - 把 `sheet_L.png` 裁成 front34 / side / back34 三张单人图（用 PIL，按三等分 + 去空白边），再加立绘正面图；优先用 `multiview_to_model`（文档要求的视图：正面 + 左 / 后 / 右中的若干；用你能提供的最接近的视图，并在报告写明哪张当哪一面），选项用高质量：`texture: true`、`pbr: true`、最高 `texture_quality`、`model_version` 取文档当前推荐版、`face_limit` 不超过 30000；若 multiview 结果不如单图，再做一次 `image_to_model`（立绘）对比，两者都下载，报告贴渲染预览对比，选更好的作为交付（另一份存 `candidates/`）。
   - 检查头发：预览图里头发必须是黑 / 深色、无肉色块；不合格换种子 / 选项重做，每种输入最多 2 次。
   - `animate_prerigcheck` → `animate_rig`（骨架；输出 glb），再 `animate_retarget` 做 3 个预设动作（文档里有的：idle / walk / run 之类），下载为独立 GLB。
4. **女主角**：没有三视图，用立绘 `image_to_model`（同样的高质量选项，最多重做 2 次），然后骨架 + 同样 3 个预设动作。
5. **落库**（AR-39）：`assets/default/model3d/npc_zhujue__ch00_m/`、`…/npc_zhujue__ch00_f/`：`model_rig.glb`（带骨架）、`anim_<name>.glb` × 3、`preview.png`（Tripo 渲染预览，若 API 给多角度就多存几张 `preview_<角度>.png`）、`candidates/`（未选用但已下载的版本，≤ 2 个）；每目录 `manifest.yaml`（顶层列表，字段：`id`（`<npc>__model_rig` / `<npc>__anim_walk` …）、`file`、`category: model3d`、`style: default`、`subject`、`tool: tripo-api`、`model_version`、`task_ids`（上传 / 生成 / 骨架 / 重定向）、`options`、`credits`（本条消耗）、`references`（来源立绘与三视图的 path + sha256）、`sha256`、`size_bytes`、`joints`、`status: candidate`、`notes`）。不要把 GLB 放进 `apps/game/public/`。
6. 自检：`python3 -c "import yaml,hashlib;…"` 核 manifest 的文件存在与 sha256；`python3 tools/lint/check_ids.py --strict`；`git grep -n "tripo_key=\|Bearer tsk"`（排除 docs/decisions）必须为空。

## 约束

- 只写：`tools/model3d/**`、`assets/default/model3d/npc_zhujue__ch00_m/**`、`assets/default/model3d/npc_zhujue__ch00_f/**`、本任务报告。不改 `packages/**`、`apps/**`、立绘、三视图。
- 中间件（裁切的视图、下载临时文件）放 `/private/tmp/ART-3d-tripo-avatars/`，做完清掉；不在 /private/tmp 做任何整仓检出。
- 每次写入 ≤ 150 行；报告 ≤ 60 行。

## 报告

`tools/agents/reports/ART-3d-tripo-avatars.md`：§3 两位主角各一表（输入视图、任务 ID、选项、重做次数、点数、关节数、文件大小、预览路径、与上一版对比的结论）、余额前后与总消耗、`/rig-demo?model=/assets/default/model3d/<npc>/model_rig.glb` 能否加载（若 dev 不提供该路径就写明）；§6 写 `tripo_cli.py` 的接口给 ART-3d-tripo-cast 用、女主角三视图缺口；§7 对照 `review_checks_model3d.md` 六条。

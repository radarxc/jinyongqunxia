# 本任务：动作原型 P1 · {{npc_name}}（`{{set_id}}`）A 字三视图设定图（AR-29 / AR-34：用 codex 出，上传立绘作参考）

本任务出图并登记，不改规格、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_imagegen.md`（本环境无 `image_gen`，用本机 Codex CLI 代出）、`tools/agents/reports/RESEARCH-anim-motion-library.md` §3（三视图：局限、提示词结构、质检）、§5.5（近侧与 L/R）、§5.6 判定 Q1；`docs/tech/09-character-rig.md` §1.3；`assets/default/prompts/rig/GUIDE.md` §1–§2。

## 作者决定
- AR-29：2D 分层部件 + CC0 动作库 + 三视图切件；具名 NPC 每人一套部件。
- AR-34（10-02 追问后）：**三视图用 codex**（改了 AR-29 原定的 Gemini），主角三视图用 `codex exec` 在本机出，可以上传立绘作参考。
- 调研报告 C5（默认）：主角和 S 级加出一张**面向右**的三视图。

## 要做的事
1. 身份参考：`{{portrait}}`（已审定立绘；缩到长边 1024 的 JPEG 再上传，中间件放 `/private/tmp/{{task_id}}/`）。
2. 出两张设定图，每张一次 `codex exec`（`-m gpt-6-astra`，`-i` 上传立绘），尺寸 **1536×1024 横幅**：
   - `sheet_L.png`：三个全身视图从左到右 `front34 | side | back34`，**都面向画面左**（未镜像时近侧为角色解剖学左侧：front34 时左肩左臂左腿离观者近；side 面向画面左边缘；back34 背对、朝左上）；
   - `sheet_R.png`：同一人、同一套衣着与配色，三个视图**都面向画面右**（把上面的 LEFT 全部换成 RIGHT），用于主角的镜像修正版。
   提示词用英文骨架（照报告 §3.3 改写，核心句照抄）：Image 1 is the approved base portrait of this character; use it ONLY for identity (face, age, body type), hairstyle and the exact costume (colors, layers, trims, belt knot position, leg wraps, shoes). TASK: a clean CHARACTER TURNAROUND MODEL SHEET for a 2D cut-out puppet rig. Exactly THREE full-body figures side by side … POSE identical in all three: neutral A-pose, arms straight and held about 20–30° away from the body so the armpits show background; palms toward the thighs; legs straight, feet shoulder-width apart, both soles on one common ground line; head level. Hands EMPTY (no weapon or prop). CONSISTENCY: same height (crown and soles aligned), same scale, same costume details in every view; Han crossed collar right-lapped (wearer's left panel over right) in every view; never mirror a view. STYLE: same refined realistic hand-painted rendering as image 1; soft diffuse light from the upper left; muted colors; crisp dark silhouette outline. LAYOUT: plain flat uniform warm light-grey background (#E6E1D8); no texture, ink wash, ground, shadow, vignette or frame; at least 6% empty margin around and between figures; orthographic eye-level view. EXCLUDE: text, labels, arrows, grids, color swatches, extra views, close-ups, duplicate figures, transparent/checkerboard background.
3. 质检（`view_image`，每张最多重出 2 次；单个视图不合格就整张重出）：
   - 恰好三个人、顺序与朝向正确、同一身高、腋下和两腿之间能看到背景、手里无物；
   - 识别锚 Q1：发髻、短褐主色、腰带色与结位、裤色、绑腿和鞋与立绘一致；
   - 右衽、不镜像；没有文字 / 网格 / 色板；背景平涂、无地面阴影。
4. 登记 `assets/default/rig/{{set_id}}/sheet/manifest.yaml`（顶层列表，字段与其他 manifest 一致：`id`（`{{set_id}}__sheet_L` / `_R`）、`file`、`category: rig/sheet`、`style: default`、`subject`、`prompt`（实际用的全文）、`tool: codex exec · image_gen`、`model: gpt-6-astra`、`created`、`size`、`sha256`、`status: candidate`、`references`（立绘路径、sha256、用途）、`notes`（视图顺序与朝向、重出次数）。PNG 原样保存，不裁不缩。
5. 每张出完清掉 `CODEX_HOME` 里的 `sessions/`、`generated_images/`、`thread_history*`（每张占 40–50 MB）。

## 约束
- 只写：`assets/default/rig/{{set_id}}/sheet/**`、本任务报告。不改 `tools/**`、规格文档、立绘。
- `CODEX_HOME` 用 `/private/tmp/{{task_id}}/codex-home`（按 `_imagegen.md` 建）。
- 每次写入 ≤ 150 行；报告 ≤ 50 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/rig/{{set_id}}/sheet --min 2 --max 4 --min-side 1000`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：两张图各重出几次、识别锚逐项结论、腋下空隙是否可见、三视图身高是否一致（量像素）；第 7 节对照上面的质检项。

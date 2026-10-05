# 本任务：动作原型 P1b · 主角·男（`npc_zhujue__ch00_m`）侧视「双腿前后错开」补充设定图（给切件管线分出独立大腿 / 小腿；协调者 2026-10-03 登记）

本任务出图并登记，不改规格、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_codex_worker.md`（codex 执行器只排队、入库，出图 runner 由追踪者在沙箱外跑）、`tools/agents/prompts/ART-rig-sheet.md`（原三视图的提示词骨架与质检项，本任务照用）、`tools/agents/reports/TOOL-rig-sheet.md` §3 / §6（侧视 `thigh_shared` 为什么只能用标准体回退：源图侧视双腿并拢、互相遮挡）、`assets/default/rig/npc_zhujue__ch00_m/sheet/manifest.yaml`（已有 `sheet_L` / `sheet_R` 的记录与上传方式）。

## 为什么做

TOOL-rig-sheet 切件时，侧视图里双腿并拢，大腿 / 小腿分不出独立部件，只能用标准体占位梯形，审核 r4 / r5 都判不通过（协调者 06:44 裁定：切件任务按原型收口，侧腿问题由本任务的新源图解决）。

## 要做的事

1. 身份参考：`assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png` 与已有的 `sheet/sheet_L.png`（缩到长边 1024 的 JPEG 再上传；中间件放 `/private/tmp/ART-rig-sheet-side/`）。
2. 出两张 **1536×1024 横幅**，每张一次出图：
   - `sheet_side_L.png`：同一人、同一套衣着与配色，三个**纯侧视**全身视图从左到右，都面向画面左：① 自然站姿但**双腿前后错开半步**（前脚在前、后脚在后，两腿之间能看到背景，膝盖微屈）、双臂略离躯干自然下垂；② 同姿势但**前腿抬起、大腿与小腿成约 100°**（走路抬腿瞬间），双臂前后摆开；③ 双脚并拢站直、双臂平举与肩同高（T 字）。三个视图同一身高、同一相机高度、无地面阴影、背景平涂浅暖灰。
   - `sheet_side_R.png`：同上三视图全部面向画面右（镜像修正版，不是把左图翻转，而是重新生成；右衽不变）。
   提示词用英文骨架，照 `ART-rig-sheet.md` 第 2 条改写：Image 1 is the approved base portrait…identity only；Image 2 is the existing turnaround sheet…match costume exactly；加一句「pure side (profile) views only; legs clearly separated with background visible between them; no overlapping limbs」。
3. 质检（每张最多重出 2 次；一个视图不合格整张重出）：恰好三个人、都是纯侧视、腿间与腋下能看到背景、姿势与第 2 条一致、识别锚 Q1（发髻、短褐主色、腰带色与结位、裤色、绑腿和鞋）与立绘一致、右衽、无文字 / 网格 / 色板、无地面阴影。
4. 登记进 `assets/default/rig/npc_zhujue__ch00_m/sheet/manifest.yaml`（追加两条，字段与已有两条一致：`id` 为 `npc_zhujue__ch00_m__sheet_side_L` / `_R`、`file`、`category: rig/sheet`、`style: default`、`subject`、`prompt` 全文、`tool`、`model`、`size`、`sha256`、`status: candidate`、`references`（立绘与 sheet_L 的路径与 sha256）、`notes` 写明用途「侧视双腿错开，供切件分出大腿 / 小腿」）。联系表一张放 `_handoff/gem/<本任务 runner 目录>/sheets/`。
5. 出完清 `CODEX_HOME` 的 `sessions/`、`generated_images/`（DISK_RULE）。

## 约束

- 只写：`assets/default/rig/npc_zhujue__ch00_m/sheet/**`、本任务报告。不改 `tools/**`、规格文档、立绘、已有的 `sheet_L` / `sheet_R`。
- 报告 ≤ 50 行：§3 写两张图各重出几次、识别锚逐项结论、腿间空隙是否可见、三视图身高是否一致（量像素）；§6 写给 TOOL-rig-sheet 后续任务的接口建议（新源图如何进切件管线）；§7 对照上面的质检项。

检查：
- `python3 tools/agents/check_assets.py assets/default/rig/npc_zhujue__ch00_m/sheet --min 4 --max 4 --min-side 1000`
- `python3 tools/lint/check_ids.py --strict`

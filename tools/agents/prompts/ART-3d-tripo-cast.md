# 本任务：3D 角色 · 用 Tripo API 生成十四书主要角色的 3D 模型与骨架（作者 AR-41，2026-10-03）

本任务出模型并登记。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本机 Codex 沙箱已开网络。

先读：`docs/decisions/author-requirements.md` AR-41 / AR-36 / AR-39；`tools/model3d/README.md` 与 `tools/model3d/tripo_cli.py`（ART-3d-tripo-avatars 写好的工具，直接用，不重写）；`tools/agents/reports/ART-3d-tripo-avatars.md`（选项、点数、踩坑）；`.agents/coord/PROD/review_checks_model3d.md`；Tripo 文档 https://developers.tripo3d.ai/zh/docs/quick-start 及 API 参考。

## 密钥

同 ART-3d-tripo-avatars：从主检出 `/Users/bytedance/Projects/jinyongqunxia/.env` 的 `tripo_key=` 读到 `TRIPO_KEY` 环境变量，绝不打印 / 写入任何文件；工作区不建 `.env`。

## 范围（主要角色 = 各书主角群，按主角精修的新基线立绘）

来源立绘是 ART-hero-refine-a / -b 重出的 `_base`（`assets/default/character/<性别>/chNN/por_npc_<id>__chNN_base.png`，manifest 里 `notes` 含「复合基线风格精修」），共约 31 位：天龙 段誉 / 乔峰 / 虚竹，射雕 郭靖 / 黄蓉，神雕 杨过 / 小龙女，倚天 张无忌 / 赵敏 / 周芷若，笑傲 令狐冲 / 任盈盈，侠客 石破天，碧血 袁承志 / 温青青，鹿鼎 韦小宝，连城 狄云 / 水笙 / 戚芳，白马 李文秀，鸳鸯 萧中慧 / 袁冠南，书剑 陈家洛 / 霍青桐 / 香香公主，飞狐 胡斐 / 程灵素 / 袁紫衣，雪山 苗若兰 / 胡一刀 / 苗人凤——以两份 hero 报告 §3 的清单为准，少的不补、多的不做。男女主角（`npc_zhujue__ch00_*`）不在本任务。

顺序：按书序；每位：`image_to_model`（立绘正面；选项沿 avatars 报告选定的高质量配置）→ 预览合格检查（完整、可辨识、头发非肉色；不合格换种子重做 1 次）→ `animate_prerigcheck` → `animate_rig`（骨架；不做动作重定向）→ 下载 `model_rig.glb` + 预览 → 登记 manifest。

## 预算

开跑前 `balance`；本任务上限 **2500 点**，或余额低于开跑时的 25% 即停；每做完 5 位把累计点数写进 `done.txt`；到上限停下，未做的列进报告 §6，等作者加点数再续。

## 落库

`assets/default/model3d/<npc_id>/`：`model_rig.glb`、`preview.png`、`manifest.yaml`（字段同 avatars 任务：id `<npc_id>__model_rig`、category `model3d`、tool `tripo-api`、model_version、task_ids、options、credits、references（立绘 path + sha256）、sha256、size_bytes、joints、status candidate、notes）。`done.txt` 记已完成的 npc_id 与点数，被中断后续做。

## 约束

- 只写：`assets/default/model3d/**`（不含两位主角的目录）、本任务报告、工作区 `done.txt`；`tools/model3d/**` 若必须修 bug 可改，但要在报告写明 diff 要点。不改 `packages/**`、`apps/**`、立绘。
- 中间件放 `/private/tmp/ART-3d-tripo-cast/`，做完清掉；不在 /private/tmp 做整仓检出。
- 每次写入 ≤ 150 行；报告 ≤ 80 行。

## 报告

`tools/agents/reports/ART-3d-tripo-cast.md`：§3 每位一行（书、npc_id、任务 ID、重做次数、点数、关节数、GLB 大小、预览路径、结论），余额前后与总消耗；§6 未做 / 失败清单与原因、工具 bug；§7 对照 `review_checks_model3d.md` 六条。

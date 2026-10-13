# 换装线交接包（2026-10-13）

`.agents/` 整个在 `.gitignore` 里，协调脚本、审核结论、原图和 R4 中间产物原本都不进 git。为了换机器接手，这里把换装线需要的那部分强制加进仓库。现状、待办与重启命令见 `docs/tech/12a-dressup-status.md`。

## 新机器上怎么还原

1. 建集成工作区（分支已推到远端）：
   `git worktree add .agents/wt/_dressup claude/dressup-3d-stage-a`
2. 协调脚本放回集成工作区（`supervise.py` 等工具在集成工作区根目录下按 `.agents/coord/...` 找它们）：
   `cp -Rp .agents/handoff/dressup-20261013/coord/. .agents/wt/_dressup/.agents/coord/`
3. 审核结论放回集成工作区（`gpt_review.py` 按已有 `r*.md` 的数量给下一轮编号）：
   `mkdir -p .agents/wt/_dressup/.agents/reviews && cp -p .agents/handoff/dressup-20261013/reviews/*.md .agents/wt/_dressup/.agents/reviews/`
4. 主检出协调区的原图放回原处：底板 manifest 的 `source_path` 指向 `.agents/coord/_dressup_review/...`，R3 审核按这个路径核对摘要。
   `mkdir -p .agents/coord && cp -Rp .agents/handoff/dressup-20261013/coord_main/_dressup_review .agents/coord/`
5. R4 续作：R4 用 `supervise.py --from start` 新建任务工作区之后，把中间产物复制进去，再让执行器从 medium 的减面接着做：
   `cp -Rp .agents/handoff/dressup-20261013/r4_wip/eq_jinzhuang/. .agents/wt/_dressup/.agents/wt/ENG-dressup-r4-jinzhuang-f2-fit/assets/default/model3d/dressup/garments/eq_jinzhuang/`

## 内容

| 目录 | 来源 | 说明 |
|---|---|---|
| `coord/_dressup/` | 集成工作区 `.agents/coord/_dressup/` | `merge_to_trunk.py`（并主干，先 `--dry-run`；不认识的参数会被当成直接执行）、`shot_receiver.py`（实拍落盘）、`align_to_plate.py`、几个历史编排脚本。未带 `shots_w0/`、`trunk_merge/` 备份等大目录 |
| `coord/_handoff/` | 同上 `_handoff/` | `rebase_task.py`：给任务工作区挪基点 |
| `coord/PROD/` | 同上 `PROD/` | 审核补充要点 `review_checks_eng.md`、`review_checks_dressup_art.md`（`supervise --checks` 用） |
| `coord/ENG-dressup-r4-jinzhuang-f2-fit/` | 同上 | R4 的 supervise 记录与两轮开工说明。状态是 STOPPED：作者 10-13 叫停 |
| `coord_main/_dressup_review/` | 主检出 `.agents/coord/_dressup_review/` | 衣图底板的 agy 原图（R3 的 `r3_plates/`、旧劲装原图等），各 manifest 的 `source_path` 引用它们 |
| `reviews/` | 集成工作区 `.agents/reviews/` | 换装线各任务各轮的 GPT 审核结论（只带 `.md`，不带对话日志 `.log`） |
| `r4_wip/eq_jinzhuang/` | R4 任务工作区 | 第 1 轮已完成的两步：抽衣壳 `extract_run_f2/`（1 个连通块，4 个开口：领口、两袖口、下摆，98,485 三角）；tpl_f2_medium 全分辨率贴合 `fit_run_f2_medium/`（翻面 0，拉伸合格率 99.05%）。另有 `r4_f2_checks/` 检查记录和两份运行日志 |
| `r4_wip/logs/1.prompt.md` | 集成工作区 `.agents/logs/` | R4 第 1 轮执行器实际收到的完整提示词 |

本机的执行器（traex）、9223 Tripo 常驻进程、agy 都是本机环境，不在仓库里。换机器后要先确认对应工具可用。

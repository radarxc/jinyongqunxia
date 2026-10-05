# AGENTS.md：天书录多代理协作入口

工程约定见 `CLAUDE.md`；作者需求见 `docs/decisions/author-requirements.md`，开头有完成状态速查；现状和下一步见 `TODO.md`；流水账见 `tools/agents/HANDOFF.md`。

## 0. 角色与执行器（AR-65 / AR-66）
- **协调者（Claude）**：只定目标、判结果，把作者原话逐字记进 AR。
- **开发监督（Claude 子代理，可选）**：排池位、处理 HOLD 和合入冲突、到浏览器实走。额度紧时可以不开，驱动和守护进程会自己转。
- **执行器**：
  - 代码、城图、特效：traex GPT-6-Astra max，回落 GPT-5.6-Sol max；
  - 内容、设计、立绘、审核：Codex gpt-6.1-sol xhigh；
  - 路由表在 `.agents/coord/executor_override.json`（gitignored）。
- **例外，由 Claude 亲自操作**：Gemini 网页出图（物品类）和 Tripo 网页建模（3D），入口见 §3。

## 1. 目录
- 集成分支工作区 `.agents/wt/_prod`（分支 `claude/production-20260930`）。主检出只同步 `TODO.md` 和 `tools/agents/HANDOFF.md`。
- 任务目录 `.agents/coord/<任务ID>/`，里面有 `supervise.out` 和 `supervise.status.json`。
- 执行日志 `.agents/logs/<任务ID>/`，审核意见 `.agents/reviews/`。
- GPT 长会话 `.agents/coord/_lines/<名>/`，说明在 `_lines/briefs/`，收件箱 `.agents/coord/_inbox/<名>.md`。
- 出图器 `.agents/coord/_handoff/gem/codex_wNN/`，作业写法见各目录的 `HANDOFF_GPT.md`。
- 人物参考图放主检出的 `.agents/coord/imagegen-reference/`，不入库。

## 2. 启动 / 恢复（在 `.agents/wt/_prod` 下）
所有后台进程都要脱离当前会话：`python3 .agents/coord/_handoff/detach_launch.py <日志> "$PWD" -- <命令>`

- **任务驱动**：`python3 -u tools/agents/supervise.py <任务ID> --max-runs N --max-reviews N --auto-merge --worker [--from start|validate|review] [--checks .agents/coord/PROD/review_checks_<类>.md]`
  - 各任务原参数见 `.agents/coord/_ops/config.json` 的 `supervise_args`；
  - 自带单例锁，同一任务只会有一个驱动。
- **运维守护进程**：`python3 -u tools/agents/ops_dispatch.py --interval 45`
  - 合入后跑 prod_check，把停滞、HOLD、冲突报到 `_inbox/ops.md`，只报告，不改状态；
  - 运维手册：`tools/agents/OPS_RUNBOOK.md`。
- **城图调度**：`python3 -u .agents/coord/_handoff/artw3/city_scheduler.py`，只管 `CITY-layouts-*`。
- **等合入后重校验**：`python3 -u .agents/coord/_handoff/after_merge_revalidate.py <依赖ID[,ID]> <任务ID> -- <supervise 参数>`
- **单任务助手**：`python3 tools/agents/step.py {start|slot|pool|wait|finish|merge|kill|status|smoke}`
- **合入冲突**：
  - `rebase_task.py <任务ID>` 挪基点；
  - 机械冲突开 Codex 短会话解（OPS_RUNBOOK §2.1），语义冲突就只起一轮解冲突返修；
  - 解完 `--from validate`。
- **GPT 长会话**：`python3 -u .agents/coord/_handoff/codex_session.py <名> <说明.md> [--add-dir DIR]`
  - 碰到容量不足或断流会自动续作；
  - 要给正在跑的会话送裁定：先结束它的 codex 子进程，再执行 `codex_session.py <名> - --resume --prompt "<裁定>"`，会自动沿用 `add_dirs.json`。
- **出图器**：在 `codex_wNN/` 目录下 `python3 runner.py`，跑在沙箱外；会话只往 `queue.txt` 加作业，不起停 runner。
- **检查**：
  - `pnpm check` 是完成定义；
  - 性能门 `pnpm check:perf` 在负载低时单独跑；
  - finish 校验和 prod_check 都要先拿信号量 `tools/agents/check_semaphore.py`，同时最多 2 个。

## 3. Skills 入口
- **Gemini 网页出图（物品、礼品、衣物换色）**
  - 手册：`.claude/skills/gemini-imagegen/SKILL.md`
  - 驱动：`tools/imagegen/gemini_g.js`，页面里是 `window.__g`
  - 踩坑记录：`tools/imagegen/README.md`
  - 前提：标签页要由 Claude 自己在 Chrome 标签组里建；只有前台可见的标签页能出图。
- **Tripo 网页建模（3D 角色、骨架、动作）**
  - 手册：`.claude/skills/tripo-web/SKILL.md`
  - JS 驱动：`tools/model3d/tripo_web.js`
  - 辅助工具：`stretch_apose.py`（A 字图拉长补偿）、`measure_heads.py`（量头身比）、`fix_anim_offset.py`（修跑步跳位）
  - 进度与交接：`.agents/coord/ART-3d-tripo-web/progress.md`
  - 密钥只放主检出的 `.env`，不得读取或打印。

## 4. 规矩摘要
- 作者原话逐字记进 AR。原著能定的不问作者；工程上有先例就照先例。
- 门禁不放宽，测试不加「高负载跳过」。功能用例可以给固定超时（先例 ENG-waitfor-timeout）；计时断言挪到 `check:perf`。
- 在 `_prod` 改了文件就立即按路径提交，不 push，不读 `.env`。对外请求用通用 UA（TianshuBot/1.0），不带作者的任何标识。

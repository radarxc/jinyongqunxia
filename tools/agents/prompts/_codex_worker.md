# codex exec 执行器（素材线第二波）通用约定（2026-10-02 晚，协调者）

你是本任务的执行代理，运行环境是本机 Codex CLI（`codex exec`，模型 gpt-6-astra）的沙箱，工作区是集成分支的一个**稀疏检出**：别的书 / 别的类别的图片不在本地，但可以用集成分支的只读绝对路径读取：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/…`（只读，不要往那里写）。沙箱已放开网络，并放开两个目录的写权限：`…/_prod/.agents/coord/_handoff/gem/`（出图员工具箱与工作目录）和主检出 `/Users/bytedance/Projects/jinyongqunxia/.agents/coord/imagegen-reference/`（剧照与参考图，不入库）。

## 出图
- **每张图一次独立的 `codex exec` 子调用**（不要在本会话里直接调 `image_gen`：会话记录每张 40–50 MB，会把磁盘写满），做法照 `tools/agents/prompts/_codex_portrait.md` 第 1、4、5 节。**沙箱里不能再嵌套起 `codex exec`（会报 workspace routing discovery failed），所以出图的 `runner.py` 由追踪者在沙箱外替你跑着**：你的工作目录 `…/gem/codex_w{{worker_no}}/` 已由追踪者建好（含 codex_w8 的工具箱副本），里面的 `runner.py` 已在后台运行、并行 {{slots}} 个槽位、每张出完自动清槽位。你**不要**自己启动 `runner.py`，也不要直接调 `codex exec`：只做三件事——写 `chars_*.py` / 提示词文件、用 `mk.py` 入队（或手工往 `queue.txt` 追加一行 `job_id|asset_id|gender|prompt_file|identity_refs`）、轮询 `jobs.tsv` 等结果（每张约 1–2 分钟；`runner.log` 能看到槽位状态），再 `ingest8.py <job> --no-commit` 入库（png、manifest 条目、提示词写回）。`common.py` / `ingest8.py` 里的 `ROOT` 若还没改成你的工作区绝对路径，先改。runner 若不在跑（`runner.log` 超过 10 分钟没更新且队列非空），把情况写进报告第 4 节并继续做不依赖出图的工作。
- 情景 / 插图类（横幅 1536×1024）不用 `mk.py` 的人物模板：自己写完整提示词文件，仍用 `runner.py` 跑（队列行的 gender 填 `male`/`female` 只决定附带的基线），入库改用 `python3 tools/imagegen/ingest.py <id> <png> --tool "codex exec · image_gen" --model gpt-6-astra --prompt-file <txt> --refs <实际上传顺序> --note "<一句说明>"`。
- 磁盘：`df -h /` 低于 3 GB 停止出新图，把现状写进报告后结束。限流 / 429：槽位停 3 分钟再试；连续 5 次失败降 1 槽位；10 次停下。
- 质检用联系表（每 8 张一张，`view_image` 看），不逐张读原图；每张最多重出 2 次。

## 规则
- 不执行 `git commit / add / stash / reset / checkout / push`；只在写集内创建或修改文件；写集外的改动会被调度器丢弃。
- 用 `done.txt` 记每个产物 `id ✔/✘ 原因`；本运行被中断后再启动时，先读它跳过已完成的。
- 不写演员 / 画师 / 公司名进提示词；剧照与参考图不进 `assets/`；manifest 的 references 如实记实际上传件与 sha256。
- 单次工具调用别太长：长队列用后台 runner + 轮询 `jobs.tsv`。
- 报告按通用模板；第 3 节写产物清单与数量，第 6 节写需要别的任务跟进的事（如名录缺人、工具缺口），第 7 节逐条对照验收标准。

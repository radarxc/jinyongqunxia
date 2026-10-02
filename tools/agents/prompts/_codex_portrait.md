# 人物立绘 · codex 出图员通用做法（2026-10-02 协调者整理自 10-02 通宵与 AR-32 批次的实际做法；ART-portrait-* 任务共用）

本执行环境是 traex 沙箱，**没有内置 `image_gen`**；每张图用本机 Codex CLI 代出，规程见 `tools/agents/prompts/_imagegen.md`（必读）。本任务已登记 `web: true`，沙箱有网络；另外放开了两个目录的写权限：
- `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/`：出图员工具箱与各出图员的工作目录（`codex_w1`–`codex_w8` 是前人的，**只读参考，不要改**）；
- `/Users/bytedance/Projects/jinyongqunxia/.agents/coord/imagegen-reference/`：剧照与参考图（主检出里，不入库）。

## 1. 工具箱（照抄 8 号出图员，已验证）

8 号出图员的工具在 `…/_handoff/gem/codex_w8/`：
- `common.py`：提示词公共段落（画风、背景、排除项、基线说明）与 `compose()` 组装；
- `chars_*.py`：每个人物一条 `C[asset_id] = dict(ref=…, version=…, stills=[…], refs_desc=…, ref_notes=…, body=[…], neg_extra=…)`，`ref` 取 `still1 / still2 / game1 / twin1 / text`；
- `mk.py <asset_id> [--refs a.jpg,b.jpg]`：组提示词、写 `blocks/`、`prompts/`，入队 `queue.txt`；
- `stage.py <书目录>/<文件名> [x0,y0,x1,y1] [--mask x0,y0,x1,y1]`：剧照缩到长边 ≤ 1024 的 JPEG 存 `staging/`，并登记 `refmap.json`；
- `runner.py`：4 槽位并行跑 `codex exec`（每张一次调用，`-i` 先身份参考、后两张同性别缩小版基线 `…/gem/baseline_small/`），结果记 `jobs.tsv`、图在 `out/`，每张出完自动清该槽位的 `sessions/`、`generated_images/`、`thread_history*`（磁盘规则 `…/gem/DISK_RULE.md`）；限流自动退避；
- `ingest8.py <job_id> --no-commit`：调 `tools/imagegen/ingest.py`（带 `--refs` 实际上传顺序）入库、写 manifest 的 references、把提示词写回该人提示词文件的「## Gemini 提示词」段（旧段改名留作历史，frontmatter 加 `classic_ref` / `reference_upload` / `codex_prompt_rev`）、记 `done.txt`、删 staging 中间件；
- `csheet.py` / `qasheet.py` / `facesheet.py` / `gridsheet.py`：拼联系表（每 8 张一张，缩略 256×384，标人物名）。

做法：
1. 把上面这些脚本**复制**到你自己的目录 `…/_handoff/gem/codex_w{{worker_no}}/`（不要在 codex_w8 里跑）。改三处：
   - `common.py`、`ingest8.py` 里的 `ROOT` 改成**你当前工作区的绝对路径**（`pwd`，即 `.agents/wt/{{task_id}}`），`MAIN` 保持主检出路径；
   - 自建 `index.json`：只放本任务的 asset_id，字段 `path`（提示词文件的绝对路径，在你的工作区里）、`name`、`gender`、`output`、`manifest`、`book`，都从提示词文件 frontmatter（`asset_id` / `name` / `gender` / `output` / `manifest` / `book`）取；
   - `runner.py` 的 `NSLOTS` 按本任务说明的槽位数设。
2. `python3 runner.py > runner.out 2>&1 &` 放后台跑；之后每入队一张就自动开始；`STOP` 文件存在就收尾退出，`EXIT_WHEN_EMPTY` 存在且队列空就退出。
3. **每张图一次 `codex exec`**，模型 `gpt-6-astra`，提示词从标准输入传（runner 已这样做）。磁盘低于 3 GB 时 runner 自动停；你也要 `df -h /` 看。

## 2. 提示词口径（AR-31 / AR-32，必须遵守）
- 2:3 竖幅、单人、全身、成年、头正、平视；去 AI 化那一句必须有：「手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美」；**禁止幼态**（童颜、娃娃脸、少年身材、大头小身）；不写演员名；不要文字、水印、多人；右衽。
- **带剧照的人**（`ref=still1/still2`）：剧照放最前，两张同性别基线放最后；写明「第 1(–2) 张是该角色经典影视造型的剧照：借鉴发型、服饰、配色、标志道具、气质和面部特征，让人一眼认出是这个角色；必须重新绘制成项目画风，不要照片质感，不照搬剧照的构图、光影、背景和姿势，不做成照片修图」（`common.py` 的 `REF["still1"]` 已写好）。
- **只靠文字的人**（`ref=text`）：只上传两张基线；人物描写按原著外貌要点与现有提示词文件里的「## Gemini 提示词」段改写，补去 AI 化与禁幼态。
- **同一人跨书 / 跨年龄**：先有锚点图（本轮新出的或已入库的新版），把锚点图作第一张 `-i`（`ref=twin1` 的写法可改成「同一人、年长 N 岁」），只用新图，旧图脸不对。

## 3. 剧照（只在任务说明允许下载时）
- 只下载公开网页上的静态图片（`curl` 带浏览器 UA、`Referer` 设为所在页面），不登录、不付费、不碰需要登录的站点；每张 ≤ 1 MB，缩到长边 ≤ 1024 再上传。
- 存到主检出 `/Users/bytedance/Projects/jinyongqunxia/.agents/coord/imagegen-reference/identity-20261002/<书目录>/`，文件名 `<角色拼音>_<年份>_<演员拼音>_<来源>.jpg`；同目录 `SOURCES.md` 每张一条：内容、原始图片网址、所在页面、页面标题、下载时间、处理方式、**演员核实依据**（页面图注或演员表里的「X 饰 Y」原文）。没有可靠核实依据的图不用。
- 剧照**不入库**，不复制进 `assets/`。manifest 的 references 只记它在主检出里的相对路径与 sha256（`ingest8.py` 已做）。

## 4. 质检（为了省上下文，不逐张读原图）
每出满 8 张拼一张联系表用 `view_image` 看；下列情况必须重出（每张最多 2 次，仍不行就记下跳过）：多人；肢体 / 手指错乱；头脚被裁；**幼态**；性别 / 年龄不符；文字水印；背景不是浅暖灰纸底加淡水墨；画风像照片、像剧照修图、油画或 CG；构图和剧照一样；认不出是这个角色；画风与基线不一致。
重出时改 `chars_*.py` 里的描写再 `mk.py`（job 自动 r2 / r3）。

## 5. 入库与提交
- 合格的用 `python3 ingest8.py <job_id> --no-commit` 入库（png 居中裁成 2:3、缩到 1024×1536，manifest `status: candidate`，`tool` 写 `codex exec · image_gen（…）`、`model: gpt-6-astra`、references 如实）。
- **不要执行 git commit / add / stash 等改变仓库状态的命令**：调度器在校验后按写集提交。改动只能落在本任务的写集里（人物 png、同目录 manifest.yaml、该人提示词文件）。
- 不要跑 `tools/portrait/build_portraits.py`，协调者集中跑。
- `done.txt` 每行记 `asset_id ✔/✘ 原因`，被打断可从它续做。

## 6. 报告（≤ 40 行）
第 3 节写：每个人取的版本（这里可以写演员和版本名，提示词里不写）、完成 / 跳过与原因、重出次数、限流次数；最后一张联系表与「新旧对比」联系表的路径（放在你的 `codex_w{{worker_no}}/sheets/`）。第 7 节逐条对照任务说明的验收标准。

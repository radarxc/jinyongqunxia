# 协调者交接文档（2026-09-29 晚）

> 给下一位协调者（任何 agent）的完整交接。读完本文件、`SUPERVISOR.md`、`FOLLOWUPS.md` 三份就能接手，不需要之前的聊天记录。
> 当前状态快照随时可重跑：`python3 tools/agents/status_snapshot.py`（加 `--all` 看含依赖未满足的）。

## 0. 一句话现状

仓库 `/Users/bytedance/Projects/jinyongqunxia`，分支 `claude/vigilant-wright-2unuk1`（远超 origin，**未 push，push 前必须问作者**）。两条线并行：
1. **文档线**：作者的阴阳理论 AR-18 已落地（NYY），12 册武学图鉴的性质落地（NR4-*）进行中：康熙、古龙、五岳、乾隆、通行、道家、侠客碧血、倚天、补录已合入，其余 3 册在"GPT 审核 → 返修"循环里；之后是 LINT-outlets → 按书界同步 NR4S-NN → 最终汇总 NAu-final。
2. **素材线**：默认风格包 `assets/default/` 的基线图由作者在审批页逐张审批；城镇改为程序化生成（TOWN-*），招式演示改为图层动画（ART-R3-vfx）；几张返修图 GPT 审核已过、停在工作区等作者看。

## 1. 工作方式（硬规则）

### 1.1 角色分工（作者规定）
- **协调者（你）只调度**：改 `tools/agents/tasks.json`、`tools/agents/prompts/*.md`、`SUPERVISOR.md`、本文件、`FOLLOWUPS.md`、调度脚本；照录作者原话进 `assets/default/STYLE.md` / `docs/decisions/author-requirements.md`。**不写文档、不出图、不写业务代码、不做质量判断**。
- **执行器**：文档 / 代码 → traex（`~/.local/bin/traex`，模型 GPT-5.6-Sol）；图片 → 本地 Codex CLI（`/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`，模型 gpt-6-astra，内置 `image_gen`）。代码任务（TOWN-render、ART-R3-vfx）也用 Codex。
- **推理强度一律最高 `ultra`**（作者 2026-09-29）：tasks.json 默认、step.py 兜底、gpt_review 默认都是 ultra；续作不降档。Codex 只接受 none/minimal/low/medium/high/xhigh/max/ultra，作者说的"extra"= ultra。
- **审核也交给 GPT**（作者 2026-09-29）：`tools/agents/gpt_review.py <ID> --checks <要点文件>` 在任务工作区只读跑 gpt-6-astra ultra，结论在 `.agents/reviews/<ID>.rN.md` 首行 `VERDICT: PASS|FAIL`。监督员只做机械核对并转述结论。
- **素材任务先给作者看图再合入**（作者 2026-09-29）：ID 以 `ART`（和 TOWN 的素材任务）开头的任务，GPT PASS 后**不 finish、不 merge**，把图放上审批页，作者同意后由协调者 `step.py finish <ID>` + `merge <ID>`。

### 1.2 每个任务的流程（监督员按 `SUPERVISOR.md`）
`step.py start <ID> [--bin codex --model gpt-6-astra --effort ultra] --no-probe` → 后台 `wait` → `finish <ID> --no-commit`（校验）→ `gpt_review.py`（FAIL 则 `start … --note <返修说明>` 续作再审，第 3 轮后仍 FAIL 且只剩小问题就停下汇报）→ PASS → 文档任务 `finish` + `merge`；素材任务停下等作者。
- 一个任务一个 Claude 监督子代理（`general-purpose`，后台）。监督员提示词范例见 §6。
- 并发：文档池 8、素材池 8（`step.py` 按 ID 前缀 ART 分池；TOWN 的素材任务目前算文档池——如需分池，在 `step.py pool_of()` 加前缀）。满了 `step.py slot <ID> --max-min 25` 等 SLOT-FREE。
- 已 merge 的任务不能 `start --force`；要补做就开新 ID（返修轮次 R1/R2/R3…）。
- 主检出有未提交改动会阻塞别人的 merge：**协调者改完调度文件立刻 commit**。
- 监督员临时文件放 `.agents/coord/<ID>/`（`.agents/` 在 .gitignore，重启不丢）。**不要用 /private/tmp**（2026-09-29 19:33 重启把它清空过一次）。
- 监督员被网络问题杀掉（SSL / ENOTFOUND / stalled）时，用 SendMessage 给同一 agentId 发"已恢复，请从 status 与最新审核结论接续"即可，执行器进程通常还在跑。

### 1.3 禁止项
- 不 `git push`（每次都要问作者）；不在主检出 `reset/checkout/stash`；不读 `.agents/logs/*.log` / `*.last.md`。
- 子代理说"被权限拒绝，请你代做"→ 不代做，报告作者（权限洗白）。`merge` 被系统以 "Merge Without Review" 拦下时也一样：作者已选"先给我看图再合入"。
- 不用演员肖像、在世画师风格名、具体影视 / 游戏作品的设计作参考（tech/07 §2.9 / §9）。作者提"港版 / 育碧 / 著名游戏"只取气质方向，提示词里不写作品名；作者原话可照录进 manifest notes。

## 2. 作者决定汇总（原文都已照录在仓库里）

| 日期 | 决定 | 原文所在 | 落实 |
|---|---|---|---|
| 09-29 | AR-18 阴阳理论（内功按主修经脉；正逆周天定用途；阳掌可经劳宫 / 合谷 / 后溪 / 外关出招） | `docs/decisions/author-requirements.md` AR-18；`tools/agents/prompts/NYY-yinyang.md` | NYY 08ee6b6 → NR4-* |
| 09-29 | 素材：二进制入库 `assets/<style>/`；默认风格按类别；先出基线、作者审批、再批量；出图用本地 GPT CLI | `assets/default/STYLE.md` 文首 | ART-B-*、审批页 |
| 09-29 | 城市图 45 度视角，主角可在城市地图上移动 | STYLE.md；tasks.json ART-B-town vars | TOWN-* |
| 09-29 | 建筑分两种：立绘式；拼到城市地图上的要 45 度 | STYLE.md 表 | `building`（立绘式，已通过 2 张）/ `building-map`（TOWN-buildings） |
| 09-29 | 六脉神剑类是内力凝缩的气剑，不是水墨；后又要求"线性的、持续的" | STYLE.md；tasks.json ART-R2-vfx vars；审批 DB | ART-R2-vfx（PASS 未合入） |
| 09-29 | 城镇不能纯生图：参考年代平面图生成坐标 → 分区填功能建筑 → 贴片渲染底图 → 贴建筑 | tasks.json TOWN-design vars / prompts/TOWN-design.md | TOWN-design 进行中 |
| 09-29 | 特效演示"太蠢了，跟渲染的图完全不一样" → 用生成图的图层做动画 | prompts/ART-vfx-layers.md | ART-R3-vfx 进行中 |
| 09-29 | 小龙女加白手套、佩剑、铃铛（书中经典形象） | tasks.json ART-R1-female vars | ART-R1-female 进行中 |
| 09-29 | 外放招式分两部分做：白底效果多帧图（Python 抠 PNG）+ 发出方图（掌 / 剑加手），程序按方向叠加成整图，多帧过渡成动效 | STYLE.md 文首与招式行；prompts/VFX-*.md | VFX-design / VFX-tool / VFX-plates 已登记，ART-R3-vfx 结束后启动 |
| 09-29 | 审核也用 GPT CLI；推理强度最高；素材先看图再合入；修完一批一起看 | SUPERVISOR.md §3 | 已生效 |
| 09-26 | "调用 traex-cli 来做，不要自己做"；慢任务按单元拆并行 | 本文件 §1.1 | 已生效 |

**审批记录**（作者逐张结论 + 原话）：`assets/default/STYLE.md` 文末"审批记录"（第 1、2 轮）。

## 3. 审批页（作者看图的地方）

- 地址 **https://claude.ai/artifact/NhZGycmwB5QdyiwntJGkyG**（旧页 MBnPCM43… 已废）。私有，只有作者能开。
- 生成：`python3 tools/review/build.py` → `.agents/coord/review/{baseline-review.html, img/, vfx/, files.json}`；用 Artifact 工具 `publish`，`url` 填上面地址，`file_path` = `.agents/coord/review/baseline-review.html`，`root` = `.agents/coord/review`，`files` = files.json 里以 `img/` 开头的路径（demo HTML 已内嵌进页面，不用传）。
- `tools/review/build.py` 里 `WT_OVERRIDE` 指向**未合入**任务的工作区（现指 ART-R2-male 的男性人物、ART-R2-vfx 的招式），让作者先看图；`NOTES` / `R1` / `NOTES.update` 是每张卡片的说明与"请你判断"问题；`PENDING` 是返修中的占位卡。改完重跑、重发布。
- 读作者结论：ArtifactData `list` 集合 `reviews`（doc id = 素材 ID；字段 decision approve/revise/reject、comment、sha 前 16 位、updatedAt）。`sha` 与当前图不符 = 审的是旧图。用 `ArtifactData list … out_dir=<目录>` 导出后：`python3 tools/agents/apply_reviews.py <目录> [--write]` 把 approve→approved、reject→rejected 写进 manifest，并打印可贴进 STYLE.md 审批记录的表。
- 演示动画：页面把 `manifest.code` 指向的 index.html 内嵌为 `<iframe sandbox="allow-scripts" srcdoc>`，所以演示必须自包含（不联网、不访问 parent）。

**当前等作者审的**：小龙女（ART-R1-female 工作区，PASS）、萧峰（ART-R2-male 工作区，PASS）、令狐冲（同上，R1 版）、六脉神剑图（ART-R2-vfx 工作区，PASS）、倚天剑与降龙十八掌图（已合入，candidate）。作者同意后：`step.py finish ART-R2-male && step.py merge ART-R2-male`（会把 ART-R1-male 的令狐冲一起带入；**ART-R1-male 本身不要合**）；ART-R2-vfx 同理，但 ART-R3-vfx 正以它的工作区为起点重做演示，合入顺序：R2-vfx 先、R3-vfx 后。

## 4. 各线状态与下一步

### 4.1 文档线：AR-18 落地
- **NR4-\***（12 册，验收 `tools/agents/check_nr4_unit.py <图鉴>` 三项计数清零）：已合入 kangxi 62268d4、gulong 4919d3a、wuyue d11695e、qianlong a99b5dc、general 4c23117、daojia ebdd0be、xiakebixue fe19164、yitian 778cbda、bulu e70cde6。未合入 3 册（shaolin、wujue、xiaoyao）见快照；多数停在"第 3 轮 FAIL 只剩小问题"，协调者已逐个批准再修一轮（只改剩余项）。
- 之后：**LINT-outlets**（已登记，deps=全部 NR4）修检查脚本两处（route_outlet_points 剥离位移 / 内功出口；check_route_unique_for 扩到普通路线），修后重测 12 册；若出现新命中另派任务。
- 之后：**NR4S-NN 按书界同步**（模板 `prompts/NR4S-book.md`，尚未登记任务）：汇总各 `reports/NR4-*.md` 的"交其他任务"按书分发，写集 `chapters/NN` + `npcs-chNN`。已知条目在 `FOLLOWUPS.md`"NR4 阶段"。
- 最后：**NAu-final**（deps 62 个，提示词 `prompts/NAu-final.md`）收拢全部报告的提案与交办、统一公式、更新计数、同步作者的素材 / 城镇 / 气剑决定到 tech/07、tech/06、author-decisions、TODO。
- 作者待定（默认值已落地）：AR-18a 冲脉 / 带脉不投票；AR-18b 后溪不入外放白名单；条件加成公式默认乘法；其余见 `FOLLOWUPS.md`。

### 4.2 素材线
- **城镇管线**（695e1de）：TOWN-design（跑中，traex）→ TOWN-tiles、TOWN-buildings（Codex 出图）与 TOWN-render（Codex 写 `tools/town/`，先出占位预览）并行 → TOWN-assemble。step.py 不检查 deps，**协调者要等 TOWN-design 合入后再启动后三个，等三个都合入再启动 assemble**。设计要点：沿用 tech/02 的 1 m 格、45°/30°、2:1 菱形（默认 64×32 px）；城市规格手写（历史平面图）+ 生成器填充；大理 96×96、临安 160×160（默认）。
- **招式演示**：ART-R3-vfx（跑中）把两张图拆透明图层做动画，PNG 不改；验收看合成图与原图的平均绝对差、代码里不画造型。
- **外放招式新管线**（作者 09-29 晚定）：VFX-design（设计文档 + 数据格式：效果帧序列、发出方图、方向 / 锚点、过渡参数）→ VFX-tool（`tools/vfx/`：白底抠图切帧、按方向合成、多帧过渡出动效）与 VFX-plates（降龙、六脉的效果帧序列与发出方图样例）→ 之后按此批量做全部外放招式。ART-R3-vfx 完成后再启动 VFX-plates（同写集）。
- **小龙女**：ART-R1-female（跑中）加白手套、佩剑、金铃索。
- 作废：ART-B-town、ART-B-bldmap（工作区保留作参考，不合入）。
- 素材任务通用提示词：`ART-baseline.md`（基线）、`ART-rework.md`（返修，vars.round）、`TOWN-assets.md`、`ART-vfx-layers.md`。

### 4.3 尚未处理的作者请求
- 作者要求文档写作也可以换 GPT CLI？——**没有**，作者只说审核和出图用 GPT CLI；文档仍用 traex。若作者要求，在监督员提示词里把 start 命令换成 `--bin <codex> --model gpt-6-astra`。

## 5. 已知问题与坑
- `run.py` 防截断检查已跳过二进制（2f2c8bc）；文本文件缩短 >15% 仍会拦，预期缩短的文件在 validate 里加 `shrink_exempt`。
- GPT 审核会把"报告里的哈希 / 字节数 / 行数写错"判 FAIL，很多轮次只剩这类笔误；按规则再修一轮即可，不要自己代改。
- image_gen 画不出度级精确的 45° 投影：审核口径已放宽为"目视一致"；精确投影靠 TOWN 管线。
- `--checks` 传路径时文件必须存在，否则 gpt_review 直接报错（c1d4b0c）。
- 单元名带连字符的册（xiake-bixue）在 tasks.json 里参数要写全名。
- 网络不稳时监督员会批量死掉，执行器不受影响；逐个 SendMessage 恢复。

## 6. 监督员提示词范例（复制改 ID 即可）

```
你是任务 <ID>（<标题>）的监督代理。先读 /Users/bytedance/Projects/jinyongqunxia/tools/agents/SUPERVISOR.md 并遵守；下面是补充规定。
- 仓库 /Users/bytedance/Projects/jinyongqunxia，分支 claude/vigilant-wright-2unuk1；命令都在仓库根目录运行；临时文件放 .agents/coord/<ID>/。
- 任务提示词：python3 tools/agents/run.py prompt <ID>
1. 执行器：文档 → `step.py start <ID> --no-probe`（traex Sol ultra）；图片 / 代码 → `step.py start <ID> --bin /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex --model gpt-6-astra --effort ultra --no-probe`。续作一律 --effort ultra。
2. 并发满了：后台 `step.py slot <ID> --max-min 25` 等 SLOT-FREE 再 start。
3. 等待与停滞按手册。
4. finish --no-commit 通过后跑 `gpt_review.py <ID> --checks <要点文件>`，只读 .agents/reviews/<ID>.rN.md；FAIL → 返修说明进 --note 续作再审；PASS → 文档任务 finish + merge / 素材任务停下等作者。第 3 轮后仍 FAIL 只剩小问题就停下汇报。你自己不看图、不做质量判断。
5. 不改 docs/ assets/；权限被拒不绕过；不 push/reset/checkout/stash；不读 .agents/logs 下 *.log。
汇报 ≤60 行：运行表、产出、要点、需作者确认、交其他任务、异常。
```

## 7. 文件索引
- 调度：`tools/agents/{tasks.json, run.py, step.py, gpt_review.py, apply_reviews.py, check_assets.py, check_nr3_unit.py, check_nr4_unit.py, status_snapshot.py, SUPERVISOR.md, FOLLOWUPS.md, HANDOFF.md}`；提示词 `tools/agents/prompts/`；任务报告 `tools/agents/reports/<ID>.md`；审核结论 `.agents/reviews/`。
- 审批页：`tools/review/{build.py, page.tpl.html}`。
- 素材：`assets/README.md`、`assets/default/STYLE.md`（作者原文 + 规则 + 审批记录）、`assets/default/baseline/<类别>/manifest.yaml`、`assets/default/prompts/<类别>.md`。
- 规则文档：`docs/00-canon.md`、`docs/design/21-meridian-flow-and-moves.md`、`docs/design/05-martial-arts-system.md`、`docs/design/15-meridians-and-acupoints.md`、`docs/tech/02-rendering.md`、`docs/tech/07-asset-generation.md`。

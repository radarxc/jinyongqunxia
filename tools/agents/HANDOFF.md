# 协调者交接文档（2026-09-29 晚；2026-09-30 起的变更见文末 §9，**与前文冲突处以 §9 为准**）

> 给下一位协调者（任何 agent）的操作手册。**先读 `TODO.md` §8**（整体规划、已做、坑、待做），再读本文件、`SUPERVISOR.md`、`FOLLOWUPS.md`，不需要之前的聊天记录。
> 当前状态快照随时可重跑：`python3 tools/agents/status_snapshot.py`（加 `--all` 看含依赖未满足的）。

## 0. 一句话现状

仓库 `/Users/bytedance/Projects/jinyongqunxia`，分支 `claude/vigilant-wright-2unuk1`（远超 origin，**未 push，push 前必须问作者**）。两条线并行：
1. **文档线**：作者的阴阳理论 AR-18 已落地（NYY），12 册武学图鉴的性质落地（NR4-*）进行中：康熙、古龙、五岳、乾隆、通行、道家、侠客碧血、倚天、补录、五绝已合入，其余 2 册（少林、逍遥）在"GPT 审核 → 返修"循环里；之后是 LINT-outlets → 按书界同步 NR4S-NN → 最终汇总 NAu-final。
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
- **NR4-\***（12 册，验收 `tools/agents/check_nr4_unit.py <图鉴>` 三项计数清零）：已合入 kangxi 62268d4、gulong 4919d3a、wuyue d11695e、qianlong a99b5dc、general 4c23117、daojia ebdd0be、xiakebixue fe19164、yitian 778cbda、bulu e70cde6、wujue f36a8a7。未合入 2 册（shaolin、xiaoyao），状态见 §8；多数停在"第 3 轮 FAIL 只剩小问题"，协调者已逐个批准再修一轮（只改剩余项）。
- 之后：**LINT-outlets**（已登记，deps=全部 NR4）修检查脚本两处（route_outlet_points 剥离位移 / 内功出口；check_route_unique_for 扩到普通路线），修后重测 12 册；若出现新命中另派任务。
- 之后：**NR4S-NN 按书界同步**（模板 `prompts/NR4S-book.md`，尚未登记任务）：汇总各 `reports/NR4-*.md` 的"交其他任务"按书分发，写集 `chapters/NN` + `npcs-chNN`。已知条目在 `FOLLOWUPS.md`"NR4 阶段"。
- 最后：**NAu-final**（deps 62 个，提示词 `prompts/NAu-final.md`）收拢全部报告的提案与交办、统一公式、更新计数、同步作者的素材 / 城镇 / 气剑决定到 tech/07、tech/06、author-decisions、TODO。
- 作者待定（默认值已落地）：AR-18a 冲脉 / 带脉不投票；AR-18b 后溪不入外放白名单；条件加成公式默认乘法；其余见 `FOLLOWUPS.md`。

### 4.2 素材线
- **城镇管线**（695e1de）：TOWN-design（跑中，traex）→ TOWN-tiles、TOWN-buildings（Codex 出图）与 TOWN-render（Codex 写 `tools/town/`，先出占位预览）并行 → TOWN-assemble。step.py 不检查 deps，**协调者要等 TOWN-design 合入后再启动后三个，等三个都合入再启动 assemble**。设计要点：沿用 tech/02 的 1 m 格、45°/30°、2:1 菱形（默认 64×32 px）；城市规格手写（历史平面图）+ 生成器填充；大理 96×96、临安 160×160（默认）。
- **招式演示**：ART-R3-vfx（已停，见 §8）把两张图拆透明图层做动画，PNG 不改；验收看合成图与原图的平均绝对差、代码里不画造型。
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

## 8. 停机快照（2026-09-29 23:20，作者要求停下所有工作并交接）

所有监督子代理已随本会话结束；执行器进程已全部终止（少林的第 5 轮 GPT 审核在停机前跑完，PASS）。主检出干净，HEAD = 本文件所在提交。**接手第一步**：`python3 tools/agents/status_snapshot.py`，然后按下表逐项处理。每个任务重新起一个监督子代理（§6 模板），告诉它"从下表的下一步接着走"。

| 任务 | 停机时状态 | 工作区 | 下一步 |
|---|---|---|---|
| **NR4-shaolin** | 第 5 次续作已结束（只把 1386 行"脊中"改"肾俞"），`finish --no-commit` 通过，10 项检查全过；**r5 审核 PASS**（`.agents/reviews/NR4-shaolin.r5.md`，停机前跑完） | 未提交，基点 fbd9b2a | 无需再审：`step.py finish NR4-shaolin` → `merge NR4-shaolin`，合入后主检出跑 `check_nr4_unit.py docs/design/catalog/skills-shaolin.md` 确认 0/0/0 |
| **NR4-xiaoyao** | 第 4 次续作已自行结束（退出码 0，修 r3 三项：小无相功路线补任督躯干段、水榭飞刀恢复末三段腕骨→外关→阳池、报告一致性），未校验、未审核 | 未提交，+108/−58 | `git -C .agents/wt/NR4-xiaoyao diff --stat` 核对 → `check_nr4_unit.py docs/design/catalog/skills-xiaoyao.md` → `finish --no-commit` → `gpt_review.py NR4-xiaoyao --checks .agents/coord/NR4-xiaoyao/review_checks.md`（r4）→ PASS 后 finish + merge |
| **TOWN-design** | 第 1 次校验通过、r1 FAIL（7 条：+z 方向与 tech/02 相反、场景尺寸按米制方格而非六角轴槽、大理寺塔区 / 衙门区放不下、临安分区越出城墙、schema 裸 map 与日期未引号、PCG32 与采样规则未冻结、宋套件缺酒楼、大理缺可定位平面图依据且小塔年代未标原创、报告不如实）；第 2 次续作（`.agents/coord/TOWN-design/note_r2.md`）中途被杀，三份 YAML 与 22 号文档有半成品改动 | 未提交，5 个未跟踪文件（22 号文档 790 行、schema 286、city_dali 265、city_hangzhou 289、报告 91） | 先 `yaml.safe_load` 三份 YAML、`grep -c '^\`\`\`'` 查围栏；以 note_r2.md 为底写明"上次已改到第 N 条"续作 `start TOWN-design --no-probe --note …`（traex Sol ultra）→ `finish --no-commit` → `gpt_review.py TOWN-design --checks .agents/coord/TOWN-design/review_checks.md`（r2）→ PASS 后 finish + merge。合入后启动 TOWN-tiles、TOWN-buildings、TOWN-render（Codex），三者合入后 TOWN-assemble |
| **ART-R3-vfx** | 第 1 次产出完整（8 层 RGBA、layers.json、两个内嵌 WebP 的演示、MAE 降龙 0.72 / 六脉 0.0004）；`finish --no-commit` 曾因行数守卫误报未过（**已在 tasks.json 加 `shrink_exempt`**）；r1 FAIL 仅 1 项：降龙 palm_glow 划入了掌外龙身，0.55 s 帧露拼片；第 2 次续作（`.agents/coord/ART-R3-vfx/resume_note_2.md`，收窄 palm_glow）中途被杀 | 未提交，基点 695e1de，含半成品 | `git -C .agents/wt/ART-R3-vfx status --short` 核对第 2 次触碰的文件（palm_glow / dragon_body 层、composite、两个 index.html、manifest、报告）；用 resume_note_2.md 续作（Codex gpt-6-astra ultra）→ `finish --no-commit` → `gpt_review.py ART-R3-vfx --checks .agents/coord/ART-R3-vfx/review_checks.md`（r2）→ PASS 后**先给作者看**，不 finish / merge。待定：`layers/generation/` 与 composite / peak（约 20 MB 中间件）是否入库；`prompts/vfx.md` §7 图层规则要限定为"当前两张图的演示"，后续外放招式按 VFX-* 新管线 |
| **VFX-design** | 第 1 次刚启动 2 分钟被杀，工作区无产出 | 空 | 直接 `step.py start VFX-design --no-probe`（traex Sol ultra），要点文件已备：`.agents/coord/VFX-design/review_checks.md`。合入后启动 VFX-tool（Codex）；VFX-plates 等 ART-R3-vfx 也处理完再启动 |
| **ART-R1-female** | r2 PASS，等作者审小龙女新图（已在审批页） | 未提交 | 作者通过 → `finish ART-R1-female` + `merge`；要改 → 原工作区 `start … --note` |
| **ART-R2-male**（含 R1 的令狐冲） | r3 PASS（ultra 重审），等作者审萧峰、令狐冲 | 未提交 | 作者通过 → `finish ART-R2-male` + `merge`（**ART-R1-male 不合**，它的令狐冲随 R2 带入） |
| **ART-R2-vfx** | r4 PASS，等作者审六脉神剑线性剑气图 | 未提交 | 作者通过 → `finish ART-R2-vfx` + `merge`，**先于** ART-R3-vfx |
| ART-B-town / ART-B-bldmap | 作废（改程序化生成），工作区保留作参考 | 未提交 | 不合入；TOWN-design 读过它们后可 `git worktree remove`（或留着） |
| 审批页 | 版本 4：小龙女第 3 轮、萧峰 R2、令狐冲 R1、六脉 R2、倚天剑 R1、降龙 R1 待审 | — | 作者审完：`ArtifactData list reviews` 导出 → `apply_reviews.py <dir> --write` → 记 STYLE.md 审批记录 → 按结论合入或开返修任务 |

已合入待启动：**LINT-outlets**（deps 全部 NR4，少林、逍遥合入后即可启动，traex Sol ultra）→ 之后登记并启动 **NR4S-NN**（模板 `prompts/NR4S-book.md`，条目取 `FOLLOWUPS.md`"NR4 阶段"）→ **NAu-final**。

## 9. 接手记录（2026-09-30 起）——与前文冲突处以本节为准

### 9.1 作者新指示（原话，2026-09-30）
- 「阅读TODO内容，继续完成任务。注意，我用其他Agent完成了许多工作，你要根据todo继续推进完成。你负责规划、拆解和准出，任务的执行/图像生成/多模态校验调用gpt cli(gpt 6 astra ultra 和 extra high）来完成。」
- 「调用gpt，不要调用traex cli，我有gpt」

### 9.2 落实
- **执行器一律是本机 GPT CLI**（Codex，`/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`，模型 `gpt-6-astra`）：文档、代码、出图、审核都走它；**不再调用 traex**。`tasks.json` defaults 与 `step.py` 默认值已改（5412878），`step.py start <ID>` 不带参数就是 Codex gpt-6-astra ultra。
- **推理强度只用两档**：执行 / 出图 / 返修 `ultra`；审核（含多模态校验）默认 `xhigh`，设计文档与终审类任务的审核用 `ultra`（`supervise.py --review-effort`）。
- **协调者的职责**：规划、拆解（登记任务、写提示词与审核要点）、准出（读审核结论 + 机械核对后 `finish` + `merge`）。不写文档正文、不出图、不写业务代码。
- **监督方式**：不再为每个任务起 Claude 监督子代理，改用脚本 `tools/agents/supervise.py <ID> [--note …] [--checks …] --detach`：`start → wait（停滞 / 超时自动续作）→ finish --no-commit → gpt_review → FAIL 自动把审核意见整理成续作说明返修再审（默认最多 3 轮）→ READY`。状态在 `.agents/coord/<ID>/supervise.status.json`，过程在同目录 `supervise.log`。终态 `READY`（待准出）/ `HOLD-REVIEWS`（3 轮仍 FAIL，协调者裁定）/ `HOLD-RUNS` / `ERROR`。驱动进程脱离终端运行，会话断了也不受影响；重新运行同一命令会自动接入（执行器在跑就接着等；已跑完用 `--from validate` 或 `--from review`）。`tools/agents/wait_any.py ID…` 等一组任务里任意一个进入终态。
- **准出口径**：`READY` = 调度器校验通过 + GPT 审核 `VERDICT: PASS`。协调者再做机械核对（写集范围、`git diff --stat`、关键检查命令在主检出复跑）后 `step.py finish <ID>` + `merge <ID>`；一批合入后在主检出跑全量检查。素材任务（ART / TOWN 素材 / VFX-plates）`READY` 后**不合入**，等作者看图。
- **审核要点文件**放 `.agents/coord/<ID>/review_checks*.md`（NR4S 共用 `.agents/coord/NR4S/`）。口径：正文 / 数据 / 代码 / 图片有任何不到位判 FAIL；报告里不影响结论的纯笔误只列出、不单独判 FAIL。

### 9.3 审批页
- 旧审批页 `https://claude.ai/artifact/NhZGycmwB5QdyiwntJGkyG` 是别的会话 / 账号发布的，本会话读不到（artifact not found），其数据库里作者点过的结论也读不到。
- 处理：下一批素材就绪后用 `tools/review/build.py` 重新生成，在本账号**新发布**一页（新地址登记在这里），请作者在新页上重新点结论（或直接在对话里说）。

### 9.4 进度（随做随更新）
- NR4 十二册全部合入：少林 364c030、逍遥 e1771ac；全部 25 册图鉴 `check_nr4_unit.py` 为 0/0/0。
- 已合入：LINT-outlets（f1c683e）、NR4S-rules（e2ded88）、NR4S-01…14（09 返修中，其余已合入或正在合入）、VFX-design（a9f804b）。
- 已登记并在跑：NR5-<15 单元>（显式普通路线的完全相同 / 高相似配对，070b49f）；NAu-final 拆分的 NAuF-sysA / NAuF-rules / NAuF-lint / NAuF-book-NN（各书界 NR4S 合入后逐个启动）；VFX-tool。
- 还没启动（等依赖）：NAuF-cat-<12 单元>（等 NAuF-rules 与对应 NR5）、NAuF-assets（等 TOWN-design）、NAuF-canon（等 NR4S 全部、TOWN-design）、NAu-final 收口（等全部 NAuF / NR5）；VFX-plates（等 VFX-tool 与 ART-R3-vfx）；TOWN-tiles / TOWN-buildings / TOWN-render（等 TOWN-design）。
- 素材线在跑：TOWN-design（r2 仍 FAIL，返修中）、ART-R3-vfx（r2 FAIL 后返修，r3 审核中）。
- 准出用 `python3 tools/agents/accept.py <ID>…`（READY + PASS → finish + merge；素材任务要加 `--author-approved`）。
- 每类审核要点文件：`.agents/coord/{NR4S,NR5,NAuF,TOWN,VFX}/review_checks*.md`。


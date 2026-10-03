# TODO · 《金庸群侠传·天书录》现状与待办

> 更新：2026-10-02 16:10 PDT（协调者）。本文整份替换了 09-29 的旧版，旧版见 git 历史。14:00 按作者对 §8 的答复（AR-34）更新；16:10 按作者 15:50 的新分工（出图起 Opus subagent，代码与故事线走 TraeX）与本轮登记更新。

参考与入口：

| 项 | 位置 |
|---|---|
| 事实优先级 | 作者决定（`docs/decisions/author-requirements.md` 的 AR-01 至 AR-34）> `docs/00-canon.md` > `docs/decisions/rulings-v1.md` > 各归属文档 |
| 流水账 | `tools/agents/HANDOFF.md` §9.8 |
| Gemini 出物品图的操作 | skill `gemini-imagegen`（`.claude/skills/gemini-imagegen/`），已入库（AR-34）。`.claude/` 里的其余本机设置仍由 `.git/info/exclude` 排除，所以以后往 skill 里加新文件要用 `git add -f` |
| 续作材料（简报、监督脚本、出图台账、小基线图） | `.agents/wt/_prod/.agents/coord/_handoff/`（不入库） |
| 要作者决定 / 确认的事 | 本文 §8 |
| 素材总览页（验收用） | https://claude.ai/artifact/CYs9JiV1G8C7RBYPwTW46A（10-02 17:12 第 9 版，本账号发布；旧地址 1TACNarveseVhMusJxJnJ3 本账号读不到） |

## 0. 现状一句话

- **设计**：已合入的有《长生诀》主线、白马唐代化、序章改版、七条长生诀支线、各书休眠事件、金钱采集、秘籍扩充、兵器扩充、情景图清单、各朝路人，以及 **属性 v2（4e9daeb2）、白马年份同步（7a89bf9b）**（都是 10-02 15:36–15:37 复审通过合入）。在跑：设计第三批 des33，13 项（§4）。
- **素材**：
  - 人物立绘全部用 codex 重出过一轮，主要角色又按经典影视版重出；成昆、黛绮丝已恢复旧版（bba3c50b）；作者中午定的其余修改由 Opus subagent「9 号出图员」在做（§3.1）。
  - 各朝路人已出。
  - 物品图还剩 366 张、多人情景图 102 张，由 Opus subagent 驱动 Gemini 在做（§3.2）。
  - 主角·男 A 字三视图由人物线 subagent 先出（§3.4）。
- **开发**：
  - ENG-00 至 ENG-14、ENG-16a、ENG-21a 已合入；ENG-15 / 16b / 18 / 21b 在跑（ENG-18 已进 GPT 审核）。
  - 最近一次记录的集成分支 `pnpm check` 全绿（92 个测试文件、515 个用例）；ENG-21a 合入之后还没在集成分支上重跑。
  - M1 路径（新游戏 → 序章 → 初眠配点 → 白马冷入口）还没打通，相关任务都在 eng3 队列里等前置。
  - 动作原型：ENG-12c-clip 已入 eng3 队列，TOOL-rig-sheet 已登记（等三视图），DES-rig-v1.1 在 des33 跑（§3.4）。
- **分工（作者 10-02 15:50）**：出图起 Opus 5.5 subagent——人物图调 codex exec，其他图用 Chrome 驱动 Gemini；代码与故事线走 TraeX（GPT-6-Astra max，不行就 5.6-Sol max）。10-02 14:15 全部驱动是作者自己停的，15:31 已重启。

---

## 1. 工作区与分支

仓库根目录是 `/Users/bytedance/Projects/jinyongqunxia`。

| 位置 | 分支 | 用途与状态 |
|---|---|---|
| 主检出（仓库根） | `claude/vigilant-wright-2unuk1` | 协调者在这里改 HANDOFF / TODO，按路径提交后 cherry-pick 进集成分支。工作区很脏，见下文 |
| `.agents/wt/_prod` | `claude/production-20260930` | **集成分支**：所有任务合入这里，`pnpm check` 也在这里跑 |
| （PR 目标） | `claude/jinyong-online-game-design-jko1v9` | 仓库默认的 PR 目标分支。还没开 PR，一律不 push |

**在跑的任务工作区**：
- 都在 `_prod/.agents/wt/<ID>`，分离 HEAD，没有分支；
- supervise 驱动在复审通过后，把它们 cherry-pick 进集成分支；
- 状态是 14:00 的。

| 工作区 | 基点 | 状态 | 驱动 pid |
|---|---|---|---|
| ENG-15-core-bus | 7e2b9a76 | 第 2 次运行续作中 | eng3 → supervise 29835 |
| ENG-16b-battle-actions | 00712361 | 第 2 次运行续作中 | eng3 → supervise 29839 |
| ENG-18-content-build | 7e2b9a76 | 15:47 校验通过，GPT 审核中 | eng3 → supervise 29836 |
| ENG-21b-recovery-quality | 3dd16a19 | 第 1 次运行续作中 | eng3 → supervise 29840 |
| DES-sync-ids-slp、DES-rig-v1.1、DES-sync-tech-a、DES-sync-design-a、DES-sync-design-b | cdb81d44 之后 | 15:52 启动，执行器在跑 | des33 39323 |

- eng3 调度器 pid 39391（15:52 重启，队列加了 ENG-12c-clip）：在跑 4、待启动 22。des33 调度器 pid 39323（并发 5，队列 `.agents/coord/_des33_queue.txt`）：在跑 5、待启动 8。都是 `detach_launch.py` 脱离启动（新会话，ppid=1）。
- DES-attr-v2（r7 PASS，4e9daeb2）、DES-sync-baima-year（r3 PASS，7a89bf9b）已合入，工作区已移除；复审计数在 `_handoff/devsup_revalidated.json`。
- DES-sleep-events 由协调者在 13:58 手动合入（5b79f03c）。
  - 它 12:00–12:06 的自动合入，是被协调者在 `_prod` 里还没提交的改动挡住的；
  - 以后在 `_prod` 改文件，改完要立即提交。

**主检出的未提交内容**（作者 10-02 定：只记录、不清理，AR-34）：
- **记录在哪**：
  - 入库的记录是 `tools/agents/reports/RECORD-main-dirty-20261002.md`；
  - 逐条清单，以及 99 个独有文件的副本和差异，在主检出 `.agents/archive/main-dirty-20261002/`。
- **共 1904 条**：
  - 已修改 115 个：42 个与集成分支现版相同，70 个是集成分支历史里的旧版，3 个独有：`STYLE.md`、人物 `INDEX.md`、`catalog/npcs-ch01-tianlong.md`。
  - 未跟踪的人物提示词 436 个：156 个与现版相同，184 个是历史旧版，96 个独有。独有的多是 10-01 夜里改写的，以 ch09 / ch12 / ch14 为主。
  - `assets/default/character/`：477 张 PNG 全是副本（199 张与集成分支现图相同，278 张与 `generated_images/` 原图相同），另有 30 个旧 manifest。
  - `generated_images/` 共 838 项（836 张图，加 README 和 MAP），见 §3.3。
  - `.DS_Store` 8 个。
- **规矩**：不要在主检出 `git add` 这些文件。主检出只提交 HANDOFF、TODO 和 skill。

**09-30 旧管线留下的工作区**：已处理（作者 10-02 定「处理」，AR-34）。
- 共 32 个，之前写的 34 个是数错了。都已先归档、再移除。
- 归档在主检出 `.agents/archive/wt-20261002/`，里面有 README 说明怎么恢复。
  - 13 个有不在任何分支上的提交（ART-P-ch01–09 与 ch12–14、ART-R1-male），已导出成 patch；
  - 5 个有未提交改动（ART-R1-female、ART-R2-male、ART-R2-vfx、ART-R3-vfx、NR4S-09），已存成 patch 和 tar 包；
  - 每个工作区的 HEAD 都留了引用 `refs/archive/wt-20261002/<ID>`。
- 现在 `git worktree list` 里只剩主检出、`_prod` 和上表的任务工作区。

**集成分支 coord 里 10-01 的遗留状态**（没有进程在跑）：
- ENG-01-storage（HOLD-REVIEWS）、DES-prologue-ch00（READY）：其实都已手动合入（3da8cbb9；HANDOFF cb354c64），只是状态文件没更新。
- ART-item-armor（HOLD-REVIEWS）、ART-item-hidden-weapons（ERROR）、ART-rig-parts-female / male（HOLD-VALIDATE）：codex 沙箱时期的出图任务，后来已改用 Gemini 或作者的 agent 出图。
- VFX-sk_dugu9（HOLD-VALIDATE）、VFX-sk_hama（HOLD-REVIEWS）、DES-tech-nextjs（ERROR）：待协调者裁定，关掉还是重起。

---

## 2. 作者决定速览（10-01 至 10-02）

| 编号 | 内容 |
|---|---|
| AR-26 | **《长生诀》主线** |
| | 序章体验越女剑后，阿青传第一层；长白山雪崩后初眠、配点。白马改到唐代，成为第一本正式书（书界 ID 不改）。 |
| | 每本书结束时以休眠事件入眠；天龙是「一命换一命」。 |
| | 苏醒前：属性点保留；固定保留 3 武功 + 3 内功，降品阶照旧；其余武功可以忘记、内功可以散去，按 **60%** 转成顿悟点数 / 真元。 |
| | 第二至八层来自七本书的长生诀支线。第九层在鹿鼎记领悟，条件是悟性满、找到和氏璧；之后周游世界、不老不眠。 |
| | 螺旋内力：1 点化解对方 20 点内力。 |
| AR-27 | **属性**：先天属性八项，即现有七项加「内息」。沉睡时配点六项：臂力、根骨、内息、悟性、身法、定力。 |
| | 速度 = 身法 × 轻功系数；攻击 = 臂力 × 硬功 + 外放 × 经脉系数。 |
| AR-28 | **金钱与采集**：钱来自武馆教练和镖局坐镇、遗迹战斗、剧情战斗。设采集点；药材按真实产地和季节。 |
| AR-29 | **动作方案**：2D 分层部件 + CC0 动作库 + 三视图切件（三视图原定 Gemini，AR-34 改用 codex）；具名 NPC 每人一套部件。**M1 终点改为白马（唐）冷入口。** |
| AR-30 | **素材修正**：秘籍补书名并扩充；兵器再扩；重要人物重审；多人情景图；各朝路人；Gemini 出图节奏。 |
| AR-31 | **立绘改走 `codex exec`**，Gemini 只出物品。人物不用油画风；去掉 AI 感；禁止幼态。 |
| AR-32 | **主要角色上传经典影视版剧照 + 基线重绘**，不复制照片。 |
| | 胡斐用豪侠版，不剃发；清代其他男主剃额留辫；男主不补断疤；不申请 Gemini API key。 |
| | **补记**（10-02 上午）：各书版本与个别人物取舍，见 §3.1。 |
| AR-33 | **rig 性能门禁**移出 `pnpm check`，改成 `pnpm check:perf`，负载低时单独跑；阈值不动，禁止在测试里加「高负载跳过」。 |
| AR-34 | **交接问答**：主检出脏文件只记录；旧工作区归档后移除；131 张原图留下并写引用；不下载 Playwright；杨逍确认；skill 入库；女角撞脸已无。 |
| | 追问后定：三视图用 codex；UAL Pro 先不买。 |

协调者裁定，作者可以推翻：
- 白马年份定为 702–703；
- 序章主线任务 ID 允许 `q_00_main_c_<nn>` 作为例外；
- 阿青在越营传功，长白山洞只用于雪崩后的初眠；
- 初眠前只做自动存档；
- 长白山洞归 `rg_dongbei`；
- 「越地」复用 `rg_jiangnan_taihu`，界面显示别名。

---

## 3. 素材

### 3.1 人物立绘（codex exec）

**已完成**：
- 10-02 通宵约 550 张，包括主角、重要人物的重出和补出，以及白马唐代那一批。
- 各朝路人。
- AR-32 经典版重出：从 10:00 到 11:21 共 102 个提交。
  - 天龙、射雕、神雕；
  - 倚天和黄蓉；
  - 鹿鼎、连城、书剑、飞狐、雪山；
  - 笑傲、碧血、侠客、鸳鸯、白马、越女。
- 阿紫、慕容复已在 11:11 按下载的剧照重出。

**已完成**（9 号出图员 Opus subagent，16:03–17:05，24 次 codex exec，限流 0；做法见 `tools/agents/prompts/_codex_portrait.md`、`ART-portrait-ar32-fix-a/b.md`）：18 张入库，`build_portraits` 增量重建已提交 3be77b9a；联系表在 `_handoff/gem/codex_w9/sheets/`（`final_contact_all.jpg`、`cmp_fixa.jpg`、`cmp_fixb.jpg`、`eleven_after.jpg`）。剧照 17 张登记在主检出 `imagegen-reference/identity-20261002/<书>/SOURCES.md`。
- [x] **洪七公**（射雕 7b2dd69c、神雕 04cd3717）：颏下微须、九指；神雕版以射雕新图为锚点年长十余岁。
- [x] **神雕的中年郭靖、郭夫人**：郭靖核对合格未动；黄蓉不合格（不像射雕新版、偏年轻、磨皮），以射雕新图为锚点加朱茵版剧照重出 bef6e344。
- [x] **成昆、黛绮丝**：已由协调者恢复到重出前版本（png、manifest 条目、提示词取自 db2cc43e^ / bf791338^），bba3c50b。
- [x] **杨逍**：1994 台视版孙兴剧照重出 5acd191f。
- [x] **范蠡**：Wikimedia Commons 明人绘范蠡像（公有领域）重出 ccfd0928。
- [x] **侠客 4 人、鸳鸯 3 人、白马 4 人**：复查后重出 4 位（阿绣 9f8dfaae、萧中慧 cb1e1be9、李文秀 ab9fb231、阿曼 1bf60147），其余 7 人合格未动。
- [x] **下载剧照后再出一版**：狄云（2004 吴樾，9d9ff86e）、丁典（2004 王海地，1b55c41d）、霍青桐（1976 汪明荃，0cd59a8e）、乾隆（1976 郑少秋，eb444425）、程灵素（1991 台视龚慈恩，4bd4e062）、苗人凤（1991 慕思成，飞狐 ab821bb7 / 雪山 533e3c54）、胡一刀（1991 孟飞，飞狐 b653227b / 雪山 5af8a030）。飞狐 / 雪山取 1991 台视版（三人同版，与已用的苗若兰、袁紫衣同版；1999 TVB 版没有程灵素）。
  - [x] **AR-35 补出完成**（18:40）：胡一刀飞狐 f09f90c3 / 雪山 b3cc6702（束发不结辫、不剃额）；凌霜华 3391d36d（文字版，疤在左颊；脸略光滑，作者嫌 AI 感重可再重出）；狄云乡下装 40b27eed（以僧装版为锚点）；程灵素 / 苗人凤保留。立绘增量重建 abca5409。对比表 `codex_w9/sheets/cmp_followup_4.jpg`。
- [x] **同书女角撞脸**：作者 10-02 确认，AR-32 重出后已经没有了。
- [x] 收尾：`build_portraits.py` 已跑（3be77b9a）；`build_gallery.py` 17:08 已重建；总览页第 9 版 https://claude.ai/artifact/CYs9JiV1G8C7RBYPwTW46A（17:12），请作者验收。
- [ ] **多人情景图**：`DES-scenes-keyart` 已合入，`assets/default/prompts/scenes/**` 下 102 份提示词。作者 15:50 定「其他图」走 Gemini：由物品线 subagent 在 366 张物品之后出（§3.2），上传立绘只限主角和 S 级（AR-29）；张无忌的 5 幅场景立绘已在 11:00 前后按新脸重出过（48508f22 等）。

**做法**：
- 说明文件在 `_handoff/gem/`：
  - `classic_brief.md`：剧照 + 基线的做法；
  - `codex_worker_brief.md`：并发、入库、提交；
  - `DISK_RULE.md`：每张图出完就清 CODEX_HOME 里的 `sessions/` 和 `generated_images`，否则每张占 40–50 MB。
- 小基线图在 `_handoff/gem/baseline_small/`，各出图员的完成台账在 `_handoff/gem/codex_w*/`。
- 剧照放在主检出 `.agents/coord/imagegen-reference/identity-2026100{1,2}/`，不入库，目录里有 SOURCES.md。
- 风险：这批图会接近演员本人样貌。自娱可以，公开发布前要替换。

### 3.2 物品图（Gemini 网页）

**已完成**：
- 食品 174 张；
- 原有的 18 本秘籍都补上了书名；
- 衣物、旧兵器、旧暗器、旧药物都已出齐；
- 第二批出了 16 张：兵器 1、药材 9、暗器 6。

**执行中**：16:03 起由 Opus subagent 用 Chrome 驱动 Gemini 在做（作者 15:50 分工；标签页由协调者在本会话标签组建：A 道 1957635062、B 道 1957635064；只有前台可见的标签页能提交，窗口要作者摆到前台）。进度记在 `_prod/.agents/coord/gemini_qa/progress.md`。

**待办 366 张**：秘籍 162、兵器 128、药材 55、暗器 21；之后接情景图 102 张。

队列现状：
- 第二批剩下的 204 张还在标签页 localStorage 里：A 道 104 张，队首 `eq_songshounuxia`；B 道 100 张，队首 `it_haizao`。
- 返工 4 张已排在队尾：
  - 蟾酥：瓷盒上有篆字样图案，还系了礼盒丝带；
  - 当归：竹匣上方有盖子的淡色重影；
  - 金花镖：绒匣三边被画面截断；
  - 蒙古马弹囊：多画了一排飞刀和一根像枪管的东西。
- 秘籍 162 张要先用 `make_queue.py` 生成队列，再装进页面。

做法：用 skill `gemini-imagegen`，原因和踩坑见 `tools/imagegen/README.md`。

### 3.3 主检出根目录 `generated_images/`（codex 原图）

- 共 836 张，都是人物立绘原图，没有物品图。生成时间 09-30 09:10 至 10-02 01:16，占 2.1 GB。
- **逐张对应表**：`generated_images/MAP.tsv`，说明在同目录 `README.md`，副本在 `_handoff/generated_images_MAP.tsv`。
- **状态统计**：

  | 状态 | 张数 |
  |---|---|
  | 现行入库 | 199 |
  | 曾入库后被替换 | 232 |
  | 仅主检出旧 manifest | 46 |
  | 曾入作者 agent 工作区后被替换 | 52 |
  | 候选·未选用 | 303 |
  | 候选·审核未过 | 4 |

- **131 张只有这一份**：124 张未选用的候选，7 张作者 agent 工作区的版本。其余 705 张在 `.agents/coord/` 下有同字节的归档副本。
- 作者 10-02 定：这 131 张**留下**，并写引用（AR-34）。
  - 引用清单已入库：`tools/agents/reports/REFERENCE-codex-originals-20261002.md`，列出每张的 asset_id 和当时的出图记录；
  - 全部 836 张的对应表是同名 `.tsv`。

### 3.4 人物动作原型（AR-29）

**已合入**：
- TOOL-rig-nearside：原型 P0，修正近侧与左右约定；
- TOOL-rig-clips：P6，CC0 动作片段的导入、烘焙与投影指标。

调研报告是 `tools/agents/reports/RESEARCH-anim-motion-library.md`，原型脚本在同目录 `RESEARCH-anim-proto/`。

**待办**：
- [ ] **出三视图**：主角·男的 A 字三视图，人物线 subagent 先做（`tools/agents/prompts/ART-rig-sheet.md`）。
  - 作者 10-02 定用 **codex**（AR-34，改了 AR-29 原定的 Gemini）：用 `codex exec` 在本机出，上传主角立绘作参考。
  - 文件契约（协调者定）：`assets/default/rig/npc_zhujue__ch00_m/sheet/sheet_L.png`（三视图都面向画面左）、`sheet_R.png`（面向右的修正版，C5）、`sheet/manifest.yaml`。
- [x] **登记后续任务**（cdb81d44）：
  - TOOL-rig-sheet：P2–P5、P7，三视图切件 + 走路 / 剑招 GIF；依赖 DES-rig-v1.1，`full_checkout`；**等三视图入库后再加进 eng3 队列**（改队列文件后重启 eng3）；
  - ENG-12c-clip：P8–P9，片段运行时；已在 eng3 队列，依赖 ENG-21b、DES-rig-v1.1。之后 ENG-10、ENG-11 接 `playAnim`；
  - DES-rig-v1.1：tech/09 v1.1、tech/07 §4.5 / §5.4、rig GUIDE（C3、C5、C9、R9，codex 口径）；des33 在跑。
- [ ] **原型交付**：主角·男走路加一套剑招的动图，请作者判定（AR-29）。
- 旧任务 ART-rig-parts-male / female（逐个部件出图）作废，改用三视图切件。

---

## 4. 设计

**已合入**：
- 长生诀主线：`design/25`，canon v1.9；
- 白马唐代化：`chapters/10`；
- 序章改版：`chapters/00`、`story/00`；
- 七条长生诀支线：`story/changsheng-sidelines.md`；
- 各书休眠事件，含天龙「一命换一命」：DES-sleep-events（5b79f03c）；
- 金钱、采集、药材：`design/16`、`design/11`、`catalog/gather-herbs.md`；
- 秘籍扩充、兵器扩充、情景图清单（`catalog/key-scenes.md`）、各朝路人（`catalog/npcs-commoners-era.md`）、经脉快照名同步。

**已合入（本轮）**：DES-attr-v2（4e9daeb2）、DES-sync-baima-year（7a89bf9b）、DES-sync-ids-slp（4107e6ad）、DES-rig-v1.1（7ea9a85f）、DES-sync-tech-a（a0164d38）、DES-sync-design-a（a47a3818）、DES-skills-reqs-v2-a（1bd60aff）。

**在跑（des33，cdb81d44 登记，队列顺序即优先级）**：
- DES-sync-ids-slp：`slp_` 进 check_ids OWNERSHIP、28 个休眠事件 ID 转正式；
- DES-story-hooks-g1～g5：各书休眠事件与长生诀支线挂进 `story/NN`、`chapters/NN`（g1 天龙射雕、g2 神雕倚天笑傲、g3 侠客碧血鹿鼎、g4 连城白马鸳鸯、g5 书剑飞狐雪山），依赖 DES-sync-ids-slp；
- DES-rig-v1.1；DES-sync-tech-a（tech/04、05、09-roadmap）；
- DES-sync-design-a（design/10、11、12、14、15、18、19、20）、DES-sync-design-b（design/03、04、05、21）；
- DES-skills-reqs-v2-a / b / c：名录门槛重配（部录 01–07、08–14、门派与通用）。

**待办**：
- [x] **名录门槛重配**：已登记 DES-skills-reqs-v2-a / b / c（des33 排队）。
- [x] **各书 `story/NN` 挂接口**：已登记 DES-story-hooks-g1～g5（des33 排队，等 DES-sync-ids-slp）。
- [x] **跨文档同步**：已登记 DES-sync-tech-a、DES-sync-design-a / b（des33）。合入后仍剩的项以各任务报告 §6 为准，再排。
- [x] **设计定稿后另开 ENG 任务**（开发监督 16:30 登记，95804a78，排在 eng3 队尾、M1 路径之后、四个串行）：ENG-27a 属性 v2 数据链（内息 `bre`、`trainingAttrs`、`masteryXp` / `trueEssence`）→ ENG-27b 属性 v2 战斗链（protocol 4）→ ENG-28a 一般书眠（休眠事件、3+3、按层率转顿悟 / 真元、周游）→ ENG-28b 螺旋内力 Z0-CS。金钱与采集等 ENG-20a / 26 合入后再登记；ENG-27c 节奏锁与 Python protocol 4 参考放 28b 之后。原清单：
  - 属性 v2：内息、速度和攻击公式、data schema、golden；
  - 《长生诀》运行时：苏醒取舍 3+3、60% 转化、层数、螺旋内力、九层后周游世界；
  - 金钱与采集：武馆、镖局营生，采集点，药材的产地和季节。
  
  ENG-17 只覆盖 M1 里的初眠配点。

---

## 5. 开发（M1）

**已合入**：
- ENG-00 至 ENG-14（含 00b、12b；ENG-01 是手动合入的）；
- ENG-04b（CT 速度钳制）、ENG-16a（战斗几何）、ENG-21a（四偏航与昼夜，3dd16a19）；
- TOOL-rig-pipeline、TOOL-item-sprites-run、TOOL-rig-nearside、TOOL-rig-clips。

**在跑**：
- 本轮已合入：ENG-18（76f9381a）、ENG-15（5d719561）、ENG-21b（674476bf，check:perf 0.249 ms）、ENG-25（06e613ba）；每次合入后 `pnpm check` 都绿（最近 108 文件 674 用例，size 295.46 / 350）。
- 在跑：ENG-16b（审核中）、ENG-08b（审核中）、**ENG-12c-clip（18:54 起跑，动作原型 P8–P9）**；TOOL-rig-sheet 等下一个空位。ENG-17a 只差 ENG-08b。
- eng3 队列 15:52 加了 **ENG-12c-clip**（动作原型 P8–P9，排在 ENG-25 之后，依赖 ENG-21b、DES-rig-v1.1 已合入 7ea9a85f）；16:20 后开发监督又加了 TOOL-rig-sheet（三视图已入库 a78e14f3）和 ENG-27a/27b/28a/28b（队尾），eng3 已于 18:21 按作者指示重启（pid 53496，并发降为 3），这几项已在队列里。
- 16:01 起 GPT-6-Astra 执行器全部无输出；16:27 停滞检测自动续作并回退 GPT-5.6-Sol；同一任务 Astra 停滞两次就改用 Sol。

**eng3 排队的 21 项**（依赖满足就自动开跑）：
- 审计修复：
  - ENG-16d：伤害接几何；
  - ENG-14b：经脉协议 3 黄金；
  - ENG-16c：战斗规则收回 core；
  - ENG-08b：大地图挂载竞态。
- **M1 路径**，依次：
  1. ENG-25：内容 schema
  2. ENG-17a：新游戏与对话
  3. ENG-17：书眠、初眠配点
  4. ENG-19a：外壳
  5. ENG-19b：M1 界面
  6. CONTENT-ch00a / b / c、CONTENT-ch10
- 其他：ENG-20a / 20b（区域探索）、ENG-26（遭遇转战斗）、ENG-18b / 18c、ENG-23a（PWA）、ENG-16e（战斗界面）、TOOL-items-catalog。
- **ENG-24 浏览器冒烟**：作者 10-02 定不下载 Playwright 浏览器包（AR-34），不入队。以后要做浏览器冒烟，另定一种不用下载浏览器包的做法。

**没人盯时的处理办法**（脚本在 `_handoff/`）：

| 情况 | 处理 |
|---|---|
| 合入冲突，停在 READY | `rebase_task.py` 挪基点，再 `--from start` 重起 |
| `_prod` 不干净，挡住合入 | `merge_when_clean.py` |
| 只挂在 rig 门禁上 | `riggate_hold.py <ID>` 停下，等负载降了再 `--from validate` |
| 设计任务停在 HOLD-REVIEWS | 手动起 `supervise.py <ID> … --from validate`；每个任务最多 3 次，计数记在 `devsup_revalidated.json` |

- 只挂在 rig 门禁上的情况，主要是 ENG-15 / 18 / 16b：它们的工作区建于 AR-33 之前，check 里还带着 rig 门禁。
- 每批合入后跑 `pnpm check`；负载低时跑 `pnpm check:perf`，记下 loadavg。

审计报告是 `tools/agents/reports/AUDIT-code-20261002.md`，总评 B-，最严重的问题都已登记成上面的 ENG 任务。

---

## 6. 环境与运维

- **权限**：作者已在项目 `.claude/settings.local.json` 里允许启动 `supervise.py` 和 `batch_run.py`。
- **磁盘**：可用 22 GiB（移除旧工作区之后）。root 残留锁和 /private/tmp 的旧任务残留都已清掉。
- **后台进程**：都用 `_handoff/detach_launch.py` 脱离启动（新会话，ppid=1）；执行器 traex，启动时探测 GPT-6-Astra、不应答回退 GPT-5.6-Sol。
  - eng3 batch_run：pid 39391（15:52 重启）；des33 batch_run：pid 39323（15:51）；
  - §1 表里的 supervise 驱动；
  - 三个 Opus subagent（人物线、物品线、开发监督）由协调者会话管理，会话结束就停，中断了按 §3.1 / §3.2 / `_handoff/dev_supervisor_brief_v3.md` 重新起。开发监督（作者 16:10 要求）负责 eng3 / des33 的看护与停住处理，执行器仍是 TraeX。
- **注意**：会话草稿目录在 /private/tmp 下，会被系统清掉。续作材料已复制到 `_prod/.agents/coord/_handoff/`，以那里为准。

## 7. 10-06 额度重置后的接手顺序

1. **看状态**：读本文件和 HANDOFF §9.8 的最新条目，再看 `_prod/.agents/coord/_batch/*.log` 和各任务的 `supervise.status.json`。§8 里「要作者决定的」，先请作者答。
2. **开发监督**：起一个 Opus subagent，交接说明 `_handoff/dev_supervisor_brief_v3.md`（v2 的职责与坑仍有效）；eng3 / des33 在跑就只处理停住的（§5 表），都停了就按 §6 的方式重启两个 batch_run。
3. **人物线**：没做完就重新起一个 Opus subagent（作者 15:50 分工），说明文件见 §3.1。
4. **物品线与情景图**：先 `tabs_context_mcp(createIfEmpty)` 建 Chrome 标签组并 `navigate` 两个 `gemini.google.com/app`，请作者把窗口摆到前台，再起一个 Opus subagent 按 skill `gemini-imagegen` 出 §3.2 的物品和情景图。
5. **三视图入库后**：把 `TOOL-rig-sheet` 加进 `_eng3_queue.txt`（ENG-12c-clip 后面），重启 eng3。
6. **验收**：跑 `build_portraits.py` 和 `build_gallery.py`，发布总览页，请作者验收。
7. **清理**：已按作者 10-02 的决定处理（AR-34）。旧工作区归档后移除；主检出只记录、不清理；`generated_images/` 留着。

---

## 8. 待作者确认 / 决定（汇总）

### 8.0 作者 10-02 已定（AR-34）

| 问题 | 作者答复 | 落实 |
|---|---|---|
| 主检出脏文件 | 记录 | 只记录、不清理，见 §1 |
| 09-30 旧工作区 | 处理 | 32 个已归档后移除，见 §1 |
| 只此一份的 131 张原图 | 留下，写 reference | 引用清单已入库，见 §3.3 |
| 下载 Playwright | 不用 | ENG-24 不入队，见 §5 |
| 杨逍取 1994 台视版孙兴那一版 | 是 | 已记入 AR-32 补记，见 §3.1 |
| skill 纳入 git | 是 | 已入库 |
| 同书女角撞脸 | 没有了 | §3.1 已勾掉 |
| 三视图用 Gemini 还是 codex | codex（追问后选的） | §3.4 |
| 买不买 UAL Pro | 先不买（追问后选的） | 原型用 Mesh2Motion |
| 胡一刀发式（AR-35） | 改回原著不结辫 | 9 号出图员补出两张 |
| 凌霜华左颊疤（AR-35） | 是，只用文字重出 | 同上 |
| 狄云乡下装（AR-35） | 补出 | 同上，以僧装版为锚点 |
| 程灵素乌发齐刘海、苗人凤皮帽（AR-35） | 保留 | 提示词注明偏离原著 |
| eng3 重启（AR-35） | 由协调者执行 | 18:21 重启 pid 53496，并发 3 |

### 8.1 要作者决定（不定就卡着）

暂时没有。新冒出来的再加到这里。

### 8.2 已按默认在做，待作者确认

- **数值与经脉规则**：AR-15a、AR-16a、AR-16b、AR-18a、AR-18b。默认值见 `author-requirements.md` 里 AR-18 后面那张表。
- **《长生诀》**（design/25 文末待决表）：
  - CS-O01：第九层须先有第八层，默认「是」；
  - CS-O02：「经脉伤害 100%」只把螺旋内力新增的伤害全额计入经脉伤害，不复制整招伤害；
  - CS-O03：书灵保留引导、旁白和见证，不传功；
  - CS-O04：第六层的压制 −1 与天书加算，共同下限 `ceil(S/2)`。
- **属性**（AR-27）：福缘、魅力不参与沉睡配点，由奇遇、事件和装束改变。
- **情景图上传立绘**（AR-29 C1）：按「作者已在 Gemini 关闭活动记录」对待，subagent 直接上传主角 / S 级立绘；没关的话请作者先关。
- **序章**（DES-prologue 报告 §4）：
  - O02：灰盒阶段用 `mockRef`，发布前由 design/18 建档；
  - O04：竹棒是章内道具 `prop_bamboo_staff`；
  - O05：投果消耗 `it_tao`；
  - O06：可以取消导出；M1 必须导回；冷入口可无代价复核身份。
  - O01、O03 已由协调者裁定，见 §2 末。
- **动作调研报告 §6.2**：
  - C5：普通角色接受镜像，主角和 S 级加出一张面向右的三视图；
  - C6：动作许可只用 CC0、CMU 条款、CC BY，不用 NC 数据和 Mixamo；
  - C7：武侠签名招式的补充来源，倾向作者自录视频；
  - C8：走路先保持程序步态，原型做 A/B 后再定；
  - C9：战斗大动作全部走分层部件加动作轨迹，整身帧只用于立绘切入。
  - C1–C4、C10、C11 已由 AR-29、AR-31、AR-34 答复或落实。
- **设计文档里的其他待确认项**：共 79 处「待作者确认」，分布在 25 个文件里，都已按默认值执行。较多的是：
  - design/21：11 处；
  - design/01：10 处；
  - design/05、design/20：各 9 处；
  - chapters/04：6 处。
  
  明细以各文档的「待决事项」节为准。

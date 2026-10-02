# TODO · 《金庸群侠传·天书录》现状与待办

> 更新：2026-10-02 12:10 PDT（协调者）。本文整份替换了 09-29 的旧版，旧版见 git 历史。

参考与入口：

| 项 | 位置 |
|---|---|
| 事实优先级 | 作者决定（`docs/decisions/author-requirements.md` 的 AR-01 至 AR-33）> `docs/00-canon.md` > `docs/decisions/rulings-v1.md` > 各归属文档 |
| 流水账 | `tools/agents/HANDOFF.md` §9.8 |
| Gemini 出物品图的操作 | skill `gemini-imagegen`：正本在主检出 `.claude/skills/gemini-imagegen/`，`_prod` 里有指向它的软链。`.claude/` 写在 `.git/info/exclude` 里，所以不进 git |
| 续作材料（简报、监督脚本、出图台账、小基线图） | `.agents/wt/_prod/.agents/coord/_handoff/`（不入库） |
| 要作者决定 / 确认的事 | 本文 §8 |

## 0. 现状一句话

- **设计**：已合入的有《长生诀》主线、白马唐代化、序章改版、七条长生诀支线、金钱采集、秘籍扩充、兵器扩充、情景图清单、各朝路人。属性 v2、休眠事件、白马年份同步还在跑。
- **素材**：
  - 人物立绘全部用 codex 重出过一轮，主要角色又按经典影视版重出；作者中午定的最后几处修改还没做。
  - 各朝路人已出。
  - 物品图还剩 366 张，多人情景图还没开始。
- **开发**：
  - ENG-00 至 ENG-14、ENG-16a 已合入，集成分支 `pnpm check` 全绿（92 个测试文件、515 个用例）。
  - M1 路径（新游戏 → 序章 → 初眠配点 → 白马冷入口）还没打通，相关任务都在 eng3 队列里等前置。
- **限额**：10-02 上午起，Claude subagent 的周额度用完了，**10-06 07:00 PDT 重置**。
  - 停了的：Gemini 物品线、codex 人物线、开发监督。
  - 还在跑的：GPT 执行器跑的设计和工程批次。但没人处理合入冲突和停住的任务。

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
- 状态是 11:47 的。

| 工作区 | 基点 | 状态 | 驱动 pid |
|---|---|---|---|
| DES-attr-v2 | 8c4dc7f2 | 第 3 次复审，也是最后一次；执行器在跑 | supervise 66007 |
| DES-sleep-events | 1cf6dfb0 | 第 1 次复审 | supervise 91847，属 des32 批次（pid 32688） |
| DES-sync-baima-year | d6b7d812 | 执行器在跑 | supervise 3236 |
| ENG-15-core-bus | 7e2b9a76 | 执行器在跑 | supervise 61978 |
| ENG-16b-battle-actions | 00712361 | 执行器在跑，已超过 1 小时 | supervise 11580 |
| ENG-18-content-build | 7e2b9a76 | 执行器在跑 | supervise 61992 |
| ENG-21a-camera-daynight | 2d18b68c | 执行器在跑 | supervise 57048 |

四个 ENG 任务都在 eng3 批次（pid 58514）的队列里。

**主检出的脏状态**（清理前先征得作者同意，不要直接提交）：
- **115 个已修改文件**：
  - 112 个是集成分支里已有的副本：42 个与现版相同，70 个是旧版，可以丢弃；
  - 3 个在集成分支历史里找不到同版，丢弃前先和集成分支比对：`assets/default/STYLE.md`、`assets/default/prompts/characters/INDEX.md`、`docs/design/catalog/npcs-ch01-tianlong.md`。
- **40 个未跟踪项**：
  - `assets/default/character/`：1.2 GB，旧立绘和旧 manifest；
  - ch02–ch14 的人物提示词目录、天龙的场景提示词：旧版；
  - `generated_images/`：见 §3.3；
  - 若干 `.DS_Store`。

**09-30 旧管线留下的工作区**：
- 主检出 `.agents/wt/` 下有 34 个：ART-P-ch01–09 与 ch12–14、ART-R1 / R2 / R3、NAuF-book-02 / 08、NR4S-09，以及 12 个 NR5-*。
- 都是分离 HEAD，没有进程在跑；它们在 `.agents/coord` 里的状态还停在 09-30 的 READY / RUNNING。
- 内容多半已被后来的任务取代。逐个核对后先归档，再删工作区；归档之前不删。

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
| AR-29 | **动作方案**：2D 分层部件 + CC0 动作库 + Gemini 三视图切件。三视图只上传主角和 S 级立绘；具名 NPC 每人一套部件。**M1 终点改为白马（唐）冷入口。** |
| AR-30 | **素材修正**：秘籍补书名并扩充；兵器再扩；重要人物重审；多人情景图；各朝路人；Gemini 出图节奏。 |
| AR-31 | **立绘改走 `codex exec`**，Gemini 只出物品。人物不用油画风；去掉 AI 感；禁止幼态。 |
| AR-32 | **主要角色上传经典影视版剧照 + 基线重绘**，不复制照片。 |
| | 胡斐用豪侠版，不剃发；清代其他男主剃额留辫；男主不补断疤；不申请 Gemini API key。 |
| | **补记**（10-02 上午）：各书版本与个别人物取舍，见 §3.1。 |
| AR-33 | **rig 性能门禁**移出 `pnpm check`，改成 `pnpm check:perf`，负载低时单独跑；阈值不动，禁止在测试里加「高负载跳过」。 |

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

**待办**（作者 10-02 11:36 定，原话见 AR-32 补记；subagent 因额度中断，都还没做）：
- [ ] **洪七公**（射雕、神雕各一张）：现在是按 1983 版画的长须，10:59 入库。改成原著的颏下微须，九指不变。
- [ ] **神雕的中年郭靖、郭夫人**：都要由射雕的经典形象长到中年。
  - 郭靖现在用的是 1983 剧照加射雕锚点，方向是对的，只需核对年龄感；
  - 黄蓉要核对是不是由朱茵版长成的。
- [ ] **成昆、黛绮丝**：恢复到 11:15 重出（db2cc43e、bf791338）之前的版本，用 git 取回前一版的 png、manifest 和提示词。
- [ ] **杨逍**：用 1994 台视版（马景涛主演，杨逍由孙兴饰演）的剧照加基线重出。作者已同意下载剧照。
- [ ] **范蠡**：参考历史画像重出。现在是 11:00 的文字版。
- [ ] **侠客 4 人、鸳鸯 3 人、白马 4 人**：不换剧照，逐张检查幼态和 AI 感，有问题的才重出。
- [ ] **下载剧照后再出一版**：狄云、丁典、凌霜华（疤在左颊）、霍青桐、乾隆、程灵素（ID 是 `npc_chenglinsu`）、苗人凤、胡一刀。
  - 这些人 11:04–11:21 已按「本机无剧照」的文字版重出过。
  - 版本：连城 2004，书剑 1976，飞狐、雪山取最经典的一版。
- [ ] **同书女角撞脸**：作者问过「谁？」，对照表在 `_handoff/gem/sameface_women.jpg`。AR-32 重出后，请作者再看一遍。
- [ ] 以上全部完成后，依次：
  1. 跑 `python3 tools/portrait/build_portraits.py`；
  2. 跑 `python3 tools/review/build_gallery.py`；
  3. 重新发布素材总览页（https://claude.ai/artifact/1TACNarveseVhMusJxJnJ3），请作者验收。
- [ ] **多人情景图**：`DES-scenes-keyart` 已合入，`assets/default/prompts/scenes/**` 下有 100 多份提示词，**还没出图**。
  - 出图时上传相关人物立绘作参考，限主角和 S 级（AR-29）；
  - 张无忌的 5 幅按新脸重出。

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

**待办 366 张**：秘籍 162、兵器 128、药材 55、暗器 21。

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
- 要清理这个目录，先把这 131 张挪走，或者请作者确认不要。

### 3.4 人物动作原型（AR-29）

**已合入**：
- TOOL-rig-nearside：原型 P0，修正近侧与左右约定；
- TOOL-rig-clips：P6，CC0 动作片段的导入、烘焙与投影指标。

调研报告是 `tools/agents/reports/RESEARCH-anim-motion-library.md`，原型脚本在同目录 `RESEARCH-anim-proto/`。

**待办**：
- [ ] **出三视图**：主角·男的 A 字三视图。
  - AR-29 原定用 Gemini、上传立绘；但 AR-31 之后人物类图都改走 codex。开工前先请作者定用哪个，见 §8。
  - 如果用 Gemini：只上传主角和 S 级立绘，上传前作者自己在 Gemini 里关掉活动记录。
- [ ] **登记后续任务**：三视图出来后登记，这几项现在都还没登记。
  - TOOL-rig-sheet：P2–P5、P7，三视图切件；
  - ENG-12c-clip：P8–P9，动作片段接入 rig 播放。之后 ENG-10、ENG-11 接 `playAnim`；
  - DES-rig-v1.1：修订 tech/09、tech/07，对应调研报告的 C3、C9。
- [ ] **原型交付**：主角·男走路加一套剑招的动图，请作者判定（AR-29）。
- 旧任务 ART-rig-parts-male / female（逐个部件出图）作废，改用三视图切件。

---

## 4. 设计

**已合入**：
- 长生诀主线：`design/25`，canon v1.9；
- 白马唐代化：`chapters/10`；
- 序章改版：`chapters/00`、`story/00`；
- 七条长生诀支线：`story/changsheng-sidelines.md`；
- 金钱、采集、药材：`design/16`、`design/11`、`catalog/gather-herbs.md`；
- 秘籍扩充、兵器扩充、情景图清单（`catalog/key-scenes.md`）、各朝路人（`catalog/npcs-commoners-era.md`）、经脉快照名同步。

**在跑**：
- DES-attr-v2：属性 v2；
- DES-sleep-events：各书休眠事件，含天龙「一命换一命」；
- DES-sync-baima-year：
  - 白马年份改为 702–703，并重算 sleepYears；
  - 登记阿青、白猿、范蠡；
  - 序章任务 ID 例外；
  - 传功地点。

**待办**：
- [ ] **名录门槛重配**：DES-attr-v2 合入后，按它定的规则分批重配 `catalog/skills-*.md` 的 `reqs`，加入内息和修炼加成。
- [ ] **各书 `story/NN` 挂接口**：挂上休眠事件和长生诀支线，以 DES-sleep-events 和 sidelines 报告的第 6 节为准。
- [ ] **跨文档同步**：各设计报告第 6 节列出的同步项，合入后由协调者逐条排任务。
- [ ] **设计定稿后另开 ENG 任务**（AR-26 / 27 / 28 都写明「随后再开」，现在一个都没登记）：
  - 属性 v2：内息、速度和攻击公式、data schema、golden；
  - 《长生诀》运行时：苏醒取舍 3+3、60% 转化、层数、螺旋内力、九层后周游世界；
  - 金钱与采集：武馆、镖局营生，采集点，药材的产地和季节。
  
  ENG-17 只覆盖 M1 里的初眠配点。

---

## 5. 开发（M1）

**已合入**：
- ENG-00 至 ENG-14（含 00b、12b；ENG-01 是手动合入的）；
- ENG-04b（CT 速度钳制）、ENG-16a（战斗几何）；
- TOOL-rig-pipeline、TOOL-item-sprites-run、TOOL-rig-nearside、TOOL-rig-clips。

**在跑**：
- ENG-15：命令总线；
- ENG-18：内容编译管线；
- ENG-16b：战斗补全 B；
- ENG-21a：四偏航与昼夜。

**eng3 排队的 22 项**（依赖满足就自动开跑）：
- 审计修复：
  - ENG-16d：伤害接几何；
  - ENG-14b：经脉协议 3 黄金；
  - ENG-16c：战斗规则收回 core；
  - ENG-08b：大地图挂载竞态；
  - ENG-21b：上下文恢复与自适应。
- **M1 路径**，依次：
  1. ENG-25：内容 schema
  2. ENG-17a：新游戏与对话
  3. ENG-17：书眠、初眠配点
  4. ENG-19a：外壳
  5. ENG-19b：M1 界面
  6. CONTENT-ch00a / b / c、CONTENT-ch10
- 其他：ENG-20a / 20b（区域探索）、ENG-26（遭遇转战斗）、ENG-18b / 18c、ENG-23a（PWA）、ENG-16e（战斗界面）、TOOL-items-catalog。
- **ENG-24 浏览器冒烟**：已登记，还没入队。**下载 Playwright 浏览器包要作者先同意。**

**没人盯时的处理办法**（脚本在 `_handoff/`）：

| 情况 | 处理 |
|---|---|
| 合入冲突，停在 READY | `rebase_task.py` 挪基点，再 `--from start` 重起 |
| `_prod` 不干净，挡住合入 | `merge_when_clean.py` |
| 只挂在 rig 门禁上 | `riggate_hold.py <ID>` 停下，等负载降了再 `--from validate` |
| 设计任务停在 HOLD-REVIEWS | 手动起 `supervise.py <ID> … --from validate`；每个任务最多 3 次，计数记在 `devsup_revalidated.json` |

- 只挂在 rig 门禁上的情况，主要是 ENG-15 / 18 / 16b / 21a：它们的工作区建于 AR-33 之前，check 里还带着 rig 门禁。
- 每批合入后跑 `pnpm check`；负载低时跑 `pnpm check:perf`，记下 loadavg。

审计报告是 `tools/agents/reports/AUDIT-code-20261002.md`，总评 B-，最严重的问题都已登记成上面的 ENG 任务。

---

## 6. 环境与运维

- **权限**：作者已在项目 `.claude/settings.local.json` 里允许启动 `supervise.py` 和 `batch_run.py`。
- **磁盘**：可用 20 GiB。root 残留锁和 /private/tmp 的旧任务残留都已清掉。
- **后台进程**：都用 nohup 起、不依附工具进程，执行器是 traex GPT-5.6-Sol。
  - eng3 batch_run：pid 58514；
  - des32 batch_run：pid 32688；
  - §1 表里的 supervise 驱动。
- **注意**：会话草稿目录在 /private/tmp 下，会被系统清掉。续作材料已复制到 `_prod/.agents/coord/_handoff/`，以那里为准。

## 7. 10-06 额度重置后的接手顺序

1. **看状态**：读本文件和 HANDOFF §9.8 的最新条目，再看 `_prod/.agents/coord/_batch/*.log` 和各任务的 `supervise.status.json`。§8 里「要作者决定的」，先请作者答。
2. **重启开发监督**：交接说明是 `_handoff/dev_supervisor_brief_v2.md`。先处理停住的任务，再跑 check。
3. **重启人物线**：按 §3.1 的待办，分给 2–3 个 codex 出图员。做法见 `_handoff/gem/` 里的三份说明。
4. **重启物品线**：先请作者把 Gemini 窗口摆到前台，再按 skill `gemini-imagegen` 出 §3.2 的 366 张。
5. **出情景图**：§3.1 最后一项。
6. **验收**：跑 `build_portraits.py` 和 `build_gallery.py`，发布总览页，请作者验收。
7. **清理**：作者同意后，清理主检出的脏文件、09-30 的旧工作区和 `generated_images/`（先处理 131 张只此一份的）。

---

## 8. 待作者确认 / 决定（汇总）

### 8.1 要作者决定（不定就卡着）

1. **主检出的脏文件**：112 个副本可以丢弃；另有 3 个要先比对，见 §1。
2. **09-30 的旧工作区**：34 个，要不要归档后清理（§1）。
3. **`generated_images/` 里只此一份的 131 张**：留还是不要（§3.3）。
4. **ENG-24 浏览器冒烟**：要下载 Playwright 浏览器包，需要作者同意（§5）。
5. **杨逍的「马景涛版本」**：协调者理解为 1994 台视版里孙兴演的杨逍（AR-32 补记），请作者确认。
6. **skill `gemini-imagegen` 要不要纳入 git**：现在被 `.git/info/exclude` 排除了。
7. **动作原型的三视图**：用 Gemini（AR-29 原定），还是 codex（AR-31 后人物类图的做法）（§3.4）。
8. **动作库要不要买 UAL Pro**：$9.99 起，CC0。默认先不买，用免费档加 Mesh2Motion（调研报告 C10）。
9. **同书女角撞脸**：AR-32 重出后，请作者再看还有没有（§3.1）。

### 8.2 已按默认在做，待作者确认

- **数值与经脉规则**：AR-15a、AR-16a、AR-16b、AR-18a、AR-18b。默认值见 `author-requirements.md` 里 AR-18 后面那张表。
- **《长生诀》**（design/25 文末待决表）：
  - CS-O01：第九层须先有第八层，默认「是」；
  - CS-O02：「经脉伤害 100%」只把螺旋内力新增的伤害全额计入经脉伤害，不复制整招伤害；
  - CS-O03：书灵保留引导、旁白和见证，不传功；
  - CS-O04：第六层的压制 −1 与天书加算，共同下限 `ceil(S/2)`。
- **属性**（AR-27）：福缘、魅力不参与沉睡配点，由奇遇、事件和装束改变。
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
  - C1–C4、C11 已由 AR-29、AR-31 答复或落实。
- **设计文档里的其他待确认项**：共 79 处「待作者确认」，分布在 25 个文件里，都已按默认值执行。较多的是：
  - design/21：11 处；
  - design/01：10 处；
  - design/05、design/20：各 9 处；
  - chapters/04：6 处。
  
  明细以各文档的「待决事项」节为准。

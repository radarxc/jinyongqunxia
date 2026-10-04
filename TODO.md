# TODO · 《金庸群侠传·天书录》现状与待办

> 更新：2026-10-03 03:25 PDT（协调者）。整份替换 10-02 16:10 版，旧版见 git 历史。10-02 晚到 10-03 凌晨按作者的 AR-35～AR-40 推进：素材线第二波（codex 执行器）、物品说明与属性投影（des34）、人物名录补登记（des35）、礼品（des36）、3D 试点（Tripo）。

参考与入口：

| 项 | 位置 |
|---|---|
| 事实优先级 | 作者决定（`docs/decisions/author-requirements.md` 的 AR-01 至 AR-40）> `docs/00-canon.md` > `docs/decisions/rulings-v1.md` > 各归属文档 |
| 流水账 | `tools/agents/HANDOFF.md` §9.8 |
| Gemini 出物品图的操作 | skill `gemini-imagegen`（`.claude/skills/gemini-imagegen/`，已入库，AR-34）。`.claude/` 里的其余本机设置仍由 `.git/info/exclude` 排除，往 skill 里加新文件要用 `git add -f` |
| codex 出人物图 / 插图的做法 | `tools/agents/prompts/_codex_worker.md`（codex 执行器：只排队、入库；出图 runner 在沙箱外由追踪者起）、`_codex_portrait.md`（Opus subagent 直接出图）、`_imagegen.md`；runner 与工具在 `_prod/.agents/coord/_handoff/gem/codex_w8/`（不入库） |
| 续作材料（简报、监督脚本、出图台账、联系表、小基线图） | `.agents/wt/_prod/.agents/coord/_handoff/`（不入库） |
| 要作者决定 / 确认的事 | 本文 §8 |
| 素材总览页（验收用） | https://claude.ai/artifact/CYs9JiV1G8C7RBYPwTW46A（10-03 09:58 第 4 版：128 张运行时立绘重建后的全量，含第二波人物与全部物品；生成 `python3 tools/review/build_gallery.py` → `.agents/coord/gallery/`，74 个文件 17.5 MB，用 Artifact 工具同地址重发） |
| **素材审核页**（作者逐件定结论） | https://claude.ai/artifact/7H7nYXyBSRJJSNFBwsDGjM（10-03 16:15 第 3 版 2603 件：人物 924〔含 cast-fill-c / -d 新人 110〕、物品 988〔含礼品 94〕、区域图 5、3D 模型 11、界面图标 22、特效 130 等；被替换的 16 张里只有黄蓉 base 有旧结论「通过」，与作者 AR-51 选 A 一致，保留。11:44 首版：2322 件——人物立绘 814、物品 894、剧情插图 82、城图 16、遗迹地图 62、特效 125、部件 43、建筑 209、贴片 77；页面共享库 `verdicts` 集合存「通过 / 返工 / 不用」+ 备注，协调者用 ArtifactData 读回后改 manifest / 登记返工；生成 `.agents/coord/review_page/collect.py` → `build_html.py`，同 file_path 重发保持地址） |

## 0. 现状一句话

- **设计**：des33 第三批 13 项全部合入；des34 物品说明与属性投影 **全部合入**（attrs-spec + lore 1 / 3 / 5 / 6 / 7 / 8，11 份名录九列，lore-2 / 4 取消），等 TOOL-items-catalog 重新生成；des35 人物名录补登记 a / b 合入；des36 礼品规格合入（0496cb32），礼品名录 ART-items-gifts-catalog 在跑；DES-sync-keyscenes-ar36、DES-ruins-ids 合入（§4）。
- **素材**：
  - 人物：AR-32 / AR-35 的修改全部完成；第二波（AR-36）cast-fill a / b 合入 57 张，hero-refine-a 合入 95 张（联系表已发作者），hero-refine-b 合入 80 张（2533a8fd；李文秀 6 图按「白马用游戏头像 + 基线」放行）；运行时立绘 `build_portraits` 剩余 128 张 09:44–09:55 重建完（36142d3f..0cc39bf9；index.json 814 变体 / 699 头像 / 433 人物），INDEX 重建 d0529625（590 份），总览页 09:58 第 4 版已重发。
  - 物品（Gemini）：**366 张全部入库**（10-03 04:28 收工：秘籍 162、兵器 128、药材 55、暗器 21，限流 0），物品图至此出齐；下一批是 AR-40 的奢侈品 / 礼品约 120–180 张，等名录（§3.2）。
  - 情景图：改由 codex 主角精修任务出（hero-a 已入库 50 张插图，hero-b 待合入），Gemini 不再出；`key-scenes.md` 的统计口径待同步（§4）。
  - 城市布局：CITY-layouts-all 05:28 合入 16 城（洛阳 / 太原因工具缺口标 rejected，TOOL-town-gaps-1 修工具后重做）；全量不接力，缩减范围等作者（§8.1）；遗迹地图 56 + 6 张全部合入（含作者点名的九老洞、敦煌地宫）；三视图切件 TOOL-rig-sheet 第 9 次返修（最后一轮）后按原型收口（§3.4、§3.5）。
  - 3D：作者定 2D 为主（AR-38），Tripo 免费档试点的主角·男 GLB 已入 `apps/game/public/pilot/`，ENG-12e 原型任务在 eng3 队列 ready。
- **开发**：10-02 16:10 之后合入 ENG-15 / 18 / 21b / 25 / 08b / 16b / 12c-clip / 16d / 14b / 17a / 18d / 18e / TOOL-items-catalog，10-03 凌晨再合入 ENG-19a（04:32）、ENG-18b（05:09）、ENG-17（05:12）、ENG-19c（05:24）、TOOL-catalog-9col（05:37）——M1 的 25 / 17a / 19a / 17 齐了；集成分支 `pnpm check` 05:26 全绿（128 文件 922 用例，entry 160.17 / 170 KiB 余 9.8 KiB，webgl 320.70 / 350）。在跑 ENG-20a、ENG-19b、ENG-12e（返修：恢复 2D 演示 + 3D 并排）、TOOL-rig-sheet 返修、TOOL-town-gaps-1、TOOL-catalog-food-qi-exception、lore 复验（lore-6 已合入）；eng3 队列还有 17 项（§5）。
- **分工**（作者 10-02 15:50 / 22:00）：三个 Opus subagent——素材线第二波追踪（codex 执行器）、Gemini 出图员、开发监督；代码与故事线走 TraeX（GPT-6-Astra max，不行就 5.6-Sol max；GPT-5.5 禁用）。协调者只规划、登记、裁定、合入。
- **环境**：09:30 磁盘约 9 GiB（08:55 曾因 ENG-entry-split 执行器在 /private/tmp 做 6 GB 整仓检出跌到 0.8 GiB，已删并在 `_common.md` 加规则 12 禁止）、交换区 32 GB；规则：磁盘 < 5 GiB 不新开工作区、< 2.5 GiB 停线（§6）；连续改 `_prod` 超过 1 分钟的素材任务（build_portraits、批量入库）启动前先查没有驱动处在 reviewing / validating / merging，否则挡合入（10-03 10:00 新规，追踪者脚本已照办）。校验漏洞已修（TOOL-tests-discover 2effff74：tools 测试 549 条全跑）。

---

## 1. 工作区与分支

仓库根目录是 `/Users/bytedance/Projects/jinyongqunxia`。

| 位置 | 分支 | 用途与状态 |
|---|---|---|
| 主检出（仓库根） | `claude/vigilant-wright-2unuk1` | 只同步 TODO / HANDOFF（从集成分支 checkout 后按路径提交）；`docs/decisions/author-requirements.md` 只在集成分支维护（两边已分叉，cherry-pick 会冲突）。工作区很脏，只记录不清理（AR-34） |
| `.agents/wt/_prod` | `claude/production-20260930` | **集成分支**：所有任务合入这里，`pnpm check` 也在这里跑；所有登记、裁定、提示词改动都在这里按路径提交 |
| （PR 目标） | `claude/jinyong-online-game-design-jko1v9` | 仓库默认的 PR 目标分支。还没开 PR，一律不 push |

**在跑的任务工作区**（03:20；都在 `_prod/.agents/wt/<ID>`，分离 HEAD；驱动都是 `_handoff/detach_launch.py` 脱离启动）：

| 工作区 | 执行器 | 状态 | 驱动 pid |
|---|---|---|---|

| TOOL-items-regen | traex | **已合入 3d6db806**（11:18，r2 PASS）：889 个物品文件带 text.lore 与 extension.value.attributes，`--check` 894 行全新；之后 TOOL-catalog-collectibles（驱动 85865）→ gifts-catalog 复验 → TOOL-items-regen-2 | 开发监督 |
| ENG-attr-v2-schema | traex Sol | **已合入 540059ff**（10:31）；合入后 983 条测试全过，entry 38.44 | — |
| TOOL-catalog-collectibles | traex Sol | 已登记（fb5cc48f）：校验器 / 生成器认 items-collectibles.md（AR-40 列序、六个礼品键）；要等 regen 与 tests-discover 合入（否则它的 --check 与 content 测试必红） | 开发监督起 |
| ENG-19d-m1-flow-test-race | traex Sol | 已合入 3a3d58ca（09:54；merge 两次被 `_prod` 里的立绘重建挡住，第 3 次重试成功） | — |
| ENG-entry-split | traex Sol | **已合入 e8357e76（09:56，r1 PASS）**：Worker 与子系统改为首次会话 / 首次触发加载。合入后 prod_check 975 条全过，entry 38.44 / 170（原 168.57）、render 161.87、webgl 200.32 / 350（原 330.44）；14 个暂停已解除回 PENDING，ENG-20b 等 ENG-size-session-gate | — |


- 调度器：eng3 batch_run pid 89679（01:27 起，并发 3；在跑 4 / 已合入 13 / 待启动 19）；des34 batch_run pid 9492（lore-2 / 4 等依赖）；des33、des35、des36 已结束。`batch_run` 只在启动时读队列文件：`_eng3_queue.txt` 新加的 TOOL-ingest-cropframe 要重启 eng3 才生效。
- codex 出图 runner：w12（pid 20933，2 槽）服务 hero-b；w11 已排空停掉。
- 复审计数在 `_handoff/devsup_revalidated.json`；追踪者另起的驱动说明在 `_handoff/tracker_note_*.md`。

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
| AR-35 | 人物线四问：胡一刀改回不结辫、凌霜华文字重出疤在左颊、狄云乡下装补出、程灵素 / 苗人凤保留；eng3 重启由协调者执行。 |
| AR-37 | 片段模式 rig 门禁放宽到 1.0 ms（程序步态 0.80 不动）；ENG-12d 降为可选。 |
| AR-38 | 人物动作只做 2D 切件，不做 3D（高斯泼溅 / 图生 3D 不走）；切件瑕疵要修到位；Tripo 模型只作 ENG-12e 试点对比。 |
| AR-39 | 素材优化与生成后都要落库：图 + manifest 按路径提交，运行时派生物（portrait / INDEX / 总览页）每批重建提交；草稿目录里的不算完成。 |
| AR-40 | 各朝代奢侈品 / 礼品（瓷玉炉琴帖笔等）用于送礼：DES 规格 → codex 考据写名录与提示词 → Gemini 出图；书法拜帖有求字支线。 |
| AR-41 | **Tripo API 生成主要角色 3D 模型与骨架，并优化男女主角**（codex gpt-6-astra xhigh；key 在主检出 `.env`，不落任何文件；先 ART-3d-tripo-avatars 再 ART-3d-tripo-cast，产物进 `assets/default/model3d/`；点数上限 600 / 2500） |
| AR-36 | **素材线第二波**：两个 codex（ultra）做主角复合基线精修 + 分时期立绘 + 关键剧情插图配古风题字；两个 codex（xhigh）逐书补齐主要人物；一个 codex 做全部城市 × 年代布局与总装城图；一个 codex 做遗迹 / 地宫地图；一个 Opus subagent 追踪。**物品说明与属性投影**：先定字段规格再分 8 批逐件写短文填值。 |
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

**10-02 白天已完成**（细节见 git 历史与 HANDOFF）：
- 通宵约 550 张重出 / 补出，各朝路人，AR-32 经典影视版重出（10:00–11:21 共 102 个提交）；成昆、黛绮丝恢复旧版（bba3c50b）。
- 9 号出图员（Opus subagent，24 次 codex exec）：洪七公、黄蓉、杨逍、范蠡、侠客 / 鸳鸯 / 白马四位、剧照版狄云 / 丁典 / 霍青桐 / 乾隆 / 程灵素 / 苗人凤 / 胡一刀共 18 张（3be77b9a）；AR-35 补出胡一刀不结辫、凌霜华左颊疤文字版、狄云乡下装（abca5409）。联系表 `_handoff/gem/codex_w9/sheets/`。
- 总览页 10-02 17:12 版已发作者。

**第二波（AR-36，codex gpt-6-astra，追踪 subagent 驱动，详见 §3.5）**：
- [x] ART-cast-fill-a（e1698e93，7 张）、ART-cast-fill-b（fe4765ef，50 张，其中复用 17 张）：逐书搜主要人物列表、补缺的立绘；名录里没有的人物只报不造 ID → DES-npcs-register-a / b 已把 110 个原著人物登记进名录与 design/18（03c44028、3226fe15）。
- [x] ART-hero-refine-a（d11b33a0，天龙～碧血 7 本）：95 张 = 15 张复合基线（剧照 + 游戏画风参考 + 旧基线，像角色不像演员）+ 30 张分时期立绘 + 50 张关键剧情插图（古风题字已逐字核过）。联系表 `_handoff/gem/codex_w11/sheets/`：`resume-all-base-before-after.jpg`（新旧对比）、`resume-por_npc_<id>-stages.jpg`、`resume-chNN-all-cg.jpg`；03:15 已发作者四张。
- [x] ART-hero-refine-b（2533a8fd，鹿鼎～雪山 7 本）：80 张 = 16 张基线 + 32 张分时期 + 32 张插图（题字 32 幅核验）；审核 r4 PASS（李文秀 6 图按「白马用游戏头像 + 现基线」放行，图在 female/ch10，不再补）。合入时与 cast-b 在 6 个 manifest 末尾撞车，协调者手工保留两边条目后 finish，旧驱动自行合入。联系表 `_handoff/gem/codex_w12/sheets/`（`retry3-bases-before-after-0N.jpg`、`retry3-stages-chNN-npc_<id>.jpg`、`retry3-final-scenes-chNN-01.jpg`）；03:40 已发作者五张。
- [x] ART-cast-polish-ch09（41b24202，06:07）：万门六弟子各重出 1 张，联系表 `_handoff/gem/codex_w15/sheets/`。
- [ ] 110 个新登记人物的立绘（ART-cast-fill-c / d，待协调者登记）：等 hero-b、polish 之后，看磁盘与作者意见再排。
- [x] **收尾**（10-03 09:58 完成）：`build_portraits.py` 剩余 128 张 09:44–09:55 跑完（36142d3f..0cc39bf9，按章 14 次提交；此前分批 29109cfe / d255c157 / 0343156b / a03b120d / ab4cc1e8；模型加载交换区 +7 GB，磁盘最低 5.1 GiB）→ INDEX d0529625 → 总览页第 4 版。教训：它直接写 `_prod`，把 ENG-19d 的合入挡了两次，新规见 §1 环境行。
- [ ] `key-scenes.md` / `story/07` 等同步项：hero-a 报告 §6 列了 ch01～07 的条目修正与统计口径，hero-b 合入后一并登记 DES-sync-keyscenes-ar36（§4）。

**做法**：
- `tools/agents/prompts/_codex_worker.md`：codex 执行器在沙箱里不能再起 `codex exec`（`workspace routing discovery failed`），所以执行器只用 `mk.py` 排队、`ingest8.py --no-commit` 入库，出图 runner（`runner.py`）由追踪者在沙箱外起；每个执行器各用自己的 `CODEX_HOME`（60b81607）。
- `_handoff/gem/DISK_RULE.md`：每张图出完清 CODEX_HOME 的 `sessions/` 与 `generated_images`；执行器日志超 150 MB 自动 gzip 轮转。
- 剧照放在主检出 `.agents/coord/imagegen-reference/identity-2026100{1,2}/`、作者给的游戏封面在 `author-20261002/`，不入库，目录里有 SOURCES.md。
- 工具维护待办（追踪者报告，低优先，未登记）：通用 `ingest.py` 的归档 / 锁路径、`ingest8.py` 不记 done.txt；`crop_frame` 已登记 TOOL-ingest-cropframe。
- 风险：剧照参考那批图会接近演员本人样貌，第二波已按「像角色不像演员」重做主角；公开发布前仍要复查。

- [ ] **AR-44 / 45 / 46（10-03 12:13 起）**：10 号出图员（Opus 5.5 子代理，codex exec，工具箱 `_handoff/gem/codex_w17/`）按作者在审核页「通过」的图对脸精修主角立绘：A1 萧峰 4 张返工图对齐 juxianzhuang_guard；A2 杨过（古天乐 1995）/ 段誉（林志颖 1997）/ 张无忌（苏有朋 2003，更帅更健壮）先出新 base 请作者批；A3 男女主角高魅力形象（侠客劲装 / 白衣飘飘，全身 + 三视图，批后交 Tripo）；A4 郭靖、黄蓉、小龙女、虚竹、赵敏、周芷若对齐通过图；B 再修 82 张剧情插图的脸。无通过图的主角等作者审。替换同路径文件、旧图备份；做完协调者跑 build_portraits → INDEX → 审核页重发（被替换图的旧结论要清掉）。
- 15:28 作者「剧照要下」：黄蓉（李一桐版）、阿青（林青霞版）剧照许可下载，10 号改出带参考版；王语嫣 5 张场景立绘对齐 mantuo_base（先重出曼陀山茶、磨坊两张）。
- [x] **AR-53 面部一致性总审**（10-03 16:35 起，19:56 完成）：139 人 454 张逐张判，一致 428（返修后复核才一致的 141 张），明显 0、轻微 0；剧情设定 1（黛绮丝扮金花婆婆，AR-63）；无法判 14、无法辨认 4、作者同意 7。返修由 10 / 11 / 12 号局部合成头部完成，同图其他人逐像素不变。产物 `.agents/coord/face_audit/`（findings.tsv 对齐到当前提交）。无作者同意图的 103 人暂以本人基础立绘为准（pending_face.tsv），作者在素材审核页逐张点「通过」即可，不另问。后续：AR-58 神态推各书配角（11 号 ch02–ch05、10 号 ch06–ch11、12 号 ch12–ch14）；全部收尾后跑 portrait_stage_runner + build_portrait_index，重发素材审核页。
- [ ] 待登记设计：**主角外观随魅力分档**（AR-45「对应魅力较高的状态」：分档阈值、各档立绘 / 3D 模型、切换时机与界面表现）。

- [ ] **AR-47 素材线第三波**（10-03 12:45 起，「素材线第三波追踪」Opus 子代理登记并驱动，执行器 Codex，同时 ≤ 3 个图像任务）：ART-region-maps（30 区域图 + 水墨衬纸）、ART-rig-std-refs（6）、ART-rig-sheet-f + TOOL-rig-parts-f（女主角三视图与切件）、ART-ruins-tiles（洞壁 / 墓道 / 石刻 / 宝箱等）、ART-cast-fill-c / -d（110 位新登记人物）、城图全量（按书拆 CITY-layouts-*，ch10 剩余 → ch01 … ch14）。进度 `_handoff/artw3/progress.md`。
  - **招式特效 VFX-sk_***（45 门，10-01 只合入 10 门）：剩 35 门（33 门未起 + sk_hama r1 FAIL〔登记把 fajin 误标绝招〕+ sk_dugu9 停在沙箱连不上 Codex），10-03 15:22 交第三波补位器，改用 Codex 执行器直跑、先试点一门；城图跑时特效最多占 1 路。起跑前先按图鉴核对各门 vars.moves 的绝招星号。旧 `.agents/coord/_batch_queue.txt` 已停用（其中 CITY-* 由 CITY-layouts-* 取代），不要再起它的 batch_run。
- [ ] 工具维护（第二波追踪移交，低优先，待登记 TOOL）：`tools/imagegen/ingest.py` 的原图归档与锁写在 `ROOT/.agents/coord/gemini_originals`，在任务工作区入库时会随工作区删除（hero-a 自包了一层改到 `_handoff/gem/`，manifest 的 source_path 因此指进 _handoff）→ 应固定写到 `_prod` 归档目录；`ingest8.py` 入库后不写 done.txt。`_handoff/gem/codex_w11–w16`（除已清的 homeN）、`baseline_small/`、`city/`、`ART-3d-tripo-avatars/`、`artw2_portrait_runner.py` 要保留（manifest 有 273 处引用）。
### 3.2 物品图（Gemini 网页）

**已完成（10-03 04:28 收工）**：食品 174、衣物、旧兵器 / 暗器 / 药物、第二批 16，加上本轮 366 张（秘籍 162、兵器 128、药材 55、暗器 21）——`assets/default/item/**` 的物品图出齐，manifest 全是 `candidate`，每张按路径单独提交（最后 76d6a377）。限流 0 次；72 张返工过，15 张第 3 次才过；返工清单 0。总联系表 `_prod/.agents/coord/gemini_qa/final_{manuals,weapons,medicine,hidden-weapons}.jpg`（04:30 已发作者）。
- 秘籍题签口径（协调者 10-03 03:25）：只写书名本体；九阴真经 / 太玄经 / 吸星大法 / 倚天屠龙功直接刻在石面或铁板；泥人图、圣火令无字；实际写的书名记在 manifest notes；规则在 `tools/imagegen/gemini_prompt.py`（bf2f2663）。
- **收下但与名录描述有出入的 5 张**（manifest notes 已写明，要不要返工待作者看总览页定）：地趣入门多了一支竹笛；红花会合集没画黑绳束带；五行奇阵函套有铜角饰；笑傲江湖曲经折谱半展开、封面有线装缝线；山野吐纳左右留白约 8%。
- 续作材料：`gemini_qa/kit/`（提示词、attempts、events、预防句、质检 / 入库脚本）、`gemini_qa/progress.md`；出图员 subagent 已结束，标签页 A = 1957635082、B = 1957635086 空闲。

**下一批**：**奢侈品 / 礼品**（AR-40）约 120–180 张——等 ART-items-gifts-catalog 写完名录与提示词（依赖 DES-items-gifts-spec 与 TOOL-catalog-9col），再起一个 Gemini 出图员 subagent，用 `make_queue.py --group items --cat collectibles` 装队列。

情景图 102 张不再由 Gemini 出（10-02 22:40 范围变更）：hero-a / hero-b 已入库 82 张插图（§3.1）。

**工具问题**：`ingest.py` 的 `crop_frame()` 遇左右白框会把主体切掉（it_miji_xingjunbu_can 第一次入库被切，出图员手工补救重入库 fa2c1895）→ 已登记 TOOL-ingest-cropframe（a43039a3，eng3 队尾）。

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

### 3.4 人物动作原型（AR-29 / AR-34 / AR-37 / AR-38）

**已合入**：
- TOOL-rig-nearside（P0）、TOOL-rig-clips（P6）、DES-rig-v1.1（7ea9a85f，tech/09 v1.1）；
- 主角·男 A 字三视图（a78e14f3，codex 出，AR-34）；
- ENG-12c-clip（26697b74，P8–P9）：`playClip` / `stopClip`、`content/anim/clip-map.yaml`、`/rig-demo`（A/B 步态、8 方向、剑招按钮，目前用占位 rig）；
- AR-37：片段模式门禁放宽到 1.0 ms（538e1454），程序步态 0.80 不动；ENG-12d-clip-perf 降为可选、排 eng3 队尾。

**在跑**：
- TOOL-rig-sheet（P2–P5、P7）：**已合入 17f08829**（9 次运行、6 轮审核）。
- [x] **原型交付**：TOOL-rig-sheet 合入（17f08829，08:44；39 张部件 + 走路 / 剑招 / 步态 A/B 三张 GIF + 姿势条带），08:45 发作者判定（AR-29，含 C8 的程序步态 vs 动作库选择）。侧视大腿按源图裤纹补绘（源图侧视双腿并拢），ART-rig-sheet-side **已合入**（85f2b464，09:31：`sheet_side_L / R`，前两栏错步站 / 抬腿为侧视分腿图，第 3 栏 T 字略偏四分之三按用途放行），下一版切件 TOOL-rig-sheet-2（待登记，等作者判定原型后）用它分大腿 / 小腿。

**3D（AR-38）**：作者定「做 2D，不做 3D」；之后在 Tripo 免费档用立绘单图生成了主角·男模型，第二次导出带 Mixamo 骨骼（65 关节、无动画、1 万三角），已入 `apps/game/public/pilot/zhujue_tripo_v1.glb`（bd64598a；作者指出左侧头发有肉色，试点里记录不修）。**ENG-12e 已合入**（81ca591b，08:17）：`/rig-demo?model=/pilot/zhujue_tripo_v1.glb` 右侧并排 3D（GLTFLoader + toon + 8 偏航转台 + 骨骼动画 / 片段重定向 + 1 / 20 实例 HUD），生产块不含试点；1 实例 10,022 三角面 1 draw、CPU 0.2–0.3 ms；0 / 90 / 180 / 270 截图 08:27 已发作者（`_handoff/rigdemo/`），2D 侧等 TOOL-rig-sheet 合入后才是真切件；中端手机实测待做。参考图与来源在主检出 `imagegen-reference/tripo/`。

旧任务 ART-rig-parts-male / female 作废，改用三视图切件。

### 3.5 素材线第二波（AR-36，10-02 22:40 登记）

| 任务 | 内容 | 执行器 | 状态（03:20） |
|---|---|---|---|
| ART-hero-refine-a | 主角复合基线精修、分时期 `_scene_<stage>` 立绘、关键剧情插图配古风题字 | codex gpt-6-astra ultra | **合入 d11b33a0**（95 张，审核一次 PASS） |
| ART-hero-refine-b | 同上，鹿鼎～雪山 | 同上 | **合入 2533a8fd**（80 张，r4 PASS） |
| ART-cast-fill-a / -b | 逐书搜主要人物列表，补缺的提示词与立绘 | codex xhigh | **合入 e1698e93 / fe4765ef**（57 张） |
| ART-cast-polish-ch09 | 万门弟子同脸修 | codex xhigh | **合入 41b24202**（06:07，六弟子各重出 1 张，联系表 `_handoff/gem/codex_w15/sheets/`） |
| CITY-layouts-all | 189 城 × 年代，照 `CITY.md` 搜史料、复原规格、`render_town.py` 总装；磁盘规则 44daac2f：全尺寸 town.png 只给白马城与各章首城，其余 0.5 预览 | codex xhigh | **合入 04f1133a**（05:28）：16 城目录——14 个完整候选 + 洛阳 / 太原（manifest 标 `rejected`：水门与内隔墙是工具缺口，构建不进包）；收尾运行修了页眉之外的两项未成。全量**不接力**，范围缩减见 §8.1；进度 `docs/design/town/progress.csv`（2367 行）/ `done.txt`，副本在 `_handoff/city/`。工具缺口已登记 **TOOL-town-gaps-1**（052aac53：水门 / 多重城垣 / 未声明墙水相交检查 / 页眉按城 / cities.yaml 庭州键与 ch10 年代带 / 唐 · 西域 · 吐蕃套件进 schema，用洛阳太原验证并改回 candidate），代码池有位时开发监督起 |
| ART-ruins-maps / -2 | 遗迹 / 地宫 Tiled 场景地图 + 预览 | codex xhigh | **合入 df54e2ef**（56 张）+ **ac069a22**（07:56：九老洞、敦煌地宫唐 / 清、达摩洞、若耶溪墓藏、华山后洞 6 张）——作者点名项完成。报告 §6 缺的遗迹贴片（洞壁 / 墓道 / 石刻 / 宝箱…）待登记贴片任务 |
| ART-items-gifts-catalog（AR-40） | 各朝代奢侈品 / 礼品名录与 Gemini 提示词 | codex xhigh | 第 1 次运行写出 151 件九列名录 + 151 份提示词，校验被校验器挡住（不认新文件）→ HOLD；等 TOOL-catalog-collectibles 合入后 `--from validate` 复验合入，再起 Gemini 出图员出 collectibles |

做法文件：`tools/agents/prompts/_codex_worker.md`；追踪交接 `_handoff/art_wave2_tracker_brief.md`；审核要点 `.agents/coord/PROD/review_checks_hero.md`（第 1 条已容许白马 / 侠客 / 鸳鸯不用剧照）/ `review_checks_ruins.md` / `review_checks_city.md`。审核模型写 `--review-model gpt-5.6-sol`（Codex 不认大写）。

### 3.6 3D 角色（AR-41，10-03 09:06 登记；AR-42 改网页版）

| 任务 | 内容 | 执行器 | 状态 |
|---|---|---|---|
| ART-3d-tripo-avatars | 男女主角高质量模型 + 骨架 + 3 个预设动作；写 `tools/model3d/tripo_cli.py` | codex gpt-6-astra xhigh | **HOLD，不再续跑**（API 余额 0；作者 AR-42 改用网页版）。CLI 留在工作区未合入 |
| ART-3d-tripo-cast | 十四书主角群约 31 位（主角精修新基线立绘）image_to_model + 骨架 | codex xhigh | **HOLD，不再续跑**（改网页版） |
| **Tripo 网页版建模**（AR-42） | 男女主角（男主角多视图）+ 29 位主要角色：生成 H3.1 + Ultra Mesh + 8K + PBR（65 点）、绑骨 20、主角 idle / walk / run 动作各 20、导出 5；面数 10 万；Private | Opus 5.5 子代理驱动作者 Chrome（Premium，余额 25125，全做约 2800–4000 点） | **完成（10-03 19:18，报告 10d02fb9）**：`assets/default/model3d/` 共 37 套 GLB（65 关节 mixamorig；19 位主角、王语嫣、阿朱、阿青、男女主角普通 / 高魅力、早先 11 位），男女主角带单文件 `anim_idle_walk_run.glb`；点数 25125 → 21620（实扣 3505，作废 380）。阿青已按 b 版新脸重做（A 字图 c813207d，模型 0ac4882a，85 点，余额 21535）；接入注意（0.98 归一化身高、2k 贴图、两种目录命名需映射）写进下一个 3D 接入任务的说明（ENG-12e 已于 08:17 合入 81ca591b）。 |

**AR-85（10-03 23:40）：3D 先只做一男一女两个通用模型，其余搁置**（重点转到 M1 跑通）：
- 在做：通用江湖男子 / 女子 A 字图（GPT 6.1 Sol）→ Tripo 子代理生成、绑骨、配待机 / 走 / 跑，入库 `assets/default/model3d/npc_generic_m/`、`npc_generic_f/`；工程侧 ENG-battle-generic-model：战斗单位没有专属模型时按性别用通用模型，单位旁显示可区分的标识，模型未到位时临时用普通形象男女主角模型。
- **搁置，待 M1 跑通后再排**：
  - [ ] AR-79 全量重做：新比例（男约八头身、女近九头身）、脸部还原、贴图严查、按原著身高；
  - [ ] 郭靖金刀驸马装模型（AR-71 / AR-74 选 B 装）；
  - [ ] 换脸主角（AR-84 等改了 base 的）模型重做。
  在跑的零点数体检和比例样张做完就收，结果留作日后参考。
  - **日后参考（10-04 00:24 收齐）**：
    - Tripo 零点数体检 `_prod/.agents/coord/ART-3d-tripo-web/audit_ar79.md`：37 套都头大身短，男中位 6.3 头身、女 6.5；Tripo 比 A 字图还会再放大头 5–15%，所以 A 字图要比目标多拉长一成；脸差的 3 套是黄蓉、韦小宝、袁紫衣（袁紫衣斗笠珠串印在脸上）；贴图问题 18 套。
    - 新比例 A 字样张 `_prod/.agents/coord/_lines/apose-ar79/apose_samples.jpg`：萧峰、郭靖男八头身，小龙女、王语嫣女九头身，原 base 头等比缩小合成。郭靖样张用的还是旧脸，已改 B（AR-87），重做时要换。
    - 人物身高草表 `_prod/.agents/coord/_lines/apose-ar79/heights.csv`（503 条），接入时按书中设定缩放。
    - 各换脸会话留下的 `todo_3d.md`（A 字图与 3D 按新脸重做）：`_lines/final-5/`、`zhangwuji-final/`、`canon-align/`、`guojing-final/`、`final-6/`。

密钥：只在主检出 `.env`（`tripo_key=…`），执行器运行时读成环境变量，不得进日志 / 报告 / manifest / 提交（`.env` 已进 `.gitignore`）。产物：`assets/default/model3d/<npc_id>/`（`model_rig.glb`、`anim_*.glb`、`preview.png`、manifest）；审核要点 `review_checks_model3d.md`。女主角没有三视图（可登记 ART-rig-sheet-f）。

---

## 4. 设计

**已合入**：
- 10-02 白天：长生诀主线（design/25）、白马唐代化、序章改版、七条长生诀支线、各书休眠事件、金钱采集药材、秘籍 / 兵器扩充、情景图清单、各朝路人、属性 v2（4e9daeb2）、白马年份同步（7a89bf9b）。
- des33 第三批 13 项（至 21:38 全部合入）：DES-sync-ids-slp（4107e6ad）、DES-rig-v1.1（7ea9a85f）、DES-sync-tech-a（a0164d38）、DES-sync-design-a（a47a3818）/ b、DES-story-hooks-g1（76fda24e）/ g2（82b2deaa）/ g3（7998951e）/ g4（16568e99）/ g5（a290ef0c）、DES-skills-reqs-v2-a（1bd60aff）/ b / c（d161579e）。
- des34：DES-items-attrs-spec（d8a6ca9c）——design/10 §4.10.5 九列名录格式（新增「说明」映射 `text.lore`、「属性投影」映射 `extension.value.attributes`），十一份名录表头已升九列。
- des35：DES-npcs-register-a（03c44028）/ b（3226fe15）——人物补齐发现的 110 个原著主要人物登记进各书名录与 design/18。

**停住 / 在等**：
- **des34 的 DES-items-lore**：**全部完成**——lore-1 兵器整份（bbce8465）、lore-3 秘籍整份（67ab5df4）、lore-5 / 6 / 7 / 8（711a48a5 / 20c1307a / 6cb074da / 1d86e1a9），11 份名录九列；lore-2 / 4 取消。下一步 TOOL-items-catalog `--force` 重新生成并提交 `content/items`（AR-39），之后 `items_from_catalog --check` 的 stale 红项消失。
- **des36 的 DES-items-gifts-spec**（礼品规格）：**合入 0496cb32**（06:37）——design/10 §11.5 礼品品类、年代可得性、每书可送礼的原著物件；design/12 §3.8 书法拜帖与各朝代求字支线。下一步 ART-items-gifts-catalog（codex 考据写名录与提示词）→ Gemini 出 collectibles。

**待办**：
- [x] **DES-sync-keyscenes-ar36**（9b43b497，05:19 合入，r1 PASS）：`key-scenes.md` §0、§16–17 的旧统计（每书恰 7 / 合计 102 / 只准 approved 参考）改成 AR-36 候选生产口径；ch01～07 各条按 hero-a 报告 §6 修正（聚贤庄新图与题字、雁门等待标记改已解决、张家口乞儿装、桃岛背诵经文、重阳杨过断右臂、梅庄 / 少林偏殿三战、长乐李四掷凳、金蛇洞铁盒等）；`story/07` §2.2 「十四岁发现铁盒、约十年后下山」措辞；design/18 孙婆婆 / 蒙哥 ID 核查。hero-b 的 ch08～14 条目、`story/09` 制衣方向、`npcs-ch09` 铃剑双侠（水笙与汪啸风）、`npcs-ch08` 顺治 / 风际中主记录核查也在任务说明里。
- [ ] design/10 §14.2 只登记 569 / 894 个物品 ID（缺 manuals 170、weapons 128、hidden-weapons 27）：lore 合入后登记同步任务；同一任务顺带把 `story/08-luding.md`（约 402、794 行）与 `chapters/08-luding.md`（约 186 行）的「顺治 / 行痴 ID 待登记」改成引用 `npc_shunzhi`（DES-sync-keyscenes-ar36 报告 §6）。
- [x] 设计定稿后的 ENG 任务已登记（eng3 队尾，四个串行）：ENG-27a 属性 v2 数据链 → 27b 战斗链 → 28a 一般书眠 → 28b 螺旋内力；27c 节奏锁放 28b 之后。金钱与采集等 ENG-20a / 26 合入后再登记。ENG-17 只覆盖 M1 里的初眠配点。

---

## 5. 开发（M1）

**已合入**：
- ENG-00 至 ENG-14（含 00b、12b）、ENG-04b、ENG-16a、ENG-21a、TOOL-rig-pipeline、TOOL-item-sprites-run、TOOL-rig-nearside、TOOL-rig-clips；
- 10-02 16:10 之后：ENG-18（76f9381a）、ENG-15（5d719561）、ENG-21b（674476bf）、ENG-25（06e613ba）、ENG-08b（627b619e）、ENG-16b（393f07dc）、ENG-12c-clip（26697b74）、ENG-16d（80b97cf5）、TOOL-items-catalog（9bdc3e5f，物品 361 → 889 个）、ENG-14b（94459b20，经脉协议 3 黄金）、ENG-17a（7543c30e，新游戏与对话，M1）、ENG-18d（4f801d3f，物品移出 entry 闭包成内容包独立叶片）、ENG-18e（1af8afcf，build.test 夹具化）。
- **ENG-19a 合入**（ed8898d6，04:32，M1 外壳：标题 / 设置 / 恢复 / 旋转提示 / 对话 / 任务组件，删掉旧 GameUi.vue 与 storage-demo.ts）、**ENG-18b 合入**（3ef22aaf，05:09，Tiled 区域地图管线）、**ENG-17 合入**（7febb5fc，05:12，书眠与章节切换 M1：序章结束 → 长白山初眠配点 → 白马）。集成分支 `pnpm check` 05:15 全绿（重建 dist 后）：127 文件 915 用例；**entry 160.17 / 170 KiB（余量 9.8 KiB）**，render 160.53 / 180，webgl total 320.70 / 350。19a 新加的 `build-shell.test.ts` 读的是上一次的 dist（旧 dist 误报、无 dist 空过）→ 登记 ENG-19c 小修；ENG-19b / 16e 说明已加「新页面组件一律懒加载、报告写 size 实测」（d433bed2），预算不放宽，再逼近就先拆分。
- **ENG-20a 合入**（d105c0b0，07:23，区域探索 core）。prod_check 全绿：130 文件 939 用例；**entry 166.34 / 170（余 3.66 KiB）**，webgl 326.87 / 350 → 登记 ENG-entry-split（目标 ≤ 155 KiB，预算不放宽）。
- **ENG-19b 合入**（8741f917，07:27，M1 界面流程：标题 → 新游戏 → 序章 → 初眠配点 → 白马）。合入后 prod_check 全绿：133 文件 948 用例；**entry 169.07 / 170（只剩 0.93 KiB）** → ENG-entry-split（目标 ≤ 155 KiB）排在所有首屏任务之前，15 个相关任务暂停。M1 的 ENG 项齐了，剩 CONTENT-ch00a / b / c、CONTENT-ch10（等拆分）。
- 此前 02:42 全绿：120 文件 825 用例；entry 129.51 / 170 KiB，webgl total 292.75 / 350（ENG-17a 后曾红到 203 / 170，ENG-18d 合入转绿）。`check:perf` 23:15（负载 7.3）：程序步态 min P95 0.319 ms，片段模式 0.795 ms（门禁已按 AR-37 放宽到 1.0）。

**在跑**（eng3 并发 3 + 单独驱动）：ENG-17（书眠、初眠配点，M1）、ENG-18b（Tiled 区域地图）、ENG-19a（外壳，M1）01:14 起第 1 次运行；TOOL-rig-sheet 第 3 次返修；TOOL-catalog-9col 复审。

**eng3 排队 19 项**（队列顺序即优先级；依赖满足就自动开跑）：ENG-12e-gltf-pilot（ready）、ENG-16c（ready）、ENG-20a（等 18b）、ENG-19b（等 19a + 17）、ENG-20b、ENG-26、ENG-23a、ENG-16e、ENG-18c、CONTENT-ch00b / ch10 / ch00a / ch00c、ENG-27a / 27b / 28a / 28b / 27c、ENG-12d（可选）；TOOL-ingest-cropframe 在队列文件末尾，下次重启生效。
- **M1 路径**：ENG-25 ✓ → ENG-17a ✓ → ENG-19a ✓ → ENG-17 ✓ → ENG-19b ✓（8741f917）→ ENG-entry-split ✓（e8357e76，entry 38.44 KiB）→ CONTENT-ch00a / b / c、CONTENT-ch10 → 新游戏 → 序章 → 初眠配点 → 白马冷入口打通。
- **M1 引擎缺口**（内容审核发现，开发监督驱动）：ENG-region-gates-data、ENG-event-executor、ENG-ink-intents、ENG-npc-species-roleslot、ENG-19e-m1-order；另登记 **ENG-move-onhit-effects**（5e56e7d5，10-03 15:20）：招式命中附带 Buff / 击退 / 可否招架字段与结算，补 bf_shiheng / bf_pojia / bf_dongyao 定义并给序章四招填值；依赖 ENG-25、16c、26、CONTENT-ch00a-data，不算 M1 阻塞；ENG-27a 改为依赖它（eng3 下次重启才生效）。
- ENG-24 浏览器冒烟：不下载 Playwright 浏览器包（AR-34），不入队。
- 开发监督提醒：ENG-17 / 18b / 19a 的工作区建于 ENG-18e 之前，若撞上 build.test 旧超时就挪基点复验。

**没人盯时的处理办法**（脚本在 `_handoff/`）：

| 情况 | 处理 |
|---|---|
| 合入冲突，停在 READY | `rebase_task.py` 挪基点，再 `--from start` 重起 |
| `_prod` 不干净，挡住合入 | `merge_when_clean.py` |
| 只挂在 rig 门禁上 | `riggate_hold.py <ID>` 停下，等负载降了再 `--from validate` |
| 单独驱动的任务停在 HOLD-REVIEWS（`--max-reviews 1` 返修后不再审） | 另起 `supervise.py <ID> --from review --max-reviews 1 --max-runs 2 --auto-merge --checks <对应 review_checks>`（03:16 TOOL-catalog-9col 就是这样处理的） |
| 设计任务停在 HOLD-REVIEWS | 手动起 `--from validate`；每个任务最多 3 次，计数记在 `devsup_revalidated.json` |
| 执行器回退到 GPT-5.5 | 立刻停、改 Sol 重跑（19:10 后 step.py 回退表只剩 Sol，不会再发生） |
| 校验失败是防截断误判或旧基点的 build.test 超时（工作区早于 ENG-18e） | 别让执行器带着误导说明返修：先把状态置 HOLD-RUNS、停驱动与刚起的执行器，加 shrink_exempt / `rebase_task.py` 挪基点，再另起 `--from validate`（03:50 ENG-17 / 19a 的处置） |

- 每批合入后跑 `pnpm check`；负载低时跑 `pnpm check:perf`，记下 loadavg。
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md`（总评 B-）里最严重的问题都已登记成 ENG 任务并陆续合入（16c、08b、16d、14b 等）。

---

## 6. 环境与运维

- **磁盘**：03:20 可用 7 GiB；昨夜两次跌到 1.1 / 2.1 GiB，原因是交换区扩容（BiRefNet 抠图每次加载 +1～5 GB；eng3 一度 4 个工作区同时 vite build）。作者批准删除：中午会话草稿 `0212031f-…/scratchpad/gem/`（2.4 GB 试稿）、`~/.codex/sessions` 旧会话（2.6 GB）、`~/.codex/thread_history_1.sqlite`（4.7 GB）；旧 Playwright 包 539 MB 也删了。现规则：codex 执行器各用任务目录下的 CODEX_HOME，合入时随日志清掉；出图 runner 2 槽；执行器日志 > 150 MB 自动 gzip 轮转；`build_portraits` 只在指定时段跑；磁盘报告线 < 3 GiB，< 2 GiB 时暂停新工作区。
- **内存 / 负载**：交换区 33.8 GB 用 32.8 GB；02:30 负载一度 42（Microsoft Defender + vite build）；eng3 并发维持 3，磁盘 ≥ 8 GiB 且负载 < 10 才回 4、才续 CITY / gifts-spec。
- **权限**：作者已在项目 `.claude/settings.local.json` 里允许启动 `supervise.py` 和 `batch_run.py`。subagent 不能 kill 进程（权限分类器拒绝），重启 / 停驱动由协调者做（作者 AR-35 授权 eng3 重启）。
- **后台进程**：都用 `_handoff/detach_launch.py` 脱离启动（新会话，ppid=1）。eng3 batch_run 89679、des34 batch_run 9492；§1 表里的 supervise 驱动；codex runner w12 20933。
- **Chrome / Gemini**：标签组由协调者在本会话建（`tabs_context_mcp createIfEmpty` + `navigate` 两个 `gemini.google.com/app`），A = 1957635082、B = 1957635086；只有可见标签页能提交，分屏窗口被别的窗口盖住就都 hidden，请作者摆到前台。
- **主检出 `.git` 残留锁**：`.git/logs/refs/remotes/origin/claude/*.lock`、`HEAD.lock` 是 root 拥有的旧锁，每次提交后的自动 gc 都报错（提交本身成功）；要作者 `sudo rm`（§8.1）。
- 会话草稿目录在 /private/tmp 下会被系统清掉；续作材料以 `_prod/.agents/coord/_handoff/` 为准。

---

## 7. 接手顺序（额度用完或会话中断后）

1. **看状态**：本文 + HANDOFF §9.8 最新条目 + `_prod/.agents/coord/_batch/*.log` + 各任务 `supervise.status.json`。§8.1 里要作者答的先请作者答。
2. **开发监督**（Opus subagent，交接 `_handoff/dev_supervisor_brief_v3.md`）：先处理停住的——TOOL-catalog-9col 合入 → lore 复验（`lore_plan.md`）→ TOOL-items-catalog 重新生成；eng3 停了就按 §6 重启（并发 3）。
3. **素材线第二波追踪**（Opus subagent，交接 `_handoff/art_wave2_tracker_brief.md`）：hero-b 合入 → cast-polish-ch09 → CITY 续作（条件见 §3.5）→ ruins（等 18b）→ items-gifts-catalog（等 gifts-spec）；runner 在沙箱外由它起。
4. **Gemini 出图员**（Opus subagent，skill `gemini-imagegen`）：先建标签组、请作者把窗口摆到前台；做完返工 31 张 + 后缀 18 本，再等 collectibles 队列。
5. **收尾**（已完成）：`build_portraits.py` → INDEX → gallery 第 4 版 10-03 09:58 全部落库 / 重发；DES-sync-keyscenes-ar36 已合入 9b43b497。
6. **清理**：AR-34 的清理已做；合入任务的日志目录由 batch_run 清，单独驱动的（`.agents/logs/ART-hero-refine-a` 336 MB 等）由追踪者归档联系表后清。

---

## 8. 待作者确认 / 决定（汇总）

### 8.0 作者 10-02 已定（AR-34～AR-40）

| 问题 | 作者答复 | 落实 |
|---|---|---|
| 主检出脏文件 / 09-30 旧工作区 / 131 张只此一份原图 / Playwright / skill 入库 / 三视图用 codex / 不买 UAL Pro（AR-34） | 记录 / 处理 / 留下写引用 / 不用 / 是 / codex / 先不买 | 都已落实（§1、§3.3、§5、§3.4） |
| 胡一刀发式、凌霜华疤、狄云乡下装、程灵素 / 苗人凤保留、eng3 重启（AR-35） | 改回 / 是 / 补出 / 保留 / 协调者执行 | 9 号出图员已补出；eng3 18:21 重启 |
| 素材线第二波六项 codex 任务（AR-36） | 原话见 `author-requirements.md` | §3.5；物品说明与属性投影在 des34 |
| 片段模式 rig 门禁（AR-37） | 放宽到 1.0 ms | 538e1454；ENG-12d 降为可选 |
| 3D（AR-38） | 做 2D；Tripo 免费档试一次 | GLB 已入 pilot，ENG-12e ready |
| 落库（AR-39） | 素材优化与生成后都要落库 | rig-sheet 部件 / GIF 随合入；重生成的 `content/items` 要提交 |
| 奢侈品 / 礼品（AR-40） | codex 考据名录，Gemini 画 | DES-items-gifts-spec → ART-items-gifts-catalog → Gemini collectibles |

### 8.1 要作者决定 / 动手（不做就卡着）

- **主检出残留锁**（每次提交 gc 报错）：
  ```bash
  sudo rm -f /Users/bytedance/Projects/jinyongqunxia/.git/logs/refs/remotes/origin/claude/*.lock /Users/bytedance/Projects/jinyongqunxia/.git/logs/refs/remotes/origin/HEAD.lock
  ```
- **hero-a 验收**：四张联系表已发（03:15）；不满意的指出人物 / 时期 / 插图名，登记返工。
- ~~城市布局图的范围~~：作者 10-03 AR-47 定**全量**（1172 个城 × 年代），由素材线第三波追踪按书拆任务、写集不相交、先 2 路并行，周期以天计。
- ~~Tripo API 充值~~：作者 10-03 定改用网页版（AR-42），不充 API。作者 12:05 已「同意下载」（GLB 与预览图）。**待作者**：上传方式二选一——修好 Chrome 扩展对 tripo3d.ai 的网站访问权限（之后正常文件上传），或同意继续用剪贴板粘贴上传（会反复覆盖作者剪贴板）；未定之前 29 位主要角色暂停上传。
- **待作者挑图**（AR-55，17:00）：① 19 位主角用「剧照结合版」（10-02 AR-32）还是凌晨精修版（`hero_bases_page/ar32_vs_now_male.jpg` / `_female.jpg`）；② 天龙八部无同意图的 7 人（阿朱、段正淳、苏星河、钟灵、薛慕华、游骥、游驹，`face_audit/sheets/ch01/`）；③ 王语嫣刘亦菲版 A / B（10 号出图中）。已定：阿青第 2 轮 B、高魅力 B、黄蓉 A。
- **界面样稿**：第二版合入 fc0fe2bb，样稿页已更新到同一地址（Gs1y41HRhgPg29YGiXjAo2，第 2 版）；DES-ui-immersive-3（按钮只留图标、六角格缩小、战场加地形植物）合入 6cd4b662，样稿页同址更新为第 3 版（16:22），截图已发作者。第二版报告的两项「需作者确认」按默认走：人物图标保留现有候选；金额八字阈值、向下截短、可展开精确值，不用苏州码子。
- **磁盘清理**（AR-50「一到五都删掉」、「六到十删除六九十」）：1–5、6、9、10 已全部完成（6 = 20 个两个月未动项目的 290 个 node_modules），7、8 保留；可用从 3.8 GiB 回到 34 GiB（17:55）。暂留：ckg_server 打开着的索引约 8 GB、在跑 MCP 用的 npx 包、Chrome 主配置缓存。
- **双儿要不要精修**（hero-b 报告）：默认不动，作者说要再登记。
- ~~110 个新登记人物要不要都出立绘~~：作者 AR-47「都要做」→ ART-cast-fill-c / -d（codex），素材线第三波追踪登记驱动。

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

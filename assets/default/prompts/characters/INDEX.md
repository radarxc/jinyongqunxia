# 人物立绘提示词 · 总索引

> 2026-10-01 作者最新提速：[每角色先1张、优先补齐基础人物](../../../../.agents/coord/portrait-generation/FAST-PRODUCTION-20261001.md)。已在途请求保留；小手指、细微装备与微偏角度集中登记，不反复磨图。覆盖下文默认2候选建议，实际候选数如实记录。

> 2026-10-01 作者最新纠正：[全人物范围、端正正面像、逐人身份参考](../../../../.agents/coord/portrait-generation/FULL-COVERAGE-IDENTITY-20261001.md)。此前111仅部分基础资产，不代表全人物；[14书界范围对账](../../../../.agents/coord/portrait-generation/full-coverage-20261001/REPORT.md)。该要求优先于下文旧审批、演员脸禁用和倾斜姿态限制，生成前同步完整提示词。

> 作者最新人物风格纠正：[人物美观写实、背景水墨](../../../../.agents/coord/portrait-generation/REALISTIC-CHARACTERS-20261001.md)。优先修正已开始的主角系列；人物衣料和体积完整、面容自然精细，不再采用破布/碎墨/飞白断裂画法。旧场景初版不计此次风格修正完成；所有输出仍candidate，先给萧峰首样。

> 本轮作者最新场景指示：[书中主角每人至少五幅经典场景](../../../../.agents/coord/portrait-generation/CLASSIC-SCENES-20261001.md)。优先点名五人共25幅，独立新建场景资产并保留基础立绘；淡景、龙、神雕与佛道艺术意象获授权，人物阶段与器物事实仍须分别核对。每场两候选择一，宽松自查后仍为candidate。此前基础补齐及英雄重绘未完项保留。

> 本轮作者最新重绘指示：[主角与明确正面重要角色强化英雄气概](../../../../.agents/coord/portrait-generation/HEROIC-REDESIGN-20261001.md)。优先完成 scope.json 中的英雄形象重绘/首绘，再补齐其余男女角色。旧图先版本备份，项目基线约束画风而不锁旧脸，可参考已实际查看的经典影视形象；宽松自查与 candidate 状态不变。每张验证落盘后再更新当前行并重读最新索引。

> 本轮作者最新指示：[先出齐男女角色，采用宽松自查](../../../../.agents/coord/portrait-generation/RELAXED-PRODUCTION-20260930.md)。现有 female/male 项目基线按授权可用于生成；候选审批状态不变，精确占高与轻微遮挡不阻塞。此指示优先于下文旧生产门槛；other 书灵另列。

> 本文件由 `tools/agents/build_portrait_index.py` 生成，不要手改；改提示词就改各人物文件，改规程就改 `GUIDE.md`，作者指示放 `_AUTHOR-NOTES.md`，然后重新生成。
> 每个人物一份提示词文件（`<分组>/<id>.md`）：文首 frontmatter 写明立绘素材 ID、输出文件与登记清单的位置，正文是人物要点、完整提示词、排除项与质检要点。

已合入 **700** 份：女 206、男 492、其他 2；品质档 A 307、B 80、S 313。

## 出图 agent 怎么用

1. 把本文件交给有 `view_image`、`image_gen` 的 GPT CLI 会话，在仓库根目录执行。本文件已嵌入完整的生成与存放规程；每个人物的完整提示词在「人物索引」表的「提示词」链接里。
2. 一个书界一个批次。先列出这一批能做的行（`status: ready`、图片和 manifest 条目都还不存在，已按 S → A → B 排好）：
   `python3 tools/agents/build_portrait_index.py --queue --book ch01`（加 `--json` 给脚本用）。
3. 对队列里的每一行，按下面「生成与存放规程」§2–§7 执行：核对身份 → 载入已批准参考 → 出 2 张候选选 1 张 → 按 `output` 存原图 → 追加 manifest → 校验交审。
4. 不要手改本文件；提示词合入后协调者会重新生成。队列为空，说明这一书界的提示词还没合入，或者已经全部出过图。

## 目录

- [出图 agent 怎么用](#出图-agent-怎么用)
- [生成与存放规程](#生成与存放规程)
- [ch00 · 《序章 · 越女剑》](#ch00--序章--越女剑)（2 份）
- [ch01 · 《天龙八部》](#ch01--天龙八部)（71 份）
- [ch02 · 《射雕英雄传》](#ch02--射雕英雄传)（56 份）
- [ch03 · 《神雕侠侣》](#ch03--神雕侠侣)（54 份）
- [ch04 · 《倚天屠龙记》](#ch04--倚天屠龙记)（68 份）
- [ch05 · 《笑傲江湖》](#ch05--笑傲江湖)（52 份）
- [ch06 · 《侠客行》](#ch06--侠客行)（42 份）
- [ch07 · 《碧血剑》](#ch07--碧血剑)（55 份）
- [ch08 · 《鹿鼎记》](#ch08--鹿鼎记)（53 份）
- [ch09 · 《连城诀》](#ch09--连城诀)（37 份）
- [ch10 · 《白马啸西风》](#ch10--白马啸西风)（24 份）
- [ch11 · 《鸳鸯刀》](#ch11--鸳鸯刀)（25 份）
- [ch12 · 《书剑恩仇录》](#ch12--书剑恩仇录)（46 份）
- [ch13 · 《飞狐外传》](#ch13--飞狐外传)（52 份）
- [ch14 · 《雪山飞狐》](#ch14--雪山飞狐)（32 份）
- [主角与书灵](#主角与书灵)（31 份）

## 撰写进度

提示词由 GPT CLI 按书界并行撰写，逐个书界过审后合入；本表在每次合入后重新生成。全部合入后本节自动消失。

| 分组 | 目录 | 状态 |
|---|---|---|
| ch01 · 《天龙八部》 | `ch01-tianlong/` | 已合入 71 份 |
| ch02 · 《射雕英雄传》 | `ch02-shediao/` | 已合入 56 份 |
| ch03 · 《神雕侠侣》 | `ch03-shendiao/` | 已合入 54 份 |
| ch04 · 《倚天屠龙记》 | `ch04-yitian/` | 已合入 68 份 |
| ch05 · 《笑傲江湖》 | `ch05-xiaoao/` | 已合入 52 份 |
| ch06 · 《侠客行》 | `ch06-xiake/` | 已合入 42 份 |
| ch07 · 《碧血剑》 | `ch07-bixue/` | 已合入 55 份 |
| ch08 · 《鹿鼎记》 | `ch08-luding/` | 已合入 53 份 |
| ch09 · 《连城诀》 | `ch09-liancheng/` | 已合入 37 份 |
| ch10 · 《白马啸西风》 | `ch10-baima/` | 已合入 24 份 |
| ch11 · 《鸳鸯刀》 | `ch11-yuanyang/` | 已合入 25 份 |
| ch12 · 《书剑恩仇录》 | `ch12-shujian/` | 已合入 46 份 |
| ch13 · 《飞狐外传》 | `ch13-feihu/` | 已合入 52 份 |
| ch14 · 《雪山飞狐》 | `ch14-xueshan/` | 已合入 32 份 |
| 主角与书灵 | `protagonist/` | 已合入 31 份 |
| characters | `characters/` | 未开工 |

## 生成与存放规程


> 2026-10-02 起以本文 §0（作者 AR-29 / AR-30）为准：禁止幼态、去 AI 味、只用文字借鉴经典造型、不上传剧照、不复刻真人面容，重出与补出条目用 `## Gemini 提示词` 出图。
>
> **2026-10-02 作者 AR-32 补充（覆盖下文「不上传剧照」，只适用于主要角色）**：各书主要角色（男女主角、与主角紧密关联的人物）改用 `codex exec`，同时上传该角色经典影视版剧照（取造型、气质、面部特征）和同性别基线立绘（取画风）重新绘制，输出必须是项目画风，不复制剧照的构图、光影与照片质感；提示词里仍不写演员名。版本：倚天苏有朋版、黄蓉朱茵版、笑傲与碧血港版；侠客、鸳鸯、白马用《金庸群侠传》头像作参考。配角与路人仍只用文字。剧照只放在不入库的 `.agents/coord/imagegen-reference/`，manifest 记原路径与 sha256。风险：新图会接近演员本人样貌，自娱可以，将来公开发布需替换。
> 此前的作者规范 [全人物覆盖、正面端正与逐人面容参考](../../../../.agents/coord/portrait-generation/FULL-COVERAGE-IDENTITY-20261001.md) 中“指定游戏/影视人物面容参考获授权”一句已由 AR-30 作废；全人物范围、正面端正等其余要求仍有效。性别基线只作画风。未提交请求须先同步，既有真实请求不回写。

在仓库根目录执行以下命令；所有 `assets/`、`docs/`、`tools/` 路径均相对仓库根目录。把本规程与目标人物提示词一起交给有 `view_image`、`image_gen` 的 GPT CLI 会话。
本规程供后续出图使用；总索引为 `assets/default/prompts/characters/INDEX.md`，由协调者生成。不要手改索引，不把提示词齐备当作图片已生成或已获批。

### 0. 重要人物重审口径（2026-10-02，AR-29 / AR-30，优先于下文）

作者 2026-10-02 要求重审所有重要人物（`docs/decisions/author-requirements.md` AR-29、AR-30）。本节优先于本文其余各节和各提示词里的旧说法，冲突时以本节为准。

1. **禁止幼态**
   - 所有人物一眼看出是成年人。原著年少的角色（如阿紫、钟灵、阿朱、小昭、殷离、郭襄、建宁公主、双儿、曾柔、沐剑屏、阿珂、程灵素）一律画成约二十岁的成年年轻人：成人的五官骨相与身体比例（女约 7 头身、男约 7.5 头身）。
   - 不画童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身。旧提示词里“未成年外观”“少女稚气”“尚未长成”“6–6.5 头身”之类要求一律作废。
   - 原著体型本身是孩童的人物（如天山童姥）和童年剧情场景，先交作者拍板；未拍板前默认按成人比例处理或不出图。
2. **去 AI 味**（逐张自查）
   - 皮肤有真实毛孔、细纹、晒痕、轻微色斑，五官与左右脸自然不对称；不磨皮、不油亮，不打美颜柔光或偶像式轮廓光。
   - 每个人有自己的骨相：提示词至少写清 2–3 个面部辨识点（脸型、眉形、眼形、鼻唇、痣或疤）和一件标志衣饰或道具；同一本书的人物两两对照，不许“同一张脸换衣服”。
   - 不要网红脸（尖下巴、大眼、高鼻的模板脸）、浓妆、蜡像感、照片质感或三维渲染；不要歪头、托腮、撩发一类摆拍姿势。
3. **辨识度参考口径**
   - 原著描写是第一依据；核不准的标（待考），不编造引文和回目。
   - 可以借鉴《金庸群侠传》（1996）头像与经典剧集造型里的服饰、发型、标志道具、配色和人物气质，但只用文字写进提示词，并做写实绘画处理。
   - 不上传、不复制任何剧照或游戏截图；提示词里不写演员、画师、公司的名字；不复刻真人面容。此前以剧照为身份参考做出的图按“真人肖像风险”逐步替换。
4. **Gemini 提示词与上传参考**
   - 重出或补出的条目，frontmatter 写 `status: redo`（补出写 `new`）、`redo_reason:`（一句话）、`reference_upload:`（要上传给 Gemini 的身份参考图路径列表，可为空）。
   - 出图只用正文最前面 `## Gemini 提示词` 的代码块（中文，原样粘贴）。原有提示词段落保留在下面作历史，`references` 也只是旧管线记录，都不再拼接或上传。
   - `reference_upload` 只能放主角和 S 级人物的立绘（AR-29；上传前由作者关闭 Gemini 活动记录）；判为脸不对的图不得上传。
   - 跨书同一人：先出被参考的那一张，确认参考路径上已是本轮新图，再出依赖它的条目。队列文件 `.agents/coord/portrait_redo/<组名>.txt` 每行写 `asset_id  # 参考: …`，已按依赖排序。
5. **画风底线**（与现有立绘一致，便于抠图管线复用）
   - 写实手绘古风：真实皮肤质感，布料的经纬、褶皱与旧化，低饱和沉稳设色，柔和自然光从左上来。
   - 2:3 竖幅、全身、站姿自然、单人，头部端正。
   - 基础立绘背景是暖浅灰纸底加极淡水墨远山，人物轮廓与背景分明（后续 BiRefNet 抠图）；剧情场景图可以画场景，但背景用低对比淡彩水墨。
   - 不要文字、水印、边框、分格。
6. **主角一致**
   - 主角男、女在十五个时代各是同一张脸，以序章 ch00 立绘为锚点；其余时代只上传 ch00 锚点作身份参考，只换服饰、发式和道具。
   - 全书辨识标志：男主平直浓眉、左眉峰一道浅白旧疤、左眉尾下小痣；女主平直浓眉、细长杏眼、右眼外下方小痣；男女主的发髻（清代为辫梢）都系一根褪色的朱红细绳。

### 1. 使用索引与安排批次

1. 把索引每一行当作一个 `asset_id` 对应的一张基础立绘；同一个人的跨书界、年龄或状态变体分别执行，不按中文姓名合并。
2. 以一个书界为一个批次，默认按 `ch01` → `ch14` 推进；主角首次形象及书灵的 `ch00` 行先作独立前置批次。书界分组从 `ch01-tianlong` 至 `ch14-xueshan`，另读 `protagonist/`。
3. 在每个书界批内先做 `S`，再做 `A`、`B`；同档优先本人已有已批准基线者，再做只有同性别风格基线者。等级取 frontmatter 的 `tier`，定义见 `docs/tech/07-asset-generation.md` §3，不另排战力等级。
4. 遇到参考或跨书依赖未满足的行，登记原因、转做本批其他可执行行；不要绕过审批门槛。完成可执行部分后整批交审，不逐张打扰作者。
5. 每人物默认生成 **2 张候选、选 1 张**；有明确缺陷时再补，单轮至多 **4 张**【建议值】，沿用 `tools/agents/prompts/ART-rework.md` 的 2–4 张范围。全部不合格则不入库，登记后安排返修。

### 2. 步骤一：读文件并核对身份与路径

1. 先读 `assets/README.md`、`assets/default/STYLE.md`（含最新审批意见）；再读 `docs/tech/07-asset-generation.md` §1.3、§1.4、§2.7、§2.9、§3、§5.2。
2. 读最新人物模板：男用 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md` §6–§7，女用 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md` §5–§6；不存在时读本工作区 `assets/default/prompts/` 同名文件。`gender: other` 的非人形不套男女人像模板的身体结构，按“人物要点”及 §4 的对应分支执行。返修另读模板“局部返修 / 局部编辑”，不要复制整个通用模板覆盖人物提示词。
3. 从索引复制提示词路径，读完 frontmatter 与“人物要点 / 提示词 / 排除项 / 质检要点”四节。以下以天龙王语嫣行示范，换人时更换 `PROMPT`：

```bash
PROMPT='assets/default/prompts/characters/ch01-tianlong/npc_wangyuyan.md'
cat "$PROMPT"
python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/ch01-tianlong --book ch01 --catalog docs/design/catalog/npcs-ch01-tianlong.md
```

4. 核对 11 个键：`asset_id`、`subject_id`、`name`、`book`、`gender`、`age_variant`、`tier`、`output`、`manifest`、`references`、`status`；仅对 `status: ready` 出图，`draft` 先交提示词负责人完善；`redo` / `new` 按 §0.4 用 `## Gemini 提示词` 出图。
5. 用 `docs/design/catalog/npcs-chNN-*.md` 核对主体，用 `docs/design/chapters/NN-*.md` 与 `docs/design/story/NN-*.md` 核对本阶段、兵器与伤残；年代查 `docs/design/02-timeline-and-world-tiers.md`，跨书年龄查 `docs/design/18-npc-and-companions.md`。主角、书灵另查 `docs/design/01-vision-and-core-loop.md` 与作者决定 P05、P54、P55。
6. 核对 `gender` 为 `male/female/other`、`age_variant` 为 `child/youth/prime/elder`、`tier` 为 `S/A/B`；取 `book` 前四位为 `chNN`，主角序章允许 `ch00`。结合 frontmatter 的 `gender: other` 与“人物要点”判断非人形主体，区分神雕等生物与抽象书灵，不仅凭姓名判断。
7. 确认 `asset_id` 以 `por_<subject_id>__` 开头，含本书界与必要变体键；`output` 必须是 `assets/default/character/<gender>/<chNN>/<asset_id>.png`，`manifest` 必须是同目录 `manifest.yaml`。从 frontmatter 取值，不凭姓名猜路径。
8. 将目标 ID 赋给 `ASSET_ID`，运行 `rg -n -F -- "$ASSET_ID" .` 全仓查重。允许索引与提示词引用同一 ID；已有图片或 manifest 条目时转 §7，禁止重复追加或直接覆盖。
9. 遵守事实优先级：作者已填决定 / 新增需求 → `docs/00-canon.md` → `docs/decisions/rulings-v1.md` → 唯一归属文档；本轮工具与风格执行本任务及 STYLE 已照录的新作者指令，不沿用旧 TraeX 入口。

### 3. 步骤二：准备并实际载入参考图

1. 逐条检查 frontmatter `references` 的路径和用途，打开参考图所属目录的 `manifest.yaml`；以当前版本条目的 `status: approved` 与实测哈希为准，不凭旧模板、“曾通过”或文件名认定批准。
2. 新人物只用项目自生成、已批准的同性别基线；到 `assets/default/baseline/character/<gender>/manifest.yaml` 选取。本人已有合格基线时排第一，注明“同一主体，保持识别锚与造型延续”；其他人基线仅约束纸底、光线、笔触、设色，不继承脸、体型、服饰与道具。
3. 先核对最新返修记录：同 ID 新版为 `candidate` 时不得继承旧版批准；有待合入返修而工作区仍留旧版时，交协调者确认当前供生产版本，默认暂缓该参考，不自行换用另一工作副本的图片。
4. 将所选参考的仓库路径赋给 `REF`，运行下列命令，取得绝对路径并与参考 manifest 的 `sha256` 比对；每张参考均如此处理：

```bash
python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve(strict=True))' "$REF"
shasum -a 256 "$REF"
```

5. 对每张绝对路径调用 `view_image` 实际查看，再把这些绝对路径按相同顺序传入 `image_gen` 的 `referenced_image_paths`。只在提示词中写路径不算输入参考；不要同时传 `num_last_images_to_include`。
6. 跨书同一人物追加较早书界已批准的自生成立绘作身份参考，先保留本人基线在第一位；较早版尚未批准则暂缓后版。保留主体识别锚（人形含脸部识别锚，非人形按其设定），年龄、伤残、衣装与装备仍服从目标书界。
7. `references: []` 不代表免审批许可；无合格同性别基线时先登记基线缺口，继续其他行。`other` 的生物 / 抽象书灵不套人类性别参考，缺相应已批准基线时先另派基线任务。
8. 实际输入必须与提示词的参考说明一致；需要替换、增删参考时，先由有写权限的提示词负责人同步文件并复检。入库 `references` 仅登记本次真正传入的图，不把历史输入或候选自动列入。

### 4. 步骤三：生成候选并逐张自查

1. 使用 `assets/README.md` 指定的本地 GPT CLI / Codex 内置 `image_gen`；执行配置按任务核实，默认 `gpt-6-astra`、`ultra`。工具不可用时登记阻断，不自行切换服务或用代码绘制人物。
2. 将人物文件“提示词”下 `text` 代码块全文原样作为主文本，紧接换行与“排除项”全文，组成实际 `prompt`。保留完整文字，不缩写、不把人物要点表替代提示词；`negative` 登记排除项同文。
3. 调用 `image_gen` 时设 `prompt` 为上述完整字符串，`referenced_image_paths` 为 §3 已查看的绝对路径数组，`transparent_background: false`。在文字中明确竖幅 `2:3`、统一不透明暖浅灰纸底；主体按 §2 的判断分支：人形人物用单人全身，神雕等生物用单个生物的完整主体，书灵按 `docs/design/01-vision-and-core-loop.md` §5.1 的抽象墨影设定保留单一完整墨影。仅在人物文件不符对应分支或共通要求时先修提示词再调用，不要求非人形补入人类头足、双手等结构。
4. 每次请求一张独立 PNG，默认调用两次形成两张候选；不要拼成二联画或联系表。只传当前工具实际支持的参数，不臆造 `n`、像素尺寸或种子参数；保存返回的每张原图路径及完整调用文本。
5. 对每张候选调用 `view_image`，逐条检查人物文件“质检要点”，再查以下通用清单；`B` 档也逐张自查。把候选数、入选理由、逐张淘汰原因记入最终条目的 `notes`。

| 检查项 | 执行动作 |
|---|---|
| 身份与阶段 | 人形对照年龄、体型、神情、脸部差异与标志物；非人形对照“人物要点”中的形态、阶段与识别锚，不强加人的年龄或面容；不要提前出现后期官爵、兵器、伤残；同主体与参考并排看是否延续其身份。 |
| 风格与构图 | 人形落实男性偏写实、女性偏美丽；各分支保留柔和左上光、暖浅灰纸底。人形用单人全身，完整保留设定中的头足、双手、兵器端点与衣带，占画高目标 88–92%；神雕等生物用单个生物的完整主体，按提示词保留喙、翼、尾、爪等既定部位；书灵按 `design/01` §5.1 保留单一抽象墨影的完整轮廓与识别锚。非人形占高按对应提示词，不套人体比例、不补人类头足或双手；各分支均不得以裁边隐藏缺陷。 |
| 衣装与结构 | 以该人物提示词与 `tech/07` §2.7 的年代、族群、成长背景与身份规定为准；汉式交领为穿着者左襟压右襟的右衽，契丹、女真、蒙古等符合设定的左衽允许保留，禁止水平翻转；按主体设定查手指关节、握柄、鞘长与同轴、佩挂连接、重心。非人形仅检查设定中存在的身体结构、衣装与道具，不适用项记“不适用”，不据此补画人类结构或服饰。 |
| 年龄与尊重 | 所有人物按成年人画、禁止幼态（§0.1）；衣着完整端庄，不性感化；老人、伤残及非标准体型如实表现，不恶搞丑化；非人形按其设定检查。 |
| 禁止项 | 不用演员肖像、剧照、游戏截图、受保护画作作图生图源或上传参考；正负提示词均不写演员名、画师名、游戏公司或具体改编作品名；不复刻真人面容（§0.3）；人物名、原著书界名可用于定位，不作仿作要求。 |
| 成图完整性 | 排除伪字、题字、签名、印章、装饰水印、现代物件、额外人物、畸形与无依据特效；保留工具自带水印、元数据及溯源标识，不去除或伪造。 |

6. 比较全部合格候选，选最符合人物与作者意见的一张；原著经典标志物错误、汉式交领误作左衽、人形的明显手部畸形等不作为“轻微偏差”放行；符合该人物提示词与 `tech/07` §2.7 族群规定的左衽不属缺陷。无法看清的结构写明未验证，不冒称合格。
7. 原著细节未逐字核对时沿用 **（待考）**，记录书名与人物 / 情节核对目标；脸型细部、配色等补足标 **（原创扩展）**，不得编造引文、回目或材质依据。

### 5. 步骤四：按 output 原字节存放并实测

1. 保留工具原图（通常位于 `~/.codex/generated_images/`，以真实返回路径为准）；把入选图的绝对路径赋给 `SOURCE`。落选图不复制进仓库，也不放入 `revisions/`，只登记数量与原因。
2. 对首次入库执行下块：从 `PROMPT` 读取目标路径、建目录、复制原字节、打印登记所需的实测值；已存在目标会拒绝覆盖，按 §7 处理。

```bash
python3 - "$PROMPT" "$SOURCE" <<'PY'
import hashlib, json, sys
from datetime import datetime, timezone
from pathlib import Path
import yaml
from PIL import Image
fm = yaml.safe_load(Path(sys.argv[1]).read_text(encoding='utf-8').split('---', 2)[1])
aid, gender, book = fm['asset_id'], fm['gender'], fm['book'][:4]
out, manifest = Path(fm['output']), Path(fm['manifest'])
assert fm['status'] == 'ready' and gender in ('male', 'female', 'other')
assert out == Path(f'assets/default/character/{gender}/{book}/{aid}.png')
assert manifest == out.parent / 'manifest.yaml'
entries = yaml.safe_load(manifest.read_text(encoding='utf-8')) if manifest.exists() else []
assert isinstance(entries, list), 'manifest 顶层必须是列表'
assert not out.exists() and not any(e['id'] == aid for e in entries), '已有资产，禁止重复入库'
src = Path(sys.argv[2]).expanduser().resolve(strict=True)
with Image.open(src) as im:
    w, h = im.size
    fmt, mode = im.format, im.mode
    im.verify()
assert fmt == 'PNG' and w * 3 == h * 2 and min(w, h) >= 512
raw = src.read_bytes()
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('xb') as target:
    target.write(raw)
assert out.read_bytes() == raw
print(json.dumps(dict(id=aid, file=out.name, manifest=str(manifest),
    category=f'character/{gender}', source_path=str(src), size=f'{w}x{h}', mode=mode,
    sha256=hashlib.sha256(raw).hexdigest(),
    created=datetime.fromtimestamp(src.stat().st_mtime, timezone.utc).isoformat()), ensure_ascii=False, indent=2))
PY
```

3. 将 `created` 的取值说明记为“源 PNG 落盘 mtime，UTC”；保留源图，不用复制后的时间冒充生成时间。再次打开入库图确认可读。
4. 正式立绘母版 `2048×3072 RGBA PNG` 是 `tech/07` §1.3 的运行时管线规格；本批保存工具真实输出，例如 `1024×1536` 仍是 `2:3`，但不等于已完成正式母版。实测登记尺寸与模式，不把 RGB 写成 RGBA。
5. 本步骤不得裁切、水平镜像、放大、重编码、抠图或去标；抠图、透明化、放大与运行时导出交后续管线。尺寸不符时记录并重出，禁止修改像素或元数据凑验收。

### 6. 步骤五：追加 manifest 登记

1. 在 frontmatter `manifest` 指向的文件中追加 **一条**，顶层用 YAML 列表，每条从顶格 `- id:` 开始，其他字段缩进两格；不要另包 `assets:`。文件不存在时新建；空列表 `[]` 改成首条列表，非空列表仅在末尾追加，不重排、重新序列化既有条目。
2. 按下表填齐 `assets/README.md` 的全部字段；`prompt`、`negative` 用 YAML 块标量（无结尾换行用 `|-`，有结尾换行用 `|`），解析后须与实际调用文字一致。候选输出多张也只登记入选的一张。

| 字段 | 填写规则 |
|---|---|
| `id` / `file` | `id = asset_id`；`file` 写相对 manifest 所在目录的 PNG 文件名，即 `<asset_id>.png`，不要重复写 `assets/` 全路径。 |
| `category` / `style` | 写 `character/male`、`character/female` 或 `character/other`，与目录一致；`style: default`。 |
| `subject` | 写姓名、`subject_id`、书界、年代与本次年龄 / 剧情阶段；不要只写姓名。 |
| `prompt` / `negative` | 写入选图实际提交的完整 `prompt`（含追加排除项）及完整排除项；返修时保存实际编辑全文，不用初版文字冒充。 |
| `references` | 写实际输入的有序列表，每项含 `path`、`use`；在用途中附资产 ID、版本 / 哈希与“本人延续 / 仅风格 / 编辑目标”。仓库相对路径便于追溯，实际调用的绝对路径与顺序也登记在 `notes`。无实际输入才写 `[]`。 |
| `tool` / `model` / `effort` | `tool: "codex exec · image_gen"`；按已核实的会话执行配置记 `model`、`effort`，默认 `gpt-6-astra` / `ultra`。它们是执行配置，不是工具未公开的底层成像模型；缺凭据写明 **（待核实）**，不伪造参数。 |
| `created` / `source_path` | 使用 §5 打印的带时区 ISO 时间与实际原图绝对路径，不复制别人的时间或来源。 |
| `size` / `sha256` | 使用 §5 实测的 `宽x高` 与完整 64 位 SHA-256；不得拿目标规格、参考图尺寸或旧哈希代填。 |
| `status` | 一律写 `candidate`；自查通过和 GPT 审核 PASS 均不等于作者批准。 |
| `notes` | 记提示词文件路径、`tier`、生成 / 入选 / 淘汰数量、各淘汰原因、实际参考顺序、与提示词的偏差、图像模式与母版差距、待考项、待核实项；返修加作者意见原文与轮次。 |

3. 不修改人物提示词 frontmatter 的 `status` 来表示图片审批；当前提示词状态只有 `draft/ready`，图片状态归 manifest。将提示词状态变更留给相应维护流程，绝不自行写 `approved`。
4. 将原有 `approved` PNG 与 manifest 整条原文逐字节保持；保存前后比较原始字节，不能只比较 YAML 解析值。只追加新条目，不因格式化、排序或更新时间触碰获批条目。

### 7. 步骤六：校验、交审与返修

1. 将本目录应有图片条目数独立核算为 `N = 生成前图片条目数 + 本批新增入选数`；更新已有候选时增量为 0。不要把生成候选数当入库数，也不要直接用可能漏登的 manifest 自身计数作期望值。
2. 将当前 frontmatter 的 manifest 所在目录赋给 `MANIFEST_DIR`，将上式结果赋给 `N`，执行以下命令；例如首次向空目录入选 3 张，使用 `N=3`：

```bash
python3 tools/agents/check_assets.py "$MANIFEST_DIR" --min "$N" --max "$N"
python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/ch01-tianlong --book ch01 --catalog docs/design/catalog/npcs-ch01-tianlong.md
python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/protagonist --min 31
git diff --check
```

3. 按当前书界替换第二条的分组、书界与名录路径；第三条仅检查完整主角组（男女 `2×15` 时代版 + 书灵 `1 = 31` 份，见 `tools/agents/prompts/ART-portrait-pc.md`）。不要沿用基线检查的 `--min 1 --max 2` 限制正式人物目录。
4. 另查实际 PNG 与 manifest 一一对应、跨组 `asset_id/output` 无重名、参考仍获批且哈希一致；结构脚本不检查美感、原著标志物、审批资格或所有跨组冲突。索引汇总与全库查重交协调者执行 `tools/agents/build_portrait_index.py`，不要手改索引。
5. 校验通过后，把入选图、manifest、逐图自查、考据边界和阻断项交给 GPT 审核；由协调者按 `tools/agents/gpt_review.py` 流程覆盖本批全部图片。GPT PASS 后统一上作者审批页；FAIL 按意见返修再审。
6. 作者对当前图片版本明确通过后，才由审批流程把对应 manifest 条目改为 `approved`；将决定绑定到实际图片哈希，旧版批准不自动传给新图。作者要求修改时保持 `candidate`，记录原话后返修。
7. 当前 `tools/review/build.py` 和 `tools/agents/apply_reviews.py` 仅处理基线目录；正式 `assets/default/character/` 的上页与回写须由协调者接通。接通前保留 `candidate` 并交付待审清单，不谎报脚本已覆盖正式立绘。
8. 局部返修优先读男模板 §5–§6、女模板 §4–§5 的局部编辑用法：先 `view_image` 看作者指定底图，把它作为唯一编辑目标输入，明确修改区及保持的主体识别锚、造型、光照、构图（人形含脸、体型与衣装，非人形按 §4 对应分支）；每张候选从同一底图独立编辑，复查非目标区域漂移。
9. 候选图可作为其自身返修的编辑底图，不得作为其他人物的风格基线。只在已授权返修且目标非 `approved` 时替换同 ID 候选并更新原条目，不追加重复 ID；保留旧源图路径 / 哈希，避免参考路径覆盖后指向成图自身。
10. 对已 `approved` 的文件与条目保持逐字节不动；如作者又要求变更，先交协调者明确新版本的 ID、输出路径及任务写集，再处理新候选。不要套用历史返修任务的特殊覆盖授权。

### 8. 并行分工与跨书一致性

1. 每个生成批次只写自己书界的 `assets/default/character/<male|female|other>/<chNN>/` 图片与各目录 manifest；共用基线、STYLE、名录、模板与索引只读。提示词修正交相应负责人，提交与合入交协调者。
2. 给每个 manifest 指定唯一写入者；不同书界可并行，同一书界不得按人物拆成多个同时追加 manifest 的执行器。不要在共享目录放落选候选或别人的产物。
3. `protagonist/` 是提示词分组，不是输出隔离目录；其各时代版本落在相应书界目录。把主角行交该书界批次统一入库，或先完成主角阶段、释放目录后再做 NPC，避免两个批次同时写同一 manifest。
4. 同一 `subject_id` 的跨书版本使用各自 `asset_id`，先完成较早书界并获批，再把该图加入较晚版本的身份参考；主角男女分别保持各自同一人。具体年龄和形象阶段仍以该版名录、章节与剧情为准。

1，2，3，4太简单了，所以哦度斜对了

### 9. 常见问题与开放问题（附默认值）

| 问题 | 默认执行方式 |
|---|---|
| 本人基线或同性别基线尚未通过 | 不用 `candidate/rejected` 作新图参考；本人已有基线仍待审时暂缓本人，无本人基线的新角色可用已批准同性别风格基线；没有合格基线则登记缺口、转做其他行。 |
| 提示词与人物名录 / 章节不一致 | 按名录与章节的归属事实处理，结合剧情阶段和更高优先级作者决定；先让提示词负责人修正再原样调用，不在工具里偷偷改成另一版本。归属文档互相冲突时登记具体位置并暂缓该行。 |
| 图里出现文字、装饰水印或人形手部畸形 | 淘汰并写原因，补生成或按局部编辑流程修复对应主体结构；非人形按 §4 检查其既定结构，不因没有人类双手而判缺陷。文字 / 装饰水印优先重出。工具自带溯源标识原样保留，不能裁边、涂抹、去标后入库。 |
| 原著标志物漏画或画错 | 回查该人物提示词依据、物品 / 武学图鉴及本书阶段；先改错词，再编辑或重出。未核清材料、数量等标（待考），不要凭记忆编回目，也不要为了“经典形象”提前加后期装备。 |
| 每人物候选张数需作者确认 | 默认 2 张、缺陷时补至单轮最多 4 张【建议值】；只选 1 张，全部不合格则 0 张入库，另列返修。 |
| 批次顺序需作者确认 | 默认主角首次形象 / 书灵 `ch00` 前置，随后 `ch01` → `ch14`；批内 `S` → `A` → `B`，同档本人已批准基线优先；独立书界可并行，跨书身份链保持先后。 |
| 是否把未通过审批的基线当参考 | 默认否；只有针对该图自身、已授权的局部返修可将其作为编辑底图，不能借此启动新人物批量生成。 |
| 正式立绘审批工具尚未接通 | 默认交协调者待审，不自行标通过；待审批页和回写覆盖正式目录后，按本规程 §7 完成作者审批。 |

## 人物索引

表中"输出文件"就是出图后要保存到的位置（`assets/default/character/<性别>/<书界>/`）；"登记"是该目录的 `manifest.yaml`。

### ch00 · 《序章 · 越女剑》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿青 | `npc_aqing` | 女 | 少年 / 青年 | S | [npc_aqing.md](ch00-yuenv/npc_aqing.md) | `por_npc_aqing__ch00_youth_base` | `assets/default/character/female/ch00/por_npc_aqing__ch00_youth_base.png` | new |
| 2 | 范蠡 | `npc_fanli` | 男 | 壮年 | A | [npc_fanli.md](ch00-yuenv/npc_fanli.md) | `por_npc_fanli__ch00_prime_base` | `assets/default/character/male/ch00/por_npc_fanli__ch00_prime_base.png` | new |

### ch01 · 《天龙八部》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿碧 | `npc_abi` | 女 | 少年 / 青年 | A | [npc_abi.md](ch01-tianlong/npc_abi.md) | `por_npc_abi__ch01_youth_qinyun_base` | `assets/default/character/female/ch01/por_npc_abi__ch01_youth_qinyun_base.png` | ready |
| 2 | 阿朱 | `npc_azhu` | 女 | 少年 / 青年 | S | [npc_azhu.md](ch01-tianlong/npc_azhu.md) | `por_npc_azhu__ch01_youth_alive_base` | `assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png` | redo |
| 3 | 阿紫 | `npc_azi` | 女 | 少年 / 青年 | S | [npc_azi.md](ch01-tianlong/npc_azi.md) | `por_npc_azi__ch01_youth_sighted_base` | `assets/default/character/female/ch01/por_npc_azi__ch01_youth_sighted_base.png` | redo |
| 4 | 白世镜 | `npc_baishijing` | 男 | 壮年 | A | [npc_baishijing.md](ch01-tianlong/npc_baishijing.md) | `por_npc_baishijing__ch01_prime_xingzilin_base` | `assets/default/character/male/ch01/por_npc_baishijing__ch01_prime_xingzilin_base.png` | ready |
| 5 | 包不同 | `npc_baobutong` | 男 | 壮年 | B | [npc_baobutong.md](ch01-tianlong/npc_baobutong.md) | `por_npc_baobutong__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_baobutong__ch01_prime_baseform_base.png` | ready |
| 6 | 刀白凤 | `npc_daobaifeng` | 女 | 壮年 | A | [npc_daobaifeng.md](ch01-tianlong/npc_daobaifeng.md) | `por_npc_daobaifeng__ch01_prime_yuxu_base` | `assets/default/character/female/ch01/por_npc_daobaifeng__ch01_prime_yuxu_base.png` | ready |
| 7 | 邓百川 | `npc_dengbaichuan` | 男 | 壮年 | B | [npc_dengbaichuan.md](ch01-tianlong/npc_dengbaichuan.md) | `por_npc_dengbaichuan__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_dengbaichuan__ch01_prime_baseform_base.png` | ready |
| 8 | 丁春秋 | `npc_dingchunqiu` | 男 | 老年 | S | [npc_dingchunqiu.md](ch01-tianlong/npc_dingchunqiu.md) | `por_npc_dingchunqiu__ch01_elder_free_base` | `assets/default/character/male/ch01/por_npc_dingchunqiu__ch01_elder_free_base.png` | ready |
| 9 | 段延庆 | `npc_duanyanqing` | 男 | 老年 | S | [npc_duanyanqing.md](ch01-tianlong/npc_duanyanqing.md) | `por_npc_duanyanqing__ch01_elder_disabled_base` | `assets/default/character/male/ch01/por_npc_duanyanqing__ch01_elder_disabled_base.png` | ready |
| 10 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu.md](ch01-tianlong/npc_duanyu.md) | `por_npc_duanyu__ch01_youth_shizi_base` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_shizi_base.png` | candidate |
| 11 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu__scene_langhuan_scroll.md](ch01-tianlong/npc_duanyu__scene_langhuan_scroll.md) | `por_npc_duanyu__ch01_youth_scene_langhuan_scroll` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_langhuan_scroll.png` | candidate |
| 12 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu__scene_lingbo_escape.md](ch01-tianlong/npc_duanyu__scene_lingbo_escape.md) | `por_npc_duanyu__ch01_youth_scene_lingbo_escape` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_lingbo_escape.png` | redo |
| 13 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu__scene_shaoshi_invisible_sword.md](ch01-tianlong/npc_duanyu__scene_shaoshi_invisible_sword.md) | `por_npc_duanyu__ch01_youth_scene_shaoshi_invisible_sword` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_shaoshi_invisible_sword.png` | candidate |
| 14 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu__scene_tianlongtemple_first_sword.md](ch01-tianlong/npc_duanyu__scene_tianlongtemple_first_sword.md) | `por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword.png` | redo |
| 15 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu__scene_wuliang_fan.md](ch01-tianlong/npc_duanyu__scene_wuliang_fan.md) | `por_npc_duanyu__ch01_youth_scene_wuliang_fan` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_wuliang_fan.png` | redo |
| 16 | 段正淳 | `npc_duanzhengchun` | 男 | 壮年 | A | [npc_duanzhengchun.md](ch01-tianlong/npc_duanzhengchun.md) | `por_npc_duanzhengchun__ch01_prime_wangye_base` | `assets/default/character/male/ch01/por_npc_duanzhengchun__ch01_prime_wangye_base.png` | ready |
| 17 | 段正明 | `npc_duanzhengming` | 男 | 壮年 | A | [npc_duanzhengming.md](ch01-tianlong/npc_duanzhengming.md) | `por_npc_duanzhengming__ch01_prime_emperor_base` | `assets/default/character/male/ch01/por_npc_duanzhengming__ch01_prime_emperor_base.png` | redo |
| 18 | 风波恶 | `npc_fengboe` | 男 | 壮年 | B | [npc_fengboe.md](ch01-tianlong/npc_fengboe.md) | `por_npc_fengboe__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_fengboe__ch01_prime_baseform_base.png` | ready |
| 19 | 甘宝宝 | `npc_ganbaobao` | 女 | 壮年 | A | [npc_ganbaobao.md](ch01-tianlong/npc_ganbaobao.md) | `por_npc_ganbaobao__ch01_prime_wanjie_base` | `assets/default/character/female/ch01/por_npc_ganbaobao__ch01_prime_wanjie_base.png` | new |
| 20 | 鸠摩智 | `npc_jiumozhi` | 男 | 壮年 | S | [npc_jiumozhi.md](ch01-tianlong/npc_jiumozhi.md) | `por_npc_jiumozhi__ch01_prime_guoshi_base` | `assets/default/character/male/ch01/por_npc_jiumozhi__ch01_prime_guoshi_base.png` | ready |
| 21 | 康敏 | `npc_kangmin` | 女 | 壮年 | A | [npc_kangmin.md](ch01-tianlong/npc_kangmin.md) | `por_npc_kangmin__ch01_prime_xingzilin_base` | `assets/default/character/female/ch01/por_npc_kangmin__ch01_prime_xingzilin_base.png` | new |
| 22 | 枯荣大师 | `npc_kurong` | 男 | 老年 | A | [npc_kurong.md](ch01-tianlong/npc_kurong.md) | `por_npc_kurong__ch01_elder_hujing_base` | `assets/default/character/male/ch01/por_npc_kurong__ch01_elder_hujing_base.png` | redo |
| 23 | 李青萝 | `npc_liqingluo` | 女 | 壮年 | A | [npc_liqingluo.md](ch01-tianlong/npc_liqingluo.md) | `por_npc_liqingluo__ch01_prime_mantuo_base` | `assets/default/character/female/ch01/por_npc_liqingluo__ch01_prime_mantuo_base.png` | new |
| 24 | 李秋水 | `npc_liqiushui` | 女 | 老年 | S | [npc_liqiushui.md](ch01-tianlong/npc_liqiushui.md) | `por_npc_liqiushui__ch01_elder_veiled_base` | `assets/default/character/female/ch01/por_npc_liqiushui__ch01_elder_veiled_base.png` | ready |
| 25 | 马大元 | `npc_madayuan` | 男 | 老年 | A | [npc_madayuan.md](ch01-tianlong/npc_madayuan.md) | `por_npc_madayuan__ch01_elder_memory_base` | `assets/default/character/male/ch01/por_npc_madayuan__ch01_elder_memory_base.png` | new |
| 26 | 梦姑 | `npc_menggu` | 女 | 少年 / 青年 | A | [npc_menggu.md](ch01-tianlong/npc_menggu.md) | `por_npc_menggu__ch01_youth_xixia_base` | `assets/default/character/female/ch01/por_npc_menggu__ch01_youth_xixia_base.png` | new |
| 27 | 慕容博 | `npc_murongbo` | 男 | 老年 | S | [npc_murongbo.md](ch01-tianlong/npc_murongbo.md) | `por_npc_murongbo__ch01_elder_revealed_base` | `assets/default/character/male/ch01/por_npc_murongbo__ch01_elder_revealed_base.png` | ready |
| 28 | 慕容复 | `npc_murongfu` | 男 | 壮年 | S | [npc_murongfu.md](ch01-tianlong/npc_murongfu.md) | `por_npc_murongfu__ch01_prime_jiazhu_base` | `assets/default/character/male/ch01/por_npc_murongfu__ch01_prime_jiazhu_base.png` | ready |
| 29 | 木婉清 | `npc_muwanqing` | 女 | 少年 / 青年 | A | [npc_muwanqing.md](ch01-tianlong/npc_muwanqing.md) | `por_npc_muwanqing__ch01_youth_unmasked_base` | `assets/default/character/female/ch01/por_npc_muwanqing__ch01_youth_unmasked_base.png` | redo |
| 30 | 秦红棉 | `npc_qinhongmian` | 女 | 壮年 | A | [npc_qinhongmian.md](ch01-tianlong/npc_qinhongmian.md) | `por_npc_qinhongmian__ch01_prime_jianghu_base` | `assets/default/character/female/ch01/por_npc_qinhongmian__ch01_prime_jianghu_base.png` | new |
| 31 | 全冠清 | `npc_quanguanqing` | 男 | 壮年 | A | [npc_quanguanqing.md](ch01-tianlong/npc_quanguanqing.md) | `por_npc_quanguanqing__ch01_prime_xingzilin_base` | `assets/default/character/male/ch01/por_npc_quanguanqing__ch01_prime_xingzilin_base.png` | new |
| 32 | 阮星竹 | `npc_ruanxingzhu` | 女 | 壮年 | A | [npc_ruanxingzhu.md](ch01-tianlong/npc_ruanxingzhu.md) | `por_npc_ruanxingzhu__ch01_prime_xiaojinghu_base` | `assets/default/character/female/ch01/por_npc_ruanxingzhu__ch01_prime_xiaojinghu_base.png` | new |
| 33 | 扫地僧 | `npc_saodiseng` | 男 | 老年 | A | [npc_saodiseng.md](ch01-tianlong/npc_saodiseng.md) | `por_npc_saodiseng__ch01_elder_cangjingge_base` | `assets/default/character/male/ch01/por_npc_saodiseng__ch01_elder_cangjingge_base.png` | redo |
| 34 | 司空玄 | `npc_sikongxuan` | 男 | 壮年 | B | [npc_sikongxuan.md](ch01-tianlong/npc_sikongxuan.md) | `por_npc_sikongxuan__ch01_prime_wuliang_base` | `assets/default/character/male/ch01/por_npc_sikongxuan__ch01_prime_wuliang_base.png` | ready |
| 35 | 苏星河 | `npc_suxinghe` | 男 | 老年 | A | [npc_suxinghe.md](ch01-tianlong/npc_suxinghe.md) | `por_npc_suxinghe__ch01_elder_zhenlong_base` | `assets/default/character/male/ch01/por_npc_suxinghe__ch01_elder_zhenlong_base.png` | redo |
| 36 | 天山童姥 | `npc_tonglao` | 女 | 老年 | S | [npc_tonglao.md](ch01-tianlong/npc_tonglao.md) | `por_npc_tonglao__ch01_elder_rejuvenating_base` | `assets/default/character/female/ch01/por_npc_tonglao__ch01_elder_rejuvenating_base.png` | redo |
| 37 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan.md](ch01-tianlong/npc_wangyuyan.md) | `por_npc_wangyuyan__ch01_youth_mantuo_base` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_mantuo_base.png` | redo |
| 38 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan__scene_mantuo_camellia.md](ch01-tianlong/npc_wangyuyan__scene_mantuo_camellia.md) | `por_npc_wangyuyan__ch01_youth_scene_mantuo_camellia` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_mantuo_camellia.png` | redo |
| 39 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan__scene_mill_hairpin_exchange.md](ch01-tianlong/npc_wangyuyan__scene_mill_hairpin_exchange.md) | `por_npc_wangyuyan__ch01_youth_scene_mill_hairpin_exchange` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_mill_hairpin_exchange.png` | redo |
| 40 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan__scene_shaoshi_plea.md](ch01-tianlong/npc_wangyuyan__scene_shaoshi_plea.md) | `por_npc_wangyuyan__ch01_youth_scene_shaoshi_plea` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_shaoshi_plea.png` | redo |
| 41 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan__scene_tingxiang_discernment.md](ch01-tianlong/npc_wangyuyan__scene_tingxiang_discernment.md) | `por_npc_wangyuyan__ch01_youth_scene_tingxiang_discernment` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_tingxiang_discernment.png` | redo |
| 42 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan__scene_well_self_choice.md](ch01-tianlong/npc_wangyuyan__scene_well_self_choice.md) | `por_npc_wangyuyan__ch01_youth_scene_well_self_choice` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_well_self_choice.png` | redo |
| 43 | 吴长风 | `npc_wuchangfeng` | 男 | 老年 | B | [npc_wuchangfeng.md](ch01-tianlong/npc_wuchangfeng.md) | `por_npc_wuchangfeng__ch01_elder_xingzilin_base` | `assets/default/character/male/ch01/por_npc_wuchangfeng__ch01_elder_xingzilin_base.png` | ready |
| 44 | 无崖子 | `npc_wuyazi` | 男 | 老年 | A | [npc_wuyazi.md](ch01-tianlong/npc_wuyazi.md) | `por_npc_wuyazi__ch01_elder_pretransfer_base` | `assets/default/character/male/ch01/por_npc_wuyazi__ch01_elder_pretransfer_base.png` | redo |
| 45 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng.md](ch01-tianlong/npc_xiaofeng.md) | `por_npc_xiaofeng__ch01_prime_gaibang_base` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png` | candidate |
| 46 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_juxianzhuang_guard.md](ch01-tianlong/npc_xiaofeng__scene_juxianzhuang_guard.md) | `por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png` | candidate |
| 47 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_northern_forest_hunt.md](ch01-tianlong/npc_xiaofeng__scene_northern_forest_hunt.md) | `por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt.png` | redo |
| 48 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_shaoshi_dragon_palm.md](ch01-tianlong/npc_xiaofeng__scene_shaoshi_dragon_palm.md) | `por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png` | redo |
| 49 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_songhelou_wine.md](ch01-tianlong/npc_xiaofeng__scene_songhelou_wine.md) | `por_npc_xiaofeng__ch01_prime_scene_songhelou_wine` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_songhelou_wine.png` | redo |
| 50 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_xingzilin_departure.md](ch01-tianlong/npc_xiaofeng__scene_xingzilin_departure.md) | `por_npc_xiaofeng__ch01_prime_scene_xingzilin_departure` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_xingzilin_departure.png` | redo |
| 51 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_yanmen_raise_broken_arrow.md](ch01-tianlong/npc_xiaofeng__scene_yanmen_raise_broken_arrow.md) | `por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow.png` | candidate |
| 52 | 萧远山 | `npc_xiaoyuanshan` | 男 | 老年 | S | [npc_xiaoyuanshan.md](ch01-tianlong/npc_xiaoyuanshan.md) | `por_npc_xiaoyuanshan__ch01_elder_revealed_base` | `assets/default/character/male/ch01/por_npc_xiaoyuanshan__ch01_elder_revealed_base.png` | ready |
| 53 | 辛双清 | `npc_xinshuangqing` | 女 | 壮年 | B | [npc_xinshuangqing.md](ch01-tianlong/npc_xinshuangqing.md) | `por_npc_xinshuangqing__ch01_prime_wuliang_base` | `assets/default/character/female/ch01/por_npc_xinshuangqing__ch01_prime_wuliang_base.png` | ready |
| 54 | 玄慈 | `npc_xuanci` | 男 | 老年 | S | [npc_xuanci.md](ch01-tianlong/npc_xuanci.md) | `por_npc_xuanci__ch01_elder_fangzhang_base` | `assets/default/character/male/ch01/por_npc_xuanci__ch01_elder_fangzhang_base.png` | ready |
| 55 | 薛慕华 | `npc_xuemuhua` | 男 | 壮年 | A | [npc_xuemuhua.md](ch01-tianlong/npc_xuemuhua.md) | `por_npc_xuemuhua__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_xuemuhua__ch01_prime_juxian_base.png` | ready |
| 56 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu.md](ch01-tianlong/npc_xuzhu.md) | `por_npc_xuzhu__ch01_youth_lingjiu_base` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_lingjiu_base.png` | candidate |
| 57 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu__scene_icecellar_practice.md](ch01-tianlong/npc_xuzhu__scene_icecellar_practice.md) | `por_npc_xuzhu__ch01_youth_scene_icecellar_practice` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_icecellar_practice.png` | redo |
| 58 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu__scene_lingjiu_compassion.md](ch01-tianlong/npc_xuzhu__scene_lingjiu_compassion.md) | `por_npc_xuzhu__ch01_youth_scene_lingjiu_compassion` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_lingjiu_compassion.png` | candidate |
| 59 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu__scene_shaoshi_thin_ice.md](ch01-tianlong/npc_xuzhu__scene_shaoshi_thin_ice.md) | `por_npc_xuzhu__ch01_youth_scene_shaoshi_thin_ice` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_shaoshi_thin_ice.png` | redo |
| 60 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu__scene_xiaoyao_inheritance.md](ch01-tianlong/npc_xuzhu__scene_xiaoyao_inheritance.md) | `por_npc_xuzhu__ch01_youth_scene_xiaoyao_inheritance` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_xiaoyao_inheritance.png` | redo |
| 61 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu__scene_zhenlong_unintended_move.md](ch01-tianlong/npc_xuzhu__scene_zhenlong_unintended_move.md) | `por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move.png` | candidate |
| 62 | 叶二娘 | `npc_yeerniang` | 女 | 壮年 | A | [npc_yeerniang.md](ch01-tianlong/npc_yeerniang.md) | `por_npc_yeerniang__ch01_prime_prereunion_base` | `assets/default/character/female/ch01/por_npc_yeerniang__ch01_prime_prereunion_base.png` | ready |
| 63 | 耶律洪基 | `npc_yelvhongji` | 男 | 壮年 | A | [npc_yelvhongji.md](ch01-tianlong/npc_yelvhongji.md) | `por_npc_yelvhongji__ch01_prime_liaoting_base` | `assets/default/character/male/ch01/por_npc_yelvhongji__ch01_prime_liaoting_base.png` | new |
| 64 | 游骥 | `npc_youji` | 男 | 壮年 | A | [npc_youji.md](ch01-tianlong/npc_youji.md) | `por_npc_youji__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_youji__ch01_prime_juxian_base.png` | ready |
| 65 | 游驹 | `npc_youju` | 男 | 壮年 | A | [npc_youju.md](ch01-tianlong/npc_youju.md) | `por_npc_youju__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_youju__ch01_prime_juxian_base.png` | ready |
| 66 | 游坦之 | `npc_youtanzhi` | 男 | 少年 / 青年 | S | [npc_youtanzhi.md](ch01-tianlong/npc_youtanzhi.md) | `por_npc_youtanzhi__ch01_youth_ironmask_base` | `assets/default/character/male/ch01/por_npc_youtanzhi__ch01_youth_ironmask_base.png` | ready |
| 67 | 岳老三 | `npc_yuelaosan` | 男 | 壮年 | A | [npc_yuelaosan.md](ch01-tianlong/npc_yuelaosan.md) | `por_npc_yuelaosan__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_yuelaosan__ch01_prime_baseform_base.png` | ready |
| 68 | 云中鹤 | `npc_yunzhonghe` | 男 | 壮年 | A | [npc_yunzhonghe.md](ch01-tianlong/npc_yunzhonghe.md) | `por_npc_yunzhonghe__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_yunzhonghe__ch01_prime_baseform_base.png` | ready |
| 69 | 钟灵 | `npc_zhongling` | 女 | 少年 / 青年 | A | [npc_zhongling.md](ch01-tianlong/npc_zhongling.md) | `por_npc_zhongling__ch01_youth_diaoalive_base` | `assets/default/character/female/ch01/por_npc_zhongling__ch01_youth_diaoalive_base.png` | redo |
| 70 | 钟万仇 | `npc_zhongwanchou` | 男 | 壮年 | A | [npc_zhongwanchou.md](ch01-tianlong/npc_zhongwanchou.md) | `por_npc_zhongwanchou__ch01_prime_wanjie_base` | `assets/default/character/male/ch01/por_npc_zhongwanchou__ch01_prime_wanjie_base.png` | new |
| 71 | 左子穆 | `npc_zuozimu` | 男 | 壮年 | B | [npc_zuozimu.md](ch01-tianlong/npc_zuozimu.md) | `por_npc_zuozimu__ch01_prime_wuliang_base` | `assets/default/character/male/ch01/por_npc_zuozimu__ch01_prime_wuliang_base.png` | ready |

### ch02 · 《射雕英雄传》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 包惜弱 | `npc_baoxiruo` | 女 | 壮年 | A | [npc_baoxiruo.md](ch02-shediao/npc_baoxiruo.md) | `por_npc_baoxiruo__ch02_prime_base` | `assets/default/character/female/ch02/por_npc_baoxiruo__ch02_prime_base.png` | redo |
| 2 | 陈玄风 | `npc_chenxuanfeng` | 男 | 壮年 | S | [npc_chenxuanfeng.md](ch02-shediao/npc_chenxuanfeng.md) | `por_npc_chenxuanfeng__ch02_prime_flashback_base` | `assets/default/character/male/ch02/por_npc_chenxuanfeng__ch02_prime_flashback_base.png` | new |
| 3 | 点苍渔隐 | `npc_diancangyuyin` | 男 | 老年 | A | [npc_diancangyuyin.md](ch02-shediao/npc_diancangyuyin.md) | `por_npc_diancangyuyin__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_diancangyuyin__ch02_elder_base.png` | ready |
| 4 | 郭靖 | `npc_guojing` | 男 | 少年 / 青年 | S | [npc_guojing.md](ch02-shediao/npc_guojing.md) | `por_npc_guojing__ch02_youth_base` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_base.png` | candidate |
| 5 | 郭靖 | `npc_guojing` | 男 | 少年 / 青年 | S | [npc_guojing__scene_first_dragon_palm_lesson.md](ch02-shediao/npc_guojing__scene_first_dragon_palm_lesson.md) | `por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson.png` | redo |
| 6 | 郭靖 | `npc_guojing` | 男 | 少年 / 青年 | S | [npc_guojing__scene_grassland_double_eagle.md](ch02-shediao/npc_guojing__scene_grassland_double_eagle.md) | `por_npc_guojing__ch02_youth_scene_grassland_double_eagle` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_grassland_double_eagle.png` | candidate |
| 7 | 郭靖 | `npc_guojing` | 男 | 少年 / 青年 | S | [npc_guojing__scene_northern_camp_hero_discourse.md](ch02-shediao/npc_guojing__scene_northern_camp_hero_discourse.md) | `por_npc_guojing__ch02_youth_scene_northern_camp_hero_discourse` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_northern_camp_hero_discourse.png` | redo |
| 8 | 郭靖 | `npc_guojing` | 男 | 少年 / 青年 | S | [npc_guojing__scene_peach_island_square_circle.md](ch02-shediao/npc_guojing__scene_peach_island_square_circle.md) | `por_npc_guojing__ch02_youth_scene_peach_island_square_circle` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_peach_island_square_circle.png` | candidate |
| 9 | 郭靖 | `npc_guojing` | 男 | 少年 / 青年 | S | [npc_guojing__scene_second_huashan_palm.md](ch02-shediao/npc_guojing__scene_second_huashan_palm.md) | `por_npc_guojing__ch02_youth_scene_second_huashan_palm` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_second_huashan_palm.png` | redo |
| 10 | 郭啸天 | `npc_guoxiaotian` | 男 | 壮年 | A | [npc_guoxiaotian.md](ch02-shediao/npc_guoxiaotian.md) | `por_npc_guoxiaotian__ch02_prime_memory_base` | `assets/default/character/male/ch02/por_npc_guoxiaotian__ch02_prime_memory_base.png` | new |
| 11 | 韩宝驹 | `npc_hanbaoju` | 男 | 壮年 | A | [npc_hanbaoju.md](ch02-shediao/npc_hanbaoju.md) | `por_npc_hanbaoju__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_hanbaoju__ch02_prime_base.png` | ready |
| 12 | 韩小莹 | `npc_hanxiaoying` | 女 | 壮年 | A | [npc_hanxiaoying.md](ch02-shediao/npc_hanxiaoying.md) | `por_npc_hanxiaoying__ch02_prime_base` | `assets/default/character/female/ch02/por_npc_hanxiaoying__ch02_prime_base.png` | ready |
| 13 | 洪七公 | `npc_hongqigong` | 男 | 老年 | S | [npc_hongqigong.md](ch02-shediao/npc_hongqigong.md) | `por_npc_hongqigong__ch02_elder_bangzhu_base` | `assets/default/character/male/ch02/por_npc_hongqigong__ch02_elder_bangzhu_base.png` | redo |
| 14 | 黄蓉 | `npc_huangrong` | 女 | 少年 / 青年 | S | [npc_huangrong.md](ch02-shediao/npc_huangrong.md) | `por_npc_huangrong__ch02_youth_bangzhu_base` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_bangzhu_base.png` | candidate |
| 15 | 黄蓉 | `npc_huangrong` | 女 | 少年 / 青年 | S | [npc_huangrong__scene_cooking_meets_hongqigong.md](ch02-shediao/npc_huangrong__scene_cooking_meets_hongqigong.md) | `por_npc_huangrong__ch02_youth_scene_cooking_meets_hongqigong` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_cooking_meets_hongqigong.png` | redo |
| 16 | 黄蓉 | `npc_huangrong` | 女 | 少年 / 青年 | S | [npc_huangrong__scene_iron_spear_temple_truth.md](ch02-shediao/npc_huangrong__scene_iron_spear_temple_truth.md) | `por_npc_huangrong__ch02_youth_scene_iron_spear_temple_truth` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_iron_spear_temple_truth.png` | redo |
| 17 | 黄蓉 | `npc_huangrong` | 女 | 少年 / 青年 | S | [npc_huangrong__scene_junshan_beggar_leader.md](ch02-shediao/npc_huangrong__scene_junshan_beggar_leader.md) | `por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader.png` | candidate |
| 18 | 黄蓉 | `npc_huangrong` | 女 | 少年 / 青年 | S | [npc_huangrong__scene_yideng_heals_iron_palm_wound.md](ch02-shediao/npc_huangrong__scene_yideng_heals_iron_palm_wound.md) | `por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound.png` | redo |
| 19 | 黄蓉 | `npc_huangrong` | 女 | 少年 / 青年 | S | [npc_huangrong__scene_young_beggar_disguise.md](ch02-shediao/npc_huangrong__scene_young_beggar_disguise.md) | `por_npc_huangrong__ch02_youth_scene_young_beggar_disguise` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_young_beggar_disguise.png` | candidate |
| 20 | 黄药师 | `npc_huangyaoshi` | 男 | 老年 | S | [npc_huangyaoshi.md](ch02-shediao/npc_huangyaoshi.md) | `por_npc_huangyaoshi__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_huangyaoshi__ch02_elder_base.png` | redo |
| 21 | 华筝 | `npc_huazheng` | 女 | 少年 / 青年 | A | [npc_huazheng.md](ch02-shediao/npc_huazheng.md) | `por_npc_huazheng__ch02_youth_base` | `assets/default/character/female/ch02/por_npc_huazheng__ch02_youth_base.png` | redo |
| 22 | 柯镇恶 | `npc_kezhene` | 男 | 老年 | A | [npc_kezhene.md](ch02-shediao/npc_kezhene.md) | `por_npc_kezhene__ch02_elder_blind_base` | `assets/default/character/male/ch02/por_npc_kezhene__ch02_elder_blind_base.png` | new |
| 23 | 梁子翁 | `npc_liangziweng` | 男 | 老年 | B | [npc_liangziweng.md](ch02-shediao/npc_liangziweng.md) | `por_npc_liangziweng__ch02_elder_zhaowangfu_base` | `assets/default/character/male/ch02/por_npc_liangziweng__ch02_elder_zhaowangfu_base.png` | new |
| 24 | 李萍 | `npc_liping` | 女 | 壮年 | A | [npc_liping.md](ch02-shediao/npc_liping.md) | `por_npc_liping__ch02_prime_damo_base` | `assets/default/character/female/ch02/por_npc_liping__ch02_prime_damo_base.png` | new |
| 25 | 陆乘风 | `npc_luchengfeng` | 男 | 壮年 | A | [npc_luchengfeng.md](ch02-shediao/npc_luchengfeng.md) | `por_npc_luchengfeng__ch02_prime_disabled_base` | `assets/default/character/male/ch02/por_npc_luchengfeng__ch02_prime_disabled_base.png` | redo |
| 26 | 陆冠英 | `npc_luguanying` | 男 | 少年 / 青年 | A | [npc_luguanying.md](ch02-shediao/npc_luguanying.md) | `por_npc_luguanying__ch02_youth_base` | `assets/default/character/male/ch02/por_npc_luguanying__ch02_youth_base.png` | ready |
| 27 | 鲁有脚 | `npc_luyoujiao` | 男 | 壮年 | A | [npc_luyoujiao.md](ch02-shediao/npc_luyoujiao.md) | `por_npc_luyoujiao__ch02_prime_zhanglao_base` | `assets/default/character/male/ch02/por_npc_luyoujiao__ch02_prime_zhanglao_base.png` | ready |
| 28 | 马钰 | `npc_mayu` | 男 | 老年 | A | [npc_mayu.md](ch02-shediao/npc_mayu.md) | `por_npc_mayu__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_mayu__ch02_elder_base.png` | ready |
| 29 | 梅超风 | `npc_meichaofeng` | 女 | 壮年 | S | [npc_meichaofeng.md](ch02-shediao/npc_meichaofeng.md) | `por_npc_meichaofeng__ch02_prime_blind_base` | `assets/default/character/female/ch02/por_npc_meichaofeng__ch02_prime_blind_base.png` | redo |
| 30 | 穆念慈 | `npc_munianci` | 女 | 少年 / 青年 | A | [npc_munianci.md](ch02-shediao/npc_munianci.md) | `por_npc_munianci__ch02_youth_base` | `assets/default/character/female/ch02/por_npc_munianci__ch02_youth_base.png` | redo |
| 31 | 南希仁 | `npc_nanxiren` | 男 | 壮年 | A | [npc_nanxiren.md](ch02-shediao/npc_nanxiren.md) | `por_npc_nanxiren__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_nanxiren__ch02_prime_base.png` | ready |
| 32 | 欧阳锋 | `npc_ouyangfeng` | 男 | 老年 | S | [npc_ouyangfeng.md](ch02-shediao/npc_ouyangfeng.md) | `por_npc_ouyangfeng__ch02_elder_sane_base` | `assets/default/character/male/ch02/por_npc_ouyangfeng__ch02_elder_sane_base.png` | redo |
| 33 | 欧阳克 | `npc_ouyangke` | 男 | 少年 / 青年 | A | [npc_ouyangke.md](ch02-shediao/npc_ouyangke.md) | `por_npc_ouyangke__ch02_youth_uninjured_base` | `assets/default/character/male/ch02/por_npc_ouyangke__ch02_youth_uninjured_base.png` | redo |
| 34 | 彭连虎 | `npc_penglianhu` | 男 | 壮年 | B | [npc_penglianhu.md](ch02-shediao/npc_penglianhu.md) | `por_npc_penglianhu__ch02_prime_zhaowangfu_base` | `assets/default/character/male/ch02/por_npc_penglianhu__ch02_prime_zhaowangfu_base.png` | new |
| 35 | 樵子 | `npc_qiaozi` | 男 | 老年 | A | [npc_qiaozi.md](ch02-shediao/npc_qiaozi.md) | `por_npc_qiaozi__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_qiaozi__ch02_elder_base.png` | ready |
| 36 | 丘处机 | `npc_qiuchuji` | 男 | 老年 | A | [npc_qiuchuji.md](ch02-shediao/npc_qiuchuji.md) | `por_npc_qiuchuji__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_qiuchuji__ch02_elder_base.png` | new |
| 37 | 裘千仞 | `npc_qiuqianren` | 男 | 老年 | S | [npc_qiuqianren.md](ch02-shediao/npc_qiuqianren.md) | `por_npc_qiuqianren__ch02_elder_tiezhang_base` | `assets/default/character/male/ch02/por_npc_qiuqianren__ch02_elder_tiezhang_base.png` | new |
| 38 | 裘千丈 | `npc_qiuqianzhang` | 男 | 老年 | B | [npc_qiuqianzhang.md](ch02-shediao/npc_qiuqianzhang.md) | `por_npc_qiuqianzhang__ch02_elder_jianghu_base` | `assets/default/character/male/ch02/por_npc_qiuqianzhang__ch02_elder_jianghu_base.png` | new |
| 39 | 全金发 | `npc_quanjinfa` | 男 | 壮年 | A | [npc_quanjinfa.md](ch02-shediao/npc_quanjinfa.md) | `por_npc_quanjinfa__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_quanjinfa__ch02_prime_base.png` | ready |
| 40 | 傻姑 | `npc_shagu` | 女 | 少年 / 青年 | B | [npc_shagu.md](ch02-shediao/npc_shagu.md) | `por_npc_shagu__ch02_youth_niujia_base` | `assets/default/character/female/ch02/por_npc_shagu__ch02_youth_niujia_base.png` | new |
| 41 | 沙通天 | `npc_shatongtian` | 男 | 壮年 | B | [npc_shatongtian.md](ch02-shediao/npc_shatongtian.md) | `por_npc_shatongtian__ch02_prime_zhaowangfu_base` | `assets/default/character/male/ch02/por_npc_shatongtian__ch02_prime_zhaowangfu_base.png` | new |
| 42 | 铁木真 | `npc_tiemuzhen` | 男 | 老年 | A | [npc_tiemuzhen.md](ch02-shediao/npc_tiemuzhen.md) | `por_npc_tiemuzhen__ch02_elder_khan_base` | `assets/default/character/male/ch02/por_npc_tiemuzhen__ch02_elder_khan_base.png` | new |
| 43 | 拖雷 | `npc_tuolei` | 男 | 壮年 | A | [npc_tuolei.md](ch02-shediao/npc_tuolei.md) | `por_npc_tuolei__ch02_prime_xizheng_base` | `assets/default/character/male/ch02/por_npc_tuolei__ch02_prime_xizheng_base.png` | new |
| 44 | 王重阳 | `npc_wangchongyang` | 男 | 老年 | A | [npc_wangchongyang.md](ch02-shediao/npc_wangchongyang.md) | `por_npc_wangchongyang__ch02_elder_memory_base` | `assets/default/character/male/ch02/por_npc_wangchongyang__ch02_elder_memory_base.png` | new |
| 45 | 王处一 | `npc_wangchuyi` | 男 | 老年 | A | [npc_wangchuyi.md](ch02-shediao/npc_wangchuyi.md) | `por_npc_wangchuyi__ch02_elder_recovered_base` | `assets/default/character/male/ch02/por_npc_wangchuyi__ch02_elder_recovered_base.png` | ready |
| 46 | 完颜洪烈 | `npc_wanyanhonglie` | 男 | 壮年 | A | [npc_wanyanhonglie.md](ch02-shediao/npc_wanyanhonglie.md) | `por_npc_wanyanhonglie__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_wanyanhonglie__ch02_prime_base.png` | new |
| 47 | 杨康 | `npc_yangkang` | 男 | 少年 / 青年 | S | [npc_yangkang.md](ch02-shediao/npc_yangkang.md) | `por_npc_yangkang__ch02_youth_wangfu_base` | `assets/default/character/male/ch02/por_npc_yangkang__ch02_youth_wangfu_base.png` | redo |
| 48 | 杨妙真 | `npc_yangmiaozhen` | 女 | 壮年 | A | [npc_yangmiaozhen.md](ch02-shediao/npc_yangmiaozhen.md) | `por_npc_yangmiaozhen__ch02_prime_base` | `assets/default/character/female/ch02/por_npc_yangmiaozhen__ch02_prime_base.png` | ready |
| 49 | 杨铁心 | `npc_yangtiexin` | 男 | 壮年 | A | [npc_yangtiexin.md](ch02-shediao/npc_yangtiexin.md) | `por_npc_yangtiexin__ch02_prime_muyi_base` | `assets/default/character/male/ch02/por_npc_yangtiexin__ch02_prime_muyi_base.png` | redo |
| 50 | 一灯大师 | `npc_yideng` | 男 | 老年 | S | [npc_yideng.md](ch02-shediao/npc_yideng.md) | `por_npc_yideng__ch02_elder_monk_base` | `assets/default/character/male/ch02/por_npc_yideng__ch02_elder_monk_base.png` | new |
| 51 | 瑛姑 | `npc_yinggu` | 女 | 老年 | A | [npc_yinggu.md](ch02-shediao/npc_yinggu.md) | `por_npc_yinggu__ch02_elder_heizhao_base` | `assets/default/character/female/ch02/por_npc_yinggu__ch02_elder_heizhao_base.png` | new |
| 52 | 张阿生 | `npc_zhangasheng` | 男 | 壮年 | A | [npc_zhangasheng.md](ch02-shediao/npc_zhangasheng.md) | `por_npc_zhangasheng__ch02_prime_flashback_base` | `assets/default/character/male/ch02/por_npc_zhangasheng__ch02_prime_flashback_base.png` | ready |
| 53 | 哲别 | `npc_zhebie` | 男 | 壮年 | A | [npc_zhebie.md](ch02-shediao/npc_zhebie.md) | `por_npc_zhebie__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_zhebie__ch02_prime_base.png` | ready |
| 54 | 周伯通 | `npc_zhoubotong` | 男 | 老年 | S | [npc_zhoubotong.md](ch02-shediao/npc_zhoubotong.md) | `por_npc_zhoubotong__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_zhoubotong__ch02_elder_base.png` | redo |
| 55 | 朱聪 | `npc_zhucong` | 男 | 壮年 | A | [npc_zhucong.md](ch02-shediao/npc_zhucong.md) | `por_npc_zhucong__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_zhucong__ch02_prime_base.png` | ready |
| 56 | 朱子柳 | `npc_zhuziliu` | 男 | 壮年 | A | [npc_zhuziliu.md](ch02-shediao/npc_zhuziliu.md) | `por_npc_zhuziliu__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_zhuziliu__ch02_prime_base.png` | ready |

### ch03 · 《神雕侠侣》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 程英 | `npc_chengying` | 女 | 少年 / 青年 | A | [npc_chengying.md](ch03-shendiao/npc_chengying.md) | `por_npc_chengying__ch03_youth_unmasked_base` | `assets/default/character/female/ch03/por_npc_chengying__ch03_youth_unmasked_base.png` | redo |
| 2 | 达尔巴 | `npc_daerba` | 男 | 壮年 | A | [npc_daerba.md](ch03-shendiao/npc_daerba.md) | `por_npc_daerba__ch03_prime_base` | `assets/default/character/male/ch03/por_npc_daerba__ch03_prime_base.png` | ready |
| 3 | 樊一翁 | `npc_fanyiweng` | 男 | 老年 | A | [npc_fanyiweng.md](ch03-shendiao/npc_fanyiweng.md) | `por_npc_fanyiweng__ch03_elder_longbeard_base` | `assets/default/character/male/ch03/por_npc_fanyiweng__ch03_elder_longbeard_base.png` | ready |
| 4 | 冯默风 | `npc_fengmofeng` | 男 | 老年 | A | [npc_fengmofeng.md](ch03-shendiao/npc_fengmofeng.md) | `por_npc_fengmofeng__ch03_elder_lame_base` | `assets/default/character/male/ch03/por_npc_fengmofeng__ch03_elder_lame_base.png` | ready |
| 5 | 公孙绿萼 | `npc_gongsunlve` | 女 | 少年 / 青年 | A | [npc_gongsunlve.md](ch03-shendiao/npc_gongsunlve.md) | `por_npc_gongsunlve__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_gongsunlve__ch03_youth_base.png` | redo |
| 6 | 公孙止 | `npc_gongsunzhi` | 男 | 壮年 | S | [npc_gongsunzhi.md](ch03-shendiao/npc_gongsunzhi.md) | `por_npc_gongsunzhi__ch03_prime_twoeyes_base` | `assets/default/character/male/ch03/por_npc_gongsunzhi__ch03_prime_twoeyes_base.png` | redo |
| 7 | 郭芙 | `npc_guofu` | 女 | 少年 / 青年 | A | [npc_guofu.md](ch03-shendiao/npc_guofu.md) | `por_npc_guofu__ch03_youth_preinjury_base` | `assets/default/character/female/ch03/por_npc_guofu__ch03_youth_preinjury_base.png` | redo |
| 8 | 郭靖 | `npc_guojing` | 男 | 壮年 | S | [npc_guojing.md](ch03-shendiao/npc_guojing.md) | `por_npc_guojing__ch03_prime_base` | `assets/default/character/male/ch03/por_npc_guojing__ch03_prime_base.png` | new |
| 9 | 郭破虏 | `npc_guopoluo` | 男 | 少年 / 青年 | A | [npc_guopoluo.md](ch03-shendiao/npc_guopoluo.md) | `por_npc_guopoluo__ch03_youth_xiangyang_base` | `assets/default/character/male/ch03/por_npc_guopoluo__ch03_youth_xiangyang_base.png` | new |
| 10 | 郭襄 | `npc_guoxiang` | 女 | 少年 / 青年 | S | [npc_guoxiang.md](ch03-shendiao/npc_guoxiang.md) | `por_npc_guoxiang__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_guoxiang__ch03_youth_base.png` | new |
| 11 | 洪凌波 | `npc_honglingbo` | 女 | 少年 / 青年 | A | [npc_honglingbo.md](ch03-shendiao/npc_honglingbo.md) | `por_npc_honglingbo__ch03_youth_jianghu_base` | `assets/default/character/female/ch03/por_npc_honglingbo__ch03_youth_jianghu_base.png` | new |
| 12 | 洪七公 | `npc_hongqigong` | 男 | 老年 | A | [npc_hongqigong.md](ch03-shendiao/npc_hongqigong.md) | `por_npc_hongqigong__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_hongqigong__ch03_elder_base.png` | new |
| 13 | 黄蓉 | `npc_huangrong` | 女 | 壮年 | S | [npc_huangrong.md](ch03-shendiao/npc_huangrong.md) | `por_npc_huangrong__ch03_prime_base` | `assets/default/character/female/ch03/por_npc_huangrong__ch03_prime_base.png` | redo |
| 14 | 黄药师 | `npc_huangyaoshi` | 男 | 老年 | A | [npc_huangyaoshi.md](ch03-shendiao/npc_huangyaoshi.md) | `por_npc_huangyaoshi__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_huangyaoshi__ch03_elder_base.png` | redo |
| 15 | 忽必烈 | `npc_hubilie` | 男 | 壮年 | A | [npc_hubilie.md](ch03-shendiao/npc_hubilie.md) | `por_npc_hubilie__ch03_prime_yingzhang_base` | `assets/default/character/male/ch03/por_npc_hubilie__ch03_prime_yingzhang_base.png` | new |
| 16 | 霍都 | `npc_huodu` | 男 | 壮年 | A | [npc_huodu.md](ch03-shendiao/npc_huodu.md) | `por_npc_huodu__ch03_prime_prince_base` | `assets/default/character/male/ch03/por_npc_huodu__ch03_prime_prince_base.png` | redo |
| 17 | 金轮法王 | `npc_jinlunfawang` | 男 | 老年 | S | [npc_jinlunfawang.md](ch03-shendiao/npc_jinlunfawang.md) | `por_npc_jinlunfawang__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_jinlunfawang__ch03_elder_base.png` | redo |
| 18 | 觉远 | `npc_jueyuan` | 男 | 老年 | A | [npc_jueyuan.md](ch03-shendiao/npc_jueyuan.md) | `por_npc_jueyuan__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_jueyuan__ch03_elder_base.png` | ready |
| 19 | 李莫愁 | `npc_limochou` | 女 | 壮年 | S | [npc_limochou.md](ch03-shendiao/npc_limochou.md) | `por_npc_limochou__ch03_prime_base` | `assets/default/character/female/ch03/por_npc_limochou__ch03_prime_base.png` | redo |
| 20 | 陆无双 | `npc_luwushuang` | 女 | 少年 / 青年 | A | [npc_luwushuang.md](ch03-shendiao/npc_luwushuang.md) | `por_npc_luwushuang__ch03_youth_lame_base` | `assets/default/character/female/ch03/por_npc_luwushuang__ch03_youth_lame_base.png` | redo |
| 21 | 蒙哥 | `npc_mengge` | 男 | 壮年 | A | [npc_mengge.md](ch03-shendiao/npc_mengge.md) | `por_npc_mengge__ch03_prime_xiangyang_base` | `assets/default/character/male/ch03/por_npc_mengge__ch03_prime_xiangyang_base.png` | new |
| 22 | 欧阳锋 | `npc_ouyangfeng` | 男 | 老年 | A | [npc_ouyangfeng.md](ch03-shendiao/npc_ouyangfeng.md) | `por_npc_ouyangfeng__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_ouyangfeng__ch03_elder_base.png` | redo |
| 23 | 丘处机 | `npc_qiuchuji` | 男 | 老年 | A | [npc_qiuchuji.md](ch03-shendiao/npc_qiuchuji.md) | `por_npc_qiuchuji__ch03_elder_zhongnan_base` | `assets/default/character/male/ch03/por_npc_qiuchuji__ch03_elder_zhongnan_base.png` | new |
| 24 | 裘千尺 | `npc_qiuqianchi` | 女 | 老年 | A | [npc_qiuqianchi.md](ch03-shendiao/npc_qiuqianchi.md) | `por_npc_qiuqianchi__ch03_elder_disabled_base` | `assets/default/character/female/ch03/por_npc_qiuqianchi__ch03_elder_disabled_base.png` | redo |
| 25 | 慈恩（裘千仞） | `npc_qiuqianren` | 男 | 老年 | A | [npc_qiuqianren.md](ch03-shendiao/npc_qiuqianren.md) | `por_npc_qiuqianren__ch03_elder_cien_base` | `assets/default/character/male/ch03/por_npc_qiuqianren__ch03_elder_cien_base.png` | new |
| 26 | 神雕 | `npc_shendiao` | 其他 | 壮年 | A | [npc_shendiao.md](ch03-shendiao/npc_shendiao.md) | `por_npc_shendiao__ch03_prime_jianzhong_base` | `assets/default/character/other/ch03/por_npc_shendiao__ch03_prime_jianzhong_base.png` | new |
| 27 | 孙婆婆 | `npc_sunpopo` | 女 | 老年 | A | [npc_sunpopo.md](ch03-shendiao/npc_sunpopo.md) | `por_npc_sunpopo__ch03_elder_gumu_base` | `assets/default/character/female/ch03/por_npc_sunpopo__ch03_elder_gumu_base.png` | new |
| 28 | 完颜萍 | `npc_wanyanping` | 女 | 少年 / 青年 | A | [npc_wanyanping.md](ch03-shendiao/npc_wanyanping.md) | `por_npc_wanyanping__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_wanyanping__ch03_youth_base.png` | ready |
| 29 | 武敦儒 | `npc_wudunru` | 男 | 少年 / 青年 | B | [npc_wudunru.md](ch03-shendiao/npc_wudunru.md) | `por_npc_wudunru__ch03_youth_base` | `assets/default/character/male/ch03/por_npc_wudunru__ch03_youth_base.png` | ready |
| 30 | 武三通 | `npc_wusantong` | 男 | 老年 | A | [npc_wusantong.md](ch03-shendiao/npc_wusantong.md) | `por_npc_wusantong__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_wusantong__ch03_elder_base.png` | ready |
| 31 | 武修文 | `npc_wuxiuwen` | 男 | 少年 / 青年 | B | [npc_wuxiuwen.md](ch03-shendiao/npc_wuxiuwen.md) | `por_npc_wuxiuwen__ch03_youth_base` | `assets/default/character/male/ch03/por_npc_wuxiuwen__ch03_youth_base.png` | ready |
| 32 | 小龙女 | `npc_xiaolongnv` | 女 | 少年 / 青年 | S | [npc_xiaolongnv.md](ch03-shendiao/npc_xiaolongnv.md) | `por_npc_xiaolongnv__ch03_youth_jueqing_base` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_jueqing_base.png` | candidate |
| 33 | 小龙女 | `npc_xiaolongnv` | 女 | 少年 / 青年 | S | [npc_xiaolongnv__scene_ancient_tomb_sparrow_lesson.md](ch03-shendiao/npc_xiaolongnv__scene_ancient_tomb_sparrow_lesson.md) | `por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.png` | candidate |
| 34 | 小龙女 | `npc_xiaolongnv` | 女 | 少年 / 青年 | S | [npc_xiaolongnv__scene_chongyang_two_sword_combat.md](ch03-shendiao/npc_xiaolongnv__scene_chongyang_two_sword_combat.md) | `por_npc_xiaolongnv__ch03_youth_scene_chongyang_two_sword_combat` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_chongyang_two_sword_combat.png` | redo |
| 35 | 小龙女 | `npc_xiaolongnv` | 女 | 少年 / 青年 | S | [npc_xiaolongnv__scene_dashengguan_silk_bells.md](ch03-shendiao/npc_xiaolongnv__scene_dashengguan_silk_bells.md) | `por_npc_xiaolongnv__ch03_youth_scene_dashengguan_silk_bells` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_dashengguan_silk_bells.png` | redo |
| 36 | 小龙女 | `npc_xiaolongnv` | 女 | 少年 / 青年 | S | [npc_xiaolongnv__scene_heartbreak_cliff_sixteen_year_promise.md](ch03-shendiao/npc_xiaolongnv__scene_heartbreak_cliff_sixteen_year_promise.md) | `por_npc_xiaolongnv__ch03_youth_scene_heartbreak_cliff_sixteen_year_promise` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_heartbreak_cliff_sixteen_year_promise.png` | redo |
| 37 | 小龙女 | `npc_xiaolongnv` | 女 | 少年 / 青年 | S | [npc_xiaolongnv__scene_valley_jade_bee_message.md](ch03-shendiao/npc_xiaolongnv__scene_valley_jade_bee_message.md) | `por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message.png` | candidate |
| 38 | 潇湘子 | `npc_xiaoxiangzi` | 男 | 老年 | A | [npc_xiaoxiangzi.md](ch03-shendiao/npc_xiaoxiangzi.md) | `por_npc_xiaoxiangzi__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_xiaoxiangzi__ch03_elder_base.png` | ready |
| 39 | 杨过 | `npc_yangguo` | 男 | 少年 / 青年 | S | [npc_yangguo.md](ch03-shendiao/npc_yangguo.md) | `por_npc_yangguo__ch03_youth_onearm_base` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_onearm_base.png` | candidate |
| 40 | 杨过 | `npc_yangguo` | 男 | 少年 / 青年 | S | [npc_yangguo__scene_chongyang_palace_rescue.md](ch03-shendiao/npc_yangguo__scene_chongyang_palace_rescue.md) | `por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue.png` | redo |
| 41 | 杨过 | `npc_yangguo` | 男 | 少年 / 青年 | S | [npc_yangguo__scene_dashengguan_youth_bamboo_staff.md](ch03-shendiao/npc_yangguo__scene_dashengguan_youth_bamboo_staff.md) | `por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.png` | candidate |
| 42 | 杨过 | `npc_yangguo` | 男 | 壮年 | S | [npc_yangguo__scene_sixteen_years_valley_reunion.md](ch03-shendiao/npc_yangguo__scene_sixteen_years_valley_reunion.md) | `por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion.png` | candidate |
| 43 | 杨过 | `npc_yangguo` | 男 | 少年 / 青年 | S | [npc_yangguo__scene_torrent_heavy_sword_condor.md](ch03-shendiao/npc_yangguo__scene_torrent_heavy_sword_condor.md) | `por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor.png` | redo |
| 44 | 杨过 | `npc_yangguo` | 男 | 壮年 | S | [npc_yangguo__scene_xiangyang_platform_rescue_palm.md](ch03-shendiao/npc_yangguo__scene_xiangyang_platform_rescue_palm.md) | `por_npc_yangguo__ch03_prime_scene_xiangyang_platform_rescue_palm` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_prime_scene_xiangyang_platform_rescue_palm.png` | redo |
| 45 | 耶律齐 | `npc_yelvqi` | 男 | 少年 / 青年 | A | [npc_yelvqi.md](ch03-shendiao/npc_yelvqi.md) | `por_npc_yelvqi__ch03_youth_preleader_base` | `assets/default/character/male/ch03/por_npc_yelvqi__ch03_youth_preleader_base.png` | redo |
| 46 | 耶律燕 | `npc_yelvyan` | 女 | 少年 / 青年 | B | [npc_yelvyan.md](ch03-shendiao/npc_yelvyan.md) | `por_npc_yelvyan__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_yelvyan__ch03_youth_base.png` | ready |
| 47 | 一灯大师 | `npc_yideng` | 男 | 老年 | A | [npc_yideng.md](ch03-shendiao/npc_yideng.md) | `por_npc_yideng__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_yideng__ch03_elder_base.png` | redo |
| 48 | 瑛姑 | `npc_yinggu` | 女 | 老年 | A | [npc_yinggu.md](ch03-shendiao/npc_yinggu.md) | `por_npc_yinggu__ch03_elder_baihuagu_base` | `assets/default/character/female/ch03/por_npc_yinggu__ch03_elder_baihuagu_base.png` | new |
| 49 | 尹克西 | `npc_yinkexi` | 男 | 壮年 | A | [npc_yinkexi.md](ch03-shendiao/npc_yinkexi.md) | `por_npc_yinkexi__ch03_prime_menggu_base` | `assets/default/character/male/ch03/por_npc_yinkexi__ch03_prime_menggu_base.png` | new |
| 50 | 尹志平 | `npc_yinzhiping` | 男 | 壮年 | A | [npc_yinzhiping.md](ch03-shendiao/npc_yinzhiping.md) | `por_npc_yinzhiping__ch03_prime_zhongnan_base` | `assets/default/character/male/ch03/por_npc_yinzhiping__ch03_prime_zhongnan_base.png` | new |
| 51 | 张君宝 | `npc_zhangsanfeng` | 男 | 少年 / 青年 | A | [npc_zhangsanfeng.md](ch03-shendiao/npc_zhangsanfeng.md) | `por_npc_zhangsanfeng__ch03_youth_base` | `assets/default/character/male/ch03/por_npc_zhangsanfeng__ch03_youth_base.png` | new |
| 52 | 赵志敬 | `npc_zhaozhijing` | 男 | 壮年 | A | [npc_zhaozhijing.md](ch03-shendiao/npc_zhaozhijing.md) | `por_npc_zhaozhijing__ch03_prime_zhongnan_base` | `assets/default/character/male/ch03/por_npc_zhaozhijing__ch03_prime_zhongnan_base.png` | new |
| 53 | 周伯通 | `npc_zhoubotong` | 男 | 老年 | A | [npc_zhoubotong.md](ch03-shendiao/npc_zhoubotong.md) | `por_npc_zhoubotong__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_zhoubotong__ch03_elder_base.png` | new |
| 54 | 朱子柳 | `npc_zhuziliu` | 男 | 老年 | A | [npc_zhuziliu.md](ch03-shendiao/npc_zhuziliu.md) | `por_npc_zhuziliu__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_zhuziliu__ch03_elder_base.png` | ready |

### ch04 · 《倚天屠龙记》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿三 | `npc_asan` | 男 | 壮年 | A | [npc_asan.md](ch04-yitian/npc_asan.md) | `por_npc_asan__ch04_prime_wudang_base` | `assets/default/character/male/ch04/por_npc_asan__ch04_prime_wudang_base.png` | ready |
| 2 | 班淑娴 | `npc_banshuxian` | 女 | 老年 | A | [npc_banshuxian.md](ch04-yitian/npc_banshuxian.md) | `por_npc_banshuxian__ch04_elder_guangming_base` | `assets/default/character/female/ch04/por_npc_banshuxian__ch04_elder_guangming_base.png` | new |
| 3 | 常遇春 | `npc_changyuchun` | 男 | 壮年 | A | [npc_changyuchun.md](ch04-yitian/npc_changyuchun.md) | `por_npc_changyuchun__ch04_prime_general_base` | `assets/default/character/male/ch04/por_npc_changyuchun__ch04_prime_general_base.png` | ready |
| 4 | 成昆 | `npc_chengkun` | 男 | 老年 | S | [npc_chengkun.md](ch04-yitian/npc_chengkun.md) | `por_npc_chengkun__ch04_elder_yuanzhen_base` | `assets/default/character/male/ch04/por_npc_chengkun__ch04_elder_yuanzhen_base.png` | ready |
| 5 | 陈友谅 | `npc_chenyouliang` | 男 | 壮年 | A | [npc_chenyouliang.md](ch04-yitian/npc_chenyouliang.md) | `por_npc_chenyouliang__ch04_prime_gaibang_base` | `assets/default/character/male/ch04/por_npc_chenyouliang__ch04_prime_gaibang_base.png` | new |
| 6 | 黛绮丝 | `npc_daiqisi` | 女 | 壮年 | S | [npc_daiqisi.md](ch04-yitian/npc_daiqisi.md) | `por_npc_daiqisi__ch04_prime_jinhua_base` | `assets/default/character/female/ch04/por_npc_daiqisi__ch04_prime_jinhua_base.png` | ready |
| 7 | 黛绮丝（紫衫龙王真容） | `npc_daiqisi` | 女 | 壮年 | S | [npc_daiqisi__longwang.md](ch04-yitian/npc_daiqisi__longwang.md) | `por_npc_daiqisi__ch04_prime_longwang_base` | `assets/default/character/female/ch04/por_npc_daiqisi__ch04_prime_longwang_base.png` | new |
| 8 | 丁敏君 | `npc_dingminjun` | 女 | 壮年 | B | [npc_dingminjun.md](ch04-yitian/npc_dingminjun.md) | `por_npc_dingminjun__ch04_prime_emei_base` | `assets/default/character/female/ch04/por_npc_dingminjun__ch04_prime_emei_base.png` | new |
| 9 | 渡厄 | `npc_duee` | 男 | 老年 | S | [npc_duee.md](ch04-yitian/npc_duee.md) | `por_npc_duee__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_duee__ch04_elder_base.png` | ready |
| 10 | 渡劫 | `npc_dujie` | 男 | 老年 | S | [npc_dujie.md](ch04-yitian/npc_dujie.md) | `por_npc_dujie__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_dujie__ch04_elder_base.png` | ready |
| 11 | 渡难 | `npc_dunan` | 男 | 老年 | S | [npc_dunan.md](ch04-yitian/npc_dunan.md) | `por_npc_dunan__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_dunan__ch04_elder_base.png` | ready |
| 12 | 范遥 | `npc_fanyao` | 男 | 壮年 | A | [npc_fanyao.md](ch04-yitian/npc_fanyao.md) | `por_npc_fanyao__ch04_prime_kutoutuo_base` | `assets/default/character/male/ch04/por_npc_fanyao__ch04_prime_kutoutuo_base.png` | redo |
| 13 | 鹤笔翁 | `npc_hebiweng` | 男 | 老年 | S | [npc_hebiweng.md](ch04-yitian/npc_hebiweng.md) | `por_npc_hebiweng__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_hebiweng__ch04_elder_base.png` | ready |
| 14 | 何太冲 | `npc_hetaichong` | 男 | 老年 | A | [npc_hetaichong.md](ch04-yitian/npc_hetaichong.md) | `por_npc_hetaichong__ch04_elder_guangming_base` | `assets/default/character/male/ch04/por_npc_hetaichong__ch04_elder_guangming_base.png` | new |
| 15 | 何足道 | `npc_hezudao` | 男 | 少年 / 青年 | A | [npc_hezudao.md](ch04-yitian/npc_hezudao.md) | `por_npc_hezudao__ch04_youth_shaolin_base` | `assets/default/character/male/ch04/por_npc_hezudao__ch04_youth_shaolin_base.png` | new |
| 16 | 黄衫女子 | `npc_huangshannvzi` | 女 | 少年 / 青年 | A | [npc_huangshannvzi.md](ch04-yitian/npc_huangshannvzi.md) | `por_npc_huangshannvzi__ch04_youth_gumu_base` | `assets/default/character/female/ch04/por_npc_huangshannvzi__ch04_youth_gumu_base.png` | new |
| 17 | 辉月使 | `npc_huiyueshi` | 女 | 壮年 | S | [npc_huiyueshi.md](ch04-yitian/npc_huiyueshi.md) | `por_npc_huiyueshi__ch04_prime_base` | `assets/default/character/female/ch04/por_npc_huiyueshi__ch04_prime_base.png` | ready |
| 18 | 胡青牛 | `npc_huqingniu` | 男 | 壮年 | A | [npc_huqingniu.md](ch04-yitian/npc_huqingniu.md) | `por_npc_huqingniu__ch04_prime_hudiegu_base` | `assets/default/character/male/ch04/por_npc_huqingniu__ch04_prime_hudiegu_base.png` | new |
| 19 | 纪晓芙 | `npc_jixiaofu` | 女 | 壮年 | A | [npc_jixiaofu.md](ch04-yitian/npc_jixiaofu.md) | `por_npc_jixiaofu__ch04_prime_hudiegu_base` | `assets/default/character/female/ch04/por_npc_jixiaofu__ch04_prime_hudiegu_base.png` | new |
| 20 | 空闻 | `npc_kongwen` | 男 | 老年 | A | [npc_kongwen.md](ch04-yitian/npc_kongwen.md) | `por_npc_kongwen__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_kongwen__ch04_elder_base.png` | ready |
| 21 | 空性 | `npc_kongxing` | 男 | 老年 | A | [npc_kongxing.md](ch04-yitian/npc_kongxing.md) | `por_npc_kongxing__ch04_elder_guangmingding_base` | `assets/default/character/male/ch04/por_npc_kongxing__ch04_elder_guangmingding_base.png` | ready |
| 22 | 空智 | `npc_kongzhi` | 男 | 老年 | A | [npc_kongzhi.md](ch04-yitian/npc_kongzhi.md) | `por_npc_kongzhi__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_kongzhi__ch04_elder_base.png` | ready |
| 23 | 流云使 | `npc_liuyunshi` | 男 | 壮年 | S | [npc_liuyunshi.md](ch04-yitian/npc_liuyunshi.md) | `por_npc_liuyunshi__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_liuyunshi__ch04_prime_base.png` | ready |
| 24 | 鹿杖客 | `npc_luzhangke` | 男 | 老年 | S | [npc_luzhangke.md](ch04-yitian/npc_luzhangke.md) | `por_npc_luzhangke__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_luzhangke__ch04_elder_base.png` | ready |
| 25 | 妙风使 | `npc_miaofengshi` | 男 | 壮年 | S | [npc_miaofengshi.md](ch04-yitian/npc_miaofengshi.md) | `por_npc_miaofengshi__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_miaofengshi__ch04_prime_base.png` | ready |
| 26 | 灭绝师太 | `npc_miejueshitai` | 女 | 老年 | S | [npc_miejueshitai.md](ch04-yitian/npc_miejueshitai.md) | `por_npc_miejueshitai__ch04_elder_yitian_base` | `assets/default/character/female/ch04/por_npc_miejueshitai__ch04_elder_yitian_base.png` | redo |
| 27 | 莫声谷 | `npc_moshenggu` | 男 | 壮年 | A | [npc_moshenggu.md](ch04-yitian/npc_moshenggu.md) | `por_npc_moshenggu__ch04_prime_wudang_base` | `assets/default/character/male/ch04/por_npc_moshenggu__ch04_prime_wudang_base.png` | new |
| 28 | 彭莹玉 | `npc_pengyingyu` | 男 | 壮年 | A | [npc_pengyingyu.md](ch04-yitian/npc_pengyingyu.md) | `por_npc_pengyingyu__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_pengyingyu__ch04_prime_base.png` | ready |
| 29 | 宋青书 | `npc_songqingshu` | 男 | 少年 / 青年 | A | [npc_songqingshu.md](ch04-yitian/npc_songqingshu.md) | `por_npc_songqingshu__ch04_youth_wudang_base` | `assets/default/character/male/ch04/por_npc_songqingshu__ch04_youth_wudang_base.png` | ready |
| 30 | 宋远桥 | `npc_songyuanqiao` | 男 | 壮年 | A | [npc_songyuanqiao.md](ch04-yitian/npc_songyuanqiao.md) | `por_npc_songyuanqiao__ch04_prime_shouyan_base` | `assets/default/character/male/ch04/por_npc_songyuanqiao__ch04_prime_shouyan_base.png` | ready |
| 31 | 王保保 | `npc_wangbaobao` | 男 | 壮年 | S | [npc_wangbaobao.md](ch04-yitian/npc_wangbaobao.md) | `por_npc_wangbaobao__ch04_prime_commander_base` | `assets/default/character/male/ch04/por_npc_wangbaobao__ch04_prime_commander_base.png` | ready |
| 32 | 王难姑 | `npc_wangnangu` | 女 | 壮年 | A | [npc_wangnangu.md](ch04-yitian/npc_wangnangu.md) | `por_npc_wangnangu__ch04_prime_hudiegu_base` | `assets/default/character/female/ch04/por_npc_wangnangu__ch04_prime_hudiegu_base.png` | new |
| 33 | 韦一笑 | `npc_weiyixiao` | 男 | 壮年 | A | [npc_weiyixiao.md](ch04-yitian/npc_weiyixiao.md) | `por_npc_weiyixiao__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_weiyixiao__ch04_prime_base.png` | ready |
| 34 | 鲜于通 | `npc_xianyutong` | 男 | 壮年 | A | [npc_xianyutong.md](ch04-yitian/npc_xianyutong.md) | `por_npc_xianyutong__ch04_prime_guangming_base` | `assets/default/character/male/ch04/por_npc_xianyutong__ch04_prime_guangming_base.png` | new |
| 35 | 小昭 | `npc_xiaozhao` | 女 | 少年 / 青年 | S | [npc_xiaozhao.md](ch04-yitian/npc_xiaozhao.md) | `por_npc_xiaozhao__ch04_youth_chained_base` | `assets/default/character/female/ch04/por_npc_xiaozhao__ch04_youth_chained_base.png` | redo |
| 36 | 谢逊 | `npc_xiexun` | 男 | 老年 | S | [npc_xiexun.md](ch04-yitian/npc_xiexun.md) | `por_npc_xiexun__ch04_elder_blind_base` | `assets/default/character/male/ch04/por_npc_xiexun__ch04_elder_blind_base.png` | redo |
| 37 | 徐达 | `npc_xuda` | 男 | 壮年 | A | [npc_xuda.md](ch04-yitian/npc_xuda.md) | `por_npc_xuda__ch04_prime_general_base` | `assets/default/character/male/ch04/por_npc_xuda__ch04_prime_general_base.png` | ready |
| 38 | 杨不悔 | `npc_yangbuhui` | 女 | 少年 / 青年 | A | [npc_yangbuhui.md](ch04-yitian/npc_yangbuhui.md) | `por_npc_yangbuhui__ch04_youth_adult_base` | `assets/default/character/female/ch04/por_npc_yangbuhui__ch04_youth_adult_base.png` | new |
| 39 | 杨逍 | `npc_yangxiao` | 男 | 壮年 | A | [npc_yangxiao.md](ch04-yitian/npc_yangxiao.md) | `por_npc_yangxiao__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_yangxiao__ch04_prime_base.png` | redo |
| 40 | 殷离 | `npc_yinli` | 女 | 少年 / 青年 | S | [npc_yinli.md](ch04-yitian/npc_yinli.md) | `por_npc_yinli__ch04_youth_disfigured_base` | `assets/default/character/female/ch04/por_npc_yinli__ch04_youth_disfigured_base.png` | redo |
| 41 | 殷梨亭 | `npc_yinliting` | 男 | 壮年 | A | [npc_yinliting.md](ch04-yitian/npc_yinliting.md) | `por_npc_yinliting__ch04_prime_wudang_base` | `assets/default/character/male/ch04/por_npc_yinliting__ch04_prime_wudang_base.png` | new |
| 42 | 殷素素 | `npc_yinsusu` | 女 | 壮年 | S | [npc_yinsusu.md](ch04-yitian/npc_yinsusu.md) | `por_npc_yinsusu__ch04_prime_ziwei_base` | `assets/default/character/female/ch04/por_npc_yinsusu__ch04_prime_ziwei_base.png` | redo |
| 43 | 殷天正 | `npc_yintianzheng` | 男 | 老年 | A | [npc_yintianzheng.md](ch04-yitian/npc_yintianzheng.md) | `por_npc_yintianzheng__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_yintianzheng__ch04_elder_base.png` | ready |
| 44 | 俞岱岩 | `npc_yudaiyan` | 男 | 壮年 | A | [npc_yudaiyan.md](ch04-yitian/npc_yudaiyan.md) | `por_npc_yudaiyan__ch04_prime_injured_base` | `assets/default/character/male/ch04/por_npc_yudaiyan__ch04_prime_injured_base.png` | ready |
| 45 | 俞莲舟 | `npc_yulianzhou` | 男 | 壮年 | A | [npc_yulianzhou.md](ch04-yitian/npc_yulianzhou.md) | `por_npc_yulianzhou__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_yulianzhou__ch04_prime_base.png` | ready |
| 46 | 张翠山 | `npc_zhangcuishan` | 男 | 壮年 | S | [npc_zhangcuishan.md](ch04-yitian/npc_zhangcuishan.md) | `por_npc_zhangcuishan__ch04_prime_wangpanshan_base` | `assets/default/character/male/ch04/por_npc_zhangcuishan__ch04_prime_wangpanshan_base.png` | ready |
| 47 | 张三丰 | `npc_zhangsanfeng` | 男 | 老年 | S | [npc_zhangsanfeng.md](ch04-yitian/npc_zhangsanfeng.md) | `por_npc_zhangsanfeng__ch04_elder_taiji_base` | `assets/default/character/male/ch04/por_npc_zhangsanfeng__ch04_elder_taiji_base.png` | redo |
| 48 | 张无忌 | `npc_zhangwuji` | 男 | 少年 / 青年 | S | [npc_zhangwuji.md](ch04-yitian/npc_zhangwuji.md) | `por_npc_zhangwuji__ch04_youth_jiaozhu_base` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_jiaozhu_base.png` | candidate |
| 49 | 张无忌 | `npc_zhangwuji` | 男 | 少年 / 青年 | S | [npc_zhangwuji__scene_guangmingding.md](ch04-yitian/npc_zhangwuji__scene_guangmingding.md) | `por_npc_zhangwuji__ch04_youth_scene_guangmingding` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_guangmingding.png` | redo |
| 50 | 张无忌 | `npc_zhangwuji` | 男 | 少年 / 青年 | S | [npc_zhangwuji__scene_jiuyang.md](ch04-yitian/npc_zhangwuji__scene_jiuyang.md) | `por_npc_zhangwuji__ch04_youth_scene_jiuyang` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_jiuyang.png` | candidate |
| 51 | 张无忌 | `npc_zhangwuji` | 男 | 少年 / 青年 | S | [npc_zhangwuji__scene_sandu.md](ch04-yitian/npc_zhangwuji__scene_sandu.md) | `por_npc_zhangwuji__ch04_youth_scene_sandu` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_sandu.png` | candidate |
| 52 | 张无忌 | `npc_zhangwuji` | 男 | 少年 / 青年 | S | [npc_zhangwuji__scene_taiji.md](ch04-yitian/npc_zhangwuji__scene_taiji.md) | `por_npc_zhangwuji__ch04_youth_scene_taiji` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_taiji.png` | redo |
| 53 | 张无忌 | `npc_zhangwuji` | 男 | 少年 / 青年 | S | [npc_zhangwuji__scene_wanansi.md](ch04-yitian/npc_zhangwuji__scene_wanansi.md) | `por_npc_zhangwuji__ch04_youth_scene_wanansi` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_wanansi.png` | redo |
| 54 | 赵敏 | `npc_zhaomin` | 女 | 少年 / 青年 | S | [npc_zhaomin.md](ch04-yitian/npc_zhaomin.md) | `por_npc_zhaomin__ch04_youth_lvliu_base` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_lvliu_base.png` | candidate |
| 55 | 赵敏 | `npc_zhaomin` | 女 | 少年 / 青年 | S | [npc_zhaomin__scene_haozhou.md](ch04-yitian/npc_zhaomin__scene_haozhou.md) | `por_npc_zhaomin__ch04_youth_scene_haozhou` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_haozhou.png` | candidate |
| 56 | 赵敏 | `npc_zhaomin` | 女 | 少年 / 青年 | S | [npc_zhaomin__scene_jiusi.md](ch04-yitian/npc_zhaomin__scene_jiusi.md) | `por_npc_zhaomin__ch04_youth_scene_jiusi` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_jiusi.png` | redo |
| 57 | 赵敏 | `npc_zhaomin` | 女 | 少年 / 青年 | S | [npc_zhaomin__scene_lvliu.md](ch04-yitian/npc_zhaomin__scene_lvliu.md) | `por_npc_zhaomin__ch04_youth_scene_lvliu` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_lvliu.png` | candidate |
| 58 | 赵敏 | `npc_zhaomin` | 女 | 少年 / 青年 | S | [npc_zhaomin__scene_wanansi.md](ch04-yitian/npc_zhaomin__scene_wanansi.md) | `por_npc_zhaomin__ch04_youth_scene_wanansi` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_wanansi.png` | redo |
| 59 | 赵敏 | `npc_zhaomin` | 女 | 少年 / 青年 | S | [npc_zhaomin__scene_wudang.md](ch04-yitian/npc_zhaomin__scene_wudang.md) | `por_npc_zhaomin__ch04_youth_scene_wudang` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_wudang.png` | redo |
| 60 | 周颠 | `npc_zhoudian` | 男 | 壮年 | A | [npc_zhoudian.md](ch04-yitian/npc_zhoudian.md) | `por_npc_zhoudian__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_zhoudian__ch04_prime_base.png` | ready |
| 61 | 周芷若 | `npc_zhouzhiruo` | 女 | 少年 / 青年 | S | [npc_zhouzhiruo.md](ch04-yitian/npc_zhouzhiruo.md) | `por_npc_zhouzhiruo__ch04_youth_zhangmen_base` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_zhangmen_base.png` | candidate |
| 62 | 周芷若 | `npc_zhouzhiruo` | 女 | 少年 / 青年 | S | [npc_zhouzhiruo__scene_guangmingding.md](ch04-yitian/npc_zhouzhiruo__scene_guangmingding.md) | `por_npc_zhouzhiruo__ch04_youth_scene_guangmingding` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_guangmingding.png` | candidate |
| 63 | 周芷若 | `npc_zhouzhiruo` | 女 | 童年 | S | [npc_zhouzhiruo__scene_hanshui.md](ch04-yitian/npc_zhouzhiruo__scene_hanshui.md) | `por_npc_zhouzhiruo__ch04_child_scene_hanshui` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_child_scene_hanshui.png` | ready |
| 64 | 周芷若 | `npc_zhouzhiruo` | 女 | 少年 / 青年 | S | [npc_zhouzhiruo__scene_hongshang.md](ch04-yitian/npc_zhouzhiruo__scene_hongshang.md) | `por_npc_zhouzhiruo__ch04_youth_scene_hongshang` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_hongshang.png` | redo |
| 65 | 周芷若 | `npc_zhouzhiruo` | 女 | 少年 / 青年 | S | [npc_zhouzhiruo__scene_shaolin.md](ch04-yitian/npc_zhouzhiruo__scene_shaolin.md) | `por_npc_zhouzhiruo__ch04_youth_scene_shaolin` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_shaolin.png` | candidate |
| 66 | 周芷若 | `npc_zhouzhiruo` | 女 | 少年 / 青年 | S | [npc_zhouzhiruo__scene_wanansi.md](ch04-yitian/npc_zhouzhiruo__scene_wanansi.md) | `por_npc_zhouzhiruo__ch04_youth_scene_wanansi` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_wanansi.png` | redo |
| 67 | 朱长龄 | `npc_zhuchangling` | 男 | 老年 | A | [npc_zhuchangling.md](ch04-yitian/npc_zhuchangling.md) | `por_npc_zhuchangling__ch04_elder_zhuangyuan_base` | `assets/default/character/male/ch04/por_npc_zhuchangling__ch04_elder_zhuangyuan_base.png` | new |
| 68 | 朱元璋 | `npc_zhuyuanzhang` | 男 | 壮年 | A | [npc_zhuyuanzhang.md](ch04-yitian/npc_zhuyuanzhang.md) | `por_npc_zhuyuanzhang__ch04_prime_rebel_base` | `assets/default/character/male/ch04/por_npc_zhuyuanzhang__ch04_prime_rebel_base.png` | ready |

### ch05 · 《笑傲江湖》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 不戒和尚 | `npc_bujie` | 男 | 壮年 | A | [npc_bujie.md](ch05-xiaoao/npc_bujie.md) | `por_npc_bujie__ch05_prime_jianghu_base` | `assets/default/character/male/ch05/por_npc_bujie__ch05_prime_jianghu_base.png` | new |
| 2 | 冲虚道长 | `npc_chongxu` | 男 | 老年 | A | [npc_chongxu.md](ch05-xiaoao/npc_chongxu.md) | `por_npc_chongxu__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_chongxu__ch05_elder_base.png` | ready |
| 3 | 丹青生 | `npc_danqingsheng` | 男 | 壮年 | B | [npc_danqingsheng.md](ch05-xiaoao/npc_danqingsheng.md) | `por_npc_danqingsheng__ch05_prime_meizhuang_base` | `assets/default/character/male/ch05/por_npc_danqingsheng__ch05_prime_meizhuang_base.png` | new |
| 4 | 定静师太 | `npc_dingjing` | 女 | 老年 | A | [npc_dingjing.md](ch05-xiaoao/npc_dingjing.md) | `por_npc_dingjing__ch05_elder_hengshan_base` | `assets/default/character/female/ch05/por_npc_dingjing__ch05_elder_hengshan_base.png` | new |
| 5 | 丁勉 | `npc_dingmian` | 男 | 壮年 | B | [npc_dingmian.md](ch05-xiaoao/npc_dingmian.md) | `por_npc_dingmian__ch05_prime_hengyang_base` | `assets/default/character/male/ch05/por_npc_dingmian__ch05_prime_hengyang_base.png` | new |
| 6 | 定闲师太 | `npc_dingxian` | 女 | 老年 | A | [npc_dingxian.md](ch05-xiaoao/npc_dingxian.md) | `por_npc_dingxian__ch05_elder_base` | `assets/default/character/female/ch05/por_npc_dingxian__ch05_elder_base.png` | ready |
| 7 | 定逸师太 | `npc_dingyi` | 女 | 老年 | A | [npc_dingyi.md](ch05-xiaoao/npc_dingyi.md) | `por_npc_dingyi__ch05_elder_hengshan_base` | `assets/default/character/female/ch05/por_npc_dingyi__ch05_elder_hengshan_base.png` | new |
| 8 | 东方不败 | `npc_dongfangbubai` | 男 | 壮年 | S | [npc_dongfangbubai.md](ch05-xiaoao/npc_dongfangbubai.md) | `por_npc_dongfangbubai__ch05_prime_heimuya_base` | `assets/default/character/male/ch05/por_npc_dongfangbubai__ch05_prime_heimuya_base.png` | redo |
| 9 | 方生 | `npc_fangsheng` | 男 | 老年 | A | [npc_fangsheng.md](ch05-xiaoao/npc_fangsheng.md) | `por_npc_fangsheng__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_fangsheng__ch05_elder_base.png` | ready |
| 10 | 方证大师 | `npc_fangzheng` | 男 | 老年 | A | [npc_fangzheng.md](ch05-xiaoao/npc_fangzheng.md) | `por_npc_fangzheng__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_fangzheng__ch05_elder_base.png` | ready |
| 11 | 费彬 | `npc_feibin` | 男 | 壮年 | A | [npc_feibin.md](ch05-xiaoao/npc_feibin.md) | `por_npc_feibin__ch05_prime_hengyang_base` | `assets/default/character/male/ch05/por_npc_feibin__ch05_prime_hengyang_base.png` | new |
| 12 | 风清扬 | `npc_fengqingyang` | 男 | 老年 | A | [npc_fengqingyang.md](ch05-xiaoao/npc_fengqingyang.md) | `por_npc_fengqingyang__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_fengqingyang__ch05_elder_base.png` | ready |
| 13 | 黑白子 | `npc_heibaizi` | 男 | 老年 | B | [npc_heibaizi.md](ch05-xiaoao/npc_heibaizi.md) | `por_npc_heibaizi__ch05_elder_meizhuang_base` | `assets/default/character/male/ch05/por_npc_heibaizi__ch05_elder_meizhuang_base.png` | new |
| 14 | 黄钟公 | `npc_huangzhonggong` | 男 | 老年 | A | [npc_huangzhonggong.md](ch05-xiaoao/npc_huangzhonggong.md) | `por_npc_huangzhonggong__ch05_elder_meizhuang_base` | `assets/default/character/male/ch05/por_npc_huangzhonggong__ch05_elder_meizhuang_base.png` | new |
| 15 | 蓝凤凰 | `npc_lanfenghuang` | 女 | 少年 / 青年 | S | [npc_lanfenghuang.md](ch05-xiaoao/npc_lanfenghuang.md) | `por_npc_lanfenghuang__ch05_youth_base` | `assets/default/character/female/ch05/por_npc_lanfenghuang__ch05_youth_base.png` | ready |
| 16 | 劳德诺 | `npc_laodenuo` | 男 | 老年 | A | [npc_laodenuo.md](ch05-xiaoao/npc_laodenuo.md) | `por_npc_laodenuo__ch05_elder_huashan_base` | `assets/default/character/male/ch05/por_npc_laodenuo__ch05_elder_huashan_base.png` | new |
| 17 | 老头子 | `npc_laotouzi` | 男 | 老年 | A | [npc_laotouzi.md](ch05-xiaoao/npc_laotouzi.md) | `por_npc_laotouzi__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_laotouzi__ch05_elder_base.png` | ready |
| 18 | 令狐冲 | `npc_linghuchong` | 男 | 少年 / 青年 | S | [npc_linghuchong.md](ch05-xiaoao/npc_linghuchong.md) | `por_npc_linghuchong__ch05_youth_huashan_base` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_huashan_base.png` | candidate |
| 19 | 令狐冲 | `npc_linghuchong` | 男 | 少年 / 青年 | S | [npc_linghuchong__scene_hengshan.md](ch05-xiaoao/npc_linghuchong__scene_hengshan.md) | `por_npc_linghuchong__ch05_youth_scene_hengshan` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_hengshan.png` | candidate |
| 20 | 令狐冲 | `npc_linghuchong` | 男 | 少年 / 青年 | S | [npc_linghuchong__scene_luoyang.md](ch05-xiaoao/npc_linghuchong__scene_luoyang.md) | `por_npc_linghuchong__ch05_youth_scene_luoyang` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_luoyang.png` | redo |
| 21 | 令狐冲 | `npc_linghuchong` | 男 | 少年 / 青年 | S | [npc_linghuchong__scene_meizhuang_prison.md](ch05-xiaoao/npc_linghuchong__scene_meizhuang_prison.md) | `por_npc_linghuchong__ch05_youth_scene_meizhuang_prison` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_meizhuang_prison.png` | redo |
| 22 | 令狐冲 | `npc_linghuchong` | 男 | 少年 / 青年 | S | [npc_linghuchong__scene_quxie.md](ch05-xiaoao/npc_linghuchong__scene_quxie.md) | `por_npc_linghuchong__ch05_youth_scene_quxie` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_quxie.png` | redo |
| 23 | 令狐冲 | `npc_linghuchong` | 男 | 少年 / 青年 | S | [npc_linghuchong__scene_siguoya.md](ch05-xiaoao/npc_linghuchong__scene_siguoya.md) | `por_npc_linghuchong__ch05_youth_scene_siguoya` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_siguoya.png` | candidate |
| 24 | 林平之 | `npc_linpingzhi` | 男 | 少年 / 青年 | S | [npc_linpingzhi.md](ch05-xiaoao/npc_linpingzhi.md) | `por_npc_linpingzhi__ch05_youth_fuwei_base` | `assets/default/character/male/ch05/por_npc_linpingzhi__ch05_youth_fuwei_base.png` | redo |
| 25 | 林震南 | `npc_linzhennan` | 男 | 壮年 | A | [npc_linzhennan.md](ch05-xiaoao/npc_linzhennan.md) | `por_npc_linzhennan__ch05_prime_fuwei_base` | `assets/default/character/male/ch05/por_npc_linzhennan__ch05_prime_fuwei_base.png` | new |
| 26 | 刘正风 | `npc_liuzhengfeng` | 男 | 壮年 | A | [npc_liuzhengfeng.md](ch05-xiaoao/npc_liuzhengfeng.md) | `por_npc_liuzhengfeng__ch05_prime_before_ceremony_base` | `assets/default/character/male/ch05/por_npc_liuzhengfeng__ch05_prime_before_ceremony_base.png` | ready |
| 27 | 陆柏 | `npc_lubai` | 男 | 壮年 | B | [npc_lubai.md](ch05-xiaoao/npc_lubai.md) | `por_npc_lubai__ch05_prime_hengyang_base` | `assets/default/character/male/ch05/por_npc_lubai__ch05_prime_hengyang_base.png` | new |
| 28 | 陆大有 | `npc_ludayou` | 男 | 少年 / 青年 | A | [npc_ludayou.md](ch05-xiaoao/npc_ludayou.md) | `por_npc_ludayou__ch05_youth_huashan_base` | `assets/default/character/male/ch05/por_npc_ludayou__ch05_youth_huashan_base.png` | new |
| 29 | 莫大先生 | `npc_moda` | 男 | 老年 | S | [npc_moda.md](ch05-xiaoao/npc_moda.md) | `por_npc_moda__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_moda__ch05_elder_base.png` | ready |
| 30 | 木高峰 | `npc_mugaofeng` | 男 | 老年 | A | [npc_mugaofeng.md](ch05-xiaoao/npc_mugaofeng.md) | `por_npc_mugaofeng__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_mugaofeng__ch05_elder_base.png` | ready |
| 31 | 宁中则 | `npc_ningzhongze` | 女 | 壮年 | S | [npc_ningzhongze.md](ch05-xiaoao/npc_ningzhongze.md) | `por_npc_ningzhongze__ch05_prime_huashan_base` | `assets/default/character/female/ch05/por_npc_ningzhongze__ch05_prime_huashan_base.png` | ready |
| 32 | 平一指 | `npc_pingyizhi` | 男 | 壮年 | A | [npc_pingyizhi.md](ch05-xiaoao/npc_pingyizhi.md) | `por_npc_pingyizhi__ch05_prime_base` | `assets/default/character/male/ch05/por_npc_pingyizhi__ch05_prime_base.png` | ready |
| 33 | 曲非烟 | `npc_qufeiyan` | 女 | 少年 / 青年 | A | [npc_qufeiyan.md](ch05-xiaoao/npc_qufeiyan.md) | `por_npc_qufeiyan__ch05_youth_hengyang_base` | `assets/default/character/female/ch05/por_npc_qufeiyan__ch05_youth_hengyang_base.png` | new |
| 34 | 曲洋 | `npc_quyang` | 男 | 老年 | A | [npc_quyang.md](ch05-xiaoao/npc_quyang.md) | `por_npc_quyang__ch05_elder_before_ceremony_base` | `assets/default/character/male/ch05/por_npc_quyang__ch05_elder_before_ceremony_base.png` | ready |
| 35 | 任我行 | `npc_renwoxing` | 男 | 老年 | S | [npc_renwoxing.md](ch05-xiaoao/npc_renwoxing.md) | `por_npc_renwoxing__ch05_elder_released_base` | `assets/default/character/male/ch05/por_npc_renwoxing__ch05_elder_released_base.png` | redo |
| 36 | 任盈盈 | `npc_renyingying` | 女 | 少年 / 青年 | S | [npc_renyingying.md](ch05-xiaoao/npc_renyingying.md) | `por_npc_renyingying__ch05_youth_shenggu_base` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_shenggu_base.png` | candidate |
| 37 | 任盈盈 | `npc_renyingying` | 女 | 少年 / 青年 | S | [npc_renyingying__scene_heimuya.md](ch05-xiaoao/npc_renyingying__scene_heimuya.md) | `por_npc_renyingying__ch05_youth_scene_heimuya` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_heimuya.png` | redo |
| 38 | 任盈盈 | `npc_renyingying` | 女 | 少年 / 青年 | S | [npc_renyingying__scene_hengshan.md](ch05-xiaoao/npc_renyingying__scene_hengshan.md) | `por_npc_renyingying__ch05_youth_scene_hengshan` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_hengshan.png` | redo |
| 39 | 任盈盈 | `npc_renyingying` | 女 | 少年 / 青年 | S | [npc_renyingying__scene_quxie.md](ch05-xiaoao/npc_renyingying__scene_quxie.md) | `por_npc_renyingying__ch05_youth_scene_quxie` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_quxie.png` | candidate |
| 40 | 任盈盈 | `npc_renyingying` | 女 | 少年 / 青年 | S | [npc_renyingying__scene_shaolin.md](ch05-xiaoao/npc_renyingying__scene_shaolin.md) | `por_npc_renyingying__ch05_youth_scene_shaolin` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_shaolin.png` | redo |
| 41 | 任盈盈 | `npc_renyingying` | 女 | 少年 / 青年 | S | [npc_renyingying__scene_zhuxiang.md](ch05-xiaoao/npc_renyingying__scene_zhuxiang.md) | `por_npc_renyingying__ch05_youth_scene_zhuxiang` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_zhuxiang.png` | candidate |
| 42 | 田伯光 | `npc_tianboguang` | 男 | 壮年 | A | [npc_tianboguang.md](ch05-xiaoao/npc_tianboguang.md) | `por_npc_tianboguang__ch05_prime_before_ordination_base` | `assets/default/character/male/ch05/por_npc_tianboguang__ch05_prime_before_ordination_base.png` | ready |
| 43 | 天门道人 | `npc_tianmen` | 男 | 壮年 | A | [npc_tianmen.md](ch05-xiaoao/npc_tianmen.md) | `por_npc_tianmen__ch05_prime_taishan_base` | `assets/default/character/male/ch05/por_npc_tianmen__ch05_prime_taishan_base.png` | new |
| 44 | 秃笔翁 | `npc_tubiweng` | 男 | 老年 | B | [npc_tubiweng.md](ch05-xiaoao/npc_tubiweng.md) | `por_npc_tubiweng__ch05_elder_meizhuang_base` | `assets/default/character/male/ch05/por_npc_tubiweng__ch05_elder_meizhuang_base.png` | new |
| 45 | 向问天 | `npc_xiangwentian` | 男 | 壮年 | S | [npc_xiangwentian.md](ch05-xiaoao/npc_xiangwentian.md) | `por_npc_xiangwentian__ch05_prime_rescue_base` | `assets/default/character/male/ch05/por_npc_xiangwentian__ch05_prime_rescue_base.png` | ready |
| 46 | 杨莲亭 | `npc_yanglianting` | 男 | 壮年 | A | [npc_yanglianting.md](ch05-xiaoao/npc_yanglianting.md) | `por_npc_yanglianting__ch05_prime_heimuya_base` | `assets/default/character/male/ch05/por_npc_yanglianting__ch05_prime_heimuya_base.png` | new |
| 47 | 仪琳 | `npc_yilin` | 女 | 少年 / 青年 | S | [npc_yilin.md](ch05-xiaoao/npc_yilin.md) | `por_npc_yilin__ch05_youth_base` | `assets/default/character/female/ch05/por_npc_yilin__ch05_youth_base.png` | redo |
| 48 | 余沧海 | `npc_yucanghai` | 男 | 壮年 | A | [npc_yucanghai.md](ch05-xiaoao/npc_yucanghai.md) | `por_npc_yucanghai__ch05_prime_base` | `assets/default/character/male/ch05/por_npc_yucanghai__ch05_prime_base.png` | ready |
| 49 | 岳不群 | `npc_yuebuqun` | 男 | 壮年 | S | [npc_yuebuqun.md](ch05-xiaoao/npc_yuebuqun.md) | `por_npc_yuebuqun__ch05_prime_huashan_base` | `assets/default/character/male/ch05/por_npc_yuebuqun__ch05_prime_huashan_base.png` | redo |
| 50 | 岳灵珊 | `npc_yuelingshan` | 女 | 少年 / 青年 | S | [npc_yuelingshan.md](ch05-xiaoao/npc_yuelingshan.md) | `por_npc_yuelingshan__ch05_youth_huashan_base` | `assets/default/character/female/ch05/por_npc_yuelingshan__ch05_youth_huashan_base.png` | redo |
| 51 | 左冷禅 | `npc_zuolengchan` | 男 | 壮年 | S | [npc_zuolengchan.md](ch05-xiaoao/npc_zuolengchan.md) | `por_npc_zuolengchan__ch05_prime_sighted_base` | `assets/default/character/male/ch05/por_npc_zuolengchan__ch05_prime_sighted_base.png` | ready |
| 52 | 祖千秋 | `npc_zuqianqiu` | 男 | 老年 | A | [npc_zuqianqiu.md](ch05-xiaoao/npc_zuqianqiu.md) | `por_npc_zuqianqiu__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_zuqianqiu__ch05_elder_base.png` | ready |

### ch06 · 《侠客行》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 白阿绣 | `npc_axiu` | 女 | 少年 / 青年 | S | [npc_axiu.md](ch06-xiake/npc_axiu.md) | `por_npc_axiu__ch06_youth_ziyan_base` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_ziyan_base.png` | new |
| 2 | 阿绣 | `npc_axiu` | 女 | 少年 / 青年 | S | [npc_axiu__scene_guihang.md](ch06-xiake/npc_axiu__scene_guihang.md) | `por_npc_axiu__ch06_youth_scene_guihang` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_guihang.png` | redo |
| 3 | 阿绣 | `npc_axiu` | 女 | 少年 / 青年 | S | [npc_axiu__scene_lingxiao.md](ch06-xiake/npc_axiu__scene_lingxiao.md) | `por_npc_axiu__ch06_youth_scene_lingxiao` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_lingxiao.png` | redo |
| 4 | 阿绣 | `npc_axiu` | 女 | 少年 / 青年 | S | [npc_axiu__scene_pangqiao.md](ch06-xiake/npc_axiu__scene_pangqiao.md) | `por_npc_axiu__ch06_youth_scene_pangqiao` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_pangqiao.png` | redo |
| 5 | 阿绣 | `npc_axiu` | 女 | 少年 / 青年 | S | [npc_axiu__scene_songhai.md](ch06-xiake/npc_axiu__scene_songhai.md) | `por_npc_axiu__ch06_youth_scene_songhai` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_songhai.png` | redo |
| 6 | 阿绣 | `npc_axiu` | 女 | 少年 / 青年 | S | [npc_axiu__scene_ziyan.md](ch06-xiake/npc_axiu__scene_ziyan.md) | `por_npc_axiu__ch06_youth_scene_ziyan` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_ziyan.png` | redo |
| 7 | 白万剑 | `npc_baiwanjian` | 男 | 壮年 | A | [npc_baiwanjian.md](ch06-xiake/npc_baiwanjian.md) | `por_npc_baiwanjian__ch06_prime_xunnv_base` | `assets/default/character/male/ch06/por_npc_baiwanjian__ch06_prime_xunnv_base.png` | ready |
| 8 | 白自在 | `npc_baizizai` | 男 | 老年 | S | [npc_baizizai.md](ch06-xiake/npc_baizizai.md) | `por_npc_baizizai__ch06_elder_lingxiao_base` | `assets/default/character/male/ch06/por_npc_baizizai__ch06_elder_lingxiao_base.png` | ready |
| 9 | 贝海石 | `npc_beihaishi` | 男 | 老年 | A | [npc_beihaishi.md](ch06-xiake/npc_beihaishi.md) | `por_npc_beihaishi__ch06_elder_changle_base` | `assets/default/character/male/ch06/por_npc_beihaishi__ch06_elder_changle_base.png` | ready |
| 10 | 成自学 | `npc_chengzixue` | 男 | 老年 | A | [npc_chengzixue.md](ch06-xiake/npc_chengzixue.md) | `por_npc_chengzixue__ch06_elder_lingxiao_base` | `assets/default/character/male/ch06/por_npc_chengzixue__ch06_elder_lingxiao_base.png` | new |
| 11 | 大悲老人 | `npc_dabeilaoren` | 男 | 老年 | A | [npc_dabeilaoren.md](ch06-xiake/npc_dabeilaoren.md) | `por_npc_dabeilaoren__ch06_elder_alive_base` | `assets/default/character/male/ch06/por_npc_dabeilaoren__ch06_elder_alive_base.png` | ready |
| 12 | 丁不三 | `npc_dingbusan` | 男 | 老年 | A | [npc_dingbusan.md](ch06-xiake/npc_dingbusan.md) | `por_npc_dingbusan__ch06_elder_zhouhang_base` | `assets/default/character/male/ch06/por_npc_dingbusan__ch06_elder_zhouhang_base.png` | ready |
| 13 | 丁不四 | `npc_dingbusi` | 男 | 老年 | S | [npc_dingbusi.md](ch06-xiake/npc_dingbusi.md) | `por_npc_dingbusi__ch06_elder_jinlongbian_base` | `assets/default/character/male/ch06/por_npc_dingbusi__ch06_elder_jinlongbian_base.png` | ready |
| 14 | 丁珰 | `npc_dingdang` | 女 | 少年 / 青年 | S | [npc_dingdang.md](ch06-xiake/npc_dingdang.md) | `por_npc_dingdang__ch06_youth_changle_base` | `assets/default/character/female/ch06/por_npc_dingdang__ch06_youth_changle_base.png` | redo |
| 15 | 范一飞 | `npc_fanyifei` | 男 | 壮年 | B | [npc_fanyifei.md](ch06-xiake/npc_fanyifei.md) | `por_npc_fanyifei__ch06_prime_guandong_base` | `assets/default/character/male/ch06/por_npc_fanyifei__ch06_prime_guandong_base.png` | new |
| 16 | 风良 | `npc_fengliang` | 男 | 壮年 | B | [npc_fengliang.md](ch06-xiake/npc_fengliang.md) | `por_npc_fengliang__ch06_prime_guandong_base` | `assets/default/character/male/ch06/por_npc_fengliang__ch06_prime_guandong_base.png` | new |
| 17 | 封万里 | `npc_fengwanli` | 男 | 壮年 | A | [npc_fengwanli.md](ch06-xiake/npc_fengwanli.md) | `por_npc_fengwanli__ch06_prime_onearm_base` | `assets/default/character/male/ch06/por_npc_fengwanli__ch06_prime_onearm_base.png` | redo |
| 18 | 高三娘子 | `npc_gaosanniangzi` | 女 | 壮年 | A | [npc_gaosanniangzi.md](ch06-xiake/npc_gaosanniangzi.md) | `por_npc_gaosanniangzi__ch06_prime_wanmazhuang_base` | `assets/default/character/female/ch06/por_npc_gaosanniangzi__ch06_prime_wanmazhuang_base.png` | new |
| 19 | 花万紫 | `npc_huawanzi` | 女 | 壮年 | B | [npc_huawanzi.md](ch06-xiake/npc_huawanzi.md) | `por_npc_huawanzi__ch06_prime_xueshan_base` | `assets/default/character/female/ch06/por_npc_huawanzi__ch06_prime_xueshan_base.png` | new |
| 20 | 李四 | `npc_lisi06` | 男 | 壮年 | S | [npc_lisi06.md](ch06-xiake/npc_lisi06.md) | `por_npc_lisi06__ch06_prime_yaojiu_base` | `assets/default/character/male/ch06/por_npc_lisi06__ch06_prime_yaojiu_base.png` | ready |
| 21 | 龙岛主 | `npc_longdaozhu` | 男 | 老年 | S | [npc_longdaozhu.md](ch06-xiake/npc_longdaozhu.md) | `por_npc_longdaozhu__ch06_elder_alive_base` | `assets/default/character/male/ch06/por_npc_longdaozhu__ch06_elder_alive_base.png` | ready |
| 22 | 吕正平 | `npc_lvzhengping` | 男 | 壮年 | B | [npc_lvzhengping.md](ch06-xiake/npc_lvzhengping.md) | `por_npc_lvzhengping__ch06_prime_guandong_base` | `assets/default/character/male/ch06/por_npc_lvzhengping__ch06_prime_guandong_base.png` | new |
| 23 | 梅芳姑 | `npc_meifanggu` | 女 | 壮年 | A | [npc_meifanggu.md](ch06-xiake/npc_meifanggu.md) | `por_npc_meifanggu__ch06_prime_disfigured_base` | `assets/default/character/female/ch06/por_npc_meifanggu__ch06_prime_disfigured_base.png` | ready |
| 24 | 妙谛大师 | `npc_miaodi` | 男 | 老年 | A | [npc_miaodi.md](ch06-xiake/npc_miaodi.md) | `por_npc_miaodi__ch06_elder_island_base` | `assets/default/character/male/ch06/por_npc_miaodi__ch06_elder_island_base.png` | ready |
| 25 | 米横野 | `npc_mihengye` | 男 | 壮年 | B | [npc_mihengye.md](ch06-xiake/npc_mihengye.md) | `por_npc_mihengye__ch06_prime_changle_base` | `assets/default/character/male/ch06/por_npc_mihengye__ch06_prime_changle_base.png` | ready |
| 26 | 闵柔 | `npc_minrou` | 女 | 壮年 | A | [npc_minrou.md](ch06-xiake/npc_minrou.md) | `por_npc_minrou__ch06_prime_xunzi_base` | `assets/default/character/female/ch06/por_npc_minrou__ch06_prime_xunzi_base.png` | ready |
| 27 | 木岛主 | `npc_mudaozhu` | 男 | 老年 | S | [npc_mudaozhu.md](ch06-xiake/npc_mudaozhu.md) | `por_npc_mudaozhu__ch06_elder_alive_base` | `assets/default/character/male/ch06/por_npc_mudaozhu__ch06_elder_alive_base.png` | ready |
| 28 | 侍剑 | `npc_shijian` | 女 | 少年 / 青年 | A | [npc_shijian.md](ch06-xiake/npc_shijian.md) | `por_npc_shijian__ch06_youth_alive_base` | `assets/default/character/female/ch06/por_npc_shijian__ch06_youth_alive_base.png` | redo |
| 29 | 石破天 | `npc_shipotian` | 男 | 少年 / 青年 | S | [npc_shipotian.md](ch06-xiake/npc_shipotian.md) | `por_npc_shipotian__ch06_youth_jinwu_base` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_jinwu_base.png` | candidate |
| 30 | 石破天 | `npc_shipotian` | 男 | 少年 / 青年 | S | [npc_shipotian__scene_jinwu.md](ch06-xiake/npc_shipotian__scene_jinwu.md) | `por_npc_shipotian__ch06_youth_scene_jinwu` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_jinwu.png` | redo |
| 31 | 石破天 | `npc_shipotian` | 男 | 少年 / 青年 | S | [npc_shipotian__scene_labazhou.md](ch06-xiake/npc_shipotian__scene_labazhou.md) | `por_npc_shipotian__ch06_youth_scene_labazhou` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_labazhou.png` | redo |
| 32 | 石破天 | `npc_shipotian` | 男 | 少年 / 青年 | S | [npc_shipotian__scene_motianya.md](ch06-xiake/npc_shipotian__scene_motianya.md) | `por_npc_shipotian__ch06_youth_scene_motianya` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_motianya.png` | candidate |
| 33 | 石破天 | `npc_shipotian` | 男 | 少年 / 青年 | S | [npc_shipotian__scene_taixuan.md](ch06-xiake/npc_shipotian__scene_taixuan.md) | `por_npc_shipotian__ch06_youth_scene_taixuan` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_taixuan.png` | candidate |
| 34 | 石破天 | `npc_shipotian` | 男 | 少年 / 青年 | S | [npc_shipotian__scene_xuantie.md](ch06-xiake/npc_shipotian__scene_xuantie.md) | `por_npc_shipotian__ch06_child_scene_xuantie` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_child_scene_xuantie.png` | redo |
| 35 | 石清 | `npc_shiqing` | 男 | 壮年 | A | [npc_shiqing.md](ch06-xiake/npc_shiqing.md) | `por_npc_shiqing__ch06_prime_xunzi_base` | `assets/default/character/male/ch06/por_npc_shiqing__ch06_prime_xunzi_base.png` | ready |
| 36 | 史小翠 | `npc_shixiaocui` | 女 | 老年 | A | [npc_shixiaocui.md](ch06-xiake/npc_shixiaocui.md) | `por_npc_shixiaocui__ch06_elder_jinwu_base` | `assets/default/character/female/ch06/por_npc_shixiaocui__ch06_elder_jinwu_base.png` | ready |
| 37 | 石中玉 | `npc_shizhongyu` | 男 | 少年 / 青年 | S | [npc_shizhongyu.md](ch06-xiake/npc_shizhongyu.md) | `por_npc_shizhongyu__ch06_youth_bangzhu_base` | `assets/default/character/male/ch06/por_npc_shizhongyu__ch06_youth_bangzhu_base.png` | ready |
| 38 | 司徒横 | `npc_situheng` | 男 | 壮年 | A | [npc_situheng.md](ch06-xiake/npc_situheng.md) | `por_npc_situheng__ch06_prime_memory_base` | `assets/default/character/male/ch06/por_npc_situheng__ch06_prime_memory_base.png` | new |
| 39 | 谢烟客 | `npc_xieyanke` | 男 | 老年 | S | [npc_xieyanke.md](ch06-xiake/npc_xieyanke.md) | `por_npc_xieyanke__ch06_elder_motian_base` | `assets/default/character/male/ch06/por_npc_xieyanke__ch06_elder_motian_base.png` | ready |
| 40 | 愚茶道长 | `npc_yucha` | 男 | 老年 | A | [npc_yucha.md](ch06-xiake/npc_yucha.md) | `por_npc_yucha__ch06_elder_island_base` | `assets/default/character/male/ch06/por_npc_yucha__ch06_elder_island_base.png` | ready |
| 41 | 展飞 | `npc_zhanfei` | 男 | 壮年 | B | [npc_zhanfei.md](ch06-xiake/npc_zhanfei.md) | `por_npc_zhanfei__ch06_prime_injured_base` | `assets/default/character/male/ch06/por_npc_zhanfei__ch06_prime_injured_base.png` | ready |
| 42 | 张三 | `npc_zhangsan06` | 男 | 壮年 | S | [npc_zhangsan06.md](ch06-xiake/npc_zhangsan06.md) | `por_npc_zhangsan06__ch06_prime_yaojiu_base` | `assets/default/character/male/ch06/por_npc_zhangsan06__ch06_prime_yaojiu_base.png` | ready |

### ch07 · 《碧血剑》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿九 | `npc_ajiu` | 女 | 少年 / 青年 | S | [npc_ajiu.md](ch07-bixue/npc_ajiu.md) | `por_npc_ajiu__ch07_youth_preinjury_base` | `assets/default/character/female/ch07/por_npc_ajiu__ch07_youth_preinjury_base.png` | new |
| 2 | 安大娘 | `npc_andaniang` | 女 | 壮年 | A | [npc_andaniang.md](ch07-bixue/npc_andaniang.md) | `por_npc_andaniang__ch07_prime_jianghu_base` | `assets/default/character/female/ch07/por_npc_andaniang__ch07_prime_jianghu_base.png` | new |
| 3 | 安剑清 | `npc_anjianqing` | 男 | 壮年 | A | [npc_anjianqing.md](ch07-bixue/npc_anjianqing.md) | `por_npc_anjianqing__ch07_prime_palace_base` | `assets/default/character/male/ch07/por_npc_anjianqing__ch07_prime_palace_base.png` | ready |
| 4 | 安小慧 | `npc_anxiaohui` | 女 | 少年 / 青年 | A | [npc_anxiaohui.md](ch07-bixue/npc_anxiaohui.md) | `por_npc_anxiaohui__ch07_youth_base` | `assets/default/character/female/ch07/por_npc_anxiaohui__ch07_youth_base.png` | redo |
| 5 | 曹化淳 | `npc_caohuachun` | 男 | 老年 | A | [npc_caohuachun.md](ch07-bixue/npc_caohuachun.md) | `por_npc_caohuachun__ch07_base` | `assets/default/character/male/ch07/por_npc_caohuachun__ch07_base.png` | ready |
| 6 | 程青竹 | `npc_chengqingzhu` | 男 | 老年 | S | [npc_chengqingzhu.md](ch07-bixue/npc_chengqingzhu.md) | `por_npc_chengqingzhu__ch07_base` | `assets/default/character/male/ch07/por_npc_chengqingzhu__ch07_base.png` | ready |
| 7 | 陈圆圆 | `npc_chenyuanyuan` | 女 | 少年 / 青年 | A | [npc_chenyuanyuan.md](ch07-bixue/npc_chenyuanyuan.md) | `por_npc_chenyuanyuan__ch07_youth_base` | `assets/default/character/female/ch07/por_npc_chenyuanyuan__ch07_youth_base.png` | redo |
| 8 | 崇祯帝朱由检 | `npc_chongzhen` | 男 | 壮年 | A | [npc_chongzhen.md](ch07-bixue/npc_chongzhen.md) | `por_npc_chongzhen__ch07_prime_predeath_base` | `assets/default/character/male/ch07/por_npc_chongzhen__ch07_prime_predeath_base.png` | ready |
| 9 | 崔秋山 | `npc_cuiqiushan` | 男 | 壮年 | A | [npc_cuiqiushan.md](ch07-bixue/npc_cuiqiushan.md) | `por_npc_cuiqiushan__ch07_prime_opening_base` | `assets/default/character/male/ch07/por_npc_cuiqiushan__ch07_prime_opening_base.png` | ready |
| 10 | 崔希敏 | `npc_cuiximin` | 男 | 少年 / 青年 | A | [npc_cuiximin.md](ch07-bixue/npc_cuiximin.md) | `por_npc_cuiximin__ch07_base` | `assets/default/character/male/ch07/por_npc_cuiximin__ch07_base.png` | ready |
| 11 | 多尔衮 | `npc_duoergun` | 男 | 壮年 | A | [npc_duoergun.md](ch07-bixue/npc_duoergun.md) | `por_npc_duoergun__ch07_base` | `assets/default/character/male/ch07/por_npc_duoergun__ch07_base.png` | ready |
| 12 | 归二娘 | `npc_guierniang` | 女 | 壮年 | S | [npc_guierniang.md](ch07-bixue/npc_guierniang.md) | `por_npc_guierniang__ch07_prime_base` | `assets/default/character/female/ch07/por_npc_guierniang__ch07_prime_base.png` | ready |
| 13 | 归钟 | `npc_guisong` | 男 | 少年 / 青年 | A | [npc_guisong.md](ch07-bixue/npc_guisong.md) | `por_npc_guisong__ch07_youth_adult_base` | `assets/default/character/male/ch07/por_npc_guisong__ch07_youth_adult_base.png` | new |
| 14 | 归辛树 | `npc_guixinshu` | 男 | 老年 | S | [npc_guixinshu.md](ch07-bixue/npc_guixinshu.md) | `por_npc_guixinshu__ch07_elder_base` | `assets/default/character/male/ch07/por_npc_guixinshu__ch07_elder_base.png` | ready |
| 15 | 何红药 | `npc_hehongyao` | 女 | 壮年 | A | [npc_hehongyao.md](ch07-bixue/npc_hehongyao.md) | `por_npc_hehongyao__ch07_base` | `assets/default/character/female/ch07/por_npc_hehongyao__ch07_base.png` | ready |
| 16 | 何铁手 | `npc_hetieshou` | 女 | 少年 / 青年 | S | [npc_hetieshou.md](ch07-bixue/npc_hetieshou.md) | `por_npc_hetieshou__ch07_youth_leader_base` | `assets/default/character/female/ch07/por_npc_hetieshou__ch07_youth_leader_base.png` | new |
| 17 | 红娘子 | `npc_hongniangzi` | 女 | 壮年 | S | [npc_hongniangzi.md](ch07-bixue/npc_hongniangzi.md) | `por_npc_hongniangzi__ch07_base` | `assets/default/character/female/ch07/por_npc_hongniangzi__ch07_base.png` | ready |
| 18 | 洪胜海 | `npc_hongshenghai` | 男 | 壮年 | B | [npc_hongshenghai.md](ch07-bixue/npc_hongshenghai.md) | `por_npc_hongshenghai__ch07_prime_jianghu_base` | `assets/default/character/male/ch07/por_npc_hongshenghai__ch07_prime_jianghu_base.png` | new |
| 19 | 皇太极 | `npc_huangtaiji` | 男 | 老年 | A | [npc_huangtaiji.md](ch07-bixue/npc_huangtaiji.md) | `por_npc_huangtaiji__ch07_elder_predeath_base` | `assets/default/character/male/ch07/por_npc_huangtaiji__ch07_elder_predeath_base.png` | ready |
| 20 | 黄真 | `npc_huangzhen` | 男 | 老年 | S | [npc_huangzhen.md](ch07-bixue/npc_huangzhen.md) | `por_npc_huangzhen__ch07_base` | `assets/default/character/male/ch07/por_npc_huangzhen__ch07_base.png` | ready |
| 21 | 胡桂南 | `npc_huguinan` | 男 | 壮年 | B | [npc_huguinan.md](ch07-bixue/npc_huguinan.md) | `por_npc_huguinan__ch07_prime_jianghu_base` | `assets/default/character/male/ch07/por_npc_huguinan__ch07_prime_jianghu_base.png` | new |
| 22 | 焦公礼 | `npc_jiaogongli` | 男 | 老年 | A | [npc_jiaogongli.md](ch07-bixue/npc_jiaogongli.md) | `por_npc_jiaogongli__ch07_base` | `assets/default/character/male/ch07/por_npc_jiaogongli__ch07_base.png` | ready |
| 23 | 焦宛儿 | `npc_jiaowaner` | 女 | 少年 / 青年 | A | [npc_jiaowaner.md](ch07-bixue/npc_jiaowaner.md) | `por_npc_jiaowaner__ch07_base` | `assets/default/character/female/ch07/por_npc_jiaowaner__ch07_base.png` | redo |
| 24 | 刘培生 | `npc_liupeisheng` | 男 | 壮年 | B | [npc_liupeisheng.md](ch07-bixue/npc_liupeisheng.md) | `por_npc_liupeisheng__ch07_base` | `assets/default/character/male/ch07/por_npc_liupeisheng__ch07_base.png` | ready |
| 25 | 李岩 | `npc_liyan` | 男 | 壮年 | S | [npc_liyan.md](ch07-bixue/npc_liyan.md) | `por_npc_liyan__ch07_base` | `assets/default/character/male/ch07/por_npc_liyan__ch07_base.png` | ready |
| 26 | 李自成 | `npc_lizicheng` | 男 | 壮年 | A | [npc_lizicheng.md](ch07-bixue/npc_lizicheng.md) | `por_npc_lizicheng__ch07_prime_leader_base` | `assets/default/character/male/ch07/por_npc_lizicheng__ch07_prime_leader_base.png` | ready |
| 27 | 罗立如 | `npc_luoliru` | 男 | 壮年 | B | [npc_luoliru.md](ch07-bixue/npc_luoliru.md) | `por_npc_luoliru__ch07_prime_onearm_base` | `assets/default/character/male/ch07/por_npc_luoliru__ch07_prime_onearm_base.png` | new |
| 28 | 梅剑和 | `npc_meijianhe` | 男 | 少年 / 青年 | B | [npc_meijianhe.md](ch07-bixue/npc_meijianhe.md) | `por_npc_meijianhe__ch07_base` | `assets/default/character/male/ch07/por_npc_meijianhe__ch07_base.png` | ready |
| 29 | 孟伯飞 | `npc_mengbofei` | 男 | 老年 | B | [npc_mengbofei.md](ch07-bixue/npc_mengbofei.md) | `por_npc_mengbofei__ch07_elder_qunxiong_base` | `assets/default/character/male/ch07/por_npc_mengbofei__ch07_elder_qunxiong_base.png` | new |
| 30 | 闵子华 | `npc_minzihua` | 男 | 壮年 | A | [npc_minzihua.md](ch07-bixue/npc_minzihua.md) | `por_npc_minzihua__ch07_prime_beforeloss_base` | `assets/default/character/male/ch07/por_npc_minzihua__ch07_prime_beforeloss_base.png` | ready |
| 31 | 穆人清 | `npc_murenqing` | 男 | 老年 | A | [npc_murenqing.md](ch07-bixue/npc_murenqing.md) | `por_npc_murenqing__ch07_base` | `assets/default/character/male/ch07/por_npc_murenqing__ch07_base.png` | ready |
| 32 | 木桑道人 | `npc_musang` | 男 | 老年 | S | [npc_musang.md](ch07-bixue/npc_musang.md) | `por_npc_musang__ch07_base` | `assets/default/character/male/ch07/por_npc_musang__ch07_base.png` | ready |
| 33 | 沙天广 | `npc_shatianguang` | 男 | 壮年 | A | [npc_shatianguang.md](ch07-bixue/npc_shatianguang.md) | `por_npc_shatianguang__ch07_base` | `assets/default/character/male/ch07/por_npc_shatianguang__ch07_base.png` | ready |
| 34 | 孙仲君 | `npc_sunzhongjun` | 女 | 少年 / 青年 | A | [npc_sunzhongjun.md](ch07-bixue/npc_sunzhongjun.md) | `por_npc_sunzhongjun__ch07_youth_prepunishment_base` | `assets/default/character/female/ch07/por_npc_sunzhongjun__ch07_youth_prepunishment_base.png` | redo |
| 35 | 孙仲寿 | `npc_sunzhongshou` | 男 | 老年 | A | [npc_sunzhongshou.md](ch07-bixue/npc_sunzhongshou.md) | `por_npc_sunzhongshou__ch07_base` | `assets/default/character/male/ch07/por_npc_sunzhongshou__ch07_base.png` | ready |
| 36 | 温方达 | `npc_wenfangda` | 男 | 老年 | A | [npc_wenfangda.md](ch07-bixue/npc_wenfangda.md) | `por_npc_wenfangda__ch07_base` | `assets/default/character/male/ch07/por_npc_wenfangda__ch07_base.png` | ready |
| 37 | 温方山 | `npc_wenfangshan` | 男 | 老年 | A | [npc_wenfangshan.md](ch07-bixue/npc_wenfangshan.md) | `por_npc_wenfangshan__ch07_elder_shiliang_base` | `assets/default/character/male/ch07/por_npc_wenfangshan__ch07_elder_shiliang_base.png` | new |
| 38 | 温方施 | `npc_wenfangshi` | 男 | 老年 | A | [npc_wenfangshi.md](ch07-bixue/npc_wenfangshi.md) | `por_npc_wenfangshi__ch07_base` | `assets/default/character/male/ch07/por_npc_wenfangshi__ch07_base.png` | ready |
| 39 | 温方悟 | `npc_wenfangwu` | 男 | 老年 | B | [npc_wenfangwu.md](ch07-bixue/npc_wenfangwu.md) | `por_npc_wenfangwu__ch07_elder_shiliang_base` | `assets/default/character/male/ch07/por_npc_wenfangwu__ch07_elder_shiliang_base.png` | new |
| 40 | 温方义 | `npc_wenfangyi` | 男 | 老年 | A | [npc_wenfangyi.md](ch07-bixue/npc_wenfangyi.md) | `por_npc_wenfangyi__ch07_base` | `assets/default/character/male/ch07/por_npc_wenfangyi__ch07_base.png` | ready |
| 41 | 温青青 | `npc_wenqingqing` | 女 | 少年 / 青年 | S | [npc_wenqingqing.md](ch07-bixue/npc_wenqingqing.md) | `por_npc_wenqingqing__ch07_youth_disguise_base` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_disguise_base.png` | candidate |
| 42 | 温青青 | `npc_wenqingqing` | 女 | 少年 / 青年 | S | [npc_wenqingqing__scene_shiliang.md](ch07-bixue/npc_wenqingqing__scene_shiliang.md) | `por_npc_wenqingqing__ch07_youth_scene_shiliang` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_shiliang.png` | candidate |
| 43 | 温青青 | `npc_wenqingqing` | 女 | 少年 / 青年 | S | [npc_wenqingqing__scene_yuexiao.md](ch07-bixue/npc_wenqingqing__scene_yuexiao.md) | `por_npc_wenqingqing__ch07_youth_scene_yuexiao` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_yuexiao.png` | candidate |
| 44 | 温仪 | `npc_wenyi` | 女 | 壮年 | A | [npc_wenyi.md](ch07-bixue/npc_wenyi.md) | `por_npc_wenyi__ch07_base` | `assets/default/character/female/ch07/por_npc_wenyi__ch07_base.png` | ready |
| 45 | 吴三桂 | `npc_wusangui` | 男 | 壮年 | A | [npc_wusangui.md](ch07-bixue/npc_wusangui.md) | `por_npc_wusangui__ch07_prime_ming_base` | `assets/default/character/male/ch07/por_npc_wusangui__ch07_prime_ming_base.png` | ready |
| 46 | 夏雪宜 | `npc_xiaxueyi` | 男 | 壮年 | S | [npc_xiaxueyi.md](ch07-bixue/npc_xiaxueyi.md) | `por_npc_xiaxueyi__ch07_prime_memory_base` | `assets/default/character/male/ch07/por_npc_xiaxueyi__ch07_prime_memory_base.png` | new |
| 47 | 袁承志 | `npc_yuanchengzhi` | 男 | 少年 / 青年 | S | [npc_yuanchengzhi.md](ch07-bixue/npc_yuanchengzhi.md) | `por_npc_yuanchengzhi__ch07_youth_jinshe_base` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_jinshe_base.png` | candidate |
| 48 | 袁承志 | `npc_yuanchengzhi` | 男 | 少年 / 青年 | S | [npc_yuanchengzhi__scene_huashan.md](ch07-bixue/npc_yuanchengzhi__scene_huashan.md) | `por_npc_yuanchengzhi__ch07_child_scene_huashan` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_child_scene_huashan.png` | redo |
| 49 | 袁承志 | `npc_yuanchengzhi` | 男 | 少年 / 青年 | S | [npc_yuanchengzhi__scene_jinshedong.md](ch07-bixue/npc_yuanchengzhi__scene_jinshedong.md) | `por_npc_yuanchengzhi__ch07_youth_scene_jinshedong` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.png` | candidate |
| 50 | 袁承志 | `npc_yuanchengzhi` | 男 | 少年 / 青年 | S | [npc_yuanchengzhi__scene_quguo.md](ch07-bixue/npc_yuanchengzhi__scene_quguo.md) | `por_npc_yuanchengzhi__ch07_youth_scene_quguo` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_quguo.png` | redo |
| 51 | 袁承志 | `npc_yuanchengzhi` | 男 | 少年 / 青年 | S | [npc_yuanchengzhi__scene_shengjing.md](ch07-bixue/npc_yuanchengzhi__scene_shengjing.md) | `por_npc_yuanchengzhi__ch07_youth_scene_shengjing` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_shengjing.png` | candidate |
| 52 | 袁承志 | `npc_yuanchengzhi` | 男 | 少年 / 青年 | S | [npc_yuanchengzhi__scene_taishan.md](ch07-bixue/npc_yuanchengzhi__scene_taishan.md) | `por_npc_yuanchengzhi__ch07_youth_scene_taishan` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_taishan.png` | redo |
| 53 | 袁崇焕 | `npc_yuanchonghuan` | 男 | 壮年 | A | [npc_yuanchonghuan.md](ch07-bixue/npc_yuanchonghuan.md) | `por_npc_yuanchonghuan__ch07_prime_memory_base` | `assets/default/character/male/ch07/por_npc_yuanchonghuan__ch07_prime_memory_base.png` | new |
| 54 | 玉真子 | `npc_yuzhenzi` | 男 | 老年 | S | [npc_yuzhenzi.md](ch07-bixue/npc_yuzhenzi.md) | `por_npc_yuzhenzi__ch07_elder_huashan_base` | `assets/default/character/male/ch07/por_npc_yuzhenzi__ch07_elder_huashan_base.png` | ready |
| 55 | 张朝唐 | `npc_zhangchaotang` | 男 | 壮年 | A | [npc_zhangchaotang.md](ch07-bixue/npc_zhangchaotang.md) | `por_npc_zhangchaotang__ch07_prime_opening_base` | `assets/default/character/male/ch07/por_npc_zhangchaotang__ch07_prime_opening_base.png` | ready |

### ch08 · 《鹿鼎记》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 九难 | `npc_ajiu` | 女 | 壮年 | S | [npc_ajiu.md](ch08-luding/npc_ajiu.md) | `por_npc_ajiu__ch08_prime_onearm_base` | `assets/default/character/female/ch08/por_npc_ajiu__ch08_prime_onearm_base.png` | new |
| 2 | 阿珂 | `npc_ake` | 女 | 少年 / 青年 | S | [npc_ake.md](ch08-luding/npc_ake.md) | `por_npc_ake__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_ake__ch08_youth_base.png` | redo |
| 3 | 鳌拜 | `npc_aobai` | 男 | 老年 | S | [npc_aobai.md](ch08-luding/npc_aobai.md) | `por_npc_aobai__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_aobai__ch08_elder_base.png` | redo |
| 4 | 澄观 | `npc_chengguan` | 男 | 老年 | B | [npc_chengguan.md](ch08-luding/npc_chengguan.md) | `por_npc_chengguan__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_chengguan__ch08_elder_base.png` | ready |
| 5 | 陈近南 | `npc_chenjinnan` | 男 | 壮年 | S | [npc_chenjinnan.md](ch08-luding/npc_chenjinnan.md) | `por_npc_chenjinnan__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_chenjinnan__ch08_prime_base.png` | redo |
| 6 | 陈圆圆 | `npc_chenyuanyuan` | 女 | 壮年 | A | [npc_chenyuanyuan.md](ch08-luding/npc_chenyuanyuan.md) | `por_npc_chenyuanyuan__ch08_prime_recluse_base` | `assets/default/character/female/ch08/por_npc_chenyuanyuan__ch08_prime_recluse_base.png` | redo |
| 7 | 多隆 | `npc_duolong` | 男 | 壮年 | A | [npc_duolong.md](ch08-luding/npc_duolong.md) | `por_npc_duolong__ch08_prime_guard_base` | `assets/default/character/male/ch08/por_npc_duolong__ch08_prime_guard_base.png` | new |
| 8 | 方怡 | `npc_fangyi` | 女 | 少年 / 青年 | S | [npc_fangyi.md](ch08-luding/npc_fangyi.md) | `por_npc_fangyi__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_fangyi__ch08_youth_base.png` | redo |
| 9 | 风际中 | `npc_fengjizhong` | 男 | 壮年 | A | [npc_fengjizhong.md](ch08-luding/npc_fengjizhong.md) | `por_npc_fengjizhong__ch08_prime_undercover_base` | `assets/default/character/male/ch08/por_npc_fengjizhong__ch08_prime_undercover_base.png` | new |
| 10 | 冯锡范 | `npc_fengxifan` | 男 | 老年 | A | [npc_fengxifan.md](ch08-luding/npc_fengxifan.md) | `por_npc_fengxifan__ch08_elder_zheng_base` | `assets/default/character/male/ch08/por_npc_fengxifan__ch08_elder_zheng_base.png` | ready |
| 11 | 归二娘 | `npc_guierniang` | 女 | 老年 | A | [npc_guierniang.md](ch08-luding/npc_guierniang.md) | `por_npc_guierniang__ch08_elder_base` | `assets/default/character/female/ch08/por_npc_guierniang__ch08_elder_base.png` | ready |
| 12 | 归钟 | `npc_guisong` | 男 | 壮年 | A | [npc_guisong.md](ch08-luding/npc_guisong.md) | `por_npc_guisong__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_guisong__ch08_prime_base.png` | ready |
| 13 | 归辛树 | `npc_guixinshu` | 男 | 老年 | A | [npc_guixinshu.md](ch08-luding/npc_guixinshu.md) | `por_npc_guixinshu__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_guixinshu__ch08_elder_base.png` | ready |
| 14 | 顾炎武 | `npc_guyanwu` | 男 | 老年 | A | [npc_guyanwu.md](ch08-luding/npc_guyanwu.md) | `por_npc_guyanwu__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_guyanwu__ch08_elder_base.png` | ready |
| 15 | 海大富 | `npc_haidafu` | 男 | 老年 | A | [npc_haidafu.md](ch08-luding/npc_haidafu.md) | `por_npc_haidafu__ch08_elder_blind_base` | `assets/default/character/male/ch08/por_npc_haidafu__ch08_elder_blind_base.png` | redo |
| 16 | 何惕守（何铁手） | `npc_hetieshou` | 女 | 壮年 | A | [npc_hetieshou.md](ch08-luding/npc_hetieshou.md) | `por_npc_hetieshou__ch08_prime_mentor_base` | `assets/default/character/female/ch08/por_npc_hetieshou__ch08_prime_mentor_base.png` | new |
| 17 | 洪安通 | `npc_hongantong` | 男 | 老年 | S | [npc_hongantong.md](ch08-luding/npc_hongantong.md) | `por_npc_hongantong__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_hongantong__ch08_elder_base.png` | new |
| 18 | 黄宗羲 | `npc_huangzongxi` | 男 | 老年 | A | [npc_huangzongxi.md](ch08-luding/npc_huangzongxi.md) | `por_npc_huangzongxi__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_huangzongxi__ch08_elder_base.png` | ready |
| 19 | 晦聪 | `npc_huicong` | 男 | 老年 | B | [npc_huicong.md](ch08-luding/npc_huicong.md) | `por_npc_huicong__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_huicong__ch08_elder_base.png` | ready |
| 20 | 胡逸之 | `npc_huyizhi` | 男 | 壮年 | A | [npc_huyizhi.md](ch08-luding/npc_huyizhi.md) | `por_npc_huyizhi__ch08_prime_travel_base` | `assets/default/character/male/ch08/por_npc_huyizhi__ch08_prime_travel_base.png` | new |
| 21 | 建宁公主 | `npc_jianning` | 女 | 少年 / 青年 | S | [npc_jianning.md](ch08-luding/npc_jianning.md) | `por_npc_jianning__ch08_child_palace_base` | `assets/default/character/female/ch08/por_npc_jianning__ch08_child_palace_base.png` | redo |
| 22 | 康熙 | `npc_kangxi` | 男 | 少年 / 青年 | S | [npc_kangxi.md](ch08-luding/npc_kangxi.md) | `por_npc_kangxi__ch08_youth_xiaoxuanzi_base` | `assets/default/character/male/ch08/por_npc_kangxi__ch08_youth_xiaoxuanzi_base.png` | redo |
| 23 | 李力世 | `npc_lilishi` | 男 | 壮年 | B | [npc_lilishi.md](ch08-luding/npc_lilishi.md) | `por_npc_lilishi__ch08_prime_lodge_base` | `assets/default/character/male/ch08/por_npc_lilishi__ch08_prime_lodge_base.png` | new |
| 24 | 柳大洪 | `npc_liudahong` | 男 | 老年 | B | [npc_liudahong.md](ch08-luding/npc_liudahong.md) | `por_npc_liudahong__ch08_elder_mufu_base` | `assets/default/character/male/ch08/por_npc_liudahong__ch08_elder_mufu_base.png` | new |
| 25 | 刘一舟 | `npc_liuyizhou` | 男 | 少年 / 青年 | A | [npc_liuyizhou.md](ch08-luding/npc_liuyizhou.md) | `por_npc_liuyizhou__ch08_youth_mufu_base` | `assets/default/character/male/ch08/por_npc_liuyizhou__ch08_youth_mufu_base.png` | new |
| 26 | 李自成 | `npc_lizicheng` | 男 | 老年 | A | [npc_lizicheng.md](ch08-luding/npc_lizicheng.md) | `por_npc_lizicheng__ch08_elder_monk_base` | `assets/default/character/male/ch08/por_npc_lizicheng__ch08_elder_monk_base.png` | ready |
| 27 | 陆高轩 | `npc_lugaoxuan` | 男 | 壮年 | B | [npc_lugaoxuan.md](ch08-luding/npc_lugaoxuan.md) | `por_npc_lugaoxuan__ch08_prime_shenlong_base` | `assets/default/character/male/ch08/por_npc_lugaoxuan__ch08_prime_shenlong_base.png` | new |
| 28 | 吕留良 | `npc_lvliuliang` | 男 | 壮年 | B | [npc_lvliuliang.md](ch08-luding/npc_lvliuliang.md) | `por_npc_lvliuliang__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_lvliuliang__ch08_prime_base.png` | ready |
| 29 | 毛东珠 | `npc_maodongzhu` | 女 | 壮年 | A | [npc_maodongzhu.md](ch08-luding/npc_maodongzhu.md) | `por_npc_maodongzhu__ch08_prime_dowager_base` | `assets/default/character/female/ch08/por_npc_maodongzhu__ch08_prime_dowager_base.png` | new |
| 30 | 茅十八 | `npc_maoshiba` | 男 | 壮年 | S | [npc_maoshiba.md](ch08-luding/npc_maoshiba.md) | `por_npc_maoshiba__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_maoshiba__ch08_prime_base.png` | ready |
| 31 | 沐剑屏 | `npc_mujianping` | 女 | 少年 / 青年 | S | [npc_mujianping.md](ch08-luding/npc_mujianping.md) | `por_npc_mujianping__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_mujianping__ch08_youth_base.png` | new |
| 32 | 沐剑声 | `npc_mujiansheng` | 男 | 少年 / 青年 | A | [npc_mujiansheng.md](ch08-luding/npc_mujiansheng.md) | `por_npc_mujiansheng__ch08_youth_base` | `assets/default/character/male/ch08/por_npc_mujiansheng__ch08_youth_base.png` | ready |
| 33 | 胖头陀 | `npc_pangtoutuo` | 男 | 壮年 | B | [npc_pangtoutuo.md](ch08-luding/npc_pangtoutuo.md) | `por_npc_pangtoutuo__ch08_prime_drugchanged_base` | `assets/default/character/male/ch08/por_npc_pangtoutuo__ch08_prime_drugchanged_base.png` | new |
| 34 | 桑结 | `npc_sangjie` | 男 | 老年 | A | [npc_sangjie.md](ch08-luding/npc_sangjie.md) | `por_npc_sangjie__ch08_elder_uninjured_base` | `assets/default/character/male/ch08/por_npc_sangjie__ch08_elder_uninjured_base.png` | ready |
| 35 | 施琅 | `npc_shilang` | 男 | 老年 | A | [npc_shilang.md](ch08-luding/npc_shilang.md) | `por_npc_shilang__ch08_elder_navy_base` | `assets/default/character/male/ch08/por_npc_shilang__ch08_elder_navy_base.png` | ready |
| 36 | 瘦头陀 | `npc_shoutoutuo` | 男 | 壮年 | B | [npc_shoutoutuo.md](ch08-luding/npc_shoutoutuo.md) | `por_npc_shoutoutuo__ch08_prime_drugchanged_base` | `assets/default/character/male/ch08/por_npc_shoutoutuo__ch08_prime_drugchanged_base.png` | new |
| 37 | 双儿 | `npc_shuanger` | 女 | 少年 / 青年 | S | [npc_shuanger.md](ch08-luding/npc_shuanger.md) | `por_npc_shuanger__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png` | redo |
| 38 | 索额图 | `npc_suoetu` | 男 | 壮年 | A | [npc_suoetu.md](ch08-luding/npc_suoetu.md) | `por_npc_suoetu__ch08_prime_court_base` | `assets/default/character/male/ch08/por_npc_suoetu__ch08_prime_court_base.png` | new |
| 39 | 索菲娅 | `npc_suofeiya` | 女 | 少年 / 青年 | A | [npc_suofeiya.md](ch08-luding/npc_suofeiya.md) | `por_npc_suofeiya__ch08_youth_regent_base` | `assets/default/character/female/ch08/por_npc_suofeiya__ch08_youth_regent_base.png` | ready |
| 40 | 苏荃 | `npc_suquan` | 女 | 少年 / 青年 | S | [npc_suquan.md](ch08-luding/npc_suquan.md) | `por_npc_suquan__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_suquan__ch08_youth_base.png` | redo |
| 41 | 陶红英 | `npc_taohongying` | 女 | 老年 | A | [npc_taohongying.md](ch08-luding/npc_taohongying.md) | `por_npc_taohongying__ch08_elder_palace_base` | `assets/default/character/female/ch08/por_npc_taohongying__ch08_elder_palace_base.png` | new |
| 42 | 韦春花 | `npc_weichunhua08` | 女 | 壮年 | A | [npc_weichunhua08.md](ch08-luding/npc_weichunhua08.md) | `por_npc_weichunhua08__ch08_prime_city_base` | `assets/default/character/female/ch08/por_npc_weichunhua08__ch08_prime_city_base.png` | new |
| 43 | 韦小宝 | `npc_weixiaobao` | 男 | 少年 / 青年 | S | [npc_weixiaobao.md](ch08-luding/npc_weixiaobao.md) | `por_npc_weixiaobao__ch08_youth_bishou_base` | `assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png` | candidate |
| 44 | 韦小宝·宫廷与青木堂双重身份 | `npc_weixiaobao` | 男 | 少年 / 青年 | S | [npc_weixiaobao__scene_qingmu_incense.md](ch08-luding/npc_weixiaobao__scene_qingmu_incense.md) | `por_npc_weixiaobao__ch08_youth_scene_qingmu_incense` | `assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_scene_qingmu_incense.png` | candidate |
| 45 | 韦小宝·割舍名利退隐 | `npc_weixiaobao` | 男 | 壮年 | S | [npc_weixiaobao__scene_retirement.md](ch08-luding/npc_weixiaobao__scene_retirement.md) | `por_npc_weixiaobao__ch08_prime_scene_retirement` | `assets/default/character/male/ch08/por_npc_weixiaobao__ch08_prime_scene_retirement.png` | candidate |
| 46 | 韦小宝·扬州市井 | `npc_weixiaobao` | 男 | 少年 / 青年 | S | [npc_weixiaobao__scene_yangzhou_gambler.md](ch08-luding/npc_weixiaobao__scene_yangzhou_gambler.md) | `por_npc_weixiaobao__ch08_youth_scene_yangzhou_gambler` | `assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_scene_yangzhou_gambler.png` | candidate |
| 47 | 吴立身 | `npc_wulishen` | 男 | 壮年 | B | [npc_wulishen.md](ch08-luding/npc_wulishen.md) | `por_npc_wulishen__ch08_prime_mufu_base` | `assets/default/character/male/ch08/por_npc_wulishen__ch08_prime_mufu_base.png` | new |
| 48 | 吴六奇 | `npc_wuliuqi` | 男 | 壮年 | S | [npc_wuliuqi.md](ch08-luding/npc_wuliuqi.md) | `por_npc_wuliuqi__ch08_prime_general_base` | `assets/default/character/male/ch08/por_npc_wuliuqi__ch08_prime_general_base.png` | ready |
| 49 | 吴三桂 | `npc_wusangui` | 男 | 老年 | A | [npc_wusangui.md](ch08-luding/npc_wusangui.md) | `por_npc_wusangui__ch08_elder_pingxi_base` | `assets/default/character/male/ch08/por_npc_wusangui__ch08_elder_pingxi_base.png` | ready |
| 50 | 吴应熊 | `npc_wuyingxiong` | 男 | 少年 / 青年 | A | [npc_wuyingxiong.md](ch08-luding/npc_wuyingxiong.md) | `por_npc_wuyingxiong__ch08_youth_heir_base` | `assets/default/character/male/ch08/por_npc_wuyingxiong__ch08_youth_heir_base.png` | new |
| 51 | 徐天川 | `npc_xutianchuan` | 男 | 老年 | A | [npc_xutianchuan.md](ch08-luding/npc_xutianchuan.md) | `por_npc_xutianchuan__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_xutianchuan__ch08_elder_base.png` | ready |
| 52 | 曾柔 | `npc_zengrou` | 女 | 少年 / 青年 | S | [npc_zengrou.md](ch08-luding/npc_zengrou.md) | `por_npc_zengrou__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_zengrou__ch08_youth_base.png` | redo |
| 53 | 郑克塽 | `npc_zhengkeshuang` | 男 | 少年 / 青年 | A | [npc_zhengkeshuang.md](ch08-luding/npc_zhengkeshuang.md) | `por_npc_zhengkeshuang__ch08_youth_zheng_base` | `assets/default/character/male/ch08/por_npc_zhengkeshuang__ch08_youth_zheng_base.png` | ready |

### ch09 · 《连城诀》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 宝象 | `npc_baoxiang` | 男 | 壮年 | S | [npc_baoxiang.md](ch09-liancheng/npc_baoxiang.md) | `por_npc_baoxiang__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_baoxiang__ch09_prime_pursuit_base.png` | ready |
| 2 | 卜垣 | `npc_buyuan` | 男 | 壮年 | B | [npc_buyuan.md](ch09-liancheng/npc_buyuan.md) | `por_npc_buyuan__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_buyuan__ch09_prime_wanfu_base.png` | redo |
| 3 | 丁典 | `npc_dingdian` | 男 | 壮年 | S | [npc_dingdian.md](ch09-liancheng/npc_dingdian.md) | `por_npc_dingdian__ch09_prime_prison_base` | `assets/default/character/male/ch09/por_npc_dingdian__ch09_prime_prison_base.png` | ready |
| 4 | 狄云 | `npc_diyun` | 男 | 少年 / 青年 | S | [npc_diyun.md](ch09-liancheng/npc_diyun.md) | `por_npc_diyun__ch09_youth_disguise_base` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_disguise_base.png` | candidate |
| 5 | 狄云（湘西乡下常装） | `npc_diyun` | 男 | 少年 / 青年 | S | [npc_diyun__rural.md](ch09-liancheng/npc_diyun__rural.md) | `por_npc_diyun__ch09_youth_rural_base` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_rural_base.png` | candidate |
| 6 | 狄云·荆州铁狱 | `npc_diyun` | 男 | 少年 / 青年 | S | [npc_diyun__scene_jingzhou_prison.md](ch09-liancheng/npc_diyun__scene_jingzhou_prison.md) | `por_npc_diyun__ch09_youth_scene_jingzhou_prison` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_scene_jingzhou_prison.png` | candidate |
| 7 | 狄云·麻溪铺乡间 | `npc_diyun` | 男 | 少年 / 青年 | S | [npc_diyun__scene_maxipu_rural.md](ch09-liancheng/npc_diyun__scene_maxipu_rural.md) | `por_npc_diyun__ch09_youth_scene_maxipu_rural` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_scene_maxipu_rural.png` | candidate |
| 8 | 狄云·雪谷羽衣 | `npc_diyun` | 男 | 少年 / 青年 | S | [npc_diyun__scene_snowvalley_feathers.md](ch09-liancheng/npc_diyun__scene_snowvalley_feathers.md) | `por_npc_diyun__ch09_youth_scene_snowvalley_feathers` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_scene_snowvalley_feathers.png` | candidate |
| 9 | 冯坦 | `npc_fengtan` | 男 | 壮年 | B | [npc_fengtan.md](ch09-liancheng/npc_fengtan.md) | `por_npc_fengtan__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_fengtan__ch09_prime_wanfu_base.png` | redo |
| 10 | 花铁干 | `npc_huantiegan` | 男 | 壮年 | A | [npc_huantiegan.md](ch09-liancheng/npc_huantiegan.md) | `por_npc_huantiegan__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_huantiegan__ch09_prime_pursuit_base.png` | redo |
| 11 | 空心菜 | `npc_kongxincai` | 女 | 童年 | A | [npc_kongxincai.md](ch09-liancheng/npc_kongxincai.md) | `por_npc_kongxincai__ch09_child_protected_base` | `assets/default/character/female/ch09/por_npc_kongxincai__ch09_child_protected_base.png` | ready |
| 12 | 凌霜华 | `npc_lingshuanghua` | 女 | 少年 / 青年 | S | [npc_lingshuanghua.md](ch09-liancheng/npc_lingshuanghua.md) | `por_npc_lingshuanghua__ch09_youth_scarred_base` | `assets/default/character/female/ch09/por_npc_lingshuanghua__ch09_youth_scarred_base.png` | redo |
| 13 | 凌退思 | `npc_lingtusi` | 男 | 壮年 | S | [npc_lingtusi.md](ch09-liancheng/npc_lingtusi.md) | `por_npc_lingtusi__ch09_prime_magistrate_base` | `assets/default/character/male/ch09/por_npc_lingtusi__ch09_prime_magistrate_base.png` | ready |
| 14 | 刘乘风 | `npc_liurenfeng` | 男 | 壮年 | S | [npc_liurenfeng.md](ch09-liancheng/npc_liurenfeng.md) | `por_npc_liurenfeng__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_liurenfeng__ch09_prime_pursuit_base.png` | ready |
| 15 | 鲁坤 | `npc_lukun` | 男 | 壮年 | B | [npc_lukun.md](ch09-liancheng/npc_lukun.md) | `por_npc_lukun__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_lukun__ch09_prime_wanfu_base.png` | redo |
| 16 | 陆天抒 | `npc_lutianshu` | 男 | 壮年 | S | [npc_lutianshu.md](ch09-liancheng/npc_lutianshu.md) | `por_npc_lutianshu__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_lutianshu__ch09_prime_pursuit_base.png` | ready |
| 17 | 梅念笙 | `npc_meiniansheng` | 男 | 老年 | A | [npc_meiniansheng.md](ch09-liancheng/npc_meiniansheng.md) | `por_npc_meiniansheng__ch09_elder_memory_base` | `assets/default/character/male/ch09/por_npc_meiniansheng__ch09_elder_memory_base.png` | new |
| 18 | 戚长发 | `npc_qichangfa` | 男 | 壮年 | S | [npc_qichangfa.md](ch09-liancheng/npc_qichangfa.md) | `por_npc_qichangfa__ch09_prime_rural_base` | `assets/default/character/male/ch09/por_npc_qichangfa__ch09_prime_rural_base.png` | ready |
| 19 | 戚芳 | `npc_qifang` | 女 | 少年 / 青年 | S | [npc_qifang.md](ch09-liancheng/npc_qifang.md) | `por_npc_qifang__ch09_youth_mother_base` | `assets/default/character/female/ch09/por_npc_qifang__ch09_youth_mother_base.png` | candidate |
| 20 | 戚芳·麻溪学剑 | `npc_qifang` | 女 | 少年 / 青年 | S | [npc_qifang__scene_maxipu_wooden_sword.md](ch09-liancheng/npc_qifang__scene_maxipu_wooden_sword.md) | `por_npc_qifang__ch09_youth_scene_maxipu_wooden_sword` | `assets/default/character/female/ch09/por_npc_qifang__ch09_youth_scene_maxipu_wooden_sword.png` | candidate |
| 21 | 戚芳·诗页双蝶 | `npc_qifang` | 女 | 少年 / 青年 | S | [npc_qifang__scene_wanfu_poetry_butterfly.md](ch09-liancheng/npc_qifang__scene_wanfu_poetry_butterfly.md) | `por_npc_qifang__ch09_youth_scene_wanfu_poetry_butterfly` | `assets/default/character/female/ch09/por_npc_qifang__ch09_youth_scene_wanfu_poetry_butterfly.png` | candidate |
| 22 | 善勇 | `npc_shanyong` | 男 | 壮年 | B | [npc_shanyong.md](ch09-liancheng/npc_shanyong.md) | `por_npc_shanyong__ch09_prime_prison_base` | `assets/default/character/male/ch09/por_npc_shanyong__ch09_prime_prison_base.png` | new |
| 23 | 沈城 | `npc_shencheng` | 男 | 壮年 | B | [npc_shencheng.md](ch09-liancheng/npc_shencheng.md) | `por_npc_shencheng__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_shencheng__ch09_prime_wanfu_base.png` | redo |
| 24 | 胜谛 | `npc_shengdi` | 男 | 壮年 | B | [npc_shengdi.md](ch09-liancheng/npc_shengdi.md) | `por_npc_shengdi__ch09_prime_prison_base` | `assets/default/character/male/ch09/por_npc_shengdi__ch09_prime_prison_base.png` | new |
| 25 | 水岱 | `npc_shuidao` | 男 | 壮年 | A | [npc_shuidao.md](ch09-liancheng/npc_shuidao.md) | `por_npc_shuidao__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_shuidao__ch09_prime_pursuit_base.png` | redo |
| 26 | 水笙 | `npc_shuisheng` | 女 | 少年 / 青年 | S | [npc_shuisheng.md](ch09-liancheng/npc_shuisheng.md) | `por_npc_shuisheng__ch09_youth_travel_base` | `assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_travel_base.png` | candidate |
| 27 | 水笙·雪谷相候 | `npc_shuisheng` | 女 | 少年 / 青年 | S | [npc_shuisheng__scene_xianghou.md](ch09-liancheng/npc_shuisheng__scene_xianghou.md) | `por_npc_shuisheng__ch09_youth_scene_xianghou` | `assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_scene_xianghou.png` | candidate |
| 28 | 水笙·雪谷缀羽 | `npc_shuisheng` | 女 | 少年 / 青年 | S | [npc_shuisheng__scene_yuyi.md](ch09-liancheng/npc_shuisheng__scene_yuyi.md) | `por_npc_shuisheng__ch09_youth_scene_yuyi` | `assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_scene_yuyi.png` | candidate |
| 29 | 孙均 | `npc_sunjun` | 男 | 壮年 | B | [npc_sunjun.md](ch09-liancheng/npc_sunjun.md) | `por_npc_sunjun__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_sunjun__ch09_prime_wanfu_base.png` | redo |
| 30 | 桃红 | `npc_taohong` | 女 | 少年 / 青年 | A | [npc_taohong.md](ch09-liancheng/npc_taohong.md) | `por_npc_taohong__ch09_youth_wanfu_base` | `assets/default/character/female/ch09/por_npc_taohong__ch09_youth_wanfu_base.png` | new |
| 31 | 万圭 | `npc_wangui` | 男 | 少年 / 青年 | S | [npc_wangui.md](ch09-liancheng/npc_wangui.md) | `por_npc_wangui__ch09_youth_wanfu_base` | `assets/default/character/male/ch09/por_npc_wangui__ch09_youth_wanfu_base.png` | new |
| 32 | 汪啸风 | `npc_wangxiaofeng` | 男 | 少年 / 青年 | A | [npc_wangxiaofeng.md](ch09-liancheng/npc_wangxiaofeng.md) | `por_npc_wangxiaofeng__ch09_youth_travel_base` | `assets/default/character/male/ch09/por_npc_wangxiaofeng__ch09_youth_travel_base.png` | redo |
| 33 | 万震山 | `npc_wanzhenshan` | 男 | 壮年 | S | [npc_wanzhenshan.md](ch09-liancheng/npc_wanzhenshan.md) | `por_npc_wanzhenshan__ch09_prime_host_base` | `assets/default/character/male/ch09/por_npc_wanzhenshan__ch09_prime_host_base.png` | redo |
| 34 | 吴坎 | `npc_wukan` | 男 | 壮年 | A | [npc_wukan.md](ch09-liancheng/npc_wukan.md) | `por_npc_wukan__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_wukan__ch09_prime_wanfu_base.png` | new |
| 35 | 血刀老祖 | `npc_xuedaolaozu` | 男 | 老年 | S | [npc_xuedaolaozu.md](ch09-liancheng/npc_xuedaolaozu.md) | `por_npc_xuedaolaozu__ch09_elder_snow_base` | `assets/default/character/male/ch09/por_npc_xuedaolaozu__ch09_elder_snow_base.png` | redo |
| 36 | 言达平 | `npc_yandaping` | 男 | 壮年 | S | [npc_yandaping.md](ch09-liancheng/npc_yandaping.md) | `por_npc_yandaping__ch09_prime_beggar_base` | `assets/default/character/male/ch09/por_npc_yandaping__ch09_prime_beggar_base.png` | new |
| 37 | 周圻 | `npc_zhouqi09` | 男 | 壮年 | B | [npc_zhouqi09.md](ch09-liancheng/npc_zhouqi09.md) | `por_npc_zhouqi09__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_zhouqi09__ch09_prime_wanfu_base.png` | new |

### ch10 · 《白马啸西风》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿曼 | `npc_aman` | 女 | 少年 / 青年 | S | [npc_aman.md](ch10-baima/npc_aman.md) | `por_npc_aman__ch10_base` | `assets/default/character/female/ch10/por_npc_aman__ch10_base.png` | redo |
| 2 | 车尔库 | `npc_cheerku` | 男 | 老年 | A | [npc_cheerku.md](ch10-baima/npc_cheerku.md) | `por_npc_cheerku__ch10_base` | `assets/default/character/male/ch10/por_npc_cheerku__ch10_base.png` | redo |
| 3 | 陈达海 | `npc_chendahai` | 男 | 壮年 | S | [npc_chendahai.md](ch10-baima/npc_chendahai.md) | `por_npc_chendahai__ch10_prime_snownight_base` | `assets/default/character/male/ch10/por_npc_chendahai__ch10_prime_snownight_base.png` | redo |
| 4 | 丁同 | `npc_dingtong` | 男 | 壮年 | B | [npc_dingtong.md](ch10-baima/npc_dingtong.md) | `por_npc_dingtong__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_dingtong__ch10_prime_prologue_base.png` | redo |
| 5 | 段霜 | `npc_duanshuang10` | 男 | 少年 / 青年 | B | [npc_duanshuang10.md](ch10-baima/npc_duanshuang10.md) | `por_npc_duanshuang10__ch10_base` | `assets/default/character/male/ch10/por_npc_duanshuang10__ch10_base.png` | redo |
| 6 | 哈卜拉姆 | `npc_habulamu` | 男 | 老年 | A | [npc_habulamu.md](ch10-baima/npc_habulamu.md) | `por_npc_habulamu__ch10_base` | `assets/default/character/male/ch10/por_npc_habulamu__ch10_base.png` | redo |
| 7 | 韩禾 | `npc_hanhe10` | 男 | 少年 / 青年 | B | [npc_hanhe10.md](ch10-baima/npc_hanhe10.md) | `por_npc_hanhe10__ch10_base` | `assets/default/character/male/ch10/por_npc_hanhe10__ch10_base.png` | redo |
| 8 | 霍元龙 | `npc_huoyuanlong` | 男 | 壮年 | S | [npc_huoyuanlong.md](ch10-baima/npc_huoyuanlong.md) | `por_npc_huoyuanlong__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_huoyuanlong__ch10_prime_prologue_base.png` | redo |
| 9 | 白马李三 | `npc_lisan` | 男 | 壮年 | A | [npc_lisan.md](ch10-baima/npc_lisan.md) | `por_npc_lisan__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_lisan__ch10_prime_prologue_base.png` | redo |
| 10 | 李文秀 | `npc_liwenxiu` | 女 | 少年 / 青年 | S | [npc_liwenxiu.md](ch10-baima/npc_liwenxiu.md) | `por_npc_liwenxiu__ch10_youth_astuo_base` | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_astuo_base.png` | candidate |
| 11 | 李文秀·风雪夜的阿斯托 | `npc_liwenxiu` | 女 | 少年 / 青年 | S | [npc_liwenxiu__scene_astuo_snow_defense.md](ch10-baima/npc_liwenxiu__scene_astuo_snow_defense.md) | `por_npc_liwenxiu__ch10_youth_scene_astuo_snow_defense` | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_scene_astuo_snow_defense.png` | candidate |
| 12 | 李文秀·白马向东 | `npc_liwenxiu` | 女 | 少年 / 青年 | S | [npc_liwenxiu__scene_white_horse_east_departure.md](ch10-baima/npc_liwenxiu__scene_white_horse_east_departure.md) | `por_npc_liwenxiu__ch10_youth_scene_white_horse_east_departure` | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_scene_white_horse_east_departure.png` | candidate |
| 13 | 马家骏 | `npc_majiajun` | 男 | 老年 | S | [npc_majiajun.md](ch10-baima/npc_majiajun.md) | `por_npc_majiajun__ch10_elder_disguised_base` | `assets/default/character/male/ch10/por_npc_majiajun__ch10_elder_disguised_base.png` | redo |
| 14 | 姓全的强人 | `npc_quanqiangdao` | 男 | 壮年 | B | [npc_quanqiangdao.md](ch10-baima/npc_quanqiangdao.md) | `por_npc_quanqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_quanqiangdao__ch10_base.png` | redo |
| 15 | 桑斯儿 | `npc_sangsi` | 男 | 少年 / 青年 | A | [npc_sangsi.md](ch10-baima/npc_sangsi.md) | `por_npc_sangsi__ch10_base` | `assets/default/character/male/ch10/por_npc_sangsi__ch10_base.png` | redo |
| 16 | 上官虹 | `npc_shangguanhong` | 女 | 少年 / 青年 | A | [npc_shangguanhong.md](ch10-baima/npc_shangguanhong.md) | `por_npc_shangguanhong__ch10_youth_prologue_base` | `assets/default/character/female/ch10/por_npc_shangguanhong__ch10_youth_prologue_base.png` | redo |
| 17 | 沈青禾 | `npc_shenqinghe10` | 男 | 壮年 | A | [npc_shenqinghe10.md](ch10-baima/npc_shenqinghe10.md) | `por_npc_shenqinghe10__ch10_base` | `assets/default/character/male/ch10/por_npc_shenqinghe10__ch10_base.png` | redo |
| 18 | 史仲俊 | `npc_shizhongjun` | 男 | 壮年 | A | [npc_shizhongjun.md](ch10-baima/npc_shizhongjun.md) | `por_npc_shizhongjun__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_shizhongjun__ch10_prime_prologue_base.png` | redo |
| 19 | 姓宋的强人 | `npc_songqiangdao` | 男 | 壮年 | B | [npc_songqiangdao.md](ch10-baima/npc_songqiangdao.md) | `por_npc_songqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_songqiangdao__ch10_base.png` | redo |
| 20 | 苏鲁克 | `npc_suluke` | 男 | 老年 | A | [npc_suluke.md](ch10-baima/npc_suluke.md) | `por_npc_suluke__ch10_base` | `assets/default/character/male/ch10/por_npc_suluke__ch10_base.png` | redo |
| 21 | 苏普 | `npc_supu` | 男 | 少年 / 青年 | S | [npc_supu.md](ch10-baima/npc_supu.md) | `por_npc_supu__ch10_youth_base` | `assets/default/character/male/ch10/por_npc_supu__ch10_youth_base.png` | redo |
| 22 | 瓦耳拉齐 | `npc_walazi` | 男 | 老年 | S | [npc_walazi.md](ch10-baima/npc_walazi.md) | `por_npc_walazi__ch10_elder_unmasked_base` | `assets/default/character/male/ch10/por_npc_walazi__ch10_elder_unmasked_base.png` | redo |
| 23 | 雅丽仙 | `npc_yalixian` | 女 | 少年 / 青年 | A | [npc_yalixian.md](ch10-baima/npc_yalixian.md) | `por_npc_yalixian__ch10_youth_memory_base` | `assets/default/character/female/ch10/por_npc_yalixian__ch10_youth_memory_base.png` | new |
| 24 | 姓云的强人 | `npc_yunqiangdao` | 男 | 壮年 | B | [npc_yunqiangdao.md](ch10-baima/npc_yunqiangdao.md) | `por_npc_yunqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_yunqiangdao__ch10_base.png` | redo |

### ch11 · 《鸳鸯刀》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 常长风 | `npc_changchangfeng` | 男 | 壮年 | A | [npc_changchangfeng.md](ch11-yuanyang/npc_changchangfeng.md) | `por_npc_changchangfeng__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_changchangfeng__ch11_prime_road_base.png` | ready |
| 2 | 程墨 | `npc_chengmo11` | 男 | 少年 / 青年 | B | [npc_chengmo11.md](ch11-yuanyang/npc_chengmo11.md) | `por_npc_chengmo11__ch11_base` | `assets/default/character/male/ch11/por_npc_chengmo11__ch11_base.png` | ready |
| 3 | 盖一鸣 | `npc_gaiyiming` | 男 | 壮年 | A | [npc_gaiyiming.md](ch11-yuanyang/npc_gaiyiming.md) | `por_npc_gaiyiming__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_gaiyiming__ch11_prime_road_base.png` | ready |
| 4 | 何谦 | `npc_heqian11` | 男 | 少年 / 青年 | B | [npc_heqian11.md](ch11-yuanyang/npc_heqian11.md) | `por_npc_heqian11__ch11_base` | `assets/default/character/male/ch11/por_npc_heqian11__ch11_base.png` | ready |
| 5 | 花剑影 | `npc_huajianying` | 男 | 壮年 | A | [npc_huajianying.md](ch11-yuanyang/npc_huajianying.md) | `por_npc_huajianying__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_huajianying__ch11_prime_road_base.png` | ready |
| 6 | 林玉龙 | `npc_linyulong` | 男 | 少年 / 青年 | A | [npc_linyulong.md](ch11-yuanyang/npc_linyulong.md) | `por_npc_linyulong__ch11_youth_road_base` | `assets/default/character/male/ch11/por_npc_linyulong__ch11_youth_road_base.png` | ready |
| 7 | 刘於义 | `npc_liuyuyi` | 男 | 老年 | A | [npc_liuyuyi.md](ch11-yuanyang/npc_liuyuyi.md) | `por_npc_liuyuyi__ch11_base` | `assets/default/character/male/ch11/por_npc_liuyuyi__ch11_base.png` | ready |
| 8 | 鲁忱 | `npc_luchen11` | 男 | 壮年 | B | [npc_luchen11.md](ch11-yuanyang/npc_luchen11.md) | `por_npc_luchen11__ch11_base` | `assets/default/character/male/ch11/por_npc_luchen11__ch11_base.png` | ready |
| 9 | 罗宁 | `npc_luoning11` | 男 | 壮年 | A | [npc_luoning11.md](ch11-yuanyang/npc_luoning11.md) | `por_npc_luoning11__ch11_base` | `assets/default/character/male/ch11/por_npc_luoning11__ch11_base.png` | ready |
| 10 | 任飞燕 | `npc_renfeiyan` | 女 | 少年 / 青年 | A | [npc_renfeiyan.md](ch11-yuanyang/npc_renfeiyan.md) | `por_npc_renfeiyan__ch11_youth_road_base` | `assets/default/character/female/ch11/por_npc_renfeiyan__ch11_youth_road_base.png` | ready |
| 11 | 石望 | `npc_shiwang11` | 男 | 壮年 | A | [npc_shiwang11.md](ch11-yuanyang/npc_shiwang11.md) | `por_npc_shiwang11__ch11_base` | `assets/default/character/male/ch11/por_npc_shiwang11__ch11_base.png` | ready |
| 12 | 萧半和 | `npc_xiaobanhe` | 男 | 老年 | S | [npc_xiaobanhe.md](ch11-yuanyang/npc_xiaobanhe.md) | `por_npc_xiaobanhe__ch11_elder_birthday_base` | `assets/default/character/male/ch11/por_npc_xiaobanhe__ch11_elder_birthday_base.png` | ready |
| 13 | 逍遥子 | `npc_xiaoyaozi11` | 男 | 壮年 | A | [npc_xiaoyaozi11.md](ch11-yuanyang/npc_xiaoyaozi11.md) | `por_npc_xiaoyaozi11__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_xiaoyaozi11__ch11_prime_road_base.png` | ready |
| 14 | 萧中慧 | `npc_xiaozhonghui` | 女 | 少年 / 青年 | S | [npc_xiaozhonghui.md](ch11-yuanyang/npc_xiaozhonghui.md) | `por_npc_xiaozhonghui__ch11_youth_departure_base` | `assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_departure_base.png` | candidate |
| 15 | 萧中慧·松林断索 | `npc_xiaozhonghui` | 女 | 少年 / 青年 | S | [npc_xiaozhonghui__scene_pine_cut_rope.md](ch11-yuanyang/npc_xiaozhonghui__scene_pine_cut_rope.md) | `por_npc_xiaozhonghui__ch11_youth_scene_pine_cut_rope` | `assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_scene_pine_cut_rope.png` | candidate |
| 16 | 萧中慧·紫竹回护 | `npc_xiaozhonghui` | 女 | 少年 / 青年 | S | [npc_xiaozhonghui__scene_zizhu_short_blade_guard.md](ch11-yuanyang/npc_xiaozhonghui__scene_zizhu_short_blade_guard.md) | `por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard` | `assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard.png` | candidate |
| 17 | 杨伯冲 | `npc_yangbochong` | 男 | 壮年 | A | [npc_yangbochong.md](ch11-yuanyang/npc_yangbochong.md) | `por_npc_yangbochong__ch11_prime_memory_base` | `assets/default/character/male/ch11/por_npc_yangbochong__ch11_prime_memory_base.png` | new |
| 18 | 杨夫人 | `npc_yangfuren` | 女 | 壮年 | A | [npc_yangfuren.md](ch11-yuanyang/npc_yangfuren.md) | `por_npc_yangfuren__ch11_base` | `assets/default/character/female/ch11/por_npc_yangfuren__ch11_base.png` | ready |
| 19 | 严和 | `npc_yanhe11` | 男 | 壮年 | B | [npc_yanhe11.md](ch11-yuanyang/npc_yanhe11.md) | `por_npc_yanhe11__ch11_base` | `assets/default/character/male/ch11/por_npc_yanhe11__ch11_base.png` | ready |
| 20 | 袁夫人 | `npc_yuanfuren` | 女 | 壮年 | A | [npc_yuanfuren.md](ch11-yuanyang/npc_yuanfuren.md) | `por_npc_yuanfuren__ch11_prime_reunion_base` | `assets/default/character/female/ch11/por_npc_yuanfuren__ch11_prime_reunion_base.png` | ready |
| 21 | 袁冠南 | `npc_yuanguannan` | 男 | 少年 / 青年 | S | [npc_yuanguannan.md](ch11-yuanyang/npc_yuanguannan.md) | `por_npc_yuanguannan__ch11_youth_scholar_base` | `assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scholar_base.png` | candidate |
| 22 | 袁冠南·笔墨退强敌 | `npc_yuanguannan` | 男 | 少年 / 青年 | S | [npc_yuanguannan__scene_ink_bluff_zhuo.md](ch11-yuanyang/npc_yuanguannan__scene_ink_bluff_zhuo.md) | `por_npc_yuanguannan__ch11_youth_scene_ink_bluff_zhuo` | `assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scene_ink_bluff_zhuo.png` | candidate |
| 23 | 袁冠南·紫竹初合刀 | `npc_yuanguannan` | 男 | 少年 / 青年 | S | [npc_yuanguannan__scene_zizhu_first_twelve.md](ch11-yuanyang/npc_yuanguannan__scene_zizhu_first_twelve.md) | `por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve` | `assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve.png` | candidate |
| 24 | 周威信 | `npc_zhouweixin` | 男 | 壮年 | A | [npc_zhouweixin.md](ch11-yuanyang/npc_zhouweixin.md) | `por_npc_zhouweixin__ch11_base` | `assets/default/character/male/ch11/por_npc_zhouweixin__ch11_base.png` | ready |
| 25 | 卓天雄 | `npc_zhuotianxiong` | 男 | 老年 | S | [npc_zhuotianxiong.md](ch11-yuanyang/npc_zhuotianxiong.md) | `por_npc_zhuotianxiong__ch11_elder_feignedblind_base` | `assets/default/character/male/ch11/por_npc_zhuotianxiong__ch11_elder_feignedblind_base.png` | redo |

### ch12 · 《书剑恩仇录》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿凡提 | `npc_afanti` | 男 | 老年 | A | [npc_afanti.md](ch12-shujian/npc_afanti.md) | `por_npc_afanti__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_afanti__ch12_elder_base.png` | new |
| 2 | 常伯志 | `npc_changbozhi` | 男 | 壮年 | A | [npc_changbozhi.md](ch12-shujian/npc_changbozhi.md) | `por_npc_changbozhi__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_changbozhi__ch12_prime_base.png` | new |
| 3 | 常赫志 | `npc_changhezhi` | 男 | 壮年 | A | [npc_changhezhi.md](ch12-shujian/npc_changhezhi.md) | `por_npc_changhezhi__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_changhezhi__ch12_prime_base.png` | new |
| 4 | 陈家洛 | `npc_chenjialuo` | 男 | 少年 / 青年 | S | [npc_chenjialuo.md](ch12-shujian/npc_chenjialuo.md) | `por_npc_chenjialuo__ch12_youth_late_base` | `assets/default/character/male/ch12/por_npc_chenjialuo__ch12_youth_late_base.png` | candidate |
| 5 | 陈家洛·安西承任 | `npc_chenjialuo` | 男 | 少年 / 青年 | S | [npc_chenjialuo__scene_anxi_new_helmsman.md](ch12-shujian/npc_chenjialuo__scene_anxi_new_helmsman.md) | `por_npc_chenjialuo__ch12_youth_scene_anxi_new_helmsman` | `assets/default/character/male/ch12/por_npc_chenjialuo__ch12_youth_scene_anxi_new_helmsman.png` | candidate |
| 6 | 陈家洛·香冢之后 | `npc_chenjialuo` | 男 | 少年 / 青年 | S | [npc_chenjialuo__scene_fragrant_tomb_westward.md](ch12-shujian/npc_chenjialuo__scene_fragrant_tomb_westward.md) | `por_npc_chenjialuo__ch12_youth_scene_fragrant_tomb_westward` | `assets/default/character/male/ch12/por_npc_chenjialuo__ch12_youth_scene_fragrant_tomb_westward.png` | candidate |
| 7 | 陈世倌 | `npc_chenshiguan` | 男 | 老年 | A | [npc_chenshiguan.md](ch12-shujian/npc_chenshiguan.md) | `por_npc_chenshiguan__ch12_elder_memory_base` | `assets/default/character/male/ch12/por_npc_chenshiguan__ch12_elder_memory_base.png` | new |
| 8 | 陈正德 | `npc_chenzhengde` | 男 | 老年 | A | [npc_chenzhengde.md](ch12-shujian/npc_chenzhengde.md) | `por_npc_chenzhengde__ch12_elder_alive_base` | `assets/default/character/male/ch12/por_npc_chenzhengde__ch12_elder_alive_base.png` | new |
| 9 | 关明梅 | `npc_guanmingmei` | 女 | 老年 | A | [npc_guanmingmei.md](ch12-shujian/npc_guanmingmei.md) | `por_npc_guanmingmei__ch12_elder_alive_base` | `assets/default/character/female/ch12/por_npc_guanmingmei__ch12_elder_alive_base.png` | new |
| 10 | 霍阿伊 | `npc_huoayi` | 男 | 壮年 | A | [npc_huoayi.md](ch12-shujian/npc_huoayi.md) | `por_npc_huoayi__ch12_prime_alive_base` | `assets/default/character/male/ch12/por_npc_huoayi__ch12_prime_alive_base.png` | new |
| 11 | 霍青桐 | `npc_huoqingtong` | 女 | 少年 / 青年 | S | [npc_huoqingtong.md](ch12-shujian/npc_huoqingtong.md) | `por_npc_huoqingtong__ch12_youth_early_base` | `assets/default/character/female/ch12/por_npc_huoqingtong__ch12_youth_early_base.png` | candidate |
| 12 | 霍青桐·黑水军略 | `npc_huoqingtong` | 女 | 少年 / 青年 | S | [npc_huoqingtong__scene_blackwater_command.md](ch12-shujian/npc_huoqingtong__scene_blackwater_command.md) | `por_npc_huoqingtong__ch12_youth_scene_blackwater_command` | `assets/default/character/female/ch12/por_npc_huoqingtong__ch12_youth_scene_blackwater_command.png` | candidate |
| 13 | 霍青桐·翠羽追经 | `npc_huoqingtong` | 女 | 少年 / 青年 | S | [npc_huoqingtong__scene_yellow_robe_quran_pursuit.md](ch12-shujian/npc_huoqingtong__scene_yellow_robe_quran_pursuit.md) | `por_npc_huoqingtong__ch12_youth_scene_yellow_robe_quran_pursuit` | `assets/default/character/female/ch12/por_npc_huoqingtong__ch12_youth_scene_yellow_robe_quran_pursuit.png` | candidate |
| 14 | 蒋四根 | `npc_jiangsigen` | 男 | 壮年 | A | [npc_jiangsigen.md](ch12-shujian/npc_jiangsigen.md) | `por_npc_jiangsigen__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_jiangsigen__ch12_prime_base.png` | new |
| 15 | 喀丝丽 | `npc_kasili` | 女 | 少年 / 青年 | S | [npc_kasili.md](ch12-shujian/npc_kasili.md) | `por_npc_kasili__ch12_youth_prepalace_base` | `assets/default/character/female/ch12/por_npc_kasili__ch12_youth_prepalace_base.png` | candidate |
| 16 | 喀丝丽·绿洲初见 | `npc_kasili` | 女 | 少年 / 青年 | S | [npc_kasili__scene_oasis_first_meeting.md](ch12-shujian/npc_kasili__scene_oasis_first_meeting.md) | `por_npc_kasili__ch12_youth_scene_oasis_first_meeting` | `assets/default/character/female/ch12/por_npc_kasili__ch12_youth_scene_oasis_first_meeting.png` | candidate |
| 17 | 喀丝丽·宫中急信 | `npc_kasili` | 女 | 少年 / 青年 | S | [npc_kasili__scene_palace_warning_letter.md](ch12-shujian/npc_kasili__scene_palace_warning_letter.md) | `por_npc_kasili__ch12_youth_scene_palace_warning_letter` | `assets/default/character/female/ch12/por_npc_kasili__ch12_youth_scene_palace_warning_letter.png` | candidate |
| 18 | 李可秀 | `npc_likexiu` | 男 | 壮年 | A | [npc_likexiu.md](ch12-shujian/npc_likexiu.md) | `por_npc_likexiu__ch12_prime_official_base` | `assets/default/character/male/ch12/por_npc_likexiu__ch12_prime_official_base.png` | new |
| 19 | 李沅芷 | `npc_liyuanzhi` | 女 | 少年 / 青年 | S | [npc_liyuanzhi.md](ch12-shujian/npc_liyuanzhi.md) | `por_npc_liyuanzhi__ch12_youth_disguised_base` | `assets/default/character/female/ch12/por_npc_liyuanzhi__ch12_youth_disguised_base.png` | new |
| 20 | 陆菲青 | `npc_lufeiqing` | 男 | 老年 | A | [npc_lufeiqing.md](ch12-shujian/npc_lufeiqing.md) | `por_npc_lufeiqing__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_lufeiqing__ch12_elder_base.png` | new |
| 21 | 骆冰 | `npc_luobing` | 女 | 少年 / 青年 | S | [npc_luobing.md](ch12-shujian/npc_luobing.md) | `por_npc_luobing__ch12_youth_recovered_base` | `assets/default/character/female/ch12/por_npc_luobing__ch12_youth_recovered_base.png` | new |
| 22 | 马真 | `npc_mazhen` | 男 | 老年 | A | [npc_mazhen.md](ch12-shujian/npc_mazhen.md) | `por_npc_mazhen__ch12_elder_wudang_base` | `assets/default/character/male/ch12/por_npc_mazhen__ch12_elder_wudang_base.png` | new |
| 23 | 木卓伦 | `npc_muzhuolun` | 男 | 老年 | A | [npc_muzhuolun.md](ch12-shujian/npc_muzhuolun.md) | `por_npc_muzhuolun__ch12_elder_alive_base` | `assets/default/character/male/ch12/por_npc_muzhuolun__ch12_elder_alive_base.png` | new |
| 24 | 乾隆 | `npc_qianlong` | 男 | 壮年 | S | [npc_qianlong.md](ch12-shujian/npc_qianlong.md) | `por_npc_qianlong__ch12_prime_palace_base` | `assets/default/character/male/ch12/por_npc_qianlong__ch12_prime_palace_base.png` | new |
| 25 | 钱正伦 | `npc_qianzhenglun` | 男 | 壮年 | B | [npc_qianzhenglun.md](ch12-shujian/npc_qianzhenglun.md) | `por_npc_qianzhenglun__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_qianzhenglun__ch12_prime_base.png` | new |
| 26 | 石双英 | `npc_shishuangying` | 男 | 壮年 | A | [npc_shishuangying.md](ch12-shujian/npc_shishuangying.md) | `por_npc_shishuangying__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_shishuangying__ch12_prime_base.png` | new |
| 27 | 童兆和 | `npc_tongzhaohe` | 男 | 壮年 | B | [npc_tongzhaohe.md](ch12-shujian/npc_tongzhaohe.md) | `por_npc_tongzhaohe__ch12_prime_escort_base` | `assets/default/character/male/ch12/por_npc_tongzhaohe__ch12_prime_escort_base.png` | new |
| 28 | 王维扬 | `npc_wangweiyang` | 男 | 老年 | A | [npc_wangweiyang.md](ch12-shujian/npc_wangweiyang.md) | `por_npc_wangweiyang__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_wangweiyang__ch12_elder_base.png` | new |
| 29 | 卫春华 | `npc_weichunhua` | 男 | 壮年 | A | [npc_weichunhua.md](ch12-shujian/npc_weichunhua.md) | `por_npc_weichunhua__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_weichunhua__ch12_prime_base.png` | new |
| 30 | 文泰来 | `npc_wentailai` | 男 | 壮年 | S | [npc_wentailai.md](ch12-shujian/npc_wentailai.md) | `por_npc_wentailai__ch12_prime_recovered_base` | `assets/default/character/male/ch12/por_npc_wentailai__ch12_prime_recovered_base.png` | new |
| 31 | 无尘道长 | `npc_wuchen` | 男 | 老年 | A | [npc_wuchen.md](ch12-shujian/npc_wuchen.md) | `por_npc_wuchen__ch12_elder_onearm_base` | `assets/default/character/male/ch12/por_npc_wuchen__ch12_elder_onearm_base.png` | new |
| 32 | 心砚 | `npc_xinyan` | 男 | 少年 / 青年 | A | [npc_xinyan.md](ch12-shujian/npc_xinyan.md) | `por_npc_xinyan__ch12_youth_base` | `assets/default/character/male/ch12/por_npc_xinyan__ch12_youth_base.png` | new |
| 33 | 徐天宏 | `npc_xutianhong` | 男 | 少年 / 青年 | S | [npc_xutianhong.md](ch12-shujian/npc_xutianhong.md) | `por_npc_xutianhong__ch12_youth_base` | `assets/default/character/male/ch12/por_npc_xutianhong__ch12_youth_base.png` | new |
| 34 | 杨成协 | `npc_yangchengxie` | 男 | 壮年 | A | [npc_yangchengxie.md](ch12-shujian/npc_yangchengxie.md) | `por_npc_yangchengxie__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_yangchengxie__ch12_prime_base.png` | new |
| 35 | 阎世章 | `npc_yanshizhang` | 男 | 壮年 | B | [npc_yanshizhang.md](ch12-shujian/npc_yanshizhang.md) | `por_npc_yanshizhang__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_yanshizhang__ch12_prime_base.png` | new |
| 36 | 袁士霄 | `npc_yuanshixiao` | 男 | 老年 | A | [npc_yuanshixiao.md](ch12-shujian/npc_yuanshixiao.md) | `por_npc_yuanshixiao__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_yuanshixiao__ch12_elder_base.png` | new |
| 37 | 于万亭 | `npc_yuwanting` | 男 | 老年 | A | [npc_yuwanting.md](ch12-shujian/npc_yuwanting.md) | `por_npc_yuwanting__ch12_elder_memory_base` | `assets/default/character/male/ch12/por_npc_yuwanting__ch12_elder_memory_base.png` | new |
| 38 | 余鱼同 | `npc_yuyutong` | 男 | 少年 / 青年 | S | [npc_yuyutong.md](ch12-shujian/npc_yuyutong.md) | `por_npc_yuyutong__ch12_youth_scarred_monk_base` | `assets/default/character/male/ch12/por_npc_yuyutong__ch12_youth_scarred_monk_base.png` | new |
| 39 | 章进 | `npc_zhangjin` | 男 | 壮年 | A | [npc_zhangjin.md](ch12-shujian/npc_zhangjin.md) | `por_npc_zhangjin__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_zhangjin__ch12_prime_base.png` | new |
| 40 | 张召重 | `npc_zhangzhaozhong` | 男 | 壮年 | S | [npc_zhangzhaozhong.md](ch12-shujian/npc_zhangzhaozhong.md) | `por_npc_zhangzhaozhong__ch12_prime_pursuit_base` | `assets/default/character/male/ch12/por_npc_zhangzhaozhong__ch12_prime_pursuit_base.png` | new |
| 41 | 赵半山 | `npc_zhaobanshan` | 男 | 老年 | S | [npc_zhaobanshan.md](ch12-shujian/npc_zhaobanshan.md) | `por_npc_zhaobanshan__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_zhaobanshan__ch12_elder_base.png` | new |
| 42 | 兆惠 | `npc_zhaohui` | 男 | 壮年 | S | [npc_zhaohui.md](ch12-shujian/npc_zhaohui.md) | `por_npc_zhaohui__ch12_prime_campaign_base` | `assets/default/character/male/ch12/por_npc_zhaohui__ch12_prime_campaign_base.png` | new |
| 43 | 周大奶奶 | `npc_zhoudanainai` | 女 | 老年 | A | [npc_zhoudanainai.md](ch12-shujian/npc_zhoudanainai.md) | `por_npc_zhoudanainai__ch12_elder_household_base` | `assets/default/character/female/ch12/por_npc_zhoudanainai__ch12_elder_household_base.png` | new |
| 44 | 周绮 | `npc_zhouqi12` | 女 | 少年 / 青年 | S | [npc_zhouqi12.md](ch12-shujian/npc_zhouqi12.md) | `por_npc_zhouqi12__ch12_youth_base` | `assets/default/character/female/ch12/por_npc_zhouqi12__ch12_youth_base.png` | new |
| 45 | 周英杰 | `npc_zhouyingjie` | 男 | 少年 / 青年 | B | [npc_zhouyingjie.md](ch12-shujian/npc_zhouyingjie.md) | `por_npc_zhouyingjie__ch12_youth_alive_base` | `assets/default/character/male/ch12/por_npc_zhouyingjie__ch12_youth_alive_base.png` | new |
| 46 | 周仲英 | `npc_zhouzhongying` | 男 | 老年 | A | [npc_zhouzhongying.md](ch12-shujian/npc_zhouzhongying.md) | `por_npc_zhouzhongying__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_zhouzhongying__ch12_elder_base.png` | new |

### ch13 · 《飞狐外传》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 常伯志 | `npc_changbozhi` | 男 | 壮年 | A | [npc_changbozhi.md](ch13-feihu/npc_changbozhi.md) | `por_npc_changbozhi__ch13_prime_rescue_base` | `assets/default/character/male/ch13/por_npc_changbozhi__ch13_prime_rescue_base.png` | new |
| 2 | 常赫志 | `npc_changhezhi` | 男 | 壮年 | A | [npc_changhezhi.md](ch13-feihu/npc_changhezhi.md) | `por_npc_changhezhi__ch13_prime_rescue_base` | `assets/default/character/male/ch13/por_npc_changhezhi__ch13_prime_rescue_base.png` | new |
| 3 | 程灵素 | `npc_chenglinsu` | 女 | 少年 / 青年 | S | [npc_chenglinsu.md](ch13-feihu/npc_chenglinsu.md) | `por_npc_chenglinsu__ch13_youth_alive_base` | `assets/default/character/female/ch13/por_npc_chenglinsu__ch13_youth_alive_base.png` | candidate |
| 4 | 程灵素·舍命之前 | `npc_chenglinsu` | 女 | 少年 / 青年 | S | [npc_chenglinsu__scene_last_choice_save_hu.md](ch13-feihu/npc_chenglinsu__scene_last_choice_save_hu.md) | `por_npc_chenglinsu__ch13_youth_scene_last_choice_save_hu` | `assets/default/character/female/ch13/por_npc_chenglinsu__ch13_youth_scene_last_choice_save_hu.png` | candidate |
| 5 | 程灵素·药王门前 | `npc_chenglinsu` | 女 | 少年 / 青年 | S | [npc_chenglinsu__scene_medicine_garden_meeting.md](ch13-feihu/npc_chenglinsu__scene_medicine_garden_meeting.md) | `por_npc_chenglinsu__ch13_youth_scene_medicine_garden_meeting` | `assets/default/character/female/ch13/por_npc_chenglinsu__ch13_youth_scene_medicine_garden_meeting.png` | candidate |
| 6 | 陈家洛 | `npc_chenjialuo` | 男 | 少年 / 青年 | S | [npc_chenjialuo.md](ch13-feihu/npc_chenjialuo.md) | `por_npc_chenjialuo__ch13_youth_afterassembly_base` | `assets/default/character/male/ch13/por_npc_chenjialuo__ch13_youth_afterassembly_base.png` | new |
| 7 | 陈禹 | `npc_chenyu` | 男 | 壮年 | B | [npc_chenyu.md](ch13-feihu/npc_chenyu.md) | `por_npc_chenyu__ch13_prime_taiji_base` | `assets/default/character/male/ch13/por_npc_chenyu__ch13_prime_taiji_base.png` | new |
| 8 | 大智禅师 | `npc_dazhichanshi` | 男 | 老年 | A | [npc_dazhichanshi.md](ch13-feihu/npc_dazhichanshi.md) | `por_npc_dazhichanshi__ch13_elder_base` | `assets/default/character/male/ch13/por_npc_dazhichanshi__ch13_elder_base.png` | ready |
| 9 | 凤天南 | `npc_fengtianan` | 男 | 壮年 | S | [npc_fengtianan.md](ch13-feihu/npc_fengtianan.md) | `por_npc_fengtianan__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_fengtianan__ch13_prime_base.png` | ready |
| 10 | 凤一鸣 | `npc_fengyiming` | 男 | 少年 / 青年 | A | [npc_fengyiming.md](ch13-feihu/npc_fengyiming.md) | `por_npc_fengyiming__ch13_youth_base` | `assets/default/character/male/ch13/por_npc_fengyiming__ch13_youth_base.png` | ready |
| 11 | 福康安 | `npc_fukangan` | 男 | 壮年 | S | [npc_fukangan.md](ch13-feihu/npc_fukangan.md) | `por_npc_fukangan__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_fukangan__ch13_prime_base.png` | redo |
| 12 | 黄希节 | `npc_huangxijie` | 男 | 壮年 | B | [npc_huangxijie.md](ch13-feihu/npc_huangxijie.md) | `por_npc_huangxijie__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_huangxijie__ch13_prime_base.png` | ready |
| 13 | 胡斐 | `npc_hufei` | 男 | 少年 / 青年 | S | [npc_hufei.md](ch13-feihu/npc_hufei.md) | `por_npc_hufei__ch13_youth_base` | `assets/default/character/male/ch13/por_npc_hufei__ch13_youth_base.png` | candidate |
| 14 | 胡斐·佛山问罪 | `npc_hufei` | 男 | 少年 / 青年 | S | [npc_hufei__scene_foshan_blood_mark_justice.md](ch13-feihu/npc_hufei__scene_foshan_blood_mark_justice.md) | `por_npc_hufei__ch13_youth_scene_foshan_blood_mark_justice` | `assets/default/character/male/ch13/por_npc_hufei__ch13_youth_scene_foshan_blood_mark_justice.png` | candidate |
| 15 | 胡斐·墓前归刀 | `npc_hufei` | 男 | 少年 / 青年 | S | [npc_hufei__scene_grave_return_blade.md](ch13-feihu/npc_hufei__scene_grave_return_blade.md) | `por_npc_hufei__ch13_youth_scene_grave_return_blade` | `assets/default/character/male/ch13/por_npc_hufei__ch13_youth_scene_grave_return_blade.png` | candidate |
| 16 | 胡夫人 | `npc_hufuren` | 女 | 少年 / 青年 | A | [npc_hufuren.md](ch13-feihu/npc_hufuren.md) | `por_npc_hufuren__ch13_youth_memory_base` | `assets/default/character/female/ch13/por_npc_hufuren__ch13_youth_memory_base.png` | redo |
| 17 | 胡一刀 | `npc_huyidao` | 男 | 壮年 | A | [npc_huyidao.md](ch13-feihu/npc_huyidao.md) | `por_npc_huyidao__ch13_prime_memory_base` | `assets/default/character/male/ch13/por_npc_huyidao__ch13_prime_memory_base.png` | redo |
| 18 | 姜铁山 | `npc_jiangtieshan` | 男 | 壮年 | A | [npc_jiangtieshan.md](ch13-feihu/npc_jiangtieshan.md) | `por_npc_jiangtieshan__ch13_prime_physician_base` | `assets/default/character/male/ch13/por_npc_jiangtieshan__ch13_prime_physician_base.png` | new |
| 19 | 姜小铁 | `npc_jiangxiaotie` | 男 | 少年 / 青年 | A | [npc_jiangxiaotie.md](ch13-feihu/npc_jiangxiaotie.md) | `por_npc_jiangxiaotie__ch13_youth_protected_base` | `assets/default/character/male/ch13/por_npc_jiangxiaotie__ch13_youth_protected_base.png` | hold |
| 20 | 刘鹤真 | `npc_liuhezhen` | 男 | 壮年 | A | [npc_liuhezhen.md](ch13-feihu/npc_liuhezhen.md) | `por_npc_liuhezhen__ch13_prime_messenger_base` | `assets/default/character/male/ch13/por_npc_liuhezhen__ch13_prime_messenger_base.png` | new |
| 21 | 骆冰 | `npc_luobing` | 女 | 壮年 | A | [npc_luobing.md](ch13-feihu/npc_luobing.md) | `por_npc_luobing__ch13_prime_honghua_base` | `assets/default/character/female/ch13/por_npc_luobing__ch13_prime_honghua_base.png` | new |
| 22 | 马春花 | `npc_machunhua` | 女 | 少年 / 青年 | A | [npc_machunhua.md](ch13-feihu/npc_machunhua.md) | `por_npc_machunhua__ch13_youth_escort_base` | `assets/default/character/female/ch13/por_npc_machunhua__ch13_youth_escort_base.png` | redo |
| 23 | 马行空 | `npc_maxingkong` | 男 | 老年 | A | [npc_maxingkong.md](ch13-feihu/npc_maxingkong.md) | `por_npc_maxingkong__ch13_elder_base` | `assets/default/character/male/ch13/por_npc_maxingkong__ch13_elder_base.png` | ready |
| 24 | 苗人凤 | `npc_miaorenfeng` | 男 | 壮年 | S | [npc_miaorenfeng.md](ch13-feihu/npc_miaorenfeng.md) | `por_npc_miaorenfeng__ch13_prime_recovered_base` | `assets/default/character/male/ch13/por_npc_miaorenfeng__ch13_prime_recovered_base.png` | redo |
| 25 | 苗若兰 | `npc_miaoruolan` | 女 | 童年 | A | [npc_miaoruolan.md](ch13-feihu/npc_miaoruolan.md) | `por_npc_miaoruolan__ch13_child_base` | `assets/default/character/female/ch13/por_npc_miaoruolan__ch13_child_base.png` | ready |
| 26 | 慕容景岳 | `npc_murongjingyue` | 男 | 壮年 | A | [npc_murongjingyue.md](ch13-feihu/npc_murongjingyue.md) | `por_npc_murongjingyue__ch13_prime_whole_base` | `assets/default/character/male/ch13/por_npc_murongjingyue__ch13_prime_whole_base.png` | ready |
| 27 | 南兰 | `npc_nanlan` | 女 | 少年 / 青年 | A | [npc_nanlan.md](ch13-feihu/npc_nanlan.md) | `por_npc_nanlan__ch13_youth_base` | `assets/default/character/female/ch13/por_npc_nanlan__ch13_youth_base.png` | redo |
| 28 | 倪不大 | `npc_nibuda` | 男 | 壮年 | B | [npc_nibuda.md](ch13-feihu/npc_nibuda.md) | `por_npc_nibuda__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_nibuda__ch13_prime_base.png` | ready |
| 29 | 倪不小 | `npc_nibuxiao` | 男 | 壮年 | B | [npc_nibuxiao.md](ch13-feihu/npc_nibuxiao.md) | `por_npc_nibuxiao__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_nibuxiao__ch13_prime_base.png` | ready |
| 30 | 欧阳公政 | `npc_ouyanggongzheng` | 男 | 壮年 | B | [npc_ouyanggongzheng.md](ch13-feihu/npc_ouyanggongzheng.md) | `por_npc_ouyanggongzheng__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_ouyanggongzheng__ch13_prime_base.png` | ready |
| 31 | 平阿四 | `npc_pingasi` | 男 | 壮年 | S | [npc_pingasi.md](ch13-feihu/npc_pingasi.md) | `por_npc_pingasi__ch13_prime_onearm_base` | `assets/default/character/male/ch13/por_npc_pingasi__ch13_prime_onearm_base.png` | redo |
| 32 | 秦耐之 | `npc_qinnaizhi` | 男 | 壮年 | B | [npc_qinnaizhi.md](ch13-feihu/npc_qinnaizhi.md) | `por_npc_qinnaizhi__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_qinnaizhi__ch13_prime_base.png` | ready |
| 33 | 商宝震 | `npc_shangbaozhen` | 男 | 少年 / 青年 | A | [npc_shangbaozhen.md](ch13-feihu/npc_shangbaozhen.md) | `por_npc_shangbaozhen__ch13_youth_manor_base` | `assets/default/character/male/ch13/por_npc_shangbaozhen__ch13_youth_manor_base.png` | ready |
| 34 | 商剑鸣 | `npc_shangjianming` | 男 | 壮年 | A | [npc_shangjianming.md](ch13-feihu/npc_shangjianming.md) | `por_npc_shangjianming__ch13_prime_memory_base` | `assets/default/character/male/ch13/por_npc_shangjianming__ch13_prime_memory_base.png` | new |
| 35 | 商老太 | `npc_shanglaotai` | 女 | 老年 | S | [npc_shanglaotai.md](ch13-feihu/npc_shanglaotai.md) | `por_npc_shanglaotai__ch13_elder_base` | `assets/default/character/female/ch13/por_npc_shanglaotai__ch13_elder_base.png` | ready |
| 36 | 石万嗔 | `npc_shiwuchen` | 男 | 老年 | S | [npc_shiwuchen.md](ch13-feihu/npc_shiwuchen.md) | `por_npc_shiwuchen__ch13_elder_sighted_base` | `assets/default/character/male/ch13/por_npc_shiwuchen__ch13_elder_sighted_base.png` | ready |
| 37 | 田归农 | `npc_tianguinong` | 男 | 壮年 | S | [npc_tianguinong.md](ch13-feihu/npc_tianguinong.md) | `por_npc_tianguinong__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_tianguinong__ch13_prime_base.png` | redo |
| 38 | 王维扬 | `npc_wangweiyang` | 男 | 老年 | A | [npc_wangweiyang.md](ch13-feihu/npc_wangweiyang.md) | `por_npc_wangweiyang__ch13_elder_escort_base` | `assets/default/character/male/ch13/por_npc_wangweiyang__ch13_elder_escort_base.png` | new |
| 39 | 万鹤声 | `npc_wanhesheng` | 男 | 老年 | A | [npc_wanhesheng.md](ch13-feihu/npc_wanhesheng.md) | `por_npc_wanhesheng__ch13_elder_weituo_base` | `assets/default/character/male/ch13/por_npc_wanhesheng__ch13_elder_weituo_base.png` | new |
| 40 | 无嗔（毒手药王） | `npc_wuchen13` | 男 | 老年 | A | [npc_wuchen13.md](ch13-feihu/npc_wuchen13.md) | `por_npc_wuchen13__ch13_elder_memory_base` | `assets/default/character/male/ch13/por_npc_wuchen13__ch13_elder_memory_base.png` | new |
| 41 | 薛鹊 | `npc_xueque` | 女 | 少年 / 青年 | A | [npc_xueque.md](ch13-feihu/npc_xueque.md) | `por_npc_xueque__ch13_youth_base` | `assets/default/character/female/ch13/por_npc_xueque__ch13_youth_base.png` | redo |
| 42 | 徐铮 | `npc_xuzheng` | 男 | 少年 / 青年 | A | [npc_xuzheng.md](ch13-feihu/npc_xuzheng.md) | `por_npc_xuzheng__ch13_youth_base` | `assets/default/character/male/ch13/por_npc_xuzheng__ch13_youth_base.png` | ready |
| 43 | 袁银姑 | `npc_yuanyingu` | 女 | 少年 / 青年 | A | [npc_yuanyingu.md](ch13-feihu/npc_yuanyingu.md) | `por_npc_yuanyingu__ch13_youth_memory_base` | `assets/default/character/female/ch13/por_npc_yuanyingu__ch13_youth_memory_base.png` | new |
| 44 | 袁紫衣 | `npc_yuanziyi` | 女 | 少年 / 青年 | S | [npc_yuanziyi.md](ch13-feihu/npc_yuanziyi.md) | `por_npc_yuanziyi__ch13_youth_ziyi_base` | `assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_ziyi_base.png` | candidate |
| 45 | 袁紫衣·圆性现身 | `npc_yuanziyi` | 女 | 少年 / 青年 | S | [npc_yuanziyi__scene_assembly_yuanxing_reveal.md](ch13-feihu/npc_yuanziyi__scene_assembly_yuanxing_reveal.md) | `por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal` | `assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal.png` | candidate |
| 46 | 袁紫衣·紫衣初逢 | `npc_yuanziyi` | 女 | 少年 / 青年 | S | [npc_yuanziyi__scene_purple_traveler_trial.md](ch13-feihu/npc_yuanziyi__scene_purple_traveler_trial.md) | `por_npc_yuanziyi__ch13_youth_scene_purple_traveler_trial` | `assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_scene_purple_traveler_trial.png` | candidate |
| 47 | 张云飞 | `npc_zhangyunfei` | 男 | 壮年 | B | [npc_zhangyunfei.md](ch13-feihu/npc_zhangyunfei.md) | `por_npc_zhangyunfei__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhangyunfei__ch13_prime_base.png` | new |
| 48 | 赵半山 | `npc_zhaobanshan` | 男 | 老年 | S | [npc_zhaobanshan.md](ch13-feihu/npc_zhaobanshan.md) | `por_npc_zhaobanshan__ch13_elder_base` | `assets/default/character/male/ch13/por_npc_zhaobanshan__ch13_elder_base.png` | new |
| 49 | 钟阿四 | `npc_zhongasi` | 男 | 壮年 | A | [npc_zhongasi.md](ch13-feihu/npc_zhongasi.md) | `por_npc_zhongasi__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongasi__ch13_prime_base.png` | ready |
| 50 | 钟兆能 | `npc_zhongzhaoneng` | 男 | 壮年 | B | [npc_zhongzhaoneng.md](ch13-feihu/npc_zhongzhaoneng.md) | `por_npc_zhongzhaoneng__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongzhaoneng__ch13_prime_base.png` | new |
| 51 | 钟兆文 | `npc_zhongzhaowen` | 男 | 壮年 | A | [npc_zhongzhaowen.md](ch13-feihu/npc_zhongzhaowen.md) | `por_npc_zhongzhaowen__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongzhaowen__ch13_prime_base.png` | ready |
| 52 | 钟兆英 | `npc_zhongzhaoying` | 男 | 壮年 | B | [npc_zhongzhaoying.md](ch13-feihu/npc_zhongzhaoying.md) | `por_npc_zhongzhaoying__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongzhaoying__ch13_prime_base.png` | new |

### ch14 · 《雪山飞狐》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 宝树 | `npc_baoshu` | 男 | 老年 | S | [npc_baoshu.md](ch14-xueshan/npc_baoshu.md) | `por_npc_baoshu__ch14_elder_base` | `assets/default/character/male/ch14/por_npc_baoshu__ch14_elder_base.png` | new |
| 2 | 曹云奇 | `npc_caoyunqi` | 男 | 壮年 | A | [npc_caoyunqi.md](ch14-xueshan/npc_caoyunqi.md) | `por_npc_caoyunqi__ch14_base` | `assets/default/character/male/ch14/por_npc_caoyunqi__ch14_base.png` | new |
| 3 | 杜希孟 | `npc_duximeng` | 男 | 老年 | A | [npc_duximeng.md](ch14-xueshan/npc_duximeng.md) | `por_npc_duximeng__ch14_base` | `assets/default/character/male/ch14/por_npc_duximeng__ch14_base.png` | new |
| 4 | 范帮主 | `npc_fanbangzhu` | 男 | 老年 | A | [npc_fanbangzhu.md](ch14-xueshan/npc_fanbangzhu.md) | `por_npc_fanbangzhu__ch14_base` | `assets/default/character/male/ch14/por_npc_fanbangzhu__ch14_base.png` | new |
| 5 | 胡斐 | `npc_hufei` | 男 | 壮年 | S | [npc_hufei.md](ch14-xueshan/npc_hufei.md) | `por_npc_hufei__ch14_prime_base` | `assets/default/character/male/ch14/por_npc_hufei__ch14_prime_base.png` | candidate |
| 6 | 胡斐·雪崖悬刀 | `npc_hufei` | 男 | 壮年 | S | [npc_hufei__scene_snow_cliff_suspended_blade.md](ch14-xueshan/npc_hufei__scene_snow_cliff_suspended_blade.md) | `por_npc_hufei__ch14_prime_scene_snow_cliff_suspended_blade` | `assets/default/character/male/ch14/por_npc_hufei__ch14_prime_scene_snow_cliff_suspended_blade.png` | candidate |
| 7 | 胡斐·飞狐登峰 | `npc_hufei` | 男 | 壮年 | S | [npc_hufei__scene_yubi_rescue.md](ch14-xueshan/npc_hufei__scene_yubi_rescue.md) | `por_npc_hufei__ch14_prime_scene_yubi_rescue` | `assets/default/character/male/ch14/por_npc_hufei__ch14_prime_scene_yubi_rescue.png` | candidate |
| 8 | 胡夫人 | `npc_hufuren` | 女 | 少年 / 青年 | A | [npc_hufuren.md](ch14-xueshan/npc_hufuren.md) | `por_npc_hufuren__ch14_youth_memory_base` | `assets/default/character/female/ch14/por_npc_hufuren__ch14_youth_memory_base.png` | redo |
| 9 | 胡一刀 | `npc_huyidao` | 男 | 壮年 | S | [npc_huyidao.md](ch14-xueshan/npc_huyidao.md) | `por_npc_huyidao__ch14_prime_memory_base` | `assets/default/character/male/ch14/por_npc_huyidao__ch14_prime_memory_base.png` | redo |
| 10 | 蒋老拳师 | `npc_jianglaoquanshi` | 男 | 老年 | B | [npc_jianglaoquanshi.md](ch14-xueshan/npc_jianglaoquanshi.md) | `por_npc_jianglaoquanshi__ch14_elder_taiji_base` | `assets/default/character/male/ch14/por_npc_jianglaoquanshi__ch14_elder_taiji_base.png` | new |
| 11 | 静智大师 | `npc_jingzhidashi` | 男 | 老年 | B | [npc_jingzhidashi.md](ch14-xueshan/npc_jingzhidashi.md) | `por_npc_jingzhidashi__ch14_base` | `assets/default/character/male/ch14/por_npc_jingzhidashi__ch14_base.png` | new |
| 12 | 灵清居士 | `npc_lingqingjushi` | 男 | 老年 | B | [npc_lingqingjushi.md](ch14-xueshan/npc_lingqingjushi.md) | `por_npc_lingqingjushi__ch14_elder_mountain_base` | `assets/default/character/male/ch14/por_npc_lingqingjushi__ch14_elder_mountain_base.png` | new |
| 13 | 刘元鹤 | `npc_liuyuanhe` | 男 | 壮年 | A | [npc_liuyuanhe.md](ch14-xueshan/npc_liuyuanhe.md) | `por_npc_liuyuanhe__ch14_base` | `assets/default/character/male/ch14/por_npc_liuyuanhe__ch14_base.png` | new |
| 14 | 李自成 | `npc_lizicheng` | 男 | 壮年 | A | [npc_lizicheng.md](ch14-xueshan/npc_lizicheng.md) | `por_npc_lizicheng__ch14_prime_memory_base` | `assets/default/character/male/ch14/por_npc_lizicheng__ch14_prime_memory_base.png` | new |
| 15 | 马寨主 | `npc_mazhaizhu14` | 男 | 壮年 | B | [npc_mazhaizhu14.md](ch14-xueshan/npc_mazhaizhu14.md) | `por_npc_mazhaizhu14__ch14_prime_stronghold_base` | `assets/default/character/male/ch14/por_npc_mazhaizhu14__ch14_prime_stronghold_base.png` | new |
| 16 | 苗人凤 | `npc_miaorenfeng` | 男 | 老年 | S | [npc_miaorenfeng.md](ch14-xueshan/npc_miaorenfeng.md) | `por_npc_miaorenfeng__ch14_elder_base` | `assets/default/character/male/ch14/por_npc_miaorenfeng__ch14_elder_base.png` | redo |
| 17 | 苗若兰 | `npc_miaoruolan` | 女 | 少年 / 青年 | S | [npc_miaoruolan.md](ch14-xueshan/npc_miaoruolan.md) | `por_npc_miaoruolan__ch14_youth_base` | `assets/default/character/female/ch14/por_npc_miaoruolan__ch14_youth_base.png` | candidate |
| 18 | 苗若兰·洞前劝留生路 | `npc_miaoruolan` | 女 | 少年 / 青年 | S | [npc_miaoruolan__scene_cave_plea_mercy.md](ch14-xueshan/npc_miaoruolan__scene_cave_plea_mercy.md) | `por_npc_miaoruolan__ch14_youth_scene_cave_plea_mercy` | `assets/default/character/female/ch14/por_npc_miaoruolan__ch14_youth_scene_cave_plea_mercy.png` | candidate |
| 19 | 苗若兰·山庄止争 | `npc_miaoruolan` | 女 | 少年 / 青年 | S | [npc_miaoruolan__scene_manor_stop_fight.md](ch14-xueshan/npc_miaoruolan__scene_manor_stop_fight.md) | `por_npc_miaoruolan__ch14_youth_scene_manor_stop_fight` | `assets/default/character/female/ch14/por_npc_miaoruolan__ch14_youth_scene_manor_stop_fight.png` | candidate |
| 20 | 南兰 | `npc_nanlan` | 女 | 少年 / 青年 | A | [npc_nanlan.md](ch14-xueshan/npc_nanlan.md) | `por_npc_nanlan__ch14_youth_memory_base` | `assets/default/character/female/ch14/por_npc_nanlan__ch14_youth_memory_base.png` | redo |
| 21 | 平阿四 | `npc_pingasi` | 男 | 老年 | A | [npc_pingasi.md](ch14-xueshan/npc_pingasi.md) | `por_npc_pingasi__ch14_elder_onearm_base` | `assets/default/character/male/ch14/por_npc_pingasi__ch14_elder_onearm_base.png` | redo |
| 22 | 阮士中 | `npc_ruanshizhong` | 男 | 壮年 | A | [npc_ruanshizhong.md](ch14-xueshan/npc_ruanshizhong.md) | `por_npc_ruanshizhong__ch14_base` | `assets/default/character/male/ch14/por_npc_ruanshizhong__ch14_base.png` | new |
| 23 | 赛总管 | `npc_saizongguan` | 男 | 壮年 | S | [npc_saizongguan.md](ch14-xueshan/npc_saizongguan.md) | `por_npc_saizongguan__ch14_base` | `assets/default/character/male/ch14/por_npc_saizongguan__ch14_base.png` | new |
| 24 | 陶百岁 | `npc_taobaisui` | 男 | 老年 | A | [npc_taobaisui.md](ch14-xueshan/npc_taobaisui.md) | `por_npc_taobaisui__ch14_base` | `assets/default/character/male/ch14/por_npc_taobaisui__ch14_base.png` | new |
| 25 | 陶子安 | `npc_taozian` | 男 | 少年 / 青年 | A | [npc_taozian.md](ch14-xueshan/npc_taozian.md) | `por_npc_taozian__ch14_base` | `assets/default/character/male/ch14/por_npc_taozian__ch14_base.png` | new |
| 26 | 田归农 | `npc_tianguinong` | 男 | 壮年 | A | [npc_tianguinong.md](ch14-xueshan/npc_tianguinong.md) | `por_npc_tianguinong__ch14_prime_memory_base` | `assets/default/character/male/ch14/por_npc_tianguinong__ch14_prime_memory_base.png` | redo |
| 27 | 田青文 | `npc_tianqingwen` | 女 | 少年 / 青年 | A | [npc_tianqingwen.md](ch14-xueshan/npc_tianqingwen.md) | `por_npc_tianqingwen__ch14_base` | `assets/default/character/female/ch14/por_npc_tianqingwen__ch14_base.png` | new |
| 28 | 熊元献 | `npc_xiongyuanxian` | 男 | 壮年 | A | [npc_xiongyuanxian.md](ch14-xueshan/npc_xiongyuanxian.md) | `por_npc_xiongyuanxian__ch14_base` | `assets/default/character/male/ch14/por_npc_xiongyuanxian__ch14_base.png` | new |
| 29 | 玄冥子 | `npc_xuanmingzi` | 男 | 老年 | B | [npc_xuanmingzi.md](ch14-xueshan/npc_xuanmingzi.md) | `por_npc_xuanmingzi__ch14_elder_mountain_base` | `assets/default/character/male/ch14/por_npc_xuanmingzi__ch14_elder_mountain_base.png` | new |
| 30 | 殷吉 | `npc_yinji` | 男 | 壮年 | A | [npc_yinji.md](ch14-xueshan/npc_yinji.md) | `por_npc_yinji__ch14_base` | `assets/default/character/male/ch14/por_npc_yinji__ch14_base.png` | new |
| 31 | 郑三娘 | `npc_zhengsanniang` | 女 | 壮年 | A | [npc_zhengsanniang.md](ch14-xueshan/npc_zhengsanniang.md) | `por_npc_zhengsanniang__ch14_base` | `assets/default/character/female/ch14/por_npc_zhengsanniang__ch14_base.png` | new |
| 32 | 周云阳 | `npc_zhouyunyang` | 男 | 壮年 | B | [npc_zhouyunyang.md](ch14-xueshan/npc_zhouyunyang.md) | `por_npc_zhouyunyang__ch14_base` | `assets/default/character/male/ch14/por_npc_zhouyunyang__ch14_base.png` | new |

### 主角与书灵

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 书灵·抽象墨影 | `npc_shuling` | 其他 | 壮年 | S | [npc_shuling.md](protagonist/npc_shuling.md) | `por_npc_shuling__ch00_base` | `assets/default/character/other/ch00/por_npc_shuling__ch00_base.png` | ready |
| 2 | 主角（女）· 春秋末·越国 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch00.md](protagonist/npc_zhujue__f_ch00.md) | `por_npc_zhujue__ch00_f_base` | `assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png` | redo |
| 3 | 主角（女）· 北宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch01.md](protagonist/npc_zhujue__f_ch01.md) | `por_npc_zhujue__ch01_f_base` | `assets/default/character/female/ch01/por_npc_zhujue__ch01_f_base.png` | redo |
| 4 | 主角（女）· 南宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch02.md](protagonist/npc_zhujue__f_ch02.md) | `por_npc_zhujue__ch02_f_base` | `assets/default/character/female/ch02/por_npc_zhujue__ch02_f_base.png` | redo |
| 5 | 主角（女）· 南宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch03.md](protagonist/npc_zhujue__f_ch03.md) | `por_npc_zhujue__ch03_f_base` | `assets/default/character/female/ch03/por_npc_zhujue__ch03_f_base.png` | redo |
| 6 | 主角（女）· 元末 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch04.md](protagonist/npc_zhujue__f_ch04.md) | `por_npc_zhujue__ch04_f_base` | `assets/default/character/female/ch04/por_npc_zhujue__ch04_f_base.png` | redo |
| 7 | 主角（女）· 明中叶 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch05.md](protagonist/npc_zhujue__f_ch05.md) | `por_npc_zhujue__ch05_f_base` | `assets/default/character/female/ch05/por_npc_zhujue__ch05_f_base.png` | redo |
| 8 | 主角（女）· 明代 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch06.md](protagonist/npc_zhujue__f_ch06.md) | `por_npc_zhujue__ch06_f_base` | `assets/default/character/female/ch06/por_npc_zhujue__ch06_f_base.png` | redo |
| 9 | 主角（女）· 明末 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch07.md](protagonist/npc_zhujue__f_ch07.md) | `por_npc_zhujue__ch07_f_base` | `assets/default/character/female/ch07/por_npc_zhujue__ch07_f_base.png` | redo |
| 10 | 主角（女）· 清初·康熙 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch08.md](protagonist/npc_zhujue__f_ch08.md) | `por_npc_zhujue__ch08_f_base` | `assets/default/character/female/ch08/por_npc_zhujue__ch08_f_base.png` | redo |
| 11 | 主角（女）· 本作清初·康熙 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch09.md](protagonist/npc_zhujue__f_ch09.md) | `por_npc_zhujue__ch09_f_base` | `assets/default/character/female/ch09/por_npc_zhujue__ch09_f_base.png` | redo |
| 12 | 主角（女）· 唐·西州以北（白马，AR-26 唐代化） | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch10.md](protagonist/npc_zhujue__f_ch10.md) | `por_npc_zhujue__ch10_f_base` | `assets/default/character/female/ch10/por_npc_zhujue__ch10_f_base.png` | redo |
| 13 | 主角（女）· 清乾隆初 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch11.md](protagonist/npc_zhujue__f_ch11.md) | `por_npc_zhujue__ch11_f_base` | `assets/default/character/female/ch11/por_npc_zhujue__ch11_f_base.png` | redo |
| 14 | 主角（女）· 清乾隆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch12.md](protagonist/npc_zhujue__f_ch12.md) | `por_npc_zhujue__ch12_f_base` | `assets/default/character/female/ch12/por_npc_zhujue__ch12_f_base.png` | redo |
| 15 | 主角（女）· 清乾隆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch13.md](protagonist/npc_zhujue__f_ch13.md) | `por_npc_zhujue__ch13_f_base` | `assets/default/character/female/ch13/por_npc_zhujue__ch13_f_base.png` | redo |
| 16 | 主角（女）· 清乾隆·雪地 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch14.md](protagonist/npc_zhujue__f_ch14.md) | `por_npc_zhujue__ch14_f_base` | `assets/default/character/female/ch14/por_npc_zhujue__ch14_f_base.png` | redo |
| 17 | 主角（男）· 春秋末·越国 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch00.md](protagonist/npc_zhujue__m_ch00.md) | `por_npc_zhujue__ch00_m_base` | `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png` | redo |
| 18 | 主角（男）· 北宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch01.md](protagonist/npc_zhujue__m_ch01.md) | `por_npc_zhujue__ch01_m_base` | `assets/default/character/male/ch01/por_npc_zhujue__ch01_m_base.png` | redo |
| 19 | 主角（男）· 南宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch02.md](protagonist/npc_zhujue__m_ch02.md) | `por_npc_zhujue__ch02_m_base` | `assets/default/character/male/ch02/por_npc_zhujue__ch02_m_base.png` | redo |
| 20 | 主角（男）· 南宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch03.md](protagonist/npc_zhujue__m_ch03.md) | `por_npc_zhujue__ch03_m_base` | `assets/default/character/male/ch03/por_npc_zhujue__ch03_m_base.png` | redo |
| 21 | 主角（男）· 元末 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch04.md](protagonist/npc_zhujue__m_ch04.md) | `por_npc_zhujue__ch04_m_base` | `assets/default/character/male/ch04/por_npc_zhujue__ch04_m_base.png` | redo |
| 22 | 主角（男）· 明中叶 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch05.md](protagonist/npc_zhujue__m_ch05.md) | `por_npc_zhujue__ch05_m_base` | `assets/default/character/male/ch05/por_npc_zhujue__ch05_m_base.png` | redo |
| 23 | 主角（男）· 明代 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch06.md](protagonist/npc_zhujue__m_ch06.md) | `por_npc_zhujue__ch06_m_base` | `assets/default/character/male/ch06/por_npc_zhujue__ch06_m_base.png` | redo |
| 24 | 主角（男）· 明末 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch07.md](protagonist/npc_zhujue__m_ch07.md) | `por_npc_zhujue__ch07_m_base` | `assets/default/character/male/ch07/por_npc_zhujue__ch07_m_base.png` | redo |
| 25 | 主角（男）· 清初·康熙 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch08.md](protagonist/npc_zhujue__m_ch08.md) | `por_npc_zhujue__ch08_m_base` | `assets/default/character/male/ch08/por_npc_zhujue__ch08_m_base.png` | redo |
| 26 | 主角（男）· 本作清初·康熙 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch09.md](protagonist/npc_zhujue__m_ch09.md) | `por_npc_zhujue__ch09_m_base` | `assets/default/character/male/ch09/por_npc_zhujue__ch09_m_base.png` | redo |
| 27 | 主角（男）· 唐·西州以北（白马，AR-26 唐代化） | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch10.md](protagonist/npc_zhujue__m_ch10.md) | `por_npc_zhujue__ch10_m_base` | `assets/default/character/male/ch10/por_npc_zhujue__ch10_m_base.png` | redo |
| 28 | 主角（男）· 清乾隆初 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch11.md](protagonist/npc_zhujue__m_ch11.md) | `por_npc_zhujue__ch11_m_base` | `assets/default/character/male/ch11/por_npc_zhujue__ch11_m_base.png` | redo |
| 29 | 主角（男）· 清乾隆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch12.md](protagonist/npc_zhujue__m_ch12.md) | `por_npc_zhujue__ch12_m_base` | `assets/default/character/male/ch12/por_npc_zhujue__ch12_m_base.png` | redo |
| 30 | 主角（男）· 清乾隆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch13.md](protagonist/npc_zhujue__m_ch13.md) | `por_npc_zhujue__ch13_m_base` | `assets/default/character/male/ch13/por_npc_zhujue__ch13_m_base.png` | redo |
| 31 | 主角（男）· 清乾隆·雪地 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch14.md](protagonist/npc_zhujue__m_ch14.md) | `por_npc_zhujue__ch14_m_base` | `assets/default/character/male/ch14/por_npc_zhujue__ch14_m_base.png` | redo |

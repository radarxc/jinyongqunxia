# 人物立绘提示词 · 总索引

> 2026-10-01 作者最新提速：[每角色先1张、优先补齐基础人物](../../../../.agents/coord/portrait-generation/FAST-PRODUCTION-20261001.md)。已在途请求保留；小手指、细微装备与微偏角度集中登记，不反复磨图。覆盖下文默认2候选建议，实际候选数如实记录。

> 2026-10-01 作者最新纠正：[全人物范围、端正正面像、逐人身份参考](../../../../.agents/coord/portrait-generation/FULL-COVERAGE-IDENTITY-20261001.md)。此前111仅部分基础资产，不代表全人物；[14书界范围对账](../../../../.agents/coord/portrait-generation/full-coverage-20261001/REPORT.md)。该要求优先于下文旧审批、演员脸禁用和倾斜姿态限制，生成前同步完整提示词。

> 作者最新人物风格纠正：[人物美观写实、背景水墨](../../../../.agents/coord/portrait-generation/REALISTIC-CHARACTERS-20261001.md)。优先修正已开始的主角系列；人物衣料和体积完整、面容自然精细，不再采用破布/碎墨/飞白断裂画法。旧场景初版不计此次风格修正完成；所有输出仍candidate，先给萧峰首样。

> 本轮作者最新场景指示：[书中主角每人至少五幅经典场景](../../../../.agents/coord/portrait-generation/CLASSIC-SCENES-20261001.md)。优先点名五人共25幅，独立新建场景资产并保留基础立绘；淡景、龙、神雕与佛道艺术意象获授权，人物阶段与器物事实仍须分别核对。每场两候选择一，宽松自查后仍为candidate。此前基础补齐及英雄重绘未完项保留。

> 本轮作者最新重绘指示：[主角与明确正面重要角色强化英雄气概](../../../../.agents/coord/portrait-generation/HEROIC-REDESIGN-20261001.md)。优先完成 scope.json 中的英雄形象重绘/首绘，再补齐其余男女角色。旧图先版本备份，项目基线约束画风而不锁旧脸，可参考已实际查看的经典影视形象；宽松自查与 candidate 状态不变。每张验证落盘后再更新当前行并重读最新索引。

> 本轮作者最新指示：[先出齐男女角色，采用宽松自查](../../../../.agents/coord/portrait-generation/RELAXED-PRODUCTION-20260930.md)。现有 female/male 项目基线按授权可用于生成；候选审批状态不变，精确占高与轻微遮挡不阻塞。此指示优先于下文旧生产门槛；other 书灵另列。

> 本文件由 `tools/agents/build_portrait_index.py` 生成，不要手改；改提示词就改各人物文件，改规程就改 `GUIDE.md`，然后重新生成。
> 每个人物一份提示词文件（`<分组>/<id>.md`）：文首 frontmatter 写明立绘素材 ID、输出文件与登记清单的位置，正文是人物要点、完整提示词、排除项与质检要点。

基础提示词现已合入 **464** 份：女 117、男 346、其他 1；其中男女基础生产范围 **463** 项。另已登记 **83** 份场景提示词，150场景计划独立统计。数量是资产条目，不是独立人物；[全范围对账](../../../../.agents/coord/portrait-generation/full-coverage-20261001/REPORT.md)。提示词合入不表示图片完成，新面容/姿态审核也不追认历史图。

## 出图 agent 怎么用

1. 把本文件交给有 `view_image`、`image_gen` 的 GPT CLI 会话，在仓库根目录执行。本文件已嵌入完整的生成与存放规程；每个人物的完整提示词在「人物索引」表的「提示词」链接里。
2. 一个书界一个批次。先列出这一批能做的行（`status: ready`、图片和 manifest 条目都还不存在，已按 S → A → B 排好）：
   `python3 tools/agents/build_portrait_index.py --queue --book ch01`（加 `--json` 给脚本用）。
3. 对队列里的每一行，按下面「生成与存放规程」§2–§7 执行：核对身份 → 载入已批准参考 → 出 2 张候选选 1 张 → 按 `output` 存原图 → 追加 manifest → 校验交审。
4. 不要手改本文件；提示词合入后协调者会重新生成。队列为空，说明这一书界的提示词还没合入，或者已经全部出过图。

## 目录

- [出图 agent 怎么用](#出图-agent-怎么用)
- [生成与存放规程](#生成与存放规程)
- [ch01 · 《天龙八部》](#ch01--天龙八部)（40 份）
- [ch10 · 《白马啸西风》](#ch10--白马啸西风)（21 份）
- [ch11 · 《鸳鸯刀》](#ch11--鸳鸯刀)（20 份）
- [主角与书灵](#主角与书灵)（31 份）

## 撰写进度

2026-10-01 已按作者全人物授权同步既有工作树基础稿；原草稿与哈希备份保留。下表为提示词覆盖进度，不代表图像已生成或已审批。逐角色生成仍读取最新索引和说明。

| 分组 | 目录 | 状态 |
|---|---|---|
| ch01 · 《天龙八部》 | `ch01-tianlong/` | 已合入 40 份 |
| ch02 · 《射雕英雄传》 | `ch02-shediao/` | 已同步 37 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch03 · 《神雕侠侣》 | `ch03-shendiao/` | 已同步 33 份基础稿至主目录，逐角色待生成；原工作树稿保留；神雕other与何足道后界钩子另列 |
| ch04 · 《倚天屠龙记》 | `ch04-yitian/` | 已同步 38 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch05 · 《笑傲江湖》 | `ch05-xiaoao/` | 已同步 26 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch06 · 《侠客行》 | `ch06-xiake/` | 已同步 25 份基础稿至主目录，逐角色待生成；原工作树稿保留；司徒横纯历史提及另列 |
| ch07 · 《碧血剑》 | `ch07-bixue/` | 已同步 40 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch08 · 《鹿鼎记》 | `ch08-luding/` | 已同步 34 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch09 · 《连城诀》 | `ch09-liancheng/` | 已同步 27 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch10 · 《白马啸西风》 | `ch10-baima/` | 已合入 21 份 |
| ch11 · 《鸳鸯刀》 | `ch11-yuanyang/` | 已合入 20 份 |
| ch12 · 《书剑恩仇录》 | `ch12-shujian/` | 已同步 36 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch13 · 《飞狐外传》 | `ch13-feihu/` | 已同步 33 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| ch14 · 《雪山飞狐》 | `ch14-xueshan/` | 已同步 23 份基础稿至主目录，逐角色待生成；原工作树稿保留 |
| 主角与书灵 | `protagonist/` | 已合入 31 份 |
| characters | `characters/` | 未开工 |

## 生成与存放规程


在仓库根目录执行以下命令；所有 `assets/`、`docs/`、`tools/` 路径均相对仓库根目录。把本规程与目标人物提示词一起交给有 `view_image`、`image_gen` 的 GPT CLI 会话。
本规程供后续出图使用；总索引为 `assets/default/prompts/characters/INDEX.md`，由协调者生成。不要手改索引，不把提示词齐备当作图片已生成或已获批。

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

4. 核对 11 个键：`asset_id`、`subject_id`、`name`、`book`、`gender`、`age_variant`、`tier`、`output`、`manifest`、`references`、`status`；仅对 `status: ready` 出图，`draft` 先交提示词负责人完善。
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
| 年龄与尊重 | 未成年人物按实际年龄表现，衣着完整端庄，不成人化或性感化；老人、伤残及非标准体型如实表现，不恶搞丑化；非人形按其设定检查。 |
| 禁止项 | 不用演员肖像、剧照、受保护画作作图生图源；正负提示词均不写演员名、画师名、游戏公司或具体改编作品名；人物名、原著书界名可用于定位，不作仿作要求。 |
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

### ch01 · 《天龙八部》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿碧 | `npc_abi` | 女 | 少年 / 青年 | A | [npc_abi.md](ch01-tianlong/npc_abi.md) | `por_npc_abi__ch01_youth_qinyun_base` | `assets/default/character/female/ch01/por_npc_abi__ch01_youth_qinyun_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 2 | 阿朱 | `npc_azhu` | 女 | 少年 / 青年 | S | [npc_azhu.md](ch01-tianlong/npc_azhu.md) | `por_npc_azhu__ch01_youth_alive_base` | `assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 3 | 阿紫 | `npc_azi` | 女 | 少年 / 青年 | S | [npc_azi.md](ch01-tianlong/npc_azi.md) | `por_npc_azi__ch01_youth_sighted_base` | `assets/default/character/female/ch01/por_npc_azi__ch01_youth_sighted_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 4 | 白世镜 | `npc_baishijing` | 男 | 壮年 | A | [npc_baishijing.md](ch01-tianlong/npc_baishijing.md) | `por_npc_baishijing__ch01_prime_xingzilin_base` | `assets/default/character/male/ch01/por_npc_baishijing__ch01_prime_xingzilin_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 5 | 包不同 | `npc_baobutong` | 男 | 壮年 | B | [npc_baobutong.md](ch01-tianlong/npc_baobutong.md) | `por_npc_baobutong__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_baobutong__ch01_prime_baseform_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 6 | 刀白凤 | `npc_daobaifeng` | 女 | 壮年 | A | [npc_daobaifeng.md](ch01-tianlong/npc_daobaifeng.md) | `por_npc_daobaifeng__ch01_prime_yuxu_base` | `assets/default/character/female/ch01/por_npc_daobaifeng__ch01_prime_yuxu_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 7 | 邓百川 | `npc_dengbaichuan` | 男 | 壮年 | B | [npc_dengbaichuan.md](ch01-tianlong/npc_dengbaichuan.md) | `por_npc_dengbaichuan__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_dengbaichuan__ch01_prime_baseform_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 8 | 丁春秋 | `npc_dingchunqiu` | 男 | 老年 | S | [npc_dingchunqiu.md](ch01-tianlong/npc_dingchunqiu.md) | `por_npc_dingchunqiu__ch01_elder_free_base` | `assets/default/character/male/ch01/por_npc_dingchunqiu__ch01_elder_free_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 9 | 段延庆 | `npc_duanyanqing` | 男 | 老年 | S | [npc_duanyanqing.md](ch01-tianlong/npc_duanyanqing.md) | `por_npc_duanyanqing__ch01_elder_disabled_base` | `assets/default/character/male/ch01/por_npc_duanyanqing__ch01_elder_disabled_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 10 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu.md](ch01-tianlong/npc_duanyu.md) | `por_npc_duanyu__ch01_youth_shizi_base` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_shizi_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 11 | 段正淳 | `npc_duanzhengchun` | 男 | 壮年 | A | [npc_duanzhengchun.md](ch01-tianlong/npc_duanzhengchun.md) | `por_npc_duanzhengchun__ch01_prime_wangye_base` | `assets/default/character/male/ch01/por_npc_duanzhengchun__ch01_prime_wangye_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 12 | 段正明 | `npc_duanzhengming` | 男 | 壮年 | A | [npc_duanzhengming.md](ch01-tianlong/npc_duanzhengming.md) | `por_npc_duanzhengming__ch01_prime_emperor_base` | `assets/default/character/male/ch01/por_npc_duanzhengming__ch01_prime_emperor_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 13 | 风波恶 | `npc_fengboe` | 男 | 壮年 | B | [npc_fengboe.md](ch01-tianlong/npc_fengboe.md) | `por_npc_fengboe__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_fengboe__ch01_prime_baseform_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 14 | 鸠摩智 | `npc_jiumozhi` | 男 | 壮年 | S | [npc_jiumozhi.md](ch01-tianlong/npc_jiumozhi.md) | `por_npc_jiumozhi__ch01_prime_guoshi_base` | `assets/default/character/male/ch01/por_npc_jiumozhi__ch01_prime_guoshi_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 15 | 枯荣大师 | `npc_kurong` | 男 | 老年 | A | [npc_kurong.md](ch01-tianlong/npc_kurong.md) | `por_npc_kurong__ch01_elder_hujing_base` | `assets/default/character/male/ch01/por_npc_kurong__ch01_elder_hujing_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 16 | 李秋水 | `npc_liqiushui` | 女 | 老年 | S | [npc_liqiushui.md](ch01-tianlong/npc_liqiushui.md) | `por_npc_liqiushui__ch01_elder_veiled_base` | `assets/default/character/female/ch01/por_npc_liqiushui__ch01_elder_veiled_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 17 | 慕容博 | `npc_murongbo` | 男 | 老年 | S | [npc_murongbo.md](ch01-tianlong/npc_murongbo.md) | `por_npc_murongbo__ch01_elder_revealed_base` | `assets/default/character/male/ch01/por_npc_murongbo__ch01_elder_revealed_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 18 | 慕容复 | `npc_murongfu` | 男 | 壮年 | S | [npc_murongfu.md](ch01-tianlong/npc_murongfu.md) | `por_npc_murongfu__ch01_prime_jiazhu_base` | `assets/default/character/male/ch01/por_npc_murongfu__ch01_prime_jiazhu_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 19 | 木婉清 | `npc_muwanqing` | 女 | 少年 / 青年 | A | [npc_muwanqing.md](ch01-tianlong/npc_muwanqing.md) | `por_npc_muwanqing__ch01_youth_unmasked_base` | `assets/default/character/female/ch01/por_npc_muwanqing__ch01_youth_unmasked_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 20 | 扫地僧 | `npc_saodiseng` | 男 | 老年 | A | [npc_saodiseng.md](ch01-tianlong/npc_saodiseng.md) | `por_npc_saodiseng__ch01_elder_cangjingge_base` | `assets/default/character/male/ch01/por_npc_saodiseng__ch01_elder_cangjingge_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 21 | 司空玄 | `npc_sikongxuan` | 男 | 壮年 | B | [npc_sikongxuan.md](ch01-tianlong/npc_sikongxuan.md) | `por_npc_sikongxuan__ch01_prime_wuliang_base` | `assets/default/character/male/ch01/por_npc_sikongxuan__ch01_prime_wuliang_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 22 | 苏星河 | `npc_suxinghe` | 男 | 老年 | A | [npc_suxinghe.md](ch01-tianlong/npc_suxinghe.md) | `por_npc_suxinghe__ch01_elder_zhenlong_base` | `assets/default/character/male/ch01/por_npc_suxinghe__ch01_elder_zhenlong_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 23 | 天山童姥 | `npc_tonglao` | 女 | 老年 | S | [npc_tonglao.md](ch01-tianlong/npc_tonglao.md) | `por_npc_tonglao__ch01_elder_rejuvenating_base` | `assets/default/character/female/ch01/por_npc_tonglao__ch01_elder_rejuvenating_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 24 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan.md](ch01-tianlong/npc_wangyuyan.md) | `por_npc_wangyuyan__ch01_youth_mantuo_base` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_mantuo_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 25 | 吴长风 | `npc_wuchangfeng` | 男 | 老年 | B | [npc_wuchangfeng.md](ch01-tianlong/npc_wuchangfeng.md) | `por_npc_wuchangfeng__ch01_elder_xingzilin_base` | `assets/default/character/male/ch01/por_npc_wuchangfeng__ch01_elder_xingzilin_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 26 | 无崖子 | `npc_wuyazi` | 男 | 老年 | A | [npc_wuyazi.md](ch01-tianlong/npc_wuyazi.md) | `por_npc_wuyazi__ch01_elder_pretransfer_base` | `assets/default/character/male/ch01/por_npc_wuyazi__ch01_elder_pretransfer_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 27 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng.md](ch01-tianlong/npc_xiaofeng.md) | `por_npc_xiaofeng__ch01_prime_gaibang_base` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 28 | 萧远山 | `npc_xiaoyuanshan` | 男 | 老年 | S | [npc_xiaoyuanshan.md](ch01-tianlong/npc_xiaoyuanshan.md) | `por_npc_xiaoyuanshan__ch01_elder_revealed_base` | `assets/default/character/male/ch01/por_npc_xiaoyuanshan__ch01_elder_revealed_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 29 | 辛双清 | `npc_xinshuangqing` | 女 | 壮年 | B | [npc_xinshuangqing.md](ch01-tianlong/npc_xinshuangqing.md) | `por_npc_xinshuangqing__ch01_prime_wuliang_base` | `assets/default/character/female/ch01/por_npc_xinshuangqing__ch01_prime_wuliang_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 30 | 玄慈 | `npc_xuanci` | 男 | 老年 | S | [npc_xuanci.md](ch01-tianlong/npc_xuanci.md) | `por_npc_xuanci__ch01_elder_fangzhang_base` | `assets/default/character/male/ch01/por_npc_xuanci__ch01_elder_fangzhang_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 31 | 薛慕华 | `npc_xuemuhua` | 男 | 壮年 | A | [npc_xuemuhua.md](ch01-tianlong/npc_xuemuhua.md) | `por_npc_xuemuhua__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_xuemuhua__ch01_prime_juxian_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 32 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu.md](ch01-tianlong/npc_xuzhu.md) | `por_npc_xuzhu__ch01_youth_lingjiu_base` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_lingjiu_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 33 | 叶二娘 | `npc_yeerniang` | 女 | 壮年 | A | [npc_yeerniang.md](ch01-tianlong/npc_yeerniang.md) | `por_npc_yeerniang__ch01_prime_prereunion_base` | `assets/default/character/female/ch01/por_npc_yeerniang__ch01_prime_prereunion_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 34 | 游骥 | `npc_youji` | 男 | 壮年 | A | [npc_youji.md](ch01-tianlong/npc_youji.md) | `por_npc_youji__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_youji__ch01_prime_juxian_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 35 | 游驹 | `npc_youju` | 男 | 壮年 | A | [npc_youju.md](ch01-tianlong/npc_youju.md) | `por_npc_youju__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_youju__ch01_prime_juxian_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 36 | 游坦之 | `npc_youtanzhi` | 男 | 少年 / 青年 | S | [npc_youtanzhi.md](ch01-tianlong/npc_youtanzhi.md) | `por_npc_youtanzhi__ch01_youth_ironmask_base` | `assets/default/character/male/ch01/por_npc_youtanzhi__ch01_youth_ironmask_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 37 | 岳老三 | `npc_yuelaosan` | 男 | 壮年 | A | [npc_yuelaosan.md](ch01-tianlong/npc_yuelaosan.md) | `por_npc_yuelaosan__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_yuelaosan__ch01_prime_baseform_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 38 | 云中鹤 | `npc_yunzhonghe` | 男 | 壮年 | A | [npc_yunzhonghe.md](ch01-tianlong/npc_yunzhonghe.md) | `por_npc_yunzhonghe__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_yunzhonghe__ch01_prime_baseform_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 39 | 钟灵 | `npc_zhongling` | 女 | 少年 / 青年 | A | [npc_zhongling.md](ch01-tianlong/npc_zhongling.md) | `por_npc_zhongling__ch01_youth_diaoalive_base` | `assets/default/character/female/ch01/por_npc_zhongling__ch01_youth_diaoalive_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 40 | 左子穆 | `npc_zuozimu` | 男 | 壮年 | B | [npc_zuozimu.md](ch01-tianlong/npc_zuozimu.md) | `por_npc_zuozimu__ch01_prime_wuliang_base` | `assets/default/character/male/ch01/por_npc_zuozimu__ch01_prime_wuliang_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |

### ch10 · 《白马啸西风》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿曼 | `npc_aman` | 女 | 少年 / 青年 | S | [npc_aman.md](ch10-baima/npc_aman.md) | `por_npc_aman__ch10_base` | `assets/default/character/female/ch10/por_npc_aman__ch10_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 2 | 车尔库 | `npc_cheerku` | 男 | 老年 | A | [npc_cheerku.md](ch10-baima/npc_cheerku.md) | `por_npc_cheerku__ch10_base` | `assets/default/character/male/ch10/por_npc_cheerku__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 3 | 陈达海 | `npc_chendahai` | 男 | 壮年 | S | [npc_chendahai.md](ch10-baima/npc_chendahai.md) | `por_npc_chendahai__ch10_prime_snownight_base` | `assets/default/character/male/ch10/por_npc_chendahai__ch10_prime_snownight_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 4 | 丁同 | `npc_dingtong` | 男 | 壮年 | B | [npc_dingtong.md](ch10-baima/npc_dingtong.md) | `por_npc_dingtong__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_dingtong__ch10_prime_prologue_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 5 | 段霜 | `npc_duanshuang10` | 男 | 少年 / 青年 | B | [npc_duanshuang10.md](ch10-baima/npc_duanshuang10.md) | `por_npc_duanshuang10__ch10_base` | `assets/default/character/male/ch10/por_npc_duanshuang10__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 6 | 哈卜拉姆 | `npc_habulamu` | 男 | 老年 | A | [npc_habulamu.md](ch10-baima/npc_habulamu.md) | `por_npc_habulamu__ch10_base` | `assets/default/character/male/ch10/por_npc_habulamu__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 7 | 韩禾 | `npc_hanhe10` | 男 | 少年 / 青年 | B | [npc_hanhe10.md](ch10-baima/npc_hanhe10.md) | `por_npc_hanhe10__ch10_base` | `assets/default/character/male/ch10/por_npc_hanhe10__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 8 | 霍元龙 | `npc_huoyuanlong` | 男 | 壮年 | S | [npc_huoyuanlong.md](ch10-baima/npc_huoyuanlong.md) | `por_npc_huoyuanlong__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_huoyuanlong__ch10_prime_prologue_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 9 | 白马李三 | `npc_lisan` | 男 | 壮年 | A | [npc_lisan.md](ch10-baima/npc_lisan.md) | `por_npc_lisan__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_lisan__ch10_prime_prologue_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 10 | 李文秀 | `npc_liwenxiu` | 女 | 少年 / 青年 | S | [npc_liwenxiu.md](ch10-baima/npc_liwenxiu.md) | `por_npc_liwenxiu__ch10_youth_astuo_base` | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_astuo_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 11 | 马家骏 | `npc_majiajun` | 男 | 老年 | S | [npc_majiajun.md](ch10-baima/npc_majiajun.md) | `por_npc_majiajun__ch10_elder_disguised_base` | `assets/default/character/male/ch10/por_npc_majiajun__ch10_elder_disguised_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 12 | 姓全的强人 | `npc_quanqiangdao` | 男 | 壮年 | B | [npc_quanqiangdao.md](ch10-baima/npc_quanqiangdao.md) | `por_npc_quanqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_quanqiangdao__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 13 | 桑斯儿 | `npc_sangsi` | 男 | 少年 / 青年 | A | [npc_sangsi.md](ch10-baima/npc_sangsi.md) | `por_npc_sangsi__ch10_base` | `assets/default/character/male/ch10/por_npc_sangsi__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 14 | 上官虹 | `npc_shangguanhong` | 女 | 少年 / 青年 | A | [npc_shangguanhong.md](ch10-baima/npc_shangguanhong.md) | `por_npc_shangguanhong__ch10_youth_prologue_base` | `assets/default/character/female/ch10/por_npc_shangguanhong__ch10_youth_prologue_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 15 | 沈青禾 | `npc_shenqinghe10` | 男 | 壮年 | A | [npc_shenqinghe10.md](ch10-baima/npc_shenqinghe10.md) | `por_npc_shenqinghe10__ch10_base` | `assets/default/character/male/ch10/por_npc_shenqinghe10__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 16 | 史仲俊 | `npc_shizhongjun` | 男 | 壮年 | A | [npc_shizhongjun.md](ch10-baima/npc_shizhongjun.md) | `por_npc_shizhongjun__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_shizhongjun__ch10_prime_prologue_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 17 | 姓宋的强人 | `npc_songqiangdao` | 男 | 壮年 | B | [npc_songqiangdao.md](ch10-baima/npc_songqiangdao.md) | `por_npc_songqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_songqiangdao__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 18 | 苏鲁克 | `npc_suluke` | 男 | 老年 | A | [npc_suluke.md](ch10-baima/npc_suluke.md) | `por_npc_suluke__ch10_base` | `assets/default/character/male/ch10/por_npc_suluke__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 19 | 苏普 | `npc_supu` | 男 | 少年 / 青年 | S | [npc_supu.md](ch10-baima/npc_supu.md) | `por_npc_supu__ch10_youth_base` | `assets/default/character/male/ch10/por_npc_supu__ch10_youth_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 20 | 瓦耳拉齐 | `npc_walazi` | 男 | 老年 | S | [npc_walazi.md](ch10-baima/npc_walazi.md) | `por_npc_walazi__ch10_elder_unmasked_base` | `assets/default/character/male/ch10/por_npc_walazi__ch10_elder_unmasked_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 21 | 姓云的强人 | `npc_yunqiangdao` | 男 | 壮年 | B | [npc_yunqiangdao.md](ch10-baima/npc_yunqiangdao.md) | `por_npc_yunqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_yunqiangdao__ch10_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |

### ch11 · 《鸳鸯刀》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 常长风 | `npc_changchangfeng` | 男 | 壮年 | A | [npc_changchangfeng.md](ch11-yuanyang/npc_changchangfeng.md) | `por_npc_changchangfeng__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_changchangfeng__ch11_prime_road_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 2 | 程墨 | `npc_chengmo11` | 男 | 少年 / 青年 | B | [npc_chengmo11.md](ch11-yuanyang/npc_chengmo11.md) | `por_npc_chengmo11__ch11_base` | `assets/default/character/male/ch11/por_npc_chengmo11__ch11_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 3 | 盖一鸣 | `npc_gaiyiming` | 男 | 壮年 | A | [npc_gaiyiming.md](ch11-yuanyang/npc_gaiyiming.md) | `por_npc_gaiyiming__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_gaiyiming__ch11_prime_road_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 4 | 何谦 | `npc_heqian11` | 男 | 少年 / 青年 | B | [npc_heqian11.md](ch11-yuanyang/npc_heqian11.md) | `por_npc_heqian11__ch11_base` | `assets/default/character/male/ch11/por_npc_heqian11__ch11_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 5 | 花剑影 | `npc_huajianying` | 男 | 壮年 | A | [npc_huajianying.md](ch11-yuanyang/npc_huajianying.md) | `por_npc_huajianying__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_huajianying__ch11_prime_road_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 6 | 林玉龙 | `npc_linyulong` | 男 | 少年 / 青年 | A | [npc_linyulong.md](ch11-yuanyang/npc_linyulong.md) | `por_npc_linyulong__ch11_youth_road_base` | `assets/default/character/male/ch11/por_npc_linyulong__ch11_youth_road_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 7 | 刘於义 | `npc_liuyuyi` | 男 | 老年 | A | [npc_liuyuyi.md](ch11-yuanyang/npc_liuyuyi.md) | `por_npc_liuyuyi__ch11_base` | `assets/default/character/male/ch11/por_npc_liuyuyi__ch11_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 8 | 鲁忱 | `npc_luchen11` | 男 | 壮年 | B | [npc_luchen11.md](ch11-yuanyang/npc_luchen11.md) | `por_npc_luchen11__ch11_base` | `assets/default/character/male/ch11/por_npc_luchen11__ch11_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 9 | 罗宁 | `npc_luoning11` | 男 | 壮年 | A | [npc_luoning11.md](ch11-yuanyang/npc_luoning11.md) | `por_npc_luoning11__ch11_base` | `assets/default/character/male/ch11/por_npc_luoning11__ch11_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 10 | 任飞燕 | `npc_renfeiyan` | 女 | 少年 / 青年 | A | [npc_renfeiyan.md](ch11-yuanyang/npc_renfeiyan.md) | `por_npc_renfeiyan__ch11_youth_road_base` | `assets/default/character/female/ch11/por_npc_renfeiyan__ch11_youth_road_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 11 | 石望 | `npc_shiwang11` | 男 | 壮年 | A | [npc_shiwang11.md](ch11-yuanyang/npc_shiwang11.md) | `por_npc_shiwang11__ch11_base` | `assets/default/character/male/ch11/por_npc_shiwang11__ch11_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 12 | 萧半和 | `npc_xiaobanhe` | 男 | 老年 | S | [npc_xiaobanhe.md](ch11-yuanyang/npc_xiaobanhe.md) | `por_npc_xiaobanhe__ch11_elder_birthday_base` | `assets/default/character/male/ch11/por_npc_xiaobanhe__ch11_elder_birthday_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 13 | 逍遥子 | `npc_xiaoyaozi11` | 男 | 壮年 | A | [npc_xiaoyaozi11.md](ch11-yuanyang/npc_xiaoyaozi11.md) | `por_npc_xiaoyaozi11__ch11_prime_road_base` | `assets/default/character/male/ch11/por_npc_xiaoyaozi11__ch11_prime_road_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 14 | 萧中慧 | `npc_xiaozhonghui` | 女 | 少年 / 青年 | S | [npc_xiaozhonghui.md](ch11-yuanyang/npc_xiaozhonghui.md) | `por_npc_xiaozhonghui__ch11_youth_departure_base` | `assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_departure_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 15 | 杨夫人 | `npc_yangfuren` | 女 | 壮年 | A | [npc_yangfuren.md](ch11-yuanyang/npc_yangfuren.md) | `por_npc_yangfuren__ch11_base` | `assets/default/character/female/ch11/por_npc_yangfuren__ch11_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 16 | 严和 | `npc_yanhe11` | 男 | 壮年 | B | [npc_yanhe11.md](ch11-yuanyang/npc_yanhe11.md) | `por_npc_yanhe11__ch11_base` | `assets/default/character/male/ch11/por_npc_yanhe11__ch11_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 17 | 袁夫人 | `npc_yuanfuren` | 女 | 壮年 | A | [npc_yuanfuren.md](ch11-yuanyang/npc_yuanfuren.md) | `por_npc_yuanfuren__ch11_prime_reunion_base` | `assets/default/character/female/ch11/por_npc_yuanfuren__ch11_prime_reunion_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 18 | 袁冠南 | `npc_yuanguannan` | 男 | 少年 / 青年 | S | [npc_yuanguannan.md](ch11-yuanyang/npc_yuanguannan.md) | `por_npc_yuanguannan__ch11_youth_scholar_base` | `assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scholar_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 19 | 周威信 | `npc_zhouweixin` | 男 | 壮年 | A | [npc_zhouweixin.md](ch11-yuanyang/npc_zhouweixin.md) | `por_npc_zhouweixin__ch11_base` | `assets/default/character/male/ch11/por_npc_zhouweixin__ch11_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 20 | 卓天雄 | `npc_zhuotianxiong` | 男 | 老年 | S | [npc_zhuotianxiong.md](ch11-yuanyang/npc_zhuotianxiong.md) | `por_npc_zhuotianxiong__ch11_elder_feignedblind_base` | `assets/default/character/male/ch11/por_npc_zhuotianxiong__ch11_elder_feignedblind_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |

### 主角与书灵

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 书灵·抽象墨影 | `npc_shuling` | 其他 | 壮年 | S | [npc_shuling.md](protagonist/npc_shuling.md) | `por_npc_shuling__ch00_base` | `assets/default/character/other/ch00/por_npc_shuling__ch00_base.png` | ready |
| 2 | 主角（女）· 春秋末·越国 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch00.md](protagonist/npc_zhujue__f_ch00.md) | `por_npc_zhujue__ch00_f_base` | `assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png` | ready；已生成（英雄重绘宽松candidate，待最终审核） |
| 3 | 主角（女）· 北宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch01.md](protagonist/npc_zhujue__f_ch01.md) | `por_npc_zhujue__ch01_f_base` | `assets/default/character/female/ch01/por_npc_zhujue__ch01_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 4 | 主角（女）· 南宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch02.md](protagonist/npc_zhujue__f_ch02.md) | `por_npc_zhujue__ch02_f_base` | `assets/default/character/female/ch02/por_npc_zhujue__ch02_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 5 | 主角（女）· 南宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch03.md](protagonist/npc_zhujue__f_ch03.md) | `por_npc_zhujue__ch03_f_base` | `assets/default/character/female/ch03/por_npc_zhujue__ch03_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 6 | 主角（女）· 元末 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch04.md](protagonist/npc_zhujue__f_ch04.md) | `por_npc_zhujue__ch04_f_base` | `assets/default/character/female/ch04/por_npc_zhujue__ch04_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 7 | 主角（女）· 明中叶 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch05.md](protagonist/npc_zhujue__f_ch05.md) | `por_npc_zhujue__ch05_f_base` | `assets/default/character/female/ch05/por_npc_zhujue__ch05_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 8 | 主角（女）· 明代 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch06.md](protagonist/npc_zhujue__f_ch06.md) | `por_npc_zhujue__ch06_f_base` | `assets/default/character/female/ch06/por_npc_zhujue__ch06_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 9 | 主角（女）· 明末 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch07.md](protagonist/npc_zhujue__f_ch07.md) | `por_npc_zhujue__ch07_f_base` | `assets/default/character/female/ch07/por_npc_zhujue__ch07_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 10 | 主角（女）· 清初·康熙 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch08.md](protagonist/npc_zhujue__f_ch08.md) | `por_npc_zhujue__ch08_f_base` | `assets/default/character/female/ch08/por_npc_zhujue__ch08_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 11 | 主角（女）· 本作清初·康熙 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch09.md](protagonist/npc_zhujue__f_ch09.md) | `por_npc_zhujue__ch09_f_base` | `assets/default/character/female/ch09/por_npc_zhujue__ch09_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 12 | 主角（女）· 本作清初·回疆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch10.md](protagonist/npc_zhujue__f_ch10.md) | `por_npc_zhujue__ch10_f_base` | `assets/default/character/female/ch10/por_npc_zhujue__ch10_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 13 | 主角（女）· 清乾隆初 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch11.md](protagonist/npc_zhujue__f_ch11.md) | `por_npc_zhujue__ch11_f_base` | `assets/default/character/female/ch11/por_npc_zhujue__ch11_f_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 14 | 主角（女）· 清乾隆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch12.md](protagonist/npc_zhujue__f_ch12.md) | `por_npc_zhujue__ch12_f_base` | `assets/default/character/female/ch12/por_npc_zhujue__ch12_f_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 15 | 主角（女）· 清乾隆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch13.md](protagonist/npc_zhujue__f_ch13.md) | `por_npc_zhujue__ch13_f_base` | `assets/default/character/female/ch13/por_npc_zhujue__ch13_f_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 16 | 主角（女）· 清乾隆·雪地 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch14.md](protagonist/npc_zhujue__f_ch14.md) | `por_npc_zhujue__ch14_f_base` | `assets/default/character/female/ch14/por_npc_zhujue__ch14_f_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 17 | 主角（男）· 春秋末·越国 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch00.md](protagonist/npc_zhujue__m_ch00.md) | `por_npc_zhujue__ch00_m_base` | `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 18 | 主角（男）· 北宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch01.md](protagonist/npc_zhujue__m_ch01.md) | `por_npc_zhujue__ch01_m_base` | `assets/default/character/male/ch01/por_npc_zhujue__ch01_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 19 | 主角（男）· 南宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch02.md](protagonist/npc_zhujue__m_ch02.md) | `por_npc_zhujue__ch02_m_base` | `assets/default/character/male/ch02/por_npc_zhujue__ch02_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 20 | 主角（男）· 南宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch03.md](protagonist/npc_zhujue__m_ch03.md) | `por_npc_zhujue__ch03_m_base` | `assets/default/character/male/ch03/por_npc_zhujue__ch03_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 21 | 主角（男）· 元末 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch04.md](protagonist/npc_zhujue__m_ch04.md) | `por_npc_zhujue__ch04_m_base` | `assets/default/character/male/ch04/por_npc_zhujue__ch04_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 22 | 主角（男）· 明中叶 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch05.md](protagonist/npc_zhujue__m_ch05.md) | `por_npc_zhujue__ch05_m_base` | `assets/default/character/male/ch05/por_npc_zhujue__ch05_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 23 | 主角（男）· 明代 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch06.md](protagonist/npc_zhujue__m_ch06.md) | `por_npc_zhujue__ch06_m_base` | `assets/default/character/male/ch06/por_npc_zhujue__ch06_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 24 | 主角（男）· 明末 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch07.md](protagonist/npc_zhujue__m_ch07.md) | `por_npc_zhujue__ch07_m_base` | `assets/default/character/male/ch07/por_npc_zhujue__ch07_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 25 | 主角（男）· 清初·康熙 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch08.md](protagonist/npc_zhujue__m_ch08.md) | `por_npc_zhujue__ch08_m_base` | `assets/default/character/male/ch08/por_npc_zhujue__ch08_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 26 | 主角（男）· 本作清初·康熙 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch09.md](protagonist/npc_zhujue__m_ch09.md) | `por_npc_zhujue__ch09_m_base` | `assets/default/character/male/ch09/por_npc_zhujue__ch09_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 27 | 主角（男）· 本作清初·回疆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch10.md](protagonist/npc_zhujue__m_ch10.md) | `por_npc_zhujue__ch10_m_base` | `assets/default/character/male/ch10/por_npc_zhujue__ch10_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 28 | 主角（男）· 清乾隆初 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch11.md](protagonist/npc_zhujue__m_ch11.md) | `por_npc_zhujue__ch11_m_base` | `assets/default/character/male/ch11/por_npc_zhujue__ch11_m_base.png` | ready；已生成（candidate，按作者新指示宽松自查可用，待最终审核） |
| 29 | 主角（男）· 清乾隆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch12.md](protagonist/npc_zhujue__m_ch12.md) | `por_npc_zhujue__ch12_m_base` | `assets/default/character/male/ch12/por_npc_zhujue__ch12_m_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 30 | 主角（男）· 清乾隆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch13.md](protagonist/npc_zhujue__m_ch13.md) | `por_npc_zhujue__ch13_m_base` | `assets/default/character/male/ch13/por_npc_zhujue__ch13_m_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 31 | 主角（男）· 清乾隆·雪地 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch14.md](protagonist/npc_zhujue__m_ch14.md) | `por_npc_zhujue__ch14_m_base` | `assets/default/character/male/ch14/por_npc_zhujue__ch14_m_base.png` | ready；已生成（人物写实修正candidate，待最终审核） |

## 主角经典场景变体

本节独立于上述112份基础立绘；完成标记只在PNG与manifest验证后更新。五场以不同scene_key计数，同场候选不重复计数。

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| 场景 | 萧峰 · 松鹤楼·豪饮识英雄 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_songhelou_wine.md](ch01-tianlong/npc_xiaofeng__scene_songhelou_wine.md) | `por_npc_xiaofeng__ch01_prime_scene_songhelou_wine` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_songhelou_wine.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 萧峰 · 杏子林·释权辞帮 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_xingzilin_departure.md](ch01-tianlong/npc_xiaofeng__scene_xingzilin_departure.md) | `por_npc_xiaofeng__ch01_prime_scene_xingzilin_departure` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_xingzilin_departure.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 萧峰 · 聚贤庄·孤身护人 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_juxianzhuang_guard.md](ch01-tianlong/npc_xiaofeng__scene_juxianzhuang_guard.md) | `por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 萧峰 · 少室山·降龙护人 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_shaoshi_dragon_palm.md](ch01-tianlong/npc_xiaofeng__scene_shaoshi_dragon_palm.md) | `por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 萧峰 · 雁门关·举箭止战 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_yanmen_raise_broken_arrow.md](ch01-tianlong/npc_xiaofeng__scene_yanmen_raise_broken_arrow.md) | `por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow.png` | ready；技术阻塞（image_gen输入审核self-harm，无图未完成） |
| 场景 | 段誉 · 无量初游·青衫折扇 | `npc_duanyu` | 男 | 青年 | S | [npc_duanyu__scene_wuliang_fan.md](ch01-tianlong/npc_duanyu__scene_wuliang_fan.md) | `por_npc_duanyu__ch01_youth_scene_wuliang_fan` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_wuliang_fan.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 段誉 · 琅嬛玉洞·展卷初悟 | `npc_duanyu` | 男 | 青年 | S | [npc_duanyu__scene_langhuan_scroll.md](ch01-tianlong/npc_duanyu__scene_langhuan_scroll.md) | `por_npc_duanyu__ch01_youth_scene_langhuan_scroll` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_langhuan_scroll.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 萧峰 · 北地行猎·林间寻踪 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng__scene_northern_forest_hunt.md](ch01-tianlong/npc_xiaofeng__scene_northern_forest_hunt.md) | `por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 段誉 · 无量山道·凌波脱险 | `npc_duanyu` | 男 | 青年 | S | [npc_duanyu__scene_lingbo_escape.md](ch01-tianlong/npc_duanyu__scene_lingbo_escape.md) | `por_npc_duanyu__ch01_youth_scene_lingbo_escape` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_lingbo_escape.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 段誉 · 天龙寺·碧烟悟剑 | `npc_duanyu` | 男 | 青年 | S | [npc_duanyu__scene_tianlongtemple_first_sword.md](ch01-tianlong/npc_duanyu__scene_tianlongtemple_first_sword.md) | `por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 段誉 · 少室山·无形剑锋 | `npc_duanyu` | 男 | 青年 | S | [npc_duanyu__scene_shaoshi_invisible_sword.md](ch01-tianlong/npc_duanyu__scene_shaoshi_invisible_sword.md) | `por_npc_duanyu__ch01_youth_scene_shaoshi_invisible_sword` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_shaoshi_invisible_sword.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 虚竹 · 珍珑破局·无心一着 | `npc_xuzhu` | 男 | 青年 | S | [npc_xuzhu__scene_zhenlong_unintended_move.md](ch01-tianlong/npc_xuzhu__scene_zhenlong_unintended_move.md) | `por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 虚竹 · 传功出屋·骤承逍遥 | `npc_xuzhu` | 男 | 青年 | S | [npc_xuzhu__scene_xiaoyao_inheritance.md](ch01-tianlong/npc_xuzhu__scene_xiaoyao_inheritance.md) | `por_npc_xuzhu__ch01_youth_scene_xiaoyao_inheritance` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_xiaoyao_inheritance.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 虚竹 · 冰窖习艺·静心凝掌 | `npc_xuzhu` | 男 | 青年 | S | [npc_xuzhu__scene_icecellar_practice.md](ch01-tianlong/npc_xuzhu__scene_icecellar_practice.md) | `por_npc_xuzhu__ch01_youth_scene_icecellar_practice` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_icecellar_practice.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 虚竹 · 灵鹫解厄·以仁释缚 | `npc_xuzhu` | 男 | 青年 | S | [npc_xuzhu__scene_lingjiu_compassion.md](ch01-tianlong/npc_xuzhu__scene_lingjiu_compassion.md) | `por_npc_xuzhu__ch01_youth_scene_lingjiu_compassion` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_lingjiu_compassion.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 虚竹 · 少室山·薄冰降魔 | `npc_xuzhu` | 男 | 青年 | S | [npc_xuzhu__scene_shaoshi_thin_ice.md](ch01-tianlong/npc_xuzhu__scene_shaoshi_thin_ice.md) | `por_npc_xuzhu__ch01_youth_scene_shaoshi_thin_ice` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_shaoshi_thin_ice.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 郭靖 · 大漠弯弓·一箭双雕 | `npc_guojing` | 男 | 青年 | S | [npc_guojing__scene_grassland_double_eagle.md](ch02-shediao/npc_guojing__scene_grassland_double_eagle.md) | `por_npc_guojing__ch02_youth_scene_grassland_double_eagle` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_grassland_double_eagle.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 郭靖 · 江南初授·亢龙有悔 | `npc_guojing` | 男 | 青年 | S | [npc_guojing__scene_first_dragon_palm_lesson.md](ch02-shediao/npc_guojing__scene_first_dragon_palm_lesson.md) | `por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 郭靖 · 桃花岛学艺·左右方圆 | `npc_guojing` | 男 | 青年 | S | [npc_guojing__scene_peach_island_square_circle.md](ch02-shediao/npc_guojing__scene_peach_island_square_circle.md) | `por_npc_guojing__ch02_youth_scene_peach_island_square_circle` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_peach_island_square_circle.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 郭靖 · 华山论剑·厚重掌势 | `npc_guojing` | 男 | 青年 | S | [npc_guojing__scene_second_huashan_palm.md](ch02-shediao/npc_guojing__scene_second_huashan_palm.md) | `por_npc_guojing__ch02_youth_scene_second_huashan_palm` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_second_huashan_palm.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 郭靖 · 漠北论英雄 | `npc_guojing` | 男 | 青年 | S | [npc_guojing__scene_northern_camp_hero_discourse.md](ch02-shediao/npc_guojing__scene_northern_camp_hero_discourse.md) | `por_npc_guojing__ch02_youth_scene_northern_camp_hero_discourse` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_northern_camp_hero_discourse.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 杨过 · 大胜关·少年扬威 | `npc_yangguo` | 男 | 青年 | S | [npc_yangguo__scene_dashengguan_youth_bamboo_staff.md](ch03-shendiao/npc_yangguo__scene_dashengguan_youth_bamboo_staff.md) | `por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 杨过 · 剑冢山洪·神雕重剑 | `npc_yangguo` | 男 | 青年 | S | [npc_yangguo__scene_torrent_heavy_sword_condor.md](ch03-shendiao/npc_yangguo__scene_torrent_heavy_sword_condor.md) | `por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 杨过 · 重阳宫·重剑护龙 | `npc_yangguo` | 男 | 青年 | S | [npc_yangguo__scene_chongyang_palace_rescue.md](ch03-shendiao/npc_yangguo__scene_chongyang_palace_rescue.md) | `por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 杨过 · 十六年后·谷底重逢 | `npc_yangguo` | 男 | 壮年 | S | [npc_yangguo__scene_sixteen_years_valley_reunion.md](ch03-shendiao/npc_yangguo__scene_sixteen_years_valley_reunion.md) | `por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 杨过 · 襄阳高台·黯然救襄 | `npc_yangguo` | 男 | 壮年 | S | [npc_yangguo__scene_xiangyang_platform_rescue_palm.md](ch03-shendiao/npc_yangguo__scene_xiangyang_platform_rescue_palm.md) | `por_npc_yangguo__ch03_prime_scene_xiangyang_platform_rescue_palm` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_prime_scene_xiangyang_platform_rescue_palm.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 王语嫣 · 曼陀初见·茶花回眸 | `npc_wangyuyan` | 女 | 青年 | S | [npc_wangyuyan__scene_mantuo_camellia.md](ch01-tianlong/npc_wangyuyan__scene_mantuo_camellia.md) | `por_npc_wangyuyan__ch01_youth_scene_mantuo_camellia` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_mantuo_camellia.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 王语嫣 · 听香水榭·辨招明理 | `npc_wangyuyan` | 女 | 青年 | S | [npc_wangyuyan__scene_tingxiang_discernment.md](ch01-tianlong/npc_wangyuyan__scene_tingxiang_discernment.md) | `por_npc_wangyuyan__ch01_youth_scene_tingxiang_discernment` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_tingxiang_discernment.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 王语嫣 · 碾坊避雨·赠钗求衣 | `npc_wangyuyan` | 女 | 青年 | S | [npc_wangyuyan__scene_mill_hairpin_exchange.md](ch01-tianlong/npc_wangyuyan__scene_mill_hairpin_exchange.md) | `por_npc_wangyuyan__ch01_youth_scene_mill_hairpin_exchange` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_mill_hairpin_exchange.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 王语嫣 · 少室观战·出言止剑 | `npc_wangyuyan` | 女 | 青年 | S | [npc_wangyuyan__scene_shaoshi_plea.md](ch01-tianlong/npc_wangyuyan__scene_shaoshi_plea.md) | `por_npc_wangyuyan__ch01_youth_scene_shaoshi_plea` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_shaoshi_plea.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 王语嫣 · 枯井相知·泥中明心 | `npc_wangyuyan` | 女 | 青年 | S | [npc_wangyuyan__scene_well_self_choice.md](ch01-tianlong/npc_wangyuyan__scene_well_self_choice.md) | `por_npc_wangyuyan__ch01_youth_scene_well_self_choice` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_scene_well_self_choice.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 黄蓉 · 小乞丐·初入江湖 | `npc_huangrong` | 女 | 青年 | S | [npc_huangrong__scene_young_beggar_disguise.md](ch02-shediao/npc_huangrong__scene_young_beggar_disguise.md) | `por_npc_huangrong__ch02_youth_scene_young_beggar_disguise` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_young_beggar_disguise.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 黄蓉 · 巧烹佳肴·结缘七公 | `npc_huangrong` | 女 | 青年 | S | [npc_huangrong__scene_cooking_meets_hongqigong.md](ch02-shediao/npc_huangrong__scene_cooking_meets_hongqigong.md) | `por_npc_huangrong__ch02_youth_scene_cooking_meets_hongqigong` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_cooking_meets_hongqigong.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 黄蓉 · 君山轩辕台·执棒定帮争 | `npc_huangrong` | 女 | 青年 | S | [npc_huangrong__scene_junshan_beggar_leader.md](ch02-shediao/npc_huangrong__scene_junshan_beggar_leader.md) | `por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 黄蓉 · 一灯山居·疗铁掌伤 | `npc_huangrong` | 女 | 青年 | S | [npc_huangrong__scene_yideng_heals_iron_palm_wound.md](ch02-shediao/npc_huangrong__scene_yideng_heals_iron_palm_wound.md) | `por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 黄蓉 · 铁枪庙中·揭破真凶 | `npc_huangrong` | 女 | 青年 | S | [npc_huangrong__scene_iron_spear_temple_truth.md](ch02-shediao/npc_huangrong__scene_iron_spear_temple_truth.md) | `por_npc_huangrong__ch02_youth_scene_iron_spear_temple_truth` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_iron_spear_temple_truth.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 小龙女 · 古墓授艺·天罗雀影 | `npc_xiaolongnv` | 女 | 青年 | S | [npc_xiaolongnv__scene_ancient_tomb_sparrow_lesson.md](ch03-shendiao/npc_xiaolongnv__scene_ancient_tomb_sparrow_lesson.md) | `por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 小龙女 · 大胜关·金铃迎敌 | `npc_xiaolongnv` | 女 | 青年 | S | [npc_xiaolongnv__scene_dashengguan_silk_bells.md](ch03-shendiao/npc_xiaolongnv__scene_dashengguan_silk_bells.md) | `por_npc_xiaolongnv__ch03_youth_scene_dashengguan_silk_bells` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_dashengguan_silk_bells.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 小龙女 · 重阳宫·双剑御敌 | `npc_xiaolongnv` | 女 | 青年 | S | [npc_xiaolongnv__scene_chongyang_two_sword_combat.md](ch03-shendiao/npc_xiaolongnv__scene_chongyang_two_sword_combat.md) | `por_npc_xiaolongnv__ch03_youth_scene_chongyang_two_sword_combat` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_chongyang_two_sword_combat.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 小龙女 · 断肠崖·十六年留约 | `npc_xiaolongnv` | 女 | 青年 | S | [npc_xiaolongnv__scene_heartbreak_cliff_sixteen_year_promise.md](ch03-shendiao/npc_xiaolongnv__scene_heartbreak_cliff_sixteen_year_promise.md) | `por_npc_xiaolongnv__ch03_youth_scene_heartbreak_cliff_sixteen_year_promise` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_heartbreak_cliff_sixteen_year_promise.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 小龙女 · 绝情谷底·玉蜂寄讯 | `npc_xiaolongnv` | 女 | 青年 | S | [npc_xiaolongnv__scene_valley_jade_bee_message.md](ch03-shendiao/npc_xiaolongnv__scene_valley_jade_bee_message.md) | `por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 张无忌 · 幽谷九阳 | `npc_zhangwuji` | 男 | 青年 | S | [npc_zhangwuji__scene_jiuyang.md](ch04-yitian/npc_zhangwuji__scene_jiuyang.md) | `por_npc_zhangwuji__ch04_youth_scene_jiuyang` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_jiuyang.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 张无忌 · 光明顶止戈 | `npc_zhangwuji` | 男 | 青年 | S | [npc_zhangwuji__scene_guangmingding.md](ch04-yitian/npc_zhangwuji__scene_guangmingding.md) | `por_npc_zhangwuji__ch04_youth_scene_guangmingding` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_guangmingding.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 张无忌 · 武当木剑 | `npc_zhangwuji` | 男 | 青年 | S | [npc_zhangwuji__scene_taiji.md](ch04-yitian/npc_zhangwuji__scene_taiji.md) | `por_npc_zhangwuji__ch04_youth_scene_taiji` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_taiji.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 张无忌 · 万安塔下救人 | `npc_zhangwuji` | 男 | 青年 | S | [npc_zhangwuji__scene_wanansi.md](ch04-yitian/npc_zhangwuji__scene_wanansi.md) | `por_npc_zhangwuji__ch04_youth_scene_wanansi` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_wanansi.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 张无忌 · 三松之前 | `npc_zhangwuji` | 男 | 青年 | S | [npc_zhangwuji__scene_sandu.md](ch04-yitian/npc_zhangwuji__scene_sandu.md) | `por_npc_zhangwuji__ch04_youth_scene_sandu` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_scene_sandu.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 赵敏 · 绿柳邀客 | `npc_zhaomin` | 女 | 青年 | S | [npc_zhaomin__scene_lvliu.md](ch04-yitian/npc_zhaomin__scene_lvliu.md) | `por_npc_zhaomin__ch04_youth_scene_lvliu` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_lvliu.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 赵敏 · 武当殿前对阵 | `npc_zhaomin` | 女 | 青年 | S | [npc_zhaomin__scene_wudang.md](ch04-yitian/npc_zhaomin__scene_wudang.md) | `por_npc_zhaomin__ch04_youth_scene_wudang` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_wudang.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 赵敏 · 万安寺观剑 | `npc_zhaomin` | 女 | 青年 | S | [npc_zhaomin__scene_wanansi.md](ch04-yitian/npc_zhaomin__scene_wanansi.md) | `por_npc_zhaomin__ch04_youth_scene_wanansi` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_wanansi.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 赵敏 · 大都小酒肆 | `npc_zhaomin` | 女 | 青年 | S | [npc_zhaomin__scene_jiusi.md](ch04-yitian/npc_zhaomin__scene_jiusi.md) | `por_npc_zhaomin__ch04_youth_scene_jiusi` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_jiusi.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 赵敏 · 濠州执发阻婚 | `npc_zhaomin` | 女 | 青年 | S | [npc_zhaomin__scene_haozhou.md](ch04-yitian/npc_zhaomin__scene_haozhou.md) | `por_npc_zhaomin__ch04_youth_scene_haozhou` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_haozhou.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 周芷若 · 汉水一碗饭 | `npc_zhouzhiruo` | 女 | 童年 | S | [npc_zhouzhiruo__scene_hanshui.md](ch04-yitian/npc_zhouzhiruo__scene_hanshui.md) | `por_npc_zhouzhiruo__ch04_child_scene_hanshui` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_child_scene_hanshui.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 周芷若 · 光明顶奉师命 | `npc_zhouzhiruo` | 女 | 青年 | S | [npc_zhouzhiruo__scene_guangmingding.md](ch04-yitian/npc_zhouzhiruo__scene_guangmingding.md) | `por_npc_zhouzhiruo__ch04_youth_scene_guangmingding` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_guangmingding.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 周芷若 · 高塔承重誓 | `npc_zhouzhiruo` | 女 | 青年 | S | [npc_zhouzhiruo__scene_wanansi.md](ch04-yitian/npc_zhouzhiruo__scene_wanansi.md) | `por_npc_zhouzhiruo__ch04_youth_scene_wanansi` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_wanansi.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 周芷若 · 喜堂裂红裳 | `npc_zhouzhiruo` | 女 | 青年 | S | [npc_zhouzhiruo__scene_hongshang.md](ch04-yitian/npc_zhouzhiruo__scene_hongshang.md) | `por_npc_zhouzhiruo__ch04_youth_scene_hongshang` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_hongshang.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 周芷若 · 少林长鞭 | `npc_zhouzhiruo` | 女 | 青年 | S | [npc_zhouzhiruo__scene_shaolin.md](ch04-yitian/npc_zhouzhiruo__scene_shaolin.md) | `por_npc_zhouzhiruo__ch04_youth_scene_shaolin` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_scene_shaolin.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 令狐冲 · 思过崖领剑意 | `npc_linghuchong` | 男 | 青年 | S | [npc_linghuchong__scene_siguoya.md](ch05-xiaoao/npc_linghuchong__scene_siguoya.md) | `por_npc_linghuchong__ch05_youth_scene_siguoya` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_siguoya.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 令狐冲 · 绿竹巷初学琴 | `npc_linghuchong` | 男 | 青年 | S | [npc_linghuchong__scene_luoyang.md](ch05-xiaoao/npc_linghuchong__scene_luoyang.md) | `por_npc_linghuchong__ch05_youth_scene_luoyang` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_luoyang.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 令狐冲 · 西湖地牢得诀 | `npc_linghuchong` | 男 | 青年 | S | [npc_linghuchong__scene_meizhuang_prison.md](ch05-xiaoao/npc_linghuchong__scene_meizhuang_prison.md) | `por_npc_linghuchong__ch05_youth_scene_meizhuang_prison` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_meizhuang_prison.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 令狐冲 · 北岳接掌门户 | `npc_linghuchong` | 男 | 青年 | S | [npc_linghuchong__scene_hengshan.md](ch05-xiaoao/npc_linghuchong__scene_hengshan.md) | `por_npc_linghuchong__ch05_youth_scene_hengshan` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_hengshan.png` | ready；待生成（经典场景candidate） |
| 场景 | 令狐冲 · 梅庄琴声归自在 | `npc_linghuchong` | 男 | 青年 | S | [npc_linghuchong__scene_quxie.md](ch05-xiaoao/npc_linghuchong__scene_quxie.md) | `por_npc_linghuchong__ch05_youth_scene_quxie` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_scene_quxie.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 任盈盈 · 竹帘后的琴音 | `npc_renyingying` | 女 | 青年 | S | [npc_renyingying__scene_zhuxiang.md](ch05-xiaoao/npc_renyingying__scene_zhuxiang.md) | `por_npc_renyingying__ch05_youth_scene_zhuxiang` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_zhuxiang.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 任盈盈 · 少林山门求医 | `npc_renyingying` | 女 | 青年 | S | [npc_renyingying__scene_shaolin.md](ch05-xiaoao/npc_renyingying__scene_shaolin.md) | `por_npc_renyingying__ch05_youth_scene_shaolin` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_shaolin.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 任盈盈 · 黑木崖决断 | `npc_renyingying` | 女 | 青年 | S | [npc_renyingying__scene_heimuya.md](ch05-xiaoao/npc_renyingying__scene_heimuya.md) | `por_npc_renyingying__ch05_youth_scene_heimuya` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_heimuya.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 任盈盈 · 恒山止战 | `npc_renyingying` | 女 | 青年 | S | [npc_renyingying__scene_hengshan.md](ch05-xiaoao/npc_renyingying__scene_hengshan.md) | `por_npc_renyingying__ch05_youth_scene_hengshan` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_hengshan.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 任盈盈 · 梅庄箫声 | `npc_renyingying` | 女 | 青年 | S | [npc_renyingying__scene_quxie.md](ch05-xiaoao/npc_renyingying__scene_quxie.md) | `por_npc_renyingying__ch05_youth_scene_quxie` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_scene_quxie.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 石破天 · 烧饼里的玄铁令 | `npc_shipotian` | 男 | 童年 | S | [npc_shipotian__scene_xuantie.md](ch06-xiake/npc_shipotian__scene_xuantie.md) | `por_npc_shipotian__ch06_child_scene_xuantie` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_child_scene_xuantie.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 石破天 · 摩天崖泥偶 | `npc_shipotian` | 男 | 青年 | S | [npc_shipotian__scene_motianya.md](ch06-xiake/npc_shipotian__scene_motianya.md) | `por_npc_shipotian__ch06_youth_scene_motianya` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_motianya.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 石破天 · 紫烟岛学刀 | `npc_shipotian` | 男 | 青年 | S | [npc_shipotian__scene_jinwu.md](ch06-xiake/npc_shipotian__scene_jinwu.md) | `por_npc_shipotian__ch06_youth_scene_jinwu` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_jinwu.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 石破天 · 侠客岛一碗粥 | `npc_shipotian` | 男 | 青年 | S | [npc_shipotian__scene_labazhou.md](ch06-xiake/npc_shipotian__scene_labazhou.md) | `por_npc_shipotian__ch06_youth_scene_labazhou` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_labazhou.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 石破天 · 石壁会意 | `npc_shipotian` | 男 | 青年 | S | [npc_shipotian__scene_taixuan.md](ch06-xiake/npc_shipotian__scene_taixuan.md) | `por_npc_shipotian__ch06_youth_scene_taixuan` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_scene_taixuan.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 阿绣 · 紫烟岛识真心 | `npc_axiu` | 女 | 青年 | S | [npc_axiu__scene_ziyan.md](ch06-xiake/npc_axiu__scene_ziyan.md) | `por_npc_axiu__ch06_youth_scene_ziyan` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_ziyan.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 阿绣 · 柴刀教留余地 | `npc_axiu` | 女 | 青年 | S | [npc_axiu__scene_pangqiao.md](ch06-xiake/npc_axiu__scene_pangqiao.md) | `por_npc_axiu__ch06_youth_scene_pangqiao` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_pangqiao.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 阿绣 · 凌霄城守剑 | `npc_axiu` | 女 | 青年 | S | [npc_axiu__scene_lingxiao.md](ch06-xiake/npc_axiu__scene_lingxiao.md) | `por_npc_axiu__ch06_youth_scene_lingxiao` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_lingxiao.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 阿绣 · 海滨送行 | `npc_axiu` | 女 | 青年 | S | [npc_axiu__scene_songhai.md](ch06-xiake/npc_axiu__scene_songhai.md) | `por_npc_axiu__ch06_youth_scene_songhai` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_songhai.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 阿绣 · 归航重见天光 | `npc_axiu` | 女 | 青年 | S | [npc_axiu__scene_guihang.md](ch06-xiake/npc_axiu__scene_guihang.md) | `por_npc_axiu__ch06_youth_scene_guihang` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_scene_guihang.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 袁承志 · 华山少年习武 | `npc_yuanchengzhi` | 男 | 童年 | S | [npc_yuanchengzhi__scene_huashan.md](ch07-bixue/npc_yuanchengzhi__scene_huashan.md) | `por_npc_yuanchengzhi__ch07_child_scene_huashan` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_child_scene_huashan.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 袁承志 · 金蛇遗剑 | `npc_yuanchengzhi` | 男 | 青年 | S | [npc_yuanchengzhi__scene_jinshedong.md](ch07-bixue/npc_yuanchengzhi__scene_jinshedong.md) | `por_npc_yuanchengzhi__ch07_youth_scene_jinshedong` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 袁承志 · 泰山会盟 | `npc_yuanchengzhi` | 男 | 青年 | S | [npc_yuanchengzhi__scene_taishan.md](ch07-bixue/npc_yuanchengzhi__scene_taishan.md) | `por_npc_yuanchengzhi__ch07_youth_scene_taishan` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_taishan.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 袁承志 · 盛京宫墙夜行 | `npc_yuanchengzhi` | 男 | 青年 | S | [npc_yuanchengzhi__scene_shengjing.md](ch07-bixue/npc_yuanchengzhi__scene_shengjing.md) | `por_npc_yuanchengzhi__ch07_youth_scene_shengjing` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_shengjing.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 袁承志 · 去国扬帆 | `npc_yuanchengzhi` | 男 | 青年 | S | [npc_yuanchengzhi__scene_quguo.md](ch07-bixue/npc_yuanchengzhi__scene_quguo.md) | `por_npc_yuanchengzhi__ch07_youth_scene_quguo` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_quguo.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 温青青 · 花坡男装吹箫 | `npc_wenqingqing` | 女 | 青年 | S | [npc_wenqingqing__scene_yuexiao.md](ch07-bixue/npc_wenqingqing__scene_yuexiao.md) | `por_npc_wenqingqing__ch07_youth_scene_yuexiao` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_yuexiao.png` | ready；已生成（人物写实修正candidate，待最终审核） |
| 场景 | 温青青 · 石梁失母 | `npc_wenqingqing` | 女 | 青年 | S | [npc_wenqingqing__scene_shiliang.md](ch07-bixue/npc_wenqingqing__scene_shiliang.md) | `por_npc_wenqingqing__ch07_youth_scene_shiliang` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_shiliang.png` | ready；待生成（经典场景candidate） |


## 全人物基础立绘补齐（2026-10-01）

本节仅追加已核对的基础提示词；保留上文所有历史和完成状态。导入不代表PNG已生成，不提高基线或输出审批状态。每项按最新人物写实/背景水墨及宽松自查规范执行。

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| 补齐 | 包惜弱 | `npc_baoxiruo` | 女 | 壮年 | A | [npc_baoxiruo.md](ch02-shediao/npc_baoxiruo.md) | `por_npc_baoxiruo__ch02_prime_base` | `assets/default/character/female/ch02/por_npc_baoxiruo__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 陈玄风 | `npc_chenxuanfeng` | 男 | 壮年 | S | [npc_chenxuanfeng.md](ch02-shediao/npc_chenxuanfeng.md) | `por_npc_chenxuanfeng__ch02_prime_flashback_base` | `assets/default/character/male/ch02/por_npc_chenxuanfeng__ch02_prime_flashback_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 点苍渔隐 | `npc_diancangyuyin` | 男 | 老年 | A | [npc_diancangyuyin.md](ch02-shediao/npc_diancangyuyin.md) | `por_npc_diancangyuyin__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_diancangyuyin__ch02_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 郭靖 | `npc_guojing` | 男 | 青年 | S | [npc_guojing.md](ch02-shediao/npc_guojing.md) | `por_npc_guojing__ch02_youth_base` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 韩宝驹 | `npc_hanbaoju` | 男 | 壮年 | A | [npc_hanbaoju.md](ch02-shediao/npc_hanbaoju.md) | `por_npc_hanbaoju__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_hanbaoju__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 韩小莹 | `npc_hanxiaoying` | 女 | 壮年 | A | [npc_hanxiaoying.md](ch02-shediao/npc_hanxiaoying.md) | `por_npc_hanxiaoying__ch02_prime_base` | `assets/default/character/female/ch02/por_npc_hanxiaoying__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 洪七公 | `npc_hongqigong` | 男 | 老年 | S | [npc_hongqigong.md](ch02-shediao/npc_hongqigong.md) | `por_npc_hongqigong__ch02_elder_bangzhu_base` | `assets/default/character/male/ch02/por_npc_hongqigong__ch02_elder_bangzhu_base.png` | ready；用户主动延期（跳过洪七公，以后修）；现有candidate与九指待修记录保留，未计合格完成 |
| 补齐 | 黄蓉 | `npc_huangrong` | 女 | 青年 | S | [npc_huangrong.md](ch02-shediao/npc_huangrong.md) | `por_npc_huangrong__ch02_youth_bangzhu_base` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_bangzhu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 黄药师 | `npc_huangyaoshi` | 男 | 老年 | S | [npc_huangyaoshi.md](ch02-shediao/npc_huangyaoshi.md) | `por_npc_huangyaoshi__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_huangyaoshi__ch02_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 华筝 | `npc_huazheng` | 女 | 青年 | A | [npc_huazheng.md](ch02-shediao/npc_huazheng.md) | `por_npc_huazheng__ch02_youth_base` | `assets/default/character/female/ch02/por_npc_huazheng__ch02_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 柯镇恶 | `npc_kezhene` | 男 | 老年 | A | [npc_kezhene.md](ch02-shediao/npc_kezhene.md) | `por_npc_kezhene__ch02_elder_blind_base` | `assets/default/character/male/ch02/por_npc_kezhene__ch02_elder_blind_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陆乘风 | `npc_luchengfeng` | 男 | 壮年 | A | [npc_luchengfeng.md](ch02-shediao/npc_luchengfeng.md) | `por_npc_luchengfeng__ch02_prime_disabled_base` | `assets/default/character/male/ch02/por_npc_luchengfeng__ch02_prime_disabled_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 陆冠英 | `npc_luguanying` | 男 | 青年 | A | [npc_luguanying.md](ch02-shediao/npc_luguanying.md) | `por_npc_luguanying__ch02_youth_base` | `assets/default/character/male/ch02/por_npc_luguanying__ch02_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 鲁有脚 | `npc_luyoujiao` | 男 | 壮年 | A | [npc_luyoujiao.md](ch02-shediao/npc_luyoujiao.md) | `por_npc_luyoujiao__ch02_prime_zhanglao_base` | `assets/default/character/male/ch02/por_npc_luyoujiao__ch02_prime_zhanglao_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 马钰 | `npc_mayu` | 男 | 老年 | A | [npc_mayu.md](ch02-shediao/npc_mayu.md) | `por_npc_mayu__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_mayu__ch02_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 梅超风 | `npc_meichaofeng` | 女 | 壮年 | S | [npc_meichaofeng.md](ch02-shediao/npc_meichaofeng.md) | `por_npc_meichaofeng__ch02_prime_blind_base` | `assets/default/character/female/ch02/por_npc_meichaofeng__ch02_prime_blind_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 穆念慈 | `npc_munianci` | 女 | 青年 | A | [npc_munianci.md](ch02-shediao/npc_munianci.md) | `por_npc_munianci__ch02_youth_base` | `assets/default/character/female/ch02/por_npc_munianci__ch02_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 南希仁 | `npc_nanxiren` | 男 | 壮年 | A | [npc_nanxiren.md](ch02-shediao/npc_nanxiren.md) | `por_npc_nanxiren__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_nanxiren__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 欧阳锋 | `npc_ouyangfeng` | 男 | 老年 | S | [npc_ouyangfeng.md](ch02-shediao/npc_ouyangfeng.md) | `por_npc_ouyangfeng__ch02_elder_sane_base` | `assets/default/character/male/ch02/por_npc_ouyangfeng__ch02_elder_sane_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 欧阳克 | `npc_ouyangke` | 男 | 青年 | A | [npc_ouyangke.md](ch02-shediao/npc_ouyangke.md) | `por_npc_ouyangke__ch02_youth_uninjured_base` | `assets/default/character/male/ch02/por_npc_ouyangke__ch02_youth_uninjured_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 樵子 | `npc_qiaozi` | 男 | 老年 | A | [npc_qiaozi.md](ch02-shediao/npc_qiaozi.md) | `por_npc_qiaozi__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_qiaozi__ch02_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 丘处机 | `npc_qiuchuji` | 男 | 老年 | A | [npc_qiuchuji.md](ch02-shediao/npc_qiuchuji.md) | `por_npc_qiuchuji__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_qiuchuji__ch02_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 裘千仞 | `npc_qiuqianren` | 男 | 老年 | S | [npc_qiuqianren.md](ch02-shediao/npc_qiuqianren.md) | `por_npc_qiuqianren__ch02_elder_tiezhang_base` | `assets/default/character/male/ch02/por_npc_qiuqianren__ch02_elder_tiezhang_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 全金发 | `npc_quanjinfa` | 男 | 壮年 | A | [npc_quanjinfa.md](ch02-shediao/npc_quanjinfa.md) | `por_npc_quanjinfa__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_quanjinfa__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 铁木真 | `npc_tiemuzhen` | 男 | 老年 | A | [npc_tiemuzhen.md](ch02-shediao/npc_tiemuzhen.md) | `por_npc_tiemuzhen__ch02_elder_khan_base` | `assets/default/character/male/ch02/por_npc_tiemuzhen__ch02_elder_khan_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 拖雷 | `npc_tuolei` | 男 | 壮年 | A | [npc_tuolei.md](ch02-shediao/npc_tuolei.md) | `por_npc_tuolei__ch02_prime_xizheng_base` | `assets/default/character/male/ch02/por_npc_tuolei__ch02_prime_xizheng_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 王处一 | `npc_wangchuyi` | 男 | 老年 | A | [npc_wangchuyi.md](ch02-shediao/npc_wangchuyi.md) | `por_npc_wangchuyi__ch02_elder_recovered_base` | `assets/default/character/male/ch02/por_npc_wangchuyi__ch02_elder_recovered_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 完颜洪烈 | `npc_wanyanhonglie` | 男 | 壮年 | A | [npc_wanyanhonglie.md](ch02-shediao/npc_wanyanhonglie.md) | `por_npc_wanyanhonglie__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_wanyanhonglie__ch02_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 杨康 | `npc_yangkang` | 男 | 青年 | S | [npc_yangkang.md](ch02-shediao/npc_yangkang.md) | `por_npc_yangkang__ch02_youth_wangfu_base` | `assets/default/character/male/ch02/por_npc_yangkang__ch02_youth_wangfu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 杨妙真 | `npc_yangmiaozhen` | 女 | 壮年 | A | [npc_yangmiaozhen.md](ch02-shediao/npc_yangmiaozhen.md) | `por_npc_yangmiaozhen__ch02_prime_base` | `assets/default/character/female/ch02/por_npc_yangmiaozhen__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 杨铁心 | `npc_yangtiexin` | 男 | 壮年 | A | [npc_yangtiexin.md](ch02-shediao/npc_yangtiexin.md) | `por_npc_yangtiexin__ch02_prime_muyi_base` | `assets/default/character/male/ch02/por_npc_yangtiexin__ch02_prime_muyi_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 一灯大师 | `npc_yideng` | 男 | 老年 | S | [npc_yideng.md](ch02-shediao/npc_yideng.md) | `por_npc_yideng__ch02_elder_monk_base` | `assets/default/character/male/ch02/por_npc_yideng__ch02_elder_monk_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 张阿生 | `npc_zhangasheng` | 男 | 壮年 | A | [npc_zhangasheng.md](ch02-shediao/npc_zhangasheng.md) | `por_npc_zhangasheng__ch02_prime_flashback_base` | `assets/default/character/male/ch02/por_npc_zhangasheng__ch02_prime_flashback_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 哲别 | `npc_zhebie` | 男 | 壮年 | A | [npc_zhebie.md](ch02-shediao/npc_zhebie.md) | `por_npc_zhebie__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_zhebie__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 周伯通 | `npc_zhoubotong` | 男 | 老年 | S | [npc_zhoubotong.md](ch02-shediao/npc_zhoubotong.md) | `por_npc_zhoubotong__ch02_elder_base` | `assets/default/character/male/ch02/por_npc_zhoubotong__ch02_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 朱聪 | `npc_zhucong` | 男 | 壮年 | A | [npc_zhucong.md](ch02-shediao/npc_zhucong.md) | `por_npc_zhucong__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_zhucong__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 朱子柳 | `npc_zhuziliu` | 男 | 壮年 | A | [npc_zhuziliu.md](ch02-shediao/npc_zhuziliu.md) | `por_npc_zhuziliu__ch02_prime_base` | `assets/default/character/male/ch02/por_npc_zhuziliu__ch02_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 程英 | `npc_chengying` | 女 | 青年 | A | [npc_chengying.md](ch03-shendiao/npc_chengying.md) | `por_npc_chengying__ch03_youth_unmasked_base` | `assets/default/character/female/ch03/por_npc_chengying__ch03_youth_unmasked_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 达尔巴 | `npc_daerba` | 男 | 壮年 | A | [npc_daerba.md](ch03-shendiao/npc_daerba.md) | `por_npc_daerba__ch03_prime_base` | `assets/default/character/male/ch03/por_npc_daerba__ch03_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 樊一翁 | `npc_fanyiweng` | 男 | 老年 | A | [npc_fanyiweng.md](ch03-shendiao/npc_fanyiweng.md) | `por_npc_fanyiweng__ch03_elder_longbeard_base` | `assets/default/character/male/ch03/por_npc_fanyiweng__ch03_elder_longbeard_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 冯默风 | `npc_fengmofeng` | 男 | 老年 | A | [npc_fengmofeng.md](ch03-shendiao/npc_fengmofeng.md) | `por_npc_fengmofeng__ch03_elder_lame_base` | `assets/default/character/male/ch03/por_npc_fengmofeng__ch03_elder_lame_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 公孙绿萼 | `npc_gongsunlve` | 女 | 青年 | A | [npc_gongsunlve.md](ch03-shendiao/npc_gongsunlve.md) | `por_npc_gongsunlve__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_gongsunlve__ch03_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 公孙止 | `npc_gongsunzhi` | 男 | 壮年 | S | [npc_gongsunzhi.md](ch03-shendiao/npc_gongsunzhi.md) | `por_npc_gongsunzhi__ch03_prime_twoeyes_base` | `assets/default/character/male/ch03/por_npc_gongsunzhi__ch03_prime_twoeyes_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 郭芙 | `npc_guofu` | 女 | 青年 | A | [npc_guofu.md](ch03-shendiao/npc_guofu.md) | `por_npc_guofu__ch03_youth_preinjury_base` | `assets/default/character/female/ch03/por_npc_guofu__ch03_youth_preinjury_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 郭靖 | `npc_guojing` | 男 | 壮年 | S | [npc_guojing.md](ch03-shendiao/npc_guojing.md) | `por_npc_guojing__ch03_prime_base` | `assets/default/character/male/ch03/por_npc_guojing__ch03_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 郭襄 | `npc_guoxiang` | 女 | 青年 | S | [npc_guoxiang.md](ch03-shendiao/npc_guoxiang.md) | `por_npc_guoxiang__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_guoxiang__ch03_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 洪七公 | `npc_hongqigong` | 男 | 老年 | A | [npc_hongqigong.md](ch03-shendiao/npc_hongqigong.md) | `por_npc_hongqigong__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_hongqigong__ch03_elder_base.png` | ready；用户主动延期（跳过洪七公，以后修）；未生成，不计完成 |
| 补齐 | 黄蓉 | `npc_huangrong` | 女 | 壮年 | S | [npc_huangrong.md](ch03-shendiao/npc_huangrong.md) | `por_npc_huangrong__ch03_prime_base` | `assets/default/character/female/ch03/por_npc_huangrong__ch03_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 黄药师 | `npc_huangyaoshi` | 男 | 老年 | A | [npc_huangyaoshi.md](ch03-shendiao/npc_huangyaoshi.md) | `por_npc_huangyaoshi__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_huangyaoshi__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 霍都 | `npc_huodu` | 男 | 壮年 | A | [npc_huodu.md](ch03-shendiao/npc_huodu.md) | `por_npc_huodu__ch03_prime_prince_base` | `assets/default/character/male/ch03/por_npc_huodu__ch03_prime_prince_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 金轮法王 | `npc_jinlunfawang` | 男 | 老年 | S | [npc_jinlunfawang.md](ch03-shendiao/npc_jinlunfawang.md) | `por_npc_jinlunfawang__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_jinlunfawang__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 觉远 | `npc_jueyuan` | 男 | 老年 | A | [npc_jueyuan.md](ch03-shendiao/npc_jueyuan.md) | `por_npc_jueyuan__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_jueyuan__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 李莫愁 | `npc_limochou` | 女 | 壮年 | S | [npc_limochou.md](ch03-shendiao/npc_limochou.md) | `por_npc_limochou__ch03_prime_base` | `assets/default/character/female/ch03/por_npc_limochou__ch03_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 陆无双 | `npc_luwushuang` | 女 | 青年 | A | [npc_luwushuang.md](ch03-shendiao/npc_luwushuang.md) | `por_npc_luwushuang__ch03_youth_lame_base` | `assets/default/character/female/ch03/por_npc_luwushuang__ch03_youth_lame_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 欧阳锋 | `npc_ouyangfeng` | 男 | 老年 | A | [npc_ouyangfeng.md](ch03-shendiao/npc_ouyangfeng.md) | `por_npc_ouyangfeng__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_ouyangfeng__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 裘千尺 | `npc_qiuqianchi` | 女 | 老年 | A | [npc_qiuqianchi.md](ch03-shendiao/npc_qiuqianchi.md) | `por_npc_qiuqianchi__ch03_elder_disabled_base` | `assets/default/character/female/ch03/por_npc_qiuqianchi__ch03_elder_disabled_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 慈恩（裘千仞） | `npc_qiuqianren` | 男 | 老年 | A | [npc_qiuqianren.md](ch03-shendiao/npc_qiuqianren.md) | `por_npc_qiuqianren__ch03_elder_cien_base` | `assets/default/character/male/ch03/por_npc_qiuqianren__ch03_elder_cien_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 完颜萍 | `npc_wanyanping` | 女 | 青年 | A | [npc_wanyanping.md](ch03-shendiao/npc_wanyanping.md) | `por_npc_wanyanping__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_wanyanping__ch03_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 武敦儒 | `npc_wudunru` | 男 | 青年 | B | [npc_wudunru.md](ch03-shendiao/npc_wudunru.md) | `por_npc_wudunru__ch03_youth_base` | `assets/default/character/male/ch03/por_npc_wudunru__ch03_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 武三通 | `npc_wusantong` | 男 | 老年 | A | [npc_wusantong.md](ch03-shendiao/npc_wusantong.md) | `por_npc_wusantong__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_wusantong__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 武修文 | `npc_wuxiuwen` | 男 | 青年 | B | [npc_wuxiuwen.md](ch03-shendiao/npc_wuxiuwen.md) | `por_npc_wuxiuwen__ch03_youth_base` | `assets/default/character/male/ch03/por_npc_wuxiuwen__ch03_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 小龙女 | `npc_xiaolongnv` | 女 | 青年 | S | [npc_xiaolongnv.md](ch03-shendiao/npc_xiaolongnv.md) | `por_npc_xiaolongnv__ch03_youth_jueqing_base` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_jueqing_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 潇湘子 | `npc_xiaoxiangzi` | 男 | 老年 | A | [npc_xiaoxiangzi.md](ch03-shendiao/npc_xiaoxiangzi.md) | `por_npc_xiaoxiangzi__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_xiaoxiangzi__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 杨过 | `npc_yangguo` | 男 | 青年 | S | [npc_yangguo.md](ch03-shendiao/npc_yangguo.md) | `por_npc_yangguo__ch03_youth_onearm_base` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_onearm_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 耶律齐 | `npc_yelvqi` | 男 | 青年 | A | [npc_yelvqi.md](ch03-shendiao/npc_yelvqi.md) | `por_npc_yelvqi__ch03_youth_preleader_base` | `assets/default/character/male/ch03/por_npc_yelvqi__ch03_youth_preleader_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 耶律燕 | `npc_yelvyan` | 女 | 青年 | B | [npc_yelvyan.md](ch03-shendiao/npc_yelvyan.md) | `por_npc_yelvyan__ch03_youth_base` | `assets/default/character/female/ch03/por_npc_yelvyan__ch03_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 一灯大师 | `npc_yideng` | 男 | 老年 | A | [npc_yideng.md](ch03-shendiao/npc_yideng.md) | `por_npc_yideng__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_yideng__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 张君宝 | `npc_zhangsanfeng` | 男 | 青年 | A | [npc_zhangsanfeng.md](ch03-shendiao/npc_zhangsanfeng.md) | `por_npc_zhangsanfeng__ch03_youth_base` | `assets/default/character/male/ch03/por_npc_zhangsanfeng__ch03_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周伯通 | `npc_zhoubotong` | 男 | 老年 | A | [npc_zhoubotong.md](ch03-shendiao/npc_zhoubotong.md) | `por_npc_zhoubotong__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_zhoubotong__ch03_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 朱子柳 | `npc_zhuziliu` | 男 | 老年 | A | [npc_zhuziliu.md](ch03-shendiao/npc_zhuziliu.md) | `por_npc_zhuziliu__ch03_elder_base` | `assets/default/character/male/ch03/por_npc_zhuziliu__ch03_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 阿三 | `npc_asan` | 男 | 壮年 | A | [npc_asan.md](ch04-yitian/npc_asan.md) | `por_npc_asan__ch04_prime_wudang_base` | `assets/default/character/male/ch04/por_npc_asan__ch04_prime_wudang_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 常遇春 | `npc_changyuchun` | 男 | 壮年 | A | [npc_changyuchun.md](ch04-yitian/npc_changyuchun.md) | `por_npc_changyuchun__ch04_prime_general_base` | `assets/default/character/male/ch04/por_npc_changyuchun__ch04_prime_general_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 成昆 | `npc_chengkun` | 男 | 老年 | S | [npc_chengkun.md](ch04-yitian/npc_chengkun.md) | `por_npc_chengkun__ch04_elder_yuanzhen_base` | `assets/default/character/male/ch04/por_npc_chengkun__ch04_elder_yuanzhen_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 黛绮丝 | `npc_daiqisi` | 女 | 壮年 | S | [npc_daiqisi.md](ch04-yitian/npc_daiqisi.md) | `por_npc_daiqisi__ch04_prime_jinhua_base` | `assets/default/character/female/ch04/por_npc_daiqisi__ch04_prime_jinhua_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 渡厄 | `npc_duee` | 男 | 老年 | S | [npc_duee.md](ch04-yitian/npc_duee.md) | `por_npc_duee__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_duee__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 渡劫 | `npc_dujie` | 男 | 老年 | S | [npc_dujie.md](ch04-yitian/npc_dujie.md) | `por_npc_dujie__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_dujie__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 渡难 | `npc_dunan` | 男 | 老年 | S | [npc_dunan.md](ch04-yitian/npc_dunan.md) | `por_npc_dunan__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_dunan__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 范遥 | `npc_fanyao` | 男 | 壮年 | A | [npc_fanyao.md](ch04-yitian/npc_fanyao.md) | `por_npc_fanyao__ch04_prime_kutoutuo_base` | `assets/default/character/male/ch04/por_npc_fanyao__ch04_prime_kutoutuo_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 鹤笔翁 | `npc_hebiweng` | 男 | 老年 | S | [npc_hebiweng.md](ch04-yitian/npc_hebiweng.md) | `por_npc_hebiweng__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_hebiweng__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 辉月使 | `npc_huiyueshi` | 女 | 壮年 | S | [npc_huiyueshi.md](ch04-yitian/npc_huiyueshi.md) | `por_npc_huiyueshi__ch04_prime_base` | `assets/default/character/female/ch04/por_npc_huiyueshi__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 空闻 | `npc_kongwen` | 男 | 老年 | A | [npc_kongwen.md](ch04-yitian/npc_kongwen.md) | `por_npc_kongwen__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_kongwen__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 空性 | `npc_kongxing` | 男 | 老年 | A | [npc_kongxing.md](ch04-yitian/npc_kongxing.md) | `por_npc_kongxing__ch04_elder_guangmingding_base` | `assets/default/character/male/ch04/por_npc_kongxing__ch04_elder_guangmingding_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 空智 | `npc_kongzhi` | 男 | 老年 | A | [npc_kongzhi.md](ch04-yitian/npc_kongzhi.md) | `por_npc_kongzhi__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_kongzhi__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 流云使 | `npc_liuyunshi` | 男 | 壮年 | S | [npc_liuyunshi.md](ch04-yitian/npc_liuyunshi.md) | `por_npc_liuyunshi__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_liuyunshi__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 鹿杖客 | `npc_luzhangke` | 男 | 老年 | S | [npc_luzhangke.md](ch04-yitian/npc_luzhangke.md) | `por_npc_luzhangke__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_luzhangke__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 妙风使 | `npc_miaofengshi` | 男 | 壮年 | S | [npc_miaofengshi.md](ch04-yitian/npc_miaofengshi.md) | `por_npc_miaofengshi__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_miaofengshi__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 灭绝师太 | `npc_miejueshitai` | 女 | 老年 | S | [npc_miejueshitai.md](ch04-yitian/npc_miejueshitai.md) | `por_npc_miejueshitai__ch04_elder_yitian_base` | `assets/default/character/female/ch04/por_npc_miejueshitai__ch04_elder_yitian_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 彭莹玉 | `npc_pengyingyu` | 男 | 壮年 | A | [npc_pengyingyu.md](ch04-yitian/npc_pengyingyu.md) | `por_npc_pengyingyu__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_pengyingyu__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 宋青书 | `npc_songqingshu` | 男 | 青年 | A | [npc_songqingshu.md](ch04-yitian/npc_songqingshu.md) | `por_npc_songqingshu__ch04_youth_wudang_base` | `assets/default/character/male/ch04/por_npc_songqingshu__ch04_youth_wudang_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 宋远桥 | `npc_songyuanqiao` | 男 | 壮年 | A | [npc_songyuanqiao.md](ch04-yitian/npc_songyuanqiao.md) | `por_npc_songyuanqiao__ch04_prime_shouyan_base` | `assets/default/character/male/ch04/por_npc_songyuanqiao__ch04_prime_shouyan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 王保保 | `npc_wangbaobao` | 男 | 壮年 | S | [npc_wangbaobao.md](ch04-yitian/npc_wangbaobao.md) | `por_npc_wangbaobao__ch04_prime_commander_base` | `assets/default/character/male/ch04/por_npc_wangbaobao__ch04_prime_commander_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 韦一笑 | `npc_weiyixiao` | 男 | 壮年 | A | [npc_weiyixiao.md](ch04-yitian/npc_weiyixiao.md) | `por_npc_weiyixiao__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_weiyixiao__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 小昭 | `npc_xiaozhao` | 女 | 青年 | S | [npc_xiaozhao.md](ch04-yitian/npc_xiaozhao.md) | `por_npc_xiaozhao__ch04_youth_chained_base` | `assets/default/character/female/ch04/por_npc_xiaozhao__ch04_youth_chained_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 谢逊 | `npc_xiexun` | 男 | 老年 | S | [npc_xiexun.md](ch04-yitian/npc_xiexun.md) | `por_npc_xiexun__ch04_elder_blind_base` | `assets/default/character/male/ch04/por_npc_xiexun__ch04_elder_blind_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 徐达 | `npc_xuda` | 男 | 壮年 | A | [npc_xuda.md](ch04-yitian/npc_xuda.md) | `por_npc_xuda__ch04_prime_general_base` | `assets/default/character/male/ch04/por_npc_xuda__ch04_prime_general_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 杨逍 | `npc_yangxiao` | 男 | 壮年 | A | [npc_yangxiao.md](ch04-yitian/npc_yangxiao.md) | `por_npc_yangxiao__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_yangxiao__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 殷离 | `npc_yinli` | 女 | 青年 | S | [npc_yinli.md](ch04-yitian/npc_yinli.md) | `por_npc_yinli__ch04_youth_disfigured_base` | `assets/default/character/female/ch04/por_npc_yinli__ch04_youth_disfigured_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 殷素素 | `npc_yinsusu` | 女 | 壮年 | S | [npc_yinsusu.md](ch04-yitian/npc_yinsusu.md) | `por_npc_yinsusu__ch04_prime_ziwei_base` | `assets/default/character/female/ch04/por_npc_yinsusu__ch04_prime_ziwei_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 殷天正 | `npc_yintianzheng` | 男 | 老年 | A | [npc_yintianzheng.md](ch04-yitian/npc_yintianzheng.md) | `por_npc_yintianzheng__ch04_elder_base` | `assets/default/character/male/ch04/por_npc_yintianzheng__ch04_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 俞岱岩 | `npc_yudaiyan` | 男 | 壮年 | A | [npc_yudaiyan.md](ch04-yitian/npc_yudaiyan.md) | `por_npc_yudaiyan__ch04_prime_injured_base` | `assets/default/character/male/ch04/por_npc_yudaiyan__ch04_prime_injured_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 俞莲舟 | `npc_yulianzhou` | 男 | 壮年 | A | [npc_yulianzhou.md](ch04-yitian/npc_yulianzhou.md) | `por_npc_yulianzhou__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_yulianzhou__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 张翠山 | `npc_zhangcuishan` | 男 | 壮年 | S | [npc_zhangcuishan.md](ch04-yitian/npc_zhangcuishan.md) | `por_npc_zhangcuishan__ch04_prime_wangpanshan_base` | `assets/default/character/male/ch04/por_npc_zhangcuishan__ch04_prime_wangpanshan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 张三丰 | `npc_zhangsanfeng` | 男 | 老年 | S | [npc_zhangsanfeng.md](ch04-yitian/npc_zhangsanfeng.md) | `por_npc_zhangsanfeng__ch04_elder_taiji_base` | `assets/default/character/male/ch04/por_npc_zhangsanfeng__ch04_elder_taiji_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 张无忌 | `npc_zhangwuji` | 男 | 青年 | S | [npc_zhangwuji.md](ch04-yitian/npc_zhangwuji.md) | `por_npc_zhangwuji__ch04_youth_jiaozhu_base` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_jiaozhu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 赵敏 | `npc_zhaomin` | 女 | 青年 | S | [npc_zhaomin.md](ch04-yitian/npc_zhaomin.md) | `por_npc_zhaomin__ch04_youth_lvliu_base` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_lvliu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周颠 | `npc_zhoudian` | 男 | 壮年 | A | [npc_zhoudian.md](ch04-yitian/npc_zhoudian.md) | `por_npc_zhoudian__ch04_prime_base` | `assets/default/character/male/ch04/por_npc_zhoudian__ch04_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 周芷若 | `npc_zhouzhiruo` | 女 | 青年 | S | [npc_zhouzhiruo.md](ch04-yitian/npc_zhouzhiruo.md) | `por_npc_zhouzhiruo__ch04_youth_zhangmen_base` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_zhangmen_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 朱元璋 | `npc_zhuyuanzhang` | 男 | 壮年 | A | [npc_zhuyuanzhang.md](ch04-yitian/npc_zhuyuanzhang.md) | `por_npc_zhuyuanzhang__ch04_prime_rebel_base` | `assets/default/character/male/ch04/por_npc_zhuyuanzhang__ch04_prime_rebel_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 冲虚道长 | `npc_chongxu` | 男 | 老年 | A | [npc_chongxu.md](ch05-xiaoao/npc_chongxu.md) | `por_npc_chongxu__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_chongxu__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 定闲师太 | `npc_dingxian` | 女 | 老年 | A | [npc_dingxian.md](ch05-xiaoao/npc_dingxian.md) | `por_npc_dingxian__ch05_elder_base` | `assets/default/character/female/ch05/por_npc_dingxian__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 东方不败 | `npc_dongfangbubai` | 男 | 壮年 | S | [npc_dongfangbubai.md](ch05-xiaoao/npc_dongfangbubai.md) | `por_npc_dongfangbubai__ch05_prime_heimuya_base` | `assets/default/character/male/ch05/por_npc_dongfangbubai__ch05_prime_heimuya_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 方生 | `npc_fangsheng` | 男 | 老年 | A | [npc_fangsheng.md](ch05-xiaoao/npc_fangsheng.md) | `por_npc_fangsheng__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_fangsheng__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 方证大师 | `npc_fangzheng` | 男 | 老年 | A | [npc_fangzheng.md](ch05-xiaoao/npc_fangzheng.md) | `por_npc_fangzheng__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_fangzheng__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 风清扬 | `npc_fengqingyang` | 男 | 老年 | A | [npc_fengqingyang.md](ch05-xiaoao/npc_fengqingyang.md) | `por_npc_fengqingyang__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_fengqingyang__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 蓝凤凰 | `npc_lanfenghuang` | 女 | 青年 | S | [npc_lanfenghuang.md](ch05-xiaoao/npc_lanfenghuang.md) | `por_npc_lanfenghuang__ch05_youth_base` | `assets/default/character/female/ch05/por_npc_lanfenghuang__ch05_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 老头子 | `npc_laotouzi` | 男 | 老年 | A | [npc_laotouzi.md](ch05-xiaoao/npc_laotouzi.md) | `por_npc_laotouzi__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_laotouzi__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 令狐冲 | `npc_linghuchong` | 男 | 青年 | S | [npc_linghuchong.md](ch05-xiaoao/npc_linghuchong.md) | `por_npc_linghuchong__ch05_youth_huashan_base` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_huashan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 林平之 | `npc_linpingzhi` | 男 | 青年 | S | [npc_linpingzhi.md](ch05-xiaoao/npc_linpingzhi.md) | `por_npc_linpingzhi__ch05_youth_fuwei_base` | `assets/default/character/male/ch05/por_npc_linpingzhi__ch05_youth_fuwei_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 刘正风 | `npc_liuzhengfeng` | 男 | 壮年 | A | [npc_liuzhengfeng.md](ch05-xiaoao/npc_liuzhengfeng.md) | `por_npc_liuzhengfeng__ch05_prime_before_ceremony_base` | `assets/default/character/male/ch05/por_npc_liuzhengfeng__ch05_prime_before_ceremony_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 莫大先生 | `npc_moda` | 男 | 老年 | S | [npc_moda.md](ch05-xiaoao/npc_moda.md) | `por_npc_moda__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_moda__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 木高峰 | `npc_mugaofeng` | 男 | 老年 | A | [npc_mugaofeng.md](ch05-xiaoao/npc_mugaofeng.md) | `por_npc_mugaofeng__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_mugaofeng__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 宁中则 | `npc_ningzhongze` | 女 | 壮年 | S | [npc_ningzhongze.md](ch05-xiaoao/npc_ningzhongze.md) | `por_npc_ningzhongze__ch05_prime_huashan_base` | `assets/default/character/female/ch05/por_npc_ningzhongze__ch05_prime_huashan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 平一指 | `npc_pingyizhi` | 男 | 壮年 | A | [npc_pingyizhi.md](ch05-xiaoao/npc_pingyizhi.md) | `por_npc_pingyizhi__ch05_prime_base` | `assets/default/character/male/ch05/por_npc_pingyizhi__ch05_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 曲洋 | `npc_quyang` | 男 | 老年 | A | [npc_quyang.md](ch05-xiaoao/npc_quyang.md) | `por_npc_quyang__ch05_elder_before_ceremony_base` | `assets/default/character/male/ch05/por_npc_quyang__ch05_elder_before_ceremony_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 任我行 | `npc_renwoxing` | 男 | 老年 | S | [npc_renwoxing.md](ch05-xiaoao/npc_renwoxing.md) | `por_npc_renwoxing__ch05_elder_released_base` | `assets/default/character/male/ch05/por_npc_renwoxing__ch05_elder_released_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 任盈盈 | `npc_renyingying` | 女 | 青年 | S | [npc_renyingying.md](ch05-xiaoao/npc_renyingying.md) | `por_npc_renyingying__ch05_youth_shenggu_base` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_shenggu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 田伯光 | `npc_tianboguang` | 男 | 壮年 | A | [npc_tianboguang.md](ch05-xiaoao/npc_tianboguang.md) | `por_npc_tianboguang__ch05_prime_before_ordination_base` | `assets/default/character/male/ch05/por_npc_tianboguang__ch05_prime_before_ordination_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 向问天 | `npc_xiangwentian` | 男 | 壮年 | S | [npc_xiangwentian.md](ch05-xiaoao/npc_xiangwentian.md) | `por_npc_xiangwentian__ch05_prime_rescue_base` | `assets/default/character/male/ch05/por_npc_xiangwentian__ch05_prime_rescue_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 仪琳 | `npc_yilin` | 女 | 青年 | S | [npc_yilin.md](ch05-xiaoao/npc_yilin.md) | `por_npc_yilin__ch05_youth_base` | `assets/default/character/female/ch05/por_npc_yilin__ch05_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 余沧海 | `npc_yucanghai` | 男 | 壮年 | A | [npc_yucanghai.md](ch05-xiaoao/npc_yucanghai.md) | `por_npc_yucanghai__ch05_prime_base` | `assets/default/character/male/ch05/por_npc_yucanghai__ch05_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 岳不群 | `npc_yuebuqun` | 男 | 壮年 | S | [npc_yuebuqun.md](ch05-xiaoao/npc_yuebuqun.md) | `por_npc_yuebuqun__ch05_prime_huashan_base` | `assets/default/character/male/ch05/por_npc_yuebuqun__ch05_prime_huashan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 岳灵珊 | `npc_yuelingshan` | 女 | 青年 | S | [npc_yuelingshan.md](ch05-xiaoao/npc_yuelingshan.md) | `por_npc_yuelingshan__ch05_youth_huashan_base` | `assets/default/character/female/ch05/por_npc_yuelingshan__ch05_youth_huashan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 左冷禅 | `npc_zuolengchan` | 男 | 壮年 | S | [npc_zuolengchan.md](ch05-xiaoao/npc_zuolengchan.md) | `por_npc_zuolengchan__ch05_prime_sighted_base` | `assets/default/character/male/ch05/por_npc_zuolengchan__ch05_prime_sighted_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 祖千秋 | `npc_zuqianqiu` | 男 | 老年 | A | [npc_zuqianqiu.md](ch05-xiaoao/npc_zuqianqiu.md) | `por_npc_zuqianqiu__ch05_elder_base` | `assets/default/character/male/ch05/por_npc_zuqianqiu__ch05_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 白阿绣 | `npc_axiu` | 女 | 青年 | S | [npc_axiu.md](ch06-xiake/npc_axiu.md) | `por_npc_axiu__ch06_youth_ziyan_base` | `assets/default/character/female/ch06/por_npc_axiu__ch06_youth_ziyan_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 白万剑 | `npc_baiwanjian` | 男 | 壮年 | A | [npc_baiwanjian.md](ch06-xiake/npc_baiwanjian.md) | `por_npc_baiwanjian__ch06_prime_xunnv_base` | `assets/default/character/male/ch06/por_npc_baiwanjian__ch06_prime_xunnv_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 白自在 | `npc_baizizai` | 男 | 老年 | S | [npc_baizizai.md](ch06-xiake/npc_baizizai.md) | `por_npc_baizizai__ch06_elder_lingxiao_base` | `assets/default/character/male/ch06/por_npc_baizizai__ch06_elder_lingxiao_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 贝海石 | `npc_beihaishi` | 男 | 老年 | A | [npc_beihaishi.md](ch06-xiake/npc_beihaishi.md) | `por_npc_beihaishi__ch06_elder_changle_base` | `assets/default/character/male/ch06/por_npc_beihaishi__ch06_elder_changle_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 大悲老人 | `npc_dabeilaoren` | 男 | 老年 | A | [npc_dabeilaoren.md](ch06-xiake/npc_dabeilaoren.md) | `por_npc_dabeilaoren__ch06_elder_alive_base` | `assets/default/character/male/ch06/por_npc_dabeilaoren__ch06_elder_alive_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 丁不三 | `npc_dingbusan` | 男 | 老年 | A | [npc_dingbusan.md](ch06-xiake/npc_dingbusan.md) | `por_npc_dingbusan__ch06_elder_zhouhang_base` | `assets/default/character/male/ch06/por_npc_dingbusan__ch06_elder_zhouhang_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 丁不四 | `npc_dingbusi` | 男 | 老年 | S | [npc_dingbusi.md](ch06-xiake/npc_dingbusi.md) | `por_npc_dingbusi__ch06_elder_jinlongbian_base` | `assets/default/character/male/ch06/por_npc_dingbusi__ch06_elder_jinlongbian_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 丁珰 | `npc_dingdang` | 女 | 青年 | S | [npc_dingdang.md](ch06-xiake/npc_dingdang.md) | `por_npc_dingdang__ch06_youth_changle_base` | `assets/default/character/female/ch06/por_npc_dingdang__ch06_youth_changle_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 封万里 | `npc_fengwanli` | 男 | 壮年 | A | [npc_fengwanli.md](ch06-xiake/npc_fengwanli.md) | `por_npc_fengwanli__ch06_prime_onearm_base` | `assets/default/character/male/ch06/por_npc_fengwanli__ch06_prime_onearm_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 李四 | `npc_lisi06` | 男 | 壮年 | S | [npc_lisi06.md](ch06-xiake/npc_lisi06.md) | `por_npc_lisi06__ch06_prime_yaojiu_base` | `assets/default/character/male/ch06/por_npc_lisi06__ch06_prime_yaojiu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 龙岛主 | `npc_longdaozhu` | 男 | 老年 | S | [npc_longdaozhu.md](ch06-xiake/npc_longdaozhu.md) | `por_npc_longdaozhu__ch06_elder_alive_base` | `assets/default/character/male/ch06/por_npc_longdaozhu__ch06_elder_alive_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 梅芳姑 | `npc_meifanggu` | 女 | 壮年 | A | [npc_meifanggu.md](ch06-xiake/npc_meifanggu.md) | `por_npc_meifanggu__ch06_prime_disfigured_base` | `assets/default/character/female/ch06/por_npc_meifanggu__ch06_prime_disfigured_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 妙谛大师 | `npc_miaodi` | 男 | 老年 | A | [npc_miaodi.md](ch06-xiake/npc_miaodi.md) | `por_npc_miaodi__ch06_elder_island_base` | `assets/default/character/male/ch06/por_npc_miaodi__ch06_elder_island_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 米横野 | `npc_mihengye` | 男 | 壮年 | B | [npc_mihengye.md](ch06-xiake/npc_mihengye.md) | `por_npc_mihengye__ch06_prime_changle_base` | `assets/default/character/male/ch06/por_npc_mihengye__ch06_prime_changle_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 闵柔 | `npc_minrou` | 女 | 壮年 | A | [npc_minrou.md](ch06-xiake/npc_minrou.md) | `por_npc_minrou__ch06_prime_xunzi_base` | `assets/default/character/female/ch06/por_npc_minrou__ch06_prime_xunzi_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 木岛主 | `npc_mudaozhu` | 男 | 老年 | S | [npc_mudaozhu.md](ch06-xiake/npc_mudaozhu.md) | `por_npc_mudaozhu__ch06_elder_alive_base` | `assets/default/character/male/ch06/por_npc_mudaozhu__ch06_elder_alive_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 侍剑 | `npc_shijian` | 女 | 青年 | A | [npc_shijian.md](ch06-xiake/npc_shijian.md) | `por_npc_shijian__ch06_youth_alive_base` | `assets/default/character/female/ch06/por_npc_shijian__ch06_youth_alive_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 石破天 | `npc_shipotian` | 男 | 青年 | S | [npc_shipotian.md](ch06-xiake/npc_shipotian.md) | `por_npc_shipotian__ch06_youth_jinwu_base` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_jinwu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 石清 | `npc_shiqing` | 男 | 壮年 | A | [npc_shiqing.md](ch06-xiake/npc_shiqing.md) | `por_npc_shiqing__ch06_prime_xunzi_base` | `assets/default/character/male/ch06/por_npc_shiqing__ch06_prime_xunzi_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 史小翠 | `npc_shixiaocui` | 女 | 老年 | A | [npc_shixiaocui.md](ch06-xiake/npc_shixiaocui.md) | `por_npc_shixiaocui__ch06_elder_jinwu_base` | `assets/default/character/female/ch06/por_npc_shixiaocui__ch06_elder_jinwu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 石中玉 | `npc_shizhongyu` | 男 | 青年 | S | [npc_shizhongyu.md](ch06-xiake/npc_shizhongyu.md) | `por_npc_shizhongyu__ch06_youth_bangzhu_base` | `assets/default/character/male/ch06/por_npc_shizhongyu__ch06_youth_bangzhu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 谢烟客 | `npc_xieyanke` | 男 | 老年 | S | [npc_xieyanke.md](ch06-xiake/npc_xieyanke.md) | `por_npc_xieyanke__ch06_elder_motian_base` | `assets/default/character/male/ch06/por_npc_xieyanke__ch06_elder_motian_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 愚茶道长 | `npc_yucha` | 男 | 老年 | A | [npc_yucha.md](ch06-xiake/npc_yucha.md) | `por_npc_yucha__ch06_elder_island_base` | `assets/default/character/male/ch06/por_npc_yucha__ch06_elder_island_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 展飞 | `npc_zhanfei` | 男 | 壮年 | B | [npc_zhanfei.md](ch06-xiake/npc_zhanfei.md) | `por_npc_zhanfei__ch06_prime_injured_base` | `assets/default/character/male/ch06/por_npc_zhanfei__ch06_prime_injured_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 张三 | `npc_zhangsan06` | 男 | 壮年 | S | [npc_zhangsan06.md](ch06-xiake/npc_zhangsan06.md) | `por_npc_zhangsan06__ch06_prime_yaojiu_base` | `assets/default/character/male/ch06/por_npc_zhangsan06__ch06_prime_yaojiu_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 阿九 | `npc_ajiu` | 女 | 青年 | S | [npc_ajiu.md](ch07-bixue/npc_ajiu.md) | `por_npc_ajiu__ch07_youth_preinjury_base` | `assets/default/character/female/ch07/por_npc_ajiu__ch07_youth_preinjury_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 安剑清 | `npc_anjianqing` | 男 | 壮年 | A | [npc_anjianqing.md](ch07-bixue/npc_anjianqing.md) | `por_npc_anjianqing__ch07_prime_palace_base` | `assets/default/character/male/ch07/por_npc_anjianqing__ch07_prime_palace_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 安小慧 | `npc_anxiaohui` | 女 | 青年 | A | [npc_anxiaohui.md](ch07-bixue/npc_anxiaohui.md) | `por_npc_anxiaohui__ch07_youth_base` | `assets/default/character/female/ch07/por_npc_anxiaohui__ch07_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 曹化淳 | `npc_caohuachun` | 男 | 老年 | A | [npc_caohuachun.md](ch07-bixue/npc_caohuachun.md) | `por_npc_caohuachun__ch07_base` | `assets/default/character/male/ch07/por_npc_caohuachun__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 程青竹 | `npc_chengqingzhu` | 男 | 老年 | S | [npc_chengqingzhu.md](ch07-bixue/npc_chengqingzhu.md) | `por_npc_chengqingzhu__ch07_base` | `assets/default/character/male/ch07/por_npc_chengqingzhu__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 陈圆圆 | `npc_chenyuanyuan` | 女 | 青年 | A | [npc_chenyuanyuan.md](ch07-bixue/npc_chenyuanyuan.md) | `por_npc_chenyuanyuan__ch07_youth_base` | `assets/default/character/female/ch07/por_npc_chenyuanyuan__ch07_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 崇祯帝朱由检 | `npc_chongzhen` | 男 | 壮年 | A | [npc_chongzhen.md](ch07-bixue/npc_chongzhen.md) | `por_npc_chongzhen__ch07_prime_predeath_base` | `assets/default/character/male/ch07/por_npc_chongzhen__ch07_prime_predeath_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 崔秋山 | `npc_cuiqiushan` | 男 | 壮年 | A | [npc_cuiqiushan.md](ch07-bixue/npc_cuiqiushan.md) | `por_npc_cuiqiushan__ch07_prime_opening_base` | `assets/default/character/male/ch07/por_npc_cuiqiushan__ch07_prime_opening_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 崔希敏 | `npc_cuiximin` | 男 | 青年 | A | [npc_cuiximin.md](ch07-bixue/npc_cuiximin.md) | `por_npc_cuiximin__ch07_base` | `assets/default/character/male/ch07/por_npc_cuiximin__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 多尔衮 | `npc_duoergun` | 男 | 壮年 | A | [npc_duoergun.md](ch07-bixue/npc_duoergun.md) | `por_npc_duoergun__ch07_base` | `assets/default/character/male/ch07/por_npc_duoergun__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 归二娘 | `npc_guierniang` | 女 | 壮年 | S | [npc_guierniang.md](ch07-bixue/npc_guierniang.md) | `por_npc_guierniang__ch07_prime_base` | `assets/default/character/female/ch07/por_npc_guierniang__ch07_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 归辛树 | `npc_guixinshu` | 男 | 老年 | S | [npc_guixinshu.md](ch07-bixue/npc_guixinshu.md) | `por_npc_guixinshu__ch07_elder_base` | `assets/default/character/male/ch07/por_npc_guixinshu__ch07_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 何红药 | `npc_hehongyao` | 女 | 壮年 | A | [npc_hehongyao.md](ch07-bixue/npc_hehongyao.md) | `por_npc_hehongyao__ch07_base` | `assets/default/character/female/ch07/por_npc_hehongyao__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 何铁手 | `npc_hetieshou` | 女 | 青年 | S | [npc_hetieshou.md](ch07-bixue/npc_hetieshou.md) | `por_npc_hetieshou__ch07_youth_leader_base` | `assets/default/character/female/ch07/por_npc_hetieshou__ch07_youth_leader_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 红娘子 | `npc_hongniangzi` | 女 | 壮年 | S | [npc_hongniangzi.md](ch07-bixue/npc_hongniangzi.md) | `por_npc_hongniangzi__ch07_base` | `assets/default/character/female/ch07/por_npc_hongniangzi__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 皇太极 | `npc_huangtaiji` | 男 | 老年 | A | [npc_huangtaiji.md](ch07-bixue/npc_huangtaiji.md) | `por_npc_huangtaiji__ch07_elder_predeath_base` | `assets/default/character/male/ch07/por_npc_huangtaiji__ch07_elder_predeath_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 黄真 | `npc_huangzhen` | 男 | 老年 | S | [npc_huangzhen.md](ch07-bixue/npc_huangzhen.md) | `por_npc_huangzhen__ch07_base` | `assets/default/character/male/ch07/por_npc_huangzhen__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 焦公礼 | `npc_jiaogongli` | 男 | 老年 | A | [npc_jiaogongli.md](ch07-bixue/npc_jiaogongli.md) | `por_npc_jiaogongli__ch07_base` | `assets/default/character/male/ch07/por_npc_jiaogongli__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 焦宛儿 | `npc_jiaowaner` | 女 | 青年 | A | [npc_jiaowaner.md](ch07-bixue/npc_jiaowaner.md) | `por_npc_jiaowaner__ch07_base` | `assets/default/character/female/ch07/por_npc_jiaowaner__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 刘培生 | `npc_liupeisheng` | 男 | 壮年 | B | [npc_liupeisheng.md](ch07-bixue/npc_liupeisheng.md) | `por_npc_liupeisheng__ch07_base` | `assets/default/character/male/ch07/por_npc_liupeisheng__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 李岩 | `npc_liyan` | 男 | 壮年 | S | [npc_liyan.md](ch07-bixue/npc_liyan.md) | `por_npc_liyan__ch07_base` | `assets/default/character/male/ch07/por_npc_liyan__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 李自成 | `npc_lizicheng` | 男 | 壮年 | A | [npc_lizicheng.md](ch07-bixue/npc_lizicheng.md) | `por_npc_lizicheng__ch07_prime_leader_base` | `assets/default/character/male/ch07/por_npc_lizicheng__ch07_prime_leader_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 梅剑和 | `npc_meijianhe` | 男 | 青年 | B | [npc_meijianhe.md](ch07-bixue/npc_meijianhe.md) | `por_npc_meijianhe__ch07_base` | `assets/default/character/male/ch07/por_npc_meijianhe__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 闵子华 | `npc_minzihua` | 男 | 壮年 | A | [npc_minzihua.md](ch07-bixue/npc_minzihua.md) | `por_npc_minzihua__ch07_prime_beforeloss_base` | `assets/default/character/male/ch07/por_npc_minzihua__ch07_prime_beforeloss_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 穆人清 | `npc_murenqing` | 男 | 老年 | A | [npc_murenqing.md](ch07-bixue/npc_murenqing.md) | `por_npc_murenqing__ch07_base` | `assets/default/character/male/ch07/por_npc_murenqing__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 木桑道人 | `npc_musang` | 男 | 老年 | S | [npc_musang.md](ch07-bixue/npc_musang.md) | `por_npc_musang__ch07_base` | `assets/default/character/male/ch07/por_npc_musang__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 沙天广 | `npc_shatianguang` | 男 | 壮年 | A | [npc_shatianguang.md](ch07-bixue/npc_shatianguang.md) | `por_npc_shatianguang__ch07_base` | `assets/default/character/male/ch07/por_npc_shatianguang__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 孙仲君 | `npc_sunzhongjun` | 女 | 青年 | A | [npc_sunzhongjun.md](ch07-bixue/npc_sunzhongjun.md) | `por_npc_sunzhongjun__ch07_youth_prepunishment_base` | `assets/default/character/female/ch07/por_npc_sunzhongjun__ch07_youth_prepunishment_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 孙仲寿 | `npc_sunzhongshou` | 男 | 老年 | A | [npc_sunzhongshou.md](ch07-bixue/npc_sunzhongshou.md) | `por_npc_sunzhongshou__ch07_base` | `assets/default/character/male/ch07/por_npc_sunzhongshou__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 温方达 | `npc_wenfangda` | 男 | 老年 | A | [npc_wenfangda.md](ch07-bixue/npc_wenfangda.md) | `por_npc_wenfangda__ch07_base` | `assets/default/character/male/ch07/por_npc_wenfangda__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 温方施 | `npc_wenfangshi` | 男 | 老年 | A | [npc_wenfangshi.md](ch07-bixue/npc_wenfangshi.md) | `por_npc_wenfangshi__ch07_base` | `assets/default/character/male/ch07/por_npc_wenfangshi__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 温方义 | `npc_wenfangyi` | 男 | 老年 | A | [npc_wenfangyi.md](ch07-bixue/npc_wenfangyi.md) | `por_npc_wenfangyi__ch07_base` | `assets/default/character/male/ch07/por_npc_wenfangyi__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 温青青 | `npc_wenqingqing` | 女 | 青年 | S | [npc_wenqingqing.md](ch07-bixue/npc_wenqingqing.md) | `por_npc_wenqingqing__ch07_youth_disguise_base` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_disguise_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 温仪 | `npc_wenyi` | 女 | 壮年 | A | [npc_wenyi.md](ch07-bixue/npc_wenyi.md) | `por_npc_wenyi__ch07_base` | `assets/default/character/female/ch07/por_npc_wenyi__ch07_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 吴三桂 | `npc_wusangui` | 男 | 壮年 | A | [npc_wusangui.md](ch07-bixue/npc_wusangui.md) | `por_npc_wusangui__ch07_prime_ming_base` | `assets/default/character/male/ch07/por_npc_wusangui__ch07_prime_ming_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 夏雪宜 | `npc_xiaxueyi` | 男 | 壮年 | S | [npc_xiaxueyi.md](ch07-bixue/npc_xiaxueyi.md) | `por_npc_xiaxueyi__ch07_prime_memory_base` | `assets/default/character/male/ch07/por_npc_xiaxueyi__ch07_prime_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 袁承志 | `npc_yuanchengzhi` | 男 | 青年 | S | [npc_yuanchengzhi.md](ch07-bixue/npc_yuanchengzhi.md) | `por_npc_yuanchengzhi__ch07_youth_jinshe_base` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_jinshe_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 袁崇焕 | `npc_yuanchonghuan` | 男 | 壮年 | A | [npc_yuanchonghuan.md](ch07-bixue/npc_yuanchonghuan.md) | `por_npc_yuanchonghuan__ch07_prime_memory_base` | `assets/default/character/male/ch07/por_npc_yuanchonghuan__ch07_prime_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 玉真子 | `npc_yuzhenzi` | 男 | 老年 | S | [npc_yuzhenzi.md](ch07-bixue/npc_yuzhenzi.md) | `por_npc_yuzhenzi__ch07_elder_huashan_base` | `assets/default/character/male/ch07/por_npc_yuzhenzi__ch07_elder_huashan_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 张朝唐 | `npc_zhangchaotang` | 男 | 壮年 | A | [npc_zhangchaotang.md](ch07-bixue/npc_zhangchaotang.md) | `por_npc_zhangchaotang__ch07_prime_opening_base` | `assets/default/character/male/ch07/por_npc_zhangchaotang__ch07_prime_opening_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 九难 | `npc_ajiu` | 女 | 壮年 | S | [npc_ajiu.md](ch08-luding/npc_ajiu.md) | `por_npc_ajiu__ch08_prime_onearm_base` | `assets/default/character/female/ch08/por_npc_ajiu__ch08_prime_onearm_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 阿珂 | `npc_ake` | 女 | 青年 | S | [npc_ake.md](ch08-luding/npc_ake.md) | `por_npc_ake__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_ake__ch08_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 鳌拜 | `npc_aobai` | 男 | 老年 | S | [npc_aobai.md](ch08-luding/npc_aobai.md) | `por_npc_aobai__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_aobai__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 澄观 | `npc_chengguan` | 男 | 老年 | B | [npc_chengguan.md](ch08-luding/npc_chengguan.md) | `por_npc_chengguan__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_chengguan__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 陈近南 | `npc_chenjinnan` | 男 | 壮年 | S | [npc_chenjinnan.md](ch08-luding/npc_chenjinnan.md) | `por_npc_chenjinnan__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_chenjinnan__ch08_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 陈圆圆 | `npc_chenyuanyuan` | 女 | 壮年 | A | [npc_chenyuanyuan.md](ch08-luding/npc_chenyuanyuan.md) | `por_npc_chenyuanyuan__ch08_prime_recluse_base` | `assets/default/character/female/ch08/por_npc_chenyuanyuan__ch08_prime_recluse_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 方怡 | `npc_fangyi` | 女 | 青年 | S | [npc_fangyi.md](ch08-luding/npc_fangyi.md) | `por_npc_fangyi__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_fangyi__ch08_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 冯锡范 | `npc_fengxifan` | 男 | 老年 | A | [npc_fengxifan.md](ch08-luding/npc_fengxifan.md) | `por_npc_fengxifan__ch08_elder_zheng_base` | `assets/default/character/male/ch08/por_npc_fengxifan__ch08_elder_zheng_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 归二娘 | `npc_guierniang` | 女 | 老年 | A | [npc_guierniang.md](ch08-luding/npc_guierniang.md) | `por_npc_guierniang__ch08_elder_base` | `assets/default/character/female/ch08/por_npc_guierniang__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 归钟 | `npc_guisong` | 男 | 壮年 | A | [npc_guisong.md](ch08-luding/npc_guisong.md) | `por_npc_guisong__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_guisong__ch08_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 归辛树 | `npc_guixinshu` | 男 | 老年 | A | [npc_guixinshu.md](ch08-luding/npc_guixinshu.md) | `por_npc_guixinshu__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_guixinshu__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 顾炎武 | `npc_guyanwu` | 男 | 老年 | A | [npc_guyanwu.md](ch08-luding/npc_guyanwu.md) | `por_npc_guyanwu__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_guyanwu__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 海大富 | `npc_haidafu` | 男 | 老年 | A | [npc_haidafu.md](ch08-luding/npc_haidafu.md) | `por_npc_haidafu__ch08_elder_blind_base` | `assets/default/character/male/ch08/por_npc_haidafu__ch08_elder_blind_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 洪安通 | `npc_hongantong` | 男 | 老年 | S | [npc_hongantong.md](ch08-luding/npc_hongantong.md) | `por_npc_hongantong__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_hongantong__ch08_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 黄宗羲 | `npc_huangzongxi` | 男 | 老年 | A | [npc_huangzongxi.md](ch08-luding/npc_huangzongxi.md) | `por_npc_huangzongxi__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_huangzongxi__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 晦聪 | `npc_huicong` | 男 | 老年 | B | [npc_huicong.md](ch08-luding/npc_huicong.md) | `por_npc_huicong__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_huicong__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 建宁公主 | `npc_jianning` | 女 | 童年 | S | [npc_jianning.md](ch08-luding/npc_jianning.md) | `por_npc_jianning__ch08_child_palace_base` | `assets/default/character/female/ch08/por_npc_jianning__ch08_child_palace_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 康熙 | `npc_kangxi` | 男 | 青年 | S | [npc_kangxi.md](ch08-luding/npc_kangxi.md) | `por_npc_kangxi__ch08_youth_xiaoxuanzi_base` | `assets/default/character/male/ch08/por_npc_kangxi__ch08_youth_xiaoxuanzi_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 李自成 | `npc_lizicheng` | 男 | 老年 | A | [npc_lizicheng.md](ch08-luding/npc_lizicheng.md) | `por_npc_lizicheng__ch08_elder_monk_base` | `assets/default/character/male/ch08/por_npc_lizicheng__ch08_elder_monk_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 吕留良 | `npc_lvliuliang` | 男 | 壮年 | B | [npc_lvliuliang.md](ch08-luding/npc_lvliuliang.md) | `por_npc_lvliuliang__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_lvliuliang__ch08_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 茅十八 | `npc_maoshiba` | 男 | 壮年 | S | [npc_maoshiba.md](ch08-luding/npc_maoshiba.md) | `por_npc_maoshiba__ch08_prime_base` | `assets/default/character/male/ch08/por_npc_maoshiba__ch08_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 沐剑屏 | `npc_mujianping` | 女 | 青年 | S | [npc_mujianping.md](ch08-luding/npc_mujianping.md) | `por_npc_mujianping__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_mujianping__ch08_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 沐剑声 | `npc_mujiansheng` | 男 | 青年 | A | [npc_mujiansheng.md](ch08-luding/npc_mujiansheng.md) | `por_npc_mujiansheng__ch08_youth_base` | `assets/default/character/male/ch08/por_npc_mujiansheng__ch08_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 桑结 | `npc_sangjie` | 男 | 老年 | A | [npc_sangjie.md](ch08-luding/npc_sangjie.md) | `por_npc_sangjie__ch08_elder_uninjured_base` | `assets/default/character/male/ch08/por_npc_sangjie__ch08_elder_uninjured_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 施琅 | `npc_shilang` | 男 | 老年 | A | [npc_shilang.md](ch08-luding/npc_shilang.md) | `por_npc_shilang__ch08_elder_navy_base` | `assets/default/character/male/ch08/por_npc_shilang__ch08_elder_navy_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 双儿 | `npc_shuanger` | 女 | 青年 | S | [npc_shuanger.md](ch08-luding/npc_shuanger.md) | `por_npc_shuanger__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 索菲娅 | `npc_suofeiya` | 女 | 青年 | A | [npc_suofeiya.md](ch08-luding/npc_suofeiya.md) | `por_npc_suofeiya__ch08_youth_regent_base` | `assets/default/character/female/ch08/por_npc_suofeiya__ch08_youth_regent_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 苏荃 | `npc_suquan` | 女 | 青年 | S | [npc_suquan.md](ch08-luding/npc_suquan.md) | `por_npc_suquan__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_suquan__ch08_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 韦小宝 | `npc_weixiaobao` | 男 | 青年 | S | [npc_weixiaobao.md](ch08-luding/npc_weixiaobao.md) | `por_npc_weixiaobao__ch08_youth_bishou_base` | `assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 吴六奇 | `npc_wuliuqi` | 男 | 壮年 | S | [npc_wuliuqi.md](ch08-luding/npc_wuliuqi.md) | `por_npc_wuliuqi__ch08_prime_general_base` | `assets/default/character/male/ch08/por_npc_wuliuqi__ch08_prime_general_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 吴三桂 | `npc_wusangui` | 男 | 老年 | A | [npc_wusangui.md](ch08-luding/npc_wusangui.md) | `por_npc_wusangui__ch08_elder_pingxi_base` | `assets/default/character/male/ch08/por_npc_wusangui__ch08_elder_pingxi_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 徐天川 | `npc_xutianchuan` | 男 | 老年 | A | [npc_xutianchuan.md](ch08-luding/npc_xutianchuan.md) | `por_npc_xutianchuan__ch08_elder_base` | `assets/default/character/male/ch08/por_npc_xutianchuan__ch08_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 曾柔 | `npc_zengrou` | 女 | 青年 | S | [npc_zengrou.md](ch08-luding/npc_zengrou.md) | `por_npc_zengrou__ch08_youth_base` | `assets/default/character/female/ch08/por_npc_zengrou__ch08_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 郑克塽 | `npc_zhengkeshuang` | 男 | 青年 | A | [npc_zhengkeshuang.md](ch08-luding/npc_zhengkeshuang.md) | `por_npc_zhengkeshuang__ch08_youth_zheng_base` | `assets/default/character/male/ch08/por_npc_zhengkeshuang__ch08_youth_zheng_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 宝象 | `npc_baoxiang` | 男 | 壮年 | S | [npc_baoxiang.md](ch09-liancheng/npc_baoxiang.md) | `por_npc_baoxiang__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_baoxiang__ch09_prime_pursuit_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 卜垣 | `npc_buyuan` | 男 | 壮年 | B | [npc_buyuan.md](ch09-liancheng/npc_buyuan.md) | `por_npc_buyuan__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_buyuan__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 丁典 | `npc_dingdian` | 男 | 壮年 | S | [npc_dingdian.md](ch09-liancheng/npc_dingdian.md) | `por_npc_dingdian__ch09_prime_prison_base` | `assets/default/character/male/ch09/por_npc_dingdian__ch09_prime_prison_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 狄云 | `npc_diyun` | 男 | 青年 | S | [npc_diyun.md](ch09-liancheng/npc_diyun.md) | `por_npc_diyun__ch09_youth_disguise_base` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_disguise_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 冯坦 | `npc_fengtan` | 男 | 壮年 | B | [npc_fengtan.md](ch09-liancheng/npc_fengtan.md) | `por_npc_fengtan__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_fengtan__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 花铁干 | `npc_huantiegan` | 男 | 壮年 | A | [npc_huantiegan.md](ch09-liancheng/npc_huantiegan.md) | `por_npc_huantiegan__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_huantiegan__ch09_prime_pursuit_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 空心菜 | `npc_kongxincai` | 女 | 童年 | A | [npc_kongxincai.md](ch09-liancheng/npc_kongxincai.md) | `por_npc_kongxincai__ch09_child_protected_base` | `assets/default/character/female/ch09/por_npc_kongxincai__ch09_child_protected_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 凌霜华 | `npc_lingshuanghua` | 女 | 青年 | S | [npc_lingshuanghua.md](ch09-liancheng/npc_lingshuanghua.md) | `por_npc_lingshuanghua__ch09_youth_scarred_base` | `assets/default/character/female/ch09/por_npc_lingshuanghua__ch09_youth_scarred_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 凌退思 | `npc_lingtusi` | 男 | 壮年 | S | [npc_lingtusi.md](ch09-liancheng/npc_lingtusi.md) | `por_npc_lingtusi__ch09_prime_magistrate_base` | `assets/default/character/male/ch09/por_npc_lingtusi__ch09_prime_magistrate_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 刘乘风 | `npc_liurenfeng` | 男 | 壮年 | S | [npc_liurenfeng.md](ch09-liancheng/npc_liurenfeng.md) | `por_npc_liurenfeng__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_liurenfeng__ch09_prime_pursuit_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 鲁坤 | `npc_lukun` | 男 | 壮年 | B | [npc_lukun.md](ch09-liancheng/npc_lukun.md) | `por_npc_lukun__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_lukun__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陆天抒 | `npc_lutianshu` | 男 | 壮年 | S | [npc_lutianshu.md](ch09-liancheng/npc_lutianshu.md) | `por_npc_lutianshu__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_lutianshu__ch09_prime_pursuit_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 梅念笙 | `npc_meiniansheng` | 男 | 老年 | A | [npc_meiniansheng.md](ch09-liancheng/npc_meiniansheng.md) | `por_npc_meiniansheng__ch09_elder_memory_base` | `assets/default/character/male/ch09/por_npc_meiniansheng__ch09_elder_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 戚长发 | `npc_qichangfa` | 男 | 壮年 | S | [npc_qichangfa.md](ch09-liancheng/npc_qichangfa.md) | `por_npc_qichangfa__ch09_prime_rural_base` | `assets/default/character/male/ch09/por_npc_qichangfa__ch09_prime_rural_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 戚芳 | `npc_qifang` | 女 | 青年 | S | [npc_qifang.md](ch09-liancheng/npc_qifang.md) | `por_npc_qifang__ch09_youth_mother_base` | `assets/default/character/female/ch09/por_npc_qifang__ch09_youth_mother_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 沈城 | `npc_shencheng` | 男 | 壮年 | B | [npc_shencheng.md](ch09-liancheng/npc_shencheng.md) | `por_npc_shencheng__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_shencheng__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 水岱 | `npc_shuidao` | 男 | 壮年 | A | [npc_shuidao.md](ch09-liancheng/npc_shuidao.md) | `por_npc_shuidao__ch09_prime_pursuit_base` | `assets/default/character/male/ch09/por_npc_shuidao__ch09_prime_pursuit_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 水笙 | `npc_shuisheng` | 女 | 青年 | S | [npc_shuisheng.md](ch09-liancheng/npc_shuisheng.md) | `por_npc_shuisheng__ch09_youth_travel_base` | `assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_travel_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 孙均 | `npc_sunjun` | 男 | 壮年 | B | [npc_sunjun.md](ch09-liancheng/npc_sunjun.md) | `por_npc_sunjun__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_sunjun__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 桃红 | `npc_taohong` | 女 | 青年 | A | [npc_taohong.md](ch09-liancheng/npc_taohong.md) | `por_npc_taohong__ch09_youth_wanfu_base` | `assets/default/character/female/ch09/por_npc_taohong__ch09_youth_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 万圭 | `npc_wangui` | 男 | 青年 | S | [npc_wangui.md](ch09-liancheng/npc_wangui.md) | `por_npc_wangui__ch09_youth_wanfu_base` | `assets/default/character/male/ch09/por_npc_wangui__ch09_youth_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 汪啸风 | `npc_wangxiaofeng` | 男 | 青年 | A | [npc_wangxiaofeng.md](ch09-liancheng/npc_wangxiaofeng.md) | `por_npc_wangxiaofeng__ch09_youth_travel_base` | `assets/default/character/male/ch09/por_npc_wangxiaofeng__ch09_youth_travel_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 万震山 | `npc_wanzhenshan` | 男 | 壮年 | S | [npc_wanzhenshan.md](ch09-liancheng/npc_wanzhenshan.md) | `por_npc_wanzhenshan__ch09_prime_host_base` | `assets/default/character/male/ch09/por_npc_wanzhenshan__ch09_prime_host_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 吴坎 | `npc_wukan` | 男 | 壮年 | A | [npc_wukan.md](ch09-liancheng/npc_wukan.md) | `por_npc_wukan__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_wukan__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 血刀老祖 | `npc_xuedaolaozu` | 男 | 老年 | S | [npc_xuedaolaozu.md](ch09-liancheng/npc_xuedaolaozu.md) | `por_npc_xuedaolaozu__ch09_elder_snow_base` | `assets/default/character/male/ch09/por_npc_xuedaolaozu__ch09_elder_snow_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 言达平 | `npc_yandaping` | 男 | 壮年 | S | [npc_yandaping.md](ch09-liancheng/npc_yandaping.md) | `por_npc_yandaping__ch09_prime_beggar_base` | `assets/default/character/male/ch09/por_npc_yandaping__ch09_prime_beggar_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周圻 | `npc_zhouqi09` | 男 | 壮年 | B | [npc_zhouqi09.md](ch09-liancheng/npc_zhouqi09.md) | `por_npc_zhouqi09__ch09_prime_wanfu_base` | `assets/default/character/male/ch09/por_npc_zhouqi09__ch09_prime_wanfu_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 阿凡提 | `npc_afanti` | 男 | 老年 | A | [npc_afanti.md](ch12-shujian/npc_afanti.md) | `por_npc_afanti__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_afanti__ch12_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 常伯志 | `npc_changbozhi` | 男 | 壮年 | A | [npc_changbozhi.md](ch12-shujian/npc_changbozhi.md) | `por_npc_changbozhi__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_changbozhi__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 常赫志 | `npc_changhezhi` | 男 | 壮年 | A | [npc_changhezhi.md](ch12-shujian/npc_changhezhi.md) | `por_npc_changhezhi__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_changhezhi__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陈家洛 | `npc_chenjialuo` | 男 | 青年 | S | [npc_chenjialuo.md](ch12-shujian/npc_chenjialuo.md) | `por_npc_chenjialuo__ch12_youth_late_base` | `assets/default/character/male/ch12/por_npc_chenjialuo__ch12_youth_late_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陈世倌 | `npc_chenshiguan` | 男 | 老年 | A | [npc_chenshiguan.md](ch12-shujian/npc_chenshiguan.md) | `por_npc_chenshiguan__ch12_elder_memory_base` | `assets/default/character/male/ch12/por_npc_chenshiguan__ch12_elder_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陈正德 | `npc_chenzhengde` | 男 | 老年 | A | [npc_chenzhengde.md](ch12-shujian/npc_chenzhengde.md) | `por_npc_chenzhengde__ch12_elder_alive_base` | `assets/default/character/male/ch12/por_npc_chenzhengde__ch12_elder_alive_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 关明梅 | `npc_guanmingmei` | 女 | 老年 | A | [npc_guanmingmei.md](ch12-shujian/npc_guanmingmei.md) | `por_npc_guanmingmei__ch12_elder_alive_base` | `assets/default/character/female/ch12/por_npc_guanmingmei__ch12_elder_alive_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 霍阿伊 | `npc_huoayi` | 男 | 壮年 | A | [npc_huoayi.md](ch12-shujian/npc_huoayi.md) | `por_npc_huoayi__ch12_prime_alive_base` | `assets/default/character/male/ch12/por_npc_huoayi__ch12_prime_alive_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 霍青桐 | `npc_huoqingtong` | 女 | 青年 | S | [npc_huoqingtong.md](ch12-shujian/npc_huoqingtong.md) | `por_npc_huoqingtong__ch12_youth_early_base` | `assets/default/character/female/ch12/por_npc_huoqingtong__ch12_youth_early_base.png` | ready；已生成（本人面容独立重建candidate，待最终审核） |
| 补齐 | 蒋四根 | `npc_jiangsigen` | 男 | 壮年 | A | [npc_jiangsigen.md](ch12-shujian/npc_jiangsigen.md) | `por_npc_jiangsigen__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_jiangsigen__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 喀丝丽 | `npc_kasili` | 女 | 青年 | S | [npc_kasili.md](ch12-shujian/npc_kasili.md) | `por_npc_kasili__ch12_youth_prepalace_base` | `assets/default/character/female/ch12/por_npc_kasili__ch12_youth_prepalace_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 李沅芷 | `npc_liyuanzhi` | 女 | 青年 | S | [npc_liyuanzhi.md](ch12-shujian/npc_liyuanzhi.md) | `por_npc_liyuanzhi__ch12_youth_disguised_base` | `assets/default/character/female/ch12/por_npc_liyuanzhi__ch12_youth_disguised_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陆菲青 | `npc_lufeiqing` | 男 | 老年 | A | [npc_lufeiqing.md](ch12-shujian/npc_lufeiqing.md) | `por_npc_lufeiqing__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_lufeiqing__ch12_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 骆冰 | `npc_luobing` | 女 | 青年 | S | [npc_luobing.md](ch12-shujian/npc_luobing.md) | `por_npc_luobing__ch12_youth_recovered_base` | `assets/default/character/female/ch12/por_npc_luobing__ch12_youth_recovered_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 木卓伦 | `npc_muzhuolun` | 男 | 老年 | A | [npc_muzhuolun.md](ch12-shujian/npc_muzhuolun.md) | `por_npc_muzhuolun__ch12_elder_alive_base` | `assets/default/character/male/ch12/por_npc_muzhuolun__ch12_elder_alive_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 乾隆 | `npc_qianlong` | 男 | 壮年 | S | [npc_qianlong.md](ch12-shujian/npc_qianlong.md) | `por_npc_qianlong__ch12_prime_palace_base` | `assets/default/character/male/ch12/por_npc_qianlong__ch12_prime_palace_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 钱正伦 | `npc_qianzhenglun` | 男 | 壮年 | B | [npc_qianzhenglun.md](ch12-shujian/npc_qianzhenglun.md) | `por_npc_qianzhenglun__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_qianzhenglun__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 石双英 | `npc_shishuangying` | 男 | 壮年 | A | [npc_shishuangying.md](ch12-shujian/npc_shishuangying.md) | `por_npc_shishuangying__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_shishuangying__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 王维扬 | `npc_wangweiyang` | 男 | 老年 | A | [npc_wangweiyang.md](ch12-shujian/npc_wangweiyang.md) | `por_npc_wangweiyang__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_wangweiyang__ch12_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 卫春华 | `npc_weichunhua` | 男 | 壮年 | A | [npc_weichunhua.md](ch12-shujian/npc_weichunhua.md) | `por_npc_weichunhua__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_weichunhua__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 文泰来 | `npc_wentailai` | 男 | 壮年 | S | [npc_wentailai.md](ch12-shujian/npc_wentailai.md) | `por_npc_wentailai__ch12_prime_recovered_base` | `assets/default/character/male/ch12/por_npc_wentailai__ch12_prime_recovered_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 无尘道长 | `npc_wuchen` | 男 | 老年 | A | [npc_wuchen.md](ch12-shujian/npc_wuchen.md) | `por_npc_wuchen__ch12_elder_onearm_base` | `assets/default/character/male/ch12/por_npc_wuchen__ch12_elder_onearm_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 心砚 | `npc_xinyan` | 男 | 青年 | A | [npc_xinyan.md](ch12-shujian/npc_xinyan.md) | `por_npc_xinyan__ch12_youth_base` | `assets/default/character/male/ch12/por_npc_xinyan__ch12_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 徐天宏 | `npc_xutianhong` | 男 | 青年 | S | [npc_xutianhong.md](ch12-shujian/npc_xutianhong.md) | `por_npc_xutianhong__ch12_youth_base` | `assets/default/character/male/ch12/por_npc_xutianhong__ch12_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 杨成协 | `npc_yangchengxie` | 男 | 壮年 | A | [npc_yangchengxie.md](ch12-shujian/npc_yangchengxie.md) | `por_npc_yangchengxie__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_yangchengxie__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 阎世章 | `npc_yanshizhang` | 男 | 壮年 | B | [npc_yanshizhang.md](ch12-shujian/npc_yanshizhang.md) | `por_npc_yanshizhang__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_yanshizhang__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 袁士霄 | `npc_yuanshixiao` | 男 | 老年 | A | [npc_yuanshixiao.md](ch12-shujian/npc_yuanshixiao.md) | `por_npc_yuanshixiao__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_yuanshixiao__ch12_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 于万亭 | `npc_yuwanting` | 男 | 老年 | A | [npc_yuwanting.md](ch12-shujian/npc_yuwanting.md) | `por_npc_yuwanting__ch12_elder_memory_base` | `assets/default/character/male/ch12/por_npc_yuwanting__ch12_elder_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 余鱼同 | `npc_yuyutong` | 男 | 青年 | S | [npc_yuyutong.md](ch12-shujian/npc_yuyutong.md) | `por_npc_yuyutong__ch12_youth_scarred_monk_base` | `assets/default/character/male/ch12/por_npc_yuyutong__ch12_youth_scarred_monk_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 章进 | `npc_zhangjin` | 男 | 壮年 | A | [npc_zhangjin.md](ch12-shujian/npc_zhangjin.md) | `por_npc_zhangjin__ch12_prime_base` | `assets/default/character/male/ch12/por_npc_zhangjin__ch12_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 张召重 | `npc_zhangzhaozhong` | 男 | 壮年 | S | [npc_zhangzhaozhong.md](ch12-shujian/npc_zhangzhaozhong.md) | `por_npc_zhangzhaozhong__ch12_prime_pursuit_base` | `assets/default/character/male/ch12/por_npc_zhangzhaozhong__ch12_prime_pursuit_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 赵半山 | `npc_zhaobanshan` | 男 | 老年 | S | [npc_zhaobanshan.md](ch12-shujian/npc_zhaobanshan.md) | `por_npc_zhaobanshan__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_zhaobanshan__ch12_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 兆惠 | `npc_zhaohui` | 男 | 壮年 | S | [npc_zhaohui.md](ch12-shujian/npc_zhaohui.md) | `por_npc_zhaohui__ch12_prime_campaign_base` | `assets/default/character/male/ch12/por_npc_zhaohui__ch12_prime_campaign_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周绮 | `npc_zhouqi12` | 女 | 青年 | S | [npc_zhouqi12.md](ch12-shujian/npc_zhouqi12.md) | `por_npc_zhouqi12__ch12_youth_base` | `assets/default/character/female/ch12/por_npc_zhouqi12__ch12_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周英杰 | `npc_zhouyingjie` | 男 | 青年 | B | [npc_zhouyingjie.md](ch12-shujian/npc_zhouyingjie.md) | `por_npc_zhouyingjie__ch12_youth_alive_base` | `assets/default/character/male/ch12/por_npc_zhouyingjie__ch12_youth_alive_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周仲英 | `npc_zhouzhongying` | 男 | 老年 | A | [npc_zhouzhongying.md](ch12-shujian/npc_zhouzhongying.md) | `por_npc_zhouzhongying__ch12_elder_base` | `assets/default/character/male/ch12/por_npc_zhouzhongying__ch12_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 程灵素 | `npc_chenglinsu` | 女 | 青年 | S | [npc_chenglinsu.md](ch13-feihu/npc_chenglinsu.md) | `por_npc_chenglinsu__ch13_youth_alive_base` | `assets/default/character/female/ch13/por_npc_chenglinsu__ch13_youth_alive_base.png` | ready；已生成（本人面容独立重建candidate，待最终审核） |
| 补齐 | 大智禅师 | `npc_dazhichanshi` | 男 | 老年 | A | [npc_dazhichanshi.md](ch13-feihu/npc_dazhichanshi.md) | `por_npc_dazhichanshi__ch13_elder_base` | `assets/default/character/male/ch13/por_npc_dazhichanshi__ch13_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 凤天南 | `npc_fengtianan` | 男 | 壮年 | S | [npc_fengtianan.md](ch13-feihu/npc_fengtianan.md) | `por_npc_fengtianan__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_fengtianan__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 凤一鸣 | `npc_fengyiming` | 男 | 青年 | A | [npc_fengyiming.md](ch13-feihu/npc_fengyiming.md) | `por_npc_fengyiming__ch13_youth_base` | `assets/default/character/male/ch13/por_npc_fengyiming__ch13_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 福康安 | `npc_fukangan` | 男 | 壮年 | S | [npc_fukangan.md](ch13-feihu/npc_fukangan.md) | `por_npc_fukangan__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_fukangan__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 黄希节 | `npc_huangxijie` | 男 | 壮年 | B | [npc_huangxijie.md](ch13-feihu/npc_huangxijie.md) | `por_npc_huangxijie__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_huangxijie__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 胡斐 | `npc_hufei` | 男 | 青年 | S | [npc_hufei.md](ch13-feihu/npc_hufei.md) | `por_npc_hufei__ch13_youth_base` | `assets/default/character/male/ch13/por_npc_hufei__ch13_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 胡夫人 | `npc_hufuren` | 女 | 青年 | A | [npc_hufuren.md](ch13-feihu/npc_hufuren.md) | `por_npc_hufuren__ch13_youth_memory_base` | `assets/default/character/female/ch13/por_npc_hufuren__ch13_youth_memory_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 胡一刀 | `npc_huyidao` | 男 | 壮年 | A | [npc_huyidao.md](ch13-feihu/npc_huyidao.md) | `por_npc_huyidao__ch13_prime_memory_base` | `assets/default/character/male/ch13/por_npc_huyidao__ch13_prime_memory_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 马春花 | `npc_machunhua` | 女 | 青年 | A | [npc_machunhua.md](ch13-feihu/npc_machunhua.md) | `por_npc_machunhua__ch13_youth_escort_base` | `assets/default/character/female/ch13/por_npc_machunhua__ch13_youth_escort_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 马行空 | `npc_maxingkong` | 男 | 老年 | A | [npc_maxingkong.md](ch13-feihu/npc_maxingkong.md) | `por_npc_maxingkong__ch13_elder_base` | `assets/default/character/male/ch13/por_npc_maxingkong__ch13_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 苗人凤 | `npc_miaorenfeng` | 男 | 壮年 | S | [npc_miaorenfeng.md](ch13-feihu/npc_miaorenfeng.md) | `por_npc_miaorenfeng__ch13_prime_recovered_base` | `assets/default/character/male/ch13/por_npc_miaorenfeng__ch13_prime_recovered_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 苗若兰 | `npc_miaoruolan` | 女 | 童年 | A | [npc_miaoruolan.md](ch13-feihu/npc_miaoruolan.md) | `por_npc_miaoruolan__ch13_child_base` | `assets/default/character/female/ch13/por_npc_miaoruolan__ch13_child_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 慕容景岳 | `npc_murongjingyue` | 男 | 壮年 | A | [npc_murongjingyue.md](ch13-feihu/npc_murongjingyue.md) | `por_npc_murongjingyue__ch13_prime_whole_base` | `assets/default/character/male/ch13/por_npc_murongjingyue__ch13_prime_whole_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 南兰 | `npc_nanlan` | 女 | 青年 | A | [npc_nanlan.md](ch13-feihu/npc_nanlan.md) | `por_npc_nanlan__ch13_youth_base` | `assets/default/character/female/ch13/por_npc_nanlan__ch13_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 倪不大 | `npc_nibuda` | 男 | 壮年 | B | [npc_nibuda.md](ch13-feihu/npc_nibuda.md) | `por_npc_nibuda__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_nibuda__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 倪不小 | `npc_nibuxiao` | 男 | 壮年 | B | [npc_nibuxiao.md](ch13-feihu/npc_nibuxiao.md) | `por_npc_nibuxiao__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_nibuxiao__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 欧阳公政 | `npc_ouyanggongzheng` | 男 | 壮年 | B | [npc_ouyanggongzheng.md](ch13-feihu/npc_ouyanggongzheng.md) | `por_npc_ouyanggongzheng__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_ouyanggongzheng__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 平阿四 | `npc_pingasi` | 男 | 壮年 | S | [npc_pingasi.md](ch13-feihu/npc_pingasi.md) | `por_npc_pingasi__ch13_prime_onearm_base` | `assets/default/character/male/ch13/por_npc_pingasi__ch13_prime_onearm_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 秦耐之 | `npc_qinnaizhi` | 男 | 壮年 | B | [npc_qinnaizhi.md](ch13-feihu/npc_qinnaizhi.md) | `por_npc_qinnaizhi__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_qinnaizhi__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 商宝震 | `npc_shangbaozhen` | 男 | 青年 | A | [npc_shangbaozhen.md](ch13-feihu/npc_shangbaozhen.md) | `por_npc_shangbaozhen__ch13_youth_manor_base` | `assets/default/character/male/ch13/por_npc_shangbaozhen__ch13_youth_manor_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 商老太 | `npc_shanglaotai` | 女 | 老年 | S | [npc_shanglaotai.md](ch13-feihu/npc_shanglaotai.md) | `por_npc_shanglaotai__ch13_elder_base` | `assets/default/character/female/ch13/por_npc_shanglaotai__ch13_elder_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 石万嗔 | `npc_shiwuchen` | 男 | 老年 | S | [npc_shiwuchen.md](ch13-feihu/npc_shiwuchen.md) | `por_npc_shiwuchen__ch13_elder_sighted_base` | `assets/default/character/male/ch13/por_npc_shiwuchen__ch13_elder_sighted_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 田归农 | `npc_tianguinong` | 男 | 壮年 | S | [npc_tianguinong.md](ch13-feihu/npc_tianguinong.md) | `por_npc_tianguinong__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_tianguinong__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 薛鹊 | `npc_xueque` | 女 | 青年 | A | [npc_xueque.md](ch13-feihu/npc_xueque.md) | `por_npc_xueque__ch13_youth_base` | `assets/default/character/female/ch13/por_npc_xueque__ch13_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 徐铮 | `npc_xuzheng` | 男 | 青年 | A | [npc_xuzheng.md](ch13-feihu/npc_xuzheng.md) | `por_npc_xuzheng__ch13_youth_base` | `assets/default/character/male/ch13/por_npc_xuzheng__ch13_youth_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 袁紫衣 | `npc_yuanziyi` | 女 | 青年 | S | [npc_yuanziyi.md](ch13-feihu/npc_yuanziyi.md) | `por_npc_yuanziyi__ch13_youth_ziyi_base` | `assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_ziyi_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 张云飞 | `npc_zhangyunfei` | 男 | 壮年 | B | [npc_zhangyunfei.md](ch13-feihu/npc_zhangyunfei.md) | `por_npc_zhangyunfei__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhangyunfei__ch13_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 赵半山 | `npc_zhaobanshan` | 男 | 老年 | S | [npc_zhaobanshan.md](ch13-feihu/npc_zhaobanshan.md) | `por_npc_zhaobanshan__ch13_elder_base` | `assets/default/character/male/ch13/por_npc_zhaobanshan__ch13_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 钟阿四 | `npc_zhongasi` | 男 | 壮年 | A | [npc_zhongasi.md](ch13-feihu/npc_zhongasi.md) | `por_npc_zhongasi__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongasi__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 钟兆能 | `npc_zhongzhaoneng` | 男 | 壮年 | B | [npc_zhongzhaoneng.md](ch13-feihu/npc_zhongzhaoneng.md) | `por_npc_zhongzhaoneng__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongzhaoneng__ch13_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 钟兆文 | `npc_zhongzhaowen` | 男 | 壮年 | A | [npc_zhongzhaowen.md](ch13-feihu/npc_zhongzhaowen.md) | `por_npc_zhongzhaowen__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongzhaowen__ch13_prime_base.png` | ready；已生成（逐人面容正面candidate，待最终审核） |
| 补齐 | 钟兆英 | `npc_zhongzhaoying` | 男 | 壮年 | B | [npc_zhongzhaoying.md](ch13-feihu/npc_zhongzhaoying.md) | `por_npc_zhongzhaoying__ch13_prime_base` | `assets/default/character/male/ch13/por_npc_zhongzhaoying__ch13_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 宝树 | `npc_baoshu` | 男 | 老年 | S | [npc_baoshu.md](ch14-xueshan/npc_baoshu.md) | `por_npc_baoshu__ch14_elder_base` | `assets/default/character/male/ch14/por_npc_baoshu__ch14_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 曹云奇 | `npc_caoyunqi` | 男 | 壮年 | A | [npc_caoyunqi.md](ch14-xueshan/npc_caoyunqi.md) | `por_npc_caoyunqi__ch14_base` | `assets/default/character/male/ch14/por_npc_caoyunqi__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 杜希孟 | `npc_duximeng` | 男 | 老年 | A | [npc_duximeng.md](ch14-xueshan/npc_duximeng.md) | `por_npc_duximeng__ch14_base` | `assets/default/character/male/ch14/por_npc_duximeng__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 范帮主 | `npc_fanbangzhu` | 男 | 老年 | A | [npc_fanbangzhu.md](ch14-xueshan/npc_fanbangzhu.md) | `por_npc_fanbangzhu__ch14_base` | `assets/default/character/male/ch14/por_npc_fanbangzhu__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 胡斐 | `npc_hufei` | 男 | 壮年 | S | [npc_hufei.md](ch14-xueshan/npc_hufei.md) | `por_npc_hufei__ch14_prime_base` | `assets/default/character/male/ch14/por_npc_hufei__ch14_prime_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 胡夫人 | `npc_hufuren` | 女 | 青年 | A | [npc_hufuren.md](ch14-xueshan/npc_hufuren.md) | `por_npc_hufuren__ch14_youth_memory_base` | `assets/default/character/female/ch14/por_npc_hufuren__ch14_youth_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 胡一刀 | `npc_huyidao` | 男 | 壮年 | S | [npc_huyidao.md](ch14-xueshan/npc_huyidao.md) | `por_npc_huyidao__ch14_prime_memory_base` | `assets/default/character/male/ch14/por_npc_huyidao__ch14_prime_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 静智大师 | `npc_jingzhidashi` | 男 | 老年 | B | [npc_jingzhidashi.md](ch14-xueshan/npc_jingzhidashi.md) | `por_npc_jingzhidashi__ch14_base` | `assets/default/character/male/ch14/por_npc_jingzhidashi__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 刘元鹤 | `npc_liuyuanhe` | 男 | 壮年 | A | [npc_liuyuanhe.md](ch14-xueshan/npc_liuyuanhe.md) | `por_npc_liuyuanhe__ch14_base` | `assets/default/character/male/ch14/por_npc_liuyuanhe__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 苗人凤 | `npc_miaorenfeng` | 男 | 老年 | S | [npc_miaorenfeng.md](ch14-xueshan/npc_miaorenfeng.md) | `por_npc_miaorenfeng__ch14_elder_base` | `assets/default/character/male/ch14/por_npc_miaorenfeng__ch14_elder_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 苗若兰 | `npc_miaoruolan` | 女 | 青年 | S | [npc_miaoruolan.md](ch14-xueshan/npc_miaoruolan.md) | `por_npc_miaoruolan__ch14_youth_base` | `assets/default/character/female/ch14/por_npc_miaoruolan__ch14_youth_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 南兰 | `npc_nanlan` | 女 | 青年 | A | [npc_nanlan.md](ch14-xueshan/npc_nanlan.md) | `por_npc_nanlan__ch14_youth_memory_base` | `assets/default/character/female/ch14/por_npc_nanlan__ch14_youth_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 平阿四 | `npc_pingasi` | 男 | 老年 | A | [npc_pingasi.md](ch14-xueshan/npc_pingasi.md) | `por_npc_pingasi__ch14_elder_onearm_base` | `assets/default/character/male/ch14/por_npc_pingasi__ch14_elder_onearm_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 阮士中 | `npc_ruanshizhong` | 男 | 壮年 | A | [npc_ruanshizhong.md](ch14-xueshan/npc_ruanshizhong.md) | `por_npc_ruanshizhong__ch14_base` | `assets/default/character/male/ch14/por_npc_ruanshizhong__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 赛总管 | `npc_saizongguan` | 男 | 壮年 | S | [npc_saizongguan.md](ch14-xueshan/npc_saizongguan.md) | `por_npc_saizongguan__ch14_base` | `assets/default/character/male/ch14/por_npc_saizongguan__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陶百岁 | `npc_taobaisui` | 男 | 老年 | A | [npc_taobaisui.md](ch14-xueshan/npc_taobaisui.md) | `por_npc_taobaisui__ch14_base` | `assets/default/character/male/ch14/por_npc_taobaisui__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 陶子安 | `npc_taozian` | 男 | 青年 | A | [npc_taozian.md](ch14-xueshan/npc_taozian.md) | `por_npc_taozian__ch14_base` | `assets/default/character/male/ch14/por_npc_taozian__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 田归农 | `npc_tianguinong` | 男 | 壮年 | A | [npc_tianguinong.md](ch14-xueshan/npc_tianguinong.md) | `por_npc_tianguinong__ch14_prime_memory_base` | `assets/default/character/male/ch14/por_npc_tianguinong__ch14_prime_memory_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 田青文 | `npc_tianqingwen` | 女 | 青年 | A | [npc_tianqingwen.md](ch14-xueshan/npc_tianqingwen.md) | `por_npc_tianqingwen__ch14_base` | `assets/default/character/female/ch14/por_npc_tianqingwen__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 熊元献 | `npc_xiongyuanxian` | 男 | 壮年 | A | [npc_xiongyuanxian.md](ch14-xueshan/npc_xiongyuanxian.md) | `por_npc_xiongyuanxian__ch14_base` | `assets/default/character/male/ch14/por_npc_xiongyuanxian__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 殷吉 | `npc_yinji` | 男 | 壮年 | A | [npc_yinji.md](ch14-xueshan/npc_yinji.md) | `por_npc_yinji__ch14_base` | `assets/default/character/male/ch14/por_npc_yinji__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 郑三娘 | `npc_zhengsanniang` | 女 | 壮年 | A | [npc_zhengsanniang.md](ch14-xueshan/npc_zhengsanniang.md) | `por_npc_zhengsanniang__ch14_base` | `assets/default/character/female/ch14/por_npc_zhengsanniang__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
| 补齐 | 周云阳 | `npc_zhouyunyang` | 男 | 壮年 | B | [npc_zhouyunyang.md](ch14-xueshan/npc_zhouyunyang.md) | `por_npc_zhouyunyang__ch14_base` | `assets/default/character/male/ch14/por_npc_zhouyunyang__ch14_base.png` | ready；待生成（全人物补齐，candidate待审核） |
<!-- full-coverage-import:table-end:v1 -->

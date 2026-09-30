# 人物立绘提示词 · 总索引

> 本文件由 `tools/agents/build_portrait_index.py` 生成，不要手改；改提示词就改各人物文件，改规程就改 `GUIDE.md`，然后重新生成。
> 每个人物一份提示词文件（`<分组>/<id>.md`）：文首 frontmatter 写明立绘素材 ID、输出文件与登记清单的位置，正文是人物要点、完整提示词、排除项与质检要点。

已合入 **112** 份：女 33、男 78、其他 1；品质档 A 37、B 17、S 58。

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

提示词由 GPT CLI 按书界并行撰写，逐个书界过审后合入；本表在每次合入后重新生成。全部合入后本节自动消失。

| 分组 | 目录 | 状态 |
|---|---|---|
| ch01 · 《天龙八部》 | `ch01-tianlong/` | 已合入 40 份 |
| ch02 · 《射雕英雄传》 | `ch02-shediao/` | 撰写 / 审核中，草稿已写 37 份（未合入，草稿在 `.agents/wt/ART-P-ch02/assets/default/prompts/characters/ch02-shediao/`） |
| ch03 · 《神雕侠侣》 | `ch03-shendiao/` | 撰写 / 审核中，草稿已写 35 份（未合入，草稿在 `.agents/wt/ART-P-ch03/assets/default/prompts/characters/ch03-shendiao/`） |
| ch04 · 《倚天屠龙记》 | `ch04-yitian/` | 撰写 / 审核中，草稿已写 38 份（未合入，草稿在 `.agents/wt/ART-P-ch04/assets/default/prompts/characters/ch04-yitian/`） |
| ch05 · 《笑傲江湖》 | `ch05-xiaoao/` | 撰写 / 审核中，草稿已写 26 份（未合入，草稿在 `.agents/wt/ART-P-ch05/assets/default/prompts/characters/ch05-xiaoao/`） |
| ch06 · 《侠客行》 | `ch06-xiake/` | 撰写 / 审核中，草稿已写 26 份（未合入，草稿在 `.agents/wt/ART-P-ch06/assets/default/prompts/characters/ch06-xiake/`） |
| ch07 · 《碧血剑》 | `ch07-bixue/` | 撰写 / 审核中，草稿已写 40 份（未合入，草稿在 `.agents/wt/ART-P-ch07/assets/default/prompts/characters/ch07-bixue/`） |
| ch08 · 《鹿鼎记》 | `ch08-luding/` | 撰写 / 审核中，草稿已写 34 份（未合入，草稿在 `.agents/wt/ART-P-ch08/assets/default/prompts/characters/ch08-luding/`） |
| ch09 · 《连城诀》 | `ch09-liancheng/` | 撰写 / 审核中，草稿已写 27 份（未合入，草稿在 `.agents/wt/ART-P-ch09/assets/default/prompts/characters/ch09-liancheng/`） |
| ch10 · 《白马啸西风》 | `ch10-baima/` | 已合入 21 份 |
| ch11 · 《鸳鸯刀》 | `ch11-yuanyang/` | 已合入 20 份 |
| ch12 · 《书剑恩仇录》 | `ch12-shujian/` | 撰写 / 审核中，草稿已写 36 份（未合入，草稿在 `.agents/wt/ART-P-ch12/assets/default/prompts/characters/ch12-shujian/`） |
| ch13 · 《飞狐外传》 | `ch13-feihu/` | 撰写 / 审核中，草稿已写 33 份（未合入，草稿在 `.agents/wt/ART-P-ch13/assets/default/prompts/characters/ch13-feihu/`） |
| ch14 · 《雪山飞狐》 | `ch14-xueshan/` | 撰写 / 审核中，草稿已写 23 份（未合入，草稿在 `.agents/wt/ART-P-ch14/assets/default/prompts/characters/ch14-xueshan/`） |
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
| 1 | 阿碧 | `npc_abi` | 女 | 少年 / 青年 | A | [npc_abi.md](ch01-tianlong/npc_abi.md) | `por_npc_abi__ch01_youth_qinyun_base` | `assets/default/character/female/ch01/por_npc_abi__ch01_youth_qinyun_base.png` | ready |
| 2 | 阿朱 | `npc_azhu` | 女 | 少年 / 青年 | S | [npc_azhu.md](ch01-tianlong/npc_azhu.md) | `por_npc_azhu__ch01_youth_alive_base` | `assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png` | ready |
| 3 | 阿紫 | `npc_azi` | 女 | 少年 / 青年 | S | [npc_azi.md](ch01-tianlong/npc_azi.md) | `por_npc_azi__ch01_youth_sighted_base` | `assets/default/character/female/ch01/por_npc_azi__ch01_youth_sighted_base.png` | ready |
| 4 | 白世镜 | `npc_baishijing` | 男 | 壮年 | A | [npc_baishijing.md](ch01-tianlong/npc_baishijing.md) | `por_npc_baishijing__ch01_prime_xingzilin_base` | `assets/default/character/male/ch01/por_npc_baishijing__ch01_prime_xingzilin_base.png` | ready |
| 5 | 包不同 | `npc_baobutong` | 男 | 壮年 | B | [npc_baobutong.md](ch01-tianlong/npc_baobutong.md) | `por_npc_baobutong__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_baobutong__ch01_prime_baseform_base.png` | ready |
| 6 | 刀白凤 | `npc_daobaifeng` | 女 | 壮年 | A | [npc_daobaifeng.md](ch01-tianlong/npc_daobaifeng.md) | `por_npc_daobaifeng__ch01_prime_yuxu_base` | `assets/default/character/female/ch01/por_npc_daobaifeng__ch01_prime_yuxu_base.png` | ready |
| 7 | 邓百川 | `npc_dengbaichuan` | 男 | 壮年 | B | [npc_dengbaichuan.md](ch01-tianlong/npc_dengbaichuan.md) | `por_npc_dengbaichuan__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_dengbaichuan__ch01_prime_baseform_base.png` | ready |
| 8 | 丁春秋 | `npc_dingchunqiu` | 男 | 老年 | S | [npc_dingchunqiu.md](ch01-tianlong/npc_dingchunqiu.md) | `por_npc_dingchunqiu__ch01_elder_free_base` | `assets/default/character/male/ch01/por_npc_dingchunqiu__ch01_elder_free_base.png` | ready |
| 9 | 段延庆 | `npc_duanyanqing` | 男 | 老年 | S | [npc_duanyanqing.md](ch01-tianlong/npc_duanyanqing.md) | `por_npc_duanyanqing__ch01_elder_disabled_base` | `assets/default/character/male/ch01/por_npc_duanyanqing__ch01_elder_disabled_base.png` | ready |
| 10 | 段誉 | `npc_duanyu` | 男 | 少年 / 青年 | S | [npc_duanyu.md](ch01-tianlong/npc_duanyu.md) | `por_npc_duanyu__ch01_youth_shizi_base` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_shizi_base.png` | ready |
| 11 | 段正淳 | `npc_duanzhengchun` | 男 | 壮年 | A | [npc_duanzhengchun.md](ch01-tianlong/npc_duanzhengchun.md) | `por_npc_duanzhengchun__ch01_prime_wangye_base` | `assets/default/character/male/ch01/por_npc_duanzhengchun__ch01_prime_wangye_base.png` | ready |
| 12 | 段正明 | `npc_duanzhengming` | 男 | 壮年 | A | [npc_duanzhengming.md](ch01-tianlong/npc_duanzhengming.md) | `por_npc_duanzhengming__ch01_prime_emperor_base` | `assets/default/character/male/ch01/por_npc_duanzhengming__ch01_prime_emperor_base.png` | ready |
| 13 | 风波恶 | `npc_fengboe` | 男 | 壮年 | B | [npc_fengboe.md](ch01-tianlong/npc_fengboe.md) | `por_npc_fengboe__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_fengboe__ch01_prime_baseform_base.png` | ready |
| 14 | 鸠摩智 | `npc_jiumozhi` | 男 | 壮年 | S | [npc_jiumozhi.md](ch01-tianlong/npc_jiumozhi.md) | `por_npc_jiumozhi__ch01_prime_guoshi_base` | `assets/default/character/male/ch01/por_npc_jiumozhi__ch01_prime_guoshi_base.png` | ready |
| 15 | 枯荣大师 | `npc_kurong` | 男 | 老年 | A | [npc_kurong.md](ch01-tianlong/npc_kurong.md) | `por_npc_kurong__ch01_elder_hujing_base` | `assets/default/character/male/ch01/por_npc_kurong__ch01_elder_hujing_base.png` | ready |
| 16 | 李秋水 | `npc_liqiushui` | 女 | 老年 | S | [npc_liqiushui.md](ch01-tianlong/npc_liqiushui.md) | `por_npc_liqiushui__ch01_elder_veiled_base` | `assets/default/character/female/ch01/por_npc_liqiushui__ch01_elder_veiled_base.png` | ready |
| 17 | 慕容博 | `npc_murongbo` | 男 | 老年 | S | [npc_murongbo.md](ch01-tianlong/npc_murongbo.md) | `por_npc_murongbo__ch01_elder_revealed_base` | `assets/default/character/male/ch01/por_npc_murongbo__ch01_elder_revealed_base.png` | ready |
| 18 | 慕容复 | `npc_murongfu` | 男 | 壮年 | S | [npc_murongfu.md](ch01-tianlong/npc_murongfu.md) | `por_npc_murongfu__ch01_prime_jiazhu_base` | `assets/default/character/male/ch01/por_npc_murongfu__ch01_prime_jiazhu_base.png` | ready |
| 19 | 木婉清 | `npc_muwanqing` | 女 | 少年 / 青年 | A | [npc_muwanqing.md](ch01-tianlong/npc_muwanqing.md) | `por_npc_muwanqing__ch01_youth_unmasked_base` | `assets/default/character/female/ch01/por_npc_muwanqing__ch01_youth_unmasked_base.png` | ready |
| 20 | 扫地僧 | `npc_saodiseng` | 男 | 老年 | A | [npc_saodiseng.md](ch01-tianlong/npc_saodiseng.md) | `por_npc_saodiseng__ch01_elder_cangjingge_base` | `assets/default/character/male/ch01/por_npc_saodiseng__ch01_elder_cangjingge_base.png` | ready |
| 21 | 司空玄 | `npc_sikongxuan` | 男 | 壮年 | B | [npc_sikongxuan.md](ch01-tianlong/npc_sikongxuan.md) | `por_npc_sikongxuan__ch01_prime_wuliang_base` | `assets/default/character/male/ch01/por_npc_sikongxuan__ch01_prime_wuliang_base.png` | ready |
| 22 | 苏星河 | `npc_suxinghe` | 男 | 老年 | A | [npc_suxinghe.md](ch01-tianlong/npc_suxinghe.md) | `por_npc_suxinghe__ch01_elder_zhenlong_base` | `assets/default/character/male/ch01/por_npc_suxinghe__ch01_elder_zhenlong_base.png` | ready |
| 23 | 天山童姥 | `npc_tonglao` | 女 | 老年 | S | [npc_tonglao.md](ch01-tianlong/npc_tonglao.md) | `por_npc_tonglao__ch01_elder_rejuvenating_base` | `assets/default/character/female/ch01/por_npc_tonglao__ch01_elder_rejuvenating_base.png` | ready |
| 24 | 王语嫣 | `npc_wangyuyan` | 女 | 少年 / 青年 | S | [npc_wangyuyan.md](ch01-tianlong/npc_wangyuyan.md) | `por_npc_wangyuyan__ch01_youth_mantuo_base` | `assets/default/character/female/ch01/por_npc_wangyuyan__ch01_youth_mantuo_base.png` | ready |
| 25 | 吴长风 | `npc_wuchangfeng` | 男 | 老年 | B | [npc_wuchangfeng.md](ch01-tianlong/npc_wuchangfeng.md) | `por_npc_wuchangfeng__ch01_elder_xingzilin_base` | `assets/default/character/male/ch01/por_npc_wuchangfeng__ch01_elder_xingzilin_base.png` | ready |
| 26 | 无崖子 | `npc_wuyazi` | 男 | 老年 | A | [npc_wuyazi.md](ch01-tianlong/npc_wuyazi.md) | `por_npc_wuyazi__ch01_elder_pretransfer_base` | `assets/default/character/male/ch01/por_npc_wuyazi__ch01_elder_pretransfer_base.png` | ready |
| 27 | 萧峰 | `npc_xiaofeng` | 男 | 壮年 | S | [npc_xiaofeng.md](ch01-tianlong/npc_xiaofeng.md) | `por_npc_xiaofeng__ch01_prime_gaibang_base` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png` | ready |
| 28 | 萧远山 | `npc_xiaoyuanshan` | 男 | 老年 | S | [npc_xiaoyuanshan.md](ch01-tianlong/npc_xiaoyuanshan.md) | `por_npc_xiaoyuanshan__ch01_elder_revealed_base` | `assets/default/character/male/ch01/por_npc_xiaoyuanshan__ch01_elder_revealed_base.png` | ready |
| 29 | 辛双清 | `npc_xinshuangqing` | 女 | 壮年 | B | [npc_xinshuangqing.md](ch01-tianlong/npc_xinshuangqing.md) | `por_npc_xinshuangqing__ch01_prime_wuliang_base` | `assets/default/character/female/ch01/por_npc_xinshuangqing__ch01_prime_wuliang_base.png` | ready |
| 30 | 玄慈 | `npc_xuanci` | 男 | 老年 | S | [npc_xuanci.md](ch01-tianlong/npc_xuanci.md) | `por_npc_xuanci__ch01_elder_fangzhang_base` | `assets/default/character/male/ch01/por_npc_xuanci__ch01_elder_fangzhang_base.png` | ready |
| 31 | 薛慕华 | `npc_xuemuhua` | 男 | 壮年 | A | [npc_xuemuhua.md](ch01-tianlong/npc_xuemuhua.md) | `por_npc_xuemuhua__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_xuemuhua__ch01_prime_juxian_base.png` | ready |
| 32 | 虚竹 | `npc_xuzhu` | 男 | 少年 / 青年 | S | [npc_xuzhu.md](ch01-tianlong/npc_xuzhu.md) | `por_npc_xuzhu__ch01_youth_lingjiu_base` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_lingjiu_base.png` | ready |
| 33 | 叶二娘 | `npc_yeerniang` | 女 | 壮年 | A | [npc_yeerniang.md](ch01-tianlong/npc_yeerniang.md) | `por_npc_yeerniang__ch01_prime_prereunion_base` | `assets/default/character/female/ch01/por_npc_yeerniang__ch01_prime_prereunion_base.png` | ready |
| 34 | 游骥 | `npc_youji` | 男 | 壮年 | A | [npc_youji.md](ch01-tianlong/npc_youji.md) | `por_npc_youji__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_youji__ch01_prime_juxian_base.png` | ready |
| 35 | 游驹 | `npc_youju` | 男 | 壮年 | A | [npc_youju.md](ch01-tianlong/npc_youju.md) | `por_npc_youju__ch01_prime_juxian_base` | `assets/default/character/male/ch01/por_npc_youju__ch01_prime_juxian_base.png` | ready |
| 36 | 游坦之 | `npc_youtanzhi` | 男 | 少年 / 青年 | S | [npc_youtanzhi.md](ch01-tianlong/npc_youtanzhi.md) | `por_npc_youtanzhi__ch01_youth_ironmask_base` | `assets/default/character/male/ch01/por_npc_youtanzhi__ch01_youth_ironmask_base.png` | ready |
| 37 | 岳老三 | `npc_yuelaosan` | 男 | 壮年 | A | [npc_yuelaosan.md](ch01-tianlong/npc_yuelaosan.md) | `por_npc_yuelaosan__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_yuelaosan__ch01_prime_baseform_base.png` | ready |
| 38 | 云中鹤 | `npc_yunzhonghe` | 男 | 壮年 | A | [npc_yunzhonghe.md](ch01-tianlong/npc_yunzhonghe.md) | `por_npc_yunzhonghe__ch01_prime_baseform_base` | `assets/default/character/male/ch01/por_npc_yunzhonghe__ch01_prime_baseform_base.png` | ready |
| 39 | 钟灵 | `npc_zhongling` | 女 | 少年 / 青年 | A | [npc_zhongling.md](ch01-tianlong/npc_zhongling.md) | `por_npc_zhongling__ch01_youth_diaoalive_base` | `assets/default/character/female/ch01/por_npc_zhongling__ch01_youth_diaoalive_base.png` | ready |
| 40 | 左子穆 | `npc_zuozimu` | 男 | 壮年 | B | [npc_zuozimu.md](ch01-tianlong/npc_zuozimu.md) | `por_npc_zuozimu__ch01_prime_wuliang_base` | `assets/default/character/male/ch01/por_npc_zuozimu__ch01_prime_wuliang_base.png` | ready |

### ch10 · 《白马啸西风》

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 阿曼 | `npc_aman` | 女 | 少年 / 青年 | S | [npc_aman.md](ch10-baima/npc_aman.md) | `por_npc_aman__ch10_base` | `assets/default/character/female/ch10/por_npc_aman__ch10_base.png` | ready |
| 2 | 车尔库 | `npc_cheerku` | 男 | 老年 | A | [npc_cheerku.md](ch10-baima/npc_cheerku.md) | `por_npc_cheerku__ch10_base` | `assets/default/character/male/ch10/por_npc_cheerku__ch10_base.png` | ready |
| 3 | 陈达海 | `npc_chendahai` | 男 | 壮年 | S | [npc_chendahai.md](ch10-baima/npc_chendahai.md) | `por_npc_chendahai__ch10_prime_snownight_base` | `assets/default/character/male/ch10/por_npc_chendahai__ch10_prime_snownight_base.png` | ready |
| 4 | 丁同 | `npc_dingtong` | 男 | 壮年 | B | [npc_dingtong.md](ch10-baima/npc_dingtong.md) | `por_npc_dingtong__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_dingtong__ch10_prime_prologue_base.png` | ready |
| 5 | 段霜 | `npc_duanshuang10` | 男 | 少年 / 青年 | B | [npc_duanshuang10.md](ch10-baima/npc_duanshuang10.md) | `por_npc_duanshuang10__ch10_base` | `assets/default/character/male/ch10/por_npc_duanshuang10__ch10_base.png` | ready |
| 6 | 哈卜拉姆 | `npc_habulamu` | 男 | 老年 | A | [npc_habulamu.md](ch10-baima/npc_habulamu.md) | `por_npc_habulamu__ch10_base` | `assets/default/character/male/ch10/por_npc_habulamu__ch10_base.png` | ready |
| 7 | 韩禾 | `npc_hanhe10` | 男 | 少年 / 青年 | B | [npc_hanhe10.md](ch10-baima/npc_hanhe10.md) | `por_npc_hanhe10__ch10_base` | `assets/default/character/male/ch10/por_npc_hanhe10__ch10_base.png` | ready |
| 8 | 霍元龙 | `npc_huoyuanlong` | 男 | 壮年 | S | [npc_huoyuanlong.md](ch10-baima/npc_huoyuanlong.md) | `por_npc_huoyuanlong__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_huoyuanlong__ch10_prime_prologue_base.png` | ready |
| 9 | 白马李三 | `npc_lisan` | 男 | 壮年 | A | [npc_lisan.md](ch10-baima/npc_lisan.md) | `por_npc_lisan__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_lisan__ch10_prime_prologue_base.png` | ready |
| 10 | 李文秀 | `npc_liwenxiu` | 女 | 少年 / 青年 | S | [npc_liwenxiu.md](ch10-baima/npc_liwenxiu.md) | `por_npc_liwenxiu__ch10_youth_astuo_base` | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_astuo_base.png` | ready |
| 11 | 马家骏 | `npc_majiajun` | 男 | 老年 | S | [npc_majiajun.md](ch10-baima/npc_majiajun.md) | `por_npc_majiajun__ch10_elder_disguised_base` | `assets/default/character/male/ch10/por_npc_majiajun__ch10_elder_disguised_base.png` | ready |
| 12 | 姓全的强人 | `npc_quanqiangdao` | 男 | 壮年 | B | [npc_quanqiangdao.md](ch10-baima/npc_quanqiangdao.md) | `por_npc_quanqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_quanqiangdao__ch10_base.png` | ready |
| 13 | 桑斯儿 | `npc_sangsi` | 男 | 少年 / 青年 | A | [npc_sangsi.md](ch10-baima/npc_sangsi.md) | `por_npc_sangsi__ch10_base` | `assets/default/character/male/ch10/por_npc_sangsi__ch10_base.png` | ready |
| 14 | 上官虹 | `npc_shangguanhong` | 女 | 少年 / 青年 | A | [npc_shangguanhong.md](ch10-baima/npc_shangguanhong.md) | `por_npc_shangguanhong__ch10_youth_prologue_base` | `assets/default/character/female/ch10/por_npc_shangguanhong__ch10_youth_prologue_base.png` | ready |
| 15 | 沈青禾 | `npc_shenqinghe10` | 男 | 壮年 | A | [npc_shenqinghe10.md](ch10-baima/npc_shenqinghe10.md) | `por_npc_shenqinghe10__ch10_base` | `assets/default/character/male/ch10/por_npc_shenqinghe10__ch10_base.png` | ready |
| 16 | 史仲俊 | `npc_shizhongjun` | 男 | 壮年 | A | [npc_shizhongjun.md](ch10-baima/npc_shizhongjun.md) | `por_npc_shizhongjun__ch10_prime_prologue_base` | `assets/default/character/male/ch10/por_npc_shizhongjun__ch10_prime_prologue_base.png` | ready |
| 17 | 姓宋的强人 | `npc_songqiangdao` | 男 | 壮年 | B | [npc_songqiangdao.md](ch10-baima/npc_songqiangdao.md) | `por_npc_songqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_songqiangdao__ch10_base.png` | ready |
| 18 | 苏鲁克 | `npc_suluke` | 男 | 老年 | A | [npc_suluke.md](ch10-baima/npc_suluke.md) | `por_npc_suluke__ch10_base` | `assets/default/character/male/ch10/por_npc_suluke__ch10_base.png` | ready |
| 19 | 苏普 | `npc_supu` | 男 | 少年 / 青年 | S | [npc_supu.md](ch10-baima/npc_supu.md) | `por_npc_supu__ch10_youth_base` | `assets/default/character/male/ch10/por_npc_supu__ch10_youth_base.png` | ready |
| 20 | 瓦耳拉齐 | `npc_walazi` | 男 | 老年 | S | [npc_walazi.md](ch10-baima/npc_walazi.md) | `por_npc_walazi__ch10_elder_unmasked_base` | `assets/default/character/male/ch10/por_npc_walazi__ch10_elder_unmasked_base.png` | ready |
| 21 | 姓云的强人 | `npc_yunqiangdao` | 男 | 壮年 | B | [npc_yunqiangdao.md](ch10-baima/npc_yunqiangdao.md) | `por_npc_yunqiangdao__ch10_base` | `assets/default/character/male/ch10/por_npc_yunqiangdao__ch10_base.png` | ready |

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
| 14 | 萧中慧 | `npc_xiaozhonghui` | 女 | 少年 / 青年 | S | [npc_xiaozhonghui.md](ch11-yuanyang/npc_xiaozhonghui.md) | `por_npc_xiaozhonghui__ch11_youth_departure_base` | `assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_departure_base.png` | ready |
| 15 | 杨夫人 | `npc_yangfuren` | 女 | 壮年 | A | [npc_yangfuren.md](ch11-yuanyang/npc_yangfuren.md) | `por_npc_yangfuren__ch11_base` | `assets/default/character/female/ch11/por_npc_yangfuren__ch11_base.png` | ready |
| 16 | 严和 | `npc_yanhe11` | 男 | 壮年 | B | [npc_yanhe11.md](ch11-yuanyang/npc_yanhe11.md) | `por_npc_yanhe11__ch11_base` | `assets/default/character/male/ch11/por_npc_yanhe11__ch11_base.png` | ready |
| 17 | 袁夫人 | `npc_yuanfuren` | 女 | 壮年 | A | [npc_yuanfuren.md](ch11-yuanyang/npc_yuanfuren.md) | `por_npc_yuanfuren__ch11_prime_reunion_base` | `assets/default/character/female/ch11/por_npc_yuanfuren__ch11_prime_reunion_base.png` | ready |
| 18 | 袁冠南 | `npc_yuanguannan` | 男 | 少年 / 青年 | S | [npc_yuanguannan.md](ch11-yuanyang/npc_yuanguannan.md) | `por_npc_yuanguannan__ch11_youth_scholar_base` | `assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scholar_base.png` | ready |
| 19 | 周威信 | `npc_zhouweixin` | 男 | 壮年 | A | [npc_zhouweixin.md](ch11-yuanyang/npc_zhouweixin.md) | `por_npc_zhouweixin__ch11_base` | `assets/default/character/male/ch11/por_npc_zhouweixin__ch11_base.png` | ready |
| 20 | 卓天雄 | `npc_zhuotianxiong` | 男 | 老年 | S | [npc_zhuotianxiong.md](ch11-yuanyang/npc_zhuotianxiong.md) | `por_npc_zhuotianxiong__ch11_elder_feignedblind_base` | `assets/default/character/male/ch11/por_npc_zhuotianxiong__ch11_elder_feignedblind_base.png` | ready |

### 主角与书灵

| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | 书灵·抽象墨影 | `npc_shuling` | 其他 | 壮年 | S | [npc_shuling.md](protagonist/npc_shuling.md) | `por_npc_shuling__ch00_base` | `assets/default/character/other/ch00/por_npc_shuling__ch00_base.png` | ready |
| 2 | 主角（女）· 春秋末·越国 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch00.md](protagonist/npc_zhujue__f_ch00.md) | `por_npc_zhujue__ch00_f_base` | `assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png` | ready |
| 3 | 主角（女）· 北宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch01.md](protagonist/npc_zhujue__f_ch01.md) | `por_npc_zhujue__ch01_f_base` | `assets/default/character/female/ch01/por_npc_zhujue__ch01_f_base.png` | ready |
| 4 | 主角（女）· 南宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch02.md](protagonist/npc_zhujue__f_ch02.md) | `por_npc_zhujue__ch02_f_base` | `assets/default/character/female/ch02/por_npc_zhujue__ch02_f_base.png` | ready |
| 5 | 主角（女）· 南宋 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch03.md](protagonist/npc_zhujue__f_ch03.md) | `por_npc_zhujue__ch03_f_base` | `assets/default/character/female/ch03/por_npc_zhujue__ch03_f_base.png` | ready |
| 6 | 主角（女）· 元末 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch04.md](protagonist/npc_zhujue__f_ch04.md) | `por_npc_zhujue__ch04_f_base` | `assets/default/character/female/ch04/por_npc_zhujue__ch04_f_base.png` | ready |
| 7 | 主角（女）· 明中叶 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch05.md](protagonist/npc_zhujue__f_ch05.md) | `por_npc_zhujue__ch05_f_base` | `assets/default/character/female/ch05/por_npc_zhujue__ch05_f_base.png` | ready |
| 8 | 主角（女）· 明代 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch06.md](protagonist/npc_zhujue__f_ch06.md) | `por_npc_zhujue__ch06_f_base` | `assets/default/character/female/ch06/por_npc_zhujue__ch06_f_base.png` | ready |
| 9 | 主角（女）· 明末 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch07.md](protagonist/npc_zhujue__f_ch07.md) | `por_npc_zhujue__ch07_f_base` | `assets/default/character/female/ch07/por_npc_zhujue__ch07_f_base.png` | ready |
| 10 | 主角（女）· 清初·康熙 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch08.md](protagonist/npc_zhujue__f_ch08.md) | `por_npc_zhujue__ch08_f_base` | `assets/default/character/female/ch08/por_npc_zhujue__ch08_f_base.png` | ready |
| 11 | 主角（女）· 本作清初·康熙 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch09.md](protagonist/npc_zhujue__f_ch09.md) | `por_npc_zhujue__ch09_f_base` | `assets/default/character/female/ch09/por_npc_zhujue__ch09_f_base.png` | ready |
| 12 | 主角（女）· 本作清初·回疆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch10.md](protagonist/npc_zhujue__f_ch10.md) | `por_npc_zhujue__ch10_f_base` | `assets/default/character/female/ch10/por_npc_zhujue__ch10_f_base.png` | ready |
| 13 | 主角（女）· 清乾隆初 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch11.md](protagonist/npc_zhujue__f_ch11.md) | `por_npc_zhujue__ch11_f_base` | `assets/default/character/female/ch11/por_npc_zhujue__ch11_f_base.png` | ready |
| 14 | 主角（女）· 清乾隆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch12.md](protagonist/npc_zhujue__f_ch12.md) | `por_npc_zhujue__ch12_f_base` | `assets/default/character/female/ch12/por_npc_zhujue__ch12_f_base.png` | ready |
| 15 | 主角（女）· 清乾隆 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch13.md](protagonist/npc_zhujue__f_ch13.md) | `por_npc_zhujue__ch13_f_base` | `assets/default/character/female/ch13/por_npc_zhujue__ch13_f_base.png` | ready |
| 16 | 主角（女）· 清乾隆·雪地 | `npc_zhujue` | 女 | 壮年 | S | [npc_zhujue__f_ch14.md](protagonist/npc_zhujue__f_ch14.md) | `por_npc_zhujue__ch14_f_base` | `assets/default/character/female/ch14/por_npc_zhujue__ch14_f_base.png` | ready |
| 17 | 主角（男）· 春秋末·越国 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch00.md](protagonist/npc_zhujue__m_ch00.md) | `por_npc_zhujue__ch00_m_base` | `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png` | ready |
| 18 | 主角（男）· 北宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch01.md](protagonist/npc_zhujue__m_ch01.md) | `por_npc_zhujue__ch01_m_base` | `assets/default/character/male/ch01/por_npc_zhujue__ch01_m_base.png` | ready |
| 19 | 主角（男）· 南宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch02.md](protagonist/npc_zhujue__m_ch02.md) | `por_npc_zhujue__ch02_m_base` | `assets/default/character/male/ch02/por_npc_zhujue__ch02_m_base.png` | ready |
| 20 | 主角（男）· 南宋 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch03.md](protagonist/npc_zhujue__m_ch03.md) | `por_npc_zhujue__ch03_m_base` | `assets/default/character/male/ch03/por_npc_zhujue__ch03_m_base.png` | ready |
| 21 | 主角（男）· 元末 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch04.md](protagonist/npc_zhujue__m_ch04.md) | `por_npc_zhujue__ch04_m_base` | `assets/default/character/male/ch04/por_npc_zhujue__ch04_m_base.png` | ready |
| 22 | 主角（男）· 明中叶 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch05.md](protagonist/npc_zhujue__m_ch05.md) | `por_npc_zhujue__ch05_m_base` | `assets/default/character/male/ch05/por_npc_zhujue__ch05_m_base.png` | ready |
| 23 | 主角（男）· 明代 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch06.md](protagonist/npc_zhujue__m_ch06.md) | `por_npc_zhujue__ch06_m_base` | `assets/default/character/male/ch06/por_npc_zhujue__ch06_m_base.png` | ready |
| 24 | 主角（男）· 明末 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch07.md](protagonist/npc_zhujue__m_ch07.md) | `por_npc_zhujue__ch07_m_base` | `assets/default/character/male/ch07/por_npc_zhujue__ch07_m_base.png` | ready |
| 25 | 主角（男）· 清初·康熙 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch08.md](protagonist/npc_zhujue__m_ch08.md) | `por_npc_zhujue__ch08_m_base` | `assets/default/character/male/ch08/por_npc_zhujue__ch08_m_base.png` | ready |
| 26 | 主角（男）· 本作清初·康熙 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch09.md](protagonist/npc_zhujue__m_ch09.md) | `por_npc_zhujue__ch09_m_base` | `assets/default/character/male/ch09/por_npc_zhujue__ch09_m_base.png` | ready |
| 27 | 主角（男）· 本作清初·回疆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch10.md](protagonist/npc_zhujue__m_ch10.md) | `por_npc_zhujue__ch10_m_base` | `assets/default/character/male/ch10/por_npc_zhujue__ch10_m_base.png` | ready |
| 28 | 主角（男）· 清乾隆初 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch11.md](protagonist/npc_zhujue__m_ch11.md) | `por_npc_zhujue__ch11_m_base` | `assets/default/character/male/ch11/por_npc_zhujue__ch11_m_base.png` | ready |
| 29 | 主角（男）· 清乾隆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch12.md](protagonist/npc_zhujue__m_ch12.md) | `por_npc_zhujue__ch12_m_base` | `assets/default/character/male/ch12/por_npc_zhujue__ch12_m_base.png` | ready |
| 30 | 主角（男）· 清乾隆 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch13.md](protagonist/npc_zhujue__m_ch13.md) | `por_npc_zhujue__ch13_m_base` | `assets/default/character/male/ch13/por_npc_zhujue__ch13_m_base.png` | ready |
| 31 | 主角（男）· 清乾隆·雪地 | `npc_zhujue` | 男 | 壮年 | S | [npc_zhujue__m_ch14.md](protagonist/npc_zhujue__m_ch14.md) | `por_npc_zhujue__ch14_m_base` | `assets/default/character/male/ch14/por_npc_zhujue__ch14_m_base.png` | ready |

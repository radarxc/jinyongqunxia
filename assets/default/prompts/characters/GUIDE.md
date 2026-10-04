# 人物立绘提示词 · 生成与存放规程

> 2026-10-02 起以本文 §0（作者 AR-29 / AR-30）为准：禁止幼态、去 AI 味、只用文字借鉴经典造型、不上传剧照、不复刻真人面容，重出与补出条目用 `## Gemini 提示词` 出图。
>
> **2026-10-02 作者 AR-32 补充（覆盖下文「不上传剧照」，只适用于主要角色）**：各书主要角色（男女主角、与主角紧密关联的人物）改用 `codex exec`，同时上传该角色经典影视版剧照（取造型、气质、面部特征）和同性别基线立绘（取画风）重新绘制，输出必须是项目画风，不复制剧照的构图、光影与照片质感；提示词里仍不写演员名。版本：倚天苏有朋版、黄蓉朱茵版、笑傲与碧血港版；侠客、鸳鸯、白马用《金庸群侠传》头像作参考。配角与路人仍只用文字。剧照只放在不入库的 `.agents/coord/imagegen-reference/`，manifest 记原路径与 sha256。风险：新图会接近演员本人样貌，自娱可以，将来公开发布需替换。
> 此前的作者规范 [全人物覆盖、正面端正与逐人面容参考](../../../../.agents/coord/portrait-generation/FULL-COVERAGE-IDENTITY-20261001.md) 中“指定游戏/影视人物面容参考获授权”一句已由 AR-30 作废；全人物范围、正面端正等其余要求仍有效。性别基线只作画风。未提交请求须先同步，既有真实请求不回写。
>
> **2026-10-03 作者 AR-58 补充（神态与参考）**：① 每个人物的神态按年龄与性格定，不要千篇一律的平静脸；性格不冷峻的人物可以微笑（温和、活泼、狡黠、豪爽各有其笑），冷峻、阴鸷、孤傲的保持各自的冷。② 作者点名「参考」某版本或某演员时，直接下载可核实的剧照作参考（只存 `imagegen-reference/`，记 SOURCES，不入库）。③ 主角基线以 AR-32「剧照结合版」与作者逐个选定的版本为准（AR-55 / AR-56），凌晨主角精修的复合基线不再作为基准。

在仓库根目录执行以下命令；所有 `assets/`、`docs/`、`tools/` 路径均相对仓库根目录。把本规程与目标人物提示词一起交给有 `view_image`、`image_gen` 的 GPT CLI 会话。
本规程供后续出图使用；总索引为 `assets/default/prompts/characters/INDEX.md`，由协调者生成。不要手改索引，不把提示词齐备当作图片已生成或已获批。

## 0. 重要人物重审口径（2026-10-02，AR-29 / AR-30，优先于下文）

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

## 1. 使用索引与安排批次

1. 把索引每一行当作一个 `asset_id` 对应的一张基础立绘；同一个人的跨书界、年龄或状态变体分别执行，不按中文姓名合并。
2. 以一个书界为一个批次，默认按 `ch01` → `ch14` 推进；主角首次形象及书灵的 `ch00` 行先作独立前置批次。书界分组从 `ch01-tianlong` 至 `ch14-xueshan`，另读 `protagonist/`。
3. 在每个书界批内先做 `S`，再做 `A`、`B`；同档优先本人已有已批准基线者，再做只有同性别风格基线者。等级取 frontmatter 的 `tier`，定义见 `docs/tech/07-asset-generation.md` §3，不另排战力等级。
4. 遇到参考或跨书依赖未满足的行，登记原因、转做本批其他可执行行；不要绕过审批门槛。完成可执行部分后整批交审，不逐张打扰作者。
5. 每人物默认生成 **2 张候选、选 1 张**；有明确缺陷时再补，单轮至多 **4 张**【建议值】，沿用 `tools/agents/prompts/ART-rework.md` 的 2–4 张范围。全部不合格则不入库，登记后安排返修。

## 2. 步骤一：读文件并核对身份与路径

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

## 3. 步骤二：准备并实际载入参考图

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

## 4. 步骤三：生成候选并逐张自查

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

## 5. 步骤四：按 output 原字节存放并实测

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

## 6. 步骤五：追加 manifest 登记

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

## 7. 步骤六：校验、交审与返修

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

## 8. 并行分工与跨书一致性

1. 每个生成批次只写自己书界的 `assets/default/character/<male|female|other>/<chNN>/` 图片与各目录 manifest；共用基线、STYLE、名录、模板与索引只读。提示词修正交相应负责人，提交与合入交协调者。
2. 给每个 manifest 指定唯一写入者；不同书界可并行，同一书界不得按人物拆成多个同时追加 manifest 的执行器。不要在共享目录放落选候选或别人的产物。
3. `protagonist/` 是提示词分组，不是输出隔离目录；其各时代版本落在相应书界目录。把主角行交该书界批次统一入库，或先完成主角阶段、释放目录后再做 NPC，避免两个批次同时写同一 manifest。
4. 同一 `subject_id` 的跨书版本使用各自 `asset_id`，先完成较早书界并获批，再把该图加入较晚版本的身份参考；主角男女分别保持各自同一人。具体年龄和形象阶段仍以该版名录、章节与剧情为准。

1，2，3，4太简单了，所以哦度斜对了

## 9. 常见问题与开放问题（附默认值）

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

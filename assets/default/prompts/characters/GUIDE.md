# 人物立绘提示词 · 生成与存放规程

在仓库根目录执行以下命令；所有 `assets/`、`docs/`、`tools/` 路径均相对仓库根目录。把本规程与目标人物提示词一起交给有 `view_image`、`image_gen` 的 GPT CLI 会话。
本规程供后续出图使用；总索引为 `assets/default/prompts/characters/INDEX.md`，由协调者生成。不要手改索引，不把提示词齐备当作图片已生成或已获批。

## 1. 使用索引与安排批次

1. 把索引每一行当作一个 `asset_id` 对应的一张基础立绘；同一个人的跨书界、年龄或状态变体分别执行，不按中文姓名合并。
2. 以一个书界为一个批次，默认按 `ch01` → `ch14` 推进；主角首次形象及书灵的 `ch00` 行先作独立前置批次。书界分组从 `ch01-tianlong` 至 `ch14-xueshan`，另读 `protagonist/`。
3. 在每个书界批内先做 `S`，再做 `A`、`B`；同档优先本人已有已批准基线者，再做只有同性别风格基线者。等级取 frontmatter 的 `tier`，定义见 `docs/tech/07-asset-generation.md` §3，不另排战力等级。
4. 遇到参考或跨书依赖未满足的行，登记原因、转做本批其他可执行行；不要绕过审批门槛。完成可执行部分后整批交审，不逐张打扰作者。
5. 每人物默认生成 **2 张候选、选 1 张**；有明确缺陷时再补，单轮至多 **4 张**【建议值】，沿用 `tools/agents/prompts/ART-rework.md` 的 2–4 张范围。全部不合格则不入库，登记后安排返修。

## 2. 步骤一：读文件并核对身份与路径

1. 先读 `assets/README.md`、`assets/default/STYLE.md`（含最新审批意见）；再读 `docs/tech/07-asset-generation.md` §1.3、§1.4、§2.9、§3、§5.2。
2. 读最新人物模板：男用 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md` §6–§7，女用 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md` §5–§6；不存在时读本工作区 `assets/default/prompts/` 同名文件。返修另读模板“局部返修 / 局部编辑”，不要复制整个通用模板覆盖人物提示词。
3. 从索引复制提示词路径，读完 frontmatter 与“人物要点 / 提示词 / 排除项 / 质检要点”四节。以下以天龙王语嫣行示范，换人时更换 `PROMPT`：

```bash
PROMPT='assets/default/prompts/characters/ch01-tianlong/npc_wangyuyan.md'
cat "$PROMPT"
python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/ch01-tianlong --book ch01 --catalog docs/design/catalog/npcs-ch01-tianlong.md
```

4. 核对 11 个键：`asset_id`、`subject_id`、`name`、`book`、`gender`、`age_variant`、`tier`、`output`、`manifest`、`references`、`status`；仅对 `status: ready` 出图，`draft` 先交提示词负责人完善。
5. 用 `docs/design/catalog/npcs-chNN-*.md` 核对主体，用 `docs/design/chapters/NN-*.md` 与 `docs/design/story/NN-*.md` 核对本阶段、兵器与伤残；年代查 `docs/design/02-timeline-and-world-tiers.md`，跨书年龄查 `docs/design/18-npc-and-companions.md`。主角、书灵另查 `docs/design/01-vision-and-core-loop.md` 与作者决定 P05、P54、P55。
6. 核对 `gender` 为 `male/female/other`、`age_variant` 为 `child/youth/prime/elder`、`tier` 为 `S/A/B`；取 `book` 前四位为 `chNN`，主角序章允许 `ch00`。
7. 确认 `asset_id` 以 `por_<subject_id>__` 开头，含本书界与必要变体键；`output` 必须是 `assets/default/character/<gender>/<chNN>/<asset_id>.png`，`manifest` 必须是同目录 `manifest.yaml`。从 frontmatter 取值，不凭姓名猜路径。
8. 将目标 ID 赋给 `ASSET_ID`，运行 `rg -n -F -- "$ASSET_ID" .` 全仓查重。允许索引与提示词引用同一 ID；已有图片或 manifest 条目时转 §7，禁止重复追加或直接覆盖。
9. 遵守事实优先级：作者已填决定 / 新增需求 → `docs/00-canon.md` → `docs/decisions/rulings-v1.md` → 唯一归属文档；本轮工具与风格执行本任务及 STYLE 已照录的新作者指令，不沿用旧 TraeX 入口。

## 3. 步骤二：准备并实际载入参考图

1. 逐条检查 frontmatter `references` 的路径和用途，打开参考图所属目录的 `manifest.yaml`；以当前版本条目的 `status: approved` 与实测哈希为准，不凭旧模板、“曾通过”或文件名认定批准。
2. 新人物只用项目自生成、已批准的同性别基线；到 `assets/default/baseline/character/<gender>/manifest.yaml` 选取。本人已有合格基线时排第一，注明“同一人物，保持面容与造型延续”；其他人基线仅约束纸底、光线、笔触、设色，不继承脸、体型、服饰与道具。
3. 先核对最新返修记录：同 ID 新版为 `candidate` 时不得继承旧版批准；有待合入返修而工作区仍留旧版时，交协调者确认当前供生产版本，默认暂缓该参考，不自行换用另一工作副本的图片。
4. 将所选参考的仓库路径赋给 `REF`，运行下列命令，取得绝对路径并与参考 manifest 的 `sha256` 比对；每张参考均如此处理：

```bash
python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve(strict=True))' "$REF"
shasum -a 256 "$REF"
```

5. 对每张绝对路径调用 `view_image` 实际查看，再把这些绝对路径按相同顺序传入 `image_gen` 的 `referenced_image_paths`。只在提示词中写路径不算输入参考；不要同时传 `num_last_images_to_include`。
6. 跨书同一人物追加较早书界已批准的自生成立绘作身份参考，先保留本人基线在第一位；较早版尚未批准则暂缓后版。保留脸部识别锚，年龄、伤残、衣装与装备仍服从目标书界。
7. `references: []` 不代表免审批许可；无合格同性别基线时先登记基线缺口，继续其他行。`other` 的生物 / 抽象书灵不套人类性别参考，缺相应已批准基线时先另派基线任务。
8. 实际输入必须与提示词的参考说明一致；需要替换、增删参考时，先由有写权限的提示词负责人同步文件并复检。入库 `references` 仅登记本次真正传入的图，不把历史输入或候选自动列入。

## 4. 步骤三：生成候选并逐张自查

1. 使用 `assets/README.md` 指定的本地 GPT CLI / Codex 内置 `image_gen`；执行配置按任务核实，默认 `gpt-6-astra`、`ultra`。工具不可用时登记阻断，不自行切换服务或用代码绘制人物。
2. 将人物文件“提示词”下 `text` 代码块全文原样作为主文本，紧接换行与“排除项”全文，组成实际 `prompt`。保留完整文字，不缩写、不把人物要点表替代提示词；`negative` 登记排除项同文。
3. 调用 `image_gen` 时设 `prompt` 为上述完整字符串，`referenced_image_paths` 为 §3 已查看的绝对路径数组，`transparent_background: false`。在文字中明确竖幅 `2:3`、单人全身、统一不透明暖浅灰纸底；若人物文件不符，先修提示词再调用。
4. 每次请求一张独立 PNG，默认调用两次形成两张候选；不要拼成二联画或联系表。只传当前工具实际支持的参数，不臆造 `n`、像素尺寸或种子参数；保存返回的每张原图路径及完整调用文本。
5. 对每张候选调用 `view_image`，逐条检查人物文件“质检要点”，再查以下通用清单；`B` 档也逐张自查。把候选数、入选理由、逐张淘汰原因记入最终条目的 `notes`。

| 检查项 | 执行动作 |
|---|---|
| 身份与阶段 | 对照年龄、体型、神情、脸部差异与标志物；不要提前出现后期官爵、兵器、伤残；同人物与参考并排看是否仍是同一个人。 |
| 风格与构图 | 落实男性偏写实、女性偏美丽；保留柔和左上光、暖浅灰纸底；完整保留头足、双手、兵器端点与衣带，人物占画高目标 88–92%，不得以裁边隐藏缺陷。 |
| 衣装与结构 | 按年代、族群、成长背景与身份核对；汉式交领为穿着者左襟压右襟的右衽，禁止水平翻转；查手指关节、握柄、鞘长与同轴、佩挂连接、重心。 |
| 年龄与尊重 | 未成年人物按实际年龄表现，衣着完整端庄，不成人化或性感化；老人、伤残及非标准体型如实表现，不恶搞丑化；非人形按其设定检查。 |
| 禁止项 | 不用演员肖像、剧照、受保护画作作图生图源；正负提示词均不写演员名、画师名、游戏公司或具体改编作品名；人物名、原著书界名可用于定位，不作仿作要求。 |
| 成图完整性 | 排除伪字、题字、签名、印章、装饰水印、现代物件、额外人物、畸形与无依据特效；保留工具自带水印、元数据及溯源标识，不去除或伪造。 |

6. 比较全部合格候选，选最符合人物与作者意见的一张；原著经典标志物错误、左衽、明显手部畸形等不作为“轻微偏差”放行。无法看清的结构写明未验证，不冒称合格。
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
8. 局部返修优先读男模板 §5–§6、女模板 §4–§5 的局部编辑用法：先 `view_image` 看作者指定底图，把它作为唯一编辑目标输入，明确修改区及保持的脸、体型、衣装、光照、构图；每张候选从同一底图独立编辑，复查非目标区域漂移。
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
| 图里出现文字、装饰水印或手部畸形 | 淘汰并写原因，补生成或按局部编辑流程修复人物结构；文字 / 装饰水印优先重出。工具自带溯源标识原样保留，不能裁边、涂抹、去标后入库。 |
| 原著标志物漏画或画错 | 回查该人物提示词依据、物品 / 武学图鉴及本书阶段；先改错词，再编辑或重出。未核清材料、数量等标（待考），不要凭记忆编回目，也不要为了“经典形象”提前加后期装备。 |
| 每人物候选张数需作者确认 | 默认 2 张、缺陷时补至单轮最多 4 张【建议值】；只选 1 张，全部不合格则 0 张入库，另列返修。 |
| 批次顺序需作者确认 | 默认主角首次形象 / 书灵 `ch00` 前置，随后 `ch01` → `ch14`；批内 `S` → `A` → `B`，同档本人已批准基线优先；独立书界可并行，跨书身份链保持先后。 |
| 是否把未通过审批的基线当参考 | 默认否；只有针对该图自身、已授权的局部返修可将其作为编辑底图，不能借此启动新人物批量生成。 |
| 正式立绘审批工具尚未接通 | 默认交协调者待审，不自行标通过；待审批页和回写覆盖正式目录后，按本规程 §7 完成作者审批。 |

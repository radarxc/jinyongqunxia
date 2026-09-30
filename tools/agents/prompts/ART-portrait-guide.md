# 本任务：人物立绘提示词 · 生成与存放规程（GUIDE.md）

本任务只写一份规程文档，**不出图**，不改策划 / 技术文档。上面"规则"一节里关于策划 / 技术文档格式的条目不适用；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者 2026-09-30 原话：

> 将所有人物立绘的prompt写到一个目录下（加上一个index md，索引各个人物的prompt，并指挥生成文件存到assets对应的人物目录里）。写好以后把这个index md的path发给我

提示词文件由并行任务写：`assets/default/prompts/characters/<分组>/<id>.md`，分组为 `ch01-tianlong` … `ch14-xueshan` 与 `protagonist`；每份文件文首 frontmatter 的键为 `asset_id`、`subject_id`、`name`、`book`、`gender`、`age_variant`、`tier`、`output`、`manifest`、`references`、`status`，正文四节为"人物要点 / 提示词 / 排除项 / 质检要点"（格式全文见 `tools/agents/prompts/ART-portrait-book.md`）。

总索引 `assets/default/prompts/characters/INDEX.md` 由协调者的脚本生成：**文首原样嵌入本任务写的 `GUIDE.md` 全文**，后面是按书界分组的人物索引表（人物 / ID / 性别 / 年龄段 / 品质档 / 提示词文件链接 / 输出文件 / 状态）。所以 GUIDE.md 就是作者说的"指挥生成文件存到 assets 对应的人物目录里"的那部分，要写到一个没有上下文的 GPT CLI 会话照着就能逐个出图并正确入库的程度。

输出：`assets/default/prompts/characters/GUIDE.md`（只写这一个文件）。

## 必读资料

`assets/README.md`（目录与 manifest 字段、生成工具）、`assets/default/STYLE.md`（风格、通用约束、审批流程）、最新人物模板（男 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md` §6 使用步骤与 §7 质检要点；女 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md`；不存在就用本工作区 `assets/default/prompts/` 下的同名文件）、`docs/tech/07-asset-generation.md` §1.3 / §1.4 / §2.9 / §3 / §5.2、`tools/agents/check_assets.py`、`tools/agents/prompts/ART-baseline.md` 与 `ART-rework.md`（现行出图任务怎么要求候选、自查、登记）。

## GUIDE.md 要写清楚的内容

1. **这份索引怎么用**：一行一个立绘；按什么顺序批量做（先 S 后 A、B；先有本人基线的人物；按书界分批，一个书界一个批次，便于并行且互不冲突）。
2. **出一张图的完整步骤**（写出确切路径与命令）：读提示词文件 → 核对 frontmatter → 准备参考图（只用 `status: approved` 的同性别基线；本人已有基线时放第一位；用 `view_image` 载入后把绝对路径传给 `image_gen` 的参考参数）→ 调 `image_gen`（原样使用"提示词"代码块全文加"排除项"；画幅 2:3；每个人物出几张候选）→ 逐张 `view_image` 对照该文件"质检要点"与通用质检清单自查 → 选定一张。
3. **存放**：选定图复制为 frontmatter `output` 指定的路径（`assets/default/character/<male|female|other>/<chNN>/<asset_id>.png`，目录不存在就建）；不改图片内容（不擅自裁切、镜像、放大、去标）；淘汰的候选不入库，只在记录里写数量与原因。
4. **登记**：在 frontmatter `manifest` 指定的 `manifest.yaml`（顶层为列表）追加一条，字段按 `assets/README.md`：`id`（= `asset_id`）、`file`、`category`（`character/male` 等）、`style: default`、`subject`、`prompt`（实际使用的完整提示词）、`negative`、`references`（实际输入的参考图与用途）、`tool`、`model`、`effort`、`created`、`source_path`、`size`、`sha256`（实测）、`status: candidate`、`notes`（候选数、淘汰原因、与提示词的偏差、待考项）。然后把提示词文件 frontmatter 的 `status` 留给审批流程去改，不要自己改成已通过。
5. **校验命令**：`python3 tools/agents/check_assets.py <manifest 所在目录> --min <n> --max <n>`；以及提示词文件的结构检查 `python3 tools/agents/check_portrait_prompts.py --dir <分组目录> …`。
6. **审批**：新图一律 `candidate`；GPT 审核通过后上审批页，作者通过才改 `approved`；作者要改的按意见返修（局部返修优先用编辑而不是重画，见模板"局部返修"）；`approved` 的文件与条目逐字节不动。
7. **硬约束**：STYLE.md 通用约束与 tech/07 §2.9（不用演员肖像、不写画师名与具体改编作品名、不以受保护的画作为图生图源）；汉式交领右衽、禁止水平翻转；未成年人物端庄得体；正式立绘母版规格与本批实际输出尺寸的关系（tech/07 §1.3 的 2048×3072 RGBA 母版是运行时规格；本批按工具实际输出登记实测尺寸，抠图与放大属于后续管线，不在出图这一步做）。
8. **并行与冲突**：每个批次只写自己书界的 `<gender>/<chNN>/` 目录与该目录的 manifest；跨书界人物的不同年龄版本是不同的 `asset_id`，先做较早书界的一版，后做的一版把先做的图加入参考以保持同一个人。
9. **常见问题**：参考图尚未通过审批怎么办；提示词与名录不一致以谁为准（以名录与章节为准，回头修提示词）；图里出现文字 / 水印 / 手部畸形怎么处理；原著标志物画错怎么处理。

写法要求：中文、祈使句、步骤编号清楚、路径与命令用反引号、不写空话；全文约 120–200 行；不要复制整段模板，写"去读哪一节"。

检查：以下命令必须通过。
- `python3 -c "import sys; t=open('assets/default/prompts/characters/GUIDE.md',encoding='utf-8').read(); sys.exit(0 if len(t.splitlines())>=100 and '## ' in t else 1)"`

## 报告

第 7 节写：GUIDE.md 的章节清单；引用到的仓库文件清单（这些文件改动时规程要复核）；与现行出图任务提示词的差异；需作者确认的事项（附默认值：每人物候选张数、批次顺序、是否把未通过审批的基线当参考）。

# 本任务：奢侈品 / 礼品名录与提示词 · 各朝代瓷器茶具、玉器、香炉铜器、琴、书法拜帖、笔等（考据 + 名录 + Gemini 提示词；出图归 Gemini 物品线；作者 2026-10-03）

本任务写名录与提示词，**不出图**（作者：「奢侈品 / 礼品也要用 gemini 画图」，由 Gemini 物品线按你的提示词出）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `tools/agents/prompts/_codex_worker.md` 的「规则」节（执行环境；本任务不用 runner）。

## 作者原话（2026-10-03 凌晨，逐字）
> 增加一个codex的subagent，负责添加各个对应朝代的奢侈品，用于送礼，用书中描述的宝物和历史记载的物件
> * 瓷器/茶具
> * 玉器
> * 香炉，铜器等
> * 琴
> * 书法拜帖（主角在各个朝代，可以有支线任务获取书法）
> * 笔
> * 其他补充

先读：`docs/design/10-items-and-equipment.md` §11.5「收藏品与礼品」（DES-items-gifts-spec 已合入：子类、字段、礼值与好感、按朝代可得性、书中宝物举例、名录九列格式）、§4.10（属性投影语法）；`docs/design/12` 的「求字 / 求帖」支线模板；`docs/design/02` §1 各书年代；`assets/default/prompts/items/GUIDE.md`（物品提示词规程）与 `assets/default/prompts/item.md`、`assets/default/STYLE.md`（画风与排除项）；现有一份名录（如 `docs/design/catalog/items-accessories.md`）与一份提示词（如 `assets/default/prompts/items/accessories/eq_baiyuguan.md`）作格式样例；`tools/imagegen/gemini_prompt.py` 的 `build_short`（它从提示词文件的 frontmatter 与「物品要点」表拼 Gemini 短提示词，字段名要对上）。

## 要做的事
1. **考据**（联网）：按朝代带（春秋越、唐武周、北宋、南宋、元、明、清）逐类搜集可作礼品的奢侈品：
   - 书中宝物：十四部小说里出现、可作礼物的器物（瓷、玉、炉、琴、字帖、笔、镜、扇、珠宝等），注明书名与情节（回目没把握标待考）；
   - 历史记载：各朝典型名器与名家（窑口、玉作、宣德炉、名琴、名帖、名笔），只用公开可查的来源，报告列出处；
   - 每朝每类 2–4 件，总量 **120–180 件**；同一类里拉开品阶（黄 / 玄 / 地 / 天）。
2. **名录** `docs/design/catalog/items-collectibles.md`（新建，九列：ID | 名称 | 子类 | 品阶 | 出处 | 效果字段 | 外观要点 | 说明 | 属性投影）：
   - ID `it_<拼音>`，先全仓 `grep` 查重（设计文档里已有的 `it_shuaiyitie`、`it_shiketapian`、`it_jinpen` 等直接收入，不改 ID）；
   - 效果字段 / 属性投影按 §11.5 与 §4.10 的键（`giftValue`、`giftTo`、`eraRange`、`provenance`、`study`、`appraise`…），数值落在品阶带内；
   - 说明列 60–120 字：来历、用法、适合送谁；
   - 外观要点供出图：材质、形制、纹样、尺寸感、年代特征，单件物品、不画人手。
   - 文首按名录惯例写归属 / 上游 / 标注约定；按朝代或按子类分节，各节一张表。
3. **提示词文件** `assets/default/prompts/items/collectibles/<it_id>.md`：每件一份，格式照现有物品提示词（frontmatter：asset_id、kind: item、name、category: collectibles、category_name: 奢侈品 / 礼品、subcategory、grade、source、effect、output `assets/default/item/collectibles/<id>.png`、manifest `assets/default/item/collectibles/manifest.yaml`、size 1536x1536、background、references 两张物品基线、status: ready；正文「物品要点」表与 `## Gemini 提示词` 代码块——写实画风与现有物品图一致，浅暖灰底，单件完整，不要人手、文字（书法帖除外：题签 / 帖文只写规格里允许的几个字）、礼盒）。
4. 自检：`python3 tools/agents/build_image_index.py --queue --group items --json | python3 -c "import json,sys; q=json.load(sys.stdin); print(len([r for r in q if '/item/collectibles/' in r['output']]))"` 能数出你的全部条目；名录行数 = 提示词数。

## 约束
- 只写：`docs/design/catalog/items-collectibles.md`、`assets/default/prompts/items/collectibles/**`、本任务报告。
- 不出图、不改 `tools/**`、不改 design/10、不改其他名录；不写演员 / 画师 / 公司名；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-collectibles.md`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：按朝代 × 子类的件数表、书中宝物清单（书、物、情节）、来源列表；第 6 节：需要 design/12 挂点的求字支线建议、需 ENG 的 `collectible` 运行时字段。报告 ≤ 60 行。

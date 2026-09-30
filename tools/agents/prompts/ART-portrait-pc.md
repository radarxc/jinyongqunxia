# 本任务：人物立绘提示词 · 主角（男女两版 × 各时代）与书灵

本任务只写提示词文件，**不出图**，不改策划 / 技术文档。上面"规则"一节里关于策划 / 技术文档格式的条目不适用；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者 2026-09-30 原话：

> 将所有人物立绘的prompt写到一个目录下（加上一个index md，索引各个人物的prompt，并指挥生成文件存到assets对应的人物目录里）。写好以后把这个index md的path发给我

十四个书界的具名人物由并行任务 `ART-P-ch01…ch14` 各写各的；本任务负责名录之外的两类：**主角**与**书灵**。总索引由协调者在全部任务合入后用脚本生成，所以文件必须严格按下面的格式。

输出目录：`assets/default/prompts/characters/protagonist/`。

## 必读资料

- `assets/default/STYLE.md`（作者原文、风格规则、审批记录里的作者意见）；提示词模板以最新返修版为准（只读）：男 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md`、女 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md`（不存在就用本工作区 `assets/default/prompts/` 下的同名文件）；已有基线的完整提示词见 `assets/default/baseline/character/*/manifest.yaml`。
- 主角设定：`docs/design/01-vision-and-core-loop.md`（现代身份、穿越、`npc_zhujue`）、`docs/decisions/author-decisions.md` P05（主角男女可选）、`docs/design/02-timeline-and-world-tiers.md` §1（序章与十四书界的年代）、`docs/design/13-progression-and-endings.md`（跨书界成长）、`docs/tech/07-asset-generation.md` §3 主角条（"15 个时代 / 序章变体 × 2"）、§1.4（`por_` ID 与变体键）、§2.6、§2.7、§2.9、§5.2。
- 书灵设定：`docs/design/01-vision-and-core-loop.md` 书灵相关章节、`docs/decisions/author-decisions.md` P54 / P55、`docs/tech/07-asset-generation.md` §3 书灵条（只做 1 套抽象墨影主体与对话立绘框架）。

## 要做的事

1. **主角**：按 tech/07 的口径，男女两版 × 序章《越女剑》与十四书界，共 30 份提示词。
   - 同一性别的 15 份必须是**同一个人**：先在报告里定下男、女主角各自稳定的面容骨相、体型、发质、神态锚点（原创扩展，默认 22–35 岁的现代人穿越），每份提示词原样带上这段锚点，再叠该时代的服饰与发式。
   - 每个时代的服饰发式按模板 §3 年代表与 tech/07 §2.7：主角是"入乡随俗的外来者"，穿当时当地普通江湖人的衣着，不穿具名人物的标志装束，不带具名神兵；兵器只用该书界普通兵器或空手。
   - 男性偏写实、女性偏美丽；两版气质对等，不把女版画成柔弱陪衬。
2. **书灵**：1 份提示词——抽象墨影主体（非写实人像、不分性别、不是某个具名人物），供对话立绘框架使用；`gender: other`，`book` 取它首次出现的书界（按 design/01；拿不准就用 `ch00_yuenv` 并在报告里说明）。
3. **写法、禁止项、参考图规则**与书界任务相同：提示词是完整、可直接交给 image_gen 的一整段，不留占位符；不写演员名、画师名、影视 / 游戏公司或具体改编作品名；`references` 只列仓库里已有的同性别基线参考图（只约束纸底、光线、笔触、设色）。

## 文件格式（严格遵守，脚本按此读取）

每份一个文件，文件名 `npc_zhujue__<m|f>_<chNN>.md`（书灵用它在文档里的既有 ID 作文件名；若没有既有 ID，用 `npc_shuling.md` 并在报告"需作者确认"里登记）：

    ---
    asset_id: por_npc_zhujue__<chNN>_<m|f>_base     # tech/07 §1.4，必须含 __<chNN>
    subject_id: npc_zhujue
    name: 主角（男 / 女）· <时代>
    book: <chNN>_<书界拼音>                          # 序章为 ch00_yuenv
    gender: male | female | other
    age_variant: prime
    tier: S
    output: assets/default/character/<gender>/<chNN>/<asset_id>.png
    manifest: assets/default/character/<gender>/<chNN>/manifest.yaml
    references:
      - path: assets/default/baseline/character/<…>.png
        use: <用途一句话>
    status: ready
    ---

    # <标题>

    ## 人物要点
    （表格：项 / 内容 / 依据；含"面容锚点""本时代服饰发式""兵器道具""气质姿态"）

    ## 提示词
    （一个 text 代码块，完整提示词）

    ## 排除项

    ## 质检要点

`output` 与 `manifest` 里的 `<gender>`、`<chNN>`、`<asset_id>` 必须与前面的字段一致；`references` 没有就写 `[]`；不要在 frontmatter 里加别的键。每个文件约 60–110 行；每次写入不超过约 150 行，分多次写。

检查：以下命令必须通过。
- `python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/protagonist --min 31`

## 报告

第 7 节写：男、女主角的面容锚点全文；30 份时代变体清单（书界 / 年代 / 服饰要点 / asset_id）；书灵的设定依据与 ID；需作者确认的事项（附默认值：主角年龄感、男女主角面容方向、书灵形象方向）。

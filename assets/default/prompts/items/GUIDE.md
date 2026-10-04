# 物品图 · 生成与存放规程（给出图 agent）

在仓库根目录执行；路径都相对仓库根。本组每份文件 = 一张物品图：`items/<类>/<物品ID>.md`，frontmatter 是机器字段（输出路径、规格、参考图），正文是物品要点、完整提示词、排除项、质检要点。总索引 `assets/default/prompts/INDEX.md` 由协调者用脚本生成，不要手改。

## 1. 先读什么

1. `assets/default/STYLE.md`（作者原话与审批意见）、`assets/default/prompts/item.md` §1–§7（物品图风格 / 构图 / 年代 / 排除 / 参考图 / 质检）与 §8（按名录批量出图：共用骨架、十一类专项、品阶画面语言）。
2. 画风基线只有两张，作者已审：`assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png`（倚天剑）、`ref_it_miji_jiuyin_shang__ch02_base01.png`（九阴真经）。**每张图都以这两张为唯一图片输入**，只取画风（纤细深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底 RGB≈(230,225,216)），不复制剑和书本身。
3. 名录（物品的权威设定）：`docs/design/catalog/items-<类>.md`，七列：ID | 名称 | 子类 | 品阶 | 出处 | 效果字段 | 外观要点。提示词文件的「物品要点」就是从它抄的；两者不一致以名录为准。

## 2. 队列与顺序

```bash
python3 tools/agents/build_image_index.py --queue --group items          # 待出 / 待重出的物品
python3 tools/agents/build_image_index.py --queue --group items --json   # 给脚本用
```

- 队列里的行有三种来源：图还没有；作者在 `items/REDO.md` 里点名重出的 ID；工作区候选被判为代码画的假图。
- 一类一批（同一文件、同一品阶一起看便于并排质检），天 → 地 → 玄 → 黄。
- 每张默认出 **2 张候选选 1 张**，有明确缺陷再补，单轮 ≤ 4 张。先出第 1 张与两张基线并排看一遍画风，像了再批量。

## 3. 怎么出

1. 读提示词文件，核对 frontmatter 的 `asset_id`、`output`、`manifest`、`grade`、`subcategory` 与名录一致。
2. 以两张基线为图片输入，把「提示词」节整段交给图像生成（排除项也要送进 prompt；工具没有独立负向字段时同样如此）。目标 1536×1536，不透明均匀浅暖灰底，单一完整物品居中、三分之四轻俯视、四边留白 ≥ 10%，无人物 / 手 / 场景 / 地面 / 投影。
3. 看图自查（质检要点 + item.md §7）：对题（画的确实是这个子类的这件东西）、干净（无字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子）、画风对基线、品阶信号只靠材质 / 工艺 / 包装 / 旧化。不合格就改提示词重出，不入库。
4. **禁止**用 Pillow / 代码绘制、拼贴、程序化合成任何替代图；图像生成不可用就停下写明，不得伪造。素材目录里不放任何脚本。

## 4. 存放与登记

- PNG 存到 frontmatter `output`：`assets/default/item/<类>/<物品ID>.png`（文件名 = 物品 ID，原始分辨率，不缩放）。
- 在 `assets/default/item/<类>/manifest.yaml` 追加 / 替换该 ID 的条目，字段与 `assets/default/baseline/item/manifest.yaml` 同构：`id`、`file`、`category: item`、`style: default`、`subject`、`prompt`（实际用的完整提示词）、`negative`、`references`（两张基线的 id / path / sha256）、`tool`（如实写用的工具）、`model`（真实模型名）、`effort`、`created`、`source_path`（生成原件路径）、`size`、`sha256`、`status: candidate`、`notes`。
- 重出已有条目时覆盖同名 PNG 并更新该条目的 `prompt / size / sha256 / created / notes`，不要新造 ID。

## 5. 检查与交付

```bash
python3 tools/agents/check_assets.py assets/default/item/<类> --min <名录行数> --max <名录行数> --min-side 1024
python3 tools/lint/check_ids.py --strict
python3 tools/agents/build_image_index.py          # 重建索引，状态变为「已入库」
```

一类做完整批交审（作者在审批页看图，`candidate` 不等于通过）；不逐张打扰作者。报告写清：做了哪些 ID、每个 ID 出了几张候选选了哪张、改过的提示词、未解决的问题。

## 6. 同款换色

AR-77 男装、女装按「同一朝代、同一性别、同一档」成组；每组恰一件底图，默认选该朝代偏好色。第 1 批春秋男女各六档，均用纁红款作底图：男装再换本白、玄，女装再换素白；共 12 件底图、18 件换色件。

1. **底图先出**：底图无 `edit_from`，提示词写全款式，照 §3 以两张画风基线出图。先核对款式、主色、工艺与留边，再把选定 PNG 存到该底图的 `output`。提示词为 `draft` 表示待出图，不能把尚不存在的底图当作已上传参考。
2. **换色件后出**：换色件的 `edit_from` 指向本组底图 ID；`references` 第一条为底图的 `output`，`use: 底图：只改主色`，后两条保留两张画风基线。这里的底图是实际编辑输入，基线用于画风对照；本节替代 §1／§3 对换色件的“两张基线为唯一图片输入”通则。没有底图就等待同组底图，不改为独立起稿。
3. 换色件只提交其 `## 提示词` 编辑指令：以底图为底，仅改指定主色；款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变，不另写新款式。辅色与配件保留原色；本白为暖白，玄为近黑暗色，素白为柔和素白，不把三者改成浅蓝月白。
4. 按 [gemini-imagegen §4「上传参考图（秘籍改题签）」](../../../../.claude/skills/gemini-imagegen/SKILL.md) 的上传／暂存流程处理本组底图，使用下面的登记方式，**不套模板**；各换色提示词末尾已给对应实际 ID 与路径的代码。

```js
// fm 是当前换色提示词的 frontmatter；先上传并暂存 references[0].path 的底图。
const id = fm.asset_id;
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: [fm.references[0].path] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
```

登记 `claudeGemPrompts[id]` 为当前换色件的编辑指令，再放入出图队列。不能直接按 ID 字母序开跑：`order: 1` 的底图核图、入库后，才执行同组 `order: 2` 的换色件；始终检查 `edit_from` 的依赖是否已满足。

禁止用代码改色相或整体滤镜；禁止为每种颜色独立生成不同款式。逐张与底图对照，除主色外出现结构、纹饰、褶皱或光影变化就返工；输出仍存到换色件自己的 `output`，manifest 如实登记所用底图。总索引由合入后的开发监督全量重建，本批 CONTENT 不重建索引、不生成图片。

# 本任务：物品图 · {{category_name}}（名录 `{{catalog}}`，{{count}} 项）· 按名录批量出图（AR-20）

本任务只出图、登记 manifest，不改名录、不改设定。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-20**：对各类物品补充设定并**分别生成图**；按小说著名物品列举；分别生成天地玄黄等级对应物品；药材按年限分级（千年 / 百年 / 十年 / 普通）。名录已由 DES-items-plus 定稿，本任务逐行出图。

## 输入

- 名录：`{{catalog}}`（七列机器行：ID | 名称 | 子类 | 品阶 | 出处 | 效果字段 | 外观要点）。本任务负责其中全部 {{count}} 行：`{{ids}}`。**一行一张图，文件名 = ID**。
- 画风基线：`assets/default/baseline/item/`（倚天剑、九阴真经两张，作者已在审批页通过；manifest 里的 `status` 字段不作数）——`image_gen` 以这两张为**唯一**图片输入，只取画风：清楚纤细深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、浅暖灰近象牙底（RGB 约 230,225,216）；不复制其中的物件。
- 提示词规范：`assets/default/prompts/item.md` §1–§5（风格 / 构图 / 年代 / 排除 / 可复用提示词）、§8.1 共用骨架、§8.2 本类专项骨架与专项排除、§8.3 品阶与药材年限的画面语言。年代形制按出处书界查 `docs/design/02-timeline-and-world-tiers.md`。
- 历史图片参考：{{hist_refs}}。

## 硬规则（2026-10-01 加：食品批曾用 Pillow 画矢量色块冒充生成图，被审核判 FAIL）

- **每张图必须由 `image_gen` 生成**，manifest `tool` 写 image_gen 与实际模型名。**禁止**用 Pillow / 代码绘制、拼贴或程序化合成任何"替代图""确定性回退图"，禁止在素材目录放生成脚本。`image_gen` 不可用或连续失败时**停下来**，报告第 1 节写明失败原因与已生成数量，不得伪造。
- 批量前先做**画风校准**：出第 1 张后与基线两张并排 `view_image` 对比（纤细深灰墨线而非粗黑描边；薄层透明罩染而非平涂色块；可辨手绘笔触；无悬浮散点 / 粒子），不像就改提示词重出，像了再批量；校准结论写进报告。
- **出图方式按 `tools/agents/prompts/_imagegen.md`**：本执行环境没有内置 `image_gen`，用本机 Codex CLI（`codex exec -m gpt-6-astra … -i <基线图>`）代出，每张一次调用；不要直连后端端点。

## 做法

1. 读名录，逐行按 §8.1 骨架写提示词：题材（名称、ID、子类、品阶、出处语境）→ 主体（外观要点逐项写进去；标【原创扩展】的只作原创武侠器物）→ 风格 → 构图（1:1，目标 1536×1536，单一完整物品居中，四边留白 ≥ 12%，物件包围框不超过画布 76%，无人物 / 手 / 场景 / 地面 / 投影）→ 品阶 / 年限画面语言（§8.3，只用材质 / 工艺 / 包装 / 旧化表达，禁止光效、品阶框、文字）→ 排除项（§4 + §8.2 专项排除 + 不用具体影视 / 游戏造型、不写演员 / 画师 / 作品名）。
2. 若本任务开了联网：有明确朝代形制的条目（盔甲、兵器、衣冠、鞋带等）先搜 1–2 张历史参考（博物馆藏品 / 考古出土 / 古画，优先 Wikimedia Commons 与博物馆官网），`curl -L -o refs/<id>_<n>.<ext>` 下载后 `view_image` 看过再写进提示词（只取形制、比例、材质，不复制整图），manifest `references` 登记 URL 与取用了什么。没开联网的任务跳过这步。
3. 生成：每项 1 张；生成后 `view_image` 自检（无文字、无人物、单一物品完整、留白够、底色与画风对基线、主体对得上外观要点与子类），不过关最多再生成 1 次，仍不过关按最好的一张入库并在 notes 写明问题。
4. 入库：`{{out_dir}}/<id>.png` + `{{out_dir}}/manifest.yaml`，每条字段与 `assets/default/baseline/item/manifest.yaml` 同构：`id`（= 物品 ID）、`file`、`category: item`、`style: default`、`subject`、`prompt`（实际用的全文）、`negative`、`references`（基线两张的 path + sha256 + role，历史参考的 URL）、`tool`、`model`、`effort`、`created`、`source_path`、`size`、`sha256`、`status: candidate`、`notes`（年代依据、原创扩展 / 待考标注、候选数、自检结果）。`sha256` / `size` 必须与磁盘一致。

约束：不改 `docs/`、不改名录、不改 `assets/default/prompts/item.md`（要补充的写在报告）；不改 ID；每次写入 ≤ 150 行；报告 ≤ 100 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py {{out_dir}} --min {{count}} --max {{count}} --min-side 1024`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：逐项表（ID / 候选数 / 自检结论 / 历史参考 URL 若有）；画风偏离或没画出来的条目；待考与原创扩展标注；需作者确认（附默认）。

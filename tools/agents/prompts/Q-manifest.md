# 本任务：{{book}}（`{{chid}}`）——把剧情稿迁移为生产任务数据（manifest + `quest.v1` 实例）

`docs/design/story/{{nn}}-{{slug}}.md` 是策划源；生产只接受 `design/12` §2.6 的显式迁移 manifest 与 `quest.v1` 实例。本任务为 `{{chid}}` 生成这套数据，并用 `tools/lint/check_quest_manifest.py` 自检通过。{{pilot_note}}

## 必读

- `docs/design/12-quests-npc-factions.md` §1.1、§2（全部）、§2.6、§11、§13.1；`docs/design/20-legacy-inheritance.md` §10（若本章有传承缓存 / 合成，opcode 字段用 `recipeKey`，见 K2）。
- `docs/design/story/{{nn}}-{{slug}}.md` 全文（正线 / 邪线 / 共有幕、选择节点 `dc_{{nn}}_nn`、立场量公式、结局条件、§9 YAML 样例、§11 正式任务 ID 表）。
- `docs/design/chapters/{{nn}}-{{slug}}.md` §4（主线幕）、§6（支线只登记 ID，不在本任务展开）、§8（人物 ID）。
- `docs/design/catalog/npcs-ch{{nn}}-{{slug}}.md`（`npc_*`）、`docs/design/17-sects-compendium.md`（`sect_*`）、`docs/design/map/cities.yaml` / `regions.yaml`（`city_* / rg_*`）——所有引用必须是已定义 ID。
- `tools/lint/README.md`（校验器用法）；`tools/agents/reports/L2.md` §6（文件模板）；若 `content/chapters/ch01_tianlong/` 已存在（Q01 范例），沿用其目录与写法。

## 产出

```
content/chapters/{{chid}}/
├── quest-manifest.yaml          # design/12 §2.6 最小字段全集；unmapped 必须为空
└── quests/
    ├── q_{{nn}}_main_c_01.yaml  # 每个正式主线任务一个文件（共有 c / 正线 z / 邪线 x 全部）
    └── …
```

- 每个 `quest.v1` 文件：`schemaVersion`、`id`、`kind: main`、`titleKey`、`chapterId: {{chid}}`、`subjectNpcIds`、`routeTone`、`offerWhen`、`stages[]`（`objectiveKeys`、`entry`、`transitions[]`（稳定 `edge_*`、`branchKey`、优先级、兜底）、`onEvent`、终态 `endingKey`）、`effects[]`（稳定局部 `fx_*`）、检定 `chk_*`；文本一律用 `*Key` 逻辑键（`quest.{{chid}}.<questId>.<field>`），不写中文正文。
- `dc_{{nn}}_nn` 全部映射到唯一父任务 / `stageId` / `choiceToBranchKey`；换线出口显式连接；本章立场量（如剧情稿定义的 `stance*`）作为任务局部状态，公式、阈值、`priorSwitches / routeReady / routeIntent / routeOverride` 语义写进 manifest 的 `stateMappings[]` 与 `formulaNotes[]`。
- 旧简式 `q_{{nn}}_main_nn`（若剧情稿有）进入 `aliases[]` 显式 remap。
- 只迁移数据表达，**不改写剧情结论**；剧情稿中无法映射的叙事后果写入 `unmapped[]` 并在报告说明——但 `--strict` 要求 `unmapped=[]`，所以要把它们转成"文案键 + 无状态效果"而不是丢掉。

## 验收标准

- `python3 tools/lint/check_quest_manifest.py content/chapters/{{chid}} --strict` 退出 0；`python3 tools/lint/check_ids.py --strict` 通过。
- 正式任务数量与剧情稿 §11 表一致（共有 + 正线 + 邪线）；每个 `dc_{{nn}}_nn` 都在 manifest 中。
- 不修改 `docs/` 下任何文件；发现剧情稿自相矛盾写报告第 6 节。

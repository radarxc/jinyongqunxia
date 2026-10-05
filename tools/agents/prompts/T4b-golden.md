# 本任务：P0 风格锁定金样——美术圣经回归集、男女主角北宋装 / 段誉 / 无量剑派杂兵设定卡、1 张 CG、1 组图标模板

`tech/07` §3.3 Phase 0 与 `tech/09` §2.1 "素材探针"的图像部分：证明"风格可控 + 管线可跑通"。用你环境里的 `image_generation` 工具生成，经 T4a 的 `tsgen` 登记、出联系表；之后由 T4b.V 做多模态校验，作者做最终审定。**不要**把任何条目标为 `approved`。

## 必读

- `docs/tech/07-asset-generation.md` §2（美术圣经：风格三档、线条、色板、纸纹、构图留白、人物比例、**§2.7 服饰时代感——北宋**、§2.9 禁止项）、§5.1（CG）、§5.2（立绘 / turnaround 设定卡步骤）、§5.6（图标模板与 12 级品阶边框）、§6.3（提示词模板）、§6.7（人工审核清单）、§7.2–§7.4（识别锚、设定卡策略、30 条金样本回归）。
- `tools/aigc/prompts/**`（T4a 的模板与片段；缺的补）、`tools/agents/reports/T4a.md` §6（操作顺序与规格阈值）。
- 人物依据：`docs/design/01-vision-and-core-loop.md` §2（主角与现代身份、书灵）、`docs/design/catalog/npcs-ch01-tianlong.md`（段誉、无量剑派弟子条目）、`docs/design/18-npc-and-companions.md` §5.3（年龄段）。
- `_assets` 附加规则（目录、体积、登记、评分）。

## 产出（数量为上限，质量优先）

| 主题 | 类型 | 候选 | 入 golden | 说明 |
|---|---|---|---|---|
| 回归集 | 30 条固定请求（3 档 × 10 用途） | 每条 1 张 | 联系表 3 张（每档 1 张） | 请求文本、参考与输入哈希固定，写入 `tools/aigc/requests/golden-regression/*.yaml`；图只进联系表，不逐张入 golden |
| `pc_main_m` 男主角北宋装 | turnaround 设定卡（正 / 侧 / 背 / 3/4 + 面部 + 兵器特写，纯白底） | ≥ 8 | 2 | 现代人穿越，衣着为北宋庶民行脚装（`design/01` 开局身份），交领右衽 |
| `pc_main_f` 女主角北宋装 | 同上 | ≥ 8 | 2 | 同上 |
| `npc_duanyu` 段誉 | 同上 | ≥ 8 | 2 | 大理世子微服，气质文弱潇洒；不得像任何影视版演员 |
| `npc_wuliang_disciple` 无量剑派弟子（杂兵） | 设定卡 + 3 个模块化差异（发饰 / 佩剑 / 腰带） | ≥ 8 | 3 | 便于 tech/07 杂兵模块化 |
| `cg_01_wuliang_awakening` | CG 1 张（无量外驿醒来） | ≥ 6 构图候选 | 1 | S1 工笔精绘，横版 2:1，留白依 §2.5 |
| 图标模板 | 4 类武学图标底板 × 12 级品阶边框合成示例 | 底板 ≥ 4 | 4 底板 + 1 合成联系表 | 边框色取 `packages/spec/palette.json`，由脚本合成，不让模型画边框 |

每主题另做"同一人物 10 张不同构图"的一致性自评（≥ 4 分入 golden），写 `art/golden/<subject>/notes.md`。

## 流程

`tsgen generate-request` → 用 `image_generation` 逐条生成到 `art/work/T4b/<subject>/` → `tsgen import-candidate`（provenance：`provider: traex, entrypoint: image_generation, displayModel: null, seed: null`）→ 初筛 → 缩图进 `art/golden/` → `tsgen contact-sheet` → 登记 `status: review`。工具失败或次数受限时，记录实际限制，减少数量而不降低规格；完全不可用时用占位并在报告首行醒目说明。

## 验收标准

- `art/golden/index.yaml` 列出全部入选文件（路径、subject、变体、sha256、评分）；每个文件 ≤ 400 KB、长边 ≤ 1024；`art/golden/**` 文件数 ≤ 40。
- `uv run --directory tools/aigc tsgen registry check` 通过；每张 golden 图有登记条目与请求文件；`python3 tools/lint/check_ids.py --strict` 通过（登记 `subject` 只引用已定义 ID）。
- 报告第 2 节：每主题候选 / 入选 / 平均分；第 4 节：工具限制（分辨率、参考图、次数、水印、条款可见性）；第 6 节：作者审定清单（`review → approved` 待作者）。

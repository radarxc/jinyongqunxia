# ART-item-belts 报告 · 物品图 · 腰带（8 项，按名录批量出图）

## 1. 摘要（3–6 行）

按 `docs/design/catalog/items-belts.md` 全部 8 行完成一行一图，并登记同构 `manifest.yaml`。
8 张均为 1254×1254 RGB PNG，状态保持 `candidate`；两张已通过物品基线是唯一图片输入，历史藏品只经目检后转写形制。
共生成 15 个有效候选；7 项通过内容与构图门禁，玄铁护腰在两次上限后仍横向偏大，已采用较优稿并如实标记。
资产检查与严格 ID 校验均以退出码 0 通过。

## 2. 产出（文件、行数、主要章节）

- `assets/default/item/belts/manifest.yaml`：296 行；8 条资产的实际全文提示词、negative、参考、工具配置、尺寸、SHA-256、候选与目检记录。
- `assets/default/item/belts/<id>.png`：8 张；文件名逐项等于名录 ID。
- `tools/agents/reports/ART-item-belts.md`：本报告；摘要、产出、结论、开放问题、同步项与逐项自检。

## 3. 关键结论与数值

- 画面统一：清楚纤细深灰墨线、薄层透明罩染、低饱和冷暖、浅暖灰近象牙底；未复制基线中的剑或书。
- 生成总数：`7×2 + 1×1 = 15`；百纳腰封首稿即通过，其余 7 项各用一次构图返修。
- PNG 均实测 1254×1254（短边 1254≥1024）；manifest 的 `size`、SHA-256 与磁盘逐项一致。
- 构图门禁：7/8 达到四边≥12%、包围框宽高≤76%；玄铁护腰为 78.55%×38.20%，左右留白 10.77%/10.69%。
- 品阶只以材质、工艺、包装与旧化表达；未使用光效、文字、数字、品阶框。

## 4. 开放问题（附默认值）

1. 作者是否接受玄铁护腰横向超门禁 2.55 个百分点？默认：保留当前较优候选并维持 `candidate`；若退回，在后续审批任务单独缩构图，不在本任务突破两候选上限。
2. 作者是否接受 1254×1254 工具实出而非提示目标 1536×1536？默认：接受；已满足强制短边≥1024且未做插值放大。
3. 8 项最终审美与图标缩小辨识度尚待作者审批/真机实测；默认：全部保持 `candidate`，不派生运行时图标。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。名录与基准未发现必须改动的事实冲突；本任务不改设定。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `assets/default/prompts/item.md` / 构图规范：可在后续任务补充“腰带等横向闭环物默认目标包围框≤62%”，减少生成器对 68%目标的系统性超幅；本任务未改。
- 资产审批记录 / 腰带批次：作者审批后同步 8 项状态与玄铁护腰是否返修；默认暂不改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| ID | 候选数 | 自检结论 | 历史参考 URL |
|---|---:|---|---|
| `eq_mayaodai` | 2 | ✅ 74.48%×38.92%，四边≥12%；麻绳/木扣/行旅感成立 | [Met 52476](https://www.metmuseum.org/art/collection/search/52476) |
| `eq_pihudai` | 2 | ✅ 74.72%×34.45%，四边≥12%；宽皮/缝线/无针双框扣成立 | [Met 43931](https://www.metmuseum.org/art/collection/search/43931) |
| `eq_qingyudai` | 2 | ✅ 71.37%×30.38%，四边≥12%；三块青玉/白铜扣成立 | [Met 75243](https://www.metmuseum.org/art/collection/search/75243) |
| `eq_baonadai` | 1 | ✅ 66.91%×51.20%，四边≥12%；低饱和拼缝宽腰封成立 | [Met 52476](https://www.metmuseum.org/art/collection/search/52476) |
| `eq_xuantiedai` | 2 | ⚠️ 内容通过；78.55%×38.20%，左右10.77%/10.69%，两次后仍超构图门禁 | [Met 44404](https://www.metmuseum.org/art/collection/search/44404) |
| `eq_yunlongyudai` | 2 | ✅ 71.21%×26.00%，四边≥12%；七块玉板/抽象云纹成立 | [Met 43934](https://www.metmuseum.org/art/collection/search/43934)、[Met 44404](https://www.metmuseum.org/art/collection/search/44404) |
| `eq_qiankundaidai` | 2 | ✅ 75.84%×34.85%，四边≥12%；深青宝带/无字回纹/双合扣成立 | [Met 52476](https://www.metmuseum.org/art/collection/search/52476)、[CMA 1947.617](https://www.clevelandart.org/art/1947.617) |
| `eq_tianchanyaodai` | 2 | ✅ 74.80%×38.44%，四边≥12%；珠灰丝带/银线经纬/双环扣成立 | [Met 52476](https://www.metmuseum.org/art/collection/search/52476)、[Met 43931](https://www.metmuseum.org/art/collection/search/43931) |

- ✅ 逐图 `view_image`：8 项均为单一完整腰带，无文字、人物、手、场景、地面、明显投影或裁断；玄铁仅构图尺度偏离。
- ✅ 画风：均以两张基线为唯一图片输入；历史参考已下载、目检，只取形制/比例/材质，manifest 登记 URL 与用途。
- ✅ 标注：名录已声明 8 项全部具体物品、数值与外观为（原创扩展）；manifest 逐项沿用。无原著事实断言，故无新增（待考）项。
- ✅ 数量/命名/状态：8 行对应 8 PNG，文件名=ID，`status: candidate`；没有改 `docs/`、名录、提示词规范、ID 或其他非负责文件。
- ✅ `python3 tools/agents/check_assets.py assets/default/item/belts --min 8 --max 8 --min-side 1024`：图片8、条目8、问题0，退出码0。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure count 0，退出码0；仅报告基线既知 `sk_babuganchan` 未定义，new=0。

# ART-item-shoes 报告 · 物品图 · 鞋（8 项，按名录批量出图）

## 1. 摘要（3–6 行）

按 `docs/design/catalog/items-shoes.md` 的 8 行名录逐项生成并入库 8 张鞋履 PNG，一行一图、文件名等于 ID。
全部终稿以倚天剑、九阴真经两张作者批准基线作为唯一图片输入；馆藏图仅人工目检并转为形制文字。
8 张均逐图 `view_image`；完整一双同款、无文字/人物/手脚/场景，四边留白均 ≥12%、包围框宽高均 ≤76%。
`manifest.yaml` 已登记实际提示词、排除项、参考、源路径、尺寸、SHA-256、候选状态和自检；两项指定校验通过。

## 2. 产出（文件、行数、主要章节）

- `assets/default/item/shoes/`：8 张 RGB PNG（均 1254×1254）及 `manifest.yaml`（484 行，8 条）。
- `tools/agents/reports/ART-item-shoes.md`：本报告；含关键数值、开放问题、同步项及逐项自检。
- 只新增授权目录内文件；未改名录、设定、提示词规范、`TODO.md` 或其他报告。

## 3. 关键结论与数值

- 覆盖率 `8/8 = 100%`；共生成 `3×1 + 5×2 = 13` 个候选，5 项采用第 2 稿，均未超过最多 2 张。
- 提示目标 1536×1536，image_gen 统一实出 1254×1254；`1254 ≥ 1024`，保留原字节，不插值放大。
- 阈值辅助测量最窄留白 12.44%（飞羽靴右、天马履右），大于 12%；最大包围框维度 75.92%（飞羽靴宽），小于 76%。
- 外圈背景中位色约 RGB(227–230,222–225,213–216)，接近目标 (230,225,216)；有极轻微生成式起伏，非逐像素纯色。
- 8 图尺寸、RGB 模式、文件名及 SHA-256 与 manifest 一致，统一 `status: candidate`。

## 4. 开放问题（附默认值）

- 是否批准候选进入派生流程：默认保持 `candidate`，待作者审美审批。
- 是否要求严格 1536×1536 或逐像素纯底：默认保留原生 1254×1254，不重采样、不改底。
- 捕快快靴、飞羽靴、天马履的圆头短靴轮廓较近，依靠黑布/深褐薄皮/珠白轻皮及滚边/羽纹/马鬃纹区分；默认接受当前系列化轮廓。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。本任务仅出图和登记，未发现必须修改 `docs/00-canon.md` 的冲突。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `assets/default/prompts/item.md` / 输出尺寸说明 / 可补记当前工具常实出 1254×1254、生成浅底可能有极轻微明暗起伏；本任务未越权修改。
- 其余无；8 项全部为跨书界原创器物，manifest 已登记不擅自指定朝代。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| ID | 候选数 | 自检结论 | 历史参考 URL |
|---|---:|---|---|
| `eq_caoxie` | 2 | ✅ 第2稿；黄麻编底、粗绳鞋带、轻磨损、成年尺度 | [Horniman 4733](https://www.horniman.ac.uk/object/4733/)；[Burke 42941](https://www.burkemuseum.org/collections-and-research/heritage/artscultures/database/display.php?ID=42941) |
| `eq_bukuaixue` | 1 | ✅ 黑布短靴、灰布滚边、软底，无官府文字 | [Te Papa 964053](https://collections.tepapa.govt.nz/object/964053) |
| `eq_qingyunlv` | 2 | ✅ 第2稿；青灰软履、白布中底、细绦、含蓄云头 | [Horniman 4733](https://www.horniman.ac.uk/object/4733/) |
| `eq_feiyuxue` | 1 | ✅ 深褐薄皮短靴、窄底、侧面羽纹压花 | [Te Papa 964053](https://collections.tepapa.govt.nz/object/964053) |
| `eq_tayunlv` | 2 | ✅ 第2稿；月白软履、灰蓝云纹织边、薄底不发光 | [Horniman 4733](https://www.horniman.ac.uk/object/4733/) |
| `eq_xuexingxue` | 2 | ✅ 第2稿；灰白皮裘长靴、宽软底、毛毡内衬 | [Te Papa 964053](https://collections.tepapa.govt.nz/object/964053) |
| `eq_wuyinglv` | 2 | ✅ 第2稿；墨青缎面、银灰窄边、极薄底、无魔法 | [Horniman 4733](https://www.horniman.ac.uk/object/4733/) |
| `eq_tianmalv` | 1 | ✅ 珠白轻皮短靴、浅金马鬃纹、修长且无翅膀 | [Te Papa 964053](https://collections.tepapa.govt.nz/object/964053) |

- ✅ 历史参考均已联网下载并 `view_image`，只取形制/比例/材质；模型图片输入严格只有两张批准基线。
- ✅ 8 张终稿及 5 项首稿均逐张 `view_image`；无内容性画风失败，未采用仍不合规的候选。
- ✅ 待考：无；名录未绑定书界，未编造原著事实或具体朝代。原创扩展：8 项题材、轮廓、纹样、比例、配色全部登记。
- ⚠️ 共同轻微偏差仅为实出尺寸低于提示目标、背景非逐像素纯色；已在 manifest 与本报告披露。
- ✅ `python3 tools/agents/check_assets.py assets/default/item/shoes --min 8 --max 8 --min-side 1024`：图片 8、条目 8、问题 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出码 0；仅报告基线已知 `sk_babuganchan` 未定义，new=0。
- ✅ 文件边界：`git status --short` 仅见授权的鞋类目录及本报告。

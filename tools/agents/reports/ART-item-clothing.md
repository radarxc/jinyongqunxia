# ART-item-clothing 报告 · 物品图 · 衣物（12 项，按名录批量出图）

## 1. 摘要（3–6 行）

按 `docs/design/catalog/items-clothing.md` 的 12 行名录逐项生成并入库 12 张衣物 PNG，一行一图、文件名等于 ID。
全部终稿均以两张作者已通过的物品基线作为唯一图片输入，并逐图 `view_image` 检查；8 项另查博物馆历史图，只取形制、比例或材质，不作为生图输入。
12 张均为 RGB PNG、1254×1254；无人物、手、文字、场景、地面、明显投影、光效或品阶框，且主体与名录外观要点一致。
`manifest.yaml` 已登记实际提示词、排除项、基线哈希、历史 URL、源路径、mtime、尺寸、SHA-256、候选状态和自检结果。

## 2. 产出（文件、行数、主要章节）

- `assets/default/item/clothing/`：12 张 PNG（每张 1254×1254）及 `manifest.yaml`（862 行、12 条、每条 17 个顶层字段）。
- `tools/agents/reports/ART-item-clothing.md`：本报告；含产出、数值、开放问题、同步项及逐项自检。
- 目录只保留 12 张交付 PNG 与清单；未修改名录、设定、提示词规范或 `TODO.md`。

## 3. 关键结论与数值

- 共入库 12/12 项；有效候选 22 张：10 项取第 2 稿，`eq_jinzhuang`、`eq_wucanyi` 取第 1 稿。`eq_daopao` 另有一次路径解析失败，未生成图片、不计候选。
- 工具请求目标 1536×1536，实际统一输出 1254×1254；短边 1254 ≥ 验收下限 1024。原图均按字节复制，未缩放、抠图、改底或重编码。
- 阈值辅助测量（相对外圈中位色，各通道最大差 >45）显示 9 项四边均 ≥12%；`eq_yunjinhechang` 上/下约 10.85%/10.53%，`eq_zixiaqingyi` 约 8.93%/8.77%，低于任务目标；均已用完两候选，按要求入库较优稿并如实标注。12 项目检均未裁断。
- 背景外圈中位色约 RGB (227–230, 221–224, 211–215)，接近基线目标 (230,225,216)，但有轻微生成式明暗起伏，并非逐像素纯色。
- SHA-256、实测尺寸与 manifest 逐条一致；全部 `status: candidate`。

## 4. 开放问题（附默认值）

- 是否接受 `eq_yunjinhechang` 与 `eq_zixiaqingyi` 低于 12% 的阈值测量留白？默认：按“最多再生成 1 次”规则保留当前较优候选，维持 `candidate`，后续若作者要求再专项返修。
- 是否批准 12 项进入图标派生流程？默认：保持 `candidate`，等待作者审美审批后再改状态。
- 是否要求严格 1536×1536 或逐像素纯色背景？默认：保留 image_gen 原始 1254×1254 文件，不重采样、不改底；当前满足强制短边检查。
- 乌蚕衣的原著材质、取得措辞和具体形制仍（待考）。默认：沿用定稿名录，不在本出图任务改设定。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。本任务只出图与登记 manifest，没有发现必须修改 `docs/00-canon.md` 才能完成的冲突。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/catalog/items-clothing.md` / `eq_wucanyi` / 后续考据任务核对《连城诀》三联或广州修订版中的材质、取得措辞及能否支持当前短衣表现；本任务未改。
- `assets/default/prompts/item.md` / §8.2 衣物专项 / 可补充“长袍提示先缩至包围框高 ≤68%，宽袖向内收”，降低模型反复把长袍画到上下贴边的概率；本任务未改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| ID | 候选数 | 自检结论 | 历史参考 URL 若有 |
|---|---:|---|---|
| `eq_buyi` | 2 | ✅ 第2稿；粗麻交领短褐、双布结，四边留白充足 | [Met 860963](https://www.metmuseum.org/art/collection/search/860963) |
| `eq_jinzhuang` | 1 | ✅ 深蓝窄袖劲装，一体腰带与护腕，无散件 | [Met 860963](https://www.metmuseum.org/art/collection/search/860963) |
| `eq_sengyi` | 2 | ✅ 第2稿；灰黄素袍，无袈裟、文字或佛具 | [Met 40448](https://www.metmuseum.org/art/collection/search/40448) |
| `eq_daopao` | 2 | ✅ 第2张有效候选；青灰宽袖、黑边布扣，无太极符号 | [Met 860963](https://www.metmuseum.org/art/collection/search/860963) |
| `eq_yexingyi` | 2 | ✅ 第2稿；墨黑偏蓝衣裤相叠为一套，无蒙面巾与靴 | 无；通用原创武侠潜行服 |
| `eq_huangmagua` | 2 | ✅ 第2稿；圆领对襟、五布扣、深蓝滚边，无补子文字 | [故宫 230393](https://www.dpm.org.cn/collection/embroider/230393.html) |
| `eq_taohuajinpao` | 2 | ✅ 第2稿；月白锦袍、低对比淡粉桃枝织纹 | [Met 860963](https://www.metmuseum.org/art/collection/search/860963) |
| `eq_xiyuhufu` | 2 | ✅ 第2稿；靛青窄袖长衫、皮腰封、毡边；上下阈值约14% | [Met 64101](https://www.metmuseum.org/art/collection/search/64101) |
| `eq_yunjinhechang` | 2 | ⚠️ 第2稿移除整翼大纹；抽象羽纹合格，阈值上下约10.85%/10.53%，目检完整 | [Met 64101](https://www.metmuseum.org/art/collection/search/64101) |
| `eq_tianchanbaoyi` | 2 | ✅ 第2稿；珠白软衣与极细金丝经纬，无甲片、无光效 | 无；原创宝衣 |
| `eq_zixiaqingyi` | 2 | ⚠️ 第2稿移除花卉；渐染仅在布面，阈值上下约8.93%/8.77%，目检完整 | 无；原创宝衣 |
| `eq_wucanyi` | 1 | ✅ 乌黑偏褐柔韧短衣、细密哑光丝纹，无金属甲片；⚠️ 形制待考 | 无；原著考据待办 |

- ✅ 历史参考均已下载到临时目录并以 `view_image` 查看；manifest 逐项登记 URL、用途、访问日及“未作为 image_gen 输入”。基线两图已核对 SHA-256 并实际作为唯一图片输入。
- ✅ 全部 12 张均逐项 `view_image`；无文字、人物、手、场景、地面、明显投影、现代拉链、光效、品阶框或裁断。
- ✅ 黄/玄/地/天阶只由布料、织造、裁缝、包边与旧化层次表达；没有颜色光柱或文字标阶。
- ✅ 原创扩展与待考已登记：具体裁片、配色、纹样和材质表现均标原创；乌蚕衣另标材质、取得措辞、形制待考。
- ⚠️ 画风无明显摄影/3D 偏离；共同轻微偏差为浅底并非逐像素纯色。两件长衣留白阈值不足已披露，没有冒称通过该软目标。
- ✅ `python3 tools/agents/check_assets.py assets/default/item/clothing --min 12 --max 12 --min-side 1024`：12 张、12 条、0 问题。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出码 0；仅报告基线已知的 `sk_babuganchan` 未定义项，strict failure count 为 0。
- ✅ 文件边界：仅新增授权目录的 12 PNG、manifest 与本报告；没有修改 `docs/`、基准、名录、提示词或 `TODO.md`。

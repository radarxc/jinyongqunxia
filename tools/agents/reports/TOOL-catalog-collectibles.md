# TOOL-catalog-collectibles 报告 · 工具 · 物品名录校验器与生成器认收藏品 / 礼品名录 items-collectibles.md（AR-40：九列、七子类、giftValue/giftTo/eraRange/provenance/study/appraise 机器行、kind: collectible 投影）

## 1. 摘要（3–6 行）
- 校验器已按列名识别 AR-40 专用九列，不改旧 `HEADER9`，并接受七子类代码及中文名。
- 六个必填收藏字段与可选 `luck` 已具备专用语法、闭集、礼值、鉴宝公式及双写校验。
- 生成器会自动发现该名录并输出 `kind/sub/stack/text.lore/collectible extension`；现行 schema 无法承载的值均显式标为 `runtimeProjection`。

## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `tools/lint/check_item_catalog.py` | 789 | AR-40 表头、子类、机器值、双写及公式校验 |
| `tools/lint/test_check_item_catalog.py` | 417 | 收藏品合法／非法输入与旧规则回归测试 |
| `tools/content/items_from_catalog.py` | 875 | 按列名解析、收藏品投影、schema 缺口保真 |
| `tools/content/test_items_from_catalog.py` | 295 | collectible extension、中文子类及发现计数测试 |

## 3. 关键结论与数值
- 实例 `items-collectibles.md`：151/151 行通过，无需返修；七子类计数为 21/22/23/21/21/21/22（porcelain/jade/bronze/qin/calligraphy/stationery/antique）。
- 151/151 均生成 `kind: collectible`、`extension.type: collectible`、`stack: 1` 与 `text.lore`；`study` 6 项、`appraise` 151 项、schema 兼容占位 `giftTo: []` 151 项。
- `it_jinpen` 的源 `kind=token` 作为未投影信息保留，文件归类仍强制生成 `kind: collectible`。
- 既有 11 份名录全通过；`--check` 为 894 行（889 生成 + 5 bootstrap），逐字节无变化。
- 单测：lint 297/297、content 17/17；`py_compile` 与 `git diff --check` 通过。

## 4. 开放问题（附默认值）
- 是否升级 `CollectibleExtensionSchema` 完整承载 AR-40？默认先保持现行严格 schema，并在 `text.desc` + `runtimeProjection` 中保真，待 schema 同步后再结构化。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本次实现遵循 `design/10` §11.5 与 §4.10.5–§4.10.6。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/data/src/schemas/item.ts` / `CollectibleExtensionSchema`：补 `giftValue`、`eraRange`、`provenance`；AR-40 `giftTo` 偏好对象与现有 NPC-affinity 数组不兼容，当前只能输出必填空数组。
- 同处：`study.delta` 当前映射到 `value`，`once` 无字段，`study.art=lore` 不在 `ArtIdSchema`，收藏介质 `tags` 亦无槽位；以上均暂存运行时投影说明。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 1：AR-40 九列、七子类、六键 + `luck`、60–120 码点、闭集、礼值带、`dc=8g−4`、双写均已校验，未放宽旧名录。
- ✅ 2：生成器自动发现新文件，按列名读取并产生 schema 可接受的 collectible 投影；旧 894 行检查不变。
- ✅ 3：已补要求的合法行、非法标签、越界礼值、非法年代、错列序及生成投影测试，两组指定命令全绿。
- ✅ 4：只读实例实跑 151 行全通过，无真实问题行；未修改名录。
- ⚠️ 工作区未安装 `node_modules`，未实跑 Zod 解析；输出结构已逐字段对照 `item.ts`，Python 投影测试通过。

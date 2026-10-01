# ART-item-medicine 报告 · 物品图 · 药物 / 补品 / 药材（32 项，按名录批量出图）

## 1. 摘要（3–6 行）

按 `items-medicine` 名录完成 32/32 项独立 PNG，一行一图，文件名与物品 ID 一致。
全部成图以倚天剑、九阴真经两张批准基线为唯一图片输入；本任务未联网，无历史参考图。
32 张均逐图目检；九花玉露丸、小还丹、天髓续命露各重试 1 次后采用第 2 候选，共生成 35 个有效候选、入库 32 张。
资产检查、SHA/尺寸复核和严格 ID 检查均通过；全批保持 `status: candidate`，待作者审批。

## 2. 产出（文件、行数、主要章节）

- `assets/default/item/medicine/`：32 张 `it_*.png`，均为 1254×1254 RGB PNG；无放大、抠图或后期重绘。
- `assets/default/item/medicine/manifest.yaml`：1140 行、32 条；含实际完整 prompt/negative、双基线引用、工具配置、源路径、时间、尺寸、SHA-256、状态和逐项 notes。
- `tools/agents/reports/ART-item-medicine.md`：本报告；未改设计文档、任务总表或提示词规范。

## 3. 关键结论与数值

- 名录覆盖率 `32 / 32 = 100%`；磁盘 PNG 数、manifest 条目数、唯一 ID 数均为 32。
- 有效候选数 `29×1 + 3×2 = 35`；三项重试均未超过“最多再生成 1 次”。生成前因相对路径被拒的 3 次调用未产生 PNG，不计候选。
- 提示目标为 1536×1536，工具统一实出 1254×1254；`1254 ≥ 1024`，满足强制最小边要求，按原字节入库。
- 两张风格基线 SHA-256 分别为 `919a1b4c…f895`、`69d15c60…a6e6`；每条 manifest 均登记完整哈希与“只取画风”角色。
- 品阶及年限只以材质、工艺、包装、根体与旧化表达；未使用品阶框、文字、数字或魔法光效。

## 4. 开放问题（附默认值）

- 作者是否接受 1254×1254 而非提示目标 1536×1536：默认接受工具原生输出，不插值放大。
- 轻微偏差：黑玉断续膏厚蜡封不突出；玉龙苏合散葫芦、紫霞养气丹瓷瓶视觉略大；天髓续命露瓶颈仍略通透。默认保留当前较优候选。
- 所有条目当前均为 `candidate`：默认待作者统一审批后再改状态，不在本任务自行标 `approved`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。工具原生尺寸与轻微画面偏差不修改设定基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无。本任务严格按既有名录出图；若运行时另有资产索引，应由下游集成任务引用 `assets/default/item/medicine/manifest.yaml`，本任务不越权修改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 逐项结果（历史参考 URL 均为“—”，因为本任务未联网；“通过*”表示 notes 中已登记轻微偏差）：

| ID | 候选数 | 自检结论 | 历史参考 URL |
|---|---:|---|---|
| `it_jinchuangyao` | 1 | 通过 | — |
| `it_huoxuewan` | 1 | 通过，三枚可数 | — |
| `it_wuchangdan` | 1 | 通过 | — |
| `it_fulingshouwuwan` | 1 | 通过 | — |
| `it_tianxiangduanxujiao` | 1 | 通过 | — |
| `it_bilingdan` | 1 | 通过 | — |
| `it_heiyuduanxugao` | 1 | 通过*，蜡封不突出 | — |
| `it_jiuhuayulu` | 2 | 通过，第2张恰好九枚 | — |
| `it_baotaiyijinwan` | 1 | 通过 | — |
| `it_tianyishenshui` | 1 | 通过 | — |
| `it_yulongsuheisan` | 1 | 通过*，葫芦略大 | — |
| `it_jiuzhuanhuanhundan` | 1 | 通过 | — |
| `it_yangjingwan` | 1 | 通过 | — |
| `it_bailucao` | 1 | 通过 | — |
| `it_xiaohuandan` | 2 | 通过，第2张恰好六枚 | — |
| `it_zixiaoyangqidan` | 1 | 通过*，瓷瓶略大 | — |
| `it_tongxidilongwan` | 1 | 通过 | — |
| `it_shengshengzaohuadan` | 1 | 通过 | — |
| `it_xueshenyuchanwan` | 1 | 通过 | — |
| `it_tiansuixuminglu` | 2 | 通过*，第2张玉纹更清楚、瓶颈略透 | — |
| `it_renshen` | 1 | 通过 | — |
| `it_shinianrenshen` | 1 | 通过 | — |
| `it_bainianrenshen` | 1 | 通过 | — |
| `it_qiannianrenshen` | 1 | 通过 | — |
| `it_xueshen` | 1 | 通过 | — |
| `it_shinianxueshen` | 1 | 通过 | — |
| `it_bainianxueshen` | 1 | 通过 | — |
| `it_qiannianxueshen` | 1 | 通过 | — |
| `it_duanchangcao` | 1 | 通过 | — |
| `it_tianshanxuelian` | 1 | 通过 | — |
| `it_qiannianlingzhi` | 1 | 通过 | — |
| `it_qiannianxuelian` | 1 | 通过 | — |

- ✅ 全图逐张检查：无文字、人物、手、场景、地面、明显投影、裁切或魔法光效；主体和从属包装完整，留白与基线画风成立。
- ✅ 待考登记：无常丹、茯苓首乌丸、碧灵丹、天一神水、玉龙苏合散、雪参玉蟾丸的出处细节，以及天山雪莲植物外观；未补造书名、人物、药效或引文。
- ✅ 原创扩展登记：所有无原著定本的容器、装饰、比例和配色；原创药物；人参/雪参/灵芝/雪莲年限分级及品阶画面语言。
- ✅ `python3 tools/agents/check_assets.py assets/default/item/medicine --min 32 --max 32 --min-side 1024`：图片 32、条目 32、问题 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出码 0；仅报告基线已知未定义 `sk_babuganchan`，本任务新增严格失败数 0。
- ✅ 附加核验：32 个文件 SHA-256、`size`、文件名、RGB 模式、`candidate` 状态均与 manifest 一致；改动范围仅限授权路径。

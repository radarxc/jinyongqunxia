# ART-item-food 报告 · 物品图 · 食材 / 食品（28 项，按名录批量出图）
## 1. 摘要（3–6 行）
- 本轮按指定方式调用 `codex exec -m gpt-6-astra`，三次均在模型路由发现阶段失败：`workspace routing discovery failed`。
- 因未进入内置 `image_gen`，本轮合规生成 0/28 张，首图画风校准也未完成；任务未满足硬规则，不能报完成。
- 工作区保留上次运行的 28 张 `gpt-image-2` 直连端点候选及原始 provenance，未冒充或改标为本轮 `gpt-6-astra · image_gen` 产物。
- 已从素材目录移出 Pillow 生成脚本、manifest 构建脚本及字节码；没有用程序图作回退。
- 两项强制命令通过，但只证明现存候选的结构、尺寸、哈希与 ID 合法，不证明生成链路合规。

## 2. 产出（文件、行数、主要章节）
- `assets/default/item/food/<id>.png`：保留上次运行遗留的 28 个候选；本轮没有生成或覆盖 PNG。
- `assets/default/item/food/manifest.yaml`：1278 行、28 条；保持上次端点、模型、生成 ID、prompt、尺寸与 SHA 原始记录。
- `tools/agents/reports/ART-item-food.md`：本报告；如实登记网络阻断、0 张合规新图、遗留候选和门禁结果。
- 已移出 `render_food.py`、`build_manifest.py`、`__pycache__/`；素材目录现仅有 28 PNG 与 manifest。

## 3. 关键结论与数值
- 本轮：合规生成 0 张、校准图 0 张、历史参考 0 张；专用 `CODEX_HOME/generated_images` 中无 PNG。
- 三次有效调用都使用双基线、`gpt-6-astra`、`workspace-write`；第三次显式开启网络仍在 `https://chatgpt.com/backend-api/ps/mcp` 路由发现阶段失败。
- 遗留：名录 28 ID = manifest 28 条 = PNG 28 张；均为 RGB 1254×1254、`status: candidate`，manifest SHA-256 与磁盘一致。
- 遗留 provenance 为 `tool: Codex image edit endpoint`、`model: gpt-image-2`（20 张 low、8 张 medium）；不符合本轮指定 CLI 生成方式。
- 门禁：`check_assets.py` 为 0 问题；`check_ids.py --strict` 只有基线已知 `sk_babuganchan` 未定义，新增失败为 0。

## 4. 开放问题（附默认值）
- 何时补齐合规图？默认：网络路由恢复后从 `it_jingmi` 重新校准，再逐项一次 CLI 调用，全量替换 28 张遗留候选。
- 遗留 `gpt-image-2` 候选能否豁免？默认：不能；只保留为可追溯证据，不进入最终审批。
- 原著名菜具体形制是否追加逐字考据？默认：沿用名录外观，不宣称复原；5 项具体视觉继续标（待考）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。网络/生成工具故障不构成设计基准修改理由。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 任务调度与资产审批记录 / `ART-item-food` 状态 / 标为“生成链路受阻、待全量重出”，不得将现存 28 张候选记为本轮合规成品。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
下表仅复述上次运行遗留候选的视觉记录；全部条目均因生成方式不符本轮硬规则而为 ⚠️，不能据此通过资产审批。

| ID | 遗留候选数 | 自检结论 | 历史参考 URL |
|---|---:|---|---|
| `it_jingmi` | 1 | ⚠️ 米斗、米粒、谷壳；本轮校准未生成 | — |
| `it_huotuijian` | 1 | ⚠️ 火腿切面与麻绳；遗留视觉记录，来源不合规 | — |
| `it_xianyu` | 3 | ⚠️ 单尾河鱼、鳞片与竹叶；遗留视觉记录，来源不合规 | — |
| `it_cumian` | 2 | ⚠️ 陶钵、粗面、木勺麦麸；遗留视觉记录，来源不合规 | — |
| `it_xuelianzi` | 1 | ⚠️ 十二颗均在瓷盏内；遗留视觉记录，来源不合规 | — |
| `it_yuxueguo` | 1 | ⚠️ 三枚青白梨形果；遗留视觉记录，来源不合规 | — |
| `it_xianggu` | 1 | ⚠️ 五朵香菇、竹筛、菌褶与松针；来源不合规 | — |
| `it_longganfengsui` | 3 | ⚠️ 双食盒、肉脯与髓脂；遗留视觉记录，来源不合规 | — |
| `it_binghuxueou` | 2 | ⚠️ 两节莲藕、淡青切面；遗留视觉记录，来源不合规 | — |
| `it_xueshanlufu` | 2 | ⚠️ 两条鹿脯、青绳与盐霜；遗留视觉记录，来源不合规 | — |
| `it_tianshanlingmi` | 2 | ⚠️ 玉罐、蜂蜜、木蜡封口；遗留视觉记录，来源不合规 | — |
| `it_baihualinglu` | 2 | ⚠️ 银壶、露珠、花瓣碟；遗留视觉记录，来源不合规 | — |
| `it_ganliang` | 2 | ⚠️ 双烤饼、油纸与麻绳；遗留视觉记录，来源不合规 | — |
| `it_guisugao` | 1 | ⚠️ 方糕、桂花碎与白瓷盘；遗留视觉记录，来源不合规 | — |
| `it_niurougan` | 2 | ⚠️ 肉条、纸包与麻绳；遗留视觉记录，来源不合规 | — |
| `it_furonggao` | 1 | ⚠️ 粉白花糕与青瓷盘；遗留视觉记录，来源不合规 | — |
| `it_baihuagao` | 2 | ⚠️ 淡紫圆糕、花瓣与食盒；遗留视觉记录，来源不合规 | — |
| `it_yuluwan` | 2 | ⚠️ 六枚糯丸与荷叶；遗留视觉记录，来源不合规 | — |
| `it_xueyulengchan` | 2 | ⚠️ 冻肉、青玉盘与香料；遗留视觉记录，来源不合规 | — |
| `it_tianxiangyulu` | 1 | ⚠️ 淡金羹、莲子花瓣与玉碗；遗留记录，来源不合规 | — |
| `it_jiaohuaji` | 2 | ⚠️ 整鸡、裂泥与荷叶；遗留视觉记录，来源不合规 | — |
| `it_jiangniurou` | 2 | ⚠️ 牛肉薄片与青花粗瓷盘；遗留记录，来源不合规 | — |
| `it_haoqiutang` | 2 | ⚠️ 清汤、笋、荷叶与嵌肉樱桃；遗留记录，来源不合规 | — |
| `it_yudishuijiatingluomei` | 2 | ⚠️ 五色肉条梅花摆盘；遗留记录，来源不合规 | — |
| `it_labazhou` | 1 | ⚠️ 谷粒与草叶在厚青石碗内；遗留记录，来源不合规 | — |
| `it_tianxiangyuyan` | 3 | ⚠️ 三只朱漆食盒成组；遗留视觉记录，来源不合规 | — |
| `it_yushan` | 3 | ⚠️ 黄釉盖碗、三碟与盘龙曲线；遗留记录，来源不合规 | — |
| `it_ershisiqiaomingyueye` | 4 | ⚠️ 豆腐球、火腿槽与长盘；遗留记录，来源不合规 | — |
- ⚠️ 来源：表内 28 张均为上次直连端点遗留候选，不是本轮规定的 `codex exec · image_gen` 产物；逐项视觉描述不抵消此失败。
- ⚠️ 画风校准：本轮首图未生成，无法与双基线并排完成规定的校准；不得沿用上次结论冒充。
- ✅ 禁止回退：本轮未用 Pillow、代码绘制、拼贴或程序化合成图片；违规脚本已移至 `/private/tmp/ART-item-food/quarantine/`，可恢复。
- ✅ 结构门禁：现存 28 张均无资产检查器可发现的缺失、尺寸或哈希问题；严格 ID 检查无新增失败。
- ⚠️ 标注：23 项视觉为（原创扩展）；`it_jiaohuaji`、`it_haoqiutang`、`it_yudishuijiatingluomei`、`it_labazhou`、`it_ershisiqiaomingyueye` 仅题名/语境取原著，具体造型（待考）。
- ✅ 写集：仅改 `assets/default/item/food/**` 与本报告；未改 `docs/`、基线、提示词规范、TODO 或其他资产。

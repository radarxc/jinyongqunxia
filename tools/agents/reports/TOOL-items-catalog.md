# TOOL-items-catalog 报告 · 工具 · 物品生成器跟上名录扩充（去掉写死行数，重新生成 content/items）
## 1. 摘要（3–6 行）
生成器已改为自动发现 `docs/design/catalog/items-*.md`，严格解析七列表、全局去重，并审计 design/10 §14.2 的精确 ID 覆盖。
已验证 894 行、重生成 `content/items` 889 件；5 件 bootstrap 保留在 `content/common/items` 且只校验、不越写集修改。
新增 6 个 unittest，覆盖真实扩充计数、自动发现、重复 ID、坏行、登记表审计与紧凑运行时文本。
续作已修复包体超限：保留结构化规则、两段外观辨识信息和未投影字段，不重复内联名称/完整效果/完整出图提示；六项门禁全绿。
## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 / 数量 | 主要产出 |
|---|---:|---|
| `tools/content/items_from_catalog.py` | 678 行 | 自动发现、严格表解析、标准库 YAML emitter、登记审计、紧凑投影、生成 / `--check` |
| `tools/content/test_items_from_catalog.py` | 130 行 / 6 用例 | 扩充计数、重复 ID、坏行、登记表与文本投影反例 |
| `content/items/**` | 889 文件 / 23,406 行 | 528 件新增；361 件既有生成物同步重生成 |
| 本报告 | ≤40 行 | 数量、体积、问题与门禁 |
## 3. 关键结论与数值
- 各名录：accessories 48、armor 8、belts 26、clothing 30、food 174、hidden-weapons 51、innerarmor 8、manuals 180、medicine 96、shoes 26、weapons 247；合计 894，ID 唯一。
- 新旧生成数量：366→894（+528）；`content/items` 361→889，另有 5 件 common bootstrap；`it_tao`、`it_aqing_qingcha` 已生成。
- 源体积：`content/items` 260,929→476,563 B（+215,634 B），10,339→23,406 行（+13,067）。
- Bundle：虚拟内容块 387.47→592.70 kB（gzip 66.94→95.14）；entry 132.20→159.49 KiB，webgl 295.23→322.51 KiB，分别低于预算 10.51 / 27.49 KiB。
- ENG-18 分片已生效：15 章各 7 片，最大叶片 261,677 B < 256 KiB；最大 ch02 合计 gzip 136,640 B（133.44 KiB）<1.25 MiB；Vite 兼容入口仍未发出 `book-*` JS。
- 名录问题：design/10 §14.2 只逐字覆盖 569/894，缺 325（manuals 170、weapons 128、hidden-weapons 27）；当前不存在 `items-herbs.md`，药材实际在 `items-medicine.md`，`gather-herbs.md` 仅为分布表。
## 4. 开放问题（附默认值）
- O1：默认继续以自动发现为准；未来加入 `items-herbs.md` 会自动纳入，不把 `gather-herbs.md` 误当物品表。
- O2：默认维持现有预算与紧凑描述；后续由开发监督让运行时改读 ENG-18 叶片并移除旧全量虚拟内联。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无；本任务只同步生成工具与数据。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 / 代码 | 位置 / 改什么 |
|---|---|
| `design/10` | §14.2 补登记上述 325 个名录 ID，并把“十一份固定路径”改为自动发现口径 |
| `apps/game/build/content-plugin.ts` / ENG-18 | 运行时消费已发布书界叶片，停止 `virtual:tianshu-content` 直接读取全部 `content/items` |
| DES-economy-gather / 任务清单 | 统一药材文件名：当前权威是 `items-medicine.md`，并无 `items-herbs.md` |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `items_from_catalog.py --check`；✅ unittest discover 33/33；✅ 冻结安装；✅ `content:validate` 923/923；✅ strict IDs 新增失败 0。
- ✅ `pnpm check`：lint、typecheck、Vitest 116 文件 / 779 用例、内容校验与 size 全通过；预算未改、门禁未跳过。
- ✅ 仅用 Python 标准库；无写集外 Git 差异；`git diff --check` 通过；未执行改变仓库状态的 git 命令。

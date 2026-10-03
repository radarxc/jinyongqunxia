# DES-items-lore-3 报告 · 物品说明与属性投影 3（秘籍 A）· 逐件写短文并填属性投影（作者 10-02 晚）
## 1. 摘要（3–6 行）
- 已按协调者 2026-10-03 裁定完成 `items-manuals.md` 整份 180 件，五张表均统一为九列。
- 每件均补齐 60–120 字名录说明与 `item-attribute-projection.v2` 投影；未改 ID、旧效果字段或外观要点。
- 说明结合逐件提示词中的年代、出处、装帧与旧化特征；原创载体均明标 **（原创扩展）**，不确定原著事实保留 **（待考）**。
- 本轮已将北冥神功原本修为由误折算的 `3000` 改为完整基准 `5000`，并统一规则表述；两项指定校验均已重跑通过。
## 2. 产出（文件、行数、主要章节）
- `docs/design/catalog/items-manuals.md`：272 行；180 件说明／投影、统一九列表头、§数据校验规则及开放项。
- `tools/agents/reports/DES-items-lore-3.md`：本报告，≤50 行。
## 3. 关键结论与数值
- 完成 180/180 行；说明去除 Markdown 后 69–93 字；投影为 `readWis` 126 件、`readBre` 54 件，均含 `skillRef/maxLayer/cultivation`。公式审计为 `full/original` 90 件取完整基准，`partial/copy` 90 件乘 `maxLayer/10`，180/180 无误。
- 门派武技例 `it_miji_taizuchangquan`：黄上 `grade=3` → `readWis=30`（黄带 15–30）；全本直接取 grade 3 完整基准，`cultivation=1000`。
- 门派内功例 `it_miji_quanzhenxinfa`：玄中 `grade=5` → `readBre=35`（玄带 25–40）；抄本 8 层；`cultivation=1600×8/10=1280`。
- 通用武技例 `it_miji_zhuzhijianfa`：玄上 `grade=6` → `readWis=40`（玄带 25–40）；原本直接取 grade 6 完整基准，`cultivation=2000`。
- 通用内功例 `it_miji_junzhangtuna`：黄中 `grade=2` → `readBre=25`（黄带 15–30）；抄本 8 层；`cultivation=750×8/10=600`。
- 原本特例 `it_miji_beiming`：天上 `grade=12` → `readBre=70`（天带 55–70）；`variant=original` 故 `cultivation=5000`，来源上限 `maxLayer=6` 不参与折算。
## 4. 开放问题（附默认值）
- v2 只冻结四阶带与典型值，未明列逐品级全本基准；默认 grade 1–12 为 `500/750/1000/1200/1600/2000/2500/3000/3500/4000/4500/5000`；全本／原本取完整基准，仅残本／抄本乘 `maxLayer/10`。
- 题签生成器是否支持全部版本／载体后缀仍待确认；默认剥离后写武功本名，竖排不可用时降级为横排端楷。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- P-DES3-01 / 在 `design/10` §4.10.7 冻结秘籍逐品级 `cultivation` 基准，并明确仅残本／抄本按 `maxLayer/10` 折算 / 避免后续内容批次以同一四阶带作不同插值。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `design/06` / 无需登记 / 本名录为秘籍投影，没有武器 `qiEffect`。
- `assets/default/prompts/items/manuals/*.md` / 类别专项 / 后续生成时移除模板残留“空题签”，并令 `manual_title()` 剥离“原本／全本”等后缀；本任务依约未改提示词。
- 原著考据 / `it_miji_dajingangzhang`、`it_miji_yijinjing` / 按三联／广州修订版核“大金刚掌／大力金刚掌”用名及易筋经／神足经关系。
- 名录错漏 / 未发现 / 180 个 ID 均有一一对应提示词，效果字段与投影的技能、层数一致。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 范围与结构：整份 180 件、五张表均为九列；无七／九列混用，无新增／删除／改名 ID。
- ✅ 文案与考据：180 条说明均为 60–120 字（实测 69–93），含来历、用法／讲究与传闻或持有语境；原创与待考标注保留。
- ✅ 属性：180 条仅用 v2 秘籍字段；`skillRef/maxLayer` 180/180 双写一致，门槛全在对应品阶带；本轮修正北冥原本 `3000→5000` 后，全本／原本完整取值与残本／抄本折算均复算一致。
- ✅ 提示词：180 个名录 ID 与 `assets/default/prompts/items/manuals/<id>.md` frontmatter 一一匹配；说明吸收外观、年代与来源要点。
- ✅ `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-manuals.md`：通过，180 行九列机器行。
- ✅ `python3 tools/lint/check_ids.py --strict`：通过；仅报告基线既有 undefined 1，strict failure count 0。
- ✅ 下游 TOOL/ENG 交接：说明落 `text.lore`；投影落 `extension.value.attributes`，字段为 `version:2`、`skillRef`、`readWis/readBre`（二选一）、`maxLayer`、`cultivation`。
- ✅ 完整性：无 `TODO`／“此处省略”／“待补充”占位，`git diff --check` 通过，只改两份获准文件，未执行改变仓库状态的 git 命令。
- ⚠️ 待作者确认：§4 的逐级 `cultivation` 曲线及折算默认值；当前全本／原本与残本／抄本已分别依该默认统一落表。

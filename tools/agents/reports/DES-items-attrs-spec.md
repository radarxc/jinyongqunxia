# DES-items-attrs-spec 报告 · 物品属性投影规格 v2 · 作者分类字段（锋利 / 硬度 / 内力亲和、防御 / 反伤 / 防暗器、身法、格挡、吉运 / 放毒 / 避毒、药品食品效用）、取值带与名录「说明」列格式（design/10）

## 1. 摘要（3–6 行）

- `design/10` 已升至 v1.7，新增 §4.10“属性投影 v2”，覆盖作者指定的武器、衣物、鞋、护腕、其他装备、药品、食品与其他物品。
- 规格冻结整数单位、天地玄黄取值带、既有公式消费点、硬度实例状态、九列名录语法及八批次速查表；投影与旧“效果字段”并存且禁止双算。
- 新增 V10-01～V10-08、T48～T55，并登记 O26～O29 默认值；本任务未改名录、schema、工具或其他归属文档。

## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/10-items-and-equipment.md` | 2841 | v1.7 变更记录；§4.10.1–§4.10.7；`durability` 实例／生成契约；§14 术语；V10-01～08；T48～55；D-24～25；O26～29 |
| `tools/agents/reports/DES-items-attrs-spec.md` | 本报告 | 结论、开放项、后续同步与逐项自检 |

## 3. 关键结论与数值
| 主题 | 规格与接口 |
|---|---|
| 武器 | `atk=mainK×100`，只生成既有 `atkOut flatLv`；建议 protocol 4 硬功支改读最终 `atkOutSnapshot`；`qiAffinity=100` 仅乘外放支一次；`hardness` 初始化跨战耐久 |
| 防具 | `def=roundHalfUp(100×kDef×G)`，四阶总带 `3–42/4–60/5–84/7–123`；`reflect` 只映射 04 §6.3；`antiHidden` 建议进条件 Z4 |
| 属性／毒 | `agi/luck/block/antiPoison` 分别复用 `agi/luk/parry/resPoison`；`poison` 建议以 `min(6000, poison×500)bp` 接效果命中，须有正式毒 Buff |
| 药食 | `restoreQi/healOuter/stamina` 分别按资源上限百分点评分；`healInner` 只减正式内伤层；`qiCultivation` 接 `sxpGrant`；`con` 计永久先天总账 |
| 名录 | 九列固定为 `ID/名称/子类/品阶/出处/说明/效果字段/属性投影/外观要点`；说明 60–120 字；小数旧效果按 `roundHalfUp` 投影，运行保留精确值 |
| 硬度 | 默认先算 `blockHardness=5×block`，再以 `max(1,1+floor((blockHardness-hardness)/20))` 损耗；20% 受损、0 破损 |

## 4. 开放问题（附默认值）
| 编号 | 待确认 | 本文默认 |
|---|---|---|
| O26 | 永久根骨总预算 | 药食 ≤20 且药食 + 常规奇遇／事件 ≤24；普通来源不破 100，显式 `breakCap` 另受稀有池最多 20 约束 |
| O27 | 硬度阈值／神兵 | `block×5` 换算、20% 受损、0 破损、跨战保留；神兵首版免日常损耗 |
| O28 | 吉运作用点 | 只写现有 `luk flat`，不新增幸运骰或直接宝箱率 |
| O29 | 建议接口入核心协议 | `qiAffinity` 外放支一次；`poison` 效果命中；`antiHidden` 条件 Z4，实装前均为【建议值】 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| 无新增 | 本轮不修改 `00-canon`；字段、实例与名录格式均属 `design/10`，跨公式接口先走 D-25／O26～O29 | 遵守 §18 唯一归属，待压测与作者确认后再决定是否上提基准 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档／任务 | 位置 | 后续改动 |
|---|---|---|
| `tools/content/items_from_catalog.py`／TOOL-items-catalog | 行解析与投影 | 七列改九列；去掉 ID 后要求 `len(cells)==8`，索引 `name/sub/grade/source/lore/effect/attributes/look=0..7`；`说明→text.lore`，属性投影解析后写 `extension.value.attributes` |
| `packages/data/src/schemas/item.ts` | strict extensions／实例 schema | 增 `AttributeProjectionV2{version:2,...}`，各适用 extension 可选 `attributes`；装备实例补 `durability:{current,max}` 或 `null` |
| TOOL-items-catalog | 校验与编译 | 实现 V10-01～08、T48～55；双写按 `roundHalfUp` 规范化校验，保留旧精确运行值且不生成舍入原子；迁移十一份名录为九列 |
| `design/03/04/05/06/15`、`tech/05` | 对应公式／协议 | 审核 D-25：protocol 4 的 `atkOutSnapshot` 硬功接线、永久预算、外放亲和、反伤/Z4/毒命中、`sxpGrant` 与内伤边界；未接收前保留【建议值】 |
| DES-items-lore-1～8 | 各名录批次 | 依 §4.10.7 逐件写 60–120 字说明与属性机器行；原著未核细节标（待考），原创设定标（原创扩展） |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 验收项 | 结果 |
|---|---|
| 武器 `atk/hardness/qiAffinity/qiEffect` 与两支攻击接口 | ✅ 字段、四阶带、默认、算式及实例耐久均已给出 |
| 衣物 `def/reflect/antiHidden`；鞋 `def/agi`；护腕 `def/block` | ✅ 分类约束、典型值与既有原语映射齐全 |
| 其他装备 `luck/def/poison/antiPoison` | ✅ 限定描述依据，禁止为凑字段虚构效用 |
| 药品五字段；食品三字段；“其他”可选字段集 | ✅ 内外伤、经脉、体力、永久预算边界已分开 |
| 四阶取值带、九列格式、说明与机器行 | ✅ 旧效果列保留，语法、白名单、双写和范围规则齐全 |
| 八批次速查、V10 校验、T48～55 | ✅ 均已落在 §4.10.7／§15 |
| 只改允许文件、无占位、Markdown 差异检查 | ✅ 最终检查通过 |
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；仅报告仓库基线已知 `sk_babuganchan`，新增失败数 0 |

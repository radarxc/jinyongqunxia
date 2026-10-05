# ID 与武学图鉴一致性检查器

`check_ids.py` 对规划文档中的内容 ID 做保守的跨文档静态检查。它只使用 Python
标准库，兼容 Python 3.9 及以上版本，可在 Windows、macOS 和 Linux 运行。设计原则
是宁可漏掉弱信号，也不把示例、候选项或迁移说明误报成正式内容。

## 用法

在仓库根目录运行：

```shell
python3 tools/lint/check_ids.py
python3 tools/lint/check_ids.py --json
python3 tools/lint/check_ids.py --strict
python3 tools/lint/check_ids.py --update-baseline
python3 tools/lint/check_ids.py docs/design/06-buff-system.md docs/design/catalog
```

不传路径时递归扫描 `docs/` 下所有 `.md`，并扫描明确登记的数据源
`docs/design/map/*.yaml`。路径参数可以是受支持文件或目录；不存在的路径和其他
文件会产生警告。无论扫描范围如何，脚本都会额外读取
`docs/00-canon.md`、`docs/decisions/rulings-v1.md` 和存在时的
`docs/design/07-set-system.md` 作为前缀、锚点、重命名及套装弃用规则来源，但不会把
范围外支持文件的问题计入结果。完整跨文档审计应采用默认扫描。

默认输出供人阅读的报告，发现问题时仍退出 `0`。`--json` 输出稳定 JSON，警告只写
标准错误，不污染 JSON。`--strict` 在出现基线之外的新“引用但未定义”或“仍使用
旧 ID”时退出 `1`；冲突定义与套装双向不对称不受基线豁免，存在即失败。近似名只作
警告，不触发严格模式。完整扫描后用 `--update-baseline` 原子刷新
`tools/lint/check_ids_baseline.json`；基线只保存第 1、4 类 ID，该参数拒绝路径参数，
防止把局部扫描误写成全仓基线。没有基线或基线无效时，第 1、4 类均视为新增。

2026-09-30 NAuF-lint 全量复核：111 文件、64,701 次出现、13,969 个定义；
基线与实际债务均只有未定义 `sk_babuganchan` 1 项，旧 ID 0 项，无失效基线条目，
因此未刷新基线。新增严格失败、冲突定义、近似名、套装不对称均为 0。
此已知债务继续按既定默认禁用于生产，tech/04 §11 的登记交收口任务同步。

运行单元测试：

```shell
python3 -m unittest -v tools.lint.test_check_ids
```

## 检查的五类问题

1. **引用但未定义**：活动正文中的 ID 没有在允许的归属文档中形成定义。
2. **冲突的重复定义**：同一 ID 在多个文件定义且可提取的名称不一致。当前至少
   比较名称；同名索引/摘要不报错。武学名称以 `docs/design/catalog/*.md` 的
   `SkillDef` 为准，`design/05` 的机制标题不会覆盖图鉴名。`mfr_*` / `txp_*`
   若同时在 `design/21` 与武学图鉴定义，则无论名称是否相同都按所有权冲突报告。
3. **疑似近似拼写**：同前缀 ID 的后缀编辑距离为 1 或 2，且恰有一方已定义。
   连号、父子式前缀、高密度子 ID 空间会降噪；已人工确认的合法近名对由
   `tools/lint/check_ids_near_allowlist.json` 管理。
4. **旧 ID 仍在使用**：从 `rulings-v1.md` §2 重命名表动态解析旧值、模式和替代值；
   另从 `design/07` §19 解析候选套装的并入、删除或延后去向。裁定表、迁移说明、
   旧新对照、别名、历史提案、非生产夹具及否定式举例不计；活动正文仍会报告。
5. **套装成员不对称**：当 `docs/design/07-set-system.md` 存在时，双向比较
   §8–§18 正式目录的成员表与武学/装备/物品定义的 `setTags`；§2.2 示例和 §19
   弃用目录不算定义。缺少 07 时明确显示跳过。

JSON 顶层包含 `schema_version`、`root`、`prefix_source`、`prefixes`、`scan`、
`issues`、`counts`、`set_check`、`near_allowlist`、`baseline`、
`strict_failure_count` 和 `warnings`。
`issues` 始终保留当前全部问题；`baseline.new_undefined_ids` 与
`baseline.new_deprecated_ids` 是严格模式实际阻断的新增集合。问题位置均为
仓库相对文件名，以及从 1 开始的行、列号。

## ID 提取与定义规则

### 前缀

正常运行时，前缀来自 `docs/00-canon.md` §12 命名表“格式”列中的反引号文本；
`chNN_*` 归一为 `ch`，其余取首段至下划线，例如 `sk_<拼音>` 得到 `sk_`。
若文件不可读、§12 不存在，或核心前缀不完整，则使用脚本中的 `DEFAULT_PREFIXES`，
并向标准错误输出警告。内置表只是部分检出和损坏仓库的兜底，不是正常事实来源。

### 出现位置

普通 Markdown 正文只提取反引号内的 ID；围栏代码块和已登记 YAML 数据源还识别
以下形式：

```yaml
id: sk_demo
requires:
  - sk_parent
```

JSON 字符串、带键的值和列表项也会提取。`sk_<拼音>`、`chNN_<pinyin>` 等模板、
文件路径内部的片段，以及明显的 schema/资源变体会被排除。建议新文档始终给内容
ID 加反引号；这样既便于阅读，也能被检查器稳定识别。

`quest.v1` 围栏中的 `st_*`、`edge_*`、`fx_*`、`chk_*` 及旧式局部 `tr_*` 只在
声明它们的同一任务块内解析，不进入全局未定义或近似名检查；明确写有
`fixture: true` 的任务对象及带后缀 `example` 或 `example_*` 的示例 ID 也不视为活动
内容。其他相似拼写不会因此整体豁免。

任务 DSL 与属性 schema 中形似套装的 `set_*` 通过声明语境识别：包括 12 的
`allowedEffects`、16 的 `kind` 判别联合，以及 03 的 `flat_* / pct_* / set_*` 修饰族。
这不是任意 `set_*` 白名单；离开这些登记或判别语境的同形 token 仍按套装 ID 检查。
`route_*` 也没有整族豁免：只有在 `design/19` 或地图 YAML 中按归属规则定义的地图
路线才合法，剧情状态须使用相应 `flag_*` ID。

### 定义与归属

一个出现只有同时满足“定义形态”和“归属文档”才算定义。支持的定义形态为：

- Markdown 表格的明确 `ID`/`对象 ID` 列，或已知对象名首列；
- 围栏 YAML/JSON 与登记数据源中的 `id:` 字段或以完整 ID 为键的映射；
- 带名称的条目标题，例如五级标题“幻阴指 `sk_huanyinzhi`”；
- 明确的“本文新增术语与 ID”/“ID 清单”登记；
- 少量仓库既有的强语义形式，例如 Buff 的 `family:`、`exclusive:` 和连续性旗标。

经脉内容采用两层归属：`design/21` 定义模式、共享模板与示例，
`docs/design/catalog/skills-*.md` 定义具体武学的 `mfr_*` 路线和 `txp_*` 调息档案
实例；`qnl_*` / `dxl_*` 仍只由 `design/21` 定义。图鉴中的显式实例列按实际写法
识别：路线列为 `路线 id`、`movementRouteRef`，调息列为 `breathProfileRef`、
`BreathProfile.id`；NC1 使用的复合列 `内功 → 调息档案` 仅接受恰好一个
`sk_* → txp_*` 映射。只写“按 `mfr_<move>` 派生”或只列 `mv_*` / 模板不会
自动生成定义，缺少显式实例仍按“引用但未定义”报告。

候选、建议、示例、占位、迁移、重命名、旧 ID、别名、历史、不采纳、开放问题、
参考资料等上下文不建立正式定义或活跃引用；同句“禁止 / 不新增 / 只作迁移源”等
否定措辞同理。规则按小节标题、表头、代码块 schema 与行内语义判定，不按具体旧 ID
逐项放行。所有定义形态仍须通过 `OWNERSHIP`：同样的 `ID` 表、标题或 `id:` 写在非归属
文档时只算引用。Buff 族、场景键、残本和明确生产清单等多 ID 单元格只按窄规则
识别；`fam_*`、正式存档槽与视频序列、时辰物品、秘籍/残页和配方学识按权威命名
规则识别派生实例，而不要求穷举。

归属配置位于 `check_ids.py` 顶部的 `OWNERSHIP`。当前按基准 §18 与实际布局分组：

| ID 族 | 允许定义的文档 |
|---|---|
| `ch` | `docs/00-canon.md` §2 |
| `sk_` / `mv_` / `ps_` | `docs/design/catalog/*.md`、`design/05`；`sk_` 另含 Canon §13 |
| `aoe_` | `design/09` |
| `vow_` | `design/05` |
| `bf_` / `fam_` / `exg_` / `rx_` | `design/06` |
| `set_` | `design/07` |
| `tr_` / `tst_` / `gate_` | `design/08` |
| `enc_` / `bsc_` / `cmb_` / `tg_` / `wk_` / `gauge_` / `pers_` / `ea_` / `ai_` | `design/09`；`enc_` 也可由章节定义 |
| `eq_` / `it_` / `af_` / `ue_` / `ins_` / `rc_` / `ev_` | `design/10`；`eq_` 另含 Canon §14，`ev_` 也可由章节定义 |
| `npc_` | `design/18` 与 NPC 图鉴；旧章节、`design/11`、`design/12` 只引用 |
| `q_` | story 定义主线幕（含数字生产 ID）；chapters 可定义本界非主线实例；`design/11` 可定义奇遇实例；`design/12` 只给 schema / fixture |
| `rg_` | `design/11` 的三十区终稿、`design/map/*.yaml`；章节和 `design/19` 草案只引用 |
| `sect_` | `design/17` 的权威矩阵与 `design/map/sects.yaml`；`design/12` 只引用 |
| `tsp_` / `end_` / `ach_` / `ttl_` / `diff_` / `rule_` / `tj_` / `sh_` / `sqj_` / `fin_` / `yy_` | `design/13` |
| `save_` / `rs_` / `lg_` / `echo_` / `bs_` | `design/02`；`save_`、`echo_` 也可由 `design/13` 定义 |
| `tal_` / `tmpl_` / `arch_` | `design/03` |
| `origin_` | `design/01` |
| `mer_` / `ap_` / `zt_` | `design/15` |
| `mfr_` / `txp_` | `design/21` 的模式、共享模板与示例；`catalog/skills-*.md` 的具体武学实例 |
| `qnl_` / `dxl_` | `design/21` |
| `res_` / `sv_` / `job_` | `design/16` |
| `rp_` / `biz_` | 对应 `design/chapters/NN-*` 的书界实例 |
| `city_` / `offmap_` / `post_` / `port_` / `route_` | `design/19` 与地图 YAML |
| `sc_` | 对应 `design/chapters/NN-*`；书界号必须匹配文件号 |
| `poi_` | `design/11`、`design/19` 与地图 YAML |
| `dc_` | 对应 `design/story/NN-*`；书界号必须匹配文件号 |
| `lgs_` / `frag_` / `cache_` | `design/20` |
| `vid_` | `design/02` 与 `tech/07` 的正式视频清单 |

`set_`、`npc_`、`q_` 的全部归属文件都尚不存在时，第 1 类会暂停该 ID 族，避免增量
编写阶段把所有前向引用当错误；归属文件一旦出现便恢复检查。

## 已知局限

- 这是有意保守的 Markdown 词法检查器，不是完整 Markdown/YAML 解析器。普通正文中
  没有反引号的 ID、非常规表格以及动态拼接出的 ID 可能漏检。
- 重复定义目前只比较可稳定抽取的名称，不比较品阶、效果、数值等所有字段。名称
  缺失或仅在同一文件重复时不会形成第 2 类问题。
- 编辑距离只提供候选，拼音接近不等于错误；两边都已有正式定义时默认视为合法兄弟。
  恰有一方定义但仍属合法近名时，将无序二元组加入
  `check_ids_near_allowlist.json`；配置缺失或格式无效会告警且不静默放行。
- 近似 ID 的位置优先采用活动正文中的首次出现；仅在定义中出现的 ID 回退到定义
  位置。若调用方提供了既无出现位置也无定义位置的合成候选，则显示 `?:0:0`。
- 对“建议/示例/迁移”语义的判断依赖标题和行内关键词。新写法若未沿用现有标注，
  可能需要增加窄范围规则。
- 套装检查以 07 §8–§18 的三级标题 `set_*` 和其下“成员（N）”表行为正向目录；
  反向 `setTags` 可来自表格、YAML 或具名卡片。非常规标题、跨卡片拆写字段可能漏检。
- 已进入中央重命名表或 07 §19 弃用表的活动旧 ID 只归第 4 类，不在第 1 类重复
  计数；诊断会给出正式替代套装或“删除 / 延后”。
- baseline 键只保存 ID，不保存易漂移的行号；删除已知问题会自然从报告消失，新 ID
  仍会阻断。重命名同一缺口也会被视为新增，需修复或经完整审计后刷新基线。

## 扩展配置

增加新 ID 前缀或归属文档时：

1. 先在 Canon §12 命名表登记格式；脚本会自动把前缀加入提取正则。
2. 在 `check_ids.py` 的 `OWNERSHIP` 为该前缀增加仓库相对路径或 `fnmatch` 模式。
3. 若该族允许参数化实例，在 `DERIVED_ID_PATTERNS` 增加严格的完整匹配，并在
   `covered_by_parameterized_definition()` 指定权威前提。
4. 若定义不使用通用表格、标题或 YAML `id:`，在 `semantic_definition()` 增加只针对
   该前缀和归属文件的窄规则。
5. 若是大量天然相近的子 ID，可在 `near_match_issues()` 的高密度族列表中排除；单个
   已确认语义兄弟以无序二元组加入 `check_ids_near_allowlist.json`。不要用整篇文档忽略
   来压误报。
6. 为新增形态在 `test_check_ids.py` 添加最小临时仓库用例，并运行上述单测和一次
   全仓 `--json` 扫描。

若 Canon 暂时缺失，新前缀还应同步加入 `DEFAULT_PREFIXES`，保证 fallback 模式可用。

## 武学图鉴一致性检查器

`check_skill_catalogs.py` 审计当前 25 册 `docs/design/catalog/skills-*.md` 的绝招、
经脉路线与调息档案。默认扫描全部图鉴，也可在命令末尾传入一册或多册；多册参数会
作为同一次审计共同检查。

```shell
python3 tools/lint/check_skill_catalogs.py
python3 tools/lint/check_skill_catalogs.py --details
python3 tools/lint/check_skill_catalogs.py --json
python3 tools/lint/check_skill_catalogs.py --strict
python3 tools/lint/check_skill_catalogs.py --diversity
python3 tools/lint/check_skill_catalogs.py --diversity --details
python3 tools/lint/check_skill_catalogs.py --diversity-strict
python3 tools/lint/check_skill_catalogs.py --delivery
python3 tools/lint/check_skill_catalogs.py --delivery --details
```

除 V-M01 三方一致、逐门绝招配额、7 / 9 / 10 重解锁层、显式路线、同门路线相似度、
`outOfBattleScaleBp` 与旧 Buff 外，检查器还要求每个 `mfr_*` 的具体步骤序列在本次
扫描的全部图鉴中只定义一次。路线定义识别不依赖章节编号或固定版式：判据是同一
Markdown 表格行含恰好一个 `mfr_*` 和至少一个具体 `ap_*` 步骤，因此 §0.12.x 及后续
同形表格均可识别。第二次及以后定义无论序列相同还是不同均报错，诊断同时给出首次
定义与重复定义的文件和行号。只列路线 ID，或步骤列写“见文首索引”等且不再列
`ap_*` 的行按引用处理。

逐门配额按品阶判定：黄阶、玄下、玄中为 0，玄上与地下为 1，地上与天下为 2，
天上为 3。天中与地中优先读取
`docs/decisions/ultimate-counts-tianzhong-dizhong.md` §3 的 `sk_*` 与“现→裁（变动）”
列并作精确核对；未入裁定表的新武学分别退回 2–3 与 1–2，并输出“未入裁定表”提示，
提示不计入 `errors`、也不令 `--strict` 失败。裁定表缺失、§3 不存在、表头/数据行无法
解析、重复 ID 或算术不一致均为配置错误，命令输出明确 `ERROR` 并退出 `2`。正式扫描
范围由 `docs/design/catalog/skills-*.md` 路径模式决定，不维护易漂移的整册门数/绝招
总数快照；`MoveDef.ultimate:true` 仍是绝招真值，降龙十八掌的跨文档定义例外不变。
正文真值若没有任何路线目标，会单独报“缺路线”，避免因 `mfr_*` 镜像整体漏写而
从检查范围消失。已经进入逐门裁定表、后来又改到天中 / 地中以外品阶的武学会输出
“过时裁定”提示；提示不计入 `errors`，用于提醒维护者清理或更新裁定源。
该例外的三条最终路线实际定义在 `design/21` §12.1；默认正式扫描会把它们计入
`wujue` 的多样性统计，但不会把 `design/21` 当成第十二册图鉴。传入临时文件或不含
正式五绝册的局部路径时，不附加这三条路线。

### 跨武学绝招路线多样性

多样性检查只比较最终绝招路线，并排除同一 `skill_id` 内部的配对：同门多绝招已有
更严格的“共享穴位不超过较短路线 50%、不得循环轮换 / 逆序”规则。跨武学检查采用：

```text
signature = tuple(acupointRef)
overlapBp = floor(10000 * |set(A) ∩ set(B)| / min(|set(A)|, |set(B)|))
```

- 不同武学的 `signature` 完全相同：精确重复；只报告的 `--diversity` 以 `EXACT`
  标记，`--diversity-strict` 以 `ERROR` 标记并作为严格失败。CT、风险或路线 ID
  不同不能把同一穴位序列变成不同路线。
- 不同武学 `overlapBp >= 8000`：要求人工说明共同内功 / 门派底子与动作差异。非完全
  相同只警告；同穴逆序或重排是 10000 bp 警告，而不是有序精确重复。
- 分母取较短路线，避免一条长路线完整包住短路线却被长度稀释。正式路线已由既有检查
  保证穴位不重复，因此集合交集不会隐藏单路线重复点。

开关彼此独立，兼容既有门禁：

| 开关 | 输出 | 多样性导致的退出码 |
|---|---|---|
| 无 / `--strict` | 不运行多样性分析 | 无；`--strict` 只按既有图鉴错误退出 1 |
| `--diversity` | 按册汇总、全局汇总、所有精确组、非精确警告总数 | 始终不改变退出码 |
| `--diversity --details` | 再展开每一对非精确 `>=80%` 路线及位置 | 始终不改变退出码 |
| `--diversity-strict` | 同项统计，但精确组标题 / 明细使用 `ERROR` / `ERROR exact sequence` | 存在至少一组跨武学精确重复时退出 1；仅高重合仍为 0 |

按册字段中 `exact_groups/exact_pairs/similar_pairs_ge80/warnings` 只统计册内配对；
`cross_catalog_*` 统计该册与其他册之间的配对，每个全局跨册对会在所涉及的两册各记
一次。全局 `similar_pairs_ge80` 包含精确对，`warnings` 仅指非完全相同的高重合对。
`--json` 与任一多样性开关合用时，顶层为 `audits` 与 `diversity`；不加多样性开关时
仍保持原有审计数组形状。

### 显式普通路线与绝招的全仓配对

`tools/agents/check_route_unique_for.py` 补充普通路线检查，沿用上述有序签名、较短
路线集合分母与 `8000 bp` 阈值，并排除同一 `skill_id` 内的配对。检查范围包括
绝招对普通、普通对普通，以及原有的绝招对绝招；普通路线不要求 `projection:true`。
仅采集图鉴中明确展开的穴位序列，包括技能局部覆写和专属派生配置；按各册 §17.5
只绑定共享模板、未显式展开的路线不纳入，也不把模板展开后复制到每门武学。这沿用
协调者 2026-09-29 裁定（NR4-xiakebixue r4），不新增普通路线互异设计规则。

```shell
python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-shaolin.md
python3 tools/agents/check_route_unique_for.py --all
python3 tools/agents/check_route_unique_for.py --all --json
python3 tools/agents/check_route_unique_for.py --all --strict-normal
```

指定图鉴时仍与全仓比较，只输出至少一端属于指定文件的配对；`--all` 输出全仓清单。
输出包含双方路线种类、武学 / 路线 ID、文件行号、重合基点及是否完全相同。
涉及普通路线的完全重复默认只报告，只有 `--strict-normal` 才导致退出 1；
非完全相同的 `>=80%` 配对始终只报告。绝招对绝招的完全重复保留原有失败语义。
此补充检查独立于 `check_skill_catalogs.py --diversity`，后者仍只统计绝招，因而
`--strict`、`--strict --details`、`--strict --diversity-strict` 三种既有模式及额外的
`--strict --diversity` 组合均保持原输出与退出码。

### 出招方式末端检查

`--delivery` 对最终绝招路线执行 `design/21` §4.3.1 与 §4.4.1.4 的末端规则审计，
并以独立字段审计非绝招的显式外放路线与路线性质冲突；其中紧凑卡标题识别允许
武学名紧接 Markdown `**`，避免“鹰扬掌**（…”一类掌法漏分类：

- 掌招始终可收劳宫；明确“手刀 / 掌刃 / 掌缘 / 掌侧 / 劈掌”还可收后溪，明确
  “劈 / 切 / 抓 / 虎口”可收合谷，明确“格挡 / 靠打 / 反背摔掌”可收外关。多类动作
  同时命中时合法端点取并集，不设互斥优先级；无法可靠分类的掌招仍须劳宫。指招须
  包含六个指端之一，六脉具名招还须
  命中招名对应指端；
- 腿招须包含足阳明、足太阳或足少阳的任一穴；推荐端点为厉兑、至阴或足窍阴。
  兵器招须包含腕骨、阳谷、阳池、外关或合谷；
- 拳、擒拿须含曲池、手三里、合谷之一；轻功 / 位移须含 15 登记的足少阳、带脉、
  阳跷穴之一或涌泉；`purpose:attack` 的内功绝招，以及可可靠识别的护体 / 疗伤招，
  须包含任脉或督脉穴，且丹田只接受气海 / 关元；
- `projection:true` 的外放招通常须另含 13 个手部端点之一，因此同一路线可能同时检查
  动作末端与外放端点两条规则。人声发劲的音功另可用天突
  `ap_yinwei_tiantu` 或廉泉 `ap_yinwei_lianquan`；琴、箫、笛等持乐器音功仍只能用
  13 个手／腕端点。
- 后溪只满足掌刃动作末端，目前不自动加入外放 13 端点白名单；外放掌刃须另经腕骨、
  外关等既有白名单穴。
- 动作词只从武学 / 招式表头明确标识的名称、招式、描述、说明、动作、效果或文本列读取；
  不读获取 / 获取方式、来源 / 出处、`reqs`、`prereq`、前置 / 学习条件、
  `sourceChapters` 或审计投影。无规范表头的旧卡只保守读取所属武学 / 招式单元格。
  合谷的“切”排除“一切 / 切磋 / 亲切 / 切换 / 迫切 /
  切勿 / 切记 / 密切 / 确切 / 急切 / 恳切 / 切实”；“劈空”只作掌名或掌风语义，
  不单独证明劈砍动作。
- 非绝招外放同时支持“武学 / 招式 / 路线 / steps”覆写行及“路线 / 招式 +
  `MeridianRouteDef{ultimate:false}` / steps”行；只有对应 `MoveDef.projection:true` 才纳入。
  步骤采集优先使用 `steps` / 序列 / 步骤列；无表头时要求具体逐段值或箭头链。
  合法端点提示不再次拼入 signature，仅绑定模板旁的提示穴位也不算显式路线。
  真正写在步骤链中的重复穴位保留，不用全局去重掩盖路线数据问题。

人声判定优先读取 `MoveDef.voice`：显式 true 放行喉部端点，显式 false 即使命中旧清单
也不放行；未写字段才保守回退到明确的人声武学 `sk_shizihou`、
`sk_jingangnuhou`、`sk_chuanyunxiao`、
`sk_chuanyinsouhun`、`sk_damingzhou`；其余技能即使属于音功，也不会仅凭名称获得喉部
端点例外。白名单只作旧内容兼容。

动作类型优先读取明确的 `category` / `subType`、武学名与招式动作描述；
`subType:grapple` 可判为擒拿，`subType:fist` 本身仍不能证明是拳，须由武学名或动作
明确“拳”。旧“拳掌”大类本身不等于掌招，无法可靠判断的路线计入 `unclassified`。
持索动作及暗器中的实体飞刀、飞针等按持械导引穴检查；只有暗器大类或毒烟、毒虫
描述不足以判为持械。正式卡的简述可提供“持长索”等明确动作依据。
原类型仍无法分类时，可从仅含本路线 ID 的明确“动作”列读取“成拳”等动作；不读取
换穴、前置或其他路线说明，也不按武学 ID 硬编码拳法。已可靠分类的类型保持原判定。
掌、指、腿、兵器所需穴位原则上应在最后三段；路线包含所需穴位但位置更靠前时，
另报 `rule=<原规则>-tail`。完全不含仍只报原规则，两类诊断不重复计数。内功攻击的
任 / 督穴与外放 13 端点只要求“至少经过”，不做位置检查。
默认全仓扫描含全部 `skills-bulu-*.md`；五绝册另把 `design/21` §12.1 所定义的降龙
三条路线计入，并按作者决定作为掌招、外放招分别核对。局部扫描不含正式五绝册时
不会注入这项跨文档例外。

`--delivery` 始终只报告：违规不会改变退出码，也不会被原有 `--strict` 执行；`--details`
展开每条 `DELIVERY` 诊断。按册字段依次为 `delivery_routes`、`classified`、
`checked_rules`、`violations`、`tail_violations`、`unclassified`；合计与 JSON 也显式
包含 `tail_violations`，并增加 `palm_routes` / `palm_endpoint_matches` 统计最终绝招掌法路线与
合规动作出口命中。`nonultimate_projection_*` 与 `nature_conflicts` 独立计数；JSON 的原
`routes` 仍只列绝招，普通外放明细另列在 `nonultimate_projection_route_details`，但
`nature_conflicts` 覆盖绝招与普通外放两类路线。性质按 15 §3 的**游戏归属经脉**及 §2.1
游戏性质对
**体段节点**计票：动作规则命中的最后 1–3 段出口不投票（劳宫命中时，同在尾三段的
内关可作为阴门引导一并排除），其余节点逐个投票；yin / yang 多数决，harmony 不计票，
平票（含 0:0）取 harmony。穴位表的“标准归经”不参与计算：交会 / 借穴按 15 的唯一
游戏归属处理，例如气冲按冲脉而不是足阳明计票。不是固定删除尾三段；显式
`allowOpposedNature:true` 豁免冲突。
轻功 / `purpose:movement` 的尾三段按 15 的游戏归属匹配足少阳、带脉、阳跷，
或涌泉；内功 / 护体 / 疗伤 / 蓄气按任督匹配尾段。人声按上述 `voice` 优先规则
排除尾段的天突 / 廉泉。三类均只剥离命中的尾节点，非出口尾节点以及相同穴位在
更前体段的出现照常投票；不得按穴位 ID 前缀猜位移 / 任督归属。
同一 `--delivery` 报告还按正式卡 ID 去重审计全部内功：`inner_nature=A/B` 表示 B 张内功
中 A 张显式填写 `inner.meridians`（显式 `[]` 也计入，并推导为 harmony），另列
`inner_missing_meridians`（仅统计真正缺字段）与声明性质不等于主修
经脉票的 `inner_nature_conflicts`；`--details` 逐条输出 `INNER_NATURE`。该审计和路线性质
冲突默认都只报告，不改变 `--strict` 的退出码；独立门禁见下节。黄阶一行卡也纳入，包括“内功（3 黄上·yin）”
与英文括号形式；前置武学 ID 不取得本卡字段的归属。2026-09-30 本次实测覆盖
`inner_nature=265/265`（倚天 `18/18`、通行 `14/14`），缺字段及内功性质冲突均为 0。
原 2026-09-29 迁移前基线 `147/254`、缺字段 107、性质冲突 56 保留作历史追溯；
数字随图鉴补录而变化，文档迁移规则见 `design/05` §5.3.1。
`--json --delivery` 顶层为 `audits` 与 `delivery`；并用多样性开关时再列 `diversity`。

### 已清零规则的独立门禁（NAuF-lint）

```shell
python3 tools/lint/check_skill_catalogs.py --delivery --details
python3 tools/lint/check_skill_catalogs.py --delivery-strict --inner-nature-strict
python3 tools/lint/check_skill_catalogs.py --delivery-strict --inner-nature-strict --json
```

两个严格开关均隐含 `--delivery`，可独立使用；它们不会启用或改写旧 `--strict`。
JSON 在报告之外增加 `gates` 对象，各门禁值为固定规则名到命中数的映射；
人读输出增加 `<name>_gate: errors=...`。任一所选门禁命中则退出 1。

| 开关 | 固定失败范围 | 当前常态 CI 条件 |
|---|---|---|
| `--delivery-strict` | 掌、指（含具名指端）、拳 / 擒拿、腿、内功攻防 / 丹田、位移、外放；掌 / 指 / 拳 / 腿 / 兵器的末三段位置 | 这些规则全量清零且误报已复核，可纳入 |
| `--inner-nature-strict` | 缺 `inner.meridians`、声明性质与主修经脉不符 | 当前 265/265 覆盖、两项均 0，可纳入 |

端点门禁用代码常量 `DELIVERY_STRICT_RULES` 固定规则集合，不根据本次输入或局部
扫描是否清零自动增删。兵器完全缺导引穴（`weapon`）仍有 1 项，路线性质冲突
（`nature-conflict`）仍有 3 项；两者继续完整输出、暂不升严。未来清零且经内容复核后
再显式扩大门禁并补回归。兵器端点已存在但不在末三段（`weapon-tail`）已清零，
独立纳入当前门禁；不能把这两类合并隐藏债务。未分类路线仍只统计，不猜类型。

本次 25 册实测：654 条绝招、32 条显式普通外放路线；末端缺失 1、位置 0、
普通外放违规 0、路线性质冲突 3、内功缺字段 / 性质冲突 0/0。剩余条目为道家
`mfr_bingpoyinzhen_shehun` 缺持械导引穴；倚天 `mfr_xuanmingxinfa_ningshuang`、
天龙补录 `mfr_xianglongxinggong_tianxing`、笑傲补录 `mfr_huashanziqijue_yingfeng`
体段性质冲突。图鉴修订后以重跑值为准，完整按册快照见
`tools/agents/reports/NAuF-lint.md` §7。

### 实际路线值与穴位门禁

```shell
python3 tools/lint/check_skill_catalogs.py --routes --details
python3 tools/lint/check_skill_catalogs.py --routes-strict
python3 tools/lint/check_skill_catalogs.py --acupoints-strict
```

旧路线索引行通常没有 `ap/CT/risk`，不能代表实际路线检查覆盖率。
`route_checks.py` 现从最终实例的 steps 列读取逐段值，支持穴位 / CT / 风险三元组，
以及逐段穴位 / 风险配独立 `N×CT` 计时列；五绝外部三路线读 21 YAML，收招读 05。
只把实际步骤纳入检查，不把出口提示混入；穴位注册表仅取 15 §3 正式游戏归属表。
缺步骤、损坏值与无法解析的目标明确报告，不能按空数组成功跳过。

| 开关 | 范围与失败条件 | 当前常态 CI 条件 |
|---|---|---|
| `--routes` | 天 / 地实际段数 1–18、不重复、CT / 风险等长、CT 40–120、风险 0–1200、收招 700–1500（05 §4.1）、`recovery+ΣCT≤2000`；三档未登记 / 无法解析；只报告 | 始终可用于观察覆盖与新命中 |
| `--routes-strict` | 同上全部问题导致退出 1；隐含 `--routes` | 当前七类全部清零，可纳入 |
| `--acupoints-strict` | 天 / 地 / 玄上未登记穴位或无法解析导致退出 1；隐含 `--routes` | 已清零，可独立纳入；已开 `--routes-strict` 时可省略 |

玄上只升严未登记穴位及解析完整性，不在本轮扩大 CT / 风险规则范围。
各册输出 `天=已解析/目标`、`地=...`、`玄上=...` 及七类命中；JSON 增加
`route_values`（实际路线、逐条命中、按册覆盖与合计 `counts`），严格参数再增加 `gates`。
输入缺失 / 读取失败退出 2。2026-09-30 实测覆盖天 132、地 329、玄上 193，
共 `132+329+193=654/654`；三档未登记均 0，天 / 地其余问题也均 0。

原 `--strict` 的索引行错误与 `unregistered_acupoint_warnings` 仅为兼容旧调用保留；
不因新增规则改变退出语义或三种既有 strict 输出。常态 CI 应显式增加实际路线门禁，
不能再把旧索引行检查的 0 命中当作完整数值验收。

人读模式的 `配额违规` / `重复步骤定义` 与 JSON 字段
`ultimate_quota_violations` / `duplicate_step_definitions` 分别统计逐门配额错误和第二次
及以后的步骤定义；JSON 的 `warnings` 保存非失败提示。错误在 `--strict` 下令进程退出
`1`。当前跨武学绝招精确重复与 ≥80% 配对均为 0，`--diversity-strict` 可纳入常态
CI；≥80% 非精确配对仍只报告并按 21 §4.3.4 第 4 条人工核理由。显式普通路线的
4 对重复 / 182 对非精确高相似仍按 LINT-outlets 快照交内容任务，不能用绝招清零
代替普通路线结论；`--strict-normal` 待该范围债务清零后纳入阻断。专项与全部测试：

```shell
python3 -m unittest -v tools.lint.test_check_skill_catalogs
python3 -m unittest discover -s tools/lint -p "test_*.py"
```

建议常态调用（CI 配置本身由收口任务修改）：

```shell
python3 tools/lint/check_ids.py --strict
python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict --routes-strict --delivery-strict --inner-nature-strict
```

该组合保留全部报告，包括尚未升严的兵器缺导引穴与路线性质冲突。四个 balance
`--check` 与 Boss 报告比较约定见 `tools/balance/README.md`；静态规划验收不替代
生产构建或真机 / 固定 RNG 战斗回放。

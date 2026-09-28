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

`check_skill_catalogs.py` 审计 11 册 `docs/design/catalog/skills-*.md` 的绝招、
经脉路线与调息档案。默认扫描全部图鉴，也可在命令末尾传入一册或多册；多册参数会
作为同一次审计共同检查。

```shell
python3 tools/lint/check_skill_catalogs.py
python3 tools/lint/check_skill_catalogs.py --details
python3 tools/lint/check_skill_catalogs.py --json
python3 tools/lint/check_skill_catalogs.py --strict
```

除 V-M01 三方一致、各品配额、7 / 9 / 10 重解锁层、显式路线、同门路线相似度、
`outOfBattleScaleBp` 与旧 Buff 外，检查器还要求每个 `mfr_*` 的具体步骤序列在本次
扫描的全部图鉴中只定义一次。它识别文首“绝招显式路线索引”、NU1–NU3 的“同门
第二／第三绝招显式路线”表，以及 NU2S 的 §0.12.1 最终绝招路线表；判据是同一表行
含恰好一个 `mfr_*` 和至少一个具体 `ap_*` 步骤。第二次及以后定义无论序列相同还是
不同均报错，诊断同时给出首次定义与重复定义的文件和行号。只列路线 ID，或步骤列写
“见文首索引”等且不再列 `ap_*` 的行按引用处理。

人读模式的 `重复步骤定义` 与 JSON 字段 `duplicate_step_definitions` 统计第二次及以后
的定义；这些错误和其他审计错误一样，在 `--strict` 下令进程退出 `1`。专项与全部
lint 测试分别可运行：

```shell
python3 -m unittest -v tools.lint.test_check_skill_catalogs
python3 -m unittest discover -s tools/lint -p "test_*.py"
```

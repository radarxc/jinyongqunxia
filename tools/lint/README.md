# ID 一致性检查器

`check_ids.py` 对规划文档中的内容 ID 做保守的跨文档静态检查。它只使用 Python
标准库，兼容 Python 3.9 及以上版本，可在 Windows、macOS 和 Linux 运行。设计原则
是宁可漏掉弱信号，也不把示例、候选项或迁移说明误报成正式内容。

## 用法

在仓库根目录运行：

```shell
python tools/lint/check_ids.py
python tools/lint/check_ids.py --json
python tools/lint/check_ids.py --strict
python tools/lint/check_ids.py docs/design/06-buff-system.md docs/design/catalog
```

不传路径时递归扫描 `docs/` 下所有 `.md`。路径参数可以是 Markdown 文件或目录；
不存在的路径和非 Markdown 文件会产生警告。无论扫描范围如何，脚本都会额外读取
`docs/00-canon.md` 和 `docs/decisions/rulings-v1.md` 作为前缀、锚点与重命名规则
来源，但不会把范围外支持文件的问题计入结果。完整跨文档审计应采用默认扫描。

默认输出供人阅读的报告，发现问题时仍退出 `0`。`--json` 输出稳定 JSON，警告只写
标准错误，不污染 JSON。`--strict` 仅在存在“引用但未定义”或“仍使用旧 ID”时退出
`1`；第 2、3、5 类是人工审校线索，不触发严格模式失败。参数可组合。

运行单元测试：

```shell
python -m unittest -v tools.lint.test_check_ids
```

## 检查的五类问题

1. **引用但未定义**：活动正文中的 ID 没有在允许的归属文档中形成定义。
2. **冲突的重复定义**：同一 ID 在多个文件定义且可提取的名称不一致。当前至少
   比较名称；同名索引/摘要不报错。武学名称以 `docs/design/catalog/*.md` 的
   `SkillDef` 为准，`design/05` 的机制标题不会覆盖图鉴名。
3. **疑似近似拼写**：同前缀 ID 的后缀编辑距离为 1 或 2，且恰有一方已定义。
   连号、父子式前缀、高密度子 ID 空间和已确认的语义兄弟会降噪。
4. **旧 ID 仍在使用**：从 `rulings-v1.md` §2 重命名表动态解析旧值、模式和替代值；
   裁定表、迁移说明及历史变更区不计。
5. **套装成员不对称**：当 `docs/design/07-set-system.md` 存在时，双向比较
   `SetDef.members` 与武学/装备/物品定义的 `setTags`。缺少 07 时明确显示跳过。

JSON 顶层包含 `schema_version`、`root`、`prefix_source`、`prefixes`、`scan`、
`issues`、`counts`、`set_check`、`strict_failure_count` 和 `warnings`。问题位置均为
仓库相对文件名，以及从 1 开始的行、列号。

## ID 提取与定义规则

### 前缀

正常运行时，前缀来自 `docs/00-canon.md` §12 命名表“格式”列中的反引号文本；
`chNN_*` 归一为 `ch`，其余取首段至下划线，例如 `sk_<拼音>` 得到 `sk_`。
若文件不可读、§12 不存在，或核心前缀不完整，则使用脚本中的 `DEFAULT_PREFIXES`，
并向标准错误输出警告。内置表只是部分检出和损坏仓库的兜底，不是正常事实来源。

### 出现位置

普通 Markdown 正文只提取反引号内的 ID；围栏代码块还识别以下形式：

```yaml
id: sk_demo
requires:
  - sk_parent
```

JSON 字符串、带键的值和列表项也会提取。`sk_<拼音>`、`chNN_<pinyin>` 等模板、
文件路径内部的片段，以及明显的 schema/资源变体会被排除。建议新文档始终给内容
ID 加反引号；这样既便于阅读，也能被检查器稳定识别。

### 定义与归属

一个出现只有同时满足“定义形态”和“归属文档”才算定义。支持的定义形态为：

- Markdown 表格的明确 `ID`/`对象 ID` 列，或已知对象名首列；
- 围栏 YAML 的 `id:` 字段；
- 带名称的条目标题，例如五级标题“幻阴指 `sk_huanyinzhi`”；
- 明确的“本文新增术语与 ID”/“ID 清单”登记；
- 少量仓库既有的强语义形式，例如 Buff 的 `family:`、`exclusive:` 和连续性旗标。

候选、建议、示例、占位、迁移、重命名、开放问题、参考资料等上下文不建立正式
定义。Buff 族表允许一个“族 ID”单元格登记两个具体族；`fam_*` 参数化族、书眠
存档键、时辰物品、秘籍/残页和配方学识按权威命名规则识别派生实例，而不要求穷举。

归属配置位于 `check_ids.py` 顶部的 `OWNERSHIP`。当前按基准 §18 与实际布局分组：

| ID 族 | 允许定义的文档 |
|---|---|
| `ch` | `docs/00-canon.md` §2 |
| `sk_` / `mv_` / `ps_` | `docs/design/catalog/*.md`、`design/05`；`sk_` 另含 Canon §13 |
| `aoe_` / `vow_` | `design/05` |
| `bf_` / `fam_` / `exg_` / `rx_` | `design/06` |
| `set_` | `design/07` |
| `tr_` / `tst_` / `gate_` | `design/08` |
| `enc_` / `bsc_` / `cmb_` / `tg_` / `wk_` / `gauge_` / `pers_` / `ea_` / `ai_` | `design/09`；`enc_` 也可由章节定义 |
| `eq_` / `it_` / `af_` / `ue_` / `ins_` / `rc_` / `ev_` | `design/10`；`eq_` 另含 Canon §14，`ev_` 也可由章节定义 |
| `npc_` | NPC 图鉴、章节、`design/11`、`design/12`、`design/18` |
| `q_` | 故事/章节、`design/11`、`design/12` |
| `rg_` | 章节、`design/11`、`design/12`、`design/19` |
| `sect_` | `design/12` 与 `design/17` 的权威矩阵 |
| `tsp_` / `end_` / `ach_` / `ttl_` / `diff_` / `rule_` / `tj_` / `sh_` / `sqj_` / `fin_` / `yy_` | `design/13` |
| `save_` / `rs_` / `lg_` / `echo_` / `bs_` | `design/02`；`save_`、`echo_` 也可由 `design/13` 定义 |
| `tal_` / `tmpl_` / `arch_` | `design/03` |

`set_`、`npc_`、`q_` 的全部归属文件都尚不存在时，第 1 类会暂停该 ID 族，避免增量
编写阶段把所有前向引用当错误；归属文件一旦出现便恢复检查。

## 已知局限

- 这是有意保守的 Markdown 词法检查器，不是完整 Markdown/YAML 解析器。普通正文中
  没有反引号的 ID、非常规表格以及动态拼接出的 ID 可能漏检。
- 重复定义目前只比较可稳定抽取的名称，不比较品阶、效果、数值等所有字段。名称
  缺失或仅在同一文件重复时不会形成第 2 类问题。
- 编辑距离只提供候选，拼音接近不等于错误；两边都已有正式定义时默认视为合法兄弟。
- 近似 ID 的位置优先采用活动正文中的首次出现；仅在定义中出现的 ID 回退到定义
  位置。若调用方提供了既无出现位置也无定义位置的合成候选，则显示 `?:0:0`。
- 对“建议/示例/迁移”语义的判断依赖标题和行内关键词。新写法若未沿用现有标注，
  可能需要增加窄范围规则。
- 套装检查只识别表格 `ID + 成员` 或围栏 YAML `id + members`，以及定义行/卡片附近
  的 `setTags`；跨很远拆写的字段可能无法关联。
- 第 1 类会同时报告仍在活动正文出现的旧 ID；同一项也会出现在第 4 类。这可保证
  `--strict` 在缺少旧定义时仍保持完整计数。

## 扩展配置

增加新 ID 前缀或归属文档时：

1. 先在 Canon §12 命名表登记格式；脚本会自动把前缀加入提取正则。
2. 在 `check_ids.py` 的 `OWNERSHIP` 为该前缀增加仓库相对路径或 `fnmatch` 模式。
3. 若该族允许参数化实例，在 `DERIVED_ID_PATTERNS` 增加严格的完整匹配，并在
   `covered_by_parameterized_definition()` 指定权威前提。
4. 若定义不使用通用表格、标题或 YAML `id:`，在 `semantic_definition()` 增加只针对
   该前缀和归属文件的窄规则。
5. 若是大量天然相近的子 ID，可在 `near_match_issues()` 的高密度族列表中排除；单个
   已确认语义兄弟放入 `KNOWN_NEAR_MATCH_PAIRS`。不要用整篇文档忽略来压误报。
6. 为新增形态在 `test_check_ids.py` 添加最小临时仓库用例，并运行上述单测和一次
   全仓 `--json` 扫描。

若 Canon 暂时缺失，新前缀还应同步加入 `DEFAULT_PREFIXES`，保证 fallback 模式可用。

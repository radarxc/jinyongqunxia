# NL 报告 · ID 检查脚本：武学图鉴可定义具体武学的 mfr_ / txp_ 实例

## 1. 摘要（3–6 行）

已将经脉 ID 所有权细化为两层：`design/21` 负责模式、共享模板与示例，武学图鉴负责具体武学的 `mfr_*` / `txp_*` 实例。
检查器现可识别四种已落地实例表头，并对 NC1 的 `内功 → 调息档案` 复合列作最窄匹配；`qnl_*` / `dxl_*` 所有权保持不变。
新增跨层所有权冲突检查，同一 `mfr_*` / `txp_*` 不得同时由 `design/21` 与图鉴定义；未显式登记的派生路线仍不会自动放行。
全量 56 项单测通过；未刷新 baseline。全仓未定义引用由 404 降至 2，严格失败由 403 降至 1，唯一新增真问题是 `mfr_xiantiangong_gangqi`。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要改动 |
|---|---:|---|
| `tools/lint/check_ids.py` | 2,546 | `OWNERSHIP` 两层归属；图鉴实例表头识别；NC1 复合列约束；21/图鉴跨层重复定义检查 |
| `tools/lint/test_check_ids.py` | 1,601 | 图鉴归属、四种表头、NC1 复合列及其负例、隐式派生不放行、跨层重复定义回归测试 |
| `tools/lint/README.md` | 196 | 同步归属边界、表头约定、复合列限制、显式登记与重复定义规则 |
| `tools/agents/reports/NL.md` | 138 | 本报告：结果、计数、遗留问题与自检 |

未修改 `tools/lint/check_ids_baseline.json`，也未修改任何 `docs/**`、`TODO.md` 或其他越界文件。

## 3. 关键结论与数值

1. `mfr_*` / `txp_*` 的合法定义来源现为 `docs/design/21-meridian-flow-and-moves.md` 与 `docs/design/catalog/skills-*.md`；`qnl_*` / `dxl_*` 仍仅允许前者。
2. 四组图鉴逐册核对结果：
   - NC1（少林、道家、通用）实际采用逐招派生说明和 `内功 → 调息档案`；复合单元格是 `sk_* → txp_*`。
   - NC3（倚天、侠客碧血、五岳）实际采用 `路线 id`、`movementRouteRef`、`breathProfileRef`。
   - NC4（康熙、乾隆、古龙）实际采用 `BreathProfile.id`；路线实例另以现有绑定表登记。
   - NC2（五绝、逍遥）当前尚无 `mfr_*` / `txp_*` 经脉实例表，故没有额外猜测表头。
3. NC1 复合列只在 `skills-*.md` 中、只对 `txp_*` 生效，且单元格必须恰好含一个 `sk_*` 和一个目标 `txp_*`；不会把任意多 ID 单元格误当定义。
4. 修改前后全仓扫描均以同一文档快照和既有 baseline 执行：

| 指标 | 修改前 | 修改后 | 变化 |
|---|---:|---:|---:|
| 未定义引用 | 404 | 2 | −402 |
| 严格失败数 | 403 | 1 | −402 |
| 冲突定义 | 0 | 0 | 0 |
| 废弃 ID / 近似拼写 / Set 标签非对称 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |

按前缀计数：

| 前缀 | 修改前未定义 | 修改后未定义 |
|---|---:|---:|
| `mfr_` | 256 | 1 |
| `txp_` | 147 | 0 |
| `sk_` | 1 | 1 |

按文件计数：

| 文件 | 修改前 | 修改后 | 说明 |
|---|---:|---:|---|
| `docs/design/catalog/skills-daojia.md` | 24（`mfr_` 1、`txp_` 23） | 1（`mfr_`） | 剩余 `mfr_xiantiangong_gangqi` |
| `docs/design/catalog/skills-general.md` | 14（`txp_`） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-gulong.md` | 9（`txp_`） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-kangxi.md` | 16（`txp_`） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-qianlong.md` | 11（`txp_`） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-shaolin.md` | 12（`txp_`） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-wuyue.md` | 105（`mfr_` 84、`txp_` 21） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-xiake-bixue.md` | 108（`mfr_` 85、`txp_` 23） | 0 | 已识别实例定义 |
| `docs/design/catalog/skills-yitian.md` | 104（`mfr_` 86、`txp_` 18） | 0 | 已识别实例定义 |
| `docs/README.md` | 1（`sk_`） | 1（`sk_`） | 既有 baseline：`sk_babuganchan` |

修改后扫描 96 个文件，提取 49,857 次 ID 出现与 11,543 个定义。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| NL-O01 | `mfr_xiantiangong_gangqi` 只有派生示例引用，没有显式实例定义 | 保持 strict 真问题，不在检查器中按命名规则自动生成，也不加入 baseline |
| NL-O02 | NC2 后续可能采用新的实例表头 | 先沿用已识别的四种正式表头；出现新写法时以真实文档和对应回归测试扩展，不预先猜测 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。基准 v1.3 已登记四个前缀及 `design/21` 的模式归属；本任务只修正工具对具体武学实例归属的表达，不改设计事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/catalog/skills-daojia.md` | 约第 2,035 行，先天功罡气示例 | 显式登记 `mfr_xiantiangong_gangqi` 的具体路线实例；不能只写由 `mv_xiantiangong_gangqi` 按命名约定派生 |
| `docs/design/catalog/skills-wujue.md`、`skills-xiaoyao.md` | NC2 经脉实例落地时 | 具体路线 / 调息档案须显式列出，并优先复用 README 已登记表头；避免只写派生规则 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 规则实现与理由

- ✅ **归属表两层化**：仅为 `mfr_*` / `txp_*` 增加 `catalog/skills-*.md`；`qnl_*` / `dxl_*` 保持只归 `design/21`。理由是图鉴拥有具体内容实例，但不接管经脉模型和共享模板。
- ✅ **表头按实物识别**：覆盖 `路线 id`、`movementRouteRef`、`breathProfileRef`、`BreathProfile.id`；已逐册核对 NC1、NC3、NC4，NC2 尚未出现经脉实例表。
- ✅ **NC1 复合列最窄处理**：`内功 → 调息档案` 仅接受单个 `sk_* → txp_*` 映射，防止一般多 ID 表格被放宽。
- ✅ **不放行隐式派生**：没有加入 `mfr_<mv 后缀>` 自动定义逻辑；单测确认只写派生约定仍报告未定义，实仓继续报告 `mfr_xiantiangong_gangqi`。
- ✅ **跨层重复定义**：同一 `mfr_*` / `txp_*` 同时出现在 21 与图鉴时固定报告 `owner` 冲突，即使名称相同或一侧无名称；单测覆盖两种情形。
- ✅ **归属负例**：单测确认图鉴中的 `qnl_*` / `dxl_*` 仍是未定义，未放宽其他家族。
- ✅ **baseline 与范围**：未刷新 baseline，未改 docs/TODO，未执行改变仓库状态的 git 命令。

### 7.2 测试清单

| 检查 | 结果 |
|---|---|
| `python3 -m unittest tools/lint/test_check_ids.py` | ✅ 56 项通过 |
| `python3 -m py_compile tools/lint/check_ids.py tools/lint/test_check_ids.py` | ✅ 通过 |
| `python3 tools/lint/check_ids.py --json` | ✅ 正常输出；无 warning；除未定义外各问题类别均为 0 |
| `python3 tools/lint/check_ids.py --strict` | ⚠️ 预期退出 1；唯一新增严格失败见 §7.4 |
| `git diff --check` | ✅ 通过 |
| baseline 内容与 git diff | ✅ `check_ids_baseline.json` 未变化 |

### 7.3 修改前 / 后计数

按前缀：

| 前缀 | 修改前 | 修改后 |
|---|---:|---:|
| `mfr_` | 256 | 1 |
| `txp_` | 147 | 0 |
| `sk_` | 1 | 1 |
| **合计** | **404** | **2** |

按文件：

| 文件 | 修改前 | 修改后 |
|---|---:|---:|
| `skills-daojia.md` | 24 | 1 |
| `skills-general.md` | 14 | 0 |
| `skills-gulong.md` | 9 | 0 |
| `skills-kangxi.md` | 16 | 0 |
| `skills-qianlong.md` | 11 | 0 |
| `skills-shaolin.md` | 12 | 0 |
| `skills-wuyue.md` | 105 | 0 |
| `skills-xiake-bixue.md` | 108 | 0 |
| `skills-yitian.md` | 104 | 0 |
| `docs/README.md` | 1 | 1 |

严格失败数为 `403 → 1`；冲突定义、废弃 ID、近似拼写与 Set 标签非对称修改前后均为 0。

### 7.4 仍报出的问题

| 性质 | 位置 | ID | 处理 |
|---|---|---|---|
| 新真问题 | `docs/design/catalog/skills-daojia.md:2035` | `mfr_xiantiangong_gangqi` | 仅有命名派生示例，未显式定义；保持 strict 失败，交后续图鉴审计补实例 |
| 既有 baseline | `docs/README.md:185` | `sk_babuganchan` | 已在 baseline 中，保持报告但不计 strict failure |

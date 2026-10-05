# ENG-ink-external-args 报告 · 游戏工程 · 小修：Ink 文本抽取不得改写 EXTERNAL 调用的字符串实参（get_flag / has_item / quest_stage / affinity 保持原始 ID），补回归测试
## 1. 摘要（3–6 行）
- 已修复 `extractStoryText()`：只抽取正文与选项可见文本，求值上下文字符串保持原值。
- 四个 EXTERNAL、`not has_item`、赋值/比较常量均有回归断言；同值处于正文时仍按位置抽取。
- 未修改 `OPCODES`、`EXTERNALS`、现有测试期望或写集外文件；data 包与全仓门禁通过。
- 当前分支只有 ch10 Ink，ch00 尚未合入；ch00 三处调用的合入后验收步骤已交接。
## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `packages/data/src/build/ink.ts` | 223 | 精确识别选择文本的编译区间，保留其他 `str` 块 |
| `packages/data/src/build/build.test.ts` | 305 | external、求值字符串、正文/选项抽取回归 |
| `packages/data/src/build/__fixtures__/ink-external-args/*` | 30 + 7 | Ink / inkmeta 固定夹具 |
| `tools/agents/reports/ENG-ink-external-args.md` | ≤40 | 本报告 |
## 3. 关键结论与数值
- 判别规则：数组层级中 `stringDepth=0` 的非标签 `^文本`是正文；仅“最外层 `ev` 紧邻 choice `*` 对象”之首个外层 `str…/str` 的字面片段是选项文本；嵌套 `ev` 与其余 `str` 均属求值数据，原样保留。
- 覆盖：`get_flag("fl_fixture_shared")`、正/反 `has_item("it_fixture_tao")`、`quest_stage("q_fixture_main")`、`affinity("npc_fixture_friend")`，以及初始化/赋值/比较、8 条正文/选项文本。
- ch10 实测：1 个现有 Ink、17 条文本、0 个 external；文本表不变，`storyHash` 前后均为 `6b21267d52c3105586a46df4f23157bcb3334d07463ce4d1b957cd27ffe30dcf`。
- 受影响夹具实测：旧/新 `storyHash` 为 `03d9e2d1d5ae24709af4d91ff1250ab6dee78b3a6b3a8058f0798807d53b47a4` → `9e63a657c53479a907ac52f458e718afb387316226d776f3a9cf916c75a46ef3`；误抽取 16 条降为正确的 8 条。
## 4. 开放问题（附默认值）
- 无代码开放问题；ch00 未在当前分支，默认由 CONTENT-ch00a 合入后按 §7 重编译验收。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；这是编译器语义修复，不改变设计基准。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- CONTENT-ch00a 报告 §4/§6/§7：删除旧阻塞结论，登记三处原始参数的重编译实测。
- ENG-ink-intents：运行时 external 绑定直接接收原始 ID，不再解读 `ink.*.text.*` 为参数。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 实现：正文/选项仍本地化；external、比较、赋值字符串不改写；同一字面值按所在位置分别处理。
- ✅ 回归：首次聚焦测试按预期实锤 5 个错误参数；修复后聚焦 27/27、data 14 文件 182/182、全仓 146 文件 1029/1029。
- ✅ CONTENT-ch00a / 验收：合入后重跑 `pnpm content:build`，遍历 `story_ch00_main` 的 `x()` 节点及前置 `str,^值,/str`（反向调用再看后置 `!`），严格得到 `get_flag("fl_00_zhulin_loss_streak3")`、`has_item("it_tao")`、`not has_item("it_tao")`，且文本表不含这两个 ID。
- ✅ ENG-ink-intents：绑定层可直接使用上述原始 ID；无需反查文本表。
- ✅ `pnpm install --frozen-lockfile`、`pnpm content:build`、`pnpm content:validate`、`pnpm check`、data test、strict ID 均退出 0；ID 仅既有基线 `sk_babuganchan`，新增失败 0。
- ⚠️ 沙箱禁止 tsx CLI 创建 Unix socket（直接运行报 `listen EPERM`）；三条含 tsx 的 pnpm 门禁以进程内 `tsx() { node --import tsx "$@"; }` 等价入口复验通过，未改脚本、参数或仓库配置。

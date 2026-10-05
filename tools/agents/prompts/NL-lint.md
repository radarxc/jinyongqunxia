# 本任务：修正 ID 检查脚本对武学图鉴中经脉实例 ID 的识别（只改 `tools/lint/`）

基准 v1.3（A4）在 §12 登记了 `mfr_`（经脉路线）/ `qnl_` / `dxl_` / `txp_`（调息档案）四个前缀，并把定义只归 design/21。随后武学图鉴组（NC1、NC3、NC4，NC2 仍在运行）为具体武学登记了逐招路线 `mfr_*` 与内功调息档案 `txp_*`，主分支 `python3 tools/lint/check_ids.py --strict` 因此报约 400 个"未定义"（都是图鉴里的实例被脚本当成引用）。

## 要做的事

1. 按"design/21 定义模式、共享模板与示例；武学图鉴 `docs/design/catalog/skills-*.md` 定义具体武学的路线与调息档案实例"细化脚本的归属表：`mfr_` 与 `txp_` 的定义来源除 21 外加入武学图鉴（`qnl_` / `dxl_` 仍只归 21）。
2. 在表格定义识别中，把图鉴实际使用的这些表头认作 ID 列：`路线 id`、`movementRouteRef`、`breathProfileRef`、`BreathProfile.id`（逐一打开四组图鉴核对实际表头，按实际写法补全，不要猜）。
3. 两处缺一不可（已有监督代理在副本中验证：只改其一，未定义数不降；两处都改后降为 0 且无重复定义）。另检查：同一 ID 不能同时在 21 与图鉴中定义（重复定义应报错）；NC1 按 `mfr_<招式ID去掉mv_>` 隐式派生的写法若未显式列出，仍应报出（不要自动放行），交给后续审计统一。
4. 为以上规则补测试（`tools/lint/test_check_ids.py`），`python3 -m unittest tools/lint/test_check_ids.py` 通过；运行 `python3 tools/lint/check_ids.py --json` 给出修改前 / 后的计数；`--strict` 应只剩基线项与报告中明确列出的真问题。**不刷新基线**，不为降数字放宽其他规则。
5. 同步 `tools/lint/README.md` 的规则说明。

## 报告

第 7 节写：每条规则的实现与理由、测试清单、修改前 / 后计数（按前缀与文件）、仍报出的问题清单（如 NC1 的隐式派生路线、个别未定义 `mfr_*`），供后续审计处理。

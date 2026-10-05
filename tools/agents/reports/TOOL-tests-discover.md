# TOOL-tests-discover 报告 · 工具 · unittest discover 跑全 tools/ 的测试（新增 tools/test_suite.py 按目录发现），并修两条红测试：物品七列字节对比改用夹具、town_runtime 认 CITY 的 assets/default/town/<city>/layout.yaml

## 1. 摘要（3–6 行）
- 新增根级 `load_tests` 聚合入口，不给无包目录补 `__init__.py`，也不重复执行既有包测试。
- 七列物品渲染改用自包含夹具做字节断言；仓库派生文件一致性仍由 `items_from_catalog.py --check` 承担。
- CITY 布局优先解析新目录、兼容旧基线，并让 `status: rejected` 保持可解析但不进入运行时。

## 2. 产出（文件、行数、主要章节）
- `tools/test_suite.py`（63 行）：递归收集无包测试目录、补 `tools/` 导入路径、进程内聚合。
- `tools/content/test_items_from_catalog.py`（228 行）：七列固定夹具与预期 UTF-8 bytes。
- `tools/content/town_runtime.py`（348 行）：新旧布局解析、manifest 状态读取及 rejected 门禁。
- `tools/content/test_town_runtime.py`（160 行）：自包含新旧路径、rejected 排除及确定性回归。
- `tools/balance/test_meridian_flow_v3.py`（44 行）：独立目录执行时补 `tools/` 导入根。
- `tools/agents/reports/TOOL-tests-discover.md`（≤40 行）：本报告与验收记录。

## 3. 关键结论与数值
- 修前根 discover：33 条；修后：497 条（增加 464 条），165.125 秒，全过；497 个测试 ID 全唯一。
- 独立目录：content 15、item 11、rig 22、lint 289、town 107、vfx 50、balance 3，合计 497 条，全过。
- CITY 目录现有 16 份布局：14 candidate；洛阳、太原 2 份 rejected 可解析但不入运行时。
- 内容校验：981 files / 925 objects / 56 maps；内容构建：978 objects / 15 chapters。
- 沙箱禁止 `tsx` CLI 建 IPC socket；同脚本以 `NODE_OPTIONS=--import=tsx node ...` 无 IPC 入口验证通过。

## 4. 开放问题（附默认值）
- 无。默认继续保留 legacy fallback，待旧基线正式退役后再由独立任务删除。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务只修测试发现与工具路径兼容，不改变设计基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；聚合策略与仓库级检查职责已在代码注释和本报告说明。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 1：根命令 497/497；各目录独立命令全过；测试 ID 无重复，未新增 `__init__.py`。
- ✅ 2：七列字节测试仅依赖临时夹具，未删除或跳过测试。
- ✅ 3：新布局优先、旧布局回退、rejected 可解析但不入运行时，均有测试。
- ⚠️ 4：strict IDs 通过；两条 `pnpm` 原命令均被沙箱以 `listen EPERM` 阻断；无 IPC 等价入口通过上述 validate/build 数值。
- ✅ 范围：只改许可文件；未改 `content/**`、`assets/**`、`tasks.json`、`TODO.md`。

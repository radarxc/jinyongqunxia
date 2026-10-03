# 本任务：工具 · 让 `python3 -m unittest discover -s tools -p "test_*.py"` 真正跑全 tools/ 的测试，并修两条红测试（物品七列字节对比依赖仓库状态；town_runtime 找不到 CITY 的新布局位置）

本任务改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 现象（开发监督 10-03 06:58）

- 各 TOOL 任务的校验命令是 `python3 -m unittest discover -s tools -p "test_*.py"`，但 discover 只进入带 `__init__.py` 的子目录：现在只跑 `tools/item`、`tools/rig`、`tools/rig/clips` 共 33 条；`tools/content`、`tools/lint`、`tools/town`、`tools/vfx`、`tools/balance` 的测试一条都没跑（TOOL-catalog-9col、TOOL-catalog-food-qi-exception 自己写的测试在校验里从未执行）。
- 按目录单独跑（`-s tools/<dir> -t tools/<dir>`）：lint 289、town 107、vfx 50 全过；`tools/balance` 的测试用 `from balance.meridian_flow_sim import …`，要以 `tools/` 为 cwd 或顶层才能导入。
- `tools/content` 两条红：
  1. `test_items_from_catalog.test_seven_column_repository_render_is_byte_identical`：把仓库全部名录渲染结果与 `content/items` 逐字节比；名录转九列后 `content/items` 必然 stale，直到 TOOL-items-catalog 重新生成。这是集成检查（已在 TOOL-items-catalog 的 `--check` 里），不该是单测。
  2. `test_town_runtime` 报 `layout missing for docs/design/town/city_beijing__ch10.yaml`：`tools/content/town_runtime.py` 第 17、282 行按 `assets/default/baseline/town/town_<suffix>.layout.yaml` 找布局，而 CITY-layouts-all 把布局放在 `assets/default/town/<city>/layout.yaml`，18 份新城规格都找不到。

## 要做的事

1. **测试发现**：不改各任务的校验命令。新增 `tools/test_suite.py`（文件名匹配 `test_*.py`，位于 `tools/` 顶层）：对 `tools/` 下每个含 `test_*.py` 的子目录（递归），以该目录为 `-s` 与 `-t`（必要时把 `tools/` 加进 `sys.path` 以满足 `balance.*` 这类导入）在**进程内**发现并运行，汇总失败并让本模块的测试失败；同一测试不能被跑两次（已有 `__init__.py` 的 item / rig / rig/clips 由 discover 自己跑，`test_suite.py` 跳过它们，或反过来——二选一并写明），总数应 ≈ 33 + 289 + 107 + 50 + content + balance。保证 `python3 -m unittest discover -s tools -p "test_*.py"` 与 `python3 -m unittest discover -s tools/<dir> -t tools/<dir>` 都能独立通过。不要给没有 `__init__.py` 的目录加 `__init__.py`（会改变现有脚本的导入方式），除非你证明不影响任何 `tools/**/*.py` 的直接运行。
2. **物品七列字节对比**：把 `test_seven_column_repository_render_is_byte_identical` 改成不依赖仓库状态——只用测试内构造的七列夹具渲染并与期望字节比；仓库级的逐字节一致由 `items_from_catalog.py --check` 负责（已是 TOOL-items-catalog 的校验），在测试文件注释里写明。
3. **town_runtime 布局位置**：`town_runtime.py` 先找 `assets/default/town/<规格 basename 去掉 city_ 前缀或按既有命名>/layout.yaml`（CITY-layouts-all 的产物；看 `assets/default/town/city_*__ch10/` 的实际命名与 `docs/design/town/city_*__ch10.yaml` 的对应关系），找不到再回退到 `assets/default/baseline/town/town_<suffix>.layout.yaml`；manifest `status: rejected` 的城（洛阳、太原）照样能找到布局但不进运行时（按 `docs/tech/06` 的 status 规则，看 `town_runtime.py` 现有逻辑决定是跳过还是标记）；补对应测试（夹具里放一份最小 `layout.yaml`）。
4. 全部改完：`python3 -m unittest discover -s tools -p "test_*.py"` 全过并在报告写出总数；`python3 tools/lint/check_ids.py --strict` 通过；`pnpm content:validate` 与 `pnpm content:build`（若 town_runtime 参与内容构建）通过。

## 约束

- 只改：`tools/test_suite.py`（新）、`tools/content/test_items_from_catalog.py`、`tools/content/town_runtime.py`、`tools/content/test_town_runtime.py`、`tools/README.md`（若有测试说明），以及报告。不改 `tasks.json`、名录、`content/**`、`assets/**`。
- 不得删除或跳过现有测试来凑绿。

## 报告

`tools/agents/reports/TOOL-tests-discover.md`，≤ 40 行，按 `_common.md` 的格式；§3 写修前 / 修后 discover 跑到的测试数，§7 逐条对照第 1–4 条。

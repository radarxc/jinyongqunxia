VERDICT: PASS

## 逐项结论

- 写集与仓库状态：通过 —— 相对基点 `a6366e7b470237e8a69a892e86e92f9f0466d3a8`，仅修改四个获准 Python 文件并新增指定报告；未改模板、素材、依赖清单、`glb_io.py` 或 `common.py`，`git diff --check` 通过。
- `export_skeleton.py` section 颈环：通过 —— 使用 Neck→Head 轴、固定 `heightFraction=0.15`、三角面精确求交、闭环筛选、等弧长重采样和椭圆拟合；profile 来自真实截面并按三角重心插值蒙皮权重，写出 `mode`、`heightFraction`、`perimeterMm`，同时保留默认旧模式。
- section 校验与测试：通过 —— 覆盖椭圆管半径/周长、偏心多闭环选择、骨长比例缩放和真实素材 legacy 字节回归；section 纯算法测试本次只读复核 4/4，通过日志中的完整测试为 15/15。
- `derive_template.py` 防折叠：通过 —— 按源/派生三角几何法向点积检测翻向，在两环邻域内进行外部固定的约束平滑，并在 float32 写出精度下复查；`derive.json` 记录修复前后数量和最大修正量，`--check` 要求翻向为 0。
- 法线一致性：通过 —— 存储法线随几何法线作最小旋转，并消除派生新增的负点积面；没有放宽源模板既存倒置面的门禁。
- 防折叠测试：通过 —— 合成强缩放窄三角验证翻向修复及邻域外顶点不动，真实产物改为按 `templates/*/derive.json` 数据驱动发现；本次只读复核 3/3，执行环境完整测试 9/9。
- 真实演示：通过 —— 四个派生均为 `flippedFaces=0`、`newNegativeFaces=0`；其中 `tpl_f2_small` 从 73 个翻向修至 0，最大修正约 `4.6883 mm`。四派生相对源的最大颈环轴差为 `1.835 mm`，小于 `2 mm`，比例和位移原门禁均通过。
- 旧模式兼容：通过 —— `tpl_f_medium`、`tpl_f_small`、`tpl_f_tall` 默认模式重导出字节回归通过，243/243 已贴合素材 SHA 未变；五套现有模板的 `normalize_rig.py --check` 与 `export_skeleton.py --check` 共 10/10 通过。
- 禁区与单位：通过 —— 未使用固定 `Neck + 0.006`、`HeadTop_End`、包围盒对齐、`bone.scale` 配对或混用动画 GLB；未引入 Blender、pip/npm 依赖或硬编码用户绝对路径，新增 JSON 数值字段带单位后缀。
- 门禁：通过（受限项已如实登记） —— Python 测试在可写执行环境为 15/15、9/9、7/7；lint、typecheck 及 189 文件/1339 项测试通过。`content:validate` 在沙箱内因 `tsx listen EPERM` 无法完成，报告已按任务规则第 13 条如实移交校验阶段，未修改 `node_modules` 或绕过门禁；监督校验已通过。
- 报告：通过 —— 七节齐全且正好 60 行，包含高度比例依据、六模板新旧半径、四派生修复量与门禁数字，以及 T5 后续使用 `--ring-mode section`、`--ring-from` 的重派生命令。
- 图片与正式素材：通过 —— 本任务为 0 点工具前置修复，没有图片或正式模板产物需要视觉审核，也未触碰已批准素材。

## 需作者确认

无
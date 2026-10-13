# 审核要点 · ENG-dressup-*（3D 纸娃娃换装，AR-102 / AR-103）

审核时按 `docs/tech/11-paper-doll-3d-impl-spec.md`（契约）与 `docs/tech/10-paper-doll-3d.md` §6（核验结论）逐条对照，任一条不满足即 FAIL 并写明文件 / 行号 / 复现命令：

1. **只改声明的文件**：`git diff --stat` 里不得出现 writes 之外的文件；不得改 `glb_io.py` / `common.py` 既有签名（A1 之后的任务）。
2. **禁区（spec §11）**：没有包围盒中心对齐发型 / 武器 / 衣服；没有用 `HeadTop_End` 当头顶；没有 Neck + 0.006 常数颈环；没有 `bone.scale` 配对法；没有把 `model_rig.glb` 与 `anim_idle_walk_run.glb` 混用；没有新 pip 包、没有 Blender；Node 只允许 `meshoptimizer` devDependency。
3. **单位**：JSON 数值字段名带 `Mu` / `M` / `Deg` / `Mm` 后缀；`mPerMu = defaultHeightM / heightMu`；没有写死 `/Users/...` 路径（样例输入只出现在命令行 / 报告里）。
4. **实跑证据**：报告第 3 节有真实文件实跑的数字（顶点 / 三角 / 残差 / 耗时 / 锚点校验），不能只有合成数据；数字与产物文件（fit.json / report.json / skeleton.json）一致。
5. **自测**：`selftest.py` / `tests_*.py` 退出码 0，且断言有数值容差，不是只打印。
6. **门禁命令**：任务 `validate.cmd` 全部通过（`pnpm check` 含 lint / typecheck / test / content / size）；没有改门禁阈值；没有在任何测试里加"高负载跳过"。
7. **GLB 产物**：蒙皮件 skin 的 joints 顺序与 inverseBindMatrices 逐字节等于模板；`_REGION` 为 u8 SCALAR；材质 `KHR_materials_unlit` 且只引用 baseColor；节点无 TRS（刚性件锚点在原点）。
8. **报告**：`tools/agents/reports/<ID>.md` 7 节齐全、≤ 80 行、第 7 节写清交接接口（API / 字段 / 命令）。
9. **工具链以仓库声明为准**（协调者 2026-10-10 B6 起的既有裁定）：`package.json` 的 `packageManager: pnpm@9.15.9`、`engines.node >=22.12.0`、`engines.pnpm >=9 <10`。`_code.md`、`tech/01`、RUNBOOK 中的 Node 24 / pnpm 12 是未落地的迁移目标，不作本线任务门禁；在仓库声明的工具链下 `pnpm install --frozen-lockfile` 与 `pnpm check` 通过即满足完成定义。

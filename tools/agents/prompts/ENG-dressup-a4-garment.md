# 本任务：3D 纸娃娃换装 · 阶段 A4 · 衣物 / 发型贴合 fit_garment.py 与跨模板 refit_template.py（AR-102）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§3、§4、§5.1、§5.3、§5.4、§5.5、§11）、`tools/model3d/dressup/README.md`、A1 报告第 7 节（基础库 API）与 A2 报告第 7 节（skeleton.json 用法）。

## 作者要求
**AR-102** 第 2、3 条：装备放到素体上且补穿模、随动作运动；三种体型模板之间装备自动重贴合。**AR-97 / AR-99**：发型挂规范头尺寸。

## 规格
spec §5.1 对齐、§5.3 权重转移 / 推离 / 遮罩、§5.4 跨模板、§5.5 材质。核验修正（必须遵守）：
- 现有道具是独立出图的整身人形壳，姿态 / 朝向与正本不一致（袖角 17°~70° vs 正本 39°，面朝 ±X），**不存在刚体对齐**；本任务的语义锚点对齐只保证尺度 / 位置 / 偏航，袖角残差如实写进 fit.json，由后续"模板图编辑出图"从源头解决。
- 长裙 / 宽袖离体表 > 10 cm 时最近三角会把权重分给脚趾：必须用 `jointsAllowed`（按 slot）限制，并对低置信顶点用"到关节线段距离"加权混合（Hips 为主、腿骨渐变）。
- 推离只在 bind 姿势消穿模，要迭代 2~3 轮 + 拉普拉斯；动态穿透由 A5 的 validate 统计。

## 要做的事
1. `tools/model3d/dressup/fit_garment.py --body <正本> --skeleton <skeleton.json> --garment <raw.glb> --kind garment|hair --slot <slot> --id <id> --out <dir> [--remove-body-stub] [--push-mm 3] [--iters 3] [--coverage 0.65] [--json]`：对齐 → 删假人（可选）→ 权重转移 → 推离 → 遮罩统计 → 写蒙皮 GLB（1 node / 1 mesh / 1 primitive，skin 与正本逐字节一致，unlit，doubleSided）+ `fit.json`。
2. `tools/model3d/dressup/refit_template.py --from-body A --from-skeleton A.json --to-body B --to-skeleton B.json --garment X.glb --fit X/fit.json --out <dir>`：LBS 逆到骨局部 → 目标骨局部正变换（骨长比缩放）→ 推离 → 遮罩 → 输出 B 版 GLB + fit.json（`refitFrom`）。
3. 实跑（输入在主检出 `/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props/`，只读；正本与 skeleton.json 在 `assets/default/model3d/dressup/templates/tpl_f_medium/`）：
   - `cloth_xianxia_dress_raw.glb` kind garment slot body → `assets/default/model3d/dressup/garments/cloth_xianxia_dress/`；
   - `cloth_black_assassin_raw.glb` kind garment slot body → `garments/cloth_black_assassin/`；
   - `hair_ponytail_raw.glb` kind hair slot head → `assets/default/model3d/dressup/hair/hair_ponytail/`；
   - refit_template 恒等回归：A = B = 正本，对流仙裙输出与输入最大位差 < 1e-6。
4. `tools/model3d/dressup/tests_garment.py`：合成"圆柱身体 + 套筒衣服"验证权重转移（套筒顶点权重应与最近身体环一致）、推离（内陷顶点被推到 ≥ pushMm）、遮罩（被套筒盖住的区域被标出）、jointsAllowed 过滤。

## 约束
- 只写 `tools/model3d/dressup/{fit_garment.py,refit_template.py,tests_garment.py}`、`assets/default/model3d/dressup/{garments,hair}/**` 与本任务报告。
- 不改基础库、不改 export_skeleton.py；不加依赖；性能：15 万顶点衣物全流程 < 60 s、内存 < 2 GB（报告写实测）。

检查：
- `python3 tools/model3d/dressup/tests_garment.py`
- 三件实跑退出 0；恒等回归退出 0。
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写每件：对齐方法与残差（neckTop / feet / yaw）、权重高置信率、被 jointsAllowed 过滤的顶点数、推离顶点数与残留、hideRegions、输出顶点 / 三角、耗时与峰值内存；第 7 节写 A5 validate 与 B1 运行时需要的 fit.json 字段与 GLB 结构约定。报告 ≤ 80 行。

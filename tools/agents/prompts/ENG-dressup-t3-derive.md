# 本任务：3D 纸娃娃换装 · 阶段 T3 · 路 A 体型派生 derive_template.py（中等 → 娇小 / 修长，共拓扑、0 点；AR-104）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§1、§2 阶段 T、§4、§10.T、§11）、`docs/tech/10-paper-doll-3d.md` §1.3（三模板比例表与路 A 说明）、`tools/model3d/dressup/README.md`、A1 报告第 7 节（基础库 API）、A2 报告第 7 节（normalize_rig / skeleton.json）。

## 作者要求
**AR-104**：模板走路 A——中等模板一次生成，娇小 / 修长由分骨长度缩放 + LBS 派生（0 点、共拓扑）；女 1.58 / 1.66 / 1.72 m，男 精悍 1.76 / 中等 1.81 / 魁梧 1.86 m。**AR-102**：骨架唯一、不手写常数（比例目标来自规格表数据文件，派生结果由脚本实测写回）。

## 规格
- 规格表数据文件 `tools/model3d/dressup/template_specs.json`：6 个模板 `{ id, gender, heightM, hipsRatio（Hips.y / H）, shoulderRatio（LeftArm–RightArm 关节距 / H）, source: "tpl_f_medium" | "tpl_m_medium" }`，数值取 `tech/10` §1.3 表（女 0.545 / 0.565 / 0.585、0.150 / 0.156 / 0.160；男 0.535 / 0.540 / 0.525、0.195 / 0.200 / 0.215）。
- `tools/model3d/dressup/derive_template.py --from <中等 body.glb> --spec template_specs.json --id <tpl_id> --out <dir> [--json]`：
  1. 读源模板（须已过 `normalize_rig.py --check`）；
  2. 求分骨缩放：腿链（UpLeg / Leg / Foot，左右同）按目标髋高占比求 k_leg；脊柱链（Spine / Spine1 / Spine2 / Neck）按"身高 − 腿 − 头"余量求 k_spine；肩宽按目标 shoulderRatio 改 LeftShoulder / RightShoulder 子骨偏移；臂链（Arm / ForeArm）随身高比例 k_arm；**头与颈环不缩放**（头身分离，颈环由 export_skeleton 重算后与源比较）；
  3. 骨长变化用子骨 `translation` 改写（不用 scale，spec §11 第 12 条），重算 bind 世界矩阵与 IBM；
  4. 顶点：用源权重做 LBS——每顶点 v' = Σ w_i · M'_i · IBM_i · v（M' 为新 bind 世界矩阵），即"按新骨长摆回 bind 姿态"；法线同变换后归一；
  5. 动画：rotation 轨道原样保留；Hips translation 轨道按 k_leg 缩放（根运动随腿长）；其他 translation / scale 轨道应已被 normalize_rig 剥离（若存在则报错退出 2）；
  6. 写 GLB（拓扑、UV、贴图、skin joints 顺序不变，IBM 新值）；打印实测身高（按 `heightM` 换算比例）、髋高占比、肩宽比、最大顶点位移、是否有 NaN；
  7. 写 `<out>/derive.json`（源 sha、目标 id、各链 k 值、实测比例、误差）。
- 派生后在输出目录跑 `export_skeleton.py` 生成该模板的 `skeleton.json` 等，并比较颈环半径与源差 < 2 mm（换算到米）。

## 要做的事
1. 写 `template_specs.json`、`derive_template.py`、`tests_derive.py`（合成三骨腿链：缩放后骨长、LBS 位移、IBM 一致性、轨道处理断言）。
2. 实跑（过渡期正本，证明工具可用；30° 正本由 T2 产出后协调者会让你或 T2 重跑）：
   - `--from assets/default/model3d/dressup/templates/tpl_f_medium/body.glb --id tpl_f_small` → 输出到 `assets/default/model3d/dressup/templates/tpl_f_small/`；
   - 同上 `--id tpl_f_tall` → `templates/tpl_f_tall/`；
   - 两者各跑 `export_skeleton.py`；各写 `manifest.yaml`（`kind: dressup-template`、`derivedFrom: tpl_f_medium`（含源 sha）、`heightM`、实测比例、`status: draft`、`notes: 过渡期正本派生，30° 正本到位后重派生`）。

## 约束
- 只写 `tools/model3d/dressup/{template_specs.json,derive_template.py,tests_derive.py}`、`assets/default/model3d/dressup/templates/{tpl_f_small,tpl_f_tall}/**` 与本任务报告。
- 不改基础库、normalize_rig / export_skeleton（发现 bug 写进报告第 4 节）；不加依赖；不写死绝对路径。

检查：
- `python3 tools/model3d/dressup/tests_derive.py`
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_f_small/body.glb`
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_f_tall/body.glb`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_small`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_tall`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写两套派生的各链 k 值、实测身高比 / 髋高比 / 肩宽比与规格误差、最大顶点位移、颈环半径差、耗时；第 7 节写派生命令与 refit_template / 运行时如何消费（三套共拓扑、骨名顺序一致）。报告 ≤ 60 行。

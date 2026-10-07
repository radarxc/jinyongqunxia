# 本任务：3D 纸娃娃换装 · 阶段 A2 · 正本骨架帧导出 export_skeleton.py（插槽 / 尺寸 / 颈环 / 区域 / 握拳；AR-102）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§3、§4 是本任务规格，§11 禁区）、`tools/model3d/dressup/README.md` 与 A1 报告 `tools/agents/reports/ENG-dressup-a1-glbio.md` 第 7 节（基础库 API）。

## 作者要求
**AR-102**：骨架唯一（新骨架），所有插槽 / 权重由脚本从正本重算，不手写常数。**AR-99**：发型 / 帽子挂规范头尺寸。

## 规格
spec §4 `skeleton.json` 全部字段；求法要点（核验修正后）：
- 尺寸一律从蒙皮网格顶点壳算（某骨权重 ≥ 0.5 的顶点），不用关节距：头宽 / 头深 / 头围（最宽层水平切片凸包周长）/ 冠顶（Head 顶点中 y 最高 3 mm 簇质心）、肩 / 胸 / 腰 / 髋皮肤宽、手长手厚（PCA）、脚长。
- 颈环：`Neck.y + 0.006` 处水平切片，对 Neck / Head 权重顶点拟合圆（中心、半径、32 个采样点）。
- 插槽在**父骨局部坐标系**存 pos + quat：`gripR / gripL`（掌心核心顶点质心 + 掌面法线取 PCA 最薄轴朝拇指侧 + 握轴方向 Index1 → Pinky1，左右分别算，不镜像）、`headTop`（冠顶簇）、`headCenter`、`neck`、`chest / back`（Spine2 权重壳前后表面点 + 法线）、`waistL / R / Back`、`footL / R`。
- 区域 17 区按最大权重关节映射（spec §4 `jointToRegion` 表），输出每顶点 u8 到 `regions.npy`，三角形区域取三顶点多数并统计跨区三角比例。
- `fingerPose.fist`：从 idle 第 0 帧采样 30 根指骨局部四元数，再绕各指骨弯曲轴加紧 25°~35°。
- `--check` 模式：只校验已有 skeleton.json 字段齐全、数值在合理区间（头宽 0.08~0.12 mu、颈环半径 0.025~0.045 mu、关节 65、rest=bind 差 < 1e-5）。

## 要做的事
1. `tools/model3d/dressup/export_skeleton.py --body <glb> --out <dir> [--default-height-m 1.65] [--json] [--check]`。
2. 实跑正本：`assets/default/model3d/dressup/templates/tpl_f_medium/body.glb` → 同目录 `skeleton.json` + `regions.npy`，并把 `skeleton` / `regions` 字段核对进该目录 `manifest.yaml`（已有占位行，不改其他字段）。
3. `tools/model3d/dressup/tests_skeleton.py`：合成两骨模型上验证区域映射、颈环拟合、插槽局部坐标往返（局部 → 世界 → 局部）。

## 约束
- 只写 `tools/model3d/dressup/export_skeleton.py`、`tools/model3d/dressup/tests_skeleton.py`、`assets/default/model3d/dressup/templates/tpl_f_medium/{skeleton.json,regions.npy,manifest.yaml}` 与本任务报告。
- 不改 glb_io.py / common.py（需要新函数写在自己文件里）；不加依赖；不写死绝对路径。

检查：
- `python3 tools/model3d/dressup/tests_skeleton.py`
- `python3 tools/model3d/dressup/export_skeleton.py --body assets/default/model3d/dressup/templates/tpl_f_medium/body.glb --out assets/default/model3d/dressup/templates/tpl_f_medium --json`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_medium`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写 measures 全部数值、neckRing、各插槽局部 pos（mu）与它们换算到世界系后的位置（便于协调者对照体检报告：头宽 ≈ 0.097、头围 ≈ 0.325、右握点世界 ≈ (−0.27, 0.595, 0.009)）、跨区三角比例、握拳角度；第 7 节写 skeleton.json 的消费方式（A3 / A4 / B1 怎么读）。报告 ≤ 80 行。

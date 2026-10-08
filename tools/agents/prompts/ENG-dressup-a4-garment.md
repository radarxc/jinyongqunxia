# 本任务：3D 纸娃娃换装 · 阶段 A4 · 衣物 / 发型贴合 fit_garment.py 与跨模板 refit_template.py（AR-102）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§3、§4、§5.1、§5.3、§5.4、§5.5、§11）、`tools/model3d/dressup/README.md`、A1 报告第 7 节（基础库 API）与 A2 报告第 7 节（skeleton.json 用法）。

## 作者要求
**AR-102** 第 2、3 条：装备放到素体上且补穿模、随动作运动；三种体型模板之间装备自动重贴合。**AR-97 / AR-99**：发型挂规范头尺寸。

## 规格
spec §5.1 对齐、§5.3 权重转移 / 推离 / 遮罩、§5.4 跨模板、§5.5 材质。核验修正（必须遵守）：
- 现有道具是独立出图的整身人形壳，姿态 / 朝向与正本不一致（袖角 17°~70° vs 正本 39°，面朝 ±X），**不存在刚体对齐**；本任务的语义锚点对齐只保证尺度 / 位置 / 偏航，袖角残差如实写进 fit.json，由后续"模板图编辑出图"从源头解决。
- 最近三角候选数默认 k = 16（spec §5.3；可做成 `--k` 参数）；袖角、颅骨等残差一律从实际网格量，不得写常数（审核 r4 指出 17°~70° 被写死）。
- 长裙 / 宽袖离体表 > 10 cm 时最近三角会把权重分给脚趾：必须用 `jointsAllowed`（按 slot）限制，并对低置信顶点用"到关节线段距离"加权混合（Hips 为主、腿骨渐变）。
- 推离只在 bind 姿势消穿模：每轮推完**重新查最近面复查**，迭代到 inside = 0 或达 `--iters` 上限（原型三轮后仍残留 236 顶点），位移做拉普拉斯平滑并检查翻面与边长拉伸（翻面 0、边长比 [0.7, 1.4] 内三角 ≥ 99%），`fit.json.pushOut.rounds[]` 记每轮 inside / moved；动态穿透由 A5 的 validate 统计。
- 颈环带、手、脚区域不得进 hideRegions；对齐用 Umeyama 时强制 det = +1 并用 ≥ 6 个对称关节校验镜像（`align.mirrored`）。

## 要做的事
1. `tools/model3d/dressup/fit_garment.py --body <正本> --skeleton <skeleton.json> --garment <raw.glb> --kind garment|hair --slot <slot> --id <id> --out <dir> [--remove-body-stub] [--push-mm 3] [--iters 3] [--coverage 0.65] [--json]`：对齐 → 删假人（可选）→ 权重转移 → 推离 → 遮罩统计 → 写蒙皮 GLB（1 node / 1 mesh / 1 primitive，skin 与正本逐字节一致，unlit，doubleSided）+ `fit.json`。
2. `tools/model3d/dressup/refit_template.py --from-body A --from-skeleton A.json --to-body B --to-skeleton B.json --garment X.glb --fit X/fit.json --out <dir>`：LBS 逆到骨局部 → 目标骨局部正变换（骨长比缩放）→ 推离 → 遮罩 → 输出 B 版 GLB + fit.json（`refitFrom`）。
3. 实跑（协调者 2026-10-07 17:20 正式调整验收，依据审核 r3 的建议）：
   - **验收件（严格模式，必须 `status=fitted`、`pushOut.passed=true`、CLI 不带 `--allow-draft` 退出 0）**：从当前正本 `assets/default/model3d/dressup/templates/tpl_f_medium/body.glb` 取躯干上下、髋、左右大腿区域（按 `regions.npy`）的蒙皮顶点壳，沿顶点法线外扩 4 mm，再加幅度不超过 ±3 mm 的确定性噪声（固定随机种子；允许做空间平滑以免输入本身翻面，但**禁止**任何事后按带符号距离的校正）制造少量穿透——贴合前必须有 ≥ 2% 顶点带符号距离 < 0（报告写实际比例），以证明测试有效（协调者 2026-10-07 20:35 澄清，依据审核 r4），作为"贴身合成件"写成独立 GLB（无 skin，供 fit_garment 输入），slot body；要求：真实口径 `highConfidence ≥ 0.85`、`residual = 0`、`insufficientMargin = 0`、`flippedTriangles = 0`、`stretchWithinRatio ≥ 0.99`、`hideRegions` 包含被覆盖的躯干 / 髋区且不含 neverHide。合成件生成脚本写进 `tests_garment.py`（或其辅助函数），产物放 `assets/default/model3d/dressup/garments/_fixture_bodysuit/`。
   - **诊断件（旧道具，允许 draft）**：`cloth_xianxia_dress_raw.glb`（slot body）、`cloth_black_assassin_raw.glb`（slot body）、`hair_ponytail_raw.glb`（kind hair, slot head），输入在主检出 `/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props/`（只读），加 `--allow-draft` 运行，产物写入 `garments/<id>/`、`hair/<id>/`，`status=draft`，报告如实写真实高置信率、残留、安全距、翻面、边长合格率。这三件是独立出图、姿态与正本不同、内含假人体的整身壳，达不到验收线属预期；"流仙裙高置信 ≥ 0.85"改由阶段 E（模板底图编辑出的新衣物）验收。
   - **恒等 refit**：对贴身合成件做严格模式恒等回归（来源与结果均 `fitted`、静态残留与翻面 0、最大位差 < 1e-6）；另做一次非恒等 refit（合成骨长变化）。
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

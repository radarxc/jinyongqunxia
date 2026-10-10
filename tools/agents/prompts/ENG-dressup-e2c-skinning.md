# 本任务：3D 纸娃娃换装 · E2c · 劲装动画穿插（宽袖 / 下摆按姿势蒙皮）+ 模板胸下倒置面（AR-108 V2）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V2、§2 P2）、E2b 报告（`tools/agents/reports/ENG-dressup-e2b-cleanup.md`）与 `tools/model3d/dressup/{fit_garment.py,validate.py,common.py,bake_hide_mask.py}`。

## 背景（E2b 结论，数字见 E2b 报告第 3 节）
E2b 用体表位移场 + 限拉伸垂坠（`--push-mode volume`）修好了劲装版型几何：三模板翻面 0、边长 ≥ 99%、close-fit < 5 mm，胸口不再破。剩下两类问题：
1. **动画穿插（真穿入）**：idle / walk 的可见穿透超过 2%。伪法向复核确认是真穿入，集中在两处：
   - 垂手时宽袖与髋 / 大腿相撞（ForeArm，深 9–28 mm）；
   - 下摆在步态中被大腿顶穿（UpLeg）。
   原因：袖子 / 下摆直接取最近体表点的模板权重，宽松部位在动作中会撞上身体其他部位，属 LBS 蒙皮问题。
2. **A1 符号误判（假穿入）**：bind 时可见的几个"穿入点"其实在体外 22–49 mm（射线奇偶、伪法向两种方法都判在体外）。原因：三模板各有 26–31 个与着色法向相反的面（Spine1 胸下 7–8 个、Head 8、脚趾 8、Spine2 2–3），A1 带符号距离（最近点连线 · 重心插值顶点法向）在附近判反。

## 要做的事
1. **按姿势蒙皮**（宽松部位）：在模板 idle / walk / run 采样帧上求衣物权重，使衣物点不进入身体。
   - 只作用于离体表超过阈值的宽松部位（宽袖、下摆），贴身部位保留模板权重；
   - 带邻域平滑正则（拉普拉斯或权重修补），杜绝逐点独立 LP 的尖刺（traex 在 E2b 曾出现动画尖刺）；
   - 新选项默认关闭，既有行为不变；三模板评估 `penetration.*.visible ≤ 2%`、`holes ≤ 0.05%`，写入报告。
2. **模板倒置面**：两条路选一条，在报告里对比影响面后实施：
   - 修 `templates/tpl_f_*/body.glb` 的倒置面；会改模板哈希，需连带刷新所有引用它的 fit / report；
   - 或把 A1 `common.signed_distance` 的符号改为角度加权伪法向（E2b 已在 `fit_garment.PseudoNormalSign` 实现并有合成回归）。会改变各工具的穿透计数，需重跑受影响素材的 validate，并证明头 / 道具结论不变。
3. 劲装与布衣三模板重跑 validate；三项门全过时才去掉 `experimental`。

## 约束
- 写集在开工时由协调者按第 2 条选定的方案补全；不改门禁阈值与输出格式；不加依赖；不花 Tripo 点数。

检查：
- `python3 tools/model3d/dressup/tests_garment.py`
- `python3 tools/model3d/dressup/tests_hidemask.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-e2c-skinning.md`，≤ 50 行。

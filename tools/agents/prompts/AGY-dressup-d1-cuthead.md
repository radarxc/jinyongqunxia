# 本任务：3D 纸娃娃换装 · D1 · 切头：从现有 NPC 整身模型切出规范颈环的头（黄蓉 npc_huangrong，0 点；AR-102 / AR-108 闸门 V4）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5）、`docs/tech/10-paper-doll-3d.md` §1.2（头身分离：规范颈环、规范头尺寸、肤色匹配）、`docs/tech/11-paper-doll-3d-impl-spec.md`（§4 skeleton.json：`neckRing` 64 点轮廓 + 权重、`skullProfile`、`measures.headWidthMu`；§11 第 11 条：颈环不取 Neck + 常数、头归一用「颈切面轮廓 ↔ 规范环」相似 + 脸高 ±8% 钳位），`tools/model3d/dressup/{glb_io.py,common.py,export_skeleton.py,fit_garment.py,textures.py,pack_glb.mjs,ingest.py}`（颈环求法、按模板 skin 写蒙皮 GLB 的做法可复用 / 追加调用，不改既有函数）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 作者要求
**AR-102**：模板素体 + 每个角色只换头；脸要和角色一致，接缝不可见。**AR-108**：主要角色的头做 3D——已有 3D 整身模型的 34 人直接切头（0 点）；量产前先验证（闸门 V4：颈环处静止与 walk / run 都无缝；肤色差 ΔE2000 < 3；头尺寸归一后差 < 1%）。

## 输入
- 源：`assets/default/model3d/npc_huangrong/model_rig.glb`（Tripo 绑骨整身，65 关节 Mixamo 骨名，59,873 顶点；淡黄长裙、发冠、深褐后发）。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_medium/`（`skeleton.json` 的 `neckRing`、`skullProfile`、`measures`）。

## 要做的事
1. **`tools/model3d/dressup/cut_head.py --source <整身 glb> --template <模板目录> --id <npc_id> --out <dir> [--json]`**：
   - 在源模型上用与 `export_skeleton.py` 相同的规则求**源颈环**（Neck 局部系切面，不用常数）；
   - 对齐：把源颈环（中心、朝向、椭圆半径）相似变换到模板规范颈环；头尺寸按"颈切面轮廓 ↔ 规范环"相似为主，脸高（下巴 → 发际 / 头顶）与模板头的差 > 8% 时钳位；报告实际缩放与残差；
   - 切割：保留颈环切面以上的头部（含头发、发冠等头饰），**开口边界顶点吸附到模板 64 点规范环**（按角度对应；边界上方 2~3 环顶点平滑过渡），保证与模板脖子同一条接缝；
   - 蒙皮：头部顶点 → `mixamorig:Head`；接缝附近按模板颈环 profile 的 4 骨权重渐变（与模板身体在接缝处 LBS 完全一致）；写成**与模板 skin 相同的 joints 顺序与 IBM**（同衣物件），1 node / 1 mesh / 1 primitive，unlit，贴图 ≤ 2048²（`textures.py`）；
   - 肤色：取源脸 / 颈皮肤区（按颜色聚类与区域，避开眉眼唇与头发）与模板颈部皮肤区的平均色，算 `skinTint`（作用于模板身体 baseColor 的 RGB 乘子，使身体向头靠拢）与 ΔE2000（乘子作用后），写进 fit.json；
   - 输出：`<out>/head.glb`、`fit.json`（`kind: head`、`npc`、`ring: { sourceRadiusMu, scale, residualMu }`、`hideRegions: ["head"]`（模板自带光头不画）、`neverHide`、`skinTint`、`deltaE`）、`preview.png`（Pillow 软光栅：模板 + 头 bind 正 / 侧，接缝处放大）。
2. **实跑黄蓉**：输出 `assets/default/model3d/dressup/heads/npc_huangrong/`，`ingest.py head npc_huangrong`（若 ingest 不支持 head 类别，在本任务写集内用同 schema 手写 manifest：`kind: dressup-head`、`status: draft`、`experimental: true`）。
3. **接缝检查**：用模板 idle / walk / run 各 24 帧 LBS（与 validate 同法）量"头开口环顶点 ↔ 模板颈环顶点"最大位差（应 < 0.5 mm）与头部顶点穿入身体比例；写进 report.json（新增 `seam.*` 检查，或独立 `seam_check.json`）。
4. **测试** `tools/model3d/dressup/tests_head.py`：合成"圆柱身体 + 球头 + 圆柱颈"整身：切面位置、环吸附、权重渐变、skin 与模板一致、肤色乘子方向；只写临时目录。

## 约束
- 只写 `tools/model3d/dressup/{cut_head.py,tests_head.py}`、`assets/default/model3d/dressup/heads/npc_huangrong/**` 与本任务报告；基础库只能追加函数、不改既有签名。
- 不改运行时（挂头在运行时由 B5 处理：`equip({ kind: 'head', … })` 复用衣物绑定路径 + 身体乘 `skinTint`）；不加依赖；**不花 Tripo 点数**。
- 本任务由 agy 执行：必须把代码、实跑、检查全部做完再结束；不执行改变仓库状态的 git 命令。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/AGY-dressup-d1-cuthead.md`：第 3 节写源颈环、缩放与钳位、环吸附位差、接缝 72 帧最大位差、肤色乘子与 ΔE、顶点 / 三角、耗时；第 7 节写给 B5（运行时挂头）与 P5 量产（34 人切头）的接口与命令。报告 ≤ 50 行。

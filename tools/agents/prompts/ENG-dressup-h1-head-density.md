# 本任务：3D 纸娃娃换装 · H1 · 拼头头部贴图精细化（8K 源贴图 + 头部 UV 岛独立排进图集；0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。执行者：Claude（AR-110：切头工具 D1b / D1c / D2 均由 Claude 直接实现，仍走校验 + GPT 审核）。先读 `tools/model3d/dressup/cut_head.py` 文件头注释与 `process_head`、D2c 报告 `tools/agents/reports/ART-dressup-d2c-head-align.md`。

## 作者要求（2026-10-11）
「停下方案1吧。拼头的头像素密度可以做的更好更精细。」

## 现状（协调者实测）
- 切头图集 = 源件整张 2K 全身图集 Lanczos 压进 2048 × 1792（下方 256 行是颈片条带）；头部三角的 UV 岛只占这块画布的 **8.2%（黄蓉）/ 11.6%（穆念慈）**，其余是身体、衣服的纹素。
- Tripo 对同一绑骨 op 免费重导 8K：黄蓉项目 `a2ae3f7b-b146-4cb3-969c-6d76b1b3fdcd`（导出 op `c3ac4cc6-36a1-438c-a078-4ccce1bf30ab`）、穆念慈项目 `e7ffcf53-5260-488d-8a22-c34804b882bb`（导出 op `e4f4dd8f-4634-4b43-9d96-43e895ff2620`）。两份导出与现有源件**顶点、UV、索引逐字节相同**，baseColor 为 8192²，缩回 2K 后与现有贴图平均差 1.3 / 1.1（/255），是同一次烘焙。
- 按 70% 排布效率估计，头部岛独立排进 2048 × 1792 后线性纹素密度约为现在的 2.5–2.9 倍（8K 源有足够细节）。

## 要做的事
1. `cut_head.py` 新增可选 `--texture <图>`（与 `--source` 同 UV 布局的高清 baseColor）：
   - 校验：边长为源件贴图的整数倍；BOX 缩回源件贴图尺寸后与内嵌贴图平均差 ≤ 3/255，否则退出 2 并说明（防止布局不符）。
   - 分类、衣领残片、切口带调平、顶点色、肤色匹配等分析一律仍用源件内嵌贴图（几何、权重、遮罩与门禁口径不变）；只有最终图集的头部内容与头部 UV 改变。
   - 头部 UV 岛 = 头部三角按共享顶点的连通分量；各岛 UV 包围盒外扩 gutter，以同一缩放比排进图集上方 `ATLAS_SIZE − STRIP_ROWS` 行（不旋转，二分求最大缩放），逐岛从高清图 Lanczos 重采样、改写头部 UV；岛间空隙按最近已填纹素外扩填充（防 mip 渗色）。
   - 切口带调平若改了源件纹素，把同一逐纹素差值双线性放大后加到高清图再排（诊断里记录）。
   - `fit.json.source` 加 `texture {path, sha256, size}`；诊断加 `atlas {mode: packed, islands, scaleDstPerSrc, headCoverage, linearGainVsLegacy}`。
   - 不给 `--texture` 时输出与现在逐字节一致（回归判据）。
2. 测试（`tests_head.py`）：合成多岛排布无重叠、都在画布内、gutter ≥ 2 px、全岛同一缩放；UV 改写后在新图集按新 UV 取样 ≈ 在高清图按旧 UV 取样（误差有界）；布局不符时退出 2；无 `--texture` 路径不变。
3. 8K 贴图（从上面两次导出无损取出的 PNG）放主检出本地素材库 `apps/game/public/models/props/npc_huangrong_basecolor_8k.png`、`npc_munianci_basecolor_8k.png`（未入 git，与 Tripo 原始件同一约定），`fit.json` 记仓库相对路径 + sha256。
4. 用 `--texture` 重切黄蓉（`--source assets/default/model3d/npc_huangrong/model_rig.glb`）与穆念慈（`--source assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig_s07.glb`）× tpl_f_medium / tall / small；各自 `gateLevel: pass`、report `level: draft`，manifest 同步。
5. `shoot_head.mjs` 新旧对照：正脸 / 3/4 / 侧面近景，放 `heads/<npc>/shots/density.tpl_f_medium.jpg`（另两体型各一张全身小图即可）。

## 验收
- 6 份切头门禁全过（颜色接缝 p95 < 2、ΔE < 3、G1、遮罩、动作帧外露等原口径不变）；头部覆盖率 ≥ 50%，线性纹素密度 ≥ 现在的 2 倍。
- 近景截图里眉、睫毛、虹膜、发丝明显更清晰；发际线 / 颈缝无新接缝、无渗色。

## 约束
- 只写 `tools/model3d/dressup/cut_head.py`、`tools/model3d/dressup/tests_head.py`、`assets/default/model3d/dressup/heads/npc_huangrong/**`、`assets/default/model3d/dressup/heads/npc_munianci/**`、本任务报告；本地素材库两张 PNG 不入 git。
- 0 点：不生成、不绑骨；不加依赖；不改门禁阈值；测试不写真实素材。

检查：
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- 两个头各三体型 `report*.json` 的 level 不为 fail
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-h1-head-density.md`（≤ 60 行）：岛数、缩放比、覆盖率、密度倍数；6 份门禁关键值新旧对照；截图路径；第 7 节写 `--texture` 用法与后续换模板（tpl_f2）重切时的命令。

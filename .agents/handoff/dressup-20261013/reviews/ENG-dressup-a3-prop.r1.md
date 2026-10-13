VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 仅有任务允许的 9 个未跟踪文件；未改基础库、依赖、门禁或已批准素材。
- [normalize_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/tools/model3d/dressup/normalize_prop.py:134)：不通过 —— 连通块直接按原始顶点索引计算，没有焊接 UV/法线接缝上的同位置顶点。三件实际几何焊接后均为 1 个连通块，却被报告为剑 313、斗笠 543、玉佩 416 块；对应 [剑 fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/assets/default/model3d/dressup/props/item_qingfeng_sword/fit.json:75)、[斗笠 fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/assets/default/model3d/dressup/props/item_bamboo_hat/fit.json:75)、[玉佩 fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/assets/default/model3d/dressup/props/luxury_jade_pendant/fit.json:52) 的统计不真实。
- `--keep largest`：不通过 —— [normalize_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/tools/model3d/dressup/normalize_prop.py:139) 会把接缝误认成独立零件。对现有输出执行该逻辑，剑、斗笠、玉佩只会保留约 2.72%、3.33%、1.51% 的三角形，严重破坏模型。
- [tests_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/tools/model3d/dressup/tests_prop.py:72)：不通过 —— 规定的合成剑/锥断言 2/2 通过，但没有覆盖接缝焊接、真实多零件识别或 `--keep largest`，因此未发现上述公开 CLI 功能错误。
- 锚点诊断：不通过 —— [normalize_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/tools/model3d/dressup/normalize_prop.py:385) 将 `anchorPositionMu` 固定写成 `[0,0,0]`，不是从最终 float32 输出几何复算的残差。当前三件实测残差确实约为 `0 / 1.09e-11 / 3.30e-12 mu`，但 `fit.json` 本身不能证明这一点。
- 三件样例的几何与尺度：通过 —— 剑主轴与 +Y 点积为 1、第二轴与 +Z 点积为 1；斗笠锥顶残差约 `1.09e-11 mu` 且开口在 −Y；玉佩最高 1% 簇质心残差约 `3.30e-12 mu`。实际米制尺寸分别约为 `1.0000000 / 0.4500000 / 0.0800000 m`。
- GLB 结构：通过 —— 三件均为一个无 TRS mesh 节点；材质均带 `KHR_materials_unlit`，只引用一张 baseColor 图片，图片 SHA-256 与对应源文件一致，没有 normal/ORM 引用。
- 禁区与单位：通过 —— 未发现包围盒中心对齐武器、`HeadTop_End`、Neck 常量、`bone.scale`、混用骨架、新依赖、Blender或绝对路径硬编码。
- 门禁：通过 —— 执行日志显示三件 CLI 3/3、合成测试 2/2、`pnpm install --frozen-lockfile` 退出 0、`pnpm check` 退出 0；Vitest 为 178/178 文件、1272/1272 测试。
- [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/tools/agents/reports/ENG-dressup-a3-prop.md:18)：不通过 —— 7 节齐全且 52 行，但第 3 节缺每件顶点数、实际锚点残差、尺寸残差、定向残差和单件耗时；连通块数字错误，[第 25 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a3-prop/tools/agents/reports/ENG-dressup-a3-prop.md:25) 的“偏离：无”也不成立。第 7 节的 B1 字段清单则已提供。

## 返修说明

1. 修正连通块算法：先按位置焊接因 UV/法线接缝重复的顶点，再在焊接拓扑上计算组件；把组件标签映射回原顶点。`--keep largest` 必须按真实几何组件保留，不能只留下单个表面 patch；`boundaryEdges` 也应基于焊接拓扑统计。
2. 增加回归测试：

   - 一个带重复接缝顶点的闭合盒应为 1 块；
   - 两个空间分离的闭合盒应为 2 块；
   - `--keep largest` 应完整保留较大盒；
   - 三件实跑的组件统计应与焊接几何一致。

3. 不要硬编码 `anchorPositionMu`；从最终变换、float32 量化后的顶点重新求语义锚点并写真实残差，测试直接检查输出几何。
4. 重新生成三件 GLB/fit，并修正报告第 3 节：每件写顶点、三角、真实组件数、锚点残差、主轴/朝向残差、尺寸误差、单件耗时和文件大小。
5. 可用以下只读命令复现核心问题；当前输出为约 `313 1 0.0272036`：

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B -c 'import sys,numpy as np; sys.path.insert(0,"tools/model3d/dressup"); from glb_io import load_glb; from common import connected_components; m=load_glb("assets/default/model3d/dressup/props/item_qingfeng_sword/item_qingfeng_sword.glb").mesh(); f=m.indices.reshape(-1,3); u,r=np.unique(m.positions,axis=0,return_inverse=True); c=connected_components(len(m.positions),f); print(len(c),len(connected_components(len(u),r[f])),np.all(np.isin(f,max(c,key=len)),axis=1).mean())'
```

6. 返修后重跑合成测试、三件 CLI、产物结构/尺寸检查、`pnpm install --frozen-lockfile` 和 `pnpm check`。

## 需作者确认

无。
VERDICT: FAIL

## 逐项结论

- 写集与素材保护：通过 —— 相对基点的全部改动均在允许路径内；无图片变更。正本 `body.glb` 当前与基点 SHA-256 均为 `647c674f2e3139d407714ead2fef5ddfa2abb05643d5cfdee2f730cdafb31748`。
- 依赖与禁区：通过 —— 只新增 `meshoptimizer@1.3.0`；未发现 Blender、新 pip 包、硬编码 `/Users/...`、`HeadTop_End` 定位、Neck+0.006、`bone.scale` 配对或混用两套骨架。
- 基础检查：通过 —— 四个 CLI `--help`、Node 语法检查、Python AST 解析和 `git diff --check` 均退出 0；监督日志记录冻结安装及完整 `pnpm check` 通过，共 179 个测试文件、1,281 项测试。
- `validate.py` 最近体表判定：不通过 —— [validate.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:106) 只精算最近的 16 个三角形质心，没有采用基础库 [common.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/common.py:267) 已实现的包围半径扩候选。只读反例中，实际位于体表内 `2 mm` 的点被门禁判成体表外 `98 mm`；该错误同时污染 bind 穿透、72 帧动态穿透和贴身区 p90，可能把应失败资产放行。

  复现命令：

  ```sh
  python3 -c 'import sys,numpy as np;sys.path.insert(0,"tools/model3d/dressup");from validate import _signed_distances;from common import signed_distance;v=[];f=[];n=[];tri=lambda a,b,c:(f.append([len(v),len(v)+1,len(v)+2]),v.extend([a,b,c]),n.extend([(0,0,1)]*3));tri((0,-1,0),(0,1,0),(100,0,0));[tri(((j-7.5)*1e-4,-.01,-.1),((j-7.5)*1e-4+.01,.01,-.1),((j-7.5)*1e-4-.01,.01,-.1)) for j in range(16)];p=np.array([[0.,0.,-.002]]);v=np.array(v,float);f=np.array(f);n=np.array(n,float);print(_signed_distances(p,v,f,n,k=16).tolist());print(signed_distance(p,v,f,n,k=16).distances_mu.tolist())'
  ```

  当前输出依次为 `[0.098]` 和 `[-0.002]`。

- `validate.py` 发型源几何重建：不通过 —— [validate.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:342) 对 hair 使用 `headTopMu` 和 `0.997` 分位重新对齐；A4 实际契约使用 `align.headCenter.worldMu`、颅骨宽度和 `0.92` 分位。真实 skeleton 中 head center 与 head top 相差 `0.06048 mu`，因此报告中的马尾残差 `0.334065 mu`、贴身 p90 差 `125.762 mm` 不是可信的独立核算结果。
- 骨架、权重、动画与遮罩检查：部分通过 —— joint 顺序、IBM、权重和、最多四骨、`jointsAllowed`、LINEAR/STEP 插值、CUBICSPLINE 拒绝和禁区集合均有实现；但它们最终依赖上述错误距离函数，动态穿透结论仍不能通过。
- `textures.py`：通过 —— [textures.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/textures.py:77) 会重建 BIN/bufferView、重排 accessor 引用、删除 normal/MR 等非 baseColor 图块、输出限尺寸 JPEG，并加入 `KHR_materials_unlit`。
- `pack_glb.mjs`：通过 —— [pack_glb.mjs](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:103) 支持刚性与蒙皮件，拆分跨区三角，锁区域/颈部/拓扑边界；UV 和 WEIGHTS 进入误差通道，JOINTS/_REGION 不进入；只重建索引。单 BIN meshopt、GLTFLoader 加载及属性/IBM 回环均有测试。
- `ingest.py` 报告绑定：通过 —— [ingest.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:81) 会校验检查全集、全部显式 `pass:true`、kind/id，以及 GLB/fit 的 SHA-256 和大小；路径逃逸与 fail report 会拒绝。
- `ingest.py` 跨模板 `fits`：不通过 —— [ingest.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:126) 每次只生成当前模板的一条 `fits`，而 [ingest.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:162) 又拒绝同一 ID 的已有目录。因此 medium 入库后无法再加入 small/tall 变体，不满足 spec §7 的按模板变体 manifest。
- 构建期发布器：通过 —— [dressup-assets.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.ts:65) 签名正确；只读取运行时四字段，支持 `fits.*`，跳过顶层和变体 `rejected`，忽略 `source.*` 并限制路径。
- 测试覆盖：不通过 —— 当前测试没有“细长真实最近三角被 16 个假近质心遮蔽”的数值回归，也没有“同一资产连续 ingest medium/small/tall 后合并 `fits`”的回归，因此全绿未覆盖两个阻断缺陷。
- 报告：不通过 —— [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/agents/reports/ENG-dressup-a5-gate.md:1) 七节齐全、60 行且 B1 接口明确；但第 3 节的 A4 穿透和几何数值由失真的距离/源几何计算产生，不能作为 AR-103 合入门禁证据。衣物/发型条目也未逐件列出顶点数和实跑耗时。

## 返修说明

1. 删除 `validate.py` 自写的固定 16 质心候选近似，调用 `common.signed_distance`，或完整复用其三角包围半径扩候选逻辑；可以分块，但 bind 和 idle/walk/run 各 24 帧必须覆盖全部装备顶点。
2. 增加上述细长三角反例，明确断言 `−0.002 mu`，并验证它会计入 `< −1 mm` 穿透，而不是得到 `+0.098 mu`。
3. 按 A4 的真实 `align.method` 重建源几何。hair 必须使用 `align.headCenter.worldMu`、实际颅骨缩放与 `0.92` 分位，不能改用 head top；landmarks 与 joints 两条路径分别增加真实格式回归。
4. 修改 ingest 的跨模板逻辑：允许同一 ID 安全追加模板变体，按规范生成模板后缀 GLB/report 文件并合并 `fits.<template>`；不得覆盖既有其他模板，也不得丢失顶层状态和来源字段。
5. 增加“同一 ID 先 medium、再 small/tall”的 ingest + publisher 测试，验证 candidate/draft/rejected 三种变体。
6. 用修复后的门禁重跑三件 A3 prop、两件 garment、一件 hair 和正本副本；重新生成报告，逐件写可信的 level、顶点/三角、耗时、几何值及 idle/walk/run 穿透率，再跑冻结安装、四个帮助命令和完整 `pnpm check`。

## 需作者确认

无。
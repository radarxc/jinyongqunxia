VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 相对基点的 22 个文件全部位于任务允许范围；未发现硬编码绝对路径、新依赖、Blender、错误骨架混用或门禁阈值放宽。
- `bake_hide_mask.py` 基础产出：通过 —— 已实现 L8 PNG、白色隐藏、三模板独立文件、正背预览、9 向射线、80 mm 默认射程、neverHide、4 px 形态学和 gutter，并写入 `fit.hideMask`。
- `bake_hide_mask.py` 开口判定：不通过 —— [bake_hide_mask.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1-hidemask/tools/model3d/dressup/bake_hide_mask.py:335) 和同文件第 358 行仍计算命中点到所有开口线段的欧氏最小距离，没有建立“首个命中层所属开口环”的对应关系；已有的 `_opening_geodesic`（第 137 行）没有被使用。这不完全符合返修要求的“距其所在开口边界”口径。
- 躯干漏遮修复：不通过 —— 三张 preview 中衣服轮廓内仍可见明显的胸腹、腰胯及背部未遮皮肤斑块，medium 最突出；没有达到本轮要求的“正面躯干大片未遮岛清除，仅开口附近留皮肤”。
- 跨 UV 岛一致性测试：不通过 —— `test_duplicate_uv_island_vertices_stay_consistent` 只检查形态学前的 `result.covered` 顶点标签，没有检查闭开运算后的最终 PNG 在重复 3D 点/UV 岛两侧是否一致。
- 80 mm 斜射线回归：不通过 —— [tests_hidemask.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1-hidemask/tools/model3d/dressup/tests_hidemask.py:63) 的主合成用例仍显式使用 `max_distance_mm=40.0`，且没有构造“法线 40 mm 未命中、25°斜向 80 mm 命中”的返修回归。
- `validate.py` visible/all 口径：通过 —— 有遮罩时生成 `penetration.*.{all,visible}`，仅 visible 判门；无遮罩保留原字段和原计算路径。遮罩按最近身体三角的重心 UV 采样，合成测试覆盖了隐藏与未隐藏穿透。
- `fit_garment.py --edge-weights template`：部分通过但总体不通过 —— 默认关闭、30 mm 表面距离渐变及模板权重混合已经实现；但 [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1-hidemask/tools/model3d/dressup/fit_garment.py:1089) 把真实重跑识别为 `edge_only_refit`，随后以 `iters=0, verify_only=True` 跳过几何推离，导致旧的领口 bind 内陷被原样保留。
- 劲装三模板动态穿透：通过 —— visible idle/walk/run 分别为 medium `1.6474%/1.4809%/1.4869%`、small `1.6058%/1.5404%/1.3739%`、tall `1.2668%/1.0408%/0.8207%`，均不超过 2%。
- 劲装三模板静态穿透：不通过 —— 三份报告的 `penetration.bindVertices.visible` 分别为 `27/2/5`，明确高于必须为 0 的目标；三份 [report.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-g1-hidemask/assets/default/model3d/dressup/garments/eq_jinzhuang/report.json:230) 均为 `level=fail`。
- 既有几何门禁：不通过 —— medium/small/tall 分别仍有 `309/84/126` 个翻面，边长合格率为 `88.5005%/97.7048%/96.9345%`；small 另有 close-fit P90 `5.1637 mm`。因此 manifest 保持三个 `gateLevel: fail`，不满足可合入完成状态。
- GLB 契约：通过 —— 报告确认三套产物骨架关节、IBM、`_REGION` u8 SCALAR、unlit、单材质/单 mesh node 等检查通过。
- 报告与自动检查：通过 —— 报告共 29 行、七节齐全且如实记录失败；受管校验日志显示 `tests_hidemask.py` 8/8、`selftest.py` 7/7、`pnpm check` 186/186 文件和 1321/1321 测试通过。但自动检查通过不能覆盖上述真实资产验收失败。

## 返修说明

1. 改造开口留边：为每个衣物三角/首命中点关联其拓扑所属开口环，使用衣物表面测地距离判断 15 mm；不得继续取所有领口、袖口、衣摆线段的欧氏最小值。叠襟下存在第二层时仍应隐藏。
2. 对三套劲装执行真正的“贴合 → edge weight 混合 → 推离复查”，不要在 `edge_only_refit` 分支以零轮 `verify_only` 跳过位置修正。领口必须在保留皮肤的同时将衣物移到体表外，使 bind visible 全部为 0。
3. 清除 preview 中胸腹、腰胯和背部衣服轮廓内的未遮岛；最终图只允许领口、袖口和衣摆的窄留边以及 neverHide 部位保持皮肤。
4. 修复或重新贴合三套 GLB，使既有几何门同时通过：翻面 0、边长合格率 ≥99%，small close-fit P90 <5 mm；重新生成 fit、mask、preview、report 和 manifest，至少得到 `level=draft`。
5. 补测试：80 mm/25°斜向独有命中、首层所属开口环、形态学后跨 UV 岛最终像素一致、三模板 bind visible=0。主合成用例改用返修后的 80 mm 参数。
6. 完成后重新运行任务列出的四条检查，并在报告中更新三模板 visible/all、bind、几何门禁和最终 level。

## 需作者确认

无。
VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点仅新增任务允许的三个脚本、`garments/**`、`hair/**` 和任务报告，共 20 个文件；未修改基础库、依赖、门禁阈值或已批准素材。
- 无骨输入的偏航对齐：不通过 —— 契约要求“水平 PCA 宽度轴对齐 X”（[spec](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/docs/tech/11-paper-doll-3d-impl-spec.md:166)），但 [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:345) 只枚举 `-90/90/0/180°`，再按最近顶点评分选取；导入的 `pca` 未被调用。这只能处理四档朝向，不能实现任意偏航的规格能力，测试也只覆盖既有固定朝向。
- 带骨输入的分骨骨长贴合：不通过 —— 契约明确要求姿势对齐时“分骨非均匀缩放按骨长比”（[spec](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/docs/tech/11-paper-doll-3d-impl-spec.md:165)）。当前 `align_joints` 在 [fit_garment.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a4-garment/tools/model3d/dressup/fit_garment.py:415) 仅计算 `target_world @ inv(coarse @ source_world)` 的刚性逐骨变换，没有计算源/目标骨轴长度比，也没有沿骨轴缩放。现有测试只验证镜像和旋转差，未覆盖不同骨长的带骨输入。因此该公开路径无法保证不同肢段长度的衣物贴合。
- 最近面与推离诚信口径：通过 —— 使用严格几何最近三角，衣物法线只参与置信度；默认 `k=16`。每轮移动后重新查询，所有移动均记录在 `rounds[]`，未见超过 `--iters` 的隐藏校正。
- 严格 fixture：通过 —— 固定种子 102，由指定五区生成无 skin 网格；4 mm 外扩，噪声向量最大 `2.999969894 mm`，贴合前穿透率 `2.3529412%`；最终为 `fitted`，高置信率 `98.6096257%`。
- 严格距离与拓扑门：通过 —— 最终记录残留/安全距不足/翻面/退化为 `0/0/0/0`，边长合格率 `0.998636859`；独立二进制检查确认最终 GLB 结构、顶点和拓扑门相符。
- 权重、遮罩与 neverHide：通过 —— 最近三角重心权重、slot 白名单、低置信关节线段混合和 Hips 裙摆先验已实现；严格件遮罩包含躯干上下、髋及双大腿，不包含颈、手、脚。
- 三件诊断件：通过 —— 流仙裙、夜行衣、马尾均为 `draft`，真实高置信率、残留、安全距、翻面、边长及性能数据与 `fit.json` 一致；均低于 60 秒和 2 GiB。
- 跨模板 refit：通过 —— 恒等最大位差 `6e-8 mu`；非恒等最大位差 `0.000471741 mu`，严格门禁通过，目标 skin/IBM 与合成目标模板一致。
- GLB 契约：通过 —— 检查的六份蒙皮输出均为 1 个 mesh node、1 mesh、1 primitive；mesh node 无 TRS；关节顺序及 IBM payload 与相应模板逐字节一致；`_REGION` 为 u8 SCALAR；材质 unlit、双面且只引用 baseColor。
- 测试与门禁证据：通过 —— 监督日志记录 `tests_garment.py` 15/15、冻结安装成功、`pnpm check` 179/179 测试文件及 1,286/1,286 测试通过。但现有测试未覆盖上述任意偏航 PCA 和带骨骨长比缩放缺口。
- 报告：通过 —— 共 42 行、七节完整；确定性字段与当前产物一致，计时和峰值内存按协调者要求标为单次实测约值并指向对应 `fit.json`。

## 返修说明

1. 修正 `align_landmarks`：从源网格水平投影实际计算 PCA 宽度轴并旋转到 X；处理 PCA 轴正负歧义后再用语义朝向或评分选择 180° 分支。`yawDeg` 必须记录实际求得的连续角度，不能只枚举四档。
2. 修正 `align_joints`：由源、目标同名骨及有效子骨计算真实骨轴和骨长比；在源骨局部到目标 bind 骨局部的映射中沿骨轴应用非均匀长度缩放，再按原权重混合。保持最终全局变换 det=+1，并继续报告逐关节残差和姿势差。
3. 增加两个数值测试：
   - 将合成无骨网格旋转非 90° 整数倍，验证 PCA 对齐恢复正确连续 `yawDeg`；
   - 构造源/目标同名骨架但肢段长度不同的带骨衣物，验证远端顶点按骨长比变化，同时保留现有旋转及镜像断言。
4. 重跑严格件、三件诊断件、恒等/非恒等 refit、`tests_garment.py`、冻结安装及 `pnpm check`，再按最终产物同步报告的确定性数字。

## 需作者确认

无。
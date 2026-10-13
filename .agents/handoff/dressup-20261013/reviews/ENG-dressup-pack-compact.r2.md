VERDICT: FAIL

## 逐项结论

- 写集与素材范围：通过 —— 差异仅涉及任务声明的代码、四件道具及报告；已有预览图和 `sockets_check.json` 均逐字节未变。
- [pack_glb.mjs](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-pack-compact/tools/model3d/dressup/pack_glb.mjs:258)：通过 —— 会压缩所有 attributes 和 morph targets、重建索引并输出压缩前后顶点数；未增加依赖。
- 四件 GLB 压缩产物：通过 —— 独立解码验证为 8,205 / 8,334 / 7,263 / 7,764 个顶点，索引实际引用数分别与 POSITION 数相等，没有孤儿顶点；POSITION、NORMAL、TEXCOORD_0 均可逐字节回指基点 GLB。文件大小、SHA-256、manifest 和 report 输入摘要一致。
- 无损三角：通过 —— 四件的三角数未变；各三角的三个源顶点保持不变，少数首角仅发生不改变绕序的循环轮换。
- 类别语义主轴：通过 —— 帽檐外圈法线、剑刃段面积 PCA、其他类别面积 PCA 均已实现；0.999 阈值未降低，4°≈0.9976 负例和密度偏置用例存在。
- [validate.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-pack-compact/tools/model3d/dressup/validate.py:809)：不通过 —— `_prop_axis_and_anchor` 通过 `_sourcePairs` 对减面前完整源模型做相似变换，并在第 813 行以 `full_source` 计算锚点和尺寸。这正是第 2 轮裁定明令撤回的“压缩前顶点生成混合 report”，不符合“锚点从压缩后网格真实表面推导”。
- 当前表面锚点门禁：不通过 —— 禁用 `_sourcePairs` 后，现有算法从当前压缩网格算得：龙泉剑 recorded delta≈3.954e-5、斗笠 anchor norm≈2.094e-3、青锋剑 delta≈1.700e-5、玉佩 anchor norm≈1.290e-4。斗笠和玉佩直接超过 `1e-4`，两剑也不能满足 recorded-anchor 的 `atol=1e-7`；现有四份 29/29 report 是外部完整源表面掩盖这些结果后得到的。
- [validate.py 调用路径](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-pack-compact/tools/model3d/dressup/validate.py:953)：不通过 —— 标准 CLI 加载 `fit.source`、通过 GLB 内源顶点映射构造 `_sourcePairs`，随后语义锚点混用当前网格和完整源模型。
- [A3 用例](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-pack-compact/apps/game/build/dressup-assets.test.ts:365)：不通过 —— 裁定只允许在两处调用追加 `m.indices`，实际却新增 `_source_geometry`、外部 raw GLB 加载和 `_sourcePairs` 注入。三个 `*_raw.glb` 均不受 Git 跟踪，干净检出无法自包含运行该测试。
- 合成压缩用例：通过 —— 覆盖 1,000 个未引用顶点、POSITION/NORMAL/UV/JOINTS/WEIGHTS/_REGION 逐角字节相等和无孤儿顶点。
- [任务报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-pack-compact/tools/agents/reports/ENG-dressup-pack-compact.md:4)：不通过 —— 结构和 26 行限制合规，数值与产物一致；但报告明确承认使用“完整真实源表面经压缩顶点映射拟合后重算语义锚点”，同时第 25 行将这种混合结果称为标准当前-GLB 校验，不能作为本轮通过证据。
- 门禁证据：不通过 —— 报告声称全部通过，但新增 A3 路径依赖未跟踪 raw GLB，无法在仅含仓库文件的干净环境复现。审核受只读约束，未运行会写报告、临时文件或缓存的命令。

## 返修说明

1. 删除 `_prop_axis_and_anchor` 中 `_sourcePairs/full_source` 对语义锚点和尺寸的影响；该函数在传入 `faces` 时只能使用当前压缩 GLB 的 `vertices/faces`。源映射如需保留，只能用于逐字节无损几何核验。
2. 从当前表面稳定推导锚点：斗笠拟合冠顶区域，玉佩拟合顶端挂环区域；两剑也必须从当前网格得到能通过真实 recorded-anchor 门禁的握点，不得吸附、置零或注入压缩前顶点。
3. A3 用例恢复为仓库自包含：移除 `_source_geometry` 和 `_sourcePairs`，仅按裁定在原两处 `_prop_axis_and_anchor` 调用传入索引；合成密度偏置、倾斜和横移负例可继续保留。
4. 增加能证明“缺失或偏移的当前冠顶/挂环不能被完整源模型救回”的负例。
5. 用修正后的标准 CLI 对当前四个压缩 GLB 重新生成 report；如果真实表面仍未达到阈值，应如实写 fail，不得改数。随后重跑 sockets、自测与 `pnpm check`，更新报告中的实际结果。

## 需作者确认

无。
VERDICT: PASS

## 逐项结论

- 写集：通过 —— 相对基点的 35 个改动/新增文件全部位于声明范围内；未修改依赖、门禁阈值、`glb_io.py` 或 `common.py`。
- `cut_head.py --texture`：通过 —— 实现整数倍尺寸及 BOX 缩图均差校验，布局不符返回 2；按共享顶点连通分岛、统一缩放且不旋转，使用 Lanczos 重采样、重写头部 UV，并以最近有效纹素填充 gutter 和岛间空隙。
- 分析隔离：通过 —— 分类、衣领残片、切口调平、肤色匹配、身体增益、遮罩及颜色诊断仍使用内嵌贴图；高清贴图仅在分析完成后用于最终头部图集、头部 UV及按既定 `skinTint` 重烘颈片条带。
- 元数据契约：通过 —— 六份 `fit*.json` 均记录 `source.texture {path, sha256, size, factor, meanAbsDiffVsEmbedded}`；路径为仓库相对路径，哈希及 8192×8192 尺寸与本地主素材库实物一致。
- 排图与密度硬门：通过 —— 黄蓉 112 岛，覆盖率 45.4%–45.5%、线性增益 2.372–2.376；穆念慈 10 岛，覆盖率 47.2%–47.6%、线性增益 2.019–2.037。全部满足修订后的线性密度 ≥ 2 倍硬门。
- 测试覆盖：通过 —— 新增多岛不重叠/不出界/统一缩放/gutter、UV 采样误差、高清布局拒绝、CLI 退出码 2、分析隔离、条带重烘及无 `--texture` golden 回归；测试不含跳过或放宽逻辑。
- 六份真实产物：通过 —— 黄蓉、穆念慈各 medium/tall/small 均为 `level: draft`、`gateLevel: pass`，73 帧动作检查齐全；接缝 p95 < 2、ΔE < 3、G1 < 5°，bind 外露为 0，idle/walk/run 穿透最高约 0.14%。
- 分析回归：通过 —— 六份 `skinTint`、`deltaE`、`ring`、`hideMask`、`diagnostics.color`、hidemask、几何、权重、关节及颈片 UV 与 legacy 口径一致；无 `--texture` 路径有逐字节 golden。
- GLB 契约：通过 —— 独立解析六份 GLB，skin joints 顺序及 IBM 字节均与对应模板相同；`_REGION` 为 u8 SCALAR；材质为 `KHR_materials_unlit` 且仅引用 baseColor；mesh 节点无 TRS。
- manifest：通过 —— 两个 manifest 的三体型登记、状态、顶点/三角数、文件大小与 SHA-256 均与实际产物一致。
- 图片质检：通过 —— 已检查六份 preview 和六张 density 对照。medium 近景中眉、睫毛、虹膜及发丝清晰度提升明显；small/tall 全身比例稳定，未见新增发际线、耳后、颈缝或 mip 渗色。
- 报告：通过 —— 7 节齐全、共 50 行，真实产物数值、校验结果、`--texture` 用法及 `tpl_f2_*` 后续重切路径均已如实登记。
- 校验证据：通过 —— 最新 supervise 校验于 2026-10-11 16:42 返回 rc=0；报告记录 `tests_head.py` 30/30、`selftest.py` 7 项、六份 report、`pnpm install --frozen-lockfile` 和 `pnpm check` 全部通过。

## 需作者确认

无。
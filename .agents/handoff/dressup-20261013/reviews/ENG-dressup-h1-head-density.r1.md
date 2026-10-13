VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点的全部改动均位于声明范围内，未修改 `glb_io.py`、`common.py`、门禁阈值或依赖；没有已批准素材被改动。
- `cut_head.py` 图集算法：通过 —— 实现了高清贴图整数倍/均差校验、共享顶点连通岛、统一缩放无旋转排布、Lanczos 重采样、UV 改写和最近纹素外扩；六份诊断记录 10/112 个岛、覆盖率 45.4%–47.6%、线性增益 2.019–2.376 倍。
- `fit.source.texture` 契约：不通过 —— 任务明确要求 `texture {path, sha256, size}`，实际由 `cut_head.py:1994` 写成 `texture.file`；六份 `fit*.json:11-16` 均缺少 `path`。
- 高清分支分析隔离：不通过 —— `cut_head.py:2897-2909` 用高清排布后的 `canvas/head_uv_final` 参与 `bake_strip → gainSeamMean → skinTint`，使本应继续使用内嵌贴图的肤色匹配结果变化。例：黄蓉 medium 的 `skinTint` 从 `[0.935942175,0.866535287,0.858594717]` 变为 `[0.934092046,0.864813446,0.856640970]`；穆念慈 medium 也从 `[1.074357540,1.040832932,1.083564030]` 变为 `[1.073202357,1.039810154,1.081753429]`。这不满足“分析仍用内嵌贴图、只有最终头部图集内容与头部 UV 改变”。
- `tests_head.py` 验收覆盖：不通过 —— `tests_head.py:1183-1190` 只直接捕获 `TextureMismatch`，未验证 CLI 对布局不符实际返回退出码 2；`tests_head.py:1209-1224` 只比较 packed/legacy 的几何、索引、权重和颈片 UV，未落实“无 `--texture` 输出与旧版逐字节一致”的自动回归，也未直接断言实际排布的 gutter ≥ 2 px。
- 六份产物门禁：通过 —— 全部为 `gateLevel: pass`、`level: draft`；接缝 p95 均 < 2、ΔE 最大 0.130、G1 最大 3.335°、bind 穿透为 0，idle/walk/run 最大约 0.14%。
- GLB 契约：通过 —— 六份 `skin.joints` 顺序及 inverseBindMatrices 均与对应模板逐字节一致；`_REGION` 为 u8 SCALAR；材质为 `KHR_materials_unlit` 且没有 normal/metallicRoughness 贴图引用。
- 本地 8K 素材：部分通过 —— 两张 JPEG 均为 8192²，哈希与六份 fit 一致，并且是两份 raw GLB 内嵌 baseColor 的原始字节。黄蓉 raw 几何/UV/索引与切头源一致；穆念慈 raw 则与 `source/tripo_rig.glb` 一致，不与实际切头源 `source/tripo_rig_s07.glb` 一致：前者为 100,785 顶点/189,024 三角，后者为 72,297 顶点/132,316 三角。贴图布局校验仍通过，但报告第 15 行“两份与现有源件顶点/UV/索引逐字节相同”表述不实。
- 图片质检：通过 —— 已逐张查看六份 density 对照及未附 preview/self-check；medium 近景可见虹膜、睫毛、眉毛和发丝清晰度提升，small/tall 有全身对照，未见新增发际线、颈缝或 mip 渗色。
- 校验命令：通过 —— supervise 于 2026-10-11 10:49 执行 `finish --no-commit` 返回 rc=0，覆盖 `tests_head.py`、`selftest.py`、六份 report 检查、`pnpm install --frozen-lockfile` 和 `pnpm check`。
- 任务报告：不通过 —— 7 节和 41 行上限合格，但第 2 节未列每条验收命令的实际输出摘要；第 3 节未列六份真实产物的顶点数、三角数和约束残差，并含上述穆念慈 raw/source 错误陈述。

## 返修说明

1. 将 `fit.source.texture` 按任务契约写出 `path`；若要兼容现有 `file` 读取方，可暂时同时保留两者，并让测试核对 `path` 为仓库相对路径。
2. 把肤色、切口增益及门禁分析固定在内嵌贴图的 legacy canvas/UV 上；高清 canvas 只能在分析结束后用于最终头部排图。重切六份后确认 `skinTint`、几何、权重、遮罩和颈片 UV 与无 `--texture` 基线一致。
3. 补自动测试：
   - 通过 `main(argv)` 或子进程断言坏贴图退出码确为 2，且输出含原因；
   - 对合成资产保存 legacy golden，断言无 `--texture` 的 GLB、遮罩、preview/self-check 逐字节一致，fit 排除 `durationMs` 后一致；
   - 从 packed 后实际岛包围盒断言不重叠、在画布内、统一缩放且 gutter ≥ 2 px。
4. 修正报告：说明穆念慈 raw GLB 匹配的是 `tripo_rig.glb`，而 `tripo_rig_s07.glb` 仅沿用同一 UV 贴图布局；补六份顶点/三角/残差以及全部验收命令的实际通过摘要。
5. 重新生成六份产物并完整运行任务的六组校验命令。

## 需作者确认

无。
# ENG-dressup-a3-prop 报告 · 3D 纸娃娃换装 · A3 · 刚性道具归一化 normalize_prop.py（剑 / 斗笠 / 玉佩实跑）

## 1. 摘要（3–6 行）

完成刚性道具 CLI、纯几何 API、5 项回归，并实跑青锋剑、竹斗笠、玉佩。
本轮修复 POSITION 接缝焊接、真实组件 `--keep largest`、焊接边界统计及 float32 锚点残差。
三件均为焊接几何 1 块、锚点残差 < `1e-9 mu`、`up=+Y`；实跑与全仓门禁全绿。
原始 Tripo 高模仍远超小件 ≤ 1 万三角目标，留给后续 `pack_glb.mjs`，本任务未擅自减面或改贴图。

## 2. 产出（文件、行数、主要章节）

- `tools/model3d/dressup/normalize_prop.py`（498 行）：CLI、节点烘焙、POSITION 焊接拓扑、PCA / 语义锚点、尺度、unlit GLB 与 fit。
- `tools/model3d/dressup/tests_prop.py`（175 行）：接缝盒、多组件、keep-largest、斜剑、锥体及三件检入产物回归。
- `assets/default/model3d/dressup/props/`：3 个 `<id>.glb` + 3 个 `fit.json`，共 61,295,002 bytes；按要求未写 manifest。
- 验收：`pnpm install --frozen-lockfile` 退出 0（lockfile 已最新）；`tests_prop.py` 5/5；三件 CLI 3/3；`pnpm check` 退出 0。
- `pnpm check` 摘要：178 files / 1272 tests；1777 内容文件、1708 对象、2 Ink、65 地图有效；4 故事编译测试；size 全 PASS。

## 3. 关键结论与数值

- 共用当前正本：`heightMu=1.65/1.684441398≈0.979553`，故 `mPerMu=1.684441398`；尺度严格按 `realSizeM/(measuredLengthMu×mPerMu)`。
- 青锋剑：157,844 顶点 / 289,300 三角 / 焊接 1 块；`1.441032896 mu`，`scale=0.411974370`；柄端前三段中位宽 0.1047 < 另一端 0.1887；锚点 `7.82e-10 mu`，主轴与 +Y / 第二轴与 +Z 残差 `≤2.23e-16`；尺寸误差 `-6.71e-8 m`；3.87 s；20,797,324 B。
- 竹斗笠：160,426 顶点 / 285,748 三角 / 焊接 1 块；width `0.953571626 mu`，`scale=0.280158167`；三 PCA 轴比较端宽不对称度，窄高端为锥顶且 y≤0；锚点 `1.09e-11 mu`，高度轴残差 `2.23e-16`；尺寸误差 `-5.82e-11 m`；3.80 s；22,220,472 B。
- 玉佩：159,289 顶点 / 286,012 三角 / 焊接 1 块；`0.999062362 mu`，`scale=0.047538063`；PCA 主轴 +Y 后取最高 1% 簇质心；锚点 `3.30e-12 mu`，主轴残差 0；尺寸误差 `+2.92e-9 m`；3.68 s；18,272,568 B。
- 与 spec 一致：真实尺寸、主轴/帽高轴、语义锚点、socket、unlit、baseColor-only、输入/正本 SHA-256、退出码 0/2。实现偏离：无；环境版本偏离任务声明的 pnpm 12，实际 `pnpm install` 为 9.15.9，但锁文件门禁通过且本任务未改工具链。

## 4. 开放问题（附默认值）

- A3-O01：高模三件分别约 28.6–28.9 万三角且 baseColor 为 8192²；默认本任务保真，后续 `textures.py + pack_glb.mjs` 降到 ≤2048²、≤1 万三角。
- A3-O02：无 skeleton 时 `--default-height-m` 默认 1.65，并以 `--body` 实际世界 Y 高换算；模板正式切换后默认重跑全部 fit。
- A3-O03：fan / scroll / beads / gourd 暂按 generic AABB 中心；默认待首件真实资产到位再以 spec 规则扩充语义锚点。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 AR-102 与 `tech/11` §5.2，不需要修改设计基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `.claude/skills/dressup-3d/SKILL.md` / A3：后续登记本 CLI、三类命令、退出码、`--keep all` 与重跑规则。
- B1 运行时类型 / `DressupFit`：直接消费 `schema/kind/class/id`、`anchor/forward/up`、`socket`、`gripAdjust.pos/quat`；`source/body/realSizeM/sizeAxis/measuredLengthMu/mPerMu/scaleApplied/stats/diagnostics` 仅校验与审计。
- A4/A5 压包 / 道具入库：对三件跑贴图缩小、减面、meshopt、validate，再写 manifest；不得把本次高模直接视为最终预算通过。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 只改允许路径；未执行改变仓库状态的 git 命令；无绝对路径写死、无 manifest、无新增依赖。
- ✅ CLI 参数齐全，支持 body/skeleton、flip、keep、JSON；meshopt 自动解压；输出 GLB 节点无 TRS。
- ✅ 重复接缝闭合盒=1 块、分离盒=2 块；`--keep largest` CLI 完整保留较大盒 12 三角；焊接边界=0。
- ✅ 合成剑验证柄端、握点、+Y、缩放与逐字节确定性；合成锥验证锥顶原点和开口 −Y。
- ✅ 三件命令退出 0；`fit.json` 锚点为从最终 float32 几何复算的真实残差且 <1e-4；`up=+Y`。
- ✅ 图片逐字节对拍 baseColor 相等；每件只余一张 baseColor，材料全 unlit；ORM / normal 未进入输出。
- ✅ B1 消费字段清单：`schema/kind/class/id`、`anchor/forward/up`、`socket`、`gripAdjust.pos/quat`；其余字段只作校验与审计。
- ✅ `pnpm install --frozen-lockfile`、`python3 tools/model3d/dressup/tests_prop.py`（5/5）、`pnpm check` 实际通过。
- ⚠️ 小件三角与贴图预算尚未通过；属于后续压包职责，具体数字已在 §3/§4 如实登记。

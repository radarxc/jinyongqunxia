VERDICT: FAIL

## 逐项结论

- 写集与素材保护：通过 —— 所有改动均在允许路径内；正本 `body.glb` 未改，实际 SHA-256 仍为 `647c674f…1748`，与 manifest 一致；没有新增图片或修改已批准素材。
- AR-102 / 依赖约束：通过 —— 未依赖 Blender、未新增 pip 包、没有硬编码 `/Users/...`，Node 侧只新增 `meshoptimizer@1.3.0`。
- CLI 基础检查：通过 —— 四个 `--help`、`node --check`、两个 TS 文件的 ESLint 均退出 0。
- `validate.py` 与真实 prop 契约：不通过 —— [validate.py:271](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:271) 对所有 kind 强制读取衣物专用的 `pushOut.flippedTriangles/stretchOutliers`；但 spec §5.2 与 A3 三件真实 prop 的 `fit.json` 只有 `stats`。只读实测三件均得到 `geometry.flippedTriangles=-1`、`geometry.metricsPresent=false`。测试在 [dressup-assets.test.ts:156](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.test.ts:156) 人工给 prop 塞入不存在于 A3 契约的 `pushOut`，掩盖了该问题。
- 道具方向门禁：不通过 —— [validate.py:308](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:308) 始终以最大 PCA 轴判定 `+Y`。真实竹斗笠的最大轴是帽檐宽度，实测 alignment 仅 `2.03e-10`，会被拒；hat 应按锥顶—开口的语义高度轴校验。
- 几何质量门禁：不通过 —— [validate.py:271](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:271) 在没有 `sourcePositions` 时直接信任 `fit.json` 自报的翻面和拉伸计数，没有从源件与最终几何独立核算。伪造 `flippedTriangles: 0, stretchOutliers: 0` 即可通过，不满足“每件资产必须过 validate”的门禁含义。
- `pack_glb.mjs --simplify` 刚性件支持：不通过 —— [pack_glb.mjs:117](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:117) 无条件要求 `JOINTS_0/WEIGHTS_0`。A3 三件真实 prop 均为无 skin 的 `POSITION/NORMAL/TEXCOORD_0` 刚性网格，因此全部无法减面，直接阻断其达到小件 ≤1 万三角的预算。
- 减面属性与区域边界：不通过 —— [pack_glb.mjs:124](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:124) 只把 UV 作为误差通道，未按题面把 `WEIGHTS_0` 纳入；同时 [pack_glb.mjs:88](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:88) 只锁 `_REGION` 边界，没有完成 A2 交接要求的跨区三角拆点。现正本有 4,101 个跨区三角，运行时 `flat varying` 会按 provoking vertex 错误隐藏整三角。
- `textures.py`：通过 —— [textures.py:77](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/textures.py:77) 会重建 bufferView/BIN、重排 accessor 引用、只保留 baseColor JPEG，并加入 `KHR_materials_unlit`，不是只修改 JSON 元数据。
- `ingest.py`：不通过 —— report level/status 映射及限定路径提交逻辑基本符合规格，但 [ingest.py:107](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:107) 直接把未经校验的 `id` 拼入目标路径。含 `/` 或 `..` 的 ID 可写出声明目录，违反 ID 和写集边界要求。
- `publishDressupAssets`：通过 —— [dressup-assets.ts:65](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.ts:65) 签名正确，只消费 `file/fit/report/status`，支持 `fits`，跳过顶层及变体 `rejected`，并限制复制路径。
- 测试与报告证据：不通过 —— 现有四个测试未直接调用 `textures.py` 或 `ingest.py`，也没有刚性 prop 减面、真实 A3 fit、hat 语义轴、跨区拆点回归。报告 [ENG-dressup-a5-gate.md:22](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/agents/reports/ENG-dressup-a5-gate.md:22) 的唯一 `report.level` 是合成件；正本压包数字缺少监督要求的真实顶点、残差、耗时和锚点校验。报告虽声称 `pnpm check` 全绿，但上述功能缺口未被测试覆盖；本次只读审核未重跑会生成构建产物的完整门禁。

## 返修说明

1. 按 kind 重写 `validate.py` 的几何和道具门禁：

   - garment/hair/refit 必须用真实源几何与最终几何计算翻面、边长比和贴身区 p90，不能只信任计数字段。
   - prop 要兼容 spec §5.2 的真实 `fit.json`；刚性相似变换的几何质量应按其正确语义核验。
   - weapon 用长度轴，hat 用锥顶—开口高度轴，pendant/pouch 用绳顶语义轴；补三类真实格式正负例。
   - 增加 `_REGION` 必须为 u8 SCALAR、skin/IBM、材质和禁区的产物级回归。

2. 修复 `pack_glb.mjs`：

   - 无 skin 的 prop 可以 `--simplify`；蒙皮件才要求 JOINTS/WEIGHTS。
   - UV 与 WEIGHTS 进入误差通道，JOINTS 和 `_REGION` 不作为误差通道；继续保留 `vertex_lock` 与 `LockBorder`。
   - 在减面前完成区域边界拆点，保证每个三角三个 `_REGION` 值相同，再只重建索引。
   - 新增真实格式刚性 prop 回归、蒙皮属性/IBM 逐字节回归及跨区三角回归。

3. `ingest.py` 必须拒绝空 ID、绝对路径、分隔符、`.`/`..`，并在创建目录前用解析后的路径确认目标仍位于 `assets/default/model3d/dressup/<kind>/` 下。

4. 补 `textures.py` 和 `ingest.py` 的直接测试：验证 normal/MR 图片及 BIN 块确实删除、索引重排、JPEG 尺寸/unlit，以及 fail report 拒绝、status 映射、manifest 字段和路径逃逸拒绝。

5. 依赖资产合入后，对真实 A3/A4 资产逐件执行 textures、pack、validate、ingest；报告逐件列出 `report.level`、三段动画穿透率、顶点/三角、几何残差、耗时和锚点值。最后重新运行冻结安装、`selftest.py`、四个帮助命令及完整 `pnpm check`，如实更新报告。

## 需作者确认

无。
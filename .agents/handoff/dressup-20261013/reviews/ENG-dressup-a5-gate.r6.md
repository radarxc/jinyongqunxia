VERDICT: FAIL

## 逐项结论

- 写集与依赖：通过 —— 改动均位于允许路径；唯一新增直接依赖为 `meshoptimizer@1.3.0`，未发现 Blender、新 pip 包、绝对路径或其他禁区做法。
- `validate.py` 的骨架、动画与穿透检查：部分通过 —— 实现了同骨架 idle/walk/run 各 24 帧、LINEAR/STEP 插值、CUBICSPLINE 拒绝、全顶点分块调用 `common.signed_distance`，并检查 IBM、权重、遮罩、几何、材质、预算和道具语义。
- `validate.py` 的 `_REGION` 门禁：不通过 —— [validate.py:686](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:686) 对所有资产都调用 `_region_check(..., False)`；[validate.py:575](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:575) 会允许蒙皮件完全缺少 `_REGION`。这与补充验收“蒙皮件 `_REGION` 为 u8 SCALAR”不符。
- `validate.py` 的最多四骨检查：不通过 —— 读取层和门禁只消费 `JOINTS_0/WEIGHTS_0`，没有拒绝额外的 `JOINTS_1/WEIGHTS_1`；因此含八骨影响的资产可能只检查前四骨后通过，不满足“每顶点 ≤4 骨”。
- `pack_glb.mjs --simplify`：不通过 —— [pack_glb.mjs:103–130](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:103) 会为跨区域三角复制顶点并重写所有顶点 accessor，[pack_glb.mjs:177](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:177) 在减面前实际调用该逻辑。报告也记录正本“区域拆点 4173”。这直接违反“减面只重建索引不改顶点”；测试 [dressup-assets.test.ts:445](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.test.ts:445) 反而把 `regionSplitVertices > 0` 当成正确结果。
- `textures.py`：通过 —— 静态核对确认仅保留 baseColor、转 JPEG、重建 BIN/bufferView 索引、添加 `KHR_materials_unlit`，衣物/发型可设 `doubleSided`。
- `ingest.py` 单模板入库：通过 —— 会核对 report schema、subject、全部必需检查和 GLB/fit 摘要，approved/draft 状态映射正确，默认不提交。
- `ingest.py` 跨模板变体：不通过 —— [ingest.py:189–203](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:189) 虽生成 `fit.<template>.json` 名称，但仅首个模板复制 fit；后续变体只复制 GLB/report，且 `fits.<template>` 没有 `fit` 字段。对应 report 的 `inputs.fit` 哈希因此没有入库文件可复核，也不满足“复制 glb / fit.json / report.json”。
- `publishDressupAssets`：部分通过 —— 函数签名、递归扫描、拒绝 `rejected`、路径约束和引用登记符合要求；但 [dressup-assets.ts:80–81](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.ts:80) 对 `fits` 变体只发布 file/report，不发布 fit，延续了上述入库缺口。
- 三件真实道具产物：通过 —— GLB/fit/report/manifest 的 SHA、体积、三角数和状态相互一致；三件均为 `approved → candidate`，材质为 unlit、仅 baseColor、贴图 2048²、无节点 TRS，最终三角数分别为 8568、8676、8580。
- 报告：不通过 —— 七节齐全且 55 行，但第 50 行宣称“只重建索引”，与实际复制顶点及第 27 行“区域拆点 4173”矛盾；第 35、52 行声明变体 fit 命名/manifest 最终形态，却未实际复制或发布变体 fit。
- 校验证据：不通过 —— 四个 `--help` 本次只读复核均退出 0，`git diff --check` 通过；但现有 14 条测试把顶点拆分视为成功，且跨模板测试只断言 GLB/report、不检查变体 fit，因此即使记录中的 `pnpm check` 全绿，也未覆盖上述契约错误。

## 返修说明

1. 修改 `pack_glb.mjs`：删除减面阶段的 `splitRegionTriangles`、顶点复制和 accessor 扩充；`--simplify` 必须保持所有顶点 accessor 的 count 和原字节不变，只新增索引 accessor。用 `vertex_lock` 锁拓扑边界、颈环和区域边界；输入区域拓扑不满足前置契约时应明确报错，不能在 pack 中偷偷改顶点。
2. 修改 `validate.py`：蒙皮资产必须要求每个 primitive 都有 `_REGION`，且为非 normalized 的 u8 SCALAR；显式拒绝 `JOINTS_1/WEIGHTS_1` 或任何使单顶点超过四骨的附加影响通道。
3. 修改 `ingest.py`：每个模板变体都复制自己的 fit；`fits.<template>` 增加 `fit`，并把目标冲突检查覆盖 GLB、fit、report 三个文件。
4. 修改 `dressup-assets.ts`：变体同样只按允许的四个字段扫描，但应复制 `variant.file / variant.fit / variant.report`。
5. 更新测试：断言 pack 前后顶点数及 POSITION/UV/JOINTS/WEIGHTS/_REGION 原字节完全相同；缺 `_REGION` 和 `JOINTS_1/WEIGHTS_1` 的蒙皮件必须 fail；三模板入库后逐一检查 fit 文件存在、哈希与各 report 一致，并检查发布列表包含非 rejected 变体 fit。
6. 修正后重新跑正本副本与三件道具的 textures→pack→validate→ingest，刷新 GLB、report、manifest 哈希和报告数字，再执行四个帮助命令、专项测试、冻结安装及完整 `pnpm check`。

## 需作者确认

无。
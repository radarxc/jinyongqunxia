VERDICT: FAIL

## 逐项结论

- 写集与正本保护：通过 —— 相对基点 `a95cfcf15766aa6803ce5d29ce5e7684f99f6192`，改动均位于允许路径；`body.glb` 未变，SHA-256 为 `647c674f2e3139d407714ead2fef5ddfa2abb05643d5cfdee2f730cdafb31748`；`git diff --check` 通过。
- 依赖与禁区：通过 —— Node 侧只新增 `meshoptimizer@1.3.0`，未发现 Blender、新 pip 包、绝对 `/Users/...` 路径或 spec §11 禁止方案。
- `validate.py` 穿透门禁：不通过 —— [validate.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:201) 的动态检查及 [validate.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:491) 的 bind-pose 检查都把装备顶点截断至最多 30,000 个。spec §6 要求按装备顶点计算穿透占比且 bind 残差为零；当前实现可能漏掉未采样的穿透顶点，不能作为强制入库门禁。
- `ingest.py` validate 强制门禁：不通过 —— [ingest.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:58) 只核对报告 schema 和 `level`，没有要求 `checks` 完整且全部 `pass: true`，也没有核对报告对应的 GLB、fit、kind/id。伪造或属于旧文件的 `approved` 报告可直接进入复制和 manifest 流程，违反 AR-103。
- 入库测试：不通过 —— [dressup-assets.test.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.test.ts:136) 主动构造了没有 `pass` 字段、只有 `budget.triangles` 的伪报告，并断言 `approved`/`draft` 入库成功；测试将上述门禁绕过固化成了预期行为。
- A3/A4 真实产物实跑：不通过 —— 执行结束前已有 `cloth_xianxia_dress`、`cloth_black_assassin` 和 `hair_ponytail`，但报告只记录 `cloth_xianxia_dress`；缺少后两件逐件 validate、ingest 以及 idle/walk/run 动态穿透分段数值，不满足“已有产物逐件 validate 并 ingest”。
- `textures.py`：通过 —— 会重建 BIN、删除 normal/metallicRoughness 贴图及关联 image/bufferView、重排索引、缩放并转 JPEG，仅保留 baseColor，且加入 `KHR_materials_unlit`。
- `pack_glb.mjs`：通过 —— 使用 Three simplifier、`LockBorder` 和颈环/区域边界锁定，仅重建索引；UV、JOINTS、WEIGHTS、`_REGION` 随索引保留，并完成 `EXT_meshopt_compression` 编码及前后体积/三角输出。
- `publishDressupAssets`：通过 —— 签名符合要求，扫描 `file`、`fit`、`report`、`status`，并跳过 `rejected`。
- 检查命令：通过 —— 四个 CLI `--help` 均实测退出 0；执行日志记录 `pnpm install --frozen-lockfile` 和完整 `pnpm check` 通过，Vitest 为 179 个文件、1280 项测试通过。
- 报告结构：部分通过 —— 7 节齐全且共 56 行，接口与 B1 接线点已写明；但真实资产覆盖和逐件门禁数值不完整，因此内容验收不通过。

## 返修说明

1. 修复 `ingest.py`：只有报告检查项完整且全部明确为 `pass: true` 时才允许入库；同时校验报告与待复制 GLB、fit、kind/id 的绑定。建议由 `validate.py` 输出输入文件摘要，`ingest.py` 重算并比对，防止复用旧报告或替换资产。
2. 改写对应测试：伪报告、缺少 `pass`、任一检查失败、资产或 fit 摘要不一致都必须拒绝；保留真实 validator 报告的 approved/draft 成功用例。
3. 删除 30,000 顶点截断。可以分块计算距离以控制内存，但 bind pose 和每段动画的 24 帧都必须覆盖全部装备顶点。
4. 对现有 `cloth_xianxia_dress`、`cloth_black_assassin`、`hair_ponytail` 逐件执行 validate 和 ingest，并在报告第 3 节记录每件 `report.level`、各检查值及 idle/walk/run 穿透占比。
5. 返修后重新通过四个 CLI 帮助命令、`pnpm install --frozen-lockfile` 和完整 `pnpm check`。

## 需作者确认

无
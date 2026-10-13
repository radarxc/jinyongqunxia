VERDICT: FAIL

## 逐项结论

- 写集与依赖：通过 —— 改动均在允许路径内；Node 侧仅新增 `meshoptimizer@1.3.0`；未修改公共库、`content-plugin.ts`、`node_modules`，未使用 Blender。
- 三件刚性道具：通过 —— 青锋剑、竹斗笠、玉佩均按 T2 正本重制；实际 GLB 与 manifest/report 的 SHA、大小和三角数一致，均为 `approved → candidate`。资产为单 mesh、无节点 TRS、unlit、仅保留 baseColor JPEG，并包含 meshopt 压缩。
- `textures.py`：通过 —— 会缩放并转存 baseColor JPEG，移除 normal/metallicRoughness 的引用和实际 BIN 数据，重排索引并添加 `KHR_materials_unlit`。
- `pack_glb.mjs`：通过 —— 符合最新裁定：仅新增索引 accessor，不拆点、不复制顶点、不改变顶点 accessor 的 count 或字节；使用 `LockBorder` 和 vertex lock，`JOINTS/_REGION` 未作为误差通道。
- `apps/game/build/dressup-assets.ts`：通过 —— `publishDressupAssets(root, copy, copied?, references?)` 只读取 `file/fit/report/status`，复制非 rejected 的顶层资产和模板变体。
- `ingest.py` 模板门禁：不通过 —— [`_report()`](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:84) 不接收或核验 `--template`；[`ingest()`](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:179) 随后直接把调用参数写成 `fits.<template>`。只读复现确认现有 `tpl_f_medium` 报告不含模板字段却会被 `_report()` 接受；测试还把三份同样基于 medium 正本生成的报告分别登记成 small/medium/tall。这允许未经目标模板 validate 的资产伪装成该模板变体，违反“每模板一份文件与报告”和 AR-103。
- `validate.py` 非法蒙皮负例：不通过 —— [`_skinning_checks()`](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:375) 能记录越界关节失败，但 [`validate()`](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:672) 未在失败后停止，仍调用动态穿透。内存复现得到 `weights.jointIndices=false` 后抛出 `ValueError: joints 含越界关节索引`；[`main()`](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:766) 因此返回输入错误码 2，且不会写 `level=fail` 的 report，而不是门禁失败码 3。现有测试只调用内部 helper，未覆盖完整 CLI 行为。
- 蒙皮合成测试覆盖：部分通过 —— garment/hair 正例、动态 72 帧、穿透、翻面、缺 `_REGION`、附加骨通道等已有覆盖；但越界关节的完整 CLI 回归缺失，未发现上述错误码和报告缺失问题。
- 报告：不通过 —— [`ENG-dressup-a5-gate.md`](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/agents/reports/ENG-dressup-a5-gate.md:22) 有三件真实资产的三角数、残差和锚点数据，但没有逐件顶点数及执行耗时，不满足补充审核要点要求的“顶点 / 三角 / 残差 / 耗时 / 锚点校验”；第 13 行还把测试文件记为 549 行，实际为 563 行。报告七节齐全且共 55 行。
- 验收命令：部分通过 —— 四个 `--help`、JavaScript 语法、Python AST 和 `git diff --check` 均通过；监督日志显示冻结安装及完整 `pnpm check` 通过，共 179/179 个测试文件、1286/1286 项测试。但绿色测试未覆盖上述两个门禁漏洞，不能据此放行。

## 返修说明

1. 在 report/fit 中建立可验证的模板身份，并让 `ingest.py` 将其与 `--template` 严格比对。目标模板不一致或身份缺失时拒绝入库；测试必须分别用真正绑定 small、medium、tall 正本的报告，另加“medium 报告冒充 small 必须失败”的负例。
2. `validate.py` 在骨架、IBM、蒙皮属性、权重或关节索引检查失败后，不得继续执行依赖合法 LBS 输入的动态穿透。应生成包含失败检查项的 `level=fail` report 并退出 3。增加完整 CLI 回归，断言越界关节、IBM 数量错误等负例均写出报告且返回 3。
3. 报告第 3 节补齐三件真实道具各自的顶点数和实测耗时；修正测试文件行数。数值须来自实际产物或命令输出。
4. 修复后重新运行四个帮助命令、专项测试、冻结安装和完整 `pnpm check`，并把实际结果更新到报告。

## 需作者确认

无。
VERDICT: FAIL

## 逐项结论

- 写集与依赖：通过 —— 改动均位于允许路径；Node 侧仅新增 `meshoptimizer@1.3.0`，未改已批准 GLB、正本、`common.py`、`glb_io.py` 或 `content-plugin.ts`。
- 禁止项与实现边界：通过 —— 未引入 Blender、新 pip 包、绝对用户路径或任务列出的错误配对方式；装备动画直接使用模板 clip。
- `textures.py` / `pack_glb.mjs`：通过 —— 实现了贴图压缩与 BIN 重建、unlit/baseColor-only、索引减面、离散属性边界锁定和 meshopt 编码；已有解码回环测试。
- `ingest.py` / `dressup-assets.ts`：通过 —— fail 报告拒绝入库，支持模板变体追加；发布器签名和 rejected 跳过行为符合要求。
- 自动检查：通过 —— 四个 CLI `--help` 均退出 0；最新记录中的冻结安装和完整 `pnpm check` 全绿，共 179 个测试文件、1285 项测试。
- `validate.py` 的正本绑定门禁：不通过 —— `tools/model3d/dressup/validate.py:542-561` 读取 body、skeleton、fit 后，没有验证 `fit.body.sha256` 是否等于实际 body，也没有校验 skeleton 的 body SHA、fit/skeleton schema 和 `mPerMu = defaultHeightM / heightMu` 的一致性。三件真实 A3 `fit.json` 均仍绑定旧正本 SHA `647c674f…1748`、`mPerMu=1.684441398`，而当前正本是 `1be19e87…066f`，当前 skeleton 为 `mPerMu=1.69370027`。因此旧模板 fit 会被新 T2 正本门禁接受，不能满足 AR-103“每件资产必须通过有效 validate 才能入库”。
- A3 真实实跑证据：不通过 —— `tools/agents/reports/ENG-dressup-a5-gate.md:21-28` 虽列出顶点、三角、残差和锚点摘要，但未列每件执行耗时，也未逐件给出任务要求的各项检查值；更关键的是这些实跑建立在上述旧 fit/新正本未校验的组合上，不能作为有效的新正本验收证据。
- 报告结构与交接：部分通过 —— 7 节齐全、55 行且写明发布器签名和 B1 接线点，但第 3 节实跑证据不完整。

## 返修说明

1. 在 `validate.py` 增加输入身份与单位门禁：

   - 校验实际 `body.glb` SHA-256 与 `skeleton.json`、`fit.json` 声明的 body SHA 完全一致。
   - 校验 fit 所属模板、必要 schema/字段及 skeleton 来源。
   - 强制校验 `mPerMu = defaultHeightM / heightMu`，并要求 fit 与 skeleton 的换算值在明确数值容差内一致。
   - 任一不一致必须产生失败 check，并以退出码 3 结束。

2. 增加负例测试：旧 body SHA、错误 skeleton SHA、错误 `mPerMu`、缺失绑定字段均必须失败，不能只验证 report 摘要防伪。

3. 按当前 T2 正本重新生成或更新三件 A3 的 fit，再依次重跑 validate → textures → pack → ingest；不得继续用 `647c674f…1748` 的旧 fit 作为新正本通过证据。

4. 更新三份 report 和任务报告第 3 节，逐件列出 report.level、全部检查结果/数值、执行耗时以及压包前后体积和三角数；最后重跑专项测试、四个帮助命令和完整 `pnpm check`。

复现核对：

```sh
rg -n '"sha256"|"mPerMu"' assets/default/model3d/dressup/props/*/fit.json
rg -n '"sha256"|"defaultHeightM"|"heightMu"|"mPerMu"' assets/default/model3d/dressup/templates/tpl_f_medium/skeleton.json
nl -ba tools/model3d/dressup/validate.py | sed -n '542,575p'
```

## 需作者确认

无。
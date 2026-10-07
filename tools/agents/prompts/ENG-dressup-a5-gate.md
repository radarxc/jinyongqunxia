# 本任务：3D 纸娃娃换装 · 阶段 A5 · 门禁与进包（validate / textures / pack_glb / ingest / dressup-assets；AR-102 / AR-103）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§3、§5.5、§6、§7、§11）、`tools/model3d/dressup/README.md`、A1 报告第 7 节；参考 `apps/game/build/battle-model-assets.ts`（manifest 扫描方式）与 `tools/model3d/ingest.py`（既有 model3d manifest 字段与提交方式）。

## 作者要求
**AR-103**：门禁由执行器把控——每件换装资产必须过 validate 才能入库，`pnpm check` 全绿。**AR-102**：不依赖 Blender。

## 规格
- spec §6 门禁阈值与 `report.json`；§7 `manifest.yaml` 与进包；§5.5 材质与面数目标。
- 动态穿透：对模板 idle / walk / run 各采 24 帧，自己从 GLB 读 animation sampler（LINEAR 插值；CUBICSPLINE 报不支持），**装备与模板同骨架，直接用模板 clip，不做任何 retarget**；带符号距离 < −1 mm 为穿透。
- Node 侧允许且只允许新增一个 devDependency：`meshoptimizer`（1.3.x，`pnpm add -Dw`），供 `pack_glb.mjs` 编码；减面用 three 自带 `three/examples/jsm/libs/meshopt_simplifier.module.js`。

## 要做的事
1. `tools/model3d/dressup/validate.py --body <正本> --skeleton <skeleton.json> --asset <glb> --fit <fit.json> --out <report.json> [--level draft|approved] [--json]`：spec §6 全部检查，退出码 0（approved / draft）或 3（fail）。
2. `tools/model3d/dressup/textures.py <in.glb> <out.glb> [--max 2048] [--quality 85] [--double-sided]`：basecolor 缩到 ≤ 2048² JPEG；删除 normal / metallicRoughness 的 texture / image / bufferView 并真正从 BIN 删块、重排索引；加 `KHR_materials_unlit`。
3. `tools/model3d/dressup/pack_glb.mjs <in.glb> <out.glb> [--simplify <ratio>] [--no-meshopt]`：可选减面（LockBorder，保留 UV / JOINTS / WEIGHTS / _REGION，蒙皮属性一并重采样），EXT_meshopt_compression 编码；打印前后三角数与体积。
4. `tools/model3d/dressup/ingest.py <kind> <id> --src <dir> [--template tpl_f_medium] [--slot body] [--item eq_xxx] [--commit]`：按 spec §7 写 `assets/default/model3d/dressup/<kind>/<id>/manifest.yaml`（status 由 report.level 决定），复制 glb / fit.json / report.json，`--commit` 时只按该目录路径提交（撞 index.lock 重试），默认不提交。
5. `apps/game/build/dressup-assets.ts`：`publishDressupAssets(root, copy, copied?, references?)`，只扫 `file / fit / report / status` 四个字段；`apps/game/build/dressup-assets.test.ts` 用临时目录造 manifest 验证复制与 `rejected` 跳过。**不要改 `content-plugin.ts`**（B1 负责接线）。
6. 实跑：
   - 若工作区已有 A3 / A4 产物（`assets/default/model3d/dressup/{props,garments,hair}/*`），逐件 validate 并 ingest（不 --commit）；没有就用自己写的合成蒙皮小网格跑通 validate 并在报告里说明；
   - `textures.py` + `pack_glb.mjs --simplify 0.4` 跑正本副本（输出到临时目录，不覆盖 `templates/tpl_f_medium/body.glb`），报告前后三角数 / 体积 / 贴图尺寸。

## 约束
- 只写 `tools/model3d/dressup/{validate.py,textures.py,pack_glb.mjs,ingest.py}`、`apps/game/build/dressup-assets.ts`、`apps/game/build/dressup-assets.test.ts`、`package.json`、`pnpm-lock.yaml`（只为 meshoptimizer）、`assets/default/model3d/dressup/**/manifest.yaml`、`**/report.json` 与本任务报告。
- 不改基础库与 A2–A4 脚本；不改门禁阈值；不改 `content-plugin.ts`。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm check`（含 `apps/game/build/dressup-assets.test.ts`）
- `python3 tools/model3d/dressup/validate.py --help`、`textures.py --help`、`ingest.py --help`、`node tools/model3d/dressup/pack_glb.mjs --help` 均退出 0。

## 报告
第 3 节写每件 report.level 与各检查数值（动态穿透占比按三段动画分列）、正本减面前后数字；第 7 节写 manifest 字段最终形态与 B1 接线点（`publishDressupAssets` 签名、调用位置）。报告 ≤ 80 行。

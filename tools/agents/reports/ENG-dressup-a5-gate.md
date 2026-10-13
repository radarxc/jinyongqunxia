# ENG-dressup-a5-gate 报告 · 3D 纸娃娃换装 · A5 · 门禁与进包 validate / textures / pack_glb / ingest / dressup-assets

## 1. 摘要（3–6 行）

- 完成 AR-103 门禁、贴图整理、只改索引的减面/meshopt、报告绑定入库与构建发布器；主链不依赖 Blender（AR-102）。
- r6 阻断已修：蒙皮 primitive 强制非 normalized u8 SCALAR `_REGION`，拒绝 `JOINTS_1/WEIGHTS_1`，pack 不拆点/复制顶点。
- `fit.template`、`report.template` 与 `--template` 三方严格相等才可入库；medium 冒充 small 的回归已拒绝。
- 三件 A3 道具按 T2 正本重跑 normalize→validate→textures→pack→validate→ingest，均为 approved/candidate；完整 `pnpm check` 全绿。

## 2. 产出（文件、行数、主要章节）

- `tools/model3d/dressup/`：`validate.py` 785 行、`textures.py` 153 行、`pack_glb.mjs` 233 行、`ingest.py` 238 行；身份/单位/蒙皮门禁、BIN 重排、LockBorder/vertex_lock、report 防伪与模板变体入库。
- `apps/game/build/`：`dressup-assets.ts` 103 行；`dressup-assets.test.ts` 590 行、14 条 A5 测试，含三模板真实身份、冒充拒绝、非法 joint/IBM 完整 CLI、顶点原字节不变与 rejected 跳过。
- `package.json` / `pnpm-lock.yaml`：唯一新增 devDependency `meshoptimizer@1.3.0`（声明 `1.3.x`）。
- `props/{item_qingfeng_sword,item_bamboo_hat,luxury_jade_pendant}/`：T2 fit、压包 GLB、approved report、candidate manifest。
- 实跑：四个 `--help`、`git diff --check`、冻结安装通过；专项 14/14 与全套 179 文件/1286 项通过。
- `pnpm check`：lint/typecheck、179/179 文件与 1286/1286 tests、content 1777 文件/1708 对象/2 story/65 map、故事 4 项与编译 3 行/2 章、build/size/dev-chunks 均通过。

## 3. 关键结论与数值

- 与规格一致：装备直接消费模板 clip、不 retarget；LINEAR lerp/slerp、STEP 阶梯，CUBICSPLINE 拒绝；每帧全部顶点分块调用 `common.signed_distance`；approved/draft 穿透线 0.5%/2%。
- T2 绑定：body SHA `1be19e87…066f`；`1.66 / 0.98010258 = 1.6937002655 m/mu`，记录 1.69370027，误差 4.46e-9 < 1e-6；三件均 29/29 checks。
- 三件公共值：schema/必需字段/body SHA/template/mPerMu 均匹配；skin=0，翻面 0，边比合格 100%，`_REGION` 对刚性件可省略，2048²、unlit、仅 baseColor、单 mesh node/材质、无节点 TRS。
- 青锋剑：`approved`；157844 顶点，289300→8676 三角，20797324→9335924→4536072 B；残差 3.008e-8 mu，锚点范数 1.49e-10 mu，主轴 1.000000，实测 validate 1.30 s。
- 竹斗笠：`approved`；160426 顶点，285748→8568 三角，22220472→9323480→4516664 B；残差 1.509e-8 mu，锥顶锚 1.86e-10 mu，开口/锥顶宽 0.08527/0.03604 mu，实测 validate 1.28 s。
- 玉佩：`approved`；159289 顶点，286012→8580 三角，18272568→9183700→4396452 B；残差 1.880e-9 mu，绳顶锚 3.60e-10 mu，medianY -0.02527 mu，实测 validate 1.23 s。
- 刚性件动态穿透 N/A；合成 garment/hair 正例 bind=0、idle/walk/run=`0%/0%/0%`、翻面 0、边比 100%、贴身 p90 差 0 mm；负例 bind=3 且三段 100%，另覆盖翻面、越界 joint、缺字段/区域、附加骨通道。
- 正本临时副本：196022→78408 三角，9595864→8623588→5623708 B，2048² JPEG，锁 5925 点；105082 个顶点的 POSITION/NORMAL/UV/JOINTS/WEIGHTS/_REGION 在解码后 count 与字节逐一相同，未覆盖正本。
- 偏离：无契约偏离；保留正本跨区域三角（`_REGION` 按 provoking vertex 显示），未在 pack 拆点，按协调者 2026-10-07 20:40 裁定留阶段 B 评估。
- 外部核实（访问 2026-10-07）：[meshoptimizer 1.3.0 / vertex_lock](https://www.npmjs.com/package/meshoptimizer)、[EXT 旧规范](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/EXT_meshopt_compression)及[现行 KHR_meshopt_compression](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_meshopt_compression)。
- 环境偏离附加规则：实际 Node 22.22.1 / pnpm 9.15.9；根 `package.json` SSOT 仍锁 Node≥22.12 / pnpm 9，本任务未越权升级到声明的 Node 24 / pnpm 12。

## 4. 开放问题（附默认值）

- 默认 approved→candidate、draft→draft、fail 拒绝；首模板用无后缀文件，后续模板用 `<id>.<template>.glb`、`fit.<template>.json`、`report.<template>.json`，冲突不覆盖。
- 默认跨区域三角保持原拓扑；阶段 B 决定正本导出时是否拆点。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；未改阈值，未用 Blender。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `.claude/skills/dressup-3d/SKILL.md` / validate 清单：补 body SHA/模板/单位、强制 `_REGION`、拒绝附加骨通道及 pack 顶点不变门禁。
- `apps/game/build/content-plugin.ts`：B1 在 `gameContentPlugin.buildStart` 与 `publishBattleModels` 同层调用发布器。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ `validate.py`：approved/draft=0、fail=3；非法 joint/IBM 写标准 JSON fail report 后短路 LBS；骨架/≤4 骨/72 帧穿透/遮罩/几何/材质/预算/刚性件语义齐全。
- ✅ `textures.py`：baseColor≤2048² JPEG q85；删除 normal/MR 的引用和实际 BIN 块，重排索引并加 unlit，可设 doubleSided。
- ✅ `pack_glb.mjs`：只新增索引 accessor；LockBorder + vertex_lock 锁拓扑/颈环/区域边界，UV/WEIGHTS 为误差通道，JOINTS/_REGION 不作误差通道；顶点 accessor 原字节不变。
- ✅ `ingest.py`：`fit.template == report.template == --template`；身份缺失/冒充拒绝；manifest `fits.<template>={file,fit,report,status}`；三件均 candidate。
- ✅ `publishDressupAssets(root, copy, copied?, references?)` 只解释 `file/fit/report/status`，顶层与变体都发布 candidate/draft、跳过 rejected；B1 接线点见第 6 节。
- ✅ 四帮助命令、冻结安装、精确专项命令（179/179、1286/1286）与完整 `pnpm check` 均实际退出 0；只改允许路径。
- ⚠️ `validate.py` 785 行，超“尽量≤400”软建议；为保持门禁内聚且不越权改 A1 基础库，本任务未拆分。

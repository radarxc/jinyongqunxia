# 本任务：游戏工程 · Tiled 地图转换为 RegionMap（场景格网、对象与校验，接入内容编译管线）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`、`content/CLAUDE.md`、`content/README.md`；
- 报告 `tools/agents/reports/ENG-18-content-build.md`：第 7 节「交给 ENG-18b」的产出接口必须照做；
- 报告 `ENG-16a-battle-geometry.md` §6：遭遇格网字段。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 数据行：M1 要 Tiled。序章三个场景、白马冷入口、野外、洞穴、遗迹、室内都是手工场景，要有统一的 RegionMap 合同。下游 ENG-20（区域探索）与 CONTENT-ch00 / ch10 都靠它。

现状：
- `content/tiled/README.md` 只有一行，`tilesets/`、`extensions/` 只有 `.gitkeep`；
- `content/world/regions` 为空；
- 没有 RegionMap、RegionDef、TerrainDef 的 schema。
- 大地图（ENG-08，`worldmap.v1`）与城镇（ENG-09，程序生成的 `town.layout.v1`）都不是 RegionMap。本任务**不改**它们：城镇日后另出 RegionMap 衍生物，见 design/22 §0.1 第 5 步。

## 规格（照这些写，不自创）

- `docs/tech/04-data-pipeline.md`：
  - §6.1：Tiled 1.12.2，只收正交、有限地图；x→q，y→r；图层 `terrain`、`height`（0–10）、`deco`、`objects`，可选 `nav`；11 种对象类；地图属性 regionId / chapterScope / eraLayer / schemaVersion；`rampDir` 必须显式；
  - §6.2：流水线与 RegionMap 字段（bounds、terrainTable、32×32 分块索引与 base64 数据、对象按 (r,q,id) 排序、PlayerSpawn、邻接、时代补丁引用），以及必做校验清单；
  - §6.3：不出现屏幕坐标；叶片 ≤ 256 KiB；对象按块分组，跨块的放区域 base；
  - §2.1 目录约定；§3.4、§3.7、§3.7.2；§4.1 第 7 阶段；§4.2 发现规则；§5.8 诊断码；§8.1–§8.2 叶片命名与 contentHash；§11 测试；§12 Phase 0。
- `docs/design/08-terrain-and-qinggong.md` §1.4 六角约定；§3 48 种地形；§6.3 轻功门；§6.7 V-G1–V-G9。
- `docs/design/11-open-world.md` §1.2–§1.3 场景尺寸档；§12.1–§12.2；§14.1 V-OW05 / 06 / 22。
- `docs/design/chapters/00-yuenv.md` §2.2：序章场景尺寸，作夹具参考。

## 文档冲突的裁定（照此做，报告登记，交文档同步）

- 文件粒度：tech/04 写一个 `rg_*` 一个 `.tmj`，design/11 与序章按场景。按场景做：`content/world/regions/<rg_id>/<sc_id>.tmj`，地图属性加 `sceneId`，`RegionMap.id = sceneId`。
- 场景 ID 前缀用 canon §12 的 `sc_<NN>_*`，tech/04 §3.7.2 的 `scn_` 是旧写法。
- 叶片：书界场景进 `chNN.rules.<regionId>.json`；跨时代底图用 `world.rules.region.<rg>.json`。
- 字段形状以 tech/04 §6.2 的分块 base64 为准，tech/01 §7.4 的 `cells[]` 作废；只收正交地图。
- Tiled 格式：
  - tileset 用 JSON（`.tsj`）或内嵌，不加 XML 解析器；
  - 图层只收 CSV 或未压缩 base64；
  - 对象类读 `type`，也兼容 `class`。
- 地形集合取 design/08 §3 的 48 个 `tr_*`。V-G1–V-G8 的可达性要 TerrainDef 语义，本任务只做结构校验；可达性留待后续任务，报告列出。
- 六角工具放在 data 本地或 shared，data 不得依赖 core。

## 要做的事

1. Zod schema `region-map.v1`：地图、分块、对象联合类型、地图属性。
2. 转换器，接进 ENG-18 的构建阶段：
   - 发现 `.tmj`；诊断带 JSON 指针源位置；
   - 剥离 GID 翻转位，按明确规则；
   - 坐标映射；base64 分块；对象排序；文本只带 textKey。
3. 校验：
   - tech/04 §6.2 的清单、V-OW05 / 06、V-G9、门与传送成对；
   - 新诊断码 `TS-CONTENT-MAP-0xx`。
4. 产出：走 ENG-18 的分片与 emit，256 KiB 切片，计入 contentHash。
5. 编辑器支持：
   - `content/tiled/tianshu.tiled-project` 的属性类型由 Zod 生成，并带 `--check` 防漂移；
   - 地形与高度用 `.tsj` tileset，占位图片由脚本生成，不入库。
6. **测试**：
   - 20×16 的 golden 夹具两次构建字节相同；映射与排序正确；
   - 40×10 夹具跨两块，空格在有效位图里标出；多 tileset 按 `firstgid` 解析；
   - 每类非法输入一条失败测试：非正交、无限地图、压缩图层、缺 / 重图层、有地形无高度、h>10、未知 `tr_*`、斜坡无 `rampDir`、未知对象类、翻转位、锚点不在格上、门不成对、战场 >400 格或跨度 >20、场景 / 区域 ID 或属性非法、叶片 >256 KiB；
   - 改一处高度：contentHash 变、textHash 不变；
   - 属性类型漂移检查通过；
   - 记录 160×160 地图的转换耗时。

约束：
- 写集：`packages/data/src/schemas/region-map.ts`、`packages/data/src/schemas/index.ts`、`packages/data/src/build/**`、`packages/data/scripts/**`、`packages/data/CLAUDE.md`、`content/tiled/**`、`content/world/README.md`、`content/world/regions/**`（只放测试夹具以外的空目录说明；夹具放测试目录）。写集外的改动在提交时会被丢弃。
- **不改**：`apps/game/**`、`packages/core/**`、`package.json`、`pnpm-lock.yaml`；序章正式地图归 CONTENT-ch00。
- data 不做规则结算；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若只因机器负载挂在 rig 门禁，在报告写明负载与数值即可。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/data test`
- `pnpm content:validate`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- RegionMap 字段表；
- 校验与诊断码表；
- 冲突裁定登记；
- 转换耗时；
- 交给下游的接口（放哪、怎么测、接口名）：ENG-20（运行时挂载区域）、CONTENT-ch00 / ch10（地图怎么画、放哪、怎么校验）。

报告 ≤ 90 行。

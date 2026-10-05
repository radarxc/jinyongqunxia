# ENG-18b-tiled-regionmap 报告 · 游戏工程 · Tiled 地图转换为 RegionMap（场景格网、对象与校验，接入内容编译管线）

## 1. 摘要（3–6 行）

已落地严格 `region-map.v1`、有限正交 Tiled 转换器与 32×32 base64 格网，覆盖 48 种地形、11 类对象、跨场景门/轻功门闭合及 JSON Pointer 源诊断。
`.tmj` 已接入 ENG-18 的发现、区域分片、引用图、canonical emit 与四域 hash；高度变化会改变 `contentHash` 而不改变 `textHash`。
Tiled 1.12.2 项目属性由 Zod 生成并可 `--check`，地形/高度 `.tsj` 和编辑器保存检查已提供；本轮将占位 PNG 迁至已忽略的内容构建缓存，实跑后 Git 状态无 PNG。
正式地图仍由 CONTENT-ch00/ch10 绘制；本次没有伪造生产场景，故全库校验的 `0 map(s)` 符合交付边界。
## 2. 产出（文件、行数、主要章节）

| 文件组 | 当前行数 | 主要内容 |
|---|---:|---|
| `schemas/region-map.ts` + `schemas/index.ts` | 608 | RegionMap、chunk 不变量、对象联合、GateExpr 与类型导出 |
| `build/tiled*.ts` | 2,477 | 严格 JSON/属性/tileset/图层/对象/分块/校验/项目生成及 145 条 data 回归 |
| `build/{discover,index,leaves,pipeline}.ts` | 603 | `.tmj` 发现、区域叶片、256 KiB 切片、manifest/hash/refs/emit |
| `scripts/*.ts`（本任务涉及） | 101 | 内容校验、Tiled 项目生成与临时 PNG 生成 |
| `content/tiled/**` | 577 | 作图说明、生成项目、48 地形与 0–10 高度 tileset、保存检查 |
| `CLAUDE.md` / `content/world/**` | 48 | 工程合同、正式地图目录与叶片约定 |
## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| 分块编码 | 32×32=1,024 槽；`valid` 128 B，`terrain` 1,024 B u8 或 2,048 B u16le，`heights` 1,024 B |
| 坐标/排序 | Tiled `x→q`、`y→r`；对象稳定按 `(r,q,id)`，跨块对象进入区域 base |
| 尺寸 | 常规 ≤160×160；161–256 任一边报 `MAP-015` warning；>256 error；叶片 canonical bytes ≤262,144 B |
| 遭遇格网 | `BattleArena` 有效格 ≤400，q/r span 各 ≤20 |
| 确定性/hash | 20×16 两次构建逐字节相同；40×10 跨块空槽/多 tileset 正确；改高度只改变 `contentHash` |
| 性能/全量 | 160×160 转换 97.18 ms（预算 2,000 ms）；全量 920 对象/15 章，2,729.0 ms |
Tiled 版本/API 已于 2026-10-03 核验：[1.12.2 发布说明](https://www.mapeditor.org/2026/05/27/tiled-1-12-2-released.html)、[JSON 格式](https://doc.mapeditor.org/en/stable/reference/json-map-format/)、[GID/翻转位](https://doc.mapeditor.org/en/stable/reference/global-tile-ids/)；无价格或远程限额。
## 4. 开放问题（附默认值）

| 问题 | 默认值 / 后续归属 |
|---|---|
| V-G1–V-G8 需要 TerrainDef 语义与可达性证明 | 本次只校验 48 个 `tr_*`、坡/水/Gate 结构；后续规则/探索任务实现，不在 data 结算 |
| 可选 `nav` 未有 RegionMap 输出字段 | 仍严格校验层形状/GID，但不发布语义；待 TerrainDef/ENG-20 定合同 |
| 独立 RegionDef/TerrainDef schema 尚无权威字段表 | 默认 RegionMap 先以闭合地形 ID 表交付，后续专属任务新增，不在本次猜字段 |
| `mpMax ≥ k×MPREF` 与正式 GateExpr 原子表不一致 | 默认严格采用 §6.2 已列 `{str}` 原子，待 design/08 明确是否新增 `mpMax` |
## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无 | 实现采用任务已给冲突裁定；只需同步派生技术文档，不改变 canon 玩法事实 |
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 / 同步内容 |
|---|---|
| `tech/04` §2.1、§3.7.2、§6.1–6.3 | 改为按场景路径与 `sc_`；补 `sceneId`、JSON-only tileset、支持的图层编码及 `MAP-001…018` |
| `tech/01` §7.4 | 将旧 `cells[]` 标为废弃，引用 32×32 valid/terrain/heights 分块合同 |
| `design/08` §6.2–6.7 | `QinggongGate.to` 补 `scene`；裁定 `mpMax` 原子；后续补 TerrainDef 驱动的 V-G1–V-G8 |
| ENG-20 / RegionDef 后续任务 | 定义 `nav`、TerrainDef/RegionDef 与运行时挂载/卸载、寻路可达性 |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 RegionMap 字段表

| 分组 | 字段 / 合同 |
|---|---|
| 身份 | `schemaVersion,id=sceneId,regionId,chapterScope,eraLayer`；路径属性须一致 |
| 格网 | `bounds,chunkSize=32,terrainTable,chunks`；chunk 含坐标/valid/terrain/heights/ramps/water/AO/decos/objects |
| 索引 | `objects,playerSpawns,adjacentRegions` 均闭合、去重、稳定排序；跨块对象只在区域 base |
| 派生 | `eraPatchRefs,backdropAssetKey`；正文只发布 `textKey`，不含屏幕坐标或内嵌文案 |
| 对象 | `NpcSpawn,PlayerSpawn,EnemyZone,Door,Trigger,QinggongGate,Chest,CameraHint,BattleArena,Building,Light` |
### 7.2 校验与诊断码表

| 码 | 校验 |
|---|---|
| MAP-001/002/003 | JSON/重复键；有限正交/header；003 预留 TerrainDef 可达性 |
| MAP-004/005 | tileset/firstgid/GID；任何翻转位拒绝 |
| MAP-006/007/008 | terrain-height 同位；48 地形闭集；坡向/水域元数据 |
| MAP-009/010/011 | 属性/对象/textKey；格点/几何/有效格；唯一安全 PlayerSpawn |
| MAP-012/013/014 | Door/传送闭合；BattleArena 限制；QinggongGate/V-G9/返程闭合 |
| MAP-015/016/017/018 | 场景尺寸；路径与身份；输出 schema；图层唯一/尺寸/编码 |
### 7.3 冲突裁定登记

| 冲突 | 落地裁定 |
|---|---|
| 区域文件 vs 场景文件 | `content/world/regions/<rg>/<sc>.tmj`，属性加 `sceneId`，`RegionMap.id=sceneId` |
| `scn_` vs canon | 只接受 `sc_<NN>_*` |
| 叶片归属 | 书界 `chNN.rules.<region-token>.json`；跨时代底图 `world.rules.region.<region-token>.json` |
| `cells[]` vs 分块 | 以 §6.2 的 32×32 base64 为准；仅有限正交地图 |
| Tiled 差异 | `.tsj`/内嵌 JSON；CSV/未压缩 base64；对象 `type` 优先并兼容 `class` |
### 7.4 下游接口、测试与门禁

| 下游 | 放哪 / 接口 | 怎么测 |
|---|---|---|
| ENG-20 | `@tianshu/data/build`：`regionRulesLogicalName()`；manifest `load=region,region=rg_*` 的 RegionMap 数组 | data test 后 `pnpm content:build`，逐 leaf/hash 挂载 |
| CONTENT-ch00/ch10 | 在上述 `<rg>/<sc>.tmj` 用生成项目绘制；必填 terrain/height/deco/objects，可选 nav | `generate-tiled.ts --check`、`content:validate`、`content:build` |
| 编译调用方 | `compileTiledMap()`、`validateTiledMaps()`、`validateCompiledTiledMaps()` | golden、全图 Door/Gate 闭合与篡改 schema 回归 |
- ✅ 冻结安装、`pnpm check`（121 文件/877 测试）、content build、data 11 文件/145 测试、content validate（923 对象/0 正式地图）、game build、Tiled drift、strict ID、`git diff --check` 均退出 0。
- ✅ strict ID 仅保留既有基线 `sk_babuganchan`，新增失败 0；占位 PNG 位于已忽略的 `.cache/content-build/tiled-placeholders/`，未出现在 Git 状态中，写集外无改动。

# Tiled 工程

锁定 Tiled 1.12.2。运行时不读取 `.tmj`，只消费 `pnpm content:build` 生成的 `region-map.v1`。

## 新建场景

- 路径：`content/world/regions/<rg_id>/<sc_id>.tmj`；每场景一图。
- 地图：`orientation=orthogonal`、`infinite=false`、正整数宽高；常规不超过 160×160，硬上限 256×256。编辑格 `(x,y)` 直接映射轴坐标 `(q,r)`，不得写屏幕坐标。
- 地图属性：`schemaVersion=region-map.v1`、`regionId`、`sceneId`、`chapterScope`、`eraLayer`；可选 `eraPatchRefs`、`backdropAssetKey`。字符串列表可用逗号分隔。
- 必须且唯一的层：tile `terrain`、`height`、`deco`，object `objects`；可选 tile `nav`。tile 层只用 CSV 数组或未压缩 base64。
- tileset 只用 JSON `.tsj` 或内嵌 JSON；`terrain.tsj` 是 48 种 `tr_*` 闭集，`height.tsj` 是 0–10。坡面 tile 另设 `ramp=true` 与 `rampDir=0..5`，急流设 `flowDir=0..5`。

对象类固定为 `NpcSpawn`、`PlayerSpawn`、`EnemyZone`、`Door`、`Trigger`、`QinggongGate`、`Chest`、`CameraHint`、`BattleArena`、`Building`、`Light`。类优先读 Tiled `type`，兼容 `class`；对象须落在有效格点，文本只写 `textKey`。属性编辑面板以 `tianshu.tiled-project` 为准。

`Door` 本场景双端必须互指；跨场景端必须填写 `pairId/targetRegionId/targetSceneId/targetSpawnId`，由全量内容闭合。`BattleArena` 至多 400 格且 `q/r` 跨度各不超过 20。

`QinggongGate` 的对象锚点必须等于 `fromQ/fromR`；`toRegion/toScene/toQ/toR` 指向目标格；`height/width/run/stages` 是非负整数。`alt` 在 Tiled 中填写 JSON 数组，例如 `[{"item":"it_feizhua"}]` 或 `[{"any":[{"qg":3},{"quest":"q_01_qiyu_71","state":"active"}]}]`。`main/side` 使用 `reveal=always`，`secret` 使用 `near10`，`hidden` 使用 `never`；主线门须有 `alt` 和 0–1 的 `earliest`。单向门禁的 `returnDoorId` 指向目标场景中能回到来源场景的实际 `Door`。

## 工具与检查

```sh
pnpm --filter @tianshu/data exec tsx scripts/generate-tiled.ts --check
pnpm --filter @tianshu/data exec tsx scripts/generate-tiled-placeholders.ts
pnpm content:validate
pnpm content:build
```

`generate-tiled.ts` 从代码合同生成 property types；不带 `--check` 可重建，提交前必须检查无漂移。占位 PNG 只生成到已忽略的 `.cache/content-build/tiled-placeholders/`，不得入库。编辑器扩展仅做保存前快速提示，命令行校验才是门禁。

## 编译产物

每块固定 32×32：`valid` 位图、`terrain`（u8/u16le）、`heights`（u8）均为 base64；边缘和地图留白保持无效。对象按 `(r,q,id)` 排序并按块归组，跨块对象进入场景 base。改规则格会进入 `contentHash`，不改变 `textHash`。

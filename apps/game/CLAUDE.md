# @tianshu/game

Vite + Vue 装配与发布层。这里创建 CoreHost、把事件投影到 UI、驱动渲染和场景切换；不得复制 core 规则或把可写状态交给 UI。core 默认模块 Worker，失败时才回退主线程。Three 场景必须动态加载，内容按书界动态加载；交付前跑 `pnpm size`。

## 素材（图片资源从哪来、怎么进包）

- 全部图片素材在仓库根 `assets/default/<类别>/`，每个目录一份 `manifest.yaml`（字段见 `assets/README.md`）：物品 `item/<类>/`、建筑 `building-map/<kit>/`、贴片 `tile/<kit>/`、角色部件 `rig/<set>/`、地图 `map/`、特效 `vfx/`、作者已审基线 `baseline/`。
- 哪些图还没出、每张图的提示词与输出路径：`assets/default/prompts/INDEX.md`（物品 / 地图 / 角色部件）、`assets/default/prompts/characters/INDEX.md`（人物立绘）。出图由另外的 agent 做；代码不要等图，缺图时用同尺寸占位（`packages/render` 的 placeholder 约定）。
- 进包：构建时按 manifest 把 `status` 不为 `rejected` 的条目复制到 `apps/game/public/assets/default/<类别>/…`（保持相对路径），运行时通过 `art://` 键或相对路径读取（`docs/tech/06` 的素材键与清单约定）；不要把图片 import 进 JS bundle，也不要改 `assets/default/` 下的任何文件。

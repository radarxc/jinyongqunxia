# ENG-20b-region-scene 报告 · 游戏工程 · 区域探索 B（渲染与页面）：RegionMap 分块渲染、行走、锚点交互与场景页

## 1. 摘要（3–6 行）

已完成 pointy-top RegionMap 分块地形、纹理数组索引材质、高度/坡/崖/水面、静态物件、rig 角色及锚点渲染。
区域页接通 core 预览、行走、互动与切场请求；render 只拾取，不重复计算路径、范围、门禁或出口规则。
CameraHint、昼夜朝向、质量 DPR、上下文恢复和异步卸载守卫已接入；禁旋转区固定有效 yaw 45°。
冻结安装、全量检查、独立 game 测试/构建、严格 ID 与 diff 检查均通过；浏览器 GPU 帧率和手感仍待实测。

## 2. 产出（文件、行数、主要章节）

| 文件组 | 文件数 / 行数 | 主要内容 |
|---|---:|---|
| `packages/render/src/region/` | 9 / 1,081 | 类型、地形/材质、物件、场景 API、fixture 与 3 组测试 |
| `apps/game/src/region/` | 4 / 193 | 命令映射、方向/文案、页面生命周期与输入测试 |
| `apps/game/src/pages/RegionPage.vue` | 1 / 235 | 懒加载场景、状态机、输入、提示、恢复与 HUD |
| 既有入口/约定 | 4 个文件，净 +30/−1 | 子路径导出、App 路由（净 +5 行）、i18n、render 约定 |
| 本报告 | 1 / ≤80 | 性能记录、开放问题、同步项与验收自检 |

## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| 六角与分块 | 外接半径 `2/3 m`、行距 `1 m`、高度步长 `1 m`；`32×32=1,024` 槽/chunk；首帧玩家周围最多 `3×3`，随后每帧最多上传 2 chunk |
| 材质与几何 | 共享 `DataArrayTexture` + 每 chunk `32×32` RGBA8 索引图；`tr_*` 分类色为同接口占位；每格 6 个顶面三角，显式坡向，低邻/边界补崖，水面为 `h−0.15 m` |
| 物件与镜头 | deco/建筑/屋顶实例批次支持 `occluder/castShadow/roof/fadeGroup` 与 250 ms 淡出；CameraHint 可定 yaw/zoom/旋转，锁定时 yaw 恒 45° |
| Node mock：序章 20×18 | 360 格、1 chunk、3 drawable、2,548 tri；构建中位 4.570875 ms；稳态 CPU P50/P95 0.004958/0.006042 ms |
| Node mock：白马 48×32 | 正式地图 1,342 有效格、2 chunk、4 drawable、9,926 tri；构建中位 9.554291 ms；稳态 CPU P50/P95 0.003125/0.003333 ms |
| 体积 | entry 38.80/170 KiB、render 168.86/180 KiB、WebGL total 207.65/350 KiB；Region 懒加载闭包 44.19 KiB |

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 后续归属 |
|---|---|
| 完整流式尚无 Worker 构网与离视野 LRU | 默认主线程分帧上传、全场驻留；维持 3×3 首屏与 2 chunk/frame 上限，后续按显存预算补 Worker/LRU |
| 生产 RegionMap 未输出四个 deco 表现字段 | 默认 `occluder/castShadow/roof=false`、无 `fadeGroup`；不按 asset 名猜测 |
| 书眠冷入口、废墟返回大地图缺显式 mount/unmount 闭环 | 默认无静态/动态投影时显示不可用；不伪造 region/scene/spawn ID |
| QinggongGate 可给 `targetHex` 但 mount 需要 `spawnId` | 默认提示目标缺出生点且不切场；由 core/content 补可原子挂载目标 |
| 浏览器 GPU 帧率、触控吸附、四偏航拾取及恢复手感 | （待实测）桌面目标 ≥60 fps、中端手机 ≥30 fps；Node mock 不代替真机结论 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| ENG20b-P01 | 将区域出口目标定为 `region`/`world` 判别联合，并要求区域目标含可挂载 `spawnId` | 关闭返回大地图与仅坐标轻功出口歧义，禁止特殊 ID 推断 |
| ENG20b-P02 | 将 deco 的四个表现字段纳入 RegionMap 生产 schema 与转换校验 | render 已支持，但当前内容无法声明遮挡、阴影、屋顶或联动淡出 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 / 同步内容 |
|---|---|
| `docs/tech/02-rendering.md` | §2.2/§8.8：登记 3×3 首屏、2 chunk/frame、资源恢复/释放合同及 Worker/LRU 未完成项 |
| ENG-20a / app controller | 增加公开 Region 命令端口和显式 unmount；preview 走只读通道，移除 `townCommand` 类型桥接 |
| CONTENT-ch00b / ch10 | 地图提供有效格、`tr_*`、高度、坡、水、deco 四字段、CameraHint、NPC 朝向、可挂载出口与唯一 spawn |
| ENG-24 | 用第 7 节稳定选择器冒烟：加载、恢复、旋转、锚点、离开与统计 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 分块与材质：pointy-top 网格、索引 splat、分类占位、坡/崖/水、分帧上传、路径高亮均有实现与 mock-three 测试；替换正式纹理无需改场景代码。
- ✅ draw call 与帧时间：第 3 节记录两目标场景的 drawable/tri、构建中位和稳态 CPU P50/P95；稳态帧复用向量/矩阵/命中数组/loaded 数组，无显式容器分配。
- ✅ 页面状态机：不可用 → 加载 → 就绪/丢失 → 重建 → 失败；每次 await 后校验 generation/卸载，迟到 update 不回滚投影，dispose 幂等并 `forceContextLoss()`。
- ✅ 输入与规则边界：hover→`world/previewRegionPath`、点格→`world/walkTo`、点锚→`world/interact`；只播放 core 返回路径，WASD/方向键按镜头映射，Q/E 遵守 CameraHint。
- ✅ 测试：Region 聚焦 5 文件/14 项，全量 `pnpm check` 145 文件/1,004 项；首次仅既有 storage 50 ms 计时抖到 65.8 ms，单项及随后全量复跑通过；game 31 文件/105 项，build 548 modules。
- ✅ 门禁：`pnpm install --frozen-lockfile`、content 987 文件/925 对象/62 地图、size、strict ID（仅既有 `sk_babuganchan`）、`git diff --check` 均通过；未运行已移出的 `check:perf`，未改阈值。
- ✅ CONTENT 接口：影响画面的字段为 `terrainTable/terrain/heights/ramps/water`，deco 的 asset/格位/高度/旋转/缩放/四表现字段，CameraHint 的 yaw/zoom/allowRotation，以及 NPC facing；锚点 enabled/reason 只来自 core。
- ✅ ENG-24 接口：`[data-region-canvas|loading|recovery|camera-left|camera-right|anchor|leave|stats]`；锚点值为 anchorId，notice 为 `role=status`。
- ⚠️ 性能实测：沙箱不启动 Chromium；GPU draw、FPS、触控与手感保留（待实测），未把 Node CPU 数据冒充浏览器结果。
- ✅ 范围：仅改允许写集；App 净新增 5 行；无依赖/锁文件、core、其他 render 模块或 build 产物改动，未执行改变仓库状态的 git 命令。

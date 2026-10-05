# ENG-09-town-scene 报告 · 游戏工程 · 城镇小地图（three.js 高低起伏 / 建筑直接进入半透明 / NPC 与位置锚点 / 打坐被袭岔气）

## 1. 摘要（3–6 行）

完成 CitySpec / TownLayout 到 `town-runtime.v1` 的确定性编译，并生成大理、杭州两个按城动态加载的运行时包。
规则下沉 core：整数 A*、高差碰撞、建筑状态机、事件锚点，以及打坐的敌意筛选、RNG、岔气、恢复、练功、时钟与 `BattleSetup` 完整事务；app 只转发和装配表现。
完成实例化地面 / 边件 / 建筑、rig 主角与 NPC、固定斜视镜头、逐格移动、建筑原图半透明及简化室内。
全部指定安装、检查、构建、生成器、ID 与 size 门禁通过；真实桌面和中端手机帧率仍待目标设备实测。

## 2. 产出（文件、行数、主要章节）

- `tools/content/town_runtime.py` 326 行、`test_town_runtime.py` 47 行：批量编译、RLE / 图集 / 导航 / 建筑 / 锚点、陈旧产物检查。
- `content/town/ch01/city_dali.json`、`ch02/city_hangzhou.json` 各 1 行紧凑 JSON：96×96 / 160×160 两城基线。
- `packages/data/src/schemas/town.ts` 79 行及测试 59 行；content registry/index 接入运行时 schema。
- `packages/core/src/world/town-runtime.ts` 359 行及测试 290 行；存档 `ChapterState.town`、校验与根 `world` 导出同步。
- `packages/render/src/town/` 600 行实现 + 117 行测试：投影、atlas、实例几何、拾取、相机、rig、统计与释放。
- rig 稳态提交改为连续 affine typed-array 快路径，并覆盖跨 batch 初始化与移除后重加；保留 100 人 / 1,600 实例完整门禁。
- `apps/game/src/pages/TownPage.vue` 199 行、输入适配 41 行及测试 31 行；session / projection / worker / controller / 样式完成装配。
- 构建插件新增每城动态模块及素材清单复制；更新 `packages/render/CLAUDE.md`、`apps/game/CLAUDE.md`，未新增依赖或锁文件改动。
- 本轮清理 5 个冲突文件：构建插件 / render 导出 / CLAUDE 同时保留 VFX 与 town；rig 同时保留近侧层序、manifest 髋点、快照、静态缓存及两侧测试。

## 3. 关键结论与数值

- 大理：2,525 导航节点、36 建筑、27 锚点；杭州：5,222 节点、60 建筑、42 锚点。
- core 全用整数格 / cm / bp：最大可跨高差 50 cm；遇袭率 `min(10000, 地点基础 + 夜间300 + 通缉级×500(封顶3000) + 在场敌意NPC数×1000(封顶4000))`。
- 一次打坐固定 `600 tick`（沿用 `MEDITATION_TICKS`）；安全完成推进一游戏时、恢复 MP / 体力，HP 至少恢复到 `ceil(hpMax/2)`。
- 建筑淡变目标 opacity 0.28、页面结算 260 ms；路径表现 90 ms / 格；镜头缩放 0.65–2.5，减少动效时延迟为 0。
- size：entry 135.43/170 KiB、render 149.23/180 KiB、WebGL total 284.65/350 KiB，全部 PASS。

## 4. 开放问题（附默认值）

- 高低起伏内容：当前两份权威布局高度均为 0、traversal 均为 `flat`；默认保留 50 cm 坡 / 阶能力，待布局提供结构化高度和 `ramp|stairs`。
- 建筑旋转：当前布局和素材只有 0°；默认按 0° 渲染，非零旋转须补对应 45° 建筑视图后启用。
- NPC / 位置锚点：生产内容没有可信精确格位；默认注册表为空，不依据人物归属猜点，待 ENG-05 提供坐标。
- 打坐遇袭：生产内容没有合法通用 `enc_*` 及参战单位转换；默认无正式遭遇时安全完成，测试以注入假遭遇覆盖岔气和切战。
- 性能：默认目标桌面 ≥60 fps、中端手机 ≥30 fps；当前 macOS 沙箱阻止 Chromium Mach rendezvous，须在目标浏览器 / 真机补测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG09-P01 / 在城镇布局 schema 增加每格 `elevation_m` 与导航 `flat|ramp|stairs` 的权威生成规则 / 否则 AR-19 高低起伏只有引擎能力、无生产内容。
- ENG09-P02 / 为建筑套件定义 rotation 对应的 45° 视图与 anchor 合同 / 现有素材只足以可靠呈现 0°。
- ENG09-P03 / 明确城镇打坐风险 bp 公式为基准建议值 / 目前公式确定且可测，但仍属于本任务默认实现。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/22-town-layout-and-generation.md` / CitySpec、TownLayout schema / 同步高度、traversal、建筑旋转素材合同及 `town-runtime.v1` 字段。
- ENG-05 事件 / 城镇锚点注册 / 提供 NPC 与位置的 scene、era、整数格坐标；未提供时保持空，不推断。
- ENG-03 / 打坐 / 评审第 3 节 bp 公式与城镇地点基础值 100（客栈）/ 250（庙宇）。
- ENG-04、ENG-10 / 城镇打坐遇袭 / 接收 `BattleSetup.returnContext={sceneRef,anchorRef}`，战后返回原城镇。
- 素材生产 / building-map manifest / 增补非零 rotation 的 45° 视图及锚点；`tools/town/gen_layout.py` 后续产出非零高度。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 运行时数据结构：`town-runtime.v1` 含来源 hash、RLE 地面 palette、高度 / 可走性、水桥、8 向边件、导航、建筑入口 / 内部类型、锚点及 tile / building atlas；两城 `--check` 通过。
- ✅ 投影一致性验证：复用离线 64×32 菱形、45° yaw / 30° pitch、锚点 / footprint 与内角 4 px crop 语义；正反变换、相机角、高度平面拾取、边件 mask 均有测试。
- ✅ 性能结构：32×32 chunk、地面 / 边件同批、建筑 / 室内各一批、rig 2 draw、视锥裁剪、按城懒加载、渲染循环不重建静态几何。
- ✅ 性能数据：全 chunk 可见时大理室外 / 室内结构上限 13 / 14 draw、21,368 静态 plane tri；杭州 29 / 30 draw、58,076 tri；本轮 rig CPU 三轮最优 P95 为 20 人 0.060 ms、100 人 0.348 ms；bundle size 全绿。
- ✅ 性能门禁稳健性：稳定帧只连续复制变化的 affine 块，跨 batch / 重加仍强制完整初始化；负载只记录诊断，20 人 <16.67 ms、100 人 <0.80 ms 的断言均未跳过或放宽。
- ⚠️ 整场 draw / tri / frame：页面直接展示 `renderer.info.render` 和 CPU / frame；沙箱阻止无头 Chromium 启动，桌面 ≥60 / 手机 ≥30 fps 尚待真机实测，不伪报。
- ✅ 进入 / 锚点 / 打坐接口：`town/move|settle-building|exit-building|interact|meditate` 全经 core；商店须 `businessRef`，NPC 须匹配 era / scene / 格位，室内打坐须处于对应建筑。
- ✅ ENG-10 战斗入口：命中遇袭后先 `interruptMeditation()` 产出 `bf_chaqi`，再构造 `BattleSetup` 并通过现有 battle launch 切场；失败事务回滚状态与 RNG。
- ✅ 确定性与测试：同 seed / 输入同输出；A*、碰撞、高差、建筑、锚点、商店、NPC、打坐、动态加载、渲染 smoke 均覆盖。
- ✅ 验收：`pnpm install --frozen-lockfile`、`pnpm check`（92 文件 / 515 测试，另 1 文件 / 2 项 rig 性能测试；394 内容对象）、game build、town `--check`、strict IDs、Python 2 测试、`git diff --check` 全通过。
- ✅ 范围：仅修改允许写集；未改 `tools/town/`、docs、TODO，未执行改变仓库状态的 git 命令，未新增依赖。

# ENG-buildgen-r0-core 报告 · 城镇 3D 古建 · 网格器骨架 buildgen（类型、构建器、图元、开洞、检查、哈希、配方注册与桩）

## 1. 摘要（3–6 行）

已建立无 Three 依赖的 buildgen 网格器骨架：结构镜像、36 B SoA 缓冲、四分之一转图元、墙体开洞、确定性哈希/RNG、分格生成与 9 类配方桩。
6 个毫米制迷你方案已贯通 shell/roof 双缓冲；INV-1/3/5 正常方案零诊断，损坏样例可被捕获。
屋顶式样、INV-2/4/6、`cutFacadeMask`、Three 建筑层按任务保留明确 `BUILDGEN_NOT_IMPLEMENTED` 桩。
审核返修已补完整 kit 镜像、精确悬挂类别、院落单元清单与严格 INV-1/5 回归。
第 3、4 轮审核后的返修由协调者按 AR-110 直接完成：`quad`/`extrudeAlong` 接受四分之一转、桩几何局部高度改按单元地面、INV-3 改为真实三角形—门洞盒相交、迷你方案屋顶式样改为具名常量；随机子流盐值与规划器对齐、INV-5 立面判断改按套件墙厚。
最终定向测试 7 文件 / 40 用例通过；`pnpm check` 结果见第 2 节。

## 2. 产出（文件、行数、主要章节）

- `packages/render/src/buildgen/`：30 文件、2,812 行；`types.ts`/`index.ts`、`mesher/core/*`、`generate.ts`、`recipes/*`、`roof/index.ts`、`three/layer.ts`、`testing/mini-plans.ts`。
- 测试：7 个 `*.test.ts`，覆盖类型化载荷、图元/法向、开洞边界、哈希/RNG、INV 负例、配方注册、明确桩。
- `pnpm install --frozen-lockfile`：通过，锁文件已是最新且无改动。
- 定向 Vitest：7 文件、40 用例通过（第 3 轮返修新增 6 例、第 4 轮 2 例）；render typecheck、ESLint、Prettier 均通过。
- `pnpm check`（`TIANSHU_VITEST_MAX_WORKERS=2`）：199 文件、1,442 用例通过；content:validate 1,777 文件 / 1,708 对象 / 2 Ink / 65 地图有效；render 166.05 / 180 KiB、session 95.67 / 110 KiB 等包体全 PASS；dev-chunks PASS（828 assets / 94 manifest）；退出码 0。

## 3. 关键结论与数值

- 与文档一致：顶点 36 B = position 12 + normal 4 + uv 8 + aMat 4 + aUnit 4 + aTint 4；>65,535 顶点切 `Uint32Array`。
- 立面掩码位：bit0 S、bit1 W、bit2 N、bit3 E；墙体内外面及洞口 jamb/soffit 沿所属世界立面同标，角部允许多位。
- 四分之一转：yaw 0 `(x,z)`；1 `(-z,x)`；2 `(-x,-z)`；3 `(z,-x)`；法线同矩阵。
- 哈希：FNV-1a 32；position/bounds 先量化至 0.1 mm（米值 ×10,000 四舍五入），其余属性、索引按字节稳定散列。
- 默认桩墙内缩 40 mm、厚 100 mm；墙面按网格分解为“墙减洞”，面积误差测试 ≤0.1%，洞内零三角。
- 配方先由 `kit.archetypes/landmarks[plan.archetype].recipe` 静态解析；未知与 unsupported archetype 均硬失败。`floorY` 是相对基底值，世界高度统一为 `elev[0]+floorY[i]`。
- RNG 子流：`BUILDGEN_RNG_SALTS` 与规划器 `SALT` 同值（variant `0x6d2b79f5`、interior `0x1b56c4e9`、props `0x85ebca6b`、visual `0xc2b2ae35`），`buildgenSubstream(seed, salt) = splitmix32(seed ^ salt)` 与规划器逐值相同（两组固定种子金样对拍）。
- RNG 的 `rangeInt` 用 32 位拒绝采样，不生成浮点随机；`extrudeAlong` 共享斜接截面，L 形及固定种子多段路径按几何位置合并后无开放边。
- `BuildKitView` 完整镜像 p1 `CompiledBuildKit` 字段名：dims/门窗/墙/屋脊/palette/16 层/变体/地标/城墙，数值均为整数 mm 或 bp。
- INV-1 的招牌/旗/灯笼通过 `RecipeSink.hangingProps` 精确分类并编码进 `CellPayload.hanging`；bit5 仍只表示道具数组采样。
- 单元号：建筑主单元为方案下标；院落部件从 `plans.length` 起连续编号；`CellPayload.units` 是本格 INV-5 的权威清单。
- 四种图元同一变换：`box`/`prism` 用 options 里的 `origin`/`yaw`，`quad(writer, points, material, transform)`、`extrudeAlong(writer, path, profile, material, transform)` 用第 4 / 5 个参数；挤出先在局部坐标解斜接再整体变换，接缝不变。
- `aUnit.y` = 顶点高出单元地面（`elev[0] + floorY[0]`）的 cm，低于地面截为 0；带 900 mm 台基的寺殿檐口为 `roof.eaveMm / 10` cm（±0.5），不再多算台基。
- INV-3：每个入口一个门洞盒 = 门宽 × [地面 + `kit.door.threshold`, 地面 + 2.1 m] × 墙带（占地边到 floors 边的实际深度），各面内缩 1 mm（门框侧面、过梁底面、门槛顶面贴边合法）；用分离轴定理做三角形—盒相交（3 盒轴 + 三角形法线 + 9 个边叉积），不再用三轴包围盒重叠。只检查 `enterable` 且有 floors 的方案。
- INV-5 立面带：顶点离 40 mm 内缩边的深度不超过「套件最厚墙 + 1 mm」（`facadeBandM(kit)`；不传套件时按规范上限 600 mm + 1 mm）即属于该立面，120 / 350 / 600 mm 墙的内外表面都接受同一立面位；室内面、隔断与道具（标志位）不参与。
- 屋顶式样：`types.ts` 新增 `ROOF_STYLE` 常量，与 data 的 `RoofStyle` 枚举同名同值（None 0 … Canopy 9）；迷你方案：店铺悬山、民居硬山、客栈歇山、摊位布棚、寺殿歇山、西域民居平顶。

## 4. 开放问题（附默认值）

- r1 默认接管 INV-2/4/6；当前调用会明确抛错，不静默返回空诊断。
- r2/r3 默认接管真实屋顶分派；当前配方屋顶为 `eaveMm` 至 `ridgeMm` 的占地内盒。
- r9 默认实现 `cutFacadeMask` 与 `createBuildingLayer`；当前均明确抛 `BUILDGEN_NOT_IMPLEMENTED`。
- p1 默认使 `CompiledBuildKit` 与 `BuildKitView` 保持结构同名、可双向 assignability 测试；render 仍不 import data。
- r1/r4 注册悬挂物时须记录 target/kind/顶点号；INV-1 仅对完整物件下沿 ≥2.25 m、外伸 ≤0.6 m 放行。
- INV-3 默认只查可进入且有 floors 的方案（摊位、装饰门不查）；门槛高度取调用方传入的套件 `door.threshold`，不传按 0；`inspectCoreGeometry` 最后一个参数传套件。
- `ROOF_STYLE` 与 data 枚举的数值一致性留给 ENG-town2-chunks 的 `apps/game` 类型契约测试一并断言（render 不 import data）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无；后续代码任务按 tech/16 §13.1 既有分工替换对应桩即可。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ `mesher/**` 递归源码断言无 Three import；公共 `index.ts` 仅导类型与 `generateCells`。
- ✅ 四种 yaw 点/法线（`box`、`prism`、`quad`、`extrudeAlong` 四种图元都带四分之一转，后两者有逐点 / 逐法线对拍）、外法向 `>0.99`、米制 UV、36 B、全部载荷类型化数组、Uint32 切换均有测试。
- ✅ 开洞覆盖两洞相邻与洞贴墙端，面积守恒 ≤0.1%，洞内零三角。
- ✅ 完整 kit 镜像可供 p1 做结构一致性测试；真实 archetype 经 kit 分派，未知/unsupported 均硬失败。
- ✅ 6 方案 INV-1/3/5 零诊断（带套件门槛）；普通 bit5 外伸、空屋顶、前墙零掩码、非法/院落部件单元、包围盒重叠但不相交、门槛以下合法、墙带以内的室内几何均有回归。
- ✅ 子流盐值与规划器同值并有金样；INV-5 对 120 / 350 / 600 mm 外墙内外表面零误报（旧 0.101 m 判断带会误报）。
- ✅ 桩几何局部高度：寺殿与抬高 1.2 m 的寺殿，基底顶点 0 cm、檐口 `roof.eaveMm/10` cm；6 个迷你方案屋顶式样用 `ROOF_STYLE` 具名断言。
- ✅ r1–r7：配方桩为 `recipes/{hall,storeyed,stall,adobe,compound,pagoda-dense,pagoda-oct,citywall,gate}.ts`，注册在 `recipes/index.ts`。
- ✅ r2/r3：屋顶分派桩 `mesher/roof/index.ts`；r9：图层桩 `three/layer.ts`，立面函数桩 `types.ts`。
- ✅ 配方用 `RecipeSink` 写 shell/roof；院落读 `partUnits`；悬挂物写 `hangingProps`，门/招牌写 `doors`/`signs`。
- ✅ r1 检查调用：`inspectInv1(mesh, plans, decodeHangingProps(cell.hanging,target))`；INV-5 传 `cell.units`，或一次 `inspectCoreGeometry`。
- ✅ 任务规定四命令均亲自通过；`pnpm check` 构建仅打印既有缺失素材占位回退与 chunk 警告，退出码 0。

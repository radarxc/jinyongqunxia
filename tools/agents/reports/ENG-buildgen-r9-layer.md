# ENG-buildgen-r9-layer 报告 · 城镇 3D 古建 · 建筑层 BuildingLayer（分格合批、static-lit 材质、状态纹理、剖切三态、透视圈、门扇、招牌、室内 LRU、暗角、拾取、恢复 / 释放）

## 1. 摘要（3–6 行）

- 完成 `BuildingLayer` 主线程层：建筑与城墙分格合批、每帧最多上传一格、每格 shell + roof、焦点近远重排、可见统计、拾取 / 遮挡 / 测量。
- 完成 `static-lit` GLSL3 材质与共享 IsoLit uniform；默认 `aTint.a=0`，无灯室内 / 烘焙灯 / 夜窗数值回归通过。
- 完成外墙与隔断剖切、屋外 30% 遮罩 + 室内挖空、门扇 / 招牌、室内 LRU、恢复及含实例缓冲的幂等释放。
- 第 7 次运行补齐 shell / roof / depth 加载期预热、偏航重算共享太阳、非标准楼地面包围盒和公开 `buildgen` 入口。
- 第 8 轮由协调者按 AR-110 接手，修 r6 审核三项：暗角孔洞补 `baseYMm`、半球强度固定 0.5、static-lit 输出补色调映射与 sRGB 编码。另在真 WebGL2 实编时发现 `partition` 是 GLSL ES 3.00 保留字，五个变体全部编译失败；已改名 `partitionWall` 并加保留字回归。r7 / r8 审核后（第 9、10 轮，仍由协调者）门扇 / 招牌随所属格剔除，并把可见实例压紧到 GPU 缓冲前缀、`mesh.count` = 可见数，统计按实际提交数。
- 四条规定门禁全部退出 0；定向 21 文件 / 197 用例（已挪到含 r3 屋顶的基点 c2467a3fc）、全量 257 文件 / 2,107 用例（挪基点前在基点 54f1fbbf3 实跑；新基点由监督校验复跑）通过。

## 2. 产出（文件、行数、主要章节）

- `buildgen/index.ts` 正式导出层、四个策略接口和缺省实现；`types.ts`、`stubs.test.ts`、`mesher/core/buffer.ts` 落端口、接管桩与 `aTint.a=0`。
- `buildgen/three/`：22 文件、2,886 行（Prettier 排版后）；layer、accessories（门扇 / 招牌每帧更新与实例压紧）、prepare（生成并按格合并）、topology（单元归属与招牌放置）、cutaway、state、payloads、walls、resources、statistics、strategies、interiors、vignette 及测试。
- `materials/static-lit/`：8 文件、794 行；新增三变体预热与同步降级测试。全部改动文件通过 `prettier --check`；非测试源码均 ≤ 400 行（`layer.ts` 390、`strategies.ts` 363）。
- `pnpm install --frozen-lockfile`：通过，lockfile 已是最新，718 ms；未改 lockfile。
- 定向 Vitest：通过，21 文件 / 197 用例（基点 c2467a3fc）；`pnpm --filter @tianshu/render typecheck`：通过。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：通过；lint / 全仓 typecheck、257 文件 / 2,107 用例（基点 54f1fbbf3）、内容 1,793 文件 / 1,720 对象、生产构建与体积门均通过。

## 3. 关键结论与数值

- 一致：define 仅 `ROOF_FADE / ALPHA_TEST / DEPTH_ONLY`；共享 uniform 为太阳方向 / 色 / 强度、天色、地色 `#6b5a45`、半球强度（固定 0.5，tech/16 §7，只有天色随时辰）/ 灯强度、时辰；片元末尾按 GLSL3 等价写法先 `toneMapping()`（定义 `TONE_MAPPING` 时）再 `linearToOutputTexel()`（图层是 sRGB 纹理，采样即线性；`<colorspace_fragment>` 只写 `gl_FragColor`，GLSL3 自带输出下不可用）；固定键 `static-lit:r2:<三 define>`。创建返回前以最小 36 B 顶点场景一次预热 shell / roof / depth，优先 `compileAsync`、无该 API 时 `compile`；建筑数不增加程序。
- 一致：状态纹理 `256 × ceil(units/256)` RGBA8：R 屋顶、G 剖墙、B 室内显隐 / 窗光、A 高亮；B=0 白昼关闭、B=1 夜窗标记、B=2..255 为室内显隐。mode 0 夜窗只点亮 bit3，不显出 bit2；R/G 250 ms 正反推进，减少动效一帧到位。
- 一致：bit0 外墙须 `facade & mask` 且相机点积 >0.2；隔断分支在真实 GLSL 中先验 `partitionWall`（bit1）再判实际 XZ 法向点积 >0.2；两者都随 G 从正脊降到 1.0 m 后 discard；bit0/bit1 均为 0 时遍历 G=0..255 均不 discard。
- 一致：`aTint.a` 是 0–255 烘焙灯光，未提供缺省 0；bit2 灯强乘 B 显隐进度，bit3 夜窗将 B 非零视为窗光开，两者再乘时辰灯强；覆盖 mode 0 夜间非零、白昼 0、进屋后保持窗光。
- 一致：透视圈仅镂空比焦点近 >0.5 m 的片元，半径边缘 0.3 m 羽化、200 ms 淡入淡出；屋顶色按 Bayer 淡出，`DEPTH_ONLY` 提前返回而始终写阴影。
- 实测：每个可见格固定 2 个建筑 draw；六迷你方案高档 LOD0 / 32 m 为 2 格、6,216 三角、473,320 B 几何，低档 LOD1 / 16 m 为 4 格、4,028 三角、313,264 B；门扇 / 招牌在建层时记下所属格（按格编号，不受上传重排影响）；逻辑实例（矩阵、开合量、招牌 `signRect` / `signUnit`）保持固定下标，GPU 缓冲只放可见实例的连续前缀：可见集合或可见门扇矩阵变化时零分配重排，并设 `mesh.count` = 可见数、整批为 0 时 `mesh.visible=false`。被剔除格的附件既不画也不提交。统计按实际提交数：可见格 ×2、附件批各 1（门 12 / 招牌 2 三角 × `mesh.count`）、可见且非空的室内批、暗角 1 draw / 2 三角。实测：两格（小屋 + 寺殿）只显近格时门扇 / 招牌提交数 = 近格数、前缀全在近格，三角 = 可见格 + 提交附件；全剔除 0 / 0；恢复后矩阵、已开门扇、招牌 UV / 单元号一致。
- 暗角：活动态 2 建筑 `floors[0]` 四角（世界高 `baseYMm + floorY[0]` + 0.02 m，地基抬高 1.25 m 的回归断言四角 y）由同一 Three 相机矩阵投影；室内 alpha 0、屋外 0.3，边界总宽 24 px smoothstep；中心 / 室内 / 屋外 / 边界有数值断言。
- 招牌：外墙位置用 `+worldSide·π/2`，平面朝向独立用 `-worldSide·π/2`；S/W/N/E 外法向依次为 `+Z/-X/-Z/+X`，测试含 plan yaw 1、3、单元号与态 2 剖切隐藏侧。
- 门扇创建即写 closed 矩阵；玩家在铰链中心 1.8 m 外保持关闭，进入阈值后才沿同一铰链打开。`measure()` 保留整墙 union，拾取 / 遮挡改用门洞切分、最多 16/32 m 的墙段 AABB，闭合墙内空地不误命中。
- 包围盒：主建筑上沿严格为 `(baseYMm + platformMm + ridgeMm)/1000`，`floorY[0]` 不参与；回归用 base=1.2 m、platform=0.4 m、floorY=2.6 m、ridge=4.566 m，测得上沿 6.166 m、高 4.966 m。
- 太阳：`setCameraYaw()` 保留当前时辰并原位更新共享方向对象；45°→135° 时 XZ 向量旋转 90°、Y 不变。公开入口回归确认 `createBuildingLayer` 与缺省策略可从 `@tianshu/render/buildgen` 取得。
- API 核实（访问 2026-10-12）：Three 官方 [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) 确认 `compileAsync` 使用 `KHR_parallel_shader_compile` 且建议优先于 `compile`；[DataArrayTexture](https://threejs.org/docs/pages/DataArrayTexture.html) 与 [ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html) 确认本任务贴图数组和自写材质接口。
- 试点方案：上游 `pilot-plans.json` / `pilot-kits.json` 当前仍未入库，无法给真实试点数。HeapProfiler `samplingInterval:1` 含正向探针；预热 10,000 帧后取得连续三窗 `update()` 0 B；一次整组复跑末尾仅连续两窗而失败，原样单文件及整组复跑均通过，未放宽采样。
- 真机编译（2026-10-12，Chrome WebGL2、Three 0.186.1，导出最终源码后在浏览器用 `ShaderMaterial` 实编）：五个 static-lit 变体（色、屋顶淡出、alpha 测试、深度、屋顶深度）在无色调映射与 ACES 下均编译、链接并出像素；暗角与招牌着色器同样通过。招牌两种贴图都未标 sRGB，采样与输出都不转换，显示色等于源字节（92,54,31），本轮不改。
- 偏离：城墙适配器当前生成墙身、顶面和门洞空缺，不生成详细垛口 / 门楼；正式细节仍应复用后续城墙网格器，层本身已消费 `input.walls` 并保持每格 2 Mesh。

## 4. 开放问题（附默认值）

- 正式图层异步解码 / WebP 条带未有资产实现；默认按 `kit.layers` 一次分配 1×1 分类色 `DataArrayTexture`，不改变材质程序。
- 创建接口无初始相机位置；默认先以世界原点排序，收到首个 `setFocusOcclusion(focus, radiusM)` 后立即按焦点重排尚未上传格。
- 试点夹具未入库；默认只报告六迷你方案，不伪造试点实测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/16` §6.7：后续登记公开 `@tianshu/render/buildgen` 接口、可选 `batchStrategy / pickStrategy / layerTextures / signText / cellVisible` 端口及诊断钩子；城墙详细配方落地后替换 r9 简化适配器。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ r10：Worker 接 `generateCells(plans, kit, lod, cellSizeM)`；回传 `CellPayload` 后完整 typed array 留主线程，`restore()` 据 CPU 副本重建 geometry；生成入口替换后仍在主线程对三程序和纹理预热。
- ✅ ENG-town2-render-ports：动态导入 `@tianshu/render/buildgen` 创建层并持续 `update`；`insideBuildingId=null` 对旧单元调用 mode 0，非空目标按投影态调用 mode 1/2；偏航与玩家焦点送 `setCameraYaw` / `setFocusOcclusion`。
- ✅ l1 `/town-lab`：从公开入口用 `measure(index)` 看体量，用 `stats` 看 visibleCells / pending / draw / triangles / bytes / lastCellMs；精确视锥 HUD 通过 `cellVisible(bounds)` 适配。
- ✅ 美术线：`LayerTextureSource` 深度严格等于 `kit.layers` 顺序，各层同宽高 RGBA；`repeatM[layer*2..+1] = 1000/repeatMm`，正式贴图替换占位不改程序键。
- ✅ 命名回归覆盖每格 2 Mesh / 逐顶点 `aUnit.x`、四偏航、共享太阳、三态、预热三程序、非标准 floorY 包围盒、夜窗、门扇、城墙、GLSL bit1、招牌、暗角、透视圈、LRU、单格上传、恢复、公开入口和源码禁项。
- ✅ `update()` 1 B HeapProfiler 采样取得连续三窗 0 B；两个 `InstancedMesh.dispose()` 各一次，第二次层释放不重复；未新增依赖或修改 `node_modules`。
- ✅ 四条规定命令、`git diff --check` 与禁项搜索通过；全量仅有既有 localhost:3000 拒绝、缺素材及包体提示，不影响退出码。

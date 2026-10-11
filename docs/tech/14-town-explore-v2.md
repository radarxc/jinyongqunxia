# tech/14 · 城镇探索 v2：代码生成 3D 古建、原地进屋、店主对话采买、小地图寻路（AR-114）

> 上游：作者 AR-114（2026-10-10 / 10-11）、AR-19 §3.3（店铺可直接进入、不切地图、和 NPC 交互）、AR-79 / AR-104（人物身高）、AR-103 / AR-110（分工）。
> 实现契约：引擎 / 数据 / core / 界面见 `tech/15-town-explore-v2-spec.md`；3D 古建 / 室内 / 人物见 `tech/16-town-3d-spec.md`。三份冲突时以本文 §3 决定表为准，并在任务报告里写明。
> 本文取代：render `ENG-09` 城镇小地图的贴图建筑与"整图半透明"进屋方案；tech/02 L182「屋檐 2 m / 门高约 1.9 m」的游戏化压缩（城镇视觉）；design/26「城镇 WASD / QE 为六向移动」；design/26 L173「打开总图不直接旅行」对区域图的限制。

## 0. 结论先行

1. 城镇并入**区域引擎**：每城一个区域场景 `sc_<NN>_town_<city>`，跑 core 探索运行时与 `render/region`；旧 `town-runtime.v1`、`render/town`、`TownPage` 在作者闸门 C 通过后退役。
2. 建筑由**代码按布局的占地、类型、年代参数生成 3D 古建**，门窗柱檐按真实尺寸（门净高 ≥ 2.1 m，屋面按《营造法式》举折）；屋顶和朝镜头的墙可淡出剖开，人原地走进屋里；Q/E 四向转镜头。45° 手绘建筑图退出城镇运行时，留作造型参考和大地图缩略图。
3. 人物 **3D**：主角用换装模型，NPC 用通用模型克隆；身高取数据（男 1.76 / 1.81 / 1.86、女 1.58 / 1.66 / 1.72 m），城镇用减面版（LOD0 ≤ 2.5 万三角 / 1024²）。
4. **采买在屋里**：进店 → 点店主 → 设施对话 →「看看货」→ 店铺界面，买卖经 core；侧栏模拟删除。
5. **右上小地图跟镜头转**，点哪走哪；**缩放快捷键** `=`/`+`、`-`、`0`，加滚轮 / 捏合；WASD 按住走、Q/E 转镜头。
6. **不加运行时社区库**；收益来自离线减面 + 压缩贴图 + three r186 自带功能（§5）。
7. 推进：P1 先在现有城镇页见效（缩放键、小地图、真店铺、身高）；P2 新引擎 + 3D 试点（大理 ch01、大理 ch10、吐鲁番 ch10）走三道作者闸门；P3 铺开到全部城镇。

## 1. 现状为什么粗糙（2026-10-10 核实）

1. **比例**：城镇 3D 主角写死 3.4 m（`packages/render/src/town/scene.ts` L98、`region/scene.ts` L114），标准 1.70 / 1.62 m；建筑图按真实尺寸 → 人约两倍大；3D 主角按指数插值移动，脚底打滑；按包围盒量身高还会把发髻算进去（约矮 3%）。
2. **建筑**：一栋 = 一张 45° 图贴在朝镜头的平面上；无墙 / 顶 / 门洞，占地内 0 个可走格；"进入"= 整图 28% 透明 + 两块方片。200 份布局 6,902 栋里 56.5% 的门不朝南，而手绘门全画在左下；还有共用门格（大理赌坊与店铺 bi_0023 共用 [-10,78]）。
3. **店铺 / 对话**：TownPage 写死的模拟（假银两 1280、不存在的物品、开场即弹的李文秀对话）；core `ShopRuntime` 无命令；城镇 NPC / 事件锚点在 `apps/game/build/content-plugin.ts` 写死为空；Ink 绑定只认 `sc_*`，没有「开店」动作；`businessRef` 指的是营生（biz_*），不是店铺。
4. **缩放**：只有滑杆 0.65–2.5，实际倍率随窗口高度变；无滚轮 / 键盘 / 捏合。
5. **数据**：只编译了大理、临安；其余 178 个城镇节点打开是改名的大理；编译器丢掉城墙、城门、911 株植被、名称；约 37 份布局用的套件它不认。
6. **移动**：core 点击即瞬移到终点，画面逐格补动画并锁输入、不能取消；A* 每命令跑两遍、每次弹出全排序；`townRevision` = 城镇 JSON 哈希 → 改一点数据城里存档就读不出。区域运行时也每次查询全图解码。
7. **其他**：额外 40 ms 定时器造成双渲染，fps 读数虚高；城镇无上下文恢复与画质档；页面内的统计行与帮助文字占位。

## 2. 目标体验

从大地图进城，在城门内出生；人与门窗、屋檐比例协调。右上角小地图随镜头转，点哪走哪（路线可随时取消、改道）。`+`/`-`/`0` 缩放，滚轮 / 捏合连续缩放，Q/E 转镜头，WASD 按住走。走到药铺门口，屋顶淡出、朝镜头的墙降为 1 m 矮墙、屋外变暗，屋里有柜台、百子柜和掌柜。点掌柜 → 对话 →「看看货」→ 店铺界面（真银两、真库存、真价格）。出门后屋顶复原；从城门或 HUD「出城」离开。

## 3. 决定表

| # | 决定 | 依据 |
|---|---|---|
| D1 | 建筑由代码按占地 / 类型 / 年代参数生成 3D 古建，门窗柱檐按真实尺寸（tech/16 §3） | AR-114；tech/07 §5.5.2 |
| D2 | 进屋原地进入（不切地图）；`palace` / `palace_hall` 与内容标了 `interiorScene` 的（有楼上 / 地窖可走的）走门切独立子场景（P3） | AR-19；tech/02 §3.5 |
| D3 | 人物 3D：主角用换装模型（男性模板 `tpl_m_*` 未出前用 `npc_zhujue__ch00_m` 城镇减面版），NPC 用通用模型克隆；身高取数据，按头顶骨骼量身高缩放 | AR-114；AR-79 / AR-104 |
| D4 | 1 世界单位 = 1 m；tech/02 L182 的压缩口径对城镇作废；城镇屋顶 v2 不可站立，轻功上房以后排期时再裁定（canon qg2「2 级」作抽象层级） | AR-114「大小不匹配」 |
| D5 | 城镇并入区域引擎，每城一个区域场景（≤ 256² 槽）；旧 town 栈在闸门 C 后退役 | design/22 §1；tech/01 §6.4 |
| D6 | Q/E 四向转镜头；WASD / 方向键按住走（屏幕相对）；点地 / 点小地图寻路，可随时取消改道；右键停步 | AR-114 拍板 1；tech/02 §1.5；区域页先例 |
| D7 | 缩放单位 px/m：键盘与按钮在 48 / 64 / 80 / 96 档间切换，滚轮 / 捏合 40–112 连续；`=`（含 Shift 即 `+`）/ 小键盘 + 放大、`-` / 小键盘 − 缩小、`0` 复位（街巷 80、室内 96）；带 Ctrl / Meta / Alt 不拦截（保留浏览器缩放），输入框 / 输入法组字时不响应 | tech/02 §1.4；AR-114 |
| D8 | 右上小地图跟镜头转（指北针），点空地 → `world/travelTo{hex}`，点图标 → 走到该建筑 / NPC；`M` 展开全城图（上北下南、图例、设施列表可点）；设置 `minimapNorthUp` | AR-114 拍板 4；tech/02 Q11 由此定 |
| D9 | 采买：进店 → 点店主 → 设施对话（Ink）→「看看货」（`facility/openShop`）→ 店铺界面；买卖走 core `shop/buy|sell`；侧栏「市肆采买 / 与同行交谈 / 打开店铺」删除；「与同行交谈」改为队伍功能（P4） | AR-114；design/12；catalog/npcs-facilities |
| D10 | 打坐只在客栈房间、寺庙、僻静院落的打坐点；离城走城门，HUD「出城」在室外直接离城 | AR-19 与 design/11 L1081 两全 |
| D11 | 速度【建议值】步行 1.35 m/s、奔跑 4.5 m/s（点击远处默认跑）；沿路线匀速；动画播放率 = 速度 ÷（实测原生速度 × 身高），限 0.80–1.45×；走 / 跑切换滞回 2.2 / 2.6 m/s；转身 ≤ 540°/s | tech/16 §9 |
| D12 | 建筑材质按 tech/02 §8.5 自写 `static-lit` `ShaderMaterial`（`ROOF_FADE` 等 define、共享 IsoLit uniform），**不用** `onBeforeCompile` 修补内置材质；城镇平滑光照、不描边不分阶（STYLE「写实古风」、design/22 L602 对城镇优先于 tech/02 §5），实验页留一个淡边缘加深开关给作者比；人物沿用 three 内置固定灯组（1 半球 + 1 方向光，灯数恒定不重编译），太阳方向与建筑共用 | tech/02 §4.1 / §8.5 |
| D13 | 吐鲁番 ch10（702 年唐西州）用 xiyu 土坯套件的唐代佛教变体：佛塔刹顶，不画穹顶和尖拱 | AR-113 第 6 条；史实 |
| D14 | 不加运行时 npm 依赖；离线工具用已有的 meshoptimizer 1.3、Pillow / numpy | §5 |
| D15 | v2 在集成分支 `claude/town-v2`（工作区 `.agents/wt/_town2`）开发，`townEngine` 开关（设置 / 开发面板 / `?town=`）保护，闸门 C 通过后改为默认 | 主检出有他人进行中的任务 |

## 4. 架构总览

```text
data   region-map.v1（+ town-scene.v1 扩展）← 编译器 v2（packages/data/src/build/town/**）
         ← content/world/towns/*.yaml（源）+ assets/default/town/*/layout.yaml（布局，只读）
         ← 规划器 planBuilding（packages/data/src/build/town-plan/**，纯整数）+ 套件 content/town/buildkits/*.yaml
core   world/explore/**（探索图、二叉堆 A*、逐 tick 行走、交互、设施、出口、打坐、读档纠偏）
         command/{explore,shop}-handler.ts、economy/shop-*.ts（定价、查询、店铺定位）
render region/**（懒加载块 render-explore）＋ 端口：buildgen/**（render-buildgen + Worker）、actor3d/**（render-actor3d）
ui     components/explore/{TxMinimap,TxContextActions,TxShop}.vue
app    input/**（ActionMap、键位、ZoomController）、explore/**（适配器、小地图底图）、pages/ExplorePage.vue、ShopLayer.vue
```

- **为什么并入区域引擎**：区域栈已有分块地形与流式上传、四偏航旋转与 CameraHint、屋顶抖动淡出、上下文恢复、画质档、昼夜、门 / 触发器 / 宝箱、按距离 + 视线交互、Ink 绑定、`pendingMount`、Worker 内懒加载；旧城镇栈围绕刚被移除的 45° 贴图建，就地升级等于再造第二套寻路、交互、存档、剖切和小地图数据源。代价：区域运行时的全图解码与双跑 A* 必须修（≥ 96² 的地图本来就要修）；新增逐 tick 行走；存档版本升两次；v1 / v2 共存一段时间。
- **两条一致性规则**（细节见 tech/15 §2.4）：低于 2.2 m 的实体几何只能在「占地 − 可走面」或阻挡家具内；室内 / 门格可走按格心与边中点判定（C6），不用 design/22 的六顶点法（会吃掉门洞）。→ core 的可走性与画出来的 3D 由构造保证一致。

## 5. three.js 社区方案与插件选型（2026-10-11 调研，来源已核）

**结论**：没有值得打进运行时包的社区库。收益最大的是**离线资产处理**（meshoptimizer 减面 + KTX2 压缩贴图）和 **three r186 自带功能**。很多热门"性能库"要么重复 tech/02 已设计的东西（自写合并后处理、分块实例化 + CPU 压缩可见实例），要么改写 three 内部（`onBeforeCompile`、改 ShaderChunk、自建 GL 缓冲），会破坏 tech/02 §8.5（自写着色器）、§8.8（上下文恢复）、§9（WebGPU 迁移）。仓库 `.npmrc` 开了 `strict-peer-dependencies`，对 three 版本设上限的库会卡住以后升级。

| 类别 | 用什么 | 不用什么（原因） |
|---|---|---|
| 建筑外壳 / 屋顶 | 分格合并几何（Worker 出类型化数组）+ `buildingId` 顶点属性 + 每栋状态数据纹理（与 HexLayer 同一打包法） | BatchedMesh 做静态整城（比合并几何慢 30–50%，Firefox 无 `WEBGL_multi_draw` 退化为逐个绘制）；`SceneOptimizer`（实验性） |
| 室内家具 / 门扇 | 实例化 / 懒建室内批；`BatchedMesh` 只留作动态子集备选 | @three.ez/batched-mesh-extensions（改原型） |
| 门窗洞 | 竖条分解 / `Shape` 带孔（core） | three-bvh-csg（自称实验性、输出不保证闭合）；manifold 仅作离线备选 |
| 树木植被 | 分块 `InstancedMesh` + CPU 压缩可见实例；固定 30° 俯仰 + 4 偏航 → 每棵烘 4（或 8）向公告板，转镜头时交叉淡化 | @three.ez/instanced-mesh（InstancedMesh2 改 `renderer.properties`、自建 GL 缓冲，丢上下文即失效，仅 WebGL）；八面体 impostor（未发布） |
| 3D 人物 | `SkinnedMesh` + `SkeletonUtils.clone` 共享；混合器限频、离屏暂停 | three-vat（建库两周 4 个大版本）、OpenVAT（GPL、无 three 运行时） |
| 人物资产（离线零包体） | 已有 `tools/model3d/dressup/pack_glb.mjs`（meshoptimizer 1.3）+ `textures.py`；以后上 KTX2（`ktx create`，ETC1S） | gltf-transform simplify（只看位置，不适合蒙皮）；Draco（解码器约 81 KB，meshopt 只 7.3 KB 且能压动画） |
| 运行时解码 | `GLTFLoader` + `MeshoptDecoder`（独立块 `render-meshopt`）；以后 `KTX2Loader` 进已有预算的 `basis` 块 | — |
| 文字 | 离线烘招牌图集；名牌沿用 tech/02 §6.6 Canvas2D 图集 | troika-three-text（默认从 Google Fonts / jsDelivr 拉字体，国内易被墙；SDF 另开 GL 上下文） |
| 后处理 / 阴影 | 自写合并后处理；AO 烘进顶点；正交相机一张贴合阴影图 | pmndrs postprocessing（peer 上限 three < 0.187 会卡升级）、N8AO、realism-effects（停更）、CSM 插件（改全局着色块） |
| 拾取 | 建筑按占地包围盒、人物胶囊体、地面六角 | three-mesh-bvh 仅在需要三角级精确拾取时试用 |
| 观测 | `renderer.info` + 实验页 300 帧 P50 / P95；Spector.js 扩展；stats-gl 只进 devtools 块试用 | three-perf / r3f-perf |
| WebGPU | 仍按 tech/02 §9 闸门；以上全是 core 功能，迁 TSL 可平移 | WebGL-only 的社区库都会挡迁移 |

量化：每个人物三张 2048² JPEG 解码约 64 MiB 显存，1024² baseColor 约 5.6 MB、KTX2 约 2–4 MiB；三角面降 75%（10 万 → 2.5 万）。20 个 NPC × 2.5 万仍超中档每帧 20 万上限 → 靠 tech/16 §9 的 LOD 与按档名额。

主要来源：three r186 发布说明与源码（BatchedMesh、GLTFLoader、meshopt_simplifier）；three.js issue #28776（BatchedMesh 性能）；MDN browser-compat-data `WEBGL_multi_draw`；agargaro/instanced-mesh、gkjohnson/three-mesh-bvh / three-bvh-csg、zeux/meshoptimizer v1.3、donmccurdy/glTF-Transform、pmndrs/postprocessing（issue #643）、protectwise/troika、KhronosGroup/KTX-Software 各仓库；npm 下载量与 bundlephobia / bundlejs 体积。未核实：InstancedMesh2 / troika / n8ao 在 r186 上的实测（均已列为不用）；处理后 Tripo GLB 的实际下载体积（试点实测）。

## 6. 分期

| 期 | 内容 | 出口 |
|---|---|---|
| P0 | 协调者：WIP 基线、AR-114、本文与 tech/15 / 16、集成工作区与任务登记、磁盘清理清单（作者确认）、`DES-town2-docsync` | 任务可开跑 |
| P1 | 现有城镇页先见效（引擎无关、可复用）：输入层、ActionMap 与缩放、身高、小地图、店铺 schema / core / 界面、设施对话、删模拟 | 检查点 G0（协调者实走） |
| P2 | 四条线并行：E 引擎（区域场景扩展、编译器、探索运行时、会话、ExplorePage）；B 建筑（规划器、网格器、建筑层、实验页）；I 室内；C 人物；美术线；最后 Claude 整合 | 闸门 A → B → C |
| P3 | 全部 200 份布局 + 临安、其余年代套件、设施与货单规则、通用设施对话、剧情 NPC 放置、大型院落子场景、人物 KTX2、退役 v1 | 全量上线 |
| P4 | 营业时间、昼夜灯光、路人、环境音与脚步、手机交互、疾跑耐力、队伍交谈、战斗页迁 ActionMap | — |

任务清单：P1 与 E 线见 tech/15 §12；B / I / C / 美术线见 tech/16 §13。

## 7. 闸门

| 闸门 | 谁验 | 看什么 | 通过标准 |
|---|---|---|---|
| G0（P1 后） | 协调者 | 并主干后在 5173 现有城镇页实走（9223 无头桥截图，必要时作者 Chrome） | 缩放键 / 滚轮 / 档位；小地图显示、跟转、点击寻路；主角身高正确；店员对话 → 店铺 → 购买，银两与背包变化来自 core；模拟代码 grep 为零；`pnpm check` 全绿；截图发作者 |
| A 体量与比例 | 作者 | `/town-lab` 联系表（占位贴图）：2 套件 × 6 类型 × 4 偏航；手绘对照；三座试点城 zoom 48 / 80、yaw 45 / 225；地标页 | 自动数值见 tech/16 §11.2；作者逐类型逐套件定，原话入 AR |
| B 材质 + 走进店里 | 作者 | 绘制贴图 + 招牌，12:00 / 18:30 / 21:00；店 / 药铺 / 客栈 / 铁匠：远处 → 门口 → 室内 → 柜台前 → 连转三次；女主角换装 + 男性兜底；店员在站位；X 光帧 | 见 tech/16 §11.2 |
| C 试点整合 | 作者 | `?town=v2` 下大理 ch01 / 大理 ch10 / 吐鲁番 ch10 实玩 | 比例对；原地走进店、屋顶与朝镜头墙剖开；店员对话 → 真实购买；小地图跟转 / 上北下南 / 点击寻路；缩放键；Q/E；出城再入城；店里存读档；桌面 ≥ 60 fps；draw / 三角在 tech/02 §8.2 档内 → 改为默认 v2 |

- 每个任务：校验命令 + GPT 审核后合入 `claude/town-v2`；每波在集成分支跑 `pnpm check`，负载低时 `pnpm check:perf`。
- 每个闸门前并主干（先 dry-run），评审材料放 `assets/default/buildkit/review/rNN/`，并按总览页做法发评审页（Artifact，同 file_path 重发保持地址）。
- 中端安卓 + iPhone 各一台在闸门时跑 `__townLab.bench()` 记录，不作门。

## 8. 风险与待作者在闸门上定的事

- **在闸门上定**（不阻塞开工）：客栈 / 寺殿按真实比例比手绘高 28% / 19%；城墙压缩到 6 m（史载 8–12 m）；崇圣寺千寻塔压缩到约 30 m（实高 69 m）；城镇屋顶暂不可站；招牌字体（马善政 Ma Shan Zheng，SIL OFL 1.1；与 AR-101「方正侠客体」的授权问题另议）；吐鲁番唐式佛教风格（按史实定，作者可改）。
- **换装身体从 19.6 万减到 1.2 万**可能伤手和脸：不过关时城镇主角先用 zhujue 城镇减面版 + 武器插槽；男性模板 `tpl_m_*` 未出。
- **与大地图线共用文件**（`session-projection.ts`、`projection.ts`、`asset-manifest.ts`、`content-plugin.ts`、`App.vue`）：v2 把城镇投影挪进新文件，少碰这些；必须改时单任务串行，先与该线协调者对齐。
- **执行器漂移**：小任务 + 命名测试 + 锁定金样 + A* 调用计数器 + 骨架任务先建桩（后续任务只替换自己的桩）；traex 两轮不收敛转 Claude（AR-110）。
- **体量**：P0–P2 约 60 个任务，并行 ≤ 3（磁盘 + GPT 限流）；粗估闸门 A 在 P2 开工后约一周，闸门 C 约三周（随审核轮数浮动）。
- **外部**：Gemini 出图约 1 小时 / 套件、需作者 Chrome 前台；字体下载需作者许可；不读 `.env`、对外请求不带作者信息。

## 9. 复用的现有代码

`packages/render/src/region/{scene,objects,terrain}.ts`（抖动淡出、分块流式、CameraHint）；`packages/render/src/camera/iso-camera.ts`（缩放档、`IsoCameraRotation`）；`apps/game/src/region/presentation.ts`（屏幕相对键 → 六向）；`packages/render/src/battle/model-stage.ts`（克隆、共享片段、`retargetBattleClips`、原生步速）；`packages/render/src/dressup/actor.ts`（`createDressupActor`）；`packages/render/src/gltf/load.ts`；`packages/core/src/economy/shop.ts`（`ShopRuntime`）；`packages/core/src/dialogue/index.ts`（Ink 桥）；`packages/core/src/world/region-runtime.ts`（`regionEdges`、视线交互）与 `command/region-handler.ts`（`trigger()`）；`packages/data/src/schemas/region-map.ts`（Door / Building / NpcSpawn / CameraHint）；`tools/model3d/dressup/{pack_glb.mjs,textures.py}`、`tools/model3d/capture_validation_shots.mjs`；`tools/agents/browser_eval.mjs`（9223 桥）；`apps/game/build/content-plugin.ts`（懒加载块与 `emitFile`）；`tools/perf/{budgets.json,check_size.mjs}`；`apps/game/scripts/check-dev-chunks.mjs`；`tools/town/*`（布局与平面图，只读其参数）。

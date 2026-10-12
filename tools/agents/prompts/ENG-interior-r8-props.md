# 本任务：城镇 3D 古建 · 室内家具道具库（≥ 36 件程序化低模）+ 室内拼装与灯光烘焙

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 3、7 节（图元 `box / prism / quad / extrudeAlong`、`RecipeSink`、36 B 顶点格式与标志位）与 `tools/agents/reports/ENG-buildgen-p0-scaffold.md` 第 3 节（家具稳定下标 0–42 与名称），再打开 `packages/data/src/build/town-plan/fixtures.ts`（家具目录：下标、名称、尺寸、是否阻挡）与 `docs/tech/16-town-3d-spec.md` §8.3、§8.4、§7（灯光烘焙、AO、做旧）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」走进药铺能看见百子柜、柜台、药碾；铁匠铺有炉、风箱、砧；客栈有楼梯和桌椅。规划器（i1）决定家具的位置与尺寸（`fixtures` 元组），本任务按方案画出家具：程序化低模、尺寸与方案一致（玩家能否走过由规划器的 `blocks` 决定，几何必须落在对应矩形内，不能"看着挡路其实能穿"或反之）。

## 要做的事（`packages/render/src/buildgen/mesher/fixtures/`，不 import three）
1. **道具 DSL** `dsl.ts`：在 r0 图元之上的小组合语言（盒、柱、板、腿、抽屉格栅、旋转体轮廓 → 旋转、沿折线挤出），参数全为 mm 整数；每件道具 = 一个以家具局部原点（地面中心、前方 −z）为基准的函数 `(w, d, h, variant, lod, sink) → void`。
2. **道具实现**（按 tech/16 §8.4 清单，**至少 36 件**，三角 LOD0 / LOD1 不超表中值）：柜台、带格栅高柜、四层货架、百子柜（抽屉格 LOD0 用浅凹槽、LOD1 用贴图层）、布架、书柜、阅书桌、方桌、长凳、凳、扶手椅、供桌、床、箱、楼梯（14 级 + 梯梁 + 扶手）、炉（罩 + 烟囱）、风箱、砧与木墩、淬火盆、兵器架（6 件兵器剪影）、工具架、工作台、木桶、木箱、麻袋、酒坛、坛组、筐、草垛、马槽、佛台、造像（旋转体）、香炉、蒲团、屏风、台、赌桌、木人桩、旗架、柜台杂物组、灯笼、吊挂货物、说书桌。按 `fixtures.ts` 的稳定下标注册（`propsByIndex[idx]`），未实现的下标抛 `BUILDGEN_PROP_PENDING`。
3. **室内拼装** `interior.ts`：`buildInterior(plan, unit, kit, lod, sink)`——遍历方案 `fixtures`（跳过下标 ≥ 200 的站位），按 `[cx, cz, w, d, yaw]` 套四分之一转放置；写入**室内缓冲**（标志位"室内表面"、单元号 = 该建筑）；地面饰面（木地板 / 砖地，按设施类）一并生成。
4. **灯光烘焙**：模板灯点（柜台灯、门灯、炉火，取方案或按设施类缺省）→ 顶点 `aTint.a`（暖光、2.5 m 衰减，整数近似）；AO 规则写 `aMat.ao`（家具底 0.78、墙角 0.8）；每间室内三角 ≤ 3,000 / 1,200（超出时按 LOD 降级可选道具并报诊断）。
5. **贴图层**：道具采样共用 8 层道具贴图（`aMat.layer` 取 0–7 的道具层 + 标志位"采样道具数组"），层定义与 TOOL-buildgen-t1-placeholders 的 `props` 套件一致（层顺序见该任务报告或 tech/16 §12.1，未到时按名称常量表占位）。

## 测试（`packages/render/src/buildgen/__tests__/props.test.ts`，node 项目）
命名用例：
- 每件道具在其标称尺寸下：包围盒宽 / 深 = 尺寸 ±2%、高 = 尺寸 ±2%；四种 yaw 下包围盒按四分之一转正确交换宽深。
- 三角数（LOD0 / LOD1）不超 §8.4 表值，逐件列入测试快照。
- 阻挡道具的几何全部落在其 `[cx ± w/2] × [cz ± d/2]` 矩形内（外扩 10 mm 容差）；不阻挡道具高 ≤ 250 或下沿 ≥ 2200（与 INV-2 一致）。
- `buildInterior`：i1 的药铺 / 客栈 / 铁匠方案（若 i1 未合入，用测试内手写的 fixtures 元组）拼装后，单间三角 ≤ 3,000 / 1,200；全部顶点带"室内表面"标志与正确单元号。
- 灯光：离灯点 0 m 处 `aTint.a` 最大、≥ 2.5 m 处为 0、单调。
- 确定性：同输入两次哈希相同；`variant` 不同几何不同。
- `mesher/fixtures/**` 无 `three` import（读源码断言）。

## 协调者裁定（2026-10-12，r4 审核后；审核以此为准）
- **超预算处理**（细化第 4 条「降级可选道具」）：
  - 先把可选陈设降到 LOD1；仍超时，按确定性顺序删掉**不阻挡的可选陈设**（`blocks = 0` 或目录标 `lowClutter`），每删一件出一条诊断。
  - 必需或 `blocks = 1` 的道具一律不删。仍超预算时，按确定性顺序把这些道具换成**阻挡代理**，直到满足 3,000 / 1,200：
    - 代理是同一世界包围盒的实心盒（12 三角），顶面与侧面用该道具的主材质层；
    - 外形与阻挡矩形一致，INV-2 照常成立；
    - 每换一件出一条诊断。
  - 换成代理仍超时，在写入目标 `MeshWriter` 之前抛稳定错误 `INTERIOR_BUDGET_UNSATISFIABLE`，不提交部分批次。
  - 测试：
    - 纯必需道具超预算：断言代理存在、阻挡外形与 fixture 矩形一致、三角 ≤ 上限、诊断条数；
    - 代理仍超时：断言抛错，且目标 writer 顶点数为 0；
    - 真实可选陈设降级与删除及其诊断；
    - 删掉「必需楼梯必须被 skipped」一类期望。
- **`aTint` 通道**（tech/16 §6.2）：
  - 灯光烘焙只写 `aTint.a`；RGB 保留 `vertex.tint` 的前三通道，没给时用 `[255, 255, 255]`。
  - 测试断言无灯、灯内、灯外顶点的 RGB 不随灯点变化。
- **报告**：按实际行数与语义更新，没覆盖的不标 ✅。

## 约束
- 只写：`packages/render/src/buildgen/mesher/fixtures/**`、`packages/render/src/buildgen/__tests__/props.test.ts` 与本任务报告。
- 不改 `mesher/core/**`、配方、屋顶、`three/**`（建筑层的室内批由 r9 管理，本任务只产出类型化数组）；不改 data 包；不新增依赖。
- 不 import three；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-interior-r8-props.md`（≤ 60 行）：第 3 节列全部道具的尺寸、三角数（LOD0 / LOD1）与是否阻挡；第 7 节写给 r9（室内缓冲如何进 LRU 批、标志位）、r10（室内生成走 Worker 的 `interior(unit)` 消息）与 l2（走进店里模式要验的道具）的交接。

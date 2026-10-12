# 本任务：城镇 3D 古建 · 网格器 `hall` 配方的屋身（台基、台阶、柱网、梁、墙与门窗、斗拱、檐下陈设）

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 3、7 节（顶点格式、`RecipeSink`、图元、开洞、检查函数），再打开 `docs/tech/16-town-3d-spec.md` §3（尺寸标准与算例）、§5.1 第 1 条、§5.3、§5.4；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：「人物大小和建筑不匹配」——城镇建筑改为代码生成的 3D 古建，门窗柱檐按真实尺寸（门净高 ≥ 2100 mm、可走门宽 ≥ 1200 mm），写实古风、不卡通不缩微。`hall` 是最常用的配方（民居、店铺、寺殿……）。本任务做屋身部分，屋顶由 r2 / r3 做（本任务只在屋顶缓冲里留 r0 的桩屋顶，不改屋顶文件）。

## 要做的事（全部在 `packages/render/src/buildgen/mesher/`，不 import three）
1. `parts/platform.ts`：台基（高 = 方案 `elev[1]`，压沿石一圈，侧面 AO 0.78）。`parts/steps.ts`：台阶（踏高 150、踏宽 300，梯段宽 = 门宽 + 600，放在占地内台明上，不得伸出占地）。
2. `parts/columns.ts`：按开间（奇数间；跨 < 5 m 单间敞开店面、< 11 m 三间、< 18 m 五间，明间 = 跨 ÷（1 + 2×0.82 [+ 2×0.68]））排柱网；柱径 H/11（限 180–300，殿堂 H/10 限 350–500）；LOD0 八角柱、LOD1 六角柱；柱础。
3. `parts/beams.ts`：柱头以上梁架（民居 / 店 350、殿堂 900 含 550 斗拱带）。`parts/brackets.ts`：殿堂 LOD0 每组约 60 三角的斗拱（柱头一组 + 每间补间一组），LOD1 只画彩画带。
4. `parts/walls.ts` + `parts/frames.ts`：按角色出墙（用 r0 的 `openings`，不用布尔运算）——前墙：门（落在方案 `entrances` 指定位置，默认明间居中）+ 窗，或店面敞口 + 板壁；山墙（硬山）或带窗木板壁；后墙（宽 ≥ 2 m 的每间一扇小窗）；门窗框 100 mm、门扇 / 格扇内凹 60–100 mm、不透明带暗衬（不用 alpha 测试）；每个顶点写 4 位立面掩码（角柱两位），室内隔断另标。
5. `parts/dressing.ts`：檐下陈设（只放在占地内台明上；灯笼、招牌挂点下沿 ≥ 2250）。
6. `recipes/hall.ts`：串起上面各部件（替换 r0 的 hall 桩），按方案 `storeys = 1` 处理（两层由 r4 做）。
7. 补全 `mesher/core/inspect.ts` 里 r0 留下的 INV-2（净空：50 mm 重心网格采样、floors 内 `floorY + 50 < y < floorY + 2200` 不得有实体，阻挡家具矩形除外）与 INV-4 桩（屋顶不低于 floors 上方 2200）；INV-6 仍留给 p4 / i1。

## 测试（`packages/render/src/buildgen/__tests__/hall.test.ts`，node 项目）
命名用例：r0 的 6 个迷你方案中所有 hall 类方案 × 4 个偏航 × LOD0 / LOD1：INV-1、INV-2、INV-3、INV-5 无诊断；柱数 = (间数 + 1) × 列数；台基顶高 = `elev[1]` ±1 mm；门洞净高 ≥ 2100、净宽 ≥ 1200；三角数在 tech/16 §6.5 预算内（民居 2,500 / 1,200、店 3,000 / 1,400、寺殿 9,000 / 4,000）；同输入哈希稳定；`mesher/**` 无 three import（沿用 r0 的检查）。

## 约束
- 只写：`packages/render/src/buildgen/mesher/parts/{platform,steps,columns,beams,walls,frames,brackets,dressing}.ts`、`packages/render/src/buildgen/mesher/recipes/hall.ts`、`packages/render/src/buildgen/mesher/core/inspect.ts`、`packages/render/src/buildgen/__tests__/hall.test.ts` 与本任务报告。不改屋顶文件（`mesher/roof/**`，r2 / r3）、不改其他配方。
- **协调者 10-11 返修裁定扩大的写集**（tasks.json 同步）：`packages/render/src/buildgen/stubs.test.ts`（r1 已接管 INV-2 / INV-4：空网格返回 `[]`，只保留 INV-6 抛桩断言）、`packages/render/src/buildgen/testing/mini-plans.ts`（迷你方案 floors 改成与 tech/16 §3 金样一致的室内净尺寸，例如 6×5 店铺室内约 4.4 × 3.1 m，不再统一内缩 300 mm；fixture 不得 import mesher）、`packages/render/src/buildgen/{generate,inspect}.test.ts`（只在依赖迷你方案 floors 数值或 INV-2/4 桩语义处修改，不删用例、不放宽断言）。
- 不 import three；不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。包级 render 测试含 rig CPU 性能门，负载高时失败如实报告，不得放宽或跳过。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r1-hall-body.md`（≤ 60 行）：第 3 节列各类型的三角数、柱数、门洞尺寸实测；第 7 节写给 r2 / r4 / r6 的交接（屋身顶标高、屋顶挂接点、立面掩码约定）。

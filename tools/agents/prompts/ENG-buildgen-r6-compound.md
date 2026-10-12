# 本任务：城镇 3D 古建 · 院落配方 `compound`——院墙（带压顶）、门楼、正房 / 厢房（hall 子配方）、廊、照壁

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-p3-compound.md`（`PartTuple` 各字段含义、各布局的部件表）与 `tools/agents/reports/ENG-buildgen-r1-hall-body.md`、`ENG-buildgen-r2-roof-a.md`、`ENG-buildgen-r4-storeyed-stall.md` 的第 3、7 节，再打开 `packages/render/src/buildgen/mesher/recipes/{compound,hall,storeyed}.ts`（compound 是 r0 的桩）与 `docs/tech/16-town-3d-spec.md` §5.1 第 5 条、§5.3（立面标记）、§6.3（院落部件的单元号接在所有建筑之后）、§6.4（院子态 1、室内态 2）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城里的大宅、衙门、寺院是院落；玩家走进院门时，朝镜头的院墙降为 1 m 矮墙、显出院子（剖切态 1），再走进正房时该房进入态 2（屋顶淡出 + 朝镜头的墙剖开）。所以院落的每个部件都要有**独立单元号**（院墙一个、门楼一个、每座房一个），院墙顶点要带正确的立面掩码与"可剖候选"标志，院墙降低不能把门楼与房屋一起降掉。

## 要做的事（`packages/render/src/buildgen/mesher/`，不 import three）
1. **`recipes/compound.ts`**（替换桩）：遍历方案 `parts`：
   - `Enclosure` → `parts/enclosure.ts` 院墙（厚 / 高按套件 `walls.enclosure`、压顶瓦），四面分段，**每段顶点带其世界立面位**（S/W/N/E）与"可剖候选"标志，转角柱带两位；门楼处断开。
   - `Gatehouse` → `parts/gatehouse.ts` 门楼（悬山顶，门洞 ≥ 1200 × 2100，门扇位置写进 doors 缓冲）。
   - `Hall` / `Wing` → 调用 `hall`（或 `storeyed`，按 `storeys`）子配方，局部坐标套部件的位置与 yaw。
   - `Gallery` → `parts/gallery.ts` 廊（柱 + 檐，净高 ≥ 2300）；`ScreenWall` → `parts/screen-wall.ts` 照壁（大理白墙青瓦压顶，高 2.4–3.0 m）；`Yard` 只出地面饰面（砖地）；`Trellis` 复用 r5 的葡萄架（若 r5 未合入，先抛 `BUILDGEN_PART_PENDING`）。
   - 单元号：院落整体的单元号用于院墙与门楼；每座房用方案给的部件单元号（接在所有建筑之后，见 §6.3 / p3 报告）。
2. 配方注册：只替换 `compound` 的桩。

## 测试（`packages/render/src/buildgen/__tests__/compound.test.ts`，node 项目）
命名用例：
- `pilot-plans.json`（p4 导出）中全部院落 × 4 偏航 × LOD0 / LOD1：INV-1…5 无诊断；每个部件的顶点单元号正确且互不混用。
- 院墙立面标记：每段院墙的顶点立面位与其世界朝向一致（4 偏航下逐段断言）；转角柱带两位。
- 门楼门洞净空 ≥ 1200 × 2100（INV-3 盒内无三角）；照壁不在门楼到院子的通路矩形内。
- 三角数在 tech/16 §6.5 预算内（院落 7,000 / 3,200、衙门 / 镖局 / 庄 12,000 / 5,500、王府 15,000 / 7,000，报告列实测）；同输入哈希稳定。

## 约束
- 只写：`packages/render/src/buildgen/mesher/recipes/compound.ts`、`packages/render/src/buildgen/mesher/parts/{enclosure,gatehouse,gallery,screen-wall}.ts`、`packages/render/src/buildgen/__tests__/compound.test.ts` 与本任务报告。
- 不改其他配方、部件、屋顶与 `core/**`（需要的扩展只加可选参数并在报告说明）；不改 data 包；不新增依赖。
- 不 import three；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r6-compound.md`（≤ 50 行）：第 3 节列试点院落的部件数、三角数、单元号分配；第 7 节写给 r9（院墙态 1 降低、院内房态 2 的单元号对应）与 l1 / l2（院落在实验页上的检查点）的交接。

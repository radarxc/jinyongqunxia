# 本任务：城镇 3D 古建 · 特殊建筑配方——密檐塔（崇圣寺千寻塔）、八角塔、城墙、城门

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r2-roof-a.md` 与 `ENG-buildgen-r3-roof-b.md` 的第 3、7 节（剖面、屋脊挤出、歇山 / 攒尖）与 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 7 节（`extrudeAlong` 的折线接头），再打开 `packages/render/src/buildgen/mesher/recipes/{pagoda-dense,pagoda-oct,citywall,gate}.ts`（r0 的桩）、`content/town/buildkits/song_dali.yaml` 的 `landmarks` 与 `cityWall`，以及 `docs/tech/16-town-3d-spec.md` §3（城墙 / 塔一行）、§5.1 第 6–8 条、§6.5；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇 3D 古建要有地标与城防：大理崇圣寺千寻塔（方形 16 重密檐，实高 69 m，按 96 m 城的比例压缩到约 30 m）、两座小塔（八角 10 层约 15.5 m）、城墙（史载 8–12 m，压缩为 6 m、顶宽 4 m、外侧垛口、内侧女墙）与城门（城台 + 门洞 4.5 × 5.2 m + 歇山门楼）。这些压缩值在闸门 A 由作者定，套件可改参数、不改代码。城门洞是出入城的通路，必须可走。

## 要做的事（`packages/render/src/buildgen/mesher/recipes/`，不 import three）
1. **`pagoda-dense.ts`** 密檐塔：方形、1.2 m 须弥座、6.5 m 首层带佛龛（浅凹）、16 重叠涩砖檐（出 450、板 250）；收分曲线：0.7 高处前 +6% 外鼓，之后收到 0.62·W0（整数万分比插值）；角部微翘 80；塔刹（复用 r3 的宝顶）；总高 = 套件 `heightM` ±1%。全部进屋顶批（远处仍可淡出不需要，但单元号要有，供拾取与透视）。
2. **`pagoda-oct.ts`** 八角塔：八角各层 + 檐环 + 塔刹；层数与高按套件。
3. **`citywall.ts`** 城墙：沿 `CityWallView.points` 折线用 `extrudeAlong` 挤出梯形断面（底宽按 `batter` 收分、顶宽 4 m、高 6 m）；外侧垛口（`merlon: [间距, 宽, 高]`）、内侧 1.0 m 女墙；折线拐角无缝（用 r0 修过的斜接 / 封闭接头）；在 `gates[]` 的位置断开（门洞宽度处不出墙体）。每 10 m 城墙三角 ≤ 300 / 150。
4. **`gate.ts`** 城门：城台（与城墙同高、加厚）带梯形门洞（宽 ≥ 4500、高 ≥ 5000，按套件 `gate`）+ 其上歇山门楼（复用 r3）；门洞内 0 三角（INV-3 同理）；城门 LOD0 ≤ 8,000 三角、LOD1 ≤ 3,500。
5. 配方注册：只替换这四个配方的桩。

## 测试（`packages/render/src/buildgen/__tests__/special.test.ts`，node 项目）
命名用例：
- 密檐塔：总高 = `heightM` ±1%；恰 16 重檐；各层宽度自 0.7 高处以上单调不增（收分单调）；角部起翘 80 ±5 mm；LOD0 ≤ 6,000、LOD1 ≤ 3,000 三角。
- 八角塔：层数与高 ±1%。
- 城墙：沿 L 形与七边形折线挤出后，按几何位置合并的网格无只出现一次的边（拐角无缝）；垛口间距 = 套件值 ±1 mm；门洞位置无墙体三角；每 10 m 三角在预算内。
- 城门：门洞 ≥ 4500 × 5000 且洞内 0 三角；门楼歇山与城台无缝（共享边缝 ≤ 1 mm）。
- 同输入哈希稳定。

## 约束
- 只写：`packages/render/src/buildgen/mesher/recipes/{pagoda-dense,pagoda-oct,citywall,gate}.ts`、`packages/render/src/buildgen/__tests__/special.test.ts` 与本任务报告。
- 不改其他配方、部件、屋顶与 `core/**`（需要的扩展只加可选参数并在报告说明）；不改套件 YAML 与 data 包；不新增依赖。
- 不 import three；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r7-special.md`（≤ 50 行）：第 3 节列塔高 / 檐数 / 收分实测、城墙每 10 m 三角、城门三角与门洞尺寸；第 7 节写给 r9（地标单元号、城墙不参与剖切）、编译器（城门洞宽与 `Exit` 位置对应）与闸门 A（压缩值请作者定的清单）的交接。

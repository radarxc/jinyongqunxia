# 本任务：城镇 3D 古建 · 室内模板（二）——布庄、书肆、当铺、钱庄、镖局前厅、武馆、寺庙、公堂、赌坊、马厩、仓房、哨所

**第一个动作**：读 `tools/agents/reports/ENG-interior-i1-core.md` 第 3、7 节（模板文件写法、求解器扩展点、站位与 `blocks` 语义）与 `tools/agents/reports/DES-interior-01-facilities.md` 第 7 节（各模板在试点城里的房间尺寸实例），再打开 `packages/data/src/build/town-plan/interiors/{solver,general-store,pharmacy,smithy}.ts`（照它们的写法）与 `docs/tech/16-town-3d-spec.md` §8.1–8.3（模板表）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10，逐字）：「希望用threejs做一个能进入建筑的游戏体验。」走进城里每一类可进的房子都要有合乎用途的陈设和人：当铺高柜后的掌柜、镖局前厅的总镖头、寺庙佛台前的僧人、公堂上的官员与衙役、赌坊的庄家。i1 已实现求解器与七类模板（杂货、药铺、客栈、酒肆、住宅、铁匠、货摊）；本任务补齐其余 12 类，替换 i1 留下的 `INTERIOR_TEMPLATE_PENDING`。

## 要做的事（`packages/data/src/build/town-plan/interiors/`，纯整数）
按 tech/16 §8.3 表逐类实现（最小房间、必需陈设尺寸、可选陈设、站位）：
- `cloth.ts` 布庄（布架 500 × 2200、裁布台 2400 × 800 × 850）；`books.ts` 书肆（书柜 400 × 2000 后墙 + 侧墙、柜台 1600、阅书桌）；
- `pawnshop.ts` 当铺（高柜 1350 高 × 600，满宽减 800 门道；掌柜台 +300，掌柜站高位）；`bank.ts` 钱庄（柜台带算盘账簿、钱箱、后屏风；柜员 + 护卫）；
- `escort.ts` 镖局前厅（台 2400 × 1200 × 150 + 主座与案、两列椅与茶几、**过道 ≥ 1600**、兵器架 / 旗架；总镖头 + 账房）；`school.ts` 武馆（两侧兵器架、台与座、木人桩、鼓；馆主 + 教头）；
- `temple.ts` 寺庙（佛台 0.5·W × 1200 × 900 **居中 ±100** + 2.4–3.0 m 造像、供桌、香炉、蒲团 ≤ 120 高不阻挡；僧人）；
- `office.ts` 公堂（仅设施文件绑定时用：台、案、屏风、签牌架；官员 + 4 名衙役）；`casino.ts` 赌坊（2–3 张赌桌 1600 × 1000 + 凳、钱柜；每桌庄家、钱柜、打手）；
- `stable.ts` 马厩（马槽、草垛；马夫）、`storehouse.ts` 仓房（成排木箱；守卫）、`guardhouse.ts` 哨所（凳、桌、兵器架；守卫）。
求解器的分派表只加这 12 类的注册（i1 的七类与求解器主体不动）。

## 测试（`packages/data/src/build/town-plan/__tests__/interiors-i2.test.ts`，命名用例）
- 房间 {4.4×3.1, 5.3×3.3, 6.8×4.6, 8.8×6.4} × 4 偏航 × 3 种亚格偏移 × 12 类（小于该类最小房间的组合按 i1 的降级规则处理并记录）：门内通道净空、顾客 / 来客站位 BFS 可达、家具在房内不重叠、矮杂物规则成立、店员类站位在 floors 外（有柜台的类）。
- 专项：当铺高柜 ≥ 1300 且掌柜台 +300；佛台中心与房间中线偏差 ≤ 100；镖局过道 ≥ 1600；公堂衙役 4 人；赌坊每桌一名庄家。
- 确定性：同输入两次方案 JSON 逐字节相同；禁用运算 grep（沿用 p0 的源码守卫测试）。

## 约束
- 只写：`packages/data/src/build/town-plan/interiors/{cloth,books,pawnshop,bank,escort,school,temple,office,casino,stable,storehouse,guardhouse}.ts`、`packages/data/src/build/town-plan/interiors/solver.ts`（**只许**加分派注册）、`packages/data/src/build/town-plan/__tests__/interiors-i2.test.ts` 与本任务报告。
- 不改 i1 的七类模板与求解器主体、p0–p4 的其他文件（类型若必须扩充，只新增可选字段并在报告说明）；不改 `content/**`；不新增依赖。
- 纯整数：不得用 `/`、三角函数、`sqrt`、`pow`、`random`、`Date`；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build/town-plan --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/data typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-interior-i2-more.md`（≤ 60 行）：第 3 节列 12 类在四种房间里的家具数、可走格数、站位数与降级情况；第 7 节写给 r8（新用到的家具下标）、p4（导出夹具需重出）与 l2（走进店里模式可选的验收房间）的交接。

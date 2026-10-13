# ENG-buildgen-r5-adobe 报告 · 城镇 3D 古建 · 西域土坯配方 adobe（含唐西州 tang_buddhist 变体）

## 1. 摘要（3–6 行）

- 已用正式 `adobeRecipe` 替换 r0 桩：八边切角厚墙、400/900 mm 烧砖墙基、四面洞口/椽头/木槽及西域变体齐备。
- `finial === 'tang_stupa'` 真正替换普通宝顶，实际发射覆钵、5/3 重相轮与宝珠；非唐穹顶显式用 `dome_plaster`。
- 全部顶上构件进入 roof 淡出批；无 Three.js import、无新增依赖、全门禁通过。

## 2. 产出（文件、行数、主要章节）

- `recipes/adobe.ts`（1062 行）；`parts/`：`parapet` 60、`joists` 109、`iwan` 68、`trellis` 58、`brick-lattice` 49 行；测试 541 行。
- `pnpm install --frozen-lockfile`：通过（lockfile 无变更，717 ms）；adobe 专项 21/21、buildgen 21 files / 262 tests 通过。
- render typecheck 通过；`env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：274 files / 2326 tests、1793 内容文件、size/dev-chunks 全通过，退出码 0。
- 首轮 check 仅 allocation 探针因负载抖动为 2325/2326；原阈值未改，探针单独 2/2 后第二次完整 check 通过。

## 3. 关键结论与数值

- 真实 YAML + `compileKit/planBuilding`：民居 1484/788、客栈 1820/996、唐寺 2408/1480 triangles（LOD0/1）；民居满足 1800/900 预算。
- 网格实测：上段前墙 450、后/侧墙 600；墙角切角 100；墙基 400/900；女儿墙 450；LOD0 椽距 600、四面外挑 300 mm。
- 窗台 ≥1800；前廊墙外深 1500、2–4 柱、净高 2300；花砖孔中心无泥墙遮挡，实体格条无 alpha；葡萄架底 2300 mm。
- 唐寺 LOD0：`dome=0, pointedArch=0, tangStupa=1, bowls=1, rings=5, jewels=1`；LOD1 相轮=3；非唐 `dome=1`，塔刹顶=roof[2] ±10 mm。
- 一致处：消费真实套件层号/variant 与 plan roof/finial，复用 r3 攒尖/穹顶；偏离处：2.2 m 以下内皮按 planner floor 净空自适应变薄，上段仍严格 450/600 mm。

## 4. 开放问题（附默认值）

- 前廊默认仅 `carved_shopfront`/客栈启用，深度按占地夹 1.5–2.4 m；闸门 A 可按作者观感收窄。
- 唐式塔刹用临时 layer writer 抑制 r3 普通宝顶；默认维持此无 API 扩展的替换方式。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- r9 建筑层：roof 批含平顶板/顶面、女儿墙/压顶、椽头、出水槽、廊顶/廊额、葡萄架全体、唐木檐、攒尖/穹顶与塔刹。
- 美术线 xiyu 16 层：mud_roof 顶/廊顶；parapet_coping 压顶；joist_soffit 板底；timber_carved 唐檐/柱/塔刹；timber_raw 椽/槽/架；两 mud_plaster 墙；brick_fired 基/槛；adobe_brick 暗衬；brick_lattice 晾墙；lattice_wood 高窗；door_carved 门；floor/carpet 留室内；dome_plaster 穹顶；canvas_awning 本配方未用。
- 闸门 A：吐鲁番需作者看土色厚墙、平顶女儿墙轮廓、300 mm 椽头、唐寺攒尖塔刹比例及前廊/葡萄架疏密；不得以喀什穹顶尖拱作参考。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 只改 8 个声明路径；无 Three/import、新依赖、门禁或预算放宽；源码 guard 通过。
- ✅ 真实 YAML/planner 的四偏航×LOD0/1 覆盖 INV-1～5、稳定 hash、尺寸、外挑、门窗、净高、花砖洞与民居预算。
- ✅ 部件计数在实际 emit 路径累加；唐塔刹各段、非唐 layer-14 穹顶旋转曲面及源码 guard 均回归。
- ✅ 四条验收命令亲自通过；`pnpm check` 仅打印既有 localhost:3000 探测及缺素材警告，退出码 0。

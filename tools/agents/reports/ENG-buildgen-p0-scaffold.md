# ENG-buildgen-p0-scaffold 报告 · 城镇 3D 古建 · 规划器骨架 town-plan（类型、坐标框、类型解析、rng、家具目录、全部桩）

## 1. 摘要（3–6 行）

- 已建立 `town-plan` 完整目录骨架、公开子路径、契约类型、纯整数坐标/RNG、78 类布局解析与家具目录。
- `planBuilding()` 当前提供可供编译器使用的确定性盒子方案；其余后续模块均显式抛 `TOWN_PLAN_NOT_IMPLEMENTED:<函数名>`。
- 当前基点四条验收命令全部通过：定向 7 文件 / 122 测试、data typecheck 与全量 `pnpm check` 均成功。

## 2. 产出（文件、行数、主要章节）

- `packages/data/src/build/town-plan/**`：25 个 TS 文件、847 行；公共实现 7 个、预留桩 11 个、测试 7 个。
- 公共实现：`types/frame/archetype/rng/fixtures/plan-hall/index.ts`；桩：`dims/doors/plan-compound/invariants/export-fixtures`、`kit/**`、`compound/**`、`interiors/**`、`testing/**`。
- `packages/data/package.json`：新增 `./town-plan` export；未新增依赖、未改 lockfile。
- `pnpm install --frozen-lockfile`：通过，8 个 workspace project、lockfile 已最新；定向 Vitest：7 文件、122/122 通过；data typecheck：通过。
- `pnpm check`：退出码 0；lint、根 typecheck、全仓 199 文件/1524 测试、内容 1777 文件/1708 对象/2 Ink/65 地图、故事 4/4、编译 3 行/2 章均通过。
- size：标题页/首次会话全部预算门通过，`[dev-chunks] PASS assets=828 manifest=94`；构建缺图提示与块大小提示未使门禁失败。

## 3. 关键结论与数值

- 坐标：规划格 1 m = 1000 mm；规划 `+z` 向北而世界 `+z` 向南，世界点为 `(originX+x·1000, originZ+(height-z)·1000)`；矩形用半开世界 mm。
- 四转：k=0 `(x,z)`、1 `(-z,x)`、2 `(-x,-z)`、3 `(z,-x)`；边序 S/W/N/E，`worldSide=(localSide+k)%4`；入口外边推 yaw。
- 六角：`x=round(57735·(2q+r)/100)`、`z=1000r`，用 `floorDivInt` 整数舍入；样本与 render 公式误差 ≤1 mm。
- 类型：`bld_kit_` 后按已知 kit 最长前缀匹配，再校验 25 个 archetype；合法 `bld_lm_chNN_*` 返回 landmark；其余抛 `TOWN_PLAN_UNKNOWN_TYPE`。
- RNG：FNV-1a 32 位种子为 `sceneId/buildingId`；variant/interior/props/visual 各用独立 salt 经 splitmix32 派生。
- 家具稳定下标：0–6 柜台/高柜/四层架/百子柜/布架/书柜/阅书桌；7–14 方桌/长凳/凳/扶手椅/供桌/床/箱/楼梯；15–21 炉/风箱/砧/淬火盆/兵器架/工具架/工作台。
- 家具稳定下标：22–29 桶/木箱/麻袋/酒坛/坛组/筐/草垛/马槽；30–42 佛台/造像/香炉/蒲团/屏风/台/赌桌/木人桩/旗架/柜台杂物/灯笼/吊货/说书桌。
- 站位：200–211 keeper/customer/clerk/waiter/vendor/monk/guard/dealer/apprentice/smith/owner/teacher；全为 `0×0×0`、不阻挡。
- 与文档一致：方案字段、整数边界、独立随机流、普通 `enum`；因 `isolatedModules` 保守不用 `const enum`。偏离：无。

## 4. 开放问题（附默认值）

- §8.4 只给道具三角预算，部分精确包围盒未给；默认采用 §8.3 已给尺寸，余项采用保守整数常见尺寸，p1/i1 可随 kit/template 契约校正但不得改 idx。
- `CompiledBuildKit` 当前仅保留版本/id/archetypes/landmarks；默认由 p1 扩展，不在 p0 猜测完整结构。
- 已解决：当前基点全量 `pnpm check` 已通过，无需保留旧基点的重校验默认值。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/16-town-3d-spec.md` §8.4 / 后续文档任务：补齐家具目录精确 W×D×H 与阻挡属性，冻结本报告所列 idx。
- 无额外同步项；当前基点已完成全量重校验。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 目录、全部指定文件、`./town-plan`、完整类型与普通 enum；源码均 ≤101 行，单次补丁 ≤150 行。
- ✅ 四转 4×10000 点精确往返、前脸 S/W/N/E、78 类型、未知错误、hex ≤1 mm、FNV 向量、floor 包含均有测试。
- ✅ 43 道具、12 站位、稳定名查找；禁用 API 与除法运算静态检查无命中；12 个桩逐个验证错误码。
- ✅ p1：替换 `kit/{schema,compile}` 并扩 `CompiledBuildKit`；p2：替换 `dims/doors/plan-hall`，保留 `planBuilding` 公共签名。
- ✅ p3：替换 `plan-compound`、`compound/index`；p4：替换 `invariants/export-fixtures`；i1/i2：替换 `interiors/{solver,hexes}` 并增各设施模板。
- ✅ TOOL-town2-compiler-core 可先用盒子方案：占地中心 + 局部 w×d，入口边定 yaw，300 mm 内缩单 floor，平台/floorY=150，悬山檐3000/脊4500，居中门1400，无家具。
- ✅ 四条检查均在当前基点亲跑并通过：install、定向 7 文件/122 测试、data typecheck、全量 `pnpm check`（199 文件/1524 测试及后续内容、编译、size 门）。

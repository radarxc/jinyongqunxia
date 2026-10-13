# ENG-buildgen-r2-roof-a 报告 · 城镇 3D 古建 · 屋顶（一）举折 / 举架、坡面、硬山 / 悬山 / 平顶 / 布棚、屋脊、屋面壳

## 1. 摘要（3–6 行）

- 完成宋举折、清举架、参数化坡面，以及硬山、悬山、平顶、布棚四种简单屋顶分派。
- 屋面壳含瓦面、180 mm 望板、120 mm 封檐带和 250 mm 博风板；正/垂脊按局部米制折线挤出梯形。
- 返修后 LOD0/LOD1 均强制每实际檐线米至少一段；显式 `uStations` 支持 r3 在两端局部加密。
- 全部顶点只写 `RecipeSink.roof` 并携带单元号；歇山等五式样抛 `BUILDGEN_ROOF_PENDING` 交 r3。

## 2. 产出（文件、行数、主要章节）

- `roof/{index,profile,patch,gable,flat,canopy,ridge,shell}.ts`：1013 行；剖面、坡面站位、壳体、屋脊、式样与分派。
- `__tests__/roof-a.test.ts`：678 行、33 个命名用例；报告 55 行。
- `pnpm install --frozen-lockfile`：0.849 s；锁文件一致。
- buildgen：8 文件 / 73 测试，0.457 s；render typecheck 通过。
- `pnpm check`：223 文件 / 1713 测试，163.57 s；1777 内容文件 / 1708 对象；构建 20.75 s。
- 包体：render 166.15 / 180 KiB gzip、WebGL 总计 204.61 / 350 KiB，全部预算通过。

## 3. 关键结论与数值

- 与文档一致——店：滴水/脊顶 3070/4566；檩高（脊→檐）866.0/346.4/0 mm；坡度（檐→脊）0.420/0.630。
- 与文档一致——宅：2910/4419；918.75/367.5/0 mm；0.420/0.630。
- 与文档一致——客栈：6130/8547；1674.0/948.6/390.6/0 mm；0.189/0.270/0.351（复杂网格交 r3）。
- 与文档一致——寺殿：4575/8483；2733/1549/638/0 mm；0.467/0.667/0.867（误差均 ≤1 mm；复杂网格交 r3）。
- 与文档一致——三角 LOD0/LOD1：悬山店 444/444、硬山宅 444/444、布棚 24/12、平顶 120/120，均低于 §6.5 整栋预算。
- 与文档一致——u 相邻站位檐线距 ≤1 m；t 为每举折步 2 段 + 出檐 2 段；共享边实测 0 mm。
- 偏离处——无已知规格偏离；相较返修前 LOD1 三角数上升，只因取消违规的 u 降采样，仍在预算内。

## 4. 开放问题（附默认值）

- 悬山默认以最大 600 mm 出际反推山墙基线；400–600 mm 改变屋面端点且仍守占地 40 mm 内缩。
- 【默认值】柱网尚未写入 `BuildingPlanView`；按 `进深−2×出檐−100 mm 安全边` 得前后橑檐方距。
- 【默认值】平顶 `ridgeMm=3750` 高于 3300 顶板 450 mm，解释为女儿墙顶。
- 【默认值】布棚 `roof[1]/roof[2]` 为前/后边高，3% 垂度叠加于连线，下沿硬守 2250 mm。
- 【默认值】墀头 350×300×450 mm，外皮齐山墙并守占地 40 mm 内缩。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `mesher/recipes/{hall,stall,adobe}.ts`：后续配方以 `roofMesherFor(plan.roof[0])(...,{kit,lod})` 替换 r0 屋顶桩。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 举折/举架、0.40 出檐坡与飞椽上翘 40 mm；四金样、内凹坡度与成品店铺均有数值断言。
- ✅ `sampleRoofPatch` 把任意较小 `uSegments` 抬至每米基线；硬山/悬山/布棚 LOD0/1 均按实际檐长断言。
- ✅ `cornerUStations(长,角区,每角3)` 合并均匀站位与两端局部站位；0/1、严格递增、≤1 m 均校验。
- ✅ 显式站位错误码：`BUILDGEN_ROOF_INVALID_U_STATIONS`、`BUILDGEN_ROOF_U_STATION_GAP`；共享边仍为 0 mm。
- ✅ 滴水/正脊 ±10 mm、INV-1、壳体/屋脊/墀头、roof 缓冲、单元号、稳定哈希与三角预算均通过。
- ✅ 四条规定命令亲自通过；Prettier 与 `git diff --check` 通过；`pnpm check` 仅有既有探测/素材/chunk 警告。
- ✅ 给 r3：`RoofPatchOptions.uStations` 是完整 0..1 站位；只用 `cornerUStations` 生成角部加密，不再有 `extraUSegments`。
- ✅ 给 r3：翼角形变接 `deform({u,t,point})`；共享边复用同一 `eaveLine/ridgeLine/heightAt/tStations/uStations`。
- ✅ 给 r3：`writeRidge({path: Vec3[],kind:'main'|'vertical'})` 接局部米制 XYZ 折线，内部再套 origin/yaw。

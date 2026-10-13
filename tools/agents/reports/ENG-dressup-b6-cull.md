# ENG-dressup-b6-cull 报告 · 3D 纸娃娃换装 · B6 · 运行时蒙皮网格视锥剔除修复（动作中头 / 衣物被整块剔掉）
## 1. 摘要（3–6 行）
- 已采用一次性动作包络球：身体、头、衣物及蒙皮持物继续参加离屏剔除，不再依赖首次渲染姿势的过期球。
- 创建 actor / 换装时采样模板全部动作，骨长调整时刷新；`update(dt)` 没有新增工作或分配。
- 协调者裁定（AR-110，Claude 收尾）：仓库没有任何包声明 fast-check、本任务不加依赖，属性测试改为测试内固定种子 mulberry32 生成 100 组（4 组边界 + 96 组随机），断言不变、离线可复现；去掉包络的绑定距离项即失败（反向验证）。
- 工具链按仓库声明（Node 22.22.1 / pnpm 9.15.9）全部门禁通过；结构 draw call `5 → 5`，帧时间同条件成对实测无退化（最佳 P95 基线 `0.343/0.334 ms` → 本任务 `0.331/0.328 ms`）。
## 2. 产出（文件、行数、主要章节）
- 新增 `dressup/culling.ts` 145 行：动作采样、逐网格扫掠包络、蒙皮件增删同步；`culling.test.ts` 250 行：属性测试（固定种子）、旧球对照、run 身体/新衣/蒙皮持物、刚性件测试。
- 修改 `actor.ts` 610 行：创建/换装/卸装/骨长路径接包络；`packages/render/CLAUDE.md` 163 行：补剔除约定。
- Node `22.22.1` / pnpm `9.15.9`：`pnpm install --frozen-lockfile` 通过；render test 48 文件 / 233 测试通过（含 rig CPU 门，loadavg 4.2）。
- `pnpm check` 188 文件 / 1,335 测试通过，size 门通过；dressup perf 1/1 通过；`git diff --check` 通过。
## 3. 关键结论与数值
- three 锁定 `0.186.1`；r186 `Frustum.intersectsObject` 优先读对象 `boundingSphere`，为 null 才调用一次 `computeBoundingSphere`；后者逐顶点算当前姿势球且不自动失效。[Frustum](https://github.com/mrdoob/three.js/blob/r186/src/math/Frustum.js#L146-L164) / [SkinnedMesh](https://github.com/mrdoob/three.js/blob/r186/src/objects/SkinnedMesh.js#L132-L159)（联网核实于 2026-10-10）。
- 取舍：未用 `frustumCulled=false`；保留离屏剔除，也不逐帧遍历顶点。全部 clip 按 24 Hz 取 `ceil(duration×24)+1` 帧；现有模板 idle/walk/run 分别 369/57/31 个采样点。
- 算法：对每个网格在其局部坐标采样 `bindMatrixInverse × bone.matrixWorld`，骨骼运动球半径再加该骨骼所影响顶点的最大绑定空间距离×最大采样缩放；并入绑定姿势几何球后加 `max(半径×10%, 0.03 mu)`。此坐标链与 Three 蒙皮/剔除一致，覆盖权重混合、显式 `bindMatrix`、actor 缩放及随插槽移动的蒙皮持物。
- 测试：固定种子 mulberry32（`0xb6c011`）生成 100 组用例，覆盖 1–4 骨、权重、平移/旋转、非恒等绑定矩阵、actor 缩放、逐顶点包络和视锥，失败信息带用例号；另有旧球反例、实际 actor `run@0.5`、换装及刚性件回归。无 CDN、动态代码、联网或新增依赖。
- 性能/体积：每 actor 1 身体+4 装备仍为 `5 → 5` draw calls。`dressup/performance.test.ts`（100 actor / 400 装备、3 轮 best-of-3）在集成分支基线与本任务工作区交替各跑 2 次（同一时段，loadavg 6.9–10.1 / 12 核）：基线三轮 `0.410/0.343/0.365`、`0.334/0.381/0.372 ms`，最佳 `0.343/0.334 ms` → 本任务 `0.368/0.331/0.379`、`0.387/0.348/0.328 ms`，最佳 `0.331/0.328 ms`，差异在噪声内（包络只在创建 / 换装时算，`update(dt)` 不变）；另一时段单跑本任务最佳 `0.225 ms`（loadavg 8.4），不与上面成对比较。门值 2.0。render-dressup `6.70/24 KiB` gzip。
- 与文档一致：动态入口、共享 Skeleton、热路径零分配、结构统计均未变；无契约偏离。
## 4. 开放问题（附默认值）
- 浏览器真机近景尚待协调者实走；默认待依赖补齐后以 Node 视锥断言和全门禁为自动化证据，不冒充 WebGL 视觉验收。
- 无其他阻塞。工具链要求以 `package.json` 为准（`packageManager: pnpm@9.15.9`、`engines.node >=22.12.0`）；RUNBOOK-P0 的 Node 24 / pnpm 12 只用于 P0 期 T0–T5。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/10` §3.2、`docs/tech/11` §8：后续登记蒙皮件改用 24 Hz 逐网格全动作包络球，不再沿用“首次 computeBoundingSphere”口径。
- 截图工具：完成下述 5173 实走后可撤拍摄时 `frustumCulled=false` 临时绕过；本任务按写集未修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 修复覆盖身体及所有后挂蒙皮件；挂装计算、卸装注销，离屏剔除保留，刚性持物未改；`update(dt)` 分配探针仍连续 3 个干净窗口。
- ✅ 审核点 1/3：属性测试离线执行、无未声明依赖（按协调者裁定改固定种子生成器，覆盖与断言同原 fast-check 版）；render test 与 `pnpm check` 通过。
- ✅ 审核点 2/4：按仓库声明工具链重跑冻结安装、render test、`pnpm check`（含 size）、dressup 性能门、`git diff --check`，数字如上。
- ⚠️ 协调者验收：5173 打开 `/character-3d` → 换装 v2 → 选 tall 模板、头、劲装 → 播 run → 拉近后颈并转背面；头/衣物/身体全程不整块消失。通过后撤截图工具绕过。

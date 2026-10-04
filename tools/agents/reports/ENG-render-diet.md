# ENG-render-diet 报告 · 游戏工程 · render 瘦身：静态闭包 179.41 → < 170 KiB（门 180 不放宽）；先查构成（three 按需、rig 懒加载、调试代码），挪出去的块都要有预算
## 1. 摘要（3–6 行）
- render 静态闭包由 179.42 降至 164.45 KiB gzip，低于 170 目标 5.55 KiB；原有预算均未改。
- rig runtime 改为战斗、区域、城镇、大地图首次建场景时动态加载，并新增 20 KiB 独立硬门。
- `/rig-demo` 的 3D pilot 从根入口移至开发态窄入口；生产构建不产出 pilot 演示块。
## 2. 产出（文件、行数、主要章节）
- 新增 `rig/runtime.ts` 5 行、`gltf/demo.ts` 8 行；场景/类型/加载测试 10 文件共 1,836 行；入口接线 2 文件共 258 行。
- 体积门禁 4 文件共 613 行：预算、清单闭包定位、超限夹具和量法；本报告 26 行。
## 3. 关键结论与数值
- 改前 179.42 = 主 render 164.58 + 静态 rig 14.84 KiB；拆 rig 约省 14.84，移除根入口 pilot 包装约再省 0.13，合计 14.97 KiB。
- Three 生产代码均为命名导入，无 `import * as THREE` 或 examples 聚合导入；GLTFLoader/SkeletonUtils 只在既有 model3d 懒块或开发 pilot 中。
- 调试排查：`/rig-demo` 受 `import.meta.env.DEV` 保护；未发现 devtools/试点基准混入生产。其余大头为 Three core 与 region/town/battle/worldmap 场景。
- 改后 KiB gzip：entry 38.42/170，render 164.45/180，webgl total 202.87/350，session 94.90/110，model3d 17.25/24，均 PASS。
- 新 `render-rig` 14.95/20 KiB，预算 = 实测 14.95 + 5.05（约 34% 余量）；清单定位、静态闭包去重和超限失败均有测试。
- `check:perf` PASS（12 CPU；启动 loadavg 9.77/10.41/10.20）：4 文件/8 用例；100 人/1600 实例步态最佳 P95 0.338 ms，片段 0.296 ms。
## 4. 开放问题（附默认值）
- `pnpm check` 须由校验阶段在沙箱外复跑；默认不改 `tsx`，因为本地在 `content:validate` 被 Unix socket `listen EPERM` 阻断。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/render/CLAUDE.md` / 3D 试点与体积：根入口包装已迁走，并更新 render 164.45、rig 20 KiB 门；`docs/tech/03-mobile-performance.md` 登记该懒块预算。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`、lint、typecheck、专项 29/29、全量 178 文件/1271 用例、`pnpm size`、严格 ID、`git diff --check`。
- ✅ 首次进入战斗/区域的注入式加载用例通过；四场景均走同一窄 runtime；无新增高负载跳过逻辑。
- ✅ render <170；新块可测且超限阻断；entry/render/model3d/webgl/session 等既有门值未放宽。
- ⚠️ `pnpm check` 仅因上述沙箱 EPERM 未走完内容与末段 size；其前置阶段通过，`pnpm size` 已独立通过。

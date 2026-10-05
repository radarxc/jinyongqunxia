# 本任务：渲染探针——`apps/bench` 中实现 tech/02 §12.1 的 P0（投影 / 拾取）、P1（地形）、P2（`bench-iso`）、P3（遮挡金样）、P5（韧性），WebGL 单路径

这是 `tech/09` P0 最重要的交付：三台真机上的 `bench-iso` 结果决定渲染器与默认画质（RD-02 / RD-03）。本任务只做 **WebGLRenderer + GLSL**（R1）；WebGPU 比较分支只在 `docs/tech/09` §2.4 的包体前置门通过后另开任务。真机测试由作者执行，你要交付的是可在手机浏览器打开、能导出 HUD JSON 的基准页面与桌面自动化冒烟。

## 必读

- `docs/tech/02-rendering.md` 全文（§1 相机与拾取、§2 场景构成与两段式精灵、§3 遮挡、§4 光照、§5 水墨后处理 uber pass、§8 管线与帧预算、§10 质量档位、§11 代码结构与 `RenderWorld` 接口、§12.1 Demo 表与通过标准）；`packages/spec/iso-camera.json`、`sprite-spec.json`、`palette.json`、`time-of-day.json`（T0 已落）。
- `docs/tech/03-mobile-performance.md` §2（预算）、§6（对象池、dispose 规范）、§7（自适应画质、动态分辨率）、§8.2–§8.3（HUD 字段与六个 CI 场景中的 `bench-title` / `bench-region-cycle`）。
- `docs/tech/09-roadmap.md` §2.2（唯一负载口径）、§2.5（量化退出标准：P50/P95/P99、`pacingFps`、10 分钟、投影 ≥ 20,000 例、地形 chunk、遮挡 48 组、韧性）。
- `packages/core` 的六角坐标 API（T1）；`content/chapters/ch00_yuenv` 的 Tiled 图与 `RegionMap`（T2；若尚未合入，用 `apps/bench` 内置的随机高度图，但接口按 T2 报告的字段）。

## 至少实现（`packages/render`、`apps/bench`）

1. `packages/render`：正交相机（俯仰 30°、偏航 45°、4 个 90° 预设、缩放档 48/64/80/96 px）、屏幕↔世界↔六角坐标换算、含高度的六角拾取（世界空间射线 × 高度网格逐格遍历、单位优先、44 px 容差吸附）；地形 chunk（32×32）构网（Worker）、纹理数组 splat + 噪声晕染、顶点 AO、崖线笔触条带、浅 / 深水（中档）；两段式精灵公告板（不透明芯写深度 + 软边混合，纵向补偿 ×1.1547，沿视线前移 0.35 m）、X 光剪影、透视圈；自写光照（半球 + 太阳、照明网格、动态点光 0/2/4/8）、圆斑阴影、阴影贴图（中档、静态物、惰性重绘）；uber pass（描边三层 / 纸纹 / 双 LUT / 暗角，一个全屏 pass）；四档质量开关表；`RenderWorld` 接口（tech/02 §11.2）实现到本任务需要的子集；资源账本（geometries / textures / programs / `GpuBudget.bytes`）与 `dispose` 规范。
2. `apps/bench`（Vite，手机可开）：页面 `#/proto-projection`（20×20 六角槽点选显示命中格 + 点击记录导出）、`#/proto-terrain`（160×160 常规 / 256×256 压力，chunk 构网耗时统计）、`#/bench-iso`（64×64 高度地形 + 200 个动画法线精灵 + 2 动态光 + 照明网格 + 阴影贴图 + uber pass + 战斗格叠加 + 30 个飘字；`?stress=1` 为 300 精灵）、`#/proto-occlusion`（12 场景 × 4 偏航，截图按钮）、`#/proto-resilience`（上下文丢失 20 次 / 区域循环 10 轮 / 切档 10 次，自动跑并记录）；性能 HUD：逐帧间隔、P50/P95/P99、`pacingFps`、draw call、三角形、分辨率比例、档位、GPU 账本、JS 堆（可得时）、低电量标志；**"导出 JSON"按钮**（复制到剪贴板 + 下载），JSON 字段按 tech/09 §2.3 记录模板（`deviceId、date、build hash、UA、entry、resolution、refreshHz、tier、network、cold/warm、regular/stress、context-loss result`）。
3. 测试：投影 / 拾取属性测试 ≥ 20,000 随机例（随机高度图 × 4 偏航、含 ±22.5° tie-break）与暴力 oracle 0 差异；`spriteDir` 全表；chunk 构网确定性；账本回零单元测试。
4. 桌面自动化冒烟 `pnpm --filter @tianshu/bench e2e:smoke`：Playwright Chromium 打开 `#/bench-iso` 跑 10 s 与 `#/proto-resilience` 跑 3 轮，导出 JSON 到 `apps/bench/bench-results/desktop-smoke.json`（入库，作为桌面基线；真机结果由作者另放 `docs/evidence/p0/`）。
5. `size-limit`：`render` chunk ≤ 180 KB gzip，`apps/bench` 的 entry 单列门禁；报告写实际数字。

## 验收标准（亲自运行）

- `pnpm --filter @tianshu/render test`（含 ≥ 20,000 例属性测试通过）、`pnpm --filter @tianshu/bench build`、`pnpm --filter @tianshu/bench e2e:smoke`（需本机 Playwright Chromium）、`pnpm check`、`pnpm size` 通过。
- `apps/bench/bench-results/desktop-smoke.json` 存在且含 P50/P95/P99、`pacingFps`、账本回零字段。
- 报告第 3 节：桌面数字、包体数字、已知与文档偏离处；第 6 节：作者真机测试步骤（如何打开、跑多久、怎么导出、文件命名 `docs/evidence/p0/<deviceId>-<date>-<regular|stress>.json`）。

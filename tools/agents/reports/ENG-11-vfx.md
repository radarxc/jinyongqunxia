# ENG-11-vfx 报告 · 游戏工程 · 动效层（招式特效接入战斗界面）

## 1. 摘要（3–6 行）

已把 `tools/vfx/web` 的时间轴/合成语义移植为 `@tianshu/render/vfx` TypeScript 懒加载模块，原 JS 与 76 份 demo（74 正式 + 2 baseline）均未改。
战斗 `onMoveResolved` 已接到绑定解析、战场投影、实际人物残影、结果附加环与伤害飘字时长同步；所有失败均降级且不阻断结算。
新增确定性 YAML→JSON 导出、133 文件发布白名单、缓存/池化/线性合成及无头测试；未新增依赖，Three 保持 0.186.1。
全部必检命令通过；48 特效 CPU P95 通过 16.67 ms 门禁，但 Chromium 被沙箱 MachPort 权限拦截，GPU/桌面 60 FPS 仍标（待实测）。
本轮解决 4 个重放冲突：素材/内容插件保留地图、立绘、物品与 VFX 发布，Vite 同留地图预缓存和 VFX 排除规则，render 同时导出 worldmap/vfx。

## 2. 产出（文件、行数、主要章节）

- `packages/render/src/vfx/`：15 个 TS 文件、1,298 行；含绑定、资源/Promise 缓存、纹理共享、48 槽对象池、时间轴、双 pass 舞台、API 与 7 组测试。
- `packages/render/src/{battle,rig}/`：战场像素投影、复用人物拍平画布及 25 行快照测试；`packages/render/CLAUDE.md` 增加接入、释放、回退与实测边界。
- `apps/game/src/battle/`：66 行懒加载桥、76 行测试，以及 `BattleField` 的 VFX 画布/帧循环/快照桥与飘字同步；Vite 独立 `vfx` chunk、PWA 不预缓存。
- `apps/game/build/`：发布白名单校验与 20 行测试；只复制 exporter 批准的 VFX 运行时文件。
- `tools/vfx/export_bindings.py`（156 行）与测试（39 行）：稳定导出、路径边界及 YAML/JSON/manifest 一致性检查。
- `content/vfx/{bindings,catalog,runtime-files}.json`：46,385 行生成物；2,788 绑定及 133 文件清单。
- `tools/vfx/web/*`、素材、`bindings.yaml`、`pnpm-lock.yaml` 均未改；无新依赖。
- 本轮冲突合并：`asset-manifest.ts` 保留物品/立绘/地图读取和 VFX 白名单发布；`content-plugin.ts` 保留世界地图转换和 VFX 构建接线；`vite.config.ts` 保留地图基图预缓存和 VFX 懒载排除；`package.json` 保留 `worldmap`、`vfx` 双子路径导出。

## 3. 关键结论与数值

- 绑定分布：bespoke 1,444、afterimage 1,159、plain_strike 160、qi_projection 25；颜色阴 `#5FB5B0`、阳 `#D9483B`、调和 `#E8D6A3`、中性 `#F4F4F4`。
- 时长：外放 0.60 s、残影 0.48 s（4 份、28 px、stretch 0.04）、普通击 0.32 s（上限 0.4 s）；减少动效为 1 ms。
- 命中/抵消/透劲入体/打穴分别用金/青/紫/赤目标环；降龙亢龙只消费 composition `scale:[1,2]` 一次。
- 发布白名单 133 文件，共 37,117,505 B = 35.398 MiB；按招式请求，不进首屏 chunk 或 PWA precache。
- `pnpm size`：VFX chunk 10.10 KiB gzip；预算统计 entry 130.38 KiB、render 144.59 KiB，WebGL 合计 274.97/350 KiB。
- 48 个并发时间轴/实例属性更新完整门禁 CPU P95 0.035 ms < 16.67 ms；这是 Node CPU 门禁，不是 GPU 帧耗时或真机 FPS。

## 4. 开放问题（附默认值）

- 生产 `BattleMarker.qiNature` 仍为可选：默认优先施招者值，其次绑定 nature，最终 neutral；建议后续 core 投影为必填。
- 48 槽耗尽策略：默认抢占最早开始的特效，战斗不报错；作者若更重视大招，可后续增加层级优先级。
- 1,362 个 bespoke 绑定当前无可用主 composition/baseline：默认运行时退 `plain_strike` 并按原因去重告警，待素材批次补齐。
- （待实测）桌面/低端 Android GPU 60 FPS、上下文丢失与横竖屏：默认不据 CPU 数据宣称完成，进入真机 QA 门禁。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG-11-P01 / 将 VFX 运行时降级与 48 槽抢占写入技术基准 / 明确“性能优先、结算不阻断”的一致行为；本任务未改基准。
- ENG-11-P02 / 把桌面 GPU 48 同屏 ≥60 FPS 与低端 Android 分级门禁写入 `tech/03` / 当前只能证明 CPU 更新预算，不能替代 GPU/真机数据。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/02-rendering.md` / VFX 管线 / 记录线性离屏合成、末 pass sRGB、图集 Promise 缓存、48 槽池和 real-actor snapshot。
- `docs/tech/03-mobile-performance.md` / 性能门禁 / 加入 VFX chunk 10.10 KiB gzip、WebGL 274.97/350 KiB 及真机 GPU 待测项。
- `apps/game/CLAUDE.md` / `onMoveResolved` / 补充 `qiNature` 投影、飘字按 `play().durationMs` 重启动画以及 VFX 失败不阻断。
- ENG-10/core 上游 / `BattleMarker` 投影 / 令 `qiNature` 在生产数据路径必填；当前仅 demo 显式提供。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 接入结构：TS 模块导出、原 JS demo 保持可运行；生成 bindings/catalog/manifest，经独立 chunk 懒加载 composition、图集及共享纹理。
- ✅ 绑定→播放：`onMoveResolved`→`mv_*`→bespoke/玄模板/黄 plain→战场坐标→线性合成；真实人物残影、四类附加环和 2× 降龙均有测试。
- ✅ 性能结构：单透明 renderer、48 槽对象池、共享 geometry/texture、复用快照 canvas、按招式请求；`pnpm size` 通过。
- ⚠️ 性能数据：完整门禁 CPU P95 0.035 ms；真实 Chromium 因当前 macOS 沙箱拒绝 MachPort（1100）无法启动，GPU/桌面 ≥60 FPS 未实测。
- ✅ 回退统计：静态潜在回退 1,362/1,444 bespoke；运行时 `stage.stats.fallbacks` 统计无绑定/资源/快照失败并去重日志；未采集持久化实战遥测。
- ✅ 测试：`pnpm install --frozen-lockfile`、`pnpm check`（83 文件/418 测试＋2 rig perf）、game build、export `--check`、ID strict 全过。
- ✅ 兼容校验：`check_vfx.py --self-test` 50/50、76 个 `demo.html --html`（74 正式 + 2 baseline）、11 个原 JS timeline 测试、10 套 `check_skill_suite.py` 全过。
- ✅ 生成一致性：2,788 条 YAML/JSON parity、133 文件 manifest/public 无缺失；`git diff --check` 通过，素材/YAML/lockfile 未改。
- ✅ 需作者确认（附默认）：沿用第 4 节默认值；不以未实测数据宣称完成 GPU 60 FPS。

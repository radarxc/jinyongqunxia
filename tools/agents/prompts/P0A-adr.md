# 本任务：P0 出口——从真机证据写 ADR-0001（渲染器闸门）、ADR-0002（相机与精灵深度）与 P0 状态记录

作者已按 T3 / T5 报告的步骤在三台设备上跑过 `bench-iso` 等原型，并把导出的 HUD JSON、设备记录与部署 / 离线证据放进 `docs/evidence/p0/`（闸门 G4）。本任务只做**汇总与判定**：把证据对照 `tech/09` §2.5 量化退出标准逐项判定，写出 ADR 与 P0 状态记录。不得补造证据；缺证据的项判"未通过 / 未测"。

## 必读

- `docs/tech/09-roadmap.md` §2（全部：范围、负载口径、真机清单模板、决策树、量化退出标准、依赖与退出动作）、§10.2（RD-01～RD-03 的最晚时点与默认）、§12.2（最小状态记录）。
- `docs/tech/02-rendering.md` §9.3（WebGPU 五项硬门）、§12.1（各 Demo 通过标准）、§12.2（输出 ADR 名）；`docs/tech/03-mobile-performance.md` §2（预算硬线）、§7（档位）。
- `docs/evidence/p0/**`（全部 JSON 与 README；文件命名见 T3 报告）；`apps/bench/bench-results/desktop-smoke.json`；`tools/agents/reports/T3.md`、`T5.md`、`T4b.V.md`、`T1.md`、`T2.md`。
- `docs/decisions/author-decisions.md`（P01–P04）、`tools/agents/APPROVALS.md`（G3 / G4 记录）。

## 产出

1. `docs/adr/0001-renderer-gate.md`：被测构建 hash；三机清单（角色 A/B/C、型号、SoC/GPU、RAM、OS、浏览器 / 入口、刷新率）；每机 × 常规 / 压力 × 冷 / 热的 P50/P95/P99、`pacingFps`、10 分钟平均、长帧计数、上下文恢复结果——直接引用证据文件名；逐项对照 §2.5 表给出 通过 / 未通过 / 未测；RD-02 判定（本轮只有 R1，故结论为"锁 WebGL 单路径，WebGPU 待包体前置门"或按证据）；RD-03 默认画质判定；失败项的降级与下次复评条件。
2. `docs/adr/0002-camera-and-sprite-depth.md`：从 `proto-occlusion` 48 组金样与 `proto-projection` 实点记录得出 δ 深度偏移取值、是否启用深度精灵、拾取容差；引用截图文件。
3. `docs/evidence/p0/STATUS.md`（tech/09 §12.2 最小状态记录）：P0 各交付项状态（仓库地基 / core / 数据 / 渲染 / 素材 / 存储后端）、证据索引、未通过项、作者待办、进入 P1 的条件是否满足。
4. 若证据不足以判定任一硬门：ADR 状态写 `proposed` 而非 `accepted`，并列出缺哪份证据。

## 验收标准

- 两份 ADR 含"状态 / 背景 / 决策 / 后果 / 证据"五节，每个数字都能在 `docs/evidence/p0/` 找到出处；`STATUS.md` 逐项状态与证据一致。
- 不修改 `tech/*`、`design/*`；报告第 6 节列出 P1 启动前需同步的文档（如 tech/03 定档表回填）。

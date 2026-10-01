# ENG-12-rig-walk 报告 · 游戏工程 · 角色分层部件渲染与代码步态（AR-22）

## 1. 摘要（3–6 行）

- 已实现 `@tianshu/render/rig`：三视图部件运行时图集、八方向镜像、代码步态、装备换装与共享实例批次。
- `/rig-demo` 可切换八方向、待机/走/跑、轻/中/重、七类装备、采样帧率及 20 人压力场景。
- 角色部件共享一个 `InstancedMesh`，两个材质 group 对应 alpha 芯/软边，人物渲染固定 2 draw call。
- 全仓检查、游戏构建、严格 ID 校验均通过；无头 CPU 基准通过，浏览器 GPU/FPS 实测受沙箱限制未完成。

## 2. 产出（文件、行数、主要章节）

- `packages/render/src/rig/`：15 个文件、1,473 行；类型与 manifest、图集/占位、步态、装备装配、角色骨架、实例缓冲、批次、场景及 5 组测试。
- `packages/render/package.json`：新增 `./rig` 懒加载子路径导出。
- `packages/render/CLAUDE.md`：19 行；rig API、资源所有权和 ENG-08/09/10 交接约定。
- `apps/game/src/rig-demo.ts`：61 行；交互控制与统计 HUD。
- `apps/game/src/main.ts`、`style.css`、`vite.config.ts`：接入 `/rig-demo`，补 UI，并把 rig 拆为独立 chunk。
- `pnpm-lock.yaml` 未变更；`pnpm install --frozen-lockfile` 确认依赖已锁定。

## 3. 关键结论与数值

- 图集策略：启动时把 3 视图 × 13 基础部件 = 39 张 PNG 与 5 个装备占位格装入一张 2,048 px 宽共享 atlas；缺图生成带描边色块。
- 上限：16 个基础实例 + 4 个附加实例 = 20 实例/角色；默认容量 100 人 = 2,000 实例。
- 实例布局 56 B：UV 8 B + 二维仿射 24 B + 锚点/深度 16 B + 排序/tint 8 B；脏区间合并后仅上传变化范围。
- 步态：DES-rig 的走/跑 × 轻/中/重 × 4 相位共 24 个向量、每向量 11 值全部通过；角度容差 0.15°，位移容差 0.0005 m。
- 最新无头 CPU P95：20 人满装备、400 实例为 0.095 ms；100 人基础装、1,600 实例为 0.318 ms，低于 0.8 ms 回归门槛。
- 构建：`rig` gzip 10.51 KiB，`rig-demo` gzip 1.63 KiB；入口只动态导入 demo，rig 不进入首屏静态依赖。
- 技术核实：Three.js 0.186.1；官方 `InstancedMesh`、`InstancedBufferAttribute`、`BufferAttribute.addUpdateRange` 文档于 2026-10-01 可访问：<https://threejs.org/docs/#api/en/objects/InstancedMesh>、<https://threejs.org/docs/#api/en/core/InstancedBufferAttribute>、<https://threejs.org/docs/#api/en/core/BufferAttribute>。

## 4. 开放问题（附默认值）

- 正式 `assets/default/rig/<set>/` 与装备 layers 尚未合入；默认继续使用同尺寸描边/tint 占位，素材到位后不改公开 API。
- `packages/core` 尚无可直接复用的 `Equipment` 类型；默认由集成层只读映射为 `EquipmentVisuals`，render 不判断玩法合法性。
- `tools/rig/gait.py` 不存在，故无法运行 Python/TS 逐值互测；默认以 DES-rig §4 的 24 行规范向量为共同基线。
- Playwright Chromium 因 macOS 沙箱拒绝 Mach port 注册而无法启动；默认保留 CPU 门槛，合入前在真实浏览器补做视觉与“桌面 20 人 ≥60 fps”验证。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 AR-21、AR-22、DES-rig 与渲染规格，未发现必须修改基准的冲突。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/03-mobile-performance.md` / 角色渲染实测：下游在桌面与目标移动真机补录 20 人 FPS、GPU 帧时和功耗。
- ENG-02/ENG-06 的 core 接口说明 / 装备只读投影：稳定类型落地后记录到 `EquipmentVisuals` 的字段映射。
- ART-rig-parts、TOOL-rig-pipeline 交付说明 / 素材状态：正式 PNG/layers 合入后登记清单，并关闭占位回退。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ API 与数据流：`loadRigSet` → 共享 `RigSet`；`createRigCharacter` → `RigInstance`；每帧 `update` → `RigBatch.sync` → 合并脏区上传。
- ✅ 步态与方向：纯函数、速度迟滞、轻/中/重、三视图镜像八方向、“一拍二”可关闭；24 个规范向量通过。
- ✅ 装备：七类可视装备即时换装；四附加槽按优先级装配，溢出合成到基础层；快照与元数据变更测试通过。
- ✅ 渲染性能结构：单 `InstancedMesh`、共享 atlas、2 draw call、固定容量缓冲、稳态热路径无显式对象/数组分配、仅写脏范围。
- ✅ 无头 smoke：场景、实例数、双 pass、换装、manifest 校验和大 `dt` 披风稳定性通过。
- ✅ 性能数据：20 人/400 实例 P95 0.095 ms；100 人/1,600 实例 P95 0.318 ms；两者均为 Node CPU 更新基准。
- ✅ 验收命令：锁定安装通过；`pnpm check` 通过（18 文件/60 测试）；游戏 build 通过；严格 ID 校验新增失败 0。
- ✅ 体积：`pnpm size` 通过，rig 为懒加载独立 chunk，不进入首屏入口 chunk。
- ✅ 占位：39 个基础部件缺图时生成描边色块，装备缺层使用可 tint 的五类占位格；正式图可由 manifest 无缝替换。
- ✅ 下游接口：`packages/render/CLAUDE.md` 已给 ENG-08/09/10 共享批次、可见性、HexDir 转换与释放约定。
- ⚠️ 浏览器实测：Chromium 下载成功但被宿主沙箱阻止启动；未宣称 WebGL 视觉正确或真实桌面 60 fps 已验证。

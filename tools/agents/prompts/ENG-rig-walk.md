# 本任务：游戏工程 · 角色分层部件渲染与代码步态（AR-22）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`packages/core/CLAUDE.md`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-22**：「盔甲衣服兵器靴子等要用code处理出小图，主角在地图上行走时，要反映出装备特性。行走动画要用代码写出轨迹，分别贴图」；**AR-21**：性能要最好。

## 规格

`docs/tech/09-character-rig.md`（DES-rig）：§1 部件与枢轴、§2 装备层、§4 步态公式与测试向量、§5 运行时与性能契约、§6 manifest；`docs/tech/02-rendering.md` §2.5–§2.6（改后）、§3（深度与排序）。素材：`assets/default/rig/<set>/`（ART-rig-parts，可能尚未合入——没有时用程序生成的占位部件：带描边的色块，尺寸按规格）、`assets/default/item/<类>/layers/`（TOOL-rig-pipeline 生成的装备覆盖层，可能部分缺失——缺的槽位用 tint 占位）。`tools/rig/gait.py` 是同一公式的 Python 参考实现，TS 实现结果须一致。

## 要做的事

1. `packages/render/src/rig/`：`loadRigSet(manifest)`（部件图集打包：运行时把部件 PNG 装进一张图集或读预打包图集，二选一写明）；`createRigCharacter(rigSet, equipment)` → `RigInstance`：`setMotion(dir8, speedMps, weightClass)`、`setEquipment(equipment)`、`update(dt)`；`gait.ts`（规格 §4 公式，纯函数，与 `tools/rig/gait.py` 同一测试向量）；装备层装配（规格 §2 表：槽位 → 部件挂点、偏移、缩放、z 序、摆动）；三视图 + 镜像 → 8 方向；"一拍二"量化选项。
2. 渲染：所有角色的所有部件用同一 `InstancedMesh`（每实例属性：UV 矩形、平面内 2D 仿射、z 排序键、tint），直立公告板（tech/02 §2.5 保留的顶点着色器思路），每角色 ≤ 2 draw call；CPU 每帧更新 ≤ 100 角色 × 16 部件的实例缓冲，只写变化区间；给帧时间统计。
3. 装备反映：从 core 的 `Equipment` 状态（ENG-02 / ENG-06 定义；若尚未合入，用 `packages/core` 现有类型或本任务在 render 侧定义只读接口）映射到层；换装即时生效；轻 / 中 / 重三档修正步态。
4. demo：`apps/game` 加路由 / 场景 `rig-demo`：一个角色八方向行走 / 跑步 / 待机切换、装备开关（兵器 / 盔甲 / 披风 / 鞋 / 头饰 / 腰带 / 护肩）、步态参数滑杆、帧时间与 draw call 显示；20 个角色同屏压力开关。
5. 测试：步态测试向量断言（规格 §4 表）；装备层装配快照；实例缓冲更新只写变化区间；无头 smoke（场景可建、实例数正确）；`pnpm check` 全绿、`pnpm size` 过（rig 模块不进首屏 chunk）。
6. 更新 `packages/render/CLAUDE.md`：rig API，交 ENG-08（大地图）/ ENG-09（城镇）/ ENG-10（战斗单位）。

性能是作者硬要求（AR-21「性能要最好」）：零每帧分配、实例化合批、图集共享；20 角色同屏桌面 ≥ 60 fps，报告给数据。

约束：不改 core；不改规格（偏离写报告）；尽量不加新依赖；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：API 与数据流；步态向量比对结果；性能数据（帧时间、draw call、实例数）；占位与缺素材的处理；交下游接口。报告 ≤ 100 行。

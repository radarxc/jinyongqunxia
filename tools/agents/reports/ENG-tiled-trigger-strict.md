# ENG-tiled-trigger-strict 报告 · 游戏工程 · 小修：Tiled Trigger 的 action 按已登记动作名（Ink OPCODES）大小写敏感校验；Door 的 lockedBy 不得填任务 ID（能查登记源则校验 RegionGate ID）
## 1. 摘要（3–6 行）
Tiled Trigger `action` 已改为严格、大小写敏感的 Ink OPCODE 白名单校验，合法驼峰不再被 schema 拒绝。
非法动作诊断包含源文件、对象 ID、输入值；仅大小写不同者给出“你是不是想写 …”。
Door `lockedBy` 复用 Canon `gate_<NN>_<name>` schema，任务/阶段/旗标等错域 ID 在编译期拒绝。
仓库尚无内容侧 RegionGate binding 登记源，故本轮不虚构登记闭合校验。
## 2. 产出（文件、行数、主要章节）
| 文件 | 总行 / 净变更 | 主要内容 |
|---|---:|---|
| `build/ink.ts` | 205 / +1 | 从 `OPCODES` 派生并导出 `INK_OPCODE_NAMES` |
| `schemas/region-map.ts` | 597 / +7−3 | Trigger 驼峰形状；共享 `RegionGateIdSchema`；Door 引用该 schema |
| `build/tiled-objects.ts` | 215 / +14−1 | action 白名单、建议诊断、lockedBy 对象级诊断 |
| `build/tiled.test.ts` | 904 / +81 | 12 个 OPCODE、大小写/未知动作、3 类错域 ID、合法 gate 形状 |
| `reports/ENG-tiled-trigger-strict.md` | 31 / 新建 | 七节交付、自检与 RegionGate 后续交接 |
## 3. 关键结论与数值
- 白名单唯一来源是 `ink.ts` 的 `OPCODES`；`INK_OPCODE_NAMES=Object.keys(OPCODES)`，Tiled 未另抄清单。
- 示例：`trigger_action action "party/giveitem" is not a registered Ink opcode；你是不是想写 party/giveItem`。
- `lockedBy` 校验程度：严格核对 Canon gate ID 形状；因无内容登记源，尚不能核对 binding 是否存在。
## 4. 开放问题（附默认值）
- RegionGate binding 尚无内容 schema/文件/加载注册表；默认继续由 `apps/game/src/runtime/content.ts` 的 `GameContent.regionGates` 可选注入，未登记 gate 运行时保持锁定。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；复用 Canon §12 已登记的 `gate_<NN>_<拼音>`。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- CONTENT-ch00b / ch00a / ch10：由内容任务确定 RegionGate binding 的正式登记文件与 `gateId/expression`，地图 `lockedBy` 对齐已登记 `gate_<NN>_*`；ENG 再接该源到 `GameContent.regionGates` 并补构建期闭合校验。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ action 逐字白名单、合法驼峰、大小写建议、未知动作及文件/对象/原值诊断均有回归。
- ✅ lockedBy 拒绝 `q_/st_/fl_` 及其他非 Canon gate 形状；`gate_00_zhulin_exit` 通过形状校验。
- ⚠️ 无内容侧 binding 源，无法验证 gate 是否已登记；已交 CONTENT-ch00b/ch00a/ch10 与 ENG 后续。
- ✅ `pnpm install --frozen-lockfile`；data 14 文件/181 测试；全仓 lint/typecheck、141 文件/1014 测试；strict ID 新增失败 0；`git diff --check`。
- ✅ 等价内容入口 `node --import tsx ...validate-content.ts`：987 文件/925 对象/62 地图；`pnpm size` 全绿（entry 38.45/170 KiB、WebGL 200.32/350、session 86.20/110）。
- ⚠️ 原样 `pnpm content:validate` 与 `pnpm check` 在 `tsx` CLI 创建 Unix socket 时被沙箱 `EPERM` 阻断；后者此前 lint/typecheck/1014 测试已绿，非内容诊断失败。

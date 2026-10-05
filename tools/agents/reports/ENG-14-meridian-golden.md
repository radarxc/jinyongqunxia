# ENG-14-meridian-golden 报告 · 游戏工程 · 经脉 runner 黄金对拍与零副作用 preview

## 1. 摘要（3–6 行）

- 已新增 TypeScript `fixtureVersion=2` runner，直接消费同一份 `tools/balance/meridian_flow_golden.json`。
- fixture 的 `masterSeed=20260927` 与 `vectorSha256=af33dcd1…52cd76` 先验通过；31/31 顶层输出逐字段一致。
- `MeridianFlowRuntime.preview(route, options?)` 已实现 `previewRollBp=9999`、对手档案、攻防速度倍率与 F0 整路硬封预检。
- preview 单路线 18 段本机中位数 0.0220 ms，低于 0.15 ms【建议值】；性能测试只报告、不阻断。

## 2. 产出（文件、行数、主要章节）

- `packages/core/src/battle/meridian-flow/golden-runner.ts`（572 行）：从 `inputs` 重建四单位与 31 组输出。
- `packages/core/src/battle/meridian-flow/meridian-flow.golden.test.ts`（77 行）：五项身份硬锁、首差异路径、全输出对拍。
- `packages/core/src/battle/meridian-flow/preview.test.ts`（141 行）：三种后段硬封、1/100 次 preview 对照、不变量与性能。
- `math.ts/runtime.ts/types.ts`（166/676/165 行）：整数攻防速度曲线、preview API、整路 F0 与预分配结果。

## 3. 关键结论与数值

- 覆盖字段：路线 trace、质量、CT、四单位隔离；`battleRng` 前/英雄后/全单位后/自解穴后；攻防、护体、速度、擒拿、点穴、调息、归一化及五档 TTK。
- 向量统计：31 个顶层输出组全部一致，0 个不一致项；因此无需已知差异标记，也未修改 golden JSON。
- fixture 身份硬锁：`2/2/1`、seed `20260927`、完整 SHA `af33dcd1…52cd76`；协议 1 原始 SFC32 输出兼容。
- preview 返回版本、profile、攻防速度倍率与逐段概率；任一硬封均在 F0 返回 `attempted/completed/flowCt=0`。
- MF-I04：无 preview、1 次、100 次 preview 后 commit 的结果、battle RNG 四字状态与最终状态 hash 完全相等。
- 返修判定：后段硬封与旧 options/缺倍率均为 TS 偏离，分别按 design/21 §11.4/§14.6、§11.5/§12.3 修复。
- `--write-golden` 仅存在于人工 Python CLI；包脚本、CI 与其他执行脚本均未调用。

## 4. 开放问题（附默认值）

- O1：当前门禁只在 Node/V8 执行；默认由后续浏览器闸门补 Playwright WebKit/JSC 同工件验证。
- O2：0.0220 ms 是本机 501 样本中位数，不替代三档真机 P95；默认按 design/21 §11.8 保留【待实测】。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 `design/21` §1.5、§11.5、§11.7、§11.8、§12.3、§17。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/08-backend-and-online.md`：行 9、18、529、531、2012、2922、2942 的 `meridian-flow-state.v1` 改为归属文档已定的 `.v2`。
- `docs/tech/09-roadmap.md` §3.3 行 316：`meridian-flow-state.v1` 改为 `.v2`。
- golden 协议标注：保留 `rngProtocol=1`，协调者注明其只用 `nextU32()%10000`、不依赖 `intInclusive`，无需重录。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 黄金读取：直接读取未修改 JSON；硬断言 fixture/rules/RNG 协议、seed、完整 SHA 后运行向量。
- ✅ 对拍范围：31/31 顶层输出逐字段相等；失败信息含首差异 JSON path、期望值与实得值。
- ✅ 不一致统计：一致 31，不一致 0；无静默跳过、无 golden/Python 偏差待裁定。
- ✅ preview：正式 `previewRollBp/opponent`；返回 profile、攻防速度倍率；后段未开/胀损/9 级点穴均 F0 零尝试。
- ✅ 不变量：调用 1/100 次后，commit 结果、battle RNG、状态 hash 与 0 次组相等；版本/快照/节点 hash 不变。
- ✅ 热路径：结果、profile、数组、trace 构造期预分配；每次原地清零，preview 内不创建集合、数组或对象。
- ✅ 性能：18 段、501 样本中位数 0.0220 ms；预算 0.15 ms，测试只报告、不阻断。
- ✅ 确定性门禁：`pnpm --filter @tianshu/core test` 32 文件/226 测试通过；golden 测试自动纳入。
- ✅ 指定检查：`pnpm check` 67 文件/351 测试，另有性能 1 文件/2；内容、构建、包体通过。
- ✅ 严格 ID：128 文件、68,107 次出现，基线 undefined 1、新失败 0；`git diff --check` 通过。
- ✅ 范围：仅修改授权目录与本报告；未改主循环、golden、文档、锁文件，未执行改变仓库状态的 git 命令。
- ⚠️ 需协调者同步：tech/08、tech/09 旧快照名；golden `rngProtocol=1` 的兼容说明。

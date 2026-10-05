# ENG-18e-build-test-timeout 报告 · 游戏工程 · 小修：build.test.ts 真实内容构建用例在全量测试并行时超时（夹具化或显式固定超时，不按负载放宽）
## 1. 摘要（3–6 行）
- 采用优先方案 1：把物品叶片集成用例改为静态小型内容根，不再扫描仓库真实 `content/`。
- 3 件物品与 3 个分属 common/world/chapter 的事件组成合法最小根；固定 512 B 阈值稳定触发规则 3 片、文本 2 片。
- 断言覆盖规则/文本独立、逻辑名、分叶顺序、规则不含 `text`、固定 content/text hash 与二次构建一致性；未改全局或用例超时。
## 2. 产出（文件、行数、主要章节）
- `packages/data/src/build/build.test.ts`：246 行；目标用例改用夹具，精确断言分页与 hash（净 +37 行）。
- `packages/data/src/build/__fixtures__/item-leaves/**`：6 个 YAML、78 行；3 物品 + common/world/chapter 各 1 事件。
- 本报告：≤30 行。
## 3. 关键结论与数值
- 做法：夹具化；`entryCount=6`，`maxLeafBytes=512`，规则叶 `p000..p002`，文本叶 `p000..p001`。
- 改前单独运行：Vitest 4,486 ms（墙钟 5.37 s；另一次默认 5 s 超时为 5,060 ms）；改后单独运行：39 ms（墙钟 1.05 s）。
- 全量 `pnpm test`：目标用例 29.301 ms；120 文件、825 用例全部通过。
## 4. 开放问题（附默认值）
- 无；默认继续由独立的 889 项纯分片用例覆盖真实目录规模边界，本用例只验证构建管线语义。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；未改变内容格式、hash 算法、叶片预算或性能门禁。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`；`pnpm --filter @tianshu/data test`（10 文件/93 用例）；严格 ID 检查（新增失败 0）。
- ✅ `pnpm check` 完整链路通过：lint/typecheck、120 文件/825 测试、923/923 内容、build 与三项包体预算。
- ⚠️ 沙箱禁止 `tsx` CLI 创建 IPC socket；`pnpm check` 仅在当前 shell 将 `tsx` 等价映射为 `node --import tsx` 后通过，未改仓库配置。
- ✅ 仅改允许写集；未改生产实现、全局 `testTimeout`、其他用例或 `tools/perf/**`；无按负载跳过/放宽。

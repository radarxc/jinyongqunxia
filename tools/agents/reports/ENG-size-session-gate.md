# ENG-size-session-gate 报告 · 游戏工程 · 体积门禁补「首次会话闭包」（Worker 壳 + 首次会话静态闭包 + 虚拟基础内容，预算 110 KiB gzip；entry 170 只约束标题页；子系统块只报告）

## 1. 摘要（3–6 行）

体积检查已扩为标题页、首次会话、懒加载子系统三层；所有既有预算不变，仅新增首次会话 110 KiB gzip 门禁。
Worker 构建现在额外产出 `size-groups.v1` 元数据；会话或子系统必需组缺失时失败关闭，子系统当前只报告。
实测标题页 38.44/170 KiB、首次会话 86.16/110 KiB，均通过。
## 2. 产出（文件、行数、主要章节）

- `apps/game/build/size-groups-plugin.ts`（99 行）与 `vite.config.ts`（69 行）：源模块识别、静态闭包、Worker 元数据注册。
- `tools/perf/check_size.mjs`（208 行）：三层计量、去重合计、错误码与分段输出。
- `tools/perf/check_size.test.mjs`（163 行）：9 个合成 manifest/组元数据用例。
- `tools/perf/budgets.json`（18 行）与 `README.md`（17 行）：仅增 `session: 110` 并说明口径。
- `tools/agents/reports/ENG-size-session-gate.md`（本报告，40 行）：结论、同步项与自检。
## 3. 关键结论与数值

- 标题页继续按主 manifest 的 `gzipClosure(entryKey)`；Worker 插件按 `moduleIds` 源模块键定位，以 Rollup `imports` 求静态闭包，不猜产物文件名。
- 标题页 entry 38.44/170、render 161.87/180、WebGL total 200.31/350 KiB gzip；既有行和预算保留。
- 首次会话：Worker 壳 2.33 + 会话静态闭包 65.33 + 虚拟基础内容 18.50，按文件去重后 86.16/110 KiB gzip（PASS）。
- 首次会话后的增量子系统：对话 / Ink 35.35、区域 44.19、战斗 33.77、城镇 25.64 KiB gzip，均标“未设门”。
- 合成超限示例：`session total 257.93 110 FAIL`，退出 1；缺组输出 `SIZE_SESSION_GROUP_MISSING:<组>` 或 `SIZE_SUBSYSTEM_GROUP_MISSING:<组>`。
## 4. 开放问题（附默认值）

- 作者是否确认 TODO §8.2 的 110/170/只报告裁定；默认继续采用协调者 10-03 09:52 数值。
- 何时给四个子系统设门；默认积累稳定基线前维持“未设门”。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG-SIZE-01 / 增列首次会话闭包 110 KiB gzip / 补上 entry 拆分后首次游玩约 86 KiB 不受约束的缺口。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/01-architecture.md` / §5.4 包体门禁表 / 增加首次会话 110；注明 entry 170 仅标题页，四个子系统逐块报告但不设门，并记录 `size-groups.v1` 来源。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 三层表头、真实组成与中文子系统名齐全；会话按文件去重，超限退出 1。
- ✅ 元数据插件只读输出块图并新增 JSON；前后代码块 hash 不变，未改变分块。
- ✅ 9 个合成测试覆盖识别、110 超限、会话/子系统缺组、子系统不阻断及原 entry 口径。
- ✅ `pnpm install --frozen-lockfile`、游戏 build、直接 size、严格 ID 检查通过；严格 ID 新增失败 0。
- ⚠️ `pnpm check` 通过（140 文件/990 测试）；沙箱禁止 tsx IPC，临时改用等价 `node --import tsx`，启动脚本已恢复。
- ✅ 内容校验 987 文件/925 对象/62 地图，开发块检查 559 assets/66 manifest entries。
- ✅ `git diff --check` 通过，改动仅在允许写集内；报告不超过 40 行。

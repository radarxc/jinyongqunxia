# ENG-18c-content-from-docs 报告 · 游戏工程 · 内容不再从设计文档正则抽取、剧情 DSL 构建期编译检查（审计 M6）

## 1. 摘要（3–6 行）

经脉拓扑与门派名录已从 Markdown 正则投影迁入 6 个受 Zod 约束的生产 YAML；Vite 只读内容数据，设计文档只供一次性导入与回归对拍。
新增 `pnpm content:compile-story`，用 core 编译器遍历所有 `story.v1` 条件，并用动作白名单校验内联动作；任何诊断非零退出且定位到文件、行、列。
4 个正反例由 Vitest 子进程桥接纳入根/data 测试，且编译检查并入 `pnpm check`；除整仓 `check` 外其余指定命令全过，`check` 被基点既有 BattleField 用例阻断。

## 2. 产出（文件、行数、主要章节）

| 文件                                         |      行数 | 主要内容                                                |
| -------------------------------------------- | --------: | ------------------------------------------------------- |
| `content/common/meridians/*.yaml`            |       430 | `regular12` / `extra8`：20 经、180 穴                   |
| `content/common/sects/*.yaml`                |       218 | 4 分组、99 门派                                         |
| `schemas/catalog*.ts`                        |       158 | 两类 schema、一次性 Markdown 抽取、正反例与逐项等价测试 |
| `content-registry.ts` / `content-index.ts`   | 161 / 353 | 版本路由、YAML 位置、分组/总数/唯一性校验               |
| `import-doc-catalogs.ts`                     |        46 | 一次性确定性初稿生成器                                  |
| `compile_story.ts` / `test_compile_story.ts` |  165 / 84 | 全量发现、core 编译、稳定诊断、4 个夹具                 |
| `story-compile-tool.test.ts`                 |        22 | Vitest 子进程执行四夹具脚本，不让 data 导入 core        |
| plugin / story schema / package / CLAUDE     |      变更 | YAML 消费、严格动作 union、命令与协作约定               |

## 3. 关键结论与数值

- 抽取等价：20 经 / 180 穴 / 99 门派逐项深比较通过；导入前后 6 个 YAML 的 SHA-256 逐文件不变。
- 正式剧情：3 条 / 2 章编译通过；检查 trigger、sideHooks、condition 节点、choice `when`、condition 边及章节线集合。
- 诊断格式：`content/story/ch01/bad-condition.yaml:16:19 error CONDITION_OPERATOR ...`；动作、YAML 反例亦验证精确行列。
- 内容构建：1628 objects / 15 chapters；data 为 21 files / 215 tests；game build、size 及首次会话 97.42 / 110 KiB 均通过。
- 挪基点解冲突：保留 catalog YAML 加载，同时保留 encounter/roleSlot/region schema、章节 NPC/地图正文叶片、模型分章及离线闭包登记。
- 技术核实（2026-10-04）：[`yaml` LineCounter](https://eemeli.org/yaml/) 支持 `linePos()`；本仓锁定 2.8.1（[registry](https://registry.npmjs.org/yaml/2.8.1)）。

## 4. 开放问题（附默认值）

- O1：`yaml@2.8.1` 受 [CVE-2026-33532](https://www.cve.org/CVERecord?id=CVE-2026-33532) 影响，2.x 修复于 2.8.3；本任务禁止改依赖，默认由依赖升级任务处理，内容仍视为可信仓库输入。
- O2：`pnpm check` 在 177 files / 1255 tests 中仅 `BattleField.test.ts` 1 例失败；集成日志同错且 HEAD 已登记 `ENG-fix-battlefield-highlights`，默认由该任务修复，本文不越写集改测试。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；仅把既有事实迁入生产 schema，并前移既有 core 编译。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档                           | 位置 / 改什么                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 依赖维护任务                   | 将 `yaml` 升至 ≥2.8.3，重跑冻结安装与全门禁                                                          |
| ENG-fix-battlefield-highlights | 补齐 BattleField renderer mock 的 `projectUnit`，恢复整仓 `pnpm check`                               |
| CONTENT-ch00 / ch10            | 正式 `story.v1` 每次提交前运行 `pnpm content:compile-story`；按文件:行:列修条件/动作，勿等运行时触发 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 新数据/schema：独立 `meridian-topology.v1`、`sect-catalog.v1`；strict 字段、ID、分组数量、总数、唯一性均校验。
- ✅ 抽取等价：一次性脚本确定性、逐项深比较和 SHA-256 不变；生产插件无 `docs/` 读取。
- ✅ 编译诊断：合法、坏条件、坏动作、坏 YAML 共 4 例；格式固定且失败非零；Vitest 子进程桥接在根/data 测试均执行。
- ⚠️ `pnpm check`：lint/typecheck 通过后，根测试 176/177 files、1254/1255 tests；唯一失败为基点已登记的 BattleField mock，故后续步骤另行逐项实跑通过。
- ✅ CONTENT-ch00/ch10：写完 YAML 先跑 `pnpm content:compile-story`，再跑 `pnpm content:build` / `pnpm check`。
- ⚠️ 命令：冻结安装、content build/validate/compile、四夹具、data test、game build/size、strict IDs 均退出 0；仅整仓 `check` 因 O2 非零；无冲突标记且 `git diff --check` 通过。
- ⚠️ 版本：联网确认 `yaml` 安全升级缺口，按写集/不加依赖约束未处理，已列 O1 与 §6。

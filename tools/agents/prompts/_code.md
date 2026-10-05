## 一之二、代码任务附加规则（本任务写代码，不只写文档）

1. **技术事实来源**：`docs/tech/01`（架构、monorepo、依赖版本、代码规范）、`tech/02`（渲染）、`tech/03`（性能预算）、`tech/04`（数据与内容管线）、`tech/05`（玩法核心契约）、`tech/06`（素材存储）、`tech/07`（素材生成）、`tech/08`（后端）、`tech/09`（路线图与闸门）。代码必须实现文档已定的契约与命名；文档有歧义时按最保守的解读实现，并在报告第 4 节登记，**不要改文档**（除非任务明确把某文档列入"你负责的文件"）。
2. **工具链**：Node ≥ 24、pnpm 12（`packageManager` 字段固定版本）、TypeScript `~6.0.x`（strict，`tech/01` §8.1：不用 TS 7）、Vite 8、Vitest 5、ESLint flat config；Python 工具用 `uv` 管理（Python ≥ 3.11）。依赖版本以 `tech/01` §4.2 / §4.3 的 catalog 为准；本机安装失败时可提升到同一 major 的最新版，并在报告中写明差异。
3. **完成定义**：`pnpm check`（lint + typecheck + test + content:validate）在你的工作区通过；本任务"验收标准"里列出的命令你必须**亲自运行并通过**后才能结束。不要以"应当能通过"代替运行。
4. **确定性**（`tech/05` §4、`tech/01` §8.3）：`packages/core`、`packages/shared` 及其测试中禁止 `Math.random`、`Date.now`、`performance.now`、`new Date()`、`Math.pow` / `**` / `Math.exp` / `Math.log` / 三角函数参与结算；随机只来自种子 RNG，实数只用整数 / 万分点（bp）。ESLint 规则要把这些禁令落成可执行检查。
5. **包边界**：`core` 不依赖 DOM / three / vue；`render` 只消费 `core` 的只读快照与事件；`packages/spec/` 是跨语言静态契约的唯一目录（裁定 C18），JSON 契约改动必须同时更新 schema 与消费方。
6. **测试**：每个公开函数至少一条单元测试；数学 / 几何 / 编码类用属性测试（fast-check）；有 golden 的功能要与仓库里已有的 Python 参考实现（`tools/balance/*.py`）对拍，数值逐位相等。
7. **文件与写入**：源码文件尽量 ≤ 400 行；一次写入 ≤ 150 行，分多次写；不要把大段生成的 JSON / lockfile 之外的产物提交（`dist/`、`node_modules/`、`.cache/` 必须被 `.gitignore` 排除）。`pnpm-lock.yaml` 属于产物中**必须**提交的文件。
8. **不要**：安装全局工具、修改系统配置、访问账号 / 密钥、部署到任何服务、上传任何文件；`.env*` 与密钥永远不进仓库。
9. **报告**第 2 节列出新增 / 修改的包与文件树、每条验收命令的实际输出摘要（通过 / 失败与数字）；第 3 节写实现中作出的技术决定（与文档一致处与偏离处分列）；第 7 节逐条对照验收标准。


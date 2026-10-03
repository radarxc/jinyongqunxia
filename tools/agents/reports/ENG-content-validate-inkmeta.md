# ENG-content-validate-inkmeta 报告 · 游戏工程 · 小修：content:validate 与编译管线对齐，*.inkmeta.yaml 走 parseInkMeta 与 .ink 配对校验，不进内容注册表（挡住 CONTENT-ch10 / ch00a）

## 1. 摘要（3–6 行）

`content:validate` 已改用编译管线的 `discoverContent()` 分类，不再把 `*.inkmeta.yaml` 送入内容注册表。
Ink 元数据经 `parseInkMeta()` 校验，并复用构建管线的配对/编译逻辑双向检查同名 `.ink`。
汇总新增 Ink 故事数；普通内容 YAML、Tiled 校验与未知 schema 拒绝语义保持不变。
CONTENT-ch10 / ch00a 的成对 Ink 文件可进入校验，二者合入前需挪基点并 `--from validate`。

## 2. 产出（文件、行数、主要章节）

- `packages/data/scripts/validate-content.ts`（26 行）：薄 CLI、诊断、非零退出与汇总。
- `packages/data/src/build/validate.ts`（59 行）：统一发现、注册表、Ink、Tiled 校验装配。
- `packages/data/src/build/pipeline.ts` / `index.ts`：导出既有 Ink 配对编译函数与校验入口。
- `packages/data/src/build/validate.test.ts`（60 行）及 9 个夹具：6 项回归覆盖。

## 3. 关键结论与数值

- 生产校验：987 files / 925 objects / 0 ink stories / 62 maps；Ink 元数据不计入 925 个注册表对象。
- data：14 个测试文件、163 个用例全过；全仓：141 个测试文件、989 个用例全过。
- 覆盖合法配对、缺 meta、缺 ink、非法 meta、普通 YAML 成功、普通 YAML 未知版本失败。

## 4. 开放问题（附默认值）

- 无代码开放问题；默认 CONTENT-ch10 / ch00a 在本任务合入后挪基点并从 validate 阶段重跑。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；实现既有 Ink 同名配对和数据管线约定。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 调度状态：CONTENT-ch10 / ch00a 更新基点后执行 `--from validate`；无需改策划/技术正文。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 冻结安装成功；只修改允许路径，未改 `content/**`、schema 版本表或 `TODO.md`。
- ✅ Inkmeta 不入注册表；`parseInkMeta`、双向同名配对及 Ink 编译均执行，错误含路径并非零退出。
- ✅ data test/typecheck、Prettier、ESLint、`git diff --check`、`content:validate` 与 `pnpm check` 全链通过；沙箱内仅将 `tsx` 等价映射为 `node --import tsx`。
- ✅ `python3 tools/lint/check_ids.py --strict`：new=0；仅既有 `sk_babuganchan` 基线。

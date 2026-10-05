# 本任务：仓库地基——pnpm monorepo、严格 TypeScript、CI、`pnpm check`、静态契约目录

按 `docs/tech/01-architecture.md` §4（目录树、workspace catalog、根脚本）、§7.5–§7.6（内容校验与 CI）、§8（代码规范、确定性 lint）、§9（`CLAUDE.md` 约定）搭出可运行的骨架；后续 T1（core）、T2（data）、T3（render/bench）、T5（api/platform/game）在这个骨架上填充。这是 `tech/09` P0 "仓库地基"交付。

## 至少包含

1. 根：`package.json`（`packageManager: pnpm@12.x`、`engines.node >=24`、脚本 `dev / build / check / lint / typecheck / test / content:validate / size`）、`pnpm-workspace.yaml`（`packages/* apps/* services/* tools/*` + catalog，版本按 tech/01 §4.2；本机解析不到的版本提升到同 major 最新并在报告说明）、`tsconfig.base.json`（strict、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、project references 根 `tsconfig.json`）、`eslint.config.ts`（flat；`packages/core` 与 `packages/shared` 的确定性禁令规则：禁 `Math.random / Date.now / performance.now / new Date() / Math.pow / ** / Math.exp / Math.log / Math.sin|cos|tan`，用 `no-restricted-syntax` / `no-restricted-properties` 实现并写测试证明会报错）、`vitest.config.ts`（projects：core / shared / data 为 node；ui 为 happy-dom；render 为 browser 或 node+stub，先 node）、`.gitignore`（`node_modules dist .cache .agents art/work coverage *.tsbuildinfo`）、`.npmrc`、`.node-version`、`lefthook.yml`（可选）。
2. 包骨架（每个含 `package.json`、`tsconfig.json`、`src/index.ts`、一条冒烟测试）：`packages/shared`、`packages/spec`、`packages/data`、`packages/core`、`packages/render`、`packages/ui`、`packages/platform`、`packages/devtools`、`apps/game`、`apps/bench`（P0 原型宿主，tech/02 §12）、`services/api`、`tools/content-build`；内部包 `exports` 直指 `./src/index.ts`（tech/01 §4.2"源码直连"）。
3. `packages/spec/`：按 `tech/02` §1.3 / §2.6 / §6.1 / §7.1 与 `tech/06`、`tech/07` 已定稿内容写出 `iso-camera.json`、`sprite-spec.json`、`palette.json`（色值取 tech/07 §2.3）、`time-of-day.json`、`vfx.schema.json`、`anim-events.schema.json` 的 v1（字段以文档为准，文档未给终值的写文档标注的建议值并加 `"_note"`）；每个 JSON 有对应 JSON Schema 与一条校验测试。
4. `tools/content-build`：CLI 骨架 `validate` / `build`（tech/04 §4 的九步管线先只实现 L0–L2：环境、语法、结构），`pnpm content:validate` 对 `content/` 目录（此时可为空或只含 T2 之前的占位）能跑通并退出 0。
5. `.github/workflows/ci.yml`（tech/01 §7.6：lint → typecheck → test → content:validate → build → size；`docs/**` 只改文档时跳过；`concurrency` 取消过时运行）；`size-limit` 配置（entry ≤ 170 KB、render ≤ 180 KB gzip 的门禁先以占位 chunk 建立）。
6. `CLAUDE.md`（根）与每个包的 `CLAUDE.md`（tech/01 §9：数据驱动优先、schema 即文档、`pnpm check` 为完成定义、小步提交、包边界）。
7. `docs/adr/0000-scaffold.md`：记录本任务作出的版本 / 配置决定与偏离文档之处（这是唯一允许写入 `docs/` 的文件）。

## 验收标准（你必须亲自运行）

- `pnpm install`（首次生成 `pnpm-lock.yaml`，随后 `pnpm install --frozen-lockfile` 通过）。
- `pnpm check` 全绿；`pnpm build` 成功；`pnpm size` 通过。
- 确定性 lint 测试：在 `packages/core` 放一段含 `Math.random()` 的临时代码时 `pnpm lint` 失败（测试用例证明，之后移除临时代码）。
- `git status` 无未跟踪的产物目录；`pnpm-lock.yaml` 已加入。

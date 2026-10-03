# 本任务：游戏工程 · 小修：`pnpm content:validate` 不认 `.inkmeta.yaml`（与内容编译管线的分类不一致），挡住 CONTENT-ch10 / ch00a 合入

"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 现象（协调者 10-03 12:00 复现）

CONTENT-ch10-cold-entry 第一次运行写出 `content/story/ch10/story_ch10_cold_entry.inkmeta.yaml`（`schemaVersion: inkmeta.v1`，按 `content/README.md`「`<storyId>.ink` 必须配同名 `.inkmeta.yaml`」）后，校验失败：

```
TypeError: CONTENT_SCHEMA_VERSION:content/story/ch10/story_ch10_cold_entry.inkmeta.yaml:inkmeta.v1
    at identifyContentKind (packages/data/src/content-registry.ts:69)
    at parseContentFile → loadContent (packages/data/src/content-index.ts:144)
    at packages/data/scripts/validate-content.ts:36
```

原因：`packages/data/scripts/validate-content.ts` 把 `content/` 下所有 `.yaml` 都当内容定义交给 `loadContent`；而编译管线 `packages/data/src/build/discover.ts` 早已把 `*.inkmeta.yaml` 归为 `inkmeta`、由 `src/build/ink.ts` 的 `parseInkMeta` 与同名 `.ink` 配对处理。集成分支上还没有真实的 inkmeta 文件，所以一直没暴露；CONTENT-ch00a-data 也写了 `content/story/ch00/story_ch00_main.inkmeta.yaml`，会撞上同一个问题。

## 要做的事

1. `validate-content.ts` 与编译管线对齐：`*.inkmeta.yaml` 不进内容注册表；改用 `parseInkMeta` 校验，并检查配对（每个 `.ink` 有同名 `.inkmeta.yaml`、每个 `.inkmeta.yaml` 有同名 `.ink`），出错时报「路径 + 原因」并非零退出。优先复用 `discoverContent` / `parseInkMeta` 等现成函数，不复制 schema。汇总行加上 ink 故事数。
2. 加测试（`packages/data` 内，fixture 放测试目录，不放进 `content/`）：合法配对通过、缺 `.ink` / 缺 `.inkmeta.yaml` 报错、inkmeta 字段非法报错、普通内容 YAML 行为不变。如需把校验逻辑抽成函数供测试，放 `packages/data/src/tooling.ts` 或新文件，`validate-content.ts` 只做装配。
3. 不改 `content/**`，不改内容 schema 版本表的语义（`identifyContentKind` 对真正未知的版本仍要报错）。

## 约束

- 只写：`packages/data/scripts/validate-content.ts`、`packages/data/src/tooling.ts`、`packages/data/src/build/*.ts`（仅在需要导出现成函数时）、`packages/data/src/**/*.test.ts`、`packages/data/src/**/__fixtures__/**`、本任务报告。
- 每次写入 ≤ 150 行。

## 检查

`pnpm install --frozen-lockfile`、`pnpm --filter @tianshu/data test`、`pnpm content:validate`、`pnpm check`、`python3 tools/lint/check_ids.py --strict`。

## 报告

`tools/agents/reports/ENG-content-validate-inkmeta.md`（≤ 40 行）：改了什么、测试覆盖、对 CONTENT-ch10 / ch00a 的影响（它们合入前需挪基点 `--from validate`）。

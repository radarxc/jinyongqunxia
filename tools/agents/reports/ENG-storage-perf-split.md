# ENG-storage-perf-split 报告 · 游戏工程 · 小修：存储层两条「1 MiB 快照 50 ms 内」计时断言挪到 check:perf（照 bench-perf-split 先例；断言与阈值不改，功能断言留在日常 check）
## 1. 摘要（3–6 行）
- 两条 1 MiB fake-indexeddb 读 / 写计时用例原样迁至 `storage.performance.test.ts`；名称、`performance.now()` 与 `<50 ms` 断言未改。
- `storage.test.ts` 留下 1 MiB 存储结果、读回快照的字节数一致断言；日常 `pnpm test` 不再收集两条计时用例。
## 2. 产出（文件、行数、主要章节）
- 新增性能文件 66 行；同步 `storage.test.ts`、`package.json` 两脚本、`tools/perf/README.md` 与 `CLAUDE.md` 性能规则。
## 3. 关键结论与数值
- `pnpm test` 163 文件 / 1189 项通过且性能文件匹配 0；`check:perf` 启动 loadavg 46.91/37.90/33.67、12 CPU，4 文件 / 8 项通过。
## 4. 开放问题（附默认值）
- 无；默认继续低负载独立运行，高负载失败不跳过、不放宽。
## 5. 对基准的修改提案（编号 / 提案 / 理由）：无
## 6. 需同步到其他文档（文档 / 位置 / 改什么）：无
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 安装、lint、typecheck、日常测试、size、严格 ID 与 `check:perf` 通过；⚠️ 完整 `pnpm check` 仅因沙箱禁止 tsx IPC 在 `content:validate` 报 `listen EPERM`，未改 shim。

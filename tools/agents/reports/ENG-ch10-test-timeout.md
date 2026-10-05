# ENG-ch10-test-timeout 报告 · 游戏工程 · 小修：item-content 的 ch10 真产物集成用例写固定超时 60 秒（低负载单跑 3 次 2.6–3.1 s 全过，负载 35–40 下超 15 s；照 waitfor / role-slot 先例，断言不动）
## 1. 摘要（3–6 行）
- `loads the real compiled ch10 DTO and creates the preview session` 固定超时由 15 秒改为 60 秒，并注明真实 ch10 产物在高宿主负载下偏重。<br>- 断言、全局配置与性能门均未改；同文件其余 5 条仅用 `fixtureItemPack` 内存夹具，不是同类真实产物构建，未加超时。<br>- 定点、game 全测、严格 ID、构建及体积门通过。
## 2. 产出（文件、行数、主要章节） — `apps/game/src/runtime/item-content.test.ts` 150 行（目标注释与 `60_000`）；本报告 10 行。
## 3. 关键结论与数值 — 12 核本机定点 3/3：2.901/3.052/3.246 秒；各轮边界 1 分钟 loadavg 8.13–12.74。
## 4. 开放问题（附默认值） — 无；默认该功能集成用例不作为性能门。
## 5. 对基准的修改提案（编号 / 提案 / 理由） — 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么） — 无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 冻结安装；game 42/171；strict ID 新增失败 0；构建/体积门通过。⚠️ `pnpm check` 的 lint/typecheck/175 文件 1253 用例通过，随后 `content:validate` 被沙箱 `tsx listen EPERM` 阻断；未改 `node_modules`，交沙箱外复验。

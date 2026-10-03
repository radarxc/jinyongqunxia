# ENG-18d-items-leaf 报告 · 游戏工程 · 物品数据移出 entry 闭包：物品成为内容包独立叶片，core Worker 启动时按需加载规则，文本只在展示时读（体积门禁不放宽）

## 1. 摘要（3–6 行）

- 物品已从 `virtual:tianshu-content` 移出，规则与 `text.desc/lore/short` 分为可分页的独立内容叶片；名称留在规则侧供未载入文本时展示。
- Worker、主线程回退、新游戏及读档/跨章校验统一经 `ContentSource` 验证 manifest、hash 与规则叶片，失败不替换活动会话，也不回退空表。
- 物品详情首次读取时才由主线程加载文本；加载前显示名称与“正文载入中……”，成功后缓存并发布投影更新。
- 889 件目录实测 entry 123.08 KiB、webgl total 286.11 KiB，均未放宽预算；完整 `pnpm check` 恢复全绿。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 变更 | 主要内容 |
|---|---:|---|
| `packages/data/src/build/{field-registry,pipeline}.ts` | +16 / −3 | 物品规则/文本独立 partition，沿用 256 KiB 顺序分页 |
| `packages/data/src/{content-loader,item-content}.ts`、`package.json` | +63 / −9 | 选择性叶片读取、全 hash 域校验、无文本规则 schema 边界与导出 |
| `apps/game/build/content-plugin.ts`、类型/适配器/selector | +36 / −19 | 虚拟模块去除 items；占位与文本缓存投影 |
| `apps/game/src/runtime/item-content.ts` | 90 行（新增） | Fetch source、规则装载、文本一次加载/失败可重试、错误码 |
| `apps/game/src/{core-host,core-worker,runtime/session}.ts` | +129 / −13 | Worker/回退统一启动，按章缓存，读档与新游戏原子换会话 |
| data/game 测试与夹具 | +229 / −6 | 889 分页、hash 拒绝、缓存、跨章、原子失败与 state hash 对拍 |

## 3. 关键结论与数值

- 889 件规模每章物品清单（manifest 的 level-9 gzip）：`common.rules.items.p000.json` 261,828 / 27,474 B，`p001` 188,784 / 22,786 B，`common.text.zh-Hans.items.json` 118,148 / 33,632 B（原始 / gzip）。最大规则片距 `256 × 1024 = 262,144 B` 上限尚余 316 B。
- 恢复后的 361 文件基线：规则 195,237 / 21,095 B，文本 115,639 / 31,894 B；`content/` 已恢复，临时 889 文件未提交。
- 889 实测：entry `123.08 / 170 KiB` PASS；webgl total `286.11 / 350 KiB` PASS。
- 规范 state hash 对拍：inline = leaf = `6e36c9755de1c95a99eb12293beda3dfc6a681f25f2c1320b2673a5f26756156`。
- `contentHash` 算法未改，只纳入规则叶片；文本仍只进入 locale `textHash`。15 个真实章节包均通过选择性加载校验，每章解析 367 条当前规则。
- 恢复错误：`ITEM_RULES_UNAVAILABLE:<cause>`；文本错误：`ITEM_TEXT_UNAVAILABLE:<cause>`；叶片篡改根因：`CHAPTER_PACK_LEAF_HASH_MISMATCH:<logicalName>`。
- 技术核实（访问 2026-10-02）：[MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)、[MDN SubtleCrypto.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)、[Vite publicDir](https://vite.dev/config/shared-options)；无价格/服务限额或新增依赖。

## 4. 开放问题（附默认值）

- 实际“初眠切章”协议尚未由 ENG-17 接入；默认在目标章节确定后先走本任务 `validate`/`contentFor(targetChapter)`，装载成功才原子替换会话。
- 离线预缓存归 ENG-23a；默认本任务只发布 `/content/`，不修改 Service Worker。
- 既有 `worker-smoke.mjs` 在 Node 中未启动 HTTP 服务，会得到预期的 `ITEM_RULES_UNAVAILABLE:fetch failed`；默认以浏览器 build、15 章文件源校验和注入式 Worker 边界测试为验收，脚本改造另案处理。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵守既有 hash、解析边界和体积预算。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/04-data-pipeline.md` §8.1：登记 resident 逻辑名 `common.rules.items[.pNNN].json` 与 `common.text.<locale>.items[.pNNN].json`；同名分页按 code-point 稳定顺序列入 manifest。
- `docs/tech/04-data-pipeline.md` §8.2–§8.3：补充 item 名称随规则供占位展示，`desc/lore/short` 仅主线程展示时读取；分页规则叶片进入 `contentHash`，文本叶片不进入。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ `pnpm install --frozen-lockfile`、`pnpm content:build`（392 objects / 15 chapters）、`pnpm content:validate`（395/395）通过。
- ✅ `pnpm --filter @tianshu/data test` 93/93；`pnpm --filter ./apps/game test` 70/70；game build 通过。
- ✅ 最终 `pnpm check`：119 文件、818 测试；entry/render/webgl 全 PASS；未改 `tools/perf/**` 或阈值。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过（仅既有基线未定义项，新失败 0）；`git diff --check` 通过。
- ✅ 真实 889 文件做过 build/size 后已恢复 361 文件；当前变更全部位于允许写集。
- ✅ ENG-17 交接：复用 `createLoadedGameSession` 的按章入口；规则失败码如上，预载失败不得改变活动会话。
- ✅ ENG-23a 交接：预缓存 `/content/<chapter>/manifest.json` 及 manifest 中规则叶片；文本叶片可延迟，增量比较逻辑名 + leaf hash。
- ✅ TOOL-items-catalog 交接：重新生成后跑 build/validate/data+game tests/size，检查每片 raw ≤262,144 B、manifest hash 与 889 体积门禁；不得把 items 再内联。
- ⚠️ Node smoke 的无 HTTP 服务限制已如实登记；不影响规定的八项检查与浏览器发布路径。

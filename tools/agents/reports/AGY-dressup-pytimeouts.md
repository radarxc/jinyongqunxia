# AGY-dressup-pytimeouts 报告 · 3D 纸娃娃换装 · dressup-assets 调 Python 用例超时改 300 s（负载误报）
## 1. 摘要（3–6 行）
为缓解高负载环境下 Python 脚本的超时误报，将 `dressup-assets.test.ts` 中的超时从 `120_000` 放宽至 `300_000`。
此外，专门为 "uses strict nearest triangles for signed distance and the minus 1 mm gate" 用例补充了 300 s 超时。
未修改任何断言逻辑与门禁阈值，修改后本地 `pnpm check` 和测试用例均通过。

## 2. 产出（文件、行数、主要章节）
- `apps/game/build/dressup-assets.test.ts`（约 16 处修改，均是将 `120_000` 改为 `300_000` 或补充超时参数）。
检查：Vitest 和 `pnpm check` 成功（耗时约 1m，所有用例通过）。

## 3. 关键结论与数值
无。

## 4. 开放问题（附默认值）
无。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
无。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
✅ 所有 120_000 改为 300_000；"uses strict nearest triangles..." 用例加 }, 300_000);。
✅ 不改其他字符、不改其他文件；运行通过验收命令。

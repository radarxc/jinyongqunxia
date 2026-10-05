# ENG-size-render-measure 报告 · 工具 · 小修：check_size 按清单定位 render 块并量静态闭包（修 render-host 前缀误配，generic-model 后 render 误量为 2.36）；新增战斗 3D 懒加载块预算 render-model3d 24 KiB；原有门值不放宽
## 1. 摘要（3–6 行）
- `check_size` 改按 Vite 清单的源模块、动态导入边或精确块名定位，不再扫描文件名前缀。
- render 改量静态 import 闭包并扣 entry 已计文件；新增 `render-model3d` 24 KiB gzip 硬门。
- 夹具覆盖 render-host 哈希排序、静态 rig 闭包、3D 超限及未产出；原有门值均未改。
## 2. 产出（文件、行数、主要章节）
- `check_size.mjs` 304 行；`check_size.test.mjs` 239 行；`budgets.json` 19 行；`README.md` 24 行。
## 3. 关键结论与数值
- 实测 KiB gzip：entry 38.42；render 闭包 179.42；webgl total 217.83；render-model3d 17.25；首次会话 97.16。
- 24 KiB = 实测 17.25 + 6.75 KiB（约 39% 余量）；entry 170、render 180、webgl 350、session 110 等原门值不放宽。
## 4. 开放问题（附默认值）
- 无；默认缺少目标块时继续显示 `not emitted`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；只修门禁测量并补登记。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/03-mobile-performance.md` / 战斗 3D / 后续登记 24 KiB 懒块预算。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ frozen install；专项 13/13；`pnpm size`、严格 ID、格式和 diff 检查通过。
- ✅ 真正 render 与 render-host 排序无关；rig 计入；3D 超 24 会阻断；写集与原门值合规。
- ⚠️ `pnpm check`：既有写集外 `BattleField.test.ts` 失败（协调日志两次同错，其余 1253 通过）；`content:validate` 另受已知沙箱 `tsx listen EPERM` 阻断；均未越权绕过。

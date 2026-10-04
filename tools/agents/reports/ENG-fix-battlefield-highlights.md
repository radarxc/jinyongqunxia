# ENG-fix-battlefield-highlights 报告 · 游戏工程 · 小修：集成分支红——16e 与 generic-model 合并后 BattleField 可达高亮用例失败（setHighlights 0 次）；查清 2D / 3D 两路高亮下发，修代码或用例，不删断言
## 1. 摘要（3–6 行）
根因是 16e 的 renderer mock 漏掉 generic-model 新增的 `projectUnit`，`sync()` 在高亮前抛错；第二例因增量包 `units=[]` 而碰巧通过。补齐类型完整 mock；生产同步先下发高亮，再逐单位投影，失败回退格心，双投影均失败只隐藏该标签。
## 2. 产出（文件、行数、主要章节）
`BattleField.vue` 25+/8-；`BattleField.test.ts` 更新 mock 并新增隔离回归；`scene.test.ts` 新增 2D/3D 投影测试；本报告。
## 3. 关键结论与数值
高亮、路径、落点、选中均统一经 `setHighlights` 写地形纹理；2D 标签取格心，3D 标签取模型实时位置。
## 4. 开放问题（附默认值）
无；默认保留逐单位格心回退。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
✅ 不删断言；新增全量单位、2D/3D 分流及投影/同步失败后高亮、路径、落点、预览覆盖；并核过 BattleActions/BattleResult/BattlePage，无同类 mock。✅ app 171、总测 1253、size、install、ID strict；⚠️ `pnpm check` 仅卡规定的 `content:validate` tsx socket EPERM，其前步骤均通过。

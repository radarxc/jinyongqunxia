# ENG-buildgen-r7-special 报告 · 城镇 3D 古建 · 特殊建筑配方（密檐塔、八角塔、城墙、城门）

## 1. 摘要（3–6 行）

- 四个注册配方已替换桩；无 Three import、无新增依赖、仅改写集。
- 本轮按审核补实几何证据：运行时墙厚、闭环带门、16 檐识别、SAT 门洞与真实接口边。
- `pnpm check` 退出 0；既有 localhost 探测、缺素材与 chunk 警告不影响门禁。

## 2. 产出（文件、行数、主要章节）

- 配方：`pagoda-dense.ts` 226、`pagoda-oct.ts` 117、`citywall.ts` 244、`gate.ts` 315 行；测试 `special.test.ts` 577 行。
- `pnpm install --frozen-lockfile` 通过（669 ms）；buildgen 21 文件/251 测试通过（2.83 s）；render typecheck 通过。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：274 文件/2315 测试、内容 1793 文件/1720 对象、size 全 PASS。

## 3. 关键结论与数值

- 与 spec 一致：密檐塔实测 30.000 m、16 檐、起翘 80 mm；收分曲线结点 bp 为 10000→10600@0.7H→6200，0.7H 后逐 bp 单调不增；三角 LOD0/1 = 1182/1134。
- 与 spec 一致：八角塔实测 16.000 m、10 层；三角 880/848。
- 与 spec 一致：城墙 h/top/batter = 6000/4000/1667；无门直墙每 10 m 为 72/72 三角，低于 300/150；垛心距 1800 mm；闭合七边形带非首段门时在门洞切环，首点无端盖/开放边。
- 与运行时契约一致：顶宽严格取 `wall.thicknessMm`；2800 mm 反例实测底宽 4800.4 mm，而非套件 4000 mm 顶宽推得的 6000.4 mm。
- 与 spec 一致：城门洞顶/底宽 × 高 = 4500/4900 × 5200 mm，SAT 实测洞内 0 三角；三角 LOD0/1 = 1450/962；shell/roof 接口边逐边配对最大缝 0 mm。
- 偏离处：无已知规格偏离；城墙 LOD1 仍为 72/10 m，已低于 150，未为降面制造另一套拓扑。

## 4. 开放问题（附默认值）

- r9 当前 `three/walls.ts` 绕过配方；默认后续改为调用 `writeCityWall(wall,unit,kit,lod,sink)`，本任务受写集限制未接线。
- 闸门 A 默认沿用套件 30 m/16 m、城墙 6 m；作者可只改 YAML 参数。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `packages/render/src/buildgen/three/walls.ts` / `generateWallCells`：接 `writeCityWall`，删除临时 `addWallBox`，并保持城墙不参与剖切。
- 城镇编译器 / gate 与 Exit：城门洞中心、宽度须与 `Exit` 位置/通行宽对应。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 塔高/檐数/收分/起翘/预算、八角层数与高度均由 YAML 驱动并数值断言；地标顶点保留同一单元号供 r9 拾取/透视。
- ✅ 城墙断门、运行时厚度、闭环带非首段门、垛距、斜接与预算；⚠️ r9 需接 `writeCityWall`、保留地标单元号，城墙不进剖切。
- ✅ 城门洞 4500×5200 以上；INV-3 同款 SAT（含跨洞大三角反例）证实洞内 0 三角；接口边实测 0 mm；编译器需按 §6 对齐 `Exit`。
- ✅ 同输入 hash 稳定；无 skip/todo、Three import、随机 API、依赖变更；四条规定命令亲自通过。
- ✅ 闸门 A 请作者最终确认：30 m 主塔、16 m 小塔、6 m 墙、4 m 顶宽、4500×5200 门洞。

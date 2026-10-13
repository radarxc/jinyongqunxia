# ENG-buildgen-p3-compound 报告 · 城镇 3D 古建 · 院落规划 planCompound（院落、衙门、王府、庄园、镖局、寺院、西域院落）
## 1. 摘要（3–6 行）
- 已用纯整数实现 `planCompound`；`planBuilding` 的 compound 公共默认路径无条件分派真院落。
- 七类布局模块覆盖宅院、衙门、王府/宫苑、庄园、镖局、寺院、西域客栈/院落；现有 `biaoju`、`palace`、`xiyu_*` 别名一并兼容。
- 21 条专属测试通过；14 个试点×四入口边共 56 方案确定、≤9 部件、门外 BFS 可达。
- 本轮审核点均已返修；全量仍被写集外 p2 单盒/pending/700 B 旧断言阻断，未留生产兼容开关。
## 2. 产出（文件、行数、主要章节）
- `plan-compound.ts` 330 行；`compound/{index,parts,residence,yamen,wangfu,manor,escort,temple,xiyu}.ts` 557 行；测试 480 行；`plan-hall.ts` 仅移除旧盒子并改分派；本报告。
- `pnpm install --frozen-lockfile`：通过，641 ms，锁文件无变化；data typecheck 退出 0。
- 专属 Vitest：1 文件 / 21 用例通过，1.15 s；town-plan：10 文件 / 218 通过，旧 p2 文件 2 失败。
- `TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：失败于 test；272/274 文件、2322/2325 用例通过，111.28 s。
- 全量另有无关 `scene-allocation` 探针 1 失败；lint/typecheck 通过，因 test 失败未进入 content/size。
## 3. 关键结论与数值
| 布局 | 部件（最多） | 决定 |
|---|---:|---|
| hall_wing_gate | 7 | 墙、门楼、正房、1–2 厢房、院、可选照壁 |
| yamen | 8 | 大门→1600 洞仪门→大堂；大堂绑定 office/公堂与斗拱 |
| wangfu/palace | 9 | 门楼、二门、前后两院、正殿、两厢、照壁 |
| manor | 8 | 宅院 + 独立廊带 |
| escort/biaoju | 8 | 前厅、前后两院；右厢以 stable flag/facility 标马厩 |
| temple | 5 | 山门、大殿（强制 hall 尺寸档 + 斗拱）、院、照壁 |
| xiyu_inn/court | 6–9 | 土坯 flags、前廊、葡萄架；窄向占地降为无厢房 |
- 门楼净洞 `1600×2400 mm`；院墙厚/高取 `walls.enclosure.t/h`；大理院深≥5m 含 10×8 东西门均有照壁双侧通路。
- 房门净宽编码为 `floor(flags/256)`，低 8 位为语义；门向即 PartTuple yaw，门楼常量由 `compound/index.ts` 公开。
- 原朝向试点（部件/可达格/JSON B）：大理 `0004 9/103/1414`、`0007 8/53/1161`、`0027 7/25/1057`、`0028 7/25/1053`、`0033 8/71/1274`、`0035 7/25/1057`；城十 `0001 7/26/1057`。
- 吐鲁番：`0003 6/22/742`、`0004 6/24/742`、`0005 6/23/742`、`0006 7/45/1000`、`0029 6/21/742`、`0030 6/22/742`、`0031 6/24/742`。
- 一致处：`RectMm` 世界半开、x东/z南；每房调用 i1，floorY 与部件平台一致；默认/empty planner 都不切回单盒；同输入逐字节相同。
- 偏离处：无。窄向（局部内宽或深<9m）西域院落按可用宽深降为无厢房，仍保留土坯墙、前廊、葡萄架与可进正房。
## 4. 开放问题（附默认值）
- 默认：`flags` 低 8 位：bit0 可进、1 压顶、2 斗拱、3 土坯、4 门洞、5 前廊、6 马厩、7 二门；高位 `doorWidthMm×256`。
- 默认：i2 尚未提供 office/escort/stable/temple 家具时只补确定性站位；模板到位后同 `InteriorPlanner` 缝替换。
- 门楼洞高不在 `EntranceTuple`；默认由公开 `GATE_CLEAR_HEIGHT_MM=2400` 交 r6 消费。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- P3-01 / 迁移 p2 的 `PLAN_COMPOUND_PENDING` 单盒与 compound 700 B 测试 / 生产 API 已按 p3 完成，旧断言阻断门禁。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `plan-hall.test.ts` / p2 recipe dispatch、pilot helper / 删除 pending/单盒/compound 700 B 断言，改验 `parts` 真院落。
- r6 / compound mesher / tuple 按 kind/cx/cz/w/d/yaw/storeys/roof/eave/ridge/platform/flags 出几何；Enclosure bit1 出压顶与世界立面位；房门宽用 `partDoorWidthMm`。
- p4 / invariants / 检查 enclosure 包含关系、非 enclosure 不重叠、≤12、门楼边、房门向院与 BFS。
- 编译器 / building 层 / Enclosure/Yard/Hall/Wing 均归同一 building；院子焦点态 1，进入具体 Hall/Wing 态 2。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 仅写声明路径；无依赖、lock、content、schema、node_modules 修改；`git diff --check` 通过。
- ✅ PartTuple 占地内、非 enclosure 不重叠、≤12；门楼边/横向偏移、房门向院、北门正房坐北朝南均有几何断言。
- ✅ 4 合成尺寸×4 边、14 试点×4 边、7 布局、10×8 东西门照壁、确定性与纯整数均为命名断言。
- ✅ 从 `entranceCell` 外部格中心加门洞连接面跑 i1 BFS，到院子与每房站位；二门 floors 只留 1600 洞。
- ✅ r6/p4/编译器交接见 §3/§6；每房门宽公开可解码，每部件内 floorY 唯一且等于平台。
- ⚠️ install、专属 21 测试、data typecheck、diff check 通过；指定 town-plan/check 因写集外旧 p2 断言失败，check 另有无关分配探针失败。

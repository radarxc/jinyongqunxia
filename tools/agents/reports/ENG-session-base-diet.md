# ENG-session-base-diet 报告 · 游戏工程 · 首次会话基础内容瘦身：worldMaps / assets / 章节 NPC 改按章节懒加载叶片；素材键不依赖文件在不在（稀疏与全量口径一致），目标首次会话闭包 ≤ 80 KiB
## 1. 摘要（3–6 行）
基础虚拟内容只携带 topology、factions、skills（另保留空 `npcs` 兼容字段）；地图、章节 NPC 与素材键随当前章节加载。
当前挪基点后首次闭包为 88.52 KiB：110 KiB 正式门禁通过，但因上游会话静态闭包增长，未达到额外的 ≤80 KiB 目标。
素材 DTO 只由非 rejected manifest 行决定；源文件仅影响复制，缺图告警并跳过；稀疏工作区与当前 `_prod` 均为 669 键且序列化 SHA-256 相同。
本轮仅解 7 个挪基点冲突：保留章节懒加载，同时保留离线素材引用登记、事件解析与 60 秒集成测试超时。
## 2. 产出（文件、行数、主要章节）
- `apps/game/build/asset-manifest{,.test}.ts`、`content-plugin{,.test}.ts`：4 文件、426 行；manifest/复制解耦、素材/地图正文分章叶片、离线闭包登记。
- `apps/game/src/core-host.ts`、`src/runtime/**`、`src/selectors/characters.ts`：13 文件、1990 行；章节装载、事件/NPC/地图解析、缓存、恢复与测试。
- 本报告；未修改预算脚本、内容数据、素材或 core。
## 3. 关键结论与数值
| 基础顶层键（gzip KiB） | 改前全量检出 | 改后基础 | 改后归属 |
|---|---:|---:|---|
| worldMaps | 12.53 | 0 | 章节内容包 |
| assets | 6.71 | 0 | 素材叶片 |
| npcs | 1.34 | 0.03（空数组） | 章节内容包 |
| topology | 2.27 | 2.28 | 基础 |
| factions | 1.34 | 1.35 | 基础 |
| skills | 1.25 | 2.85 | 基础 |
| base content 合计 | 25.69 | 6.84 | 首次闭包 |
- 首次闭包：改前 2.33 + 65.33 + 25.69 = 93.36；当前 2.43 + 79.25 + 6.84 = 88.52 KiB；110 门禁 PASS，超额外 80 目标 8.52 KiB。
- 子系统增量：对话 35.43、区域 37.52、战斗 68.48、城镇 75.81 KiB（只报告，未设门）。
- 章节叶片：shared 152 素材键；ch00–ch14 各 3–51 键，总计 669；ch01–ch14 各 616 地图正文键；叶片 DTO gzip 0.14–5.34 KiB（ch10 4.50）。
- 章节键数：ch00…ch14 = 3/51/46/33/51/42/32/48/42/28/22/21/40/38/20。
- 会话创建、章节切换、restore、引用修复时取章节 rules（定义/NPC/地图）及 shared+章节素材/地图正文；失败为 `CHAPTER_CONTENT_SUBSYSTEM_UNAVAILABLE` / `CHAPTER_ASSETS_SUBSYSTEM_UNAVAILABLE`，可重试。
- DTO 契约：NPC 解同章文本；地图正文键由 `splitContentEntry` 生成并随章节动态模块加载，四类显示字段缺键即失败；真实 ch10 断言“白马啸西风 / 大理府 / 尚无区域强度配置 / 城门进入…”。
- 一致性：缺失/存在/rejected 夹具覆盖复制行为；当前稀疏工作区与 `_prod` 均为 669 键、SHA-256 `4e9bc25d…fbba3`；文件缺失只影响复制与告警。
- 挪基点解冲突：`asset-manifest.ts`/`content-plugin.ts` 合并 copied/引用登记与 groupedAssets；`content-plugin.test.ts` 保留 60 秒；`content.ts`/`item-content.ts`/`item-content.test.ts`/`test-fixture.ts` 合并 EventDef 事件与 NPC、地图、正文叶片。
## 4. 开放问题（附默认值）
1. ch00 内容包暂无正式 NPC/时代地图定义；默认返回空集合、不在工程层伪造，待内容归属方补叶片。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无；本任务只改变装载边界与构建口径。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `content/chapters/ch00_yuenv`、ch00 world 归属数据：补正式 NPC 与时代地图叶片，使序章获得非空章节内容。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`；锁文件无变化。
- ✅ 游戏测试 35 文件/133 用例；全仓测试 159 文件/1158 用例，含 100 次 hash、golden/M1、真实 ch10 演示和失败后重试。
- ⚠️ `pnpm size`：88.52/110 KiB PASS、开发分块 PASS（assets=590、manifest=85），但当前基点未达额外 ≤80 KiB 目标。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure count 0；`git diff --check` 通过，改动均在授权路径。
- ⚠️ `pnpm check` 的 lint/typecheck/1158 tests 通过，随后 `tsx` 因沙箱 IPC `listen EPERM` 停止；等价 `node --import tsx ...` 校验通过（1176 文件、1110 对象、2 Ink、62 地图），独立 `pnpm size` 通过。
- ✅ 下游接口/验证：章节内容同时暴露 EventDef、GameNpcDef、WorldMapRuntimeDefinition；真实 ch10、M1 100 次 hash、restore/retry、35/133 游戏测试及离线闭包全仓测试通过。

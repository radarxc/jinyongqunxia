# ENG-town2-chunks 报告 · 城镇探索 v2 · 分块与预算（区域 / 城镇 / 古建 / 人物 / meshopt 懒块与预算、perf 按文件名注册、新素材目录进包、类型契约测试）

## 1. 摘要（3–6 行）

- 城镇 render 族已在 three / render 总规则前拆为 6 个预算块，主 `render` 静态闭包有反向依赖断言。
- core explore/shop 与 buildgen Worker 改按入口完整静态闭包计；session 对 `world/explore/**`、`economy/shop-*` 零例外。
- 新素材兼容数组清单与 `buildkit-layers.v1`，perf 按文件名注册，类型契约含 `keyof` 精确相等。
- 三条必跑命令均退出 0；全量 `pnpm check` 为 241 文件 / 2007 用例，全部尺寸门 PASS。

## 2. 产出（文件、行数、主要章节）

- 新增 `town-chunks{,.test}.ts`（51 行）、`town-assets{,.test}.ts`（260 行）、`size-groups-plugin.test.ts`（127 行）。
- 修改 Vite / size group：城镇懒块、app/Worker 构建图清单、UI 与完整 core/Worker 静态闭包。
- 修改 perf 预算、门禁、测试与 README；新增 9 个尺寸项、探索路由、session/render 禁入断言。
- 修改根/Vitest 测试注册、render exports、`town-contract.test.ts`；未改 content-plugin / asset-manifest。
- `pnpm install --frozen-lockfile` 退出 0；定向 Vitest 9 文件 / 94 例退出 0。
- `pnpm check` 退出 0：241 文件 / 2007 例，1777 个内容文件有效，尺寸门全绿。

## 3. 关键结论与数值

| KiB gzip | 拆分前 | 当前实测 / 预算 |
| --- | ---: | ---: |
| render | 172.83 | 151.86 / 170 |
| render-explore / town-legacy | 并入 render | 10.06 / 32；7.60 / 14 |
| buildgen / Worker / actor3d / meshopt | 无独立产物 | 0 / 40；0 / 24；0 / 16；0 / 8 |
| explore-ui / core-explore / core-shop | 未注册 | 12.92 / 45；0.33 / 24；3.82 / 8 |
| session | 既有门 | 99.90 / 110 |
| webglExploreRoute | 未注册 | 240.46 / 420 |

- 与文档一致：`render` 实测 ≤168，故由 180 收紧到 170；session 对两类禁入模块零例外。
- 完整闭包门证明入口小不能绕门：explore / Worker 测试均以小入口 + 超限依赖块触发 FAIL。
- 新基点已切断 explore 对旧 region/story 链的静态引用；完整闭包实测由旧基点 142.30 降至 0.33 KiB。
- 偏离提示词快照：实际 6 个 perf 文件，兼容历史裸 `performance.test.ts`，新文件仍用 `<name>.performance.test.ts`。

## 4. 开放问题（附默认值）

- buildgen Worker、actor3d、meshopt 尚无运行时引用；默认后续按既定目录动态 import，门禁自动从 0 转实测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/15` §10：perf 现状为 6 文件；历史裸名兼容，新增门统一 `<name>.performance.test.ts`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 六类分块、Windows 路径、Worker 优先级、Three 主体隔离有测试；render 门收紧，既有门未放宽。
- ✅ core / Worker 完整静态闭包计费；session 零例外；render 禁入、UI、route、超限依赖均有失败用例。
- ✅ 数组清单及真实 buildkit 对象均受 manifest 状态筛选；只复制 `layers[]` / `strips[]` 声明文件，不复制 rejected、未登记文件或 manifest；PWA 仍按需。
- ✅ `keyof` 精确相等；plan 双向、wall 为 data → render 单向、kit 单向，ROOF_STYLE 名值逐项一致。
- ✅ perf 以文件名自动收集 6 文件并从普通项目排除；新门命名约定已记录。
- ✅ 必跑 install、定向 9 文件 / 94 例、全量 241 文件 / 2007 例及独立尺寸门均退出 0。
- ✅ 后续目录：region→render-explore，town→render-town-legacy，buildgen→render-buildgen（Worker 独立），actor3d→render-actor3d，MeshoptDecoder→render-meshopt。
- ✅ 后续 buildkit 与 `model3d/<id>/town` 文件须登记就近 manifest，且 `status` 不得为 rejected。

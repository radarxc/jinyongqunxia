# ENG-00-scaffold 报告 · 游戏工程 · 工程脚手架（pnpm workspace、包边界、pnpm check）

## 1. 摘要（3–6 行）

已建立 Node 22 / pnpm 9 的 Vue 3.5 + Vite 8 workspace，并提交可冻结复现的锁文件。
六个源码直连包、`apps/game` PWA、`services/api` 占位与规范 `content/` 空目录均已落盘。
Core 可由 Comlink Worker 推进 1 tick，Worker 创建失败时回退主线程；Three 场景按需加载。
`pnpm check` 已串联 lint、typecheck、24 个单测、内容校验、生产构建与 gzip 预算，全部通过。

## 2. 产出（文件、行数、主要章节）

| 范围                   | 文件 / 行数 | 主要产出                                                                                          |
| ---------------------- | ----------: | ------------------------------------------------------------------------------------------------- |
| 根配置                 |  13 / 6,618 | workspace/catalog、锁文件、strict TS references、ESLint flat、Vitest projects、Prettier、协作约定 |
| `packages/shared`      |     8 / 183 | 品牌 ID、整数/bp、Unicode code-point 规范 JSON                                                    |
| `packages/data`        |     8 / 191 | Zod manifest schema、轻量书界包加载器、内容校验入口                                               |
| `packages/core`        |    29 / 332 | §2.1 全目录、统一根导出、Core/状态/命令/事件、五流 sfc32                                          |
| `packages/platform`    |    10 / 114 | 存储/输入/音频端口、Comlink Worker 与主线程 CoreHost                                              |
| `packages/render`      |     6 / 144 | Three WebGL 占位场景、帧时间/draw-call 统计                                                       |
| `packages/ui`          |    10 / 254 | Vue 根组件、Pinia `shallowRef` 投影、`uiBus`、`TxPanel/TxButton`                                  |
| `apps/game`            |    13 / 283 | 标题画面、Worker tick、懒加载 Three、PWA、manual chunks                                           |
| `content` / API / perf |    35 / 290 | tech/04 §2.1 可追踪空目录、API README、预算与 manifest gzip 检查器                                |

目录树：`packages/{shared,data,core,platform,render,ui}`、`apps/game`、`services/api`、`content/{.schema,_drafts,common,world,chapters,locales,assets,tiled,vfx,migrations}`、`tools/perf`。`services/api` 按任务约束仅建 README。

## 3. 关键结论与数值

- 包职责：shared 基础值；data 内容契约；core 确定性规则；platform 浏览器端口；render Three 表现；ui Vue 投影；game 装配发布；api 后续私有服务占位。
- 依赖方向由 `eslint-plugin-boundaries` 与逐包 `no-restricted-imports` 双层阻断；临时非法 `data → core` 别名/相对导入探针均按预期失败后已删除。
- 版本（npm registry，2026-10-01）：Three 0.186.1、Vue 3.5.43、Pinia 4.0.3、Vite 8.3.1、plugin-vue 6.0.9、Vitest 5.0.3、Zod 4.6.5、Comlink 4.4.2。
- 工具：TypeScript 6.0.3、vue-tsc 3.3.11、ESLint 9.39.5、typescript-eslint 8.71.0、eslint-plugin-vue 10.11.1、boundaries 7.2.0、Prettier 3.9.9、happy-dom 20.14.5。TS 7.0.2 虽为 npm 最新，但因 typescript-eslint `<6.1` 兼容界及 tech/01 锁定值采用 6.0.3。
- 当前 gzip：entry（含 core Worker）33.57 / 170 KiB；render 126.87 / 180；WebGL 合计 160.44 / 350。WebGPU 300、Basis 255、devtools 130、书界 1536 KiB 均已设门禁，当前未产出。
- `pnpm check` 摘要：lint 0 告警；typecheck 通过；8 文件 24 测试通过；内容校验 0 个现有 JSON；Vite 77 模块构建成功；全部已产出预算 PASS。
- 浏览器兼容：MDN 将 `requestIdleCallback` 标为非 Baseline，故 PWA 注册保留 `setTimeout` 回退；本任务不使用收费 API，无价格/额度项。

### 参考资料（访问日期：2026-10-01）

- npm registry：[`three`](https://registry.npmjs.org/three/latest)、[`vue`](https://registry.npmjs.org/vue/latest)、[`pinia`](https://registry.npmjs.org/pinia/latest)、[`vite`](https://registry.npmjs.org/vite/latest)、[`vitest`](https://registry.npmjs.org/vitest/latest)、[`zod`](https://registry.npmjs.org/zod/latest)、[`comlink`](https://registry.npmjs.org/comlink/latest)。
- 官方 API：[Vite Web Workers](https://vite.dev/guide/features.html#web-workers)、[Vue `shallowRef`](https://vuejs.org/api/reactivity-advanced.html#shallowref)、[vite-plugin-pwa 注册](https://vite-pwa-org.netlify.app/guide/register-service-worker)、[MDN `requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)。

## 4. 开放问题（附默认值）

- O1：真机 FPS / 首屏 / 内存尚未实测；默认维持 WebGL、DPR≤2 与现有预算，后续在作者手机 + 中端 Android + iPad 验证。
- O2：WebGPU、Basis、devtools 与书界数据尚无 chunk；默认显示 `not emitted`，后续一旦产出即由现有命名预算检查。
- O3：`content:validate` 目前仅严格解析生产区 JSON；默认由 ENG-02 扩展为 YAML/Ink/Tiled/Zod 与交叉引用全链校验。
- O4：ESLint 9 已被 npm 标记旧主版本，但任务明确要求 ESLint 9；默认锁 9.39.5，升级需独立联调。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。脚手架落实既定 AR-19、AR-21 与 tech/01/04/05，不新增玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/01-architecture.md` §5.4：后续记录本骨架实测 entry 33.57、render 126.87、WebGL 合计 160.44 KiB gzip；本任务不越权修改。
- `docs/tech/01-architecture.md` §8.2：实现暂按任务要求 ESLint 9.39.5；文档示例的 ESLint 10 留给升级任务统一。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 根脚本齐全；`check = lint + typecheck + test + content:validate + size`；源码直连 exports、锁文件和 workspace catalog 已提交。
- ✅ 每个实际源码包及 game 均有 package/tsconfig/index/test/CLAUDE；API 按指定范围为 README 占位；content 空目录以 `.gitkeep` 可追踪。
- ✅ Core 根入口预导出 §2.1 全部子模块；五条 RNG seed-1 固定向量逐位通过；规范 JSON、ID、bp 与快照隔离有测试。
- ✅ Worker + Comlink / 主线程回退、Pinia 浅投影、UI intent bus、Three 懒加载占位、PWA 构建与 manual chunks 均落地。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm --filter ./apps/game build` 均退出 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：116 文件、66,103 次出现、14,011 定义；新增严格错误 0（保留既有基线 undefined 1）。
- ✅ `git diff --check` 通过；无临时探针或未完成占位语；覆盖率因未设 CI 卡口且执行来源为空，按单测流程跳过。
- ⚠️ Vite 对原始 render chunk 的 500 kB minified 提示仍会显示，但 gzip 126.87 KiB 通过项目 180 KiB 硬预算；真实设备指标仍待 ENG 性能任务实测。
- 后续约定：存储进 `platform/src/storage`，schema 进 `data/src/schemas`，规则进 core 已建子目录，组件进 ui，场景进 render，装配进 game；包内先测，交付前跑 `pnpm check`；热路径零分配，渲染优先实例化/图集。

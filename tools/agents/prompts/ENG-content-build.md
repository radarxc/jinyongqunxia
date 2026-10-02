# 本任务：游戏工程 · 内容编译管线（content:build：规则 / 文本分片、书界包清单与 contentHash、ID / 路径重映射、Ink 编译）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`、`content/CLAUDE.md`、`content/README.md`、`apps/game/CLAUDE.md` 里讲构建的段落；
- 报告 `tools/agents/reports/ENG-00-scaffold.md`、`ENG-05-story-time.md`（Ink bridge）、`ENG-08-worldmap.md`、`ENG-09-town-scene.md`、`ENG-11-vfx.md`（它改过构建插件与素材清单）；
- 序章设计 `docs/design/chapters/00-yuenv.md`、`docs/design/story/00-yuenv.md`，以及报告 `DES-prologue-ch00.md` 第 7 节：序章内容会用这条管线落地，字段分类要覆盖它用到的内容类型。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 数据行，M1 要求"ch00 schema、Tiled、Ink bridge、规则 / 文本分片、remap"；离线行要求"序章闭包"。

下游三件事都靠这条管线：
- 序章内容（CONTENT-ch00）用它落地；
- 书眠与章节切换（ENG-17）按书界包装载、把 `contentHash` 写进存档；
- 离线闭包（ENG-23）按清单预缓存。

本任务做管线本体。Tiled 转换另开任务（ENG-18b），本任务不做。

M1 终点已改为「书眠进入白马（唐）冷入口」（作者 AR-29，见 `docs/tech/09-roadmap.md` §3）。白马书界的冷入口内容等设计任务 DES-baima-tang 合入后由后续任务落地；本任务先用仓库现有内容（ch01 等）和测试夹具验证管线。管线对书界 ID 一视同仁，不为某一书界写特例。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- 构建是 Vite 虚拟模块整包注入：`apps/game/build/content-plugin.ts` 把物品、NPC、武学、地图等 YAML 解析后整体 `export default JSON.stringify(...)`。没有分片、hash 和清单。
- `packages/data/src/content-loader.ts` 有 `loadChapterPack()` 读取器（`manifest.schemaVersion: 1` + `payload`），全仓没有产出端。
- `content/locales/` 只有空目录与 README，`content/migrations/` 只有 README。
- 仓库里没有 `.ink` 文件，也没有 Ink 编译步骤。`packages/core/src/dialogue/index.ts` 的 `InkJsDialogueBridge` 有测试，但没接构建产物。core 依赖 `inkjs@2.4.0`，包内带编译器（`inkjs/full`、`inkjs/compiler/*`）。
- 已有 `pnpm content:validate`：`packages/data/scripts/validate-content.ts` → `loadContent()`。

## 规格（照这些写，不自创）

- `docs/tech/04-data-pipeline.md`：
  - §1.3–§1.4 总流程与产物去向（发布产物不入库）；
  - §2.6 ID 重映射的 8 条规则；§2.7 稳定性分级（路径搬迁用 path-remaps）；
  - §4.1 十个构建阶段（discover → … → emit）；§4.2 文件发现硬规则；
  - §4.3 解析与源位置：YAML 关闭别名；Ink 编译错误规范化成 `Diagnostic`；
  - §4.5 文本与规则字段拆分：字段分类由 schema registry 明示；
  - §5.1 CLI 契约：`pnpm content:build`、`--chapter`、`--locale`、`--emit-refs`，退出码 0 / 1 / 2；
  - §7 Ink：写作约定、`.inkmeta.yaml`、`#ts:` 标签、结构签名 `storyHash`、`DialogueStructureDef` 进 rules；
  - §8.1 分片命名与 `ChapterPackManifest`；
  - §8.2 规范序列化与四个 hash；
  - §8.4 体积门禁：叶片 > 256 KiB 报错，书界 ≥ 1.25 MiB 警告、> 1.5 MiB 报错；
  - §8.5 增量更新：本任务只要求清单可比对，不做下载。
- `docs/tech/05-gameplay-engine.md` §10.3：Ink 桥接、story seed 覆盖、`storyHash`。

## 要做的事

1. **CLI**
   - 根 `package.json` 加 `content:build` 脚本。实现放 `packages/data/scripts/` 与 `packages/data/src/build/`：纯 TS，Node 下跑，不进浏览器 bundle。
   - 复用现有 `loadContent()` 与 schema 做 discover / parse / shape / register / link，补齐 partition / emit。
   - 中间件输出到 `.cache/content-build/`，发布产物输出到 `dist/content/`。两者都不入库，`.gitignore` 要覆盖。
   - 退出码与诊断格式照 §5.1、§4.1；输出按文件 / 行 / 列 / 错误码稳定排序。
2. **规则 / 文本拆分**
   - 在 schema registry 里给 M1 实际用到的内容类型标字段类别 `rule | text | contentRef | assetRef | authoring`。M1 用到的类型：物品、NPC、武学、剧情线、大地图、商店，加上序章设计用到的类型。
   - 分类写在 schema 旁，不按字段名猜。
   - 规则对象用 `textKey` 指向文本。`zh-Hans` 缺 key 报错；繁体缺失时回退并警告。
3. **书界包**
   - 按 §8.1 的逻辑名产出叶片，如 `common.rules.base.json`、`common.text.zh-Hans.json`、`ch01.rules.base.json`、`ch01.text.zh-Hans.base.json`。M1 先按书界 base 分片；区域分片等有了 RegionMap 再拆，报告说明。
   - 单片超 256 KiB 自动切成 `.pNNN` 叶片。
   - `ChapterPackManifest` 用严格 schema。四个 hash 照 §8.2：`leafHash`、`contentHash`、`textHash`、`releaseHash`，preimage 用结构化数组；`contentHash` 的规则闭包包含 common、world、本书界全部 rules、Ink 结构签名和 idRemaps。
   - `loadChapterPack()` 改为读这个清单并校验 hash。Node 与浏览器都用 WebCrypto。
4. **重映射**
   - 新建 `content/migrations/id-remaps.yaml`（`schemaVersion: id-remaps.v1`，空表起步）与 path-remaps 文件。
   - §2.6 第 1–7 条做成构建期校验：`from` 唯一、无环、压平链、`to` 存在、`from` 不再有定义、同命名空间、不表达一对多。
   - 导出纯函数 `fixupContentRefs()`（或等价命名），供存档读取链调用。
   - **存档侧接线不在本任务**：`apps/game/src/storage` 由 ENG-13 / ENG-15 在改。报告给出接线说明。
5. **Ink**
   - 约定 `content/story/**/<storyId>.ink` 配同名 `.inkmeta.yaml`。
   - 构建期用 inkjs 自带的编译器（与 core 同版本 2.4.0，先确认包内路径；不另加第二个 Ink 依赖）编译出 Story JSON，随文本分片发布；抽取 `DialogueStructureDef` 与 `storyHash` 进 rules。
   - `#ts:` 标签按白名单解码：未知 opcode、重复参数、自由 JSON 都失败。编译错误转成 `Diagnostic`。
   - 写一个最小夹具故事，放测试夹具目录，不放进正式 `content/`。在 `apps/game/build/` 的测试里走通：编译 → JSON → core `InkJsDialogueBridge` → 做一次选择。
6. **构建接线**
   - `apps/game/build/` 的 Vite 插件在 `build` 时调用同一管线，把 `dist/content/**` 产物输出到站点 `content/` 路径；开发服务器提供同一路径。
   - 现有虚拟模块 `virtual:tianshu-content` 的导出形状**不变**（运行时改用书界包由 ENG-17 做）。它可以改成从同一份编译 IR 生成。
7. **测试**
   - 两次构建字节相同（L10）。
   - 改一处规则字段：`contentHash` 变、`textHash` 不变；只改显示文本：反过来。
   - 改 Ink 分支：`storyHash` 与 `contentHash` 都变。
   - 叶片切分与体积门禁。
   - remap 七条校验各一个反例。
   - `loadChapterPack()` 遇到篡改的叶片报错。
   - Ink 标签白名单反例。

约束：
- 写集：`packages/data/**`、`apps/game/build/**`、`apps/game/vite.config.ts`、`apps/game/package.json`、`content/migrations/**`、`content/story/**`、`content/CLAUDE.md`、`content/README.md`、`package.json`、`pnpm-lock.yaml`、`.gitignore`。
- **不改**：`packages/core/**`、`apps/game/src/**`（ENG-15 在改）。确实需要改这些才能完成的，在报告里写明需要什么，不要改。
- 分层：data 不做规则结算；构建器、YAML 解析器、Ink 编译器都不进浏览器 bundle。
- 每次写入 ≤ 150 行。尽量不加依赖：Ink 编译只用 inkjs；确需新依赖，在报告说明理由与体积。
- 不改 `content/` 下现有内容数据的含义；字段分类不得改变现有 schema 的校验结果。

性能（AR-21）：增量缓存可以后做，但本机全量构建现有内容 ≤ 10 s，实测值写进报告。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- §4.1 十个阶段的实现对照：做了 / 复用 / 未做；
- 字段分类表；
- 分片清单样例与四个 hash 的实测值；
- remap 校验表；
- Ink 管线与结构签名；
- 体积与构建耗时；
- 交给下游的接口（放哪、怎么测、接口名）：ENG-17（运行时装载书界包、把 `contentHash` 写进 `GameState`）、ENG-18b（Tiled → RegionMap 接入同一 emit）、CONTENT-ch00（ch00 内容的目录与命名约定）、ENG-23（离线预缓存清单）。

报告 ≤ 100 行。

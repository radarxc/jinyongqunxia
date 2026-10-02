# ENG-18-content-build 报告 · 游戏工程 · 内容编译管线（content:build：规则 / 文本分片、书界包清单与 contentHash、ID / 路径重映射、Ink 编译）

## 1. 摘要（3–6 行）

已落地纯 Node/TypeScript `content:build`，复用 `loadContent()` 完成现有 schema 的解析、注册与链接，再做字段拆分、Ink 编译、分片和清单发布。
14 个现有书界均产出 strict manifest、规则/简体文本叶片及四域 hash；`loadChapterPack()` 用 WebCrypto 逐项复验。
ID/path remap、Ink `#ts:` 白名单、Vite build/dev 同路径发布与既有虚拟模块兼容均已接通。
Tiled/RegionMap 仍归 ENG-18b；正式 ch00 / 白马冷入口内容不在本任务伪造。
## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `packages/data/src/build/*.ts` | 1,006 | 发现、字段 registry、Ink、remap、规范 hash、叶片、manifest、管线及测试 |
| `content-loader.ts` / `content-remap.ts` / `schemas/content-pack.ts` | 95 / 17 / 59 | 浏览器安全加载校验、纯引用修复、strict manifest schema |
| `packages/data/scripts/build-content.ts` | 34 | CLI 参数、稳定诊断、退出码 0/1/2 |
| `apps/game/build/` | 104 + 48 + 14 | Vite 接线、Ink→core 选择桥测试及夹具 |
| migrations / README / package wiring | 4 + 25 + 配置差异 | 空 remap v1 表、目录约定、脚本/exports/锁文件/忽略项 |
| 本报告 | ≤100 | 结论、边界、阶段/字段/remap/下游验收 |
## 3. 关键结论与数值

| 项 | 实测结论 |
|---|---|
| 全量构建 | 391 对象、14 书界、99 文件；CLI 1,705.3 ms，墙钟 2.56 s，满足 AR-21 ≤10 s |
| 确定性 | 再构建 1,846.3 ms；99 文件目录摘要均为 `6e2fc0add61b2ab7549ef372e558cec560eaef567259b383a0a63b521d334c99` |
| 白马样例 | leaf `4f53cda1…b945`；content `2a849f8e…95ca`；text `8ae10fa8…d2af`；release `370389b7…c4d1` |
| 体积 | 最大叶片 ch02 rules 259,904 B（253.81 KiB）<256 KiB；最大包 ch02 gzip 110,598 B（108.01 KiB）<1.25 MiB |
| Ink | data 声明 `inkjs/full` 2.4.0 直接依赖以合法调用编译器；锁文件复用 core 同一实例（registry 解包 6,874,026 B），夹具 `storyHash=c0808c34…fbe53`，JSON 经 bridge 完成选择 |
| 引用图 | `--emit-refs` 实测 502 个素材键；index/manifest 可由逻辑名+leaf hash 比对增量 |
版本/API 于 2026-10-02 核对：[inkjs 2.4.0 registry](https://registry.npmjs.org/inkjs/2.4.0)、[MDN SubtleCrypto.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)；无价格或远程限额。
## 4. 开放问题（附默认值）

- O1：RegionMap 尚未落地；默认维持书界 base 分片，ENG-18b 再增加 `rg_*` 叶片。
- O2：正式序章/白马 Ink 尚未入库；默认只保留 build 夹具，CONTENT-ch00 按约定创建正式源。
- O3：运行时下载、Cache 原子切换及存档接线不属本任务；默认继续使用旧虚拟模块，交 ENG-17/23。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；实现遵循 `tech/04` 既定契约，不新增玩法或事实。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 / 同步内容 |
|---|---|
| ENG-17 存档/书眠 | 在 schema 迁移后调用 `fixupContentRefs()`；校验装载成功后写 `GameState.meta.contentHash` |
| ENG-18b / `tech/04` RegionMap | 将 Tiled IR 作为 `BuildLeaf` 接入 `partition`，补 region/load/ownership 与区域叶片测试 |
| CONTENT-ch00 | 新增 quest/encounter/scene schema 后，按 `content/chapters/ch00_yuenv/` 与 `content/story/ch00_yuenv/story_ch00_main.*` 落地 |
| ENG-23 / `tech/06` | 读取 `dist/content/index.json`、manifest 的 `releaseHash` 和 leaves 做离线预缓存与回滚 |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

**`tech/04` §4.1 十阶段：**

| 阶段 | 状态 | 实现对照 |
|---|---|---|
| discover | ✅ 做了 | 稳定遍历、忽略目录、碰撞/后缀/大小门禁 |
| parse | ✅ 复用 | YAML 禁 alias/重复键；JSON/Ink/metadata 解析 |
| normalize | ✅ 做了 | path-remap、归属和规范纯 JSON；不猜未知字段 |
| shape | ✅ 复用 | `loadContent()` 的 strict Zod schema |
| register | ✅ 复用 | 局部/全局 ID 唯一表 |
| link | ✅ 复用 | `loadContent()` 强引用校验；另采集 asset refs |
| lint | ✅ 做了 | locale、remap、Ink、体积和确定性诊断 |
| compile | ✅/⚠️ | Ink JSON/结构签名已做；Tiled/RegionMap 明确交 ENG-18b |
| partition | ✅ 做了 | common/world/chapter/locale；区域片待 RegionMap |
| emit | ✅ 做了 | canonical JSON、自动 pNNN、hash/manifest/index/refs |

**字段分类（写在 schema-side registry，不按名字猜）：**

| 类别 | 处理 | 覆盖类型 |
|---|---|---|
| rule | 保留规则值 | 物品、NPC、武学、商店、剧情线、大地图/书界、城镇、人物模板、经脉/穴位 |
| text | 抽出并以 `{textKey}` 回指 | 名称、别名、描述、地图/城镇显示文案、Ink 台词/选择 |
| contentRef | 规则保留稳定 ID | 技能、物品、NPC、任务/剧情、事件、锚点等 |
| assetRef | 规则保留逻辑键并进入 refs | 物品/城镇素材树 |
| authoring | 发布规则剥离 | canon/source/note/坐标考据 |

**清单实测样例：**`ch10_baima` 有 6 片：`common.rules.base.json`、`common.text.zh-Hans.json`、`world.rules.navigation.json`、`world.rules.era.ch10.json`、`ch10.rules.base.json`、`ch10.text.zh-Hans.base.json`；四 hash 见 §3。

**四 hash 完整值：**leaf `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`；content `2a849f8efbe72c5713ff3ea5887fc6538c50e3ca4b72faebbc7727b8066295ca`；text `8ae10fa8bd6df97ffd2a20435cfa5bb761bbaa247acd0d1b2f896b946ac1d2af`；release `370389b70474d549a4d08044624232d903ce3c7fbb9ad06ad4daad6fab7cc4d1`。

| remap §2.6 规则 | 反例诊断 / 结果 |
|---|---|
| `from` 唯一 | `REMAP_FROM_DUPLICATE` |
| 无环 | `REMAP_CYCLE` |
| 链压平 | old→mid→final 实测均发布到 final |
| `to` 存在 | `REMAP_TARGET_MISSING` |
| `from` 不再定义 | `REMAP_FROM_DEFINED` |
| 同命名空间 | `REMAP_NAMESPACE` |
| 不表达一对多 | `REMAP_ONE_TO_MANY` |

- ✅ Ink：同名 `.inkmeta.yaml`、编译诊断、外部函数/`#ts:` 白名单、自由 JSON/重复参数反例、结构变化 hash 与 core 选择桥均测试；结构含 knot/stitch/divert/choice/variable/tag/external。
- ✅ 门禁：自动 pNNN 与单项过大失败、1.25/1.5 MiB warning/error 均有测试；现有实测见 §3。
- ✅ loader：strict manifest、release/content/text/leaf hash 与篡改叶片；Node 22 和浏览器共用 `crypto.subtle.digest()`。
| 下游 | 位置 / 接口 | 怎么测 |
|---|---|---|
| ENG-17 | `@tianshu/data` 的 `loadChapterPack()` / `fixupContentRefs()` | data loader 篡改与 remap 单测 |
| ENG-18b | `@tianshu/data/build` 的 `BuildLeaf` / `buildContent()` | 接入后跑 data test + `content:build` |
| CONTENT-ch00 | §6 目录 + `.ink` / `.inkmeta.yaml` | `content:build --chapter ch00_yuenv` |
| ENG-23 | `dist/content/index.json` / manifest leaves | 离线逐 leaf hash 后比 `releaseHash` |
- ✅ 命令：冻结安装、`pnpm check`（94 文件/544 测试 + rig 1/2）、`content:build`、data 9/73、game 14/46、game build、strict IDs、`git diff --check` 均退出 0；game test 采用 `--configLoader runner` 并纳入 build 测试。

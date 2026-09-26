# tech/04 · 数据驱动与内容管线

| 项 | 内容 |
|---|---|
| 文档 | `docs/tech/04-data-pipeline.md` |
| 版本 | v1.0（2026-09-26） |
| 上游基准 | `docs/00-canon.md` §3–§5、§9、§12、§18、§19；`docs/decisions/author-requirements.md` AR-03–AR-07、AR-09；`docs/decisions/rulings-v1.md` C12、C18、C22、C23 |
| 强依赖 | `tech/01` §3.7、§4、§6.8、§8.3、§9；`tech/02` §1–§2；`tech/03` §5.6；`tech/06`；`tech/08` §3.6；`design/02`–`design/10`、`design/13`、`design/17` 的数据契约与校验规则；相关代理报告中的下游交接项 |
| 下游文档 | `tech/05` 玩法引擎、`tech/09` 路线图；尚待成稿的 `design/11`、`design/12`、`design/15`、`design/16`、`design/18`；各书界内容文档 |
| 读者 | 作者本人、内容编辑者、AI 编码/内容助手 |
| 本文职责 | `content/` 源数据布局；YAML 与 Zod 契约；ID 注册、重命名与引用图；Tiled/Ink 转换；内容校验器；规则/文本书界包、`contentHash` 与增量更新；AI 草稿审核入库 |
| 不在本文定义 | 武功/Buff/地形/战斗/经济等玩法语义；素材编码与 CDN；存档结构迁移；云同步。本文只实现其数据入口并引用唯一归属文档 |

> **结论先行（TL;DR）**
>
> 1. **源数据只有一份**：策划可读源放在 `content/`，主要使用 UTF-8 YAML；Zod 权威定义放在 `packages/data/src/schemas/`。JSON Schema、Tiled 类型、Markdown 字段表和发布 JSON 都是生成物，不得反向手改。
> 2. **目录采用 `common + world + chapters/chNN_*`**：跨书界规则在 `common/`，全局地理与时代索引在 `world/`，书界私有内容在 `chapters/chNN_*/`。已有 `content/chNN_*/...` 引用由路径重写表迁到 `content/chapters/chNN_*/...`，不维护两份实体文件。
> 3. **严格 schema，显式升级**：对象用 `z.strictObject()`，未知字段报错；默认值只在构建期展开。内容 schema 变更要提高 `schemaVersion`、生成契约并补迁移夹具，不能靠静默丢字段兼容。
> 4. **ID 是永久外键**：先扫描全局注册表，再允许定义；删除或改名必须写 `idRemaps`。映射须同命名空间、无环、单出口、目标存在、旧 ID 不再定义；读档先执行结构迁移，再按映射修复引用（见 `tech/08` §3.6）。
> 5. **校验不止“能解析”**：`pnpm content:validate` 依次检查语法、结构、ID、引用、设计业务规则、六角地图可达性、Ink 结构与桥接、本地化、数值预算、包体预算和确定性；error 阻断构建，warning 必须出报告。
> 6. **Tiled 只编辑逻辑格**：锁定 Tiled 1.12.2 正交视图；编辑坐标 `(x,y)` 直接成为 pointy-top 轴坐标 `(q,r)`。转换器输出 32×32、每块 1,024 个六角槽的 `RegionMapChunk`，与 `tech/02` 合批契约一致。
> 7. **Ink 不直接改 core**：脚本只能调用只读查询白名单，写操作以声明式命令标签产出，经 core 再校验后提交。每个 locale 独立编译，但节点、选择和变量结构必须同构；结构摘要进入 rules/`contentHash`，字面文本进入 locale/`textHash`；Ink 随机种子由 `world` RNG 覆盖。
> 8. **书界包规则/文本分离并按区域切片**：稳定逻辑名为 `chNN.rules.base.json`、`chNN.rules.rg_<id>.json`、`chNN.text.<locale>.base.json`、`chNN.text.<locale>.rg_<id>.json`；超过 256 KiB 原始 JSON 时由索引再分 `pNNN` 叶片，主线程在加载遮罩或空闲队列中逐片解析。
> 9. **哈希分三个域**：`contentHash` 只覆盖当前可加载规则集，供存档迁移；`textHash` 覆盖单语言文本；`releaseHash` 覆盖整份发布清单。三者都基于规范化未压缩字节，排除时间戳、绝对路径和压缩器差异。
> 10. **P4 预算已落地**：典型书界按本章模型估为约 1,039 KiB gzip；加 25% 余量约 1,299 KiB，低于 1.5 MiB 硬门槛。1.25 MiB 起 warning，1.5 MiB 失败；这仍是 **（待实测）** 的容量模型，须以首个完整书界语料校准。
> 11. **素材与内容分版本**：内容只保存逻辑素材键；`content:build --emit-refs` 生成引用图交给 `tech/06`，二进制和 `assets.lock.json` 不进入 `contentHash`。
> 12. **AI 只能进入草稿区**：结构化输出先落 `content/_drafts/`，经草稿校验、事实/原创标注审阅、人工批准后才由 `content:promote` 入正式目录；任何模型输出都不能自动覆盖已入库内容。

---

## 目录

1. [目标、边界与总流程](#1-目标边界与总流程)
2. [content 目录、文件与 ID 规范](#2-content-目录文件与-id-规范)
3. [packages/data 与 Zod schema](#3-packagesdata-与-zod-schema)
4. [读取、归一化与编译管线](#4-读取归一化与编译管线)
5. [内容校验器](#5-内容校验器)
6. [Tiled 地图管线](#6-tiled-地图管线)
7. [Ink 对话与本地化管线](#7-ink-对话与本地化管线)
8. [书界包、哈希与增量更新](#8-书界包哈希与增量更新)
9. [AI 辅助内容生产的入库闭环](#9-ai-辅助内容生产的入库闭环)
10. [开发工作流与热更新](#10-开发工作流与热更新)
11. [测试与 CI](#11-测试与-ci)
12. [MVP 与演进](#12-mvp-与演进)
13. [风险与对策](#13-风险与对策)
14. [参考资料](#14-参考资料)
15. [本文新增术语/约定](#15-本文新增术语约定)
16. [待决事项 / 依赖](#16-待决事项--依赖)

---

## 1. 目标、边界与总流程

### 1.1 目标

本管线把“人和 AI 容易编辑的内容源”稳定地变为“玩法核心可确定性消费的、可增量下载的内容包”。它必须同时满足：

- **可读**：YAML、Ink、Tiled 源文件可审阅、可 diff，错误能回到源文件行列；
- **唯一**：每个概念只有一个 schema 与一个正式 ID，不因目录别名、语言或包切片重复定义；
- **可证**：所有运行时引用都能沿引用图追到定义、策划章节与素材键；
- **可迁移**：已发布 ID 不被“顺手改名”破坏，旧存档有确定的修复路径；
- **可控**：生成内容必须通过机器校验与人工审核，且可从发布产物复现；
- **可加载**：移动端每次解析的原始 JSON 叶片不超过 256 KiB，区域按需加载；
- **可重现**：相同 Git 内容、工具锁文件与参数必须生成逐字节相同的规范 JSON 与哈希。

### 1.2 归属边界

| 事项 | 唯一归属 | 本文如何消费 |
|---|---|---|
| 品阶、书界、ID 总规则 | `docs/00-canon.md` | 编译为枚举、正则与封闭名录测试，不在本文重排数值 |
| 时间线与武运 | `design/02` | 校验 `chapter`、`worldTier`、原生投放和压制所需字段 |
| 属性与伤害公式 | `design/03`、`design/04` | 生成合法字段枚举；数值检查调用同一纯函数实现 |
| 武功、招式与内功预算 | `design/05` | `SkillDef`/`MoveDef` 镜像其字段；执行 §15 规则 |
| Buff 与效果 DSL | `design/06` | `BuffDef` 镜像其字段；表达式只编译白名单 AST |
| 套装 | `design/07` | 预留 `SetDef`；执行成员与 `setTags` 双向闭合（C22） |
| 地形、轻功与门禁 | `design/08` | `TerrainDef`、`QinggongGate` 与可达性检查 |
| 遭遇与战斗脚本 | `design/09` | `EncounterDef`、`BossScriptDef` 等 schema；Boss 前缀服从 C12 |
| 物品、装备与经济锚点 | `design/10` | `ItemDef`/`EquipDef`/`RecipeDef` 与投放预算检查 |
| 大地图、城市与时代层 | `design/11` | 尚未定稿；本文只按 AR-04 预留技术形状【建议值】 |
| NPC、任务、门派玩法 | `design/12`、`design/18` | 尚未全部定稿；本文预留字段并保持严格版本门槛【建议值】 |
| 天书之力、成长、结局 | `design/13` | `TianshuPowerDef` 与其 §11 校验 |
| 经脉、资源经营 | `design/15`、`design/16` | 尚未定稿；本文按 AR-03、AR-05–AR-07 预留 schema【建议值】 |
| 运行时解释器 | `tech/05` | 本文编译数据，不定义效果原语的结算语义 |
| 素材键、编码、清单与锁 | `tech/06`、`tech/07` | 只抽取逻辑引用，生成 `refs.json`；不复制二进制或清单规则 |
| 存档结构迁移与云同步 | `tech/08` | 输出 `contentHash` 与 `idRemaps`，供其迁移后修复 |

尚未定稿文档的 schema 只是**接口占位**，字段与默认值均标为【建议值】。归属文档成稿后，先更新 Zod 与迁移，再移除“provisional”状态；不得把本文占位反过来当玩法结论。

### 1.3 总流程

```mermaid
flowchart LR
  A["YAML / Ink / TMJ\n正式内容源"] --> B["discover\n路径与文件分类"]
  D["content/_drafts\n未批准草稿"] -. 人工批准 .-> A
  B --> C["parse\nCST + 源位置"]
  C --> N["normalize\n兼容路径与显式默认"]
  N --> Z["Zod strict 结构校验"]
  Z --> R["ID 注册表 + 引用图"]
  R --> V["业务 / 数值 / 地图 / Ink 校验"]
  V --> K["compile\n表达式 AST / Tiled / Ink"]
  K --> S["split\ncommon / chapter / region / locale"]
  S --> J["canonical JSON + SHA-256"]
  J --> P["发布清单与内容包"]
  R --> X["refs.json\n交给素材管线"]
  Z --> G["JSON Schema / Tiled types / 字段文档"]
```

每个阶段只接受上一阶段的不可变结果，并把诊断附到源位置。构建器不在原文件上自动修复；可机械修复的建议以补丁形式输出，由人确认后再写入。

### 1.4 输入、输出与非目标

| 类别 | 输入 / 输出 | 是否提交 Git | 说明 |
|---|---|---:|---|
| 正式源 | `content/**/*.yaml`、`*.ink`、`*.tmj` | 是 | 唯一内容事实源 |
| 草稿源 | `content/_drafts/**` | 可选 | 永不参与生产构建；合并前必须 promote |
| schema 源 | `packages/data/src/schemas/**/*.ts` | 是 | Zod 4；唯一结构事实源 |
| 跨语言静态契约 | `packages/spec/**` | 是 | C18 唯一路径；相机、精灵等非业务 JSON 契约 |
| 编辑器镜像 | `content/.schema/*.json`、Tiled property types | 是 | 由 `schema:gen` 重建并做漂移检查 |
| 构建缓存 | `.cache/content-build/**` | 否 | 以文件哈希和工具版本寻址 |
| 发布产物 | `dist/content/**` | 否 | 规范 JSON、预压缩文件、清单、报告 |
| 素材引用图 | `.cache/content-build/refs.json` | 否 | `tech/06` 的自动归包输入 |

非目标包括：在 YAML 中嵌入二进制、把 Tiled 当最终渲染格式、让 Ink 承担战斗结算、在构建器中复制设计公式、由 AI 自动发布内容。

---

## 2. content 目录、文件与 ID 规范

### 2.1 规范目录树

```text
content/
├── CLAUDE.md
├── .schema/                         # schema:gen 生成；只供编辑器
│   ├── skill.schema.json
│   ├── buff.schema.json
│   ├── region.schema.json
│   └── index.json
├── _drafts/                         # AI / 人工草稿；生产发现器硬排除
│   └── <job-id>/
│       ├── draft.yaml
│       └── provenance.json
├── common/                          # 跨书界、语言无关的正式定义
│   ├── skills/                      # sk_*，内部包含 mv_* / ps_*
│   ├── buffs/                       # bf_*
│   ├── sets/                        # set_*
│   ├── items/                       # it_* / eq_*；保留 items/divine.yaml
│   ├── terrain/                     # tr_* / tst_*
│   ├── combos/                      # cmb_*；保留 combos/cmb_longbang.yaml
│   ├── ai/                          # pers_* / ai_*；保留 ai/pers_duzhe.yaml
│   ├── tianshu/                     # tsp_*；保留 tianshu/tsp_*.yaml
│   ├── sects/                       # sect_*、职级模板
│   ├── meridians/                   # mer_* / ap_*【建议值，AR-03】
│   └── economy/                     # res_* 与跨书界品级表【建议值，AR-05】
├── world/                           # 全局地理与时代索引
│   ├── tiers.yaml                   # 保留既有 content/world/tiers.yaml
│   ├── regions/                     # 全局 rg_* 元数据与唯一基础 .tmj【建议值，AR-04】
│   │   ├── rg_dali.yaml
│   │   └── rg_dali.tmj
│   ├── cities/                      # city_*【建议值，AR-04】
│   └── routes/                      # 大地图驿路 / 水路 / 图外专线的规则引用
├── chapters/
│   ├── ch00_yuenv/
│   ├── ch01_tianlong/
│   │   ├── chapter.yaml
│   │   ├── era.yaml                 # 对全局区域/城市的时代覆写【建议值】
│   │   ├── npcs/                    # npc_*
│   │   ├── quests/                  # q_*
│   │   ├── dialogue/                # *.ink + *.inkmeta.yaml
│   │   ├── encounters/              # enc_*
│   │   ├── bosses/                  # bsc_*；旧 boss/ 只迁移不兼容共存
│   │   ├── enemies/                 # tmpl_* / arch_* / ea_*
│   │   ├── events/                  # ev_*
│   │   ├── resource-points/         # rp_*【建议值，AR-05】
│   │   ├── servants/                # sv_*【建议值，AR-05】
│   │   ├── businesses/              # biz_*【建议值，AR-06】
│   │   └── shops/
│   └── ch14_xueshan/
├── locales/
│   ├── zh-Hans/ui.yaml
│   └── zh-Hant/overrides.yaml
├── assets/registry/                 # AssetEntry 登记库；字段归 tech/07
│   └── ch01/portrait.yaml           # 保留既有兼容路径
├── tiled/                           # Tiled 工程、tileset 与扩展；tech/01 既有路径
│   ├── tianshu.tiled-project
│   ├── tilesets/
│   │   ├── terrain.tsx
│   │   ├── height.tsx
│   │   └── deco-<theme>.tsx
│   └── extensions/
│       └── tianshu-check.js
├── vfx/                             # fx_* 定义；引用素材键，不放贴图
└── migrations/
    ├── id-remaps.yaml               # 累积、可审计的 ID 重映射
    └── path-remaps.yaml             # 仅构建源路径迁移，不进入存档
```

`ch00`–`ch14` 与终局容器 `ch15_guimeng` 的命名服从基准 §12；`ch15` 只是终局命名空间，不是第十五本天书。目录可以不存在空壳，但一旦出现必须匹配已登记书界 ID。

### 2.2 兼容路径与迁移

现有文档同时出现 `content/chapters/chNN_*/...` 与 `content/chNN_*/...`。本方案只保留前者为物理规范路径，发现器在迁移期读取 `path-remaps.yaml`，将旧路径解析到新路径并发 `CONTENT_PATH_DEPRECATED`；不得复制文件，也不得以符号链接制造两个可编辑入口。

| 既有引用 | 规范路径 / 处理 | 兼容策略 |
|---|---|---|
| `content/ch08_luding/encounters/enc_08_shenlongdao.yaml` | `content/chapters/ch08_luding/encounters/enc_08_shenlongdao.yaml` | 路径重写；一个版本周期 warning，之后旧物理路径为 error |
| `content/ch08_luding/boss/bs_hongantong_shenlongdao.yaml` | `content/chapters/ch08_luding/bosses/bsc_hongantong_shenlongdao.yaml` | 路径迁移且 ID 按 C12 重映射；同表也覆盖 `bs_xiaofeng_juxianzhuang`、`bs_dongfangbubai_heimuya`；`bs_` 只留书眠 Ink 节点 |
| `content/chapters/ch01_tianlong/regions/rg_01_dali.tmj` | `content/world/regions/rg_dali.tmj`【建议值】 | AR-04 的共享底图迁移；须与 `design/11` 的区域 ID remap 同批提交；多个旧图汇入同一区域时只报冲突、不自动覆盖 |
| `content/common/items/divine.yaml` | 原路径 | 允许“一文件多对象”；对象仍逐一注册 |
| `content/common/tianshu/tsp_*.yaml` | 原路径 | 原路径即规范 |
| `content/common/combos/cmb_longbang.yaml` | 原路径 | 原路径即规范 |
| `content/common/ai/pers_duzhe.yaml` | 原路径 | 原路径即规范 |
| `content/world/tiers.yaml` | 原路径 | 原路径即规范；不移入 `common` |
| `content/assets/registry/ch01/portrait.yaml`、`ch01/cg.yaml` | 原路径 | 原路径即规范；资产登记库归 `tech/07` |
| `content/assets/registry/asset.schema.json` | 原路径 | `schema:gen` 生成的兼容镜像；权威源为 `packages/data/src/schemas/asset-entry.ts`，跨语言快照在 `packages/spec/content/`，禁止手改 |
| `content/tiled/tianshu.tiled-project` | 原路径 | 原路径即规范；只存项目属性类型、tileset 与编辑器扩展 |
| `content/vfx/fx_*.yaml` | 原路径 | 原路径即规范；`fx_*` 不是二进制素材键 |

迁移命令先输出计划，再由人确认应用：

```bash
pnpm content:migrate --paths --dry-run
pnpm content:migrate --paths --apply
pnpm content:validate --no-deprecated-paths
```

发布构建始终启用 `--no-deprecated-paths`。文档中的历史示例可以保留旧路径作追溯，但真正文件、活跃引用和产物清单只能使用规范路径。

### 2.3 YAML 写作约定

| 规则 | 约定 | 原因 |
|---|---|---|
| 编码 | UTF-8、无 BOM、LF、文件末尾一个换行 | 跨平台哈希稳定 |
| 文档数 | 每文件一个 YAML document；禁用 `---` 多文档流 | 文件级诊断与缓存简单 |
| 根形状 | 单对象，或明确允许的同类型对象数组 | 禁止把不相关类型混在一个文件 |
| 键 | ASCII `camelCase`；未知键由 strict schema 拒绝 | 防拼写错误被静默忽略 |
| 数值 | 小数用十进制有限字面量；百分比写小数，百分点字段以 `Pp` 结尾 | 与 `design/03`、`design/06` 一致 |
| 特殊数 | 禁止 `NaN`、`Infinity`、`-inf`；需要不可通行时写枚举 `inf` | JSON 可表达且跨解析器一致 |
| 日期 | 玩法年代用整数/结构体；不得依赖 YAML 隐式时间类型 | 防时区和自动类型转换 |
| 锚点 | 禁止 YAML anchor、alias 与 merge key | 防隐式共享、循环和难审 diff |
| 标签 | 禁止自定义 `!!` 标签；解析器只接受 core schema | 防对象构造与工具差异 |
| 重复键 | 一律 error | 禁止“后值覆盖前值” |
| 注释 | 可解释来源与算式，不承载运行规则 | 规则必须结构化 |
| 标注 | 原创/待考写进 `origin`、`canonRef` 等结构字段；展示文本仍保留规范标注 | 可机器检查 |

解析使用 `yaml@2.9.1` 的 `parseDocument`、`LineCounter` 和源 token 信息，以便把 Zod 路径映射回行列。锁定版本已于 2026-09-26 从 npm registry 核实；升级必须跑解析夹具，不使用“latest”漂移构建。

### 2.4 文件粒度与覆盖规则

- 默认一份定义一个文件，文件主名等于顶层 `id`；大表只有在归属文档已明确为封闭集合时才允许数组文件，如 `divine.yaml`。
- 同一 ID 不允许按目录优先级覆盖。开发、书界与本地化都不能重新定义规则对象。
- 时代差异放入 `EraLayerDef` 的 patch 字段；patch 只允许 schema 明列的可覆写字段，不能任意 JSON Merge Patch。
- 本地化只覆盖 `TextKey` 的值；不得改变 ID、条件、选择数量或数值。
- 测试夹具在 `tools/content-build/test/fixtures/`，必须由发现器显式传入，生产扫描永不递归该目录。
- 生成物带 `generatedBy` 与格式版本，但这些构建元数据不混入玩法对象，也不参与 `contentHash`。

### 2.5 ID 注册表

发现阶段不立刻解析引用，而先建立全局符号表：

```ts
export type ContentKind =
  | 'chapter' | 'skill' | 'move' | 'passive' | 'buff' | 'set'
  | 'item' | 'equip' | 'terrain' | 'terrainState' | 'region' | 'city'
  | 'npc' | 'quest' | 'encounter' | 'bossScript' | 'enemyTemplate'
  | 'sect' | 'tianshuPower' | 'meridian' | 'acupoint'
  | 'resource' | 'resourcePoint' | 'servant' | 'business';

export interface SymbolEntry {
  readonly id: string;
  readonly kind: ContentKind;
  readonly file: string;          // 仓库根相对路径；不写绝对路径
  readonly pointer: string;       // JSON Pointer，如 /moves/2
  readonly chapter: string | null;
  readonly provisional: boolean;
}

export interface RefEdge {
  readonly from: string;
  readonly to: string;
  readonly field: string;
  readonly strength: 'hard' | 'optional' | 'asset';
  readonly source: { file: string; line: number; column: number };
}
```

注册顺序固定为规范相对路径的 Unicode code point 升序，再按文件内数组序。重复定义同时报告首处和冲突处；不能“最后一个赢”。嵌套 `MoveDef`、`PassiveDef` 也进入同一全局表，因此跨武功重名会失败。

ID 正则从基准 §12 与已批准作者需求生成，而不是散落在各 schema 中手抄。AR-04 将区域扩为全局 `rg_*`，故兼容正则为 `^rg_[a-z0-9_]+$`，既接受旧式 `rg_01_dali`，也接受未来全局 ID；正式迁移表须由 `design/11` 给出，管线不擅自删掉书界号。

### 2.6 ID 重映射

`content/migrations/id-remaps.yaml` 是正式内容迁移的一部分：

```yaml
schemaVersion: id-remaps.v1
remaps:
  - from: bs_hongantong_shenlongdao
    to: bsc_hongantong_shenlongdao
    since: sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
    reason: rulings-v1 C12；bs_ 专用于书眠 Ink 节点
```

示例中的哈希只展示格式，不是发布值。为避免 `contentHash` 覆盖 `idRemaps` 时形成自引用，正式 `since` 记录**重命名前最后一个可读版本的 `contentHash`**，由发布流程从前一份已验证 manifest 写入；未曾发布的 ID 直接改正，不创建 remap。规则如下：

1. `from` 全局唯一，每个旧 ID 只有一个直接去向；
2. 图必须无环；构建时把历史链压平到当前叶目标，但保留原记录供审计；
3. `to` 必须存在于当前注册表，`from` 不得仍有正式定义；
4. 默认要求同命名空间；跨类型迁移必须提高存档 schema，由 `tech/08` 的结构迁移处理，不能只写 remap；
5. 一对多拆分不能用本表表达，必须写结构迁移并给确定的缺省选择；
6. 映射覆盖存档、任务旗标、Ink 状态外围索引和内容引用；不对自由文本做搜索替换；
7. 当前包携带支持窗口内的累积映射；只要存档中实际出现 `from` 就应用，`since` 用于审计而非依赖设备墙钟；
8. 加载顺序固定为 `migrateSave()` → `fixupContentRefs()` → 引用完整性检查 → 写迁移报告，符合 `tech/08` §3.6。

删除而无替代的 ID 不能伪装成 `to: null`。它进入带类型的退化策略表：物品按 `design/10` 估值折银，武功转残篇记录，任务标 `obsolete`；具体执行仍归 `tech/08`。

### 2.7 路径与 ID 的稳定性分级

| 变更 | 允许方式 | 是否改变 `contentHash` | 存档动作 |
|---|---|---:|---|
| 注释、排版 | 直接改源 | 否 | 无 |
| 纯显示文本 | 改 locale / Ink 字面文本，不改分支、标签或变量 | 否；改变 `textHash` | 无 |
| 文件搬迁、ID 不变 | `path-remaps` + 一次迁移 | 否 | 无 |
| 数值或规则字段 | 改 YAML，附来源/算式 | 是 | 通常只重新绑定定义 |
| ID 改名 | 新 ID + `idRemaps` | 是 | 修复引用 |
| 对象拆分/合并 | 新 schema 版本 + 结构迁移 | 是 | 结构迁移后再修复引用 |
| schema 删除字段 | 先弃用至少一个发布窗口，再迁移 | 是 | 夹具覆盖 |

---

## 3. packages/data 与 Zod schema

### 3.1 源码组织

```text
packages/data/
├── src/
│   ├── schemas/
│   │   ├── primitives/             # ID、Grade、ChapterId、Expr、AssetKey
│   │   ├── combat/                 # skill、buff、set、encounter、enemy、ai
│   │   ├── world/                  # terrain、region、city、era、tiled-output
│   │   ├── narrative/              # npc、quest、dialogue-manifest、event
│   │   ├── inventory/              # item、equip、recipe
│   │   ├── progression/            # tianshu、achievement、ending
│   │   ├── society/                # sect、rank、business
│   │   ├── meridian/               # AR-03 预留【建议值】
│   │   ├── economy/                # AR-05/06 预留【建议值】
│   │   ├── asset-entry.ts          # 结构与 tech/07 对齐
│   │   └── index.ts
│   ├── pack/                       # ChapterPackManifest、轻量加载类型
│   ├── generated/                  # schema:gen 生成的 ID 联合/枚举；勿手改
│   └── index.ts                    # 运行时安全导出；不得导出完整 Zod
├── test/
│   ├── fixtures/valid/
│   ├── fixtures/invalid/
│   └── golden/
└── package.json

packages/spec/                      # C18：跨语言静态 JSON 契约唯一目录
├── content/                        # Zod 导出的跨工具 JSON Schema 快照
│   ├── skill.schema.json
│   └── region-map.schema.json
├── iso-camera.json
└── sprite-spec.json
```

`packages/data/src/schemas/**` 是权威 TypeScript 源。`packages/spec/content/**` 供 Python、Tiled 扩展和外部工具消费；`content/.schema/**` 是面向编辑器的镜像。C18 禁止恢复旧的 `packages/data/spec/`。

### 3.2 schema 设计原则

1. **严格对象**：所有实体与关键子结构用 `z.strictObject`，未知键失败；仅明确的扩展袋如 `TspRule.params` 允许有限 JSON 值。
2. **类型从 schema 推导**：`type SkillDef = z.output<typeof SkillDefSchema>`；不得另写一份手工 interface 后声称同构。
3. **输入与输出分开**：输入允许省略有默认值的字段；构建后输出展开默认、去除注释并冻结。JSON Schema 用 `io: 'input'` 供写作者补全。
4. **不用隐式 transform 隐藏迁移**：拼写纠正、旧字段改名在 `normalize` 阶段产生诊断；Zod 只做结构解析与局部 refine。
5. **交叉对象规则不塞进单文件 schema**：存在性、双向关系、预算和可达性由注册表后的 lint pass 完成，避免读取顺序影响结果。
6. **有限数值**：所有 number 先要求 `Number.isFinite`；整数、范围、步长分别检查。
7. **判别联合**：物品、效果、对象、命令标签等以稳定的 `kind`/`type` 区分，不靠字段猜类型。
8. **描述可生成**：公共字段必须带 `.describe()`，来源章节写入 metadata，供 JSON Schema 与 AI 字段参考表。
9. **暂定字段显式化**：未定稿模块导出 `Provisional*` schema，根对象带 `schemaStatus: 'provisional'`；正式构建可接纳，但报告必须列出数量。
10. **运行时无完整 Zod**：工具入口从 `@tianshu/data/schemas` 导入 Zod；游戏只从 `@tianshu/data` 导入生成类型和轻量边界检查，沿用 `tech/01` §3.2、§5.2。

### 3.3 公共原语示例

```ts
import { z } from 'zod';

export const GradeSchema = z.number().int().min(1).max(12)
  .describe('绝对品阶 1..12；见 Canon §4');

const id = (prefix: string, label: string) =>
  z.string().regex(new RegExp(`^` + prefix + `[a-z0-9_]+$`)).describe(label);

export const SkillIdSchema = id('sk_', '武功 ID；Canon §12').brand<'SkillId'>();
export const BuffIdSchema = id('bf_', 'Buff ID；Canon §12').brand<'BuffId'>();
export const NpcIdSchema = id('npc_', 'NPC ID；Canon §12').brand<'NpcId'>();
export const RegionIdSchema = id('rg_', '全局区域 ID；AR-04').brand<'RegionId'>();
export const AssetKeySchema = z.string()
  .regex(/^[a-z][a-z0-9_-]*\/[a-z0-9_/-]+$/)
  .describe('逻辑素材键；定义与寻址见 tech/06');

export const OriginSchema = z.enum(['canon', 'expanded', 'canonExpanded']);
export const SourceMarkSchema = z.strictObject({
  origin: OriginSchema,
  canonRef: z.string().min(1).optional(),
}).superRefine((v, ctx) => {
  if (v.origin !== 'expanded' && !v.canonRef) {
    ctx.addIssue({ code: 'custom', path: ['canonRef'], message: '原著相关内容必须给出处或（待考）' });
  }
});

export type SkillId = z.output<typeof SkillIdSchema>;
export type RegionId = z.output<typeof RegionIdSchema>;
```

上例的 `id()` 只展示共同形状；实际实现从一张经测试的前缀表生成，避免正则和说明分叉。业务 ID 不在解析时自动转小写，因为自动转换会掩盖两个原始 ID 的碰撞。

### 3.4 schema 清单

| 域 | 根 schema / 关键子结构 | ID / 路径 | 字段权威来源 |
|---|---|---|---|
| 书界 | `ChapterDef`、`WorldTierDef` | `chNN_*`、`world/tiers.yaml` | 基准 §2–§5、`design/02` |
| 武功 | `SkillDef`、`MoveDef`、`PassiveDef`、`InnerDef`、`LearnSource` | `sk_*`、`mv_*`、`ps_*` | `design/05` §2、§4、§5、§15 |
| Buff | `BuffDef`、`StackRule`、`TriggerDef`、`EffectOp`、`Expr` | `bf_*`、`fam_*`、`exg_*`、`rx_*` | `design/06` §2、§6、§13 |
| 套装 | `SetDef`、`SetThreshold` | `set_*` | `design/07`；C22 |
| 物品装备 | `ItemDef`、`EquipDef`、`UseSpec`、`RecipeDef`、`AffixDef`、`UniqueDef` | `it_*`、`eq_*`、`rc_*`、`af_*`、`ue_*` | `design/10` §2、§14 |
| 地形 | `TerrainDef`、`TerrainStateDef`、`QinggongGate` | `tr_*`、`tst_*`、`gate_*` | `design/08` §2、§6、§12 |
| 区域地图 | `RegionDef`、`RegionMap`、`RegionMapChunk`、`RegionObject` | `rg_*` | AR-04；本章 §6；渲染消费见 `tech/02` |
| 城市时代 | `CityDef`、`EraLayerDef`、`EraRegionPatch` | `city_*` | AR-04；未来 `design/11`【建议值】 |
| NPC | `NpcDef`、`LifeSpan`、`ChapterAppearance`、`RecruitProfile` | `npc_*` | AR-09；未来 `design/18`【建议值】 |
| 任务剧情 | `QuestDef`、`QuestStage`、`EventDef`、`ConditionExpr`、`RewardDef` | `q_*`、`ev_*` | 未来 `design/12`；经验字段见 `design/13`【建议值】 |
| 对话 | `DialogueManifest`、`InkBridgeUse`、`TextIndex` | 逻辑键 `ink.<story>.*` | 本章 §7；剧情语义归各书界与 `design/12` |
| 遭遇 | `EncounterDef`、`BossScriptDef`、`TelegraphDef`、`ComboDef` | `enc_*`、`bsc_*`、`tg_*`、`cmb_*` | `design/09` §13–§14；C12 |
| 敌人 AI | `EnemyTemplateDef`、`ArchetypeDef`、`EliteAffixDef`、`AiPersonalityDef` | `tmpl_*`、`arch_*`、`ea_*`、`pers_*`、`ai_*` | `design/09` |
| 天书成长 | `TianshuPowerDef`、`TspRule`、成就/结局/称号定义 | `tsp_*`、`ach_*`、`end_*`、`ttl_*` | `design/13` §4、§8、§10–§11 |
| 门派职级 | `SectDef`、`RankTemplateDef`、`SectEraProfile` | `sect_*`；L1–L5 | AR-07、`design/17` §12、§15；未来 `design/12`【建议值】 |
| 经脉穴道 | `MeridianDef`、`AcupointDef`、`CirculationDef` | `mer_*`、`ap_*` | AR-03；未来 `design/15`【建议值】 |
| 资源经营 | `ResourceDef`、`ResourcePointDef`、`ServantDef`、`BusinessDef` | `res_*`、`rp_*`、`sv_*`、`biz_*` | AR-05、AR-06；未来 `design/16`【建议值】 |
| 素材登记 | `AssetEntry`、`Provenance` | 素材逻辑键 / `art://` | 字段归 `tech/07`，存储与清单归 `tech/06` |
| 特效 | `VfxDef`、表现阶段引用 | `fx_*` | 表现契约见 `tech/02`；只引用素材键 |

### 3.5 策划字段到 schema 的对应

| 策划字段组 | Zod 路径 | 额外构建处理 |
|---|---|---|
| `design/05` `SkillDef` 顶层 | `combat/skill.ts: SkillDefSchema` | `aptitude`、`moveSlots` 可按设计规则展开默认；保留输入/输出差异 |
| 招式 `moves[]` | `MoveDefSchema` | `aoe` 解析为模板引用；预算报告保存期望值、实值、差值 |
| 内功 `inner.contribution` | `InnerContributionSchema` | 计算 IP，不把计算结果写回源 YAML |
| `design/06` 表达式字段 | `ExprSourceSchema` | 白名单解析为 AST；产物只含 AST，不在运行时 `eval` |
| Buff `mods/triggers/reactions` | 对应判别联合 | 建立 hook → Buff 倒排索引供运行时加载 |
| `design/08` `TerrainDef` | `world/terrain.ts` | `combat` 记法编译为 `Mod[]`；资产简写归一为素材键 |
| 地图 `QinggongGate` | `world/region-object.ts` | 与 TMJ 对象类合并后执行 V-G1–V-G9 |
| `design/09` 遭遇与 Boss | `combat/encounter.ts` | 区域出生区解析为六角集合；阶段条件编译为 AST |
| `design/10` `ItemDef/EquipDef` | `inventory/*.ts` | 按 `kind` 选择判别分支；`price:auto` 保持标记，由 core 公式求值 |
| `design/13` `TianshuPowerDef` | `progression/tianshu.ts` | `TspRule.kind` 必须在 `tech/05` 原语注册表 |
| `design/17` 门派矩阵 | `society/sect.ts` | 99×14 与 L1–L5 校验；建议地图 ID 保留 provisional 标志 |
| NPC 生卒与书界出现 | `narrative/npc.ts` | 年代区间交叉检查；推算/待考不可伪装成精确史实 |
| 对话显示文本 | `TextEntrySchema` | 从 Ink 抽取，进入 locale 包，不进入规则对象 |
| 所有 `assets`/`visual`/`anim` | `AssetKeySchema` | 生成素材引用边；简写只在迁移期 warning |

### 3.6 武功 schema 示例

```ts
import { z } from 'zod';
import { GradeSchema, SkillIdSchema, BuffIdSchema } from '../primitives/index.js';
import { EffectOpSchema, RequirementExprSchema } from '../rules/index.js';
import { LayerDefSchema, LearnSourceSchema, ReqsSchema } from './skill-parts.js';

const Step005 = z.number().min(0).max(1).refine(
  (n) => Math.abs(n * 20 - Math.round(n * 20)) < Number.EPSILON * 32,
  '必须是 0.05 的倍数',
);

export const BuffApplySchema = z.strictObject({
  id: BuffIdSchema,
  chance: z.number().min(0).max(1),
  dur: z.number().int().positive(),
  grade: z.union([z.literal('inherit'), GradeSchema]),
  to: z.enum(['self', 'target', 'area']),
});

export const MoveDefSchema = z.strictObject({
  id: z.string().regex(/^mv_[a-z0-9_]+$/),
  name: z.string().min(1),
  unlock: z.number().int().min(1).max(10),
  kind: z.enum(['attack', 'support', 'stance', 'utility']),
  target: z.enum(['enemy', 'ally', 'self', 'tile', 'any']),
  range: z.strictObject({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  aoe: z.strictObject({ tpl: z.string().regex(/^aoe_[a-z0-9_]+$/) }).catchall(z.never()),
  delivery: z.enum(['melee', 'ranged', 'projectile', 'self']),
  mpCost: z.number().min(0).max(1),
  cd: z.number().int().min(0).max(5),
  recovery: z.number().int().positive(),
  power: z.number().nonnegative(),
  parryable: z.boolean(),
  friendlyFire: z.enum(['none', 'allies', 'all']),
  buffs: z.array(BuffApplySchema).default([]),
  note: z.string().optional(),
});

export const SkillDefSchema = z.strictObject({
  id: SkillIdSchema,
  name: z.string().min(1),
  category: z.enum(['inner', 'unarmed', 'weapon', 'movement', 'hidden', 'misc']),
  subType: z.string().min(1),
  grade: GradeSchema,
  origin: z.enum(['canon', 'expanded', 'canonExpanded']),
  sect: z.string().regex(/^sect_[a-z0-9_]+$/).nullable(),
  sourceChapters: z.array(z.string().regex(/^ch(?:0[0-9]|1[0-5])_[a-z0-9_]+$/)).min(1),
  canonRef: z.string().min(1).optional(),
  nature: z.enum(['yang', 'yin', 'harmony', 'neutral']),
  wOut: Step005,
  wIn: Step005,
  reqs: ReqsSchema,
  maxLayer: z.number().int().min(1).max(10).default(10),
  layers: z.array(LayerDefSchema),
  moves: z.array(MoveDefSchema),
  learnSources: z.array(LearnSourceSchema).min(1),
  setTags: z.array(z.string().regex(/^set_[a-z0-9_]+$/)).default([]),
  description: z.string().min(1),
}).superRefine((s, ctx) => {
  if (Math.abs(s.wOut + s.wIn - 1) > 1e-9) {
    ctx.addIssue({ code: 'custom', path: ['wOut'], message: 'wOut + wIn 必须等于 1' });
  }
  if (s.category === 'inner' && s.nature === 'neutral') {
    ctx.addIssue({ code: 'custom', path: ['nature'], message: '内功不得为 neutral' });
  }
});

export type SkillDefInput = z.input<typeof SkillDefSchema>;
export type SkillDef = z.output<typeof SkillDefSchema>;
```

示例只展开与管线相关的骨架；`ReqsSchema`、`LayerDefSchema`、`LearnSourceSchema` 是从 `design/05` §2 映射的严格子 schema。正式根还必须覆盖该节全部字段，不以此节选替换其定义。带可变参数的 `aoe` 应使用 28 种模板的判别联合，而不是在正式代码中保留任意键。

### 3.7 预留：全局区域、城市与时代图层【建议值】

AR-04 要求一张共享江湖大地图，书界只切换时代状态。建议 schema 把“地理身份”和“时代状态”拆开：

```ts
const ChapterIdSchema = z.string().regex(/^ch(?:0[0-9]|1[0-5])_[a-z0-9_]+$/);
const CityIdSchema = z.string().regex(/^city_[a-z0-9_]+$/).brand<'CityId'>();

export const RegionDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: RegionIdSchema,
  name: z.string().min(1),
  kind: z.enum(['land', 'cityArea', 'island', 'water', 'interior', 'offmap']),
  map: z.string().endsWith('.tmj').optional(),
  cities: z.array(CityIdSchema).default([]),
  neighbors: z.array(RegionIdSchema).default([]),
  baseAssets: z.array(AssetKeySchema).default([]),
  sourceRef: z.string().min(1),
});

export const CityDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: CityIdSchema,
  canonicalName: z.string().min(1),
  region: RegionIdSchema,
  mapAnchor: z.strictObject({ q: z.number().int(), r: z.number().int() }),
  historicalRefs: z.array(z.string()).default([]),
});

export const EraLayerDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  chapter: ChapterIdSchema,
  yearRange: z.tuple([z.number().int(), z.number().int()]),
  regions: z.record(RegionIdSchema, z.strictObject({
    state: z.enum(['open', 'closed', 'hidden', 'destroyed']),
    controllingFaction: z.string().regex(/^sect_[a-z0-9_]+$/).nullable(),
    entryGates: z.array(z.string().regex(/^gate_[a-z0-9_]+$/)).default([]),
  })),
  cities: z.record(CityIdSchema, z.strictObject({
    eraName: z.string().min(1),
    status: z.enum(['capital', 'major', 'normal', 'declined', 'ruin']),
  })),
});
```

以上字段、枚举与 `schemaStatus` 均为【建议值】，只保证管线有落点；正式区域 ID、城市表、时代状态及入口语义由 `design/11` 定稿。大地图 SVG 是 UI/世界层素材（AR-11），不进入 `RegionMap` 地形网格。

### 3.8 预留：经脉、穴道与周天【建议值】

```ts
export const MeridianDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: z.string().regex(/^mer_[a-z0-9_]+$/),
  name: z.string().min(1),
  family: z.enum(['regular12', 'extra8']),
  acupoints: z.array(z.string().regex(/^ap_[a-z0-9_]+$/)).min(6).max(12),
  order: z.number().int().nonnegative(),
  sourceRef: z.string().min(1),
});

export const AcupointDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: z.string().regex(/^ap_[a-z0-9_]+$/),
  name: z.string().min(1),
  meridian: z.string().regex(/^mer_[a-z0-9_]+$/),
  sequence: z.number().int().positive(),
  unlockCost: z.number().int().nonnegative(),
  effects: z.array(EffectOpSchema).default([]),
  sourceRef: z.string().min(1),
});

export const CirculationDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  stage: z.enum(['meridianComplete', 'small', 'large', 'twelveRegular', 'turn1', 'turn2',
                 'turn3', 'turn4', 'turn5', 'turn6', 'turn7', 'turn8', 'turn9']),
  requires: z.array(z.string().regex(/^(?:mer|ap)_[a-z0-9_]+$/)),
  milestoneEvent: z.string().min(1),
});
```

AR-03 已确定十二正经加奇经八脉共 20 条、每脉默认 6–12 穴、合计约 150–200 穴，以及进度跨书界保留；这些数量检查可先启用。穴位真实名称与归属必须由 `design/15` 核考，本文不创作穴名。`meridianComplete`、`small`、`large`、`twelveRegular`、`turn1..turn9` 分别承载通脉、小周天、大周天、十二经周流与九转；阶段键为【建议值】，不是新增游戏 ID 前缀。

### 3.9 预留：资源、家丁、营生与门派月钱【建议值】

```ts
const ResourceIdSchema = z.string()
  .regex(/^res_[a-z0-9]+_(?:huang|xuan|di|tian)[1-9]$/)
  .brand<'ResourceId'>();

export const ResourceDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: ResourceIdSchema,
  name: z.string().min(1),
  category: z.enum(['ore', 'herb', 'wood', 'horse', 'grain', 'silkTea', 'ironware', 'treasure']),
  tier: z.enum(['huang', 'xuan', 'di', 'tian']),
  rank: z.number().int().min(1).max(9), // 一品最高、九品最低
  unit: z.string().min(1),
});

export const ResourcePointDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: z.string().regex(/^rp_[a-z0-9_]+$/),
  region: RegionIdSchema,
  location: z.strictObject({ q: z.number().int(), r: z.number().int() }),
  outputs: z.array(z.strictObject({ resource: ResourceIdSchema, amountPerCycle: z.number().positive() })),
  captureBy: z.array(z.enum(['battle', 'quest', 'purchase', 'sectGrant'])).min(1),
  servantSlots: z.number().int().nonnegative(),
  maintenanceSilver: z.number().int().nonnegative(),
  eraAvailability: z.array(ChapterIdSchema),
});

export const ServantDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: z.string().regex(/^sv_[a-z0-9_]+$/),
  name: z.string().min(1),
  management: z.number().int().min(0).max(100),
  production: z.number().int().min(0).max(100),
  defense: z.number().int().min(0).max(100),
  maxLevel: z.number().int().positive(),
});

export const BusinessDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: z.string().regex(/^biz_[a-z0-9_]+$/),
  city: CityIdSchema,
  kind: z.enum(['casino', 'escortAgency', 'manor']),
  positions: z.array(z.enum(['walker', 'instructor', 'retainer'])).min(1),
  rewards: z.record(z.enum(['walker', 'instructor', 'retainer']), z.strictObject({
    silverTier: z.number().int().min(1).max(5),
    resourceTier: z.number().int().min(0).max(5),
  })),
});

export const SectRankSchema = z.strictObject({
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  title: z.string().min(1),
  promotion: z.array(RequirementExprSchema),
  skillScope: z.array(z.string().regex(/^sk_[a-z0-9_]+$/)),
  duties: z.array(z.string()),
  stipendTier: z.number().int().min(1).max(5),
  resourceTier: z.number().int().min(1).max(5),
});
```

资源类别枚举、能力上限、周期单位、工资金额和资源档位都是【建议值】；`design/16` 应以经济曲线定稿。管线已可强制：资源 ID 四阶九品一致、一品最高；资源点/家丁/库存默认不跨书界；客卿职位全局唯一；每个门派模板恰有 L1–L5，月钱和资源档只引用 1–5 而不在门派表复制金额。

### 3.10 NPC 名录与跨书界字段【建议值】

```ts
const YearEvidenceSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('exact'), year: z.number().int(), sourceRef: z.string().min(1) }),
  z.strictObject({ kind: z.literal('estimated'), from: z.number().int(), to: z.number().int(),
                   note: z.string().includes('推算') }),
  z.strictObject({ kind: z.literal('unknown'), note: z.string().includes('待考') }),
]);

export const NpcDefSchema = z.strictObject({
  schemaStatus: z.literal('provisional'),
  id: NpcIdSchema,
  name: z.string().min(1),
  kind: z.enum(['named', 'facility', 'ambient']),
  born: YearEvidenceSchema.optional(),
  died: YearEvidenceSchema.optional(),
  ageBand: z.enum(['child', 'youth', 'adult', 'elder', 'unknown']).optional(),
  recruitDifficulty: z.union([z.literal('D1'), z.literal('D2'), z.literal('D3'),
                              z.literal('D4'), z.literal('D5')]),
  crossChapter: z.boolean(),
  appearances: z.array(z.strictObject({
    chapter: ChapterIdSchema,
    region: RegionIdSchema,
    availability: z.enum(['present', 'hidden', 'allianceOnly', 'unavailable']),
    capabilityProfile: z.string().min(1),
  })).min(1),
  sourceRefs: z.array(z.string()).default([]),
}).superRefine((npc, ctx) => {
  if (npc.kind === 'named' && (!npc.born || !npc.died)) {
    ctx.addIssue({ code: 'custom', path: ['born'], message: '具名 NPC 必须登记 born 与 died，可用 unknown' });
  }
  if (npc.kind !== 'named' && !npc.ageBand) {
    ctx.addIssue({ code: 'custom', path: ['ageBand'], message: '设施与路人 NPC 必须登记年龄段' });
  }
  if (npc.crossChapter && npc.appearances.length < 2) {
    ctx.addIssue({ code: 'custom', path: ['appearances'], message: '跨书界 NPC 至少有两个出现记录' });
  }
});
```

校验要求：具名 NPC 的 `born/died` 都要登记（未知时用 `kind: 'unknown'`），设施与路人使用 `ageBand`。精确年份必须带来源，小说线索推算必须有范围和“推算”，不确定写“待考”。`crossChapter: true` 时至少有两个 `appearances`，且书界年份与生卒区间不得明显矛盾；改命例外必须引用剧情事实，不能在 schema 中暗改死亡。D1–D5 的招募语义与跨书界能力只增不减由未来 `design/18` 定义。

`SkillInstance` 与残篇记录虽属存档/运行状态，而非内容定义，也必须在 `packages/data` 暴露共享 schema：`sourceGrade: Grade` 与 `sourceCap: 1..10` 分列，且 `sourceGrade ≤ SkillDef.grade`；完整来源初始化为绝对品阶，残承来源取其 `lineageGrade`。这条接口来自 `design/02` §2.2–§2.3；`tech/04` 只校验内容与迁移夹具，存取和成长解释归 `tech/08`、`tech/05`。

### 3.11 JSON Schema 与生成物

`pnpm schema:gen` 从 registry 中枚举每个公开根 schema，并生成：

1. `packages/spec/content/*.schema.json`：跨语言工具契约；
2. `content/.schema/*.schema.json`：带仓库相对 `$ref` 的编辑器镜像；
3. `content/tiled/tianshu.tiled-project` 的 class、enum 与允许属性；
4. `docs/generated/schema/*.md`：字段、必填性、默认值、来源章节；
5. `packages/data/src/generated/content-ids.ts`：从正式内容生成的只读 ID 联合与索引摘要。

Zod 4.6.5 官方支持 `z.toJSONSchema()`；`z.strictObject()` 导出的对象含 `additionalProperties: false`。生成时使用输入视角，使有默认值的字段不被错误标成作者必须填写；构建后 JSON 仍写出默认值，确保运行时不猜测。

CI 连续运行两次生成：第一次写临时目录，第二次比较 hash；再与已提交镜像 diff。任一不同即 `SCHEMA_GENERATED_DRIFT`，说明 schema 或生成器改了但镜像未同步。

---

## 4. 读取、归一化与编译管线

### 4.1 构建阶段与中间表示

| 阶段 | 输入 | 输出 | 失败条件 |
|---|---|---|---|
| 0 `discover` | 内容根与 ignore 规则 | 稳定排序的 `SourceFile[]` | 非法目录、大小写碰撞、弃用物理路径 |
| 1 `parse` | 原始 UTF-8 字节 | AST/CST、值、源位置索引 | 编码、YAML/TMJ/Ink 语法错误 |
| 2 `normalize` | 已解析值 | `NormalizedNode` | 旧字段无法无损迁移、隐式类型、重复键 |
| 3 `shape` | 归一化节点 | Zod output | 缺字段、未知字段、局部约束失败 |
| 4 `register` | 所有合法实体 | `SymbolTable` | ID 格式或唯一性失败 |
| 5 `link` | 实体与符号表 | `RefGraph` | 硬引用缺失、类型不匹配、非法跨界引用 |
| 6 `lint` | 完整图 | 诊断、预算、考据/临时项清单 | 业务规则 error；warning 留报告 |
| 7 `compile` | 已链接内容 | 表达式 AST、`RegionMap`、Ink JSON | 不支持的原语、地图或故事编译失败 |
| 8 `partition` | 编译 IR 与引用图 | common/chapter/region/locale 逻辑分片 | 循环拥有关系、分片越界 |
| 9 `emit` | 逻辑分片 | 规范 JSON、hash、manifest、refs | 输出不确定、预算失败 |

内部表示不携带 YAML 节点对象进入后续阶段，只保留纯 JSON 值和单独的 `SourceSpanMap`。这样打包器不能意外序列化 anchor、注释或解析器私有字段。

```ts
export interface SourceSpan {
  readonly file: string;
  readonly line: number;       // 1-based
  readonly column: number;     // 1-based，Unicode code point 列
  readonly endLine: number;
  readonly endColumn: number;
}

export interface NormalizedNode<T = unknown> {
  readonly kind: string;
  readonly value: T;
  readonly source: SourceSpan;
  readonly pointers: ReadonlyMap<string, SourceSpan>;
  readonly migrations: readonly string[];
}

export interface Diagnostic {
  readonly code: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly primary: SourceSpan;
  readonly related?: readonly { message: string; span: SourceSpan }[];
  readonly hint?: string;
}
```

### 4.2 文件发现与类型判定

类型由“规范目录 + 文件后缀 + 根 `schemaVersion`”共同决定，不能只猜文件名。例如 `common/items/divine.yaml` 是 `ItemDef[]`，`world/regions/*.yaml` 是 `RegionDef`，而同名 `.tmj` 是 Tiled 输入。迁移窗口内仍可识别 `chapters/*/regions/*`，但发布模式按 §2.2 报弃用错误。

发现器执行以下硬规则：

- 跟随的根目录固定，不扫描工作区之外的路径，不接受 `..` 逃逸；
- 路径统一转仓库相对 POSIX 形式，但不改变真实文件名大小写；
- 对 Unicode NFC 归一后相同、仅大小写不同、或 macOS 上会碰撞的路径报错；
- 单个 YAML/Ink/TMJ 源默认上限 2 MiB【建议值】；大地图须拆区域，不以超大文件绕过分片；
- 忽略 `_drafts`、`.schema`、构建缓存、编辑器备份和以 `~` 结尾的文件；
- 只接受 `.yaml`，不同时接纳 `.yml`，减少同义格式；
- 文件首个 schema 注释若存在，必须指向生成镜像的仓库相对路径。

### 4.3 解析与源位置

`yaml` 解析器必须关闭隐式合并与别名，设置别名上限为 0；对每个节点保存 range，经 `LineCounter` 转成行列。Zod issue 的 `path` 转 JSON Pointer 后，在 `SourceSpanMap` 中找最长匹配；因此错误能落到 `moves[2].mpCost` 的值，而不是只指向文件首行。

TMJ 使用标准 `JSON.parse`，并用 Tiled 的 `id`、`name` 与对象 `id` 建立源定位。JSON 标准没有行号 API，工具先建立换行偏移索引；若解析失败，按引擎错误 offset 定位，无法取得 offset 时至少报告文件。

Ink 先由 `inkjs-compiler` 做语法编译，再由本管线扫描声明、标签和外部函数使用。编译器的纯文本错误需规范化成同一 `Diagnostic`，不把不同操作系统绝对路径写进 golden。

### 4.4 归一化边界

归一化只做可逆、已登记的机械操作：

| 输入兼容形态 | 规范输出 | 诊断 |
|---|---|---|
| 旧物理路径 `content/chNN_*/...` | 规范相对路径 | warning / 发布 error |
| 资产简写 `fx_sand_burst` 所引用贴图 | `vfx/sand_burst/default` 等 `tech/06` 规范键 | warning，规则见 `tech/06` §2 |
| 旧 Boss ID `bs_hongantong_...` | 不在源内自动改；要求正式 `bsc_*` + remap | error + fix hint |
| 缺省 `maxLayer`、空数组 | 按 schema 默认展开到输出 | info 可选 |
| CRLF / BOM | 读入时接受，规范输出为 UTF-8 LF | warning |

归一化禁止：把字符串数字变 number、把未知枚举猜成最近值、自动创建缺失 ID、把“待考”删去、按后出现条目覆盖重复 ID。自动修复补丁必须能以 `--fix-dry-run` 查看；CI 永不启用写回。

### 4.5 文本与规则字段拆分

每个 schema 字段在 metadata 中标为四类之一：

| 类别 | 例 | 去向 | 是否进入 `contentHash` |
|---|---|---|---:|
| `rule` | ID、品阶、条件、数值、引用、区域拓扑 | rules 分片 | 是 |
| `text` | `name`、`description`、提示与台词 | locale text 分片 | 否 |
| `assetRef` | `assets.icon`、`anim.vfx` | rules 中保留逻辑键，同时写引用图 | 是（键变更会影响规则加载），不含二进制 hash |
| `authoring` | `canonRef`、审阅备注、来源 URL | 构建报告 / 可选图鉴元数据 | 默认否 |

拆分后的规则对象用 `textKey` 指向文本。例如 `sk_xianglong18.name` 变为 `skill.sk_xianglong18.name`。构建器必须验证每个要求显示的 key 在 `zh-Hans` 存在；其他 locale 缺失可回退并 warning。

字段分类由 schema registry 明示，禁止用“字段名看起来像 text”推断。若某字段既影响机制又显示给玩家，应拆成两个字段，而不是让本地化改变规则。

Ink 是特殊的双产物：每个 locale 的可执行 Story JSON 随文本叶片发布；同时从源语言产物抽取 knot/stitch、divert、变量声明、选择拓扑、命令标签与外部函数为 `DialogueStructureDef`，写入 rules 叶片。只改台词字面量仅改变 `textHash`；任何分支、变量、标签或引用变化都会改变结构摘要与 `contentHash`。构建器必须拒绝“译文结构不同但只更新 textHash”的产物。

### 4.6 表达式和效果原语编译

`design/06` 的 `when`、`amount`、`chance` 等表达式，以及任务/遭遇条件，只接受语法树白名单：字面量、批准的路径读取、算术/比较/布尔运算和白名单纯函数。禁止属性动态索引、赋值、循环、函数声明、正则和任意 JS。

```ts
export type ExprNode =
  | { readonly k: 'num'; readonly v: number }
  | { readonly k: 'bool'; readonly v: boolean }
  | { readonly k: 'path'; readonly p: readonly string[] }
  | { readonly k: 'unary'; readonly op: '!' | '-'; readonly a: ExprNode }
  | { readonly k: 'binary'; readonly op: '+' | '-' | '*' | '/' | '<' | '<=' | '==' | '>=' | '>' | '&&' | '||';
      readonly a: ExprNode; readonly b: ExprNode }
  | { readonly k: 'call'; readonly fn: 'min' | 'max' | 'clamp' | 'floor' | 'ceil' | 'abs';
      readonly args: readonly ExprNode[] };

export interface CompiledExpression {
  readonly source: string;          // 仅 dev 报错用；生产可去除
  readonly ast: ExprNode;
  readonly reads: readonly string[];
}
```

AST 输出键顺序稳定，路径集合排序。除法由运行时在归属乘区规定的取整点处理；表达式编译器不能擅自决定战斗舍入。效果 `op` 必须存在于 `tech/05` 的原语注册表，并按判别联合校验参数；自由文本中的机制关键词只产生提醒，绝不能被自动翻译成规则。

### 4.7 引用图与素材引用图

完整 `RefGraph` 同时服务四件事：引用完整性、增量重建、孤儿报告、素材归包。业务边保留目标类型；素材边输出 `tech/06` 约定的精简格式：

```ts
export interface AssetRefUse {
  readonly chapter: string | null;
  readonly region: string | null;
  readonly by: `${string}:${string}`;
  readonly boss: boolean;
  readonly source: { readonly file: string; readonly pointer: string };
}

export type AssetRefIndex = Readonly<Record<string, readonly AssetRefUse[]>>;
```

输出前，键和使用项分别按 code point、`chapter/region/by/file/pointer` 全序排序。未登记素材键是 error；已登记但无引用由素材管线 warning。内容构建不读取二进制，也不把 `assets.lock.json` 的对象 hash 写进规则对象。

### 4.8 增量缓存

缓存键为：

```text
SHA-256(
  toolVersion + schemaRegistryHash + normalizedSourceBytes
  + sorted(directDependencyContentHashes) + buildFlags
)
```

修改文本只失效对应 locale 与字体用字表；修改区域 TMJ 只失效该区域 map、引用它的遭遇可达性和该区域分片；修改共享 Buff 会沿反向引用重验相关招式、物品、地形和遭遇，并使相关规则分片失效。全量 `validate` 与增量 `validate --changed` 对同一仓库状态必须产生相同 error/warning 集合；CI 每晚用全量结果比对，防缓存漏边。

---

## 5. 内容校验器

### 5.1 CLI 契约

```bash
pnpm content:validate
pnpm content:validate --changed --since origin/main
pnpm content:validate --reporter github
pnpm content:validate --json .cache/content-build/validation.json
pnpm content:validate --draft content/_drafts/job-20260926
pnpm content:build
pnpm content:build --chapter ch01_tianlong --locale zh-Hans
pnpm content:build --emit-refs
pnpm schema:gen
```

退出码：0 = 无 error，1 = 内容错误，2 = 工具/环境错误。warning 默认不改变退出码；生产发布使用 `--warnings-as-errors=release`，只提升已列入发布门禁的警告族。命令输出按文件、行、列、错误码稳定排序，便于 AI 修复与 CI 去重。

### 5.2 校验层级

| 层 | 名称 | 主要检查 | 结果 |
|---:|---|---|---|
| L0 | 环境 | Node/pnpm/依赖锁、Tiled/Ink 编译器版本、生成物版本 | 环境不一致 error |
| L1 | 语法 | UTF-8、YAML/TMJ、Ink 编译、重复键 | error |
| L2 | 结构 | Zod strict、判别联合、范围、默认展开 | error |
| L3 | 身份 | ID 正则、全局唯一、文件名、旧 ID/旧路径 | error / 迁移 warning |
| L4 | 引用 | ID 存在、类型正确、章节拥有关系、无非法循环 | error；非入口孤儿 warning |
| L5 | 设计规则 | 各归属文档的构建规则与封闭名录 | 按来源规则级别 |
| L6 | 地图 | 层、坐标、高度、六邻、门禁、出生区与可达性 | error / 节奏 warning |
| L7 | Ink 与文本 | bridge 白名单、结构同构、key 完整、长度与字体字库 | error / 文案 warning |
| L8 | 数值预算 | 招式、内功、投放、成长锚点、遭遇结构 | error / 偏离 warning |
| L9 | 包预算 | 叶片 256 KiB、书界 1.25/1.5 MiB、对象数量 | warning / hard error |
| L10 | 确定性 | 双构建字节相同、排序、hash、跨平台 golden | error |
| L11 | 发布完整性 | manifest、remap、素材引用、所有 locale 与迁移夹具 | error |

这扩展了 `tech/01` §7.5 的 L1–L9；编号保持前九层语义相容，并把确定性与发布闭合单列。

### 5.3 引用完整性

| 来源字段 | 目标类型 | 关键约束 |
|---|---|---|
| `SkillDef.moves[].buffs[].id`、被动 `buff.id` | `BuffDef` | 目标存在；`inherit` 与定值品阶合法 |
| `SkillDef.learnSources[]`、残承字段 | 书界 / NPC / 物品 / 任务 | `sourceGrade ≤ absGrade`，与 `sourceCap` 分离；现影、书眠、终局不得自动补全残承 |
| `SkillDef.setTags[]` | `SetDef` | C22 双向成员闭合 |
| `Reqs.prereq[].skill`、`LearnSource.ref` | 武功 / NPC / 物品 / 任务 | 类型与来源 kind 相符；前置图无自环 |
| `EquipDef.signature` | `NpcDef` | 缺正式 NPC 表时只 warning，`design/18` 入库后提升为 error |
| `ItemDef.use.effects` | Buff / 武功 / 原语 | 引用存在，原语参数通过判别联合 |
| `TerrainDef.onEnter/onStay` | Buff / 地表状态 | C23 已收录但尚未同步的 ID 给“同步告警”，不误报未知 |
| `RegionObject` | NPC / 遭遇 / 门禁 / 区域 / 任务 | 对象类决定目标类型；传送目标含合法出生点 |
| `EncounterDef` | 区域 / NPC / 模板 / Boss / Buff / 招式 | 全部存在；区域窗口与出生区存在 |
| `QuestStage` | Ink knot / flag / encounter / reward | 图可达，入口与终态存在，奖励类型合法 |
| Ink 标签 | 命令、任务、旗标、NPC、物品 | bridge opcode 白名单；强引用存在 |
| `EraLayerDef` | 区域 / 城市 / 门派 / 资源点 / NPC | 只能覆写全局定义，不得创建隐形对象 |
| `NpcDef.appearances` | 书界 / 区域 | 年代、生卒、跨书界标记一致 |
| `ResourcePointDef.outputs` | `ResourceDef` | 资源存在且时代开放；阶品字段与 ID 一致 |
| 所有素材字段 | `AssetEntry` 逻辑键 | 登记存在且状态允许构建；见 `tech/06`、`tech/07` |

软引用只能用于可选 DLC、尚未生产的素材占位和开发注释，且必须显式 `strength: optional`；不能把关键任务或规则依赖降为 optional 以通过 CI。

### 5.4 设计业务规则汇总

本文不复制规则正文；下表规定“从哪里读取断言、在哪个 pass 实现、诊断如何归类”。归属文档规则变更时，应修改同名测试而不是在本文另发明阈值。

| 来源 | 应实现的规则族 | 实现 pass / 输出 |
|---|---|---|
| `design/02` | 书界 ID/境界、原生投放、压制不变式、天级池与阶段锚点 | `chapter-lint`；封闭名录 error、分布报告 |
| `design/03` | 属性 ID、修饰形态、等级表锚点、标准角色派生输入 | `stat-lint`；未知属性与非法单位 error |
| `design/04` | Z0–Z10 合法挂点、命中/伤害/治疗公式输入与取整契约 | `formula-lint`；公式由共享纯函数调用，不复制 |
| `design/05` §15 V1–V18 | 武功/招式/被动命名、天级闭集、类别、内功、权重、解锁、绝招、套装、来源、原创标注 | `skill-lint`；沿用各规则 error/warning 级别 |
| `design/06` §13 V1–V12 | Buff 标签、修饰位置、反制、表达式上下文、族/DOT 上限、持久化解除、叠加键 | `buff-lint`；AST 与上限报告 |
| `design/07` + C22 | 套装阈值、成员、双向 `setTags`、跨书界压制接口 | `set-lint`；任一方向缺失 error |
| `design/08` §12 V1–V13 | 地形字段、区别度、Buff、品阶、章节、六角坐标/范围、标准 ID | `terrain-lint` |
| `design/08` §6.7 V-G1–V-G9 | qg0–qg5 可达集、主线可达、回安全点、门禁预算/替代解/体力/可读性/六邻 | `reachability-lint`；每区域输出热图与最短证据路径 |
| `design/09` §14 V1–V15 | 遭遇/Boss/合击/阵法/台词 ID、人数、阶段、公平预警、计数单位、出生区 | `encounter-lint`；旧 `bs_*` 直接 error |
| `design/10` §14 V1–V15 | 物品类型、12 神兵闭集、词条/特效、引用、永久投放、商店、装备约束 | `item-lint`；预算与投放报表 |
| `design/13` §11 | 经验锚点、任务经验、天书 28 变体、压制组合、终局、结局完备性、成就/称号 | `progression-lint`；穷举结果与锚点 golden |
| `design/17` §15 S17-V001–V020 | 99 门派、1,386 时代格、L1–L5、来源、关系、候选武学与地图建议状态 | `sect-lint`；pending 与 provisional 分列 |
| AR-03 / 未来 `design/15` | 20 经脉、每脉 6–12 穴、总数 150–200、引用闭合、周天顺序 | `meridian-lint`【建议值】 |
| AR-04 / 未来 `design/11` | 全局区域/城市唯一、时代覆写完备、入口与路线可达 | `world-lint`【建议值】 |
| AR-05–AR-07 / 未来 `design/16` | 四阶九品、资源点产出、家丁槽、营生职位、客卿唯一、L1–L5 月钱档 | `economy-lint`【建议值】 |
| AR-09 / 未来 `design/18` | 生卒证据、D1–D5、书界存在、跨界标记、能力只增不减所需引用 | `npc-lint`【建议值】 |

### 5.5 招式预算检查

计算直接实现 `design/05` §4.2：

```text
expectedPower = AF(tpl) × (1 + Σadj) × K_delivery × K_parry
                − Σcost_buff − Σcost_disp
delta = abs(authoredPower − expectedPower)
```

- `delta ≤ 0.05`：通过；边界用十万分点整数比较，避免二进制浮点误判；
- `delta > 0.05` 且有 `balanceOverride { reason, issue }`：warning 并进入审阅表；
- 超差且无理由：error；
- 支援招、脚本招和归属文档明列的例外走各自预算器，不能借 `kind` 绕过；
- `AF`、冷却/耗内/收招、自损/蓄招/条件、Buff 与位移成本全部从版本化表读取，报告列出每项算式。

```ts
export interface MoveBudgetResult {
  readonly expectedBp: number;  // power × 10_000
  readonly authoredBp: number;
  readonly deltaBp: number;
  readonly terms: readonly { readonly name: string; readonly valueBp: number; readonly source: string }[];
}

export function validateMoveBudget(move: MoveDef, tables: BudgetTables): MoveBudgetResult {
  const result = calculateMoveBudgetBp(move, tables); // 十万分点定点数；实现表来自 design/05 §4.2
  if (result.deltaBp > 500 && !move.balanceOverride) {
    throw new ContentRuleError('SKILL_MOVE_BUDGET', move.id, result);
  }
  return result;
}
```

以 `design/05` 的“震惊百里”核算为 golden：`AF 0.65 × (1 + 0.36 + 0.10) − 0.25 × 0.30 = 0.874`，作者值 0.85，差 0.024 ≤ 0.05，通过。这里复述算式只用于验证器验收，公式解释仍归 `design/05`。

### 5.6 内功贡献预算检查

`design/05` §5.5 的接口为：

```text
IP = mpMaxPct + hpMaxPct + 2 × Σattrs + 5 × mpRegen
```

对每门内功的第 10 重主运贡献：

1. 从绝对品阶读取标准 IP；
2. 计算实际 IP，要求 `abs(actual-standard)/standard ≤ 5%`；
3. `mpMaxPct`、`hpMaxPct`、`Σattrs`、`mpRegen` 各自相对标准分项默认不超过 ±30%；
4. 总预算越界为 warning；若大于 10% 且无 `balanceOverride`，则提升为 error【建议值】；
5. `stats` 不计 IP，另按层属性/被动预算检查，防止双算；
6. 外来压制后的运行值是玩法派生，不回写绝对定义，也不参与作者值校验。

例：玄中标准为 `48.5 = 17 + 10 + 2×7 + 5×1.5`。若作者填 `mpMaxPct=18`、`hpMaxPct=9`、属性合计 7、`mpRegen=1.5`，则实际 `48.5`，恰好通过；报告仍显示各分项偏差供审阅。

### 5.7 地图、剧情与投放的图算法

| 图 | 节点 / 边 | 算法 | 发现的问题 |
|---|---|---|---|
| 区域六角图 | 可站立 `HexPos` / 六邻与门禁状态 | 分 qg0–qg5 BFS/Dijkstra | 门禁泄漏、主线不可达、单向软锁 |
| 区域旅行图 | `rg_*` / 驿路水路与时代开关 | 每时代强连通/可达分析 | 无入口区域、图外专线多端、时代断路 |
| 任务图 | stage / 转移条件 | DFS + 可满足性抽查 | 无入口、无终态、死环、互斥旗标冲突 |
| ID 引用图 | 内容对象 / 强弱引用 | SCC + 反向索引 | 非法循环、孤儿、跨书界泄漏 |
| 门派时代矩阵 | 门派 × 书界 | 完备计数与状态转换检查 | 缺格、非法状态、时代自相矛盾 |
| NPC 时间图 | 人物 × 年代区间 × 出现 | 区间交集 | 生前/死后冲突、跨界漏标 |

可达性状态不仅是位置，还包括 `(moveMode, qgTier, waterRunLeft, relevantGateFlags)`；但旗标只取门禁声明的有限集合，避免状态爆炸。主线替代解分别模拟，隐藏门禁按 `reveal=never` 检查。

### 5.8 诊断码与豁免

诊断码格式为 `TS-CONTENT-<域>-<三位号>`，例如：

| 代码 | 含义 | 默认级别 |
|---|---|---|
| `TS-CONTENT-YAML-001` | YAML 重复键 | error |
| `TS-CONTENT-ID-002` | ID 重复定义 | error |
| `TS-CONTENT-REF-001` | 硬引用不存在 | error |
| `TS-CONTENT-SKL-008` | 招式预算偏差 > 0.05 | error / 有批准理由为 warning |
| `TS-CONTENT-MAP-003` | 主线目标不可达或无安全返回路 | error |
| `TS-CONTENT-INK-004` | locale 结构签名不同 | error |
| `TS-CONTENT-PACK-001` | 单叶片原始 JSON > 256 KiB | error |
| `TS-CONTENT-PROV-001` | provisional schema 仍在使用 | warning；发布报告必须列出 |

error 不允许以行内注释屏蔽。确有设计例外时只能使用该 schema 明列的 `balanceOverride` / `exceptionRef`，并要求非空理由和稳定问题编号；它把“规则偏差”降为 warning，却不能屏蔽语法、重复 ID、缺引用、未知字段、安全或确定性错误。所有豁免集中出现在报告中，防止久而不见。

### 5.9 报告产物

`validation.json` 至少包含工具版本、schema hash、输入摘要、诊断、规则统计、ID/引用统计、包体预算、provisional 数量与耗时；人类报告 `validation.md` 由同一 JSON 渲染。GitHub reporter 用工作流命令标注源行，但 JSON 是唯一机器输出，禁止三个 reporter 各跑一套规则。

每次全量构建还输出：

- `ids.json`：按类型排序的定义位置，不作为运行时注册表；
- `refs.json`：素材引用图；
- `orphans.json`：未被入口引用的内容；
- `research.json`：所有“待考”及其书名/人物/情节核对目标；
- `provisional.json`：所有【建议值】schema 实例；
- `budgets.json`：数值和包体明细；
- `migrations.json`：路径与 ID 迁移链闭合结果。

---

## 6. Tiled 地图管线

### 6.1 编辑契约

锁定 Tiled 1.12.2、正交视图、有限地图。正交格仅是编辑槽：`x→q`、`y→r`；运行时始终为 pointy-top 轴坐标，六邻与 `HexDir 0..5` 见 `design/08` §1.4。固定层如下：

| 层 | 类型 | 内容 |
|---|---|---|
| `terrain` | tile | 每槽一个 `tr_*` |
| `height` | tile | 整数 0–10 |
| `deco` | tile | 装饰与遮挡，不改变规则地形 |
| `objects` | object | `NpcSpawn`、`PlayerSpawn`、`EnemyZone`、`Door`、`Trigger`、`QinggongGate`、`Chest`、`CameraHint`、`BattleArena`、`Building`、`Light` |
| `nav` | tile，可选 | 单向、禁行与轻功覆盖 |

地图属性必须含 `regionId`、`chapterScope`、`eraLayer`【建议值】、`schemaVersion`；对象以 Tiled class 判别，不能靠名称前缀猜类型。旋转只允许转换器明确定义的值；坡面必须给 `rampDir: HexDir`，不从邻格高度猜。

### 6.2 转换与输出

```text
.tmj + tileset + RegionDef → resolve GID → (q,r,h) → objects → validate → chunk → RegionMap
```

`RegionMap` 含 `id`、边界、`terrainTable`、32×32 chunk 索引、对象、`PlayerSpawn` 入口、邻接区域、时代覆写引用、背板素材键及水面语义。每块固定 1,024 槽；边缘空槽用有效位图表示，不制造可行走地形。高度为 `Uint8Array`，地形索引按字典规模选 `Uint8Array/Uint16Array`，均编码为 base64；坡/阶槽显式保存 `rampDir: HexDir`，不能由高度猜测。对象按 `(r,q,id)` 排序。

`Building` 必须含占地包围盒、`interiorRect`、屋顶组与 `cutawayWalls`；`Light` 必须含颜色、半径、强度、挂高、时间表和摇曳标记；`CameraHint` 必须含默认偏航/缩放、边界与旋转许可。`water` 分类记录浅/深、流向及可选岸距；可选 `precomputedAo` 必须能由同一地图输入确定性重建。以上字段是 `tech/02` §2、§3、§4 的消费契约，具体视觉算法仍归 `tech/02`。

转换器检查：层名/类型唯一、每个有效槽有地形与高度、GID 可解析、对象锚点在有效六角、出生区至少有足够可站立格、门与传送双端闭合、遭遇区不越界、战场截取最多 400 槽且 `qSpan/rSpan≤20`。可达性执行 `design/08` V-G1–V-G9。

### 6.3 与渲染衔接

`tech/02` 按 32×32 轴坐标槽构网与合批；管线不输出屏幕坐标、投影顶点或 Three 对象。时代层只改变开放、NPC、势力、资源点与营生状态，不复制基础网格。地图 JSON 仍受 256 KiB 叶片限制；对象过多时按 chunk 归属，跨块对象进入区域 base。

---

## 7. Ink 对话与本地化管线

### 7.1 写作约定

- knot/stitch、变量、外部函数名只用 ASCII；显示文本用简体中文。
- 每个 story 有同名 `.inkmeta.yaml`，声明书界、区域、入口 knot、所读 flags、所发命令与参与 NPC。
- `VAR` 只保存故事局部态；core 事实通过只读查询取得，不镜像成第二份长期状态。
- 标签采用 `#ts:<opcode> key=value`；未知 opcode、重复参数或自由 JSON 均失败。
- 跳转目标静态存在；无出口循环须显式标 `allowLoop` 并设玩家可见退出选项。

### 7.2 core 桥接

允许的查询如 `get_flag`、`quest_stage`、`has_item`、`affinity`；返回 JSON 标量且不消耗 RNG。写操作只产出 `DialogueIntent`（如 `quest/advance`、`party/giveItem`、`battle/start`），由 core `validate` 后提交；Ink 无权直接改 `GameState`。故事创建后立刻用 `world` RNG 覆盖 inkjs 的故事种子，遵守 `tech/01` §8.3 D7。

```ts
export type InkScalar = string | number | boolean | null;
export type DialogueIntent =
  | { readonly op: 'quest/advance'; readonly quest: string; readonly stage: string }
  | { readonly op: 'party/giveItem'; readonly item: string; readonly count: number }
  | { readonly op: 'battle/start'; readonly encounter: string };

export interface InkBridge {
  query(name: 'get_flag' | 'quest_stage' | 'has_item' | 'affinity',
        args: readonly InkScalar[]): InkScalar;
  decodeTag(tag: string, source: SourceSpan): DialogueIntent;
  commit(intent: DialogueIntent): { readonly ok: true } | { readonly ok: false; readonly reason: string };
}
```

`decodeTag` 只解码 schema 已登记的参数，不执行内容；每次 `commit` 都在当下 core 快照重验任务阶段、库存、遭遇与权限，避免“选项出现后状态已变”导致越权。存档保存 inkjs 的 JSON 状态字符串及 `storyId/storyHash`；恢复时先完成内容 remap，再载入同结构 story，结构不兼容则走该故事登记的恢复 knot，并记录迁移告警。

### 7.3 文本抽取与结构校验

源语言编译时为每段与选择生成稳定 key；译文只替换文本。每个 locale 的结构签名为排序后的 `(knot, stitch, choice-key, divert-target, variable, opcode, referenced-id)` 哈希，必须与 zh-Hans 相同。该签名即存档中的 `storyHash`：它进入对应 rules 叶片和 `contentHash`，而不是只随 locale Story JSON 进入 `textHash`。校验还覆盖：文本 key 唯一/完整、占位符集合一致、空选择、不可达 knot、外部函数白名单、任务/NPC 引用、禁用 HTML、字体缺字。繁体按 `tech/01` §6.8 经 OpenCC 后叠加人工 override，再编译；运行时不携带 OpenCC。

---

## 8. 书界包、哈希与增量更新

### 8.1 分片命名与清单

稳定逻辑名如下；若单片超过 256 KiB 原始 UTF-8 JSON，再产生 `.<pNNN>.json` 叶片，由同名索引按顺序列出：

- `chNN.rules.base.json`、`chNN.rules.rg_<id>.json`；
- `chNN.text.<locale>.base.json`、`chNN.text.<locale>.rg_<id>.json`；
- `DialogueStructureDef` 随其区域 rules 分片；各 locale 的可执行 Ink Story JSON 随文本分片，跨区域主线归 base；
- `common.rules.base.json` 与 `common.text.<locale>.json` 独立常驻。

manifest 记录格式版本、书界、依赖、每片逻辑名、原始/压缩字节、SHA-256、区域和加载策略。物理 URL 可带短 hash，但存档永远不保存 URL。

```ts
export interface ChapterPackManifest {
  readonly format: 1;
  readonly chapter: string;
  readonly schemaHash: string;
  readonly contentHash: string;
  readonly textHashes: Readonly<Record<string, string>>;
  readonly releaseHash: string;
  readonly idRemaps: readonly { from: string; to: string; since: string }[];
  readonly leaves: readonly {
    logicalName: string;
    kind: 'rules' | 'text';
    locale?: string;
    region?: string;
    rawBytes: number;
    gzipBytes: number;
    sha256: string;
    load: 'resident' | 'chapter' | 'region';
  }[];
}
```

manifest 自身也是 strict schema；`leaves` 以 `logicalName` 全序排序，逻辑名与 hash 均不得重复，`kind: 'text'` 必须有 locale，`kind: 'rules'` 禁止 locale。

### 8.2 规范序列化与 contentHash

规范 JSON 使用 UTF-8、无 BOM、LF、对象键按 code point 递归排序、数组保持 schema 语义顺序、有限 JSON number、无多余空白。禁止时间戳、绝对路径、机器名与构建耗时进入哈希输入。

```text
leafHash     = SHA-256(canonical uncompressed leaf bytes)
contentHash  = SHA-256("tianshu-content-v1\n" + ordered rule logicalName + "\0" + leafHash)
textHash     = SHA-256(locale + ordered text logicalName + "\0" + leafHash)
releaseHash  = SHA-256(canonical manifest excluding releaseHash/signature)
```

`contentHash` 覆盖当前可加载的 common + 当前书界规则、Ink `DialogueStructureDef` 及 `idRemaps`，不含字面文本、压缩字节和 `assets.lock.json`。因此改错别字不触发存档修复；改变 Ink 分支/变量/标签、普通规则或素材逻辑键则触发。

### 8.3 解析边界

HTTP `Content-Encoding` 通常由浏览器透明解压；离线预压缩容器由 `io.worker` 解压并校验 hash，再以 Transferable `ArrayBuffer` 交主线程。Worker 内优先使用支持 `gzip` 的 `DecompressionStream` 与支持 `SHA-256` 的 `crypto.subtle.digest()`；二者可在 Web Worker 使用，前者自 2023-05 起进入 MDN Baseline，能力缺失时回退构建时已选定的 JS 解压/哈希实现。Worker 不 parse 后回传对象。主线程在书眠/区域加载遮罩内顺序解析；游戏进行中只在 IdleQueue 解析，单次原始 JSON **≤256 KiB**，解析后立即释放字符串与 buffer。启用 core Worker 模式时规则在 core Worker 内解析，主线程仅解析文本。

### 8.4 P4 体积估算与门禁

以单个成熟书界的规划上界作模型（不是现有实测）：

| 类别 | 原始 JSON【建议值】 | gzip 假设 | gzip 估算 |
|---|---:|---:|---:|
| 规则 base | 1,600 KiB | 25% | 400 KiB |
| 12 个区域规则 | 12×160 = 1,920 KiB | 25% | 480 KiB |
| 文本 base | 180 KiB | 32% | 58 KiB |
| 12 个区域文本/Ink | 12×24 = 288 KiB | 35% | 101 KiB |
| 合计 | 3,988 KiB | — | **1,039 KiB** |
| 加 25% 余量 | — | — | **1,299 KiB ≈ 1.27 MiB** |

故维持 `tech/01` 的 1.5 MiB gzip 硬门槛：≥1.25 MiB warning，>1.5 MiB error；任一原始叶片 >256 KiB error。压缩率与“12 区域”都是【建议值】且**（待实测）**，首个完整天龙纵切片必须记录实值；素材、字体、语音、CG 不计此预算，归 `tech/03`/`tech/06`。

### 8.5 增量更新与回滚

客户端比较逻辑名与 leaf hash，只下载变化叶片；先写临时 Cache，再验证全部 hash，最后原子切 manifest 指针。失败保留旧完整版本。新规则加载成功后才更新 `GameState.meta.contentHash`；哈希不同按 §2.6 执行迁移。Service Worker 缓存键包含 `releaseHash`，保留当前与上一完整版本，删除策略归 `tech/06`。

素材独立通过 `assets.lock.json` 锁定；`content:build --emit-refs` 只把逻辑键引用图交给素材归包。内容更新与素材更新可各自增量，但发布 manifest 必须指向彼此兼容的版本。

---

## 9. AI 辅助内容生产的入库闭环

```text
任务规格 → 结构化生成 → _drafts → draft validate → 人工事实/玩法审阅
       → promote dry-run → 正式目录 → full validate/build → PR/发布
```

这与 `tech/01` §9.2、`tech/08` 的离线内容生产一致。每个草稿附 `provenance.json`：任务、模型/版本（可得时）、生成时间、输入文档锚点、目标 schema、人工审核者与决定；不得存密钥或整段版权原文。

`content:validate --draft` 允许临时引用同一 job 内对象，但仍禁止重复正式 ID。人工审核至少确认：原著事实/待考/原创标注、无杜撰引文回目、数值算式、叙事连贯、敏感内容、素材许可引用。批准后 `content:promote --job <id> --dry-run` 展示目标和冲突；`--apply` 只移动批准文件并生成审计记录，绝不覆盖既有正式文件。通过校验不等于事实正确或可发布。

---

## 10. 开发工作流与热更新

1. 先查 ID 注册表与归属章节；新增或修改 schema 时先写正反夹具。
2. 编辑 YAML/Ink/TMJ，保存即跑受影响图；失败时 Vite 遮罩显示源行，游戏继续使用上一份成功内容。
3. `pnpm content:validate --changed` 做快速反馈，完成前跑全量 `pnpm check`。
4. `pnpm content:build --emit-refs` 生成包、预算与素材引用图；双构建检查确定性。
5. 内容 HMR 只在开发模式存在；删 ID 或结构变化要求重载存档夹具，不能热替换掩盖迁移问题。

同一 ID 的热更新以事务交换整个不可变 registry；当前战斗使用开战快照，不在行动中途换规则。地图改变时仅在非战斗态重挂当前区域；战斗中保存更新提示，退出战斗再应用。

---

## 11. 测试与 CI

| 测试层 | 样例 | 门禁 |
|---|---|---|
| schema 单测 | 每根 schema 至少 1 正例、未知键/边界/错前缀反例 | 必须 |
| parser golden | YAML 行列、TMJ、Ink 错误在不同 OS 稳定 | 必须 |
| 属性测试 | ID/remap DAG、规范 JSON、随机对象 round-trip | 必须 |
| 业务 golden | `design/05/06/08/09/10/13` 列出的精确用例 | 必须 |
| 地图夹具 | 六邻、门禁泄漏、单向软锁、32×32 边界 | 必须 |
| Ink 夹具 | 结构签名、非法 opcode、占位符差异、死链 | 必须 |
| 包体/确定性 | 双构建逐字节相同；叶片与总包预算 | 必须 |
| 兼容 | 每个发布 hash 的存档经结构迁移 + remap 后加载 | 必须 |
| 真机 | 256 KiB 解析、区域切换峰值与无长任务 | **（待实测）** |

PR CI 跑全量 validate、schema drift、单元测试和指定书界构建；夜间任务构建全部书界、跑数值模拟与跨引擎录像。仅 Markdown 改动可跳内容构建，但本文件本身不证明实现已存在。

---

## 12. MVP 与演进

| 阶段 | 范围 | 验收 |
|---|---|---|
| Phase 0 | schema registry、YAML 位置、ID/ref、Tiled 单图、规范 JSON | 一张 32×32+ 高度地图可构建；双构建相同 |
| Phase 1 | 序章内容、Ink bridge、规则/文本分片、基础 remap | 序章完整通过；叶片 ≤256 KiB；旧档夹具可读 |
| Phase 2 | 天龙 2–3 区域、区域懒加载、时代层接口、素材 refs | 手机区域切换无阻断；包预算有实测 |
| Phase 3 | AI 草稿/promote、全业务 lint、经营/经脉/NPC 正式 schema | 人工审核链可审计；provisional 清单收敛 |
| Phase 4+ | 十四书界量产、多 locale、兼容窗口治理 | 每书界可独立增量、回滚、迁移 |

---

## 13. 风险与对策

| 风险 | 概率/影响 | 对策 |
|---|---|---|
| schema 与设计稿漂移 | 高/高 | 字段 metadata 回链章节；generated drift + 归属审阅 |
| 全局区域 ID 尚未定稿 | 高/高 | provisional + 显式迁移，不自动去书界号 |
| 规则/文本误分导致哈希漏变 | 中/高 | schema 显式分类；变异测试验证每个 rule 字段改变 hash |
| ID remap 链腐化 | 中/高 | DAG、目标存在、存档夹具、发布后记录不可改 |
| Tiled 编辑坐标被误作方格 | 中/高 | 转换 golden 强制六邻与轴坐标；禁止方格距离字段 |
| Ink 越权改状态 | 中/高 | 查询/意图白名单，core 二次校验，禁任意 JS |
| 首个完整书界超 1.5 MiB | 中/中 | 1.25 MiB 预警、区域细分、去 authoring 字段；实测校准 |
| AI 生成“格式正确的幻觉” | 高/高 | 草稿隔离、来源/原创结构字段、人工批准，无自动覆盖 |
| 增量缓存漏依赖 | 中/高 | 反向引用图；夜间全量与增量结果比对 |
| 运行时重复驻留 | 中/高 | Worker 只解压，Transferable，解析后释 buffer，UI `markRaw` |

---

## 14. 参考资料

以下均于 **2026-09-26** 访问：

1. Zod 4 API（`z.strictObject`）：<https://zod.dev/api>
2. Zod JSON Schema（`z.toJSONSchema`、input/output 与 `additionalProperties`）：<https://zod.dev/json-schema>
3. npm registry：Zod 4.6.5（MIT）：<https://registry.npmjs.org/zod/latest>
4. YAML 官方文档（`parseDocument`、`LineCounter`、源 token）：<https://eemeli.org/yaml/>
5. npm registry：yaml 2.9.1（ISC）：<https://registry.npmjs.org/yaml/latest>
6. Tiled JSON Map Format：<https://doc.mapeditor.org/en/stable/reference/json-map-format/>
7. Tiled Custom Properties：<https://doc.mapeditor.org/en/stable/manual/custom-properties/>
8. Tiled 1.12.2 发布说明：<https://www.mapeditor.org/2026/05/27/tiled-1-12-2-released.html>
9. Ink 官方 Web Tutorial：<https://www.inklestudios.com/ink/web-tutorial/>
10. inkjs v2.4.0 与 npm 元数据（MIT）：<https://github.com/y-lohse/inkjs/releases/tag/v2.4.0>；<https://registry.npmjs.org/inkjs/latest>
11. MDN `DecompressionStream`：<https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream>
12. MDN `SubtleCrypto.digest()`：<https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest>
13. RFC 8785, JSON Canonicalization Scheme：<https://www.rfc-editor.org/rfc/rfc8785>

版本/API 已联网核实；包体压缩率、手机解析时延、Tiled 编辑体验与真机内存仍需按 §11 **（待实测）**。

---

## 15. 本文新增术语/约定

| 术语 | 约定 |
|---|---|
| 正式内容源 | `content/` 中除 `_drafts`、生成镜像和缓存外、参与生产构建的 YAML/Ink/TMJ |
| schema registry | `packages/data/src/schemas` 中公开根 schema、内容类型、字段分类与版本的唯一登记 |
| 规范 JSON | 按 §8.2 规则确定性序列化的未压缩 UTF-8 JSON |
| 规则叶片 | 单次解析、原始 JSON ≤256 KiB 的最小规则下载/缓存单元 |
| `contentHash` | common + 当前书界规则叶片与 remap 的确定性摘要；不含文本或资产二进制 |
| `textHash` | 某 locale 文本叶片的确定性摘要 |
| `releaseHash` | 发布 manifest 的确定性摘要，绑定规则、文本与兼容元数据 |
| provisional schema | 上游归属文档未定稿时的显式接口占位；所有值为【建议值】并进入报告 |
| promote | 经人工批准，把隔离草稿移动到正式目录并跑全量门禁的动作 |

本文没有新增确定的游戏内容 ID；示例 `since` hash 仅示格式。诊断码、manifest 名和 schema 状态是技术约定，不是游戏世界 ID。

---

## 16. 待决事项 / 依赖

### 16.1 已解决与替下游给出的建议值

- **已解决：tech/01 P4**。规则/文本按 base + region 切片，原始叶片 ≤256 KiB；典型模型 1.27 MiB（含余量），1.5 MiB 为硬门槛（见 §8）。
- **已解决：C18**。跨语言静态契约唯一根为 `packages/spec/`；内容 Zod 仍在 `packages/data/src/schemas/`（见 §3.1）。
- 【建议值】源文件 2 MiB 上限、IP 偏差 >10% 提升 error、P4 的区域数/压缩率、所有 provisional schema 字段，待对应归属文档或实测替换。

### 16.2 本文依赖的上游事实

- `design/11` 须定稿全局 `rg_*`、`city_*`、时代层与路线；当前只保证可迁移形状。
- `design/12` 须定稿任务/NPC/门派玩法字段；`design/15`、`design/16`、`design/18` 须替换对应 provisional schema。
- `tech/05` 须提供效果原语、表达式上下文和内容 registry 的运行时消费者。
- `tech/06`/`tech/07` 继续拥有素材清单、登记字段与二进制；本文只输出引用图。

### 16.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| E1-P01 | 基准 §12 的区域格式由仅 `rg_<书界序号>_<拼音>` 扩为全局 `rg_<拼音>`，旧 ID 经 remap 迁移 | AR-04 已覆盖为共享大地图；需保留旧式直到 `design/11` 给出映射 |
| E1-P02 | 基准 §19 登记三哈希域与原始 JSON 叶片 ≤256 KiB | 避免文本改动触发存档修复，并把 `tech/03` 解析终值变成发布门禁 |

### 16.4 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| O1 | 首个完整书界的真实压缩率和区域数是否符合 P4 模型？ | 先按 §8.4 门禁；天龙纵切片后以实测更新，但不放宽 1.5 MiB |
| O2 | provisional schema 何时升正式？ | 对应设计文档通过审校后，在下一次 schema 版本升级中转正并补迁移 |
| O3 | ID remap 支持窗口多长？ | 单人项目默认永久保留所有已发布映射；仅在明确废弃旧存档版本时压缩 |
| O4 | 是否采用 RFC 8785 实现规范 JSON？ | 默认采用其对象键/数字规范；若现成实现体积不合适，工具端自实现并以 RFC 向量测试，运行时不携带 |

真机解析耗时、内存峰值及 Tiled 热更 ≤1 秒仍为**（待实测）**；技术版本与上述 API 已于参考资料所列日期联网核实。

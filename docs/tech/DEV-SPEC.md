# DEV-SPEC · 代码开发规格索引

> 用途：给接手开发的 agent 一页总入口。本文**只做索引和约束汇总**，不重定义规则；数值、公式、字段以下面指向的设计文档和 schema 为准。
> 版本：v1（2026-10-04，协调者整理）。新增 / 改动规则时，先改归属文档与 schema，再回这里补一行指针。

## 0. 先读什么、听谁的

| 顺序 | 文件 | 作用 |
|---|---|---|
| 1 | `CLAUDE.md`、`AGENTS.md` | 分层、依赖方向、门禁、启动与恢复命令、执行器分工 |
| 2 | `docs/decisions/author-requirements.md`（AR-xx） | 作者新增需求原话 + 完成状态速查；**最高优先级** |
| 3 | `docs/decisions/author-decisions.md`、`rulings-v1.md`、`canon-proposals-v1.2.md`、`ultimate-counts-tianzhong-dizhong.md` | 作者裁决、规则裁定、正典提案、绝招数 |
| 4 | `docs/00-canon.md` | 世界观与数值正典（境界、品阶、属性 ID、乘区） |
| 5 | `docs/design/*.md`、`docs/tech/*.md` | 各系统归属文档（下文逐项列出） |
| 6 | `TODO.md` | 当前进度、待办、恢复命令 |

事实优先级：**作者决定 / AR > `00-canon` > `rulings-v1` > 归属文档**。冲突时按此裁决，并在提交说明里写依据（AR 号或章节号）。

硬规矩：
- 数据驱动，schema 即文档：武学、NPC、物品、任务不得硬编码进规则代码。
- 小步提交，按路径 `git add`；交付前跑 `pnpm check`（lint + typecheck + test + 内容校验 + 包体预算）。
- 性能门禁由 `pnpm check:perf` 单独跑（机器负载低时），见 `CLAUDE.md`「性能规则」；**禁止**在任何测试里加「高负载跳过 / 放宽」逻辑。
- 不改 `assets/default/` 下的文件（素材由出图线负责）；代码缺图用同尺寸占位。

---

## 1. Runtime 架构

### 1.1 规范位置
- `docs/tech/01-architecture.md`：monorepo、包边界、Worker Host、消息协议、lefthook。
- `docs/tech/03-mobile-performance.md`：帧预算、内存、分包、低端机策略。
- `docs/tech/04-data-pipeline.md`：YAML → 校验 → 内容包 → 运行时加载。
- `docs/tech/05-gameplay-engine.md`：core 状态机、命令 / 事件、确定性、回放。
- `docs/tech/08-backend-and-online.md`：联机、存档同步（后期）。
- `docs/tech/09-roadmap.md`：里程碑。

### 1.2 包与依赖方向
`shared ← data ← core`；`platform`、`render`、`ui` 只依赖允许的左侧公开边界；`apps/game` 负责装配。工具链是 pnpm + Vite + Vue 3 + Pinia + Three.js + Zod。

| 包 | 路径 | 职责 | 禁止 |
|---|---|---|---|
| shared | `packages/shared/src` | ID、整数工具、规范 JSON | 业务规则、平台 API |
| data | `packages/data/src` | Zod schema（`schemas/`）、内容包格式、加载（`loader.ts`、`registry.ts`、`content-index.ts`、`remap.ts`）、构建（`build/`） | 规则结算 |
| core | `packages/core/src` | 唯一玩法权威。子目录：`api` `command` `event` `state` `rng` `replay` `battle` `hex` `buff` `ai` `dialogue` `economy` `entries` `npc` `progression` `quest` `world` | DOM、网络、存储、墙钟、`Math.random`、反向依赖表现层 |
| platform | `packages/platform/src` | 存储（`storage/`）、输入、音频、CoreHost 端口 | 玩法判断 |
| render | `packages/render/src` | Three.js 表现层 | 伤害、寻路、可达性重算 |
| ui | `packages/ui` | Vue 通用组件，只消费投影、发命令意图 | 直接改 `GameState` |
| apps/game | `apps/game/src` | 装配与发布 | 成为第二个规则层 |

### 1.3 apps/game 运行时关键文件
- 宿主与通信：`core-host.ts`、`core-worker.ts`、`runtime/worker-host*`、`runtime/core-dispatch*`、`runtime/core-session*`、`runtime/lazy-session*`。core 默认跑在 Worker 里，保留主线程回退；消息只传可序列化的命令、事件和投影。
- 启动与内容：`runtime/bootstrap*`、`runtime/content-*`、`runtime/item-adapter*`。
- 主循环与投影：`loop.ts`、`projection.ts`、`game-controller.ts`、`render-host.ts`。
- 战斗装配：`battle/`，包括 `BattlePage.vue`、`controller`、`encounter`、`model-selection`、`presentation`、`queries`、`runtime`、`unit-label`、`vfx`。
- 构建插件：`apps/game/build/`，包括 `asset-manifest`、`battle-model-assets`、`content-plugin`、`copied-assets`、`offline-closure`、`size-groups-plugin`。

### 1.4 门禁
- 包体预算：`tools/perf/budgets.json`，由 `check_size.mjs` 按 Vite manifest 计算。现状：session chunk 94.9 KiB，目标 ≤ 92（ENG-render-diet 进行中）；render 179.42 / 180 KiB；render-model3d 24 KiB。
- CPU 门禁（`pnpm check:perf`）：
  - rig 100 角色：程序步态 P95 < 0.80 ms，片段模式 P95 < 1.0 ms（AR-37）；
  - BattleSession：2000 步 ≤ 2000 ms，且 ≤ 1000 步耗时 × 3；
  - 自动战斗：20 回合单次 ≤ 20 ms；
  - 存储：1 MiB 快照读、写各 < 50 ms。
  - 来源：AR-33、AR-64。
- 确定性：core 只用 `core/rng` 的种子随机数，整数和 bp 运算；改 core 必须补确定性测试或 golden 测试。

---

## 2. 渲染引擎

### 2.1 规范位置
- `docs/tech/02-rendering.md`：技术选型、相机、光照、画质档、draw call 预算。
- `docs/tech/09-character-rig.md`：角色骨骼、片段、实例化、换装。
- `docs/design/23-projection-vfx-pipeline.md`：投影与特效管线。
- `docs/design/26-immersive-ui.md`：沉浸式 UI。

### 2.2 技术选择（已定）
- Three.js，render 作为独立懒加载 chunk。
- 角色：glTF（Tripo 生成并绑骨），按 manifest 重定向，实例缓冲批量绘制；缺模型时用程序化占位 rig。
- 纹理与压缩：KTX2（UASTC / ETC1S）、glTF-Transform，见 `docs/tech/06` §5。
- 热路径不按帧分配内存；资源生命周期显式管理（`core/context-guard.ts`）；帧统计见 `frame-stats.ts`。

### 2.3 代码位置（`packages/render/src`）

| 目录 | 内容 |
|---|---|
| `battle/` | `hex-layer`（六角格层）、`model-stage`、`scene`、`types` |
| `rig/` | `batch`、`character`、`clip*`、`equipment`、`gait`、`instance-buffer`、`manifest`、`placeholder`、`project`、`runtime`、`scene`；性能门禁在 `performance.test.ts` |
| `gltf/` | `load`、`mapping`、`materials`、`retarget`、`pilot-scene` |
| `camera/` `lighting/` `quality/` | 相机、光照、画质档 |
| `region/` `town/` `worldmap/` | 区域、城镇、大地图场景 |
| `vfx/` | 招式特效（按 design/23 的投影事件驱动） |
| `core/` | `context-guard.ts`、`frame-stats.ts` |

改渲染时要记录 draw call 和帧时间；render 只读投影，不重算规则。

---

## 3. 战斗引擎

全部规则在 `packages/core/src/battle`，表现层只消费事件。总入口是 `battle/index.ts`；会话在 `session.ts`；类型在 `types.ts`。

| 计算 | 规范（归属文档 · 章节） | 代码 | 依据 AR |
|---|---|---|---|
| 遭遇、开战、阵型 | design/09 §2；schema `encounter.ts` | `battle/encounter/`、`battle/formation/` | — |
| **行动计算**：集气时间轴 CT、行动经济、候选行动 | design/09 §3（CT）、§4（行动经济）、§13 | `battle/timeline/`、`battle/action/`、`battle/candidate.ts` | AR-12 |
| 六角格范围、射程、寻路 | design/09 §5；design/08（地形与轻功） | `battle/geometry/`、`core/hex/`（`line`、`pathfinding`） | — |
| **内力运行计算**：经脉河流模型、整数公式、卡住与胀损、调息 | design/21 §2、§3、§10、§11、§12；design/15（经脉与穴道） | `battle/meridian-flow/`（`math.ts`、`runtime.ts`、`gather.ts`、`types.ts`；golden 测试 `meridian-flow*.golden.test.ts`） | AR-14–18、AR-27（protocol 4） |
| **招式计算**：招式数据、层数、路线加成、绝招 | design/05 §3、§4、§6；design/21 §4、§5；绝招数 `decisions/ultimate-counts-*.md` | `battle/action/`、`battle/script/` | AR-19 |
| **攻击判定**：Z0 命中 / 闪避 / 方位 | design/04 §3（`judge`，含 §3.5《长生诀》Z0-CS） | `battle/damage/formula.ts` | — |
| **伤害乘区** Z1–Z10：基础、防御、增伤、减伤、资质与相性、暴击、方位与地形、境界差、招架、浮动 | design/04 §4 | `battle/damage/formula.ts`、`meridian-effects.ts` | AR-27 |
| **格挡 / 招架 / 反应**：Z9 招架、反击、防守招式窗口 | design/04 §4.9；design/09 §6；design/21 §4.5、§4.7 | `battle/reaction/`、`battle/damage/formula.ts` | — |
| **内力外放**：外放加持、经脉运转系数、外放抵消（护体内劲） | design/21 §4.4.1、§4.4.4、§4.8 | `battle/meridian-flow/runtime.ts`、`battle/damage/` | AR-16、AR-19、AR-27 |
| **内力入体**：透劲入体、消化与逆流 | design/21 §4.4.3；招式字段 `penetratingQi`、`pierceInBp`、`hitZone` | `battle/damage/settlement.ts`、`battle/meridian-flow/` | AR-19 |
| 周天暴击、完整 / 不完整运气 | design/21 §4.4.2 | `battle/meridian-flow/` | AR-19 |
| **中毒 / 蛊 / DOT / 受制** | design/06 §9（蛊毒专章）、§6（Buff DSL）；design/04 §6.5（DOT / HOT） | `core/buff/`、`battle/damage/settlement.ts`、`battle/action/`；道具解毒在 `core/economy/consumables.ts` | — |
| 伤害后结算：护体、气血、吸血、吸内、反震、治疗、护盾 | design/04 §6 | `battle/damage/settlement.ts` | — |
| 多段、溅射、连锁、合击、代价型武学 | design/04 §7；design/21 §4.5 | `battle/damage/`、`battle/action/` | — |
| Buff 叠加、持续、驱散、免疫 | design/06 §4、§5、§7 | `core/buff/` | — |
| AI | design/09 §8；design/21 §13 | `core/ai/` | — |
| 奖励、难度、失败保护 | design/09 §11、§12 | `battle/rewards/` | — |
| 属性与成长 | design/03 | `core/progression/` | — |

实现约束：
- 全部整数和 bp 运算（1 bp = 0.01%），取整点按 design/04 §1.3；快照顺序按 §1.4。
- 每个公式改动要配 golden 或数值算例测试（design/21 §14、§17；design/04 各节测试用例）。
- 预测与真实结算共用同一个函数（design/04 §5），UI 预览不另写公式。
- 战斗事件是投影给 render / vfx 的唯一来源（design/23）。

---

## 4. 素材

### 4.1 规范位置
- `assets/README.md`：manifest 字段、ID 前缀、目录约定（**以它为准**）。
- `docs/tech/06-asset-storage.md`：素材键、清单、分包、格式、缓存、占位回退（§3、§4、§5、§11）。
- `docs/tech/07-asset-generation.md`：出图管线、ID 前缀（§1.4）。
- `assets/default/STYLE.md`：画风。
- 出图队列和提示词：`assets/default/prompts/INDEX.md`（物品、地图、角色部件）、`assets/default/prompts/characters/INDEX.md`（人物立绘）。
- 衣物设定：`docs/design/27-apparel-by-dynasty.md`。

### 4.2 图片（`assets/default/<类别>/`，每个目录一份 `manifest.yaml`）

| 类别 | 路径约定 | 说明 |
|---|---|---|
| 人物立绘 | `character/<male\|female>/chNN/por_<npc_id>__<chNN>_<年龄段>[_<场景>]_base.png` | 每人每章一张 base，场景立绘对齐 base |
| 作者已审基线 | `baseline/character/<gender>/ref_<npc_id>__chNN_base01.png` | 只读参考，出图线维护 |
| 头像 | `portrait/<npc_id>/…`，索引 `portrait/index.json` | |
| 物品 | `item/<类>/<id>.png`；内容里写成素材键 `item/<名>` | 例：`assets: {icon: item/bailagan}` |
| 建筑、贴片、地图 | `building-map/<kit>/`、`tile/<kit>/`、`map/`（`kit`、`tiles`、`regions`、`composed`） | |
| 场景插图 | `scene/` | |
| 角色部件 | `rig/<set>/` | |
| 城镇、UI、特效 | `town/`、`ui/`、`vfx/` | |

规则：
- ID 前缀：`ref_`、`por_`、`bld_`、`vfx_`、`ico_`、`map_` 等，见 tech/07 §1.4。
- manifest 必填字段：`id`、`file`、`category`、`style`、`subject`、`prompt`、`negative`、`status` 等。
- 构建时把 `status ≠ rejected` 的条目复制到 `apps/game/public/assets/default/…`，保持相对路径。运行时按素材键和清单读取；图片不 import 进 JS bundle。

### 4.3 3D 模型（`assets/default/model3d/<npc_id>__<chNN>_<年龄段>/`）

| 文件 | 内容 |
|---|---|
| `model_rig.glb` | 绑骨模型（Tripo 生成、Tripo 绑骨，A 字姿态） |
| `anim_idle_walk_run.glb` | 待机 / 走 / 跑片段（如有） |
| `preview.png` | 预览图 |
| `manifest.yaml` | `id`（例 `npc_aqing__ch00_youth__model_rig`）、`tool`、`model_version`、`tripo_model`（project_id、操作号、替换记录）、头身比测量、来源立绘 |
| `source/` | 生成用的 A 字图等源文件 |

- 工具：`.claude/skills/tripo-web/SKILL.md`、`tools/model3d/tripo_web.js`；后处理脚本 `stretch_apose.py`、`measure_heads.py`、`fix_anim_offset.py`。
- 代码侧：`apps/game/build/battle-model-assets` 负责收集，`packages/render/src/gltf` 负责加载和重定向。没有模型的角色用程序化占位 rig。

### 4.4 存储
- 二进制素材走 Git LFS（`.gitattributes` 共 11 条规则）。远端默认分支是 `claude/jinyong-online-game-design-jko1v9`。

---

## 5. 内容（数据、描述、图片引用、参数）

### 5.1 总规则
- 数据文件放 `content/`，YAML，每个文件开头写 `schemaVersion`，`id` 用前缀加小写下划线。
- schema 在 `packages/data/src/schemas/`，**schema 即文档**：加字段先改 schema 和对应设计文档，再改数据。
- 改完跑 `pnpm check` 里的内容校验。
- 图片引用一律写**素材键**（相对 `assets/default/`、不带扩展名，例如 `item/bailagan`），不写绝对路径。人物立绘和模型按 §4 的路径约定，由 `npc_id` 推导，不需要在数据里重复写。
- 来源标注：`origin`，取值 `canon`、`expanded`、`canonExpanded`、`fictional` 等，按各 schema 的枚举。原著出处写 `canonRef` 或 `sourceWorks`。原著能定的照原著（AR-63），先查原文再写。
- 描述文本放 `text.desc` 一类字段。不确定的写「待考」，不要编造。

### 5.2 人物（NPC）
- schema：`packages/data/src/schemas/character.ts`（`npc.v1`）、`role-slot.ts`。
- 数据：`content/chapters/<chNN_*>/npcs/npc_<名>.yaml`；章节角色位在 `roles/`。
- 规范：design/03（属性）、design/18（NPC 与同伴）、`assets/default/prompts/characters/INDEX.md`（外观与出图档位）。

| 参数组 | schema 字段 | 现状 |
|---|---|---|
| 身份 | `identity`（`name`、`aliases`、`origin`、`species`、`gender`、`sourceWorks`） | 已有 |
| 生卒与出场 | `lifespan`、`appearances[]`（`chapterId`、`years`、`displayName`、`presenceMode`、`combatEligible`、`ageBand`、`sects`、`location`） | 已有 |
| 关系 | `bonds`、`crossBook` | 已有 |
| 战力档 | `cultivationBand`、`innate`（资质）、`build`、`ai` | 字段已有，多数人物待填 |
| 招募 | `recruitment`、`role` | 字段已有 |
| 表现 | `portrayal`、`pipeline`、`productionTier` | 字段已有；神态规则见 AR-69 |
| 生成策略 | `seedPolicy` | 已有 |
| **待定义**（作者确认后加进 schema） | 招牌武学列表、默认装备、体型（身高 / 头身比，对齐 model3d manifest 的测量值）、配音 | 空 |

### 5.3 物品
- schema：`packages/data/src/schemas/item.ts`（`item.v1`）、`catalog.ts`、`catalog-extract.ts`。
- 数据：`content/items/eq_*.yaml`（约 1600 条）、`content/common/items/`、`content/common/sets/`（套装）、`content/common/economy/`。
- 规范：design/10（物品与装备）、design/07（套装）、design/27（按朝代分的衣物）。

| 参数组 | schema 字段 | 现状 |
|---|---|---|
| 基本 | `id`、`name`、`kind`、`sub`、`grade`、`stack`、`chapters`、`origin`、`canonRef`、`price`、`flags` | 已有 |
| 图片 | `assets.icon`（素材键） | 已有；衣物图 565 张待出（TODO §3） |
| 描述 | `text.desc` | 已有 |
| 效果与使用 | `effects`、`action`、`battleLimit`、`perBattle`、`targetKind`、`context` | 已有 |
| 武器、护具 | `hands`、`family`、`matFamily`、`gradeUp`、`costReduceBp`、`fluxFlat` | 已有 |
| 制作、鉴定 | `craft`、`appraise`、`ingredientKind`、`herbFamily`、`ageYears` | 已有 |
| 剧情 | `chapterBound`、`giftTo`、`divine` | 已有 |
| **待定义** | 衣物的朝代 / 身份档（design/27）、外观换装槽（对齐 render `rig/equipment`） | 空 |

### 5.4 外功（招式类武学：拳掌、兵器、暗器、轻功）
- schema：`martial-art.ts`（`martial-art.v1`；`category` 取 `unarmed`、`weapon`、`hidden`、`movement`、`misc`、`story_art`），以及招式 `move.ts`（`move.v1`）。
- 数据：武学在 `content/common/skills/sk_*.yaml`，招式在 `content/common/moves/mv_*.yaml`，组合在 `content/common/combos/`。
- 规范：design/05 §2–§4、§6–§9；design/21 §4–§9（路线、擒拿 1–9 级）；design/catalog/（图鉴与数量规划）。

| 参数组 | 字段（武学 / 招式） | 现状 |
|---|---|---|
| 身份 | `id`、`name`、`aliases`、`category`、`subType`、`grade`、`origin`、`sect`、`lineage`、`canonRef`、`sourceChapters`、`tags` | 已有 |
| 层数 | `layers[]`（`n`、`unlock` 招式或被动 ID） | 已有 |
| 学习 | `learnSources`、`requirements` | 已有 |
| 招式基础 | `skillId`、`unlock`、`kind`、`ultimate`、`rageCost`、`mpCost`、`target`、`range`、`shape`（六角模板）、`delivery` | 已有 |
| 招式数值 | `powerBp`、`dmgUpBp`、`wInBp`、`hitZone`、`autoTargetCap`、`friendlyFire`、`hTol`、`direction` | 已有 |
| 经脉路线 | `meridianRouteRef`、`affectedRouteRefs` | 已有 |
| **待定义** | 动作片段 ID（对齐 render `rig/clip*`）、特效 ID（design/23）、音效 ID | 空 |

### 5.5 内功
- schema：`martial-art.ts`（`category: inner`；`nature` 取 `yang`、`yin`、`harmony`、`neutral`），经脉 `meridian.ts`、`meridian-migration.ts`。
- 数据：`content/common/skills/` 里 `category: inner` 的条目；经脉在 `content/common/meridians/`（`regular12.yaml`、`extra8.yaml`）；运行参数在 `content/common/meridian-flow/`。
- 规范：design/05 §5（内功）、§10（走火入魔）；design/15（经脉、穴道、冲穴）；design/21 §2–§3、§9–§12（运行、点穴、调息、模拟）。

| 参数组 | 字段 | 现状 |
|---|---|---|
| 属性加成 | `hpMaxPct`、`mpMaxPct`、`mpRegenMilli` | 已有 |
| 内外权重 | `wInBp`、`wOutBp`、`auxOverrideBp` | 已有 |
| 运行 | `baseQi*` 等运行参数（以 schema 为准） | 已有 |
| 透劲 | 招式侧 `penetratingQi`、`pierceInBp`（玄级及以上内功可开，design/21 §4.4.3） | 已有 |
| 经脉 | `meridianStats`、`acupointStats`、`acupoints`、`opened`、`direction`、`organRelation`、`difficultyTier`、`completionRewards`、`passiveBuffs`、`minMainInnerLayer` | 已有 |
| **待定义** | 每部内功的走火入魔阈值表、与相性的数值表（design/05 §10 和 §17 的待决项） | 空 |

### 5.6 其他内容类型（指针）
- 遭遇：`encounter.ts`，数据在 `content/chapters/*/encounters/`。
- 任务与剧情：`quest.ts`、`story.ts`、`story-graph.ts`、`chapter.ts`、`event-actions.ts`。
- 地图：`world.ts`、`world-map.ts`、`region-map.ts`、`region-binding.ts`、`town.ts`。
- 通用：`primitives.ts`、`content-pack.ts`。
- 其他数据：Buff 在 `content/common/buffs/`，AI 在 `ai/`，地形在 `terrain/`，门派在 `sects/`，天书在 `tianshu/`。

---

## 6. 常见改动怎么做

1. **加一门武学**：写 `content/common/skills/sk_<名>.yaml` 和对应的 `moves/mv_<名>_*.yaml`，字段按 §5.4、§5.5；跑 `pnpm --filter @tianshu/data test`和 `pnpm check`。不改规则代码。
2. **改一个公式**：先改 design/04 或 design/21 对应章节，标注 AR 号；再改 `core/battle/damage` 或 `meridian-flow`；同步更新 golden 测试和数值算例；跑 `pnpm check` 和 `pnpm check:perf`。
3. **加一个人物**：写 `content/chapters/<章>/npcs/npc_<名>.yaml`。立绘和模型由出图线按 §4 的路径约定补上，代码先用占位。
4. **加 schema 字段**：改 `packages/data/src/schemas/<类型>.ts`，`schemaVersion` 是否升版按 tech/04 的规定；补迁移（参照 `meridian-migration.ts`）和校验测试；更新本文 §5 对应的表格。
5. **改渲染**：在 `packages/render/src` 下改；记录 draw call 和帧时间；确认 render chunk 仍在预算内。

任务派发、监督、合并流程见 `AGENTS.md`（`supervise.py`、`step.py`、审查清单 `.agents/coord/PROD/review_checks_eng.md`）。

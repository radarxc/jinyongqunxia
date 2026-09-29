# NXfixD-07 报告 · 收尾·书界 07《碧血剑》（跨书替换、小问题、兜底清理、Buff 迁移、节奏复核、人物档案同步）

## 1. 摘要（3–6 行）

- 已将归辛树的 8 品首槽由通行百战剑替换为 `sk_huashandiejinquan07`，并同步 ch07 归辛树、归二娘人物档案。
- 已把补录增量纳入本界池：`44+8=52`，分阶为天 / 地 / 玄 / 黄 `2/14/18/18`，并补齐玩家取得窗口与禁止击杀掉落规则。
- 已清除首领配置中的地位画像兜底措辞；本界四个旧 Buff ID 均无运行时引用，迁移数为 0。
- 归辛树、玉真子外放后节奏复核均为 20.1925 轮，留在 12–25 窗口，HP / DEF 不需调整；全部指定检查通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/chapters/07-bixue.md` | 1,794 | 版本记录；§7.3 华山 L4；§9.1–§9.2 池统计与取得；§12.4、§12.8 首领配装 / 兜底清理 / 外放节奏；§13、校验与依赖同步 |
| `docs/design/catalog/npcs-ch07-bixue.md` | 56 | v1.4；归辛树、归二娘武学栏同步 |
| `tools/agents/reports/NXfixD-07.md` | 101 | 结果、数值、开放问题、跨文档交接与完整自检 |

## 3. 关键结论与数值

1. 归辛树首槽完成 `sk_jianghubaizhanjian` → `sk_huashandiejinquan07`；两者同为 8 品，主运与七参不变，静态轮数 `20.19→20.19`，HP / DEF 均保持 `1.000 / 1.000`。
2. 本界本土池按基础册 44 门与补录册 8 门合并为 52 门：`2+14+18+18=52`；补录册为 7 门内功 + 1 门拳法、24 记普通招 + 9 记绝招 = 33 招。
3. `sk_huashandiejinquan07` 为 8 地中、阳性、非人物专属；最早由华山 L4，或正 / 邪 03 同门较技后经穆人清 / 归辛树认可授艺；认可路径只覆写门派项，仍保留属性、资质及 6 重前置，不从尸体、偷窃或击杀掉落。
4. 归辛树 8 段外放路线使用 `qiBp=11316`、`capacityBp=17931`、`flowBp=completionBp=10000`：普通 Z5M `12101 bp`，外放 Z5M `13791 bp`，增幅 `13791÷12101−1=13.97%`；`qiBp<12000`，扩张档仍为 0。
5. 归辛树与玉真子的 10 / 6 段静态节奏均为 `20.192536127185132` 轮，`recommendedMultiplierToWindow=1.0`；无需按 `design/21` §11.9.2 下调 HP 或防御。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NXfixD07-O01 | 闵子华与仙都派关系的原著依据 | 沿现行仙都配装并保留**（待考）**，核《碧血剑》焦公礼父仇案相关人物与情节，不写回目或引文 |
| NXfixD07-O02 | 玉真子 `full` 先天、装备与最终面板 | 保持 Lv56、HP / DEF `1.000 / 1.000` 的静态建议值；数据齐备后固定 RNG 回放**（待实测）** |
| NXfixD07-O03 | 五行阵、焦宅、库银及两场玉真子的完整行动节奏 | 当前只采用整场共享耐久与静态窗口；不得给多单位复制完整 Boss HP，待遭遇数据齐备后固定 RNG 回放**（待实测）** |
| NXfixD07-O04 | 金龙帮补录卡组织外键与明宫护院组织 ID | 金龙帮已有正式 `sect_jinlongbang`；默认将 `sk_jinlongbangxinfa` 的 `sect:null` 改为 `sect_jinlongbang`。明宫护院仍不建组织 ID |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NXfixD07-P01 | 将 Canon §4 / §13 的目录暂计更新为天 / 地 / 玄 / 黄 `59/251/468/459=1,237` | NXfixC 已逐卡复算 14 册 99 门补录；当前 Canon 仍保留“地 / 玄 / 黄待统一重算”的旧说明 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/chapters/08-luding.md` | §12.8、§12.8.1 | 归辛树、归二娘首槽 `sk_kaimenpiguaquan` 改为 `sk_huashandiejinquan07`，删除“待书界 07 补录 / 跨书界待替换”；外功同品替换不改七参，整场仍为 23.15 轮（表内 `27.23→23.15` 是耐久回拉前后） |
| `docs/design/catalog/npcs-ch08-luding.md` | 归辛树、归二娘能力栏 | 同步首槽为 `sk_huashandiejinquan07`，其余现行华山武学不变 |
| `docs/design/12-quests-npc-factions.md` | §6.7.1 碧血来源 | 将新拳法加入华山 L4 或穆人清 / 归辛树认可授艺来源；禁止击败掉落 |
| `docs/design/17-sects-compendium.md` | §2.1.3 碧血·华山支 | 将新拳法加入 L4 / 认可授艺目录；继续引用补录卡，不重定义 |
| `docs/design/story/07-bixue.md` | §8 补录来源 | 增补新拳法在正 / 邪 03 同门较技后的认可授艺窗口及安全失败边界 |
| `docs/design/catalog/skills-bulu-07-bixue.md` | §1.2 `sk_jinlongbangxinfa` 数据卡 | 金龙帮已有正式 `sect_jinlongbang`；将卡内 `sect:null` 改为 `sect_jinlongbang`，与 `design/17` §2.1.3、§8.9 及本章 §7.6 对齐 |
| `docs/00-canon.md`、`docs/design/05-martial-arts-system.md` | 全局武学统计 | 按 NXfixC 统一回填 `59/251/468/459=1,237`，不把本章 52 门误写成全局目录 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 替换清单（含轮数前后）

| 位置 / 人物 | 变更前 | 变更后 | 轮数前→后 | HP / DEF |
|---|---|---|---:|---|
| ch07 §12.8 归辛树首槽 | `sk_jianghubaizhanjian`（8 地中） | `sk_huashandiejinquan07`（8 地中） | `20.19→20.19` | `1.000 / 1.000` |
| ch07 NPC 档案·归辛树 | “外功按华山与通行图鉴核配” | 明列新拳法及四门既有华山外功 | 不适用 | 档案同步，不另算耐久 |
| ch07 NPC 档案·归二娘 | “华山武学待图鉴” | `sk_hunyuangong` + `sk_huashandiejinquan07`、`sk_hunyuanzhang`、`sk_poyuquan`、`sk_tiezhijue`、`sk_huashanquan07` | 不适用 | 按 ch08 §12.8 唯一首领配装同步；首槽由书界 08 收尾同步 |

### 7.2 小问题处理

- ✅ 本界池由 `44+7=51` 修正为 `44+8=52`，地阶由 13 改为 14，比例与 BX-T06 同步。
- ✅ §7.3 与 §9.2 已登记新拳法的 L4 / 认可授艺窗口、前置、安全失败与禁止尸体掉落。
- ✅ §7 门派职级表补齐 6 处补录内功：华山 L3、铁剑门 L4、石梁温家 L4、金龙帮 L3、闯王军 L3、仙都派 L3；金龙帮 L5 与表后说明亦已改为承认本帮心法。
- ✅ 首领表内“地位下限”式生产表述均改为真实 `sk_*` 主运闭合与校验目标；普通剧情失败恢复、视频资源兜底未误删。
- ✅ §12.4 使用官方术语“AR-15 地位下限”，并注明仅作校验目标、引用 `design/21` §11.9.1。
- ✅ NXB07-O01 已由裁定表确定为 1 记绝招；O02 明宫护院仍不建组织 ID；O03 已按正式 `sect_jinlongbang` 纠正，补录卡外键差异已交图鉴任务；O04 / O05 如实保留待考 / 待实测。
- ✅ 未发现“来源扩展待登记”或“待补专属”；不需要执行文字替换。

### 7.3 Buff 迁移

- ✅ `bf_fengxue`、`bf_fengnei`、`bf_fengjingmai`、`bf_chanrao` 在两份授权正文中均无运行时引用；迁移 **0 处**。

### 7.4 外放后的节奏复核

| Boss | 七参摘要 | 外放复核 | `boss_pacing.py` | 结论 |
|---|---|---|---:|---|
| 归辛树 | `9/9;13000;9000;13000;yang;fullTemplate;M7B` | `mv_hunyuangong_yangqi`：`12101→13791 bp`，+13.97%，0 档 | 20.1925 | 12–25 窗内，倍率保持 `1.000 / 1.000` |
| 玉真子 | `9/9;13000;9000;13000;harmony;fullTemplate;M7B` | 现行伤害招无外放，作同品对照 | 20.1925 | 12–25 窗内，倍率保持 `1.000 / 1.000` |

### 7.5 交其他任务

- ⚠️ 书界 08 及其人物档案仍保留旧首槽和待替换注记，交 NXfixD-08；本任务未越权修改。
- ⚠️ `design/12`、`design/17`、`story/07` 的补录来源表早于 NXfixC 新拳法，交相应归属任务补入；本章已经提供可执行来源。
- ⚠️ Canon / `design/05` 的全局目录统计仍是旧暂计，交总览 / 武学系统任务按 NXfixC 结果统一回填。
- ⚠️ `skills-bulu-07-bixue` 的 `sk_jinlongbangxinfa` 仍写 `sect:null`，与正式 `sect_jinlongbang` 不一致；交图鉴任务改为 `sect_jinlongbang`。
- ⚠️ 完整多体遭遇与具名 `full` 行动表需要固定 RNG 回放，当前仅能完成静态估算。
- ✅ 任务点名的神雕、雪山、天龙、飞狐、倚天、书剑、鹿鼎正文事项均属其他并行写集，未在本工作副本越权处理。

### 7.6 门禁与范围

- ✅ `python3 tools/lint/check_ids.py --strict`：exit 0；仅报告既有基线 `docs/README.md` 的 `sk_babuganchan`，新增严格失败 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：126 项通过。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过，known deviations 0。
- ✅ `python3 tools/balance/boss_pacing.py --check`：通过。
- ✅ `python3 tools/agents/check_undefined_in.py docs/design/chapters/07-bixue.md docs/design/catalog/npcs-ch07-bixue.md`：未定义引用 0。
- ✅ 追加 `projection_sim.py --check` 与 `git diff --check`：均通过。
- ✅ 工作树只改动三条授权路径；未执行任何改变仓库状态的 git 命令。

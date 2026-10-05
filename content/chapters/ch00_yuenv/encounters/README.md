# ch00 · 三场遭遇数据交接

> 归属（基准 §18）：序章遭遇实例；玩法来源为 `docs/design/chapters/00-yuenv.md` §5.1–§5.5。
> 上游：作者需求 AR-12 / AR-26 / AR-27、Canon v1.10、`rulings-v1`；`content/CLAUDE.md`；`ENG-26-encounter-builder`、`CONTENT-ch00a-data`、`CONTENT-ch00b-maps` 报告。
> 引用而不重定义：属性 → `design/03` §10；伤害 → `design/04`；武学 → `design/05` 与 catalog；战斗 → `design/09`；难度 → `design/13` §5.1；人物 → `design/18`；剧情 → 既有 ch00 Quest / Ink。
> 标注约定：三场玩家介入、投桃、救场与示范为**（原创扩展）**；原著动作细节为**（待考）**；技术事实未联网确认标**（待核实）**；运行验证标**（待实测）**；本文补定输入标**【建议值】**。

## 1. 交付状态与加载边界

三份 `enc_00_*.yaml` 已从 `_drafts/` 晋升到本目录并进入章节生产发现器。正式 `tmpl_normal`、`npc_baiyuan`、三个角色槽和 encounter 字段分类均已登记；内容构建对遭遇、模板、NPC、角色槽、地图、任务和结算动作执行强引用校验。

game 的 source resolver 把主角当前角色状态、正式 NPC full build 或角色槽模板转换为 `BattleUnitSeed`。匿名角色按 `(runId, chapterId, templateId, spawnId, ordinal)` 生成 UUIDv5 实例 ID；输入快照以 SHA-256 锁定遭遇、解析单位、难度、背包、物品定义和实图。`encounter.v1` 仍是严格对象，不能把 `roleId`、`skipCost` 或教学锁按钮字段塞进根对象。

`world/battleRequested` 现经 resolver、`buildEncounter` 和与冥想战共用的 enter/finalize/leave 流程开战；战后按冻结的 scene/anchor 返回。生产门禁之外，真会话固定种子用例覆盖三战开战、结算、旗标、任务阶段和返回位置。

## 2. 参战者、战场与站位

三战均引用 `rg_jiangnan_taihu` 的既有 BattleArena，不内联复制地形。坐标按仓库 Tiled importer 使用地图绝对轴坐标：`q=(object.x+point.x)/48`、`r=(object.y+point.y)/48`；不减 arena 原点。这里的转换是仓库约定，不能推定为 Tiled 通用六角投影算法。

章节 §5 未指定逐格坐标，以下站位是落实编组的**【建议值】（原创扩展）**。规则朝向按 `design/09` 与 core 六向约定：0 为 `(+1,0)`，3 为 `(-1,0)`；主角 / 越卒相向面对东侧敌人。`spawnId` 是遭遇局部出生键，不是地图 PlayerSpawn 强外键。

| 遭遇 / 场景 / Arena | 格数 / q、r 范围 / 跨度 | 参战者 `unitRef@(q,r)/facing` | 输入与容量 |
|---|---|---|---|
| `enc_00_zhulin` / `sc_00_zhulin` / `arena_00_zhulin` | 61；q4–11、r4–11；8×8 | `hero@(7,7)/0`；`road_swordsman_1@(10,7)/3`、`road_swordsman_2@(10,6)/3` | 主角 vs 路卒×2；敌 `tmpl_normal/dreamLevel=1`；我/敌容量 1/2 |
| `enc_00_baiyuan` / `sc_00_shanjing` / `arena_00_baiyuan` | 73；q6–14、r4–12；9×9 | `hero@(12,7)/0`；`baiyuan@(14,7)/3` | 主角 vs `npc_baiyuan`；白猿读合法 full 画像；容量 1/1 |
| `enc_00_biandao` / `sc_00_yueying` / `arena_00_biandao` | 91；q1–9、r5–15；9×11 | `hero@(4,9)/0`；`yue_soldier_1@(3,9)/0`；`wu_swordsman_1@(7,9)/3`、`wu_swordsman_2@(7,10)/3` | 主角+越卒 AI×1 vs 吴剑士×2；三个匿名单位均 `tmpl_normal/dreamLevel=2`；容量 2/2 |

三张 arena 连通、起始格可站立且互不重叠，格数均 ≤400，两轴跨度均 ≤20。竹林双方位于浅水 / 独木桥两侧的草地；白猿站位复用地图 NPC 锚点所在格；边道越卒在主角后位。地形、高度仍由地图提供。

匿名 source 只保存模板 / 梦境档位；`group` 对应既有 `role_road_swordsman/role_wu_swordsman/role_yue_soldier`。resolver 按父任务角色槽生成稳定 UUID 和合法基础招式 / 经脉 / 属性，再以各 `unitRef` 提供构建输入；不要把局部键当永久 NPC ID。越卒父槽 `count:2` 中只有第一名参加边道，第二名仅用于营地试阵。

吴剑士按章节 §3.2 的灵巧流派、越卒按护卫流派，路卒仅基础点攻；schema 无流派 / 招式覆写字段，由 source resolver 承接。白猿保持 `animal`、非人年龄 / 外观管线与 `full`，不借 `tmpl_elite` 杂兵伪造画像。

## 3. 胜负、权限与剧情交接

| 遭遇 | 胜 / 负 / 认输 | 数据权限 | 既有剧情入口 / 收束 |
|---|---|---|---|
| 竹林 | 敌方全部失去战力胜；主角倒地负；败北 `retry`；禁止认输 | `normal`；允许道具、留手；无杀意、友伤；不可跳过 | C02 `st_initial_battle`；胜后 `after_initial_battle`；示范成功记 assisted |
| 白猿 | `hitCount(player→enemy,1)` **或** `surviveRounds(2)` 胜；主角倒地负；认输 `advance` 等价推进 | `spar`；禁战内道具；允许留手；无杀意、友伤；`retry=false/skippable=true` | `baiyuan_choice`；胜 / 认输写 `fl_00_baiyuan_spar_done` 后 `baiyuan_after`；失败回选择节点，不伪报胜 |
| 边道 | 敌方全部失去战力胜；主角倒地负；败北 `retry`；禁止认输 | `normal`；允许道具、留手；`lethalIntent=false`、无友伤；不可跳过 | C03 `st_biandao`；胜后 `biandao_after→sword_source→nine_layer_preview` |

两场故事战只让主角倒地触发失败；越卒倒地不会单独令主角败北。全敌失去战力包含按 `design/09` 处置的制服 / 离场，不要求死亡；战后无随机掉落、正式成长、招募或额外收益。

三战 `noAuto=true/noRetreat=true` 为教学期间的**【建议值】**；禁普通撤退不等于禁白猿主动认输。轮限 30 沿用 `design/09` §2.11 的非 Boss 僵持敌退规则与 ENG-26 默认，白猿在第 2 轮已结束。敌退须由宿主落实为离场事实，不能写死亡或发未击倒者奖励。

O05 的战前投桃只引用 `story_ch00_main.ink` 的 `baiyuan_choice`：确认持有 `it_tao` 后，既有 `party/takeItem item=it_tao count=1` 与 peaceful 分支 / 汇合进度同事务提交；不启动遭遇。无桃拒绝提交、返回选择；取消 / 回滚不扣物；绕路不耗桃。`skippable=true` 不意味着战内免费发桃或任意通关。

## 4. 脚本节拍与宿主消费

| 时点 | 本数据表达 | 生产运行行为 |
|---|---|---|
| 竹林入场 / 首次主角行动 | `kind=story/noAuto=true`；schema 无行动号条件 | 冻结初阵说明；第一行动仅移动 / 点攻，提交后解锁 |
| 竹林第二次主角行动 | schema 无教学按钮 / 行动号字段 | 提示防御；HP<70% 同时提示金创药；防御 / 调息 / 用药任一完成教学 |
| 竹林主角 HP<45% | `aqing_rescue`：`hpBelow(hero,4500)`、`once=true` → `battle/aqingRescue` | 阿青一次援护，把最近敌人击退窄口外；不自动结算全战、不入队 |
| 竹林连续失败≥2 | `terrain_hint`：`lossStreak(2)`、`once=true` → `battle/terrainHint` | 战斗事件提示坡差和窄口，UI 展示一次 |
| 竹林连续失败≥3 | `spirit_demo`：`lossStreak(3)` → `offerDemonstration(replay_zhulin_demo)` | UI 提供可选示范；接受命令写回放日志并以 assisted 收束 |
| 白猿首轮 / 结束 | 胜负条件已机读；`beats=[]` | 引导急性聚气；命中 / 两轮时跃离，认输同样推进，无伤势 / 品德扣减 |
| 边道入场 / 首轮 | 编组与 AI 已机读；`beats=[]` | 调整主角 / 越卒前后位；若白猿未完成聚气，补一次急性聚气 |
| 边道制服 / 胜后 | 无杀意 / 留手已机读；schema 无胜后条件 | ≤30% HP 可制服；胜后依序进入剑法来源、九层预览两段教学对话 |

HP 节拍用整数判定 `hp×10000 < hpMax×4500`，恰好 45% 不触发；`once` 由脚本去重。宿主跨重试 / 恢复时须保存适用的触发记录，不能据静态配置声称援护已生效。

连败输入沿 ENG-26：进入时持久 `lossStreak` + 当前会话最大的 retry 序号，不能同时把同一败北加到两个基数。竹林每次败北结算原子更新计数，第三败即写 `fl_00_zhulin_loss_streak3=true`；胜利 / 新 run / 离开书界清零并清旗标。脚本仅发示范事件，不会替代持久旗标；既有 Ink 只读该旗标，不能到对话入口才伪造资格。

`replay_zhulin_demo` 作为确定性特殊命令进入正式回放日志；当前表现为接受示范后直接 assisted 结算，尚无逐动作录像资产。边道胜后双演示当前由三段有序 Ink 对话完成，不会把 offgrid 阿青切入战斗。

## 5. 倍率核算

三份 `localDifficulty=1`、`enemyStatBp=8500+500×1=9000`，即 `0.85+0.05×1=0.90`。只把 D1 应用于**模板敌人**的 `hpMax/atkOut/atkIn`；越卒友军不乘 D1 与敌方模式倍率，防御 / MP / 评级 / 速度不得混乘 D1。

| 难度（见 `design/13` §5.1） | 数据 HP / 攻击 bp | 普通模板敌人相对合法基础值的取整前系数：HP / 攻击 |
|---|---|---|
| 江湖 `diff_jianghu` | 8000 / 8000 | `0.60×0.90×0.80=0.432` / `1.00×0.90×0.80=0.72` |
| 侠客 `diff_xiake` | 10000 / 10000 | `0.60×0.90×1.00=0.54` / `1.00×0.90×1.00=0.90` |
| 宗师 `diff_zongshi` | 12000 / 11200 | `0.60×0.90×1.20=0.648` / `1.00×0.90×1.12=1.008` |

系数仅核对 `design/03` §10.3–§10.5 的输入，不给单位手填最终属性。实际逐层按 ENG-26 `mulBpFloor(x,bp)=floor(x×bp/10000)` 取整；模板 / 流派 / 合法 source 求值后不应再重复乘一次。评级、速度及 AI 的模式差异引用 `design/13`，不是额外 D1 数值。

构建器对 `source.kind=npc` 的 full seed 施加模式 HP / 攻击 / 评级 / 速度修正，但不施加模板 D1；模板敌人才依次乘模板基础、D1 与难度模式，友军不乘敌方系数，避免重复施加。

## 6. 参考资料

- [Tiled JSON Map Format · Object / Point](https://doc.mapeditor.org/en/stable/reference/json-map-format/#point)，访问日期 2026-10-04：对象 x/y 是像素坐标，polygon 的点相对对象位置。48 px 转轴坐标取自本仓库 `packages/data/src/build/tiled-objects.ts`，不是外部 API 保证。
- 内部契约：`packages/data/src/schemas/encounter.ts`；`packages/core/src/battle/encounter/{builder,index}.ts`；`packages/core/src/battle/script/index.ts`。本任务未新增外部版本、价格、限额或浏览器支持要求。

## 本文新增术语与 ID

复用已全仓搜索的 `enc_00_zhulin/enc_00_baiyuan/enc_00_biandao`、三 arena、角色槽、人物、模板、难度、物品和剧情旗标；不新增全局游戏 ID。`hero/road_swordsman_*/baiyuan/yue_soldier_1/wu_swordsman_*`、`spawn_*`、`aqing_rescue/spirit_demo/replay_zhulin_demo` 沿用 ENG-26 局部键。

本文补定局部节拍键 `terrain_hint` 和内容事件 `battle/terrainHint`，只供竹林二连败提示，执行端消费者尚缺；不注册第二份战斗脚本 / Buff 定义。示范录像键不是已存在的资产声明。

## 数据校验规则与测试用例

| 检查 / 输入 | 通过条件 |
|---|---|
| 源文件与 schema | 三份 UTF-8 / LF、单 YAML document、无 anchor / 重复键；经仓库 `parseContentFile` 与严格 `EncounterDefSchema` 接受 |
| 正式引用闸门 | `tmpl_normal` / `npc_baiyuan` / 角色槽 / 地图均可解析；任一强引用缺失时生产注册失败 |
| 地图与构建 | 编译三张真实地图，将三定义交 `buildEncounter`，网格为 61/73/91，连通；所有初始位置可站立、双方容量足够；同输入规范输出相同 |
| 竹林救场边界 | 设主角 `hpMax=200`：hp90 不触发，hp89 触发一次；再次求值无重复 `battle/aqingRescue` |
| 连败与恢复 | 二败提示、三败示范各一次；存读档和 retry 保留 streak 旗标及 once 回执，胜后清零 |
| 白猿三种推进 | 1 条 player→enemy 命中伤害事件、round=2、主动认输分别返回 win；round=1 且零命中不胜；主角倒地为 lose；失败返回选择 |
| 故事战与同伴 | 主角倒地两战 lose / 可 retry；全敌失战 win；仅越卒倒地、敌人仍在时边道不结束；保留无杀意 / 留手 |
| 三档倍率隔离 | 同一合法 source，模板敌人 HP / 攻按 §5；越卒 HP / 攻不受 D1 / 三档敌方模式影响；D1 不进入 DEF / MP / 评级 / 速度 |
| O05 原子与幂等 | 桃×1 成功提交变 0，写 peaceful 并汇合且不开战；无桃 / 取消 / 回滚不扣物，重复提交不再扣；既有 Ink 源检查不能代替事务运行测试 |
| 教学与结算 | 认输 / 制服 / 重试 / 示范命令可回放；三战同事务结算并回原 scene/anchor；无正式收益 / 招募 |

前三战另以真实章节构建、正式 resolver 与固定 seed 真会话验证 `battleRequested → BattleSetup → 结算 → 返回`；底层夹具测试仍单独锁定公式与边界。

## 待决事项 / 依赖

### 替下游给出的建议值

- **【建议值】**：§2 九个参战位置及 0/3 朝向；设计未给逐格坐标，均已按实图编组 / 可站立格选择。调阵后须再次检查 arena 与容量。
- **【建议值】**：三战禁自动 / 普通撤退，白猿保留主动认输；实际教学完成后是否解锁自动交 UI / 教学所有者。本数据无动态解锁字段。
- 轮限 30、D1 9000 bp、三档模式和模板输入均为现有上游值，不作为本文新建议。

### 本文依赖的上游事实

- 已解决：正式白猿、三类 RoleSlot、`tmpl_normal`、source resolver 与生产 encounter 已接通；见 §1–§2。
- 已解决：data 字段分类、章节分包、runtime 加载与强引用校验已接通；见 §1。
- 已解决：宿主消费 `world/battleRequested`，认输 / 重试 / 制服 / 示范、持久连败旗标、战后选择与有序双演示已接通；见 §3–§4。
- 部分解决：实图继承 `terrainId`、canopy、LOS 和按 delivery 的 cover；现有 RegionMap 不携带条件型地形乘区，竹林 Z7 的枪棍限定 -10% 不虚填为全流派标量。
- 已解决：白猿 full seed 的三档模式处理，见 §5；未套普通 / 精英模板。
- 已解决（源契约）：O05 使用既有 `it_tao`，扣物归 Ink，不在遭遇新增 skipCost；见 §3、`CONTENT-ch00a-data` 与地图报告。原子提交 / 防重运行结果仍**（待实测）**。
- 已解决（上游修复）：`ENG-ink-external-args` 已修 EXTERNAL 字符串抽取，不再沿用 ch00a 旧报告的编译阻塞；本任务只引用原始 ID，运行与产物仍按该报告 §7 核验。

### 对基准的修改提案

无；现有 schema / 宿主缺口交其所有者，不修改 Canon 或新增来源例外。

### 原著考据待办

沿用章节 §12.4：按三联 / 广州修订版核《越女剑》中阿青、白猿交手的动作、范蠡请其助越军习剑的顺序与称谓。三场玩家介入及数据编组均为原创编排，不补原著引文 / 回目号 / 招名。

### 开放问题（附默认值）

- 已解决：三份遭遇随人物 / 模板 / 字段表 / resolver 与 runtime 接线一并晋升生产。
- 示范录像何时生产？默认后续补逐动作本地图录像资产；本轮特殊命令可回放且接受后写 assisted，但表现尚非逐动作播放。
- 白猿失败如何恢复？默认 `onDefeat=continue` 返回 `baiyuan_choice`，可重新试手、投桃或绕路；主动认输 / 胜利才走 `baiyuan_after`，不把失败等同认输。

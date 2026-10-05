# CONTENT-ch00c-encounters 报告 · 内容 · 序章 ch00 三场遭遇（竹林、白猿切磋、边道）

## 1. 摘要（3–6 行）

- 已写三份严格 `encounter.v1` 目标数据，引用 ch00b 的真实 BattleArena，未写引擎代码。
- 竹林救场 / 连败节拍、白猿特殊胜利 / 认输、边道 AI 越卒 / 留手及 D1 三档输入齐全。
- 正式 NPC / 模板及 encounter 字段表缺失，遵循灰盒约定留在 `_drafts/`；数据验证完成，生产开战与 M1 通关尚未完成。

## 2. 产出（文件、行数、主要章节）

- `content/chapters/ch00_yuenv/encounters/_drafts/{enc_00_zhulin,enc_00_baiyuan,enc_00_biandao}.yaml`：78 / 59 / 76 行，战场、参战者、条件、权限、节拍、倍率。
- `content/chapters/ch00_yuenv/encounters/README.md`：139 行，站位 / 宿主契约、公式、校验及依赖；本报告 40 行。

## 3. 关键结论与数值

- D1=`8500+500×1=9000 bp=0.90`，仅模板敌人 HP / 内外攻击；三档 HP/攻为 `8000/8000、10000/10000、12000/11200`，普通模板取整前 HP 为 `0.432/0.54/0.648`、攻为 `0.72/0.90/1.008`；逐层向下取整，AI 越卒不乘敌方难度。

## 4. 开放问题（附默认值）

- 正式引用 / 字段表 / resolver / runtime 尚缺，默认不发布（README §1），救场 / 录像 / 连败旗标 / 认输重试 / 投桃事务 / 双投影交宿主补齐；逐格站位与自动权限默认取 README §2 九个位置、朝向0/3，禁自动 / 普通撤退而保留白猿认输；30轮僵持按 design/09 敌退处理。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；不新增全局 ID 或改写公式，新增局部 `terrain_hint` / `battle/terrainHint` 已登记。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- data 字段分类 / runtime 加载 / 草案晋升 → `ENG-ch00-encounter-wiring`（新登记，M1，排 ENG-19e 之后）→ `ContentKind/CONTENT_FIELD_REGISTRY`、encounter / template 装载、三 YAML 移入生产 → 验收：生产注册三遭遇、强引用可解析且五项门禁通过；开战 / source resolver → `ENG-ch00-encounter-wiring`（新登记，M1）→ `world/battleRequested`、`participants[].source/group`、`EncounterBuildContext.units/templates/regionMaps`、`buildEncounter→BattleSetup→battle/enter` → 验收：三张实图开战、正式 seed / UUID / 站位正确；救场 / 提示 / 示范 / 连败 / 结果 / 认输重试（core / game / ch00 Quest-Ink）→ `ENG-ch00-encounter-wiring`（新登记，M1）→ §7 事件、`lossStreak`、结果旗标与 `outcome/rules.retry` → 验收：45% 边界援护一次、二败提示、三败可选录像且完成后 assisted、计数恢复不重复累加、第三败原子写旗标且胜利 / 新 run / 离开书界清零、白猿三路等价推进 / 失败回选择、故事战重试、边道胜后独立双演示；白猿 full 模式 / 实图地形继承 → `ENG-ch00-encounter-wiring`（新登记，M1）→ `difficulty.modes`、`canopy/los/cover/terrainDealtBp/terrainTakenBp` → 验收：三档修正只施加一次、遮挡 / 地形乘区继承地图且 D1 仍只乘模板敌人 HP / 攻。
- schema / 构建 / 脚本基础契约已解决 → `ENG-26-encounter-builder`（已合入）→ `encounter.v1/buildEncounter`、`scriptBeats/scriptContext.lossStreak` → 验收：严格 schema、确定性、命中 / 回合 / 45% / 连败节拍；物种 / 角色槽契约已解决 → `ENG-npc-species-roleslot`（已合入）→ 白猿 `species=animal/ageBand=null`、合法 full 画像、三类 RoleSlot → 验收：不进入人类年龄管线、三槽可装载，接入 seed 解析仍归上述 wiring；战斗操作界面缺口 → `ENG-16e-battle-ui-actions`（在跑）→ 移动 / 防御 / 物品 / 聚气命令入口 → 验收：三战教学动作可提交、非法入口禁用；单位模型 / 标识缺口 → `ENG-battle-generic-model`（在跑，不挡流程）→ 物种 / 性别、模型资源与姓名 / 阵营标识 → 验收：人类通用模型可区分、白猿不套人类模型、加载失败仍可继续。状态据 10-04 开发监督裁定；本轮不改引擎或晋升草案。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 遭遇 | 参战者 / 场景→战场 | 条件与节拍 |
|---|---|---|
| ✅ `enc_00_zhulin` | 主角 vs 路卒×2，模板梦境档1；`sc_00_zhulin→arena_00_zhulin`，61格/8×8 | 全敌失战胜、主角倒地 retry；HP<45% 一次救场事件，2败提示、3败提供示范 |
| ✅ `enc_00_baiyuan` | 主角 vs 白猿 full；`sc_00_shanjing→arena_00_baiyuan`，73格/9×9 | 命中1次 OR 坚持2轮胜；认输 advance，失败回选择；战前桃×1免战归 Ink；beats 空 |
| ✅ `enc_00_biandao` | 主角+越卒AI×1 vs 吴剑士×2，模板梦境档2；`sc_00_yueying→arena_00_biandao`，91格/9×11 | 全敌失战胜、主角倒地 retry；无杀意、允许留手；beats 空，调阵 / 补聚气 / 胜后演示交宿主 |

- ✅ 本轮重跑 `pnpm content:validate`、`pnpm content:build`、`pnpm install --frozen-lockfile`、`pnpm check`、`python3 tools/lint/check_ids.py --strict` 均退出 0；check 164 文件 / 1202 测试及体积门通过，strict ID 新失败 0（既有 baseline `sk_babuganchan`）；内容侧严格 schema / 实图 / 连通 / 站位 / 条件核验沿用上轮已通过审核，本轮只补报告 §6–§7，YAML / README 与 §1–§5 未改、无变更 git 命令、未手改 shim / store。⚠️ 生产发现器排除草案，M1 尚未通关；与设计出入：站位 / 禁自动仍为建议值，行动教学 / 胜后条件需接线，救场 / 示范 / 投桃事务 / 旗标 / 双投影未实测，白猿模式与实图遮挡待 §6 wiring；本轮无新增外部技术事实。需作者确认（附默认）：无新增。
- 下游字段汇总（消费归 §6 wiring）：开战 `world/battleRequested.payload.{anchorId,encounterId}`，上下文 `sceneRef/anchorRef/sourceSnapshotHash/sourceId/triggerId/worldTick/seed/difficulty`；参战解析 `source.{kind,characterRef,npcId,templateId,dreamLevel}`、`unitRef/group` → `units[].{ref,seed}`（ref 按 characterRef / npcId / 模板 unitRef 匹配）；救场 / 提示 `battle/aqingRescue`、`battle/terrainHint`，示范 `battle/demonstrationOffered.message=replay_zhulin_demo`；连败 `EncounterBuildContext.lossStreak→BattleSetup.scriptContext.lossStreak`、持久 `fl_00_zhulin_loss_streak3`；结果 `fl_00_initial_battle_{manual,assisted}`、`fl_00_baiyuan_{peaceful,spar_done,merged}`、`fl_00_biandao_done` 及双演示 `fl_00_sword_demo_seen/fl_00_nine_preview_seen`，须在对应完成事务提交，选择 / 提示不冒充完成；认输 / 重试消费 `outcome.concede/onDefeat`、`rules.retry`；投桃沿用 Ink `party/takeItem item=it_tao count=1`，消费与 peaceful 同事务、取消 / 回滚不扣、重放不重复扣或发奖。

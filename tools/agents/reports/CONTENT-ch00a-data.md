# CONTENT-ch00a-data 报告 · 内容 · 序章 ch00 数据与剧情（人物、角色槽、道具、武学与招式、任务、DAG、Ink、文本）

## 1. 摘要（3–6 行）

- 已落地序章道具、8 门武学、10 个 MoveDef、4 个任务、12 节点 / 11 边 DAG、16 knot Ink 与简体文本。
- 三名 NPC 改为显式 `_drafts/` 灰盒：序章均不可永久招募、无入队门槛；白猿固定 `species=animal`、`ageBand=null`。
- 三类角色槽各 `count:2` 已写可机读交接 YAML；待 `ENG-npc-species-roleslot` 提供正式 schema 后晋升生产。
- Ink 源文件三处 external 条件已按设计写好；当前编译产物会把字符串 ID 改写为文本键，运行分支阻塞于 `ENG-ink-external-args`。

## 2. 产出（文件、行数、主要章节）

| 文件组 | 行数 | 主要内容 |
|---|---:|---|
| `npcs/_drafts/*.yaml` / `roles/_drafts/*.yaml` | 105 / 30 | 3 人目标结构；3 类 ×2 槽的消费交接 |
| `props/*.yaml` / `quests/*.yaml` | 19 / 238 | 章内竹棒；C01–C04、白猿三路、传功与初眠 |
| `common/skills/*.yaml`（本任务 8）/ `common/moves/*.yaml`（10） | 217 / 209 | 越女剑、长生诀、六门角色武学与招式 |
| `story/ch00/*` / `locales/zh-Hans/ch00.yaml` | 445 / 143 | DAG、Ink、inkmeta；剧情 / 任务 / 场景 / 教学文本 |
| `content/items/*.yaml`（生成器新增 151） | 151 文件 | 同步新合入收藏品名录；`it_tao`、`it_aqing_qingcha` 均为生成物 |

## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| 初眠 | `6×35+90=300`；均衡六项各 50；`702−(−482)=1184` 年 |
| 难度 | 序章 `0.85+0.05×1=0.90`，只交遭遇层乘 HP / 攻击 |
| DAG / Ink | 12 节点、11 边、3 终点；16 个 knot、1 个 stitch、145 个 `#ts:` 标签，其中 speaker 66 个 |
| 武学 | 越女剑地上 9 教学投影；长生诀九层预览与真实第一层分离；普通武学不离章 |
| 回执 | `fx_sword_demo_seen`、`fx_nine_preview_seen`、`fx_first_layer_commit`、`fx_first_sleep_snapshot`、`fx_export_verified`、`fx_first_sleep_commit`、`fx_skip_bridge` |

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 / 阻塞 |
|---|---|---|
| O1 | `npc.v1` 强制 appearance 招募结构，且缺 `species` / nullable `ageBand` | `_drafts/npc_*.yaml` 保留目标字段，`mockRef: ENG-npc-species-roleslot`；生产包暂不发布三人，任务强引用暂留空 |
| O2 | 尚无 `RoleSlotDef` | `_drafts/role_*.yaml` 保留 `slotId/chapter/templateId/count/dreamTier/seed/displayRoleKey/consumerRefs`，交 `ENG-npc-species-roleslot` |
| O3 | `story_art` 强制普通 `grade`，武学 schema 无 `trainingAttrs` | 长生诀暂投影 `grade:1`，不据此赋普通品阶；训练属性不造字段 |
| O4 | MoveDef 未覆盖部分 Buff / 击退 / 招架语义 | 阻塞于已登记的 `ENG-move-onhit-effects`；当前四招不伪造 `onHit` / `parryable`，待其按下列接口回填并由战斗结算消费 |
| O5 | Ink 尚有两层引擎阻塞 | `ENG-ink-intents` 负责运行时绑定 / intent 执行；`ENG-ink-external-args` 修 `extractStoryText()`，不得本地化 external 字符串实参。内容接口为 EXTERNAL `get_flag` / `has_item`；修复前示范及桃条件不生效 |
| O6 | 三连败资格由本任务外的遭遇结果产生 | Ink 仅读 `fl_00_zhulin_loss_streak3`；`CONTENT-ch00c-encounters` / `ENG-26-encounter-builder` 在竹林第 3 次连续失败结算时原子写真，胜利 / 新 run 清零；未写时示范与活血丸均不可见 |

`ENG-move-onhit-effects` 待消费字段：`mv_yuenvjian_zhuying` → `onHit.applyBuffs: [{buffId: bf_shiheng, chanceBp: 3000, turns: 1}]`；`mv_yuenvjian_huizhi` → `onHit.displace: {kind: knockback, cells: 1}`；`mv_yuenvjian_yixian` → `onHit.applyBuffs: [{buffId: bf_pojia, chanceBp: 4000, turns: 2}]`；`mv_yuenvjian_wuhen` → `parryable: false` 与 `onHit.applyBuffs: [{buffId: bf_dongyao, chanceBp: 5000, turns: 2}]`。省略 `parryable` 时默认为 `true`。

**需作者确认（附默认）：**无新增；按协调者 10-03 默认，三人序章不可招募、白猿使用动物灰盒、角色槽待正式 schema。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。任务 ID 例外已获批；本任务未新增基准规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 / 同步内容 |
|---|---|
| `design/chapters/00` §5.4 | 与 catalog 冲突：正文说不沿用“竹影点锋 / 白猿回枝”，本任务按武学归属 catalog §2.1 保留二名 |
| `ENG-npc-species-roleslot`（NPC） | 消费 `species/ageBand/recruitment:null/productionTier/runtimePolicy`；晋升三名 NPC 并恢复 quest 人物强引用，不引入永久招募门槛 |
| `ENG-npc-species-roleslot`（RoleSlot） | 消费 `slotId/chapter/templateId/count/dreamTier/seed/displayRoleKey/consumerRefs`；晋升三类共六槽并交遭遇实例化 |
| `ENG-ink-intents` / `ENG-event-executor` | 前者绑定已声明的 `get_flag` / `has_item` 并执行 `#ts:` 对话 intent；后者仅执行 EventDef action，不得互相替代 |
| `ENG-ink-external-args` | 修 `extractStoryText()` 并加 `get_flag` / `has_item` 回归测试；重编译后实参须严格保留 `fl_00_zhulin_loss_streak3`、两处 `it_tao`，不得变成 `ink.story_ch00_main.text.*` |
| `ENG-region-gates-data` | 绑定区域门禁、对话与掉落；本任务不写任何伪 `gateRef` |
| `ENG-move-onhit-effects` | 为 `move.v1` 增加 `onHit.applyBuffs`、`onHit.displace`、`parryable`，补三项 Buff 定义并按 O4 回填四招；验收为命中可附对应 Buff、回枝可击退 1 格、剑意无痕不可招架 |
| `ENG-19b` / `ENG-19e-m1-order` | 前者消费 `flow.ch00.*`、`tutorial.ch00.01`–`17` 文本键；后者编排题卡 / 配点 / 标题卡演出事件 |
| CONTENT-ch00b / ch00c | 锚点 `bookfall/to_shanjing/to_zhulin/to_yueying/transmission_inkpoint`、出口 `first_sleep_allocation/wake_to_baima`；遭遇 `enc_00_zhulin/enc_00_baiyuan/enc_00_biandao`；角色槽读 O2 |
| `CONTENT-ch00c-encounters` / `ENG-26-encounter-builder` | `enc_00_zhulin` 维护连续失败计数并按 O6 写 / 清 `fl_00_zhulin_loss_streak3`；内容侧只读，不得由进入对话伪造 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 内容清单（ID → 文件）：`npc_aqing/npc_baiyuan/npc_fanli → npcs/_drafts/<id>.yaml`；`role_road_swordsman/role_wu_swordsman/role_yue_soldier → roles/_drafts/<id>.yaml`；`prop_bamboo_staff → props/<id>.yaml`；`q_00_main_c_01`–`04 → quests/<id>.yaml`；8 个 `sk_* → common/skills/<id>.yaml`；10 个 `mv_* → common/moves/<id>.yaml`；DAG / Ink → `story/ch00/00-yuenv-main.yaml`、`story_ch00_main.*`。
- ✅ Ink knot ↔ DAG：`modern_opening→n_opening`、`prologue_mode→n_mode_intro`；`n_c01→aqing_first_meeting`；`n_c02→after_initial_battle/baiyuan_choice/baiyuan_after`；`n_c03→fanli_request/biandao_after/sword_source/nine_layer_preview`；`n_c04→aqing_first_layer/northbound_departure/first_sleep_allocation/wake_to_baima`；`skip_summary→n_summary`、`skip_direct→n_skip_direct`，均到 `first_sleep_to_baima`。
- ✅ 文本：`ch00.yaml` 110 个叶片键；流程卡 3+7+3，教学卡 17；四场景、三人物、三角色、竹棒及任务标题齐全。
- ⚠️ 灰盒 / `mockRef`：`npc_aqing/npc_baiyuan/npc_fanli` 与 `role_road_swordsman/role_wu_swordsman/role_yue_soldier` 均指向 `ENG-npc-species-roleslot`；白猿明确 animal/null/跳过人类年龄与默认好感 / 人形立绘管线；草案被生产发现器排除。
- ✅ 常显等价选择：`aqing_first_meeting` 问地点 / 问身份 / 拾枝；`fanli_request` 劝 / 不置词 / 先问；`sword_source` 手动 / 一键；`nine_layer_preview` 逐步 / 一键——均只在所属任务阶段出现、汇合后写同一收据，不发物品。
- ⚠️ 初阵选择：源文件正确写为 `get_flag("fl_00_zhulin_loss_streak3")`，但构建产物实参为 `ink.story_ch00_main.text.0019`；`ENG-ink-external-args` 修复前示范 / 活血丸门槛运行时不生效。
- ⚠️ 白猿选择：源文件正确写为 `has_item("it_tao")` / `not has_item("it_tao")`，但构建产物实参为 `.0024` / `.0026` 文本键；修复前有桃 / 无桃分支运行时不生效。
- ✅ 完整路线 C04：问功法 / 问沉睡 / 默记、已导入 / 稍后导出、回望 / 直接北行均在对应任务阶段常显；三项传功问答汇合后才发唯一 `requestTransmission(source=aqing)`，其余不发奖。
- ✅ 初眠 / 跳过：手配 / 均衡 / 返回检查在第一层后的配点阶段；摘要仅最终确认才请求补传功；直接跳过的现在配点 / 默认方案各在提交选择内请求补传功，均无物品或普通武学奖励。
- ✅ 全物品 effect：Ink 仅上述桃扣除 / 活血丸发放；任务 effect 的竹棒、金创药×2、桃仅在 C01 接棒阶段，清茶仅在 C03 越营试阵阶段，均与章节 §4 投放点一致。
- ⚠️ 与设计出入：传功在越营、三模式同出口；招名冲突按 catalog 保留并登记；external 源条件正确但编译产物错误，不能判为已通过。
- ✅ 原命令实跑（最终修订后）：`content:validate`（1164 文件 / 1100 对象 / 1 Ink / 62 地图）、DAG、items（1045=`1040+5`）、`content:build`（1159 对象 / 15 章）、冻结安装、strict ID（新失败 0）均通过；`pnpm check` 最终通过（141/141 文件、1014/1014 测试、内容与体积门通过），此前两次曾在 `content-plugin.test.ts` 触发 5000ms 超时，定点 2/2 通过。
- ✅ `content:compile-story` 脚本不存在；草案另经仓库 YAML 解析器 6/6 通过；`git diff --check` 与错误 gate / `everRecruitable:true` / 白猿 `mature` 扫描通过。
- ✅ 需作者确认（附默认）：无新增，按上述默认。
- ⚠️ 交 ENG / 验收字段：`ENG-ink-external-args` 合入后重编译 `story_ch00_main`，实测三处调用须严格为 `get_flag("fl_00_zhulin_loss_streak3")`、`has_item("it_tao")`、`not has_item("it_tao")`；另由 `ENG-ink-intents` 绑定执行。NPC / RoleSlot 见 O1–O2；MoveDef 见 O4。

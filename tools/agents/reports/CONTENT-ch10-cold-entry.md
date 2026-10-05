# CONTENT-ch10-cold-entry 报告 · 内容 · 白马（唐）ch10 冷入口到 M1 停点（烽燧废驿、人物、第一段对话、题卡）

## 1. 摘要（3–6 行）

已交付 48×32 风蚀废驿、3 名 NPC、7 个事件、Ink 与简中正文；返修统一门禁 ID 为 `gate_10_fengshi_dongmen`。
首谈锚点现为 `NpcSpawn:first_talk`，无名驿卒有正式定义及一句台词；火盆保留可真实发出的 `autosave:true`。
54 秒西行、三选一首谈、开门/自动档/题卡均有内容契约；旧鞍不发物品、不启动 C01。
五条指定检查全部通过；运行闭环仍受静态 binding、动作执行器和页面顺序阻塞，详见 §4/§6。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `content/world/regions/rg_xiyu_beijiang/sc_10_fengshi_feiyi.tmj` | 170 | 48×32 格、14 对象、12×10 安全院、统一门/首谈锚点 |
| `content/chapters/ch10_baima/npcs/*.yaml` | 140 | 沈青禾、李文秀成年视觉代理、无名驿卒 |
| `content/chapters/ch10_baima/events/*.yaml` | 64 | 到达、首谈、火盆及四调查点 |
| `content/story/ch10/*` | 56 | 48 行 Ink、8 行 metadata，3 knots / 3 choices |
| `content/locales/zh-Hans/ch10-cold-entry.yaml` | 34 | ch10 场景键及 `flow.ch10.wake` 四卡 |
| 本报告 | ≤60 | 结论、缺口、接口与验收记录 |

## 3. 关键结论与数值

- 年代为长安二年 702；高昌亡国纵深 `702−640=62` 年；过场 54 秒，落在 45–60 秒要求内。
- 地图 `48×32=1,536` 格；安全院从 `(11,11)` 起，`12×10=120` 格；地形含 `tr_shadi/tr_suishi/tr_shinei`，主线 qg0。
- 三选项“问年份 / 问旧城 / 帮捡药囊”均汇入 `first_talk_join`，顺序声明 `flag/set → world/openEntrance → save/autosave → title_card`。
- 最终构建为 994 对象 / 15 书界；ch10 `releaseHash=d28f73a45c8f133daae11dc4eaf0db0d9af7527b68eaadd267f68d286cb78601`。

## 4. 开放问题（附默认值）

| 编号 | 问题 / 默认值 |
|---|---|
| O1 | EventDef actions 未被宿主执行；默认保留意图。火盆自动档事件已可发出，`restoreBasicSurvival` 仍待执行器。 |
| O2 | Ink 仅消费 speaker；默认后续幂等执行 `flag/set`、`world/openEntrance`、`save/autosave`、`ui/showTitleCard`。 |
| O3 | 需装载 gate `{gateId: gate_10_fengshi_dongmen, expression: {flag: fl_10_cold_entry_talked}}` 与 dialogue `{sceneId: sc_10_fengshi_feiyi, anchorId: first_talk, storyId: story_ch10_cold_entry, entryKey: fengshi_first_talk}`；此前门保持锁定。 |
| O4 | 三名 NPC 已登记并产出名称文本；展示层仍硬编码回退“江湖人物”，默认 ENG 按 npcId 解析 displayName。 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；内容遵循 AR-29 与两份白马设计，不修改玩法基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 / 同步内容 |
|---|---|
| ENG-region-gates-data | Region binding | 装载东门 gate 与 `first_talk` dialogue binding；李文秀、驿卒锚点明确无独立对话绑定 |
| ENG-event-executor | EventDef 执行 | 消费 7 个 EventDef；迁移旧动作 `startStory/revealText/loadScene/restoreBasicSurvival/showText/observeOnly`，消费 `condition`、`once` 与各动作参数；保证一次性补给及地图 `autosave:true` |
| ENG-19e-m1-order | 白马页面流 | 严格落实八步停点、演出事件上屏，并按 npcId 解析沈青禾、李文秀、无名驿卒名称 |
| ENG-23b | 离线闭包成员 | 纳入 base/text/`rg-xiyu-beijiang` 叶片及 Ink JSON，书眠提交前校验 §3 `releaseHash` |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 场景对象与锚点：`cold_open(4,20)`；安全院 `(11,11,12×10)`；水囊 `(14,14)`、年号 `(18,14)`、火盆 `(17,18)`、`first_talk`/沈 `(20,18)`、旧鞍 `(21,18)`、刻痕 `(30,8)`、北封路 `(30,9)`、驿卒/李 `(28/30,12)`、东门 `(45,12)`。
- ✅ 对话 knots：`westward_journey`、`fengshi_first_talk.first_talk_join`、`title_card`；三项选择无路线分歧。
- ✅ 文本键：`ch10.coldEntry.{eraTitle,titleCard,sceneName,westwardJourney.*,interact.*,npc.*}` 与 `flow.ch10.wake.000–003.{title,body}`。
- ⚠️ 八步停点已声明：播/跳 54 秒→场景载入→玩家移动→对话完成→东出口点亮→自动档可读→题卡→自由操作；当前引擎未消费完整链。
- ✅ 与设计一致：旧鞍仅观察且无 C01/物品；水囊不造物品；未做 B、战斗、经济、门派、迷宫或大地图。
- ✅ 接口交给 ENG-region-gates-data（门/首谈绑定）、ENG-event-executor（事件动作）、ENG-19e-m1-order（八步/上屏/名称）、ENG-23b（规则/文本/区域/Ink/hash 离线闭包）。
- ✅ 五条必检全过：validate `999/935/1 Ink/62 maps`；build `994/15`；冻结安装；check `141 files/996 tests` + size；strict IDs 新失败 0（仅既有 `sk_babuganchan`）。
- ⚠️ 与设计出入仅为写集外阻塞：arrival EventDef 未接入口、bindings/动作未装载、speaker UI 未解析 NPC 名称、WakePage 仍提前题卡；不得验收为运行闭环。
- ✅ 需作者确认（附默认）：无新增，默认按 §4 的 O1–O4 执行。

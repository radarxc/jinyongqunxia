# ENG-ch00-encounter-wiring 报告 · 游戏工程 · 序章三战接线（M1）：ch00 三场遭遇转生产；game 会话消费 world/battleRequested → 参战者解析 → buildEncounter 开战，打完回原场景；救场 / 提示 / 示范、连败计数（fl_00_zhulin_loss_streak3）、结果旗标；确定性流程测试

## 1. 摘要（3–6 行）
三份 ch00 遭遇已从草案晋升生产内容，进入章节索引与字段校验。
game 会话现消费 `world/battleRequested`，动态加载 resolver、调用 `buildEncounter`，并与冥想战共用进入、结算、离开流程。
三战的救场、提示、示范、认输、留手、连败及结果旗标均已落地；代码接线缺口为零，浏览器人工冒烟尚待集成后执行。

## 2. 产出（文件、行数、主要章节）
- content：3 份生产 YAML（87/73/87 行）、README（139 行）及 C01/C02 任务挂钩。
- game：`encounter-runtime.ts`（201 行）、真实会话流程测试（379 行）及 session/UI/replay/content 装配。
- core/data：遭遇结算、命令、回放、地形继承、schema、字段注册与章节索引。

## 3. 关键结论与数值
- 路径：`world/battleRequested` 携 `encounterId/anchorId` → resolver → `buildEncounter` → `battle/enter`；结算后按 outcome 回原 scene/anchor。冥想战直接携 setup；其后两者共用 prepare/enter/finalize/leave。
- resolver：主角取存档实体；具名 NPC 取 full build；角色槽按模板生成，UUIDv5 输入为 run/chapter/template/spawn/ordinal，source snapshot 用 SHA-256。
- 竹林严格 `<45%` HP 仅救场一次；败 1/2/3 次写三档 streak，第二败提示、第三败开放确定性示范；胜或示范后清零。
- 白猿命中一次或坚持 2 轮判胜，认输成功推进，真败回选择；边道越卒同战，敌方 `≤30%` HP 可制服。结果写对应 manual/assisted、spar、biandao 与双演示旗标。
- 实图继承 terrainId、canopy、LOS、cover、地形子类乘区；白猿 full 修正已覆盖。固定种子三场测试均验证开战、结算、任务阶段、旗标、原位返回与逐字节一致；另验救场一次、连败跨读档。
- `pnpm size`：首次会话 97.34 KiB gzip（基线 97.42，-0.08）；战斗增量块 53.69 KiB（基线 53.22，+0.47），resolver 保持动态加载。

## 4. 开放问题（附默认值）
- 默认先用确定性 `battle/demonstration` 直接 assisted 结算；逐动作录像资产留作表现层后续，不阻塞 M1。
- 默认由集成监督按下节步骤做浏览器人工冒烟；本沙箱未启动浏览器。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `HANDOFF.md` / 序章验收：同步下节三战手动实走步骤；本任务写集外未改。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 三遭遇生产化、world 请求接线、resolver、共用战斗生命周期、结算回场景均完成。
- ✅ 救场/提示/示范/连败持久化、认输/留手、结果旗标、任务推进及双演示接线完成。
- ✅ `pnpm install --frozen-lockfile`、game 43 文件/178 测试、ID strict（354 文件，新增失败 0）通过；`git diff --check` 通过。
- ✅ `pnpm check` 中 lint、typecheck、全仓 178 文件/1273 测试通过。
- ⚠️ `pnpm check` 最终 content validate、单跑 `content:build` 与 `content:validate` 均被沙箱拒绝 tsx Unix socket（`listen EPERM .../tsx-501/*.pipe`）；未改 node_modules，交沙箱外校验。
- ✅ M1 序章三战代码与内容接线剩余缺口为零；仅余人工浏览器冒烟及非阻塞的逐动作示范表现资产。

## 序章三战手动实走步骤（本节不计入报告 50 行）

### 共通起点
1. 标题页点“新游戏”，填写身份与难度，点“确认身份，翻开残卷”；完成开场并选择“完整序章”。
2. 每次开战前记住角色所处格；结算页返回后核对场景、交互锚点和格坐标均恢复。

### 竹林 `enc_00_zhulin`
1. 在竹林与阿青 `npc_aqing_zhulin` 交谈，走完对话即开战；来源应为 `sc_00_zhulin`、锚点 `npc_aqing_zhulin`、格 `(8,9)`。
2. 必胜：接近路卒并攻击；目标 HP 到 30% 以下后逐个点“止战·制服”，结算页点“返回来源场景”。
3. 输三次：持续“待机”并让敌人围攻，败后点“再战”；第一次主角 HP 严格低于 45% 时只见一次 `aqing_rescue`，第二次败后的重试见 `terrain_hint`，第三次败后的重试出现“接受书灵示范”，点击后 assisted 完成。
4. 核对：手动胜写 `fl_00_initial_battle_manual`，示范写 `fl_00_initial_battle_assisted`；完成后三档 `fl_00_zhulin_loss_streak1/2/3` 清零，C02 进入 `st_track`，返回上述原位。

### 白猿 `enc_00_baiyuan`
1. 走 `to_shanjing`，与 `npc_baiyuan_shanjing` 交谈并选“以竹棒试手”；来源应为 `sc_00_shanjing`、同名锚点、格 `(13,7)`。
2. 必过：命中白猿一次或存活到第 2 轮；也可点“主动认输”验证认输仍推进，随后返回原山径锚点。
3. 输三次：每场持续待机至倒地，点“返回来源场景”，重新交谈并选择试手，共重复三次；每次均应回 `st_baiyuan_choice`，且 `fl_00_baiyuan_spar=false`。
4. 核对：成功或认输写 `fl_00_baiyuan_spar_done`；走完战后交谈写 `fl_00_baiyuan_merged`，C02 完成。

### 边道 `enc_00_biandao`
1. 经 `to_yueying` 到越营，与范蠡 `npc_fanli_yueying` 交谈并完成请求后开战；来源应为 `sc_00_yueying`、同名锚点、格 `(13,6)`。
2. 必胜：让越卒自动行动，集中攻击吴剑士；每个敌人 HP 到 30% 以下时点“止战·制服”，逐个结束战斗。
3. 输三次：让主角前移后持续待机或调息，承受敌方集火；败后点“再战”，重复至三败。本战不应写竹林 streak。
4. 核对：胜后点“返回来源场景”，依序完成 `biandao_after`、剑法演示选择、九层预览选择；应写 `fl_00_biandao_done`、`fl_00_sword_demo_seen`、`fl_00_nine_preview_seen`，C03 完成并回上述原位。

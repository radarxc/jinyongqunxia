# ENG-25-content-schemas-m1 报告 · 游戏工程 · M1 内容所需 schema（quest.v1、MoveDef、story_art 与章内道具、Ink 动作白名单）
## 1. 摘要（3–6 行）
已新增 strict `quest.v1` / `move.v1` schema、registry kind、字段分类和强引用检查。
MoveDef 覆盖现有 `BattleMove` 字段，并由纯函数 `compileBattleMove()` 映射，不在 data 结算规则。
武学接纳 `story_art` 与 `tutorial_projection`；物品接纳严格 `prop_* + chapterBound:true`。
Ink 白名单扩为 12 个 M1 opcode，未知、重复、多余、缺失、自由 JSON和值域错误均失败。
本轮将序章主线 ID 收窄为 `q_00_main_c_01`–`q_00_main_c_04`，并补齐边界回归测试。
全部指定安装、检查、构建、测试、内容校验与 strict ID 门禁通过。
## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `schemas/move.ts` / `quest.ts` | 105 / 137 | MoveDef、BattleMove 映射；QuestDef、条件/动作、阶段图 |
| registry / index / field registry | 约 300（含既有） | kind 注册、索引、link、规则/文本字段分类 |
| item / martial-art / primitives | 约 300（含既有） | q_00 的 01–04 窄例外、story_art、教学投影、prop 章内约束 |
| `build/ink.ts` / 测试 | 约 400（含既有） | 参数化 opcode registry；正反例、引用与映射测试 |
| CLAUDE / README / 本报告 | 4 文件 | 内容作者与下游契约 |
## 3. 关键结论与数值
| schema | 关键字段 / 约束 |
|---|---|
| `quest.v1` | `id/kind/chapterId/startStageId/flagIds/encounterIds/stages/tracking/source`；只接纳 `q_00_main_c_01`–`q_00_main_c_04`，拒绝 `05`、`99` 与 `q_00_main_z/x_*` |
| `move.v1` | 威力 bp、参考威力、内外权重、收招 700–1500、耗内、部位、射程、投送、strict 形状、高差、目标/友伤、路线与点穴字段 |
| `martial-art.v1` | `category:story_art` 只准 `sk_changshengjue` 且 9 层；`tutorial_projection` 只准 ch00 并要求回执 `ref` |
| `item.v1` | `prop_*` 必须 `chapterBound:true` 且恰属一章；反向也禁止普通 `it_*/eq_*` 冒用该标记 |
| 编译边界 | `compileBattleMove()` 仅复制/规范化字段；路线、伤害、资源、几何结算均留 core |
| 实测 | `pnpm check`：98 文件 / 578 测试；data：10 文件 / 90 测试；内容 394 对象；build 391 对象 / 14 章 / 2291.6 ms |
## 4. 开放问题（附默认值）
| 编号 | 问题 | 默认值 |
|---|---|---|
| O1 | EncounterDef 独立 kind 尚未由 ENG-26 落地 | Quest 先以自身唯一 `encounterIds` 声明闭合；ENG-26 接管后改查全局 encounter registry |
| O2 | 经脉路线尚无 data registry kind | MoveDef 严格校验 `mfr_*` 形状并输出引用；后续路线 schema 落地后升级为存在性检查 |
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无；`q_00` 例外已由 `design/12` 接纳，本任务只登记技术同步。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 / 同步内容 |
|---|---|
| `design/12` | §11.1 schema 投影补 `startStageId/flagIds/encounterIds`，明确 q_00 只准 `q_00_main_c_01`–`q_00_main_c_04` |
| `tech/04` | §7 登记下表 12 个 opcode 及严格标量参数 |
| ENG-17a | 实现所有 opcode 的 core 二次校验、幂等事务；data 只解码 |
| ENG-26 | 遭遇构建读取 `move.v1`/`compileBattleMove()`；建立 EncounterDef 后替换任务局部 encounter 声明 |
| CONTENT-ch00 / ch10 | 按 README 写 quest/move/prop/Ink；`prop_*` 离章由 core 销毁，不由内容脚本手工清理 |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
**引用检查表：**
| 来源 | 目标 | 结果 |
|---|---|---|
| MartialArt `moveIds` / MoveDef `skillId` | move / martialArt | ✅ 双向存在；兼容旧内容：仓内出现 move kind 后启用全量 moveIds 门禁 |
| Quest 条件/目标/效果 | quest、flag、item、skill、story+knot、encounter | ✅ 全部强校验；stage 出口、可达、终态及局部 ID 唯一 |
**opcode 白名单（均由 ENG-17a/core 执行）：**
| opcode | 参数 |
|---|---|
| `quest/advance` / `battle/start` / `flag/set` | `quest,stage` / `encounter` / `flagId,value?` |
| `party/giveItem` / `party/takeItem` / `world/openEntrance` | `item,count` / `item,count` / `entrance` |
| `tutorial/mark` / `story/requestTransmission` | `tutorial,state` / `skill,source` |
| `ui/openAllocation` / `ui/showTitleCard` | `mode` / `card` |
| `save/autosave` / `dialogue/speaker` | `reason` / `speaker` |
- ✅ 每个新 schema 有正反例；q_00 的 `01`–`04` 通过、`05/99/z` 拒绝；引用缺 move/flag/encounter/item/story knot 均有反例；MoveDef 映射有断言。
- ✅ 每个 opcode 一正一反；重复参数、未知 opcode、自由 JSON、缺参数继续失败。
- ✅ `install --frozen-lockfile`、`check`、`content:build`、data test、`content:validate`、strict IDs 全通过；strict 新失败 0。
- ✅ 现有内容校验仍为 394 对象；未改 core/apps/content 数据、门禁、阈值或依赖。

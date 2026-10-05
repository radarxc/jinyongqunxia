# ENG-02-models 报告 · 游戏工程 · 数据层（人物 / 物品 / 剧情 DAG / 事件 / 时间 schema 与核心状态）

## 1. 摘要（3–6 行）

完成 `@tianshu/data` 的人物、武功、经脉、物品、商店、剧情 DAG、事件与书界 schema，以及 YAML 单次校验、深冻结和 O(1) 索引。
完成 `@tianshu/core` 的三层 `GameState`、人物资源推导、背包/装备/世界物品/商店/剧情状态、整数时钟与规范状态边界。
加入 3 NPC、6 物品、1 店、1 内功、1 外功及天龙主线夹具；指定安装、全量检查和严格 ID 检查均通过。
本轮返修新增 shared 安全整数 floor/ceil 除法，替换 core 时钟与校验的 18 处原生 `/`，语义与规范哈希不变。
根检查链现显式执行 core 包级整数 lint；data/core 交接文档已补 schema、状态根、入口与包级命令。

## 2. 产出（文件、行数、主要章节）

- `packages/data/src/schemas/*.ts`：785 行；公共原语、人物/模板、武功/实例、经脉/迁移、十一类物品结构、剧情图、商店/事件/书界。
- `packages/data` 内容加载实现 296 行、相关测试 500 行；YAML 严格解析、引用校验、冻结 registry、O(1) 索引。
- `packages/core/src/state/*.ts`：708 行；模型、人物推导、背包、十一装备槽、世界物品/商店、剧情、时钟、初始化、校验与克隆。
- `content/` 夹具：909 行；`story/ch01/01-tianlong-main.yaml`，3 NPC、6 物品、1 店、2 武功。
- `packages/shared/src/integer-division.ts`：28 行；安全整数校验、BigInt floor/ceil 语义及正负边界测试。
- 工程/交接：根 lint 显式调用 core lint；`content:validate` 已入 `pnpm check`；两份包级 `CLAUDE.md` 共 59 行。

## 3. 关键结论与数值

- 资源层为 `min(trueLayer, 9)`，人物没有独立等级；第 10 层不再增加 `hpMax/mpMax`。
- `hpRoot=300+skillHp+innerHp+8×开穴数+6×经脉分+2×穴位分+legacyHpCredit`。
- `mpRoot=200+innerMp+6×开穴数+8×经脉分+3×穴位分+legacyMpCredit`。
- DES-qi 样例复算：`hpMax=300+270+190+72+144+324=1300`；`mpMax=200+290+54+192+486=1222`，已有断言。
- 时间为 10 tick/分钟、600 tick/小时、1200 tick/时辰、14400 tick/日；战斗不推进世界时钟。
- 客栈睡眠基准 8 小时且夜间至少到卯时；打坐 1 小时；旅行分钟向上折算为整小时。
- `floorDivInt/ceilDivInt` 仅接收安全整数、拒绝零除数，以 BigInt 精确求商；18 处替换后时辰及日/月/年边界语义不变。
- 正式内容加载 13 个对象；加载期校验一次，registry 递归冻结，并以 `kind:id` Map 做 O(1) 查询。
- seed=1、`rngProtocol=2` 连续执行两次 `world/tick` 的规范状态 SHA-256 为 `6c662aaaffac2f217c156daea07a9f7c8998c1ac483595cf81e6291e8845e366`。

## 4. 开放问题（附默认值）

- 游戏日历仍为建议值；默认 30 日/月、12 月/年、子时从 23:00 起。
- 旅行的正式路段修正归 ENG-05；当前 API 默认把输入分钟向上取整到小时。
- 战斗世界时间换算默认 0；若剧情需要耗时，由显式剧情推进命令处理。
- 当前人物模型只落本任务要求的核心面板；完整 S0–S11 属性、战斗经脉瞬态由后续任务扩展。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无新增提案；实现沿用 AR-19、`design/03` §5.1、`design/24` §5 与 `tech/05` §3–§5 的既定口径。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 已同步 `packages/data/CLAUDE.md`：schema 清单、运行时/工具入口、冻结索引流程与包级命令。
- 已同步 `packages/core/CLAUDE.md`：`GameState` 根、状态/推导/时间入口、零浮点 helper 与包级命令。
- 无新增越权文档修改需求；ENG-03 / 05 / 06 / 07 应以上述两份包级交接为实现入口。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ schema 清单：`character.ts`=`NpcDef/CharacterTemplate`（tech/04 §3.11）；`martial-art.ts`=`MartialArtDef/SkillInstance`（§3.6）；`meridian.ts`=`MeridianDef/AcupointDef/MeridianProgress`（§3.8）；`item.ts`=`ItemDef`（design/10 §2）；`story*.ts`=`StoryLine/Node/Edge/TimeWindow`（design/24 §§1–5）；`world.ts`=`ShopDef/EventDef/BookWorldDef`。
- ✅ GameState：`meta`（含 `rngProtocol`）；长期 `profile`；书界 `chapter`；队伍 `party`；临时 `transient`；预留 `battle:null`；均为 JSON 安全整数状态。
- ✅ 推导公式落点：`packages/core/src/state/character.ts::deriveCharacterStats`；DES-qi 1300/1222、十层封顶、bp 安全整数与下限测试齐备。
- ✅ 夹具路径：`content/story/ch01/`、`content/chapters/ch01_tianlong/{npcs,shops}/`、`content/common/{items,skills}/`。
- ✅ 下游入口：`loadContent`、`parseContentFile`、`ContentRegistry.get/require`；`createInitialGameState`、`deriveCharacterStats`、`addInventoryItem`、`createWorldItems`、`createShopState`、`createStoryState`、`advanceGameClock/InnRest/Meditation/Travel/Battle`、`parseGameState`、`cloneGameState`。
- ✅ 零浮点专项：`clock.ts` 12 处、`validate.ts` 6 处原生除法均改用 `floorDivInt/ceilDivInt`；`pnpm --filter @tianshu/core lint` 通过。
- ✅ 检查链防回归：根 `pnpm lint` 日志确认继续执行 `pnpm --filter @tianshu/core lint`。
- ✅ `pnpm install --frozen-lockfile`：通过（pnpm 9.15.9，lockfile 无漂移）。
- ✅ `pnpm check`：通过；普通组 24 文件 / 117 项，rig 组 1 文件 / 2 项，共 25 文件 / 119 项；13 个内容对象、构建与包体预算全绿。
- ✅ `python3 tools/lint/check_ids.py --strict`：通过；扫描 128 文件、67,206 次出现、14,143 个定义；仅基线 `sk_babuganchan`，新增严格失败 0。
- ✅ 规范序列化：seed=1 同命令序列仍命中固定 SHA-256；ENG-00b golden 未改。
- ✅ 范围与文档：只改授权路径；data/core `CLAUDE.md` 已补交接清单；报告 100 行以内。

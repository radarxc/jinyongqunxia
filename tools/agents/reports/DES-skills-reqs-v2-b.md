# DES-skills-reqs-v2-b 报告 · 名录门槛重配 B（部录 08–14） · 按属性 v2 规则重写 reqs（加内息与修炼加成，AR-27）

## 1. 摘要（3–6 行）

- 已按 AR-27 与 `design/05` §7.3 重配部录 08–14 全部 50 门武学：重算 `reqs.attrs`、按 `5×grade−5` 迁移资质，并补齐 `trainingAttrs`。
- 七册均补入 `design/03` v2 上游与属性 v2 数据校验；既有 `prereq`、`sect`、`hard` 未改。
- 50/50 条通过逐卡结构审计；两项强制 lint 均以退出码 0 通过。
## 2. 产出（文件、行数、主要章节）

- `skills-bulu-08-luding.md` 360 行（22 门）、`09-liancheng.md` 193 行（4 门）、`10-baima.md` 310 行（4 门）、`11-yuanyang.md` 169 行（1 门）。
- `skills-bulu-12-shujian.md` 275 行（3 门）、`13-feihu.md` 410 行（14 门）、`14-xueshan.md` 210 行（2 门）；均更新文首上游/版本、武学卡机器字段、数据校验规则。
- 本报告记录迁移核算、开放问题、上游同步项与验收结果。
## 3. 关键结论与数值

- 总计 50 门（22+4+4+1+3+14+2）；资质统一为五至九品 `20/25/30/35/40`，全部永久加成只用六项沉睡属性，节点为 3/6/9 重、单节点 1–4、单门不超过 12。
- 部录 08① `sk_aobaihengliangong`：旧 `{con:50,str:55}/apInner:50` → 地中硬功横练 `主50/次40` → `{con:50,bre:40}/35`；加成 `con +1/+2/+2`。
- 部录 08② `sk_xueyuhufashou`：旧 `{str:48,wil:48}/apFist:50` → 地中拳掌 `50/40` → `{str:50,con:40}/35`；加成 `str +1/+2/+1`。
- 部录 09① `sk_wanjiazhengqi`：旧 `{con:30,wil:30}/apInner:25` → 玄中内功 `35/30` → `{bre:35,wil:30}/20`；加成 `bre +1/+2/+2`。
- 部录 09② `sk_jingzhouguanfuqinfa`：旧 `{str:30,agi:30}/apGrapple:25` → 玄中拳掌映射 `35/30` → `{str:35,agi:30}/20`；加成 `str +1/+2/+1`。
- 部录 10① `sk_huahuixinfa`：旧 `{con:40,wil:45}/apInner:40` → 地上内功 `55/45` → `{bre:55,wil:45}/40`；加成 `{bre:1}/{bre:1,wil:1}/{bre:1,wil:1}`。
- 部录 10② `sk_majiajunfeizhen`：旧 `{agi:45,wil:40}/apHidden:40` → 地上暗器 `55/45` → `{agi:55,wis:45}/40`；加成 `{agi:1}/{agi:2}/{agi:1,wis:1}`。
- 部录 11（全册仅一门，故 1/1 全量核算）`sk_zhentiansanshizhang`：旧 `{str:40,con:35}/apFist:40` → 地下拳掌 `45/35` → `{str:45,con:35}/30`；加成 `str +1/+2/+1`。
- 部录 12① `sk_tiedanzhuangxinfa`：旧 `{con:35,wil:35}/apInner:30` → 地下内功 `45/35` → `{bre:45,wil:35}/30`；加成 `bre +1/+2/+2`。
- 部录 12② `sk_tianchishengong`：旧 `{con:45,wil:45,wis:40}/apInner:40` → 地上内功 `55/45` → `{bre:55,wis:45}/40`；三节点合计 8，未超 12。
- 部录 13① `sk_miaojiaxuangong`：旧 `{con:50,wis:50,wil:45}/apInner:50` → 地上内功 `55/45` → `{bre:55,wis:45}/40`；加成节点各不超过 2。
- 部录 13② `sk_wuhudaofa`：旧 `{str:35,agi:30}/apBlade:35` → 玄上刀法 `40/35` → `{str:40,agi:35}/25`；加成 `str +1/+2/+1`。
- 部录 14① `sk_cangfengxingqi`：旧 `{con:42,wis:45,wil:38}/apInner:40` → 地下内功 `45/35` → `{bre:45,wis:35}/30`；加成 `{bre:1}/{bre:1,wis:1}/{bre:1,wis:1}`。
- 部录 14② `sk_cuomaifanzhang`：旧 `{agi:40,wis:45}/apFist:40` → 地下拳掌 `45/35` → `{str:45,agi:35}/30`；加成 `agi +1/+2/+1`。
- 与 §7.3.3 三十门样例的 ID 交集为 0；无可直接逐值比对项，也无冲突。
## 4. 开放问题（附默认值）

- 指法、擒拿没有独立门槛行；默认擒拿映射拳掌，地上且内劲占比 0.65 的瓦耳拉齐指手配为 `{bre:55,agi:45}`。
- `category:inner` 且叙事为横练时缺少类别优先级；默认鳌拜横练功、布库护腰功优先用硬功横练 `con/bre`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无 Canon 修改提案；AR-27 的运行边界足以承载本批数据，子类映射缺口见第 6 节。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/05` §7.3.1：补“擒拿 × 玄中/玄上/地中”及“指法 × 地上”的明确映射值；本批分别暂用拳掌行与内劲指法手配。现有广义类别 × 所用品阶均有数值，无其他空格。
- `design/05` §7.3.1–§7.3.2：明确“内功类别 + 横练描写”时硬功横练行是否优先，避免后批迁移分歧。
- `tools/lint/check_skill_catalogs.py`：后续可加入 `trainingAttrs` 层位/属性白名单/预算及 `aptitude=5×grade−5` 校验；本批已用临时逐卡审计覆盖。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 仅改 7 份负责名录并新建本报告；未改 ID、未执行改变仓库状态的 git 命令。
- ✅ 50/50 门均重算属性和资质并新增唯一 `trainingAttrs`；`prereq/sect/hard` 修改前后语义片段一致。
- ✅ 七册上游均含 `design/03` v2，门槛校验规则均已同步；未发现占位语句。
- ✅ `python3 tools/lint/check_skill_catalogs.py`：25 册、`errors=0`、退出码 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：严格失败数 0、退出码 0；仅显示基线已有 `sk_babuganchan` 未定义项，无本任务新增。
- ✅ `git diff --check` 通过；三十门样例交集核对为 0。

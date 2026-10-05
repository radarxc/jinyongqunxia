# DES-skills-reqs-v2-a 报告 · 名录门槛重配 A（部录 01–07） · 按属性 v2 规则重写 reqs（加内息与修炼加成，AR-27）
## 1. 摘要（3–6 行）
已按 AR-27 与 `design/05` §7.3 重配部录 01–07 全部 49 门武学；本轮纠正两门非外放拳掌。
每门均重算 `reqs.attrs` / `aptitude` 并新增顶层 `trainingAttrs`；`prereq` / `sect` / `hard` 保持不变。
七册上游均加入 `design/03` v2，数据校验规则同步覆盖门槛带与 3/6/9 重加成边界。
两项指定 lint 均通过；30 门代表样例与本范围没有同 ID 条目。
## 2. 产出（文件、行数、主要章节）
| 文件 | 行数 | 主要改动 |
|---|---:|---|
| `skills-bulu-01-tianlong.md` | 258 | 3 门 reqs / 加成、V11 |
| `skills-bulu-02-shediao.md` | 369 | 5 门 reqs / 加成、V10 |
| `skills-bulu-03-shendiao.md` | 422 | 7 门 reqs / 加成、V14 |
| `skills-bulu-04-yitian.md` | 590 | 12 门 reqs / 加成、V13 |
| `skills-bulu-05-xiaoao.md` | 494 | 8 门 reqs / 加成、规则 8 |
| `skills-bulu-06-xiake.md` | 349 | 6 门 reqs / 加成、T10 |
| `skills-bulu-07-bixue.md` | 466 | 8 门 reqs / 加成、T10 |
## 3. 关键结论与数值
共改 49 门：内功 35、拳掌 / 擒拿 6、兵器 / 奇门 6、暗器 2；本轮将幻阴手改 `{str55,agi45}`、任我行掌法改 `{str55,con45}`，49/49 均符合门槛表且有 `trainingAttrs`。
各册抽 2 条重算：01 段氏一阳诀 `{con55,wis55,wil50};ap55` → 内功天中主 65/次 50 → `{bre65,wil50,wis50};ap50`；降龙行功 `{str60,con60,wil55};ap60` → 内功天上 70/55、丐帮修正 → `{bre70,con55,str55};ap55`。
02 铁掌运气功 `{str55,con55,wil45};ap52` → 内功天下 60/45、刚猛护体手配 → `{bre60,con50,str45};ap45`；桃花归元诀 `{wis60,wil55,con50};ap58` → 内功天中 65/50、桃花 `wis/bre +5` → `{bre70,wis55,wil50};ap50`。
03 赤练拂尘 `{agi55,wis50};ap55` → 鞭索按轻灵兵器地上 55/45 → `{agi55,wis45};ap40`；金刚护法功 `{con55,wil55,str45};ap55` → 内功地上 55/45 → `{bre55,con45};ap40`。
04 金花镖法 `{agi45,wis40};ap46` → 暗器地中 50/40 → `{agi50,wis40};ap35`；玄冥寒元功 `{con55,wil55,wis48};ap55` → 内功天下 60/45、阴柔稳定 +5 → `{bre60,wil50};ap45`。
05 剑宗行气诀 `{agi40,wil35};ap35` → 内功地中 50/40 → `{bre50,agi40};ap35`；葵花飞针 `{agi50,wil45};ap45` → 暗器地上 55/45 → `{agi55,wis45};ap40`。
06 摩天掌 `{str35,wil35};ap30` → 拳掌地下 45/35、外放次项取内息 → `{str45,bre35};ap30`；侠客岛气功 `{con40,wil40};ap35` → 内功地中 50/40 → `{bre50,wis40};ap35`。
07 华山叠劲拳 `{str45,con42};ap45` → 拳掌地中 50/40 → `{str50,con40};ap35`；铁剑玄功 `{con40,agi40,wil40};ap40` → 内功地上 55/45 → `{bre55,wil45};ap40`。
30 门样例重合核对：正式卡 ID 交集为 0，故无逐值冲突；同类模板与样例的品阶带、资质公式及加成上限一致。
`trainingAttrsReason`（内功 I1–I4；模板依次写 3/6/9 重）：I1 `{bre1}/{bre2}/{bre2}`＝标准吐纳（`sk_caoyuanjunzhenxinfa`、`sk_motianyunqi`、`sk_kunlunliangyixinfa`、`sk_huashanliangyixinfa04`、`sk_gaibangjuyigong`、`sk_huashanziqijue`、`sk_jinlongbangxinfa`、`sk_shiliangwuxinggong`、`sk_xianduyunqi`、`sk_huashanqigong07`、`sk_tiejianxuangong`）；I2 `{bre1}/{bre1,wil1}/{bre1,wil1}`＝养心 / 稳定（`sk_chiliandugong`、`sk_jueqingbixuejue`、`sk_dingshixinfa`、`sk_mingjiaohujiaogong`、`sk_huanyinxinfa`、`sk_xuanminghanyuangong`、`sk_kongtongwuxingxinfa`、`sk_quanzhenzhoutiangong`、`sk_jiuyinxieliangong`、`sk_duanshiyangjue`、`sk_heimuxuangong`、`sk_shanzongzhengqigong`）；I3 `{bre1}/{bre2,agi1}/{bre1}`＝行气助身法（`sk_jianzongxingqi`、`sk_qingchengyunqi`）；I4 `{bre1}/{bre2,con1}/{bre1}`＝运气护体（`sk_songshanzhenqi`）。
`trainingAttrsReason`（内功 I5–I8）：I5 `{bre1,con1}/{bre2,con1}/{bre1}`＝护体内功（`sk_lingxiaozhenyuegong`、`sk_minggonghuyuangong`）；I6 `{bre1,con1}/{bre2,con1}/{bre2,con1}`＝高阶密宗护法（`sk_jinganghufagong`）；I7 `{bre1,wis1}/{bre2,wis1}/{bre2,wis1}`＝精微悟法（`sk_xiakedaoqigong`、`sk_bosishenghuoxuangong`、`sk_taohuaguiyuanjue`、`sk_tianshanliuyangxinfa`）；I8 `{bre1,str1}/{bre2,str1}/{bre2,con1}`＝刚猛行功兼护体（`sk_tiezhangyunqigong`、`sk_xianglongxinggong`）。
`trainingAttrsReason`（外功 E1–E5）：E1 `{agi1}/{agi2,wis1}/{agi1}`＝轻灵精确（`sk_chilianfuchen`、`sk_jinhuabiaofa`、`sk_kuihuafeizhen`）；E2 `{str1}/{str2,agi1}/{str1}`＝灵巧近身 / 复合兵器（`sk_jindaoheijianjue`、`sk_dingshiqinnashou`、`sk_jinhuazhangfa`、`sk_huanyinshou`）；E3 `{str1}/{str2,bre1}/{str1}`＝外放掌劲兼行气（`sk_motianzhang`）；E4 `{str1}/{str2,con1}/{str1}`＝刚猛近身 / 长兵根基（`sk_lutouzhangfa`、`sk_songshankaihezhang`、`sk_renwoxingzhang`、`sk_huashandiejinquan07`）；E5 `{wis1}/{wis2,agi1}/{wis1}`＝奇门变化与手法（`sk_xueshantieshan`、`sk_hezuibifa`）。
## 4. 开放问题（附默认值）
1. 指 / 腿 / 擒拿 / 鞭索 / 刀剑复合缺独立表行；默认按最接近类别及 `wOut/wIn` 手配，详见 §6。
2. `trainingAttrs` 的名录序列化沿用 `design/05` schema；默认使用顶层字段，不塞入 `reqs`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
| 编号 | 提案 | 理由 |
|---|---|---|
| AR27-CAT-A01 | Canon §7/§18 登记 `trainingAttrs` 与 `bre` 门槛 | 使名录数据与 AR-27 schema 有基准锚点 |
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 | 改什么 |
|---|---|---|
| `design/05` | §7.3.1 类别表 | 补指法、腿法、擒拿、鞭索、刀剑复合各品阶主 / 次属性；当前这些“类 × 品阶”没有专属门槛值 |
| 其余 catalog | `reqs` / `trainingAttrs` | 依同一规则继续分批迁移，不复制本册具体数值 |
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 仅修改 7 个指定名录并新增本报告；未改基准、TODO、脚本或其他文档。
- ✅ 49/49 门完成属性、资质与加成重配；`prereq` / `sect` / `hard` 与旧文逐项一致。
- ✅ `trainingAttrs` 均为 3/6/9 重，单次 1–4、单门合计 ≤12；上游与校验规则已同步。
- ✅ 本轮将两门非外放拳掌改用拳掌表的 `str + agi/con`，同步修炼加成；13 组理由覆盖 49 个唯一 ID；目录 lint 为 `catalogs=25 errors=0`。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过，新增严格错误 0（仅既有基线 `sk_babuganchan`）。
- ⚠️ 30 门样例无同 ID 项可直接逐值核对；已核对交集为 0。
- ⚠️ 需作者确认（附默认）：指 / 腿 / 擒拿 / 鞭索 / 刀剑复合缺独立表行，默认按最近类别与 `wOut/wIn` 手配；`trainingAttrs` 默认作 `SkillDef` 顶层字段序列化。
- ✅ 交下游（ENG-*）字段清单：`ENG-ATTR-01` 消费 `reqs.attrs.bre`；`ENG-SKILL-01` 消费并校验 `trainingAttrs[{layer,attrs}]` 的 3/6/9 重、单次 ≤4、单门 ≤12 约束。

# NXfix-general 报告 · 终审·收尾（门派图鉴）· 通行

## 1. 摘要（3–6 行）

完成 `skills-general.md` 的经脉落地终审及 A–E 返修：补齐两册来源依据、四记音功外放字段与三条普通外放路线。
按出招方式修正绝招路线末端、穴位正式 ID、用途镜像和玄上过期统计，并消除册内高相似路线。
穿云啸“断喝／回声”已按紧凑卡正式展开，三式路线均只换脉一次；七弦音改为动作描述而不新增装备门槛。
“斩马”条件绝招统一为 §4.2 / §4.8 的乘区算法；所有指定门禁最终通过。
未改写集外文件；跨册事项及仍需考据的外放候选已在 §7 交接。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-general.md` | 1644 | 文首绝招路线索引、§4.1 来源索引、§4.3 来源卡、§8.8 音功卡、§10 统计与外放审计、§11.6 路线和镜像、§12 ID、§13 校验、§14 待决 |
| `tools/agents/reports/NXfix-general.md` | 111 | 本次终审结论、A–E 返修、门禁、开放问题与跨册交接 |

## 3. 关键结论与数值

- 来源扩展共 3 项：`sk_baizhanxinfa→ch12_shujian`、`sk_baizhanxinfa→ch14_xueshan`、`sk_pojunqiangfa→ch14_xueshan`；目录、`sourceChapters` 与卡面均逐项注明补录册依据。
- AR-16 外放由 0 改为 4：玄中“穿云／断喝／回声”3、玄上“乱弦”1。四式均为深厚内力主动控制且有伤害段的音功；0 档普通，只有 1／2 档启用外放加持。
- 穿云啸三条普通攻击路线均至多一次换脉：穿云 4 段 `ΣCT=290`、风险 700、总收招 1290；断喝与回声各 3 段 `ΣCT=225`、风险 600／630、总收招 1225；均 `≤2000 CT`。
- 玄上镜像中 15 条路线为 `6×100=600 CT`、风险 900；“三针”“通臂”各为 `8×75=600 CT`、风险 1080；均满足 `1200+600=1800≤2000 CT`。
- “斩马”罕见条件按统一乘区核算：`3.00×(1+0.30)=3.90`，不再写成 `3.00+0.30`。
- 最终目录：38 条绝招路线、38 个不同序列；册内完全相同 0、相似度 ≥80% 0、与全仓其他武学完全相同 0。
- 末端规则最终为 `violations=0`、`tail_violations=0`；未定义引用 0。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 本轮默认值 |
|---|---|---|
| GEN-O12 | “穿云啸”的“断喝／回声”正式 ID、逐招 AR-16 与路线 | **已解决**：按 §12.3 展开 `mv_chuanyunxiao_duanhe/huisheng`，两式均标外放并登记唯一显式路线 |
| GEN-O13 | “海天一线”是否明确为离体掌力、“飞白”是否为内劲墨锋，原著／设定依据不足 | 继续标（待考），默认不标外放；不因远程表现自行推定 `projected` |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。来源扩展、音功 0／1／2 档、出招末端及倍率乘区均可由 Canon v1.6、`design/05` 与 `design/21` v2.5 直接推出，不需要修改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `design/05` 或招式数据 schema | `MoveCondition` 正式键 | “斩马”目前以正文表达“目标骑乘”；数据化前应明确复用 `targetHasTag` 的合法值还是登记专门的骑乘条件键，不能生成未知键 |
| `design/21` | §4.4.1.1 穿云啸行 | 可补“断喝／回声已在 `skills-general` 登记为正式 ID，逐招结论见其 AR-16 表”；交 NAu-21／后续审计，本任务不改 21 |
| 其余门派图鉴 | 见 §7.5 | 本任务写集外的来源、外放、穴位、purpose、镜像与表格问题由对应 `NXfix-<册>` 处理 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单

| 状态 | 目标 | 落实结果与依据 |
|---|---|---|
| ✅ | `sk_baizhanxinfa→ch12_shujian` | 已加入目录及 `sourceChapters`，卡面已注依据：`skills-bulu-12-shujian.md` §3（SJ-BL-D02；清军将领／假旗队主运） |
| ✅ | `sk_baizhanxinfa→ch14_xueshan` | 已加入目录及 `sourceChapters`，卡面已注依据：`skills-bulu-14-xueshan.md` §1.2（清廷围捕、赛总管及军伍精英） |
| ✅ | `sk_pojunqiangfa→ch14_xueshan` | 已加入目录及 `sourceChapters`，卡面已注依据：`skills-bulu-14-xueshan.md` §1.2（清廷围捕、赛总管及军伍精英） |
| ✅ | 补录索引 | §4.1 已指向书剑／雪山来源册，并补 `skills-bulu-03-shendiao.md` §4.1 的 9 品进阶 `sk_caoyuanjunzhenxinfa` 指针，不复制定义 |
| ✅ | `sk_tiezhang` | 不在本册，未修改；处理原则已交五绝册，见 §7.5 |

### 7.2 改标外放清单

| 状态 | 招式 | 结果 |
|---|---|---|
| ✅ | `mv_chuanyunxiao_chuanyun` | 加入 `tags:[sonic]`、基础范围、三档 `projectionSpreadSteps`、`projection:true`、`DamageKind:'projected'`；人声路线收于天突／廉泉 |
| ✅ | `mv_chuanyunxiao_duanhe` | 按既有“锥2 音波”展开；深厚内力主动束拢方向与强弱且有伤害段，故标外放；三档锥形范围，路线收于廉泉 |
| ✅ | `mv_chuanyunxiao_huisheng` | 按既有“周身音波、附震慑”展开；深厚内力主动控制强弱与覆盖且有伤害段，故标外放；三档周身范围，路线收于天突 |
| ✅ | `mv_qixianyin_luanxian` | 加入同组外放字段；拨弦动作路线收于手部白名单端点 `ap_shoushaoyang_yangchi` |
| ✅ | 非外放边界 | “定弦／和鸣”及清心曲谱支援招保持非外放；四记伤敌音功的 0 档仍是普通音波 |

### 7.3 遗留处理表

| 状态 | 遗留 | 处理 |
|---|---|---|
| ✅ | 未登记穴位 `ap_baihui` | `mfr_tuinaliaofa_tuigong` 改用 `ap_dumai_baihui`；本册玄上路线所用穴位均对照 `design/15` |
| ✅ | purpose 镜像错位 | `摧锋 movement→attack`、`布势 movement→defense`、`百毒归证 defense→attack`、`八门 movement→defense`，以正文实际效果收口 |
| ✅ | 条件绝招加法／乘法混写 | “斩马”从 `3.00+0.30=3.30` 改为 `3.00×(1+0.30)=3.90` |
| ✅ | 玄上 17 行过期镜像 | 全部改为“见文首索引”，重算段数、路线 CT、收招合计、风险列表及总风险；步骤只定义一次 |
| ✅ | 地阶镜像过期文字 | 模板总述改为 `U-*6/U-*8`，并注明地阶显式路线实际为 600–720 CT；守城军阵、混元方桩均改为 8 段／720 CT／总收招 1920 |
| ✅ | 七弦音装备口径 | 删除“乱弦须持琴”硬门槛措辞，改为“以指拨弦、琴音发劲”的动作描述；未新增卡面 `weaponReq` |
| ✅ | 穿云啸正式展开 | `断喝／回声` 依 §12.3 登记正式 ID、预算、外放字段、AR-16 行与显式路线；GEN-O12 改为已解决 |
| ✅ | 路线相似与同门互异 | 改写“万籁”“斩马”“探首”等路线；严格多样性由 4 组 ≥80% 警告降为 0 |
| ✅ | 路线动作末端 | 修复掌、腿、兵器、外放等缺失／位置诊断，不改变招式事实；外放端点均落白名单 |
| ✅ | 文档口径 | 版本追加“经脉落地终审（2026-09-29）”，上游更新为 Canon v1.6、AR-14～AR-17、`design/21` v2.5 |

### 7.4 末端规则命中数（改前 / 改后）

| 指标 | 改前 | 改后 |
|---|---:|---:|
| `violations` | 14 | 0 |
| `tail_violations` | 1 | 0 |
| 册内相似度 ≥80% 路线对 | 4 | 0 |

最终 delivery 汇总为 `routes=38 / classified=20 / checked_rules=19 / violations=0 / tail_violations=0 / unclassified=18`。检查器当前只读取文首绝招审计块，故穿云啸三条普通路线未计入 38；已逐条核对正式穴位、至多一次换脉、合法人声端点及全仓序列唯一。18 条未分类路线不等于违规，未通过改写动作事实强行分类。

### 7.5 交其他任务

- 五绝册：`sk_tiezhang→ch03_shendiao` 会令神雕完整原生天阶池由 18 超上限；优先登记“神雕残承”，若不适用则仅作首领配装。另同步降龙三记绝招 AR-16、V-P01 与统计 `39→42`。
- 倚天册：九阳 `innerGuard.reflectBp:1200→0` 并改由层数投影结算；武当截脉手“点环跳”收于指端；圣火心法 `ap_qihai` 改为 `design/15` 正式 ID。
- 康熙册：核对并修正四处索引／正文 purpose（含任务点名两处），并给 `sk_taiyueshibeishou.weaponReq.altItems` 加 `eq_changchangfengshibei`。
- 乾隆册：修四处 purpose、§12.5 QL-O08 多余表格单元格，并复核八卦掌 `ap_baihui` 的正式 ID。
- 古龙册：按正文效果修五处 purpose。少林册：逐条修约 17 处 purpose，并重算过期镜像。道家、倚天册：同样重算过期镜像。
- 对应其他册：处理“碧涛玄功·万里”“易筋锻骨篇·脱胎”的 6→5 段或补充分段理由；按 §4.3.1 收束焚天阴脉及北冥／小无相／化功／龙象／乾坤攻击绝招缺任督的问题；区分跨武学高度相同路线。

### 7.6 门禁与写集自检

- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；仅报告既有基线 `sk_babuganchan`，新增严格失败 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：126 项通过。
- ✅ `damage_sim.py --check`：47 项通过、known deviations 0；`meridian_flow_sim.py --check` 与 `projection_sim.py --check` 均通过。
- ✅ `check_skill_catalogs.py --strict --diversity-strict`：errors 0、38／38 独立路线、相同 0、≥80% 相似 0、warnings 0。
- ✅ `check_route_unique_for.py`：与全仓其他武学完全相同路线 0；`check_undefined_in.py`：本册未定义引用 0。
- ✅ 无未完成占位语；代码围栏成对，`git diff --check` 通过。
- ✅ 写集：仅修改 `docs/design/catalog/skills-general.md`，并新增本报告；未执行改变仓库状态的 git 命令。

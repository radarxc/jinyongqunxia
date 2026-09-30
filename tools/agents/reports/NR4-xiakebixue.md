# NR4-xiakebixue 报告 · 阴阳性质落地 · 侠客碧血（AR-18：主修经脉、内功性质、路线性质）

## 1. 摘要（3–6 行）

已在 `skills-xiake-bixue` 补齐 11 门内功的 `inner.meridians`，并按 AR-18 逐脉计票完成 7 门内功的性质迁移。
两条绝招路线只重配体段，保留出招方式、动作末端、段数、CT、风险与收招；性质冲突由 2 降为 0。
本册已同步总表、完整／紧凑／黄阶卡、路线镜像、`requiredNature`、调息档案、自然护体档及测试镜像；第 2 轮审核发现的六门防守路线主修核心遗漏也已用局部覆写修复，未新造 ID。
专项交付计数由“路线冲突 2／内功冲突 2／缺经脉 11”归零；严格校验、平衡模拟、唯一性与有效单元名的 NR3 检查均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-xiake-bixue.md` | 1706 | 版本与修订记录；11 张主修经脉；7 张性质及派生字段；2 条冲突路线、六门防守局部覆写；§17.4–§17.7 镜像；§19 测试；§20 依赖 |
| `tools/agents/reports/NR4-xiakebixue.md` | 128 | 本报告：结论、开放问题、跨文档同步项与逐项自检 |

## 3. 关键结论与数值

- 性质只由主修经脉或路线体段投票决定；正逆周天不参与。任脉与六阴经投阴，督脉与六阳经投阳；按 AR-18a 默认，冲脉、带脉不投票，平票／无票取调和。
- 11 门补录内功均沿用既有 ID；依据各卡的站桩、守中、提气、定神或军阵用途选择一条主修经脉，没有从旧 `nature` 反推。
- 五门 2 品阴性吐纳调息为 `1500/348`；1 品长乐吐纳为 `1400/324`；5 品长乐心法为 `1800/420`。混元功由阳改调和，满层调息为 `floor(2200×1.05)=2310`、`floor(516×1.05)=541`。
- 自然护体短路：阴 `气海→劳宫`、阳 `命门→商阳`，均为 CT `[70,70]`、风险 `[80,100]`；调和 `涌泉→命门`，CT `[70,70]`、风险 `[80,120]`。
- 踏雪凌霄：阴／阳票 `0/8→7/1`；8 段，路线 CT `8×90=720`，风险和 `100+120+…+240=1360`，收招合计 `1200+720=1920`。
- 碧针凝神一线：阴／阳票 `1/3→4/0`；6 段，路线 CT `6×100=600`，风险和 `100+120+…+200=900`，收招合计 `1200+600=1800`。
- 碧针最终体段改走手少阴，避免与 `mfr_eighteen_palms_chain` 形成 5/6 高相似；最终仅共享内关、劳宫，本任务新增 `overlapBp≥8000` 配对为 0。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本轮默认值 |
|---|---|---|
| AR-18a | 冲脉、带脉是否参与阴阳计票 | 不投票；已据此完成全部内功与路线判定 |
| AR-18b | 后溪是否加入外放 13 端点白名单 | 不加入；本轮没有以其作为外放出口 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NR4-XB-P01 | 无新增基准修改提案 | Canon v1.8、AR-18 与 `design/21` v2.7.2 已足以裁定本册；AR-18a/b 继续沿用作者待确认默认值 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/chapters/06-xiake.md` | §12.7，约 L1404 | 展飞的 `sk_changlexinfa`：`调和/harmony→阴/yin`，经脉七参性质同步为 `yin`；辅运 `sk_changletuna` 也已由调和改阴 |
| `docs/design/20-legacy-inheritance.md` | §10.7，约 L1203 | 混元功传承门槛 `C9（阳）` 改为兼容调和性质的新口径 |
| `docs/design/chapters/07-bixue.md` | §12.7，约 L1415、L1425 | 归二娘、归辛树的混元功 `阳→调和`，七参性质 `yang→harmony`；按调和 Profile 复核派生数值 |
| `docs/design/chapters/08-luding.md` | §9.4、§12.8，约 L1006、L1487–L1488 | `C9 阳性`改为调和兼容；归辛树、归二娘的混元功和七参性质改为调和并复核 Profile |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 补主修经脉清单

| 内功 | 补入 `inner.meridians` | 依据 | 推出性质 |
|---|---|---|---|
| `sk_lingxiaotuna` 凌霄吐纳 | `[mer_dumai]` | 雪岭站桩由背脊提气（原创扩展设定） | 阳 1 → yang |
| `sk_changletuna` 长乐吐纳 | `[mer_renmai]` | 堂口入门吐纳守中蓄气（原创扩展设定） | 阴 1 → yin |
| `sk_xuansuzhuanggong` 玄素桩功 | `[mer_renmai]` | 护庄桩静守中线（原创扩展设定） | 阴 1 → yin |
| `sk_jindaozhuanggong` 金刀桩功 | `[mer_dumai]` | 负刀桩挺脊发力（原创扩展设定） | 阳 1 → yang |
| `sk_shangqingtuna06` 上清吐纳·侠客 | `[mer_renmai]` | 道门入门吐纳守一敛气（原创扩展设定） | 阴 1 → yin |
| `sk_huashantuna07` 华山吐纳·碧血 | `[mer_dumai]` | 外门吐纳提振掌劲（原创扩展设定） | 阳 1 → yang |
| `sk_tiejantuna` 铁剑吐纳 | `[mer_renmai]` | 棋局静息敛气定神（原创扩展设定） | 阴 1 → yin |
| `sk_wenjiagong` 温家桩功 | `[mer_dumai]` | 五行阵桩立身承势（原创扩展设定） | 阳 1 → yang |
| `sk_wudutuna` 五毒吐纳·碧血 | `[mer_renmai]` | 运毒前敛气护中（原创扩展设定） | 阴 1 → yin |
| `sk_xiandutuna` 仙都吐纳 | `[mer_renmai]` | 清修吐纳抱元守中（原创扩展设定） | 阴 1 → yin |
| `sk_chuangwangtuna` 闯军吐纳 | `[mer_dumai]` | 军阵操练挺身提气（原创扩展设定） | 阳 1 → yang |

✅ 11 张缺字段内功均已在总表和黄阶镜像中显式登记，`inner_missing_meridians=0`。

### 7.2 改性质清单

| 内功 | 改前 → 改后 | 连带改动 |
|---|---|---|
| `sk_changlexinfa` | harmony → yin | `txp` 改 yin、`1800/420`；攻击 A4H→A4I、防守 D4H→D4I-CX、`requiredNature` 由 `[yin,yang,harmony]` 改为 `[yin,harmony]`；玄阴自然护体 |
| `sk_hunyuangong` | yang → harmony | `txp` 改 harmony、`2310/541`；D4H/D6H，两条绝招允许 `[yin,yang,harmony]`；地调和自然护体 |
| `sk_changletuna` | harmony → yin | `txp` 改 yin、`1400/324`；攻击 A4H→A4I、防守 D3H→D3I-CL、`requiredNature` 由 `[yin,yang,harmony]` 改为 `[yin,harmony]`；黄阴自然护体 |
| `sk_xuansuzhuanggong` | harmony → yin | `txp` 改 yin、`1500/348`；攻击 A4H→A4I、防守 D3H→D3I-XS、`requiredNature` 由 `[yin,yang,harmony]` 改为 `[yin,harmony]`；黄阴自然护体 |
| `sk_shangqingtuna06` | harmony → yin | `txp` 改 yin、`1500/348`；攻击 A4H→A4I、防守 D3H→D3I-SQ、`requiredNature` 由 `[yin,yang,harmony]` 改为 `[yin,harmony]`；黄阴自然护体 |
| `sk_tiejantuna` | harmony → yin | `txp` 改 yin、`1500/348`；攻击 A4H→A4I、防守 D3H→D3I-TJ、`requiredNature` 由 `[yin,yang,harmony]` 改为 `[yin,harmony]`；黄阴自然护体 |
| `sk_xiandutuna` | harmony → yin | `txp` 改 yin、`1500/348`；攻击 A4H→A4I、防守 D3H→D3I-XD、`requiredNature` 由 `[yin,yang,harmony]` 改为 `[yin,harmony]`；黄阴自然护体 |

✅ 七门性质、`BreathProfile.nature`、调息值、`requiredNature`、攻击模板、防守局部覆写与护体显示档均已同步；`inner_nature_conflicts=0`。

### 7.3 路线改动清单

| 路线 | 改前计票 → 改后计票 | 穴位改动 | 段数／CT／风险 |
|---|---|---|---|
| `mfr_taxuewuhen_lingxiao` | 阴0/阳8 → 阴7/阳1 | `听宫→偏历→地仓→仆参→头临泣→外丘→肺俞` 改为 `涌泉→太溪→照海→交信→筑宾→太冲→血海`；落点承泣不变 | 8 段；720 CT；风险序列 `[100,120,140,160,180,200,220,240]`、总风险 1360、收招合计 1920，均不变 |
| `mfr_bizhenqingzhang_yixian` | 阴1/阳3 → 阴4/阳0 | 体段 `鱼际→三间→肩髃→曲池` 改为 `极泉→青灵→少海→曲泽`；掌法出口 `内关→劳宫` 不变 | 6 段；600 CT；风险序列 `[100,120,140,160,180,200]`、总风险 900、收招合计 1800，均不变 |
| `mfr_hunyuangong_tuna`（D4Y→D4H） | 阴0/阳4 → 阴0/阳1 | `命门→至阳→神道→百会` 改为 `足临泣→维道→带脉→至阳` | 4 段；300 CT；风险序列 `[70,80,90,100]`、总风险 340，均不变 |
| `mfr_hunyuangong_shouyi`（D6Y→D6H） | 阴2/阳4 → 阴2/阳1 | `气海→关元→命门→至阳→神道→百会` 改为 `足临泣→维道→带脉→至阳→天池→曲泽` | 6 段；540 CT；风险序列 `[80,90,100,120,100,120]`、总风险 610，均不变 |
| `sk_changlexinfa` 普通攻击（A4H→A4I） | 阴0/阳1 → 阴4/阳0 | `足临泣→维道→带脉→至阳` 改为 `云门→尺泽→太渊→少商` | 4 段；280 CT；风险序列 `[90,90,90,90]`、总风险 360，均不变 |
| `sk_changlexinfa` 普通防守（D4H→D4I-CX） | 阴0/阳1 → 阴2/阳0 | `足临泣→维道→带脉→至阳` 改为 `气海→阴交→章门→京门`，纳入主修任脉与带脉 | 4 段；300 CT；风险序列 `[70,80,90,100]`、总风险 340，均不变 |
| `sk_changletuna`、`sk_xuansuzhuanggong`、`sk_shangqingtuna06`、`sk_tiejantuna`、`sk_xiandutuna` 普通攻击（A4H→A4I） | 阴0/阳1 → 阴4/阳0 | `足临泣→维道→带脉→至阳` 改为 `云门→尺泽→太渊→少商` | 各 4 段；280 CT；风险序列 `[90,90,90,90]`、总风险 360，均不变 |
| `sk_changletuna` 普通防守（D3H→D3I-CL） | 阴0/阳0 → 阴3/阳0 | `足临泣→维道→带脉` 改为 `气海→筑宾→太渊`，纳入主修任脉 | 3 段；210 CT；风险序列 `[70,80,90]`、总风险 240，均不变 |
| `sk_xuansuzhuanggong` 普通防守（D3H→D3I-XS） | 阴0/阳0 → 阴3/阳0 | `足临泣→维道→带脉` 改为 `中极→血海→阴郄`，纳入主修任脉 | 3 段；210 CT；风险序列 `[70,80,90]`、总风险 240，均不变 |
| `sk_shangqingtuna06` 普通防守（D3H→D3I-SQ） | 阴0/阳0 → 阴3/阳0 | `足临泣→维道→带脉` 改为 `阴交→复溜→廉泉`，纳入主修任脉 | 3 段；210 CT；风险序列 `[70,80,90]`、总风险 240，均不变 |
| `sk_tiejantuna` 普通防守（D3H→D3I-TJ） | 阴0/阳0 → 阴3/阳0 | `足临泣→维道→带脉` 改为 `石门→太冲→内关`，纳入主修任脉 | 3 段；210 CT；风险序列 `[70,80,90]`、总风险 240，均不变 |
| `sk_xiandutuna` 普通防守（D3H→D3I-XD） | 阴0/阳0 → 阴3/阳0 | `足临泣→维道→带脉` 改为 `关元→交信→阴郄`，纳入主修任脉 | 3 段；210 CT；风险序列 `[70,80,90]`、总风险 240，均不变 |

混元功两条绝招 `mfr_hunyuangong_yangqi`、`mfr_hunyuangong_yiqi` 只把 `requiredNature` 扩为 `[yin,yang,harmony]`，路线穴位、动作出口、段数、CT、风险与收招均未改。

⚠️ 第 2 轮审核发现：`D4I/D3I` 是第 2 次运行把六门阴性内功普通防守切换后的中间态，并非本任务基点状态；该中间态共享模板只有手太阴穴，漏掉卡片明示的任脉主修核心。本次最终改为 D4I-CX 与五条 D3I-* 技能层局部覆写，长乐心法同时恢复带脉。六路均为阴性且互异，段数、CT、风险相对基点均未变化；候选路线经全仓表格集合复核，没有完全相同或 `overlapBp≥8000` 配对。两条原始 `nature-conflict` 路线也继续为 0 命中。

### 7.4 `--delivery` 三项计数

| 项 | 改前（主分支实测 37efc33） | 改后 |
|---|---:|---:|
| `nature-conflict` | 2 | 0 |
| `INNER_NATURE` | 2 | 0 |
| `inner_missing_meridians` | 11 | 0 |

### 7.5 指定检查

| 检查 | 结果 |
|---|---|
| `check_nr4_unit.py docs/design/catalog/skills-xiake-bixue.md` | ✅ `0/0/0` |
| `check_ids.py --strict` | ✅ exit 0；仅仓库基线已知 `sk_babuganchan` 未定义 1 条，本任务新增 0 |
| lint 单元测试 | ✅ 170 tests passed |
| `damage_sim.py --check` | ✅ 47 checks passed |
| `meridian_flow_sim.py --check` / `projection_sim.py --check` | ✅ 均通过 |
| `check_skill_catalogs.py --strict --diversity-strict` | ✅ errors 0；册内／跨册 ≥80% 0 |
| `check_route_unique_for.py` / `check_undefined_in.py` | ✅ 完全相同 0；未定义引用 0 |
| `check_nr3_unit.py xiake-bixue` | ✅ 名下 22 对全部改开；本任务新造 ≥80% 配对 0 |
| 任务文案原样 `check_nr3_unit.py xiakebixue` | ⚠️ 工具返回“快照里没有单元 xiakebixue”（exit 2）；工具登记的有效单元名含连字符，已用上一行正确参数完成校验 |

### 7.6 交其他任务的条目

✅ 本册以外没有越权修改；需同步的长乐心法／混元功旧性质、人物七参和传承门槛已逐项列在 §6。`design/05` §5.3.1 已预告两张原有性质冲突的迁移，无需重复修改。

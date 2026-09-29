# NR3-xiakebixue 报告 · 路线叙事第三轮 · 侠客碧血（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

完成《侠客行／碧血剑》图鉴路线叙事第三轮：重配 6 条路线，本任务名下 22 对 `overlapBp≥8000` 全部改开，理由豁免 0 对，且未新造高相似配对。
六路均保留原段数、逐段 CT／风险、路线 CT、收招、出招方式、purpose 与 `ultimate:true`；动作末端、外放端点及路线结构检查均无违规。
`sk_taixuan.reqs` 的 `lore {max:40}` 已依硬门槛统一为 `lore {max:20}`；本册没有人声音功，故 `voice` 补标 0 项。
性质冲突按本轮冻结口径只报告 2 条、不改路线；全仓仍有 1 对涉及本册的 8333 bp 配对，已确认归 `NR3-bulu` 而未越权处理。
全部指定验收命令通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/catalog/skills-xiake-bixue.md` | 1679 | 版本与修订记录；文首路线索引 6 路重配；`sk_taixuan.reqs`；§15.4 外放端点说明；§17.3、§17.4 路线镜像与叙事；§19 T16；§20 追溯 |
| `tools/agents/reports/NR3-xiakebixue.md` | 185 | 本报告：22 对处理结果、数值核算、delivery 前后统计、开放项、跨任务交接及门禁 |

本次只改任务允许的图鉴并新建本报告；未改 Canon、`TODO.md`、其他图鉴或工具，未执行改变仓库状态的 git 命令。

## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| NR3 分派 | 22 对：改开 22、写理由 0、未处理 0；10000 bp 的 4 对全部改开 |
| 改写范围 | 6 条 `mfr_*`；全部只替换穴位，不改 ID、出招方式或时间／风险数据 |
| 替换下限 | 10 段路线至少 `floor(0.2×10)+1=3` 穴；8 段路线至少 `floor(0.2×8)+1=2` 穴 |
| 实际替换 | `taixuan_shibu` 9/10；`taixuan_sada` 8/10；`taixuan_guiyi` 9/10；`luohanfumo_huti` 9/10；`xiakedaozhangfa_heyin` 6/8；`wenjiawuxingzhen_lunzhuan` 8/8，均高于下限 |
| 时间上限 | 三路 10 段太玄／罗汉分别为 `1200+700=1900`、`1200+750=1950`、`1200+800=2000`；两路 8 段均 `1200+720=1920`，全部 `≤2000 CT` |
| 风险总账 | `1400 / 1430 / 1900 / 1900 / 1360 / 1360 bp`；风险序列及合计均未变化 |
| 路线唯一性 | 本任务新造 ≥80% 配对 0；全仓完全相同有序路线 0 |
| 本册剩余高相似 | NR3 分派快照共 24 对涉及本册：本任务 22 对改开，另 1 对随路线重配消除，余下 1 对归 `NR3-bulu` |
| delivery | 34 条绝招路线；可靠分类 31、检查规则 33、末端缺失 0、tail 违规 0、未分类 3；非绝招外放 4、违规 0 |
| 性质冲突 | 2 条：`mfr_taxuewuhen_lingxiao`、`mfr_ruanhongzhusuo_luowang`；遵照任务要求只报告 |
| 人声字段 | `design/05` 已有 `MoveDef.voice?: boolean`，但本册无音功／`sonic` 招式，补标 0 项 |
| 太玄 lore | `lore {max:40}`→`lore {max:20}`；继续作为 `hard [lore.max]`，事件覆写契约不变 |

六路动作语义分别固定为：十步一杀经腿部位移核心脉后收腕；飒沓流星由冲带横展、末三段曲池—内关—劳宫；太玄归一经奇经周身归一后收中冲；罗汉护体以任督护住前后身；双使合印收于手三里—内关—劳宫；五行轮转沿冲带、足少阳、阳跷、足三阴至任督轮转。均属既有招式下的路线叙事 **（原创扩展）**。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 本轮处理 |
|---|---|---|
| NR3-XB-O01 | `design/21` §2.4 中“含任督／奇经混合方案时取 harmony”按计票还是字面解释 | 按协调者冻结要求，本轮不为性质冲突改路线；仅保留 2 条命中清单，待统一裁定后再处理 |
| NR3-XB-O02 | `mfr_chiliandugong_duhuo` / `mfr_jinsheyouzhang_chanshen` 的 8333 bp 如何改开 | 默认由分派所有者 `NR3-bulu` 修改前者；本任务不改未分派的本册路线 |
| NR3-XB-O03 | 3 条 delivery 未分类路线是否强行归类 | 默认不硬套：`mfr_wenjiawuxingzhen_lunzhuan`、`mfr_mantianhuayu_huayu`、`mfr_jinshezhui_huizhui` 保留未分类，避免篡改动作事实 |
| NR3-XB-O04 | 本册既有原著考据和套装／组织同步事项何时完成 | 沿正文 §20 的默认值和 **（待考）** 清单，不在路线任务内扩写未经核对的事实 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NR3-XB-P00 | 无新增基准修改提案 | Canon V17-06 与 `design/21` §2.4、§4.3.1、§4.3.4、§4.6、§17.1 已足以约束本次路线改写；性质解释等待既定作者裁定，不在本任务抢先改基准 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 | 改什么 |
|---|---|---|
| `NR3-bulu` / `docs/design/catalog/skills-bulu-03-shendiao.md` | `mfr_chiliandugong_duhuo` | 处理其与 `mfr_jinsheyouzhang_chanshen` 的 8333 bp 配对；该对已分派给 `bulu`，本任务未改“另一侧” |
| `design/21` 或作者决定 | §2.4 路线性质判定 | 统一“任督／奇经混合取 harmony”的计票或字面读法，再处理本册 2 条性质冲突 |
| `docs/design/catalog/skills-xiake-bixue.md` 后续维护 | 3 条未分类绝招 | 仅在动作事实获得可靠分类后补 delivery；当前不以猜测强套拳／兵器规则 |
| 正文 §20 已列下游 | 套装、装备、组织与章节入口 | 沿既有 D-1～D-7 交接；本轮没有删除或改写这些跨文档待办 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

以下 22 对均采用“改开”，未使用传承理由。改动穴位列写本侧路线的“旧保留／其余替换”口径；每条路线完整新序列见图鉴文首索引。

| # | 配对 | 改前 bp | 处理方式 / 改后 bp | 本侧改动穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_lingshebu_tuoqiao` / `mfr_taixuan_shibu` | 10000 | 改开至 1666 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 2 | `mfr_manchuqishe_chishe` / `mfr_wenjiawuxingzhen_lunzhuan` | 10000 | 改开至 0 | `mfr_wenjiawuxingzhen_lunzhuan`：替换 8/8 |
| 3 | `mfr_qishangquan_tuntu` / `mfr_taixuan_shibu` | 10000 | 改开至 1250 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 4 | `mfr_taixuan_shibu` / `mfr_tianlongchanbu_tuili` | 10000 | 改开至 1666 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 5 | `mfr_qiankun_diandao` / `mfr_taixuan_sada` | 9000 | 改开至 2000 | `mfr_taixuan_sada`：保留内关、劳宫，替换 8/10 |
| 6 | `mfr_taixuan_guiyi` / `mfr_xuanming_qichu` | 9000 | 改开至 1000 | `mfr_taixuan_guiyi`：保留内关，替换 9/10 |
| 7 | `mfr_gumuqinggong_youshen` / `mfr_taixuan_shibu` | 8750 | 改开至 1250 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 8 | `mfr_luohanfumo_huti` / `mfr_yaowangdujing_baidu` | 8750 | 改开至 1250 | `mfr_luohanfumo_huti`：仅保留会阴，替换其余 9/10 |
| 9 | `mfr_mujianyi_caomu` / `mfr_taixuan_sada` | 8750 | 改开至 2500 | `mfr_taixuan_sada`：保留内关、劳宫，替换 8/10 |
| 10 | `mfr_pojunqiangfa_xianzhen` / `mfr_taixuan_shibu` | 8750 | 改开至 2500 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 11 | `mfr_shexinglifan_baibian` / `mfr_taixuan_shibu` | 8750 | 改开至 1250 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 12 | `mfr_wenjiawuxingzhen_lunzhuan` / `mfr_yiweidujiang_feidu` | 8750 | 改开至 0 | `mfr_wenjiawuxingzhen_lunzhuan`：替换 8/8 |
| 13 | `mfr_chongyangzhang_diezhang` / `mfr_luohanfumo_huti` | 8333 | 改开至 0 | `mfr_luohanfumo_huti`：仅保留会阴，替换其余 9/10 |
| 14 | `mfr_dagouzhen_shouwang` / `mfr_taixuan_sada` | 8333 | 改开至 0 | `mfr_taixuan_sada`：保留内关、劳宫，替换 8/10 |
| 15 | `mfr_dagouzhen_shouwang` / `mfr_taixuan_shibu` | 8333 | 改开至 0 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 16 | `mfr_jiuyin_buzu` / `mfr_taixuan_sada` | 8333 | 改开至 0 | `mfr_taixuan_sada`：保留内关、劳宫，替换 8/10 |
| 17 | `mfr_jiuyin_buzu` / `mfr_taixuan_shibu` | 8333 | 改开至 0 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 18 | `mfr_luohanfumo_huti` / `mfr_tangmenbidu_shoumai` | 8333 | 改开至 0 | `mfr_luohanfumo_huti`：仅保留会阴，替换其余 9/10 |
| 19 | `mfr_xiakedaozhangfa_heyin` / `mfr_yingyangzhang_bingji` | 8333 | 改开至 1666 | `mfr_xiakedaozhangfa_heyin`：保留内关、劳宫，替换 6/8 |
| 20 | `mfr_jingangbuhuai_jinshen` / `mfr_luohanfumo_huti` | 8000 | 改开至 1000 | `mfr_luohanfumo_huti`：仅保留会阴，替换其余 9/10 |
| 21 | `mfr_lingbo_jiangfei` / `mfr_taixuan_shibu` | 8000 | 改开至 1000 | `mfr_taixuan_shibu`：仅保留涌泉，替换其余 9/10 |
| 22 | `mfr_luohanfumo_huti` / `mfr_yiyangzhi_liaoshang` | 8000 | 改开至 1000 | `mfr_luohanfumo_huti`：仅保留会阴，替换其余 9/10 |

### 7.2 `--delivery` 命中数（改前 / 改后）

本任务改前即在 NAu-nxt 新检查下无末端违规；本轮重配仍须守住这些规则。绝招路线总数 34／34、可靠分类 31／31；执行规则合计 `6+13+7+2+3+2=33` 项，与 `checked_rules=33` 一致。

| 规则 | 适用绝招路线（改前／改后） | 违规（改前／改后） | 结果 |
|---|---:|---:|---|
| 掌（劳宫） | 6／6 | 0／0 | ✅ |
| 指 | 0／0 | 0／0 | ✅ |
| 拳／擒拿（曲池／手三里／合谷） | 0／0（本册无拳／擒拿类绝招） | 0／0 | ✅ |
| 腿 | 0／0 | 0／0 | ✅ |
| 兵器（腕／导引穴） | 13／13 | 0／0 | ✅ |
| 内功攻击（含任督） | 7／7 | 0／0 | ✅ |
| 护体／蓄气（任督；丹田只用气海／关元） | 2／2 | 0／0 | ✅ |
| 位移（步法核心脉或涌泉） | 3／3 | 0／0 | ✅ |
| 绝招外放端点 | 2／2 | 0／0 | ✅ |
| 关键穴不在末 1–3 段（tail） | — | 0／0 | ✅ |
| 非绝招外放端点 | 4／4 | 0／0 | ✅ |
| 未分类 | 3／3 | — | ⚠️ 保留，不硬套 |
| 路线性质冲突（本轮冻结） | — | 2／2 | ⚠️ 仅报告 |

性质冲突明细：

- `mfr_taxuewuhen_lingxiao`：检查要求 `route=yang`，声明 `yin`。
- `mfr_ruanhongzhusuo_luowang`：检查要求 `route=yang`，声明 `yin`。

未分类明细：`mfr_wenjiawuxingzhen_lunzhuan`（阵法）、`mfr_mantianhuayu_huayu`（棋子／暗器）、`mfr_jinshezhui_huizhui`（金蛇锥）。本册无音功、人声或 `sonic` 招式，`voice` 补录前后均为 0。

### 7.3 改过的路线清单

| 路线 | 段数 | 路线 CT | 风险序列 / 总风险 | 收招合计 | 是否变化 |
|---|---:|---:|---|---:|---|
| `mfr_taixuan_shibu` | 10 | 700 | `[110,120,130,140,130,140,150,150,160,170]` / 1400 | 1900 | 仅穴位变；其余不变 |
| `mfr_taixuan_sada` | 10 | 750 | `[120,130,140,120,120,140,150,160,170,180]` / 1430 | 1950 | 仅穴位变；其余不变 |
| `mfr_taixuan_guiyi` | 10 | 800 | `[100,120,140,160,180,200,220,240,260,280]` / 1900 | 2000 | 仅穴位变；其余不变 |
| `mfr_luohanfumo_huti` | 10 | 800 | `[100,120,140,160,180,200,220,240,260,280]` / 1900 | 2000 | 仅穴位变；其余不变 |
| `mfr_xiakedaozhangfa_heyin` | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 1920 | 仅穴位变；其余不变 |
| `mfr_wenjiawuxingzhen_lunzhuan` | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 1920 | 仅穴位变；其余不变 |

穴位替换明细：

| 路线 | 移除 | 新增 |
|---|---|---|
| `mfr_taixuan_shibu` | `ap_zushaoyin_taixi`、`ap_zutaiyang_weizhong`、`ap_dumai_mingmen`、`ap_daimai_zulinqi`、`ap_daimai_weidao`、`ap_daimai_daimai`、`ap_shoujueyin_tianchi`、`ap_shoujueyin_quze`、`ap_shoujueyin_neiguan` | `ap_yangqiao_fuyang`、`ap_zushaoyang_xuanzhong`、`ap_daimai_jingmen`、`ap_dumai_yaoyangguan`、`ap_chongmai_zhongzhu`、`ap_zushaoyin_lingxu`、`ap_shoutaiyin_yuji`、`ap_shoushaoyin_shenmen`、`ap_shoushaoyang_yangchi` |
| `mfr_taixuan_sada` | `ap_daimai_weidao`、`ap_daimai_daimai`、`ap_dumai_zhiyang`、`ap_renmai_qihai`、`ap_renmai_guanyuan`、`ap_renmai_zhongwan`、`ap_shoujueyin_tianchi`、`ap_shoujueyin_quze` | `ap_chongmai_qichong`、`ap_chongmai_dahe`、`ap_daimai_zhangmen`、`ap_renmai_shimen`、`ap_dumai_shenzhu`、`ap_yangwei_jianjing`、`ap_chongmai_futonggu`、`ap_shouyangming_quchi` |
| `mfr_taixuan_guiyi` | `ap_shoutaiyin_kongzui`、`ap_yinqiao_jingming`、`ap_yinwei_qimen`、`ap_zujueyin_yinlian`、`ap_zushaoyin_taixi`、`ap_zutaiyin_xuehai`、`ap_renmai_shenque`、`ap_shoushaoyin_shaochong`、`ap_shoutaiyin_taiyuan` | `ap_yinqiao_zhaohai`、`ap_yinwei_zhubin`、`ap_daimai_wushu`、`ap_chongmai_huangshu`、`ap_dumai_jizhong`、`ap_yangwei_benshen`、`ap_shoushaoyang_zhigou`、`ap_shoutaiyang_yanglao`、`ap_shoujueyin_zhongchong` |
| `mfr_luohanfumo_huti` | `ap_renmai_zhongji`、`ap_shoujueyin_tianchi`、`ap_shoushaoyin_shaochong`、`ap_shoutaiyin_kongzui`、`ap_shoutaiyin_zhongfu`、`ap_yinwei_daheng`、`ap_zujueyin_dadun`、`ap_zujueyin_zhongdu`、`ap_zushaoyin_shuiquan` | `ap_chongmai_shangqu`、`ap_renmai_guanyuan`、`ap_renmai_qihai`、`ap_renmai_danzhong`、`ap_dumai_baihui`、`ap_dumai_shendao`、`ap_dumai_mingmen`、`ap_dumai_changqiang`、`ap_chongmai_futonggu` |
| `mfr_xiakedaozhangfa_heyin` | `ap_dumai_baihui`、`ap_dumai_shuigou`、`ap_shoushaoyang_tianjing`、`ap_shoutaiyang_houxi`、`ap_yangqiao_jugu`、`ap_shouyangming_quchi` | `ap_chongmai_henggu`、`ap_chongmai_shiguan`、`ap_renmai_qihai`、`ap_dumai_shenzhu`、`ap_shoushaoyin_shaohai`、`ap_shouyangming_shousanli` |
| `mfr_wenjiawuxingzhen_lunzhuan` | `ap_shoutaiyang_shaoze`、`ap_shouyangming_erjian`、`ap_shouyangming_yangxi`、`ap_yangqiao_juliao_wei`、`ap_yangwei_jinmen`、`ap_zushaoyang_riyue`、`ap_zutaiyang_chengshan`、`ap_zutaiyang_xinshu` | `ap_chongmai_qichong`、`ap_daimai_jingmen`、`ap_zushaoyang_fengshi`、`ap_yangqiao_shenmai`、`ap_zutaiyin_xuehai`、`ap_zujueyin_taichong`、`ap_renmai_qihai`、`ap_dumai_mingmen` |

按 lint 现行的 `design/21` §2.4 计票读法，六路路线性质改前→改后为：`mfr_taixuan_shibu`、`mfr_taixuan_sada`、`mfr_taixuan_guiyi`、`mfr_luohanfumo_huti` 均为 yin→harmony；`mfr_wenjiawuxingzhen_lunzhuan` 为 yang→harmony；`mfr_xiakedaozhangfa_heyin` 为 yang→yin。以上均是改开相似配对的副作用，不是为性质而改；`mfr_xiakedaozhangfa_heyin` 的武学声明为 harmony，不属于阴阳对冲，故不计冲突。待作者对 §2.4 裁定（NYY）后统一复核。

### 7.4 高相似与交其他任务条目

- ✅ `python3 tools/agents/check_nr3_unit.py xiake-bixue`：名下 22 对已改开 22、理由 0、未处理 0；本任务新造 ≥80% 配对 0。
- ✅ NR3 分派快照共 24 对涉及本册；除本任务 22 对外，六路重配还消除了归 `NR3-bulu` 的 `mfr_taixuan_shibu` / `mfr_tianchishengong_guiyuan`；该任务无需再为这对改另一侧。
- ⚠️ 全仓当前仍有 1 对涉及本册：`mfr_chiliandugong_duhuo` / `mfr_jinsheyouzhang_chanshen`，8333 bp；它归 `NR3-bulu`，应改前者，本任务未改后者。
- ✅ 全仓完全相同有序穴位序列 0；本次没有用豁免说明静默消除警告。

### 7.5 路线结构、动作末端与镜像

- ✅ 6 条路线均不缩短；10 段路线替换 8～9 穴、8 段路线替换 6～8 穴，超过 20%+1 的最低要求。
- ✅ 每段 CT 仍为 70／75／80／90，均在 40～120；风险列与段数一一对应，每段风险均在 0～1200。
- ✅ 出招方式与 `purpose` 未改；位移有阳跷／足少阳或涌泉，护体含任督，掌法末三段落手三里／劳宫，太玄归一仍落合法外放端点中冲。
- ✅ 不与全仓任一路线完全同序，也未新造 ≥80% 配对；本册 34 条绝招序列各异。
- ✅ 文首索引与 §17 镜像同步；模板代号写“见文首索引”，段数、路线 CT、风险列表、总风险与收招合计一致。
- ✅ 同一武学内路线未出现共享超过 50% 的轮换／逆序路线；`--diversity-strict` 无本册内警告。

### 7.6 额外事项与范围

- ✅ 版本行追加“路线叙事第三轮（2026-09-29）”，并新增对应修订记录。
- ✅ `sk_taixuan.reqs` 已从 `lore {max:40}` 统一为 `lore {max:20}`；`hard [lore.max]` 与事件覆写保留。
- ✅ `MoveDef.voice` 字段已在上游存在；本册无适用人声音功，因此没有为了凑字段误标。
- ✅ §17.4 小节标题改为“显式绝招路线核算镜像”，lint 按行内容解析，不受影响。
- ✅ 未新造 ID，未修改写集外文件，正文由任务开始时 1672 行增至 1679 行，未缩短。
- ✅ 已有待决事项未删除；原著待考项继续保留，新增路线叙事明确标 **（原创扩展）**。
- ✅ 无 `TODO`、`此处省略`、`待补充` 等新增占位；表格和代码围栏完整。

### 7.7 验收命令

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；仅报告仓库已知基线 `docs/README.md` 的 `sk_babuganchan`，新增 strict failure 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 tests，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 checks passed |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-xiake-bixue.md` | ✅ errors 0；本册 34 条绝招路线各异 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-xiake-bixue.md` | ✅ 全仓完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-xiake-bixue.md` | ✅ 未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py xiake-bixue` | ✅ 22/22 改开；理由 0；未处理 0；新造高相似 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-xiake-bixue.md` | ✅ 末端缺失 0、tail 违规 0、非绝招外放违规 0；性质冲突 2 按要求冻结 |
| `git diff --check` | ✅ 通过 |

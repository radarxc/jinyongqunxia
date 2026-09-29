# 按书补录武学图鉴 · 11《鸳鸯刀》（`skills-bulu-11-yuanyang`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的按书补录页；只定义《鸳鸯刀》首领缺口新增武学，并登记本书的复用、来源扩展与桥接结论，不改写既有门派图鉴。
> **覆盖声明**：本文新增 `sk_zhentiansanshizhang`；`sk_taiyueshibeishou` 仍唯一归 `skills-kangxi.md`，这里只登记复用。冲突时服从作者决定、`docs/00-canon.md`、`docs/decisions/rulings-v1.md` 与各概念唯一归属文档。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14/16、`docs/00-canon.md` §3–§7/§9/§12/§16/§18、`design/05`、`design/21`、`catalog/npcs-ch11-yuanyang.md`。
> **引用而不重定义**：字段、招式预算与习得规则见 `design/05`；经脉路线、外放、护体内劲与调息见 `design/21`；穴位见 `design/15`；人物身份见 `design/18` 与 `catalog/npcs-ch11-yuanyang.md`；装备兼容见 `design/10`。
> **标注约定**：**（原创扩展）**为原著没有的内容；**（待考）**为须以三联 / 广州修订版逐字核对的原著事实；**（待核实）**为尚未联网确认的技术事实；**（待实测）**为需实机回放；**【建议值】**为依赖其他文档的暂定数值。
> **版本**：首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）。

---

## 0. 绝招显式路线索引

本索引是正文卡的构建镜像，不是第二份定义。本文仅一门 7 地下武学，按 `design/05` §3.5 恰有 1 记 7 重绝招；路线依 `design/21` §4.3 先走阳性躯干与肩背蓄劲，再由掌法末端 `内关 → 劳宫` 发出。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 7 地下 | `sk_zhentiansanshizhang` | `mv_zhentiansanshizhang_zhenzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zhentiansanshizhang_zhenzhen; projection:false}` | `mfr_zhentiansanshizhang_zhenzhen` | `MeridianRouteDef{moveRef:mv_zhentiansanshizhang_zhenzhen; ultimate:true; purpose:attack; requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/90/100 → ap_dumai_shendao/90/140 → ap_dumai_baihui/90/180 → ap_yangwei_tianliao/90/220 → ap_shoutaiyang_tianzong/90/180 → ap_shouyangming_hegu/90/160 → ap_shoujueyin_neiguan/90/350 → ap_shoujueyin_laogong/90/180` |
<!-- skill-catalog-audit:end -->

核算：8 段 × 90 CT = 720 CT；`1200 + 720 = 1920 ≤ 2000 CT`。由阳脉转入手厥阴掌心末端时，将 `ap_shoujueyin_neiguan` 风险提高到 350 bp；全路线穴位不重复。

---

## 1. 卓天雄个人传承

### 1.1 `sk_zhentiansanshizhang` 震天三十掌（7 地下 · 拳脚/掌）

| 字段 | 值 |
|---|---|
| 出处 / `canonRef` | `catalog/npcs-ch11-yuanyang.md` 已留“震天三十掌等待图鉴收录”；该名称及卓天雄所使掌法仍须核对《鸳鸯刀》三联 / 广州修订版中追刀、枣香林与紫竹庵相关段落，**（待考）**。具体拆招、招名与机制均为 **（原创扩展）** |
| `origin / sect / lineage` | `canonExpanded` / `null` / 卓天雄个人传承；人物任职清宫 `sect_qinggong`，但本武学不是清宫通传 |
| 同体系图鉴关系 | 无正式门派同门；人物的清宫任职及通行武学仍引用 `skills-kangxi.md`，本掌法不并入清宫晋升谱，也不由清宫职级自动传授 |
| `sourceChapters` | `[ch11_yuanyang]` |
| `category / subType / grade` | `unarmed / palm / 7`（地下） |
| 品阶依据 | 本界首领锚 `G=5`，卓天雄无 `design/21` §11.9.1 的更高具名地位下限；作为 D5 大内高手的代表外功取地下 7，满足 `7≥5`，且不越本界既有地中 8 上限 |
| `nature · wOut/wIn` | `yang` · `0.75/0.25` |
| `reqs` | `sk_zhentiansanshizhang`：`attrs {str:40,con:35}`；`aptitude {apFist:40}`；`prereq [{skill:sk_wuyingshou,layer:6}]`；`hard:[aptitude,prereq]` |
| `layerStats / moveSlots` | `{hit:[3,9],counter:[2,6]}`，10 重合计 `9+6=15`，不越地阶上限 15；`moveSlots:4` |
| `layers` | 1 试势探门、2 震臂抢中、3 听息辨隙、4 叠势连掌、5 回掌锁门、6 掌势递进、**7 绝招三十掌震阵**、10 圆满 |
| `setTags / conflicts` | `[] / []` |
| `special / observable` | `{fusible:true}` / `true`；可观摩至 6 重，不因首领使用而设 `enemyOnly` |
| `learnSources` | `master ch11_yuanyang npc_zhuotianxiong maxLayer:10`：默认须卓天雄存活，完成 `q_11_side_08` 的释放具结且关系达 R3，**（原创扩展）【建议值】**；`observe maxLayer:6`。主角与其他满足门槛的同伴均可学习 |
| `description` | 卓天雄以刚猛掌势连环抢中、封住近身门户的个人功夫；名称待版本核验，招式拆分及可学事件为原创扩展。 |

| 招式（ID） | 重 | 范围 · 射程 · 投送 | 倍率 | 耗内/cd/收招 | 外放 | 核算 |
|---|---:|---|---:|---|---|---|
| 试势探门 `mv_zhentiansanshizhang_tanmen` **（原创扩展）** | 1 | 单体 · 1 · 近身 | 1.00 | 7%/0/1000 | `projection:false` | `1.00×(1+0)=1.00`；`MoveDef{unlock:1; ultimate:false; mpCost:7%; cd:0; recovery:1000; meridianRouteRef:mfr_zhentiansanshizhang_tanmen; projection:false}` |
| 震臂抢中 `mv_zhentiansanshizhang_zhenbi` **（原创扩展）** | 2 | 单体 · 1 · 近身 | 1.10 | 7%/1/1000 | `projection:false` | `1×(1+0.12)=1.12≈1.10`；`MoveDef{unlock:2; ultimate:false; mpCost:7%; cd:1; recovery:1000; meridianRouteRef:mfr_zhentiansanshizhang_zhenbi; projection:false}` |
| 叠势连掌 `mv_zhentiansanshizhang_dieshi` **（原创扩展）** | 4 | `aoe_line n2` · 1 · 近身 | 1.20 | 8%/2/1100 | `projection:false` | N=2、AF=0.90；`0.90×(1+0.24+0.05+0.07)=1.224≈1.20`；`MoveDef{unlock:4; ultimate:false; mpCost:8%; cd:2; recovery:1100; meridianRouteRef:mfr_zhentiansanshizhang_dieshi; projection:false}` |
| 回掌锁门 `mv_zhentiansanshizhang_huisuo` **（原创扩展）** | 5 | 单体 · 1 · 近身 | 1.15 | 8%/1/1000 | `projection:false` | `1×(1+0.12+0.05)=1.17≈1.15`；`MoveDef{unlock:5; ultimate:false; mpCost:8%; cd:1; recovery:1000; meridianRouteRef:mfr_zhentiansanshizhang_huisuo; projection:false}` |
| 三十掌震阵 `mv_zhentiansanshizhang_zhenzhen`（绝招，**原创扩展**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}` · 1 · 近身 | 2.55 | 9%/0/1200 | `projection:false` | N=3、AF=0.85；`3.00×0.85=2.55`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zhentiansanshizhang_zhenzhen; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 听息辨隙 | `ps_zhentiansanshizhang_tingxi` | 3 | 对本回合已经行动的相邻目标，命中 +5；只影响命中判定 |
| 掌势递进 | `ps_zhentiansanshizhang_dijin` | 6 | 同一目标上一次受到本武学伤害后，下一掌 Z3 +5%，每回合至多触发 1 次 |
| 三十掌圆满 | `ps_zhentiansanshizhang_dacheng` | 10 | 本武学成功招架后，下一掌集气 +80，每回合至多触发 1 次 |

#### 逐招显式路线

| 招式 | `MeridianRouteDef` 与 steps（`acupointRef/segmentCt/riskBp`） | 路线叙事与 CT |
|---|---|---|
| `mv_zhentiansanshizhang_tanmen` | `mfr_zhentiansanshizhang_tanmen`；`MeridianRouteDef{moveRef:mv_zhentiansanshizhang_tanmen; ultimate:false; purpose:attack; requiredNature:[yang,harmony]}`；`ap_dumai_yaoyangguan/80/100 → ap_dumai_jizhong/80/130 → ap_shoushaoyang_waiguan/80/180 → ap_shouyangming_yangxi/80/160 → ap_shoujueyin_neiguan/80/320 → ap_shoujueyin_laogong/80/160` | 腰背蓄劲，经外关与阳溪探门，换入内关、劳宫落掌；`1000+6×80=1480` |
| `mv_zhentiansanshizhang_zhenbi` | `mfr_zhentiansanshizhang_zhenbi`；`MeridianRouteDef{moveRef:mv_zhentiansanshizhang_zhenbi; ultimate:false; purpose:attack; requiredNature:[yang,harmony]}`；`ap_yangqiao_jianyu/80/100 → ap_yangwei_jianjing/80/140 → ap_shouyangming_quchi/80/180 → ap_shouyangming_shousanli/80/160 → ap_shoujueyin_neiguan/80/320 → ap_shoujueyin_laogong/80/160` | 肩臂震开、阳明抢中，再换入掌心；`1000+6×80=1480` |
| `mv_zhentiansanshizhang_dieshi` | `mfr_zhentiansanshizhang_dieshi`；`MeridianRouteDef{moveRef:mv_zhentiansanshizhang_dieshi; ultimate:false; purpose:attack; requiredNature:[yang,harmony]}`；`ap_zuyangming_zusanli/80/100 → ap_zuyangming_fenglong/80/130 → ap_dumai_shenzhu/80/180 → ap_shoutaiyang_xiaohai/80/180 → ap_shoujueyin_neiguan/80/320 → ap_shoujueyin_laogong/80/160` | 由步下扎根，经身柱叠势后连续推掌；`1100+6×80=1580` |
| `mv_zhentiansanshizhang_huisuo` | `mfr_zhentiansanshizhang_huisuo`；`MeridianRouteDef{moveRef:mv_zhentiansanshizhang_huisuo; ultimate:false; purpose:attack; requiredNature:[yang,harmony]}`；`ap_yangqiao_shenmai/80/100 → ap_yangwei_yamen/80/140 → ap_zushaoyang_xuanzhong/80/180 → ap_shoushaoyang_zhigou/80/180 → ap_shoujueyin_neiguan/80/320 → ap_shoujueyin_laogong/80/160` | 跷脉回身、三焦收臂，再由掌心封门；`1000+6×80=1480` |

绝招 `mv_zhentiansanshizhang_zhenzhen` 的路线仅在文首索引定义一次。五条路线两两最多共享 `2/6=33.3%` 的穴位，不超过同门 50% 上限；也不是彼此轮换、逆序或逆序轮换。

---

## 2. 复用、来源扩展与桥接登记

| 类型 | 武学 | 本书结论 | 依据 / 后续 |
|---|---|---|---|
| 既有武学复用 | `sk_taiyueshibeishou`（6 玄上） | 太岳四侠继续使用；不在本文重定义 | 唯一定义见 `skills-kangxi.md`，其 `sourceChapters` 已含 `ch11_yuanyang`，故不是来源扩展 |
| 来源扩展 | — | 本次无 | 两项缺口都不需要改既有武学的可得书界 |
| 装备兼容桥 | `sk_taiyueshibeishou` × `eq_changchangfengshibei` | 武学要求 `weaponReq {category:exotic,kinds:[misc]}`；装备侧尚未登记该兼容，本文只记录，不越权修改 `design/10` | 由装备归属方在 `design/10` 登记 `exotic/misc`；完成前石碑手不可由该装备合法施放 |

---

## 3. 外放候选审计表

按 `design/21` §4.4.1，名称中的“震天”不能单独证明内劲离体；本文五式均为近身掌击，故都不填 `projectionSpreadSteps`。

| 武学 / 招式 | 表现 | 判定 | 结果 |
|---|---|---|---|
| `sk_zhentiansanshizhang` 四记普通招 | 探门、震臂、连掌、回掌均由掌部接触生效 | 无离手运行中的劲力实体或隔空命中 | `projection:false` |
| `mv_zhentiansanshizhang_zhenzhen` | 一格 120° 锥形内的连续近身掌势 | 多目标范围不等于外放，射程仍为 1 | `projection:false` |

外放候选数 `0`，通过数 `0`，拒绝数 `0`；非候选近身招 `5`。因此没有外放路线，也无需经过手部端点白名单。

---

## 4. 统计表

| 统计项 | 数量 / 结论 |
|---|---|
| 新增武学 | 1 门：地阶 1（地下 1）；天 / 玄 / 黄 0 |
| 招式 / 被动 / 绝招 | 5 / 3 / 1；地下绝招配额 `1..1`，在 7 重解锁 |
| 显式路线 | 5 条；绝招 1 条在文首索引唯一展开，普通招 4 条在正文唯一展开 |
| 外放 | 0 招；全部 `projection:false` |
| 调息档案 | 0；本文没有新增内功，故不创建 `txp_*` |
| 复用 | 1 门：`sk_taiyueshibeishou` |
| 来源扩展登记 | 0 |
| 跨书界待替换 | 0 |
| 未闭合桥接 | 1：`eq_changchangfengshibei` 的 `exotic/misc` 装备兼容 |

---

## 本文新增术语与 ID

| 类型 | ID / 术语 | 定义位置 / 数量 |
|---|---|---|
| 武学 | `sk_zhentiansanshizhang` | §1.1；1 门 |
| 招式 | `mv_zhentiansanshizhang_tanmen`、`mv_zhentiansanshizhang_zhenbi`、`mv_zhentiansanshizhang_dieshi`、`mv_zhentiansanshizhang_huisuo`、`mv_zhentiansanshizhang_zhenzhen` | §1.1；5 招 |
| 被动 | `ps_zhentiansanshizhang_tingxi`、`ps_zhentiansanshizhang_dijin`、`ps_zhentiansanshizhang_dacheng` | §1.1；3 个 |
| 经脉路线 | `mfr_zhentiansanshizhang_tanmen`、`mfr_zhentiansanshizhang_zhenbi`、`mfr_zhentiansanshizhang_dieshi`、`mfr_zhentiansanshizhang_huisuo`、`mfr_zhentiansanshizhang_zhenzhen` | §0 / §1.1；5 条逐招实例 |
| 震天三十掌 | 仓库人物名录已有的卓天雄掌法名；名称与原著归属仍 **（待考）**，本文拆招、机制与可学事件均为 **（原创扩展）** | §1.1 |

## 数据校验规则与测试用例

| 编号 | 校验 | 通过条件 |
|---|---|---|
| YYB-V01 | ID 唯一与外键 | 1 个 `sk_*`、5 个 `mv_*`、3 个 `ps_*`、5 个 `mfr_*` 均全仓唯一；前置、任务、人物和穴位引用均可解析 |
| YYB-V02 | 地下卡容量 | 5 招位于地阶 4–7 招范围，3 被动位于地阶 3–4 被动范围，`moveSlots=4`；10 重 `layerStats=9+6=15` 不越地阶上限 |
| YYB-V03 | 绝招契约 | 恰有 1 记 `ultimate:true`，7 重解锁，`rageCost=100`、`mpCost=9%`、`cd=0`、`recovery=1200`；正文与文首镜像一致 |
| YYB-V04 | 路线合法性 | 5 招各绑定唯一 `mfr_*`；绝招 8 段、普通招 6 段；穴位存在、单路不重复、同门任意两路共享穴位不超过 50%，且不与全仓已有绝招路线完全相同 |
| YYB-V05 | 收招上限 | 绝招 `1200+8×90=1920≤2000 CT`；普通招最长为 `1100+6×80=1580≤2000 CT` |
| YYB-V06 | 外放审计 | 5 招射程均为 1 且无离体劲力表现，全部 `projection:false`，不得填写 `projectionSpreadSteps` |
| YYB-V07 | 可学习性 | 武学不设 `enemyOnly`；观摩至 6 重，满足硬门槛且卓天雄存活、具结与 R3 后可亲授至 10 重 |
| YYB-V08 | 复用与桥接 | `sk_taiyueshibeishou` 不在本文重复定义、无需来源扩展；装备桥未同步前不得宣称 `eq_changchangfengshibei` 已满足其 `weaponReq` |

测试样例：7 重角色气势 99 时绝招不可用，气势 100 且内力足额时可用并扣 9% 参考内力；路线完成后总收招为 1920 CT。观摩者即使满足属性 / 资质 / 前置，也只能升至 6 重，不能解锁 7 重绝招；完成个人传承条件后才可突破至 10 重。

## 待决事项 / 依赖

### 替下游给出的建议值

| 项 | 默认值 | 下游替换条件 |
|---|---|---|
| 卓天雄传授门槛 | 存活 + 完成 `q_11_side_08` 释放具结 + R3，可授至 10 重；观摩至 6 重 | 剧情 / 人物归属方若调整关系门槛，应同步本卡 `learnSources` |

### 本文依赖的上游事实

- 武学卡、招式预算和可学习边界依 `design/05`；路线、外放与绝招资源依 `design/21`；穴位合法性依 `design/15`。
- `sk_taiyueshibeishou` 的唯一武学定义与本书来源已在 `skills-kangxi.md`，本文不复制。

### 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| YYB-P01 | **已汇总：**Canon §4 / `design/05` §14 应由门派图鉴基线 `51/169/459/459=1,138` 加 14 册补录 `+8/+82/+9/+0=99`，更新为 `59/251/468/459=1,237` | 作者已决定开启首领缺口补录；本轮已按 99 张补录卡逐卡复算，但本任务无权修改基准，仍须由后续任务回写权威统计 |

### 原著考据待办

- 核对《鸳鸯刀》三联 / 广州修订版中卓天雄追刀、枣香林与紫竹庵相关段落：是否明称“震天三十掌”，以及该名称究竟指掌法、招式还是人物名录的二手归纳。未核定前不把本文原创招名反写成原著事实。

### 开放问题（附默认值）

| 项 | 默认值 |
|---|---|
| 个人传承是否允许卓天雄以外角色学满 | 允许；满足硬门槛并完成存活 / 具结 / R3 条件者均可由其传授至 10 重，不设敌专 |
| 石碑装备桥何时生效 | 默认待 `design/10` 正式登记后才生效；此前太岳四侠画像保留武学，但构建 / 战斗装配不得伪称桥接已完成 |
| **已解决（计数）：**正式武学总量如何吸收本次新增 | 14 册均只增不删，共 `99=8 天+82 地+9 玄+0 黄`；全目录为 `59/251/468/459=1,237`。Canon / `design/05` 的权威统计仍待写集外同步 |

# NXfix-qianlong 报告 · 终审·收尾（门派图鉴）· 乾隆

## 1. 摘要（3–6 行）

完成 `skills-qianlong.md` 的经脉落地终审：14 册来源扩展逐表核对后，本册旧卡实际需回写 0 项，并补齐书剑、飞狐、雪山三册补录导航。
按音功新口径将“金声乱耳”明确为 0 档普通音波、1 / 2 档外放加持，并同步外放审计、路线与测试契约。
修正 4 处索引 `purpose`、11 条掌 / 兵器末端路线及 2 组高相似路线；本轮补修脚本漏判的鹰扬掌，末端诊断保持 0 / 0。
全部指定 lint、单测、平衡模拟、路线唯一性与未定义引用检查通过；未修改写集外文件。

## 2. 产出（文件、行数、主要章节）

| 文件 | 最终行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-qianlong.md` | 1473 | §0 补录导航与路线索引；§5.1 金笛法；§8.5 外放审计；§9A 路线；§11 校验；§12 待决追溯 |
| `tools/agents/reports/NXfix-qianlong.md` | 124 | 本报告七节：结论、开放问题、同步项、逐条审计与门禁结果 |

## 3. 关键结论与数值

- 本册仍为 72 门：天 / 地 / 玄 / 黄 = `3 / 9 / 30 / 30`；未新增或改名任何 ID。
- 绝招数仍为天下 6、地阶 10、玄上 10；路线段数、单段 CT、风险序列与收招预算均未改变。
- 条件型绝招统一按 `3.00 × AF × (1 + Σadj) × Kd × Kp − 成本`；本册三项额外条件只作施放门槛，不加入 `Σadj`。
- 外放共 1 招：天 / 地 / 玄 / 黄 = `0 / 0 / 1 / 0`。`mv_jindifa_luaner` 的 0 档为普通 Z5M、r1、零外放增耗；1 / 2 档为外放 Z5M、r2 / r3、额外 `2% / 4% MPREF`。
- 末端检查覆盖 26 条显式绝招路线：脚本分类并检查 13 条；修前缺失 8、末三段位置违规 2，修后均为 0。脚本未分类的 13 条已逐项人工审计，其中含标题正则漏判及尚未实现的拳招规则。
- 多样性检查由 2 组相似度 ≥80% 降至 0；全仓完全相同路线始终为 0。
- 本册所有 `ap_*` 均在 `design/15` 登记；`mfr_baguazhang_bafang` 已使用正式 ID `ap_dumai_baihui`。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本次默认值 |
|---|---|---|
| QL-O01 | 七心海棠法采用 8 地中还是旧候选 7 地下 | 保持 8 地中；保证 `bf_qixin` 的合法来源品阶为 8–10 |
| QL-O03 | 关东六魔残谱是否可由玩家缴获学习 | 允许；保持非 `enemyOnly`，维持散承黄→玄→地成长落点 |
| NXQ-O01 | 音功 0 档是否连 `DamageKind` / 护体适用率也动态切换 | 暂不切换；保持静态 `DamageKind:'projected'` 与护体内劲 40% 适用率，只动态切换 Z5M、范围和额外耗内 |

QL-O02、QL-O04～QL-O08 已依据章节、套装与经脉上游改写为“已解决”；QL-K01～QL-K10 仍是原著逐字考据待办，不冒充已核实事实。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 本轮无新增基准修改提案 | Canon v1.6 与 `design/21` 已覆盖绝招数量、路线末端及音功外放边界；旧 QL-P01～QL-P03 均已解决并保留追溯 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `skills-general.md` | `sk_baizhanxinfa` | 核实并回写 `ch12_shujian`、`ch14_xueshan` 来源扩展 |
| `skills-general.md` | `sk_pojunqiangfa` | 核实并回写 `ch14_xueshan` 来源扩展 |
| `skills-wujue.md` | `sk_tiezhang` | 按任务指定先例优先登记“神雕残承”，不得把神雕完整原生天阶池从 18 推至 19 |
| `design/04`、`design/05`、Core | 音功投送 schema | 若将来要求 0 档连防护语义也非外放，需共同支持动态 `DamageKind` / 护体适用率；本册未越权改写 |
| `tools/lint/check_skill_catalogs.py` | 掌法按名识别 | 紧凑卡的加粗标题形如 `鹰扬掌**（`，现有正则匹配不到 `掌**（`，导致鹰扬掌、八卦掌漏判 |
| `tools/lint/check_skill_catalogs.py` | 拳 / 擒拿末端规则 | 实现 `design/21` §4.3.1 的拳、擒拿检查；全仓约 9 条拳招路线末端不合规，其中乾隆册 2 条 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单（逐条）

| 来源登记 | 唯一归属 | 本次处理 |
|---|---|---|
| NXB01 天龙 | `skills-bulu-01-tianlong.md` | ✅ 零项；新增卡已自带书界，无旧卡需回写 |
| `sk_tiezhang → ch03_shendiao`（NXB02） | `skills-wujue.md` | ⚠️ 不在本册；交五绝册按“神雕残承”处理 |
| NXB03 神雕 | `skills-bulu-03-shendiao.md` | ✅ `sk_jiuyin`、`sk_pojunqiangfa` 已覆盖神雕，无新增来源 |
| NXB04 倚天 | `skills-bulu-04-yitian.md` | ✅ `sk_jingangbuhuai`、`sk_huanyinzhi` 已覆盖倚天，无新增来源 |
| NXB05 笑傲 | `skills-bulu-05-xiaoao.md` | ✅ 零项；新增卡均自带笑傲来源 |
| NXB06 侠客 | `skills-bulu-06-xiake.md` | ✅ 零项；复用卡已覆盖侠客来源 |
| NXB07 碧血 | `skills-bulu-07-bixue.md` | ✅ 零项；复用卡已覆盖碧血来源 |
| NXB08 鹿鼎 | `skills-bulu-08-luding.md` | ✅ `sk_dashouyin` 已覆盖鹿鼎，无新增来源 |
| NXB09 连城 | `skills-bulu-09-liancheng.md` | ✅ 零项；新增卡均自带连城来源 |
| NXB10 白马 | `skills-bulu-10-baima.md` | ✅ 零项；新增卡均自带白马来源 |
| NXB11 鸳鸯 | `skills-bulu-11-yuanyang.md` | ✅ 来源扩展为 0；墓碑装备兼容属康熙册写集 |
| `sk_baizhanxinfa → ch12_shujian`（NXB12） | `skills-general.md` | ⚠️ 不在本册；已列 §6 移交 |
| NXB13 飞狐 | `skills-bulu-13-feihu.md` | ✅ 复用卡已覆盖飞狐；新增卡自带书界，无新增来源 |
| `sk_baizhanxinfa → ch14_xueshan`（NXB14） | `skills-general.md` | ⚠️ 不在本册；已列 §6 移交 |
| `sk_pojunqiangfa → ch14_xueshan`（NXB14） | `skills-general.md` | ⚠️ 不在本册；已列 §6 移交 |
| 乾隆册旧卡 | `skills-qianlong.md` | ✅ 需新增 `sourceChapters` 为 0；`sk_baguazhang` 已覆盖飞狐 |
| 乾隆三书补录入口 | `skills-bulu-12/13/14` | ✅ §0 新增书剑、飞狐、雪山补录导航，不复制定义、不计入原 72 门 |

### 7.2 改标外放清单

| 招式 | 处理 | 统计影响 |
|---|---|---|
| `mv_jindifa_luaner` 金声乱耳 | ✅ 增 `tags:[sonic]`；明确 0 档普通音波、1 / 2 档以内力控制为外放；路线收 `ap_shoushaoyang_yangchi` | 本册仍为 `0 / 0 / 1 / 0` |
| `mv_jindifa_zhongting`、`mv_jindifa_sandie` | ✅ 实体笛招，保持非外放 | 无 |
| `mv_jindifa_huban` | ✅ 纯支援招，保持非外放 | 无 |

### 7.3 门派图鉴遗留处理表

| 遗留 | 结论 |
|---|---|
| 乾隆 4 处索引 / 正文 `purpose` 不一致 | ✅ 依正文修为：十四当家 `defense`；拳刀一理、回风奇剑、百派博艺 `attack` |
| §12.5 QL-O08 多一格 | ✅ 修回合法三列表格，并保留“已解决”追溯 |
| 条件绝招加法 / 乘法混写 | ✅ 统一公式；三项条件均只作门槛，不抬倍率 |
| `mfr_baguazhang_bafang` 的 `ap_baihui` | ✅ 当前已是正式 `ap_dumai_baihui`；本册其余玄上穴位也逐项核对，未登记数 0 |
| 高度相似路线 | ✅ 差异化 `mfr_tianlongjian_zhengshou` 与 `mfr_jiulongbian_guiyi`；相似对由 2 降至 0 |
| 九阳反震、武当截脉手、29 记段数、焚天及五门内功任督、大手印 | ✅ 均不在本册，未越权修改 |
| 康熙索引 / 墓碑、五绝降龙、其他册过期镜像 | ✅ 均不在本册，跳过并交对应分册任务 |
| 铁掌加入神雕 | ✅ `sk_tiezhang` 不在本册，未占用神雕第 19 个完整原生天阶名额 |

### 7.4 出招方式末端规则

- 改前：`delivery_routes=26`，`classified=13`，`checked_rules=13`，缺失 8，末三段位置违规 2，未分类 13。
- 改后：`delivery_routes=26`，`classified=13`，`checked_rules=13`，缺失 0，末三段位置违规 0，未分类 13。
- ✅ 修正 11 条：原 10 条掌 / 兵器路线不变；本轮另将脚本漏判的 `mfr_yingyangzhang_bingji` 末段由商阳改为劳宫，仍为 6 段、每段 100 CT、风险 `[100,120,140,160,180,200]`。
- ⚠️ 掌法漏判 2 条：鹰扬掌因紧凑卡标题为 `鹰扬掌**（` 而未命中正则，本轮已补劳宫；八卦掌同样漏判，但 `mfr_baguazhang_bafang` 原本已收劳宫。
- ⚠️ 拳招 4 条均因脚本尚无拳 / 擒拿规则而未分类：胡家拳、太极门拳末三段已有曲池 / 手三里 / 合谷；`mfr_miaojiaquan_zhengqi`、`mfr_bajiquan_beng` 末三段没有这三处端点，不符合 `design/21` §4.3.1，本轮按定点返修边界不改，移交后续跨册处理。
- ✅ 百花错拳 2 条集百家招式、动作混杂，无法可靠归为单一掌 / 指 / 腿 / 兵器类型，不强配端点。
- ✅ `mfr_qixinhaitang_wusheng` 是实体暗器投送，不套掌 / 指 / 腿 / 持械导引规则。
- ✅ `mfr_tianshanyingyang_tianji` 是轻功群体支援与位移路线，不构成攻击出招类型。
- ✅ `mfr_yaowangdujing_baidu` 是群体解毒支援，`purpose:defense`，没有攻击末端。
- ✅ `mfr_honghuahuiheji_shisidangjia` 是阵法群体支援，`purpose:defense`，没有单一肢体末端。
- ✅ `mfr_zhangmenboyi_baipai` 属杂学 / 心神并杂糅百派动作，无法可靠归为单一出招类型。
- ✅ 所有改线均同步文首镜像和 §9A 说明；没有删改动作事实、没有缩短路线、没有改 CT / 风险总量。

### 7.5 门禁与交其他任务

- ✅ `check_skill_catalogs.py --delivery --details`：末端缺失 / 位置违规均 0。
- ✅ `check_skill_catalogs.py --strict --diversity-strict --details`：errors 0；26 条路线、26 个序列，完全相同 0、≥80% 相似 0、跨册相同 0、warnings 0。
- ✅ `check_route_unique_for.py`：与全仓完全相同路线 0；`check_undefined_in.py`：未定义引用 0。
- ✅ `check_ids.py --strict`：退出码 0；仅报告仓库既有 `docs/README.md` 引用 `sk_babuganchan`，本次新增未定义项 0。
- ✅ lint 单测 126 项全部通过；`damage_sim.py --check` 47 项通过且 known deviations 0；`meridian_flow_sim.py --check`、`projection_sim.py --check` 全通过。
- ✅ `git diff --check` 通过；最终写集只含本册与本报告；未执行任何改变仓库状态的 git 命令。
- ⚠️ 交检查脚本任务：按名识别掌法的正则匹配不到紧凑卡加粗标题中的 `掌**（`；乾隆册鹰扬掌与八卦掌因此漏判。
- ⚠️ 交检查脚本任务：尚未实现 `design/21` §4.3.1 的“拳、擒拿”规则；全仓约 9 条拳招路线末端不合规，乾隆册为苗家拳、八极拳 2 条。
- ⚠️ 交其他任务：§6 三项跨册来源、铁掌神雕残承，以及音功静态防护语义的未来跨文档决策；其余非乾隆遗留由对应分册任务处理。

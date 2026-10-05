# NR3-shaolin 报告 · 路线叙事第三轮 · 少林（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

- 已改写少林册 14 条绝招路线，覆盖本单元名下 24 对高相似配对；全部由 `8000–10000 bp` 降至 `4000–6666 bp`，未使用共同传承理由豁免。
- 14 条路线共替换 31 个步骤穴位；路线 ID、出招方式、purpose、段数、逐段 CT、风险列、收招与总风险均保持不变，动作末端和关键段仍合法。
- 已为狮子吼 6 招、金刚怒吼 2 招显式补 `voice:true`；“当头棒喝”仍为非伤害、非外放支援招。
- 全套门禁通过：52 条绝招路线互异，名下 24 对全部改开，新造 `overlapBp≥8000` 配对为 0。
- `--delivery` 仍报告 22 条性质冲突；按任务要求未改，完整清单与默认处理见 §4。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-shaolin.md` | 1672 | v1.4；§0 绝招显式路线索引；§1.5.3 / §1.7.3 人声字段；§5.7.4 后跨武学高相似路线说明；§7 校验；§8 依赖 |
| `tools/agents/reports/NR3-shaolin.md` | 150 | 逐对结果、delivery 前后计数、改线清单、性质冲突清单、门禁、交接与返修记录 |

## 3. 关键结论与数值

1. **配对闭包**：`24 = 24 改开 + 0 理由 + 0 未处理`；初始 8 对 10000 bp、8 对 8750 bp、6 对 8333 bp、2 对 8000 bp，改后分布为 4000 一对、5000 十对、6250 九对、6666 四对。
2. **换穴下界**：10 段路线每条换 3 穴，6 / 8 段路线每条换 2 穴，分别等于 `floor(0.2×10)+1=3`、`floor(0.2×6)+1=2`、`floor(0.2×8)+1=2`；合计 `3×3+11×2=31` 个步骤穴位。
3. **耗时保持**：10 段改线为 `10×80=800 CT`、`1200+800=2000 CT`；常规 8 段改线为 `8×90=720 CT`、合计 1920 CT；6 段改线为 `6×100=600 CT`、合计 1800 CT；罗汉阵为 `8×75=600 CT`、合计 1800 CT。
4. **风险保持**：三条 10 段路线总风险 1900；八条常规 8 段路线总风险 1360；两条 6 段路线总风险 900；罗汉阵为 1080。逐段风险数组均未变。
5. **全仓互异**：52 条少林绝招路线对应 52 个不同有序序列；册内与跨册完全相同均为 0，少林册参与的 `overlapBp≥8000` 配对为 0。
6. **人声契约**：结构化补标 8 招，其中 3 条绝招同步文首索引；七记伤害音功保持外放，纯支援“当头棒喝”不新增 `projection:true`。
7. **ID 与数值边界**：未新增 ID；所有换入穴位均已在 `design/15` 登记，路线内无重复穴位，绝招总耗时均不超过 2000 CT。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本次默认值 |
|---|---|---|
| NR3SL-O01 | `design/21` §2.4 中“含任督 / 奇经混合方案时取 harmony”应按字面存在判定还是经脉计票判定 | 等协调者 / 作者统一口径；本轮不为性质改线、不增 `allowOpposedNature`，保留 `--delivery` 的 22 条只报告结果 |
| NR3SL-O02 | `voice` 的消费边界 | **已确认**：字段语义见 `design/05` §4.1 / §4.2.2；仅在 `sonic && projection:true` 时逐字投影为 `ProjectionInput.voice`，用于人声外放端点判定；不参与 `projectionBoostActive`（0 档）判定；当头棒喝非外放 |

性质冲突 22 条（19 条绝招、3 条普通外放）如下，全部保持本轮改前状态：

- 绝招：`mfr_jingangbuhuai_jinshen`、`mfr_shizihou_shizihou`、`mfr_tiebushan_gangqi`、`mfr_jinzhongzhao_bupo`、`mfr_shaolinjiuyang_zhoutian`、`mfr_dajingangzhang_dali`、`mfr_xumishanzhang_yading`、`mfr_mohezhi_wuliang`、`mfr_ruyingsuixingtui_yingzong`、`mfr_longzhaoshou_sanshiliu`、`mfr_ranmudaofa_yehuo`、`mfr_jingangfumoquan_fumo`、`mfr_huheshuangxingquan_shuangxing`、`mfr_tongrenhenglian_tongrenxiang`、`mfr_xinyiba_heyi`、`mfr_xiangmochu_pojia`、`mfr_fumosuofa_huanyuan`、`mfr_jingangnuhou_zhenshe`、`mfr_wulangbaguagun_pozhen`。
- 普通外放：`mfr_shizihou_shehun`、`mfr_shizihou_zhenhou`、`mfr_jingangnuhou_nuhou`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

本任务无新增基准修改提案。NR3 路线可在 Canon V17-06 与 `design/21` §4.3.1–§4.3.4 现有规则内闭合；NR3SL-O01 属既有 §2.4 解释口径待统一，不在本任务抢先改写基准。少林册原有 BP-4～BP-6 均保留，未删除或改写。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/05-martial-arts-system.md`、`docs/tech/04-data-pipeline.md`、`docs/tech/05-gameplay-engine.md` | `MoveDef.voice` / 构建与运行时 | 消费少林册 8 招的 `voice:true` 并校验 `tags [sonic]`；仅 7 记伤害音功进入外放投影，`voice` 不参与 0 档激活判定，“当头棒喝”继续保持非外放 |
| `docs/design/21-meridian-flow-and-moves.md` / 协调者裁定 | §2.4 路线性质 | 统一任督 / 奇经混合路线的性质判读后，再集中处理 §4 的 22 条命中；本轮不可把这些命中视为已解决 |
| 其他 NR3 图鉴任务 | 本报告 §7.4 的另一侧路线 | 当前无必须调整项；少林侧已使 24 对全低于 8000 bp。若另一侧随后改线，应重跑全仓高相似检查，避免把配对重新推回阈值 |
| `docs/design/05-martial-arts-system.md` | 易筋经、龙爪手引用 | 路线 ID 未变且 05 只引用少林图鉴实例，无需复制步骤；数据构建时以少林册 v1.4 文首索引为唯一实例来源 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

| # | 配对（本册路线 / 另一侧路线） | 改前 bp | 处理方式 | 本册路线改动穴位（移出 → 移入） |
|---:|---|---:|---|---|
| 1 | `mfr_xinyiba_heyi` / `mfr_bahuang_duzun` | 10000 | ✅ 改开至 6666 | 涌泉、少府 → 命门、合谷 |
| 2 | `mfr_xinyiba_heyi` / `mfr_gumuqinggong_fenying` | 10000 | ✅ 改开至 6666 | 涌泉、少府 → 命门、合谷 |
| 3 | `mfr_jingangbuhuai_jinshen` / `mfr_yaowangdujing_baidu` | 10000 | ✅ 改开至 6250 | 太白、天池、孔最 → 命门、身柱、曲池 |
| 4 | `mfr_shizihou_shizihou` / `mfr_jinyangong_yanhui` | 10000 | ✅ 改开至 5000 | 曲泽、尺泽、照海 → 命门、至阳、曲池 |
| 5 | `mfr_yiweidujiang_feidu` / `mfr_manchuqishe_chishe` | 10000 | ✅ 改开至 6666 | 阳溪、承山 → 带脉、涌泉 |
| 6 | `mfr_shizihou_shizihou` / `mfr_sanhuajudingzhang_juding` | 10000 | ✅ 改开至 5000 | 曲泽、尺泽、照海 → 命门、至阳、曲池 |
| 7 | `mfr_tiebushan_gangqi` / `mfr_tianyishenshui_fengxia` | 10000 | ✅ 改开至 6666 | 公孙、内关 → 腰阳关、曲池 |
| 8 | `mfr_yijinjing_daozhuai` / `mfr_wujixuangongquan_huoshou` | 10000 | ✅ 改开至 6250 | 尺泽、照海、阴廉 → 命门、气冲、曲池 |
| 9 | `mfr_jingangfumoquan_fumo` / `mfr_anran_xiaohun` | 8750 | ✅ 改开至 6250 | 曲骨、郄门 → 至阳、曲池 |
| 10 | `mfr_jinzhongzhao_bupo` / `mfr_bixuegong_suoyuan` | 8750 | ✅ 改开至 6250 | 期门、膝关 → 命门、曲池 |
| 11 | `mfr_jingangfumoquan_fumo` / `mfr_hama_quanjin` | 8750 | ✅ 改开至 6250 | 曲骨、郄门 → 至阳、曲池 |
| 12 | `mfr_jiashafumogong_fumo` / `mfr_yuenvjian_wuhen` | 8750 | ✅ 改开至 6250 | 腰俞、手三里 → 气海、内关 |
| 13 | `mfr_jingangfumoquan_fumo` / `mfr_longxiang_banruo` | 8750 | ✅ 改开至 6250 | 曲骨、郄门 → 至阳、曲池 |
| 14 | `mfr_shaolinjiuyang_zhoutian` / `mfr_liuyangzhang_bafu` | 8750 | ✅ 改开至 6250 | 阴廉、俞府 → 命门、曲池 |
| 15 | `mfr_shizihou_shizihou` / `mfr_xuedaofa_cangfeng` | 8750 | ✅ 改开至 5000 | 曲泽、尺泽、照海 → 命门、至阳、曲池 |
| 16 | `mfr_tiebushan_gangqi` / `mfr_yunvxinjing_bingxin` | 8750 | ✅ 改开至 6250 | 公孙、内关 → 腰阳关、曲池 |
| 17 | `mfr_longzhaoshou_sanshiliu` / `mfr_bianfushenfa_anxiang` | 8333 | ✅ 改开至 5000 | 通里、漏谷 → 曲泽、阴谷 |
| 18 | `mfr_fumosuofa_huanyuan` / `mfr_bihai_dingshen` | 8333 | ✅ 改开至 5000 | 行间、大都 → 尺泽、内关 |
| 19 | `mfr_dajingangzhang_dali` / `mfr_chongyangzhang_diezhang` | 8333 | ✅ 改开至 5000 | 天池、孔最 → 至阳、曲池 |
| 20 | `mfr_fumosuofa_huanyuan` / `mfr_hanyuxinjue_hanqi` | 8333 | ✅ 改开至 5000 | 行间、大都 → 尺泽、内关 |
| 21 | `mfr_fumosuofa_huanyuan` / `mfr_yihun_yihun` | 8333 | ✅ 改开至 5000 | 行间、大都 → 尺泽、内关 |
| 22 | `mfr_jinzhongzhao_bupo` / `mfr_tantui_tongxing_chuaimen` | 8333 | ✅ 改开至 5000 | 期门、膝关 → 命门、曲池 |
| 23 | `mfr_luohanzhen_shibaluohan` / `mfr_bitaoxuangong_wanli` | 8000 | ✅ 改开至 4000 | 命门、神门 → 身柱、内关 |
| 24 | `mfr_yijinjing_daozhuai` / `mfr_ningxue_fengmen` | 8000 | ✅ 改开至 5000 | 尺泽、照海、阴廉 → 命门、气冲、曲池 |

### 7.2 `--delivery` 命中数（改前 / 改后）

| 规则 / 统计 | 改前 | 改后 | 结论 |
|---|---:|---:|---|
| 路线总数 / 已分类 / 未分类 | 52 / 43 / 9 | 52 / 43 / 9 | ✅ 未靠改出招方式规避分类 |
| 拳 / 擒拿末端（末 1–3 段）违规 | 0 | 0 | ✅ 曲池、手三里或合谷条件保持 |
| 位移核心脉 / 涌泉违规 | 0 | 0 | ✅ 一苇渡江·飞渡显式保留带脉、阳跷并加入涌泉 |
| 护体 / 蓄气任督违规 | 0 | 0 | ✅ 改线后仍含任脉或督脉 |
| 非绝招外放端点违规 | 0 | 0 | ✅ 18 条普通外放路线全部合法 |
| 动作末端缺失 / 位置违规 | 0 / 0 | 0 / 0 | ✅ 共检查规则 54 条 |
| 路线性质冲突（只报告） | 22 | 22 | ⚠️ 按任务要求保持，清单见 §4 |

### 7.3 改过的路线清单

| 路线 | 段数 × 单段 CT | 路线 CT / 收招合计 | 风险序列 / 总风险 | CT / 风险变化 |
|---|---:|---:|---|---|
| `mfr_yijinjing_daozhuai` | 10×80 | 800 / 2000 | `[100,120,140,160,180,200,220,240,260,280]` / 1900 | 否 / 否 |
| `mfr_jingangbuhuai_jinshen` | 10×80 | 800 / 2000 | `[100,120,140,160,180,200,220,240,260,280]` / 1900 | 否 / 否 |
| `mfr_shizihou_shizihou` | 10×80 | 800 / 2000 | `[100,120,140,160,180,200,220,240,260,280]` / 1900 | 否 / 否 |
| `mfr_tiebushan_gangqi` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_jinzhongzhao_bupo` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_shaolinjiuyang_zhoutian` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_dajingangzhang_dali` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_longzhaoshou_sanshiliu` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_jiashafumogong_fumo` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_yiweidujiang_feidu` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_jingangfumoquan_fumo` | 8×90 | 720 / 1920 | `[100,120,140,160,180,200,220,240]` / 1360 | 否 / 否 |
| `mfr_xinyiba_heyi` | 6×100 | 600 / 1800 | `[100,120,140,160,180,200]` / 900 | 否 / 否 |
| `mfr_fumosuofa_huanyuan` | 6×100 | 600 / 1800 | `[100,120,140,160,180,200]` / 900 | 否 / 否 |
| `mfr_luohanzhen_shibaluohan` | 8×75 | 600 / 1800 | `[100,110,120,130,140,150,160,170]` / 1080 | 否 / 否 |

### 7.4 交其他任务的条目

- ✅ 24 条配对的“另一侧”均无需为本配对调整：少林侧已把重合降至阈值以下。涉及道家、逍遥、乾隆、康熙、古龙、五绝、通行图鉴的维护者若另行改线，应重跑 `check_nr3_unit.py` 或全仓相似检查。
- ⚠️ 性质判读协调任务：须统一处理 §4 列出的 22 条 `nature-conflict`；在统一结论前，其他任务不得把少林侧路线私自改为另一性质或加豁免。
- ⚠️ 构建 / 运行时任务：同步消费 8 招 `voice:true` 并校验 `tags [sonic]`；仅对 7 记伤害音功的外放投影生成 `ProjectionInput.voice===true`，不得把非伤害支援招 `mv_shizihou_hexing` 误标为外放。

### 7.5 指定门禁

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；扫描 111 文件、13906 定义；仅基线 `docs/README.md` 的 `sk_babuganchan` 未定义，新失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 / 145 通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 全部通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 全部通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-shaolin.md` | ✅ `errors=0`；52 路线 / 52 序列；完全相同、≥80%、跨册警告均为 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-shaolin.md` | ✅ 动作 / 末端 / 非绝招外放违规 0；性质冲突 22 为本轮要求保留的只报告项 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-shaolin.md` | ✅ 与其他武学完全相同的绝招路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-shaolin.md` | ✅ 未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py shaolin` | ✅ 名下 24 对；改开 24、理由 0、未处理 0、新造 ≥80% 配对 0 |
| `git diff --check` | ✅ 通过 |

### 7.6 范围、格式与完整性

- ✅ 只修改授权的 `docs/design/catalog/skills-shaolin.md` 与本报告；未执行任何改变仓库状态的 Git 命令。
- ✅ 版本行已追加“路线叙事第三轮（2026-09-29）”；未新增 ID，也未删除既有待决事项。
- ✅ 文首索引是 14 条改线的唯一步骤镜像；§5.7 的绑定仍统一写“显式（见本册绝招显式路线索引）”，并新增段数、CT、收招和风险核算表。
- ✅ 14 条路线的出招方式、purpose、路线性质判定、段数、逐段 CT、风险数组均保持；同门共享超过 50%、轮换或逆序均为 0。
- ✅ 所有补丁均少于约 150 行；最终检查表格与语句完整，无未完成占位词。
- ⚠️ 22 条性质冲突是协调者明确要求本轮不修的只报告项，并非遗漏；其余本单元验收项全部完成。

### 7.7 返修记录

1. 图鉴第 1533、1623 行与报告 §4：将原错误章节引用校正为 `design/05` §4.1 / §4.2.2，并把 NR3SL-O02 改为已确认的 `voice` 消费边界。
2. 图鉴第 336、1591 行与报告 §4、§6、§7.4：移除原“禁”声表述，明确 `voice` 是静态出招事实、仅由伤害音功的外放投影消费，且不参与 0 档激活判定。
3. 图鉴第 889 行：为金刚怒吼两记 `voice:true` 招式显式补记 `tags [sonic]`；其余路线步骤、CT、风险及 MoveDef 数值均未改动。

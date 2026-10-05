# NR3-qianlong 报告 · 路线叙事第三轮 · 乾隆（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

乾隆册名下 22 对跨武学高相似路线已全部改开，涉及本册 11 条绝招路线；最终最大重合为 5000 bp，无豁免理由、无新造 ≥8000 bp 配对。
拳 / 擒拿末端的 3 条缺穴与 1 条末三段位置违规均已修复；位移、护体 / 蓄气、非绝招外放及性质检查均无遗留命中。
所有改线均保持出招方式、段数、逐段 CT、风险、收招、用途与招式成本不变；持笛音功“金声乱耳”补为 `voice:false`。
规定的 10 项验收命令全部通过，且工作区只改动授权的图鉴与本报告。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-qianlong.md` | 1486 | 文首路线镜像、跨武学高相似路线说明、金声乱耳人声字段、§9A 路线注册与 CT 镜像、§11 校验规则 / 用例 |
| `tools/agents/reports/NR3-qianlong.md` | 124 | 22 对逐对结果、11 路改穴清单、delivery 前后对照、验收记录与交接结论 |

## 3. 关键结论与数值

- 分派基线为 22 对：10000 bp ×4、9000 bp ×1、8750 bp ×9、8333 bp ×6、8000 bp ×2。按 `floor(10000×|A∩B|/min(|A|,|B|))` 复算后，18 对为 0，另 4 对为 1250 / 1666 / 3333 / 5000 bp；全部低于 8000 bp。
- 改线共 11 条：4 条 10 段路线保持 `10×80=800 CT`，收招合计 `800+1200=2000 CT`，风险和 `100+120+…+280=1900`；4 条 8 段路线保持 `8×90=720 CT`，合计 1920 CT，风险和 1360；3 条 6 段路线保持 `6×100=600 CT`，合计 1800 CT，风险和 900。
- 每条路线至少替换 `floor(0.2L)+1` 个穴位：10 段至少 3 个、8 段至少 2 个、6 段至少 2 个；实际最少为 `mfr_bajiquan_beng` 的 4/6 个。
- 本册 26 条显式路线中 22 条可分类并检查，delivery 缺失与末端位置违规均归零；4 条不强制分类，非绝招外放路线 1 条且端点合法，性质冲突命中清单为空。
- `mfr_tianshanyingyang_tianji` 的镜像统一为 8 段、720 CT、收招合计 1920 CT；通用 `Q-M8` 仍为 640 CT，两者不再混写。

## 4. 开放问题（附默认值）

| # | 问题 | 本册命中 | 默认值 |
|---|---|---|---|
| NR3-QL-O01 | `design/21` §2.4 对“含任督 / 奇经混合方案时取 harmony”的计票读法与字面读法尚待作者确认 | 0 条 | 本轮不因性质改线；沿用当前检查口径，待协调者统一裁定后再处理全局命中 |

除上述全局解释问题外，本单元没有需要作者拍板才能落地的路线项；默认采用本轮已通过校验的路线。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案。§2.4 的解释分歧已是协调者在办事项，本任务不重复立项，也未修改 Canon、`design/21` 或检查器。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| 无强制同步项 | — | 22 对均已通过修改本侧路线降至 8000 bp 以下，另一侧图鉴无需随本任务调整；分派快照保持只读基线 |
| 全局后续批次 | `design/21` §2.4 相关路线 | 待作者确认性质判定读法后由协调者统一处理；乾隆册当前命中 0 条 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

“改动的穴位”列关联到 §7.2 的完整旧穴移除 / 新穴加入清单；同一路线承担多对时只改一次本侧，不触碰另一侧。

| # | 配对（本侧 / 另一侧） | 改前 bp | 处理方式 / 改后 bp | 改动的穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_baihuacuo_cuoluo` / `mfr_shenshuineigong_zhongchao` | 10000 | 改开 / 0 | 本侧全 10 穴重配，见 §7.2 同名路线 |
| 2 | `mfr_bajiquan_beng` / `mfr_shouchengzhen_bushi` | 10000 | 改开 / 3333 | 本侧替换 4/6 穴，见 §7.2 同名路线 |
| 3 | `mfr_hujiadao_humiaohuzhao` / `mfr_huagong_duwu` | 10000 | 改开 / 0 | 本侧全 10 穴重配，见 §7.2 同名路线 |
| 4 | `mfr_hujiadao_humiaohuzhao` / `mfr_qinlonggong_shuaizhi` | 10000 | 改开 / 0 | 同上 |
| 5 | `mfr_baihuacuo_fanchang` / `mfr_bihai_dingshen` | 9000 | 改开 / 0 | 本侧全 10 穴重配，见 §7.2 同名路线 |
| 6 | `mfr_baihuacuo_cuoluo` / `mfr_tangmenanshou_baoyu` | 8750 | 改开 / 0 | 同 #1 |
| 7 | `mfr_baihuacuo_fanchang` / `mfr_shenshuineigong_huilan` | 8750 | 改开 / 0 | 同 #5 |
| 8 | `mfr_baihuacuo_fanchang` / `mfr_ximenjiandao_yingxue` | 8750 | 改开 / 0 | 同 #5 |
| 9 | `mfr_hujiadao_humiaohuzhao` / `mfr_fanliangyi_sixiang` | 8750 | 改开 / 0 | 同 #3 |
| 10 | `mfr_miaojiajian_bafang` / `mfr_gaochangshouhu_jieai` | 8750 | 改开 / 0 | 本侧全 8 穴重配，见 §7.2 同名路线 |
| 11 | `mfr_huibuqijian_huifeng` / `mfr_tongbeijian_jianzou` | 8750 | 改开 / 5000 | 本侧替换 5/8 穴，见 §7.2 同名路线 |
| 12 | `mfr_hujiadao_fengxue` / `mfr_huweiyingqiang_bafang` | 8750 | 改开 / 0 | 本侧替换 9/10 穴，见 §7.2 同名路线 |
| 13 | `mfr_hujiadao_fengxue` / `mfr_wangwuposhi_kaishan` | 8750 | 改开 / 1250 | 同 #12 |
| 14 | `mfr_tianshanyingyang_tianji` / `mfr_qihuangmifa_qichenke` | 8750 | 改开 / 0 | 本侧全 8 穴重配，见 §7.2 同名路线 |
| 15 | `mfr_baihuacuo_cuoluo` / `mfr_duanzhenqiang_pozhen` | 8333 | 改开 / 0 | 同 #1 |
| 16 | `mfr_baihuacuo_cuoluo` / `mfr_zaoheding_penhe` | 8333 | 改开 / 0 | 同 #1 |
| 17 | `mfr_baxianjian_guohai` / `mfr_jindingjiushi_wanliu` | 8333 | 改开 / 1666 | 本侧替换 5/6 穴，见 §7.2 同名路线 |
| 18 | `mfr_yaowangdujing_baidu` / `mfr_chongyangzhang_diezhang` | 8333 | 改开 / 0 | 本侧全 8 穴重配，见 §7.2 同名路线 |
| 19 | `mfr_tianshanyingyang_tianji` / `mfr_linyulongdao_zhengxian` | 8333 | 改开 / 0 | 同 #14 |
| 20 | `mfr_miaojiaquan_zhengqi` / `mfr_wuzhengxinfa_huzhuang` | 8333 | 改开 / 0 | 本侧全 6 穴重配，见 §7.2 同名路线 |
| 21 | `mfr_baihuacuo_cuoluo` / `mfr_shenghuoling_wuding` | 8000 | 改开 / 0 | 同 #1 |
| 22 | `mfr_baihuacuo_fanchang` / `mfr_huoyandao_hufa` | 8000 | 改开 / 0 | 同 #5 |

### 7.2 改过的路线清单

穴位以 `ap_*` ID 的尾名记录，避免同音或译名歧义；“移除 → 加入”均只表示集合替换，完整有序新路线见图鉴文首索引。

| 路线 | 改动穴位（移除 → 加入） | 段数 / 路线 CT / 收招合计 | CT、风险是否变化 |
|---|---|---|---|
| `mfr_baihuacuo_cuoluo` | 移除 `shaofu, shaoshang, jiaoxin, fuai, ligou, zhongfeng, taixi, shangqiu, guanyuan, yinjiao` → 加入 `henggu, siman, jingmen, weidao, jugu, tianzong, qingling, xiabai, shousanli, hegu` | 10 / 800 / 2000 CT | 均不变；风险 `[100,120,140,160,180,200,220,240,260,280]`，总 1900 |
| `mfr_baihuacuo_fanchang` | 移除 `rangu, dadu, yinlingquan, shenque, jianshi, zhongchong, shenmen, tianfu, lieque, lianquan` → 加入 `shimen, yaoyangguan, ququan, xuehai, qimen, zhaohai, shaohai, tongli, quchi, hegu` | 10 / 800 / 2000 CT | 均不变；风险 `[100…280]`，总 1900 |
| `mfr_hujiadao_fengxue` | 移除 `quchi, fuyang, shenmai, yamen, xuanzhong, kunlun, fenglong, zusanli, shenzhu` → 加入 `shenshu, xinshu, weizhong, chengshan, mingmen, zhiyang, jinmen, tianjing, waiguan`；`wangu` 保留 | 10 / 800 / 2000 CT | 均不变；风险 `[100…280]`，总 1900 |
| `mfr_hujiadao_humiaohuzhao` | 移除 `feishu, chengqi, tianshu, shendao, guanchong, zhigou, quchi, fuyang, shenmai, wangu` → 加入 `liangqiu, yanglingquan, chengshan, yaoyangguan, jizhong, jianjing, tianjing, waiguan, houxi, yanggu` | 10 / 800 / 2000 CT | 均不变；风险 `[100…280]`，总 1900 |
| `mfr_miaojiajian_bafang` | 移除 `tianliao, tongziliao, cuanzhu, zhiyin, sibai, shangxing, zhiyang, yanggu` → 加入 `dahe, shiguan, jingmen, daimai, jugu, tianzong, waiguan, yangchi` | 8 / 720 / 1920 CT | 均不变；风险 `[100,120,140,160,180,200,220,240]`，总 1360 |
| `mfr_yaowangdujing_baidu` | 移除 `taibai, huiyin, zhongji, tianchi, shaochong, kongzui, zhongfu, daheng` → 加入 `gongsun, diji, xuehai, shimen, shuifen, ximen, chize, taiyuan` | 8 / 720 / 1920 CT | 均不变；风险 `[100…240]`，总 1360 |
| `mfr_tianshanyingyang_tianji` | 移除 `xuanzhong, kunlun, fenglong, zusanli, shenzhu, sizhukong, zhongzhu, xiaohai` → 加入 `yongquan, dazhong, jingmen, pucan, fuyang, yangjiao, waiqiu, zuqiaoyin` | 8 / 720 / 1920 CT | 均不变；风险 `[100…240]`，总 1360 |
| `mfr_huibuqijian_huifeng` | 移除 `shousanli, guangming, zuqiaoyin, weizhong, lidui` → 加入 `yongquan, zulinqi, weidao, fengshi, yanglao`；`juliao, jianjing, wangu` 保留 | 8 / 720 / 1920 CT | 均不变；风险 `[100…240]`，总 1360 |
| `mfr_miaojiaquan_zhengqi` | 移除 `waiguan, lingdao, yinxi, xiaohai, tianfu, pianli` → 加入 `qihai, mingmen, jingmen, houxi, shousanli, hegu` | 6 / 600 / 1800 CT | 均不变；风险 `[100,120,140,160,180,200]`，总 900 |
| `mfr_baxianjian_guohai` | 移除 `shuigou, danzhong, shuifen, neiguan, sizhukong` → 加入 `henggu, jingmen, jugu, yifeng, yanglao`；`yangchi` 保留 | 6 / 600 / 1800 CT | 均不变；风险 `[100…200]`，总 900 |
| `mfr_bajiquan_beng` | 移除 `yingxiang, tianliao, tongziliao, cuanzhu` → 加入 `chengqi, jiache, shenzhu, quchi`；`naoshu, hegu` 保留 | 6 / 600 / 1800 CT | 均不变；风险 `[100…200]`，总 900 |

### 7.3 `--delivery` 命中数（改前 / 改后）

| 规则 | 改前 | 改后 | 结论 |
|---|---:|---:|---|
| 显式路线 / 可分类 / 实际检查 | 26 / 22 / 22 | 26 / 22 / 22 | 数量不变 |
| 拳 / 擒拿缺少曲池、手三里或合谷 | 3 | 0 | ✅ 改开路线同时补齐 |
| 拳 / 擒拿关键穴不在末 1–3 段 | 1 | 0 | ✅ `mfr_bajiquan_beng` 已收曲池—合谷 |
| 位移核心脉违规 | 0 | 0 | ✅ `mfr_tianshanyingyang_tianji` 含涌泉、带脉、阳跷与足少阳 |
| 护体 / 蓄气缺任督 | 0 | 0 | ✅ 无命中 |
| 非绝招外放路线 / 端点违规 | 1 / 0 | 1 / 0 | ✅ 金声乱耳收阳池 |
| 路线性质冲突 | 0 | 0 | ✅ 命中清单为空，本轮未因性质改线 |
| 未分类路线 | 4 | 4 | ✅ 只报告，不硬套类型 |

新规则逐条结果：

| 路线 | 规则 | 改前末三段 | 改后末三段 | 结果 |
|---|---|---|---|---|
| `mfr_baihuacuo_cuoluo` | 拳 / 擒拿缺失 | `shangqiu, guanyuan, yinjiao`（全线无曲池 / 手三里 / 合谷） | `xiabai, shousanli, hegu` | ✅ |
| `mfr_baihuacuo_fanchang` | 拳 / 擒拿缺失 | `tianfu, lieque, lianquan`（全线无） | `tongli, quchi, hegu` | ✅ |
| `mfr_miaojiaquan_zhengqi` | 拳 / 擒拿缺失 | `xiaohai, tianfu, pianli`（收偏历） | `houxi, shousanli, hegu` | ✅ |
| `mfr_bajiquan_beng` | 拳 / 擒拿末三段位置 | `tianliao, tongziliao, cuanzhu`（合谷在第 1 段） | `naoshu, quchi, hegu` | ✅ |

护体 / 蓄气任督、位移步法脉、非绝招外放端点三项改前、改后均 0 条命中。

按检查器现行计票读法（`route_nature`），本轮改线使 3 条路线的计票性质变化：`mfr_baihuacuo_cuoluo` yin→yang、`mfr_miaojiaquan_zhengqi` harmony→yang、`mfr_baxianjian_guohai` harmony→yang；三门武学均为“和”，不构成阴↔阳冲突。按字面读法（含任督 / 奇经取 harmony），11 条改线前后均为 harmony。

本轮没有为性质改线；本单元性质冲突命中清单两种读法均为空。

### 7.4 交其他任务的条目

- ✅ 无需调整 22 对的“另一侧”：本侧改线后每对均低于 8000 bp。
- ✅ 无性质冲突路线需要转交后续性质批次；仅保留 §4 所述全局解释问题。
- ✅ 未新增 ID；没有需要同步注册到 `design/15` 或 Canon §12 的穴位 / 前缀。

### 7.5 验收命令与范围自检

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；已知基线未定义 1，新问题 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145/145 通过 |
| `damage_sim.py --check` / `meridian_flow_sim.py --check` / `projection_sim.py --check` | ✅ 全部通过（damage 47/47） |
| `check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-qianlong.md` | ✅ errors 0；本册及跨册 ≥80% 配对均 0 |
| `check_route_unique_for.py docs/design/catalog/skills-qianlong.md` | ✅ 完全相同路线 0 |
| `check_undefined_in.py docs/design/catalog/skills-qianlong.md` | ✅ 未定义引用 0 |
| `check_nr3_unit.py qianlong` | ✅ 22 改开、0 理由、0 未处理、0 新造 ≥80% 配对 |
| `check_skill_catalogs.py --delivery --details docs/design/catalog/skills-qianlong.md` | ✅ violations 0、tail 0、projection 0、nature 0 |
| 写入范围 / 文档完整性 | ✅ 仅图鉴与本报告；版本行已追加；未删既有待决项；无新 ID、无占位文本、围栏与表格完整 |

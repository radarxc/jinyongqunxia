# F2L 报告 · 修正 ID 检查脚本的定义识别（YAML 数据源、归属文档定义写法、局部作用域、过渡基线）

## 1. 摘要（3–6 行）

ID 检查器现默认扫描 89 份 Markdown 与 `docs/design/map/*.yaml` 4 份结构化数据源，并只在基准 §18 / 作者需求指定的归属文档中承认定义。
新增表格 ID 列、定义性标题、YAML / JSON `id:` 与映射键、书界 / 剧情编号归属、`quest.v1` 局部键及明确示例的窄规则。
“引用但未定义”由 1,617 个唯一 ID / 7,713 次引用降至 161 / 504；最终仍保留 `npc_*`、`it_*`、`bsc_*`、`q_*` 等真缺口。
新增 schema v1 baseline；`--strict` 只阻断 baseline 外新增的未定义 / 旧 ID，当前门禁为 0 个新增问题。
32 项标准库单测全部通过；全仓最终为 0 定义名冲突、0 旧 ID、25 组近似拼写；`design/07` 不存在，套装不对称检查明确跳过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `tools/lint/check_ids.py` | 2,114 | YAML 数据源发现与定义提取、owner-only 判定、局部作用域、示例 / 参数族窄豁免、baseline 读写与 strict 差集 |
| `tools/lint/test_check_ids.py` | 819 | 32 项测试；覆盖 YAML、表格 / 标题 / 代码块、归属正反例、编号归属、局部键、fixture、示例、baseline |
| `tools/lint/check_ids_baseline.json` | 167 | schema v1；161 个已知未定义 ID、0 个已知旧 ID |
| `tools/lint/README.md` | 168 | CLI、扫描范围、定义 / 归属 / 局部规则、baseline 与扩展方式 |
| `tools/agents/reports/F2L.md` | 本报告 | 计数、六组交接清单、开放问题与自检 |

主要验证命令：

```shell
python3 -m unittest tools/lint/test_check_ids.py
python3 tools/lint/check_ids.py --json
python3 tools/lint/check_ids.py --strict
python3 tools/lint/check_ids.py --update-baseline
```

## 3. 关键结论与数值

- 修改前：89 个 Markdown、46,002 次 ID 出现、8,232 个定义；1,617 个唯一未定义 ID、7,713 次未定义引用。
- 修改后：93 个文件（89 Markdown + 4 YAML）、47,109 次出现、10,648 个定义；161 个唯一未定义 ID、504 次引用。
- 降幅：唯一未定义减少 1,456（`1456 / 1617 = 90.04%`）；引用减少 7,209（`7209 / 7713 = 93.47%`）。
- 剩余前缀：`npc_` 68 / 123、`it_` 39 / 99、`bsc_` 25 / 78、`q_` 8 / 10、`aoe_` 5 / 105、`mer_` 4 / 67、`cmb_` 4 / 9，其余各 1。格式均为“唯一 ID / 引用次数”。
- baseline 保存稳定 ID 键而不保存行号；已知 161 / 0，新增未定义 / 旧 ID 均为 0，故 `--strict` 退出 0。删除旧问题会自然消失，新增或改名后的缺口仍会失败。
- 单测缺陷分析确认并修复 4 个边界：owner 围栏映射键漏定义、局部键在同族 owner 中污染全局定义、旧 owner 路径过宽、任意 `_a/_b` 被误当占位。

## 4. 开放问题（附默认值）

1. `it_xinwu_*` 的语义由 `design/20` 生产，但基准 §18 把物品目录归 `design/10`。默认保持 39 项为未定义，由 F2a 在 `design/10` 建紧凑物品登记，`design/20` 继续只引用。
2. `mer_ren`、`mer_du`、`mer_chong`、`mer_dai` 是 `design/15` 内写明的旧短 ID，目标分别为 `mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`。默认由 F2b / F2c 完成迁移；本脚本不把非中央迁移说明擅自升格为全局重命名表。
3. `aoe_cross`、`aoe_diamond`、`aoe_sq3`、`aoe_sq5`、`aoe_sweep` 看似六角格前旧名。默认仍报错，由 F2a 在 `design/09` 的正式迁移表裁定、F2c 同步图鉴引用。
4. `dc_*` 在 Canon §12 登记为选择节点，但 `design/12` 又称其仅为策划标签、非全局内容 ID。默认按用户任务要求在对应 story 文件中视作局部剧情定义；未扩大到其他文件。
5. 覆盖率门禁未配置，`EXEC_SOURCE` 也不是 flux / flux-web，按单测技能规则跳过 Step 6；环境同时没有 Python `coverage` 模块。默认不引入新依赖，以 32/32 行为测试、`py_compile` 和全仓 CLI 复验作为本次验证。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| F2L-P01 | 在 Canon §18 明确 `it_xinwu_*`：对象目录定义归 `design/10`，`design/20` 仅拥有投放 / 合成引用；或明确授予双方不同字段的联合归属。 | 当前 39 个信物全部只在 `design/20` 出现，机械按 §18 会成为真缺口；需避免 F2a 建重复卡或脚本永久特判。 |
| F2L-P02 | 把四个 `mer_*` 旧短名迁移正式纳入 `rulings-v1.md` §2，或在 Canon §12 增全局迁移表引用。 | 检查器只从中央裁定表解析 deprecated；局部迁移说明不足以让所有消费者一致替换。 |
| F2L-P03 | 明确 `q_NN_main_c/z/x_nn` story 语义键与 `q_NN_main_nn` 生产 QuestDef 的双层归属规则。 | `story/14` 已显式同时维护两套稳定键，单写“主线唯一归 story”不足以区分章节生产索引是否合法。 |
| F2L-P04 | 明确 `dc_*` 是“story 内局部策划键”还是全局注册内容 ID；若为局部键，从 Canon §12 全局 ID 表移至任务局部键说明。 | Canon §12 与 `design/12` §2.6 / §12.4 的措辞冲突，当前只能按任务要求采取兼容解释。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/10-items-and-equipment.md` | 物品目录 / 本文新增 ID | 登记 39 个 `it_xinwu_*` 关键信物；与 `design/20` 的用途一一对应，不在两处重复字段定义。 |
| `docs/design/15-meridians-and-acupoints.md`、全部武学图鉴 | 迁移表 / 经脉字段 | 将四个短 `mer_*` 全量替换为正式全名，并把迁移关系提升到中央裁定表。 |
| `docs/design/09-combat-system.md`、武学图鉴 | 范围模板 / Boss / 合击目录 | 裁定 5 个旧 `aoe_*`；登记 25 个 `bsc_*`、4 个 `cmb_*`、`gauge_fengsuo`。 |
| `docs/design/18-npc-and-companions.md`、`catalog/npcs-*.md` | NPC 名录 | 登记报告 §7 的 68 个 `npc_*`，含系统角色 `npc_zhujue`、`npc_shuling`。 |
| `docs/design/story/02`–`05`、`08` 与对应 chapters | 主 / 支线索引 | 核对并定义或替换 8 个残留 `q_*`；`*_done` 很可能是状态键误写成任务 ID。 |
| `docs/design/02-timeline-and-world-tiers.md` | 书眠 Ink / 视频序列 | 处理 `bs_ch06_intro`；`vid_sleep_14_15` 越过 14 书界边界，确认删除或改为终局视频 ID。 |
| `docs/design/11-open-world.md`、`design/map/*` | 城市 / POI | 核对 `city_hunyuan` 与 `poi_dali_wuliang_yubi_01`；前者可能待地图三十区迁移，后者目前只有引用。 |
| `docs/design/13-progression-and-endings.md` | 回响旗标 | 登记或替换 `echo_12_fate`。 |
| `docs/design/catalog/skills-general.md`、`design/05` | 武学目录 | 登记或替换 `sk_feishi`。 |
| `docs/design/10-items-and-equipment.md` | 装备目录 | 核对古龙图鉴引用的 `eq_kongqueling`。 |
| `docs/tech/04-data-pipeline.md` | ID CI 门禁 | 写明 baseline 差集语义、仅允许完整默认扫描刷新、F2 汇总清零 / 再刷新计划。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 修改前 / 后计数

下表按修改前唯一 ID 数降序列出前 30 个前缀；单元格均为“唯一未定义 ID / 引用数”。

| 前缀 | 修改前 | 修改后 |
|---|---:|---:|
| `sc_` | 263 / 781 | 0 / 0 |
| `city_` | 191 / 1,163 | 1 / 1 |
| `ap_` | 182 / 216 | 0 / 0 |
| `rp_` | 175 / 480 | 0 / 0 |
| `biz_` | 150 / 579 | 0 / 0 |
| `dc_` | 135 / 1,759 | 0 / 0 |
| `frag_` | 117 / 283 | 0 / 0 |
| `npc_` | 68 / 123 | 68 / 123 |
| `cache_` | 39 / 95 | 0 / 0 |
| `it_` | 39 / 99 | 39 / 99 |
| `lgs_` | 39 / 144 | 0 / 0 |
| `aoe_` | 30 / 1,117 | 5 / 105 |
| `bsc_` | 25 / 78 | 25 / 78 |
| `mer_` | 24 / 343 | 4 / 67 |
| `tr_` | 23 / 27 | 0 / 0 |
| `vid_` | 18 / 91 | 1 / 1 |
| `route_` | 15 / 58 | 0 / 0 |
| `zt_` | 12 / 33 | 0 / 0 |
| `res_` | 10 / 24 | 0 / 0 |
| `q_` | 8 / 10 | 8 / 10 |
| `save_` | 7 / 15 | 0 / 0 |
| `origin_` | 6 / 12 | 0 / 0 |
| `job_` | 5 / 104 | 0 / 0 |
| `offmap_` | 5 / 17 | 0 / 0 |
| `cmb_` | 4 / 9 | 4 / 9 |
| `sv_` | 4 / 7 | 0 / 0 |
| `ai_` | 3 / 4 | 0 / 0 |
| `poi_` | 3 / 5 | 1 / 1 |
| `port_` | 3 / 6 | 0 / 0 |
| `post_` | 3 / 4 | 0 / 0 |
| **合计（全部前缀）** | **1,617 / 7,713** | **161 / 504** |

修改后未进入上述原前 30 的残留前缀为：`bs_` 1 / 3、`echo_` 1 / 4、`eq_` 1 / 1、`gauge_` 1 / 1、`sk_` 1 / 1。修改前 `sk_` 为 3 / 3，其中精确语法元变量 `sk_a`、`sk_b` 现被窄豁免。

### 7.2 新规则与理由

- ✅ **YAML 数据源**：默认发现 `docs/design/map/*.yaml`；只把 `id:` 值或完整 ID 映射键算定义，普通 `region` / `city_id` 等值仍是引用。理由：覆盖 189 个 `city_*` 及路线、站点、区域、门派数据，同时不把关系边伪装成对象。
- ✅ **owner-only 定义**：表格 ID 列、定义标题、owner 围栏的 `id:` / 映射键、登记清单均先过 `OWNERSHIP`。非 owner 中相同写法仍是引用。理由：落实 Canon §18，防止引用表掩盖缺口。
- ✅ **本地实例编号**：`sc_NN_*`、`dc_NN_*` 与全部主线 `q_NN_main_*` 必须匹配 chapters / story 文件号；主线只在 story 定义，`story/14` 的 `q_14_main_01..21` 紧凑范围可展开为生产 ID。理由：守住书界隔离和主线唯一归属，同时兼容明确的双层映射。
- ✅ **任务局部作用域**：只在含 `schemaVersion: quest.v1` 的同一围栏内收集已声明 `st_`、`edge_`、`fx_`、`chk_`、旧 `tr_` 及 `branchKey` 用的扩展 `dc_*`；它们不参与全局未定义 / near-match，也不能在全局 owner 中建立定义。理由：`tr_*` 同时是合法地形前缀，不能整族忽略。
- ✅ **示例豁免**：仅 exact `*_example` / `*_example_*`、明确 `fixture: true` 的 QuestDef 与少量精确 schema 元变量豁免；任意 `_a/_b` 不再泛化豁免。理由：避免示例噪声而不吞真实 ID。
- ✅ **窄派生规则**：相邻书眠视频、正式存档槽、章节视频、时辰物品等必须完整匹配权威参数族；`vid_sleep_14_15` 因越界仍报。理由：参数化实例无需穷举，但非法边界必须可见。
- ✅ **过渡 baseline**：JSON 只存未定义 / deprecated 的稳定 ID 集；strict 比集合差值，刷新采用同目录临时文件原子替换，且拒绝带路径的局部刷新。理由：CI 可立即阻断回归，同时 F2 可逐项消债。
- ✅ **精确 owner 收窄**：NPC 只由 18 / NPC 图鉴定义，门派只由 17 / `map/sects.yaml` 定义；`design/12` 的 schema fixture 不建立这些全局对象。理由：作者需求 AR-08/09 高于旧归属路径。

### 7.3 修改后仍未定义：六组交接清单

以下 161 项与最终 baseline 完全一致；分组按 `tools/agents/tasks.json` 的写入边界。

#### 设计 A（F2a，78）

`aoe_cross`, `aoe_diamond`, `aoe_sq3`, `aoe_sq5`, `aoe_sweep`, `bs_ch06_intro`, `bsc_chenjialuo_tianchishizhao`, `bsc_dongfangbubai_heimuya`, `bsc_guixinshu_jiaoyi`, `bsc_hengshan_bianling`, `bsc_huashan_shoumi`, `bsc_jiaozhai_zhidou`

`bsc_jiaqiduiling_yeerqiang`, `bsc_jinshedong_shoushi`, `bsc_kuyin_sanfang`, `bsc_liuqu_tuilu`, `bsc_qianlong_gongjin`, `bsc_renwoxing_dilao`, `bsc_sanzhan_shaolin`, `bsc_shanzong_zhuibing`, `bsc_wenjia_wuxingzhen`, `bsc_wuyue_duoshuai`, `bsc_xiaofeng_juxianzhuang`, `bsc_yucanghai_fuzhou`

`bsc_yuzhenzi_chongzhengdian`, `bsc_yuzhenzi_huashan`, `bsc_zhangzhaozhong_chitaodu`, `bsc_zhangzhaozhong_liuheta`, `bsc_zhangzhaozhong_shacheng`, `bsc_zhaohui_heishuiying`, `bsc_zhouzhongying_tiedanzhuang`, `city_hunyuan`, `cmb_huashanzhige`, `cmb_jinshetongxin`, `cmb_qipanbaibian`, `cmb_zhusuoshuangqiang`

`eq_kongqueling`, `gauge_fengsuo`, `it_xinwu_aqingshoujuan`, `it_xinwu_baihua_cuopu`, `it_xinwu_beiming_botu`, `it_xinwu_bihai_yuxiaoji`, `it_xinwu_bixie_jiapao`, `it_xinwu_dagou_bangjie`, `it_xinwu_douzhuan_shipu`, `it_xinwu_dugu_jianshi`, `it_xinwu_fuqi_shuangpu`, `it_xinwu_gaochang_bihua`

`it_xinwu_hujiadao_shouye`, `it_xinwu_hunyuan_zhangyin`, `it_xinwu_jinshe_jiantu`, `it_xinwu_jiuyang_jiaoben`, `it_xinwu_jiuyin_jiaokan`, `it_xinwu_kuihua_hongyin`, `it_xinwu_lingbo_butu`, `it_xinwu_liumai_jianpu`, `it_xinwu_luohan_nirenxin`, `it_xinwu_miaojia_jianxin`, `it_xinwu_ningxue_xiangtang`, `it_xinwu_paoding_dongwen`

`it_xinwu_qiankun_shenghuolingyin`, `it_xinwu_shenlong_longyin`, `it_xinwu_shenxing_qipan`, `it_xinwu_shenzhao_yuwen`, `it_xinwu_taiji_chutu`, `it_xinwu_taijijian_mujian`, `it_xinwu_taixuan_shike`, `it_xinwu_tangshi_puzi`, `it_xinwu_taxue_xueyin`, `it_xinwu_xianglong_bangji`, `it_xinwu_xiaowuxiang_yuxin`, `it_xinwu_xixing_tiesuo`

`it_xinwu_xuantie_beituo`, `it_xinwu_xuedao_xueyin`, `it_xinwu_yijin_fanjia`, `it_xinwu_yiyang_duanzhi`, `it_xinwu_yunv_shuangyin`, `poi_dali_wuliang_yubi_01`

#### 设计 B（F2b，73）

`echo_12_fate`, `mer_chong`, `mer_dai`, `mer_du`, `mer_ren`, `npc_asan`, `npc_baishijing`, `npc_baituo_shenutou`, `npc_baiyunguan_daozhang`, `npc_baobutong`, `npc_batianshi`, `npc_benyin`

`npc_cien`, `npc_dengbaichuan`, `npc_diancangyuyin`, `npc_duanzhengming`, `npc_fangsheng`, `npc_fanyiweng`, `npc_fengboe`, `npc_fengmofeng`, `npc_fuminyi`, `npc_fusigui`, `npc_gaibang_chuangong`, `npc_gaibang_zhanglao`

`npc_generic_jiaotou`, `npc_guducheng`, `npc_heliantieshu`, `npc_huicong`, `npc_juxian_zhuangding`, `npc_kongxing`, `npc_kongzhi`, `npc_lianxing`, `npc_liao_jiaotou`, `npc_liao_lieren`, `npc_liao_wushi`, `npc_luchengfeng`

`npc_luguanying`, `npc_meijian`, `npc_ming_jiaotou`, `npc_mizong_lama`, `npc_moxia`, `npc_nanshaolin_luohantang`, `npc_ouyangke`, `npc_qiaozi`, `npc_quanzhen_sandai`, `npc_sangjie`, `npc_shaolin_banruotang`, `npc_shaolin_damoyuan`

`npc_shaolin_fangzhang`, `npc_shaolin_jielvyuan`, `npc_shaolin_luohantang`, `npc_shaolin_shibaluohan`, `npc_shaolin_wuseng`, `npc_shoujuanren`, `npc_shuling`, `npc_sikongxuan`, `npc_tianhong`, `npc_wuchangfeng`, `npc_wudang_youfang`, `npc_wuliang_dizi`

`npc_xiaoxiangzi`, `npc_xiaoyuanshan`, `npc_xinshuangqing`, `npc_xixia_jiaotou`, `npc_xixia_wushi`, `npc_yangmiaozhen`, `npc_yaoyue`, `npc_yulianzhou`, `npc_zhaixingzi`, `npc_zhudanchen`, `npc_zhujue`, `npc_zhuziliu`, `npc_zuozimu`

#### 武学与数值（F2c，1）

`sk_feishi`

#### 剧情与书界 01–07（F2d1，5）

`q_02_main_07`, `q_03_side_91`, `q_04_bond_97`, `q_04_main_96`, `q_05_side_sanshi`

#### 剧情与书界 08–14（F2d2，3）

`q_08_shenlong_91`, `q_08_side_91_done`, `q_08_side_92_done`

#### 技术（F2t，1）

`vid_sleep_14_15`

### 7.4 疑似仍为误报、但未放行

- ⚠️ 39 个 `it_xinwu_*`：它们在 `design/20` 的传承卡中显然有对象语义，但 Canon §18 的物品唯一归属是 `design/10`；在归属冲突明确前继续报错。
- ⚠️ 4 个短 `mer_*`：`design/15` 本地迁移说明已经给出替代名，但中央 `rulings-v1.md` §2 尚无规则；继续报错能推动所有图鉴引用迁移。
- ⚠️ 5 个旧 `aoe_*`：多处仍使用、但 `design/09` 当前正式六角范围目录未定义这些名；不能凭频次将其合法化。
- ⚠️ `echo_12_fate`、`bs_ch06_intro`、`city_hunyuan`、`poi_dali_wuliang_yubi_01`、`sk_feishi`、`eq_kongqueling`、`gauge_fengsuo`：均可能是遗漏登记或旧名；无足够权威证据自动豁免。
- ⚠️ 8 个 `q_*`：其中 `q_08_side_91_done` / `q_08_side_92_done` 高度像状态键，其他可能是旧索引或缺任务；仍交剧情组逐条核对。
- ⚠️ 25 个 `bsc_*` 与 4 个 `cmb_*`：章节有实例语义，但 Canon §18 把 Boss / 合击目录归 `design/09`；因此不把章节表直接当定义。
- ⚠️ `vid_sleep_14_15`：符合字符格式却不符合本作 01–14 相邻书界范围；保留为未定义而不是参数化放行。

### 7.5 验收逐项结果

- ✅ 已读 Canon §12、§18、作者需求及相关实际定义形态；定义只在 owner 中生效。
- ✅ 已扫描 4 个明确地图 YAML 数据源；引用字段不会冒充定义。
- ✅ 表格、标题、YAML / JSON `id:`、映射键与紧凑 owner 卡片均有测试；非 owner 反例有测试。
- ✅ chapters / story 本地实例及文件号隔离有测试；数字生产主线与语义主线分别处理。
- ✅ `quest.v1` 局部键按块处理；跨块 / 跨文档引用仍报；`tr_*` 未被全局忽略。
- ✅ 明确 example 与 fixture 规则为窄豁免；真实 `_a` 后缀仍报。
- ✅ baseline 过滤与完整刷新 / 局部拒绝均有测试；最终 161 条 baseline 已刷新。
- ✅ `python3 -m unittest tools/lint/test_check_ids.py`：32 / 32 通过。
- ✅ `python3 tools/lint/check_ids.py --json`：161 / 504；0 定义冲突、0 deprecated；`design/07` 缺失，套装不对称类别按既有规则跳过。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；baseline 外新增问题 0。
- ✅ `python3 -m py_compile tools/lint/check_ids.py tools/lint/test_check_ids.py` 与 `git diff --check -- tools/lint` 通过。
- ⚠️ 单测覆盖率按技能规则跳过：无 CI 覆盖率阈值、非 flux 来源；本机 `python3 -m coverage` 亦提示 `No module named coverage`，未擅自安装依赖。
- ✅ 未修改允许范围外文件；未执行改变仓库状态的 git 命令。

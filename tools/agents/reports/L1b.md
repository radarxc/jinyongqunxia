# L1b 报告 · 修复 check_ids.py 在当前仓库的崩溃并重跑

## 1. 摘要（3–6 行）

已修复 `near_match_issues()` 在候选 ID 只有定义、没有活动出现时访问位置表导致的 `KeyError`，未修改 `docs/`。
位置解析现按“首次活动出现 → 首次定义 → `?:0:0` 哨兵”回退，保留原有活动位置优先级。
新增 1 个端到端临时仓库回归用例；用户指定的 `unittest` 命令 13/13 通过。
当前仓库的人读模式和 `--json` 均退出 0；五类最新计数为 105 / 0 / 30 / 1 / 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `tools/lint/check_ids.py` | 1,668 | 为近似 ID 的位置索引补定义位置与未知位置两级回退 |
| `tools/lint/test_check_ids.py` | 423 | 新增定义-only 表格 ID 的端到端回归用例，覆盖第 1、3 类与完整报告构建 |
| `tools/lint/README.md` | 141 | 在“已知局限”登记近似 ID 的位置选择与 `?:0:0` 回退语义 |
| `tools/agents/reports/L1b.md` | 189 | 本报告：修复、实跑计数、每类前 20 条、文档同步清单与自检 |

## 3. 关键结论与数值

### 3.1 根因与修复

- `near_match_issues()` 的候选集是 `活动 occurrence ID ∪ definition ID`，旧位置表却只由活动 occurrence 填充。
- `docs/design/catalog/npcs-ch06-xiake.md:30` 的 `npc_shijian` 是合法表格定义；同一行含“基础模板”，因此该 occurrence 被降为非活动，但定义仍进入候选集。它与未定义的 `npc_meijian` 形成近似对时，旧代码访问 `first["npc_shijian"]`，稳定抛出 `KeyError`。
- 修复后先记录活动 occurrence 的首次位置，再用 `setdefault` 补定义位置；构造问题记录时统一使用 `.get(id, Location("?", 0, 0))`。因此既不覆盖更有诊断价值的活动位置，也不会因未来新增位置来源再次缺键。
- 同类审计覆盖五个检查类：第 1 类的位置来自已筛选的 `first_reference`；第 2 类来自正在遍历的定义；第 4 类现场构造位置；第 5 类已有 `tags.get(member, (set(), None))`。除第 3 类外未发现“候选集合宽于位置表却直接下标”的同型假设。

### 3.2 测试与当前仓库实跑

| 项目 | 命令 / 结果 |
|---|---|
| 缺陷复现 | 新回归用例在修复前退出 1，稳定复现 `KeyError: 'npc_shijian'` |
| 单元测试 | `python3 -m unittest tools/lint/test_check_ids.py`：退出 0，13/13 通过 |
| 人读模式 | `python3 tools/lint/check_ids.py`：退出 0，且有完整输出 |
| JSON 模式 | `python3 tools/lint/check_ids.py --json`：退出 0；`jq empty` 退出 0 |
| 扫描规模 | 52 个 Markdown 文件；20,896 次 ID 出现；6,328 个定义 |
| 前缀来源 | `docs/00-canon.md#12`，未使用内置 fallback |
| warnings | 0 |
| strict 失败记录 | 106 = 第 1 类 105 + 第 4 类 1；本任务要求的默认模式仍退出 0 |

### 3.3 五类问题计数

| 类别 | 最新计数 | 说明 |
|---|---:|---|
| 1. 引用但未定义 | 105 | 唯一 ID 数；需 F2 按归属核对定义、旧引用或示例误识别 |
| 2. 冲突的重复定义 | 0 | 无示例 |
| 3. 疑似近似 ID | 30 | 启发式候选；每对恰有一侧已定义，不等于 30 个确定错误 |
| 4. 旧 ID 使用 | 1 | `bs_hongantong_shenlongdao` 应迁为 `bsc_hongantong_shenlongdao` |
| 5. 套装 / `setTags` 不对称 | 0 | `design/07` 不存在，本类状态为 skipped，不能解读为已证明无不对称 |

### 3.4 第 1 类前 20 条：引用但未定义（105）

以下顺序、位置和引用次数均来自本次 `--json` 输出。

| # | ID | 首个位置 | 引用次数 |
|---:|---|---|---:|
| 1 | `aoe_disk` | `docs/design/09-combat-system.md:1026:11` | 15 |
| 2 | `aoe_hex_area` | `docs/design/catalog/skills-daojia.md:328:60` | 3 |
| 3 | `aoe_hex_zone` | `docs/design/catalog/skills-daojia.md:702:64` | 3 |
| 4 | `aoe_sequence` | `docs/design/09-combat-system.md:1124:65` | 3 |
| 5 | `aoe_spokes` | `docs/design/09-combat-system.md:1029:13` | 5 |
| 6 | `bf_fin_zhinian` | `docs/decisions/rulings-v1.md:534:4` | 5 |
| 7 | `bf_hunmi` | `docs/design/09-combat-system.md:1527:5` | 2 |
| 8 | `bf_juanshi_ruo` | `docs/decisions/rulings-v1.md:533:4` | 5 |
| 9 | `bf_luoshui` | `docs/decisions/rulings-v1.md:517:4` | 11 |
| 10 | `bf_minjie` | `docs/design/09-combat-system.md:552:21` | 4 |
| 11 | `bf_muguangruju` | `docs/design/09-combat-system.md:833:61` | 1 |
| 12 | `bf_sanxiao` | `docs/decisions/rulings-v1.md:516:4` | 5 |
| 13 | `bf_shangshi` | `docs/decisions/rulings-v1.md:520:4` | 8 |
| 14 | `bf_shishen` | `docs/decisions/rulings-v1.md:518:4` | 8 |
| 15 | `bf_tsp_aibing` | `docs/decisions/rulings-v1.md:522:4` | 5 |
| 16 | `bf_tsp_bupi` | `docs/decisions/rulings-v1.md:529:4` | 5 |
| 17 | `bf_tsp_chou` | `docs/decisions/rulings-v1.md:526:4` | 4 |
| 18 | `bf_tsp_pi` | `docs/decisions/rulings-v1.md:528:4` | 5 |
| 19 | `bf_tsp_qingshang` | `docs/decisions/rulings-v1.md:524:4` | 5 |
| 20 | `bf_tsp_qiyi` | `docs/decisions/rulings-v1.md:523:4` | 5 |

### 3.5 第 2 类前 20 条：冲突的重复定义（0）

无示例。

### 3.6 第 3 类前 20 条：疑似近似 ID（30）

“定 / 未”表示该侧是否存在正式定义。

| # | ID 对 | 距离 | 位置（左 / 右） | 状态（左 / 右） |
|---:|---|---:|---|---|
| 1 | `aoe_dash` / `aoe_disk` | 2 | `design/05:679` / `design/09:1026` | 定 / 未 |
| 2 | `bf_hanqi` / `bf_hunmi` | 2 | `rulings-v1:563` / `design/09:1527` | 定 / 未 |
| 3 | `bf_huinei` / `bf_hunmi` | 2 | `design/06:1219` / `design/09:1527` | 定 / 未 |
| 4 | `npc_aman` / `npc_asan` | 1 | `npcs-ch10-baima:10` / `skills-shaolin:523` | 定 / 未 |
| 5 | `npc_asan` / `npc_lisan` | 2 | `skills-shaolin:523` / `npcs-ch10-baima:15` | 未 / 定 |
| 6 | `npc_benyin` / `npc_wenyi` | 2 | `skills-wujue:992` / `npcs-ch07-bixue:11` | 未 / 定 |
| 7 | `npc_fangsheng` / `npc_fangzheng` | 1 | `skills-shaolin:542` / `design/05:1857` | 未 / 定 |
| 8 | `npc_guisong` / `npc_huicong` | 2 | `npcs-ch08-luding:31` / `skills-shaolin:350` | 定 / 未 |
| 9 | `npc_huicong` / `npc_zhucong` | 2 | `skills-shaolin:350` / `npcs-ch02-shediao:19` | 未 / 定 |
| 10 | `npc_jianning` / `npc_lianxing` | 2 | `npcs-ch08-luding:16` / `skills-gulong:190` | 定 / 未 |
| 11 | `npc_liuzhengfeng` / `npc_luchengfeng` | 2 | `npcs-ch05-xiaoao:24` / `skills-wujue:639` | 定 / 未 |
| 12 | `npc_meijian` / `npc_shijian` | 2 | `skills-xiaoyao:458` / `npcs-ch06-xiake:30` | 未 / 定 |
| 13 | `npc_miaodi` / `npc_qiaozi` | 2 | `npcs-ch06-xiake:32` / `skills-wujue:1152` | 定 / 未 |
| 14 | `npc_moda` / `npc_moxia` | 2 | `npcs-ch05-xiaoao:23` / `design/09:1326` | 定 / 未 |
| 15 | `npc_qianlong` / `npc_tianhong` | 2 | `npcs-ch12-shujian:11` / `skills-shaolin:542` | 定 / 未 |
| 16 | `npc_sangjie` / `npc_sangsi` | 2 | `skills-xiaoyao:910` / `npcs-ch10-baima:21` | 未 / 定 |
| 17 | `npc_shilang` / `npc_shuling` | 2 | `npcs-ch08-luding:33` / `design/01:317` | 定 / 未 |
| 18 | `npc_shiqing` / `npc_shuling` | 2 | `npcs-ch06-xiake:10` / `design/01:317` | 定 / 未 |
| 19 | `npc_tianhong` / `npc_xutianhong` | 2 | `skills-shaolin:542` / `npcs-ch12-shujian:17` | 未 / 定 |
| 20 | `npc_zhouboting` / `npc_zhoubotong` | 1 | `skills-daojia:698` / `npcs-ch02-shediao:14` | 未 / 定 |

### 3.7 第 4 类前 20 条：旧 ID 使用（1）

| # | 旧 ID | 替代 ID | 位置 |
|---:|---|---|---|
| 1 | `bs_hongantong_shenlongdao` | `bsc_hongantong_shenlongdao` | `docs/tech/04-data-pipeline.md:298:11` |

### 3.8 第 5 类前 20 条：套装 / `setTags` 不对称（0）

无示例。检查状态为 `skipped: docs/design/07-set-system.md does not exist`。

## 4. 开放问题（附默认值）

1. **30 组近似 ID 如何处置**：默认全部交 F2 逐组人工判断，不自动改名，也不在本任务加入白名单；只有确认是合法近名后才考虑降噪。
2. **105 个未定义 ID 中示例 / 占位的处理**：默认先按唯一归属核对。应成为内容对象的补正式定义；本来只是示例的改为脚本可识别的模板或明确标注，而不是扩大忽略规则。
3. **套装检查何时形成实仓结论**：默认在 `docs/design/07-set-system.md` 建立后重跑；本次的 0 只代表未执行实质比较。
4. **未知位置哨兵是否需要改变 JSON schema**：默认不改变；仍输出既有 `file` / `line` / `column` 字段，仅值为 `?` / `0` / `0`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务只修工具健壮性并记录现有文档问题，不需要修改 Canon。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

以下均为脚本线索，未在本任务中改动。第 1、4 类应由 F2 逐项处理；第 3 类是启发式候选，不能机械合并。

### 6.1 引用但未定义：按首个活动引用文档分组（105）

| 文档 / 位置 | 数量 | ID | F2 处理建议 |
|---|---:|---|---|
| `docs/decisions/rulings-v1.md:516–584` | 20 | `bf_fin_zhinian`、`bf_juanshi_ruo`、`bf_luoshui`、`bf_sanxiao`、`bf_shangshi`、`bf_shishen`、`bf_tsp_aibing`、`bf_tsp_bupi`、`bf_tsp_chou`、`bf_tsp_pi`、`bf_tsp_qingshang`、`bf_tsp_qiyi`、`bf_tsp_sheshen_aura`、`bf_tsp_shixin`、`bf_tsp_weiguang`、`bf_tsp_xiangxu`、`bf_tsp_xianying`、`bf_tsp_xianying_fin`、`bf_xianluo`、`exg_tsp_choice` | 不改裁定文档；在唯一归属 `design/06` 建正式定义 |
| `docs/design/01-vision-and-core-loop.md:223,317,899` | 3 | `npc_shoujuanren`、`npc_shuling`、`npc_zhujue` | 与 `design/18` / NPC 图鉴统一；补定义或改为现有 NPC ID |
| `docs/design/05-martial-arts-system.md:356,1854,1991,2050,2128–2129,2176` | 7 | `npc_generic_jiaotou`、`npc_kongxing`、`npc_quanzhen_sandai`、`npc_shaolin_banruotang`、`npc_shaolin_fangzhang`、`npc_shaolin_luohantang`、`npc_shaolin_wuseng` | 与 `design/18` / NPC 图鉴统一；模板若不建静态 ID，应明确标注或改用既定模板方案 |
| `docs/design/09-combat-system.md:552,833,1026,1029,1124,1326,1527,1997,2042` | 9 | `aoe_disk`、`aoe_sequence`、`aoe_spokes`、`bf_hunmi`、`bf_minjie`、`bf_muguangruju`、`bsc_dongfangbubai_heimuya`、`bsc_xiaofeng_juxianzhuang`、`npc_moxia` | `aoe_*` 对齐 `design/05`，`bf_*` 对齐 `design/06`，`bsc_*` 在 09 建定义，NPC 对齐 18 |
| `docs/design/13-progression-and-endings.md:1097` | 1 | `it_shuyedan` | 在唯一归属 `design/10` 建 ItemDef，或改为已有物品 |
| `docs/design/catalog/skills-daojia.md:269,328,698,702,1093,1334,1579` | 7 | `aoe_hex_area`、`aoe_hex_zone`、`npc_baiyunguan_daozhang`、`npc_fanyiweng`、`npc_wudang_youfang`、`npc_yulianzhou`、`npc_zhouboting` | 范围 ID 对齐 `design/05`；NPC 对齐 18 / NPC 图鉴 |
| `docs/design/catalog/skills-general.md:767` | 1 | `sk_feishi` | 在本图鉴形成正式 SkillDef，或改为既有武学 ID |
| `docs/design/catalog/skills-gulong.md:190,1306` | 3 | `eq_kongqueling`、`npc_lianxing`、`npc_yaoyue` | 装备对齐 `design/10`；NPC 对齐 18 / NPC 图鉴 |
| `docs/design/catalog/skills-shaolin.md:55,267,295,350,425,485,523,542,630` | 11 | `npc_asan`、`npc_fangsheng`、`npc_huicong`、`npc_kongzhi`、`npc_nanshaolin_luohantang`、`npc_shaolin_damoyuan`、`npc_shaolin_jielvyuan`、`npc_shaolin_shibaluohan`、`npc_tianhong`、`sk_a`、`sk_b` | NPC 对齐 18 / NPC 图鉴；`sk_a` / `sk_b` 若为公式符号，应改成不会被当作活动 ID 的明确模板 |
| `docs/design/catalog/skills-wujue.md:219–2022` | 22 | `npc_baishijing`、`npc_baituo_shenutou`、`npc_batianshi`、`npc_benyin`、`npc_cien`、`npc_diancangyuyin`、`npc_duanzhengming`、`npc_fengmofeng`、`npc_fusigui`、`npc_gaibang_chuangong`、`npc_gaibang_zhanglao`、`npc_guducheng`、`npc_luchengfeng`、`npc_luguanying`、`npc_ming_jiaotou`、`npc_ouyangke`、`npc_qiaozi`、`npc_wuchangfeng`、`npc_xiaoxiangzi`、`npc_yangmiaozhen`、`npc_zhudanchen`、`npc_zhuziliu` | 与 `design/18` / NPC 图鉴逐一统一；不可只凭拼音近似改名 |
| `docs/design/catalog/skills-xiaoyao.md:458–1434` | 20 | `npc_baobutong`、`npc_dengbaichuan`、`npc_fengboe`、`npc_fuminyi`、`npc_heliantieshu`、`npc_juxian_zhuangding`、`npc_liao_jiaotou`、`npc_liao_lieren`、`npc_liao_wushi`、`npc_meijian`、`npc_mizong_lama`、`npc_sangjie`、`npc_sikongxuan`、`npc_wuliang_dizi`、`npc_xiaoyuanshan`、`npc_xinshuangqing`、`npc_xixia_jiaotou`、`npc_xixia_wushi`、`npc_zhaixingzi`、`npc_zuozimu` | 与 `design/18` / NPC 图鉴逐一统一；设施 / 职业模板按 N1 的静态 ID 边界处理 |
| `docs/tech/04-data-pipeline.md:298` | 1 | `bs_hongantong_shenlongdao` | 按 `rulings-v1` §2 改为 `bsc_hongantong_shenlongdao`；该条同时属于第 4 类 |

核算：`20+3+7+9+1+7+1+3+11+22+20+1 = 105`。

### 6.2 疑似近似 ID：按未定义侧所在文档分组（30）

| 未定义侧文档 | 数量 | 候选对（未定义侧以 `*` 标记） | F2 处理建议 |
|---|---:|---|---|
| `docs/design/09-combat-system.md` | 4 | `aoe_dash` / `aoe_disk*`；`bf_hanqi` / `bf_hunmi*`；`bf_huinei` / `bf_hunmi*`；`npc_moda` / `npc_moxia*` | 核对是否误拼、缺定义或合法近名；`bf_hunmi` 同时命中两对只算一个未定义 ID |
| `docs/design/01-vision-and-core-loop.md` | 2 | `npc_shilang` / `npc_shuling*`；`npc_shiqing` / `npc_shuling*` | 核对书灵 ID 是否应在 NPC 归属中正式定义；不要因字面接近石清 / 施琅而合并 |
| `docs/design/17-sects-compendium.md` | 10 | `sk_emeijiufa*` / `sk_emeixinfa`；`sk_jindunxinfa` / `sk_jinwuxinfa*`；`sk_jinlongbangfa*` / `sk_jinlongbianfa`；`sk_pingfengjian` / `sk_songfengjian*`；`sk_qingchengjian*` / `sk_qingfengjian`；`sk_qingfengjian` / `sk_songfengjian*`；`sk_wanjiajian` / `sk_wenjiajian*`；`sk_wanjiaquan` / `sk_wenjiaquan*`；`sk_wuhuduandandao` / `sk_wuhuduanmendao*`；`sk_xuansujian*` / `sk_xuansuquan` | 与权威武学图鉴逐项核对；保留确属不同门派 / 招式的合法近名 |
| `docs/design/catalog/skills-daojia.md` | 1 | `npc_zhouboting*` / `npc_zhoubotong` | 高优先核对拼音；疑似“周伯通”误拼 |
| `docs/design/catalog/skills-gulong.md` | 1 | `npc_jianning` / `npc_lianxing*` | 人物显然可能不同；补定义前仍需核对 ID 与人物名 |
| `docs/design/catalog/skills-shaolin.md` | 7 | `npc_aman` / `npc_asan*`；`npc_asan*` / `npc_lisan`；`npc_fangsheng*` / `npc_fangzheng`；`npc_guisong` / `npc_huicong*`；`npc_huicong*` / `npc_zhucong`；`npc_qianlong` / `npc_tianhong*`；`npc_tianhong*` / `npc_xutianhong` | 先按人物名和 NPC 图鉴判断；不得仅按编辑距离合并 |
| `docs/design/catalog/skills-wujue.md` | 3 | `npc_benyin*` / `npc_wenyi`；`npc_liuzhengfeng` / `npc_luchengfeng*`；`npc_miaodi` / `npc_qiaozi*` | 先补 / 对齐定义，再判断是否需要白名单 |
| `docs/design/catalog/skills-xiaoyao.md` | 2 | `npc_meijian*` / `npc_shijian`；`npc_sangjie*` / `npc_sangsi` | 两组均可能是不同人物；按小说人物与 N1 图鉴核对 |

核算：`4+2+10+1+1+7+3+2 = 30`。其中触发本次旧崩溃的 `npc_meijian` / `npc_shijian` 现在正确输出，后者位置为 `docs/design/catalog/npcs-ch06-xiake.md:30:4`。

### 6.3 旧 ID、重复定义与套装

| 文档 / 位置 | 类别 | 应同步内容 |
|---|---|---|
| `docs/tech/04-data-pipeline.md:298:11` | 旧 ID | `bs_hongantong_shenlongdao` → `bsc_hongantong_shenlongdao` |
| — | 冲突重复定义 | 本次为 0，无需同步 |
| `docs/design/07-set-system.md`（未来） | 套装对称性 | 文件尚不存在；建立后重跑，届时再处理 `members` / `setTags` 双向问题 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ **写入范围**：仅修改 `tools/lint/**` 并新增本报告；`docs/`、`TODO.md` 均未改。
- ✅ **崩溃修复**：定义-only ID 可回退到定义位置；所有位置取值另有 `?:0:0` 通用兜底。
- ✅ **同类审计**：检查第 1–5 类的位置来源与取值，未发现其他同型直接缺键路径。
- ✅ **回归单测**：真实表格定义行含“基础模板”、无活动引用，覆盖近似 ID 输出与未定义检查；修复前稳定失败，修复后通过。
- ✅ **全部测试**：`python3 -m unittest tools/lint/test_check_ids.py` 退出 0，13/13 通过。
- ✅ **当前仓库默认模式**：`python3 tools/lint/check_ids.py` 退出 0 且有输出。
- ✅ **当前仓库 JSON 模式**：`python3 tools/lint/check_ids.py --json` 退出 0，且输出可由 `jq` 解析。
- ✅ **最新计数与示例**：报告记录五类计数 105 / 0 / 30 / 1 / 0，并为每类列出前 20 条或全部可用示例。
- ✅ **文档问题隔离**：未修 docs；第 6 节按文档分组登记 105 个未定义 ID、30 组近似候选、1 处旧 ID 和套装检查跳过状态，交 F2。
- ✅ **README**：已更新定义-only 位置回退与未知位置哨兵说明。
- ⚠️ **套装实仓检查**：`docs/design/07-set-system.md` 不存在，因此第 5 类计数 0 是 skipped 状态，不是完整性结论。
- ⚠️ **覆盖率门禁**：仓库和用户均未声明覆盖率阈值，且执行来源为空；按 `bits-unit-test-gen` 规则 `CHECK_COV_MODE=skip`，不影响本任务验收。

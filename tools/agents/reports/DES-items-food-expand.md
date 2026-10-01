# DES-items-food-expand 报告 · 设计补充 · 食材 / 食品名录扩张（AR-23：常见 / 稀缺肉类、菜蔬、各书菜肴 + 史实，≥130 行）

## 1. 摘要（3–6 行）

- `items-food.md` 由 28 行扩至 174 行机器条目，新增 146 个唯一 `it_*`，未改动原 28 行。
- 新增食材 77、食品 69；覆盖常见肉、珍材、水产、菜蔬、谷果调料、干点腌藏、原著饮食与 12 道史实名菜。
- 本轮补入天龙大理清茗茶点与鹿鼎扬州汤包长鱼面，并以 **（待考）** 限定未逐字核定的茶种、点心品种及实食语境。
- 本轮审核返修明确 `it_guokui` 的西夏商旅投放，并新增 `it_honghuahui_zongduo_yanxi` 补齐《书剑》红花会宴饮；具体菜点保留 **（待考）**；未新增酒或 Buff。
- 美洲作物统一为仅碧血及以后投放；补齐茶、酒风尚和下游 ENG 字段清单。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/items-food.md` | 254 | 174 行七列名录；史实与出处依据；术语、校验、待决事项 |
| `docs/design/10-items-and-equipment.md` | 2561 | v1.6；§9.3 原著场景菜肴 37 道、史实名菜 12 道；§14.2 AR-23 ID 登记 |
| `tools/agents/reports/DES-items-food-expand.md` | 97 | 数量、覆盖、史实约束与自检 |

## 3. 关键结论与数值

- 总名录 174 行，处于 130–180；新增 146 = 食材 77 + 食品 69。
- 新增品阶为黄 53、玄 57、地 34、天 2，占新增 36.3% / 39.0% / 23.3% / 1.4%；全表为黄 60、玄 63、地 44、天 7，占 34.5% / 36.2% / 25.3% / 4.0%。
- 食品按 `staPct=10%×G(grade)` 逐 grade 复算：grade 1–10 为 10%／11%／12%／14%／15.5%／17%／20%／22%／24%／28%；本轮纠正 50 行旧整阶代表值。
- 新增干粮 + 点心 + 腌藏 27 行；新增菜肴 + 汤羹 + 名菜 42 行；全表对应两组合计 34 / 51 行；史实名菜 12 行。
- 新增 `meal=` 全部引用 `design/06` 既有 `bf_*`；名菜均有 `party=4`；新增天级均有 `uniqueBatch=true`。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 酒类是否纳入本表 | 否；酒继续按 `design/10` §9.3 独立计 `bf_zuiyi` |
| 7 个天级是否保留 | 保留：既有 `it_tianshanlingmi` `it_baihualinglu` `it_xueyulengchan` `it_tianxiangyulu` `it_tianxiangyuyan`，新增 `it_yanwo` `it_yanwojisitang`；只走天材／固定剧情 |
| 待考条目能否直接当原著菜名 | 否；默认仅当场景化原创菜式，逐字核对后才能移除 **（待考）** |
| 河豚等高风险食材是否给现实处理步骤 | 否；只作名厨剧情物，不提供现实加工方法 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。AR-23 只扩张 `design/10` 已有目录与投影，不改变基准品阶、膳食、烹饪或书眠规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 同步内容 |
|---|---|---|
| `design/16` | 食材资源与产地映射 | 为 77 个新增食材按时代／地域绑定 `resourceRef`，落实燕窝鱼翅及美洲作物禁投期 |
| `design/chapters/00–14` | 酒楼、宴饮、补给节点 | 只消费 §9.3 正式 ID；待考菜名不得写成原著明文 |
| `design/12` / 生产数据 | 菜谱与烹饪 | 为可制作条目配置 `rc_*`、输入与场所上限；本任务未新建菜谱 ID |
| `assets/default` 出图任务 | 食品批量生成 | 按 174 行逐项出图；原料与熟食不混画，读取外观列 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 新增数量分布（子类 × 品阶）

| 子类 | 黄 | 玄 | 地 | 天 | 新增 |
|---|---:|---:|---:|---:|---:|
| 食材·肉 / 珍材 / 水产 | 8 / 0 / 4 | 6 / 0 / 4 | 0 / 13 / 1 | 0 / 1 / 0 | 14 / 14 / 9 |
| 食材·菜蔬 / 谷物 / 果 / 调料 | 13 / 7 / 4 / 4 | 3 / 0 / 4 / 4 | 0 / 0 / 0 / 1 | 0 / 0 / 0 / 0 | 16 / 7 / 8 / 9 |
| 食品·干粮 / 点心 / 腌藏 | 6 / 0 / 2 | 4 / 6 / 8 | 0 / 1 / 0 | 0 / 0 / 0 | 10 / 7 / 10 |
| 食品·汤羹 / 菜肴 / 名菜 | 1 / 2 / 2 | 4 / 8 / 6 | 1 / 2 / 15 | 0 / 0 / 1 | 6 / 12 / 24 |
| **合计** | **53** | **57** | **34** | **2** | **146** |

原有条目使全表谷物 9、水产 10、果 9、干粮 11、点心 11、腌藏 12、汤羹 9、菜肴 14、名菜 28；干粮 + 点心 + 腌藏 = 34，菜肴 + 汤羹 + 名菜 = 51，全部达到组合下限。

### 各书菜肴清单

| 书 | ID |
|---|---|
| 越女 / 天龙 | `it_huayuan_gaobing` `it_aqing_qingcha` / `it_muwu_gancaifan` `it_liaoying_yangrou` `it_dali_qingming_chadian` `it_songhelou_xiaren` `it_shaolin_sumian` |
| 射雕 / 神雕 | `it_jiaohuaji` `it_haoqiutang` `it_yudishuijiatingluomei` `it_ershisiqiaomingyueye` `it_tangshuangtaotiao` / `it_qingshui_yufeng_mijiang` `it_qingcai_doufu_xiaoyufan` |
| 倚天 / 笑傲 | `it_hanshui_siwan_fancai` `it_binghuodao_kaoxiongrou` `it_guangmingding_suxian_yuanbing` / `it_fuzhou_yeji_huangtu` `it_huiyanlou_huncai` `it_hengshan_suxianzong` `it_hengshan_qingcaidoufu` |
| 侠客 / 碧血 | `it_labazhou` `it_xiakedao_siyang_dianxin` `it_houjianji_shaobing` / `it_huashan_qingcai_doufufan` `it_wenjia_huotui_larouyan` |
| 鹿鼎 / 连城 | `it_zhayangwei` `it_milian_huotui` `it_yangzhou_tangbao_changyumian` / `it_pomiao_shutang` `it_yuzhou_fanshu_caomifan` |
| 白马 / 鸳鸯 | `it_naiyou_recha` `it_yangrulao` / `it_xiaofu_shoujiuxi` `it_huodui_kaozhangji` |
| 书剑 / 飞狐 / 雪山 | `it_huibu_zhuafan_kaorou` `it_xuedi_kaohuangyang` `it_honghuahui_zongduo_yanxi` / `it_chenglingsu_sancai_yitang` `it_miaojia_huofan_sancai` / `it_humiao_mantou_jiyangtui` `it_dianchi_shurou_shaoji` |

### 史实约束与确认项

- ✅ 宋代羊贵猪贱：羊为北宋高频宴馔，猪仍保留民间常见；牛肉因耕牛保护升为玄阶稀供。
- ✅ 美洲作物：`it_yumi`、`it_lajiao`、`it_fanshu` 统一仅碧血及以后书界投放；明确排除笑傲、侠客及更早书界；马铃薯、花生、南瓜未入表。
- ✅ 明清海味：`it_yanwo`、`it_yuchi` 禁入北宋至元末；`it_yanwojisitang` 仅乾隆书界固定宴席。
- ✅ 地域：辽／蒙古重羊马乳食；回疆、藏地、西夏、江南、闽粤、京师均有对应食品；`it_guokui` 明确绑定西夏商旅节点。
- ✅ 史料：具体落实蟹酿橙、山海兜、山药粥、荷莲兜子、团鱼汤、山家三脆、炉焙鸡、王太守八宝豆腐、蒋侍郎豆腐、东坡肉、烧小猪、燕窝鸡丝汤 12 项；至少 10 项有具体史籍菜名或做法依据。
- ⚠️ 机器表实有 23 行含 **（待考）**：`it_xingchun` `it_baotai` `it_xueha` `it_xiongbai` `it_hanshui_qingyu` `it_taihu_yinyu` `it_nangbing` `it_songhelou_xiaren` `it_guokui` `it_dingshenggao` `it_jinyinmantou` `it_sunzha` `it_huayuan_gaobing` `it_aqing_qingcha` `it_liaoying_yangrou` `it_dali_qingming_chadian` `it_hengshan_suxianzong` `it_yangzhou_tangbao_changyumian` `it_xiaofu_shoujiuxi` `it_huodui_kaozhangji` `it_honghuahui_zongduo_yanxi` `it_dongporou` `it_jiangshilang_doufu`。

### 需作者确认（附默认）

- 酒类是否入表：默认否，继续由 `design/10` §9.3 以 `bf_zuiyi` 独立计。
- 天级 7 项：默认保留 `it_tianshanlingmi` `it_baihualinglu` `it_xueyulengchan` `it_tianxiangyulu` `it_tianxiangyuyan` `it_yanwo` `it_yanwojisitang`，只走天材或固定剧情批次。
- 上述 23 个待考 ID：默认不把未逐字核准的具体品种、配料、菜名或实食语境宣称为原著定本；红花会项只确认宴饮场景，具体菜点待逐字核准。

### ENG 下游字段清单

- 必接：`id/sub/grade`；食材 `ingredientKind/materialGrade`；食品 `staPct/meal`；名菜 `party`；天级 `uniqueBatch`。
- 投放：时代／地域白名单与 `resourceRef`；素材：名称、子类、品阶、外观要点及原料／熟食边界。
- ✅ 下游字段：已列 `id/sub/grade/ingredientKind/materialGrade/staPct/meal/party/uniqueBatch`、时代地域约束、`resourceRef` 和外观生成字段。
- ✅ `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-food.md --min 130`：174 行通过。
- ✅ `python3 tools/lint/check_ids.py --strict`：通过；仅报告仓库基线既有 `sk_babuganchan` 引用，新增严格失败数 0。
- ✅ `git diff --check`：通过；仅修改两个授权文档并新增本报告。

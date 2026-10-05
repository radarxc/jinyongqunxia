# CITY-layouts-ch02-a 报告 · 城图全量 · ch02《射雕英雄传》都城 / 大城逐城考据＋同带副本 第 1 批：29 城 × 年代（capital 6、major 23）+ 28 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

交付29个`southern_song_jin_mongol` study单元、57章规格与布局：20单元完整候选、9单元部分候选、0跳过。
29城均完成联网考据、复原依据、北向平面SVG/PNG、ch02 JPEG预览与manifest；28城另交ch03同带副本，榆林按清单无副本。
6个capital、23个major；北京按`fullsize=yes`另交10240×5120 `town.png`与`overlay.svg`。
全部使用`liao_jin_north`，实际751条素材回退/适配逐manifest结构化登记；未改工具、素材、名录、基准、共享进度或expect。

## 2. 产出（文件、行数、主要章节）

| 路径范围 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `docs/design/town/city_<id>__ch02/ch03.yaml` | 57份，共3295行 | 年代、史料键、几何、配额、运行时分带；保定等按史实作章节差量 |
| `docs/design/town/history/city_<id>__southern_song_jin_mongol.md` | 29份，共3035行，均60–140行 | 来源阅读/看图边界、复原取舍、缩比、推定及依赖 |
| 同目录`_plan.svg` / `_plan.png` | 各29份；SVG共24136行 | 北向墙门、道路、水系、分区与生成建筑占地 |
| `assets/default/town/city_<id>__ch02/` | 29目录 | layout、JPEG、manifest；仅北京另含全尺寸与overlay |
| `assets/default/town/city_<id>__ch03/` | 28目录 | 每目录仅`layout.yaml`，不渲染、不写manifest |
| 本批progress / done / 报告 | 58行 / 29行 / ≤120行 | 57章状态、路径、开放问题与验收记录 |

报告前共263个交付文件，含57份layout（4350497行）；加本报告共264个，约95.3 MB。

## 3. 关键结论与数值

表中“整/部”=`complete_candidate`/`partial_candidate`，不是史学或发行批准；来源均为实际打开的外部来源，项目资料另计。可信度为各城综合区间；“图”表示实际目视参考图，但后世图只作分期/排除证据。推定项按墙、门、街、水、桥、区等空间对象计，不含自动建筑。网格均按0.25输出JPEG；套件列为`liao_jin_north`实际回退/适配数；副本均为ch03。

| 城×年代 / 依据 | 状态 | 来源/可信/读法 | 推定项 | 网格 | 套件/回退 | 副本 |
|---|---|---|---:|---:|---:|---:|
| [北京×1217](../../../docs/design/town/history/city_beijing__southern_song_jin_mongol.md) | 整 | 4/A–B+·图 | 13 | 160² | 辽金北/41 | 1 |
| [开封×1217](../../../docs/design/town/history/city_kaifeng__southern_song_jin_mongol.md) | 整 | 3/A–B+·图 | 34 | 160² | 辽金北/37 | 1 |
| [洛阳×1217](../../../docs/design/town/history/city_luoyang__southern_song_jin_mongol.md) | 整 | 3/A–C·文；图下载失败 | 17 | 160² | 辽金北/33 | 1 |
| [大同×1217](../../../docs/design/town/history/city_datong__southern_song_jin_mongol.md) | 整 | 2/B·图（非平面） | 14 | 160² | 辽金北/21 | 1 |
| [银川×1217](../../../docs/design/town/history/city_yinchuan__southern_song_jin_mongol.md) | 整 | 3/B–B+·文 | 14 | 160² | 辽金北/27 | 1 |
| [沈阳×1217](../../../docs/design/town/history/city_shenyang__southern_song_jin_mongol.md) | 整 | 3/A–B·图（后世排除） | 15 | 160² | 辽金北/27 | 1 |
| [天津×1217](../../../docs/design/town/history/city_tianjin__southern_song_jin_mongol.md) | 整 | 2/A–B·图 | 14 | 128² | 辽金北/29 | 1 |
| [保定×1217/1259](../../../docs/design/town/history/city_baoding__southern_song_jin_mongol.md) | 部 | 2/A-·文 | 8/13 | 128² | 辽金北/16 | 1 |
| [真定×1217](../../../docs/design/town/history/city_zhengding__southern_song_jin_mongol.md) | 部 | 2/A–A-·考古图 | 13 | 128² | 辽金北/21 | 1 |
| [沧州×1217](../../../docs/design/town/history/city_cangzhou__southern_song_jin_mongol.md) | 部 | 3/A-–B·文 | 12 | 128² | 辽金北/19 | 1 |
| [张家口×1217](../../../docs/design/town/history/city_zhangjiakou__southern_song_jin_mongol.md) | 部 | 2/A-–B·文 | 8 | 96² | 辽金北/22 | 1 |
| [山海关×1217](../../../docs/design/town/history/city_shanhaiguan__southern_song_jin_mongol.md) | 部 | 2/B+–B·图 | 9 | 128² | 辽金北/26 | 1 |
| [郑州×1217](../../../docs/design/town/history/city_zhengzhou__southern_song_jin_mongol.md) | 整 | 2/A-–B+·图 | 15 | 128² | 辽金北/33 | 1 |
| [登封×1217](../../../docs/design/town/history/city_dengfeng__southern_song_jin_mongol.md) | 整 | 4/A-–B·图（现代层） | 12 | 128² | 辽金北/18 | 1 |
| [安阳×1217](../../../docs/design/town/history/city_anyang__southern_song_jin_mongol.md) | 整 | 3/A-–B+·图 | 14 | 128² | 辽金北/24 | 1 |
| [商丘×1217](../../../docs/design/town/history/city_shangqiu__southern_song_jin_mongol.md) | 整 | 3/A–B·后世图反证 | 13 | 128² | 辽金北/24 | 1 |
| [南阳×1217](../../../docs/design/town/history/city_nanyang__southern_song_jin_mongol.md) | 整 | 4/A–B·图 | 13 | 128² | 辽金北/24 | 1 |
| [信阳×1217](../../../docs/design/town/history/city_xinyang__southern_song_jin_mongol.md) | 部 | 6/A–C·后世图夹限 | 13 | 128² | 辽金北/29 | 1 |
| [西安×1217](../../../docs/design/town/history/city_xian__southern_song_jin_mongol.md) | 整 | 6/A–C·前后图夹限 | 13 | 160² | 辽金北/21 | 1 |
| [华阴×1217](../../../docs/design/town/history/city_huayin__southern_song_jin_mongol.md) | 部 | 2/A-·文 | 12 | 128² | 辽金北/25 | 1 |
| [宝鸡×1217](../../../docs/design/town/history/city_baoji__southern_song_jin_mongol.md) | 部 | 3/A-–B+·文 | 12 | 128² | 辽金北/25 | 1 |
| [延安×1223](../../../docs/design/town/history/city_yanan__southern_song_jin_mongol.md) | 整 | 2/A–B·文 | 12 | 128² | 辽金北/23 | 1 |
| [榆林×1223](../../../docs/design/town/history/city_yulin__southern_song_jin_mongol.md) | 部 | 2/A–B·图 | 10 | 96² | 辽金北/24 | 0 |
| [太原×1217](../../../docs/design/town/history/city_taiyuan__southern_song_jin_mongol.md) | 整 | 4/A–B·图 | 19 | 160² | 辽金北/21 | 1 |
| [运城/解州×1217](../../../docs/design/town/history/city_yuncheng__southern_song_jin_mongol.md) | 整 | 4正文+1待核/A–C·图 | 17 | 160² | 辽金北/33 | 1 |
| [临汾×1217](../../../docs/design/town/history/city_linfen__southern_song_jin_mongol.md) | 整 | 4/A–C·后世图弱回溯 | 19 | 128² | 辽金北/27 | 1 |
| [长治×1217](../../../docs/design/town/history/city_changzhi__southern_song_jin_mongol.md) | 整 | 4/A–C·图 | 20 | 128² | 辽金北/21 | 1 |
| [朔州×1217](../../../docs/design/town/history/city_shuozhou__southern_song_jin_mongol.md) | 整 | 4/A-–C·后世图 | 17 | 128² | 辽金北/27 | 1 |
| [济南×1217](../../../docs/design/town/history/city_jinan__southern_song_jin_mongol.md) | 整 | 5/A-–B·图 | 19 | 160² | 辽金北/33 | 1 |

网格为160²/128²/96²各10/17/2城；预览为2560×1280、2048×1024、1536×768，全部JPEG q85。北京历史线性压缩约1:37.1；其余均明确是非等比拓扑缩景，未把运行时`cell_m=1`冒充史尺。
29城全为study，generic为0，无可报告的generic均值。57份layout可复核生成约242.34秒，均值4.25秒/layout、8.36秒/单元；29张主预览均值约6.15秒，另北京全尺寸10.84秒。约23城只有粗略考据时间窗、6城无独立计时，故不捏造考据均值。跳过清单为空。

## 4. 开放问题（附默认值）

保定、真定、沧州、张家口、山海关、信阳、华阴、宝鸡、榆林保持9项`partial_candidate`：缺同期完整平面、稳定城址或可定位墙门。默认只作为史料约束下的游戏候选，不称实测复原。
`city_baoji`当前坐标是宝鸡县而显示名可能混入凤翔府；`city_linfen` ch03上游仍称平阳府；`city_yulin`只能落为夏州边地节点。默认保留稳定ID和本文显示名，待名录任务裁定。
所有精确门位、岸线、街坊、1217/1259战损与建筑栋数若无同期证据，默认维持（推定）/（原创扩展）；原著地点仍待三联/广州修订版逐字核对。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本批只落实AR-47和`design/22`契约，不改变年代锚点、玩法数值或全局ID归属。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步；本任务未改 |
|---|---|
| `docs/design/town/cities.yaml`、`design/19` | 核定宝鸡/凤翔显示名、临汾ch03平阳路称谓、榆林1223稳定聚落/寨名。 |
| `town/progress.csv` / `done.txt` / `progress.md` | 追踪者并入57章：40行完整、17行部分，对应20整/9部单元。 |
| `tools/town/plan_view.py` | 依据路径仅识别`history/`前缀或`/history/`；建议结构化读取history_path，避免依赖notes措辞。 |
| `tools/town`道路裁切 | 城外道路在墙边裁切，难以可靠表达城外路桥；宜让明确城外段保留到画幅边缘。 |
| 年代素材任务 | 补辽金北向/侧向门、共通路面/岸水/桥、保州废墟破墙、天宁寺五层塔；土路与夯土0.25对比偏弱，山海关海面尚不支持潮汐。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 强制批次检查：`check_city_batch.py ...ch02-a.expect.csv ...ch02-a.csv`返回0：单元29、完成29、跳过0、问题0。
- ✅ 强制ID检查：`check_ids.py --strict`返回0，strict failure count=0；仅报告全仓已有`docs/README.md`的`sk_babuganchan`，本批新增失败0。共享信号量锁位于沙箱只读集成根，包装器无法加锁，故本工作树内直接执行。
- ✅ 29城均完成联网考据、生成、平面与预览目检；汇总复看未见建筑压水/越墙，结构与plan一致；天津275格军寨略高于273.60软目标，已在依据中解释且非阻断。
- ✅ 磁盘规则v2：北京主目录5件；其余28个主目录各3件；28个副本目录各仅1份layout；29张JPEG短边768–1280，非全尺寸目录最大1.68 MB；manifest单条candidate、SHA/尺寸/命令/引用/751条回退完整。
- ✅ 范围与文档：264项交付均在写集；history均60–140行；无未完成占位语；未改expect、共享进度、工具、素材、基准或名录，未执行改变仓库状态的git命令。
- ⚠️ 历史精度：没有把后世图、搜索摘要或素材外观冒充同期实测地籍；9城部分候选及其他推定项见§3–4。
- ⚠️ `pnpm check`曾在本工作树因`node_modules`/workspace依赖缺失导致整仓模块解析失败；未改`node_modules`绕过。任务两条强制校验均已通过，完整门禁交调度器在沙箱外运行。

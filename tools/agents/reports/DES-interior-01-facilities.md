# DES-interior-01-facilities 报告 · 城镇 3D 古建 · 试点城设施绑定补全（每栋可进建筑的设施类与招牌文字键）
## 1. 摘要（3–6 行）
- 三城追加 39 个显式设施绑定：大理 ch01 18、大理 ch10 3、吐鲁番 ch10 18；既有 21 条逐字保留，`dali_yaopu` 仍为 `bi_0023/yaopu_01`。
- 所有非住宅可进建筑与全部摊位已显式绑定；重复 house/courtyard 依 tech/16 §8.1 缺省为 `residence`。
- 追加 34 个招牌文字键（均（原创扩展））；现行严格 schema 无 `sign`，故未向设施条目写未知字段。
- 本轮返修统一口径：任务虽称“16 类”，实际枚举 17 组、15/17 已绑定；镖局、武馆未硬绑，当铺与铁匠标明尺寸降级。
## 2. 产出（文件、行数、主要章节）
- `city_dali__ch01.yaml` 138 行、`city_dali__ch10.yaml` 77 行、`city_turpan__ch10.yaml` 136 行；设施分别 25/10/25 条。
- `town-facilities.yaml` 158 行：新增设施名与 `town.<layoutKey>.<facilityKey>.sign`；本报告 47 行。
- 本轮实跑：install 退出 0（679 ms）；build 1782 对象/15 章/9378.2 ms；validate 1793 文件/1720 对象/4 Ink/65 地图；ID 372 文件/76109 occurrences、新失败 0。
## 3. 关键结论与数值
| 城 | 新增设施 key → 建筑 id | 布局类型 → 设施类 | 依据 |
|---|---|---|---|
| 大理 ch01 | `wangfu_01→0004; simiao_01→0005; fokan_01→0006; yamen_01→0007; shaosuo_01→0008; maju_01→0009` | wangfu→residence；temple/shrine→temple；yamen→office；guardhouse→guardhouse；stable→stable | §8.1 类型缺省；宗教/官署/门服分区 |
| 大理 ch01 | `huotan_01..08→0012..0019` | market_stall→stall_goods | §8.1；既有 0010/0011 为马市/食摊 |
| 大理 ch01 | `dufang_01→0020; jiusi_01→0022; zhuangyuan_01→0033; fokan_02→0034` | casino→casino；restaurant→tavern；manor→residence；shrine→temple | `biz_dali_casino_01` 与类型/分区 |
| 大理 ch10 | `maju_01→0014; cangfang_01→0015; fokan_01→0019` | stable→stable；warehouse→storehouse；shrine→temple | §8.1 与 service/houses 分区 |
| 吐鲁番 ch10 | `shaosuo_01→0001; maju_01→0002; yamen_01→0006` | guardhouse→guardhouse；stable→stable；yamen→office | §8.1 与 gate_service/north_office |
| 吐鲁番 ch10 | `huotan_01..08→0010..0017` | market_stall→stall_goods | §8.1；既有 0008/0009 为马市/食摊 |
| 吐鲁番 ch10 | `shushi/buzhuang/dangpu/qianzhuang_01→0022..0025` | shop→books/cloth/pawnshop/bank | 东南商市四间未绑定商铺；当铺尺寸降级见 §4 |
| 吐鲁番 ch10 | `cangfang_01→0026; fokan_01→0027; simiao_01→0028` | warehouse→storehouse；shrine/temple→temple | §8.1 与 market/temple 分区 |
| 模板绑定覆盖 | 实例 | 模板绑定覆盖 | 实例 |
|---|---|---|---|
| 杂货/药铺/客栈/铁匠 | 三城既有；铁匠仅降级实例 | 布庄/书肆/当铺/钱庄 | 吐鲁番 0023/0022/0024（降级）/0025 |
| 酒肆/住宅/寺庙/公堂 | 大理 ch01 0022；缺省住宅；多寺；两衙门 | 赌坊/厩仓哨/货食摊 | 大理 0020；三城实例；既有+新增摊 |
| 镖局/武馆 | 无合适建筑 | 统计口径 | 枚举 17 组：15/17 有语义绑定，其中 13/17 有完整尺寸实例 |
## 4. 开放问题（附默认值）
- 全部设施名、职能、招牌与四间吐鲁番专门商铺均为（原创扩展）；默认用于试点，不宣称原著或 702/1093 年地籍事实。
- 镖局前厅、武馆：三城布局无 `biaoju` 或 school 合适建筑；默认不覆盖，待布局将来新增后再绑。
- shrine 的净室仅约 3.2×1.2 m（吐鲁番 2.8×1.8 m），小于寺庙 3.0×2.4 m 下限者默认走 i2 降级；不改布局。
- 当铺 `dangpu_01/bi_0024` 净室 `4150×3800 mm`，较 `4400×3100 mm` 最低宽度少 250 mm；保留语义绑定，但走 §8.2 降级，不作为完整尺寸实例。
- 既有铁匠净室 `4100×3400/4150×3800 mm`，较 4400 mm 最低宽度少 300/250 mm；均走 §8.2 降级，不作为完整尺寸实例。
- `shop: null` 的书肆/布庄/质库/柜坊只定室内类、不开放交易；默认后续补货单时再非空。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- P-DES-INT-01：无基准修改；仅建议扩充内容 schema，见 §7，理由是招牌载荷已有规划器契约但内容源无字段。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `packages/data/src/schemas/facility.ts` / `TownFacilitySchema`：由 schema 任务增 `sign` 后，本文 34 键与样式才能进入 `TownBuildingPlan.signage`。
- `docs/tech/15-town-explore-v2-spec.md` §2.5：同步 `sign` 数据形状、样式枚举及设施 sub→`PlanFacilityKind` 映射。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只改 5 个写集文件；三设施 YAML 只追加既有末尾，原 21 条及药铺绑定逐字不动；未改 schema/布局/assets/剧情。
- ✅ YAML/严格 schema 构建校验通过；60 个设施 key/buildingId 城内各自唯一且都在真实布局中。
- ✅ 除允许省略的重复住宅外，§8.1 可进类型逐栋覆盖；所有非店铺新增项 `shop: null`；roles 按站位语义。
- ⚠️ 17 组中 15 组有语义绑定、13 组有完整尺寸实例；镖局/武馆缺建筑，当铺/铁匠仅有降级实例；任务“16 类”标题与枚举不一致。
- ✅ i1/i2 房间实例（规划器净室 mm）：杂货/药 `4400×3100`，布/书 `4150×3800`，当 `4150×3800`（宽少 250，降级），钱 `4800×3150`，客栈 `8650×5800`/`8400×6800`，酒肆 `7800×6650`，铁匠 `4100×3400`/`4150×3800`（宽少 300/250，降级），住宅 `4200×4200`/`4800×3800`，寺殿 `10450×7900`/`10200×8800`，公堂 `13400×10400`，赌坊 `7650×4800`，厩 `5800×4650`/`6650×3800`，仓 `7650×4800`/`7400×5800`，哨 `4000×3400`/`4150×3800`，摊位占地 `3000×2000`。
- ✅ TOOL-signs-t5：34 键、去重汉字 50 个：`业书佛作净南和回坊堂大天太官客寺岸州布帛库彩旅昌春杂柜洱理白百署肆胡舍药衣西货质逆酒铁门风食饼马高龙`。
- ⚠️ schema 交接建议：`sign?: { textKey: TextKey; style: 'black_gold'|'wood_ink'|'red_gold'|'vertical_hanger'|'wine_flag' }`；寺庙/官署 `red_gold`，酒肆 `wine_flag`，其余 1–2 字店摊 `vertical_hanger`，其余宋匾 `black_gold`、唐匾 `wood_ink`。现行 schema 无字段，未写非法数据。
- ✅ 四道指定命令全通过；`git diff --check`、YAML 解析、真实 buildingId 与唯一性附加检查通过。

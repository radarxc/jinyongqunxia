# NXB08 报告 · 书界 08《鹿鼎记》首领所缺武学补录与替补替换

## 1. 摘要（3–6 行）

- 新建鹿鼎专项补录图鉴，补 22 门武学、23 记绝招、23 条唯一显式路线与 16 个调息档案。
- §12.8 的本书替补均换为同门 / 同来源武学；密宗保留 `sk_dashouyin` 于配装并以其为前置补成 8 品外功，归氏夫妻按主书界规则留待 07。
- 全部 Boss 仍在 21.84–23.15 轮、精英 7.92–8.07 轮；有效耐久 `0.85` 不变。
- 全套 ID、单测、图鉴、路线、未定义引用与四项数值模拟均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/chapters/08-luding.md` | 1,786 | 版本行；§12.8 配装替换、图鉴缺口结果、节奏复核 |
| `docs/design/catalog/skills-bulu-08-luding.md` | 346 | 路线索引、9 组来源武学卡、调息、外放审计、统计、ID 与依赖 |
| `tools/agents/reports/NXB08.md` | 126 | 映射、结论、跨书界项、轮数与自检 |

## 3. 关键结论与数值

1. 新增 `地上1 + 地中14 + 地下7 = 22` 门；绝招 `1×2 + 14×1 + 7×1 = 23`。地中均不满足“有名且多绝学”上限判据，故取 1 招。
2. 16 门内功贡献严格取目标：地上 `94.5`、地中 `83`、地下 `72`；均登记 `outOfBattleScaleBp=15000` 与护体档。
3. 23 条绝招路线均为 8 段：`recovery 1200 + 8×90 = 1920 CT ≤ 2000 CT`；全库完全相同路线为 0。
4. 本册外放招式为 0：内功护体、接触擒拿、普通剑枪和实体火铳均不满足离体内劲判据。
5. 配装不降品阶 / 层数；Boss 仍为 21.84–23.15 轮，精英为 7.92–8.07 轮，无需再调血量 / 防御倍率。

## 4. 开放问题（附默认值）

| 条目 | 默认值 |
|---|---|
| 海大富个人心法是否可完整传授 | 只限秘密传授或宫中遗谱，不随清宫职级普遍开放 |
| 冯锡范个人传承是否并入昆仑派 | 暂不并入；核定原著师承与用名后再决定来源扩展 |
| 具名 Boss 固定 RNG 回放 | 静态轮数已通过；生产回放仍标 **（待实测）** |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务只新增图鉴内容实例，不修改基准规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| 书界 07 / 对应补录图鉴 | 归辛树、归二娘 | 补主书界武学；NXfix 再替换 08 的通行外功 |
| `docs/decisions/ultimate-counts-tianzhong-dizhong.md` | 地中逐门裁定表 | 如该表要求穷举全库，登记本册 14 门地中均取 1 招 |
| `design/03`、`design/09` | 鹿鼎具名画像 / 固定 RNG 回放 | 接入新主运性质与最终路线，验证生产战斗节奏 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 映射表

| 书界 / 首领或模板 | 原替补 | 处理后武学 ID | 类型 | 所在图鉴 | 品阶 |
|---|---|---|---|---|---:|
| 08 / 鳌拜 | `sk_baizhanxinfa`；`sk_kaimenpiguaquan` | `sk_aobaihengliangong`；`sk_bukuhengshuai` | 新增 | `skills-bulu-08-luding` | 8；8 |
| 08 / 清宫布库精英 | `sk_hunyuanfangzhuang`；`sk_kaimenpiguaquan` | `sk_bukuhutiaogong`；`sk_bukuhengshuai` | 新增 | `skills-bulu-08-luding` | 7；8 |
| 08 / 桑结 | `sk_baizhanxinfa`；`sk_kaimenpiguaquan` | `sk_sangjiehufagong`；`sk_xueyuhufashou`；`sk_dashouyin` 保留于配装 | 新增；复用保留 | 补录；`skills-xiaoyao` | 8；8；6 |
| 08 / 密宗番僧 | `sk_hunyuanfangzhuang`；`sk_kaimenpiguaquan` | `sk_fansenghutigong`；`sk_xueyuhufashou`；`sk_dashouyin` 保留于配装 | 新增；复用保留 | 补录；`skills-xiaoyao` | 7；8；6 |
| 08 / 王屋首领 | `sk_baizhanxinfa`；`sk_jianghubaizhanjian` | `sk_wangwuzhenshanxinfa`；`sk_wangwudangguanjian` | 新增 | `skills-bulu-08-luding` | 8；8 |
| 08 / 王屋精英 | `sk_hunyuanfangzhuang`；`sk_tongbeijian` | `sk_wangwuhushangong`；`sk_wangwuposhijian` | 新增；复用 | 补录；`skills-kangxi` | 7；7 |
| 08 / 平西首领与护卫 | `sk_baizhanxinfa` / `sk_hunyuanfangzhuang` | `sk_pingxizhentaixinfa` / `sk_pingxixingqijue` | 新增 | `skills-bulu-08-luding` | 8 / 7 |
| 08 / 神龙舰队首领与精英 | `sk_baizhanxinfa` / `sk_hunyuanfangzhuang` | `sk_shenlonghaichaojing` / `sk_shenlongfanzhougong` | 新增 | `skills-bulu-08-luding` | 8 / 7 |
| 08 / 五龙使、受制教众、接舷精英 | `sk_kaimenpiguaquan` | `sk_meirensanzhao` | 复用（神龙教职级链） | `skills-kangxi` | 8 |
| 08 / 郑氏角色槽与护卫 | 通行 8 / 7 品内功、通行剑 | `sk_yanpinghaifangxinfa` / `sk_yanpingfanchaojue`；`sk_yanpingzhenhaijian` | 新增 | `skills-bulu-08-luding` | 8 / 7；8 |
| 08 / 冯锡范角色槽 | 通行 8 品内功、通行剑 | `sk_yijianxinfa`；`sk_yijianwuxue` | 新增 | `skills-bulu-08-luding` | 8；8 |
| 08 / 雅克萨首领与精英 | 通行 8 / 7 品内功、通行拳剑 | `sk_luochazhenliecao` / `sk_luochabujunhuxi`；`sk_luochaciqiangshu` | 新增 | `skills-bulu-08-luding` | 8 / 7；8 |
| 08 / 海大富 | `sk_xisuijing` | `sk_haidafuhuagujing` | 新增（个人独门） | `skills-bulu-08-luding` | 9 |
| 08 / 归辛树、归二娘 | `sk_kaimenpiguaquan` 等 | 维持替补，待书界 07 补录后替换 | 跨书界待替换 | 主书界 07 | 9 / 8 |

### 7.2 新增武学清单

| 来源组 | 新增武学 | 原著 / 原创 | 绝招数 | 外放数 | 习得途径 |
|---|---|---|---:|---:|---|
| 清宫 / 布库 | 鳌拜横练功、布库横摔、布库护腰功 | 人物 / 场景有据，成套名称均原创扩展 | 3 | 0 | 清宫职级、教头、校场奇遇 / 抄本 |
| 桑结一系 | 桑结护法功、雪域护法手、番僧护体功 | 桑结与大手印有据，新增心法与手法均原创扩展 | 3 | 0 | 密宗职级、桑结传授、护经奇遇 |
| 王屋派 | 镇山心法、护山功、当关剑 | 门派有据，武学均原创扩展 | 3 | 0 | 王屋职级、护寨结局、遗谱 |
| 平西军 | 镇台心法、行气诀 | 原创扩展 | 2 | 0 | 军职、缴获军册 |
| 神龙舰队 | 海潮经、泛舟功 | 原创扩展 | 2 | 0 | 神龙职级、舰队抄本 / 奇遇 |
| 台湾郑氏 | 海防心法、泛潮诀、镇海剑 | 原创扩展 | 3 | 0 | 郑氏军职、水师教头、双印 / 护送支线 |
| 冯锡范 | 一剑心法、一剑无血 | 用名 / 师承待考，机制与招名原创扩展 | 2 | 0 | 本人传授或遗谱奇遇；需作者确认 |
| 雅克萨 | 阵列操、步军呼吸、刺枪术 | 原创扩展 | 3 | 0 | 守军教官、停战训练札记 |
| 海大富 | 海大富化骨经 | 个人功法名与机制原创扩展 | 2 | 0 | 秘密传授或宫中遗谱；需作者确认 |

### 7.3 来源扩展登记

密宗 `sk_dashouyin` 已在 `skills-xiaoyao` 登记 `ch08_luding`，本册仅将其用作 `sk_xueyuhufashou` 的习得前置，无需新增来源扩展。

### 7.4 跨书界待替换

- 归辛树 / 归二娘的主书界为 07《碧血剑》；本任务不新建其专属武学，两人的 §12.8 配装行已在 `sk_kaimenpiguaquan` 后标“待书界 07 补录”。

### 7.5 逐单位轮数

| 单位组 | 替换前 | 替换后 | 说明 |
|---|---:|---:|---|
| 鳌拜、桑结、吴三桂、雅克萨 | 21.84 | 21.84 | 同为 8/8 阳，里程碑不变 |
| 海大富 | 22.72 | 22.72 | 9/8 调和改阴；工具当前整数结果同值 |
| 王屋首领 | 22.32 | 22.32 | 8/8 阳改调和；同值 |
| 神龙舰队、郑氏、冯锡范 | 22.40 | 22.40 | 主运性质按来源分流，当前模型同值 |
| 洪安通 / 苏荃 / 假太后 | 22.72–23.15 | 22.72–23.15 | 未改既有本土神龙主运 |
| 归氏夫妻 | 23.15 | 23.15 | 跨书界待替换，本轮不改 |
| 七类手配精英 | 7.92 | 7.92 | 精确复核 7.9184；默认锚 8.07 |

Boss 计算继续使用 `H=0.85`，例如鳌拜 `25.6893×0.85=21.8359`；均在 12–25。精英均在 6–10，无新增耐久调整。

### 7.6 未能补的缺口

- 本书主书界缺口全部闭合。
- 归辛树 / 归二娘不由本书补录；原因是主书界规则指定 07《碧血剑》。

### 7.7 需作者确认的条目

- 海大富化骨经是否允许玩家获得完整十重；默认仅秘密传授 / 遗谱。
- 冯锡范“一剑无血”是否为应使用的正式武学名、是否并入昆仑；默认保留个人 `lineage` 并标待考。
- 地中新增武学是否需追加入统一裁定表；当前依判据全部取 1 招并已通过 lint fallback 配额。

### 7.8 验收清单

- ✅ 只修改获准的三个文件；未执行改变仓库状态的 git 命令。
- ✅ 先复用后新增：大手印保留于桑结 / 番僧配装，王屋精英剑复用；22 门确需内容写入独立补录图鉴。
- ✅ 所有新武学写明来源、品阶、习得途径；海大富个人独门单列确认项。
- ✅ 23 记绝招具有显式路线、资源、外放判定；路线完全重复 0。
- ✅ §12.8 替换本书替补、保留归氏跨书界项、更新缺口表和版本行。
- ✅ `check_ids --strict`：通过（仅保留仓库基线已知 `sk_babuganchan`）。
- ✅ 105 项 lint 单元测试通过；`check_skill_catalogs --strict` 0 error。
- ✅ `check_route_unique_for` 0；`check_undefined_in` 0。
- ✅ damage / meridian / boss pacing / projection 四项 `--check` 全通过。
- ⚠️ 14 门新增地中武学尚未进入既有逐门裁定表，严格检查以合法 fallback 1–2 运行；本文均按判据取 1。
- ⚠️ 原著待考与真机 / 固定 RNG 实测仍按文档标注保留。

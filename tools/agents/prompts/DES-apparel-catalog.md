# 本任务：设计与考证 · 衣物与护甲扩充（作者 AR-77）：考证八个朝代男女服饰的偏好色系与形制，定出全部条目（名称、六档、朝代、颜色、槽位、数值区间），与现有条目去重；产出新设计文档与总表

本任务写设计文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 AR-77（作者原话与协调者口径），以及 AR-20、AR-25（衣物矩阵与数值口径）、AR-31（物品图归 Gemini）；
- `docs/design/10-items-and-equipment.md`：§2.2 ID 与命名、§3.1 十一格、§3.4 衣甲轻重、§4.1–§4.4 品阶与数值、§5.4 名器；
- 现有名录：`docs/design/catalog/` 下的 `items-clothing.md`、`items-armor.md`、`items-innerarmor.md`、`items-accessories.md`、`items-belts.md`、`items-shoes.md`；
- `docs/design/02-timeline-and-world-tiers.md`：各书界的年代。项目涉及春秋（越女剑）、唐（白马啸西风）、北宋、南宋、元、明、明末、清；
- `assets/default/prompts/item.md` §8：物品图的品阶画面语言。外观要点要能直接拿去出图。

## 要做的事

1. **考证**，写进新设计文档 `docs/design/27-apparel-by-dynasty.md`：
   - 八个朝代男女服饰的偏好色系与形制。每个朝代列男装、女装的主色，附出处：正史舆服志、会典、出土文物、图像资料或权威研究，写明书名、篇名或馆藏。
   - 万能色：男装为白、玄；女装的万能色考证后定 1–2 种。
   - 头饰、腰带、鞋、披风：按朝代写形制要点，男女分开。
   - 作者点名的铠甲：护心镜、皮甲、青铜饕餮盔与饕餮面甲、锁子甲、筒袖铠、明光铠、细鳞甲、盆领铁甲、步人甲、山文甲。逐件考证年代与形制，放进合适的朝代与品阶，定槽位。
   - 门派服与特殊衣物：天师袍、乌蚕衣、虎皮衣、玉莲衣等。原著有出处的照原著，写明书名与情节；没有的标「原创扩展」。
   - 找不到出处的结论一律标「待考」，不得编造书名、文物或馆藏。
2. **品阶**：作者的六档按协调者口径对应 12 级品阶：黄→2、玄下→4、玄上→6、地下→7、地中→8、地上→9；披风三档为黄、玄、地。
   - 先对照 design/10 §4 核实。与之冲突时仍照口径填，并在报告第 4 节列出冲突，交协调者。
3. **总表** `docs/design/catalog/apparel-master.yaml`，结构如下。校验脚本按这个结构查：

```yaml
schema: apparel-catalog.v1
total: 0                # 新条目件数（不含 existing 引用）
batches: {1: 0}         # 每批件数：每批 ≤ 120，从 1 连续编号；CONTENT 按批落数据
gradeMap: {黄: 2, 玄下: 4, 玄上: 6, 地下: 7, 地中: 8, 地上: 9}
capeGradeMap: {黄: 2, 玄: 5, 地: 8}   # 披风三档的品阶，核实后定，严格递增且 ≤ 9
dynasties: [春秋, 唐, 北宋, 南宋, 元, 明, 明末, 清]
palettes: {北宋: {male: [], female: [], sources: []}}   # 八个朝代都写
items:
  - id: eq_...          # 按 design/10 §2.2；不得与现有名录撞 ID
    name: ...           # 每件都要命名；不得与现有条目撞名
    category: 男装      # 男装 / 女装 / 门派服 / 特殊衣物 / 铠甲 / 头饰 / 腰带 / 鞋 / 披风
    catalog: items-clothing.md   # 落到哪份名录
    sub: 衣物·袍服      # 子类；头饰写「头饰·…」，披风写「披风·…」（生成器按子类定槽位）
    slot: body          # body / innerBody / head / hands / shoulder / cape / waist / feet
    tier: 黄            # 六档之一；披风写 黄 / 玄 / 地；铠甲、门派服、特殊衣物写所定档
    grade: 2            # 1–12
    dynasty: 北宋       # 八个朝代之一，或「通用」
    gender: 男          # 男 / 女 / 通用
    color: 月白
    values: {}          # 数值区间，按 design/10 §3.1、§4.1 的公式与轻重系数
    source: 原创扩展    # 或原著 / 史料出处
    form: ...           # 形制与外观要点，供出图
    batch: 1
  - existing: eq_wucanyi   # 与现有条目重合的：只引用、不新造
    name: 乌蚕衣
    category: 特殊衣物
```

4. **覆盖**，校验脚本照此查：
   - 男装：八个朝代 × 六档，每档至少三种颜色，含白、玄和该朝代的偏好色；
   - 女装：八个朝代 × 六档，每档至少两种颜色：该朝代偏好色与万能色；
   - 头饰、腰带、鞋：八个朝代 × 男女 × 六档；
   - 披风：八个朝代 × 三档；
   - 作者点名的铠甲与特殊衣物都要在；已存在的用 `existing` 引用。
5. **去重**：和 design/10 及六份名录的现有条目逐件比对。同朝代、同档、同色已有的，用 `existing` 引用，不新造。报告写明去重了哪些。
6. **分批**：按书界先后排批，先用到的朝代先落；每批 ≤ 120 件。总件数写在设计文档开头和报告里。
7. `docs/design/10-items-and-equipment.md` 只加一行指引，指向新文档，其余不改。设计文档正文不写新的 `eq_` ID，ID 只出现在总表里。

## 约束

- 写集：`docs/design/27-apparel-by-dynasty.md`、`docs/design/catalog/apparel-master.yaml`、`docs/design/10-items-and-equipment.md`（只加一行指引）。写集外的改动在提交时会被丢弃。
- 不改现有名录与内容数据，它们由 CONTENT-apparel-data 分批落。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_apparel_catalog.py docs/design/catalog/apparel-master.yaml`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 40 行，写清：
- 总件数：按类、按朝代、按批；
- 各朝代男女偏好色系的结论与主要出处；
- 点名铠甲与特殊衣物的考证结论与落位；
- 去重清单；
- 与 design/10 的冲突和待考项（附默认值）。

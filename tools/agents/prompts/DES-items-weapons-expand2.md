# 本任务：设计补充 · 兵器与暗器名录第二次扩充（AR-30：武器也不足）

本任务写设计名录与 ID 登记，**不出图**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本任务已开联网，可查历代兵器形制史料。

## 作者要求（2026-10-02 原话，见 `docs/decisions/author-requirements.md` AR-30）

> 另外现在武功秘籍太少了，看起来不足。武器也不足。

前一轮按 AR-24 把兵器扩到 118 行、暗器 24 行（任务 `DES-items-weapons-expand`，提示词 `tools/agents/prompts/DES-items-weapons-expand.md`，必读）。作者仍嫌少，本轮再扩：
- `items-weapons.md` 扩到 **≥ 220 行**；
- `items-hidden-weapons.md` 扩到 **≥ 48 行**。

## 必读

- 上一轮提示词 `tools/agents/prompts/DES-items-weapons-expand.md`：格式、品阶规则、子类、效果字段，全部照旧。
- 上一轮报告 `tools/agents/reports/DES-items-weapons-expand.md`：已盘点过哪些名器、遗留问题。
- `docs/design/catalog/items-weapons.md`、`items-hidden-weapons.md` 现有全部行，不要重复。
- `docs/design/10-items-and-equipment.md` §2–§5；`docs/design/17-sects-compendium.md`；`docs/design/05-martial-arts-system.md`（兵器类别与奇门细分）；`docs/design/02-timeline-and-world-tiers.md`（年代，白马已改唐朝，见 AR-26）。
- `assets/default/prompts/item.md` §8.2–8.3：兵器与暗器出图规则。

## 要做的事

1. **兵器表**扩到 ≥ 220 行，现有行与 ID 一字不改。新增重点：
   - **历代军器制式 ≥ 40**：每个时代的剑、刀、枪、棍、奇门至少各 1 件制式军器，形制按史料：
     - 春秋青铜剑、戈；
     - 唐横刀、陌刀、仪刀；
     - 宋手刀、掉刀、朴刀、斩马刀；
     - 辽金骨朵、狼牙棒；
     - 元弯刀、骑枪；
     - 明雁翎刀、苗刀、狼筅、镋钯；
     - 清腰刀、顺刀；
     - 地域：西域、吐蕃、蒙古、大理、回疆。
     
     写出年代可得性；不在该书界年代出现的不投放。
   - **奇门兵器 ≥ 30**：判官笔、峨眉刺、鸳鸯钺、日月乾坤圈、流星锤、拂尘、铁笛、铁扇、金轮、软鞭、九节鞭、三节棍、链子枪、钩镰枪、双钩、虎头钩、月牙铲、方便铲、降魔杵、铁琵琶、铁算盘、渔网、哨棒等；每件写清用法类别，对接 design/05 的奇门细分。
   - **各书名器补漏 ≥ 20**：逐书再盘点原著有名有姓的兵器。上一轮已有的不重复；拿不准的标（待考）。
   - **门派法器与镇派之物补漏**：design/17 每个主要门派至少 1 件。上一轮已满足的不重复。
   - **玄、黄档每格加厚**：玄 / 黄 × 上 / 中 / 下 × 五类，每格至少 3 件，按不同年代和地域分布。
2. **暗器表**扩到 ≥ 48 行：
   - 历代与地域暗器；
   - 原著有名暗器补漏，如冰魄银针、玉蜂针、含沙射影、暴雨梨花针（非金庸作品不收）、金蛇锥、黑血神针、三笑逍遥散的载具等，逐一核对出处；
   - 毒药暗器只写设定，不写现实配方。
3. **七列格式、ID 规则、品阶比例、外观要点写法**都照上一轮提示词。外观要点要能直接出图：写全长比例、刃形、护手、柄、鞘、材质、纹饰、时代特征。
4. **`docs/design/10-items-and-equipment.md`**：
   - 只在 §5（神兵宝甲）登记新增的天、地名器；
   - **不要改文末 ID 总登记表**：并行任务也在改它。那一行写进报告第 6 节。

## 约束
- 只写：
  - `docs/design/catalog/items-weapons.md`
  - `docs/design/catalog/items-hidden-weapons.md`
  - `docs/design/10-items-and-equipment.md`（仅 §5）
  - 本任务报告
- 原著事实没把握的标（待考），不编造回目和引文。
- 每次写入 ≤ 150 行；名录分多次追加。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-weapons.md --min 220`
- `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-hidden-weapons.md --min 48`

## 报告

第 3 节写：
- 新增的按类别、品阶、年代、地域计数表；
- 名器补漏清单。

第 6 节写文末 ID 登记表要加的行。报告 ≤ 80 行。

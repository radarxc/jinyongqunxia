# 本任务：城镇探索 v2 · 试点内容——价目表、6 类店铺货单、三座试点城设施绑定与店名、设施对话 Ink（ch01 / ch10）

**第一个动作**：读 `tools/agents/reports/ENG-town2-shop-schema.md` 第 3、7 节（四个 schema 的字段与文件位置），再打开三份试点布局（`assets/default/baseline/town/town_dali__ch01.layout.yaml`、`assets/default/town/city_dali__ch10/layout.yaml`、`assets/default/town/city_turpan__ch10/layout.yaml`）里的 `buildings` 段，列出每栋的 `id`、`type`、占地与 `business_ref`；读完直接动手，不要先写计划。

本任务写内容（YAML / Ink / 文本），不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。事实优先级与标注规则见 `_common.md`；原著没有的标（原创扩展）。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」流程：进店 → 点店主 → 设施对话 →「看看货」（Ink 动作 `#ts:facility/openShop`）→ 店铺界面。core 买卖按 design/12 的定价公式与 design/10 §13 的参考价结算；本任务给三座试点城（大理 ch01、大理 ch10、吐鲁番 ch10）配齐设施、店名、货单与对话，让下游 core / 界面任务能跑通全流程。ch10 是《白马啸西风》唐长安二年（702）西州一带（AR-113 第 6 条、AR-26），称谓、货品、店名要合唐代与西域风土；ch01 是北宋大理（天龙八部，约 1093）。

## 要做的事
1. **价目表** `content/common/economy/price-table.yaml`（`price-table.v1`）：按 `docs/design/10-items-and-equipment.md` §13（参考价 `P(cat, g)`，单位文）逐类逐品阶填数；表中算式照抄依据，`itemKindToCategory` 覆盖现有物品种类（先 `grep -h "^kind:\|^category:" content/items/*.yaml | sort | uniq -c` 看实际种类）。
2. **店铺模板** `content/shops/shop_tpl_<sub>.yaml`（`shop-template.v1`）6 份：`yaopu` 药铺、`zahuo` 杂货、`tiejiang` 铁匠、`chengyi` 成衣、`mashi` 马市、`shitan` 食摊。每份 6–14 行货，`itemId` 必须是 `content/items/` 里已存在的物品（先 grep 核对），`maxGrade` 与 `baseStock` / 补货节奏按 design/12（约 L1349–1406：店类与 `shopMul`、按章节 + 城 + 店 + 时段播种、3 天补货）给【建议值】；成衣、马市里的物品若库里没有合适条目，就少列几行，不要造不存在的 ID。
3. **设施绑定** `content/town/facilities/{city_dali__ch01,city_dali__ch10,city_turpan__ch10}.yaml`（`town-facilities.v1`）：每城至少 药铺、杂货、客栈（`kind: inn`，`shop: null`）各一，另按布局里有的店铺类建筑配铁匠 / 成衣 / 马市 / 食摊（有就配，没有就不配）；`buildingId` 必须是该布局里真实存在、类型为店铺 / 客栈 / 摊位类的建筑（`shop`、`shop_1f`、`shop_2f`、`market_stall`、`market`、`inn`、`restaurant`），不得绑到民居、衙门、寺庙；同城不重复。`dali_yaopu`（现有 `content/chapters/ch01_tianlong/shops/dali_yaopu.yaml`）对应的药铺必须在大理 ch01 绑上。
4. **店名与文本** `content/locales/zh-Hans/town-facilities.yaml`：每个设施一个 `nameKey`（如 `town.city_dali__ch01.yaopu_01.name`），名字符合时代地域（北宋大理如「回春堂」「苍山药肆」；唐西州可用「药行」「胡商货栈」「逆旅」之类），均标（原创扩展）于注释；不要用现代或明清以后才有的字号格式。
5. **设施对话** `content/town/facility-dialogues.yaml`（`facility-dialogue.v1`）+ Ink：
   - `content/story/ch01/story_ch01_facility.ink` 与 `.inkmeta.yaml`、`content/story/ch10/story_ch10_facility.ink` 与 `.inkmeta.yaml`（照 `content/story/ch10/story_ch10_cold_entry.*` 的格式：`schemaVersion: inkmeta.v1`、`storyId`、`chapter`、`entryKnots`、`commands`、`npcs`）。
   - 每类设施 × 角色（药铺 keeper、杂货 keeper、客栈 keeper、铁匠 keeper、成衣 keeper、马市 keeper、食摊 vendor）一个入口 knot：店主用 `#ts:dialogue/speaker speaker=interlocutor` 开场寒暄（2–3 句，按时代口吻），给玩家 2–3 个选项：「看看货」→ `#ts:facility/openShop` 后 `-> END`；「打听消息」→ 1–2 句当地风物（不涉及剧情秘密）→ `-> END`；「告辞」→ `-> END`。客栈先只做「打听消息 / 告辞」（住店留给 P3）。
   - **每个 knot 都必须以 `#ts:facility/openShop` 后 `-> END` 或直接 `-> END` 收尾**；说话人只用 `interlocutor`、`player`、`narrator`。
   - `facility-dialogue.v1` 绑定：`{ chapter, kind, sub, roleKey, storyId, entryKey }` 逐条对上面的 knot。

## 约束
- 只写：`content/common/economy/**`、`content/shops/**`、`content/town/facilities/**`、`content/town/facility-dialogues.yaml`、`content/story/ch01/story_ch01_facility.*`、`content/story/ch10/story_ch10_facility.*`、`content/locales/zh-Hans/town-facilities.yaml` 与本任务报告。不改代码、不改布局与 `assets/**`、不改已有剧情。
- **协调者 10-11 r2 返修裁定**：① **货单可按年代分版本**：设施条目本就逐个用 `shop.templateRef` 指定模板，凡跨年代凑不出合理货单的店类（至少铁匠；其他店类审核指出问题时同理），新建 `content/shops/shop_tpl_<sub>_tang.yaml` 供 ch10 两城（702 年唐西州、同时代的南诏大理）用，原 `shop_tpl_<sub>.yaml` 供 ch01 北宋大理用；设施文件按城市年代引用对应模板；不得新造物品 ID，现有物品库凑不足 6 行的唐代变体可少于 6 行并在报告第 4 节登记。② 马市对白只宣称货单里真实有的东西。③ 杂货供货行 `priceBp` 恢复 10000，`shopMul=1.05 / outlet=0.80` 的按店类买卖倍率登记为 core 接口缺口（报告第 6 节），不要借供货行倍率表达。④ 报告第 7 节测试向量分别覆盖买价与卖价。
- 沙箱里 `pnpm content:*` 若因 tsx socket 被拒跑不了，照实写进报告，交校验阶段跑；不要改 `node_modules`。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm content:compile-story`
- `pnpm content:test-compile-story`
- `python3 tools/lint/check_ids.py --strict`

## 报告
`tools/agents/reports/DES-town2-pilot-content.md`（≤ 80 行）：第 3 节列三城设施表（设施 key、建筑 id、类型、店名）、价目表依据、各模板货品数；第 4 节列（原创扩展）与（待考）条目；第 7 节写给 core 店铺任务的测试向量（某店某物的期望买价 / 卖价算式，可直接写进单测）。

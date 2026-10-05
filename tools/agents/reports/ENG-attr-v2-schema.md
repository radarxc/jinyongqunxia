# ENG-attr-v2-schema 报告 · 游戏工程 · 小修：item.v1 各 extension 接受可选 attributes: AttributeProjectionV2（design/10 §4.10.5 投影目标），只校验结构不消费——解锁 TOOL-items-regen 的 content:validate
## 1. 摘要（3–6 行）
`item.v1` 现可在九类适用 extension 的 `value.attributes` 中携带严格的 `AttributeProjectionV2`。
投影只由 data 层校验并原样保留；未改 extension 类型、content registry 或任何消费端。
八项定向回归、data 包 157 项测试、全仓 983 项测试、现有内容及真实九列生成样例均通过。

## 2. 产出（文件、行数、主要章节）
- `packages/data/src/schemas/item.ts`（199 行）：投影 schema/类型、九类 extension 可选接入。
- `packages/data/src/schemas/item.test.ts`（121 行）：3 条接受、4 条拒绝、1 条旧数据兼容。
- `packages/data/CLAUDE.md`（42 行）：明确 data 层只校验并保留，不结算或重复消费。

## 3. 关键结论与数值
| 组 | 字段与结构约束 |
|---|---|
| 版本 | `version: 2`（literal，必填） |
| 非负整数 | `atk/hardness/qiAffinity/def/reflect/antiHidden/agi/block/luck/poison/antiPoison/restoreQi/qiCultivation/con/healInner/healOuter/stamina/cultivation/travel` |
| 有界/正整数 | `readWis/readBre/artReq` 为 0–100；`maxLayer` 为正整数 |
| 引用 | `skillRef` 用 `SkillIdSchema`；`qiEffect/unlockRef/ruleRef` 用正式 ID 形状；`artRef` 用既有十项 `ArtIdSchema` |
- 接入 `equipment/material/manual/page/recipe/quest/curio/mount/generic`；`collectible` 继续使用六个原生字段，不接投影。
- `pnpm size`：entry **38.44 / 170 KiB gzip**，render 161.87 / 180，webgl total 200.31 / 350，均通过。

## 4. 开放问题（附默认值）
- 无产品开放问题；默认由后续 ENG-27a 决定消费，当前只校验/保留。沙箱禁止 tsx CLI 建 Unix socket，门禁以仅替换启动方式的临时 script shell 运行。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现直接遵循 `design/10` §4.10.3–§4.10.5。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；TOOL-items-regen 可按既定 `extension.value.attributes` 结构重生成并复验，不需改设计文档。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 1：导出 schema/type，完整白名单按最小范围校验，并接入全部适用 strict extension；type 不变、收藏品排除。
- ✅ 2：仅改 schema/测试/包约定；core、render、ui、content registry 与内容均未改，未新增消费。
- ✅ 3：定向 8/8；`@tianshu/data` 13 文件/157 项；覆盖 generic/equipment/manual、四类非法输入及无 attributes 旧物品。
- ✅ 4：`pnpm check`（沙箱启动适配）140 文件/983 项全绿；`content:validate` 987 文件/925 对象/62 地图；严格 ID 新增失败 0。
- ✅ 4：TOOL-items-regen 的 `it_milian_huotui.yaml` 经 `parseContentFile` 成功，保留 `{version:2, stamina:22}`；entry 未超预算。

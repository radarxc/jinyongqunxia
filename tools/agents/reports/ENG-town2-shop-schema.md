# ENG-town2-shop-schema 报告 · 城镇探索 v2 · P1 · 设施 / 店铺模板 / 价目 / 设施对话 schema + Ink 动作 facility/openShop
## 1. 摘要（3–6 行）
- 新增设施、设施对话、店铺模板、价目表四个严格 Zod schema，并从 schema barrel 导出。
- 四类内容进入真实 `ContentKind`、字段拆包和 `loadContent()` 必填深冻结数组。
- 公共加载闭合物品／模板／Ink 故事、章节、入口及已有 v1 运行时建筑；构建期闭合布局原文件与建筑。
- 新增无参数 `facility/openShop` 与说话人 `interlocutor`，正反夹具覆盖参数拒收。
- 旧 `shop.v1` 未改；本轮六条指定检查与全仓完成定义均通过。
## 2. 产出（文件、行数、主要章节）
- 新增：`schemas/facility.ts` 85 行、`schemas/shop.ts` 58 行、`shop-facility.test.ts` 266 行。
- 修改：`event-actions.ts` 106 行、`schemas/index.ts` 25 行、`content-registry.ts` 378 行、`content-index.ts` 361 行、`build/discover.ts` 80 行、`build/field-registry.ts` 151 行。
- `pnpm install --frozen-lockfile`：通过，lockfile 已是最新且未改。
- `pnpm --filter @tianshu/data test`：29 文件、354 测试通过；包内 typecheck 通过。
- `pnpm content:build`：通过，1770 对象、15 章；`content:validate`：1777 文件、1708 对象、2 Ink、65 地图通过。
- `pnpm check`：通过；全仓 203 文件、1556 测试，故事编译、生产构建、尺寸门与 dev chunks 均通过。
- `check_ids.py --strict`：通过；371 文件、76055 occurrences，基线 5 个已知未定义项、strict failure 0。
## 3. 关键结论与数值
| schema | 字段 | 核心校验 |
|---|---|---|
| `town-facilities.v1` | `layoutKey, facilities[{key,kind,sub,buildingId,nameKey,shop,roles,hours?}]` | 14 种 `FacilityKind`；key / buildingId 各自唯一；roles ≥ 1；分钟 0–1439；建筑两层闭合 |
| `facility-dialogue.v1` | `bindings[{chapter,kind,sub?,roleKey,storyId,entryKey,condition?}]` | `(chapter,kind,sub,roleKey)` 唯一；有 Ink 清单时故事、章节、入口闭合 |
| `shop-template.v1` | `key,nameKey,facilitySub,supply` | supply 沿用 `ShopDef` 的 itemId、五个数值字段与 condition；maxGrade 1–12；拒收 chapterId；itemId 闭合 |
| `price-table.v1` | `categories[{id,byGrade}],itemKindToCategory` | 类别唯一且映射闭合；所有 ItemKind 必须映射；价格为非负安全整数 |
- `byGrade` 固定 12 项，下标 0..11 对应品阶 1..12；依据 `design/10` §13.2，金额统一为整数文（1 两 = 1000 文）。
- `facility/openShop` 的 EventAction 与 Ink 参数集合均为空；任何参数由 `INK_TAG_PARAM` 拒收。
## 4. 开放问题（附默认值）
- 价目表中的 0 默认表示该品类／品阶无参考价（对应 §13.2 的“—”）；负数拒收。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现按 tech/15 §2.5 与 design/10 §13.2。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/15-town-explore-v2-spec.md` §2.5：后续可补记两层建筑闭合错误码 `FACILITY_LAYOUT_MISSING` / `FACILITY_BUILDING_UNKNOWN`。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 四 schema 正反例：重复 key/buildingId、未知 kind、负价、13 品阶槽、maxGrade=13、chapterId 均拒收。
- ✅ 引用校验：公共加载拒绝未知 templateRef / itemId / v1 建筑及 Ink storyId / 章节 / entryKey；无 v1 运行时不误拒。
- ✅ 动作：openShop 无参数通过、有参数拒收；interlocutor 通过、interlocutorx 拒收。
- ✅ 构建：四路径被发现，缺内容目录静默；布局优先 `assets/default/town/<layoutKey>/layout.yaml`，回退 baseline，缺布局／建筑均拒收。
- ✅ 注册表：四类字段可拆分；返回 `shopTemplates / priceTables / townFacilities / facilityDialogues` 必填深冻结数组。
- ✅ 六条指定检查和 `pnpm check` 均退出 0；实测数字见 §2。
- 交接 ENG-town2-shop-core：复用 `FacilityKind/FACILITY_KINDS`、`TownFacilitiesDef`、`FacilityDialogueDef`、`ShopTemplateDef`、`PriceTableDef`；加载字段名见上一条。
- 交接 DES-town2-pilot-content：分别写 `content/town/facilities/*.yaml`、`content/town/facility-dialogues.yaml`、`content/shops/*.yaml`、`content/common/economy/*.yaml`。

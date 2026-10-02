# DES-npc-commoners-era 报告 · 设计补充 · 各朝各代路人形象 ≥160 与 Gemini 提示词（AR-30 第 4 条）

## 1. 摘要（3–6 行）

完成 12 个时代、16 个时代地域目录的路人形象设计，共 228 款；每时代 19 款、17 类角色。
新增一份含年代、服饰、道具、体貌、史料与书界字段的清单，并为每款形象逐一提供可独立使用的 Gemini 中文提示词。
白马按 AR-26 归入唐代，唐中原 / 西域、明北方 / 江南、清北方 / 江南 / 回疆均有实际条目；本任务不出图。
史料网页已于 2026-10-02 核验；跨地域、跨阶层或年代外推均在清单中降级为 **（待核实）**。

## 2. 产出（文件、行数、主要章节）

- `docs/design/catalog/npcs-commoners-era.md`：457 行；含使用边界、15 项史料索引、时代映射、228 行形象清单、ID 约定、校验用例与待决事项。
- `assets/default/prompts/characters/commoners/**`：228 个 Markdown，合计 7,068 行，分 16 个时代地域目录；每个 ID 一份精简 frontmatter 与自成一体的 `## Gemini 提示词`。
- `tools/agents/reports/DES-npc-commoners-era.md`：本报告；未创建图片或实际资产 manifest。

## 3. 关键结论与数值

- 数量：春秋 19；唐 19（中原 10 / 西域 9）；北宋 19；辽 19；西夏 19；金 19；南宋 19；大理 19；吐蕃 19；蒙古与元 19；明 19（北方 9 / 江南 10）；清 19（北方 6 / 江南 7 / 回疆 6）。合计 `12 × 19 = 228`。
- 每时代 17 类角色；掌柜、农户各拆男女，所以 `17 + 2 = 19`。全批只用成年年龄段，女性 60 款、男性 168 款，无儿童路人。
- 建议先出的 30 款（覆盖全部时代与全部地域）：
  1. `por_role_shopkeeper__chunqiu_yue_m`；2. `por_role_musician__chunqiu_yue_m`；3. `por_role_soldier__tang_xiyu_m`；4. `por_role_shopkeeper__tang_zhongyuan_f`；5. `por_role_guard__tang_xiyu_m`；6. `por_role_shopkeeper__song_north_m`；
  7. `por_role_peddler__song_north_f`；8. `por_role_farmer__song_north_f`；9. `por_role_soldier__liao_m`；10. `por_role_shopkeeper__liao_f`；11. `por_role_officer__xixia_m`；12. `por_role_peddler__xixia_f`；
  13. `por_role_soldier__jin_m`；14. `por_role_musician__jin_f`；15. `por_role_shopkeeper__song_south_f`；16. `por_role_fisher__song_south_m`；17. `por_role_shopkeeper__dali_m`；18. `por_role_monk__dali_m`；
  19. `por_role_farmer__tubo_f`；20. `por_role_boatman__tubo_m`；21. `por_role_soldier__mongol_yuan_m`；22. `por_role_shopkeeper__mongol_yuan_f`；23. `por_role_guard__ming_north_m`；24. `por_role_shopkeeper__ming_south_m`；
  25. `por_role_farmer__ming_south_f`；26. `por_role_soldier__qing_north_m`；27. `por_role_shopkeeper__qing_south_f`；28. `por_role_fisher__qing_south_m`；29. `por_role_peddler__qing_xiyu_f`；30. `por_role_musician__qing_xiyu_f`。
- 需补职业枚举 8 项：`shopkeeper`、`shop_assistant`、`soldier`、`officer`、`official`、`constable`、`monk`、`daoist`。已复用 `scribe`、`musician`、`guard` 等既有枚举。

## 4. 开放问题（附默认值）

- 8 个职业候选是否正式入运行时枚举？默认：提示词可先制作，程序接入前由 `npcs-commoners.md` 统一收录或映射。
- 白马唐代的精确年份尚未落定。默认：采用不含特定帝王 / 官阶标志的唐代宽年代普通装，定年后复审。
- 清代回疆宗教人物具体教职形制证据不足。默认：素色端庄长袍与普通头巾，不给高阶标志，并保留 **（待核实）**。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- NCE-BP-01 / 在素材命名唯一归属文档登记 `por_role_<role>__<era_region>_<m|f>` / 防止外观模板被误当静态 `npc_*`。
- NCE-BP-02 / 在白马年代唯一归属处删除旧清初口径并给出唐代精确年份 / 当前只能按 AR-26 采用宽年代服饰。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/catalog/npcs-commoners.md` / §4 职业与能力模板 / 审批并补入上述 8 项职业 ID，或给出现有枚举的正式映射。
- `docs/tech/07-asset-generation.md` / §1.4 素材 ID / 登记 `por_role_*` 无名外观模板格式、时代地域键及其不注册 `npc_*` 的边界。
- 白马年代唯一归属文档与相关剧情 / 地图文档 / 年代字段 / 按 AR-26 固化唐代精确年份，移除残留清初回疆服饰口径。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 时代 / 地域：12 个时代全部覆盖；唐、明、清的指定子地域均有实际形象。
- ✅ 数量 / 角色：228 ≥ 160；每时代 19 ≥ 12，覆盖 17 类角色；不适用角色在时代说明中解释并替换为等价槽。
- ✅ 清单字段：228 行均含 ID、时代、职业、性别、成年年龄、六项服饰、道具、体貌、史料、书界。
- ✅ 提示词：228 文件与清单一一对应；frontmatter 9 键齐全，正文包含指定构图、画风、背景、服饰、道具及排除项；不含参考图上传。
- ✅ 长相与伦理：普通人面貌多样，明确成年人，无儿童、网红脸、真人或具名人物复刻。
- ✅ 史料：15 项入口含链接与 2026-10-02 访问日；弱证据均标 **（待核实）**，无虚构引文、卷次、页码或真人姓名。
- ✅ ID / 结构：228 个唯一 `por_role_*`；清单—文件—frontmatter—输出路径交叉校验 0 错误；`python3 tools/lint/check_ids.py --strict` 退出码 0。
- ✅ 文件边界 / 格式：仅写授权路径；`git diff --check` 通过；无任务占位词、截断句、未闭合代码块或临时标记。
- ⚠️ 未出图、未创建实际资产 manifest，符合本任务“只写提示词、不出图”；史料降级项仍需后续服饰史校审。

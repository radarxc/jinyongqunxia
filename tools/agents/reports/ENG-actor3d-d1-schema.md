# ENG-actor3d-d1-schema 报告 · 城镇 3D 人物 · 身高数据 schema（NpcAppearance.body、CharacterTemplate.body、pickTemplateHeightCm）
## 1. 摘要（3–6 行）
已在 `character.ts` 增加六种体型 ID、具名 NPC 外观身高、角色模板身高区间与稳定取值函数。
主角缺省体型/身高导出为男 `tpl_m_medium`/181 cm、女 `tpl_f_medium`/166 cm。
边界、非法输入、确定性及 10,000 个固定种子均有命名测试；既有 1,793 个内容文件仍通过校验。
最终目标测试、内容校验与全量 `pnpm check` 均以退出码 0 通过。
## 2. 产出（文件、行数、主要章节）
- `packages/data/src/schemas/character.ts`（150 行）：schema、常量、类型与纯函数；未拆 `character-body.ts`，因此既有 `schemas/index.ts` 自动导出。
- `packages/data/src/schemas/character.test.ts`（148 行）：body 边界/判重、公式、uint32、固定种子及 render 缺省常量 oracle。
- 验收：`pnpm install --frozen-lockfile` 通过（锁文件最新，793 ms）；schema Vitest 5 文件/29 测试通过（1.28 s）；`pnpm content:validate` 通过（1,793 文件、1,720 对象、4 Ink、65 地图）。
- 最终 `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check` 通过：273 文件/2,315 测试；故事编译 3 线/2 章；包体门禁全过（WebGL 190.71/350 KiB，首次会话 103.93/110 KiB，dev assets 981）。
## 3. 关键结论与数值
- 一致处：`NpcAppearance.body?={template,heightCm}`；`CharacterTemplate.body?={templates,heightCm:[min,max]}`；高度为整数 120–230 cm，模板非空且不重复，`min <= max`。
- 公式：`template=templates[seed % n]`；`heightCm=min + floor(seed/n) % (max-min+1)`；seed 严格限 uint32，负数、小数及 `>2^32-1` 抛 `BODY_SEED_UINT32_REQUIRED`。
- 缺省：`DEFAULT_PLAYER_BODY.male={tpl_m_medium,181}`、`female={tpl_f_medium,166}`；test-only 运行时 oracle 读取 render 的实际 `DEFAULT_PLAYER_HEIGHT_M` 导出并交叉断言，data 生产代码不依赖 render。
- 偏离处：tech/16 §9.3 旧文字仅写 `min + seed % width`；按本任务细化公式先按余数选模板、再用 `floor(seed/n)` 选身高，避免二者共用同一余数。
## 4. 开放问题（附默认值）
- 新换装模板何时扩入枚举尚待换装索引合入；默认继续只允许当前六个 `tpl_f_*`/`tpl_m_*` ID。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- P-actor3d-body-01 / 将 tech/16 §9.3 的旧身高公式同步为本报告公式 / 防止下游按旧公式实现而与已拍板模板分配不一致。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/16-town-3d-spec.md` / §9.3 / 同步 `pickTemplateHeightCm` 的双索引公式、uint32 输入域与缺省常量。
- `content/**` / 具名 NPC 各 appearance、角色模板 / 后续内容任务补 `body:{template,heightCm}` 或 `body:{templates,heightCm:[min,max]}`。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 仅修改两个源码/测试文件及本报告；未改 content、render、core、导出索引、依赖或门禁。
- ✅ schema 边界、非法模板、空/重复列表、倒序区间、精确公式、同种子、单值区间、非法 seed 与 10,000 固定种子均有真实断言；无 skip/todo。
- ✅ 四条指定命令在最终代码上亲自实跑并通过；全量 lint、类型、2,315 测试、内容/故事编译和包体预算均通过（首次全量运行有 1 次无关分配采样波动，未改代码重跑即通过）。
- ✅ core/编译器交接：以 `FacilityNpc` 存档稳定外观 seed 直接调用 `pickTemplateHeightCm(template.body, seed)`；投影写 `ActorLook.template=result.template`、`heightM=result.heightCm/100`。
- ✅ 内容交接：具名 NPC 按年龄在对应 `NpcAppearance` 写 `body:{template:'tpl_*',heightCm:整数}`；角色槽模板写非空不重复 `templates` 与闭区间 `[min,max]`。

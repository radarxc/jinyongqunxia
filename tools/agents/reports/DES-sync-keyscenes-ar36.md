# DES-sync-keyscenes-ar36 报告 · 设计同步 · AR-36 情景图第二波之后：key-scenes.md 口径（候选清单 / 入库数以 manifest 为准 / candidate 参考）与各书条目修正、story/07 §2.2、story/09 制衣方向、npcs-ch09 铃剑双侠、npcs-ch08 与 design/18 人物主记录核查

## 1. 摘要（3–6 行）

- 已将 `key-scenes.md` 从“每书恰 7 场、仅 approved 参考”的旧门禁改为候选清单口径：正式入库以各书 `manifest.yaml` 为准，candidate 立绘可作身份参考。
- 保留全部场景 ID 与规划行，逐书同步已入库画面、题字及原著边界；当前共 108 个候选、82 幅 candidate 入库插图。
- 已完成碧血时间表述、连城制衣动作、铃剑双侠关系修正，并补齐顺治、风际中、孙婆婆、蒙哥的主记录链路。
- ID 严格检查、三份现有故事 DAG 检查和 diff 格式检查均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/key-scenes.md` | 247 | §0、ch00–ch14 候选表、§16–§17 |
| `docs/design/story/07-bixue.md` | 1861 | §2.2 时间表述 |
| `docs/design/story/09-liancheng.md` | 1818 | 制作羽衣动作 |
| `docs/design/catalog/npcs-ch08-luding.md` | 87 | 顺治、风际中主记录 |
| `docs/design/catalog/npcs-ch09-liancheng.md` | 38 | 铃剑双侠 / 落花流水说明 |
| `docs/design/catalog/npcs-ch03-shendiao.md` | 101 | 孙婆婆、蒙哥主表登记 |
| `docs/design/18-npc-and-companions.md` | 1949 | §13 人物正式记录、统计和校验口径 |
| `tools/agents/reports/DES-sync-keyscenes-ar36.md` | 80 | 本任务产出、结论、开放项与自检 |

## 3. 关键结论与数值

| 册 | 规划候选 | manifest 入库 | 修改的候选表行 |
|---|---:|---:|---:|
| ch00 序章 | 4 | 0 | 3 |
| ch01 天龙 | 8 | 8 | 7 |
| ch02 射雕 | 8 | 8 | 6 |
| ch03 神雕 | 8 | 8 | 7 |
| ch04 倚天 | 8 | 8 | 7 |
| ch05 笑傲 | 8 | 8 | 7 |
| ch06 侠客 | 7 | 5 | 7 |
| ch07 碧血 | 7 | 5 | 7 |
| ch08 鹿鼎 | 8 | 8 | 7 |
| ch09 连城 | 7 | 5 | 7 |
| ch10 白马 | 7 | 3 | 7 |
| ch11 鸳鸯 | 7 | 3 | 7 |
| ch12 书剑 | 7 | 5 | 7 |
| ch13 飞狐 | 7 | 5 | 7 |
| ch14 雪山 | 7 | 3 | 7 |
| **合计** | **108** | **82** | **101** |

- 82 条 manifest 记录均为 `status: candidate`；每册数量按 `assets/default/scene/chNN/manifest.yaml` 逐项核算。
- 14 册人物主表现有 445 行、417 个唯一 ID、28 条复用行；叠加 AR-36 A 批 71 行后为 516 行，再加 B 批 39 行，静态索引共 `445 + 71 + 39 = 555` 行；另有 18 个无名角色 / 支持槽，目录生产行合计 573。
- `design/18` 当前全局身份期望值为 `516 + 12 + 3 + 4 = 535`；本任务复用 `npc_fengjizhong`、`npc_sunpopo`、`npc_mengge`，仅补建缺失的 `npc_shunzhi`。

## 4. 开放问题（附默认值）

1. candidate 插图何时转 approved：默认继续保留 candidate，不以本轮文档同步代替美术验收。
2. 部分原著细节仍需按三联 / 广州修订版逐字核对：默认保留文内“（待考）”而不进一步断言。
3. 3:2 原图与 16:9 正式 CG 的交付策略：默认保留 1536×1024 原图，另产安全裁切版本，不覆盖源图。
4. 双儿是否另行精修：默认维持现状，由作者拍板，本任务未改其资产或记录。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| 无 | 本任务不提议修改 `docs/00-canon.md` | 候选 / 入库 / candidate 参考均可在资产目录职责内同步，未发现必须上升为基准的新冲突。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/story/08-luding.md` | 约第 402、794 行 | 将“顺治 / 行痴正式 ID 尚待 design/18 登记”改为引用 `npc_shunzhi`。 |
| `docs/design/chapters/08-luding.md` | 约第 186 行 | 将顺治 / 行痴从局部角色槽改绑正式主记录 `npc_shunzhi`。 |
| `TODO.md` | 本任务状态 | 由调度器登记完成；本任务按权限不修改。 |

仍需人工拍板：candidate 最终批准、原著逐字考据、3:2 / 16:9 导出策略及双儿是否精修；本轮默认值见 §4。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

1. ✅ `key-scenes.md` §0、§16、§17 已改为候选清单、manifest 计数、candidate 身份参考；标题写明逐书规划 / 入库数。
2. ✅ ch01–ch14 指定条目均已修正；未删规划行、未改场景 ID，三条未出场景已标“候选未出”。
3. ✅ `story/07` §2.2 已改为“在华山学艺约十年后下山”，十四岁发现铁盒保留纸本待考。
4. ✅ `story/09` 已改为水笙抽淡黄衫线、以金钗穿缀羽衣。
5. ✅ `npcs-ch09` 已说明水笙与汪啸风为铃剑双侠、水岱为落花流水之一，ID 与其他列未改。
6. ✅ `npcs-ch08` 已补 `npc_shunzhi`，风际中复用 `npc_fengjizhong`，并同步 `design/18` 正式记录。
7. ✅ ch03 已复用 `npc_sunpopo`、`npc_mengge` 补入主表；`design/18` 的登记、迁移与统计已同步。
8. ✅ `check_ids.py --strict` 通过（strict failure 0；仅报告仓库基线未定义 `sk_babuganchan`）；`check_story_dag.py` 对现有三份 story YAML 通过；`git diff --check` 通过。

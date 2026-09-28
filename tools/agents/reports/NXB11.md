# NXB11 报告 · 书界 11《鸳鸯刀》首领所缺武学补录与替补替换

## 1. 摘要（3–6 行）

- 已新增按书补录图鉴，补录卓天雄个人传承 `sk_zhentiansanshizhang`（震天三十掌，7 地下）；名称与原著归属保留 **（待考）**，拆招、机制和习得事件明确标为 **（原创扩展）**。
- 卓天雄枣林、紫竹庵、终局三场均以新掌法替换通行替补 `sk_daneichangquan`，保留 `sk_wuyingshou` 承载点穴表现；主运七参不变。
- 太岳石碑缺口无需新增武学：复用 `skills-kangxi.md` 的 `sk_taiyueshibeishou`；仅 `eq_changchangfengshibei` 的 `exotic/misc` 装备兼容仍待 `design/10` 同步。
- 九项指定校验全部通过；三场卓天雄静态节奏仍为 `15.70 / 15.70 / 16.23`，均在 Boss 12–25 轮窗口内，无需调血量或防御倍率。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完稿行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/chapters/11-yuanyang.md` | 1,521 | 版本行；§6.2 学习入口；§8.7 遭遇武学；§9.1–§9.5 数量与投放；§12.4 / §12.8 配装、轮数与缺口；§13、校验及待决追溯 |
| `docs/design/catalog/skills-bulu-11-yuanyang.md` | 167 | 绝招路线索引；震天三十掌完整卡；复用 / 桥接登记；外放审计；统计；新增 ID；校验和依赖 |
| `tools/agents/reports/NXB11.md` | 109 | 本报告；映射、武学清单、轮数、同步项与自检 |

## 3. 关键结论与数值

1. 新掌法取 **7 地下**：本界首领锚 `G=5`，卓天雄没有 `design/21` §11.9.1 的更高具名地位下限；`7≥5`，且不越本界既有地中 8 上限。
2. 卡片容量为 5 招、3 被动、4 招式栏；`layerStats` 满层为 `hit 9 + counter 6 = 15`，等于地阶上限。
3. 唯一绝招 7 重解锁，资源为气势 100、内力 9%、`cd=0`、收招 1200；8 段路线各 90 CT，故 `1200+8×90=1920≤2000 CT`。
4. 五招均为近身接触，外放数为 0；五条路线同门两两最多共享 `2/6=33.3%` 穴位，且没有与已有绝招路线完全相同。
5. 卓天雄继续主运 `sk_jundituna`：七参 `5/8；13000/9000/13000；yang；fullTemplate`。外功替换不改变静态轮数，耐久仍为 `1.00×1.00`。
6. 本书原生武学统计由地 2 / 玄 9 / 黄 9 改为地 3 / 玄 9 / 黄 9；全局闭合总数需由收尾任务汇总，本分支单独使地阶与总量各加 1。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本版默认值 |
|---|---|---|
| NXB11-O01 | “震天三十掌”是否为三联 / 广州修订版原著正式名称 | 未核定前标 **（待考）**；不写回目号或引文，具体五招均视为 **（原创扩展）** |
| NXB11-O02 | 卓天雄个人传承如何供主角与同伴学满 | 默认卓存活、完成 `q_11_side_08` 释放具结且关系 R3 后亲授至 10 重；观摩仅至 6 重，击杀不掉落满层秘籍 |
| NXB11-O03 | 太岳石碑的装备兼容何时启用 | 默认等 `design/10` 正式登记 `eq_changchangfengshibei` 的 `exotic/misc` 兼容后启用；此前武学存在但该装备不能满足其 `weaponReq` |
| NXB11-O04 | 新增武学如何计入全局 1,138 闭合目录 | 默认只增不删；本分支暂把全局计数视为 `51/170/459/459=1,139`，由 NXfix 汇总并行补录后统一回写权威总量 |
| NXB11-O05 | 静态轮数通过是否代表生产战斗验收完成 | 否；沿用章节既有默认，具名 `full` 战与机制战仍需固定 RNG 回放 **（待实测）** |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NXB11-P01 | 全部按书首领武学补录结束后，以实际清单更新 Canon §4 与 `design/05` §14 的分阶 / 总量 | Canon 当前称 `51/169/459/459=1,138` 已闭合，但作者新决定要求增加真实缺口武学；本任务单独新增 1 门地阶且不得改基准，需集中收口避免并行任务各自猜总量 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/10-items-and-equipment.md` | `eq_changchangfengshibei` 定义 | 登记可满足 `sk_taiyueshibeishou.weaponReq` 的 `category:exotic, kind:misc` 兼容桥；在此之前不得视为已闭合 |
| `docs/design/catalog/npcs-ch11-yuanyang.md` | `npc_zhuotianxiong` 武学栏 | 把“震天三十掌等待图鉴收录”改为引用 `sk_zhentiansanshizhang`，同时保留名称 **（待考）** |
| `docs/design/story/11-yuanyang.md` | 武学引用边界与末尾声明 | 增列 `skills-bulu-11-yuanyang.md`，把“本文不新增 / 不收录卓掌法”的旧表述改为故事只引用补录图鉴；故事本身仍不定义武学 |
| `docs/00-canon.md`、`docs/design/05-martial-arts-system.md`、相关总表 / 资产预算 | 正式武学总量 | NXfix 汇总全部按书补录后更新 `51/169/459/459=1,138`；本任务贡献地阶 +1，不能单独代表最终增量 |
| 构建数据 / Boss 行动表 | 卓天雄三场、太岳四侠 | 三场卓天雄用 `sk_zhentiansanshizhang` 替换 `sk_daneichangquan`；太岳装备桥未闭合时阻止非法装配 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 映射表

| 书界 | 首领 | 原替补 | 处理结果 / 类型 | 所在图鉴 | 品阶 |
|---|---|---|---|---|---:|
| 11 鸳鸯 | 卓天雄·枣林 | `sk_daneichangquan` | `sk_zhentiansanshizhang`（新增） | `skills-bulu-11-yuanyang.md` §1.1 | 7 地下 |
| 11 鸳鸯 | 卓天雄·紫竹庵 | `sk_daneichangquan` | `sk_zhentiansanshizhang`（新增） | `skills-bulu-11-yuanyang.md` §1.1 | 7 地下 |
| 11 鸳鸯 | 终局卓天雄 | `sk_daneichangquan` | `sk_zhentiansanshizhang`（新增） | `skills-bulu-11-yuanyang.md` §1.1 | 7 地下 |
| 11 鸳鸯 | 太岳四侠（每人） | 石碑武学 / 装备桥待闭合 | `sk_taiyueshibeishou`（复用；无需来源扩展） | `skills-kangxi.md` §9.11 / §16A.3 | 6 玄上 |

### 7.2 新增武学清单

| 武学 | 原著 / 原创判定 | 绝招数 | 外放招式数 | 习得途径 |
|---|---|---:|---:|---|
| `sk_zhentiansanshizhang` 震天三十掌 | 人物名录已有此名称但版本依据 **（待考）**；五个招名、数值、路线、被动和学习事件均 **（原创扩展）** | 1 | 0 | 卓存活 + `q_11_side_08` 释放具结 + R3 后亲授至 10 重【建议值】；观摩至 6 重 |

### 7.3 来源扩展登记

- 无。`sk_taiyueshibeishou.sourceChapters` 已含 `ch11_yuanyang`；新掌法本身登记 `[ch11_yuanyang]`，不需要扩展既有武学来源。

### 7.4 跨书界待替换

- 无。本任务两个缺口都不属于主书界表中需等待其他书界补录的人物 / 门派。

### 7.5 逐单位轮数

| 单位 | 替换前 | 替换后 | 耐久倍率 | 结论 |
|---|---:|---:|---:|---|
| 卓天雄·枣林 | 15.70 | `15.6979728595≈15.70` | `1.00×1.00` | Boss 12–25 内 |
| 卓天雄·紫竹庵 | 15.70 | `15.6979728595≈15.70` | `1.00×1.00` | Boss 12–25 内 |
| 终局卓天雄 | 16.23 | `16.2258180196≈16.23` | `1.00×1.00` | Boss 12–25 内 |
| 太岳四侠（每人） | 7.03 | `7.0255648258≈7.03` | `1.00×1.00` | 精英 6–10 内；武学未更换 |

说明：`boss_pacing.py` 只消费主运七参、周天和耐久，不读取外功名称；所以以新掌法替换长拳后数值不变。这不是跳过复算，以上小数为本轮实跑结果。

### 7.6 未能补的缺口及原因

- 武学缺口已全部处理：卓天雄新增 1 门，太岳石碑手复用 1 门。
- 尚未闭合的是装备兼容而非武学：`eq_changchangfengshibei` 的定义归 `design/10`，不在本任务写权限内。

### 7.7 需作者确认的条目

- ⚠️ “震天三十掌”是否为指定版本原著正式名称，以及是否确指一整门掌法。
- ⚠️ 个人传承满层条件是否采用“卓存活 + 释放具结 + R3”；本版已给默认值继续完成。
- ⚠️ 全局武学闭合总量如何吸收全部按书补录新增；本版不删除既有条目。

### 7.8 命令与内容自检

- ✅ `python3 tools/lint/check_ids.py --strict`：通过；仅显示既有 baseline `sk_babuganchan`，新增严格失败数 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：105 项通过。
- ✅ `python3 tools/lint/check_skill_catalogs.py --strict`：12 册图鉴 `errors=0`；本册地阶 1 门 / 正文绝招 1 / 路线绝招 1。
- ✅ `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-bulu-11-yuanyang.md`：与其他武学完全相同的绝招路线 0。
- ✅ `python3 tools/agents/check_undefined_in.py docs/design/chapters/11-yuanyang.md docs/design/catalog/skills-bulu-11-yuanyang.md`：未定义引用 0。
- ✅ `damage_sim.py --check`、`meridian_flow_sim.py --check`、`boss_pacing.py --check`、`projection_sim.py --check`：全部通过。
- ✅ 仅改任务授权的三个路径；未改现有门派图鉴、基准或 `TODO.md`，未执行改变仓库状态的 git 命令。
- ✅ 长补丁均控制在约 150 行内；目录完整，表格与代码围栏闭合，`git diff --check` 通过，无 `TODO` / “此处省略” / “待补充”占位。

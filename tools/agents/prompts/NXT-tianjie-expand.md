# 本任务：天阶扩容——为顶尖人物补具名天阶主运，并登记作者三项决定

作者的三项决定（原文照录，不要改写）：

> 天阶封闭名单：扩容
> 音功：基础不算外放（音波），但内力深厚对音波的控制强，能量大，所以是外放
> 大手印的跃击：掌风算外放

## 背景

- **原有规则**：天阶武学原为 51 门封闭名录（`docs/decisions/author-requirements.md`、基准 §13）。
- **NXB01 已先行扩容**：新增 3 门天阶内功，均在 `skills-bulu-01-tianlong.md`：
  - 段氏一阳诀 `sk_duanshiyangjue`，天中 11；
  - 降龙行功 `sk_xianglongxinggong`，天上 12；
  - 天山六阳心法 `sk_tianshanliuyangxinfa`，天中 11。

  它的提案 NXB01-P01 为 51 → 54。
- **其他书界守闭集、按地位下限兜底**：
  - 岳不群（10）：NXB05 D05-B09。华山最高内功紫霞神功只有 9。
  - 射雕黄药师（10）、神雕黄药师（11）、裘千仞（10）：NXB02 SB02-P01。桃花岛现有天阶武学是弹指神通、碧海潮生曲，都不是内功。
  - 玄冥二老（10）、波斯三使（10）：NXB04 D04-O13。乾坤大挪移是明教教主心法，非教主最多练到 8 重，也与原著"总教派人求取"的前提相悖，不得用作三使主运。

作者现已决定扩容。

## 要做的事

1. **基准**（`docs/00-canon.md`）：
   - §9 / §13 更新天阶总数与天上 / 天中 / 天下分布，写明"作者决定扩容（2026-09-28）"，按基准版本规则登记变更。
   - 核对各书界完整天阶池上限（高武 6–16 等）。新增武学若超出上限，调整上限，或登记为残承（先例 V11-28），二选一并说明理由。
   - 把 `design/catalog/skills-bulu-*.md` 登记为正式的武学定义源（NXB04 P01），若尚未登记。
2. **补录新天阶主运**。这些武学都要写明门派归属，并能按门派正常途径习得。卡片按 05 与 21 写全：
   - 名称：原著有名称的用原著名称，没有的标"（原创扩展）"。
   - 品阶、性质。
   - 招式与绝招：天下 2、天上 3；天中按 `docs/decisions/ultimate-counts-tianzhong-dizhong.md` 的判据取 2 或 3。解锁层 7 / 9 / 10。
   - 路线：逐招显式写出，满足以下要求：
     - 按 21 §4.3.1–§4.3.4 的叙事规则；
     - 满足硬约束；
     - 同门互异；
     - 不得与任何已有路线完全相同。
   - 调息档案 `txp_*` 与护体档位；外放按 21 §4.4.1 判定。

   各人物的安排：
   - **岳不群**：华山 10 品内功，写入 `skills-bulu-05-xiaoao.md`。
   - **黄药师**：桃花岛内功，写入 `skills-bulu-02-shediao.md`（主书界 02）。射雕须与其他五绝同档（10）；神雕须保持作者定的"金轮 < 五绝 < 杨过"（现为金轮 11/8、黄药师 11/9、杨过 12/9）。可以是一门还是两门，你来定并说明理由。
   - **裘千仞**：铁掌帮 10 品内功，写入 `skills-bulu-02-shediao.md`。
   - **玄冥二老**：玄冥一系 10 品内功，写入 `skills-bulu-04-yitian.md`。
   - **波斯三使**：波斯总教 10 品内功，写入 `skills-bulu-04-yitian.md`。
3. **替换兜底**：在 `docs/design/chapters/02-shediao.md`、`03-shendiao.md`、`04-yitian.md`、`05-xiaoao.md` 中，把上述人物的兜底主运换成新武学。
   - 按 21 §11.9 重算七项参数，顶尖人物不得低于地位下限。
   - 用 `tools/balance/boss_pacing.py` 重估轮数；超窗的按 §11.9.2 调血量 / 防御倍率，不压经脉。
   - 去掉"受天阶闭集约束 / 待补专属"等缺口措辞，解除相应的构建阻断。
4. **裁定表**：把新增的天中武学，以及 NXB01 的两门天中武学，按判据登记进 `docs/decisions/ultimate-counts-tianzhong-dizhong.md`。
5. **21 §4.4.1 外放判据**：写入另两项作者决定。
   - **音功**：基础音波不算外放；以深厚内力驱动、对音波控制强的音功算外放。写成可执行的口径，推荐做法是：这类音功招式标 `projection:true`，但外放加持只在外放 1 档及以上生效，0 档按普通音波处理，不享外放威力曲线与范围扩张。另列出判为外放与判为不外放的音功示例，如狮子吼、碧海潮生曲、七弦无形剑、笑傲江湖曲、穿云啸、金笛法等。
   - **大手印跃击**：掌风算外放。
   - **本任务不改门派图鉴的逐招标记**，由收尾任务 NXfix 按新口径统一改。在报告中列出需要改动的招式清单：门派图鉴与补录图鉴中的音功、大手印跃击。
6. **作者需求**：在 `docs/decisions/author-requirements.md` 登记这三项决定，原文照录并写明落实位置。

检查：以下命令必须通过，每次写入不超过约 150 行。
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/lint/check_skill_catalogs.py --strict`
- `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-bulu-02-shediao.md docs/design/catalog/skills-bulu-04-yitian.md docs/design/catalog/skills-bulu-05-xiaoao.md`
- `python3 tools/agents/check_undefined_in.py`，参数为以上三册与四部书界
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/balance/projection_sim.py --check`

## 报告

第 7 节写：
- 天阶总数与分布：改前 / 改后；
- 各书界天阶池的处理；
- 新增武学清单：ID、名称、品阶、门派、绝招数、习得途径；
- 各人物主运与轮数：替换前 / 后；
- 音功与大手印的新口径摘要，以及交给 NXfix 的逐招改标清单；
- 需作者确认的条目。

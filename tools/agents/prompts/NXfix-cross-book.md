# 本任务：首领武学补录收尾（来源扩展落实、跨书界替换、补录图鉴互查）

## 背景

NXB01–NXB14 已按"每本书一个任务"完成首领所缺武学的补录。
- 新增武学写在 `docs/design/catalog/skills-bulu-NN-*.md`。
- 书界配装已替换。

为避免并行冲突，它们都没有改门派图鉴，并留下两类待办：
- **来源扩展登记**：已有武学的可得书界需要加入某书界。
- **跨书界待替换**：本书首领需要的武学由另一本书（主书界）补录，替补暂留，标"待书界 NN 补录"。

逐本读 `tools/agents/reports/NXB01.md` … `NXB14.md` 的第 7 节，以及各补录图鉴的"来源扩展登记"表。

## 要做的事

1. **落实来源扩展**：把各补录图鉴"来源扩展登记"表中的条目，落实到对应门派图鉴的武学卡上（可得书界加入该书界，写明依据）。落实后，去掉书界配装中的"（来源扩展待登记）"标注，并在登记表中标"已落实"。
2. **跨书界替换**：按主书界任务的映射表，替换"待书界 NN 补录"的替补。替换后按 21 §11.9 重算七项参数，用 `tools/balance/boss_pacing.py` 重估轮数；超窗的，按 §11.9.2 调整血量 / 防御倍率。
3. **补录图鉴互查**：
   - 各本补录图鉴之间不得有同一武学重复补录。同门同类且名称或招式高度相近的，合并为一门，并更新引用。
   - 路线不得与任何其他武学完全相同。用 `--diversity-strict` 全量检查，有冲突就改写。
   - 列出合并与改写的清单。
4. **裁定表补登**：各补录图鉴新增的天中 / 地中武学，按 `docs/decisions/ultimate-counts-tianzhong-dizhong.md` 的判据与评分细则逐门裁定并登记进裁定表（`check_skill_catalogs.py` 对未入表的会报提示），裁定数与卡上的绝招数一致；不一致的改卡。
5. **各本书报告点名的书界小问题**（在本书书界文档内修正）：
   - 雪山（NXB14）：§12.4 / §12.6 写明 B06 的整场总耐久 `round(150,048×0.75)=112,536`，两波援军都计入其中（与 B05 写法一致）；§8.8 B06 行"完整 7 品主运"改为现行 8 品；B02 左右童量化"保绳路"等非击杀目标的进度，或改按精英遭遇结算。
   - 书剑（NXB12）：陈家洛在 `13-feihu.md` 中的盟友快照改为继承新主运 `sk_tianchishengong`；补录图鉴中 `sk_tianchishengong` 的 `sect` 字段与同为袁士霄传承的 `sk_baihuacuo`（`skills-qianlong.md`，`sect_honghuahui`）统一写法。
   - 神雕（NXB03）：重阳七星阵首的 ≥9 外功改用已有的 `sk_tiangang` 天罡北斗阵（`skills-daojia.md`，天下 10，全真，原生书界含神雕）；七星阵首、裘千尺、黄药师（11 品）的主运按 NXB02 的补录替换；核对霍都主运（阳）与雪山铁扇（阴，沿用 `sk_huodushanfa` 的性质）的相性惩罚（05 §5.3 的 −12%）是否有意为之，不合理就调整性质或在书界写明。
   - 若 NXB02 未覆盖神雕所需的全真 9 品主运、铁掌 9 品主运与 ≥9 外功、桃花岛 11 品主运，在 `skills-bulu-02-shediao.md` 补录（按门派归属、正常习得），再替换神雕书界的替补，解除正式构建阻断。
   - 其余各本 NXB 报告第 4 节"留给协调者"的书界与补录图鉴内的问题，逐条处理。
6. **索引**：在各门派图鉴的开头或索引处，加一行"本门补录武学见 `skills-bulu-NN-*.md`"的指引（只在确有补录的门派加）。
7. **版本行**：各改动文件的版本行追加"首领武学补录收尾（{{date}}）"。只改相关段落，不删无关内容。

## 检查

以下各项必须通过，每次写入不超过约 150 行：
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/balance/projection_sim.py --check`

## 报告

第 7 节写：
- 来源扩展落实数（逐条）；
- 跨书界替换数（逐条），以及轮数替换前后对比；
- 补录图鉴合并 / 改写清单；
- 仍未补的缺口总表；
- 需作者确认的条目汇总。

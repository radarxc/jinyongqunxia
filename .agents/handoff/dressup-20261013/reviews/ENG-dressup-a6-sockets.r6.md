VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点的改动均位于允许路径内，未改运行时、依赖、门禁阈值或 `node_modules`；`git diff --check` 通过。
- 三套模板插槽：通过 —— 非握持插槽世界帧、握持帧正交性与刃向检查已实现；三次 `export_skeleton.py --check` 均退出 0。逐键复核确认三套 `skeleton.json` 删除 `sockets` 后与基点完全相同，所有 `socket.pos` 逐值不变。
- 护手峰判定：不通过 —— [normalize_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/normalize_prop.py:219) 仍实现旧的 5%～30% 窗口，并在第 231 行用 bin 中心作为峰位置，第 254–256 行又以 bin 区间与 30% 相交作为合格条件。最终补充明确要求按峰的实际位置使用 5%～35%，不能按 bin 中心或区间相交。
- 青锋剑 `fit.json`：不通过 —— [fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/assets/default/model3d/dressup/props/item_qingfeng_sword/fit.json:21) 只有 `diagnostics.handleEndEvidence`，缺少明确要求的顶层 `handleDetection`。当前选中的峰以 bin 中心计为 31.25%，却依靠 `[30%,32.5%]` 与旧 30% 边界相交而通过。
- 护手峰测试：不通过 —— [tests_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/tests_prop.py:282) 明确断言跨过 30% 的 bin 应合格，固化了错误规则；真实青锋剑测试第 450 行也只检查区间下界 `<=30%`，没有断言顶层 `handleDetection`、峰的实际位置以及握点确实位于护手外侧的短柄段。
- 鞘身划分与 socket 结果：不通过 —— [check_sockets.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/check_sockets.py:189) 继续消费上述不合规的 `handleEndEvidence.chosen.fraction`。产物只记录被测鞘身 `4219` 个顶点，未同时记录柄段和鞘身两侧的划分顶点数。因此当前 `0.247557%` 深穿结果需在正确峰位置与划分后重算。严格最近三角距离实现本身符合要求。
- 斗笠与玉佩：通过 —— 斗笠方向、3 mm 颅骨间隙和 72 帧 head 区零入体闭合；玉佩沿 `normalLocal` 外移且 72 帧零入体。报告也记录了帽檐相对眉弓高度。
- 构建测试修改范围：不通过 —— 任务只允许修改“indexes template metadata and prop sockets…”用例；该用例已正确从 manifest、fit 和 GLB 推导插槽与统计，但 [dressup-assets.test.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/apps/game/build/dressup-assets.test.ts:300) 还修改了另一个 “validates real A3 fit format…” 用例，以 `guard or legacy` 绕过原断言，违反“其余用例不动”。
- 报告：不通过 —— 结构和行数合格，但 [报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/agents/reports/ENG-dressup-a6-sockets.md:16) 把“bin 与 30% 边界相交”写成合格依据，与最后的 5%～35% 实际峰位置裁定冲突。
- 审核复跑：三套 `export_skeleton.py --check` 通过。Python 全测试在本次只读沙箱中因无法创建临时目录而不能完整复跑；这不是本次 FAIL 的依据，上述静态契约违例已足以阻断合入。

## 返修说明

1. 重写护手峰窗口：以几何峰的实际轴向位置判定是否处于距任一端 5%～35%，不得用 bin 中心或“bin 与窗口相交”；找到合格峰后禁止回退窄端规则。
2. 在青锋剑 `fit.json` 顶层写 `handleDetection`，至少包含 `method: guard-peak`、实际峰位置、所选柄端及护手外侧为短侧的证据；可保留现有 diagnostics 作为附加审计信息。
3. 更新测试：删除“跨过 30% 即合格”的断言，覆盖 `<5%`、`5%～35%`、`>35%`；真实青锋剑必须断言顶层 `handleDetection.method == guard-peak`、柄端为护手短侧、握点位于柄段。
4. 让 `_weapon_mask` 从修正后的实际护手位置和所选柄端划分柄段/鞘身，在 `sockets_check.json` 同时记录总数、柄段数、鞘身数。
5. 用修正后的结果重跑青锋剑 normalize → textures → pack → validate → ingest，并重跑三件道具的 `check_sockets`；刷新 fit/report/manifest/sockets_check 和报告中的深穿数字。
6. 还原 `dressup-assets.test.ts` 第 300–306 行对 A3 语义轴用例的修改；只保留任务指定的真实素材索引/加载用例内的动态期望值改造。
7. 重新执行全部验收命令，并修正报告中关于护手峰窗口、峰位置、划分计数及最终深穿结果的描述。

## 需作者确认

无。
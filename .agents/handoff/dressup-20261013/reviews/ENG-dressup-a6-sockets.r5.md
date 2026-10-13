VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 改动均位于允许路径；未改依赖、门禁、运行时、`common.py`、`glb_io.py` 或 `node_modules`。
- 三套模板骨架：通过 —— 三套 `export_skeleton.py --check` 均退出 0；删除 `sockets` 后与基点逐键一致，所有 socket `pos` 逐值不变，manifest 的 `skeletonSha` 与文件哈希一致。
- 斗笠与玉佩：通过 —— 斗笠记录 `liftMu=0.031280993`、间隙 3.000003 mm；玉佩记录 `offsetMm=17.307838`；两件 GLB 与基点逐字节一致，72 帧结果均无入体顶点。
- 青锋剑柄端识别：不通过 —— [normalize_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/normalize_prop.py:219) 找到的两个护手峰都指向 `high` 端，但因最强峰按 bin 中心算为距端 31.25%，回退成“窄端=柄”；最终 [fit.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/assets/default/model3d/dressup/props/item_qingfeng_sword/fit.json:21) 选择 `low` 端。这正是作者反馈“鞘尖比护手端更窄、会拿反”的已知错误。报告还显示握点距护手约 0.556 m，不能视为柄端已正确识别。
- 青锋剑动态门禁：不通过 —— [check_sockets.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/check_sockets.py:189) 使用上述护手候选划分鞘身；在柄端反向后，实际只检测了错误一侧的 3100 个顶点。因此 [sockets_check.json](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/assets/default/model3d/dressup/props/item_qingfeng_sword/sockets_check.json:57) 的 0.369624% 和 approved 结论不能证明真实鞘身通过。
- 真实素材构建测试：不通过 —— [dressup-assets.test.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/apps/game/build/dressup-assets.test.ts:542) 仍写死插槽数组，且第 569 行仍写死 `triangles: 221846`。这直接违反协调者 12:42/13:02“所有真实素材数字从 manifest/fit/report/GLB 推出”的补充要求。
- 回归测试：不通过 —— [tests_prop.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/model3d/dressup/tests_prop.py:411) 的真实青锋剑用例允许 `narrow-end-fallback`，并断言所有候选均超 30%，实际把错误产物固化为通过；它没有断言护手外侧为柄、握点位于短柄侧。
- 报告：不通过 —— [ENG-dressup-a6-sockets.md](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a6-sockets/tools/agents/reports/ENG-dressup-a6-sockets.md:16) 将错误回退写成已满足裁定，第 37 行又明确承认保留了硬编码三角数，不能作为如实完成报告。
- 门禁复核：部分通过 —— 三套骨架检查直接通过；本只读环境因无可写临时目录，无法独立复跑会创建临时文件的 Python/Vitest 全套测试，这不是本次 FAIL 的依据。

## 返修说明

1. 修正护手峰定位的量化边界：真实峰所在 bin 覆盖到距端 30% 边界时，应通过更细剖面、连续峰定位或按 bin 区间判定识别为有效护手峰，不能继续选窄鞘尖。真实青锋剑最终必须为 `method=guard-peak`、柄端为 `high`，握点位于护手外侧短柄段。
2. 用正确柄端重新执行青锋剑 `normalize_prop → textures → pack → validate → ingest`，保留 `realSizeM=0.9`、`slot=waist`、`socket=waistL`。
3. 修正 `_weapon_mask`，确保统计的是护手至鞘尾的完整鞘身，而非反向后的柄/剑穗侧；重新计算 35°及必要时的 25°～50°扫描，并更新 `fit.json`、`report.json`、`manifest.yaml`、GLB、`sockets_check.json`。
4. 加强真实资产测试：断言青锋剑实际采用护手峰、选择正确端、握点到护手距离落在短柄范围；保留“确实没有合格峰才回退窄端”的独立合成用例。
5. 在真实素材构建用例中，从 manifest/fit/report 或实读 GLB 推导插槽列表、模板高度、draw call/三角期望及是否应握拳，不得保留 `['chest','headTop','waistL']`、`221846` 等真实素材硬编码。
6. 重跑全部验收命令，并据新产物改写报告；删除对未完成补充要求的辩解性 ⚠️，记录正确柄端、握点到护手距离、完整鞘身顶点数和重算后的深穿比例。

## 需作者确认

无。
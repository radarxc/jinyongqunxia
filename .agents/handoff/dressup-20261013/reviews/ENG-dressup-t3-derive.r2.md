VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点仅新增任务允许的 16 个文件；未修改 `glb_io.py`、`common.py`、既有素材或其他仓库文件。
- `template_specs.json`：通过 —— 六个模板的 ID、性别、身高、髋高比、肩宽比和源模板均符合 `tech/10` §1.3。
- 脊柱链派生：不通过 —— [derive_template.py:32](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/derive_template.py:32) 的 `SPINE` 只有 `Spine / Spine1 / Spine2`，遗漏任务明确要求参与 `k_spine` 的 `Neck`。当前 small/tall 的 Neck 子骨 translation 与源完全相同，不是规定的四骨脊柱链派生。
- 腿链与根节点处理：不通过 —— [derive_template.py:98](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/derive_template.py:98) 额外缩放了不属于 `UpLeg / Leg / Foot` 腿链的 Hips 根 translation，又在第 99、222–233、298 行加入优化出来的全局 `rootOffsetYMu`。
- 动画轨道：不通过 —— [derive_template.py:160](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/derive_template.py:160) 实际写出 `track × k_leg + rootOffsetYMu`，而任务契约要求 Hips translation 轨道按 `k_leg` 缩放。实测 small 三条轨额外加 `+0.02769252 mu`，tall 额外加 `-0.03480833 mu`。
- 位移门禁：不通过 —— 上述全局偏移被用于最小化报告中的顶点位移，使报告得到 `0.02404 / 0.02851 mu`；但产物脚底相对源 y=0 已偏移 `+0.02350 / -0.02681 mu`，即约 `+39.80 / -45.41 mm`。按运行时契约恢复脚底 y=0 后，最大位移为 `0.04738 / 0.05532 mu`，两者都超过 `0.04 mu`。当前门禁可被整体平移规避。
- 实测比例与颈环：通过 —— small/tall 身高比分别为 `0.95180721 / 1.03614455`，髋比 `0.54500001 / 0.58500002`，肩比 `0.15000000 / 0.16000000`；颈环最大米制差分别约 `1.944 / 1.357 mm`，均满足相应阈值。
- LBS、IBM、拓扑与侧车：通过 —— 两套均为 105,082 顶点、196,022 三角、65 骨；indices、UV、JOINTS/WEIGHTS、骨名顺序保持一致，IBM 已重算且 rest=bind 为 `6.25e-8`，`_REGION` 为 u8，SHA 与 manifest/sidecar 一致，无 NaN。
- 补充 GLB 要点：按本任务专门契约处理 —— IBM 必须重算而不能与源逐字节相同；材质和贴图要求沿用 T2 源，后续阶段 C 再转 unlit，因此通用装备产物规则不应用于这两份模板体。
- 测试：不通过 —— [tests_derive.py:59](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/model3d/dressup/tests_derive.py:59) 未断言 Neck 按 `k_spine` 缩放；第 82 行只测试无 offset 的 `track × k_leg`，没有覆盖实际派生路径增加 offset 的行为；真实产物测试也未核对脚底坐标或在规范坐标系重算位移。
- 检查命令：通过（执行证据） —— 第 4 次执行日志记录 `tests_derive.py` 6/6、冻结安装及 `pnpm check` 全绿（178 文件、1,272 tests）；本次只读复核的两套 `normalize_rig --check` 和两套 `export_skeleton --check` 均退出 0。
- 报告：不通过 —— 七节齐全且 32 行，但 [报告第 14 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t3-derive/tools/agents/reports/ENG-dressup-t3-derive.md:14) 把“Neck 不缩放”和额外根偏移描述为符合契约，第 19 行又写“无实现偏离”，没有披露脚底偏移及规范坐标下位移超限。

## 返修说明

1. 将 `Neck` 纳入 `k_spine` 的子骨 translation 缩放；保持 `Head` translation 和颈环截面尺寸不缩放。补测试明确断言 `Neck × k_spine`、`Head` 不变。
2. Hips 动画必须严格满足 `output = source × k_leg`，不得额外叠加 `rootOffsetYMu`；同时不要把 Hips 根 translation 当成腿链骨长。
3. 重新定义并实现不会被整体平移规避的位移门禁：在统一脚底 y=0 的规范坐标系比较源与派生顶点。若规定比例与 `0.04 mu` 无法同时满足，应如实登记契约冲突，不能通过平移隐藏。
4. 从当前 `tpl_f_medium` 重新生成 small/tall 的 body、derive、skeleton、regions、skull profile 和 manifest，更新全部 SHA。
5. 测试增加 Neck、Hips 根轨精确缩放、脚底基准和规范坐标最大位移断言；随后重跑题列全部检查与 `pnpm check`。
6. 报告更新实际链系数、脚底坐标、规范坐标最大位移及任何契约偏离，不再声明“无实现偏离”。

## 需作者确认

无。
VERDICT: FAIL

## 逐项结论

- 写集边界：通过 —— 当前新增文件均位于声明的写集内，根目录未发现遗留调试脚本，也未发现已跟踪的写集外改动。
- 黄蓉头部完整性：通过 —— 正、侧、背视图中脸、下巴、耳坠、发髻、发饰及后背长发均已保留，模板光头也已正确隐藏。
- 第 5 轮颈侧残片：不通过 —— [preview.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/preview.png) 的正面和侧面颈部放大图仍有明显白/米色锯齿状结构从脖子两侧伸出，背面也有浅色环线；[self_check_preview.png](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/assets/default/model3d/dressup/heads/npc_huangrong/self_check_preview.png) 没有这些结构，证明它们来自 `head.glb`，不是模板身体。
- 衣领剔除算法：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:111) 仍以 RGB 暖色和明暗分类皮肤/头发；[选面逻辑](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:223) 未实现“相对脸/颈皮肤均值的 Lab ΔE 阈值”，也没有“半径超过同高度皮肤截面 1.15 倍的非头发三角一律剔除”。这正是白色滚边残留的原因。
- 颈桥颜色：不通过 —— [颈桥生成](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:285) 给六圈全部重复同一组 `upper_uv`，没有从上沿逐角度实色向 `skinTint` 后模板颈色渐变；`report.json` 也没有第 5 轮要求的颈桥上沿两侧 ΔE2000 数据。
- 颈桥几何与动作接缝：通过 —— `report.json` 记录六圈×64点，底圈吸附和72帧最大位差均为约 `0.0000498 mm`，颈桥穿入率为0；缩放 `0.915733 → 0.92`、下巴嘴角比例保持1.0。
- 肤色总平均值：通过但不足以覆盖最终要求 —— 全局 `skinTint`、作用前后平均 ΔE 已真实计算；但它不能代替缺失的颈桥上沿左右接色检查。
- 长发穿入报告：不通过 —— 已记录最坏值31.037%、`run`第6帧及坐标，但任务报告只写“长发穿肩背”，没有明确区分后背长发/肩前发，也未报告穿入的模板身体区域。
- GLB 契约：不通过 —— skin joints顺序和IBM与模板数值完全一致，且为单mesh、单primitive、unlit、仅baseColor；但 primitive 属性只有 `POSITION/NORMAL/TEXCOORD_0/JOINTS_0/WEIGHTS_0`，缺少审核要求的 u8 SCALAR `_REGION`。
- 统计和清单：通过 —— `head.glb` 实读为10,667顶点、17,322三角、1,462,404字节，与 `report.json` 和 `manifest.yaml` 一致；清单内文件哈希和字节数也与磁盘一致。
- 合成测试：不通过 —— [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/tests_head.py:90) 虽构造了高立领，但该用例只调用颈桥生成，没有端到端切割并断言滚边被排除；端到端用例反而使用 `high_collar=False`。也没有覆盖1.15倍半径规则、Lab阈值或颈桥颜色渐变。
- `gateLevel`：不通过 —— [门禁判断](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-d1-cuthead/tools/model3d/dressup/cut_head.py:591) 未纳入滚边残片、桥上沿ΔE和 `_REGION`，因此当前产物标记 `pass` 缺少数据支撑；任务报告中“高立领残片剔除”“连续肤色”的表述也与图片和实现不符。
- 检查命令证据：按任务特例处理 —— 报告记录 `tests_head.py`、`selftest.py` 和冻结锁安装通过；`pnpm check` 重跑后仅剩已知 `actor-runtime` JIT采样失败，符合“不改该测试、如实记录”的专项裁定。本次审核因只读约束未重跑会创建临时文件的测试。

## 返修说明

1. 在切面以上、下巴以下的颈段，以脸/颈皮肤均值做 Lab ΔE 分类并写明阈值；对非头发、非头饰三角应用同高度皮肤截面半径 `1.15×` 外圈剔除，重新生成后颈侧不得再有白色滚边或项圈。
2. 颈桥上沿逐角度采样真实皮肤颜色，向下渐变到 `skinTint` 后的模板颈色；在 `report.json` 中增加上沿左右两侧的真实 ΔE2000，并纳入 `<3` 门禁。
3. 给 `head.glb` 补 u8 SCALAR `_REGION`，保持模板 joints顺序和IBM不变。
4. 扩充高立领测试：使用颜色接近皮肤的浅色外圈，真正端到端切头，断言1.15倍外圈滚边被删除、桥底同位同权、颜色渐变及上沿ΔE合格。
5. 重新实跑黄蓉，更新全部产物、哈希、统计和报告；质检图必须确认颈部只剩皮肤与头发。补充说明最坏穿入属于哪段头发以及穿入哪个身体区域。
6. 不要修改 `actor-runtime.test.ts`、运行时或其他写集外文件。

## 需作者确认

无
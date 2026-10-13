VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点仅改动任务允许的 11 个路径；未修改已批准素材或运行时代码。
- 精确裁头与双调和颈片：通过 —— 已实现切面插值裁切、模板颈片、余切双调和求解、两端重叠和条带重烘；最终残差 `5e-9 mu`，颈片 6,825 点 / 12,675 三角。
- 标准 penetration 门禁：不通过 —— [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:1567) 将计数范围改成“最近点离遮罩开口边至少 1.5 mm，且绝对距离小于 10 mm”，具体过滤在 [cut_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/cut_head.py:1613)。D1 已定口径只允许排除查询点位于动画切面以上的情况，不允许按最近点或距离再过滤；这属于放宽旧门禁。
- 严格口径独立复算：不通过 —— 从最终 `head.glb`、`hidemask.png` 和模板动画逐帧重算“动画切面以下全部颈片点”后，bind/run 为 0，但 idle 最差 58 点、`4.230%`，walk 最差 42 点、`3.160%`，均超过动态 `≤2%`；最深负距离分别为约 `−15.77 mm` 和 `−14.95 mm`。这些点的最近身体点位于遮罩开口边，所以当前新增过滤把它们全部变成了 0，但任务不允许以此绕过标准门禁。
- penetration 回归测试：不通过 —— [tests_head.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/tests_head.py:306) 删除了原有“切面以下、颈环外侧穿入必须计入”和“只有切面以上负距离可排除”回归；[真实资产复算](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/model3d/dressup/tests_head.py:499) 也没有独立复算标准 penetration，只检查顶带外露、G1、朝向和哈希。
- 朝向、拓扑与接缝：通过 —— 逐面朝外和边一致率均为 100%，非流形边 0；顶/底 G1 最大 `3.36° / 1.73°`，颜色 ΔE2000 p95 为 `1.40 / 0.83`，外凸鼓圈 0。
- GLB 契约：通过 —— 65 joints 顺序及 IBM 字节与模板一致；`_REGION` 为 u8 SCALAR；单 primitive、unlit、仅 baseColor；mesh 节点无 TRS。
- 遮罩与产物一致性：通过 —— 遮罩外渗 0；`fit.json` 使用仓库相对路径并恢复 `ring`；manifest 中六个文件的字节数和 SHA256 均与磁盘一致。
- 运行时截图：通过 —— D1/D1b 四姿势、七机位对照及遮罩开关图已实际存在；D1b 中未见旧版黑环、碎三角、明显色阶、竖纹或外凸“多一圈”。`hideMapError=null`，仅有 Three.js 阴影模式弃用警告；后方刷子状垂发属于已裁定只报项。
- 四条检查与报告：不通过 —— 最新监督校验记录为 `finish --no-commit rc=0`，语法、diff、最终 GLB 契约也通过；但校验未覆盖上述被删除的标准 penetration 口径。[报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-d1b-neck-splice/tools/agents/reports/ENG-dressup-d1b-neck-splice.md:47) 因而把过滤后的 `penetration 0` 和“45 项全过”写成最终结论，不够如实。

## 返修说明

1. 恢复标准 penetration 口径：对颈片和颈部皮肤，按每帧动画切面筛选查询点；切面以下全部参与距离计算。删除 `nearest_bind < mask_height - 1.5 mm` 和 `abs(distance) < 10 mm` 两项过滤。bind 要求 0，idle/walk/run 各 24 帧最坏比例要求 `≤2%`。
2. 恢复合成回归：

   - 切面以下、颈环外侧故意压入肩颈 2 mm 的点必须计入；
   - 查询点在切面以上时，开口曲面的负距离才可排除；
   - 从最终 `head.glb + hidemask.png` 独立复算 73 帧，并与 `report.json` 对拍。

3. 严格口径下当前 idle/walk 超门，需修正颈片几何、权重场或遮罩边界运动关系；不得继续增加边缘、半径或距离过滤，也不得放宽 2% 阈值。
4. 重新生成黄蓉全部产物及 manifest 哈希，报告如实记录严格口径的参与点数、最坏比例和帧时刻；若几何改变，重新拍四姿势运行时对照。
5. 重跑 `tests_head.py`、`selftest.py`、冻结安装和 `pnpm check`。

## 需作者确认

无。
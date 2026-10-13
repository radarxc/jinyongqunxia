# ENG-dressup-e2c-skinning 报告 · 3D 纸娃娃换装 · E2c · 劲装动画穿插（手臂外展 + 局部平滑姿势蒙皮）
## 1. 摘要
- 按作者 10-10 决定实现：衣物 fit.json 声明 `poseOffset.armAbductionDeg`（劲装 / 布衣 6°），运行时 actor、validate 动态穿透 / 破洞、bake_hide_mask 动作采样、fit_garment 姿势蒙皮同一口径外展（公共函数 `validate.apply_arm_abduction`）；头、道具与无该字段的衣物行为不变。
- `fit_garment.py --pose-skin` 在已贴合的交付网格上按 72 帧重解连续权重（替换 traex r1 的逐点 ICM）：固定目标的高斯-牛顿 + LM 线搜索（17:05 补充裁定），撕裂边按 14:30 裁定第 2 条取 **72 帧伸长 > 8 mm** 只增不减地加强平滑（`POSE_SKIN_TEAR_MM = 8.0`，`tests_garment` 断言六份 fit 的 `params.tearMm` 等于该常量且为 8）；穿入铰链权 20 → 40（8 mm 阈值下 20 时 walk 上臂顶出袖子，见第 3 节）。
- r2 返修：按 8 mm 撕裂阈值、穿入权 40 重解三体型，重出劲装 / 布衣全部 GLB、fit、遮罩、report、manifest、贴图层与截图；六份三项门全过，去掉 experimental。
## 2. 产出
- `validate.py`：`arm_abduction_deg` / `apply_arm_abduction`，`_world_matrices(..., arm_abduction)`；动态穿透与破洞按 fit 声明角度采样，仅外展非 0 时在这些检查里附 `armAbductionDeg`。`bake_hide_mask.py`：动作采样与 24 帧破洞安全姿势用同一角度，`hideMask.armAbductionDeg` 留痕。
- `fit_garment.py`：`--pose-skin` 模式（`pose_skin_file` / `pose_skin_weights` / `_pose_skin_solve` / `_write_pose_accessors`），fit.json 写 `poseOffset` 与 `weights.poseSkin`（参数、各阶段近似指标、收尾、输入几何哈希、所用遮罩哈希）。
- `packages/render/src/dressup`：`types.ts`（`DressupPoseOffset`、`PoseOffsetRange`、可选 `stats.armAbductionDeg`）；`actor.ts`（装备时取已装备衣物最大外展角，`mixer.update` 后把左右 Arm 绕模型 +Z 转、先还原上一帧动作值、不逐帧分配）；`actor-pose-offset.test.ts` 4 项。
- `tests_garment.py` +3：外展数学（合成节点树 + 真实模板采样）、合成求解（撕裂 / 局部 / 碰撞 / 遮罩，三种去功能对照均失败）、六份交付件 72 帧动态拓扑门（含 tearMm 回归断言）。
- 素材：`eq_jinzhuang`、`eq_buyi` 三体型 GLB / fit / hidemask / report / holes_preview / manifest，`eq_buyi_tex` 贴图层与 layer.json，`eq_jinzhuang/shots/e2c.tpl_f_*.jpg`（主干 E2b vs E2c × idle / walk / run 两帧 × 正 / 侧 / 背）。
## 3. 关键结论与数值（交付件实测，主干 E2b → E2c；布衣与劲装几何 / 权重 / 遮罩相同，逐项相同）
| 体型 | 可见穿透 idle / walk / run（门 ≤ 2%） | holes bind / idle / walk / run（门 ≤ 0.05%） | 72 帧最大边伸长（门 ≤ 30 mm） | 塌缩三角（只报，6°） |
|---|---|---|---|---|
| medium | 4.23 / 2.76 / 1.00% → 0.28 / 0.19 / 0.68% | 0 / 0.028 / 0.017 / 0.096% → 0 / 0 / 0 / 0.013% | 101.6 → 27.7 mm | 112 → 297 |
| tall | 4.58 / 2.76 / 0.76% → 0.45 / 0.05 / 0.32% | 0 / 0.014 / 0.043 / 0.063% → 0 / 0 / 0 / 0.016% | 93.8 → 27.9 mm | 113 → 279 |
| small | 4.13 / 4.15 / 1.29% → 0.56 / 0.68 / 1.26% | 0 / 0.014 / 0.017 / 0.059% → 0 / 0 / 0 / 0.012% | 95.3 → 27.7 mm | 137 → 338 |
- bind 可见穿透三体型均 0；重烘遮罩覆盖 39–41%（E2b 18%）。E2c traex 版（r1）72 帧伸长 659 mm。每体型求解 4.5–6.9 分钟，重烘遮罩约 7 分钟。
- 撕裂阈值 15 → 8 mm 后（穿入权仍 20）medium walk 可见穿透 0.32 → 0.69%，5182 实拍 walk 0.35 左上臂顶出袖子；穿入权试 20 / 40 / 60 / 80 / 120（medium）与 20 / 40 / 60（tall / small），求解不单调，40 在三体型上都比 20 好（72 帧 > 3 mm 深穿入点 medium 195 → 143、tall 120 → 101、small 294 → 257），取 40。代价：small run 可见穿透 0.87 → 1.26%（门内）。
- 模板倒置面两条路（只做只读实验，不实施；三模板倒置面 26 / 28 / 31 个）。路 A = 翻正 `templates/tpl_f_*/body.glb` 倒置面；路 B = A1 符号改角度加权伪法向（`fit_garment.PseudoNormalSign`）。按 validate 口径重算（bind + idle / walk / run 各 24 帧）：
  - 衣物（劲装三体型；布衣同几何）：两条路的可见 / 全部穿透与 holes 与现行逐位相同。
  - 头（穆念慈、黄蓉 × 三体型）：路 A 全部相同；路 B 可见穿透全部相同，bind 全部穿入（含遮罩隐藏区）各少 1 点（如穆念慈 medium 3828 → 3827）。holes 路 A 相同。
  - 道具（`check_sockets`，4 件）：龙泉剑、斗笠、玉佩三者相同；青锋剑（腰挂入鞘）路 A 相同，路 B 动画穿入 687 → 3 点（0.238% → 0.001%）、最深 −400.9 → −10.5 mm，均 approved 不变（现行的 −400 mm 是插值法向在远处判错符号）。
  - 哈希：路 A 改 3 个模板 body.glb → 3 份 skeleton.json、模板 manifest、直接引用模板的 19 份 fit（medium 11 / tall 4 / small 4）与全部 16 份 report（衣物 6、头 6、道具 4）须重跑；路 B 只改代码，模板与 fit 哈希不变，16 份 report 重跑后只有青锋剑的动画穿入数字会变。建议路 B，另起任务。
## 4. 开放问题（附默认值）
- 实拍仍可见的顶穿（均在三项门内，截图 `e2c.tpl_f_*.jpg`）：三体型 run 0.375 上臂顶出袖子一块；small walk 0.35 左上臂一小块；medium / tall walk 已无。原因是肩部"不撕"（8 mm 加强平滑）与上臂"不穿"在 LBS 下互相牵制，袖子近肩段权重偏躯干。默认接受，后续可加三角中心接触点、把过渡带放到腋下不可见处、提高袖子面数或对宽袖加大外展。
- 塌缩三角约 2.5–2.7 倍（腋下、胯折痕、上臂），按补充裁定只报；运行时未见捏褶。
- 剔除包围球未计外展：6° 时手外移约 7 cm，小于包围球余量（≥ 10%，全身件约 8.5 cm）；更大外展需 culling 采样带上 poseOffset（culling.ts 不在写集）。
- 工作区稀疏检出补了 `assets/default/character/female/ch00/threeview/*.png`（P3 retexture 只读立绘底板）。
## 5. 对基准的修改提案
- E2c-P1：tech/12 §2 P2 在 untangle 之后加 `fit_garment.py --pose-skin --arm-abduction-deg <角> --pose-skin-mask <上一版遮罩>` → 压缩 → 按外展重烘遮罩 → validate；P3 版型取 P2 产物。
- E2c-P2：72 帧动态拓扑门（伸长 ≤ 30 mm）进 tech/12 §1 V2；塌缩只报。
## 6. 需同步到其他文档
- `docs/tech/12-dressup-production.md` §1 V2、§2 P2 / P3（同第 5 节）；`packages/render/CLAUDE.md` 换装 API 节补 `fit.poseOffset.armAbductionDeg` 与 `stats.armAbductionDeg`。
## 7. 自检（执行代理本机实跑于 2026-10-10 晚、最终产物上，退出码均为 0）
- `python3 tools/model3d/dressup/tests_garment.py`：38/38 通过（含六份交付件 72 帧门：伸长 27.6–27.8 mm）；`tests_hidemask.py` 24 项 OK；`tests_variant.py` 6 项 OK；`selftest.py` 通过。
- `pnpm install --frozen-lockfile`：Already up to date；`pnpm check`：退出码 0（vitest 189 文件 1339 项通过，构建与包体预算通过）。
- ✅ 只写登记写集与本报告；未改门禁阈值、模板、依赖；未调用 Tripo。六份 validate level draft、零失败；`eq_buyi_tex/layer.json` 的 source / plate / basePlate 为仓库相对路径，source 哈希与交付 eq_buyi.glb 一致；`tests_garment` 重生成入库夹具 `_fixture_bodysuit` 时沿用上一版的耗时 / 内存统计（新增 `_keep_volatile_stats`，r3 意见），跑完全部检查后夹具相对基点 `git diff` 为空。

# TOOL-rig-clips 报告 · 动作原型 P6–P7 · CC0 动作片段导入、烘焙与投影指标（AR-29）

## 1. 摘要（3–6 行）
- 已实现无新增大依赖的 GLB/glTF 读取、UE66/Rigify53 映射、30/12 fps 骨向量烘焙、剑轴/事件和 schema。
- 从 Mesh2Motion 官方固定 commit 下载并核验 base/addon 两个 CC0 GLB；mocap 组未下载、未使用。
- 已入库 Walk、备选 Sword_Attack 两个合格原型、Sword_Regular_A 压力样本和 7 个备用片段，并产出八向指标/PNG。
- Walk 通过 Q4/Q5、Sword_Attack 通过 Q4/Q6；Sword_Regular_A 超过 Q4，作为失败证据保留、不应原样发布。

## 2. 产出（文件、行数、主要章节）
- 工具：`clip_import.py` 约 620 行、`clip_metrics.py` 328 行、`test_clip_import.py` 125 行；解析/映射/烘焙/指标/确定性/schema。
- 数据：`clip.schema.json` + 10 个 `clip_*.json` + 3 个 metrics JSON + 3 个 PNG；另有来源与复现说明。
- 文档：`docs/tech/09-character-rig.md` 仅在原末尾追加 §8（数据格式、映射、指标、许可、门禁、依赖）。

## 3. 关键结论与数值
- 片段均为 Mesh2Motion CC0：原型 `clip_walk` / `clip_sword_attack`；失败压力样本 `clip_sword_regular_a`；另有 7 个备用。
- 源 SHA-256：base `406eb0a8dc4ab366e623b79b6e3005a4951392e1bda78ae39c1099d31147733c`；addon `a0d64d555e0d492026b72d58bf8e16c5e86779295f9093e376dcc001915c2c95`。
- Walk（51 帧/1.667 s）：八向渲染最短缩放 ≥0.45；视图切换 0–1.20/s；踩滑最大 0.366 cm，Q4/Q5 通过。
- Sword_Attack（58 帧/1.917 s）：缩放 ≥0.45、切换 2.632–3.158/s、握点 ≤0.695 px、轴 ≤0.485°，Q4/Q6 通过。
- Sword_Regular_A：切换 8.571–12.857/s，Q4 失败；三张原型/压力条带均在 `assets/default/rig/clips/`（1440×300）。
- 必需 20 关节全映射；未消费 47 个源节点：锁骨、中间脊柱、其余指节、leaf 与容器节点，逐 clip 登记。

## 4. 开放问题（附默认值）
- Regular_A 如何过 Q4：原型默认改用已通过的 Sword_Attack；压力样本后续先降视图采样再清理姿势，不放宽 8 次/s。
- Rigify53 仅合成测试覆盖，未以 UAL1 实包复测；默认首次引入 UAL1 时跑完整 RIG-V11–V16。
- 沙箱不允许写共享 `.agents/coord/motion_src/`；本次原始 GLB 暂存 `/private/tmp`，默认后续按固定 URL 重下并核哈希。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增；沿用 tech/09 既有 RIG-P01/P02，AR-29 已授权本次动作原型。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `tech/02` / `CueApi`：ENG-12c-clip 实现 `hit/end` 单次表现回调，禁止回写玩法命中。
- `tech/03` / 性能门禁：播放器完成后补 100 人 P95、0 B/帧和三机实测；本任务未写运行时。
- `TODO.md` / AR-29：登记 P6–P7 完成及剑招 Q4 失败，交调度器处理。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 仅修改授权路径；未执行改变仓库状态的 git 命令；`git diff --check` 通过。
- ✅ 官方 CC0 来源、固定 URL、日期、文件名、字节数、SHA-256 和许可链接齐全；mocap/Mixamo/万代/SFU 均未用。
- ✅ 纯 Python glTF 2.0/GLB、两类映射、30/12 fps、剑轴、hit/end、schema 与 10 个片段齐全。
- ✅ 八向 JSON 指标与 PNG 条带齐全；缩短下限固定 0.45，Q4–Q6 如实判定。
- ✅ 解析、映射、拒绝缺关节/非白名单、JSON/PNG 确定性、半值整数化、schema 与指标测试覆盖；全量 unittest 33/33 通过。
- ⚠️ 压力样本 Sword_Regular_A 未过 Q4，Rigify53 未经 UAL1 实包复测；主原型已由通过的 Sword_Attack 兜底。

# ART-dressup-t2-tpl-f-medium 报告 · 3D 纸娃娃换装 · T2 · 女中等模板 tpl_f_medium 新正本（Tripo 生成 + 绑骨 + 动作 → 规范化 → 骨架帧，85 点，AR-104 / AR-105）
## 1. 摘要（3–6 行）
完成 AR-104 / AR-105 的女中等 1.66 m 模板：唯一一次单图 H3.1 生成、一次 Mixamo 绑骨、idle/walk/run、GLB 导出及全套本地后处理。
新 `body.glb` 已替换旧项目 `0e8cd219` 的过渡期正本，65 关节、rest=bind、+Z 和骨架帧门禁均通过，状态为 `candidate`。
Tripo 实扣 85 点（65+20），余额 17,495 → 17,410；未重试、未购买、未同意条款。
3D 臂角 23.63°、头身比 8.25 命中；髋高占比 0.5488 与 0.565 差 1.62 个百分点，按 §10.T 门限通过，仍交 T3 精确校正。

## 2. 产出（文件、行数、主要章节）
- `templates/tpl_f_medium/body.glb`：9,595,864 B；105,082 顶点 / 196,022 三角 / 65 joints；idle、walk、run。
- `skeleton.json` 61,936 B、`regions.npy` 105,210 B、`skull_profile.json` 4,002 B：85 点正本重导的骨架、17 区与颅骨表。
- `preview.png`：600×778 RGB、82,095 B；绑骨后 Tripo 正面封面，无水印。
- `manifest.yaml`：新项目/操作、实测参数、余额、输入 SHA、产物 SHA 与 T3/C 交接；本报告共 7 节且 ≤70 行。

## 3. 关键结论与数值
- Tripo 项目 `be15d34a-5d1e-409b-a0aa-c1a96446a267`；生成 `7b274dfc-6dfc-4b28-9947-3f9fd304cb7a`（约 95 s），绑骨 `39873f3c-82bf-4c4c-8e35-d4d95b3bbda2`（约 58 s），导出 `ba5f1071-6d4e-4c8c-89e2-3f66f85dcacb`。
- 动作 ID：idle `1766c700-f11c-4a9d-b861-1d5abb1d191e`、walk `20191347-5fbf-45ef-93f0-73f24301a1fb`、run `44c682ef-baa5-476d-915a-6a3ecf4fd58c`；均一次成功、0 点。
- 点数：生成前 17,495；生成后 17,430；绑骨/最终 17,410；总消耗 `17,495−17,410=85`。
- 封面质检：贴图/灰模均见脸与颅顶连续、无发片，双耳、手脚完整；裹胸与高叉三角裤贴身；窄 A 轮廓一致，无明显破面、挑棚或粘连。
- joints：65；Hips `[-0.002,0.538,-0.002]`，Head y 0.886，脚 y 0.067/0.067，手离髋 0.188/0.205，手高差 0.022；六项检查全真。
- 几何：臂角 23.6294°；头身比 8.25；髋高占比 `0.53789115/0.98010258=0.54881107`；身高 0.98010258 mu，1.66 m / H = 1.69370027 m/mu。
- normalize：run 根偏移 `(-0.0298,+0.5248) mu` 已修；剥 195 scale + 192 非 Hips translation = 387 轨；rest/bind 最大差 `4.57e-7`。
- 骨架帧：头宽 0.0965805 mu；颈环半径 x/z = 0.03353301/0.02845510 mu；gripR `[-0.00129741,0.01745278,0.0187472]`、gripL `[0.01817374,0.02459405,-0.01010044]`。
- SHA：body `1be19e87…e066f`；ring `9bf82630…d9de`；skeleton `79844b4e…58c48`；skull profile `595524a8…cf8d`。

## 4. 开放问题（附默认值）
- Hips 0.5488 比目标 0.565 低 0.0162（1.62 个百分点；若按相对误差则为 2.87%）；默认保留本模型，由 T3 `derive_template.py` 把中等规格也精确收敛到 0.565。
- 左/右手壳量得长度 0.1281/0.1040 mu，封面未见缺损但不对称偏大；默认不返工，阶段 C 首次握持验证 gripR/L，并以穿模/握持门禁裁定。
- 工具实测：参考图可用且上传审计 pass；本次额度只允许一次生成，实用封面仅 600×778 正面、无水印，不能证明背面细节；默认由后续浏览器 3D 实走补全旋转检查。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务按 AR-102 / AR-104 / AR-105 与 `tech/11` §10.T 执行。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/10-paper-doll-3d.md` §0.1/§1.1：过渡期正本改为本项目的新正本，并同步新 SHA、105,082 顶点 / 196,022 三角、23.63°。
- `docs/tech/11-paper-doll-3d-impl-spec.md` §0/§2/§10.T：阶段 T2 标完成；改写“阶段 T 生成的 30° 正本”为 AR-105 的 25° 正本及实测值。
- T3：从本 `body.glb` 重派生 `tpl_f_small/tpl_f_tall`，并校正 medium 髋比；阶段 C：此前全部装备按本骨架/环/区域 SHA 重贴合，旧正本结果不得复用。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只经常驻进程 `/open` + `/eval` 操作单一新 Tripo 页；生成/绑骨各一次，未触碰账号、购买、条款或其他标签页。
- ✅ H3.1/detailed/extreme/PBR/delight/triangle/private 参数核对通过；输入 SHA `883f896e…a45`；签名 URL 直下，队列清空且 saveMode 还原。
- ✅ `fix_anim_offset.py` 实跑；normalize 写入及 `--check` 通过；export_skeleton 写入及 `--check` 通过；`selftest.py` 7 项通过。
- ✅ 65 joints、rest=bind、+Z、3D 臂角与头身比通过；髋比按 2 个百分点门限通过，解释见 §4。
- ✅ `pnpm install --frozen-lockfile` 与 `pnpm check` 通过（178 files / 1,272 tests；内容/构建/size 全绿）；因工作区 `.agents/slots` 不可写，信号量锁根改用 `/private/tmp/tianshu-art-dressup-check`。
- ✅ T3/C 交接：small/tall 必须从新正本重派生；C 的衣物、发型、刚性件全部按新 skeleton/ring/region 重贴合并重跑门禁，进包时把 candidate PBR 材质交 `textures.py` 转 unlit。

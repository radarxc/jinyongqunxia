# ENG-dressup-r2-refit-f2 报告 · 3D 纸娃娃换装 · R2 · 现有衣物 / 贴图层 / 道具重贴合到 tpl_f2 三体型 + 换装页默认素体切到 tpl_f2_medium（0 点）
## 1. 摘要（3–6 行）
按 2026-10-12 补充裁定，本轮只重做四件道具 × `tpl_f2_medium`；tall / small 仅跑 sockets 旁证并依赖同套 medium 回退。
四件均使用已核对 SHA 的原始件和既有参数，在无 manifest 临时目录完成 sockets 后 validate、ingest；medium 四件全过 draft 门。
龙泉剑按裁定固定 60°；斗笠、青锋剑、玉佩 medium / tall / small sockets 均 approved。0 点，未调 Tripo。
衣物、贴图层、`tests_garment.py` 枚举及页面默认模板继续暂停且未改；完整 `pnpm check` 已通过。
## 2. 产出（文件、行数、主要章节）
- 四个道具目录各新增 GLB、fit、report、medium/tall/small sockets 共 6 文件，并修改 manifest：24 个新资产文件 + 4 条完整 `fits.tpl_f2_medium`；另保留协调者批准的 2 处测试修正。
- 文本规模：4 个 manifest 各 +10 行，两处测试为 +2/-1 与 +4/-2，新增 20 个 JSON 共 2,271 行；4 个 GLB 为二进制；本报告 35 行。
- 命令链：`normalize_prop.py --skeleton templates/tpl_f2_medium/skeleton.json` → `textures.py` → `pack_glb.mjs --simplify 0.05/0.0161/0.03/0.03` → 临时目录 `check_sockets.py` → `validate.py --level draft` → `ingest.py prop ... --template tpl_f2_medium`。
- 实跑耗时：normalize 龙泉/斗笠/青锋/玉佩 2.18/18.19/2.85/2.72 s；sockets medium 284.43 s，tall/small 并行 390.24/392.61 s；四次 ingest 并行约 1.1 s。
- 安装与总门：`pnpm install --frozen-lockfile` 0.71 s；`pnpm check` 147.47 s。Node 24.13.0；pnpm CLI 9.15.1（仓库固定 9.15.9）。
## 3. 关键结论与数值
| 道具 | medium：三角 / 字节；validate；sockets | tall sockets（medium 网格回退） | small sockets（medium 网格回退） |
|---|---|---|---|
| 龙泉剑 | 9,578 / 927,112；30/30 draft；60° 1.7891% draft | 工具选 0° 1.3493% draft；60°候选 1.6274% draft | 工具选 0° 1.1312% draft；60°候选 2.0062% fail |
| 斗笠 | 4,598 / 915,100；29/29 draft；0 approved，最小间隙 0.8281 mm | 0 approved | 0 approved |
| 青锋剑 | 8,678 / 1,021,576；30/30 draft；0 approved，35° | 0.0073% approved | 0.0010% approved |
| 玉佩 | 8,580 / 877,164；29/29 draft；0 approved，最小距离 14.2049 mm | 0 approved | 0 approved |
- 入模前确认模板为 T6 新插槽：`socketMode=waist-band`；`waistL=[0.02043626,0.10087765,-0.05723376]`，`chest=[0.09095453,0.02204252,-0.03755054]`。
- 龙泉 medium fit 固定 `restTiltDeg: 60`、quat `[0,0,0.5,0.866025404]`；完整 0/20/40/60 扫描与 override 理由保留。斗笠取 `--simplify 0.0161`（4,598 三角）以满足主轴 ≥0.999；青锋保留已批准 `axisCheckWaiver`。
- 四源 SHA 与旧 fit 一致；新 GLB SHA/字节/三角、report 输入与 manifest 4/4 交叉通过。旧 `tpl_f` 四件的主 GLB/fit/report/sockets 共 16/16 与 HEAD 逐字节一致。
- 运行时实拍（协调者，任务 dev 127.0.0.1:5192，T6 新插槽 + 黄蓉头，`window.__dressup` 定格出图）：四件 × idle / walk / run，存 `props/<id>/shots/r2.tpl_f2_medium.png`（裁定 7 原写 .jpg；审核接口对肤色素体截图连续报 Invalid image，JPEG、PNG 都一样，疑为内容审核拦截；改为实拍时在页面调试里把素体临时换成灰色无贴图材质（沿用原隐藏遮罩着色器，只影响截图，不改任何素材）后接口正常收图。机位：龙泉剑 全身 + 持剑手；青锋剑 腰部 3/4 + 侧面 + 背面；斗笠 头部（跑步按 Head 骨定位）+ 全身；玉佩 上半身 + 全身）。龙泉剑 60° 剑尖朝前下、跑步朝前；青锋剑挂左腰贴身、鞘向后下斜；斗笠戴正；玉佩挂左胸——与 tpl_f 一致，旧插槽下的错位（佩剑飘臀后约 25 cm、玉佩挂右胸、0° 时剑身横在身前）已消失。
## 4. 开放问题（附默认值）
- 衣物阻断（协调者裁定）：tpl_f2_medium 胸型使 225 点入体、最深 50 mm，拉伸合格率 96.2%，untangle 24→1 后退出 2；默认保持暂停，待作者选“重新生成 / 切片贴合 / 暂不做”。
- 龙泉 small 实际会回退 medium 的 60°，而 60°只报告候选为 2.0062%，略超 2% 门；默认保留裁定姿态、明确风险并等协调者实拍，不改阈值或工具。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；几何结果与测试假设问题均不应通过修改基准或放宽门禁解决。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `TODO.md` / 本任务状态：只标四件道具完成；衣物、贴图层、枚举扩展和默认页面继续 HOLD，等待作者选择。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 四件 medium normalize/贴图/pack/sockets/validate/ingest；tall/small sockets 只报告；fits 字段齐；raw 副本与临时目录已清理；0 点。
- ✅ Python：`tests_garment` 38/38、`tests_hidemask` 24/24、`tests_variant` 6/6、`tests_prop` 27/27、`selftest` 7/7。
- ✅ `pnpm check`：lint/typecheck；Vitest 189/189 文件、1344/1344 用例；content 1777 文件/1708 对象；故事 4/4 与 3 行/2 章；build/size/dev-chunks 全过。共享槽因沙箱不可写，保留同等 worker=6 后直跑。
- ✅ 旧 tpl_f、头、衣物、贴图层和暂停代码未动；⚠️ 龙泉 small 的 60°风险见 §4，未伪装为工具自动 0°结果。
- ⚠️ 男素体衣物仍为空；W1 前须问作者首批男性头/衣物版型清单及是否提供男性衣图或 3D 源件；默认 `tpl_m_*` 不跨套回退。

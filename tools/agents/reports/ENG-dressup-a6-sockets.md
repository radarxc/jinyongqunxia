# ENG-dressup-a6-sockets 报告 · 3D 纸娃娃换装 · A6 · 插槽坐标系约定修正 + 道具默认 gripAdjust（剑进手、斗笠戴正、挂件贴胸）
## 1. 摘要（3–6 行）
- 三套模板插槽已按 tech/11 §4 重导：非握持 bind 世界轴对齐，握持帧按投影 Pinky→Index / 掌心法线组成右手系，原 `pos` 不变。
- 青锋剑按作者裁定改为 0.9 m 入鞘佩剑态（`slot=waist/socket=waistL`）；护手用峰邻域最大截面半径顶点的实际位置判定，斗笠戴正，玉佩贴胸。
- 严格最近三角门禁三件全过：佩剑鞘身深穿 0.238056%（approved），斗笠 / 玉佩 72 帧均 0 入体；返修后全量实测 73.52 s。
- 最终 `pnpm check` 在仓库指定 Node 22.22.1 / pnpm 9.15.9 下退出 0。
## 2. 产出（文件、行数、主要章节）
- 工具/测试：`export_skeleton.py` 773、`normalize_prop.py` 840、`check_sockets.py` 577、`tests_skeleton.py` 214、`tests_prop.py` 499 行。
- 资产：三套 `skeleton.json/manifest.yaml`；三件 `fit/report/manifest/sockets_check`；青锋剑 GLB 完整重产并经 ingest；构建测试动态读取 manifest/fit/GLB。
- 实跑：骨架 9/9、道具 22/22、selftest 7/7；三套 rig/export；三件 socket PASS；冻结安装 PASS。
- `pnpm check`：lint/typecheck、Vitest 186/186 文件与 1322/1322 用例、1777 内容文件、故事 4 tests、build/size 全 PASS。
## 3. 关键结论与数值
- 非握持旧→新 bind 世界旋转距 I（°，headTop/headCenter/neck/chest/back/waistL/waistR/waistBack/footL/footR）：medium `119.988/166.424/120.580/82.990/89.298/166.452/91.657/164.291/117.890/130.559 → ≤0.000001`；small/tall 同样 `≤0.000001`。
- gripR/L 距 I 旧→新：medium `83.018→92.391 / 171.120→93.050`（握持帧不要求 I）；新轴正交、det=+1、+Y 对投影 Pinky→Index <1°。
- 三模板删除顶层 `sockets` 后与 HEAD 逐键相等，全部 `socket.pos` 逐值相等；skeletonSha=`5f5164455050/6af90881fff4/9db4ecb73b04`，body/regions/skull 未改。
- 青锋剑护手实际峰 `t*=0.132322268 mu`（源轴），距 high 柄端 `f=32.331603%`，满足 5%～35%；不是 bin 中心 31.25%。顶层 `handleDetection.method=guard-peak`，归一化峰 `y=0.134607306 mu`、柄端=min，握点 y=0 位于护手外侧短柄段。
- 佩剑 `realSizeM=0.9`、35°、`offsetMm=111.329930`；压包总 7263 / 柄段 3249 / 鞘身 4014 点，`688/(4014×72)=0.238056%`，approved≤0.5%，未触发回退并严格用 30°～40°；若 35°深穿 >2%，最终判定显式改用 25°～50°。
- 斗笠 `liftMu=0.031280993`、fit 间隙 3.000003 mm；72 帧 head 入体 0，距离 min/median 3.624/4.843 mm；帽檐最低点相对眉弓低 7.82 mm。玉佩 `offsetMm=17.307838`；入体 0，距离 min/median 11.974/14.156 mm。
- 青锋剑 normalize→textures→pack→validate→ingest 完整重跑，289300→8676 三角，GLB `d766097e…`/4,547,124 B；相对 HEAD 仅语义换向/0.9 缩放与打包噪声，刚体拟合最大残差 `2.77e-8 mu`；斗笠/玉佩 GLB 未重打包。
- `check_sockets` 三件全量 73.52 s < 5 min；严格使用 A1 `signed_distance`，体表树按帧复用；Node 24 会令 heap 采样失真，最终按根契约 Node 22.22.1 / pnpm 9.15.9 验收。
## 4. 开放问题（附默认值）
- 持剑态须后续另做出鞘龙泉剑与持械动作；默认本件只作入鞘佩剑，通用动作深穿维持 approved/draft 分级。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现 tech/11 §4、AR-102 与作者 11:05 佩剑裁定。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- B 系列运行时：继续只做 `socket · gripAdjust`，不二次换轴；佩剑不触发 gripR 握拳。
- C2 Skill 手册：新类别默认单位 adjust；mainHand 武器做 restTilt 扫描，waist 入鞘武器做护手实际峰/鞘角扫描；hat 读 skullProfile；pendant/pouch 外移半厚+2 mm；每次全流程重跑。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 三模板约定、normalLocal 插槽系、逐键/pos/hash；护手按实际峰位置 5%～35%，有峰不回退，3%/20%/40% 合成回归。
- ✅ `fit.json` 顶层 `handleDetection`；真实青锋剑 guard-peak/短柄/握点/镜像端严格断言；构建 A3 的斗笠/玉佩旧断言未放宽。
- ✅ 全部计数点走严格最近三角；最近顶点/三角符号相反回归；`sockets_check` 写总数/柄段/鞘身数与联合 level。
- ✅ Python 9/9、22/22、7/7；回归覆盖触发回退后 50°通过及未触发时 50°失败；三套 rig/export；三件 socket 退出 0（73.52 s）。
- ✅ 真实素材索引用例从 manifest/fit/GLB 推导插槽、身高、draw call、三角和握拳；无历史三角总数硬编码。
- ✅ `pnpm check` 退出 0：186/186 文件、1322/1322 tests，内容/故事、build/size/dev-chunks 全通过。
- ✅ B 系列与 C2 交接见第 6 节；未改门禁阈值、运行时、依赖、超时或 node_modules。
- ⚠️ 三个实现文件 577–840 行，超“尽量≤400”软建议；为保持既有单文件和写集边界未拆公共模块。

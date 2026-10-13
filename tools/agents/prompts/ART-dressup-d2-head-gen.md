# 本任务：3D 纸娃娃换装 · D2 · 生成头样例：穆念慈（Tripo 生成 + 绑骨 → 三体型切头；V4 闸门；约 85 点）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5、§4.3 / §4.4）、`.claude/skills/tripo-web/SKILL.md`（§0 规矩与点数、§1 脸部质量、§3 SOP）、`tools/model3d/tripo_web.js`、E1 任务书 `tools/agents/prompts/ART-dressup-e1-garment-gen.md` 与报告（同一套 Tripo 操作的实跑记录，照着做）、D1b / D1c 报告第 7 节（`cut_head.py` / `shoot_head.mjs` 用法）。

## 作者要求
V4 头闸门要两样：切 1 个现有 NPC 头（D1 / D1b / D1c 已过），生成 1 个新头接上（本任务）。作者 2026-10-10 选定穆念慈，批准花点（生成 65 + 绑骨 20）。**AR-100**：浏览器只经常驻进程这一条连接。

## 输入
- 协调者已备好的窄轮廓 A 字全身参考图：`assets/default/character/female/ch02/threeview/por_npc_munianci__ch02_youth_apose_slim.png`（以作者定稿 C 版立绘为底；按 tripo-web §1 去刘海、去发饰与耳饰、双耳露出、束袖、直筒窄裙）。manifest 条目在同目录。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_{medium,tall,small}/`。

## 浏览器操作方式（必须照做，同 E1）
- 只用本机常驻进程 `tools/imagegen/tri_pipeline_runner.mjs` 的 HTTP 接口 `http://127.0.0.1:9223`：`GET /status`、`GET /targets`、`POST /open {"url"}`、`POST /eval {"targetId","expression"}`。**不要用** `POST /tripo/task`；不得启动 / 重启任何浏览器或常驻进程，不碰作者的其他标签页。
- 先 `GET /targets` 找 URL 含 `studio.tripo3d.ai/workspace` 的页；没有就 `POST /open {"url":"https://studio.tripo3d.ai/workspace/generate"}`。作者已登录；若要求登录 / 付费 / 同意条款，**立即停下写报告**，不输入账号信息、不点购买或条款按钮。
- 每次 eval 前若页面里没有 `window.__t`，先注入 `tools/model3d/tripo_web.js` 全文；单次 eval ≤ 40 秒，`waitOp` 返回 pending 就再调。

## 要做的事
1. **记余额**：`await __t.wallet()`；余额 < 1,500 就停下写报告。每次 generate / rig 前后各追加一行到 `assets/default/model3d/dressup/credits_ledger.jsonl`：`{ time, task, item: "npc_munianci", op, pid, before, after, spent }`（文件不存在就新建）。
2. **暂存参考图并生成（65 点）**：PNG 转 base64 → `idbPut` → `toGenerate('imageToModel')` → `clearUpload()` → `uploadRef(name)` → `checkSettings('imageToModel')` 核对参数与 T2 / E1 相同（H3.1、geometry detailed、texture extreme、PBR、delight、triangle、private）→ `generate({ go: true })` → `waitOp` 到 `success`（≤ 15 分钟）。**只提交一次**；出错先 `projects()` / `proj(pid)` 确认没有重复提交。
3. **封面与脸部质检**：`cover(pid)` 用 `curl` 下载后看图，逐项过 tripo-web §1.4 的缺陷清单：额头肉块 / 眼皮撕裂、耳前悬浮薄片、太阳穴削角、唇裂、颅顶头盔感、耳下肉块、发饰烘焙。脸部有明显破损就**停下写报告**（不绑骨、不再花点数，由协调者改参考图后另起）。
4. **绑骨（20 点）**：`rig(pid, { go: true })` → `waitOp` → `joints(pid)` 须 `ok:true`（65 关节、Mixamo 命名）。不做 retarget。
5. **导出（0 点）**：记下 `saveMode()` 原值 → `setSaveMode('reload')` → `exportGlb(pid, 'dressup_head_npc_munianci', { anims: [] })` → `saveQueue()` 取签名 URL，`curl` 下载到系统临时目录 → `clearSaveQueue()` 并恢复原值。
6. **源件入库**（同 E1 口径）：
   - `tools/model3d/dressup/textures.py` 把贴图压到 baseColor ≤ 2048² JPEG q85（删 normal / metallicRoughness），几何、UV、skin 原样保留，输出 `assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig.glb`；前后各跑一次 `inspect.py --json`，确认关节 / 顶点 / 三角一致。
   - 封面转 RGB PNG（长边 ≤ 1024）存 `…/source/cover.png`；写 `…/source/source.json`（字段照 E1 的 `source.json`：tripo 项目与各 op、options、credits、参考图 path + sha256、glb 摘要、inspect 关键量、joints 体检、封面质检结论）。`source/` 下不写 manifest。
7. **三体型切头**：按 D1c 用法依次跑 `python3 tools/model3d/dressup/cut_head.py --source assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig.glb --template assets/default/model3d/dressup/templates/tpl_f_<medium|tall|small> --id npc_munianci --out assets/default/model3d/dressup/heads/npc_munianci`（medium 先；tall / small 自动加后缀并登记 manifest `fits`）。三份 `report*.json` 须 level ≥ draft（V4 门禁全过）；不过就照报告里的失败项定位原因写进报告（不改工具、不放宽门禁）。
8. **运行时截图**（5173 开发服务器由协调者保持运行）：按 D1c 报告第 7 节对三体型各跑一次 `shoot_head.mjs --template tpl_f_<…> --head munianci=assets/default/model3d/dressup/heads/npc_munianci …`，输出放系统临时目录，挑总图复制到 `…/heads/npc_munianci/shots/`。沙箱里起不了无头 Chrome 或连不上 5173 时跳过，并在报告写明，由协调者实拍。

## 约束
- 只写 `assets/default/model3d/dressup/heads/npc_munianci/**`、`assets/default/model3d/dressup/credits_ledger.jsonl` 与本任务报告；不改工具、测试、模板与参考图（发现工具 bug 写进报告第 4 节）。
- 不输密码、不买点数、不点条款同意；点数只花 85；出错不重复提交生成。临时文件放系统临时目录。

检查：
- `python3 tools/model3d/dressup/inspect.py --json assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig.glb`
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- 三体型头报告门禁：`python3 -c` 读 `heads/npc_munianci/report{,.tpl_f_tall,.tpl_f_small}.json`，level 均不为 fail
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-d2-head-gen.md`：第 3 节写 Tripo 项目 / 各 op、耗时、点数前后、封面与脸部质检逐项结论、joints 体检、inspect 关键量、三体型切头的门禁数字（G1 顶 / 底、鼓包、ΔE、penetration、外露）与截图路径；第 7 节写给 P5 量产的经验（参考图规矩哪些起了作用、生成到切头的总耗时与点数）。报告 ≤ 50 行。

## 协调者裁定（2026-10-10 02:30，第 1 次运行后）
1. 第 1 次运行按任务书做到切头为止：生成 + 绑骨 85 点（Tripo 项目 `98c3372a…`，余额 17,260 → 17,175），封面脸部质检通过；`cut_head.py` 在 `source-neck-floor-detection` 失败，因为参考图里白色交领包到颈前（78°–106° 没有裸露皮肤，最大皮肤覆盖 92% < 97%），找不到连续 6 mm 颈带。执行器没改工具、没降门禁、没重复生成，做法正确。
2. 协调者已换第二版参考图（同一路径，提交 `614b531bd`）：交领低开，交叉点在胸骨中段，颈部四周露出至少两指宽皮肤；其余同第一版。
3. **允许用第二版参考图再生成一次 + 绑骨一次（85 点）**，仍然只提交一次。生成前先 `projects()` 核对，确认本任务没有第二个新项目。新源件覆盖 `source/`；`source.json` 加 `history` 字段记第一版的项目 / op / 点数与失败原因；切头成功后删掉 `cut_failure.json`。
4. 第 1 次的点数台账行保留，新操作继续追加。报告第 3 节两次都写，第 7 节把"参考图须露出整圈颈部（领口落在颈根以下 ≥ 6 mm）"写进 P5 参考图规矩。

## 协调者裁定（2026-10-10 04:45，第二版两次运行后；AR-110 由 Claude 直接收尾）
第二版参考图生成 + 绑骨成功（项目 `1cd0ade0…`，两次累计 170 点，余额 17,090），找颈带已通过，三体型都走完 73 帧，但 V4 仍 fail。执行器做法正确：没改工具、没降门禁、没再花点。查明三处工具缺口：
1. **三角预算**：这次 Tripo 源件 18.8 万三角，是黄蓉源件 9.3 万的两倍，切出的头约 4.3 万（门槛 3 万）。源件先 `pack_glb.mjs --simplify` 减到约 8.5 万再切，头约 2.9 万。P5 流水线补这一步。
2. **头发误判**：深红后领被"深色 / 偏棕"规则判成头发而整面保留（后颈红色碎片）。头发只认近中性深色或棕色（G ≥ 0.5R），高饱和红 / 蓝布不算。
3. **颈片后颈两侧 S 形**（194°–223°、307°–316°）：穆念慈发髻全盘、后颈裸露，A 区覆盖整圈（黄蓉长发遮住后颈，A 区只有 264°）；她的头侧颈子上下粗细差小，切口下 G1 裙带的外扩在两侧鼓成约 0.5 mm 的小环。这是门禁要拦的"多一圈"，不放宽，改桥接设计。

由 Claude 在本任务工作区直接实现（AR-110，同 D1b / D1c），写集追加 `tools/model3d/dressup/{cut_head.py,tests_head.py}`；不再花 Tripo 点；产物仍走 `supervise.py --from validate` 与 GPT 审核。

## 协调者补充（2026-10-10 05:20，Claude 实现中运行时截图发现）
按上面三处修完后三体型 V4 全过，但 5173 实拍发现后颈切口处有外翘的红 / 肤色薄片（侧后近景明显）。原因是第四处缺口：穆念慈的深红立领、领口内衬、颈皮在领口处的外翻折边贴着颈子立到切口以上，过了"暖色即皮肤"判定，切口一裁就剩薄片；V4 门禁只量颈片，不量头网格在切口附近有没有残片，所以没拦住。处理：
4. **衣领残片清理**（`drop_collar_remnants`，切头之后执行，只删不改）：切口以上 12 mm 内、面心比自颈轴向外第一层皮肤再往外 1.5 mm 以上、以颈部权重为主（Head < 0.5）、不像发丝（深色且不偏红的算发丝）、相邻成片 ≥ 8 个面的非头发面整片去掉；另把切口顶带（4 mm，颈片顶带就在其下）里贴图过半偏红的第一层面去掉。切口高度、颈部适配、颈片约束都不受影响，门禁数字与清理前逐位相同；黄蓉三体型清理 0 个面，产物逐字节不变。
5. 头发"棕色"判定的 G/R 下限由 0.5 提到 0.6（红领亮面 G/R 0.51 曾被收成头发、不在切口处裁）。黄蓉产物逐字节不变。
6. 顶缝 G1 记录最差角（`worstDeg` / `worstStepDeg`，只报不判），便于定位。
不放宽任何门禁；P5 截图验收要专门看后颈与侧后近景。

## 协调者补充（2026-10-10 06:15，审核 r1 FAIL 后）
r1 只差一项：后颈切口上下一条亮白横带（白内领被 Tripo 烘进颈皮，切口处比上方亮 3–5 L*、白斑到 +17；颈片又从切口取色往下过渡到身体，于是切口处成亮峰），属 P5 A2"色阶"，不能留作开放问题。处理（Claude，AR-110）：
7. **切口带调平**（`level_seam_tone`，切头后、拼图集前）：逐角量切口以上 6 mm 头皮中位亮度，比本人参考肤色（classify 的脸颈参考色）亮 3 L* 以上的角度渐入、5 L* 全量（按角度平滑）；这些角度上切口以上 10 mm 内的头皮纹素在线性空间向同角度 12–24 mm 段头皮的中位色插值（切口处全量、10 mm 处归零），参考段不像皮肤（发帘）不动；外扩 1 像素只改不属于其他头部三角的填充纹素。颈片条带从调平后的图取色。黄蓉三体型逐角最大 +2.1，不触发，产物逐字节不变。
8. 回归：`tests_head.py` 新增合成测试（有亮带 → 拉回参考色、BAND 以上与未触发角度逐字节不动、无亮带原样返回）；真实资产复算对带 `seamTone` 诊断的头，在交付图集上逐角检查"比上方亮 2 L* 以上且比本人肤色亮到全量线"的角度为 0（穆念慈调平前 93 个、调平后 0）。
三体型重切、重拍 `shots/`，报告第 3、4、7 节相应改写。
（06:40 补）调平权重改为切口以上 4 mm 内全量、4–10 mm 渐弱：首版按切口处全量即开始渐弱，tall 在 300° 有一个白斑残留台阶 2.2 L*，交付图集检查不过；改后黄蓉仍逐字节不变。

## 协调者补充（2026-10-10 08:50，审核 r2 FAIL 后；作者决定）
r2 颈缝全部通过，只差耳部：第二版参考图耳前各留一缕垂到耳垂下的细发，Tripo 把耳垂重建成浅色方块 + 珍珠状突起（tripo-web §1.4 第 6 条），且熔在耳垂表面里——试删会让耳廓开洞、下缘变锯齿，不可安全后处理（试验代码已撤回，不入库）。作者 2026-10-10 两项决定：
9. **第三版出素模（再花 85 点，D2 累计 255 点）**：参考图改为穆念慈的脸与发髻 + 换装模板同款素体（肤色半透明裹胸、高叉三角裤、赤足、25° 窄 A），双耳干净、耳下颈侧无发丝、无饰物——`assets/default/character/female/ch02/threeview/por_npc_munianci__ch02_youth_base_body_apose.png`（agy，三选一，manifest 已登记）。同一份点数既用于切头（颈部无衣领干扰），也作"每人一个素模"方案的试点。Tripo 操作由 Claude 经 9223 常驻页执行，只提交一次；新源件覆盖 `source/`，第二版写进 `source.json.history`。
10. **方案 2：身体染色对准切口颈色**：`cut_head.py` 第一遍烘颈片后，把 A 区平均增益（切口头色 ÷ 染色后身体色）乘回 skinTint（范围 0.7–1.4）再重烘，颈片不再从颈色渐变到身体色。原"头部 5–65 mm 平均色 vs 染色后模板平均色"按构造恒为 0，改为只报的 `deltaEFaceMean`；门禁 `deltaE < 3` 改量"切口颈色 vs 染色后身体颈色"（阈值不变）。黄蓉 / 穆念慈实验：残余增益 1.00，切口颈色差 ΔE 0.02 / 0.12，接缝色差 p95 均 < 2。库内黄蓉三体型随后用新工具重切（身体会整体提亮 ~10%）。

## 协调者补充（2026-10-10 09:45，第三版素模切头时；Claude，AR-110）
11. **顶带外露改对"覆盖皮肤"量（阈值不变）**：第三版 medium 全流程只差 `head.patchTopUnderSkin`——run 0.156 s 一帧一点 +0.22 mm（门禁 ≤ 0.1，θ 257°、切口上 3.3 mm）。离线复现：该帧离这一点最近的"头皮面"是后脑发际线皮肤（bind 时切口上 47 mm、ρ 57 mm、Head 0.84），头后仰时贴近颈后（头网格 LBS 自接触），按它的法向算成露出；同一点对自身上方的颈后皮肤仍在皮下 0.26 mm，73 帧对覆盖皮肤最大 −0.08 mm。减面 0.45 / 0.7 / 0.9 三次失败数字逐位相同（切口附近原网格本就不被减），排除三角稀疏。修正：外露只对覆盖皮肤量——bind 时离重叠带 ≤ 3 mm 的头皮面（`TOP_COVER_MM`；法线仍按整片头皮算），全部头皮面口径改为只报 `topExposedAnyMaxMm`。合成回归 `test_top_band_covering_skin`：远处头皮贴来不算、覆盖皮肤塌进顶带照样拦；`tests_head` 的独立复算同步改口径。黄蓉三体型新旧口径逐位相同（9 位小数，含 penetration / 底带）。截图加 run@0.156 后颈机位核对自接触处。
12. **素模源件减面比例按切出总三角定**：素模四肢躯干裸露，头只占全身三角约 16%（着装第二版约 34%）；照第 1 条减到 8.5 万（0.45）头只剩 13,848、加颈片 23,925。改取切出总三角 ≤ 3 万的最大比例：0.7（13.2 万）→ medium 头 18,416、合计 28,493；0.9 → 30,601 超预算。`source.json.cut_source` 记三种比例；P5 B2 相应改写。
13. **切口带调平只调贴着衣领的角度**（5173 实拍发现）：第三版 medium 后颈 bind 一眼可见"亮块 + 横线"。量交付图集：后颈 θ 270° 原贴图切口处 L* 83、往上到发际线渐暗（+12 mm 80、+21 mm 73.5），是平滑的天然明暗；调平按"比脸颈参考肤色亮 ≥ 3 L*"判成领口污染（素模后颈比脸亮 6 L*），把切口 0–4 mm 拉向 12–24 mm 段中位色（混进发际阴影，≈ 77），切口一圈被压暗 6.5 L*、上方 6–12 mm 原皮照旧，于是成了亮块下沿一道横线；接缝色差门禁只比切口两侧（都 ≈ 77，p95 1.1），拦不住。修正：`collar_adjacent` 逐角查源件切口下方 12 mm 内、颈壳半径 15–75 mm 处有无衣料面（非皮肤、非头发），只在这些角度调平（按角度平滑后乘权重）；`seamTone.collarDeg` 记角度。第三版 0 个角度、纹素不动，实拍后颈平滑；第二版回归后半圈 191°–346° 贴衣领、仍调 181 个角度；黄蓉 51 个角度贴衣领但不触发（逐角最大 +2.1），产物不变。测试：`test_level_seam_tone` 加"无衣领原样 / 只调衣领段"，新增 `test_collar_adjacent`；真实资产的切口亮带检查只数衣领角度，`collarDeg` 为空的头断言调平没改纹素。截图验收以 5173 实拍为准（本条即实拍发现，门禁数字全过）。

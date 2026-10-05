---
name: tripo-web
description: 用作者 Chrome 里已登录的 Tripo Studio 网页版给人物建 3D 模型：上传参考图 → H3.1 生成（65 点）→ Humanoid·Mixamo 绑骨（20 点）→ 导出 GLB 和封面预览 → 入库 assets/default/model3d/ 并提交。浏览器走 Claude in Chrome 扩展，驱动是 tools/model3d/tripo_web.js 的 window.__t（页面内 JS 调页面自己的接口，少截图、少点按钮）。建 3D 模型、绑骨、给主角加预设动作、重导 GLB、查 Tripo 余额和项目时使用。
---

# Tripo 网页版建模（人物 3D）

**范围**：人物 3D 模型（`assets/default/model3d/<npc_id>/`）。生成输入是作者定过脸的立绘或 A 字参考图；立绘本身走 codex（AR-31 / AR-32），物品图走 gemini-imagegen。

**依据**：
- 驱动源码 `tools/model3d/tripo_web.js` 是唯一版本，页面里是 `window.__t`；请求体都照 Tripo 前端源码拼，出处写在文件头；
- 入库脚本 `tools/model3d/ingest.py`（`--help` 有完整参数）；
- 上一轮 38 套的选项、点数、逐位结果见 `tools/agents/reports/ART-3d-tripo-web.md`；
- 本文是操作手册，与源码冲突时以源码为准。

**哪些已用 JS 跑通**：见 §8 的状态列。2026-10-04 做 AR-85 通用男女模型时第一次真提交，生成、绑骨、动作、导出全程走 JS，没点一次按钮。结果见 §2.10。

## 0. 规矩

- **标签页**：只操作 Chrome「Claude」标签组里的 Tripo 标签页，组外的一律不碰。tabId 每次用 `tabs_context_mcp` 查（10-03 / 10-04 是 1957635120）。
- **账号与设置**：作者已登录，不输密码；不点 Upgrade、购买、订阅、条款；cookie 弹窗选最少；**不改浏览器和扩展设置**（下载权限、站点权限都请作者自己点）。
- **点数**：生成 65、绑骨 20。只做协调者 / 作者批准过的名单；每做完 2–3 个向协调者报一次余额。
- **个人信息**：项目详情里有 `owner_name`、`owner_avatar`、`owner_user_id`，驱动的返回值已经滤掉；自己写 fetch 时也别打印。给页面外发的任何请求都不带作者的邮箱、用户名。
- **剪贴板**：不读也不写。参考图走 IndexedDB 暂存（§1）。
- **调用时长**：单次 JS 调用 ≤ 40 秒（驱动里的等待默认 28 秒，返回 `pending:true` 就再调一次）；subagent 单次工具调用 ≤ 5 分钟。
- **JS 输出**：含 `=`、`&`、`?` 的输出会被工具拦成「Cookie/query string data」。驱动返回值不带签名 URL；自己拼的输出末尾加 `.replace(/[=&?]/g, '~')`。
- **下载**：只存 `~/Downloads/tripo__<npc_id>.*`，入库脚本搬走后删除；作者自己的文件不碰。开工前 `df -g ~` ≥ 4 GiB。
- **git**：在集成分支工作区 `.agents/wt/_prod` 里做；只按路径 `git add -- <路径>`、`git commit … -- <路径>`；不 push、不 checkout / reset / stash。
- **工具加载**：Chrome 工具先用一次 ToolSearch 全部载入：
  `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__find,mcp__claude-in-chrome__file_upload,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch`

## 1. 一次性装载（每个标签页做一次；改了驱动、换了一批参考图再做一次）

localStorage 和 IndexedDB 在 studio.tripo3d.ai 同源共享，刷新后还在；sessionStorage 每个标签页各自一份。

**1.1 插一个临时文件框**：
```js
(() => { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; i.setAttribute('aria-label', 'claude loader'); i.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647'; document.body.appendChild(i); return 'ok'; })()
```

**1.2 上传文件**：`find` 查「claude loader」拿 ref，`file_upload` 传 `tools/model3d/tripo_web.js` 和本批参考图（绝对路径，单次合计 < 10 MB，多了分几次传）。

**1.3 读进 localStorage、暂存参考图**：
```js
const inp = document.querySelector('input[aria-label="claude loader"]');
const js = [...inp.files].find((f) => f.name === 'tripo_web.js');
if (js) localStorage.setItem('claudeT', await js.text());
window.__claudeTT ??= trustedTypes.createPolicy('cl' + Date.now(), { createScript: (s) => s });  // 和 Gemini 一样用 trustedTypes eval
eval(window.__claudeTT.createScript(localStorage.getItem('claudeT')));
const staged = await __t.stage(inp); inp.remove();
({ staged, keys: await __t.idbKeys(), ...__t.selfTest() })
```
参考图在 IndexedDB 里的键是文件名（仓库路径的 basename）。

**1.4 存盘方式**：默认 `direct`（作者 10-04 已在 Chrome 里允许 studio.tripo3d.ai「自动下载多个文件」，实测连续存盘都落盘）。存了却不落盘，说明权限被收回了，改用 `__t.setSaveMode('reload')`，见 §4。

**每次 navigate（整页刷新）后重新载入**：
```js
window.__claudeTT ??= trustedTypes.createPolicy('cl' + Date.now(), { createScript: (s) => s });
eval(window.__claudeTT.createScript(localStorage.getItem('claudeT')));
__t.selfTest()
```
`vis` 不是 `visible` 就停下：窗口被最小化或挡住了，请协调者转告作者把窗口放到前台；不要自己挪窗口。

## 2. 每个模型的标准流程

开工前：`await __t.wallet()` 记余额；`ls ~/Downloads/tripo__*` 应为空。下面每步 1–2 次 JS 调用；`ok:false` 必须 throw，让 batch 停下。

**2.1 上传参考图**（0 点）：
```js
const g = await __t.toGenerate('imageToModel'); if (!g.ok) throw new Error(JSON.stringify(g));
const u = await __t.uploadRef('por_npc_xxx__chNN_youth_apose_slim.png'); if (!u.ok) throw new Error(JSON.stringify(u));
({ u, settings: __t.checkSettings('imageToModel'), dry: await __t.generate() })
```
- `toGenerate` 用前端路由切到生成页、切单图 / 多视图模式，不刷新页面；`uploadRef` 把暂存的图挂到页面自己的上传框，等上传和审核（`audit: pass`）完成。
- 多视图：`toGenerate('multiView')`，再 `uploadRef(name, { slot })`，`slot` 0 Front、1 Left、2 Back、3 Right，至少 Front 加 1 张。
- 传错了：`__t.clearUpload()`。

**2.2 生成**（65 点）：
```js
const r = await __t.generate({ go: true, open: true }); if (!r.ok) throw new Error(JSON.stringify(r)); r   // {pid, op, credits:{before, after, spent}}
```
- 立刻把 pid、op 记进本任务的 `done.txt`。驱动也在 `localStorage.claudeTLog` 记一笔，`__t.logs()` 可查。
- 调用超时或报错：**先查 `__t.logs()`、`await __t.projects()` 和余额，确认没生成上再重发**，别重复花点。
- **首次真用核对**（AR-65 只验证到 dry）：`spent` 应为 65；`await __t.proj(pid)` 里 `model_version` 是 `v3.1-20260211`、`type` 是 `image_to_model`（多视图是 `multiview_to_model`）。等生成完再核对 `ultra:true`、`pbr:true`。有一项不对就停下报协调者，后面改走 §5 的按钮兜底。

**2.3 等生成**（每次 ≤ 28 秒，反复调）：`await __t.waitOp(op)`，`done:true` 且 `status:'success'` 才往下走。8K 生成一般要几分钟。

**2.4 看图验收**：
- `await __t.showCovers(pid)` 后截图看封面（正面，白底），看完 `__t.hideCovers()`。
- 背面、侧面：`navigate` 到 `https://studio.tripo3d.ai/workspace/generate/<pid>`，重新载入驱动，截图；用视图右上角的坐标轴小球或拖动画布转到背面。
- 看：人完整、没破洞；头发不是肉色或灰褐色块；袖子、裙摆没粘连；脸和参考图一致。
- 不合格：先免费重出一次 `await __t.freeRetry(pid, { go: true })`（0 点）；还不行就换更窄的 A 字参考图重做，并报协调者。

**2.5 绑骨**（20 点）：
```js
const d = await __t.rig(pid); if (!d.ok) throw new Error(JSON.stringify(d)); d          // dry：看请求体
const r = await __t.rig(pid, { go: true }); if (!r.ok) throw new Error(JSON.stringify(r)); r   // {op, credits.spent 20}
```
- 驱动先调 `pre_rig_check`（页面也是先查），`riggable:false` 就不发绑骨，直接返回原因。
- 等：`await __t.waitOp(r.op)`，一般一两分钟。
- 体检：`await __t.joints(pid)` 要 `ok:true`，再 `showCovers(pid)` 看第二张骨架叠加图。经验值：髋 y 0.45–0.65，头 > 0.72，头顶骨端在头之上，双脚 < 0.15，双手离髋 > 0.12（模型高约 0.98）。绑坏的典型样子是骨架倒立或压扁（10-03 小龙女宽袖、宽裙两版都是这样，`joints` 能测出来）。
- **首次真用核对**：`spent` 应为 20；`await __t.proj(pid)` 里 `rigged:true`、`rig_op` 等于返回的 op。
- 绑坏了：别导出。`await __t.history(pid)` 找生成版的 op，`await __t.restore(pid, op, { go: true })` 回退（0 点）后重绑（20 点）；更好的办法是换窄轮廓 A 字图重新生成（§7）。

**2.6 主角动作**（0 点，只有主角要）：
`await __t.retarget(pid, ['idle', 'walk', 'run'], { go: true })`，逐个 `waitOp`，最后 `(await __t.proj(pid)).retarget` 三条都是 `success`。

**2.7 导出和预览**（0 点）：
```js
const e = await __t.exportGlb(pid, 'npc_xxx__chNN_youth'); if (!e.ok && !e.pending) throw new Error(JSON.stringify(e)); e
const p = await __t.preview(pid, 'npc_xxx__chNN_youth'); p
```
- `exportGlb` 的参数照导出面板：GLB、贴图 2K、Export Skeleton 开、动作原地，和 10-03 在网页上点导出时完全一样（服务器直接返回了当时导出的文件）。`pending:true` 就再调一次，会接着等同一个导出任务；新导出一般十几秒。
- 主角另导一个动作单文件：`await __t.exportGlb(pid, npc, { anims: ['idle', 'walk', 'run'] })`。
- 存盘名：`tripo__<npc>.glb`、`tripo__<npc>__anim_idle_walk_run.glb`；预览是 Tripo 的封面渲染（`studio_mesh`，正面白底 600×778，文件头其实是 PNG），存成 `tripo__<npc>.png`。要骨架叠加图就 `preview(pid, npc, { kind: 'rig' })`，存成 `tripo__<npc>__rig.webp`。
- 默认 `direct`，这两步直接落盘；改成 `reload` 后只是排队，要按 §4 逐个刷新存盘。
- 核对：`ls -la ~/Downloads/tripo__<npc>*`。

**2.8 入库**（Bash，在 `_prod` 根目录）：
```bash
python3 tools/model3d/ingest.py npc_xxx__chNN_youth --project <pid> --gen-op <生成 op> --rig-op <绑骨 op> \
  --ref assets/default/character/<性别>/chNN/threeview/por_npc_xxx__chNN_youth_apose_slim.png \
  --ref2 "assets/default/character/<性别>/chNN/por_npc_xxx__chNN_youth_base.png=作者选定的 base 立绘（本模型未直接输入）" \
  --subject "某某（某书 chNN · 青年）· 窄轮廓 A 字版" --notes "看图验收：…；自动绑骨一次成功" --commit
```
- 脚本会：等文件落盘 → 核对 GLB 文件头、65 个 mixamorig 关节（另允许赵敏那种 `neutral_bone`）、基础模型不带动画 → 关节体检 → 搬成 `model_rig.glb`、转 `preview.png` → 写 `manifest.yaml`（status candidate，关节体检结果自动接在 notes 后面）→ 只按目录路径提交，撞上 index.lock 会自己重试 → 删掉用过的下载文件。
- 主角加 `--anim idle,walk,run --anim-ops idle=<op>,walk=<op>,run=<op>`；多视图加 `--gen-kind multiview_to_model --input "multiview：Front + Left"`，`--ref` 按槽位顺序给多次。
- 重做已入库的角色加 `--replace`：旧文件先备份到 `.agents/coord/ART-3d-tripo-web/replaced/<npc>__<时间>/`，manifest 里记 `replaces`。
- 先想看看会做什么：加 `--dry-run`。
- 只换预览、模型不动：`python3 tools/model3d/ingest.py <npc_id> --preview-only [--commit]`，读 `tripo__<npc>.png`，只改 manifest 末尾的 preview 条目。
- 点数不是 65 / 20（比如重绑过）：`--credits generate=65,rig=40`。

**2.9 记录**：在本任务 `done.txt` 记 npc_id、project、op、提交号、点数；做完一批写报告。

**2.10 第一次真跑的结果（2026-10-04，AR-85 通用男女，共 170 点）**
- **生成**：`generate({go:true})` 两次都对上了：扣 65 点，项目 `model_version` 为 v3.1-20260211，`ultra`、`pbr` 都是 true。8K 生成约 2.5 分钟。
- **绑骨**：`rig({go:true})` 两次都扣 20 点，绑骨约 1 分钟；`joints()` 全过。
- **动作**：一次提交多个预设，第二个起会报 406 12003「Failed to acquire lock」。驱动已改成每次调用只提交一个并等它跑完（04a13124），反复调到 `left:0` 为止；每个预设约 10 秒。
- **导出**：没绑骨的模型也能导出（不带骨架），用来先量比例。`exportGlb` 一般 10–20 秒，`pending` 时再调一次就行。
- **比例**（AR-79 / AR-85 新增，0 点）：生成完、绑骨前，先导出 2K GLB，跑 `python3 tools/model3d/measure_heads.py <glb>`，看 `heads_crown`。偏离目标超过 5% 就调输入图重出，别急着绑骨。
  - 本次 Tripo 把头放大约 4–6%：男模 2D 7.99 → 3D 7.66，女模拉长图 9.14 → 8.69。
  - 拉长输入图：`python3 tools/model3d/stretch_apose.py <A字图> <输出> --neck <脖子行> --target <2D目标> --skull <头顶骨行> --chin <下巴行>`。2D 目标 = 3D 目标 × 1.05。
  - 派生图放模型目录的 `source/` 下，manifest 写明来源和倍数；仓库里的 A 字图本身不改。
- **跑步片段整段偏离原点**：Tripo 导出的原地「run」虽然没有逐帧位移，但整段离原点约 0.53–0.57（约半个身高），切换动作会跳位。
  - 导出后、入库前跑 `python3 tools/model3d/fix_anim_offset.py <in.glb> <out.glb>`，只平移 Hips 的水平分量。
  - 10-03 那 4 套主角的动作文件也有同样问题，未修。
- **原地动作的移动速度**：支撑脚后移约 walk 0.6、run 2.1 模型单位/秒（模型高约 0.98）。引擎要按这个速度乘身高缩放来移动角色，才不会脚滑。

## 3. 点数（2026-10 实测）

| 步骤 | 点数 | 说明 |
|---|---:|---|
| 生成 | 65 | H3.1 基础 25 + Ultra Mesh 15 + 8K 贴图 20 + PBR 5 |
| 绑骨 | 20 | 重绑也是 20 |
| 预设动作、导出、Free Retry、版本回退 | 0 | |
| 重贴图 | 4K 20 / 8K 30 | 10-03 小龙女 4K 重贴图卡在 99%，没成 |
| Magic Brush 局部重绘 | 5 | 不支持 8K 贴图的模型 |

- 普通角色一个 85 点；主角加动作也是 85 点。
- 预算估算：N 个角色 × 85，再留 20% 余量给重做（10-03 那轮 41 次生成、42 次绑骨实扣 3505 点，其中 380 点没进库）。

## 4. 存盘的两种情况（Chrome「自动下载多个文件」权限）

Chrome 对页面脚本发起的下载有限制：没有「自动下载多个文件」权限时，整页载入之后只放行第一个，之后的静默丢弃，连注入按钮再真实点击也一样（10-04 实测）。驱动里有两种存盘方式：

- **`direct`（默认）**：作者 10-04 在 Tripo 标签页地址栏点了「允许」，之后连续两个脚本下载都落了盘。`exportGlb`、`preview` 直接存。
- **`reload`（备用，权限被收回时用）**：`__t.setSaveMode('reload')`。之后 `exportGlb`、`preview` 只把下载地址和文件名排进本标签页的 `sessionStorage.claudeTSave`。每个文件这样存：
  1. `navigate` 到当前 Tripo 地址（整页刷新）；
  2. 重新载入驱动（§1 末尾那段）；
  3. `await __t.flushSave()` 存队首一个，返回 `left` 还剩几个；
  4. Bash `ls ~/Downloads/tripo__*` 核对落盘。没落盘就 `__t.requeueLast()` 放回去，再从第 1 步来。

  一个普通角色要存 2 个文件（GLB、预览），主角 3 个；签名地址大约两天内有效。这条路只验证到排队，没实际落过盘。
- 站点被设成「阻止」时，同站刷新也不放行。这种情况不要绕，请协调者转告作者改设置。

## 5. 按钮兜底（API 路径出问题时）

- **生成**：2.1 传好图后 `__t.genButton()`，要 `ok:true`（面板设置和 §3 一致）且按钮文字是 `Generate 65`。把返回的 CSS 坐标乘以「截图坐标系宽 ÷ innerWidth」（截图结果里会写坐标系，10-04 是 1456 ÷ 1493）换成 `computer` 坐标；点之前 `__t.guard(x, y, /^Generate\s*65$/)` 用 CSS 坐标再核一次；点完 `__t.lastOp()` 取 pid、op。
- **绑骨**：前端路由到 `/workspace/rigging/<pid>`（`__t.router().push(...)`），`__t.rigButton()` 要求 Humanoid、Mixamo、`v3.0-20260909`，按钮是 `Auto Rig 20`；同样换坐标、guard、点、`lastOp()`。
- **导出**：老办法是右下角 Export → GLB、2K、Export Skeleton 开 → Download。只在 `exportGlb` 报错时用。

## 6. 常见故障

- **扩展截图、find、read_page 超时**：扩展对这个站点的访问权限不够。报协调者请作者处理；处理后整页刷新一次就好。
- **标签页不可见**（`vis: hidden`）：窗口被最小化或挡住。每 2 分钟查一次，请作者把窗口放到前台，不要自己挪窗口。
- **3D 视图里是白模**：连着看了好几个 8K 模型后会出现。`navigate` 整页刷新再看。
- **重贴图卡在 99%**：47 分钟不动就判失败，用 `history` + `restore` 回退到绑骨版。
- **生成 / 绑骨调用超时**：先 `__t.logs()`、`await __t.projects()`、余额三样对一遍，确认没提交上再重发。
- **`$request` 报错**：返回的 `why` 里是状态码和 Tripo 的 code，例如 `9008 Check project exists error` 是 pid 不对。
- **下载目录出现 `tripo__xxx (1).glb`**：Chrome 重名改名了。ingest 会报错；删掉多余的文件再存一次。
- **`uploadRef` 返回 `slot occupied`**：先 `__t.clearUpload()`；`not staged` 就回 §1 重新暂存。
- **JS 输出被拦成「Cookie/query string data」**：见 §0。

## 7. 本轮经验（AR-41 / AR-56，38 套）

- **建模输入用「空手窄轮廓 A 字图」**：束袖、直筒裙、露鞋尖、双臂离身约 30°。宽袖、喇叭裙、手持兵器会让自动绑骨失败（骨架倒立或压扁）；改用窄轮廓 A 字图后，26 个模型全部一次绑成。窄袖、空手的男角可以直接用 base 立绘。
- Tripo 不能手动绑骨。绑坏了只能回退重绑（20 点）、Free Retry，或换参考图重新生成。
- 头发：后脑偏灰褐、发色发肉色要看背面才看得出（小龙女、水笙偏灰褐，赵敏后脑有一缕灰白）。Magic Brush 不支持 8K 模型，4K 重贴图又卡住了，所以修发基本靠换参考图。
- 引擎接入：模型高度归一化到约 0.98，加载时按人物身高缩放；赵敏多一个 `neutral_bone`，并入 Head；杨过空袖那侧的臂骨不驱动；兵器另挂（石破天的佩刀和网格是一体的）；导出贴图 2K，要 8K 可以从云端重导（`exportGlb(..., { textureSize: 8192 })`，未实测）。
- 预览：一律用 Tripo 自带的封面渲染（白底正面、600×778）。之前 37 套的深灰底截图已在 86c11ba7 统一换掉（一次取齐 37 张封面、只下载一个打包文件，逐套 `ingest.py --preview-only`）。
- manifest 的 `created`：之前有 6 套（阿青、小龙女、4 套主角，共 22 条）把本机 PDT 时间写成了 `+08:00`，b71ab68e 已更正为 `-07:00`；ingest 按本机时区写，不会再错。

## 8. `__t` 接口速查

状态：✅ = 已在页面上用 JS 真跑通；🔸 = 请求体已核对、还没真跑；🖱 = 按钮兜底。

| 方法 | 作用 | 状态 |
|---|---|---|
| `selfTest()` / `where()` | 驱动版本、页面路径、可见性、生成面板状态、存盘方式和队列 | ✅ |
| `wallet()` / `credits()` | 余额（总数、即将过期的点数和日期） | ✅ |
| `projects({offset})` / `find(pid前缀)` | 资产列表，每页 20 条（不带作者信息） | ✅ |
| `proj(pid)` / `history(pid)` | 项目当前版本（类型、状态、是否绑骨、动作、封面文件）/ 版本历史 | ✅ |
| `progress(ops)` / `waitOp(op, ms)` | 查进度 / 等到结束（默认最多 28 秒） | ✅ |
| `stage()` / `idbKeys()` / `idbDel(k)` | 参考图暂存进 IndexedDB | ✅ |
| `toGenerate(mode)` / `uploadRef(name, {slot})` / `clearUpload()` | 切生成页和模式、纯 JS 上传参考图（单图和多视图）、清掉 | ✅ |
| `checkSettings()` / `genBody()` / `generate()` | 核对面板设置、拼请求体、dry 看请求体 | ✅ |
| `generate({go:true})` | 生成，65 点 | ✅（10-04 首次真跑，见 §2.10） |
| `rig(pid)` | dry 看绑骨请求体 | ✅ |
| `rig(pid, {go:true})` | pre_rig_check + 绑骨，20 点 | ✅（10-04） |
| `joints(pid)` | 绑骨体检（对 10-03 的好模型和两版绑坏的小龙女都判对了） | ✅ |
| `retarget(pid, names, {go:true})` | 预设动作，0 点；每次调用提交一个，调到 `left:0` 为止 | ✅（10-04） |
| `exportGlb(pid, npc, {anims})` | 导出 GLB。阿青单模型、男主三动作单文件都命中服务器缓存，sha256 和 10-03 入库的文件相同；重新导出的只差 GLB 里带导出任务 ID 的网格 / 材质名，二进制数据相同 | ✅ |
| `cover()` / `preview()` / `showCovers()` / `hideCovers()` | 封面渲染：取地址、存盘、页面上并排看 | ✅ |
| `saveMode()` / `setSaveMode()` / `flushSave()` / `requeueLast()` / `clearSaveQueue()` | 存盘方式和队列（§4） | ✅ `direct` 连续落盘；`reload` 只验证到排队 |
| `freeRetry(pid, {go:true})` / `restore(pid, op, {go:true})` | 免费重出 / 版本回退，0 点 | 🔸（dry ✅） |
| `genButton()` / `rigButton()` / `btn()` / `guard()` / `lastOp()` | 按钮兜底（§5） | 🖱 |
| `logs(n)` | 驱动自己记的提交流水（生成、绑骨、动作、回退） | ✅ |

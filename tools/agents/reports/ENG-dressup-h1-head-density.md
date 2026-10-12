# ENG-dressup-h1-head-density 报告 · 3D 纸娃娃换装 · H1 · 拼头头部贴图精细化（8K 源贴图 + 头部 UV 岛独立排进图集；0 点）
## 1. 摘要（3–6 行）
作者 10-11「拼头的头像素密度可以做的更好更精细」：旧图集把源件整张 2K 全身图集压进 2048×1792，头部三角只占 8.2%（黄蓉）/ 11.6%（穆念慈）。
`cut_head.py --texture`：用 Tripo 免费重导的 8K baseColor（与源件同 UV 布局），切头后把头部 UV 岛按同一缩放比天际线排进图集、逐岛 Lanczos 重采样、岛外按最近纹素外扩；分析（分类、切口带调平、肤色匹配、身体增益）一律在内嵌贴图口径上算。
黄蓉 / 穆念慈 × tpl_f_medium / tall / small 六份重切全部 `gateLevel: pass`、report `draft`；线性纹素密度为旧图集的 2.02–2.38 倍；skinTint、ΔE、颈环、遮罩、几何、权重、颈片 UV 与不给 `--texture` 时逐项相同。
返修 r1：贴图记录按契约写 `path`；分析固定在内嵌贴图口径；补 CLI 退出码、实际排布反求、legacy 逐字节基线三类测试；报告补实测与更正。不给 `--texture` 时输出与 H1 之前逐字节一致；0 点。

## 2. 产出（文件、行数、主要章节）
- `tools/model3d/dressup/cut_head.py`（3,149 行，相对基点 +209 / −7）：`TextureMismatch`、`load_hd_texture`（尺寸整数倍 + BOX 缩回均差 ≤ 3/255）、`apply_texel_delta`（切口带调平差值同步到高清图）、`uv_islands`、`skyline_pack`、`pack_head_canvas`、`_checkout_roots` / `_library_record`；`process_head(texture_path=…)`：肤色 / 增益 / 条带分析先在旧画布上做完，再排高清头部图集，条带按已定 skinTint 从高清头部画布重烘一次（补充裁定 5）；CLI `--texture`（布局不符打印原因、退出 2、不写产物）。
- `tools/model3d/dressup/tests_head.py`（1,441 行，相对基点 +241 / −3，共 30 项）：H1 相关 7 项——岛 / 天际线、映射与重采样、高清图校验与差值同步、`--texture` 端到端（texture 记录契约、分析量与 legacy 逐项相同、条带身体段逐像素相同）、CLI 坏贴图退出 2（整数倍 / 均差两种原因）、从实际改写 UV 反求岛矩形（16 岛：同一缩放、在画布内、间隔 ≥ 2 px）、无 `--texture` 的 legacy 逐字节基线（H1 前代码在合成资产完整模式实跑的 head.glb / hidemask / preview / self_check 与 fit 摘要）；真实素材复算核对 `source.texture.path`（仓库相对、在本地素材库）、sha256 与实际尺寸。
- `heads/npc_huangrong/**`、`heads/npc_munianci/**`：三体型 head / fit / report / hidemask / preview / self_check 与 manifest；`shots/density.tpl_f_{medium,tall,small}.jpg`。
- 本地素材库（主检出 `apps/game/public/models/props/`，不入 git）：`npc_huangrong_basecolor_8k.jpg`（`34ded9aa…0883`）、`npc_munianci_basecolor_8k.jpg`（`8e59a523…984c`）与整份 8K 导出 `<npc>_tripo_8k_raw.glb`。

## 3. 关键结论与数值
- 8K 导出（0 点）：黄蓉项目 `a2ae3f7b-b146-4cb3-969c-6d76b1b3fdcd` 导出 op `c3ac4cc6-36a1-438c-a078-4ccce1bf30ab`，与切头源件 `npc_huangrong/model_rig.glb` 顶点 / UV / 索引逐字节相同（59,873 顶点 / 93,406 三角）。穆念慈项目 `e7ffcf53-5260-488d-8a22-c34804b882bb` 导出 op `e4f4dd8f-4634-4b43-9d96-43e895ff2620`，与 `source/tripo_rig.glb` 逐字节相同（100,785 / 189,024）；实际切头源 `tripo_rig_s07.glb`（72,297 / 132,316）是它按 `pack_glb.mjs --simplify 0.7 --no-meshopt` 简化所得，内嵌 baseColor 逐字节相同、沿用同一 UV 贴图布局，故同一张 8K 图适用。两张 8K 为导出原样 JPEG 字节（8192²），缩回 2K 与内嵌贴图均差 1.34 / 1.06。
- 排布：黄蓉 112 岛、缩放 0.555（图集像素 / 8K 像素）、覆盖 45.4–45.5%、密度 ×2.372–2.376；穆念慈 10 岛、0.472–0.476、47.2–47.6%、×2.019–2.037。切口带调平无改动纹素（`seamToneTexelsApplied` 0）。
- 六份实测（顶点 / 三角；颈片求解残差 = 颈环残差 mu；接缝色差 p95 下 / 上 legacy → 新；ΔE；G1 最大；idle / walk / run 外露比例）：
  黄蓉 medium 16,387 / 28,130；1.7e-8；0.45 / 1.43 → 0.45 / 1.43；0.032；2.87°；0.14% / 0 / 0。
  黄蓉 tall 16,132 / 27,623；5e-9；0.92 / 1.36 → 0.92 / 1.31；0.021；3.33°；0 / 0 / 0。
  黄蓉 small 16,313 / 27,951；2e-9；0.93 / 1.42 → 0.93 / 1.36；0.032；2.94°；0.14% / 0.14% / 0。
  穆念慈 medium 15,215 / 28,493；7e-9；1.08 / 0.95 → 1.08 / 1.34；0.095；1.65°；0.14% / 0 / 0。
  穆念慈 tall 14,936 / 27,984；5e-9；1.03 / 1.17 → 1.02 / 1.38；0.132；2.70°；0 / 0 / 0。
  穆念慈 small 15,153 / 28,370；1.45e-7；1.02 / 1.08 → 1.02 / 1.28；0.118；2.31°；0.14% / 0.14% / 0。bind 外露六份均 0。
- 分析隔离（r1 返修）：六份 fit 的 `skinTint` / `deltaE` / `ring` / `hideMask` / `diagnostics.color`、hidemask 文件、head.glb 的位置 / 索引 / 权重 / 关节 / 颈片 UV 与基点 `4f3a140e5` 的 legacy 提交版逐项相同（脚本逐份比对）。例：黄蓉 medium skinTint 仍为 `[0.935942175, 0.866535287, 0.858594717]`。
- 条带取色（补充裁定 5）：严格只换头部（条带仍从 2K 旧画布取色）时实测上接缝 p95 黄蓉 1.68 / 1.85 / 1.99、穆念慈 1.53 / 1.49 / 1.55，small 贴近 < 2 的门；分析后按已定 skinTint 从高清头部画布重烘条带，回到上表 1.28–1.43，下接缝与全部分析量不变。
- 回归：不给 `--texture` 时，合成资产完整模式 head.glb / hidemask / preview / self_check 与 H1 前代码逐字节相同、fit 去掉 `durationMs` 与临时目录后相同（golden 测试）；真实素材：当前代码不给 `--texture` 重切穆念慈 medium 到临时目录（完整模式 507 s），head.glb / hidemask / preview / self_check 与基点 `4f3a140e5` 提交版逐字节相同，fit.json 除 `durationMs` 外相同。
- 截图（5173 `/character-3d`，`shoot_head.mjs` 无头 Chrome，dpr 2，最终产物）：`shots/density.tpl_f_medium.jpg` 正脸 / 侧脸 / 颈 3/4 原分辨率裁切对照——睫毛、虹膜、眉笔触、发丝、发饰、耳坠明显更清晰；发际线、颈缝无新接缝或渗色；tall / small 各一张全身小图。
- 耗时：负载约 20–26 时每份完整重切 514–711 s（含 73 帧动作检查），`--fast` 约 60 s；`pack_head_canvas` 约 2 s；对照截图六组共 17 s。

## 4. 开放问题（附默认值）
- 覆盖率受岛形状限制（包围盒约一半空白），矩形排布上限约 45–50%；默认不做非矩形排布 / 拆岛（拆岛会新增 UV 缝）。
- 高清图只在主检出本地素材库：其他机器复跑须先放同名文件（sha256 记在 fit.json `source.texture`）；默认沿用 Tripo 原始件的同一约定。
- legacy golden 摘要依赖本机 numpy / Pillow（libjpeg）版本：依赖升级后先用 `4f3a140e5` 的 cut_head.py 在新环境重算，确认旧代码也变了再改基线。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- H1-P1 / 主要角色头部一律走 `--texture`（Tripo 8K 导出 0 点）/ 同样 2048 图集预算下线性清晰度约翻倍；量产 P5 切头命令随之加参数。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/12-dressup-production.md` P5 切头步骤：加"导出 8K → `--texture`"与本地素材库存放约定。
- `tools/model3d/dressup/README.md` cut_head 段：补 `--texture` 参数、`source.texture` 与 `diagnostics.atlas` 字段说明。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `--texture` 校验（尺寸整数倍、缩回均差 ≤ 3/255，不符打印原因并退出 2、不写产物）；分析用内嵌贴图；`fit.source.texture {path, sha256, size, factor, meanAbsDiffVsEmbedded}`、`diagnostics.atlas` 齐全。
- ✅ 六份门禁全过，线性密度 2.02–2.38 倍（≥ 2；按补充裁定覆盖率只报告）；截图无新接缝、无渗色。
- ✅ 用法（模板目录写全路径；medium 先、tall / small 后，同一 `--out` 目录自动按 `.<模板>` 出变体）：
  黄蓉 `python3 tools/model3d/dressup/cut_head.py --source assets/default/model3d/npc_huangrong/model_rig.glb --template assets/default/model3d/dressup/templates/tpl_f_medium --id npc_huangrong --out assets/default/model3d/dressup/heads/npc_huangrong --texture apps/game/public/models/props/npc_huangrong_basecolor_8k.jpg`；
  穆念慈 `python3 tools/model3d/dressup/cut_head.py --source assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig_s07.glb --template assets/default/model3d/dressup/templates/tpl_f_medium --id npc_munianci --out assets/default/model3d/dressup/heads/npc_munianci --texture apps/game/public/models/props/npc_munianci_basecolor_8k.jpg`。
  换素体后重切（T5 派生齐 tpl_f2_* 之后）：上两条把 `--template` 换成 `assets/default/model3d/dressup/templates/tpl_f2_medium` 先跑，再分别换成 `…/templates/tpl_f2_tall`、`…/templates/tpl_f2_small` 各跑一次；源件、`--id`、`--out`、`--texture` 不变（目录里主体型仍是 tpl_f_medium 时，tpl_f2 产物带 `.tpl_f2_*` 后缀登记进 manifest `fits`）。
- ✅ 写集仅 cut_head.py、tests_head.py、两个头目录与本报告；测试只写临时目录；0 点。
- ✅ 检查命令实跑（负载约 14–26）：`tests_head.py` 30/30 通过（563 s；同一轮先一次真实素材复算仍读旧字段 `texture.file` 报 KeyError，改读 `path` 并加尺寸核对后整套重跑全过）；`selftest.py` 7 项通过（4 s）；两个头三体型 `report*.json` level 均非 fail（ok / ok）；`pnpm install --frozen-lockfile` 退出 0；`pnpm check` 退出 0（189 个测试文件 / 1339 项、包体预算通过，202 s）。

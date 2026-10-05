# 本任务：标准体参考 · 男 / 女标准体（`male_std` / `female_std`）A 字三视图与 6 张视图参考（AR-47；codex 出图）

本任务出图、拆图并登记，不改工具、不改规格、不切部件。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（**出图 runner 由追踪者在沙箱外跑，你只写提示词、入队、取结果**；`worker_no=19`，槽位 2）、`assets/default/prompts/rig/GUIDE.md`（§1 近侧 L 约定、§2 三视图切件流程、§3 旧提示词作废）、`tools/agents/prompts/ART-rig-sheet.md`（三视图英文骨架与质检，本任务照用，但**不上传身份立绘**）、`docs/tech/09-character-rig.md` §1（标准体用途：主角 / 可换装队友 = 标准体 + 装备层；路人 = 标准体 + 调色）、`assets/default/rig/{male_std,female_std}/manifest.yaml`（身高 1.70 / 1.62 m、色槽 palette）、`assets/default/rig/npc_zhujue__ch00_m/sheet/manifest.yaml`（已过审三视图的实际提示词）。

## 作者原话（AR-47，2026-10-03 约 12:40，逐字摘录）
> * 标准体部件参考图 6 张：动作改走「具名角色三视图切件」后，待定是否还要。
> 这些都要做

## 口径
- `assets/default/prompts/rig/{male_std,female_std}/ref_{front34,side,back34}.md` 是 AR-22 旧队列（「近侧为右侧」、512×512 透明单视图），GUIDE §3 已判作废。本任务按 GUIDE §2 的现行做法：**每个标准体一次出一张 A 字三视图**（三栏同一人、同衣同色，比分三次出更一致），再用 `tools/rig/sheet_split.py` 拆成三张视图参考 → 2 体 × 3 视图 = 6 张参考。
- 标准体是**无身份的普通成年人**（男：束髻、无须或淡胡茬；女：挽髻素簪），素色交领右衽窄袖短衣与下裳、布鞋，无兵器、无披风、无配饰；衣色贴近 manifest 的 palette（clothPrimary #6B5141、clothSecondary #394C53、skin #E9CFB4、footwear #332B27、hair #211C1A），便于运行时调色与叠装备层。成年比例，禁幼态；手绘质感、去 AI 化那一句照 `_codex_portrait.md` §2。
- 下裳要短到小腿以上或用束口裤，**两腿之间、腋下都要能看到背景**（切件要分大腿 / 小腿）。

## 要做的事
1. 提示词：照 `ART-rig-sheet.md` 第 2 条英文骨架改写（去掉 Image 1 身份句，改为文字描述上面的人物与衣着；可选：把 `npc_zhujue__ch00_m/sheet/sheet_L.png` 缩小 JPEG 作 Image 1，**只取版式、姿势、比例与画风，明确不取脸和衣着**——若出来的脸 / 衣像主角，就去掉这张参考重出）。三栏从左到右 `front34 | side | back34`，**都面向画面左**（未镜像，近侧为解剖学左 L：front34 时左肩左臂左腿离观者近；side 面向画面左边缘；back34 背对、朝左上）；A 字站姿、空手、同一身高、同一地平线；背景平涂 #E6E1D8、无地面阴影、无文字网格色板；1536×1024 横幅。
2. 队列行 `job_id|asset_id|none|<提示词文件>|<参考 JPEG 或留空>`（第 3 列 `none` = 不附人物立绘基线）；每体先出 1 张，`view_image` 质检（下条），不合格整张重出，每体最多 3 张。
3. 质检：恰好三个全身人物、顺序与朝向正确、腋下与两腿之间透背景、手里无物、三人身高差 ≤ 3%（量像素）、右衽、不像主角（与 `por_npc_zhujue__ch00_m_base.png` / `_f_base.png` 并排看）、画风与主角三视图同一写实手绘。
4. 入库：`assets/default/rig/<set>/sheet/sheet_L.png`（原样保存，不裁不缩）+ 同目录 `manifest.yaml`（顶层列表，字段照 `npc_zhujue__ch00_m/sheet/manifest.yaml`：`id: <set>__sheet_L`、`category: rig/sheet`、`prompt` 全文、`tool: codex exec · image_gen`、`model: gpt-6-astra`、`size`、`sha256`、`references`、`status: candidate`、`notes` 写视图顺序与朝向、重出次数、身高像素）。
5. 拆图：`python3 tools/rig/sheet_split.py assets/default/rig/<set>/sheet/sheet_L.png --out assets/default/rig/<set>/ref --facing L --height-m <1.70|1.62>`（男 1.70、女 1.62）；得到 `ref/{front34,side,back34}.png` 与 `ref/sheet.json`；改名为 `ref/ref_front34.png`、`ref/ref_side.png`、`ref/ref_back34.png`，并同步改 `sheet.json` 里的 `file`。拆图报腋下 / 侧视比例检查失败就回第 2 步重出。
6. 登记 `assets/default/rig/<set>/ref/manifest.yaml`（顶层列表，3 条：`id: rig_<set>__ref_<view>`、`file`、`category: rig/ref`、`style: default`、`subject`、`prompt`（写「由 sheet_L 经 tools/rig/sheet_split.py 拆出」+ 实际命令）、`tool: tools/rig/sheet_split.py`、`model: none`、`created`、`size`、`sha256`、`status: candidate`、`references`（sheet_L 路径与 sha256）、`notes`（身高像素、脚底 y、腋下空隙））。
7. 旧提示词：把 6 份 `assets/default/prompts/rig/<set>/ref_<view>.md` 的 frontmatter `status` 改为 `superseded`，`output` / `manifest` 改为上面的新路径，正文开头加一行「已按 GUIDE §2 改由 sheet_L 拆出（ART-rig-std-refs）」；逐部件提示词（`<view>/<part>.md`）不动。
8. **不切部件**：`male_std` / `female_std` 的顶层 `manifest.yaml` 与 `front34/ side/ back34/` 程序占位件保持不动（切件另立任务）。注意：集成分支上这两个占位 set 的 `make_parts.py --check` 已经不通过（「manifest differs from normalized source parts」，既有问题、不在本任务写集），不要去修，报告 §6 记一笔即可。

## 约束
- 只写：`assets/default/rig/male_std/sheet/**`、`assets/default/rig/male_std/ref/**`、`assets/default/rig/female_std/sheet/**`、`assets/default/rig/female_std/ref/**`、`assets/default/prompts/rig/male_std/ref_*.md`、`assets/default/prompts/rig/female_std/ref_*.md`、本任务报告。
- 不改 `tools/**`、规格文档、主角素材；中间件放 `…/gem/codex_w19/`；每次写入 ≤ 150 行；报告 ≤ 50 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/rig/male_std/sheet --min 1 --max 1 --min-side 1000`
- `python3 tools/agents/check_assets.py assets/default/rig/female_std/sheet --min 1 --max 1 --min-side 1000`
- `python3 tools/agents/check_assets.py assets/default/rig/male_std/ref --min 3 --max 3 --min-side 256`
- `python3 tools/agents/check_assets.py assets/default/rig/female_std/ref --min 3 --max 3 --min-side 256`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：两体各重出几次、三栏身高像素、腋下 / 腿间空隙、是否用了版式参考图；第 6 节：给后续「标准体切件」任务的接口建议；第 7 节逐条对照质检项与检查命令。

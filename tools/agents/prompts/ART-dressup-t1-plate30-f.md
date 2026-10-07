# 本任务：3D 纸娃娃换装 · 阶段 T1 · 女光头素体 30° 窄 A 底图（图像编辑 + 2D 门禁；AR-104）

本任务出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`tools/agents/prompts/_imagegen.md`（**出图唯一合规方式：沙箱里转调本机 Codex `gpt-6-astra` image_gen**）、`docs/tech/11-paper-doll-3d-impl-spec.md` §0、§2 阶段 T、§10.T，`docs/tech/10-paper-doll-3d.md` §1.3、§2.1，以及 `.claude/skills/tripo-web/SKILL.md` §1~§2（素体铁律：光头、裸足、薄透裹胸、高叉三角裤、无饰物、露额、唇色、眼周匀质）。T0 报告 `tools/agents/reports/TOOL-dressup-t0-plate.md` 第 7 节给出 check_plate 用法。

## 作者要求
**AR-104**：规范 A 字张角 30°（上臂与竖直夹角 30° ± 3°），模板路 A 以此图生成女中等模板 `tpl_f_medium`（1.66 m）。**AR-97 / AR-99**：素体铁律；高武力女性腿型（大腿紧致、小腿细长）。**AR-93 / AR-99**：8.8~9.0 头身（2D），送 Tripo 前已含颈下拉伸补偿——**比例不得改动**。

## 输入
- 底图：`assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png`（1024×1536，现上臂约 39°~43°；它就是现素体的 Tripo 输入，脸、身材、裹胸三角裤都已经作者认可）。

## 要做的事
1. 先 `python3 tools/model3d/dressup/make_template_plate.py measure <底图> --json` 记下底图测量值。
2. 用 Codex image_gen 以底图为 `-i` 参考做**图像编辑**，只改双臂姿态：上臂与竖直夹角 30°（左右对称），肘部自然微屈、前臂顺延、手掌朝内、五指并拢放松、空手；**其余一切逐像素保持**：同一张脸与五官、光头、同一身材比例与头身比、同一裹胸与三角裤、裸足、站姿、画布 1024×1536、白底、人物位置（头顶 / 脚底像素行不变）。提示词首句按 `_imagegen.md` 固定，其后写清上述约束，并明确 "do not change the face, head size, body proportions, legs, feet, underwear, background or canvas framing"。
3. 每张输出都跑 `check_plate.py --plate <底图> --image <输出> --arm-angle-deg 30 --arm-tol-deg 3 --overlay <叠加图> --json`；不过就调整提示词重出（最多 8 次），记录每次的臂角与失败项。与底图并排 `view_image` 确认是同一个人（脸、发际 / 光头轮廓、唇色、眼周）。
4. 通过后存为 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose30.png`（RGB PNG，1024×1536），叠加图存 `…_apose30_overlay.png`，在同目录 `manifest.yaml` 追加两条（`tool: codex exec · image_gen`、`model: gpt-6-astra`、`source_path`、`prompt`、`references`（底图路径 + sha256）、`sha256`、`size`、`check_plate`（逐项数值）、`status: candidate`、`notes`）；若底图本身没有 manifest 条目，顺带补一条（`status: approved`、`notes: 现光头素体 Tripo 输入，AR-99`）。

## 约束
- 只写上述 3 个文件（新图、叠加图、manifest.yaml）与本任务报告；不改底图。
- 禁止用 Pillow / 代码对手臂做几何变形或拼贴来"凑"角度（`_imagegen.md` 硬规则）；check_plate 只做测量。
- 不调用 Tripo、不花点数（Tripo 由 T2 在协调者看图放行后做）。

检查：
- `python3 tools/model3d/dressup/check_plate.py --plate assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png --image assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose30.png --arm-angle-deg 30 --arm-tol-deg 3`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：底图与终稿的逐项测量（左右臂角、头顶 / 脚底、脸区 IoU、跨度比、髋高比、头身比）、出图次数与每次失败项、终稿与底图的差异自评（脸 / 身材有无变化）；第 7 节写交给 T2 的输入（路径、sha256、建议 Tripo 选项：单图 `image_to_model`、H3.1、Ultra、8K、PBR、delight、100k 面）。报告 ≤ 60 行。

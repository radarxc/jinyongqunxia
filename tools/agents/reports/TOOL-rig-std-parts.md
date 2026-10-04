# TOOL-rig-std-parts 报告 · 标准体切件 · 男 / 女标准体由 A 字三视图切出 39 件正式部件、替换程序占位，make_parts --check 转绿（AR-47；main 13:58；traex GPT-5.6-Sol max）
## 1. 摘要（3–6 行）
- 已从两张 `sheet_L.png` 按 256 px/m 切出男 1.70 m、女 1.62 m 标准体，各交付三视图 × 13 = 39 件正式 RGBA 部件；manifest 为 `kind: standard`、`nearSide: L`，保留 palette 且无 placeholder。
- 本轮只重出六张 `thigh_shared.png`：用各自源图可见裤料续接衣摆遮挡的大腿上段，并将大腿置于衣摆后；其余 72 件相对上次审校快照 SHA-256 不变。
- 两套姿势条带与各 51 帧八方向 Walk GIF 已重建；审核点名的 front34 第 5 列、back34/side 第 3 列髋部楔形缺口已消失。
- 全量动作目检、关节圆自动检查及题定全部门禁通过。
## 2. 产出（文件、行数、主要章节）
- `assets/default/rig/{male_std,female_std}/{front34,side,back34}/`：各 39 PNG、39 份 pivot 旁注、3 份关键点；`work/L/` 各 3 张 256×480 归一视图与 `sheet.json`。
- `manifest.yaml`：各 1,571 行、39 part + 39 asset；六条 thigh 的尺寸、哈希、pivot、补绘率、限制/重建方式/像素数已同步。
- `preview/`：各一张 1344×992 pose strip 与一张 2048×320、51 帧 `walk_dir8.gif`。
- `tools/rig/segment_parts.py` / `preview.py` / 测试：新增默认关闭的隐藏髋部补齐、短衣大腿后置渲染及回归；`make_parts.py` 透传 `reconstructedPixels`。
## 3. 关键结论与数值
- 男 Q1：沿用已验的确定性 Lab 主色口径，前三色最大 ΔE2000 为 1.269 / 1.992 / 2.247（front34 / side / back34），均 ≤10；补齐像素只采样本视图裤料。
- 男 Q2：39/39 单连通；整体平均补绘 6.321%，最大 53.921%（back34/thigh）；thigh 补绘率 51.831% / 51.195% / 53.921%，补 2871 / 2519 / 3025 px；标准体回退 0。
- 男 Q3：Walk clip 51×8 帧、14 个 FK 关节 3 px 圆共 165648 像素透明数 0；程序 idle/walk/run × light/medium/heavy × 12×8 共 864 帧透明数 0/350784，无髋缝。预览：`male_std/preview/male_std__walk_medium__pose-strip.png`、`walk_dir8.gif`。
- 女 Q1：同口径最大 ΔE2000 为 2.011 / 2.808 / 2.376，均 ≤10；补齐像素只采样本视图裤料。
- 女 Q2：39/39 单连通；整体平均补绘 6.435%，最大 43.536%（front34/thigh）；thigh 补绘率 43.536% / 41.265% / 43.406%，补 2307 / 1790 / 2205 px；标准体回退 0。
- 女 Q3：与男同口径 Walk 为 0/165648、程序全动作 864 帧为 0/350784；无髋缝。预览：`female_std/preview/female_std__walk_medium__pose-strip.png`、`walk_dir8.gif`。
## 4. 开放问题（附默认值）
- 两套资产仍为 candidate，作者尚未做最终观感审批；默认保持 candidate，不冒充 approved。
- 人工修点工时未从早期运行单独计时；默认记“未测”，不拿自动流水线时间代替。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无：按 AR-47 与 tech/09 §1、§6 落地，未新增玩法或规格事实。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- ENG（标准体 + 装备层 / 调色）/ rig 加载：消费 `kind/nearSide/heightM/palette`；39 个 source part 展开为 16 运行槽；装备层复用同 pivot / childJoint；调色只用 part 的 tintable palette key；`garmentOccludedHip` 的 thigh 必须排在 `pelvis_skirt` 后。
- TODO.md / AR-47：由调度器登记男 / 女标准体正式切件、预览与门禁完成；本任务未改 TODO。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 1–2：复用 `work/L` 三视图；男 `round(1.70×256)=435 px`、女 `round(1.62×256)=415 px`；Vision 降级为带置信度 manual-prior，既有修点保留。
- ✅ 3：两套各 39 件、alpha≥8 均单连通；只改六张 thigh，因衣摆遮挡补齐髋部，旁注如实记录高补绘率与像素数；无标准体回退。
- ✅ 4：两 manifest 为 standard/L/1.70 或 1.62，palette 不变、无 placeholder；男女 `make_parts --check` 通过。
- ✅ 5：逐件看完两套 39 件；程序 idle/walk/run 各 light/medium/heavy 的 12 相位 × 8 方向逐帧检查（每套 864 帧），均无缝隙、楔形、残片、异常重叠或比例漂移；idle 三档同画面。
- ✅ 5（正式预览）：逐帧看完两套 Walk GIF 各 51×8 帧及 pose strip；审核点名帧均修复，衣摆遮住补齐区、脸发衣色与各自 sheet 一致。
- ✅ 6：`--complete-hidden-thigh` 为显式 opt-in，默认行为不变；补齐与 garment 后置各有回归；男主 `--check` 通过。
- ✅ `python3 -m unittest discover -s tools -p "test_*.py"`：最终状态 685/685，OK（437.220 s）。
- ✅ 三条 `make_parts --check`；男女 `check_assets --min 39 --max 60 --min-side 16` 各 39 张/0 问题；`check_ids --strict` 新增失败 0。
- ✅ 其余 72 件对审校快照 `9b01134b` SHA-256 不变；sheet/ref/clips/主角素材未改，修改无越界；`git diff --check` 通过，未运行改变仓库状态的 git 命令。

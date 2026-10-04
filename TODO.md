# TODO：天书录（2026-10-04 09:00 起）

旧版 TODO 归档在 `docs/archive/TODO-2026-10-04.md`。启动方式和 skills 入口见 `AGENTS.md`，AR 完成状态见 `docs/decisions/author-requirements.md` 开头。

## 0. 现状
- **M1**（开局 → 序章 → 初眠 → 白马第一段）：只差 `ENG-ch00-encounter-wiring`，其余都已合入。
  - wiring 第 3 轮审核没过，执行次数用完，停在 HOLD-RUNS。还要再起一轮返修，命令见 §5。
  - wiring 合入后，在浏览器里实走一遍 M1，照 wiring 报告里的「序章三战手动实走步骤」走。
- **额度**：开发监督（Claude）10-04 约 07:20 用完周额度，10-09 12:00 重置，现在改用 credit，要省。
  - 不开监视，不开开发监督。
  - 驱动、运维守护进程、城图调度都还在自己跑，这些不耗 Claude 额度。
- **主干**：全绿。首次会话 94.9 KiB，目标 ≤ 92；render 179.42 KiB，门值 180，余量只剩 0.58 KiB。

## 1. 等作者
1. 霍青桐选 C / D / E，建议 D：`.agents/coord/_lines/huoqingtong-r2/CDE_huoqingtong.jpg`。
2. 历史人物第二批 21 人：`.agents/coord/_lines/hist-batch2/overview_{1,2,3}.jpg`。
   - 建议徐达、常遇春穿戎装：原著阶段他们还在义军，没封王。
   - 批了再入库，并对齐他们的立绘和插图；ch00–ch04 原著返修里这几人的问题一并处理。
3. 过目这些新交付：
   - 小镜湖 r5「遗憾的笑」；
   - 绿柳庄照剧照重画；
   - 江湖归去远景；
   - 襄阳献礼；
   - 郭靖 B 全量；
   - 四位女主；
   - 索菲娅身材；
   - 张无忌 F。
4. AR-21 是否还要改用 Next.js：现架构是 Vite + Vue，DES-tech-nextjs 已取消。
5. 衣物 565 件出图要用作者 Chrome 里的 Gemini，窗口得在前台。作者方便时开两个标签页，先出一组样图看。

## 2. 工程
- **HOLD-RUNS**：`ENG-ch00-encounter-wiring`（M1），再起一轮返修，见 §5。
- **READY（合入时冲突，要挪基点、解冲突）**：
  - `ENG-move-onhit-effects`；
  - `DES-prologue-ch00`，10-01 的旧件，先判断还要不要。
- **在跑**：`ENG-dialogue-runtime-lazy`，把对话意图执行器拆出首屏，验收要求首次会话 < 92。
- **已登记待起**：
  - `ENG-render-diet`：render < 170，挪出去的分块必须有预算；
  - `ENG-27a/b/c`、`ENG-28a/b`：依赖的 18c 已合入；
  - `ENG-12d`、`TOOL-town-gaps-1`；
  - `TOOL-step-lazy-worktree`：磁盘 ≥ 8 GiB 再起。
- **旧件，要人看过再定**：
  - HOLD-VALIDATE：`ART-rig-parts-female/male`、`VFX-sk_dugu9`；
  - HOLD-REVIEWS：`ART-item-armor`、`VFX-sk_hama`；
  - ERROR：`ART-item-hidden-weapons`。

## 3. 素材
- **大地图**（AR-83）：地形和贴片都已合入。
  - `TOOL-map-compose` 第一版画风不合格：块状像素、没有山形、河流带刺，已拦下。
  - 按 `devsup_note_style.md` 的 7 条返修完了，停在 HOLD-REVIEWS，等协调者看 `assets/default/map/composed/sample/*_vs_approved*` 对照图，看过才进审核。
- **城图**：202 / 1172，city_scheduler 自己在推；`CITY-layouts-ch01-b` 审核没过，正在返修。
- **插图**：26 份提示词还没出图，清单在 `.agents/coord/_lines/title-audit/missing_plates.tsv`。
- **衣物与护甲**（AR-77）：数据 8 批已合入，565 张图待 Gemini 出。换色件带 `edit_from`。
- **礼品**：还差 `it_yuanqinshufang`（七弦琴），要配参考照。
- **人物立绘派生**：base 改过一大批，`portrait_stage_runner` 派生和素材审核页（artifact 7H7nYXyBSRJJSNFBwsDGjM）还没重跑。

## 4. 3D（AR-85 搁置，M1 跑通后再排）
- 待办：
  - AR-79 全量重做：新比例、脸部还原、贴图严查、按原著身高；
  - 郭靖金刀驸马装；
  - 换过脸的主角重做；
  - 通用模型的小瑕疵：男模瞳色偏灰蓝，女模鬓边碎发贴成了肤色。
- 参考资料：
  - 体检 `.agents/coord/ART-3d-tripo-web/audit_ar79.md`；
  - 比例样张 `_lines/apose-ar79/apose_samples.jpg`；
  - 身高表 `_lines/apose-ar79/heights.csv`；
  - 各会话的 `todo_3d.md`；
  - Tripo 会把头放大 4–6%，送图前要拉长（女模 ×1.1644）；
  - 走路速度约 0.6、跑步约 2.1 模型单位 / 秒。

## 5. 恢复命令（在 `.agents/wt/_prod` 下）
- wiring 再起一轮返修（审核意见会自动附上）：
  ```bash
  python3 .agents/coord/_handoff/detach_launch.py .agents/coord/ENG-ch00-encounter-wiring/supervise.out "$PWD" -- python3 -u tools/agents/supervise.py ENG-ch00-encounter-wiring --max-reviews 1 --max-runs 1 --auto-merge --worker --model GPT-5.6-Sol --effort max --checks .agents/coord/PROD/review_checks_eng.md --from start
  ```
- 其余见 `AGENTS.md` §2。

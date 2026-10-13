# 换装线（3D 纸娃娃）现状与待办（2026-10-13）

本文是换装线的接手入口：目标、作者决定、已完成、进行中、待办与操作要点。方案见 `10-paper-doll-3d.md`，实现 spec 见 `11-paper-doll-3d-impl-spec.md`，量产流水线见 `12-dressup-production.md`。

## 1. 目标与作者决定

- **10-11**：回到拼头方案，头部贴图做精细；重做「好看的女性素体、帅气的男性素体」，颈肩参考《逆水寒》；「一个好的基础版本比改半天要好很多」。
- **10-11**：「六个素体可以，但是换黄蓉头以后有问题」（黑洞 + 光头互穿）。
- **10-12**：「按新素体重新生成」劲装（约 85 点），布衣作为换色版 0 点跟上。原因是旧劲装套不上新女素体：新素体胸部更饱满、更低，离地 1.17 / 1.20 m 躯干围度大 9–10 cm。
- **10-12**：「衣物到位后再切」默认素体。
- **本阶段终点**：
  - 新女素体 tpl_f2 三体型上，头、衣物、贴图层、道具齐全并过门禁；
  - 换装页默认素体从 tpl_f_medium 切到 tpl_f2_medium；
  - 之后 W1 量产前问作者。

## 2. 已完成

| 任务 | 内容 | 位置 |
|---|---|---|
| T4 / T4b / T5b / T5 | 六体型模板：女 `tpl_f2_{small,medium,tall}`（1.58 / 1.66 / 1.72 m）、男 `tpl_m_{lean,medium,bulk}`（1.76 / 1.81 / 1.86 m）；颈环改 section 实际截面；倒置面 0 | 主干 1d8ca61fe |
| H1 | 头部 8K 贴图，UV 岛独立排进图集，线性密度 ×2.0–2.4 | 主干 0503e98c9 |
| R1 `ENG-dressup-r1-heads-f2` | 黄蓉 / 穆念慈 × tpl_f2 三体型切头。换装页变体只在同一套素体（tpl_f / tpl_f2 / tpl_m）内回退，换套时跨套素材自动卸下（`useDressupIndex.ts`）。cut_head 两处修正：先裁后收细（`apply_neck_fit`）；切口逐角权重在骨骼集合切换角两侧 15° 渐隐（`truncate_ring_weights`）。一审 PASS | 主干 a68ea9864 |
| T6 `ENG-dressup-t6-sockets-f2` | tpl_f2 腰 / 胸插槽修正。Tripo 绑骨的 Spine 权重只覆盖后背，旧规则把腰插槽放到后腰（佩剑飘在臀后），胸插槽落右胸。`export_skeleton.py --socket-mode waist-band` 改为腰取自然腰线躯干截面、胸取左侧；tpl_f / tpl_m 不变。一审 PASS | 集成分支 d69364687（本次并主干） |

## 3. 进行中

| 任务 | 状态 | 下一步 |
|---|---|---|
| R2 `ENG-dressup-r2-refit-f2`：四件道具（龙泉剑、斗笠、青锋剑、玉佩）× tpl_f2_medium | 按 T6 新插槽重做；执行与校验已过（READY，31 个文件），未送审 | 协调者用任务 dev（r2-dev，127.0.0.1:5192）实拍四件道具 × idle / walk / run（正 / 侧），存 `props/<id>/shots/r2.tpl_f2_medium.jpg`，然后 `supervise --from review --auto-merge` |
| R3 `ART-dressup-r3-jinzhuang-f2-gen`：新素体劲装 / 布衣衣图底板 + Tripo 整身生成与绑骨 | 产物全过：两张底板门禁过；Tripo 项目 `8421bc50`，85 点，余额 16,580；65 关节；封面质检过。一审 FAIL，只差三处记录问题 | ① 两条底板 manifest 的 `source_path` 改成原图实际位置（集成工作区 `.agents/coord/_dressup_review/r3_plates/`），报告第 11 行同步；② `source.json` 的 `options.rig` 补实际 `model_version`（查项目确认，T4 为 `v3.0-20260909`）；③ 报告第 2 节写入六类检查的实际结果。然后 `--from validate` |
| R4 `ENG-dressup-r4-jinzhuang-f2-fit`：新劲装抽衣壳 + tpl_f2 三体型贴合 + 布衣 + 贴图层 | 已登记，依赖 R3 | R3 合入后启动（traex，GPT-6-Astra max）；`--no-review` 跑完后协调者实拍，再送审 |

## 4. 待办（按顺序）

1. R3 返修三处 → 校验 → 审核 → 合入集成分支。
2. R2 实拍 → 审核 → 合入。
3. R4 启动 → 实拍劲装 / 布衣 × 三体型 × idle / walk / run → 审核 → 合入。
4. 默认素体切换：`apps/game/src/pages/Character3dPage.vue` 的 `selectedTemplate` 由 `tpl_f_medium` 改为 `tpl_f2_medium`（R2、R4 合入并实拍确认后）→ 并主干 → 5173 复核 → 截图给作者。
5. W1 前问作者：
   - 男素体首批头与衣物版型清单，是否另出男性衣图 / 3D 源件；
   - 无 3D 模型的约 76 个主线头生成约 6,460 点，超当前余额（16,580 点里扣掉其他开销）约 670 点。
6. 已知问题与开放项（默认不动，量产前再议）：
   - 男头顶一条细浅色贴图缝。
   - 女颈短半径余量紧（0.02512 / 下限 0.025 mu）；男颈截面长宽比约 1.28（上限 1.3）。
   - `check_sockets.py` 的兵器倾角扫描会被远处判错符号的点误导。R2 用裁定把龙泉剑定为 60°，工具未改。
   - G1 切片贴合（ADR 0002）仍待作者拍板。
   - R3 两条提案待并入 tech/12 P2：衣图底板以物品图（无人）作衣服参考；底板门禁加身材三项（肩部轮廓逐行差、腰宽比、腿轮廓 IoU）。
   - `_code.md` / tech/01 写的 Node 24 / pnpm 12 与 package.json（pnpm 9.15.9，engines 禁 pnpm ≥ 10）不一致，以 package.json 为准。
   - agy 出图常不守「只用一次」，会多耗额度。
   - `tests_prop.py` 旧主件锚点逐位断言、`dressup-assets.test.ts` 同 id 多变体累加：这两个测试修正在 R2 里，随 R2 合入。

## 5. 接手要点

- **工作区**：
  - 集成工作区 `.agents/wt/_dressup`，分支 `claude/dressup-3d-stage-a`；
  - 任务工作区 `.agents/wt/_dressup/.agents/wt/<任务 ID>`；
  - 任务说明 `tools/agents/prompts/<ID>.md`，登记在 `tools/agents/tasks.json`；审核意见在 `.agents/reviews/<ID>.r*.md`。
- **调度**：`python3 tools/agents/supervise.py <ID> --from start|validate|review --review-model GPT-5.6-Sol --review-effort xhigh --checks .agents/coord/PROD/review_checks_eng.md --worker [--auto-merge] [--no-review]`。
  - 用 `Popen(start_new_session=True)` 脱离会话启动；
  - Claude 亲自执行的任务用 `--max-runs 0`；
  - 要协调者实拍的任务先 `--no-review`，实拍后 `--from review --auto-merge`；
  - 挪基点：`.agents/coord/_handoff/rebase_task.py <ID> --new-base <提交>`。
- **并主干**：`cd .agents/wt/_dressup && python3 .agents/coord/_dressup/merge_to_trunk.py --dry-run`，再去掉 `--dry-run` 正式跑。
  - 主检出 dev 5173 只监听 `[::1]`；
  - 刷新素材：`touch apps/game/vite.config.ts`。
- **Tripo 与出图**：
  - Tripo 只经 9223 常驻进程（`tools/imagegen/tri_pipeline_runner.mjs`），生成、绑骨各只提交一次，点数记 `assets/default/model3d/dressup/credits_ledger.jsonl`；
  - 签名地址用 curl 下载（本机 Python 证书库未配）；
  - 衣图 / 素体底板用 agy CLI 无头出图，Gemini 网页要标签页在前台，会打扰作者浏览器。
- **实拍**：
  - 页面调试钩子 `window.__dressup`（`viewer.captureScreenshot()`、`actor.playClip` / `update` 定格），经 `.agents/coord/_dressup/shot_receiver.py <目录> <端口>` 落盘；8799 被旧进程占用，改用 8797；
  - 头用 `tools/model3d/dressup/shoot_head.mjs --template <tpl>`。

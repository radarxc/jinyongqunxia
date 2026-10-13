# 城镇探索 v2 · 目标、进度与待办（2026-10-13 08:30）

本文是城镇探索 v2 线的接手入口。方案见 `tech/14`，引擎 / 数据 / core / 界面 spec 见 `tech/15`，3D 古建 / 室内 / 人物 spec 见 `tech/16`。数字与提交号以本文写成时为准；之后的变化看 `.agents/coord/_town2/queue.log` 与各任务的 `.agents/coord/<ID>/supervise.status.json`。

## 1. 目标

- **AR-114**（作者 2026-10-10 / 10-11）：
  - 「小地图探索」全面升级：人物大小与建筑要匹配；用 three.js 做能走进去的建筑；采买在建筑里进行，搭配 NPC 对话；右上方给小地图，点击自动寻路；缩放支持键盘快捷键。
  - 执行器：traex GPT-5.6-Sol xhigh。
- **作者拍板**：
  - 建筑由代码生成 3D 古建，原地进屋，Q/E 转镜头；
  - 人物用 3D 模型，按身高缩放；
  - 小地图跟镜头转，设置里可改上北下南；
  - 不加运行时社区库。
- **AR-117**（10-11）：小地图参考逆水寒做成微缩城镇图并标关键建筑；缩放用竖直条；南北用司南示意。
- **闸门**：
  - **G0**：P1 在现有城镇页见效，协调者验；
  - **A**：体量与比例，作者看 `/town-lab` 联系表；
  - **B**：材质，加走进店里；
  - **C**：`?town=v2` 三座试点城实玩，通过后改为默认。

## 2. 进度

- **G0 完成**（10-12 04:50）：P1 全部并入主干 `claude/vigilant-wright-2unuk1`。
  - 5173 实测通过：缩放键、小地图（缩影、跟转、司南）、全城图、点标记寻路。
  - 并主干记录：54eeb9487 → 4840650a3 → a7869ac80 → 452b5c022 → 0410b29fa（最近一次，10-12 08:20）。
  - 0410b29fa 之后集成分支 `claude/town-v2` 又合入了 i1、r7、d1、两个 DES、t4，**还没并主干**。
- **已合入集成分支 36 个任务**：
  - P1：v1-minimap、input-port、txminimap、shop-schema、heights、actionmap、kernel-prep、shop-core、dialogue-facility、txshop、shop-wire、minimap-art、v1-page、minimap-fit、facility-key、DES-town2-pilot-content；
  - 引擎：regionmap-ext、chunks、explore-graph、render-core；
  - 建筑：p0、p1、p2、r0、r1、r2、r3、r4、r7、r9、t1、t4；
  - 室内：DES-interior-01-facilities、i1；
  - 人物：d1；
  - 文档：DES-town2-docsync。
- **协调者热修**（10-12，5173 实测发现，均有用例）：
  - 0f8219d97 设施键改按城镇编译记录的设计稿认布局（`townLayoutKey()`）；
  - f2c4bc322 缩影标记对可进的楼显式带楼号（大理 ch01 赌坊与药铺共用门格）；
  - 0650d1b08 设施对话说话人显示「店名 + 角色」；
  - 995f9ebfc 统一 town-scene、region-map、region-binding 的文本键文法。
- **5173 卷十借用大理的购物链路**：进苍山药肆 → 交谈 → 掌柜对话 → 看看货 → 店铺层都已走通。货单卡在 `SHOP_TOWN_LEVEL`：卷十大地图节点都没配区域强度，见 §4 第 5 问。

## 3. 在制品（执行次数用完，停在 HOLD-RUNS，等协调者）

各任务工作区里未合入的改动已另存为分支 `town2-wip/<任务名>`，基于该任务的基点，没有并进集成分支。

| 任务 | 最新审核 | 主要卡点 |
|---|---|---|
| ENG-town2-explore-walk | r2 FAIL | `travelTo` 的 O(1) 校验；忙碌时停步与六条命令的拒绝 |
| TOOL-town2-compiler-core | r4 FAIL | 城墙城门（门内两格出生点）；C6 与真实区域边 |
| ENG-town2-render-ports | r1 FAIL | 建筑垂直尺寸；分格与 draw 数 |
| ENG-interior-r8-props | r6 FAIL | 逐变体三角预算；测试真实性 |
| ENG-actor3d-a1-core | r1 FAIL | 转身缓动；LOD 主角保证 |
| ENG-buildgen-p3-compound | r1 FAIL | `planBuilding` 的 compound 分派；`preferSouthHall` 与子房一致 |
| ENG-buildgen-r5-adobe | r2 FAIL | 唐式佛教吐鲁番真实方案；椽距 600 ±1 mm |
| TOOL-actor3d-t1-lod | r2 FAIL | 六个素材的支撑脚滑移硬门；生产管线完成状态 |
| ENG-interior-i2-more | r1 FAIL | 求解器注册；寺庙模板 |

处理顺序建议：
1. 闸门 A 关键路径上的 p3 → p4 → l1 → t3，以及 r8（它挡着 fixture-world、l1、r10）；
2. 编译器（它挡着 sources-pipeline → worldmap-pilot → session-v2）；
3. 行走与渲染端口（它们挡着 explore-facility、perf-gates、explore-page）。

已经连续多轮不收敛的（r8 六轮、编译器四轮），按 AR-110 由协调者直接实现，仍走校验与 GPT 审核。

## 4. 待办

- **等作者回复的五件事**：
  1. 卷十预览存档是 0 文：开发面板加「给 1000 文」，还是让预览存档自带钱；
  2. 主检出里别的线未提交的改动怎么处理（10-13 作者让各线提交各自工作区，主检出由别的 agent 处理，城镇线不碰）；
  3. 磁盘清理清单（其他会话在 /private/tmp 下的临时目录约 4.8 GB；主检出 10-07 的旧 `apps/game/dist` 1.2 GB）；
  4. 招牌字体马善政（OFL）的下载许可；
  5. 卷十节点没配区域强度时店铺按什么城镇等级定价（建议先按 1 级）。
- **等依赖的 12 个任务**：
  - TOOL-town2-sources-pipeline：等 compiler-core；
  - ENG-buildgen-p4-invariants：等 p3；
  - ENG-buildgen-r6-compound：等 p4；
  - ENG-buildgen-fixture-world：等 r8。它把网格器 `inspect.ts` 与 `walls.ts` 改成按世界坐标读家具，10-12 新登记。
  - ENG-townlab-l1：等 p4、fixture-world；
  - TOOL-buildgen-t3-capture：等 l1；
  - ENG-town2-explore-facility：等 explore-walk；
  - ENG-town2-perf-gates：等 explore-walk、render-ports；
  - TOOL-town2-worldmap-pilot：等 sources-pipeline；
  - ENG-town2-session-v2：等 explore-facility、sources-pipeline、worldmap-pilot；
  - ENG-town2-explore-page：等 session-v2、render-ports；
  - ENG-buildgen-r10-worker：等 p4、r8。
- **还没写任务书的**：r11-perf、a2 / a3 / a4、l2-walkin、t2-dressup-lod（先和换装线对文件名）、signs-t5（下载字体先问作者）、美术 a1 / a2、试点整合（协调者按 AR-110 做）。
- **其他**：
  - 集成分支再并一次主干：`merge_to_trunk.py` 先 dry-run；
  - 测试套件泄漏临时目录（`$TMPDIR/tianshu-*`，10-12 一天约 5 万个），已另开修复任务；修好前要定期清理；
  - v1 布局有共用门格（大理 bi_0020 / bi_0023），v2 编译器要按门格全场景唯一重算。

## 5. 恢复命令（都在 `.agents/wt/_town2` 下执行）

- **排队器**：`python3 -u .agents/coord/_town2/queue.py`。
  - 配置在 `queue.json`：现在并行 3，剩余磁盘 < 6 GiB 时不起新任务。
  - 排队器只起没有状态文件的任务；被杀或 HOLD 的任务要手动重起。
  - 杀进程重起任务前，先把 `paused` 设成 `true`。
- **重起任务**：
  ```bash
  python3 -u tools/agents/supervise.py <ID> --model GPT-5.6-Sol --effort xhigh --review-model GPT-5.6-Sol --review-effort xhigh --max-reviews 3 --max-runs 3 --auto-merge --checks .agents/coord/PROD/review_checks_town2.md --from start --note .agents/coord/<ID>/note_coord_rN.md --worker
  ```
  - 改动已完成、只需重新校验时，用 `--from validate`。
  - 后台脱离运行：用 `subprocess.Popen(..., start_new_session=True)` 启动。
- **挪基点**：`python3 .agents/coord/_handoff/rebase_task.py <ID> --new-base <commit>`。
- **并主干**：`python3 .agents/coord/_town2/merge_to_trunk.py --dry-run`，确认后去掉 `--dry-run`。脚本会原样保留主检出里别人未提交的改动。
- **给裁定**：写进 `tools/agents/prompts/<ID>.md`（审核员只看任务书正文）。要放开写集时，同时改 `tools/agents/tasks.json` 的 `writes`，用 `json.dumps(..., ensure_ascii=False, indent=1)` 写回。

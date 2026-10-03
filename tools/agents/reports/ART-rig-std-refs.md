# ART-rig-std-refs 报告 · 标准体参考 · 男 / 女标准体 A 字三视图各 1 张 + sheet_split 拆出 6 张视图参考（AR-47；codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

- 已入库男 / 女标准体 A 字三视图各 1 张，均为原始 1536×1024 PNG；拆出 6 张 256×480 RGBA 参考。
- worker 19 外部 runner 出图：男首出 + 重出 2 次，女首出 + 重出 1 次；最终均纯文字生成，无身份立绘输入。
- 六份 AR-22 单视图提示词已标 `superseded`，保留历史正文并更新输出路径、清单路径和尺寸。
- 两次拆图及五条指定检查全部通过；素材均为 `candidate`，侧视切件局限见 §4，未切部件或替换程序占位。

## 2. 产出（文件、行数、主要章节）

- `assets/default/rig/{male_std,female_std}/sheet/`：各 `sheet_L.png`、`manifest.yaml`（28 行，完整实际提示词、来源和哈希）、`qa.yaml`（154 行，分次写入，量测与视觉记录）。
- `assets/default/rig/{male_std,female_std}/ref/`：各 `ref_front34.png` / `ref_side.png` / `ref_back34.png`、`manifest.yaml`（63 行，3 条）、`sheet.json`（94 行，文件名已同步）。
- `assets/default/prompts/rig/{male_std,female_std}/ref_{front34,side,back34}.md`：6 份各 53 行；本报告 49 行。共 23 个交付文件，其中 PNG 8 张。
- 对照与拆图联系表：`…/_handoff/gem/codex_w19/sheets/{male,female}_comparison.jpg`、`{male,female}_refs_qa.jpg`；仅质检中间件，不入库。

## 3. 关键结论与数值

- 男选 r3：重出 2 次；源三栏身高 **881 / 874 / 875 px**，差 `(881−874)/881=0.795%`；女选 r2：重出 1 次；**873 / 873 / 867 px**，差 `(873−867)/873=0.687%`，均 ≤3%。源身高取实际拆图 BiRefNet `sourceBounds`，包含发髻。
- 腋下背景抽样宽度（front34 / side / back34，每栏两侧）：男 **29/39、12/23、33/31 px**；女 **37/48、32/27、34/32 px**。腿间抽样宽度：男 **117 / 111 / 115 px**，女 **75 / 23 / 63 px**；原图独立 Lab 色键 `alpha<48`，具体 y 与 x 区间见 `qa.yaml`，不是全段最小净空。
- 两体首版均用主角 sheet 缩小 JPEG 取版式 / 姿势 / 比例 / 画风，因侧肢重叠弃用，男首版另有脸型趋近主角；后续撤掉参考，最终 `references: []`。所有轮次队列第 3 列均为 `none`，未上传主角身份立绘。
- 归一密度 256 px/m：男 `round(1.70×256)=435 px`、女 `round(1.62×256)=415 px`；脚底边界均 y=460。实际抠底为本机缓存 `birefnet-general-lite`；源背景抽样男 RGB(227,222,212)、女 RGB(227,222,213)，接近指定暖灰而非精确色码。

## 4. 开放问题（附默认值）

- 男侧视远足外撇，不能宣称所有肢体均严格正侧；默认后续取朝左的近侧足作共享源，人工复核髋 / 膝 / 踝。女侧视大腿上段仍互相遮挡，默认结合 front34/back34 复核并补被遮区域，不把腿间开口等同于全腿可直接切出。
- 右衽正面可见；侧背内层叠压被遮挡，默认按衣装连续性核对并保持 `candidate`，不等同作者批准或动画验收。两体已停止出图，男已达每体 3 张上限。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无：按 AR-47、GUIDE §2 与 tech/09 §1 执行，无新增规格或玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 后续「标准体切件」任务：消费 `ref/sheet.json` 的 `sourceBounds` / 归一画布及新 `file`，以 `sheet_L` 哈希追溯；未镜像近侧 L；先人工校肩肘腕髋膝踝，再切每视图 13 件并生成关键点 / pivot 旁注，处理 §4 的遮挡与足向，不沿用旧 nearSide:R 提示词。
- `assets/default/prompts/INDEX.md` 六条标准体参考记录、`TODO.md` AR-47 状态：调度器同步新路径及已生成 candidate；本任务未改这些文件。
- 两套顶层 `manifest.yaml` / 后续占位构建任务：任务输入已告知 `make_parts.py --check` 既有 `manifest differs from normalized source parts`；本次未运行重建、未修复该问题，158 个受保护文件哈希均未变。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 恰好三人，front34 / side / back34 顺序正确，头与躯干均朝左、近侧 L；成年、空手、素色右衽短衣与束口裤，无兵器披风配饰（女素簪除外）；腋下和腿间可见背景，身高差均 <1%。
- ✅ 与男女主角 base 立绘并排目检，最终脸型 / 衣装可区分；写实手绘风格相符，无文字、网格、色板、地面阴影。⚠️ 侧足朝向、上腿遮挡与隐藏衣襟的检查边界见 §4。
- ✅ 两条指定 `sheet_split.py … --facing L --height-m 1.70/1.62` 均退出 0，肩宽比和腋下检查通过；六图改名与 `sheet.json.file` 一致，透明通道同时含 0 与 255。
- ✅ `python3 tools/agents/check_assets.py assets/default/rig/male_std/sheet --min 1 --max 1 --min-side 1000`：1 张，0 问题。
- ✅ `python3 tools/agents/check_assets.py assets/default/rig/female_std/sheet --min 1 --max 1 --min-side 1000`：1 张，0 问题。
- ✅ `python3 tools/agents/check_assets.py assets/default/rig/male_std/ref --min 3 --max 3 --min-side 256`：3 张，0 问题。
- ✅ `python3 tools/agents/check_assets.py assets/default/rig/female_std/ref --min 3 --max 3 --min-side 256`：3 张，0 问题。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0，strict failure count=0（已知未定义 ID 基线 1 条、新增 0）；`git diff --check` 通过。
- ✅ 原 sheet 与 runner 原件 SHA-256 一致，未裁未缩；4 份顶层列表 manifest 信息齐全；6 份旧提示词已退役；只改写集，未切部件、改工具 / 规格 / 主角素材或执行改变仓库状态的 git 命令。

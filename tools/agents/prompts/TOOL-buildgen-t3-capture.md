# 本任务：城镇 3D 古建 · 闸门 A 一条命令出全套——实验页无头截图 `capture_town_lab.mjs` + 联系表 `contact_sheet.py` + 数字核对 `review_numbers.py`

**第一个动作**：读 `tools/agents/reports/ENG-townlab-l1.md` 第 3、7 节（URL 参数、`window.__townLab` 各方法返回结构、就绪信号），再读 `docs/tech/16-town-3d-spec.md` §11.2（闸门 A 渲染什么、自动数值检查与阈值）、§11.3；读完直接动手，不要先写计划。

本任务写代码（Node 脚本 + Python 工具）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10）：城镇建筑改为代码生成的 3D 古建；闸门 A 由作者看体量与比例。作者 AR-100（逐字）：「保持连接操作browser，不要反复启动反复让我批准」——浏览器自动化一律走本机 9223 端口的常驻浏览器桥（HTTP `POST http://127.0.0.1:9223/eval`，请求体 `{ targetId?, expression }`，返回求值结果 JSON；仓库主检出的 `tools/agents/browser_eval.mjs` 是现成客户端，但它不在任务工作区里，本任务自带一个最小客户端），**不得**自己启动浏览器或无头 Chrome。真实截图由协调者在开好实验页的本机上跑；本任务交付工具与测试。

## 要做的事
1. **`tools/buildgen/capture_town_lab.mjs`**：参数 `--base http://127.0.0.1:5173 --round r01 [--compare r00] [--only <组名>]`；按闸门 A 清单生成参数组合（2 套件 × 6 类型 × 4 偏航的目录页；手绘 `side` / `onion` 对照（yaw 45、zoom 64）；三座试点城 × zoom 48 / 80 × yaw 45 / 225；地标页：塔、城门、城墙）；对每组：经 9223 桥让页面 `__townLab.set(params)` → 等 `ready()` → 取 `capture()`（data URL 存 PNG）、`measure()`、`stats()`、`errors()` 存 JSON；输出到 `assets/default/buildkit/review/<round>/{shots,json}/`；任何页面错误或 `errors()` 非空即在最后非零退出（继续拍完其余组，汇总报告）。单一常驻连接：整个运行只用一个桥会话 / 一个页面目标，不反复开关。
2. **`tools/buildgen/review_numbers.py`**：读 `json/*.json`，按 tech/16 §11.2 的自动数值检查逐条判定：可进类型门净 ≥ 2100 × ≥ 1200；1.76 m 人台 zoom 80 / 64 / 96 = 86 / 69 / 103 ±2 px；占地轮廓与手绘 `logical_footprint_polygon_px` 在 zoom 64 下 ±4 px；脊高偏离手绘代理 −15% / +30% 外标黄（只提示）；三角预算（tech/16 §6.5）；draw ≤ 2 × 格数 + 6；写 `numbers.md`（表格 + 通过 / 失败 / 黄标汇总），任何失败非零退出。
3. **`tools/buildgen/contact_sheet.py`**（Pillow）：把 `shots/*.png` 按组排成联系表（每张带参数标签，中文字体用系统可用字体，找不到时退回 Pillow 默认字体并在图上用 ASCII 标签），输出 `contact_<组>.png`；`--compare` 时并排上一轮同名图。
4. **一条命令**：`tools/buildgen/gate_a.sh r01` 依次跑上述三个工具。

## 测试
- `tools/buildgen/tests/test_review_numbers.py`（unittest）：构造通过 / 失败 / 黄标三类假 JSON，断言判定与退出码；阈值逐条覆盖。
- `tools/buildgen/tests/test_contact_sheet.py`（unittest）：用程序生成的小 PNG 拼表，断言输出尺寸与格数。
- `tools/buildgen/capture_town_lab.test.mjs`（`node --test`）：起一个本地假 `/eval` 服务（模拟 `__townLab` 返回），跑 `--only` 一小组，断言写出的 PNG / JSON 文件、单一连接（假服务记录的会话数 = 1）、页面 `errors()` 非空时非零退出。

## 约束
- 只写：`tools/buildgen/{capture_town_lab.mjs,capture_town_lab.test.mjs,review_numbers.py,contact_sheet.py,gate_a.sh}`、`tools/buildgen/tests/test_{review_numbers,contact_sheet}.py` 与本任务报告。**不要**在任务里真的跑截图、不要往 `assets/default/buildkit/review/` 写文件（真实运行由协调者做）。
- 不改 `apps/**`、`packages/**`、`tools/agents/**`；不新增 npm 依赖（Node 用内置 `http` / `fs`）；Python 只用标准库 + Pillow（已有）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `node --test tools/buildgen/capture_town_lab.test.mjs`
- `python3 -m unittest discover -s tools/buildgen/tests -p "test_*.py"`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-buildgen-t3-capture.md`（≤ 50 行）：第 3 节列参数组合总数与各组张数、数值检查清单与阈值、输出目录结构；第 7 节写给协调者的运行步骤（开实验页 → 确认 9223 桥 → `tools/buildgen/gate_a.sh r01` → 看 `numbers.md` 与联系表）。

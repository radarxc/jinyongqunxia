# 本机执行手册 · Phase G（P0 实现启动与文档收口）

> 给在**作者本机**驱动 GPT CLI 的人或监督代理看。分工：云端 Claude 会话负责规划、拆解与准出（`docs/decisions/acceptance-p0.md`）；本机负责执行、图像生成与多模态校验；作者负责闸门与审定。
> 任务图：`tools/agents/tasks.json`（Phase G = 第 6–8 波）；机制：`README.md`；逐任务监督步骤：`SUPERVISOR.md`。

## 0. 模型与强度（作者 2026-09-30 指定）

| 任务类型 | 模型 | 推理强度 | 来源 |
|---|---|---|---|
| 起草 / 修订 / 工具 / 代码 / 素材生成 | `GPT-6-Astra` | `ultra` | `tasks.json` `defaults.model` / `defaults.effort` |
| 审校（`<ID>.R`，含代码审校与多模态校验） | `GPT-6-Astra` | `xhigh` | `defaults.review_effort` |
| 探测失败时的备用 | `GPT-5.6-Sol` | 续作 `high`，收尾 `medium` | `step.py` `FALLBACK_MODELS`；SUPERVISOR.md 第 2 步 |

逐任务可在 `tasks.json` 用 `model` / `effort` 字段覆盖；命令行 `--model` / `--effort` 优先级最高。先跑 `traex models` 确认模型名与 `python3 tools/agents/run.py check --live`。

## 1. 前置条件（缺一项则对应任务先不要启动）

| 任务 | 需要 |
|---|---|
| 全部 | `traex` 已登录且在 PATH；Python ≥ 3.11；git；分支 `claude/jinyong-online-game-design-jko1v9` 已拉取到最新 |
| T0–T5 | Node ≥ 24（`node -v`）、pnpm 12（`corepack enable && corepack prepare pnpm@12 --activate`）、可访问 npm registry |
| T3、T5 | Playwright Chromium（`pnpm dlx playwright install chromium`）；T5 另需 `wrangler`（随包安装，登录只在 G4 需要） |
| T4a、T4b | `uv`（Python 包管理）；Blender 4.5 LTS 可选（没有则脚本 `--dry-run`）；T4b 需 CLI 的 `image_generation` 工具可用 |
| H2 | 联网（任务已标 `web: true`） |
| G3 | 作者填写 `docs/decisions/author-decisions.md` P58–P61（见 §4） |

## 2. 顺序与并发（建议 `-j 3`）

```
第 6 波（文档收口，可与第 7 波的 T0 并行）
  A4 ──► A4.R ──┬──► K2 ──► K2.R ──► Q01（需 L2）──► Q01.R
                ├──► M3 ──► M3.R
                └──► S2（需 L3）──► S2.R          G3（作者，A4.R 后随时）
  L2、L3、N2 ──► N2.R           （无依赖，立即可跑）
第 7 波（P0 代码）
  T0 ──► T0.R ──┬──► T1 ──► T1.R ──► T3 ──► T3.R
                └──► T2（需 L2）──► T2.R ──┬──► T4a ──► T4a.R ──► T4b ──► T4b.R（多模态校验）
                                           └──► T5 ──► T5.R
  H2（需 K2.R）──► H2.R
第 8 波
  G4（作者：真机证据 + preview 部署）──► P0A ──► P0A.R
  Q02–Q14（需 Q01.R）、M4（需 M3.R、S2.R）——不阻断 P0 签出
```

写入范围有重叠的任务（如 K2 与 M3 都写 `tech/05`；M3 与 N2 都写 `tools/balance/`）调度器会自动串行，不必手工避让。

## 3. 两种驱动方式

**A. 监督代理逐任务（上一轮实际采用）**

```bash
cd <本机仓库> && git pull
python3 tools/agents/step.py start  A4        # 默认 GPT-6-Astra / ultra；审校任务自动 xhigh
python3 tools/agents/step.py wait   A4 --max-min 25   # 后台运行，重定向到文件，见 SUPERVISOR.md 铁律 4
python3 tools/agents/step.py finish A4
python3 tools/agents/step.py merge  A4
python3 tools/agents/step.py start  A4.R  …（同上）
git push origin claude/jinyong-online-game-design-jko1v9   # 每合入一个任务就推送
```

**B. 自动调度（无人值守）**

```bash
python3 tools/agents/run.py run -j 3 --until-wave 6 --push     # 先跑文档收口
python3 tools/agents/run.py approve G3 -m "…"                  # 作者填完 P58–P61 后
python3 tools/agents/run.py run -j 3 --until-wave 7 --push
python3 tools/agents/run.py approve G4 -m "…"                  # 真机证据放好后
python3 tools/agents/run.py run -j 3 --push
```

代码任务的校验命令（`pnpm check`、`pytest` 等）会在工作区内运行，单条超时 15 分钟；首次 `pnpm install` 若超时，手动在工作区跑一次后 `step.py finish` 重试。

## 4. 作者闸门要做的事

- **G3**（A4.R 之后）：在 `docs/decisions/author-decisions.md` 追加
  - P58 三台实机：角色 A/B/C 的品牌型号、SoC/GPU、RAM、OS build、浏览器 / 入口（tech/09 §2.3 模板）；
  - P59 `O-A3-01 / O-A3-02 / F2-O03`：接受默认或改选（改选须写明）；
  - P60 GPT CLI：`traex models` 中 GPT-6-Astra 是否可用、`ultra` / `xhigh` 是否被接受、`image_generation` 是否可用与单次上限；
  - P61 Cloudflare：账号是否就绪、自定义域名、是否接受 Workers Free 限制。
  然后 `python3 tools/agents/run.py approve G3 -m "P58–P61 已填"`（会一并提交 `docs/decisions/` 改动）。
- **G4**（T3.R、T5.R、T4b.R 之后）：按 `tools/agents/reports/T3.md` §6 与 `docs/evidence/p0/README.md`：三机各跑 `#/bench-iso` 常规 / 压力（各 60 s × 3 + 10 分钟）、`#/proto-projection` 实点 50 次、`#/proto-resilience`；导出 JSON 到 `docs/evidence/p0/<deviceId>-<date>-<regular|stress>.json`；部署 preview 并记录常用网络访问、两设备配对、离线重开；截图放同目录。提交后 `approve G4`。

## 5. 与准出的交接

每合入并推送一批任务后，把任务 ID 告诉云端会话；准出结论写在 `tools/agents/reports/_acceptance-log.md`。被退回的任务：未合入的用 `step.py start <ID> --note "<意见>"` 续作；已合入的会以新任务 ID（如 `A4x`）出现在 `tasks.json`，按图继续即可。

## 6. 常见问题

- **Astra 探测超时**：`step.py` 自动改用 GPT-5.6-Sol；若整段时间都不可用，可 `--no-probe --model GPT-6-Astra` 强制，或按 SUPERVISOR.md 续作策略。
- **代码任务停滞在安装**：在工作区手动 `pnpm install`，再 `start <ID> --note "依赖已装好，继续实现并跑验收命令"`。
- **T4b 的 `image_generation` 不可用 / 有次数限制**：任务会减少数量并如实报告；不要为凑数把占位图登记为候选。
- **`check_ids --strict` 因中央迁移表补录失败**：说明新 ID 未定义或旧 ID 仍在活动正文；看报告与 `--json` 定位，不要刷新基线。

# 本任务：工具 · 小修：把执行器留在 assets/default/ 里的过程文件挪出去（特效目录的生成脚本与检查日志、map/kit 的过程文件）：脚本挪到 tools/ 对应位置，日志挪到 .agents/；引用一并改；manifest 不动

本任务整理文件归属，不改素材本身。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- 各执行器把生成脚本、构建日志、检查产物留在了素材目录里，跟着素材一起入库了。例如：
  - `assets/default/vfx/sk_*/make_sources.py`、`make_manifest.py`、`make_compositions.py`、`make_effect_sets.py`；
  - `assets/default/vfx/sk_*/checks/*.log`；
  - `build-results.jsonl`、`build-log.jsonl` 之类；
  - `assets/default/map/kit/` 下的 `build_review.py`、`generation.jsonl`、`validation.jsonl`、`prompts.json`、`check_assets.log`。
- 协调者裁定（10-03 21:20）：
  - 脚本类挪到 `tools/` 对应位置，日志类挪到 `.agents/`；
  - 有引用的路径一并改；manifest 不动；`check_assets` 照样能过；
  - 低优先级，不挡 M1。

## 要做的事

1. **盘点**：用 `git ls-files` 列出 `assets/default/vfx/**` 与 `assets/default/map/kit/**` 里的过程文件，判定标准：
   - 不是 manifest 登记的素材；
   - 不是运行时会读的文件。
   - 运行时会读的，查 `apps/game/build/**` 里发布特效运行时数据（publishVfxRuntime 等）读哪些文件，那些**不动**。
2. **挪动**：
   - 脚本类：特效挪到 `tools/vfx/skills/<sk_id>/`，map/kit 挪到 `tools/map/kit/`。脚本里写死的相对路径要改对，挪后照样能在仓库根运行；跑不了的写进报告。
   - 日志类和检查产物：挪到 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_asset_logs/<原相对路径>`。这里不入库，从仓库里删掉即可。
3. **引用**：代码与配置里引用这些文件的路径一并改，范围是 `tools/**`、`apps/game/build/**`。历史报告 `tools/agents/reports/**` 不改。
4. **不碰**：manifest、图片、运行时数据一概不动。
5. **其余目录只盘点不动**：`assets/default/town/**`、`building-map/**`、`tile/**`、`baseline/**` 里同类过程文件（如 `render_town.log`、`normalize.py`），按目录列成清单，写进报告第 4 节，交协调者另定。

## 约束

- 写集：
  - `assets/default/vfx/**`：只删或挪过程文件；
  - `assets/default/map/kit/**`：同上；
  - `tools/vfx/**`、`tools/map/kit/**`；
  - `apps/game/build/**`：只改引用路径；
  - 写集外的改动在提交时会被丢弃。
- 不改任何 manifest、图片、运行时数据；不改门禁。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`：特效运行时数据发布与 dev-chunks 检查都在里面
- `python3 tools/agents/check_assets.py assets/default/map/kit --min 20 --max 60 --min-side 512`
- `python3 -c "import sys,re; from pathlib import Path; …"`：按磁盘检查两处目录里不再有 `.py` / `.jsonl` / `.log` / `checks/`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 40 行，写清：
- 挪了哪些、挪到哪；
- 改了哪些引用；
- 其余目录的盘点清单；
- 过程文件今后怎样不再进 `assets/`，给出建议。

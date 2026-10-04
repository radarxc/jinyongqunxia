# TOOL-assets-logs-cleanup 报告 · 工具 · 小修：执行器留在 assets/default 的过程文件挪出（特效目录生成脚本与检查日志、map/kit 过程文件；脚本挪 tools/，日志挪 .agents/；引用一并改，manifest 不动）
## 1. 摘要（3–6 行）
- VFX 7 门武学的 20 个生成脚本已迁到 `tools/vfx/skills/<sk_id>/`；map/kit 的旧审样脚本已迁到 `tools/map/kit/`。
- 8 份 VFX 与 5 份 map/kit 日志/检查产物已原样归档到 `.agents/coord/_asset_logs/<原相对路径>`，仓库素材目录原件已删。
- README 与工具内活跃引用已同步；manifest、图片、运行时数据未修改。
- `full/build_kit.py` 已收紧目录白名单，并改验归档日志原哈希与迁移脚本新位置，避免清理后误报且继续阻止过程文件回流。
- 本轮返修只补正上述检查逻辑的报告披露；已审核通过的迁移文件和素材未重写。
## 2. 产出（文件、行数、主要章节）
- `tools/vfx/skills/`：20 个 Python、2,025 行、7 个 `sk_*` 子目录；资源根固定解析到 `assets/default/vfx/<sk_id>`。
- `tools/map/kit/build_review.py`：232 行，素材根与外置过程目录分离；64 条清单时安全转交 `tools/map/kit/full/build_kit.py`。
- `tools/map/kit/full/build_kit.py`：目录白名单仅留素材文件；旧快照日志改在归档位置验哈希，迁移脚本改验新位置存在。
- `assets/default/`：删 21 个脚本、7 个 JSONL、5 个 LOG、1 个 `prompts.json`；更新 10 份 README；两目标目录扩展名扫描为 0。
## 3. 关键结论与数值
- `publishVfxRuntime` 只发布 `content/vfx/runtime-files.json` 显式列出的文件，本次 34 项均非运行时输入。
- 外置归档逐字节核对 13/13 与 HEAD 原件一致；20/20 VFX 工具路径探针通过；现有 manifest 零差异。
- manifest 按要求不动，故历史 `files/file_integrity` 仍可能记旧脚本/日志；迁后的 7 个 manifest 生成器不再登记脚本。
- `pnpm size` 通过：entry 38.80/170 KiB、render 168.86/180 KiB、webgl 207.65/350 KiB、session 100.58/110 KiB；dev-chunks 573/69。
## 4. 开放问题（附默认值）
- 指定旧命令 `check_assets --max 60` 因 AR-69 已合入 64 张而失败；默认采用当前任务配置已修订的 `--max 120`（64 图/64 条/0 问题）。
- 只盘点不动：`town` 94 LOG；`building-map` 57 PY + 2 JSONL + 1 LOG + 10 prompts.json；`tile` 14 PY + 7 JSONL；`baseline/building-map` 15 PY；合计 200。
- 默认建议：生成器只放 `tools/`，过程输入/日志/检查记录写 `.agents/coord/_asset_logs/<原相对路径>`，提交前固定跑扩展名与 `checks/` 扫描。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；这是文件归属清理，不改变设计基准。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 任务说明 / 检查命令：将过期的 map/kit `--max 60` 同步为 tasks.json 与协调记录现行值 `--max 120`。
- 后续素材任务提示词 / 输出约束：统一禁止 `.py/.jsonl/.log/checks/` 落入 `assets/default/`；是否清理 §4 的 200 项由协调者另定。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`；✅ lint/typecheck；✅ 159/159 文件、1,153/1,153 测试；✅ `pnpm size`（含运行时发布与 dev-chunks）。
- ⚠️ 原样 `pnpm check` 到 `content:validate` 时因沙箱禁止 tsx Unix socket 报 `listen EPERM`；未改 `node_modules`，交沙箱外校验。
- ⚠️ map/kit 旧 `--max 60` 仅因 64>60 失败；✅ 现行 `--max 120`、全量工具检查及迁移入口检查均通过。
- ✅ `check_ids.py --strict`；✅ 过程文件扫描 0；✅ `git diff --check`；✅ manifest/图片/runtime 数据零差异。

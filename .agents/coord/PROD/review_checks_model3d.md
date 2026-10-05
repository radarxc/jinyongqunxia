# Tripo 3D 模型任务（ART-3d-tripo-*）合入前审核要点（协调者，2026-10-03 上午；作者 AR-41）

**审核纪律**：先实际执行检查命令、看预览图、核对 manifest 与文件，再写结论；无法执行的项写 ⚠️ 并说明，不计为 ❌。

只审下面 6 条：
1. **密钥不泄露**：`git grep -n "tripo_key\|Bearer tsk" -- . ':!docs/decisions/author-requirements.md'`、任务报告、manifest、`tools/model3d/**` 里都没有真实 key 的任何片段（只能出现环境变量名）；`.env` 没进提交。有泄露判 ❌（并立刻报协调者）。
2. **产物齐全**：每个角色目录有 rigged GLB（`model_rig.glb`）、Tripo 渲染预览（`preview.png` 或 Tripo 返回的渲染图）、manifest 条目（`id / file / category: model3d / subject / tool: tripo-api / model_version / task_ids / options / credits / references(来源立绘 path + sha256) / sha256 / size_bytes / status: candidate`）；主角另有带动作的 GLB。用 `python3 -c "import yaml…"` 解析 manifest，文件存在、sha256 一致。
3. **质量抽查**（最多看 8 张预览）：人物完整、正面可辨识（与来源立绘的发式、衣色一致）、无明显破面 / 肉色头发 / 贴图错位；男女主角与上一版（`apps/game/public/pilot/zhujue_tripo_v1.glb` 的问题：左侧头发肉色）对比有改善。骨架：报告写明关节数与骨架类型（Tripo 标准 / Mixamo 兼容）。
4. **预算如实**：报告里的消耗点数、余额前后与 manifest 的 `credits` 之和一致，没超任务说明的上限；超限或没报余额判 ❌。
5. **只改负责的文件**：写集之外（尤其 `packages/**`、`apps/**`、`tools/**` 之外的工具）没动；GLB 大小合理（单个 ≤ 25 MB，否则报告说明 face_limit）。
6. **报告如实**：每个角色一行（输入、任务 ID、选项、重出次数、点数、结论），失败 / 跳过的如实列出，不写「已验证」却没做的事。

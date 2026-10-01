# 出图方式（图片任务共用；2026-10-01 协调者整理自已过审批次 ART-item-clothing / medicine / manuals 与 KIT-*-hist 的实际做法）

本执行环境是 traex（GPT-5.6-Sol），**没有内置 `image_gen` 工具**，`view_image` 只能看图。出图要调用本机 Codex CLI 代做；这是唯一合规的出图途径（硬规则：不得用 Pillow / 代码画替代图、拼贴或程序化合成冒充；Codex 也不可用时停下，在报告第 1 节写明失败原因与已生成数量，不得伪造）。

1. 建独立的 Codex home（避免并发任务互相写坏 `~/.codex` 下的 sqlite；生成图也落在可预期的位置）：
   ```
   export CODEX_HOME=/private/tmp/<任务ID>/codex-home
   mkdir -p "$CODEX_HOME" && ln -sf ~/.codex/auth.json "$CODEX_HOME/auth.json" && ln -sf ~/.codex/config.toml "$CODEX_HOME/config.toml"
   ```
2. **每张图一次调用**（参考图用 `-i`，最多几张；本张的提示词写完整，首句固定不变）：
   ```
   /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex exec -m gpt-6-astra -s workspace-write --skip-git-repo-check \
     -C <工作区绝对路径> -i <参考图1> [-i <参考图2>] \
     "The imagegen skill has already been read. Do not read files, do not call node_repl, shell, or collaboration tools. Make exactly one built-in image_gen call for this single asset, then reply only with its generated PNG path. <本张的完整提示词：题材 / 主体 / 风格 / 构图 / 背景 / 排除项，英文或中文均可>"
   ```
   回复里是生成 PNG 的路径（位于 `$CODEX_HOME/generated_images/<会话>/exec-*.png`）；没回路径就取该目录下最新的 PNG。要透明底的任务在提示词里写明 "TRUE transparent RGBA background, nothing outside the object"，拿到后用脚本核 alpha 同时含 0 与 255。
3. 复制进素材目录（文件名 = ID），再按任务说明做裁边 / 缩放 / 校验；manifest 每条登记 `tool: codex exec · image_gen`、`model: gpt-6-astra`、`source_path: <原件路径>`、`prompt`、`sha256`、`size`、`status: candidate`。
4. 先出 1 张，与基线 / 参考图并排 `view_image` 校准画风，像了再批量；一次调用失败重试一次，连续失败 3 次就停下写报告。
5. 不要直连 `https://chatgpt.com/backend-api/...` 之类端点，不要改 `~/.codex` 下的文件，不要在素材目录放任何脚本。
6. 协调者注意：图片任务在 `tasks.json` 里必须登记 `"web": true`（启动时加 `sandbox_workspace_write.network_access=true`），否则沙箱无网络，Codex 会报 `Reconnecting… workspace routing discovery failed`（ART-rig-parts 2026-10-01 因此停摆两次）。

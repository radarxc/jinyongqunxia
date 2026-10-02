#!/bin/zsh
# 入库 Gemini 原图并立即提交（可一次给多个 ID，按顺序逐个入库、逐个提交；名称取自提示词 frontmatter 的 name:）
# 每张入库后重建 INDEX（作者 10-01：做完一个就从 INDEX 删掉对应条目），与图一起提交。
# 只按路径提交本张图、它所在目录的 manifest 和 INDEX（git commit -- <路径>）：多道并跑或工程线同时暂存了别的文件时，
# 不会把别人的改动带进来（10-02 曾把一处 roadmap 改动混进素材提交）；撞 index.lock 时等 2 秒重试，最多 15 次。
set -e
setopt null_glob
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod
for id in "$@"; do
  python3 tools/imagegen/ingest.py "$id" | cut -c1-90
  f=$(grep -rl --include='*.md' "^asset_id: $id\$" assets/default/prompts | head -1)
  name=$(sed -n 's/^name: *//p' "$f" | head -1)
  python3 tools/agents/build_image_index.py >/dev/null || true
  png=$(git ls-files -mo -- ":(glob)assets/default/item/**/$id.png" ":(glob)assets/default/map/**/$id.png" ":(glob)assets/default/character/**/$id.png" ":(glob)assets/default/scene/**/$id.png" | head -1)
  if [[ -z "$png" ]]; then echo "✘ $id：找不到入库后的 PNG（ingest 失败或与已提交版本相同）"; exit 1; fi
  paths=("$png" "$(dirname "$png")/manifest.yaml" assets/default/prompts/INDEX.md)
  ok=0
  for t in {1..15}; do
    if git add -- $paths && git commit -q -m "assets(gemini): $id $name

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- $paths; then ok=1; break; fi
    sleep 2
  done
  if (( ! ok )); then echo "✘ $id：提交失败（重试 15 次），图与 manifest 已在工作区，可稍后重跑本脚本的 git 部分"; exit 1; fi
  echo "提交 $(git rev-parse --short HEAD) $id $name"
done

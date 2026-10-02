#!/bin/zsh
# 入库 Gemini 原图并立即提交（可一次给多个 ID，按顺序逐个入库、逐个提交；名称取自提示词 frontmatter 的 name:）
# 每张入库后重建 INDEX（作者 10-01：做完一个就从 INDEX 删掉对应条目），与图一起提交。
set -e
setopt null_glob
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod
for id in "$@"; do
  python3 tools/imagegen/ingest.py "$id" | cut -c1-90
  f=$(ls assets/default/prompts/items/*/"$id".md assets/default/prompts/maps/**/"$id".md 2>/dev/null | head -1)
  name=$(sed -n 's/^name: *//p' "$f" | head -1)
  python3 tools/agents/build_image_index.py >/dev/null || true
  git add assets/default/item assets/default/map assets/default/prompts/INDEX.md 2>/dev/null || git add assets/default/item assets/default/prompts/INDEX.md
  git commit -q -m "assets(gemini): $id $name

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  echo "提交 $(git rev-parse --short HEAD) $id $name"
done

#!/bin/zsh
# 阶段 A 顺序器：a1 → (a3 ‖ a5 ‖ a2) → a4；每个任务由 supervise.py 驱动 traex（GPT-5.6-Sol xhigh），校验 + GPT 审核 + 自动合入到当前分支
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup || exit 9
export TRAEX_MODEL=GPT-5.6-Sol
export TRAEX_EFFORT=xhigh
LOG=.agents/coord/_dressup/stage_a.log
run() {
  local id=$1
  mkdir -p ".agents/coord/$id"
  echo "$(date '+%F %T') START $id" >> "$LOG"
  python3 tools/agents/supervise.py "$id" --model GPT-5.6-Sol --effort xhigh --review-model GPT-5.6-Sol --review-effort xhigh \
    --max-reviews 2 --max-runs 3 --auto-merge \
    --checks .agents/coord/PROD/review_checks_eng.md --worker >> ".agents/coord/$id/supervise.out" 2>&1
  local rc=$?
  echo "$(date '+%F %T') END   $id exit=$rc" >> "$LOG"
  return $rc
}
echo "$(date '+%F %T') stage A begin (pid $$)" >> "$LOG"
run ENG-dressup-a1-glbio || { echo "$(date '+%F %T') a1 未合入，停止" >> "$LOG"; exit 1; }
run ENG-dressup-a3-prop &
P3=$!
run ENG-dressup-a5-gate &
P5=$!
run ENG-dressup-a2-skeleton
RC2=$?
if [ $RC2 -eq 0 ]; then
  run ENG-dressup-a4-garment
else
  echo "$(date '+%F %T') a2 未合入，a4 不起" >> "$LOG"
fi
wait $P3 $P5
echo "$(date '+%F %T') stage A end" >> "$LOG"

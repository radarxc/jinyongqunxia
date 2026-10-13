#!/bin/zsh
# 阶段 T 顺序器：t0 → t1（停：协调者看 30° 底图再放行 T2）；t3 等阶段 A 结束后再跑
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup || exit 9
LOG=.agents/coord/_dressup/stage_t.log
run() {
  local id=$1 chk=$2
  mkdir -p ".agents/coord/$id"
  echo "$(date '+%F %T') START $id" >> "$LOG"
  python3 tools/agents/supervise.py "$id" --model GPT-5.6-Sol --effort xhigh --review-model GPT-5.6-Sol --review-effort xhigh \
    --max-reviews 2 --max-runs 3 --auto-merge --checks "$chk" --worker >> ".agents/coord/$id/supervise.out" 2>&1
  local rc=$?
  echo "$(date '+%F %T') END   $id exit=$rc" >> "$LOG"
  return $rc
}
echo "$(date '+%F %T') stage T begin (pid $$)" >> "$LOG"
( run TOOL-dressup-t0-plate .agents/coord/PROD/review_checks_eng.md && run ART-dressup-t1-plate30-f .agents/coord/PROD/review_checks_dressup_art.md ) &
P1=$!
until grep -q "stage A end" .agents/coord/_dressup/stage_a.log 2>/dev/null; do sleep 60; done
if grep -q "END   ENG-dressup-a2-skeleton exit=0" .agents/coord/_dressup/stage_a.log; then
  run ENG-dressup-t3-derive .agents/coord/PROD/review_checks_eng.md
else
  echo "$(date '+%F %T') a2 未合入，t3 不起" >> "$LOG"
fi
wait $P1
echo "$(date '+%F %T') stage T end" >> "$LOG"

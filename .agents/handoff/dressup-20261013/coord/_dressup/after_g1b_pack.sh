#!/bin/zsh
# G1b 与 pack-compact 都合入后启动 E2b（traex）
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup || exit 9
LOG=.agents/coord/_dressup/after_g1b_pack.log
echo "$(date '+%F %T') wait G1b + pack-compact" >> $LOG
st() { python3 -c "import json,sys; print(json.load(open('.agents/coord/$1/supervise.status.json')).get('state'))" 2>/dev/null; }
while true; do
  a=$(st ENG-dressup-g1b-visibility); b=$(st ENG-dressup-pack-compact)
  case "$a$b" in *HOLD*|*ERROR*|*FAILED*) echo "$(date '+%F %T') G1b=$a pack=$b，E2b 不自动启动" >> $LOG; exit 3;; esac
  [[ "$a" == MERGED && "$b" == MERGED ]] && break
  sleep 60
done
echo "$(date '+%F %T') G1b + pack-compact MERGED，启动 E2b" >> $LOG
tid=ENG-dressup-e2b-cleanup; mkdir -p .agents/coord/$tid; touch .agents/coord/$tid/supervise.log
python3 tools/agents/supervise.py $tid --model GPT-5.6-Sol --effort xhigh --review-model GPT-5.6-Sol --review-effort xhigh --max-reviews 3 --max-runs 3 --auto-merge --checks .agents/coord/PROD/review_checks_eng.md --worker >> .agents/coord/$tid/supervise.out 2>&1 &
echo "$(date '+%F %T') launched $tid pid $!" >> $LOG
wait

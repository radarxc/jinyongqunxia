#!/bin/zsh
# A6（第 16 次起）合入后启动 E4（agy）；B4 已于 15:31 提前启动
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup || exit 9
LOG=.agents/coord/_dressup/after_a6.log
echo "$(date '+%F %T') wait A6 (E4 only)" >> $LOG
sleep 90
until python3 -c "import json,sys; s=json.load(open('.agents/coord/ENG-dressup-a6-sockets/supervise.status.json')); sys.exit(0 if s.get('state')=='MERGED' else 1)" 2>/dev/null; do
  st=$(python3 -c "import json; print(json.load(open('.agents/coord/ENG-dressup-a6-sockets/supervise.status.json')).get('state'))" 2>/dev/null)
  case "$st" in HOLD*|ERROR|FAILED) echo "$(date '+%F %T') A6 state=$st，E4 不自动启动" >> $LOG; exit 3;; esac
  sleep 60
done
echo "$(date '+%F %T') A6 MERGED，启动 E4" >> $LOG
tid=ART-dressup-e4-sword-held; mkdir -p .agents/coord/$tid
python3 tools/agents/supervise.py $tid --bin $PWD/tools/agents/agy_exec.py --model gemini-3.1-pro-high --effort high --review-model GPT-5.6-Sol --review-effort xhigh --max-reviews 3 --max-runs 4 --auto-merge --checks .agents/coord/PROD/review_checks_eng.md --worker >> .agents/coord/$tid/supervise.out 2>&1 &
echo "$(date '+%F %T') launched $tid pid $!" >> $LOG
wait

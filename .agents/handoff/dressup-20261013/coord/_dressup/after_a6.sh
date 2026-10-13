#!/bin/zsh
# A6 合入后启动 B4（agy）与 E4（agy）
cd /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup || exit 9
LOG=.agents/coord/_dressup/after_a6.log
echo "$(date '+%F %T') wait A6" >> $LOG
until python3 -c "import json,sys; s=json.load(open('.agents/coord/ENG-dressup-a6-sockets/supervise.status.json')); sys.exit(0 if s.get('state')=='MERGED' else 1)" 2>/dev/null; do
  st=$(python3 -c "import json; print(json.load(open('.agents/coord/ENG-dressup-a6-sockets/supervise.status.json')).get('state'))" 2>/dev/null)
  case "$st" in HOLD*|ERROR|FAILED) echo "$(date '+%F %T') A6 state=$st，不自动启动" >> $LOG; exit 3;; esac
  sleep 60
done
echo "$(date '+%F %T') A6 MERGED，启动 B4 / E4" >> $LOG
ADAPTER=$PWD/tools/agents/agy_exec.py
for tid in AGY-dressup-b4-hidemap ART-dressup-e4-sword-held; do
  mkdir -p .agents/coord/$tid
  python3 tools/agents/supervise.py $tid --bin $ADAPTER --model gemini-3.1-pro-high --effort high --review-model GPT-5.6-Sol --review-effort xhigh --max-reviews 3 --max-runs 4 --auto-merge --checks .agents/coord/PROD/review_checks_eng.md --worker >> .agents/coord/$tid/supervise.out 2>&1 &
  echo "$(date '+%F %T') launched $tid pid $!" >> $LOG
done
wait

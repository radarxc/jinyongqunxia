#!/usr/bin/env python3
"""
Rate limiter and queue helper for Gemini image generation.
Enforces <= 4-5 requests per rolling 60-second window and >= 13 seconds minimum gap.
"""

import sys
import os
import json
import time
import glob

STATE_FILE = os.path.join(os.path.dirname(__file__), '../../.agents/coord/gemini_q/rate_limit_state.json')
QUEUE_FILE = os.path.join(os.path.dirname(__file__), '../../.agents/coord/gemini_q/claudeGemQueue.json')
PROMPTS_FILE = os.path.join(os.path.dirname(__file__), '../../.agents/coord/gemini_q/claudeGemPrompts.json')

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {'timestamps': []}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f)

def wait_rate_limit(max_per_min=4, min_gap=13.0):
    """
    Enforces at most max_per_min requests per rolling 60 seconds,
    and at least min_gap seconds between consecutive requests.
    """
    state = load_state()
    now = time.time()
    # Filter to timestamps within the last 60 seconds
    recent = [t for t in state.get('timestamps', []) if now - t < 60.0]
    
    wait_time = 0.0
    
    # Condition 1: min_gap since last request
    if recent:
        last_t = recent[-1]
        elapsed = now - last_t
        if elapsed < min_gap:
            wait_time = max(wait_time, min_gap - elapsed)
            
    # Condition 2: max_per_min within rolling 60s
    if len(recent) >= max_per_min:
        oldest_to_evict = recent[len(recent) - max_per_min]
        needed = 60.5 - (now - oldest_to_evict)
        if needed > wait_time:
            wait_time = needed
            
    if wait_time > 0:
        time.sleep(wait_time)
        now = time.time()
        recent = [t for t in recent if now - t < 60.0]
        
    recent.append(now)
    save_state({'timestamps': recent})
    return wait_time

def get_remaining():
    with open(QUEUE_FILE, 'r') as f:
        queue = json.load(f)
    existing = set()
    for p in glob.glob('assets/default/item/**/*.png', recursive=True):
        existing.add(os.path.basename(p)[:-4])
    return [x for x in queue if x not in existing]

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'help'
    
    if cmd == 'wait':
        w = wait_rate_limit(max_per_min=4, min_gap=13.0)
        print(f"Rate limit OK (waited {w:.1f}s)")
    elif cmd == 'remaining':
        rem = get_remaining()
        print(f"Remaining: {len(rem)}")
        if len(sys.argv) > 2:
            n = int(sys.argv[2])
            print(json.dumps(rem[:n], ensure_ascii=False))
    elif cmd == 'prompt':
        if len(sys.argv) < 3:
            print("Usage: rate_limiter.py prompt <item_id>")
            sys.exit(1)
        item_id = sys.argv[2]
        with open(PROMPTS_FILE, 'r') as f:
            prompts = json.load(f)
        p = prompts.get(item_id)
        if p:
            print(p)
        else:
            print(f"Prompt not found for {item_id}", file=sys.stderr)
            sys.exit(1)
    else:
        print("Commands: wait, remaining [N], prompt <item_id>")

if __name__ == '__main__':
    main()

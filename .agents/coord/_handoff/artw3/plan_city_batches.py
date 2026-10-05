#!/usr/bin/env python3
"""第三波追踪：把 progress.csv 里未完成的城 × 年代按章拆批（写集不相交），产出任务条目与 expect 清单。

    plan_city_batches.py <out_dir>    # 写 <out_dir>/city_tasks.json 与 <out_dir>/expect/<task>.expect.csv
"""
import csv, collections, json, math, sys
from pathlib import Path
import yaml
ROOT = Path('/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod')
sys.path.insert(0, str(ROOT / 'tools/agents'))
import prod_plan as PP  # noqa: E402

OUT = Path(sys.argv[1])
rows = list(csv.DictReader(open(ROOT / 'docs/design/town/progress.csv', encoding='utf-8')))
cities = {c['id']: c for c in yaml.safe_load(open(ROOT / 'docs/design/map/cities.yaml', encoding='utf-8'))['cities']}
order = {cid: i for i, cid in enumerate(cities)}
BOOK = {"ch01": "天龙八部", "ch02": "射雕英雄传", "ch03": "神雕侠侣", "ch04": "倚天屠龙记", "ch05": "笑傲江湖", "ch06": "侠客行",
        "ch07": "碧血剑", "ch08": "鹿鼎记", "ch09": "连城诀", "ch10": "白马啸西风", "ch11": "鸳鸯刀", "ch12": "书剑恩仇录",
        "ch13": "飞狐外传", "ch14": "雪山飞狐"}
chapters_of = collections.defaultdict(list)
for r in rows:
    chapters_of[(r['city_id'], r['effective_band'])].append(r['chapter_id'])
units = {}
for r in rows:
    if r['chapter_id'] != r['primary_chapter']:
        continue
    key = (r['city_id'], r['effective_band'])
    units[key] = dict(city=r['city_id'], band=r['effective_band'], imp=r['importance'], primary=r['primary_chapter'],
                      status=r['status'], chapters=sorted(chapters_of[key]))
# 已完成 / 基线的主城：它们的副本章节仍要补（如临安 ch02 → ch03）
todo, copy_only = [], []
for u in units.values():
    if u['status'] in ('pending', 'research_only'):
        todo.append(u)
    elif len(u['chapters']) > 1:
        cp = dict(u); cp['copy_only'] = True; copy_only.append(cp)
def kit(u):
    if u['band'] == 'tang_702':
        reg = cities[u['city']]['region']
        return 'xiyu' if reg.startswith('rg_xiyu') else ('tubo' if reg == 'rg_qingzang' else 'tang')
    return PP.kit_for(cities[u['city']]['region'], u['band'])
for u in todo + copy_only:
    u['kit'] = kit(u)
# 章并组：ch03 并入 ch02，ch06 并入 ch05，ch13 并入 ch11（单城首现章节）
MERGE = {'ch03': 'ch02', 'ch06': 'ch05', 'ch13': 'ch11'}
for u in todo + copy_only:
    u['group'] = MERGE.get(u['primary'], u['primary'])
FIRST = {}
for u in units.values():
    if u['imp'] == 'capital':
        g = MERGE.get(u['primary'], u['primary'])
        if g not in FIRST or order[u['city']] < order[FIRST[g]]:
            FIRST[g] = u['city']
SEQ = ['ch10', 'ch01', 'ch02', 'ch04', 'ch05', 'ch08', 'ch11']
CAP = 36
tasks, expects = [], {}
IMP_RANK = {'capital': 0, 'major': 1, 'secondary': 2, 'site': 3}
for g in SEQ:
    us = [u for u in todo if u['group'] == g]
    study = sorted([u for u in us if u['imp'] in ('capital', 'major')], key=lambda u: (u['kit'], IMP_RANK[u['imp']], order[u['city']]))
    gen = sorted([u for u in us if u['imp'] in ('secondary', 'site')], key=lambda u: (u['kit'], order[u['city']]))
    gen += [u for u in copy_only if u['group'] == g]
    n = max(1, math.ceil(len(study) / CAP)) if study else 0
    size = math.ceil(len(study) / n) if n else 0
    batches = [('study', study[i * size:(i + 1) * size]) for i in range(n)] + ([('generic', gen)] if gen else [])
    for bi, (kind, us2) in enumerate(batches):
        tid = f"CITY-layouts-{g}-{'g' if kind == 'generic' else chr(ord('a') + bi)}"
        writes, sparse, kits = [], [], set()
        for u in us2:
            for ch in u['chapters']:
                writes += [f"docs/design/town/{u['city']}__{ch}.yaml", f"assets/default/town/{u['city']}__{ch}/**"]
                sparse.append(f"assets/default/town/{u['city']}__{ch}")
            writes.append(f"docs/design/town/history/{u['city']}__{u['band']}*")
            kits.add(u['kit'])
        prog = f"docs/design/town/progress/{tid}.csv"
        writes += [prog, f"docs/design/town/progress/{tid}.done.txt"]
        for k in sorted(kits):
            if k in PP.KITS and k not in ('song_dali', 'song_southern'):
                sparse += [f"assets/default/tile/{k}/manifest.yaml", f"assets/default/tile/{k}/*.png",
                           f"assets/default/building-map/{k}/manifest.yaml", f"assets/default/building-map/{k}/*.png"]
        full = [u['city'] for u in us2 if u['city'] == FIRST.get(g) and not u.get('copy_only')]
        imps = collections.Counter(u['imp'] for u in us2 if not u.get('copy_only'))
        ncopy = sum(len(u['chapters']) - 1 for u in us2)
        bands = sorted({u['band'] for u in us2})
        what = ('都城 / 大城逐城考据' if kind == 'study' else '小城 / 遗址推定格局（生成器）') + \
               (f'＋同带副本' if ncopy else '')
        title = (f"城图全量 · {g}《{BOOK[g]}》{what}{(' 第 %d 批' % (bi + 1)) if kind == 'study' else ''}："
                 f"{sum(imps.values())} 城 × 年代（{'、'.join(f'{k} {v}' for k, v in imps.items())}）+ {ncopy} 个同带章节副本（AR-47，codex gpt-6-astra xhigh）")
        exp_rows = [dict(city_id=u['city'], band=u['band'], importance=u['imp'], primary_chapter=u['primary'],
                         chapters=';'.join(u['chapters']), era_kit=u['kit'], fullsize='yes' if u['city'] in full else 'no',
                         mode='copy_only' if u.get('copy_only') else kind) for u in us2]
        expects[tid] = exp_rows
        tasks.append(dict(id=tid, title=title, kind_=kind, group=g, n=len(us2), ncopy=ncopy, writes=writes, sparse=sparse,
                          kits=sorted(kits), full=full, bands=bands))
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'expect').mkdir(exist_ok=True)
for tid, rr in expects.items():
    with open(OUT / 'expect' / f'{tid}.expect.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rr[0].keys())); w.writeheader(); w.writerows(rr)
json.dump(tasks, open(OUT / 'city_tasks.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for t in tasks:
    print(t['id'], t['kind_'], 'units', t['n'], 'copies', t['ncopy'], 'writes', len(t['writes']), 'sparse', len(t['sparse']), 'kits', t['kits'], 'full', t['full'])
print('total units', sum(t['n'] for t in tasks), 'tasks', len(tasks))

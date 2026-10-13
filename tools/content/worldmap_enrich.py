#!/usr/bin/env python3
"""Add display-only tiers, icon families and road paths to the compiled world maps (tech/13 §5).

Reads content/world/chNN/map.yaml (pretty JSON), docs/design/map/cities.yaml and, when present,
docs/design/map/road_paths.json. Writes node `tier` / `marker` and road `path`; nothing else changes
(not `revision`: saves pin the map identity by it). Rules never read these fields.

Run after tools/content/worldmap_from_towns.py whenever maps are regenerated.
    python3 tools/content/worldmap_enrich.py          # write
    python3 tools/content/worldmap_enrich.py --check  # verify only, exit 1 on drift
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAPS = sorted((ROOT / 'content' / 'world').glob('ch[0-9][0-9]/map.yaml'))
CITIES = ROOT / 'docs' / 'design' / 'map' / 'cities.yaml'
ROAD_PATHS = ROOT / 'docs' / 'design' / 'map' / 'road_paths.json'

# Relic sites (rs_*) have no cities.yaml row; their icon family follows what stands there.
SITE_MARKERS = {
    'rs_emei': 'temple',                 # 峨眉金顶：佛寺
    'rs_gumu': 'ruin',                   # 终南山古墓
    'rs_huashan': 'sect',                # 华山派绝顶 / 思过崖
    'rs_jianzhong': 'ruin',              # 剑冢
    'rs_shaolin_cangjingge': 'temple',   # 少林藏经阁
    'rs_taohuadao': 'sect',              # 桃花岛：黄药师居所
    'rs_tianlongsi': 'temple',           # 大理天龙寺
    'rs_tianshan': 'ruin',               # 天山
    'rs_wudang': 'daoist',               # 武当真武殿
    'rs_xihu': 'ruin',                   # 杭州西湖孤山 / 梅庄
    'rs_yanmenguan': 'pass',             # 雁门关
    'rs_zijincheng': 'sect',             # 紫禁城：宫苑院落，借门派院落件
}
# importance == site cities are mostly novel islands; a mountain pass is the one exception.
SITE_CITY_MARKERS = {'city_khotan_kunlun': 'pass'}


def dump(doc):
    return json.dumps(doc, ensure_ascii=False, indent=2)


def classify(node, city, era):
    """Return (tier, marker) for one node in one chapter."""
    if city is None:
        if node['id'].startswith('rs_') or node['kind'] == 'ruin':
            return 'site', SITE_MARKERS.get(node['id'], 'ruin')
        return 'minor', 'city_county'
    status = city.get('eras', {}).get(era, {}).get('status', '')
    importance = city['importance']
    if status == '都城':
        return 'capital', 'city_large'
    if status == '未建或废弃':
        return 'site', 'ruin'
    if status in ('军镇', '边关'):  # tech/13 §5.2: garrisons and frontier passes are the small pass icon
        return 'minor', 'pass'
    if importance in ('capital', 'major'):
        return 'major', 'city_prefecture'
    if importance == 'secondary':
        return 'minor', 'city_county'
    return 'site', SITE_CITY_MARKERS.get(node['id'], 'village')


def road_path(road, era, paths):
    """Pick the display path for one road in one chapter; None when nothing matches its ends."""
    if paths is None:
        return None
    for variant in paths.get('variants', {}).get(road['key'], []):
        if era in variant['chapters'] and variant['start'] == road['start'] and variant['end'] == road['end']:
            return variant['path']
    return paths['paths'].get(road['key'])


def enrich(doc, cities, paths):
    action = doc['actions'][0]
    m = action['map']
    era = m['era']
    points = {node['id']: node['point'] for node in m['nodes']}
    for node in m['nodes']:
        tier, marker = classify(node, cities.get(node['id']), era)
        node['tier'] = tier
        node['marker'] = marker
    for road in m['roads']:
        path = road_path(road, era, paths)
        if path is None or len(path) < 2:  # zero-length approaches (relic inside its city) keep `points`
            road.pop('path', None)
            continue
        first, last = path[0], path[-1]
        start, end = points[road['start']], points[road['end']]
        if abs(first[0] - start[0]) > 1e-6 or abs(first[1] - start[1]) > 1e-6 or \
                abs(last[0] - end[0]) > 1e-6 or abs(last[1] - end[1]) > 1e-6:
            raise SystemExit(f"{m['era']} {road['key']}: road path ends {first}->{last} "
                             f"do not sit on nodes {start}->{end}")
        road['path'] = [[round(x, 2), round(y, 2)] for x, y in path]
    return doc


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true', help='verify only; exit 1 when a map would change')
    args = parser.parse_args()
    cities = {row['id']: row for row in json.loads(CITIES.read_text(encoding='utf-8'))['cities']}
    paths = json.loads(ROAD_PATHS.read_text(encoding='utf-8')) if ROAD_PATHS.exists() else None
    drift = []
    for path in MAPS:
        text = path.read_text(encoding='utf-8')
        doc = json.loads(text)
        if dump(doc) != text:
            raise SystemExit(f'{path.relative_to(ROOT)}: not in canonical pretty JSON (indent=2, no trailing newline)')
        out = dump(enrich(doc, cities, paths))
        if out != text:
            drift.append(path)
            if not args.check:
                path.write_text(out, encoding='utf-8')
    verb = 'would change' if args.check else 'updated'
    print(f'worldmap_enrich: {len(MAPS)} maps, {len(drift)} {verb}; road paths {"on" if paths else "absent"}')
    if args.check and drift:
        for path in drift:
            print('  drift:', path.relative_to(ROOT))
        sys.exit(1)


if __name__ == '__main__':
    main()

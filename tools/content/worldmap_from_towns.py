#!/usr/bin/env python3
"""Compile navigation overlays. Distances are equivalent game li, not surveys.

Writes content/world/chNN/map.yaml as canonical pretty JSON (indent=2, ensure_ascii=False, no
trailing newline); tools/content/worldmap_enrich.py then adds the display-only tier / marker / path:
    python3 tools/content/worldmap_from_towns.py            # write the 14 maps
    python3 tools/content/worldmap_from_towns.py --out DIR  # dry run into DIR/chNN/map.yaml
    python3 tools/content/worldmap_from_towns.py --chapters ch10,ch11  # only these chapters
    python3 tools/content/worldmap_from_towns.py --check    # drift check; ignores tier / marker / path
    python3 tools/content/worldmap_enrich.py                # always run after a write
Year ranges come from the design/02 §1.5 table by book-world name (白马 → ch10); its 序 column is
play order (Canon v1.9 puts 白马 first), never a chapter key. Only overland route kinds become
roads; a water-kind route opts in with `worldmap_road: true` when its short crossing is folded
into duration_days (琼州海峡). A route without via stops is drawn along its routes.yaml geometry.
Sect seats (tech/13 §5.4) come from docs/design/map/sects.yaml: each chapter lists the main seat and
every in-map branch whose availability is O / H / P / M (N and D are left out), projected from the
book-geography coordinates; branch ids are `<sect_id>__<branch>`.
Entry fields the sources cannot derive (town v2 region scenes, AR-114) come from the optional
docs/design/map/entry_overrides.yaml, `chNN -> node id -> {field: value}`; only ENTRY_OVERRIDE_FIELDS
may be set, unknown chapters or nodes fail. Tools write that file, never map.yaml, so a regenerate keeps them.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from tools.map.render_map import CanvasProjection, city_coord  # noqa: E402
from tools.town.common import load_yaml  # noqa: E402

WIDTH, HEIGHT = 512, 384
LI_PER_HOUR = 10  # 【建议值】单位换算；源路网 duration_days 保持不变。
CHAPTERS = ['tianlong', 'shediao', 'shendiao', 'yitian', 'xiaoao', 'xiake',
            'bixue', 'luding', 'liancheng', 'baima', 'yuanyang', 'shujian', 'feihu', 'xueshan']
BOOKS = {'天龙': 'ch01', '射雕': 'ch02', '神雕': 'ch03', '倚天': 'ch04', '笑傲': 'ch05', '侠客': 'ch06',
         '碧血': 'ch07', '鹿鼎': 'ch08', '连城': 'ch09', '白马': 'ch10', '鸳鸯': 'ch11', '书剑': 'ch12',
         '飞狐': 'ch13', '雪山': 'ch14'}
WATER_KINDS = ['river', 'canal', 'sea', 'coastal_mixed']
DISPLAY_ONLY = {'nodes': ['tier', 'marker'], 'roads': ['path']}  # written by worldmap_enrich.py
SECT_STATUSES = ('O', 'H', 'P', 'M')  # written to the map; N 尚未创立 / D 已消亡 are left out (tech/13 §5.4)
SECT_MARKERS = ('sect', 'temple', 'daoist')
SECT_ID_PATTERN = re.compile(r'^sect_[a-z0-9_]+$')
LEG_NOTE = '等效里程=源路段小时×10；via 等时分段与示意线（原创扩展、建议值）'
GEOMETRY_NOTE = '等效里程=源路段小时×10；单段路线按 routes.yaml geometry 折线（原创扩展、建议值）'
# Mirror of MapEntrySchema.townSpec in packages/data/src/schemas/world-map.ts. A spec the schema would
# reject (city keys with '_') is left unmounted with a warning; relax both together.
TOWN_SPEC_PATTERN = re.compile(r'^docs/design/town/city_[a-z0-9]+__ch[0-9]{2}\.yaml$')
ENTRY_OVERRIDES = 'docs/design/map/entry_overrides.yaml'
# sceneId / townSpec / templateYear stay derived from the sources; the schema still validates the result.
ENTRY_OVERRIDE_FIELDS = ('scene', 'gateId', 'spawn', 'accessNote')
RELIC_LOCATIONS = {
    'rs_shaolin_cangjingge': 'sect_shaolin', 'rs_huashan': 'sect_huashan',
    'rs_gumu': 'sect_gumu', 'rs_wudang': 'sect_wudang', 'rs_emei': 'sect_emei',
    'rs_taohuadao': 'city_taohuadao', 'rs_jianzhong': 'city_xiangyang',
    'rs_tianlongsi': 'sect_tianlongsi', 'rs_yanmenguan': 'city_xinzhou',
    'rs_zijincheng': 'city_beijing', 'rs_xihu': 'city_hangzhou', 'rs_tianshan': 'city_urumqi',
}


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False)


def years(text):
    """design/02 §1.5 → {chNN: [start, end]}, keyed by the 书界 column (序 is play order)."""
    lines = text.splitlines()
    start = next((i for i, line in enumerate(lines) if line.startswith('### 1.5 ')), None)
    if start is None:
        raise ValueError('design/02 §1.5 timeline table missing')
    result = {}
    for line in lines[start + 1:]:
        if line.startswith('#'):
            break
        fields = [field.strip() for field in line.split('|')]
        if len(fields) < 5 or not fields[1].isdigit() or fields[2] not in BOOKS:
            continue
        chapter = BOOKS[fields[2]]
        match = re.match(r'(?:约 ?)?([0-9]{1,4})(?:–([0-9]{1,4}))?', fields[3])
        if not match or chapter in result:
            raise ValueError(f'design/02 timeline row unreadable: {fields[2]}')
        result[chapter] = [int(match[1]), int(match[2] or match[1])]
    if len(result) != 14:
        raise ValueError('design/02 timeline table changed')
    return result


def relics(text):
    result = []
    for line in text.splitlines():
        fields = [field.strip().strip(chr(96)) for field in line.split('|')]
        if len(fields) != 6 or fields[2] not in RELIC_LOCATIONS:
            continue
        eras = [chapter for name, chapter in BOOKS.items() if name in fields[3]]
        result.append(dict(id=fields[2], name=fields[1], eras=eras, accessNote=fields[4]))
    if len(result) != 12:
        raise ValueError('design/02 relic table changed')
    return result


def clip_ring(points, axis, bound, lower):
    result = []
    for a, b in zip(points, points[1:] + points[:1]):
        inside_a = a[axis] >= bound if lower else a[axis] <= bound
        inside_b = b[axis] >= bound if lower else b[axis] <= bound
        if inside_a != inside_b:
            t = (bound - a[axis]) / (b[axis] - a[axis])
            result.append([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
        if inside_b:
            result.append(b)
    return result


def geometry(regions, project):
    land = []
    for ring in regions['land_polygons']:
        points = ring
        for axis, bound, lower in [(0, 73, True), (0, 135, False), (1, 18, True), (1, 54, False)]:
            points = clip_ring(points, axis, bound, lower)
        cells = list(dict.fromkeys(tuple(project(*p)) for p in points))
        if len(cells) >= 3:
            reduced = [cells[0]]
            for p in cells[1:]:
                if abs(p[0] - reduced[-1][0]) + abs(p[1] - reduced[-1][1]) >= 2:
                    reduced.append(p)
            if len(reduced) >= 3:
                land.append(reduced)
    features = {}
    for key in ['rivers', 'mountains']:
        features[key] = [list(dict.fromkeys(tuple(project(*p)) for p in line))
                         for row in regions[key] for line in row['lines']]
        features[key] = [line for line in features[key] if len(line) >= 2]
    return dict(land=land, **features)


def source_data():
    data = {key: load_yaml(ROOT / f'docs/design/map/{key}.yaml')
            for key in ['cities', 'routes', 'regions', 'sects']}
    text = (ROOT / 'docs/design/02-timeline-and-world-tiers.md').read_text()
    data['years'], data['relics'] = years(text), relics(text)
    data['towns'], data['unmounted_towns'] = {}, []
    for path in sorted((ROOT / 'docs/design/town').glob('city_*.yaml')):
        relative = str(path.relative_to(ROOT))
        if not TOWN_SPEC_PATTERN.match(relative):
            data['unmounted_towns'].append(relative)
            continue
        town = load_yaml(path)
        data['towns'][(town['city_id'], town['chapter_id'])] = (town, relative)
    overrides = ROOT / ENTRY_OVERRIDES
    data['entry_overrides'] = (load_yaml(overrides) or {}) if overrides.exists() else None
    data['levels'] = {}
    text = (ROOT / 'docs/design/11-open-world.md').read_text()
    for line in text.splitlines():
        fields = [field.strip().strip(chr(96)) for field in line.split('|')]
        if len(fields) > 6 and fields[1].isdigit() and fields[2].startswith('rg_'):
            match = re.fullmatch(r'([0-9]+)–([0-9]+)', fields[5])
            if match:
                data['levels'][fields[2]] = [int(match[1]), int(match[2])]
    return data


def apply_entry_overrides(nodes_by_id, overrides, chapter):
    """Merge hand-maintained entry fields for one chapter into its nodes (mutates them)."""
    if not overrides:
        return
    unknown = sorted(key for key in overrides if not re.fullmatch(r'ch[0-9]{2}', str(key)))
    if unknown:
        raise ValueError(f'{ENTRY_OVERRIDES}: unknown chapter keys {unknown}')
    for node_id, fields in sorted((overrides.get(chapter) or {}).items()):
        node = nodes_by_id.get(node_id)
        if node is None:
            raise ValueError(f'{ENTRY_OVERRIDES}: {chapter} has no node {node_id}')
        if not isinstance(fields, dict) or not fields:
            raise ValueError(f'{ENTRY_OVERRIDES}: {chapter}/{node_id} must map fields to values')
        extra = sorted(set(fields) - set(ENTRY_OVERRIDE_FIELDS))
        if extra:
            raise ValueError(f'{ENTRY_OVERRIDES}: {chapter}/{node_id} may only set {ENTRY_OVERRIDE_FIELDS}, not {extra}')
        node['entry'].update(fields)


def branch_key(sect_id, branch_id):
    """Stable map id for a sects.yaml branch: `<sect_id>__<branch>`, dropping `site_` and the sect's own key."""
    key = branch_id.removeprefix('site_')
    own = sect_id.removeprefix('sect_') + '_'
    if key.startswith(own):
        key = key[len(own):]
    return f'{sect_id}__{key}'


def compile_sects(data, chapter, project, node_ids):
    """Sect seats for one chapter (tech/13 §5.4): main seat plus in-map branches, by book geography."""
    seats = []
    for sect in data['sects']['sects']:
        status = sect['availability'][chapter]
        if status not in SECT_STATUSES:
            continue
        marker = sect.get('map_marker', 'sect')
        if marker not in SECT_MARKERS:
            raise ValueError(f"{sect['id']}: map_marker {marker!r} not in {SECT_MARKERS}")

        def seat(seat_id, site_name, kind, row):
            city = row.get('city_id')
            return dict(id=seat_id, name=sect['name'], siteName=site_name, kind=kind,
                        point=project(row['longitude'], row['latitude']), status=status, marker=marker,
                        cityId=city if city in node_ids else None)
        seats.append(seat(sect['id'], sect['site_name'], sect['kind'], sect))
        for branch in sect.get('branches', []):
            if branch.get('offmap_id') or chapter not in branch.get('open_chapters', []):
                continue
            seats.append(seat(branch_key(sect['id'], branch['id']), branch['name'], 'branch', branch))
    seats.sort(key=lambda row: row['id'])
    return seats


def compile_map(data, chapter):
    info = data['cities']['chapters'][chapter]
    projection = CanvasProjection(WIDTH, HEIGHT, margin=18)
    def project(lon, lat):
        x, z = projection(lon, lat)
        return [max(0, min(WIDTH - 1, round(x))), max(0, min(HEIGHT - 1, round(z)))]
    city_by = {row['id']: row for row in data['cities']['cities']}
    site_by = {row['id']: row for row in data['sects']['sects']}
    nodes = []
    for city in sorted(city_by.values(), key=lambda row: row['id']):
        era = city['eras'][chapter]
        spec, path = data['towns'].get((city['id'], chapter), ({}, None))
        if not era['open']:  # a city closed this chapter has no town to enter; its spec stays on disk, unmounted
            spec, path = {}, None
        gate = next((g for g in spec.get('gates', []) if g.get('primary')), None)
        coord = city_coord(city, info['band'])
        levels = data['levels'].get(city['region']) if chapter == 'ch01' else None
        nodes.append(dict(id=city['id'], name=era['name'], kind='town' if city['importance'] != 'site' else 'ruin',
            point=project(*coord), regionId=city['region'], eras=[ch for ch, state in city['eras'].items() if state['open']],
            open=era['open'], levelRange=levels, levelNote='design/11 §10.3 区域建议强度' if levels else '尚无区域强度配置',
            entry=dict(sceneId=city['id'], townSpec=path, templateYear=spec.get('historical_year'),
                gateId=gate['id'] if gate else None, spawn=[gate['at']['x'], gate['at']['z']] if gate else None,
                accessNote='城门进入；内部场景由 ENG-09 装配'), coordinateNote='design/map 城市治所投影'))
    for relic in data['relics']:
        anchor_id = RELIC_LOCATIONS[relic['id']]
        anchor = site_by.get(anchor_id) or city_by.get(anchor_id)
        if not anchor:
            raise ValueError(f'missing relic anchor: {anchor_id}')
        city_id = anchor.get('city_id', anchor_id)
        nodes.append(dict(**relic, kind='ruin', point=project(anchor['longitude'], anchor['latitude']),
            regionId=city_by[city_id]['region'], open=chapter in relic['eras'], levelRange=None,
            levelNote='遗迹门禁见 design/02 §6.6；无独立人物等级',
            entry=dict(sceneId=relic['id'], townSpec=None, gateId=None, spawn=None, templateYear=None,
                       accessNote=relic['accessNote']), coordinateNote=f'{anchor_id} 邻接锚（原创扩展，精确点位待考）'))
    by_id = {row['id']: row for row in nodes}
    apply_entry_overrides(by_id, data.get('entry_overrides'), chapter)
    roads = []
    travel_by = {row['id']: row for row in data['routes']['posts'] + data['routes']['ports']}
    def endpoint(value):
        return travel_by[value]['city_id'] if value in travel_by else value
    for route in sorted(data['routes']['routes'], key=lambda row: row['id']):
        # Boarding, timetables, fares and off-map express journeys belong to a later flow; a water
        # kind is walked here only when routes.yaml opts in (crossing folded into duration_days).
        if route['kind'] in WATER_KINDS and route.get('worldmap_road') is not True:
            continue
        if chapter not in route['open_chapters']:
            continue
        stops = [endpoint(value) for value in [route['from'], *route['via'], route['to']]]
        stops = [value for value in stops if by_id[value]['open']]
        if len(stops) < 2 or stops[0] != endpoint(route['from']) or stops[-1] != endpoint(route['to']):
            continue
        hours, legs = round(route['duration_days'] * 24), len(stops) - 1
        drawn = None
        if not route['via']:  # one leg: follow the authoritative geometry between the two node points
            drawn = [by_id[stops[0]]['point'], *(project(*pair) for pair in route['geometry'][1:-1]),
                     by_id[stops[-1]]['point']]
            drawn = [point for i, point in enumerate(drawn) if i == 0 or point != drawn[i - 1]]
        for i, (a, b) in enumerate(zip(stops, stops[1:])):
            leg_hours = (hours * (i + 1)) // legs - (hours * i) // legs
            roads.append(dict(key=route['id'] + ':' + str(i), routeId=route['id'], start=a, end=b,
                distanceLi=leg_hours * LI_PER_HOUR, points=drawn or [by_id[a]['point'], by_id[b]['point']],
                kind=route['kind'], eras=route['open_chapters'], sourceHours=leg_hours,
                note=GEOMETRY_NOTE if drawn else LEG_NOTE))
    connected = {value for road in roads for value in [road['start'], road['end']]}
    # Only existing relics get preview approach lanes, never new inter-city shortcuts.
    for relic in data['relics']:
        target = by_id[relic['id']]
        if not target['open']:
            continue
        candidates = [n for n in nodes if n['id'] in connected and n['regionId'] == target['regionId']]
        if not candidates:
            continue
        nearest = min(candidates, key=lambda n: (sum(abs(a - b) for a, b in zip(n['point'], target['point'])), n['id']))
        roads.append(dict(key='approach:' + target['id'], routeId=None, start=nearest['id'], end=target['id'],
            distanceLi=LI_PER_HOUR, points=[nearest['point'], target['point']], kind='approach',
            eras=target['eras'], sourceHours=1, note='遗迹入口演示接路1小时（原创扩展、建议值）；内部门禁另判'))
    roads.sort(key=lambda road: road['key'])
    nodes.sort(key=lambda node: node['id'])
    book = chapter + '_' + CHAPTERS[int(chapter[2:]) - 1]
    value = dict(version='worldmap.v1', chapterId=book, era=chapter, eraBand=info['band'],
        name=info['title'], years=data['years'][chapter], mapReferenceYear=info['year'],
        grid=dict(width=WIDTH, height=HEIGHT, projection='Albers 25N/47N/105E'),
        travel=dict(liPerHour=LI_PER_HOUR, stepLi=LI_PER_HOUR,
            note='等效里，非实测里程；按 design/11 小时精度调用 ENG-05 travelByMinutes'),
        startNodeId='city_dali', nodes=nodes, roads=roads, sects=compile_sects(data, chapter, project, by_id),
        terrain=geometry(data['regions'], project),
        sources=['docs/design/02-timeline-and-world-tiers.md', 'docs/design/11-open-world.md',
            'docs/design/map/cities.yaml', 'docs/design/map/routes.yaml', 'docs/design/map/sects.yaml',
            'docs/design/map/regions.yaml', *([ENTRY_OVERRIDES] if data.get('entry_overrides') is not None else []),
            *sorted(path for _, path in data['towns'].values())])
    validate_map(value)
    value['revision'] = hashlib.sha256(compact(value).encode()).hexdigest()
    return value


def validate_map(value):
    nodes = {n['id']: n for n in value['nodes']}
    if len(nodes) != len(value['nodes']) or value['startNodeId'] not in nodes:
        raise ValueError('node identity')
    keys = set()
    for node in nodes.values():
        if any(type(x) is not int for x in node['point']):
            raise ValueError('integer point')
    for road in value['roads']:
        if road['key'] in keys or road['start'] not in nodes or road['end'] not in nodes:
            raise ValueError('road reference')
        keys.add(road['key'])
        if type(road['distanceLi']) is not int or road['distanceLi'] <= 0:
            raise ValueError('road distance')
        if road['distanceLi'] != road['sourceHours'] * LI_PER_HOUR:
            raise ValueError('road time conservation')
        if road['points'][0] != nodes[road['start']]['point'] or road['points'][-1] != nodes[road['end']]['point']:
            raise ValueError('road endpoints')
        if not nodes[road['start']]['open'] or not nodes[road['end']]['open']:
            raise ValueError('road era endpoint')
    seen = set()
    for sect in value['sects']:
        if not SECT_ID_PATTERN.match(sect['id']) or sect['id'] in seen:
            raise ValueError(f"sect identity {sect['id']}")
        seen.add(sect['id'])
        if sect['status'] not in SECT_STATUSES or sect['marker'] not in SECT_MARKERS:
            raise ValueError(f"sect status / marker {sect['id']}")
        if any(type(x) is not int for x in sect['point']):
            raise ValueError(f"sect integer point {sect['id']}")
        if sect['cityId'] is not None and sect['cityId'] not in nodes:
            raise ValueError(f"sect city {sect['id']}")


def pretty(doc):
    """Canonical pretty JSON shared with worldmap_enrich.py: indent=2, ensure_ascii=False, no trailing newline."""
    return json.dumps(doc, ensure_ascii=False, indent=2, allow_nan=False)


def encode(value):
    # event.v1 is the available registry extension point, not a story reward.
    # The application validates mountWorldMap parameters before exposing the map.
    header = dict(schemaVersion='event.v1', id='ev_' + value['era'][2:] + '_ditu',
                  chapterId=value['chapterId'], event='world/mapRegistered', once=False)
    return pretty(dict(header, actions=[dict(op='mountWorldMap', map=value)]))


def without_display_fields(text):
    """The compiled document hidden under worldmap_enrich.py's display-only fields."""
    doc = json.loads(text)
    for key, fields in DISPLAY_ONLY.items():
        for row in doc['actions'][0]['map'][key]:
            for field in fields:
                row.pop(field, None)
    return pretty(doc)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true',
                        help='exit 1 when a map differs from the sources (enrich-only tier / marker / path ignored)')
    parser.add_argument('--out', type=Path, help='directory for chNN/map.yaml (default content/world); use for dry runs')
    parser.add_argument('--chapters', help='comma-separated chNN subset (default: all 14)')
    args = parser.parse_args()
    out = (args.out if args.out else ROOT / 'content/world').resolve()
    data = source_data()
    chapters = sorted(data['cities']['chapters'])
    if args.chapters:
        wanted = [value.strip() for value in args.chapters.split(',') if value.strip()]
        unknown = sorted(set(wanted) - set(chapters))
        if unknown:
            raise SystemExit('unknown chapters: ' + ', '.join(unknown))
        chapters = [chapter for chapter in chapters if chapter in wanted]
    for relative in data['unmounted_towns']:
        print(f'warning: {relative} not mounted (world-map schema townSpec pattern rejects it)')
    closed = sorted(f'{city}__{chapter}' for city, chapter in data['towns']
                    if not next(row for row in data['cities']['cities'] if row['id'] == city)['eras'][chapter]['open'])
    if closed:
        print(f'note: {len(closed)} town specs left unmounted because their city is closed that chapter')
    failures = []
    for chapter in chapters:
        value = compile_map(data, chapter)
        path = out / chapter / 'map.yaml'
        output = encode(value)
        if args.check:
            text = path.read_text(encoding='utf-8') if path.exists() else None
            if text is None or pretty(json.loads(text)) != text or without_display_fields(text) != output:
                failures.append(str(path))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(output, encoding='utf-8')
        visible = sum(node['open'] for node in value['nodes'])
        sects = ''.join(f'{k}{sum(s["status"] == k for s in value["sects"])}' for k in SECT_STATUSES)
        print(f'{chapter}: nodes={len(value["nodes"])} visible={visible} roads={len(value["roads"])} '
              f'sects={len(value["sects"])}({sects}) years={value["years"]} revision={value["revision"][:12]}')
    if failures:
        raise SystemExit('worldmap drift: ' + ', '.join(failures))
    if not args.check and out == (ROOT / 'content/world').resolve():
        print('next: python3 tools/content/worldmap_enrich.py  (adds display-only tier / marker / path)')


if __name__ == '__main__':
    main()

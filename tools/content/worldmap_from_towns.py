#!/usr/bin/env python3
"""Compile navigation overlays. Distances are equivalent game li, not surveys."""
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
    result = {}
    for line in text.splitlines():
        fields = [field.strip() for field in line.split('|')]
        if len(fields) < 5 or not fields[1].isdigit() or not 1 <= int(fields[1]) <= 14:
            continue
        match = re.match(r'(?:约 )?([0-9]{4})(?:–([0-9]{4}))?', fields[3])
        if match:
            result[f'ch{int(fields[1]):02}'] = [int(match[1]), int(match[2] or match[1])]
    if len(result) != 14:
        raise ValueError('design/02 timeline table changed')
    return result


def relics(text):
    names = ['天龙', '射雕', '神雕', '倚天', '笑傲', '侠客', '碧血', '鹿鼎',
             '连城', '白马', '鸳鸯', '书剑', '飞狐', '雪山']
    result = []
    for line in text.splitlines():
        fields = [field.strip().strip(chr(96)) for field in line.split('|')]
        if len(fields) != 6 or fields[2] not in RELIC_LOCATIONS:
            continue
        eras = [f'ch{i + 1:02}' for i, name in enumerate(names) if name in fields[3]]
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
    data['towns'] = {}
    for path in sorted((ROOT / 'docs/design/town').glob('city_*.yaml')):
        town = load_yaml(path)
        data['towns'][(town['city_id'], town['chapter_id'])] = (town, str(path.relative_to(ROOT)))
    data['levels'] = {}
    text = (ROOT / 'docs/design/11-open-world.md').read_text()
    for line in text.splitlines():
        fields = [field.strip().strip(chr(96)) for field in line.split('|')]
        if len(fields) > 6 and fields[1].isdigit() and fields[2].startswith('rg_'):
            match = re.fullmatch(r'([0-9]+)–([0-9]+)', fields[5])
            if match:
                data['levels'][fields[2]] = [int(match[1]), int(match[2])]
    return data


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
    roads = []
    travel_by = {row['id']: row for row in data['routes']['posts'] + data['routes']['ports']}
    def endpoint(value):
        return travel_by[value]['city_id'] if value in travel_by else value
    for route in sorted(data['routes']['routes'], key=lambda row: row['id']):
        # Boarding, timetables, fares and off-map express journeys belong to a later flow.
        if route['kind'] in ['river', 'canal', 'sea', 'coastal_mixed'] or chapter not in route['open_chapters']:
            continue
        stops = [endpoint(value) for value in [route['from'], *route['via'], route['to']]]
        stops = [value for value in stops if by_id[value]['open']]
        if len(stops) < 2 or stops[0] != endpoint(route['from']) or stops[-1] != endpoint(route['to']):
            continue
        hours, legs = round(route['duration_days'] * 24), len(stops) - 1
        for i, (a, b) in enumerate(zip(stops, stops[1:])):
            leg_hours = (hours * (i + 1)) // legs - (hours * i) // legs
            roads.append(dict(key=route['id'] + ':' + str(i), routeId=route['id'], start=a, end=b,
                distanceLi=leg_hours * LI_PER_HOUR, points=[by_id[a]['point'], by_id[b]['point']],
                kind=route['kind'], eras=route['open_chapters'], sourceHours=leg_hours,
                note='等效里程=源路段小时×10；via 等时分段与示意线（原创扩展、建议值）'))
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
        startNodeId='city_dali', nodes=nodes, roads=roads, terrain=geometry(data['regions'], project),
        sources=['docs/design/02-timeline-and-world-tiers.md', 'docs/design/11-open-world.md',
            'docs/design/map/cities.yaml', 'docs/design/map/routes.yaml', 'docs/design/map/sects.yaml',
            'docs/design/map/regions.yaml', *sorted(path for _, path in data['towns'].values())])
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


def encode(value):
    # event.v1 is the available registry extension point, not a story reward.
    # The application validates mountWorldMap parameters before exposing the map.
    header = dict(schemaVersion='event.v1', id='ev_' + value['era'][2:] + '_ditu',
                  chapterId=value['chapterId'], event='world/mapRegistered', once=False)
    lines = [compact(header)[:-1] + ',"actions":[{"op":"mountWorldMap","map":{']
    keys = list(value)
    for index, key in enumerate(keys):
        suffix = ',' if index < len(keys) - 1 else ''
        if key in ['nodes', 'roads']:
            lines.append(compact(key) + ':[')
            lines.extend(compact(row) + (',' if i < len(value[key]) - 1 else '') for i, row in enumerate(value[key]))
            lines.append(']' + suffix)
        else:
            lines.append(compact(key) + ':' + compact(value[key]) + suffix)
    lines.append('}}]}')
    return chr(10).join(lines) + chr(10)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = source_data()
    failures = []
    for chapter in sorted(data['cities']['chapters']):
        value = compile_map(data, chapter)
        path = ROOT / 'content/world' / chapter / 'map.yaml'
        output = encode(value)
        if args.check:
            if not path.exists() or path.read_text() != output:
                failures.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            # Each physical write stays within the task's 150-line limit.
            with path.open('w', encoding='utf-8', newline='') as stream:
                lines = output.splitlines(keepends=True)
                for offset in range(0, len(lines), 120):
                    stream.writelines(lines[offset:offset + 120])
        visible = sum(node['open'] for node in value['nodes'])
        print(f'{chapter}: nodes={len(value["nodes"])} visible={visible} roads={len(value["roads"])} bytes={len(output.encode())}')
    if failures:
        raise SystemExit('worldmap drift: ' + ', '.join(failures))


if __name__ == '__main__':
    main()

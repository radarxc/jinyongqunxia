#!/usr/bin/env python3
"""从 CitySpec 构造可重放的 TownLayout；功能优先、通用沿街填充。"""

from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys
import time

from common import (HexGrid, ROOT, TownError, canonical_bytes, cells_to_json,
                    expand, geometry_masks, hexes_to_json, load_yaml, point,
                    rectangle, root_seed, substream, zone_winners)
from placement import entrance_buffers, fixed_buildings, map_entrances, place_buildings
from roads import (GenerationError, bridge_footprint_cells, component, components, planning_bridge_groups,
                   prepare_roads, road_union)


def decorate(spec, masks, roads, occupied, reserve, clearance, rng_root):
    allowed = (masks["walkable"] & masks["interior"] - occupied - reserve - clearance
               - masks["water"] - bridge_footprint_cells(masks))
    radius = spec["vegetation"]["avoid_road_cells"]
    if radius:
        allowed -= expand(road_union(roads),radius-1)
    placed = {}
    rng = substream(rng_root,"vegetation")
    palette = sorted(spec["vegetation"]["palette"])
    density = int(spec["vegetation"]["density"]*10000)
    neighbors = ((0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1),(-1,0),(-1,1))
    for x,z in sorted(allowed,key=lambda p:(p[1],p[0])):
        if (x,z) in placed:
            continue
        if rng.uniform(10000) >= density:
            continue
        asset = palette[rng.uniform(len(palette))]
        target = 2+rng.uniform(4)
        placed[x,z] = asset
        count = 1
        for dx,dz in neighbors:
            p = x+dx,z+dz
            if count >= target:
                break
            if p in allowed and p not in placed:
                placed[p] = asset
                count += 1
    return [dict(id=f"dec_{i:04d}",asset_id=asset,at=dict(x=x,z=z))
            for i,((x,z),asset) in enumerate(sorted(placed.items(),key=lambda pair:(pair[0][1],pair[0][0],pair[1])),1)]


def ground_layer(spec, winners, roads, masks, walkable, rng_root):
    zones = {z["id"]: z for z in spec["zones"]}
    streams = {zid:substream(rng_root,"ground",zid) for zid in zones}
    surfaces = {}
    for street in sorted(spec["streets"],key=lambda s:(-s["priority"],s["id"])):
        for p in roads[street["id"]]:
            surfaces.setdefault(p,street["surface"])
    for rid,cells in sorted(roads.items()):
        for p in cells:
            surfaces.setdefault(p,"dirt_road")
    runs = []
    width,height = spec["grid"]["width"],spec["grid"]["height"]
    for z in range(height):
        for x in range(width):
            p = x,z
            ground = "rammed_earth"
            if p in winners:
                zid = winners[p]
                sample = streams[zid].uniform(100)
                for key,weight in sorted(zones[zid]["ground_mix"].items()):
                    sample -= weight
                    if sample < 0:
                        ground = key
                        break
            ground = surfaces.get(p,ground)
            overlay = None
            if p in masks["water"]:
                ground = "water"
            if p in masks["bridges"]:
                overlay = f"tex_town_{spec['era_kit']}_bridge_deck"
            value = dict(ground=ground,walkable=p in walkable,elevation_m=0,overlay=overlay)
            index = z*width+x
            if runs and runs[-1][2] == value:
                runs[-1][1] += 1
            else:
                runs.append([index,1,value])
    return runs


def generate_layout(spec, source_path="<memory>", source_bytes=None):
    from check_town import validate_spec
    from schema_check import issue, sort_issues
    started = time.perf_counter()
    errors = [i for i in validate_spec(spec) if i["severity"] == "error"]
    if errors:
        first = errors[0]
        raise GenerationError(first["code"],first["message"],first["path"])
    bridge_groups = planning_bridge_groups(spec["bridges"])
    masks = geometry_masks(spec)
    masks["bridges"] = set().union(*(cells for _, cells in bridge_groups)) & masks["water"]
    coverage = zone_winners(spec)
    winners = {p:zid for zid,cells in coverage.items() for p in cells}
    fixed,occupied,clearance = fixed_buildings(spec)
    roads,connectors = prepare_roads(spec,masks,winners,occupied|clearance)
    fixed_buffers = entrance_buffers(fixed)
    excluded = road_union(roads)|masks["water"]|masks["gate_footprints"]|bridge_footprint_cells(masks)|clearance|fixed_buffers
    density_coverage = {zid:cells & masks["margin"] - excluded for zid,cells in coverage.items()}
    rng_root = root_seed(spec)
    grid = HexGrid(spec["grid"]["width"],spec["grid"]["height"])
    state = place_buildings(spec,masks,coverage,roads,connectors,fixed,clearance,rng_root,grid)
    buildings,occupied,reserve,roads,connectors,stats,parcels = state
    priority = {z["id"]:z["priority"] for z in spec["zones"]}
    buildings = buildings[:len(fixed)] + sorted(buildings[len(fixed):],key=lambda b:(
        -priority[b["zone_ref"]],b["type"],b["origin"]["z"],b["origin"]["x"]))
    mapping = map_entrances(spec,masks,grid,buildings,occupied,roads)
    if mapping is None:
        raise GenerationError("TOWN_HEX_DISCONNECTED","最终六角入口断连","walk_layer")
    for index,(building,h) in enumerate(zip(buildings,mapping[0]),1):
        building["id"] = f"bi_{index:04d}"
        building["entrance_hexes"] = [dict(q=h[0],r=h[1])]
    walkable = masks["walkable"]-occupied
    all_roads = road_union(roads)
    primary = next(g for g in spec["gates"] if g["primary"])
    connected = component(walkable,point(primary["at"]))
    if any(point(b["entrance_cells"][0]) not in connected for b in buildings):
        raise GenerationError("TOWN_ENTRANCE_UNREACHABLE","最终规划入口断连","buildings")
    if len(components(all_roads)) != 1:
        raise GenerationError("TOWN_ROAD_COMPONENT_DISCONNECTED","最终道路断连","roads")
    warnings = []
    counts = Counter(b["type"] for b in buildings)
    quota_counts = {q["type"]: sum(b["type"] == q["type"] and b["zone_ref"] in q["zone_refs"]
                                   for b in buildings) for q in spec["building_quotas"]}
    for zone in spec["zones"]:
        area = sum(b["size"]["w"]*b["size"]["h"] for b in buildings if b["zone_ref"] == zone["id"])
        maximum = len(density_coverage[zone["id"]])*zone["density"]
        if area > maximum:
            warnings.append(issue("TOWN_DENSITY_TARGET_EXCEEDED",f"实际占地{area} > 密度目标{maximum:.2f}；保留合法沿街建筑",
                                  "zones."+zone["id"],severity="warning"))
    for quota in spec["building_quotas"]:
        if not quota["required"] and quota_counts[quota["type"]] < quota["count"]["max"]:
            warnings.append(issue("TOWN_OPTIONAL_NO_SPACE","余地块/入口限制，未追加至max",
                                  "building_quotas."+quota["type"],severity="warning"))
    failures = [issue("TOWN_QUOTA_MIN", f"通用填充仅放下{quota_counts[q['type']]}/{q['count']['min']}；请调整源规格下限",
                      "building_quotas."+q["type"])
                for q in spec["building_quotas"] if q["required"] and quota_counts[q["type"]] < q["count"]["min"]]
    raw = canonical_bytes(spec) if source_bytes is None else source_bytes
    source = Path(source_path)
    if source.is_absolute():
        try:
            source_path = source.resolve().relative_to(ROOT).as_posix()
        except ValueError:
            source_path = source.name
    layout = dict(schema_version="town.layout.v1",kind="TownLayout",
        source_spec=dict(path=str(source_path),sha256=hashlib.sha256(raw).hexdigest(),
                         city_id=spec["city_id"],chapter_id=spec["chapter_id"],seed=spec["seed"]),
        generator=dict(name="town-gen",version="1.4.0",rng="pcg32-xsh-rr-64-32",algorithm_revision=6,
                       root_seed_u64=f"0x{rng_root:016x}"),grid=spec["grid"],runtime_partition=spec["runtime_partition"],
        ground_cells=ground_layer(spec,winners,roads,masks,walkable,rng_root),
        roads={rid:cells_to_json(cells) for rid,cells in sorted(roads.items())},
        generated_connectors=connectors,water_cells=cells_to_json(masks["water"]),bridge_cells=cells_to_json(masks["bridges"]),
        buildings=buildings,decorations=decorate(spec,masks,roads,occupied,reserve,clearance,rng_root),
        zone_coverage={zid:cells_to_json(cells) for zid,cells in sorted(density_coverage.items())},
        walk_layer=dict(planning_walkable=cells_to_json(walkable),runtime_hex_walkable=hexes_to_json(mapping[2]),
                        runtime_hex_blocked=hexes_to_json(grid.slots-mapping[2]),sample_rule="planning-mask-center-and-six-vertices-v1"),
        validation=dict(errors=len(failures),warnings=len(warnings),infos=0,connected_components=1,unreachable_required_pois=0,
                        checks_run=["schema","overlap","water","wall","roads","entrances","hex","quotas"],
                        issues=sort_issues(failures+warnings)))
    stats.update(city_id=spec["city_id"],road_cells=len(all_roads),buildings=len(buildings),building_types=dict(sorted(counts.items())),
                 water_cells=len(masks["water"]),
                 lake_cells={key:len(cells) for key,cells in sorted(masks["lake_cells"].items())},
                 source_bridges=len(spec["bridges"]),assembled_bridges=len(bridge_groups),
                 merged_bridge_groups=[[b["id"] for b in members] for members, _ in bridge_groups if len(members)>1],
                 planning_walkable=len(walkable),runtime_hex_walkable=len(mapping[2]),road_components=1,
                 required_components=1,complete=not failures,
                 missing_required={q["type"]:q["count"]["min"]-quota_counts[q["type"]] for q in spec["building_quotas"]
                                   if q["required"] and quota_counts[q["type"]] < q["count"]["min"]},
                 decorations=len(layout["decorations"]),generation_seconds=round(time.perf_counter()-started,4))
    return layout,stats


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec",type=Path)
    parser.add_argument("-o","--output",required=True,type=Path)
    parser.add_argument("--stats",type=Path,help="另存统计JSON（耗时不写入布局）")
    args = parser.parse_args(argv)
    try:
        spec = load_yaml(args.spec)
        try:
            source_path = str(args.spec.resolve().relative_to(ROOT))
        except ValueError:
            source_path = args.spec.name
        layout,stats = generate_layout(spec,source_path,args.spec.read_bytes())
        payload = canonical_bytes(layout)
        failed = layout["validation"]["errors"] > 0
        output = args.output
        output.parent.mkdir(parents=True,exist_ok=True)
        temporary = output.with_suffix(output.suffix+".tmp")
        temporary.write_bytes(payload)
        temporary.replace(output)
        stats["layout_sha256"] = hashlib.sha256(payload).hexdigest()
        if args.stats:
            args.stats.parent.mkdir(parents=True,exist_ok=True)
            args.stats.write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(json.dumps(stats,ensure_ascii=False,sort_keys=True))
        if failed:
            print("通用配额待调整："+layout["validation"]["issues"][0]["message"],file=sys.stderr)
        return 1 if failed else 0
    except (GenerationError,TownError,OSError,ValueError) as exc:
        print(str(exc),file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

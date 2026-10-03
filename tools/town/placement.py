"""构造式建筑放置：功能优先、通用沿街填充与入口步道。"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

from common import building_entrance, catalog, cells_to_json, expand, point, rectangle, substream
from roads import DIRECTIONS, GenerationError, add_connector, bridge_footprint_cells, road_union


def access_edges(entry):
    """原图门向优先；其他边可接步道，不因此旋转素材或拒绝可用占地。"""
    return list(entry["entrance_edges"]) + [e for e in "NESW" if e not in entry["entrance_edges"]]


def entrance_path(start, walkable, roads, limit=6, full_width=False):
    """最短路先按终点road id，再按完整(z,x)序列决胜。"""
    from roads import width_two_edge
    if start not in walkable:
        return None
    owners = {}
    for rid, cells in sorted(roads.items()):
        for p in cells:
            owners.setdefault(p, rid)
    paths = {start: (start,)}
    frontier = [start]
    visited = {start}
    for _ in range(limit + 1):
        goals = [p for p in frontier if p in owners]
        if goals:
            goal = min(goals, key=lambda p: (owners[p], p[1], p[0],
                                            tuple((z,x) for x,z in paths[p])))
            return list(paths[goal])
        following = {}
        for p in frontier:
            for dx, dz in DIRECTIONS:
                q = p[0] + dx, p[1] + dz
                if q not in walkable or q in visited:
                    continue
                if full_width and not width_two_edge(p, q) <= walkable:
                    continue
                candidate = paths[p] + (q,)
                if q not in following or tuple((z,x) for x,z in candidate) < tuple((z,x) for x,z in following[q]):
                    following[q] = candidate
        paths.update(following)
        frontier = sorted(following, key=lambda p: (p[1], p[0]))
        visited.update(frontier)
    return None



def road_distances(roads, bounds):
    """无障碍曼哈顿距离；同距按道路id。"""
    import heapq
    best, heap = {}, []
    for rid, cells in sorted(roads.items()):
        for x, z in sorted(cells, key=lambda p: (p[1], p[0])):
            if (x,z) not in best:
                best[x,z] = (0, rid)
                heapq.heappush(heap, (0, rid, z, x))
    while heap:
        distance, rid, z, x = heapq.heappop(heap)
        if best[x,z] != (distance, rid):
            continue
        for dx, dz in DIRECTIONS:
            q = x+dx, z+dz
            value = distance+1, rid
            if q in bounds and value < best.get(q, (10**9, "")):
                best[q] = value
                heapq.heappush(heap, (distance+1, rid, q[1], q[0]))
    return best



@dataclass
class Candidate:
    building: dict
    foot: frozenset
    buffer: frozenset
    entrance: tuple
    score_key: tuple
    jitter: int



def fixed_buildings(spec):
    result, occupied, clearance = [], set(), set()
    entries = catalog()
    quotas = {q["type"]: q for q in spec["building_quotas"]}
    for landmark in spec["landmarks"]:
        entry = entries[landmark["type"]]
        entrance, normal = building_entrance(landmark["origin"], entry["w"], entry["h"],
                                             0, entry["entrance_edges"][0])
        size = dict(w=entry["w"], h=entry["h"])
        foot = rectangle(landmark["origin"], size)
        occupied |= foot
        if "pagoda" in landmark["type"]:
            clearance |= expand(foot, 3) - foot
        quota = quotas.get(landmark["type"], {})
        building = {key: landmark[key] for key in ("type", "origin", "zone_ref", "poi")}
        building.update(size=size, rotation_deg=0)
        building.update(id=f"bi_{len(result)+1:04d}", entrance_cells=cells_to_json({entrance}),
                        entrance_hexes=[], business_ref=quota.get("business_ref"))
        result.append(building)
    return result, occupied, clearance - occupied


def entrance_buffers(buildings):
    """普通入口一格、衙门四格；固定与自动建筑共用同一法向规则。"""
    result = set()
    for b in buildings:
        entry = catalog()[b["type"]]
        for edge in access_edges(entry):
            at, normal = building_entrance(b["origin"], entry["w"], entry["h"], b["rotation_deg"], edge)
            if at in {point(p) for p in b["entrance_cells"]}:
                depth = 4 if b["type"].endswith("_yamen") else 1
                result.update((at[0] + normal[0] * i, at[1] + normal[1] * i) for i in range(depth))
    return result



def candidates_for(spec, quota, masks, coverage, roads, fixed, clearance, root_seed):
    """每个画幅内矩形恰抽一次抖动，非法矩形同样消费；按沿街评分贪心。"""
    import numpy as np
    entry = catalog()[quota["type"]]
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    zones = {z["id"]: z for z in spec["zones"]}
    road_cells = road_union(roads)
    nearest = road_distances(roads, masks["bounds"])
    occupied = set().union(*(rectangle(b["origin"], b["size"]) for b in fixed))
    fixed_buffers = entrance_buffers(fixed)
    base = (masks["margin"] - masks["gate_footprints"] - masks["water"] - road_cells
            - bridge_footprint_cells(masks) - occupied - clearance - fixed_buffers)
    walk = masks["walkable"] - occupied
    buffer_allowed = (walk & masks["margin"])-clearance
    navigable = masks["navigable_water"]
    result = []
    for zid in sorted(quota["zone_refs"], key=lambda z: (-zones[z]["priority"], z)):
        allowed = base & coverage[zid]
        invalid = np.ones((height, width), dtype=np.int32)
        for x, z in allowed:
            invalid[z, x] = 0
        integral = np.pad(invalid.cumsum(0).cumsum(1), ((1,0),(1,0)))
        rng = substream(root_seed, "buildings", zid, quota["type"])
        # 当前素材只有原生 0°；沿路入口加分，但不旋转占地来强求朝路。
        for rotation in (0,):
            w, h = entry["w"], entry["h"]
            for z in range(height-h+1):
                for x in range(width-w+1):
                    jitter = rng.uniform(10)
                    if integral[z+h,x+w]-integral[z,x+w]-integral[z+h,x]+integral[z,x]:
                        continue
                    foot = frozenset(rectangle((x,z), (w,h)))
                    if quota["type"].endswith("_wharf") and not any(
                            (px+dx,pz+dz) in navigable for px,pz in foot for dx,dz in DIRECTIONS):
                        continue
                    for edge in access_edges(entry):
                        entrance, normal = building_entrance((x,z), entry["w"], entry["h"], rotation, edge)
                        depth = 4 if quota["type"].endswith("_yamen") else 1
                        buffer = frozenset((entrance[0]+normal[0]*i,entrance[1]+normal[1]*i) for i in range(depth))
                        if not buffer <= buffer_allowed or buffer & foot:
                            continue
                        distance, rid = nearest.get(entrance, (10**9, "~"))
                        score = (1000*(entrance in road_cells) + 40*w*h - 25*distance + jitter
                                 + 50*(edge in entry["entrance_edges"]))
                        rotated_edge = dict(zip(DIRECTIONS, "NESW"))[normal]
                        building = dict(type=quota["type"], origin=dict(x=x,z=z), size=dict(w=w,h=h),
                                        rotation_deg=rotation, zone_ref=zid, poi=None,
                                        business_ref=quota["business_ref"], entrance_cells=cells_to_json({entrance}),
                                        entrance_hexes=[], id="")
                        result.append(Candidate(building,foot,buffer,entrance,
                                                (-score,rid,zid,rotation,z,x,rotated_edge),jitter))
    return sorted(result, key=lambda c: c.score_key)



def polyline_water(river):
    from common import polyline_cells
    return polyline_cells(river["points"], river["width_cells"])



def map_entrances(spec, masks, grid, buildings, occupied, roads):
    """重采样真实碰撞；入口预留包含七点，不用道路标签伪装修复。"""
    from common import wall_spec
    walkable = masks["walkable"] - occupied
    hexes = grid.walkable(walkable)
    primary = next((g for g in spec["gates"] if g["primary"]), None)
    if primary:
        owner = wall_spec(spec, primary.get("wall_ref"))
        wall_points = owner["polygon"]["points"] if owner else None
        root = grid.gate_hex(primary, hexes, masks["interior"], roads[primary["road_ref"]],
                             masks["passages"], wall_points=wall_points)
    else:
        root_cell = min(road_union(roads), key=lambda p: (p[1], p[0]))
        root = grid.entrance_hex(root_cell, hexes, walkable, radius=2)
    if root is None:
        return None
    connected = grid.connected(hexes, root)
    reserved, mapped = set(), []
    for gate in spec["gates"]:
        owner = wall_spec(spec, gate.get("wall_ref"))
        wall_points = owner["polygon"]["points"] if owner else None
        h = grid.gate_hex(gate, hexes, masks["interior"], roads[gate["road_ref"]],
                          masks["passages"], connected, wall_points=wall_points)
        if h is None:
            return None
        reserved |= grid.samples[h]
    for building in buildings:
        h = grid.entrance_hex(point(building["entrance_cells"][0]), connected, walkable)
        if h is None:
            return None
        mapped.append(h)
        reserved |= grid.samples[h]
    return mapped, reserved, hexes



def pair_clearance(candidate, placed, zones):
    """宫禁三格；住宅与仓厩一格；以完整footprint判定。"""
    kind = zones[candidate.building["zone_ref"]]["kind"]
    typ = candidate.building["type"]
    homes = ("_house", "_courtyard", "_manor")
    storage = ("_stable", "_warehouse")
    for building in placed:
        other_kind = zones[building["zone_ref"]]["kind"]
        other_type = building["type"]
        gap = 3 if (kind == "palace") != (other_kind == "palace") else 0
        if typ.endswith(homes) and other_type.endswith(storage) or typ.endswith(storage) and other_type.endswith(homes):
            gap = max(gap, 1)
        if gap and candidate.foot & expand(rectangle(building["origin"], building["size"]), gap):
            return False
    return True



def subdivide(spec, coverage, available):
    """required 后切余地；左下最小格起最大空矩形，再按目录中位数切片。"""
    parcels = []
    entries = catalog()
    fixed_types = {b["type"] for b in spec["landmarks"]}
    for zone in sorted(spec["zones"], key=lambda z: (-z["priority"], z["id"])):
        sizes = [(entries[t]["w"], entries[t]["h"])
                 for t in zone["allowed_building_types"] if t not in fixed_types]
        if not sizes:
            continue
        def middle(values):
            values = sorted(values)
            return (values[(len(values)-1)//2] + values[len(values)//2])//2
        tw, th = max(6,min(24,middle([w for w,h in sizes]))), max(6,min(20,middle([h for w,h in sizes])))
        remaining = available & coverage[zone["id"]]
        while remaining:
            x, z = min(remaining, key=lambda p: (p[1],p[0]))
            width, best, row = 10**9, (0,0,0), z
            while (x,row) in remaining:
                end = x
                while end-x < width and (end,row) in remaining:
                    end += 1
                width = min(width,end-x)
                h = row-z+1
                best = max(best,(width*h,width,h))
                row += 1
            _, w, h = best
            cellset = rectangle((x,z),(min(w,tw),min(h,th)))
            remaining -= cellset
            if any(sw <= min(w,tw) and sh <= min(h,th) for sw,sh in sizes):
                parcels.append((zone["id"],cellset))
    return parcels



def prepare_fixed_access(spec, masks, coverage, roads, connectors, fixed, grid):
    zones = {z["id"]: z for z in spec["zones"]}
    width = spec["grid"]["width"]
    occupied = set().union(*(rectangle(b["origin"],b["size"]) for b in fixed))
    fixed_reserve = entrance_buffers(fixed)
    if not fixed_reserve <= masks["walkable"] & masks["margin"] - occupied:
        raise GenerationError("TOWN_ENTRANCE_BUFFER", "固定入口缓冲侵入硬障或墙距", "landmarks")
    for b in fixed:
        walk = access_domain(masks, coverage, zones, b["zone_ref"], occupied, roads)
        path = entrance_path(point(b["entrance_cells"][0]),walk,roads,full_width=True)
        if path is None:
            # 固定塔群原始入口距手写路10/15格；在其净空内建真实步道后再验六步。
            from roads import connect_path
            winners = {p:zid for zid,cells in coverage.items() for p in cells}
            path = connect_path({point(b["entrance_cells"][0])},road_union(roads),
                                walk,road_union(roads),winners,zones,
                                zones[b["zone_ref"]]["priority"],width,spec["grid"]["height"])
            if path is None:
                raise GenerationError("TOWN_ENTRANCE_UNREACHABLE", "固定入口全宽步道无解", b["id"])
        fixed_reserve.update(path)
        if len(path) > 1:
            add_connector(roads,connectors,path,"required_entrance_unconnected",b["zone_ref"])
    mapped = map_entrances(spec,masks,grid,fixed,occupied,roads)
    if mapped is None:
        raise GenerationError("TOWN_HEX_DISCONNECTED", "空城加固定地标六角入口不通", "landmarks")
    fixed_reserve |= mapped[1]
    return occupied,fixed_reserve


def access_domain(masks, coverage, zones, zid, occupied, roads):
    """入口可走自己的宫区；其他宫禁只允许复用已声明道路。"""
    forbidden = set().union(*(coverage[key] for key, zone in zones.items()
                              if zone["kind"] == "palace" and key != zid))
    return (masks["walkable"] - occupied) - (forbidden - road_union(roads))


GENERIC_SUFFIXES = ("_house", "_courtyard", "_shop", "_shop_1f", "_shop_2f",
                    "_market_stall", "_warehouse")


def is_generic(quota):
    """有业务或机构绑定的实例始终优先，不因外观属于民居而变为填充。"""
    return (quota["type"].endswith(GENERIC_SUFFIXES)
            and not quota.get("business_ref") and not quota.get("institution_ref"))


def place_buildings(spec, masks, coverage, roads, connectors, fixed, clearance,
                    rng_root, grid):
    """不回溯：每个候选至多试放一次，保留真实步道及六角入口净空。"""
    from roads import connect_path
    zones = {z["id"]: z for z in spec["zones"]}
    winners = {p: zid for zid, cells in coverage.items() for p in cells}
    entries = catalog()
    quotas = sorted(spec["building_quotas"], key=lambda q: (
        is_generic(q), not q["required"],
        -entries[q["type"]]["w"] * entries[q["type"]]["h"], q["type"]))
    occupied, reserve = prepare_fixed_access(spec, masks, coverage, roads, connectors, fixed, grid)
    reserve |= road_union(roads)
    placed = list(fixed)
    quota_zones = {q["type"]: set(q["zone_refs"]) for q in quotas}
    counts = Counter(b["type"] for b in placed if b["zone_ref"] in quota_zones.get(b["type"], set()))
    zone_counts = Counter((b["type"], b["zone_ref"]) for b in placed)
    attempts = 0

    def attempt(c):
        nonlocal occupied, reserve, attempts
        typ, zid = c.building["type"], c.building["zone_ref"]
        if c.foot & (occupied | reserve) or c.buffer & occupied:
            return False
        if zone_counts[typ, zid] >= entries[typ]["max_per_zone"]:
            return False
        if not pair_clearance(c, placed, zones):
            return False
        attempts += 1
        new_occupied = occupied | c.foot
        walk = access_domain(masks, coverage, zones, zid, new_occupied, roads)
        path = entrance_path(c.entrance, walk, roads, full_width=True)
        if path is None:
            path = connect_path({c.entrance}, road_union(roads), walk, road_union(roads),
                                winners, zones, zones[zid]["priority"],
                                spec["grid"]["width"], spec["grid"]["height"])
        if path is None:
            return False
        # 步道只改变地表，不伪造可走层；六角仍按真实占地重采样。
        mapping = map_entrances(spec, masks, grid, placed + [c.building], new_occupied, roads)
        if mapping is None:
            return False
        if len(path) > 1:
            add_connector(roads, connectors, path, "required_entrance_unconnected", zid)
        placed.append(c.building)
        occupied = new_occupied
        reserve |= c.buffer | set(path) | mapping[1] | road_union(roads)
        counts[typ] += 1
        zone_counts[typ, zid] += 1
        return True

    # 功能建筑先满足全部必需实例，再尝试可选功能；不追加必需功能的max。
    for quota in (q for q in quotas if not is_generic(q)):
        typ = quota["type"]
        target = quota["count"]["min"] if quota["required"] else quota["count"]["max"]
        if counts[typ] >= target:
            continue
        for c in candidates_for(spec, quota, masks, coverage, roads, placed, clearance, rng_root):
            attempt(c)
            if counts[typ] >= target:
                break
        if quota["required"] and counts[typ] < target:
            raise GenerationError("TOWN_REQUIRED_NO_SPACE",
                                  f"功能建筑 {typ} 仅放下 {counts[typ]}/{target}，须调整分区或地标位置",
                                  "building_quotas." + typ)
    # 每轮各通用类型至多放一栋，避免大院先吃完住宅、商铺先吃完市场。
    # min不影响候选和停止条件：调低验收下限不会反过来改变构造结果。
    # 可选仓储等补位不得抢占必需商铺/住宅仍可使用的完整原生占地。
    for required in (True, False):
        pools = [(q, iter(candidates_for(spec, q, masks, coverage, roads, placed, clearance, rng_root)))
                 for q in quotas if is_generic(q) and q["required"] == required]
        while pools:
            following = []
            for quota, candidates in pools:
                if counts[quota["type"]] >= quota["count"]["max"]:
                    continue
                for c in candidates:
                    if attempt(c):
                        following.append((quota, candidates))
                        break
            pools = following
    parcels = subdivide(spec, coverage, masks["margin"] - masks["water"] - bridge_footprint_cells(masks) - occupied
                        - reserve - clearance - road_union(roads))
    return (placed, occupied, reserve, roads, connectors,
            dict(placement_attempts=attempts, parcels=len(parcels)), parcels)

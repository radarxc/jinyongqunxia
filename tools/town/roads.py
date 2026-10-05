"""确定性全宽街巷连接；道路集合与普通可走空地分别检查。"""

from __future__ import annotations

from collections import deque
from functools import lru_cache
import heapq

from common import cells_to_json, polyline_cells

DIRECTIONS = ((0, 1), (1, 0), (0, -1), (-1, 0))


class GenerationError(ValueError):
    def __init__(self, code, message, path="$", at=None):
        super().__init__(f"{code}: {path}: {message}")
        self.issue = dict(code=code, severity="error", message=message, path=path,
                          at=None if at is None else dict(x=at[0], z=at[1]))


def planning_bridge_groups(bridges):
    """同河同向的矩形并集只生成一座桥，其余相交桥禁止进入布局。

    复用渲染器的真实桥面分组，保留所有源桥坐标及道路引用；输出的
    桥格使用这些互不重叠的并集，不通过移动桥或填平水面解决冲突。
    """
    from bridge_assembly import bridge_groups
    groups = bridge_groups(bridges)
    occupied = set()
    for members, cells in groups:
        overlap = occupied & cells
        if overlap:
            names = ", ".join(b.get("id", "<bridge>") for b in members)
            raise GenerationError("TOWN_BRIDGE_OVERLAP",
                                  f"桥 {names} 与其他桥重叠，且不能合并为同河同向矩形", "bridges",
                                  min(overlap, key=lambda p: (p[1], p[0])))
        occupied |= cells
    return groups


def bridge_footprint_cells(masks):
    """整座桥的落地占格，含两岸桥头；bridge_cells 仅保留水上通行语义。"""
    return set().union(*masks["bridge_rectangles"].values())


def component(cells, root):
    if root not in cells:
        return set()
    seen = {root}
    queue = deque([root])
    while queue:
        x, z = queue.popleft()
        for dx, dz in DIRECTIONS:
            p = (x + dx, z + dz)
            if p in cells and p not in seen:
                seen.add(p)
                queue.append(p)
    return seen


def components(cells):
    remaining = set(cells)
    result = []
    while remaining:
        found = component(remaining, min(remaining, key=lambda p: (p[1], p[0])))
        result.append(found)
        remaining -= found
    return result


def width_two_edge(a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    right = (dz, -dx)
    return {a, b, (a[0] + right[0], a[1] + right[1]),
            (b[0] + right[0], b[1] + right[1])}


@lru_cache(maxsize=1)
def target_distances(targets, width, height):
    """同一路网的失败候选共用启发式；不含占地状态，不缓存可达结论。"""
    distance = {p: 0 for p in targets}
    queue = deque(sorted(targets, key=lambda p: (p[1], p[0])))
    while queue:
        x, z = queue.popleft()
        for dx, dz in DIRECTIONS:
            p = x + dx, z + dz
            if 0 <= p[0] < width and 0 <= p[1] < height and p not in distance:
                distance[p] = distance[x, z] + 1
                queue.append(p)
    return distance


def connect_path(starts, targets, allowed, roads, winners, zones, priority,
                 width, height):
    """§6.4 多源 A*；每个状态保留来向、源坐标及首到父链。"""
    starts = {p for p in starts if p in allowed and (p in targets or any(
        width_two_edge(p, (p[0] + dx, p[1] + dz)) <= allowed for dx, dz in DIRECTIONS))}
    if not starts or not targets:
        return None
    distance = target_distances(frozenset(targets), width, height)
    heap, best, parent = [], {}, {}
    for x, z in sorted(starts, key=lambda p: (p[1], p[0])):
        state = x, z, 4
        h = distance[x, z]
        best[state] = (0, z, x)
        parent[state] = None
        heapq.heappush(heap, (h, h, z, x, z, x, 4, 0))
    while heap:
        _, _, sz, sx, z, x, direction, g = heapq.heappop(heap)
        state = x, z, direction
        if best.get(state) != (g, sz, sx):
            continue
        if (x, z) in targets:
            path = []
            while state is not None:
                path.append(state[:2])
                state = parent[state]
            return path[::-1]
        for direction, (dx, dz) in enumerate(DIRECTIONS):
            p = x + dx, z + dz
            if p not in allowed or not width_two_edge((x, z), p) <= allowed:
                continue
            zone = zones.get(winners.get(p), {})
            cost = (1 if p in roads else 20 if zone.get("kind") == "garden"
                    else 8 if zone and zone["priority"] < priority else 4)
            ng, next_state = g + cost, (*p, direction)
            record = ng, sz, sx
            if record >= best.get(next_state, (float("inf"), 0, 0)):
                continue
            best[next_state], parent[next_state] = record, state
            h = distance[p]
            heapq.heappush(heap, (ng + h, h, sz, sx, p[1], p[0], direction, ng))
    return None


def road_union(roads):
    return set().union(*roads.values()) if roads else set()


def add_connector(roads, connectors, path, reason, zone_ref=None):
    ident = f"gc_{len(connectors) + 1:04d}"
    points = [dict(x=x, z=z) for x, z in path]
    expanded = polyline_cells(points, 2) if len(path) > 1 else set(path)
    roads[ident] = expanded
    connectors.append(dict(id=ident, zone_ref=zone_ref, **{"from": points[0]},
                           to=points[-1], cells=points, width_cells=2,
                           surface="dirt_road", reason=reason))
    return expanded


def prepare_roads(spec, masks, winners, fixed_blocked):
    roads = {key: set(value) for key, value in masks["roads"].items()}
    connectors = []
    zones = {z["id"]: z for z in spec["zones"]}
    main = road_union({s["id"]: roads[s["id"]] for s in spec["streets"]
                       if s["class"] == "main_axis"})
    primary = next((g for g in spec["gates"] if g["primary"]), None)
    root = ((primary["at"]["x"], primary["at"]["z"]) if primary else
            min(main, key=lambda p: (p[1], p[0])) if main else None)
    if root is None:
        raise GenerationError("TOWN_ROAD_PRIMARY_DISCONNECTED", "无墙营地仍须有主轴作为道路根", "streets")
    if root not in main:
        raise GenerationError("TOWN_ROAD_PRIMARY_DISCONNECTED", "主门未接主轴", "streets", root)
    all_roads = road_union(roads)
    if all_roads & (masks["water"] - masks["bridges"]):
        bad = min(all_roads & (masks["water"] - masks["bridges"]))
        raise GenerationError("TOWN_ROAD_WATER_UNBRIDGED", "路水交叉无声明桥", "bridges", bad)
    palace = {p for p, zid in winners.items() if zones[zid]["kind"] == "palace"}
    allowed = masks["walkable"] - fixed_blocked - palace | all_roads
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    order = {s["id"]: ({"main_axis": 0, "secondary": 1, "alley": 2}[s["class"]],
                       -s["priority"], s["id"]) for s in spec["streets"]}
    while True:
        main_component = component(all_roads, root)
        others = components(all_roads - main_component)
        if not others:
            break
        def component_key(cells):
            streets = [order[s] for s in order if cells & roads[s]]
            return min(streets), min((z, x) for x, z in cells)
        orphan = min(others, key=component_key)
        starts = {p for p in orphan if any((p[0]+dx, p[1]+dz) not in orphan
                                          for dx, dz in DIRECTIONS)}
        priority = max((zones[winners[p]]["priority"] for p in orphan if p in winners), default=0)
        path = connect_path(starts, main_component, allowed, all_roads, winners,
                            zones, priority, width, height)
        if path is None:
            raise GenerationError("TOWN_ROAD_COMPONENT_DISCONNECTED",
                                  f"孤路{len(orphan)}格，主分量{len(main_component)}格；全宽受硬障阻挡", "roads")
        all_roads |= add_connector(roads, connectors, path, "road_component_disconnected")
        allowed |= all_roads
    for zid, zone in sorted(zones.items(), key=lambda pair: (-pair[1]["priority"], pair[0])):
        cells = {p for p, owner in winners.items() if owner == zid}
        if any(p in all_roads or any((p[0]+dx, p[1]+dz) in all_roads
                                     for dx, dz in DIRECTIONS) for p in cells):
            continue
        candidates = cells & allowed
        if not candidates:
            raise GenerationError("TOWN_ZONE_UNREACHABLE", "分区无可走起点", f"zones.{zid}")
        sx, sz, n = sum(x for x, _ in cells), sum(z for _, z in cells), len(cells)
        start = min(candidates, key=lambda p: ((p[0]*n-sx)**2+(p[1]*n-sz)**2, p[1], p[0]))
        target = min(((order.get(rid, (2, 0, rid))[0], abs(start[0]-x)+abs(start[1]-z), rid, z, x)
                      for rid, rcells in roads.items() for x, z in rcells))
        goal = {(target[-1], target[-2])}
        near = {p for p in allowed if abs(p[0]-start[0])+abs(p[1]-start[1]) <= 16}
        path = connect_path({start}, goal, near, all_roads, winners, zones, zone["priority"], width, height)
        if path is None:
            path = connect_path({start}, goal, allowed, all_roads, winners, zones, zone["priority"], width, height)
        if path is None:
            raise GenerationError("TOWN_ZONE_UNREACHABLE", "全宽接驳无解", f"zones.{zid}", start)
        all_roads |= add_connector(roads, connectors, path, "zone_unconnected", zid)
    targets = [z for z in zones.values() if z["kind"] in {"palace", "princely", "commercial", "market"}]
    priority = max((z["priority"] for z in targets), default=-1)
    reachable = False
    for zone in targets:
        if zone["priority"] != priority:
            continue
        cells = {p for p, zid in winners.items() if zid == zone["id"]}
        boundary = {p for p in cells if any((p[0]+dx,p[1]+dz) not in cells for dx,dz in DIRECTIONS)}
        reachable |= any(p in all_roads or any((p[0]+dx,p[1]+dz) in all_roads
                                               for dx,dz in DIRECTIONS) for p in boundary)
    if not reachable:
        raise GenerationError("TOWN_ROAD_PRIMARY_DISCONNECTED", "最高优先级目标区未接路", "zones")
    return roads, connectors

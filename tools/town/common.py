"""城镇 v1 共用契约：严格 YAML、稳定随机数、米制几何与运行时六角。"""

from __future__ import annotations

import hashlib
import heapq
import math
import re
import subprocess
from collections import deque
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable

import yaml

ROOT = Path(__file__).resolve().parents[2]
Cell = tuple[int, int]
N4 = ((0, 1), (1, 0), (0, -1), (-1, 0))
N6 = ((1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1), (1, -1))
MASK64 = (1 << 64) - 1


class TownError(ValueError):
    """可直接呈现给命令行用户的契约错误。"""


class _StrictLoader(getattr(yaml, "CSafeLoader", yaml.SafeLoader)):
    pass


def _mapping(loader, node):
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=True)
        if not isinstance(key, str) or key in result:
            raise TownError(f"YAML 第 {key_node.start_mark.line + 1} 行：非字符串或重复键 {key!r}")
        result[key] = loader.construct_object(value_node, deep=True)
    return result


_StrictLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _mapping)


def _json_values(value, stack=None):
    stack = set() if stack is None else stack
    if value is None or type(value) in (str, bool, int):
        return
    if type(value) is float and math.isfinite(value):
        return
    if type(value) not in (dict, list) or id(value) in stack:
        raise TownError("YAML 含非 JSON 值、日期、非有限数或循环引用")
    stack.add(id(value))
    for child in value.values() if isinstance(value, dict) else value:
        _json_values(child, stack)
    stack.remove(id(value))


def load_yaml(path: str | Path) -> dict:
    try:
        data = yaml.load(Path(path).read_text(encoding="utf-8"), Loader=_StrictLoader)
        _json_values(data)
    except (OSError, UnicodeError, yaml.YAMLError, RecursionError) as exc:
        raise TownError(f"{path}：无法读取 YAML：{exc}") from exc
    if not isinstance(data, dict):
        raise TownError(f"{path}：顶层必须为对象")
    return data


def canonical_bytes(data: dict) -> bytes:
    """集合及建筑的领域排序由调用方完成；映射按键排序，浮点最多四位。"""
    def normalize(value):
        if isinstance(value, float):
            return round(value, 4)
        if isinstance(value, dict):
            return {key: normalize(item) for key, item in sorted(value.items())}
        if isinstance(value, (list, tuple)):
            return [normalize(item) for item in value]
        return value
    return yaml.dump(normalize(data), Dumper=getattr(yaml, "CSafeDumper", yaml.SafeDumper),
                     allow_unicode=True, sort_keys=True, width=100,
                     default_flow_style=False).encode("utf-8")


def dump_yaml(data: dict, path: str | Path) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(canonical_bytes(data))


def canonical_hash(data: dict) -> str:
    return hashlib.sha256(canonical_bytes(data)).hexdigest()


def fnv1a64(data: bytes) -> int:
    value = 14695981039346656037
    for byte in data:
        value = ((value ^ byte) * 1099511628211) & MASK64
    return value


class PCG32:
    def __init__(self, initstate: int, initseq: int):
        self.state = 0
        self.inc = ((initseq << 1) | 1) & MASK64
        self.next()
        self.state = (self.state + initstate) & MASK64
        self.next()

    def next(self) -> int:
        old = self.state
        self.state = (old * 6364136223846793005 + self.inc) & MASK64
        shifted = (((old >> 18) ^ old) >> 27) & 0xffffffff
        rot = old >> 59
        return ((shifted >> rot) | (shifted << ((-rot) & 31))) & 0xffffffff

    def uniform(self, n: int) -> int:
        if type(n) is not int or not 1 <= n <= 1 << 32:
            raise TownError("PCG32 uniform(n)：要求 1 <= n <= 2^32")
        limit = (1 << 32) - ((1 << 32) % n)
        while True:
            value = self.next()
            if value < limit:
                return value % n


def root_seed(spec: dict) -> int:
    label = f"town.v1\0{spec['city_id']}/{spec['chapter_id']}"
    return (spec["seed"] ^ fnv1a64(label.encode("utf-8"))) & MASK64


def substream(root: int, stage: str, zone_id=None, type_id=None) -> PCG32:
    label = f"{stage}\0{zone_id or '-'}\0{type_id or '-'}"
    state = fnv1a64(root.to_bytes(8, "little") + label.encode("utf-8"))
    sequence = fnv1a64(("town.stream.v1/" + label).encode("utf-8"))
    return PCG32(state, sequence)


def point(value) -> tuple:
    return (value["x"], value["z"]) if isinstance(value, dict) else tuple(value)


def cells_from_json(values: Iterable[dict]) -> set[Cell]:
    return {point(value) for value in values}


def cells_to_json(cells: Iterable[Cell]) -> list[dict]:
    return [{"x": x, "z": z} for x, z in sorted(set(cells), key=lambda p: (p[1], p[0]))]


def hexes_from_json(values: Iterable[dict]) -> set[Cell]:
    return {(value["q"], value["r"]) for value in values}


def hexes_to_json(cells: Iterable[Cell]) -> list[dict]:
    return [{"q": q, "r": r} for q, r in sorted(set(cells), key=lambda p: (p[1], p[0]))]


def rectangle(origin, size) -> set[Cell]:
    x, z = point(origin)
    w, h = (size["w"], size["h"]) if isinstance(size, dict) else size
    return {(i, j) for j in range(z, z + h) for i in range(x, x + w)}


def snap_floor(value: float) -> int:
    nearest = round(value)
    return nearest if abs(value - nearest) <= 1e-9 else math.floor(value)


def _touch_cells(x, z) -> set[Cell]:
    xs = [snap_floor(x)]
    zs = [snap_floor(z)]
    if abs(x - round(x)) <= 1e-9:
        xs.append(round(x) - 1)
    if abs(z - round(z)) <= 1e-9:
        zs.append(round(z) - 1)
    return {(i, j) for i in xs for j in zs}


def supercover(a, b) -> set[Cell]:
    """闭线段触及的所有闭格；角点同时收四格，墙顶点不偏移。"""
    ax, az = point(a)
    bx, bz = point(b)
    ts = {0.0, 1.0}
    for start, end in ((ax, bx), (az, bz)):
        if start != end:
            for edge in range(math.ceil(min(start, end)), math.floor(max(start, end)) + 1):
                t = (edge - start) / (end - start)
                if 0 <= t <= 1:
                    ts.add(t)
    ordered = sorted(ts)
    probes = ordered + [(a + b) / 2 for a, b in zip(ordered, ordered[1:])]
    cells = set()
    for t in probes:
        cells.update(_touch_cells(ax + (bx - ax) * t, az + (bz - az) * t))
    return cells


def expand(cells: Iterable[Cell], radius: int) -> set[Cell]:
    return {(x + dx, z + dz) for x, z in cells
            for dz in range(-radius, radius + 1) for dx in range(-radius, radius + 1)}


def polyline_cells(points, width=1, vertices=False, closed=False) -> set[Cell]:
    points = [point(p) for p in points]
    if not points:
        return set()
    if closed:
        points = points + points[:1]
    if len(points) == 1:
        points = points * 2
    result = set()
    shift = 0 if vertices else 0.5
    for a, b in zip(points, points[1:]):
        mask = supercover((a[0] + shift, a[1] + shift), (b[0] + shift, b[1] + shift))
        mask = expand(mask, (width - 1) // 2)
        if width % 2 == 0:
            dx, dz = b[0] - a[0], b[1] - a[1]
            right = ((1 if dz >= 0 else -1), 0) if abs(dz) >= abs(dx) else (0, -1 if dx >= 0 else 1)
            mask |= {(x + right[0], z + right[1]) for x, z in mask}
        result |= mask
    return result


def segment_distance(p, a, b) -> float:
    px, pz = point(p)
    ax, az = point(a)
    bx, bz = point(b)
    dx, dz = bx - ax, bz - az
    denominator = dx * dx + dz * dz
    t = max(0, min(1, ((px - ax) * dx + (pz - az) * dz) / denominator)) if denominator else 0
    return math.hypot(px - ax - t * dx, pz - az - t * dz)


def in_polygon(p, points) -> bool:
    x, z = point(p)
    vertices = [point(v) for v in points]
    inside = False
    for a, b in zip(vertices, vertices[1:] + vertices[:1]):
        if segment_distance((x, z), a, b) <= 1e-9:
            return True
        if (a[1] > z) != (b[1] > z):
            cut = a[0] + (z - a[1]) * (b[0] - a[0]) / (b[1] - a[1])
            if x < cut:
                inside = not inside
    return inside


def polygon_cells(points, width: int, height: int) -> set[Cell]:
    return {(x, z) for z in range(height) for x in range(width)
            if in_polygon((x + 0.5, z + 0.5), points)}


def wall_margin_cells(points, width: int, height: int, margin: int) -> set[Cell]:
    vertices = [point(v) for v in points]
    edges = list(zip(vertices, vertices[1:] + vertices[:1]))
    legal_vertices = {(x, z) for z in range(height + 1) for x in range(width + 1)
                      if in_polygon((x, z), vertices)
                      and all(segment_distance((x, z), a, b) + 1e-9 >= margin for a, b in edges)}
    return {(x, z) for z in range(height) for x in range(width)
            if {(x, z), (x + 1, z), (x, z + 1), (x + 1, z + 1)} <= legal_vertices}


def rotate_offset(offset, rotation: int) -> tuple:
    x, z = offset
    return {0: (x, z), 90: (z, -x), 180: (-x, -z), 270: (-z, x)}[rotation]


def gate_cells(gate: dict, passage=False) -> set[Cell]:
    x, z = point(gate["at"])
    size = gate["passage_cells" if passage else "footprint_cells"]
    w, h = size["w"], size["h"]
    offsets = ((dx, dz) for dz in range(-((h - 1) // 2), h - (h - 1) // 2)
               for dx in range(-((w - 1) // 2), w - (w - 1) // 2))
    return {(x + dx, z + dz) for dx, dz in
            (rotate_offset(p, gate["rotation_deg"]) for p in offsets)}


def wall_specs(spec: dict) -> list[dict]:
    """Normalize the legacy single wall and the declarative multi-wall form."""
    if "walls" in spec:
        if spec["walls"] == "none":
            return []
        return list(spec["walls"])
    wall = spec.get("wall")
    return [] if wall is None else [dict(wall, id="outer", role="outer")]


def wall_spec(spec: dict, wall_ref: str | None) -> dict | None:
    walls = wall_specs(spec)
    if not walls:
        return None
    ref = wall_ref or ("outer" if "wall" in spec else walls[0]["id"])
    return next((wall for wall in walls if wall["id"] == ref), None)


def bridge_rectangle(bridge: dict) -> set[Cell]:
    x, z = point(bridge["at"])
    w, h = bridge["width_cells"], bridge["length_cells"]
    if bridge["rotation_deg"] in (90, 270):
        w, h = h, w
    return rectangle((x - w // 2, z - h // 2), (w, h))


def zone_winners(spec: dict) -> dict[str, set[Cell]]:
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    taken, result = set(), {}
    bounds = rectangle((0, 0), (width, height))
    for zone in sorted(spec["zones"], key=lambda z: (-z["priority"], z["id"])):
        geometry = zone["geometry"]
        if "rect" in geometry:
            rect = geometry["rect"]
            x, z = point(rect["min"])
            max_x, max_z = point(rect["max"])
            cells = rectangle((x, z), (max_x - x, max_z - z)) & bounds
        else:
            cells = polygon_cells(geometry["polygon"]["points"], width, height)
        result[zone["id"]] = cells - taken
        taken |= cells
    return result


def geometry_masks(spec: dict) -> dict:
    """空城掩膜；roads 保留无桥水冲突，让验证器报错而非裁掉。"""
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    bounds = rectangle((0, 0), (width, height))
    definitions = wall_specs(spec)
    walls = {row["id"]: polyline_cells(row["polygon"]["points"], vertices=True,
                                       closed=True) & bounds for row in definitions}
    wall_interiors = {row["id"]: polygon_cells(row["polygon"]["points"], width, height)
                      for row in definitions}
    wall_raw = set().union(*walls.values())
    enclosing = [row for row in definitions if row.get("role") in {"outer", "inner"}]
    # A lone division wall is a ruin/partition, not a city boundary.  Once an
    # enclosing wall exists, however, division polygons may describe a joined
    # city compartment (for example ch10 Taiyuan) and retain their old area.
    interior = (set().union(*wall_interiors.values()) if enclosing else set(bounds))
    normal_gates = spec.get("gates", [])
    water_gates = spec.get("water_gates", [])
    gate_passages = set().union(*(gate_cells(gate, True) for gate in normal_gates)) & bounds
    water_passages = set().union(*(gate_cells(gate, True) for gate in water_gates)) & bounds
    water_passages_by_wall = {row["id"]: set() for row in definitions}
    for gate in water_gates:
        if gate["wall_ref"] in water_passages_by_wall:
            water_passages_by_wall[gate["wall_ref"]] |= gate_cells(gate, True) & bounds
    passages = gate_passages | water_passages
    normal_footprints = set().union(*(gate_cells(gate) for gate in normal_gates)) & bounds
    water_footprints = set().union(*(gate_cells(gate) for gate in water_gates)) & bounds
    gates = normal_footprints | water_footprints
    # Ordinary gates retain the v1 shared-partition behaviour.  A water gate is
    # narrower: its declaration opens only wall_ref, so a coincident second
    # circuit still blocks and is reported as undeclared.
    wall = (set().union(*(cells - water_passages_by_wall[row["id"]]
                          for row, cells in ((row, walls[row["id"]])
                                             for row in definitions)))
            - gate_passages)
    river_cells = {r["id"]: polyline_cells(r["points"], r["width_cells"]) & bounds
                   for r in spec.get("rivers", [])}
    lake_cells = {lake["id"]: polygon_cells(lake["polygon"]["points"], width, height)
                  for lake in spec.get("lakes", [])}
    water_bodies = {**river_cells, **lake_cells}
    water = set().union(*water_bodies.values())
    hard = (wall | (normal_footprints - gate_passages)
            | ((water_footprints - water_passages) - water))
    domain = (interior | passages) - hard
    navigable_water = set().union(*(water_bodies[body["id"]]
        for body in [*spec.get("rivers", []), *spec.get("lakes", [])]
        if body.get("navigable", False)))
    rectangles = {b["id"]: bridge_rectangle(b) & bounds for b in spec.get("bridges", [])}
    bridges = set().union(*rectangles.values()) & water
    raw_roads = {s["id"]: polyline_cells(s["points"], s["width_cells"])
                 for s in spec["streets"]}
    roads = {name: cells & domain for name, cells in raw_roads.items()}
    margins = {row["id"]: wall_margin_cells(row["polygon"]["points"], width, height,
                                            row["inside_margin_cells"])
               for row in definitions}
    margin = set().union(*margins.values()) if enclosing else set(bounds)
    return dict(bounds=bounds, interior=interior, wall=wall, wall_raw=wall_raw,
                walls=walls, wall_interiors=wall_interiors, wall_margins=margins,
                passages=passages, gate_passages=gate_passages,
                water_passages=water_passages,
                water_passages_by_wall=water_passages_by_wall,
                gate_footprints=gates, hard=hard, water=water, bridges=bridges,
                river_cells=river_cells, lake_cells=lake_cells, water_bodies=water_bodies,
                navigable_water=navigable_water,
                bridge_rectangles=rectangles, raw_roads=raw_roads, roads=roads,
                walkable=domain - (water - bridges), margin=margin)


def building_size(w0: int, h0: int, rotation: int) -> tuple[int, int]:
    return (h0, w0) if rotation in (90, 270) else (w0, h0)


def rotate_local(point_, w0: int, h0: int, rotation: int) -> tuple:
    u, v = point_
    return {0: (u, v), 90: (v, w0 - u), 180: (w0 - u, h0 - v),
            270: (h0 - v, u)}[rotation]


def building_entrance(origin, w0: int, h0: int, rotation: int, edge: str) -> tuple[Cell, Cell]:
    local = {"N": ((w0 - 1) // 2, h0), "E": (w0, (h0 - 1) // 2),
             "S": ((w0 - 1) // 2, -1), "W": (-1, (h0 - 1) // 2)}[edge]
    u, v = rotate_local((local[0] + 0.5, local[1] + 0.5), w0, h0, rotation)
    x, z = point(origin)
    normal = rotate_offset(dict(zip("NESW", N4))[edge], rotation)
    return (math.floor(x + u), math.floor(z + v)), normal


@lru_cache(maxsize=1)
def catalog() -> dict[str, dict]:
    """读取主定义 §3 的表格，不在工具内另维护建筑尺寸。"""
    source = ROOT / "docs/design/22-town-layout-and-generation.md"
    result = {}
    for line in source.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| `bld_"):
            continue
        columns = [c.strip() for c in line.strip("|").split("|")]
        type_id = columns[0].strip("`")
        dimension = next((i for i, c in enumerate(columns) if re.fullmatch(r"\d+×\d+", c)), None)
        if dimension is None:
            continue
        w, h = map(int, columns[dimension].split("×"))
        rotations = columns[dimension + 1]
        rotations = [0, 90, 180, 270] if rotations == "四向" else [0] if rotations == "不旋转" else list(map(int, rotations.split("/")))
        if dimension == 2:
            edges, quota = columns[5], columns[6]
        else:
            edges, quota = columns[5].split(" / ")[-1], columns[6]
        numbers = list(map(int, re.findall(r"\d+", quota)))
        result[type_id] = dict(w=w, h=h, rotations=rotations,
                               entrance_edges=[e for e in "NESW" if e in edges.split("/")],
                               min_per_zone=numbers[0], max_per_zone=numbers[-1])
    if not result:
        raise TownError(f"{source}：未能读到建筑目录")
    # Era packages are intentionally sparse checkouts.  Their manifests are
    # the source of truth for the newer kit IDs, while the design/22 table
    # remains authoritative for every legacy ID above.
    from assets import _entries, _read_bytes
    tracked = subprocess.run(
        ["git", "ls-files", "assets/default/building-map/*/manifest.yaml"],
        cwd=ROOT, check=False, capture_output=True, text=True,
    )
    for relative in sorted(tracked.stdout.splitlines() if tracked.returncode == 0 else []):
        path = ROOT / relative
        try:
            rows = _entries(yaml.safe_load(_read_bytes(path)))
        except (OSError, ValueError, TypeError, yaml.YAMLError):
            continue
        for row in rows:
            if not isinstance(row, dict):
                continue
            type_id = row.get("id", row.get("asset_id"))
            if not isinstance(type_id, str) or type_id in result or not type_id.startswith("bld_kit_"):
                continue
            try:
                shape = row.get("building", {})
                size = shape.get("footprint", row.get("footprint_m"))
                if not isinstance(size, (list, tuple)) or len(size) != 2:
                    raise ValueError("missing footprint")
                w, h = size
            except (KeyError, TypeError, ValueError):
                continue
            entrance = row.get("entrance", {})
            edge = entrance.get("edge", "S") if isinstance(entrance, dict) else "S"
            suffix = type_id.rsplit("_", 1)[-1]
            maximum = 32 if suffix in {"house", "small", "large", "stall", "market"} else 8
            result[type_id] = dict(w=w, h=h, rotations=[0],
                                   entrance_edges=[edge] if edge in "NESW" else ["S"],
                                   min_per_zone=0, max_per_zone=maximum)
    return result


def neighbors4(cell: Cell):
    x, z = cell
    return [(x + dx, z + dz) for dx, dz in N4]


def connected(cells: set[Cell], root: Cell, hexagonal=False) -> set[Cell]:
    if root not in cells:
        return set()
    visited = {root}
    queue = deque([root])
    offsets = N6 if hexagonal else N4
    while queue:
        x, z = queue.popleft()
        for dx, dz in offsets:
            cell = x + dx, z + dz
            if cell in cells and cell not in visited:
                visited.add(cell)
                queue.append(cell)
    return visited


def components(cells: set[Cell], hexagonal=False) -> list[set[Cell]]:
    remaining, result = set(cells), []
    while remaining:
        root = min(remaining, key=lambda p: (p[1], p[0]))
        component = connected(remaining, root, hexagonal)
        result.append(component)
        remaining -= component
    return result


def entrance_path(entrance: Cell, walkable: set[Cell], roads: dict[str, set[Cell]],
                  max_steps=6) -> list[Cell] | None:
    """按步数、道路键、终点 z/x、完整路径 z/x 比较，返回含两端的链。"""
    if entrance not in walkable:
        return None
    road_at = {}
    for road_id in sorted(roads):
        for cell in roads[road_id]:
            road_at.setdefault(cell, road_id)
    start_key = ((entrance[1], entrance[0]),)
    queue = [(0, start_key, entrance)]
    best = {entrance: (0, start_key)}
    found = []
    limit = max_steps
    while queue:
        distance, path, cell = heapq.heappop(queue)
        if distance > limit:
            break
        if best.get(cell) != (distance, path):
            continue
        if cell in road_at:
            found.append((distance, road_at[cell], cell[1], cell[0], path))
            limit = distance
            continue
        for other in neighbors4(cell):
            if other not in walkable or distance == limit:
                continue
            candidate = (distance + 1, path + ((other[1], other[0]),))
            if other not in best or candidate < best[other]:
                best[other] = candidate
                heapq.heappush(queue, (*candidate, other))
    if not found:
        return None
    return [(x, z) for z, x in min(found)[-1]]


class HexGrid:
    """六角中心与七点规划格映射一次预计算，候选只重算掩膜子集。"""

    def __init__(self, width: int, height: int):
        self.width, self.height = width, height
        self.centers = {}
        self.samples = {}
        self.by_cell = {}
        d = math.sqrt(3) / 3
        offsets = ((0, 0), (d, 1 / 3), (0, 2 / 3), (-d, 1 / 3),
                   (-d, -1 / 3), (0, -2 / 3), (d, -1 / 3))
        for r in range(1, height + 1):
            for q in range(math.ceil(-r / 2), math.ceil(math.sqrt(3) * width / 2 - r / 2)):
                wx, wz = 2 * d * (q + r / 2), r
                cell = snap_floor(wx), snap_floor(height - wz)
                if not 0 <= cell[0] < width or not 0 <= cell[1] < height:
                    continue
                slot = q, r
                self.centers[slot] = wx, height - wz
                self.samples[slot] = frozenset((snap_floor(wx + dx), snap_floor(height - wz - dz))
                                               for dx, dz in offsets)
                self.by_cell.setdefault(cell, []).append(slot)
        self.slots = set(self.centers)
        self.cell_hexes = {}
        for slot, samples in self.samples.items():
            for cell in samples:
                self.cell_hexes.setdefault(cell, set()).add(slot)
        self.neighbors = {slot: tuple(sorted(
            ((slot[0] + dq, slot[1] + dr) for dq, dr in N6
             if (slot[0] + dq, slot[1] + dr) in self.slots), key=lambda p: (p[1], p[0])))
            for slot in self.centers}
        self._slot_list = list(self.centers)
        self._slot_index = {slot: index for index, slot in enumerate(self._slot_list)}
        self._neighbor_indices = [tuple(self._slot_index[p] for p in self.neighbors[slot])
                                  for slot in self._slot_list]
        self._last_planning = None
        self._last_walkable = set()

    def walkable(self, planning_walkable: set[Cell]) -> set[Cell]:
        """占地改变只复查受影响七点；回溯增加格时也正确恢复合法六角。"""
        if self._last_planning is None:
            legal = {slot for slot, samples in self.samples.items() if samples <= planning_walkable}
        else:
            changed = self._last_planning ^ planning_walkable
            affected = set().union(*(self.cell_hexes.get(cell, ()) for cell in changed))
            legal = self._last_walkable.copy()
            for slot in affected:
                if self.samples[slot] <= planning_walkable:
                    legal.add(slot)
                else:
                    legal.discard(slot)
        self._last_planning = set(planning_walkable)
        self._last_walkable = legal
        return legal.copy()

    def connected(self, hex_walkable: set[Cell], root: Cell) -> set[Cell]:
        """预建整数邻表，避免每次试放都创建六个坐标元组。"""
        if root not in hex_walkable:
            return set()
        remaining = bytearray(len(self._slot_list))
        for slot in hex_walkable:
            remaining[self._slot_index[slot]] = 1
        start = self._slot_index[root]
        remaining[start] = 0
        reached = [start]
        cursor = 0
        while cursor < len(reached):
            index = reached[cursor]
            cursor += 1
            for other in self._neighbor_indices[index]:
                if remaining[other]:
                    remaining[other] = 0
                    reached.append(other)
        return {self._slot_list[index] for index in reached}

    def _nearby(self, entrance: Cell, radius: float):
        x, z = entrance[0] + 0.5, entrance[1] + 0.5
        candidates = []
        for j in range(math.floor(z - radius), math.floor(z + radius) + 1):
            for i in range(math.floor(x - radius), math.floor(x + radius) + 1):
                for slot in self.by_cell.get((i, j), []):
                    cx, cz = self.centers[slot]
                    distance = (cx - x) ** 2 + (cz - z) ** 2
                    if distance <= radius * radius + 1e-9:
                        candidates.append((distance, slot[1], slot[0]))
        return [(q, r) for _, r, q in sorted(candidates)]

    def entrance_hex(self, entrance: Cell, component: set[Cell], planning_walkable: set[Cell],
                     radius=1.5) -> Cell | None:
        center = entrance[0] + 0.5, entrance[1] + 0.5
        for slot in self._nearby(entrance, radius):
            if slot in component and supercover(center, self.centers[slot]) <= planning_walkable:
                return slot
        return None

    def gate_hex(self, gate: dict, hex_walkable: set[Cell], interior: set[Cell],
                 road_cells: set[Cell], passages: set[Cell], component=None,
                 wall_points=None) -> Cell | None:
        allowed = hex_walkable if component is None else hex_walkable & component
        for slot in self._nearby(point(gate["at"]), 4):
            center_cell = tuple(map(snap_floor, self.centers[slot]))
            inside = in_polygon(self.centers[slot], wall_points) if wall_points is not None else center_cell in interior
            if slot in allowed and inside and center_cell in road_cells | passages:
                return slot
        return None

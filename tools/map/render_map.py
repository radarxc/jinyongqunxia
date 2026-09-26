#!/usr/bin/env python3
"""Validate and deterministically render the Tianshu jianghu world map.

Python 3.9+, standard library only.  The checked-in ``*.yaml`` files use the
JSON-compatible YAML 1.2 subset, so ``json`` is the dependency-free parser.
If future editors introduce ordinary YAML syntax and PyYAML is installed, it
is used as the fallback.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import os
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "docs" / "design" / "map"
CHAPTERS = tuple(f"ch{i:02d}" for i in range(1, 15))
EXTENT = (73.0, 18.0, 135.0, 54.0)
ID_PREFIX = {
    "cities": "city_", "sects": "sect_", "offmap": "offmap_",
    "posts": "post_", "ports": "port_", "routes": "route_",
    "regions": "rg_", "rivers": "river_", "mountains": "mount_",
}

def load_yaml_subset(path: Path) -> Any:
    text = path.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError as json_error:
        try:
            import yaml  # type: ignore
        except ImportError:
            raise ValueError(
                f"{path}: not JSON-compatible YAML and PyYAML is unavailable: {json_error}"
            ) from json_error
        return yaml.safe_load(text)

def load_all(data_dir: Path = DATA_DIR) -> Dict[str, Any]:
    return {name: load_yaml_subset(data_dir / f"{name}.yaml") for name in ("cities", "sects", "routes", "regions")}

def esc(value: Any) -> str:
    return html.escape(str(value), quote=True)

def fmt(value: float) -> str:
    s = f"{value:.2f}".rstrip("0").rstrip(".")
    return s if s not in ("-0", "") else "0"

def stable_jitter(identifier: str, amplitude: float = 1.0) -> Tuple[float, float]:
    digest = hashlib.sha256(identifier.encode("utf-8")).digest()
    return ((digest[0] / 255.0 - 0.5) * 2 * amplitude, (digest[1] / 255.0 - 0.5) * 2 * amplitude)

@dataclass(frozen=True)
class Albers:
    """Spherical Albers equal-area conic, expressed in normalized radians."""

    phi1: float = math.radians(25.0)
    phi2: float = math.radians(47.0)
    lambda0: float = math.radians(105.0)
    phi0: float = math.radians(35.0)

    @property
    def n(self) -> float:
        return 0.5 * (math.sin(self.phi1) + math.sin(self.phi2))

    @property
    def c(self) -> float:
        return math.cos(self.phi1) ** 2 + 2.0 * self.n * math.sin(self.phi1)

    @property
    def rho0(self) -> float:
        return math.sqrt(self.c - 2.0 * self.n * math.sin(self.phi0)) / self.n

    def raw(self, lon: float, lat: float) -> Tuple[float, float]:
        lam, phi = math.radians(lon), math.radians(lat)
        theta = self.n * (lam - self.lambda0)
        rho = math.sqrt(max(0.0, self.c - 2.0 * self.n * math.sin(phi))) / self.n
        return rho * math.sin(theta), self.rho0 - rho * math.cos(theta)

class CanvasProjection:
    def __init__(self, width: int, height: int, margin: float = 150.0, extent: Sequence[float] = EXTENT):
        self.width, self.height, self.margin = width, height, margin
        self.albers = Albers()
        west, south, east, north = extent
        samples = []
        for i in range(65):
            lon = west + (east - west) * i / 64
            samples.extend((self.albers.raw(lon, south), self.albers.raw(lon, north)))
        for i in range(65):
            lat = south + (north - south) * i / 64
            samples.extend((self.albers.raw(west, lat), self.albers.raw(east, lat)))
        xs, ys = [p[0] for p in samples], [p[1] for p in samples]
        self.minx, self.maxx, self.miny, self.maxy = min(xs), max(xs), min(ys), max(ys)
        sx = (width - 2 * margin) / (self.maxx - self.minx)
        sy = (height - 2 * margin) / (self.maxy - self.miny)
        self.scale = min(sx, sy)
        used_w, used_h = (self.maxx-self.minx)*self.scale, (self.maxy-self.miny)*self.scale
        self.offset_x = (width-used_w)/2 - self.minx*self.scale
        self.offset_y = (height-used_h)/2 + self.maxy*self.scale

    def __call__(self, lon: float, lat: float) -> Tuple[float, float]:
        x, y = self.albers.raw(lon, lat)
        return self.offset_x + x*self.scale, self.offset_y - y*self.scale

def point_in_ring(point: Tuple[float, float], ring: Sequence[Sequence[float]]) -> bool:
    x, y = point; inside = False; j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y):
            cross_x = (xj-xi)*(y-yi)/(yj-yi) + xi
            if x < cross_x: inside = not inside
        j = i
    return inside

def point_on_land(point: Tuple[float, float], regions: Mapping[str, Any]) -> bool:
    if any(point_in_ring(point, ring) for ring in regions["land_polygons"]): return True
    x, y = point
    for lon, lat, radius, _name, _kind in regions.get("island_masks", []):
        if (x-lon)**2 + (y-lat)**2 <= radius**2: return True
    return False

def point_on_raw_land(point: Tuple[float, float], regions: Mapping[str, Any]) -> bool:
    """Return whether a point is in Natural Earth land, ignoring manual masks."""
    return any(point_in_ring(point, ring) for ring in regions.get("land_polygons", []))

def is_finite_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(float(value))

def validate(data: Mapping[str, Any]) -> List[str]:
    issues: List[str] = []
    city_rows = data["cities"].get("cities", [])
    sect_rows = data["sects"].get("sects", [])
    offmap_rows = data["sects"].get("offmap_nodes", [])
    posts = data["routes"].get("posts", [])
    ports = data["routes"].get("ports", [])
    routes = data["routes"].get("routes", [])
    special = data["routes"].get("special_routes", [])
    regions = data["regions"]

    groups = {
        "cities":city_rows, "sects":sect_rows, "offmap":offmap_rows,
        "posts":posts, "ports":ports, "routes":[*routes,*special],
        "regions":regions.get("regions",[]), "rivers":regions.get("rivers",[]),
        "mountains":regions.get("mountains",[]),
    }
    all_ids: Dict[str, str] = {}
    for group, rows in groups.items():
        seen=set(); prefix=ID_PREFIX[group]
        for row in rows:
            rid=row.get("id")
            if not isinstance(rid,str) or not rid.startswith(prefix): issues.append(f"ID-PREFIX {group}: {rid!r} must start with {prefix}")
            if rid in seen: issues.append(f"ID-DUP-IN-GROUP {group}: {rid}")
            seen.add(rid)
            if rid in all_ids: issues.append(f"ID-DUP-GLOBAL {rid}: {all_ids[rid]} and {group}")
            all_ids[rid]=group

    extent=regions.get("extent",EXTENT)
    if not isinstance(extent,list) or len(extent)!=4 or not all(is_finite_number(x) for x in extent):
        issues.append(f"COORD-EXTENT: expected four finite numbers, got {extent!r}")
        west,south,east,north=EXTENT
    else:
        west,south,east,north=map(float,extent)
    def check_xy(row: Mapping[str,Any], label: str, required: bool=True) -> bool:
        lon,lat=row.get("longitude"),row.get("latitude")
        if lon is None or lat is None:
            if required: issues.append(f"COORD-MISSING {label}")
            return False
        if not is_finite_number(lon) or not is_finite_number(lat):
            issues.append(f"COORD-TYPE {label}: ({lon!r}, {lat!r}) must be finite numbers")
            return False
        if not (west <= float(lon) <= east and south <= float(lat) <= north):
            issues.append(f"COORD-RANGE {label}: ({lon}, {lat}) outside extent")
            return False
        return True

    city_ids={r.get("id") for r in city_rows if isinstance(r.get("id"),str)}; sect_ids={r.get("id") for r in sect_rows if isinstance(r.get("id"),str)}; offmap_ids={r.get("id") for r in offmap_rows if isinstance(r.get("id"),str)}
    city_by={r["id"]:r for r in city_rows if isinstance(r.get("id"),str)}
    travel_rows=[*posts,*ports]; travel_ids={r.get("id") for r in travel_rows if isinstance(r.get("id"),str)}; travel_by={r["id"]:r for r in travel_rows if isinstance(r.get("id"),str)}; endpoints=city_ids|travel_ids|offmap_ids
    region_ids={r.get("id") for r in regions.get("regions",[]) if isinstance(r.get("id"),str)}
    region_by={r["id"]:r for r in regions.get("regions",[]) if isinstance(r.get("id"),str)}
    city_statuses=set(data["cities"].get("status_values",[]))
    sect_states=set(data["sects"].get("state_codes",{}))
    confidence_values={
        "known_site", "known_historical_site", "known_mountain",
        "known_mountain_pending_novel", "city_anchor",
        "city_anchor_fictional", "city_anchor_pending_research",
        "city_anchor_original_placement", "regional_anchor",
        "approximate_fictional", "approximate_pending_research",
        "approximate_original_placement",
    }
    expected_bands={m.get("band") for m in data["cities"].get("chapters",{}).values()}
    route_kinds={"imperial_road","post_road","silk_road","caravan_road","steppe_road","mountain_road","river","canal","sea","coastal_mixed"}
    fee_tiers=set(data["routes"].get("fee_tiers",{}))
    source_ids=set(data["cities"].get("sources",{}))|set(data["sects"].get("sources",{}))
    if data["cities"].get("coordinate_decimals") != 2:
        issues.append("CITY-PRECISION: coordinate_decimals must equal 2")
    for city in city_rows:
        cid=city.get("id","?"); coord_ok=check_xy(city,cid)
        if city.get("region") not in region_ids: issues.append(f"CITY-REGION {cid}: unknown {city.get('region')}")
        elif coord_ok:
            bounds=region_by[city["region"]].get("bounds",[])
            if len(bounds)!=4 or not all(is_finite_number(x) for x in bounds): issues.append(f"REGION-BOUNDS {city['region']}: expected four finite numbers")
            elif not (bounds[0]<=city["longitude"]<=bounds[2] and bounds[1]<=city["latitude"]<=bounds[3]): issues.append(f"CITY-REGION-BOUNDS {cid}: point outside {city['region']} bounds")
        if city.get("coordinate_precision") != "0.01 degree; WGS84": issues.append(f"CITY-PRECISION {cid}: expected '0.01 degree; WGS84'")
        if coord_ok and any(round(float(city[key]),2) != float(city[key]) for key in ("longitude","latitude")): issues.append(f"CITY-PRECISION {cid}: coordinates must use at most two decimal places")
        if city.get("importance")=="site" and city.get("location_confidence") not in confidence_values: issues.append(f"CITY-CONFIDENCE {cid}: site requires a recognized location_confidence")
        history=city.get("history",{})
        if not isinstance(history,Mapping) or set(history)!=expected_bands: issues.append(f"CITY-HISTORY {cid}: must have exactly the six historical bands")
        else:
            for band,state in history.items():
                if not isinstance(state,Mapping) or not isinstance(state.get("name"),str) or not state.get("name") or state.get("status") not in city_statuses:
                    issues.append(f"CITY-HISTORY {cid}/{band}: requires a name and valid status")
        eras=city.get("eras",{})
        if not isinstance(eras,Mapping):
            issues.append(f"CITY-ERA {cid}: eras must be an object"); eras={}
        if set(eras)!=set(CHAPTERS): issues.append(f"CITY-ERA {cid}: must have exactly ch01..ch14")
        for ch in CHAPTERS:
            era=eras.get(ch)
            if not isinstance(era,Mapping): issues.append(f"CITY-ERA {cid}: missing or invalid {ch} object"); continue
            if not isinstance(era.get("name"),str) or not era.get("name"): issues.append(f"CITY-ERA {cid}: missing {ch} name")
            if era.get("status") not in city_statuses: issues.append(f"CITY-STATUS {cid}/{ch}: invalid status")
            if not isinstance(era.get("open"),bool): issues.append(f"CITY-OPEN-TYPE {cid}/{ch}: open must be boolean")
        declared=city.get("chapters",[])
        if not isinstance(declared,list): issues.append(f"CITY-CHAPTERS {cid}: chapters must be a list"); declared=[]
        if len(declared)!=len(set(declared)): issues.append(f"CITY-CHAPTER-DUP {cid}: duplicate chapter")
        if set(declared)-set(CHAPTERS): issues.append(f"CITY-CHAPTER {cid}: unknown chapters {sorted(set(declared)-set(CHAPTERS))}")
        opened=[ch for ch in CHAPTERS if isinstance(eras.get(ch),Mapping) and eras[ch].get("open") is True]
        if declared!=opened: issues.append(f"CITY-CHAPTER-OPEN {cid}: chapters {declared} != open eras {opened}")
        for move in city.get("seat_moves",[]):
            move_ok=check_xy(move,f"{cid}/seat_move")
            unknown_bands=set(move.get("eras",[]))-{m.get("band") for m in data["cities"].get("chapters",{}).values()}
            if unknown_bands: issues.append(f"CITY-SEAT-ERA {cid}: unknown bands {sorted(unknown_bands)}")
            if move_ok and not point_on_land((move["longitude"],move["latitude"]),regions): issues.append(f"CITY-SEAT-LAND {cid}: seat move is not on land/island mask")
        if coord_ok and not point_on_land((city["longitude"],city["latitude"]),regions): issues.append(f"CITY-LAND {cid}: point is not inside land polygon/island mask")
        if coord_ok and "island_pier" in city.get("businesses",[]):
            matching=[m for m in regions.get("island_masks",[]) if len(m)>=5 and m[4] in ("small_island","fictional_anchor") and (city["longitude"]-m[0])**2+(city["latitude"]-m[1])**2<=m[2]**2]
            if not matching: issues.append(f"CITY-ISLAND-MASK {cid}: island_pier requires a matching island mask")
        for sid in city.get("sects",[]):
            if sid not in sect_ids: issues.append(f"CITY-SECT {cid}: unknown {sid}")
        for source in city.get("sources",[]):
            if source not in source_ids: issues.append(f"CITY-SOURCE {cid}: unknown {source}")
    for sect in sect_rows:
        sid=sect.get("id","?"); coord_ok=check_xy(sect,sid)
        if coord_ok and not point_on_land((sect["longitude"],sect["latitude"]),regions): issues.append(f"SECT-LAND {sid}: point is not inside land polygon/island mask")
        if sect.get("city_id") and sect["city_id"] not in city_ids: issues.append(f"SECT-CITY {sid}: unknown {sect['city_id']}")
        if sect.get("coordinate_precision") not in confidence_values: issues.append(f"SECT-PRECISION {sid}: unrecognized coordinate_precision")
        av=sect.get("availability",{})
        if not isinstance(av,Mapping) or set(av)!=set(CHAPTERS): issues.append(f"SECT-ERA {sid}: must have exactly ch01..ch14")
        elif any(value not in sect_states for value in av.values()): issues.append(f"SECT-STATE {sid}: invalid availability value")
        if not coord_ok and not sect.get("offmap_id"): issues.append(f"SECT-SITE {sid}: coordinate or offmap marker required")
        for branch in sect.get("branches",[]):
            bid=branch.get("id","?")
            branch_chapters=branch.get("open_chapters",[])
            if not isinstance(branch_chapters,list) or len(branch_chapters)!=len(set(branch_chapters)) or set(branch_chapters)-set(CHAPTERS): issues.append(f"BRANCH-ERA {sid}/{bid}: open_chapters must be unique valid chapters")
            elif isinstance(av,Mapping):
                hidden=[ch for ch in branch_chapters if av.get(ch) not in ("O","H")]
                if hidden: issues.append(f"BRANCH-PARENT-ERA {sid}/{bid}: parent unavailable in {hidden}")
            if branch.get("offmap_id"):
                if branch["offmap_id"] not in offmap_ids: issues.append(f"BRANCH-OFFMAP {sid}/{bid}: unknown {branch['offmap_id']}")
                if bid != branch["offmap_id"]: issues.append(f"BRANCH-OFFMAP-ID {sid}/{bid}: reference branch id must equal offmap_id")
            else:
                if bid in all_ids: issues.append(f"ID-DUP-GLOBAL {bid}: branch and {all_ids[bid]}")
                all_ids[bid]="branches"
                if not isinstance(bid,str) or not bid.startswith("site_"): issues.append(f"BRANCH-ID {sid}: {bid!r} must start with site_")
                if branch.get("city_id") not in city_ids: issues.append(f"BRANCH-CITY {sid}/{bid}: unknown {branch.get('city_id')}")
                elif branch.get("city_id") in city_by:
                    closed=[ch for ch in branch_chapters if city_by[branch["city_id"]].get("eras",{}).get(ch,{}).get("open") is not True]
                    if closed: issues.append(f"BRANCH-CITY-ERA {sid}/{bid}: bound city closed in {closed}")
                branch_ok=check_xy(branch,f"{sid}/{bid}")
                if branch_ok and not point_on_land((branch["longitude"],branch["latitude"]),regions): issues.append(f"BRANCH-LAND {sid}/{bid}: point is not inside land polygon/island mask")
        for source in sect.get("sources",[]):
            if source not in source_ids: issues.append(f"SECT-SOURCE {sid}: unknown {source}")
    for node in offmap_rows:
        oid=node.get("id","?")
        lon,lat=node.get("approx_longitude"),node.get("approx_latitude")
        if not is_finite_number(lon) or not is_finite_number(lat): issues.append(f"OFFMAP-COORD {oid}: approximate coordinates must be finite numbers")
        elif west<=float(lon)<=east and south<=float(lat)<=north: issues.append(f"OFFMAP-INSIDE {oid}: approximate point falls inside map extent")
        chapters=node.get("chapters",[])
        if not isinstance(chapters,list) or len(chapters)!=len(set(chapters)) or set(chapters)-set(CHAPTERS): issues.append(f"OFFMAP-ERA {oid}: chapters must be unique valid chapter IDs")
        for source in node.get("sources",[]):
            if source not in source_ids: issues.append(f"OFFMAP-SOURCE {oid}: unknown {source}")
    for node in [*posts,*ports]:
        nid=node.get("id","?"); node_ok=check_xy(node,nid)
        if node_ok and not point_on_land((node["longitude"],node["latitude"]),regions): issues.append(f"TRAVEL-LAND {nid}: point is not inside land polygon/island mask")
        if node.get("city_id") not in city_ids: issues.append(f"TRAVEL-CITY {nid}: unknown {node.get('city_id')}")
        node_chapters=node.get("open_chapters",[])
        if not isinstance(node_chapters,list): issues.append(f"TRAVEL-ERA {nid}: open_chapters must be a list"); node_chapters=[]
        if len(node_chapters)!=len(set(node_chapters)): issues.append(f"TRAVEL-ERA-DUP {nid}: duplicate open chapter")
        unknown_chapters=set(node_chapters)-set(CHAPTERS)
        if unknown_chapters: issues.append(f"TRAVEL-ERA {nid}: unknown chapters {sorted(unknown_chapters)}")
        if node.get("city_id") in city_by:
            closed=[ch for ch in node_chapters if not city_by[node["city_id"]].get("eras",{}).get(ch,{}).get("open")]
            if closed: issues.append(f"TRAVEL-CITY-ERA {nid}: bound city closed in {closed}")
    for row in [*routes,*special]:
        rid=row.get("id","?")
        open_chapters=row.get("open_chapters",[])
        if not isinstance(open_chapters,list): issues.append(f"ROUTE-ERA {rid}: open_chapters must be a list"); open_chapters=[]
        if len(open_chapters)!=len(set(open_chapters)): issues.append(f"ROUTE-ERA-DUP {rid}: duplicate open chapter")
        unknown_chapters=set(open_chapters)-set(CHAPTERS)
        if unknown_chapters: issues.append(f"ROUTE-ERA {rid}: unknown chapters {sorted(unknown_chapters)}")
        via=row.get("via",[])
        if not isinstance(via,list): issues.append(f"ROUTE-VIA {rid}: via must be a list"); via=[]
        if row in routes and row.get("kind") not in route_kinds: issues.append(f"ROUTE-KIND {rid}: unknown {row.get('kind')!r}")
        if row.get("fee_tier") not in fee_tiers: issues.append(f"ROUTE-FEE {rid}: unknown {row.get('fee_tier')!r}")
        if not is_finite_number(row.get("duration_days")) or row.get("duration_days") <= 0: issues.append(f"ROUTE-DURATION {rid}: duration_days must be positive")
        for field in ("from","to"):
            endpoint=row.get(field)
            if endpoint not in endpoints: issues.append(f"ROUTE-ENDPOINT {rid}: unknown {field}={endpoint}")
            elif endpoint in travel_ids:
                node=next(x for x in [*posts,*ports] if x["id"]==endpoint)
                missing=set(row.get("open_chapters",[]))-set(node.get("open_chapters",[]))
                if missing: issues.append(f"ROUTE-TRAVEL-ERA {rid}/{endpoint}: endpoint closed in {sorted(missing)}")
            elif endpoint in city_by:
                closed=[ch for ch in row.get("open_chapters",[]) if not city_by[endpoint].get("eras",{}).get(ch,{}).get("open")]
                if closed: issues.append(f"ROUTE-CITY-ERA {rid}/{endpoint}: endpoint closed in {closed}")
        for mid in via:
            if mid not in endpoints: issues.append(f"ROUTE-VIA {rid}: unknown {mid}")
            elif row in routes:
                if mid in city_by: active={ch for ch in open_chapters if city_by[mid].get("eras",{}).get(ch,{}).get("open") is True}
                elif mid in travel_by: active=set(open_chapters)&set(travel_by[mid].get("open_chapters",[]))
                else: active=set()
                if not active: issues.append(f"ROUTE-VIA-ERA {rid}/{mid}: candidate stop is never open with route")
        if row in special:
            if row.get("kind")!="offmap_special": issues.append(f"OFFMAP-KIND {rid}: special_routes entry must use offmap_special")
            if via: issues.append(f"OFFMAP-VIA {rid}: special route must have no intermediate stop")
            if row.get("no_intermediate_stops") is not True: issues.append(f"OFFMAP-NONSTOP {rid}: flag must be boolean true")
            if sum(x in offmap_ids for x in (row.get("from"),row.get("to"))) != 1: issues.append(f"OFFMAP-ENDS {rid}: exactly one endpoint must be offmap")
            else:
                offmap_end=row["from"] if row["from"] in offmap_ids else row["to"]; land_end=row["to"] if row["from"] in offmap_ids else row["from"]
                if land_end not in travel_ids: issues.append(f"OFFMAP-BOARDING {rid}: land endpoint must be post_* or port_*")
                node=next((x for x in offmap_rows if x.get("id")==offmap_end),{})
                if set(open_chapters)!=set(node.get("chapters",[])): issues.append(f"OFFMAP-ERA {rid}: route chapters must equal {offmap_end} chapters")
        elif row.get("kind")=="offmap_special": issues.append(f"OFFMAP-NORMAL-KIND {rid}: offmap_special must be stored in special_routes")
        if row in routes:
            geometry=row.get("geometry",[])
            valid_geometry=isinstance(geometry,list) and len(geometry)>=2
            if not valid_geometry: issues.append(f"ROUTE-GEOMETRY {rid}: requires at least two coordinate pairs")
            else:
                for idx,pair in enumerate(geometry):
                    if not isinstance(pair,list) or len(pair)!=2 or not all(is_finite_number(x) for x in pair): issues.append(f"ROUTE-GEOMETRY {rid}/{idx}: expected two finite numbers"); valid_geometry=False
                    elif not (west<=pair[0]<=east and south<=pair[1]<=north): issues.append(f"ROUTE-GEOMETRY-RANGE {rid}/{idx}: outside extent")
            if valid_geometry:
                def known_coord(eid: Any) -> Optional[Tuple[float,float]]:
                    item=city_by.get(eid) or travel_by.get(eid)
                    return (float(item["longitude"]),float(item["latitude"])) if item and is_finite_number(item.get("longitude")) and is_finite_number(item.get("latitude")) else None
                for label,eid,pair in (("from",row.get("from"),geometry[0]),("to",row.get("to"),geometry[-1])):
                    expected=known_coord(eid)
                    if expected and math.hypot(pair[0]-expected[0],pair[1]-expected[1])>0.02: issues.append(f"ROUTE-GEOMETRY-END {rid}: {label} does not match {eid}")
                for mid in via:
                    expected=known_coord(mid)
                    if expected and min(math.hypot(pair[0]-expected[0],pair[1]-expected[1]) for pair in geometry)>0.02: issues.append(f"ROUTE-GEOMETRY-VIA {rid}: geometry does not pass {mid}")
                if row.get("kind") not in ("river","canal","sea","coastal_mixed"):
                    for a,b in zip(geometry,geometry[1:]):
                        for step in range(21):
                            t=step/20; point=(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
                            if not point_on_land(point,regions): issues.append(f"ROUTE-LAND {rid}: non-water geometry crosses water near ({point[0]:.3f}, {point[1]:.3f})"); break
                        else: continue
                        break
    special_touch: Dict[str,int]={oid:0 for oid in offmap_ids}
    for route in special:
        for endpoint in (route.get("from"),route.get("to")):
            if endpoint in special_touch: special_touch[endpoint]+=1
    for oid in offmap_ids:
        if special_touch.get(oid)!=1: issues.append(f"OFFMAP-DEGREE {oid}: expected exactly one special route, got {special_touch.get(oid,0)}")
    for row in routes:
        if row.get("from") in offmap_ids or row.get("to") in offmap_ids or any(v in offmap_ids for v in row.get("via",[])):
            issues.append(f"OFFMAP-NORMAL-ROUTE {row.get('id')}: offmap node may only use special route")
    for region in regions.get("regions",[]):
        rid=region.get("id","?")
        for neighbor in region.get("neighbors",[]):
            if neighbor not in region_ids: issues.append(f"REGION-NEIGHBOR {rid}: unknown {neighbor}")
    for rid,region in region_by.items():
        for neighbor in region.get("neighbors",[]):
            if rid not in region_by.get(neighbor,{}).get("neighbors",[]):
                issues.append(f"REGION-ASYMMETRIC {rid}: {neighbor} does not link back")
    # Geometry sanity sufficient for renderer and point-in-polygon validation.
    if not regions.get("land_polygons"): issues.append("GEOMETRY: land_polygons empty")
    for ring in regions.get("land_polygons",[]):
        if len(ring)<4 or ring[0]!=ring[-1]: issues.append("GEOMETRY: land polygon must be a closed ring with >=4 points")
    for idx,mask in enumerate(regions.get("island_masks",[])):
        if not isinstance(mask,list) or len(mask)!=5 or not all(is_finite_number(x) for x in mask[:3]) or mask[2]<=0: issues.append(f"GEOMETRY: island mask {idx} must be [lon,lat,positive_radius,name,kind]"); continue
        if mask[4]=="fictional_anchor" and point_on_raw_land((mask[0],mask[1]),regions): issues.append(f"GEOMETRY: fictional island mask {mask[3]} overlaps raw mainland")
    for kind in ("rivers","mountains"):
        for feature in regions.get(kind,[]):
            if not feature.get("lines") or any(len(line)<2 for line in feature.get("lines",[])):
                issues.append(f"GEOMETRY: {kind} {feature.get('id')} requires non-empty lines of >=2 points")
    return issues

def print_check(data: Mapping[str,Any]) -> int:
    issues=validate(data)
    if issues:
        print(f"FAIL: {len(issues)} map data issue(s)",file=sys.stderr)
        for issue in issues: print(f"- {issue}",file=sys.stderr)
        return 1
    print("OK: map data validation passed")
    print(f"  cities={len(data['cities']['cities'])}, sects={len(data['sects']['sects'])}, offmap={len(data['sects']['offmap_nodes'])}")
    print(f"  posts={len(data['routes']['posts'])}, ports={len(data['routes']['ports'])}, routes={len(data['routes']['routes'])}, special={len(data['routes']['special_routes'])}")
    print(f"  land_polygons={len(data['regions']['land_polygons'])}, rivers={len(data['regions']['rivers'])}, mountains={len(data['regions']['mountains'])}")
    return 0

def svg_path(points: Sequence[Sequence[float]], project: CanvasProjection, close: bool=False) -> str:
    if not points: return ""
    xy=[project(float(p[0]),float(p[1])) for p in points]
    body="M"+" L".join(f"{fmt(x)} {fmt(y)}" for x,y in xy)
    return body+(" Z" if close else "")

def svg_header(width:int,height:int,title:str,era:Optional[str]) -> List[str]:
    subtitle="全时代叠层" if era is None else era
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="map-title map-desc">',
      f'<title id="map-title">{esc(title)} · {esc(subtitle)}</title>',
      '<desc id="map-desc">Albers 等积圆锥投影的水墨江湖导航图；城市、门派与交通按书界时代显示。</desc>',
      '<metadata>{"generator":"tools/map/render_map.py","deterministic":true,"projection":"Albers 25N/47N, lon0=105E, lat0=35N"}</metadata>',
      '<defs>',
      '  <filter id="paper-grain" x="-5%" y="-5%" width="110%" height="110%">',
      '    <feTurbulence type="fractalNoise" baseFrequency="0.009 0.055" numOctaves="3" seed="19" result="grain"/>',
      '    <feColorMatrix in="grain" type="saturate" values="0" result="gray"/>',
      '    <feBlend in="SourceGraphic" in2="gray" mode="multiply"/>',
      '  </filter>',
      '  <filter id="ink-bleed" x="-4%" y="-4%" width="108%" height="108%">',
      '    <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="11" result="noise"/>',
      '    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="rough"/>',
      '    <feGaussianBlur in="rough" stdDeviation="0.45" result="soft"/>',
      '    <feBlend in="rough" in2="soft" mode="multiply"/>',
      '  </filter>',
      '  <filter id="mist" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="13"/></filter>',
      '  <pattern id="fibers" width="97" height="73" patternUnits="userSpaceOnUse"><path d="M0 11 Q25 5 54 12 T97 9 M8 54 Q40 47 93 57" fill="none" stroke="#8e8065" stroke-opacity=".055" stroke-width="1"/><path d="M21 0 L18 73 M72 0 L75 73" stroke="#fffdf4" stroke-opacity=".12"/></pattern>',
      '  <style>',
      '    .paper{fill:#eee4cc}.fiber{fill:url(#fibers)}.land{fill:#e8ddc2;stroke:#211f1a;stroke-width:5;stroke-linejoin:round}.coast-ghost{fill:none;stroke:#554c3e;stroke-opacity:.28;stroke-width:12}',
      '    .river{fill:none;stroke:#526d6d;stroke-width:7;stroke-opacity:.62;stroke-linecap:round;stroke-dasharray:38 7 11 5}.mount{fill:none;stroke:#3f3b32;stroke-width:5;stroke-opacity:.52;stroke-linecap:round}',
      '    .road{fill:none;stroke:#655b49;stroke-width:3;stroke-opacity:.35;stroke-dasharray:10 9}.water-route{fill:none;stroke:#4f6968;stroke-width:3.5;stroke-opacity:.5;stroke-dasharray:25 9}.mixed-route{fill:none;stroke:#5d6259;stroke-width:3.3;stroke-opacity:.48;stroke-dasharray:17 7 3 7}',
      '    .special-route{fill:none;stroke:#9e3b2f;stroke-width:4;stroke-dasharray:13 9}.city-capital{fill:#201d18;stroke:#9e3b2f;stroke-width:5}.city-major{fill:#39342b}.city-secondary{fill:#6a6150}.city-site{fill:none;stroke:#39342b;stroke-width:4}',
      '    .sect{fill:#9e3b2f;stroke:#f0e6cf;stroke-width:2}.post{fill:#6f5940}.port{fill:#526d6d}.label{font-family:"Ma Shan Zheng","Zhi Mang Xing","STKaiti","KaiTi","Noto Serif CJK SC",serif;fill:#211f1a;paint-order:stroke;stroke:#eee4cc;stroke-width:7;stroke-linejoin:round}.minor{font-size:22px}.major{font-size:27px;font-weight:600}.capital{font-size:33px;font-weight:700}.sect-label{font-size:19px;fill:#74281f}',
      '    .vertical{writing-mode:vertical-rl;text-orientation:upright;letter-spacing:.08em}.title{font-family:"Ma Shan Zheng","Zhi Mang Xing","STKaiti",serif;font-size:66px;letter-spacing:.16em}.subtitle{font-family:"STKaiti","KaiTi",serif;font-size:22px}.seal{fill:#9e3b2f;stroke:#7d2a22;stroke-width:4}.seal-text{fill:#eee4cc;font-family:"STKaiti",serif;font-size:20px;font-weight:700}.offmap-box{fill:#eee4cc;fill-opacity:.88;stroke:#9e3b2f;stroke-width:4}.offmap-text{font-family:"STKaiti","KaiTi",serif;fill:#74281f;font-size:23px}.era-layer[display="none"]{display:none}',
      '  </style>',
      '</defs>',
    ]

def render_base(lines: List[str], data: Mapping[str,Any], project: CanvasProjection, width:int, height:int) -> None:
    regions=data["regions"]
    lines += [f'<rect class="paper" width="{width}" height="{height}"/>',f'<rect class="fiber" width="{width}" height="{height}" filter="url(#paper-grain)"/>','<g id="base-geography">']
    for i,ring in enumerate(regions["land_polygons"]):
        d=svg_path(ring,project,True)
        lines.append(f'<path id="land-{i:03d}" class="land" d="{d}" filter="url(#ink-bleed)"/>')
    for lon,lat,radius,name,kind in regions.get("island_masks",[]):
        x,y=project(lon,lat); edge=project(lon+radius,lat)[0]-x
        lines.append(f'<ellipse class="land" data-kind="{esc(kind)}" aria-label="{esc(name)}" cx="{fmt(x)}" cy="{fmt(y)}" rx="{fmt(abs(edge))}" ry="{fmt(abs(edge)*.72)}"/>')
    lines.append('</g>')
    lines.append('<g id="rivers">')
    for river in regions["rivers"]:
        for idx,path in enumerate(river["lines"]): lines.append(f'<path id="{esc(river["id"])}-{idx}" class="river" d="{svg_path(path,project)}"/>')
    lines.append('</g><g id="mountains">')
    for mount in regions["mountains"]:
        for line_idx,path in enumerate(mount["lines"]):
            for i in range(max(0,len(path)-1)):
                ax,ay=project(*path[i]); bx,by=project(*path[i+1]); segs=max(2,int(math.hypot(bx-ax,by-ay)/36))
                for j in range(segs):
                    t=(j+.5)/segs; x=ax+(bx-ax)*t; y=ay+(by-ay)*t; dx,dy=stable_jitter(f"{mount['id']}-{line_idx}-{j}",8)
                    lines.append(f'<path class="mount" d="M{fmt(x-13+dx)} {fmt(y+8+dy)} Q{fmt(x)} {fmt(y-15+dy)} {fmt(x+14+dx)} {fmt(y+8+dy)}"/>')
    lines.append('</g>')

def city_coord(city:Mapping[str,Any], band:str) -> Tuple[float,float]:
    lon,lat=float(city["longitude"]),float(city["latitude"])
    for move in city.get("seat_moves",[]):
        if band in move.get("eras",[]):
            lon,lat=float(move["longitude"]),float(move["latitude"])
    return lon,lat

def endpoint_coord(
    eid:str, city_by:Mapping[str,Any], travel_by:Mapping[str,Any], band:str,
) -> Optional[Tuple[float,float]]:
    row=city_by.get(eid) or travel_by.get(eid)
    if row:
        return city_coord(row,band) if eid in city_by else (float(row["longitude"]),float(row["latitude"]))
    return None

def draw_routes(lines:List[str], data:Mapping[str,Any], project:CanvasProjection, ch:str) -> None:
    city_by={x["id"]:x for x in data["cities"]["cities"]}
    travel_by={x["id"]:x for x in [*data["routes"]["posts"],*data["routes"]["ports"]]}
    band=data["cities"]["chapters"][ch]["band"]
    lines.append('<g class="travel-routes">')
    for row in data["routes"]["routes"]:
        if ch not in row["open_chapters"]: continue
        coords=[list(pair) for pair in row["geometry"]]
        # Geometry owns the stable path shape.  Only its terminal points follow
        # a chapter-specific seat relocation; candidate via stops never reshape it.
        start=endpoint_coord(row["from"],city_by,travel_by,band)
        end=endpoint_coord(row["to"],city_by,travel_by,band)
        if start: coords[0]=list(start)
        if end: coords[-1]=list(end)
        if len(coords)>=2:
            cls="water-route" if row["kind"] in ("river","canal","sea") else ("mixed-route" if row["kind"]=="coastal_mixed" else "road")
            lines.append(f'<path id="{ch}-{esc(row["id"])}" data-map-id="{esc(row["id"])}" class="{cls}" d="{svg_path(coords,project)}"><title>{esc(row["name"])} · {row["duration_days"]}日 · {esc(row["fee_tier"])}</title></path>')
    lines.append('</g>')

def draw_travel_nodes(lines:List[str], data:Mapping[str,Any], project:CanvasProjection, ch:str) -> None:
    lines.append('<g class="travel-nodes">')
    for key,cls,shape in (("posts","post","rect"),("ports","port","path")):
        for row in data["routes"][key]:
            if ch not in row["open_chapters"]: continue
            x,y=project(row["longitude"],row["latitude"])
            if shape=="rect": lines.append(f'<rect id="{ch}-{esc(row["id"])}" data-map-id="{esc(row["id"])}" class="{cls}" x="{fmt(x-5)}" y="{fmt(y-5)}" width="10" height="10"><title>{esc(row["name"])}</title></rect>')
            else: lines.append(f'<path id="{ch}-{esc(row["id"])}" data-map-id="{esc(row["id"])}" class="{cls}" d="M{fmt(x-8)} {fmt(y+3)} Q{fmt(x)} {fmt(y+10)} {fmt(x+8)} {fmt(y+3)} L{fmt(x+5)} {fmt(y+8)} L{fmt(x-5)} {fmt(y+8)} Z"><title>{esc(row["name"])}</title></path>')
    lines.append('</g>')

def draw_cities(lines:List[str], data:Mapping[str,Any], project:CanvasProjection, ch:str) -> None:
    lines.append('<g class="cities">')
    open_rows=[c for c in data["cities"]["cities"] if c["eras"][ch]["open"]]
    band=data["cities"]["chapters"][ch]["band"]
    for city in open_rows:
        era=city["eras"][ch]; lon,lat=city_coord(city,band)
        x,y=project(lon,lat); importance=city["importance"]
        display_level="capital" if era["status"]=="都城" else ("site" if importance=="site" else ("major" if importance in ("capital","major") else "secondary"))
        r={"capital":10,"major":7,"secondary":5,"site":8}[display_level]
        cls=f"city-{display_level}"
        lines.append(f'<circle id="{ch}-{esc(city["id"])}" data-map-id="{esc(city["id"])}" class="{cls}" cx="{fmt(x)}" cy="{fmt(y)}" r="{r}"><title>{esc(era["name"])} · {esc(city["modern_name"])} · {esc(era["status"])}</title></circle>')
    # Label only priority nodes at full 4096 scale; every city remains accessible by title/id.
    label_rows=[c for c in open_rows if c["importance"] in ("capital","major")]
    for city in label_rows:
        era=city["eras"][ch]; x,y=project(*city_coord(city,band)); jx,jy=stable_jitter(city["id"],12)
        level="capital" if era["status"]=="都城" else "major"
        vertical=len(era["name"])<=7
        if vertical: lines.append(f'<text class="label {level} vertical" x="{fmt(x+13+jx)}" y="{fmt(y-8+jy)}">{esc(era["name"])}</text>')
        else: lines.append(f'<text class="label {level}" x="{fmt(x+12+jx)}" y="{fmt(y-10+jy)}">{esc(era["name"])}</text>')
    lines.append('</g>')

def draw_sects(lines:List[str], data:Mapping[str,Any], project:CanvasProjection, ch:str) -> None:
    lines.append('<g class="sects">')
    visible=[]
    for sect in data["sects"]["sects"]:
        state=sect["availability"][ch]
        if state not in ("O","H"): continue
        x,y=project(sect["longitude"],sect["latitude"]); jx,jy=stable_jitter(sect["id"],9)
        lines.append(f'<path id="{ch}-{esc(sect["id"])}" data-map-id="{esc(sect["id"])}" class="sect" opacity="{1 if state=="O" else .48}" d="M{fmt(x)} {fmt(y-8)} L{fmt(x+7)} {fmt(y)} L{fmt(x)} {fmt(y+8)} L{fmt(x-7)} {fmt(y)} Z"><title>{esc(sect["name"])} · {esc(sect["site_name"])} · {state}</title></path>')
        if state=="O": visible.append((sect,x+jx,y+jy))
    for sect,x,y in visible:
        lines.append(f'<text class="label sect-label" x="{fmt(x+10)}" y="{fmt(y+19)}">{esc(sect["name"])}</text>')
    lines.append('</g>')

def draw_branches(lines:List[str], data:Mapping[str,Any], project:CanvasProjection, ch:str) -> None:
    lines.append('<g class="sect-branches">')
    for sect in data["sects"]["sects"]:
        if sect["availability"][ch] not in ("O","H"): continue
        for branch in sect.get("branches",[]):
            if branch.get("offmap_id"): continue
            if ch not in branch.get("open_chapters",[]): continue
            x,y=project(branch["longitude"],branch["latitude"])
            lines.append(f'<circle id="{ch}-{esc(branch["id"])}" data-map-id="{esc(branch["id"])}" class="sect" opacity=".55" cx="{fmt(x)}" cy="{fmt(y)}" r="4"><title>{esc(sect["name"])}分支 · {esc(branch["name"])}</title></circle>')
    lines.append('</g>')

def draw_offmap(
    lines:List[str], data:Mapping[str,Any], project:CanvasProjection,
    ch:str, width:int, height:int,
) -> None:
    nodes=[x for x in data["sects"]["offmap_nodes"] if ch in x["chapters"]]
    routes=[x for x in data["routes"]["special_routes"] if ch in x["open_chapters"]]
    if not nodes: return
    travel={x["id"]:x for x in [*data["routes"]["posts"],*data["routes"]["ports"]]}
    boxx,boxy=36,340
    lines.append('<g class="offmap-nodes">')
    for idx,node in enumerate(nodes):
        y=boxy+idx*112
        lines.append(f'<rect id="{ch}-{esc(node["id"])}" data-map-id="{esc(node["id"])}" class="offmap-box" x="{boxx}" y="{y}" width="310" height="88" rx="8"/>')
        lines.append(f'<text class="offmap-text" x="{boxx+20}" y="{y+34}">{esc(node["name"])}</text><text class="subtitle" x="{boxx+20}" y="{y+65}">图外专线 · 中途不停靠</text>')
        for route in routes:
            if node["id"] not in (route["from"],route["to"]): continue
            land=route["to"] if route["from"]==node["id"] else route["from"]; origin=travel[land]
            ox,oy=project(origin["longitude"],origin["latitude"])
            # The callout itself is schematic, but the inland end terminates
            # at the actual projected post/port so the boarding point is clear.
            control_x=max(boxx+390,ox-170)
            lines.append(f'<path id="{ch}-{esc(route["id"])}" data-map-id="{esc(route["id"])}" class="special-route" d="M{boxx+310} {y+44} C{boxx+390} {y+44} {fmt(control_x)} {fmt(oy)} {fmt(ox)} {fmt(oy)}"><title>{esc(route["name"])} · {route["duration_days"]}日</title></path>')
            lines.append(f'<text class="subtitle" x="360" y="{y+30}">由{esc(origin["name"])}启程</text>')
    lines.append('</g>')

def draw_ornaments(lines:List[str], data:Mapping[str,Any], ch:Optional[str], width:int, height:int) -> None:
    title="江湖万里图"; sub="统一大地图 · 水墨导航层" if ch is None else f"{data['cities']['chapters'][ch]['title']} · {data['cities']['chapters'][ch]['era']}"
    lines += [f'<text class="title vertical" x="{width-118}" y="190">{title}</text>',f'<text class="subtitle vertical" x="{width-55}" y="205">{esc(sub)}</text>',f'<text class="subtitle" x="{width-700}" y="{height-96}">一纸载十四世，驿路通万里；地名随时，山河不改。</text>',f'<text class="subtitle" x="{width-700}" y="{height-60}">天书录 · 丙午秋制图　投影：Albers 等积圆锥</text>']
    x,y=width-355,height-320
    lines += [f'<rect class="offmap-box" x="{x}" y="{y}" width="260" height="165" rx="8"/>',f'<rect class="seal" x="{x+18}" y="{y+18}" width="56" height="56" rx="5"/><text class="seal-text vertical" x="{x+35}" y="{y+27}">江湖</text>',f'<circle class="city-capital" cx="{x+105}" cy="{y+43}" r="8"/><text class="subtitle" x="{x+125}" y="{y+51}">都城</text>',f'<circle class="city-major" cx="{x+105}" cy="{y+83}" r="6"/><text class="subtitle" x="{x+125}" y="{y+91}">府州 / 商埠</text>',f'<path class="sect" d="M{x+105} {y+112} l7 8 -7 8 -7 -8 z"/><text class="subtitle" x="{x+125}" y="{y+127}">门派</text>',f'<path class="water-route" d="M{x+90} {y+147} h42"/><text class="subtitle" x="{x+145}" y="{y+154}">水路</text>']

def render_document(data:Mapping[str,Any], width:int, height:int, era:Optional[str]) -> str:
    project=CanvasProjection(width,height)
    lines=svg_header(width,height,"江湖万里图",era)
    render_base(lines,data,project,width,height)
    chapters=CHAPTERS if era is None else (era,)
    for i,ch in enumerate(chapters):
        display="inline" if era is not None or i==0 else "none"
        lines.append(f'<g id="era-{ch}" class="era-layer" display="{display}" data-era="{ch}">')
        draw_routes(lines,data,project,ch); draw_travel_nodes(lines,data,project,ch); draw_cities(lines,data,project,ch); draw_sects(lines,data,project,ch); draw_branches(lines,data,project,ch); draw_offmap(lines,data,project,ch,width,height)
        lines.append('</g>')
    draw_ornaments(lines,data,era,width,height)
    lines.append('</svg>')
    return "\n".join(lines)+"\n"

def encoded_svg(content:str, path:Path) -> bytes:
    payload=content.encode("utf-8")
    if len(payload)>2*1024*1024: raise ValueError(f"{path}: {len(payload)} bytes exceeds 2 MiB")
    return payload

def write_deterministic(path:Path, content:str) -> None:
    payload=encoded_svg(content,path)
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp_name=tempfile.mkstemp(prefix=f".{path.name}.",suffix=".tmp",dir=str(path.parent))
    tmp=Path(tmp_name)
    try:
        with os.fdopen(fd,"wb") as stream:
            stream.write(payload)
            stream.flush(); os.fsync(stream.fileno())
        os.replace(tmp,path)
    finally:
        if tmp.exists(): tmp.unlink()

def render_all(data:Mapping[str,Any], out_dir:Path, width:int, height:int, era:Optional[str]) -> List[Path]:
    pending: List[Tuple[Path,str]]=[]
    if era:
        path=out_dir/f"jianghu-{era}.svg"; pending.append((path,render_document(data,width,height,era)))
    else:
        base=out_dir/"jianghu-base.svg"; pending.append((base,render_document(data,width,height,None)))
        for ch in CHAPTERS:
            path=out_dir/f"jianghu-{ch}.svg"; pending.append((path,render_document(data,width,height,ch)))
    # Preflight every payload before replacing any existing asset.
    for path,content in pending: encoded_svg(content,path)
    for path,content in pending: write_deterministic(path,content)
    return [path for path,_content in pending]

def parse_args(argv:Optional[Sequence[str]]=None) -> argparse.Namespace:
    p=argparse.ArgumentParser(description=__doc__)
    mode=p.add_mutually_exclusive_group(required=True); mode.add_argument("--check",action="store_true"); mode.add_argument("--render",action="store_true")
    p.add_argument("--era",choices=CHAPTERS,help="render one era only; omitted renders base plus all 14 files")
    p.add_argument("--out",type=Path,default=DATA_DIR,help="output directory (default: docs/design/map)")
    p.add_argument("--width",type=int,default=4096); p.add_argument("--height",type=int,default=3072)
    p.add_argument("--data-dir",type=Path,default=DATA_DIR,help=argparse.SUPPRESS)
    return p.parse_args(argv)

def main(argv:Optional[Sequence[str]]=None) -> int:
    args=parse_args(argv); data=load_all(args.data_dir); issues=validate(data)
    if args.check: return print_check(data)
    if issues:
        print(f"refusing render: {len(issues)} validation issue(s); run --check",file=sys.stderr)
        for issue in issues: print(f"- {issue}",file=sys.stderr)
        return 1
    if args.width<1024 or args.height<768:
        print("canvas must be at least 1024 x 768",file=sys.stderr); return 2
    outputs=render_all(data,args.out,args.width,args.height,args.era)
    for path in outputs: print(f"wrote {path} ({path.stat().st_size} bytes)")
    return 0

if __name__=="__main__": raise SystemExit(main())

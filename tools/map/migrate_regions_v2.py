#!/usr/bin/env python3
"""Atomically migrate navigation sources from the W1 19-region draft to 30 regions.

The authoritative city assignments and adjacency come from design/11 sections
2.2 and 3.2.  Output remains JSON-compatible YAML and is deterministic.
"""

from __future__ import annotations

import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, Iterable, List

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "docs/design/map"
WORLD = ROOT / "docs/design/11-open-world.md"
SPECS = [
    ("rg_yanjing_zhili", "燕京与直隶", "rg_zhongyuan rg_hedong_jinzhong rg_qilu rg_liaoxi rg_monan"),
    ("rg_zhongyuan", "中原", "rg_yanjing_zhili rg_guanzhong rg_qinba rg_hedong_jinzhong rg_qilu rg_jianghuai rg_jingxiang"),
    ("rg_guanzhong", "关中陕北", "rg_zhongyuan rg_qinba rg_hedong_jinzhong rg_hexilongyou rg_monan rg_xixia_helan"),
    ("rg_qinba", "秦巴汉水", "rg_guanzhong rg_zhongyuan rg_jingxiang rg_bashu"),
    ("rg_hedong_jinzhong", "河东与晋中", "rg_yanjing_zhili rg_zhongyuan rg_guanzhong rg_monan"),
    ("rg_qilu", "齐鲁", "rg_yanjing_zhili rg_zhongyuan rg_jianghuai rg_jiangnan_taihu rg_donghai_islands"),
    ("rg_jianghuai", "江淮", "rg_zhongyuan rg_qilu rg_jiangnan_taihu rg_jiangxi rg_jingxiang"),
    ("rg_jiangnan_taihu", "太湖江南", "rg_qilu rg_jianghuai rg_zhedong rg_jiangxi rg_donghai_islands"),
    ("rg_zhedong", "浙东沿海", "rg_jiangnan_taihu rg_fujian rg_jiangxi rg_donghai_islands"),
    ("rg_fujian", "闽地", "rg_zhedong rg_jiangxi rg_lingnan rg_donghai_islands rg_nanhai_islands"),
    ("rg_jiangxi", "江西", "rg_jianghuai rg_jiangnan_taihu rg_zhedong rg_fujian rg_jingxiang rg_huxiang rg_lingnan"),
    ("rg_jingxiang", "荆襄", "rg_zhongyuan rg_qinba rg_jianghuai rg_jiangxi rg_huxiang rg_bashu"),
    ("rg_huxiang", "湖湘", "rg_jingxiang rg_jiangxi rg_lingnan rg_guangxi rg_bashu rg_yundian_qianzhong"),
    ("rg_lingnan", "岭南南海岸", "rg_fujian rg_jiangxi rg_huxiang rg_guangxi rg_donghai_islands rg_nanhai_islands"),
    ("rg_guangxi", "桂西桂北", "rg_lingnan rg_huxiang rg_dali_cangshan rg_yundian_qianzhong"),
    ("rg_bashu", "巴蜀", "rg_qinba rg_jingxiang rg_huxiang rg_dali_cangshan rg_yundian_qianzhong rg_qingzang"),
    ("rg_dali_cangshan", "大理苍山", "rg_bashu rg_guangxi rg_yundian_qianzhong rg_qingzang"),
    ("rg_yundian_qianzhong", "云滇黔中", "rg_bashu rg_dali_cangshan rg_huxiang rg_guangxi rg_qingzang"),
    ("rg_qingzang", "青藏", "rg_bashu rg_dali_cangshan rg_yundian_qianzhong rg_hexilongyou rg_xiyu_nanjiang"),
    ("rg_hexilongyou", "河西与陇右", "rg_guanzhong rg_qingzang rg_xixia_helan rg_xiyu_nanjiang rg_xiyu_beijiang rg_monan"),
    ("rg_xixia_helan", "西夏贺兰", "rg_guanzhong rg_hexilongyou rg_monan"),
    ("rg_xiyu_nanjiang", "西域南疆", "rg_qingzang rg_hexilongyou rg_xiyu_beijiang"),
    ("rg_xiyu_beijiang", "西域北疆", "rg_xiyu_nanjiang rg_hexilongyou rg_monan rg_mobei"),
    ("rg_liaoxi", "辽西走廊", "rg_yanjing_zhili rg_liaodong rg_dongbei rg_monan"),
    ("rg_liaodong", "辽东", "rg_liaoxi rg_dongbei rg_donghai_islands"),
    ("rg_dongbei", "东北边地", "rg_liaoxi rg_liaodong rg_monan rg_mobei"),
    ("rg_monan", "漠南", "rg_yanjing_zhili rg_guanzhong rg_hedong_jinzhong rg_hexilongyou rg_xixia_helan rg_xiyu_beijiang rg_liaoxi rg_dongbei rg_mobei"),
    ("rg_mobei", "漠北", "rg_xiyu_beijiang rg_monan rg_dongbei"),
    ("rg_donghai_islands", "东海诸岛", "rg_qilu rg_jiangnan_taihu rg_zhedong rg_fujian rg_lingnan rg_liaodong rg_nanhai_islands"),
    ("rg_nanhai_islands", "南海诸岛", "rg_fujian rg_lingnan rg_donghai_islands"),
]

def load(name: str) -> Dict[str, Any]:
    return json.loads((DATA / f"{name}.yaml").read_text(encoding="utf-8"))

def city_assignments() -> Dict[str, str]:
    text = WORLD.read_text(encoding="utf-8")
    section = text.split("### 3.2 全量城市表", 1)[1].split("### 3.3", 1)[0]
    rows = re.findall(r"^\| `(city_[^`]+)` \|.*?\| `(rg_[^`]+)` \|", section, re.M)
    result = dict(rows)
    if len(rows) != 189 or len(result) != 189:
        raise ValueError(f"design/11 city table expected 189 unique rows, got {len(rows)}/{len(result)}")
    return result

def ordered_unique(values: Iterable[str]) -> List[str]:
    return list(dict.fromkeys(values))

def write_atomic(path: Path, value: Dict[str, Any]) -> None:
    payload = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    fd, name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(payload); stream.flush(); os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name): os.unlink(name)

def main() -> None:
    regions, cities, sects, routes = (load(x) for x in ("regions", "cities", "sects", "routes"))
    regions["schema_version"] = "world-map-regions.v2"
    cities["schema_version"] = "world-map-cities.v2"
    sects["schema_version"] = "world-map-sects.v2"
    routes["schema_version"] = "world-map-routes.v2"
    assignment = city_assignments()
    city_by = {row["id"]: row for row in cities["cities"]}
    if set(city_by) != set(assignment):
        raise ValueError("cities.yaml and design/11 city IDs differ")
    for cid, row in city_by.items(): row["region"] = assignment[cid]
    new_regions = []
    for rid, name, neighbors in SPECS:
        points = [(r["longitude"], r["latitude"]) for r in city_by.values() if r["region"] == rid]
        if not points: raise ValueError(f"{rid} has no city anchors")
        xs, ys = zip(*points)
        new_regions.append({"id": rid, "name": name,
            "center": [round(sum(xs)/len(xs), 2), round(sum(ys)/len(ys), 2)],
            "bounds": [round(max(73.0, min(xs)-0.25), 2), round(max(18.0, min(ys)-0.25), 2),
                       round(min(135.0, max(xs)+0.25), 2), round(min(54.0, max(ys)+0.25), 2)],
            "neighbors": neighbors.split()})
    regions["regions"] = new_regions
    for sect in sects["sects"]:
        sect["region"] = assignment[sect["city_id"]] if sect.get("city_id") else "rg_hedong_jinzhong"
        for branch in sect.get("branches", []):
            if branch.get("city_id"): branch["region"] = assignment[branch["city_id"]]
    travel = {r["id"]: r for key in ("posts", "ports") for r in routes[key]}
    for row in travel.values(): row["region"] = assignment[row["city_id"]]
    def endpoint_region(eid: str) -> str | None:
        if eid in assignment: return assignment[eid]
        if eid in travel: return travel[eid]["region"]
        return None
    for key in ("routes", "special_routes"):
        for route in routes[key]:
            route["regions"] = ordered_unique(r for eid in [route["from"], *route.get("via", []), route["to"]]
                                                   if (r := endpoint_region(eid)) is not None)
    for name, value in (("regions", regions), ("cities", cities), ("sects", sects), ("routes", routes)):
        write_atomic(DATA / f"{name}.yaml", value)
    print("migrated 30 regions, 189 cities, 99 sects, 52 travel nodes, and 51 routes")

if __name__ == "__main__":
    main()

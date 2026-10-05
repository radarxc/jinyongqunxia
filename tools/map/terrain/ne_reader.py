"""Minimal deterministic Natural Earth 10m SHP/DBF reader.

Adapted from .agents/coord/gemini_qa/maps/ne.py (2026-10-03 handoff).
Only the attributes and East Asia geometry needed by the terrain builder are read.
"""
from __future__ import annotations

import struct
from pathlib import Path
from typing import Any, Dict, List

BOX = (70.0, 15.0, 138.0, 57.0)
STEMS = {
    "land": "ne_10m_land",
    "lakes": "ne_10m_lakes",
    "rivers": "ne_10m_rivers_lake_centerlines",
}


def _read_dbf(path: Path) -> List[Dict[str, Any]]:
    data = path.read_bytes()
    count = struct.unpack("<I", data[4:8])[0]
    header_len, record_len = struct.unpack("<HH", data[8:12])
    fields, offset = [], 32
    while data[offset] != 0x0D:
        name = data[offset : offset + 11].split(b"\0")[0].decode("ascii", "replace")
        fields.append((name, chr(data[offset + 11]), data[offset + 16]))
        offset += 32
    rows = []
    for index in range(count):
        record = data[header_len + index * record_len : header_len + (index + 1) * record_len]
        position, row = 1, {}
        for name, kind, length in fields:
            raw = record[position : position + length].decode("utf-8", "replace").replace("\x00", "").strip()
            position += length
            if kind in "NF":
                try:
                    row[name] = float(raw) if raw else None
                except ValueError:
                    row[name] = None
            else:
                row[name] = raw
        rows.append(row)
    return rows


def _read_shp(path: Path) -> List[Dict[str, Any] | None]:
    data, offset, rows = path.read_bytes(), 100, []
    while offset + 8 <= len(data):
        content_len = struct.unpack(">i", data[offset + 4 : offset + 8])[0] * 2
        record = data[offset + 8 : offset + 8 + content_len]
        offset += 8 + content_len
        shape_type = struct.unpack("<i", record[:4])[0]
        if shape_type == 0:
            rows.append(None)
            continue
        bbox = struct.unpack("<4d", record[4:36])
        part_count, point_count = struct.unpack("<2i", record[36:44])
        starts = list(struct.unpack(f"<{part_count}i", record[44 : 44 + 4 * part_count]))
        point_offset = 44 + 4 * part_count
        values = struct.unpack(f"<{2 * point_count}d", record[point_offset : point_offset + 16 * point_count])
        points = list(zip(values[0::2], values[1::2]))
        starts.append(point_count)
        rows.append({"bbox": bbox, "parts": [points[starts[i] : starts[i + 1]] for i in range(part_count)]})
    return rows


def _intersects(a, b=BOX):
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])


def load(geodata: Path, name: str) -> List[Dict[str, Any]]:
    stem = STEMS[name]
    source = geodata / stem / f"{stem}.shp"
    properties, geometries, output = _read_dbf(source.with_suffix(".dbf")), _read_shp(source), []
    keys = ("name", "name_zh", "name_en", "scalerank", "featurecla", "min_zoom", "rivernum")
    for props, geometry in zip(properties, geometries):
        if geometry is None or not _intersects(geometry["bbox"]):
            continue
        output.append({
            "props": {key: props.get(key) for key in keys if key in props},
            "bbox": geometry["bbox"],
            "parts": [[(round(x, 5), round(y, 5)) for x, y in part] for part in geometry["parts"]],
        })
    return output


def signed_area(ring):
    """Shoelace area; Natural Earth outer rings are clockwise (negative)."""
    return 0.5 * sum(
        x1 * y2 - x2 * y1
        for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1])
    )

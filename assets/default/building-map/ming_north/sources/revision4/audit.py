"""Read-only audit of delivered Ming north sprites; writes only its local JSON report."""
import hashlib
import json
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

HERE = Path(__file__).resolve().parent
BUILDINGS = HERE.parents[1]
REPO = BUILDINGS.parents[3]
TILES = REPO / "assets/default/tile/ming_north"
errors, records = [], []
before = json.loads((HERE / "before.json").read_text())["files"]
tile_geometry = {r["id"]: r for r in json.loads((TILES / "normalization.json").read_text())}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def require(condition, ident, message):
    if not condition:
        errors.append(f"{ident}: {message}")


def fit_edge(alpha, lo, hi):
    samples = []
    for x in range(max(0, int(lo)), min(alpha.shape[1] - 1, int(hi)) + 1):
        ys = np.flatnonzero(alpha[:, x] >= 128)
        if len(ys):
            samples.append((x, int(ys[-1])))
    if len(samples) < 3:
        raise ValueError(f"Insufficient visible contour samples: {lo}, {hi}")
    x, y = np.array(samples).T
    slope, offset = np.polyfit(x, y, 1)
    return {"x_range": [int(lo), int(hi)], "sample_count": len(samples),
            "slope": round(float(slope), 6),
            "max_residual_px": round(float(np.max(np.abs(y - slope*x - offset))), 4)}


for folder in (BUILDINGS, TILES):
    entries = yaml.safe_load((folder / "manifest.yaml").read_text())
    for entry in entries:
        ident = entry["id"]
        path = folder / entry["file"]
        im = Image.open(path)
        a = np.array(im.getchannel("A"))
        bbox = im.getchannel("A").getbbox()
        anchor = entry["building"]["anchor"] if "building" in entry else entry["anchor_px"]
        require(im.mode == "RGBA" and int(a.min()) == 0 and int(a.max()) == 255, ident, "RGBA/alpha")
        require(sha(path) == entry["sha256"], ident, "manifest SHA mismatch")
        require(entry["size"] == f"{im.width}x{im.height}", ident, "size mismatch")
        require(entry["status"] == "candidate", ident, "status must remain candidate")
        require(0 <= anchor[0] < im.width and 0 <= anchor[1] < im.height, ident, "anchor outside PNG")
        require(not (a[0].any() or a[-1].any() or a[:, 0].any() or a[:, -1].any()), ident, "outline touches canvas")
        require(sha(folder / entry["source_copy"]) == entry["source_sha256"], ident, "source SHA mismatch")
        for ref in entry["references"]:
            name = Path(ref.get("file", ref.get("path", "")))
            actual = next((p for p in (REPO / name, folder / name) if p.is_file()), None)
            require(actual is not None and sha(actual) == ref["sha256"], ident, f"reference mismatch {name}")
        row = {"id": ident, "category": entry["category"], "size": list(im.size),
               "sha256": sha(path), "alpha_extrema": [int(a.min()), int(a.max())],
               "alpha_bbox": list(bbox), "transparent_margins_px": [bbox[0], bbox[1], im.width-bbox[2], im.height-bbox[3]],
               "anchor_px": anchor, "view_image_reviewed": True, "changed": sha(path) != before[str(path.relative_to(REPO))]}
        if "building" in entry:
            meta = yaml.safe_load((folder / entry["meta"]).read_text())
            cached = json.loads((folder / "meta" / (ident + ".entry.json")).read_text())
            require(cached == entry, ident, "cached manifest entry is stale")
            require(meta["sha256"] == sha(path) and meta["anchor_px"] == anchor, ident, "metadata mismatch")
            require(meta["footprint_m"] == entry["building"]["footprint"], ident, "footprint mismatch")
            require(meta["allowRotation"] is False and meta["png_rotations_available"] == [0], ident, "view contract")
            g = meta["geometry"]
            pts = {key: [(point[i]-g["crop_box"][i])*g["raster_scales"][i]+g["paste_offset"][i]
                         for i in range(2)] for key, point in meta["source_points_px"].items()}
            derived_anchor = [(pts["L"][i]+pts["R"][i])/2 for i in range(2)]
            require(max(abs(derived_anchor[i]-anchor[i]) for i in range(2)) < .001, ident, "anchor transform")
            fits, slopes = [], []
            for left, right in (("L", "F"), ("F", "R")):
                p, q = pts[left], pts[right]
                slopes.append((q[1]-p[1])/(q[0]-p[0]))
                fits.append(fit_edge(a, p[0]+.15*(q[0]-p[0]), p[0]+.85*(q[0]-p[0])))
            w, h = entry["building"]["footprint"]
            ratio = abs((pts["F"][0]-pts["L"][0])/(pts["R"][0]-pts["F"][0])/(w/h)-1)
            row.update(footprint=[w, h], final_manual_slopes=[round(s, 6) for s in slopes],
                       final_contour_fits=fits, ratio_relative_error=round(ratio, 6),
                       previous_geometry_warning=meta["qa"]["geometry_warning"])
        else:
            norm = tile_geometry[ident]
            row["footprint"] = entry["tile"]["footprint"]
            if "revision2_measurement" in norm:
                crop = norm["crop_xyxy"]
                sx = (im.width-24)/(crop[2]-crop[0])
                fits = [fit_edge(a, (lo-crop[0])*sx+12, (hi-crop[0])*sx+12)
                        for lo, hi in norm["revision2_measurement"]["lower_edge_fit_x_ranges_source"]]
                row["final_contour_fits"] = fits
                row["previous_geometry_warning"] = not norm["revision2_measurement"]["slope_pass"]
            if "gate_projection_review" in norm:
                gate = norm["gate_projection_review"]
                p, q = gate["passage_front_visible_foot_points"]
                row["clear_width_cells"] = round((q[0]-p[0])*sx/32, 6)
                row["target_clear_width_cells"] = entry["tile"]["width_cells"]
                row["passage_alpha_samples"] = [[x, y, int(a[y, x])] for x, y, _ in gate["passage_floor_alpha_samples_final"]]
        if "final_contour_fits" in row:
            row["geometry_warning"] = any(abs(abs(f["slope"])-.5) > .03 for f in row["final_contour_fits"])
            row["geometry_warning"] |= row.get("ratio_relative_error", 0) > .1
        else:
            row["geometry_warning"] = None
        records.append(row)

result = {
    "revision": 4,
    "checked": "2026-09-30",
    "records": records,
    "errors": errors,
}
(HERE / "asset-audit.json").write_text(
    json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
)
print(f"checked={len(records)} errors={len(errors)}")
raise SystemExit(bool(errors))

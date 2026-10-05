#!/usr/bin/env python3
"""AR-83 pixel and manifest contract; no source images are required to check.

Usage: python3 tools/map/tiles/check_tiles.py [directory] [--json]
       python3 tools/map/tiles/check_tiles.py --self-test
Dependencies: Pillow, numpy, PyYAML. Pixel values below are in [0, 255].
"""
import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
TILES = {"water", "lake", "plain", "grassland", "desert", "plateau"}
STRIPS = {"coast", "lakeshore", "river", "road", "region"}
# 2.5 is the task's independent-audit ceiling. Stricter seam and band tests
# catch a duplicated boundary column surrounded by a visibly abrupt repair.
MEDIAN_FACTOR = 2.5
SEAM_FACTOR = 1.0
BAND_FACTOR = 1.75  # > pi/2: a seamless sine's peak slope / mean slope
BAND = 16
PROFILE_CORR = 0.995
PROFILE_MAE = 1.0
PROFILE_P95 = 3.0
EPS = 1e-9  # numerical division guard only, not an 8-bit error allowance


def scalar_diff(a, b):
    return np.mean(np.abs(a.astype(float) - b.astype(float)), axis=-1)


def stats(values):
    return {"mean": float(np.mean(values)), "p95": float(np.percentile(values, 95)),
            "median": float(np.median(values))}


def correlate(a, b):
    if np.std(a) < EPS or np.std(b) < EPS:
        return 1.0 if np.array_equal(a, b) else 0.0
    return float(np.corrcoef(a, b)[0, 1])


def render_views(a):
    rgb, alpha = a[..., :3].astype(float), a[..., 3:4].astype(float) / 255
    # Raw RGB at alpha=0 has no rendered meaning. Premultiplication prevents
    # those padding colours from generating false near-seam gradients.
    rgba = np.concatenate((rgb * alpha, a[..., 3:4].astype(float)), axis=-1)
    return [rgb * alpha + bg * (1 - alpha) for bg in (0, 238)] + [rgba]


def seam_metrics(a, tile):
    """Actually tile 2x2/3x1; check both wrap and a 16px seam neighbourhood."""
    h, w = a.shape[:2]
    result, errors = {}, []
    for view_index, view in enumerate(render_views(a)):
        repeat = np.tile(view, (2 if tile else 1, 2 if tile else 3, 1))
        for axis, name in ((1, "lr"), (0, "tb")) if tile else ((1, "lr"),):
            gradient = scalar_diff(np.take(view, range(1, view.shape[axis]), axis=axis),
                                   np.take(view, range(view.shape[axis] - 1), axis=axis))
            # Transparent padding is not part of a strip's internal brush texture.
            if tile:
                internal = gradient.ravel()
            else:
                visible = np.maximum(a[:, 1:, 3], a[:, :-1, 3]) > 0
                internal = gradient[visible]
            if not internal.size:
                errors.append("empty brush")
                continue
            n = w if axis == 1 else h
            left = np.take(repeat, n - 1, axis=axis)
            right = np.take(repeat, n, axis=axis)
            seam = scalar_diff(left, right)
            region = np.take(repeat, range(n - BAND, n + BAND), axis=axis)
            near = scalar_diff(np.take(region, range(1, 2 * BAND), axis=axis),
                               np.take(region, range(2 * BAND - 1), axis=axis))
            if not tile:
                alpha_region = np.take(np.tile(a[..., 3], (1, 3)),
                                       range(n - BAND, n + BAND), axis=1)
                near = near[np.maximum(alpha_region[:, 1:], alpha_region[:, :-1]) > 0]
            si, ss, sb = stats(internal), stats(seam), stats(near)
            key = f"view{view_index}_{name}"
            result[key] = {"internal": si, "seam": ss, "band": sb,
                           "wrap_median_ratio": ss["mean"] / max(si["median"], EPS)}
            for metric in ("mean", "p95"):
                if ss[metric] > SEAM_FACTOR * si[metric] + EPS:
                    errors.append(f"{key} seam {metric} exceeds internal")
                if sb[metric] > BAND_FACTOR * si[metric] + EPS:
                    errors.append(f"{key} seam neighbourhood {metric} too sharp")
            if ss["mean"] > MEDIAN_FACTOR * si["median"] + EPS:
                errors.append(f"{key} wrap exceeds 2.5 × internal median")
    return result, errors


def measured_width(a):
    """Median number of rows with alpha >=128 across every column."""
    return int(round(float(np.median(np.sum(a[..., 3] >= 128, axis=0)))))


def pixel_check(a, role):
    tile = role == "tile"
    metrics, errors = seam_metrics(a, tile)
    if tile:
        return metrics, errors
    if np.any(a[[0, -1], :, 3]):
        errors.append("top/bottom alpha must be exactly zero")
    if np.min(np.max(a[..., 3], axis=0)) < 32:
        errors.append("brush is missing or invisible in at least one column")
    if measured_width(a) < 2:
        errors.append("brush has no opaque core")
    profiles = {"alpha": a[..., 3].astype(float)}
    weights = np.array([0.2126, 0.7152, 0.0722])
    for i, view in enumerate(render_views(a)[:2]):
        profiles[f"grey{i}"] = view @ weights
    for name, profile in profiles.items():
        l, r = profile[:, 0], profile[:, -1]
        diff = np.abs(l - r)
        metric = {"corr": correlate(l, r), "mae": float(diff.mean()),
                  "p95": float(np.percentile(diff, 95))}
        metrics[name] = metric
        if metric["corr"] < PROFILE_CORR or metric["mae"] > PROFILE_MAE or metric["p95"] > PROFILE_P95:
            errors.append(f"{name} end profiles disagree")
    return metrics, errors


def check_directory(directory):
    data = yaml.safe_load((directory / "manifest.yaml").read_text(encoding="utf-8"))
    entries = data.get("assets") if isinstance(data, dict) else data
    if not isinstance(entries, list) or not entries:
        raise ValueError("manifest must contain a nonempty list")
    errors, results, counts, widths = [], {}, defaultdict(int), defaultdict(set)
    files, ids, hashes = set(), set(), set()
    contacts = 0
    for e in entries:
        name = e["file"]
        path = directory / name
        if Path(name).name != name or not name.endswith(".png"):
            errors.append(f"invalid local PNG filename: {name}")
            continue
        if name in files or e["id"] in ids:
            errors.append(f"duplicate file/ID: {name}")
        files.add(name)
        ids.add(e["id"])
        if e.get("status") != "candidate":
            errors.append(f"{name}: status must be candidate")
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != e.get("sha256") or digest in hashes:
            errors.append(f"{name}: SHA mismatch or duplicate bitmap")
        hashes.add(digest)
        with Image.open(path) as im:
            if e.get("size") != f"{im.width}x{im.height}" or im.format != "PNG":
                errors.append(f"{name}: incorrect size/format metadata")
            if e.get("role") == "contact_sheet":
                contacts += 1
                if "tile" in e or "strip" in e or name != "_contact_sheet.png":
                    errors.append("contact sheet must be excluded from runtime materials")
                continue
            if im.mode != "RGBA":
                errors.append(f"{name}: must be RGBA")
            a = np.array(im.convert("RGBA"))
        tile, strip = e.get("tile"), e.get("strip")
        if bool(tile) == bool(strip):
            errors.append(f"{name}: exactly one of tile/strip required")
            continue
        role, config = ("tile", tile) if tile else ("strip", strip)
        kind = config.get("kind")
        counts[(role, kind)] += 1
        h, w = a.shape[:2]
        if tile:
            if kind not in TILES or w != h or w not in (512, 1024):
                errors.append(f"{name}: invalid tile kind/dimensions")
            mode = config.get("alpha")
            if mode not in ("opaque", "translucent"):
                errors.append(f"{name}: invalid tile.alpha")
            if mode == "opaque" and np.any(a[..., 3] != 255):
                errors.append(f"{name}: opaque tile contains transparency")
            if mode == "translucent" and not np.any((a[..., 3] > 0) & (a[..., 3] < 255)):
                errors.append(f"{name}: translucent tile has no partial alpha")
            if np.max(np.std(a[..., :3].reshape(-1, 3), axis=0)) < 1 or np.max(a[..., 3]) == 0:
                errors.append(f"{name}: empty/flat material")
        else:
            if kind not in STRIPS or (w, h) not in ((1024, 128), (2048, 256)):
                errors.append(f"{name}: invalid strip kind/dimensions")
            width = config.get("width_px")
            if type(width) is not int or width != measured_width(a):
                errors.append(f"{name}: width_px disagrees with median alpha>=128 width")
            widths[kind].add(width)
            side = config.get("water_side")
            if side not in (("top", "bottom") if kind in ("coast", "lakeshore") else ("none",)):
                errors.append(f"{name}: incorrect water_side")
        metrics, problems = pixel_check(a, role)
        results[name] = metrics
        errors.extend(f"{name}: {p}" for p in problems)
    for role, kinds in (("tile", TILES), ("strip", STRIPS)):
        for kind in sorted(kinds):
            if not 2 <= counts[(role, kind)] <= 3:
                errors.append(f"{role}.{kind}: require 2–3 assets")
            if role == "strip" and len(widths[kind]) < 2:
                errors.append(f"strip.{kind}: require at least two distinct widths")
    if contacts != 1:
        errors.append("exactly one contact sheet required")
    allowed = files | {"manifest.yaml", "README.md"}
    extras = sorted(p.name for p in directory.iterdir() if p.name not in allowed)
    if extras:
        errors.append(f"unregistered files/directories: {extras}")
    return {"assets": len(entries), "counts": {f"{r}.{k}": v for (r, k), v in counts.items()},
            "metrics": results, "errors": errors}


def self_test():
    x = np.linspace(0, 2 * np.pi, 512)
    y = np.linspace(0, 2 * np.pi, 128)
    signal = 175 + 20 * np.sin(x)[None, :] + 15 * np.sin(y)[:, None]
    good = np.zeros((128, 512, 4), dtype=np.uint8)
    good[..., :3] = np.round(signal)[..., None]
    good[..., 3] = 255
    strip = good.copy()
    strip[..., 3] = np.round(255 * np.exp(-((np.arange(128)[:, None] - 64) / 14) ** 2))
    strip[[0, -1], :, 3] = 0
    cases = [("periodic tile", good, "tile", True), ("periodic strip", strip, "strip", True)]
    for axis in (0, 1):
        bad = good.copy()
        if axis == 0:
            bad[-1, :, :3] = 0
        else:
            bad[:, -1, :3] = 0
        cases.append((f"broken tile axis{axis}", bad, "tile", False))
    bad = strip.copy()
    bad[:, -1, 3] = np.roll(bad[:, -1, 3], 18)
    cases.append(("shifted alpha profile", bad, "strip", False))
    bad = strip.copy()
    bad[:, -1, :3] = 0
    cases.append(("wrong grey profile", bad, "strip", False))
    bad = strip.copy()
    bad[0, :, 3] = 1
    cases.append(("nonzero top edge", bad, "strip", False))
    cases.append(("empty strip", np.zeros_like(strip), "strip", False))
    bad = good.copy()
    bad[:, 1:BAND, :3] = 0
    cases.append(("equal endpoints but abrupt near seam", bad, "tile", False))
    for name, sample, role, expected in cases:
        _, errors = pixel_check(sample, role)
        passed = not errors
        if passed != expected:
            raise AssertionError(f"{name}: expected {expected}, got {passed}; {errors}")
        print(f"PASS {name}: {'accept' if passed else 'reject'}")
    print(f"Self-test: {len(cases)} cases passed")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", nargs="?", type=Path, default=ROOT / "assets/default/map/tiles")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    try:
        result = check_directory(args.directory)
    except (OSError, ValueError, TypeError, KeyError, yaml.YAMLError) as exc:
        print(f"FAIL: {exc}")
        return 1
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        for error in result["errors"]:
            print("FAIL", error)
        print(f"{result['assets']} PNG; {result['counts']}; {len(result['errors'])} problems")
        seams, bands, profiles = [], [], []
        for metrics in result["metrics"].values():
            for key, value in metrics.items():
                if key.startswith("view"):
                    seams.append(value["seam"]["p95"])
                    bands.append(value["band"]["p95"] / max(value["internal"]["p95"], EPS))
                else:
                    profiles.append(value)
        if seams:
            print(f"Max seam P95={max(seams):.6f}; max near-seam/internal P95={max(bands):.6f}")
        if profiles:
            print(f"Min end corr={min(p['corr'] for p in profiles):.6f}; max end MAE={max(p['mae'] for p in profiles):.6f}")
    return bool(result["errors"])


if __name__ == "__main__":
    raise SystemExit(main())

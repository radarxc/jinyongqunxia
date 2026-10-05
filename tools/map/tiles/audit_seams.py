#!/usr/bin/env python3
"""Independent AR-83 wrap audit. Does not import checker/build functions.

Compare raw RGBA, RGB and light/dark composites. Every wrap mean and p95 must
be <=2.5 times the median internal neighbouring difference, including zero.
"""
import argparse
import json
from pathlib import Path

import numpy as np
import yaml
from PIL import Image


def audit(directory):
    entries = yaml.safe_load((directory / "manifest.yaml").read_text())
    if isinstance(entries, dict):
        entries = entries["assets"]
    results, failures = {}, []
    for entry in entries:
        if "tile" not in entry and "strip" not in entry:
            continue
        with Image.open(directory / entry["file"]) as im:
            if im.mode != "RGBA":
                failures.append(f"{entry['id']}: no RGBA")
            rgba = np.asarray(im.convert("RGBA"), dtype=np.float64)
        rgb, alpha = rgba[..., :3], rgba[..., 3:4] / 255
        views = {"rgba": rgba, "rgb": rgb,
                 "light": rgb * alpha + 238 * (1 - alpha), "dark": rgb * alpha}
        result = {}
        for label, pixels in views.items():
            for axis in ([0, 1] if "tile" in entry else [1]):
                internal = np.abs(np.diff(pixels, axis=axis)).mean(axis=-1)
                median = float(np.median(internal))
                seam = np.abs(np.take(pixels, 0, axis=axis) - np.take(pixels, -1, axis=axis)).mean(axis=-1)
                mean, p95 = float(np.mean(seam)), float(np.percentile(seam, 95))
                result[f"{label}_axis{axis}"] = {"internal_median": median,
                    "wrap_mean": mean, "wrap_p95": p95, "limit": 2.5 * median}
                if mean > 2.5 * median or p95 > 2.5 * median:
                    failures.append(f"{entry['id']}: {label} axis{axis} exceeds 2.5×median")
        if "strip" in entry and np.any(rgba[[0, -1], :, 3]):
            failures.append(f"{entry['id']}: top/bottom alpha nonzero")
        results[entry["id"]] = result
    if not results:
        failures.append("no materials audited")
    return {"checked": len(results), "results": results, "failures": failures}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    default = Path(__file__).resolve().parents[3] / "assets/default/map/tiles"
    parser.add_argument("directory", nargs="?", type=Path, default=default)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    try:
        result = audit(args.directory)
    except (OSError, ValueError, TypeError, KeyError, yaml.YAMLError) as exc:
        print(f"FAIL: {exc}")
        return 1
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Independent wrap audit: {result['checked']} materials, {len(result['failures'])} failures")
        for problem in result["failures"]:
            print("FAIL", problem)
    return bool(result["failures"])


if __name__ == "__main__":
    raise SystemExit(main())

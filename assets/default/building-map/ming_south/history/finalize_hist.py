#!/usr/bin/env python3
"""Archive and uniformly normalize the selected historical rerenders."""
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[5]
TMP = Path("/private/tmp/KIT-ming_south-hist-refs")
HISTORY = ROOT / "assets/default/building-map/ming_south/history"
CHOICES = {
    "bld_kit_ming_south_stable": 2,
    "tex_town_ming_south_city_gate__k4_r000_v01": 2,
    "tex_town_ming_south_city_gate__k6_r000_v01": 2,
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def alpha_bbox(image, threshold=2):
    alpha = image.getchannel("A").point(lambda value: 255 if value >= threshold else 0)
    box = alpha.getbbox()
    if box is None:
        raise ValueError("empty alpha")
    return box


def asset_entries():
    for kind in ("building-map", "tile"):
        base = ROOT / "assets/default" / kind / "ming_south"
        entries = yaml.safe_load((base / "manifest.yaml").read_text())
        for entry in entries:
            yield base, entry


def main():
    for folder in ("guides", "selected-sources", "records"):
        (HISTORY / folder).mkdir(parents=True, exist_ok=True)
    for base, entry in asset_entries():
        asset_id = entry["id"]
        candidate = CHOICES.get(asset_id, 1)
        record_path = TMP / "runs" / asset_id / f"c{candidate}" / "record.json"
        record = json.loads(record_path.read_text())
        if record["returncode"] != 0 or len(record["outputs"]) != 1:
            raise ValueError(f"bad generation record: {asset_id}")
        final_path = base / entry["file"]
        guide_path = HISTORY / "guides" / f"{asset_id}.png"
        source_path = HISTORY / "selected-sources" / f"{asset_id}.png"
        archived_record = HISTORY / "records" / f"{asset_id}.json"
        if not guide_path.exists():
            shutil.copy2(final_path, guide_path)
        shutil.copy2(record["outputs"][0], source_path)

        old = Image.open(guide_path).convert("RGBA")
        source = Image.open(source_path).convert("RGBA")
        old_box, source_box = alpha_bbox(old), alpha_bbox(source)
        old_w, old_h = old_box[2] - old_box[0], old_box[3] - old_box[1]
        src_w, src_h = source_box[2] - source_box[0], source_box[3] - source_box[1]
        scale = min(old_w / src_w, old_h / src_h)
        crop = source.crop(source_box)
        new_size = (max(1, round(src_w * scale)), max(1, round(src_h * scale)))
        resized = crop.resize(new_size, Image.Resampling.LANCZOS)
        old_center = (old_box[0] + old_box[2]) / 2
        paste_x = round(old_center - new_size[0] / 2)
        paste_y = old_box[3] - new_size[1]
        if paste_x < 0 or paste_y < 0 or paste_x + new_size[0] > old.width:
            raise ValueError(f"normalized image exceeds canvas: {asset_id}")
        canvas = Image.new("RGBA", old.size, (0, 0, 0, 0))
        canvas.alpha_composite(resized, (paste_x, paste_y))
        canvas.save(final_path, optimize=True)

        finished = dict(record)
        finished.update({
            "selected_candidate": candidate,
            "candidate_count": 2 if asset_id in CHOICES else 1,
            "guide_archive": str(guide_path.relative_to(ROOT)),
            "guide_sha256": sha(guide_path),
            "selected_source_archive": str(source_path.relative_to(ROOT)),
            "selected_source_sha256": sha(source_path),
            "normalization": {
                "alpha_threshold_for_bbox": 2, "source_bbox": source_box,
                "guide_bbox": old_box, "uniform_scale": scale,
                "resized_size": new_size, "paste_offset": [paste_x, paste_y],
                "canvas_size": old.size, "horizontal_alignment": "guide bbox center",
                "vertical_alignment": "guide bbox bottom",
                "excluded": "no warp, anisotropic scale, repaint, flip, or alpha threshold rewrite",
            },
            "final_file": str(final_path.relative_to(ROOT)),
            "final_sha256": sha(final_path),
            "finalized_at": datetime.now(timezone.utc).isoformat(),
        })
        archived_record.write_text(json.dumps(finished, ensure_ascii=False, indent=2) + "\n")
        print(asset_id, old.size, new_size, sha(final_path))


if __name__ == "__main__":
    main()

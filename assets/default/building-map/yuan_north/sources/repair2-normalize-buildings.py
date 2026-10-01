"""Round 2 only: reconstruct these two sprites from their measured metadata.

Default verifies in-memory PNG hashes. --write replaces these two outputs only.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import sys
import yaml
from PIL import Image

BASE = Path(__file__).resolve().parents[1]
for suffix in ("market_stall", "temple_hall"):
    asset_id = "bld_kit_yuan_north_" + suffix
    entry = yaml.safe_load((BASE / "meta" / (asset_id + ".entry.yaml")).read_text())
    assert entry["repair_round"] == 2
    proc = entry["processing"]
    src = BASE / entry.get("source_archive", proc.get("source_archive"))
    source_hash = entry.get("source_sha256", proc.get("source_sha256"))
    assert hashlib.sha256(src.read_bytes()).hexdigest() == source_hash
    image = Image.open(src).convert("RGBA").crop(proc["crop_box"])
    image = image.resize(proc["resized_size"], Image.Resampling.LANCZOS)
    out = Image.new("RGBA", entry["pixel_qa"]["size"], (0, 0, 0, 0))
    out.paste(image, tuple(proc["paste_offset"]))
    buf = BytesIO()
    out.save(buf, format="PNG")
    assert hashlib.sha256(buf.getvalue()).hexdigest() == entry["sha256"]
    if "--write" in sys.argv:
        (BASE / entry["file"]).write_bytes(buf.getvalue())
    print(asset_id + ": reproducible SHA256 " + entry["sha256"])

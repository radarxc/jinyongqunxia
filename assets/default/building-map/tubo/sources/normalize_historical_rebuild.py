"""Normalize the 2026-10-01 historical rebuild without repainting it."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TILE = ROOT.parents[1] / "tile/tubo"
INPUT = Path("/private/tmp/KIT-tubo-codex-home/generated_images")
MAP = json.loads((ROOT / "sources/historical-rebuild-map.json").read_text())


def normalize(source, target, short_side, margin):
    im = Image.open(source).convert("RGBA")
    alpha = im.getchannel("A")
    # Discard generated ambient haze; retain antialiasing at the real silhouette.
    mask = alpha.point(lambda value: 255 if value >= 16 else 0)
    box = mask.getbbox()
    crop = im.crop(box)
    crop.putalpha(crop.getchannel("A").point(
        lambda value: 0 if value < 16 else (255 if value > 248 else value)))
    scale = short_side / min(crop.size)
    size = tuple(round(value * scale) for value in crop.size)
    crop = crop.resize(size, Image.Resampling.LANCZOS)
    crop.putalpha(crop.getchannel("A").point(
        lambda value: 0 if value < 4 else (255 if value > 248 else value)))
    out = Image.new("RGBA", (size[0] + 2 * margin, size[1] + 2 * margin))
    out.paste(crop, (margin, margin))
    target.parent.mkdir(parents=True, exist_ok=True)
    out.save(target, optimize=True)
    return {"source_size": list(im.size), "crop_box_alpha16": list(box),
            "uniform_scale": scale, "final_size": list(out.size),
            "margin_px": margin}


if __name__ == "__main__":
    result = {}
    for asset, spec in MAP.items():
        base = TILE if asset.startswith("tex_") else ROOT
        source = INPUT / spec["generated"]
        archive_dir = (TILE / "source/historical-rebuild" if asset.startswith("tex_")
                       else ROOT / "sources/historical-rebuild")
        archive_dir.mkdir(parents=True, exist_ok=True)
        archive = archive_dir / f"{asset}__raw.png"
        archive.write_bytes(source.read_bytes())
        result[asset] = normalize(source, base / f"{asset}.png",
                                  spec["short_side"], spec["margin"])
        result[asset]["raw_archive"] = str(archive.relative_to(base))
    (ROOT / "sources/historical-rebuild-normalization.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n")

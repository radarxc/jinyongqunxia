from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
import hashlib, json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SRC = ROOT / "review3/gate_k4_candidate2.png"
source = Image.open(SRC).convert("RGBA")
alpha = source.getchannel("A")

# Widen only the transparent opening, parallel to the measured frontage axis.
trimmed = alpha
for dx in range(-8, 8):
    dy = round(dx * 287 / 550)
    shifted = alpha.transform(alpha.size, Image.Transform.AFFINE,
                              (1, 0, dx, 0, 1, dy),
                              Image.Resampling.BILINEAR, fillcolor=255)
    trimmed = ImageChops.darker(trimmed, shifted)
mask = Image.new("L", source.size, 0)
ImageDraw.Draw(mask).polygon(
    [(220, 940), (220, 740), (260, 650), (330, 610),
     (430, 610), (505, 660), (555, 750), (565, 1080), (470, 1080)],
    fill=255)
corrected_alpha = Image.composite(trimmed, alpha, mask)
corrected = source.copy()
corrected.putalpha(corrected_alpha)
source_copy = HERE / "gate_k4_corrected.png"
corrected.save(source_copy)

bbox = corrected_alpha.point(lambda p: 255 if p >= 2 else 0).getbbox()
crop = [max(0, bbox[0]-2), max(0, bbox[1]-2),
        min(corrected.width, bbox[2]+2), min(corrected.height, bbox[3]+2)]
scale = 256 / 550
cut = corrected.crop(crop)
cut = cut.resize((round(cut.width*scale), round(cut.height*scale)),
                 Image.Resampling.LANCZOS)
final = Image.new("RGBA", (cut.width+32, cut.height+32))
final.paste(cut, (16, 16))
dest = ROOT / "tex_town_qing_south_city_gate__k4_r000_v01.png"
final.save(dest)

sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
front_vector = (550, 287)
passage_vector = (275, 143)
projected_cells = 8 * sum(a*b for a, b in zip(passage_vector, front_vector)) / sum(v*v for v in front_vector)
record = {"source_size": list(source.size), "source_corners_px":
          {"left":[117,831], "front":[667,1118], "right":[939,971]},
          "source_passage_endpoints_px": [[253,902],[528,1045]],
          "passage_cells_x_calibrated": 4.0,
          "passage_cells_vector_projection": projected_cells,
          "pier_cells_x_calibrated": [8*136/550, 8*139/550],
          "depth_cells_x_calibrated": 8*272/550,
          "endpoint_uncertainty_px": 5, "strict_gate_contract_pass": True,
          "crop_box": crop, "uniform_scale": scale, "padding_px": 16,
          "source_anchor_px": [528.0, 901.0],
          "anchor_px": [225.92, 359.9709],
          "source_sha256": sha(source_copy), "final_size": list(final.size),
          "final_sha256": sha(dest)}
(HERE / "gate_k4_measurement.json").write_text(
    json.dumps(record, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(record, ensure_ascii=False))

"""Re-select the least-deviating archived k4 gate; geometry stays uniform."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source/tex_town_liao_jin_north_city_gate__k4_r000_v01.repair3-candidate2.png"
TARGET = ROOT / "tex_town_liao_jin_north_city_gate__k4_r000_v01.png"
LEFT = (38, 842)
FRONT = (856, 1218)
RIGHT = (1249, 977)
FOOTPRINT = (8, 4)

im = Image.open(SOURCE).convert("RGBA")
# Alpha=1 edge noise is not part of the visible object; keep all source pixels intact.
visible_box = im.getchannel("A").point(lambda a: 255 if a >= 2 else 0).getbbox()
crop = im.crop(visible_box)
scale = 32 * sum(FOOTPRINT) / (RIGHT[0] - LEFT[0])
resized_size = tuple(round(v * scale) for v in crop.size)
resized = crop.resize(resized_size, Image.Resampling.LANCZOS)
canvas = (resized.width + 32, resized.height + 32)
offset = (16, 16)
out = Image.new("RGBA", canvas, (0, 0, 0, 0))
out.paste(resized, offset)
out.save(TARGET)
print(TARGET, out.size, visible_box, scale)

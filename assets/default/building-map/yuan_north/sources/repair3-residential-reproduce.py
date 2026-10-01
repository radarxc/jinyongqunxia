"""Round 3 selected sprites: verify pure-geometric normalization and source SHA."""
from pathlib import Path
from io import BytesIO
import hashlib
import yaml
from PIL import Image

BASE = Path(__file__).resolve().parents[1]
for suffix in ('house', 'courtyard', 'inn', 'shop_1f'):
    asset_id = 'bld_kit_yuan_north_' + suffix
    entry = yaml.safe_load((BASE / 'meta' / (asset_id + '.entry.yaml')).read_text())
    assert entry['repair_round'] == 3
    source = BASE / entry['source_archive']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['source_sha256']
    proc = entry['processing']
    im = Image.open(source).convert('RGBA').crop(proc['crop_box'])
    im = im.resize(proc['resized_size'], Image.Resampling.LANCZOS)
    out = Image.new('RGBA', entry['pixel_qa']['size'])
    out.paste(im, tuple(proc['paste_offset']))
    buf = BytesIO()
    out.save(buf, format='PNG')
    assert hashlib.sha256(buf.getvalue()).hexdigest() == entry['sha256']
    assert hashlib.sha256((BASE / entry['file']).read_bytes()).hexdigest() == entry['sha256']
    print(asset_id + ': reproducible SHA256 ' + entry['sha256'])

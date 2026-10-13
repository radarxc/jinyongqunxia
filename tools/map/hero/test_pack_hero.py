import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('pack_hero', HERE / 'pack_hero.py')
pack = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pack)


def frames(root, key, created='2026-10-11T00:00:00Z', yaw=-70):
    folder = root / key
    folder.mkdir(parents=True)
    for name in [*(f'{clip}_{k:02d}.png' for clip in ('walk', 'run') for k in range(2)), 'idle.png']:
        im = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        ImageDraw.Draw(im).rectangle((20, 8, 40, 60), fill=(90, 110, 90, 255))
        im.save(folder / name)
    (folder / 'meta.json').write_text(json.dumps({'key': key, 'model': f'm/{key}.glb', 'modelSha256': '0' * 64,
        'harness': 'h.html', 'harnessSha256': '1' * 64, 'size': 64, 'yaw': yaw, 'elevation': 12, 'frames': 2,
        'cycleSeconds': {'walk': 1.0, 'run': 0.5}, 'anchor': [30, 60], 'created': created}), encoding='utf-8')


class PackHeroTest(unittest.TestCase):
    def test_packs_both_variants_with_one_crop_and_facing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); frames(root, 'male'); frames(root, 'female', yaw=70)
            built, images, index = pack.build(root)
            self.assertEqual(sorted(images), sorted(f'map_hero_{k}_{c}.webp' for k in ('male', 'female')
                                                    for c in ('walk', 'run', 'idle')))
            variants = json.loads(index)['variants']
            self.assertEqual((variants['male']['facing'], variants['female']['facing']), ('left', 'right'))
            self.assertEqual(variants['male']['frameHeight'], pack.FRAME_HEIGHT)
            # Manifest text depends only on the frames (render time included), so --check can compare it.
            self.assertEqual(pack.manifest(built), pack.manifest(pack.build(root)[0]))

    def test_refuses_a_missing_variant_or_mixed_render_batches(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); frames(root, 'male')
            with self.assertRaises(SystemExit):
                pack.build(root)
            frames(root, 'female', created='2026-10-12T00:00:00Z')
            with self.assertRaises(SystemExit):
                pack.build(root)


if __name__ == '__main__':
    unittest.main()

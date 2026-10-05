"""Template routing, limits and real packaging contract (abstract test pixels only)."""
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

import yaml

from _test_fixture import write_fixture
from build_demo import build_template_demo
from templates import make_template, shape_for, template_params
from validation import VFXError, check_html, load_yaml, save_yaml, validate_schema


class TemplateTests(unittest.TestCase):
    def test_delivery_shapes_and_visual_limits(self):
        for delivery, emitter, shape in [('palm', 'palm', 'fan'), ('finger', 'finger', 'beam'),
                ('weapon', 'sword', 'beam'), ('weapon', 'staff', 'impact'),
                ('fist-grapple', 'fist', 'impact'), ('sonic', 'instrument', 'rings')]:
            self.assertEqual(shape_for('qi_projection', delivery, emitter), shape)
        self.assertEqual(shape_for('plain_strike', 'palm', 'palm'), 'wave')
        self.assertEqual(shape_for('plain_strike', 'weapon', 'sabre'), 'arc')
        self.assertEqual(shape_for('plain_strike', 'leg', 'leg'), 'impact')
        for emitter, shape in [('sword', 'arc'), ('sabre', 'arc'), ('staff', 'arc'),
                ('spear', 'arc'), ('whip', 'arc'), ('fan', 'arc'),
                ('palm', 'wave'), ('fist', 'impact'), ('leg', 'impact')]:
            self.assertEqual(shape_for('plain_strike', 'unknown', emitter), shape)
        self.assertIsNone(shape_for('afterimage', 'movement', 'afterimage'))
        self.assertEqual(template_params('plain_strike')['duration_s'], 0.32)
        for params in [{'duration': 0.401}, {'duration': float('nan')}]:
            with self.assertRaises(VFXError):
                template_params('plain_strike', **params)
        for params in [{'copies': 2}, {'copies': 4.5}, {'spacing': 0}, {'stretch': 0.11}]:
            with self.assertRaises(VFXError):
                template_params('afterimage', **params)

    def test_afterimage_build_without_composition_or_effect(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_fixture(root)
            output = root / 'demo.html'
            result = build_template_demo('afterimage', 'palm', 'yin', 'palm', output,
                emitter_path=root / 'emitter/emitter-plate.yaml')
            self.assertEqual(result['source_frames'], 0)
            self.assertLessEqual(result['bytes'], 3_000_000)
            comp = json.loads(output.with_suffix('.json').read_text())
            validate_schema(comp, 'TemplateComposition')
            self.assertIsNone(comp['effect'])
            self.assertEqual(comp['template']['params']['copies'], 4)
            self.assertAlmostEqual(sum(comp['rhythm'].values()), 0.48)
            self.assertEqual(check_html(output)['inline_scripts_checked'], 1)
            match = re.search(r'<script id="vfx-data" type="application/json">(.*?)</script>',
                              output.read_text(), re.S)
            self.assertEqual(json.loads(match[1])['effectFrames'], [])
            with self.assertRaisesRegex(VFXError, '真实发出方'):
                make_template('afterimage', 'none')

    def test_cli_uses_shared_emitter_plate_without_explicit_path(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_fixture(root)
            shared = root / 'assets/default/vfx/emitters/palm'
            shutil.copytree(root / 'emitter', shared)
            output = root / 'cli-demo.html'
            # Run the real CLI with only its shared-pool root redirected to a fixture.
            launcher = ('import runpy, sys\nfrom pathlib import Path\nimport templates\n'
                        'templates.ROOT = Path(sys.argv.pop(1))\n'
                        'sys.argv[0] = "build_demo.py"\n'
                        'runpy.run_path(sys.argv[0], run_name="__main__")\n')
            result = subprocess.run(
                [sys.executable, '-c', launcher, str(root), '--template', 'afterimage',
                 '--emitter', 'palm', '--nature', 'yin', '--delivery', 'palm',
                 '--output', str(output)], cwd=Path(__file__).resolve().parent,
                capture_output=True, text=True, check=False)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)['source_frames'], 0)
            comp = json.loads(output.with_suffix('.json').read_text())
            self.assertEqual(comp['emitter'], load_yaml(shared / 'emitter-plate.yaml'))
            self.assertEqual(check_html(output)['inline_scripts_checked'], 1)

    def test_unknown_delivery_from_actual_bindings_through_api_and_cli(self):
        repo = Path(__file__).resolve().parents[2]
        bindings = {row['move']: row for row in yaml.safe_load(
            (repo / 'assets/default/vfx/bindings.yaml').read_text())}
        cases = [('mv_baicaobiandu_shiye', 'afterimage', None, 0),
                 ('mv_baicaobianyao_fuyao', 'plain_strike', 'arc', 3)]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_fixture(root)
            destination = root / 'plain_strike/arc'
            shutil.copytree(root / 'effect', destination)
            metadata = load_yaml(destination / 'effect-set.yaml')
            metadata['style'] = 'plain_strike'
            metadata['frames'] = metadata['frames'][:3]
            metadata['source']['rects'] = metadata['source']['rects'][:3]
            for index, frame in enumerate(metadata['frames']):
                frame['phase'] = index / 2
            save_yaml(destination / 'effect.yaml', metadata)
            emitter_path = root / 'emitter/emitter-plate.yaml'
            for move, mode, shape, count in cases:
                with self.subTest(move=move):
                    row = bindings[move]
                    self.assertEqual((row['template'], row['delivery'], row['emitter']),
                                     (mode, 'unknown', 'sword'))
                    comp, plate, frames = make_template(mode, row['emitter'],
                        row['nature'], row['delivery'], emitter_path=emitter_path,
                        template_root=root)
                    self.assertIsNotNone(plate)
                    self.assertEqual(len(frames), count)
                    self.assertEqual(comp['template']['shape'], shape)
                    self.assertEqual(comp['template']['delivery'], 'unknown')
                    output = root / f'{move}.html'
                    result = subprocess.run([sys.executable, str(repo / 'tools/vfx/build_demo.py'),
                        '--template', row['template'], '--emitter', row['emitter'],
                        '--nature', row['nature'], '--delivery', row['delivery'],
                        '--emitter-path', str(emitter_path), '--template-root', str(root),
                        '--output', str(output)], capture_output=True, text=True, check=False)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(json.loads(result.stdout)['source_frames'], count)
                    packed = json.loads(output.with_suffix('.json').read_text())
                    self.assertEqual(packed['template']['shape'], shape)
                    self.assertEqual(packed['template']['delivery'], 'unknown')
                    self.assertEqual(check_html(output)['inline_scripts_checked'], 1)

    def test_qi_palette_snapshot_and_plain_normal_blend(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_fixture(root)
            palette = root / 'palette.yaml'
            save_yaml(palette, {'colors': {'yang': '#D9483B', 'neutral': '#F4F4F4'}})
            for mode, count in [('qi_projection', 4), ('plain_strike', 3)]:
                destination = root / mode / ('fan' if count == 4 else 'wave')
                shutil.copytree(root / 'effect', destination)
                metadata = load_yaml(destination / 'effect-set.yaml')
                metadata['style'] = mode
                metadata['frames'] = metadata['frames'][:count]
                metadata['source']['rects'] = metadata['source']['rects'][:count]
                for index, frame in enumerate(metadata['frames']):
                    frame['phase'] = index / (count - 1)
                save_yaml(destination / 'effect.yaml', metadata)
                comp, plate, frames = make_template(mode, 'none', 'yang', 'palm',
                    template_root=root, palette_path=palette)
                self.assertIsNone(plate)
                self.assertEqual(comp['template']['color'], '#D9483B')
                self.assertEqual(len(frames), count)
                self.assertEqual(comp['effect']['blend'], 'screen' if count == 4 else 'normal')
                result = build_template_demo(mode, 'none', 'yang', 'palm', root / f'{mode}.html',
                    template_root=root, palette_path=palette)
                self.assertEqual(result['source_frames'], count)
                self.assertLessEqual(result['bytes'], 3_000_000)


if __name__ == '__main__':
    unittest.main()

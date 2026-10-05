"""统一模板配置与单张静态预览；动效和调色由 Three.js 执行。"""
from __future__ import annotations

import math
from pathlib import Path
import re

import numpy as np
from PIL import Image

try:
    from .imaging import blend, from_premultiplied, rotation, srgb_decode, to_premultiplied, warp
    from .validation import ROOT, VFXError, load_yaml, resolve_path, validate_document, validate_schema
except ImportError:
    from imaging import blend, from_premultiplied, rotation, srgb_decode, to_premultiplied, warp
    from validation import ROOT, VFXError, load_yaml, resolve_path, validate_document, validate_schema

MODES = ('qi_projection', 'afterimage', 'plain_strike')
EMITTERS = ('palm', 'finger', 'fist', 'sword', 'sabre', 'staff', 'spear', 'whip',
            'fan', 'none', 'afterimage', 'leg', 'throw', 'instrument')
NATURES = ('yin', 'yang', 'harmony', 'neutral')
DELIVERIES = ('palm', 'finger', 'fist', 'fist-grapple', 'weapon', 'inner',
              'movement', 'leg', 'throw', 'sonic', 'unknown')
TEMPLATE_ROOT = ROOT / 'assets/default/vfx/templates'
PALETTE = ROOT / 'docs/design/vfx/palette.yaml'


def shape_for(mode: str, delivery: str, emitter: str) -> str | None:
    if mode == 'afterimage':
        return None
    if mode == 'plain_strike':
        if delivery == 'unknown':
            # Preserve the catalog's unknown action; only infer its visual shape.
            if emitter in ('sword', 'sabre', 'staff', 'spear', 'whip', 'fan'):
                return 'arc'
            return 'wave' if emitter == 'palm' else 'impact'
        return 'wave' if delivery == 'palm' else 'arc' if delivery == 'weapon' else 'impact'
    if delivery == 'sonic' or emitter == 'instrument':
        return 'rings'
    if delivery == 'palm':
        return 'fan'
    return 'beam' if delivery == 'finger' or (delivery == 'weapon' and emitter == 'sword') else 'impact'


def template_params(mode: str, duration: float | None = None, copies: int = 4,
                    spacing: float = 28, stretch: float = 0.04) -> dict:
    if mode not in MODES:
        raise VFXError(f'未知模板：{mode}')
    duration = duration if duration is not None else {
        'qi_projection': 0.6, 'afterimage': 0.48, 'plain_strike': 0.32}[mode]
    if not math.isfinite(duration) or duration <= 0:
        raise VFXError('模板时长必须为有限正数')
    if mode == 'plain_strike' and duration > 0.4:
        raise VFXError('plain_strike 总时长不得超过 0.4 秒')
    params = {'duration_s': duration}
    if mode == 'afterimage':
        if type(copies) is not int or not 3 <= copies <= 5:
            raise VFXError('afterimage 份数必须为 3–5 的整数')
        if not math.isfinite(spacing) or spacing <= 0:
            raise VFXError('afterimage 间距必须为有限正数')
        if not math.isfinite(stretch) or not 0 <= stretch <= 0.1:
            raise VFXError('afterimage 单份拉伸系数须在 0–0.1')
        params.update(copies=copies, spacing_px=spacing, stretch=stretch)
    return params


def _emitter(emitter: str, path: Path | None) -> tuple[dict | None, Path | None]:
    if emitter == 'none':
        if path:
            raise VFXError('--emitter none 不接受 --emitter-path')
        return None, None
    path = path or ROOT / 'assets/default/vfx/emitters' / emitter / 'emitter-plate.yaml'
    path = path.resolve()
    if not path.is_file():
        raise VFXError(f'发出方素材不存在：{path}；请用 --emitter-path 指定现有 EmitterPlate YAML/PNG')
    if path.suffix.lower() in ('.yaml', '.yml'):
        metadata = validate_document(path)
        if metadata['kind'] != 'EmitterPlate':
            raise VFXError('--emitter-path YAML 必须是 EmitterPlate')
        return metadata, resolve_path(path, metadata['file'], path.parent)
    with Image.open(path) as image:
        if image.format != 'PNG' or image.mode != 'RGBA':
            raise VFXError('--emitter-path 图像必须为 RGBA PNG')
        width, height = image.size
    # Explicit PNG is a preview convenience; production must supply hand-placed anchors.
    return {'kind': 'EmitterPlate', 'version': 1, 'file': path.name,
            'size_px': [width, height], 'color_space': 'srgb', 'alpha_mode': 'straight',
            'category': 'weapon_hand', 'emit_point_px': [width * 0.75, height * 0.5],
            'direction': [1, 0], 'emission_width_px': height * 0.15}, path


def make_template(mode: str, emitter: str = 'palm', nature: str = 'neutral',
                  delivery: str = 'palm', emitter_path: Path | None = None,
                  template_root: Path = TEMPLATE_ROOT, palette_path: Path = PALETTE,
                  duration: float | None = None, copies: int = 4, spacing: float = 28,
                  stretch: float = 0.04) -> tuple[dict, Path | None, list[Path]]:
    if emitter not in EMITTERS or nature not in NATURES or delivery not in DELIVERIES:
        raise VFXError('发出方、内力性质或 delivery 不在模板枚举中')
    params = template_params(mode, duration, copies, spacing, stretch)
    colors = load_yaml(palette_path)['colors']
    color = colors.get(nature)
    if not isinstance(color, str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', color):
        raise VFXError(f'palette.colors.{nature} 必须为 #RRGGBB')
    plate, plate_file = _emitter(emitter, emitter_path)
    if mode == 'afterimage' and plate is None:
        raise VFXError('afterimage 需要真实发出方图，不能使用 none')
    shape = shape_for(mode, delivery, emitter)
    effect, frames = None, []
    if mode != 'afterimage':
        effect_path = (template_root / mode / shape / 'effect.yaml').resolve()
        effect = validate_document(effect_path, template_root)
        expected = (4,) if mode == 'qi_projection' else (2, 3)
        if effect['kind'] != 'EffectSet' or len(effect['frames']) not in expected:
            raise VFXError(f'{mode} 要求帧数 {expected}')
        effect['blend'] = 'normal' if mode == 'plain_strike' else 'screen'
        frames = [resolve_path(effect_path, frame['file'], template_root)
                  for frame in effect['frames']]
    comp = _composition(mode, emitter, nature, delivery, shape, color, params, plate, effect)
    validate_schema(comp, 'TemplateComposition')
    return comp, plate_file, frames


def _composition(mode: str, emitter: str, nature: str, delivery: str, shape: str | None,
                 color: str, params: dict, plate: dict | None, effect: dict | None) -> dict:
    duration = params['duration_s']
    scale = min(260 / plate['size_px'][0], 320 / plate['size_px'][1]) if plate else 1
    thickness = scale * plate['emission_width_px'] if plate else 1
    visual_height = 200 if mode == 'plain_strike' else 270
    transverse = visual_height / effect['size_px'][1] * effect['root_width_px'] / thickness if effect else 1
    ratios = (1 / 6, 7 / 30, 4 / 15, 1 / 3) if mode == 'qi_projection' else (0.18, 0.12, 0, 0.7)
    rhythm = dict(zip(('charge_s', 'release_s', 'sustain_s', 'dissipate_s'),
                      [duration * ratio for ratio in ratios]))
    return {'kind': 'TemplateComposition', 'version': 1,
            'template': {'mode': mode, 'nature': nature, 'delivery': delivery,
                         'shape': shape, 'color': color, 'params': params},
            'canvas_px': [1024, 512], 'background': '#282623',
            'emit_at_px': [300, 256], 'angle_deg': 0, 'emitter_scale': scale,
            'scale': [1, transverse], 'length_px': 240 if mode == 'plain_strike' else 560, 'range_hex': 0,
            'pixels_per_hex': 100, 'rhythm': rhythm,
            'transition': {'interpolation': 'crossfade', 'scale_from': 1,
                           'drift_fraction': 0, 'brightness': [1, 1, 1, 1, 1],
                           'directional_mask': {'enabled': False, 'softness': 0.08}},
            'output': {'fps': 20, 'optional_animation': 'none', 'peak_phase': 0.4 if mode == 'qi_projection' else 0.18,
                       'loop': True, 'loop_gap_s': 0.5, 'html_max_bytes': 3_000_000,
                       'preview_size_px': [1024, 512]}, 'effect': effect, 'emitter': plate}


def template_peak(comp: dict, emitter_file: Path | None, frame_files: list[Path]) -> Image.Image:
    """Reference static pose uses the same linear alpha tint as the WebGL shader."""
    canvas = comp['canvas_px']
    back = to_premultiplied(Image.new('RGBA', canvas, comp['background']))
    emit_at = np.array(comp['emit_at_px'])
    theta = math.radians(comp['angle_deg'])
    direction = np.array([math.cos(theta), math.sin(theta)])
    template = comp['template']
    phase = comp['output']['peak_phase']
    if emitter_file:
        plate = comp['emitter']
        with Image.open(emitter_file) as image:
            pixels = to_premultiplied(image)
        psi = math.atan2(plate['direction'][1], plate['direction'][0])
        base_matrix = comp['emitter_scale'] * rotation(theta - psi)
        anchor = np.array(plate['emit_point_px'])
        if template['mode'] == 'afterimage':
            params = template['params']
            for index in reversed(range(params['copies'])):
                stretch = 1 + (index + 1) * params['stretch']
                delta = np.eye(2) + (stretch - 1) * np.outer(direction, direction)
                matrix = delta @ base_matrix
                offset = (index + 1) * params['spacing_px']
                opacity = 0.44 * (1 - index / params['copies'] * 0.65)
                back = blend(back, warp(pixels * opacity, matrix,
                             emit_at + direction * offset - matrix @ anchor, canvas))
        back = blend(back, warp(pixels, base_matrix, emit_at - base_matrix @ anchor, canvas))
    if frame_files:
        effect = comp['effect']
        phases = [frame['phase'] for frame in effect['frames']]
        left = max(index for index, value in enumerate(phases) if value <= phase)
        right = min(left + 1, len(phases) - 1)
        mix = (phase - phases[left]) / (phases[right] - phases[left]) if right != left else 0
        phi = math.atan2(effect['direction'][1], effect['direction'][0])
        sx = comp['length_px'] / effect['reference_length_px'] * comp['scale'][0]
        thickness = comp['emitter_scale'] * comp['emitter']['emission_width_px'] if comp['emitter'] else 1
        sy = thickness / effect['root_width_px'] * comp['scale'][1]
        matrix = rotation(theta) @ np.diag([sx, sy]) @ rotation(-phi)
        aligned = []
        for index in (left, right):
            with Image.open(frame_files[index]) as image:
                pixels = to_premultiplied(image)
            aligned.append(warp(pixels, matrix,
                           emit_at - matrix @ np.array(effect['frames'][index]['anchor_px']), canvas))
        pixels = aligned[0] * (1 - mix) + aligned[1] * mix
        if template['mode'] == 'qi_projection':
            color = np.array([int(template['color'][i:i + 2], 16) for i in (1, 3, 5)]) / 255
            pixels[..., :3] = srgb_decode(color) * pixels[..., 3:4]
        back = blend(back, pixels, effect['blend'])
    return from_premultiplied(back)

#!/usr/bin/env python3
"""打包分离原料、Composition 和 Three.js 播放器；不合成或重采样动效帧。"""
from __future__ import annotations

import argparse
import base64
import copy
import html
import io
import json
from pathlib import Path
import re
import sys

from PIL import Image

try:
    from .compose import PeakRenderer
    from .validation import THREE_URL, VFXError, check_html, resolve_path
except ImportError:
    from compose import PeakRenderer
    from validation import THREE_URL, VFXError, check_html, resolve_path


def _json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')


def _image_uri(path: Path, ratio: float) -> str:
    with Image.open(path) as source:
        image = source.convert('RGBA')
    return _encode_image(image, ratio)


def _encode_image(image: Image.Image, ratio: float) -> str:
    size = tuple(max(1, round(value * ratio)) for value in image.size)
    if size != image.size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    stream = io.BytesIO()
    image.save(stream, format='WEBP', lossless=True, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(stream.getvalue()).decode('ascii')


def _runtime() -> str:
    directory = Path(__file__).with_name('web')
    modules = []
    for name in ('timeline.js', 'vfx_player.js'):
        source = (directory / name).read_text(encoding='utf-8')
        source = re.sub(r'^import\s+.*?\s+from\s+[\'"]\./timeline\.js[\'"];?\s*',
                        '', source, flags=re.M | re.S)
        source = re.sub(r'\bexport\s+(?=(?:function|const|let|class)\b)', '', source)
        if re.search(r'^\s*(?:import|export)\b', source, re.M):
            raise VFXError(f'{name}：不支持的模块语法；打包仅接受 timeline 内部导入与命名声明导出')
        modules.append(source)
    return '\n'.join(modules)


PAGE_START = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__ · Three.js 外放样例</title>
<style>
:root{color-scheme:dark;font:16px system-ui,sans-serif;background:#282623;color:#efe6d2}
body{max-width:1000px;margin:24px auto;padding:0 16px}h1{font-size:1.25rem}
canvas,#peak{max-width:100%;height:auto;width:100%;background:__BACKGROUND__}
canvas{display:none}#peak{display:block}#peak[hidden]{display:none}
.controls{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:18px 0}
button,select{font:inherit;padding:6px 12px}#status{font-size:.9rem}p{line-height:1.6}
</style>
<script type="importmap">__IMPORTMAP__</script></head><body>
<h1>__TITLE__</h1><img id="peak" alt="招式静态峰值" src="__PEAK__">
<canvas id="vfx" aria-label="外放招式预览"></canvas>
<div class="controls"><button id="play" type="button" disabled>播放</button>
<button id="pause" type="button" disabled>暂停</button>
<label>速度 <select id="speed"><option value="0.25">0.25×</option>
<option value="0.5">0.5×</option><option value="1" selected>1×</option>
<option value="2">2×</option></select></label>
<label><input id="reduce" type="checkbox">减少动态</label></div>
<p id="status" role="status">正在加载原料与 Three.js…</p>
<p>首屏展示静态峰值。图像与播放器已内嵌；首次打开需联网加载 Three.js r186。</p>
<script id="vfx-data" type="application/json">__PAYLOAD__</script>
<script type="module">
'''

PAGE_END = '''
const payload = JSON.parse(document.getElementById('vfx-data').textContent);
const status = document.getElementById('status');
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const reduced = document.getElementById('reduce');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
reduced.checked = preference.matches;
const loadImage = uri => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('内嵌图像无法解码'));
  image.src = uri;
});
try {
  const THREE = await import('three');
  const images = await Promise.all([payload.emitterImage, ...payload.effectFrames].map(loadImage));
  const player = createVfxPlayer(THREE, {canvas:document.getElementById('vfx'),
    composition:payload.composition, emitterImage:images[0], effectFrames:images.slice(1)});
  const peak = payload.composition.output.peak_phase * player.duration;
  const showPeak = () => { player.pause(); player.seek(peak); };
  player.onFrame = state => {
    status.textContent = `${state.stage} · ${state.time.toFixed(3)} / ${player.duration.toFixed(3)} 秒`;
  };
  playButton.disabled = reduced.checked;
  pauseButton.disabled = false;
  let started = false;
  playButton.addEventListener('click', () => {
    if (reduced.checked) return;
    if (!started) { player.seek(0); started = true; }
    player.play();
  });
  pauseButton.addEventListener('click', () => player.pause());
  player.setSpeed(Number(document.getElementById('speed').value));
  document.getElementById('speed').addEventListener('change', event => player.setSpeed(Number(event.target.value)));
  const applyReduction = () => {
    playButton.disabled = reduced.checked;
    if (reduced.checked) { showPeak(); started = false; }
  };
  reduced.addEventListener('change', applyReduction);
  preference.addEventListener('change', event => { reduced.checked = event.matches; applyReduction(); });
  window.addEventListener('pagehide', event => {
    if (event.persisted) player.pause(); else player.dispose();
  });
  showPeak();
  document.getElementById('vfx').style.display = 'block';
  document.getElementById('peak').hidden = true;
} catch (error) {
  status.textContent = `预览加载失败：${error.message}`;
}
</script></body></html>
'''


def build_demo(composition_path: str | Path, output: str | Path | None = None,
               suite_root: str | Path | None = None) -> dict:
    renderer = PeakRenderer(composition_path, suite_root)
    comp = copy.deepcopy(renderer.composition)
    if comp['output']['optional_animation'] != 'none':
        raise VFXError('Three.js 管线不再输出 Python 动图；optional_animation 必须为 none')
    comp.update(effect=renderer.effect, emitter=renderer.emitter)
    output = Path(output).resolve() if output else renderer.path.with_name('demo.html')
    json_path = renderer.path.with_suffix('.json')
    if output.suffix.lower() != '.html':
        raise VFXError('演示输出必须为 HTML')
    for target in (output, json_path):
        for source in renderer.input_paths:
            if target == source or (target.exists() and target.samefile(source)):
                raise VFXError(f'打包输出会覆盖原料：{target}')
    effect_path = resolve_path(renderer.path, comp['effect_set'], renderer.suite_root)
    emitter_path = resolve_path(renderer.path, comp['emitter_plate'], renderer.suite_root)
    emitter_file = resolve_path(emitter_path, comp['emitter']['file'], renderer.suite_root)
    frame_files = [resolve_path(effect_path, frame['file'], renderer.suite_root)
                   for frame in comp['effect']['frames']]
    runtime = _runtime()
    base_ratio = 1.0
    attempts = []
    peak = renderer.render_peak()
    for step in range(8):
        ratio = base_ratio * 0.8 ** step
        payload = {'composition': comp, 'emitterImage': _image_uri(emitter_file, ratio),
                   'effectFrames': [_image_uri(path, ratio) for path in frame_files]}
        replacements = {'__TITLE__': html.escape(comp['subject_ref']),
                        '__BACKGROUND__': comp['background'],
                        '__PEAK__': _encode_image(peak, ratio),
                        '__IMPORTMAP__': _json({'imports': {'three': THREE_URL}}),
                        '__PAYLOAD__': _json(payload)}
        page = PAGE_START
        for key, value in replacements.items():
            page = page.replace(key, value)
        encoded = (page + runtime + PAGE_END).encode('utf-8')
        attempts.append({'image_scale': ratio, 'bytes': len(encoded)})
        if len(encoded) <= comp['output']['html_max_bytes']:
            output.parent.mkdir(parents=True, exist_ok=True)
            # Check exact bytes before publishing either output.
            import tempfile
            with tempfile.TemporaryDirectory() as directory:
                candidate = Path(directory) / 'demo.html'
                _write_chunks(candidate, encoded.decode('utf-8'))
                checked = check_html(candidate, comp['output']['html_max_bytes'])
            _write_chunks(output, encoded.decode('utf-8'))
            _write_chunks(json_path, json.dumps(comp, ensure_ascii=False, indent=2) + '\n')
            return {'html': str(output), 'composition': str(json_path), 'bytes': len(encoded),
                    'source_frames': len(frame_files), 'image_scale': ratio,
                    'encoding': 'lossless-webp', 'attempts': attempts,
                    'inline_scripts_checked': checked['inline_scripts_checked']}
    raise VFXError(f'缩小预览后 HTML 仍超过 {comp["output"]["html_max_bytes"]} bytes：{attempts}')


def _write_chunks(path: Path, content: str) -> None:
    lines = content.splitlines(keepends=True)
    with path.open('w', encoding='utf-8') as stream:
        for offset in range(0, len(lines), 120):
            stream.writelines(lines[offset:offset + 120])


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('composition', type=Path, help='Composition YAML')
    parser.add_argument('--root', type=Path, help='素材套件根目录')
    parser.add_argument('--output', type=Path, help='默认 Composition 同级 demo.html')
    args = parser.parse_args(argv)
    try:
        print(json.dumps(build_demo(args.composition, args.output, args.root), ensure_ascii=False))
    except (VFXError, OSError, ValueError) as error:
        print(f'演示打包失败：{error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

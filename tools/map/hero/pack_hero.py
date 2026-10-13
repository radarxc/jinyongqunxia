#!/usr/bin/env python3
"""Pack the protagonist's world-map walk / run cycles and idle pose (AR-116, tech/13 §3.1).

Reads the frames render_hero.mjs wrote per protagonist variant (<frames>/male, <frames>/female), crops each
variant's frames with one shared box (so the figure never jumps), scales them to FRAME_HEIGHT with
premultiplied Lanczos and writes to assets/default/map/hero/:
  map_hero_<variant>_walk.webp   walk cycle, frames side by side, facing as in hero.json
  map_hero_<variant>_run.webp    run cycle (疾行), same layout
  map_hero_<variant>_idle.webp   standing pose
  hero.json                      per variant: frame size, ground anchor, facing, frame counts, cycle lengths
  manifest.yaml                  one entry per image (assets/README.md fields)

    python3 tools/map/hero/pack_hero.py .cache/map-hero           # write
    python3 tools/map/hero/pack_hero.py .cache/map-hero --check   # rebuild in memory, compare with disk
"""
import argparse
import hashlib
import shutil
import io
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'assets' / 'default' / 'map' / 'hero'
FRAME_HEIGHT = 256
MARGIN = 6  # transparent px kept around the shared crop box before scaling
SCHEMA = 'tianshu.map-hero.v1'
VARIANTS = ('male', 'female')
LABEL = {'male': '男', 'female': '女'}


def load(path):
    with Image.open(path) as im:
        return im.convert('RGBA')


def scale(im, size):
    return im.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')


def webp(im):
    buffer = io.BytesIO()
    im.save(buffer, 'WEBP', quality=92, alpha_quality=100, method=6, exact=False)
    return buffer.getvalue()


def build_variant(src):
    meta = json.loads((src / 'meta.json').read_text(encoding='utf-8'))
    clips = {clip: [load(src / f'{clip}_{k:02d}.png') for k in range(meta['frames'])] for clip in ('walk', 'run')}
    idle = load(src / 'idle.png')
    everything = [*clips['walk'], *clips['run'], idle]
    boxes = [im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox() for im in everything]
    if any(box is None for box in boxes):
        raise SystemExit(f'pack_hero: {src.name} has an empty frame (model failed to render?)')
    size = idle.width
    x0 = max(0, min(b[0] for b in boxes) - MARGIN); y0 = max(0, min(b[1] for b in boxes) - MARGIN)
    x1 = min(size, max(b[2] for b in boxes) + MARGIN); y1 = min(size, max(b[3] for b in boxes) + MARGIN)
    k = FRAME_HEIGHT / (y1 - y0)
    frame = (round((x1 - x0) * k), FRAME_HEIGHT)

    def strip_of(frames):
        strip = Image.new('RGBA', (frame[0] * len(frames), FRAME_HEIGHT), (0, 0, 0, 0))
        for index, im in enumerate(frames):
            strip.paste(scale(im.crop((x0, y0, x1, y1)), frame), (index * frame[0], 0))
        return strip

    key = meta['key']
    images = {f'map_hero_{key}_walk.webp': webp(strip_of(clips['walk'])),
              f'map_hero_{key}_run.webp': webp(strip_of(clips['run'])),
              f'map_hero_{key}_idle.webp': webp(scale(idle.crop((x0, y0, x1, y1)), frame))}
    entry = {'frameWidth': frame[0], 'frameHeight': FRAME_HEIGHT,
             'anchor': [round((meta['anchor'][0] - x0) * k, 2), round((meta['anchor'][1] - y0) * k, 2)],
             'facing': 'left' if meta['yaw'] < 0 else 'right',
             'walk': {'image': f'map_hero_{key}_walk.webp', 'frames': meta['frames'], 'cycleSeconds': meta['cycleSeconds']['walk']},
             'run': {'image': f'map_hero_{key}_run.webp', 'frames': meta['frames'], 'cycleSeconds': meta['cycleSeconds']['run']},
             'idle': {'image': f'map_hero_{key}_idle.webp'}}
    return meta, images, entry, frame


def build(src):
    missing = [key for key in VARIANTS if not (src / key / 'meta.json').exists()]
    if missing:
        raise SystemExit(f'pack_hero: {src} lacks the {", ".join(missing)} frames; render both variants together')
    built = {key: build_variant(src / key) for key in VARIANTS}
    batches = {meta.get('created') for meta, _, _, _ in built.values()}
    if len(batches) != 1 or None in batches:
        raise SystemExit(f'pack_hero: {src} mixes render batches {sorted(map(str, batches))}; render again')
    images = {name: data for _, variant_images, _, _ in built.values() for name, data in variant_images.items()}
    index = {'schema': SCHEMA, 'variants': {key: entry for key, (_, _, entry, _) in built.items()}}
    return built, images, json.dumps(index, ensure_ascii=False, indent=2) + '\n'


def manifest(built):
    sha = lambda data: hashlib.sha256(data).hexdigest()
    rows = []
    for key, (meta, images, entry, frame) in built.items():
        created = meta.get('created', '')  # the render time, so the manifest is reproducible from the frames
        facing = '朝左' if entry['facing'] == 'left' else '朝右'
        common = (f"  category: map\n  style: default\n  prompt: （无：程序渲染，未调用出图模型）\n  negative: （无）\n"
                  f"  references:\n  - path: {meta['model']}\n    sha256: {meta['modelSha256']}\n"
                  f"    use: 主角·{LABEL[key]} 3D 模型（城镇 / 战斗 / 人物页按性别选用的同一模型）自带动画，原地播放（锁定 Hips 水平位移）\n"
                  f"  - path: {meta['harness']}\n    sha256: {meta['harnessSha256']}\n"
                  f"    use: 渲染夹具：正交相机偏航 {meta['yaw']}° / 俯角 {meta['elevation']}°，透明底 {meta['size']}² 画布\n"
                  "  tool: node tools/map/hero/render_hero.mjs + python3 tools/map/hero/pack_hero.py"
                  "（Three.js 渲染 → 统一裁框 → 预乘 Lanczos 缩放，WebP q92）\n  model: （无：确定性渲染）\n  effort: n/a\n"
                  f"  created: '{created}'\n  status: candidate\n")
        for clip, title in (('walk', '行走循环'), ('run', '奔跑循环（疾行）')):
            name = f'map_hero_{key}_{clip}.webp'
            rows.append(f"- id: map_hero_{key}_{clip}\n  file: {name}\n  subject: 大地图主角·{LABEL[key]}{title}（AR-116）："
                        f"{meta['frames']} 帧横排、{facing}、一步周期 {meta['cycleSeconds'][clip]} s；帧尺寸与地面锚点见同目录 hero.json\n"
                        + common + f"  size: {frame[0] * meta['frames']}x{frame[1]}\n  sha256: {sha(images[name])}\n"
                        "  notes: 移动时逐帧播放，反方向时水平镜像；复核：python3 tools/map/hero/pack_hero.py <帧目录> --check。\n")
        name = f'map_hero_{key}_idle.webp'
        rows.append(f"- id: map_hero_{key}_idle\n  file: {name}\n  subject: 大地图主角·{LABEL[key]}站立（AR-116）：idle 首帧，"
                    "与行走帧同一裁框与锚点\n" + common + f"  size: {frame[0]}x{frame[1]}\n  sha256: {sha(images[name])}\n"
                    "  notes: 停步、未出发或减少动效时显示。\n")
    return ''.join(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('frames', type=Path, help='directory written by render_hero.mjs')
    parser.add_argument('--check', action='store_true', help='compare the rebuilt images and hero.json with disk')
    args = parser.parse_args()
    built, images, index = build(args.frames.resolve())
    if args.check:
        expected = {**images, 'hero.json': index.encode(), 'manifest.yaml': manifest(built).encode()}
        drift = [name for name, data in expected.items() if not (OUT / name).exists() or (OUT / name).read_bytes() != data]
        print('pack_hero: ' + ('drift ' + ', '.join(drift) if drift else 'up to date'))
        sys.exit(1 if drift else 0)
    # The whole pack is written beside the live directory and swapped in at once, so an interrupted run
    # never leaves new strips next to an old hero.json / manifest (the build would publish that mix).
    partial, previous = OUT.with_name(OUT.name + '.partial'), OUT.with_name(OUT.name + '.previous')
    shutil.rmtree(partial, ignore_errors=True)
    partial.mkdir(parents=True)
    for name, data in images.items():
        (partial / name).write_bytes(data)
    (partial / 'hero.json').write_text(index, encoding='utf-8')
    (partial / 'manifest.yaml').write_text(manifest(built), encoding='utf-8')
    shutil.rmtree(previous, ignore_errors=True)
    if OUT.exists():
        OUT.rename(previous)
    partial.rename(OUT)
    shutil.rmtree(previous, ignore_errors=True)
    for key, (meta, _, entry, frame) in built.items():
        print(f'pack_hero: {key} {meta["frames"]} frames of {frame[0]}x{frame[1]} (facing {entry["facing"]}) → '
              f'{OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

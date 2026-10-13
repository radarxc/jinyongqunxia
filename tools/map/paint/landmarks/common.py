"""大地图图集 / 名城小景共用工具（AR-113）：路径、哈希、预乘缩放、轻锐化、WebP 输出、manifest 读写。

全部为确定性操作：同一输入、同一参数逐字节同一输出（Pillow + numpy，无随机数、无墙钟参与像素）。
"""
from __future__ import annotations

import hashlib
import io
import json
from datetime import datetime
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[4]
ASSETS = ROOT / "assets" / "default"
KIT = ASSETS / "map" / "kit"
MARKERS_DIR = ASSETS / "map" / "markers"
LANDMARK_DIR = ASSETS / "map" / "landmark"
BASE_MAP = ASSETS / "map" / "world" / "map_world_jianghu__base01.webp"
COORD = ROOT / ".agents" / "coord" / "ART-worldmap-landmarks"
QA_DIR = COORD / "qa"
FONT = Path("/System/Library/Fonts/STHeiti Medium.ttc")


def rel(path: Path) -> str:
    return str(Path(path).resolve().relative_to(ROOT))


def sha256_file(path: Path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_rgba(path: Path) -> Image.Image:
    im = Image.open(path)
    im.load()
    return im.convert("RGBA")


def alpha_bbox(im: Image.Image, threshold: int = 16) -> tuple[int, int, int, int]:
    a = np.asarray(im.getchannel("A"))
    ys, xs = np.nonzero(a >= threshold)
    if len(xs) == 0:
        raise ValueError("empty sprite")
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def to_premul(im: Image.Image) -> np.ndarray:
    arr = np.asarray(im.convert("RGBA"), dtype=np.float32) / 255.0
    out = arr.copy()
    out[..., :3] *= arr[..., 3:4]
    return out


def from_premul(p: np.ndarray) -> Image.Image:
    p = np.clip(p, 0.0, 1.0)
    a = p[..., 3:4]
    rgb = np.where(a > 1e-6, p[..., :3] / np.maximum(a, 1e-6), 0.0)
    rgb = np.clip(rgb, 0.0, 1.0)
    out = np.concatenate([rgb, a], axis=-1)
    out = (out * 255.0 + 0.5).astype(np.uint8)
    out[out[..., 3] == 0, :3] = 0
    return Image.fromarray(out, "RGBA")


def resize_rgba(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """预乘 Lanczos 缩放（Pillow 对 RGBA 先转 RGBa 再缩放），透明处 RGB 归零。"""
    out = im.convert("RGBA").resize(size, Image.LANCZOS)
    arr = np.asarray(out).copy()
    arr[arr[..., 3] == 0, :3] = 0
    return Image.fromarray(arr, "RGBA")


def unsharp_premul(im: Image.Image, sigma: float = 0.8, amount: float = 0.6) -> Image.Image:
    """在预乘空间做 USM：墨线与轮廓一起收紧，避免透明边出现亮晕。"""
    from scipy.ndimage import gaussian_filter

    p = to_premul(im)
    blur = np.stack([gaussian_filter(p[..., c], sigma) for c in range(4)], axis=-1)
    s = p + amount * (p - blur)
    s[..., 3] = np.clip(s[..., 3], 0.0, 1.0)
    s[..., :3] = np.clip(s[..., :3], 0.0, s[..., 3:4])
    return from_premul(s)


def webp_bytes(im: Image.Image, lossless: bool = True, quality: int = 92) -> bytes:
    buf = io.BytesIO()
    if lossless:
        im.save(buf, "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(buf, "WEBP", quality=quality, alpha_quality=100, method=6)
    return buf.getvalue()


def png_bytes(im: Image.Image) -> bytes:
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=False, compress_level=6)
    return buf.getvalue()


def write_if_changed(path: Path, data: bytes) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() == data:
        return False
    path.write_bytes(data)
    return True


def json_bytes(obj) -> bytes:
    return (json.dumps(obj, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def read_manifest(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows = yaml.safe_load(path.read_text(encoding="utf-8"))
    return rows if isinstance(rows, list) else []


class _Dumper(yaml.SafeDumper):
    pass


def _str_presenter(dumper, data):
    if "\n" in data:
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)


_Dumper.add_representer(str, _str_presenter)


def manifest_bytes(rows: list[dict]) -> bytes:
    text = yaml.dump(rows, Dumper=_Dumper, allow_unicode=True, sort_keys=False,
                     default_flow_style=False, width=1000)
    return text.encode("utf-8")


def keep_created(old_rows: list[dict], row_id: str, sha: str) -> str:
    """同 id 且图片哈希未变时沿用旧 created，保证重跑不改 manifest。"""
    for row in old_rows:
        if row.get("id") == row_id and row.get("sha256") == sha and row.get("created"):
            return str(row["created"])
    return datetime.now().astimezone().replace(microsecond=0).isoformat()


def font(size: int):
    from PIL import ImageFont

    try:
        return ImageFont.truetype(str(FONT), size)
    except OSError:
        return ImageFont.load_default()


def soft_shadowless_paste(dst: Image.Image, sprite: Image.Image, xy: tuple[int, int]) -> None:
    dst.alpha_composite(sprite, dest=(int(xy[0]), int(xy[1])))


def blur_rgba(im: Image.Image, radius: float) -> Image.Image:
    return im.filter(ImageFilter.GaussianBlur(radius))

"""把一个素材目录（manifest.yaml + 多张小图）拼成一张带编号的总览图，给审批页用。

城镇贴片、地图拼接建筑这类素材数量多、单张小，逐张建卡片不好审；拼成一张总览图，作者对整批给一个结论，
哪张要改就在意见里写编号。用法（被 build.py 调用，也可单独跑）：

    python3 tools/review/contact_sheet.py <manifest 所在目录> <输出 jpg> [--cols 6] [--cell 220]

透明底素材垫浅灰棋盘格，便于看清边缘与透明区域；每格下方写序号与 ID（去掉公共前缀）。
返回值（供 build.py 用）：[(序号, id, sha256 前 16 位, 尺寸)]。
"""
import hashlib
import sys
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont


def load_manifest(p: Path) -> list:
    d = yaml.safe_load(p.read_text(encoding="utf-8"))
    return d["assets"] if isinstance(d, dict) else d


def font(size: int):
    for cand in ("/System/Library/Fonts/PingFang.ttc", "/System/Library/Fonts/STHeiti Medium.ttc",
                 "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"):
        if Path(cand).exists():
            try:
                return ImageFont.truetype(cand, size)
            except OSError:
                continue
    return ImageFont.load_default()


def checker(w: int, h: int, step: int = 12) -> Image.Image:
    im = Image.new("RGB", (w, h), (236, 236, 232))
    dr = ImageDraw.Draw(im)
    for y in range(0, h, step):
        for x in range(0, w, step):
            if (x // step + y // step) % 2:
                dr.rectangle([x, y, x + step - 1, y + step - 1], fill=(214, 214, 208))
    return im


def common_prefix(ids: list) -> str:
    if len(ids) < 2:
        return ""
    pre = ids[0]
    for s in ids[1:]:
        while not s.startswith(pre):
            pre = pre[:-1]
    cut = pre.rfind("_")
    return pre[: cut + 1] if cut >= 0 else ""


def build(mdir: Path, out: Path, cols: int = 6, cell: int = 220) -> list:
    assets = load_manifest(mdir / "manifest.yaml")
    ids = [a["id"] for a in assets]
    pre = common_prefix(ids)
    label_h, pad = 44, 10
    rows = (len(assets) + cols - 1) // cols
    W = cols * (cell + pad) + pad
    H = rows * (cell + label_h + pad) + pad
    sheet = Image.new("RGB", (W, H), (250, 250, 247))
    dr = ImageDraw.Draw(sheet)
    f_no, f_id = font(18), font(13)
    info = []
    for i, a in enumerate(assets):
        src = mdir / a["file"]
        raw = src.read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        im = Image.open(src).convert("RGBA")
        size = f"{im.width}x{im.height}"
        im.thumbnail((cell, cell), Image.LANCZOS)
        x0 = pad + (i % cols) * (cell + pad)
        y0 = pad + (i // cols) * (cell + label_h + pad)
        bg = checker(cell, cell)
        bg.paste(im, ((cell - im.width) // 2, (cell - im.height) // 2), im)
        sheet.paste(bg, (x0, y0))
        dr.rectangle([x0, y0, x0 + cell - 1, y0 + cell - 1], outline=(190, 190, 184))
        dr.text((x0 + 2, y0 + cell + 2), f"{i + 1}", font=f_no, fill=(179, 38, 30))
        short = a["id"][len(pre):] if pre else a["id"]
        dr.text((x0 + 30, y0 + cell + 4), short[:30], font=f_id, fill=(40, 44, 46))
        dr.text((x0 + 30, y0 + cell + 22), size, font=f_id, fill=(110, 118, 116))
        info.append((i + 1, a["id"], sha[:16], size))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    return info


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opts = {sys.argv[i][2:]: int(sys.argv[i + 1]) for i in range(1, len(sys.argv) - 1) if sys.argv[i].startswith("--")}
    if len(args) != 2:
        sys.exit(__doc__)
    rows = build(Path(args[0]), Path(args[1]), **opts)
    print(f"{len(rows)} 张 → {args[1]}")

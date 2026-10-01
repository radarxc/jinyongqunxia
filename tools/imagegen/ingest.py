#!/usr/bin/env python3
"""把 Gemini 网页下载的生成图入库：缩放到提示词 frontmatter 的规格、转 PNG、（透明底素材）抠底、登记 manifest、原件归档。

    python3 tools/imagegen/ingest.py <asset_id> <下载的文件> [--prompt-json p.json] [--key]
    python3 tools/imagegen/ingest.py <asset_id> --latest                # 取 ~/Downloads 里最新的 Gemini_Generated_Image_*

原件移到 .agents/coord/gemini_originals/<asset_id>.<ext>（不入库，manifest 的 source_path 指向它）；
manifest 条目按 id 覆盖（重出时替换旧条目），status 一律 candidate。
"""
import argparse
import hashlib
import json
import re
import shutil
import sys
import time
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from tools.imagegen.gemini_prompt import build, find_prompt  # noqa: E402

ARCHIVE = ROOT / ".agents/coord/gemini_originals"


def frontmatter(asset_id):
    f = find_prompt(asset_id)
    t = f.read_text(encoding="utf-8")
    return yaml.safe_load(t[4:t.find("\n---\n", 4)]), f


def load_manifest(p: Path):
    if not p.exists():
        return []
    data = yaml.safe_load(p.read_text(encoding="utf-8")) or []
    return [e for e in data if isinstance(e, dict)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("asset_id")
    ap.add_argument("src", nargs="?")
    ap.add_argument("--latest", action="store_true")
    ap.add_argument("--prompt-json")
    ap.add_argument("--key", action="store_true", help="抠透明底（角色部件等）")
    ap.add_argument("--note", default="")
    a = ap.parse_args()
    fm, pf = frontmatter(a.asset_id)
    if a.latest:
        cands = sorted(Path.home().joinpath("Downloads").glob("Gemini_Generated_Image_*"), key=lambda p: p.stat().st_mtime)
        if not cands:
            raise SystemExit("~/Downloads 里没有 Gemini_Generated_Image_*")
        src = cands[-1]
        if time.time() - src.stat().st_mtime > 600:
            raise SystemExit(f"最新的下载 {src.name} 已超过 10 分钟，疑似不是刚下的图，停下核对")
    else:
        src = Path(a.src)
    out = ROOT / str(fm["output"])
    man = ROOT / str(fm["manifest"])
    size = str(fm.get("size") or fm.get("canvas") or "1536x1536").lower()
    tw, th = (int(x) for x in size.split("x"))
    im = Image.open(src).convert("RGB")
    src_size = im.size
    if im.size != (tw, th):
        im = im.resize((tw, th), Image.LANCZOS) if abs(im.size[0] / im.size[1] - tw / th) < 0.02 else im
    keyed = None
    if a.key or fm.get("kind") in ("rig_ref", "rig_part"):
        from tools.item.common import remove_background
        im, keyed = remove_background(im)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG", optimize=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    arch = ARCHIVE / f"{a.asset_id}{src.suffix.lower()}"
    shutil.move(str(src), arch)
    prompt = json.loads(Path(a.prompt_json).read_text(encoding="utf-8")) if a.prompt_json else build(a.asset_id)
    neg = re.search(r"排除项?[：:](.*)$", prompt)
    entry = {
        "id": a.asset_id, "file": out.name, "category": fm.get("kind", "item"), "style": "default",
        "subject": f"{fm.get('name', '')}（{fm.get('category_name') or fm.get('map_kind') or fm.get('set', '')}，{fm.get('grade', '')}阶）".replace("，阶）", "）"),
        "prompt": prompt, "negative": neg.group(1).strip() if neg else "",
        "references": [],
        "tool": "gemini-web · Nano Banana（Oil painting 模板，无参考图上传）",
        "model": "gemini-app (Pro 订阅)",
        "created": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "source_path": str(arch.relative_to(ROOT)),
        "source_size": f"{src_size[0]}x{src_size[1]}",
        "size": f"{im.size[0]}x{im.size[1]}",
        "sha256": hashlib.sha256(out.read_bytes()).hexdigest(),
        "status": "candidate",
        "notes": ("写实画风（作者 2026-10-01：要跟角色图对应上）；" + (a.note or "")) + (f"；抠底 {keyed}" if keyed else ""),
    }
    entries = [e for e in load_manifest(man) if e.get("id") != a.asset_id] + [entry]
    man.write_text(yaml.safe_dump(entries, allow_unicode=True, sort_keys=False, width=1000), encoding="utf-8")
    print(f"✔ {a.asset_id} → {out.relative_to(ROOT)}（{src_size[0]}×{src_size[1]} → {im.size[0]}×{im.size[1]}，原件 {arch.relative_to(ROOT)}）")
    return 0


if __name__ == "__main__":
    sys.exit(main())

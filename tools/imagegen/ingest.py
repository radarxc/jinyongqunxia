#!/usr/bin/env python3
"""把 Gemini 网页下载的生成图入库：缩放到提示词 frontmatter 的规格、转 PNG、（透明底素材）抠底、登记 manifest、原件归档。

    python3 tools/imagegen/ingest.py <asset_id> <下载的文件> [--prompt-json p.json] [--key]
    python3 tools/imagegen/ingest.py <asset_id>                         # 取 ~/Downloads/gemini__<asset_id>.jpeg（驱动按 ID 命名保存）
    python3 tools/imagegen/ingest.py <asset_id> --latest                # 取 ~/Downloads 里唯一的 Gemini_Generated_Image_*

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
from tools.imagegen.gemini_prompt import build, build_short, find_prompt  # noqa: E402


class _NoAliasDumper(yaml.SafeDumper):
    """content-registry 禁 YAML 锚点 / 别名（构建会失败）：同一对象被多处引用时也逐处展开写。"""

    def ignore_aliases(self, data):
        return True

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


def crop_frame(im: Image.Image) -> tuple[Image.Image, list]:
    """去掉 Gemini 偶尔自带的"画框"（外圈白边 / 深色边 / 内衬方块）：从四边向内扫，直到行列均色接近内部背景色，再按背景色补成正方形。"""
    import numpy as np
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = a.shape[:2]
    i0, i1 = int(min(h, w) * 0.16), int(min(h, w) * 0.20)
    ring = np.concatenate([a[i0:i1, i0:w - i0].reshape(-1, 3), a[h - i1:h - i0, i0:w - i0].reshape(-1, 3),
                           a[i0:h - i0, i0:i1].reshape(-1, 3), a[i0:h - i0, w - i1:w - i0].reshape(-1, 3)])
    bg = np.median(ring, axis=0)
    lim = int(min(h, w) * 0.15)
    def scan(lines):
        for k, line in enumerate(lines):
            if np.abs(line.mean(axis=0) - bg).max() < 7 and np.abs(line - bg).max(axis=1).mean() < 14:
                return k
        return 0
    top = scan([a[y] for y in range(lim)])
    bottom = scan([a[h - 1 - y] for y in range(lim)])
    left = scan([a[:, x] for x in range(lim)])
    right = scan([a[:, w - 1 - x] for x in range(lim)])
    box = [left, top, w - right, h - bottom]
    if max(top, bottom, left, right) <= 2:
        return im, []
    inner = im.crop(box)
    side = max(inner.size)
    canvas = Image.new("RGB", (side, side), tuple(int(v) for v in bg))
    canvas.paste(inner, ((side - inner.size[0]) // 2, (side - inner.size[1]) // 2))
    return canvas, box


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("asset_id")
    ap.add_argument("src", nargs="?")
    ap.add_argument("--latest", action="store_true")
    ap.add_argument("--prompt-json")
    ap.add_argument("--key", action="store_true", help="抠透明底（角色部件等）")
    ap.add_argument("--note", default="")
    ap.add_argument("--tool", help="覆盖 manifest 的 tool（如 'codex exec · image_gen'）")
    ap.add_argument("--model", help="覆盖 manifest 的 model（如 gpt-6-astra）")
    ap.add_argument("--prompt-file", help="本张实际用的提示词文本文件（codex 出图时提示词不在提示词库里）")
    ap.add_argument("--refs", nargs="*", help="本张实际上传的参考图（按上传顺序）；缺省取提示词 frontmatter 的 reference_upload")
    ap.add_argument("--manual-title", default="", help="秘籍补书名（AR-30）：上传原图改图、只在题签补写这个书名；manifest 如实记改图提示词、原图与工具")
    a = ap.parse_args()
    fm, pf = frontmatter(a.asset_id)
    named = Path.home() / "Downloads" / f"gemini__{a.asset_id}.jpeg"
    if a.src is None and not a.latest:
        for _ in range(40):  # 驱动按物品 ID 命名保存：~/Downloads/gemini__<id>.jpeg
            if named.exists():
                break
            time.sleep(0.5)
        if not named.exists():
            raise SystemExit(f"没有 {named}（等了 20 秒）")
        a.src = str(named)
    if a.latest:
        cands = []
        for _ in range(40):  # 下载可能还没写完：最多等 20 秒
            cands = sorted((p for p in Path.home().joinpath("Downloads").glob("Gemini_Generated_Image_*") if not p.name.endswith(".crdownload")), key=lambda p: p.stat().st_mtime)
            if cands:
                break
            time.sleep(0.5)
        if not cands:
            raise SystemExit("~/Downloads 里没有 Gemini_Generated_Image_*（等了 20 秒）")
        if len(cands) > 1:
            raise SystemExit(f"~/Downloads 里有 {len(cands)} 个 Gemini 图，无法确定哪张属于 {a.asset_id}，停下核对：" + "、".join(p.name for p in cands))
        src = cands[-1]
        if time.time() - src.stat().st_mtime > 600:
            raise SystemExit(f"最新的下载 {src.name} 已超过 10 分钟，疑似不是刚下的图，停下核对")
    else:
        src = Path(a.src)
    if src.stat().st_size < 100_000:
        raise SystemExit(f"{src.name} 只有 {src.stat().st_size} 字节，不是原图（多半截获到了中间响应），删掉后重新保存")
    out = ROOT / str(fm["output"])
    man = ROOT / str(fm["manifest"])
    figure = str(fm["output"]).startswith(("assets/default/character/", "assets/default/scene/"))
    default = "1024x1536" if str(fm["output"]).startswith("assets/default/character/") else "1536x1024" if figure else "1536x1536"
    size = str(fm.get("size") or fm.get("canvas") or default).lower()
    tw, th = (int(x) for x in size.split("x"))
    im = Image.open(src).convert("RGB")
    src_size = im.size
    if figure:
        # 立绘 / 情景图：背景有淡水墨，不做画框检测；比例不符时居中裁成目标比例再缩放（AR-30 立绘重出走 Gemini）
        frame = []
        w, h = im.size
        if abs(w / h - tw / th) >= 0.02:
            cw, ch = (round(h * tw / th), h) if w / h > tw / th else (w, round(w * th / tw))
            im = im.crop(((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch))
        im = im.resize((tw, th), Image.LANCZOS) if im.size != (tw, th) else im
    else:
        im, frame = crop_frame(im)
        if im.size != (tw, th):
            im = im.resize((tw, th), Image.LANCZOS) if abs(im.size[0] / im.size[1] - tw / th) < 0.02 else im
    keyed = None
    if a.key or fm.get("kind") in ("rig_ref", "rig_part"):
        from tools.item.common import remove_background
        im, keyed = remove_background(im)
    old = next((e for e in load_manifest(man) if e.get("id") == a.asset_id), {})  # 改图时记下被改的原图（覆盖前的条目）
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG", optimize=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    arch = ARCHIVE / f"{a.asset_id}{src.suffix.lower()}"
    if src.resolve() != arch.resolve():
        shutil.move(str(src), arch)
    prompt = (Path(a.prompt_file).read_text(encoding="utf-8").strip() if a.prompt_file else
              json.loads(Path(a.prompt_json).read_text(encoding="utf-8")) if a.prompt_json else build_short(a.asset_id))  # 批量默认用精简版
    neg = re.search(r"排除项?[：:](.*)$", prompt)
    refs = [str(r) for r in (a.refs if a.refs is not None else (fm.get("reference_upload") or []))]
    if figure:
        category = "/".join(Path(str(fm["output"])).parts[2:4]) if str(fm["output"]).startswith("assets/default/character/") else "scene"
        subject = f"{fm.get('name', '')}（{fm.get('book') or fm.get('era', '')}）".replace("（）", "")
        tool = "gemini-web · Nano Banana Pro" + (f"（上传身份参考 {len(refs)} 张）" if refs else "（无参考图上传）")
    else:
        category = fm.get("kind", "item")
        subject = f"{fm.get('name', '')}（{fm.get('category_name') or fm.get('map_kind') or fm.get('set', '')}，{fm.get('grade', '')}阶）".replace("，阶）", "）")
        tool = "gemini-web · Nano Banana（Oil painting 模板，无参考图上传）"
    entry = {
        "id": a.asset_id, "file": out.name, "category": category, "style": "default",
        "subject": subject,
        "prompt": prompt, "negative": neg.group(1).strip() if neg else "",
        "references": [{"path": r, "use": "画风基线（只取画风、光线、质感与背景，AR-31）" if "/baseline" in r or "baseline_small" in r
                        else "身份参考（作者 AR-29：只上传主角与 S 级）"} for r in refs],
        "tool": a.tool or tool,
        "model": a.model or "gemini-app (Pro 订阅)",
        "created": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "source_path": str(arch.relative_to(ROOT)),
        "source_size": f"{src_size[0]}x{src_size[1]}",
        "size": f"{im.size[0]}x{im.size[1]}",
        "sha256": hashlib.sha256(out.read_bytes()).hexdigest(),
        "status": "candidate",
        "notes": ((("各朝路人形象（AR-30）；" if a.asset_id.startswith("por_role_") else
                    "多人情景图（AR-29 / AR-30：只上传主角与 S 级立绘，其余按文字）；" if str(fm["output"]).startswith("assets/default/scene/") else
                    "立绘重审重出（AR-30）；") + str(fm.get("redo_reason") or "") + (("；" + a.note) if a.note else "")) if figure
                  else ("写实画风（作者 2026-10-01：要跟角色图对应上）；" + (a.note or ""))) + (f"；裁掉画框 {frame}" if frame else "") + (f"；抠底 {keyed}" if keyed else ""),
    }
    if a.manual_title:
        # 秘籍补书名（AR-30）：名录原写「空题签」，10-01 那批没有书名；在 /app 普通对话里上传原图、不套模板，只让模型在题签上补写书名
        entry["prompt"] = (f"这是一本武功秘籍的物品图。请只在封面的题签（竖条书签位置）上用端正的楷书竖写书名「{a.manual_title}」，墨色，字迹清晰、笔画准确；"
                           "不要添加任何其他文字、印章、注释或标记；书本造型、颜色、光影、构图和背景保持完全不变。")
        entry["negative"] = ""
        entry["references"] = [{"path": str(fm["output"]), "sha256": old.get("sha256", ""), "source_path": old.get("source_path", ""),
                                "use": "原图（上传改图：只在封面题签补写书名，其余保持不变）"}]
        entry["tool"] = "gemini-web · Nano Banana（/app 对话，开 Create image，上传原图改图，不套模板）"
        entry["notes"] = (f"秘籍补书名（AR-30）：在原图题签上补写「{a.manual_title}」，逐字放大核对无误；原图见 references（sha256 为改前版本，git 历史可取）"
                          + (f"；{a.note}" if a.note else "") + (f"；裁掉画框 {frame}" if frame else ""))
        if a.prompt_json:  # 重做时改过提示词：按实际发出的记
            entry["prompt"] = json.loads(Path(a.prompt_json).read_text(encoding="utf-8"))
    import fcntl  # 多路并行入库（10-02 人物线四路 codex）时，同一目录的 manifest 读改写要加锁，免得互相覆盖条目
    lock = ROOT / ".agents/coord/ingest.lock"; lock.parent.mkdir(parents=True, exist_ok=True)
    with open(lock, "w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        entries = [e for e in load_manifest(man) if e.get("id") != a.asset_id] + [entry]
        man.write_text(yaml.dump(entries, Dumper=_NoAliasDumper, allow_unicode=True, sort_keys=False, width=1000), encoding="utf-8")
        fcntl.flock(lk, fcntl.LOCK_UN)
    print(f"✔ {a.asset_id} → {out.relative_to(ROOT)}（{src_size[0]}×{src_size[1]} → {im.size[0]}×{im.size[1]}，原件 {arch.relative_to(ROOT)}）")
    return 0


if __name__ == "__main__":
    sys.exit(main())

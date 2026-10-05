#!/usr/bin/env python3
"""AR-69：保留生成 alpha、完整画幅缩放、追加清单、品类对照表与合同校验。"""
import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[4]
KIT = ROOT / "assets/default/map/kit"
COORD_ROOT = next((parent for parent in ROOT.parents if parent.name == "_prod"), ROOT)
ARCHIVE_LOGS = COORD_ROOT / ".agents/coord/_asset_logs/assets/default/map/kit"
DEFAULT_LOGS = ARCHIVE_LOGS / "full"
BASELINES = [
    "assets/default/baseline/map/ref_map_jianghu__ch01_base01.png",
    "assets/default/baseline/map/ref_map_dali__ch01_base01.png",
]
GROUPS = [
    ("山峰", ["shanfeng"]), ("山脉", ["shanmai"]), ("雪山", ["xueshan"]),
    ("丘陵", ["qiuling"]), ("湖泊", ["hupo"]), ("海面", ["haimian"]),
    ("平原 / 盆地", ["pingyuan", "pendi"]), ("河流笔触", ["heliu"]),
    ("道路笔触", ["daolu"]), ("关隘", ["guanai"]), ("大城", ["dacheng"]),
    ("州府", ["zhoufu"]), ("县镇", ["xianzhen"]), ("村落", ["cunluo"]),
    ("寺庙", ["simiao"]), ("道观", ["daoguan"]), ("门派", ["menpai"]),
    ("驿站", ["yizhan"]), ("码头", ["matou"]), ("遗迹", ["yiji"]),
]
RANGES = {"shanfeng": (6, 8), "shanmai": (6, 8), "xueshan": (4, 6),
          "qiuling": (4, 6), "hupo": (4, 6), "haimian": (4, 6),
          "dacheng": (3, 4), "zhoufu": (3, 4), "xianzhen": (3, 4),
          "cunluo": (3, 4), "simiao": (2, 3), "daoguan": (2, 3),
          "menpai": (2, 3), "yizhan": (2, 3), "matou": (2, 3),
          "yiji": (2, 3), "guanai": (3, 3), "heliu": (2, 2), "daolu": (2, 2)}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def kind(asset_id):
    prefix = "ico_map_kit_" if asset_id.startswith("ico_") else "map_kit_"
    assert asset_id.startswith(prefix), asset_id
    return asset_id[len(prefix):].split("_")[0]


def entries():
    return yaml.safe_load((KIT / "manifest.yaml").read_text())


def anchor(path):
    """alpha>=32 的有效主体包围盒底边中点；坐标原点为画幅左上。"""
    with Image.open(path) as im:
        box = im.getchannel("A").point(lambda a: 255 if a >= 32 else 0).getbbox()
        assert box, path
        left, _, right, bottom = box
        return [round((left + right - 1) / (2 * im.width), 6),
                round((bottom - 1) / im.height, 6)]


def patch_entry(asset_id, additions):
    """原样保留其他条目的文本；单条写入少于150行。"""
    path = KIT / "manifest.yaml"
    raw = path.read_text()
    pattern = re.compile(r"(?m)^- id: " + re.escape(asset_id) + r"\n.*?(?=^- id: |\Z)", re.S)
    match = pattern.search(raw)
    assert match, asset_id
    block = match.group()
    data = yaml.safe_load(block)[0]
    if set(additions) == {"kit"} and "kit" not in data:
        block = block.rstrip() + "\n" + yaml.safe_dump(additions, allow_unicode=True, sort_keys=False,
                                                        default_flow_style=False).replace("\n", "\n  ").rstrip() + "\n"
        # 顶层新增字段也必须缩进两个空格。
        block = block.replace("\nkit:", "\n  kit:")
    else:
        data.update(additions)
        block = yaml.safe_dump([data], allow_unicode=True, sort_keys=False, width=110)
    assert len(block.splitlines()) < 150
    lines = (raw[:match.start()] + block + raw[match.end():]).splitlines(keepends=True)
    path.write_text("")
    for start in range(0, len(lines), 120):
        with path.open("a") as f:
            f.writelines(lines[start:start + 120])


def add_sample_kit():
    volumes = {"shanmai": "large", "xueshan": "medium", "qiuling": "medium",
               "hupo": "large", "haimian": "large", "pendi": "large",
               "pingyuan": "large", "heliu": "large", "dacheng": "large",
               "zhoufu": "medium", "guanai": "medium"}
    orients = {"shanmai": "ew", "xueshan": "nwse", "guanai": "ew"}
    for e in entries():
        if e.get("role") != "sample":
            continue
        k = kind(e["id"])
        patch_entry(e["id"], {"kit": {"kind": k, "volume": volumes.get(k, "small"),
                    "orient": orients.get(k, "none"), "anchor": anchor(KIT / e["file"])}})


def ingest(logs, replace=()):
    jobs = json.loads((logs / "prompts.json").read_text())["jobs"]
    records = [json.loads(line) for line in (logs / "generation.jsonl").read_text().splitlines() if line]
    sources = {r["id"]: r for r in records if r.get("source_path")}
    existing = {e["id"]: e for e in entries()}
    assert all(asset_id in existing and existing[asset_id].get("role") == "variant"
               for asset_id in replace), "只允许替换本轮新变体，不允许改小样或基线"
    for job in jobs:
        if (job["id"] in existing and job["id"] not in replace) or job["id"] not in sources:
            continue
        source = Path(sources[job["id"]]["source_path"])
        target = KIT / (job["id"] + ".png")
        assert not target.exists() or job["id"] in replace, target
        with Image.open(source) as im:
            assert im.mode == "RGBA" and im.getchannel("A").getextrema()[0] == 0, source
            source_size = f"{im.width}x{im.height}"
            side = job["side"]
            im.thumbnail((round(side * .9), round(side * .9)), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
            canvas.save(target, optimize=True)
        group = next(name for name, kinds in GROUPS if job["kind"] in kinds)
        entry = {
            "id": job["id"], "file": target.name, "category": "map", "style": "default",
            "role": "variant", "group": group, "label": job["label"],
            "subject": f"{group}：{job['label']}；通用古代江湖地图概念贴图（原创扩展），不绑定书界地点与精确年代。",
            "prompt": job["prompt"],
            "negative": "无文字、伪字、印章、水印、现代元素、整幅纸底；不复用参照构图，不作代码派生变体。",
            "references": job["references"],
            "tool": "codex exec · image_gen; Pillow 完整画幅等比缩放与透明补边",
            "model": "image_gen（独立图像后端未披露）", "effort": "not_disclosed",
            "created": datetime.fromtimestamp(source.stat().st_mtime, timezone.utc).isoformat(),
            "source_path": str(source), "source_size": source_size, "source_sha256": sha(source),
            "size": f"{side}x{side}", "sha256": sha(target), "status": "candidate", "review_stage": "draft",
            "notes": "两张已审基线及同品类小样作输入（山峰无小样时参照山脉）；逐件独立生成。image_gen直接生成透明alpha，未抠底；只等比缩放完整原画幅至90%并居中补透明边，无旋转翻转裁切调色或拼接。纸感在主体内，城镇标记用小景画法；具体建筑年代形制（待考），GIS落位与缩小辨识度（待实测）。",
            "kit": {"kind": job["kind"], "volume": job["volume"], "orient": job["orient"],
                    "anchor": anchor(target)},
        }
        block = yaml.safe_dump([entry], allow_unicode=True, sort_keys=False, width=110)
        assert len(block.splitlines()) < 150
        if job["id"] in replace:
            patch_entry(job["id"], entry)
        else:
            with (KIT / "manifest.yaml").open("a") as f:
                f.write(block)
    add_sample_kit()
    print(f"清单登记 {len(entries()) - 1} 件贴图")


def font(size):
    return ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", size)


def fitted(im, size):
    out = im.copy()
    out.thumbnail(size, Image.Resampling.LANCZOS)
    return out


def compose():
    assets = [e for e in entries() if e.get("role") != "contact_sheet"]
    width, header, row_height, margin = 2400, 530, 300, 24
    height = header + row_height * len(GROUPS) + 110
    paper, ink = (238, 228, 204, 255), (33, 31, 26, 255)
    sheet = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)

    def label(xy, value, size=22):
        draw.text(xy, value, font=font(size), fill=ink)

    def plate(box):
        draw.rounded_rectangle(box, radius=12, fill=paper)

    plate((margin, margin, width - margin, 142))
    label((48, 37), "江湖大地图 · 水墨贴图集 · AR-69", 42)
    old_count = sum(e.get("role") == "sample" for e in assets)
    label((49, 97), f"{len(assets)}件（小样{old_count} + 新件{len(assets) - old_count}） / 同类小样在前 / 新件candidate", 25)
    for i, reference in enumerate(BASELINES):
        x = margin + i * 1180
        plate((x, 158, x + 1155, 510))
        label((x + 22, 170), ["已审基线：江湖总图", "已审基线：大理"][i], 26)
        with Image.open(ROOT / reference) as im:
            thumb = fitted(im.convert("RGBA"), (1110, 285))
            sheet.alpha_composite(thumb, (x + (1155 - thumb.width) // 2, 210))
    for row, (name, kinds) in enumerate(GROUPS):
        y = header + row * row_height
        plate((margin, y, width - margin, y + row_height - 12))
        batch = [e for e in assets if e["kit"]["kind"] in kinds]
        batch.sort(key=lambda e: e.get("role") != "sample")
        label((45, y + 20), name, 28)
        old = sum(e.get("role") == "sample" for e in batch)
        label((45, y + 65), f"{len(batch)}件", 24)
        label((45, y + 100), f"小样{old}+新{len(batch) - old}", 20)
        for col, e in enumerate(batch):
            x, top, tile = 225 + col * 350, y + 10, 228
            for gy in range(0, tile, 18):
                for gx in range(0, tile, 18):
                    color = paper if (gx // 18 + gy // 18) % 2 == 0 else (228, 218, 194, 255)
                    draw.rectangle((x + gx, top + gy, x + min(gx + 17, tile - 1),
                                    top + min(gy + 17, tile - 1)), fill=color)
            with Image.open(KIT / e["file"]) as im:
                thumb = fitted(im, (tile, tile))
                sheet.alpha_composite(thumb, (x + (tile - thumb.width) // 2, top + (tile - thumb.height) // 2))
                draw.rectangle((x + 240, top + 156, x + 311, top + 227), fill=(66, 73, 70, 255))
                dark = fitted(im, (70, 70))
                sheet.alpha_composite(dark, (x + 241, top + 157))
            label((x, y + 244), e["label"] + (" · 小样" if e.get("role") == "sample" else " · 新"), 20)
            label((x, y + 270), e["id"].replace("ico_map_kit_", "").replace("map_kit_", ""), 15)
    plate((margin, height - 96, width - margin, height - margin))
    label((49, height - 84), "浅格与深底仅用于对照表透明叠放审查；独立贴图无底色、无字。缩略图不代表GIS落位尺度。", 24)
    label((49, height - 47), "画法已通过；新件待逐件审定，地形轮廓受GIS约束。河流 / 道路保留原4件，拼合按矢量绘制。", 23)
    path = KIT / "_contact_sheet.png"
    sheet.save(path, optimize=True)
    patch_entry("map_kit_contact_sheet_01", {
        "subject": f"AR-69：{len(assets)}件水墨贴图按20组品类分行，小样在前、新件在后，并列两张已审基线。",
        "prompt": "Pillow按manifest的kit.kind分行排版；中文品类名、件数、小样/新件标签及浅格深底预览仅在对照表绘制。",
        "references": BASELINES + ["assets/default/map/kit/" + e["file"] for e in assets],
        "tool": "Pillow · tools/map/kit/full/build_kit.py", "source_path": str(Path(__file__).resolve()),
        "created": datetime.now(timezone.utc).isoformat(), "size": f"{width}x{height}", "sha256": sha(path),
        "notes": "RGBA；四角及外缘透明。审样板、标签及浅格深底仅属于本表。本条role: contact_sheet，拼合器须排除。",
        "kit": {"kind": "contact", "volume": "large", "orient": "none", "anchor": anchor(path)},
    })
    print(f"对照表 {width}x{height}，20行，{len(assets)}件")


def check(logs):
    data = entries()
    assets = [e for e in data if e.get("role") != "contact_sheet"]
    counts = Counter(e["kit"]["kind"] for e in assets)
    assert 64 <= len(data) <= 120 and len(data) == len(assets) + 1
    assert sum(e.get("role") == "sample" for e in assets) == 22
    for k, (lower, upper) in RANGES.items():
        assert lower <= counts[k] <= upper, (k, counts[k], lower, upper)
    assert 4 <= counts["pingyuan"] + counts["pendi"] <= 6
    assert len({e["id"] for e in data}) == len(data)
    assert len({e["sha256"] for e in data}) == len(data)
    assert {e["file"] for e in data} == {p.name for p in KIT.glob("*.png")}
    allowed = {"manifest.yaml", "README.md"}
    assert {p.name for p in KIT.iterdir()} <= allowed | {e["file"] for e in data}
    metrics = []
    required = "id file category style subject prompt negative references tool model effort created source_path size sha256 status notes kit".split()
    for e in data:
        assert all(e.get(k) for k in required), e["id"]
        k = e["kit"]
        assert set(k) == {"kind", "volume", "orient", "anchor"} and k["kind"] == kind(e["id"])
        assert k["volume"] in {"large", "medium", "small"}
        assert k["orient"] in {"ew", "ns", "nesw", "nwse", "none"}
        assert (k["orient"] != "none") == (k["kind"] in {"shanmai", "xueshan", "guanai"})
        assert isinstance(k["anchor"], list) and len(k["anchor"]) == 2
        assert all(isinstance(v, (float, int)) and not isinstance(v, bool) and 0 <= v <= 1 for v in k["anchor"])
        assert e["status"] == "candidate" and all((ROOT / r).is_file() for r in e["references"])
        path = KIT / e["file"]
        assert e["sha256"] == sha(path) and k["anchor"] == anchor(path)
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            assert im.format == "PNG" and im.mode == "RGBA" and min(im.size) >= 512
            assert e["size"] == f"{im.width}x{im.height}"
            if e.get("role") != "contact_sheet":
                assert im.size in {(512, 512), (1024, 1024)}
            a = im.getchannel("A")
            assert a.getextrema()[0] == 0 and a.getextrema()[1] > 0
            edges = [(0, 0, im.width, 1), (0, im.height - 1, im.width, im.height),
                     (0, 0, 1, im.height), (im.width - 1, 0, im.width, im.height)]
            assert all(a.crop(box).getextrema() == (0, 0) for box in edges), e["id"]
            hist = a.histogram()
            assert sum(hist[1:255]) > 0 and sum(hist[1:]) > 256, e["id"]
            metrics.append({"id": e["id"], "size": e["size"], "rgba": True, "edge_alpha": 0,
                            "corner_alpha": [0, 0, 0, 0], "kit": k, "sha256": e["sha256"],
                            "transparent_percent": round(hist[0] * 100 / (im.width * im.height), 2)})
    before = logs / "before.json"
    if before.is_file():
        snapshot = json.loads(before.read_text())
        now = {e["id"]: e for e in data}
        for old in snapshot["entries"]:
            if old.get("role") == "sample":
                assert {k: v for k, v in now[old["id"]].items() if k != "kit"} == old, old["id"]
        moved_logs = {"prompts.json", "generation.jsonl", "validation.jsonl",
                      "check_assets.log", "check_assets_explicit_max.log"}
        for path, digest in snapshot["files"].items():
            name = Path(path).name
            if name in {"manifest.yaml", "README.md", "_contact_sheet.png"}:
                continue
            if name == "build_review.py":
                # AR-68 脚本已迁移且调整资源/日志根，不能继续与旧源码散列比较。
                assert (ROOT / "tools/map/kit/build_review.py").is_file()
                continue
            current = ARCHIVE_LOGS / name if name in moved_logs else ROOT / path
            assert sha(current) == digest, path
        # README 只允许在旧记录后追加说明，或把已外置的过程文件引用改到 tools/.agents。
        expected = snapshot["readme"].replace(
            "`prompts.json`为实际提示词集合，`generation.jsonl`为生成来源记录，`validation.jsonl`为逐图数值校验。",
            "AR-68 的实际提示词、生成来源与逐图数值校验已归档到`.agents/coord/_asset_logs/assets/default/map/kit/`下的`prompts.json`、`generation.jsonl`与`validation.jsonl`。")
        expected = expected.replace("assets/default/map/kit/build_review.py", "tools/map/kit/build_review.py")
        expected = expected.replace("最新日志见`check_assets.log`",
                                    "历史日志归档为`.agents/coord/_asset_logs/assets/default/map/kit/check_assets.log`")
        expected = expected.replace("结果见`check_assets_explicit_max.log`",
                                    "历史日志归档为`.agents/coord/_asset_logs/assets/default/map/kit/check_assets_explicit_max.log`")
        assert (KIT / "README.md").read_text().startswith(expected)
    logs.mkdir(parents=True, exist_ok=True)
    (logs / "validation.jsonl").write_text("")
    for m in metrics:
        with (logs / "validation.jsonl").open("a") as f:
            f.write(json.dumps(m, ensure_ascii=False) + "\n")
    print(f"PASS: {len(assets)}件贴图 + 1表；RGBA/四角外缘/散列唯一/kit/各类件数/目录白名单；counts={dict(counts)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("ingest", "compose", "check"))
    parser.add_argument("--logs", type=Path, default=DEFAULT_LOGS,
                        help="外置prompts/generation/validation/before文件所在目录，不向assets写过程文件")
    parser.add_argument("--replace", action="append", default=[], metavar="VARIANT_ID",
                        help="明确指定本轮变体重生图后重新入库；拒绝替换role: sample或contact_sheet")
    args = parser.parse_args()
    if args.action == "compose":
        compose()
    elif args.action == "ingest":
        ingest(args.logs, args.replace)
    else:
        check(args.logs)

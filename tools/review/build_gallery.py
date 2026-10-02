#!/usr/bin/env python3
"""素材总览页：物品（11 类）、建筑套件（11 套 + 基线 2 套）、贴片、地图，拼成带中文标注的总览图 + 一页 HTML。

    python3 tools/review/build_gallery.py            # 输出到 .agents/coord/gallery/{index.html,img/*.jpg,map/*.svg,files.json}

只做汇总与缩略，不改任何素材。候选图（任务工作区里尚未合入的）也一并展示并标明。
"""
import json
import re
import sys
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / ".agents/coord/gallery"
IMG = OUT / "img"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
PAPER = (236, 232, 224)
PAPER_DARK = (214, 206, 190)
INK = (58, 52, 46)
GREY = (120, 112, 104)
ITEM_CATS = [("medicine", "药物 / 补品 / 药材"), ("food", "食材 / 食品"), ("manuals", "武学秘籍"), ("weapons", "兵器"),
             ("clothing", "衣物"), ("armor", "制式盔甲"), ("innerarmor", "内甲"), ("accessories", "护肩 / 披风 / 头饰"),
             ("shoes", "鞋"), ("belts", "腰带"), ("hidden-weapons", "暗器")]
KITS = [("song_north", "北宋北方"), ("liao_jin_north", "辽金北方"), ("yuan_north", "元北方"), ("yuan_south", "元南方"),
        ("ming_north", "明北方"), ("ming_south", "明南方"), ("qing_north", "清北方"), ("qing_south", "清南方"),
        ("xiyu", "西域"), ("tubo", "吐蕃"), ("mongol", "蒙古")]
BASE_KITS = [("song_dali", "宋 · 大理（基线）"), ("song_southern", "南宋江南（基线）")]
GRADE_ORDER = {"天": 0, "地": 1, "玄": 2, "黄": 3}


def font(size):
    try:
        return ImageFont.truetype(FONT, size)
    except OSError:
        return ImageFont.load_default()


def load_manifest(p: Path):
    if not p.exists():
        return []
    data = yaml.safe_load(p.read_text(encoding="utf-8")) or []
    return [e for e in data if isinstance(e, dict)]


def catalog_rows(cat: str):
    rows = {}
    for ln in (ROOT / f"docs/design/catalog/items-{cat}.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*`((?:it|eq)_[a-z0-9_]+)`\s*\|(.*)$", ln)
        if not m:
            continue
        cells = [c.strip() for c in m.group(2).split("|")]
        rows[m.group(1)] = {"name": cells[0] if cells else "", "sub": cells[1] if len(cells) > 1 else "",
                            "grade": cells[2] if len(cells) > 2 else ""}
    return rows


def sheet(cells, out: Path, cell=224, cols=None, bg=PAPER, pad=10, caption_h=58, title=None, tile_bg=None):
    """cells: list of (image_path, [caption lines]). 拼成网格，返回 (cols, rows)。tile_bg：透明图块单独衬的底色（如深色看抠图边缘），说明文字仍在 bg 上。"""
    if not cells:
        return None
    cols = cols or (8 if len(cells) > 24 else 6 if len(cells) > 12 else min(len(cells), 6))
    rows = (len(cells) + cols - 1) // cols
    title_h = 44 if title else 0
    w = pad + cols * (cell + pad)
    h = title_h + pad + rows * (cell + caption_h + pad)
    im = Image.new("RGB", (w, h), bg)
    dr = ImageDraw.Draw(im)
    f_title, f1, f2 = font(24), font(17), font(13)
    if title:
        dr.text((pad, 10), title, fill=INK, font=f_title)
    for i, (src, lines) in enumerate(cells):
        r, c = divmod(i, cols)
        x = pad + c * (cell + pad)
        y = title_h + pad + r * (cell + caption_h + pad)
        try:
            pic = Image.open(src)
            pic.load()
            if pic.mode in ("RGBA", "LA", "P"):
                pic = pic.convert("RGBA")
                tile = Image.new("RGBA", pic.size, (tile_bg or bg) + (255,))
                tile.alpha_composite(pic)
                pic = tile.convert("RGB")
            else:
                pic = pic.convert("RGB")
            pic.thumbnail((cell, cell), Image.LANCZOS)
            im.paste(pic, (x + (cell - pic.width) // 2, y + (cell - pic.height) // 2))
        except Exception as e:  # noqa: BLE001
            dr.rectangle([x, y, x + cell, y + cell], outline=GREY)
            dr.text((x + 8, y + 8), f"读图失败 {e}"[:30], fill=GREY, font=f2)
        ty = y + cell + 4
        for j, ln in enumerate(lines[:3]):
            dr.text((x + 2, ty + j * 17), ln[:22], fill=INK if j == 0 else GREY, font=f1 if j == 0 else f2)
    im.save(out, "JPEG", quality=80, optimize=True)
    return cols, rows


def main():
    IMG.mkdir(parents=True, exist_ok=True)
    (OUT / "map").mkdir(exist_ok=True)
    files = {}
    stats = {}
    html_items = []

    # ---- 物品
    total_merged = total_cand = 0
    for cat, cname in ITEM_CATS:
        rows = catalog_rows(cat)
        merged_dir = ROOT / f"assets/default/item/{cat}"
        wt_dir = ROOT / f".agents/wt/ART-item-{cat}/assets/default/item/{cat}"
        entries = []
        seen = set()
        for e in load_manifest(merged_dir / "manifest.yaml"):
            if (merged_dir / e.get("file", "")).exists():
                entries.append((merged_dir / e["file"], e["id"], "已通过（作者 10-01）" if str(e.get("status")) == "approved" else "已入库 · 候选待作者审"))
                seen.add(e["id"])
        for e in load_manifest(wt_dir / "manifest.yaml"):
            if e.get("id") not in seen and (wt_dir / e.get("file", "")).exists():
                entries.append((wt_dir / e["file"], e["id"], "任务工作区 · GPT 审核中"))
        redo = set()
        rp = ROOT / "assets/default/prompts/items/REDO.md"
        if rp.exists():
            import re as _re
            redo = {m.group(1) for ln in rp.read_text(encoding="utf-8").splitlines() if not ln.lstrip().startswith("#") for m in [_re.search(r"`((?:it|eq)_[a-z0-9_]+)`", ln)] if m}
        entries = [(p_, i_, ("作者要求重出：突出年代制式与颜色" if i_ in redo else s_)) for p_, i_, s_ in entries]
        n_m = sum(1 for _, _, s in entries if s.startswith(("已入库", "已通过")))
        n_c = len(entries) - n_m
        total_merged += n_m
        total_cand += n_c
        entries.sort(key=lambda t: (GRADE_ORDER.get(rows.get(t[1], {}).get("grade", ""), 9), t[1]))
        cells = [(p, [f"{rows.get(i, {}).get('name', i)}  {rows.get(i, {}).get('grade', '')}阶", i, s]) for p, i, s in entries]
        name = f"items_{cat}.jpg"
        dims = sheet(cells, IMG / name, title=f"{cname} · 名录 {len(rows)} 项 · 已入库 {n_m} · 其他 {n_c}")
        if dims:
            files[f"img/{name}"] = f"img/{name}"
            html_items.append((cat, cname, len(rows), n_m, n_c, name))
    stats["items"] = (total_merged, total_cand)

    # ---- 建筑套件 + 贴片
    html_kits = []
    for kit, kname in KITS:
        bdir, tdir = ROOT / f"assets/default/building-map/{kit}", ROOT / f"assets/default/tile/{kit}"
        b = [(bdir / e["file"], [re.sub(rf"^bld_kit_{kit}_", "", e["id"]), f"占地 {e.get('building', {}).get('footprint', e.get('footprint', '—'))}" if isinstance(e.get('building', {}), dict) else ""]) for e in load_manifest(bdir / "manifest.yaml") if (bdir / e.get("file", "")).exists()]
        t = [(tdir / e["file"], [re.sub(rf"^tex_town_{kit}_", "", e["id"])[:22]]) for e in load_manifest(tdir / "manifest.yaml") if (tdir / e.get("file", "")).exists()]
        nb, nt = f"kit_{kit}.jpg", f"tiles_{kit}.jpg"
        sheet(b, IMG / nb, cell=200, cols=7, bg=PAPER_DARK, caption_h=44, title=f"{kname}（{kit}）· 建筑 {len(b)} 栋 · 已按历史图片重出 · 作者 10-01 通过")
        sheet(t, IMG / nt, cell=150, cols=7, bg=PAPER_DARK, caption_h=30, title=f"{kname} 贴片 {len(t)} 张")
        files[f"img/{nb}"] = f"img/{nb}"
        files[f"img/{nt}"] = f"img/{nt}"
        html_kits.append((kit, kname, len(b), len(t), nb, nt))
    bb = ROOT / "assets/default/baseline/building-map"
    base_entries = load_manifest(bb / "manifest.yaml")
    html_base_kits = []
    for kit, kname in BASE_KITS:
        b = [(bb / e["file"], [re.sub(rf"^bld_kit_{kit}_", "", e["id"]), str(e.get("status", ""))]) for e in base_entries if e.get("id", "").startswith(f"bld_kit_{kit}_") and (bb / e.get("file", "")).exists()]
        if not b:
            b = [(p, [p.stem.replace(f"bld_kit_{kit}_", ""), ""]) for p in sorted(bb.glob(f"bld_kit_{kit}_*.png"))]
        nb = f"kit_{kit}.jpg"
        sheet(b, IMG / nb, cell=200, cols=7, bg=PAPER_DARK, caption_h=44, title=f"{kname}（{kit}）· 建筑 {len(b)} 栋 · 作者已审基线，未按历史图片重出")
        files[f"img/{nb}"] = f"img/{nb}"
        html_base_kits.append((kit, kname, len(b), nb))
    bt = ROOT / "assets/default/baseline/tile"
    base_tiles = [(bt / e["file"], [str(e.get("id", ""))[9:31]]) for e in load_manifest(bt / "manifest.yaml") if (bt / e.get("file", "")).exists()]
    if not base_tiles:
        base_tiles = [(p, [p.stem[9:31]]) for p in sorted(bt.glob("*.png"))]
    sheet(base_tiles, IMG / "tiles_baseline.jpg", cell=150, cols=8, bg=PAPER_DARK, caption_h=30, title=f"通用贴片（基线，TOWN-tiles）· {len(base_tiles)} 张")
    files["img/tiles_baseline.jpg"] = "img/tiles_baseline.jpg"
    stats["kits"] = (len(KITS), sum(k[2] for k in html_kits), sum(k[3] for k in html_kits), len(base_tiles))

    # ---- 地图
    maps = []
    for src, label in [(ROOT / "assets/default/baseline/map/ref_map_jianghu__ch01_base01.png", "江湖山川总览（天龙书界）· 基线 · 作者已审"),
                       (ROOT / "assets/default/baseline/map/ref_map_dali__ch01_base01.png", "大理苍洱局部图 · 基线 · 作者已审"),
                       (ROOT / "assets/default/baseline/town/town_dali__ch01.png", "大理城镇合成图 · 基线")]:
        if src.exists():
            im = Image.open(src).convert("RGB")
            im.thumbnail((1400, 1400), Image.LANCZOS)
            name = f"map_{src.stem}.jpg"
            im.save(IMG / name, "JPEG", quality=82, optimize=True)
            files[f"img/{name}"] = f"img/{name}"
            maps.append((name, label, f"{Image.open(src).width}×{Image.open(src).height}"))
    svg = OUT / "map/jianghu-ch01.svg"
    if svg.exists():
        files["map/jianghu-ch01.svg"] = "map/jianghu-ch01.svg"

    # ---- 角色立绘（tools/portrait/build_portraits.py 产物）
    html_por, n_scene = [], 0
    pidx_path = ROOT / "assets/default/portrait/index.json"
    if pidx_path.exists():
        pidx = json.loads(pidx_path.read_text(encoding="utf-8"))
        names = {}
        for man in (ROOT / "assets/default/character").glob("*/*/manifest.yaml"):
            for e in load_manifest(man):
                names[e.get("id")] = str(e.get("subject", "")).split(" ")[0]
        por_root = ROOT / "assets/default/portrait"
        by_ch = {}
        for key, rec in pidx.get("bust", {}).items():
            ch = key.split("/")[2][:4]
            by_ch.setdefault(ch, []).append((por_root / rec["512"]["f"], [names.get(rec["source"], key.split("/")[1]), key.split("/")[2][5:27]]))
        for ch in sorted(by_ch):
            cells = sorted(by_ch[ch], key=lambda c: c[1][0])
            name = f"portrait_{ch}.jpg"
            sheet(cells, IMG / name, cell=176, cols=8, bg=PAPER, caption_h=40, tile_bg=(38, 56, 64),
                  title=f"{ch} · 半身 {len(cells)} 个（透明底，衬深色看抠图边缘）")
            files[f"img/{name}"] = f"img/{name}"
            html_por.append((ch, len(cells), name))
        scenes = [(por_root / rec["low"]["f"], [names.get(rec["source"], ""), key.split("/")[2][5:27]])
                  for key, rec in sorted(pidx.get("portrait", {}).items()) if not rec.get("alpha")]
        n_scene = len(scenes)
        if scenes:
            sheet(scenes, IMG / "portrait_scenes.jpg", cell=200, cols=8, bg=PAPER, caption_h=40, title=f"剧情场景立绘 · {len(scenes)} 张（保留原画背景）")
            files["img/portrait_scenes.jpg"] = "img/portrait_scenes.jpg"
    n_bust = sum(n for _, n, _ in html_por)

    # ---- HTML
    def esc(s):
        return str(s).replace("&", "&amp;").replace("<", "&lt;")
    h = ["<title>天书录素材总览</title>", """
<style>
/* 布局：单栏长页，顶部概览数字 + 三节；总览图整幅横向可滚动 */
:root{--bg:#f3efe7;--fg:#2f2a26;--muted:#7a716a;--line:#d9d1c4;--card:#faf7f1;--accent:#8a5a3c;--ok:#4f7a4a;--warn:#a2772c;
  --serif:"Songti SC","STSong","Noto Serif SC",serif;--sans:"PingFang SC","Hiragino Sans GB","Noto Sans SC",system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1d1b18;--fg:#ebe4d8;--muted:#a69c90;--line:#3a352f;--card:#26231f;--accent:#d7a06f;--ok:#8fc086;--warn:#e0b45c;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#1d1b18;--fg:#ebe4d8;--muted:#a69c90;--line:#3a352f;--card:#26231f;--accent:#d7a06f;--ok:#8fc086;--warn:#e0b45c;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--sans);margin:0;padding-block:24px;padding-inline:clamp(16px,3vw,40px);line-height:1.55}
h1{font-family:var(--serif);font-weight:600;font-size:clamp(26px,4vw,38px);margin:0 0 6px;text-wrap:balance}
h2{font-family:var(--serif);font-size:22px;margin:40px 0 12px;padding-top:16px;border-top:1px solid var(--line)}
h3{font-size:16px;margin:22px 0 8px;font-weight:600}
.lede{color:var(--muted);max-width:70ch;margin:0 0 18px}
.stats{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0 6px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 14px;min-width:150px}
.stat b{display:block;font-size:24px;font-variant-numeric:tabular-nums}
.stat span{color:var(--muted);font-size:13px}
nav{display:flex;flex-wrap:wrap;gap:8px 18px;margin:10px 0 0;font-size:14px}
nav a{color:var(--accent);text-decoration:none;border-bottom:1px solid transparent}
nav a:hover{border-color:var(--accent)}
.sheet{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px;overflow-x:auto}
.sheet img{display:block;max-width:100%;height:auto}
.meta{font-size:13px;color:var(--muted);margin:4px 0 0}
.tag{display:inline-block;font-size:12px;padding:1px 8px;border-radius:999px;border:1px solid var(--line);margin-left:6px;vertical-align:middle}
.tag.ok{color:var(--ok);border-color:var(--ok)}.tag.warn{color:var(--warn);border-color:var(--warn)}
.two{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:12px}
@media (max-width:900px){.two{grid-template-columns:1fr}}
table{border-collapse:collapse;font-size:14px;margin:8px 0}
td,th{padding:4px 10px;border-bottom:1px solid var(--line);text-align:left;font-variant-numeric:tabular-nums}
details summary{cursor:pointer;color:var(--accent)}
</style>
<h1>天书录素材总览</h1>
<p class="lede">default 风格包里物品图、建筑套件与贴片、地图的现状，一页看完。每张总览图里的小字是物品名 / ID / 入库状态；"候选"指图已生成但作者尚未审批。</p>
"""]
    m, c = stats["items"]
    nk, nb, nt, nbt = stats["kits"]
    h.append(f"""<div class="stats">
<div class="stat"><b>{m + c}</b><span>物品图（名录 170 项）<br>已入库 {m} · 工作区候选 {c}</span></div>
<div class="stat"><b>{nk} 套</b><span>年代建筑套件<br>{nb} 栋建筑 · {nt} 张贴片 · 全部历史重出</span></div>
<div class="stat"><b>2 套</b><span>基线宋套件（作者已审）<br>未按历史图片重出</span></div>
<div class="stat"><b>{len(maps) + (1 if svg.exists() else 0)}</b><span>地图 / 城镇图<br>水墨基线 2 · 城镇基线 1 · 江湖导航图 SVG</span></div>
<div class="stat"><b>{n_bust}</b><span>角色立绘（基础形象）<br>透明全身 / 半身 / 头像 · 场景图 {n_scene}</span></div>
</div>
<nav><a href="#items">物品</a><a href="#kits">建筑套件与贴片</a><a href="#maps">地图</a><a href="#portraits">角色立绘</a></nav>
<h2 id="items">物品 · 11 类</h2>
<p class="lede">排序：天 → 地 → 玄 → 黄。画风基线是倚天剑与九阴真经两张（作者已审）。</p>""")
    for cat, cname, n, nm, nc, name in html_items:
        tag = f'<span class="tag ok">已入库 {nm}</span>' + (f'<span class="tag warn">工作区候选 {nc}</span>' if nc else "")
        h.append(f'<h3 id="items-{cat}">{esc(cname)} <span class="meta">名录 {n} 项</span>{tag}</h3><div class="sheet"><img loading="lazy" src="img/{name}" alt="{esc(cname)} 总览"></div>')
    h.append('<h2 id="kits">建筑套件与贴片</h2><p class="lede">每套 19 栋功能建筑 + 7 张贴片（含城门），45° 俯视、2:1、透明底；总览图在暖灰底上合成以便看轮廓。基线两套宋套件是作者已审的出发点，尚未按历史图片重出。</p>')
    for kit, kname, b, t, nb_, nt_ in html_kits:
        h.append(f'<h3 id="kit-{kit}">{esc(kname)} <span class="meta">{kit} · 建筑 {b} · 贴片 {t}</span><span class="tag ok">已入库</span></h3><div class="two"><div class="sheet"><img loading="lazy" src="img/{nb_}" alt="{esc(kname)} 建筑"></div><div class="sheet"><img loading="lazy" src="img/{nt_}" alt="{esc(kname)} 贴片"></div></div>')
    for kit, kname, b, nb_ in html_base_kits:
        h.append(f'<h3 id="kit-{kit}">{esc(kname)} <span class="meta">{kit} · 建筑 {b}</span><span class="tag warn">未历史重出</span></h3><div class="sheet"><img loading="lazy" src="img/{nb_}" alt="{esc(kname)}"></div>')
    h.append(f'<h3>通用贴片（基线）<span class="meta">{nbt} 张</span></h3><div class="sheet"><img loading="lazy" src="img/tiles_baseline.jpg" alt="通用贴片"></div>')
    h.append('<h2 id="maps">地图</h2><p class="lede">全国导航图是代码从 design/19 的数据生成的 SVG（14 个时代图层，这里显示 ch01）；水墨地图目前只有天龙书界两张作者已审基线，其余书界与 30 个区域局部图尚未绘制。</p>')
    for name, label, size in maps:
        h.append(f'<h3>{esc(label)} <span class="meta">{size}</span></h3><div class="sheet"><img loading="lazy" src="img/{name}" alt="{esc(label)}"></div>')
    if svg.exists():
        h.append('<h3>江湖万里图 · ch01（代码生成 SVG，4096×3072）</h3><div class="sheet"><img loading="lazy" src="map/jianghu-ch01.svg" alt="江湖万里图 ch01"></div>')
    if html_por:
        h.append('<h2 id="portraits">角色立绘</h2><p class="lede">立绘 agent 出的写实全身立绘，经 tools/portrait 处理：BiRefNet 抠图去背景、去白边，裁 1:1 半身与头肩头像，压成 WebP。下面是半身图，衬在深色底上便于看边缘；全身透明立绘与头像同目录。剧情场景图保留原画背景。</p>')
        for ch, n, name in html_por:
            h.append(f'<h3 id="portraits-{ch}">{ch} <span class="meta">半身 {n} 个</span></h3><div class="sheet"><img loading="lazy" src="img/{name}" alt="{ch} 角色半身"></div>')
        if n_scene:
            h.append(f'<h3 id="portraits-scenes">剧情场景立绘 <span class="meta">{n_scene} 张</span></h3><div class="sheet"><img loading="lazy" src="img/portrait_scenes.jpg" alt="剧情场景立绘"></div>')
    h.append('<p class="meta" style="margin-top:32px">由 tools/review/build_gallery.py 生成；素材源目录 assets/default/{item,building-map,tile,baseline,portrait}。</p>')
    (OUT / "index.html").write_text("\n".join(h), encoding="utf-8")
    (OUT / "files.json").write_text(json.dumps(files, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum((OUT / v).stat().st_size for v in files.values()) + (OUT / "index.html").stat().st_size
    print(f"已生成 {OUT / 'index.html'}；文件 {len(files)} 个，合计 {total / 1e6:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())

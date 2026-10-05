#!/usr/bin/env python3
"""角色立绘 → 运行时素材（tech/06 §5.3–§5.4）。

输入：assets/default/character/<性别>/<chNN>/manifest.yaml 与同目录 1024×1536 立绘 PNG（立绘 agent 产出）。
输出：assets/default/portrait/
  <npcId>/<变体>.mid.webp / .low.webp   全身立绘：基础形象为透明底（对话 / 人物卡），剧情场景图保留原画背景
  <npcId>/<变体>.ava512/256/128.webp    1:1 头肩头像（透明底；只给基础形象；小头像 / 战斗时间轴）
  <npcId>/<变体>.bust512/256.webp       1:1 半身（头顶到腰，透明底；人物卡 / 对话侧栏）
  manifest.yaml   每个人物一行默认立绘（id = NPC ID，现行构建插件 apps/game/build/asset-manifest.ts 直接可读）
  index.json      完整索引：素材键 portrait/<npcId>/<变体>、avatar|bust/<npcId>/<变体去 _base> → 各档文件、尺寸、字节、来源

抠图：BiRefNet（rembg 的 birefnet-general-lite，本地 CPU 推理）出 alpha → pymatting 多级前景色估计去掉底色渗色（白边）。
alpha 按原图 sha256 缓存在 .agents/coord/portrait_cache/，可增量重跑（立绘 agent 补图后再跑一遍即可）。

用法：python3 tools/portrait/build_portraits.py [--only <子串>] [--limit N] [--sheet]
依赖（本机一次性安装）：pip3 install --user "rembg[cpu]" pymatting
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
import time
from datetime import date
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets/default/character"
OUT = ROOT / "assets/default/portrait"
CACHE = ROOT / ".agents/coord/portrait_cache"
FULL = {"mid": (1024, 1536), "low": (768, 1152)}       # tech/06 §5.4 立绘 mid / low（母版 1024×1536，不放大出 high）
AVATAR = (512, 256, 128)                               # 头肩头像 512 母版 / 256 / 128（tech/06 §5.4 avatar）
BUST = (512, 256)                                      # 1:1 半身（头顶到腰）：人物卡、对话侧栏
CROP = {"avatar": 0.24, "bust": 0.36}                  # 方框边长占身高（头顶到脚底）的比例
WEBP = dict(quality=82, alpha_quality=90, method=6)    # tech/06 §5.3 有 alpha 人物图
WEBP_OPAQUE = dict(quality=82, method=6)


class _NoAliasDumper(yaml.SafeDumper):
    """content-registry 禁 YAML 锚点 / 别名：同一对象被多处引用时也逐处展开写。"""

    def ignore_aliases(self, data):
        return True


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_id(asset_id: str) -> tuple[str, str]:
    """por_npc_xiaofeng__ch01_prime_gaibang_base → (npc_xiaofeng, ch01_prime_gaibang_base)"""
    m = (re.fullmatch(r"por_(npc_[a-z0-9_]+?)__(ch\d\d_[a-z0-9_]+)", asset_id)
         or re.fullmatch(r"por_(role_[a-z0-9_]+?)__([a-z0-9_]+)", asset_id))  # 各朝路人形象（AR-30）：por_role_<职业>__<时代>_<m|f>
    if not m:
        raise ValueError(f"无法解析立绘 ID：{asset_id}")
    return m.group(1), m.group(2)


_session = None


def alpha_for(src: Path, digest: str) -> np.ndarray:
    cached = CACHE / f"{digest}.png"
    if cached.exists():
        return np.asarray(Image.open(cached)).astype(np.float64) / 255
    global _session
    if _session is None:
        from rembg import new_session  # 延迟加载：只在需要推理时载入模型
        _session = new_session("birefnet-general-lite")
    from rembg import remove
    mask = remove(Image.open(src).convert("RGB"), session=_session, only_mask=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    mask.save(cached)
    return np.asarray(mask).astype(np.float64) / 255


def cutout(rgb8: np.ndarray, alpha: np.ndarray) -> Image.Image:
    from pymatting import estimate_foreground_ml
    fg = estimate_foreground_ml(rgb8.astype(np.float64) / 255, alpha)
    out = np.dstack([fg * 255, alpha * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def half_body_box(alpha: np.ndarray, factor: float) -> tuple[int, int, int, int]:
    """1:1 方框：边长 = factor × 身高（0.36 半身到腰、0.24 头肩）。头顶取「主体宽度 ≥ 30 px」的第一行，避开举过头顶的细长道具。"""
    h, w = alpha.shape
    solid = alpha > 0.5
    widths = solid.sum(1)
    rows = np.where(widths >= 3)[0]
    if len(rows) == 0:
        return 0, 0, w, w
    bottom = rows[-1]
    wide = np.where(widths >= 30)[0]
    top = wide[0] if len(wide) else rows[0]
    height = max(bottom - top, 1)
    side = int(min(w, h, max(160, round(factor * height))))
    band = solid[top:top + max(int(0.10 * height), 8)]
    cols = np.where(band.any(0))[0]
    cx = int(np.average(np.arange(w), weights=band.sum(0))) if band.sum() else w // 2
    if len(cols):                                          # 头部带的质心偏向发辫 / 饰物时，拉回头部列范围中点
        cx = int(0.5 * cx + 0.5 * (cols[0] + cols[-1]) / 2)
    x0 = int(min(max(cx - side // 2, 0), w - side))
    y0 = int(min(max(int(top) - int(0.06 * side), 0), h - side))
    return x0, y0, x0 + side, y0 + side


def save_webp(img: Image.Image, path: Path, opaque: bool) -> dict:
    buf = io.BytesIO()
    img.save(buf, "WEBP", **(WEBP_OPAQUE if opaque else WEBP))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(buf.getvalue())
    return {"f": path.relative_to(OUT).as_posix(), "w": img.width, "h": img.height, "b": len(buf.getvalue())}


def process(row: dict, src: Path, index: dict) -> None:
    asset_id = row["id"]
    npc, variant = parse_id(asset_id)
    digest = sha256(src)
    key = f"portrait/{npc}/{variant}"
    prev = index["portrait"].get(key)
    if prev and prev.get("source_sha256") == digest and all((OUT / v["f"]).exists() for k, v in prev.items() if k in FULL):
        return                                              # 原图未变且产物齐全：跳过
    scene = "_scene_" in variant
    rgb8 = np.asarray(Image.open(src).convert("RGB"))
    entry = {"source": asset_id, "source_file": src.relative_to(ROOT).as_posix(), "source_sha256": digest,
             "status": row.get("status", "candidate"), "alpha": not scene}
    if scene:
        full = Image.fromarray(rgb8)
    else:
        alpha = alpha_for(src, digest)
        full = cutout(rgb8, alpha)
    for tier, size in FULL.items():
        img = full if full.size == size else full.resize(size, Image.LANCZOS)
        entry[tier] = save_webp(img, OUT / npc / f"{variant}.{tier}.webp", opaque=scene)
    index["portrait"][key] = entry
    if not scene:
        a = np.asarray(full)[..., 3].astype(np.float64) / 255
        short = re.sub(r"_base$", "", variant)
        for kind, sizes, tag in (("avatar", AVATAR, "ava"), ("bust", BUST, "bust")):
            box = half_body_box(a, CROP[kind])
            crop = full.crop(box)
            rec = {"source": asset_id, "box": list(box)}
            for s in sizes:
                rec[str(s)] = save_webp(crop.resize((s, s), Image.LANCZOS), OUT / npc / f"{variant}.{tag}{s}.webp", opaque=False)
            index.setdefault(kind, {})[f"{kind}/{npc}/{short}"] = rec


def pick_default(keys: list[str]) -> str:
    """每个人物的默认立绘：最早书界的基础形象，同书界取变体名最短者（最通用）。"""
    base = [k for k in keys if "_scene_" not in k] or keys
    return sorted(base, key=lambda k: (k.split("/")[2][:4], len(k), k))[0]


def write_outputs(index: dict) -> None:
    by_npc: dict[str, list[str]] = {}
    for key in index["portrait"]:
        by_npc.setdefault(key.split("/")[1], []).append(key)
    defaults, rows = {}, []
    for npc in sorted(by_npc):
        pkey = pick_default(by_npc[npc])
        variant = pkey.split("/")[2]
        akey = f"avatar/{npc}/{re.sub(r'_base$', '', variant)}"
        bkey = akey.replace("avatar/", "bust/", 1)
        defaults[npc] = {"portrait": pkey, "avatar": akey if akey in index["avatar"] else None,
                         "bust": bkey if bkey in index.get("bust", {}) else None}
        p = index["portrait"][pkey]
        row = {"id": npc, "file": p["mid"]["f"], "category": "portrait", "source": p["source"], "status": p["status"],
               "size": f"{p['mid']['w']}x{p['mid']['h']}", "variants": sorted(by_npc[npc])}
        if defaults[npc]["avatar"]:
            row["avatar"] = index["avatar"][akey]["256"]["f"]
        if defaults[npc]["bust"]:
            row["bust"] = index["bust"][bkey]["512"]["f"]
        rows.append(row)
    index["default"] = defaults
    index["generated"] = date.today().isoformat()
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    header = ("# 运行时默认立绘（由 tools/portrait/build_portraits.py 生成，不要手改）：每个人物一行，id = NPC ID。\n"
              "# 现行构建插件按 file 复制立绘；完整素材键（各书界 / 年龄 / 状态变体、头像三档）见同目录 index.json。\n")
    (OUT / "manifest.yaml").write_text(header + yaml.dump(rows, Dumper=_NoAliasDumper, allow_unicode=True, sort_keys=False, width=1000), encoding="utf-8")


def contact_sheet(index: dict, path: Path, n: int = 40) -> None:
    keys = sorted(index["avatar"])[:n]
    s = Image.new("RGB", (128 * 10, 128 * ((len(keys) + 9) // 10)), (35, 55, 65))
    for i, k in enumerate(keys):
        im = Image.open(OUT / index["avatar"][k]["128"]["f"]).convert("RGBA")
        bg = Image.new("RGBA", im.size, (35, 55, 65, 255)); bg.alpha_composite(im)
        s.paste(bg.convert("RGB"), ((i % 10) * 128, (i // 10) * 128))
    s.save(path, quality=88)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", help="只处理 ID 含此子串的立绘")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--sheet", help="另存一张头像缩略总览图到此路径")
    a = ap.parse_args()
    index_path = OUT / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {}
    index.setdefault("schema", "tianshu-portrait-index.v1")
    index.setdefault("portrait", {}); index.setdefault("avatar", {}); index.setdefault("bust", {})
    jobs = []
    for man in sorted([*SRC.glob("*/*/manifest.yaml"), *SRC.glob("*/commoners/*/manifest.yaml")]):
        for row in yaml.safe_load(man.read_text(encoding="utf-8")) or []:
            if a.only and a.only not in row["id"]:
                continue
            src = man.parent / row["file"]
            if src.exists() and row.get("status") != "rejected":
                jobs.append((row, src))
    if a.limit:
        jobs = jobs[:a.limit]
    t0 = time.time()
    for i, (row, src) in enumerate(jobs, 1):
        try:
            process(row, src, index)
        except Exception as e:  # noqa: BLE001 —— 单张失败不中断整批，汇总报告
            print(f"✘ {row['id']}：{e}", file=sys.stderr)
        if i % 10 == 0 or i == len(jobs):
            print(f"[{i}/{len(jobs)}] {time.time() - t0:.0f}s", flush=True)
            write_outputs(index)                            # 定期落盘，中断后可续跑
    write_outputs(index)
    if a.sheet:
        contact_sheet(index, Path(a.sheet))
    total = (sum(p[t]["b"] for p in index["portrait"].values() for t in FULL)
             + sum(v[str(s)]["b"] for v in index["avatar"].values() for s in AVATAR)
             + sum(v[str(s)]["b"] for v in index["bust"].values() for s in BUST))
    print(f"✔ 立绘 {len(index['portrait'])} 个变体、头像 {len(index['avatar'])} 个、人物 {len(index['default'])} 个；运行时产物合计 {total / 1e6:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())

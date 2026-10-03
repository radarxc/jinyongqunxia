#!/usr/bin/env python3
"""调度器校验辅助：按名单核对新补的人物立绘（稀疏检出也能跑：只读名单里的人，不要求整目录图片都在本地）。

    python3 tools/agents/check_roster_portraits.py tools/agents/rosters/<task>.txt

名单每行：`chNN gender npc_id [hold]`（gender ∈ male / female / other；hold = 只要提示词、不出图）。
检查：
- 该书提示词目录有 `npc_<id>.md`（或 `npc_<id>__*.md`），frontmatter 有 asset_id / output / manifest；hold 行要求 status: hold；
- 非 hold：output 存在、是 1024×1536 的 PNG（other 只要求竖幅 2:3 且短边 ≥ 1024）；manifest 有同 id 条目，file / size / sha256 与文件一致，
  status: candidate，tool 含 codex、model 为 gpt-6-astra；
- 名单涉及的每个 manifest：HEAD 里已有的条目逐条原样保留（不许改别人的条目）。
"""
import hashlib
import subprocess
import sys
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "assets/default/prompts/characters"


def frontmatter(f: Path) -> dict:
    t = f.read_text(encoding="utf-8")
    if not t.startswith("---\n"):
        return {}
    end = t.find("\n---\n", 4)
    try:
        return yaml.safe_load(t[4:end]) or {}
    except yaml.YAMLError:
        return {}


def load_list(text: str) -> list:
    data = yaml.safe_load(text) or []
    return data.get("assets", []) if isinstance(data, dict) else data


def main() -> int:
    roster = [ln.split() for ln in (ROOT / sys.argv[1]).read_text(encoding="utf-8").splitlines()
              if ln.strip() and not ln.startswith("#")]
    problems, made, held = [], 0, 0
    manifests = set()
    for parts in roster:
        ch, gender, npc = parts[:3]
        hold = len(parts) > 3 and parts[3] == "hold"
        dirs = [d for d in BASE.glob(f"{ch}-*") if d.is_dir()]
        files = [f for d in dirs for f in (list(d.glob(f"{npc}.md")) + list(d.glob(f"{npc}__*.md")))]
        if not files:
            problems.append(f"{ch} {npc}：没有提示词文件")
            continue
        fm = frontmatter(files[0])
        if hold:
            held += 1
            if fm.get("status") != "hold":
                problems.append(f"{ch} {npc}：暂缓项的提示词 status 应为 hold")
            continue
        aid, out, man = fm.get("asset_id"), fm.get("output"), fm.get("manifest")
        if not (aid and out and man):
            problems.append(f"{ch} {npc}：frontmatter 缺 asset_id / output / manifest（{files[0].name}）")
            continue
        manifests.add(man)
        png = ROOT / out
        if not png.is_file():
            problems.append(f"{ch} {npc}：缺图 {out}")
            continue
        im = Image.open(png)
        w, h = im.size
        if gender == "other":
            if not (abs(w * 3 - h * 2) <= 3 and min(w, h) >= 1024):
                problems.append(f"{ch} {npc}：非人形图应为竖幅 2:3、短边 ≥ 1024，实为 {w}x{h}")
        elif (w, h) != (1024, 1536):
            problems.append(f"{ch} {npc}：立绘应为 1024x1536，实为 {w}x{h}")
        entries = load_list((ROOT / man).read_text(encoding="utf-8")) if (ROOT / man).is_file() else []
        e = next((x for x in entries if isinstance(x, dict) and x.get("id") == aid), None)
        if e is None:
            problems.append(f"{ch} {npc}：{man} 没有 {aid} 条目")
            continue
        sha = hashlib.sha256(png.read_bytes()).hexdigest()
        if e.get("file") != png.name or e.get("sha256") != sha or str(e.get("size")) != f"{w}x{h}":
            problems.append(f"{ch} {npc}：manifest 的 file / sha256 / size 与文件不一致")
        if e.get("status") != "candidate" or "codex" not in str(e.get("tool", "")) or e.get("model") != "gpt-6-astra":
            problems.append(f"{ch} {npc}：manifest 的 status / tool / model 不合规（{e.get('status')} / {e.get('tool')} / {e.get('model')}）")
        made += 1
    for man in sorted(manifests):
        p = subprocess.run(["git", "show", f"HEAD:{man}"], cwd=ROOT, capture_output=True, text=True)
        if p.returncode != 0:
            continue  # 新建的 manifest（如 other/ch03）
        old = load_list(p.stdout)
        now = load_list((ROOT / man).read_text(encoding="utf-8"))
        now_by_id = {x.get("id"): x for x in now if isinstance(x, dict)}
        changed = [x.get("id") for x in old if isinstance(x, dict) and now_by_id.get(x.get("id")) != x]
        if changed:
            problems.append(f"{man}：HEAD 已有条目被改动或删除：{changed[:5]}")
    for p in problems[:80]:
        print("✘", p)
    print(f"名单 {len(roster)} 项：出图 {made}、暂缓 {held}；问题 {len(problems)} 个")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

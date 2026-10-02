#!/usr/bin/env python3
"""生成 Gemini 网页批量出图的队列文件，供页面 localStorage 读入。

输出两份 JSON 到 --out 目录：
- claudeGemQueue.json   待出图 asset_id 列表（按 INDEX 顺序）
- claudeGemPrompts.json {asset_id: 短提示词}（gemini_prompt.build_short）

用法：
  python3 tools/imagegen/make_queue.py --out <目录> --group items --cat weapons apparel…
  python3 tools/imagegen/make_queue.py --out <目录> --ids eq_a eq_b
--cat 按输出路径 assets/default/item/<cat>/ 过滤；不给 --cat / --ids 时取该组全部待出图。
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from tools.imagegen.gemini_prompt import build_short  # noqa: E402


def pending(group: str) -> list[dict]:
    out = subprocess.run([sys.executable, "tools/agents/build_image_index.py", "--queue", "--group", group, "--json"],
                         cwd=ROOT, check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True, help="输出目录")
    ap.add_argument("--group", default="items", choices=["items", "maps", "rig"])
    ap.add_argument("--cat", nargs="*", default=[], help="只取这些物品类目（输出路径 item/<cat>/）")
    ap.add_argument("--ids", nargs="*", default=[], help="直接指定 asset_id，忽略 --group/--cat")
    a = ap.parse_args()

    if a.ids:
        ids = a.ids
    else:
        rows = pending(a.group)
        if a.cat:
            rows = [r for r in rows if any(f"/item/{c}/" in r["output"] for c in a.cat)]
        ids = [r["asset_id"] for r in rows]
    prompts = {i: build_short(i) for i in ids}

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "claudeGemQueue.json").write_text(json.dumps(ids, ensure_ascii=False), encoding="utf-8")
    (out / "claudeGemPrompts.json").write_text(json.dumps(prompts, ensure_ascii=False), encoding="utf-8")
    print(f"✔ {len(ids)} 张 → {out}/claudeGemQueue.json、claudeGemPrompts.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())

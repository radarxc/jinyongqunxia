#!/usr/bin/env python3
"""调度器校验辅助：运行 ID 检查，若指定文件中仍有未定义引用则失败。

用法（在工作区根目录运行）：
    python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-wujue.md ...

只看给定文件，别处的遗留问题（交给后续审计）不影响本任务的校验。
"""
import json
import subprocess
import sys


def main() -> int:
    files = set(sys.argv[1:])
    if not files:
        print("用法：check_undefined_in.py <文件> [<文件> ...]")
        return 2
    proc = subprocess.run(
        [sys.executable, "tools/lint/check_ids.py", "--json"],
        capture_output=True, text=True,
    )
    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        print("ID 检查没有输出 JSON：")
        print((proc.stderr or proc.stdout)[-2000:])
        return 2
    bad = []
    for item in data["issues"]["undefined_references"]:
        # 每条未定义引用自带 file / line；个别版本可能改为 locations 列表，两种都认
        locs = item.get("locations") or [item]
        for loc in locs:
            if loc.get("file") in files:
                bad.append(f'{loc["file"]}:{loc.get("line")} {item["id"]}')
    for line in bad[:60]:
        print("未定义：", line)
    print(f"指定文件中的未定义引用：{len(bad)}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""调度器校验辅助：检查仓库内 GPT CLI skill（`.codex/skills/<名>/SKILL.md`）的结构。

    python3 tools/agents/check_skill.py .codex/skills/tianshu-town-map [...]

检查项（机械可判的部分；内容质量由 GPT 审核与试用任务判断）：
- 有 SKILL.md，文首 YAML frontmatter 含 `name`（与目录名一致，小写字母 / 数字 / 连字符）与 `description`（非空，≤ 1024 字符，写明何时使用）；
- 正文不超过 300 行（细节放 references/，按需读取）；代码围栏成对；
- 正文与 references 里用反引号写出的仓库相对路径（以 assets/、docs/、tools/、.codex/ 开头）都存在；
- skill 目录内被引用的相对文件（scripts/…、references/…）都存在；scripts 下的 .py 能通过语法检查；
- 不含本机绝对路径（/Users/、/private/tmp 等）与占位词（TODO、待补充、此处省略）。
退出码 0 通过，1 有问题。
"""
import py_compile
import re
import sys
from pathlib import Path

NAME = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
REPO_PATH = re.compile(r"`((?:assets|docs|tools|\.codex)/[^`\s*<>{}]+)`")
LOCAL_PATH = re.compile(r"`((?:scripts|references|assets)/[^`\s*<>{}]+)`")
FENCE = re.compile(r"^\s*(```|~~~)")
BAD = (r"/Users/", r"/private/tmp", r"/home/", r"TODO(?!\.md)", r"待补充", r"此处省略")


def frontmatter(text: str) -> dict:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---", 4)
    if end < 0:
        return {}
    out = {}
    for line in text[4:end].splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            k, v = line.split(":", 1)
            out[k.strip()] = v.strip().strip("\"'")
    return out


def check(skill_dir: Path) -> list:
    problems = []
    md = skill_dir / "SKILL.md"
    if not md.is_file():
        return [f"{skill_dir}：缺少 SKILL.md"]
    text = md.read_text(encoding="utf-8")
    fm = frontmatter(text)
    name = fm.get("name", "")
    if name != skill_dir.name or not NAME.match(name):
        problems.append(f"{md}：frontmatter 的 name（{name!r}）须与目录名一致且只含小写字母、数字、连字符")
    desc = fm.get("description", "")
    if not desc or len(desc) > 1024:
        problems.append(f"{md}：description 为空或超过 1024 字符（现 {len(desc)}）")
    lines = text.splitlines()
    if len(lines) > 300:
        problems.append(f"{md}：正文 {len(lines)} 行，超过 300 行（细节移到 references/）")
    docs = [md] + sorted(p for p in skill_dir.rglob("*.md") if p != md)
    for f in docs:
        t = f.read_text(encoding="utf-8")
        if sum(1 for ln in t.splitlines() if FENCE.match(ln)) % 2:
            problems.append(f"{f}：代码围栏数为奇数")
        for bad in BAD:
            if re.search(bad, t):
                problems.append(f"{f}：含不应出现的内容 {bad!r}")
        for m in REPO_PATH.finditer(t):
            rel = m.group(1).rstrip("/.,;:)")
            if any(c in rel for c in "*?[") or "NN" in rel or "<" in rel:
                continue  # 模式或占位，不按实际路径检查
            if not Path(rel).exists():
                problems.append(f"{f}：引用的仓库路径不存在 {rel}")
        for m in LOCAL_PATH.finditer(t):
            rel = m.group(1).rstrip("/.,;:)")
            if rel.startswith("assets/") or any(c in rel for c in "*?[") or "<" in rel:
                continue
            if not (skill_dir / rel).exists():
                problems.append(f"{f}：引用的 skill 内文件不存在 {rel}")
    for py in sorted(skill_dir.rglob("*.py")):
        try:
            py_compile.compile(str(py), doraise=True)
        except py_compile.PyCompileError as e:
            problems.append(f"{py}：语法错误 {e.msg.strip().splitlines()[-1]}")
    return problems


def main() -> int:
    dirs = [Path(a) for a in sys.argv[1:]]
    if not dirs:
        print("用法：check_skill.py <skill 目录> [...]")
        return 2
    bad = 0
    for d in dirs:
        ps = check(d)
        if ps:
            bad += 1
            print(f"✘ {d}：")
            for p in ps:
                print("  - " + p)
        else:
            n = sum(1 for _ in d.rglob("*") if _.is_file())
            print(f"✔ {d}：结构通过（{n} 个文件）")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

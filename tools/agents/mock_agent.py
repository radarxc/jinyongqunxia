#!/usr/bin/env python3
"""
测试用假代理：不调用任何模型，按调度器传入的校验规则（环境变量 MOCK_SPEC）写出占位产出。
由 `run.py run --mock` 调用，用来在不消耗额度的情况下检验调度、校验、提交与续跑流程。
请在仓库的临时克隆里使用：它会往文档里写占位内容。

可选的故障注入（逗号分隔的任务 ID）：
  MOCK_FAIL        每次都以非零退出码失败
  MOCK_FAIL_ONCE   第 1 次运行失败，续作时成功
  MOCK_TRUNCATE    第 1 次运行写出未闭合的代码块（触发校验失败），续作时修复
  MOCK_STRAY       额外改动未声明的文件（应被调度器丢弃）
  MOCK_SLEEP       每个任务的模拟耗时（秒）
"""
import json
import os
import re
import sys
import time
from pathlib import Path


def ids(name):
    return {x.strip() for x in os.environ.get(name, "").split(",") if x.strip()}


def heading_line(rx):
    m = re.search(r"(\d+)", rx)
    return f"## {m.group(1)}. 占位章节" if m else "## 占位章节"


def ensure(root, rel, spec, tid, attempt):
    v = spec.get("validate", {})
    path = root / rel
    if rel.endswith(".py"):
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("import sys\nsys.exit(0)\n", encoding="utf-8")
        return
    text = path.read_text(encoding="utf-8") if path.exists() else f"# 占位 {rel}\n"
    lines = [f"<!-- mock {tid} 第 {attempt} 次 -->"]
    lines += [heading_line(rx) for rx in v.get("headings", {}).get(rel, []) if not re.search(rx, text, re.M)]
    lines += [needle for r, needle in v.get("contains", []) if r == rel and needle not in text]
    body = text.rstrip("\n") + "\n" + "\n".join(lines) + "\n"
    need = v.get("min_lines", {}).get(rel, 0) - len(body.splitlines())
    body += "".join(f"占位行 {i}\n" for i in range(max(0, need)))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")


def main():
    args = sys.argv[1:]
    prompt = args[args.index("--") + 1] if "--" in args else sys.stdin.read()
    tid = re.search(r"^# 任务 (\S+) · ", prompt, re.M).group(1)
    m = re.search(r"续作说明（第 (\d+) 次运行）", prompt)
    attempt = int(m.group(1)) if m else 1
    spec = json.loads(os.environ.get("MOCK_SPEC", "{}"))
    time.sleep(float(os.environ.get("MOCK_SLEEP", "0") or 0))
    print(f"mock agent: {tid} attempt {attempt}")
    if tid in ids("MOCK_FAIL") or (tid in ids("MOCK_FAIL_ONCE") and attempt == 1):
        print("mock agent: injected failure")
        return 3
    root = Path.cwd()
    for rel in spec.get("validate", {}).get("exists", []):
        ensure(root, rel, spec, tid, attempt)
    for rel in spec.get("writes", []):
        if not any(c in rel for c in "*?[") and rel != spec.get("report") and (root / rel).exists():
            ensure(root, rel, spec, tid, attempt)
    target = next(iter(spec.get("validate", {}).get("fences", [])), None)
    if target and tid in ids("MOCK_TRUNCATE"):
        with open(root / target, "a", encoding="utf-8") as fh:
            # 第 1 次写出未闭合的代码块；续作时补上闭合（模拟代理修复截断）
            fh.write("```yaml\n# 写到一半……\n" if attempt == 1 else "```\n")
    if tid in ids("MOCK_STRAY"):
        (root / f"stray-{tid}.txt").write_text("未声明的文件\n", encoding="utf-8")
        with open(root / "TODO.md", "a", encoding="utf-8") as fh:
            fh.write(f"\n<!-- stray edit by {tid} -->\n")
    report = root / spec["report"]
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(f"# {tid} 报告 · 模拟\n## 1. 摘要\n模拟运行。\n## 2. 产出\n## 3. 关键结论与数值\n"
                      "## 4. 开放问题（附默认值）\n## 5. 对基准的修改提案\n## 6. 需同步到其他文档\n## 7. 自检\n",
                      encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""合入前审核：让 GPT CLI（Codex，只读沙箱）审一个任务工作区里的产出。

作者要求审核也交给 GPT（gpt-6-astra），推理强度一律用最高档 ultra（作者 2026-09-29）。
监督代理在 `step.py finish <ID> --no-commit` 之后运行本脚本（建议后台运行）：

    python3 tools/agents/gpt_review.py <ID> [--checks FILE|TEXT]

脚本渲染任务提示词，列出工作区相对基点的改动，把改动过的图片作为附件，
让审核模型给出结论。最终回复存到 `.agents/reviews/<ID>.r<N>.md`，
第一行是 `VERDICT: PASS` 或 `VERDICT: FAIL`。监督代理只读这个 .md，不读同名 .log。
退出码：0 = PASS，1 = FAIL，2 = 审核没跑成（超时、报错、没有结论行）。
"""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp")

PROMPT = """你是任务 {task} 的合入前审核员。你只读：不修改、不新建、不删除任何文件，不执行改变仓库状态的命令。

当前目录是该任务的工作区，任务基点提交是 {base}。下面是执行代理收到的完整任务说明（含规则、要做的事、检查项）：

<<<任务说明
{task_prompt}
任务说明>>>

本次改动（相对基点，含未提交的改动）：
{stat}
未跟踪的新文件：{untracked}
{images_note}
{checks}
审核要求：
1. 逐项对照任务说明（以及上面的补充要点，如有）判断产出是否真正做到位，不要只看校验脚本是否通过。
2. 图片：逐张查看（附件之外的用 view_image 打开），必要时看原图局部。按任务说明里的风格规则、作者意见和禁止项（文字、水印、现代元素、像演员的脸、复刻具体作品的设计等）判断。
3. 文档与代码：用 `git diff {base}` 查看改动，核对与任务要求、仓库既有设定是否一致；可以运行任务说明"检查"一节里的只读检查命令。
4. 写集：改动是否只在任务允许的文件范围内；作者已通过（status: approved）的素材是否逐字节未动。

输出格式（严格遵守）：
第一行只写 `VERDICT: PASS` 或 `VERDICT: FAIL`（有任何一项不到位就是 FAIL）。
然后依次写：
## 逐项结论
- <素材 ID / 文件 / 要点>：通过 / 不通过 —— 理由（写具体看到了什么）
## 返修说明
仅 FAIL 时写：写成能直接交给执行代理的续作说明——哪一项、哪里不对、要改成什么样。
## 需作者确认
没有就写"无"。
"""


def run(args, cwd):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser(description="用 GPT CLI 做合入前审核（只读）")
    ap.add_argument("task")
    ap.add_argument("--checks", default="", help="监督代理补充的审核要点：文件路径或文本")
    ap.add_argument("--model", default="gpt-6-astra")
    ap.add_argument("--effort", default="ultra", help="none/minimal/low/medium/high/xhigh/max/ultra（默认最高档）")
    ap.add_argument("--bin", default=os.environ.get("CODEX_BIN", CODEX))
    ap.add_argument("--timeout-min", type=float, default=45)
    ap.add_argument("--max-images", type=int, default=8)
    ap.add_argument("--dry-run", action="store_true", help="只打印提示词与命令，不调用模型")
    a = ap.parse_args()

    wt = ROOT / ".agents" / "wt" / a.task
    if not wt.is_dir():
        sys.exit(f"✘ 没有工作区 {wt}")
    base = (json.loads((ROOT / ".agents" / "state.json").read_text()).get(a.task) or {}).get("base")
    if not base:
        sys.exit("✘ .agents/state.json 里没有本任务的基点")

    r = run([sys.executable, "tools/agents/run.py", "prompt", a.task], ROOT)
    if r.returncode or not r.stdout.strip():
        sys.exit("✘ 渲染任务提示词失败：" + (r.stderr or r.stdout)[-500:])
    task_prompt = r.stdout.strip()

    stat = run(["git", "diff", "--stat", base], wt).stdout.strip() or "（无已跟踪文件改动）"
    changed = [l.split("\t")[-1] for l in run(["git", "diff", "--name-status", base], wt).stdout.splitlines()
               if l and not l.startswith("D")]
    untracked = run(["git", "ls-files", "--others", "--exclude-standard"], wt).stdout.split()
    images = [f for f in changed + untracked if f.lower().endswith(IMAGE_EXT)]
    attach = images[: a.max_images]
    images_note = ""
    if images:
        images_note = "本次改动的图片（已作为附件）：" + "、".join(attach)
        if len(images) > len(attach):
            images_note += "；未附上、需用 view_image 查看的：" + "、".join(images[len(attach):])
        images_note += "\n"

    checks = a.checks
    if checks and Path(checks).is_file():
        checks = Path(checks).read_text(encoding="utf-8")
    checks = f"\n监督代理补充的审核要点：\n{checks.strip()}\n" if checks.strip() else ""

    out_dir = ROOT / ".agents" / "reviews"
    out_dir.mkdir(parents=True, exist_ok=True)
    n = 1 + len(list(out_dir.glob(f"{a.task}.r*.md")))
    out, log = out_dir / f"{a.task}.r{n}.md", out_dir / f"{a.task}.r{n}.log"

    prompt = PROMPT.format(task=a.task, base=base, task_prompt=task_prompt, stat=stat,
                           untracked="、".join(untracked) or "无", images_note=images_note, checks=checks)
    argv = [a.bin, "exec", "-m", a.model, "-c", f'model_reasoning_effort="{a.effort}"',
            "-s", "read-only", "--skip-git-repo-check", "-C", str(wt), "-o", str(out)]
    for f in attach:
        argv += ["-i", str(wt / f)]
    argv.append("-")  # 提示词经标准输入传入
    if a.dry_run:
        print(" ".join(argv[:-1]) + " -  < 提示词\n\n" + prompt)
        return 0

    print(f"▶ {a.task} GPT 审核第 {n} 轮（{a.model} · {a.effort}，附图 {len(attach)} 张）→ {out.relative_to(ROOT)}",
          flush=True)
    t0 = time.time()
    with open(log, "w", encoding="utf-8") as lf:
        try:
            rc = subprocess.run(argv, input=prompt, text=True, stdout=lf, stderr=subprocess.STDOUT,
                                cwd=str(wt), timeout=a.timeout_min * 60).returncode
        except subprocess.TimeoutExpired:
            print(f"REVIEW-TIMEOUT：超过 {a.timeout_min:g} 分钟，可重跑本脚本")
            return 2
    mins = (time.time() - t0) / 60
    first = out.read_text(encoding="utf-8").strip().splitlines()[0].strip() if out.exists() and out.stat().st_size else ""
    if rc != 0 or first not in ("VERDICT: PASS", "VERDICT: FAIL"):
        print(f"REVIEW-ERROR：退出码 {rc}，结论行 {first!r}（{mins:.1f} 分钟）；可重跑本脚本")
        return 2
    print(f"{first}（{mins:.1f} 分钟）；审核意见：{out.relative_to(ROOT)}")
    return 0 if first == "VERDICT: PASS" else 1


if __name__ == "__main__":
    sys.exit(main())

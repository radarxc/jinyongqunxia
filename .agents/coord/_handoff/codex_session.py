#!/usr/bin/env python3
"""AR-65：用 Codex gpt-6.1-sol 跑一个长会话（出图线、运维等）。Claude 只写目标说明、看结果（协调者 10-03 写）。

    python3 codex_session.py <名字> <说明.md> [--add-dir DIR ...] [--model gpt-6.1-sol] [--effort xhigh] [--cwd DIR]

用 detach_launch.py 起，脱离调用方进程树：
    python3 .agents/coord/_handoff/detach_launch.py .agents/coord/_lines/<名字>/launch.out $PWD -- \
        python3 -u .agents/coord/_handoff/codex_session.py <名字> <说明.md>

- 会话目录 .agents/coord/_lines/<名字>/：codex-home（auth / config 链接到 ~/.codex）、session.log、last.md、exit。
- 收件箱 .agents/coord/_inbox/<名字>.md：会话每完成一步追加一行（说明末尾自动附上汇报协议）；
  本脚本在会话启动、结束时各追加一行。协调者的 watch_drivers 会把收件箱新行转给协调者。
- 沙箱 workspace-write、开网络；可写目录 = cwd + 主检出 .git（入库提交要写）+ _prod/assets + --add-dir。
  cwd 默认是 _prod/.agents/coord：Codex 会把可写根下的 .agents 设成只读（实测 _prod 作根时 .agents/coord 写不进），
  所以把根放进 .agents/coord 里面，再把 assets 和 .git 加成可写。
  注意：沙箱里不能再嵌套起 codex exec（实测 workspace routing discovery failed），要出图就把任务排进
  沙箱外的 runner 队列，或直接用会话自带的 image_gen 工具。
- 断线续作（10-04 00:20 加）：会话非零退出、且本次日志新增部分里有模型容量不足、限流、断流、5xx 之类的临时错误时，
  等一会儿用 `codex exec resume --last`（本会话自己的 CODEX_HOME 里只有它一条记录）接着做，最多 --retries 次；
  第 4 次起换 --fallback-model。已经结束的会话也能续：加 --resume，可选 --prompt 给续作说明。
"""
import argparse
import json
import os
import re
import subprocess
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
GITDIR = Path("/Users/bytedance/Projects/jinyongqunxia/.git")

ap = argparse.ArgumentParser()
ap.add_argument("name")
ap.add_argument("brief")
ap.add_argument("--add-dir", action="append", default=[])
ap.add_argument("--model", default="gpt-6.1-sol")
ap.add_argument("--effort", default="xhigh")
ap.add_argument("--cwd", default=str(ROOT / ".agents/coord"))
ap.add_argument("--bin", default=CODEX, help="10-04：Codex 模型不可用时用 /Users/bytedance/.local/bin/traex")
ap.add_argument("--retries", type=int, default=8)
ap.add_argument("--fallback-model", default="gpt-6-astra")
ap.add_argument("--resume", action="store_true", help="不重发说明，直接续作这个会话最近一次记录")
ap.add_argument("--prompt", default="", help="续作时发给会话的话；默认是通用的「接着做」")
a = ap.parse_args()
TRANSIENT = re.compile(r"at capacity|stream disconnected|rate.?limit|too many requests|\b(429|500|502|503|504)\b|"
                       r"internal server error|overloaded|service unavailable|timed? ?out|connection (reset|refused|closed)", re.I)
RESUME_TEXT = ("上一次运行因模型容量不足或网络中断停了下来。请接着做：先看收件箱 {inbox} 的最后几行和你的产物目录，"
               "确认已经做完、已经提交的部分，不要重复入库；出图器队列里已排的作业会照常跑完，先收结果再决定是否补排。"
               "汇报协议和规矩不变。")

d = ROOT / ".agents/coord/_lines" / a.name
d.mkdir(parents=True, exist_ok=True)
home = d / "codex-home"
home.mkdir(exist_ok=True)
for n in ("auth.json", "config.toml"):
    link = home / n
    if not link.exists() and not link.is_symlink():
        link.symlink_to(Path.home() / ".codex" / n)
inbox = ROOT / ".agents/coord/_inbox" / f"{a.name}.md"
inbox.parent.mkdir(parents=True, exist_ok=True)


def note(msg: str) -> None:
    with open(inbox, "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")


brief = "" if a.resume else (ROOT / a.brief if not Path(a.brief).is_absolute() else Path(a.brief)).read_text(encoding="utf-8")
footer = f"""

---
## 路径约定
- 仓库工作根是 `{ROOT}`（集成分支 _prod）；说明与交接文件里的相对路径都相对它。你的 shell 默认在 `{ROOT}/.agents/coord`，跑命令前先 `cd` 到对应目录或用绝对路径。
- 可写：`{ROOT}/.agents/coord/**`、`{ROOT}/assets/**`、主检出 `.git`（提交用）。其余只读；需要写别处时追加一行「【请判断】」说明。

## 汇报协议（必须遵守）
- 每完成一步（一批图入库、一个阶段结束、遇到阻塞）就往 `{inbox}` 追加**一行**中文：`[时间] 做了什么 / 提交号 / 产物路径 / 下一步`。只追加，不改写已有行。
- 需要协调者判断或作者拍板时，追加一行以「【请判断】」开头，写清选项和你的建议，然后继续做不受影响的部分。
- 全部做完追加一行以「【完成】」开头的总结；做不下去追加一行以「【停止】」开头，写明原因与剩余事项。
- 规矩：不 push；不读 `.env`；不改 `~/.trae`、浏览器与系统设置；对外请求一律用通用标识（如 TianshuBot/1.0），Header、URL 参数、表单里不放作者邮箱、用户名等个人标识；集成分支 `{ROOT}` 上改了文件就立刻按路径提交，不留未提交改动。
"""
# 续作时沿用首次启动的 --add-dir（10-04 01:05 加：hist-batch2 续作漏传，imagegen-reference 变成只读）
saved = d / "add_dirs.json"
if a.resume and not a.add_dir and saved.exists():
    a.add_dir = json.loads(saved.read_text(encoding="utf-8"))
elif not a.resume:
    saved.write_text(json.dumps(a.add_dir, ensure_ascii=False), encoding="utf-8")
roots = [str(GITDIR), str(ROOT / "assets"), *a.add_dir]
argv = [a.bin, "exec", "-m", a.model, "-c", f'model_reasoning_effort="{a.effort}"', "-s", "workspace-write",
        "-c", "sandbox_workspace_write.network_access=true", "--skip-git-repo-check", "-C", a.cwd,
        "--add-dir", str(GITDIR), "--add-dir", str(ROOT / "assets")]
for x in a.add_dir:
    argv += ["--add-dir", x]
argv += ["-o", str(d / "last.md"), "-"]
IS_TRAEX = "trae" in os.path.basename(a.bin)
env = dict(os.environ) if IS_TRAEX else {**os.environ, "CODEX_HOME": str(home)}
if IS_TRAEX:
    argv = argv[:-1] + ["-c", "skills.include_instructions=false", "-"]
log = d / "session.log"


def run(cmd, text):
    """跑一次，返回 (退出码, 本次新增日志)。"""
    start = log.stat().st_size if log.exists() else 0
    with open(log, "a", encoding="utf-8") as lf:
        rc = subprocess.run(cmd, input=text, text=True, stdout=lf, stderr=subprocess.STDOUT, cwd=a.cwd, env=env).returncode
    with open(log, "rb") as f:
        f.seek(start)
        return rc, f.read().decode("utf-8", "replace")


def resume_argv(model):
    return [a.bin, "exec", "resume", "--last", "-m", model, "-c", f'model_reasoning_effort="{a.effort}"',
            "-c", 'sandbox_mode="workspace-write"', "-c", "sandbox_workspace_write.network_access=true",
            "-c", f"sandbox_workspace_write.writable_roots={json.dumps(roots, ensure_ascii=False)}",
            "--skip-git-repo-check", "-o", str(d / "last.md"), "-"]


if a.resume:
    note(f"协调者续作（{a.model} · {a.effort}）")
    rc, out = run(resume_argv(a.model), a.prompt or RESUME_TEXT.format(inbox=inbox))
else:
    note(f"会话启动（{a.model} · {a.effort}），说明 {a.brief}")
    rc, out = run(argv, brief + footer)
tries = 0
while rc != 0 and tries < a.retries:
    m = TRANSIENT.search(out[-4000:])
    if not m:
        break
    tries += 1
    model = a.model if tries <= 3 else a.fallback_model
    wait = min(60 * tries, 300)
    note(f"会话中断（{m.group(0)}），{wait} 秒后第 {tries} 次续作（{model}）")
    time.sleep(wait)
    rc, out = run(resume_argv(model), RESUME_TEXT.format(inbox=inbox))
(d / "exit").write_text(str(rc), encoding="utf-8")
last = (d / "last.md").read_text(encoding="utf-8").strip().replace("\n", " ")[:300] if (d / "last.md").exists() else ""
note(f"会话结束 rc={rc}：{last}")

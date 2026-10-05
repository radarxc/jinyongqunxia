"""step.py 的执行器启动参数：traex 按次关闭技能说明（2026-10-03，开发监督）。

traex 会把作者本机 ~/.trae/skills 的技能清单放进提示词，执行器曾自行调起 bits-unit-test-gen 卡死。
启动 traex 时加 `-c skills.include_instructions=false`；Codex 不加（不认这项配置）。
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import step as S  # noqa: E402


class TraexArgsTest(unittest.TestCase):
    def test_traex_disables_skill_instructions(self) -> None:
        argv = S.build_argv("/Users/x/.local/bin/traex", "GPT-5.6-Sol", "max", Path("/w"), Path("/l"), False, [])
        self.assertIn("skills.include_instructions=false", argv)
        self.assertEqual(argv[-1], "-")

    def test_codex_unchanged(self) -> None:
        argv = S.build_argv("/Applications/ChatGPT.app/codex-cli/bin/codex", "gpt-6-astra", "xhigh",
                            Path("/w"), Path("/l"), False, [])
        self.assertNotIn("skills.include_instructions=false", argv)


if __name__ == "__main__":
    unittest.main()

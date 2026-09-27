"""Tests for the repository ID consistency checker.

The suite uses only the Python standard library and builds small temporary
repositories so each rule is exercised independently of the current docs.
"""

from __future__ import annotations

import io
import json
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from typing import List
from unittest import mock

from tools.lint import check_ids


CANON_WITH_PREFIXES = """# Canon

## 12. ID 命名

| 对象 | 格式 |
|---|---|
| 书界 | `chNN_<pinyin>` |
| 武学 | `sk_<pinyin>` |
| Buff | `bf_<pinyin>` |
| 套装 | `set_<pinyin>` |
| 物品 | `it_<pinyin>` |
| NPC | `npc_<pinyin>` |
| 任务 | `q_<pinyin>` |
| 门派 | `sect_<pinyin>` |
| 地形 | `tr_<pinyin>` |
| 成就 | `ach_<pinyin>` |
| 城市 | `city_<pinyin>` |
| 区域 | `rg_<pinyin>` |
| 场景 | `sc_<pinyin>` |
| 穴道 | `ap_<pinyin>` |
| 范围 | `aoe_<pinyin>` |
| 资源点 | `rp_<pinyin>` |
| 营生 | `biz_<pinyin>` |
| 选择 | `dc_<pinyin>` |
| 视频 | `vid_<pinyin>` |
| 路线 | `route_<pinyin>` |
| 经脉 | `mer_<pinyin>` |
| 测试扩展 | `zz_<pinyin>` |

## 13. 其他
"""

RULINGS_WITH_RENAME = """# Rulings

## 2. 重命名与同物去重表

| 旧 ID | 新 ID |
|---|---|
| `bs_boss` | `bsc_boss` |

## 3. 其他
"""


class TemporaryRepository:
    def __init__(self) -> None:
        self._temporary = tempfile.TemporaryDirectory()
        self.root = Path(self._temporary.name)

    def __enter__(self) -> "TemporaryRepository":
        return self

    def __exit__(self, *args: object) -> None:
        self._temporary.cleanup()

    def write(self, relative: str, text: str) -> Path:
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def add_support_files(self) -> None:
        self.write(check_ids.CANON_REL, CANON_WITH_PREFIXES)
        self.write(check_ids.RULINGS_REL, RULINGS_WITH_RENAME)
        self.write(
            "tools/lint/check_ids_near_allowlist.json",
            '{"schema_version": 1, "pairs": []}\n',
        )


def occurrence(identifier: str, file: str, line: int = 1) -> check_ids.Occurrence:
    return check_ids.Occurrence(
        id=identifier,
        location=check_ids.Location(file, line, 1),
        context="uses `{}`".format(identifier),
        section="## Active",
        h2="1. Active",
        in_fence=False,
    )


class PrefixParsingTests(unittest.TestCase):
    def test_parses_prefixes_from_canon_including_new_family(self) -> None:
        with TemporaryRepository() as repo:
            canon = repo.write(check_ids.CANON_REL, CANON_WITH_PREFIXES)
            warnings: List[str] = []

            prefixes, used_fallback = check_ids.parse_prefixes(canon, warnings)

        self.assertFalse(used_fallback)
        self.assertIn("zz_", prefixes)
        self.assertIn("ch", prefixes)
        self.assertEqual([], warnings)

    def test_falls_back_with_warning_when_canon_cannot_be_parsed(self) -> None:
        with TemporaryRepository() as repo:
            canon = repo.write(check_ids.CANON_REL, "# no section 12\n")
            warnings: List[str] = []

            prefixes, used_fallback = check_ids.parse_prefixes(canon, warnings)

        self.assertTrue(used_fallback)
        self.assertIn("bsc_", prefixes)
        self.assertTrue(any("built-in prefixes" in item for item in warnings))


class ExtractionTests(unittest.TestCase):
    def test_extracts_table_heading_yaml_and_fenced_list_but_not_paths(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            table = repo.write(
                "docs/design/05-martial-arts-system.md",
                """# 武学

## 1. 正式目录

| ID | 名称 |
|---|---|
| `sk_table` | 表格武学 |

##### 标题武学 `sk_heading`

引用 `sk_reference`，路径 `content/sk_path.yaml`，模板 `sk_<拼音>`。

```yaml
skills:
  - sk_fenced_reference
```
""",
            )
            yaml = repo.write(
                "docs/design/06-buff-system.md",
                """# Buff

## 1. 定义

```yaml
- id: bf_yaml
  name: YAML Buff
```
""",
            )
            warnings: List[str] = []
            prefixes, _ = check_ids.parse_prefixes(
                repo.root / check_ids.CANON_REL, warnings
            )
            regex = check_ids.compile_id_regex(prefixes)
            documents = [
                check_ids.load_document(path, repo.root, warnings)
                for path in (table, yaml)
            ]
            loaded = [doc for doc in documents if doc is not None]

            occurrences, definitions = check_ids.extract_occurrences(loaded, prefixes, regex)

        found = {item.id for item in occurrences}
        defined = {item.id for item in definitions}
        self.assertTrue(
            {"sk_table", "sk_heading", "sk_reference",
             "sk_fenced_reference", "bf_yaml"}.issubset(found)
        )
        self.assertNotIn("sk_path", found)
        self.assertEqual({"sk_table", "sk_heading", "bf_yaml"}, defined)

    def test_buff_family_registry_allows_two_ids_in_one_family_cell(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            path = repo.write(
                "docs/design/06-buff-system.md",
                """# Buff

## 4.3 叠加族

| 族 ID | 覆盖 | 族 ID | 覆盖 |
|---|---|---|---|
| `fam_pct_<stat>` | PCT | `fam_z3` / `fam_z4` | 增伤 / 减伤 |
""",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            doc = check_ids.load_document(path, repo.root, warnings)
            self.assertIsNotNone(doc)

            _, definitions = check_ids.extract_occurrences([doc], prefixes, regex)  # type: ignore[list-item]

        self.assertEqual({"fam_z3", "fam_z4"}, {item.id for item in definitions})

    def test_yaml_source_id_field_and_mapping_key_define_ids(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/map/cities.yaml",
                '''{
  "cities": [{"id": "city_yaml", "next": "city_missing"}],
  "city_keyed": {"name": "键式城市"}
}
''',
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("city_yaml", undefined)
        self.assertNotIn("city_keyed", undefined)
        self.assertIn("city_missing", undefined)

    def test_owner_table_defines_but_non_owner_table_only_references(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/15-meridians-and-acupoints.md",
                "# 经脉\n\n| 序 | 穴道 ID | 名称 |\n|---|---|---|\n"
                "| 1 | `ap_owner` | 正式穴道 |\n",
            )
            repo.write(
                "docs/design/03-attributes.md",
                "# 属性\n\n| 序 | 穴道 ID | 名称 |\n|---|---|---|\n"
                "| 1 | `ap_non_owner` | 误放定义 |\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("ap_owner", undefined)
        self.assertIn("ap_non_owner", undefined)

    def test_owner_fenced_mapping_key_defines_id(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/15-meridians-and-acupoints.md",
                "# 经脉\n\n```yaml\npoints:\n  ap_keyed:\n"
                "    name: 键式穴位\n```\n",
            )
            repo.write(
                "docs/design/03-attributes.md",
                "# 属性\n\n引用 `ap_keyed`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("ap_keyed", undefined)

    def test_unique_owners_reject_legacy_npc_sect_and_main_quest_definitions(
        self,
    ) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write("docs/design/18-npc-and-companions.md", "# NPC\n")
            repo.write(
                "docs/design/12-quests-npc-factions.md",
                "# 任务\n\n```yaml\nid: npc_wrong_owner\n"
                "ownerSectId: sect_wrong_owner\n```\n",
            )
            repo.write(
                "docs/design/chapters/01-demo.md",
                "# 第一界\n\n| ID | 名称 |\n|---|---|\n"
                "| `q_01_main_c_01` | 仅索引 |\n",
            )
            repo.write(
                "docs/design/story/01-demo.md",
                "# 第一界剧情\n\n## 本文新增术语与 ID\n\n"
                "生产任务 `q_01_main_01..02`。\n",
            )
            repo.write(
                "docs/design/03-attributes.md",
                "# 属性\n\n外部引用 `q_01_main_02`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue(
            {"npc_wrong_owner", "sect_wrong_owner", "q_01_main_c_01"}
            <= undefined
        )
        self.assertTrue({"q_01_main_01", "q_01_main_02"}.isdisjoint(undefined))

    def test_owner_region_id_name_column_defines_region(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/11-open-world.md",
                "# 开放世界\n\n| # | 区域 ID / 名称 | 职责 |\n|---|---|---|\n"
                "| 1 | `rg_demo` 演示区域 | 测试 |\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("rg_demo", undefined)

    def test_region_draft_and_chapter_rows_do_not_redefine_global_region(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/11-open-world.md",
                "# 开放世界\n\n| # | 区域 ID / 名称 |\n|---|---|\n"
                "| 1 | `rg_shared` 正式区域 |\n",
            )
            repo.write(
                "docs/design/19-world-map.md",
                "# 地图\n\n| ID | 名称 |\n|---|---|\n"
                "| `rg_shared` | 草案区域 |\n",
            )
            repo.write(
                "docs/design/chapters/01-demo.md",
                "# 第一界\n\n| ID | 名称 |\n|---|---|\n"
                "| `rg_shared` | 本界称呼 |\n",
            )

            report = check_ids.build_report(repo.root, [])

        definitions = [
            item for item in report["issues"]["conflicting_definitions"]
            if item["id"] == "rg_shared"
        ]
        self.assertEqual([], definitions)

    def test_owner_production_id_cell_can_define_multiple_ids(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/09-combat-system.md",
                "# 战斗\n\n| 族 | 生产 ID |\n|---|---|\n"
                "| 点 | `aoe_one` / `aoe_two` |\n",
            )
            repo.write(
                "docs/design/05-martial-arts-system.md",
                "# 武学\n\n| 族 | 生产 ID |\n|---|---|\n"
                "| 引用 | `aoe_wrong_owner` / `aoe_one` |\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue({"aoe_one", "aoe_two"}.isdisjoint(undefined))
        self.assertIn("aoe_wrong_owner", undefined)

    def test_chapter_and_story_instances_require_matching_book_number(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/chapters/01-demo.md",
                "# 第一界\n\n| 区域 | 场景键 1 | 场景键 2 |\n|---|---|---|\n"
                "| 中原 | `sc_01_gate` | `sc_02_wrong` |\n\n"
                "| 资源点 ID | 营生场所 |\n|---|---|\n"
                "| `rp_demo_01` | `biz_demo_01` |\n",
            )
            repo.write(
                "docs/design/story/01-demo.md",
                "# 第一界剧情\n\n| ID | 名称 |\n|---|---|\n"
                "| `q_01_main_c_01` | 第一幕 |\n"
                "| `dc_01_01` | 选择 |\n"
                "| `dc_02_01` | 错界选择 |\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue({"sc_02_wrong", "dc_02_01"} <= undefined)
        self.assertTrue(
            {"sc_01_gate", "rp_demo_01", "biz_demo_01",
             "q_01_main_c_01", "dc_01_01"}.isdisjoint(undefined)
        )

    def test_task_local_keys_are_suppressed_only_in_their_quest_block(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/story/01-demo.md",
                """# 剧情

```yaml
schemaVersion: quest.v1
id: q_01_main_c_01
stages:
  - id: st_choose
    transitions:
      - id: tr_local_exit
        to: st_close
    checks: [{id: chk_gate}]
    effects: [{id: fx_reward}]
```

另一个任务错误引用 `tr_local_exit`。
""",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertEqual({"tr_local_exit"}, undefined)

    def test_task_local_id_in_family_owner_does_not_define_global_id(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/08-terrain-and-qinggong.md",
                "# 地形\n\n```yaml\nschemaVersion: quest.v1\n"
                "id: q_01_side_01\ntransitions:\n  - id: tr_local_exit\n```\n",
            )
            repo.write(
                "docs/design/03-attributes.md",
                "# 属性\n\n错误跨任务引用 `tr_local_exit`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertIn("tr_local_exit", undefined)

    def test_explicit_fixture_quest_id_is_not_a_live_global_reference(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/12-quests-npc-factions.md",
                "# 任务\n\n```yaml\nschemaVersion: quest.v1\n"
                "fixture: true\nid: q_01_main_90\nstages: []\n```\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("q_01_main_90", undefined)

    def test_explicit_example_suffix_is_not_a_live_reference(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/13-progression-and-endings.md",
                "# 成就\n\n示范 `ach_example` 与 `ach_example_first`；"
                "真实漏项 `ach_real_missing`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertEqual({"ach_real_missing"}, undefined)

    def test_single_letter_suffix_is_not_implicitly_a_placeholder(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write("docs/design/18-npc-and-companions.md", "# NPC\n")
            repo.write(
                "docs/design/03-attributes.md",
                "# 属性\n\n真实漏项 `npc_guard_a`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        self.assertEqual(
            ["npc_guard_a"],
            [item["id"] for item in report["issues"]["undefined_references"]],
        )

    def test_legacy_definition_bullets_define_cache_and_fragments(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/20-legacy-inheritance.md",
                "# 传承\n\n#### 1 · 示例 `lgs_demo`\n\n"
                "- **载体 / 投放**：旧匣；`cache_demo`。\n"
                "- **三卷 / 信物**：`frag_demo_upper`、`frag_demo_middle`、"
                "`frag_demo_lower`；`it_demo_keystone`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue(
            {"lgs_demo", "cache_demo", "frag_demo_upper",
             "frag_demo_middle", "frag_demo_lower"}.isdisjoint(undefined)
        )
        self.assertIn("it_demo_keystone", undefined)

    def test_parameterized_sleep_video_allows_only_adjacent_books(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/02-timeline-and-world-tiers.md",
                "# 时间线\n\n合法 `vid_sleep_02_03`；非法 `vid_sleep_02_04`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("vid_sleep_02_03", undefined)
        self.assertIn("vid_sleep_02_04", undefined)

    def test_finale_sleep_video_is_ignored_only_when_explicitly_negated(self) -> None:
        cases = (
            (
                "归梦不经过普通相邻转场 `vid_sleep_14_15`；改用独立终局资源。",
                "vid_sleep_14_15",
                False,
            ),
            (
                "归梦不创建 `vid_sleep_14_15`，只加载独立终局资源。",
                "vid_sleep_14_15",
                False,
            ),
            (
                "归梦播放普通相邻转场 `vid_sleep_14_15`。",
                "vid_sleep_14_15",
                True,
            ),
            (
                "测试不经过普通相邻转场 `vid_sleep_13_15`。",
                "vid_sleep_13_15",
                True,
            ),
        )
        for text, identifier, should_report in cases:
            with self.subTest(text=text):
                with TemporaryRepository() as repo:
                    repo.add_support_files()
                    repo.write(
                        "docs/design/chapters/14-demo.md",
                        "# 第十四界\n\n{}\n".format(text),
                    )

                    report = check_ids.build_report(repo.root, [])

                undefined = {
                    item["id"]
                    for item in report["issues"]["undefined_references"]
                }
                self.assertEqual(should_report, identifier in undefined)

    def test_protocol_discriminator_is_not_a_set_reference_only_in_exact_context(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/07-set-system.md",
                "# 套装\n\n| ID | 名称 |\n|---|---|\n| `set_real` | 真套装 |\n",
            )
            repo.write(
                "docs/tech/08-backend-and-online.md",
                '# 后端\n\n```json\n'
                '{"kind": {"const": "set_allowed_flag"}}\n'
                '```\n\n普通引用 `set_missing`。\n',
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertNotIn("set_allowed_flag", undefined)
        self.assertIn("set_missing", undefined)

    def test_protocol_discriminator_exception_does_not_hide_live_use(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/07-set-system.md",
                "# 套装\n\n| ID | 名称 |\n|---|---|\n| `set_real` | 真套装 |\n",
            )
            repo.write(
                "docs/tech/08-backend-and-online.md",
                "# 后端\n\n正文引用 `set_allowed_flag`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertIn("set_allowed_flag", undefined)

    def test_declared_action_and_modifier_keys_are_not_set_ids(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/07-set-system.md",
                "# 套装\n\n### 9.1 `set_real` 真套装\n\n"
                "| 项 | 定稿 |\n|---|---|\n| 成员（1） | `sk_alpha` |\n",
            )
            repo.write(
                "docs/design/03-attributes.md",
                "# 属性\n\n修饰族 `flat_mov` / `pct_mov` / `set_mov`。\n"
                "真实套装漏项 `set_missing`。\n",
            )
            repo.write(
                "docs/design/12-quests-npc-factions.md",
                "# 任务\n\n```yaml\n"
                "allowedEffects: [affinity_delta, set_allowed_flag]\n```\n"
                "效果操作仍称 `set_allowed_flag`。\n",
            )
            repo.write(
                "docs/design/16-resources-and-estates.md",
                "# 资源\n\n```ts\ntype Action =\n"
                "  | { kind: 'set_resource_point_ownership' }\n"
                "  | { kind: 'set_resource_point_level' };\n```\n"
                "动作 `set_resource_point_level` 只允许相邻升级。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue(
            {"set_mov", "set_allowed_flag",
             "set_resource_point_ownership",
             "set_resource_point_level"}.isdisjoint(undefined)
        )
        self.assertIn("set_missing", undefined)

    def test_migration_negative_and_fixture_contexts_are_not_live(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/11-open-world.md",
                "# 世界\n\n### 2.3 旧区到新区迁移\n\n"
                "| W1 旧区 | 本文定稿区 |\n|---|---|\n"
                "| `rg_legacy` | `rg_current` |\n\n"
                "## 3. 活跃正文\n\n错误继续使用 `rg_legacy`。\n",
            )
            repo.write(
                "docs/decisions/canon-proposals-v1.2.md",
                "# 提案\n\n| 编号 | 提案 | 结论 |\n|---|---|---|\n"
                "| CP-45 | 恢复 `q_08_main_01` | 不采纳 |\n",
            )
            repo.write(
                "docs/design/12-quests-npc-factions.md",
                "# 任务\n\n```yaml\nschemaVersion: quest.v1\nfixture: true\n"
                "id: q_08_main_02\n```\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"]: item for item in report["issues"]["undefined_references"]}
        self.assertEqual(1, undefined["rg_legacy"]["references"])
        self.assertNotIn("rg_current", undefined)
        self.assertNotIn("q_08_main_01", undefined)
        self.assertNotIn("q_08_main_02", undefined)

    def test_route_state_keys_are_not_blanket_exempted(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/map/routes.yaml",
                '{"routes": [{"id": "route_city_bridge"}]}\n',
            )
            repo.write(
                "docs/design/story/04-demo.md",
                "# 剧情\n\n活动状态 `route_04`、`route_zheng`；"
                "地图路线 `route_city_bridge`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue({"route_04", "route_zheng"} <= undefined)
        self.assertNotIn("route_city_bridge", undefined)

    def test_asset_owner_defines_three_finale_videos_in_one_catalog_cell(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/tech/07-asset-generation.md",
                "# 素材生成\n\n| ID | 内容 | 数量 |\n|---|---|---|\n"
                "| `vid_end_a` / `vid_end_b` / `vid_end_c` | 三条既定结局成片 | 3 |\n",
            )

            report = check_ids.build_report(repo.root, [])

        undefined = {item["id"] for item in report["issues"]["undefined_references"]}
        self.assertTrue({"vid_end_a", "vid_end_b", "vid_end_c"}.isdisjoint(undefined))


class IssueCategoryTests(unittest.TestCase):
    def test_category_1_reports_undefined_and_accepts_parameterized_family(self) -> None:
        with TemporaryRepository() as repo:
            repo.write("docs/design/05-martial-arts-system.md", "# owner\n")
            repo.write("docs/design/06-buff-system.md", "# owner\n")
            occurrences = [
                occurrence("sk_missing", "docs/design/09-combat-system.md"),
                occurrence("fam_pct_combo", "docs/design/10-items-and-equipment.md"),
            ]

            issues = check_ids.undefined_issues(
                repo.root, occurrences, [], list(check_ids.DEFAULT_PREFIXES)
            )

        self.assertEqual(["sk_missing"], [item["id"] for item in issues])

    def test_category_2_reports_name_conflict_and_prefers_skill_catalog(self) -> None:
        conflict = [
            check_ids.Definition(
                "it_same", check_ids.Location("docs/a.md", 1, 1), "甲", "table"
            ),
            check_ids.Definition(
                "it_same", check_ids.Location("docs/b.md", 2, 1), "乙", "yaml-id"
            ),
            check_ids.Definition(
                "it_local", check_ids.Location("docs/a.md", 3, 1), "丙", "table"
            ),
            check_ids.Definition(
                "it_local", check_ids.Location("docs/a.md", 8, 1), "丁", "yaml-id"
            ),
        ]
        skill_summary_and_catalog = [
            check_ids.Definition(
                "sk_suxin",
                check_ids.Location("docs/design/05-martial-arts-system.md", 10, 1),
                "双人合璧：玉女素心剑法",
                "heading",
            ),
            check_ids.Definition(
                "sk_suxin",
                check_ids.Location("docs/design/catalog/skills-daojia.md", 20, 1),
                "玉女素心剑法",
                "table",
            ),
        ]

        issues = check_ids.duplicate_issues(conflict + skill_summary_and_catalog)

        self.assertEqual(["it_local", "it_same"], [item["id"] for item in issues])
        self.assertEqual(["丁", "丙"], issues[0]["values"])
        self.assertEqual(["乙", "甲"], issues[1]["values"])

    def test_category_3_reports_close_defined_and_undefined_spellings(self) -> None:
        occurrences = [
            occurrence("tr_shekou", "docs/design/08-terrain-and-qinggong.md", 4),
            occurrence("tr_sheku", "docs/design/08-terrain-and-qinggong.md", 8),
        ]
        occurrences[1].definition = True
        definitions = [
            check_ids.Definition(
                "tr_sheku",
                check_ids.Location("docs/design/08-terrain-and-qinggong.md", 8, 1),
                "蛇窟",
                "table",
            )
        ]

        issues = check_ids.near_match_issues(
            occurrences, definitions, list(check_ids.DEFAULT_PREFIXES)
        )

        self.assertEqual(1, len(issues))
        self.assertEqual(["tr_shekou", "tr_sheku"], issues[0]["ids"])
        self.assertLessEqual(issues[0]["distance"], 2)

    def test_category_3_ignores_task_local_ids(self) -> None:
        local = occurrence(
            "tr_shekou", "docs/design/story/01-demo.md", 4
        )
        local.local = True
        definitions = [
            check_ids.Definition(
                "tr_sheku",
                check_ids.Location(
                    "docs/design/08-terrain-and-qinggong.md", 8, 1
                ),
                "蛇窟",
                "table",
            )
        ]

        issues = check_ids.near_match_issues(
            [local], definitions, list(check_ids.DEFAULT_PREFIXES)
        )

        self.assertEqual([], issues)

    def test_category_3_uses_definition_location_when_id_has_no_active_occurrence(
        self,
    ) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/catalog/npcs-test.md",
                """# NPC 图鉴

## 1. 正式目录

| ID | 名称 | 定位 |
|---|---|---|
| `npc_shijian` | 侍剑 | 基础模板 |

活动正文引用 `npc_shixian`。
""",
            )

            report = check_ids.build_report(repo.root, [])

        near_matches = report["issues"]["near_matches"]
        self.assertEqual(1, len(near_matches))
        self.assertEqual(["npc_shijian", "npc_shixian"], near_matches[0]["ids"])
        self.assertEqual(
            {
                "file": "docs/design/catalog/npcs-test.md",
                "line": 7,
                "column": 4,
            },
            near_matches[0]["locations"][0],
        )
        self.assertEqual(
            ["npc_shixian"],
            [item["id"] for item in report["issues"]["undefined_references"]],
        )

    def test_category_4_parses_rename_table_and_ignores_migration_prose(self) -> None:
        with TemporaryRepository() as repo:
            rulings = repo.write(check_ids.RULINGS_REL, RULINGS_WITH_RENAME)
            active = repo.write(
                "docs/design/09-combat-system.md",
                "# 战斗\n\n## 1. 正文\n\n使用 `bs_boss`。\n旧 ID `bs_boss` 迁移说明。\n",
            )
            warnings: List[str] = []
            rules = check_ids.parse_rename_rules(rulings, warnings)
            doc = check_ids.load_document(active, repo.root, warnings)
            self.assertIsNotNone(doc)

            issues = check_ids.old_id_issues([doc], rules)  # type: ignore[list-item]

        self.assertEqual(1, len(issues))
        self.assertEqual("bs_boss", issues[0]["old_id"])
        self.assertEqual("bsc_boss", issues[0]["replacement"])

    def test_category_4_parses_set_19_merge_and_delete_destinations(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            set_path = repo.write(
                check_ids.SET_SYSTEM_REL,
                """# 套装

## 19. 候选收敛与去向

### 19.2 合并到正式套装

| 原候选 | 去向 | 理由 |
|---|---|---|
| `set_old_a`、`set_old_b` | 并入 `set_final_a`／`set_final_b` | 重叠 |

### 19.3 删除：成员不足或延后

| 图鉴 | 未入选候选（逐项） | 去向／理由 |
|---|---|---|
| 示例 | `set_old_c` | 删除；留未来扩展 |
""",
            )
            active = repo.write(
                "docs/design/05-martial-arts-system.md",
                "# 武学\n\n仍引用 `set_old_a` 与 `set_old_c`。\n",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            set_doc = check_ids.load_document(set_path, repo.root, warnings)
            active_doc = check_ids.load_document(active, repo.root, warnings)
            self.assertIsNotNone(set_doc)
            self.assertIsNotNone(active_doc)

            rules = check_ids.parse_set_deprecation_rules(set_doc, regex)  # type: ignore[arg-type]
            issues = check_ids.old_id_issues([set_doc, active_doc], rules)  # type: ignore[list-item]

        self.assertEqual(3, len(rules))
        replacements = {rule.old: rule.new for rule in rules}
        self.assertEqual("set_final_a / set_final_b", replacements["set_old_a"])
        self.assertEqual("删除 / 延后", replacements["set_old_c"])
        self.assertEqual(["set_old_a", "set_old_c"], [item["old_id"] for item in issues])

    def test_deprecated_set_is_not_also_reported_as_undefined(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                check_ids.SET_SYSTEM_REL,
                "# 套装\n\n## 19. 候选收敛与去向\n\n"
                "### 19.3 删除\n\n| 图鉴 | 未入选候选 | 去向 |\n"
                "|---|---|---|\n| 示例 | `set_retired` | 删除 |\n",
            )
            repo.write(
                "docs/design/05-martial-arts-system.md",
                "# 武学\n\n活动正文引用 `set_retired`。\n",
            )

            report = check_ids.build_report(repo.root, [])

        self.assertNotIn(
            "set_retired",
            {item["id"] for item in report["issues"]["undefined_references"]},
        )
        self.assertEqual(
            [("set_retired", "删除 / 延后")],
            [(item["old_id"], item["replacement"])
             for item in report["issues"]["deprecated_ids"]],
        )

    def test_category_5_reports_both_set_membership_directions(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            set_path = repo.write(
                check_ids.SET_SYSTEM_REL,
                """# 套装

## 9. 正式目录

### 9.1 `set_demo` 示例套装

| 项 | 定稿 |
|---|---|
| 成员（2） | `sk_alpha`、`sk_beta` |
""",
            )
            catalog_path = repo.write(
                "docs/design/catalog/skills-test.md",
                """# 图鉴

## 1. 武学

| ID | 名称 | setTags |
|---|---|---|
| `sk_alpha` | 甲 | `set_demo` |
| `sk_beta` | 乙 | — |
| `sk_gamma` | 丙 | `set_demo` |
""",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            documents = [
                check_ids.load_document(path, repo.root, warnings)
                for path in (set_path, catalog_path)
            ]
            loaded = [doc for doc in documents if doc is not None]
            _, definitions = check_ids.extract_occurrences(loaded, prefixes, regex)

            issues, status = check_ids.set_symmetry_issues(
                repo.root, loaded, definitions, regex, warnings
            )

        self.assertEqual("checked: 1 SetDef entries", status)
        self.assertEqual(
            {
                ("member_missing_setTag", "set_demo", "sk_beta"),
                ("set_missing_member", "set_demo", "sk_gamma"),
            },
            {(item["direction"], item["set_id"], item["member_id"]) for item in issues},
        )

    def test_member_tags_survive_later_summaries_and_parse_bold_cards(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            set_path = repo.write(
                check_ids.SET_SYSTEM_REL,
                "# 套装\n\n## 9. 正式目录\n\n"
                "### 9.1 `set_demo` 示例套装\n\n"
                "| 项 | 定稿 |\n|---|---|\n"
                "| 成员（2） | `sk_alpha`、`sk_beta` |\n",
            )
            catalog_path = repo.write(
                "docs/design/catalog/skills-test.md",
                "# 图鉴\n\n## 1. 完整卡\n\n"
                "### 1.1 `sk_alpha` 甲\n\n"
                "| 字段 | 值 |\n|---|---|\n"
                "| setTags | `[set_demo]` |\n\n"
                "**`sk_beta` 乙**（玄阶）\n"
                "- **字段**：`setTags:[set_demo]`。\n\n"
                "#### 1.3 丙 `sk_gamma`（用户示例套装成员）\n\n"
                "```yaml\nid: sk_gamma\nname: 丙\n"
                + "notes:\n" + "  - 说明\n" * 85
                + "setTags: [set_demo]\n```\n\n"
                "## 2. ID 清单\n\n"
                "| ID | 名称 |\n|---|---|\n"
                "| `sk_alpha` | 甲 |\n| `sk_beta` | 乙 |\n| `sk_gamma` | 丙 |\n",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            documents = [
                check_ids.load_document(path, repo.root, warnings)
                for path in (set_path, catalog_path)
            ]
            loaded = [doc for doc in documents if doc is not None]
            _, definitions = check_ids.extract_occurrences(loaded, prefixes, regex)

            issues, _ = check_ids.set_symmetry_issues(
                repo.root, loaded, definitions, regex, warnings
            )

        self.assertEqual(
            [("set_missing_member", "sk_gamma")],
            [(item["direction"], item["member_id"]) for item in issues],
        )
        tags = check_ids.parse_member_set_tags(loaded, definitions, regex)
        self.assertEqual({"set_demo"}, tags["sk_gamma"][0])

    def test_member_tags_read_only_cards_and_explicit_mirror_rows(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            set_path = repo.write(
                check_ids.SET_SYSTEM_REL,
                "# 套装\n\n## 8. 正式目录读法\n\n"
                "### 8.4 正式成员注册表（机器可读镜像）\n\n"
                "| 套装 ID | 名称 | 成员 |\n|---|---|---|\n"
                "| `set_demo` | 示例 | `sk_alpha`、`sk_beta` |\n\n"
                "## 9. 正式目录\n\n### 9.1 `set_demo` 示例套装\n\n"
                "| 项 | 定稿 |\n|---|---|\n"
                "| 成员（2） | `sk_alpha`、`sk_beta` |\n",
            )
            catalog_path = repo.write(
                "docs/design/catalog/skills-test.md",
                "# 图鉴\n\n## 1. 卡片\n\n"
                "### 1.1 `sk_alpha` 甲\n\n"
                "| 字段 | 值 |\n|---|---|\n"
                "| setTags / conflicts | `set_demo` / 无 |\n\n"
                "## 2. 本文新增术语与 ID\n\n"
                "| ID | 名称 |\n|---|---|\n"
                "| `sk_alpha` | 甲 |\n| `sk_beta` | 乙 |\n\n"
                "### 正式套装反向标签镜像（全局审计）\n\n"
                "| 武学 ID | setTags |\n|---|---|\n"
                "| `sk_beta` | `set_demo` |\n",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            documents = [
                check_ids.load_document(path, repo.root, warnings)
                for path in (set_path, catalog_path)
            ]
            loaded = [doc for doc in documents if doc is not None]
            _, definitions = check_ids.extract_occurrences(loaded, prefixes, regex)

            issues, _ = check_ids.set_symmetry_issues(
                repo.root, loaded, definitions, regex, warnings
            )
            tags = check_ids.parse_member_set_tags(loaded, definitions, regex)

        self.assertEqual([], issues)
        self.assertEqual({"set_demo"}, tags["sk_alpha"][0])
        self.assertEqual({"set_demo"}, tags["sk_beta"][0])

    def test_member_tags_ignore_mirror_rows_outside_catalogs(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            set_path = repo.write(
                check_ids.SET_SYSTEM_REL,
                "# 套装\n\n## 8. 正式目录读法\n\n"
                "### 8.4 正式成员注册表（机器可读镜像）\n\n"
                "| 套装 ID | 名称 | 成员 |\n|---|---|---|\n"
                "| `set_demo` | 示例 | `sk_alpha` |\n",
            )
            catalog_path = repo.write(
                "docs/design/catalog/skills-test.md",
                "# 图鉴\n\n## 1. 卡片\n\n"
                "### 1.1 `sk_alpha` 甲\n\n"
                "| 字段 | 值 |\n|---|---|\n| setTags | `[]` |\n",
            )
            unrelated_path = repo.write(
                "docs/design/06-buff-system.md",
                "# Buff\n\n### 正式套装反向标签镜像（全局审计）\n\n"
                "| 武学 ID | setTags |\n|---|---|\n"
                "| `sk_alpha` | `set_demo` |\n",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            documents = [
                check_ids.load_document(path, repo.root, warnings)
                for path in (set_path, catalog_path, unrelated_path)
            ]
            loaded = [doc for doc in documents if doc is not None]
            _, definitions = check_ids.extract_occurrences(loaded, prefixes, regex)

            issues, _ = check_ids.set_symmetry_issues(
                repo.root, loaded, definitions, regex, warnings
            )

        self.assertEqual(
            [("member_missing_setTag", "sk_alpha")],
            [(item["direction"], item["member_id"]) for item in issues],
        )

    def test_inventory_line_marked_reference_only_is_not_a_definition(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            path = repo.write(
                "docs/design/catalog/skills-test.md",
                "# 图鉴\n\n## 本文新增术语与 ID\n\n"
                "跨文档只引用、不计为本文定义：`sk_external`。\n",
            )
            warnings: List[str] = []
            prefixes = list(check_ids.DEFAULT_PREFIXES)
            regex = check_ids.compile_id_regex(prefixes)
            document = check_ids.load_document(path, repo.root, warnings)
            self.assertIsNotNone(document)
            occurrences, definitions = check_ids.extract_occurrences(
                [document], prefixes, regex  # type: ignore[list-item]
            )

        self.assertFalse(next(item for item in occurrences if item.id == "sk_external").active)
        self.assertNotIn("sk_external", {item.id for item in definitions})

    def test_real_set_catalog_has_44_sets_and_306_memberships(self) -> None:
        root = Path(__file__).resolve().parents[2]
        warnings: List[str] = []
        prefixes, _ = check_ids.parse_prefixes(root / check_ids.CANON_REL, warnings)
        regex = check_ids.compile_id_regex(prefixes)
        doc = check_ids.load_document(root / check_ids.SET_SYSTEM_REL, root, warnings)
        self.assertIsNotNone(doc)

        sets = check_ids.parse_set_definitions(doc, regex)  # type: ignore[arg-type]

        self.assertEqual(44, len(sets))
        self.assertEqual(306, sum(len(members) for members, _ in sets.values()))
        self.assertEqual(
            {"sk_longzhaoshou", "sk_yijinjing",
             "sk_tieshazhang", "sk_tongrenhenglian"},
            sets["set_shaolin_jingang"][0],
        )
        deprecated = check_ids.parse_set_deprecation_rules(doc, regex)  # type: ignore[arg-type]
        self.assertEqual(119, len(deprecated))

    def test_set_parser_ignores_yaml_example_and_section_19(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            set_path = repo.write(
                check_ids.SET_SYSTEM_REL,
                """# 套装

## 2. 数据结构

```yaml
id: set_example
members: [sk_wrong]
```

## 9. 正式目录

### 9.1 `set_final` 正式套装

| 项 | 定稿 |
|---|---|
| 成员（2） | `sk_alpha`、`eq_beta` |

## 19. 候选收敛与去向

| 原候选 | 去向 |
|---|---|
| `set_retired` | `set_final` |
""",
            )
            warnings: List[str] = []
            regex = check_ids.compile_id_regex(check_ids.DEFAULT_PREFIXES)
            doc = check_ids.load_document(set_path, repo.root, warnings)
            self.assertIsNotNone(doc)

            sets = check_ids.parse_set_definitions(doc, regex)  # type: ignore[arg-type]

        self.assertEqual({"set_final"}, set(sets))
        self.assertEqual({"sk_alpha", "eq_beta"}, sets["set_final"][0])

    def test_near_match_allowlist_suppresses_only_declared_pairs(self) -> None:
        occurrences = [
            occurrence("npc_sangjie", "docs/a.md", 1),
            occurrence("npc_sangsi", "docs/a.md", 2),
            occurrence("npc_shijian", "docs/a.md", 3),
            occurrence("npc_shixian", "docs/a.md", 4),
        ]
        definitions = [
            check_ids.Definition(
                "npc_sangjie", check_ids.Location("docs/a.md", 1, 1),
                "桑结", "table",
            ),
            check_ids.Definition(
                "npc_shijian", check_ids.Location("docs/a.md", 3, 1),
                "侍剑", "table",
            ),
        ]
        issues = check_ids.near_match_issues(
            occurrences, definitions, list(check_ids.DEFAULT_PREFIXES),
            {frozenset(("npc_sangjie", "npc_sangsi"))},
        )

        self.assertEqual([["npc_shijian", "npc_shixian"]],
                         [item["ids"] for item in issues])

    def test_near_match_ignores_alias_only_context_but_keeps_live_use(self) -> None:
        legacy = check_ids.Occurrence(
            id="npc_ningqiangdao",
            location=check_ids.Location("docs/design/18-npc-and-companions.md", 10, 1),
            context="旧 ID `npc_ningqiangdao` 迁为 `npc_songqiangdao`",
            section="## 7.5 别名迁移",
            h2="7. 迁移",
            in_fence=False,
        )
        current = check_ids.Definition(
            "npc_songqiangdao",
            check_ids.Location("docs/design/catalog/npcs-ch10-14.md", 20, 1),
            "姓宋的强人",
            "table",
        )

        ignored = check_ids.near_match_issues(
            [legacy], [current], list(check_ids.DEFAULT_PREFIXES), set()
        )
        live = check_ids.Occurrence(
            id=legacy.id, location=legacy.location,
            context="剧情仍生成 `npc_ningqiangdao`",
            section="## 8. 活跃剧情", h2="8. 活跃剧情", in_fence=False,
        )
        reported = check_ids.near_match_issues(
            [legacy, live], [current], list(check_ids.DEFAULT_PREFIXES), set()
        )

        self.assertEqual([], ignored)
        self.assertEqual(
            [["npc_ningqiangdao", "npc_songqiangdao"]],
            [item["ids"] for item in reported],
        )

    def test_near_match_allowlist_loader_warns_on_invalid_file(self) -> None:
        with TemporaryRepository() as repo:
            path = repo.write("allow.json", '{"schema_version": 1, "pairs": [["one"]]}')
            warnings: List[str] = []

            pairs, status = check_ids.load_near_allowlist(path, warnings)

        self.assertEqual(set(), pairs)
        self.assertEqual("invalid", status)
        self.assertTrue(any("near-match allowlist" in item for item in warnings))


class CommandLineTests(unittest.TestCase):
    def make_repo_with_strict_findings(self) -> TemporaryRepository:
        repo = TemporaryRepository()
        repo.add_support_files()
        repo.write(
            "docs/design/05-martial-arts-system.md",
            "# 武学\n\n## 1. 正文\n\n引用 `sk_missing`。\n",
        )
        repo.write(
            "docs/design/09-combat-system.md",
            "# 战斗\n\n## 1. 正文\n\n使用 `bs_boss`。\n",
        )
        return repo

    def test_json_is_machine_readable_and_default_exit_is_zero(self) -> None:
        with self.make_repo_with_strict_findings() as repo:
            stdout = io.StringIO()
            stderr = io.StringIO()
            with mock.patch.object(check_ids, "repository_root", return_value=repo.root):
                with redirect_stdout(stdout), redirect_stderr(stderr):
                    exit_code = check_ids.main(["--json"])

        payload = json.loads(stdout.getvalue())
        self.assertEqual(0, exit_code)
        self.assertGreaterEqual(payload["counts"]["undefined_references"], 1)
        self.assertEqual(1, payload["counts"]["deprecated_ids"])
        self.assertEqual("", stderr.getvalue())

    def test_strict_exits_one_for_categories_one_or_four(self) -> None:
        with self.make_repo_with_strict_findings() as repo:
            with mock.patch.object(check_ids, "repository_root", return_value=repo.root):
                with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                    exit_code = check_ids.main(["--json", "--strict"])

        self.assertEqual(1, exit_code)

    def test_custom_path_keeps_findings_scoped_to_requested_file(self) -> None:
        with self.make_repo_with_strict_findings() as repo:
            report = check_ids.build_report(
                repo.root, ["docs/design/05-martial-arts-system.md"]
            )

        self.assertEqual(1, report["scan"]["files"])
        self.assertEqual(0, report["counts"]["deprecated_ids"])
        self.assertEqual(
            ["sk_missing"],
            [item["id"] for item in report["issues"]["undefined_references"]],
        )

    def test_baseline_filters_strict_failures_but_keeps_all_issues(self) -> None:
        with self.make_repo_with_strict_findings() as repo:
            repo.write(
                check_ids.BASELINE_REL,
                json.dumps({
                    "schema_version": 1,
                    "undefined_ids": ["sk_missing"],
                    "deprecated_ids": ["bs_boss"],
                }),
            )
            with mock.patch.object(check_ids, "repository_root", return_value=repo.root):
                stdout = io.StringIO()
                with redirect_stdout(stdout), redirect_stderr(io.StringIO()):
                    exit_code = check_ids.main(["--json", "--strict"])

        payload = json.loads(stdout.getvalue())
        self.assertEqual(0, exit_code)
        self.assertEqual(1, payload["counts"]["undefined_references"])
        self.assertEqual(1, payload["counts"]["deprecated_ids"])
        self.assertEqual(0, payload["strict_failure_count"])
        self.assertEqual([], payload["baseline"]["new_undefined_ids"])
        self.assertEqual([], payload["baseline"]["new_deprecated_ids"])

    def test_strict_always_counts_conflicts_and_set_asymmetry(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                check_ids.SET_SYSTEM_REL,
                "# 套装\n\n## 9. 正式目录\n\n"
                "### 9.1 `set_demo` 示例套装\n\n"
                "| 项 | 定稿 |\n|---|---|\n"
                "| 成员（1） | `sk_alpha` |\n",
            )
            repo.write(
                "docs/design/catalog/skills-test.md",
                "# 图鉴\n\n| ID | 名称 | setTags |\n|---|---|---|\n"
                "| `sk_alpha` | 甲 | — |\n",
            )
            repo.write(
                "docs/design/catalog/npcs-a.md",
                "# 人物\n\n| ID | 名称 |\n|---|---|\n| `npc_same` | 名甲 |\n",
            )
            repo.write(
                "docs/design/catalog/npcs-b.md",
                "# 人物\n\n| ID | 名称 |\n|---|---|\n| `npc_same` | 名乙 |\n",
            )
            repo.write(
                check_ids.BASELINE_REL,
                json.dumps({
                    "schema_version": 1,
                    "undefined_ids": [],
                    "deprecated_ids": [],
                }),
            )
            with mock.patch.object(check_ids, "repository_root", return_value=repo.root):
                stdout = io.StringIO()
                with redirect_stdout(stdout), redirect_stderr(io.StringIO()):
                    exit_code = check_ids.main(["--json", "--strict"])

        payload = json.loads(stdout.getvalue())
        self.assertEqual(1, exit_code)
        self.assertEqual(2, payload["strict_failure_count"])
        self.assertEqual(1, payload["counts"]["conflicting_definitions"])
        self.assertEqual(1, payload["counts"]["set_tag_asymmetry"])

    def test_near_match_warning_does_not_fail_strict(self) -> None:
        with TemporaryRepository() as repo:
            repo.add_support_files()
            repo.write(
                "docs/design/18-npc-and-companions.md",
                "# NPC\n\n| ID | 名称 |\n|---|---|\n"
                "| `npc_shijian` | 侍剑 |\n\n引用 `npc_shixian`。\n",
            )
            repo.write(
                check_ids.BASELINE_REL,
                json.dumps({
                    "schema_version": 1,
                    "undefined_ids": ["npc_shixian"],
                    "deprecated_ids": [],
                }),
            )
            with mock.patch.object(check_ids, "repository_root", return_value=repo.root):
                stdout = io.StringIO()
                with redirect_stdout(stdout), redirect_stderr(io.StringIO()):
                    exit_code = check_ids.main(["--json", "--strict"])

        payload = json.loads(stdout.getvalue())
        self.assertEqual(0, exit_code)
        self.assertEqual(1, payload["counts"]["near_matches"])
        self.assertEqual(0, payload["strict_failure_count"])

    def test_update_baseline_writes_full_scan_and_rejects_custom_paths(self) -> None:
        with self.make_repo_with_strict_findings() as repo:
            with mock.patch.object(check_ids, "repository_root", return_value=repo.root):
                with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                    update_exit = check_ids.main(["--update-baseline"])
                baseline = json.loads(
                    (repo.root / check_ids.BASELINE_REL).read_text(encoding="utf-8")
                )
                baseline_mode = (repo.root / check_ids.BASELINE_REL).stat().st_mode & 0o777
                with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                    reject_exit = check_ids.main([
                        "--update-baseline",
                        "docs/design/05-martial-arts-system.md",
                    ])

        self.assertEqual(0, update_exit)
        self.assertEqual(["sk_missing"], baseline["undefined_ids"])
        self.assertEqual(["bs_boss"], baseline["deprecated_ids"])
        self.assertEqual(0o644, baseline_mode)
        self.assertEqual(2, reject_exit)

    def test_baseline_payload_excludes_conflicts_asymmetry_and_near_matches(self) -> None:
        payload = check_ids.baseline_payload({
            "issues": {
                "undefined_references": [{"id": "sk_missing"}],
                "deprecated_ids": [{"old_id": "set_old"}],
                "conflicting_definitions": [{"id": "it_same"}],
                "set_tag_asymmetry": [{"set_id": "set_demo"}],
                "near_matches": [{"ids": ["npc_a", "npc_b"]}],
            }
        })

        self.assertEqual(
            {
                "schema_version": 1,
                "undefined_ids": ["sk_missing"],
                "deprecated_ids": ["set_old"],
            },
            payload,
        )


if __name__ == "__main__":
    unittest.main()

"""Regression tests for catalog-driven item generation."""
from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import items_from_catalog


HEADER = (
    "| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | "
    "外观要点（供出图） |"
)
SEPARATOR = "|---|---|---|---|---|---|---|"
HEADER9 = (
    "| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 说明 | "
    "效果字段 | 属性投影 | 外观要点（供出图） |"
)
COLLECTIBLE_HEADER9 = (
    "| ID | 名称 | 子类 | 品阶 | 出处 | 效果字段 | 外观要点 | 说明 | 属性投影 |"
)
SEPARATOR9 = "|---|---|---|---|---|---|---|---|---|"


def item_line(item_id: str, *, sub: str = "食材·果", effect: str = "grade=3") -> str:
    return (f"| `{item_id}` | 名称 | {sub} | 黄 | **（原创扩展）** | "
            f"`{effect}` | 外观 |")


def write_catalog(path: Path, lines: list[str]) -> None:
    path.write_text(
        "# 测试物品名录\n\n" + HEADER + "\n" + SEPARATOR + "\n"
        + "\n".join(lines) + "\n",
        encoding="utf-8",
    )


def write_catalog9(path: Path, lines: list[str]) -> None:
    path.write_text(
        "# 测试物品名录\n\n" + HEADER9 + "\n" + SEPARATOR9 + "\n"
        + "\n".join(lines) + "\n",
        encoding="utf-8",
    )


def write_collectible_catalog(path: Path, lines: list[str]) -> None:
    path.write_text(
        "# 测试收藏品名录\n\n" + COLLECTIBLE_HEADER9 + "\n" + SEPARATOR9 + "\n"
        + "\n".join(lines) + "\n",
        encoding="utf-8",
    )


class ItemsFromCatalogTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.catalog_dir = Path(self.temporary.name)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_discovers_expanded_catalogs_and_parses_every_row(self) -> None:
        food = [item_line(f"it_food_{index:03d}") for index in range(174)]
        herbs = [
            item_line("it_herb_a", sub="药材·草本"),
            item_line("it_herb_b", sub="药材·根茎"),
        ]
        write_catalog(self.catalog_dir / "items-food.md", food)
        write_catalog(self.catalog_dir / "items-herbs.md", herbs)

        parsed = items_from_catalog.rows(self.catalog_dir)

        self.assertEqual(176, len(parsed))
        self.assertEqual(
            {"items-food.md": 174, "items-herbs.md": 2},
            items_from_catalog.catalog_counts(parsed),
        )
        self.assertEqual(176, len({row["id"] for row in parsed}))

    def test_repository_catalog_counts_match_expanded_sources(self) -> None:
        parsed = items_from_catalog.rows()
        expected = {
                "items-accessories.md": 170,
                "items-armor.md": 15,
                "items-belts.md": 122,
                "items-clothing.md": 273,
                "items-food.md": 174,
                "items-hidden-weapons.md": 51,
                "items-innerarmor.md": 9,
                "items-manuals.md": 180,
                "items-medicine.md": 96,
                "items-shoes.md": 122,
                "items-weapons.md": 247,
        }
        if (items_from_catalog.CATALOG_DIR / "items-collectibles.md").is_file():
            expected["items-collectibles.md"] = 151

        self.assertEqual(sum(expected.values()), len(parsed))
        self.assertEqual(expected, items_from_catalog.catalog_counts(parsed))

    def test_rejects_duplicate_ids_across_catalogs(self) -> None:
        duplicate = item_line("it_same")
        write_catalog(self.catalog_dir / "items-food.md", [duplicate])
        write_catalog(self.catalog_dir / "items-herbs.md", [duplicate])

        with self.assertRaisesRegex(ValueError, "duplicate item ID: it_same"):
            items_from_catalog.rows(self.catalog_dir)

    def test_rejects_bad_item_row_in_catalog_table(self) -> None:
        bad = "| `bad-id` | 坏行 | 食材·果 | 黄 | 原创 | `grade=3` | 外观 |"
        write_catalog(self.catalog_dir / "items-food.md", [bad])

        with self.assertRaisesRegex(ValueError, "invalid item ID"):
            items_from_catalog.rows(self.catalog_dir)

    def test_runtime_text_omits_authoring_duplicates_but_keeps_unknown_fields(self) -> None:
        write_catalog(self.catalog_dir / "items-food.md", [
            item_line("it_food_a", effect="grade=3; ingredientKind=fruit; party=4"),
        ])

        item = items_from_catalog.build(items_from_catalog.rows(self.catalog_dir)[0])

        self.assertEqual(
            "外观：外观。 待运行时投影：party=4。",
            item["text"]["desc"],
        )
        self.assertNotIn("short", item["text"])
        self.assertNotIn("lore", item["text"])
        self.assertNotIn("attributes", item["extension"]["value"])
        self.assertNotIn("grade=3", item["text"]["desc"])
        self.assertNotIn("ingredientKind", item["text"]["desc"])

    def test_nine_column_row_projects_lore_and_attributes(self) -> None:
        lore = "这是一段供测试使用的物品来历说明，交代流传、用法与限制，并明确属于原创扩展内容，长度满足名录规范且不会复制外观描述。"
        line = (
            "| `it_food_nine` | 九列表果 | 食品·果 | 黄 | **（原创扩展）** | "
            f"**（原创扩展）**{lore} | `grade=3; staPct=15.5%` | "
            "`stamina=16; ruleRef=rule_food_test` | 青瓷小碟盛放 |"
        )
        write_catalog9(self.catalog_dir / "items-food.md", [line])

        parsed = items_from_catalog.rows(self.catalog_dir)
        item = items_from_catalog.build(parsed[0])

        self.assertEqual("（原创扩展）" + lore, item["text"]["lore"])
        self.assertEqual(
            {"version": 2, "stamina": 16, "ruleRef": "rule_food_test"},
            item["extension"]["value"]["attributes"],
        )

    def test_nine_column_empty_projection_still_records_version(self) -> None:
        lore = "甲" * 60
        line = (
            "| `it_material_nine` | 九列食材 | 食材·果 | 黄 | **（原创扩展）** | "
            f"{lore} | `grade=3; ingredientKind=fruit` | `—` | 青瓷小碟盛放 |"
        )
        write_catalog9(self.catalog_dir / "items-food.md", [line])

        item = items_from_catalog.build(items_from_catalog.rows(self.catalog_dir)[0])

        self.assertEqual({"version": 2}, item["extension"]["value"]["attributes"])

    def test_collectible_row_projects_schema_supported_extension(self) -> None:
        collectible = (
            "giftValue=1; giftTo={preferred:[scholar,collector],"
            "npcOverrides:{npc_test:favored}}; eraRange=[song_north]; "
            "provenance=expanded; study={art:art,delta:3,once:true}; "
            "appraise={art:art,dc:20}"
        )
        line = (
            "| `it_collectible_nine` | 测试瓷盏 | `porcelain` | 黄 | "
            "**（原创扩展）** | "
            f"`grade=3; kind=collectible; sub=porcelain; stack=1; tags=painting; {collectible}` | "
            "青釉敞口小盏，矮足圆腹，掌心大小 | "
            f"{'甲' * 60} | `{collectible}` |"
        )
        write_collectible_catalog(self.catalog_dir / "items-collectibles.md", [line])

        item = items_from_catalog.build(items_from_catalog.rows(self.catalog_dir)[0])

        self.assertEqual("collectible", item["kind"])
        self.assertEqual("porcelain", item["sub"])
        self.assertEqual(1, item["stack"])
        self.assertEqual("甲" * 60, item["text"]["lore"])
        self.assertEqual(["runtimeProjection"], item["flags"])
        self.assertIn("giftValue=1", item["text"]["desc"])
        self.assertIn("giftTo={preferred:[scholar,collector]", item["text"]["desc"])
        self.assertIn("eraRange=[song_north]", item["text"]["desc"])
        self.assertIn("provenance=expanded", item["text"]["desc"])
        self.assertIn("tags=painting", item["text"]["desc"])
        self.assertEqual(
            {
                "type": "collectible",
                "value": {
                    "study": {"art": "art", "value": 3},
                    "giftTo": [],
                    "appraise": {"art": "art", "dc": 20},
                },
            },
            item["extension"],
        )

    def test_collectible_chinese_subcategory_maps_to_code(self) -> None:
        collectible = (
            "giftValue=1; giftTo={preferred:[collector]}; eraRange=[song_north]; "
            "provenance=expanded; study=none; appraise={art:art,dc:20}"
        )
        line = (
            "| `it_collectible_zh` | 测试瓷盏 | 瓷器／茶具 | 黄 | **（原创扩展）** | "
            f"`grade=3; kind=collectible; sub=porcelain; stack=1; {collectible}` | "
            f"青釉敞口小盏，矮足圆腹，掌心大小 | {'甲' * 60} | `{collectible}` |"
        )
        write_collectible_catalog(self.catalog_dir / "items-collectibles.md", [line])

        item = items_from_catalog.build(items_from_catalog.rows(self.catalog_dir)[0])

        self.assertEqual("porcelain", item["sub"])

    def test_rejects_mixed_seven_and_nine_column_tables(self) -> None:
        nine = (
            "| `it_nine` | 九列果 | 食材·果 | 黄 | **（原创扩展）** | "
            f"{'甲' * 60} | `grade=3` | `—` | 青瓷小碟盛放 |"
        )
        path = self.catalog_dir / "items-food.md"
        path.write_text(
            "# 测试\n\n" + HEADER + "\n" + SEPARATOR + "\n" + item_line("it_old")
            + "\n\n" + HEADER9 + "\n" + SEPARATOR9 + "\n" + nine + "\n",
            encoding="utf-8",
        )

        with self.assertRaisesRegex(ValueError, "mixed seven/nine-column"):
            items_from_catalog.rows(self.catalog_dir)

    def test_seven_column_fixture_render_is_byte_identical(self) -> None:
        # Repository-wide generated-file parity belongs to
        # ``items_from_catalog.py --check``.  This unit test pins the legacy
        # seven-column renderer without depending on content/items freshness.
        write_catalog(self.catalog_dir / "items-food.md", [
            item_line("it_fixture_fruit"),
        ])
        parsed = items_from_catalog.rows(self.catalog_dir)
        generated = items_from_catalog.expected_files(parsed)
        path = items_from_catalog.OUTPUT_DIR / "it_fixture_fruit.yaml"
        expected = (
            "schemaVersion: item.v1\n"
            "id: it_fixture_fruit\n"
            "name: 名称\n"
            "kind: material\n"
            "sub: ingredient\n"
            "grade: 3\n"
            "stack: 999\n"
            "chapters: any\n"
            "origin: expanded\n"
            "price: auto\n"
            "flags: []\n"
            "assets:\n"
            "  icon: item/fixture_fruit\n"
            "text:\n"
            "  desc: 外观：外观。\n"
            "extension:\n"
            "  type: material\n"
            "  value:\n"
            "    family: ingredient\n"
            "    resourceRef: res_shicai_huang3\n"
            "    materialGrade: 3\n"
            "    rare: false\n"
        ).encode("utf-8")

        self.assertEqual({path}, set(generated))
        self.assertEqual(expected, generated[path].encode("utf-8"))

    def test_audits_exact_ids_in_official_registry_when_present(self) -> None:
        parsed = [
            {"id": "it_registered", "catalog": "items-food.md"},
            {"id": "it_pending", "catalog": "items-food.md"},
        ]
        registry = self.catalog_dir / "10-items-and-equipment.md"
        registry.write_text(
            "### 14.2 ID 清单\n\n| 类别 | ID |\n|---|---|\n"
            "| 食品 | `it_registered` |\n\n## 15. 数据校验\n",
            encoding="utf-8",
        )

        audit = items_from_catalog.audit_official_registry(parsed, registry)

        self.assertEqual(2, audit.catalog_count)
        self.assertEqual(1, audit.registered_catalog_count)
        self.assertEqual(("it_pending",), audit.unregistered_ids)


if __name__ == "__main__":
    unittest.main()

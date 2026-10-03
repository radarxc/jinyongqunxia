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


def item_line(item_id: str, *, sub: str = "食材·果", effect: str = "grade=3") -> str:
    return (f"| `{item_id}` | 名称 | {sub} | 黄 | **（原创扩展）** | "
            f"`{effect}` | 外观 |")


def write_catalog(path: Path, lines: list[str]) -> None:
    path.write_text(
        "# 测试物品名录\n\n" + HEADER + "\n" + SEPARATOR + "\n"
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

        self.assertEqual(894, len(parsed))
        self.assertEqual(
            {
                "items-accessories.md": 48,
                "items-armor.md": 8,
                "items-belts.md": 26,
                "items-clothing.md": 30,
                "items-food.md": 174,
                "items-hidden-weapons.md": 51,
                "items-innerarmor.md": 8,
                "items-manuals.md": 180,
                "items-medicine.md": 96,
                "items-shoes.md": 26,
                "items-weapons.md": 247,
            },
            items_from_catalog.catalog_counts(parsed),
        )

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
        self.assertNotIn("grade=3", item["text"]["desc"])
        self.assertNotIn("ingredientKind", item["text"]["desc"])

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

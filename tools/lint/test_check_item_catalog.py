"""Regression tests for seven/nine-column item catalog validation."""
from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


CHECKER = Path(__file__).with_name("check_item_catalog.py")
HEADER7 = (
    "| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | "
    "外观要点（供出图） |"
)
HEADER9 = (
    "| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 说明 | "
    "效果字段 | 属性投影 | 外观要点（供出图） |"
)
SEPARATOR7 = "|---|---|---|---|---|---|---|"
SEPARATOR9 = "|---|---|---|---|---|---|---|---|---|"
LORE60 = "**" + "甲" * 60 + "**"


def row7(item_id: str = "it_test_food", *, grade: str = "黄") -> str:
    return (f"| `{item_id}` | 测试果 | 食材·果 | {grade} | **（原创扩展）** | "
            "`grade=3; ingredientKind=fruit` | 青瓷小碟盛放 |")


def row9(
    item_id: str = "it_test_food", *, lore: str = LORE60,
    effect: str = "grade=3; healPct=5.5%; staPct=15.5%",
    attributes: str = "`healOuter=6; stamina=16`",
    name: str = "测试果", subcategory: str = "食材·果", grade: str = "黄",
) -> str:
    return (f"| `{item_id}` | {name} | {subcategory} | {grade} | **（原创扩展）** | "
            f"{lore} | `{effect}` | {attributes} | 青瓷小碟盛放 |")


class CheckItemCatalogTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.path = Path(self.temporary.name) / "items-food.md"

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def run_checker(self, body: str) -> subprocess.CompletedProcess[str]:
        self.path.write_text("# 测试\n\n" + body + "\n", encoding="utf-8")
        return subprocess.run(
            [sys.executable, str(CHECKER), str(self.path)],
            text=True, capture_output=True, check=False,
        )

    def table7(self, *rows: str) -> str:
        return "\n".join((HEADER7, SEPARATOR7, *rows))

    def table9(self, *rows: str) -> str:
        return "\n".join((HEADER9, SEPARATOR9, *rows))

    def assert_rejected(self, body: str, reason: str) -> None:
        result = self.run_checker(body)
        self.assertEqual(1, result.returncode, result.stdout + result.stderr)
        self.assertIn(reason, result.stdout)

    def test_accepts_valid_seven_column_catalog(self) -> None:
        result = self.run_checker(self.table7(row7()))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("七列", result.stdout)

    def test_rejects_invalid_seven_column_row(self) -> None:
        eight_cells = row7().removesuffix(" |") + " | 多余 |"
        self.assert_rejected(self.table7(eight_cells), "应为七列，实际 8 列")

    def test_accepts_valid_nine_column_catalog(self) -> None:
        result = self.run_checker(self.table9(row9()))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("九列", result.stdout)

    def test_rejects_lore_outside_unicode_codepoint_bounds(self) -> None:
        for length in (59, 121):
            with self.subTest(length=length):
                self.assert_rejected(
                    self.table9(row9(lore="**" + "甲" * length + "**")),
                    f"说明长度 {length}",
                )

    def test_rejects_units_and_decimals(self) -> None:
        for attributes in ("`atk=1.05`", "`healOuter=12%`"):
            with self.subTest(attributes=attributes):
                self.assert_rejected(
                    self.table9(row9(attributes=attributes)), "须为非负整数"
                )

    def test_rejects_duplicate_and_unknown_attribute_keys(self) -> None:
        cases = (
            ("`stamina=12; stamina=13`", "属性键重复 `stamina`"),
            ("`mainK=105`", "属性键 `mainK` 不在白名单"),
        )
        for attributes, reason in cases:
            with self.subTest(attributes=attributes):
                self.assert_rejected(self.table9(row9(attributes=attributes)), reason)

    def test_rejects_wrong_attribute_order(self) -> None:
        self.assert_rejected(
            self.table9(row9(attributes="`stamina=16; healOuter=6`")),
            "属性键顺序不规范",
        )

    def test_rejects_qi_effect_authoring_placeholder(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                effect="grade=3; mainK=1.00",
                attributes="`atk=100; qiEffect=（原创扩展：一句话）`",
            )),
            "qiEffect 占位待登记",
        )

    def test_rejects_double_write_mismatch(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                effect="grade=3; healPct=5.5%; staPct=15.5%",
                attributes="`healOuter=5; stamina=16`",
            )),
            "双写不一致：`healOuter` 应为 6，实际 5",
        )

    def test_rejects_missing_recomputable_double_writes(self) -> None:
        cases = (
            ("items-food.md", "食材·果",
             "grade=3; healPct=5.5%", "缺少 `healOuter=6`"),
            ("items-weapons.md", "兵器·剑",
             "grade=3; mainK=1.00", "缺少 `atk=100`"),
        )
        for filename, sub, effect, reason in cases:
            with self.subTest(filename=filename, effect=effect):
                self.path = self.path.with_name(filename)
                body = self.table9(row9(
                    effect=effect, attributes="`—`",
                ).replace("食材·果", sub))
                self.assert_rejected(body, reason)

    def test_rejects_missing_category_required_keys(self) -> None:
        cases = (
            ("items-weapons.md", "兵器·剑", "`hardness=45; qiAffinity=100`", "类别必填属性缺少 `atk`"),
            ("items-weapons.md", "兵器·剑", "`atk=100; qiAffinity=100`", "类别必填属性缺少 `hardness`"),
            ("items-weapons.md", "兵器·剑", "`atk=100; hardness=45`", "类别必填属性缺少 `qiAffinity`"),
            ("items-food.md", "食品·点心", "`healOuter=6`", "类别必填属性缺少 `stamina`"),
            ("items-clothing.md", "衣物·便服", "`agi=1`", "类别必填属性缺少 `def`"),
            ("items-armor.md", "制式盔甲·宋", "`reflect=0`", "类别必填属性缺少 `def`"),
            ("items-innerarmor.md", "内甲·编织", "`antiPoison=1`", "缺少 `def=22`"),
            ("items-shoes.md", "鞋·草鞋", "`def=6`", "类别必填属性缺少 `agi`"),
            ("items-manuals.md", "秘籍·全本", "`maxLayer=10`", "类别必填属性缺少 `skillRef`"),
            ("items-accessories.md", "护肩·皮革", "`block=3`", "类别必填属性缺少 `def`"),
            ("items-accessories.md", "护腕·皮革", "`def=6`", "类别必填属性缺少 `block`"),
        )
        for filename, sub, attributes, reason in cases:
            with self.subTest(filename=filename, reason=reason):
                self.path = self.path.with_name(filename)
                body = self.table9(row9(
                    effect="grade=3", attributes=attributes,
                ).replace("食材·果", sub))
                self.assert_rejected(body, reason)

    def test_accepts_category_required_keys(self) -> None:
        cases = (
            ("items-food.md", "it_test_food", "食品·点心",
             "grade=3; staPct=15.5%", "`stamina=16`"),
            ("items-weapons.md", "eq_test_weapon", "兵器·剑",
             "grade=3; mainK=1.00",
             "`atk=100; hardness=45; qiAffinity=100`"),
        )
        for filename, item_id, sub, effect, attributes in cases:
            with self.subTest(filename=filename):
                self.path = self.path.with_name(filename)
                body = self.table9(row9(
                    item_id=item_id, effect=effect, attributes=attributes,
                ).replace("食材·果", sub))
                result = self.run_checker(body)
                self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_rejects_other_equipment_without_applicable_attribute(self) -> None:
        self.path = self.path.with_name("items-belts.md")
        body = self.table9(row9(
            effect="grade=3", attributes="`—`",
        ).replace("食材·果", "腰带·布绳"))
        self.assert_rejected(body, "类别必填属性须至少含一项")

    def test_rejects_medicine_without_applicable_attribute(self) -> None:
        self.path = self.path.with_name("items-medicine.md")
        body = self.table9(row9(
            effect="grade=3", attributes="`—`",
        ).replace("食材·果", "药物·外伤"))
        self.assert_rejected(body, "类别必填属性须至少含一项药品效用字段")

    def test_accepts_ingredient_without_instant_effect_attributes(self) -> None:
        result = self.run_checker(self.table9(row9(
            effect="grade=3; ingredientKind=fruit", attributes="`—`",
        )))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_rejects_unusable_sxp_grant_object_for_qi_cultivation(self) -> None:
        cases = (
            ("{target:mainInner,mode:flat,value:0.35}", "mode 须为 `pctNext`"),
            ("{target:mainInner,mode:pctNext}", "缺少数值 `value`"),
            ("{target:mainInner,mode:pctNext,value:many}", "数值 `value` 无法解析"),
        )
        for grant, reason in cases:
            with self.subTest(grant=grant):
                self.assert_rejected(
                    self.table9(row9(
                        effect=f"grade=3; sxpGrant={grant}",
                        attributes="`qiCultivation=3500`",
                    )),
                    reason,
                )

    def test_accepts_pct_next_sxp_grant_object_for_qi_cultivation(self) -> None:
        result = self.run_checker(self.table9(row9(
            effect=("grade=3; "
                    "sxpGrant={target:mainInner,mode:pctNext,value:0.35}"),
            attributes="`qiCultivation=3500`",
        )))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_accepts_scalar_sxp_grant_for_qi_cultivation(self) -> None:
        result = self.run_checker(self.table9(row9(
            effect="grade=3; sxpGrant=0.35",
            attributes="`qiCultivation=3500`",
        )))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_accepts_food_qi_cultivation_with_legacy_qi_effect(self) -> None:
        result = self.run_checker(self.table9(row9(
            item_id="it_labazhou", name="腊八粥",
            subcategory="食品·汤羹", grade="地",
            effect="grade=9; perm.mpMaxPct=2%; sxpGrant=0.35",
            attributes="`qiCultivation=3500; stamina=24`",
        )))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_rejects_food_qi_cultivation_without_legacy_qi_effect(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                subcategory="食品·汤羹", grade="地",
                effect="grade=9; staPct=24%",
                attributes="`qiCultivation=3500; stamina=24`",
            )),
            "食品属性 `qiCultivation` 仅允许旧效果字段含",
        )

    def test_rejects_missing_food_qi_cultivation_double_write(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                item_id="it_labazhou", name="腊八粥",
                subcategory="食品·汤羹", grade="地",
                effect="grade=9; perm.mpMaxPct=2%; sxpGrant=0.35",
                attributes="`—`",
            )),
            "双写不一致：缺少 `qiCultivation=3500`",
        )

    def test_rejects_mixed_seven_and_nine_column_tables(self) -> None:
        body = (self.table7(row7("it_old")) + "\n\n"
                + self.table9(row9("it_new")))
        self.assert_rejected(body, "同一文件混用七列与九列")

    def test_accepts_multiple_tables_of_one_format(self) -> None:
        body = (self.table9(row9("it_first")) + "\n\n"
                + self.table9(row9("it_second")))
        result = self.run_checker(body)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("2 行九列", result.stdout)

    def test_rejects_direct_integer_double_write_mismatch(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                effect="grade=3; agi=1", attributes="`agi=2`",
            )),
            "双写不一致：`agi` 应为 1，实际 2",
        )

    def test_rejects_reference_double_write_mismatch(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                effect="grade=3; skill=sk_true; maxLayer=8",
                attributes="`skillRef=sk_wrong; maxLayer=8`",
            )),
            "双写不一致：`skillRef` 应为 sk_true，实际 sk_wrong",
        )

    def test_rejects_def_and_anti_poison_double_write_mismatch(self) -> None:
        self.path = self.path.with_name("items-belts.md")
        body = self.table9(row9(
            effect="grade=3; slot=waist; poisonResPp=2",
            attributes="`def=5; antiPoison=1`",
        ).replace("食材·果", "腰带·布绳"))
        result = self.run_checker(body)
        self.assertEqual(1, result.returncode, result.stdout + result.stderr)
        self.assertIn("双写不一致：`def` 应为 6，实际 5", result.stdout)
        self.assertIn("双写不一致：`antiPoison` 应为 2，实际 1", result.stdout)

    def test_recomputes_def_from_explicit_defense_coefficients(self) -> None:
        self.path = self.path.with_name("items-accessories.md")
        body = self.table9(row9(
            effect="grade=3; defOutK=0.10; defInK=0.08", attributes="`def=21`",
        ).replace("食材·果", "奇物·护具"))
        self.assert_rejected(body, "双写不一致：`def` 应为 22，实际 21")

    def test_rejects_nonformal_qi_effect_reference(self) -> None:
        self.assert_rejected(
            self.table9(row9(
                effect="grade=3", attributes="`qiEffect=内力很强`",
            )),
            "qiEffect` 的值 `内力很强` 须为正式 ID",
        )

    def test_accepts_unscoped_perm_stat_without_assuming_con(self) -> None:
        result = self.run_checker(self.table9(row9(
            effect="grade=3; permStat=2", attributes="`con=2`",
        )))
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()


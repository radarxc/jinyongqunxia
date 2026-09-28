#!/usr/bin/env python3
"""Per-unit Boss/elite pacing estimator for design/21 section 11.9.

The model deliberately imports the damage and meridian oracles beside this
file.  It estimates a clean, fully completed representative route; fixed-RNG
replay remains the authority for named encounter production data.
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable

import damage_sim as damage
import meridian_flow_sim as flow


CHAPTER_NAMES = tuple(row[0] for row in damage.CHAPTERS)
# Each chapter's retained "本界精英默认" anchor in chapters/01--14.
CHAPTER_STANDARD_GRADES = (7, 8, 9, 9, 8, 7, 7, 8, 5, 5, 5, 6, 6, 7)
CHAPTER_MILESTONES = (
    (True, False, False, False, 0),  # 01: route meridians only
    (True, False, False, False, 0),  # 02
    (True, True, False, False, 0),   # 03: small cycle
    (True, True, True, False, 1),    # 04: great cycle, turn one
    (True, True, True, False, 2),
    (True, True, True, False, 3),
    (True, True, True, True, 4),
    (True, True, True, True, 5),
    (True, True, True, True, 6),
    (True, True, True, True, 7),
    (True, True, True, True, 7),     # 11 is a catch-up chapter
    (True, True, True, True, 8),
    (True, True, True, True, 8),     # 13 is a catch-up chapter
    (True, True, True, True, 8),     # turn nine is terminal-only
)
KIND_DEFAULTS = {
    "boss": dict(mp_ratio_bp=13_000, practice_bp=9_000,
                 capacity_scale_bp=13_000, open_policy="fullTemplate"),
    "elite": dict(mp_ratio_bp=10_500, practice_bp=7_500,
                  capacity_scale_bp=10_500, open_policy="schoolCore"),
}
WINDOWS = {"boss": (12.0, 25.0), "elite": (6.0, 10.0)}


@dataclass(frozen=True)
class Milestones:
    meridian_complete: bool
    small_cycle: bool
    great_cycle: bool
    twelve_cycle: bool
    turns: int


@dataclass(frozen=True)
class PacingInput:
    chapter: int
    kind: str
    eff_grade: int
    eff_layer: int
    mp_ratio_bp: int
    practice_bp: int
    capacity_scale_bp: int
    inner_nature: str
    open_policy: str
    milestones: Milestones
    hp_multiplier: float = 1.0
    defense_multiplier: float = 1.0
    attack_route_length: int = 10
    defense_route_length: int = 6
    name: str = "unit"


def chapter_index(chapter: int | str) -> int:
    if isinstance(chapter, int) or str(chapter).isdigit():
        value = int(chapter)
        if 1 <= value <= len(CHAPTER_NAMES):
            return value - 1
    text = str(chapter)
    if text in CHAPTER_NAMES:
        return CHAPTER_NAMES.index(text)
    raise ValueError("chapter must be 1..14 or a canonical chapter name")


def chapter_milestones(chapter: int | str, kind: str = "boss") -> Milestones:
    index = chapter_index(chapter)
    if kind == "boss":
        return Milestones(*CHAPTER_MILESTONES[index])
    if kind == "elite":
        # Elite units never cross the small-cycle ceiling. Chapters 01--02
        # have not reached that milestone; chapters 03--14 may use it.
        return Milestones(True, index >= 2, False, False, 0)
    raise ValueError("kind must be boss or elite")


def default_eff_layer(chapter: int | str, kind: str) -> int:
    if kind == "elite":
        return 8
    if kind != "boss":
        raise ValueError("kind must be boss or elite")
    # LOW chapters 08--11 cap native skills at layer 8; other Boss pools use 9.
    return 8 if 8 <= chapter_index(chapter) + 1 <= 11 else 9


def cultivation_raw(
    grade: int, layer: int, mp_ratio_bp: int, capacity_scale_bp: int,
    nature: str, milestones: Milestones, route_length: int, practice_bp: int,
) -> tuple[int, int, int, int]:
    """Build §3.4 raw components through meridian_flow_sim's functions."""
    cultivation = flow.Cultivation(
        grade, layer, mp_ratio_bp, nature, nature,
        milestones.meridian_complete, milestones.small_cycle,
        milestones.great_cycle, milestones.twelve_cycle, milestones.turns,
        practice_bp,
    )
    node = flow.derive_node("boss_pacing", cultivation, capacity_scale_bp)
    route_qi = flow.initial_qi(cultivation) + route_length * flow.node_gain(cultivation)
    # Static pacing assumes a legal, undamaged route completes. practiceBp is
    # retained for audit/risk output but needs route risk + RNG to change it.
    return route_qi, node.capacity, node.flow_bp, flow.BP


def chapter_template_rounds(chapter: int | str, kind: str) -> float:
    name = CHAPTER_NAMES[chapter_index(chapter)]
    return next(row.player_rounds for row in damage.report_rows()
                if row.chapter == name and row.kind == kind)


def estimate(spec: PacingInput) -> dict[str, Any]:
    if spec.kind not in WINDOWS:
        raise ValueError("kind must be boss or elite")
    if spec.inner_nature not in {"yin", "yang", "harmony"}:
        raise ValueError("innerNature must be yin, yang or harmony")
    if not 1 <= spec.attack_route_length <= 18:
        raise ValueError("attackRouteLength must be 1..18")
    if not 0 <= spec.defense_route_length <= 18:
        raise ValueError("defenseRouteLength must be 0..18")
    if spec.hp_multiplier <= 0 or spec.defense_multiplier <= 0:
        raise ValueError("durability multipliers must be positive")

    index = chapter_index(spec.chapter)
    standard_grade = CHAPTER_STANDARD_GRADES[index]
    route_length = max(spec.attack_route_length, spec.defense_route_length or 1)
    unit_raw = cultivation_raw(
        spec.eff_grade, spec.eff_layer, spec.mp_ratio_bp,
        spec.capacity_scale_bp, spec.inner_nature, spec.milestones,
        route_length, spec.practice_bp,
    )
    # The chapter anchor is deliberately grade G / layer 8 with neutral ratio
    # and scale. It is the same retained row used to define "本界精英默认".
    standard_milestones = chapter_milestones(index + 1, "elite")
    standard_raw = cultivation_raw(
        standard_grade, 8, flow.BP, flow.BP, spec.inner_nature,
        standard_milestones, route_length, flow.BP,
    )
    profile = flow.normalize_profile(unit_raw, standard_raw)
    player_profile = flow.STANDARD_PROFILE
    attack_bp = flow.attack_meridian_mult_bp(
        player_profile, profile, spec.attack_route_length
    )
    defense_bp = (
        flow.defense_meridian_mult_bp(
            profile, player_profile, spec.defense_route_length
        ) if spec.defense_route_length else flow.BP
    )
    meridian_drag = flow.BP * flow.BP / (attack_bp * defense_bp)
    durability = spec.hp_multiplier * spec.defense_multiplier
    template = chapter_template_rounds(spec.chapter, spec.kind)
    rounds = template * meridian_drag * durability
    low, high = WINDOWS[spec.kind]
    neutral_multiplier = 1.0 / meridian_drag
    target = 23.0 if spec.kind == "boss" else 9.0
    if rounds > high:
        recommended = target / rounds
    elif rounds < low:
        recommended = low / rounds
    else:
        recommended = 1.0
    return {
        "name": spec.name, "chapter": index + 1,
        "chapterName": CHAPTER_NAMES[index], "kind": spec.kind,
        "standardGrade": standard_grade, "standardLayer": 8,
        "templateRounds": template, "unitRaw": unit_raw,
        "standardRaw": standard_raw, "profile": asdict(profile),
        "strengthBp": flow.meridian_strength_bp(profile),
        "playerAttackBp": attack_bp, "bossDefenseBp": defense_bp,
        "meridianDrag": meridian_drag,
        "hpMultiplier": spec.hp_multiplier,
        "defenseMultiplier": spec.defense_multiplier,
        "effectiveDurabilityMultiplier": durability,
        "estimatedRounds": rounds, "window": [low, high],
        "innerNature": spec.inner_nature,
        "openPolicy": spec.open_policy,
        "milestones": asdict(spec.milestones),
        "neutralDurabilityMultiplier": neutral_multiplier,
        "recommendedMultiplierToWindow": recommended,
        "recommendedEffectiveDurability": durability * recommended,
        "practiceBp": spec.practice_bp,
        "staticRiskNote": "practiceBp is reported but needs route risk/RNG replay",
    }


def _pick(data: dict[str, Any], camel: str, snake: str, default: Any) -> Any:
    return data[camel] if camel in data else data.get(snake, default)


def input_from_dict(data: dict[str, Any]) -> PacingInput:
    chapter = _pick(data, "chapter", "chapter", 1)
    index = chapter_index(chapter)
    kind = str(_pick(data, "kind", "kind", "boss")).lower()
    if kind not in KIND_DEFAULTS:
        raise ValueError("kind must be boss or elite")
    defaults = KIND_DEFAULTS[kind]
    raw_milestones = _pick(data, "milestones", "milestones", None)
    if raw_milestones is None:
        milestones = chapter_milestones(index + 1, kind)
    else:
        milestones = Milestones(
            bool(_pick(raw_milestones, "meridianComplete", "meridian_complete", True)),
            bool(_pick(raw_milestones, "smallCycle", "small_cycle", False)),
            bool(_pick(raw_milestones, "greatCycle", "great_cycle", False)),
            bool(_pick(raw_milestones, "twelveCycle", "twelve_cycle", False)),
            int(_pick(raw_milestones, "turns", "turns", 0)),
        )
    return PacingInput(
        index + 1, kind, int(_pick(data, "effGrade", "eff_grade",
                                  CHAPTER_STANDARD_GRADES[index])),
        int(_pick(data, "effLayer", "eff_layer",
                  default_eff_layer(index + 1, kind))),
        int(_pick(data, "mpRatioBp", "mp_ratio_bp", defaults["mp_ratio_bp"])),
        int(_pick(data, "practiceBp", "practice_bp", defaults["practice_bp"])),
        int(_pick(data, "capacityScaleBp", "capacity_scale_bp", defaults["capacity_scale_bp"])),
        str(_pick(data, "innerNature", "inner_nature", "harmony")),
        str(_pick(data, "openPolicy", "open_policy", defaults["open_policy"])),
        milestones, float(_pick(data, "hpMultiplier", "hp_multiplier", 1.0)),
        float(_pick(data, "defenseMultiplier", "defense_multiplier", 1.0)),
        int(_pick(data, "attackRouteLength", "attack_route_length", 10)),
        int(_pick(data, "defenseRouteLength", "defense_route_length", 6)),
        str(_pick(data, "name", "name", "unit")),
    )


def read_inputs(path: Path) -> list[PacingInput]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = payload if isinstance(payload, list) else payload.get("units", [payload])
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        raise ValueError("JSON must be an object, an array, or {units: [...]}")
    return [input_from_dict(row) for row in rows]


def run_checks() -> None:
    for chapter in range(1, 15):
        for kind in ("boss", "elite"):
            defaults = KIND_DEFAULTS[kind]
            neutral = input_from_dict({
                "chapter": chapter, "kind": kind,
                "effGrade": CHAPTER_STANDARD_GRADES[chapter - 1],
                "effLayer": 8, "mpRatioBp": flow.BP,
                "practiceBp": flow.BP, "capacityScaleBp": flow.BP,
                "innerNature": "harmony",
                "openPolicy": defaults["open_policy"],
                "milestones": asdict(chapter_milestones(chapter, "elite")),
            })
            result = estimate(neutral)
            assert result["strengthBp"] == flow.BP
            assert result["playerAttackBp"] == flow.BP
            assert result["bossDefenseBp"] == flow.BP
            assert math.isclose(result["estimatedRounds"],
                                result["templateRounds"], abs_tol=1e-12)

    # Inject a 1.36x reusable oracle profile, then use estimate()'s exact
    # recommendation (23/Rraw) to return the Boss to the window.
    original = cultivation_raw
    raw_calls = 0
    def strong_raw(*_args: Any, **_kwargs: Any) -> tuple[int, int, int, int]:
        nonlocal raw_calls
        raw_calls += 1
        value = 13_600 if raw_calls % 2 else 10_000
        return (value, value, value, value)
    globals()["cultivation_raw"] = strong_raw
    strong_spec = input_from_dict({
        "chapter": 2, "kind": "boss", "effGrade": 8,
        "effLayer": 8, "mpRatioBp": 10_000,
        "capacityScaleBp": 10_000, "innerNature": "harmony",
    })
    try:
        unadjusted = estimate(strong_spec)
        recommended = unadjusted["recommendedMultiplierToWindow"]
        adjusted = estimate(PacingInput(
            **{**asdict(strong_spec), "milestones": strong_spec.milestones,
               "hp_multiplier": recommended}
        ))
    finally:
        globals()["cultivation_raw"] = original
    assert unadjusted["strengthBp"] == 13_600
    assert unadjusted["estimatedRounds"] > 25.0
    assert math.isclose(recommended, 23.0 / unadjusted["estimatedRounds"])
    assert 12.0 <= adjusted["estimatedRounds"] <= 25.0
    print("boss_pacing: all checks passed")


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--check", action="store_true")
    result.add_argument("--json", type=Path, help="JSON object/list input")
    result.add_argument("--chapter", default=1)
    result.add_argument("--kind", choices=("boss", "elite"), default="boss")
    result.add_argument("--name", default="unit")
    result.add_argument("--eff-grade", type=int)
    result.add_argument("--eff-layer", type=int)
    result.add_argument("--mp-ratio-bp", type=int)
    result.add_argument("--practice-bp", type=int)
    result.add_argument("--capacity-scale-bp", type=int)
    result.add_argument("--inner-nature", choices=("yin", "yang", "harmony"), default="harmony")
    result.add_argument("--open-policy")
    result.add_argument("--hp-multiplier", type=float, default=1.0)
    result.add_argument("--defense-multiplier", type=float, default=1.0)
    result.add_argument("--attack-route-length", type=int, default=10)
    result.add_argument("--defense-route-length", type=int, default=6)
    result.add_argument("--meridian-complete", action=argparse.BooleanOptionalAction)
    result.add_argument("--small-cycle", action=argparse.BooleanOptionalAction)
    result.add_argument("--great-cycle", action=argparse.BooleanOptionalAction)
    result.add_argument("--twelve-cycle", action=argparse.BooleanOptionalAction)
    result.add_argument("--turns", type=int)
    return result


def direct_input(args: argparse.Namespace) -> PacingInput:
    index = chapter_index(args.chapter)
    defaults = KIND_DEFAULTS[args.kind]
    base_milestones = chapter_milestones(index + 1, args.kind)
    data = {
        "chapter": index + 1, "kind": args.kind, "name": args.name,
        "effGrade": args.eff_grade if args.eff_grade is not None else CHAPTER_STANDARD_GRADES[index],
        "effLayer": args.eff_layer if args.eff_layer is not None else default_eff_layer(index + 1, args.kind),
        "mpRatioBp": args.mp_ratio_bp if args.mp_ratio_bp is not None else defaults["mp_ratio_bp"],
        "practiceBp": args.practice_bp if args.practice_bp is not None else defaults["practice_bp"],
        "capacityScaleBp": args.capacity_scale_bp if args.capacity_scale_bp is not None else defaults["capacity_scale_bp"],
        "innerNature": args.inner_nature,
        "openPolicy": args.open_policy or defaults["open_policy"],
        "hpMultiplier": args.hp_multiplier, "defenseMultiplier": args.defense_multiplier,
        "attackRouteLength": args.attack_route_length, "defenseRouteLength": args.defense_route_length,
        "milestones": {
            "meridianComplete": base_milestones.meridian_complete if args.meridian_complete is None else args.meridian_complete,
            "smallCycle": base_milestones.small_cycle if args.small_cycle is None else args.small_cycle,
            "greatCycle": base_milestones.great_cycle if args.great_cycle is None else args.great_cycle,
            "twelveCycle": base_milestones.twelve_cycle if args.twelve_cycle is None else args.twelve_cycle,
            "turns": base_milestones.turns if args.turns is None else args.turns,
        },
    }
    return input_from_dict(data)


def main(argv: Iterable[str] | None = None) -> int:
    args = parser().parse_args(argv)
    if args.check:
        run_checks()
        return 0
    specs = read_inputs(args.json) if args.json else [direct_input(args)]
    print(json.dumps([estimate(spec) for spec in specs], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

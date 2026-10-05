#!/usr/bin/env python3
"""Integer reference model for AR-16 projected-force range and power.

This is a small balance oracle, not the production targeting engine.  It owns
no hex geometry: each MoveDef supplies its reviewed spread-step labels and the
combat system expands those labels into tiles.  Only the Python standard
library and pure helpers from ``meridian_flow_sim`` are used.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from typing import Optional, Sequence

from meridian_flow_sim import (
    BP, MOB_PROFILE, STANDARD_PROFILE, STRONG_PROFILE, VERY_STRONG_PROFILE,
    MeridianProfile, attack_meridian_mult_bp, clamp, lerp_anchors, meridian_strength_bp,
    mul_bp_floor, route_reach_bp, speed_meridian_mult_bp,
)

# This is the target lookup inside Z5M, before route realisation.  Values may
# exceed the final 22000 bp cap so a near-perfect long route can reach it while
# shorter routes still matter.  The final multiplier is always clamped.
PROJECTED_ATTACK_CURVE = (
    (4_000, 5_000), (5_000, 5_500), (6_500, 6_500), (8_000, 8_000),
    (10_000, 10_000), (12_000, 15_200), (15_000, 23_200),
    (18_000, 26_000), (22_000, 28_000), (25_000, 28_000),
)
PROJECTED_ATTACK_RANGE_BP = (6_500, 22_000)
RANGE_BONUS_BY_STEP = (0, 2, 4)
EXTRA_MP_COST_BP_BY_STEP = (0, 200, 400)

# A projected route normally touches a hand/wrist point registered by
# design/15; controlled human voice may instead use one of two throat points.
PROJECTION_ROUTE_POINTS = frozenset({
    "ap_shoutaiyin_shaoshang",
    "ap_shouyangming_shangyang", "ap_shouyangming_hegu",
    "ap_shoushaoyin_shaochong",
    "ap_shoutaiyang_shaoze", "ap_shoutaiyang_wangu",
    "ap_shoutaiyang_yanggu",
    "ap_shoujueyin_neiguan", "ap_shoujueyin_laogong",
    "ap_shoujueyin_zhongchong",
    "ap_shoushaoyang_guanchong", "ap_shoushaoyang_yangchi",
    "ap_shoushaoyang_waiguan",
})
VOICE_PROJECTION_ROUTE_POINTS = frozenset({
    "ap_yinwei_tiantu", "ap_yinwei_lianquan",
})


def projection_route_has_endpoint(
    acupoint_refs: Sequence[str], *, sonic: bool = False, voice: bool = False,
) -> bool:
    """Whether a full route touches an approved projection endpoint."""
    endpoints = (PROJECTION_ROUTE_POINTS | VOICE_PROJECTION_ROUTE_POINTS
                 if sonic and voice else PROJECTION_ROUTE_POINTS)
    return not endpoints.isdisjoint(acupoint_refs)


@dataclass(frozen=True)
class ProjectionMilestones:
    small_cycle: bool = False
    great_cycle: bool = False
    twelve_cycle: bool = False
    turns: int = 0

    def validate(self) -> None:
        if not 0 <= self.turns <= 9:
            raise ValueError("turns must be 0..9")
        if self.great_cycle and not self.small_cycle:
            raise ValueError("great cycle requires small cycle")
        if self.turns and not self.great_cycle:
            raise ValueError("nine-turn progress requires great cycle")
        if self.turns >= 4 and not self.twelve_cycle:
            raise ValueError("turn four and above require twelve-cycle flow")


@dataclass(frozen=True)
class ProjectionMove:
    move_id: str
    name: str
    base_range: int
    spread_steps: tuple[str, str, str]
    route_length: int = 10
    sonic: bool = False

    def validate(self) -> None:
        if self.base_range < 0:
            raise ValueError("base range must be non-negative")
        if not isinstance(self.sonic, bool):
            raise ValueError("sonic must be boolean")
        if len(self.spread_steps) != 3 or any(not item for item in self.spread_steps):
            raise ValueError("a projected move needs exactly three spread steps")
        route_reach_bp(self.route_length)  # validates the shared 1..18 bound


@dataclass(frozen=True)
class ProjectionResult:
    move_id: str
    speed_bp: int
    max_step: int
    selected_step: int
    effective_range: int
    spread: str
    extra_mp_cost_bp: int
    extra_mp_cost: int
    attack_mult_bp: int
    projection_boost_active: bool


def projected_attack_mult_bp(
    attacker: MeridianProfile, defender: MeridianProfile, route_length: int,
) -> int:
    """AR-16 replacement curve for this projected move's single Z5M."""
    relative_bp = clamp(
        meridian_strength_bp(attacker) * BP
        // max(1, meridian_strength_bp(defender)), 4_000, 25_000,
    )
    target_bp = lerp_anchors(relative_bp, PROJECTED_ATTACK_CURVE)
    advantage_completion_bp = (
        attacker.completion_bp if relative_bp >= BP else defender.completion_bp
    )
    quality_reach_bp = clamp(
        5_000 + advantage_completion_bp // 2, 5_000, BP,
    )
    realise_bp = mul_bp_floor(route_reach_bp(route_length), quality_reach_bp)
    if target_bp >= BP:
        result_bp = BP + mul_bp_floor(target_bp - BP, realise_bp)
    else:
        result_bp = BP - mul_bp_floor(BP - target_bp, realise_bp)
    return clamp(result_bp, *PROJECTED_ATTACK_RANGE_BP)


def _z5m_factors_bp(
    move: ProjectionMove, attacker: MeridianProfile, defender: MeridianProfile,
    selected_step: int,
) -> tuple[int]:
    """Choose exactly one ordinary/projected Z5M factor."""
    factor = (attack_meridian_mult_bp(attacker, defender, move.route_length)
              if move.sonic and selected_step == 0
              else projected_attack_mult_bp(attacker, defender, move.route_length))
    return (factor,)


def max_expansion_step(
    profile: MeridianProfile, milestones: ProjectionMilestones,
    reference: MeridianProfile = STANDARD_PROFILE, *,
    sealed: bool = False, ruptured: bool = False,
) -> int:
    """Return the maximum selectable 0/1/2 spread step from existing facts."""
    milestones.validate()
    speed_bp = speed_meridian_mult_bp(
        profile, reference, sealed=sealed, ruptured=ruptured,
    )
    top = (
        profile.qi_bp >= 16_000 and profile.capacity_bp >= 15_000
        and speed_bp >= 12_000 and milestones.great_cycle
        and milestones.twelve_cycle and milestones.turns >= 4
    )
    high = (
        profile.qi_bp >= 12_000 and profile.capacity_bp >= 12_000
        and speed_bp >= 11_000 and milestones.small_cycle
    )
    return 2 if top else 1 if high else 0


def projection_result(
    move: ProjectionMove, attacker: MeridianProfile,
    defender: MeridianProfile = STANDARD_PROFILE, *,
    milestones: ProjectionMilestones = ProjectionMilestones(),
    selected_step: Optional[int] = None, mp_ref: int = 0,
    reference: MeridianProfile = STANDARD_PROFILE,
    sealed: bool = False, ruptured: bool = False, route_open: bool = True,
) -> ProjectionResult:
    """Resolve range choice, rounded MP surcharge and the one Z5M value.

    ``route_open=False`` models a preflight level-nine seal or rupture: the
    projected move is illegal and therefore raises rather than silently using
    a stale expanded target set.  Lesser seals/stagnation are represented in
    the caller's already-normalised profile.
    """
    move.validate()
    if mp_ref < 0:
        raise ValueError("mp_ref must be non-negative")
    if not route_open:
        raise ValueError("projected route is hard-blocked")
    maximum = max_expansion_step(
        attacker, milestones, reference, sealed=sealed, ruptured=ruptured,
    )
    chosen = maximum if selected_step is None else selected_step
    if chosen not in (0, 1, 2) or chosen > maximum:
        raise ValueError("selected expansion step is unavailable")
    extra_bp = EXTRA_MP_COST_BP_BY_STEP[chosen]
    # Resource costs use non-negative round-half-up, unlike damage boundaries.
    extra_mp = (mp_ref * extra_bp + BP // 2) // BP
    speed_bp = speed_meridian_mult_bp(
        attacker, reference, sealed=sealed, ruptured=ruptured,
    )
    boost_active = not move.sonic or chosen >= 1
    (attack_bp,) = _z5m_factors_bp(move, attacker, defender, chosen)
    return ProjectionResult(
        move_id=move.move_id, speed_bp=speed_bp, max_step=maximum,
        selected_step=chosen,
        effective_range=move.base_range + RANGE_BONUS_BY_STEP[chosen],
        spread=move.spread_steps[chosen], extra_mp_cost_bp=extra_bp,
        extra_mp_cost=extra_mp,
        attack_mult_bp=attack_bp, projection_boost_active=boost_active,
    )


STANDARD_MILESTONES = ProjectionMilestones()
HIGH_MILESTONES = ProjectionMilestones(small_cycle=True)
TOP_MILESTONES = ProjectionMilestones(True, True, True, 9)
MAX_PROFILE = MeridianProfile(18_000, 18_000, 18_000, 18_000)

# These are review fixtures for the author examples, not production catalog
# definitions.  M5c must mark concrete MoveDefs and may choose different legal
# base templates.  Each row deliberately has a distinct route length.
AUTHOR_EXAMPLES = (
    ProjectionMove(
        "mv_tanzhi_tanzhi", "弹指神通·弹指", 5,
        ("单体", "单体（射程扩张）", "单体（射程扩张）"), 3,
    ),
    ProjectionMove(
        "fixture_dugu9_sword_qi", "独孤九剑（剑气招）", 1,
        ("直线 n1", "直线 n2", "直线 n3"), 10,
    ),
    ProjectionMove(
        "mv_xianglong18_lishe", "降龙十八掌·利涉大川", 4,
        ("直线 n4", "直线 n5", "直线 n6"), 7,
    ),
)
EXAMPLE_TIERS = (
    ("标准", STANDARD_PROFILE, STANDARD_MILESTONES),
    ("高", STRONG_PROFILE, HIGH_MILESTONES),
    ("顶尖", VERY_STRONG_PROFILE, TOP_MILESTONES),
)
SONIC_FIXTURE = ProjectionMove(
    "fixture_voice_sonic", "人声音功夹具", 3,
    ("圆形 r1", "圆形 r2", "圆形 r3"), 8, True,
)


@dataclass(frozen=True)
class ActionStage:
    kind: str
    damage_kind: Optional[str] = None


DASHOUYIN_FIXTURE = (
    "mv_dashouyin_dashouyin", True,
    ("圆形 r1", "圆形 r2", "圆形 r3"),
    ("ap_chongmai_henggu", "ap_chongmai_qichong",
     "ap_shoutaiyang_wangu", "ap_zutaiyin_yinlingquan",
     "ap_zushaoyin_taixi", "ap_shouyangming_quchi",
     "ap_shouyangming_shousanli", "ap_shouyangming_hegu"),
    (ActionStage("leap"), ActionStage("landing_palm_wind", "projected")),
)


def validate_dashouyin_fixture(fixture: tuple) -> None:
    """Validate the MF-T24 leap/landing split used by the content gate."""
    move_id, projection, spreads, route, stages = fixture
    if move_id != "mv_dashouyin_dashouyin" or projection is not True:
        raise ValueError("large handprint must be marked projected")
    if len(spreads) != 3 or any(not spread for spread in spreads):
        raise ValueError("large handprint needs three reviewed range steps")
    if not projection_route_has_endpoint(route):
        raise ValueError("large handprint route needs a hand/wrist endpoint")
    leaps = [stage for stage in stages if stage.kind == "leap"]
    if not leaps or any(stage.damage_kind is not None for stage in leaps):
        raise ValueError("leap movement must not deal damage")
    damage_stages = [stage for stage in stages if stage.damage_kind is not None]
    if (len(damage_stages) != 1
            or damage_stages[0] != ActionStage("landing_palm_wind", "projected")):
        raise ValueError("only the landing palm wind may deal projected damage")


def example_rows(mp_ref: int = 10_000) -> list[tuple[str, str, ProjectionResult]]:
    return [
        (move.name, tier, projection_result(
            move, profile, milestones=milestones, mp_ref=mp_ref,
        ))
        for move in AUTHOR_EXAMPLES
        for tier, profile, milestones in EXAMPLE_TIERS
    ]


def run_checks() -> None:
    # Build-time route validation: one approved endpoint is necessary, and
    # internal/body-only or empty routes do not qualify as projected force.
    assert projection_route_has_endpoint((
        "ap_renmai_danzhong", "ap_shoujueyin_laogong",
    ))
    assert not projection_route_has_endpoint(("ap_renmai_danzhong",))
    assert not projection_route_has_endpoint(())
    assert projection_route_has_endpoint(("ap_yinwei_tiantu",), sonic=True, voice=True)
    assert projection_route_has_endpoint(("ap_yinwei_lianquan",), sonic=True, voice=True)
    assert not projection_route_has_endpoint(("ap_yinwei_tiantu",), sonic=True)
    assert not projection_route_has_endpoint(("ap_yinwei_lianquan",), voice=True)

    # Standard versus standard is exactly neutral in range, spread and Z5M.
    for move in AUTHOR_EXAMPLES:
        result = projection_result(move, STANDARD_PROFILE)
        assert result.selected_step == 0
        assert result.effective_range == move.base_range
        assert result.attack_mult_bp == BP
        assert result.extra_mp_cost == 0

    # Every existing input component is monotone along this legal progression.
    profiles = (STANDARD_PROFILE, STRONG_PROFILE, VERY_STRONG_PROFILE, MAX_PROFILE)
    milestones = (STANDARD_MILESTONES, HIGH_MILESTONES, TOP_MILESTONES, TOP_MILESTONES)
    move = AUTHOR_EXAMPLES[1]
    results = [projection_result(move, p, milestones=m)
               for p, m in zip(profiles, milestones)]
    assert all(a.max_step <= b.max_step for a, b in zip(results, results[1:]))
    assert all(a.effective_range <= b.effective_range
               for a, b in zip(results, results[1:]))
    assert all(a.attack_mult_bp < b.attack_mult_bp
               for a, b in zip(results, results[1:]))

    # Range and damage hard caps hold even for maximum and extreme ratios.
    capped = projection_result(
        move, MAX_PROFILE, MOB_PROFILE, milestones=TOP_MILESTONES,
    )
    assert capped.selected_step == 2 and capped.effective_range == move.base_range + 4
    assert capped.attack_mult_bp == 22_000
    assert projected_attack_mult_bp(MOB_PROFILE, MAX_PROFILE, 18) == 6_500

    # Expansion is optional, costs are exact, and disruption cannot leave it stale.
    collapsed = projection_result(
        move, VERY_STRONG_PROFILE, milestones=TOP_MILESTONES, selected_step=0,
        mp_ref=12_345, sealed=True,
    )
    assert collapsed.max_step == 0 and collapsed.extra_mp_cost == 0
    widened = projection_result(
        move, VERY_STRONG_PROFILE, milestones=TOP_MILESTONES, selected_step=1,
        mp_ref=12_345,
    )
    expanded = projection_result(
        move, VERY_STRONG_PROFILE, milestones=TOP_MILESTONES, selected_step=2,
        mp_ref=12_345,
    )
    assert widened.extra_mp_cost == 247   # roundHalfUp(12345*2%).
    assert expanded.extra_mp_cost == 494  # roundHalfUp(12345*4%).
    assert widened.attack_mult_bp == expanded.attack_mult_bp
    try:
        projection_result(move, VERY_STRONG_PROFILE, route_open=False)
    except ValueError as exc:
        assert "hard-blocked" in str(exc)
    else:
        raise AssertionError("a hard-blocked projected route must be rejected")

    # MF-T23: only sonic steps 1/2 activate projection; each resolves one Z5M.
    sonic_results = (
        projection_result(SONIC_FIXTURE, STRONG_PROFILE,
                          milestones=HIGH_MILESTONES, selected_step=0, mp_ref=12_345),
        projection_result(SONIC_FIXTURE, STRONG_PROFILE,
                          milestones=HIGH_MILESTONES, selected_step=1, mp_ref=12_345),
        projection_result(SONIC_FIXTURE, VERY_STRONG_PROFILE,
                          milestones=TOP_MILESTONES, selected_step=2, mp_ref=12_345),
    )
    ordinary_zero = attack_meridian_mult_bp(
        STRONG_PROFILE, STANDARD_PROFILE, SONIC_FIXTURE.route_length)
    assert (sonic_results[0].projection_boost_active,
            sonic_results[0].effective_range, sonic_results[0].extra_mp_cost_bp,
            sonic_results[0].attack_mult_bp) == (False, 3, 0, ordinary_zero)
    assert [(r.projection_boost_active, r.effective_range, r.extra_mp_cost_bp)
            for r in sonic_results[1:]] == [(True, 5, 200), (True, 7, 400)]
    assert sonic_results[1].attack_mult_bp == projected_attack_mult_bp(
        STRONG_PROFILE, STANDARD_PROFILE, SONIC_FIXTURE.route_length)
    assert sonic_results[2].attack_mult_bp == projected_attack_mult_bp(
        VERY_STRONG_PROFILE, STANDARD_PROFILE, SONIC_FIXTURE.route_length)
    assert [result.extra_mp_cost for result in sonic_results] == [0, 247, 494]
    assert all(len(_z5m_factors_bp(
        SONIC_FIXTURE, profile, STANDARD_PROFILE, step)) == 1
        for profile, step in ((STRONG_PROFILE, 0), (STRONG_PROFILE, 1),
                              (VERY_STRONG_PROFILE, 2)))

    # MF-T24: the real eight-node route passes; four broken variants fail.
    validate_dashouyin_fixture(DASHOUYIN_FIXTURE)
    move_id, projection, spreads, route, stages = DASHOUYIN_FIXTURE
    bad_fixtures = (
        (move_id, projection, spreads, route,
         (ActionStage("leap", "projected"), stages[1])),
        (move_id, projection, spreads, route,
         (stages[0], ActionStage("landing_palm_wind", "unarmed"))),
        (move_id, projection, spreads, route,
         (stages[0], stages[1], ActionStage("aftershock", "projected"))),
        (move_id, projection, spreads,
         ("ap_chongmai_henggu", "ap_zushaoyin_taixi"), stages),
    )
    for fixture in bad_fixtures:
        try:
            validate_dashouyin_fixture(fixture)
        except ValueError:
            pass
        else:
            raise AssertionError("an invalid MF-T24 fixture must be rejected")

    # Frozen author-example table: catches accidental curve or fixture drift.
    expected = {
        ("弹指神通·弹指", "标准"): (5, "单体", 10_000),
        ("弹指神通·弹指", "高"): (7, "单体（射程扩张）", 12_165),
        ("弹指神通·弹指", "顶尖"): (9, "单体（射程扩张）", 15_471),
        ("独孤九剑（剑气招）", "标准"): (1, "直线 n1", 10_000),
        ("独孤九剑（剑气招）", "高"): (3, "直线 n2", 13_581),
        ("独孤九剑（剑气招）", "顶尖"): (5, "直线 n3", 19_046),
        ("降龙十八掌·利涉大川", "标准"): (4, "直线 n4", 10_000),
        ("降龙十八掌·利涉大川", "高"): (6, "直线 n5", 12_974),
        ("降龙十八掌·利涉大川", "顶尖"): (8, "直线 n6", 17_514),
    }
    actual = {(name, tier): (r.effective_range, r.spread, r.attack_mult_bp)
              for name, tier, r in example_rows()}
    assert actual == expected, actual


def print_report() -> None:
    print("| 示例 | 修为 | 经脉速度 bp | 射程 | 作用范围 | 额外耗内 | Z5M |")
    print("|---|---|---:|---:|---|---:|---:|")
    for name, tier, result in example_rows():
        print(
            "| {} | {} | {} | {} | {} | {}% MPREF | {:.4f} |".format(
                name, tier, result.speed_bp, result.effective_range,
                result.spread, result.extra_mp_cost_bp / 100,
                result.attack_mult_bp / BP,
            )
        )


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--report", action="store_true")
    args = parser.parse_args(argv)
    if args.check:
        run_checks()
        print("projection_sim: all checks passed")
    if args.report or not args.check:
        print_report()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

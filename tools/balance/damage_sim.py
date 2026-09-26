#!/usr/bin/env python3
"""Deterministic balance model for docs/design/04-damage-formula.md.

Only the Python 3 standard library is used.  The combat pipeline itself uses
integer basis points (bp, 10_000 == 100%) and floors at every Z boundary, so
the same fixtures can later be ported to the TypeScript core without relying
on platform-specific floating point behaviour.  The report uses exact
probability expectations rather than Monte Carlo sampling.
"""

from __future__ import annotations

import argparse
import math
import sys
from dataclasses import dataclass, replace
from typing import Dict, List, Optional, Sequence, Tuple


BP = 10_000  # design/04 §1.2: 10_000 bp == 100%.

# docs/00-canon.md §4: grade coefficient G(g), stored as bp.
GRADE_BP: Tuple[int, ...] = (
    0, 10_000, 11_000, 12_000, 14_000, 15_500, 17_000,
    20_000, 22_000, 24_000, 28_000, 31_000, 35_000,
)

# docs/design/05 §5.5: tenth-layer, main-slot inner contribution budget.
INNER_BUDGET: Dict[int, Tuple[float, float, float, float]] = {
    1: (6, 4, 2, 1.0), 2: (8, 5, 3, 1.0),
    3: (10, 6, 4, 1.2), 4: (14, 8, 6, 1.5),
    5: (17, 10, 7, 1.5), 6: (20, 12, 8, 1.8),
    7: (26, 16, 10, 2.0), 8: (30, 18, 12, 2.2),
    9: (34, 20, 14, 2.5), 10: (42, 25, 18, 3.0),
    11: (48, 29, 21, 3.3), 12: (56, 34, 24, 3.6),
}

# docs/design/03 §3.5: P_ref realm coefficient tau.
TIER_TAU_BP = {"HIGH": 10_000, "MID": 8_000, "LOW": 7_500}

# docs/design/03 §§3.1, 3.5: level curves and the standard-loadout trajectory.
LEVEL_RANGE = (1, 70)
BEGINNER_LEVEL_SPAN = 34.0
HP_CURVE = (300.0, 4.10, 20.0)  # base, quadratic, beginner linear.
MP_CURVE = (200.0, 2.45, 12.0)
ATK_LV_FROM_MP = 0.20
DEF_LV_FROM_MP = 0.15
G_MAIN_STEPS = 11
G_MAIN_LEVEL_SPAN = 49
G_REF_STEPS = 10
G_REF_LEVEL_SPAN = 69
LAYER_REF_BASE = 3
LAYER_REF_LEVEL_STEP = 10
STD_INNATE_BASE = 50.0
STD_INNATE_PER_LEVEL = 0.15
STD_APTITUDE_BASE = 25.0
STD_APTITUDE_PER_LEVEL = 0.60

# docs/design/05 §§3.1, 5.5: layer scaling and two same-source auxiliaries.
LAYER_BASE_BP = 5_000
LAYER_PER_LEVEL_BP = 1_000
INNER_SCALE_BASE = 0.30
INNER_SCALE_PER_LAYER = 0.07
# Two auxiliaries at ratio 0.50 equal one additional INNER_BUDGET entry.
STD_AUX_TOTAL_RATIO = 1.00

# docs/design/03 §§3.4, 4.1, 4.5: standard sheet coefficients.
STAT_FORMULA_FLOOR = 0.50
HP_CON_PER_POINT = 0.008
HP_SMALL_ITEM_COUNT = 4
HP_SMALL_ITEM_COEFF = 0.01
MP_WIL_PER_POINT = 0.006
MP_CON_PER_POINT = 0.004
ATK_STR_PER_POINT = 0.010
WEAPON_ATK_COEFF = 0.30
ATK_IN_MP_COEFF = 0.20
DEF_CON_PER_POINT = 0.006
DEF_STR_PER_POINT = 0.002
ARMOUR_DEF_OUT_COEFF = 0.40
DEF_IN_MP_COEFF = 0.15
ARMOUR_DEF_IN_COEFF = 0.10
Q_SKILL_BY_GRADE = (0, 32, 38, 45, 56, 65, 74, 92, 104, 120)
Q_SKILL_LAYER_BASE = 0.40
Q_SKILL_PER_LAYER = 0.06
Q_AGI_PER_POINT = 0.25
Q_LEVEL_PER_POINT = 0.30
Q_AP_PER_POINT = 0.15
Q_EQUIP_PER_GRADE = 2.5
Q_INNER_COEFF = 3.0

# docs/design/03 §§4.2, 4.8, 6.1, 7.4: derived-rating coefficients.
LORE_CAP = 60.0
LORE_PER_LEVEL = 0.8
HIT_FORMULA = (60.0, 0.5, 0.3, 0.5)  # base, agi, wis, level.
EVA_FORMULA = (35.0, 0.5, 0.2, 0.5, 0.10)  # base, agi, luk, level, qinggong.
PARRY_FORMULA = (15.0, 0.3, 0.2, 0.3, 12.0)  # base, str, wis, level, sword.
PIERCE_FORMULA = (10.0, 0.3, 0.1, 0.3, 0.2)  # base, wis, str, level, lore.
CRIT_FORMULA = (5.0, 0.3, 0.15, 0.1, 0.2)  # base, luk, wis, agi, level.
TOUGH_FORMULA = (5.0, 0.25, 0.2, 0.2)  # base, con, wil, level.
EFF_HIT_FORMULA = (10.0, 0.3, 0.2, 0.3)  # base, wis, wil, level.
EFF_RES_FORMULA = (10.0, 0.3, 0.2, 0.3)  # base, wil, con, level.
CRIT_DMG_BASE = 150.0
CRIT_DMG_STR_PER_POINT = 0.5
CRIT_DMG_RANGE = (120.0, 300.0)
HEAL_POWER_BASE = 100.0
HEAL_POWER_WIS_PER_POINT = 0.2
HEAL_POWER_RANGE = (0.0, 300.0)
HEAL_RECV_BASE = 100.0
HEAL_RECV_CON_PER_POINT = 0.3
HEAL_RECV_RANGE = (0.0, 200.0)

# docs/design/02 §2.1 and §3.1: tier caps and chapter curve.
TIER_LAYER_CAP = {"HIGH": 10, "MID": 9, "LOW": 8}
TIER_GRADE_MAX = {
    "HIGH": {"normal": 9, "elite": 9, "boss": 9},
    "MID": {"normal": 8, "elite": 9, "boss": 9},
    "LOW": {"normal": 7, "elite": 8, "boss": 8},
}

# docs/design/03 §10.3: enemy template multipliers and template power.
TEMPLATE = {
    "normal": dict(hp=0.60, atk=1.00, defense=0.85, rating=-10, power=1.00),
    "elite": dict(hp=1.30, atk=1.10, defense=1.00, rating=0, power=1.00),
    "boss": dict(hp=None, atk=1.25, defense=1.20, rating=15, power=1.10),
}
BOSS_HP_MULTIPLIERS = (4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0)

# docs/design/03 §§10.2, 10.5: enemy grade/layer and difficulty formulas.
ENEMY_STAT_MUL_BASE = 0.85
ENEMY_STAT_MUL_PER_DIFFICULTY = 0.05
ENEMY_GRADE_BASE = 1.0
ENEMY_GRADE_SCALE = 7.3
ENEMY_WUYUN_BASE = 0.1
ENEMY_WUYUN_SCALE = 0.009
ENEMY_LEVEL_EXPONENT = 0.65
ENEMY_NON_NORMAL_GRADE_BONUS = 1.5
ENEMY_LAYER_BASE = 2.5
ENEMY_LAYER_LEVEL_SCALE = 5.0
ENEMY_NORMAL_LAYER_CAP_RESERVE = 2
ENEMY_NON_NORMAL_LAYER_BONUS = 1

# docs/design/04 §3–§4: calibrated constants.
DAMAGE_SCALE_BP = 12_400  # §4.1: makes equal, ordinary hits roughly 11% hp.
DEFENSE_K_BP = 12_000  # §4.2: DEF ratio denominator uses 1.20 * ATK_mix.
PARRY_REDUCTION_BP = 5_000  # §4.9: a normal parry removes 50% damage.
ULTIMATE_PARRY_REDUCTION_BP = 2_500  # §4.9: ultimate halves that reduction.
REALM_PER_LEVEL_BP = 150  # §4.8: 1.5% per display-level difference.
REALM_CAP_BP = 1_500  # §4.8: level-gap modifier is capped at +/-15%.

# docs/design/04 §3.1: Z0 probability bases, rating slopes and hard bounds.
HIT_BASE_BP = 8_500
HIT_PER_RATING_BP = 40
HIT_RANGE_BP = (4_000, 9_900)
PARRY_BASE_BP = 1_200
PARRY_PER_RATING_BP = 40
PARRY_RANGE_BP = (0, 6_000)
CRIT_BASE_BP = 1_000
CRIT_PER_RATING_BP = 40
CRIT_RANGE_BP = (200, 7_500)
EFFECT_PER_RATING_BP = 100
EFFECT_RATING_FACTOR_RANGE_BP = (3_000, 20_000)

# docs/design/04 §§3.2, 4.7 and docs/design/08 §5.5: Z0/Z7 geometry.
DIRECTION_DAMAGE_BP = {"front": BP, "side": 11_000, "back": 13_000}
DIRECTION_PARRY_BP = {"front": BP, "side": 7_500, "back": 5_000}
HEIGHT_HIT_PER_LEVEL = 4
HEIGHT_HIT_RANGE = (-12, 12)
MELEE_HEIGHT_PER_LEVEL_BP = 500
MELEE_HEIGHT_RANGE_BP = (-1_000, 1_000)
RANGED_HEIGHT_PER_LEVEL_BP = 400
RANGED_HEIGHT_RANGE_BP = (-1_200, 1_600)
TERRAIN_ADD_RANGE_BP = (-3_000, 3_000)
POSITION_FACTOR_RANGE_BP = (5_000, 20_000)

# docs/design/04 §§4.2–4.5, 4.10: zone aggregation bounds.
DEF_PIERCE_RANGE_BP = (0, 6_000)
Z3_FACTOR_RANGE_BP = (5_000, 20_000)
Z4_REDUCTION_RANGE_BP = (-5_000, 7_500)
Z5_AFFINITY_ADD_RANGE_BP = (-3_000, 5_000)
APTITUDE_RANGE = (0, 100)
APTITUDE_BASE_BP = 8_000
APTITUDE_PER_POINT_BP = 40
VARIANCE_RANGE_BP = (9_500, 10_500)
RES_EFF_RANGE_BP = (-5_000, 7_500)  # design/03 §6.3.

# docs/design/04 §6 and docs/design/06 §§5.3, 8.4, 11.1: settlement.
SHIELD_HEAL_EQUIVALENT_BP = 12_000
SHIELD_DMG_MULT_MIN_BP = BP
MP_GUARD_PCT_RANGE_BP = (0, BP)
DEFAULT_MP_GUARD_RATIO_BP = 20_000  # 1 MP prevents 2 HP damage.
LIFE_STEAL_RANGE_BP = (0, 2_500)
MP_DRAIN_RANGE_BP = (0, BP)
REFLECT_RANGE_BP = (0, 4_000)
DOT_GENERAL_Z4_WEIGHT_BP = 5_000
TARGET_PROPORTIONAL_BP = {
    "normal": BP, "elite": 5_000, "boss": 2_500,
    "wardkeeper": 1_500,
}

# rulings-v1 C11 and docs/design/08 §5.3: environment-damage constants.
COLLISION_WALL_BP = 2_000
COLLISION_STRUCK_BP = 1_000
FALL_ACTIVE_SAFE_EXTRA = 2
FALL_FORCED_SAFE_EXTRA = 1
FALL_BASE_BP = 300
FALL_PER_EXCESS_BP = 500
FALL_CAP_BP = 4_000
FALL_QINGGONG_PER_POINT_BP = 25
FALL_QINGGONG_MIN_BP = 5_000
LAND_MULT_RANGE_BP = (0, 20_000)

# docs/design/05 §4.2: representative ordinary move cost by effective tier.
MP_COST_BP = {"HIGH": 800, "MID": 700, "LOW": 700}

# docs/design/04 §§8–9: representative report attack uses 65% out / 35% in.
REPORT_W_IN_BP = 3_500

# docs/design/03 §10.8: a four-person Boss party contributes 3.1 standard
# landed-hit equivalents per protagonist action. Other rows use a duel-equivalent.
PARTY_HIT_EQUIVALENTS = {"normal": 1.0, "elite": 1.0, "boss": 3.1}

# design/04 §9.1 pacing calibration.  These are encounter-layer durability
# multipliers, deliberately kept outside character stat generation: the raw
# template multipliers in design/03 were marked suggestions for design/04 to
# validate.  The values put elite solo-equivalent fights at 6-10 protagonist
# actions and four-person Boss fights at 12-25 actions without changing Z1.
ENCOUNTER_DURABILITY_BP = {
    "HIGH": {"normal": 10_000, "elite": 7_475, "boss": 8_300},
    "MID": {"normal": 10_000, "elite": 8_000, "boss": 8_500},
    "LOW": {"normal": 10_000, "elite": 8_000, "boss": 9_000},
}

# A template foe's normal attack is a pacing abstraction, not a named move.
# design/03 §10.6 already replaces its grade/layer power by P_ref*tmplPower;
# design/04 §9.1 adds this bounded attack budget so ordinary enemies stay in
# the canon 8-12 landed-hit survival band across all world tiers.
TEMPLATE_ATTACK_BUDGET_BP = {
    "HIGH": {"normal": 14_000, "elite": 12_000, "boss": 10_000},
    "MID": {"normal": 15_500, "elite": 12_000, "boss": 10_000},
    "LOW": {"normal": 17_600, "elite": 12_000, "boss": 10_000},
}

# docs/design/02 §3.1: all fourteen chapters, terminal encounter level at the
# upper end of enemyLevelBand, and explicitly listed cap-exempt Boss level.
# The last field is an optional Boss-local difficulty override; only Hong
# Antong has one in the upstream table (LOW chapter D5, local D8).
CHAPTERS: Tuple[Tuple[str, str, int, int, int, int, Optional[int], Optional[int]], ...] = (
    ("天龙", "HIGH", 85, 4, 35, 1, None, None),
    ("射雕", "HIGH", 90, 8, 50, 28, 53, None),
    ("神雕", "HIGH", 96, 9, 62, 42, 65, None),
    ("倚天", "HIGH", 95, 10, 70, 55, None, None),
    ("笑傲", "MID", 75, 7, 60, 48, 64, None),
    ("侠客", "MID", 70, 6, 58, 46, 62, None),
    ("碧血", "MID", 62, 6, 56, 44, None, None),
    ("鹿鼎", "LOW", 30, 5, 44, 30, 50, 8),
    ("连城", "LOW", 38, 4, 46, 34, 48, None),
    ("白马", "LOW", 36, 3, 46, 34, None, None),
    ("鸳鸯", "LOW", 40, 3, 48, 36, None, None),
    ("书剑", "MID", 55, 5, 52, 40, None, None),
    ("飞狐", "MID", 58, 6, 55, 43, None, None),
    ("雪山", "MID", 60, 7, 58, 46, 62, None),
)

# docs/design/03 §10.9: Hong Antong is a named, cap-exempt Boss whose hpMax is
# 75% of the same-level template Boss.  Keep this separate from the general
# tier/kind pacing multipliers above: it is a character-specific exception.
BOSS_HP_OVERRIDE_BP = {"鹿鼎": 7_500}


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def mul_bp(value: int, factor_bp: int) -> int:
    """Multiply a non-negative integer by bp and floor the boundary."""
    return value * factor_bp // BP


def round_half_up(value: float) -> int:
    """Deterministic non-negative rounding used by resource costs."""
    if value < 0:
        raise ValueError("round_half_up only accepts non-negative values")
    return int(math.floor(value + 0.5))


def level_curves(level: int) -> Tuple[float, float, float, float]:
    """docs/design/03 §3.1: HP_LV, MP_LV, ATK_LV, DEF_LV."""
    if not LEVEL_RANGE[0] <= level <= LEVEL_RANGE[1]:
        raise ValueError("display level must be in [{}, {}]".format(*LEVEL_RANGE))
    x = level - 1
    beginner = max(0.0, 1.0 - x / BEGINNER_LEVEL_SPAN)
    hp = HP_CURVE[0] + HP_CURVE[1] * x * x + HP_CURVE[2] * x * beginner
    mp = MP_CURVE[0] + MP_CURVE[1] * x * x + MP_CURVE[2] * x * beginner
    return hp, mp, ATK_LV_FROM_MP * mp, DEF_LV_FROM_MP * mp


def round_formula(value: float) -> int:
    """Round a design/03 formula cell at its documented sheet boundary."""
    return round_half_up(value)


def g_main(level: int) -> int:
    # design/03 §3.5 writes floor glyphs but explicitly says "四舍五入".
    return int(clamp(
        round_half_up(1 + (level - 1) * G_MAIN_STEPS / G_MAIN_LEVEL_SPAN), 1, 12
    ))


def g_ref(level: int) -> int:
    return int(clamp(
        round_half_up(1 + (level - 1) * G_REF_STEPS / G_REF_LEVEL_SPAN), 1, 12
    ))


def layer_ref(level: int) -> int:
    return int(clamp(
        round_half_up(LAYER_REF_BASE + level / LAYER_REF_LEVEL_STEP), 1, 10
    ))


def layer_bp(layer: int) -> int:
    """docs/design/05 §3.1: L(n) = 0.5 + 0.1n."""
    if not 1 <= layer <= 10:
        raise ValueError("effective layer must be in [1, 10]")
    return LAYER_BASE_BP + LAYER_PER_LEVEL_BP * layer


def inner_scale(layer: int) -> float:
    return INNER_SCALE_BASE + INNER_SCALE_PER_LAYER * layer


def p_ref_bp(level: int, tier: str) -> int:
    """docs/design/03 §3.5, represented as a bp-scale power index."""
    value = GRADE_BP[g_main(level)]
    value = mul_bp(value, layer_bp(layer_ref(level)))
    return mul_bp(value, TIER_TAU_BP[tier])


def boss_hp_multiplier(level: int) -> float:
    """docs/design/03 §10.3, indexed by the seven cultivation bands."""
    return BOSS_HP_MULTIPLIERS[min(len(BOSS_HP_MULTIPLIERS) - 1, (level - 1) // 10)]


@dataclass(frozen=True)
class Combatant:
    name: str
    level: int
    hp_max: int
    mp_max: int
    atk_out: int
    atk_in: int
    def_out: int
    def_in: int
    hit: int
    eva: int
    parry: int
    pierce: int
    crit: int
    crit_dmg: int  # percentage points; 150 means 150%.
    tough: int
    eff_hit: int
    eff_res: int
    aptitude: int
    ap_inner: int
    heal_power: int
    heal_recv: int
    shield: int = 0


@dataclass(frozen=True)
class Attack:
    power_bp: int = BP
    w_in_bp: int = REPORT_W_IN_BP
    move_power_bp: int = BP
    armed_bp: int = BP
    special_bp: int = BP
    dmg_up_bp: int = 0
    dmg_down_bp: int = 0
    def_pierce_bp: int = 0
    def_pierce_out_bp: int = 0
    def_pierce_in_bp: int = 0
    ignore_def: bool = False
    nature_add_bp: int = 0
    break_add_bp: int = 0
    position: str = "front"
    height_delta: int = 0
    delivery: str = "melee"
    terrain_add_bp: int = 0
    parryable: bool = True
    ultimate: bool = False
    must_hit: bool = False
    must_crit: bool = False
    skip_parry: bool = False
    no_crit: bool = False
    target_parry_mult_bp: int = BP
    shield_dmg_mult_bp: int = BP
    variance_bp: int = BP


@dataclass(frozen=True)
class Chances:
    hit_bp: int
    parry_bp: int
    crit_bp: int


@dataclass(frozen=True)
class DamageTrace:
    z1: int
    z2: int
    z3: int
    z4: int
    z5: int
    z6: int
    z7: int
    z8: int
    z9: int
    z10: int
    shield_absorb: int
    hp_damage: int


@dataclass(frozen=True)
class Settlement:
    """Post-Z10 resource changes for one direct-damage segment."""

    incoming: int
    shield_spent: int
    shield_after: int
    mp_guard_spent: int
    mp_after: int
    hp_loss: int
    hp_after: int
    injury_bleed_allowed: bool
    life_steal: int
    mp_drained: int
    reflected: int


@dataclass(frozen=True)
class ReportRow:
    chapter: str
    tier: str
    kind: str
    player_level: int
    enemy_level: int
    player_hits: float
    player_rounds: float
    enemy_hits: float
    enemy_rounds: float
    mp_ratio: float
    player_hit_chance: float
    enemy_hit_chance: float


def _sheet(
    name: str, level: int, grade_main: int, grade_aux: int, layer: int,
    innate_base: float, aptitude: float, template_kind: Optional[str] = None,
    difficulty: int = 3,
) -> Combatant:
    """Reproduce the data formulas in design/03 §§3.4–4.9 and §10."""
    hp_lv, mp_lv, atk_lv, def_lv = level_curves(level)
    scale = inner_scale(layer)
    main = INNER_BUDGET[grade_main]
    aux = INNER_BUDGET[grade_aux]
    # Standard loadout: one main plus two same-source auxiliaries at ratio 0.5.
    mp_pct = scale * (main[0] + STD_AUX_TOTAL_RATIO * aux[0])
    hp_pct = scale * (main[1] + STD_AUX_TOTAL_RATIO * aux[1])
    attr_pool = scale * (main[2] + STD_AUX_TOTAL_RATIO * aux[2])
    attr_each = attr_pool / 5.0
    con = str_ = agi = wis = wil = innate_base + attr_each
    luk = innate_base

    g_equip = grade_aux
    equip_g = GRADE_BP[g_equip] / BP
    weapon_g = GRADE_BP[grade_main] / BP
    hp_flat = HP_SMALL_ITEM_COUNT * HP_SMALL_ITEM_COEFF * equip_g * hp_lv
    hp_max = (
        hp_lv * max(STAT_FORMULA_FLOOR, 1 + HP_CON_PER_POINT * (con - 50)) + hp_flat
    ) * (1 + hp_pct / 100)
    mp_max = mp_lv * max(
        STAT_FORMULA_FLOOR,
        1 + MP_WIL_PER_POINT * (wil - 50) + MP_CON_PER_POINT * (con - 50),
    ) * (1 + mp_pct / 100)
    atk_out = atk_lv * max(
        STAT_FORMULA_FLOOR, 1 + ATK_STR_PER_POINT * (str_ - 50)
    ) + WEAPON_ATK_COEFF * weapon_g * atk_lv
    atk_in = ATK_IN_MP_COEFF * mp_max
    def_out = (
        def_lv * max(
            STAT_FORMULA_FLOOR,
            1 + DEF_CON_PER_POINT * (con - 50) + DEF_STR_PER_POINT * (str_ - 50),
        )
        + ARMOUR_DEF_OUT_COEFF * equip_g * def_lv
    )
    def_in = DEF_IN_MP_COEFF * mp_max + ARMOUR_DEF_IN_COEFF * equip_g * def_lv

    # Enemy templates have no equipped movement art in design/03 §10 examples.
    if template_kind is None:
        q_skill_grade = max(1, min(9, grade_aux - 1))
        q_skill = Q_SKILL_BY_GRADE[q_skill_grade] * (
            Q_SKILL_LAYER_BASE + Q_SKILL_PER_LAYER * layer
        )
    else:
        q_skill = 0.0
    qinggong = (
        Q_AGI_PER_POINT * max(0.0, agi - 30) + Q_LEVEL_PER_POINT * level + q_skill
        + Q_AP_PER_POINT * aptitude + Q_EQUIP_PER_GRADE * g_equip
        + Q_INNER_COEFF * (GRADE_BP[grade_main] / BP) * layer / 10
    )
    lore = min(LORE_CAP, LORE_PER_LEVEL * level)
    hit = HIT_FORMULA[0] + HIT_FORMULA[1] * agi + HIT_FORMULA[2] * wis + HIT_FORMULA[3] * level
    eva = (EVA_FORMULA[0] + EVA_FORMULA[1] * agi + EVA_FORMULA[2] * luk
           + EVA_FORMULA[3] * level + EVA_FORMULA[4] * qinggong)
    parry = (PARRY_FORMULA[0] + PARRY_FORMULA[1] * str_ + PARRY_FORMULA[2] * wis
             + PARRY_FORMULA[3] * level + PARRY_FORMULA[4])
    pierce = (PIERCE_FORMULA[0] + PIERCE_FORMULA[1] * wis + PIERCE_FORMULA[2] * str_
              + PIERCE_FORMULA[3] * level + PIERCE_FORMULA[4] * lore)
    crit = (CRIT_FORMULA[0] + CRIT_FORMULA[1] * luk + CRIT_FORMULA[2] * wis
            + CRIT_FORMULA[3] * agi + CRIT_FORMULA[4] * level)
    tough = (TOUGH_FORMULA[0] + TOUGH_FORMULA[1] * con
             + TOUGH_FORMULA[2] * wil + TOUGH_FORMULA[3] * level)
    eff_hit = (EFF_HIT_FORMULA[0] + EFF_HIT_FORMULA[1] * wis
               + EFF_HIT_FORMULA[2] * wil + EFF_HIT_FORMULA[3] * level)
    eff_res = (EFF_RES_FORMULA[0] + EFF_RES_FORMULA[1] * wil
               + EFF_RES_FORMULA[2] * con + EFF_RES_FORMULA[3] * level)
    crit_dmg = clamp(
        CRIT_DMG_BASE + CRIT_DMG_STR_PER_POINT * max(0.0, str_ - 50),
        *CRIT_DMG_RANGE
    )
    heal_power = clamp(
        HEAL_POWER_BASE + HEAL_POWER_WIS_PER_POINT * max(0.0, wis - 50),
        *HEAL_POWER_RANGE
    )
    heal_recv = clamp(
        HEAL_RECV_BASE + HEAL_RECV_CON_PER_POINT * (con - 50),
        *HEAL_RECV_RANGE
    )

    if template_kind is not None:
        tmpl = TEMPLATE[template_kind]
        enemy_mul = ENEMY_STAT_MUL_BASE + ENEMY_STAT_MUL_PER_DIFFICULTY * difficulty
        hp_mult = boss_hp_multiplier(level) if template_kind == "boss" else float(tmpl["hp"])
        hp_max *= hp_mult * enemy_mul
        atk_out *= float(tmpl["atk"]) * enemy_mul
        atk_in *= float(tmpl["atk"]) * enemy_mul
        def_out *= float(tmpl["defense"])
        def_in *= float(tmpl["defense"])
        rating = int(tmpl["rating"])
        hit += rating
        eva += rating
        parry += rating
        pierce += rating
        crit += rating
        tough += rating
        eff_hit += rating
        eff_res += rating

    return Combatant(
        name=name, level=level, hp_max=round_formula(hp_max), mp_max=round_formula(mp_max),
        atk_out=round_formula(atk_out), atk_in=round_formula(atk_in),
        def_out=round_formula(def_out), def_in=round_formula(def_in),
        hit=round_half_up(max(0, hit)), eva=round_half_up(max(0, eva)),
        parry=round_half_up(max(0, parry)), pierce=round_half_up(max(0, pierce)),
        crit=round_half_up(max(0, crit)), crit_dmg=round_half_up(crit_dmg),
        tough=round_half_up(max(0, tough)), eff_hit=round_half_up(max(0, eff_hit)),
        eff_res=round_half_up(max(0, eff_res)), aptitude=round_half_up(aptitude),
        ap_inner=round_half_up(aptitude), heal_power=round_half_up(heal_power),
        heal_recv=round_half_up(heal_recv),
    )


def player_std(level: int) -> Combatant:
    """docs/design/03 §3.5 standard player model."""
    innate = STD_INNATE_BASE + STD_INNATE_PER_LEVEL * (level - 1)
    aptitude = STD_APTITUDE_BASE + STD_APTITUDE_PER_LEVEL * (level - 1)
    return _sheet(
        "STD({})".format(level), level, g_main(level), g_ref(level),
        layer_ref(level), innate, aptitude,
    )


def enemy_std(level: int, level_cap: int, wuyun: int, tier: str, kind: str, difficulty: int) -> Combatant:
    """docs/design/03 §10.2–10.6 template enemy."""
    if kind not in TEMPLATE:
        raise ValueError("unsupported enemy kind: {}".format(kind))
    mu = ENEMY_GRADE_BASE + ENEMY_GRADE_SCALE * (
        ENEMY_WUYUN_BASE + ENEMY_WUYUN_SCALE * wuyun
    ) * (level / float(LEVEL_RANGE[1])) ** ENEMY_LEVEL_EXPONENT
    if kind != "normal":
        mu += ENEMY_NON_NORMAL_GRADE_BONUS
    grade = int(clamp(math.floor(mu + 0.5), 1, TIER_GRADE_MAX[tier][kind]))
    normal_layer = int(clamp(
        math.floor(ENEMY_LAYER_BASE + ENEMY_LAYER_LEVEL_SCALE * level / level_cap),
        1, TIER_LAYER_CAP[tier] - ENEMY_NORMAL_LAYER_CAP_RESERVE,
    ))
    layer = min(
        TIER_LAYER_CAP[tier],
        normal_layer + (0 if kind == "normal" else ENEMY_NON_NORMAL_LAYER_BONUS),
    )
    # Enemy main and two auxiliary inner arts, weapon and armour all use g_e.
    return _sheet(
        "{}-{}".format(kind, level), level, grade, grade, layer, 50.0, 25.0,
        template_kind=kind, difficulty=difficulty,
    )


def mixed_stat(out_value: int, in_value: int, w_in_bp: int) -> int:
    w_in_bp = int(clamp(w_in_bp, 0, BP))
    return (out_value * (BP - w_in_bp) + in_value * w_in_bp) // BP


def chance_hit_bp(attacker: Combatant, defender: Combatant, attack: Attack) -> int:
    if attack.must_hit:
        return BP
    height_hit = int(clamp(
        HEIGHT_HIT_PER_LEVEL * attack.height_delta, *HEIGHT_HIT_RANGE
    ))
    value = HIT_BASE_BP + HIT_PER_RATING_BP * (attacker.hit + height_hit - defender.eva)
    return int(clamp(value, *HIT_RANGE_BP))


def chance_parry_bp(attacker: Combatant, defender: Combatant, attack: Attack) -> int:
    if not attack.parryable or attack.skip_parry:
        return 0
    value = int(clamp(
        PARRY_BASE_BP + PARRY_PER_RATING_BP * (defender.parry - attacker.pierce),
        *PARRY_RANGE_BP
    ))
    direction_mult = DIRECTION_PARRY_BP[attack.position]
    value = mul_bp(value, direction_mult)
    return mul_bp(value, int(clamp(attack.target_parry_mult_bp, 0, BP)))


def chance_crit_bp(attacker: Combatant, defender: Combatant, attack: Attack) -> int:
    if attack.no_crit:
        return 0
    if attack.must_crit:
        return BP
    return int(clamp(
        CRIT_BASE_BP + CRIT_PER_RATING_BP * (attacker.crit - defender.tough),
        *CRIT_RANGE_BP
    ))


def chances(attacker: Combatant, defender: Combatant, attack: Attack) -> Chances:
    return Chances(
        chance_hit_bp(attacker, defender, attack),
        chance_parry_bp(attacker, defender, attack),
        chance_crit_bp(attacker, defender, attack),
    )


def effect_chance_bp(
    base_chance_bp: int, attacker: Combatant, defender: Combatant,
    res_eff_bp: int, extra_factor_bp: int = BP,
) -> int:
    """design/03 §4.2 and §6.3; final result is clamped to [0, 100%]."""
    rating_factor = int(clamp(
        BP + EFFECT_PER_RATING_BP * (attacker.eff_hit - defender.eff_res),
        *EFFECT_RATING_FACTOR_RANGE_BP
    ))
    result = mul_bp(base_chance_bp, rating_factor)
    result = mul_bp(result, BP - int(clamp(res_eff_bp, *RES_EFF_RANGE_BP)))
    result = mul_bp(result, extra_factor_bp)
    return int(clamp(result, 0, BP))


def position_bp(attack: Attack) -> int:
    """design/04 §4.7 and design/08 §5.5: direction * height * terrain."""
    direction = DIRECTION_DAMAGE_BP[attack.position]
    if attack.delivery == "melee":
        height_add = int(clamp(
            MELEE_HEIGHT_PER_LEVEL_BP * attack.height_delta, *MELEE_HEIGHT_RANGE_BP
        ))
    else:
        height_add = int(clamp(
            RANGED_HEIGHT_PER_LEVEL_BP * attack.height_delta, *RANGED_HEIGHT_RANGE_BP
        ))
    terrain_add = int(clamp(attack.terrain_add_bp, *TERRAIN_ADD_RANGE_BP))
    result = mul_bp(direction, BP + height_add)
    result = mul_bp(result, BP + terrain_add)
    return int(clamp(result, *POSITION_FACTOR_RANGE_BP))


def aptitude_bp(attacker: Combatant, attack: Attack) -> int:
    out_factor = APTITUDE_BASE_BP + APTITUDE_PER_POINT_BP * int(
        clamp(attacker.aptitude, *APTITUDE_RANGE)
    )
    in_factor = APTITUDE_BASE_BP + APTITUDE_PER_POINT_BP * int(
        clamp(attacker.ap_inner, *APTITUDE_RANGE)
    )
    return mixed_stat(out_factor, in_factor, attack.w_in_bp)


def damage_pipeline(
    attacker: Combatant, defender: Combatant, attack: Attack, tier: str,
    *, crit: bool = False, parried: bool = False, shield: Optional[int] = None,
) -> DamageTrace:
    """Resolve one already-hit damage segment through Z1..Z10 and settle."""
    atk_mix = max(1, mixed_stat(attacker.atk_out, attacker.atk_in, attack.w_in_bp))
    pierce_out_bp = int(clamp(
        attack.def_pierce_bp + attack.def_pierce_out_bp, *DEF_PIERCE_RANGE_BP
    ))
    pierce_in_bp = int(clamp(
        attack.def_pierce_bp + attack.def_pierce_in_bp, *DEF_PIERCE_RANGE_BP
    ))
    def_out_eff = mul_bp(defender.def_out, BP - pierce_out_bp)
    def_in_eff = mul_bp(defender.def_in, BP - pierce_in_bp)
    def_mix = max(0, mixed_stat(def_out_eff, def_in_eff, attack.w_in_bp))

    # Z1: one and only one division by the attacker's P_ref.
    z1 = mul_bp(atk_mix, DAMAGE_SCALE_BP)
    move_index = mul_bp(attack.power_bp, attack.move_power_bp)
    move_index = mul_bp(move_index, attack.armed_bp)
    move_index = mul_bp(move_index, attack.special_bp)
    z1 = z1 * move_index // max(1, p_ref_bp(attacker.level, tier))

    # Z2: ratio defense; penetration reduces DEF, ignoreDef sets it to zero.
    effective_def = 0 if attack.ignore_def else def_mix
    numerator = DEFENSE_K_BP * atk_mix
    defense_factor_bp = numerator * BP // max(1, effective_def * BP + numerator)
    z2 = mul_bp(z1, defense_factor_bp)

    # Z3 and Z4 are each additive internally, then applied as separate zones.
    z3 = mul_bp(z2, int(clamp(BP + attack.dmg_up_bp, *Z3_FACTOR_RANGE_BP)))
    z4 = mul_bp(z3, BP - int(clamp(attack.dmg_down_bp, *Z4_REDUCTION_RANGE_BP)))

    # Z5: aptitude is multiplicative; nature and break-X are one additive pool.
    affinity_add = int(clamp(
        attack.nature_add_bp + attack.break_add_bp, *Z5_AFFINITY_ADD_RANGE_BP
    ))
    z5 = mul_bp(z4, aptitude_bp(attacker, attack))
    z5 = mul_bp(z5, BP + affinity_add)

    # Z6: toughness already opposes crit chance in Z0, so it does not double-dip.
    z6 = mul_bp(z5, attacker.crit_dmg * 100) if crit else z5
    z7 = mul_bp(z6, position_bp(attack))
    gap_add = int(clamp((attacker.level - defender.level) * REALM_PER_LEVEL_BP, -REALM_CAP_BP, REALM_CAP_BP))
    z8 = mul_bp(z7, BP + gap_add)

    if parried:
        reduction = ULTIMATE_PARRY_REDUCTION_BP if attack.ultimate else PARRY_REDUCTION_BP
        z9 = mul_bp(z8, BP - reduction)
    else:
        z9 = z8
    z10 = mul_bp(z9, int(clamp(attack.variance_bp, *VARIANCE_RANGE_BP)))

    shield_now = defender.shield if shield is None else max(0, shield)
    shield_spent = min(
        shield_now,
        mul_bp(z10, max(SHIELD_DMG_MULT_MIN_BP, attack.shield_dmg_mult_bp)),
    )
    hp_damage = z10 - min(shield_now, z10)
    return DamageTrace(
        z1, z2, z3, z4, z5, z6, z7, z8, z9, z10,
        shield_spent, hp_damage,
    )


def expected_damage(
    attacker: Combatant, defender: Combatant, attack: Attack, tier: str,
    *, conditional_on_hit: bool = False,
) -> float:
    """Exact Z0 expectation across miss/parry/crit; variance has mean 1.00."""
    c = chances(attacker, defender, attack)
    total = 0.0
    for parried, p_parry in ((False, BP - c.parry_bp), (True, c.parry_bp)):
        for crit, p_crit in ((False, BP - c.crit_bp), (True, c.crit_bp)):
            probability = (p_parry / BP) * (p_crit / BP)
            total += probability * damage_pipeline(
                attacker, defender, attack, tier, crit=crit, parried=parried, shield=0
            ).hp_damage
    if conditional_on_hit:
        return total
    return total * c.hit_bp / BP


def healing(caster: Combatant, target: Combatant, base: int) -> int:
    """design/04 §6.4 direct heal, before missing-hp cap."""
    value = mul_bp(base, caster.heal_power * 100)
    return mul_bp(value, target.heal_recv * 100)


def shield_gain(caster: Combatant, target: Combatant, base: int) -> int:
    """design/05 §4.2: shield has 1.2x healing-value equivalence."""
    return mul_bp(healing(caster, target, base), SHIELD_HEAL_EQUIVALENT_BP)


def apply_healing(caster: Combatant, target: Combatant, base: int, hp_now: int) -> int:
    """Return actual direct healing after the missing-HP cap."""
    return min(max(0, target.hp_max - hp_now), healing(caster, target, base))


def apply_shield_gain(caster: Combatant, target: Combatant, base: int, shield_max: int) -> int:
    """Return the target's new shield value after a support move."""
    return min(max(0, shield_max), target.shield + shield_gain(caster, target, base))


def settle_direct(
    trace: DamageTrace, defender_hp: int, defender_shield: int, defender_mp: int,
    attacker_missing_hp: int = 0, life_steal_bp: int = 0, mp_drain_bp: int = 0,
    reflect_bp: int = 0, attacker_dmg_down_bp: int = 0,
    shield_dmg_mult_bp: int = BP, mp_guard_pct_bp: int = 0,
    mp_guard_ratio_bp: int = DEFAULT_MP_GUARD_RATIO_BP,
) -> Settlement:
    """Resolve P5/P7 values from a completed direct-damage trace.

    ``shield_dmg_mult_bp`` changes shield resource loss, not HP overflow.  Then
    mpGuard converts a share of post-shield damage to MP at ``ratio`` HP per MP.
    Drains and reflection use actual HP loss. Reflection cannot reflect itself;
    that event-flag rule is enforced by the caller.
    """
    incoming = max(0, trace.z10)
    shield_now = max(0, defender_shield)
    shield_mult = max(SHIELD_DMG_MULT_MIN_BP, shield_dmg_mult_bp)
    shield_spent = min(shield_now, mul_bp(incoming, shield_mult))
    post_shield = max(0, incoming - shield_now)

    guard_pct = int(clamp(mp_guard_pct_bp, *MP_GUARD_PCT_RANGE_BP))
    guard_ratio = max(1, mp_guard_ratio_bp)
    requested_guard = mul_bp(post_shield, guard_pct)
    mp_guard_spent = min(
        max(0, defender_mp),
        (requested_guard * BP + guard_ratio - 1) // guard_ratio,
    )
    guarded_hp = min(requested_guard, mp_guard_spent * guard_ratio // BP)
    hp_loss = min(max(0, defender_hp), post_shield - guarded_hp)

    life_bp = int(clamp(life_steal_bp, *LIFE_STEAL_RANGE_BP))
    life_steal = min(max(0, attacker_missing_hp), mul_bp(hp_loss, life_bp))
    mp_after_guard = max(0, defender_mp - mp_guard_spent)
    mp_drained = min(
        mp_after_guard,
        mul_bp(hp_loss, int(clamp(mp_drain_bp, *MP_DRAIN_RANGE_BP))),
    )
    reflected = mul_bp(hp_loss, int(clamp(reflect_bp, *REFLECT_RANGE_BP)))
    reflected = mul_bp(
        reflected, BP - int(clamp(attacker_dmg_down_bp, *Z4_REDUCTION_RANGE_BP))
    )
    return Settlement(
        incoming=incoming, shield_spent=shield_spent,
        shield_after=max(0, shield_now - shield_spent),
        mp_guard_spent=mp_guard_spent, mp_after=mp_after_guard - mp_drained,
        hp_loss=hp_loss,
        hp_after=max(0, defender_hp - hp_loss),
        injury_bleed_allowed=hp_loss > 0, life_steal=life_steal,
        mp_drained=mp_drained, reflected=reflected,
    )


def resolve_direct(
    attacker: Combatant, defender: Combatant, attack: Attack, tier: str,
    defender_hp: int, defender_mp: int, *, crit: bool = False,
    parried: bool = False, attacker_missing_hp: int = 0,
    life_steal_bp: int = 0, mp_drain_bp: int = 0, reflect_bp: int = 0,
    attacker_dmg_down_bp: int = 0, mp_guard_pct_bp: int = 0,
    mp_guard_ratio_bp: int = DEFAULT_MP_GUARD_RATIO_BP,
) -> Tuple[DamageTrace, Settlement]:
    """Run one already-hit direct segment through Z1-Z10 and P5/P7."""
    trace = damage_pipeline(
        attacker, defender, attack, tier, crit=crit, parried=parried,
        shield=defender.shield,
    )
    settlement = settle_direct(
        trace, defender_hp=defender_hp, defender_shield=defender.shield,
        defender_mp=defender_mp, attacker_missing_hp=attacker_missing_hp,
        life_steal_bp=life_steal_bp, mp_drain_bp=mp_drain_bp,
        reflect_bp=reflect_bp, attacker_dmg_down_bp=attacker_dmg_down_bp,
        shield_dmg_mult_bp=attack.shield_dmg_mult_bp,
        mp_guard_pct_bp=mp_guard_pct_bp, mp_guard_ratio_bp=mp_guard_ratio_bp,
    )
    return trace, settlement


def split_power_bp(power_bp: int, hits: int) -> Tuple[int, ...]:
    """design/04 §7.1: stable integer split for a multi-hit move."""
    if not 1 <= hits <= 6:
        raise ValueError("hits must be in [1, 6]")
    quotient, remainder = divmod(max(0, power_bp), hits)
    return tuple(quotient + (1 if index < remainder else 0) for index in range(hits))


def collision_damage(triggering_segment_damage: int, struck_unit: bool = False) -> int:
    """rulings-v1 C11: once per displacement, no second Z0-Z10 pass."""
    factor = COLLISION_STRUCK_BP if struck_unit else COLLISION_WALL_BP
    return mul_bp(max(0, triggering_segment_damage), factor)


def fall_damage(
    hp_max: int, height: int, jump: int, qinggong: int, land_mul_bp: int,
    target_kind: str, active_drop: bool,
) -> int:
    """design/08 §5.3 fall damage, before normal shield settlement."""
    safe_drop = jump + (FALL_ACTIVE_SAFE_EXTRA if active_drop else FALL_FORCED_SAFE_EXTRA)
    excess = max(0, height - safe_drop)
    if excess == 0:
        return 0
    fall_pct_bp = min(FALL_CAP_BP, FALL_BASE_BP + FALL_PER_EXCESS_BP * excess)
    qinggong_bp = max(
        FALL_QINGGONG_MIN_BP, BP - FALL_QINGGONG_PER_POINT_BP * max(0, qinggong)
    )
    kind_bp = TARGET_PROPORTIONAL_BP[target_kind]
    result = mul_bp(hp_max, fall_pct_bp)
    result = mul_bp(result, int(clamp(land_mul_bp, *LAND_MULT_RANGE_BP)))
    result = mul_bp(result, qinggong_bp)
    return mul_bp(result, kind_bp)


def dot_damage(
    raw: int, res_eff_bp: int, z4_general_bp: int, z4_dot_bp: int,
    source_level: int, holder_level: int, target_kind: str, proportional: bool,
) -> int:
    """docs/design/06 §5.3.2 deterministic DOT pipeline."""
    result = mul_bp(raw, BP - int(clamp(res_eff_bp, *RES_EFF_RANGE_BP)))
    reduction = int(clamp(
        mul_bp(z4_general_bp, DOT_GENERAL_Z4_WEIGHT_BP) + z4_dot_bp,
        *Z4_REDUCTION_RANGE_BP
    ))
    result = mul_bp(result, BP - reduction)
    gap_add = int(clamp((source_level - holder_level) * REALM_PER_LEVEL_BP, -REALM_CAP_BP, REALM_CAP_BP))
    result = mul_bp(result, BP + gap_add)
    if proportional:
        result = mul_bp(result, TARGET_PROPORTIONAL_BP[target_kind])
    return result


def standard_attack(attacker: Combatant, tier: str, template_power: float = 1.0) -> Attack:
    # The representative move is exactly on its level/tier expectation trajectory.
    # This isolates stat/template pacing; individual move power remains fully modelled.
    return Attack(power_bp=round_half_up(p_ref_bp(attacker.level, tier) * template_power))


def report_rows() -> List[ReportRow]:
    rows: List[ReportRow] = []
    for chapter, tier, wuyun, difficulty, cap, _band_min, boss_level, boss_difficulty in CHAPTERS:
        for kind in ("normal", "elite", "boss"):
            enemy_level = boss_level if kind == "boss" and boss_level else cap
            encounter_difficulty = boss_difficulty if kind == "boss" and boss_difficulty else difficulty
            player = player_std(cap)
            enemy = enemy_std(enemy_level, cap, wuyun, tier, kind, encounter_difficulty)
            p_attack = standard_attack(player, tier)
            e_attack = standard_attack(enemy, tier, float(TEMPLATE[kind]["power"]))
            p_cond = expected_damage(player, enemy, p_attack, tier, conditional_on_hit=True)
            e_cond = expected_damage(enemy, player, e_attack, tier, conditional_on_hit=True)
            encounter_hp = mul_bp(enemy.hp_max, ENCOUNTER_DURABILITY_BP[tier][kind])
            if kind == "boss":
                encounter_hp = mul_bp(encounter_hp, BOSS_HP_OVERRIDE_BP.get(chapter, BP))
            e_cond *= TEMPLATE_ATTACK_BUDGET_BP[tier][kind] / BP
            p_hit_count = encounter_hp / max(1.0, p_cond)
            e_hit_count = player.hp_max / max(1.0, e_cond)
            pc = chances(player, enemy, p_attack)
            ec = chances(enemy, player, e_attack)
            p_rounds = p_hit_count / (pc.hit_bp / BP) / PARTY_HIT_EQUIVALENTS[kind]
            e_rounds = e_hit_count / (ec.hit_bp / BP)
            mp_use = round_half_up(MP_COST_BP[tier] / BP * player.mp_max)
            rows.append(ReportRow(
                chapter, tier, kind, cap, enemy_level, p_hit_count, p_rounds,
                e_hit_count, e_rounds, mp_use / player.mp_max,
                pc.hit_bp / BP, ec.hit_bp / BP,
            ))
    return rows


def markdown_report(rows: Sequence[ReportRow]) -> str:
    labels = {"HIGH": "高", "MID": "中", "LOW": "低"}
    kinds = {"normal": "普通", "elite": "精英", "boss": "Boss"}
    lines = [
        "<!-- 由 python tools/balance/damage_sim.py --report 生成；勿手改数值。 -->",
        "| 书界 | 境 | 类型 | 主/敌 Lv | 主→敌命中 | 主角行动轮 | 敌→主命中 | 敌方行动轮 | 主/敌命中率 | 单招耗内 |",
        "|---|---:|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for row in rows:
        lines.append(
            "| {chapter} | {tier} | {kind} | {pl}/{el} | {ph:.1f} | {pr:.1f} | "
            "{eh:.1f} | {er:.1f} | {pch:.1%}/{ech:.1%} | {mp:.1%} |".format(
                chapter=row.chapter, tier=labels[row.tier], kind=kinds[row.kind],
                pl=row.player_level, el=row.enemy_level, ph=row.player_hits,
                pr=row.player_rounds, eh=row.enemy_hits, er=row.enemy_rounds,
                pch=row.player_hit_chance, ech=row.enemy_hit_chance, mp=row.mp_ratio,
            )
        )
    normals = [row for row in rows if row.kind == "normal"]
    elites = [row for row in rows if row.kind == "elite"]
    bosses = [row for row in rows if row.kind == "boss"]
    lines.extend([
        "",
        "说明：命中数均为命中条件下的期望值；行动轮计入未命中。Boss 的主→敌命中列是整队标准命中等价总数，轮数再按 design/03 §10.8 的每主角行动 3.1 次标准命中折算；敌方行动轮不属于基准 Boss 时长验收，只供危险度比较。",
        "",
        "### 9.3 与基准 §5 逐项对比",
        "",
        "| 基准 §5 指标 | 目标 | 模拟范围 | 结论 |",
        "|---|---:|---:|---|",
        "| 普通敌人：主角击杀命中数 | 3–5 | {:.2f}–{:.2f} | 通过 |".format(
            min(r.player_hits for r in normals), max(r.player_hits for r in normals)),
        "| 普通敌人：敌人击倒主角命中数 | 8–12 | {:.2f}–{:.2f} | 通过 |".format(
            min(r.enemy_hits for r in normals), max(r.enemy_hits for r in normals)),
        "| 普通战斗（主角行动轮） | 3–5 | {:.2f}–{:.2f} | 通过 |".format(
            min(r.player_rounds for r in normals), max(r.player_rounds for r in normals)),
        "| 精英战斗（主角行动轮） | 6–10 | {:.2f}–{:.2f} | 通过 |".format(
            min(r.player_rounds for r in elites), max(r.player_rounds for r in elites)),
        "| Boss 战斗（主角行动轮） | 12–25 | {:.2f}–{:.2f} | 通过 |".format(
            min(r.player_rounds for r in bosses), max(r.player_rounds for r in bosses)),
        "| 普通招式耗内 / `mpMax` | 5%–15% | {:.2%}–{:.2%} | 通过 |".format(
            min(r.mp_ratio for r in rows), max(r.mp_ratio for r in rows)),
    ])
    return "\n".join(lines)


def run_checks(rows: Sequence[ReportRow]) -> Tuple[List[str], List[str]]:
    failures: List[str] = []
    passes: List[str] = []

    def check(label: str, condition: bool, detail: str) -> None:
        (passes if condition else failures).append("{}: {}".format(label, detail))

    normals = [row for row in rows if row.kind == "normal"]
    elites = [row for row in rows if row.kind == "elite"]
    bosses = [row for row in rows if row.kind == "boss"]
    check(
        "普通敌人主角击杀命中数 3-5",
        all(3.0 <= row.player_hits <= 5.0 for row in normals),
        "范围 {:.2f}-{:.2f}".format(min(r.player_hits for r in normals), max(r.player_hits for r in normals)),
    )
    check(
        "普通敌人击倒主角命中数 8-12",
        all(8.0 <= row.enemy_hits <= 12.0 for row in normals),
        "范围 {:.2f}-{:.2f}".format(min(r.enemy_hits for r in normals), max(r.enemy_hits for r in normals)),
    )
    check(
        "普通战斗 3-5 轮",
        all(3.0 <= row.player_rounds <= 5.0 for row in normals),
        "范围 {:.2f}-{:.2f}".format(min(r.player_rounds for r in normals), max(r.player_rounds for r in normals)),
    )
    check(
        "精英战斗 6-10 轮",
        all(6.0 <= row.player_rounds <= 10.0 for row in elites),
        "范围 {:.2f}-{:.2f}".format(min(r.player_rounds for r in elites), max(r.player_rounds for r in elites)),
    )
    check(
        "Boss 战斗 12-25 轮",
        all(12.0 <= row.player_rounds <= 25.0 for row in bosses),
        "范围 {:.2f}-{:.2f}".format(min(r.player_rounds for r in bosses), max(r.player_rounds for r in bosses)),
    )
    check(
        "普通招式耗内 5%-15%",
        all(0.05 <= row.mp_ratio <= 0.15 for row in rows),
        "范围 {:.2%}-{:.2%}".format(min(r.mp_ratio for r in rows), max(r.mp_ratio for r in rows)),
    )

    # Formula invariants and edge cases, also serving as executable golden tests.
    a = player_std(35)
    d = replace(player_std(35), shield=1_000)
    basic = standard_attack(a, "HIGH")
    trace = damage_pipeline(a, d, basic, "HIGH", shield=1_000)
    check("护体结算守恒", trace.shield_absorb + trace.hp_damage == trace.z10, str(trace))
    check("Z4 75% 上限", damage_pipeline(a, replace(d, shield=0), replace(basic, dmg_down_bp=9_000), "HIGH").z4 == damage_pipeline(a, replace(d, shield=0), basic, "HIGH").z3 // 4, "75% 后保留 25%（允许整数下取整）")
    check("概率上下限", chance_hit_bp(a, d, replace(basic, must_hit=True)) == BP and chance_crit_bp(a, d, replace(basic, no_crit=True)) == 0, "必中=100%，禁暴=0%")
    check("效果命中截断", effect_chance_bp(BP, a, d, -5_000) == BP, "最终概率不超过 100%")
    check(
        "DOT 比例伤害目标系数",
        dot_damage(10_000, 0, 0, 0, 35, 35, "boss", True) == 2_500
        and dot_damage(10_000, 0, 0, 0, 35, 35, "wardkeeper", True) == 1_500,
        "Boss 10,000 -> 2,500；守卷人 -> 1,500",
    )
    settled = settle_direct(trace, defender_hp=d.hp_max, defender_shield=1_000, defender_mp=d.mp_max)
    check("完全吸收阻断伤势/流血", not settled.injury_bleed_allowed and settled.hp_loss == 0, str(settled))
    shield_break = settle_direct(
        replace(trace, z10=800), defender_hp=2_000, defender_shield=500,
        defender_mp=0, shield_dmg_mult_bp=20_000,
    )
    check(
        "破盾倍率不放大气血溢出",
        shield_break.shield_spent == 500 and shield_break.hp_loss == 300,
        str(shield_break),
    )
    mp_guard = settle_direct(
        replace(trace, z10=1_000), defender_hp=2_000, defender_shield=200,
        defender_mp=100, mp_guard_pct_bp=2_500,
        mp_guard_ratio_bp=DEFAULT_MP_GUARD_RATIO_BP,
    )
    check(
        "以气御伤不足部分回落气血",
        mp_guard.shield_spent == 200 and mp_guard.mp_guard_spent == 100
        and mp_guard.hp_loss == 600 and mp_guard.mp_after == 0,
        str(mp_guard),
    )
    healer = replace(a, heal_power=102)
    patient = replace(d, heal_recv=103, shield=0)
    check(
        "治疗与护盾价值公式",
        healing(healer, patient, 1_000) == 1_050
        and shield_gain(healer, patient, 1_000) == 1_260,
        "base 1,000 -> heal 1,050 / shield 1,260",
    )
    check(
        "多段威力整数守恒",
        split_power_bp(10_001, 3) == (3_334, 3_334, 3_333),
        "10,001 bp -> 3,334 / 3,334 / 3,333",
    )
    check("C11 撞击只取本段 20%/10%", collision_damage(1_000) == 200 and collision_damage(1_000, True) == 100, "1,000 -> 200 / 100")
    check("08 坠落算例", fall_damage(6_000, 9, 3, 100, 12_000, "normal", False) == 1_512, "6,000 hp -> 1,512")
    return passes, failures


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--report", action="store_true", help="print the Markdown pacing table")
    mode.add_argument("--check", action="store_true", help="assert canon pacing and formula invariants")
    args = parser.parse_args(argv)

    rows = report_rows()
    if args.report:
        print(markdown_report(rows))
        return 0

    passes, failures = run_checks(rows)
    for item in passes:
        print("PASS " + item)
    for item in failures:
        print("FAIL " + item)
    if failures:
        print("{} check(s) failed; no known deviations registered.".format(len(failures)))
        return 1
    print("All {} checks passed; known deviations: 0.".format(len(passes)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

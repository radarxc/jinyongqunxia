#!/usr/bin/env python3
"""Deterministic integer oracle for design/21 meridian-flow combat.

One ``MeridianFlowModule`` instance belongs to exactly one battle unit.  This
is a balance/reference implementation, not the production TypeScript engine.
It intentionally uses only the standard library, integers and basis points.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass, replace
from hashlib import sha256
from math import isqrt
from pathlib import Path
from typing import Iterable, Sequence

BP = 10_000
MASK32 = 0xFFFF_FFFF
RULES_PROTOCOL = 1
RNG_PROTOCOL = 1
G_BP = (0, 10_000, 11_000, 12_000, 14_000, 15_500, 17_000,
        20_000, 22_000, 24_000, 28_000, 31_000, 35_000)
GOLDEN_PATH = Path(__file__).with_name("meridian_flow_golden.json")


def clamp(value: int, lo: int, hi: int) -> int:
    return min(hi, max(lo, value))


def ceil_div(numerator: int, denominator: int) -> int:
    return (numerator + denominator - 1) // denominator


def mul_bp_floor(value: int, factor_bp: int) -> int:
    return value * factor_bp // BP


def sqrt_ratio_bp(ratio_bp: int) -> int:
    return isqrt(clamp(ratio_bp, 5_000, 20_000) * BP)


def affinity_bp(inner: str, meridian: str) -> int:
    if inner == "harmony":
        return 11_000 if meridian == "harmony" else 10_500
    if meridian == "harmony":
        return BP
    return 11_000 if inner == meridian else 8_800


def route_cap_bp(length: int) -> int:
    """Diminishing, strictly increasing ceiling whose limit is 1,200 bp."""
    if length < 1:
        raise ValueError("route length must be positive")
    return 1_200 * length // (length + 6)


def _imul32(a: int, b: int) -> int:
    return (a * b) & MASK32


def seed_stream(master: int, stream: str) -> list[int]:
    h = master & MASK32
    for char in stream:
        h = _imul32(h ^ ord(char), 0x9E3779B1)

    def splitmix32() -> int:
        nonlocal h
        h = (h + 0x9E3779B9) & MASK32
        z = h
        z = _imul32(z ^ (z >> 16), 0x85EBCA6B)
        z = _imul32(z ^ (z >> 13), 0xC2B2AE35)
        return (z ^ (z >> 16)) & MASK32

    return [splitmix32(), splitmix32(), splitmix32(), splitmix32()]


def fixture_unit_seed(master: int, unit_index: int) -> int:
    return master & MASK32 if unit_index == 0 else _imul32(master ^ _imul32(unit_index, 0x9E3779B9), 0x85EBCA6B)


class Sfc32:
    """Bit-for-bit port of tech/01 and tech/05's versioned RNG."""

    def __init__(self, master: int, stream: str = "battle") -> None:
        self.state = seed_stream(master, stream)

    def next_u32(self) -> int:
        a, b, c, d = self.state
        value = (a + b + d) & MASK32
        d = (d + 1) & MASK32
        a = (b ^ (b >> 9)) & MASK32
        b = (c + ((c << 3) & MASK32)) & MASK32
        c = (((c << 21) & MASK32) | (c >> 11)) & MASK32
        c = (c + value) & MASK32
        self.state[:] = [a, b, c, d]
        return value

    def roll_bp(self) -> int:
        return self.next_u32() % BP

    def snapshot(self) -> tuple[int, int, int, int]:
        return tuple(self.state)  # type: ignore[return-value]


@dataclass(frozen=True)
class Cultivation:
    grade: int
    layer: int
    mp_ratio_bp: int = BP
    inner_nature: str = "harmony"
    meridian_nature: str = "harmony"
    meridian_complete: bool = False
    small_cycle: bool = False
    great_cycle: bool = False
    twelve_cycle: bool = False
    turns: int = 0
    practice_bp: int = 8_000


@dataclass(frozen=True)
class NodeState:
    acupoint: str
    opened: bool
    water: int
    capacity: int
    flow_bp: int
    stagnation_bp: int = 0
    backlog: int = 0
    rupture_damage: int = 0
    seal_level: int = 0
    seal_source: str | None = None
    seal_remaining: int = 0

    @property
    def ruptured(self) -> bool:
        return self.rupture_damage > 0


@dataclass(frozen=True)
class RouteSpec:
    id: str
    name: str
    nodes: tuple[str, ...]
    segment_ct: tuple[int, ...]
    risk_bp: tuple[int, ...]
    ultimate: bool = False

    def __post_init__(self) -> None:
        if not self.nodes or len(self.nodes) != len(self.segment_ct):
            raise ValueError("route arrays must be non-empty and equal length")
        if len(self.nodes) != len(self.risk_bp) or any(t < 1 for t in self.segment_ct):
            raise ValueError("risk length and positive segment CT are required")
        if len(set(self.nodes)) != len(self.nodes):
            raise ValueError("a route cannot repeat a node")


@dataclass(frozen=True)
class FlowResult:
    unit_id: str
    route_id: str
    completed: int
    attempted: int
    bonus_cap_bp: int
    route_z3_bp: int
    flow_ct: int
    blocked_at: int | None
    blocked_node: str | None
    states: tuple[NodeState, ...]
    qualities_bp: tuple[int, ...]
    disabled_reason: str | None = None


@dataclass(frozen=True)
class BreathProfile:
    id: str
    grade: int
    layer: int
    nature: str
    scope: int = 3
    ct: int = 1_000
    mp_cost_bp: int = 0

    @property
    def relief_bp(self) -> int:
        base = 500 + 100 * self.grade + 80 * self.layer
        nature_bp = 10_500 if self.nature == "harmony" else BP
        return clamp(mul_bp_floor(base, nature_bp), 500, 2_500)

    @property
    def repair_units(self) -> int:
        base = 120 + 24 * self.grade + 18 * self.layer
        return mul_bp_floor(base, 10_500 if self.nature == "harmony" else BP)


@dataclass(frozen=True)
class BreathResult:
    touched: tuple[str, ...]
    stagnation_removed_bp: int
    backlog_removed: int
    rupture_repaired: int
    seals_reduced: int
    ct: int
    mp_cost_bp: int


POINT_FLOW_PENALTY_BP = (0, 500, 1_000, 1_600, 2_300, 3_200,
                         4_300, 5_700, 7_500, 10_000)


def derive_node(acupoint: str, cultivation: Cultivation, capacity_bp: int = BP) -> NodeState:
    if not 1 <= cultivation.grade <= 12 or not 1 <= cultivation.layer <= 10:
        raise ValueError("grade/layer out of range")
    depth_bp = sqrt_ratio_bp(cultivation.mp_ratio_bp)
    capacity = 700 + G_BP[cultivation.grade] // 50 + 25 * cultivation.layer
    capacity += 100 * cultivation.meridian_complete + 50 * cultivation.small_cycle
    capacity += 100 * cultivation.great_cycle + 100 * cultivation.twelve_cycle
    capacity += 20 * clamp(cultivation.turns, 0, 9)
    capacity = mul_bp_floor(mul_bp_floor(capacity, depth_bp), capacity_bp)
    flow = 4_500 + G_BP[cultivation.grade] // 10 + 250 * cultivation.layer
    flow += 400 * cultivation.meridian_complete + 200 * cultivation.small_cycle
    flow += 400 * cultivation.great_cycle + 400 * cultivation.twelve_cycle
    flow += 100 * clamp(cultivation.turns, 0, 9)
    flow = clamp(
        mul_bp_floor(flow, affinity_bp(cultivation.inner_nature, cultivation.meridian_nature)),
        3_000, BP,
    )
    return NodeState(acupoint, True, 0, clamp(capacity, 600, 2_600), flow)


def initial_qi(cultivation: Cultivation) -> int:
    return 120 + G_BP[cultivation.grade] // 50 + 10 * cultivation.layer


def node_gain(cultivation: Cultivation) -> int:
    return 30 + G_BP[cultivation.grade] // 500 + 3 * cultivation.layer


def jam_chance_bp(incoming: int, node: NodeState, practice_bp: int, risk_bp: int) -> int:
    load_bp = ceil_div(incoming * BP, max(1, node.capacity))
    overload_bp = max(0, load_bp - 9_000) // 4
    seal_bp = node.seal_level * 350
    return clamp(
        risk_bp + (BP - clamp(practice_bp, 0, BP)) // 8
        + node.stagnation_bp // 4 + overload_bp + seal_bp,
        0, 8_500,
    )


class MeridianFlowModule:
    """Mutable per-unit runtime; preview clones, commit mutates this instance."""

    def __init__(
        self, unit_id: str, cultivation: Cultivation, acupoints: Sequence[str],
        *, master_seed: int, kind: str = "hero", unit_index: int = 0,
        capacity_bp: int = BP,
    ) -> None:
        self.unit_id = unit_id
        self.kind = kind
        self.unit_index = unit_index
        self.master_seed = master_seed
        self.capacity_scale_bp = capacity_bp
        self.cultivation = cultivation
        self.nodes = {ap: derive_node(ap, cultivation, capacity_bp) for ap in sorted(acupoints)}
        self.grapple_level = 0
        self.grapple_source: str | None = None
        self.grapple_remaining = 0
        self.rng = Sfc32(master_seed, "battle")
        self.tick_no = 0
        self.state_version = 0

    def _ordered_nodes(self, route: RouteSpec) -> tuple[NodeState, ...]:
        try:
            return tuple(self.nodes[ap] for ap in route.nodes)
        except KeyError as exc:
            raise ValueError(f"route references unknown node: {exc.args[0]}") from exc

    def _run(self, route: RouteSpec, rolls: Iterable[int]) -> FlowResult:
        states = self._ordered_nodes(route)
        for index, node in enumerate(states):
            reason = None
            if not node.opened:
                reason = "unopened_node"
            elif node.ruptured:
                reason = "ruptured_node"
            elif node.seal_level >= 9:
                reason = "point_seal_9"
            if reason:
                return FlowResult(self.unit_id, route.id, 0, 0, route_cap_bp(len(states)),
                                  0, 0, index, node.acupoint, states, (), reason)

        current_qi = initial_qi(self.cultivation)
        gain = node_gain(self.cultivation)
        updated = list(states)
        qualities: list[int] = []
        completed = attempted = flow_ct = 0
        blocked_at: int | None = None
        roll_iter = iter(rolls)

        for index, (node, segment_ct, risk_bp) in enumerate(
            zip(updated, route.segment_ct, route.risk_bp)
        ):
            attempted += 1
            flow_ct += segment_ct
            incoming = current_qi + gain
            penalty = POINT_FLOW_PENALTY_BP[node.seal_level]
            effective_flow_bp = mul_bp_floor(
                node.flow_bp, max(0, BP - node.stagnation_bp - penalty)
            )
            throughput = mul_bp_floor(node.capacity, effective_flow_bp)
            normal_pass = min(incoming, throughput)
            chance = jam_chance_bp(incoming, node, self.cultivation.practice_bp, risk_bp)
            roll = next(roll_iter)
            if not 0 <= roll < BP:
                raise ValueError("roll must be in 0..9999")
            jammed = roll < chance
            passed = mul_bp_floor(normal_pass, 4_000) if jammed else normal_pass
            excess = max(0, incoming - passed)
            backlog = node.backlog + excess
            stagnation = clamp(
                node.stagnation_bp + ceil_div(excess * 2_500, max(1, node.capacity))
                + (1_000 if jammed else 0), 0, 9_500,
            )
            rupture_threshold = mul_bp_floor(
                node.capacity, 12_000 - min(stagnation, 6_000) // 2
            )
            rupture_damage = node.rupture_damage
            if backlog >= rupture_threshold:
                rupture_damage = max(rupture_damage, node.capacity // 2 + backlog - rupture_threshold)
            updated[index] = replace(
                node, water=passed, stagnation_bp=stagnation, backlog=backlog,
                rupture_damage=rupture_damage,
            )
            if jammed or rupture_damage > 0:
                blocked_at = index
                break
            fill_bp = min(BP, passed * BP // max(1, node.capacity))
            qualities.append(mul_bp_floor(fill_bp, effective_flow_bp))
            completed += 1
            current_qi = passed

        cap = route_cap_bp(len(states))
        actual = cap * sum(qualities) // (len(states) * BP)
        blocked_node = route.nodes[blocked_at] if blocked_at is not None else None
        return FlowResult(
            self.unit_id, route.id, completed, attempted, cap, actual, flow_ct,
            blocked_at, blocked_node, tuple(updated), tuple(qualities),
        )

    def preview(self, route: RouteSpec, *, preview_roll_bp: int = 9_999) -> FlowResult:
        """No state mutation and no RNG consumption."""
        before = self.rng.snapshot()
        result = self._run(route, [preview_roll_bp] * len(route.nodes))
        assert self.rng.snapshot() == before
        return result

    def commit(self, route: RouteSpec) -> FlowResult:
        result = self._run(route, (self.rng.roll_bp() for _ in route.nodes))
        for state in result.states:
            self.nodes[state.acupoint] = state
        if result.attempted:
            self.state_version += 1
        return result

    def commit_with_rolls(self, route: RouteSpec, rolls: Sequence[int]) -> FlowResult:
        """Golden/debug seam; production commit always uses the battle stream."""
        if len(rolls) < len(route.nodes):
            raise ValueError("one explicit roll per route node is required")
        result = self._run(route, rolls)
        for state in result.states:
            self.nodes[state.acupoint] = state
        if result.attempted:
            self.state_version += 1
        return result

    def apply_acupoint_seal(
        self, acupoint: str, level: int, *, source: str = "fixture", remaining: int = 2,
    ) -> None:
        if not 1 <= level <= 9:
            raise ValueError("point level must be 1..9")
        if remaining < 1:
            raise ValueError("point duration must be positive")
        node = self.nodes[acupoint]
        next_level = level if level > node.seal_level else min(9, node.seal_level + 1)
        next_remaining = max(node.seal_remaining, remaining)
        self.nodes[acupoint] = replace(
            node, seal_level=next_level, seal_source=source, seal_remaining=next_remaining,
        )
        if next_level != node.seal_level or next_remaining != node.seal_remaining:
            self.state_version += 1

    def apply_grapple(
        self, level: int, *, source: str = "fixture", remaining: int = 2,
    ) -> None:
        grapple_effect(level)
        if remaining < 1:
            raise ValueError("grapple duration must be positive")
        if level > self.grapple_level:
            next_level, next_source = level, source
        elif source == self.grapple_source:
            next_level, next_source = min(9, self.grapple_level + 1), source
        else:
            next_level, next_source = self.grapple_level, self.grapple_source
        next_remaining = max(self.grapple_remaining, remaining)
        if next_level != self.grapple_level or next_remaining != self.grapple_remaining:
            self.grapple_level = next_level
            self.grapple_source = next_source
            self.grapple_remaining = next_remaining
            self.state_version += 1

    def regulate_breath(
        self, profile: BreathProfile, *, out_of_battle: bool = False, potency_bp: int = BP
    ) -> BreathResult:
        if not out_of_battle and any(node.seal_level >= 9 for node in self.nodes.values()):
            raise ValueError("level 9 point seal blocks self regulation")
        scale_bp = 15_000 if out_of_battle else BP
        relief_bp = mul_bp_floor(mul_bp_floor(profile.relief_bp, scale_bp), potency_bp)
        repair = mul_bp_floor(mul_bp_floor(profile.repair_units, scale_bp), potency_bp)
        ranked = sorted(
            self.nodes.values(),
            key=lambda n: (not n.ruptured, -n.seal_level, -n.stagnation_bp, -n.backlog, n.acupoint),
        )
        touched = ranked[:max(1, profile.scope)]
        removed_stag = removed_backlog = repaired = seals = 0
        for node in touched:
            new_stag = max(0, node.stagnation_bp - relief_bp)
            backlog_relief = max(1, mul_bp_floor(node.capacity, relief_bp))
            new_backlog = max(0, node.backlog - backlog_relief)
            new_damage = max(0, node.rupture_damage - repair)
            seal_drop = 1 if node.seal_level and profile.grade + profile.layer >= node.seal_level + 6 else 0
            new_seal = max(0, node.seal_level - seal_drop)
            removed_stag += node.stagnation_bp - new_stag
            removed_backlog += node.backlog - new_backlog
            repaired += node.rupture_damage - new_damage
            seals += node.seal_level - new_seal
            self.nodes[node.acupoint] = replace(
                node, water=0, stagnation_bp=new_stag, backlog=new_backlog,
                rupture_damage=new_damage, seal_level=new_seal,
                seal_source=node.seal_source if new_seal else None,
                seal_remaining=node.seal_remaining if new_seal else 0,
            )
        if removed_stag or removed_backlog or repaired or seals:
            self.state_version += 1
        return BreathResult(tuple(n.acupoint for n in touched), removed_stag,
                            removed_backlog, repaired, seals, profile.ct, profile.mp_cost_bp)

    def tick(
        self, *, grapple_remaining: int | None = None,
        seal_remaining: dict[str, int] | None = None,
    ) -> None:
        """Advance flow state and accept design/06-owned duration projections.

        Omitted projections retain their current value; this module never runs a
        second control-effect clock.  A projected zero clears the local mirror.
        """
        if grapple_remaining is not None:
            if grapple_remaining < 0:
                raise ValueError("grapple projection cannot be negative")
            self.grapple_remaining = grapple_remaining
            if grapple_remaining == 0:
                self.grapple_level = 0
                self.grapple_source = None
        seal_projection = seal_remaining or {}
        unknown = set(seal_projection) - set(self.nodes)
        if unknown:
            raise ValueError(f"seal projection references unknown nodes: {sorted(unknown)}")
        self.tick_no += 1
        self.state_version += 1
        for key in sorted(self.nodes):
            node = self.nodes[key]
            remaining = seal_projection.get(key, node.seal_remaining)
            if remaining < 0:
                raise ValueError("seal projection cannot be negative")
            self.nodes[key] = replace(
                node, water=0, backlog=max(0, node.backlog - 1),
                seal_level=node.seal_level if remaining else 0,
                seal_source=node.seal_source if remaining else None,
                seal_remaining=remaining,
            )

    def snapshot(self) -> dict[str, object]:
        return {
            "schema": "meridian-flow-state.v1",
            "rulesProtocol": RULES_PROTOCOL,
            "rngProtocol": RNG_PROTOCOL,
            "unitId": self.unit_id,
            "unitIndex": self.unit_index,
            "kind": self.kind,
            "tick": self.tick_no,
            "stateVersion": self.state_version,
            "grappleLevel": self.grapple_level,
            "grappleSource": self.grapple_source,
            "grappleRemaining": self.grapple_remaining,
            "rng": list(self.rng.snapshot()),
            "nodes": [asdict(self.nodes[key]) for key in sorted(self.nodes)],
        }

    def restore(self, snapshot: dict[str, object]) -> None:
        if snapshot["unitId"] != self.unit_id:
            raise ValueError("snapshot belongs to another unit")
        if snapshot.get("schema") != "meridian-flow-state.v1":
            raise ValueError("unsupported meridian snapshot schema")
        if snapshot.get("rulesProtocol") != RULES_PROTOCOL:
            raise ValueError("unsupported rules protocol")
        if snapshot.get("rngProtocol") != RNG_PROTOCOL:
            raise ValueError("unsupported rng protocol")
        if int(snapshot["unitIndex"]) != self.unit_index:
            raise ValueError("snapshot belongs to another unit index")
        self.kind = str(snapshot["kind"])
        self.tick_no = int(snapshot["tick"])
        self.state_version = int(snapshot["stateVersion"])
        self.grapple_level = int(snapshot["grappleLevel"])
        self.grapple_source = snapshot["grappleSource"]  # type: ignore[assignment]
        self.grapple_remaining = int(snapshot["grappleRemaining"])
        self.rng.state[:] = [int(value) for value in snapshot["rng"]]  # type: ignore[arg-type]
        rows = snapshot["nodes"]
        self.nodes = {row["acupoint"]: NodeState(**row) for row in rows}  # type: ignore[arg-type,index]


@dataclass(frozen=True)
class GrappleEffect:
    level: int
    move_bp: int
    recovery_add: int
    str_bp: int
    agi_bp: int
    evade_bp: int
    weapon_locked: bool
    action_locked: bool


def grapple_effect(level: int) -> GrappleEffect:
    if not 1 <= level <= 9:
        raise ValueError("grapple level must be 1..9")
    return GrappleEffect(
        level=level,
        move_bp=(BP, 9_000, 8_000, 7_000, 6_000, 5_000, 3_500, 2_000, 0)[level - 1],
        recovery_add=(50, 100, 150, 200, 250, 300, 400, 500, 0)[level - 1],
        str_bp=(9_500, 9_000, 8_500, 8_000, 7_500, 7_000, 6_000, 5_000, 0)[level - 1],
        agi_bp=(9_500, 9_000, 8_500, 8_000, 7_500, 7_000, 6_000, 5_000, 0)[level - 1],
        evade_bp=(9_500, 9_000, 8_500, 8_000, 7_500, 7_000, 6_000, 5_000, 0)[level - 1],
        weapon_locked=level >= 7, action_locked=level == 9,
    )


def grapple_escape_bp(
    level: int, target_str: int, target_agi: int, source_str: int,
    source_grapple: int, target_inner_grade: int, failed: int = 0,
) -> int:
    score = 5_000 + 40 * ((target_str + target_agi) - (source_str + source_grapple))
    score += 150 * target_inner_grade + 500 * failed - 650 * level
    return clamp(score, 500, 9_500)


@dataclass(frozen=True)
class PointEffect:
    level: int
    flow_penalty_bp: int
    mp_cost_add_bp: int
    inner_locked: bool
    breath_locked: bool


def point_effect(level: int) -> PointEffect:
    if not 1 <= level <= 9:
        raise ValueError("point level must be 1..9")
    return PointEffect(
        level, POINT_FLOW_PENALTY_BP[level],
        (300, 600, 900, 1_200, 1_600, 2_000, 2_500, 3_000, 0)[level - 1],
        level >= 8, level == 9,
    )


def point_release_bp(
    level: int, healer_grade: int, healer_layer: int, medical: int,
    target_will: int, method_bonus_bp: int = 0,
) -> int:
    score = 3_500 + 250 * healer_grade + 100 * healer_layer
    score += 20 * medical + 10 * target_will + method_bonus_bp - 700 * level
    return clamp(score, 500, 9_500)


def z3_damage(base_damage: int, route_bp: int, other_z3_bp: int = 0) -> int:
    return mul_bp_floor(base_damage, clamp(BP + route_bp + other_z3_bp, 5_000, 20_000))


def ttk_actions(hp: int, damage: int, *, team_equiv_bp: int = BP) -> int:
    return ceil_div(hp * BP, damage * team_equiv_bp)


SHORT_ROUTE = RouteSpec(
    "mfr_half_step_crush", "半步崩拳",
    ("ap_dumai_mingmen", "ap_shoujueyin_laogong"), (70, 70), (100, 100),
)
LONG_ROUTE = RouteSpec(
    "mfr_eighteen_palms_chain", "十八掌连环",
    (
        "ap_renmai_qihai", "ap_renmai_danzhong", "ap_shoutaiyin_yunmen",
        "ap_shoutaiyin_chize", "ap_shoutaiyin_taiyuan",
        "ap_shoujueyin_neiguan", "ap_shoujueyin_laogong",
        "ap_dumai_mingmen", "ap_dumai_zhiyang", "ap_dumai_baihui",
    ),
    (80,) * 10, (150,) * 10, True,
)
NOVICE_ROUTE = RouteSpec(
    "mfr_novice_eight", "生疏八段", LONG_ROUTE.nodes[:8], (75,) * 8, (500,) * 8,
)
FORCED_ROUTE = RouteSpec(
    "mfr_forced_six", "强催六段", LONG_ROUTE.nodes[:6], (85,) * 6, (800,) * 6,
)


def make_units(master_seed: int = 20260927) -> dict[str, MeridianFlowModule]:
    all_nodes = tuple(dict.fromkeys(LONG_ROUTE.nodes + SHORT_ROUTE.nodes))
    return {
        "hero": MeridianFlowModule(
            "hero", Cultivation(9, 8, 12_100, "harmony", "yin", True, True, True, True, 3, 9_000),
            all_nodes, master_seed=fixture_unit_seed(master_seed, 0), kind="hero", unit_index=0,
        ),
        "normal": MeridianFlowModule(
            "enemy_normal", Cultivation(5, 7, 9_000, "yang", "yang", practice_bp=6_200),
            all_nodes, master_seed=fixture_unit_seed(master_seed, 1), kind="normal", unit_index=1, capacity_bp=9_000,
        ),
        "elite": MeridianFlowModule(
            "enemy_elite", Cultivation(7, 8, 10_500, "yin", "yin", True, practice_bp=7_500),
            all_nodes, master_seed=fixture_unit_seed(master_seed, 2), kind="elite", unit_index=2, capacity_bp=10_500,
        ),
        "boss": MeridianFlowModule(
            "enemy_boss", Cultivation(10, 9, 13_000, "harmony", "harmony", True, True, True, True, 5, 9_500),
            all_nodes, master_seed=fixture_unit_seed(master_seed, 3), kind="boss", unit_index=3, capacity_bp=13_000,
        ),
    }


def result_vector(result: FlowResult, base_damage: int) -> dict[str, object]:
    blocked = result.states[result.blocked_at] if result.blocked_at is not None else None
    return {
        "unitId": result.unit_id, "routeId": result.route_id,
        "completed": result.completed, "attempted": result.attempted,
        "capBp": result.bonus_cap_bp, "z3Bp": result.route_z3_bp,
        "flowCt": result.flow_ct, "damage": z3_damage(base_damage, result.route_z3_bp),
        "blockedAt": result.blocked_at, "blockedNode": result.blocked_node,
        "disabledReason": result.disabled_reason,
        "blockedState": asdict(blocked) if blocked else None,
    }


def golden_payload() -> dict[str, object]:
    units = make_units()
    hero = units["hero"]
    preview_rng = list(hero.rng.snapshot())
    short = hero.preview(SHORT_ROUTE)
    assert list(hero.rng.snapshot()) == preview_rng
    long = hero.commit_with_rolls(LONG_ROUTE, [9_999] * 10)
    seeded_hero = make_units()["hero"]
    seeded = seeded_hero.commit(LONG_ROUTE)

    normal = units["normal"].commit_with_rolls(SHORT_ROUTE, [9_999] * 2)
    elite = units["elite"].commit_with_rolls(LONG_ROUTE, [9_999] * 10)
    boss = units["boss"].commit_with_rolls(LONG_ROUTE, [9_999] * 10)

    jam_unit = make_units()["normal"]
    jam_node = NOVICE_ROUTE.nodes[3]
    jam_unit.nodes[jam_node] = replace(jam_unit.nodes[jam_node], stagnation_bp=4_000, backlog=600)
    jam = jam_unit.commit_with_rolls(NOVICE_ROUTE, [9_999, 9_999, 9_999, 0, 9_999, 9_999, 9_999, 9_999])

    rupture_unit = make_units()["normal"]
    rupture_node = FORCED_ROUTE.nodes[2]
    rupture_unit.nodes[rupture_node] = replace(
        rupture_unit.nodes[rupture_node], stagnation_bp=6_000, backlog=1_100
    )
    rupture = rupture_unit.commit_with_rolls(FORCED_ROUTE, [9_999, 9_999, 0, 9_999, 9_999, 9_999])
    breath = rupture_unit.regulate_breath(BreathProfile("txp_harmony_supreme", 12, 10, "harmony"))

    sealed_unit = make_units()["hero"]
    sealed_unit.apply_acupoint_seal(LONG_ROUTE.nodes[4], 9)
    sealed = sealed_unit.preview(LONG_ROUTE)

    base_damage = {"normal": 849, "elite": 950, "boss": 2_574}
    ttk_before = {
        "normal": ttk_actions(3_970, base_damage["normal"]),
        "elite": ttk_actions(8_000, base_damage["elite"]),
        "boss": ttk_actions(170_773, base_damage["boss"], team_equiv_bp=31_000),
    }
    ttk_after = {
        "normal": ttk_actions(3_970, z3_damage(base_damage["normal"], normal.route_z3_bp)),
        "elite": ttk_actions(8_000, z3_damage(base_damage["elite"], elite.route_z3_bp)),
        "boss": ttk_actions(170_773, z3_damage(base_damage["boss"], boss.route_z3_bp), team_equiv_bp=31_000),
    }
    payload: dict[str, object] = {
        "fixtureVersion": 1, "rulesProtocol": RULES_PROTOCOL, "rngProtocol": RNG_PROTOCOL,
        "masterSeed": 20260927,
        "inputs": {
            "routes": [asdict(SHORT_ROUTE), asdict(LONG_ROUTE), asdict(NOVICE_ROUTE), asdict(FORCED_ROUTE)],
            "units": {key: {
                "unitId": value.unit_id, "kind": value.kind,
                "unitIndex": value.unit_index, "masterSeed": value.master_seed,
                "capacityScaleBp": value.capacity_scale_bp,
                "cultivation": asdict(value.cultivation),
            } for key, value in units.items()},
            "explicitRolls": {"clean": 9_999, "forcedJam": 0},
        },
        "outputs": {
            "heroShortPreview": result_vector(short, base_damage["normal"]),
            "heroLongCommit": result_vector(long, base_damage["normal"]),
            "heroSeededCommit": result_vector(seeded, base_damage["normal"]),
            "heroSeededRngAfter": list(seeded_hero.rng.snapshot()),
            "normalShort": result_vector(normal, base_damage["normal"]),
            "eliteLong": result_vector(elite, base_damage["elite"]),
            "bossLong": result_vector(boss, base_damage["boss"]),
            "jammed": result_vector(jam, base_damage["normal"]),
            "ruptured": result_vector(rupture, base_damage["normal"]),
            "breath": asdict(breath), "sealed": result_vector(sealed, base_damage["normal"]),
            "ttkActionsBefore": ttk_before, "ttkActionsAfter": ttk_after,
            "grapple1": asdict(grapple_effect(1)), "grapple9": asdict(grapple_effect(9)),
            "escapeLevel6Bp": grapple_escape_bp(6, 70, 65, 75, 70, 8),
            "point1": asdict(point_effect(1)), "point9": asdict(point_effect(9)),
        },
    }
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    payload["vectorSha256"] = sha256(canonical.encode("utf-8")).hexdigest()
    return payload


def _cycle_sensitivity(
    label: str, *, capacity_scale_bp: int = BP, risk_scale_bp: int = BP,
    relief_scale_bp: int = BP, cap_scale_bp: int = BP, ct_scale_bp: int = BP,
) -> dict[str, int | str]:
    route = replace(
        LONG_ROUTE,
        segment_ct=tuple(max(1, mul_bp_floor(v, ct_scale_bp)) for v in LONG_ROUTE.segment_ct),
        risk_bp=tuple(mul_bp_floor(v, risk_scale_bp) for v in LONG_ROUTE.risk_bp),
    )
    attacks = breath_actions = total_ct = total_damage = 0
    for sample in range(64):
        unit = make_units(20260927 + sample * 17)["hero"]
        for key in sorted(unit.nodes):
            node = unit.nodes[key]
            unit.nodes[key] = replace(node, capacity=mul_bp_floor(node.capacity, capacity_scale_bp))
        for _ in range(18):
            result = unit.commit(route)
            attacks += 1
            total_ct += 1_000 + result.flow_ct
            route_bp = mul_bp_floor(result.route_z3_bp, cap_scale_bp)
            total_damage += z3_damage(849, route_bp)
            bad = sum(n.stagnation_bp for n in unit.nodes.values())
            if bad >= 3_000 or any(n.ruptured for n in unit.nodes.values()):
                breath = unit.regulate_breath(
                    BreathProfile("txp_sensitivity", 9, 8, "harmony"),
                    potency_bp=relief_scale_bp,
                )
                breath_actions += 1
                total_ct += breath.ct
            unit.tick()
    dpa = max(1, total_damage // attacks)
    return {
        "case": label, "ttkNormal": ttk_actions(3_970, dpa),
        "ttkCentiActions": ceil_div(3_970 * 100, dpa),
        "attackFrequencyBp": attacks * 1_000 * BP // total_ct,
        "breathShareBp": breath_actions * BP // (attacks + breath_actions),
        "averageDamage": dpa, "breathActions": breath_actions,
    }


def sensitivity_rows() -> list[dict[str, int | str]]:
    """One-at-a-time ±20% sensitivity around the deterministic baseline."""
    return [
        _cycle_sensitivity("容量−20%", capacity_scale_bp=8_000),
        _cycle_sensitivity("容量基准"),
        _cycle_sensitivity("容量+20%", capacity_scale_bp=12_000),
        _cycle_sensitivity("卡住风险−20%", risk_scale_bp=8_000),
        _cycle_sensitivity("卡住风险基准"),
        _cycle_sensitivity("卡住风险+20%", risk_scale_bp=12_000),
        _cycle_sensitivity("调息强度−20%", relief_scale_bp=8_000),
        _cycle_sensitivity("调息强度基准"),
        _cycle_sensitivity("调息强度+20%", relief_scale_bp=12_000),
        _cycle_sensitivity("路线上限−20%", cap_scale_bp=8_000),
        _cycle_sensitivity("路线上限基准"),
        _cycle_sensitivity("路线上限+20%", cap_scale_bp=12_000),
        _cycle_sensitivity("单段CT−20%", ct_scale_bp=8_000),
        _cycle_sensitivity("单段CT基准"),
        _cycle_sensitivity("单段CT+20%", ct_scale_bp=12_000),
    ]


def run_checks() -> None:
    caps = [route_cap_bp(n) for n in range(1, 65)]
    assert all(a < b for a, b in zip(caps, caps[1:])), caps
    assert caps[-1] < 1_200 and route_cap_bp(1) == 171

    units = make_units()
    hero = units["hero"]
    rng_before = hero.rng.snapshot()
    clean = hero.preview(RouteSpec("mfr_timing", "时序", LONG_ROUTE.nodes[:4],
                                    (55, 65, 75, 85), (0, 0, 0, 0)))
    assert clean.flow_ct == 280 and clean.completed == 4
    assert hero.rng.snapshot() == rng_before and hero.snapshot()["unitId"] == "hero"

    normal = units["normal"]
    bad_ap = FORCED_ROUTE.nodes[0]
    node = normal.nodes[bad_ap]
    normal.nodes[bad_ap] = replace(node, stagnation_bp=6_000, backlog=node.capacity)
    forced = normal.commit_with_rolls(
        RouteSpec("mfr_jam_check", "阻滞检查", (bad_ap,), (80,), (0,)), [0]
    )
    assert forced.blocked_at == 0 and forced.states[0].backlog > node.backlog
    assert forced.states[0].ruptured
    before_damage = forced.states[0].rupture_damage
    recovery = normal.regulate_breath(BreathProfile("txp_check", 12, 10, "harmony"))
    assert recovery.rupture_repaired > 0
    for _ in range(8):
        normal.regulate_breath(BreathProfile("txp_check", 12, 10, "harmony"))
    assert not normal.nodes[bad_ap].ruptured and normal.nodes[bad_ap].rupture_damage < before_damage

    sealed = units["elite"]
    sealed.apply_acupoint_seal(SHORT_ROUTE.nodes[1], 9)
    denied = sealed.preview(SHORT_ROUTE)
    assert denied.disabled_reason == "point_seal_9" and denied.completed == 0
    sealed_rng = sealed.rng.snapshot()
    try:
        sealed.regulate_breath(BreathProfile("txp_check", 12, 10, "harmony"))
    except ValueError as exc:
        assert "level 9" in str(exc)
    else:
        raise AssertionError("level 9 point seal must block self regulation")
    assert sealed.rng.snapshot() == sealed_rng

    assert grapple_effect(1).move_bp == BP
    assert grapple_effect(7).weapon_locked and not grapple_effect(8).action_locked
    assert grapple_effect(9).action_locked and grapple_effect(9).move_bp == 0
    assert point_effect(1).flow_penalty_bp == 500
    assert point_effect(8).inner_locked and not point_effect(8).breath_locked
    assert point_effect(9).breath_locked and point_effect(9).flow_penalty_bp == BP

    duration_unit = make_units()["hero"]
    duration_unit.apply_grapple(4, source="enemy")
    duration_unit.apply_acupoint_seal(SHORT_ROUTE.nodes[0], 3, source="enemy")
    duration_unit.tick(grapple_remaining=0, seal_remaining={SHORT_ROUTE.nodes[0]: 0})
    assert duration_unit.grapple_level == 0 and duration_unit.grapple_source is None
    assert duration_unit.nodes[SHORT_ROUTE.nodes[0]].seal_level == 0

    # Hero, normal, elite and Boss really own separate state and all calculate attacks.
    vectors = golden_payload()["outputs"]
    assert vectors["heroLongCommit"]["z3Bp"] > vectors["heroShortPreview"]["z3Bp"]  # type: ignore[index]
    for key in ("normalShort", "eliteLong", "bossLong"):
        assert vectors[key]["damage"] > 0  # type: ignore[index]
    assert units["normal"].nodes is not units["elite"].nodes

    # Existing TTK bands use the current design/04 calibration anchors.
    max_route_bp = route_cap_bp(12)
    assert 3 <= ttk_actions(3_970, z3_damage(849, max_route_bp)) <= 5
    assert 6 <= ttk_actions(8_000, z3_damage(950, max_route_bp)) <= 10
    assert 12 <= ttk_actions(170_773, z3_damage(2_574, max_route_bp), team_equiv_bp=31_000) <= 25

    # Snapshot/restore is exact for battle save and replay checkpoints.
    snap = hero.snapshot()
    hero.apply_grapple(6)
    hero.tick()
    hero.restore(snap)
    assert hero.snapshot() == snap

    expected = json.loads(json.dumps(golden_payload(), ensure_ascii=False, sort_keys=True))
    assert GOLDEN_PATH.exists(), "run --write-golden once"
    actual = json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))
    assert actual == expected, "golden drift: run --write-golden only after reviewing rules"


def print_report() -> None:
    payload = golden_payload()
    print(json.dumps(payload["outputs"], ensure_ascii=False, indent=2, sort_keys=True))
    print("sensitivity:")
    print(json.dumps(sensitivity_rows(), ensure_ascii=False, indent=2))
    print("vectorSha256:", payload["vectorSha256"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--report", action="store_true")
    parser.add_argument("--write-golden", action="store_true")
    args = parser.parse_args()
    if args.write_golden:
        GOLDEN_PATH.write_text(
            json.dumps(golden_payload(), ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {GOLDEN_PATH}")
    if args.check:
        run_checks()
        print("meridian_flow_sim: all checks passed")
    if args.report or not (args.check or args.write_golden):
        print_report()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


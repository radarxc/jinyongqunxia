#!/usr/bin/env python3
"""Deterministic integer oracle for design/21 meridian-flow combat.

One ``MeridianFlowModule`` instance belongs to exactly one battle unit.  This
is a balance/reference implementation, not the production TypeScript engine.
It intentionally uses only the standard library, integers and basis points.
"""

import argparse
import json
from dataclasses import asdict, dataclass, replace
from hashlib import sha256
from math import isqrt
from pathlib import Path
from typing import Iterable, Sequence
BP = 10_000
MASK32 = 0xFFFF_FFFF
RULES_PROTOCOL = 2
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
def lerp_anchors(value: int, anchors: Sequence[tuple[int, int]]) -> int:
    """Piecewise-linear integer lookup, clamped to the end anchors."""
    if value <= anchors[0][0]:
        return anchors[0][1]
    for (x0, y0), (x1, y1) in zip(anchors, anchors[1:]):
        if value <= x1:
            return y0 + (value - x0) * (y1 - y0) // (x1 - x0)
    return anchors[-1][1]

def route_reach_bp(length: int) -> int:
    """How much of a relative-strength edge this route can realise."""
    if not 1 <= length <= 18:
        raise ValueError("route length must be 1..18")
    return min(BP, 3_000 + 7_000 * length // 18)
ATTACK_CURVE = (
    (4_000, 6_500), (5_000, 6_500), (6_500, 7_200), (8_000, 8_600),
    (10_000, 10_000), (12_000, 13_000), (15_000, 16_500),
    (18_000, 19_000), (22_000, 22_000), (25_000, 22_000),
)
DEFENSE_CURVE = (
    (4_000, 13_000), (5_000, 12_500), (8_000, 11_000),
    (10_000, 10_000), (12_000, 8_800), (15_000, 7_000),
    (20_000, 5_500), (22_000, 5_000), (25_000, 5_000),
)
SPEED_CURVE = (
    (4_000, 7_500), (6_000, 8_000), (8_000, 9_000),
    (10_000, 10_000), (12_000, 11_000), (15_000, 12_250),
    (18_000, 13_500),
)
@dataclass(frozen=True)
class MeridianProfile:
    qi_bp: int
    capacity_bp: int
    flow_bp: int
    completion_bp: int
def relative_component_bp(value: int, standard: int, lo: int = 4_000) -> int:
    if standard <= 0:
        raise ValueError("STD meridian component must be positive")
    return clamp(value * BP // standard, lo, 18_000)

def normalize_profile(raw: tuple[int, int, int, int],
                      standard: tuple[int, int, int, int]) -> MeridianProfile:
    values = [relative_component_bp(v, s) for v, s in zip(raw[:3], standard[:3])]
    return MeridianProfile(*values, relative_component_bp(raw[3], standard[3], lo=0))
def meridian_strength_bp(profile: MeridianProfile) -> int:
    """30% qi, 25% capacity, 25% fluency, 20% route quality."""
    qi, capacity, flow = (clamp(value, 4_000, 18_000) for value in
                          (profile.qi_bp, profile.capacity_bp, profile.flow_bp))
    completion = clamp(profile.completion_bp, 0, 18_000)
    score = (30 * qi + 25 * capacity + 25 * flow + 20 * completion) // 100
    return clamp(score, 4_000, 18_000)
def _blend_from_neutral(target_bp: int, realise_bp: int) -> int:
    if target_bp >= BP:
        return BP + (target_bp - BP) * realise_bp // BP
    return BP - (BP - target_bp) * realise_bp // BP
def attack_meridian_mult_bp(
    attacker: MeridianProfile, defender: MeridianProfile, route_length: int,
) -> int:
    ratio = clamp(meridian_strength_bp(attacker) * BP
                  // max(1, meridian_strength_bp(defender)), 4_000, 25_000)
    target = lerp_anchors(ratio, ATTACK_CURVE)
    quality_reach = clamp(5_000 + (attacker.completion_bp if ratio >= BP else defender.completion_bp) // 2, 5_000, BP)
    realise = mul_bp_floor(route_reach_bp(route_length), quality_reach)
    return clamp(_blend_from_neutral(target, realise), 6_500, 22_000)
def defense_meridian_mult_bp(
    defender: MeridianProfile, attacker: MeridianProfile, route_length: int,
) -> int:
    ratio = clamp(meridian_strength_bp(defender) * BP
                  // max(1, meridian_strength_bp(attacker)), 4_000, 25_000)
    target = lerp_anchors(ratio, DEFENSE_CURVE)
    quality_reach = clamp(5_000 + (defender.completion_bp if ratio >= BP else attacker.completion_bp) // 2, 5_000, BP)
    realise = mul_bp_floor(route_reach_bp(route_length), quality_reach)
    return clamp(_blend_from_neutral(target, realise), 5_000, 13_000)
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
    purpose: str = "attack"

    def __post_init__(self) -> None:
        if not 1 <= len(self.nodes) <= 18 or len(self.nodes) != len(self.segment_ct):
            raise ValueError("route arrays must be non-empty and equal length")
        bad_ct = any(not 40 <= t <= 120 for t in self.segment_ct)
        if len(self.nodes) != len(self.risk_bp) or bad_ct or any(not 0 <= r <= 1_200 for r in self.risk_bp):
            raise ValueError("risk length and CT/risk bounds are required")
        if len(set(self.nodes)) != len(self.nodes):
            raise ValueError("a route cannot repeat a node")
        if self.purpose not in {"attack", "defense", "movement"}:
            raise ValueError("route purpose must be attack/defense/movement")
@dataclass(frozen=True)
class FlowTraceStep:
    acupoint: str; incoming: int; passed: int; jam_chance_bp: int
@dataclass(frozen=True)
class FlowResult:
    unit_id: str
    route_id: str
    completed: int
    attempted: int
    route_quality_bp: int
    flow_ct: int
    blocked_at: int | None
    blocked_node: str | None
    states: tuple[NodeState, ...]
    qualities_bp: tuple[int, ...]
    jam_chances_bp: tuple[int, ...]
    arrival_bp: tuple[int, ...]
    trace: tuple[FlowTraceStep, ...]
    state_version: int
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

def derive_node(
    acupoint: str, cultivation: Cultivation, capacity_bp: int = BP,
    *, opened: bool = True, meridian_complete: bool | None = None,
) -> NodeState:
    if not 1 <= cultivation.grade <= 12 or not 1 <= cultivation.layer <= 10:
        raise ValueError("grade/layer out of range")
    depth_bp = sqrt_ratio_bp(cultivation.mp_ratio_bp)
    capacity = 700 + G_BP[cultivation.grade] // 50 + 25 * cultivation.layer
    complete = cultivation.meridian_complete if meridian_complete is None else meridian_complete
    capacity += 100 * complete + 50 * cultivation.small_cycle
    capacity += 100 * cultivation.great_cycle + 100 * cultivation.twelve_cycle
    capacity += 20 * clamp(cultivation.turns, 0, 9)
    capacity = mul_bp_floor(mul_bp_floor(capacity, depth_bp), capacity_bp)
    flow = 4_500 + G_BP[cultivation.grade] // 10 + 250 * cultivation.layer
    flow += 400 * complete + 200 * cultivation.small_cycle
    flow += 400 * cultivation.great_cycle + 400 * cultivation.twelve_cycle
    flow += 100 * clamp(cultivation.turns, 0, 9)
    flow = clamp(
        mul_bp_floor(flow, affinity_bp(cultivation.inner_nature, cultivation.meridian_nature)),
        3_000, BP,
    )
    return NodeState(acupoint, opened, 0, clamp(capacity, 600, 2_600), flow)


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
        *, kind: str = "hero", unit_index: int = 0, capacity_bp: int = BP,
        opened_acupoints: set[str] | None = None,
        complete_acupoints: set[str] | None = None,
    ) -> None:
        self.unit_id = unit_id
        self.kind = kind
        self.unit_index = unit_index
        self.capacity_scale_bp = capacity_bp
        self.cultivation = cultivation
        self.nodes = {ap: derive_node(
            ap, cultivation, capacity_bp,
            opened=opened_acupoints is None or ap in opened_acupoints,
            meridian_complete=None if complete_acupoints is None else ap in complete_acupoints,
        ) for ap in sorted(acupoints)}
        self.grapple_level = 0
        self.grapple_source: str | None = None
        self.grapple_remaining = 0
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
                return FlowResult(self.unit_id, route.id, 0, 0, 0, 0, index, node.acupoint,
                                  states, (), (), (), (),
                                  self.state_version, reason)

        current_qi = initial_qi(self.cultivation)
        gain = node_gain(self.cultivation)
        updated = list(states)
        qualities: list[int] = []
        jam_chances: list[int] = []
        arrivals: list[int] = []
        trace: list[FlowTraceStep] = []
        arrival_bp = BP
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
            arrivals.append(arrival_bp)
            jam_chances.append(chance)
            roll = next(roll_iter)
            if not 0 <= roll < BP:
                raise ValueError("roll must be in 0..9999")
            jammed = roll < chance
            passed = mul_bp_floor(normal_pass, 4_000) if jammed else normal_pass
            trace.append(FlowTraceStep(node.acupoint, incoming, passed, chance))
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
            arrival_bp = mul_bp_floor(arrival_bp, BP - chance)

        actual = sum(qualities) // len(states)
        blocked_node = route.nodes[blocked_at] if blocked_at is not None else None
        return FlowResult(
            self.unit_id, route.id, completed, attempted, actual, flow_ct,
            blocked_at, blocked_node, tuple(updated), tuple(qualities),
            tuple(jam_chances), tuple(arrivals), tuple(trace), self.state_version,
        )

    def preview(self, route: RouteSpec, *, preview_roll_bp: int = 9_999) -> FlowResult:
        """No state mutation and no RNG consumption."""
        return self._run(route, [preview_roll_bp] * len(route.nodes))

    def commit(self, route: RouteSpec, battle_rng: Sfc32) -> FlowResult:
        """Mutate this unit while consuming Core's sole global battle stream."""
        result = self._run(route, (battle_rng.roll_bp() for _ in route.nodes))
        if result.attempted:
            for state in result.states:
                self.nodes[state.acupoint] = state
            self.state_version += 1
        return replace(result, state_version=self.state_version)

    def commit_with_rolls(self, route: RouteSpec, rolls: Sequence[int]) -> FlowResult:
        """Golden/debug seam; production commit always uses the battle stream."""
        if len(rolls) < len(route.nodes):
            raise ValueError("one explicit roll per route node is required")
        result = self._run(route, rolls)
        if result.attempted:
            for state in result.states:
                self.nodes[state.acupoint] = state
            self.state_version += 1
        return replace(result, state_version=self.state_version)

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
        if (next_level, next_remaining, source) != (node.seal_level, node.seal_remaining, node.seal_source):
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
        self, profile: BreathProfile, *, battle_rng: Sfc32 | None = None,
        target_will: int = 0, medical: int = 0, method_bonus_bp: int = 0,
        out_of_battle: bool = False, potency_bp: int = BP,
    ) -> BreathResult:
        if any(node.seal_level >= 9 for node in self.nodes.values()):
            raise ValueError("level 9 point seal blocks self regulation")
        scale_bp = 15_000 if out_of_battle else BP
        relief_bp = mul_bp_floor(mul_bp_floor(profile.relief_bp, scale_bp), potency_bp)
        repair = mul_bp_floor(mul_bp_floor(profile.repair_units, scale_bp), potency_bp)
        ranked = sorted(
            self.nodes.values(),
            key=lambda n: (not n.ruptured, -n.seal_level, -n.stagnation_bp, -n.backlog, n.acupoint),
        )
        touched = ranked[:max(1, profile.scope)]
        if battle_rng is None and any(
            n.seal_level and profile.grade + profile.layer >= n.seal_level + 6 for n in touched
        ):
            raise ValueError("battle RNG is required for a self-unseal attempt")
        removed_stag = removed_backlog = repaired = seals = 0
        for node in touched:
            new_stag = max(0, node.stagnation_bp - relief_bp)
            backlog_relief = max(1, mul_bp_floor(node.capacity, relief_bp))
            new_backlog = max(0, node.backlog - backlog_relief)
            new_damage = max(0, node.rupture_damage - repair)
            eligible = bool(node.seal_level and profile.grade + profile.layer >= node.seal_level + 6)
            release_bp = point_release_bp(node.seal_level, profile.grade, profile.layer,
                                          medical, target_will, method_bonus_bp) if eligible else 0
            seal_drop = int(bool(eligible and battle_rng.roll_bp() < release_bp))
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
        self.state_version += 1
        return BreathResult(tuple(n.acupoint for n in touched), removed_stag,
                            removed_backlog, repaired, seals, 0 if out_of_battle else profile.ct, profile.mp_cost_bp)

    def tick(
        self, *, grapple_remaining: int | None = None,
        seal_remaining: dict[str, int] | None = None,
    ) -> None:
        """Advance flow state and accept design/06-owned duration projections.

        Omitted projections retain their current value; this module never runs a
        second control-effect clock.  A projected zero clears the local mirror.
        """
        seal_projection = seal_remaining or {}
        unknown = set(seal_projection) - set(self.nodes)
        if unknown or any(value < 0 for value in seal_projection.values()):
            raise ValueError("invalid seal projection")
        if grapple_remaining is not None:
            if grapple_remaining < 0:
                raise ValueError("grapple projection cannot be negative")
            self.grapple_remaining = grapple_remaining
            if grapple_remaining == 0:
                self.grapple_level = 0
                self.grapple_source = None
        self.tick_no += 1
        for key in sorted(self.nodes):
            node = self.nodes[key]
            remaining = seal_projection.get(key, node.seal_remaining)
            updated = replace(
                node, water=0, backlog=max(0, node.backlog - 1),
                seal_level=node.seal_level if remaining else 0,
                seal_source=node.seal_source if remaining else None,
                seal_remaining=remaining,
            )
            if updated != node:
                self.nodes[key] = updated
        self.state_version += 1
    def snapshot(self) -> dict[str, object]:
        return {
            "schema": "meridian-flow-state.v1",
            "rulesProtocol": RULES_PROTOCOL,
            "unitId": self.unit_id,
            "unitIndex": self.unit_index,
            "kind": self.kind,
            "tick": self.tick_no,
            "stateVersion": self.state_version,
            "grappleLevel": self.grapple_level,
            "grappleSource": self.grapple_source,
            "grappleRemaining": self.grapple_remaining,
            "nodes": [contract_value(self.nodes[key]) for key in sorted(self.nodes)],
        }
    def restore(self, snapshot: dict[str, object]) -> None:
        if snapshot["unitId"] != self.unit_id:
            raise ValueError("snapshot belongs to another unit")
        if snapshot.get("schema") != "meridian-flow-state.v1":
            raise ValueError("unsupported meridian snapshot schema")
        if snapshot.get("rulesProtocol") != RULES_PROTOCOL:
            raise ValueError("unsupported rules protocol")
        if int(snapshot["unitIndex"]) != self.unit_index:
            raise ValueError("snapshot belongs to another unit index")
        self.kind = str(snapshot["kind"])
        self.tick_no = int(snapshot["tick"])
        self.state_version = int(snapshot["stateVersion"])
        self.grapple_level = int(snapshot["grappleLevel"])
        self.grapple_source = snapshot["grappleSource"]  # type: ignore[assignment]
        self.grapple_remaining = int(snapshot["grappleRemaining"])
        self.nodes = {row["acupointRef"]: NodeState(
            row["acupointRef"], row["opened"], row["water"], row["capacity"], row["flowBp"],
            row["stagnationBp"], row["backlog"], row["ruptureDamage"], row["sealLevel"], row["sealSource"], row["sealRemaining"],
        ) for row in snapshot["nodes"]}  # type: ignore[arg-type,index]


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


@dataclass(frozen=True)
class InnerGuardResult:
    eligible_incoming: int
    capacity: int
    cancelled: int
    damage_before_mp_guard: int
    mp_spent: int
    broken: bool
    delay_ct: int
    stagnation_bp: int
    reflect_damage: int


def inner_guard(
    incoming: int, defender: MeridianProfile, attacker: MeridianProfile,
    *, damage_kind: str = "unarmed", mp: int = 10_000,
    break_guard_bp: int = 0, reflect_bp: int = 0,
) -> InnerGuardResult:
    """Settle-stage meridian force cancellation, after shield, before mpGuard."""
    eligibility = {"unarmed": BP, "weapon": 2_500, "hidden": 0, "projected": 4_000}
    if damage_kind not in eligibility:
        raise ValueError("unknown damage kind")
    eligible = mul_bp_floor(incoming, eligibility[damage_kind])
    strength = meridian_strength_bp(defender)
    flow_ratio_bp = clamp(defender.flow_bp, 4_000, 18_000)
    raw_capacity = strength * flow_ratio_bp // 100_000
    capacity = mul_bp_floor(raw_capacity, max(0, BP - clamp(break_guard_bp, 0, 8_000)))
    cancelled = min(eligible, capacity, mp * 2)
    spent = ceil_div(cancelled, 2)
    damage = incoming - cancelled
    broken = cancelled < eligible
    overflow = max(0, eligible - cancelled)
    delay = 150 + min(250, overflow * 250 // max(1, cancelled)) if broken else 0
    stagnation = 800 + min(2_200, overflow * 2_200 // max(1, cancelled)) if broken else 0
    reflected = mul_bp_floor(cancelled, clamp(reflect_bp, 0, 2_000))
    return InnerGuardResult(eligible, capacity, cancelled, damage, spent, broken,
                            delay, stagnation, reflected)


def speed_meridian_mult_bp(
    self_profile: MeridianProfile, field_reference: MeridianProfile,
    *, sealed: bool = False, ruptured: bool = False,
) -> int:
    ratio = clamp(meridian_strength_bp(self_profile) * BP
                  // max(1, meridian_strength_bp(field_reference)), 4_000, 18_000)
    target = lerp_anchors(ratio, SPEED_CURVE)
    result = target
    if sealed:
        result = min(result, 6_500)
    if ruptured:
        result = min(result, 8_000)
    return clamp(result, 6_500, 13_500)


def apply_speed(
    base_spd: int, base_move: int, speed_mult_bp: int, *, grapple_bp: int = BP,
) -> tuple[int, int]:
    """21 multiplier, then grapple; 03/09 own base values and final limits."""
    combined = mul_bp_floor(speed_mult_bp, clamp(grapple_bp, 0, BP))
    spd = clamp(mul_bp_floor(base_spd, combined), 30, 300)
    delta = combined - BP
    move_delta = clamp((1 if delta >= 0 else -1) * (abs(delta) // 1_500), -2, 2)
    return spd, clamp(base_move + move_delta, 1, 10)


def project_opening_qinggong(effective_qinggong: int, combined_speed_bp: int) -> int:
    """09-only opening-order projection; 08 gates still read the base value."""
    return max(0, mul_bp_floor(effective_qinggong, combined_speed_bp))


def evade_rating_delta(meridian_speed_bp: int) -> int:
    """Meridian-only correction; grapple evadeBp is applied once by 04/06."""
    return clamp((meridian_speed_bp - BP) // 100, -35, 35)


def resolve_direct_damage(
    base_damage: int, attacker: MeridianProfile, defender: MeridianProfile,
    attack_route_length: int, *, defense_route_length: int = 0,
) -> tuple[int, int, int]:
    attack_mult = attack_meridian_mult_bp(attacker, defender, attack_route_length)
    defense_mult = (defense_meridian_mult_bp(defender, attacker, defense_route_length)
                    if defense_route_length else BP)
    after_defense = mul_bp_floor(base_damage, defense_mult)
    return mul_bp_floor(after_defense, attack_mult), attack_mult, defense_mult


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
DEFENSE_ROUTE = RouteSpec(
    "mfr_guard_release", "卸力护体", LONG_ROUTE.nodes[:6],
    (70,) * 6, (120,) * 6, False, "defense",
)
MOVEMENT_ROUTE = RouteSpec(
    "mfr_qinggong_cycle", "轻功周流", LONG_ROUTE.nodes[:4],
    (60,) * 4, (100,) * 4, False, "movement",
)

STANDARD_PROFILE = MeridianProfile(BP, BP, BP, BP)
STRONG_PROFILE = MeridianProfile(13_000, 12_500, 12_500, 9_500)
VERY_STRONG_PROFILE = MeridianProfile(17_000, 16_000, 15_500, BP)
WEAK_PROFILE = MeridianProfile(8_000, 8_500, 8_500, 8_000)
MOB_PROFILE = MeridianProfile(5_000, 5_500, 6_000, 6_000)


def make_units(master_seed: int = 20260927) -> dict[str, MeridianFlowModule]:
    del master_seed  # Unit state is seed-independent; Core owns battle RNG.
    all_nodes = tuple(dict.fromkeys(LONG_ROUTE.nodes + SHORT_ROUTE.nodes))
    return {
        "hero": MeridianFlowModule(
            "hero", Cultivation(9, 8, 12_100, "harmony", "yin", True, True, True, True, 3, 9_000),
            all_nodes, kind="hero", unit_index=0,
        ),
        "normal": MeridianFlowModule(
            "enemy_normal", Cultivation(5, 7, 9_000, "yang", "yang", practice_bp=6_200),
            all_nodes, kind="normal", unit_index=1, capacity_bp=9_000,
        ),
        "elite": MeridianFlowModule(
            "enemy_elite", Cultivation(7, 8, 10_500, "yin", "yin", True, practice_bp=7_500),
            all_nodes, kind="elite", unit_index=2, capacity_bp=10_500,
        ),
        "boss": MeridianFlowModule(
            "enemy_boss", Cultivation(10, 9, 13_000, "harmony", "harmony", True, True, True, True, 5, 9_500),
            all_nodes, kind="boss", unit_index=3, capacity_bp=13_000,
        ),
    }


def result_vector(result: FlowResult, base_damage: int) -> dict[str, object]:
    blocked = result.states[result.blocked_at] if result.blocked_at is not None else None
    return {
        "unitId": result.unit_id, "routeId": result.route_id,
        "completed": result.completed, "attempted": result.attempted,
        "routeQualityBp": result.route_quality_bp, "flowCt": result.flow_ct,
        "baseDamage": base_damage,
        "blockedAt": result.blocked_at, "blockedNode": result.blocked_node,
        "disabledReason": result.disabled_reason,
        "jamChancesBp": list(result.jam_chances_bp),
        "arrivalBp": list(result.arrival_bp), "stateVersion": result.state_version,
        "qualitiesBp": list(result.qualities_bp),
        "trace": contract_value(result.trace),
        "blockedState": contract_value(blocked) if blocked else None,
    }


def contract_value(value: object) -> object:
    if hasattr(value, "__dataclass_fields__"):
        value = asdict(value)
    if isinstance(value, dict):
        return {("acupointRef" if key == "acupoint" else key.split("_")[0]
                + "".join(part.title() for part in key.split("_")[1:])):
                contract_value(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [contract_value(item) for item in value]
    return value
def golden_payload() -> dict[str, object]:
    units = make_units()
    hero = units["hero"]
    battle_rng = Sfc32(20260927, "battle")
    preview_rng = list(battle_rng.snapshot())
    short = hero.preview(SHORT_ROUTE)
    assert list(battle_rng.snapshot()) == preview_rng
    long = hero.commit_with_rolls(LONG_ROUTE, [9_999] * 10)
    seeded_hero = make_units()["hero"]
    seeded = seeded_hero.commit(LONG_ROUTE, battle_rng)
    rng_after_hero = list(battle_rng.snapshot())
    normal = units["normal"].commit(SHORT_ROUTE, battle_rng); elite = units["elite"].commit(LONG_ROUTE, battle_rng); boss = units["boss"].commit(LONG_ROUTE, battle_rng)
    rng_after_units = list(battle_rng.snapshot())
    hero.apply_acupoint_seal(SHORT_ROUTE.nodes[0], 3)
    unseal = hero.regulate_breath(BreathProfile("txp_harmony_supreme", 12, 10, "harmony"), battle_rng=battle_rng, target_will=70, medical=60)

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
    defense_flow = make_units()["hero"].preview(DEFENSE_ROUTE)
    movement_flow = make_units()["hero"].preview(MOVEMENT_ROUTE)

    base_damage = {"normal": 849, "elite": 950, "boss": 2_574}
    matchups = {}
    for name, attacker, defender, hp, base in (
        ("equal", STANDARD_PROFILE, STANDARD_PROFILE, 3_970, 849),
        ("strongOneTier", STRONG_PROFILE, STANDARD_PROFILE, 8_000, 950),
        ("strongTwoTiers", VERY_STRONG_PROFILE, STANDARD_PROFILE, 170_773, 2_574),
        ("weakOneTier", WEAK_PROFILE, STANDARD_PROFILE, 3_970, 849),
        ("masterVsMob", VERY_STRONG_PROFILE, MOB_PROFILE, 2_200, 849),
    ):
        damage, attack_mult, defense_mult = resolve_direct_damage(
            base, attacker, defender, 10
        )
        team_equiv = 31_000 if name == "strongTwoTiers" else BP
        matchups[name] = {
            "attackerStrengthBp": meridian_strength_bp(attacker),
            "defenderStrengthBp": meridian_strength_bp(defender),
            "attackMultBp": attack_mult, "defenseMultBp": defense_mult,
            "baseDamage": base, "damage": damage, "targetHp": hp,
            "teamEquivBp": team_equiv,
            "ttkBeforeActions": ttk_actions(hp, base, team_equiv_bp=team_equiv),
            "ttkActions": ttk_actions(hp, damage, team_equiv_bp=team_equiv),
        }
    defended_damage, defended_attack, defended_mult = resolve_direct_damage(
        1_000, STANDARD_PROFILE, STRONG_PROFILE, 10, defense_route_length=6
    )
    guard_hold = inner_guard(1_000, STRONG_PROFILE, STANDARD_PROFILE, mp=2_000, reflect_bp=1_000)
    guard_break = inner_guard(1_600, STANDARD_PROFILE, VERY_STRONG_PROFILE, mp=300)
    guard_capacity_break = inner_guard(1_600, STANDARD_PROFILE, VERY_STRONG_PROFILE, mp=2_000)
    guard_kinds = {kind: inner_guard(1_000, STANDARD_PROFILE, STANDARD_PROFILE, damage_kind=kind)
                   for kind in ("unarmed", "weapon", "hidden", "projected")}
    equal_speed_bp = speed_meridian_mult_bp(STANDARD_PROFILE, STANDARD_PROFILE)
    strong_speed_bp = speed_meridian_mult_bp(VERY_STRONG_PROFILE, STANDARD_PROFILE)
    sealed_speed_bp = speed_meridian_mult_bp(VERY_STRONG_PROFILE, STANDARD_PROFILE, sealed=True)
    equal_speed = apply_speed(106, 6, equal_speed_bp)
    strong_speed = apply_speed(106, 6, strong_speed_bp)
    sealed_speed = apply_speed(106, 6, sealed_speed_bp)
    grappled_strong = apply_speed(106, 6, strong_speed_bp, grapple_bp=6_000)
    normalized_equal = normalize_profile((320, 1_240, 8_650, 4_230),
                                         (320, 1_240, 8_650, 4_230))
    action_cap = ceil_div(300 * 1_000, 500)
    payload: dict[str, object] = {
        "fixtureVersion": 2, "rulesProtocol": RULES_PROTOCOL, "rngProtocol": RNG_PROTOCOL,
        "masterSeed": 20260927,
        "inputs": {
            "routes": [contract_value(r) for r in (SHORT_ROUTE, LONG_ROUTE, NOVICE_ROUTE, FORCED_ROUTE, DEFENSE_ROUTE, MOVEMENT_ROUTE)],
            "units": {key: {
                "unitId": value.unit_id, "kind": value.kind,
                "unitIndex": value.unit_index,
                "capacityScaleBp": value.capacity_scale_bp, "cultivation": contract_value(value.cultivation),
                "openedAcupoints": sorted(value.nodes), "completeAcupoints": sorted(value.nodes) if value.cultivation.meridian_complete else [],
            } for key, value in units.items()},
            "explicitRolls": {"clean": 9_999, "forcedJam": 0},
        },
        "outputs": {
            "heroShortPreview": result_vector(short, base_damage["normal"]),
            "heroLongCommit": result_vector(long, base_damage["normal"]),
            "heroSeededCommit": result_vector(seeded, base_damage["normal"]),
            "battleRngBefore": preview_rng, "battleRngAfterHeroCommit": rng_after_hero,
            "battleRngAfterAllUnitCommits": rng_after_units, "battleRngAfterSelfUnseal": list(battle_rng.snapshot()),
            "normalShort": result_vector(normal, base_damage["normal"]),
            "eliteLong": result_vector(elite, base_damage["elite"]),
            "bossLong": result_vector(boss, base_damage["boss"]),
            "jammed": result_vector(jam, base_damage["normal"]),
            "ruptured": result_vector(rupture, base_damage["normal"]),
            "breath": contract_value(breath), "selfUnseal": contract_value(unseal), "selfUnsealLevelAfter": hero.nodes[SHORT_ROUTE.nodes[0]].seal_level,
            "sealed": result_vector(sealed, base_damage["normal"]),
            "defenseRouteFlow": result_vector(defense_flow, base_damage["normal"]),
            "movementRouteFlow": result_vector(movement_flow, base_damage["normal"]),
            "matchups": matchups,
            "normalization": {"rawAndStandard": [320, 1_240, 8_650, 4_230],
                              "equalProfile": contract_value(normalized_equal),
                              "equalStrengthBp": meridian_strength_bp(normalized_equal)},
            "defenseRoute": {"incoming": 1_000, "attackMultBp": defended_attack,
                             "defenseMultBp": defended_mult, "damage": defended_damage},
            "innerGuardHold": contract_value(guard_hold), "innerGuardBreak": contract_value(guard_break),
            "innerGuardCapacityBreak": contract_value(guard_capacity_break),
            "innerGuardKinds": {kind: contract_value(result) for kind, result in guard_kinds.items()},
            "speed": {"equal": {"multBp": equal_speed_bp, "spd": equal_speed[0],
                                     "move": equal_speed[1], "openingQinggong": project_opening_qinggong(98, equal_speed_bp),
                                     "evadeRatingDelta": evade_rating_delta(equal_speed_bp)},
                      "strong": {"multBp": strong_speed_bp, "spd": strong_speed[0],
                                      "move": strong_speed[1], "openingQinggong": project_opening_qinggong(98, strong_speed_bp),
                                      "evadeRatingDelta": evade_rating_delta(strong_speed_bp)},
                      "sealed": {"multBp": sealed_speed_bp, "spd": sealed_speed[0],
                                      "move": sealed_speed[1], "openingQinggong": project_opening_qinggong(98, sealed_speed_bp),
                                      "evadeRatingDelta": evade_rating_delta(sealed_speed_bp)},
                      "grappledStrong": {"multBp": strong_speed_bp, "grappleMoveBp": 6_000,
                                          "spd": grappled_strong[0], "move": grappled_strong[1],
                                          "openingQinggong": project_opening_qinggong(
                                              98, mul_bp_floor(strong_speed_bp, 6_000)),
                                          "evadeRatingDelta": evade_rating_delta(strong_speed_bp)},
                      "maxActionsPer1000Ticks": action_cap},
            "grapple1": contract_value(grapple_effect(1)), "grapple9": contract_value(grapple_effect(9)),
            "escapeLevel6Bp": grapple_escape_bp(6, 70, 65, 75, 70, 8),
            "point1": contract_value(point_effect(1)), "point9": contract_value(point_effect(9)),
        },
    }
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    payload["vectorSha256"] = sha256(canonical.encode("utf-8")).hexdigest()
    return payload


def _cycle_sensitivity(
    label: str, *, capacity_scale_bp: int = BP, risk_scale_bp: int = BP,
    relief_scale_bp: int = BP, strength_scale_bp: int = BP, ct_scale_bp: int = BP,
) -> dict[str, int | str]:
    route = replace(
        LONG_ROUTE,
        segment_ct=tuple(max(1, mul_bp_floor(v, ct_scale_bp)) for v in LONG_ROUTE.segment_ct),
        risk_bp=tuple(mul_bp_floor(v, risk_scale_bp) for v in LONG_ROUTE.risk_bp),
    )
    attacks = breath_actions = total_ct = total_damage = 0
    battle_rng = Sfc32(20260927, "battle")
    for sample in range(64):
        unit = make_units(20260927 + sample * 17)["hero"]
        for key in sorted(unit.nodes):
            node = unit.nodes[key]
            unit.nodes[key] = replace(node, capacity=mul_bp_floor(node.capacity, capacity_scale_bp))
        for _ in range(18):
            disabled = unit.preview(route).disabled_reason
            bad = sum(n.stagnation_bp for n in unit.nodes.values())
            if disabled or bad >= 3_000 or any(n.ruptured for n in unit.nodes.values()):
                breath = unit.regulate_breath(BreathProfile("txp_sensitivity", 9, 8, "harmony"), potency_bp=relief_scale_bp)
                breath_actions += 1; total_ct += breath.ct
            else:
                result = unit.commit(route, battle_rng)
                attacks += 1; total_ct += clamp(1_200 + result.flow_ct, 500, 2_000)
                route_quality = mul_bp_floor(result.route_quality_bp, strength_scale_bp)
                attacker = MeridianProfile(
                    BP, BP, BP, relative_component_bp(route_quality, 6_302, 0))
                damage, _, _ = resolve_direct_damage(849, attacker, STANDARD_PROFILE, len(route.nodes))
                total_damage += damage
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
        _cycle_sensitivity("路线质量−20%", strength_scale_bp=8_000),
        _cycle_sensitivity("路线质量基准"),
        _cycle_sensitivity("路线质量+20%", strength_scale_bp=12_000),
        _cycle_sensitivity("单段CT−20%", ct_scale_bp=8_000),
        _cycle_sensitivity("单段CT基准"),
        _cycle_sensitivity("单段CT+20%", ct_scale_bp=12_000),
    ]


def run_checks() -> None:
    reaches = [route_reach_bp(n) for n in range(1, 19)]
    assert all(a < b for a, b in zip(reaches, reaches[1:])), reaches
    assert reaches[0] == 3_388 and reaches[-1] == BP
    ratios = (5_000, 6_500, 8_000, BP, 12_000, 15_000, 18_000, 22_000)
    attack_curve = [lerp_anchors(r, ATTACK_CURVE) for r in ratios]
    defense_curve = [lerp_anchors(r, DEFENSE_CURVE) for r in ratios]
    assert all(a <= b for a, b in zip(attack_curve, attack_curve[1:]))
    assert all(a >= b for a, b in zip(defense_curve, defense_curve[1:]))
    assert attack_curve[0] == 6_500 and attack_curve[-1] == 22_000
    assert defense_curve[0] == 12_500 and defense_curve[-1] == 5_000
    raw = (320, 1_240, 8_650, 4_230)
    normalized = normalize_profile(raw, raw)
    assert normalized == STANDARD_PROFILE and meridian_strength_bp(normalized) == BP
    assert normalize_profile((320, 1_240, 8_650, 0), raw).completion_bp == 0
    assert meridian_strength_bp(MeridianProfile(0, 99_999, 0, 99_999)) == 10_300
    assert attack_meridian_mult_bp(STANDARD_PROFILE, STANDARD_PROFILE, 10) == BP
    assert defense_meridian_mult_bp(STANDARD_PROFILE, STANDARD_PROFILE, 6) == BP
    speed_edge = [speed_meridian_mult_bp(MeridianProfile(4_000, 4_000, 4_000, quality), STANDARD_PROFILE) for quality in (3, 4)]
    assert speed_edge == [7_500, 7_500], speed_edge  # no raw-quality second blend / 1 bp reversal
    for component in range(4):
        profiles = [MeridianProfile(*(v if i == component else BP for i in range(4))) for v in range(0 if component == 3 else 4_000, 18_001, 100)]
        for length in (1, 6, 10, 18):
            values = [(attack_meridian_mult_bp(p, STANDARD_PROFILE, length), defense_meridian_mult_bp(p, STANDARD_PROFILE, length), attack_meridian_mult_bp(STANDARD_PROFILE, p, length), defense_meridian_mult_bp(STANDARD_PROFILE, p, length), speed_meridian_mult_bp(p, STANDARD_PROFILE)) for p in profiles]
            assert all(a[0] <= b[0] and a[1] >= b[1] and a[2] >= b[2] and a[3] <= b[3] and a[4] <= b[4] for a, b in zip(values, values[1:])), (component, length)
    units = make_units()
    hero = units["hero"]
    battle_rng = Sfc32(20260927, "battle")
    rng_before = battle_rng.snapshot()
    clean = hero.preview(RouteSpec("mfr_timing", "时序", LONG_ROUTE.nodes[:4],
                                    (55, 65, 75, 85), (0, 0, 0, 0)))
    assert clean.flow_ct == 280 and clean.completed == 4
    assert battle_rng.snapshot() == rng_before and hero.snapshot()["unitId"] == "hero"

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
    sealed_rng = battle_rng.snapshot()
    for out_of_battle in (False, True):
        try:
            sealed.regulate_breath(
                BreathProfile("txp_check", 12, 10, "harmony"),
                battle_rng=battle_rng if out_of_battle else None,
                out_of_battle=out_of_battle,
            )
        except ValueError as exc:
            assert "level 9" in str(exc)
        else:
            raise AssertionError("level 9 point seal must block self regulation")
    assert battle_rng.snapshot() == sealed_rng

    unopened = MeridianFlowModule(
        "closed", Cultivation(5, 5), SHORT_ROUTE.nodes,
        opened_acupoints={SHORT_ROUTE.nodes[0]},
    )
    assert unopened.preview(SHORT_ROUTE).disabled_reason == "unopened_node"

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
    assert duration_unit.nodes[SHORT_ROUTE.nodes[0]].seal_level == 0 and duration_unit.state_version == 3

    # Hero, normal, elite and Boss really own separate state and all calculate routes.
    vectors = golden_payload()["outputs"]
    assert vectors["heroLongCommit"]["routeQualityBp"] > 0  # type: ignore[index]
    assert vectors["heroShortPreview"]["routeQualityBp"] > 0  # type: ignore[index]
    for key in ("normalShort", "eliteLong", "bossLong"):
        assert vectors[key]["attempted"] > 0  # type: ignore[index]
    assert vectors["defenseRouteFlow"]["attempted"] == len(DEFENSE_ROUTE.nodes)
    assert vectors["movementRouteFlow"]["attempted"] == len(MOVEMENT_ROUTE.nodes)
    assert vectors["battleRngAfterHeroCommit"] != vectors["battleRngAfterAllUnitCommits"]
    assert vectors["selfUnseal"]["sealsReduced"] == 1 and vectors["battleRngAfterAllUnitCommits"] != vectors["battleRngAfterSelfUnseal"]  # type: ignore[index]
    assert units["normal"].nodes is not units["elite"].nodes

    # Standard versus standard is neutral; strength gaps are steep and bounded.
    matchups = vectors["matchups"]  # type: ignore[assignment]
    assert matchups["equal"]["attackMultBp"] == BP
    ordered = [matchups[k]["attackMultBp"] for k in
               ("weakOneTier", "equal", "strongOneTier", "strongTwoTiers", "masterVsMob")]
    assert all(a < b for a, b in zip(ordered, ordered[1:])), ordered
    assert all(6_500 <= value <= 22_000 for value in ordered)
    assert 3 <= matchups["equal"]["ttkActions"] <= 5
    assert matchups["equal"]["ttkBeforeActions"] == matchups["equal"]["ttkActions"]
    assert matchups["strongOneTier"]["ttkBeforeActions"] == 9
    assert matchups["strongTwoTiers"]["ttkBeforeActions"] == 22
    assert matchups["weakOneTier"]["ttkBeforeActions"] == 5
    assert matchups["masterVsMob"]["ttkBeforeActions"] == 3
    assert matchups["masterVsMob"]["ttkActions"] <= 2
    assert vectors["defenseRoute"]["defenseMultBp"] < BP
    assert vectors["defenseRoute"]["damage"] == 861  # Z4M before Z5M.
    assert vectors["innerGuardHold"]["cancelled"] > 0
    assert vectors["innerGuardBreak"]["broken"]
    assert vectors["innerGuardCapacityBreak"]["broken"]
    assert vectors["innerGuardCapacityBreak"]["cancelled"] == 1_000
    assert vectors["innerGuardBreak"]["delayCt"] > 0
    assert vectors["innerGuardBreak"]["stagnationBp"] > 0
    for key in ("innerGuardHold", "innerGuardBreak", "innerGuardCapacityBreak"):
        guard = vectors[key]
        assert guard["damageBeforeMpGuard"] + guard["cancelled"] in (1_000, 1_600)
        assert 0 <= 2 * guard["mpSpent"] - guard["cancelled"] <= 1
    assert [vectors["innerGuardKinds"][kind]["eligibleIncoming"] for kind in
            ("unarmed", "weapon", "hidden", "projected")] == [1_000, 250, 0, 400]
    assert vectors["speed"]["equal"] == {
        "multBp": BP, "spd": 106, "move": 6, "openingQinggong": 98,
        "evadeRatingDelta": 0}
    assert vectors["speed"]["strong"]["spd"] > 106
    assert vectors["speed"]["strong"]["openingQinggong"] > 98
    assert vectors["speed"]["strong"]["evadeRatingDelta"] > 0
    assert vectors["speed"]["sealed"]["spd"] < 106
    assert vectors["speed"]["sealed"]["openingQinggong"] < 98
    assert vectors["speed"]["sealed"]["evadeRatingDelta"] < 0
    assert vectors["speed"]["grappledStrong"]["spd"] < 106
    assert vectors["speed"]["grappledStrong"]["evadeRatingDelta"] == 22
    assert vectors["speed"]["maxActionsPer1000Ticks"] <= 600

    # Unit snapshot/restore is exact; BattleSession snapshots the shared RNG.
    snap = hero.snapshot()
    hero.apply_grapple(6)
    hero.tick()
    hero.restore(snap)
    assert hero.snapshot() == snap
    rng_snapshot = battle_rng.snapshot()
    hero.commit(SHORT_ROUTE, battle_rng)
    assert battle_rng.snapshot() != rng_snapshot

    sensitivity = {row["case"]: row for row in sensitivity_rows()}
    assert sensitivity["路线质量−20%"]["averageDamage"] <= sensitivity["路线质量基准"]["averageDamage"]
    assert sensitivity["路线质量基准"]["averageDamage"] <= sensitivity["路线质量+20%"]["averageDamage"]
    assert sensitivity["单段CT−20%"]["attackFrequencyBp"] >= sensitivity["单段CT基准"]["attackFrequencyBp"]
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


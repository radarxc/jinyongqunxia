#!/usr/bin/env python3
"""Audit martial-arts catalog ultimate and meridian declarations.

The catalogs are Markdown, but their machine-facing rows use a small set of
stable tokens (``sk_*``, ``mv_*``, ``mfr_*`` and ``txp_*``).  This checker
parses those tokens without treating prose as a second gameplay source of
truth.  ``MoveDef.ultimate`` in a move card is authoritative; route flags are
only mirrors.  Concrete steps for each ``mfr_*`` may be defined only once
across all catalog paths passed to one invocation.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[2]
CATALOG_DIR = ROOT / "docs" / "design" / "catalog"
CATALOG_NAMES = (
    "shaolin", "daojia", "general", "wujue", "xiaoyao",
    "yitian", "xiake-bixue", "wuyue", "kangxi", "qianlong",
    "gulong",
)
CATALOG_PATHS = tuple(CATALOG_DIR / f"skills-{name}.md" for name in CATALOG_NAMES)
ACUPOINT_REGISTRY = ROOT / "docs" / "design" / "15-meridians-and-acupoints.md"

# Canon/design-05 quotas, recorded here so CI catches a catalog silently
# changing both its move cards and its route mirror in the same patch.
EXPECTED = {
    "shaolin": {"天": (3, 7), "地": (26, 44), "玄上": (10, 10)},
    "daojia": {"天": (8, 21), "地": (18, 24), "玄上": (22, 22)},
    "general": {"天": (0, 0), "地": (19, 29), "玄上": (17, 17)},
    "wujue": {"天": (13, 29), "地": (23, 29), "玄上": (27, 27)},
    "xiaoyao": {"天": (10, 22), "地": (14, 19), "玄上": (26, 26)},
    "yitian": {"天": (4, 9), "地": (12, 16), "玄上": (16, 16)},
    "xiake-bixue": {"天": (4, 9), "地": (12, 13), "玄上": (12, 12)},
    "wuyue": {"天": (4, 9), "地": (12, 14), "玄上": (15, 15)},
    "kangxi": {"天": (2, 4), "地": (14, 23), "玄上": (9, 9)},
    "qianlong": {"天": (3, 6), "地": (9, 13), "玄上": (10, 10)},
    "gulong": {"天": (0, 0), "地": (10, 19), "玄上": (26, 26)},
}
GRADE_LABELS = {
    "黄下": 1, "黄中": 2, "黄上": 3, "玄下": 4, "玄中": 5,
    "玄上": 6, "地下": 7, "地中": 8, "地上": 9, "天下": 10,
    "天中": 11, "天上": 12,
}
OLD_BUFFS = ("bf_fengxue", "bf_fengnei", "bf_fengjingmai", "bf_chanrao")
EXPLANATION_HINTS = ("迁移", "旧 ID", "旧ID", "兼容", "替换为", "历史")
EXTERNAL_WUJUE = {
    "mv_xianglong18_lianhuan": ("sk_xianglong18", "mfr_eighteen_palms_chain", 12),
    "mv_xianglong18_shenlong": ("sk_xianglong18", "mfr_xianglong18_shenlong", 12),
    "mv_xianglong18_zhenjing": ("sk_xianglong18", "mfr_xianglong18_zhenjing", 12),
}
# Cross-document exception source: design/05 §13.1 lines 1816--1859 owns
# the three MoveDefs; design/21 §12.1 lines 1261--1315 owns their routes.
EXTERNAL_LAYERS = {
    "mv_xianglong18_lianhuan": 7,
    "mv_xianglong18_shenlong": 9,
    "mv_xianglong18_zhenjing": 10,
}
ULTIMATE_QUOTA = {6: (1, 1), 7: (1, 1), 8: (1, 2), 9: (2, 2),
                  10: (2, 2), 11: (2, 3), 12: (3, 3)}
AUDIT_VERSION = "图鉴一致性审计（2026-09-28）"


@dataclass
class BodyMove:
    move_id: str
    skill_id: str | None
    line: int
    ultimate: bool | None
    layer: int | None
    rage: int | None
    mp_pct: int | None
    cd: int | None
    recovery: int | None
    visible_layer: int | None = None
    visible_mp_pct: int | None = None
    visible_cd: int | None = None
    visible_recovery: int | None = None


@dataclass
class RouteMirror:
    move_id: str
    route_id: str
    skill_id: str | None
    line: int
    ultimate: bool
    signature: tuple[str, ...] | None = None
    explicit_move_ref: bool = True
    template: str | None = None


@dataclass
class FinalInstance:
    move_id: str
    skill_id: str
    route_id: str
    grade: int
    line: int
    layer: int | None
    body_ultimate: bool | None
    route_ultimate: bool | None
    rage: int | None
    mp_pct: int | None
    cd: int | None
    recovery: int | None
    signature: tuple[str, ...]
    segment_ct: tuple[int, ...] = ()
    risks: tuple[int, ...] = ()


@dataclass(frozen=True)
class RouteStepDefinition:
    route_id: str
    source: str
    line: int
    steps: tuple[str, ...]

    @property
    def location(self) -> str:
        return f"{self.source}:{self.line}"


@dataclass
class CatalogAudit:
    name: str
    tier_counts: dict[str, dict[str, int]] = field(default_factory=dict)
    body_ultimate_count: int = 0
    route_ultimate_count: int = 0
    unlock_violations: int = 0
    duplicate_routes: int = 0
    implicit_routes: int = 0
    missing_out_of_battle_scale: int = 0
    old_buff_runtime_refs: int = 0
    body_index_mismatches: int = 0
    duplicate_step_definitions: int = 0
    errors: list[str] = field(default_factory=list)


def catalog_name(path: Path) -> str:
    return path.stem.removeprefix("skills-")


def grade_tier(grade: int | None) -> str | None:
    if grade is None:
        return None
    if grade >= 10:
        return "天"
    if grade >= 7:
        return "地"
    if grade == 6:
        return "玄上"
    return "低阶"


def _grade_from_line(line: str) -> int | None:
    # Both ``12 天上`` and ``天上 12`` occur; compact cards often omit a space.
    for label, number in GRADE_LABELS.items():
        if re.search(rf"(?:{number}\s*{label}|{label}\s*{number})", line):
            return number
    return None


def parse_skill_grades(text: str) -> tuple[dict[str, int], dict[str, int]]:
    """Return skill->grade and the first defining line for each skill."""
    grades: dict[str, int] = {}
    lines: dict[str, int] = {}
    current: str | None = None
    for number, line in enumerate(text.splitlines(), 1):
        ids = re.findall(r"sk_[a-z0-9_]+", line)
        grade = _grade_from_line(line)
        if ids and grade is not None:
            # The first ID in a heading/card is the card owner.  References in
            # prerequisite prose are later in the same row and never win.
            current = ids[0]
            grades.setdefault(current, grade)
            lines.setdefault(current, number)
        elif re.match(r"^#{2,4} ", line) and not ids:
            current = None
    return grades, lines


def _line_has_explicit_ultimate(line: str) -> bool | None:
    if re.search(r"ultimate\s*[:：]\s*true", line, re.I):
        return True
    if re.search(r"ultimate\s*[:：]\s*false", line, re.I):
        return False
    # A card's ``（绝招）`` label is accepted only as a locator.  Strict mode
    # later requires the actual boolean token for every final ultimate.
    if re.search(r"(?:（绝招[^）]*）|绝招[；，,)]|绝招\*\*|·绝招(?:·|\s|$))", line):
        return None
    return False


def _move_match(line: str, move_id: str) -> re.Match[str] | None:
    """Match a move ID without accepting a longer ID with this prefix."""
    return re.search(re.escape(move_id) + r"(?![a-z0-9_])", line)


def _local_move_fragment(line: str, move_id: str) -> str:
    """Return only the compact clause owned by one move ID."""
    move_match = _move_match(line, move_id)
    if move_match is None:
        return line
    start = move_match.start()
    candidates = [pos for pos in (
        line.find("；", start), line.find("; mv_", start),
        line.find("|", start),
    ) if pos >= 0]
    end = min(candidates) if candidates else len(line)
    return line[start:end]


def _parse_layer(line: str, move_id: str) -> int | None:
    explicit = _resource_value(line, ("unlock",))
    if explicit is not None:
        return explicit
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if line.lstrip().startswith("|"):
        for i, cell in enumerate(cells):
            if _move_match(cell, move_id):
                for candidate in cells[i + 1:i + 3]:
                    m = re.fullmatch(r"`?(10|[1-9])(?:\s*重)?`?", candidate)
                    if m:
                        return int(m.group(1))
    move_match = _move_match(line, move_id)
    pos = move_match.start() if move_match else -len(move_id)
    tail = line[pos + len(move_id):pos + len(move_id) + 100]
    patterns = (r"[（(](?:L|第)?\s*(10|[1-9])(?:\s*重)?[）)]",
                r"(?:L|第)\s*(10|[1-9])\s*重?", r"（(10|[1-9])）")
    for pattern in patterns:
        match = re.search(pattern, tail, re.I)
        if match:
            return int(match.group(1))
    # Compact cards use a local ``_suffix`` and therefore do not contain the
    # expanded move ID.  Their fragment is already isolated by the caller.
    match = re.search(r"[（(](?:L|第)?\s*(10|[1-9])(?:\s*重)?(?:[·，,；;）)]|$)", line, re.I)
    if match:
        return int(match.group(1))
    return None


def _resource_value(line: str, keys: tuple[str, ...]) -> int | None:
    for key in keys:
        match = re.search(rf"{key}\s*[:：]?\s*(?:`)?(\d+)", line, re.I)
        if match:
            return int(match.group(1))
    return None


def _table_resources(line: str, move_id: str) -> tuple[int | None, int | None]:
    """Extract mp percentage and recovery from slash-style move rows."""
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    for cell in cells:
        match = re.fullmatch(r"`?(\d+)%\s*/\s*(?:—|-|绝|0|\d+)\s*/\s*(\d+)`?", cell)
        if match:
            return int(match.group(1)), int(match.group(2))
    move_match = _move_match(line, move_id)
    pos = move_match.start() if move_match else 0
    tail = line[pos:]
    match = re.search(
        r"(\d+)%\s*[/·]\s*(?:—|-|绝|0|\d+|气势\s*\d+)\s*[/·]\s*(\d+)",
        tail,
    )
    if match:
        return int(match.group(1)), int(match.group(2))
    match = re.search(r"(\d+)%[^｜|]{0,40}(?:收招|recovery)\s*[:：]?\s*(\d+)", tail, re.I)
    if match:
        return int(match.group(1)), int(match.group(2))
    # Some wide tables split MP/cooldown/recovery over adjacent cells.
    for i, cell in enumerate(cells):
        if re.fullmatch(r"`?\d+%`?", cell):
            for candidate in cells[i + 1:i + 4]:
                if re.fullmatch(r"`?(?:800|900|1000|1100|1200)`?", candidate):
                    return int(re.search(r"\d+", cell).group()), int(re.search(r"\d+", candidate).group())
            return int(re.search(r"\d+", cell).group()), None
    return None, None


def _visible_resources(
    line: str, move_id: str
) -> tuple[int | None, int | None, int | None, int | None]:
    """Read human-visible values after removing the inline MoveDef."""
    visible = re.sub(r"MoveDef\{[^}]*\}", "", line)
    if not _move_match(visible, move_id):
        suffix = "_" + move_id.split("_")[-1]
        suffix_match = re.search(
            rf"(?<![a-z0-9_]){re.escape(suffix)}(?![a-z0-9_])", visible
        )
        if suffix_match is None:
            return None, None, None, None
        visible = visible[suffix_match.start():]
    layer = _parse_layer(visible, move_id)
    mp_pct, recovery = _table_resources(visible, move_id)
    move_match = _move_match(visible, move_id)
    tail = visible[move_match.start():] if move_match else visible
    mp_pct = _resource_value(tail, ("耗内",)) or mp_pct
    recovery = _resource_value(tail, ("收招",)) or recovery
    slash = re.search(
        r"(\d+)%\s*[/·]\s*(—|-|绝|\d+|气势\s*\d+)\s*[/·]\s*(\d+)", tail
    )
    cd = None
    if slash:
        cd = int(slash.group(2)) if slash.group(2).isdigit() else 0
    else:
        cd = _resource_value(tail, ("cd",))
    return layer, mp_pct, cd, recovery


def _compact_fragment(line: str, suffix: str) -> str | None:
    """Return the one move clause containing a compact ``_suffix``."""
    token = re.compile(rf"(?<![a-z0-9_]){re.escape(suffix)}(?![a-z0-9_])")
    for fragment in re.split(r"[｜|]", line):
        if token.search(fragment):
            return fragment
    return line if token.search(line) else None


def _route_resource(route_line: int, text_lines: list[str]) -> tuple[int | None, int | None, int | None, int | None]:
    """Read unlock/rage/mp/recovery from an explicit final-route row."""
    line = text_lines[route_line - 1]
    # Final tables use ``unlock / true / 100 / 10% / 0 / 1200``.
    match = re.search(
        r"`?(10|[1-9])\s*/\s*true\s*/\s*(\d+)\s*/\s*(\d+)%\s*/\s*(?:0|—|-)\s*/\s*(\d+)`?",
        line, re.I,
    )
    if match:
        return tuple(map(int, match.groups()))  # type: ignore[return-value]
    return None, None, None, None


def parse_body_moves(text: str, route_mirrors: dict[str, RouteMirror] | None = None) -> dict[str, BodyMove]:
    grades, _ = parse_skill_grades(text)
    result: dict[str, BodyMove] = {}
    current_skill: str | None = None
    in_audit_projection = False
    for number, line in enumerate(text.splitlines(), 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        if in_audit_projection:
            continue
        skill_ids = re.findall(r"sk_[a-z0-9_]+", line)
        owner = next((item for item in skill_ids if item in grades), None)
        if owner and _grade_from_line(line) is not None:
            current_skill = owner
        for move_id in dict.fromkeys(re.findall(r"mv_[a-z0-9_]+", line)):
            if "绝招" not in line and "ultimate" not in line:
                continue
            # A normal Markdown move row has one move ID and puts the boolean
            # in a later cell.  Compact prose can contain several moves, in
            # which case only the move's own semicolon-delimited clause counts.
            move_ids = re.findall(r"mv_[a-z0-9_]+", line)
            fragment = line if len(set(move_ids)) == 1 else _local_move_fragment(line, move_id)
            if "mfr_" in line and "MoveDef{" not in line:
                continue
            explicit = _line_has_explicit_ultimate(fragment)
            layer = _parse_layer(fragment, move_id)
            mp_pct, recovery = _table_resources(fragment, move_id)
            rage = _resource_value(line, ("rageCost", "气势"))
            recovery = recovery or _resource_value(line, ("recovery", "收招"))
            result[move_id] = BodyMove(
                move_id, current_skill, number, explicit, layer, rage, mp_pct,
                _resource_value(fragment, ("cd",)), recovery
            )
    # Compact catalogs sometimes mark an ultimate using prose only.  Route
    # mirrors let us locate those rows, but never decide the truth value: the
    # body still has to contain the literal ``ultimate:true`` to pass V-M01.
    if route_mirrors:
        all_lines = text.splitlines()
        for move_id, route in route_mirrors.items():
            if not route.ultimate or move_id in result:
                continue
            for number, line in enumerate(all_lines, 1):
                if not _move_match(line, move_id) or number >= route.line or "mfr_" in line:
                    continue
                flag = _line_has_explicit_ultimate(line)
                if flag is False and "绝招" not in line:
                    continue
                mp_pct, recovery = _table_resources(line, move_id)
                result[move_id] = BodyMove(
                    move_id, route.skill_id, number, flag, _parse_layer(line, move_id),
                    _resource_value(line, ("rageCost", "气势")), mp_pct,
                    _resource_value(line, ("cd",)),
                    recovery or _resource_value(line, ("recovery", "收招")),
                )
                break
    return result


def _route_flag(fragment: str) -> bool | None:
    match = re.search(r"/\s*(true|false)\s*/", fragment, re.I)
    if match:
        return match.group(1).lower() == "true"
    match = re.search(r"(?:^|[|`\s])\s*(是|否)\s*[／/]", fragment)
    if match:
        return match.group(1) == "是"
    match = re.search(r"(?:资源字段|unlock[^|]*)[^|]*[/|]\s*(true|false)\s*[/|]", fragment, re.I)
    if match:
        return match.group(1).lower() == "true"
    match = re.search(r"ultimate\s*[:：]\s*(true|false)", fragment, re.I)
    if match:
        return match.group(1).lower() == "true"
    return None


def parse_final_instances(text: str) -> dict[str, FinalInstance]:
    """Read normalized final-instance rows between explicit markers."""
    result: dict[str, FinalInstance] = {}
    active = False
    for number, line in enumerate(text.splitlines(), 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            active = True
            continue
        if "<!-- skill-catalog-audit:end -->" in line:
            active = False
            continue
        if not active or not line.startswith("|"):
            continue
        skills = re.findall(r"sk_[a-z0-9_]+", line)
        moves = re.findall(r"mv_[a-z0-9_]+", line)
        routes = re.findall(r"mfr_[a-z0-9_]+", line)
        points = tuple(re.findall(r"ap_[a-z0-9_]+", line))
        if len(skills) != 1 or len(set(moves)) != 1 or len(set(routes)) != 1 or not points:
            continue
        grade = _grade_from_line(line)
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if grade is None or len(cells) < 5:
            continue
        body_cell = next((cell for cell in cells if "MoveDef{" in cell), "")
        route_cell = next((cell for cell in cells if "MeridianRouteDef{" in cell), "")
        if not body_cell or not route_cell:
            continue
        triples = re.findall(r"(ap_[a-z0-9_]+)/(\d+)/(\d+)", line)
        result[moves[0]] = FinalInstance(
            move_id=moves[0], skill_id=skills[0], route_id=routes[0], grade=grade,
            line=number, layer=_resource_value(body_cell, ("unlock",)),
            body_ultimate=_line_has_explicit_ultimate(body_cell),
            route_ultimate=_line_has_explicit_ultimate(route_cell),
            rage=_resource_value(body_cell, ("rageCost",)),
            mp_pct=_resource_value(body_cell, ("mpCost",)),
            cd=_resource_value(body_cell, ("cd",)),
            recovery=_resource_value(body_cell, ("recovery",)), signature=points,
            segment_ct=tuple(int(item[1]) for item in triples),
            risks=tuple(int(item[2]) for item in triples),
        )
    return result


def _explicit_signature(line: str) -> tuple[str, ...] | None:
    points = re.findall(r"ap_[a-z0-9_]+", line)
    return tuple(points) if points else None


def parse_route_step_definitions(
    text: str, source: str
) -> list[RouteStepDefinition]:
    """Return every concrete ``mfr_*`` step definition with its location.

    All supported catalog layouts put one route ID and its ordered ``ap_*``
    sequence on the same Markdown table row.  Rows that only name an ID (for
    example ``见文首索引``) have no acupoints and therefore remain references.
    A list is intentional: dictionaries would hide the duplicate occurrences
    that this rule exists to diagnose.
    """
    result: list[RouteStepDefinition] = []
    for number, line in enumerate(text.splitlines(), 1):
        if not line.lstrip().startswith("|"):
            continue
        route_ids = list(dict.fromkeys(re.findall(r"mfr_[a-z0-9_]+", line)))
        steps = tuple(re.findall(r"ap_[a-z0-9_]+", line))
        if len(route_ids) != 1 or not steps:
            continue
        result.append(RouteStepDefinition(route_ids[0], source, number, steps))
    return result


def _route_template(fragment: str) -> str | None:
    """Return a legacy layout code used to derive a route skeleton."""
    patterns = (
        r"(?:AT|DF|MV|U)-[YIH]\d+",
        r"[KQG]-[A-Z0-9]+",
        r"[ADM]\d+[YIH]",
        r"[YAIH]\d+U",
    )
    for pattern in patterns:
        match = re.search(pattern, fragment)
        if match:
            return match.group(0)
    return None


def parse_route_mirrors(text: str) -> dict[str, RouteMirror]:
    result: dict[str, RouteMirror] = {}
    current_skill: str | None = None
    lines = text.splitlines()
    in_audit_projection = False
    for number, line in enumerate(lines, 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
            continue
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        if in_audit_projection:
            continue
        skill_ids = re.findall(r"sk_[a-z0-9_]+", line)
        if skill_ids and (line.startswith("|") or line.startswith("#")):
            current_skill = skill_ids[0]
        # Explicit move -> route slash declarations (the dominant format).
        pair_pattern = re.compile(
            r"(mv_[a-z0-9_]+)\s*→\s*(mfr_[a-z0-9_]+)([^；|]*)"
        )
        for match in pair_pattern.finditer(line):
            move_id, route_id, tail = match.groups()
            flag = _route_flag(tail)
            if flag is None:
                continue
            signature = _explicit_signature(line)
            result[move_id] = RouteMirror(
                move_id, route_id, current_skill, number, flag, signature, True,
                _route_template(tail),
            )

        # Four-column route tables put move and route in separate cells, then
        # use 是/否 in the fourth column.
        move_ids = re.findall(r"mv_[a-z0-9_]+", line)
        route_ids = re.findall(r"mfr_[a-z0-9_]+", line)
        flag = _route_flag(line)
        if len(move_ids) == len(route_ids) == 1 and flag is not None:
            move_id, route_id = move_ids[0], route_ids[0]
            result[move_id] = RouteMirror(
                move_id, route_id, current_skill, number, flag,
                _explicit_signature(line), True, _route_template(line),
            )

        # Legacy wujue/xiaoyao indexes omitted moveRef and derived it from mfr.
        for match in re.finditer(r"(mfr_[a-z0-9_]+)([^；|]*)", line):
            route_id, tail = match.groups()
            flag = _route_flag(tail)
            if flag is None or route_id in {r.route_id for r in result.values()}:
                continue
            move_id = "mv_" + route_id.removeprefix("mfr_")
            result[move_id] = RouteMirror(
                move_id, route_id, current_skill, number, flag,
                _explicit_signature(line), False, _route_template(line),
            )
    return result


def parse_target_routes(text: str, name: str = "") -> dict[str, RouteMirror]:
    """Return the legacy declaration of every intended final ultimate.

    Three catalogs originally put their grade-6 final choices in a table whose
    heading states that every row is an ultimate, rather than repeating a
    boolean in every row.  That omission is an audit finding, but the rows are
    still needed to freeze the pre-fix target set.
    """
    grades, _ = parse_skill_grades(text)
    result = {
        move_id: route for move_id, route in parse_route_mirrors(text).items()
        if route.ultimate
    }
    for number, line in enumerate(text.splitlines(), 1):
        skills = list(dict.fromkeys(re.findall(r"sk_[a-z0-9_]+", line)))
        moves = list(dict.fromkeys(re.findall(r"mv_[a-z0-9_]+", line)))
        routes = list(dict.fromkeys(re.findall(r"mfr_[a-z0-9_]+", line)))
        if len(skills) != 1 or len(moves) != 1 or len(routes) != 1:
            continue
        if grades.get(skills[0]) == 6:
            if re.search(r"(?:A|D|M)6[HIY](?:（|\b)|(?:K-[AYH]6U)", line):
                result[moves[0]] = RouteMirror(
                    moves[0], routes[0], skills[0], number, True,
                    _explicit_signature(line), True, _route_template(line),
                )
    if name == "wujue":
        # These three bodies and route objects are uniquely owned by 05/21;
        # the catalog is only their inventory mirror.
        for move_id, (skill_id, route_id, _grade) in EXTERNAL_WUJUE.items():
            result[move_id] = RouteMirror(
                move_id, route_id, skill_id, 1, True, None, True
            )
        result.pop("mv_eighteen_palms_chain", None)
    return result


def parse_body_for_targets(
    text: str, targets: dict[str, RouteMirror]
) -> dict[str, BodyMove]:
    """Locate the real move-card declaration for each intended ultimate.

    Route/index rows are deliberately excluded.  A later explicit MoveDef
    token wins over an older prose mention, which permits compact cards to
    keep their human-readable sentence while making the machine contract
    unambiguous on that same card.
    """
    lines = text.splitlines()
    compact_owners: dict[int, str] = {}
    heading_owner: str | None = None
    heading_owners: dict[int, str | None] = {}
    excluded_section = False
    in_audit_projection = False
    excluded_sections: dict[int, bool] = {}
    for number, line in enumerate(lines, 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
        excluded_sections[number] = excluded_section or in_audit_projection
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        if re.match(r"^#{2,5} ", line):
            ids = re.findall(r"sk_[a-z0-9_]+", line)
            heading_owner = ids[0] if ids else None
            excluded_section = bool(re.search(
                r"数据校验|测试用例|待决事项|开放问题|修改提案|考据待办",
                line,
            ))
        heading_owners[number] = heading_owner
        excluded_sections[number] = excluded_section or in_audit_projection
        if not line.startswith("| `sk_"):
            continue
        ids = re.findall(r"sk_[a-z0-9_]+", line)
        if ids and re.search(r"(?: · |\d\s*[天玄地黄])", line):
            compact_owners[number] = ids[0]
    result: dict[str, BodyMove] = {}
    for move_id, route in targets.items():
        candidates: list[tuple[int, int, str]] = []
        suffix = "_" + move_id.split("_")[-1]
        for number, line in enumerate(lines, 1):
            if excluded_sections[number]:
                continue
            contains_full_id = _move_match(line, move_id) is not None
            compact = _compact_fragment(line, suffix)
            contains_compact = (
                route.skill_id is not None
                and (compact_owners.get(number) == route.skill_id
                     or heading_owners.get(number) == route.skill_id)
                and compact is not None
            )
            if not contains_full_id and not contains_compact:
                continue
            if "mfr_" in line and "MoveDef{" not in line:
                continue
            if line.lstrip().startswith(("#", ">")):
                continue
            score = 0
            if "MoveDef{" in line:
                score += 100
            if "ultimate" in line:
                score += 40
            if "绝招" in line:
                score += 20
            if line.startswith("|"):
                score += 10
            if any(word in line for word in ("统计", "校验", "待决", "依赖")):
                score -= 80
            fragment = line if contains_full_id else (compact or line)
            candidates.append((score, number, fragment))
        if not candidates:
            continue
        _score, number, line = max(candidates, key=lambda item: (item[0], -item[1]))
        source_line = lines[number - 1]
        move_ids = list(dict.fromkeys(re.findall(r"mv_[a-z0-9_]+", line)))
        fragment = line if len(move_ids) == 1 else _local_move_fragment(line, move_id)
        contract = re.search(r"MoveDef\{[^}]*\}", fragment)
        line_contracts = re.findall(r"MoveDef\{[^}]*\}", source_line)
        if not contract and len(line_contracts) == 1:
            contract = re.search(r"MoveDef\{[^}]*\}", source_line)
        machine = contract.group(0) if contract else fragment
        mp_pct, recovery = _table_resources(fragment, move_id)
        visible = _visible_resources(fragment, move_id) if contract else (None,) * 4
        result[move_id] = BodyMove(
            move_id=move_id, skill_id=route.skill_id, line=number,
            ultimate=_line_has_explicit_ultimate(machine),
            layer=_parse_layer(machine, move_id),
            rage=_resource_value(machine, ("rageCost", "气势")),
            mp_pct=_resource_value(machine, ("mpCost", "耗内")) or mp_pct,
            cd=_resource_value(machine, ("cd",)),
            recovery=_resource_value(machine, ("recovery", "收招")) or recovery,
            visible_layer=visible[0], visible_mp_pct=visible[1],
            visible_cd=visible[2], visible_recovery=visible[3],
        )
    return result


def parse_explicit_ultimate_routes(text: str) -> dict[str, RouteMirror]:
    """Parse route instances: both IDs, boolean and actual ``ap_*`` steps."""
    result: dict[str, RouteMirror] = {}
    current_skill: str | None = None
    for number, line in enumerate(text.splitlines(), 1):
        skill_ids = re.findall(r"sk_[a-z0-9_]+", line)
        if skill_ids and line.startswith("|"):
            current_skill = skill_ids[0]
        move_ids = re.findall(r"mv_[a-z0-9_]+", line)
        route_ids = re.findall(r"mfr_[a-z0-9_]+", line)
        points = tuple(re.findall(r"ap_[a-z0-9_]+", line))
        flag = _route_flag(line)
        if len(move_ids) == len(route_ids) == 1 and flag is not None and points:
            result[move_ids[0]] = RouteMirror(
                move_ids[0], route_ids[0], current_skill, number, flag, points, True
            )
    return result


def parse_breath_profiles(text: str) -> dict[str, tuple[int, bool]]:
    """Return formal profile definitions, not prose-only references.

    A profile is formal when a table row either binds exactly one ``sk_*`` to
    exactly one ``txp_*`` or gives that profile a field/positional value cell.
    Catalogs use several historical column layouts, so this structural shape
    is more stable than one exact tuple regex.  Every such definition remains
    a finding until it names
    ``outOfBattleScaleBp`` explicitly.
    """
    profiles: dict[str, tuple[int, bool]] = {}
    for number, line in enumerate(text.splitlines(), 1):
        ids = list(dict.fromkeys(re.findall(r"txp_[a-z0-9_]+", line)))
        skills = list(dict.fromkeys(re.findall(r"sk_[a-z0-9_]+", line)))
        has_value = bool(
            "outOfBattleScaleBp" in line
            or re.search(r"(?:^|[|`]\s*)\d+\s*[/／]\s*\d+", line)
        )
        if (not line.lstrip().startswith("|") or len(ids) != 1
                or (len(skills) != 1 and not has_value)):
            continue
        for profile in ids:
            explicit = bool(re.search(
                r"outOfBattleScaleBp\s*[:：=]\s*15000", line
            ))
            previous = profiles.get(profile)
            if previous is None or (explicit and not previous[1]):
                profiles[profile] = (number, explicit)
    return profiles


def explicit_route_signatures(text: str) -> dict[str, tuple[str, ...]]:
    """Map final-ultimate move IDs to the concrete route's acupoint order.

    Many catalogs use a compact mirror row and a second explicit-route row.
    A route is considered explicit only when that second row contains both IDs
    and concrete ``ap_*`` steps; a template code is deliberately insufficient.
    """
    final_ids = {move_id for move_id, route in parse_route_mirrors(text).items() if route.ultimate}
    signatures: dict[str, tuple[str, ...]] = {}
    for line in text.splitlines():
        move_ids = re.findall(r"mv_[a-z0-9_]+", line)
        route_ids = re.findall(r"mfr_[a-z0-9_]+", line)
        points = tuple(re.findall(r"ap_[a-z0-9_]+", line))
        if len(move_ids) == len(route_ids) == 1 and points and move_ids[0] in final_ids:
            signatures[move_ids[0]] = points
    return signatures


def parse_audit_instances(text: str) -> dict[str, FinalInstance]:
    """Parse compact final-instance rows anywhere in a catalog.

    Unlike ``parse_final_instances``, this is not marker-dependent.  The
    complete row shape is intentionally strict, so prose and legacy indexes
    cannot accidentally satisfy the release contract.
    """
    result: dict[str, FinalInstance] = {}
    for number, line in enumerate(text.splitlines(), 1):
        if not line.startswith("|") or "MoveDef{" not in line:
            continue
        skills = list(dict.fromkeys(re.findall(r"sk_[a-z0-9_]+", line)))
        moves = list(dict.fromkeys(re.findall(r"mv_[a-z0-9_]+", line)))
        routes = list(dict.fromkeys(re.findall(r"mfr_[a-z0-9_]+", line)))
        points, segment_ct, risks = _route_values(line, routes[0]) if routes else ((), (), ())
        grade = _grade_from_line(line)
        if len(skills) != 1 or len(moves) != 1 or len(routes) != 1 or not points or grade is None:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        body_cell = next((cell for cell in cells if "MoveDef{" in cell), "")
        route_cell = next((cell for cell in cells if "MeridianRouteDef{" in cell), "")
        if not body_cell or not route_cell:
            continue
        result[moves[0]] = FinalInstance(
            move_id=moves[0], skill_id=skills[0], route_id=routes[0],
            grade=grade, line=number,
            layer=_resource_value(body_cell, ("unlock",)),
            body_ultimate=_line_has_explicit_ultimate(body_cell),
            route_ultimate=_line_has_explicit_ultimate(route_cell),
            rage=_resource_value(body_cell, ("rageCost",)),
            mp_pct=_resource_value(body_cell, ("mpCost",)),
            cd=_resource_value(body_cell, ("cd",)),
            recovery=_resource_value(body_cell, ("recovery",)),
            signature=points, segment_ct=segment_ct, risks=risks,
        )
    return result


def _route_values(line: str, route_id: str) -> tuple[tuple[str, ...], tuple[int, ...], tuple[int, ...]]:
    """Return acupoints, segment CT and risk from one instance row."""
    start = line.find(route_id)
    fragment = line[start:] if start >= 0 else line
    triples = re.findall(r"(ap_[a-z0-9_]+)/(\d+)/(\d+)", fragment)
    if triples:
        return (
            tuple(item[0] for item in triples),
            tuple(int(item[1]) for item in triples),
            tuple(int(item[2]) for item in triples),
        )
    # Wujue/xiaoyao keep CT in a dedicated ``N×CT`` cell and encode each
    # step as ``acupoint/riskBp``.  It is still an explicit route: expand the
    # scalar CT to the array that the runtime object receives.
    pairs = re.findall(r"(ap_[a-z0-9_]+)/(\d+)(?!/)", fragment)
    timing = re.search(r"(\d+)\s*[×x]\s*(\d+)", fragment)
    if pairs and timing and int(timing.group(1)) == len(pairs):
        return (
            tuple(item[0] for item in pairs),
            (int(timing.group(2)),) * len(pairs),
            tuple(int(item[1]) for item in pairs),
        )
    return (
        (), (), (),
    )


def old_buff_runtime_lines(text: str) -> list[tuple[int, str]]:
    found: list[tuple[int, str]] = []
    for number, line in enumerate(text.splitlines(), 1):
        if not any(buff in line for buff in OLD_BUFFS):
            continue
        if any(hint in line for hint in EXPLANATION_HINTS):
            continue
        found.append((number, line))
    return found


def old_buff_runtime_occurrences(text: str) -> int:
    """Count legacy IDs in runtime declarations, not migration prose."""
    return sum(
        len(re.findall(r"bf_(?:fengxue|fengnei|fengjingmai|chanrao)", line))
        for _number, line in old_buff_runtime_lines(text)
    )


def _route_similarity_reason(
    left: tuple[str, ...], right: tuple[str, ...]
) -> str | None:
    """Reject copied, rotated, reversed, or over-half-shared routes."""
    if not left or not right or left[0].startswith("external:"):
        return None
    shared = len(set(left) & set(right))
    overlap = shared / min(len(left), len(right))
    if len(left) == len(right):
        doubled = left + left
        rotated = any(tuple(doubled[i:i + len(left)]) == right
                      for i in range(len(left)))
        reversed_left = tuple(reversed(left))
        doubled_reversed = reversed_left + reversed_left
        reversed_or_rotated = any(
            tuple(doubled_reversed[i:i + len(left)]) == right
            for i in range(len(left))
        )
        if rotated:
            return "cyclic rotation"
        if reversed_or_rotated:
            return "reverse/rotated reverse"
    if overlap > 0.5:
        return f"shared acupoints {shared}/{min(len(left), len(right))}"
    return None


def audit_catalog(path: Path) -> CatalogAudit:
    text = path.read_text(encoding="utf-8")
    text_lines = text.splitlines()
    name = catalog_name(path)
    grades, grade_lines = parse_skill_grades(text)
    route_index = parse_route_mirrors(text)
    targets = parse_target_routes(text, name)
    # Marker rows are a generated mirror only.  They may enlarge the target
    # inventory, but must never substitute for a body card.
    final_instances = parse_final_instances(text)
    for move_id, item in final_instances.items():
        targets.setdefault(move_id, RouteMirror(
            move_id, item.route_id, item.skill_id, item.line, True,
            item.signature, True,
        ))
    if not targets and name not in EXPECTED:
        targets = {
            move_id: RouteMirror(
                move_id, item.route_id, item.skill_id, item.line,
                item.route_ultimate is True, item.signature, True,
            ) for move_id, item in final_instances.items()
        }
    legacy_body = parse_body_for_targets(text, targets)
    body: dict[str, BodyMove] = {}
    mirrors: dict[str, RouteMirror] = {}
    explicit_signatures: dict[str, tuple[str, ...]] = {}
    for move_id, target in targets.items():
        instance = final_instances.get(move_id)
        if move_id in EXTERNAL_WUJUE and name == "wujue":
            skill_id, route_id, grade = EXTERNAL_WUJUE[move_id]
            layer = EXTERNAL_LAYERS[move_id]
            body[move_id] = BodyMove(
                move_id, skill_id, 1, True, layer, 100, 10, 0, 1200
            )
            mirrors[move_id] = RouteMirror(
                move_id, route_id, skill_id, 1, True,
                (f"external:{route_id}",), True
            )
            explicit_signatures[move_id] = (f"external:{route_id}",)
            grades[skill_id] = grade
            grade_lines.setdefault(skill_id, 1)
        elif move_id in legacy_body:
            body[move_id] = legacy_body[move_id]
        if move_id not in mirrors and move_id in route_index:
            mirrors[move_id] = route_index[move_id]
        elif move_id not in mirrors:
            mirrors[move_id] = target
        if instance:
            explicit_signatures[move_id] = instance.signature
            grades.setdefault(instance.skill_id, instance.grade)
            grade_lines.setdefault(instance.skill_id, instance.line)
    breaths = parse_breath_profiles(text)
    audit = CatalogAudit(name=name)
    explicit_routes = parse_explicit_ultimate_routes(text)
    registered_acupoints = set(re.findall(
        r"ap_[a-z0-9_]+", ACUPOINT_REGISTRY.read_text(encoding="utf-8")
    )) if name in EXPECTED else set()
    explicit_signatures = {
        move_id: route.signature
        for move_id, route in explicit_routes.items()
        if move_id in targets and route.signature is not None
    } | explicit_signatures

    skills_by_tier: dict[str, set[str]] = defaultdict(set)
    body_by_tier: Counter[str] = Counter()
    route_by_tier: Counter[str] = Counter()
    target_skills = {
        route.skill_id for route in targets.values() if route.skill_id is not None
    }
    for skill in target_skills:
        grade = grades.get(skill)
        tier = grade_tier(grade)
        if tier in ("天", "地", "玄上"):
            skills_by_tier[tier].add(skill)
    for move in body.values():
        tier = grade_tier(grades.get(move.skill_id or ""))
        if move.ultimate is True and tier:
            body_by_tier[tier] += 1
    for route in mirrors.values():
        fallback = body.get(route.move_id)
        skill_id = route.skill_id or (fallback.skill_id if fallback else None)
        tier = grade_tier(grades.get(skill_id or ""))
        if route.ultimate and tier:
            route_by_tier[tier] += 1

    audit.tier_counts = {
        tier: {
            "skills": len(skills_by_tier[tier]),
            "body_ultimates": body_by_tier[tier],
            "route_ultimates": route_by_tier[tier],
        } for tier in ("天", "地", "玄上")
    }
    audit.body_ultimate_count = sum(1 for item in body.values() if item.ultimate is True)
    audit.route_ultimate_count = sum(1 for item in mirrors.values() if item.ultimate)

    for item in final_instances.values():
        if item.move_id not in targets:
            continue
        move = body.get(item.move_id)
        index = route_index.get(item.move_id)
        body_values = None if move is None else (
            move.layer, move.ultimate, move.rage, move.mp_pct, move.cd,
            move.recovery,
        )
        mirror_values = (
            item.layer, item.body_ultimate, item.rage, item.mp_pct, item.cd,
            item.recovery,
        )
        if body_values != mirror_values:
            audit.body_index_mismatches += 1
            audit.errors.append(
                f"{path.name}:{item.line}: {item.move_id} mirror {mirror_values} "
                f"!= body {body_values}"
            )
        # A fully explicit audit row is itself the route mirror.  Older
        # template-only tables remain documentary indexes, not a fourth truth.
        if index is None or index.ultimate is not True:
            audit.body_index_mismatches += 1
            audit.errors.append(
                f"{path.name}:{item.line}: {item.move_id} legacy route index is not true"
            )
        if item.route_id != "mfr_" + item.move_id.removeprefix("mv_"):
            audit.errors.append(
                f"{path.name}:{item.line}: {item.move_id} route ID is not its explicit stable mfr_*"
            )
        if item.body_ultimate is not True or item.route_ultimate is not True:
            audit.errors.append(
                f"{path.name}:{item.line}: {item.move_id} V-M01 body/route truth mismatch"
            )
        if item.cd != 0:
            audit.errors.append(
                f"{path.name}:{item.line}: {item.move_id} must use cd=0"
            )

    for move_id, target in targets.items():
        move = body.get(move_id)
        if move is None:
            audit.errors.append(
                f"{path.name}:{target.line}: {move_id} has no body MoveDef declaration"
            )
        elif move.ultimate is not True:
            audit.errors.append(
                f"{path.name}:{move.line}: {move.move_id} is labelled ultimate but lacks ultimate:true"
            )
        route = mirrors.get(move_id)
        if move is not None and move.ultimate is True and (route is None or not route.ultimate):
            audit.errors.append(
                f"{path.name}:{move.line}: {move_id} has no true route mirror"
            )
        if move is not None and move.ultimate is True:
            grade = grades.get(move.skill_id or "")
            expected_mp = 10 if grade and grade >= 10 else 9 if grade and grade >= 7 else 8
            missing = []
            if move.rage != 100:
                missing.append("rageCost=100")
            if move.mp_pct != expected_mp:
                missing.append(f"mpCost={expected_mp}%")
            if move.recovery != 1200:
                missing.append("recovery=1200")
            if missing:
                audit.errors.append(
                    f"{path.name}:{move.line}: {move.move_id} missing/invalid {', '.join(missing)}"
                )
            visible_pairs = (
                ("unlock", move.visible_layer, move.layer),
                ("mpCost", move.visible_mp_pct, move.mp_pct),
                ("cd", move.visible_cd, move.cd),
                ("recovery", move.visible_recovery, move.recovery),
            )
            for field_name, visible_value, machine_value in visible_pairs:
                if visible_value is not None and visible_value != machine_value:
                    audit.errors.append(
                        f"{path.name}:{move.line}: {move.move_id} visible "
                        f"{field_name}={visible_value} != MoveDef {machine_value}"
                    )

    for route in mirrors.values():
        move = body.get(route.move_id)
        if route.ultimate and (move is None or move.ultimate is not True):
            audit.errors.append(
                f"{path.name}:{route.line}: {route.move_id} route true without body ultimate:true"
            )

    target_ids_by_skill: dict[str, list[str]] = defaultdict(list)
    for move_id, target in targets.items():
        if target.skill_id:
            target_ids_by_skill[target.skill_id].append(move_id)
    for skill, move_ids in target_ids_by_skill.items():
        moves = [body.get(move_id) for move_id in move_ids]
        expected_layers = [7, 9, 10][:len(moves)]
        actual_layers = sorted(
            move.layer for move in moves
            if move is not None and move.ultimate is True and move.layer is not None
        )
        if len(actual_layers) != len(moves) or actual_layers != expected_layers:
            count = max(len(moves) - len(actual_layers),
                        sum(a != b for a, b in zip(actual_layers, expected_layers)))
            audit.unlock_violations += max(1, count)
            audit.errors.append(
                f"{path.name}:{grade_lines.get(skill, 1)}: {skill} ultimate layers {actual_layers}, expected {expected_layers}"
            )

    for move_id, target in targets.items():
        move = body.get(move_id)
        grade = grades.get(target.skill_id or "")
        if grade_tier(grade) not in ("天", "地"):
            continue
        signature = explicit_signatures.get(move_id)
        if signature is None:
            audit.implicit_routes += 1
            audit.errors.append(
                f"{path.name}:{move.line if move else target.line}: {move_id} lacks explicit mfr_* + ap_* route"
            )
        else:
            route = explicit_routes.get(move_id) or mirrors.get(move_id)
            if route is None or not route.explicit_move_ref or route.ultimate is not True:
                audit.errors.append(
                    f"{path.name}:{move.line if move else target.line}: {move_id} explicit route lacks true mirror"
                )
            canonical_route_id = EXTERNAL_WUJUE.get(move_id, (None, None, None))[1]
            expected_route_id = canonical_route_id or "mfr_" + move_id.removeprefix("mv_")
            if route and route.route_id != expected_route_id:
                audit.errors.append(
                    f"{path.name}:{route.line}: {move_id} route ID must use stable same-body name"
                )
            if route and route.line > 0:
                points, segment_ct, risks = _route_values(text_lines[route.line - 1], route.route_id)
                if points:
                    unknown = sorted(set(points) - registered_acupoints)
                    if unknown:
                        audit.errors.append(
                            f"{path.name}:{route.line}: {route.route_id} uses "
                            f"unregistered acupoints {','.join(unknown)}"
                        )
                    if len(points) != len(set(points)):
                        audit.errors.append(
                            f"{path.name}:{route.line}: {route.route_id} repeats an acupoint"
                        )
                    if not 1 <= len(points) <= 18 or len(segment_ct) != len(points) or len(risks) != len(points):
                        audit.errors.append(
                            f"{path.name}:{route.line}: {route.route_id} invalid steps/CT/risk lengths"
                        )
                    if any(value < 40 or value > 120 for value in segment_ct):
                        audit.errors.append(
                            f"{path.name}:{route.line}: {route.route_id} segmentCt outside 40..120"
                        )
                    if any(value < 0 or value > 1200 for value in risks):
                        audit.errors.append(
                            f"{path.name}:{route.line}: {route.route_id} riskBp outside 0..1200"
                        )
                    if move is not None and move.recovery is not None and move.recovery + sum(segment_ct) > 2000:
                        audit.errors.append(
                            f"{path.name}:{route.line}: {route.route_id} recovery + flowCt exceeds 2000"
                        )

    signatures: dict[str, list[tuple[str, tuple[str, ...]]]] = defaultdict(list)
    for move_id, target in targets.items():
        move = body.get(move_id)
        route = explicit_routes.get(move_id) or mirrors.get(move_id)
        signature = explicit_signatures.get(move_id)
        # The three early catalogs describe many routes through a named
        # skeleton (K-/Q-/G-...) instead of spelling out points.  Sharing that
        # skeleton within one skill is the same collision as sharing points.
        if signature is None and route and route.template:
            signature = (f"template:{route.template}",)
        skill_id = target.skill_id or (move.skill_id if move else None)
        if skill_id and signature:
            signatures[skill_id].append((move_id, signature))
    for skill, routes in signatures.items():
        for index, (left_id, left) in enumerate(routes):
            for right_id, right in routes[index + 1:]:
                reason = _route_similarity_reason(left, right)
                if reason:
                    audit.duplicate_routes += 1
                    audit.errors.append(
                        f"{path.name}: {skill} similar ultimate routes "
                        f"{left_id}/{right_id}: {reason}"
                    )

    missing_breaths = [(line, profile) for profile, (line, ok) in breaths.items() if not ok]
    audit.missing_out_of_battle_scale = len(missing_breaths)
    for line, profile in missing_breaths:
        audit.errors.append(
            f"{path.name}:{line}: {profile} lacks outOfBattleScaleBp=15000"
        )
    audit.old_buff_runtime_refs = old_buff_runtime_occurrences(text)
    for line, source in old_buff_runtime_lines(text):
        buffs = sorted(set(re.findall(r"bf_(?:fengxue|fengnei|fengjingmai|chanrao)", source)))
        audit.errors.append(f"{path.name}:{line}: legacy runtime buff {','.join(buffs)}")

    expected = EXPECTED.get(name, {})
    for tier, (skills, ultimates) in expected.items():
        got = audit.tier_counts[tier]
        if got["skills"] != skills:
            audit.errors.append(
                f"{path.name}: {tier} skill count {got['skills']} != {skills}"
            )
        if got["body_ultimates"] != ultimates:
            audit.errors.append(
                f"{path.name}: {tier} body ultimate count {got['body_ultimates']} != {ultimates}"
            )
        if got["route_ultimates"] != ultimates:
            audit.errors.append(
                f"{path.name}: {tier} route ultimate count {got['route_ultimates']} != {ultimates}"
            )
    if name in EXPECTED and AUDIT_VERSION not in text:
        audit.errors.append(f"{path.name}: version line lacks {AUDIT_VERSION}")

    if name in EXPECTED:
        for skill in target_skills:
            grade = grades.get(skill)
            if grade is None:
                continue
            if grade < 6:
                continue
            count = len([m for m in body.values() if m.skill_id == skill and m.ultimate is True])
            minimum, maximum = ULTIMATE_QUOTA.get(grade, (0, 0))
            if not minimum <= count <= maximum:
                audit.errors.append(
                    f"{path.name}:{grade_lines.get(skill, 1)}: {skill} grade {grade} has {count} ultimates, expected {minimum}..{maximum}"
                )
    return audit


def audit_paths(paths: Iterable[Path]) -> list[CatalogAudit]:
    path_list = list(paths)
    audits = [audit_catalog(path) for path in path_list]
    definitions_by_route: dict[
        str, list[tuple[CatalogAudit, RouteStepDefinition]]
    ] = defaultdict(list)
    for path, audit in zip(path_list, audits):
        text = path.read_text(encoding="utf-8")
        for definition in parse_route_step_definitions(text, path.name):
            definitions_by_route[definition.route_id].append((audit, definition))
    for route_id, entries in definitions_by_route.items():
        first = entries[0][1]
        for audit, duplicate in entries[1:]:
            audit.duplicate_step_definitions += 1
            audit.errors.append(
                f"{duplicate.location}: {route_id} steps defined more than once; "
                f"first definition at {first.location}"
            )
    return audits


def summary_row(audit: CatalogAudit) -> str:
    tiers = "; ".join(
        f"{tier} {item['skills']}门/{item['body_ultimates']}正文/{item['route_ultimates']}路线"
        for tier, item in audit.tier_counts.items()
    )
    return (
        f"{audit.name}: {tiers}; 解锁={audit.unlock_violations}; "
        f"同门重复={audit.duplicate_routes}; 隐式路线={audit.implicit_routes}; "
        f"重复步骤定义={audit.duplicate_step_definitions}; "
        f"缺离战倍率={audit.missing_out_of_battle_scale}; "
        f"旧Buff={audit.old_buff_runtime_refs}; "
        f"正文≠索引={audit.body_index_mismatches}; errors={len(audit.errors)}"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--json", action="store_true", help="emit JSON")
    parser.add_argument("--strict", action="store_true", help="fail on any error")
    parser.add_argument("--details", action="store_true", help="print individual errors")
    args = parser.parse_args(argv)
    paths = args.paths or list(CATALOG_PATHS)
    paths = [path if path.is_absolute() else ROOT / path for path in paths]
    missing = [str(path) for path in paths if not path.is_file()]
    if missing:
        for path in missing:
            print(f"ERROR: missing catalog {path}", file=sys.stderr)
        return 2
    audits = audit_paths(paths)
    if args.json:
        print(json.dumps([asdict(audit) for audit in audits], ensure_ascii=False, indent=2))
    else:
        for audit in audits:
            print(summary_row(audit))
            if args.details:
                for error in audit.errors:
                    print(f"  - {error}")
        print(f"catalogs={len(audits)} errors={sum(len(a.errors) for a in audits)}")
    return 1 if args.strict and any(audit.errors for audit in audits) else 0


if __name__ == "__main__":
    raise SystemExit(main())

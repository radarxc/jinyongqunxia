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
ACUPOINT_REGISTRY = ROOT / "docs" / "design" / "15-meridians-and-acupoints.md"
MERIDIAN_FLOW_PATH = ROOT / "docs" / "design" / "21-meridian-flow-and-moves.md"
ULTIMATE_RULINGS_PATH = (
    ROOT / "docs" / "decisions" / "ultimate-counts-tianzhong-dizhong.md"
)
OFFICIAL_CATALOG_PATTERN = re.compile(r"skills-[a-z0-9-]+\.md")
CATALOG_PATHS = tuple(sorted(
    path for path in CATALOG_DIR.glob("skills-*.md")
    if OFFICIAL_CATALOG_PATTERN.fullmatch(path.name)
))

GRADE_LABELS = {
    "黄下": 1, "黄中": 2, "黄上": 3, "玄下": 4, "玄中": 5,
    "玄上": 6, "地下": 7, "地中": 8, "地上": 9, "天下": 10,
    "天中": 11, "天上": 12,
}
GRADE_LONG_LABELS = {
    "黄阶下品": 1, "黄阶中品": 2, "黄阶上品": 3,
    "玄阶下品": 4, "玄阶中品": 5, "玄阶上品": 6,
    "地阶下品": 7, "地阶中品": 8, "地阶上品": 9,
    "天阶下品": 10, "天阶中品": 11, "天阶上品": 12,
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
ULTIMATE_QUOTA = {
    1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (0, 0), 5: (0, 0),
    6: (1, 1), 7: (1, 1), 8: (1, 2), 9: (2, 2),
    10: (2, 2), 11: (2, 3), 12: (3, 3),
}
DIVERSITY_OVERLAP_BP = 8000
EXTERNAL_WUJUE_ROUTE_IDS = frozenset(
    item[1] for item in EXTERNAL_WUJUE.values()
)
PALM_ENDPOINTS = frozenset({"ap_shoujueyin_laogong"})
FIST_GRAPPLE_ENDPOINTS = frozenset({
    "ap_shouyangming_quchi",
    "ap_shouyangming_shousanli",
    "ap_shouyangming_hegu",
})
FINGER_ENDPOINTS = frozenset({
    "ap_shoutaiyin_shaoshang",
    "ap_shouyangming_shangyang",
    "ap_shoujueyin_zhongchong",
    "ap_shoushaoyin_shaochong",
    "ap_shoutaiyang_shaoze",
    "ap_shoushaoyang_guanchong",
})
FINGER_ENDPOINT_BY_MOVE_TOKEN = {
    "shaoshang": "ap_shoutaiyin_shaoshang",
    "shangyang": "ap_shouyangming_shangyang",
    "zhongchong": "ap_shoujueyin_zhongchong",
    "shaochong": "ap_shoushaoyin_shaochong",
    "shaoze": "ap_shoutaiyang_shaoze",
    "guanchong": "ap_shoushaoyang_guanchong",
}
LEG_ACUPOINT_PREFIXES = (
    "ap_zuyangming_",
    "ap_zutaiyang_",
    "ap_zushaoyang_",
)
WEAPON_GUIDE_ENDPOINTS = frozenset({
    "ap_shoutaiyang_wangu",
    "ap_shoutaiyang_yanggu",
    "ap_shoushaoyang_yangchi",
    "ap_shoushaoyang_waiguan",
    "ap_shouyangming_hegu",
})
PROJECTION_ENDPOINTS = frozenset(
    FINGER_ENDPOINTS
    | WEAPON_GUIDE_ENDPOINTS
    | {"ap_shoujueyin_neiguan", "ap_shoujueyin_laogong"}
)
VOCAL_SONIC_ENDPOINTS = frozenset({
    "ap_yinwei_tiantu",
    "ap_yinwei_lianquan",
})
# New cards use MoveDef.voice.  This allowlist is the compatibility fallback
# for older cards that do not yet expose that field; explicit false overrides it.
VOCAL_SONIC_SKILLS = frozenset({
    "sk_shizihou",
    "sk_jingangnuhou",
    "sk_chuanyunxiao",
    "sk_chuanyinsouhun",
    "sk_damingzhou",
})
MOVEMENT_MERIDIANS = frozenset({
    "mer_zushaoyang", "mer_daimai", "mer_yangqiao",
})
REN_DU_MERIDIANS = frozenset({"mer_renmai", "mer_dumai"})
LEGAL_DANTIAN_ACUPOINTS = frozenset({
    "ap_renmai_qihai", "ap_renmai_guanyuan",
})


class UltimateRulingsError(ValueError):
    """The NU5p per-skill ruling table is missing or malformed."""


def parse_ultimate_rulings(path: Path) -> dict[str, int]:
    """Parse the ``sk_*`` and decided count columns from NU5p section 3."""
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise UltimateRulingsError(
            f"cannot read ultimate rulings {path}: {exc.strerror or exc}"
        ) from exc

    in_table_section = False
    saw_section = False
    skill_column: int | None = None
    count_column: int | None = None
    rulings: dict[str, int] = {}
    for line_number, line in enumerate(text.splitlines(), 1):
        if line.startswith("## 3. "):
            in_table_section = True
            saw_section = True
            continue
        if in_table_section and line.startswith("## 4. "):
            break
        if not in_table_section or not line.lstrip().startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if any("现→裁" in cell for cell in cells):
            skill_column = next(
                (index for index, cell in enumerate(cells) if "sk_*" in cell), None
            )
            count_column = next(
                (index for index, cell in enumerate(cells) if "现→裁" in cell), None
            )
            if skill_column is None or count_column is None:
                raise UltimateRulingsError(
                    f"{path}:{line_number}: ruling table lacks required columns"
                )
            continue
        all_ids = re.findall(r"\bsk_[a-z0-9_]+\b", line)
        if not all_ids:
            continue
        if skill_column is None or count_column is None:
            raise UltimateRulingsError(
                f"{path}:{line_number}: ruling row appears before a valid header"
            )
        if max(skill_column, count_column) >= len(cells):
            raise UltimateRulingsError(
                f"{path}:{line_number}: ruling row has too few columns"
            )
        skill_ids = re.findall(r"\bsk_[a-z0-9_]+\b", cells[skill_column])
        match = re.fullmatch(
            r"(\d+)\s*→\s*(\d+)\s*（([+＋\-−－]?\d+)）",
            cells[count_column],
        )
        if len(skill_ids) != 1 or match is None:
            raise UltimateRulingsError(
                f"{path}:{line_number}: cannot parse skill/count ruling row"
            )
        skill_id = skill_ids[0]
        current, decided = int(match.group(1)), int(match.group(2))
        delta = int(match.group(3).translate(str.maketrans("＋−－", "+--")))
        if decided - current != delta or decided not in (1, 2, 3):
            raise UltimateRulingsError(
                f"{path}:{line_number}: inconsistent ruling for {skill_id}"
            )
        if skill_id in rulings:
            raise UltimateRulingsError(
                f"{path}:{line_number}: duplicate ruling for {skill_id}"
            )
        rulings[skill_id] = decided
    if not saw_section or not rulings:
        raise UltimateRulingsError(
            f"{path}: missing section 3 per-skill ruling rows"
        )
    return rulings


def is_official_catalog(path: Path) -> bool:
    return (path.parent.resolve() == CATALOG_DIR.resolve()
            and OFFICIAL_CATALOG_PATTERN.fullmatch(path.name) is not None)


def ultimate_quota(
    grade: int, skill_id: str, rulings: dict[str, int]
) -> tuple[int, int]:
    if grade in (8, 11) and skill_id in rulings:
        decided = rulings[skill_id]
        return decided, decided
    return ULTIMATE_QUOTA.get(grade, (0, 0))


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


@dataclass(frozen=True)
class BodyUltimate:
    """One authoritative body ``MoveDef.ultimate:true`` occurrence."""

    move_id: str
    skill_id: str
    line: int


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


@dataclass(frozen=True)
class DiversityRoute:
    catalog: str
    source: str
    line: int
    skill_id: str
    move_id: str
    route_id: str
    signature: tuple[str, ...]

    @property
    def location(self) -> str:
        return f"{self.source}:{self.line}"


@dataclass(frozen=True)
class DiversityPair:
    left: DiversityRoute
    right: DiversityRoute
    shared_count: int
    denominator: int
    exact: bool

    @property
    def overlap_bp(self) -> int:
        return self.shared_count * 10000 // self.denominator


@dataclass(frozen=True)
class DiversityExactGroup:
    signature: tuple[str, ...]
    routes: tuple[DiversityRoute, ...]

    @property
    def skill_count(self) -> int:
        return len({route.skill_id for route in self.routes})


@dataclass(frozen=True)
class DiversityCatalogSummary:
    name: str
    route_count: int
    distinct_sequences: int
    exact_group_count: int
    exact_pair_count: int
    similar_pair_count: int
    warning_pair_count: int
    cross_catalog_exact_pair_count: int
    cross_catalog_similar_pair_count: int
    cross_catalog_warning_pair_count: int


@dataclass(frozen=True)
class DiversityReport:
    routes: tuple[DiversityRoute, ...]
    catalogs: tuple[DiversityCatalogSummary, ...]
    exact_groups: tuple[DiversityExactGroup, ...]
    pairs: tuple[DiversityPair, ...]

    @property
    def route_count(self) -> int:
        return len(self.routes)

    @property
    def distinct_sequences(self) -> int:
        return len({route.signature for route in self.routes})

    @property
    def exact_pair_count(self) -> int:
        return sum(pair.exact for pair in self.pairs)

    @property
    def warning_pair_count(self) -> int:
        return sum(not pair.exact for pair in self.pairs)

    @property
    def similar_pair_count(self) -> int:
        return len(self.pairs)

    @property
    def cross_catalog_similar_pair_count(self) -> int:
        return sum(pair.left.catalog != pair.right.catalog for pair in self.pairs)


@dataclass(frozen=True)
class DeliveryRoute:
    catalog: str
    source: str
    line: int
    skill_id: str
    move_id: str
    route_id: str
    signature: tuple[str, ...]
    delivery: str | None
    purpose: str | None
    projection: bool
    ultimate: bool = True
    voice: bool | None = None
    nature: str | None = None
    allow_opposed_nature: bool = False

    @property
    def location(self) -> str:
        return f"{self.source}:{self.line}"


@dataclass(frozen=True)
class DeliveryCatalogSummary:
    name: str
    routes: int
    classified: int
    checked_rules: int
    violations: int
    tail_violations: int
    unclassified: int
    nonultimate_projection_routes: int = 0
    nonultimate_projection_violations: int = 0
    nature_conflicts: int = 0


@dataclass(frozen=True)
class DeliveryFinding:
    route: DeliveryRoute
    rule: str
    required: str


@dataclass(frozen=True)
class DeliveryReport:
    routes: tuple[DeliveryRoute, ...]
    catalogs: tuple[DeliveryCatalogSummary, ...]
    findings: tuple[DeliveryFinding, ...]
    tail_findings: tuple[DeliveryFinding, ...]
    tail_violations: int
    nonultimate_projection_route_details: tuple[DeliveryRoute, ...] = ()
    nonultimate_projection_findings: tuple[DeliveryFinding, ...] = ()
    nature_findings: tuple[DeliveryFinding, ...] = ()
    nonultimate_projection_routes: int = 0
    nature_conflicts: int = 0

    @property
    def route_count(self) -> int:
        return len(self.routes)

    @property
    def ultimate_route_count(self) -> int:
        return len(self.routes)

    @property
    def nonultimate_projection_violations(self) -> int:
        return len(self.nonultimate_projection_findings)

    @property
    def checked_rule_count(self) -> int:
        return sum(item.checked_rules for item in self.catalogs)

    @property
    def classified_count(self) -> int:
        return sum(item.classified for item in self.catalogs)

    @property
    def violation_count(self) -> int:
        return len(self.findings)

    @property
    def unclassified_count(self) -> int:
        return sum(item.unclassified for item in self.catalogs)


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
    ultimate_quota_violations: int = 0
    unregistered_acupoint_warnings: int = 0
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def catalog_name(path: Path) -> str:
    return path.stem.removeprefix("skills-")


def load_meridian_natures(
    path: Path = ACUPOINT_REGISTRY,
) -> dict[str, str]:
    """Read meridian gameplay natures from design/15 section 2.1."""
    result: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(
            r"^\| `?(mer_[a-z0-9_]+)`? \|.*\| (yin|yang|harmony) \|",
            line,
        )
        if match:
            result[match.group(1)] = match.group(2)
    return result


def load_acupoint_meridians(
    path: Path = ACUPOINT_REGISTRY,
) -> dict[str, str]:
    """Read section-3 game ownership; never infer it from an ID prefix."""
    result: dict[str, str] = {}
    current: str | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        heading = re.match(r"^### 3\.\d+ .*`(mer_[a-z0-9_]+)`", line)
        if heading:
            current = heading.group(1)
            continue
        if line.startswith("## 4."):
            break
        if current and line.startswith("|"):
            for point in re.findall(r"`(ap_[a-z0-9_]+)`", line):
                result[point] = current
    return result


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
    for label, number in GRADE_LONG_LABELS.items():
        if label in line:
            return number
    for label, number in GRADE_LABELS.items():
        if re.search(rf"(?:{number}\s*{label}|{label}\s*{number})", line):
            return number
    return None


def parse_skill_grades(text: str) -> tuple[dict[str, int], dict[str, int]]:
    """Return formal skill definitions, excluding references and mirrors."""
    grades: dict[str, int] = {}
    lines: dict[str, int] = {}
    in_audit_projection = False
    for number, line in enumerate(text.splitlines(), 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
            continue
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        if in_audit_projection:
            continue
        ids = re.findall(r"\bsk_[a-z0-9_]+", line)
        grade = _grade_from_line(line)
        if not ids or grade is None:
            continue
        is_heading = re.match(r"^#{2,5}\s", line) is not None
        is_skill_first_table = re.match(
            r"^\s*\|\s*(?:\*\*)?`?sk_[a-z0-9_]+", line
        ) is not None
        is_bold_card = re.match(
            r"^\s*(?:-\s*)?\*\*`?sk_[a-z0-9_]+", line
        ) is not None
        if not (is_heading or is_skill_first_table or is_bold_card):
            continue
        # The first ID owns the heading/card.  Later IDs are prerequisites.
        grades.setdefault(ids[0], grade)
        lines.setdefault(ids[0], number)
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


def parse_body_ultimate_counts(
    text: str, grades: dict[str, int], targets: dict[str, RouteMirror]
) -> tuple[Counter[str], list[tuple[int, str]]]:
    """Count body ``MoveDef.ultimate:true`` contracts by formal skill.

    This scan is independent of the route target set: a newly added body
    ultimate must affect its skill's quota even when its route mirror is
    accidentally absent.  Owners are resolved from the defining card/row, a
    known move target, the conventional move prefix, or the enclosing card.
    """
    counts: Counter[str] = Counter()
    issues: list[tuple[int, str]] = []
    persistent_owner: str | None = None
    persistent_level: int | None = None
    persistent_kind: str | None = None
    excluded_level: int | None = None
    in_audit_projection = False

    def line_owner(line: str) -> tuple[str | None, str | None]:
        grade = _grade_from_line(line)
        ids = re.findall(r"\bsk_[a-z0-9_]+", line)
        if grade is None or not ids or ids[0] not in grades:
            return None, None
        if re.match(r"^#{2,5}\s", line):
            return ids[0], "heading"
        if re.match(r"^\s*\|\s*(?:\*\*)?`?sk_[a-z0-9_]+", line):
            return ids[0], "table"
        if re.match(r"^\s*(?:-\s*)?\*\*`?sk_[a-z0-9_]+", line):
            return ids[0], "bold"
        return None, None

    def owner_from_moves(line: str) -> tuple[str | None, bool]:
        owners: list[str] = []
        for move_id in dict.fromkeys(re.findall(
            r"(?<![A-Za-z0-9_])mv_[a-z0-9_]+", line
        )):
            target = targets.get(move_id)
            if target is not None and target.skill_id is not None:
                owners.append(target.skill_id)
                continue
            stem = move_id.removeprefix("mv_")
            candidates = [
                skill for skill in grades
                if stem.startswith(skill.removeprefix("sk_") + "_")
            ]
            if candidates:
                owners.append(max(candidates, key=len))
        unique = list(dict.fromkeys(owners))
        return (unique[0] if len(unique) == 1 else None, len(unique) > 1)

    for number, line in enumerate(text.splitlines(), 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
            continue
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        heading = re.match(r"^(#{1,6})\s", line)
        level = len(heading.group(1)) if heading else None
        if level is not None:
            if excluded_level is not None and level <= excluded_level:
                excluded_level = None
            if (persistent_kind == "bold" or (persistent_level is not None
                    and level <= persistent_level)):
                persistent_owner = persistent_level = persistent_kind = None
            if re.search(
                r"数据校验|测试用例|待决事项|开放问题|修改提案|考据待办",
                line,
            ):
                excluded_level = level
        direct_owner, owner_kind = line_owner(line)
        if owner_kind == "heading":
            persistent_owner, persistent_level = direct_owner, level
            persistent_kind = owner_kind
        elif owner_kind == "bold":
            persistent_owner, persistent_level = direct_owner, None
            persistent_kind = owner_kind
        if in_audit_projection or excluded_level is not None:
            continue
        contracts = [
            item.group(0) for item in re.finditer(r"MoveDef\{[^}]*}", line)
            if _line_has_explicit_ultimate(item.group(0)) is True
        ]
        if not contracts:
            continue
        move_owner, ambiguous_moves = owner_from_moves(line)
        if ambiguous_moves:
            issues.append((number, "ultimate MoveDefs span multiple skills"))
            continue
        owner = direct_owner or move_owner or persistent_owner
        if owner is None:
            issues.append((number, "ultimate MoveDef has no formal skill owner"))
            continue
        if direct_owner and move_owner and direct_owner != move_owner:
            issues.append((number, "ultimate MoveDef skill owner is ambiguous"))
            continue
        counts[owner] += len(contracts)
    return counts, issues


def parse_body_ultimates(
    text: str, grades: dict[str, int], targets: dict[str, RouteMirror]
) -> list[BodyUltimate]:
    """Return identifiable body ultimates independently of route indexes.

    Owner tracking deliberately mirrors ``parse_body_ultimate_counts``.  This
    narrower inventory exists so a body truth cannot disappear merely because
    the author forgot every ``mfr_*`` declaration for it.
    """
    result: list[BodyUltimate] = []
    persistent_owner: str | None = None
    excluded_level: int | None = None
    in_audit_projection = False
    for number, line in enumerate(text.splitlines(), 1):
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
            continue
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        heading = re.match(r"^(#{1,6})\s", line)
        level = len(heading.group(1)) if heading else None
        if level is not None:
            if excluded_level is not None and level <= excluded_level:
                excluded_level = None
            owner_ids = re.findall(r"\bsk_[a-z0-9_]+", line)
            persistent_owner = (
                owner_ids[0]
                if owner_ids and owner_ids[0] in grades and _grade_from_line(line)
                else None
            )
            if re.search(
                r"数据校验|测试用例|待决事项|开放问题|修改提案|考据待办",
                line,
            ):
                excluded_level = level
        if in_audit_projection or excluded_level is not None:
            continue
        direct_ids = re.findall(r"\bsk_[a-z0-9_]+", line)
        direct_owner = next((item for item in direct_ids if item in grades), None)
        move_ids = list(dict.fromkeys(re.findall(
            r"(?<![A-Za-z0-9_])mv_[a-z0-9_]+", line
        )))
        ultimate_contracts = [
            item for item in re.finditer(r"MoveDef\{[^}]*}", line)
            if _line_has_explicit_ultimate(item.group(0)) is True
        ]
        if not ultimate_contracts:
            continue
        for contract in ultimate_contracts:
            if len(move_ids) == 1:
                move_id = move_ids[0]
            elif len(ultimate_contracts) > 1:
                # Compact prose may place several complete move contracts on
                # one line.  Each contract belongs to its nearest preceding
                # move token; the single trailing-contract layout below still
                # uses the explicit ``绝招`` label instead.
                preceding = [
                    match.group(0) for match in re.finditer(
                        r"(?<![A-Za-z0-9_])mv_[a-z0-9_]+", line
                    ) if match.end() <= contract.start()
                ]
                move_id = preceding[-1] if preceding else None
            else:
                labelled = [
                    move_id for move_id in move_ids
                    if re.search(
                        re.escape(move_id)
                        + r"(?![a-z0-9_])[^；|]{0,100}(?:绝招|ultimate\s*[:：]\s*true)",
                        line, re.I,
                    )
                ]
                move_id = labelled[0] if len(labelled) == 1 else None
            if move_id is None:
                continue
            target = targets.get(move_id)
            owner = direct_owner or (target.skill_id if target else None)
            if owner is None:
                stem = move_id.removeprefix("mv_")
                candidates = [
                    skill for skill in grades
                    if stem.startswith(skill.removeprefix("sk_") + "_")
                ]
                owner = max(candidates, key=len) if candidates else persistent_owner
            if owner is not None:
                result.append(BodyUltimate(move_id, owner, number))
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
        routes = re.findall(r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line)
        points = tuple(re.findall(
            r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+", line
        ))
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
        triples = re.findall(
            r"(?<![A-Za-z0-9_])(ap_[a-z0-9_]+)/(\d+)/(\d+)", line
        )
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
    points = re.findall(r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+", line)
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
        route_ids = list(dict.fromkeys(re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )))
        steps = tuple(re.findall(
            r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+", line
        ))
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
            r"(mv_[a-z0-9_]+)\s*→\s*((?<![A-Za-z0-9_])mfr_[a-z0-9_]+)([^；|]*)"
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
        route_ids = re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )
        flag = _route_flag(line)
        if len(move_ids) == len(route_ids) == 1 and flag is not None:
            move_id, route_id = move_ids[0], route_ids[0]
            result[move_id] = RouteMirror(
                move_id, route_id, current_skill, number, flag,
                _explicit_signature(line), True, _route_template(line),
            )

        # Legacy wujue/xiaoyao indexes omitted moveRef and derived it from mfr.
        for match in re.finditer(
            r"((?<![A-Za-z0-9_])mfr_[a-z0-9_]+)([^；|]*)", line
        ):
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
        routes = list(dict.fromkeys(re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )))
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
        route_ids = re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )
        points = tuple(re.findall(
            r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+", line
        ))
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
        route_ids = re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )
        points = tuple(re.findall(
            r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+", line
        ))
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
        routes = list(dict.fromkeys(re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )))
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


def _skill_contexts(text: str) -> dict[str, str]:
    """Collect definition lines that reliably state each skill's type."""
    contexts: dict[str, list[str]] = defaultdict(list)
    in_audit_projection = False
    for line in text.splitlines():
        if "<!-- skill-catalog-audit:start -->" in line:
            in_audit_projection = True
            continue
        if "<!-- skill-catalog-audit:end -->" in line:
            in_audit_projection = False
            continue
        if in_audit_projection:
            continue
        skills = list(dict.fromkeys(re.findall(r"\bsk_[a-z0-9_]+", line)))
        if len(skills) != 1:
            continue
        defining = bool(
            _grade_from_line(line) is not None
            and (line.lstrip().startswith(("#", "|", "**"))
                 or "category:" in line or "subType:" in line)
        )
        if defining or "category:" in line or "subType:" in line:
            contexts[skills[0]].append(line)
    return {skill: " ".join(lines) for skill, lines in contexts.items()}


def _skill_identity_context(skill_context: str) -> str:
    """Keep this skill's display name/category, excluding prerequisites."""
    skill = re.search(r"\bsk_[a-z0-9_]+", skill_context)
    if skill is None:
        return skill_context.split("｜", 1)[0]
    skill_id = skill.group(0)
    identities: list[str] = []
    definitions = re.split(
        r"\s+(?=(?:#{1,6}\s+|\*\*`?sk_))", skill_context
    )
    for line in definitions:
        match = re.search(rf"\b{re.escape(skill_id)}\b", line)
        if match is None:
            continue
        if line.lstrip().startswith("|"):
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            index = next(i for i, cell in enumerate(cells) if skill_id in cell)
            own_fields = []
            for cell in cells[index:index + 4]:
                if re.search(r"\b(?:mv|mfr)_[a-z0-9_]+", cell):
                    break
                own_fields.append(cell)
            identities.append(" ".join(own_fields))
        else:
            own_line = line.split("｜", 1)[0]
            identities.append(
                re.sub(r"^\s*(?:#{1,6}\s+|-\s+)?", "", own_line)
            )
    return " ".join(identities)


def _explicit_bool(context: str, field_name: str) -> bool | None:
    match = re.search(
        rf"\b{re.escape(field_name)}\s*[:：]\s*(true|false)",
        context, re.I,
    )
    return None if match is None else match.group(1).lower() == "true"


def _explicit_nature(context: str) -> str | None:
    match = re.search(
        r"\bnature\s*[:：]\s*(yin|yang|harmony|neutral)",
        context, re.I,
    )
    return match.group(1).lower() if match else None


def _skill_natures(text: str) -> dict[str, str]:
    """Read only explicit skill nature fields or standalone table cells."""
    result: dict[str, str] = {}
    labels = {
        "yin": "yin", "阴": "yin", "阴性": "yin",
        "yang": "yang", "阳": "yang", "阳性": "yang",
        "harmony": "harmony", "调和": "harmony",
        "neutral": "neutral", "中性": "neutral",
    }
    for line in text.splitlines():
        skills = list(dict.fromkeys(re.findall(r"\bsk_[a-z0-9_]+", line)))
        if len(skills) != 1:
            continue
        nature = _explicit_nature(line)
        if nature is None and line.lstrip().startswith("|"):
            cells = [
                re.sub(r"[`*\s]", "", cell)
                for cell in line.strip().strip("|").split("|")
            ]
            nature = next((labels[cell] for cell in cells if cell in labels), None)
        if nature is None and _grade_from_line(line) is not None:
            match = re.search(
                r"[·・]\s*(阴性?|阳性?|调和|中性)\s*(?:[·・）)])", line
            )
            nature = labels.get(match.group(1)) if match else None
        if nature is not None:
            result.setdefault(skills[0], nature)
    return result


def _move_contexts(text: str) -> dict[str, str]:
    result: dict[str, list[str]] = defaultdict(list)
    for line in text.splitlines():
        if "MoveDef{" not in line:
            continue
        move_ids = list(dict.fromkeys(re.findall(r"mv_[a-z0-9_]+", line)))
        for move_id in move_ids:
            fragment = _local_move_fragment(line, move_id) if len(move_ids) > 1 else line
            match = _move_match(line, move_id)
            next_move = (
                re.search(r"\bmv_[a-z0-9_]+", line[match.end():])
                if match else None
            )
            limit = match.end() + next_move.start() if next_move and match else len(line)
            definition = line.find("MoveDef{", match.end(), limit) if match else -1
            if "MoveDef{" not in fragment and definition >= 0:
                depth = 0
                for index in range(line.find("{", definition), limit):
                    depth += (line[index] == "{") - (line[index] == "}")
                    if depth == 0:
                        fragment = line[match.start():index + 1]
                        break
            result[move_id].append(fragment)
    return {move_id: " ".join(parts) for move_id, parts in result.items()}


def _move_owners(text: str) -> dict[str, str]:
    """Resolve a move to its enclosing formal skill card."""
    owners: dict[str, str] = {}
    current: str | None = None
    for line in text.splitlines():
        skills = list(dict.fromkeys(re.findall(r"\bsk_[a-z0-9_]+", line)))
        if len(skills) == 1 and (
            _grade_from_line(line) is not None
            or line.lstrip().startswith(("#", "**"))
        ):
            current = skills[0]
        moves = list(dict.fromkeys(re.findall(r"\bmv_[a-z0-9_]+", line)))
        if len(skills) == 1 and len(moves) == 1:
            owners[moves[0]] = skills[0]
        elif current and "MoveDef{" in line:
            for move_id in moves:
                owners.setdefault(move_id, current)
    return owners


def _purpose(context: str) -> str | None:
    match = re.search(
        r"purpose\s*[:：]\s*(attack|defense|movement)", context, re.I
    )
    return match.group(1).lower() if match else None


def _collect_nonultimate_projection_routes(
    path: Path, text: str, contexts: dict[str, str],
    move_contexts: dict[str, str], move_owners: dict[str, str],
    skill_natures: dict[str, str],
) -> list[DeliveryRoute]:
    """Collect explicit normal routes whose MoveDef opts into projection."""
    mirrors = parse_route_mirrors(text)
    rows: dict[str, tuple[int, str, tuple[str, ...], str]] = {}
    for number, line in enumerate(text.splitlines(), 1):
        moves = list(dict.fromkeys(re.findall(r"\bmv_[a-z0-9_]+", line)))
        route_ids = list(dict.fromkeys(re.findall(
            r"(?<![A-Za-z0-9_])mfr_[a-z0-9_]+", line
        )))
        points = tuple(re.findall(
            r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+", line
        ))
        if len(moves) == len(route_ids) == 1 and points:
            rows[moves[0]] = (number, route_ids[0], points, line)
    result: list[DeliveryRoute] = []
    for move_id, move_context in move_contexts.items():
        if _explicit_bool(move_context, "projection") is not True:
            continue
        mirror = mirrors.get(move_id)
        explicit_ultimate = _explicit_bool(move_context, "ultimate")
        if explicit_ultimate is True or (
            explicit_ultimate is None and mirror and mirror.ultimate
        ):
            continue
        row = rows.get(move_id)
        if row is None:
            continue
        line, route_id, points, route_context = row
        skill_id = move_owners.get(move_id) or (mirror.skill_id if mirror else None)
        if skill_id is None:
            continue
        skill_context = contexts.get(skill_id, "")
        result.append(DeliveryRoute(
            catalog_name(path), path.name, line, skill_id, move_id, route_id,
            points, _delivery_from_context(skill_context, move_context),
            _purpose(route_context) or (mirror and _purpose(text.splitlines()[mirror.line - 1])) or "attack",
            True, False, _explicit_bool(move_context, "voice"),
            _explicit_nature(move_context) or skill_natures.get(skill_id),
            _explicit_bool(route_context, "allowOpposedNature") is True,
        ))
    return result


def _delivery_from_context(skill_context: str, move_context: str) -> str | None:
    context = f"{skill_context} {move_context}"
    subtype = re.search(
        r"subType\s*[:：]\s*([a-z]+)",
        context, re.I,
    )
    if subtype:
        value = subtype.group(1).lower()
        if value == "inner":
            return "inner"
        if value == "movement":
            return "movement"
        if value == "grapple":
            return "fist-grapple"
        if value in {"finger", "leg"}:
            return value
        if value in {"sword", "blade", "staff", "spear", "whip", "exotic"}:
            return "weapon"
        # ``fist`` / ``grapple`` are legacy coarse buckets: they do not prove
        # a palm action, but must not hide an explicit skill name or move such
        # as 东海潮生掌 / 掌风外吐.  Other subtypes are authoritative here.
        if value != "fist":
            return None
    if re.search(r"category\s*[:：]\s*(?:inner|内功)", context, re.I):
        return "inner"
    if re.search(r"category\s*[:：]\s*movement", context, re.I):
        return "movement"
    if re.search(
        r"category\s*[:：]\s*(?:weapon|sword|blade|staff|spear|whip|exotic)",
        context, re.I,
    ):
        return "weapon"
    # A mind-state / stance skill is not an attack delivery type.  Its effect
    # text may name a later action (for example, "下次剑招"), which must not
    # classify the current move as a weapon strike.
    if re.search(
        r"(?:misc\s*[/／·]\s*mind|杂学\s*[/／·]\s*心神)",
        skill_context, re.I,
    ):
        return None
    if re.search(r"拳脚\s*[/／·]\s*(?:指法|指)", context):
        return "finger"
    if re.search(r"拳脚\s*[/／·]\s*(?:腿法|腿)", context):
        return "leg"
    if re.search(r"兵器\s*[/／·]", context):
        return "weapon"
    if re.search(r"(?:^|[（(·| /／])内功(?:[·| /／）)]|$)", context):
        return "inner"
    if re.search(r"(?:^|[（(·| /／])(?:轻功|身法)(?:[·| /／）)]|$)",
                 skill_context):
        return "movement"
    # ``拳脚/拳掌`` is an old broad catalog bucket, not an action.  Inspect
    # explicit fine types and display names only after removing that token.
    named_skill = re.sub(r"拳脚\s*[/／·]\s*拳掌", "", skill_context)
    if re.search(r"(?:掌法|[^拳]掌)(?=[*\s|（(·；;，,:：。]|$)", named_skill):
        return "palm"
    if re.search(r"(?:指法|[^定]指)(?=[\s|（(·]|$)", named_skill):
        return "finger"
    if re.search(r"(?:腿法|腿)(?=[\s|（(·]|$)", named_skill):
        return "leg"
    if re.search(r"(?:掌招|掌力|掌风|出掌|掌击|手印)", move_context):
        return "palm"
    if re.search(r"[^拳]掌(?=[\s|（(·；;，,:：。`]|$)", move_context):
        return "palm"
    if re.search(r"(?:指招|指力|指劲|点穴)", move_context):
        return "finger"
    if re.search(r"(?:腿招|踢击|扫腿)", move_context):
        return "leg"
    if re.search(r"(?:持械|剑招|刀招|棍招|枪招|鞭招)", move_context):
        return "weapon"
    fist_skill = re.sub(
        r"拳脚\s*[/／·]\s*拳掌", "",
        _skill_identity_context(skill_context),
    )
    if re.search(r"(?:拳法|[^掌]拳)(?=[*\s|（(·；;，,:：。]|$)", fist_skill):
        return "fist-grapple"
    fist_action_context = (
        move_context
        if re.search(r"(?:misc|杂学)\s*[/／·]", fist_skill, re.I)
        else context
    )
    if re.search(r"(?:拳法|擒拿)", fist_skill) or re.search(
        r"(?:拳法|拳招|出拳|拳击|拳劲|擒拿|拿握|锁腕)",
        fist_action_context,
    ):
        return "fist-grapple"
    if re.search(r"(?:护体|疗伤)", move_context):
        return "inner"
    return None


def collect_delivery_routes(paths: Iterable[Path]) -> list[DeliveryRoute]:
    """Collect final routes plus conservative body-derived action facts."""
    routes: list[DeliveryRoute] = []
    include_external_wujue = False
    for path in paths:
        include_external_wujue |= (
            is_official_catalog(path) and catalog_name(path) == "wujue"
        )
        text = path.read_text(encoding="utf-8")
        contexts = _skill_contexts(text)
        skill_natures = _skill_natures(text)
        move_contexts = _move_contexts(text)
        move_owners = _move_owners(text)
        lines = text.splitlines()
        for item in parse_audit_instances(text).values():
            if item.body_ultimate is not True or item.route_ultimate is not True:
                continue
            move_context = move_contexts.get(item.move_id, "")
            route_line = lines[item.line - 1]
            purpose_match = re.search(
                r"purpose\s*[:：]\s*(attack|defense|movement)", route_line, re.I
            )
            routes.append(DeliveryRoute(
                catalog_name(path), path.name, item.line, item.skill_id,
                item.move_id, item.route_id, item.signature,
                _delivery_from_context(contexts.get(item.skill_id, ""), move_context),
                purpose_match.group(1).lower() if purpose_match else None,
                bool(re.search(r"projection\s*[:：]\s*true", move_context, re.I)),
                True, _explicit_bool(move_context, "voice"),
                _explicit_nature(move_context)
                or skill_natures.get(item.skill_id),
                _explicit_bool(route_line, "allowOpposedNature") is True,
            ))
        routes.extend(_collect_nonultimate_projection_routes(
            path, text, contexts, move_contexts, move_owners, skill_natures
        ))
    if include_external_wujue:
        routes.extend(parse_external_wujue_delivery_routes(MERIDIAN_FLOW_PATH))
    return sorted(routes, key=lambda item: (item.catalog, item.line, item.route_id))


def _endpoint_finding(
    route: DeliveryRoute, rule: str, allowed: frozenset[str], label: str
) -> DeliveryFinding | None:
    if set(route.signature) & allowed:
        return None
    return DeliveryFinding(route, rule, label)


def _action_endpoint_findings(
    route: DeliveryRoute, rule: str, allowed: frozenset[str], label: str
) -> tuple[list[DeliveryFinding], list[DeliveryFinding]]:
    missing = _endpoint_finding(route, rule, allowed, label)
    if missing:
        return [missing], []
    if not set(route.signature[-3:]) & allowed:
        return [], [DeliveryFinding(
            route, f"{rule}-tail", f"{label} within final 3 steps"
        )]
    return [], []


def route_nature(
    signature: tuple[str, ...],
    acupoint_meridians: dict[str, str] | None = None,
    meridian_natures: dict[str, str] | None = None,
) -> str:
    """Apply design/21 §2.4 reading 1: yin/yang vote; ties harmonize."""
    ownership = acupoint_meridians or load_acupoint_meridians()
    natures = meridian_natures or load_meridian_natures()
    votes = Counter(
        natures.get(ownership.get(point, ""))
        for point in signature
    )
    yin, yang = votes["yin"], votes["yang"]
    if yin == yang:
        return "harmony"
    return "yin" if yin > yang else "yang"


def _has_game_meridian(
    route: DeliveryRoute, allowed: frozenset[str],
    ownership: dict[str, str],
) -> bool:
    return any(ownership.get(point) in allowed for point in route.signature)


def _is_vocal_projection(route: DeliveryRoute) -> bool:
    if route.voice is not None:
        return route.voice
    return route.skill_id in VOCAL_SONIC_SKILLS


def _delivery_findings(
    route: DeliveryRoute, ownership: dict[str, str] | None = None,
) -> tuple[list[DeliveryFinding], list[DeliveryFinding]]:
    findings: list[DeliveryFinding] = []
    tail_findings: list[DeliveryFinding] = []
    if not route.ultimate:
        if route.projection:
            vocal = _is_vocal_projection(route)
            allowed = PROJECTION_ENDPOINTS | (
                VOCAL_SONIC_ENDPOINTS if vocal else frozenset()
            )
            finding = _endpoint_finding(
                route, "projection", allowed,
                "projection hand endpoint or vocal throat endpoint"
                if vocal else "one of the 13 projection hand endpoints",
            )
            if finding:
                findings.append(finding)
        return findings, tail_findings
    if route.delivery == "palm":
        current, tails = _action_endpoint_findings(
            route, "palm", PALM_ENDPOINTS, "ap_shoujueyin_laogong"
        )
        findings.extend(current)
        tail_findings.extend(tails)
    elif route.delivery == "fist-grapple":
        current, tails = _action_endpoint_findings(
            route, "fist-grapple", FIST_GRAPPLE_ENDPOINTS,
            "Quchi, Shousanli, or Hegu",
        )
        findings.extend(current)
        tail_findings.extend(tails)
    elif route.delivery == "finger":
        specific = next((
            endpoint for token, endpoint in FINGER_ENDPOINT_BY_MOVE_TOKEN.items()
            if re.search(rf"(?:^|_){token}(?:_|$)", route.move_id)
        ), None)
        allowed = frozenset({specific}) if specific else FINGER_ENDPOINTS
        current, tails = _action_endpoint_findings(
            route, "finger-specific" if specific else "finger", allowed,
            specific or "one of six finger endpoints",
        )
        findings.extend(current)
        tail_findings.extend(tails)
    elif route.delivery == "leg":
        allowed = frozenset(
            point for point in route.signature
            if point.startswith(LEG_ACUPOINT_PREFIXES)
        )
        current, tails = _action_endpoint_findings(
            route, "leg", allowed, "one foot-yang acupoint"
        )
        findings.extend(current)
        tail_findings.extend(tails)
    elif route.delivery == "weapon":
        current, tails = _action_endpoint_findings(
            route, "weapon", WEAPON_GUIDE_ENDPOINTS,
            "one wrist/weapon-guide endpoint",
        )
        findings.extend(current)
        tail_findings.extend(tails)
    if route.delivery == "inner" and route.purpose == "attack":
        # Preserve the pre-NXT report exactly; new mapping-based checks below
        # are additive and report-only.
        if not any(point.startswith(("ap_renmai_", "ap_dumai_"))
                   for point in route.signature):
            findings.append(DeliveryFinding(
                route, "inner-attack", "one Ren or Du acupoint"
            ))
    ownership = ownership or load_acupoint_meridians()
    if route.delivery == "inner" and route.purpose == "defense":
        if not _has_game_meridian(route, REN_DU_MERIDIANS, ownership):
            findings.append(DeliveryFinding(
                route, "inner-defense", "one Ren or Du acupoint"
            ))
        if any("dantian" in point and point not in LEGAL_DANTIAN_ACUPOINTS
               for point in route.signature):
            findings.append(DeliveryFinding(
                route, "inner-dantian", "Qihai or Guanyuan for dantian"
            ))
    if route.purpose == "movement" or route.delivery == "movement":
        if (not _has_game_meridian(route, MOVEMENT_MERIDIANS, ownership)
                and "ap_zushaoyin_yongquan" not in route.signature):
            findings.append(DeliveryFinding(
                route, "movement", "footwork meridian or Yongquan"
            ))
    if route.projection:
        vocal = _is_vocal_projection(route)
        allowed = (
            PROJECTION_ENDPOINTS | VOCAL_SONIC_ENDPOINTS
            if vocal else PROJECTION_ENDPOINTS
        )
        finding = _endpoint_finding(
            route, "projection", allowed,
            (
                "one of the 13 projection hand endpoints or a vocal "
                "Tiantu/Lianquan endpoint"
                if vocal else "one of the 13 projection hand endpoints"
            ),
        )
        if finding:
            findings.append(finding)
    return findings, tail_findings


def analyze_delivery_routes(routes: Iterable[DeliveryRoute]) -> DeliveryReport:
    route_list = tuple(sorted(
        routes, key=lambda item: (item.catalog, item.line, item.route_id)
    ))
    ultimate_routes = tuple(route for route in route_list if route.ultimate)
    nonultimate_projection_route_details = tuple(
        route for route in route_list if not route.ultimate and route.projection
    )
    ownership = load_acupoint_meridians()
    meridian_natures = load_meridian_natures()
    finding_groups = tuple(
        _delivery_findings(route, ownership) for route in route_list
    )
    all_findings = tuple(
        finding for current, _tails in finding_groups for finding in current
    )
    findings = tuple(
        finding for finding in all_findings if finding.route.ultimate
    )
    tail_findings = tuple(
        finding for _current, tails in finding_groups for finding in tails
        if finding.route.ultimate
    )
    nature_findings = tuple(
        DeliveryFinding(
            route, "nature-conflict",
            f"route={route_nature(route.signature, ownership, meridian_natures)}; "
            f"declared={route.nature}",
        )
        for route in route_list
        if route.nature in {"yin", "yang"}
        and route_nature(
            route.signature, ownership, meridian_natures
        ) in {"yin", "yang"}
        and route_nature(
            route.signature, ownership, meridian_natures
        ) != route.nature
        and not route.allow_opposed_nature
    )
    nonultimate_projection_findings = tuple(
        finding for finding in all_findings
        if not finding.route.ultimate and finding.rule == "projection"
    )
    by_catalog: dict[str, list[DeliveryRoute]] = defaultdict(list)
    for route in route_list:
        by_catalog[route.catalog].append(route)
    summaries: list[DeliveryCatalogSummary] = []
    for name in sorted(by_catalog):
        all_items = by_catalog[name]
        items = [route for route in all_items if route.ultimate]
        checked = sum(
            (route.delivery in {
                "palm", "finger", "fist-grapple", "leg", "weapon",
            })
            + (route.delivery == "inner" and route.purpose == "attack")
            + (route.delivery == "inner" and route.purpose == "defense")
            + (route.purpose == "movement" or route.delivery == "movement")
            + route.projection
            for route in items
        )
        summaries.append(DeliveryCatalogSummary(
            name=name, routes=len(items),
            classified=sum(route.delivery is not None for route in items),
            checked_rules=checked,
            violations=sum(finding.route.catalog == name for finding in findings),
            tail_violations=sum(
                finding.route.catalog == name for finding in tail_findings
            ),
            unclassified=sum(route.delivery is None for route in items),
            nonultimate_projection_routes=sum(
                not route.ultimate and route.projection for route in all_items
            ),
            nonultimate_projection_violations=sum(
                finding.route.catalog == name
                for finding in nonultimate_projection_findings
            ),
            nature_conflicts=sum(
                finding.route.catalog == name for finding in nature_findings
            ),
        ))
    return DeliveryReport(
        routes=ultimate_routes, catalogs=tuple(summaries), findings=findings,
        tail_findings=tail_findings, tail_violations=len(tail_findings),
        nonultimate_projection_route_details=(
            nonultimate_projection_route_details
        ),
        nonultimate_projection_findings=nonultimate_projection_findings,
        nature_findings=nature_findings,
        nonultimate_projection_routes=len(nonultimate_projection_route_details),
        nature_conflicts=len(nature_findings),
    )


def analyze_delivery(paths: Iterable[Path]) -> DeliveryReport:
    path_list = list(paths)
    report = analyze_delivery_routes(collect_delivery_routes(path_list))
    summaries = {item.name: item for item in report.catalogs}
    all_summaries = tuple(
        summaries.get(catalog_name(path), DeliveryCatalogSummary(
            name=catalog_name(path), routes=0, classified=0, checked_rules=0,
            violations=0, tail_violations=0, unclassified=0,
        ))
        for path in sorted(path_list, key=lambda item: catalog_name(item))
    )
    return DeliveryReport(
        routes=report.routes, catalogs=all_summaries,
        findings=report.findings, tail_findings=report.tail_findings,
        tail_violations=report.tail_violations,
        nonultimate_projection_route_details=(
            report.nonultimate_projection_route_details
        ),
        nonultimate_projection_findings=report.nonultimate_projection_findings,
        nature_findings=report.nature_findings,
        nonultimate_projection_routes=report.nonultimate_projection_routes,
        nature_conflicts=report.nature_conflicts,
    )


def collect_diversity_routes(paths: Iterable[Path]) -> list[DiversityRoute]:
    """Collect final ultimate routes from each catalog's audit projection."""
    routes: list[DiversityRoute] = []
    include_external_wujue = False
    for path in paths:
        include_external_wujue |= (
            is_official_catalog(path) and catalog_name(path) == "wujue"
        )
        text = path.read_text(encoding="utf-8")
        for item in parse_audit_instances(text).values():
            if item.body_ultimate is not True or item.route_ultimate is not True:
                continue
            routes.append(DiversityRoute(
                catalog=catalog_name(path),
                source=path.name,
                line=item.line,
                skill_id=item.skill_id,
                move_id=item.move_id,
                route_id=item.route_id,
                signature=item.signature,
            ))
    if include_external_wujue:
        routes.extend(parse_external_wujue_diversity_routes(MERIDIAN_FLOW_PATH))
    return sorted(
        routes, key=lambda item: (item.catalog, item.line, item.route_id)
    )


def parse_external_wujue_diversity_routes(path: Path) -> list[DiversityRoute]:
    """Read the three Wujue routes whose concrete definitions live in 21."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    starts: list[tuple[int, str]] = []
    for index, line in enumerate(lines):
        match = re.fullmatch(r"  - id: (mfr_[a-z0-9_]+)", line)
        if match and match.group(1) in EXTERNAL_WUJUE_ROUTE_IDS:
            starts.append((index, match.group(1)))

    owner_by_route = {
        route_id: (move_id, skill_id)
        for move_id, (skill_id, route_id, _grade) in EXTERNAL_WUJUE.items()
    }
    routes: list[DiversityRoute] = []
    for index, route_id in starts:
        end = next((
            cursor for cursor in range(index + 1, len(lines))
            if re.match(r"^(?:  - id: mfr_|\S)", lines[cursor])
        ), len(lines))
        block = "\n".join(lines[index:end])
        move_match = re.search(r"^    moveRef: (mv_[a-z0-9_]+)$", block, re.M)
        points = tuple(re.findall(r"acupointRef: (ap_[a-z0-9_]+)", block))
        expected_move, skill_id = owner_by_route[route_id]
        if (move_match is None or move_match.group(1) != expected_move
                or not re.search(r"^    ultimate: true$", block, re.M) or not points):
            raise ValueError(
                f"{path}:{index + 1}: malformed external route {route_id}"
            )
        routes.append(DiversityRoute(
            catalog="wujue", source=path.name, line=index + 1,
            skill_id=skill_id, move_id=expected_move, route_id=route_id,
            signature=points,
        ))
    missing = sorted(set(owner_by_route) - {route.route_id for route in routes})
    if missing:
        raise ValueError(f"{path}: missing external routes {','.join(missing)}")
    return routes


def parse_external_wujue_delivery_routes(path: Path) -> list[DeliveryRoute]:
    """Project the three 05/21-owned Xianglong routes into Wujue.

    The author decision classifies all three ultimate palm-force moves as
    projection attacks, and design/05 v1.6 now declares ``projection:true``.
    Their concrete routes remain owned by design/21, so this cross-document
    mapping keeps them in the catalog delivery audit.
    """
    base_routes = parse_external_wujue_diversity_routes(path)
    lines = path.read_text(encoding="utf-8").splitlines()
    routes: list[DeliveryRoute] = []
    for route in base_routes:
        index = route.line - 1
        end = next((
            cursor for cursor in range(index + 1, len(lines))
            if re.match(r"^(?:  - id: mfr_|\S)", lines[cursor])
        ), len(lines))
        block = "\n".join(lines[index:end])
        purpose = re.search(
            r"^    purpose: (attack|defense|movement)$", block, re.M
        )
        if purpose is None:
            raise ValueError(
                f"{path}:{route.line}: external route {route.route_id} "
                "lacks a supported purpose"
            )
        routes.append(DeliveryRoute(
            catalog=route.catalog, source=route.source, line=route.line,
            skill_id=route.skill_id, move_id=route.move_id,
            route_id=route.route_id, signature=route.signature,
            delivery="palm", purpose=purpose.group(1), projection=True,
        ))
    return routes


def _diversity_pair(
    left: DiversityRoute, right: DiversityRoute
) -> DiversityPair | None:
    """Return a cross-skill finding when set overlap reaches 80%."""
    if left.skill_id == right.skill_id:
        return None
    left_points, right_points = set(left.signature), set(right.signature)
    denominator = min(len(left_points), len(right_points))
    if denominator == 0:
        return None
    shared = len(left_points & right_points)
    if shared * 10000 < denominator * DIVERSITY_OVERLAP_BP:
        return None
    return DiversityPair(
        left=left, right=right, shared_count=shared, denominator=denominator,
        exact=left.signature == right.signature,
    )


def analyze_diversity_routes(
    routes: Iterable[DiversityRoute],
) -> DiversityReport:
    """Compare ordered signatures globally while excluding one skill's routes."""
    route_list = tuple(routes)
    pairs: list[DiversityPair] = []
    for index, left in enumerate(route_list):
        for right in route_list[index + 1:]:
            pair = _diversity_pair(left, right)
            if pair is not None:
                pairs.append(pair)

    grouped: dict[tuple[str, ...], list[DiversityRoute]] = defaultdict(list)
    for route in route_list:
        grouped[route.signature].append(route)
    exact_groups = tuple(
        DiversityExactGroup(signature, tuple(items))
        for signature, items in sorted(grouped.items())
        if len({item.skill_id for item in items}) > 1
    )

    catalogs: list[DiversityCatalogSummary] = []
    for name in sorted({route.catalog for route in route_list}):
        local_routes = tuple(route for route in route_list if route.catalog == name)
        local_pairs = tuple(
            pair for pair in pairs
            if pair.left.catalog == name and pair.right.catalog == name
        )
        cross_catalog_pairs = tuple(
            pair for pair in pairs
            if pair.left.catalog != pair.right.catalog
            and name in (pair.left.catalog, pair.right.catalog)
        )
        local_groups = {
            route.signature for route in local_routes
            if len({
                other.skill_id for other in local_routes
                if other.signature == route.signature
            }) > 1
        }
        catalogs.append(DiversityCatalogSummary(
            name=name,
            route_count=len(local_routes),
            distinct_sequences=len({route.signature for route in local_routes}),
            exact_group_count=len(local_groups),
            exact_pair_count=sum(pair.exact for pair in local_pairs),
            similar_pair_count=len(local_pairs),
            warning_pair_count=sum(not pair.exact for pair in local_pairs),
            cross_catalog_exact_pair_count=sum(
                pair.exact for pair in cross_catalog_pairs
            ),
            cross_catalog_similar_pair_count=len(cross_catalog_pairs),
            cross_catalog_warning_pair_count=sum(
                not pair.exact for pair in cross_catalog_pairs
            ),
        ))
    return DiversityReport(
        routes=route_list, catalogs=tuple(catalogs),
        exact_groups=exact_groups, pairs=tuple(pairs),
    )


def analyze_route_diversity(paths: Iterable[Path]) -> DiversityReport:
    return analyze_diversity_routes(collect_diversity_routes(paths))


def _route_values(line: str, route_id: str) -> tuple[tuple[str, ...], tuple[int, ...], tuple[int, ...]]:
    """Return acupoints, segment CT and risk from one instance row."""
    start = line.find(route_id)
    fragment = line[start:] if start >= 0 else line
    triples = re.findall(
        r"(?<![A-Za-z0-9_])(ap_[a-z0-9_]+)/(\d+)/(\d+)", fragment
    )
    if triples:
        return (
            tuple(item[0] for item in triples),
            tuple(int(item[1]) for item in triples),
            tuple(int(item[2]) for item in triples),
        )
    # Wujue/xiaoyao keep CT in a dedicated ``N×CT`` cell and encode each
    # step as ``acupoint/riskBp``.  It is still an explicit route: expand the
    # scalar CT to the array that the runtime object receives.
    pairs = re.findall(
        r"(?<![A-Za-z0-9_])(ap_[a-z0-9_]+)/(\d+)(?!/)", fragment
    )
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


def audit_catalog(
    path: Path, ultimate_rulings: dict[str, int] | None = None
) -> CatalogAudit:
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
    official = is_official_catalog(path)
    if not targets and not official:
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
    quota_body_counts: Counter[str] | None = None
    if official:
        quota_body_counts, owner_issues = parse_body_ultimate_counts(
            text, grades, targets
        )
        if name == "wujue":
            for skill_id, _route_id, _grade in EXTERNAL_WUJUE.values():
                quota_body_counts[skill_id] += 1
        for line, reason in owner_issues:
            audit.errors.append(f"{path.name}:{line}: {reason}")
        body_ultimates = parse_body_ultimates(text, grades, targets)
        routed_move_ids = set(targets) | set(final_instances)
        for item in body_ultimates:
            if item.move_id not in routed_move_ids:
                audit.implicit_routes += 1
                audit.errors.append(
                    f"{path.name}:{item.line}: {item.move_id} 正文 "
                    "ultimate:true 缺路线（需 mfr_* 镜像与显式 ap_* steps）"
                )
    registered_acupoints = set(re.findall(
        r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+",
        ACUPOINT_REGISTRY.read_text(encoding="utf-8")
    )) if official else set()
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
    for skill, grade in grades.items():
        tier = grade_tier(grade)
        if tier in ("天", "地", "玄上"):
            skills_by_tier[tier].add(skill)
    if quota_body_counts is not None:
        for skill_id, count in quota_body_counts.items():
            tier = grade_tier(grades.get(skill_id))
            if tier:
                body_by_tier[tier] += count
    else:
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
    audit.body_ultimate_count = (
        sum(quota_body_counts.values()) if quota_body_counts is not None
        else sum(1 for item in body.values() if item.ultimate is True)
    )
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
        tier = grade_tier(grade)
        if tier not in ("天", "地", "玄上"):
            continue
        signature = explicit_signatures.get(move_id)
        if signature is None:
            if tier == "玄上":
                # Grade-six route coverage is being cleaned up catalog by
                # catalog.  Only unregistered IDs are report-only in this
                # transition; existing route-completeness behavior stays put.
                continue
            audit.implicit_routes += 1
            audit.errors.append(
                f"{path.name}:{move.line if move else target.line}: {move_id} lacks explicit mfr_* + ap_* route"
            )
        else:
            route = explicit_routes.get(move_id) or mirrors.get(move_id)
            unknown = sorted(
                point for point in set(signature)
                if official and point.startswith("ap_")
                and point not in registered_acupoints
            )
            legacy_unknown: set[str] = set()
            if route and route.line > 0:
                route_points, _cts, _risks = _route_values(
                    text_lines[route.line - 1], route.route_id
                )
                legacy_unknown = set(route_points) - registered_acupoints
            report_only = (
                unknown if tier == "玄上" else
                [point for point in unknown if point not in legacy_unknown]
            )
            if report_only:
                audit.unregistered_acupoint_warnings += 1
                audit.warnings.append(
                    f"{path.name}:{move.line if move else target.line}: "
                    f"{target.route_id} uses unregistered acupoints "
                    f"{','.join(report_only)} (grade {tier})"
                )
            if tier == "玄上":
                continue
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

    if official:
        if ultimate_rulings is None:
            ultimate_rulings = parse_ultimate_rulings(ULTIMATE_RULINGS_PATH)
        assert quota_body_counts is not None
        for skill, grade in grades.items():
            count = quota_body_counts[skill]
            minimum, maximum = ultimate_quota(grade, skill, ultimate_rulings)
            if skill in ultimate_rulings and grade not in (8, 11):
                audit.warnings.append(
                    f"{path.name}:{grade_lines[skill]}: {skill} grade {grade} "
                    "过时裁定; 当前品阶不再使用天中 / 地中逐门裁定"
                )
            if grade in (8, 11) and skill not in ultimate_rulings:
                audit.warnings.append(
                    f"{path.name}:{grade_lines[skill]}: {skill} grade {grade} "
                    f"未入裁定表; fallback quota {minimum}..{maximum}"
                )
            if not minimum <= count <= maximum:
                audit.ultimate_quota_violations += 1
                audit.errors.append(
                    f"{path.name}:{grade_lines[skill]}: {skill} grade {grade} "
                    f"has {count} ultimates, expected {minimum}..{maximum}"
                )
        # A target that cannot be tied to a formal definition must not vanish
        # merely because the quota pass iterates the formal skill inventory.
        for skill in target_skills - grades.keys():
            audit.errors.append(
                f"{path.name}: {skill} ultimate owner has no formal grade definition"
            )
    return audit


def audit_paths(
    paths: Iterable[Path], ultimate_rulings: dict[str, int] | None = None
) -> list[CatalogAudit]:
    path_list = list(paths)
    if ultimate_rulings is None and any(is_official_catalog(path) for path in path_list):
        ultimate_rulings = parse_ultimate_rulings(ULTIMATE_RULINGS_PATH)
    audits = [audit_catalog(path, ultimate_rulings) for path in path_list]
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
        f"配额违规={audit.ultimate_quota_violations}; "
        f"未登记穴位提示={audit.unregistered_acupoint_warnings}; "
        f"提示={len(audit.warnings)}; "
        f"缺离战倍率={audit.missing_out_of_battle_scale}; "
        f"旧Buff={audit.old_buff_runtime_refs}; "
        f"正文≠索引={audit.body_index_mismatches}; errors={len(audit.errors)}"
    )


def _route_label(route: DiversityRoute) -> str:
    return (
        f"{route.catalog}:{route.skill_id}/{route.move_id}/{route.route_id}"
        f"@{route.location}"
    )


def print_diversity_report(
    report: DiversityReport, details: bool = False, strict: bool = False
) -> None:
    """Print stable per-catalog totals plus actionable global findings."""
    for item in report.catalogs:
        print(
            f"{item.name}: routes={item.route_count}; "
            f"distinct_sequences={item.distinct_sequences}; "
            f"exact_groups={item.exact_group_count}; "
            f"exact_pairs={item.exact_pair_count}; "
            f"similar_pairs_ge80={item.similar_pair_count}; "
            f"warnings={item.warning_pair_count}; "
            f"cross_catalog_exact_pairs={item.cross_catalog_exact_pair_count}; "
            f"cross_catalog_pairs_ge80={item.cross_catalog_similar_pair_count}; "
            f"cross_catalog_warnings={item.cross_catalog_warning_pair_count}"
        )
    print(
        f"diversity: routes={report.route_count}; "
        f"distinct_sequences={report.distinct_sequences}; "
        f"exact_groups={len(report.exact_groups)}; "
        f"exact_pairs={report.exact_pair_count}; "
        f"similar_pairs_ge80={report.similar_pair_count}; "
        f"warnings={report.warning_pair_count}; "
        f"cross_catalog_pairs_ge80={report.cross_catalog_similar_pair_count}"
    )
    if report.exact_groups:
        marker = "ERROR" if strict else "EXACT"
        print(f"{marker}: identical ordered sequences exist across different skills")
    for group in report.exact_groups:
        labels = ", ".join(_route_label(route) for route in group.routes)
        detail_marker = "ERROR exact" if strict else "EXACT"
        print(
            f"  {detail_marker} sequence: skills={group.skill_count}; "
            f"routes={len(group.routes)}; {labels}"
        )
    if report.warning_pair_count:
        print(
            f"WARNING: {report.warning_pair_count} non-identical cross-skill "
            f"route pairs share at least {DIVERSITY_OVERLAP_BP / 100:.0f}% "
            "of the shorter route; each requires a narrative reason"
        )
    if not details:
        return
    for pair in report.pairs:
        if pair.exact:
            continue
        print(
            f"  WARNING overlap={pair.shared_count}/{pair.denominator} "
            f"({pair.overlap_bp / 100:.2f}%): "
            f"{_route_label(pair.left)} <> {_route_label(pair.right)}; "
            "requires a documented narrative reason"
        )


def print_delivery_report(report: DeliveryReport, details: bool = False) -> None:
    """Print report-only §4.3.1 / §4.4.1.4 endpoint findings."""
    for item in report.catalogs:
        print(
            f"{item.name}: delivery_routes={item.routes}; "
            f"classified={item.classified}; checked_rules={item.checked_rules}; "
            f"violations={item.violations}; "
            f"tail_violations={item.tail_violations}; "
            f"unclassified={item.unclassified}; "
            f"nonultimate_projection_routes="
            f"{item.nonultimate_projection_routes}; "
            f"nonultimate_projection_violations="
            f"{item.nonultimate_projection_violations}; "
            f"nature_conflicts={item.nature_conflicts}"
        )
    print(
        f"delivery: routes={report.route_count}; "
        f"classified={report.classified_count}; "
        f"checked_rules={report.checked_rule_count}; "
        f"violations={len(report.findings)}; "
        f"tail_violations={report.tail_violations}; "
        f"unclassified={report.unclassified_count}; "
        f"nonultimate_projection_routes="
        f"{report.nonultimate_projection_routes}; "
        f"nonultimate_projection_violations="
        f"{report.nonultimate_projection_violations}; "
        f"nature_conflicts={report.nature_conflicts}"
    )
    if not details:
        return
    for finding in (
        report.findings + report.tail_findings
        + report.nonultimate_projection_findings + report.nature_findings
    ):
        route = finding.route
        print(
            f"  DELIVERY rule={finding.rule}; required={finding.required}; "
            f"scope={'ultimate' if route.ultimate else 'normal-projection'}; "
            f"{route.catalog}:{route.skill_id}/{route.move_id}/{route.route_id}"
            f"@{route.location}"
        )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--json", action="store_true", help="emit JSON")
    parser.add_argument("--strict", action="store_true", help="fail on any error")
    parser.add_argument("--details", action="store_true", help="print individual errors")
    parser.add_argument(
        "--diversity", action="store_true",
        help="report cross-skill route diversity without changing exit status",
    )
    parser.add_argument(
        "--diversity-strict", action="store_true",
        help="fail on identical cross-skill routes; warn at 80%% overlap",
    )
    parser.add_argument(
        "--delivery", action="store_true",
        help="report action/projection endpoint rules without changing exit status",
    )
    args = parser.parse_args(argv)
    paths = args.paths or list(CATALOG_PATHS)
    paths = [path if path.is_absolute() else ROOT / path for path in paths]
    missing = [str(path) for path in paths if not path.is_file()]
    if missing:
        for path in missing:
            print(f"ERROR: missing catalog {path}", file=sys.stderr)
        return 2
    try:
        audits = audit_paths(paths)
    except UltimateRulingsError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    diversity_report = None
    if args.diversity or args.diversity_strict:
        diversity_report = analyze_route_diversity(paths)
    delivery_report = analyze_delivery(paths) if args.delivery else None
    if args.json:
        payload: object = [asdict(audit) for audit in audits]
        if diversity_report is not None or delivery_report is not None:
            payload = {"audits": payload}
            if diversity_report is not None:
                payload["diversity"] = asdict(diversity_report)
            if delivery_report is not None:
                payload["delivery"] = asdict(delivery_report)
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        for audit in audits:
            print(summary_row(audit))
            if args.details:
                for error in audit.errors:
                    print(f"  - {error}")
                for warning in audit.warnings:
                    print(f"  ! {warning}")
        print(f"catalogs={len(audits)} errors={sum(len(a.errors) for a in audits)}")
        if diversity_report is not None:
            print_diversity_report(
                diversity_report, details=args.details,
                strict=args.diversity_strict,
            )
        if delivery_report is not None:
            print_delivery_report(delivery_report, details=args.details)
    existing_failure = args.strict and any(audit.errors for audit in audits)
    diversity_failure = (
        args.diversity_strict
        and diversity_report is not None
        and bool(diversity_report.exact_groups)
    )
    return 1 if existing_failure or diversity_failure else 0


if __name__ == "__main__":
    raise SystemExit(main())

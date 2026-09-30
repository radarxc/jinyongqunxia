"""Audit actual ultimate route values (design/21 MF-V01--MF-V03).

The legacy route-row branch in check_skill_catalogs is compatibility-only:
its index line does not contain runtime steps. New route gates use this
module's concrete final rows and the three externally owned Wujue YAMLs.
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

ROUTE_CODES = ("unparsed", "unregistered", "duplicate", "length", "ct", "risk", "recovery")
TIERS = ("天", "地", "玄上")
POINT = r"(?<![A-Za-z0-9_])ap_[a-z0-9_]+"
RESOURCE_ROW = re.compile(
    r"\d+\s*/\s*true\s*/\s*\d+\s*/\s*\d+%\s*/\s*(?:0|—|-)\s*/\s*([^\s/|`；;]+)"
)


def _checker():
    try:
        from . import check_skill_catalogs
    except ImportError:  # Direct execution of tools/lint/check_skill_catalogs.py.
        import check_skill_catalogs
    return check_skill_catalogs


@dataclass(frozen=True)
class ActualRoute:
    catalog: str
    source: str
    line: int
    skill_id: str
    move_id: str
    route_id: str
    tier: str
    points: tuple[str, ...] = ()
    segment_ct: tuple[int | None, ...] = ()
    risks: tuple[int | None, ...] = ()
    recovery: int | None = None
    parsed: bool = False


@dataclass(frozen=True)
class RouteFinding:
    code: str
    catalog: str
    source: str
    line: int
    skill_id: str
    move_id: str
    route_id: str
    tier: str
    detail: str


@dataclass
class RouteCatalogSummary:
    catalog: str
    expected_by_tier: dict[str, int] = field(default_factory=lambda: dict.fromkeys(TIERS, 0))
    parsed_by_tier: dict[str, int] = field(default_factory=lambda: dict.fromkeys(TIERS, 0))
    findings: dict[str, int] = field(default_factory=lambda: dict.fromkeys(ROUTE_CODES, 0))


@dataclass
class RouteAuditReport:
    routes: list[ActualRoute]
    findings: list[RouteFinding]
    catalogs: list[RouteCatalogSummary]

    @property
    def counts(self) -> dict[str, int]:
        found = Counter(item.code for item in self.findings)
        return {code: found[code] for code in ROUTE_CODES}


def _integer(token: str) -> int | None:
    return int(token) if re.fullmatch(r"[+-]?\d+", token.strip()) else None


def _step_fragment(row: str, headers: tuple[str, ...]) -> str:
    """Select steps, excluding separately written outlet hints, losslessly."""
    cells = [cell.strip() for cell in row.strip().strip("|").split("|")]
    named = [cell for name, cell in zip(headers, cells) if re.search(
        r"steps|序列|步骤|穴位.*顺序|顺序.*穴位", name, re.I
    ) and not re.search(r"端点|提示", name)] if len(headers) == len(cells) else []
    for cell in named or cells:
        # Remove only identified metadata/hints. Arbitrary semicolons inside
        # a token are damage, not permission to discard part of the steps.
        sequence = re.split(r"(?:^|[；;])\s*(?:出口|端点)(?:提示)?[：:]?",
                            cell.replace("`", ""), maxsplit=1)[0]
        sequence = re.sub(
            r"^(?:mfr_[a-z0-9_]+\s*[；;]\s*)?MeridianRouteDef\{.*\}\s*[；;]\s*",
            "", sequence,
        )
        if named or (re.search(POINT, sequence) and re.search(r"/|→|->", sequence)):
            return sequence
    return ""


def _values(fragment: str, row: str) -> tuple[tuple[str, ...], tuple[int | None, ...], tuple[int | None, ...]]:
    # Split every step, not just matching IDs: a malformed neighbour must
    # neither disappear nor become a registered ID after prefix truncation.
    sequence = re.sub(r"^\s*显式(?:\s*\d+\s*段)?[：:]\s*", "", fragment).strip()
    steps = [step.split("/") for step in re.split(r"→|->|、|,|，", sequence)] if sequence else []
    points = tuple(parts[0].strip() for parts in steps)
    components = [[part.strip() for part in parts[1:]] for parts in steps]
    if components and all(len(parts) == 1 for parts in components):
        timing = re.search(
            r"(?<![\w.])([+-]?\d+(?:\.\d+)?)\s*[×x]\s*([+-]?\d+(?:\.\d+)?)(?![\w.])", row
        )
        if timing:
            count = _integer(timing[1])
            # Invalid declared lengths must fail without allocating an
            # arbitrarily large tuple from malformed documentation.
            repetitions = count if count is not None and 1 <= count <= 18 else 0
            return points, (_integer(timing[2]),) * repetitions, tuple(
                _integer(parts[0]) for parts in components
            )
    return points, tuple(_integer(parts[0]) for parts in components if parts), tuple(
        _integer(parts[1]) if len(parts) == 2 else None
        for parts in components if len(parts) >= 2
    )


def _valid_points(points: tuple[str, ...]) -> bool:
    return bool(points) and all(re.fullmatch(r"ap_[a-z0-9_]+", point) for point in points)


def _recovery(row: str) -> int | None:
    match = re.search(r"\brecovery\s*[:=]\s*([^;,}\s]+)", row)
    if match:
        return _integer(match[1])
    resource = RESOURCE_ROW.search(row)
    return _integer(resource[1]) if resource else None


def _catalog_routes(path: Path) -> list[ActualRoute]:
    checker = _checker()

    text = path.read_text(encoding="utf-8")
    name = checker.catalog_name(path)
    grades, _ = checker.parse_skill_grades(text)
    targets = checker.parse_target_routes(text, name if checker.is_official_catalog(path) else "")
    headers = checker._table_headers_by_line(text)
    candidates: dict[str, list[tuple[int, int, str, str]]] = {}
    for number, row in enumerate(text.splitlines(), 1):
        if not row.lstrip().startswith("|"):
            continue
        route_ids = set(re.findall(r"(?<!\w)mfr_[a-z0-9_]+", row))
        move_ids = set(re.findall(r"(?<!\w)mv_[a-z0-9_]+", row))
        if len(route_ids) != 1 or len(move_ids) != 1:
            continue
        move_id, route_id = next(iter(move_ids)), next(iter(route_ids))
        fragment = _step_fragment(row, headers.get(number, ()))
        final = "MoveDef{" in row and "MeridianRouteDef{" in row
        if final:
            skills = set(re.findall(r"(?<!\w)sk_[a-z0-9_]+", row))
            grade = checker._grade_from_line(row)
            if len(skills) == 1 and grade is not None:
                skill_id = next(iter(skills))
                grades.setdefault(skill_id, grade)
                if re.search(r"MoveDef\{[^}]*\bultimate\s*:\s*true", row):
                    targets.setdefault(move_id, checker.RouteMirror(
                        move_id, route_id, skill_id, number, True
                    ))
        if fragment or final:
            candidates.setdefault(move_id, []).append((2 if final else 1, number, row, fragment))
    bodies = checker.parse_body_for_targets(text, targets)
    result = []
    for move_id, target in sorted(targets.items()):
        if checker.is_official_catalog(path) and name == "wujue" and move_id in checker.EXTERNAL_WUJUE:
            continue
        tier = checker.grade_tier(grades.get(target.skill_id or ""))
        if tier not in TIERS:
            continue
        rows = candidates.get(move_id, [])
        if rows:
            _, number, row, fragment = max(rows, key=lambda item: (item[0], -item[1]))
            points, cts, risks = _values(fragment, row)
            recovery = _recovery(row)
            if recovery is None and "recovery" not in row and RESOURCE_ROW.search(row) is None:
                body = bodies.get(move_id)
                recovery = body.recovery if body else None
            result.append(ActualRoute(name, path.name, number, target.skill_id or "", move_id,
                                      target.route_id, tier, points, cts, risks, recovery, _valid_points(points)))
        else:
            result.append(ActualRoute(name, path.name, target.line, target.skill_id or "",
                                      move_id, target.route_id, tier))
    return result


def _yaml_values(block: str):
    """Read every inline YAML step; unsupported/malformed rows fail closed."""
    lines = block.splitlines()
    starts = [index for index, line in enumerate(lines) if line == "    steps:"]
    if len(starts) != 1:
        return (), (), (), False
    start = starts[0] + 1
    end = next((index for index in range(start, len(lines))
                if re.match(r"^    [A-Za-z_]\w*:", lines[index])), len(lines))
    # A sibling field may follow steps, but cannot hide malformed later steps.
    for line in lines[end:]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if not re.fullmatch(
                r"    (?:moveRef|ultimate|purpose|requiredNature|innerGuard):.*", line):
            return (), (), (), False
    points, cts, risks = [], [], []
    for line in lines[start:end]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        step = re.fullmatch(r"      -\s*\{([^{}]*)\}\s*(?:#.*)?", line)
        if step is None:
            return tuple(points), tuple(cts), tuple(risks), False
        pairs = [part.strip().partition(":") for part in step[1].split(",")]
        fields = {key.strip(): value.strip() for key, _, value in pairs}
        if (any(not separator for _, separator, _ in pairs)
                or len(fields) != len(pairs)
                or not {"acupointRef", "segmentCt", "riskBp"} <= fields.keys()):
            return tuple(points), tuple(cts), tuple(risks), False
        points.append(fields["acupointRef"])
        cts.append(_integer(fields["segmentCt"]))
        risks.append(_integer(fields["riskBp"]))
    return tuple(points), tuple(cts), tuple(risks), _valid_points(tuple(points))


def _external_routes(path: Path, body_path: Path) -> list[ActualRoute]:
    checker = _checker()

    lines = path.read_text(encoding="utf-8").splitlines()
    body_lines = body_path.read_text(encoding="utf-8").splitlines()
    result = []
    for move_id, (skill_id, route_id, _) in sorted(checker.EXTERNAL_WUJUE.items()):
        starts = [index for index, line in enumerate(lines)
                  if re.fullmatch(r"  - id: " + re.escape(route_id), line)]
        if len(starts) != 1:
            result.append(ActualRoute("wujue", path.name, 1, skill_id, move_id, route_id, "天"))
            continue
        start = starts[0]
        # Only supported YAML siblings or the closing fence end a route.
        # In particular, an outdented step must reach the parser and fail.
        end = next((index for index in range(start + 1, len(lines))
                    if re.fullmatch(r"(?:  - id: mfr_[a-z0-9_]+|skillPatch:|```)",
                                    lines[index])), len(lines))
        block = "\n".join(lines[start:end])
        points, cts, risks, parsed = _yaml_values(block)
        body = next((line for line in body_lines if re.search(
            r"\bid:\s*" + re.escape(move_id) + r"\b", line)), "")
        valid = parsed and bool(re.search(r"^    moveRef: " + re.escape(move_id) + r"$", block, re.M))
        result.append(ActualRoute("wujue", path.name, start + 1, skill_id, move_id, route_id,
                                  "天", points, cts, risks, _recovery(body), valid))
    return result


def analyze_routes(routes: Iterable[ActualRoute], registered_acupoints: Iterable[str],
                   catalog_names: Iterable[str] = ()) -> RouteAuditReport:
    ordered = sorted(routes, key=lambda item: (item.catalog, item.source, item.line, item.route_id))
    registry = set(registered_acupoints)
    summaries = {name: RouteCatalogSummary(name) for name in catalog_names}
    findings = []
    for route in ordered:
        summary = summaries.setdefault(route.catalog, RouteCatalogSummary(route.catalog))
        summary.expected_by_tier[route.tier] += 1
        summary.parsed_by_tier[route.tier] += int(route.parsed)

        def add(code: str, detail: str) -> None:
            summary.findings[code] += 1
            findings.append(RouteFinding(code, route.catalog, route.source, route.line,
                                         route.skill_id, route.move_id, route.route_id, route.tier, detail))

        if not route.parsed:
            add("unparsed", "missing or malformed concrete final route; index is not steps")
            continue
        unknown = sorted(set(route.points) - registry)
        if unknown:
            add("unregistered", "unregistered acupoints: " + ",".join(unknown))
        if route.tier == "玄上":
            continue
        if len(set(route.points)) != len(route.points):
            add("duplicate", "repeated acupoints: " + ",".join(sorted(
                point for point, count in Counter(route.points).items() if count > 1)))
        if not 1 <= len(route.points) <= 18 or len(route.segment_ct) != len(route.points) or len(route.risks) != len(route.points):
            add("length", f"steps/CT/risk lengths={len(route.points)}/{len(route.segment_ct)}/{len(route.risks)}; required equal, 1..18")
        if any(value is None or not 40 <= value <= 120 for value in route.segment_ct):
            add("ct", "segmentCt must be integers in 40..120")
        if any(value is None or not 0 <= value <= 1200 for value in route.risks):
            add("risk", "riskBp must be integers in 0..1200")
        if route.recovery is None:
            add("recovery", "MoveDef.recovery is missing or non-integer")
        elif not 700 <= route.recovery <= 1500:
            add("recovery", "MoveDef.recovery outside 700..1500 (design/05 section 4.1)")
        elif all(value is not None for value in route.segment_ct):
            flow = sum(route.segment_ct)
            if route.recovery + flow > 2000:
                add("recovery", f"recovery + flowCt = {route.recovery} + {flow} = {route.recovery + flow} > 2000")
    return RouteAuditReport(ordered, findings, [summaries[name] for name in sorted(summaries)])


def audit_routes(paths: Iterable[Path], *, registered_acupoints: Iterable[str] | None = None,
                 external_path: Path | None = None,
                 external_body_path: Path | None = None) -> RouteAuditReport:
    """Check final routes; grade six only adds registry/parse diagnostics.

    A missing concrete definition is a finding, never an empty successful
    audit. External Wujue definitions are read only when its official catalog
    is present; all other input paths remain self-contained fixtures.
    """
    checker = _checker()
    catalog_paths = tuple(paths)
    registry = checker.load_acupoint_meridians() if registered_acupoints is None else registered_acupoints
    routes = [route for path in catalog_paths for route in _catalog_routes(path)]
    if any(checker.is_official_catalog(path) and checker.catalog_name(path) == "wujue"
           for path in catalog_paths):
        routes.extend(_external_routes(
            external_path or checker.MERIDIAN_FLOW_PATH,
            external_body_path or checker.ROOT / "docs/design/05-martial-arts-system.md",
        ))
    return analyze_routes(routes, registry, map(checker.catalog_name, catalog_paths))

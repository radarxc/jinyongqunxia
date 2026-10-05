#!/usr/bin/env python3
"""检查显式路线的跨武学完全重复与 ≥80% 穴位集合重合。

指定图鉴时仍与全仓路线比较；--all 报告全仓。仅绑定共享模板的普通路线
不展开，技能专属局部覆写若写全 steps 则纳入。默认普通相关命中只报告；
--strict-normal 令普通相关完全重复失败。绝招之间的完全重复一直失败。
"""
import argparse
from collections import defaultdict
from dataclasses import asdict, dataclass
import json
from pathlib import Path
import re
import sys
from typing import Iterable

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools" / "lint"))
import check_skill_catalogs as catalogs  # noqa: E402


@dataclass(frozen=True)
class CatalogRoute:
    catalog: str
    source: str
    line: int
    skill_id: str
    move_id: str
    route_id: str
    signature: tuple[str, ...]
    kind: str = "normal"


def _source(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path.resolve())


def _ids(prefix: str, text: str) -> list[str]:
    return list(dict.fromkeys(re.findall(rf"\b{prefix}_[a-z0-9_]+", text)))


def _local_alias(line: str, headers: tuple[str, ...]) -> str | None:
    """A skill-owned override is explicit even when it has no runtime ID yet."""
    cells = catalogs._table_cells(line)
    for header, cell in zip(headers, cells):
        if re.search(r"局部.*(?:模板|别名)|(?:模板|别名).*局部", header):
            return cell.strip("` ")
    return None


def collect_normal_routes(paths: Iterable[Path]) -> list[CatalogRoute]:
    """Read concrete skill/move steps without expanding shared templates.

    Endpoint hints and mirrored references are not route definitions. The
    sequence helper preserves repeated *real* nodes; it only excludes hints.
    Local aliases are report labels, not newly registered mfr IDs.
    """
    result: list[CatalogRoute] = []
    for path in paths:
        text = path.read_text(encoding="utf-8")
        owners = catalogs._move_owners(text)
        mirrors = catalogs.parse_route_mirrors(text)
        contexts = catalogs._move_contexts(text)
        headers = catalogs._table_headers_by_line(text)
        ultimate_ids = {
            item.route_id for item in catalogs.parse_audit_instances(text).values()
            if item.body_ultimate is True or item.route_ultimate is True
        } | {item.route_id for item in mirrors.values() if item.ultimate}
        seen: set[tuple[str, str]] = set()
        for number, line in enumerate(text.splitlines(), 1):
            # ap references without explicit sequencing are often endpoint
            # hints beside a shared-template binding, not expanded steps.
            points = catalogs.route_sequence_points(line, headers.get(number, ()))
            if not points:
                continue
            route_ids, moves, skills = (_ids(prefix, line) for prefix in ("mfr", "mv", "sk"))
            alias = _local_alias(line, headers.get(number, ()))
            if len(route_ids) > 1 or len(moves) > 1:
                continue
            explicit_steps = any(re.search(r"steps|步骤|序列", header, re.I)
                                 for header in headers.get(number, ()))
            if not route_ids and not (len(skills) == 1 and (alias or explicit_steps)):
                continue
            route_id = route_ids[0] if route_ids else alias or (
                f"derived:{moves[0]}" if moves else f"local:{skills[0]}:{number}"
            )
            move_id = moves[0] if moves else (
                "mv_" + route_id.removeprefix("mfr_") if route_ids else ""
            )
            if (route_id in ultimate_ids or catalogs._route_flag(line) is True
                    or catalogs._explicit_bool(contexts.get(move_id, ""), "ultimate") is True):
                continue
            skill_id = owners.get(move_id)
            if len(skills) == 1:
                skill_id = skills[0]
            if skill_id is None and move_id in mirrors:
                skill_id = mirrors[move_id].skill_id
            if not skill_id or (skill_id, route_id) in seen:
                continue
            seen.add((skill_id, route_id))
            result.append(CatalogRoute(
                catalogs.catalog_name(path), _source(path), number,
                skill_id, move_id, route_id, points,
            ))
    return sorted(result, key=lambda route: (route.source, route.line, route.route_id))


def collect_routes(paths: Iterable[Path]) -> list[CatalogRoute]:
    paths = tuple(paths)
    ultimate = []
    for path in paths:
        for item in catalogs.collect_diversity_routes([path]):
            source = path if item.source == path.name else catalogs.MERIDIAN_FLOW_PATH
            ultimate.append(CatalogRoute(
                item.catalog, _source(source), item.line, item.skill_id,
                item.move_id, item.route_id, item.signature, "ultimate",
            ))
    return sorted(
        ultimate + collect_normal_routes(paths),
        key=lambda route: (route.source, route.line, route.route_id),
    )


def analyze_routes(
    routes: Iterable[CatalogRoute], targets: set[str] | None = None,
) -> dict:
    """Compare different skills; targets contains normalized source paths.

    similar counts include exact pairs. warning counts exclude exact pairs.
    The Wujue-owned external definitions in design/21 follow a Wujue target.
    """
    route_list = tuple(routes)

    def selected(route: CatalogRoute) -> bool:
        return targets is None or route.source in targets or (
            route.catalog == "wujue" and
            _source(catalogs.CATALOG_DIR / "skills-wujue.md") in targets
        )

    pairs = []
    for index, left in enumerate(route_list):
        left_points = set(left.signature)
        for right in route_list[index + 1:]:
            if left.skill_id == right.skill_id or not (selected(left) or selected(right)):
                continue
            right_points = set(right.signature)
            denominator = min(len(left_points), len(right_points))
            if not denominator:
                continue
            shared = len(left_points & right_points)
            overlap_bp = 10000 * shared // denominator
            if overlap_bp < catalogs.DIVERSITY_OVERLAP_BP:
                continue
            pairs.append({
                "left": asdict(left), "right": asdict(right),
                "pair_type": "normal-normal" if left.kind == right.kind == "normal" else (
                    "ultimate-ultimate" if left.kind == right.kind == "ultimate" else "ultimate-normal"
                ),
                "shared_count": shared, "denominator": denominator,
                "overlap_bp": overlap_bp, "exact": left.signature == right.signature,
            })
    groups = defaultdict(list)
    for route in route_list:
        groups[route.signature].append(route)
    exact_groups = [
        {"signature": signature, "routes": [asdict(route) for route in group]}
        for signature, group in sorted(groups.items())
        if len({route.skill_id for route in group}) > 1 and any(map(selected, group))
    ]
    normal_pairs = [pair for pair in pairs if pair["pair_type"] != "ultimate-ultimate"]
    ultimate_pairs = [pair for pair in pairs if pair["pair_type"] == "ultimate-ultimate"]
    summary = {
        "route_count": len(route_list),
        "normal_route_count": sum(route.kind == "normal" for route in route_list),
        "ultimate_route_count": sum(route.kind == "ultimate" for route in route_list),
        "normal_exact_pair_count": sum(pair["exact"] for pair in normal_pairs),
        "normal_similar_pair_count": len(normal_pairs),
        "normal_warning_pair_count": sum(not pair["exact"] for pair in normal_pairs),
        "ultimate_exact_pair_count": sum(pair["exact"] for pair in ultimate_pairs),
        "ultimate_similar_pair_count": len(ultimate_pairs),
    }
    return {"summary": summary, "exact_groups": exact_groups, "pairs": pairs}


def exit_code(report: dict, strict_normal: bool = False) -> int:
    summary = report["summary"]
    return int(bool(summary["ultimate_exact_pair_count"] or (
        strict_normal and summary["normal_exact_pair_count"]
    )))


def _label(route: dict) -> str:
    kind = "绝招" if route["kind"] == "ultimate" else "普通"
    return f'{route["source"]}:{route["line"]} {route["skill_id"]}/{route["route_id"]}（{kind}）'


def print_report(report: dict) -> None:
    for pair in report["pairs"]:
        label = "完全相同" if pair["exact"] else "高度相似"
        print(f'{label}：{_label(pair["left"])} ↔ {_label(pair["right"])}；'
              f'{pair["shared_count"]}/{pair["denominator"]}，overlapBp={pair["overlap_bp"]}')
    summary = report["summary"]
    print(f'全仓显式路线：绝招 {summary["ultimate_route_count"]}，普通 {summary["normal_route_count"]}')
    print(f'检查范围内绝招之间完全相同：{summary["ultimate_exact_pair_count"]} 对；'
          f'普通相关完全相同：{summary["normal_exact_pair_count"]} 对；'
          f'普通相关 ≥80%：{summary["normal_similar_pair_count"]} 对'
          f'（含完全相同；其余 {summary["normal_warning_pair_count"]} 对）')


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="*", type=Path, help="待验收图鉴（与全仓比较）")
    parser.add_argument("--all", action="store_true", help="检查全仓图鉴")
    parser.add_argument("--json", action="store_true", help="输出完整 JSON 报告")
    parser.add_argument("--strict-normal", action="store_true", help="普通相关完全重复返回失败")
    args = parser.parse_args(argv)
    if not args.all and not args.files:
        parser.error("请指定图鉴路径或 --all")
    present = {path.resolve() for path in args.files if path.exists()}
    if not args.all and not present:
        if args.json:
            print(json.dumps({"skipped": True, "reason": "指定图鉴均不存在"}, ensure_ascii=False))
        else:
            print("指定图鉴均不存在（本任务未新建），跳过。")
        return 0
    paths = sorted(set(catalogs.CATALOG_PATHS) | present)
    try:
        report = analyze_routes(
            collect_routes(paths), None if args.all else {_source(path) for path in present},
        )
    except (OSError, ValueError) as error:
        if args.json:
            print(json.dumps({"error": str(error)}, ensure_ascii=False))
        else:
            print(f"路线读取失败：{error}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print_report(report)
    return exit_code(report, args.strict_normal)


if __name__ == "__main__":
    sys.exit(main())

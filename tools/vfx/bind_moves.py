#!/usr/bin/env python3
"""Build deterministic VFX bindings from catalog cards and the delivery lint.

Only declared move IDs (including documented compact suffixes) are expanded.
Cards without any move ID are not assigned invented gameplay definitions.
``catalog_moves(path)`` is the shared, read-only suite-checker interface.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from dataclasses import asdict
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools" / "lint"))
import check_skill_catalogs as catalog  # noqa: E402

OUTPUT = ROOT / "assets/default/vfx/bindings.yaml"
AUDIT_OUTPUT = ROOT / "docs/design/vfx/binding-audit.yaml"
MOVE = re.compile(r"\bmv_[a-z0-9]+(?:_[a-z0-9]+)*\b")
SUFFIX = re.compile(r"`(_[a-z0-9]+(?:_[a-z0-9]+)*)`")


def tier_for(grade: int | None) -> str:
    if grade is None:
        return "ungraded"
    return ("huang", "xuan", "di", "tian")[(grade - 1) // 3]


def _cards(text: str) -> list[tuple[str, int, str]]:
    """Reuse the canonical card boundaries; also accept ungraded headings."""
    blocks = catalog._skill_card_blocks(text)
    # A genuinely ungraded card still needs the author's plain-strike default.
    starts = {line for _, line, _ in blocks}
    heading = re.compile(r"^#{2,6}\s.*?\b(sk_[a-z0-9_]+)\b")
    current = None
    for number, line in enumerate(text.splitlines(), 1):
        match = heading.match(line)
        if match or re.match(r"^#{1,6}\s", line):
            if current:
                blocks.append((current[0], current[1], "\n".join(current[2])))
                current = None
            if match and number not in starts:
                current = (match[1], number, [line])
        elif current:
            current[2].append(line)
    if current:
        blocks.append((current[0], current[1], "\n".join(current[2])))
    return sorted(blocks, key=lambda item: item[1])


def _move_fragments(card: str, skill: str, initial_headers=()):
    """Read move table columns and compact card bodies, excluding passives."""
    headers: list[str] = list(initial_headers)
    for line in card.splitlines():
        if line.lstrip().startswith("|"):
            cells = catalog._table_cells(line)
            if any("招式" in cell for cell in cells) and not MOVE.search(line):
                headers = cells
                continue
            if cells and all(re.fullmatch(r"[-: ]+", cell) for cell in cells):
                continue
            indexes = [i for i, h in enumerate(headers) if "招式" in h]
            if not indexes:
                continue
            if len(cells) != len(headers):
                continue
            # Full move tables use one row; compact cards contain a move cell.
            compact = any(re.search(r"\bsk_[a-z0-9_]+", c) for c in cells)
            fragment = " ".join(cells[i] for i in indexes) if compact else line
        else:
            if line.startswith("#") or not (MOVE.search(line) or SUFFIX.search(line)):
                continue
            line = re.sub(r"招式\s*/\s*被动", "招式", line)
            if "被动" in line:
                line = line.split("被动", 1)[0]
            if not (MOVE.search(line) or SUFFIX.search(line)):
                continue
            if "招式" not in line and re.search(r"^\s*[-*]?\s*\*?\*?(?:获取|出处|来源|路线|reqs)", line):
                continue
            fragment = line
        fragment = SUFFIX.sub(lambda m: f"`mv_{skill[3:]}{m[1]}`", fragment)
        for move in dict.fromkeys(MOVE.findall(fragment)):
            yield move, catalog._local_move_action_fragment(fragment, move)


def _without_target_weapon(text: str) -> str:
    """Target equipment conditions are not the attacking actor's emitter."""
    target = r"(?:目标|对手|敌方|敌人)"
    whip = r"(?:金铃|[长软铁黑白蛛绳])?索|[绸缎丝腰]?带|鞭"
    held = rf"(?:持械|(?:持|用|握|挥|甩|舞)(?:{whip}|兵器|剑|刀|枪|棍)|的?兵器)"
    text = re.sub(rf"{target}\s*{held}", "", text)
    return re.sub(rf"对?{held}\s*{target}", "", text)


def _delivery(skill_context: str, move_context: str, original=None) -> str:
    if original is None:
        skill_context = _without_target_weapon(skill_context)
        move_context = _without_target_weapon(move_context)
    context = f"{skill_context} {move_context}"
    # Sonic is a rendering shape, while lint may classify its outlet as inner.
    if re.search(r"\bsonic\b|音功|音律|音波|声波|琴曲|箫曲", context):
        return "sonic"
    if re.search(r"category\s*[:：]\s*hidden|暗器|骑射|弓术|射艺", skill_context):
        return "throw"
    delivery = original or catalog._delivery_from_context(skill_context, move_context)
    if delivery:
        return delivery
    if re.search(r"subType\s*[:：]\s*fist\b|拳脚", skill_context):
        return "fist-grapple"
    if re.search(r"兵器|weaponReq", skill_context):
        return "weapon"
    return "unknown"


def _contexts(text: str) -> dict[str, str]:
    actions = catalog._skill_action_contexts(text)
    definitions = catalog._skill_contexts(text)
    return {skill: f"{definitions.get(skill, '')} {actions.get(skill, '')}"
            for skill in definitions.keys() | actions.keys()}


def catalog_moves(path: Path) -> list[dict]:
    """Return sorted, unique move records from one catalog, with no writes.

    Records expose move, skill, grade, ultimate, projection, delivery, nature,
    action_context and source. Ordinary compact suffixes are expanded only in
    a card's move cell/body, never in passive/prerequisite columns.
    """
    path = Path(path)
    text = path.read_text(encoding="utf-8")
    grades, _ = catalog.parse_skill_grades(text)
    natures = catalog._skill_natures(text)
    skill_contexts = _contexts(text)
    metadata = catalog._move_contexts(text)
    table_headers = catalog._table_headers_by_line(text)
    result: dict[str, dict] = {}
    for skill, line, card in _cards(text):
        identity = skill_contexts.get(skill) or card.splitlines()[0]
        for move, fragment in _move_fragments(card, skill, table_headers.get(line, ())):
            # Cross references in a card cannot transfer ownership.
            candidates = [s for s in grades if move.startswith(f"mv_{s[3:]}_")]
            if candidates and max(candidates, key=len) != skill:
                continue
            details = metadata.get(move, fragment)
            result[move] = {
                "move": move, "skill": skill, "grade": grades.get(skill),
                "ultimate": False,
                "projection": catalog._explicit_bool(details, "projection") is True,
                "delivery": _delivery(identity, fragment),
                "nature": catalog._explicit_nature(details) or natures.get(skill, "neutral"),
                "skill_context": identity,
                "action_context": f"{identity} {fragment}",
                "source": f"{path.name}:{line}",
            }
    # Some catalogs keep ordinary moves in an additional table without grade
    # headings; others mirror design/05-owned moves only in route/MoveDef rows.
    # Require a formal skill stem and an actual table/body declaration. This
    # reads existing IDs; no anonymous one-line skill receives invented moves.
    for number, line in enumerate(text.splitlines(), 1):
        if not line.lstrip().startswith("|"):
            continue
        for move in MOVE.findall(line):
            if move in result:
                continue
            candidates = [s for s in grades if move.startswith(f"mv_{s[3:]}_")]
            if not candidates:
                # A few established move stems differ from the skill slug;
                # an explicit same-row owner is stronger than that convention.
                owners = [s for s in re.findall(r"\bsk_[a-z0-9_]+", line) if s in grades]
                if len(set(owners)) != 1:
                    continue
                candidates = owners
            skill = max(candidates, key=len)
            identity = skill_contexts.get(skill, "")
            details = metadata.get(move, catalog._local_move_action_fragment(line, move))
            result[move] = {
                "move": move, "skill": skill, "grade": grades[skill],
                "ultimate": False,
                "projection": catalog._explicit_bool(details, "projection") is True,
                "delivery": _delivery(identity, details),
                "nature": catalog._explicit_nature(details) or natures.get(skill, "neutral"),
                "skill_context": identity,
                "action_context": f"{identity} {details}",
                "source": f"{path.name}:{number}",
            }
    # Exact same route collector used by --json --delivery, including the
    # explicitly documented design/05 + design/21 descending-dragon exception.
    for route in catalog.collect_delivery_routes([path]):
        apply_route(result, asdict(route), grades, skill_contexts)
    return [result[key] for key in sorted(result)]


def apply_route(records: dict, route: dict, grades: dict, contexts: dict) -> None:
    move, skill = route["move_id"], route["skill_id"]
    previous = records.get(move, {})
    action = route.get("action_context") or previous.get("action_context", "")
    identity = contexts.get(skill, "")
    records[move] = {
        "move": move, "skill": skill, "grade": grades.get(skill, previous.get("grade")),
        "ultimate": route["ultimate"], "projection": route["projection"],
        "delivery": _delivery(identity, action, route.get("delivery")),
        "nature": route.get("nature") or previous.get("nature", "neutral"),
        "skill_context": identity or previous.get("skill_context", ""),
        "action_context": f"{identity} {action}",
        "source": f"{route['source']}:{route['line']}",
    }


def emitter_for(record: dict) -> tuple[str | None, bool]:
    """Return rendering emitter and whether the requested sword fallback ran."""
    delivery = record["delivery"]
    direct = {"palm": "palm", "finger": "finger", "fist-grapple": "fist",
              "inner": None, "movement": "afterimage", "leg": "leg",
              "throw": "throw", "sonic": "instrument"}
    if delivery in direct:
        return direct[delivery], False
    # Resolve the actor's own type/name before considering move descriptions.
    # In particular, a sword's fan-shaped sweep or blade-breaking move does
    # not equip a fan or the opponent's blade.
    patterns = [("fan", r"扇(?!形)"), ("sabre", r"刀"), ("sword", r"剑"),
                ("staff", r"棍|棒|杖|杵"), ("spear", r"枪|矛|戟|槊|戈"),
                ("whip", r"鞭|索法|(?:金铃|[长软铁黑白蛛绳])索|[绸缎丝腰]带|(?:持|握|挥|甩|舞)[索带]")]
    for raw in (record.get("skill_context", ""), record["action_context"]):
        context = _without_target_weapon(raw)
        subtype = re.search(
            r"(?:subType|weaponReq|category)\s*[:：]\s*"
            r"(sword|blade|sabre|staff|spear|whip|fan)\b", context)
        if subtype:
            return {"blade": "sabre"}.get(subtype[1], subtype[1]), False
        category = re.search(r"兵器\s*[/／·]\s*([^·|（）()]+)", context)
        # Bare 索/带 is meaningful as an explicit weapon category only;
        # 探索, 目标带 mark and 带尸毒 do not identify a held weapon.
        if category and category[1].strip() in {"索", "带"}:
            return "whip", False
        for scope in ((category[1], context) if category else (context,)):
            for emitter, pattern in patterns:
                if re.search(pattern, scope):
                    return emitter, False
    return "sword", True


def make_binding(record: dict) -> tuple[dict, bool]:
    tier = tier_for(record["grade"])
    emitter, fallback = emitter_for(record)
    binding = {key: record[key] for key in ("move", "skill")}
    binding.update({"tier": tier, **{key: record[key] for key in
                    ("grade", "ultimate", "projection", "delivery", "nature")}})
    if tier in {"tian", "di"}:
        binding.update(mode="bespoke", suite=f"assets/default/vfx/{record['skill']}/moves/{record['move']}/")
        params = {}
    else:
        template = ("qi_projection" if record["projection"] else "afterimage") if tier == "xuan" else "plain_strike"
        binding.update(mode="template", template=template)
        params = {
            "qi_projection": {"duration_s": 0.6},
            "afterimage": {"copies": 4, "spacing_px": 28, "duration_s": 0.48, "stretch": 0.04},
            "plain_strike": {"duration_s": 0.32},
        }[template]
    binding.update(emitter=emitter, params=params)
    return binding, fallback


def collect_bindings(paths=None) -> tuple[list[dict], list[dict]]:
    paths = sorted(Path(p).resolve() for p in (paths or catalog.CATALOG_PATHS))
    command = [sys.executable, str(ROOT / "tools/lint/check_skill_catalogs.py"),
               "--json", "--delivery", "--details", *map(str, paths)]
    completed = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
    if completed.returncode:
        raise ValueError(f"catalog lint failed ({completed.returncode}): {completed.stderr or completed.stdout}")
    payload = json.loads(completed.stdout)
    if any(audit.get("errors") for audit in payload["audits"]):
        raise ValueError("catalog lint reports structural errors; fix upstream before binding")
    records, grades, contexts = {}, {}, {}
    for path in paths:
        text = path.read_text(encoding="utf-8")
        grades.update(catalog.parse_skill_grades(text)[0])
        contexts.update(_contexts(text))
        for record in catalog_moves(path):
            move = record["move"]
            if move in records and records[move]["skill"] != record["skill"]:
                raise ValueError(f"conflicting ownership for {move}")
            records[move] = record
    # JSON output is authoritative for all ultimate route fields.
    for route in payload["delivery"]["routes"]:
        apply_route(records, route, grades, contexts)
    bindings, fallbacks = [], []
    for move in sorted(records):
        binding, fallback = make_binding(records[move])
        bindings.append(binding)
        if fallback:
            fallbacks.append(records[move])
    return bindings, fallbacks


def serialize(bindings: list[dict]) -> str:
    # One JSON flow mapping per YAML sequence item: YAML 1.2, stable booleans,
    # safe Unicode, and one inspectable line per move without a PyYAML runtime.
    preface = ("# Generated by tools/vfx/bind_moves.py; do not edit by hand.\n"
               "# Card-only skills with no declared move ID are intentionally absent.\n")
    return preface + "".join("- " + json.dumps(row, ensure_ascii=False, separators=(", ", ": ")) + "\n" for row in bindings)


def binding_audit(bindings: list[dict], fallbacks: list[dict]) -> str:
    """Describe defaults and undeclared moves without fabricating identities."""
    skills, natures, move_natures = {}, {}, {}
    for path in catalog.CATALOG_PATHS:
        text = path.read_text(encoding="utf-8")
        grades, lines = catalog.parse_skill_grades(text)
        natures.update(catalog._skill_natures(text))
        for move, context in catalog._move_contexts(text).items():
            if nature := catalog._explicit_nature(context):
                move_natures[move] = nature
        for skill, grade in grades.items():
            row = skills.setdefault(skill, {"skill": skill, "grade": grade,
                                           "tier": tier_for(grade), "files": []})
            row["files"].append(f"{path.relative_to(ROOT)}:{lines[skill]}")
    bound_skills = {row["skill"] for row in bindings}
    absent = [{**row, "reason": "图鉴仅有武学卡/效果摘要，没有声明可绑定的招式ID或短后缀；不生成新招式"}
              for skill, row in sorted(skills.items()) if skill not in bound_skills]
    fallback_groups, defaults = {}, {}
    for row in fallbacks:
        group = fallback_groups.setdefault(row["skill"], {
            "skill": row["skill"], "moves": [], "sources": [],
            "reason": "动作/兵器未落入共享发出方映射，按作者默认使用sword", "emitter": "sword"})
        group["moves"].append(row["move"])
        group["sources"].append(row["source"])
    for row in bindings:
        if row["nature"] == "neutral" and row["skill"] not in natures and row["move"] not in move_natures:
            group = defaults.setdefault(row["skill"], {
                "skill": row["skill"], "moves": [], "nature": "neutral",
                "reason": "图鉴招式及武学卡均未声明nature，表现默认素白；运行时可传施展者性质"})
            group["moves"].append(row["move"])
    counts = {"moves": len(bindings), "explicit_move_ids": len({
        move for path in catalog.CATALOG_PATHS for move in MOVE.findall(path.read_text(encoding="utf-8"))}),
        "sword_fallback_moves": len(fallbacks), "sword_fallback_skills": len(fallback_groups),
        "skills_without_moves": len(absent), "nature_default_moves": sum(len(g["moves"]) for g in defaults.values())}
    for field in ("tier", "mode", "template", "emitter"):
        counts[field] = dict(sorted(Counter(str(row.get(field)) for row in bindings).items()))
    dump = lambda value: json.dumps(value, ensure_ascii=False, separators=(", ", ": "))
    result = ["# Generated by tools/vfx/bind_moves.py --audit; original presentation defaults.\n",
              "version: 1\n", "counts: " + dump(counts) + "\n"]
    for label, rows in (("sword_fallbacks", list(fallback_groups.values())),
                        ("skills_without_moves", absent), ("nature_defaults", list(defaults.values()))):
        result.append(f"{label}:" + ("\n" if rows else " []\n"))
        result.extend("  - " + dump(row) + "\n" for row in rows)
    return "".join(result)


def write_chunks(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = text.splitlines(keepends=True)
    with path.open("w", encoding="utf-8") as stream:
        for start in range(0, len(lines), 100):
            stream.writelines(lines[start:start + 100])


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare without writing")
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--audit", type=Path, nargs="?", const=AUDIT_OUTPUT,
                        help="also write/check a deterministic default audit (optional path)")
    args = parser.parse_args(argv)
    try:
        bindings, fallbacks = collect_bindings()
        expected = serialize(bindings)
        outputs = {args.output: expected}
        if args.audit:
            outputs[args.audit] = binding_audit(bindings, fallbacks)
        for key in ("tier", "mode", "template", "emitter"):
            counts = Counter(str(row.get(key)) for row in bindings)
            print(f"{key}: " + json.dumps(dict(sorted(counts.items())), ensure_ascii=False))
        grouped = defaultdict(list)
        for row in fallbacks:
            grouped[row["skill"]].append(row["move"])
        print(f"moves={len(bindings)} sword_fallbacks={len(fallbacks)}")
        for skill, moves in sorted(grouped.items()):
            print(f"FALLBACK {skill}: {', '.join(moves)}")
        if args.check:
            stale = [path for path, content in outputs.items()
                     if not path.is_file() or path.read_text(encoding="utf-8") != content]
            if stale:
                for path in stale:
                    print(f"ERROR stale or missing generated file: {path}", file=sys.stderr)
                return 1
            print("bindings up to date")
        else:
            for path, content in outputs.items():
                write_chunks(path, content)
                print(f"wrote {path}")
        return 0
    except (OSError, ValueError, KeyError) as exc:
        print(f"ERROR {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

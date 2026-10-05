#!/usr/bin/env python3
"""Validate a story.v1 line, its DAG invariants, and owned ID references."""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator, Mapping, Sequence

try:
    from tools.lint import check_ids
except ModuleNotFoundError:  # direct: python3 tools/lint/check_story_dag.py
    import check_ids  # type: ignore[no-redef]

try:
    import yaml
except ImportError:  # pragma: no cover - exercised only in an incomplete toolchain
    yaml = None  # type: ignore[assignment]


NODE_TYPES = {"spawn", "despawn", "dialogue", "quest", "choice", "condition", "merge", "end"}
EDGE_TRIGGERS = {"auto", "condition", "choice", "timeout"}
NODE_ID_RE = re.compile(r"^n_[a-z0-9_]+$")
EDGE_ID_RE = re.compile(r"^e_[a-z0-9_]+$")
LINE_ID_RE = re.compile(r"^(?:main|side_[a-z0-9_]+)$")
CHAPTER_ID_RE = re.compile(r"^ch(?:0[0-9]|1[0-5])_[a-z0-9_]+$")
ERA_RE = re.compile(r"^ch(?:0[0-9]|1[0-5])$")
CONTENT_ID_RES = {
    "npc": re.compile(r"^npc_[a-z0-9_]+$"),
    "quest": re.compile(r"^q_[a-z0-9_]+$"),
    "scene": re.compile(r"^sc_[a-z0-9_]+$"),
}
OWNER_GLOBS = {
    "npc": ("docs/design/catalog/npcs-*.md",),
    "quest": ("docs/design/story/*.md",),
    "scene": ("docs/design/chapters/*.md",),
}


@dataclass(frozen=True)
class Issue:
    code: str
    path: str
    message: str

    def render(self) -> str:
        return f"ERROR [{self.code}] {self.path}: {self.message}"


@dataclass(frozen=True)
class Registries:
    npc: frozenset[str]
    quest: frozenset[str]
    scene: frozenset[str]


def _is_int(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _is_nonempty_string(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _add(issues: list[Issue], code: str, path: str, message: str) -> None:
    issues.append(Issue(code, path, message))


def load_registries(repo_root: Path) -> Registries:
    warnings: list[str] = []
    prefixes, _ = check_ids.parse_prefixes(repo_root / check_ids.CANON_REL, warnings)
    id_regex = check_ids.compile_id_regex(prefixes)
    values: dict[str, frozenset[str]] = {}
    for family, globs in OWNER_GLOBS.items():
        paths = {path for glob in globs for path in repo_root.glob(glob) if path.is_file()}
        documents = [
            document for path in sorted(paths)
            if (document := check_ids.load_document(path, repo_root, warnings)) is not None
        ]
        _, definitions = check_ids.extract_occurrences(documents, prefixes, id_regex)
        check_ids.expand_range_definitions(documents, definitions, prefixes)
        pattern = CONTENT_ID_RES[family]
        values[family] = frozenset(item.id for item in definitions if pattern.fullmatch(item.id))
    return Registries(values["npc"], values["quest"], values["scene"])


def _walk_scalars(value: object, path: str = "$") -> Iterator[tuple[str, object]]:
    if isinstance(value, Mapping):
        for key, child in value.items():
            yield from _walk_scalars(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _walk_scalars(child, f"{path}[{index}]")
    else:
        yield path, value


def _calendar_tuple(value: object, path: str, issues: list[Issue]) -> tuple[int, ...] | None:
    if not isinstance(value, Mapping):
        _add(issues, "TIME_FORMAT", path, "must be a date-time mapping")
        return None
    fields = ("year", "month", "day", "hour", "minute")
    if any(not _is_int(value.get(field)) for field in fields):
        _add(issues, "TIME_FORMAT", path, "year/month/day/hour/minute must be integers")
        return None
    result = tuple(int(value[field]) for field in fields)
    if not (1 <= result[1] <= 12 and 1 <= result[2] <= 30 and 0 <= result[3] <= 23 and 0 <= result[4] <= 59):
        _add(issues, "TIME_RANGE", path, "expected month 1..12, day 1..30, hour 0..23, minute 0..59")
        return None
    return result


def _validate_on_miss(value: object, path: str, issues: list[Issue]) -> tuple[str | None, str | None]:
    if not isinstance(value, Mapping):
        _add(issues, "TIME_ON_MISS", path, "onMiss must be a mapping")
        return None, None
    policy = value.get("policy")
    if policy not in {"expire", "defer", "alternate"}:
        _add(issues, "TIME_ON_MISS", path, "policy must be expire, defer, or alternate")
        return None, None
    target = value.get("targetNodeId")
    if policy == "alternate":
        if not isinstance(target, str) or not NODE_ID_RE.fullmatch(target):
            _add(issues, "TIME_ALTERNATE", path, "alternate requires a valid targetNodeId")
            target = None
    elif target is not None:
        _add(issues, "TIME_ON_MISS", path, f"{policy} forbids targetNodeId")
    if policy == "defer":
        delay = value.get("deferByMinutes")
        maximum = value.get("maxDefers", 1)
        if not _is_int(delay) or int(delay) <= 0:
            _add(issues, "TIME_DEFER", path, "deferByMinutes must be a positive integer")
        if not _is_int(maximum) or not 1 <= int(maximum) <= 9:
            _add(issues, "TIME_DEFER", path, "maxDefers must be an integer in 1..9")
    return str(policy), target if isinstance(target, str) else None


def _validate_time_window(value: object, path: str, issues: list[Issue]) -> tuple[str | None, str | None]:
    if not isinstance(value, Mapping):
        _add(issues, "TIME_FORMAT", path, "timeWindow must be a mapping")
        return None, None
    mode = value.get("mode")
    policy, target = _validate_on_miss(value.get("onMiss"), f"{path}.onMiss", issues)
    if mode == "absolute":
        if not _is_nonempty_string(value.get("epochId")):
            _add(issues, "TIME_FORMAT", path, "absolute window requires epochId")
        start = _calendar_tuple(value.get("opensAt"), f"{path}.opensAt", issues)
        end = _calendar_tuple(value.get("closesAt"), f"{path}.closesAt", issues)
        if start is not None and end is not None and start >= end:
            _add(issues, "TIME_ORDER", path, "opensAt must be earlier than closesAt")
        forbidden = {"anchor", "opensAfterMinutes", "closesAfterMinutes"} & set(value)
    elif mode == "relative":
        anchor = value.get("anchor")
        if not isinstance(anchor, Mapping) or anchor.get("event") not in {
            "story/nodeCompleted", "quest/accepted", "quest/succeeded", "quest/failed"
        }:
            _add(issues, "TIME_ANCHOR", f"{path}.anchor", "anchor event is missing or unsupported")
        elif anchor.get("event") == "story/nodeCompleted" and not NODE_ID_RE.fullmatch(str(anchor.get("nodeId", ""))):
            _add(issues, "TIME_ANCHOR", f"{path}.anchor", "story/nodeCompleted requires nodeId")
        elif str(anchor.get("event", "")).startswith("quest/") and not CONTENT_ID_RES["quest"].fullmatch(str(anchor.get("questId", ""))):
            _add(issues, "TIME_ANCHOR", f"{path}.anchor", "quest event requires questId")
        opens, closes = value.get("opensAfterMinutes"), value.get("closesAfterMinutes")
        if not _is_int(opens) or int(opens) < 0 or not _is_int(closes) or int(closes) <= 0:
            _add(issues, "TIME_RANGE", path, "relative bounds must be non-negative/positive integers")
        elif int(opens) >= int(closes):
            _add(issues, "TIME_ORDER", path, "opensAfterMinutes must be less than closesAfterMinutes")
        forbidden = {"epochId", "opensAt", "closesAt"} & set(value)
    else:
        _add(issues, "TIME_MODE", path, "mode must be absolute or relative")
        forbidden = set()
    if forbidden:
        _add(issues, "TIME_MODE", path, f"mode {mode!r} forbids {sorted(forbidden)}")
    return policy, target


def _validate_payload(node: Mapping[str, Any], path: str, era_layer: object, issues: list[Issue]) -> None:
    node_type = node.get("type")
    payload = node.get("payload")
    if not isinstance(payload, Mapping):
        _add(issues, "NODE_PAYLOAD", f"{path}.payload", "must be a mapping")
        return
    required: dict[str, tuple[str, ...]] = {
        "spawn": ("npcId", "sceneId", "anchor", "eraLayer"),
        "despawn": ("npcId", "sceneId", "anchor", "eraLayer", "reason"),
        "choice": ("decisionId", "options"),
        "condition": ("expression",),
        "merge": ("mergeKey",),
        "end": ("endingTags",),
    }
    for field in required.get(str(node_type), ()):
        if field not in payload:
            _add(issues, "NODE_PAYLOAD", f"{path}.payload", f"{node_type} requires {field}")
    if node_type in {"spawn", "despawn"} and payload.get("eraLayer") != era_layer:
        _add(issues, "ERA_LAYER", f"{path}.payload.eraLayer", "must equal StoryLine eraLayer")
    if node_type == "dialogue" and (("ink" in payload) + ("inlineLines" in payload) != 1):
        _add(issues, "NODE_PAYLOAD", f"{path}.payload", "dialogue requires exactly one of ink or inlineLines")
    if node_type == "quest" and (("questId" in payload) + ("inlineEvent" in payload) != 1):
        _add(issues, "NODE_PAYLOAD", f"{path}.payload", "quest requires exactly one of questId or inlineEvent")
    elif node_type == "quest" and "inlineEvent" in payload and node.get("completeOn") != "immediate":
        _add(issues, "NODE_COMPLETE_ON", f"{path}.completeOn", "inlineEvent quest must complete immediately after its atomic actions")
    if node_type == "choice":
        options = payload.get("options")
        if not isinstance(options, list) or len(options) < 2:
            _add(issues, "CHOICE_OPTIONS", f"{path}.payload.options", "must contain at least two options")
        elif any(not isinstance(item, Mapping) or not _is_nonempty_string(item.get("key")) for item in options):
            _add(issues, "CHOICE_OPTIONS", f"{path}.payload.options", "each option requires a non-empty key")
        else:
            keys = [str(item["key"]) for item in options]
            if len(keys) != len(set(keys)):
                _add(issues, "CHOICE_OPTIONS", f"{path}.payload.options", "option keys must be unique")
    if node_type == "end" and (not isinstance(payload.get("endingTags"), list) or not payload.get("endingTags")):
        _add(issues, "END_TAGS", f"{path}.payload.endingTags", "must be a non-empty list")


def _validate_references(data: Mapping[str, Any], registries: Registries, issues: list[Issue]) -> None:
    expected = {"npcId": ("npc", registries.npc), "questId": ("quest", registries.quest), "sceneId": ("scene", registries.scene)}
    for path, value in _walk_scalars(data):
        field = path.rsplit(".", 1)[-1]
        if field not in expected or not isinstance(value, str):
            continue
        family, known = expected[field]
        if not CONTENT_ID_RES[family].fullmatch(value):
            _add(issues, "ID_FORMAT", path, f"invalid {family} ID {value!r}")
        elif value not in known:
            _add(issues, "ID_UNKNOWN", path, f"{value!r} is absent from {family} owner documents")
        
    for path, value in _walk_scalars(data):
        if path.rsplit(".", 1)[-1] in expected or not isinstance(value, str):
            continue
        for family, pattern in CONTENT_ID_RES.items():
            if not pattern.fullmatch(value):
                continue
            known = getattr(registries, family)
            if value not in known:
                _add(issues, "ID_UNKNOWN", path, f"{value!r} is absent from {family} owner documents")
            break


def validate_story(data: object, registries: Registries) -> list[Issue]:
    issues: list[Issue] = []
    if not isinstance(data, Mapping):
        return [Issue("ROOT_TYPE", "$", "document root must be a mapping")]
    if data.get("schemaVersion") != "story.v1":
        _add(issues, "SCHEMA_VERSION", "$.schemaVersion", "must equal story.v1")
    chapter, line_id, kind, era = data.get("chapterId"), data.get("lineId"), data.get("kind"), data.get("eraLayer")
    if not isinstance(chapter, str) or not CHAPTER_ID_RE.fullmatch(chapter):
        _add(issues, "CHAPTER_ID", "$.chapterId", "invalid chapter ID")
    if not isinstance(line_id, str) or not LINE_ID_RE.fullmatch(line_id):
        _add(issues, "LINE_ID", "$.lineId", "expected main or side_<semantic>")
    if kind not in {"main", "side"} or ((line_id == "main") != (kind == "main")):
        _add(issues, "LINE_KIND", "$.kind", "kind main iff lineId is main")
    if not _is_nonempty_string(data.get("titleKey")):
        _add(issues, "LINE_FIELD", "$.titleKey", "must be a non-empty string")
    source_ref = data.get("source")
    if (not isinstance(source_ref, Mapping) or not _is_nonempty_string(source_ref.get("document"))
            or not isinstance(source_ref.get("anchors"), list) or not source_ref.get("anchors")):
        _add(issues, "LINE_SOURCE", "$.source", "requires document and a non-empty anchors list")
    if not isinstance(era, str) or not ERA_RE.fullmatch(era):
        _add(issues, "ERA_LAYER", "$.eraLayer", "invalid era layer")
    elif isinstance(chapter, str) and chapter[:4] != era:
        _add(issues, "ERA_LAYER", "$.eraLayer", "must match the chapter numeric prefix")
    nodes_raw, edges_raw = data.get("nodes"), data.get("edges")
    if not isinstance(nodes_raw, list) or not nodes_raw:
        _add(issues, "NODES", "$.nodes", "must be a non-empty list")
        return issues
    if not isinstance(edges_raw, list):
        _add(issues, "EDGES", "$.edges", "must be a list")
        return issues
    nodes = [item for item in nodes_raw if isinstance(item, Mapping)]
    edges = [item for item in edges_raw if isinstance(item, Mapping)]
    if len(nodes) != len(nodes_raw):
        _add(issues, "NODE_TYPE", "$.nodes", "every node must be a mapping")
    if len(edges) != len(edges_raw):
        _add(issues, "EDGE_TYPE", "$.edges", "every edge must be a mapping")
    node_ids = [node.get("id") for node in nodes if isinstance(node.get("id"), str)]
    edge_ids = [edge.get("id") for edge in edges if isinstance(edge.get("id"), str)]
    for index, node in enumerate(nodes):
        path = f"$.nodes[{index}]"
        if not isinstance(node.get("id"), str) or not NODE_ID_RE.fullmatch(str(node.get("id"))):
            _add(issues, "NODE_ID", f"{path}.id", "invalid node ID")
        if node.get("type") not in NODE_TYPES:
            _add(issues, "NODE_TYPE", f"{path}.type", f"expected one of {sorted(NODE_TYPES)}")
        for field in ("titleKey", "completeOn", "sourceRef"):
            if not _is_nonempty_string(node.get(field)):
                _add(issues, "NODE_FIELD", f"{path}.{field}", "must be a non-empty string")
        _validate_payload(node, path, era, issues)
    duplicates = sorted(str(key) for key, count in Counter(node_ids).items() if count > 1)
    if duplicates:
        _add(issues, "NODE_DUPLICATE", "$.nodes", f"duplicate IDs: {duplicates}")
    duplicates = sorted(str(key) for key, count in Counter(edge_ids).items() if count > 1)
    if duplicates:
        _add(issues, "EDGE_DUPLICATE", "$.edges", f"duplicate IDs: {duplicates}")
    known_nodes = {item for item in node_ids if isinstance(item, str)}
    outgoing: dict[str, list[Mapping[str, Any]]] = defaultdict(list)
    incoming: Counter[str] = Counter()
    for index, edge in enumerate(edges):
        path = f"$.edges[{index}]"
        if not isinstance(edge.get("id"), str) or not EDGE_ID_RE.fullmatch(str(edge.get("id"))):
            _add(issues, "EDGE_ID", f"{path}.id", "invalid edge ID")
        source, target, trigger = edge.get("from"), edge.get("to"), edge.get("trigger")
        if not isinstance(source, str) or not isinstance(target, str) or source not in known_nodes or target not in known_nodes:
            _add(issues, "EDGE_REFERENCE", path, f"edge endpoints must exist: {source!r} -> {target!r}")
            continue
        if source == target:
            _add(issues, "GRAPH_CYCLE", path, "self-loop is forbidden")
        if trigger not in EDGE_TRIGGERS:
            _add(issues, "EDGE_TRIGGER", f"{path}.trigger", f"expected one of {sorted(EDGE_TRIGGERS)}")
        if not _is_int(edge.get("priority")) or not 0 <= int(edge.get("priority", -1)) <= 1000:
            _add(issues, "EDGE_PRIORITY", f"{path}.priority", "must be an integer in 0..1000")
        if trigger == "condition" and "condition" not in edge:
            _add(issues, "EDGE_CONDITION", path, "condition edge requires condition")
        if trigger == "choice" and not _is_nonempty_string(edge.get("choiceKey")):
            _add(issues, "EDGE_CHOICE", path, "choice edge requires choiceKey")
        outgoing[str(source)].append(edge)
        incoming[str(target)] += 1
    zero_indegree = sorted(node_id for node_id in known_nodes if incoming[node_id] == 0)
    if len(zero_indegree) != 1:
        _add(issues, "GRAPH_START_COUNT", "$.startNodeId", f"expected one zero-indegree node, found {zero_indegree}")
    if data.get("startNodeId") not in known_nodes:
        _add(issues, "GRAPH_START", "$.startNodeId", "must reference an existing node")
    elif zero_indegree != [data.get("startNodeId")]:
        _add(issues, "GRAPH_START", "$.startNodeId", f"must equal the unique zero-indegree node {zero_indegree}")
    start = data.get("startNodeId")
    reachable: set[str] = set()
    if isinstance(start, str) and start in known_nodes:
        queue = deque([start])
        while queue:
            current = queue.popleft()
            if current in reachable:
                continue
            reachable.add(current)
            queue.extend(str(edge["to"]) for edge in outgoing[current])
    missing = sorted(known_nodes - reachable)
    if missing:
        _add(issues, "GRAPH_UNREACHABLE", "$.nodes", f"unreachable nodes: {missing}")
    indegree = {node_id: incoming[node_id] for node_id in known_nodes}
    queue = deque(sorted(node_id for node_id, degree in indegree.items() if degree == 0))
    visited = 0
    while queue:
        current = queue.popleft()
        visited += 1
        for edge in outgoing[current]:
            target = str(edge["to"])
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if visited != len(known_nodes):
        _add(issues, "GRAPH_CYCLE", "$.edges", "the full edge set contains a directed cycle")
    by_id = {str(node["id"]): node for node in nodes if isinstance(node.get("id"), str)}
    for node_id, node in by_id.items():
        node_edges = outgoing[node_id]
        if node.get("type") == "end":
            if node_edges:
                _add(issues, "END_OUTGOING", f"node:{node_id}", "end nodes must have no outgoing edges")
        elif not node_edges:
            _add(issues, "NODE_DEAD_END", f"node:{node_id}", "non-end nodes need an outgoing edge")
        if node.get("type") == "choice":
            options = node.get("payload", {}).get("options", [])
            expected = Counter(str(item.get("key")) for item in options if isinstance(item, Mapping))
            actual = Counter(str(edge.get("choiceKey")) for edge in node_edges if edge.get("trigger") == "choice")
            if actual != expected:
                _add(issues, "CHOICE_COVERAGE", f"node:{node_id}", f"choice edges {dict(actual)} do not match options {dict(expected)}")
        if node.get("type") in {"condition", "merge"} and len(node_edges) > 1:
            auto_count = sum(edge.get("trigger") == "auto" for edge in node_edges)
            condition_count = sum(edge.get("trigger") == "condition" for edge in node_edges)
            if not (auto_count == 1 or condition_count == len(node_edges)):
                _add(issues, "EDGE_FALLBACK", f"node:{node_id}", "multi-route condition/merge needs all condition edges or one auto fallback")
        window = node.get("timeWindow")
        policy = target = None
        if window is not None:
            policy, target = _validate_time_window(window, f"node:{node_id}.timeWindow", issues)
        timeout_edges = [edge for edge in node_edges if edge.get("trigger") == "timeout"]
        if policy == "alternate":
            if len(timeout_edges) != 1 or timeout_edges[0].get("to") != target:
                _add(issues, "TIMEOUT_EDGE", f"node:{node_id}", "alternate requires exactly one timeout edge to targetNodeId")
        elif timeout_edges:
            _add(issues, "TIMEOUT_EDGE", f"node:{node_id}", "timeout edge requires alternate timeWindow policy")
    trigger = data.get("trigger")
    if trigger is not None and not isinstance(trigger, Mapping):
        _add(issues, "LINE_TRIGGER", "$.trigger", "must be a mapping")
    if isinstance(trigger, Mapping) and "timeWindow" in trigger:
        policy, _ = _validate_time_window(trigger["timeWindow"], "$.trigger.timeWindow", issues)
        if kind == "main" and policy == "expire":
            _add(issues, "MAIN_EXPIRE", "$.trigger.timeWindow", "main lines cannot permanently expire")
    hooks = data.get("sideHooks", [])
    if not isinstance(hooks, list):
        _add(issues, "SIDE_HOOK", "$.sideHooks", "must be a list")
        hooks = []
    if kind == "side" and hooks:
        _add(issues, "SIDE_HOOK", "$.sideHooks", "side lines cannot own sideHooks")
    for hook_index, hook in enumerate(hooks):
        if (not isinstance(hook, Mapping) or not str(hook.get("lineId", "")).startswith("side_")
                or hook.get("atNodeId") not in known_nodes or not isinstance(hook.get("when"), Mapping)):
            _add(issues, "SIDE_HOOK", f"$.sideHooks[{hook_index}]", "requires side_* lineId and a local atNodeId")
    _validate_references(data, registries, issues)
    return issues


def find_repo_root(path: Path) -> Path:
    start = path.resolve() if path.is_dir() else path.resolve().parent
    for candidate in (start, *start.parents):
        if (candidate / "docs").is_dir() and (candidate / "tools").is_dir():
            return candidate
    raise ValueError(f"cannot locate repository root from {path}")


def check_file(path: Path, repo_root: Path | None = None) -> list[Issue]:
    if yaml is None:
        return [Issue("DEPENDENCY", str(path), "PyYAML is required: python3 -m pip install PyYAML")]
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except OSError as exc:
        return [Issue("FILE_READ", str(path), str(exc))]
    except yaml.YAMLError as exc:
        return [Issue("YAML_PARSE", str(path), str(exc))]
    try:
        root = repo_root.resolve() if repo_root is not None else find_repo_root(path)
    except ValueError as exc:
        return [Issue("REPO_ROOT", str(path), str(exc))]
    return validate_story(data, load_registries(root))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("yaml_files", nargs="+", type=Path, help="story.v1 YAML files")
    parser.add_argument("--repo-root", type=Path, help="repository root (auto-detected by default)")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    failures = 0
    for path in args.yaml_files:
        issues = check_file(path, args.repo_root)
        if issues:
            failures += 1
            for issue in issues:
                print(issue.render(), file=sys.stderr)
        else:
            print(f"OK {path}: story.v1 DAG valid")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

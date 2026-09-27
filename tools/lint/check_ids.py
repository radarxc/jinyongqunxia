#!/usr/bin/env python3
"""Check cross-document content-ID consistency in the tianshu docs.

The checker deliberately favours precision over recall.  A token is a
definition only when both its Markdown/YAML shape and its owning document
agree; examples, placeholders, migration notes, and proposed IDs are retained
as provenance but are not treated as live references.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Mapping, Optional, Sequence, Set, Tuple


VERSION = 1
BASELINE_VERSION = 1
CANON_REL = "docs/00-canon.md"
RULINGS_REL = "docs/decisions/rulings-v1.md"
SET_SYSTEM_REL = "docs/design/07-set-system.md"
BASELINE_REL = "tools/lint/check_ids_baseline.json"
NEAR_ALLOWLIST_REL = "tools/lint/check_ids_near_allowlist.json"
DATA_SOURCE_PATTERNS: Tuple[str, ...] = ("docs/design/map/*.yaml",)

# Fallback only: the normal source of truth is Canon section 12.  Keep this
# table usable when the checker is copied into a partial checkout.
DEFAULT_PREFIXES: Tuple[str, ...] = (
    "ch", "sk_", "mv_", "bf_", "set_", "eq_", "it_",
    "tr_", "npc_", "q_", "sect_", "rg_", "tsp_", "tal_",
    "tmpl_", "arch_", "fam_", "exg_", "rx_", "rs_", "lg_",
    "echo_", "save_", "bs_", "ps_", "aoe_", "vow_", "af_",
    "ue_", "ins_", "rc_", "ev_", "tst_", "gate_", "end_",
    "ach_", "ttl_", "diff_", "rule_", "tj_", "sh_", "sqj_",
    "fin_", "yy_", "enc_", "bsc_", "cmb_", "tg_", "wk_",
    "gauge_", "pers_", "ea_", "ai_",
    "origin_", "mer_", "ap_", "zt_", "res_", "rp_",
    "sv_", "biz_", "job_", "city_", "sc_", "poi_",
    "offmap_", "post_", "port_", "route_", "dc_", "lgs_",
    "frag_", "cache_", "vid_",
)

# Configurable ownership map derived from Canon section 18 and the concrete
# repository layout.  Values are repository-relative fnmatch patterns.
# Canon definitions have an additional section guard in definition_allowed().
OWNERSHIP: Mapping[str, Tuple[str, ...]] = {
    "ch": (CANON_REL,),
    "sk_": ("docs/design/catalog/*.md", "docs/design/05-martial-arts-system.md", CANON_REL),
    "mv_": ("docs/design/catalog/*.md", "docs/design/05-martial-arts-system.md"),
    "ps_": ("docs/design/catalog/*.md", "docs/design/05-martial-arts-system.md"),
    "aoe_": ("docs/design/09-combat-system.md",),
    "vow_": ("docs/design/05-martial-arts-system.md",),
    "bf_": ("docs/design/06-buff-system.md",),
    "fam_": ("docs/design/06-buff-system.md",),
    "exg_": ("docs/design/06-buff-system.md",),
    "rx_": ("docs/design/06-buff-system.md",),
    "tr_": ("docs/design/08-terrain-and-qinggong.md",),
    "tst_": ("docs/design/08-terrain-and-qinggong.md",),
    "gate_": ("docs/design/08-terrain-and-qinggong.md",),
    "set_": (SET_SYSTEM_REL,),
    "eq_": ("docs/design/10-items-and-equipment.md", CANON_REL),
    "it_": ("docs/design/10-items-and-equipment.md",),
    "af_": ("docs/design/10-items-and-equipment.md",),
    "ue_": ("docs/design/10-items-and-equipment.md",),
    "ins_": ("docs/design/10-items-and-equipment.md",),
    "rc_": ("docs/design/10-items-and-equipment.md",),
    "ev_": ("docs/design/10-items-and-equipment.md", "docs/design/chapters/*.md"),
    "tsp_": ("docs/design/13-progression-and-endings.md",),
    "end_": ("docs/design/13-progression-and-endings.md",),
    "ach_": ("docs/design/13-progression-and-endings.md",),
    "ttl_": ("docs/design/13-progression-and-endings.md",),
    "diff_": ("docs/design/13-progression-and-endings.md",),
    "rule_": ("docs/design/13-progression-and-endings.md",),
    "tj_": ("docs/design/13-progression-and-endings.md",),
    "sh_": ("docs/design/13-progression-and-endings.md",),
    "sqj_": ("docs/design/13-progression-and-endings.md",),
    "fin_": ("docs/design/13-progression-and-endings.md",),
    "yy_": ("docs/design/13-progression-and-endings.md",),
    "save_": ("docs/design/02-timeline-and-world-tiers.md", "docs/design/13-progression-and-endings.md"),
    "rs_": ("docs/design/02-timeline-and-world-tiers.md",),
    "lg_": ("docs/design/02-timeline-and-world-tiers.md",),
    "echo_": ("docs/design/02-timeline-and-world-tiers.md",
              "docs/design/13-progression-and-endings.md"),
    "bs_": ("docs/design/02-timeline-and-world-tiers.md",),
    "tal_": ("docs/design/03-attributes.md",),
    "tmpl_": ("docs/design/03-attributes.md",),
    "arch_": ("docs/design/03-attributes.md",),
    # AR-09 moved NPC ownership to design/18; retain the older Canon paths so
    # this checker also works on historical/partial branches.
    "npc_": ("docs/design/catalog/npcs-*.md", "docs/design/chapters/*.md",
             "docs/design/11-open-world.md", "docs/design/12-quests-npc-factions.md",
             "docs/design/18-npc-and-companions.md"),
    "q_": ("docs/design/story/*.md", "docs/design/chapters/*.md",
           "docs/design/11-open-world.md", "docs/design/12-quests-npc-factions.md"),
    # AR-04 assigns the finalized global RegionDef table to design/11.  The
    # map YAML is its structured source; design/19's 19-region table is an
    # explicitly labelled draft, and chapters only consume era-layer state.
    "rg_": ("docs/design/11-open-world.md", "docs/design/map/*.yaml"),
    "sect_": ("docs/design/12-quests-npc-factions.md",
               "docs/design/17-sects-compendium.md", "docs/design/map/*.yaml"),
    "enc_": ("docs/design/09-combat-system.md", "docs/design/chapters/*.md"),
    "bsc_": ("docs/design/09-combat-system.md",),
    "cmb_": ("docs/design/09-combat-system.md",),
    "tg_": ("docs/design/09-combat-system.md",),
    "wk_": ("docs/design/09-combat-system.md",),
    "gauge_": ("docs/design/09-combat-system.md",),
    "pers_": ("docs/design/09-combat-system.md",),
    "ea_": ("docs/design/09-combat-system.md",),
    "ai_": ("docs/design/09-combat-system.md",),
    "origin_": ("docs/design/01-vision-and-core-loop.md",),
    "mer_": ("docs/design/15-meridians-and-acupoints.md",),
    "ap_": ("docs/design/15-meridians-and-acupoints.md",),
    "zt_": ("docs/design/15-meridians-and-acupoints.md",),
    "res_": ("docs/design/16-resources-and-estates.md",),
    "sv_": ("docs/design/16-resources-and-estates.md",),
    "job_": ("docs/design/16-resources-and-estates.md",),
    # Resource-point and business instances are owned by the book-world
    # documents. design/16 owns their schema, not every concrete instance.
    "rp_": ("docs/design/chapters/*.md",),
    "biz_": ("docs/design/chapters/*.md",),
    "city_": ("docs/design/19-world-map.md", "docs/design/map/*.yaml"),
    "sc_": ("docs/design/chapters/*.md",),
    "poi_": ("docs/design/11-open-world.md", "docs/design/19-world-map.md",
             "docs/design/map/*.yaml"),
    "offmap_": ("docs/design/19-world-map.md", "docs/design/map/*.yaml"),
    "post_": ("docs/design/19-world-map.md", "docs/design/map/*.yaml"),
    "port_": ("docs/design/19-world-map.md", "docs/design/map/*.yaml"),
    "route_": ("docs/design/19-world-map.md", "docs/design/map/*.yaml"),
    "dc_": ("docs/design/story/*.md",),
    "lgs_": ("docs/design/20-legacy-inheritance.md",),
    "frag_": ("docs/design/20-legacy-inheritance.md",),
    "cache_": ("docs/design/20-legacy-inheritance.md",),
    "vid_": ("docs/design/02-timeline-and-world-tiers.md",
              "docs/tech/07-asset-generation.md"),
}

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})")
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
TABLE_SEPARATOR_RE = re.compile(r"^:?-{3,}:?$")
YAML_ID_RE = re.compile(
    r"^\s*(?:-\s*)?[\"']?id[\"']?\s*:\s*", re.IGNORECASE
)
YAML_KEY_RE = re.compile(
    r"^\s*(?:-\s*)?[\"']?([a-z][a-z0-9]*(?:_[a-z0-9]+)+)[\"']?\s*:"
)
LOCAL_TASK_PREFIXES: Tuple[str, ...] = ("st_", "edge_", "fx_", "chk_", "tr_")
DATA_ENUM_FIELDS: Set[str] = {"coordinate_precision", "kind"}
NON_CONTENT_ID_TOKENS: Set[str] = {
    # Schema fields, enum members, diagnostic codes, and third-party flags
    # that happen to begin with a registered content-ID prefix.
    "ai_budget_exhausted", "ai_region_disabled", "ai_upstream_unavailable",
    "ap_cat", "ap_k", "end_turn", "job_active",
    "job_duty_ratio_at_least", "offmap_node", "poi_eff", "post_road",
    "post_station", "res_eff", "save_booksleep_ch", "save_slots",
    "save_too_large", "save_versions", "save_wake_ch", "sc_threshold",
}

PROVISIONAL_LINE_RE = re.compile(
    r"占位|候选|待收录|待(?:由|在|向|后续|下游|归属文档)?.{0,12}(?:定义|登记|补|定稿|替换)|"
    r"建议(?:\s*ID|命名|值)?|仅引用|只引用|引用而不重定义|示例|样例|格式(?:为|：|:)|模板|"
    r"通配|不新增|不创建|不得另造|明确不新增|迁移|重命名|旧(?:\s*ID|名|前缀|规划|稿|口径)|"
    r"须改名|替代旧|定义以.{0,20}为准|补充说明|决定是否采用|采用与否",
    re.IGNORECASE,
)
PROVISIONAL_SECTION_RE = re.compile(
    r"待决事项|开放问题|对基准的修改提案|原著考据待办|参考资料|"
    r"数据校验规则与测试用例|重命名与同物去重|新增武学候选|建议地图|"
    r"未收录项为建议|ID 与命名规则|未采纳的提案|变更记录|"
    r"候选收敛与去向|短 ID 迁移|Schema 迁移底线",
    re.IGNORECASE,
)
MIGRATION_SECTION_RE = re.compile(
    r"迁移|旧\s*ID|旧区|旧名|别名|alias|历史|不采纳|未采纳|候选收敛",
    re.IGNORECASE,
)
NEGATED_REFERENCE_RE = re.compile(
    r"不采纳|未采纳|拒绝|禁止|不得|不新增|不创建|不再允许|不进入|不属于|"
    r"只作(?:为)?(?:迁移|读取)?(?:源|别名|输入)|只读\s*alias|"
    r"旧(?:存档|值|键|ID|名)",
    re.IGNORECASE,
)
DEFINITION_BLOCK_RE = re.compile(r"仅引用|候选|占位|待收录|定义以.{0,20}为准|补充说明")

# Tokens in code examples and prose often satisfy a prefix regex without being
# content IDs.  Keep this deliberately syntactic and small: semantic
# suppression happens later, where ownership and repository state are known.
PLACEHOLDER_SEGMENTS = {
    "id", "nn", "n", "x", "xx", "xxx", "yyy", "t",
    "fixture", "pinyin", "pingyin", "english",
    "name", "status", "revs",
}
CHAPTER_ASSET_VARIANT_RE = re.compile(
    r"^ch\d{2}_(?:youth|prime|child|young|adult|old|elder|base|default|variant\d*)$"
)

# A missing owning document means this checkout cannot distinguish a forward
# reference from an actual omission.  Category 1 is therefore suspended for
# the family until at least one configured owner exists.  This is the main
# precision-over-recall guard for incremental authoring.
SUSPEND_IF_ALL_OWNERS_MISSING: Set[str] = {"set_", "npc_", "q_"}

# Rulings §5 explicitly rejected these proposed Buff IDs.  They remain useful
# historical text but are neither definitions nor unresolved live references.
EXPLICITLY_REJECTED_IDS: Set[str] = {
    "bf_cuidu",
    "bf_zhenshi",
    "sect_hengshan",
    "sect_huashan04",
    "sect_jingangmen",
}

# IDs covered by an authoritative parameterized family are valid instances,
# even though no sensible registry would enumerate every expansion.  This is
# content-domain configuration, kept beside OWNERSHIP for easy extension.
DERIVED_ID_PATTERNS: Tuple[re.Pattern[str], ...] = (
    re.compile(r"^fam_(?:rat|res|pct|z5|dot)_[a-z0-9]+(?:_[a-z0-9]+)*$"),
    re.compile(r"^save_(?:booksleep|wake)_ch\d{2}$"),
    re.compile(r"^it_shijian_[a-z0-9]+(?:_[a-z0-9]+)*$"),
    re.compile(r"^vid_sleep_(?:0[1-9]|1[0-3])_(?:0[2-9]|1[0-4])$"),
    re.compile(r"^vid_ch(?:0[1-9]|1[0-4])_(?:intro|tianshu)$"),
    re.compile(r"^save_(?:manual_(?:0[1-9]|1[0-2])|quick|auto_[1-3]|"
               r"booksleep_ch(?:0[1-9]|1[0-4])|wake_ch(?:0[1-9]|1[0-4])|"
               r"finale_(?:enter|j[1-6])|clear_[1-9][0-9]*|ironman)$"),
)

@dataclass(frozen=True)
class Location:
    file: str
    line: int
    column: int


@dataclass
class Occurrence:
    id: str
    location: Location
    context: str
    section: str
    h2: str
    in_fence: bool
    active: bool = True
    definition: bool = False
    local: bool = False


@dataclass
class Definition:
    id: str
    location: Location
    name: Optional[str]
    shape: str


@dataclass
class TableRow:
    headers: List[str]
    cells: List[str]


@dataclass
class Document:
    path: Path
    rel: str
    lines: List[str]
    sections: List[str] = field(default_factory=list)
    h2s: List[str] = field(default_factory=list)
    in_fence: List[bool] = field(default_factory=list)
    tables: Dict[int, TableRow] = field(default_factory=dict)


@dataclass(frozen=True)
class RenameRule:
    old: str
    new: str
    is_pattern: bool = False


def repository_root() -> Path:
    return Path(__file__).resolve().parents[2]


def relpath(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def split_markdown_row(line: str) -> List[str]:
    """Split a simple GFM table row while preserving escaped pipes."""
    text = line.strip()
    if text.startswith("|"):
        text = text[1:]
    if text.endswith("|") and not text.endswith(r"\|"):
        text = text[:-1]
    cells: List[str] = []
    buf: List[str] = []
    escaped = False
    for char in text:
        if char == "|" and not escaped:
            cells.append("".join(buf).strip())
            buf = []
        else:
            buf.append(char)
        if char == "\\" and not escaped:
            escaped = True
        else:
            escaped = False
    cells.append("".join(buf).strip())
    return [cell.replace(r"\|", "|") for cell in cells]


def is_separator_row(line: str) -> bool:
    if not line.lstrip().startswith("|"):
        return False
    cells = split_markdown_row(line)
    return bool(cells) and all(TABLE_SEPARATOR_RE.match(cell.replace(" ", "")) for cell in cells)


def load_document(path: Path, root: Path, warnings: List[str]) -> Optional[Document]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        warnings.append("cannot read {}: {}".format(relpath(path, root), exc))
        return None
    lines = text.splitlines()
    doc = Document(path=path, rel=relpath(path, root), lines=lines)

    heading_stack: List[Tuple[int, str]] = []
    h2 = ""
    fence_marker: Optional[str] = None
    for line in lines:
        fence_match = FENCE_RE.match(line)
        was_in_fence = fence_marker is not None
        doc.in_fence.append(was_in_fence)
        if fence_match:
            marker = fence_match.group(1)
            if fence_marker is None:
                fence_marker = marker[0]
            elif marker[0] == fence_marker:
                fence_marker = None
        if not was_in_fence:
            match = HEADING_RE.match(line)
            if match:
                level = len(match.group(1))
                title = match.group(2)
                heading_stack = [(n, value) for n, value in heading_stack if n < level]
                heading_stack.append((level, title))
                if level == 2:
                    h2 = title
        doc.sections.append(" > ".join(value for _, value in heading_stack))
        doc.h2s.append(h2)

    index = 0
    while index + 1 < len(lines):
        if lines[index].lstrip().startswith("|") and is_separator_row(lines[index + 1]):
            headers = split_markdown_row(lines[index])
            row_index = index + 2
            while row_index < len(lines) and lines[row_index].lstrip().startswith("|"):
                if not is_separator_row(lines[row_index]):
                    doc.tables[row_index] = TableRow(headers=headers, cells=split_markdown_row(lines[row_index]))
                row_index += 1
            index = row_index
        else:
            index += 1
    return doc


def canon_section(lines: Sequence[str], number: int) -> List[str]:
    start_re = re.compile(r"^##\s+{}(?:\.|\s)".format(number))
    start = None
    for index, line in enumerate(lines):
        if start_re.match(line):
            start = index + 1
            break
    if start is None:
        return []
    end = len(lines)
    for index in range(start, len(lines)):
        if lines[index].startswith("## "):
            end = index
            break
    return list(lines[start:end])


def prefix_from_format(value: str) -> Optional[str]:
    value = value.strip().replace(r"\|", "|")
    if value.startswith("chNN_"):
        return "ch"
    match = re.match(r"^([a-z][a-z0-9]*_)", value)
    if match:
        return match.group(1)
    return None


def parse_prefixes(canon_path: Path, warnings: List[str]) -> Tuple[List[str], bool]:
    try:
        lines = canon_path.read_text(encoding="utf-8").splitlines()
    except (OSError, UnicodeError) as exc:
        warnings.append("cannot parse {} section 12 ({}); using built-in prefixes".format(canon_path, exc))
        return sorted(set(DEFAULT_PREFIXES)), True
    section = canon_section(lines, 12)
    prefixes: Set[str] = set()
    for line in section:
        if not line.lstrip().startswith("|") or is_separator_row(line):
            continue
        cells = split_markdown_row(line)
        if len(cells) < 2:
            continue
        formats = INLINE_CODE_RE.findall(cells[1])
        for value in formats:
            prefix = prefix_from_format(value)
            if prefix:
                prefixes.add(prefix)
    core = {"ch", "sk_", "bf_", "set_", "npc_", "q_"}
    if not core.issubset(prefixes):
        warnings.append("could not reliably parse Canon section 12; using built-in prefixes")
        return sorted(set(DEFAULT_PREFIXES)), True
    return sorted(prefixes), False


def compile_id_regex(prefixes: Sequence[str]) -> re.Pattern[str]:
    alternatives: List[str] = []
    for prefix in sorted(set(prefixes), key=len, reverse=True):
        if prefix == "ch":
            alternatives.append(r"ch\d{2}_[a-z0-9]+(?:_[a-z0-9]+)*")
        else:
            alternatives.append(re.escape(prefix) + r"[a-z0-9]+(?:_[a-z0-9]+)*")
    return re.compile(r"(?<![A-Za-z0-9_])(?:{})(?![A-Za-z0-9_])".format("|".join(alternatives)))


def looks_like_placeholder(identifier: str) -> bool:
    """Reject templates, schema fields, and incomplete ID examples."""
    if identifier in NON_CONTENT_ID_TOKENS:
        return True
    if re.fullmatch(r"sv_runtime_\d+", identifier):
        return True
    # The prerequisite grammar uses exactly these two metavariables.  Do not
    # suppress arbitrary real IDs ending in ``_a`` or ``_b``.
    if identifier in {"sk_a", "sk_b"}:
        return True
    tail = identifier.split("_", 1)[1] if "_" in identifier else identifier
    if tail == "example" or tail.startswith("example_"):
        return True
    if CHAPTER_ASSET_VARIANT_RE.match(identifier):
        return True
    if identifier in {
        "fin_j", "it_tianshu_00", "it_tianshu_15",
        "set_status", "save_revs",
    }:
        return True
    if re.fullmatch(r"gate_\d{2}", identifier):
        return True
    if re.match(r"^tsp_(?:00|15)_", identifier):
        return True
    segments = identifier.split("_")[1:]
    if any(segment in PLACEHOLDER_SEGMENTS for segment in segments):
        return True
    if any(re.fullmatch(r"\d*x+", segment) for segment in segments):
        return True
    return False


def fenced_match_has_id_context(line: str, start: int, end: int) -> bool:
    """Accept quoted, keyed, or collection-like IDs in fenced examples.

    Bare words in diagrams and pseudo database schemas are a frequent prefix
    collision (for example an ``ai_*`` table), while YAML ``id:``/``ref:``
    values and JSON strings are meaningful inputs to this checker.
    """
    for quote in re.finditer(r"(['\"])(.*?)\1", line):
        if quote.start(2) <= start and end <= quote.end(2):
            value = quote.group(2).strip()
            identifier = line[start:end]
            if value == identifier or value.endswith(":" + identifier):
                return True
    stripped = line.strip()
    if stripped.startswith(("-", "{", "[")):
        return True
    if mapping_key_spans(line, re.escape(line[start:end])):
        return True
    before = line[:start]
    if re.search(r"[A-Za-z_][A-Za-z0-9_]*\s*:\s*[^#]*$", before):
        return True
    if "[" in before and "]" in line[end:]:
        return True
    return False


def looks_like_path_fragment(line: str, start: int, end: int) -> bool:
    if start and line[start - 1] in "/\\":
        return True
    suffix = line[end:]
    if re.match(r"\.(?:md|ya?ml|json|tsx?|jsx?|py|svg|png|webp|mp4|ink)\b", suffix, re.IGNORECASE):
        return True
    for match in INLINE_CODE_RE.finditer(line):
        if match.start(1) <= start and end <= match.end(1):
            code = match.group(1)
            relative_start = start - match.start(1)
            if ("/" in code or "\\" in code) and code.strip() != line[start:end]:
                before = code[:relative_start]
                after = code[relative_start + (end - start):]
                if before.endswith(("/", "\\")) or after.startswith(("/", "\\", ".")):
                    return True
    return False


def family_for(identifier: str, prefixes: Sequence[str]) -> Optional[str]:
    matches = [prefix for prefix in prefixes if identifier.startswith(prefix)]
    if identifier.startswith("ch") and re.match(r"^ch\d{2}_", identifier):
        matches.append("ch")
    return max(matches, key=len) if matches else None


def path_matches(rel: str, patterns: Sequence[str]) -> bool:
    return any(fnmatch.fnmatchcase(rel, pattern) for pattern in patterns)


def is_data_source_rel(rel: str) -> bool:
    """Return whether *rel* is an explicitly registered structured source."""
    return path_matches(rel, DATA_SOURCE_PATTERNS)


def numbered_owner_matches(identifier: str, rel: str, family: str) -> bool:
    """Keep book-local definitions in their matching chapter/story file."""
    match = re.match(r"docs/design/(?:chapters|story)/(\d{2})-", rel)
    if match is None:
        return True
    book = match.group(1)
    if family == "sc_":
        return identifier.startswith("sc_{}_".format(book))
    if family == "dc_":
        return identifier.startswith("dc_{}_".format(book))
    if family == "q_" and re.match(r"^q_\d{2}_main_", identifier):
        return identifier.startswith("q_{}_main_".format(book))
    return True


def definition_allowed(identifier: str, doc: Document, line_index: int, prefixes: Sequence[str]) -> bool:
    family = family_for(identifier, prefixes)
    if family is None:
        return False
    patterns = OWNERSHIP.get(family, ())
    if not patterns or not path_matches(doc.rel, patterns):
        return False
    if not numbered_owner_matches(identifier, doc.rel, family):
        return False
    # Higher-priority ownership changes supersede the historical broad paths:
    # NPCs belong to design/18/catalogs, sect IDs to design/17/map data, and
    # story-main keys to the matching story document.  Chapters may still own
    # non-main quest instances and design/11 may own its Qiyu definitions.
    if family == "npc_":
        if doc.rel not in {"docs/design/18-npc-and-companions.md"} and not (
            path_matches(doc.rel, ("docs/design/catalog/npcs-*.md",))
        ):
            return False
    if family == "sect_":
        if doc.rel != "docs/design/17-sects-compendium.md" and not (
            doc.rel == "docs/design/map/sects.yaml"
        ):
            return False
    if family == "q_" and re.match(r"^q_\d{2}_main_", identifier):
        if not path_matches(doc.rel, ("docs/design/story/*.md",)):
            return False
    if doc.rel == CANON_REL:
        h2 = doc.h2s[line_index]
        if family == "ch":
            return bool(re.match(r"(?:2|12)(?:\.|\s)", h2))
        if family == "sk_":
            return bool(re.match(r"13(?:\.|\s)", h2))
        if family == "eq_":
            return bool(re.match(r"14(?:\.|\s)", h2))
        return False
    if family == "sect_" and doc.rel == "docs/design/17-sects-compendium.md":
        row = doc.tables.get(line_index)
        first_header = clean_markdown(row.headers[0]).lower() if row and row.headers else ""
        return bool(re.match(r"3(?:\.|\s)", doc.h2s[line_index])) and first_header == "id"
    return True


def clean_markdown(value: str) -> str:
    value = re.sub(r"[`*_~]+", "", value)
    value = re.sub(r"<[^>]+>", "", value)
    return value.strip(" \t:：;；,，|")


def normalized_name(value: str) -> str:
    """Normalize cosmetic numbering/spacing before duplicate comparison."""
    value = clean_markdown(value)
    value = re.sub(r"^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*", "", value)
    value = re.sub(r"^[（(]?\d+(?:\.\d+)*[）)]?[.．、]?\s*", "", value)
    value = re.sub(r"^[A-ZＡ-Ｚ][.．、]\s*", "", value)
    value = re.sub(r"^(?:核心|天阶)\s*", "", value)
    # Headings may use a middle dot only as a visual separator before an ID.
    value = value.strip("『』「」\"' ·")
    return re.sub(r"\s+", "", value)


def name_from_cell(cell: str, identifier: str) -> Optional[str]:
    value = clean_markdown(cell.replace(identifier, " ", 1))
    value = re.sub(r"^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*", "", value)
    value = re.sub(r"^[（(]?\d+(?:\.\d+)*\.?[）)]?\s*", "", value)
    value = value.lstrip(".．、· ")
    value = re.split(r"[（(]|\s+/\s+|\s+·\s+|——|；|;", value, maxsplit=1)[0].strip()
    if not value or value in {"—", "-"} or re.fullmatch(r"[a-zA-Z0-9_. /-]+", value):
        return None
    return value


def table_name(row: TableRow, identifier: str, id_column: int) -> Optional[str]:
    preferred: List[int] = []
    for index, header in enumerate(row.headers):
        normalized = clean_markdown(header).lower()
        if normalized == "名称" or normalized.startswith("名称 /") or normalized.endswith("/ 名称"):
            preferred.append(index)
    if id_column not in preferred:
        preferred.append(id_column)
    for index in preferred:
        if index < len(row.cells):
            name = name_from_cell(row.cells[index], identifier)
            if name:
                return name
    return None


def heading_name(line: str, identifier: str, id_count: int) -> Optional[str]:
    if id_count != 1:
        return None
    match = HEADING_RE.match(line)
    if not match:
        return None
    value = INLINE_CODE_RE.sub(lambda m: " " if identifier in m.group(1) else m.group(0), match.group(2))
    value = value.replace(identifier, " ")
    return name_from_cell(value, identifier)


def yaml_name(doc: Document, line_index: int) -> Optional[str]:
    base_indent = len(doc.lines[line_index]) - len(doc.lines[line_index].lstrip())
    for index in range(line_index + 1, min(len(doc.lines), line_index + 12)):
        line = doc.lines[index]
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip())
        if indent < base_indent or (indent == base_indent and YAML_ID_RE.match(line)):
            break
        match = re.match(r"^\s*name\s*:\s*[\"']?([^#\"']+?)?[\"']?\s*$", line, re.IGNORECASE)
        if match and match.group(1):
            return clean_markdown(match.group(1))
    return None


def id_field_spans(line: str, identifier_re: str) -> List[Tuple[int, int]]:
    """Return value spans for YAML/JSON ``id`` keys on one line."""
    pattern = re.compile(
        r"(?:^|[,{\s-])[\"']?id[\"']?\s*:\s*[\"']?"
        + r"(?P<id>" + identifier_re + r")(?![A-Za-z0-9_])",
        re.IGNORECASE,
    )
    return [(match.start("id"), match.end("id")) for match in pattern.finditer(line)]


def mapping_key_spans(line: str, identifier_re: str) -> List[Tuple[int, int]]:
    """Return mapping-key spans, excluding ordinary field values."""
    pattern = re.compile(
        r"(?:^|[,{\s-])[\"']?(?P<id>" + identifier_re + r")[\"']?\s*:"
    )
    return [(match.start("id"), match.end("id")) for match in pattern.finditer(line)]


def occurrence_has_span(occurrence: Occurrence, spans: Sequence[Tuple[int, int]]) -> bool:
    start = occurrence.location.column - 1
    return (start, start + len(occurrence.id)) in spans


def local_task_ids_by_line(doc: Document) -> List[Set[str]]:
    """Resolve task-local keys within each fenced ``quest.v1`` object."""
    result: List[Set[str]] = [set() for _ in doc.lines]
    index = 0
    local_re = r"[a-z][a-z0-9]*(?:_[a-z0-9]+)+"
    while index < len(doc.lines):
        if not doc.in_fence[index]:
            index += 1
            continue
        end = index
        while end < len(doc.lines) and doc.in_fence[end]:
            end += 1
        block = doc.lines[index:end]
        if any(re.search(r"schemaVersion[\"']?\s*:\s*[\"']?quest\.v1", line) for line in block):
            declared: Set[str] = set()
            for line in block:
                for start, stop in id_field_spans(line, local_re):
                    identifier = line[start:stop]
                    if identifier.startswith(LOCAL_TASK_PREFIXES):
                        declared.add(identifier)
                for match in re.finditer(
                    r"branchKey\s*:\s*[\"']?(dc_\d{2}_\d{2}_[a-z0-9_]+)",
                    line,
                ):
                    declared.add(match.group(1))
            for line_index in range(index, end):
                result[line_index] = declared
        index = end
    return result


def fixture_task_ids(doc: Document) -> Set[str]:
    """Return root quest IDs from explicitly marked ``fixture: true`` blocks."""
    result: Set[str] = set()
    index = 0
    while index < len(doc.lines):
        if not doc.in_fence[index]:
            index += 1
            continue
        end = index
        while end < len(doc.lines) and doc.in_fence[end]:
            end += 1
        block = doc.lines[index:end]
        is_quest = any(
            re.search(r"schemaVersion[\"']?\s*:\s*[\"']?quest\.v1", line)
            for line in block
        )
        is_fixture = any(
            re.match(r"^\s*fixture\s*:\s*true(?:\s*(?:#.*)?)?$", line, re.IGNORECASE)
            for line in block
        )
        if is_quest and is_fixture:
            for line in block:
                match = re.match(
                    r"^id\s*:\s*[\"']?(q_[a-z0-9]+(?:_[a-z0-9]+)+)", line
                )
                if match:
                    result.add(match.group(1))
                    break
        index = end
    return result


def operation_or_modifier_key(doc: Document, line_index: int, identifier: str) -> bool:
    """Recognize schema operations that collide with the ``set_`` family.

    This is declaration/context based: a key must occur in a documented
    operation registry, a discriminator field, or the flat/pct/set modifier
    triplet. Ordinary prose mentioning an arbitrary ``set_*`` stays live.
    """
    if not identifier.startswith("set_"):
        return False
    line = doc.lines[line_index]
    section = doc.sections[line_index]
    if doc.rel == "docs/design/03-attributes.md":
        triplet = re.compile(
            r"`flat_[a-z0-9_]+`?\s*/\s*`pct_[a-z0-9_]+`?\s*/\s*`(set_[a-z0-9_]+)`?"
        )
        if any(identifier in match.groups() for item in doc.lines for match in triplet.finditer(item)):
            return True
    if doc.rel == "docs/design/12-quests-npc-factions.md":
        declaration = re.compile(
            r"allowedEffects\s*:\s*\[[^]]*\b{}\b".format(re.escape(identifier))
        )
        if any(declaration.search(item) for item in doc.lines):
            return True
        if re.search(r"(?:estate|quest|flag)/{}\b".format(re.escape(identifier)), line):
            return True
    if doc.rel == "docs/design/16-resources-and-estates.md":
        declaration = re.compile(
            r"\bkind\s*:\s*['\"]{}['\"]".format(re.escape(identifier))
        )
        if any(
            declaration.search(item) and "任务 DSL 动作扩展" in doc.sections[index]
            for index, item in enumerate(doc.lines)
        ):
            return True
        # A declared discriminator remains an operation when later prose in
        # the same owner explains its invariant. The exact value is discovered
        # from the union declaration above, not maintained as a token list.
        if any(declaration.search(item) for item in doc.lines):
            return True
    if occurrence_is_discriminator_line(doc, line_index, identifier):
        return True
    return False


def occurrence_is_discriminator_line(
    doc: Document, line_index: int, identifier: str
) -> bool:
    if not doc.in_fence[line_index]:
        return False
    line = doc.lines[line_index]
    quoted = re.escape(identifier)
    return bool(re.search(
        r"(?:\bkind\b|\bop\b|['\"]const['\"])\s*:\s*['\"]{}['\"]".format(quoted),
        line,
    ))


def line_is_provisional(doc: Document, line_index: int) -> bool:
    line = doc.lines[line_index]
    section = doc.sections[line_index]
    if PROVISIONAL_SECTION_RE.search(section) or MIGRATION_SECTION_RE.search(section):
        return True
    if PROVISIONAL_LINE_RE.search(line) or NEGATED_REFERENCE_RE.search(line):
        return True
    # The Canon naming table consists of syntax and examples, never live IDs.
    if doc.rel == CANON_REL and re.match(r"12(?:\.|\s)", doc.h2s[line_index]):
        return True
    return False


def line_id_matches(
    doc: Document, line_index: int, id_regex: re.Pattern[str]
) -> List[re.Match[str]]:
    """Return ID tokens from Markdown code contexts or structured sources."""
    line = doc.lines[line_index]
    matches = [
        match for match in id_regex.finditer(line)
        if not looks_like_placeholder(match.group(0))
        and not line[match.end():].startswith("_<")
    ]
    if doc.in_fence[line_index] or is_data_source_rel(doc.rel):
        return [
            match for match in matches
            if not looks_like_path_fragment(line, match.start(), match.end())
            and (
                is_data_source_rel(doc.rel)
                or fenced_match_has_id_context(line, match.start(), match.end())
            )
        ]
    spans = [(match.start(1), match.end(1)) for match in INLINE_CODE_RE.finditer(line)]
    return [
        match for match in matches
        if any(start <= match.start() and match.end() <= end for start, end in spans)
        and not looks_like_path_fragment(line, match.start(), match.end())
    ]


def active_line(doc: Document, line_index: int) -> bool:
    line = doc.lines[line_index]
    if doc.rel == RULINGS_REL and (
        "重命名与同物去重表" in doc.sections[line_index]
        or "C12" in doc.sections[line_index]
        or "C19" in doc.sections[line_index]
    ):
        return False
    return not line_is_provisional(doc, line_index)


def table_definition(
    identifier: str, doc: Document, line_index: int, id_regex: re.Pattern[str], prefixes: Sequence[str]
) -> Optional[Definition]:
    row = doc.tables.get(line_index)
    if row is None or PROVISIONAL_SECTION_RE.search(doc.sections[line_index]):
        return None
    id_columns: List[int] = []
    family = family_for(identifier, prefixes)
    for index, header in enumerate(row.headers):
        normalized = clean_markdown(header).lower()
        if PROVISIONAL_LINE_RE.search(normalized):
            continue
        if normalized in {"id", "编号", "id / 名称", "id/名称", "名称 / id", "名称/id"}:
            id_columns.append(index)
        elif normalized.startswith(("生产 id", "本文新增 id")):
            id_columns.append(index)
        elif normalized.startswith("id /") or normalized.endswith("/ id"):
            id_columns.append(index)
        elif re.fullmatch(
            r"(?:buff|武学|招式|绝招|被动|地形|装备|物品|套装|门派|书界|"
            r"旗标|城市|区域|遭遇|战斗场景|结局|成就|称号|难度|规则|穴道|"
            r"经脉|资源点|营生场所|家丁|职位|传承源|残本|宝藏缓存)\s*id",
            normalized,
        ):
            id_columns.append(index)
        elif family == "mv_" and ("招式" in normalized or "绝招" in normalized):
            id_columns.append(index)
        elif family == "ps_" and "被动" in normalized:
            id_columns.append(index)
        elif family == "rg_" and normalized in {"区域 id / 名称", "区域 id/名称"}:
            id_columns.append(index)
        elif family == "sc_" and re.fullmatch(r"场景键(?:\s*\d+)?", normalized):
            id_columns.append(index)
        elif family == "biz_" and normalized in {
            "场所 id", "场所id", "营生 id", "营生id",
            "营生场所", "营生场所 id",
        }:
            id_columns.append(index)
        elif family == "frag_" and normalized in {"三卷 / 信物", "三卷/信物"}:
            id_columns.append(index)
        elif family == "cache_" and normalized in {"载体 / 投放", "载体/投放"}:
            id_columns.append(index)
    if not id_columns:
        # A first column headed with the object's noun is commonly the defining
        # column (Buff, 武学, 地形, 装备...).  Require exactly one ID there.
        first = clean_markdown(row.headers[0]).lower() if row.headers else ""
        if first in {"buff", "武学", "地形", "装备", "物品", "套装", "门派", "书界", "结局", "成就", "称号", "难度"}:
            id_columns = [0]
        elif family == "exg_" and first == "组":
            id_columns = [0]
        elif family == "ue_" and first == "项":
            first_cell = clean_markdown(row.cells[0]) if row.cells else ""
            if re.match(r"^[①②]\s*(?:核心|天阶)", first_cell):
                id_columns = [0]
    if family == "fam_" and doc.rel == "docs/design/06-buff-system.md":
        id_columns = [
            index for index, header in enumerate(row.headers)
            if clean_markdown(header).lower() == "族 id"
        ]
    for index in id_columns:
        if index >= len(row.cells):
            continue
        ids = [match.group(0) for match in id_regex.finditer(row.cells[index])]
        # The Buff family registry intentionally packs two family IDs into
        # some cells (for example ``fam_z3 / fam_z4``).  Elsewhere, requiring
        # exactly one token is an important guard against treating a prose
        # cross-reference cell as a definition.
        family_registry_cell = (
            family == "fam_"
            and doc.rel == "docs/design/06-buff-system.md"
            and clean_markdown(row.headers[index]).lower() == "族 id"
        )
        multi_id_columns = (
            (family == "sc_" and re.fullmatch(r"场景键(?:\s*\d+)?", clean_markdown(row.headers[index]).lower()))
            or (family == "frag_" and "三卷" in clean_markdown(row.headers[index]))
            or (
                family == "vid_"
                and doc.rel == "docs/tech/07-asset-generation.md"
                and clean_markdown(row.headers[index]).lower() == "id"
                and all(item.startswith("vid_end_") for item in ids)
                and "结局成片" in " ".join(row.cells)
            )
            or (
                family == "aoe_"
                and doc.rel == "docs/design/09-combat-system.md"
                and clean_markdown(row.headers[index]).lower().startswith("生产 id")
            )
            or (
                family == "aoe_"
                and doc.rel == "docs/design/09-combat-system.md"
                and clean_markdown(row.headers[index]).lower() == "id"
                and row.cells
                and "范围模板" in clean_markdown(row.cells[0])
                and "本文生产 ID" in clean_markdown(row.cells[0])
            )
        )
        if identifier not in ids or (
            not family_registry_cell and not multi_id_columns and len(ids) != 1
        ):
            continue
        # Provisional wording in the ID cell itself is meaningful.  Wording in
        # another field (for example an origin note marked "待考" or
        # "建议") must not invalidate an otherwise strong catalog row.
        if PROVISIONAL_LINE_RE.search(row.cells[index]):
            continue
        if not definition_allowed(identifier, doc, line_index, prefixes):
            continue
        return Definition(
            id=identifier,
            location=Location(doc.rel, line_index + 1, doc.lines[line_index].find(identifier) + 1),
            name=table_name(row, identifier, index),
            shape="table",
        )
    return None


def inventory_definition(
    identifier: str, doc: Document, line_index: int, prefixes: Sequence[str]
) -> Optional[Definition]:
    section = doc.sections[line_index]
    if not re.search(r"本文新增术语(?:与|/).*ID|本文新增 ID|ID 清单", section, re.IGNORECASE):
        return None
    if PROVISIONAL_SECTION_RE.search(section):
        return None
    if line_is_provisional(doc, line_index):
        return None
    if not definition_allowed(identifier, doc, line_index, prefixes):
        return None
    line = doc.lines[line_index]
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=None,
        shape="inventory",
    )


def canon_chapter_definition(
    identifier: str, doc: Document, line_index: int
) -> Optional[Definition]:
    if doc.rel != CANON_REL or not identifier.startswith("ch"):
        return None
    if not re.match(r"2(?:\.|\s)", doc.h2s[line_index]):
        return None
    line = doc.lines[line_index]
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=None,
        shape="canon-section",
    )


def canon_anchor_definition(
    identifier: str, doc: Document, line_index: int, prefixes: Sequence[str]
) -> Optional[Definition]:
    """Recognize prose anchors in Canon that are stronger than examples."""
    if doc.rel != CANON_REL:
        return None
    h2 = doc.h2s[line_index]
    line = doc.lines[line_index]
    family = family_for(identifier, prefixes)
    if family == "sk_" and re.match(r"13(?:\.|\s)", h2):
        if identifier in {"sk_yuenvjian", "sk_yuenvjian02"}:
            return Definition(
                id=identifier,
                location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
                name="越女剑法",
                shape="canon-anchor",
            )
    if family in {"ch", "rg_"} and re.match(r"12(?:\.|\s)", h2) and "固定为" in line:
        return Definition(
            id=identifier,
            location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
            name=None,
            shape="canon-anchor",
        )
    return None


def semantic_definition(
    identifier: str, doc: Document, line_index: int, prefixes: Sequence[str]
) -> Optional[Definition]:
    """Handle compact registries whose defining field is not named id."""
    if not definition_allowed(identifier, doc, line_index, prefixes):
        return None
    line = doc.lines[line_index]
    family = family_for(identifier, prefixes)
    shape: Optional[str] = None
    if family == "fam_" and doc.rel == "docs/design/06-buff-system.md":
        if re.match(r"^\s*family\s*:\s*", line, re.IGNORECASE):
            shape = "yaml-family"
    elif family == "exg_" and doc.rel == "docs/design/06-buff-system.md":
        if re.match(r"^\s*(?:exclusive|exclusiveGroup)\s*:\s*", line, re.IGNORECASE):
            shape = "yaml-exclusive"
    elif family == "echo_" and doc.rel == "docs/design/02-timeline-and-world-tiers.md":
        if re.match(r"6(?:\.|\s)", doc.h2s[line_index]) and not line_is_provisional(doc, line_index):
            shape = "continuity-flag"
    elif family == "echo_" and doc.rel == "docs/design/13-progression-and-endings.md":
        if "雪山" in doc.sections[line_index] or "雪山抉择" in line:
            shape = "ending-flag"
    if shape is None:
        return None
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=None,
        shape=shape,
    )


def legacy_bullet_definition(
    identifier: str, doc: Document, line_index: int, prefixes: Sequence[str]
) -> Optional[Definition]:
    """Recognize design/20's compact source/cache/three-fragment cards."""
    if doc.rel != "docs/design/20-legacy-inheritance.md":
        return None
    if not definition_allowed(identifier, doc, line_index, prefixes):
        return None
    line = doc.lines[line_index]
    family = family_for(identifier, prefixes)
    if family == "cache_" and re.match(r"^\s*[-*]\s+\*\*载体\s*/\s*投放\*\*", line):
        shape = "legacy-carrier"
    elif family == "frag_" and re.match(r"^\s*[-*]\s+\*\*三卷\s*/\s*信物\*\*", line):
        shape = "legacy-fragments"
    else:
        return None
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=None,
        shape=shape,
    )


def bold_card_definition(
    identifier: str, doc: Document, line_index: int, ids: Sequence[str],
    prefixes: Sequence[str],
) -> Optional[Definition]:
    line = doc.lines[line_index]
    if len(ids) != 1 or not line.lstrip().startswith("**"):
        return None
    closing = line.find("**", line.find("**") + 2)
    if closing < 0 or line.find(identifier) > closing:
        return None
    if line_is_provisional(doc, line_index) or not definition_allowed(identifier, doc, line_index, prefixes):
        return None
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=name_from_cell(line[: closing + 2], identifier),
        shape="bold-card",
    )


def heading_definition(
    identifier: str, doc: Document, line_index: int, ids: Sequence[str], prefixes: Sequence[str]
) -> Optional[Definition]:
    line = doc.lines[line_index]
    if not HEADING_RE.match(line) or line_is_provisional(doc, line_index):
        return None
    if DEFINITION_BLOCK_RE.search(line) or not definition_allowed(identifier, doc, line_index, prefixes):
        return None
    # Headings such as "§7.2 ch03" are navigation, not cards.  Definitions
    # must either have a name beside the ID or be a catalog/sect entry heading.
    name = heading_name(line, identifier, len(ids))
    if (
        name is None
        and doc.rel == "docs/design/20-legacy-inheritance.md"
        and identifier.startswith("lgs_")
        and len(ids) == 1
    ):
        # Numbered LegacySource cards use "09 · name ID"; the generic name
        # normalizer rejects the residual digits, but this remains a strong
        # owner-only definition shape.
        name = "LegacySource"
    if name is None:
        return None
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=name,
        shape="heading",
    )


def yaml_definition(
    identifier: str, doc: Document, line_index: int, ids: Sequence[str], prefixes: Sequence[str]
) -> Optional[Definition]:
    line = doc.lines[line_index]
    spans = id_field_spans(line, re.escape(identifier))
    if not doc.in_fence[line_index] or not spans:
        return None
    column = line.find(identifier) + 1
    occurrence = Occurrence(
        identifier, Location(doc.rel, line_index + 1, column), line,
        doc.sections[line_index], doc.h2s[line_index], True,
    )
    if not occurrence_has_span(occurrence, spans) or line_is_provisional(doc, line_index):
        return None
    if not definition_allowed(identifier, doc, line_index, prefixes):
        return None
    return Definition(
        id=identifier,
        location=Location(doc.rel, line_index + 1, line.find(identifier) + 1),
        name=yaml_name(doc, line_index),
        shape="yaml-id",
    )


def fenced_mapping_definition(
    occurrence: Occurrence, doc: Document, line_index: int, prefixes: Sequence[str]
) -> Optional[Definition]:
    """Recognize an ID used as a YAML/JSON mapping key in an owner fence."""
    if not doc.in_fence[line_index]:
        return None
    spans = mapping_key_spans(doc.lines[line_index], re.escape(occurrence.id))
    if not occurrence_has_span(occurrence, spans):
        return None
    if line_is_provisional(doc, line_index):
        return None
    if not definition_allowed(occurrence.id, doc, line_index, prefixes):
        return None
    return Definition(
        id=occurrence.id,
        location=occurrence.location,
        name=None,
        shape="yaml-key",
    )


def data_source_definition(
    occurrence: Occurrence, doc: Document, line_index: int, prefixes: Sequence[str]
) -> Optional[Definition]:
    """Recognize object IDs, but not reference fields, in registered data."""
    if not is_data_source_rel(doc.rel):
        return None
    line = doc.lines[line_index]
    identifier_re = re.escape(occurrence.id)
    spans = id_field_spans(line, identifier_re) + mapping_key_spans(line, identifier_re)
    if not occurrence_has_span(occurrence, spans):
        return None
    if not definition_allowed(occurrence.id, doc, line_index, prefixes):
        return None
    return Definition(
        id=occurrence.id,
        location=occurrence.location,
        name=None,
        shape="data-id",
    )


def occurrence_definition(
    occurrence: Occurrence, doc: Document, line_index: int, ids: Sequence[str],
    id_regex: re.Pattern[str], prefixes: Sequence[str]
) -> Optional[Definition]:
    for detector in (
        lambda: data_source_definition(occurrence, doc, line_index, prefixes),
        lambda: table_definition(occurrence.id, doc, line_index, id_regex, prefixes),
        lambda: heading_definition(occurrence.id, doc, line_index, ids, prefixes),
        lambda: yaml_definition(occurrence.id, doc, line_index, ids, prefixes),
        lambda: fenced_mapping_definition(occurrence, doc, line_index, prefixes),
        lambda: inventory_definition(occurrence.id, doc, line_index, prefixes),
        lambda: canon_chapter_definition(occurrence.id, doc, line_index),
        lambda: canon_anchor_definition(occurrence.id, doc, line_index, prefixes),
        lambda: semantic_definition(occurrence.id, doc, line_index, prefixes),
        lambda: legacy_bullet_definition(occurrence.id, doc, line_index, prefixes),
        lambda: bold_card_definition(occurrence.id, doc, line_index, ids, prefixes),
    ):
        definition = detector()
        if definition is not None:
            return definition
    return None


def extract_occurrences(
    documents: Sequence[Document], prefixes: Sequence[str], id_regex: re.Pattern[str]
) -> Tuple[List[Occurrence], List[Definition]]:
    occurrences: List[Occurrence] = []
    definitions: List[Definition] = []
    seen_definitions: Set[Tuple[str, str, int]] = set()
    for doc in documents:
        local_ids = local_task_ids_by_line(doc)
        example_ids = fixture_task_ids(doc)
        for line_index, line in enumerate(doc.lines):
            matches = line_id_matches(doc, line_index, id_regex)
            ids = [match.group(0) for match in matches]
            for match in matches:
                identifier = match.group(0)
                occurrence = Occurrence(
                    id=identifier,
                    location=Location(doc.rel, line_index + 1, match.start() + 1),
                    context=line.strip()[:500],
                    section=doc.sections[line_index],
                    h2=doc.h2s[line_index],
                    in_fence=doc.in_fence[line_index],
                    active=active_line(doc, line_index) and identifier not in example_ids,
                    local=identifier in local_ids[line_index],
                )
                if operation_or_modifier_key(doc, line_index, identifier):
                    occurrence.active = False
                definition = occurrence_definition(
                    occurrence, doc, line_index, ids, id_regex, prefixes
                )
                if definition is not None and occurrence.local:
                    definition = None
                if definition is not None:
                    occurrence.definition = True
                    key = (definition.id, definition.location.file, definition.location.line)
                    if key not in seen_definitions:
                        definitions.append(definition)
                        seen_definitions.add(key)
                occurrences.append(occurrence)
    return occurrences, definitions


RANGE_RE = re.compile(
    r"(?P<left>[a-z][a-z0-9_]*?)(?P<start>\d{1,2})`?\s*(?:\.\.|…|–|—|-)\s*`?"
    r"(?:(?P<right>[a-z][a-z0-9_]*?))?(?P<end>\d{1,2})"
)


def expand_range_definitions(
    documents: Sequence[Document], definitions: List[Definition],
    prefixes: Sequence[str],
) -> None:
    """Expand compact inclusive numeric ranges in authoritative prose.

    Examples in this repository include ``save_manual_01…12`` and
    ``sk_zichuang01–sk_zichuang03``.  Width is preserved and expansion is
    capped so malformed prose cannot create an unbounded set.
    """
    seen = {(item.id, item.location.file, item.location.line) for item in definitions}
    for doc in documents:
        for index, line in enumerate(doc.lines):
            for match in RANGE_RE.finditer(line):
                left = match.group("left")
                right = match.group("right") or left
                if right != left:
                    continue
                start_text, end_text = match.group("start"), match.group("end")
                start, end = int(start_text), int(end_text)
                if end < start or end - start > 100:
                    continue
                sample = left + start_text
                family = family_for(sample, prefixes)
                if family is None or not definition_allowed(sample, doc, index, prefixes):
                    continue
                # Ranges are definitions only in an explicit registry or in
                # the self-creation rule that reserves three runtime slots.
                registry = bool(
                    re.search(r"本文新增术语(?:与|/).*ID|本文新增 ID|ID 清单|存档槽位",
                              doc.sections[index], re.IGNORECASE)
                )
                self_created = family == "sk_" and "玩家命名" in line
                if not registry and not self_created:
                    continue
                width = max(len(start_text), len(end_text))
                for number in range(start, end + 1):
                    identifier = left + str(number).zfill(width)
                    key = (identifier, doc.rel, index + 1)
                    if key in seen:
                        continue
                    definitions.append(Definition(
                        id=identifier,
                        location=Location(doc.rel, index + 1, match.start() + 1),
                        name=None,
                        shape="numeric-range",
                    ))
                    seen.add(key)


def owner_exists(root: Path, family: str) -> bool:
    """Return whether at least one configured owner file exists."""
    for pattern in OWNERSHIP.get(family, ()):
        if any(char in pattern for char in "*?["):
            if any(path.is_file() for path in root.glob(pattern)):
                return True
        elif (root / pattern).is_file():
            return True
    return False


def derived_item_skill(identifier: str) -> Optional[str]:
    """Map conventional manual/page IDs to the SkillDef they derive from."""
    match = re.match(r"^it_(?:miji|canye)_(.+)$", identifier)
    if not match:
        return None
    tail = re.sub(r"_(?:can|su)$", "", match.group(1))
    return "sk_" + tail


def covered_by_conventional_parent(identifier: str, defined: Set[str]) -> bool:
    """Return whether a derived ID has its authoritative parent object."""
    skill = derived_item_skill(identifier)
    if skill is not None:
        return skill in defined
    # Recipe knowledge uses the same suffix as the item it produces (10
    # §2.2/§8.7); the owner intentionally lists examples instead of a second
    # exhaustive catalog. A misspelled suffix still fails because no item
    # parent will exist.
    if identifier.startswith("rc_"):
        return "it_" + identifier[len("rc_"):] in defined
    return False


def covered_by_parameterized_definition(
    root: Path, identifier: str, defined: Set[str]
) -> bool:
    """Return whether an ID is an instance of a defined wildcard family."""
    if not any(pattern.fullmatch(identifier) for pattern in DERIVED_ID_PATTERNS):
        return False
    if identifier.startswith("fam_"):
        # The authoritative registry spells these as ``fam_pct_<stat>`` and
        # peers. Placeholder tokens are deliberately excluded by extraction,
        # so existence of the family owner is the reliable authority signal.
        return owner_exists(root, "fam_")
    if identifier.startswith("vid_sleep_"):
        match = re.fullmatch(r"vid_sleep_(\d{2})_(\d{2})", identifier)
        return bool(match and int(match.group(2)) == int(match.group(1)) + 1)
    if identifier.startswith("vid_ch"):
        return owner_exists(root, "vid_")
    if identifier.startswith("save_"):
        return owner_exists(root, "save_")
    # save_booksleep/wake and it_shijian are explicitly reserved as patterns
    # by their owning documents; the concrete suffix is the data parameter.
    return True


def non_live_reference(occurrence: Occurrence) -> bool:
    """Suppress explicit examples, proposals, and migration-only keys."""
    rel = occurrence.location.file
    line = occurrence.context
    if MIGRATION_SECTION_RE.search(occurrence.section):
        return True
    if NEGATED_REFERENCE_RE.search(line):
        return True
    if operation_or_modifier_key_for_occurrence(occurrence):
        return True
    # Chapter 14 deliberately ends in the separate finale asset family.  The
    # impossible adjacent-book token is retained in prose and acceptance tests
    # only to forbid its creation; do not turn that negative assertion into an
    # asset requirement.  Keep both the ID and wording narrow so a positive use
    # of this token, or any other invalid sleep-video edge, still fails lint.
    if occurrence.id == "vid_sleep_14_15" and re.search(
        r"(?:不经过|不创建|禁止创建|不得创建)[^。；\n]{0,24}`?vid_sleep_14_15",
        line,
    ):
        return True
    # tech/08 uses this exact string as a JSON Schema discriminator value,
    # not as a SetDef reference.  Constrain the exception to the owning
    # protocol document, a fenced schema line, and an exact ``const`` shape so
    # ordinary undefined set_* references remain visible.
    if (
        rel == "docs/tech/08-backend-and-online.md"
        and occurrence.id == "set_allowed_flag"
        and occurrence.in_fence
        and re.search(r'"const"\s*:\s*"set_allowed_flag"', line)
    ):
        return True
    if is_data_source_rel(rel):
        # Enum/value strings such as "city_anchor" and "post_station"
        # collide with registered prefixes but are not object references.
        column = line.find(occurrence.id)
        key = line[:column] if column >= 0 else ""
        match = re.search(r"[\"'](?P<field>[a-z][a-z0-9_]*)[\"']\s*:\s*[\"']$", key)
        if match and match.group("field") in DATA_ENUM_FIELDS:
            return True
    if rel == "docs/design/08-terrain-and-qinggong.md":
        if occurrence.id.startswith("rg_") and re.match(r"9(?:\.|\s)", occurrence.h2):
            return True
        if occurrence.id.startswith(("it_", "eq_")):
            return True
    if rel == "docs/design/17-sects-compendium.md":
        if occurrence.id.startswith("sk_"):
            return True
        # Region/city placement in the sect compendium is explicitly advice
        # for the world-map owner, including a few rows that omit the repeated
        # word "建议". It is not an active RegionDef reference.
        if occurrence.id.startswith("rg_"):
            return True
    if rel == "docs/design/09-combat-system.md":
        if occurrence.id.startswith("rg_") and "区域 ID 由 chapters/" in line:
            return True
    if rel == "docs/design/catalog/skills-kangxi.md":
        if occurrence.id == "sk_baoxun" and "不把" in line and "武学" in line:
            return True
    if rel == "docs/tech/01-architecture.md":
        if "小步提交与任务切片" in occurrence.section:
            return True
    if rel == "docs/tech/06-asset-storage.md" and occurrence.in_fence:
        if (
            "清单（manifest）结构" in occurrence.section
            or "块归属：由内容引用图自动计算" in occurrence.section
        ):
            return True
    if rel == "docs/tech/06-asset-storage.md":
        if "四种标识及其关系" in occurrence.section:
            return True
    if rel.startswith("docs/tech/") and ("示例" in occurrence.section or "例" in line):
        return True
    if rel == "docs/design/10-items-and-equipment.md" and re.match(r"2(?:\.|\s)", occurrence.h2):
        return True
    if rel == "docs/design/catalog/skills-kangxi.md" and occurrence.id in {
        "it_ningxue_miji", "it_shenzhao_yuwen"
    }:
        return True
    return False


def operation_or_modifier_key_for_occurrence(occurrence: Occurrence) -> bool:
    """Fallback for direct callers without a Document instance."""
    if not occurrence.id.startswith("set_"):
        return False
    line = occurrence.context
    if occurrence.location.file == "docs/design/03-attributes.md" and re.search(
        r"flat_[a-z0-9_]+.*pct_[a-z0-9_]+.*\b{}\b".format(re.escape(occurrence.id)),
        line,
    ):
        return True
    if occurrence.location.file == "docs/design/12-quests-npc-factions.md" and re.search(
        r"allowedEffects\s*:\s*\[[^]]*\b{}\b".format(re.escape(occurrence.id)), line
    ):
        return True
    return bool(occurrence.in_fence and re.search(
        r"(?:\bkind\b|\bop\b|['\"]const['\"])\s*:\s*['\"]{}['\"]".format(
            re.escape(occurrence.id)
        ),
        line,
    ))


def parse_rename_rules(path: Path, warnings: List[str]) -> List[RenameRule]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (OSError, UnicodeError) as exc:
        warnings.append("cannot parse rename table {}: {}".format(path, exc))
        return []
    in_section = False
    rules: List[RenameRule] = []
    seen: Set[str] = set()
    for line in lines:
        if line.startswith("## 2. "):
            in_section = True
            continue
        if in_section and line.startswith("## "):
            break
        if not in_section or not line.lstrip().startswith("|") or is_separator_row(line):
            continue
        cells = split_markdown_row(line)
        if len(cells) < 2 or "旧 ID" in cells[0]:
            continue
        old_values = INLINE_CODE_RE.findall(cells[0])
        new_values = INLINE_CODE_RE.findall(cells[1])
        if not old_values or not new_values:
            continue
        new = new_values[0]
        for old in old_values:
            if old == new or old in seen:
                continue
            if "_" not in old and not old.startswith("ch"):
                continue
            is_pattern = "<" in old or "*" in old or "NN" in old
            rules.append(RenameRule(old=old, new=new, is_pattern=is_pattern))
            seen.add(old)
    return rules


def parse_set_deprecation_rules(
    doc: Document, id_regex: re.Pattern[str]
) -> List[RenameRule]:
    """Parse design/07 §19's retired candidate ledger.

    Merged rows retain every stated formal destination because the prose does
    not promise positional one-to-one mapping. Deleted or deferred rows use a
    stable diagnostic label instead of treating their prose as a content ID.
    """
    rules: List[RenameRule] = []
    seen: Set[str] = set()
    for index, row in sorted(doc.tables.items()):
        if not re.match(r"19(?:\.|\s)", doc.h2s[index]):
            continue
        headers = [clean_markdown(value).lower().replace(" ", "") for value in row.headers]
        old_col: Optional[int] = None
        destination_col: Optional[int] = None
        for column, header in enumerate(headers):
            if "原候选" in header or "未入选候选" in header:
                old_col = column
            if header in {"去向", "去向/理由"} or header.startswith("去向"):
                destination_col = column
        if old_col is None or old_col >= len(row.cells):
            continue
        old_ids = [
            match.group(0) for match in id_regex.finditer(row.cells[old_col])
            if match.group(0).startswith("set_")
        ]
        if not old_ids:
            continue
        destinations: List[str] = []
        if destination_col is not None and destination_col < len(row.cells):
            destinations = [
                match.group(0) for match in id_regex.finditer(row.cells[destination_col])
                if match.group(0).startswith("set_")
            ]
        replacement = " / ".join(dict.fromkeys(destinations)) or "删除 / 延后"
        for old in old_ids:
            if old in seen or old in destinations:
                continue
            rules.append(RenameRule(old=old, new=replacement))
            seen.add(old)
    return rules


def pattern_regex(value: str) -> re.Pattern[str]:
    pieces: List[str] = []
    index = 0
    token_re = re.compile(r"<[^>]+>|NN|\*")
    for match in token_re.finditer(value):
        pieces.append(re.escape(value[index:match.start()]))
        token = match.group(0)
        pieces.append(r"[a-z0-9]+" if token.startswith("<") or token == "*" else r"\d{2}")
        index = match.end()
    pieces.append(re.escape(value[index:]))
    return re.compile(r"(?<![A-Za-z0-9_]){}(?![A-Za-z0-9_])".format("".join(pieces)))


def location_dict(location: Location) -> Dict[str, object]:
    return {"file": location.file, "line": location.line, "column": location.column}


def undefined_issues(
    root: Path, occurrences: Sequence[Occurrence], definitions: Sequence[Definition],
    prefixes: Sequence[str], deprecated_ids: Optional[Set[str]] = None,
) -> List[Dict[str, object]]:
    defined = {definition.id for definition in definitions}
    suspended = {
        family for family in SUSPEND_IF_ALL_OWNERS_MISSING
        if not owner_exists(root, family)
    }
    first_reference: Dict[str, Occurrence] = {}
    count: Dict[str, int] = {}
    for occurrence in occurrences:
        if not occurrence.active or occurrence.definition or occurrence.local:
            continue
        if occurrence.id in defined:
            continue
        if occurrence.id in (deprecated_ids or set()):
            continue
        # Move/passive IDs are intentionally local children of a defined skill
        # and often live only in prose tables; treating them as unresolved would
        # swamp content-object findings.  They remain eligible for near-match.
        family = family_for(occurrence.id, prefixes)
        if family in {"mv_", "ps_"}:
            continue
        if family in suspended or occurrence.id in EXPLICITLY_REJECTED_IDS:
            continue
        if non_live_reference(occurrence):
            continue
        if covered_by_parameterized_definition(root, occurrence.id, defined):
            continue
        if covered_by_conventional_parent(occurrence.id, defined):
            continue
        first_reference.setdefault(occurrence.id, occurrence)
        count[occurrence.id] = count.get(occurrence.id, 0) + 1
    result: List[Dict[str, object]] = []
    for identifier in sorted(first_reference):
        occurrence = first_reference[identifier]
        result.append({
            "id": identifier,
            **location_dict(occurrence.location),
            "references": count[identifier],
            "context": occurrence.context,
        })
    return result


def duplicate_issues(definitions: Sequence[Definition]) -> List[Dict[str, object]]:
    by_id: Dict[str, List[Definition]] = {}
    for definition in definitions:
        by_id.setdefault(definition.id, []).append(definition)
    result: List[Dict[str, object]] = []
    for identifier, entries in sorted(by_id.items()):
        # Catalog cards are the authoritative SkillDef names. Mechanism
        # headings in design/05 may prepend explanatory wording (such as
        # "双人合璧：") without renaming the skill itself.
        if identifier.startswith("sk_"):
            authoritative = [
                entry for entry in entries
                if fnmatch.fnmatchcase(entry.location.file, "docs/design/catalog/*.md")
            ]
            if authoritative:
                entries = authoritative
        # design/17 §3 is the sole normative sect-name matrix.  Catalogs and
        # subsection headings deliberately use shorter/group display labels.
        if identifier.startswith("sect_"):
            authoritative = [
                entry for entry in entries
                if entry.location.file == "docs/design/17-sects-compendium.md"
                and entry.shape == "table"
            ]
            if authoritative:
                entries = authoritative
        sites = {(entry.location.file, entry.location.line) for entry in entries}
        if len(sites) < 2:
            continue
        names_by_normalized: Dict[str, str] = {}
        for entry in entries:
            if entry.name:
                names_by_normalized.setdefault(normalized_name(entry.name), entry.name)
        names = sorted(names_by_normalized.values())
        # Same-name repeated summary/index rows are not a conflict.  Report only
        # field disagreement, as required, and retain every site for diagnosis.
        if len(names) < 2:
            continue
        result.append({
            "id": identifier,
            "field": "name",
            "values": names,
            "definitions": [
                {**location_dict(entry.location), "name": entry.name, "shape": entry.shape}
                for entry in entries
            ],
        })
    return result


def levenshtein_at_most_two(left: str, right: str) -> Optional[int]:
    if left == right:
        return 0
    if abs(len(left) - len(right)) > 2:
        return None
    previous = list(range(len(right) + 1))
    for i, char_left in enumerate(left, 1):
        current = [i]
        row_min = i
        for j, char_right in enumerate(right, 1):
            value = min(
                current[j - 1] + 1,
                previous[j] + 1,
                previous[j - 1] + (char_left != char_right),
            )
            current.append(value)
            row_min = min(row_min, value)
        if row_min > 2:
            return None
        previous = current
    return previous[-1] if previous[-1] <= 2 else None


def near_match_issues(
    occurrences: Sequence[Occurrence], definitions: Sequence[Definition],
    prefixes: Sequence[str],
    allowed_pairs: Optional[Set[frozenset[str]]] = None,
) -> List[Dict[str, object]]:
    def eligible(occurrence: Occurrence) -> bool:
        return (
            occurrence.active
            and not occurrence.local
            and occurrence.id not in EXPLICITLY_REJECTED_IDS
            and not non_live_reference(occurrence)
        )

    ids = {
        occurrence.id for occurrence in occurrences
        if eligible(occurrence)
    }
    ids.update(definition.id for definition in definitions)
    first: Dict[str, Location] = {}
    defined_ids = {definition.id for definition in definitions}
    for occurrence in occurrences:
        if eligible(occurrence):
            first.setdefault(occurrence.id, occurrence.location)
    # Definitions can enter ``ids`` even when their source line is not an
    # active reference (for example a valid table row whose descriptive cells
    # contain the word "模板").  Preserve active-reference locations when
    # available, then fall back to the definition site.  The final sentinel
    # keeps diagnostics total if a future caller supplies an ID from another
    # source without a corresponding occurrence or definition location.
    for definition in definitions:
        first.setdefault(definition.id, definition.location)
    unknown_location = Location("?", 0, 0)
    result: List[Dict[str, object]] = []
    by_family: Dict[str, List[str]] = {}
    for identifier in ids:
        family = family_for(identifier, prefixes)
        if family:
            by_family.setdefault(family, []).append(identifier)
    for family, family_ids in sorted(by_family.items()):
        # Child IDs and high-volume serial namespaces naturally form dense
        # edit-distance clusters and do not indicate misspellings.
        if family in {"mv_", "ps_", "q_", "ch", "tsp_", "sqj_", "save_", "echo_", "bs_", "bsc_", "ach_"}:
            continue
        family_ids.sort()
        for index, left in enumerate(family_ids):
            left_tail = left[len(family):]
            if len(left_tail) < 4:
                continue
            for right in family_ids[index + 1:]:
                pair = frozenset((left, right))
                if pair in (allowed_pairs or set()):
                    continue
                right_tail = right[len(family):]
                if len(right_tail) < 4:
                    continue
                distance = levenshtein_at_most_two(left_tail, right_tail)
                if distance not in {1, 2}:
                    continue
                # Prefix extensions (foo/fooquan, foo01/foo02) are usually
                # deliberate variants, not typos.
                if left_tail.startswith(right_tail) or right_tail.startswith(left_tail):
                    continue
                if (
                    re.sub(r"\d+$", "", left_tail) == re.sub(r"\d+$", "", right_tail)
                    and re.search(r"\d+$", left_tail)
                    and re.search(r"\d+$", right_tail)
                ):
                    continue
                # The actionable spelling case is an observed token close to a
                # defined token. Two established siblings (e.g. bidu/bigu) are
                # not suspicious merely because pinyin is short.
                if (left in defined_ids) == (right in defined_ids):
                    continue
                result.append({
                    "ids": [left, right],
                    "prefix": family,
                    "distance": distance,
                    "locations": [
                        location_dict(first.get(left, unknown_location)),
                        location_dict(first.get(right, unknown_location)),
                    ],
                    "defined": [left in defined_ids, right in defined_ids],
                })
    return result


def load_near_allowlist(
    path: Path, warnings: List[str]
) -> Tuple[Set[frozenset[str]], str]:
    """Load reviewed, unordered near-match pairs from JSON."""
    if not path.is_file():
        warnings.append("near-match allowlist is missing: {}".format(path))
        return set(), "missing"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("schema_version") != 1 or not isinstance(payload.get("pairs"), list):
            raise ValueError("schema_version 1 and pairs list are required")
        pairs: Set[frozenset[str]] = set()
        for pair in payload["pairs"]:
            if (
                not isinstance(pair, list)
                or len(pair) != 2
                or not all(isinstance(item, str) and item for item in pair)
                or pair[0] == pair[1]
            ):
                raise ValueError("each pair must contain two distinct ID strings")
            pairs.add(frozenset(pair))
    except (OSError, UnicodeError, ValueError, json.JSONDecodeError) as exc:
        warnings.append("cannot load near-match allowlist {}: {}".format(path, exc))
        return set(), "invalid"
    return pairs, "loaded"


def old_id_issues(
    documents: Sequence[Document], rules: Sequence[RenameRule]
) -> List[Dict[str, object]]:
    result: List[Dict[str, object]] = []
    for rule in rules:
        regex = pattern_regex(rule.old) if rule.is_pattern else re.compile(
            r"(?<![A-Za-z0-9_]){}(?![A-Za-z0-9_])".format(re.escape(rule.old))
        )
        for doc in documents:
            for index, line in enumerate(doc.lines):
                for match in regex.finditer(line):
                    # Migration/ruling/history prose may preserve an old token.
                    if (
                        doc.rel == RULINGS_REL
                        or PROVISIONAL_LINE_RE.search(line)
                        or PROVISIONAL_SECTION_RE.search(doc.sections[index])
                        or MIGRATION_SECTION_RE.search(doc.sections[index])
                        or NEGATED_REFERENCE_RE.search(line)
                    ):
                        continue
                    result.append({
                        "old_id": match.group(0),
                        "rule": rule.old,
                        "replacement": rule.new,
                        **location_dict(Location(doc.rel, index + 1, match.start() + 1)),
                        "context": line.strip()[:500],
                    })
    result.sort(key=lambda item: (str(item["file"]), int(item["line"]), str(item["old_id"])))
    return result


def ids_in_cell(cell: str, id_regex: re.Pattern[str], wanted: Set[str]) -> Set[str]:
    result: Set[str] = set()
    for match in id_regex.finditer(cell):
        identifier = match.group(0)
        if any(identifier.startswith(prefix) for prefix in wanted):
            result.add(identifier)
    return result


def parse_set_definitions(
    doc: Document, id_regex: re.Pattern[str]
) -> Dict[str, Tuple[Set[str], Location]]:
    """Parse the authoritative registry and card catalog in 07 §§8–18.

    Section 2's YAML is an explanatory sample, while section 19 is a retired
    candidate ledger. Neither is allowed to overwrite the release catalog.
    """
    result: Dict[str, Tuple[Set[str], Location]] = {}
    wanted = {"sk_", "eq_", "it_"}

    # Section 8.4 is the machine-readable mirror for all skill memberships.
    # It deliberately omits the one equipment member, which is supplied by
    # the corresponding §§9–18 card below.
    for index, row in sorted(doc.tables.items()):
        if "正式成员注册表" not in doc.sections[index]:
            continue
        normalized = [
            clean_markdown(header).lower().replace(" ", "")
            for header in row.headers
        ]
        try:
            set_col = normalized.index("套装id")
            member_col = normalized.index("成员")
        except ValueError:
            continue
        if max(set_col, member_col) >= len(row.cells):
            continue
        set_ids = ids_in_cell(row.cells[set_col], id_regex, {"set_"})
        if len(set_ids) != 1:
            continue
        set_id = next(iter(set_ids))
        members = ids_in_cell(row.cells[member_col], id_regex, wanted)
        result[set_id] = (
            members,
            Location(doc.rel, index + 1, doc.lines[index].find(set_id) + 1),
        )

    heading_re = re.compile(
        r"^###\s+(?P<section>(?:8|9|1[0-8])\.\d+)\s+.*?`(?P<id>set_[a-z0-9_]+)`"
    )
    for index, line in enumerate(doc.lines):
        heading = heading_re.match(line)
        if heading is None:
            continue
        set_id = heading.group("id")
        members: Set[str] = set()
        for scan in range(index + 1, len(doc.lines)):
            next_heading = HEADING_RE.match(doc.lines[scan])
            if next_heading and len(next_heading.group(1)) <= 3:
                break
            row = doc.tables.get(scan)
            if row is None or len(row.cells) < 2:
                continue
            label = clean_markdown(row.cells[0]).replace(" ", "")
            if re.fullmatch(r"成员(?:（\d+）|\(\d+\))?", label):
                members.update(ids_in_cell(row.cells[1], id_regex, wanted))
        prior_members, _ = result.get(set_id, (set(), None))
        result[set_id] = (
            prior_members | members,
            Location(doc.rel, index + 1, line.find(set_id) + 1),
        )
    return result


def parse_member_set_tags(
    documents: Sequence[Document], definitions: Sequence[Definition], id_regex: re.Pattern[str]
) -> Dict[str, Tuple[Set[str], Location]]:
    """Aggregate reverse ``setTags`` across every definition of a member.

    Catalogs repeat an ID in indexes and end-of-file inventories. Those terse
    definitions must not overwrite tags found on the authoritative card.
    """
    result: Dict[str, Tuple[Set[str], Location]] = {}
    # Only definitions that are themselves cards may own an adjacent
    # ``setTags`` field.  Inventory/canon/range definitions are summaries;
    # scanning forward from them incorrectly assigns every later set ID in
    # the section to every listed member.
    card_shapes = {"heading", "bold-card", "yaml-id", "table"}
    relevant_defs = [
        definition for definition in definitions
        if definition.id.startswith(("sk_", "eq_", "it_"))
        and definition.shape in card_shapes
    ]
    known_members = {definition.id for definition in relevant_defs}
    docs_by_rel = {doc.rel: doc for doc in documents}

    def tags_from_value(value: str) -> Set[str]:
        array = re.search(r"\[([^]]*)\]", value)
        if array is None:
            return set()
        return {
            match.group(0) for match in id_regex.finditer(array.group(1))
            if match.group(0).startswith("set_")
        }

    def tags_at_line(doc: Document, index: int, member_id: str) -> Set[str]:
        tags: Set[str] = set()
        if index in doc.tables:
            row = doc.tables[index]
            for col, header in enumerate(row.headers):
                if col >= len(row.cells):
                    continue
                cell = row.cells[col]
                if "settags" in clean_markdown(header).lower().replace(" ", ""):
                    tags.update(
                        match.group(0) for match in id_regex.finditer(cell)
                        if match.group(0).startswith("set_")
                    )
                marker = re.search(r"setTags", cell, re.IGNORECASE)
                if marker:
                    # Field/value cards put the label in this cell and the
                    # actual value in the next cell.  Compact cards may keep
                    # both on one line and need not wrap the value in ``[]``.
                    value = " ".join(
                        [cell[marker.end():]] + row.cells[col + 1:]
                    )
                    tags.update(ids_in_cell(value, id_regex, {"set_"}))
            return tags
        line = doc.lines[index]
        # A block may embed other SkillDef objects (moves, prerequisites,
        # examples). Only a line that declares the member itself, or contains
        # no foreign top-level content ID, can own its reverse tags.
        ids = {match.group(0) for match in id_regex.finditer(line)}
        foreign_members = {
            identifier for identifier in ids
            if identifier.startswith(("sk_", "eq_", "it_"))
            and identifier != member_id
        }
        if foreign_members:
            return tags
        marker = re.search(r"setTags", line, re.IGNORECASE)
        if marker:
            tags.update(ids_in_cell(line[marker.end():], id_regex, {"set_"}))
        return tags

    def scan_block(doc: Document, start: int, shape: str, member_id: str) -> Set[str]:
        if shape == "table":
            return tags_at_line(doc, start, member_id)
        tags: Set[str] = set()
        base_heading = HEADING_RE.match(doc.lines[start])
        base_level = len(base_heading.group(1)) if base_heading else 99
        for scan in range(start, len(doc.lines)):
            if scan > start:
                heading = HEADING_RE.match(doc.lines[scan])
                if shape == "heading" and heading and len(heading.group(1)) <= base_level:
                    break
                if shape == "yaml-id" and not doc.in_fence[scan]:
                    break
                if shape == "bold-card":
                    line = doc.lines[scan]
                    closing = line.find("**", line.find("**") + 2)
                    if (
                        heading
                        or (line.lstrip().startswith("**")
                        and closing >= 0
                        and id_regex.search(line[: closing + 2]))
                    ):
                        break
            tags.update(tags_at_line(doc, scan, member_id))
        return tags

    def merge(identifier: str, tags: Set[str], location: Location) -> None:
        aggregated, prior_location = result.get(identifier, (set(), location))
        aggregated.update(tags)
        result[identifier] = (aggregated, location if tags else prior_location)

    anchored: Set[Tuple[str, int, str]] = set()
    for definition in relevant_defs:
        doc = docs_by_rel.get(definition.location.file)
        if doc is None:
            continue
        start = definition.location.line - 1
        tags = scan_block(doc, start, definition.shape, definition.id)
        merge(definition.id, tags, definition.location)
        anchored.add((doc.rel, start, definition.id))

    # F2c added one explicit mirror table to every martial-arts catalog.
    # Read only rows whose section is named accordingly and whose columns are
    # exactly an ID column plus ``setTags``; no neighboring prose is inherited.
    for doc in documents:
        if not fnmatch.fnmatch(doc.rel, "docs/design/catalog/*.md"):
            continue
        for index, row in sorted(doc.tables.items()):
            if "正式套装反向标签镜像" not in doc.sections[index]:
                continue
            normalized = [
                clean_markdown(header).lower().replace(" ", "")
                for header in row.headers
            ]
            tag_cols = [
                col for col, header in enumerate(normalized)
                if header == "settags"
            ]
            id_cols = [
                col for col, header in enumerate(normalized)
                if header in {"id", "武学id", "装备id", "物品id"}
            ]
            if len(tag_cols) != 1 or len(id_cols) != 1:
                continue
            id_col, tag_col = id_cols[0], tag_cols[0]
            if max(id_col, tag_col) >= len(row.cells):
                continue
            members = ids_in_cell(row.cells[id_col], id_regex, {"sk_", "eq_", "it_"})
            if len(members) != 1:
                continue
            member_id = next(iter(members))
            member_tags = ids_in_cell(row.cells[tag_col], id_regex, {"set_"})
            merge(
                member_id, member_tags,
                Location(doc.rel, index + 1, doc.lines[index].find(member_id) + 1),
            )

    # A real catalog card can contain words such as "用户示例套装成员", which
    # correctly keeps it from becoming a second definition but must not hide
    # its reverse tag. Discover only owner-local, named card boundaries for IDs
    # that already have an authoritative definition elsewhere.
    for doc in documents:
        for index, line in enumerate(doc.lines):
            ids = [
                match.group(0) for match in id_regex.finditer(line)
                if match.group(0) in known_members
            ]
            if len(ids) != 1 or (doc.rel, index, ids[0]) in anchored:
                continue
            identifier = ids[0]
            if (
                MIGRATION_SECTION_RE.search(doc.sections[index])
                or PROVISIONAL_SECTION_RE.search(doc.sections[index])
                or not definition_allowed(identifier, doc, index, DEFAULT_PREFIXES)
            ):
                continue
            heading = HEADING_RE.match(line)
            closing = line.find("**", line.find("**") + 2)
            if heading and heading_name(line, identifier, 1):
                shape = "heading"
            elif line.lstrip().startswith("**") and closing >= 0 and identifier in line[: closing + 2]:
                shape = "bold-card"
            else:
                continue
            merge(
                identifier, scan_block(doc, index, shape, identifier),
                Location(doc.rel, index + 1, line.find(identifier) + 1),
            )
    return result


def set_symmetry_issues(
    root: Path,
    documents: Sequence[Document],
    definitions: Sequence[Definition],
    id_regex: re.Pattern[str],
    warnings: List[str],
) -> Tuple[List[Dict[str, object]], str]:
    set_path = root / SET_SYSTEM_REL
    if not set_path.is_file():
        return [], "skipped: {} does not exist".format(SET_SYSTEM_REL)
    doc = next((item for item in documents if item.rel == SET_SYSTEM_REL), None)
    if doc is None:
        doc = load_document(set_path, root, warnings)
    if doc is None:
        return [], "skipped: could not read {}".format(SET_SYSTEM_REL)
    sets = parse_set_definitions(doc, id_regex)
    if not sets:
        warnings.append("{} exists but no unambiguous SetDef members were parsed".format(SET_SYSTEM_REL))
        return [], "checked: no parseable SetDef rows"
    tags = parse_member_set_tags(documents, definitions, id_regex)
    result: List[Dict[str, object]] = []
    for set_id, (members, set_location) in sorted(sets.items()):
        for member in sorted(members):
            member_tags, member_location = tags.get(member, (set(), None))
            if set_id not in member_tags:
                issue: Dict[str, object] = {
                    "direction": "member_missing_setTag",
                    "set_id": set_id,
                    "member_id": member,
                    "set_location": location_dict(set_location),
                }
                if member_location:
                    issue["member_location"] = location_dict(member_location)
                result.append(issue)
    for member, (member_tags, member_location) in sorted(tags.items()):
        for set_id in sorted(member_tags):
            if set_id not in sets:
                continue
            members, set_location = sets[set_id]
            if member not in members:
                result.append({
                    "direction": "set_missing_member",
                    "set_id": set_id,
                    "member_id": member,
                    "set_location": location_dict(set_location),
                    "member_location": location_dict(member_location),
                })
    return result, "checked: {} SetDef entries".format(len(sets))


def discover_document_paths(
    root: Path, raw_paths: Sequence[str], warnings: List[str]
) -> List[Path]:
    targets = [Path(value) for value in raw_paths] if raw_paths else [root / "docs"]
    paths: Set[Path] = set()
    for target in targets:
        candidate = target if target.is_absolute() else root / target
        if candidate.is_dir():
            paths.update(path for path in candidate.rglob("*.md") if path.is_file())
            for pattern in DATA_SOURCE_PATTERNS:
                paths.update(
                    path for path in root.glob(pattern)
                    if path.is_file() and (not raw_paths or candidate in path.parents)
                )
        elif candidate.is_file():
            candidate_rel = relpath(candidate, root)
            if candidate.suffix.lower() == ".md" or is_data_source_rel(candidate_rel):
                paths.add(candidate)
            else:
                warnings.append("ignored unsupported path: {}".format(candidate_rel))
        else:
            warnings.append("path does not exist: {}".format(target))
    return sorted(paths, key=lambda path: relpath(path, root))


def ensure_support_documents(root: Path, paths: List[Path]) -> List[Path]:
    result = set(paths)
    for relative in (CANON_REL, RULINGS_REL):
        path = root / relative
        if path.is_file():
            result.add(path)
    if (root / SET_SYSTEM_REL).is_file():
        result.add(root / SET_SYSTEM_REL)
    return sorted(result, key=lambda path: relpath(path, root))


def load_baseline(path: Path, warnings: List[str]) -> Tuple[Set[str], Set[str], str]:
    """Load stable strict issue keys; locations deliberately do not matter."""
    if not path.is_file():
        return set(), set(), "missing"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("schema_version") != BASELINE_VERSION:
            raise ValueError("unsupported schema_version")
        undefined = payload.get("undefined_ids")
        deprecated = payload.get("deprecated_ids")
        if not isinstance(undefined, list) or not isinstance(deprecated, list):
            raise ValueError("issue lists are required")
        if not all(isinstance(item, str) for item in undefined + deprecated):
            raise ValueError("issue keys must be strings")
    except (OSError, UnicodeError, ValueError, json.JSONDecodeError) as exc:
        warnings.append("cannot load baseline {}: {}".format(path, exc))
        return set(), set(), "invalid"
    return set(undefined), set(deprecated), "loaded"


def baseline_payload(report: Mapping[str, object]) -> Dict[str, object]:
    issues = report["issues"]  # type: ignore[assignment]
    return {
        "schema_version": BASELINE_VERSION,
        "undefined_ids": sorted(item["id"] for item in issues["undefined_references"]),
        "deprecated_ids": sorted({item["old_id"] for item in issues["deprecated_ids"]}),
    }


def write_baseline(path: Path, report: Mapping[str, object]) -> None:
    """Atomically replace the baseline after a complete successful scan."""
    path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(baseline_payload(report), ensure_ascii=False, indent=2) + "\n"
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=str(path.parent), delete=False
    ) as handle:
        handle.write(content)
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(path)


def format_location(item: Mapping[str, object]) -> str:
    return "{}:{}:{}".format(
        item.get("file", "?"), item.get("line", "?"), item.get("column", "?")
    )


def print_human(report: Mapping[str, object]) -> None:
    for warning in report["warnings"]:  # type: ignore[union-attr]
        print("warning: {}".format(warning), file=sys.stderr)
    scan = report["scan"]  # type: ignore[assignment]
    print("ID consistency report")
    print(
        "scanned: {files} files ({markdown_files} Markdown, {data_files} data), "
        "{occurrences} occurrences, {definitions} definitions".format(
            **scan  # type: ignore[arg-type]
        )
    )
    suffix = (
        " (built-in fallback)"
        if report["prefix_source"] == "fallback"
        else " (Canon section 12)"
    )
    print("prefixes: {}{}".format(" ".join(report["prefixes"]), suffix))  # type: ignore[arg-type]
    labels = (
        ("undefined_references", "1. referenced but undefined"),
        ("conflicting_definitions", "2. conflicting duplicate definitions"),
        ("near_matches", "3. near-match ID pairs"),
        ("deprecated_ids", "4. deprecated IDs in active text"),
        ("set_tag_asymmetry", "5. set/member asymmetry"),
    )
    issues = report["issues"]  # type: ignore[assignment]
    for key, label in labels:
        entries = issues[key]
        print("\n{}: {}".format(label, len(entries)))
        for entry in entries:
            if key == "undefined_references":
                print(
                    "  {}  {} ({} refs)".format(
                        format_location(entry), entry["id"], entry["references"]
                    )
                )
            elif key == "conflicting_definitions":
                sites = ", ".join(
                    format_location(site) for site in entry["definitions"]
                )
                print(
                    "  {}  {}: {} [{}]".format(
                        entry["id"], entry["field"], " / ".join(entry["values"]), sites
                    )
                )
            elif key == "near_matches":
                sites = ", ".join(
                    format_location(site) for site in entry["locations"]
                )
                print(
                    "  {} <> {}  distance={} [{}]".format(
                        entry["ids"][0], entry["ids"][1], entry["distance"], sites
                    )
                )
            elif key == "deprecated_ids":
                print(
                    "  {}  {} -> {}".format(
                        format_location(entry), entry["old_id"], entry["replacement"]
                    )
                )
            else:
                print(
                    "  {}: {} <-> {}".format(
                        entry["direction"], entry["set_id"], entry["member_id"]
                    )
                )
    print("\nset check: {}".format(report["set_check"]))
    allowlist = report["near_allowlist"]  # type: ignore[assignment]
    print(
        "near-match allowlist: {status}; {pairs} reviewed pairs ({path})".format(
            **allowlist  # type: ignore[arg-type]
        )
    )
    baseline = report["baseline"]  # type: ignore[assignment]
    print(
        "baseline: {status}; known undefined/deprecated={known_undefined_ids}/"
        "{known_deprecated_ids}; new={new_count}".format(
            new_count=(
                len(baseline["new_undefined_ids"])
                + len(baseline["new_deprecated_ids"])
            ),
            **baseline,
        )
    )
    print(
        "strict failure count (new categories 1 + 4, all categories 2 + 5): {}".format(
            report["strict_failure_count"]
        )
    )


def build_report(root: Path, raw_paths: Sequence[str]) -> Dict[str, object]:
    warnings: List[str] = []
    prefixes, fallback = parse_prefixes(root / CANON_REL, warnings)
    id_regex = compile_id_regex(prefixes)
    requested_paths = discover_document_paths(root, raw_paths, warnings)
    all_paths = ensure_support_documents(root, requested_paths)
    documents = [
        doc for path in all_paths
        if (doc := load_document(path, root, warnings)) is not None
    ]
    requested_rels = {relpath(path, root) for path in requested_paths}
    # Canon/rulings are support inputs even for a narrow path scan. Findings
    # themselves stay scoped to paths explicitly selected by the caller.
    occurrences, definitions = extract_occurrences(documents, prefixes, id_regex)
    expand_range_definitions(documents, definitions, prefixes)
    scoped_occurrences = [
        item for item in occurrences if item.location.file in requested_rels
    ]
    scoped_documents = [doc for doc in documents if doc.rel in requested_rels]
    scoped_definitions = [
        item for item in definitions if item.location.file in requested_rels
    ]
    rename_rules = parse_rename_rules(root / RULINGS_REL, warnings)
    set_doc = next((doc for doc in documents if doc.rel == SET_SYSTEM_REL), None)
    set_deprecation_rules = (
        parse_set_deprecation_rules(set_doc, id_regex) if set_doc is not None else []
    )
    all_deprecation_rules = rename_rules + set_deprecation_rules
    deprecated_keys = {rule.old for rule in all_deprecation_rules if not rule.is_pattern}
    undefined = undefined_issues(
        root, scoped_occurrences, definitions, prefixes, deprecated_keys
    )
    duplicates = duplicate_issues(scoped_definitions)
    near_allowlist, near_allowlist_status = load_near_allowlist(
        root / NEAR_ALLOWLIST_REL, warnings
    )
    near = near_match_issues(
        scoped_occurrences, definitions, prefixes, near_allowlist
    )
    deprecated = old_id_issues(scoped_documents, all_deprecation_rules)
    set_issues, set_status = set_symmetry_issues(
        root, documents, definitions, id_regex, warnings
    )
    if SET_SYSTEM_REL not in requested_rels and raw_paths:
        set_issues = []
        set_status = "skipped: {} was outside requested paths".format(SET_SYSTEM_REL)
    baseline_undefined, baseline_deprecated, baseline_status = load_baseline(
        root / BASELINE_REL, warnings
    )
    undefined_ids = {str(item["id"]) for item in undefined}
    deprecated_ids = {str(item["old_id"]) for item in deprecated}
    new_undefined = sorted(undefined_ids - baseline_undefined)
    new_deprecated = sorted(deprecated_ids - baseline_deprecated)
    strict_count = (
        len(new_undefined) + len(new_deprecated)
        + len(duplicates) + len(set_issues)
    )
    return {
        "schema_version": VERSION,
        "root": root.as_posix(),
        "prefix_source": "fallback" if fallback else CANON_REL + "#12",
        "prefixes": prefixes,
        "scan": {
            "files": len(requested_paths),
            "markdown_files": sum(path.suffix.lower() == ".md" for path in requested_paths),
            "data_files": sum(path.suffix.lower() != ".md" for path in requested_paths),
            "occurrences": len(scoped_occurrences),
            "definitions": len(scoped_definitions),
        },
        "issues": {
            "undefined_references": undefined,
            "conflicting_definitions": duplicates,
            "near_matches": near,
            "deprecated_ids": deprecated,
            "set_tag_asymmetry": set_issues,
        },
        "counts": {
            "undefined_references": len(undefined),
            "conflicting_definitions": len(duplicates),
            "near_matches": len(near),
            "deprecated_ids": len(deprecated),
            "set_tag_asymmetry": len(set_issues),
        },
        "set_check": set_status,
        "near_allowlist": {
            "path": NEAR_ALLOWLIST_REL,
            "status": near_allowlist_status,
            "pairs": len(near_allowlist),
        },
        "baseline": {
            "path": BASELINE_REL,
            "status": baseline_status,
            "known_undefined_ids": len(undefined_ids & baseline_undefined),
            "known_deprecated_ids": len(deprecated_ids & baseline_deprecated),
            "new_undefined_ids": new_undefined,
            "new_deprecated_ids": new_deprecated,
        },
        "strict_failure_count": strict_count,
        "warnings": warnings,
    }


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="check cross-document tianshu content IDs"
    )
    parser.add_argument(
        "paths", nargs="*", help="Markdown files or directories (default: docs/)"
    )
    parser.add_argument(
        "--json", action="store_true", dest="as_json",
        help="emit machine-readable JSON",
    )
    parser.add_argument(
        "--strict", action="store_true",
        help=("exit 1 for new undefined/deprecated IDs or any conflicting "
              "definition/set asymmetry"),
    )
    parser.add_argument(
        "--update-baseline", action="store_true",
        help="replace the strict baseline from a complete default scan",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    if args.update_baseline and args.paths:
        print(
            "error: --update-baseline requires the complete default docs scan",
            file=sys.stderr,
        )
        return 2
    root = repository_root()
    report = build_report(root, args.paths)
    if args.update_baseline:
        write_baseline(root / BASELINE_REL, report)
        # Reflect the just-written baseline in output and strict semantics.
        report = build_report(root, args.paths)
    if args.as_json:
        for warning in report["warnings"]:
            print("warning: {}".format(warning), file=sys.stderr)
        print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        print_human(report)
    if args.strict and report["strict_failure_count"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

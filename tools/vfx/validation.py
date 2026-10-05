"""按 design/23 的实际 schema 校验制作数据、图像和自包含演示。"""

from __future__ import annotations

import base64
import io
import json
import math
import re
import subprocess
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Any

import numpy as np
from PIL import Image, UnidentifiedImageError
import yaml

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "docs/design/vfx/schema.yaml"


class VFXError(ValueError):
    """带有文件或字段位置的素材制作错误。"""


class _StrictLoader(yaml.SafeLoader):
    pass


def _mapping(loader: _StrictLoader, node: yaml.MappingNode) -> dict:
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=True)
        if not isinstance(key, str):
            raise VFXError(f"YAML 第 {key_node.start_mark.line + 1} 行：键必须为字符串")
        if key in result:
            raise VFXError(f"YAML 第 {key_node.start_mark.line + 1} 行：重复键 {key!r}")
        result[key] = loader.construct_object(value_node, deep=True)
    return result


_StrictLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _mapping)


def _json_values(value: Any, location: str = "$", stack: set | None = None) -> None:
    stack = set() if stack is None else stack
    if value is None or type(value) in (str, bool, int):
        return
    if type(value) is float:
        if not math.isfinite(value):
            raise VFXError(f"{location}：拒绝 NaN/Infinity")
        return
    if type(value) not in (dict, list):
        raise VFXError(f"{location}：不是 JSON 兼容值 ({type(value).__name__})")
    if id(value) in stack:
        raise VFXError(f"{location}：拒绝循环引用")
    stack.add(id(value))
    for key, child in (value.items() if isinstance(value, dict) else enumerate(value)):
        if isinstance(value, dict) and not isinstance(key, str):
            raise VFXError(f"{location}：对象键必须为字符串")
        _json_values(child, f"{location}.{key}", stack)
    stack.remove(id(value))


def load_yaml(path: str | Path) -> dict:
    path = Path(path)
    if path.suffix.lower() not in (".yaml", ".yml"):
        raise VFXError(f"{path}：要求 YAML 文件")
    try:
        data = yaml.load(path.read_text(encoding="utf-8"), Loader=_StrictLoader)
        _json_values(data)
    except (OSError, UnicodeError, yaml.YAMLError, RecursionError) as exc:
        raise VFXError(f"{path}：无法读取严格 YAML：{exc}") from exc
    if not isinstance(data, dict):
        raise VFXError(f"{path}：根必须为对象")
    return data


def save_yaml(path: str | Path, data: dict) -> None:
    _json_values(data)
    if not isinstance(data, dict):
        raise VFXError("YAML 根必须为对象")
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, allow_unicode=True, sort_keys=False), encoding="utf-8")


_KEYWORDS = {
    "$schema", "$comment", "$ref", "$defs", "title", "description", "x-unit",
    "default", "examples", "type", "const", "enum", "pattern", "minLength",
    "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "required",
    "properties", "additionalProperties", "minItems", "maxItems", "uniqueItems",
    "items", "prefixItems", "oneOf", "allOf", "if", "then", "else",
}


def _audit_schema(schema: Any, location: str = "schema") -> None:
    if type(schema) is bool:
        return
    if not isinstance(schema, dict):
        raise VFXError(f"{location}：无效 schema")
    unknown = set(schema) - _KEYWORDS
    if unknown:
        raise VFXError(f"{location}：检查器不支持 schema 关键字 {sorted(unknown)}")
    for name in ("$defs", "properties"):
        for key, child in schema.get(name, {}).items():
            _audit_schema(child, f"{location}.{name}.{key}")
    for name in ("items", "additionalProperties", "if", "then", "else"):
        if name in schema:
            _audit_schema(schema[name], f"{location}.{name}")
    for name in ("prefixItems", "oneOf", "allOf"):
        for index, child in enumerate(schema.get(name, [])):
            _audit_schema(child, f"{location}.{name}[{index}]")


def _same_json(left: Any, right: Any) -> bool:
    if type(left) in (int, float) and type(right) in (int, float):
        return left == right
    if type(left) is not type(right):
        return False
    if isinstance(left, list):
        return len(left) == len(right) and all(_same_json(a, b) for a, b in zip(left, right))
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(_same_json(left[k], right[k]) for k in left)
    return left == right


def _validate(value: Any, schema: Any, root: dict, location: str) -> None:
    if schema is False:
        raise VFXError(f"{location}：schema 禁止此值")
    if schema is True:
        return
    if "$ref" in schema:
        ref = schema["$ref"]
        if not ref.startswith("#/"):
            raise VFXError(f"{location}：仅支持本地 schema 引用 {ref}")
        target = root
        try:
            for key in ref[2:].split("/"):
                target = target[key.replace("~1", "/").replace("~0", "~")]
        except (KeyError, TypeError) as exc:
            raise VFXError(f"{location}：schema 引用不存在 {ref}") from exc
        _validate(value, target, root, location)
    checks = {
        "object": lambda x: type(x) is dict, "array": lambda x: type(x) is list,
        "string": lambda x: type(x) is str, "boolean": lambda x: type(x) is bool,
        "integer": lambda x: type(x) is int,
        "number": lambda x: type(x) in (int, float), "null": lambda x: x is None,
    }
    if "type" in schema:
        expected = schema["type"]
        if expected not in checks:
            raise VFXError(f"{location}：不支持 schema type={expected!r}")
        if not checks[expected](value):
            raise VFXError(f"{location}：要求 {expected}，实际 {type(value).__name__}")
    if "const" in schema and not _same_json(value, schema["const"]):
        raise VFXError(f"{location}：必须为 {schema['const']!r}")
    if "enum" in schema and not any(_same_json(value, x) for x in schema["enum"]):
        raise VFXError(f"{location}：不在允许枚举 {schema['enum']}")
    if type(value) in (int, float):
        for key, failed in (("minimum", lambda a, b: a < b),
                            ("maximum", lambda a, b: a > b),
                            ("exclusiveMinimum", lambda a, b: a <= b),
                            ("exclusiveMaximum", lambda a, b: a >= b)):
            if key in schema and failed(value, schema[key]):
                raise VFXError(f"{location}：违反 {key}={schema[key]}")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            raise VFXError(f"{location}：字符串过短")
        if "pattern" in schema and re.search(schema["pattern"], value) is None:
            raise VFXError(f"{location}：不符合格式 {schema['pattern']}")
    if isinstance(value, dict):
        missing = set(schema.get("required", [])) - set(value)
        if missing:
            raise VFXError(f"{location}：缺少必填字段 {sorted(missing)}")
        props = schema.get("properties", {})
        for key, child in value.items():
            _validate(child, props.get(key, schema.get("additionalProperties", True)),
                      root, f"{location}.{key}")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0) or len(value) > schema.get("maxItems", math.inf):
            raise VFXError(f"{location}：数组长度 {len(value)} 超出允许范围")
        if schema.get("uniqueItems") and any(
                _same_json(item, prev) for index, item in enumerate(value) for prev in value[:index]):
            raise VFXError(f"{location}：数组项重复")
        prefix = schema.get("prefixItems", [])
        for index, item in enumerate(value):
            child = prefix[index] if index < len(prefix) else schema.get("items", True)
            _validate(item, child, root, f"{location}[{index}]")
    for child in schema.get("allOf", []):
        _validate(value, child, root, location)
    if "oneOf" in schema:
        matches = 0
        reasons = []
        for child in schema["oneOf"]:
            try:
                _validate(value, child, root, location)
                matches += 1
            except VFXError as exc:
                reasons.append(str(exc))
        if matches != 1:
            raise VFXError(f"{location}：oneOf 匹配 {matches} 项；" + " / ".join(reasons))
    if "if" in schema:
        try:
            _validate(value, schema["if"], root, location)
            passed = True
        except VFXError:
            passed = False
        _validate(value, schema.get("then" if passed else "else", True), root, location)


def validate_schema(data: dict, kind: str | None = None) -> None:
    _json_values(data)
    schema = load_yaml(SCHEMA_PATH)
    _audit_schema(schema)
    if kind is not None:
        if kind not in schema["$defs"]:
            raise VFXError(f"未知文档 kind {kind!r}")
        _validate(data, schema["$defs"][kind], schema, "$")
    else:
        _validate(data, schema, schema, "$")


def resolve_path(owner_path: str | Path, relative: str, suite_root: str | Path) -> Path:
    """相对持有字段的 YAML 解析；允许套件内 ..，拒绝目录及符号链接逃逸。"""
    if not isinstance(relative, str) or not relative or "\\" in relative or "\x00" in relative:
        raise VFXError(f"{owner_path}：非法 POSIX 相对路径 {relative!r}")
    pure = PurePosixPath(relative)
    if pure.is_absolute() or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", relative):
        raise VFXError(f"{owner_path}：禁止绝对路径或 URL {relative!r}")
    try:
        root = Path(suite_root).resolve()
        owner = Path(owner_path).resolve()
        owner.relative_to(root)
        target = (owner.parent / relative).resolve()
        target.relative_to(root)
    except (ValueError, OSError, RuntimeError) as exc:
        raise VFXError(f"{owner_path}：路径逃出素材套件 {relative!r}") from exc
    if not target.is_file():
        raise VFXError(f"{owner_path}：所引文件不存在 {relative!r}")
    return target


def _png(path: Path, size: list | None = None, transparent: bool = False,
         zero_rgb: bool = False) -> np.ndarray:
    if path.suffix.lower() != ".png":
        raise VFXError(f"{path}：要求 PNG 文件")
    try:
        with Image.open(path) as image:
            image.load()
            if image.format != "PNG" or getattr(image, "n_frames", 1) != 1:
                raise VFXError(f"{path}：要求单帧 PNG")
            if size is not None and tuple(size) != image.size:
                raise VFXError(f"{path}：尺寸 {image.size} 与声明 {size} 不同")
            if transparent and image.mode != "RGBA":
                raise VFXError(f"{path}：必须为 RGBA，不能用 RGB/调色板冒充透明")
            if not transparent and image.mode not in ("RGB", "RGBA"):
                raise VFXError(f"{path}：白底源图必须为 8-bit RGB/RGBA")
            pixels = np.asarray(image.convert("RGBA")).copy()
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
        raise VFXError(f"{path}：PNG 无法读取：{exc}") from exc
    alpha = pixels[..., 3]
    if transparent and (not np.any(alpha == 0) or not np.any(alpha > 0)):
        raise VFXError(f"{path}：alpha 必须同时有透明和非透明像素，拒绝全空/假透明")
    if not transparent and np.any(alpha != 255):
        raise VFXError(f"{path}：白底源图不能含透明像素")
    if zero_rgb and np.any(pixels[..., :3][alpha == 0] != 0):
        raise VFXError(f"{path}：alpha=0 的 RGB 必须归零")
    return pixels


def _point(point: list, size: list, field: str) -> None:
    if not all(0 <= p < bound for p, bound in zip(point, size)):
        raise VFXError(f"{field}：锚点 {point} 必须落在画幅 {size} 内")


def _direction(vector: list) -> None:
    if abs(math.hypot(*vector) - 1) > 1e-6:
        raise VFXError(f"direction：要求单位向量，实际 {vector}")


def _effect(data: dict, path: Path, root: Path) -> None:
    _direction(data["direction"])
    if data["style"] == "qi_sword" and data["blend"] not in ("screen", "lighter"):
        raise VFXError("qi_sword.blend：必须为 screen 或 lighter")
    frames, source = data["frames"], data["source"]
    phases = [frame["phase"] for frame in frames]
    if phases[0] != 0 or phases[-1] != 1 or any(a >= b for a, b in zip(phases, phases[1:])):
        raise VFXError("frames.phase：必须严格递增且首 0 尾 1")
    files = [resolve_path(path, frame["file"], root) for frame in frames]
    if len(set(files)) != len(files):
        raise VFXError("frames.file：帧路径（含解析后的别名）必须唯一")
    for frame, file in zip(frames, files):
        _point(frame["anchor_px"], data["size_px"], f"{file}.anchor_px")
        _png(file, data["size_px"], transparent=True, zero_rgb=True)
    keys = source["keying"]
    if keys["opaque_luma"] >= keys["white_cutoff_8bit"] / 255:
        raise VFXError("source.keying.opaque_luma：必须小于 white_cutoff_8bit / 255")
    if keys["key_full_8bit"] <= 255 - keys["white_cutoff_8bit"]:
        raise VFXError("source.keying.key_full_8bit：必须大于 255 - white_cutoff_8bit")
    sources = [resolve_path(path, file, root) for file in source["files"]]
    if len(set(sources)) != len(sources) or set(sources) & set(files):
        raise VFXError("source.files：原件不得重复或与输出帧共用路径")
    sizes = [(arr.shape[1], arr.shape[0]) for arr in (_png(file) for file in sources)]
    rects = source["rects"]
    if len(rects) != len(frames):
        raise VFXError("source.rects：必须与 frames 等长")
    if source["mode"] == "grid" and len(sources) != 1:
        raise VFXError("source.mode=grid：要求一张原件多个矩形")
    used = []
    for index, entry in enumerate(rects):
        fi = entry["file_index"]
        if fi >= len(sources):
            raise VFXError(f"source.rects[{index}].file_index：越界")
        x, y, w, h = entry["rect_px"]
        width, height = sizes[fi]
        if x + w > width or y + h > height:
            raise VFXError(f"source.rects[{index}]：裁格超出原图 {sizes[fi]}")
        if [w, h] != data["size_px"]:
            raise VFXError(f"source.rects[{index}]：裁格尺寸必须等于 size_px，v1 不隐式缩放")
        if source["mode"] == "singles" and [x, y, w, h] != [0, 0, width, height]:
            raise VFXError(f"source.rects[{index}]：singles 必须使用完整原图")
        for prev in rects[:index]:
            px, py, pw, ph = prev["rect_px"]
            if fi == prev["file_index"] and x < px + pw and px < x + w and y < py + ph and py < y + h:
                raise VFXError(f"source.rects[{index}]：裁格重叠")
        used.append(fi)
    if source["mode"] == "singles" and sorted(used) != list(range(len(sources))):
        raise VFXError("source.mode=singles：每个原件必须且只能出现一次")


@lru_cache(maxsize=1)
def _known_gameplay_ids() -> frozenset:
    """复用仓库 ID 检查器的正式定义提取，避免把引用或示例当作注册。"""
    import sys

    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    from tools.lint import check_ids

    warnings = []
    prefixes, _ = check_ids.parse_prefixes(ROOT / check_ids.CANON_REL, warnings)
    paths = [ROOT / check_ids.CANON_REL, ROOT / "docs/design/05-martial-arts-system.md"]
    paths.extend(sorted((ROOT / "docs/design/catalog").glob("skills-*.md")))
    docs = [check_ids.load_document(path, ROOT, warnings) for path in paths]
    _, definitions = check_ids.extract_occurrences(
        [doc for doc in docs if doc is not None], prefixes, check_ids.compile_id_regex(prefixes))
    return frozenset(definition.id for definition in definitions)


def _composition(data: dict, path: Path, root: Path) -> None:
    _point(data["emit_at_px"], data["canvas_px"], "emit_at_px")
    if sum(data["rhythm"].values()) <= 0:
        raise VFXError("rhythm：总时长必须大于 0")
    w, h = data["canvas_px"]
    pw, ph = data["output"]["preview_size_px"]
    if w * ph != h * pw:
        raise VFXError("output.preview_size_px：必须与 canvas_px 同宽高比")
    if data["mode"] == "resolved_preview" and data["scale"][0] != 1:
        raise VFXError("resolved_preview.scale[0]：必须为 1，不能改变已解算射程")
    known = _known_gameplay_ids()
    for key in ("subject_ref", "move_ref"):
        if key in data and data[key] not in known:
            raise VFXError(f"{key}：未找到既有玩法正式定义 {data[key]}")
    effect_path = resolve_path(path, data["effect_set"], root)
    emitter_path = resolve_path(path, data["emitter_plate"], root)
    # 先确认 kind，阻断 Composition 自引用，避免递归跟随恶意套件。
    effect = load_yaml(effect_path)
    emitter = load_yaml(emitter_path)
    validate_schema(effect, "EffectSet")
    validate_schema(emitter, "EmitterPlate")
    validate_document(effect_path, root)
    validate_document(emitter_path, root)
    if effect["style"] == "qi_sword":
        transition = data["transition"]
        if transition["scale_from"] != 1 or transition["drift_fraction"] != 0:
            raise VFXError("qi_sword：scale_from 必须为 1，drift_fraction 必须为 0")
        if effect["blend"] not in ("screen", "lighter"):
            raise VFXError("qi_sword.blend：必须为 screen 或 lighter")


def validate_document(path: str | Path, suite_root: str | Path | None = None) -> dict:
    path = Path(path).resolve()
    root = Path(suite_root).resolve() if suite_root is not None else path.parent
    try:
        path.relative_to(root)
    except ValueError as exc:
        raise VFXError(f"{path}：YAML 位于素材套件目录以外 {root}") from exc
    data = load_yaml(path)
    try:
        validate_schema(data)
        if data["kind"] == "EffectSet":
            _effect(data, path, root)
        elif data["kind"] == "EmitterPlate":
            _direction(data["direction"])
            _point(data["emit_point_px"], data["size_px"], "emit_point_px")
            _png(resolve_path(path, data["file"], root), data["size_px"], transparent=True)
        else:
            _composition(data, path, root)
    except VFXError as exc:
        raise VFXError(f"{path}：{exc}") from exc
    return data


def _linear(rgb: np.ndarray) -> np.ndarray:
    return np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)


def _encoded(rgb: np.ndarray) -> np.ndarray:
    return np.where(rgb <= 0.0031308, rgb * 12.92, 1.055 * np.maximum(rgb, 0) ** (1 / 2.4) - 0.055)


def collect_quality(path: str | Path, suite_root: str | Path | None = None) -> dict:
    """建议指标只报告不作硬门；棋盘格、真实掌面宽度仍须人工检查。"""
    path = Path(path).resolve()
    root = Path(suite_root).resolve() if suite_root is not None else path.parent
    data = validate_document(path, root)
    if data["kind"] == "Composition":
        return collect_quality(resolve_path(path, data["effect_set"], root), root)
    if data["kind"] != "EffectSet":
        return {}
    result = []
    source = data["source"]
    originals = [_png(resolve_path(path, file, root)) for file in source["files"]]
    for frame, entry in zip(data["frames"], source["rects"]):
        rgba = _png(resolve_path(path, frame["file"], root), transparent=True, zero_rgb=True)
        alpha = rgba[..., 3]
        border = np.ones(alpha.shape, dtype=bool)
        border[8:-8, 8:-8] = False
        edge = (alpha > 0) & (alpha < 255)
        white = edge & np.all(rgba[..., :3] >= 250, axis=-1)
        x, y, w, h = entry["rect_px"]
        original = originals[entry["file_index"]][y:y + h, x:x + w, :3]
        original_border = np.ones((h, w), dtype=bool)
        original_border[32:-32, 32:-32] = False
        a = alpha[..., None] / 255
        rebuilt = _encoded(a * _linear(rgba[..., :3] / 255) + (1 - a)) * 255
        error = np.abs(rebuilt - original)
        retained = alpha > 0
        result.append({
            "file": frame["file"],
            "border_8px_alpha_ratio": float(np.mean(alpha[border] > 1)),
            "residual_white_edge_ratio": float(np.count_nonzero(white) / max(1, np.count_nonzero(edge))),
            "reconstruction_max_error_8bit": float(error[retained].max()) if retained.any() else 0.0,
            "reconstruction_mean_error_8bit": float(error[retained].mean()) if retained.any() else 0.0,
            "source_32px_nonwhite_ratio": float(np.mean(np.any(original[original_border] != 255, axis=-1))),
        })
    return {"frames": result, "advisory": True, "manual_review": "棋盘格、造型、真实掌面与根部宽度"}


THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js'


def _embedded_reference(value: str, field: str) -> None:
    value = value.strip()
    if value.startswith('#') or re.match(r'data:image/(?:png|webp);base64,', value):
        return
    raise VFXError(f'HTML {field}：要求内嵌 PNG/WebP 或本页锚点，拒绝 {value[:100]!r}')


class _HTMLCheck(HTMLParser):
    def handle_starttag(self, tag: str, attrs: list) -> None:
        attributes = dict(attrs)
        if tag in ('iframe', 'frame', 'object', 'embed', 'base'):
            raise VFXError(f'HTML：演示不允许 <{tag}> 外部文档容器')
        if tag == 'meta' and attributes.get('http-equiv', '').lower() == 'refresh':
            raise VFXError('HTML：禁止 meta refresh 导航')
        if tag == 'script' and 'src' in attributes:
            raise VFXError('HTML：脚本必须直接内嵌')
        for key, value in attrs:
            if key.startswith('on'):
                raise VFXError('HTML：事件逻辑必须放在可校验的内联脚本中')
            if key in ('srcset', 'action', 'formaction', 'ping', 'manifest', 'srcdoc'):
                raise VFXError(f'HTML：不允许资源/导航属性 {key}')
            if key in ('src', 'href', 'poster', 'background', 'xlink:href', 'data'):
                _embedded_reference(value or '', f'{tag}.{key}')

    handle_startendtag = handle_starttag


def check_html(path: str | Path, max_bytes: int = 3_000_000) -> dict:
    """验唯一 Three.js importmap、嵌入图像、预算及脚本语法；不代替浏览器验收。"""
    path = Path(path)
    if type(max_bytes) is not int or not 1 <= max_bytes <= 3_000_000:
        raise VFXError('HTML max_bytes 必须为 1–3000000；不能提高硬上限')
    try:
        raw = path.read_bytes()
        content = raw.decode('utf-8')
    except (OSError, UnicodeError) as exc:
        raise VFXError(f'{path}：HTML 无法读取：{exc}') from exc
    if len(raw) > max_bytes:
        raise VFXError(f'{path}：HTML {len(raw)} bytes 超过上限 {max_bytes}')
    parser = _HTMLCheck(convert_charrefs=True)
    parser.feed(content)
    parser.close()
    scripts = list(re.finditer(r'<script\b([^>]*)>(.*?)</script\s*>', content, re.I | re.S))
    maps, checked = 0, 0
    scanned = content
    for script in scripts:
        attrs, code = script.group(1), script.group(2)
        kind = re.search(r'\btype\s*=\s*([\'"])(.*?)\1', attrs, re.I)
        kind = kind.group(2).lower() if kind else 'text/javascript'
        if kind in ('importmap', 'application/json'):
            try:
                data = json.loads(code)
            except ValueError as exc:
                raise VFXError(f'{path}：内嵌 JSON 无效：{exc}') from exc
            if kind == 'importmap':
                if data != {'imports': {'three': THREE_URL}}:
                    raise VFXError('HTML：importmap 仅允许锁定 r186 的 three 地址')
                maps += 1
                scanned = scanned.replace(script.group(0), '', 1)
            continue
        if kind not in ('module', 'text/javascript', 'application/javascript'):
            raise VFXError(f'HTML：不支持的 script 类型 {kind}')
        try:
            checked_result = subprocess.run(
                ['node', '--check', '--input-type=' + ('module' if kind == 'module' else 'commonjs')],
                input=code, text=True, capture_output=True, check=False)
        except OSError as exc:
            raise VFXError(f'HTML：无法运行 node --check：{exc}') from exc
        if checked_result.returncode:
            raise VFXError(f'HTML：内联脚本语法错误：{checked_result.stderr.strip()}')
        # All runtime modules are concatenated. Only the pinned bare three import survives.
        imports = re.findall(r'\bimport\s+[^;\n]+', code)
        for declaration in imports:
            if not re.fullmatch(r'import\s+\*\s+as\s+THREE\s+from\s+[\'"]three[\'"]', declaration):
                raise VFXError(f'HTML：只允许 import * as THREE from three：{declaration}')
        checked += 1
    if maps != 1 or checked < 1:
        raise VFXError('HTML：必须有且仅有一个 three importmap，并含内联播放器脚本')
    if re.search(r'(?:https?|ftp|file|wss?):\s*(?:/|\\)', scanned, re.I):
        raise VFXError(f'{path}：HTML 含 importmap 之外的外部 URL')
    # The sole dynamic import resolves through the already validated importmap.
    scanned = re.sub(r"\bimport\(\s*(['\"])three\1\s*\)", '', scanned)
    forbidden = (
        r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|importScripts|sendBeacon|Worker|SharedWorker)\s*\(',
        r'\bserviceWorker\b', r'\bimport\s*\(', r'\bexport\b[^;\n]*\bfrom\b',
        r'\b(?:window\s*\.\s*open|location\s*\.\s*(?:assign|replace))\s*\(',
        r'\blocation(?:\s*\.\s*href)?\s*=', r'\b(?:eval|Function)\s*\(', r'@import\b',
    )
    for pattern in forbidden:
        if re.search(pattern, scanned, re.I):
            raise VFXError(f'{path}：HTML 含额外联网/动态代码入口 {pattern}')
    for match in re.finditer(r'\.(?:src|href|poster)\s*=\s*([\'"])(.*?)\1', scanned, re.S):
        _embedded_reference(match.group(2), 'JavaScript 资源赋值')
    for match in re.finditer(r'\burl\s*\(\s*([\'"]?)(.*?)\1\s*\)', scanned, re.I | re.S):
        _embedded_reference(match.group(2), 'CSS url')
    if re.search(r'\bdata:(?!image/(?:png|webp);base64,)(?=[a-z])', scanned, re.I):
        raise VFXError(f'{path}：仅支持 PNG/WebP data URI')
    embedded = re.findall(r'data:image/(png|webp);base64,([A-Za-z0-9+/=]+)', scanned)
    if not embedded:
        raise VFXError(f'{path}：未找到内嵌图像')
    for image_kind, encoded in set(embedded):
        try:
            binary = base64.b64decode(encoded, validate=True)
            with Image.open(io.BytesIO(binary)) as image:
                if image.format.lower() != image_kind:
                    raise VFXError(f'{path}：data URI 格式与实际图像不符')
                image.load()
        except (ValueError, OSError, UnidentifiedImageError) as exc:
            raise VFXError(f'{path}：内嵌图像无效：{exc}') from exc
    return {'bytes': len(raw), 'embedded_images': len(embedded),
            'unique_images': len(set(embedded)), 'inline_scripts_checked': checked,
            'only_external_dependency': THREE_URL, 'browser_verified': False}

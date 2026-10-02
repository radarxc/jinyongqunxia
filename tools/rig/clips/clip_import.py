#!/usr/bin/env python3
"""Import a glTF 2.0 humanoid animation as a deterministic rig clip.

The importer deliberately uses only the Python standard library.  It accepts
binary GLB and JSON glTF with embedded or sibling buffers; source meshes and
skins are ignored because the output is a joint/bone trajectory.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import struct
from pathlib import Path
from typing import Any, Iterable, Sequence

TOOL_VERSION = "1.0.0"
SCHEMA_ID = "tianshu-clip.v1"
LICENSE_ALLOWLIST = ("CC0-1.0", "CMU-commercial", "CC-BY-4.0")
COMPONENTS = {
    5120: ("b", 1, True), 5121: ("B", 1, False),
    5122: ("h", 2, True), 5123: ("H", 2, False),
    5125: ("I", 4, False), 5126: ("f", 4, True),
}
TYPE_SIZE = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4,
             "MAT2": 4, "MAT3": 9, "MAT4": 16}
JOINTS = (
    "pelvis", "chest", "neck", "head",
    "shoulder_L", "elbow_L", "wrist_L", "grip_L",
    "shoulder_R", "elbow_R", "wrist_R", "grip_R",
    "hip_L", "knee_L", "ankle_L", "toe_L",
    "hip_R", "knee_R", "ankle_R", "toe_R",
)
BONE_DEFS = (
    ("torso", "pelvis", "neck"), ("head", "neck", "head"),
    ("shoulder_span", "shoulder_L", "shoulder_R"),
    ("hip_span", "hip_L", "hip_R"),
    ("upper_arm_L", "shoulder_L", "elbow_L"),
    ("upper_arm_R", "shoulder_R", "elbow_R"),
    ("forearm_L", "elbow_L", "wrist_L"),
    ("forearm_R", "elbow_R", "wrist_R"),
    ("hand_L", "wrist_L", "grip_L"),
    ("hand_R", "wrist_R", "grip_R"),
    ("thigh_L", "hip_L", "knee_L"),
    ("thigh_R", "hip_R", "knee_R"),
    ("shin_L", "knee_L", "ankle_L"),
    ("shin_R", "knee_R", "ankle_R"),
    ("foot_L", "ankle_L", "toe_L"),
    ("foot_R", "ankle_R", "toe_R"),
)

# Values are aliases in preference order.  Both tables map into anatomical L/R.
UE66_MAPPING = {
    "root": ("root",), "pelvis": ("pelvis",),
    "chest": ("spine_03", "spine_02"), "neck": ("neck_01",),
    "head": ("head", "Head"),
    "shoulder_L": ("upperarm_l",), "elbow_L": ("lowerarm_l",),
    "wrist_L": ("hand_l",), "grip_L": ("middle_01_l",),
    "shoulder_R": ("upperarm_r",), "elbow_R": ("lowerarm_r",),
    "wrist_R": ("hand_r",), "grip_R": ("middle_01_r",),
    "hip_L": ("thigh_l",), "knee_L": ("calf_l",),
    "ankle_L": ("foot_l",), "toe_L": ("ball_l",),
    "hip_R": ("thigh_r",), "knee_R": ("calf_r",),
    "ankle_R": ("foot_r",), "toe_R": ("ball_r",),
}
RIGIFY53_MAPPING = {
    "root": ("root", "DEF-root", "DEF-hips"),
    "pelvis": ("DEF-hips", "DEF-spine"),
    "chest": ("DEF-chest", "DEF-spine.003", "DEF-spine.004"),
    "neck": ("DEF-neck",), "head": ("DEF-head",),
    "shoulder_L": ("DEF-upper_arm.L",), "elbow_L": ("DEF-forearm.L",),
    "wrist_L": ("DEF-hand.L",), "grip_L": ("DEF-f_middle.01.L",),
    "shoulder_R": ("DEF-upper_arm.R",), "elbow_R": ("DEF-forearm.R",),
    "wrist_R": ("DEF-hand.R",), "grip_R": ("DEF-f_middle.01.R",),
    "hip_L": ("DEF-thigh.L",), "knee_L": ("DEF-shin.L",),
    "ankle_L": ("DEF-foot.L",), "toe_L": ("DEF-toe.L",),
    "hip_R": ("DEF-thigh.R",), "knee_R": ("DEF-shin.R",),
    "ankle_R": ("DEF-foot.R",), "toe_R": ("DEF-toe.R",),
}


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


class GltfError(ValueError):
    """Raised for malformed or unsupported glTF input."""


class GltfDocument:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        raw = self.path.read_bytes()
        if raw[:4] == b"glTF":
            self.data, glb_bin = self._read_glb(raw)
        else:
            try:
                self.data, glb_bin = json.loads(raw), None
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise GltfError(f"not GLB or JSON glTF: {self.path}") from exc
        if self.data.get("asset", {}).get("version", "").split(".")[0] != "2":
            raise GltfError("only glTF 2.x is supported")
        self.buffers = self._read_buffers(glb_bin)
        self._accessor_cache: dict[int, list[tuple[float, ...]]] = {}

    @staticmethod
    def _read_glb(raw: bytes) -> tuple[dict[str, Any], bytes | None]:
        if len(raw) < 20:
            raise GltfError("truncated GLB header")
        magic, version, declared = struct.unpack_from("<4sII", raw)
        if magic != b"glTF" or version != 2 or declared != len(raw):
            raise GltfError("invalid GLB header, version, or length")
        chunks: dict[bytes, bytes] = {}
        offset = 12
        while offset < len(raw):
            if offset + 8 > len(raw):
                raise GltfError("truncated GLB chunk header")
            length, kind = struct.unpack_from("<I4s", raw, offset)
            offset += 8
            if offset + length > len(raw):
                raise GltfError("truncated GLB chunk")
            chunks.setdefault(kind, raw[offset:offset + length])
            offset += length
        if b"JSON" not in chunks:
            raise GltfError("GLB has no JSON chunk")
        try:
            doc = json.loads(chunks[b"JSON"].rstrip(b" \x00"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise GltfError("invalid GLB JSON chunk") from exc
        return doc, chunks.get(b"BIN\x00")

    def _read_buffers(self, glb_bin: bytes | None) -> list[bytes]:
        result = []
        root = self.path.resolve().parent
        for index, desc in enumerate(self.data.get("buffers", [])):
            uri = desc.get("uri")
            if uri is None:
                if index != 0 or glb_bin is None:
                    raise GltfError(f"buffer {index} has no data")
                payload = glb_bin
            elif uri.startswith("data:"):
                try:
                    payload = base64.b64decode(uri.split(",", 1)[1], validate=True)
                except (IndexError, ValueError) as exc:
                    raise GltfError(f"invalid data URI in buffer {index}") from exc
            else:
                target = (root / uri).resolve()
                if root not in target.parents:
                    raise GltfError(f"buffer path escapes source directory: {uri}")
                payload = target.read_bytes()
            if len(payload) < desc.get("byteLength", 0):
                raise GltfError(f"buffer {index} is shorter than declared")
            result.append(payload)
        return result

    def accessor(self, index: int) -> list[tuple[float, ...]]:
        if index in self._accessor_cache:
            return self._accessor_cache[index]
        item = self.data["accessors"][index]
        if "sparse" in item:
            raise GltfError("sparse accessors are not supported")
        if "bufferView" not in item:
            raise GltfError("accessor without bufferView is not supported")
        view = self.data["bufferViews"][item["bufferView"]]
        code, width, signed = COMPONENTS[item["componentType"]]
        components = TYPE_SIZE[item["type"]]
        packed = width * components
        stride = view.get("byteStride", packed)
        if stride < packed:
            raise GltfError(f"accessor {index} has invalid byteStride")
        start = view.get("byteOffset", 0) + item.get("byteOffset", 0)
        raw = self.buffers[view.get("buffer", 0)]
        rows = []
        for row in range(item["count"]):
            pos = start + row * stride
            if pos + packed > len(raw):
                raise GltfError(f"accessor {index} exceeds its buffer")
            values = struct.unpack_from("<" + code * components, raw, pos)
            rows.append(tuple(self._normal(v, item, width, signed) for v in values))
        self._accessor_cache[index] = rows
        return rows

    @staticmethod
    def _normal(value: int | float, item: dict[str, Any], width: int, signed: bool) -> float:
        if not item.get("normalized") or item["componentType"] == 5126:
            return float(value)
        bits = width * 8
        if signed:
            return max(float(value) / ((1 << (bits - 1)) - 1), -1.0)
        return float(value) / ((1 << bits) - 1)


def v_add(a: Sequence[float], b: Sequence[float]) -> tuple[float, float, float]:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def v_sub(a: Sequence[float], b: Sequence[float]) -> tuple[float, float, float]:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def v_scale(a: Sequence[float], scale: float) -> tuple[float, float, float]:
    return (a[0] * scale, a[1] * scale, a[2] * scale)


def v_dot(a: Sequence[float], b: Sequence[float]) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def v_cross(a: Sequence[float], b: Sequence[float]) -> tuple[float, float, float]:
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def v_length(a: Sequence[float]) -> float:
    return math.sqrt(v_dot(a, a))


def v_normalize(a: Sequence[float]) -> tuple[float, float, float]:
    length = v_length(a)
    return (0.0, 0.0, 0.0) if length <= 1e-12 else v_scale(a, 1.0 / length)


def q_normalize(q: Sequence[float]) -> tuple[float, float, float, float]:
    length = math.sqrt(sum(value * value for value in q))
    if length <= 1e-12:
        return (0.0, 0.0, 0.0, 1.0)
    return tuple(value / length for value in q)  # type: ignore[return-value]


def q_slerp(a: Sequence[float], b: Sequence[float], amount: float) -> tuple[float, ...]:
    dot = sum(x * y for x, y in zip(a, b))
    if dot < 0:
        b, dot = tuple(-x for x in b), -dot
    if dot > 0.9995:
        return q_normalize(tuple(x + amount * (y - x) for x, y in zip(a, b)))
    angle = math.acos(max(-1.0, min(1.0, dot)))
    sine = math.sin(angle)
    one = math.sin((1.0 - amount) * angle) / sine
    two = math.sin(amount * angle) / sine
    return tuple(one * x + two * y for x, y in zip(a, b))


def q_rotate(q: Sequence[float], v: Sequence[float]) -> tuple[float, float, float]:
    axis = q[:3]
    uv = v_cross(axis, v)
    uuv = v_cross(axis, uv)
    return v_add(v, v_add(v_scale(uv, 2.0 * q[3]), v_scale(uuv, 2.0)))


def q_mul(a: Sequence[float], b: Sequence[float]) -> tuple[float, float, float, float]:
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return q_normalize((aw * bx + ax * bw + ay * bz - az * by,
                        aw * by - ax * bz + ay * bw + az * bx,
                        aw * bz + ax * by - ay * bx + az * bw,
                        aw * bw - ax * bx - ay * by - az * bz))


def q_conjugate(q: Sequence[float]) -> tuple[float, float, float, float]:
    return (-q[0], -q[1], -q[2], q[3])


def interpolate(times: Sequence[float], values: Sequence[Sequence[float]], at: float,
                kind: str, path: str) -> tuple[float, ...]:
    if not times:
        raise GltfError("animation sampler has no keys")
    if at <= times[0]:
        return tuple(values[0])
    if at >= times[-1]:
        return tuple(values[-1])
    lo, hi = 0, len(times) - 1
    while lo + 1 < hi:
        mid = (lo + hi) // 2
        if times[mid] <= at:
            lo = mid
        else:
            hi = mid
    if kind == "STEP":
        return tuple(values[lo])
    amount = (at - times[lo]) / max(times[hi] - times[lo], 1e-12)
    if path == "rotation":
        return q_slerp(values[lo], values[hi], amount)
    return tuple(x + amount * (y - x) for x, y in zip(values[lo], values[hi]))


def round_half_away(value: float) -> int:
    """Round halves away from zero; unlike Python round this is not bankers' rounding."""
    return math.floor(value + 0.5) if value >= 0 else math.ceil(value - 0.5)


def quantize_unit(value: float) -> int:
    return max(-32767, min(32767, round_half_away(value * 32767.0)))


def quantize_ratio(value: float) -> int:
    return max(0, min(65535, round_half_away(value * 32767.0)))


class Skeleton:
    def __init__(self, document: GltfDocument):
        self.document = document
        self.nodes = document.data.get("nodes", [])
        self.names = [node.get("name", f"node_{i}") for i, node in enumerate(self.nodes)]
        if len(self.names) != len(set(self.names)):
            raise GltfError("node names must be unique for humanoid mapping")
        self.by_name = {name: index for index, name in enumerate(self.names)}
        self.parents = [-1] * len(self.nodes)
        for parent, node in enumerate(self.nodes):
            for child in node.get("children", []):
                if not isinstance(child, int) or child < 0 or child >= len(self.nodes):
                    raise GltfError(f"node {parent} has invalid child index: {child}")
                if self.parents[child] >= 0:
                    raise GltfError(f"node {child} has multiple parents")
                self.parents[child] = parent
        self.order = self._topological_order()
        self.rest_translation = [tuple(node.get("translation", (0, 0, 0))) for node in self.nodes]
        self.rest_rotation = [q_normalize(node.get("rotation", (0, 0, 0, 1))) for node in self.nodes]
        self.rest_scale = [tuple(node.get("scale", (1, 1, 1))) for node in self.nodes]
        if any("matrix" in node for node in self.nodes):
            raise GltfError("matrix nodes are not supported; export animation nodes as TRS")
        self.animations = {anim.get("name", f"animation_{i}"): anim
                           for i, anim in enumerate(document.data.get("animations", []))}

    def _topological_order(self) -> list[int]:
        order: list[int] = []
        states = [0] * len(self.nodes)
        def visit(index: int) -> None:
            if states[index] == 1:
                raise GltfError("node hierarchy contains a cycle")
            if states[index] == 2:
                return
            states[index] = 1
            if self.parents[index] >= 0:
                visit(self.parents[index])
            states[index] = 2
            order.append(index)
        for index in range(len(self.nodes)):
            visit(index)
        return order

    def animation_names(self) -> tuple[str, ...]:
        return tuple(self.animations)

    def duration(self, name: str) -> float:
        animation = self.animations[name]
        duration = 0.0
        for sampler in animation.get("samplers", []):
            times = self.document.accessor(sampler["input"])
            if times:
                duration = max(duration, times[-1][0])
        return duration

    def resolve_mapping(self, kind: str) -> tuple[dict[str, int], list[str]]:
        table = UE66_MAPPING if kind == "ue66" else RIGIFY53_MAPPING
        resolved: dict[str, int] = {}
        missing = []
        for joint, aliases in table.items():
            match = next((alias for alias in aliases if alias in self.by_name), None)
            if match is None:
                if joint == "root":
                    continue
                missing.append(joint)
            else:
                resolved[joint] = self.by_name[match]
        return resolved, missing

    def sample(self, name: str | None, at: float) -> tuple[list[tuple[float, float, float]],
                                                              list[tuple[float, float, float, float]],
                                                              list[tuple[float, float, float]]]:
        translation = list(self.rest_translation)
        rotation = list(self.rest_rotation)
        scale = list(self.rest_scale)
        if name is not None:
            animation = self.animations[name]
            written: set[tuple[int, str]] = set()
            for channel in animation.get("channels", []):
                target = channel.get("target", {})
                node = target.get("node")
                path = target.get("path")
                if node is None or path not in ("translation", "rotation", "scale"):
                    continue
                key = (node, path)
                if key in written:
                    raise GltfError(f"duplicate animation channel for node {node} {path}")
                written.add(key)
                sampler = animation["samplers"][channel["sampler"]]
                times = [row[0] for row in self.document.accessor(sampler["input"])]
                if any(not math.isfinite(value) for value in times):
                    raise GltfError("animation input contains non-finite time")
                if any(a >= b for a, b in zip(times, times[1:])):
                    raise GltfError("animation input times must be strictly increasing")
                raw_values = self.document.accessor(sampler["output"])
                mode = sampler.get("interpolation", "LINEAR")
                if mode == "CUBICSPLINE":
                    raise GltfError("CUBICSPLINE animation is not supported; resample source to LINEAR first")
                elif mode in ("LINEAR", "STEP"):
                    values = raw_values
                else:
                    raise GltfError(f"unsupported interpolation: {mode}")
                if len(values) != len(times):
                    raise GltfError("animation input/output key count mismatch")
                if any(not math.isfinite(value) for row in values for value in row):
                    raise GltfError("animation output contains non-finite value")
                value = interpolate(times, values, at, mode, path)
                if path == "translation": translation[node] = value[:3]
                elif path == "rotation": rotation[node] = q_normalize(value)
                else: scale[node] = value[:3]
        world_t = [(0.0, 0.0, 0.0)] * len(self.nodes)
        world_r = [(0.0, 0.0, 0.0, 1.0)] * len(self.nodes)
        world_s = [(1.0, 1.0, 1.0)] * len(self.nodes)
        for index in self.order:
            parent = self.parents[index]
            if parent < 0:
                world_t[index], world_r[index], world_s[index] = (translation[index], rotation[index], scale[index])
            else:
                scaled = tuple(translation[index][axis] * world_s[parent][axis] for axis in range(3))
                world_t[index] = v_add(world_t[parent], q_rotate(world_r[parent], scaled))
                world_r[index] = q_mul(world_r[parent], rotation[index])
                world_s[index] = tuple(world_s[parent][axis] * scale[index][axis] for axis in range(3))
        return world_t, world_r, world_s


def detect_mapping(skeleton: Skeleton, requested: str = "auto") -> str:
    if requested != "auto":
        return requested
    ue_score = sum(any(alias in skeleton.by_name for alias in aliases)
                   for aliases in UE66_MAPPING.values())
    rigify_score = sum(any(alias in skeleton.by_name for alias in aliases)
                        for aliases in RIGIFY53_MAPPING.values())
    return "ue66" if ue_score >= rigify_score else "rigify53"


def mapped_positions(skeleton: Skeleton, mapping: dict[str, int], at: float,
                     animation: str | None) -> tuple[dict[str, tuple[float, float, float]],
                                                    list[tuple[float, float, float, float]]]:
    positions, rotations, _ = skeleton.sample(animation, at)
    return {joint: positions[node] for joint, node in mapping.items()}, rotations


def forward_from(points: dict[str, Sequence[float]], prefix: str) -> tuple[float, float, float]:
    side = v_sub(points[f"{prefix}_R"], points[f"{prefix}_L"])
    side = v_normalize((side[0], 0.0, side[2]))
    return v_normalize(v_cross((0.0, 1.0, 0.0), side))


def yaw_cdeg(forward: Sequence[float]) -> int:
    return round_half_away(math.degrees(math.atan2(-forward[0], forward[2])) * 100.0)


def pack_i16(values: Iterable[int]) -> str:
    values = list(values)
    return base64.b64encode(struct.pack("<" + "h" * len(values), *values)).decode("ascii")


def pack_u16(values: Iterable[int]) -> str:
    values = list(values)
    return base64.b64encode(struct.pack("<" + "H" * len(values), *values)).decode("ascii")


def ensure_i16(values: Sequence[int], label: str) -> None:
    if any(value < -32768 or value > 32767 for value in values):
        raise ValueError(f"{label} exceeds int16 range")


def frame_times(duration: float, fps: int) -> list[float]:
    count = max(1, round_half_away(duration * fps) + 1)
    return [min(index / fps, duration) for index in range(count)]


def bake_clip(source: str | Path, animation: str, clip_id: str, *, fps: int = 30,
              mapping_kind: str = "auto", license_id: str = "CC0-1.0",
              source_url: str = "", loop: bool = False, native_speed_mps: float = 0.0,
              hit_time: float | None = None, main_hand: str = "R") -> dict[str, Any]:
    if fps not in (12, 30):
        raise ValueError("fps must be 30 or 12")
    if license_id not in LICENSE_ALLOWLIST:
        raise ValueError(f"license not allowlisted: {license_id}")
    if not source_url.startswith(("https://", "http://")):
        raise ValueError("source URL must use http or https")
    if native_speed_mps < 0:
        raise ValueError("native speed cannot be negative")
    document = GltfDocument(source)
    skeleton = Skeleton(document)
    if animation not in skeleton.animations:
        raise ValueError(f"animation not found: {animation}")
    mapping_kind = detect_mapping(skeleton, mapping_kind)
    mapping, missing = skeleton.resolve_mapping(mapping_kind)
    if missing:
        raise ValueError("unmapped required joints: " + ", ".join(missing))
    # Every mapped joint must descend from the same hierarchy root; otherwise
    # similarly named nodes from unrelated skeletons could be mixed silently.
    def hierarchy_root(index: int) -> int:
        while skeleton.parents[index] >= 0:
            index = skeleton.parents[index]
        return index
    mapped_roots = {hierarchy_root(index) for index in mapping.values()}
    if len(mapped_roots) != 1:
        raise ValueError("mapped joints do not share one skeleton hierarchy")
    duration = skeleton.duration(animation)
    times = frame_times(duration, fps)
    rest, rest_rotations = mapped_positions(skeleton, mapping, 0.0, None)
    rest_lengths = {name: v_length(v_sub(rest[end], rest[start]))
                    for name, start, end in BONE_DEFS}
    bone_values: list[int] = []
    ratio_values: list[int] = []
    root_values: list[int] = []
    pelvis_yaw: list[int] = []
    chest_yaw: list[int] = []
    head_yaw: list[int] = []
    weapon_axis: list[int] = []
    # The pose root is the pelvis, not the optional scene/root node.  Keeping
    # pelvis bob and lunge in the clip does not authorize gameplay root motion;
    # rootMotion=inPlace tells the player not to move the core/world position.
    root_name = "pelvis"
    rest_root = rest[root_name]
    rest_head_forward = forward_from(rest, "shoulder")
    head_index = mapping["head"]
    head_local_forward = q_rotate(q_conjugate(rest_rotations[head_index]), rest_head_forward)
    for at in times:
        points, rotations = mapped_positions(skeleton, mapping, at, animation)
        for name, start, end in BONE_DEFS:
            vector = v_sub(points[end], points[start])
            length = v_length(vector)
            bone_values.extend(quantize_unit(value) for value in v_normalize(vector))
            ratio_values.append(quantize_ratio(length / max(rest_lengths[name], 1e-12)))
        root = v_sub(points[root_name], rest_root)
        root_values.extend(round_half_away(value * 1000.0) for value in root)
        pelvis_yaw.append(yaw_cdeg(forward_from(points, "hip")))
        chest = forward_from(points, "shoulder")
        chest_yaw.append(yaw_cdeg(chest))
        head_forward = q_rotate(rotations[head_index], head_local_forward)
        head_yaw.append(yaw_cdeg((head_forward[0], 0.0, head_forward[2])))
        wrist, grip = points[f"wrist_{main_hand}"], points[f"grip_{main_hand}"]
        weapon_axis.extend(quantize_unit(value) for value in v_normalize(v_sub(grip, wrist)))
    events = []
    if hit_time is not None:
        if hit_time < 0 or hit_time > duration:
            raise ValueError("hit time must be within the clip")
        events.append({"frame": min(len(times) - 1, round_half_away(hit_time * fps)), "type": "hit"})
    events.append({"frame": len(times) - 1, "type": "end"})
    ensure_i16(root_values, "pelvis root track")
    ensure_i16(pelvis_yaw, "pelvis yaw track")
    ensure_i16(chest_yaw, "chest yaw track")
    ensure_i16(head_yaw, "head yaw track")
    return {
        "schema": SCHEMA_ID, "id": clip_id, "skeleton": "tianshu_humanoid.v1",
        "source": {"pack": Path(source).name, "animation": animation,
                   "license": license_id, "url": source_url, "sha256": sha256_file(source)},
        "importer": {"version": TOOL_VERSION, "mapping": mapping_kind},
        "fps": fps, "frameCount": len(times), "durationMs": round_half_away(duration * 1000),
        "loop": loop, "rootMotion": "inPlace",
        "nativeSpeedMmps": round_half_away(native_speed_mps * 1000), "mainHand": main_hand,
        "events": events,
        "viewHints": {"yawAssistMaxCdeg": 3000, "minForeshortenBp": 4500,
                      "nearSide": "L", "anatomicalSides": True},
        "restPose": {"jointOrder": list(JOINTS),
                     "jointMm": [[round_half_away(value * 1000.0) for value in rest[joint]]
                                 for joint in JOINTS]},
        "tracks": {"encoding": "base64-le",
                   "bones": [item[0] for item in BONE_DEFS],
                   "directionI16": pack_i16(bone_values),
                   "lengthRatioU16": pack_u16(ratio_values),
                   "rootMmI16": pack_i16(root_values),
                   "facingYawCdegI16": {"pelvis": pack_i16(pelvis_yaw),
                                           "chest": pack_i16(chest_yaw),
                                           "head": pack_i16(head_yaw)}},
        "weapon": {"hand": main_hand, "gripJoint": f"grip_{main_hand}",
                   "tipDirectionI16": pack_i16(weapon_axis)},
        "unmappedSourceJoints": sorted(name for name in skeleton.names
                                         if name not in {skeleton.names[i] for i in mapping.values()}),
    }


def canonical_json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True, separators=(",", ": ")) + "\n"


def parse_event(value: str) -> tuple[str, float]:
    try:
        kind, at = value.split("@", 1)
        seconds = float(at)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("event must be TYPE@SECONDS") from exc
    if kind not in ("hit", "end"):
        raise argparse.ArgumentTypeError("event type must be hit or end")
    return kind, seconds


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("source", type=Path, help="source .glb or .gltf")
    result.add_argument("--animation", help="source animation name")
    result.add_argument("--id", dest="clip_id", help="output clip ID")
    result.add_argument("--output", type=Path)
    result.add_argument("--fps", type=int, choices=(12, 30), default=30)
    result.add_argument("--mapping", choices=("auto", "ue66", "rigify53"), default="auto")
    result.add_argument("--license", choices=LICENSE_ALLOWLIST, default="CC0-1.0")
    result.add_argument("--source-url", default="")
    result.add_argument("--loop", action="store_true")
    result.add_argument("--native-speed-mps", type=float, default=0.0)
    result.add_argument("--main-hand", choices=("L", "R"), default="R")
    result.add_argument("--event", action="append", type=parse_event, default=[])
    result.add_argument("--list", action="store_true", help="list animation names and durations")
    return result


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    if args.list:
        skeleton = Skeleton(GltfDocument(args.source))
        for name in skeleton.animation_names():
            print(f"{name}\t{skeleton.duration(name):.6f}")
        return 0
    if not args.animation or not args.clip_id or not args.output:
        parser().error("--animation, --id and --output are required unless --list is used")
    hit_times = [at for kind, at in args.event if kind == "hit"]
    end_times = [at for kind, at in args.event if kind == "end"]
    if len(hit_times) > 1 or len(end_times) > 1:
        parser().error("at most one hit and one end event may be supplied")
    clip = bake_clip(args.source, args.animation, args.clip_id, fps=args.fps,
                     mapping_kind=args.mapping, license_id=args.license,
                     source_url=args.source_url, loop=args.loop,
                     native_speed_mps=args.native_speed_mps,
                     hit_time=hit_times[0] if hit_times else None, main_hand=args.main_hand)
    if end_times:
        duration = clip["durationMs"] / 1000.0
        if not 0 <= end_times[0] <= duration:
            parser().error("end event must be within the clip")
        clip["events"][-1]["frame"] = min(clip["frameCount"] - 1,
                                                round_half_away(end_times[0] * args.fps))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical_json(clip), encoding="utf-8")
    print(f"wrote {args.output}: {clip['frameCount']} frames, {len(clip['tracks']['bones'])} bones")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""切片贴合（ADR 0002）公共件：常量、错误、单位换算、焊接 / 邻接 / 平滑、JSON 读写。"""
from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path
import sys
from typing import Any

# 同目录 inspect.py 会遮蔽标准库 inspect；NumPy / SciPy 导入前先缓存标准库模块。
_SCRIPT_DIR = Path(__file__).resolve().parent
_removed = [(i, value) for i, value in enumerate(sys.path)
            if Path(value or os.getcwd()).resolve() == _SCRIPT_DIR]
sys.path[:] = [value for value in sys.path
               if Path(value or os.getcwd()).resolve() != _SCRIPT_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for _index, _value in _removed:
    sys.path.insert(min(_index, len(sys.path)), _value)

import numpy as np  # noqa: E402
from scipy.sparse import coo_matrix  # noqa: E402
from scipy.sparse.csgraph import connected_components  # noqa: E402


LANDMARK_SCHEMA = "tianshu-dressup-slice-landmarks.v1"


FIT_SCHEMA = "tianshu-dressup-slice-fit.v1"


LEVEL_ORDER = ("ankle", "aboveAnkle", "calf", "knee", "aboveKnee", "midThigh", "belowHip", "crotch",
               "hip", "pelvis", "navel", "waist", "underBust", "bust", "armpit", "shoulder", "neckBase")


LEVEL_LABELS = {"neckBase": "颈根", "shoulder": "肩", "armpit": "腋下", "bust": "胸", "underBust": "胸下",
                "waist": "腰", "navel": "肚脐", "pelvis": "胯", "hip": "臀围", "crotch": "裆",
                "belowHip": "臀下", "midThigh": "大腿中", "aboveKnee": "膝上", "knee": "膝",
                "calf": "小腿肚", "aboveAnkle": "踝上", "ankle": "踝"}


# 臂点：肩、肘、腕（袖轴弦 = 肩 → 腕）、hand = 中指指根（只作腕外侧的比例目标，不进弦）。
ARM_POINTS = ("shoulder", "elbow", "wrist", "hand")


ELASTICITY_TABLE = {"plate": 0.0, "mingguang": 0.2, "mail": 0.3, "cloth": 0.9, "jinzhuang": 1.0}


class SliceFitError(ValueError):
    """输入、标注或参数不满足契约。"""


def _unit(vectors: np.ndarray) -> np.ndarray:
    vectors = np.asarray(vectors, dtype=np.float64)
    length = np.linalg.norm(vectors, axis=-1, keepdims=True)
    return np.divide(vectors, length, out=np.zeros_like(vectors), where=length > 1e-15)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _portable(path: Path | str | None) -> str | None:
    if path is None:
        return None
    path = Path(path)
    if not path.is_absolute():
        return path.as_posix()
    for marker in ("assets", "tools", "apps", "packages", "docs"):
        found = [i for i, value in enumerate(path.parts) if value == marker]
        if found:
            return Path(*path.parts[found[-1]:]).as_posix()
    return path.name


def mm_to_mu(value_mm: float, m_per_mu: float) -> float:
    return float(value_mm) / 1000.0 / float(m_per_mu)


def mu_to_mm(value_mu: Any, m_per_mu: float) -> Any:
    return np.asarray(value_mu, dtype=np.float64) * float(m_per_mu) * 1000.0


def _round(value: Any, digits: int = 6) -> Any:
    if isinstance(value, (float, np.floating)):
        return None if not math.isfinite(float(value)) else round(float(value), digits)
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, np.ndarray):
        return _round(value.tolist(), digits)
    if isinstance(value, (list, tuple)):
        return [_round(item, digits) for item in value]
    if isinstance(value, dict):
        return {str(key): _round(item, digits) for key, item in value.items()}
    return value


def weld_ids(positions: np.ndarray, decimals: int = 6) -> np.ndarray:
    """按位置焊接（UV 缝两侧的重复点合一），返回每顶点的焊接号。"""
    _, inverse = np.unique(np.round(np.asarray(positions, dtype=np.float64), decimals), axis=0,
                           return_inverse=True)
    return inverse.reshape(-1).astype(np.int64)


def welded_normals(positions: np.ndarray, faces: np.ndarray, weld: np.ndarray) -> np.ndarray:
    """面积加权法线，按焊接组求和后回填（缝两侧法线一致）。"""
    tri = np.asarray(positions, dtype=np.float64)[faces]
    face_normals = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    count = int(weld.max(initial=-1)) + 1
    accum = np.zeros((count, 3))
    for column in range(3):
        np.add.at(accum, weld[faces[:, column]], face_normals)
    normals = _unit(accum)[weld]
    normals[np.linalg.norm(normals, axis=1) < 0.5] = (0.0, 0.0, 1.0)
    return normals


def welded_adjacency(faces: np.ndarray, weld: np.ndarray):
    """焊接空间的对称邻接矩阵（CSR）与度。"""
    welded = weld[faces]
    count = int(weld.max(initial=-1)) + 1
    rows = np.concatenate((welded[:, 0], welded[:, 1], welded[:, 2], welded[:, 1], welded[:, 2], welded[:, 0]))
    cols = np.concatenate((welded[:, 1], welded[:, 2], welded[:, 0], welded[:, 0], welded[:, 1], welded[:, 2]))
    keep = rows != cols
    matrix = coo_matrix((np.ones(int(keep.sum())), (rows[keep], cols[keep])), shape=(count, count)).tocsr()
    matrix.data[:] = 1.0
    degree = np.asarray(matrix.sum(axis=1)).reshape(-1)
    return matrix, degree


def component_labels(faces: np.ndarray, weld: np.ndarray) -> np.ndarray:
    """焊接网格的连通块号（逐顶点）。"""
    matrix, _ = welded_adjacency(faces, weld)
    _, labels = connected_components(matrix, directed=False)
    return labels[weld]


def smooth_on_mesh(values: np.ndarray, faces: np.ndarray, weld: np.ndarray, iterations: int) -> np.ndarray:
    """在焊接网格上做 Jacobi 平均（0.5 自身 + 0.5 邻域均值）。"""
    values = np.asarray(values, dtype=np.float64)
    if iterations <= 0:
        return values.copy()
    matrix, degree = welded_adjacency(faces, weld)
    count = len(degree)
    shape = values.shape[1:]
    flat = values.reshape(len(values), -1)
    welded = np.zeros((count, flat.shape[1])); hits = np.zeros(count)
    np.add.at(welded, weld, flat); np.add.at(hits, weld, 1.0)
    welded /= np.maximum(hits, 1.0)[:, None]
    for _ in range(iterations):
        neighbour = matrix @ welded
        average = np.divide(neighbour, degree[:, None], out=welded.copy(), where=degree[:, None] > 0)
        welded = 0.5 * welded + 0.5 * average
    return welded[weld].reshape((len(values),) + shape)


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SliceFitError(f"读不了 {path}: {error}") from error


def write_json(path: Path, data: dict[str, Any]) -> None:
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(json.dumps(_round(data), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)

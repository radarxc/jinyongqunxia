import argparse
from dataclasses import dataclass
import io
import sys
import math
import json
import time
from pathlib import Path
import numpy as np
from PIL import Image
try:
    from .glb_io import load_glb, Mesh
    from .bake_texture_layer import (
        rasterize_uv, Raster, ALLOWED_REGIONS, raycast_outermost, nearest_surface,
        smooth_vertex_scores, boundary_turn_metric, contour_alpha,
        sample_surface_pixels, pad_gutter, VertexBake,
        align_dressed, coverage_by_region, verify_templates, file_sha,
        _display_path, _asset_sha, save_previews, _base_texture, SCHEMA, _memory_mib
    )
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from glb_io import load_glb, GLB, Mesh
    from bake_texture_layer import (
        rasterize_uv, Raster, ALLOWED_REGIONS, raycast_outermost, nearest_surface,
        smooth_vertex_scores, boundary_turn_metric, contour_alpha,
        sample_surface_pixels, pad_gutter, VertexBake,
        align_dressed, coverage_by_region, verify_templates, file_sha,
        _display_path, _asset_sha, save_previews, _base_texture, SCHEMA, _memory_mib
    )
import scipy.ndimage

LAB_LOW = np.array([0.0, -128.0, -128.0])
LAB_HIGH = np.array([100.0, 127.0, 127.0])
MIN_CLOTHING_IOU = 0.95
MIN_VARIANT_FILL_RATIO = 0.995

class GateError(Exception):
    """A production gate failed; the CLI maps this to exit status 3."""

    def __init__(self, name: str, value: float, minimum: float):
        self.name = name
        self.value = float(value)
        self.minimum = float(minimum)
        super().__init__(f"{name}={value:.6f} 低于量产门禁 {minimum:.6f}")

class CLIArgumentParser(argparse.ArgumentParser):
    """Route argument errors through the structured input-error boundary."""

    def error(self, message: str) -> None:
        raise ValueError(f"参数错误: {message}")

@dataclass(frozen=True)
class LabLUT:
    """Regular CIE Lab delta LUT learned only from corresponding plate pixels."""
    table: np.ndarray

@dataclass(frozen=True)
class ProjectionFrame:
    center_x: float
    foot_y: float
    center_mu: float
    foot_mu: float
    pixels_per_mu: float

def clothing_region_mask(image: np.ndarray, body: np.ndarray, threshold: int = 25) -> np.ndarray:
    """Return the AR-108 clothing mask: max per-channel RGB delta is over threshold."""
    image = np.asarray(image)
    body = np.asarray(body)
    if image.shape != body.shape:
        raise ValueError(f"衣图与素体底图尺寸不符: {image.shape} != {body.shape}")
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("衣图与素体底图必须是 H×W×3 RGB 数组")
    if not 0 <= threshold <= 255:
        raise ValueError("衣服区阈值必须在 0..255")
    delta = np.abs(image.astype(np.int16) - body.astype(np.int16))
    return np.max(delta, axis=-1) > threshold

def clothing_region_iou(base: np.ndarray, variant: np.ndarray, body: np.ndarray,
                        threshold: int = 25) -> float:
    """Compute the exact clothing-region IoU used by the V3 gate."""
    base_mask = clothing_region_mask(base, body, threshold)
    variant_mask = clothing_region_mask(variant, body, threshold)
    union = int(np.logical_or(base_mask, variant_mask).sum())
    if union == 0:
        return 0.0
    return float(np.logical_and(base_mask, variant_mask).sum() / union)

def fail_gate(name: str, value: float, minimum: float) -> None:
    """Raise a typed production-gate failure for the CLI boundary."""
    raise GateError(name, value, minimum)

def train_color_mapper(base_arr, gen_arr, mask, bins: int = 9) -> LabLUT:
    """Learn a smoothed 3-D Lab delta LUT from same-position cloth pixels."""
    if bins < 2 or not np.any(mask):
        raise ValueError("Lab 3D LUT 需要至少一个样本且每轴至少两个格点")
    source = rgb_to_lab(np.asarray(base_arr, dtype=np.float64)[mask])
    delta = rgb_to_lab(np.asarray(gen_arr, dtype=np.float64)[mask]) - source
    scaled = (source - LAB_LOW) / (LAB_HIGH - LAB_LOW) * (bins - 1)
    cells = np.clip(np.rint(scaled).astype(np.int64), 0, bins - 1)
    sums = np.zeros((bins, bins, bins, 3)); counts = np.zeros((bins, bins, bins))
    np.add.at(sums, tuple(cells.T), delta); np.add.at(counts, tuple(cells.T), 1)
    occupied = counts > 0
    table = np.divide(sums, counts[..., None], out=np.zeros_like(sums),
                      where=occupied[..., None])
    _, nearest = scipy.ndimage.distance_transform_edt(~occupied, return_indices=True)
    table[~occupied] = table[tuple(axis[~occupied] for axis in nearest)]
    weighted = scipy.ndimage.gaussian_filter(table * counts[..., None], (0.65, 0.65, 0.65, 0))
    weights = scipy.ndimage.gaussian_filter(counts, 0.65)
    table = np.divide(weighted, weights[..., None], out=table, where=weights[..., None] > 1e-9)
    return LabLUT(table)

def apply_color_mapper(mapper: LabLUT, base_arr):
    lab = rgb_to_lab(np.asarray(base_arr, dtype=np.float64))
    bins = mapper.table.shape[0]
    coords = np.moveaxis(np.clip((lab - LAB_LOW) / (LAB_HIGH - LAB_LOW), 0, 1), -1, 0)
    delta = np.stack([scipy.ndimage.map_coordinates(mapper.table[..., channel],
                      coords * (bins - 1), order=1, mode="nearest") for channel in range(3)], -1)
    return lab_to_rgb(lab + delta)

def rgb_to_lab(rgb):
    mask = rgb > 0.04045
    lin = np.where(mask, ((rgb + 0.055) / 1.055) ** 2.4, rgb / 12.92)
    xyz = np.empty_like(lin)
    xyz[..., 0] = lin[..., 0] * 0.4124 + lin[..., 1] * 0.3576 + lin[..., 2] * 0.1805
    xyz[..., 1] = lin[..., 0] * 0.2126 + lin[..., 1] * 0.7152 + lin[..., 2] * 0.0722
    xyz[..., 2] = lin[..., 0] * 0.0193 + lin[..., 1] * 0.1192 + lin[..., 2] * 0.9505
    xyz /= np.array([0.95047, 1.0, 1.08883])
    mask2 = xyz > 0.008856
    f = np.where(mask2, xyz ** (1/3), 7.787 * xyz + 16 / 116)
    lab = np.empty_like(xyz)
    lab[..., 0] = (116 * f[..., 1]) - 16
    lab[..., 1] = 500 * (f[..., 0] - f[..., 1])
    lab[..., 2] = 200 * (f[..., 1] - f[..., 2])
    return lab

def lab_to_rgb(lab):
    lab = np.asarray(lab, dtype=np.float64)
    fy = (lab[..., 0] + 16) / 116
    fx = fy + lab[..., 1] / 500
    fz = fy - lab[..., 2] / 200
    delta = 6 / 29
    f = np.stack([fx, fy, fz], axis=-1)
    xyz = np.where(f > delta, f ** 3, 3 * delta ** 2 * (f - 4 / 29))
    xyz *= np.array([0.95047, 1.0, 1.08883])
    linear = xyz @ np.array([[3.2404542, -0.9692660, 0.0556434],
                             [-1.5371385, 1.8760108, -0.2040259],
                             [-0.4985314, 0.0415560, 1.0572252]])
    srgb = np.where(linear > 0.0031308,
                    1.055 * np.maximum(linear, 0) ** (1 / 2.4) - 0.055,
                    12.92 * linear)
    return np.clip(srgb, 0, 1)

def color_mapper_error(mapper: LabLUT, base_arr, gen_arr, mask) -> dict[str, float]:
    predicted = apply_color_mapper(mapper, base_arr)[mask]
    error = rgb_to_lab(predicted) - rgb_to_lab(gen_arr[mask])
    delta = np.linalg.norm(error, axis=1)
    return {"labDeltaEMae": float(delta.mean()),
            "labDeltaERmse": float(np.sqrt(np.mean(delta ** 2)))}

def projection_frame(body_plate: np.ndarray, template: Mesh) -> ProjectionFrame:
    """Infer plate person bounds and map them to the template bind body bounds."""
    border = np.concatenate([body_plate[0], body_plate[-1], body_plate[:, 0], body_plate[:, -1]])
    background = np.median(border.astype(np.float64), axis=0)
    person = np.max(np.abs(body_plate.astype(np.float64) - background), axis=2) > 15
    rows, cols = np.nonzero(person)
    if not len(rows):
        raise ValueError("素体底图没有可推导的人物边界")
    foot_y, top_y = float(rows.max()), float(rows.min())
    center_x = float((cols.min() + cols.max()) / 2)
    foot_mu, top_mu = float(template.positions[:, 1].min()), float(template.positions[:, 1].max())
    return ProjectionFrame(center_x, foot_y,
                           float((template.positions[:, 0].min() + template.positions[:, 0].max()) / 2),
                           foot_mu, (foot_y - top_y) / (top_mu - foot_mu))

def project_front_pixels(mesh, gen_img_path, base_tex_img, w_mapper, mask2d,
                         base_arr, gen_arr, body_arr, template_mesh=None):
    tex_width, tex_height = base_tex_img.size
    if tex_width != tex_height:
        raise ValueError(f"版型 baseColor 必须为方图: {base_tex_img.size}")
    tex_size = tex_width
    regions = np.zeros(len(mesh.positions), dtype=np.uint8)
    raster = rasterize_uv(mesh, regions, tex_size)
    gen_img = Image.open(gen_img_path).convert("RGB")
    gen_arr = np.array(gen_img).astype(float) / 255.0
    if mask2d.shape != gen_arr.shape[:2]:
        raise ValueError(f"衣服区遮罩与变体衣图尺寸不符: {mask2d.shape} != {gen_arr.shape[:2]}")

    base_tex_arr = np.array(base_tex_img.resize((tex_size, tex_size))).astype(float) / 255.0
    mapped_tex_arr = apply_color_mapper(w_mapper, base_tex_arr)

    out_tex = mapped_tex_arr.copy()

    pos = raster.positions
    normals = raster.normals
    covered = raster.covered
    frame = projection_frame((np.asarray(body_arr) * 255).astype(np.uint8), template_mesh or mesh)
    image_x = np.clip(np.rint(frame.center_x + (pos[..., 0] - frame.center_mu)
                      * frame.pixels_per_mu).astype(int), 0, gen_arr.shape[1] - 1)
    image_y = np.clip(np.rint(frame.foot_y - (pos[..., 1] - frame.foot_mu)
                      * frame.pixels_per_mu).astype(int), 0, gen_arr.shape[0] - 1)

    nz = normals[..., 2]
    iy, ix = image_y[covered], image_x[covered]
    mask_cov = mask2d[iy, ix]
    nz_cov = nz[covered]
    depth = np.full(gen_arr.shape[:2], -np.inf, dtype=np.float32)
    np.maximum.at(depth, (iy, ix), pos[..., 2][covered])
    z_visible = pos[..., 2][covered] >= depth[iy, ix] - 1e-5

    mapped_cov = mapped_tex_arr[covered]
    front_cov = gen_arr[iy, ix]

    valid_proj = mask_cov & z_visible & (np.abs(nz_cov) >= 0.35)

    # Optional blend
    blend = np.clip((np.abs(nz_cov) - 0.35) / 0.1, 0, 1)
    blend_cov = blend[:, np.newaxis]

    final_cov = np.zeros_like(mapped_cov)
    final_cov[valid_proj] = blend_cov[valid_proj] * front_cov[valid_proj] + (1 - blend_cov[valid_proj]) * mapped_cov[valid_proj]
    final_cov[~valid_proj] = mapped_cov[~valid_proj]

    out_tex[covered] = final_cov
    valid_base_mask = covered.copy()
    valid_base_count = np.count_nonzero(valid_base_mask)
    out_tex[~valid_base_mask] = 0.0

    # Fix white scratches: clip brightness to the 99th percentile of the variant clothing region
    gen_cloth_pixels = gen_arr[mask2d]
    gen_cloth_brightness = np.max(gen_cloth_pixels, axis=-1)
    p99_brightness = np.percentile(gen_cloth_brightness, 99) if len(gen_cloth_brightness) > 0 else 1.0

    out_brightness = np.max(out_tex, axis=-1)
    too_bright = out_brightness > p99_brightness + 1e-5
    too_bright_in_mesh = too_bright & valid_base_mask

    # Remove too bright pixels for inpainting
    valid_base_mask[too_bright_in_mesh] = False
    out_tex[too_bright_in_mesh] = 0.0

    # Inpaint missing pixels using nearest valid neighbor
    dist, indices = scipy.ndimage.distance_transform_edt(~valid_base_mask, return_indices=True)
    out_tex[~valid_base_mask] = out_tex[indices[0][~valid_base_mask], indices[1][~valid_base_mask]]

    if valid_base_count > 0:
        # Check against covered region
        filled_count = np.count_nonzero((out_tex > 0).any(axis=-1) & covered)
        fill_ratio = filled_count / valid_base_count
    else:
        fill_ratio = 1.0

    # Evaluate final bright ratio
    out_brightness_final = np.max(out_tex, axis=-1)
    too_bright_final = out_brightness_final > p99_brightness + 1e-5
    too_bright_in_mesh_final = too_bright_final & covered
    bright_ratio = np.count_nonzero(too_bright_in_mesh_final) / valid_base_count if valid_base_count > 0 else 0


    out_tex_u8 = (out_tex * 255).astype(np.uint8)
    lab_final = rgb_to_lab(out_tex_u8.astype(np.float64) / 255.0)
    skin_mask = (lab_final[..., 0] > 65) & (lab_final[..., 0] < 95) & \
                (lab_final[..., 1] > 2) & (lab_final[..., 1] < 45) & \
                (lab_final[..., 2] > 2) & (lab_final[..., 2] < 45)
    skin_ratio = (np.count_nonzero(skin_mask & covered) / valid_base_count
                  if valid_base_count else 0.0)
    projection_ratio = float(valid_proj.sum() / valid_base_count) if valid_base_count else 0.0
    return (out_tex_u8, fill_ratio, float(bright_ratio),
            float(skin_ratio), projection_ratio)

def replace_image_glb(in_path, img_path, out_path):
    import struct
    def pad4(n): return (n + 3) & ~3
    with open(in_path, "rb") as f: data = f.read()
    with Image.open(img_path) as image:
        stream = io.BytesIO()
        image.convert("RGB").save(stream, format="JPEG", quality=85, optimize=True)
        new_img = stream.getvalue()
    magic, version, length = struct.unpack("<III", data[:12])
    offset = 12
    document = None
    binary = b""
    while offset < len(data):
        chunk_len, chunk_type = struct.unpack("<II", data[offset:offset+8])
        chunk_data = data[offset+8:offset+8+chunk_len]
        offset += 8 + chunk_len
        if chunk_type == 0x4e4f534a:
            document = json.loads(chunk_data.decode('utf-8').rstrip(' \0'))
        elif chunk_type == 0x004e4942:
            binary = chunk_data
    primitive = document["meshes"][0]["primitives"][0]
    material = document["materials"][int(primitive.get("material", 0))]
    texture_id = int(material["pbrMetallicRoughness"]["baseColorTexture"]["index"])
    texture = document["textures"][texture_id]
    source_id = texture.get("source")
    if source_id is None:
        source_id = texture.get("extensions", {}).get("KHR_texture_basisu", {}).get("source")
    if source_id is None:
        raise ValueError("baseColorTexture 没有 image source")
    image_id = int(source_id)
    img_def = document['images'][image_id]
    img_def["mimeType"] = "image/jpeg"
    img_def.pop("uri", None)
    bv_idx = img_def['bufferView']
    new_bin_chunks = []
    current_offset = 0
    for i, bv in enumerate(document['bufferViews']):
        if i == bv_idx:
            chunk = new_img
            bv['byteLength'] = len(new_img)
        else:
            o = bv.get('byteOffset', 0)
            chunk = binary[o:o+bv['byteLength']]
        padded_chunk = chunk + b'\0' * (pad4(len(chunk)) - len(chunk))
        bv['byteOffset'] = current_offset
        new_bin_chunks.append(padded_chunk)
        current_offset += len(padded_chunk)
    new_binary = b"".join(new_bin_chunks)
    document['buffers'][0]['byteLength'] = len(new_binary)
    json_bytes = json.dumps(document, separators=(',', ':')).encode('utf-8')
    json_pad = b' ' * (pad4(len(json_bytes)) - len(json_bytes))
    json_bytes += json_pad
    total_length = 12 + 8 + len(json_bytes) + 8 + len(new_binary)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<III", magic, version, total_length))
        f.write(struct.pack("<II", len(json_bytes), 0x4e4f534a))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(new_binary), 0x004e4942))
        f.write(new_binary)

def bake_variant_vertices(body: Mesh, vertex_regions: np.ndarray, region_names: dict[int, str],
                          source: Mesh, max_distance_mu: float, m_per_mu: float) -> VertexBake:
    allowed_ids = {key for key, name in region_names.items() if name in ALLOWED_REGIONS}
    allowed = np.isin(vertex_regions, list(allowed_ids))
    faces = source.indices.reshape(-1, 3); points = body.positions; normals = body.normals
    cage_mu = 0.005 / m_per_mu
    ray = raycast_outermost(points - cage_mu * normals, normals, source.positions,
                            faces, max_distance_mu)
    face_id, bary = ray.faces.copy(), ray.bary.copy()
    distance = np.maximum(ray.distance - cage_mu, 0.0); misses = ~ray.hit
    if np.any(misses):
        fallback = nearest_surface(points[misses], source.positions, faces, k=16)
        face_id[misses], bary[misses], distance[misses] = fallback
    hit = ray.hit | (misses & (distance <= max_distance_mu)); face_id[~hit] = 0
    bary[~hit] = 0.0

    # The garment source has no body triangles: a distance-qualified nearest fallback is cloth too.
    scores = np.zeros(len(points), dtype=np.float32)
    scores[hit & allowed] = 1.0

    smooth, topology = smooth_vertex_scores(body, scores, allowed, iterations=2)
    hit_distance = distance[hit]
    stats = {"vertexCandidates": int(allowed.sum()), "vertexHits": int((hit & allowed).sum()),
             "rayVertexHits": int((ray.hit & allowed).sum()),
             "fallbackVertices": int((misses & allowed).sum()), **topology,
             "grazingVertexHits": int(ray.grazing[allowed].sum()),
             "grazingVertexRays": int(np.count_nonzero(ray.grazing[allowed])),
             "boundaryJaggedness": boundary_turn_metric(body, smooth),
             "vertexDistanceMm": {key: float(value * m_per_mu * 1000) for key, value in {
                 "p50": np.quantile(hit_distance, .5) if len(hit_distance) else 0,
                 "p90": np.quantile(hit_distance, .9) if len(hit_distance) else 0,
                 "p99": np.quantile(hit_distance, .99) if len(hit_distance) else 0,
                 "max": hit_distance.max() if len(hit_distance) else 0}.items()}}
    return VertexBake(scores, smooth, stats)

def bake_variant_pixels(body: Mesh, vertex_regions: np.ndarray, raster: Raster,
                        region_names: dict[int, str], source: Mesh, source_texture: Image.Image,
                        max_distance_mu: float, *, m_per_mu: float = 1.0) -> tuple[np.ndarray, dict]:
    allowed_ids = {region_id for region_id, name in region_names.items() if name in ALLOWED_REGIONS}
    candidate = raster.covered & np.isin(raster.regions, list(allowed_ids))
    vertices = bake_variant_vertices(body, vertex_regions, region_names, source, max_distance_mu, m_per_mu)
    rows, cols = np.nonzero(raster.covered); pixel_faces = raster.face_indices[rows, cols]
    faces = body.indices.reshape(-1, 3)[pixel_faces]; bary = raster.barycentric[rows, cols]
    alpha = contour_alpha(body, vertices.smooth_scores, raster, candidate, 1.5)
    rgb = np.zeros((*raster.covered.shape, 3), dtype=np.float32)
    sample_mask = candidate[rows, cols]
    sample_rows, sample_cols = rows[sample_mask], cols[sample_mask]
    cage_mu = 0.005 / m_per_mu

    colors, ray_hit, fallback_hit, distance, grazing = sample_surface_pixels(
        raster.positions[sample_rows, sample_cols], raster.normals[sample_rows, sample_cols],
        source, source_texture, max_distance_mu, cage_mu)

    hit = ray_hit | fallback_hit; rgb[sample_rows[hit], sample_cols[hit]] = colors[hit]
    alpha[sample_rows[~hit], sample_cols[~hit]] = 0.0
    expansion = pad_gutter(rgb, alpha, raster.covered, width=8)
    rgba = np.concatenate([np.clip(rgb, 0, 255), alpha[..., None] * 255], axis=2).astype(np.uint8)
    rgba[..., :3][rgba[..., 3] == 0] = 0
    raw_pixel_score = np.einsum("ni,ni->n", bary, vertices.raw_scores[faces])
    support_before = int(np.count_nonzero(raw_pixel_score >= 0.5))
    support_after = int(np.count_nonzero((alpha == 1.0) & candidate))
    boundary = candidate & (alpha > 0) & (alpha < 1)
    hit_distance = distance[hit]
    stats = {
        "rasterizedTexels": int(raster.covered.sum()),
        "candidateTexels": int(candidate.sum()),
        "hitTexels": int(hit.sum()), "hitRate": float(hit.mean()) if len(hit) else 0.0,
        "rayCandidateTexels": int(len(hit)), "rayHitTexels": int(ray_hit.sum()),
        "rayHitRate": float(ray_hit.mean()) if len(ray_hit) else 0.0,
        "fallbackTexels": int(fallback_hit.sum()),
        "grazingHits": int(grazing.sum()), "grazingRays": int(np.count_nonzero(grazing)),
        "distanceMm": {name: float(value * m_per_mu * 1000) for name, value in {
            "p50": np.quantile(hit_distance, .5) if len(hit_distance) else 0,
            "p90": np.quantile(hit_distance, .9) if len(hit_distance) else 0,
            "p99": np.quantile(hit_distance, .99) if len(hit_distance) else 0,
            "max": hit_distance.max() if len(hit_distance) else 0}.items()},
        "clothTexelsBeforeClean": support_before, "clothTexelsAfterClean": support_after,
        "boundaryPartialTexels": int(boundary.sum()), "gutterPx": 8,
        "gutterTexels": int(expansion.sum()), **vertices.stats,
    }
    return rgba, stats

def _main():
    parser = CLIArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--base-plate", type=Path, required=True)
    parser.add_argument("--plate", type=Path, required=True)
    parser.add_argument("--id", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--iou-only", action="store_true")
    parser.add_argument("--body-plate", type=Path, default=Path("assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png"))
    args = parser.parse_args()

    started = time.perf_counter()

    body_arr_for_mask = np.array(Image.open(args.body_plate).convert("RGB")).astype(int)
    base_arr_for_mask = np.array(Image.open(args.base_plate).convert("RGB")).astype(int)
    gen_arr_for_mask = np.array(Image.open(args.plate).convert("RGB")).astype(int)

    base_mask = clothing_region_mask(base_arr_for_mask, body_arr_for_mask, 25)
    gen_mask = clothing_region_mask(gen_arr_for_mask, body_arr_for_mask, 25)

    iou = clothing_region_iou(base_arr_for_mask, gen_arr_for_mask, body_arr_for_mask, 25)
    iou_40 = clothing_region_iou(base_arr_for_mask, gen_arr_for_mask, body_arr_for_mask, 40)
    iou_60 = clothing_region_iou(base_arr_for_mask, gen_arr_for_mask, body_arr_for_mask, 60)
    if args.iou_only:
        if iou < MIN_CLOTHING_IOU:
            fail_gate("衣服区 IoU(阈值25)", iou, MIN_CLOTHING_IOU)
        print(json.dumps({"iou_25": float(iou), "iou_40": float(iou_40), "iou_60": float(iou_60)}))
        return
    if iou < MIN_CLOTHING_IOU:
        fail_gate("衣服区 IoU(阈值25)", iou, MIN_CLOTHING_IOU)

    base_arr = np.array(Image.open(args.base_plate).convert("RGB")).astype(float) / 255.0
    gen_arr = np.array(Image.open(args.plate).convert("RGB")).astype(float) / 255.0

    # Train color mapper based on GEN mask or BASE mask?
    # Use base mask for training since we map base -> gen.
    training_mask = base_mask & gen_mask
    w_mapper = train_color_mapper(base_arr, gen_arr, training_mask)
    mapper_error = color_mapper_error(w_mapper, base_arr, gen_arr, training_mask)

    base_id = args.base.name
    glb_path = args.base / f"{base_id}.glb"

    glb = load_glb(glb_path)
    import io
    base_tex_img = _base_texture(glb)

    body_arr_for_proj = np.array(Image.open(args.body_plate).convert("RGB")).astype(float) / 255.0

    # We pass gen_mask as mask2d since we want to evaluate 99th percentile brightness on gen_mask.
    body_path = Path("assets/default/model3d/dressup/templates/tpl_f_medium/body.glb")
    template_mesh = load_glb(body_path).mesh()
    (out_tex_arr, fill_ratio, bright_ratio, skin_ratio, projection_ratio) = project_front_pixels(
        glb.mesh(), args.plate, base_tex_img, w_mapper, gen_mask, base_arr, gen_arr,
        body_arr_for_proj, template_mesh)
    if fill_ratio < MIN_VARIANT_FILL_RATIO:
        fail_gate("variantFillRatio", fill_ratio, MIN_VARIANT_FILL_RATIO)

    args.out.mkdir(parents=True, exist_ok=True)
    tex_dir = args.out.parent / f"{args.id}_tex"
    tex_dir.mkdir(parents=True, exist_ok=True)
    tex_out_path = tex_dir / "baseColor.png"
    out_img = Image.fromarray(out_tex_arr)
    out_img.save(tex_out_path)

    # Generate GLBs
    templates = ["", ".tpl_f_small", ".tpl_f_tall"]
    for tpl in templates:
        src = args.base / f"{base_id}{tpl}.glb"
        dst = args.out / f"{args.id}{tpl}.glb"
        if src.exists():
            replace_image_glb(str(src), str(tex_out_path), str(dst))

            # also copy fit and report json, but inject fillRatio
            fit_src = args.base / f"fit{tpl}.json"
            fit_dst = args.out / f"fit{tpl}.json"
            if fit_src.exists():
                with open(fit_src, "r") as f:
                    fit_data = json.load(f)
                fit_data["id"] = args.id
                fit_data["variantFillRatio"] = float(fill_ratio)
                fit_data["variantBrightRatio"] = float(bright_ratio)
                fit_data["variantSkinRatio"] = float(skin_ratio)
                fit_data["variantProjectionRatio"] = float(projection_ratio)
                fit_data["variantColorMap"] = {"method": "CIE-Lab-3d-lut", **mapper_error}
                with open(fit_dst, "w") as f:
                    json.dump(fit_data, f, indent=2)

            report_src = args.base / f"report{tpl}.json"
            if report_src.exists():
                if not fit_dst.exists():
                    raise FileNotFoundError(f"报告存在但变体 fit 缺失: {fit_dst}")
                with open(report_src, "r") as f:
                    report_data = json.load(f)
                report_data.setdefault("subject", {})["id"] = args.id
                report_data["inputs"] = {
                    "asset": {"sha256": file_sha(dst), "sizeBytes": dst.stat().st_size},
                    "fit": {"sha256": file_sha(fit_dst), "sizeBytes": fit_dst.stat().st_size},
                }
                report_dst = args.out / f"report{tpl}.json"
                with open(report_dst, "w") as f:
                    json.dump(report_data, f, indent=2)

    # Bake Layer
    # Layer is baked against medium template bind pose (eq_buyi.glb)
    dressed_path = args.out / f"{args.id}.glb"
    skeleton_path = Path("assets/default/model3d/dressup/templates/tpl_f_medium/skeleton.json")

    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    body_glb = load_glb(body_path)
    dressed_glb = load_glb(dressed_path)
    body = body_glb.mesh()
    source, align = align_dressed(dressed_glb, skeleton)

    regions = np.load(skeleton_path.with_name(skeleton["regions"]["file"]), allow_pickle=False)
    region_names = {int(value): str(name) for name, value in skeleton["regions"]["ids"].items()}
    raster = rasterize_uv(body, regions, 2048)

    m_per_mu = float(skeleton["mPerMu"])
    source_texture = _base_texture(dressed_glb)
    rgba, bake_stats = bake_variant_pixels(body, regions, raster, region_names, source,
                                           source_texture, 60.0 / (1000.0 * m_per_mu), m_per_mu=m_per_mu)

    layer_path = tex_dir / f"{args.id}.layer.png"
    Image.fromarray(rgba, "RGBA").save(layer_path, format="PNG", optimize=True)

    # Generate layered previews
    save_previews(tex_dir, body_glb, body, raster, rgba, Image.open(args.plate))

    coverage = coverage_by_region(raster, rgba, region_names)
    templates_list = verify_templates(body_path, body)
    opaque = int(np.count_nonzero(rgba[..., 3] == 255))
    partial = int(np.count_nonzero((rgba[..., 3] > 0) & (rgba[..., 3] < 255)))

    result = {
        "schema": SCHEMA, "kind": "layer", "slot": "body", "id": args.id,
        "item": args.id,
        "uv": {"template": "tpl_f_medium", "bodySha256": file_sha(body_path), "size": 2048,
                 "origin": "top-left", "flipY": False},
        "templates": templates_list, "align": align, "coverageByRegion": coverage,
        "alpha": {"opaque": opaque, "partial": partial,
                  "transparent": int(rgba.shape[0] * rgba.shape[1] - opaque - partial),
                  "premultiplied": False},
        "source": {"file": _display_path(dressed_path), "sha256": file_sha(dressed_path),
                   "plate": _display_path(args.plate), "plateSha256": _asset_sha(args.plate),
                   "basePlate": _display_path(args.base_plate), "basePlateSha256": _asset_sha(args.base_plate)},
        "bake": bake_stats, "stats": {"elapsedSec": time.perf_counter() - started, "peakMemoryMiB": _memory_mib()},
    }
    (tex_dir / "layer.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Also generate mesh previews
    body_tex = _base_texture(body_glb)
    layered_meshes = [(body, body_tex), (source, source_texture)]
    front = render_orthographic_layered(layered_meshes, back=False, width=1280, height=1920)
    back = render_orthographic_layered(layered_meshes, back=True, width=1280, height=1920)
    preview_size = (640, 960)
    front = front.resize(preview_size, Image.Resampling.LANCZOS)
    back = back.resize(preview_size, Image.Resampling.LANCZOS)
    front.save(args.out / "preview_mesh_front.png", optimize=True)
    back.save(args.out / "preview_mesh_back.png", optimize=True)

    summary = {"ok": True, "fill_ratio": fill_ratio, "bright_ratio": bright_ratio,
               "skin_ratio": skin_ratio, "projection_ratio": projection_ratio,
               "color_map_error": mapper_error, "layer_out": str(tex_dir)}
    if args.json:
        print(json.dumps(summary, ensure_ascii=False))
    else:
        print(f"Variant mesh and layer generated. Fill ratio: {fill_ratio*100:.2f}%. Bright: {bright_ratio*100:.2f}%. Skin: {skin_ratio*100:.2f}%")

def render_orthographic_layered(layered_meshes, back: bool, width: int = 640, height: int = 960) -> Image.Image:
    """Render multiple meshes with their respective textures using exact z-buffer."""
    all_faces = []
    all_depths = []
    all_screens = []
    all_uvs = []
    all_textures = []

    try:
        from .bake_texture_layer import bilinear_sample
    except ImportError:
        from bake_texture_layer import bilinear_sample

    # Calculate scale and center based on first mesh (body)
    base_mesh = layered_meshes[0][0]
    positions = np.asarray(base_mesh.positions, dtype=np.float64)
    low, high = positions[:, :2].min(0), positions[:, :2].max(0)
    scale = min((width - 32) / max(high[0] - low[0], 1e-9),
                (height - 32) / max(high[1] - low[1], 1e-9))
    center = (low + high) / 2

    for idx, (mesh, tex_img) in enumerate(layered_meshes):
        pos = np.asarray(mesh.positions, dtype=np.float64)
        faces = mesh.indices.reshape(-1, 3)
        uvs = np.asarray(mesh.uvs, dtype=np.float64)

        screen = np.empty((len(pos), 2), dtype=np.float64)
        screen[:, 0] = (pos[:, 0] - center[0]) * scale + width / 2
        if back: screen[:, 0] = width - screen[:, 0]
        screen[:, 1] = height / 2 - (pos[:, 1] - center[1]) * scale
        depth = pos[:, 2] * (-1 if back else 1)
        # Push clothes towards camera to avoid z-fighting
        if idx > 0: depth += 0.005

        tex = np.asarray(tex_img.convert("RGB"))

        for face in faces:
            all_faces.append(face)
            all_depths.append(depth[face])
            all_screens.append(screen[face])
            all_uvs.append(uvs[face])
            all_textures.append(tex)

    # sort by mean depth for better painter's ordering on equal depth
    mean_depths = np.array([d.mean() for d in all_depths])
    order = np.argsort(mean_depths)

    zbuffer = np.full((height, width), -np.inf, dtype=np.float32)
    output = np.full((height, width, 3), [219, 212, 195], dtype=np.uint8)

    for i in order:
        tri = all_screens[i]
        uv_tri = all_uvs[i]
        tex = all_textures[i]
        d_tri = all_depths[i]

        x0 = max(0, int(math.ceil(tri[:, 0].min()))); x1 = min(width - 1, int(math.floor(tri[:, 0].max())))
        y0 = max(0, int(math.ceil(tri[:, 1].min()))); y1 = min(height - 1, int(math.floor(tri[:, 1].max())))
        if x1 < x0 or y1 < y0: continue
        denom = ((tri[1, 1] - tri[2, 1]) * (tri[0, 0] - tri[2, 0])
                 + (tri[2, 0] - tri[1, 0]) * (tri[0, 1] - tri[2, 1]))
        if abs(denom) < 1e-10: continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        w0 = ((tri[1, 1] - tri[2, 1]) * (xx - tri[2, 0])
              + (tri[2, 0] - tri[1, 0]) * (yy - tri[2, 1])) / denom
        w1 = ((tri[2, 1] - tri[0, 1]) * (xx - tri[2, 0])
              + (tri[0, 0] - tri[2, 0]) * (yy - tri[2, 1])) / denom
        bary = np.stack([w0, w1, 1 - w0 - w1], axis=-1)
        inside = np.all(bary >= -1e-7, axis=2)
        if not np.any(inside): continue
        rows, cols, weights = yy[inside], xx[inside], bary[inside]

        values = weights @ d_tri
        visible = values > zbuffer[rows, cols]
        if not np.any(visible): continue
        rows, cols, weights, values = rows[visible], cols[visible], weights[visible], values[visible]

        output[rows, cols] = np.clip(bilinear_sample(tex, weights @ uv_tri), 0, 255).astype(np.uint8)
        zbuffer[rows, cols] = values

    return Image.fromarray(output, "RGB")


def main() -> int:
    """Run the CLI with stable input-error (2) and gate-error (3) statuses."""
    json_mode = "--json" in sys.argv[1:]
    try:
        _main()
        return 0
    except GateError as error:
        message = str(error)
        if json_mode:
            print(json.dumps({"ok": False, "error": {
                "kind": "gate", "message": message,
                "name": error.name, "value": error.value,
                "minimum": error.minimum}}))
        print(f"ERROR: {message}", file=sys.stderr)
        return 3
    except (OSError, ValueError) as error:
        message = str(error)
        if json_mode:
            print(json.dumps({"ok": False, "error": {
                "kind": "input", "message": message}}))
        print(f"ERROR: {message}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

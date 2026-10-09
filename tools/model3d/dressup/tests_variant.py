"""Executable regression tests for the AR-108 V3 texture-variant tool."""

from __future__ import annotations

import copy
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

try:
    from tools.model3d.dressup.retexture_variant import (
        clothing_region_iou, project_front_pixels, replace_image_glb,
        train_color_mapper,
    )
    from tools.model3d.dressup.bake_texture_layer import rasterize_uv
    from tools.model3d.dressup.glb_io import (
        GLBBuilder, Mesh, PrimitiveRange, load_glb,
    )
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from retexture_variant import (
        clothing_region_iou, project_front_pixels, replace_image_glb,
        train_color_mapper,
    )
    from bake_texture_layer import rasterize_uv
    from glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb


BASE = np.array([50, 60, 70], dtype=np.uint8)
SKIN = np.array([220, 170, 140], dtype=np.uint8)
FRONT = np.array([180, 90, 60], dtype=np.uint8)
BACK = np.array([40, 160, 80], dtype=np.uint8)
ROOT = Path(__file__).resolve().parents[3]
CLI = Path(__file__).with_name("retexture_variant.py")


def cylinder_mesh(*, skinned: bool = False, segments: int = 24) -> Mesh:
    theta = np.linspace(0, 2 * np.pi, segments + 1)
    positions = np.array([[.2 * np.cos(t), y, .2 * np.sin(t)]
                          for y in (0.0, 1.0) for t in theta], dtype=np.float32)
    normals = np.array([[np.cos(t), 0, np.sin(t)] for _ in (0, 1) for t in theta],
                       dtype=np.float32)
    uvs = np.array([[i / segments, y] for y in (0.0, 1.0)
                    for i in range(segments + 1)], dtype=np.float32)
    indices = []
    for i in range(segments):
        a, b = i, i + 1; c, d = segments + 1 + i, segments + 2 + i
        indices.extend((a, b, d, a, d, c))
    indices = np.asarray(indices, dtype=np.uint32)
    joints = np.zeros((len(positions), 4), dtype=np.uint16) if skinned else None
    weights = np.zeros((len(positions), 4), dtype=np.float32) if skinned else None
    if weights is not None:
        weights[:, 0] = 1.0
    section = PrimitiveRange(0, len(positions), 0, len(indices), 0)
    return Mesh(positions, indices, normals, uvs, joints, weights,
                primitives=[section])


def png_bytes(color: tuple[int, int, int], size: tuple[int, int] = (3, 2)) -> bytes:
    stream = io.BytesIO()
    Image.new("RGB", size, color).save(stream, format="PNG")
    return stream.getvalue()


def cli_command(directory: Path, *, iou_only: bool = False) -> list[str]:
    command = [
        sys.executable, str(CLI),
        "--base", str(directory / "base"),
        "--base-plate", str(directory / "base-plate.png"),
        "--plate", str(directory / "variant-plate.png"),
        "--body-plate", str(directory / "body-plate.png"),
        "--id", "synthetic_variant",
        "--out", str(directory / "out"),
        "--json",
    ]
    if iou_only:
        command.append("--iou-only")
    return command


def view_bytes(glb, index: int) -> bytes:
    view = glb.json["bufferViews"][index]
    start = int(view.get("byteOffset", 0))
    return bytes(glb.bin[start:start + int(view["byteLength"])])


def normalized_document(glb) -> dict:
    document = copy.deepcopy(glb.json)
    image_views = {int(image["bufferView"]) for image in document.get("images", [])}
    for buffer in document.get("buffers", []):
        buffer["byteLength"] = "<changed-with-image>"
    for index, view in enumerate(document.get("bufferViews", [])):
        view["byteOffset"] = "<shifted-with-image>"
        if index in image_views:
            view["byteLength"] = "<image-length>"
    for image in document.get("images", []):
        image["mimeType"] = "<image-mime>"
    return document


class VariantTextureTests(unittest.TestCase):
    def test_front_projection_and_occluded_back_lut_are_distinct(self) -> None:
        mesh = cylinder_mesh()
        base_texture = Image.new("RGB", (32, 32), tuple(SKIN))
        training_base = np.broadcast_to(SKIN / 255.0, (2, 2, 3)).copy()
        training_variant = np.broadcast_to(BACK / 255.0, (2, 2, 3)).copy()
        mapper = train_color_mapper(training_base, training_variant,
                                    np.ones((2, 2), dtype=bool))
        with tempfile.TemporaryDirectory() as temporary:
            plate_path = Path(temporary) / "front.png"
            Image.new("RGB", (64, 96), tuple(FRONT)).save(plate_path)
            plate = np.broadcast_to(FRONT / 255.0, (96, 64, 3)).copy()
            body = np.full((96, 64, 3), 220 / 255.0)
            body[8:88, 18:46] = 40 / 255.0
            clothing_mask = np.ones((96, 64), dtype=bool)
            texture, fill, _, skin, projection = project_front_pixels(
                mesh, plate_path, base_texture, mapper,
                clothing_mask, training_base, plate, body, mesh,
            )
        raster = rasterize_uv(mesh, np.zeros(len(mesh.positions), dtype=np.uint8), 32)
        front_texels = texture[raster.covered & (raster.normals[..., 2] > .7)]
        back_texels = texture[raster.covered & (raster.normals[..., 2] < -.7)]
        self.assertTrue(np.allclose(np.median(front_texels, axis=0), FRONT, atol=2))
        self.assertTrue(np.allclose(np.median(back_texels, axis=0), BACK, atol=2))
        self.assertFalse(np.allclose(np.median(front_texels, axis=0),
                                     np.median(back_texels, axis=0), atol=2))
        self.assertEqual(fill, 1.0)
        # The entire input texture is skin-like, but the known final front/back
        # colors are not: this locks the metric to the variant output.
        self.assertEqual(skin, 0.0)
        self.assertGreater(projection, 0.05)
        self.assertLess(projection, 0.5)

    def test_replace_changes_only_image_and_layout_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            builder = GLBBuilder()
            unused_image = builder.add_image(png_bytes((1, 2, 3)), mime_type="image/png")
            image_index = builder.add_image(png_bytes((10, 20, 30)), mime_type="image/png")
            builder.add_texture(unused_image)
            texture_index = builder.add_texture(image_index)
            material_index = builder.add_material(base_color_texture=texture_index)
            mesh = cylinder_mesh(skinned=True)
            mesh.primitives[0] = PrimitiveRange(0, len(mesh.positions), 0, len(mesh.indices), material_index)
            mesh_index = builder.add_mesh(mesh)
            # A raw MAT4 accessor exercises skin bytes without needing a full joint rig.
            ibm = builder.add_accessor(np.eye(4, dtype=np.float32)[None],
                                       component_type=5126, type_name="MAT4")
            joint = builder.add_node(name="joint")
            skin = builder.add_skin([joint], ibm, skeleton=joint)
            node = builder.add_node(mesh=mesh_index, skin=skin)
            builder.add_scene([joint, node])
            source_path = directory / "source.glb"
            output_path = directory / "output.glb"
            image_path = directory / "replacement.png"
            builder.write(source_path)
            image_path.write_bytes(png_bytes((200, 120, 50)))
            replace_image_glb(source_path, image_path, output_path)

            source = load_glb(source_path)
            output = load_glb(output_path)
            self.assertEqual(len(source.json["accessors"]), len(output.json["accessors"]))
            for index in range(len(source.json["accessors"])):
                self.assertEqual(source.json["accessors"][index],
                                 output.json["accessors"][index])
                self.assertEqual(source.accessor_bytes(index), output.accessor_bytes(index))
            image_views = {image["bufferView"] for image in source.json["images"]}
            for index in range(len(source.json["bufferViews"])):
                if index not in image_views:
                    self.assertEqual(view_bytes(source, index), view_bytes(output, index))
            self.assertEqual(normalized_document(source), normalized_document(output))
            self.assertEqual(source.image(0).data, output.image(0).data)
            self.assertNotEqual(source.image(1).data, output.image(1).data)
            self.assertEqual(output.image(1).mime_type, "image/jpeg")
            self.assertTrue(output.image(1).data.startswith(b"\xff\xd8\xff"))
            self.assertFalse(output.image(1).data.startswith(b"\x89PNG"))
            decoded = Image.open(io.BytesIO(output.image(1).data))
            self.assertEqual(decoded.format, "JPEG")

    def test_gate_iou_known_masks(self) -> None:
        body = np.zeros((2, 3, 3), dtype=np.uint8)
        base = body.copy()
        variant = body.copy()
        base[0, 0] = 26
        base[0, 1] = 26
        variant[0, 0] = 26
        variant[1, 0] = 26
        # Intersection=1, union=3 under the production >25 RGB-max rule.
        self.assertAlmostEqual(clothing_region_iou(base, variant, body), 1 / 3)
        self.assertEqual(clothing_region_iou(body, body, body), 0.0)

    def test_iou_gate_rejects_zero_in_iou_only_and_full_cli(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            body = Image.new("RGB", (8, 8), (220, 220, 220))
            body.save(directory / "body-plate.png")
            body.save(directory / "base-plate.png")
            body.save(directory / "variant-plate.png")
            results = [
                subprocess.run(cli_command(directory, iou_only=iou_only), cwd=ROOT,
                               capture_output=True, text=True, check=False)
                for iou_only in (True, False)
            ]
        for result in results:
            self.assertEqual(result.returncode, 3)
            self.assertIn("IoU", result.stderr)
            self.assertIn("0.950000", result.stderr)
            payload = json.loads(result.stdout)
            self.assertFalse(payload["ok"])
            self.assertEqual(payload["error"]["kind"], "gate")
        self.assertEqual(results[0].stdout.count("\n"), 1)

    def test_full_cli_rejects_fill_below_995_percent(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            base_dir = directory / "base"
            base_dir.mkdir()
            builder = GLBBuilder()
            image = builder.add_image(png_bytes((0, 0, 0), (16, 16)), mime_type="image/png")
            material = builder.add_material(base_color_texture=builder.add_texture(image))
            mesh = cylinder_mesh()
            mesh.primitives[0] = PrimitiveRange(0, len(mesh.positions), 0, len(mesh.indices), material)
            mesh_index = builder.add_mesh(mesh)
            builder.add_scene([builder.add_node(mesh=mesh_index)])
            builder.write(base_dir / "base.glb")

            body = np.full((96, 64, 3), 220, dtype=np.uint8)
            body[8:88, 18:46] = 40
            clothing = body.copy()
            clothing[30:70, 24:40] = 0
            Image.fromarray(body).save(directory / "body-plate.png")
            Image.fromarray(clothing).save(directory / "base-plate.png")
            Image.fromarray(clothing).save(directory / "variant-plate.png")

            result = subprocess.run(cli_command(directory), cwd=ROOT, capture_output=True,
                                    text=True, check=False)
            output_exists = (directory / "out").exists()
        self.assertEqual(result.returncode, 3)
        self.assertIn("variantFillRatio", result.stderr)
        self.assertIn("0.995000", result.stderr)
        self.assertEqual(json.loads(result.stdout)["error"]["kind"], "gate")
        self.assertFalse(output_exists)

    def test_bad_dimensions_and_missing_files_fail(self) -> None:
        with self.assertRaisesRegex(ValueError, "尺寸不符"):
            clothing_region_iou(
                np.zeros((2, 2, 3), dtype=np.uint8),
                np.zeros((2, 3, 3), dtype=np.uint8),
                np.zeros((2, 2, 3), dtype=np.uint8),
            )
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            Image.new("RGB", (8, 8), (220, 220, 220)).save(
                directory / "body-plate.png")
            Image.new("RGB", (7, 8), (30, 30, 30)).save(
                directory / "base-plate.png")
            Image.new("RGB", (8, 8), (30, 30, 30)).save(
                directory / "variant-plate.png")
            bad_size = subprocess.run(cli_command(directory, iou_only=True), cwd=ROOT,
                                      capture_output=True, text=True, check=False)
            (directory / "base-plate.png").unlink()
            missing = subprocess.run(cli_command(directory, iou_only=True), cwd=ROOT,
                                     capture_output=True, text=True, check=False)
            for result in (bad_size, missing):
                self.assertEqual(result.returncode, 2)
                self.assertEqual(json.loads(result.stdout)["error"]["kind"], "input")
                self.assertNotIn("Traceback", result.stderr)
                self.assertEqual(result.stdout.count("\n"), 1)

            missing_glb = directory / "missing.glb"
            missing_png = directory / "missing.png"
            with self.assertRaises(FileNotFoundError):
                replace_image_glb(missing_glb, missing_png, directory / "out.glb")

            builder = GLBBuilder()
            image = builder.add_image(png_bytes((1, 2, 3)), mime_type="image/png")
            material = builder.add_material(base_color_texture=builder.add_texture(image))
            mesh = cylinder_mesh()
            mesh.primitives[0] = PrimitiveRange(0, len(mesh.positions), 0, len(mesh.indices), material)
            mesh_index = builder.add_mesh(mesh)
            builder.add_scene([builder.add_node(mesh=mesh_index)])
            existing_glb = directory / "existing.glb"
            builder.write(existing_glb)
            with self.assertRaises(FileNotFoundError):
                replace_image_glb(existing_glb, missing_png, directory / "out.glb")


if __name__ == "__main__":
    unittest.main(verbosity=2)

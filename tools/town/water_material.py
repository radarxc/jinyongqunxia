"""Sample read-only water textures in one continuous screen-space field."""
from __future__ import annotations

import math
import numpy as np
from PIL import Image, ImageChops, ImageDraw


class WaterMaterial:
    BRIGHTNESS_RANGE = (.985, 1.015)

    def __init__(self, library, asset_id: str, root: int):
        self.root = root
        patches = []
        for variant in range(4):
            found = library.resolve(asset_id, variant_index=variant)
            if found is None:
                self.patches = []
                return
            source = found[0].convert("RGB")
            w, h = source.size
            # Opaque interiors exclude the diamond's antialiased outline.
            patch = np.asarray(source.crop((w//4, 3*h//8, 3*w//4, 5*h//8)),
                               dtype=np.float64)
            patches.append(patch)
        means = [p.mean(axis=(0, 1)) for p in patches]
        common = np.mean(means, axis=0)
        self.patches = []
        for patch, mean in zip(patches, means):
            patch = patch + common - mean
            row = np.concatenate((patch, patch[:, ::-1]), axis=1)
            self.patches.append(np.concatenate((row, row[::-1]), axis=0))

    @staticmethod
    def _sample(patch, x, y):
        h, w = patch.shape[:2]
        ix, iy = np.floor(x).astype(int), np.floor(y).astype(int)
        fx, fy = (x-ix)[..., None], (y-iy)[..., None]
        a = patch[iy % h, ix % w] * (1-fx) + patch[iy % h, (ix+1) % w] * fx
        b = patch[(iy+1) % h, ix % w] * (1-fx) + patch[(iy+1) % h, (ix+1) % w] * fx
        return a * (1-fy) + b * fy

    def paint(self, canvas, polygon, scale, alpha_mask=None):
        if not self.patches:
            return False
        left = max(0, math.floor(min(x for x, _ in polygon)))
        top = max(0, math.floor(min(y for _, y in polygon)))
        right = min(canvas.width, math.ceil(max(x for x, _ in polygon)) + 1)
        bottom = min(canvas.height, math.ceil(max(y for _, y in polygon)) + 1)
        if right <= left or bottom <= top:
            return True
        yy, xx = np.mgrid[top:bottom, left:right]
        # Absolute pixel centres: clipping into cells never restarts the phase.
        x = (xx + .5) / scale + self.root % 97
        y = (yy + .5) / scale + (self.root >> 8) % 89
        u, v = (1+np.cos(x/157))/2, (1+np.sin(y/113))/2
        weights = ((1-u)*(1-v), u*(1-v), (1-u)*v, u*v)
        rgb = sum(self._sample(p, x, y) * weight[..., None]
                  for p, weight in zip(self.patches, weights))
        # Slow, bounded brightness drift shares the absolute, seeded phase.
        # It changes no alpha or light direction and cannot create cell seams.
        brightness = 1 + .010*np.sin(x/223 + y/311) + .005*np.cos(x/149 - y/197)
        rgb *= brightness[..., None]
        sprite = Image.fromarray(np.clip(np.rint(rgb), 0, 255).astype("uint8"), "RGB").convert("RGBA")
        mask = Image.new("L", sprite.size)
        ImageDraw.Draw(mask).polygon([(x-left, y-top) for x, y in polygon], fill=255)
        if alpha_mask is not None:
            # Native fringe mask shares the same diamond; only coverage varies.
            x0, y0 = min(x for x, _ in polygon), min(y for _, y in polygon)
            w = max(x for x, _ in polygon) - x0
            h = max(y for _, y in polygon) - y0
            fringe = alpha_mask.transform(sprite.size, Image.Transform.AFFINE,
                (alpha_mask.width/w, 0, (left-x0)*alpha_mask.width/w,
                 0, alpha_mask.height/h, (top-y0)*alpha_mask.height/h),
                Image.Resampling.BILINEAR)
            mask = ImageChops.multiply(mask, fringe)
        sprite.putalpha(mask)
        canvas.alpha_composite(sprite, (left, top))
        return True

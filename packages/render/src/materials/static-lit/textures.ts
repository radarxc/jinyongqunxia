import {
  DataArrayTexture,
  DataTexture,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  type Texture,
  type WebGLRenderer,
} from 'three';
import type {
  BuildingPlanView,
  BuildKitView,
  LayerTextureResult,
  LayerTextureSource,
} from '../../buildgen/types';
import type { RenderQualitySource } from '../../quality/tiers';

const PLACEHOLDER_RGBA = [
  [118, 91, 70, 255],
  [154, 142, 118, 255],
  [102, 65, 48, 255],
  [142, 58, 40, 255],
  [100, 100, 94, 255],
  [176, 170, 150, 255],
  [82, 70, 58, 255],
  [144, 124, 91, 255],
  [117, 86, 56, 255],
  [135, 120, 103, 255],
  [92, 76, 62, 255],
  [196, 183, 146, 255],
  [83, 89, 76, 255],
  [102, 48, 38, 255],
  [66, 59, 52, 255],
  [126, 105, 76, 255],
] as const;

export class PlaceholderLayerTextureSource implements LayerTextureSource {
  async load(kit: BuildKitView, _quality: RenderQualitySource): Promise<LayerTextureResult> {
    const layers = Math.max(1, kit.layers.length);
    const data = new Uint8Array(layers * 4);
    const repeatM = new Float32Array(layers * 2);
    for (let layer = 0; layer < layers; layer += 1) {
      data.set(PLACEHOLDER_RGBA[layer % PLACEHOLDER_RGBA.length]!, layer * 4);
      const repeat = kit.layers[layer]?.repeatMm ?? [1_000, 1_000];
      repeatM[layer * 2] = 1_000 / Math.max(1, repeat[0]);
      repeatM[layer * 2 + 1] = 1_000 / Math.max(1, repeat[1]);
    }
    const texture = new DataArrayTexture(data, 1, 1, layers);
    texture.format = RGBAFormat;
    texture.type = UnsignedByteType;
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.version += 1;
    texture.source.version += 1;
    return { texture, repeatM, owned: true };
  }
}

export function createStateTexture(units: number): { texture: DataTexture; data: Uint8Array } {
  const height = Math.max(1, Math.ceil(units / 256));
  const data = new Uint8Array(256 * height * 4);
  for (let offset = 0; offset < units * 4; offset += 4) {
    data[offset] = 255;
    data[offset + 3] = 0;
  }
  const texture = new DataTexture(data, 256, height, RGBAFormat, UnsignedByteType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.version += 1;
  texture.source.version += 1;
  return { texture, data };
}

/** Immutable per-unit designed ridge height, encoded as centimetres little-endian in RG. */
export function createUnitTopTexture(
  plans: readonly BuildingPlanView[],
  units: number,
): { texture: DataTexture; data: Uint8Array } {
  const height = Math.max(1, Math.ceil(units / 256));
  const data = new Uint8Array(256 * height * 4);
  const tops = new Uint16Array(units);
  let partUnit = plans.length;
  for (let unit = 0; unit < plans.length; unit += 1) {
    const plan = plans[unit]!;
    const localGroundMm = plan.floorY[0] ?? plan.elev[1];
    const ridgeAboveGroundMm = plan.elev[1] + plan.roof[2] - localGroundMm;
    tops[unit] = Math.max(100, Math.min(65_535, Math.round(ridgeAboveGroundMm / 10)));
    for (const part of plan.parts ?? []) {
      if (partUnit < units) tops[partUnit] = Math.max(100, Math.round(part[9] / 10));
      partUnit += 1;
    }
  }
  for (let unit = 0; unit < units; unit += 1) {
    const top = Math.max(100, tops[unit]!);
    data[unit * 4] = top & 0xff;
    data[unit * 4 + 1] = top >>> 8;
  }
  const texture = new DataTexture(data, 256, height, RGBAFormat, UnsignedByteType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.version += 1;
  texture.source.version += 1;
  return { texture, data };
}

export function uploadTexture(
  renderer: WebGLRenderer,
  texture: Texture | DataTexture | DataArrayTexture,
): void {
  renderer.initTexture(texture);
}

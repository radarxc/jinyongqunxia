import { describe, expect, it } from 'vitest';
import {
  createStaticLitMaterial,
  staticLitCutawayDiscard,
  staticLitLampStrength,
} from './material';
import { ISO_LIT_UNIFORMS, setStaticLitTimeOfDay, STATIC_LIT_HEMI_INTENSITY } from './lighting';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../../buildgen/testing/mini-plans';
import type { RenderQualitySource } from '../../quality/tiers';
import {
  createStateTexture,
  createUnitTopTexture,
  PlaceholderLayerTextureSource,
} from './textures';
import { MeshBufferBuilder } from '../../buildgen/mesher/core/buffer';
import { generateCells } from '../../buildgen/mesher/generate';

const quality = {
  tier: 'high',
  renderScale: 1,
  effectivePixelRatio: (value: number) => value,
} satisfies RenderQualitySource;
describe('static-lit material', () => {
  it('keeps structural defines and program keys independent of building count', async () => {
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(6);
    const first = createStaticLitMaterial({
      layers: layers.texture,
      state: state.texture,
      unitTop: state.texture,
      repeatM: layers.repeatM,
      roofFade: true,
    });
    const second = createStaticLitMaterial({
      layers: layers.texture,
      state: state.texture,
      unitTop: state.texture,
      repeatM: layers.repeatM,
      roofFade: true,
    });
    expect(first.customProgramCacheKey()).toBe(second.customProgramCacheKey());
    expect(first.defines).toEqual({ ROOF_FADE: 1 });
    first.dispose();
    second.dispose();
    state.texture.dispose();
    layers.texture.dispose();
  });

  it('shares and updates one IsoLit uniform graph', () => {
    const before = ISO_LIT_UNIFORMS.uSunDirection.value;
    setStaticLitTimeOfDay(20, 135);
    expect(ISO_LIT_UNIFORMS.uSunDirection.value).toBe(before);
    expect(ISO_LIT_UNIFORMS.uTimeOfDay.value).toBe(20);
    expect(ISO_LIT_UNIFORMS.uGroundColor.value.getHexString()).toBe('6b5a45');
  });

  it('keeps the tech/16 §7 hemisphere intensity at 0.5 by day and by night', () => {
    expect(STATIC_LIT_HEMI_INTENSITY).toBe(0.5);
    for (const hours of [12, 0, 18.5, 21]) {
      setStaticLitTimeOfDay(hours, 45);
      expect(ISO_LIT_UNIFORMS.uHemiIntensity.value).toBe(0.5);
    }
    setStaticLitTimeOfDay(12, 45);
    const noonSky = ISO_LIT_UNIFORMS.uSkyColor.value.getHex();
    setStaticLitTimeOfDay(0, 45);
    // Only the sky colour follows the hour.
    expect(ISO_LIT_UNIFORMS.uSkyColor.value.getHex()).not.toBe(noonSky);
    expect(ISO_LIT_UNIFORMS.uHemiIntensity.value).toBe(0.5);
  });

  it('uses no GLSL ES 3.00 reserved identifiers in any variant (WebGL2 rejects them)', async () => {
    // GLSL ES 3.00.6 §3.8 keywords reserved for future use (a real driver fails to compile).
    const reserved = new Set(
      `attribute varying coherent volatile restrict readonly writeonly
      resource atomic_uint noperspective patch sample subroutine common partition active asm class
      union enum typedef template this goto inline noinline public static extern external interface
      long short double half fixed unsigned superp input output hvec2 hvec3 hvec4 dvec2 dvec3 dvec4
      fvec2 fvec3 fvec4 sampler3DRect filter sizeof cast namespace using`.split(/\s+/),
    );
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(1);
    for (const options of [{}, { roofFade: true }, { alphaTest: true }, { depthOnly: true }]) {
      const material = createStaticLitMaterial({
        layers: layers.texture,
        state: state.texture,
        unitTop: state.texture,
        repeatM: layers.repeatM,
        ...options,
      });
      for (const source of [material.vertexShader, material.fragmentShader]) {
        const code = source
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '')
          .replace(/^\s*#.*$/gm, '');
        const used = new Set(code.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []);
        expect([...used].filter((word) => reserved.has(word))).toEqual([]);
      }
      material.dispose();
    }
    state.texture.dispose();
    layers.texture.dispose();
  });

  it('tone-maps and encodes the lit colour to the output colour space last', async () => {
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(1);
    const material = createStaticLitMaterial({
      layers: layers.texture,
      state: state.texture,
      unitTop: state.texture,
      repeatM: layers.repeatM,
    });
    const source = material.fragmentShader;
    const lit = source.indexOf('outColor = vec4(isoLighting(');
    const toneMapped = source.indexOf('outColor.rgb = toneMapping(outColor.rgb);');
    const encoded = source.indexOf('outColor = linearToOutputTexel(outColor);');
    expect(lit).toBeGreaterThan(0);
    expect(toneMapped).toBeGreaterThan(lit);
    expect(encoded).toBeGreaterThan(toneMapped);
    expect(source.slice(encoded).trim()).toBe('outColor = linearToOutputTexel(outColor);\n}');
    // The gl_FragColor-based chunks would not compile under GLSL3 with an own output.
    expect(source).not.toContain('#include <colorspace_fragment>');
    expect(source).not.toContain('#include <tonemapping_fragment>');
    // Layers are sRGB textures, so sampling is linear and the output step is required.
    expect(layers.texture.colorSpace).toBe('srgb');
    material.dispose();
    state.texture.dispose();
    layers.texture.dispose();
  });

  it('uses state B only for bit2 interiors and bit3 emitters with indoor light multipliers', async () => {
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(1);
    const material = createStaticLitMaterial({
      layers: layers.texture,
      state: state.texture,
      unitTop: state.texture,
      repeatM: layers.repeatM,
    });
    expect(material.fragmentShader).toContain('interiorLamp = interior * interiorVisible');
    expect(material.fragmentShader).toContain('emissive * windowLight');
    expect(material.fragmentShader).toContain('mix(1.0, .85, interior)');
    expect(material.fragmentShader).toContain('mix(1.0, .7, interior)');
    material.dispose();
    state.texture.dispose();
    layers.texture.dispose();
  });

  it('keeps unbaked interiors dark and scales baked interior and night-window light bytes', () => {
    const builder = new MeshBufferBuilder(1, 1);
    builder.addVertex({ position: [0, 0, 0], normal: [0, 1, 0], flags: 1 << 2 });
    const unbakedAlpha = builder.finish().tint[3]!;
    expect(unbakedAlpha).toBe(0);
    expect(staticLitLampStrength(unbakedAlpha, 1 << 2, 255, 1)).toBe(0);
    expect(staticLitLampStrength(128, 1 << 2, 255, 1)).toBeCloseTo(128 / 255, 8);
    expect(staticLitLampStrength(64, 1 << 3, 255, 1)).toBeCloseTo(64 / 255, 8);
    expect(staticLitLampStrength(64, 1 << 3, 1, 1)).toBeCloseTo(64 / 255, 8);
    expect(staticLitLampStrength(64, 1 << 2, 1, 1)).toBe(0);
    expect(staticLitLampStrength(64, 1 << 3, 255, 0)).toBe(0);
  });

  it('gates the real GLSL partition branch on bit1 and cuts real partitions', async () => {
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(1);
    const material = createStaticLitMaterial({
      layers: layers.texture,
      state: state.texture,
      unitTop: state.texture,
      repeatM: layers.repeatM,
    });
    expect(material.fragmentShader).toContain(
      'bool partitionFacing = partitionWall && partitionNormalLength > .0001',
    );
    material.dispose();
    state.texture.dispose();
    layers.texture.dispose();
    for (let green = 0; green <= 255; green += 1)
      expect(staticLitCutawayDiscard(0, 0, 0, 1, 0, 1, 1, green, 200, 300)).toBe(false);
    const plan = { ...MINI_BUILDING_PLANS[0]!, fixtures: [[34, 0, 0, 2_000, 100, 0, 1]] as const };
    const shell = generateCells([plan], MINI_BUILD_KIT, 0, 32)[0]!.shell;
    let tested = false;
    for (let vertex = 0; vertex < shell.position.length / 3; vertex += 1) {
      const matOffset = vertex * 4,
        unitOffset = vertex * 2;
      if (shell.mat[matOffset + 2] !== 2 || shell.mat[matOffset + 3] !== 0) continue;
      const localHeight = shell.unit[unitOffset + 1]!;
      if (localHeight <= 100) continue;
      const nx = shell.normal[matOffset]! / 127,
        nz = shell.normal[matOffset + 2]! / 127;
      if ((nx + nz) / Math.max(0.0001, Math.hypot(nx, nz)) <= 0.2) continue;
      expect(
        staticLitCutawayDiscard(
          2,
          0,
          nx,
          nz,
          Math.SQRT1_2,
          Math.SQRT1_2,
          9,
          255,
          localHeight,
          plan.roof[2] / 10,
        ),
      ).toBe(true);
      expect(
        staticLitCutawayDiscard(
          2,
          0,
          nx,
          nz,
          Math.SQRT1_2,
          Math.SQRT1_2,
          9,
          0,
          localHeight,
          plan.roof[2] / 10,
        ),
      ).toBe(false);
      tested = true;
      break;
    }
    expect(tested).toBe(true);
  });

  it('keeps depth-only roofs opaque while the color roof uses Bayer fade', async () => {
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(1);
    const depth = createStaticLitMaterial({
      layers: layers.texture,
      state: state.texture,
      unitTop: state.texture,
      repeatM: layers.repeatM,
      depthOnly: true,
    });
    const earlyDepth = depth.fragmentShader.indexOf('outColor = vec4(1.0); return;');
    expect(earlyDepth).toBeLessThan(depth.fragmentShader.indexOf('state.r <= bayer4'));
    depth.dispose();
    state.texture.dispose();
    layers.texture.dispose();
  });

  it('encodes the plan ridge instead of taller ornaments into the immutable top texture', () => {
    const plan = { ...MINI_BUILDING_PLANS[0]!, roof: [2, 3_070, 4_566] as const };
    const top = createUnitTopTexture([plan], 1);
    expect(top.data[0]! + top.data[1]! * 256).toBe(457);
    top.texture.dispose();
  });

  it('encodes compound part ridges independently of main-building ornaments', () => {
    const plan = {
      ...MINI_BUILDING_PLANS[0]!,
      parts: [[0, 0, 0, 2_000, 2_000, 0, 1, 1, 2_500, 3_100, 400, 0]] as const,
    };
    const top = createUnitTopTexture([plan], 2);
    expect(top.data[4]! + top.data[5]! * 256).toBe(310);
    top.texture.dispose();
  });
});

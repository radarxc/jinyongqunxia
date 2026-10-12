export const PACKING_GLSL = /* glsl */ `
vec4 unpackByte4(vec4 value) { return floor(value * 255.0 + 0.5); }
vec2 stateUv(float unit, vec2 stateSize) {
  return (vec2(mod(unit, 256.0), floor(unit / 256.0)) + 0.5) / stateSize;
}
vec3 facadeNormal(float facade) {
  if (mod(floor(facade / 8.0), 2.0) > 0.5) return vec3(1.0, 0.0, 0.0);
  if (mod(floor(facade / 4.0), 2.0) > 0.5) return vec3(0.0, 0.0, -1.0);
  if (mod(floor(facade / 2.0), 2.0) > 0.5) return vec3(-1.0, 0.0, 0.0);
  return vec3(0.0, 0.0, 1.0);
}`;

export const DITHER_GLSL = /* glsl */ `
float bayer4(vec2 pixel) {
  vec2 p = mod(floor(pixel), 4.0);
  float x = p.x; float y = p.y;
  if (y < 1.0) { if (x < 1.0) return 0.0; if (x < 2.0) return .5; if (x < 3.0) return .125; return .625; }
  if (y < 2.0) { if (x < 1.0) return .75; if (x < 2.0) return .25; if (x < 3.0) return .875; return .375; }
  if (y < 3.0) { if (x < 1.0) return .1875; if (x < 2.0) return .6875; if (x < 3.0) return .0625; return .5625; }
  if (x < 1.0) return .9375; if (x < 2.0) return .4375; if (x < 3.0) return .8125; return .3125;
}`;

export const LIGHTING_GLSL = /* glsl */ `
vec3 isoLighting(vec3 normal, vec3 albedo, float ao, float lamp, float interior) {
  float skyMix = normal.y * .5 + .5;
  vec3 hemi = mix(uGroundColor, uSkyColor, skyMix) * uHemiIntensity * mix(1.0, .85, interior);
  float lambert = max(dot(normal, normalize(uSunDirection)), 0.0);
  vec3 sun = uSunColor * uSunIntensity * lambert * mix(1.0, .7, interior);
  vec3 warmLamp = vec3(1.0, .62, .31) * lamp * uLampIntensity;
  return albedo * (hemi + sun) * ao + warmLamp;
}`;

/** Replaces local static-lit includes without touching Three's global ShaderChunk registry. */
export function expandStaticLitIncludes(source: string): string {
  return source
    .replace('#include <static_lit_packing>', PACKING_GLSL)
    .replace('#include <static_lit_dither>', DITHER_GLSL)
    .replace('#include <static_lit_lighting>', LIGHTING_GLSL);
}

import {
  Color,
  DoubleSide,
  GLSL3,
  ShaderMaterial,
  Vector2,
  Vector3,
  type DataArrayTexture,
  type DataTexture,
  type IUniform,
} from 'three';
import { expandStaticLitIncludes } from './chunks';
import { ISO_LIT_UNIFORMS } from './lighting';

export interface StaticLitMaterialOptions {
  readonly layers: DataArrayTexture;
  readonly state: DataTexture;
  readonly unitTop: DataTexture;
  readonly repeatM: Float32Array;
  readonly roofFade?: boolean;
  readonly alphaTest?: boolean;
  readonly depthOnly?: boolean;
}
export interface StaticLitUniforms {
  readonly uLayers: IUniform<DataArrayTexture>;
  readonly uState: IUniform<DataTexture>;
  readonly uUnitTop: IUniform<DataTexture>;
  readonly uLayerRepeatM: IUniform<Float32Array>;
  readonly uStateSize: IUniform<Vector2>;
  readonly uCameraBack: IUniform<Vector3>;
  readonly uCutFacadeMask: IUniform<number>;
  readonly uFocusWorld: IUniform<Vector3>;
  readonly uFocusRadiusFade: IUniform<Vector2>;
  readonly uCutTopColor: IUniform<Color>;
}

const VERTEX = /* glsl */ `
in vec4 aMat; in vec2 aUnit; in vec4 aTint;
out vec3 vNormal; out vec2 vUvM; out vec4 vMat; out vec2 vUnit; out vec4 vTint; out vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz; vNormal = normalize(mat3(modelMatrix) * normal); vUvM = uv;
  vMat = aMat; vUnit = aUnit; vTint = aTint; gl_Position = projectionMatrix * viewMatrix * world;
}`;
const FRAGMENT = /* glsl */ `
precision highp sampler2DArray;
uniform sampler2DArray uLayers; uniform sampler2D uState; uniform sampler2D uUnitTop;
uniform vec2 uStateSize;
uniform vec2 uLayerRepeatM[16]; uniform vec3 uCameraBack; uniform float uCutFacadeMask;
uniform vec3 uFocusWorld; uniform vec2 uFocusRadiusFade; uniform vec3 uCutTopColor;
uniform vec3 uSunDirection; uniform vec3 uSunColor; uniform float uSunIntensity;
uniform vec3 uSkyColor; uniform vec3 uGroundColor; uniform float uHemiIntensity;
uniform float uLampIntensity; uniform float uTimeOfDay;
in vec3 vNormal; in vec2 vUvM; in vec4 vMat; in vec2 vUnit; in vec4 vTint; in vec3 vWorld;
out vec4 outColor;
#include <static_lit_packing>
#include <static_lit_dither>
#include <static_lit_lighting>
void main() {
  vec2 unitUv = stateUv(vUnit.x, uStateSize);
  vec4 matBytes = unpackByte4(vMat); vec4 state = texture(uState, unitUv);
  vec4 topBytes = unpackByte4(texture(uUnitTop, unitUv));
#ifdef DEPTH_ONLY
  outColor = vec4(1.0); return;
#endif
  float flags = matBytes.z; float facade = matBytes.w;
  bool cutCandidate = mod(flags, 2.0) > .5;
  bool partitionWall = mod(floor(flags / 2.0), 2.0) > .5;
  bool facadeSelected = false;
  for (int bit = 0; bit < 4; bit++) {
    float divisor = exp2(float(bit));
    facadeSelected = facadeSelected || (mod(floor(facade / divisor), 2.0) > .5
      && mod(floor(uCutFacadeMask / divisor), 2.0) > .5);
  }
  float facing = -1.0;
  if (mod(facade, 2.0) > .5 && mod(uCutFacadeMask, 2.0) > .5) facing = max(facing, uCameraBack.z);
  if (mod(floor(facade / 2.0), 2.0) > .5 && mod(floor(uCutFacadeMask / 2.0), 2.0) > .5)
    facing = max(facing, -uCameraBack.x);
  if (mod(floor(facade / 4.0), 2.0) > .5 && mod(floor(uCutFacadeMask / 4.0), 2.0) > .5)
    facing = max(facing, -uCameraBack.z);
  if (mod(floor(facade / 8.0), 2.0) > .5 && mod(floor(uCutFacadeMask / 8.0), 2.0) > .5)
    facing = max(facing, uCameraBack.x);
  float unitTopCm = topBytes.r + topBytes.g * 256.0;
  float cutHeightCm = mix(max(unitTopCm, 100.0), 100.0, state.g);
  float partitionNormalLength = length(vNormal.xz);
  bool partitionFacing = partitionWall && partitionNormalLength > .0001
    && dot(vNormal.xz / partitionNormalLength, uCameraBack.xz) > .2;
  vec3 focusDelta = vWorld - uFocusWorld;
  float focusDepth = dot(focusDelta, uCameraBack);
  float focusScreenM = sqrt(max(0.0, dot(focusDelta, focusDelta) - focusDepth * focusDepth));
  float focusEdge = 1.0 - smoothstep(max(0.0, uFocusRadiusFade.x - .3), uFocusRadiusFade.x, focusScreenM);
  float focusHole = focusEdge * uFocusRadiusFade.y;
  bool neverTransparent = mod(floor(flags / 16.0), 2.0) > .5;
  bool cutFacing = (cutCandidate && facadeSelected && facing > .2) || partitionFacing;
  if (cutFacing && state.g > 0.0 && vUnit.y > cutHeightCm) discard;
  if (focusDepth > .5 && !neverTransparent && bayer4(gl_FragCoord.xy) < focusHole) discard;
#ifdef ROOF_FADE
  if (state.r <= bayer4(gl_FragCoord.xy)) discard;
#endif
  vec2 repeatM = uLayerRepeatM[int(min(matBytes.x, 15.0))];
  vec4 texel = texture(uLayers, vec3(fract(vUvM * repeatM), matBytes.x));
#ifdef ALPHA_TEST
  if (texel.a < .5) discard;
#endif
  float interior = mod(floor(flags / 4.0), 2.0);
  float emissive = mod(floor(flags / 8.0), 2.0);
  float interiorVisible = state.b <= (1.5 / 255.0) ? 0.0 : state.b;
  float windowLight = step(.5 / 255.0, state.b);
  if (interior > .5 && emissive < .5 && interiorVisible <= bayer4(gl_FragCoord.xy)) discard;
  vec3 normal = normalize(vNormal); if (!gl_FrontFacing) normal = vec3(0.0, 1.0, 0.0);
  vec3 albedo = gl_FrontFacing ? texel.rgb * vTint.rgb : uCutTopColor;
  albedo = mix(albedo, vec3(1.0, .78, .3), state.a * .35);
  float interiorLamp = interior * interiorVisible;
  float lamp = vTint.a * max(interiorLamp, emissive * windowLight);
  outColor = vec4(isoLighting(normal, albedo, matBytes.y / 255.0, lamp, interior), 1.0);
  // GLSL3 + own output: same steps as <tonemapping_fragment> / <colorspace_fragment>,
  // which only write gl_FragColor (undefined in GLSL3 ShaderMaterials).
#if defined( TONE_MAPPING )
  outColor.rgb = toneMapping(outColor.rgb);
#endif
  outColor = linearToOutputTexel(outColor);
}`;

export type StaticLitMaterial = ShaderMaterial & { staticUniforms: StaticLitUniforms };

/** JS mirror of the baked-light term, used by byte-contract tests without a WebGL context. */
export function staticLitLampStrength(
  tintAlphaByte: number,
  flagsByte: number,
  stateBlueByte: number,
  lampIntensity: number,
): number {
  const interior = (flagsByte & (1 << 2)) !== 0;
  const emitter = (flagsByte & (1 << 3)) !== 0;
  const blue = Math.max(0, Math.min(255, stateBlueByte));
  const interiorVisible = interior && blue >= 2 ? blue / 255 : 0;
  const windowLight = emitter && blue >= 1 ? 1 : 0;
  const visible = Math.max(interiorVisible, windowLight);
  const baked = Math.max(0, Math.min(255, tintAlphaByte)) / 255;
  return baked * visible * Math.max(0, lampIntensity);
}

/** JS mirror of the shell discard rule for payload-level cutaway regression tests. */
export function staticLitCutawayDiscard(
  flagsByte: number,
  facadeByte: number,
  normalX: number,
  normalZ: number,
  cameraBackX: number,
  cameraBackZ: number,
  cutFacadeBits: number,
  stateGreenByte: number,
  localHeightCm: number,
  unitTopCm: number,
): boolean {
  const facadeNormals = [
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 0],
  ] as const;
  let outerFacing = false;
  if ((flagsByte & 1) !== 0)
    for (let bit = 0; bit < 4; bit += 1) {
      if ((facadeByte & cutFacadeBits & (1 << bit)) === 0) continue;
      const normal = facadeNormals[bit]!;
      if (normal[0] * cameraBackX + normal[1] * cameraBackZ > 0.2) outerFacing = true;
    }
  const normalLength = Math.hypot(normalX, normalZ);
  const partitionFacing =
    (flagsByte & 2) !== 0 &&
    normalLength > 0.0001 &&
    (normalX * cameraBackX + normalZ * cameraBackZ) / normalLength > 0.2;
  const progress = Math.max(0, Math.min(255, stateGreenByte)) / 255;
  const top = Math.max(100, unitTopCm);
  const cutHeight = top + (100 - top) * progress;
  return progress > 0 && localHeightCm > cutHeight && (outerFacing || partitionFacing);
}

export function createStaticLitMaterial(options: StaticLitMaterialOptions): StaticLitMaterial {
  const height = options.state.image.height;
  const local: StaticLitUniforms = {
    uLayers: { value: options.layers },
    uState: { value: options.state },
    uUnitTop: { value: options.unitTop },
    uLayerRepeatM: { value: options.repeatM },
    uStateSize: { value: new Vector2(256, height) },
    uCameraBack: { value: new Vector3(Math.SQRT1_2, 0.5, Math.SQRT1_2).normalize() },
    uCutFacadeMask: { value: 9 },
    uFocusWorld: { value: new Vector3() },
    uFocusRadiusFade: { value: new Vector2() },
    uCutTopColor: { value: new Color(0x695947) },
  };
  const defines: Record<string, number> = {};
  if (options.roofFade) defines['ROOF_FADE'] = 1;
  if (options.alphaTest) defines['ALPHA_TEST'] = 1;
  if (options.depthOnly) defines['DEPTH_ONLY'] = 1;
  const material = new ShaderMaterial({
    name: 'static-lit',
    glslVersion: GLSL3,
    side: DoubleSide,
    depthWrite: true,
    defines,
    uniforms: { ...ISO_LIT_UNIFORMS, ...local },
    vertexShader: VERTEX,
    fragmentShader: expandStaticLitIncludes(FRAGMENT),
  }) as StaticLitMaterial;
  material.staticUniforms = local;
  material.customProgramCacheKey = () =>
    `static-lit:r2:${options.roofFade ? 1 : 0}:${options.alphaTest ? 1 : 0}:${options.depthOnly ? 1 : 0}`;
  return material;
}

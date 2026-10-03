/* global HTMLCanvasElement, devicePixelRatio, document, performance */
import { AddEquation, CanvasTexture, Color, CustomBlending, DoubleSide, DstColorFactor, HalfFloatType,
  LinearSRGBColorSpace, Mesh, NearestFilter, NoBlending, OneFactor, OneMinusSrcAlphaFactor, SRGBColorSpace,
  OneMinusSrcColorFactor, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial,
  UnsignedByteType, Vector2, Vector4, WebGLRenderer, WebGLRenderTarget,
  type Texture } from 'three';
import { VfxAssetStore } from './assets';
import type { VfxAssetPlan } from './assets';
import { ObjectPool } from './pool';
import { VfxTextureStore } from './texture-store';
import { createContextGuard, type ContextFailure, type ContextState } from '../core/context-guard';
import { getDefaultRenderQuality, QUALITY_TIERS, type RenderQualitySource } from '../quality/tiers';
import type { BattleVfxStage, BattleVfxStageOptions, VfxAccent, VfxComposition, VfxEffect, VfxPlayRequest, VfxProjector, VfxStageStats } from './types';

const MAX_ACTIVE = 48;
const MAX_GHOSTS = 5;
const EMITTER_DISPLAY_SCALE = 0.2;
const ACCENT_COLORS: Readonly<Record<VfxAccent, string>> = {
  hit: '#f8e4b2', repel: '#83d5ef', 'foreign-qi': '#a77ad9', acupoint: '#d44b43',
};
const ATTRIBUTE_SIZE = 15;
const ATTRIBUTE_SCALE = 9;
export const VFX_POOL_CAPACITY = MAX_ACTIVE;

export interface RecoverableVfxStageOptions extends BattleVfxStageOptions {
  readonly quality?: RenderQualitySource;
  readonly onContextStateChange?: (state: ContextState) => void;
  readonly onContextLoss?: (sessionLossCount: number) => void;
  readonly onContextRecreate?: () => Promise<boolean>;
  readonly onContextFatal?: (kind: ContextFailure) => void;
  readonly requestFrame?: () => void;
}
export interface RecoverableVfxStage extends BattleVfxStage {
  readonly contextState: ContextState;
  readonly stats: VfxStageStats & { drawCalls: number; particles: number; cpuMs: number };
}

function effectDisplayScaleInto(composition: VfxComposition, distancePx: number, output: Float32Array): void {
  const effect = composition.effect;
  if (!effect) { output[0] = 1; output[1] = 1; return; }
  const length = Math.max(56, distancePx) / Math.max(1, effect.reference_length_px) * composition.scale[0];
  const width = composition.emitter
    ? composition.emitter_scale * composition.emitter.emission_width_px
      * EMITTER_DISPLAY_SCALE / Math.max(1, effect.root_width_px) * composition.scale[1]
    : length * composition.scale[1];
  output[0] = length; output[1] = width;
}

export function effectDisplayScale(composition: VfxComposition, distancePx: number): readonly [number, number] {
  const output = new Float32Array(2); effectDisplayScaleInto(composition, distancePx, output);
  return [output[0]!, output[1]!];
}

interface TimelineScratch {
  frameIndex: number; nextFrameIndex: number; mix: number; alpha: number; scale: number;
  driftPx: number; brightness: number; maskEnabled: boolean; maskSoftness: number; reveal: number; erase: number;
  ghostCount: number; readonly ghostAlpha: Float32Array; readonly ghostOffset: Float32Array; readonly ghostStretch: Float32Array;
}

function createTimelineScratch(): TimelineScratch {
  return { frameIndex: 0, nextFrameIndex: 0, mix: 0, alpha: 1, scale: 1, driftPx: 0, brightness: 1,
    maskEnabled: false, maskSoftness: 0.08, reveal: 1, erase: 0, ghostCount: 0,
    ghostAlpha: new Float32Array(MAX_GHOSTS), ghostOffset: new Float32Array(MAX_GHOSTS),
    ghostStretch: new Float32Array(MAX_GHOSTS) };
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const smooth = (value: number): number => { const x = clamp01(value); return x * x * (3 - 2 * x); };

function sampleTimelineInto(composition: VfxComposition, seconds: number, output: TimelineScratch): void {
  if (!Number.isFinite(seconds)) throw new Error('Time must be finite');
  const rhythm = composition.rhythm;
  const charge = rhythm.charge_s; const release = rhythm.release_s;
  const sustain = rhythm.sustain_s; const dissipate = rhythm.dissipate_s;
  if (!Number.isFinite(charge) || charge < 0 || !Number.isFinite(release) || release < 0
    || !Number.isFinite(sustain) || sustain < 0 || !Number.isFinite(dissipate) || dissipate < 0)
    throw new Error('Invalid rhythm');
  const duration = Number((charge + release + sustain + dissipate).toFixed(12));
  if (!(duration > 0)) throw new Error('Duration must be positive');
  const expected = composition.template?.params['duration_s'];
  if (composition.template && (!Number.isFinite(expected) || (expected ?? 0) <= 0
    || Math.abs(duration - expected!) > 1e-9))
    throw new Error('Template duration_s must equal the rhythm duration');
  if (composition.template?.mode === 'plain_strike' && duration > 0.4 + 1e-9)
    throw new Error('Plain strike duration must not exceed 0.4 seconds');
  const time = Math.min(duration, Math.max(0, seconds)); const phase = time / duration;
  const frames = composition.effect?.frames; const frameCount = frames?.length ?? 0;
  let frameIndex = 0;
  while (frameIndex + 1 < Math.max(2, frameCount) && (frames?.[frameIndex + 1]?.phase ?? 1) <= phase) frameIndex += 1;
  const nextFrameIndex = frameCount === 0 ? 1 : Math.min(frameIndex + 1, frameCount - 1);
  const firstPhase = frames?.[frameIndex]?.phase ?? (frameIndex === 0 ? 0 : 1);
  const nextPhase = frames?.[nextFrameIndex]?.phase ?? 1; const span = nextPhase - firstPhase;
  output.frameIndex = frameIndex; output.nextFrameIndex = nextFrameIndex;
  output.mix = composition.transition.interpolation === 'hold' || span === 0 ? 0 : clamp01((phase - firstPhase) / span);
  output.alpha = 1; output.scale = 1; output.driftPx = 0; output.reveal = 1; output.erase = 0; output.ghostCount = 0;
  const endRelease = rhythm.charge_s + rhythm.release_s; const endSustain = endRelease + rhythm.sustain_s;
  if (time < rhythm.charge_s) { output.reveal = smooth(time / rhythm.charge_s); output.alpha = output.reveal;
    output.scale = composition.transition.scale_from + (1 - composition.transition.scale_from) * output.reveal;
  } else if (time >= endSustain) {
    output.erase = rhythm.dissipate_s > 0 ? smooth((time - endSustain) / rhythm.dissipate_s) : 1;
    output.alpha = 1 - output.erase; output.driftPx = composition.transition.drift_fraction
      * (composition.length_px ?? composition.range_hex * composition.pixels_per_hex) * output.erase;
  }
  if (time === duration) { output.alpha = 0; output.erase = 1; }
  const segment = time < rhythm.charge_s ? 0 : time < endRelease ? 1 : time < endSustain ? 2 : time < duration ? 3 : 4;
  if (segment === 4) output.brightness = composition.transition.brightness[4];
  else {
    const starts = segment === 0 ? 0 : segment === 1 ? rhythm.charge_s : segment === 2 ? endRelease : endSustain;
    const ends = segment === 0 ? rhythm.charge_s : segment === 1 ? endRelease : segment === 2 ? endSustain : duration;
    const mix = (time - starts) / (ends - starts); const values = composition.transition.brightness;
    output.brightness = values[segment]! + (values[segment + 1]! - values[segment]!) * mix;
  }
  const mask = composition.transition.directional_mask; output.maskEnabled = mask?.enabled ?? false;
  output.maskSoftness = mask?.softness ?? 0.08;
  const template = composition.template;
  if (!template || template.mode === 'qi_projection') return;
  const attack = 0.18; const envelope = phase < attack ? smooth(phase / attack) : 1 - smooth((phase - attack) / (1 - attack));
  if (template.mode === 'plain_strike') {
    output.alpha = envelope; output.brightness = 1; output.scale = 0.85 + 0.15 * smooth(phase / attack);
    output.driftPx = 0; output.maskEnabled = false; output.maskSoftness = 0.08; output.reveal = 1; output.erase = 0; return;
  }
  const count = template.params['copies'] ?? 4; const spacing = template.params['spacing_px'] ?? 28;
  const stretch = template.params['stretch'] ?? 0.04;
  if (!Number.isInteger(count) || count < 3 || count > MAX_GHOSTS)
    throw new Error('Afterimage copies must be 3 to 5');
  if (!Number.isFinite(spacing) || spacing <= 0 || !Number.isFinite(stretch) || stretch < 0 || stretch > 0.1)
    throw new Error('Invalid afterimage geometry');
  output.alpha = 0; output.brightness = 1; output.driftPx = 0;
  output.ghostCount = count;
  for (let index = 0; index < count; index += 1) {
    output.ghostAlpha[index] = envelope * 0.44 * (1 - index / count * 0.65);
    output.ghostOffset[index] = (index + 1) * spacing * (1 + 0.25 * smooth((phase - attack) / (1 - attack)));
    output.ghostStretch[index] = 1 + (index + 1) * stretch * envelope;
  }
}

const batchTimeline = createTimelineScratch();

/** Allocation-free portion of one frame; exported for the desktop performance gate. */
export function sampleVfxBatchFrame(compositions: readonly VfxComposition[], timeSeconds: number, output: Float32Array): void {
  if (output.length < compositions.length * ATTRIBUTE_SIZE) throw new Error('VFX_FRAME_BUFFER_TOO_SMALL');
  for (let index = 0; index < compositions.length; index += 1) {
    sampleTimelineInto(compositions[index]!, timeSeconds, batchTimeline); const state = batchTimeline; const offset = index * ATTRIBUTE_SIZE;
    output[offset] = state.alpha; output[offset + 1] = state.scale; output[offset + 2] = state.brightness;
    output[offset + 3] = state.mix; output[offset + 4] = state.driftPx;
    output[offset + 5] = state.maskEnabled ? 1 : 0; output[offset + 6] = state.maskSoftness;
    output[offset + 7] = state.reveal; output[offset + 8] = state.erase;
    for (let ghost = 0; ghost < MAX_GHOSTS; ghost += 1) {
      const base = offset + ATTRIBUTE_SCALE + ghost;
      output[base] = ghost < state.ghostCount ? state.ghostAlpha[ghost]! : 0;
    }
  }
}
const VERTEX = `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const SPRITE_FRAGMENT = `
uniform sampler2D map; uniform vec4 uvRectA; uniform vec4 uvRectB; uniform vec3 tint;
uniform vec2 frameSizeA; uniform vec2 frameSizeB; uniform vec2 anchorA; uniform vec2 anchorB;
uniform vec4 localBounds; uniform vec2 sourceDirection;
uniform float opacity; uniform float tintAmount; uniform float brightness; uniform float frameMix;
uniform float keyEnabled; uniform float keyMethod; uniform float whiteCutoff; uniform float opaqueLuma;
uniform float keyFull; uniform float keyEpsilon; uniform float keyDewhite; uniform float procedural;
uniform float maskEnabled; uniform float maskSoftness; uniform float reveal; uniform float erase;
uniform float maskReferenceLength;
varying vec2 vUv;
vec3 linearToSrgb(vec3 c){vec3 lo=c*12.92;vec3 hi=1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055;
  return mix(lo,hi,step(vec3(0.0031308),c));}
vec4 premultiplyTexel(vec4 texel){
  if(keyEnabled<0.5)return vec4(texel.rgb*texel.a,texel.a);
  vec3 encoded=linearToSrgb(texel.rgb);float low=min(encoded.r,min(encoded.g,encoded.b));
  float luma=dot(encoded,vec3(0.2126,0.7152,0.0722));
  float a0=keyMethod>0.5?(whiteCutoff-luma)/max(keyEpsilon,whiteCutoff-opaqueLuma)
    :(1.0-low-(1.0-whiteCutoff))/max(keyEpsilon,keyFull-(1.0-whiteCutoff));
  float a=max(clamp(a0,0.0,1.0),1.0-min(texel.r,min(texel.g,texel.b)));
  if(low>=whiteCutoff)a=0.0;a*=texel.a;
  vec3 straight=keyDewhite>0.5?clamp((texel.rgb-(1.0-a))/max(a,keyEpsilon),0.0,1.0):texel.rgb;
  return vec4(straight*a,a);
}
vec4 fetchFrameTexel(vec4 rect,vec2 size,vec2 pixel){
  if(any(lessThan(pixel,vec2(0.0)))||any(greaterThanEqual(pixel,size)))return vec4(0.0);
  vec2 uv=rect.xy+(pixel+0.5)/size*rect.zw;
  return premultiplyTexel(texture2D(map,uv));
}
vec4 readFrame(vec4 rect,vec2 size,vec2 anchor){
  vec2 local=localBounds.xy+vUv*localBounds.zw;
  vec2 source=anchor+vec2(sourceDirection.x*local.x-sourceDirection.y*local.y,
    sourceDirection.y*local.x+sourceDirection.x*local.y);
  vec2 sampleAt=source-0.5;vec2 base=floor(sampleAt);vec2 f=fract(sampleAt);
  vec4 top=mix(fetchFrameTexel(rect,size,base),fetchFrameTexel(rect,size,base+vec2(1.0,0.0)),f.x);
  vec4 bottom=mix(fetchFrameTexel(rect,size,base+vec2(0.0,1.0)),
    fetchFrameTexel(rect,size,base+vec2(1.0,1.0)),f.x);
  return mix(top,bottom,f.y);
}
void main(){
  vec4 texel;
  if(procedural>0.5){float d=length(vUv-vec2(.5));float a=smoothstep(.5,.12,d);texel=vec4(tint*a,a);}
  else texel=mix(readFrame(uvRectA,frameSizeA,anchorA),readFrame(uvRectB,frameSizeB,anchorB),frameMix);
  float mask=1.0;
  if(maskEnabled>0.5){float q=(localBounds.x+vUv.x*localBounds.z)/maskReferenceLength;
    float show=reveal<=0.0?0.0:reveal>=1.0?1.0:1.0-smoothstep(reveal-maskSoftness*.5,reveal+maskSoftness*.5,q);
    float hide=erase<=0.0?1.0:erase>=1.0?0.0:smoothstep(erase-maskSoftness*.5,erase+maskSoftness*.5,q);
    mask=show*hide;}
  texel.rgb=mix(texel.rgb,tint*texel.a,tintAmount);
  texel.rgb=min(texel.rgb*brightness,vec3(texel.a));
  gl_FragColor=texel*(opacity*mask);
}`;
const ACCENT_FRAGMENT = `
uniform vec3 tint; uniform float opacity; varying vec2 vUv;
void main(){float d=length(vUv-vec2(.5));float ring=smoothstep(.5,.43,d)*smoothstep(.34,.41,d);
  float alpha=ring*opacity;gl_FragColor=vec4(tint*alpha,alpha);}`;
const DISPLAY_FRAGMENT = `
uniform sampler2D rendered; varying vec2 vUv;
void main(){vec4 c=texture2D(rendered,vUv);float a=c.a;
  if(a>0.0)c.rgb/=a;
  vec3 lo=c.rgb*12.92;vec3 hi=1.055*pow(max(c.rgb,vec3(0.0)),vec3(1.0/2.4))-0.055;
  c.rgb=mix(lo,hi,step(vec3(0.0031308),c.rgb))*a;gl_FragColor=c;}`;

interface Sprite {
  readonly root: Scene; readonly effect: Mesh<PlaneGeometry, ShaderMaterial>;
  readonly emitter: Mesh<PlaneGeometry, ShaderMaterial>; readonly ghosts: Mesh<PlaneGeometry, ShaderMaterial>[];
  readonly accents: Mesh<PlaneGeometry, ShaderMaterial>[];
  startedAt: number; durationMs: number; generation: number; request: VfxPlayRequest | null;
  plan: VfxAssetPlan | null; fromX: number; fromY: number; toX: number; toY: number; angle: number;
  viewportWidth: number; viewportHeight: number;
  readonly accentX: Float32Array; readonly accentY: Float32Array;
  readonly timeline: TimelineScratch; readonly uvA: Float32Array; readonly uvB: Float32Array;
  readonly bounds: Float32Array; readonly displayScale: Float32Array;
  snapshotTexture: Texture | undefined; snapshotSize: readonly [number, number] | undefined;
  snapshotOffset: readonly [number, number] | undefined;
  snapshotCanvas: HTMLCanvasElement | undefined;
}

function spriteMaterial(fragmentShader = SPRITE_FRAGMENT): ShaderMaterial {
  return new ShaderMaterial({ vertexShader: VERTEX, fragmentShader, transparent: true,
    premultipliedAlpha: true, depthTest: false, depthWrite: false, side: DoubleSide, forceSinglePass: true, toneMapped: false,
    uniforms: { map: { value: null }, uvRectA: { value: new Vector4(0, 0, 1, 1) },
      uvRectB: { value: new Vector4(0, 0, 1, 1) }, frameMix: { value: 0 },
      frameSizeA: { value: new Vector2(1, 1) }, frameSizeB: { value: new Vector2(1, 1) },
      anchorA: { value: new Vector2(0, 0) }, anchorB: { value: new Vector2(0, 0) },
      localBounds: { value: new Vector4(0, 0, 1, 1) }, sourceDirection: { value: new Vector2(1, 0) },
      tint: { value: new Color('#ffffff') }, opacity: { value: 0 }, tintAmount: { value: 0 }, brightness: { value: 1 },
      keyEnabled: { value: 0 }, keyMethod: { value: 0 }, whiteCutoff: { value: 250 / 255 },
      opaqueLuma: { value: 0.2 }, keyFull: { value: 100 / 255 }, keyEpsilon: { value: 1 / 255 },
      keyDewhite: { value: 1 }, procedural: { value: 0 }, maskEnabled: { value: 0 },
      maskSoftness: { value: 0.08 }, reveal: { value: 1 }, erase: { value: 0 },
      maskReferenceLength: { value: 1 } },
    blending: CustomBlending, blendEquation: AddEquation, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor,
    blendEquationAlpha: AddEquation, blendSrcAlpha: OneFactor, blendDstAlpha: OneMinusSrcAlphaFactor });
}

function displayMaterial(rendered: Texture): ShaderMaterial {
  return new ShaderMaterial({ vertexShader: VERTEX, fragmentShader: DISPLAY_FRAGMENT,
    uniforms: { rendered: { value: rendered } }, depthTest: false, depthWrite: false,
    transparent: true, premultipliedAlpha: true, blending: NoBlending, toneMapped: false });
}

function createSprite(geometry: PlaneGeometry): Sprite {
  const root = new Scene();
  const effect = new Mesh(geometry, spriteMaterial()); const emitter = new Mesh(geometry, spriteMaterial());
  effect.renderOrder = 2; emitter.renderOrder = 1; root.add(emitter, effect);
  const ghosts = Array.from({ length: MAX_GHOSTS }, (_, index) => {
    const mesh = new Mesh(geometry, spriteMaterial()); mesh.renderOrder = -index; root.add(mesh); return mesh;
  });
  const accents = Object.keys(ACCENT_COLORS).map((accent, index) => {
    const mesh = new Mesh(geometry, spriteMaterial(ACCENT_FRAGMENT)); mesh.renderOrder = 10 + index; root.add(mesh); return mesh;
  });
  return { root, effect, emitter, ghosts, accents, startedAt: 0, durationMs: 0, generation: 0,
    request: null, plan: null, fromX: 0, fromY: 0, toX: 0, toY: 0, angle: 0, viewportWidth: 1, viewportHeight: 1,
    accentX: new Float32Array(4), accentY: new Float32Array(4), timeline: createTimelineScratch(),
    uvA: new Float32Array(6), uvB: new Float32Array(6), bounds: new Float32Array(4),
    displayScale: new Float32Array(2), snapshotTexture: undefined,
    snapshotSize: undefined, snapshotOffset: undefined, snapshotCanvas: undefined };
}

function resetSprite(sprite: Sprite): void {
  sprite.generation += 1; sprite.request = null; sprite.plan = null;
  sprite.snapshotSize = undefined; sprite.snapshotOffset = undefined;
  sprite.effect.visible = false; sprite.emitter.visible = false;
  for (const mesh of sprite.ghosts) mesh.visible = false;
  for (const mesh of sprite.accents) mesh.visible = false;
}

function assetUrl(base: string | undefined, file: string | undefined): string | undefined {
  if (!base || !file || file.includes('\\')) return undefined;
  const result = new URL(file, `https://vfx.invalid${base}`);
  if (result.origin !== 'https://vfx.invalid' || !result.pathname.startsWith('/assets/default/')) return undefined;
  return result.pathname;
}

interface LoadedSpriteTextures { readonly effect?: Texture; readonly emitter?: Texture; readonly missing: boolean }
async function loadSpriteTextures(plan: VfxAssetPlan, store: Pick<VfxTextureStore, 'load'>): Promise<LoadedSpriteTextures> {
  const source = plan.composition.effect?.source?.files[0]
    ?? plan.composition.effect?.frames[0]?.file;
  const effectUrl = assetUrl(plan.effectBaseUrl, source);
  const emitterUrl = assetUrl(plan.emitterBaseUrl, plan.composition.emitter?.file);
  let missing = (!effectUrl && Boolean(plan.composition.effect)) || (!emitterUrl && Boolean(plan.composition.emitter));
  const safeLoad = (url: string | undefined) => url ? store.load(url).catch(() => { missing = true; return undefined; }) : undefined;
  const [effect, emitter] = await Promise.all([safeLoad(effectUrl), safeLoad(emitterUrl)]);
  if (effectUrl && !effect) missing = true;
  if (emitterUrl && !emitter) missing = true;
  return { ...(effect ? { effect } : {}), ...(emitter ? { emitter } : {}), missing };
}

function setBlend(material: ShaderMaterial, mode: VfxEffect['blend'] | undefined): void {
  const source = mode === 'multiply' ? DstColorFactor : OneFactor;
  const destination = mode === 'lighter' ? OneFactor
    : mode === 'screen' ? OneMinusSrcColorFactor : OneMinusSrcAlphaFactor;
  if (material.blending === CustomBlending && material.blendSrc === source && material.blendDst === destination) return;
  material.blending = CustomBlending; material.blendSrc = source; material.blendDst = destination;
  material.needsUpdate = true;
}

function uvForInto(texture: Texture, plan: VfxAssetPlan, frameIndex: number, output: Float32Array): void {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const source = plan.composition.effect?.source; const rect = source?.rects[frameIndex]?.rect_px;
  const width = Math.max(1, image?.width ?? plan.composition.effect?.size_px[0] ?? 1);
  const height = Math.max(1, image?.height ?? plan.composition.effect?.size_px[1] ?? 1);
  const frameWidth = rect?.[2] ?? width; const frameHeight = rect?.[3] ?? height;
  output[0] = (rect?.[0] ?? 0) / width; output[1] = (rect?.[1] ?? 0) / height;
  output[2] = frameWidth / width; output[3] = frameHeight / height;
  output[4] = frameWidth; output[5] = frameHeight;
}

/** Union of every root-aligned frame in the effect's own direction basis. */
function effectLocalBoundsInto(effect: VfxEffect, output: Float32Array): void {
  const [width, height] = effect.size_px; const [dx, dy] = effect.direction;
  let left = Infinity; let top = Infinity; let right = -Infinity; let bottom = -Infinity;
  for (const frame of effect.frames) for (let corner = 0; corner < 4; corner += 1) {
    const x = corner & 1 ? width : 0; const y = corner & 2 ? height : 0;
    const px = x - frame.anchor_px[0]; const py = y - frame.anchor_px[1];
    const localX = dx * px + dy * py; const localY = -dy * px + dx * py;
    if (localX < left) left = localX; if (localX > right) right = localX;
    if (localY < top) top = localY; if (localY > bottom) bottom = localY;
  }
  output[0] = left; output[1] = top; output[2] = right - left; output[3] = bottom - top;
}

export function effectLocalBounds(effect: VfxEffect): readonly [number, number, number, number] {
  const output = new Float32Array(4); effectLocalBoundsInto(effect, output);
  return [output[0]!, output[1]!, output[2]!, output[3]!];
}

function setFullFrame(material: ShaderMaterial, width: number, height: number): void {
  (material.uniforms['uvRectA']!.value as Vector4).set(0, 0, 1, 1);
  (material.uniforms['uvRectB']!.value as Vector4).set(0, 0, 1, 1);
  (material.uniforms['frameSizeA']!.value as Vector2).set(width, height);
  (material.uniforms['frameSizeB']!.value as Vector2).set(width, height);
  (material.uniforms['anchorA']!.value as Vector2).set(0, 0);
  (material.uniforms['anchorB']!.value as Vector2).set(0, 0);
  (material.uniforms['localBounds']!.value as Vector4).set(0, 0, width, height);
  (material.uniforms['sourceDirection']!.value as Vector2).set(1, 0);
  material.uniforms['frameMix']!.value = 0; material.uniforms['keyEnabled']!.value = 0;
}

function updateEffect(sprite: Sprite, elapsed: number, textures: Readonly<{ effect?: Texture; emitter?: Texture }>): void {
  const plan = sprite.plan!; const composition = plan.composition;
  const state = sprite.timeline; sampleTimelineInto(composition, elapsed / 1000, state);
  const progress = Math.min(1, elapsed / sprite.durationMs);
  const effect = sprite.effect; const effectMaterial = effect.material; const effectTexture = textures.effect;
  effectMaterial.uniforms['procedural']!.value = 0;
  if (effectTexture && composition.effect) {
    const first = sprite.uvA; const second = sprite.uvB;
    uvForInto(effectTexture, plan, state.frameIndex, first); uvForInto(effectTexture, plan, state.nextFrameIndex, second);
    (effectMaterial.uniforms['uvRectA']!.value as Vector4).set(first[0]!, first[1]!, first[2]!, first[3]!);
    (effectMaterial.uniforms['uvRectB']!.value as Vector4).set(second[0]!, second[1]!, second[2]!, second[3]!);
    effectMaterial.uniforms['map']!.value = effectTexture; effectMaterial.uniforms['frameMix']!.value = state.mix;
    const frame = composition.effect.frames[state.frameIndex]!;
    const nextFrame = composition.effect.frames[state.nextFrameIndex]!;
    (effectMaterial.uniforms['frameSizeA']!.value as Vector2).set(first[4]!, first[5]!);
    (effectMaterial.uniforms['frameSizeB']!.value as Vector2).set(second[4]!, second[5]!);
    (effectMaterial.uniforms['anchorA']!.value as Vector2).fromArray(frame.anchor_px);
    (effectMaterial.uniforms['anchorB']!.value as Vector2).fromArray(nextFrame.anchor_px);
    const bounds = sprite.bounds;
    (effectMaterial.uniforms['localBounds']!.value as Vector4).set(bounds[0]!, bounds[1]!, bounds[2]!, bounds[3]!);
    (effectMaterial.uniforms['sourceDirection']!.value as Vector2).fromArray(composition.effect.direction);
    const displayDistance = Math.max(56, Math.hypot(sprite.toX - sprite.fromX, sprite.toY - sprite.fromY));
    effectDisplayScaleInto(composition, displayDistance, sprite.displayScale);
    const lengthScale = sprite.displayScale[0]!; const widthScale = sprite.displayScale[1]!;
    const authoredLength = composition.length_px ?? composition.range_hex * composition.pixels_per_hex;
    const drift = state.driftPx * displayDistance / Math.max(1, authoredLength);
    const cosine = Math.cos(sprite.angle); const sine = Math.sin(sprite.angle);
    const baseX = sprite.fromX + cosine * drift; const baseY = sprite.fromY + sine * drift;
    const localX = (bounds[0]! + bounds[2]! / 2) * lengthScale * state.scale;
    const localY = (bounds[1]! + bounds[3]! / 2) * widthScale * state.scale;
    effect.position.set(baseX + cosine * localX - sine * localY, baseY + sine * localX + cosine * localY, 2);
    effect.rotation.z = sprite.angle; effect.scale.set(bounds[2]! * lengthScale * state.scale,
      bounds[3]! * widthScale * state.scale, 1);
    effect.visible = true;
    effectMaterial.uniforms['opacity']!.value = state.alpha; effectMaterial.uniforms['brightness']!.value = state.brightness;
    effectMaterial.uniforms['tint']!.value.set(plan.resolved.color);
    effectMaterial.uniforms['tintAmount']!.value = composition.template?.mode === 'qi_projection' ? 1 : 0;
    const keying = composition.effect.source?.keying; effectMaterial.uniforms['keyEnabled']!.value = keying ? 1 : 0;
    effectMaterial.uniforms['keyMethod']!.value = keying?.method === 'white_luma' ? 1 : 0;
    effectMaterial.uniforms['whiteCutoff']!.value = (keying?.white_cutoff_8bit ?? 250) / 255;
    effectMaterial.uniforms['opaqueLuma']!.value = keying?.opaque_luma ?? 0.2;
    effectMaterial.uniforms['keyFull']!.value = (keying?.key_full_8bit ?? 100) / 255;
    effectMaterial.uniforms['keyEpsilon']!.value = keying?.epsilon ?? 1 / 255;
    effectMaterial.uniforms['keyDewhite']!.value = keying?.dewhite === false ? 0 : 1;
    effectMaterial.uniforms['maskEnabled']!.value = state.maskEnabled ? 1 : 0;
    effectMaterial.uniforms['maskSoftness']!.value = state.maskSoftness;
    effectMaterial.uniforms['reveal']!.value = state.reveal; effectMaterial.uniforms['erase']!.value = state.erase;
    effectMaterial.uniforms['maskReferenceLength']!.value = Math.max(1, composition.effect.reference_length_px);
    setBlend(effectMaterial, composition.template?.mode === 'plain_strike' ? 'normal' : composition.effect.blend);
  } else if (composition.template?.mode !== 'afterimage') {
    effect.position.set(sprite.toX, sprite.toY, 2); effect.rotation.z = sprite.angle; effect.scale.set(32, 32, 1); effect.visible = true;
    effectMaterial.uniforms['procedural']!.value = 1; effectMaterial.uniforms['opacity']!.value = state.alpha;
    effectMaterial.uniforms['tint']!.value.set(plan.resolved.color); effectMaterial.uniforms['tintAmount']!.value = 1;
  } else effect.visible = false;
  updateEmitter(sprite, state.alpha, textures.emitter);
  if (sprite.snapshotTexture && sprite.snapshotSize && sprite.snapshotOffset) updateActorGhosts(sprite, state);
  else updateFallbackGhosts(sprite, state);
  updateAccents(sprite, progress);
}

function updateEmitter(sprite: Sprite, alpha: number, texture: Texture | undefined): void {
  const composition = sprite.plan!.composition; const emitter = composition.emitter; const mesh = sprite.emitter;
  if (!texture || !emitter) { mesh.visible = false; return; }
  const material = mesh.material; material.uniforms['procedural']!.value = 0; material.uniforms['map']!.value = texture;
  setFullFrame(material, emitter.size_px[0], emitter.size_px[1]); material.uniforms['opacity']!.value = alpha * 0.7;
  const scale = composition.emitter_scale * EMITTER_DISPLAY_SCALE;
  const angle = sprite.angle - Math.atan2(emitter.direction[1], emitter.direction[0]);
  const offsetX = (emitter.size_px[0] / 2 - emitter.emit_point_px[0]) * scale;
  const offsetY = (emitter.size_px[1] / 2 - emitter.emit_point_px[1]) * scale;
  mesh.position.set(sprite.fromX + Math.cos(angle) * offsetX - Math.sin(angle) * offsetY,
    sprite.fromY + Math.sin(angle) * offsetX + Math.cos(angle) * offsetY, 1); mesh.rotation.z = angle;
  mesh.scale.set(emitter.size_px[0] * scale, emitter.size_px[1] * scale, 1); mesh.visible = true;
}

function updateActorGhosts(sprite: Sprite, poses: TimelineScratch): void {
  const texture = sprite.snapshotTexture; const size = sprite.snapshotSize; const offset = sprite.snapshotOffset;
  if (!texture || !size || !offset) return;
  const image = texture.image as { readonly width: number; readonly height: number };
  const width = image.width; const height = image.height;
  for (let index = 0; index < sprite.ghosts.length; index += 1) {
    const mesh = sprite.ghosts[index]!;
    if (index >= poses.ghostCount) { mesh.visible = false; continue; }
    mesh.material.uniforms['procedural']!.value = 0; mesh.material.uniforms['map']!.value = texture;
    setFullFrame(mesh.material, width, height); mesh.material.uniforms['opacity']!.value = poses.ghostAlpha[index]!;
    const trail = poses.ghostOffset[index]!;
    mesh.position.set(sprite.fromX + Math.cos(sprite.angle) * trail + offset[0],
      sprite.fromY + Math.sin(sprite.angle) * trail + offset[1], 0);
    mesh.rotation.z = 0; mesh.scale.set(size[0] * poses.ghostStretch[index]!, size[1], 1); mesh.visible = true;
  }
}

function copySnapshot(source: HTMLCanvasElement, canvas = document.createElement('canvas')): HTMLCanvasElement {
  if (canvas.width !== source.width) canvas.width = source.width;
  if (canvas.height !== source.height) canvas.height = source.height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('VFX_SNAPSHOT_CANVAS_UNAVAILABLE');
  context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(source, 0, 0); return canvas;
}

function updateFallbackGhosts(sprite: Sprite, poses: TimelineScratch): void {
  for (let index = 0; index < sprite.ghosts.length; index += 1) {
    const mesh = sprite.ghosts[index]!;
    if (index >= poses.ghostCount) { mesh.visible = false; continue; }
    mesh.position.set(sprite.fromX + Math.cos(sprite.angle) * poses.ghostOffset[index]!,
      sprite.fromY + Math.sin(sprite.angle) * poses.ghostOffset[index]!, 0);
    mesh.rotation.z = sprite.angle; mesh.scale.set(20 * poses.ghostStretch[index]!, 34, 1);
    mesh.material.uniforms['procedural']!.value = 1; mesh.material.uniforms['tint']!.value.set(sprite.plan!.resolved.color);
    mesh.material.uniforms['opacity']!.value = poses.ghostAlpha[index]!; mesh.visible = true;
  }
}

function accentMarker(request: VfxPlayRequest, accent: VfxAccent, index: number) {
  const eventTarget = accent === 'hit' ? request.accentTargets?.hit
    : accent === 'repel' ? request.accentTargets?.repel
      : accent === 'foreign-qi' ? request.accentTargets?.['foreign-qi'] : request.accentTargets?.acupoint;
  return eventTarget ?? request.targets[index % Math.max(1, request.targets.length)] ?? request.from;
}

function updateAccents(sprite: Sprite, progress: number): void {
  const request = sprite.request!;
  for (let index = 0; index < sprite.accents.length; index += 1) {
    const mesh = sprite.accents[index]!; const accent = request.accents[index];
    if (!accent) { mesh.visible = false; continue; }
    const size = 28 + index * 12 + progress * 44;
    mesh.position.set(sprite.accentX[index]!, sprite.accentY[index]! - 24, 4); mesh.scale.set(size, size, 1);
    mesh.material.uniforms['tint']!.value.set(ACCENT_COLORS[accent]);
    mesh.material.uniforms['opacity']!.value = (1 - progress) * 0.9; mesh.visible = true;
  }
}

function project(marker: VfxPlayRequest['from'], width: number, height: number): { x: number; y: number } {
  return { x: width * (0.5 + (marker.q + marker.r * 0.5) * 0.105),
    y: height * (0.45 - marker.r * 0.085 + marker.height * 0.025) };
}

/** One transparent Three.js renderer, shared textures/geometry and a bounded 48-slot pool. */
export function createBattleVfxStage(canvas: HTMLCanvasElement, options: RecoverableVfxStageOptions = {}): RecoverableVfxStage {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0); renderer.autoClear = true;
  const quality = options.quality ?? getDefaultRenderQuality();
  const scene = new Scene(); const camera = new OrthographicCamera(0, 1, 0, 1, -10, 10);
  camera.position.z = 5; const geometry = new PlaneGeometry(1, 1);
  const target = new WebGLRenderTarget(1, 1, {
    type: renderer.extensions.has('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType,
    colorSpace: LinearSRGBColorSpace, minFilter: NearestFilter, magFilter: NearestFilter,
    depthBuffer: false, stencilBuffer: false,
  });
  const displayScene = new Scene(); const display = new Mesh(geometry, displayMaterial(target.texture));
  display.position.set(0.5, 0.5, 0); displayScene.add(display);
  const textures = options.textureStore ?? new VfxTextureStore(); const assets = options.assetStore ?? new VfxAssetStore();
  const live = new Set<Sprite>(); const texturePlans = new WeakMap<Sprite, LoadedSpriteTextures>();
  let allocated = 0;
  const pool = new ObjectPool<Sprite>(MAX_ACTIVE, () => { allocated += 1; return createSprite(geometry); }, resetSprite);
  const stats = { active: 0, pooled: 0, textures: 0, fallbacks: 0, drawCalls: 0, particles: 0, cpuMs: 0 };
  const warnedTextures = new Set<string>();
  let disposed = false; let width = 1; let height = 1; let deviceDpr = 1;
  let appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
  const now = options.now ?? (() => performance.now());
  let projector: VfxProjector | undefined; const projected = { x: 0, y: 0, visible: true };
  const contextGuard = createContextGuard(canvas, renderer, {
    onStateChange: (state) => { quality.invalidateSamples?.(now()); options.onContextStateChange?.(state); },
    onLoss: (count) => { quality.reportContextLoss?.(); options.onContextLoss?.(count); },
    onRecreate: options.onContextRecreate,
    onFatal: options.onContextFatal,
    onRestore: () => {
      target.dispose();
      target.setSize(Math.ceil(width * renderer.getPixelRatio()), Math.ceil(height * renderer.getPixelRatio()));
      display.material.uniforms['rendered']!.value = target.texture;
      display.material.needsUpdate = true;
      for (const sprite of live) {
        const loaded = texturePlans.get(sprite);
        if (loaded?.effect) loaded.effect.needsUpdate = true;
        if (loaded?.emitter) loaded.emitter.needsUpdate = true;
        if (sprite.snapshotTexture) sprite.snapshotTexture.needsUpdate = true;
        for (const mesh of [sprite.effect, sprite.emitter, ...sprite.ghosts, ...sprite.accents])
          mesh.material.needsUpdate = true;
      }
    },
    requestFrame: options.requestFrame,
  });
  function map(marker: VfxPlayRequest['from']): { x: number; y: number } {
    if (!projector) return project(marker, width, height);
    projector(marker.q, marker.r, marker.height, projected); return { x: projected.x, y: projected.y };
  }
  function place(sprite: Sprite): void {
    const request = sprite.request; if (!request) return;
    const from = map(request.from); const target = request.targets[0] ? map(request.targets[0]) : from;
    sprite.fromX = from.x; sprite.fromY = from.y; sprite.toX = target.x; sprite.toY = target.y;
    sprite.angle = Math.atan2(target.y - from.y, target.x - from.x);
    sprite.viewportWidth = width; sprite.viewportHeight = height;
    for (let index = 0; index < sprite.accents.length; index += 1) {
      const accent = request.accents[index];
      const marker = accent ? accentMarker(request, accent, index) : request.from; const point = map(marker);
      sprite.accentX[index] = point.x; sprite.accentY[index] = point.y;
    }
  }

  function resize(nextWidth = canvas.clientWidth, nextHeight = canvas.clientHeight, pixelRatio = devicePixelRatio): void {
    if (disposed) return;
    width = Math.max(1, nextWidth); height = Math.max(1, nextHeight);
    quality.markSizeChanged?.(performance.now());
    deviceDpr = pixelRatio; appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
    camera.left = 0; camera.right = width; camera.top = 0; camera.bottom = height; camera.updateProjectionMatrix();
    contextGuard.resize(width, height, appliedPixelRatio);
    target.setSize(Math.ceil(width * renderer.getPixelRatio()), Math.ceil(height * renderer.getPixelRatio()));
    display.position.set(width / 2, height / 2, 0); display.scale.set(width, height, 1);
    for (const sprite of live) place(sprite);
  }
  function releaseOldest(): void {
    let oldest: Sprite | undefined;
    for (const candidate of live) if (!oldest || candidate.startedAt < oldest.startedAt) oldest = candidate;
    if (!oldest) return;
    live.delete(oldest); scene.remove(oldest.root); pool.release(oldest);
  }
  function activeLimit(): number {
    return Math.min(MAX_ACTIVE, QUALITY_TIERS[quality.tier].vfxDrawCalls);
  }
  function enforceActiveLimit(allowOneMore = false): void {
    const limit = activeLimit() - (allowOneMore ? 1 : 0);
    while (live.size > limit) releaseOldest();
  }
  async function play(request: VfxPlayRequest) {
    if (disposed) throw new Error('VFX_STAGE_DISPOSED');
    quality.invalidateSamples?.(now());
    const plan = await assets.load(request.moveId, request.nature);
    if (disposed) throw new Error('VFX_PLAY_CANCELLED');
    const loaded = await loadSpriteTextures(plan, textures);
    if (disposed) throw new Error('VFX_PLAY_CANCELLED');
    let snapshot: ReturnType<NonNullable<VfxPlayRequest['actorSnapshot']>>;
    try { snapshot = plan.resolved.mode === 'afterimage' ? request.actorSnapshot?.() : undefined; }
    catch { snapshot = undefined; }
    let sourceMissing = plan.resolved.mode === 'afterimage' && !snapshot;
    let sprite: Sprite;
    enforceActiveLimit(true);
    try { sprite = pool.acquire(); } catch { releaseOldest(); sprite = pool.acquire(); }
    const generation = sprite.generation;
    try {
      if (disposed || generation !== sprite.generation) throw new Error('VFX_PLAY_CANCELLED');
      sprite.request = request; sprite.plan = plan; sprite.startedAt = now();
      if (plan.composition.effect) effectLocalBoundsInto(plan.composition.effect, sprite.bounds);
      if (snapshot) {
        try {
          sprite.snapshotCanvas = copySnapshot(snapshot.image, sprite.snapshotCanvas);
          sprite.snapshotTexture ??= new CanvasTexture(sprite.snapshotCanvas);
          sprite.snapshotTexture.image = sprite.snapshotCanvas; sprite.snapshotTexture.colorSpace = SRGBColorSpace;
          sprite.snapshotTexture.flipY = false; sprite.snapshotTexture.premultiplyAlpha = false;
          sprite.snapshotTexture.needsUpdate = true;
          sprite.snapshotSize = snapshot.sizePx; sprite.snapshotOffset = snapshot.centerOffsetPx;
        } catch { snapshot = undefined; sourceMissing = true; }
      }
      if (!snapshot) { sprite.snapshotSize = undefined; sprite.snapshotOffset = undefined; }
      sprite.durationMs = request.reducedMotion ? 1 : plan.resolved.durationMs; place(sprite);
      texturePlans.set(sprite, loaded); live.add(sprite); scene.add(sprite.root);
      if (plan.resolved.fallback || loaded.missing || sourceMissing) stats.fallbacks += 1;
      stats.active = live.size; stats.textures = textures.size;
      if (loaded.missing && !warnedTextures.has(request.moveId)) { warnedTextures.add(request.moveId);
        console.warn(`[VFX] ${request.moveId} texture missing; procedural fallback used`); }
      if (sourceMissing && !warnedTextures.has(`${request.moveId}:actor`)) { warnedTextures.add(`${request.moveId}:actor`);
        console.warn(`[VFX] ${request.moveId} actor snapshot missing; procedural afterimage used`); }
      return { durationMs: sprite.durationMs, fallback: plan.resolved.fallback || loaded.missing || sourceMissing };
    } catch (failure) { pool.release(sprite); throw failure; }
  }
  function render(timeMs: number): void {
    if (!contextGuard.canRender) return;
    const started = now();
    enforceActiveLimit();
    const nextPixelRatio = quality.effectivePixelRatio(deviceDpr);
    if (nextPixelRatio !== appliedPixelRatio) {
      appliedPixelRatio = nextPixelRatio; contextGuard.resize(width, height, appliedPixelRatio);
      target.setSize(Math.ceil(width * appliedPixelRatio), Math.ceil(height * appliedPixelRatio));
    }
    for (const sprite of live) {
      const elapsed = Math.max(0, timeMs - sprite.startedAt);
      if (elapsed >= sprite.durationMs) { live.delete(sprite); scene.remove(sprite.root); pool.release(sprite); continue; }
      updateEffect(sprite, elapsed, texturePlans.get(sprite)!);
    }
    // Reserve the display pass, keep hit feedback first, then the main effect, then decoration.
    const tier = QUALITY_TIERS[quality.tier];
    let remaining = tier.vfxDrawCalls - 1;
    let particles = tier.particles;
    for (const sprite of live) for (const mesh of sprite.accents) {
      if (!mesh.visible) continue;
      mesh.visible = remaining > 0; if (mesh.visible) remaining -= 1;
    }
    for (const sprite of live) {
      if (sprite.effect.visible) {
        sprite.effect.visible = remaining > 0; if (sprite.effect.visible) remaining -= 1;
      }
      if (sprite.emitter.visible) {
        sprite.emitter.visible = remaining > 0; if (sprite.emitter.visible) remaining -= 1;
      }
      const ghostLimit = Math.ceil(sprite.timeline.ghostCount * tier.particleScale);
      for (let index = 0; index < sprite.ghosts.length; index += 1) {
        const mesh = sprite.ghosts[index]!;
        mesh.visible = mesh.visible && index < ghostLimit && remaining > 0 && particles > 0;
        if (mesh.visible) { remaining -= 1; particles -= 1; }
      }
    }
    stats.drawCalls = tier.vfxDrawCalls - remaining;
    stats.particles = tier.particles - particles;
    renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(displayScene, camera);
    stats.active = live.size; stats.pooled = allocated - live.size; stats.textures = textures.size;
    stats.cpuMs = now() - started;
  }
  resize();
  return { stats, get contextState() { return contextGuard.state; },
    play, setProjector(next) { projector = next; for (const sprite of live) place(sprite); }, resize, render, dispose() {
    if (disposed) return; disposed = true;
    contextGuard.dispose();
    for (const sprite of live) scene.remove(sprite.root); live.clear();
    pool.dispose(sprite => {
      sprite.snapshotTexture?.dispose();
      for (const mesh of [sprite.effect, sprite.emitter, ...sprite.ghosts, ...sprite.accents]) mesh.material.dispose();
    });
    textures.dispose(); display.material.dispose(); target.dispose(); geometry.dispose();
    renderer.forceContextLoss(); renderer.dispose();
  } };
}

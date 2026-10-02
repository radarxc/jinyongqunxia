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
import { sampleTimeline } from './timeline';
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

export function effectDisplayScale(composition: VfxComposition, distancePx: number): readonly [number, number] {
  const effect = composition.effect;
  if (!effect) return [1, 1];
  const length = Math.max(56, distancePx) / Math.max(1, effect.reference_length_px) * composition.scale[0];
  const width = composition.emitter
    ? composition.emitter_scale * composition.emitter.emission_width_px
      * EMITTER_DISPLAY_SCALE / Math.max(1, effect.root_width_px) * composition.scale[1]
    : length * composition.scale[1];
  return [length, width];
}

/** Allocation-free portion of one frame; exported for the desktop performance gate. */
export function sampleVfxBatchFrame(compositions: readonly VfxComposition[], timeSeconds: number, output: Float32Array): void {
  if (output.length < compositions.length * ATTRIBUTE_SIZE) throw new Error('VFX_FRAME_BUFFER_TOO_SMALL');
  for (let index = 0; index < compositions.length; index += 1) {
    const state = sampleTimeline(compositions[index]!, timeSeconds); const offset = index * ATTRIBUTE_SIZE;
    output[offset] = state.alpha; output[offset + 1] = state.scale; output[offset + 2] = state.brightness;
    output[offset + 3] = state.mix; output[offset + 4] = state.driftPx;
    output[offset + 5] = state.mask.enabled ? 1 : 0; output[offset + 6] = state.mask.softness;
    output[offset + 7] = state.mask.reveal; output[offset + 8] = state.mask.erase;
    for (let ghost = 0; ghost < MAX_GHOSTS; ghost += 1) {
      const pose = state.ghosts?.[ghost]; const base = offset + ATTRIBUTE_SCALE + ghost;
      output[base] = pose?.alpha ?? 0;
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
  snapshotTexture: Texture | undefined; snapshotSize: readonly [number, number] | undefined;
  snapshotOffset: readonly [number, number] | undefined;
  snapshotCanvas: HTMLCanvasElement | undefined;
}

function spriteMaterial(fragmentShader = SPRITE_FRAGMENT): ShaderMaterial {
  return new ShaderMaterial({ vertexShader: VERTEX, fragmentShader, transparent: true,
    premultipliedAlpha: true, depthTest: false, depthWrite: false, side: DoubleSide, toneMapped: false,
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
    accentX: new Float32Array(4), accentY: new Float32Array(4), snapshotTexture: undefined,
    snapshotSize: undefined, snapshotOffset: undefined, snapshotCanvas: undefined };
}

function resetSprite(sprite: Sprite): void {
  sprite.generation += 1; sprite.request = null; sprite.plan = null;
  sprite.snapshotSize = undefined; sprite.snapshotOffset = undefined;
  for (const mesh of [sprite.effect, sprite.emitter, ...sprite.ghosts, ...sprite.accents]) mesh.visible = false;
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

function uvFor(texture: Texture, plan: VfxAssetPlan, frameIndex: number): { rect: readonly [number, number, number, number]; size: readonly [number, number] } {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const source = plan.composition.effect?.source; const rect = source?.rects[frameIndex]?.rect_px;
  const width = Math.max(1, image?.width ?? plan.composition.effect?.size_px[0] ?? 1);
  const height = Math.max(1, image?.height ?? plan.composition.effect?.size_px[1] ?? 1);
  const frameWidth = rect?.[2] ?? width; const frameHeight = rect?.[3] ?? height;
  return { rect: [(rect?.[0] ?? 0) / width, (rect?.[1] ?? 0) / height, frameWidth / width, frameHeight / height],
    size: [frameWidth, frameHeight] };
}

/** Union of every root-aligned frame in the effect's own direction basis. */
export function effectLocalBounds(effect: VfxEffect): readonly [number, number, number, number] {
  const [width, height] = effect.size_px; const [dx, dy] = effect.direction;
  let left = Infinity; let top = Infinity; let right = -Infinity; let bottom = -Infinity;
  const corners: readonly (readonly [number, number])[] = [[0, 0], [width, 0], [0, height], [width, height]];
  for (const frame of effect.frames) for (const [x, y] of corners) {
    const px = x - frame.anchor_px[0]; const py = y - frame.anchor_px[1];
    const localX = dx * px + dy * py; const localY = -dy * px + dx * py;
    left = Math.min(left, localX); right = Math.max(right, localX);
    top = Math.min(top, localY); bottom = Math.max(bottom, localY);
  }
  return [left, top, right - left, bottom - top];
}

function setFullFrame(material: ShaderMaterial, size: readonly [number, number]): void {
  (material.uniforms['uvRectA']!.value as Vector4).set(0, 0, 1, 1);
  (material.uniforms['uvRectB']!.value as Vector4).set(0, 0, 1, 1);
  (material.uniforms['frameSizeA']!.value as Vector2).fromArray(size);
  (material.uniforms['frameSizeB']!.value as Vector2).fromArray(size);
  (material.uniforms['anchorA']!.value as Vector2).set(0, 0);
  (material.uniforms['anchorB']!.value as Vector2).set(0, 0);
  (material.uniforms['localBounds']!.value as Vector4).set(0, 0, size[0], size[1]);
  (material.uniforms['sourceDirection']!.value as Vector2).set(1, 0);
  material.uniforms['frameMix']!.value = 0; material.uniforms['keyEnabled']!.value = 0;
}

function updateEffect(sprite: Sprite, elapsed: number, textures: Readonly<{ effect?: Texture; emitter?: Texture }>): void {
  const plan = sprite.plan!; const composition = plan.composition;
  const state = sampleTimeline(composition, elapsed / 1000);
  const progress = Math.min(1, elapsed / sprite.durationMs);
  const effect = sprite.effect; const effectMaterial = effect.material; const effectTexture = textures.effect;
  effectMaterial.uniforms['procedural']!.value = 0;
  if (effectTexture && composition.effect) {
    const first = uvFor(effectTexture, plan, state.frameIndex); const second = uvFor(effectTexture, plan, state.nextFrameIndex);
    (effectMaterial.uniforms['uvRectA']!.value as Vector4).fromArray(first.rect);
    (effectMaterial.uniforms['uvRectB']!.value as Vector4).fromArray(second.rect);
    effectMaterial.uniforms['map']!.value = effectTexture; effectMaterial.uniforms['frameMix']!.value = state.mix;
    const [frameWidth, frameHeight] = first.size; const [nextWidth, nextHeight] = second.size;
    const frame = composition.effect.frames[state.frameIndex]!;
    const nextFrame = composition.effect.frames[state.nextFrameIndex]!;
    (effectMaterial.uniforms['frameSizeA']!.value as Vector2).set(frameWidth, frameHeight);
    (effectMaterial.uniforms['frameSizeB']!.value as Vector2).set(nextWidth, nextHeight);
    (effectMaterial.uniforms['anchorA']!.value as Vector2).fromArray(frame.anchor_px);
    (effectMaterial.uniforms['anchorB']!.value as Vector2).fromArray(nextFrame.anchor_px);
    const bounds = effectLocalBounds(composition.effect);
    (effectMaterial.uniforms['localBounds']!.value as Vector4).fromArray(bounds);
    (effectMaterial.uniforms['sourceDirection']!.value as Vector2).fromArray(composition.effect.direction);
    const displayDistance = Math.max(56, Math.hypot(sprite.toX - sprite.fromX, sprite.toY - sprite.fromY));
    const [lengthScale, widthScale] = effectDisplayScale(composition, displayDistance);
    const authoredLength = composition.length_px ?? composition.range_hex * composition.pixels_per_hex;
    const drift = state.driftPx * displayDistance / Math.max(1, authoredLength);
    const baseX = sprite.fromX + Math.cos(sprite.angle) * drift;
    const baseY = sprite.fromY + Math.sin(sprite.angle) * drift;
    const placeEffect = (mesh: Mesh<PlaneGeometry, ShaderMaterial>) => {
      const localX = (bounds[0] + bounds[2] / 2) * lengthScale * state.scale;
      const localY = (bounds[1] + bounds[3] / 2) * widthScale * state.scale;
      mesh.position.set(baseX + Math.cos(sprite.angle) * localX - Math.sin(sprite.angle) * localY,
        baseY + Math.sin(sprite.angle) * localX + Math.cos(sprite.angle) * localY, 2);
      mesh.rotation.z = sprite.angle; mesh.scale.set(bounds[2] * lengthScale * state.scale,
        bounds[3] * widthScale * state.scale, 1);
    };
    placeEffect(effect);
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
    effectMaterial.uniforms['maskEnabled']!.value = state.mask.enabled ? 1 : 0;
    effectMaterial.uniforms['maskSoftness']!.value = state.mask.softness;
    effectMaterial.uniforms['reveal']!.value = state.mask.reveal;
    effectMaterial.uniforms['erase']!.value = state.mask.erase;
    effectMaterial.uniforms['maskReferenceLength']!.value = Math.max(1, composition.effect.reference_length_px);
    setBlend(effectMaterial, composition.template?.mode === 'plain_strike' ? 'normal' : composition.effect.blend);
  } else if (composition.template?.mode !== 'afterimage') {
    effect.position.set(sprite.toX, sprite.toY, 2); effect.rotation.z = sprite.angle; effect.scale.set(32, 32, 1); effect.visible = true;
    effectMaterial.uniforms['procedural']!.value = 1; effectMaterial.uniforms['opacity']!.value = state.alpha;
    effectMaterial.uniforms['tint']!.value.set(plan.resolved.color); effectMaterial.uniforms['tintAmount']!.value = 1;
  } else effect.visible = false;
  updateEmitter(sprite, state.alpha, textures.emitter);
  if (sprite.snapshotTexture && sprite.snapshotSize && sprite.snapshotOffset) updateActorGhosts(sprite, state.ghosts);
  else updateFallbackGhosts(sprite, state.ghosts);
  updateAccents(sprite, progress);
}

function updateEmitter(sprite: Sprite, alpha: number, texture: Texture | undefined): void {
  const composition = sprite.plan!.composition; const emitter = composition.emitter; const mesh = sprite.emitter;
  if (!texture || !emitter) { mesh.visible = false; return; }
  const material = mesh.material; material.uniforms['procedural']!.value = 0; material.uniforms['map']!.value = texture;
  setFullFrame(material, emitter.size_px); material.uniforms['opacity']!.value = alpha * 0.7;
  const scale = composition.emitter_scale * EMITTER_DISPLAY_SCALE;
  const angle = sprite.angle - Math.atan2(emitter.direction[1], emitter.direction[0]);
  const offsetX = (emitter.size_px[0] / 2 - emitter.emit_point_px[0]) * scale;
  const offsetY = (emitter.size_px[1] / 2 - emitter.emit_point_px[1]) * scale;
  mesh.position.set(sprite.fromX + Math.cos(angle) * offsetX - Math.sin(angle) * offsetY,
    sprite.fromY + Math.sin(angle) * offsetX + Math.cos(angle) * offsetY, 1); mesh.rotation.z = angle;
  mesh.scale.set(emitter.size_px[0] * scale, emitter.size_px[1] * scale, 1); mesh.visible = true;
}

function updateActorGhosts(sprite: Sprite, poses: ReturnType<typeof sampleTimeline>['ghosts']): void {
  const texture = sprite.snapshotTexture; const size = sprite.snapshotSize; const offset = sprite.snapshotOffset;
  if (!texture || !size || !offset) return;
  const image = texture.image as { readonly width: number; readonly height: number };
  const width = image.width; const height = image.height;
  for (let index = 0; index < sprite.ghosts.length; index += 1) {
    const mesh = sprite.ghosts[index]!; const pose = poses?.[index];
    if (!pose) { mesh.visible = false; continue; }
    mesh.material.uniforms['procedural']!.value = 0; mesh.material.uniforms['map']!.value = texture;
    setFullFrame(mesh.material, [width, height]); mesh.material.uniforms['opacity']!.value = pose.alpha;
    const trail = pose.offsetPx;
    mesh.position.set(sprite.fromX + Math.cos(sprite.angle) * trail + offset[0],
      sprite.fromY + Math.sin(sprite.angle) * trail + offset[1], 0);
    mesh.rotation.z = 0; mesh.scale.set(size[0] * pose.stretch, size[1], 1); mesh.visible = true;
  }
}

function copySnapshot(source: HTMLCanvasElement, canvas = document.createElement('canvas')): HTMLCanvasElement {
  if (canvas.width !== source.width) canvas.width = source.width;
  if (canvas.height !== source.height) canvas.height = source.height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('VFX_SNAPSHOT_CANVAS_UNAVAILABLE');
  context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(source, 0, 0); return canvas;
}

function updateFallbackGhosts(sprite: Sprite, poses: ReturnType<typeof sampleTimeline>['ghosts']): void {
  for (let index = 0; index < sprite.ghosts.length; index += 1) {
    const mesh = sprite.ghosts[index]!; const pose = poses?.[index];
    if (!pose) { mesh.visible = false; continue; }
    mesh.position.set(sprite.fromX + Math.cos(sprite.angle) * pose.offsetPx,
      sprite.fromY + Math.sin(sprite.angle) * pose.offsetPx, 0);
    mesh.rotation.z = sprite.angle; mesh.scale.set(20 * pose.stretch, 34, 1);
    mesh.material.uniforms['procedural']!.value = 1; mesh.material.uniforms['tint']!.value.set(sprite.plan!.resolved.color);
    mesh.material.uniforms['opacity']!.value = pose.alpha; mesh.visible = true;
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
export function createBattleVfxStage(canvas: HTMLCanvasElement, options: BattleVfxStageOptions = {}): BattleVfxStage {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0); renderer.autoClear = true;
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
  const pool = new ObjectPool<Sprite>(MAX_ACTIVE, () => createSprite(geometry), resetSprite);
  const stats: VfxStageStats = { active: 0, pooled: 0, textures: 0, fallbacks: 0 };
  const warnedTextures = new Set<string>();
  let disposed = false; let width = 1; let height = 1;
  const now = options.now ?? (() => performance.now());
  let projector: VfxProjector | undefined; const projected = { x: 0, y: 0, visible: true };
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
    width = Math.max(1, nextWidth); height = Math.max(1, nextHeight);
    camera.left = 0; camera.right = width; camera.top = 0; camera.bottom = height; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(2, Math.max(1, pixelRatio))); renderer.setSize(width, height, false);
    target.setSize(Math.ceil(width * renderer.getPixelRatio()), Math.ceil(height * renderer.getPixelRatio()));
    display.position.set(width / 2, height / 2, 0); display.scale.set(width, height, 1);
    for (const sprite of live) place(sprite);
  }
  async function play(request: VfxPlayRequest) {
    if (disposed) throw new Error('VFX_STAGE_DISPOSED');
    const plan = await assets.load(request.moveId, request.nature);
    if (disposed) throw new Error('VFX_PLAY_CANCELLED');
    const loaded = await loadSpriteTextures(plan, textures);
    if (disposed) throw new Error('VFX_PLAY_CANCELLED');
    let snapshot: ReturnType<NonNullable<VfxPlayRequest['actorSnapshot']>>;
    try { snapshot = plan.resolved.mode === 'afterimage' ? request.actorSnapshot?.() : undefined; }
    catch { snapshot = undefined; }
    let sourceMissing = plan.resolved.mode === 'afterimage' && !snapshot;
    let sprite: Sprite;
    try { sprite = pool.acquire(); } catch {
      const oldest = [...live].reduce((a, b) => a.startedAt <= b.startedAt ? a : b);
      live.delete(oldest); scene.remove(oldest.root); pool.release(oldest); sprite = pool.acquire();
    }
    const generation = sprite.generation;
    try {
      if (disposed || generation !== sprite.generation) throw new Error('VFX_PLAY_CANCELLED');
      sprite.request = request; sprite.plan = plan; sprite.startedAt = now();
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
    if (disposed) return;
    for (const sprite of live) {
      const elapsed = Math.max(0, timeMs - sprite.startedAt);
      if (elapsed >= sprite.durationMs) { live.delete(sprite); scene.remove(sprite.root); pool.release(sprite); continue; }
      updateEffect(sprite, elapsed, texturePlans.get(sprite) ?? {});
    }
    renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(displayScene, camera);
    stats.active = live.size; stats.pooled = pool.stats.pooled; stats.textures = textures.size;
  }
  resize();
  return { stats, play, setProjector(next) { projector = next; for (const sprite of live) place(sprite); }, resize, render, dispose() {
    if (disposed) return; disposed = true;
    for (const sprite of live) scene.remove(sprite.root); live.clear();
    pool.dispose(sprite => {
      sprite.snapshotTexture?.dispose();
      for (const mesh of [sprite.effect, sprite.emitter, ...sprite.ghosts, ...sprite.accents]) mesh.material.dispose();
    });
    textures.dispose(); display.material.dispose(); target.dispose(); geometry.dispose(); renderer.dispose();
  } };
}

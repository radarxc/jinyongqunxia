import {sampleTimeline, durationOf, playbackTime} from './timeline.js';

const vertexShader = `
varying vec2 localPx;
void main() {
  localPx = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// SRGBColorSpace textures decode each texel in hardware. Premultiply BEFORE
// bilinear sampling and temporal interpolation, including transparent borders.
const samplingShader = `
vec4 fetchPremultiplied(sampler2D tex, ivec2 p) {
  ivec2 size = textureSize(tex, 0);
  if (any(lessThan(p, ivec2(0))) || any(greaterThanEqual(p, size))) return vec4(0.0);
  vec4 c = texelFetch(tex, p, 0);
  return vec4(c.rgb * c.a, c.a);
}
vec4 samplePremultiplied(sampler2D tex, vec2 pixel, vec2 originalSize) {
  vec2 p = pixel / originalSize * vec2(textureSize(tex, 0)) - 0.5;
  ivec2 base = ivec2(floor(p)); vec2 f = fract(p);
  return mix(mix(fetchPremultiplied(tex, base),
                 fetchPremultiplied(tex, base + ivec2(1, 0)), f.x),
             mix(fetchPremultiplied(tex, base + ivec2(0, 1)),
                 fetchPremultiplied(tex, base + ivec2(1, 1)), f.x), f.y);
}`;

const effectFragment = `
varying vec2 localPx;
uniform sampler2D frameA, frameB;
uniform vec2 sizePx, anchorA, anchorB, sourceDirection;
uniform float frameMix, envelope, brightness, referenceLength;
uniform float maskEnabled, maskSoftness, reveal, erase;
out vec4 outColor;
${samplingShader}
void main() {
  vec2 source = vec2(sourceDirection.x * localPx.x - sourceDirection.y * localPx.y,
                     sourceDirection.y * localPx.x + sourceDirection.x * localPx.y);
  vec4 p = mix(samplePremultiplied(frameA, anchorA + source, sizePx),
               samplePremultiplied(frameB, anchorB + source, sizePx), frameMix);
  float mask = 1.0;
  if (maskEnabled > 0.5) {
    float q = localPx.x / referenceLength;
    float show = reveal <= 0.0 ? 0.0 : reveal >= 1.0 ? 1.0
      : 1.0 - smoothstep(reveal - maskSoftness * 0.5, reveal + maskSoftness * 0.5, q);
    float hide = erase <= 0.0 ? 1.0 : erase >= 1.0 ? 0.0
      : smoothstep(erase - maskSoftness * 0.5, erase + maskSoftness * 0.5, q);
    mask = show * hide;
  }
  // Clamp the gained straight color before re-premultiplication (§4.3).
  p.rgb = min(p.rgb * brightness, vec3(p.a));
  outColor = p * (envelope * mask);
}`;

const emitterFragment = `
varying vec2 localPx;
uniform sampler2D plate;
uniform vec2 sizePx;
out vec4 outColor;
${samplingShader}
void main() { outColor = samplePremultiplied(plate, localPx, sizePx); }`;

// Only this final pass encodes to sRGB; all layer blending happens in linear RGB.
const displayFragment = `
varying vec2 localPx;
uniform sampler2D rendered;
out vec4 outColor;
void main() {
  vec3 c = clamp(texture(rendered, localPx).rgb, 0.0, 1.0);
  vec3 low = c * 12.92;
  vec3 high = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  outColor = vec4(mix(low, high, step(vec3(0.0031308), c)), 1.0);
}`;

function quad(THREE, points, uv = points) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap(p => [...p, 0]), 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv.flat(), 2));
  geometry.setIndex([0, 1, 2, 2, 1, 3]);
  return geometry;
}

function textureFor(THREE, image) {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false; texture.premultiplyAlpha = false;
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false; texture.needsUpdate = true;
  return texture;
}

function blendFor(THREE, mode) {
  const blend = {transparent: true, premultipliedAlpha: true,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor};
  if (mode === 'lighter') blend.blendDst = THREE.OneFactor;
  // With opaque background, screen = Ps + Cb * (1-Ps), NOT 1-alpha.
  else if (mode === 'screen') blend.blendDst = THREE.OneMinusSrcColorFactor;
  else if (mode === 'multiply') blend.blendSrc = THREE.DstColorFactor;
  else if (mode !== 'normal') throw new Error(`Unsupported blend: ${mode}`);
  return blend;
}

function boundsFor(effect) {
  const [w, h] = effect.size_px, [dx, dy] = effect.direction;
  const points = effect.frames.flatMap(({anchor_px: [ax, ay]}) =>
    [[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) =>
      [dx * (x - ax) + dy * (y - ay), -dy * (x - ax) + dx * (y - ay)]));
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const l = Math.min(...xs), r = Math.max(...xs), t = Math.min(...ys), b = Math.max(...ys);
  return [[l, t], [r, t], [l, b], [r, b]];
}

/** Images must be decoded, straight-alpha, top-left oriented. For ImageBitmap use
 * imageOrientation:'none', premultiplyAlpha:'none'. Metadata stays in source px
 * even when demo images are resized. The caller owns and closes image objects.
 * onFrame(state) is assignable; duration and seek are seconds, excluding loop gap.
 */
export function createVfxPlayer(THREE, {canvas, composition, emitterImage, effectFrames}) {
  const c = composition, effect = c.effect, emitter = c.emitter;
  if (!canvas || !effect || !emitter || effectFrames.length !== effect.frames.length)
    throw new Error('Canvas, expanded metadata and all decoded images are required');
  const duration = durationOf(c), [width, height] = c.canvas_px;
  const preview = c.output.preview_size_px ?? c.canvas_px;
  const renderer = new THREE.WebGLRenderer({canvas, alpha: false, antialias: false});
  renderer.setPixelRatio(1); renderer.setSize(preview[0], preview[1], false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  // Preserve linear compositing on WebGL2 devices without half-float attachments;
  // the 8-bit fallback has lower dark-tone precision and needs device QA.
  const targetType = renderer.extensions.has('EXT_color_buffer_float')
    ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const target = new THREE.WebGLRenderTarget(preview[0], preview[1], {
    type: targetType, colorSpace: THREE.LinearSRGBColorSpace,
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    depthBuffer: false, stencilBuffer: false});
  const scene = new THREE.Scene(), displayScene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 10);
  camera.position.z = 1;
  const textures = effectFrames.map(image => textureFor(THREE, image));
  const plate = textureFor(THREE, emitterImage);
  const value = v => ({value: v}), vector = xy => new THREE.Vector2(...xy);
  const uniforms = {frameA: value(textures[0]), frameB: value(textures[0]),
    sizePx: value(vector(effect.size_px)), anchorA: value(vector(effect.frames[0].anchor_px)),
    anchorB: value(vector(effect.frames[0].anchor_px)), sourceDirection: value(vector(effect.direction)),
    frameMix: value(0), envelope: value(1), brightness: value(1),
    referenceLength: value(effect.reference_length_px), maskEnabled: value(0),
    maskSoftness: value(0.08), reveal: value(1), erase: value(0)};
  const material = (fragmentShader, uniforms, mode) => new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader, fragmentShader, uniforms,
    side: THREE.DoubleSide, depthWrite: false, depthTest: false, toneMapped: false,
    ...blendFor(THREE, mode)});
  const effectMaterial = material(effectFragment, uniforms, effect.blend);
  const emitterMaterial = material(emitterFragment,
    {plate: value(plate), sizePx: value(vector(emitter.size_px))}, 'normal');
  const effectGeometry = quad(THREE, boundsFor(effect));
  const [ew, eh] = emitter.size_px, [ax, ay] = emitter.emit_point_px;
  const angle = c.angle_deg * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
  const psi = Math.atan2(emitter.direction[1], emitter.direction[0]);
  const ec = Math.cos(angle - psi), es = Math.sin(angle - psi);
  const corners = [[0, 0], [ew, 0], [0, eh], [ew, eh]];
  const emitterGeometry = quad(THREE, corners.map(([x, y]) => [
    c.emit_at_px[0] + c.emitter_scale * (ec * (x - ax) - es * (y - ay)),
    c.emit_at_px[1] + c.emitter_scale * (es * (x - ax) + ec * (y - ay))]), corners);
  const effectMesh = new THREE.Mesh(effectGeometry, effectMaterial);
  const emitterMesh = new THREE.Mesh(emitterGeometry, emitterMaterial);
  emitterMesh.renderOrder = 0; effectMesh.renderOrder = 1;
  effectMesh.matrixAutoUpdate = false; effectMesh.frustumCulled = false;
  scene.add(emitterMesh, effectMesh);
  const displayGeometry = quad(THREE, [[0, 0], [width, 0], [0, height], [width, height]],
    [[0, 1], [1, 1], [0, 0], [1, 0]]);
  const displayMaterial = new THREE.ShaderMaterial({glslVersion: THREE.GLSL3,
    vertexShader, fragmentShader: displayFragment, uniforms: {rendered: value(target.texture)},
    side: THREE.DoubleSide, depthWrite: false, depthTest: false,
    blending: THREE.NoBlending, toneMapped: false});
  displayScene.add(new THREE.Mesh(displayGeometry, displayMaterial));
  // Explicit decoding also works if a host has disabled global ColorManagement.
  const decode = x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  const background = new THREE.Color(...[1, 3, 5].map(i => decode(parseInt(c.background.slice(i, i + 2), 16) / 255)));
  const length = c.length_px ?? c.range_hex * c.pixels_per_hex;
  const sx = length / effect.reference_length_px * c.scale[0];
  const sy = c.emitter_scale * emitter.emission_width_px / effect.root_width_px * c.scale[1];
  let playing = false, disposed = false, speed = 1, request = null, lastClock = 0;
  let cursor = (c.output.peak_phase ?? (c.rhythm.charge_s + c.rhythm.release_s) / duration) * duration;

  function render(time, inGap = false) {
    const state = sampleTimeline(c, time), k = state.scale;
    uniforms.frameA.value = textures[state.frameIndex];
    uniforms.frameB.value = textures[state.nextFrameIndex];
    uniforms.anchorA.value.fromArray(effect.frames[state.frameIndex].anchor_px);
    uniforms.anchorB.value.fromArray(effect.frames[state.nextFrameIndex].anchor_px);
    uniforms.frameMix.value = state.mix; uniforms.envelope.value = state.alpha;
    uniforms.brightness.value = state.brightness;
    uniforms.maskEnabled.value = Number(state.mask.enabled);
    uniforms.maskSoftness.value = state.mask.softness;
    uniforms.reveal.value = state.mask.reveal; uniforms.erase.value = state.mask.erase;
    effectMesh.matrix.set(cos * sx * k, -sin * sy * k, 0, c.emit_at_px[0] + cos * state.driftPx,
      sin * sx * k, cos * sy * k, 0, c.emit_at_px[1] + sin * state.driftPx,
      0, 0, 1, 0, 0, 0, 0, 1);
    effectMesh.matrixWorldNeedsUpdate = true;
    renderer.setRenderTarget(target); renderer.setClearColor(background, 1);
    renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(displayScene, camera);
    api.onFrame?.({...state, playing, inGap});
  }

  function alive() { if (disposed) throw new Error('VFX player has been disposed'); }
  function advance(now) {
    if (playing) cursor += Math.max(0, now - lastClock) * speed / 1000;
    lastClock = now;
    const position = playbackTime(c, cursor);
    if (position.ended) playing = false;
    return position;
  }
  function tick(now) {
    request = null;
    if (!playing || disposed) return;
    const position = advance(now); render(position.time, position.inGap);
    if (playing && request === null) request = requestAnimationFrame(tick);
  }
  function cancel() { if (request !== null) cancelAnimationFrame(request); request = null; }

  const api = {
    duration,
    onFrame: null,
    play() {
      alive();
      if (playing) return api;
      if (!c.output.loop && cursor >= duration) cursor = 0;
      playing = true; lastClock = performance.now();
      const p = playbackTime(c, cursor); render(p.time, p.inGap);
      if (playing && request === null) request = requestAnimationFrame(tick);
      return api;
    },
    pause() {
      alive();
      if (!playing) return api;
      const p = advance(performance.now()); playing = false; cancel();
      render(p.time, p.inGap); return api;
    },
    seek(seconds) {
      alive();
      if (!Number.isFinite(seconds)) throw new Error('Seek time must be finite');
      cursor = Math.max(0, Math.min(duration, seconds)); lastClock = performance.now();
      // Render the precise endpoint even when loop=true and loop_gap_s=0.
      render(cursor, false); return api;
    },
    setSpeed(multiplier) {
      alive();
      if (!Number.isFinite(multiplier) || multiplier <= 0) throw new Error('Speed must be finite and positive');
      if (!playing) { speed = multiplier; return api; }
      const p = advance(performance.now()); speed = multiplier;
      render(p.time, p.inGap); return api;
    },
    dispose() {
      if (disposed) return;
      disposed = true; playing = false; cancel(); api.onFrame = null;
      [effectGeometry, emitterGeometry, displayGeometry, effectMaterial, emitterMaterial,
        displayMaterial, target, plate, ...textures].forEach(resource => resource.dispose());
      renderer.dispose();
    }
  };
  render(cursor);
  return api;
}

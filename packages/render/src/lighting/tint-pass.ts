import {
  Color,
  Mesh,
  MultiplyBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  type WebGLRenderer,
} from 'three';
import type { TimeOfDayFrame } from './time-of-day';

export const NIGHT_READABILITY_FLOOR = 0.42;

const VERTEX = `
varying vec2 vUv;
void main() { vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`;
const FRAGMENT = `
uniform vec3 tint; uniform float strength; varying vec2 vUv;
void main() {
  float paper=0.012*(vUv.x+vUv.y-1.0);
  gl_FragColor=vec4(mix(vec3(1.0),clamp(tint+paper,0.0,1.0),strength),1.0);
  #include <colorspace_fragment>
}`;

export interface TimeTintPass {
  readonly drawCalls: 1;
  setTime(frame: TimeOfDayFrame): void;
  render(renderer: WebGLRenderer): void;
  dispose(): void;
}

export function createTimeTintPass(): TimeTintPass {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: { tint: { value: new Color(1, 1, 1) }, strength: { value: 0 } },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: MultiplyBlending,
    premultipliedAlpha: true,
  });
  const quad = new Mesh(geometry, material);
  quad.frustumCulled = false;
  scene.add(quad);
  let disposed = false;
  return {
    drawCalls: 1,
    setTime(frame) {
      const light = Math.max(
        NIGHT_READABILITY_FLOOR,
        Math.min(1, frame.hemiIntensity * 0.72 + frame.lightIntensity * 0.52),
      );
      const tint = material.uniforms['tint']!.value as Color;
      const red = Math.max(
        NIGHT_READABILITY_FLOOR,
        Math.min(1, (frame.skyColor.r * 0.35 + frame.lightColor.r * 0.65) * light),
      );
      const green = Math.max(
        NIGHT_READABILITY_FLOOR,
        Math.min(1, (frame.skyColor.g * 0.35 + frame.lightColor.g * 0.65) * light),
      );
      const blue = Math.max(
        NIGHT_READABILITY_FLOOR,
        Math.min(1, (frame.skyColor.b * 0.35 + frame.lightColor.b * 0.65) * light),
      );
      tint.setRGB(red, green, blue, SRGBColorSpace);
      material.uniforms['strength']!.value = 0.58;
    },
    render(renderer) {
      if (!disposed) renderer.render(scene, camera);
    },
    dispose() {
      if (!disposed) {
        disposed = true;
        geometry.dispose();
        material.dispose();
        scene.clear();
      }
    },
  };
}

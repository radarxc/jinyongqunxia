import {
  GLSL3,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from 'three';
import type { BuildingPlanView } from '../types';

const VERTEX = `uniform vec3 interiorCorners[4]; uniform vec2 viewportPx;
flat out vec4 cornerX; flat out vec4 cornerY;
vec2 projectPx(vec3 point){
  vec4 clip=projectionMatrix*viewMatrix*modelMatrix*vec4(point,1.0);
  return (clip.xy/clip.w*.5+.5)*viewportPx;
}
void main(){
  vec2 a=projectPx(interiorCorners[0]),b=projectPx(interiorCorners[1]);
  vec2 c=projectPx(interiorCorners[2]),d=projectPx(interiorCorners[3]);
  cornerX=vec4(a.x,b.x,c.x,d.x); cornerY=vec4(a.y,b.y,c.y,d.y);
  gl_Position=vec4(position.xy,0.0,1.0);
}`;
const FRAGMENT = `uniform float opacity; uniform float featherPx;
flat in vec4 cornerX; flat in vec4 cornerY; out vec4 outColor;
float cross2(vec2 a,vec2 b){return a.x*b.y-a.y*b.x;}
float edgeDistance(vec2 p,vec2 a,vec2 b){
  vec2 edge=b-a; float t=clamp(dot(p-a,edge)/max(dot(edge,edge),.0001),.0,1.0);
  return length(p-(a+edge*t));
}
void main(){
  vec2 p=gl_FragCoord.xy; vec2 a=vec2(cornerX.x,cornerY.x);
  vec2 b=vec2(cornerX.y,cornerY.y),c=vec2(cornerX.z,cornerY.z),d=vec2(cornerX.w,cornerY.w);
  float e0=cross2(b-a,p-a),e1=cross2(c-b,p-b);
  float e2=cross2(d-c,p-c),e3=cross2(a-d,p-d);
  bool inside=(e0>=.0&&e1>=.0&&e2>=.0&&e3>=.0)||(e0<=.0&&e1<=.0&&e2<=.0&&e3<=.0);
  float distancePx=min(min(edgeDistance(p,a,b),edgeDistance(p,b,c)),
    min(edgeDistance(p,c,d),edgeDistance(p,d,a)));
  float signedDistance=inside?-distancePx:distancePx;
  float amount=smoothstep(-featherPx*.5,featherPx*.5,signedDistance);
  outColor=vec4(vec3(0.0),opacity*amount);
}`;
type VignetteMaterial = ShaderMaterial & {
  uniforms: {
    viewportPx: { value: Vector2 };
    interiorCorners: { value: Vector3[] };
  };
};
export type InteriorVignette = Mesh<PlaneGeometry, VignetteMaterial>;

export function createInteriorVignette(renderer: WebGLRenderer): InteriorVignette {
  const viewportPx = new Vector2(renderer.domElement.width, renderer.domElement.height);
  const interiorCorners = Array.from({ length: 4 }, () => new Vector3());
  const material = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      opacity: { value: 0.3 },
      featherPx: { value: 24 },
      viewportPx: { value: viewportPx },
      interiorCorners: { value: interiorCorners },
    },
  }) as VignetteMaterial;
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.name = 'building-interior-vignette';
  mesh.frustumCulled = false;
  mesh.renderOrder = 10_000;
  mesh.visible = false;
  return mesh;
}

export function setInteriorVignettePlan(mesh: InteriorVignette, plan: BuildingPlanView): void {
  const fallback = plan.footprint;
  const halfWidth = fallback[2] / 2,
    halfDepth = fallback[3] / 2;
  const rect = plan.floors[0] ?? [
    fallback[0] - halfWidth,
    fallback[1] - halfDepth,
    fallback[0] + halfWidth,
    fallback[1] + halfDepth,
  ];
  // floorY is relative to the building base; the world floor sits at baseYMm + floorY.
  const y = (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000 + 0.02;
  const corners = mesh.material.uniforms.interiorCorners.value;
  corners[0]!.set(rect[0] / 1000, y, rect[1] / 1000);
  corners[1]!.set(rect[2] / 1000, y, rect[1] / 1000);
  corners[2]!.set(rect[2] / 1000, y, rect[3] / 1000);
  corners[3]!.set(rect[0] / 1000, y, rect[3] / 1000);
}

export function updateInteriorVignette(mesh: InteriorVignette, renderer: WebGLRenderer): void {
  mesh.material.uniforms.viewportPx.value.set(
    renderer.domElement.width,
    renderer.domElement.height,
  );
}
export function restoreInteriorVignette(mesh: InteriorVignette): void {
  mesh.geometry.dispose();
  mesh.geometry = new PlaneGeometry(2, 2);
}

export function interiorVignetteOpacity(
  point: readonly [number, number],
  corners: readonly (readonly [number, number])[],
  opacity = 0.3,
  featherPx = 24,
): number {
  if (corners.length !== 4) return opacity;
  let positive = true,
    negative = true,
    distance = Infinity;
  for (let index = 0; index < 4; index += 1) {
    const a = corners[index]!,
      b = corners[(index + 1) & 3]!;
    const dx = b[0] - a[0],
      dy = b[1] - a[1];
    const cross = dx * (point[1] - a[1]) - dy * (point[0] - a[0]);
    positive = positive && cross >= 0;
    negative = negative && cross <= 0;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / Math.max(0.0001, dx * dx + dy * dy),
      ),
    );
    distance = Math.min(
      distance,
      Math.hypot(point[0] - (a[0] + dx * t), point[1] - (a[1] + dy * t)),
    );
  }
  const signed = positive || negative ? -distance : distance;
  const amount = Math.max(0, Math.min(1, signed / Math.max(0.0001, featherPx) + 0.5));
  return opacity * amount * amount * (3 - 2 * amount);
}

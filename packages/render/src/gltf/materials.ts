import {
  BackSide, DataTexture, MeshToonMaterial, NearestFilter, Quaternion, RedFormat, ShaderMaterial, Vector3,
  type Material, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial, type Texture,
} from 'three';

export interface PilotMaterialState {
  readonly gradientMap: DataTexture;
  readonly meshes: readonly Mesh[];
  readonly original: ReadonlyMap<Mesh, Material | Material[]>;
  readonly toon: ReadonlyMap<Mesh, Material | Material[]>;
  setToon(enabled: boolean): void;
  setOutline(enabled: boolean): void;
  dispose(): void;
}

const OUTLINE_VERTEX = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
#include <morphtarget_pars_vertex>
uniform float thickness;
void main() {
  #include <beginnormal_vertex>
#include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
#include <morphtarget_vertex>
  #include <skinning_vertex>
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  mvPosition.xyz += normalize(transformedNormal) * thickness;
  gl_Position = projectionMatrix * mvPosition;
}`;
const OUTLINE_FRAGMENT = /* glsl */ `void main(){ gl_FragColor=vec4(.075,.055,.045,1.); }`;

export function createThreeStepGradient(): DataTexture {
  const texture = new DataTexture(new Uint8Array([64, 154, 255]), 3, 1, RedFormat);
  texture.minFilter = NearestFilter; texture.magFilter = NearestFilter;
  texture.generateMipmaps = false; texture.needsUpdate = true;
  return texture;
}

function sourceMaterial(source: Material): { map: Texture | null; color: number; opacity: number;
  transparent: boolean; alphaTest: number; side: Material['side']; name: string } {
  const standard = source as MeshStandardMaterial; const basic = source as MeshBasicMaterial;
  return {
    map: standard.map ?? basic.map ?? null, color: standard.color?.getHex() ?? basic.color?.getHex() ?? 0xffffff,
    opacity: source.opacity, transparent: source.transparent, alphaTest: source.alphaTest, side: source.side, name: source.name,
  };
}

function toonMaterial(source: Material, gradientMap: Texture): MeshToonMaterial {
  const params = sourceMaterial(source);
  const result = new MeshToonMaterial({ ...params, gradientMap });
  result.name = `${params.name || 'pilot'}:toon`;
  return result;
}

function outlineMaterial(source: Material): ShaderMaterial {
  const params = sourceMaterial(source);
  const result = new ShaderMaterial({
    name: `${params.name || 'pilot'}:outline`, vertexShader: OUTLINE_VERTEX, fragmentShader: OUTLINE_FRAGMENT,
    uniforms: { thickness: { value: 0.006 } },
    side: BackSide, depthWrite: true, transparent: false,
  });
  return result;
}

function mapMaterial(value: Material | Material[], transform: (item: Material) => Material): Material | Material[] {
  return Array.isArray(value) ? value.map(transform) : transform(value);
}
function disposeMaterial(value: Material | Material[]): void {
  for (const material of Array.isArray(value) ? value : [value]) material.dispose();
}

export function createPilotMaterials(meshes: readonly Mesh[]): PilotMaterialState {
  const gradientMap = createThreeStepGradient();
  const original = new Map<Mesh, Material | Material[]>(); const toon = new Map<Mesh, Material | Material[]>();
  const outlineMeshes: Mesh[] = []; const origin = new Vector3(); const identity = new Quaternion();
  for (const mesh of meshes) {
    original.set(mesh, mesh.material);
    toon.set(mesh, mapMaterial(mesh.material, material => toonMaterial(material, gradientMap)));
    const outline = mesh.clone(false); outline.name = `${mesh.name || 'pilot'}:outline`;
    outline.material = mapMaterial(mesh.material, outlineMaterial); outline.position.copy(origin);
    outline.quaternion.copy(identity); outline.scale.setScalar(1); outline.visible = false;
    outline.renderOrder = mesh.renderOrder - 1; outline.userData['pilotOutline'] = true;
    mesh.add(outline); outlineMeshes.push(outline);
  }
  let toonEnabled = true; let outlineEnabled = false;
  const apply = (): void => {
    for (const mesh of meshes) mesh.material = toonEnabled ? toon.get(mesh)! : original.get(mesh)!;
    for (const outline of outlineMeshes) outline.visible = outlineEnabled;
  };
  apply();
  return {
    gradientMap, meshes, original, toon,
    setToon(enabled) { toonEnabled = enabled; apply(); },
    setOutline(enabled) { outlineEnabled = enabled; apply(); },
    dispose() {
      gradientMap.dispose(); for (const value of toon.values()) disposeMaterial(value);
      for (const outline of outlineMeshes) { disposeMaterial(outline.material); outline.removeFromParent(); }
    },
  };
}

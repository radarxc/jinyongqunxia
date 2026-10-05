import {
  BoxGeometry, ConeGeometry, Group, InstancedBufferAttribute, InstancedMesh, Matrix4,
  MeshStandardMaterial, Quaternion, ShaderMaterial, Vector3,
} from 'three';
import { regionCellKey, regionHexWorld, type PreparedRegionTerrain } from './terrain';
import type { RegionDecoView, RegionHexPoint, RegionObjectView, RegionStaticView } from './types';

interface FadeInstance { readonly group: string; readonly q: number; readonly r: number; value: number }
interface DecoFade extends FadeInstance { readonly occluder: boolean; readonly roof: boolean; groupIndex: number }
interface FadeGroup { readonly id: string; active: boolean }
export interface RegionObjectLayer {
  readonly group: Group; readonly instanceCount: number; updateFocus(focus: RegionHexPoint, dt: number,
    reducedMotion: boolean): void; restore(): void; dispose(): void;
}
const EMPTY_FADE = '__none__';
function visualMetadata(deco: RegionDecoView): { occluder: boolean; castShadow: boolean; roof: boolean; fadeGroup: string } {
  return { occluder: deco.occluder ?? false, castShadow: deco.castShadow ?? false,
    roof: deco.roof ?? false, fadeGroup: deco.fadeGroup ?? EMPTY_FADE };
}
export function collectRegionObjects(view: RegionStaticView): readonly RegionObjectView[] {
  const unique = new Map<string, RegionObjectView>();
  for (const object of view.objects) unique.set(object.id, object);
  for (const chunk of view.chunks) for (const object of chunk.objects)
    if (!unique.has(object.id)) unique.set(object.id, object);
  return [...unique.values()].sort((left, right) => left.r - right.r || left.q - right.q ||
    (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
}
function objectPosition(object: RegionObjectView, out: Vector3): Vector3 {
  return regionHexWorld(object.q, object.r, object.h, out);
}
function decoPosition(chunkQ: number, chunkR: number, deco: RegionDecoView,
  prepared: PreparedRegionTerrain, out: Vector3): Vector3 {
  const q = chunkQ * 32 + deco.index % 32; const r = chunkR * 32 + (deco.index >> 5);
  return regionHexWorld(q, r, prepared.cells.get(regionCellKey(q, r))?.height ?? 0, out);
}
const FADE_VERTEX = `attribute float instanceFade; varying float vFade; void main(){vFade=instanceFade;
  gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`;
const FADE_FRAGMENT = `varying float vFade; uniform vec3 tint;
  float bayer4(vec2 p){float x=mod(p.x,4.0);float y=mod(p.y,4.0);
    if(y<1.0){if(x<1.0)return 0.0;if(x<2.0)return .5;if(x<3.0)return .125;return .625;}
    if(y<2.0){if(x<1.0)return .75;if(x<2.0)return .25;if(x<3.0)return .875;return .375;}
    if(y<3.0){if(x<1.0)return .1875;if(x<2.0)return .6875;if(x<3.0)return .0625;return .5625;}
    if(x<1.0)return .9375;if(x<2.0)return .4375;if(x<3.0)return .8125;return .3125;}
  void main(){if(vFade<=bayer4(floor(gl_FragCoord.xy)))discard;gl_FragColor=vec4(tint,1.0);}`;
function makeMesh(count: number, kind: 'deco' | 'body' | 'roof'): InstancedMesh {
  const geometry = kind === 'deco' ? new ConeGeometry(.28, 1.1, 5)
    : new BoxGeometry(kind === 'roof' ? 1.25 : 1.05, kind === 'roof' ? .32 : 1.45, 1.05);
  const material = kind === 'body' ? new MeshStandardMaterial({ color: 0x796957, roughness: .94 })
    : new ShaderMaterial({ depthWrite: true, vertexShader: FADE_VERTEX, fragmentShader: FADE_FRAGMENT,
      uniforms: { tint: { value: new Vector3(...(kind === 'deco' ? [.322, .408, .294] : [.28, .24, .18])) } } });
  const mesh = new InstancedMesh(geometry, material, Math.max(1, count)); mesh.count = count;
  mesh.name = `region-${kind}-instances`; return mesh;
}
function inside(point: RegionHexPoint, rect: RegionObjectView['interiorRect']): boolean {
  return !!rect && point.q >= rect.q && point.q < rect.q + rect.width &&
    point.r >= rect.r && point.r < rect.r + rect.height;
}
function nearby(left: RegionHexPoint, right: RegionHexPoint): boolean {
  const dq = left.q - right.q; const dr = left.r - right.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) <= 1;
}
function advanceFade(value: number, target: number, dt: number, reducedMotion: boolean): number {
  if (reducedMotion || dt >= .25) return target;
  const step = Math.max(0, dt) * (1 - .12) / .25;
  return target < value ? Math.max(target, value - step) : Math.min(target, value + step);
}
export function createRegionObjectLayer(view: RegionStaticView,
  prepared: PreparedRegionTerrain): RegionObjectLayer {
  const group = new Group(); group.name = 'region-static-objects';
  const decos = view.chunks.flatMap((chunk) => chunk.decos.map((deco) => ({ chunk, deco })));
  const buildings = collectRegionObjects(view).filter((object) => object.class === 'Building');
  const decoMesh = makeMesh(decos.length, 'deco'); const bodyMesh = makeMesh(buildings.length, 'body');
  const roofMesh = makeMesh(buildings.length, 'roof'); const fades: FadeInstance[] = [];
  const decoFades: DecoFade[] = []; const fadeGroups: FadeGroup[] = [];
  const fadeGroupIndices = new Map<string, number>();
  const fadeValues = new Float32Array(Math.max(1, buildings.length)); fadeValues.fill(1);
  const decoFadeValues = new Float32Array(Math.max(1, decos.length)); decoFadeValues.fill(1);
  roofMesh.geometry.setAttribute('instanceFade', new InstancedBufferAttribute(fadeValues, 1));
  decoMesh.geometry.setAttribute('instanceFade', new InstancedBufferAttribute(decoFadeValues, 1));
  const transform = new Matrix4(); const point = new Vector3(); const scale = new Vector3(1, 1, 1);
  const rotation = new Quaternion();
  decos.forEach(({ chunk, deco }, index) => {
    decoPosition(chunk.q, chunk.r, deco, prepared, point); point.y += .55;
    transform.compose(point, rotation, scale); decoMesh.setMatrixAt(index, transform);
    const metadata = visualMetadata(deco); decoMesh.castShadow ||= metadata.castShadow;
    let groupIndex = -1;
    if (metadata.fadeGroup !== EMPTY_FADE) {
      groupIndex = fadeGroupIndices.get(metadata.fadeGroup) ?? -1;
      if (groupIndex < 0) { groupIndex = fadeGroups.length; fadeGroupIndices.set(metadata.fadeGroup, groupIndex);
        fadeGroups.push({ id: metadata.fadeGroup, active: false }); }
    }
    const q = chunk.q * 32 + deco.index % 32; const r = chunk.r * 32 + (deco.index >> 5);
    decoFades.push({ group: metadata.fadeGroup, q, r, value: 1, occluder: metadata.occluder,
      roof: metadata.roof, groupIndex });
  });
  buildings.forEach((building, index) => {
    objectPosition(building, point); const footprint = building.footprint;
    scale.set(footprint ? Math.max(1, footprint.width) : 1, 1,
      footprint ? Math.max(1, footprint.height) : 1); point.y += .72;
    transform.compose(point, rotation, scale); bodyMesh.setMatrixAt(index, transform);
    point.y += .88; transform.compose(point, rotation, scale); roofMesh.setMatrixAt(index, transform);
    fades.push({ group: building.roofGroup ?? building.id, q: building.q, r: building.r, value: 1 });
  });
  for (const mesh of [decoMesh, bodyMesh, roofMesh]) {
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); group.add(mesh);
  }
  (decoMesh.userData as { visual?: unknown }).visual = decos.map(({ deco }) => visualMetadata(deco));
  return { group, instanceCount: decos.length + buildings.length * 2,
    updateFocus(focus, dt, reducedMotion) {
      let dirty = false; let decoDirty = false;
      for (let index = 0; index < fadeGroups.length; index += 1) fadeGroups[index]!.active = false;
      for (let index = 0; index < decoFades.length; index += 1) { const fade = decoFades[index]!;
        if (!fade.occluder || !nearby(focus, fade)) continue;
        if (fade.groupIndex >= 0) fadeGroups[fade.groupIndex]!.active = true;
      }
      for (let index = 0; index < buildings.length; index += 1) { const building = buildings[index]!;
        if (!inside(focus, building.interiorRect)) continue;
        const groupIndex = fadeGroupIndices.get(building.roofGroup ?? building.id);
        if (groupIndex !== undefined) fadeGroups[groupIndex]!.active = true;
      }
      for (let index = 0; index < decoFades.length; index += 1) {
        const fade = decoFades[index]!; const grouped = fade.groupIndex >= 0 && fadeGroups[fade.groupIndex]!.active;
        const target = grouped || (fade.occluder && nearby(focus, fade)) || (fade.roof && nearby(focus, fade)) ? .12 : 1;
        const next = advanceFade(fade.value, target, dt, reducedMotion);
        if (next !== fade.value) { fade.value = next; decoFadeValues[index] = next; decoDirty = true; }
      }
      for (let index = 0; index < fades.length; index += 1) {
        const building = buildings[index]!; const target = inside(focus, building.interiorRect) ? 0.12 : 1;
        const fade = fades[index]!;
        const next = advanceFade(fade.value, target, dt, reducedMotion);
        if (next !== fade.value) { fade.value = next; fadeValues[index] = next; dirty = true; }
      }
      if (decoDirty) (decoMesh.geometry.getAttribute('instanceFade') as InstancedBufferAttribute).needsUpdate = true;
      if (dirty) (roofMesh.geometry.getAttribute('instanceFade') as InstancedBufferAttribute).needsUpdate = true;
    },
    restore() { for (const mesh of [decoMesh, bodyMesh, roofMesh])
      (mesh.material as MeshStandardMaterial | ShaderMaterial).needsUpdate = true; },
    dispose() { for (const mesh of [decoMesh, bodyMesh, roofMesh]) { mesh.dispose();
      mesh.geometry.dispose(); (mesh.material as MeshStandardMaterial | ShaderMaterial).dispose(); } },
  };
}

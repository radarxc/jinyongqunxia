import {
  BufferGeometry, Float32BufferAttribute, InstancedBufferAttribute, InstancedMesh,
  Matrix4, ShaderMaterial, Vector3, Color, DoubleSide,
} from 'three';
import type { BattleCell, BattleHighlights } from './types';

// design/09 §2.9.1: pointy-top radius 2/3 m, row spacing 1 m. Display math only.
export const HEX_RADIUS = 2 / 3;
export function hexWorld(q: number, r: number, height: number, out: Vector3): Vector3 {
  return out.set(Math.sqrt(3) * HEX_RADIUS * (q + r / 2), height * 0.25, r);
}
function geometry(): BufferGeometry {
  const vertices: number[] = [];
  for (let edge = 0; edge < 6; edge += 1) {
    const a = (30 + 60 * edge) * Math.PI / 180;
    const b = (90 + 60 * edge) * Math.PI / 180;
    vertices.push(0, 0, 0, Math.cos(a) * HEX_RADIUS, 0, Math.sin(a) * HEX_RADIUS,
      Math.cos(b) * HEX_RADIUS, 0, Math.sin(b) * HEX_RADIUS);
  }
  const result = new BufferGeometry();
  result.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  result.computeBoundingSphere(); return result;
}

/** Two membership vectors (400 bits as float flags) are uniforms, never rebuilt geometry. */
export class HexLayer {
  readonly mesh: InstancedMesh;
  readonly material: ShaderMaterial;
  private readonly indices = new Map<string, number>();
  private readonly reachable = new Float32Array(400);
  private readonly area = new Float32Array(400);
  constructor(readonly cells: readonly BattleCell[]) {
    if (!cells.length || cells.length > 400) throw new Error('BATTLE_TILE_CAPACITY');
    const shape = geometry();
    const indexes = new Float32Array(cells.length);
    const colors = new Float32Array(cells.length * 3);
    const color = new Color(); const matrix = new Matrix4(); const point = new Vector3();
    for (let index = 0; index < cells.length; index += 1) {
      const cell = cells[index]!; indexes[index] = index;
      this.indices.set(`${cell.q},${cell.r}`, index);
      color.setHex(cell.color); color.toArray(colors, index * 3);
    }
    shape.setAttribute('tileIndex', new InstancedBufferAttribute(indexes, 1));
    shape.setAttribute('tileColor', new InstancedBufferAttribute(colors, 3));
    this.material = new ShaderMaterial({ side: DoubleSide,
      uniforms: { selected: { value: -1 }, ready: { value: -1 },
        reachable: { value: this.reachable }, area: { value: this.area } },
      vertexShader: `attribute float tileIndex; attribute vec3 tileColor;
        varying vec3 baseColor; varying vec2 local; flat varying int tile;
        void main() { tile=int(tileIndex); baseColor=tileColor; local=position.xz;
          gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform int selected; uniform int ready;
        uniform float reachable[400]; uniform float area[400];
        varying vec3 baseColor; varying vec2 local; flat varying int tile;
        void main() {
          float edge=max(abs(local.x), max(abs(dot(local,vec2(.5,.8660254))),abs(dot(local,vec2(.5,-.8660254)))));
          float border=smoothstep(.550,.574,edge);
          vec3 ink=mix(baseColor,vec3(.22,.24,.22),border*.55);
          ink=mix(ink,vec3(.24,.61,.65),reachable[tile]*.42);
          ink=mix(ink,vec3(.83,.39,.26),area[tile]*.55);
          if(tile==ready) ink=mix(ink,vec3(.95,.78,.34),.4);
          if(tile==selected) ink=mix(ink,vec3(1.,.87,.5),max(border,.3));
          gl_FragColor=vec4(ink,1.0); }`,
    });
    this.mesh = new InstancedMesh(shape, this.material, cells.length);
    for (let index = 0; index < cells.length; index += 1) {
      const cell = cells[index]!; hexWorld(cell.q, cell.r, cell.height, point);
      matrix.makeTranslation(point.x, point.y, point.z); this.mesh.setMatrixAt(index, matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.mesh.computeBoundingSphere();
  }
  setHighlights(value: BattleHighlights): void {
    this.material.uniforms['selected']!.value = value.selected === null ? -1 : this.indices.get(value.selected) ?? -1;
    this.material.uniforms['ready']!.value = value.ready === null ? -1 : this.indices.get(value.ready) ?? -1;
    this.reachable.fill(0); this.area.fill(0);
    for (const key of value.reachable) { const index = this.indices.get(key); if (index !== undefined) this.reachable[index] = 1; }
    for (const key of value.area) { const index = this.indices.get(key); if (index !== undefined) this.area[index] = 1; }
  }
  dispose(): void { this.mesh.dispose(); this.mesh.geometry.dispose(); this.material.dispose(); }
}

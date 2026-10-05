import {
  BufferGeometry, Color, DataTexture, DoubleSide, Float32BufferAttribute, InstancedBufferAttribute,
  InstancedMesh, Matrix4, NearestFilter, RGBAFormat, ShaderMaterial, UnsignedByteType, Vector3,
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

/** Packed highlight values per tile live in one retained 400 x 1 RGBA8 data texture. */
export class HexLayer {
  readonly mesh: InstancedMesh;
  readonly material: ShaderMaterial;
  private readonly indices = new Map<string, number>();
  private readonly highlightBytes = new Uint8Array(400 * 4);
  private readonly highlights: DataTexture;
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
    this.highlights = new DataTexture(this.highlightBytes, 400, 1, RGBAFormat, UnsignedByteType);
    this.highlights.minFilter = NearestFilter; this.highlights.magFilter = NearestFilter;
    this.highlights.generateMipmaps = false; this.highlights.needsUpdate = true;
    this.material = new ShaderMaterial({ side: DoubleSide,
      uniforms: { highlights: { value: this.highlights } },
      vertexShader: `attribute float tileIndex; attribute vec3 tileColor;
        varying vec3 baseColor; varying vec2 local; varying float tile;
        void main() { tile=tileIndex; baseColor=tileColor; local=position.xz;
          gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D highlights;
        varying vec3 baseColor; varying vec2 local; varying float tile;
        void main() {
          vec4 flags=texture2D(highlights,vec2((tile+.5)/400.0,.5));
          float edge=max(abs(local.x), max(abs(dot(local,vec2(.5,.8660254))),abs(dot(local,vec2(.5,-.8660254)))));
          float border=smoothstep(.550,.574,edge);
          vec3 ink=mix(baseColor,vec3(.22,.24,.22),border*.55);
          ink=mix(ink,vec3(.24,.61,.65),step(.2,flags.r)*.42);
          ink=mix(ink,vec3(.95,.67,.20),step(.65,flags.r)*.38);
          ink=mix(ink,vec3(.83,.39,.26),flags.g*.55);
          if(flags.b>.5) ink=mix(ink,vec3(.95,.78,.34),.4);
          if(flags.a>.75) ink=mix(ink,vec3(1.,.87,.5),max(border,.3));
          else if(flags.a>.25) ink=mix(ink,vec3(.88,.78,.51),.48);
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
    this.highlightBytes.fill(0);
    for (const key of value.reachable) { const index = this.indices.get(key); if (index !== undefined) this.highlightBytes[index * 4] = 160; }
    for (const key of value.path) { const index = this.indices.get(key); if (index !== undefined) this.highlightBytes[index * 4] = 255; }
    for (const key of value.area) { const index = this.indices.get(key); if (index !== undefined) this.highlightBytes[index * 4 + 1] = 255; }
    const ready = value.ready === null ? undefined : this.indices.get(value.ready);
    const selected = value.selected === null ? undefined : this.indices.get(value.selected);
    const ghost = value.ghost === null ? undefined : this.indices.get(value.ghost);
    if (ready !== undefined) this.highlightBytes[ready * 4 + 2] = 255;
    if (ghost !== undefined) this.highlightBytes[ghost * 4 + 3] = 128;
    if (selected !== undefined) this.highlightBytes[selected * 4 + 3] = 255;
    this.highlights.needsUpdate = true;
  }
  restore(): void { this.highlights.needsUpdate = true; this.material.needsUpdate = true; }
  dispose(): void { this.mesh.dispose(); this.mesh.geometry.dispose(); this.highlights.dispose(); this.material.dispose(); }
}

import { CustomBlending, InstancedMesh, OneFactor, OneMinusSrcAlphaFactor, PlaneGeometry, ShaderMaterial, type Scene, type Texture } from 'three';
import { createRigInstanceBuffer, type RigInstanceBuffer } from './instance-buffer';
import type { RigSet } from './types';

export interface RigBatchCharacter {
  readonly rigSet: RigSet; readonly activeInstanceCount: number;
  writeInstances(buffer: RigInstanceBuffer, baseIndex: number): void;
}
export interface RigBatchStats { readonly characters: number; readonly activeInstances: number; readonly submittedInstances: number; readonly drawCalls: 2; readonly uploadedRanges: number }

const VERTEX_SHADER = `
attribute vec4 rigUvRect;
attribute vec3 rigAffineA;
attribute vec3 rigAffineB;
attribute vec4 rigAnchorDepth;
attribute vec4 rigSortTint;
varying vec2 vRigUv;
varying vec3 vRigTint;
varying float vRigActive;
void main() {
  float flags = rigSortTint.w;
  float mirrored = mod(floor(flags / 2.0), 2.0);
  float u = mix(uv.x, 1.0 - uv.x, mirrored);
  vRigUv = rigUvRect.xy + vec2(u, 1.0 - uv.y) * rigUvRect.zw;
  float packed = rigSortTint.z;
  vRigTint = vec3(floor(packed / 2048.0) / 31.0, floor(mod(packed, 2048.0) / 32.0) / 63.0, mod(packed, 32.0) / 31.0);
  vRigActive = mod(flags, 2.0);
  vec2 local = vec2(dot(rigAffineA.xy, position.xy) + rigAffineA.z, dot(rigAffineB.xy, position.xy) + rigAffineB.z);
  vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
  vec3 cameraBack = normalize(vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]));
  vec3 world = rigAnchorDepth.xyz + right * local.x + vec3(0.0, local.y * 1.1547, 0.0) + cameraBack * (rigAnchorDepth.w + (rigSortTint.y - 40.0) * 0.000025);
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`;

function material(map: Texture, soft: boolean): ShaderMaterial {
  const result = new ShaderMaterial({
    uniforms: { map: { value: map } }, vertexShader: VERTEX_SHADER,
    fragmentShader: `uniform sampler2D map; varying vec2 vRigUv; varying vec3 vRigTint; varying float vRigActive;
      void main(){ vec4 texel=texture2D(map,vRigUv); float a=texel.a*vRigActive;
      ${soft ? 'if(a<=0.0||a>=0.5) discard;' : 'if(a<0.5) discard; a=1.0;'}
      vec3 ink=mix(texel.rgb,texel.rgb*vRigTint,step(0.16,dot(texel.rgb,vec3(.2126,.7152,.0722))));
      gl_FragColor=vec4(ink*a,a); }`,
    transparent: soft, depthWrite: !soft, depthTest: true, premultipliedAlpha: soft,
  });
  if (soft) { result.blending = CustomBlending; result.blendSrc = OneFactor; result.blendDst = OneMinusSrcAlphaFactor; }
  return result;
}

export class RigBatch {
  readonly buffer: RigInstanceBuffer; readonly coreMesh: InstancedMesh; readonly softMesh: InstancedMesh;
  private readonly members: Array<RigBatchCharacter | undefined>; private readonly slots = new WeakMap<object, number>();
  private characters = 0; private highestSlot = -1; private activeInstances = 0; private uploadedRanges = 0;
  private readonly statsValue: RigBatchStats = { characters: 0, activeInstances: 0, submittedInstances: 0, drawCalls: 2, uploadedRanges: 0 };

  constructor(readonly rigSet: RigSet, readonly capacityCharacters = 100) {
    this.buffer = createRigInstanceBuffer(capacityCharacters * 20);
    const geometry = new PlaneGeometry(1, 1);
    geometry.setAttribute('rigUvRect', this.buffer.uvRect); geometry.setAttribute('rigAffineA', this.buffer.affineA);
    geometry.setAttribute('rigAffineB', this.buffer.affineB); geometry.setAttribute('rigAnchorDepth', this.buffer.anchorDepth);
    geometry.setAttribute('rigSortTint', this.buffer.sortTint);
    const indexCount = geometry.index?.count ?? 0; geometry.clearGroups();
    geometry.addGroup(0, indexCount, 0); geometry.addGroup(0, indexCount, 1);
    this.coreMesh = new InstancedMesh(geometry, [material(rigSet.texture, false), material(rigSet.texture, true)], this.buffer.capacity);
    this.softMesh = this.coreMesh; this.coreMesh.frustumCulled = false; this.coreMesh.renderOrder = 60;
    this.members = new Array<RigBatchCharacter | undefined>(capacityCharacters).fill(undefined);
    this.updateMeshCount();
  }

  add(character: RigBatchCharacter): void {
    if (character.rigSet !== this.rigSet) throw new Error('RIG_BATCH_ATLAS_MISMATCH');
    if (this.slots.has(character as object)) return;
    const slot = this.members.indexOf(undefined);
    if (slot < 0) throw new Error('RIG_BATCH_CAPACITY');
    this.members[slot] = character; this.slots.set(character as object, slot); this.characters += 1;
    this.highestSlot = Math.max(this.highestSlot, slot); character.writeInstances(this.buffer, slot * 20); this.updateMeshCount();
  }

  remove(character: RigBatchCharacter): void {
    const slot = this.slots.get(character as object); if (slot === undefined) return;
    this.members[slot] = undefined; this.slots.delete(character as object); this.characters -= 1;
    for (let index = slot * 20; index < slot * 20 + 20; index += 1) this.buffer.write(index, HIDDEN);
    while (this.highestSlot >= 0 && !this.members[this.highestSlot]) this.highestSlot -= 1; this.updateMeshCount();
  }

  sync(): void {
    this.activeInstances = 0;
    for (let slot = 0; slot <= this.highestSlot; slot += 1) { const member = this.members[slot]; if (member) { member.writeInstances(this.buffer, slot * 20); this.activeInstances += member.activeInstanceCount; } }
    this.flush();
  }

  addTo(scene: Scene): void { scene.add(this.coreMesh); }
  get stats(): RigBatchStats {
    const value = this.statsValue as { characters: number; activeInstances: number; submittedInstances: number; drawCalls: 2; uploadedRanges: number };
    value.characters = this.characters; value.activeInstances = this.activeInstances; value.submittedInstances = (this.highestSlot + 1) * 20; value.uploadedRanges = this.uploadedRanges;
    return value;
  }
  dispose(): void { this.coreMesh.geometry.dispose(); for (const item of this.coreMesh.material as ShaderMaterial[]) item.dispose(); }
  private flush(): void { this.uploadedRanges = this.buffer.flushDirtyRanges().length; this.updateMeshCount(); }
  private updateMeshCount(): void { this.coreMesh.count = (this.highestSlot + 1) * 20; }
}

const HIDDEN = { uvRect: [0, 0, 0, 0], affine2d: [0, 0, 0, 0, 0, 0], anchorDepth: [0, 0, 0, 0], sortTint: [0, 0, 0, 0] } as const;

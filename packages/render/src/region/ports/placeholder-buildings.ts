import {
  Box3, BufferGeometry, DataTexture, Float32BufferAttribute, Group, Mesh,
  NearestFilter, RGBAFormat, ShaderMaterial, UnsignedByteType, Vector3, type WebGLRenderer,
} from 'three';
import type { BuildingLayer, BuildingLayerInput, BuildingMeasure, BuildingPlanView, BuildKitView } from '../../buildgen/types';
import { cutFacadeMask } from '../../buildgen/types';
import type { BuildingLayerPort } from './types';
import { createInteriorVignette, restoreInteriorVignette, setInteriorVignettePlan,
  updateInteriorVignette } from '../../buildgen/three/vignette';

const DOOR_HEIGHT_M = 2.1;
const WALL_THICKNESS_M = 0.12;
const CUTAWAY_SECONDS = 0.25;
const STATE_WIDTH = 256;

const PLACEHOLDER_DIMS = { platform: 0, column: 2_800, eave: 600, rise: 2_400,
  lift: [180, 120] as const };
export const PLACEHOLDER_BUILD_KIT: BuildKitView = Object.freeze({
  schemaVersion: 'buildkit-runtime.v1', id: 'region_placeholder', style: 'timber', profile: 'song_zhe',
  dims: { vernacular: PLACEHOLDER_DIMS, shop: PLACEHOLDER_DIMS, middle: PLACEHOLDER_DIMS,
    hall: PLACEHOLDER_DIMS },
  door: { clearH: 2_100, single: 1_200, double: 1_400, threshold: 0, frame: 100 },
  window: { sill: 900, head: 2_000, width: 1_000, pattern: ['fangge'] },
  walls: { gable: { layer: 'wall', t: 120 }, back: { layer: 'wall', t: 120 },
    front: { layer: 'wall', t: 120 }, enclosure: { layer: 'wall', t: 120, h: 2_400, coping: 'tile' } },
  ridge: { h: 200, ends: 'plain', hallEnds: 'plain' },
  palette: { wall: ['#6d5b47', [0, 0] as const] as const },
  layers: [{ id: 'wall', repeatMm: [1_000, 1_000] as const }],
  archetypes: { placeholder: { recipe: 'hall' as const } }, landmarks: {}, variants: {},
  cityWall: { h: 6_000, top: 4_000, batter: 1_000, merlon: [1_800,1_200,500] as const,
    gate: { opening: 'trapezoid', w: 4_500, h: 5_200 } },
});

interface Writer {
  readonly position: number[];
  readonly unit: number[];
  readonly facade: number[];
  readonly ground: number[];
  readonly index: number[];
}
interface PlaceholderState {
  mode: 0 | 1 | 2;
  roof: number;
  wall: number;
  vignette: number;
}
interface CellWriter { readonly key: string; readonly shell: Writer; readonly roof: Writer }

const VERTEX = `
  attribute float aUnit; attribute float aFacade; attribute float aGround;
  uniform sampler2D uState; uniform float uStateRows; uniform float uFacadeMask;
  varying float vFade;
  float bit(float value,float mask){return mod(floor(value/mask),2.0);}
  void main(){
    float x=mod(aUnit,256.0); float y=floor(aUnit/256.0);
    vec4 state=texture2D(uState,vec2((x+.5)/256.0,(y+.5)/uStateRows));
    float cut=max(max(bit(aFacade,1.0)*bit(uFacadeMask,1.0),bit(aFacade,2.0)*bit(uFacadeMask,2.0)),
      max(bit(aFacade,4.0)*bit(uFacadeMask,4.0),bit(aFacade,8.0)*bit(uFacadeMask,8.0)));
    vec3 p=position; p.y-=max(0.0,p.y-aGround-1.0)*state.g*cut; vFade=state.r;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
  }`;
const SHELL_FRAGMENT = `void main(){gl_FragColor=vec4(.43,.36,.28,1.0);}`;
const ROOF_FRAGMENT = `
  varying float vFade;
  float bayer4(vec2 p){float x=mod(p.x,4.0),y=mod(p.y,4.0);
    if(y<1.0){if(x<1.0)return 0.0;if(x<2.0)return .5;if(x<3.0)return .125;return .625;}
    if(y<2.0){if(x<1.0)return .75;if(x<2.0)return .25;if(x<3.0)return .875;return .375;}
    if(y<3.0){if(x<1.0)return .1875;if(x<2.0)return .6875;if(x<3.0)return .0625;return .5625;}
    if(x<1.0)return .9375;if(x<2.0)return .4375;if(x<3.0)return .8125;return .3125;}
  void main(){if(vFade<=bayer4(floor(gl_FragCoord.xy)))discard;gl_FragColor=vec4(.25,.18,.13,1.0);}`;

function quarterPoint(x: number, z: number, yaw: number): readonly [number, number] {
  if (yaw === 1) return [-z, x];
  if (yaw === 2) return [-x, -z];
  if (yaw === 3) return [z, -x];
  return [x, z];
}
function pushVertex(writer: Writer, plan: BuildingPlanView, unit: number, facade: number,
  x: number, y: number, z: number, ground: number): number {
  const point = quarterPoint(x, z, plan.yaw);
  writer.position.push(point[0] + plan.footprint[0] / 1000, y, point[1] + plan.footprint[1] / 1000);
  writer.unit.push(unit); writer.facade.push(facade); writer.ground.push(ground);
  return writer.unit.length - 1;
}
function quad(writer: Writer, plan: BuildingPlanView, unit: number, facade: number,
  ground: number, points: readonly (readonly [number, number, number])[]): void {
  const base = writer.unit.length;
  for (const point of points) pushVertex(writer, plan, unit, facade, point[0], point[1], point[2], ground);
  writer.index.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
function box(writer: Writer, plan: BuildingPlanView, unit: number, facade: number, ground: number,
  x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
  quad(writer, plan, unit, facade, ground, [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]);
  quad(writer, plan, unit, facade, ground, [[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]]);
  quad(writer, plan, unit, facade, ground, [[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]);
  quad(writer, plan, unit, facade, ground, [[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]]);
  quad(writer, plan, unit, facade, ground, [[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]]);
  quad(writer, plan, unit, facade, ground, [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]);
}
function wall(writer: Writer, plan: BuildingPlanView, unit: number, side: number, ground: number,
  eave: number): void {
  const width = plan.footprint[2] / 1000; const depth = plan.footprint[3] / 1000;
  const length = side % 2 === 0 ? width : depth;
  const openings = plan.entrances.filter(value => value[0] === side).map(value => {
    const centre = value[1] / 1000; const half = Math.max(1.2, value[2] / 1000) / 2;
    return { x0: Math.max(-length / 2, centre - half), x1: Math.min(length / 2, centre + half) };
  });
  const xs = [-length / 2, length / 2, ...openings.flatMap(value => [value.x0, value.x1])]
    .sort((left, right) => left - right).filter((value, index, all) => index === 0 || value !== all[index - 1]);
  const ys = [ground, Math.min(eave, ground + DOOR_HEIGHT_M), eave]
    .filter((value, index, all) => index === 0 || value !== all[index - 1]);
  const facade = 1 << ((plan.yaw + side) % 4);
  for (let xi = 0; xi < xs.length - 1; xi += 1) for (let yi = 0; yi < ys.length - 1; yi += 1) {
    const x0 = xs[xi]!; const x1 = xs[xi + 1]!; const y0 = ys[yi]!; const y1 = ys[yi + 1]!;
    const centre = (x0 + x1) / 2; const open = y1 <= ground + DOOR_HEIGHT_M &&
      openings.some(value => centre > value.x0 && centre < value.x1);
    if (open || x1 <= x0 || y1 <= y0) continue;
    if (side === 0) box(writer, plan, unit, facade, ground, x0,y0,depth/2-WALL_THICKNESS_M,x1,y1,depth/2);
    else if (side === 1) box(writer, plan, unit, facade, ground, -width/2,y0,x0,-width/2+WALL_THICKNESS_M,y1,x1);
    else if (side === 2) box(writer, plan, unit, facade, ground, x0,y0,-depth/2,x1,y1,-depth/2+WALL_THICKNESS_M);
    else box(writer, plan, unit, facade, ground, width/2-WALL_THICKNESS_M,y0,x0,width/2,y1,x1);
  }
}
function geometry(writer: Writer): BufferGeometry {
  const result = new BufferGeometry();
  result.setAttribute('position', new Float32BufferAttribute(writer.position, 3));
  result.setAttribute('aUnit', new Float32BufferAttribute(writer.unit, 1));
  result.setAttribute('aFacade', new Float32BufferAttribute(writer.facade, 1));
  result.setAttribute('aGround', new Float32BufferAttribute(writer.ground, 1));
  result.setIndex(writer.index); result.computeVertexNormals(); result.computeBoundingSphere();
  return result;
}
function makeWriter(): Writer { return { position: [], unit: [], facade: [], ground: [], index: [] }; }
function cellSize(input: BuildingLayerInput): number {
  return input.quality.tier === 'low' || input.quality.tier === 'mid' ? 16 : 32;
}
function cellFor(plan: BuildingPlanView, size: number): string {
  return `${Math.floor(plan.footprint[0] / 1000 / size)},${Math.floor(plan.footprint[1] / 1000 / size)}`;
}
function geometryBytes(value: BufferGeometry): number {
  let bytes = value.index?.array.byteLength ?? 0;
  for (const attribute of Object.values(value.attributes)) bytes += attribute.array.byteLength;
  return bytes;
}
function move(value: number, target: number, dt: number, reducedMotion: boolean): number {
  const step = reducedMotion ? 1 : (dt > 0 ? dt : 0) / CUTAWAY_SECONDS;
  return target < value ? (target > value-step ? target : value-step) :
    (target < value+step ? target : value+step);
}
function planBounds(plan: BuildingPlanView): BuildingMeasure {
  const width = (plan.yaw % 2 === 0 ? plan.footprint[2] : plan.footprint[3]) / 1000;
  const depth = (plan.yaw % 2 === 0 ? plan.footprint[3] : plan.footprint[2]) / 1000;
  const cx = plan.footprint[0] / 1000; const cz = plan.footprint[1] / 1000;
  const minY = plan.elev[0] / 1000;
  const maxY = (plan.elev[0] + plan.elev[1] + plan.roof[2]) / 1000;
  return { bounds: [cx-width/2,minY,cz-depth/2,cx+width/2,maxY,cz+depth/2],
    widthM: width, depthM: depth, heightM: maxY-minY };
}

export function createPlaceholderBuildingLayer(input: BuildingLayerInput): BuildingLayer {
  const root = new Group(); root.name = 'placeholder-building-layer';
  const size = cellSize(input); const cells = new Map<string, CellWriter>();
  const states: PlaceholderState[] = []; const measures = input.plans.map(planBounds);
  const pickBoxes = measures.map(value => new Box3(
    new Vector3(value.bounds[0],value.bounds[1],value.bounds[2]),
    new Vector3(value.bounds[3],value.bounds[4],value.bounds[5])));
  for (let unit = 0; unit < input.plans.length; unit += 1) {
    const plan = input.plans[unit]!; const ground = (plan.elev[0] + plan.elev[1]) / 1000;
    const eave = ground + plan.roof[1] / 1000; const ridge = ground + plan.roof[2] / 1000;
    const key = cellFor(plan, size); let cell = cells.get(key);
    if (!cell) { cell = { key, shell: makeWriter(), roof: makeWriter() }; cells.set(key, cell); }
    for (let side = 0; side < 4; side += 1) wall(cell.shell, plan, unit, side, ground, eave);
    const halfW = plan.footprint[2] / 2000; const halfD = plan.footprint[3] / 2000;
    box(cell.roof, plan, unit, 0, ground, -halfW,eave,-halfD,halfW,Math.max(eave+.12,ridge),halfD);
    states.push({ mode: 0, roof: 1, wall: 0, vignette: 0 });
  }
  const rows = Math.max(1, Math.ceil(states.length / STATE_WIDTH));
  const stateData = new Uint8Array(STATE_WIDTH * rows * 4);
  for (let unit = 0; unit < states.length; unit += 1) stateData[unit * 4] = 255;
  const stateTexture = new DataTexture(stateData, STATE_WIDTH, rows, RGBAFormat, UnsignedByteType);
  stateTexture.minFilter = NearestFilter; stateTexture.magFilter = NearestFilter; stateTexture.needsUpdate = true;
  const uniforms = { uState: { value: stateTexture }, uStateRows: { value: rows },
    uFacadeMask: { value: cutFacadeMask(45) } };
  const shellMaterial = new ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: SHELL_FRAGMENT });
  const roofMaterial = new ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: ROOF_FRAGMENT });
  const shells: Mesh[] = []; const roofs: Mesh[] = [];
  for (const cell of cells.values()) {
    const shell = new Mesh(geometry(cell.shell), shellMaterial);
    shell.name = `placeholder-building-shell:${cell.key}`; shells.push(shell);
    const roof = new Mesh(geometry(cell.roof), roofMaterial);
    roof.name = `placeholder-building-roof:${cell.key}`; roofs.push(roof); root.add(shell, roof);
  }
  const vignetteRenderer = input.renderer.domElement ? input.renderer
    : ({ domElement: { width: 1, height: 1 } } as WebGLRenderer);
  const vignette = createInteriorVignette(vignetteRenderer); vignette.visible = false; root.add(vignette);
  const buildingTriangles = [...cells.values()].reduce((sum, cell) =>
    sum + (cell.shell.index.length + cell.roof.index.length) / 3, 0);
  const stats = { drawCalls: cells.size * 2, triangles: buildingTriangles,
    cells: cells.size, visibleCells: cells.size, units: states.length, interiors: 0,
    pendingCells: 0, geometryBytes: [...shells,...roofs].reduce((sum, mesh) =>
      sum + geometryBytes(mesh.geometry), 0), textureBytes: stateData.byteLength, lastCellMs: 0 };
  const hit = new Vector3(); let disposed = false;
  let activeStates = 0; let vignetteOwner = -1;
  root.userData['placeholder'] = { states, stateData, stateTexture, uniforms, shells, roofs, vignette };
  return { object: root, stats,
    setCutaway(index, mode) { const state = states[index]; if (!state || state.mode === mode) return;
      if (state.mode === 0 && mode !== 0) activeStates += 1; else if (state.mode !== 0 && mode === 0) activeStates -= 1;
      state.mode = mode;
      if (mode === 2) vignetteOwner = index;
      else if (vignetteOwner === index) { vignetteOwner = -1;
        for (let candidate = 0; candidate < states.length; candidate += 1)
          if (states[candidate]!.mode === 2) { vignetteOwner = candidate; break; } }
      vignette.visible = vignetteOwner >= 0;
      const plan = input.plans[vignetteOwner]; if (plan) setInteriorVignettePlan(vignette, plan);
      stats.drawCalls = cells.size * 2 + Number(vignette.visible);
      stats.triangles = buildingTriangles + Number(vignette.visible) * 2; },
    setCameraYaw(deg) { if (Number.isFinite(deg)) uniforms.uFacadeMask.value = cutFacadeMask(deg); },
    setFocusOcclusion() {},
    update(dt, reducedMotion) {
      if (disposed || states.length === 0) return; let dirty = false; let vignetteTarget = 0;
      if (activeStates === 0) { let settled = true; for (let unit = 0; unit < states.length; unit += 1) {
        const state = states[unit]!; if (state.roof !== 1 || state.wall !== 0 || state.vignette !== 0) { settled = false; break; } }
        if (settled) return; }
      for (let unit = 0; unit < states.length; unit += 1) {
        const state = states[unit]!; const roofValue = move(state.roof, state.mode === 0 ? 1 : 0, dt, reducedMotion);
        const wallValue = move(state.wall, state.mode === 2 ? 1 : 0, dt, reducedMotion);
        const vignetteValue = move(state.vignette / .3, state.mode === 2 ? 1 : 0, dt, reducedMotion) * .3;
        if (roofValue !== state.roof || wallValue !== state.wall || vignetteValue !== state.vignette) dirty = true;
        state.roof = roofValue; state.wall = wallValue; state.vignette = vignetteValue;
        stateData[unit*4] = Math.round(roofValue*255); stateData[unit*4+1] = Math.round(wallValue*255);
        vignetteTarget = vignetteValue > vignetteTarget ? vignetteValue : vignetteTarget;
      }
      if (dirty) stateTexture.needsUpdate = true;
      vignette.material.uniforms['opacity']!.value = vignetteTarget;
      updateInteriorVignette(vignette, vignetteRenderer);
    },
    pick(raycaster) {
      let nearest = Infinity; let result = -1;
      for (let index = 0; index < pickBoxes.length; index += 1) {
        if (raycaster.ray.intersectBox(pickBoxes[index]!, hit)) { const distance = raycaster.ray.origin.distanceToSquared(hit);
          if (distance < nearest) { nearest = distance; result = index; } }
      }
      return result;
    },
    restore() { if (!disposed) { stateTexture.needsUpdate = true; shellMaterial.needsUpdate = true;
      roofMaterial.needsUpdate = true; restoreInteriorVignette(vignette); } },
    dispose() { if (disposed) return; disposed = true; for (const mesh of [...shells,...roofs]) mesh.geometry.dispose();
      shellMaterial.dispose(); roofMaterial.dispose(); stateTexture.dispose(); vignette.geometry.dispose(); vignette.material.dispose(); },
    ready: () => Promise.resolve(),
    occludes(point) {
      for (const measure of measures) { const b = measure.bounds;
        if (point.x >= b[0] && point.x <= b[3] && point.y >= b[1] && point.y <= b[4] && point.z >= b[2] && point.z <= b[5]) return true; }
      return false;
    },
    measure(index) { const value = measures[index]; if (!value) throw new RangeError('PLACEHOLDER_BUILDING_INDEX'); return value; },
  };
}

export function createPlaceholderBuildingPort(): BuildingLayerPort {
  return { create: async input => createPlaceholderBuildingLayer(input) };
}

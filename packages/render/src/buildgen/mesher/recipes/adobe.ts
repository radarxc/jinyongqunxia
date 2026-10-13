import {
  ROOF_STYLE,
  type BuildingPlanView,
  type BuildKitView,
  type LocalSide,
  type MeshWriter,
  type Recipe,
  type RecipeSink,
  type VertexInput,
  type Yaw4,
} from '../../types';
import { wallWithOpenings, type WallOpening } from '../core/openings';
import {
  box,
  prism,
  quad,
  transformPoint,
  type PrimitiveMaterial,
  type Vec3,
} from '../core/prims';
import { emitBrickLattice } from '../parts/brick-lattice';
import { emitIwan } from '../parts/iwan';
import { emitJoistEnds, emitWaterspout } from '../parts/joists';
import { emitParapet } from '../parts/parapet';
import { emitPlatform, hallOrigin, hallSizeM, kitLayer } from '../parts/platform';
import { emitSteps } from '../parts/steps';
import { emitTrellis } from '../parts/trellis';
import { roofMesherFor } from '../roof';
import { writeDomeRoof } from '../roof/dome';
import { writePyramidRoof } from '../roof/pyramid';

const EDGE_M = 0.04;
const JOIST_RECESS_M = 0.3;
const CLEARANCE_M = 2.2;
const WALL_CHAMFER_M = 0.1;
const WALL_SETBACK_M = 0.45;

interface AdobeOpening extends WallOpening {
  readonly kind: 'door' | 'window' | 'lattice';
  readonly side: LocalSide;
  readonly clearWidthM: number;
  readonly clearHeightM: number;
  readonly thresholdM: number;
  readonly origin: readonly [number, number, number];
  readonly yaw: Yaw4;
  readonly thicknessM: number;
}
interface BodyBounds {
  readonly left: number;
  readonly back: number;
  readonly right: number;
  readonly front: number;
}

export interface AdobeComponentCounts {
  readonly dome: number;
  readonly pointedArch: number;
  readonly tangStupa: number;
  readonly tangStupaBowls: number;
  readonly tangStupaRings: number;
  readonly tangStupaJewels: number;
}

function emptyComponentCounts(): AdobeComponentCounts {
  return {
    dome: 0,
    pointedArch: 0,
    tangStupa: 0,
    tangStupaBowls: 0,
    tangStupaRings: 0,
    tangStupaJewels: 0,
  };
}
type AdobeCounter = { -readonly [K in keyof AdobeComponentCounts]: AdobeComponentCounts[K] };

function suppressLayer(writer: MeshWriter, layer: number): MeshWriter {
  const mapped: number[] = [];
  let count = 0;
  return {
    get vertexCount() {
      return count;
    },
    addVertex(vertex) {
      mapped.push(vertex.layer === layer ? -1 : writer.addVertex(vertex));
      return count++;
    },
    addTriangle(a, b, c) {
      const triangle = [mapped[a], mapped[b], mapped[c]];
      if (triangle.every((index) => index !== undefined && index >= 0))
        writer.addTriangle(triangle[0]!, triangle[1]!, triangle[2]!);
    },
  };
}

function localXZ(plan: BuildingPlanView, worldX: number, worldZ: number) {
  const x = worldX - plan.footprint[0] / 1000;
  const z = worldZ - plan.footprint[1] / 1000;
  if (plan.yaw === 0) return [x, z] as const;
  if (plan.yaw === 1) return [z, -x] as const;
  if (plan.yaw === 2) return [-x, -z] as const;
  return [-z, x] as const;
}

/** Assign facade bits from final world position; adobe's deep walls have unmarked inner faces. */
function facadeWriter(writer: MeshWriter, plan: BuildingPlanView, kit: BuildKitView): MeshWriter {
  const band =
    Math.max(500, ...Object.values(kit.walls).map(({ t }) => t)) / 1000 + 0.001;
  return {
    get vertexCount() {
      return writer.vertexCount;
    },
    addVertex(vertex: VertexInput) {
      const [x, z] = localXZ(plan, vertex.position[0], vertex.position[2]);
      const halfW = plan.footprint[2] / 2000 - EDGE_M;
      const halfD = plan.footprint[3] / 2000 - EDGE_M;
      const near = [z >= halfD - band, x <= -halfW + band, z <= -halfD + band, x >= halfW - band];
      let facade = 0;
      for (let side = 0; side < 4; side += 1)
        if (near[side]) facade |= 1 << ((side + plan.yaw) % 4);
      return writer.addVertex({ ...vertex, facade });
    },
    addTriangle(a, b, c) {
      writer.addTriangle(a, b, c);
    },
  };
}

function recipeDefinition(plan: BuildingPlanView, kit: BuildKitView) {
  const definition = kit.archetypes[plan.archetype] ?? kit.landmarks[plan.archetype];
  if (!definition || definition.recipe !== 'adobe')
    throw new RangeError('BUILDGEN_ADOBE_RECIPE_MISMATCH');
  return definition;
}

function variantNumber(kit: BuildKitView, key: string, fallback: number): number {
  const value = kit.variants[key];
  return typeof value === 'number' ? value : fallback;
}

function wallThicknessM(kit: BuildKitView, side: LocalSide): number {
  return (
    (side === 0 ? kit.walls.front.t : side === 2 ? kit.walls.back.t : kit.walls.gable.t) / 1000
  );
}
function bodyBounds(
  plan: BuildingPlanView,
  kit: BuildKitView,
  definition: ReturnType<typeof recipeDefinition>,
): BodyBounds {
  const [width, depth] = hallSizeM(plan);
  const iwan = definition.front === 'carved_shopfront' || plan.facility === 'inn';
  const setback = kit.style === 'adobe' ? WALL_SETBACK_M : 0.18;
  const porchDepth = iwan ? Math.max(1.5, Math.min(2.4, depth * 0.35)) : 0;
  return {
    left: -width / 2 + setback,
    back: -depth / 2 + setback,
    right: width / 2 - setback,
    front: iwan ? depth / 2 - 0.14 - porchDepth : depth / 2 - setback,
  };
}
function sideLength(side: LocalSide, width: number, depth: number): number {
  return side % 2 === 0 ? width : depth;
}
function sideOrigin(
  plan: BuildingPlanView,
  side: LocalSide,
  bounds: BodyBounds,
  thickness: number,
) {
  const local = [
    [bounds.left + WALL_CHAMFER_M, 0, bounds.front - thickness / 2],
    [bounds.left + thickness / 2, 0, bounds.back + WALL_CHAMFER_M],
    [bounds.right - WALL_CHAMFER_M, 0, bounds.back + thickness / 2],
    [bounds.right - thickness / 2, 0, bounds.front - WALL_CHAMFER_M],
  ] as const;
  return transformPoint(local[side]!, { origin: hallOrigin(plan), yaw: plan.yaw });
}
function alongCentre(side: LocalSide, length: number, offsetMm: number): number {
  return length / 2 + (side < 2 ? offsetMm : -offsetMm) / 1000;
}

function adobeOpenings(
  plan: BuildingPlanView,
  kit: BuildKitView,
  floorM: number,
  wallTopM: number,
  lod: 0 | 1,
  bounds: BodyBounds,
  brickLattice: boolean,
): AdobeOpening[] {
  const width = bounds.right - bounds.left;
  const depth = bounds.front - bounds.back;
  const result: AdobeOpening[] = [];
  const frameM = Math.max(0.1, kit.door.frame / 1000);
  for (let side = 0 as LocalSide; side < 4; side = (side + 1) as LocalSide) {
    const length = sideLength(side, width, depth);
    const usableLength = length - WALL_CHAMFER_M * 2;
    const thicknessM = clearanceThicknessM(
      plan,
      side,
      bounds,
      wallThicknessM(kit, side),
    );
    const yaw = ((plan.yaw + side) % 4) as Yaw4;
    const origin = sideOrigin(plan, side, bounds, thicknessM);
    for (const [, offsetMm, widthMm] of plan.entrances.filter(([entrance]) => entrance === side)) {
      const clearWidthM = Math.max(
        plan.facility === 'temple' ? 2 : 1.2,
        widthMm / 1000,
        kit.door.double / 1000,
      );
      const clearHeightM = Math.max(2.1, kit.door.clearH / 1000);
      const thresholdM = kit.door.threshold / 1000;
      const centre = alongCentre(side, usableLength, offsetMm);
      result.push({
        kind: 'door',
        side,
        clearWidthM,
        clearHeightM,
        thresholdM,
        origin,
        yaw,
        thicknessM,
        x0: centre - clearWidthM / 2 - frameM,
        x1: centre + clearWidthM / 2 + frameM,
        y0: floorM,
        y1: Math.min(wallTopM, floorM + thresholdM + clearHeightM + frameM),
      });
    }
    if (side === 0 && brickLattice) {
      const latticeWidth = Math.max(1.8, width * 0.55);
      result.push({
        kind: 'lattice',
        side,
        clearWidthM: latticeWidth,
        clearHeightM: 1.25,
        thresholdM: 0,
        origin,
        yaw,
        thicknessM,
        x0: (usableLength - latticeWidth) / 2,
        x1: (usableLength + latticeWidth) / 2,
        y0: floorM + 1.3,
        y1: floorM + 2.55,
      });
    }
    if (lod === 1) continue;
    const sill = floorM + Math.max(2.2, kit.window.sill / 1000);
    const head = Math.min(wallTopM - 0.15, sill + 0.45);
    const windowWidth = Math.min(kit.window.width / 1000, usableLength / 5);
    for (const centre of [usableLength / 2]) {
      const intersectsDoor = result.some(
        (opening) =>
          opening.side === side &&
          centre + windowWidth / 2 > opening.x0 &&
          centre - windowWidth / 2 < opening.x1,
      );
      if (!intersectsDoor && head > sill)
        result.push({
          kind: 'window',
          side,
          clearWidthM: windowWidth,
          clearHeightM: head - sill,
          thresholdM: 0,
          origin,
          yaw,
          thicknessM,
          x0: centre - windowWidth / 2,
          x1: centre + windowWidth / 2,
          y0: sill,
          y1: head,
        });
    }
  }
  return result;
}

function localFloorBounds(plan: BuildingPlanView) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x0, z0, x1, z1] of plan.floors)
    for (const [x, z] of [
      [x0, z0],
      [x1, z1],
    ] as const) {
      const [localX, localZ] = localXZ(plan, x / 1000, z / 1000);
      minX = Math.min(minX, localX);
      maxX = Math.max(maxX, localX);
      minZ = Math.min(minZ, localZ);
      maxZ = Math.max(maxZ, localZ);
    }
  return { minX, maxX, minZ, maxZ };
}
function clearanceThicknessM(
  plan: BuildingPlanView,
  side: LocalSide,
  bounds: BodyBounds,
  full: number,
): number {
  if (plan.floors.length === 0) return full;
  const floor = localFloorBounds(plan);
  const available = [
    bounds.front - floor.maxZ - 0.01,
    floor.minX - bounds.left - 0.01,
    floor.minZ - bounds.back - 0.01,
    bounds.right - floor.maxX - 0.01,
  ][side]!;
  return Math.max(0.08, Math.min(full, available));
}
function bandOpenings(openings: readonly AdobeOpening[], y0: number, y1: number): WallOpening[] {
  return openings.flatMap((opening) => {
    const low = Math.max(y0, opening.y0);
    const high = Math.min(y1, opening.y1);
    return high > low ? [{ x0: opening.x0, x1: opening.x1, y0: low, y1: high }] : [];
  });
}

function cornerSection(
  bounds: BodyBounds,
  sx: -1 | 1,
  sz: -1 | 1,
  gableT: number,
  endT: number,
): readonly Vec3[] {
  const x = sx < 0 ? bounds.left : bounds.right;
  const z = sz < 0 ? bounds.back : bounds.front;
  return [
    [x - sx * WALL_CHAMFER_M, 0, z],
    [x, 0, z - sz * WALL_CHAMFER_M],
    [x - sx * gableT, 0, z - sz * WALL_CHAMFER_M],
    [x - sx * WALL_CHAMFER_M, 0, z - sz * endT],
  ];
}
function emitCornerBand(
  writer: MeshWriter,
  plan: BuildingPlanView,
  unit: number,
  floorM: number,
  section: readonly Vec3[],
  y0: number,
  y1: number,
  material: PrimitiveMaterial,
  closeTop = true,
): void {
  const at = (index: number, y: number): Vec3 => [section[index]![0], y, section[index]![2]];
  const transform = { origin: hallOrigin(plan), yaw: plan.yaw } as const;
  for (let edge = 0; edge < section.length; edge += 1) {
    const next = (edge + 1) % section.length;
    if (
      Math.abs(section[edge]![0] - section[next]![0]) < 0.000_001 &&
      Math.abs(section[edge]![2] - section[next]![2]) < 0.000_001
    )
      continue;
    quad(
      writer,
      [at(edge, y0), at(next, y0), at(next, y1), at(edge, y1)],
      { ...material, unit, localGroundM: floorM, flags: 1 },
      transform,
    );
  }
  if (closeTop && section.length === 4)
    quad(
      writer,
      [at(0, y1), at(1, y1), at(2, y1), at(3, y1)],
      { ...material, unit, localGroundM: floorM, flags: 1 },
      transform,
    );
}

function emitAdobeWalls(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  writer: MeshWriter,
  floorM: number,
  wallTopM: number,
  openings: readonly AdobeOpening[],
  bounds: BodyBounds,
): void {
  const width = bounds.right - bounds.left;
  const depth = bounds.front - bounds.back;
  const lengths = [width, depth, width, depth] as const;
  for (let side = 0 as LocalSide; side < 4; side = (side + 1) as LocalSide) {
    const thicknessM = wallThicknessM(kit, side);
    const lowerThicknessM = clearanceThicknessM(plan, side, bounds, thicknessM);
    const yaw = ((plan.yaw + side) % 4) as Yaw4;
    const face = side === 0 ? kit.walls.front : side === 2 ? kit.walls.back : kit.walls.gable;
    const clearTop = Math.min(wallTopM, floorM + CLEARANCE_M + 0.001);
    const dadoTop = Math.min(wallTopM, floorM + (face.dado?.h ?? 0) / 1000);
    const cuts = [...new Set([floorM, dadoTop, clearTop, wallTopM])].sort((a, b) => a - b);
    for (let band = 0; band < cuts.length - 1; band += 1) {
      const y0M = cuts[band]!;
      const y1M = cuts[band + 1]!;
      const bandThickness = y0M < clearTop ? lowerThicknessM : thicknessM;
      if (y1M > y0M)
        wallWithOpenings(writer, {
          lengthM: lengths[side] - WALL_CHAMFER_M * 2,
          y0M,
          y1M,
          thicknessM: bandThickness,
          openings: bandOpenings(
            openings.filter((opening) => opening.side === side),
            y0M,
            y1M,
          ),
          origin: sideOrigin(plan, side, bounds, bandThickness),
          yaw,
          facade: 1 << yaw,
          unit,
          localGroundM: floorM,
          layer: kitLayer(kit, y0M < dadoTop ? (face.dado?.layer ?? face.layer) : face.layer),
          ao: 222,
          flags: 1,
        });
    }
  }
  const gableT = wallThicknessM(kit, 1);
  const dadoByZ = [kit.walls.back.dado, kit.walls.front.dado] as const;
  for (const sx of [-1, 1] as const)
    for (const sz of [-1, 1] as const) {
      const end = sz < 0 ? kit.walls.back : kit.walls.front;
      const dadoTop = Math.min(wallTopM, floorM + (dadoByZ[sz < 0 ? 0 : 1]?.h ?? 0) / 1000);
      const clearTop = Math.min(wallTopM, floorM + CLEARANCE_M + 0.001);
      const gableSide = sx < 0 ? 1 : 3;
      const endSide = sz < 0 ? 2 : 0;
      const lowSection = cornerSection(
        bounds,
        sx,
        sz,
        clearanceThicknessM(plan, gableSide, bounds, gableT),
        clearanceThicknessM(plan, endSide, bounds, end.t / 1000),
      );
      const fullSection = cornerSection(bounds, sx, sz, gableT, end.t / 1000);
      if (dadoTop > floorM)
        emitCornerBand(
          writer,
          plan,
          unit,
          floorM,
          lowSection,
          floorM,
          dadoTop,
          {
            layer: kitLayer(kit, end.dado?.layer ?? end.layer),
            ao: 205,
          },
          false,
        );
      if (clearTop > dadoTop)
        emitCornerBand(
          writer,
          plan,
          unit,
          floorM,
          lowSection,
          dadoTop,
          clearTop,
          {
            layer: kitLayer(kit, end.layer),
            ao: 222,
          },
          false,
        );
      if (wallTopM > clearTop)
        emitCornerBand(writer, plan, unit, floorM, fullSection, clearTop, wallTopM, {
          layer: kitLayer(kit, end.layer),
          ao: 222,
        });
    }
}

function frameBox(
  writer: MeshWriter,
  plan: BuildingPlanView,
  unit: number,
  opening: AdobeOpening,
  center: readonly [number, number, number],
  size: readonly [number, number, number],
  layer: number,
  floorM: number,
  flags = 1,
): void {
  box(writer, {
    center,
    size,
    origin: opening.origin,
    yaw: opening.yaw,
    unit,
    localGroundM: floorM,
    facade: 1 << opening.yaw,
    layer,
    ao: 205,
    flags,
  });
}

function emitAdobeFrames(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  sink: RecipeSink,
  floorM: number,
  openings: readonly AdobeOpening[],
  lod: 0 | 1,
): void {
  const timber = kitLayer(kit, 'lattice_wood', 'timber_carved', 'timber_raw');
  const doorLayer = kitLayer(kit, 'door_carved', 'timber_carved');
  const dark = kitLayer(kit, 'mud_plaster_ochre', 'adobe_brick');
  const frameM = Math.max(0.1, kit.door.frame / 1000);
  for (const opening of openings) {
    if (opening.kind === 'lattice') continue;
    const width = opening.x1 - opening.x0;
    const height = opening.y1 - opening.y0;
    const x = (opening.x0 + opening.x1) / 2;
    const depth = Math.min(opening.thicknessM, frameM);
    const layer = opening.kind === 'door' ? doorLayer : timber;
    frameBox(
      sink.shell,
      plan,
      unit,
      opening,
      [opening.x0 + frameM / 2, opening.y0 + height / 2, 0],
      [frameM, height, depth],
      layer,
      floorM,
    );
    frameBox(
      sink.shell,
      plan,
      unit,
      opening,
      [opening.x1 - frameM / 2, opening.y0 + height / 2, 0],
      [frameM, height, depth],
      layer,
      floorM,
    );
    frameBox(
      sink.shell,
      plan,
      unit,
      opening,
      [x, opening.y1 - frameM / 2, 0],
      [width, frameM, depth],
      layer,
      floorM,
    );
    if (opening.kind === 'window') {
      if (lod === 1) continue;
      frameBox(
        sink.shell,
        plan,
        unit,
        opening,
        [x, opening.y0 + frameM / 2, 0],
        [width, frameM, depth],
        layer,
        floorM,
      );
      const innerW = width - frameM * 2;
      const innerH = height - frameM * 2;
      frameBox(
        sink.shell,
        plan,
        unit,
        opening,
        [x, (opening.y0 + opening.y1) / 2, -0.08],
        [innerW, innerH, 0.025],
        dark,
        floorM,
        1 << 2,
      );
      const bars = 2;
      for (let index = 1; index <= bars; index += 1)
        frameBox(
          sink.shell,
          plan,
          unit,
          opening,
          [
            opening.x0 + frameM + (innerW * index) / (bars + 1),
            (opening.y0 + opening.y1) / 2,
            -0.06,
          ],
          [0.045, innerH, 0.04],
          timber,
          floorM,
          (1 << 2) | (1 << 3),
        );
      frameBox(
        sink.shell,
        plan,
        unit,
        opening,
        [x, (opening.y0 + opening.y1) / 2, -0.055],
        [innerW, 0.045, 0.04],
        timber,
        floorM,
        (1 << 2) | (1 << 3),
      );
      continue;
    }
    if (opening.thresholdM > 0)
      frameBox(
        sink.shell,
        plan,
        unit,
        opening,
        [x, opening.y0 + opening.thresholdM / 2, 0],
        [opening.clearWidthM, opening.thresholdM, opening.thicknessM],
        kitLayer(kit, 'brick_fired'),
        floorM,
      );
    const world = transformPoint(
      [x, opening.y0 + opening.thresholdM + opening.clearHeightM / 2, -0.08],
      { origin: opening.origin, yaw: opening.yaw },
    );
    sink.doors.push(
      unit,
      opening.side,
      world[0],
      world[1],
      world[2],
      opening.yaw,
      opening.clearWidthM,
      opening.clearHeightM,
      0.08,
      0.025,
    );
  }
}

function emitRoundedBase(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  writer: MeshWriter,
  floorM: number,
  bounds: BodyBounds,
): void {
  const layer = kitLayer(kit, 'brick_fired', 'adobe_brick');
  const material = { layer, ao: 205, unit, localGroundM: floorM, flags: 1 } as const;
  const transform = { origin: hallOrigin(plan), yaw: plan.yaw } as const;
  const rings = [
    { expand: 0.08, cut: 0.22, y: floorM },
    { expand: 0.04, cut: 0.18, y: floorM + 0.025 },
    { expand: 0, cut: WALL_CHAMFER_M, y: floorM + 0.05 },
  ].map(({ expand, cut, y }) => {
    const left = bounds.left - expand;
    const right = bounds.right + expand;
    const back = bounds.back - expand;
    const front = bounds.front + expand;
    return [
      [left + cut, y, front],
      [right - cut, y, front],
      [right, y, front - cut],
      [right, y, back + cut],
      [right - cut, y, back],
      [left + cut, y, back],
      [left, y, back + cut],
      [left, y, front - cut],
    ] as const;
  });
  for (let ring = 0; ring < rings.length - 1; ring += 1)
    for (let edge = 0; edge < 8; edge += 1) {
      const next = (edge + 1) % 8;
      quad(
        writer,
        [
          rings[ring]![edge]!,
          rings[ring]![next]!,
          rings[ring + 1]![next]!,
          rings[ring + 1]![edge]!,
        ],
        material,
        transform,
      );
    }
}

function emitFlatRoof(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
  floorM: number,
  bounds: BodyBounds,
): void {
  const width = bounds.right - bounds.left;
  const depth = bounds.front - bounds.back;
  const cx = (bounds.left + bounds.right) / 2;
  const cz = (bounds.back + bounds.front) / 2;
  const deckTopM = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000;
  const slabM = 0.2;
  const origin = hallOrigin(plan);
  box(sink.roof, {
    center: [cx, deckTopM - slabM / 2, cz],
    size: [width, slabM, depth],
    origin,
    yaw: plan.yaw,
    unit,
    localGroundM: floorM,
    layer: kitLayer(kit, 'joist_soffit'),
    ao: 205,
  });
  box(sink.roof, {
    center: [cx, deckTopM - 0.01, cz],
    size: [width, 0.02, depth],
    origin,
    yaw: plan.yaw,
    unit,
    localGroundM: floorM,
    layer: kitLayer(kit, 'mud_roof'),
    ao: 235,
  });
  emitParapet({
    writer: sink.roof,
    plan,
    unit,
    deckTopM,
    heightMm: variantNumber(kit, 'parapetMm', 450),
    wallLayer: kitLayer(kit, 'mud_roof', 'mud_plaster_ochre'),
    copingLayer: kitLayer(kit, 'parapet_coping'),
    localGroundM: floorM,
    boundsM: [bounds.left, bounds.back, bounds.right, bounds.front],
    lod,
  });
  const joists = {
    writer: sink.roof,
    plan,
    unit,
    undersideM: deckTopM - slabM,
    spacingMm: variantNumber(kit, 'joistSpacingMm', 600),
    overhangMm: variantNumber(kit, 'joistOverhangMm', kit.style === 'adobe' ? 300 : 100),
    layer: kitLayer(kit, 'timber_raw'),
    localGroundM: floorM,
    boundsM: [bounds.left, bounds.back, bounds.right, bounds.front] as const,
    lod,
  };
  emitJoistEnds(joists);
  emitWaterspout(joists);
}
function emitFacetedBody(
  writer: MeshWriter,
  material: PrimitiveMaterial,
  origin: Vec3,
  yaw: Yaw4,
  rings: readonly (readonly [y: number, radius: number])[],
  sides: number,
): void {
  for (let ring = 0; ring < rings.length - 1; ring += 1)
    for (let side = 0; side < sides; side += 1) {
      const next = (side + 1) % sides;
      const angle = (Math.PI * 2 * side) / sides;
      const nextAngle = (Math.PI * 2 * next) / sides;
      const low = rings[ring]!;
      const high = rings[ring + 1]!;
      quad(
        writer,
        [
          [Math.sin(angle) * low[1], low[0], Math.cos(angle) * low[1]],
          [Math.sin(nextAngle) * low[1], low[0], Math.cos(nextAngle) * low[1]],
          [Math.sin(nextAngle) * high[1], high[0], Math.cos(nextAngle) * high[1]],
          [Math.sin(angle) * high[1], high[0], Math.cos(angle) * high[1]],
        ],
        material,
        { origin, yaw },
      );
    }
}

function emitTangStupa(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
  floorM: number,
  counts: AdobeCounter,
): void {
  const finialHeightMm = Math.max(
    600,
    Math.min(1_200, plan.roof[2] - plan.roof[1] - 100, Math.round(plan.footprint[2] * 0.1)),
  );
  const topM = (plan.elev[0] + plan.elev[1] + plan.roof[2]) / 1000;
  const baseM = topM - finialHeightMm / 1000;
  const heightM = finialHeightMm / 1000;
  const layer = kitLayer(kit, 'timber_carved', 'parapet_coping');
  const common = {
    origin: hallOrigin(plan),
    yaw: plan.yaw,
    unit,
    localGroundM: floorM,
    layer,
    ao: 225,
  } as const;
  emitFacetedBody(
    sink.roof,
    common,
    hallOrigin(plan),
    plan.yaw,
    [
      [baseM, heightM * 0.16],
      [baseM + heightM * 0.1, heightM * 0.29],
      [baseM + heightM * 0.28, heightM * 0.3],
      [baseM + heightM * 0.4, heightM * 0.2],
    ],
    lod === 0 ? 12 : 8,
  );
  counts.tangStupa += 1;
  counts.tangStupaBowls += 1;
  const rings = lod === 0 ? 5 : 3;
  const ringBase = baseM + heightM * 0.38;
  const ringSpan = heightM * 0.38;
  for (let index = 0; index < rings; index += 1) {
    const t = index / (rings - 1);
    prism(sink.roof, {
      ...common,
      center: [0, ringBase + ringSpan * t, 0],
      radiusM: heightM * (0.2 - t * 0.07),
      heightM: heightM * 0.045,
      sides: lod === 0 ? 12 : 8,
    });
    counts.tangStupaRings += 1;
  }
  emitFacetedBody(
    sink.roof,
    common,
    hallOrigin(plan),
    plan.yaw,
    [
      [topM - heightM * 0.2, heightM * 0.035],
      [topM - heightM * 0.12, heightM * 0.1],
      [topM - heightM * 0.04, heightM * 0.07],
      [topM, 0],
    ],
    lod === 0 ? 10 : 6,
  );
  counts.tangStupaJewels += 1;
}

function emitTangEave(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  sink: RecipeSink,
  floorM: number,
  bounds: BodyBounds,
): void {
  const y = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000;
  const layer = kitLayer(kit, 'timber_carved', 'timber_raw');
  const common = {
    origin: hallOrigin(plan),
    yaw: plan.yaw,
    unit,
    localGroundM: floorM,
    layer,
    ao: 195,
  } as const;
  const overhang = 0.4;
  const width = bounds.right - bounds.left;
  const depth = bounds.front - bounds.back;
  for (const [center, size] of [
    [
      [(bounds.left + bounds.right) / 2, y - 0.12, bounds.front + overhang / 2],
      [width + overhang * 2, 0.24, overhang],
    ],
    [
      [(bounds.left + bounds.right) / 2, y - 0.12, bounds.back - overhang / 2],
      [width + overhang * 2, 0.24, overhang],
    ],
    [
      [bounds.left - overhang / 2, y - 0.12, (bounds.back + bounds.front) / 2],
      [overhang, 0.24, depth],
    ],
    [
      [bounds.right + overhang / 2, y - 0.12, (bounds.back + bounds.front) / 2],
      [overhang, 0.24, depth],
    ],
  ] as const)
    box(sink.roof, { ...common, center, size });
}

function emitVariants(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
  floorM: number,
  definition: ReturnType<typeof recipeDefinition>,
  bounds: BodyBounds,
): void {
  const [width, depth] = hallSizeM(plan);
  const trellisIndex = plan.parts?.findIndex(([kind]) => kind === 7) ?? -1;
  const trellis = trellisIndex >= 0 ? plan.parts?.[trellisIndex] : undefined;
  if (trellis) {
    const local = localXZ(plan, trellis[1] / 1000, trellis[2] / 1000);
    emitTrellis({
      writer: sink.roof,
      plan,
      unit: sink.partUnits[trellisIndex] ?? unit,
      center: local,
      size: [trellis[3] / 1000, trellis[4] / 1000],
      clearanceMm: variantNumber(kit, 'trellisClearanceMm', 2_300),
      layer: kitLayer(kit, 'timber_raw'),
      localGroundM: floorM,
      lod,
    });
  }
  if (definition.front === 'brick_lattice' || plan.facility === 'storehouse')
    emitBrickLattice({
      writer: sink.shell,
      plan,
      unit,
      widthM: Math.max(1.8, (bounds.right - bounds.left) * 0.55),
      heightM: 1.25,
      baseM: floorM + 1.3,
      zM: bounds.front - wallThicknessM(kit, 0) / 2 - 0.01,
      thicknessM: 0.12,
      layer: kitLayer(kit, 'brick_lattice'),
      localGroundM: floorM,
      lod,
    });
  const formal = definition.front === 'tang_wood_eave';
  if (formal) emitTangEave(plan, unit, kit, sink, floorM, bounds);
  const shouldIwan = definition.front === 'carved_shopfront' || plan.facility === 'inn';
  if (shouldIwan)
    emitIwan({
      sink,
      plan,
      unit,
      floorM,
      depthMm: Math.max(1_500, Math.min(2_400, Math.round(depth * 350))),
      clearHeightMm: 2_300,
      columnCount: width >= 8 ? 4 : width >= 6 ? 3 : 2,
      timberLayer: kitLayer(kit, 'timber_carved', 'timber_raw'),
      roofLayer: kitLayer(kit, 'mud_roof'),
      lod,
      wallFrontM: bounds.front,
    });
}

function emitRoof(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
  floorM: number,
  bounds: BodyBounds,
  counts: AdobeCounter,
): void {
  if (plan.finial === 'tang_stupa' && plan.roof[0] === ROOF_STYLE.Dome)
    throw new RangeError('BUILDGEN_ADOBE_TANG_FORBIDS_DOME');
  if (plan.roof[0] === ROOF_STYLE.Flat) {
    emitFlatRoof(plan, unit, kit, lod, sink, floorM, bounds);
    return;
  }
  if (plan.roof[0] === ROOF_STYLE.Cuanjian) {
    const availableMm = plan.roof[2] - plan.roof[1];
    const finialHeightMm = Math.max(600, Math.min(1_200, availableMm - 100));
    if (availableMm <= finialHeightMm) throw new RangeError('BUILDGEN_ADOBE_CUANJIAN_TOO_LOW');
    const ordinaryFinialLayer = kit.layers.length;
    const roofSink =
      plan.finial === 'tang_stupa'
        ? { ...sink, roof: suppressLayer(sink.roof, ordinaryFinialLayer) }
        : sink;
    writePyramidRoof({
      plan,
      unit,
      sink: roofSink,
      lod,
      finialHeightMm,
      liftMm: 0,
      outsetMm: 0,
      layer: kitLayer(kit, 'mud_roof'),
      soffitLayer: kitLayer(kit, 'joist_soffit'),
      ridgeLayer: kitLayer(kit, 'parapet_coping'),
      ornamentLayer: ordinaryFinialLayer,
    });
    if (plan.finial === 'tang_stupa') emitTangStupa(plan, unit, kit, lod, sink, floorM, counts);
    return;
  }
  if (plan.finial !== 'tang_stupa') {
    if (plan.roof[0] === ROOF_STYLE.Dome) {
      writeDomeRoof({
        plan,
        unit,
        sink,
        lod,
        layer: kitLayer(kit, 'dome_plaster'),
        soffitLayer: kitLayer(kit, 'joist_soffit'),
      });
      counts.dome += 1;
    } else roofMesherFor(plan.roof[0])(plan, unit, sink, { kit, lod });
    return;
  }
  throw new RangeError('BUILDGEN_ADOBE_TANG_FINIAL_REQUIRES_CUANJIAN');
}

function emitAdobe(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
): AdobeComponentCounts {
  const counts = emptyComponentCounts();
  const definition = recipeDefinition(plan, kit);
  const bounds = bodyBounds(plan, kit, definition);
  const floorM = (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000;
  const wallTopM =
    plan.roof[0] === ROOF_STYLE.Flat
      ? (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000 - 0.2
      : (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000;
  if (wallTopM - floorM < CLEARANCE_M) throw new RangeError('BUILDGEN_ADOBE_WALL_TOO_LOW');
  const writer = facadeWriter(sink.shell, plan, kit);
  const entrances = plan.entrances.map(
    ([side, offset, width]) => [side, offset, Math.max(1_200, width)] as const,
  );
  const context = { writer, plan, unit, localGroundM: floorM };
  emitPlatform(context, kit, entrances);
  emitSteps(context, kit, entrances);
  emitRoundedBase(plan, unit, kit, writer, floorM, bounds);
  const lattice = definition.front === 'brick_lattice' || plan.facility === 'storehouse';
  const openings = adobeOpenings(plan, kit, floorM, wallTopM, lod, bounds, lattice);
  emitAdobeWalls(plan, unit, kit, writer, floorM, wallTopM, openings, bounds);
  emitAdobeFrames(plan, unit, kit, { ...sink, shell: writer }, floorM, openings, lod);
  emitRoof(plan, unit, kit, lod, sink, floorM, bounds, counts);
  if (plan.roof[0] === ROOF_STYLE.Flat && definition.front === 'tang_wood_eave')
    emitJoistEnds({
      writer: sink.roof,
      plan,
      unit,
      undersideM: wallTopM + JOIST_RECESS_M,
      spacingMm: variantNumber(kit, 'joistSpacingMm', 600),
      overhangMm: 400,
      layer: kitLayer(kit, 'timber_carved', 'timber_raw'),
      localGroundM: floorM,
      boundsM: [bounds.left, bounds.back, bounds.right, bounds.front],
      lod,
    });
  emitVariants(plan, unit, kit, lod, sink, floorM, definition, bounds);
  return counts;
}

export function emitAdobeWithCounts(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
): AdobeComponentCounts {
  return emitAdobe(plan, unit, kit, lod, sink);
}

export const adobeRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  emitAdobe(plan, unit, kit, lod, sink);
};

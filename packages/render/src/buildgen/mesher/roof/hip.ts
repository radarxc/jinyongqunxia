import type { BuildingPlanView, BuildKitView, MeshWriter, RecipeSink, Yaw4 } from '../../types';
import {
  quad,
  transformNormal,
  transformPoint,
  type PrimitiveMaterial,
  type Vec3,
} from '../core/prims';
import { columnLayout } from '../parts/columns';
import { createWorldCornerDeformer, insetWingCorner, type WingDimensions } from './corner';
import { gableRoofHeightAt } from './gable';
import { profileHeightAt, qingJujia, songZhe } from './profile';
import { cornerUStations, roofPatchTStations } from './patch';
import {
  assertChiweiHeight,
  HALL_CHIWEI_HEIGHT_MM,
  writeChiweiPair,
  writeDaliSquareEnds,
} from './ornaments';

export interface HipRoofOptions extends WingDimensions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly kit?: BuildKitView | undefined;
  readonly profile?: 'song_zhe' | 'qing_jujia' | undefined;
  readonly eaveProjectionMm?: number | undefined;
  /** Chiwei rise above the main-ridge top (tech/16 §3: 900–1300 mm). */
  readonly ornamentHeightMm?: number | undefined;
  /** Main-ridge body: tile ridge foot = roof[2] - this (planner: 350 / 450 / hall 650). */
  readonly ridgeHeightMm?: number | undefined;
  /** Bracket projection outside the column line (planner: 450 when `brackets: true`). */
  readonly bracketMm?: number | undefined;
  readonly ridgeEnds?: string | undefined;
  readonly layer?: number | undefined;
  readonly ridgeLayer?: number | undefined;
  readonly soffitLayer?: number | undefined;
  readonly ornamentLayer?: number | undefined;
  readonly shellThicknessMm?: number | undefined;
  readonly lod?: 0 | 1 | undefined;
}

export interface HipFrame {
  readonly halfWidthM: number;
  readonly halfDepthM: number;
  readonly ridgeHalfM: number;
  readonly dripY: number;
  readonly ridgeY: number;
  readonly ridgeTopY: number;
}
interface FaceSpec {
  readonly eave: readonly [Vec3, Vec3];
  readonly ridge: readonly [Vec3, Vec3];
  readonly corners: readonly [Vec3, Vec3];
}
interface FaceWriteOptions {
  readonly writer: MeshWriter;
  readonly face: FaceSpec;
  readonly heightAt: (t: number) => number;
  readonly tStations: readonly number[];
  readonly wing: WingDimensions;
  readonly material: PrimitiveMaterial;
  readonly undersideMaterial: PrimitiveMaterial;
  readonly thicknessM: number;
  readonly origin: Vec3;
  readonly yaw: Yaw4;
}

function mix(a: Vec3, b: Vec3, amount: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
}
function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function normal(du: Vec3, dt: Vec3): Vec3 {
  let x = du[1] * dt[2] - du[2] * dt[1];
  let y = du[2] * dt[0] - du[0] * dt[2];
  let z = du[0] * dt[1] - du[1] * dt[0];
  if (y < 0) [x, y, z] = [-x, -y, -z];
  const length = Math.hypot(x, y, z);
  if (!(length > 0)) return [0, 1, 0];
  return [x / length, y / length, z / length];
}
function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function material(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return { layer, unit, localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000 };
}
export interface BalancedRidgeOptions {
  readonly path: readonly Vec3[];
  readonly kind: 'main' | 'vertical';
  readonly heightMm: number;
  readonly material: PrimitiveMaterial;
  readonly origin: Vec3;
  readonly yaw: Yaw4;
}
function addRidgeVertex(options: BalancedRidgeOptions, writer: MeshWriter, point: Vec3): number {
  const world = transformPoint(point, options);
  return writer.addVertex({
    ...options.material,
    position: world,
    normal: transformNormal([0, 1, 0], options.yaw),
    uv: [point[0], point[1]],
    localHeightCm: Math.max(0, Math.round((world[1] - (options.material.localGroundM ?? 0)) * 100)),
  });
}
function ridgeRight(path: readonly Vec3[], index: number): readonly [number, number] {
  const before = path[Math.max(0, index - 1)]!;
  const after = path[Math.min(path.length - 1, index + 1)]!;
  const dx = after[0] - before[0];
  const dz = after[2] - before[2];
  const length = Math.hypot(dx, dz);
  if (!(length > 0)) throw new RangeError('BUILDGEN_DEGENERATE_POLYLINE');
  return [dz / length, -dx / length];
}
/** Shared-section ridge writer: each mirrored cross-section vertex is emitted once. */
export function writeBalancedRidge(writer: MeshWriter, options: BalancedRidgeOptions): void {
  const halfBottom = (options.kind === 'main' ? 300 : 250) / 2_000;
  const halfTop = halfBottom * 0.62;
  const height = options.heightMm / 1_000;
  const profile = [
    [-halfBottom, 0],
    [halfBottom, 0],
    [halfTop, height],
    [-halfTop, height],
  ] as const;
  const sections = options.path.map((point, index) => {
    const [rx, rz] = ridgeRight(options.path, index);
    return profile.map(([lateral, vertical]) =>
      addRidgeVertex(options, writer, [
        point[0] + rx * lateral,
        point[1] + vertical,
        point[2] + rz * lateral,
      ]),
    );
  });
  for (let segment = 0; segment < sections.length - 1; segment += 1)
    for (let edge = 0; edge < 4; edge += 1) {
      const next = (edge + 1) % 4;
      writer.addTriangle(
        sections[segment]![edge]!,
        sections[segment + 1]![edge]!,
        sections[segment + 1]![next]!,
      );
      writer.addTriangle(
        sections[segment]![edge]!,
        sections[segment + 1]![next]!,
        sections[segment]![next]!,
      );
    }
  for (const [section, reverse] of [
    [sections[0]!, true],
    [sections.at(-1)!, false],
  ] as const) {
    if (reverse) {
      writer.addTriangle(section[0]!, section[2]!, section[1]!);
      writer.addTriangle(section[0]!, section[3]!, section[2]!);
    } else {
      writer.addTriangle(section[0]!, section[1]!, section[2]!);
      writer.addTriangle(section[0]!, section[2]!, section[3]!);
    }
  }
}
function localPoint(face: FaceSpec, u: number, t: number, height: number): Vec3 {
  const point = mix(mix(face.eave[0], face.eave[1], u), mix(face.ridge[0], face.ridge[1], u), t);
  return [point[0], height, point[2]];
}
function faceDeformer(face: FaceSpec, wing: WingDimensions) {
  return createWorldCornerDeformer({
    ...wing,
    eaveLine: face.eave,
    corners: face.corners,
    hipPointAt: (end, t) => localPoint(face, end, t, 0),
  });
}
function seamPoints(
  face: FaceSpec,
  endpoint: 0 | 1,
  tStations: readonly number[],
  heightAt: (t: number) => number,
  wing: WingDimensions,
): readonly Vec3[] {
  const deform = faceDeformer(face, wing);
  return tStations.map((t) =>
    deform({ u: endpoint, t, point: localPoint(face, endpoint, t, heightAt(t)) }),
  );
}

/** Song ridge length is W-D; Qing push-shan adds 0.1D to the total ridge length. */
export function hipRidgeHalfM(
  widthM: number,
  depthM: number,
  profile: 'song_zhe' | 'qing_jujia',
): number {
  if (!(widthM > 0 && depthM > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_HIP_SPAN');
  const base = Math.max(0, (widthM - depthM) / 2);
  return Math.min(widthM / 2, base + (profile === 'qing_jujia' ? depthM * 0.05 : 0));
}

export interface EaveBearer {
  /** Horizontal drip -> eave-purlin run, the straight flying-rafter tail. */
  readonly tailRunM: number;
  /** Eave purlin (橑檐方) height; the structural profile starts here. */
  readonly purlinY: number;
}
/**
 * Mirrors the planner's eave formula: drip = purlin - eave * 0.4 + 40 - bracket / 10, with the
 * purlin pushed out by the bracket projection. Without brackets this is gableRoofHeightAt's tail.
 */
export function eaveBearer(dripY: number, eaveProjectionM: number, bracketM: number): EaveBearer {
  if (!(bracketM >= 0 && bracketM < eaveProjectionM))
    throw new RangeError('BUILDGEN_ROOF_INVALID_BRACKET');
  return {
    tailRunM: eaveProjectionM - bracketM,
    purlinY: dripY + eaveProjectionM * 0.4 - 0.04 + bracketM / 10,
  };
}
/** Drip -> eave purlin -> structural profile; identical to gableRoofHeightAt when bracket = 0. */
export function bracketedRoofHeightAt(
  t: number,
  halfDepthM: number,
  eaveProjectionM: number,
  bearer: EaveBearer,
  dripY: number,
  profileMm: readonly number[],
): number {
  if (bearer.tailRunM === eaveProjectionM)
    return gableRoofHeightAt(t, halfDepthM, eaveProjectionM, dripY, profileMm);
  const tailFraction = bearer.tailRunM / halfDepthM;
  if (t <= tailFraction) return dripY + (bearer.purlinY - dripY) * (t / tailFraction);
  return (
    bearer.purlinY + profileHeightAt(profileMm, (t - tailFraction) / (1 - tailFraction)) / 1000
  );
}

export function hipFrame(
  plan: BuildingPlanView,
  profile: 'song_zhe' | 'qing_jujia',
  ridgeBodyMm: number,
  columnSpansM?: readonly [widthM: number, depthM: number],
): HipFrame {
  const halfWidthM = plan.footprint[2] / 2000 - 0.04;
  const halfDepthM = plan.footprint[3] / 2000 - 0.04;
  const baseY = (plan.elev[0] + plan.elev[1]) / 1000;
  const ridgeTopY = baseY + plan.roof[2] / 1000;
  return {
    halfWidthM,
    halfDepthM,
    ridgeHalfM: hipRidgeHalfM(
      columnSpansM?.[0] ?? halfWidthM * 2,
      columnSpansM?.[1] ?? halfDepthM * 2,
      profile,
    ),
    dripY: baseY + plan.roof[1] / 1000,
    ridgeY: ridgeTopY - ridgeBodyMm / 1000,
    ridgeTopY,
  };
}

function addFaceVertex(
  options: FaceWriteOptions,
  point: Vec3,
  surfaceNormal: Vec3,
  uv: readonly [number, number],
  underside: boolean,
): number {
  const position: Vec3 = underside ? [point[0], point[1] - options.thicknessM, point[2]] : point;
  const world = transformPoint(position, { origin: options.origin, yaw: options.yaw });
  const sign = underside ? -1 : 1;
  const worldNormal = transformNormal(
    [surfaceNormal[0] * sign, surfaceNormal[1] * sign, surfaceNormal[2] * sign],
    options.yaw,
  );
  const mat = underside ? options.undersideMaterial : options.material;
  return options.writer.addVertex({
    ...mat,
    position: world,
    normal: worldNormal,
    uv,
    localHeightCm: Math.max(0, Math.round((world[1] - (mat.localGroundM ?? 0)) * 100)),
  });
}

/** A triangular/trapezoidal face with one shared vertex at every collapsed ridge endpoint. */
function writeHipFace(options: FaceWriteOptions): void {
  const { face } = options;
  const eaveLengthMm = distance(face.eave[0], face.eave[1]) * 1000;
  const cornerZoneMm = Math.min(eaveLengthMm / 2, Math.max(1, eaveLengthMm / 3));
  const uStations = cornerUStations(eaveLengthMm, cornerZoneMm, 3);
  const deform = faceDeformer(face, options.wing);
  const rows: Array<{ readonly vertices: readonly number[]; readonly points: readonly Vec3[] }> =
    [];
  let previousArc = new Array<number>(uStations.length).fill(0);
  for (let row = 0; row < options.tStations.length; row += 1) {
    const t = options.tStations[row]!;
    const positions = uStations.map((u) =>
      deform({
        u,
        t,
        point: localPoint(face, u, t, options.heightAt(t)),
      }),
    );
    const collapsed = positions.every((point) => distance(point, positions[0]!) < 1e-9);
    const rowUs = collapsed ? [0.5] : uStations;
    const rowPoints = collapsed ? [positions[0]!] : positions;
    const arcs = rowUs.map((u, column) => {
      if (row === 0) return 0;
      const previous = rows[row - 1]!;
      const previousPoint =
        previous.points.length === 1
          ? previous.points[0]!
          : previous.points[Math.min(column, previous.points.length - 1)]!;
      return (
        (previousArc[Math.min(column, previousArc.length - 1)] ?? 0) +
        distance(previousPoint, rowPoints[column]!)
      );
    });
    const vertices = rowPoints.map((point, column) => {
      const u = rowUs[column]!;
      const du = subtract(
        rowPoints[Math.min(rowPoints.length - 1, column + 1)]!,
        rowPoints[Math.max(0, column - 1)]!,
      );
      const nextT = options.tStations[Math.min(options.tStations.length - 1, row + 1)]!;
      const next = deform({
        u,
        t: nextT,
        point: localPoint(face, u, nextT, options.heightAt(nextT)),
      });
      const previousT = options.tStations[Math.max(0, row - 1)]!;
      const previous = deform({
        u,
        t: previousT,
        point: localPoint(face, u, previousT, options.heightAt(previousT)),
      });
      return addFaceVertex(
        options,
        point,
        normal(du, subtract(next, previous)),
        [(u * eaveLengthMm) / 1000, arcs[column]!],
        false,
      );
    });
    const underside = rowPoints.map((point, column) => {
      const u = rowUs[column]!;
      const du = subtract(
        rowPoints[Math.min(rowPoints.length - 1, column + 1)]!,
        rowPoints[Math.max(0, column - 1)]!,
      );
      const dt: Vec3 = [face.ridge[0][0] - face.eave[0][0], 1, face.ridge[0][2] - face.eave[0][2]];
      return addFaceVertex(
        options,
        point,
        normal(du, dt),
        [(u * eaveLengthMm) / 1000, arcs[column]!],
        true,
      );
    });
    rows.push({ vertices: [...vertices, ...underside], points: rowPoints });
    previousArc = arcs;
  }
  const topCount = (row: number) => rows[row]!.vertices.length / 2;
  for (let row = 0; row < rows.length - 1; row += 1) {
    const lower = rows[row]!;
    const upper = rows[row + 1]!;
    const lowerCount = topCount(row);
    const upperCount = topCount(row + 1);
    if (upperCount === 1) {
      for (let column = 0; column < lowerCount - 1; column += 1) {
        options.writer.addTriangle(
          lower.vertices[column]!,
          lower.vertices[column + 1]!,
          upper.vertices[0]!,
        );
        options.writer.addTriangle(
          lower.vertices[lowerCount + column + 1]!,
          lower.vertices[lowerCount + column]!,
          upper.vertices[upperCount]!,
        );
      }
    } else {
      for (let column = 0; column < lowerCount - 1; column += 1) {
        const a = lower.vertices[column]!;
        const b = lower.vertices[column + 1]!;
        const c = upper.vertices[column + 1]!;
        const d = upper.vertices[column]!;
        options.writer.addTriangle(a, b, c);
        options.writer.addTriangle(a, c, d);
        const offsetA = lowerCount;
        const offsetB = upperCount;
        options.writer.addTriangle(
          upper.vertices[offsetB + column + 1]!,
          lower.vertices[offsetA + column + 1]!,
          lower.vertices[offsetA + column]!,
        );
        options.writer.addTriangle(
          upper.vertices[offsetB + column]!,
          upper.vertices[offsetB + column + 1]!,
          lower.vertices[offsetA + column]!,
        );
      }
    }
  }
  const eave = rows[0]!.points;
  for (let column = 0; column < eave.length - 1; column += 1)
    quad(
      options.writer,
      [
        transformPoint(eave[column]!, { origin: options.origin, yaw: options.yaw }),
        transformPoint([eave[column]![0], eave[column]![1] - 0.12, eave[column]![2]], {
          origin: options.origin,
          yaw: options.yaw,
        }),
        transformPoint([eave[column + 1]![0], eave[column + 1]![1] - 0.12, eave[column + 1]![2]], {
          origin: options.origin,
          yaw: options.yaw,
        }),
        transformPoint(eave[column + 1]!, { origin: options.origin, yaw: options.yaw }),
      ],
      options.undersideMaterial,
    );
}

function hipFaces(frame: HipFrame, outsetMm: number): readonly FaceSpec[] {
  const { halfWidthM: x, halfDepthM: z, ridgeHalfM: r, dripY, ridgeY } = frame;
  const nw: Vec3 = [-x, dripY, -z];
  const ne: Vec3 = [x, dripY, -z];
  const se: Vec3 = [x, dripY, z];
  const sw: Vec3 = [-x, dripY, z];
  const inNw = insetWingCorner(nw, outsetMm);
  const inNe = insetWingCorner(ne, outsetMm);
  const inSe = insetWingCorner(se, outsetMm);
  const inSw = insetWingCorner(sw, outsetMm);
  return [
    {
      eave: [inSw, inSe],
      ridge: [
        [-r, ridgeY, 0],
        [r, ridgeY, 0],
      ],
      corners: [sw, se],
    },
    {
      eave: [inNe, inNw],
      ridge: [
        [r, ridgeY, 0],
        [-r, ridgeY, 0],
      ],
      corners: [ne, nw],
    },
    {
      eave: [inSe, inNe],
      ridge: [
        [r, ridgeY, 0],
        [r, ridgeY, 0],
      ],
      corners: [se, ne],
    },
    {
      eave: [inNw, inSw],
      ridge: [
        [-r, ridgeY, 0],
        [-r, ridgeY, 0],
      ],
      corners: [nw, sw],
    },
  ];
}
function structuralSpans(
  plan: BuildingPlanView,
  kit?: BuildKitView,
): readonly [number, number] | undefined {
  if (!kit) return undefined;
  const layout = columnLayout(plan, kit);
  return [layout.xM.at(-1)! - layout.xM[0]!, layout.zM.at(-1)! - layout.zM[0]!];
}

/** Four-slope wudian roof: two trapezoids plus two triangles meeting a W-D main ridge. */
export function writeWudianRoof(options: HipRoofOptions): void {
  const { plan, unit, sink } = options;
  const profileKind = options.profile ?? 'song_zhe';
  const ridgeHeightMm = options.ridgeHeightMm ?? 350;
  const chiweiHeightMm = options.ornamentHeightMm ?? HALL_CHIWEI_HEIGHT_MM;
  assertChiweiHeight(chiweiHeightMm);
  const frame = hipFrame(plan, profileKind, ridgeHeightMm, structuralSpans(plan, options.kit));
  if (!(frame.ridgeY > frame.dripY)) throw new RangeError('BUILDGEN_ROOF_INVALID_HIP_HEIGHT');
  const eaveProjectionM = (options.eaveProjectionMm ?? 800) / 1_000;
  const bearer = eaveBearer(frame.dripY, eaveProjectionM, (options.bracketMm ?? 0) / 1_000);
  const structuralRunM = frame.halfDepthM - bearer.tailRunM;
  const eaveY = bearer.purlinY;
  const riseMm = (frame.ridgeY - eaveY) * 1_000;
  if (!(structuralRunM > 0 && riseMm > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_HIP_SPAN');
  const steps = profileKind === 'qing_jujia' ? 4 : Math.max(2, Math.ceil(structuralRunM / 1.4));
  const heights =
    profileKind === 'qing_jujia'
      ? qingJujia(new Array<number>(steps).fill((structuralRunM * 1_000) / steps)).map(
          (height, _index, values) => (height * riseMm) / values[0]!,
        )
      : songZhe(structuralRunM * 1_000, riseMm, steps);
  const heightAt = (t: number) =>
    bracketedRoofHeightAt(t, frame.halfDepthM, eaveProjectionM, bearer, frame.dripY, heights);
  const tailFraction = bearer.tailRunM / frame.halfDepthM;
  const tStations = roofPatchTStations(steps, tailFraction, options.lod ?? 0);
  const origin: Vec3 = [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000];
  const upper = material(plan, unit, options.layer ?? 0);
  const underside = material(plan, unit, options.soffitLayer ?? 2);
  const ridgeMaterial = material(plan, unit, options.ridgeLayer ?? 1);
  const ornamentMaterial = material(plan, unit, options.ornamentLayer ?? 3);
  const thicknessM = (options.shellThicknessMm ?? 180) / 1000;
  const faces = hipFaces(frame, options.outsetMm);
  const wing = { liftMm: options.liftMm, outsetMm: options.outsetMm } as const;
  for (const face of faces)
    writeHipFace({
      writer: sink.roof,
      face,
      heightAt,
      tStations,
      wing,
      material: upper,
      undersideMaterial: underside,
      thicknessM,
      origin,
      yaw: plan.yaw,
    });
  const ridgeEnds: readonly [Vec3, Vec3] = [
    [-frame.ridgeHalfM, frame.ridgeY, 0],
    [frame.ridgeHalfM, frame.ridgeY, 0],
  ];
  if (frame.ridgeHalfM > 0)
    writeBalancedRidge(sink.roof, {
      path: ridgeEnds,
      kind: 'main',
      heightMm: ridgeHeightMm,
      material: ridgeMaterial,
      origin,
      yaw: plan.yaw,
    });
  const ridgeTStations = [0.05, ...tStations.filter((station) => station > 0.05)];
  for (const face of faces.slice(0, 2))
    for (const index of [0, 1] as const) {
      const path = seamPoints(face, index, ridgeTStations, heightAt, wing).map(
        ([px, py, pz]): Vec3 => [px, py, Math.abs(pz) < 5e-7 ? 0 : pz],
      );
      if (path[0]![2] < 0) path.reverse();
      writeBalancedRidge(sink.roof, {
        path,
        kind: 'vertical',
        heightMm: Math.max(250, Math.min(350, ridgeHeightMm - 20)),
        material: ridgeMaterial,
        origin,
        yaw: plan.yaw,
      });
    }
  const ornamentOptions = { origin, yaw: plan.yaw, material: ornamentMaterial } as const;
  const endStyle = options.ridgeEnds;
  // Ornaments stand on the main ridge: roof[2] stays the ridge top without ornaments (tech/16 §4).
  // A chiwei grows from the ridge foot at the ridge end to 900–1300 mm above the ridge top; the
  // Dali square ends sit on the ridge top and rise 550 mm.
  const ornamentBaseY = endStyle === 'chiwei' ? frame.ridgeY : frame.ridgeTopY;
  const ornamentEnds: readonly [Vec3, Vec3] = [
    [ridgeEnds[0][0], ornamentBaseY, ridgeEnds[0][2]],
    [ridgeEnds[1][0], ornamentBaseY, ridgeEnds[1][2]],
  ];
  if (frame.ridgeHalfM > 0 && endStyle === 'chiwei')
    writeChiweiPair(
      sink.roof,
      ornamentEnds,
      frame.ridgeTopY + chiweiHeightMm / 1000,
      options.lod ?? 0,
      ornamentOptions,
    );
  else if (frame.ridgeHalfM > 0 && endStyle === 'dali_square')
    writeDaliSquareEnds(sink.roof, ornamentEnds, ornamentOptions);
}

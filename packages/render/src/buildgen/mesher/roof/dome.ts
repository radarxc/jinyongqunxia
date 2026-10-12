import type { BuildingPlanView, MeshWriter, RecipeSink } from '../../types';
import { transformNormal, transformPoint, type PrimitiveMaterial, type Vec3 } from '../core/prims';

export interface DomeRoofOptions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly layer?: number | undefined;
  readonly soffitLayer?: number | undefined;
  readonly shellThicknessMm?: number | undefined;
  readonly lod?: 0 | 1 | undefined;
}

function material(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return { layer, unit, localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000 };
}
function addVertex(
  writer: MeshWriter,
  local: Vec3,
  localNormal: Vec3,
  options: DomeRoofOptions,
  mat: PrimitiveMaterial,
): number {
  const origin: Vec3 = [options.plan.footprint[0] / 1000, 0, options.plan.footprint[1] / 1000];
  const position = transformPoint(local, { origin, yaw: options.plan.yaw });
  return writer.addVertex({
    ...mat,
    position,
    normal: transformNormal(localNormal, options.plan.yaw),
    uv: [Math.atan2(local[2], local[0]) / (Math.PI * 2) + 0.5, local[1]],
    localHeightCm: Math.max(0, Math.round((position[1] - (mat.localGroundM ?? 0)) * 100)),
  });
}

function writeDomeSurface(
  writer: MeshWriter,
  options: DomeRoofOptions,
  segments: number,
  rings: number,
  baseY: number,
  topY: number,
  radiusX: number,
  radiusZ: number,
  insetM: number,
  mat: PrimitiveMaterial,
  underside: boolean,
): readonly number[] {
  const ringVertices: number[][] = [];
  for (let ring = 0; ring < rings; ring += 1) {
    const latitude = (Math.PI / 2) * (ring / rings);
    const radial = Math.cos(latitude);
    const y = baseY + (topY - baseY) * Math.sin(latitude) - insetM;
    const vertices: number[] = [];
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (Math.PI * 2 * segment) / segments;
      const point: Vec3 = [
        Math.cos(angle) * radiusX * radial,
        y,
        Math.sin(angle) * radiusZ * radial,
      ];
      const raw: Vec3 = [
        ((Math.cos(angle) * (topY - baseY)) / radiusX) * radial,
        Math.sin(latitude),
        ((Math.sin(angle) * (topY - baseY)) / radiusZ) * radial,
      ];
      const length = Math.hypot(...raw);
      const sign = underside ? -1 : 1;
      vertices.push(
        addVertex(
          writer,
          point,
          [(raw[0] / length) * sign, (raw[1] / length) * sign, (raw[2] / length) * sign],
          options,
          mat,
        ),
      );
    }
    ringVertices.push(vertices);
  }
  const apex = addVertex(writer, [0, topY - insetM, 0], [0, underside ? -1 : 1, 0], options, mat);
  for (let ring = 0; ring < rings - 1; ring += 1)
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      const a = ringVertices[ring]![segment]!;
      const b = ringVertices[ring]![next]!;
      const c = ringVertices[ring + 1]![next]!;
      const d = ringVertices[ring + 1]![segment]!;
      if (underside) {
        writer.addTriangle(c, b, a);
        writer.addTriangle(d, c, a);
      } else {
        writer.addTriangle(a, b, c);
        writer.addTriangle(a, c, d);
      }
    }
  const last = ringVertices.at(-1)!;
  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    if (underside) writer.addTriangle(apex, last[next]!, last[segment]!);
    else writer.addTriangle(last[segment]!, last[next]!, apex);
  }
  return ringVertices[0]!;
}

/** Elliptic rotational dome: 12x6 at LOD0, 8x4 at LOD1. */
export function writeDomeRoof(options: DomeRoofOptions): void {
  const { plan, sink, unit } = options;
  const segments = options.lod === 1 ? 8 : 12;
  const rings = options.lod === 1 ? 4 : 6;
  const base = (plan.elev[0] + plan.elev[1]) / 1000;
  const dripY = base + plan.roof[1] / 1000;
  const topY = base + plan.roof[2] / 1000;
  if (!(topY > dripY)) throw new RangeError('BUILDGEN_ROOF_INVALID_DOME_HEIGHT');
  const radiusX = plan.footprint[2] / 2000 - 0.04;
  const radiusZ = plan.footprint[3] / 2000 - 0.04;
  const thicknessM = (options.shellThicknessMm ?? 180) / 1000;
  const outerEave = writeDomeSurface(
    sink.roof,
    options,
    segments,
    rings,
    dripY,
    topY,
    radiusX,
    radiusZ,
    0,
    material(plan, unit, options.layer ?? 0),
    false,
  );
  const innerEave = writeDomeSurface(
    sink.roof,
    options,
    segments,
    rings,
    dripY,
    topY,
    Math.max(0.04, radiusX - thicknessM),
    Math.max(0.04, radiusZ - thicknessM),
    thicknessM,
    material(plan, unit, options.soffitLayer ?? 2),
    true,
  );
  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    sink.roof.addTriangle(outerEave[segment]!, innerEave[segment]!, innerEave[next]!);
    sink.roof.addTriangle(outerEave[segment]!, innerEave[next]!, outerEave[next]!);
  }
}

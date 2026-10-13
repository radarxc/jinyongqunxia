import {
  BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, DataTexture,
  DoubleSide, Group, InstancedMesh, LineBasicMaterial, LineSegments, LinearFilter, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, Object3D, PlaneGeometry, RepeatWrapping, RGBAFormat,
  RingGeometry, SRGBColorSpace, TextureLoader, Vector3,
} from 'three';
import type { Texture } from 'three';
import type { MapGeometryView, MapNodeView, MapPoint } from './types';

const MAP_SPAN = 20;
const TERRAIN_X = 32;
const TERRAIN_Z = 24;

export function mapPointToWorld(map: MapGeometryView, point: MapPoint): readonly [number, number, number] {
  const x = (point[0] * MAP_SPAN) / map.grid.width - MAP_SPAN / 2;
  const z = (point[1] * MAP_SPAN) / map.grid.width -
    (MAP_SPAN * map.grid.height) / map.grid.width / 2;
  return [x, terrainHeight(map, point), z];
}

export function terrainHeight(map: MapGeometryView, point: MapPoint): number {
  let nearest = 100_000;
  for (const ridge of map.terrain.mountains) for (const sample of ridge) {
    const distance = Math.abs(sample[0] - point[0]) + Math.abs(sample[1] - point[1]);
    if (distance < nearest) nearest = distance;
  }
  const ridge = Math.max(0, 32 - nearest);
  const wave = Math.sin(point[0] * 0.041) * Math.cos(point[1] * 0.037);
  return Math.max(0.01, ridge * 0.005 + wave * 0.015 + 0.03);
}

function createCoreMapAlphaMap(): Texture {
  if (typeof document === 'undefined') return createFallbackTexture(255, 255, 255, 255);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createFallbackTexture(255, 255, 255, 255);
  const imgData = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      const u = x / 255;
      const w = y / 255;
      const distEdgeX = Math.min(u, 1 - u) / 0.16;
      const distEdgeY = Math.min(w, 1 - w) / 0.16;
      const tX = Math.max(0, Math.min(1, distEdgeX));
      const tY = Math.max(0, Math.min(1, distEdgeY));
      const aX = 0.5 - 0.5 * Math.cos(tX * Math.PI);
      const aY = 0.5 - 0.5 * Math.cos(tY * Math.PI);
      const alpha = Math.round(aX * aY * 255);
      const idx = (y * 256 + x) * 4;
      imgData.data[idx] = 255;
      imgData.data[idx + 1] = 255;
      imgData.data[idx + 2] = 255;
      imgData.data[idx + 3] = alpha;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function terrain(map: MapGeometryView, mapTexture?: Texture): Mesh {
  const positions: number[] = []; const colors: number[] = []; const uvs: number[] = [];
  const color = new Color();
  const vertex = (gx: number, gz: number): void => {
    const point: MapPoint = [Math.round(gx * map.grid.width / TERRAIN_X),
      Math.round(gz * map.grid.height / TERRAIN_Z)];
    const [x, rawY, z] = mapPointToWorld(map, point);
    // Smooth cosine edge taper over 2.5 grid cells to seamlessly blend into outer elevation:
    const taperDist = Math.min(1, gx / 2.5, (TERRAIN_X - gx) / 2.5) * Math.min(1, gz / 2.5, (TERRAIN_Z - gz) / 2.5);
    const blend = 0.5 - 0.5 * Math.cos(taperDist * Math.PI);
    // Ocean borders on the east and south-east taper into sea level (0.001); land borders taper into 0.005
    const isOceanBorder = (gx > TERRAIN_X - 2.5) || (gz > TERRAIN_Z - 2.5 && gx > 14);
    const baselineY = isOceanBorder ? 0.001 : 0.005;
    const y = baselineY + (rawY - baselineY) * blend;
    positions.push(x, y, z); uvs.push(gx / TERRAIN_X, 1 - gz / TERRAIN_Z);

    if (mapTexture) {
      colors.push(1.0, 1.0, 1.0, 1.0);
    } else {
      color.setHSL(0.1, 0.2, 0.68 - Math.min(0.2, y * 0.07));
      colors.push(color.r, color.g, color.b, 1.0);
    }
  };
  for (let z = 0; z < TERRAIN_Z; z += 1) for (let x = 0; x < TERRAIN_X; x += 1) {
    // CCW upward winding in coordinate space where +gz -> -Z:
    vertex(x, z); vertex(x + 1, z + 1); vertex(x, z + 1);
    vertex(x, z); vertex(x + 1, z); vertex(x + 1, z + 1);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 4));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();
  return new Mesh(geometry, new MeshStandardMaterial({
    map: mapTexture ?? null,
    alphaMap: createCoreMapAlphaMap(),
    vertexColors: true,
    roughness: 0.95,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
  }));
}

function segments(map: MapGeometryView, lines: readonly (readonly MapPoint[])[], color: number, height: number): LineSegments {
  const vertices: number[] = [];
  for (const line of lines) for (let index = 1; index < line.length; index += 1) {
    for (const point of [line[index - 1]!, line[index]!]) {
      const [x, y, z] = mapPointToWorld(map, point); vertices.push(x, y + height, z);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  return new LineSegments(geometry, new LineBasicMaterial({ color }));
}

function createRoadTexture(): Texture {
  if (typeof document === 'undefined') return createFallbackTexture(124, 92, 63, 255);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return createFallbackTexture(124, 92, 63, 255);

  const imgData = ctx.createImageData(128, 256);
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 128; x += 1) {
      const idx = (y * 128 + x) * 4;
      const u = x / 127;
      const distFromCenter = Math.abs(u - 0.5) * 2;
      const edgeFeather = Math.max(0, 1 - Math.pow(distFromCenter, 2.5));
      if (edgeFeather <= 0.01) {
        imgData.data[idx + 3] = 0;
        continue;
      }

      const noise = ((x * 17 + y * 31) % 19) / 19 * 14 - 7;
      let r = 124 + noise;
      let g = 94 + noise * 0.8;
      let b = 64 + noise * 0.6;

      const rut1 = Math.abs(u - 0.33);
      const rut2 = Math.abs(u - 0.67);
      if (rut1 < 0.08 || rut2 < 0.08) {
        r -= 18;
        g -= 16;
        b -= 14;
      }

      imgData.data[idx] = Math.max(0, Math.min(255, r));
      imgData.data[idx + 1] = Math.max(0, Math.min(255, g));
      imgData.data[idx + 2] = Math.max(0, Math.min(255, b));
      imgData.data[idx + 3] = Math.max(0, Math.min(255, edgeFeather * 240));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 4);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function smoothRoadMesh(map: MapGeometryView): Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const ROAD_WIDTH = 0.085;
  const HALF_W = ROAD_WIDTH / 2;
  const up = new Vector3(0, 1, 0);
  const tangent = new Vector3();
  const side = new Vector3();
  const p0 = new Vector3();
  const p1 = new Vector3();

  for (const road of map.roads) {
    if (road.points.length < 2) continue;

    const worldPoints = road.points.map((pt) => {
      const [x, , z] = mapPointToWorld(map, pt);
      return new Vector3(x, 0, z);
    });

    let sampled: Vector3[] = [];
    if (worldPoints.length === 2) {
      const start = worldPoints[0]!;
      const end = worldPoints[1]!;
      const count = Math.max(4, Math.ceil(start.distanceTo(end) / 0.18));
      for (let i = 0; i <= count; i += 1) {
        sampled.push(start.clone().lerp(end, i / count));
      }
    } else {
      const curve = new CatmullRomCurve3(worldPoints, false, 'catmullrom', 0.5);
      const totalLen = curve.getLength();
      const count = Math.max(worldPoints.length * 4, Math.ceil(totalLen / 0.18));
      sampled = curve.getPoints(count);
    }

    for (const pt of sampled) {
      const gx = ((pt.x + MAP_SPAN / 2) * map.grid.width) / MAP_SPAN;
      const gz = ((pt.z + (MAP_SPAN * map.grid.height) / map.grid.width / 2) * map.grid.width) / MAP_SPAN;
      pt.y = terrainHeight(map, [Math.round(gx), Math.round(gz)]) + 0.022;
    }

    const baseVertex = positions.length / 3;
    let accumulatedDist = 0;

    for (let i = 0; i < sampled.length; i += 1) {
      const curr = sampled[i]!;
      if (i === 0) {
        tangent.subVectors(sampled[1]!, curr).normalize();
      } else if (i === sampled.length - 1) {
        tangent.subVectors(curr, sampled[i - 1]!).normalize();
        accumulatedDist += curr.distanceTo(sampled[i - 1]!);
      } else {
        tangent.subVectors(sampled[i + 1]!, sampled[i - 1]!).normalize();
        accumulatedDist += curr.distanceTo(sampled[i - 1]!);
      }

      side.crossVectors(tangent, up).normalize().multiplyScalar(HALF_W);

      p0.subVectors(curr, side);
      p1.addVectors(curr, side);

      positions.push(p0.x, p0.y, p0.z);
      positions.push(p1.x, p1.y, p1.z);

      const v = accumulatedDist * 2.8;
      uvs.push(0, v);
      uvs.push(1, v);

      if (i < sampled.length - 1) {
        const vIdx = baseVertex + i * 2;
        indices.push(vIdx, vIdx + 1, vIdx + 3);
        indices.push(vIdx, vIdx + 3, vIdx + 2);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const texture = createRoadTexture();
  const material = new MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
    metalness: 0.02,
    transparent: true,
    alphaTest: 0.02,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.name = 'road-network';
  mesh.renderOrder = 3;
  return mesh;
}

function createCityQuadGeometry(): BufferGeometry {
  const geometry = new PlaneGeometry(0.82, 0.82);
  geometry.translate(0, 0.41, 0);
  geometry.rotateX(Math.atan2(11, 14));
  return geometry;
}

export interface WorldMapGeometry {
  readonly group: Group; readonly nodes: InstancedMesh; readonly visibleNodes: readonly MapNodeView[];
  readonly nodeInstances: number; readonly roadSegments: number;
  readonly staticDrawCalls: number; dispose(): void;
}

function createFallbackTexture(r = 255, g = 255, b = 255, a = 255): Texture {
  const texture = new DataTexture(new Uint8Array([r, g, b, a]), 1, 1, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createOceanTexture(): Texture {
  if (typeof document === 'undefined') return createFallbackTexture(150, 178, 190, 255);
  const texture = new TextureLoader().load('/img/tex_map_ocean.png');
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(160, 160);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function createEurasiaTexture(): Texture {
  if (typeof document === 'undefined') return createFallbackTexture(222, 210, 187, 255);
  const texture = new TextureLoader().load('/img/tex_map_eurasia.png');
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function capsuleSdf(px: number, pz: number, ax: number, az: number, bx: number, bz: number, r: number): number {
  return r - distToSegment(px, pz, ax, az, bx, bz);
}

function circleSdf(px: number, pz: number, cx: number, cz: number, r: number): number {
  return r - Math.hypot(px - cx, pz - cz);
}

function eurasiaLandSdf(x: number, z: number): number {
  // 1. Korean Peninsula (x: 5.2 ~ 6.5, z: -2.5 ~ 0.2)
  const sKorea = capsuleSdf(x, z, 5.4, -2.5, 6.2, 0.2, 0.65);

  // 2. Japanese Archipelago (Honshu arc, Kyushu, Shikoku, Hokkaido)
  const sJapanHonshu = capsuleSdf(x, z, 7.0, 0.2, 9.2, -1.8, 0.55);
  const sJapanKyushu = circleSdf(x, z, 6.8, 0.5, 0.45);
  const sJapanHokkaido = circleSdf(x, z, 9.5, -3.2, 0.65);
  const sJapan = Math.max(sJapanHonshu, sJapanKyushu, sJapanHokkaido);

  // 3. Taiwan & Hainan Island
  const sTaiwan = circleSdf(x, z, 4.9, 4.0, 0.5);
  const sHainan = circleSdf(x, z, 1.8, 5.8, 0.45);

  // 4. Indochina & Southeast Asia Mainland (tapering south to Malacca)
  let sIndo = -999.0;
  if (z >= 5.0 && z <= 12.0) {
    const t = (z - 5.0) / 7.0;
    const cx = 0.5 - 1.5 * t;
    const w = 2.4 - 1.6 * t;
    sIndo = w - Math.abs(x - cx);
  } else if (z > 12.0) {
    sIndo = 0.7 - Math.hypot(x - (-1.0), z - 12.0);
  }

  // 5. Indian Subcontinent (tapering triangle south of Himalayas)
  let sIndia = -999.0;
  if (z >= 2.5 && z <= 10.5) {
    const t = (z - 2.5) / 8.0;
    const cx = -7.0 + 0.2 * t;
    const w = 2.6 - 2.1 * t;
    sIndia = w - Math.abs(x - cx);
  } else if (z > 10.5) {
    sIndia = 0.6 - Math.hypot(x - (-6.8), z - 10.5);
  }
  const sSriLanka = circleSdf(x, z, -6.8, 11.5, 0.45);
  sIndia = Math.max(sIndia, sSriLanka);

  // 6. Arabian Peninsula
  let sArab = -999.0;
  if (z >= 0.0 && z <= 6.5) {
    const t = z / 6.5;
    const cx = -14.0 + 1.2 * t;
    const w = 2.2 - 0.6 * t;
    sArab = w - Math.abs(x - cx);
  }

  // 7. Mainland Eurasia (China, Mongolia, Siberia, Central Asia)
  const curveNe = Math.min(4.0, Math.max(0, (-4.0 - z) * 0.35));
  const eastCoast = z > 3.0 ? 4.8 - (z - 3.0) * 0.3 : 5.5 + curveNe;

  let southBorder = 1.0;
  if (x > -3.0) southBorder = 5.2;
  else if (x > -11.0) southBorder = 2.8;
  else if (x > -20.0) southBorder = 1.0;

  const dx = x < -25.0 ? -25.0 - x : (x > eastCoast ? x - eastCoast : 0);
  const dz = z < -20.0 ? -20.0 - z : (z > southBorder ? z - southBorder : 0);
  let sMainland: number;
  if (dx === 0 && dz === 0) {
    sMainland = Math.min(eastCoast - x, x - (-25.0), southBorder - z, z - (-20.0));
  } else {
    sMainland = -Math.hypot(dx, dz);
  }

  let landSdf = Math.max(sKorea, sJapan, sTaiwan, sHainan, sIndo, sIndia, sArab, sMainland);

  // Inland water bodies (carving out seas and gulfs)
  const sBengal = circleSdf(x, z, -3.8, 4.8, 1.4);
  const sRedSea = capsuleSdf(x, z, -16.5, 1.0, -14.5, 4.5, 0.4);
  const sPersianGulf = capsuleSdf(x, z, -13.5, 0.0, -11.5, 1.5, 0.45);
  const sCaspian = capsuleSdf(x, z, -11.0, -2.5, -10.5, 0.0, 0.6);
  const maxSea = Math.max(sBengal, sRedSea, sPersianGulf, sCaspian);
  if (maxSea > 0) {
    landSdf = Math.min(landSdf, -maxSea);
  }

  return landSdf;
}

function calcEurasiaElevation(x: number, z: number, distToCore: number, d: number): number {
  if (d <= -0.5) {
    return 0.00;
  }

  // Smooth coastline transition: from d = -0.5 to d = 0.5 (span 1.0)
  const coastBlend = Math.max(0, Math.min(1, (d + 0.5) / 1.0));
  const smoothCoast = 0.5 - 0.5 * Math.cos(coastBlend * Math.PI);

  // Base land height near coast starts at 0.001 (just above ocean y=0.00) and gently rises inland
  const baseLandH = 0.001 + 0.02 * smoothCoast;

  let mountainH = 0;

  // 1. Himalayas & Tibetan Plateau (Roof of the World, x in [-11, -2], z in [0.5, 3.8])
  const dHima = Math.hypot(x - (-7.0), z - 2.2);
  if (dHima < 6.5) {
    mountainH += Math.pow((6.5 - dHima) / 6.5, 1.4) * 0.38;
  }
  if (x > -9.5 && x < -2.0 && z > 0.8 && z < 3.2) {
    mountainH += 0.08 + Math.sin(x * 1.5) * Math.cos(z * 1.8) * 0.03;
  }

  // 2. Tian Shan & Pamir Range (x in [-8, -3], z in [-4.5, -1.0])
  const dTian = Math.hypot(x - (-5.5), z - (-2.5));
  if (dTian < 4.5) {
    mountainH += Math.pow((4.5 - dTian) / 4.5, 1.4) * 0.28;
  }

  // 3. Kunlun Mountains (x in [-8, -1], z in [-0.5, 1.0])
  if (x > -8.5 && x < -1.0) {
    const dKunlun = Math.abs(z - 0.3);
    if (dKunlun < 1.4) {
      mountainH += Math.max(0, (1.4 - dKunlun) / 1.4) * 0.25;
    }
  }

  // 4. Altai & Sayan Mountains (x in [-5, 1], z in [-7.5, -4.5])
  const dAltai = Math.hypot(x - (-2.0), z - (-6.0));
  if (dAltai < 4.0) {
    mountainH += Math.pow((4.0 - dAltai) / 4.0, 1.4) * 0.22;
  }

  // 5. Mongolian Steppe & Gobi Plateau (x in [-5, 5], z in [-6.0, -1.5])
  if (x > -5.0 && x < 5.0 && z > -6.0 && z < -1.5) {
    mountainH += 0.04 + Math.sin(x * 0.8) * 0.015;
  }

  // 6. Siberian Undulations (z < -6.0)
  if (z < -6.0 && x > -25.0 && x < 15.0) {
    mountainH += 0.03 + Math.sin(x * 0.4 + z * 0.3) * 0.015;
  }

  // 7. Indian Subcontinent / Deccan Plateau
  if (x > -9.5 && x < -4.5 && z > 3.0 && z < 10.0) {
    const taper = Math.max(0, (10.0 - z) / 7.0);
    mountainH += (0.04 + Math.sin(x * 1.2) * 0.015) * taper;
  }

  // 8. Indochina Highlands
  if (x > -2.5 && x < 2.0 && z > 5.0 && z < 9.0) {
    mountainH += 0.04 + Math.sin(x * 1.5 + z * 1.0) * 0.015;
  }

  // 9. Japanese Alps Spine
  if (x > 6.8 && x < 9.5 && z > -2.5 && z < 0.5) {
    mountainH += 0.06 + Math.sin(x * 2.0 + z * 2.5) * 0.02;
  }

  // 10. Ural Mountains (North-South spine dividing Europe and Asia, x in [-9, -6], z in [-11, -5])
  if (x > -9.5 && x < -6.0 && z > -11.5 && z < -5.0) {
    const dUral = Math.abs(x - (-7.7));
    if (dUral < 1.6) {
      mountainH += Math.max(0, (1.6 - dUral) / 1.6) * 0.22;
    }
  }

  // 11. European Alps (x in [-18.5, -15.0], z in [-13.0, -10.5])
  const dAlps = Math.hypot(x - (-17.0), z - (-11.8));
  if (dAlps < 2.5) {
    mountainH += Math.pow((2.5 - dAlps) / 2.5, 1.4) * 0.28;
  }

  // 12. Caucasus & Zagros (x in [-14.5, -10.5], z in [-6.5, -1.0])
  const dCauc = Math.hypot(x - (-12.5), z - (-4.0));
  if (dCauc < 3.2) {
    mountainH += Math.pow((3.2 - dCauc) / 3.2, 1.4) * 0.24;
  }

  let h = baseLandH + mountainH * smoothCoast;

  // Seamless boundary blending with core map perimeter (which sits at elevation 0.005 on land, 0.001 at sea)
  if (distToCore < 2.5) {
    const coreBlend = 0.5 - 0.5 * Math.cos(Math.min(1, Math.max(0, distToCore) / 2.5) * Math.PI);
    const borderH = d >= 0 ? 0.005 : 0.001;
    h = borderH * (1 - coreBlend) + h * coreBlend;
  }

  return h;
}

function createEurasiaTerrainMesh(map: MapGeometryView): Mesh {
  const MIN_X = -32.0;
  const MAX_X = 20.0;
  const MIN_Z = -22.0;
  const MAX_Z = 18.0;
  const SEG_X = 160;
  const SEG_Z = 120;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= SEG_Z; iz += 1) {
    const fz = iz / SEG_Z;
    const z = MIN_Z + fz * (MAX_Z - MIN_Z);
    for (let ix = 0; ix <= SEG_X; ix += 1) {
      const fx = ix / SEG_X;
      const x = MIN_X + fx * (MAX_X - MIN_X);
      const dx = Math.max(0, Math.abs(x) - 10.0);
      const dz = Math.max(0, Math.abs(z) - 7.5);
      const distToCore = Math.hypot(dx, dz);
      const d = eurasiaLandSdf(x, z);
      const y = calcEurasiaElevation(x, z, distToCore, d);
      positions.push(x, y, z);
      uvs.push(fx, (MAX_Z - z) / (MAX_Z - MIN_Z));
    }
  }

  for (let iz = 0; iz < SEG_Z; iz += 1) {
    for (let ix = 0; ix < SEG_X; ix += 1) {
      const row1 = iz * (SEG_X + 1);
      const row2 = (iz + 1) * (SEG_X + 1);
      const v00 = row1 + ix;
      const v10 = row1 + (ix + 1);
      const v01 = row2 + ix;
      const v11 = row2 + (ix + 1);
      indices.push(v00, v01, v11);
      indices.push(v00, v11, v10);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new MeshStandardMaterial({
    map: createEurasiaTexture(),
    roughness: 0.95,
    metalness: 0.02,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new Mesh(geometry, material);
  mesh.name = 'eurasia-continent-terrain';
  return mesh;
}

function groundSkirt(map: MapGeometryView): Mesh {
  // Giant ocean plane placed precisely at sea level y = 0.00
  const geometry = new PlaneGeometry(3200, 3200, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  const material = new MeshStandardMaterial({
    map: createOceanTexture(),
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.08,
    side: DoubleSide,
  });
  const skirt = new Mesh(geometry, material);

  const eurasia = createEurasiaTerrainMesh(map);
  skirt.add(eurasia);

  return skirt;
}

/** Static terrain is one mesh; roads are one line batch; all map nodes share one city texture material. */
export function createWorldMapGeometry(map: MapGeometryView, mapTexture?: Texture): WorldMapGeometry {
  const group = new Group(); group.name = 'worldmap-static';
  const skirt = groundSkirt(map);
  skirt.name = 'terrain-ground-skirt';
  group.add(skirt);
  const ground = terrain(map, mapTexture); ground.name = 'terrain-heightmap'; ground.visible = false; group.add(ground);
  const roads = smoothRoadMesh(map);
  roads.name = 'road-network'; group.add(roads);
  const rivers = segments(map, map.terrain.rivers, 0x6f8991, 0.02);
  rivers.name = 'river-layer'; group.add(rivers);
  const mountainLines = segments(map, map.terrain.mountains, 0x554c3e, 0.06);
  mountainLines.name = 'mountain-layer'; group.add(mountainLines);
  const cityTexture = typeof document === 'undefined'
    ? new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat)
    : new TextureLoader().load('/img/ui_map_city.png');
  cityTexture.minFilter = LinearFilter;
  cityTexture.magFilter = LinearFilter;
  cityTexture.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({
    map: cityTexture,
    transparent: true,
    alphaTest: 0.08,
    depthWrite: false,
    side: DoubleSide,
  });
  const geometry = createCityQuadGeometry();
  const visibleNodes = map.nodes.filter((node) => node.open !== false);
  const nodes = new InstancedMesh(geometry, material, visibleNodes.length);
  nodes.name = 'map-node-instances';
  const transform = new Object3D();
  const majorCities = new Set(['city_dali', 'city_zhangye', 'city_luoyang', 'city_hangzhou', 'city_beijing', 'city_chengdu', 'city_chongqing', 'city_changsha', 'city_kaifeng', 'city_suzhou', 'city_jinan', 'city_xian', 'city_nanjing', 'city_wuhan', 'city_guangzhou', 'city_haikou', 'city_sanya']);
  visibleNodes.forEach((node: MapNodeView, index) => {
    const [x, y, z] = mapPointToWorld(map, node.point);
    const isMajor = majorCities.has(node.id);
    const scale = node.kind === 'ruin' ? 0.72 : (isMajor ? 1.18 : 0.96);
    transform.position.set(x, y + 0.04, z);
    transform.scale.setScalar(scale);
    transform.updateMatrix();
    nodes.setMatrixAt(index, transform.matrix);
    // Classical ink wash aesthetic: crisp color for towns, weathered moss stone for ruins
    const color = node.kind === 'ruin' ? 0x94a394 : (isMajor ? 0xffffff : 0xf5eedd);
    nodes.setColorAt(index, new Color(color));
  });
  nodes.instanceMatrix.needsUpdate = true;
  if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
  group.add(nodes);
  let disposed = false;
  return { group, nodes, visibleNodes, nodeInstances: visibleNodes.length,
    roadSegments: map.roads.reduce((count, road) => count + Math.max(0, road.points.length - 1), 0),
    staticDrawCalls: 6,
    dispose() {
      if (disposed) return; disposed = true;
      for (const object of [ground, skirt, roads, rivers, mountainLines, nodes]) {
        object.traverse((child) => {
          const mesh = child as Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const owned = mesh.material;
          if (owned) {
            if (Array.isArray(owned)) for (const item of owned) item.dispose(); else owned.dispose();
          }
        });
      }
      cityTexture.dispose(); group.clear();
    } };
}

export function createDestinationMarker(): Mesh {
  const marker = new Mesh(
    new RingGeometry(0.12, 0.22, 32),
    new MeshBasicMaterial({ color: 0xd97706, side: DoubleSide, transparent: true, opacity: 0.9 }),
  );
  marker.name = 'destination-marker';
  marker.rotation.x = -Math.PI / 2;
  marker.visible = false;
  return marker;
}

export function createProtagonistMarker(): Group {
  const group = new Group();
  group.name = 'protagonist-marker';

  // Outer radiant golden amber martial halo
  const ring = new Mesh(
    new RingGeometry(0.24, 0.38, 36),
    new MeshBasicMaterial({ color: 0xf59e0b, side: DoubleSide, transparent: true, opacity: 0.92 }),
  );
  ring.name = 'protagonist-ground-ring';
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  group.add(ring);

  // Inner vivid vermilion / fiery qi ring for strong contrast on parchment
  const innerRing = new Mesh(
    new RingGeometry(0.12, 0.22, 32),
    new MeshBasicMaterial({ color: 0xef4444, side: DoubleSide, transparent: true, opacity: 0.95 }),
  );
  innerRing.name = 'protagonist-inner-ring';
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.045;
  group.add(innerRing);

  // Central radiant star core
  const coreRing = new Mesh(
    new RingGeometry(0.03, 0.09, 24),
    new MeshBasicMaterial({ color: 0xfffbeb, side: DoubleSide, transparent: true, opacity: 0.98 }),
  );
  coreRing.name = 'protagonist-core-ring';
  coreRing.rotation.x = -Math.PI / 2;
  coreRing.position.y = 0.05;
  group.add(coreRing);

  // Floating radiant golden beacon with diamond tip for instant visibility
  const beaconGroup = new Group();
  beaconGroup.name = 'protagonist-beacon';
  const beaconPin = new Mesh(
    new BoxGeometry(0.035, 0.24, 0.035),
    new MeshBasicMaterial({ color: 0xf59e0b, side: DoubleSide }),
  );
  beaconPin.position.y = 0.62;
  beaconGroup.add(beaconPin);
  const diamond = new Mesh(
    new BoxGeometry(0.11, 0.11, 0.11),
    new MeshBasicMaterial({ color: 0xffe066, side: DoubleSide }),
  );
  diamond.position.y = 0.76;
  diamond.rotation.set(Math.PI / 4, 0, Math.PI / 4);
  beaconGroup.add(diamond);
  group.add(beaconGroup);

  // Protagonist character billboard figure standing on the marker with transparent cutout
  const figureGeo = new PlaneGeometry(0.36, 0.54);
  figureGeo.translate(0, 0.27, 0);
  const heroTexture = typeof document === 'undefined'
    ? new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat)
    : new TextureLoader().load('/img/hero_cutout.png');
  heroTexture.minFilter = LinearFilter;
  heroTexture.magFilter = LinearFilter;
  heroTexture.colorSpace = SRGBColorSpace;
  const figureMat = new MeshBasicMaterial({
    map: heroTexture,
    transparent: true,
    alphaTest: 0.05,
    depthWrite: false,
    side: DoubleSide,
  });
  const figure = new Mesh(figureGeo, figureMat);
  figure.name = 'protagonist-hero-figure';
  group.add(figure);

  return group;
}

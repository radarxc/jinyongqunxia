import {
  BoxGeometry, BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, DataTexture,
  Group, InstancedMesh, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
  NearestFilter, Object3D, RGBAFormat, Vector3,
} from 'three';
import type { Texture } from 'three';
import type { MapGeometryView, MapNodeView, MapPoint } from './types';

const MAP_SPAN = 20;
const TERRAIN_X = 32;
const TERRAIN_Z = 24;

export function mapPointToWorld(map: MapGeometryView, point: MapPoint): readonly [number, number, number] {
  const x = (point[0] * MAP_SPAN) / map.grid.width - MAP_SPAN / 2;
  const z = MAP_SPAN * map.grid.height / map.grid.width / 2 -
    (point[1] * MAP_SPAN) / map.grid.width;
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
  return ridge * 0.035 + wave * 0.08;
}

function terrain(map: MapGeometryView, mapTexture?: Texture): Mesh {
  const positions: number[] = []; const colors: number[] = []; const uvs: number[] = [];
  const color = new Color();
  const vertex = (gx: number, gz: number): void => {
    const point: MapPoint = [Math.round(gx * map.grid.width / TERRAIN_X),
      Math.round(gz * map.grid.height / TERRAIN_Z)];
    const [x, y, z] = mapPointToWorld(map, point);
    positions.push(x, y, z); uvs.push(gx / TERRAIN_X, 1 - gz / TERRAIN_Z);
    color.setHSL(0.1, 0.2, 0.68 - Math.min(0.2, y * 0.07));
    colors.push(color.r, color.g, color.b);
  };
  for (let z = 0; z < TERRAIN_Z; z += 1) for (let x = 0; x < TERRAIN_X; x += 1) {
    vertex(x, z); vertex(x, z + 1); vertex(x + 1, z + 1);
    vertex(x, z); vertex(x + 1, z + 1); vertex(x + 1, z);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();
  return new Mesh(geometry, new MeshStandardMaterial({
    map: mapTexture ?? null, vertexColors: true, roughness: 0.95,
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

function roadInstances(map: MapGeometryView): InstancedMesh {
  const spans = map.roads.flatMap((road) => road.points.slice(1).map((point, index) =>
    [road.points[index]!, point] as const));
  const mesh = new InstancedMesh(new BoxGeometry(1, 0.025, 0.055),
    new MeshStandardMaterial({ color: 0x7c5c3f, roughness: 0.95 }), spans.length);
  const transform = new Object3D(); const axis = new Vector3(1, 0, 0); const direction = new Vector3();
  spans.forEach(([from, to], index) => {
    const a = mapPointToWorld(map, from); const b = mapPointToWorld(map, to);
    direction.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const length = direction.length(); transform.position.set(
      (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.035, (a[2] + b[2]) / 2);
    transform.scale.set(length, 1, 1); transform.quaternion.setFromUnitVectors(axis, direction.normalize());
    transform.updateMatrix(); mesh.setMatrixAt(index, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true; return mesh;
}

function atlas(): DataTexture {
  const pixels = new Uint8Array([126, 50, 38, 255, 126, 50, 38, 255,
    61, 75, 67, 255, 61, 75, 67, 255]);
  const texture = new DataTexture(pixels, 2, 2, RGBAFormat);
  texture.magFilter = NearestFilter; texture.minFilter = NearestFilter; texture.needsUpdate = true;
  return texture;
}

export interface WorldMapGeometry {
  readonly group: Group; readonly nodes: InstancedMesh; readonly visibleNodes: readonly MapNodeView[];
  readonly nodeInstances: number; readonly roadSegments: number;
  readonly staticDrawCalls: number; dispose(): void;
}

/** Static terrain is one mesh; roads are one line batch; all map nodes share one atlas material. */
export function createWorldMapGeometry(map: MapGeometryView, mapTexture?: Texture): WorldMapGeometry {
  const group = new Group(); group.name = 'worldmap-static';
  const ground = terrain(map, mapTexture); ground.name = 'terrain-heightmap'; group.add(ground);
  const roads = roadInstances(map);
  roads.name = 'road-network'; group.add(roads);
  const rivers = segments(map, map.terrain.rivers, 0x6f8991, 0.02);
  rivers.name = 'river-layer'; group.add(rivers);
  const mountainLines = segments(map, map.terrain.mountains, 0x554c3e, 0.06);
  mountainLines.name = 'mountain-layer'; group.add(mountainLines);
  const texture = atlas();
  const material = new MeshStandardMaterial({ color: 0xffffff, map: texture, roughness: 0.75 });
  const geometry = new CylinderGeometry(0.12, 0.2, 0.32, 6);
  const visibleNodes = map.nodes.filter((node) => node.open !== false);
  const nodes = new InstancedMesh(geometry, material, visibleNodes.length);
  nodes.name = 'map-node-instances';
  const transform = new Object3D();
  visibleNodes.forEach((node: MapNodeView, index) => {
    const [x, y, z] = mapPointToWorld(map, node.point);
    transform.position.set(x, y + 0.18, z);
    transform.scale.setScalar(node.kind === 'ruin' ? 0.75 : 1);
    transform.rotation.y = node.kind === 'ruin' ? Math.PI / 4 : 0;
    transform.updateMatrix(); nodes.setMatrixAt(index, transform.matrix);
    nodes.setColorAt(index, new Color(node.kind === 'ruin' ? 0x3d4b43 : 0x7e3228));
  });
  nodes.instanceMatrix.needsUpdate = true;
  if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
  group.add(nodes);
  let disposed = false;
  return { group, nodes, visibleNodes, nodeInstances: visibleNodes.length,
    roadSegments: map.roads.reduce((count, road) => count + Math.max(0, road.points.length - 1), 0),
    staticDrawCalls: 5,
    dispose() {
      if (disposed) return; disposed = true;
      for (const object of [ground, roads, rivers, mountainLines, nodes]) {
        object.geometry.dispose();
        const owned = object.material;
        if (Array.isArray(owned)) for (const item of owned) item.dispose(); else owned.dispose();
      }
      texture.dispose(); group.clear();
    } };
}

export function createDestinationMarker(): Mesh {
  const marker = new Mesh(new ConeGeometry(0.18, 0.5, 6),
    new MeshStandardMaterial({ color: 0xc99837, emissive: 0x3b2408 }));
  marker.name = 'destination-marker'; marker.visible = false; return marker;
}

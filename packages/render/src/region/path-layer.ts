import {
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  Vector3,
} from 'three';
import { regionHexWorld } from './terrain';
import type { RegionHexPoint } from './types';

export const REGION_PATH_CAPACITY = 512;
const ROUTE_HALF_WIDTH = 0.075;

export interface RegionPathLayer {
  readonly group: Group;
  setPreviewPath(path: readonly RegionHexPoint[]): void;
  setDestination(hex: RegionHexPoint | null): void;
  restore(): void;
  dispose(): void;
}

export function createRegionPathLayer(
  heightAt: (point: RegionHexPoint) => number,
): RegionPathLayer {
  const group = new Group();
  group.name = 'region-route-layer';
  const routeGeometry = new BufferGeometry();
  const routePositions = new Float32Array((REGION_PATH_CAPACITY - 1) * 12 * 3);
  const routeAttribute = new BufferAttribute(routePositions, 3).setUsage(DynamicDrawUsage);
  routeGeometry.setAttribute('position', routeAttribute);
  routeGeometry.setDrawRange(0, 0);
  const routeMaterial = new MeshBasicMaterial({
    color: 0xeadca8,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: DoubleSide,
  });
  routeMaterial.polygonOffset = true;
  routeMaterial.polygonOffsetFactor = -2;
  const route = new Mesh(routeGeometry, routeMaterial);
  route.name = 'region-preview-route';
  route.renderOrder = 42;
  group.add(route);
  const flagMaterial = new MeshBasicMaterial({ color: 0xc88b32 });
  const flag = new Mesh(new ConeGeometry(0.18, 0.52, 6), flagMaterial);
  flag.name = 'region-destination-flag';
  flag.visible = false;
  flag.renderOrder = 44;
  group.add(flag);
  const ringMaterial = new MeshBasicMaterial({
    color: 0xe7c16c,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    side: DoubleSide,
  });
  const ring = new Mesh(new RingGeometry(0.28, 0.4, 24), ringMaterial);
  ring.name = 'region-destination-ring';
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  ring.renderOrder = 43;
  group.add(ring);
  const a = new Vector3();
  const b = new Vector3();
  const marker = new Vector3();
  let disposed = false;
  return {
    group,
    setPreviewPath(path) {
      const segments = Math.min(REGION_PATH_CAPACITY - 1, Math.max(0, path.length - 1));
      for (let index = 0; index < segments; index += 1) {
        regionHexWorld(path[index]!.q, path[index]!.r, heightAt(path[index]!), a);
        regionHexWorld(path[index + 1]!.q, path[index + 1]!.r, heightAt(path[index + 1]!), b);
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        const sideX = length > 0 ? (-dz / length) * ROUTE_HALF_WIDTH : 0;
        const sideZ = length > 0 ? (dx / length) * ROUTE_HALF_WIDTH : 0;
        const offset = index * 36;
        const ay = a.y + 0.045;
        const by = b.y + 0.045;
        for (let dash = 0; dash < 2; dash += 1) {
          const start = dash === 0 ? 0.08 : 0.58;
          const end = dash === 0 ? 0.42 : 0.92;
          const ax = a.x + dx * start;
          const az = a.z + dz * start;
          const bx = a.x + dx * end;
          const bz = a.z + dz * end;
          const startY = ay + (by - ay) * start;
          const endY = ay + (by - ay) * end;
          const cursor = offset + dash * 18;
          routePositions[cursor] = ax + sideX;
          routePositions[cursor + 1] = startY;
          routePositions[cursor + 2] = az + sideZ;
          routePositions[cursor + 3] = ax - sideX;
          routePositions[cursor + 4] = startY;
          routePositions[cursor + 5] = az - sideZ;
          routePositions[cursor + 6] = bx - sideX;
          routePositions[cursor + 7] = endY;
          routePositions[cursor + 8] = bz - sideZ;
          routePositions[cursor + 9] = ax + sideX;
          routePositions[cursor + 10] = startY;
          routePositions[cursor + 11] = az + sideZ;
          routePositions[cursor + 12] = bx - sideX;
          routePositions[cursor + 13] = endY;
          routePositions[cursor + 14] = bz - sideZ;
          routePositions[cursor + 15] = bx + sideX;
          routePositions[cursor + 16] = endY;
          routePositions[cursor + 17] = bz + sideZ;
        }
      }
      routeGeometry.setDrawRange(0, segments * 12);
      routeAttribute.needsUpdate = true;
      routeGeometry.computeBoundingSphere();
      route.visible = segments > 0;
    },
    setDestination(hex) {
      flag.visible = hex !== null;
      ring.visible = hex !== null;
      if (!hex) return;
      regionHexWorld(hex.q, hex.r, heightAt(hex), marker);
      flag.position.set(marker.x, marker.y + 0.3, marker.z);
      ring.position.set(marker.x, marker.y + 0.05, marker.z);
    },
    restore() {
      routeMaterial.needsUpdate = true;
      flagMaterial.needsUpdate = true;
      ringMaterial.needsUpdate = true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      routeGeometry.dispose();
      routeMaterial.dispose();
      flag.geometry.dispose();
      flagMaterial.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      group.clear();
    },
  };
}

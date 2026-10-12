import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  OrthographicCamera,
  Scene,
  type WebGLRenderer,
} from 'three';
import type { StaticLitMaterial } from './material';

function createWarmupGeometry(): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3),
  );
  geometry.setAttribute(
    'normal',
    new BufferAttribute(new Int8Array([0, 127, 0, 0, 0, 127, 0, 0, 0, 127, 0, 0]), 4, true),
  );
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1]), 2));
  geometry.setAttribute('aMat', new BufferAttribute(new Uint8Array(12), 4, true));
  geometry.setAttribute('aUnit', new BufferAttribute(new Uint16Array(6), 2));
  geometry.setAttribute('aTint', new BufferAttribute(new Uint8Array(12), 4, true));
  geometry.setIndex([0, 1, 2]);
  return geometry;
}

/** Compiles exactly the shell, roof and opaque-shadow variants used by a building layer. */
export async function warmStaticLitMaterials(
  renderer: WebGLRenderer,
  shell: StaticLitMaterial,
  roof: StaticLitMaterial,
  depth: StaticLitMaterial,
): Promise<void> {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;
  const geometry = createWarmupGeometry();
  scene.add(new Mesh(geometry, shell), new Mesh(geometry, roof), new Mesh(geometry, depth));
  try {
    if (typeof renderer.compileAsync === 'function') await renderer.compileAsync(scene, camera);
    else renderer.compile(scene, camera);
  } finally {
    scene.clear();
    geometry.dispose();
  }
}

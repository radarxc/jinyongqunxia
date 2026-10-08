// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  renderer: undefined as { toneMapping: number } | undefined,
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    toneMapping = 0;
    toneMappingExposure = 1;
    readonly shadowMap = { enabled: false, type: 0 };
    readonly info = { render: { triangles: 0 } };
    constructor() { fake.renderer = this; }
    setClearColor() {} setPixelRatio() {} setSize() {} render() {} dispose() {}
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});
vi.mock('three/examples/jsm/controls/OrbitControls.js', async () => {
  const { Vector3 } = await import('three');
  return { OrbitControls: class {
    readonly target = new Vector3();
    enableDamping = false; dampingFactor = 0; minDistance = 0; maxDistance = 0;
    autoRotate = false; autoRotateSpeed = 0;
    update() {} dispose() {}
  } };
});

import { ACESFilmicToneMapping, Group, NoToneMapping, type Scene } from 'three';
import { createCharacterViewer, createCharacterViewerLoader } from './scene';

beforeEach(() => {
  fake.renderer = undefined;
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 7));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

describe('character viewer dressup bridge', () => {
  it('creates a GLTF loader with the Meshopt decoder configured', () => {
    expect(createCharacterViewerLoader().meshoptDecoder).not.toBeNull();
  });

  it('attaches and detaches external roots without disturbing another root', () => {
    const viewer = createCharacterViewer(document.createElement('canvas'));
    const scene = viewer.scene as Scene;
    const modelAnchor = scene.children.at(-1)!;
    const first = new Group(); const second = new Group();
    viewer.attachExternal(first); viewer.attachExternal(first); viewer.attachExternal(second);
    expect(first.parent).toBe(modelAnchor);
    expect(modelAnchor.children.filter(child => child === first)).toHaveLength(1);
    viewer.detachExternal(first);
    expect(first.parent).toBeNull(); expect(second.parent).toBe(modelAnchor);
    viewer.detachExternal(first); viewer.dispose();
    expect(second.parent).toBeNull();
  });

  it('switches between no tone mapping and the original ACES mode', () => {
    const viewer = createCharacterViewer(document.createElement('canvas'));
    expect(fake.renderer?.toneMapping).toBe(ACESFilmicToneMapping);
    viewer.setUnlitMode(true);
    expect(fake.renderer?.toneMapping).toBe(NoToneMapping);
    viewer.setUnlitMode(false);
    expect(fake.renderer?.toneMapping).toBe(ACESFilmicToneMapping);
    viewer.dispose();
  });
});

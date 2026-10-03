// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { shallowRef } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegionScene } from '@tianshu/render/region';
import { useUiStore } from '@tianshu/ui/runtime';
import RegionPage from '../pages/RegionPage.vue';
import { defaultGameSettings } from '../settings';
import type { GameController } from '../game-controller';
import type { GameProjection } from '../runtime/contracts';

const fake = vi.hoisted(() => ({ createScene: vi.fn() }));
vi.mock('@tianshu/render/region', () => ({ createRegionScene: fake.createScene }));
vi.mock('../render-host', () => ({ createRenderQuality: vi.fn(async () => ({
  tier: 'high', renderScale: 1, effectivePixelRatio: (value: number) => value, setTier: vi.fn(),
})) }));

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { document.body.innerHTML = ''; });
describe('RegionPage lifecycle', () => {
  it('disposes a renderer that resolves after the page has unmounted', async () => {
    let resolveScene!: (scene: RegionScene) => void;
    const pending = new Promise<RegionScene>((resolve) => { resolveScene = resolve; });
    fake.createScene.mockReturnValue(pending);
    const dispose = vi.fn();
    const scene = { dispose, camera: { yawDeg: 45, rotating: false, allowRotation: true,
      rotate: vi.fn(async () => undefined) }, contextState: 'ok', stats: { drawCalls: 0,
      triangles: 0, frameMs: 0, cpuMs: 0, terrainChunks: 1, visibleChunks: 1,
      queuedChunks: 0, terrainCells: 1, staticInstances: 0, rigInstances: 1 },
      render: vi.fn(), resize: vi.fn(), update: vi.fn(async () => undefined),
      setPlayerPose: vi.fn(), setTimeOfDay: vi.fn(), setPath: vi.fn(), setZoom: vi.fn(),
      pickHex: vi.fn(() => null), pickAnchor: vi.fn(() => null), project: vi.fn(),
    } as unknown as RegionScene;
    const pinia = createPinia(); const store = useUiStore(pinia);
    store.replaceProjection({ ...store.projection, worldPaused: false, worldmapStatic: null,
      worldmap: null, townRuntime: null, town: null, dialogue: null, firstSleepAllocation: null,
      regionStatic: { schemaVersion: 'region-static.v1', regionId: 'rg_fixture',
        sceneId: 'sc_00_zhulin', bounds: { qMin: 0, qMax: 0, rMin: 0, rMax: 0 },
        terrainTable: ['tr_pingdi'], chunks: [], objects: [], backdropAssetKey: null },
      region: { regionId: 'rg_fixture', sceneId: 'sc_00_zhulin', spawnId: 'bookfall',
        playerHex: { q: 0, r: 0 }, facing: 0, interactableAnchors: [], doors: [],
        pendingMount: null }, regionPathPreview: null } as GameProjection);
    const controller = { settings: shallowRef(defaultGameSettings()), busy: shallowRef(false),
      worldmap: shallowRef(null), townCommand: vi.fn(async () => undefined),
    } as unknown as GameController;
    const wrapper = mount(RegionPage, { props: { controller }, global: { plugins: [pinia] } });
    await flushPromises(); expect(fake.createScene).toHaveBeenCalledOnce();
    wrapper.unmount(); resolveScene(scene); await flushPromises();
    expect(dispose).toHaveBeenCalledOnce();
  });
});

// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { shallowRef } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUiStore } from '@tianshu/ui/runtime';
import type { WorldMapScene } from '@tianshu/render/worldmap';
import type { GameController } from '../game-controller';
import WorldMapPage from '../pages/WorldMapPage.vue';
import { createSelectors } from '../projection';
import { createPreviewSession } from './bootstrap';
import { ALL_VIEWS } from './contracts';
import { fixtureContent } from './test-fixture';

const renderMocks = vi.hoisted(() => ({ createWorldMapScene: vi.fn() }));
vi.mock('@tianshu/render/worldmap', () => ({
  createWorldMapScene: renderMocks.createWorldMapScene,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('WorldMapPage scene lifecycle', () => {
  it('disposes a scene that finishes mounting after the page is unmounted', async () => {
    const content = fixtureContent();
    const selectors = createSelectors(content);
    selectors.update(createPreviewSession(content), ALL_VIEWS);
    const initial = selectors.query();
    const pinia = createPinia();
    useUiStore(pinia).replaceProjection(initial);
    const controller = {
      worldmapStatic: shallowRef(initial.worldmapStatic),
      worldmap: shallowRef(initial.worldmap),
      busy: shallowRef(false),
      settings: shallowRef({ largeText: false, reducedMotion: false }),
      worldMapCommand: vi.fn(),
    } as unknown as GameController;
    const dispose = vi.fn();
    const scene = {
      stats: { drawCalls: 0, triangles: 0, frameMs: 0, cpuMs: 0, nodes: 0, roads: 0, instances: 0 },
      render: vi.fn(), resize: vi.fn(), setActor: vi.fn(), setDestination: vi.fn(),
      setTimeOfDay: vi.fn(), setZoom: vi.fn(), pickNode: vi.fn(), dispose,
    } as unknown as WorldMapScene;
    let finishScene!: (created: WorldMapScene) => void;
    renderMocks.createWorldMapScene.mockReturnValue(new Promise((resolve) => { finishScene = resolve; }));
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect = vi.fn(); });
    const requestFrame = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    await vi.waitFor(() => expect(renderMocks.createWorldMapScene).toHaveBeenCalledOnce());
    wrapper.unmount();
    finishScene(scene);
    await flushPromises();

    expect(dispose).toHaveBeenCalledOnce();
    expect(observe).not.toHaveBeenCalled();
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it('disposes a scene when actor setup finishes after the page is unmounted', async () => {
    const content = fixtureContent();
    const selectors = createSelectors(content);
    selectors.update(createPreviewSession(content), ALL_VIEWS);
    const initial = selectors.query();
    const pinia = createPinia();
    useUiStore(pinia).replaceProjection(initial);
    const controller = { worldmap: shallowRef(initial.worldmap), busy: shallowRef(false),
      settings: shallowRef({ largeText: false, reducedMotion: false }),
      worldMapCommand: vi.fn() } as unknown as GameController;
    let finishActor!: () => void;
    const dispose = vi.fn();
    const scene = { stats: { drawCalls: 0, triangles: 0, frameMs: 0, cpuMs: 0, nodes: 0, roads: 0, instances: 0 },
      render: vi.fn(), resize: vi.fn(), setActor: vi.fn(() => new Promise<void>((resolve) => { finishActor = resolve; })),
      setDestination: vi.fn(), setTimeOfDay: vi.fn(), setZoom: vi.fn(), pickNode: vi.fn(), dispose,
    } as unknown as WorldMapScene;
    renderMocks.createWorldMapScene.mockResolvedValue(scene);
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect = vi.fn(); });
    const requestFrame = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    await vi.waitFor(() => expect(scene.setActor).toHaveBeenCalledOnce());
    wrapper.unmount();
    finishActor();
    await flushPromises();

    expect(dispose).toHaveBeenCalledOnce();
    expect(observe).not.toHaveBeenCalled();
    expect(requestFrame).not.toHaveBeenCalled();
  });
});

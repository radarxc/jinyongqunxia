import { createPinia, setActivePinia, storeToRefs } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isReactive } from 'vue';
import { uiBus, useUiStore } from './index';

describe('UI projection store', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('replaces a shallow, raw projection as one snapshot', () => {
    expect(window.document).toBeDefined();
    const store = useUiStore();
    const { projection } = storeToRefs(store);
    const next = { title: '天书录', coreVersion: '1.0.0', worldTick: 8, status: 'ready' };
    store.replaceProjection(next);
    expect(projection.value).toBe(next);
    expect(isReactive(projection.value)).toBe(false);
  });
});

describe('uiBus', () => {
  it('emits command intent and removes subscriptions', () => {
    const listener = vi.fn();
    const unsubscribe = uiBus.subscribe(listener);
    const intent = { type: 'core-command', command: { t: 'world/tick' } } as const;
    uiBus.emit(intent);
    unsubscribe();
    uiBus.emit(intent);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(intent);
  });
});

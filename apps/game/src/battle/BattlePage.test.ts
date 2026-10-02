// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { shallowRef } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BattlePage from './BattlePage.vue';
import { BattleRuntime } from './runtime';
import { createBattleDemo } from './demo';
import type { BattleController, BattleSpeed } from './controller';
import type { BattleView } from './contracts';

afterEach(() => { document.body.innerHTML = ''; });
describe('battle page aiming', () => {
  it('offers every core direction for a twelve-direction cone', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const first = packet.units[0]!;
    const move = { ...first.moves[0]!,
      shape: { tpl: 'aoe_cone', r: 2, angle: 60, dirCount: 12 } as const };
    const view = shallowRef<BattleView | null>({ ...packet, info: packet.info!,
      units: [{ ...first, moves: [move] }, ...packet.units.slice(1)] });
    const controller = { view, logs: shallowRef([]), floating: shallowRef([]),
      busy: shallowRef(false), error: shallowRef(''), speed: shallowRef<BattleSpeed>(1),
      returnScene: shallowRef('world'), command: vi.fn(async () => true),
      preview: vi.fn(), setAuto: vi.fn(), setActive: vi.fn(),
    } as unknown as BattleController;
    const wrapper = mount(BattlePage, { props: { controller, source: 'world', reducedMotion: false },
      global: { stubs: { BattleField: true, BattleControls: true, BattleTimeline: true,
        BattleLog: true, BattleMeridians: true, BattleResult: true } } });
    await wrapper.get('[data-move]').trigger('click');
    expect(wrapper.findAll('.aim-control button')).toHaveLength(12);
    wrapper.unmount();
  });
});

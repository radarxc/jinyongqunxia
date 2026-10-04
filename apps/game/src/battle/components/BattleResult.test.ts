// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createBattleDemo } from '../demo';
import { BattleRuntime } from '../runtime';
import BattleResult from './BattleResult.vue';

describe('battle result', () => {
  it('renders the core reward payload without deriving growth values', () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const battle = { ...packet, info: packet.info!, result: 'win' as const, rewards: {
      drops: [{ itemId: 'it_jinchuangyao', name: '金创药', count: 2 }], martial: null, cycles: 3,
      martialUses: [{ unitId: 'hero', skillId: 'sk_basic', uses: 2 }],
      movementTrained: ['hero'], fullCirculations: [{ unitId: 'hero', count: 3 }],
    } };
    const wrapper = mount(BattleResult, { props: { battle, busy: false }, global: { stubs: {
      TxModal: { props: ['title'], template: '<section><h2>{{ title }}</h2><slot /></section>' },
    } } });
    expect(wrapper.text()).toContain('金创药 × 2');
    expect(wrapper.text()).toContain('演武侠客 · sk_basic 使用 2 次');
    expect(wrapper.text()).toContain('演武侠客 · 身法训练达标');
    expect(wrapper.text()).toContain('演武侠客 · 完整周天 3 次');
    expect(wrapper.text()).toContain('完整周天合计：3');
  });
});

// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TxSettingsPanel from './TxSettingsPanel.vue';

const settings = { textScale: 100 as const, reducedMotion: false, minimapNorthUp: false,
  subtitles: true, volume: { master: 100, music: 80, effects: 70, voice: 60 },
  quality: 'auto' as const, difficulty: 'diff_jianghu' as const };

describe('TxSettingsPanel minimap orientation', () => {
  it('emits true when checked and false when unchecked', async () => {
    const wrapper = mount(TxSettingsPanel, { props: { modelValue: settings } });
    const input = wrapper.findAll('input[type="checkbox"]')[1]!;
    await input.setValue(true);
    await input.setValue(false);
    expect(wrapper.emitted('change')).toContainEqual(['minimapNorthUp', true]);
    expect(wrapper.emitted('change')).toContainEqual(['minimapNorthUp', false]);
  });
});

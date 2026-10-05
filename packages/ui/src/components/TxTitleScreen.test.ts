// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TxRecoveryPanel from './TxRecoveryPanel.vue';
import TxRotateHint from './TxRotateHint.vue';
import TxSettingsPanel from './TxSettingsPanel.vue';
import TxTitleScreen from './TxTitleScreen.vue';

const settings = { textScale: 100 as const, reducedMotion: false, subtitles: true,
  volume: { master: 100, music: 80, effects: 70, voice: 60 },
  quality: 'auto' as const, difficulty: 'diff_jianghu' as const };

describe('UI flow components', () => {
  it('disables continue without a formal save and exposes the new-game reason', async () => {
    const wrapper = mount(TxTitleScreen, { props: { canContinue: false, newGameAvailable: false,
      newGameReason: '入口尚未接入' } });
    const buttons = wrapper.findAll('button');
    expect(buttons[0]!.attributes('disabled')).toBeDefined();
    expect(buttons[1]!.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('尚无可继续的正式存档');
    expect(wrapper.text()).toContain('入口尚未接入');
  });

  it('emits 150% text and accessibility changes', async () => {
    const wrapper = mount(TxSettingsPanel, { props: { modelValue: settings } });
    await wrapper.get('input[value="150"]').setValue();
    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(true);
    expect(wrapper.emitted('change')).toContainEqual(['textScale', 150]);
    expect(wrapper.emitted('change')).toContainEqual(['reducedMotion', true]);
  });

  it('keeps recovery actions accessible and disables a missing autosave', async () => {
    const wrapper = mount(TxRecoveryPanel, { props: { reason: '核心进程已停止响应。',
      exportAvailable: true } });
    expect(wrapper.text()).toContain('存档没有被清除');
    expect(wrapper.findAll('button')[1]!.attributes('disabled')).toBeDefined();
    await wrapper.findAll('button')[0]!.trigger('click');
    expect(wrapper.emitted('export')).toHaveLength(1);
  });

  it('shows and dismisses the portrait orientation hint', async () => {
    const dismiss = vi.fn();
    const wrapper = mount(TxRotateHint, { props: { visible: true, onDismiss: dismiss } });
    expect(wrapper.get('[role=dialog]').text()).toContain('请将设备横置');
    await wrapper.get('button').trigger('click'); expect(dismiss).toHaveBeenCalledOnce();
    await wrapper.setProps({ visible: false }); expect(wrapper.find('[role=dialog]').exists()).toBe(false);
  });
});

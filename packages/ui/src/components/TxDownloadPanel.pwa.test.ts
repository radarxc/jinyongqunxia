// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TxDownloadPanel from './TxDownloadPanel.vue';
import TxOfflineBadge from './TxOfflineBadge.vue';
import TxUpdatePrompt from './TxUpdatePrompt.vue';

describe('PWA components', () => {
  it('renders the network state in a polite live region', () => {
    const wrapper = mount(TxOfflineBadge, { props: { status: 'offline', missingBytes: 12 } });
    expect(wrapper.get('[role=status]').attributes('aria-live')).toBe('polite');
    expect(wrapper.text()).toContain('离线游玩'); expect(wrapper.text()).toContain('12 B');
  });

  it('emits update actions and blocks activation outside a safe point', async () => {
    const wrapper = mount(TxUpdatePrompt, { props: { phase: 'ready', safeToActivate: false } });
    expect(wrapper.get('[aria-live=polite]').text()).toContain('新版本已就绪');
    expect(wrapper.findAll('button')[0]!.attributes('disabled')).toBeDefined();
    await wrapper.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('later')).toHaveLength(1);
    await wrapper.setProps({ safeToActivate: true }); await wrapper.findAll('button')[0]!.trigger('click');
    expect(wrapper.emitted('activate')).toHaveLength(1);
  });

  it('renders verified progress, iOS guidance and download management events', async () => {
    const wrapper = mount(TxDownloadPanel, { props: { chapter: '天龙', bytes: 100, verifiedBytes: 40,
      state: 'partial', iosInstallHint: true, lastVerifiedAt: 1 } });
    expect(wrapper.get('progress').attributes('value')).toBe('40');
    expect(wrapper.get('[aria-live=polite]').text()).toContain('40%');
    expect(wrapper.text()).toContain('添加到主屏幕');
    const buttons = wrapper.findAll('button'); await buttons[0]!.trigger('click');
    await buttons[1]!.trigger('click'); await buttons[2]!.trigger('click');
    expect(wrapper.emitted('download')).toHaveLength(1); expect(wrapper.emitted('remove')).toHaveLength(1);
    expect(wrapper.emitted('forceUpdate')).toHaveLength(1);
  });
});

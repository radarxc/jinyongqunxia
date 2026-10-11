import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TxContextActions from './TxContextActions.vue';

describe('TxContextActions', () => {
  it('keeps source order, caps the strip at three and emits enabled actions', async () => {
    const actions = [
      { id: 'talk', verb: '交谈', label: '与掌柜交谈', enabled: true, reason: '', hotkey: 'F' },
      { id: 'enter', verb: '进入', label: '进入客栈', enabled: false, reason: '门已上锁', hotkey: 'E' },
      { id: 'rest', verb: '打坐', label: '在此打坐', enabled: true, reason: '', hotkey: '' },
      { id: 'extra', verb: '查看', label: '查看', enabled: true, reason: '', hotkey: 'V' },
    ];
    const wrapper = mount(TxContextActions, { props: { actions } });
    const buttons = wrapper.findAll('button'); expect(buttons).toHaveLength(3);
    expect(buttons.map(button => button.text())).toEqual(['交谈F', '进入E', '打坐']);
    await buttons[0]!.trigger('click'); await buttons[1]!.trigger('click');
    expect(wrapper.emitted('act')).toEqual([['talk']]);
  });

  it('shows the disabled reason and renders a hotkey keycap', () => {
    const wrapper = mount(TxContextActions, { props: { actions: [
      { id: 'talk', verb: '交谈', label: '与掌柜交谈', enabled: false, reason: '掌柜正在招呼旁人', hotkey: 'F' },
    ] } });
    expect(wrapper.get('kbd').text()).toBe('F'); expect(wrapper.get('.reason').text()).toBe('掌柜正在招呼旁人');
    expect(wrapper.get('button').attributes('aria-describedby')).toBe('action-reason-talk');
  });
});

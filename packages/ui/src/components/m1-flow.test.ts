import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { DialoguePanelView, SleepAllocationRulesView } from '../projections';
import TxDialoguePanel from './TxDialoguePanel.vue';
import TxQuestLog from './TxQuestLog.vue';
import TxQuestTracker from './TxQuestTracker.vue';
import TxSleepAllocation from './TxSleepAllocation.vue';
import TxSleepConfirmation from './TxSleepConfirmation.vue';
import TxSummaryCards from './TxSummaryCards.vue';

const dialogue: DialoguePanelView = {
  speaker: '书灵',
  text: '先看清这一整页。',
  choices: [
    { id: '0', label: '应下' },
    { id: '1', label: '尚不能选', disabledReason: '需要先完成竹林试步' },
  ],
  history: [{ speaker: '你', text: '这是上一句。' }],
  canContinue: false,
};
const rules: SleepAllocationRulesView = {
  ruleVersion: 'first-sleep.v1',
  keys: ['str', 'con', 'bre', 'wis', 'agi', 'wil'],
  base: 35,
  min: 20,
  max: 80,
  budget: 90,
  requiredTotal: 300,
  draft: null,
  balanced: { str: 50, con: 50, bre: 50, wis: 50, agi: 50, wil: 50 },
  lockedKeys: ['luk', 'cha'],
};

describe('M1 dialogue and summary components', () => {
  it('reveals the whole page before choosing and exposes an unavailable reason', async () => {
    const wrapper = mount(TxDialoguePanel, { props: { dialogue } });
    expect(wrapper.find('[data-testid=dialogue-close]').exists()).toBe(false);
    expect(wrapper.get('[data-testid=dialogue-text]').text()).toBe('');
    expect(wrapper.get('[data-testid=dialogue-full-text]').text()).toBe(dialogue.text);
    expect(wrapper.find('[data-testid=dialogue-choices]').exists()).toBe(false);

    await wrapper.get('[data-testid=dialogue-page]').trigger('click');
    expect(wrapper.get('[data-testid=dialogue-text]').text()).toBe(dialogue.text);
    expect(wrapper.get('[data-testid=dialogue-choice-reason]').text()).toBe('需要先完成竹林试步');
    expect(
      wrapper.findAll('[data-testid=dialogue-choice]')[1]!.attributes('disabled'),
    ).toBeDefined();
    await wrapper.findAll('[data-testid=dialogue-choice]')[0]!.trigger('click');
    expect(wrapper.emitted('choose')).toEqual([['0']]);
    await wrapper.setProps({ closable: true });
    await wrapper.get('[data-testid=dialogue-close]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('uses the second page click to continue and supports card paging in both directions', async () => {
    const page = mount(TxDialoguePanel, {
      props: { dialogue: { ...dialogue, choices: [], canContinue: true } },
    });
    await page.get('[data-testid=dialogue-page]').trigger('click');
    expect(page.emitted('continue')).toBeUndefined();
    await page.get('[data-testid=dialogue-page]').trigger('click');
    expect(page.emitted('continue')).toHaveLength(1);

    const cards = mount(TxSummaryCards, {
      props: {
        cards: [
          { key: 'one', title: '第一页', body: '甲' },
          { key: 'two', title: '第二页', body: '乙' },
        ],
      },
    });
    await cards.get('[data-testid=summary-next]').trigger('click');
    expect(cards.get('[data-testid=summary-title]').text()).toBe('第二页');
    await cards.get('[data-testid=summary-previous]').trigger('click');
    expect(cards.get('[data-testid=summary-title]').text()).toBe('第一页');
    await cards.get('[data-testid=summary-next]').trigger('click');
    await cards.get('[data-testid=summary-confirm]').trigger('click');
    expect(cards.emitted('complete')).toHaveLength(1);
  });
});

describe('M1 first-sleep allocation components', () => {
  it('honors supplied bounds and emits reset, balance and review operations', async () => {
    const allocation = { str: 80, con: 20, bre: 50, wis: 50, agi: 50, wil: 49 };
    const wrapper = mount(TxSleepAllocation, { props: { rules, allocation, source: 'manual' } });
    const strength = wrapper.get('[data-testid=allocation-str]');
    const constitution = wrapper.get('[data-testid=allocation-con]');
    expect(strength.findAll('button')[1]!.attributes('disabled')).toBeDefined();
    expect(constitution.findAll('button')[0]!.attributes('disabled')).toBeDefined();
    await constitution.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('change')).toContainEqual(['con', 21]);
    await wrapper.get('[data-testid=allocation-reset]').trigger('click');
    await wrapper.get('[data-testid=allocation-balanced]').trigger('click');
    expect(wrapper.emitted('reset')).toHaveLength(1);
    expect(wrapper.emitted('balance')).toHaveLength(1);
    expect(wrapper.get('[data-testid=allocation-review]').attributes('disabled')).toBeDefined();
    await wrapper.setProps({ allocation: rules.balanced });
    await wrapper.get('[data-testid=allocation-review]').trigger('click');
    expect(wrapper.emitted('review')).toHaveLength(1);
    expect(wrapper.get('[data-testid=allocation-luk-locked]').text()).toContain('福缘');
  });

  it('confirms on an ordinary click without a hold gesture', async () => {
    const wrapper = mount(TxSleepConfirmation, {
      props: { allocation: rules.balanced, keys: rules.keys, source: 'default' },
    });
    const confirm = wrapper.get('[data-testid=allocation-confirm]');
    expect(confirm.attributes()).not.toHaveProperty('aria-pressed');
    await confirm.trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });
});

describe('M1 quest projections stay player-readable', () => {
  it('renders names and summaries without exposing quest ids', () => {
    const quest = {
      id: 'q_00_main_c_04',
      name: '一梦千年',
      category: '江湖',
      status: '进行中',
      summary: '完成初眠，再往白马。',
      tracked: true,
    };
    const log = mount(TxQuestLog, { props: { quests: [quest] } });
    const tracker = mount(TxQuestTracker, {
      props: { quest: { questId: quest.id, name: quest.name, objective: quest.summary } },
    });
    expect(log.text()).toContain('一梦千年');
    expect(tracker.text()).toContain('完成初眠，再往白马。');
    expect(`${log.text()} ${tracker.text()}`).not.toContain(quest.id);
  });
});

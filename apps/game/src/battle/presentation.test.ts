import { describe, expect, it } from 'vitest';
import { eventText } from './presentation';

describe('battle event prose', () => {
  it('preserves core-owned full-cycle and outward-Qi messages', () => {
    expect(eventText({ t: 'qi.fullCycleCrit', actionNo: 1,
      message: '运转一周天，内劲喷涌而出，难以抵挡' }))
      .toBe('运转一周天，内劲喷涌而出，难以抵挡');
    expect(eventText({ t: 'combat.qiRepel', actionNo: 1, message: '真气鼓荡震开攻击' }))
      .toBe('真气鼓荡震开攻击');
  });
  it.each([
    ['battle/foreignQiInjected', '透劲入体，经脉受阻'],
    ['battle/acupointOccupied', '打穴封脉，穴位被占'],
    ['buff/damage', '负面效果伤害'],
  ])('maps %s to visible feedback', (t, expected) => {
    expect(eventText({ t, actionNo: 2 })).toBe(expected);
  });
});

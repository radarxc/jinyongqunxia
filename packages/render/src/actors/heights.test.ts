import { describe, expect, it } from 'vitest';
import { BODY_TEMPLATE_HEIGHT_M, DEFAULT_NPC_HEIGHT_M, DEFAULT_PLAYER_HEIGHT_M,
  heightForTemplate } from './heights';

describe('actor height data', () => {
  it('keeps the AR-104 body-template heights in metres', () => {
    expect(BODY_TEMPLATE_HEIGHT_M).toEqual({
      tpl_f_small: 1.58, tpl_f_medium: 1.66, tpl_f_tall: 1.72,
      tpl_m_lean: 1.76, tpl_m_medium: 1.81, tpl_m_bulk: 1.86,
    });
    expect(Object.entries(BODY_TEMPLATE_HEIGHT_M).map(([id]) => heightForTemplate(id)))
      .toEqual([1.58, 1.66, 1.72, 1.76, 1.81, 1.86]);
  });

  it('publishes player and NPC sex defaults', () => {
    expect(DEFAULT_PLAYER_HEIGHT_M).toEqual({ male: 1.81, female: 1.66 });
    expect(DEFAULT_NPC_HEIGHT_M).toEqual({ male: 1.70, female: 1.62 });
  });

  it('rejects an unknown body template', () => {
    expect(() => heightForTemplate('tpl_unknown')).toThrow('UNKNOWN_BODY_TEMPLATE:tpl_unknown');
  });
});

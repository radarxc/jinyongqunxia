import { describe, expect, it } from 'vitest';
import { createNewGameState } from '../state';
import { MutableCoreTransaction } from '../command/transaction';
import { executeDialogueActions } from './event-executor';

describe('dialogue action extension boundary', () => {
  it('rejects dialogue-only execution atomically before its lazy chunk registers', () => {
    const state = createNewGameState({ masterSeed: 64, difficulty: 'diff_xiake',
      identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
        originId: 'origin_wenshiguan' } });
    const before = structuredClone(state);
    const tx = new MutableCoreTransaction(state, {});
    expect(() => executeDialogueActions(tx,
      [{ op: 'flag/set', flagId: 'fl_lazy', value: true }], 'dialogue:fixture'))
      .toThrow('DIALOGUE_INTENT_ACTION');
    tx.rollback();
    expect(state).toEqual(before);
  });
});

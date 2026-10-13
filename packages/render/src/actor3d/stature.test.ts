import { describe, expect, it } from 'vitest';
import { actorScale } from './stature';

describe('actor3d stature scaling', () => {
  it('scales a one-model-unit HeadTop_End stature to 1.81 metres', () => {
    expect(actorScale(1.81, 1)).toBe(1.81);
  });

  it('rejects data heights outside the 1.2 to 2.3 metre contract', () => {
    expect(() => actorScale(1.199, 1)).toThrow('ACTOR_HEIGHT_RANGE');
    expect(() => actorScale(2.301, 1)).toThrow('ACTOR_HEIGHT_RANGE');
    expect(actorScale(1.2, 2)).toBe(0.6);
    expect(actorScale(2.3, 2)).toBe(1.15);
  });

  it('rejects invalid catalogued HeadTop_End stature instead of measuring bounds', () => {
    expect(() => actorScale(1.81, 0)).toThrow('ACTOR_STATURE_INVALID');
    expect(() => actorScale(1.81, Number.NaN)).toThrow('ACTOR_STATURE_INVALID');
  });
});

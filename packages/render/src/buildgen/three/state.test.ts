import { describe, expect, it } from 'vitest';
import { accessoryVisible, createBuildingStates } from './state';

describe('building accessory cutaway state', () => {
  it('hides camera-facing main and compound-part accessories only while that unit is mode 2', () => {
    const states = createBuildingStates(2);
    states[0]!.mode = 2;
    expect(accessoryVisible(states, 0, 0, 9)).toBe(false);
    expect(accessoryVisible(states, 1, 0, 9)).toBe(true);
    states[0]!.mode = 1;
    states[1]!.mode = 2;
    expect(accessoryVisible(states, 0, 0, 9)).toBe(true);
    expect(accessoryVisible(states, 1, 0, 9)).toBe(false);
    expect(accessoryVisible(states, 1, 1, 9)).toBe(true);
  });
});

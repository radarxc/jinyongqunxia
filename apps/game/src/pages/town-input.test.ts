import { describe, expect, it } from 'vitest';
import { townAnchorIntent, townDirection, townStep } from './town-input';

describe('town input command adapter', () => {
  it('maps keyboard directions without deciding whether the target is walkable', () => {
    expect(townStep([4, 7], 'ArrowRight')).toEqual([5, 7]);
    expect(townStep([4, 7], 'q')).toEqual([3, 8]);
    expect(townStep([4, 7], 'Enter')).toBeNull();
  });

  it('maps all six axial steps to rig directions', () => {
    expect([[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
      .map((delta) => townDirection([0, 0], delta as [number, number])))
      .toEqual([2, 3, 4, 6, 7, 0]);
  });

  it('turns picked anchors into core commands only when interaction is local', () => {
    expect(townAnchorIntent({ id: 'anchor_npc_test', kind: 'npc', point: [1, 2],
      label: '交谈', npcId: 'npc_test' }, [1, 2])).toEqual({
      t: 'town/interact', npcId: 'npc_test',
    });
    expect(townAnchorIntent({ id: 'anchor_meditation_test', kind: 'meditation',
      point: [1, 2], label: '打坐' }, [1, 2])).toEqual({
      t: 'town/meditate', anchorId: 'anchor_meditation_test', plannedTicks: 600,
    });
    expect(townAnchorIntent({ id: 'anchor_building_bi_0001', kind: 'building',
      point: [3, 4], label: '进入', buildingId: 'bi_0001' }, [1, 2])).toEqual({
      t: 'town/move', destination: [3, 4], buildingId: 'bi_0001',
    });
  });
});

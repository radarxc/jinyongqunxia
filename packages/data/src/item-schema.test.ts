import { describe, expect, it } from 'vitest';
import { ItemDefSchema } from './schemas';

function item(kind: string, extension: unknown): Record<string, unknown> {
  return {
    schemaVersion: 'item.v1',
    id: 'it_fixture',
    name: '夹具',
    kind,
    sub: null,
    grade: 3,
    stack: 1,
    chapters: 'any',
    origin: 'expanded',
    price: null,
    flags: [],
    assets: { icon: 'items/fixture.webp' },
    text: { desc: '测试夹具。' },
    extension,
  };
}

describe('ItemDefSchema', () => {
  it.each([
    ['material', { type: 'material', value: { family: 'wood', resourceRef: 'res_wood', materialGrade: 3, rare: false } }],
    ['manual', { type: 'manual', value: { skill: 'sk_fixture', maxLayer: 10, variant: 'full', readMul: 1 } }],
    ['page', { type: 'page', value: { skill: 'sk_fixture', pagesTotal: 4 } }],
    ['quest', { type: 'quest', value: { quest: 'q_fixture', opens: [], recognizedBy: [] } }],
  ])('accepts the matching %s extension', (kind, extension) => {
    expect(ItemDefSchema.safeParse(item(kind, extension)).success).toBe(true);
  });

  it.each([
    ['material', { type: 'manual', value: { skill: 'sk_fixture', maxLayer: 10, variant: 'full', readMul: 1 } }],
    ['manual', { type: 'page', value: { skill: 'sk_fixture', pagesTotal: 4 } }],
    ['page', { type: 'quest', value: { quest: 'q_fixture', opens: [], recognizedBy: [] } }],
    ['quest', { type: 'generic', value: {} }],
  ])('rejects a %s item with a mismatched extension', (kind, extension) => {
    expect(ItemDefSchema.safeParse(item(kind, extension)).success).toBe(false);
  });

  it('requires UseSpec for every consumable kind', () => {
    for (const kind of ['ammo', 'pill', 'tonic', 'poison', 'antidote', 'food', 'dish', 'wine']) {
      expect(ItemDefSchema.safeParse(item(kind, { type: 'generic', value: {} })).success).toBe(false);
    }
  });

  it('uses the documented fieldTime key and rejects the old alias', () => {
    const base = item('pill', { type: 'generic', value: {} });
    const use = { context: 'field', action: 'consume', target: 'self', effects: [], fieldTime: 2 };
    expect(ItemDefSchema.safeParse({ ...base, use }).success).toBe(true);
    expect(ItemDefSchema.safeParse({
      ...base, use: { ...use, fieldTime: undefined, fieldTimeShichen: 2 },
    }).success).toBe(false);
  });

  it.each([
    ['recipe', { type: 'recipe', value: { teaches: 'rc_fixture', craft: 'alchemy', req: { art: 'alchemy', minimum: 4 } } }],
    ['token', { type: 'quest', value: { opens: ['door_fixture'], recognizedBy: [] } }],
    ['curio', { type: 'curio', value: { rule: 'curio.fixture', consumable: false } }],
    ['mount', { type: 'mount', value: { travelMul: 0.8, staMul: 0.9, terrains: ['road'], stable: true } }],
    ['collectible', { type: 'collectible', value: { study: { art: 'music', value: 2 }, giftTo: [], appraise: { art: 'art', dc: 20 } } }],
  ])('accepts the documented %s extension', (kind, extension) => {
    expect(ItemDefSchema.safeParse(item(kind, extension)).success).toBe(true);
  });

  it('validates permanent meridian temper targets and excludes temporary aid', () => {
    const base = item('tonic', { type: 'generic', value: {} });
    const common = { context: 'field', action: 'consume', target: 'self', effects: [] };
    const meridianTemper = {
      targetKind: 'acupoint', targetRef: 'ap_fixture', gradeUp: 0, strengthXp: 100, fluxFlat: 0,
    };
    expect(ItemDefSchema.safeParse({ ...base, use: { ...common, meridianTemper } }).success).toBe(true);
    expect(ItemDefSchema.safeParse({ ...base, use: { ...common, meridianTemper: {
      ...meridianTemper, targetRef: 'mer_fixture',
    } } }).success).toBe(false);
    expect(ItemDefSchema.safeParse({ ...base, use: { ...common,
      meridianTemper, meridianAid: { rateBp: 1, successBp: 0, costReduceBp: 0, hours: 1 },
    } }).success).toBe(false);
  });
});

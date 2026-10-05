import { describe, expect, it } from 'vitest';

import { ItemDefSchema } from './item';

function item(
  kind: string,
  extension: unknown,
  id = 'it_attribute_fixture',
): Record<string, unknown> {
  return {
    schemaVersion: 'item.v1',
    id,
    name: '属性投影夹具',
    kind,
    sub: null,
    grade: 3,
    stack: 1,
    chapters: 'any',
    origin: 'expanded',
    price: null,
    flags: [],
    assets: { icon: 'items/attribute-fixture.webp' },
    text: { desc: '测试属性投影。' },
    extension,
  };
}

const generic = (attributes?: unknown) =>
  item('tool', {
    type: 'generic',
    value: attributes === undefined ? {} : { attributes },
  });

describe('ItemDefSchema attribute projection v2', () => {
  it('accepts and preserves attributes on a generic extension', () => {
    const attributes = {
      version: 2,
      restoreQi: 10,
      qiCultivation: 1000,
      con: 1,
      healInner: 2,
      healOuter: 7,
      stamina: 15,
      unlockRef: 'rc_fixture',
      artRef: 'alchemy',
      artReq: 4,
      travel: 1000,
      ruleRef: 'rule_fixture',
    };
    const parsed = ItemDefSchema.parse(generic(attributes));
    expect(parsed.extension.value).toMatchObject({ attributes });
  });

  it('accepts attributes on an equipment extension without changing its type', () => {
    const extension = {
      type: 'equipment',
      value: {
        slot: 'mainHand',
        cat: 'sword',
        hands: 1,
        tags: [],
        matFamily: 'metal',
        divine: false,
        catalogTian: false,
        uniqueEquipped: false,
        attributes: {
          version: 2,
          atk: 105,
          hardness: 48,
          qiAffinity: 100,
          qiEffect: 'bf_fixture',
          def: 3,
          reflect: 0,
          antiHidden: 0,
          agi: 0,
          block: 0,
          luck: 0,
          poison: 0,
          antiPoison: 0,
        },
      },
    };
    const parsed = ItemDefSchema.parse(item('weapon', extension, 'eq_attribute_fixture'));
    expect(parsed.extension.type).toBe('equipment');
  });

  it('accepts attributes on a manual extension', () => {
    const extension = {
      type: 'manual',
      value: {
        skill: 'sk_fixture',
        maxLayer: 10,
        variant: 'full',
        readMul: 1,
        attributes: {
          version: 2,
          skillRef: 'sk_fixture',
          readWis: 30,
          readBre: 25,
          maxLayer: 10,
          cultivation: 1000,
        },
      },
    };
    expect(ItemDefSchema.safeParse(item('manual', extension)).success).toBe(true);
  });

  it.each([
    ['version 1', { version: 1 }],
    ['an unknown key', { version: 2, attack: 100 }],
    ['a fractional value', { version: 2, stamina: 1.5 }],
    ['a negative value', { version: 2, stamina: -1 }],
  ])('rejects %s', (_name, attributes) => {
    expect(ItemDefSchema.safeParse(generic(attributes)).success).toBe(false);
  });

  it('keeps legacy items without attributes valid', () => {
    const legacy = generic();
    expect(ItemDefSchema.parse(legacy)).toEqual(legacy);
  });
});

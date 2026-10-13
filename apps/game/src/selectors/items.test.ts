import { describe, expect, it } from 'vitest';
import { applyItemText, projectItem } from './items';
import type { GameItemDef } from '../runtime/content';
import { ITEM_TEXT_PLACEHOLDER } from '../runtime/item-content';

describe('items selector enhanced projection', () => {
  it('projects equipment with clean description, canonical historical source and full attributes', () => {
    const robe: GameItemDef = {
      schemaVersion: 'item.v1',
      id: 'eq_beisongbenbailingwenlanshan_nan',
      name: '北宋本白绫纹襕衫·男',
      kind: 'armor',
      sub: 'clothing',
      grade: 6,
      stack: 1,
      chapters: ['ch01_tianlong'],
      origin: 'canonExpanded',
      canonRef: '北宋；出现书界 ch01；（原创扩展）；形制／色系依据：《宋史》卷153《舆服五·公服／襆头／带》 https://zh.wikisource.org/zh-hans/宋史/卷153；元丰以后公服取色不等于庶民流行排序',
      price: 'auto',
      flags: ['runtimeProjection'],
      assets: { icon: 'item/beisongbenbailingwenlanshan_nan' },
      text: {
        desc: '外观：北宋男款，圆领右侧暗系。 待运行时投影：defInK=0.12; defOutK=0.16; eva=2xG; wearer=male。',
        lore: '（原创扩展）据北宋舆服语汇演成本白男式襕衫，圆领右侧暗系，宽袖与长摆横襕便于整束。克制绫织暗纹缘落衣缘，行旅先收袖；绯色不授官阶，横襕与裁片默认原创，同档换色同值。',
      },
      extension: {
        type: 'equipment',
        value: {
          slot: 'body',
          tags: [],
          armorWeight: 'light',
          matFamily: 'fabric',
          divine: false,
          catalogTian: false,
          uniqueEquipped: false,
          attributes: {
            version: 2,
            def: 48,
          },
        },
      },
    };

    const projected = projectItem(robe, 1);
    expect(projected.name).toBe('北宋本白绫纹襕衫·男');
    expect(projected.category).toBe('clothing');
    expect(projected.grade).toBe(6);

    // 1. 验证清理掉了脏字符串
    expect(projected.description).not.toContain('待运行时投影');
    expect(projected.description).not.toContain('（原创扩展）');
    expect(projected.description).not.toContain('同档换色同值');
    expect(projected.description).toContain('圆领右侧暗系');

    // 2. 验证出处格式化
    expect(projected.source).toContain('历史文献 · 《宋史》');

    // 3. 验证属性效果完整生成
    expect(projected.effects).toContain('【护甲防御】+48');
    expect(projected.effects).toContain('【外防减免】16%');
    expect(projected.effects).toContain('【内劲减免】12%');
    expect(projected.effects).toContain('【穿戴限制】限男性侠士穿戴');
    expect(projected.effects).toContain('【轻装规格】灵巧轻盈，不碍身法');
  });

  it('projects weapon with Jin Yong novel canon source and combat attributes', () => {
    const sword: GameItemDef = {
      schemaVersion: 'item.v1',
      id: 'eq_junzijian',
      name: '君子剑',
      kind: 'weapon',
      sub: 'sword',
      grade: 9,
      stack: 1,
      chapters: ['ch03_shendiao'],
      origin: 'canon',
      canonRef: '《神雕侠侣》·绝情谷',
      price: null,
      flags: ['unique'],
      assets: { icon: 'item/junzijian' },
      text: {
        desc: '外观：乌黑修长直剑，方正小护手。',
        lore: '《神雕侠侣》中君子剑藏于绝情谷，与淑女剑成对，杨过、小龙女曾取剑合使；后来郭芙以此斩断杨过右臂。乌黑装具与配对增益均为 （原创扩展）。',
      },
      extension: {
        type: 'equipment',
        value: {
          slot: 'mainHand',
          cat: 'sword',
          tags: [],
          matFamily: 'metal',
          divine: false,
          catalogTian: false,
          uniqueEquipped: true,
          attributes: {
            version: 2,
            atk: 100,
            hardness: 80,
            qiAffinity: 100,
          },
        },
      },
    };

    const projected = projectItem(sword, 1);
    expect(projected.source).toBe('金庸原著 · 《神雕侠侣》（绝情谷）');
    expect(projected.effects).toContain('【兵刃攻击】+100');
    expect(projected.effects).toContain('【坚韧硬度】80');
    expect(projected.description).toContain('绝情谷');
    expect(projected.description).not.toContain('（原创扩展）');
  });

  it('projects martial art manual with comprehension gates and cultivation points', () => {
    const manual: GameItemDef = {
      schemaVersion: 'item.v1',
      id: 'it_miji_xianglong18_can',
      name: '降龙十八掌残本',
      kind: 'manual',
      sub: 'partial',
      grade: 10,
      stack: 1,
      chapters: ['ch04_yitian'],
      origin: 'canonExpanded',
      canonRef: '《倚天屠龙记》·丐帮降龙掌残传；实体 （原创扩展）',
      price: null,
      flags: [],
      assets: { icon: 'item/miji_xianglong18_can' },
      text: {
        desc: '外观：元代旧黄包背残册，竹夹板护持。',
        lore: '《倚天屠龙记》所示丐帮降龙掌传承已残；将残传整理成册属 （原创扩展）。谱页只容有限层次，研读须以刚健掌理串联缺招。',
      },
      extension: {
        type: 'manual',
        value: {
          skill: 'sk_xianglong18',
          maxLayer: 6,
          variant: 'partial',
          readMul: 1,
          attributes: {
            version: 2,
            readWis: 60,
            cultivation: 2400,
          },
        },
      },
    };

    const projected = projectItem(manual, 1);
    expect(projected.source).toBe('金庸原著 · 《倚天屠龙记》（丐帮降龙掌残传）');
    expect(projected.effects).toContain('【研读门槛】悟性需求 ≥ 60');
    expect(projected.effects).toContain('【参悟消耗】消耗修为 2400 点');
    expect(projected.effects).toContain('【武学极诣】最高可修炼至第 6 重');
  });

  it('preserves ITEM_TEXT_PLACEHOLDER when text is absent and updates cleanly upon applyItemText', () => {
    const pill: GameItemDef = {
      schemaVersion: 'item.v1',
      id: 'it_jinchuangyao',
      name: '金创药',
      kind: 'pill',
      sub: 'medicine',
      grade: 2,
      stack: 99,
      chapters: 'any',
      origin: 'expanded',
      price: 'auto',
      flags: [],
      assets: { icon: 'item/jinchuangyao' },
      use: {
        context: 'both',
        action: 'consume',
        target: 'self',
        effects: [{ op: 'healPct', params: { valueBp: 3000 } }],
      },
      extension: {
        type: 'generic',
        value: {},
      },
    };

    const projected = projectItem(pill, 5);
    expect(projected.description).toBe(ITEM_TEXT_PLACEHOLDER);
    expect(projected.effects).toContain('【气血恢复】恢复上限的 30%');

    const cacheMock = {
      get: (id: string) => {
        if (id === 'it_jinchuangyao') {
          return {
            desc: '细致白粉封于瓷瓶，气味清香。',
            lore: '江湖行走常备之金创灵药，敷于伤口立见止血生肌奇效。',
          };
        }
        return undefined;
      },
    };

    const updated = applyItemText(projected, cacheMock);
    expect(updated.description).not.toBe(ITEM_TEXT_PLACEHOLDER);
    expect(updated.description).toContain('止血生肌奇效');
    expect(updated.source).toBe('杏林名方 · 济世活人妙药');
  });

  it('resolves explicit icon from assets or falls back to individual item-by-id endpoint', () => {
    const whip: GameItemDef = {
      schemaVersion: 'item.v1',
      id: 'eq_bailianruanbian',
      name: '百炼软鞭',
      kind: 'weapon',
      sub: 'whip',
      grade: 5,
      stack: 1,
      chapters: 'any',
      origin: 'expanded',
      price: null,
      flags: [],
      assets: { icon: 'item/bailianruanbian' },
      extension: { type: 'equipment', value: { slot: 'mainHand', cat: 'whip', tags: [], matFamily: 'metal', divine: false, catalogTian: false, uniqueEquipped: false } },
    };

    // 1. Without manifest assets entry -> falls back to item-by-id endpoint for bailianruanbian
    const withoutAssets = projectItem(whip, 1);
    expect(withoutAssets.icon).toBe('/assets/default/item-by-id/eq_bailianruanbian.png');

    // 2. With assets entry containing preferred icon
    const withAssets = projectItem(whip, 1, {
      eq_bailianruanbian: { icon: 'assets/default/item/weapons/icons/eq_bailianruanbian_64.png' },
    });
    expect(withAssets.icon).toBe('/assets/default/item/weapons/icons/eq_bailianruanbian_64.png');
  });
});

